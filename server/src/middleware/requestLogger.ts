import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log request
  console.log(`📥 ${req.method} ${req.url} - ${req.ip}`);

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== "GET" && req.body) {
    const logBody = { ...req.body };

    // Remove sensitive fields
    if (logBody.password) logBody.password = "[REDACTED]";
    if (logBody.token) logBody.token = "[REDACTED]";

    console.log("📄 Request body:", JSON.stringify(logBody, null, 2));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - start;

    console.log(
      `📤 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );

    // Log response body for errors or in development
    if (res.statusCode >= 400 || process.env.NODE_ENV === "development") {
      const logBody =
        typeof body === "object" ? JSON.stringify(body, null, 2) : body;
      console.log("📄 Response body:", logBody);
    }

    return originalJson.call(this, body);
  };

  next();
};
