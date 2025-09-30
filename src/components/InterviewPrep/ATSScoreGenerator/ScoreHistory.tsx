import React, { useState, useEffect } from "react";
import {
  History,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Building,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { ATSService, ScoreRun, UserStats } from "../../../utils/atsService";

export const ScoreHistory: React.FC = () => {
  const [scoreRuns, setScoreRuns] = useState<ScoreRun[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadScoreRuns = async (pageNum = 1, append = false) => {
    try {
      setError(null);
      if (!append) setIsLoading(true);

      const { runs, pagination } = await ATSService.getScoreRuns(pageNum, 10);

      if (append) {
        setScoreRuns((prev) => [...prev, ...runs]);
      } else {
        setScoreRuns(runs);
      }

      setHasMore(pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load score runs:", error);
      setError("Failed to load score history");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await ATSService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  useEffect(() => {
    if (ATSService.isAuthenticated()) {
      loadScoreRuns();
      loadUserStats();
    } else {
      setIsLoading(false);
      setError("Please log in to view your score history");
    }
  }, []);

  const handleDeleteRun = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score run?")) {
      return;
    }

    try {
      await ATSService.deleteScoreRun(id);
      setScoreRuns((prev) => prev.filter((run) => run.id !== id));

      // Reload stats
      if (userStats) {
        loadUserStats();
      }
    } catch (error) {
      console.error("Failed to delete score run:", error);
      setError("Failed to delete score run");
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const blob = await ATSService.downloadPDFReport(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ats-score-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      setError("Failed to download PDF report");
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!ATSService.isAuthenticated()) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Login Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your score history and track your progress.
        </p>
      </div>
    );
  }

  if (isLoading && scoreRuns.length === 0) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading your score history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* User Statistics */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Total Runs
              </h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {userStats.totals.scoreRuns}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Average Score
              </h3>
            </div>
            <div
              className={`text-2xl font-bold ${getScoreColor(
                userStats.scores.average
              )}`}
            >
              {userStats.scores.average}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Highest Score
              </h3>
            </div>
            <div
              className={`text-2xl font-bold ${getScoreColor(
                userStats.scores.highest
              )}`}
            >
              {userStats.scores.highest}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Recent Activity
              </h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {userStats.activity.recentRuns}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Last {userStats.activity.periodDays} days
            </div>
          </div>
        </div>
      )}

      {/* Score Runs List */}
      {scoreRuns.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Score History Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate your first ATS score to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Score Runs
          </h3>

          <div className="space-y-3">
            {scoreRuns.map((run) => (
              <div
                key={run.id}
                className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          run.overall
                        )}`}
                      >
                        {run.overall}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {run.resume.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {run.jobDescription.title}
                            {run.jobDescription.source &&
                              ` • ${run.jobDescription.source}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(run.createdAt)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span>Skills: {run.sections.skills}%</span>
                        <span>•</span>
                        <span>Experience: {run.sections.experience}%</span>
                        <span>•</span>
                        <span>Keywords: {run.sections.keywords}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownloadPDF(run.id)}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Download PDF Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteRun(run.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Score Run"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => loadScoreRuns(page + 1, true)}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
