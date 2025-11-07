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

  // Handle call disconnection when remote user hangs up
  useEffect(() => {
    if (!isOpen) return;
    
    // Check if call was disconnected
    if (callState.connectionState === 'closed' || callState.connectionState === 'failed') {
      // Call was disconnected - close after a brief delay to show status
      const timer = setTimeout(() => {
        onEndCall();
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [callState.connectionState, isOpen, onEndCall, onClose]);

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
    try {
      await callService.endCall();
      onEndCall();
      onClose();
    } catch (error) {
      console.error('Error ending call:', error);
      // Still close the modal even if there's an error
      onEndCall();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col">
        {/* Remote Video */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {callState.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              muted={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                {remoteUserPhotoURL ? (
                  <img
                    src={remoteUserPhotoURL}
                    alt={remoteUserName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {remoteUserName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">{remoteUserName}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    callState.connectionState === 'connected' ? 'bg-green-400 animate-pulse' :
                    callState.connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'
                  }`} />
                  <p className="text-gray-300 text-sm sm:text-base">
                    {callState.connectionState === 'connecting' && 'Connecting...'}
                    {callState.connectionState === 'connected' && 'Connected'}
                    {callState.connectionState === 'disconnected' && 'Disconnected'}
                    {callState.connectionState === 'failed' && 'Connection Failed'}
                    {callState.connectionState === 'closed' && 'Call Ended'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          {callState.localStream && callState.callType === 'video' && !isVideoOff && (
            <div className="absolute top-4 right-4 w-32 h-24 sm:w-48 sm:h-36 md:w-56 md:h-40 rounded-xl overflow-hidden border-2 border-white/30 bg-slate-800 shadow-2xl hover:scale-105 transition-transform">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Video off indicator */}
              {isVideoOff && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-4 sm:p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-3 sm:p-4 rounded-full transition-all shadow-lg ${
                isAudioMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
              }`}
              title={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Video Toggle (only for video calls) */}
            {callState.callType === 'video' && (
              <button
                onClick={handleToggleVideo}
                className={`p-3 sm:p-4 rounded-full transition-all shadow-lg ${
                  isVideoOff
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                }`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            )}

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="p-3 sm:p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all transform hover:scale-110 shadow-xl"
              title="End Call"
            >
              <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Call Info */}
          <div className="mt-3 sm:mt-4 text-center text-white/70 text-xs sm:text-sm">
            <p className="font-medium">
              {callState.callType === 'video' ? 'Video' : 'Audio'} Call •{' '}
              <span className={callState.isConnected ? 'text-green-400' : 'text-yellow-400'}>
                {callState.isConnected ? 'Connected' : callState.connectionState === 'connecting' ? 'Connecting...' : callState.connectionState}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

