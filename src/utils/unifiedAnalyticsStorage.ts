import { InterviewPerformanceData } from "./performanceAnalytics";
import { analyticsStorage } from "./analyticsStorage";
import { cloudAnalyticsStorage, SyncResult } from "./cloudAnalyticsStorage";
import { auth } from "../config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export interface StorageStatus {
  isOnline: boolean;
  isAuthenticated: boolean;
  lastSync: string | null;
  needsSync: boolean;
  pendingOperations: number;
}

class UnifiedAnalyticsStorage {
  private currentUser: User | null = null;
  private isOnline: boolean = navigator.onLine;
  private autoSyncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAuth();
    this.setupNetworkListeners();
    this.startAutoSync();
  }

  /**
   * Initialize authentication listener
   */
  private initializeAuth(): void {
    onAuthStateChanged(auth, (user) => {
      const wasAuthenticated = !!this.currentUser;
      this.currentUser = user;

      if (user && !wasAuthenticated) {
        console.log("✅ User authenticated, starting cloud sync");
        this.performInitialSync();
      } else if (!user && wasAuthenticated) {
        console.log("👋 User signed out, stopping cloud sync");
        this.stopAutoSync();
      }
    });
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      console.log("🌐 Back online, attempting sync");
      if (this.currentUser) {
        this.syncToCloud();
      }
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.log("📱 Offline mode, using local storage");
    });
  }

  /**
   * Start automatic sync every 5 minutes
   */
  private startAutoSync(): void {
    if (this.autoSyncInterval) return;

    this.autoSyncInterval = setInterval(() => {
      if (
        this.currentUser &&
        this.isOnline &&
        cloudAnalyticsStorage.needsSync()
      ) {
        console.log("🔄 Auto-sync triggered");
        this.syncToCloud();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop automatic sync
   */
  private stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * Perform initial sync when user logs in
   */
  private async performInitialSync(): Promise<void> {
    if (!this.currentUser || !this.isOnline) return;

    try {
      console.log("🔄 Performing initial sync...");

      // First, sync local data to cloud
      await this.syncToCloud();

      // Then, sync cloud data to local (in case user has data from other devices)
      await this.syncFromCloud();

      console.log("✅ Initial sync completed");
    } catch (error) {
      console.error("❌ Initial sync failed:", error);
    }
  }

  /**
   * Save interview performance data
   */
  async savePerformanceData(data: InterviewPerformanceData): Promise<boolean> {
    console.log("🔍 UnifiedStorage: Saving data", {
      hasUser: !!this.currentUser,
      isOnline: this.isOnline,
      userId: this.currentUser?.uid,
      dataId: data.id,
    });

    // Always save to local storage first
    analyticsStorage.savePerformanceData(data);
    console.log("✅ Saved to local storage");

    // If user is authenticated and online, also save to cloud
    if (this.currentUser && this.isOnline) {
      try {
        console.log("☁️ Attempting cloud save...");
        const cloudSuccess = await cloudAnalyticsStorage.savePerformanceData(
          data,
          this.currentUser.uid
        );

        if (cloudSuccess) {
          console.log("✅ Interview data saved to both local and cloud");
          return true;
        } else {
          console.log("⚠️ Saved locally, cloud save failed - will retry later");
          return true; // Still return true since local save succeeded
        }
      } catch (error) {
        console.error("❌ Cloud save failed:", error);
        return true; // Local save succeeded
      }
    } else {
      console.log("📱 Saved locally (offline or not authenticated)");
      return true;
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
   * Get performance history with cloud sync
   */
  async getPerformanceHistory(): Promise<InterviewPerformanceData[]> {
    console.log("🔍 Loading performance history...", {
      hasUser: !!this.currentUser,
      userId: this.currentUser?.uid,
      isOnline: this.isOnline,
    });

    // If authenticated and online, try to get fresh data from cloud
    if (this.currentUser && this.isOnline) {
      try {
        console.log("☁️ Attempting to load from cloud...");
        const cloudData = await cloudAnalyticsStorage.getPerformanceHistory(
          this.currentUser.uid
        );

        if (cloudData.length > 0) {
          // Migrate cloud data if needed (already done in cloudAnalyticsStorage, but double-check)
          const migratedCloudData = cloudData.map((data) =>
            this.migrateDataFormat(data)
          );

          // Update local storage with migrated cloud data
          analyticsStorage.clearAllData();
          migratedCloudData.forEach((data) =>
            analyticsStorage.savePerformanceData(data)
          );

          console.log(
            `✅ Loaded ${migratedCloudData.length} interviews from cloud`
          );
          return migratedCloudData;
        } else {
          console.log("☁️ No cloud data found");
        }
      } catch (error) {
        console.error("❌ Failed to load from cloud, using local data:", error);
      }
    } else {
      console.log("👤 No authenticated user or offline, using local data");
    }

    // Fallback to local data
    const localData = analyticsStorage.getPerformanceHistory();
    console.log(`📱 Loaded ${localData.length} interviews from local storage`);

    // Migrate local data if needed
    const migratedLocalData = localData.map((data) =>
      this.migrateDataFormat(data)
    );

    // Check if any migration was applied
    const migrationNeeded = migratedLocalData.some(
      (migrated, index) =>
        JSON.stringify(migrated) !== JSON.stringify(localData[index])
    );

    if (migrationNeeded) {
      console.log("🔄 Applying data migration to local storage...");
      // Save migrated data back to local storage
      analyticsStorage.clearAllData();
      migratedLocalData.forEach((data) =>
        analyticsStorage.savePerformanceData(data)
      );
      console.log("✅ Local data migration completed");
    }

    return migratedLocalData;
  }

  /**
   * Save entire performance history (for bulk operations like delete)
   */
  async savePerformanceHistory(
    data: InterviewPerformanceData[]
  ): Promise<boolean> {
    console.log(
      `🔍 UnifiedStorage: Saving entire history (${data.length} interviews)`
    );

    try {
      // Clear and save to local storage
      analyticsStorage.clearAllData();
      data.forEach((interview) =>
        analyticsStorage.savePerformanceData(interview)
      );
      console.log("✅ Saved entire history to local storage");

      // If user is authenticated and online, also save to cloud
      if (this.currentUser && this.isOnline) {
        try {
          console.log("☁️ Attempting cloud bulk save...");

          // Clear cloud data and save new data
          await cloudAnalyticsStorage.clearAllData(this.currentUser.uid);

          // Save each interview to cloud
          for (const interview of data) {
            await cloudAnalyticsStorage.savePerformanceData(
              interview,
              this.currentUser.uid
            );
          }

          console.log("✅ Saved entire history to cloud");
          return true;
        } catch (error) {
          console.error("❌ Cloud bulk save failed:", error);
          return true; // Local save succeeded
        }
      } else {
        console.log("📱 Saved locally (offline or not authenticated)");
        return true;
      }
    } catch (error) {
      console.error("❌ Failed to save performance history:", error);
      return false;
    }
  }

  /**
   * Get performance by ID
   */
  async getPerformanceById(
    id: string
  ): Promise<InterviewPerformanceData | null> {
    // Try cloud first if authenticated and online
    if (this.currentUser && this.isOnline) {
      try {
        const cloudData = await cloudAnalyticsStorage.getPerformanceById(
          id,
          this.currentUser.uid
        );
        if (cloudData) return cloudData;
      } catch (error) {
        console.error("❌ Failed to get from cloud:", error);
      }
    }

    // Fallback to local
    return analyticsStorage.getPerformanceById(id);
  }

  /**
   * Get latest performance
   */
  async getLatestPerformance(): Promise<InterviewPerformanceData | null> {
    // Try cloud first if authenticated and online
    if (this.currentUser && this.isOnline) {
      try {
        const cloudData = await cloudAnalyticsStorage.getLatestPerformance(
          this.currentUser.uid
        );
        if (cloudData) return cloudData;
      } catch (error) {
        console.error("❌ Failed to get latest from cloud:", error);
      }
    }

    // Fallback to local
    return analyticsStorage.getLatestPerformance();
  }

  /**
   * Delete performance data
   */
  async deletePerformanceData(id: string): Promise<boolean> {
    // Delete from local storage
    const localSuccess = analyticsStorage.deletePerformanceData(id);

    // If authenticated and online, also delete from cloud
    if (this.currentUser && this.isOnline) {
      try {
        await cloudAnalyticsStorage.deletePerformanceData(
          id,
          this.currentUser.uid
        );
        console.log("✅ Interview deleted from both local and cloud");
      } catch (error) {
        console.error("❌ Failed to delete from cloud:", error);
      }
    }

    return localSuccess;
  }

  /**
   * Sync local data to cloud
   */
  async syncToCloud(): Promise<SyncResult> {
    if (!this.currentUser || !this.isOnline) {
      return {
        success: false,
        message: "Not authenticated or offline",
        synced: 0,
      };
    }

    try {
      return await cloudAnalyticsStorage.syncLocalToCloud(this.currentUser.uid);
    } catch (error) {
      console.error("❌ Sync to cloud failed:", error);
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
  async syncFromCloud(): Promise<SyncResult> {
    if (!this.currentUser || !this.isOnline) {
      return {
        success: false,
        message: "Not authenticated or offline",
        synced: 0,
      };
    }

    try {
      return await cloudAnalyticsStorage.syncCloudToLocal(this.currentUser.uid);
    } catch (error) {
      console.error("❌ Sync from cloud failed:", error);
      return {
        success: false,
        message: `Sync failed: ${error}`,
        synced: 0,
      };
    }
  }

  /**
   * Get analytics statistics
   */
  async getAnalyticsStats(): Promise<{
    totalInterviews: number;
    averageScore: number;
    lastInterviewDate: string | null;
    improvementTrend: "improving" | "declining" | "stable";
  }> {
    if (this.currentUser && this.isOnline) {
      try {
        return await cloudAnalyticsStorage.getAnalyticsStats(
          this.currentUser.uid
        );
      } catch (error) {
        console.error("❌ Failed to get cloud stats:", error);
      }
    }

    // Fallback to local calculation
    const history = await this.getPerformanceHistory();

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

    // Calculate trend
    let improvementTrend: "improving" | "declining" | "stable" = "stable";
    if (history.length >= 4) {
      const midPoint = Math.floor(history.length / 2);
      const recentAvg =
        history.slice(0, midPoint).reduce((sum, i) => sum + i.overallScore, 0) /
        midPoint;
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
  }

  /**
   * Clear all analytics data
   */
  async clearAllData(): Promise<boolean> {
    // Clear local data
    const localSuccess = analyticsStorage.clearAllData();

    // If authenticated and online, also clear cloud data
    if (this.currentUser && this.isOnline) {
      try {
        await cloudAnalyticsStorage.clearAllData(this.currentUser.uid);
        console.log("✅ All analytics data cleared from both local and cloud");
      } catch (error) {
        console.error("❌ Failed to clear cloud data:", error);
      }
    }

    return localSuccess;
  }

  /**
   * Get storage status
   */
  getStorageStatus(): StorageStatus {
    return {
      isOnline: this.isOnline,
      isAuthenticated: !!this.currentUser,
      lastSync: cloudAnalyticsStorage.getLastSyncTime(),
      needsSync: cloudAnalyticsStorage.needsSync(),
      pendingOperations: 0, // Could be enhanced to track pending operations
    };
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<{ toCloud: SyncResult; fromCloud: SyncResult }> {
    const toCloud = await this.syncToCloud();
    const fromCloud = await this.syncFromCloud();

    return { toCloud, fromCloud };
  }

  /**
   * Export all data
   */
  async exportData(): Promise<string> {
    const history = await this.getPerformanceHistory();
    const stats = await this.getAnalyticsStats();
    const status = this.getStorageStatus();

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        userId: this.currentUser?.uid || "anonymous",
        storageStatus: status,
        statistics: stats,
        interviews: history,
      },
      null,
      2
    );
  }
}

// Export singleton instance
export const unifiedAnalyticsStorage = new UnifiedAnalyticsStorage();
