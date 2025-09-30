import request from "supertest";
import app from "../../app.js";

describe("Health Endpoints", () => {
  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data).toHaveProperty("timestamp");
      expect(response.body.data).toHaveProperty("uptime");
      expect(response.body.data).toHaveProperty("services");
    });
  });

  describe("GET /api/health/live", () => {
    it("should return liveness status", async () => {
      const response = await request(app).get("/api/health/live").expect(200);

      expect(response.body).toHaveProperty("status", "alive");
    });
  });

  describe("GET /api/health/ready", () => {
    it("should return readiness status", async () => {
      const response = await request(app).get("/api/health/ready").expect(200);

      expect(response.body).toHaveProperty("status", "ready");
    });
  });
});
