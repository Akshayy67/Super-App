import React, { useState } from "react";
import { Database, Trash2, Play, CheckCircle, AlertCircle } from "lucide-react";
import { createDemoInterviewData, clearAllInterviewData } from "../utils/demoData";
import { unifiedAnalyticsStorage } from "../utils/unifiedAnalyticsStorage";

interface DemoDataPopulatorProps {
  onDataPopulated?: () => void;
}

export const DemoDataPopulator: React.FC<DemoDataPopulatorProps> = ({
  onDataPopulated,
}) => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });
  const [dataCount, setDataCount] = useState<number>(0);

  // Check current data count
  React.useEffect(() => {
    const checkDataCount = async () => {
      try {
        const history = await unifiedAnalyticsStorage.getPerformanceHistory();
        setDataCount(history.length);
      } catch (error) {
        console.error("Error checking data count:", error);
      }
    };
    
    checkDataCount();
  }, []);

  const handlePopulateData = async () => {
    setIsPopulating(true);
    setStatus({ type: "info", message: "Creating demo interview data..." });

    try {
      const interviews = await createDemoInterviewData(10);
      setStatus({
        type: "success",
        message: `Successfully created ${interviews.length} demo interview records!`,
      });
      setDataCount(dataCount + interviews.length);
      
      if (onDataPopulated) {
        onDataPopulated();
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: `Failed to create demo data: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all interview data? This action cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    setStatus({ type: "info", message: "Clearing all interview data..." });

    try {
      await clearAllInterviewData();
      setStatus({
        type: "success",
        message: "All interview data cleared successfully!",
      });
      setDataCount(0);
      
      if (onDataPopulated) {
        onDataPopulated();
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: `Failed to clear data: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsClearing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "info":
        return <Database className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Demo Data Management
        </h3>
      </div>

      <div className="space-y-4">
        {/* Current Data Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Current Interview Records:
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {dataCount}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePopulateData}
            disabled={isPopulating || isClearing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            {isPopulating ? "Creating..." : "Create Demo Data"}
          </button>

          <button
            onClick={handleClearData}
            disabled={isPopulating || isClearing || dataCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? "Clearing..." : "Clear All Data"}
          </button>
        </div>

        {/* Status Message */}
        {status.type && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>• <strong>Create Demo Data:</strong> Generates 10 realistic interview records with varying scores and performance metrics</p>
          <p>• <strong>Clear All Data:</strong> Removes all interview data from local and cloud storage</p>
          <p>• Demo data includes speech analysis, body language metrics, and detailed performance scores</p>
        </div>
      </div>
    </div>
  );
};
