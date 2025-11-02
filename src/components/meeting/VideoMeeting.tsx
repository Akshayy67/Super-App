import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  Phone,
  Grid3x3,
  User,
  Hand,
  MoreVertical,
  Copy,
  Check,
  Camera,
  X,
  Maximize2,
  Minimize2,
  Expand,
  Square,
  FileText
} from 'lucide-react';
import { videoMeetingService } from '../../services/videoMeetingService';
import { webRTCService } from '../../services/webRTCService';
import { webRTCSignalingService } from '../../services/webRTCSignalingService';
import { realTimeAuth } from '../../utils/realTimeAuth';
import { VideoMeeting as VideoMeetingType, VideoMeetingParticipant, ViewMode } from '../../types/videoMeeting';
import { ParticipantVideo } from './ParticipantVideo';
import { MeetingChat } from './MeetingChat';
import { MeetingControls } from './MeetingControls';
import { MeetingLobby } from './MeetingLobby';
import { ParticipantsList } from './ParticipantsList';
import { MeetingSettings } from './MeetingSettings';
import { SharedWhiteboard } from './SharedWhiteboard';
import { AvatarSelector } from './AvatarSelector';
import { meetingTranscriptionService } from '../../services/meetingTranscriptionService';

export const VideoMeeting: React.FC = () => {
  const [meeting, setMeeting] = useState<VideoMeetingType | null>(null);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [whiteboardSize, setWhiteboardSize] = useState<'small' | 'medium' | 'large' | 'fullscreen'>('medium');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatarType, setSelectedAvatarType] = useState<'Innovation' | 'Professional' | 'Creative' | 'Default'>('Default');
  const [isInLobby, setIsInLobby] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isScribing, setIsScribing] = useState(false);
  const [showLiveTranscript, setShowLiveTranscript] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinMeetingId, setAutoJoinMeetingId] = useState<string | null>(null);
  const [skipLobby, setSkipLobby] = useState(false);
  const hasAutoJoinedRef = useRef(false);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
  const [pinnedSize, setPinnedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showScribeBanner, setShowScribeBanner] = useState(true);

  const user = realTimeAuth.getCurrentUser();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Check URL for meeting ID on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const meetingIdFromUrl = urlParams.get('id');
    const shouldSkipLobby = urlParams.get('skipLobby') === 'true';
    
    if (meetingIdFromUrl) {
      setAutoJoinMeetingId(meetingIdFromUrl);
      setSkipLobby(shouldSkipLobby);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Auto-join if skipLobby is true - only once
  useEffect(() => {
    if (skipLobby && autoJoinMeetingId && user && !hasAutoJoinedRef.current && isInLobby) {
      hasAutoJoinedRef.current = true;
      const timer = setTimeout(() => {
        if (isInLobby) {
          handleJoinMeeting(autoJoinMeetingId);
        } else {
          hasAutoJoinedRef.current = false;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipLobby, autoJoinMeetingId, user]);

  useEffect(() => {
    return () => {
      if (currentMeetingId && user) {
        handleLeaveMeeting();
      }
    };
  }, []);

  useEffect(() => {
    if (currentMeetingId && user && localStream) {
      let prevMeeting: VideoMeetingType | null = null;
      let isFirstUpdate = true;
      
      const unsubscribe = videoMeetingService.subscribeMeeting(currentMeetingId, (updatedMeeting) => {
        if (updatedMeeting) {
          setMeeting(updatedMeeting);
          
          if (updatedMeeting.status === 'ended') {
            handleMeetingEnded();
            return;
          }

          const currentParticipantIds = Object.keys(updatedMeeting.participants).filter(id => id !== user.id);
          
          if (isFirstUpdate) {
            // First time receiving meeting data - connect to all existing participants
            console.log('🔗 First meeting update, connecting to all participants:', currentParticipantIds);
            currentParticipantIds.forEach((participantId, index) => {
              // Stagger connections to avoid overwhelming the system
              setTimeout(() => {
                if (currentMeetingId && !connectingParticipantsRef.current.has(participantId)) {
                  connectToParticipant(participantId);
                }
              }, index * 500 + 500);
            });
            isFirstUpdate = false;
          } else if (prevMeeting) {
            // Connect to new participants only
            const prevParticipantIds = new Set(Object.keys(prevMeeting.participants));
            const newParticipants = currentParticipantIds.filter(id => !prevParticipantIds.has(id));
            
            if (newParticipants.length > 0) {
              console.log('🆕 New participants joined:', newParticipants);
              newParticipants.forEach((participantId, index) => {
                setTimeout(() => {
                  if (currentMeetingId && !connectingParticipantsRef.current.has(participantId)) {
                    connectToParticipant(participantId);
                  }
                }, index * 500 + 500);
              });
            }
          }
          
          prevMeeting = updatedMeeting;
        } else {
          setError('Meeting not found');
        }
      });

      return () => {
        unsubscribe();
        connectingParticipantsRef.current.clear();
      };
    }
  }, [currentMeetingId, user, localStream]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const handleCreateMeeting = async (title: string, description?: string) => {
    if (!user) return;

    try {
      setError(null);
      const meetingId = await videoMeetingService.createMeeting(
        user.id,
        user.username || user.email,
        title,
        description
      );
      
      await joinMeetingSession(meetingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    if (currentMeetingId === meetingId && !isInLobby) {
      return;
    }
    try {
      setError(null);
      await joinMeetingSession(meetingId);
    } catch (err) {
      console.error('Error in handleJoinMeeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to join meeting');
      setIsInLobby(true);
      hasAutoJoinedRef.current = false;
    }
  };

  const joinMeetingSession = async (meetingId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Start local stream - this sets it in webRTCService
      const stream = await webRTCService.startLocalStream(true, true);
      setLocalStream(stream);

      // Set up WebRTC callbacks BEFORE joining meeting
      webRTCService.onRemoteStream((userId, stream) => {
        console.log('📹 Received remote stream from:', userId, {
          streamId: stream.id,
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
          active: stream.active,
          totalTracks: stream.getTracks().length
        });
        
        // Always add stream if it exists - don't wait for tracks to be ready
        // The video element will handle track state
        if (stream) {
          console.log('✅ Adding stream to remote streams');
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.set(userId, stream);
            console.log('📊 Remote streams count:', newMap.size);
            return newMap;
          });
        }
      });

      webRTCService.onConnectionStateChange((userId, state) => {
        console.log('🔗 Connection state for', userId, ':', state);
        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        }
      });

      // Join meeting in Firestore
      await videoMeetingService.joinMeeting(
        meetingId,
        user.id,
        user.username || user.email,
        user.email,
        undefined // photoURL not available in User type
      );

      setCurrentMeetingId(meetingId);
      setIsInLobby(false);

      // Setup WebRTC signaling - this must happen after joining
      setupWebRTCSignaling(meetingId);

      // Start transcription (only if not already transcribing)
      if (!isTranscribing) {
        setIsTranscribing(true);
        try {
          meetingTranscriptionService.startTranscription(meetingId, (updatedTranscript) => {
            setTranscript(updatedTranscript);
            if (updatedTranscript) {
              videoMeetingService.updateMeetingTranscript(meetingId, updatedTranscript);
            }
          });
        } catch (err) {
          console.warn('Could not start transcription:', err);
          setIsTranscribing(false);
        }
      }
    } catch (err) {
      console.error('Error joining meeting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to join meeting');
      webRTCService.stopLocalStream();
      setIsInLobby(true);
      setCurrentMeetingId(null);
      hasAutoJoinedRef.current = false;
      throw err;
    }
  };

  const setupWebRTCSignaling = (meetingId: string) => {
    if (!user) return;

    const unsubscribe = webRTCSignalingService.subscribeToSignals(
      meetingId,
      user.id,
      async (signal) => {
        try {
          if (signal.type === 'offer') {
            await handleOffer(signal.senderId, signal.data, meetingId);
          } else if (signal.type === 'answer') {
            await handleAnswer(signal.senderId, signal.data, meetingId);
          } else if (signal.type === 'ice-candidate') {
            await handleIceCandidate(signal.senderId, signal.data);
          }
        } catch (err) {
          console.error('Error handling signal:', err);
        }
      }
    );

    return unsubscribe;
  };

  const handleOffer = async (senderId: string, offer: RTCSessionDescriptionInit, meetingId: string) => {
    if (!user || !meetingId) {
      console.log('Cannot handle offer - missing requirements:', {
        hasUser: !!user,
        hasMeetingId: !!meetingId
      });
      return;
    }

    // Check if we're already in the process of connecting to this participant
    // If so, and we're the offerer, cancel our connection attempt
    if (connectingParticipantsRef.current.has(senderId)) {
      console.log('⚠️ Already connecting to', senderId, '- canceling our connection to accept their offer');
      // Remove from connecting set and let the offer handler proceed
      connectingParticipantsRef.current.delete(senderId);
    }

    // Get local stream from service (more reliable than component state)
    let streamToUse = localStream || webRTCService.getLocalStream();
    
    // Wait for local stream to be ready if not available
    if (!streamToUse) {
      console.log('⏳ Local stream not ready, waiting...');
      // Wait for local stream with a timeout
      let attempts = 0;
      const maxAttempts = 10;
      while (!streamToUse && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        streamToUse = webRTCService.getLocalStream();
        attempts++;
      }
      
      if (!streamToUse) {
        console.error('❌ Local stream not available after waiting');
        return;
      }
      
      // Update component state if stream was found in service
      if (!localStream && streamToUse) {
        setLocalStream(streamToUse);
      }
    }

    try {
      console.log('📨 Handling offer from:', senderId);
      
      // Check if we already have a connection to this user
      const existingPC = webRTCService.getPeerConnection(senderId);
      if (existingPC) {
        const signalingState = existingPC.signalingState;
        const connState = existingPC.connectionState;
        
        // If connection is stable and connected, we're good - ignore the offer
        if (signalingState === 'stable' && (connState === 'connected' || connState === 'connecting')) {
          console.log('✅ Already have stable connection to', senderId, '- ignoring duplicate offer');
          return;
        }
        
        // If we have an active connection that's not stable, close it and recreate
        if (signalingState !== 'stable' && signalingState !== 'closed') {
          console.log('⚠️ Already have active connection to', senderId, '- closing and recreating');
          webRTCService.closePeerConnection(senderId);
        }
      }
      
      // Create peer connection - this automatically adds local stream tracks
      webRTCService.createPeerConnection(senderId, async (candidate) => {
        console.log('🧊 Sending ICE candidate in response to:', senderId);
        try {
          await webRTCSignalingService.sendIceCandidate(
            meetingId,
            user.id,
            senderId,
            candidate
          );
        } catch (err) {
          console.error('❌ Error sending ICE candidate:', err);
        }
      });

      console.log('📥 Setting remote description (offer) from:', senderId);
      await webRTCService.setRemoteDescription(senderId, offer);
      
      console.log('📤 Creating answer for:', senderId);
      const answer = await webRTCService.createAnswer(senderId);
      
      console.log('📤 Sending answer to:', senderId);
      await webRTCSignalingService.sendAnswer(
        meetingId,
        user.id,
        senderId,
        answer
      );
      
      console.log('✅ Offer/Answer exchange completed with', senderId);
    } catch (err) {
      console.error('❌ Error handling offer from', senderId, ':', err);
      // Clean up on error
      webRTCService.closePeerConnection(senderId);
    }
  };

  const handleAnswer = async (senderId: string, answer: RTCSessionDescriptionInit, meetingId: string) => {
    if (!user || !meetingId) {
      console.log('Cannot handle answer - missing requirements:', {
        hasUser: !!user,
        hasMeetingId: !!meetingId
      });
      return;
    }

    // Check if peer connection exists
    const existingPC = webRTCService.getPeerConnection(senderId);
    if (!existingPC) {
      console.warn('⚠️ No peer connection found for', senderId, 'when handling answer - this may be normal if we received answer before creating connection');
      // This can happen in race conditions - just log and return
      return;
    }

    try {
      console.log('📥 Handling answer from:', senderId);
      
      // Check if we're in the right signaling state to accept an answer
      const signalingState = existingPC.signalingState;
      if (signalingState !== 'have-local-offer') {
        console.warn(`⚠️ Unexpected signaling state when handling answer from ${senderId}: ${signalingState}`);
        
        // If we're in 'stable' state, it might mean we already processed this answer
        if (signalingState === 'stable') {
          console.log('✅ Connection already stable, answer may have been processed');
          return;
        }
        
        // If we're waiting for an offer but got an answer, we might be in a race condition
        if (signalingState === 'have-remote-offer') {
          console.log('⚠️ Received answer but we\'re waiting for offer - ignoring answer');
          return;
        }
      }
      
      await webRTCService.setRemoteDescription(senderId, answer);
      console.log('✅ Answer processed successfully from:', senderId);
    } catch (err) {
      console.error('❌ Error handling answer from', senderId, ':', err);
      // If answer fails due to wrong state, try to reconnect
      if (err instanceof Error && (err.message.includes('invalid state') || err.message.includes('InvalidStateError'))) {
        console.log('🔄 Attempting to reconnect to', senderId);
        setTimeout(() => {
          if (meetingId && !connectingParticipantsRef.current.has(senderId)) {
            connectToParticipant(senderId);
          }
        }, 1000);
      }
    }
  };

  const handleIceCandidate = async (senderId: string, candidate: RTCIceCandidate) => {
    try {
      await webRTCService.addIceCandidate(senderId, candidate);
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  };

  const connectingParticipantsRef = useRef<Set<string>>(new Set());

  const connectToParticipant = async (participantId: string) => {
    if (!user || !currentMeetingId || !localStream) {
      console.log('Cannot connect to participant - missing requirements:', {
        hasUser: !!user,
        hasMeetingId: !!currentMeetingId,
        hasLocalStream: !!localStream
      });
      return;
    }

    // Prevent duplicate connections to the same participant
    if (connectingParticipantsRef.current.has(participantId)) {
      console.log('⏭️ Already connecting to participant:', participantId);
      return;
    }

    // Check if we already have a stable connection before attempting to connect
    const existingPC = webRTCService.getPeerConnection(participantId);
    if (existingPC) {
      const signalingState = existingPC.signalingState;
      const connState = existingPC.connectionState;
      const iceState = existingPC.iceConnectionState;
      
      // If connection is stable or connected, don't recreate
      if (signalingState === 'stable' && (connState === 'connected' || connState === 'connecting') && iceState !== 'failed' && iceState !== 'disconnected') {
        console.log(`⏭️ Skipping connection - already connected to ${participantId}`);
        return;
      }
      
      // If we're in 'have-remote-offer' state, it means we're already handling their offer
      // Don't send our own offer in this case
      if (signalingState === 'have-remote-offer') {
        console.log(`⏭️ Skipping connection - already handling offer from ${participantId}`);
        return;
      }
    }

    connectingParticipantsRef.current.add(participantId);

    try {
      console.log('🔗 Connecting to participant:', participantId);
      
      // Check again after a short delay - if we received an offer in the meantime, abort
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const checkPC = webRTCService.getPeerConnection(participantId);
      if (checkPC && checkPC.signalingState === 'have-remote-offer') {
        console.log('⚠️ Received offer while connecting - aborting our connection attempt');
        connectingParticipantsRef.current.delete(participantId);
        return;
      }
      
      // Close invalid connection before recreating
      if (existingPC) {
        const connState = existingPC.connectionState;
        const iceState = existingPC.iceConnectionState;
        
        if (connState === 'closed' || connState === 'failed' || iceState === 'failed' || iceState === 'disconnected') {
          console.log(`🔄 Closing invalid connection to ${participantId} before recreating`);
          webRTCService.closePeerConnection(participantId);
        }
      }
      
      // Create peer connection - this automatically adds local stream tracks
      console.log(`🔧 Creating peer connection to ${participantId}`);
      webRTCService.createPeerConnection(participantId, async (candidate) => {
        console.log('🧊 Sending ICE candidate to:', participantId);
        try {
          await webRTCSignalingService.sendIceCandidate(
            currentMeetingId,
            user.id,
            participantId,
            candidate
          );
        } catch (err) {
          console.error('❌ Error sending ICE candidate:', err);
        }
      });

      // Create and send offer
      console.log('📤 Creating offer for:', participantId);
      const offer = await webRTCService.createOffer(participantId);
      console.log('📤 Sending offer to:', participantId, '- offer type:', offer.type);
      await webRTCSignalingService.sendOffer(
        currentMeetingId,
        user.id,
        participantId,
        offer
      );
      
      console.log('✅ Connection initiated to', participantId);
      // Mark as connected after a delay to allow for connection establishment
      setTimeout(() => {
        connectingParticipantsRef.current.delete(participantId);
      }, 5000);
    } catch (err) {
      console.error('❌ Error connecting to participant:', participantId, err);
      webRTCService.closePeerConnection(participantId);
      connectingParticipantsRef.current.delete(participantId);
    }
  };

  const handleLeaveMeeting = async () => {
    if (!user || !currentMeetingId) {
      // If no meeting, just return to lobby
      setIsInLobby(true);
      return;
    }

    const meetingIdToSave = currentMeetingId; // Save meeting ID before clearing
    const wasScribing = isScribing; // Save scribe state before clearing

    try {
      // Stop transcription and save if scribe was active BEFORE leaving meeting
      if (wasScribing) {
        meetingTranscriptionService.stopTranscription();
        setIsTranscribing(false);
        setIsScribing(false);
        
        // Save transcript and generate AI summary
        const finalTranscript = meetingTranscriptionService.getFullTranscript();
        if (finalTranscript.trim()) {
          try {
            // Save transcript
            await videoMeetingService.updateMeetingTranscript(meetingIdToSave, finalTranscript);
            console.log('✅ Transcript saved on leave');
            
            // Generate AI summary
            const summary = await meetingTranscriptionService.generateAISummary(finalTranscript);
            if (summary) {
              await videoMeetingService.updateMeetingSummary(meetingIdToSave, summary);
              console.log('✅ AI summary saved on leave');
            }
          } catch (err) {
            console.error('Error saving transcript/summary on leave:', err);
          }
        }
      }

      // Leave meeting in Firestore
      await videoMeetingService.leaveMeeting(meetingIdToSave, user.id, user.username || user.email);
      
      // Stop all media streams
      webRTCService.stopLocalStream();
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Clean up peer connections
      setLocalStream(null);
      setRemoteStreams(new Map());
      setCurrentMeetingId(null);
      setMeeting(null);
      
      // Return to lobby
      setIsInLobby(true);
      hasAutoJoinedRef.current = false;
      
      // Stop transcription if not already stopped and clean up transcript state
      if (!wasScribing) {
        meetingTranscriptionService.stopTranscription();
        setIsTranscribing(false);
      }
      setTranscript('');
      setInterimTranscript('');
      setShowLiveTranscript(false);
      
      // Navigate back or show lobby
      window.history.pushState({}, '', '/meeting');
    } catch (err) {
      console.error('Error leaving meeting:', err);
      // Even if there's an error, clean up local state
      setIsInLobby(true);
      setCurrentMeetingId(null);
      setMeeting(null);
    }
  };

  const handleMeetingEnded = () => {
    handleLeaveMeeting();
    alert('The meeting has ended');
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isAudioMuted;
        setIsAudioMuted(!isAudioMuted);
      }
    }
  };

  const toggleVideo = async () => {
    if (!localStream) return;

    if (!isVideoOff) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        localStream.removeTrack(videoTrack);
      }
      setIsVideoOff(true);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        const newVideoTrack = newStream.getVideoTracks()[0];
        localStream.addTrack(newVideoTrack);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        setIsVideoOff(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!user || !currentMeetingId) return;
    
    if (!isScreenSharing) {
      try {
        // Use WebRTC service to start screen share
        const stream = await webRTCService.startScreenShare();
        setScreenStream(stream);
        setIsScreenSharing(true);

        // Update Firestore state
        await videoMeetingService.updateParticipantState(
          currentMeetingId,
          user.id,
          { isScreenSharing: true }
        );

        // Handle user stopping screen share via browser UI
        stream.getVideoTracks()[0].addEventListener('ended', async () => {
          webRTCService.stopScreenShare();
          setScreenStream(null);
          setIsScreenSharing(false);
          // Update Firestore state
          if (currentMeetingId && user) {
            await videoMeetingService.updateParticipantState(
              currentMeetingId,
              user.id,
              { isScreenSharing: false }
            );
          }
        });
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    } else {
      // Stop screen share using service
      webRTCService.stopScreenShare();
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      
      // Update Firestore state
      if (currentMeetingId && user) {
        await videoMeetingService.updateParticipantState(
          currentMeetingId,
          user.id,
          { isScreenSharing: false }
        );
      }
    }
  };

  const toggleHandRaise = async () => {
    if (!user || !currentMeetingId) return;
    const participant = meeting?.participants[user.id];
    if (!participant) return;

    await videoMeetingService.updateParticipantState(
      currentMeetingId,
      user.id,
      { isHandRaised: !participant.isHandRaised }
    );
  };

  const toggleScribe = async () => {
    if (!currentMeetingId) return;

    if (!isScribing) {
      // Start scribe
      setIsScribing(true);
      setIsTranscribing(true);
      setShowLiveTranscript(true);
      
      try {
        await meetingTranscriptionService.startTranscription(
          currentMeetingId,
          (updatedTranscript, interimTranscript) => {
            setTranscript(updatedTranscript);
            setInterimTranscript(interimTranscript || '');
          }
        );
        console.log('✅ Scribe started successfully');
      } catch (err) {
        console.error('Error starting scribe:', err);
        setIsScribing(false);
        setIsTranscribing(false);
        setShowLiveTranscript(false);
      }
    } else {
      // Stop scribe
      setIsScribing(false);
      setIsTranscribing(false);
      setInterimTranscript('');
      meetingTranscriptionService.stopTranscription();
      
      // Save transcript and generate AI summary
      const finalTranscript = meetingTranscriptionService.getFullTranscript();
      if (finalTranscript.trim()) {
        try {
          // Save transcript
          await videoMeetingService.updateMeetingTranscript(currentMeetingId, finalTranscript);
          console.log('✅ Transcript saved');
          
          // Generate AI summary
          const summary = await meetingTranscriptionService.generateAISummary(finalTranscript);
          if (summary) {
            await videoMeetingService.updateMeetingSummary(currentMeetingId, summary);
            console.log('✅ AI summary saved');
          }
        } catch (err) {
          console.error('Error saving transcript/summary:', err);
        }
      }
    }
  };

  const copyMeetingLink = () => {
    if (currentMeetingId) {
      const link = `${window.location.origin}/meeting?id=${currentMeetingId}`;
      navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handlePinParticipant = (participantId: string) => {
    setPinnedParticipant(pinnedParticipant === participantId ? null : participantId);
  };

  const handleResizePinned = (size: 'small' | 'medium' | 'large') => {
    setPinnedSize(size);
  };

  // Timeout for auto-join if it takes too long
  useEffect(() => {
    if (skipLobby && isInLobby && autoJoinMeetingId) {
      const timeout = setTimeout(() => {
        if (isInLobby && skipLobby && !currentMeetingId) {
          console.error('Auto-join timeout');
          setError('Failed to join meeting: Timeout. Please try again.');
          hasAutoJoinedRef.current = false;
          setSkipLobby(false);
        }
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [skipLobby, isInLobby, autoJoinMeetingId, currentMeetingId]);

  if (isInLobby && !skipLobby) {
    return (
      <MeetingLobby
        onCreateMeeting={handleCreateMeeting}
        onJoinMeeting={handleJoinMeeting}
        error={error}
        autoJoinMeetingId={autoJoinMeetingId}
      />
    );
  }
  
  if (isInLobby && skipLobby && !error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (isInLobby && skipLobby && error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-xl">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setSkipLobby(false);
              hasAutoJoinedRef.current = false;
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!meeting || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  const participants = Object.values(meeting.participants);
  const currentParticipant = meeting.participants[user.id];
  const isHost = meeting.hostId === user.id;

  return (
    <div className="h-screen bg-gray-900 flex flex-col relative">
      {/* Scribe Banner */}
      {showScribeBanner && !isScribing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 rounded-lg shadow-2xl border border-green-500 p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-white font-bold text-sm">✨ Try AI-Powered Scribe!</h3>
                <p className="text-green-100 text-xs">Get live transcription + AI summaries. Click the scribe button below!</p>
              </div>
            </div>
            <button
              onClick={() => setShowScribeBanner(false)}
              className="p-1 hover:bg-green-700 rounded-full transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Main video area */}
      <div className="flex-1 flex relative">
        <div className={`flex-1 flex ${pinnedParticipant ? 'flex-row' : 'flex-col'} ${isChatOpen || isParticipantsOpen || isSettingsOpen || isWhiteboardOpen || showLiveTranscript ? 'mr-80' : ''}`}>
          {pinnedParticipant ? (
            // Layout with pinned participant
            <>
              {/* Pinned video on left */}
              <div className={`relative bg-gray-900 h-full ${
                pinnedSize === 'small' ? 'w-80' : pinnedSize === 'medium' ? 'w-[500px]' : 'w-[700px]'
              } border-r border-gray-700 flex-shrink-0`}>
                {pinnedParticipant === user.id ? (
                  <ParticipantVideo
                    participant={currentParticipant}
                    stream={isScreenSharing ? screenStream : localStream}
                    isLocal
                    isPinned
                    onUnpin={() => handlePinParticipant(pinnedParticipant)}
                    onResize={handleResizePinned}
                    size={pinnedSize}
                  />
                ) : (
                  <ParticipantVideo
                    participant={meeting.participants[pinnedParticipant]}
                    stream={remoteStreams.get(pinnedParticipant)}
                    isPinned
                    onUnpin={() => handlePinParticipant(pinnedParticipant)}
                    onResize={handleResizePinned}
                    size={pinnedSize}
                  />
                )}
              </div>
              
              {/* Grid of other participants on right */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full overflow-auto">
                {/* Show local video if not pinned */}
                {pinnedParticipant !== user.id && (
                  <ParticipantVideo
                    participant={currentParticipant}
                    stream={isScreenSharing ? screenStream : localStream}
                    isLocal
                    onPin={() => handlePinParticipant(user.id)}
                  />
                )}

                {/* Remote participants */}
                {Object.keys(meeting.participants)
                  .filter(id => id !== user.id && id !== pinnedParticipant)
                  .map((userId) => {
                    const participant = meeting.participants[userId];
                    const stream = remoteStreams.get(userId);
                    
                    if (!participant) {
                      return null;
                    }
                    
                    return (
                      <ParticipantVideo
                        key={userId}
                        participant={participant}
                        stream={stream}
                        onPin={() => handlePinParticipant(userId)}
                      />
                    );
                  })}
              </div>
            </>
          ) : (
            // Normal grid layout
            <div className="flex-1 p-4 h-full overflow-auto">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                  {/* Local video */}
                  <ParticipantVideo
                    participant={currentParticipant}
                    stream={isScreenSharing ? screenStream : localStream}
                    isLocal
                    onPin={() => handlePinParticipant(user.id)}
                  />

                  {/* Remote participants */}
                  {Object.keys(meeting.participants)
                    .filter(id => id !== user.id)
                    .map((userId) => {
                      const participant = meeting.participants[userId];
                      const stream = remoteStreams.get(userId);
                      
                      if (!participant) {
                        return null;
                      }
                      
                      return (
                        <ParticipantVideo
                          key={userId}
                          participant={participant}
                          stream={stream}
                          onPin={() => handlePinParticipant(userId)}
                        />
                      );
                    })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ParticipantVideo
                    participant={currentParticipant}
                    stream={isScreenSharing ? screenStream : localStream}
                    isLocal
                    className="w-full h-full max-w-6xl"
                    onPin={() => handlePinParticipant(user.id)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 border-l border-gray-700 bg-gray-800">
            <MeetingChat
              meeting={meeting}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}

        {/* Whiteboard Sidebar */}
        {isWhiteboardOpen && (
          <div className={`border-l border-gray-700 bg-gray-800 transition-all duration-300 ${
            whiteboardSize === 'fullscreen' 
              ? 'fixed inset-0 z-50' 
              : whiteboardSize === 'large' 
              ? 'w-[600px]' 
              : whiteboardSize === 'medium' 
              ? 'w-96' 
              : 'w-80'
          }`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Drawing Room</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setWhiteboardSize('small')}
                      className={`p-1.5 rounded transition-colors ${
                        whiteboardSize === 'small' 
                          ? 'bg-gray-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Small"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWhiteboardSize('medium')}
                      className={`p-1.5 rounded transition-colors ${
                        whiteboardSize === 'medium' 
                          ? 'bg-gray-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Medium"
                    >
                      <Expand className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWhiteboardSize('large')}
                      className={`p-1.5 rounded transition-colors ${
                        whiteboardSize === 'large' 
                          ? 'bg-gray-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Large"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWhiteboardSize('fullscreen')}
                      className={`p-1.5 rounded transition-colors ${
                        whiteboardSize === 'fullscreen' 
                          ? 'bg-gray-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Fullscreen"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsWhiteboardOpen(false)}
                    className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <SharedWhiteboard
                  sessionId={currentMeetingId || undefined}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Participants Sidebar */}
        {isParticipantsOpen && (
          <div className="w-80 border-l border-gray-700 bg-gray-800">
            <ParticipantsList
              meeting={meeting}
              currentUserId={user.id}
              onClose={() => setIsParticipantsOpen(false)}
            />
          </div>
        )}

        {/* Settings Sidebar */}
        {isSettingsOpen && isHost && (
          <div className="w-80 border-l border-gray-700 bg-gray-800">
            <MeetingSettings
              meeting={meeting}
              isHost={isHost}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>
        )}

        {/* Live Transcript Sidebar */}
        {showLiveTranscript && isScribing && (
          <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Live Transcript
              </h3>
              <button
                onClick={() => setShowLiveTranscript(false)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-gray-900 rounded-lg p-4 min-h-32 max-h-full overflow-y-auto">
                {(transcript || interimTranscript) ? (
                  <div className="text-base leading-relaxed text-white">
                    <span className="text-gray-100">{transcript}</span>
                    <span className="text-blue-400 opacity-75">
                      {interimTranscript}
                    </span>
                    <span className="inline-block w-0.5 h-5 bg-blue-500 animate-pulse ml-1"></span>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 italic mb-4">
                      Speak now and your words will appear here...
                    </p>
                    {navigator.userAgent.toLowerCase().includes('chrome') ? (
                      <p className="text-xs text-green-400">
                        ✓ Using Chrome - best compatibility
                      </p>
                    ) : navigator.userAgent.toLowerCase().includes('edge') ? (
                      <p className="text-xs text-green-400">
                        ✓ Using Edge - good compatibility
                      </p>
                    ) : navigator.userAgent.toLowerCase().includes('safari') ? (
                      <p className="text-xs text-yellow-400">
                        ⚠ Using Safari - limited features
                      </p>
                    ) : (
                      <p className="text-xs text-yellow-400">
                        ⚠ For best results, use Chrome or Edge
                      </p>
                    )}
                  </div>
                )}
              </div>
              {(transcript || interimTranscript) && (
                <div className="mt-3 flex justify-between text-xs text-gray-400 pt-3 border-t border-gray-700">
                  <span>
                    Words: {(transcript + interimTranscript).trim().split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                  {isScribing && (
                    <span className="text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Recording
                    </span>
                  )}
                </div>
              )}
              {!(transcript || interimTranscript) && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">💡 Tips for better accuracy:</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                    <li>Speak clearly and at a moderate pace</li>
                    <li>Minimize background noise</li>
                    <li>Use a good quality microphone</li>
                    <li>Allow microphone permissions</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={currentParticipant?.isHandRaised || false}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        isSettingsOpen={isSettingsOpen}
        isWhiteboardOpen={isWhiteboardOpen}
        isScribing={isScribing}
        chatUnreadCount={0}
        isHost={isHost}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleHandRaise={toggleHandRaise}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        onToggleScribe={toggleScribe}
        onLeaveMeeting={handleLeaveMeeting}
        onCopyLink={copyMeetingLink}
        onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
        meetingId={currentMeetingId || undefined}
      />
    </div>
  );
};