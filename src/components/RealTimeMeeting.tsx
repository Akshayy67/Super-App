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
  Copy,
  UserPlus,
  Settings,
  Maximize,
  Minimize,
  AlertTriangle,
} from "lucide-react";
import {
  webrtcService,
  WebRTCMeeting,
  WebRTCParticipant,
  WebRTCEvent,
} from "../utils/webrtcService";
import { realTimeAuth } from "../utils/realTimeAuth";
import { MeetingTroubleshooter } from "./MeetingTroubleshooter";

interface RealTimeMeetingProps {
  meetingId?: string;
  onMeetingEnd?: () => void;
  className?: string;
}

interface ParticipantVideoProps {
  participant: WebRTCParticipant;
  isLocal?: boolean;
  className?: string;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  isLocal = false,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
    >
      {participant.stream && participant.isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${
            isLocal ? "transform scale-x-[-1]" : ""
          }`}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-800">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-semibold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm">{participant.name}</p>
          </div>
        </div>
      )}

      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        <span>{participant.name}</span>
        {participant.isMuted && <MicOff className="w-3 h-3" />}
        {participant.isScreenSharing && <Monitor className="w-3 h-3" />}
        {participant.isHost && <span className="text-yellow-400">Host</span>}
      </div>
    </div>
  );
};

export const RealTimeMeeting: React.FC<RealTimeMeetingProps> = ({
  meetingId: initialMeetingId,
  onMeetingEnd,
  className = "",
}) => {
  const [meeting, setMeeting] = useState<WebRTCMeeting | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(!initialMeetingId);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  const meetingContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to WebRTC events
    const unsubscribe = webrtcService.addEventListener((event: WebRTCEvent) => {
      console.log("WebRTC Event:", event);

      switch (event.type) {
        case "participant-joined":
        case "participant-left":
        case "stream-added":
        case "audio-toggled":
        case "video-toggled":
        case "screen-share-started":
        case "screen-share-stopped":
          // Refresh meeting state
          const currentMeeting = webrtcService.getCurrentMeeting();
          if (currentMeeting) {
            setMeeting({ ...currentMeeting });
          }
          break;

        case "meeting-ended":
          handleLeaveMeeting();
          break;
      }
    });

    // Auto-join if meeting ID provided
    if (initialMeetingId) {
      handleJoinMeeting(initialMeetingId);
    }

    return () => {
      unsubscribe();
      webrtcService.leaveMeeting();
    };
  }, [initialMeetingId]);

  useEffect(() => {
    // Update local streams
    setLocalStream(webrtcService.getLocalStream());
    setScreenStream(webrtcService.getScreenStream());
  }, [meeting]);

  const handleCreateMeeting = async () => {
    if (!newMeetingTitle.trim()) {
      setError("Meeting title is required");
      return;
    }

    try {
      const createdMeeting = await webrtcService.createMeeting(newMeetingTitle);
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

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      const joinedMeeting = await webrtcService.joinMeeting(meetingId);
      setMeeting(joinedMeeting);
      setIsInMeeting(true);
      setShowCreateMeeting(false);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to join meeting"
      );
    }
  };

  const handleStartCamera = async () => {
    try {
      const stream = await webrtcService.startCamera();
      setLocalStream(stream);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to start camera"
      );
    }
  };

  const handleToggleMute = () => {
    webrtcService.toggleMute();
  };

  const handleToggleCamera = () => {
    webrtcService.toggleCamera();
  };

  const handleStartScreenShare = async () => {
    try {
      const stream = await webrtcService.startScreenShare();
      setScreenStream(stream);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to start screen share"
      );
    }
  };

  const handleStopScreenShare = () => {
    webrtcService.stopScreenShare();
    setScreenStream(null);
  };

  const handleLeaveMeeting = async () => {
    await webrtcService.leaveMeeting();
    setMeeting(null);
    setIsInMeeting(false);
    setLocalStream(null);
    setScreenStream(null);
    setShowCreateMeeting(true);
    onMeetingEnd?.();
  };

  const handleCopyMeetingLink = () => {
    if (meeting) {
      const link = `${window.location.origin}/study-meeting/${meeting.id}`;
      navigator.clipboard.writeText(link);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      meetingContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getCurrentParticipant = (): WebRTCParticipant | null => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !meeting) return null;
    return meeting.participants.get(user.id) || null;
  };

  const getOtherParticipants = (): WebRTCParticipant[] => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !meeting) return [];
    return Array.from(meeting.participants.values()).filter(
      (p) => p.id !== user.id
    );
  };

  const currentParticipant = getCurrentParticipant();
  const otherParticipants = getOtherParticipants();

  if (showCreateMeeting) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Real-Time Video Meeting
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Create Meeting */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Create New Meeting
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                placeholder="Enter meeting title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCreateMeeting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Meeting
              </button>
            </div>
          </div>

          {/* Join Meeting */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Join Existing Meeting
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value)}
                placeholder="Enter meeting ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleJoinMeeting(joinMeetingId)}
                disabled={!joinMeetingId.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join Meeting
              </button>
            </div>
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          No Active Meeting
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create a new meeting or join an existing one to get started
        </p>
        <button
          onClick={() => setShowCreateMeeting(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Meeting
        </button>
      </div>
    );
  }

  return (
    <div
      ref={meetingContainerRef}
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {meeting.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {meeting.participants.size} participant
            {meeting.participants.size !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMeetingLink}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Copy meeting link"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Toggle chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Video Grid */}
      <div className="flex h-96">
        <div className="flex-1 p-4">
          {otherParticipants.length === 0 ? (
            /* Single participant view */
            <div className="h-full">
              {currentParticipant && (
                <ParticipantVideo
                  participant={currentParticipant}
                  isLocal={true}
                  className="h-full"
                />
              )}
            </div>
          ) : otherParticipants.length === 1 ? (
            /* Two participants - side by side */
            <div className="grid grid-cols-2 gap-4 h-full">
              {currentParticipant && (
                <ParticipantVideo
                  participant={currentParticipant}
                  isLocal={true}
                  className="h-full"
                />
              )}
              <ParticipantVideo
                participant={otherParticipants[0]}
                className="h-full"
              />
            </div>
          ) : (
            /* Multiple participants - grid layout */
            <div
              className={`grid gap-2 h-full ${
                otherParticipants.length <= 2
                  ? "grid-cols-2"
                  : otherParticipants.length <= 4
                  ? "grid-cols-2 grid-rows-2"
                  : "grid-cols-3 grid-rows-2"
              }`}
            >
              {currentParticipant && (
                <ParticipantVideo
                  participant={currentParticipant}
                  isLocal={true}
                  className="h-full"
                />
              )}
              {otherParticipants.map((participant) => (
                <ParticipantVideo
                  key={participant.id}
                  participant={participant}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 border-l border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Chat
              </h3>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Chat functionality coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center justify-center gap-4">
          {/* Mute/Unmute */}
          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-full transition-colors ${
              currentParticipant?.isMuted
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300"
            }`}
            title={currentParticipant?.isMuted ? "Unmute" : "Mute"}
          >
            {currentParticipant?.isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Camera On/Off */}
          <button
            onClick={localStream ? handleToggleCamera : handleStartCamera}
            className={`p-3 rounded-full transition-colors ${
              !currentParticipant?.isCameraOn
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300"
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

          {/* Screen Share */}
          <button
            onClick={
              screenStream ? handleStopScreenShare : handleStartScreenShare
            }
            className={`p-3 rounded-full transition-colors ${
              screenStream
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300"
            }`}
            title={screenStream ? "Stop screen share" : "Start screen share"}
          >
            {screenStream ? (
              <MonitorOff className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </button>

          {/* Troubleshooter */}
          <button
            onClick={() => setShowTroubleshooter(true)}
            className="p-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            title="Troubleshoot issues"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>

          {/* Leave Meeting */}
          <button
            onClick={handleLeaveMeeting}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Leave meeting"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Meeting ID: <span className="font-mono">{meeting.id}</span>
          </p>
        </div>
      </div>

      {/* Troubleshooter Modal */}
      <MeetingTroubleshooter
        isOpen={showTroubleshooter}
        onClose={() => setShowTroubleshooter(false)}
      />
    </div>
  );
};
