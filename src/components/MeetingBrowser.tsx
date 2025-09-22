import React, { useState, useEffect } from "react";
import {
  Video,
  Users,
  Clock,
  Search,
  Filter,
  Calendar,
  Lock,
  Play,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  studyMeetingService,
  StudyMeeting,
} from "../utils/studyMeetingService";
import { format, isToday, isTomorrow } from "date-fns";

interface MeetingBrowserProps {
  onJoinMeeting: (meeting: StudyMeeting) => void;
  className?: string;
}

export const MeetingBrowser: React.FC<MeetingBrowserProps> = ({
  onJoinMeeting,
  className = "",
}) => {
  const [meetings, setMeetings] = useState<StudyMeeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<StudyMeeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "active" | "public" | "recent"
  >("active");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<StudyMeeting | null>(
    null
  );
  const [meetingPassword, setMeetingPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchQuery, filterType]);

  const loadMeetings = async () => {
    setIsLoading(true);
    try {
      // Get all available meetings
      const allMeetings = studyMeetingService.getAvailableMeetings();
      setMeetings(allMeetings);
    } catch (error) {
      console.error("Failed to load meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMeetings = () => {
    let filtered = [...meetings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(query) ||
          meeting.description.toLowerCase().includes(query) ||
          meeting.hostName.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    switch (filterType) {
      case "active":
        filtered = filtered.filter((meeting) => meeting.isActive);
        break;
      case "public":
        filtered = filtered.filter((meeting) => meeting.settings.isPublic);
        break;
      case "recent":
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter((meeting) => meeting.createdAt > oneDayAgo);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    setFilteredMeetings(filtered);
  };

  const handleJoinMeeting = async (
    meeting: StudyMeeting,
    password?: string
  ) => {
    try {
      const joinedMeeting = await studyMeetingService.joinMeeting(
        meeting.id,
        password
      );
      onJoinMeeting(joinedMeeting);
      setShowPasswordModal(false);
      setSelectedMeeting(null);
      setMeetingPassword("");
    } catch (error) {
      console.error("Failed to join meeting:", error);
    }
  };

  const handleJoinClick = (meeting: StudyMeeting) => {
    if (meeting.settings.requirePassword) {
      setSelectedMeeting(meeting);
      setShowPasswordModal(true);
    } else {
      handleJoinMeeting(meeting);
    }
  };

  const getMeetingDate = (meeting: StudyMeeting) => {
    try {
      const dateObj =
        typeof meeting.createdAt === "string"
          ? new Date(meeting.createdAt)
          : meeting.createdAt;
      if (isNaN(dateObj.getTime())) {
        return "Recently";
      }

      if (isToday(dateObj)) {
        return "Today";
      } else if (isTomorrow(dateObj)) {
        return "Tomorrow";
      } else {
        return format(dateObj, "MMM dd");
      }
    } catch (error) {
      return "Recently";
    }
  };

  const getMeetingStatusColor = (meeting: StudyMeeting) => {
    if (meeting.isActive) {
      return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    }
    return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-slate-700 dark:border-slate-600";
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Available Meetings
          </h3>
          <button
            onClick={loadMeetings}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {[
              { key: "active", label: "Active", icon: Play },
              { key: "public", label: "Public", icon: Globe },
              { key: "recent", label: "Recent", icon: Clock },
              { key: "all", label: "All", icon: Filter },
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as any)}
                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                    filterType === filter.key
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meeting List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterType !== "all"
                ? "No meetings found matching your criteria"
                : "No meetings available"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {meeting.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {meeting.settings.isPublic ? (
                          <Globe
                            className="w-3 h-3 text-green-500"
                            title="Public meeting"
                          />
                        ) : (
                          <Lock
                            className="w-3 h-3 text-gray-400"
                            title="Private meeting"
                          />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getMeetingStatusColor(
                            meeting
                          )}`}
                        >
                          {meeting.isActive ? "Live" : "Ended"}
                        </span>
                      </div>
                    </div>

                    {meeting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {meeting.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>
                          {meeting.participants.length} participant
                          {meeting.participants.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {getMeetingDate(meeting)} •{" "}
                          {(() => {
                            try {
                              const dateObj =
                                typeof meeting.createdAt === "string"
                                  ? new Date(meeting.createdAt)
                                  : meeting.createdAt;
                              return isNaN(dateObj.getTime())
                                ? "Recently"
                                : format(dateObj, "p");
                            } catch {
                              return "Recently";
                            }
                          })()}
                        </span>
                      </div>
                      <span>by {meeting.hostName}</span>
                      {meeting.settings.requirePassword && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Lock className="w-3 h-3" />
                          <span className="text-xs">Password Required</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    {meeting.isActive ? (
                      <button
                        onClick={() => handleJoinClick(meeting)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Join
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 text-sm rounded-lg cursor-not-allowed"
                      >
                        Ended
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Enter Meeting Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                "{selectedMeeting.title}" requires a password to join
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  placeholder="Enter meeting password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && meetingPassword.trim()) {
                      handleJoinMeeting(selectedMeeting, meetingPassword);
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedMeeting(null);
                  setMeetingPassword("");
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleJoinMeeting(selectedMeeting, meetingPassword)
                }
                disabled={!meetingPassword.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
