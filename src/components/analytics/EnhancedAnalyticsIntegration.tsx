import React, { useState, useEffect } from "react";
import {
  Brain,
  BarChart3,
} from "lucide-react";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import { VisualAnalyticsDashboard } from "../dashboards/VisualAnalyticsDashboard";
import { LoadingGlobe } from "../ui/LoadingGlobe";

interface EnhancedAnalyticsIntegrationProps {
  currentInterview?: InterviewPerformanceData;
  onStartNewInterview?: () => void;
  onScheduleFollowUp?: (weakAreas: string[]) => void;
}

export const EnhancedAnalyticsIntegration: React.FC<
  EnhancedAnalyticsIntegrationProps
> = ({ currentInterview, onStartNewInterview, onScheduleFollowUp }) => {
  // Use centralized analytics data hook instead of local state
  const {
    performanceHistory,
    currentPerformance: latestPerformance,
    isLoading: dataLoading,
    addNewPerformance,
  } = useAnalyticsData();

  const [currentPerformance, setCurrentPerformance] = useState<
    InterviewPerformanceData | undefined
  >(currentInterview || latestPerformance);
  const [isLoading, setIsLoading] = useState(false);
  // Removed outer tabs - now using VisualAnalyticsDashboard's inner tabs
  // Removed AI analysis state as it's handled by VisualAnalyticsDashboard

  useEffect(() => {
    if (currentInterview) {
      setCurrentPerformance(currentInterview);
      // Save the new performance data using the hook
      addNewPerformance(currentInterview);
    }
  }, [currentInterview, addNewPerformance]);

  // Update current performance when latest performance changes
  useEffect(() => {
    if (!currentInterview && latestPerformance) {
      setCurrentPerformance(latestPerformance);
    }
  }, [latestPerformance, currentInterview]);

  // Remove duplicate data refresh - useAnalyticsData hook already handles this
  // This was causing redundant API calls and data loading loops

  // Removed loadPerformanceData - now using useAnalyticsData hook
  // This eliminates redundant data loading and prevents infinite loops
  // Removed AI analysis functions - handled by VisualAnalyticsDashboard

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <LoadingGlobe />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 mt-4">
              Loading Analytics Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Syncing your interview data from cloud storage...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (performanceHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Interview Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete an interview to see AI-powered analytics and insights.
            </p>
            {onStartNewInterview && (
              <button
                onClick={onStartNewInterview}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Your First Interview
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI-Powered Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced insights and recommendations powered by artificial
                intelligence
              </p>
            </div>
          </div>
        </div>


        {/* Display VisualAnalyticsDashboard with its own internal tabs */}
        <VisualAnalyticsDashboard
          currentPerformance={currentPerformance}
          onScheduleFollowUp={onScheduleFollowUp}
        />
      </div>
    </div>
  );
};
