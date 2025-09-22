import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Users,
  MessageSquare,
  Settings,
  Copy,
  UserPlus,
  Clock,
  Play,
  Pause,
  Square,
  Share2,
  X,
} from "lucide-react";
import {
  studyMeetingService,
  StudyMeeting,
  StudyMeetingParticipant,
  MeetingEvent,
} from "../utils/studyMeetingService";
import { PomodoroTimer } from "./PomodoroTimer";
import { MeetingInvitation } from "./MeetingInvitation";
import { JoinMeetingModal } from "./JoinMeetingModal";
import { MeetingBrowser } from "./MeetingBrowser";

interface VirtualStudyMeetingProps {
  meetingId?: string;
  onMeetingEnd?: () => void;
  className?: string;
}

export const VirtualStudyMeeting: React.FC<VirtualStudyMeetingProps> = ({
  meetingId: initialMeetingId,
  onMeetingEnd,
  className = "",
}) => {
  const [meeting, setMeeting] = useState<StudyMeeting | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(!initialMeetingId);
  const [showChat, setShowChat] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMeetingBrowser, setShowMeetingBrowser] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    allowScreenShare: true,
    allowChat: true,
    maxParticipants: 10,
    pomodoroEnabled: false,
    isPublic: true,
    requirePassword: false,
    password: "",
  });

  useEffect(() => {
    // Subscribe to meeting events
    const unsubscribe = studyMeetingService.addEventListener(
      (event: MeetingEvent) => {
        if (meeting && event.meetingId === meeting.id) {
          // Refresh meeting data
          const updatedMeeting = studyMeetingService.getMeeting(meeting.id);
          if (updatedMeeting) {
            setMeeting({ ...updatedMeeting });
          }

          // Handle specific events
          switch (event.type) {
            case "participantJoined":
              console.log("Participant joined:", event.participantId);
              break;
            case "participantLeft":
              console.log("Participant left:", event.participantId);
              break;
            case "meetingEnded":
              handleLeaveMeeting();
              break;
          }
        }
      }
    );

    // Join existing meeting if meetingId provided
    if (initialMeetingId) {
      joinExistingMeeting(initialMeetingId);
    }

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [initialMeetingId]);

  useEffect(() => {
    // Update video elements when streams change
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [localStream, screenStream]);

  const joinExistingMeeting = async (meetingId: string) => {
    try {
      const joinedMeeting = await studyMeetingService.joinMeeting(meetingId);
      setMeeting(joinedMeeting);
      setIsInMeeting(true);
      setShowCreateMeeting(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to join meeting"
      );
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim()) {
      setError("Meeting title is required");
      return;
    }

    if (newMeeting.requirePassword && !newMeeting.password.trim()) {
      setError("Password is required when password protection is enabled");
      return;
    }

    try {
      const createdMeeting = await studyMeetingService.createMeeting({
        title: newMeeting.title,
        description: newMeeting.description,
        settings: {
          allowScreenShare: newMeeting.allowScreenShare,
          allowChat: newMeeting.allowChat,
          maxParticipants: newMeeting.maxParticipants,
          requireApproval: false,
          recordSession: false,
          isPublic: newMeeting.isPublic,
          requirePassword: newMeeting.requirePassword,
          password: newMeeting.requirePassword
            ? newMeeting.password
            : undefined,
        },
        pomodoroSettings: {
          enabled: newMeeting.pomodoroEnabled,
          workDuration: 25,
          breakDuration: 5,
          autoStart: false,
        },
      });

      setMeeting(createdMeeting);
      setIsInMeeting(true);
      setShowCreateMeeting(false);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create meeting"
      );
    }
  };

  const handleStartCamera = async () => {
    try {
      const stream = await studyMeetingService.startCamera();
      setLocalStream(stream);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to start camera"
      );
    }
  };

  const handleToggleMute = async () => {
    if (!meeting) return;
    try {
      await studyMeetingService.toggleMute(meeting.id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to toggle mute"
      );
    }
  };

  const handleToggleCamera = async () => {
    if (!meeting) return;
    try {
      await studyMeetingService.toggleCamera(meeting.id);
      const stream = studyMeetingService.getLocalStream();
      setLocalStream(stream);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to toggle camera"
      );
    }
  };

  const handleToggleScreenShare = async () => {
    if (!meeting) return;
    try {
      await studyMeetingService.toggleScreenShare(meeting.id);
      const stream = studyMeetingService.getScreenStream();
      setScreenStream(stream);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to toggle screen share"
      );
    }
  };

  const handleLeaveMeeting = async () => {
    if (meeting) {
      await studyMeetingService.leaveMeeting(meeting.id);
    }
    cleanup();
    setIsInMeeting(false);
    setMeeting(null);
    onMeetingEnd?.();
  };

  const cleanup = () => {
    studyMeetingService.stopLocalStream();
    studyMeetingService.stopScreenShare();
    setLocalStream(null);
    setScreenStream(null);
  };

  const copyMeetingLink = () => {
    if (meeting) {
      const link = studyMeetingService.generateMeetingLink(meeting.id);
      navigator.clipboard.writeText(link);
      // You could show a toast notification here
    }
  };

  const getCurrentParticipant = (): StudyMeetingParticipant | null => {
    if (!meeting) return null;
    const user = studyMeetingService["realTimeAuth"]?.getCurrentUser();
    return meeting.participants.find((p) => p.id === user?.id) || null;
  };

  const currentParticipant = getCurrentParticipant();

  if (showCreateMeeting) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Create Study Meeting
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Math Study Session"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newMeeting.description}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              placeholder="What will you be studying?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              min="2"
              max="20"
              value={newMeeting.maxParticipants}
              onChange={(e) =>
                setNewMeeting({
                  ...newMeeting,
                  maxParticipants: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMeeting.allowScreenShare}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    allowScreenShare: e.target.checked,
                  })
                }
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Allow screen sharing
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMeeting.allowChat}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, allowChat: e.target.checked })
                }
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Allow chat
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMeeting.pomodoroEnabled}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    pomodoroEnabled: e.target.checked,
                  })
                }
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Enable Pomodoro timer
              </span>
            </label>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Privacy Settings
            </h3>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMeeting.isPublic}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    isPublic: e.target.checked,
                  })
                }
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Make meeting public (visible in meeting browser)
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMeeting.requirePassword}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    requirePassword: e.target.checked,
                  })
                }
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Require password to join
              </span>
            </label>

            {newMeeting.requirePassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Password
                </label>
                <input
                  type="password"
                  value={newMeeting.password}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter meeting password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreateMeeting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Meeting
            </button>
            <button
              onClick={() => setShowCreateMeeting(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInMeeting || !meeting) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 text-center ${className}`}
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Join Study Meeting
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter a meeting ID or create a new study session
        </p>
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => setShowCreateMeeting(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Meeting
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Join by ID
          </button>
        </div>

        {/* Meeting Browser Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowMeetingBrowser(!showMeetingBrowser)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {showMeetingBrowser ? "Hide" : "Browse"} Available Meetings
          </button>
        </div>

        {/* Meeting Browser */}
        {showMeetingBrowser && (
          <div className="mt-6">
            <MeetingBrowser
              onJoinMeeting={(joinedMeeting) => {
                setMeeting(joinedMeeting);
                setIsInMeeting(true);
                setShowCreateMeeting(false);
                setShowMeetingBrowser(false);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {meeting.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {meeting.participants.length} participant
              {meeting.participants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvitation(!showInvitation)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Invite participants"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={copyMeetingLink}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Copy meeting link"
            >
              <Copy className="w-5 h-5" />
            </button>
            {meeting.settings.allowChat && (
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${
                  showChat
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
                title="Toggle chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
            {meeting.pomodoroSettings?.enabled && (
              <button
                onClick={() => setShowPomodoro(!showPomodoro)}
                className={`p-2 rounded-lg transition-colors ${
                  showPomodoro
                    ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
                title="Toggle Pomodoro timer"
              >
                <Clock className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex h-96">
        {/* Main Video Area */}
        <div className="flex-1 bg-gray-900 relative">
          {screenStream ? (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-4">Camera is off</p>
                <button
                  onClick={handleStartCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            </div>
          )}

          {/* Participants overlay */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="text-sm">{meeting.participants.length}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showPomodoro) && (
          <div className="w-80 border-l border-gray-200 dark:border-slate-700 flex flex-col">
            {showPomodoro && meeting.pomodoroSettings?.enabled && (
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <PomodoroTimer className="!p-0 !border-0 !shadow-none" />
              </div>
            )}

            {showChat && meeting.settings.allowChat && (
              <div className="flex-1 flex flex-col">
                <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Chat
                  </h3>
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                  {messages.length > 0 ? (
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <div key={message.id} className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {message.senderName}:
                          </span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {message.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                      No messages yet
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          // Handle send message
                          setChatMessage("");
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-full transition-colors ${
              currentParticipant?.isMuted
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            }`}
            title={currentParticipant?.isMuted ? "Unmute" : "Mute"}
          >
            {currentParticipant?.isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleToggleCamera}
            className={`p-3 rounded-full transition-colors ${
              !currentParticipant?.isCameraOn
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            }`}
            title={
              currentParticipant?.isCameraOn
                ? "Turn off camera"
                : "Turn on camera"
            }
          >
            {currentParticipant?.isCameraOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {meeting.settings.allowScreenShare && (
            <button
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-full transition-colors ${
                currentParticipant?.isScreenSharing
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
              title={
                currentParticipant?.isScreenSharing
                  ? "Stop sharing"
                  : "Share screen"
              }
            >
              {currentParticipant?.isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </button>
          )}

          <button
            onClick={handleLeaveMeeting}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            title="Leave meeting"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meeting Invitation Panel */}
      {showInvitation && meeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Invite Participants
              </h3>
              <button
                onClick={() => setShowInvitation(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <MeetingInvitation
                meeting={meeting}
                onJoinMeeting={() => {
                  setShowInvitation(false);
                  // Already in meeting, no need to join again
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Join Meeting Modal */}
      <JoinMeetingModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={(joinedMeeting) => {
          setMeeting(joinedMeeting);
          setIsInMeeting(true);
          setShowCreateMeeting(false);
          setShowJoinModal(false);
        }}
      />
    </div>
  );
};
