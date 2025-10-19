import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Info,
  Database,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  analyticsDataValidator,
  DataValidationResult,
} from "../../utils/analyticsDataValidator";
import { CloudSyncStatus } from "../CloudSyncStatus";

interface AnalyticsDataStatusProps {
  onDataChange?: () => void;
  className?: string;
}

export const AnalyticsDataStatus: React.FC<AnalyticsDataStatusProps> = ({
  onDataChange,
  className = "",
}) => {
  const [validationResult, setValidationResult] =
    useState<DataValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    validateData();
  }, []);

  const validateData = async () => {
    setIsValidating(true);
    try {
      const result = analyticsDataValidator.validateAnalyticsData();
      setValidationResult(result);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRepairData = async () => {
    setIsRepairing(true);
    try {
      const result = analyticsDataValidator.repairAnalyticsData();
      if (result.repaired) {
        await validateData(); // Re-validate after repair
        if (onDataChange) onDataChange();
      }
    } catch (error) {
      console.error("Repair failed:", error);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = analyticsDataValidator.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string;
        const result = analyticsDataValidator.importData(data);
        if (result.success) {
          await validateData();
          if (onDataChange) onDataChange();
        }
        alert(result.message);
      } catch (error) {
        console.error("Import failed:", error);
        alert("Failed to import data");
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all analytics data? This action cannot be undone."
      )
    ) {
      const success = analyticsDataValidator.clearAllData();
      if (success) {
        validateData();
        if (onDataChange) onDataChange();
      }
    }
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />;
    }
    if (!validationResult) {
      return <Info className="w-5 h-5 text-gray-600" />;
    }
    if (validationResult.isValid) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (validationResult.errors.length > 0) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusColor = () => {
    if (!validationResult) return "border-gray-200 bg-gray-50";
    if (validationResult.isValid) return "border-green-200 bg-green-50";
    if (validationResult.errors.length > 0) return "border-red-200 bg-red-50";
    return "border-yellow-200 bg-yellow-50";
  };

  const getStatusText = () => {
    if (isValidating) return "Validating data...";
    if (!validationResult) return "Unknown status";
    if (validationResult.isValid) return "Data is valid";
    if (validationResult.errors.length > 0) return "Data has errors";
    return "Data has warnings";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cloud Sync Status */}
      <CloudSyncStatus />

      {/* Data Validation Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Analytics Data Status
              </h3>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="p-4">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {getStatusText()}
              </p>
              {validationResult && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {validationResult.dataCount} interview records found
                  {validationResult.lastInterviewDate && (
                    <span className="ml-2">
                      • Last interview:{" "}
                      {new Date(
                        validationResult.lastInterviewDate
                      ).toLocaleDateString()}
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={validateData}
              disabled={isValidating}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Refresh validation"
            >
              <RefreshCw
                className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Quick Stats */}
          {validationResult && validationResult.dataCount > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {validationResult.dataCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Interviews
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {validationResult.errors.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Errors
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {validationResult.warnings.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Warnings
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Information */}
        {showDetails && validationResult && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Errors ({validationResult.errors.length})
                </h4>
                <div className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <p
                      key={index}
                      className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                    >
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings ({validationResult.warnings.length})
                </h4>
                <div className="space-y-1">
                  {validationResult.warnings
                    .slice(0, 5)
                    .map((warning, index) => (
                      <p
                        key={index}
                        className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded"
                      >
                        {warning}
                      </p>
                    ))}
                  {validationResult.warnings.length > 5 && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ... and {validationResult.warnings.length - 5} more
                      warnings
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validationResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Suggestions
                </h4>
                <div className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <p
                      key={index}
                      className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded"
                    >
                      {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap gap-2">
            {validationResult && validationResult.errors.length > 0 && (
              <button
                onClick={handleRepairData}
                disabled={isRepairing}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRepairing ? "animate-spin" : ""}`}
                />
                {isRepairing ? "Repairing..." : "Repair Data"}
              </button>
            )}

            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <label className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
