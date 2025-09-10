import React from "react";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Activity,
} from "lucide-react";

interface ScoreData {
  value: number;
  maxValue: number;
  label: string;
  category: string;
  subScores?: { [key: string]: number };
  percentile?: number;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
}

interface EnhancedScoringSystemProps {
  scores: ScoreData[];
  isDarkMode?: boolean;
  showPercentiles?: boolean;
  showTrends?: boolean;
  showSubScores?: boolean;
}

export const EnhancedScoringSystem: React.FC<EnhancedScoringSystemProps> = ({
  scores,
  isDarkMode = false,
  showPercentiles = true,
  showTrends = true,
  showSubScores = true,
}) => {
  const getScoreColor = (score: number, maxValue: number = 100): string => {
    const percentage = (score / maxValue) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number, maxValue: number = 100): string => {
    const percentage = (score / maxValue) * 100;
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getProgressColor = (score: number, maxValue: number = 100): string => {
    const percentage = (score / maxValue) * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPerformanceLevel = (score: number, maxValue: number = 100): string => {
    const percentage = (score / maxValue) * 100;
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Good";
    if (percentage >= 70) return "Average";
    if (percentage >= 60) return "Below Average";
    return "Needs Improvement";
  };

  const CircularProgress: React.FC<{
    value: number;
    maxValue: number;
    size: number;
    strokeWidth: number;
    label: string;
  }> = ({ value, maxValue, size, strokeWidth, label }) => {
    const percentage = (value / maxValue) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? "#374151" : "#e5e7eb"}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={percentage >= 80 ? "#10b981" : percentage >= 60 ? "#f59e0b" : "#ef4444"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${getScoreColor(value, maxValue)}`}>
            {value}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
          </span>
        </div>
      </div>
    );
  };

  const ProgressBar: React.FC<{
    value: number;
    maxValue: number;
    label: string;
    showValue?: boolean;
  }> = ({ value, maxValue, label, showValue = true }) => {
    const percentage = (value / maxValue) * 100;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          {showValue && (
            <span className={`text-sm font-bold ${getScoreColor(value, maxValue)}`}>
              {value}/{maxValue}
            </span>
          )}
        </div>
        <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressColor(value, maxValue)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {getPerformanceLevel(value, maxValue)}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {scores.map((score, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
              isDarkMode ? 'bg-gray-800 border-gray-600' : getScoreBgColor(score.value, score.maxValue)
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{score.label}</h3>
              {score.category === "overall" && <Award className="w-6 h-6 text-yellow-500" />}
              {score.category === "technical" && <Zap className="w-6 h-6 text-blue-500" />}
              {score.category === "communication" && <Activity className="w-6 h-6 text-green-500" />}
              {score.category === "behavioral" && <Target className="w-6 h-6 text-purple-500" />}
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center mb-4">
              <CircularProgress
                value={score.value}
                maxValue={score.maxValue}
                size={120}
                strokeWidth={8}
                label={score.category}
              />
            </div>

            {/* Percentile Ranking */}
            {showPercentiles && score.percentile && (
              <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="text-sm font-medium text-blue-600">
                  {score.percentile}th Percentile
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Better than {score.percentile}% of candidates
                </div>
              </div>
            )}

            {/* Trend Indicator */}
            {showTrends && score.trend && (
              <div className="flex items-center justify-center mt-3 gap-2">
                {score.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : score.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Activity className="w-4 h-4 text-gray-500" />
                )}
                <span className={`text-sm ${
                  score.trend === "up" ? "text-green-600" : 
                  score.trend === "down" ? "text-red-600" : "text-gray-600"
                }`}>
                  {score.trendValue && score.trendValue > 0 ? "+" : ""}{score.trendValue || 0} from last interview
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Sub-Scores */}
      {showSubScores && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scores.filter(score => score.subScores).map((score, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                {score.label} Breakdown
              </h3>
              <div className="space-y-4">
                {score.subScores && Object.entries(score.subScores).map(([key, value]) => (
                  <ProgressBar
                    key={key}
                    value={value}
                    maxValue={100}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Level Indicators */}
      <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-lg font-semibold mb-4">Performance Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { level: "Excellent", range: "90-100", color: "bg-green-500", icon: Star },
            { level: "Good", range: "80-89", color: "bg-blue-500", icon: CheckCircle },
            { level: "Average", range: "70-79", color: "bg-yellow-500", icon: Target },
            { level: "Below Avg", range: "60-69", color: "bg-orange-500", icon: AlertTriangle },
            { level: "Needs Work", range: "0-59", color: "bg-red-500", icon: TrendingDown },
          ].map((level, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-center text-white ${level.color}`}
            >
              <level.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold text-sm">{level.level}</div>
              <div className="text-xs opacity-90">{level.range}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
