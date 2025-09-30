import { db } from "./database.js";

export class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalHours: number;
  private readonly anonymousRetentionHours: number;

  constructor() {
    this.intervalHours = parseInt(process.env.CLEANUP_INTERVAL_HOURS || "6");
    this.anonymousRetentionHours = parseInt(
      process.env.AUTO_DELETE_ANONYMOUS_HOURS || "24"
    );
  }

  start(): void {
    if (this.intervalId) {
      console.warn("Cleanup service is already running");
      return;
    }

    console.log(
      `🧹 Starting cleanup service (interval: ${this.intervalHours}h, retention: ${this.anonymousRetentionHours}h)`
    );

    // Run cleanup immediately
    this.runCleanup().catch((error) => {
      console.error("Initial cleanup failed:", error);
    });

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup().catch((error) => {
        console.error("Scheduled cleanup failed:", error);
      });
    }, this.intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Cleanup service stopped");
    }
  }

  async runCleanup(): Promise<void> {
    const startTime = Date.now();
    console.log("🧹 Starting cleanup process...");

    try {
      const results = await Promise.allSettled([
        this.cleanupAnonymousData(),
        this.cleanupOrphanedRecords(),
        this.cleanupOldTempFiles(),
      ]);

      // Log results
      results.forEach((result, index) => {
        const taskNames = ["anonymous data", "orphaned records", "temp files"];
        if (result.status === "fulfilled") {
          console.log(`✅ Cleaned up ${taskNames[index]}: ${result.value}`);
        } else {
          console.error(
            `❌ Failed to clean up ${taskNames[index]}:`,
            result.reason
          );
        }
      });

      const duration = Date.now() - startTime;
      console.log(`🧹 Cleanup completed in ${duration}ms`);
    } catch (error) {
      console.error("❌ Cleanup process failed:", error);
    }
  }

  private async cleanupAnonymousData(): Promise<string> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - this.anonymousRetentionHours);

    try {
      // Delete anonymous score runs older than retention period
      const deletedScoreRuns = await db.scoreRun.deleteMany({
        where: {
          userId: null,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      // Delete anonymous resumes that are no longer referenced
      const deletedResumes = await db.resume.deleteMany({
        where: {
          userId: null,
          createdAt: {
            lt: cutoffDate,
          },
          scoreRuns: {
            none: {},
          },
        },
      });

      // Delete anonymous job descriptions that are no longer referenced
      const deletedJobDescs = await db.jobDesc.deleteMany({
        where: {
          userId: null,
          createdAt: {
            lt: cutoffDate,
          },
          scoreRuns: {
            none: {},
          },
        },
      });

      return `${deletedScoreRuns.count} score runs, ${deletedResumes.count} resumes, ${deletedJobDescs.count} job descriptions`;
    } catch (error) {
      console.error("Error cleaning up anonymous data:", error);
      throw error;
    }
  }

  private async cleanupOrphanedRecords(): Promise<string> {
    try {
      // Find and delete resumes that have no associated score runs and no user
      const orphanedResumes = await db.resume.deleteMany({
        where: {
          userId: null,
          scoreRuns: {
            none: {},
          },
        },
      });

      // Find and delete job descriptions that have no associated score runs and no user
      const orphanedJobDescs = await db.jobDesc.deleteMany({
        where: {
          userId: null,
          scoreRuns: {
            none: {},
          },
        },
      });

      // Find and delete score runs that reference non-existent resumes or job descriptions
      // This shouldn't happen with proper foreign key constraints, but it's a safety check
      const orphanedScoreRuns = await db.scoreRun.deleteMany({
        where: {
          OR: [
            {
              resume: null,
            },
            {
              jobDesc: null,
            },
          ],
        },
      });

      return `${orphanedResumes.count} orphaned resumes, ${orphanedJobDescs.count} orphaned job descriptions, ${orphanedScoreRuns.count} orphaned score runs`;
    } catch (error) {
      console.error("Error cleaning up orphaned records:", error);
      throw error;
    }
  }

  private async cleanupOldTempFiles(): Promise<string> {
    // This would clean up any temporary files in the uploads directory
    // For now, we'll just return a placeholder since we're using memory storage

    try {
      // In a real implementation, you would:
      // 1. Scan the uploads directory
      // 2. Check file modification times
      // 3. Delete files older than the retention period
      // 4. Remove empty directories

      // For memory storage (multer.memoryStorage()), there are no temp files to clean
      return "0 temp files (using memory storage)";
    } catch (error) {
      console.error("Error cleaning up temp files:", error);
      throw error;
    }
  }

  // Manual cleanup methods for specific scenarios
  async cleanupUserData(userId: string): Promise<void> {
    console.log(`🧹 Cleaning up data for user: ${userId}`);

    try {
      // Delete user's score runs
      await db.scoreRun.deleteMany({
        where: { userId },
      });

      // Delete user's resumes
      await db.resume.deleteMany({
        where: { userId },
      });

      // Delete user's job descriptions
      await db.jobDesc.deleteMany({
        where: { userId },
      });

      // Delete the user
      await db.user.delete({
        where: { id: userId },
      });

      console.log(`✅ Successfully cleaned up data for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to clean up data for user ${userId}:`, error);
      throw error;
    }
  }

  async getCleanupStats(): Promise<{
    anonymousRecords: number;
    orphanedRecords: number;
    oldRecords: number;
    totalRecords: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - this.anonymousRetentionHours);

    try {
      const [
        anonymousScoreRuns,
        anonymousResumes,
        anonymousJobDescs,
        orphanedResumes,
        orphanedJobDescs,
        oldAnonymousRuns,
        totalScoreRuns,
        totalResumes,
        totalJobDescs,
      ] = await Promise.all([
        db.scoreRun.count({ where: { userId: null } }),
        db.resume.count({ where: { userId: null } }),
        db.jobDesc.count({ where: { userId: null } }),
        db.resume.count({ where: { userId: null, scoreRuns: { none: {} } } }),
        db.jobDesc.count({ where: { userId: null, scoreRuns: { none: {} } } }),
        db.scoreRun.count({
          where: { userId: null, createdAt: { lt: cutoffDate } },
        }),
        db.scoreRun.count(),
        db.resume.count(),
        db.jobDesc.count(),
      ]);

      return {
        anonymousRecords:
          anonymousScoreRuns + anonymousResumes + anonymousJobDescs,
        orphanedRecords: orphanedResumes + orphanedJobDescs,
        oldRecords: oldAnonymousRuns,
        totalRecords: totalScoreRuns + totalResumes + totalJobDescs,
      };
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
