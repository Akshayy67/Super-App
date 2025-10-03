import express from "express";
import { z } from "zod";
import { db } from "../services/database.js";
import { authenticateAdmin, AuthenticatedRequest } from "../middleware/auth.js";
import { NotFoundError, ValidationError } from "../middleware/errorHandler.js";

const router = express.Router();

// Validation schemas
const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val), 100) : 20)),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "email", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const updateUserSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  notes: z.string().optional(),
});

// GET /api/admin/stats - Get platform-wide statistics
router.get(
  "/stats",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      // Get user statistics
      const totalUsers = await db.user.count();
      const recentUsers = await db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      // Get resume statistics
      const totalResumes = await db.resume.count();
      const totalJobDescs = await db.jobDesc.count();
      const totalScoreRuns = await db.scoreRun.count();

      // Get recent activity
      const recentScoreRuns = await db.scoreRun.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      // Calculate average scores
      const avgScoreResult = await db.scoreRun.aggregate({
        _avg: {
          overall: true,
        },
      });

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            recent: recentUsers,
          },
          content: {
            resumes: totalResumes,
            jobDescriptions: totalJobDescs,
            scoreRuns: totalScoreRuns,
          },
          activity: {
            recentScoreRuns,
            averageScore: Math.round(avgScoreResult._avg.overall || 0),
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      throw error;
    }
  }
);

// GET /api/admin/users - Get all users with pagination and search
router.get(
  "/users",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { page, limit, search, sortBy, sortOrder } =
        getUsersQuerySchema.parse(req.query);

      const skip = (page - 1) * limit;

      // Build where clause for search
      const where = search
        ? {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {};

      // Get users with pagination
      const users = await db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              resumes: true,
              jobDescs: true,
              scoreRuns: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalCount = await db.user.count({ where });

      res.json({
        success: true,
        data: {
          users: users.map((user) => ({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            stats: {
              resumesUploaded: user._count.resumes,
              jobDescriptionsAnalyzed: user._count.jobDescs,
              scoreRunsCompleted: user._count.scoreRuns,
            },
          })),
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error("Admin users error:", error);
      throw error;
    }
  }
);

// GET /api/admin/users/:id - Get detailed user information
router.get(
  "/users/:id",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const user = await db.user.findUnique({
        where: { id },
        include: {
          resumes: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          jobDescs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          scoreRuns: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              resume: {
                select: { title: true },
              },
              jobDesc: {
                select: { title: true },
              },
            },
          },
          _count: {
            select: {
              resumes: true,
              jobDescs: true,
              scoreRuns: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            stats: {
              resumesUploaded: user._count.resumes,
              jobDescriptionsAnalyzed: user._count.jobDescs,
              scoreRunsCompleted: user._count.scoreRuns,
            },
            recentResumes: user.resumes,
            recentJobDescs: user.jobDescs,
            recentScoreRuns: user.scoreRuns.map((run) => ({
              id: run.id,
              overall: run.overall,
              createdAt: run.createdAt,
              resumeTitle: run.resume.title,
              jobDescTitle: run.jobDesc.title,
            })),
          },
        },
      });
    } catch (error) {
      console.error("Admin user detail error:", error);
      throw error;
    }
  }
);

// PUT /api/admin/users/:id - Update user (suspend/activate)
router.put(
  "/users/:id",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = updateUserSchema.parse(req.body);

      // For now, we'll just log the action since the current schema doesn't have status/notes fields
      // In a production system, you'd extend the User model to include these fields

      const user = await db.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Log the admin action
      console.log(
        `🔧 Admin action: ${req.user?.email} updated user ${user.email} - Status: ${status}, Notes: ${notes}`
      );

      // Update user (for now just update the updatedAt timestamp)
      const updatedUser = await db.user.update({
        where: { id },
        data: {
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: {
          user: updatedUser,
          action: {
            status,
            notes,
            performedBy: req.user?.email,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Admin user update error:", error);
      throw error;
    }
  }
);

// GET /api/admin/score-runs - Get all score runs with analytics
router.get(
  "/score-runs",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const scoreRuns = await db.scoreRun.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true },
          },
          resume: {
            select: { title: true, originalName: true },
          },
          jobDesc: {
            select: { title: true, source: true },
          },
        },
      });

      const totalCount = await db.scoreRun.count();

      res.json({
        success: true,
        data: {
          scoreRuns: scoreRuns.map((run) => ({
            id: run.id,
            overall: run.overall,
            createdAt: run.createdAt,
            modelVersion: run.modelVersion,
            userEmail: run.user?.email || "Anonymous",
            resumeTitle: run.resume.title,
            resumeOriginalName: run.resume.originalName,
            jobDescTitle: run.jobDesc.title,
            jobDescSource: run.jobDesc.source,
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Admin score runs error:", error);
      throw error;
    }
  }
);

// GET /api/admin/analytics - Get platform analytics
router.get(
  "/analytics",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { timeRange = "30" } = req.query;
      const days = parseInt(timeRange as string);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get user registration trends
      const userTrends = await db.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      });

      // Get score run trends
      const scoreRunTrends = await db.scoreRun.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        _avg: {
          overall: true,
        },
      });

      // Get top performing users
      const topUsers = await db.user.findMany({
        take: 10,
        include: {
          _count: {
            select: {
              scoreRuns: true,
            },
          },
          scoreRuns: {
            select: {
              overall: true,
            },
          },
        },
        orderBy: {
          scoreRuns: {
            _count: "desc",
          },
        },
      });

      res.json({
        success: true,
        data: {
          timeRange: days,
          userTrends: userTrends.map((trend) => ({
            date: trend.createdAt,
            count: trend._count.id,
          })),
          scoreRunTrends: scoreRunTrends.map((trend) => ({
            date: trend.createdAt,
            count: trend._count.id,
            averageScore: Math.round(trend._avg.overall || 0),
          })),
          topUsers: topUsers.map((user) => ({
            id: user.id,
            email: user.email,
            scoreRunCount: user._count.scoreRuns,
            averageScore:
              user.scoreRuns.length > 0
                ? Math.round(
                    user.scoreRuns.reduce((sum, run) => sum + run.overall, 0) /
                      user.scoreRuns.length
                  )
                : 0,
          })),
        },
      });
    } catch (error) {
      console.error("Admin analytics error:", error);
      throw error;
    }
  }
);

// GET /api/admin/system-health - Get system health metrics
router.get(
  "/system-health",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      // Database health check
      const dbHealth = await db.user.count();

      // Get recent error patterns (this would be enhanced with proper logging)
      const recentActivity = await db.scoreRun.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      // Memory usage (basic Node.js metrics)
      const memoryUsage = process.memoryUsage();

      res.json({
        success: true,
        data: {
          database: {
            status: "healthy",
            totalUsers: dbHealth,
            recentActivity,
          },
          server: {
            uptime: process.uptime(),
            memory: {
              used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
              total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            },
            nodeVersion: process.version,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Admin system health error:", error);
      throw error;
    }
  }
);

// POST /api/admin/broadcast - Send system-wide notification (placeholder)
router.post(
  "/broadcast",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { message, type = "info", targetUsers } = req.body;

      // Log the broadcast action
      console.log(`📢 Admin broadcast by ${req.user?.email}:`, {
        message,
        type,
        targetUsers: targetUsers || "all",
        timestamp: new Date().toISOString(),
      });

      // In a real implementation, this would:
      // 1. Store the notification in a notifications table
      // 2. Send real-time notifications via WebSocket
      // 3. Send email notifications if configured

      res.json({
        success: true,
        data: {
          message: "Broadcast sent successfully",
          sentBy: req.user?.email,
          timestamp: new Date().toISOString(),
          recipients: targetUsers || "all_users",
        },
      });
    } catch (error) {
      console.error("Admin broadcast error:", error);
      throw error;
    }
  }
);

// DELETE /api/admin/users/:id - Delete user and all associated data
router.delete(
  "/users/:id",
  authenticateAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const user = await db.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              resumes: true,
              jobDescs: true,
              scoreRuns: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Delete user and all associated data (cascading delete)
      await db.user.delete({
        where: { id },
      });

      // Log the deletion
      console.log(`🗑️ Admin deletion by ${req.user?.email}:`, {
        deletedUser: user.email,
        deletedData: {
          resumes: user._count.resumes,
          jobDescs: user._count.jobDescs,
          scoreRuns: user._count.scoreRuns,
        },
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        data: {
          message: "User and all associated data deleted successfully",
          deletedUser: user.email,
          deletedData: user._count,
          deletedBy: req.user?.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Admin user deletion error:", error);
      throw error;
    }
  }
);

export default router;
