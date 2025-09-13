import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { InterviewPerformanceData } from "./performanceAnalytics";

export interface CloudAnalyticsData
  extends Omit<InterviewPerformanceData, "timestamp"> {
  timestamp: Timestamp;
  userId: string;
  syncedAt: Timestamp;
  version: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  synced?: number;
  errors?: string[];
}

class CloudAnalyticsStorage {
  private readonly COLLECTION_NAME = "interview_analytics";
  private readonly LOCAL_SYNC_KEY = "analytics_last_sync";
  private readonly LOCAL_PENDING_KEY = "analytics_pending_sync";

  /**
   * Save interview performance data to cloud
   */
  async savePerformanceData(
    data: InterviewPerformanceData,
    userId: string
  ): Promise<boolean> {
    try {
      const cloudData: CloudAnalyticsData = {
        ...data,
        timestamp: Timestamp.fromDate(new Date(data.timestamp)),
        userId,
        syncedAt: Timestamp.now(),
        version: 1,
      };

      await setDoc(doc(db, this.COLLECTION_NAME, data.id), cloudData);

      console.log("✅ Interview data saved to cloud:", data.id);

      // Update local sync timestamp
      localStorage.setItem(this.LOCAL_SYNC_KEY, new Date().toISOString());

      return true;
    } catch (error) {
      console.error("❌ Failed to save to cloud:", error);

      // Store in pending sync queue for retry
      this.addToPendingSync(data, userId);

      return false;
    }
  }

  /**
   * Migrate old data format to new format
   * Converts isSimulated flags to isFallbackData flags for proper classification
   */
  private migrateDataFormat(
    data: InterviewPerformanceData
  ): InterviewPerformanceData {
    const migratedData = { ...data };
    let migrationApplied = false;

    // Migrate speech analysis
    if (
      migratedData.speechAnalysis &&
      (migratedData.speechAnalysis as any).isSimulated === true
    ) {
      console.log(
        `🔄 Migrating speech analysis for interview ${data.id}: isSimulated → isFallbackData`
      );
      const { isSimulated, ...restSpeechAnalysis } =
        migratedData.speechAnalysis as any;
      migratedData.speechAnalysis = {
        ...restSpeechAnalysis,
        isFallbackData: true,
        analysisAvailable: false,
      };
      migrationApplied = true;
    }

    // Migrate body language analysis
    if (
      migratedData.bodyLanguageAnalysis &&
      (migratedData.bodyLanguageAnalysis as any).isSimulated === true
    ) {
      console.log(
        `🔄 Migrating body language analysis for interview ${data.id}: isSimulated → isFallbackData`
      );
      const { isSimulated, ...restBodyLanguageAnalysis } =
        migratedData.bodyLanguageAnalysis as any;
      migratedData.bodyLanguageAnalysis = {
        ...restBodyLanguageAnalysis,
        isFallbackData: true,
        analysisAvailable: false,
      };
      migrationApplied = true;
    }

    if (migrationApplied) {
      console.log(
        `✅ Data migration completed for interview ${data.id} - now classified as real data with fallback analysis`
      );
    }

    return migratedData;
  }

  /**
   * Get all performance data for a user from cloud
   */
  async getPerformanceHistory(
    userId: string
  ): Promise<InterviewPerformanceData[]> {
    try {
      // Use a simpler query without orderBy to avoid index requirements
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      const cloudData = snapshot.docs.map((doc) => {
        const data = doc.data() as CloudAnalyticsData;
        const interviewData = {
          ...data,
          timestamp: data.timestamp.toDate().toISOString(),
        } as InterviewPerformanceData;

        // Migrate old data: Convert isSimulated flags to isFallbackData flags
        const migratedData = this.migrateDataFormat(interviewData);
        return migratedData;
      });

      // Sort by timestamp in JavaScript instead of Firestore
      cloudData.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log(`✅ Loaded ${cloudData.length} interviews from cloud`);
      return cloudData;
    } catch (error) {
      console.error("❌ Failed to load from cloud:", error);
      return [];
    }
  }

  /**
   * Get specific interview by ID
   */
  async getPerformanceById(
    interviewId: string,
    userId: string
  ): Promise<InterviewPerformanceData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, interviewId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CloudAnalyticsData;

        // Verify user ownership
        if (data.userId !== userId) {
          console.warn(
            "❌ Unauthorized access attempt for interview:",
            interviewId
          );
          return null;
        }

        return {
          ...data,
          timestamp: data.timestamp.toDate().toISOString(),
        } as InterviewPerformanceData;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to get interview by ID:", error);
      return null;
    }
  }

  /**
   * Get latest interview for a user
   */
  async getLatestPerformance(
    userId: string
  ): Promise<InterviewPerformanceData | null> {
    try {
      // Get all interviews and find the latest one
      const history = await this.getPerformanceHistory(userId);
      return history.length > 0 ? history[0] : null;
    } catch (error) {
      console.error("❌ Failed to get latest interview:", error);
      return null;
    }
  }

  /**
   * Delete interview data
   */
  async deletePerformanceData(
    interviewId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // First verify ownership
      const existing = await this.getPerformanceById(interviewId, userId);
      if (!existing) {
        console.warn("❌ Cannot delete: Interview not found or unauthorized");
        return false;
      }

      await deleteDoc(doc(db, this.COLLECTION_NAME, interviewId));
      console.log("✅ Interview deleted from cloud:", interviewId);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete from cloud:", error);
      return false;
    }
  }

  /**
   * Sync local data to cloud
   */
  async syncLocalToCloud(userId: string): Promise<SyncResult> {
    try {
      // Get local data
      const localData = this.getLocalAnalyticsData();
      const pendingData = this.getPendingSyncData();

      const allData = [...localData, ...pendingData];
      const batch = writeBatch(db);

      let synced = 0;
      const errors: string[] = [];

      for (const data of allData) {
        try {
          const cloudData: CloudAnalyticsData = {
            ...data,
            timestamp: Timestamp.fromDate(new Date(data.timestamp)),
            userId,
            syncedAt: Timestamp.now(),
            version: 1,
          };

          const docRef = doc(db, this.COLLECTION_NAME, data.id);
          batch.set(docRef, cloudData, { merge: true });
          synced++;
        } catch (error) {
          errors.push(`Failed to sync ${data.id}: ${error}`);
        }
      }

      if (synced > 0) {
        await batch.commit();

        // Clear pending sync data
        localStorage.removeItem(this.LOCAL_PENDING_KEY);
        localStorage.setItem(this.LOCAL_SYNC_KEY, new Date().toISOString());
      }

      return {
        success: true,
        message: `Synced ${synced} interviews to cloud`,
        synced,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("❌ Sync failed:", error);
      return {
        success: false,
        message: `Sync failed: ${error}`,
        synced: 0,
      };
    }
  }

  /**
   * Sync cloud data to local
   */
  async syncCloudToLocal(userId: string): Promise<SyncResult> {
    try {
      const cloudData = await this.getPerformanceHistory(userId);

      // Update local storage with cloud data
      localStorage.setItem(
        "interview_analytics_data",
        JSON.stringify(cloudData)
      );
      localStorage.setItem(this.LOCAL_SYNC_KEY, new Date().toISOString());

      return {
        success: true,
        message: `Synced ${cloudData.length} interviews from cloud`,
        synced: cloudData.length,
      };
    } catch (error) {
      console.error("❌ Cloud to local sync failed:", error);
      return {
        success: false,
        message: `Sync failed: ${error}`,
        synced: 0,
      };
    }
  }

  /**
   * Get analytics statistics for a user
   */
  async getAnalyticsStats(userId: string): Promise<{
    totalInterviews: number;
    averageScore: number;
    lastInterviewDate: string | null;
    improvementTrend: "improving" | "declining" | "stable";
  }> {
    try {
      const history = await this.getPerformanceHistory(userId);

      if (history.length === 0) {
        return {
          totalInterviews: 0,
          averageScore: 0,
          lastInterviewDate: null,
          improvementTrend: "stable",
        };
      }

      const totalScore = history.reduce(
        (sum, interview) => sum + interview.overallScore,
        0
      );
      const averageScore = totalScore / history.length;

      // Calculate trend (compare first half vs second half)
      let improvementTrend: "improving" | "declining" | "stable" = "stable";
      if (history.length >= 4) {
        const midPoint = Math.floor(history.length / 2);
        const recentAvg =
          history
            .slice(0, midPoint)
            .reduce((sum, i) => sum + i.overallScore, 0) / midPoint;
        const olderAvg =
          history.slice(midPoint).reduce((sum, i) => sum + i.overallScore, 0) /
          (history.length - midPoint);

        if (recentAvg > olderAvg + 5) improvementTrend = "improving";
        else if (recentAvg < olderAvg - 5) improvementTrend = "declining";
      }

      return {
        totalInterviews: history.length,
        averageScore: Math.round(averageScore),
        lastInterviewDate: history[0]?.timestamp || null,
        improvementTrend,
      };
    } catch (error) {
      console.error("❌ Failed to get analytics stats:", error);
      return {
        totalInterviews: 0,
        averageScore: 0,
        lastInterviewDate: null,
        improvementTrend: "stable",
      };
    }
  }

  /**
   * Clear all analytics data for a user
   */
  async clearAllData(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Also clear local data
      localStorage.removeItem("interview_analytics_data");
      localStorage.removeItem(this.LOCAL_SYNC_KEY);
      localStorage.removeItem(this.LOCAL_PENDING_KEY);

      console.log(`✅ Cleared all analytics data for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to clear analytics data:", error);
      return false;
    }
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(): string | null {
    return localStorage.getItem(this.LOCAL_SYNC_KEY);
  }

  /**
   * Check if sync is needed
   */
  needsSync(): boolean {
    const lastSync = this.getLastSyncTime();
    if (!lastSync) return true;

    const lastSyncTime = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync =
      (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync > 1; // Sync if more than 1 hour since last sync
  }

  // Private helper methods
  private getLocalAnalyticsData(): InterviewPerformanceData[] {
    const stored = localStorage.getItem("interview_analytics_data");
    return stored ? JSON.parse(stored) : [];
  }

  private addToPendingSync(
    data: InterviewPerformanceData,
    userId: string
  ): void {
    const pending = this.getPendingSyncData();
    pending.push(data);
    localStorage.setItem(this.LOCAL_PENDING_KEY, JSON.stringify(pending));
  }

  private getPendingSyncData(): InterviewPerformanceData[] {
    const stored = localStorage.getItem(this.LOCAL_PENDING_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

// Export singleton instance
export const cloudAnalyticsStorage = new CloudAnalyticsStorage();
