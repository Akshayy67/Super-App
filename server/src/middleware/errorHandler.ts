import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ValidationError extends Error {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  isOperational = true;

  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  isOperational = true;

  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  isOperational = true;

  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error("Error occurred:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  // Handle known operational errors
  if (error.isOperational) {
    return res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }

  // Handle Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      error: "Database operation failed",
      details: "Invalid request parameters",
    });
  }

  if (error.name === "PrismaClientValidationError") {
    return res.status(400).json({
      error: "Invalid data provided",
    });
  }

  // Handle file upload errors
  if (error.message?.includes("File too large")) {
    return res.status(413).json({
      error: "File too large",
      details: "Maximum file size is 5MB",
    });
  }

  if (error.message?.includes("Unexpected field")) {
    return res.status(400).json({
      error: "Invalid file field",
      details: "Please check the file upload field name",
    });
  }

  // Default to 500 server error
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};
