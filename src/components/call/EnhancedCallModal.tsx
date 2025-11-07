// Enhanced Call Modal - Beautiful call UI for 1-to-1 calls

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, X } from 'lucide-react';
import { callService, CallState } from '../../services/callService';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface EnhancedCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callState: CallState;
  remoteUserName?: string;
  remoteUserPhotoURL?: string;
  onEndCall: () => void;
}

export const EnhancedCallModal: React.FC<EnhancedCallModalProps> = ({
  isOpen,
  onClose,
  callState,
  remoteUserName = 'Unknown User',
  remoteUserPhotoURL,
  onEndCall,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (callState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (callState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  const handleToggleAudio = () => {
    const newState = !isAudioMuted;
    setIsAudioMuted(newState);
    callService.toggleAudio(!newState);
  };

  const handleToggleVideo = () => {
    const newState = !isVideoOff;
    setIsVideoOff(newState);
    callService.toggleVideo(!newState);
  };

  const handleEndCall = async () => {
    await callService.endCall();
    onEndCall();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col">
        {/* Remote Video */}
        <div className="flex-1 relative bg-slate-900">
          {callState.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              muted={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                {remoteUserPhotoURL ? (
                  <img
                    src={remoteUserPhotoURL}
                    alt={remoteUserName}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {remoteUserName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-white mb-2">{remoteUserName}</h3>
                <p className="text-gray-400">
                  {callState.connectionState === 'connecting' && 'Connecting...'}
                  {callState.connectionState === 'connected' && 'Connected'}
                  {callState.connectionState === 'disconnected' && 'Disconnected'}
                  {callState.connectionState === 'failed' && 'Connection Failed'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          {callState.localStream && callState.callType === 'video' && (
            <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 bg-slate-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-4 rounded-full transition-all ${
                isAudioMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Video Toggle (only for video calls) */}
            {callState.callType === 'video' && (
              <button
                onClick={handleToggleVideo}
                className={`p-4 rounded-full transition-all ${
                  isVideoOff
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all transform hover:scale-110"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Call Info */}
          <div className="mt-4 text-center text-white/60 text-sm">
            <p>
              {callState.callType === 'video' ? 'Video' : 'Audio'} Call •{' '}
              {callState.isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

