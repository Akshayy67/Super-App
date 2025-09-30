import express from "express";
import { z } from "zod";
import { db } from "../services/database.js";
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler.js";
import { generatePDFReport } from "../services/reportService.js";

const router = express.Router();

// Validation schemas
const getRunsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val), 50) : 10)),
  sortBy: z
    .enum(["createdAt", "overall", "title"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// GET /api/runs - Get user's score runs
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = getRunsSchema.parse(req.query);
    const userId = req.user!.id;

    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await db.scoreRun.count({
      where: { userId },
    });

    // Get score runs with related data
    const scoreRuns = await db.scoreRun.findMany({
      where: { userId },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            originalName: true,
            createdAt: true,
          },
        },
        jobDesc: {
          select: {
            id: true,
            title: true,
            source: true,
            createdAt: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Transform data for response
    const runs = scoreRuns.map((run) => ({
      id: run.id,
      overall: run.overall,
      sections: JSON.parse(run.sectionJson),
      createdAt: run.createdAt,
      modelVersion: run.modelVersion,
      resume: run.resume,
      jobDescription: run.jobDesc,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        runs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get runs error:", error);
    throw error;
  }
});

// GET /api/runs/:id - Get specific score run
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const scoreRun = await db.scoreRun.findUnique({
      where: { id },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            originalName: true,
            text: true,
            parsedJson: true,
            createdAt: true,
          },
        },
        jobDesc: {
          select: {
            id: true,
            title: true,
            source: true,
            text: true,
            parsedJson: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!scoreRun) {
      throw new NotFoundError("Score run not found");
    }

    // Check access permissions
    if (scoreRun.userId && req.user?.id !== scoreRun.userId) {
      throw new ForbiddenError("Access denied to this score run");
    }

    // Parse JSON fields
    const sections = JSON.parse(scoreRun.sectionJson);
    const gaps = JSON.parse(scoreRun.gapsJson);
    const suggestions = JSON.parse(scoreRun.suggestionsJson);

    res.json({
      success: true,
      data: {
        id: scoreRun.id,
        overall: scoreRun.overall,
        sections,
        gaps,
        suggestions,
        modelVersion: scoreRun.modelVersion,
        createdAt: scoreRun.createdAt,
        resume: scoreRun.resume,
        jobDescription: scoreRun.jobDesc,
        user: scoreRun.user,
      },
    });
  } catch (error) {
    console.error("Get score run error:", error);
    throw error;
  }
});

// GET /api/runs/:id/pdf - Download PDF report
router.get("/:id/pdf", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const scoreRun = await db.scoreRun.findUnique({
      where: { id },
      include: {
        resume: true,
        jobDesc: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!scoreRun) {
      throw new NotFoundError("Score run not found");
    }

    // Check access permissions
    if (scoreRun.userId && req.user?.id !== scoreRun.userId) {
      throw new ForbiddenError("Access denied to this score run");
    }

    // Parse JSON fields
    const sections = JSON.parse(scoreRun.sectionJson);
    const gaps = JSON.parse(scoreRun.gapsJson);
    const suggestions = JSON.parse(scoreRun.suggestionsJson);

    // Generate PDF
    const pdfBuffer = await generatePDFReport({
      id: scoreRun.id,
      overall: scoreRun.overall,
      sections,
      gaps,
      suggestions,
      modelVersion: scoreRun.modelVersion,
      createdAt: scoreRun.createdAt,
      resume: scoreRun.resume,
      jobDescription: scoreRun.jobDesc,
      user: scoreRun.user,
    });

    // Set headers for PDF download
    const fileName = `ats-score-report-${scoreRun.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
});

// DELETE /api/runs/:id - Delete score run
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const scoreRun = await db.scoreRun.findUnique({
        where: { id },
      });

      if (!scoreRun) {
        throw new NotFoundError("Score run not found");
      }

      if (scoreRun.userId !== userId) {
        throw new ForbiddenError("Access denied to this score run");
      }

      await db.scoreRun.delete({
        where: { id },
      });

      console.log("✅ Score run deleted:", { id, userId });

      res.json({
        success: true,
        data: {
          message: "Score run deleted successfully",
        },
      });
    } catch (error) {
      console.error("Delete score run error:", error);
      throw error;
    }
  }
);

// GET /api/runs/stats/summary - Get user's scoring statistics
router.get(
  "/stats/summary",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      // Get basic counts
      const [totalRuns, totalResumes, totalJobDescs] = await Promise.all([
        db.scoreRun.count({ where: { userId } }),
        db.resume.count({ where: { userId } }),
        db.jobDesc.count({ where: { userId } }),
      ]);

      // Get score statistics
      const scoreStats = await db.scoreRun.aggregate({
        where: { userId },
        _avg: { overall: true },
        _max: { overall: true },
        _min: { overall: true },
      });

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = await db.scoreRun.count({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Get score distribution
      const scoreDistribution = await db.scoreRun.groupBy({
        by: ["overall"],
        where: { userId },
        _count: true,
      });

      // Create score ranges
      const ranges = {
        excellent: 0, // 90-100
        good: 0, // 70-89
        fair: 0, // 50-69
        poor: 0, // 0-49
      };

      scoreDistribution.forEach((item) => {
        const score = item.overall;
        if (score >= 90) ranges.excellent += item._count;
        else if (score >= 70) ranges.good += item._count;
        else if (score >= 50) ranges.fair += item._count;
        else ranges.poor += item._count;
      });

      res.json({
        success: true,
        data: {
          totals: {
            scoreRuns: totalRuns,
            resumes: totalResumes,
            jobDescriptions: totalJobDescs,
          },
          scores: {
            average: scoreStats._avg.overall
              ? Math.round(scoreStats._avg.overall)
              : 0,
            highest: scoreStats._max.overall || 0,
            lowest: scoreStats._min.overall || 0,
          },
          activity: {
            recentRuns: recentActivity,
            periodDays: 30,
          },
          distribution: ranges,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      throw error;
    }
  }
);

export default router;
