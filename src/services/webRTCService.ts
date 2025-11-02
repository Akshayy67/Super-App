// WebRTC Service for Video/Audio Streaming

import { MediaDevices } from '../types/videoMeeting';

class WebRTCService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private remoteTracks: Map<string, Map<string, MediaStreamTrack>> = new Map(); // userId -> trackKind -> track
  private remoteStreamsMap: Map<string, MediaStream> = new Map(); // userId -> combined stream
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ]
  };

  private onRemoteStreamCallback?: (userId: string, stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (userId: string, state: RTCPeerConnectionState) => void;

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

    const peerConnection = new RTCPeerConnection(this.configuration);

    // Debounce ICE candidates to avoid sending too many
    let lastCandidateTime = 0;
    const candidateQueue: RTCIceCandidate[] = [];
    let candidateTimeout: NodeJS.Timeout | null = null;

    const sendCandidate = () => {
      if (candidateQueue.length > 0) {
        // Send the most recent candidate
        const candidate = candidateQueue[candidateQueue.length - 1];
        candidateQueue.length = 0;
        onIceCandidate(candidate);
        lastCandidateTime = Date.now();
      }
      candidateTimeout = null;
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Add to queue
        candidateQueue.push(event.candidate);
        
        // Clear existing timeout
        if (candidateTimeout) {
          clearTimeout(candidateTimeout);
        }
        
        // Send candidate after a short debounce (50ms) or immediately if it's been a while
        const timeSinceLastCandidate = Date.now() - lastCandidateTime;
        if (timeSinceLastCandidate > 100) {
          sendCandidate();
        } else {
          candidateTimeout = setTimeout(sendCandidate, 50);
        }
      } else {
        // null candidate means gathering is complete - send any queued candidates
        if (candidateQueue.length > 0 && candidateTimeout) {
          clearTimeout(candidateTimeout);
          sendCandidate();
        }
      }
    };

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
        // Ensure track is enabled
        if (!event.track.enabled) {
          console.warn(`⚠️ Track ${event.track.kind} is disabled, enabling it`);
          event.track.enabled = true;
        }
        
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
          // Remove stream if no tracks left
          if (userTracks.size === 0) {
            this.remoteStreamsMap.delete(userId);
          }
        };
        
        event.track.onmute = () => {
          console.log(`🔇 Track ${event.track.kind} muted for ${userId}`);
        };
        
        event.track.onunmute = () => {
          console.log(`🔊 Track ${event.track.kind} unmuted for ${userId}`);
          // When track unmutes, trigger stream callback update
          if (this.onRemoteStreamCallback && userTracks.size > 0) {
            const existingStream = this.remoteStreamsMap.get(userId);
            if (existingStream) {
              console.log(`🔄 Re-calling callback due to ${event.track.kind} track unmute`);
              this.onRemoteStreamCallback(userId, existingStream);
            }
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
        // Ensure all tracks are enabled
        streamToUse.getVideoTracks().forEach(track => {
          if (!track.enabled) {
            track.enabled = true;
            console.log(`✅ Enabled video track ${track.id}`);
          }
        });
        
        streamToUse.getAudioTracks().forEach(track => {
          if (!track.enabled) {
            track.enabled = true;
            console.log(`✅ Enabled audio track ${track.id}`);
          }
        });
        
        // Store the stream for this user (update if exists)
        this.remoteStreamsMap.set(userId, streamToUse);
        
        // Log stream info
        console.log('✅ Calling remote stream callback for', userId, 'with stream:', {
          streamId: streamToUse.id,
          tracks: streamToUse.getTracks().length,
          active: streamToUse.active,
          videoTracks: streamToUse.getVideoTracks().length,
          audioTracks: streamToUse.getAudioTracks().length
        });
        
        // Call callback immediately - don't wait for tracks to be live
        // The video element will handle track state changes
        this.onRemoteStreamCallback(userId, streamToUse);
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
      }
    };
    
    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      console.log(`🧊 ICE connection state for ${userId}:`, iceState);
      
      if (iceState === 'connected' || iceState === 'completed') {
        console.log(`✅ ICE connection established with ${userId}`);
      } else if (iceState === 'failed' || iceState === 'disconnected') {
        console.warn(`⚠️ ICE connection ${iceState} with ${userId}`);
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
  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    // Ensure we have tracks before creating offer
    const senders = peerConnection.getSenders();
    console.log(`📤 Creating offer for ${userId}, has ${senders.length} senders`);
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
      offerToReceiveVideo: true
    };
    
    const offer = await peerConnection.createOffer(offerOptions);
    console.log(`📤 Offer created for ${userId}:`, {
      type: offer.type,
      hasSdp: !!offer.sdp,
      sdpLength: offer.sdp?.length
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
    console.log(`📋 Setting remote description for ${userId}, current state: ${currentState}, type: ${description.type}`);

    // Validate state transitions
    if (description.type === 'offer') {
      if (currentState !== 'stable' && currentState !== 'have-local-offer') {
        console.warn(`⚠️ Cannot set remote offer in state ${currentState}, resetting connection`);
        // Close and recreate if in wrong state
        peerConnection.close();
        this.peerConnections.delete(userId);
        throw new Error(`Cannot set remote offer: invalid state ${currentState}`);
      }
    } else if (description.type === 'answer') {
      if (currentState !== 'have-local-offer' && currentState !== 'have-remote-offer') {
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
    
    // If peer connection doesn't exist or remote description not set, queue the candidate
    if (!peerConnection || !peerConnection.remoteDescription) {
      if (!this.pendingIceCandidates.has(userId)) {
        this.pendingIceCandidates.set(userId, []);
      }
      this.pendingIceCandidates.get(userId)!.push(candidate);
      console.log(`🧊 Queued ICE candidate for ${userId} (will process after remote description)`);
      return;
    }

    // Remote description is set, add candidate immediately
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
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
}

export const webRTCService = new WebRTCService();

