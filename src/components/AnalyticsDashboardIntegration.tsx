import React, { useState, useEffect } from "react";
import { EnhancedPerformanceDashboard } from "./EnhancedPerformanceDashboard";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";
import { analyticsStorage, UserPreferences } from "../utils/analyticsStorage";
import { useScreenSize } from "../utils/responsiveUtils";

interface AnalyticsDashboardIntegrationProps {
  currentInterview?: InterviewPerformanceData;
  onStartNewInterview?: () => void;
  onScheduleFollowUp?: (weakAreas: string[]) => void;
}

export const AnalyticsDashboardIntegration: React.FC<
  AnalyticsDashboardIntegrationProps
> = ({ currentInterview, onStartNewInterview, onScheduleFollowUp }) => {
  const [currentPerformance, setCurrentPerformance] = useState<
    InterviewPerformanceData | undefined
  >(currentInterview);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    analyticsStorage.getUserPreferences()
  );
  const [isLoading, setIsLoading] = useState(true);
  const { breakpoint } = useScreenSize();

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (currentInterview) {
      setCurrentPerformance(currentInterview);
      // Save the new performance data
      analyticsStorage.savePerformanceData(currentInterview);
    }
  }, [currentInterview]);

  const initializeDashboard = async () => {
    try {
      // Load user preferences and apply them
      const preferences = analyticsStorage.getUserPreferences();
      setUserPreferences(preferences);

      // Apply dark mode preference
      if (preferences.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // If no current interview provided, try to load the most recent one
      if (!currentInterview) {
        const history = analyticsStorage.getPerformanceHistory();
        if (history.length > 0) {
          setCurrentPerformance(history[0]); // Most recent
        }
      }

      // Clean up old data based on retention settings
      analyticsStorage.cleanupOldData();
    } catch (error) {
      console.error("Error initializing dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = analyticsStorage.exportAllData();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `interview-analytics-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleImportData = (jsonData: string) => {
    try {
      const success = analyticsStorage.importData(jsonData);
      if (success) {
        // Refresh the dashboard with imported data
        initializeDashboard();
        alert("Data imported successfully!");
      } else {
        alert("Failed to import data. Please check the file format.");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Failed to import data. Please try again.");
    }
  };

  const handleScheduleFollowUp = (weakAreas: string[]) => {
    // Save the follow-up request to storage
    const milestone = {
      title: "Follow-up Interview Preparation",
      description: `Focus on improving: ${weakAreas.join(", ")}`,
      targetScore: 85,
      currentScore: currentPerformance?.overallScore || 0,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: "pending" as const,
      category: "follow-up",
    };

    analyticsStorage.addImprovementMilestone(milestone);

    // Call the external handler if provided
    onScheduleFollowUp?.(weakAreas);
  };

  // No sample data generation - only use real interview data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading your analytics dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Only use real data - no sample data
  const displayPerformance = currentPerformance;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile-friendly responsive wrapper */}
      <div
        className={`${
          breakpoint === "xs" || breakpoint === "sm" ? "px-2" : "px-4"
        }`}
      >
        <EnhancedPerformanceDashboard
          currentPerformance={displayPerformance}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onScheduleFollowUp={handleScheduleFollowUp}
        />
      </div>

      {/* Demo Data Notice (only show if using sample data) */}
      {!currentPerformance && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">No Interview Data</h4>
              <p className="text-xs opacity-90 mt-1">
                Complete an interview to see your analytics and performance
                data.
              </p>
              {onStartNewInterview && (
                <button
                  onClick={onStartNewInterview}
                  className="mt-2 px-3 py-1 bg-white text-blue-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Interview
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Storage Usage Warning (show if storage is getting full) */}
      <StorageUsageWarning />
    </div>
  );
};

// Component to show storage usage warnings
const StorageUsageWarning: React.FC = () => {
  const [storageUsage, setStorageUsage] = useState(
    analyticsStorage.getStorageUsage()
  );
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const usage = analyticsStorage.getStorageUsage();
    setStorageUsage(usage);
    setShowWarning(usage.percentage > 80);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Storage Warning</h4>
          <p className="text-xs opacity-90 mt-1">
            Your browser storage is {storageUsage.percentage.toFixed(1)}% full.
            Consider exporting and clearing old data.
          </p>
          <button
            onClick={() => setShowWarning(false)}
            className="mt-2 px-3 py-1 bg-white text-yellow-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardIntegration;
