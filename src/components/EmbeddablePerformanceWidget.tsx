import React, { useState } from "react";
import {
  Award,
  Brain,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Share2,
  Copy,
  ExternalLink,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";

interface EmbeddablePerformanceWidgetProps {
  performanceData: InterviewPerformanceData;
  theme?: "light" | "dark" | "minimal";
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
  showTrends?: boolean;
  showBranding?: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface WidgetConfig {
  theme: "light" | "dark" | "minimal";
  size: "small" | "medium" | "large";
  showDetails: boolean;
  showTrends: boolean;
  showBranding: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const EmbeddablePerformanceWidget: React.FC<
  EmbeddablePerformanceWidgetProps
> = ({
  performanceData,
  theme = "light",
  size = "medium",
  showDetails = true,
  showTrends = true,
  showBranding = true,
  customColors,
}) => {
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 text-white border-gray-700";
      case "minimal":
        return "bg-white text-gray-900 border-gray-200 shadow-sm";
      default:
        return "bg-white text-gray-900 border-gray-200 shadow-lg";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "p-3 text-sm";
      case "large":
        return "p-8 text-base";
      default:
        return "p-6 text-sm";
    }
  };

  const getScoreColor = (score: number): string => {
    if (customColors) {
      return score >= 80
        ? customColors.primary
        : score >= 60
        ? customColors.secondary
        : customColors.accent;
    }

    if (score >= 80)
      return theme === "dark" ? "text-green-400" : "text-green-600";
    if (score >= 60)
      return theme === "dark" ? "text-yellow-400" : "text-yellow-600";
    return theme === "dark" ? "text-red-400" : "text-red-600";
  };

  const getProgressColor = (score: number): string => {
    if (customColors) {
      return score >= 80
        ? customColors.primary
        : score >= 60
        ? customColors.secondary
        : customColors.accent;
    }

    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const CircularProgress: React.FC<{
    value: number;
    size: number;
    strokeWidth: number;
  }> = ({ value, size, strokeWidth }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(value / 100) * circumference} ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={
              value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444"
            }
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold ${getScoreColor(value)} ${
              size < 60 ? "text-xs" : "text-sm"
            }`}
          >
            {value}
          </span>
        </div>
      </div>
    );
  };

  if (size === "small") {
    return (
      <div
        className={`rounded-lg border ${getThemeClasses()} ${getSizeClasses()} max-w-xs`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Interview Score</h3>
          <Award className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="flex items-center justify-center mb-2">
          <CircularProgress
            value={performanceData.overallScore}
            size={50}
            strokeWidth={4}
          />
        </div>
        <div className="text-center">
          <div
            className={`text-lg font-bold ${getScoreColor(
              performanceData.overallScore
            )}`}
          >
            {performanceData.overallScore}/100
          </div>
          <div className="text-xs opacity-75">{performanceData.role}</div>
        </div>
        {showBranding && (
          <div className="text-xs opacity-50 text-center mt-2">
            Powered by AI Interview System
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${getThemeClasses()} ${getSizeClasses()} max-w-md`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Interview Performance</h3>
          <p className="text-xs opacity-75">
            {performanceData.role} •{" "}
            {new Date(performanceData.timestamp).toLocaleDateString()}
          </p>
        </div>
        <Award className="w-6 h-6 text-yellow-500" />
      </div>

      {/* Overall Score */}
      <div className="flex items-center justify-center mb-6">
        <CircularProgress
          value={performanceData.overallScore}
          size={size === "large" ? 120 : 80}
          strokeWidth={size === "large" ? 8 : 6}
        />
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          {
            label: "Technical",
            value: performanceData.technicalScore,
            icon: Brain,
          },
          {
            label: "Communication",
            value: performanceData.communicationScore,
            icon: MessageSquare,
          },
          {
            label: "Behavioral",
            value: performanceData.behavioralScore,
            icon: Users,
          },
          {
            label: "Confidence",
            value: performanceData.detailedMetrics.confidence,
            icon: TrendingUp,
          },
        ].map((metric, index) => (
          <div key={index} className="text-center">
            <metric.icon className="w-4 h-4 mx-auto mb-1 opacity-75" />
            <div className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
              {metric.value}
            </div>
            <div className="text-xs opacity-75">{metric.label}</div>
            {showDetails && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full ${getProgressColor(
                    metric.value
                  )}`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Level */}
      <div className="text-center mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            performanceData.overallScore >= 80
              ? "bg-green-100 text-green-800"
              : performanceData.overallScore >= 60
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {performanceData.overallScore >= 80 ? (
            <TrendingUp className="w-3 h-3" />
          ) : performanceData.overallScore >= 60 ? (
            <Activity className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {performanceData.overallScore >= 80
            ? "Excellent"
            : performanceData.overallScore >= 60
            ? "Good"
            : "Needs Improvement"}
        </div>
      </div>

      {/* Key Insights */}
      {showDetails && (
        <div className="space-y-2 mb-4">
          <div className="text-xs font-medium opacity-75">Key Insights:</div>
          <div className="space-y-1">
            {performanceData.strengths.slice(0, 2).map((strength, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-1 h-1 bg-green-500 rounded-full" />
                <span className="opacity-75">{strength}</span>
              </div>
            ))}
            {performanceData.weaknesses.slice(0, 1).map((weakness, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                <span className="opacity-75">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {showBranding && (
        <div className="text-xs opacity-50 text-center pt-2 border-t">
          Powered by AI Interview System
        </div>
      )}
    </div>
  );
};

// Widget Configuration Component
export const WidgetConfigurator: React.FC<{
  performanceData: InterviewPerformanceData;
  onConfigChange: (config: WidgetConfig) => void;
}> = ({ performanceData, onConfigChange }) => {
  const [config, setConfig] = useState<WidgetConfig>({
    theme: "light",
    size: "medium",
    showDetails: true,
    showTrends: true,
    showBranding: true,
  });

  const [showPreview, setShowPreview] = useState(true);
  const [embedCode, setEmbedCode] = useState("");

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
    generateEmbedCode(newConfig);
  };

  const generateEmbedCode = (widgetConfig: WidgetConfig) => {
    // Generate real embed code with actual domain and performance data
    const currentDomain = window.location.origin;
    const widgetParams = new URLSearchParams({
      id: performanceData.id,
      theme: widgetConfig.theme,
      size: widgetConfig.size,
      details: widgetConfig.showDetails.toString(),
      trends: widgetConfig.showTrends.toString(),
      branding: widgetConfig.showBranding.toString(),
      score: performanceData.overallScore.toString(),
      role: performanceData.role,
      timestamp: performanceData.timestamp,
    });

    const code = `<iframe
  src="${currentDomain}/widget/performance?${widgetParams.toString()}"
  width="${
    widgetConfig.size === "small"
      ? "300"
      : widgetConfig.size === "large"
      ? "500"
      : "400"
  }"
  height="${
    widgetConfig.size === "small"
      ? "200"
      : widgetConfig.size === "large"
      ? "400"
      : "300"
  }"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  title="Interview Performance Widget">
</iframe>`;
    setEmbedCode(code);
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Options */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Widget Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={config.theme}
              onChange={(e) => updateConfig({ theme: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <select
              value={config.size}
              onChange={(e) => updateConfig({ size: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showDetails}
              onChange={(e) => updateConfig({ showDetails: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show detailed scores</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showTrends}
              onChange={(e) => updateConfig({ showTrends: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show performance trends</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showBranding}
              onChange={(e) => updateConfig({ showBranding: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show branding</span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPreview ? "Hide" : "Show"}
          </button>
        </div>

        {showPreview && (
          <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
            <EmbeddablePerformanceWidget
              performanceData={performanceData}
              theme={config.theme}
              size={config.size}
              showDetails={config.showDetails}
              showTrends={config.showTrends}
              showBranding={config.showBranding}
            />
          </div>
        )}
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Embed Code</h3>
          <button
            onClick={copyEmbedCode}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Copy className="w-4 h-4" />
            Copy Code
          </button>
        </div>

        <textarea
          value={embedCode}
          readOnly
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
        />
      </div>
    </div>
  );
};
