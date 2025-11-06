// WebRTC Service for Video/Audio Streaming

import { MediaDevices } from '../types/videoMeeting';

class WebRTCService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private remoteTracks: Map<string, Map<string, MediaStreamTrack>> = new Map(); // userId -> trackKind -> track
  private remoteStreamsMap: Map<string, MediaStream> = new Map(); // userId -> combined stream
  private unmuteCallbackTimeouts: Map<string, NodeJS.Timeout> = new Map(); // Debounce unmute callbacks
  private reconnectionAttempts: Map<string, number> = new Map(); // Track reconnection attempts per user
  private maxReconnectionAttempts = 10; // Increased attempts for better reliability
  private connectionStartTimes: Map<string, number> = new Map(); // Track when connection started
  private useRelayOnly: Map<string, boolean> = new Map(); // Force TURN relay for problematic connections
  private configuration: RTCConfiguration = {
    iceServers: [
      // Google STUN servers (multiple for redundancy)
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Additional STUN servers for redundancy
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.voiparound.com' },
      { urls: 'stun:stun.voipbuster.com' },
      { urls: 'stun:stun.voipstunt.com' },
      // TURN servers - multiple providers for maximum reliability
      { 
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: [
          'turn:relay.metered.ca:80',
          'turn:relay.metered.ca:443',
          'turn:relay.metered.ca:443?transport=tcp'
        ],
        username: 'b1c2d3e4f5g6h7i8j9k0',
        credential: 'b1c2d3e4f5g6h7i8j9k0'
      },
      // Additional free TURN servers
      {
        urls: [
          'turn:openrelay.metered.ca:80?transport=udp',
          'turn:openrelay.metered.ca:80?transport=tcp',
          'turn:openrelay.metered.ca:443?transport=tcp',
          'turns:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      // Additional public TURN servers (no authentication required)
      {
        urls: 'turn:relay1.expressturn.com:3478',
        username: 'ef',
        credential: 'ef'
      },
      {
        urls: 'turn:relay2.expressturn.com:3478',
        username: 'ef',
        credential: 'ef'
      }
    ],
    iceCandidatePoolSize: 10, // Pre-gather candidates for faster connection
    iceTransportPolicy: 'all' // Allow both relay and direct connections
  };
  
  // Get configuration for a specific user (can force relay if needed)
  private getConfigurationForUser(userId: string): RTCConfiguration {
    const forceRelay = this.useRelayOnly.get(userId);
    if (forceRelay) {
      // Return configuration with relay-only policy
      return {
        ...this.configuration,
        iceTransportPolicy: 'relay' // Force TURN relay only
      };
    }
    return this.configuration;
  }

  private onRemoteStreamCallback?: (userId: string, stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (userId: string, state: RTCPeerConnectionState) => void;
  private onIceRestartOfferCallback?: (userId: string, offer: RTCSessionDescriptionInit) => void;

  // Get available media devices
  async getMediaDevices(): Promise<MediaDevices> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        audioInputs: devices.filter(d => d.kind === 'audioinput'),
        audioOutputs: devices.filter(d => d.kind === 'audiooutput'),
        videoInputs: devices.filter(d => d.kind === 'videoinput')
      };
    } catch (error) {
      console.error('Error getting media devices:', error);
      return { audioInputs: [], audioOutputs: [], videoInputs: [] };
    }
  }

  // Start local media stream
  async startLocalStream(audioEnabled = true, videoEnabled = true): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
        video: videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera/microphone');
    }
  }

  // Stop local stream
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Toggle audio
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle video
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Start screen sharing
  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      const screenVideoTrack = this.screenStream.getVideoTracks()[0];
      
      // Replace video tracks in all peer connections with screen share
      this.peerConnections.forEach((pc, userId) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && screenVideoTrack) {
          console.log(`🖥️ Replacing video track with screen share for ${userId}`);
          sender.replaceTrack(screenVideoTrack);
        }
      });

      // Handle user stopping screen share via browser UI
      screenVideoTrack.addEventListener('ended', () => {
        this.stopScreenShare();
      });

      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw new Error('Could not start screen sharing');
    }
  }

  // Stop screen sharing
  stopScreenShare(): void {
    if (this.screenStream) {
      const screenVideoTrack = this.screenStream.getVideoTracks()[0];
      
      // Replace screen share back to camera in all peer connections
      this.peerConnections.forEach((pc, userId) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && this.localStream) {
          const cameraVideoTrack = this.localStream.getVideoTracks()[0];
          if (cameraVideoTrack) {
            console.log(`📹 Replacing screen share back to camera for ${userId}`);
            sender.replaceTrack(cameraVideoTrack);
          }
        }
      });

      this.screenStream.getTracks().forEach(track => {
        track.stop();
      });
      this.screenStream = null;
    }
  }

  // Get screen stream
  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  // Create peer connection
  createPeerConnection(
    userId: string,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ): RTCPeerConnection {
    // Check if peer connection already exists for this user
    const existingPC = this.peerConnections.get(userId);
    if (existingPC && existingPC.connectionState !== 'closed' && existingPC.connectionState !== 'failed') {
      console.log('⚠️ Peer connection already exists for', userId, '- reusing');
      return existingPC;
    }

    // Close existing connection if it exists but is closed/failed
    if (existingPC) {
      existingPC.close();
      this.peerConnections.delete(userId);
    }

    // Track connection start time
    this.connectionStartTimes.set(userId, Date.now());
    
    // Get configuration for this user (may force relay if previous attempts failed)
    const config = this.getConfigurationForUser(userId);
    const peerConnection = new RTCPeerConnection(config);

    // Batch ICE candidates to avoid sending too many messages, but send ALL candidates
    let lastCandidateTime = 0;
    const candidateQueue: RTCIceCandidate[] = [];
    let candidateTimeout: NodeJS.Timeout | null = null;

    const sendCandidates = () => {
      if (candidateQueue.length > 0) {
        // CRITICAL: Send ALL candidates, not just the most recent one
        // Each candidate represents a different network path and is needed for connection
        candidateQueue.forEach(candidate => {
          try {
            onIceCandidate(candidate);
            console.log(`🧊 Sending ICE candidate for ${userId}:`, {
              candidate: candidate.candidate.substring(0, 50) + '...',
              sdpMLineIndex: candidate.sdpMLineIndex,
              sdpMid: candidate.sdpMid
            });
          } catch (err) {
            console.error('Error sending ICE candidate:', err);
          }
        });
        candidateQueue.length = 0;
        lastCandidateTime = Date.now();
      }
      candidateTimeout = null;
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Check if this is a relay candidate (TURN server)
        const isRelay = event.candidate.candidate.includes('relay') || 
                       event.candidate.candidate.includes('srflx') === false;
        
        // Log relay candidates with priority
        if (isRelay) {
          console.log(`🧊 Relay ICE candidate gathered for ${userId} (TURN server)`);
        }
        
        // Add to queue
        candidateQueue.push(event.candidate);
        console.log(`🧊 ICE candidate gathered for ${userId}, queue size: ${candidateQueue.length}`);
        
        // Clear existing timeout
        if (candidateTimeout) {
          clearTimeout(candidateTimeout);
        }
        
        // Send candidates after a short debounce (100ms) to batch them
        // This reduces signaling messages while still sending all candidates
        const timeSinceLastCandidate = Date.now() - lastCandidateTime;
        if (timeSinceLastCandidate > 200) {
          // If it's been a while, send immediately
          sendCandidates();
        } else {
          // Otherwise, batch candidates together with a short delay
          candidateTimeout = setTimeout(sendCandidates, 100);
        }
      } else {
        // null candidate means gathering is complete - send any queued candidates
        console.log(`🧊 ICE candidate gathering complete for ${userId}, sending ${candidateQueue.length} queued candidates`);
        if (candidateTimeout) {
          clearTimeout(candidateTimeout);
        }
        sendCandidates();
      }
    };
    
    // Add connection timeout monitoring
    const connectionTimeout = setTimeout(() => {
      const currentState = peerConnection.connectionState;
      const currentIceState = peerConnection.iceConnectionState;
      const startTime = this.connectionStartTimes.get(userId);
      const elapsed = startTime ? Date.now() - startTime : 0;
      
      // If we've been trying for more than 10 seconds and still not connected
      if (elapsed > 10000 && 
          currentState !== 'connected' && 
          currentIceState !== 'connected' && 
          currentIceState !== 'completed') {
        console.warn(`⏱️ Connection timeout for ${userId} after ${elapsed}ms, forcing relay-only mode`);
        // Force relay-only mode
        if (!this.useRelayOnly.get(userId)) {
          this.useRelayOnly.set(userId, true);
          this.attemptReconnection(userId, true);
        }
      }
    }, 10000); // 10 second timeout
    
    // Clear timeout when connection is established
    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'connected') {
        clearTimeout(connectionTimeout);
      }
    }, { once: true });

    // Handle remote stream - tracks can arrive separately for audio/video
    // We need to collect them and create a combined stream
    if (!this.remoteTracks.has(userId)) {
      this.remoteTracks.set(userId, new Map());
    }
    const userTracks = this.remoteTracks.get(userId)!;
    
    peerConnection.ontrack = (event) => {
      console.log('🎥 ontrack event received for', userId, ':', {
        streamId: event.streams[0]?.id,
        trackKind: event.track?.kind,
        trackId: event.track?.id,
        streamsCount: event.streams?.length,
        trackReadyState: event.track?.readyState,
        trackEnabled: event.track?.enabled,
        trackMuted: event.track?.muted
      });
      
      // Add track to our collection
      if (event.track) {
        // CRITICAL: Ensure track is enabled immediately
        if (!event.track.enabled) {
          console.warn(`⚠️ Track ${event.track.kind} is disabled, enabling it`);
          event.track.enabled = true;
        }
        
        // Don't remove stream if track is muted - it might unmute later
        // Only remove if track actually ends
        userTracks.set(event.track.kind, event.track);
        console.log(`📦 Added ${event.track.kind} track for ${userId}:`, {
          trackId: event.track.id,
          enabled: event.track.enabled,
          muted: event.track.muted,
          readyState: event.track.readyState,
          totalTracks: userTracks.size
        });
        
        // Track state changes
        event.track.onended = () => {
          console.log(`⚠️ Track ${event.track.kind} ended for ${userId}`);
          userTracks.delete(event.track.kind);
          // Only remove stream if ALL tracks are gone
          if (userTracks.size === 0) {
            console.log(`🗑️ Removing stream for ${userId} - no tracks left`);
            this.remoteStreamsMap.delete(userId);
          } else {
            // Update existing stream if it exists
            const existingStream = this.remoteStreamsMap.get(userId);
            if (existingStream && this.onRemoteStreamCallback) {
              // Recreate stream with remaining tracks
              const newStream = new MediaStream(Array.from(userTracks.values()));
              this.remoteStreamsMap.set(userId, newStream);
              this.onRemoteStreamCallback(userId, newStream);
            }
          }
        };
        
        event.track.onmute = () => {
          console.log(`🔇 Track ${event.track.kind} muted for ${userId}`);
          // Don't remove stream when muted - tracks often mute temporarily during connection
        };
        
        event.track.onunmute = () => {
          console.log(`🔊 Track ${event.track.kind} unmuted for ${userId}`);
          // Ensure track is enabled when it unmutes
          if (!event.track.enabled) {
            console.warn(`⚠️ Track ${event.track.kind} unmuted but disabled, enabling it`);
            event.track.enabled = true;
          }
          
          // Immediately notify about unmute - don't debounce as aggressively
          if (this.onRemoteStreamCallback && userTracks.size > 0) {
            let existingStream = this.remoteStreamsMap.get(userId);
            
            // Create/update stream with all current tracks
            if (!existingStream || !existingStream.getTracks().some(t => t.id === event.track.id)) {
              existingStream = new MediaStream(Array.from(userTracks.values()));
              this.remoteStreamsMap.set(userId, existingStream);
            }
            
            // Clear existing timeout for this user
            const existingTimeout = this.unmuteCallbackTimeouts.get(userId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }
            
            // Call callback immediately for unmute - this is critical for video/audio to work
            console.log(`🔔 Immediately notifying about ${event.track.kind} track unmute`);
            this.onRemoteStreamCallback(userId, existingStream);
            this.unmuteCallbackTimeouts.delete(userId);
          }
        };
      }
      
      // Use the stream from the event if available, otherwise create one from collected tracks
      let streamToUse: MediaStream | null = null;
      
      if (event.streams && event.streams.length > 0) {
        // Use the stream from the event - but also add our collected tracks to it
        streamToUse = event.streams[0];
        console.log('✅ Using stream from event:', streamToUse.id);
        
        // Add any tracks we collected that aren't in this stream
        userTracks.forEach((track, kind) => {
          if (!streamToUse.getTracks().some(t => t.id === track.id)) {
            streamToUse.addTrack(track);
            console.log(`➕ Added collected ${kind} track to stream`);
          }
        });
      } else if (userTracks.size > 0) {
        // Create a new stream from collected tracks
        streamToUse = new MediaStream(Array.from(userTracks.values()));
        console.log('✅ Created new stream from collected tracks:', {
          streamId: streamToUse.id,
          tracks: streamToUse.getTracks().length
        });
      }
      
      if (streamToUse && this.onRemoteStreamCallback) {
        // CRITICAL: Ensure all tracks are enabled BEFORE storing/calling callback
        streamToUse.getVideoTracks().forEach(track => {
          if (!track.enabled) {
            track.enabled = true;
            console.log(`✅ Enabled video track ${track.id}`);
          }
          // Ensure track is not muted (if possible)
          if (track.muted && track.readyState === 'live') {
            console.log(`⚠️ Video track ${track.id} is muted - will unmute when ready`);
          }
        });
        
        streamToUse.getAudioTracks().forEach(track => {
          if (!track.enabled) {
            track.enabled = true;
            console.log(`✅ Enabled audio track ${track.id}`);
          }
          // Ensure track is not muted (if possible)
          if (track.muted && track.readyState === 'live') {
            console.log(`⚠️ Audio track ${track.id} is muted - will unmute when ready`);
          }
        });
        
        // Store the stream for this user (update if exists)
        // Always update to ensure we have the latest stream with all tracks
        this.remoteStreamsMap.set(userId, streamToUse);
        
        // Log stream info
        console.log('✅ Calling remote stream callback for', userId, 'with stream:', {
          streamId: streamToUse.id,
          tracks: streamToUse.getTracks().length,
          active: streamToUse.active,
          videoTracks: streamToUse.getVideoTracks().length,
          audioTracks: streamToUse.getAudioTracks().length,
          videoTrackStates: streamToUse.getVideoTracks().map(t => ({
            id: t.id,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState
          })),
          audioTrackStates: streamToUse.getAudioTracks().map(t => ({
            id: t.id,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState
          }))
        });
        
        // Call callback immediately - tracks may be muted initially but will unmute
        // The video element and track unmute handlers will handle updates
        this.onRemoteStreamCallback(userId, streamToUse);
        
        // Also set up multiple delayed callbacks to ensure stream is updated after tracks unmute
        // This handles cases where tracks unmute after the initial callback
        [100, 500, 1000, 2000].forEach(delay => {
          setTimeout(() => {
            const currentStream = this.remoteStreamsMap.get(userId);
            if (currentStream && currentStream.getTracks().length > 0) {
              // Check if any tracks unmuted since initial callback
              const hasUnmutedTracks = currentStream.getTracks().some(t => !t.muted && t.enabled);
              if (hasUnmutedTracks && this.onRemoteStreamCallback) {
                console.log(`🔄 Re-notifying about stream after ${delay}ms delay to catch unmuted tracks`);
                this.onRemoteStreamCallback(userId, currentStream);
              }
            }
          }, delay);
        });
      } else {
        console.warn('⚠️ Cannot create stream callback:', {
          hasStream: !!streamToUse,
          hasCallback: !!this.onRemoteStreamCallback,
          tracksCount: userTracks.size
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      const iceState = peerConnection.iceConnectionState;
      const signalingState = peerConnection.signalingState;
      
      console.log(`🔗 Connection state changed for ${userId}:`, {
        connectionState: state,
        iceConnectionState: iceState,
        signalingState: signalingState
      });
      
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(userId, state);
      }
      
      // Log when connection is established
      if (state === 'connected' && iceState === 'connected') {
        console.log('✅ Peer connection fully established with', userId);
        // Reset reconnection attempts on successful connection
        this.reconnectionAttempts.delete(userId);
        this.useRelayOnly.delete(userId); // Clear relay-only flag on success
        this.connectionStartTimes.delete(userId);
      } else if (state === 'failed') {
        // Immediately attempt reconnection for failed state
        console.log(`🔄 Connection failed for ${userId}, attempting immediate reconnection`);
        this.attemptReconnection(userId, true);
      } else if (state === 'disconnected') {
        // Check how long we've been trying to connect
        const startTime = this.connectionStartTimes.get(userId);
        const elapsed = startTime ? Date.now() - startTime : 0;
        
        // If we've been trying for more than 3 seconds, be more aggressive
        if (elapsed > 3000) {
          console.log(`🔄 Connection disconnected for ${userId} after ${elapsed}ms, attempting reconnection`);
          setTimeout(() => {
            const currentState = peerConnection.connectionState;
            const currentIceState = peerConnection.iceConnectionState;
            if (currentState === 'disconnected' && currentIceState === 'disconnected') {
              this.attemptReconnection(userId, true);
            } else if (currentState === 'connected' || currentIceState === 'connected') {
              console.log(`✅ Connection recovered automatically for ${userId}`);
            }
          }, 1000); // Shorter wait time
        } else {
          // Wait a bit - disconnected might recover automatically
          setTimeout(() => {
            const currentState = peerConnection.connectionState;
            const currentIceState = peerConnection.iceConnectionState;
            if (currentState === 'disconnected' && currentIceState === 'disconnected') {
              console.log(`🔄 Still disconnected after delay, attempting reconnection for ${userId}`);
              this.attemptReconnection(userId, true);
            } else if (currentState === 'connected' || currentIceState === 'connected') {
              console.log(`✅ Connection recovered automatically for ${userId}`);
            }
          }, 1500); // Reduced from 2000ms
        }
      }
    };
    
    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      const connectionState = peerConnection.connectionState;
      const signalingState = peerConnection.signalingState;
      const iceGatheringState = peerConnection.iceGatheringState;
      
      console.log(`🧊 ICE connection state for ${userId}:`, {
        iceConnectionState: iceState,
        connectionState: connectionState,
        signalingState: signalingState,
        iceGatheringState: iceGatheringState
      });
      
      if (iceState === 'connected' || iceState === 'completed') {
        console.log(`✅ ICE connection established with ${userId}`);
        // Reset reconnection attempts on successful connection
        this.reconnectionAttempts.delete(userId);
      } else if (iceState === 'failed') {
        console.warn(`⚠️ ICE connection failed with ${userId}`, {
          connectionState: connectionState,
          signalingState: signalingState,
          iceGatheringState: iceGatheringState,
          localDescription: !!peerConnection.localDescription,
          remoteDescription: !!peerConnection.remoteDescription
        });
        // Immediately attempt reconnection for failed ICE connections
        this.attemptReconnection(userId, true);
      } else if (iceState === 'disconnected') {
        console.warn(`⚠️ ICE connection disconnected with ${userId}`);
        // Check how long we've been trying to connect
        const startTime = this.connectionStartTimes.get(userId);
        const elapsed = startTime ? Date.now() - startTime : 0;
        const isInitialConnection = signalingState === 'have-local-offer' || signalingState === 'have-remote-offer' || signalingState === 'stable';
        
        // More aggressive reconnection - don't wait as long
        // If we've been trying for more than 2 seconds, reconnect immediately
        const waitTime = elapsed > 2000 ? 500 : (isInitialConnection ? 2000 : 1000);
        
        setTimeout(() => {
          const currentIceState = peerConnection.iceConnectionState;
          const currentConnState = peerConnection.connectionState;
          const currentSignalingState = peerConnection.signalingState;
          
          // Only attempt reconnection if:
          // 1. Still disconnected
          // 2. Not closing/closed
          // 3. Not in initial connection phase (unless it's been too long)
          if (currentIceState === 'disconnected' && 
              currentConnState !== 'closed' && 
              currentConnState !== 'closing' &&
              (currentSignalingState === 'stable' || elapsed > 3000)) {
            console.log(`🔄 ICE still disconnected after ${waitTime}ms delay, attempting reconnection for ${userId}`);
            this.attemptReconnection(userId, true);
          } else if (currentIceState === 'connected' || currentIceState === 'completed') {
            console.log(`✅ ICE reconnected automatically for ${userId}`);
          }
        }, waitTime);
      } else if (iceState === 'checking') {
        // Log additional info when stuck in checking state
        console.log(`🔍 ICE checking state for ${userId} - waiting for connection...`, {
          connectionState: connectionState,
          signalingState: signalingState,
          iceGatheringState: iceGatheringState,
          hasLocalDescription: !!peerConnection.localDescription,
          hasRemoteDescription: !!peerConnection.remoteDescription,
          pendingCandidates: this.pendingIceCandidates.get(userId)?.length || 0
        });
      }
    };
    
    // Monitor ICE gathering state
    peerConnection.onicegatheringstatechange = () => {
      const gatheringState = peerConnection.iceGatheringState;
      const iceState = peerConnection.iceConnectionState;
      console.log(`🧊 ICE gathering state for ${userId}:`, {
        iceGatheringState: gatheringState,
        iceConnectionState: iceState,
        pendingCandidates: candidateQueue.length
      });
      
      if (gatheringState === 'complete') {
        console.log(`✅ ICE gathering complete for ${userId}`);
        // Ensure all candidates are sent
        if (candidateQueue.length > 0) {
          console.log(`📤 Sending ${candidateQueue.length} remaining candidates after gathering complete`);
          sendCandidates();
        }
      }
    };

    // Add local stream tracks BEFORE any signaling
    // This ensures tracks are included in offers/answers
    if (this.localStream) {
      const tracks = this.localStream.getTracks();
      console.log(`📤 Adding ${tracks.length} local tracks to peer connection for ${userId}:`);
      tracks.forEach(track => {
        if (this.localStream && track.readyState === 'live') {
          console.log(`  - Adding track: ${track.kind} (${track.id}), enabled: ${track.enabled}, readyState: ${track.readyState}`);
          try {
            const sender = peerConnection.addTrack(track, this.localStream);
            console.log(`  ✅ Track added, sender ID: ${sender.id}`);
          } catch (err) {
            console.error(`  ❌ Error adding track ${track.kind}:`, err);
          }
        } else {
          console.warn(`  ⚠️ Skipping track ${track.kind} - not live (state: ${track.readyState})`);
        }
      });
      
      // Verify tracks were added
      const senders = peerConnection.getSenders();
      console.log(`✅ Peer connection has ${senders.length} senders for ${userId}`);
      senders.forEach(sender => {
        if (sender.track) {
          console.log(`  - Sender: ${sender.track.kind} (${sender.track.id})`);
        }
      });
    } else {
      console.warn(`⚠️ No local stream available when creating peer connection for ${userId}`);
    }

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  // Create offer
  async createOffer(userId: string, iceRestart: boolean = false): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    // Ensure we have tracks before creating offer
    const senders = peerConnection.getSenders();
    console.log(`📤 Creating offer for ${userId}, has ${senders.length} senders, iceRestart: ${iceRestart}`);
    if (senders.length === 0 && this.localStream) {
      console.warn(`⚠️ No senders found, adding tracks before creating offer`);
      const tracks = this.localStream.getTracks();
      tracks.forEach(track => {
        if (track.readyState === 'live') {
          peerConnection.addTrack(track, this.localStream!);
        }
      });
    }

    // Add offer options to ensure video/audio are included
    const offerOptions: RTCOfferOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      iceRestart: iceRestart // Explicitly set ICE restart flag
    };
    
    const offer = await peerConnection.createOffer(offerOptions);
    console.log(`📤 Offer created for ${userId}:`, {
      type: offer.type,
      hasSdp: !!offer.sdp,
      sdpLength: offer.sdp?.length,
      iceRestart: iceRestart
    });
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Create answer
  async createAnswer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    // Ensure we have tracks before creating answer
    const senders = peerConnection.getSenders();
    console.log(`📤 Creating answer for ${userId}, has ${senders.length} senders`);
    if (senders.length === 0 && this.localStream) {
      console.warn(`⚠️ No senders found, adding tracks before creating answer`);
      const tracks = this.localStream.getTracks();
      tracks.forEach(track => {
        if (track.readyState === 'live') {
          peerConnection.addTrack(track, this.localStream!);
        }
      });
    }

    const answer = await peerConnection.createAnswer();
    console.log(`📤 Answer created for ${userId}:`, {
      type: answer.type,
      hasSdp: !!answer.sdp,
      sdpLength: answer.sdp?.length
    });
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Set remote description
  async setRemoteDescription(userId: string, description: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    // Check current state before setting remote description
    const currentState = peerConnection.signalingState;
    const hasLocalOffer = !!peerConnection.localDescription;
    const hasRemoteDescription = !!peerConnection.remoteDescription;
    
    // Detect if this is an ICE restart:
    // - Offer in stable state = ICE restart offer
    // - Answer in stable state with local offer = ICE restart answer
    const isIceRestart = (description.type === 'offer' && currentState === 'stable') ||
                         (description.type === 'answer' && currentState === 'stable' && hasLocalOffer);
    
    console.log(`📋 Setting remote description for ${userId}, current state: ${currentState}, type: ${description.type}, isIceRestart: ${isIceRestart}, hasLocalOffer: ${hasLocalOffer}`);

    // Validate state transitions
    if (description.type === 'offer') {
      // Allow ICE restart offers even in stable state
      if (isIceRestart && currentState === 'stable') {
        console.log('🔄 ICE restart offer detected - allowing in stable state');
        // Skip validation, proceed to setRemoteDescription
      } else if (currentState !== 'stable' && currentState !== 'have-local-offer') {
        console.warn(`⚠️ Cannot set remote offer in state ${currentState}, resetting connection`);
        // Close and recreate if in wrong state
        peerConnection.close();
        this.peerConnections.delete(userId);
        throw new Error(`Cannot set remote offer: invalid state ${currentState}`);
      }
    } else if (description.type === 'answer') {
      // Allow ICE restart answers even in stable state (if we have a local offer)
      if (isIceRestart && currentState === 'stable' && hasLocalOffer) {
        console.log('🔄 ICE restart answer detected - allowing in stable state');
        // Skip validation, proceed to setRemoteDescription
      } else if (currentState !== 'have-local-offer' && currentState !== 'have-remote-offer') {
        console.warn(`⚠️ Cannot set remote answer in state ${currentState}`);
        // If we have a local offer, we can proceed
        if (currentState !== 'have-local-offer') {
          throw new Error(`Cannot set remote answer: invalid state ${currentState}`);
        }
      }
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      console.log(`✅ Set remote ${description.type} for ${userId}, new state: ${peerConnection.signalingState}`);
      
      // Process any pending ICE candidates for this user
      const pendingCandidates = this.pendingIceCandidates.get(userId);
      if (pendingCandidates && pendingCandidates.length > 0) {
        console.log(`🧊 Processing ${pendingCandidates.length} queued ICE candidates for ${userId}`);
        for (const candidate of pendingCandidates) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('Error adding queued ICE candidate:', err);
          }
        }
        this.pendingIceCandidates.delete(userId);
      }
    } catch (error) {
      console.error(`❌ Error setting remote description for ${userId}:`, error);
      throw error;
    }
  }

  // Add ICE candidate
  async addIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    
    // If peer connection doesn't exist, queue the candidate
    if (!peerConnection) {
      if (!this.pendingIceCandidates.has(userId)) {
        this.pendingIceCandidates.set(userId, []);
      }
      this.pendingIceCandidates.get(userId)!.push(candidate);
      console.log(`🧊 Queued ICE candidate for ${userId} (no peer connection yet)`, {
        candidate: candidate.candidate?.substring(0, 50) + '...'
      });
      return;
    }
    
    // If remote description is not set, queue the candidate
    if (!peerConnection.remoteDescription) {
      if (!this.pendingIceCandidates.has(userId)) {
        this.pendingIceCandidates.set(userId, []);
      }
      this.pendingIceCandidates.get(userId)!.push(candidate);
      console.log(`🧊 Queued ICE candidate for ${userId} (will process after remote description)`, {
        candidate: candidate.candidate?.substring(0, 50) + '...',
        signalingState: peerConnection.signalingState
      });
      return;
    }

    // Remote description is set, add candidate immediately
    // Even if connection is in failed/disconnected state, we should still add candidates
    // as they might help establish the connection
    try {
      const iceState = peerConnection.iceConnectionState;
      const connState = peerConnection.connectionState;
      
      console.log(`🧊 Adding ICE candidate for ${userId}:`, {
        candidate: candidate.candidate?.substring(0, 50) + '...',
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
        iceConnectionState: iceState,
        connectionState: connState,
        signalingState: peerConnection.signalingState
      });
      
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`✅ ICE candidate added successfully for ${userId}`);
    } catch (err: any) {
      // Don't log as error if candidate is invalid (might be duplicate or already processed)
      if (err?.message?.includes('InvalidStateError') || 
          err?.message?.includes('already exists') ||
          err?.message?.includes('Invalid candidate')) {
        console.log(`⚠️ ICE candidate already processed or invalid for ${userId}:`, err.message);
      } else {
        console.error(`❌ Error adding ICE candidate for ${userId}:`, err);
        // Log the candidate details for debugging
        console.error('Candidate details:', {
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid
        });
      }
    }
  }

  // Get peer connection (for checking state)
  getPeerConnection(userId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(userId);
  }

  // Close peer connection
  closePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
    // Clean up any pending ICE candidates
    this.pendingIceCandidates.delete(userId);
    // Clean up remote tracks and streams
    this.remoteTracks.delete(userId);
    this.remoteStreamsMap.delete(userId);
    // Clean up connection tracking
    this.connectionStartTimes.delete(userId);
    this.reconnectionAttempts.delete(userId);
    this.useRelayOnly.delete(userId);
  }

  // Close all connections
  closeAllConnections(): void {
    this.peerConnections.forEach((pc, userId) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.pendingIceCandidates.clear();
    this.stopLocalStream();
    this.stopScreenShare();
  }

  // Set callbacks
  onRemoteStream(callback: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionStateChange(callback: (userId: string, state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  onIceRestartOffer(callback: (userId: string, offer: RTCSessionDescriptionInit) => void): void {
    this.onIceRestartOfferCallback = callback;
  }

  // Switch camera (front/back)
  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    const currentFacingMode = videoTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode }
    });

    const newVideoTrack = newStream.getVideoTracks()[0];
    
    // Replace track in all peer connections
    this.peerConnections.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(newVideoTrack);
      }
    });

    // Stop old track and update local stream
    videoTrack.stop();
    this.localStream.removeTrack(videoTrack);
    this.localStream.addTrack(newVideoTrack);
  }

  // Change audio input device
  async changeAudioInput(deviceId: string): Promise<void> {
    if (!this.localStream) return;

    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } }
    });

    const newAudioTrack = newStream.getAudioTracks()[0];
    const oldAudioTrack = this.localStream.getAudioTracks()[0];

    // Replace track in all peer connections
    this.peerConnections.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
      if (sender) {
        sender.replaceTrack(newAudioTrack);
      }
    });

    // Stop old track and update local stream
    oldAudioTrack.stop();
    this.localStream.removeTrack(oldAudioTrack);
    this.localStream.addTrack(newAudioTrack);
  }

  // Change video input device
  async changeVideoInput(deviceId: string): Promise<void> {
    if (!this.localStream) return;

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } }
    });

    const newVideoTrack = newStream.getVideoTracks()[0];
    const oldVideoTrack = this.localStream.getVideoTracks()[0];

    // Replace track in all peer connections
    this.peerConnections.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(newVideoTrack);
      }
    });

    // Stop old track and update local stream
    oldVideoTrack.stop();
    this.localStream.removeTrack(oldVideoTrack);
    this.localStream.addTrack(newVideoTrack);
  }

  // Get audio level (for visual indicator)
  async getAudioLevel(stream: MediaStream): Promise<number> {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      return average / 255; // Normalize to 0-1
    } catch (error) {
      return 0;
    }
  }

  // Attempt to reconnect a failed peer connection
  private attemptReconnection(userId: string, immediate: boolean = false): void {
    const attempts = this.reconnectionAttempts.get(userId) || 0;
    
    if (attempts >= this.maxReconnectionAttempts) {
      console.error(`❌ Max reconnection attempts (${this.maxReconnectionAttempts}) reached for ${userId}`);
      // After max attempts, try forcing relay-only mode
      if (!this.useRelayOnly.get(userId)) {
        console.log(`🔄 Forcing relay-only mode for ${userId} after ${attempts} failed attempts`);
        this.useRelayOnly.set(userId, true);
        this.reconnectionAttempts.delete(userId); // Reset attempts for relay-only retry
        // Close and recreate connection with relay-only
        this.recreateConnectionWithRelay(userId);
      }
      return;
    }
    
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      console.warn(`⚠️ No peer connection found for ${userId}, cannot reconnect`);
      return;
    }
    
    // Check if connection is already closed or closing
    if (peerConnection.connectionState === 'closed' || 
        peerConnection.connectionState === 'closing') {
      console.log(`⚠️ Peer connection for ${userId} is closing/closed, cannot reconnect`);
      return;
    }
    
    // Don't reconnect if we're still in initial connection phase (unless immediate flag is set)
    const signalingState = peerConnection.signalingState;
    const isInitialConnection = signalingState === 'have-local-offer' || 
                                 signalingState === 'have-remote-offer' ||
                                 signalingState === 'stable';
    
    // If we're in initial connection and this is the first attempt, wait a bit (unless immediate)
    if (isInitialConnection && attempts === 0 && !immediate) {
      const startTime = this.connectionStartTimes.get(userId);
      const elapsed = startTime ? Date.now() - startTime : 0;
      
      // If we've been trying for more than 2 seconds, reconnect immediately
      if (elapsed < 2000) {
        console.log(`⏳ Waiting a bit longer for initial connection to ${userId} before reconnecting`);
        setTimeout(() => {
          const currentState = peerConnection.connectionState;
          const currentIceState = peerConnection.iceConnectionState;
          if ((currentState === 'failed' || currentIceState === 'failed' || 
               currentState === 'disconnected' || currentIceState === 'disconnected') && 
              peerConnection.signalingState === 'stable') {
            this.attemptReconnection(userId, true);
          }
        }, 1500); // Reduced from 5000ms
        return;
      }
    }
    
    this.reconnectionAttempts.set(userId, attempts + 1);
    console.log(`🔄 Attempting reconnection ${attempts + 1}/${this.maxReconnectionAttempts} for ${userId}`);
    
    // After 3 failed attempts, try forcing relay-only mode
    if (attempts >= 3 && !this.useRelayOnly.get(userId)) {
      console.log(`🔄 Switching to relay-only mode for ${userId} after ${attempts} failed attempts`);
      this.useRelayOnly.set(userId, true);
      // Close and recreate with relay-only
      this.recreateConnectionWithRelay(userId);
      return;
    }
    
    // Restart ICE gathering - this can help recover from connection issues
    try {
      // Create a new offer/answer to restart ICE only if we're in stable state
      if (peerConnection.signalingState === 'stable') {
        // We're stable, create a new offer to restart ICE
        this.createOffer(userId, true) // Use our method with iceRestart flag
          .then((offer) => {
            console.log('✅ ICE restart offer created for', userId);
            // Send the ICE restart offer through callback so it can be sent via signaling
            if (this.onIceRestartOfferCallback) {
              this.onIceRestartOfferCallback(userId, offer);
            }
            // Trigger connection state change callback
            if (this.onConnectionStateChangeCallback) {
              this.onConnectionStateChangeCallback(userId, 'connecting');
            }
          })
          .catch(err => {
            console.error('❌ Error restarting ICE for', userId, ':', err);
            // If ICE restart fails, try recreating connection
            setTimeout(() => {
              if (peerConnection.connectionState !== 'connected') {
                this.recreateConnectionWithRelay(userId);
              }
            }, 1000);
          });
      } else {
        // If not stable, wait a bit and try again
        console.log(`⏳ Waiting for stable signaling state before reconnecting ${userId} (current: ${signalingState})`);
        setTimeout(() => {
          if (peerConnection.signalingState === 'stable' && 
              peerConnection.connectionState !== 'connected') {
            this.attemptReconnection(userId, true);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Error attempting reconnection for', userId, ':', err);
      // If reconnection fails, try recreating connection
      setTimeout(() => {
        if (peerConnection.connectionState !== 'connected') {
          this.recreateConnectionWithRelay(userId);
        }
      }, 1000);
    }
  }
  
  // Recreate connection with relay-only mode
  private recreateConnectionWithRelay(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      return;
    }
    
    // Get the ICE candidate callback (we need to recreate the connection)
    // This is a fallback - ideally the ICE restart should work
    console.log(`🔄 Recreating connection with relay-only for ${userId}`);
    
    // Close existing connection
    peerConnection.close();
    this.peerConnections.delete(userId);
    
    // Force relay-only for this user
    this.useRelayOnly.set(userId, true);
    
    // Note: The actual recreation will happen when the ICE restart offer is handled
    // or when a new offer/answer is created. This method mainly sets the flag.
  }

  // Get reconnection attempt count for a user
  getReconnectionAttempts(userId: string): number {
    return this.reconnectionAttempts.get(userId) || 0;
  }
}

export const webRTCService = new WebRTCService();

