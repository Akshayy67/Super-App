import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./errorHandler.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new UnauthorizedError("Access token required");
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid access token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token expired");
    }
    throw error;
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.user = decoded;
  } catch (error) {
    // Invalid token, but continue without authentication for optional auth
    console.warn("Invalid token in optional auth:", error);
  }

  next();
};

// Admin authentication middleware - restricts access to specific admin email
export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Admin access token required");
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    // Check if user is the authorized admin
    const adminEmail = "akshayjuluri6704@gmail.com";
    if (decoded.email !== adminEmail) {
      console.warn(`Unauthorized admin access attempt by: ${decoded.email}`);
      throw new UnauthorizedError(
        "Admin access denied - insufficient privileges"
      );
    }

    req.user = decoded;

    // Log admin action for audit trail
    console.log(
      `✅ Admin access granted: ${decoded.email} - ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid admin access token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Admin access token expired");
    }
    throw error;
  }
};
