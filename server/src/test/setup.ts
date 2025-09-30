import { beforeAll, afterAll, beforeEach } from "@jest/globals";
import { db } from "../services/database.js";

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "file:./test.db";
  process.env.JWT_SECRET = "test-secret-key";

  // Initialize test database
  await db.$connect();
});

beforeEach(async () => {
  // Clean up database before each test
  await db.scoreRun.deleteMany();
  await db.resume.deleteMany();
  await db.jobDesc.deleteMany();
  await db.user.deleteMany();
  await db.config.deleteMany();
});

afterAll(async () => {
  // Cleanup
  await db.$disconnect();
});
