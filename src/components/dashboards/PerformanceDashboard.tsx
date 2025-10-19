import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  Eye,
  Volume2,
  Users,
  Brain,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Filter,
  Zap,
  Activity,
} from "lucide-react";
import {
  PerformanceAnalytics,
  InterviewPerformanceData,
  PerformanceComparison,
  PerformanceTrends,
} from "../../utils/performanceAnalytics";

interface PerformanceDashboardProps {
  currentPerformance?: InterviewPerformanceData;
  onExportData?: () => void;
  onImportData?: (data: string) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  currentPerformance,
  onExportData,
  onImportData,
}) => {
  const [performanceAnalytics] = useState(() => new PerformanceAnalytics());
  const [performanceHistory, setPerformanceHistory] = useState<
    InterviewPerformanceData[]
  >([]);
  const [comparison, setComparison] = useState<PerformanceComparison | null>(
    null
  );
  const [trends, setTrends] = useState<PerformanceTrends | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "week" | "month" | "quarter" | "all"
  >("month");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  useEffect(() => {
    loadPerformanceData();
  }, []);

  useEffect(() => {
    if (currentPerformance) {
      const newComparison =
        performanceAnalytics.compareWithPrevious(currentPerformance);
      setComparison(newComparison);
    }
  }, [currentPerformance]);

  useEffect(() => {
    const newTrends =
      performanceAnalytics.generatePerformanceTrends(selectedTimeRange);
    setTrends(newTrends);
  }, [selectedTimeRange, performanceHistory]);

  const loadPerformanceData = () => {
    const history = performanceAnalytics.getPerformanceHistory();
    setPerformanceHistory(history);
  };

  const getUniqueRoles = () => {
    const roles = [...new Set(performanceHistory.map((p) => p.role))];
    return ["all", ...roles];
  };

  const getFilteredHistory = () => {
    let filtered = performanceHistory;

    if (selectedRole !== "all") {
      filtered = filtered.filter((p) => p.role === selectedRole);
    }

    return filtered;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-green-50 border-green-200";
    if (score >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getTrendIcon = (trend: "improved" | "declined" | "stable") => {
    switch (trend) {
      case "improved":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "declined":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const exportData = () => {
    const data = performanceAnalytics.exportPerformanceData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-performance-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (performanceAnalytics.importPerformanceData(data)) {
          loadPerformanceData();
          alert("Performance data imported successfully!");
        } else {
          alert("Failed to import data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Track your interview performance and improvement over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {getUniqueRoles().map((role) => (
              <option key={role} value={role}>
                {role === "all" ? "All Roles" : role}
              </option>
            ))}
          </select>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Current Performance Summary */}
      {currentPerformance && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Latest Interview Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg border ${getScoreBgColor(
                currentPerformance.overallScore
              )}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="font-medium">Overall Score</span>
              </div>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  currentPerformance.overallScore
                )}`}
              >
                {currentPerformance.overallScore}
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${getScoreBgColor(
                currentPerformance.technicalScore
              )}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-medium">Technical</span>
              </div>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  currentPerformance.technicalScore
                )}`}
              >
                {currentPerformance.technicalScore}
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${getScoreBgColor(
                currentPerformance.communicationScore
              )}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5" />
                <span className="font-medium">Communication</span>
              </div>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  currentPerformance.communicationScore
                )}`}
              >
                {currentPerformance.communicationScore}
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${getScoreBgColor(
                currentPerformance.behavioralScore
              )}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Behavioral</span>
              </div>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  currentPerformance.behavioralScore
                )}`}
              >
                {currentPerformance.behavioralScore}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Speech Analysis */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">
                Speech Analysis
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Filler Words:</span>
                  <span className="font-medium">
                    {currentPerformance.speechAnalysis.fillerWords.percentage.toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Speaking Pace:</span>
                  <span className="font-medium">
                    {
                      currentPerformance.speechAnalysis.paceAnalysis
                        .wordsPerMinute
                    }{" "}
                    WPM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Confidence:</span>
                  <span className="font-medium">
                    {currentPerformance.speechAnalysis.confidenceScore.overall}
                    /100
                  </span>
                </div>
              </div>
            </div>

            {/* Body Language */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">
                Body Language
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Eye Contact:</span>
                  <span className="font-medium">
                    {
                      currentPerformance.bodyLanguageAnalysis.eyeContact
                        .percentage
                    }
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Posture:</span>
                  <span className="font-medium">
                    {currentPerformance.bodyLanguageAnalysis.posture.score}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Professionalism:</span>
                  <span className="font-medium">
                    {
                      currentPerformance.bodyLanguageAnalysis
                        .overallBodyLanguage.professionalismScore
                    }
                    /100
                  </span>
                </div>
              </div>
            </div>

            {/* Interview Stats */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-3">
                Interview Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(currentPerformance.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Questions:</span>
                  <span className="font-medium">
                    {currentPerformance.questionsAnswered}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Avg Response:</span>
                  <span className="font-medium">
                    {currentPerformance.averageResponseTime.toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Comparison */}
      {comparison && comparison.previous && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance Comparison
          </h2>

          <div className="mb-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                comparison.overallProgress.trend === "improving"
                  ? "bg-green-100 text-green-800"
                  : comparison.overallProgress.trend === "declining"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {comparison.overallProgress.trend === "improving" ? (
                <TrendingUp className="w-4 h-4" />
              ) : comparison.overallProgress.trend === "declining" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              {comparison.overallProgress.message}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.improvements.map((improvement, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {improvement.metric}
                  </span>
                  {getTrendIcon(improvement.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold ${
                      improvement.trend === "improved"
                        ? "text-green-600"
                        : improvement.trend === "declined"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {improvement.change > 0 ? "+" : ""}
                    {improvement.change}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      improvement.significance === "major"
                        ? "bg-blue-100 text-blue-800"
                        : improvement.significance === "minor"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {improvement.significance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trends */}
      {trends && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance Trends
          </h2>

          {trends.insights.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Key Insights</h3>
              <div className="space-y-2">
                {trends.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trends.recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Recommendations
              </h3>
              <div className="space-y-2">
                {trends.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(trends.trends).map(([key, trend]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      trend.direction === "up"
                        ? "text-green-600"
                        : trend.direction === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {trend.direction === "up"
                      ? "↗"
                      : trend.direction === "down"
                      ? "↘"
                      : "→"}
                  </span>
                  <span className="text-sm font-medium">
                    {trend.trend > 0 ? "+" : ""}
                    {trend.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Interviews */}
      {performanceHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Interviews
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Difficulty
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Overall Score
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Questions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredHistory()
                  .slice(-10)
                  .reverse()
                  .map((performance) => (
                    <tr
                      key={performance.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(performance.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {performance.role}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            performance.difficulty === "hard"
                              ? "bg-red-100 text-red-800"
                              : performance.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {performance.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${getScoreColor(
                            performance.overallScore
                          )}`}
                        >
                          {performance.overallScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDuration(performance.duration)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {performance.questionsAnswered}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {performanceHistory.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Performance Data Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Complete your first interview to start tracking your performance and
            see detailed analytics.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start Your First Interview
          </button>
        </div>
      )}
    </div>
  );
};
