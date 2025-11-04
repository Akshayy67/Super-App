// Active Call Interface Component
// Shows the active call with profiles, video/audio streams, and controls

import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  User,
  X,
} from 'lucide-react';
import { CallState } from '../../services/callService';
import { UserProfile } from '../../types';

interface ActiveCallInterfaceProps {
  callState: CallState;
  remoteProfile: UserProfile | null;
  onEndCall: () => void;
}

export const ActiveCallInterface: React.FC<ActiveCallInterfaceProps> = ({
  callState,
  remoteProfile,
  onEndCall,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }

    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.localStream, callState.remoteStream]);

  const handleToggleAudio = () => {
    const newState = !isAudioMuted;
    setIsAudioMuted(newState);
    callService.toggleAudio(!newState);
  };

  const handleToggleVideo = () => {
    if (callState.callType === 'audio') return; // Can't toggle video on audio call
    
    const newState = !isVideoOff;
    setIsVideoOff(newState);
    callService.toggleVideo(!newState);
  };

  const displayName = remoteProfile?.username || 'Unknown User';
  const photoURL = remoteProfile?.photoURL;

  const isVideoCall = callState.callType === 'video';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote Video/Profile */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        {isVideoCall && callState.remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            muted={false}
          />
        ) : (
          <div className="text-center">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 border-4 border-white/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="text-3xl font-bold text-white mb-2">{displayName}</h2>
            <p className="text-gray-300">
              {callState.isConnected
                ? callState.callType === 'video'
                  ? 'Video call in progress'
                  : 'Audio call in progress'
                : 'Connecting...'}
            </p>
            {callState.connectionState !== 'connected' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm">Connecting...</span>
              </div>
            )}
          </div>
        )}

        {/* Connection Status Badge */}
        {callState.connectionState === 'connected' && (
          <div className="absolute top-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Connected
          </div>
        )}
      </div>

      {/* Local Video Preview (for video calls) */}
      {isVideoCall && callState.localStream && (
        <div className="absolute top-4 left-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
          />
        </div>
      )}

      {/* Call Controls */}
      <div className="bg-gradient-to-t from-black/90 to-transparent p-6">
        <div className="max-w-md mx-auto">
          {/* User Info */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-1">{displayName}</h3>
            <p className="text-gray-400 text-sm">
              {callState.callType === 'video' ? 'Video Call' : 'Audio Call'}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
                isAudioMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              } text-white shadow-lg`}
              aria-label={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* Video Toggle (only for video calls) */}
            {isVideoCall && (
              <button
                onClick={handleToggleVideo}
                className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
                  isVideoOff
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                } text-white shadow-lg`}
                aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? (
                  <VideoOff className="w-6 h-6" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
              </button>
            )}

            {/* End Call */}
            <button
              onClick={onEndCall}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              aria-label="End call"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import callService for controls
import { callService } from '../../services/callService';

