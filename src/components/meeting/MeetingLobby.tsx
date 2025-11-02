import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Settings, Camera, FileText, Zap, CheckCircle, Sparkles, Info } from 'lucide-react';
import { webRTCService } from '../../services/webRTCService';
import { FeatureComparisonModal } from './FeatureComparisonModal';

interface MeetingLobbyProps {
  onCreateMeeting: (title: string, description?: string) => void;
  onJoinMeeting: (meetingId: string) => void;
  error: string | null;
  autoJoinMeetingId?: string | null;
}

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  onCreateMeeting,
  onJoinMeeting,
  error,
  autoJoinMeetingId
}) => {
  const [mode, setMode] = useState<'create' | 'join'>(autoJoinMeetingId ? 'join' : 'create');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingId, setMeetingId] = useState(autoJoinMeetingId || '');
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startPreview();
    
    return () => {
      // Cleanup preview stream when component unmounts
      if (previewStream) {
        previewStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []); // Only run on mount/unmount

  useEffect(() => {
    if (previewStream && videoRef.current) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const startPreview = async () => {
    try {
      const stream = await webRTCService.startLocalStream(true, true);
      setPreviewStream(stream);
    } catch (err) {
      console.error('Error starting preview:', err);
    }
  };

  const togglePreviewAudio = () => {
    if (previewStream) {
      const audioTrack = previewStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isAudioMuted;
        setIsAudioMuted(!isAudioMuted);
      }
    }
  };

  const togglePreviewVideo = async () => {
    if (!previewStream) return;

    if (!isVideoOff) {
      // Turning video OFF - stop the track
      const videoTrack = previewStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        previewStream.removeTrack(videoTrack);
      }
      setIsVideoOff(true);
    } else {
      // Turning video ON - get new track
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        const newVideoTrack = newStream.getVideoTracks()[0];
        previewStream.addTrack(newVideoTrack);
        
        if (videoRef.current) {
          videoRef.current.srcObject = previewStream;
        }
        
        setIsVideoOff(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create' && title) {
      onCreateMeeting(title, description);
    } else if (mode === 'join' && meetingId) {
      onJoinMeeting(meetingId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Preview */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative aspect-video bg-gray-900">
            {!isVideoOff && previewStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            
            {/* Preview Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <button
                onClick={togglePreviewAudio}
                className={`p-4 rounded-full transition-all ${
                  isAudioMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isAudioMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={togglePreviewVideo}
                className={`p-4 rounded-full transition-all ${
                  isVideoOff
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
          
          <div className="p-6 text-center">
            <p className="text-gray-300 text-sm">
              Check your camera and microphone before joining
            </p>
          </div>
        </div>

        {/* Meeting Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Video Meeting
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect with your team through high-quality video calls
                </p>
              </div>
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium shadow-md"
                title="See how we compare"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Why Us?</span>
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                mode === 'create'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Create Meeting
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                mode === 'join'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Join Meeting
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'create' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Team Standup"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this meeting about?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!title}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Create & Join Meeting
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting ID *
                  </label>
                  <input
                    type="text"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    placeholder="Enter meeting ID"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!meetingId}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Join Meeting
                </button>
              </>
            )}
          </form>

          {/* Enhanced Features Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
                    ✨ NEW: AI-Powered Scribe
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Automatic speech-to-text transcription with AI summaries. Better than Zoom and Google Meet!
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Why Choose Us Over Zoom & Google Meet?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">AI Scribe</span>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Live transcription + AI summaries. Zoom needs add-ons, Google Meet is paid-only.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Collaborative Whiteboard</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Draw & brainstorm together - built-in!</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">No Downloads Required</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Works in any browser instantly</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Always Free</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">No time limits or participant caps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Modal */}
      <FeatureComparisonModal isOpen={showComparison} onClose={() => setShowComparison(false)} />

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

