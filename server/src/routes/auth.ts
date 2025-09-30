import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../services/database.js";
import {
  ValidationError,
  UnauthorizedError,
} from "../middleware/errorHandler.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// POST /api/auth/register - Register new user (simplified for MVP)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError("User already exists with this email");
    }

    // Create user (in production, hash the password)
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
      },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    console.log("✅ User registered:", { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
});

// POST /api/auth/login - Login user (simplified for MVP)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // In production, verify password hash here
    // For MVP, we'll accept any password for existing users

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    console.log("✅ User logged in:", { userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
});

// POST /api/auth/magic - Send magic link (placeholder for MVP)
router.post("/magic", async (req, res) => {
  try {
    const { email } = magicLinkSchema.parse(req.body);

    // For MVP, we'll just create/find user and return a token
    // In production, this would send an email with a magic link

    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    console.log("✅ Magic link generated for:", {
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      data: {
        message: "Magic link sent to your email",
        // For MVP, return the token directly
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Magic link error:", error);
    throw error;
  }
});

// GET /api/auth/me - Get current user info
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { id: req.user.id },
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
      throw new UnauthorizedError("User not found");
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
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post(
  "/refresh",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      // Verify user still exists
      const user = await db.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Generate new token
      const token = generateToken(user.id, user.email);

      res.json({
        success: true,
        data: { token },
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }
);

// POST /api/auth/logout - Logout user (client-side token removal)
router.post(
  "/logout",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      // In a production app with refresh tokens, you'd invalidate them here
      // For JWT-only implementation, logout is handled client-side

      console.log("✅ User logged out:", { userId: req.user?.id });

      res.json({
        success: true,
        data: {
          message: "Logged out successfully",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
);

// Helper function to generate JWT token
function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign(
    {
      id: userId,
      email,
    },
    secret,
    {
      expiresIn: "7d", // 7 days
      issuer: "ats-score-generator",
      audience: "ats-users",
    }
  );
}

export default router;
