import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Video,
  X,
  RefreshCw,
  Play,
  Plus,
  LogIn,
  Calendar as CalendarIcon,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  CheckSquare,
  Square,
} from "lucide-react";
import { calendarService, type CalendarEvent, type MeetingRequest } from "../../utils/calendarService";
import { videoMeetingService } from "../../services/videoMeetingService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday } from "date-fns";
import type { VideoMeeting } from "../../types/videoMeeting";
import { SharedWhiteboard } from "./SharedWhiteboard";

type UnifiedMeeting = {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  type: "calendar" | "video";
  calendarEvent?: CalendarEvent;
  videoMeeting?: VideoMeeting;
  createdAt: Date;
};

type MeetingModal = "create" | "join" | "schedule" | null;

export const MeetingsTimeline: React.FC = () => {
  const [meetings, setMeetings] = useState<UnifiedMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<UnifiedMeeting | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState<MeetingModal>(null);
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<Set<string>>(new Set());
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [scheduleMeeting, setScheduleMeeting] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    date: "",
  });
  const [createMeeting, setCreateMeeting] = useState({
    title: "",
    description: "",
  });
  const user = realTimeAuth.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [allEvents, videoMeetings] = await Promise.all([
        calendarService.getEvents(user.id),
        videoMeetingService.getUserMeetings(user.id),
      ]);

      const meetingEvents = allEvents.filter((event) => event.type === "meeting");
      
      const calendarUnified: UnifiedMeeting[] = meetingEvents.map((event) => ({
        id: `calendar_${event.id}`,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        type: "calendar" as const,
        calendarEvent: event,
        createdAt: event.createdAt,
      }));

      // Filter out dummy/test meetings (check for test/dummy in title or description)
      const videoUnified: UnifiedMeeting[] = videoMeetings
        .filter((vm) => {
          const title = vm.title?.toLowerCase() || '';
          const desc = vm.description?.toLowerCase() || '';
          // Filter out test/dummy meetings
          return !title.includes('test') && 
                 !title.includes('dummy') && 
                 !title.includes('sample') &&
                 !desc.includes('test') && 
                 !desc.includes('dummy') &&
                 !desc.includes('sample');
        })
        .map((vm) => ({
          id: `video_${vm.id}`,
          title: vm.title,
          description: vm.description,
          startDate: vm.createdAt,
          endDate: vm.endedAt,
          type: "video" as const,
          videoMeeting: vm,
          createdAt: vm.createdAt,
        }));

      const allMeetings = [...calendarUnified, ...videoUnified];
      allMeetings.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      setMeetings(allMeetings);
    } catch (error) {
      console.error("Error loading meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!user || !createMeeting.title) return;

    try {
      // Create the meeting
      const meetingId = await videoMeetingService.createMeeting(
        user.id,
        user.username || user.email,
        createMeeting.title,
        createMeeting.description
      );
      
      // Close modal and clear form
      setShowMeetingModal(null);
      setCreateMeeting({ title: "", description: "" });
      
      // Reload meetings to show the new one
      await loadMeetings();
      
      // Automatically join the meeting directly - pass skipLobby flag via URL
      navigate(`/meeting?id=${meetingId}&skipLobby=true`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const handleJoinMeeting = () => {
    if (!joinMeetingId) return;
    setShowMeetingModal(null);
    setJoinMeetingId("");
    navigate(`/meeting?id=${joinMeetingId}`);
  };

  const handleScheduleMeeting = async () => {
    if (!user || !scheduleMeeting.title || !scheduleMeeting.date || !scheduleMeeting.startTime) return;

    try {
      const startDateTime = new Date(`${scheduleMeeting.date}T${scheduleMeeting.startTime}`);
      const endDateTime = scheduleMeeting.endTime
        ? new Date(`${scheduleMeeting.date}T${scheduleMeeting.endTime}`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour

      const meetingRequest: MeetingRequest = {
        title: scheduleMeeting.title,
        description: scheduleMeeting.description,
        startTime: startDateTime,
        endTime: endDateTime,
      };

      await calendarService.scheduleMeeting(meetingRequest);
      
      setShowMeetingModal(null);
      setScheduleMeeting({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        date: "",
      });
      await loadMeetings();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    }
  };

  const handleMeetingClick = (meeting: UnifiedMeeting) => {
    setSelectedMeeting(meeting);
    setShowDetails(true);
  };

  const handleJoinVideoMeeting = (meetingId: string) => {
    navigate(`/meeting?id=${meetingId}`);
    setShowDetails(false);
    setSelectedMeeting(null);
  };

  const handleDeleteMeeting = async (meeting: UnifiedMeeting) => {
    if (!user) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${meeting.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      if (meeting.type === "video" && meeting.videoMeeting) {
        // Check if user is the host
        if (meeting.videoMeeting.hostId !== user.id) {
          alert("Only the meeting host can delete this meeting.");
          return;
        }
        await videoMeetingService.deleteMeeting(meeting.videoMeeting.id);
      } else if (meeting.type === "calendar" && meeting.calendarEvent) {
        await calendarService.deleteEvent(user.id, meeting.calendarEvent.id);
      }
      
      // Close modal and reload meetings
      setShowDetails(false);
      setSelectedMeeting(null);
      await loadMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete meeting. Please try again.");
    }
  };

  const toggleMeetingSelection = (meetingId: string) => {
    setSelectedMeetingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
      } else {
        newSet.add(meetingId);
      }
      return newSet;
    });
  };

  const selectAllMeetings = () => {
    const allIds = new Set(meetings.map(m => m.id));
    setSelectedMeetingIds(allIds);
  };

  const clearSelection = () => {
    setSelectedMeetingIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (!user || selectedMeetingIds.size === 0) return;

    const count = selectedMeetingIds.size;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${count} meeting${count > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const meetingsToDelete = meetings.filter(m => selectedMeetingIds.has(m.id));
      const deletionPromises = meetingsToDelete.map(async (meeting) => {
        try {
          if (meeting.type === "video" && meeting.videoMeeting) {
            // Check if user is the host
            if (meeting.videoMeeting.hostId !== user.id) {
              console.warn(`Cannot delete "${meeting.title}": User is not the host`);
              return { success: false, meeting };
            }
            await videoMeetingService.deleteMeeting(meeting.videoMeeting.id);
          } else if (meeting.type === "calendar" && meeting.calendarEvent) {
            await calendarService.deleteEvent(user.id, meeting.calendarEvent.id);
          }
          return { success: true, meeting };
        } catch (error) {
          console.error(`Error deleting meeting "${meeting.title}":`, error);
          return { success: false, meeting };
        }
      });

      const results = await Promise.all(deletionPromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (failed > 0) {
        alert(`${successful} meeting${successful !== 1 ? 's' : ''} deleted successfully. ${failed} meeting${failed !== 1 ? 's' : ''} could not be deleted.`);
      }

      // Clear selection and reload meetings
      setSelectedMeetingIds(new Set());
      await loadMeetings();
    } catch (error) {
      console.error("Error during bulk delete:", error);
      alert("Failed to delete some meetings. Please try again.");
    }
  };

  const getMeetingStatusColor = (meeting: UnifiedMeeting) => {
    if (meeting.type === "video" && meeting.videoMeeting) {
      if (meeting.videoMeeting.status === "active") return "border-green-500 bg-green-50 dark:bg-green-900/20";
      if (meeting.videoMeeting.status === "ended") return "border-gray-500 bg-gray-50 dark:bg-gray-900/20";
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    }
    
    if (isPast(meeting.startDate)) return "border-red-500 bg-red-50 dark:bg-red-900/20";
    if (isToday(meeting.startDate)) return "border-green-500 bg-green-50 dark:bg-green-900/20";
    return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  };

  const getTimeDisplay = (date: Date): string => {
    return format(date, "MMM d, h:mm a");
  };

  // Arrange meetings in train pattern (horizontal wrapping with alternating direction)
  const [meetingsPerRow, setMeetingsPerRow] = useState(5);
  
  useEffect(() => {
    const updateMeetingsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setMeetingsPerRow(1); // Mobile
      } else if (width < 1024) {
        setMeetingsPerRow(2); // Tablet
      } else if (width < 1536) {
        setMeetingsPerRow(5); // Desktop
      } else {
        setMeetingsPerRow(5); // Large desktop
      }
    };
    
    updateMeetingsPerRow();
    window.addEventListener('resize', updateMeetingsPerRow);
    return () => window.removeEventListener('resize', updateMeetingsPerRow);
  }, []);

  // Get the current/last meeting (most recent or active meeting)
  const getCurrentMeeting = () => {
    if (meetings.length === 0) return null;
    
    // First check for active video meetings
    const activeMeeting = meetings.find(
      (m) => m.type === "video" && m.videoMeeting?.status === "active"
    );
    if (activeMeeting) return activeMeeting;
    
    // Otherwise, return the most recent meeting (last in sorted list)
    return meetings[meetings.length - 1];
  };

  const arrangeMeetingsInTrain = () => {
    if (meetings.length === 0) return [];

    const rows: UnifiedMeeting[][] = [];
    
    for (let i = 0; i < meetings.length; i += meetingsPerRow) {
      const row = meetings.slice(i, i + meetingsPerRow);
      // Alternate direction for even rows (reverse) - like a train wrapping
      if (rows.length % 2 === 1) {
        rows.push([...row].reverse());
      } else {
        rows.push(row);
      }
    }
    
    return rows;
  };

  const currentMeeting = getCurrentMeeting();
  const isEngine = (meeting: UnifiedMeeting) => currentMeeting?.id === meeting.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const meetingRows = arrangeMeetingsInTrain();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 h-full flex flex-col">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Meetings
          </h2>
          {selectedMeetingIds.size > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({selectedMeetingIds.size} selected)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk Delete Controls - Show when meetings are selected */}
          {selectedMeetingIds.size > 0 ? (
            <>
              <button
                onClick={selectAllMeetings}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedMeetingIds.size})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowMeetingModal("create")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Meeting
              </button>
              <button
                onClick={() => setShowMeetingModal("join")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Join Meeting
              </button>
              <button
                onClick={() => setShowMeetingModal("schedule")}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule Meeting
              </button>
              <button
                onClick={loadMeetings}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh Meetings"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Train-like Meeting Layout */}
      <div className="flex-1 overflow-y-auto">
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Meetings Scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create, join, or schedule a meeting to get started
            </p>
          </div>
        ) : (
          <div className="space-y-8 relative">
            {meetingRows.map((row, rowIndex) => {
              const connectorPositionClass = rowIndex % 2 === 1 ? '-left-1.5' : '-right-1.5';
              const connectorSideClass = rowIndex % 2 === 1 ? 'left-0' : 'right-0';
              
              return (
                <div
                  key={rowIndex}
                  className={`flex items-center gap-0 ${
                    rowIndex % 2 === 1 ? "flex-row-reverse" : "flex-row"
                  } flex-wrap relative`}
                >
                  {row.map((meeting, meetingIndex) => {
                    const isCurrentEngine = isEngine(meeting);
                    const isLastInRow = meetingIndex === row.length - 1;
                    
                    return (
                      <React.Fragment key={meeting.id}>
                        <div
                          onClick={(e) => {
                            // Prevent card click when clicking checkbox
                            const target = e.target as HTMLElement;
                            if (target.closest('.meeting-checkbox')) {
                              return;
                            }
                            handleMeetingClick(meeting);
                          }}
                          className={`relative ${isCurrentEngine ? 'w-72' : 'w-64'} ${isCurrentEngine ? 'h-56' : ''} p-4 ${isCurrentEngine ? 'rounded-r-2xl' : 'rounded-lg'} border-4 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 ${
                            selectedMeetingIds.has(meeting.id) ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                          } ${isCurrentEngine 
                              ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 border-slate-500 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 dark:border-slate-600 shadow-2xl z-10' 
                              : getMeetingStatusColor(meeting)
                          }`}
                          style={isCurrentEngine ? {
                            clipPath: 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%)',
                          } : {}}
                        >
                          {/* Selection Checkbox */}
                          <div 
                            className="absolute top-2 right-2 z-20 meeting-checkbox"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMeetingSelection(meeting.id);
                            }}
                          >
                            <button
                              className="p-1 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMeetingSelection(meeting.id);
                              }}
                            >
                              {selectedMeetingIds.has(meeting.id) ? (
                                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              )}
                            </button>
                          </div>
                          {/* Bullet Train Design */}
                          {isCurrentEngine && (
                            <>
                              {/* Pointed front nose - more prominent */}
                              <div className="absolute -left-3 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700"
                                style={{
                                  clipPath: 'polygon(0% 20%, 100% 0%, 100% 50%, 100% 100%, 0% 80%)',
                                }}
                              ></div>
                              {/* Secondary nose detail */}
                              <div className="absolute -left-1 top-1/4 bottom-1/4 w-4 bg-gradient-to-r from-slate-900 via-slate-800 to-transparent dark:from-slate-950 dark:via-slate-900"></div>
                              
                              {/* Train headlights - enhanced */}
                              <div className="absolute -left-4 top-1/3 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-[0_0_15px_8px_rgba(250,204,21,0.7)] animate-pulse z-30"></div>
                              <div className="absolute -left-4 bottom-1/3 transform translate-y-1/2 w-4 h-4 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-[0_0_15px_8px_rgba(250,204,21,0.7)] animate-pulse z-30" style={{ animationDelay: '0.5s' }}></div>
                              
                              {/* Premium speed stripe - enhanced */}
                              <div className="absolute left-0 right-8 top-1/2 transform -translate-y-1/2 h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-90 shadow-lg"></div>
                              <div className="absolute left-0 right-8 top-1/3 h-0.5 bg-cyan-300 dark:bg-cyan-600 opacity-70"></div>
                              <div className="absolute left-0 right-8 bottom-1/3 h-0.5 bg-cyan-300 dark:bg-cyan-600 opacity-70"></div>
                              
                              {/* Train number/speed indicator */}
                              <div className="absolute left-3 top-3 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                                ⚡ HSR
                              </div>
                            </>
                          )}
                          
                          {/* Meeting Type Badge - positioned at top for bullet train, avoiding checkbox */}
                          {meeting.type === "video" && (
                            <div className={`absolute ${isCurrentEngine ? 'top-2 right-12' : 'top-2 right-12'} bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md z-10`}>
                              <Video className="w-3 h-3" />
                              Video
                            </div>
                          )}

                          {/* Status Badge - positioned at top for bullet train, avoiding checkbox */}
                          {meeting.type === "video" && meeting.videoMeeting && (
                            <div className={`absolute ${isCurrentEngine ? 'top-2 left-16' : 'top-2 left-2'} z-10`}>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold shadow-md ${
                                  meeting.videoMeeting.status === "active"
                                    ? "bg-green-500 text-white"
                                    : meeting.videoMeeting.status === "ended"
                                    ? "bg-gray-500 text-white"
                                    : "bg-yellow-500 text-white"
                                }`}
                              >
                                {meeting.videoMeeting.status === "active"
                                  ? "🟢 Active"
                                  : meeting.videoMeeting.status === "ended"
                                  ? "⚫ Ended"
                                  : "⏳ Waiting"}
                              </span>
                            </div>
                          )}

                          <div className={isCurrentEngine ? 'mt-10 ml-4' : 'mt-10'}>
                            <h3 className={`font-bold text-lg mb-2 ${isCurrentEngine ? 'text-white pr-20' : 'text-gray-900 dark:text-gray-100 pr-20'} truncate`}>
                              {meeting.title}
                            </h3>
                            
                            {meeting.description && (
                              <p className={`text-sm mb-3 line-clamp-2 ${isCurrentEngine ? 'text-slate-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                {meeting.description}
                              </p>
                            )}

                            <div className={`flex items-center gap-2 text-xs ${isCurrentEngine ? 'text-slate-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              <Clock className="w-3 h-3" />
                              <span>{getTimeDisplay(meeting.startDate)}</span>
                            </div>

                            {meeting.type === "video" && meeting.videoMeeting && (
                              <div className={`mt-2 flex items-center gap-2 text-xs ${isCurrentEngine ? 'text-slate-200' : 'text-gray-600 dark:text-gray-400'}`}>
                                <Users className="w-3 h-3" />
                                <span>
                                  {Object.keys(meeting.videoMeeting.participants || {}).length}{" "}
                                  participant
                                  {Object.keys(meeting.videoMeeting.participants || {}).length !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                          {/* Train Connector Line - Horizontal between meetings with arrow */}
                          {!isLastInRow && (
                            <div className="relative flex-shrink-0 flex items-center">
                              <div className={`w-14 h-1.5 ${rowIndex % 2 === 1 ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-gray-400 via-gray-500 to-gray-600 dark:from-gray-500 dark:via-gray-600 dark:to-gray-700 relative rounded-sm`}>
                                {/* Connector coupling wheels */}
                                <div className="absolute -top-2 left-1/4 w-3 h-3 bg-gray-500 dark:bg-gray-600 rounded-full border-2 border-gray-300 dark:border-gray-400"></div>
                                <div className="absolute -top-2 right-1/4 w-3 h-3 bg-gray-500 dark:bg-gray-600 rounded-full border-2 border-gray-300 dark:border-gray-400"></div>
                                {/* Arrow indicator */}
                                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                  {rowIndex % 2 === 1 ? (
                                    <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                  ) : (
                                    <ArrowRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                  )}
                                </div>
                                {/* Small connecting dots */}
                                <div className="absolute -bottom-0.5 left-0 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                <div className="absolute -bottom-0.5 right-0 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  
                  {/* Vertical connector for wrapping to next row with arrow */}
                  {rowIndex < meetingRows.length - 1 && (
                    <div className={`absolute ${connectorSideClass} top-full mt-0 w-2 h-20 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 dark:from-gray-500 dark:via-gray-600 dark:to-gray-500 rounded-sm`}>
                      {/* Vertical arrow indicator */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <ArrowDown className="w-5 h-5 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-md" />
                      </div>
                      {/* Connector joint circle */}
                      <div className={`absolute ${connectorPositionClass} top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-600 dark:bg-gray-700 rounded-full border-[3px] border-white dark:border-gray-800 shadow-lg`}></div>
                      {/* Small connecting dots along the connector */}
                      <div className={`absolute ${connectorPositionClass} top-1/4 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full`}></div>
                      <div className={`absolute ${connectorPositionClass} top-3/4 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full`}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showMeetingModal === "create" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Create Video Meeting
              </h3>
              <button
                onClick={() => {
                  setShowMeetingModal(null);
                  setCreateMeeting({ title: "", description: "" });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={createMeeting.title}
                  onChange={(e) =>
                    setCreateMeeting({ ...createMeeting, title: e.target.value })
                  }
                  placeholder="Enter meeting title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={createMeeting.description}
                  onChange={(e) =>
                    setCreateMeeting({ ...createMeeting, description: e.target.value })
                  }
                  placeholder="Meeting description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleCreateMeeting}
                disabled={!createMeeting.title}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create & Join Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Meeting Modal */}
      {showMeetingModal === "join" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Join Video Meeting
              </h3>
              <button
                onClick={() => {
                  setShowMeetingModal(null);
                  setJoinMeetingId("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting ID *
                </label>
                <input
                  type="text"
                  value={joinMeetingId}
                  onChange={(e) => setJoinMeetingId(e.target.value)}
                  placeholder="Enter meeting ID"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleJoinMeeting}
                disabled={!joinMeetingId}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showMeetingModal === "schedule" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Schedule Meeting
              </h3>
              <button
                onClick={() => {
                  setShowMeetingModal(null);
                  setScheduleMeeting({
                    title: "",
                    description: "",
                    startTime: "",
                    endTime: "",
                    date: "",
                  });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={scheduleMeeting.title}
                  onChange={(e) =>
                    setScheduleMeeting({ ...scheduleMeeting, title: e.target.value })
                  }
                  placeholder="Enter meeting title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={scheduleMeeting.description}
                  onChange={(e) =>
                    setScheduleMeeting({ ...scheduleMeeting, description: e.target.value })
                  }
                  placeholder="Meeting description (optional)"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={scheduleMeeting.date}
                  onChange={(e) =>
                    setScheduleMeeting({ ...scheduleMeeting, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleMeeting.startTime}
                    onChange={(e) =>
                      setScheduleMeeting({ ...scheduleMeeting, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={scheduleMeeting.endTime}
                    onChange={(e) =>
                      setScheduleMeeting({ ...scheduleMeeting, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleScheduleMeeting}
                disabled={!scheduleMeeting.title || !scheduleMeeting.date || !scheduleMeeting.startTime}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showDetails && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-3 flex-1">
                {selectedMeeting.type === "video" ? (
                  <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedMeeting.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMeeting.type === "video"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}>
                      {selectedMeeting.type === "video" ? "Video Meeting" : "Scheduled Meeting"}
                    </span>
                    {selectedMeeting.type === "video" && selectedMeeting.videoMeeting && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedMeeting.videoMeeting.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : selectedMeeting.videoMeeting.status === "ended"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}>
                        {selectedMeeting.videoMeeting.status === "active"
                          ? "🟢 Active"
                          : selectedMeeting.videoMeeting.status === "ended"
                          ? "⚫ Ended"
                          : "⏳ Waiting"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedMeeting(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              {selectedMeeting.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Description
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMeeting.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Date & Time Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Time
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {format(selectedMeeting.startDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {format(selectedMeeting.startDate, "h:mm a")}
                  </p>
                </div>
                {selectedMeeting.endDate && (
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Time
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {format(selectedMeeting.endDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {format(selectedMeeting.endDate, "h:mm a")}
                    </p>
                  </div>
                )}
              </div>

              {/* Video Meeting Specific Info */}
              {selectedMeeting.type === "video" && selectedMeeting.videoMeeting && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Host
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedMeeting.videoMeeting.hostName}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participants
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {Object.keys(selectedMeeting.videoMeeting.participants || {}).length} participant{Object.keys(selectedMeeting.videoMeeting.participants || {}).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {selectedMeeting.videoMeeting.createdAt && (
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {format(selectedMeeting.videoMeeting.createdAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}

                  {selectedMeeting.videoMeeting.startedAt && (
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Started
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {format(selectedMeeting.videoMeeting.startedAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}

                  {selectedMeeting.videoMeeting.endedAt && (
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Ended
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {format(selectedMeeting.videoMeeting.endedAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Transcript and AI Summary for Ended Video Meetings */}
              {selectedMeeting.type === "video" && 
               selectedMeeting.videoMeeting && 
               selectedMeeting.videoMeeting.status === "ended" && (
                <>
                  {/* Transcript */}
                  {selectedMeeting.videoMeeting.transcript && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        📝 Meeting Transcript
                      </h4>
                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                          {selectedMeeting.videoMeeting.transcript}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Summary */}
                  {selectedMeeting.videoMeeting.aiSummary && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        🤖 AI Summary
                      </h4>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                          {selectedMeeting.videoMeeting.aiSummary.split('\n').map((line, idx) => (
                            <div key={idx} className={line.trim().startsWith('•') || line.trim().startsWith('-') ? 'ml-4' : ''}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Whiteboard */}
                  {selectedMeeting.videoMeeting.whiteboard && selectedMeeting.videoMeeting.whiteboard.paths && selectedMeeting.videoMeeting.whiteboard.paths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        🎨 Meeting Drawing
                      </h4>
                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                        <div className="bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 overflow-hidden">
                          {/* Render actual whiteboard in read-only mode */}
                          <div className="h-96 w-full">
                            <SharedWhiteboard
                              sessionId={selectedMeeting.videoMeeting.id}
                              isReadOnly={true}
                              className="h-full w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {/* Join Button for Active/Waiting Video Meetings */}
                {selectedMeeting.type === "video" && 
                 selectedMeeting.videoMeeting && 
                 selectedMeeting.videoMeeting.status !== "ended" && (
                  <button
                    onClick={() => handleJoinVideoMeeting(selectedMeeting.videoMeeting!.id)}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    {selectedMeeting.videoMeeting.status === "active" 
                      ? "Join Active Meeting" 
                      : "Join Video Meeting"}
                  </button>
                )}
                
                {/* Delete Button - Show if user is host (video) or owner (calendar) */}
                {((selectedMeeting.type === "video" && 
                   selectedMeeting.videoMeeting && 
                   selectedMeeting.videoMeeting.hostId === user?.id) ||
                  (selectedMeeting.type === "calendar" && 
                   selectedMeeting.calendarEvent &&
                   selectedMeeting.calendarEvent.userId === user?.id)) && (
                  <button
                    onClick={() => handleDeleteMeeting(selectedMeeting)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
