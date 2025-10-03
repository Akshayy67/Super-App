import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import parseRoutes from "./routes/parse.js";
import scoreRoutes from "./routes/score.js";
import authRoutes from "./routes/auth.js";
import runRoutes from "./routes/runs.js";
import healthRoutes from "./routes/health.js";
import zoomRoutes from "./routes/zoom.js";
import adminRoutes from "./routes/admin.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

// Import services
import { cleanupService } from "./services/cleanupService.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(requestLogger);

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/parse", parseRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/runs", runRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/zoom", zoomRoutes);
app.use("/api/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "ATS Score Generator API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      parse: "/api/parse",
      score: "/api/score",
      auth: "/api/auth",
      runs: "/api/runs",
      health: "/api/health",
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ATS Score Generator API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`
  );

  // Start cleanup service
  cleanupService.start();
  console.log("🧹 Cleanup service started");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  cleanupService.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  cleanupService.stop();
  process.exit(0);
});

export default app;
