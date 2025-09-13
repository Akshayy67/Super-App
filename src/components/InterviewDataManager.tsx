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
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await unifiedAnalyticsStorage.getPerformanceHistory();
      setInterviews(data);
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

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const interviewsToDelete =
        deleteTarget === "single"
          ? interviews.filter((i) => i.id === singleDeleteId)
          : interviews.filter((i) => selectedInterviews.has(i.id));

      // Store for undo functionality
      const deletedItems: DeletedInterview[] = interviewsToDelete.map(
        (interview) => ({
          data: interview,
          deletedAt: Date.now(),
        })
      );

      // Remove from storage
      const remainingInterviews = interviews.filter(
        (interview) =>
          !interviewsToDelete.some((deleted) => deleted.id === interview.id)
      );

      // Update all storage locations
      await unifiedAnalyticsStorage.savePerformanceHistory(remainingInterviews);

      // Update local state
      setInterviews(remainingInterviews);
      setRecentlyDeleted((prev) => [...prev, ...deletedItems]);
      setSelectedInterviews(new Set());

      // Notify parent component
      onDataChange?.();

      console.log(
        `✅ Successfully deleted ${interviewsToDelete.length} interview(s)`
      );
    } catch (error) {
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
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
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
          <h2 className="text-2xl font-bold text-gray-900">
            Interview Data Management
          </h2>
          <p className="text-gray-600 mt-1">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Recently Deleted</h3>
          </div>
          <div className="space-y-2">
            {recentlyDeleted.slice(0, 3).map((deleted, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded border"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {deleted.data.role}
                  </span>
                  <span className="text-sm text-gray-500">
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
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                selectedInterviews.size === interviews.length &&
                interviews.length > 0
              }
              onChange={selectAllInterviews}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium">
              Select All ({selectedInterviews.size}/{interviews.length})
            </span>
          </label>
          {selectedInterviews.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedInterviews.size} interview
              {selectedInterviews.size !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>
      )}

      {/* Interview List */}
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Interviews Found
            </h3>
            <p className="text-gray-600">
              Complete some mock interviews to see your data here.
            </p>
          </div>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                selectedInterviews.has(interview.id)
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedInterviews.has(interview.id)}
                    onChange={() => toggleSelectInterview(interview.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {interview.role}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleSingleDelete(interview.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {deleteTarget === "single"
                ? "Are you sure you want to delete this interview? This action can be undone within this session."
                : `Are you sure you want to delete ${selectedInterviews.size} selected interviews? This action can be undone within this session.`}
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
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
