import React, { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  RotateCcw,
  Calendar,
  Clock,
  User,
  Target,
  MoreVertical,
  Eye,
  Download,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { unifiedAnalyticsStorage } from "../utils/unifiedAnalyticsStorage";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";
import { useTheme } from "../utils/themeManager";

interface DeletedInterview {
  data: InterviewPerformanceData;
  deletedAt: number;
}

interface InterviewDataManagerProps {
  onDataChange?: () => void;
  showDetailedView?: (interview: InterviewPerformanceData) => void;
}

export const InterviewDataManager: React.FC<InterviewDataManagerProps> = ({
  onDataChange,
  showDetailedView,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  const [interviews, setInterviews] = useState<InterviewPerformanceData[]>([]);
  const [selectedInterviews, setSelectedInterviews] = useState<Set<string>>(
    new Set()
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk">("single");
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<DeletedInterview[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load interview data
  useEffect(() => {
    loadInterviews();
    
    // Show persisted logs on mount (if any)
    const logs = sessionStorage.getItem('deletion_logs');
    if (logs) {
      const parsedLogs = JSON.parse(logs);
      if (parsedLogs.length > 0) {
        console.log('📋 Previous Deletion Logs:', parsedLogs);
        // Clear logs after showing them
        sessionStorage.removeItem('deletion_logs');
      }
    }
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await unifiedAnalyticsStorage.getPerformanceHistory();
      setInterviews(data);
      console.log(`📋 InterviewDataManager: Loaded ${data.length} interviews`);
    } catch (error) {
      console.error("Failed to load interviews:", error);
    }
  };

  const handleSingleDelete = (interviewId: string) => {
    setSingleDeleteId(interviewId);
    setDeleteTarget("single");
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedInterviews.size === 0) return;
    setDeleteTarget("bulk");
    setShowDeleteConfirm(true);
  };

  // Helper to log and persist messages
  const logAndPersist = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data || '');
    
    // Store in sessionStorage so logs persist after refresh
    const existingLogs = sessionStorage.getItem('deletion_logs') || '[]';
    const logs = JSON.parse(existingLogs);
    logs.push({ message: logEntry, data, timestamp });
    // Keep only last 50 log entries
    const recentLogs = logs.slice(-50);
    sessionStorage.setItem('deletion_logs', JSON.stringify(recentLogs));
  };

  const confirmDelete = async (e?: React.MouseEvent) => {
    // Prevent any default behavior that might cause refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsLoading(true);
    logAndPersist(`🗑️ Starting deletion of interviews...`, {
      deleteTarget,
      singleDeleteId,
      selectedCount: selectedInterviews.size
    });
    
    try {
      const interviewsToDelete =
        deleteTarget === "single"
          ? interviews.filter((i) => i.id === singleDeleteId)
          : interviews.filter((i) => selectedInterviews.has(i.id));

      if (interviewsToDelete.length === 0) {
        logAndPersist("⚠️ No interviews to delete");
        setIsLoading(false);
        return;
      }

      // Store for undo functionality
      const deletedItems: DeletedInterview[] = interviewsToDelete.map(
        (interview) => ({
          data: interview,
          deletedAt: Date.now(),
        })
      );

      // Delete each interview individually from both local and cloud storage
      // This ensures proper deletion from all storage locations
      logAndPersist(`🗑️ Starting deletion of ${interviewsToDelete.length} interview(s)...`);
      const deletePromises = interviewsToDelete.map(async (interview, index) => {
        try {
          logAndPersist(`🗑️ Deleting interview ${index + 1}/${interviewsToDelete.length}: ${interview.id}`);
          const result = await unifiedAnalyticsStorage.deletePerformanceData(interview.id);
          if (!result) {
            logAndPersist(`⚠️ Failed to delete interview ${interview.id} - deletion returned false`);
          } else {
            logAndPersist(`✅ Successfully deleted interview ${interview.id}`);
          }
          return { success: result, id: interview.id };
        } catch (error) {
          logAndPersist(`❌ Error deleting interview ${interview.id}`, error);
          return { success: false, id: interview.id, error };
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      
      // Check for failures
      const failures = deleteResults.filter((result) => !result.success);
      
      if (failures.length > 0) {
        logAndPersist(
          `❌ Failed to delete ${failures.length} interview(s):`,
          failures.map(f => f.id)
        );
      }

      // Wait longer for cloud operations to complete, especially for bulk deletions
      const waitTime = interviewsToDelete.length > 1 ? 2000 : 1000;
      logAndPersist(`⏳ Waiting ${waitTime}ms for cloud deletions to complete...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Update local state immediately to remove deleted interviews from UI (optimistic update)
      const remainingInterviews = interviews.filter(
        (interview) =>
          !interviewsToDelete.some((deleted) => deleted.id === interview.id)
      );
      
      // Update state immediately so UI reflects deletion right away
      setInterviews(remainingInterviews);
      setRecentlyDeleted((prev) => [...prev, ...deletedItems]);
      setSelectedInterviews(new Set());
      logAndPersist(`✅ Updated UI state immediately: ${remainingInterviews.length} interviews remaining`);

      // Then reload data from storage to ensure consistency (especially after cloud deletion)
      // Use a small delay to avoid race conditions with the analytics hook
      await new Promise(resolve => setTimeout(resolve, 500));
      logAndPersist("🔄 Reloading data from storage to verify deletion...");
      const reloadedData = await unifiedAnalyticsStorage.getPerformanceHistory();
      
      // Only update if the count matches (to avoid overwriting with stale data)
      if (reloadedData.length === remainingInterviews.length || reloadedData.length < interviews.length) {
        setInterviews(reloadedData);
        logAndPersist(`✅ Data reloaded and verified: ${reloadedData.length} interviews in storage`);
      } else {
        logAndPersist(`⚠️ Reloaded data count (${reloadedData.length}) doesn't match expected (${remainingInterviews.length}), keeping current state`);
      }

      // Trigger a storage event to notify other components (like analytics hook)
      // This ensures the analytics dashboard picks up the deletion immediately
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'interview_performance_history',
          newValue: JSON.stringify(reloadedData),
          oldValue: JSON.stringify(interviews),
          storageArea: localStorage,
        }));
        logAndPersist("📡 Storage event dispatched to notify other components");
      } catch (error) {
        console.warn("Failed to dispatch storage event:", error);
      }

      // Notify parent component after a short delay to allow state to settle
      setTimeout(() => {
        onDataChange?.();
      }, 300);
      
      // Also reload interviews in this component to ensure UI is in sync
      setTimeout(() => {
        loadInterviews();
      }, 500);

      const successCount = deleteResults.filter((result) => result.success).length;

      logAndPersist(
        `✅ Successfully deleted ${successCount}/${interviewsToDelete.length} interview(s)`
      );
      
      if (failures.length > 0) {
        logAndPersist(
          `⚠️ ${failures.length} deletion(s) may not have completed. Check logs for details.`
        );
      }
      
      // Show logs in console even if page refreshes
      const logs = sessionStorage.getItem('deletion_logs');
      if (logs) {
        console.log('📋 Deletion Logs (from sessionStorage):', JSON.parse(logs));
      }
    } catch (error) {
      logAndPersist("❌ Failed to delete interviews", error);
      console.error("Failed to delete interviews:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setSingleDeleteId(null);
    }
  };

  const undoDelete = async (deletedInterview: DeletedInterview) => {
    try {
      const updatedInterviews = [...interviews, deletedInterview.data];
      await unifiedAnalyticsStorage.savePerformanceHistory(updatedInterviews);

      setInterviews(updatedInterviews);
      setRecentlyDeleted((prev) =>
        prev.filter((item) => item.data.id !== deletedInterview.data.id)
      );

      onDataChange?.();
      console.log("✅ Interview restored successfully");
    } catch (error) {
      console.error("Failed to restore interview:", error);
    }
  };

  const toggleSelectInterview = (interviewId: string) => {
    const newSelected = new Set(selectedInterviews);
    if (newSelected.has(interviewId)) {
      newSelected.delete(interviewId);
    } else {
      newSelected.add(interviewId);
    }
    setSelectedInterviews(newSelected);
  };

  const selectAllInterviews = () => {
    if (selectedInterviews.size === interviews.length) {
      setSelectedInterviews(new Set());
    } else {
      setSelectedInterviews(new Set(interviews.map((i) => i.id)));
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
    if (score >= 40) return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
  };

  const exportInterviewData = () => {
    const dataStr = JSON.stringify(interviews, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Interview Data Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your interview history • {interviews.length} total interviews
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportInterviewData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          {selectedInterviews.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedInterviews.size})
            </button>
          )}
        </div>
      </div>

      {/* Recently Deleted - Undo Section */}
      {recentlyDeleted.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Recently Deleted</h3>
          </div>
          <div className="space-y-2">
            {recentlyDeleted.slice(0, 3).map((deleted, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {deleted.data.role}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(deleted.data.timestamp)}
                  </span>
                </div>
                <button
                  onClick={() => undoDelete(deleted)}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Selection Controls */}
      {interviews.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                selectedInterviews.size === interviews.length &&
                interviews.length > 0
              }
              onChange={selectAllInterviews}
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Select All ({selectedInterviews.size}/{interviews.length})
            </span>
          </label>
          {selectedInterviews.size > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedInterviews.size} interview
              {selectedInterviews.size !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>
      )}

      {/* Interview List */}
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Interviews Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete some mock interviews to see your data here.
            </p>
          </div>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className={`border rounded-lg p-6 transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 ${
                selectedInterviews.has(interview.id)
                  ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedInterviews.has(interview.id)}
                    onChange={() => toggleSelectInterview(interview.id)}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {interview.role}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(interview.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(interview.duration)} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {interview.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Score Display */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                        interview.overallScore
                      )}`}
                    >
                      Overall: {interview.overallScore}/100
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                        interview.technicalScore
                      )}`}
                    >
                      Technical: {interview.technicalScore}/100
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {showDetailedView && (
                      <button
                        onClick={() => showDetailedView(interview)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSingleDelete(interview.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      title="Delete Interview"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {deleteTarget === "single"
                ? "Are you sure you want to delete this interview? This action can be undone within this session."
                : `Are you sure you want to delete ${selectedInterviews.size} selected interviews? This action can be undone within this session.`}
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDataManager;
