import { useState, useEffect, useCallback } from "react";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";
import { unifiedAnalyticsStorage } from "../utils/unifiedAnalyticsStorage";
import { analyticsStorage } from "../utils/analyticsStorage";

interface AnalyticsDataState {
  performanceHistory: InterviewPerformanceData[];
  currentPerformance: InterviewPerformanceData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface AnalyticsDataHook extends AnalyticsDataState {
  refreshData: () => Promise<void>;
  addNewPerformance: (performance: InterviewPerformanceData) => Promise<void>;
  clearAllData: () => Promise<void>;
}

/**
 * Custom hook for managing analytics data with real-time updates
 * Provides centralized data management for all analytics components
 */
export const useAnalyticsData = (): AnalyticsDataHook => {
  const [state, setState] = useState<AnalyticsDataState>({
    performanceHistory: [],
    currentPerformance: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Get data from unified storage (handles cloud + local)
      const history = await unifiedAnalyticsStorage.getPerformanceHistory();
      const latest = history.length > 0 ? history[0] : null;

      setState((prev) => ({
        ...prev,
        performanceHistory: history,
        currentPerformance: latest,
        isLoading: false,
        lastUpdated: new Date(),
      }));

      console.log(`📊 Analytics data loaded: ${history.length} interviews`);
    } catch (error) {
      console.error("❌ Failed to load analytics data:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load data",
        isLoading: false,
      }));
    }
  }, []);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Add new performance data
  const addNewPerformance = useCallback(
    async (performance: InterviewPerformanceData) => {
      try {
        // Save to unified storage
        await unifiedAnalyticsStorage.savePerformanceData(performance);

        // Update local state immediately for responsive UI
        setState((prev) => ({
          ...prev,
          performanceHistory: [performance, ...prev.performanceHistory],
          currentPerformance: performance,
          lastUpdated: new Date(),
        }));

        console.log("✅ New performance data added:", performance.id);
      } catch (error) {
        console.error("❌ Failed to add performance data:", error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to save data",
        }));
      }
    },
    []
  );

  // Clear all data
  const clearAllData = useCallback(async () => {
    try {
      await unifiedAnalyticsStorage.clearAllData();
      setState((prev) => ({
        ...prev,
        performanceHistory: [],
        currentPerformance: null,
        lastUpdated: new Date(),
      }));
      console.log("🗑️ All analytics data cleared");
    } catch (error) {
      console.error("❌ Failed to clear data:", error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up periodic data refresh to catch external changes (reduced frequency)
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        // Only check if not currently loading to prevent conflicts
        if (!state.isLoading) {
          const currentHistory =
            await unifiedAnalyticsStorage.getPerformanceHistory();

          // Only refresh if data has changed significantly
          if (currentHistory.length !== state.performanceHistory.length) {
            console.log("📊 External data change detected, refreshing...");
            await loadData();
          }
        }
      } catch (error) {
        console.error("❌ Error checking for data changes:", error);
      }
    }, 30000); // Reduced frequency: Check every 30 seconds instead of 10

    return () => clearInterval(refreshInterval);
  }, [state.performanceHistory.length, state.isLoading, loadData]);

  // Listen for storage events (when data changes in other tabs)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "interview_performance_history") {
        console.log("📊 Storage change detected, refreshing data...");
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadData]);

  return {
    ...state,
    refreshData,
    addNewPerformance,
    clearAllData,
  };
};

/**
 * Hook for components that only need to read analytics data
 */
export const useAnalyticsDataReadOnly = () => {
  const {
    performanceHistory,
    currentPerformance,
    isLoading,
    error,
    lastUpdated,
  } = useAnalyticsData();

  return {
    performanceHistory,
    currentPerformance,
    isLoading,
    error,
    lastUpdated,
  };
};
