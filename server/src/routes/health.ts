import express from "express";
import { checkDatabaseHealth } from "../services/database.js";

const router = express.Router();

// GET /api/health - Health check endpoint
router.get("/", async (req, res) => {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();

    // Check environment variables
    const envCheck = {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV || "development",
    };

    // Calculate response time
    const responseTime = Date.now() - startTime;

    const health = {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: dbHealthy ? "up" : "down",
        fileParser: "up", // Always up if server is running
        nlpService: "up",
        scoringService: "up",
      },
      configuration: {
        maxFileSize: process.env.MAX_FILE_SIZE || "5242880",
        corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
        rateLimitWindow: process.env.RATE_LIMIT_WINDOW_MS || "900000",
        rateLimitMax: process.env.RATE_LIMIT_MAX_REQUESTS || "100",
      },
      environment: envCheck,
    };

    // Set appropriate status code
    const statusCode = dbHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: dbHealthy,
      data: health,
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(503).json({
      success: false,
      data: {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${Date.now() - startTime}ms`,
      },
    });
  }
});

// GET /api/health/detailed - Detailed health check with more diagnostics
router.get("/detailed", async (req, res) => {
  const startTime = Date.now();

  try {
    // Database health with timing
    const dbStart = Date.now();
    const dbHealthy = await checkDatabaseHealth();
    const dbResponseTime = Date.now() - dbStart;

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    };

    // System info
    const systemInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: `${Math.round(process.uptime())}s`,
      cpuUsage: process.cpuUsage(),
    };

    const detailedHealth = {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      services: {
        database: {
          status: dbHealthy ? "up" : "down",
          responseTime: `${dbResponseTime}ms`,
        },
        api: {
          status: "up",
          endpoints: ["/parse", "/score", "/auth", "/runs", "/health"],
        },
      },
      system: systemInfo,
      memory: memoryInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        port: process.env.PORT || "3001",
        hasRequiredEnvVars: {
          JWT_SECRET: !!process.env.JWT_SECRET,
          DATABASE_URL: !!process.env.DATABASE_URL,
          CORS_ORIGIN: !!process.env.CORS_ORIGIN,
        },
      },
    };

    const statusCode = dbHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: dbHealthy,
      data: detailedHealth,
    });
  } catch (error) {
    console.error("Detailed health check error:", error);

    res.status(503).json({
      success: false,
      data: {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${Date.now() - startTime}ms`,
      },
    });
  }
});

// GET /api/health/ready - Readiness probe for Kubernetes/Docker
router.get("/ready", async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseHealth();

    if (dbHealthy) {
      res.status(200).json({ status: "ready" });
    } else {
      res
        .status(503)
        .json({ status: "not ready", reason: "database unavailable" });
    }
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      reason: error instanceof Error ? error.message : "unknown error",
    });
  }
});

// GET /api/health/live - Liveness probe for Kubernetes/Docker
router.get("/live", (req, res) => {
  // Simple liveness check - if the server can respond, it's alive
  res.status(200).json({ status: "alive" });
});

export default router;
