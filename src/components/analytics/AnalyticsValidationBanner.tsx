import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import { AnalyticsValidator } from "../../utils/analyticsValidation";

interface ValidationResult {
  hasRealData: boolean;
  dataCount: number;
  quality: "excellent" | "good" | "poor" | "none";
}

interface AnalyticsValidationBannerProps {
  className?: string;
  showDetails?: boolean;
}

export const AnalyticsValidationBanner: React.FC<
  AnalyticsValidationBannerProps
> = ({ className = "", showDetails = false }) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);
  const [fullReport, setFullReport] = useState<string>("");

  const loadValidation = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 AnalyticsValidationBanner: Starting validation...");
      const result = await AnalyticsValidator.quickValidation();
      console.log("🔍 AnalyticsValidationBanner: Validation result:", result);
      setValidation(result);
    } catch (error) {
      console.error("❌ Failed to validate analytics:", error);
      setValidation({
        hasRealData: false,
        dataCount: 0,
        quality: "none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFullReport = async () => {
    try {
      const report = await AnalyticsValidator.generateValidationReport();
      setFullReport(report);
      setShowFullReport(true);
    } catch (error) {
      console.error("Failed to generate validation report:", error);
    }
  };

  useEffect(() => {
    loadValidation();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Validating analytics data...</span>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  const getQualityConfig = () => {
    switch (validation.quality) {
      case "excellent":
        return {
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor:
            "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
          title: "Excellent Data Quality",
          message: `All ${validation.dataCount} interviews represent real performance data with comprehensive analysis.`,
        };
      case "good":
        return {
          icon: CheckCircle,
          color: "text-blue-600 dark:text-blue-400",
          bgColor:
            "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          title: "Good Data Quality",
          message: `${validation.dataCount} interviews with mostly real data. Some analysis components may be simulated.`,
        };
      case "poor":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor:
            "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          title: "Mixed Data Quality",
          message: `${validation.dataCount} interviews with mixed real and simulated data. Enable all analysis features for better accuracy.`,
        };
      case "none":
      default:
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor:
            "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          title: "No Real Data",
          message:
            validation.dataCount === 0
              ? "No interview data available. Complete your first interview to see analytics."
              : "All data appears to be simulated. Complete a real interview for accurate analytics.",
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  return (
    <>
      <div className={`border rounded-lg p-4 ${config.bgColor} ${className}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
          <div className="flex-1">
            <h4 className={`font-medium ${config.color}`}>{config.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {config.message}
            </p>

            {showDetails && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={loadValidation}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Refresh
                </button>
                <button
                  onClick={loadFullReport}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Info className="w-3 h-3 inline mr-1" />
                  Full Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Report Modal */}
      {showFullReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">
                Analytics Validation Report
              </h3>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {fullReport}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowFullReport(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Compact version for use in headers or status bars
 */
export const AnalyticsValidationIndicator: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    const loadValidation = async () => {
      try {
        const result = await AnalyticsValidator.quickValidation();
        setValidation(result);
      } catch (error) {
        console.error("Failed to validate analytics:", error);
      }
    };

    loadValidation();
  }, []);

  if (!validation) {
    return null;
  }

  const getIndicatorConfig = () => {
    switch (validation.quality) {
      case "excellent":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          tooltip: "Excellent data quality",
        };
      case "good":
        return {
          icon: CheckCircle,
          color: "text-blue-500",
          tooltip: "Good data quality",
        };
      case "poor":
        return {
          icon: AlertTriangle,
          color: "text-yellow-500",
          tooltip: "Mixed data quality",
        };
      case "none":
      default:
        return {
          icon: XCircle,
          color: "text-red-500",
          tooltip: "No real data",
        };
    }
  };

  const config = getIndicatorConfig();
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      title={config.tooltip}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {validation.dataCount} interviews
      </span>
    </div>
  );
};
