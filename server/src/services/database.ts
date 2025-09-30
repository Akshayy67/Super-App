import { PrismaClient } from "@prisma/client";

// Create a singleton Prisma client
class DatabaseService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
      });

      // Handle graceful shutdown
      process.on("beforeExit", async () => {
        await DatabaseService.instance.$disconnect();
      });
    }

    return DatabaseService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
    }
  }
}

export const db = DatabaseService.getInstance();

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
};

// Initialize database (run migrations, seed data, etc.)
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await db.$connect();
    console.log("✅ Database connected successfully");

    // You can add migration checks or seed data here
    // await seedDefaultConfig();
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

// Seed default configuration
export const seedDefaultConfig = async (): Promise<void> => {
  try {
    // Default scoring weights
    await db.config.upsert({
      where: { key: "scoring_weights" },
      update: {},
      create: {
        key: "scoring_weights",
        jsonValue: JSON.stringify({
          skills: 0.4,
          experience: 0.35,
          education: 0.1,
          keywords: 0.15,
        }),
      },
    });

    // Hard requirements patterns
    await db.config.upsert({
      where: { key: "hard_requirements_patterns" },
      update: {},
      create: {
        key: "hard_requirements_patterns",
        jsonValue: JSON.stringify([
          "must have",
          "required",
          "mandatory",
          "essential",
          "minimum.*years",
          "at least.*years",
        ]),
      },
    });

    // Synonyms mapping for skills
    await db.config.upsert({
      where: { key: "skill_synonyms" },
      update: {},
      create: {
        key: "skill_synonyms",
        jsonValue: JSON.stringify({
          javascript: ["js", "ecmascript", "es6", "es2015"],
          typescript: ["ts"],
          python: ["py"],
          react: ["reactjs", "react.js"],
          node: ["nodejs", "node.js"],
          database: ["db", "databases"],
          sql: ["mysql", "postgresql", "postgres", "sqlite"],
          nosql: ["mongodb", "mongo", "dynamodb", "cassandra"],
          aws: ["amazon web services"],
          gcp: ["google cloud platform", "google cloud"],
          azure: ["microsoft azure"],
        }),
      },
    });

    console.log("✅ Default configuration seeded");
  } catch (error) {
    console.error("❌ Failed to seed default configuration:", error);
    throw error;
  }
};
