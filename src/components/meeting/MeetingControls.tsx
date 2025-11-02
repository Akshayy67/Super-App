import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Settings,
  Phone,
  Hand,
  PenTool,
  Copy,
  Grid3x3,
  FileText
} from 'lucide-react';

interface MeetingControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isSettingsOpen: boolean;
  isWhiteboardOpen: boolean;
  isScribing: boolean;
  chatUnreadCount: number;
  isHost: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleSettings: () => void;
  onToggleWhiteboard: () => void;
  onToggleScribe: () => void;
  onLeaveMeeting: () => void;
  onCopyLink?: () => void;
  onToggleViewMode?: () => void;
  meetingId?: string;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  isChatOpen,
  isParticipantsOpen,
  isSettingsOpen,
  isWhiteboardOpen,
  isScribing,
  chatUnreadCount,
  isHost,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  onToggleChat,
  onToggleParticipants,
  onToggleSettings,
  onToggleWhiteboard,
  onToggleScribe,
  onLeaveMeeting,
  onCopyLink,
  onToggleViewMode,
  meetingId
}) => {
  const [copyLinkSuccess, setCopyLinkSuccess] = React.useState(false);
  const [copyIdSuccess, setCopyIdSuccess] = React.useState(false);

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink();
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 3000);
    } else if (meetingId) {
      const link = `${window.location.origin}/meeting?id=${meetingId}`;
      navigator.clipboard.writeText(link).then(() => {
        setCopyLinkSuccess(true);
        setTimeout(() => setCopyLinkSuccess(false), 3000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    }
  };

  const handleCopyId = () => {
    if (meetingId) {
      navigator.clipboard.writeText(meetingId).then(() => {
        setCopyIdSuccess(true);
        setTimeout(() => setCopyIdSuccess(false), 3000);
      }).catch(err => {
        console.error('Failed to copy ID:', err);
      });
    }
  };
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          {/* Microphone */}
          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-full transition-all ${
              isAudioMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Camera */}
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoOff
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 text-white" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-5 h-5 text-white" />
            ) : (
              <Monitor className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          {/* Raise Hand */}
          <button
            onClick={onToggleHandRaise}
            className={`p-4 rounded-full transition-all ${
              isHandRaised
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-bounce'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <Hand className="w-5 h-5 text-white" />
          </button>

          {/* Chat */}
          <button
            onClick={onToggleChat}
            className={`relative p-4 rounded-full transition-all ${
              isChatOpen
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5 text-white" />
            {chatUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {chatUnreadCount}
              </span>
            )}
          </button>

          {/* Participants */}
          <button
            onClick={onToggleParticipants}
            className={`p-4 rounded-full transition-all ${
              isParticipantsOpen
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Participants"
          >
            <Users className="w-5 h-5 text-white" />
          </button>

          {/* Settings */}
          {isHost && (
            <button
              onClick={onToggleSettings}
              className={`p-4 rounded-full transition-all ${
                isSettingsOpen
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Whiteboard */}
          <button
            onClick={onToggleWhiteboard}
            className={`p-4 rounded-full transition-all ${
              isWhiteboardOpen
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Drawing Room"
          >
            <PenTool className="w-5 h-5 text-white" />
          </button>

          {/* Scribe */}
          <div className="relative">
            <button
              onClick={onToggleScribe}
              className={`p-4 rounded-full transition-all relative ${
                isScribing
                  ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isScribing ? 'Scribe On' : 'Turn On Scribe'}
            >
              <FileText className="w-5 h-5 text-white" />
            </button>
            {!isScribing && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-gray-800"></span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
              title="Toggle View Mode"
            >
              <Grid3x3 className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Copy Meeting Link - Prominent Button */}
          {meetingId && (
            <div className="relative">
              <button
                onClick={() => {
                  handleCopyLink();
                }}
                className={`px-4 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                  copyLinkSuccess 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title="Copy Meeting Link"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </button>
              {copyLinkSuccess && (
                <div className="absolute -top-12 right-0 bg-green-500 text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap z-50 shadow-lg animate-pulse">
                  ✓ Link Copied!
                </div>
              )}
            </div>
          )}

          {/* Copy Meeting ID - Prominent Button */}
          {meetingId && (
            <div className="relative">
              <button
                onClick={() => {
                  handleCopyId();
                }}
                className={`px-4 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                  copyIdSuccess 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                title="Copy Meeting ID"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy ID</span>
              </button>
              {copyIdSuccess && (
                <div className="absolute -top-12 right-0 bg-green-500 text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap z-50 shadow-lg animate-pulse">
                  ✓ ID Copied!
                </div>
              )}
            </div>
          )}

          {/* Leave Meeting */}
          <button
            onClick={onLeaveMeeting}
            className="px-6 py-4 bg-red-500 hover:bg-red-600 rounded-full font-semibold text-white transition-all flex items-center gap-2"
          >
            <Phone className="w-5 h-5 rotate-135" />
            Leave
          </button>
        </div>
      </div>

      <style>{`
        .rotate-135 {
          transform: rotate(135deg);
        }
      `}</style>
    </div>
  );
};




