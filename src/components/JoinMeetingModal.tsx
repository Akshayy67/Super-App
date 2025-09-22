import React, { useState } from "react";
import {
  Video,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Link,
  Hash,
  Lock,
} from "lucide-react";
import {
  studyMeetingService,
  StudyMeeting,
} from "../utils/studyMeetingService";

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (meeting: StudyMeeting) => void;
  className?: string;
}

export const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({
  isOpen,
  onClose,
  onJoinSuccess,
  className = "",
}) => {
  const [meetingInput, setMeetingInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [meetingPreview, setMeetingPreview] = useState<StudyMeeting | null>(
    null
  );
  const [showPasswordField, setShowPasswordField] = useState(false);

  const extractMeetingId = (input: string): string => {
    // Handle different input formats:
    // 1. Direct meeting ID: "meeting_123_abc"
    // 2. Meeting URL: "https://domain.com/meeting/meeting_123_abc"
    // 3. Meeting URL with params: "https://domain.com/meeting/meeting_123_abc?param=value"

    const trimmed = input.trim();

    // If it looks like a URL
    if (trimmed.includes("/meeting/")) {
      const match = trimmed.match(/\/meeting\/([^/?#]+)/);
      return match ? match[1] : trimmed;
    }

    // If it's just the meeting ID
    return trimmed;
  };

  const validateMeetingId = (id: string): boolean => {
    // Meeting IDs should follow the pattern: meeting_timestamp_randomstring
    return /^meeting_\d+_[a-z0-9]+$/i.test(id);
  };

  const handleInputChange = async (value: string) => {
    setMeetingInput(value);
    setError("");
    setMeetingPreview(null);

    if (!value.trim()) return;

    const meetingId = extractMeetingId(value);

    if (!validateMeetingId(meetingId)) {
      setError("Invalid meeting ID format");
      return;
    }

    // Try to get meeting preview
    try {
      const meeting = studyMeetingService.getMeeting(meetingId);
      if (meeting) {
        setMeetingPreview(meeting);
        setShowPasswordField(meeting.settings.requirePassword);
      } else {
        setError("Meeting not found");
      }
    } catch (error) {
      setError("Failed to find meeting");
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingInput.trim()) {
      setError("Please enter a meeting ID or link");
      return;
    }

    const meetingId = extractMeetingId(meetingInput);

    if (!validateMeetingId(meetingId)) {
      setError("Invalid meeting ID format");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const meeting = await studyMeetingService.joinMeeting(
        meetingId,
        password
      );
      onJoinSuccess(meeting);
      onClose();
      setMeetingInput("");
      setPassword("");
      setMeetingPreview(null);
      setShowPasswordField(false);
    } catch (error: any) {
      setError(error.message || "Failed to join meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMeetingInput("");
    setPassword("");
    setError("");
    setMeetingPreview(null);
    setShowPasswordField(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Join Meeting
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meeting ID or Link
            </label>
            <div className="relative">
              <input
                type="text"
                value={meetingInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter meeting ID or paste meeting link"
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {meetingInput.includes("/meeting/") ? (
                  <Link className="w-4 h-4 text-gray-400" />
                ) : (
                  <Hash className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Format examples */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Examples:</p>
              <p>• Meeting ID: meeting_1234567890_abc123</p>
              <p>
                • Meeting Link:
                https://app.com/meeting/meeting_1234567890_abc123
              </p>
            </div>
          </div>

          {/* Password Field */}
          {showPasswordField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter meeting password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {error}
              </span>
            </div>
          )}

          {/* Meeting Preview */}
          {meetingPreview && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 truncate">
                    {meetingPreview.title}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Hosted by {meetingPreview.hostName}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>
                        {meetingPreview.participants.length} participant
                        {meetingPreview.participants.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {meetingPreview.isActive ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-600 dark:text-green-400">
                          Live
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Ended</span>
                      </div>
                    )}
                    {meetingPreview.settings.requirePassword && (
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Password Required</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleJoinMeeting}
            disabled={
              !meetingInput.trim() ||
              isLoading ||
              !!error ||
              !meetingPreview?.isActive ||
              (showPasswordField && !password.trim())
            }
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Join Meeting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
