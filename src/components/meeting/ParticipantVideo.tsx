import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, VideoOff, Monitor, Hand, Crown, Pin, X, Minimize2, Maximize2 } from 'lucide-react';
import { VideoMeetingParticipant } from '../../types/videoMeeting';

interface ParticipantVideoProps {
  participant: VideoMeetingParticipant;
  stream: MediaStream | null | undefined;
  isLocal?: boolean;
  className?: string;
  isPinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
  onResize?: (size: 'small' | 'medium' | 'large') => void;
  size?: 'small' | 'medium' | 'large';
}

export const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  stream,
  isLocal = false,
  className = '',
  isPinned = false,
  onPin,
  onUnpin,
  onResize,
  size = 'medium'
}) => {
  // Handle undefined participant gracefully
  if (!participant) {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-gray-900 group ${className}`}>
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <div className="text-white text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (videoRef.current && stream) {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      console.log('📹 Setting video srcObject for', isLocal ? 'local' : 'remote', 'stream:', {
        streamId: stream.id,
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        active: stream.active,
        videoTrackStates: videoTracks.map(t => ({
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState
        })),
        audioTrackStates: audioTracks.map(t => ({
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState
        }))
      });

      // Check and fix track states
      videoTracks.forEach(track => {
        if (!track.enabled) {
          console.warn('⚠️ Video track is disabled, enabling:', track.id);
          track.enabled = true;
        }
        // Unmute if muted (remote tracks might be muted during connection)
        if (track.muted && track.readyState === 'live') {
          console.warn('⚠️ Video track is muted, trying to unmute:', track.id);
          // Track muted state is usually read-only, but we can check if it unmutes
        }
      });

      audioTracks.forEach(track => {
        if (!track.enabled) {
          console.warn('⚠️ Audio track is disabled, enabling:', track.id);
          track.enabled = true;
        }
        // Unmute if muted (remote tracks might be muted during connection)
        if (track.muted && track.readyState === 'live') {
          console.warn('⚠️ Audio track is muted:', track.id);
        }
      });

      // Monitor stream active state changes
      const onActive = () => {
        console.log('✅ Stream became active');
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(err => console.warn('Play failed:', err));
        }
      };

      const onInactive = () => {
        console.warn('⚠️ Stream became inactive');
      };

      stream.addEventListener('active', onActive);
      stream.addEventListener('inactive', onInactive);

      // Monitor track unmute events to ensure playback
      const trackUnmuteHandlers: Map<MediaStreamTrack, () => void> = new Map();
      const handleTrackUnmute = (track: MediaStreamTrack) => {
        console.log(`🔊 Track ${track.kind} unmuted, checking video playback`);
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(err => console.warn('Play failed on unmute:', err));
        }
        // If it's a video track, ensure it's playing
        if (track.kind === 'video' && videoRef.current) {
          videoRef.current.play().catch(err => console.warn('Video play failed on unmute:', err));
        }
      };

      // Monitor all tracks for unmute
      stream.getTracks().forEach(track => {
        const unmuteHandler = () => handleTrackUnmute(track);
        track.addEventListener('unmute', unmuteHandler);
        trackUnmuteHandlers.set(track, unmuteHandler);
        console.log(`👂 Monitoring ${track.kind} track for unmute events:`, track.id);
      });

      // Set stream on video element - keep it simple
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        
        // Simple play function
        const playVideo = async () => {
          if (video && video.paused) {
            try {
              await video.play();
            } catch (err) {
              // Will play when ready
            }
          }
        };

        // Play when ready
        const onCanPlay = () => {
          playVideo();
        };

        video.addEventListener('canplay', onCanPlay);
        
        // Try immediately
        playVideo();

        return () => {
          video.removeEventListener('canplay', onCanPlay);
          stream.removeEventListener('active', onActive);
          stream.removeEventListener('inactive', onInactive);
          // Remove track unmute listeners
          trackUnmuteHandlers.forEach((handler, track) => {
            track.removeEventListener('unmute', handler);
          });
          trackUnmuteHandlers.clear();
        };
      }
    } else if (videoRef.current) {
      // Clear video if no stream
      videoRef.current.srcObject = null;
    }
  }, [stream, isLocal]);

  useEffect(() => {
    if (!stream || !participant || participant.isMuted) {
      setAudioLevel(0);
      return;
    }

    // Check if stream has audio tracks
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setAudioLevel(0);
      return;
    }

    // Monitor audio level
    let animationFrame: number;
    let audioContext: AudioContext | null = null;
    
    try {
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationFrame = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.warn('Audio monitoring error:', error);
      setAudioLevel(0);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [stream, participant.isMuted]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Simplified: if we have a stream with tracks, try to show video
  // Don't require readyState to be 'live' immediately - let the video element handle it
  const hasVideoTracks = stream && stream.getVideoTracks().length > 0;
  const hasAudioTracks = stream && stream.getAudioTracks().length > 0;
  const showVideo = stream && hasVideoTracks;

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 group ${className}`}>
      {/* Video or Avatar */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${participant.isScreenSharing ? 'object-contain bg-black' : 'object-cover'} ${isLocal && !participant.isScreenSharing ? 'mirror' : ''}`}
          style={{ transform: isLocal && !participant.isScreenSharing ? 'scaleX(-1)' : 'none' }}
          onPlay={() => console.log('▶️ Video started playing for', participant.name)}
          onPause={() => console.warn('⏸️ Video paused for', participant.name)}
          onError={(e) => console.error('❌ Video error for', participant.name, ':', e)}
          onCanPlay={() => console.log('✅ Video can play for', participant.name)}
          onWaiting={() => console.warn('⏳ Video waiting for data for', participant.name)}
          onStalled={() => console.warn('⚠️ Video stalled for', participant.name)}
        />
      ) : !participant.isCameraOff && !stream ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <div className="text-white text-sm">Connecting...</div>
          <div className="text-gray-400 text-xs mt-1">{participant.name}</div>
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${
          participant.avatarType === 'Innovation' 
            ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
            : participant.avatarType === 'Professional'
            ? 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700'
            : participant.avatarType === 'Creative'
            ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
            : 'bg-gradient-to-br from-blue-600 to-purple-600'
        }`}>
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {getInitials(participant.name)}
            </div>
          )}
          {/* Avatar Type Indicator */}
          {participant.avatarType && (
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-semibold">
              {participant.avatarType}
            </div>
          )}
        </div>
      )}

      {/* Speaking Indicator */}
      {!participant.isMuted && audioLevel > 0.1 && (
        <div 
          className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none transition-opacity"
          style={{ opacity: Math.min(audioLevel * 2, 1) }}
        />
      )}

      {/* Overlay Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex gap-2 pointer-events-auto">
          {participant.isHost && (
            <div className="bg-yellow-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold">
              <Crown className="w-3 h-3" />
              Host
            </div>
          )}
          {participant.isScreenSharing && (
            <div className="bg-blue-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold">
              <Monitor className="w-3 h-3" />
              Sharing
            </div>
          )}
          {participant.isHandRaised && (
            <div className="bg-orange-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold animate-bounce">
              <Hand className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Pin/Unpin Button */}
        {!isPinned && onPin && (
          <div className="absolute top-3 left-3 pointer-events-auto">
            <button
              onClick={onPin}
              className="bg-gray-700/90 hover:bg-gray-600/90 text-white p-2 rounded-full transition-colors"
              title="Pin this video"
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Unpin and Resize Controls */}
        {isPinned && onUnpin && (
          <div className="absolute top-3 left-3 flex gap-2 pointer-events-auto">
            <button
              onClick={onUnpin}
              className="bg-gray-700/90 hover:bg-gray-600/90 text-white p-2 rounded-full transition-colors"
              title="Unpin this video"
            >
              <X className="w-4 h-4" />
            </button>
            {onResize && (
              <div className="flex bg-gray-700/90 rounded-full overflow-hidden">
                <button
                  onClick={() => onResize('small')}
                  className={`p-2 transition-colors ${size === 'small' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                  title="Small"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onResize('medium')}
                  className={`p-2 transition-colors ${size === 'medium' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                  title="Medium"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onResize('large')}
                  className={`p-2 transition-colors ${size === 'large' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                  title="Large"
                >
                  <Maximize2 className="w-4 h-4 text-white rotate-90" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium truncate">
                {participant.name} {isLocal && '(You)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {participant.isMuted ? (
                <div className="bg-red-500/90 p-1.5 rounded-full">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="bg-gray-700/90 p-1.5 rounded-full">
                  <Mic className="w-3 h-3 text-white" />
                </div>
              )}
              {participant.isCameraOff && (
                <div className="bg-red-500/90 p-1.5 rounded-full">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

