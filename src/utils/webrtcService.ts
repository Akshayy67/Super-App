import { realTimeAuth } from "./realTimeAuth";
import { signalingService, SignalingMessage } from "./signalingService";
import { meetingDebugger } from "./meetingDebugger";

export interface WebRTCParticipant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
}

export interface WebRTCMeeting {
  id: string;
  title: string;
  hostId: string;
  participants: Map<string, WebRTCParticipant>;
  isActive: boolean;
  createdAt: Date;
}

export interface WebRTCEvent {
  type:
    | "participant-joined"
    | "participant-left"
    | "stream-added"
    | "stream-removed"
    | "meeting-ended";
  meetingId: string;
  participantId: string;
  data?: any;
  timestamp: Date;
}

export type WebRTCEventListener = (event: WebRTCEvent) => void;

class WebRTCService {
  private meetings = new Map<string, WebRTCMeeting>();
  private currentMeeting: WebRTCMeeting | null = null;
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private listeners: WebRTCEventListener[] = [];

  // Peer connections for each participant
  private peerConnections = new Map<string, RTCPeerConnection>();

  // WebRTC Configuration with better STUN/TURN servers
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
  };

  constructor() {
    this.initializeSignaling();
  }

  private initializeSignaling() {
    signalingService.addEventListener(this.handleSignalingMessage.bind(this));
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    const { type, meetingId, fromParticipant, toParticipant, data } = message;
    const user = realTimeAuth.getCurrentUser();

    console.log(
      "🔄 Handling signaling message:",
      type,
      "from:",
      fromParticipant
    );

    // Only process messages for current user or broadcast messages
    if (toParticipant && toParticipant !== user?.id) {
      return;
    }

    // Only process messages for current meeting (except meeting-participants)
    if (
      type !== "meeting-participants" &&
      (!this.currentMeeting || this.currentMeeting.id !== meetingId)
    ) {
      return;
    }

    try {
      switch (type) {
        case "offer":
          await this.handleOffer(fromParticipant, data);
          break;
        case "answer":
          await this.handleAnswer(fromParticipant, data);
          break;
        case "ice-candidate":
          await this.handleIceCandidate(fromParticipant, data);
          break;
        case "participant-joined":
          await this.handleRemoteParticipantJoined(data);
          break;
        case "participant-left":
          this.handleRemoteParticipantLeft(data.participantId);
          break;
        case "meeting-participants":
          await this.handleMeetingParticipants(data);
          break;
      }
    } catch (error) {
      console.error("Error handling signaling message:", error);
    }
  }

  private async handleOffer(
    fromParticipant: string,
    offer: RTCSessionDescriptionInit
  ) {
    const peerConnection = await this.createPeerConnection(fromParticipant);

    await peerConnection.setRemoteDescription(offer);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer back
    signalingService.sendAnswer(
      this.currentMeeting!.id,
      fromParticipant,
      realTimeAuth.getCurrentUser()!.id,
      answer
    );
  }

  private async handleAnswer(
    fromParticipant: string,
    answer: RTCSessionDescriptionInit
  ) {
    const peerConnection = this.peerConnections.get(fromParticipant);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  private async handleIceCandidate(
    fromParticipant: string,
    candidate: RTCIceCandidate
  ) {
    const peerConnection = this.peerConnections.get(fromParticipant);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  private async createPeerConnection(
    participantId: string
  ): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(participantId, peerConnection);

    // Handle ICE candidates with error handling
    peerConnection.onicecandidate = (event) => {
      try {
        if (event.candidate && this.currentMeeting) {
          console.log(`🧊 Sending ICE candidate to ${participantId}`);
          signalingService.sendIceCandidate(
            this.currentMeeting.id,
            participantId,
            realTimeAuth.getCurrentUser()!.id,
            event.candidate
          );
        } else if (!event.candidate) {
          console.log(`✅ ICE gathering complete for ${participantId}`);
        }
      } catch (error) {
        console.error(
          `❌ Error sending ICE candidate to ${participantId}:`,
          error
        );
      }
    };

    // Handle remote stream with better error handling
    peerConnection.ontrack = (event) => {
      try {
        const [remoteStream] = event.streams;
        console.log(
          `🎥 Received remote stream from ${participantId}`,
          remoteStream
        );

        if (remoteStream && this.currentMeeting) {
          const participant =
            this.currentMeeting.participants.get(participantId);
          if (participant) {
            participant.stream = remoteStream;
            console.log(`✅ Stream assigned to participant ${participantId}`);

            this.emit({
              type: "stream-added",
              meetingId: this.currentMeeting.id,
              participantId,
              data: { stream: remoteStream },
              timestamp: new Date(),
            });
          } else {
            console.warn(
              `⚠️ Participant ${participantId} not found for stream`
            );
          }
        }
      } catch (error) {
        console.error(
          `❌ Error handling remote stream from ${participantId}:`,
          error
        );
      }
    };

    // Enhanced connection state handling
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`🔗 Peer connection with ${participantId}: ${state}`);

      switch (state) {
        case "connected":
          console.log(`✅ Successfully connected to ${participantId}`);
          break;
        case "disconnected":
          console.log(
            `⚠️ Disconnected from ${participantId}, attempting reconnection...`
          );
          // Try to restart ICE after a short delay
          setTimeout(() => {
            if (peerConnection.connectionState === "disconnected") {
              console.log(`🔄 Restarting ICE for ${participantId}`);
              peerConnection.restartIce();
            }
          }, 2000);
          break;
        case "failed":
          console.error(`❌ Connection failed with ${participantId}`);
          // Try to restart ICE immediately
          try {
            peerConnection.restartIce();
          } catch (error) {
            console.error(
              `❌ Failed to restart ICE for ${participantId}:`,
              error
            );
            // Remove failed connection
            this.handleConnectionFailure(participantId);
          }
          break;
        case "closed":
          console.log(`🔒 Connection closed with ${participantId}`);
          break;
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      console.log(`🧊 ICE connection with ${participantId}: ${iceState}`);

      if (iceState === "failed") {
        console.error(`❌ ICE connection failed with ${participantId}`);
        // Try to restart ICE
        try {
          peerConnection.restartIce();
        } catch (error) {
          console.error(
            `❌ Failed to restart ICE for ${participantId}:`,
            error
          );
        }
      }
    };

    // Handle ICE gathering state changes
    peerConnection.onicegatheringstatechange = () => {
      console.log(
        `🧊 ICE gathering state for ${participantId}: ${peerConnection.iceGatheringState}`
      );
    };

    return peerConnection;
  }

  private handleConnectionFailure(participantId: string): void {
    console.log(`🔧 Handling connection failure for ${participantId}`);

    // Remove the failed peer connection
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
    }

    // Remove participant stream
    if (this.currentMeeting) {
      const participant = this.currentMeeting.participants.get(participantId);
      if (participant && participant.stream) {
        participant.stream = undefined;

        this.emit({
          type: "stream-removed",
          meetingId: this.currentMeeting.id,
          participantId,
          data: {},
          timestamp: new Date(),
        });
      }
    }

    // Attempt to reconnect after a delay
    setTimeout(() => {
      this.attemptReconnection(participantId);
    }, 3000);
  }

  private async attemptReconnection(participantId: string): Promise<void> {
    if (
      !this.currentMeeting ||
      !this.currentMeeting.participants.has(participantId)
    ) {
      console.log(
        `⚠️ Cannot reconnect to ${participantId}: participant no longer in meeting`
      );
      return;
    }

    try {
      console.log(`🔄 Attempting to reconnect to ${participantId}`);

      // Create new peer connection
      const peerConnection = await this.createPeerConnection(participantId);

      // Add local stream if available
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, this.localStream!);
        });
      }

      // Create and send new offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      signalingService.sendOffer(
        this.currentMeeting.id,
        participantId,
        realTimeAuth.getCurrentUser()!.id,
        offer
      );

      console.log(`✅ Reconnection attempt sent to ${participantId}`);
    } catch (error) {
      console.error(`❌ Failed to reconnect to ${participantId}:`, error);
    }
  }

  private async handleRemoteParticipantJoined(data: any) {
    const { participantId, participantName, isHost } = data;

    if (
      !this.currentMeeting ||
      this.currentMeeting.participants.has(participantId)
    ) {
      return;
    }

    // Add participant to meeting
    const participant: WebRTCParticipant = {
      id: participantId,
      name: participantName,
      isHost: isHost || false,
      isMuted: false,
      isCameraOn: false,
      isScreenSharing: false,
    };

    this.currentMeeting.participants.set(participantId, participant);

    // Create peer connection and send offer
    const peerConnection = await this.createPeerConnection(participantId);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    signalingService.sendOffer(
      this.currentMeeting.id,
      participantId,
      realTimeAuth.getCurrentUser()!.id,
      offer
    );

    this.emit({
      type: "participant-joined",
      meetingId: this.currentMeeting.id,
      participantId,
      data: participant,
      timestamp: new Date(),
    });
  }

  private handleRemoteParticipantLeft(participantId: string) {
    if (!this.currentMeeting) return;

    // Remove participant
    this.currentMeeting.participants.delete(participantId);

    // Close peer connection
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
    }

    this.emit({
      type: "participant-left",
      meetingId: this.currentMeeting.id,
      participantId,
      data: {},
      timestamp: new Date(),
    });
  }

  private async handleMeetingParticipants(data: any) {
    const { participants } = data;

    if (!this.currentMeeting || !participants) return;

    console.log("📋 Received existing participants:", participants);

    // If there are existing participants, current user is NOT the host
    const currentUser = realTimeAuth.getCurrentUser();
    if (currentUser && participants.length > 0) {
      const currentParticipant = this.currentMeeting.participants.get(
        currentUser.id
      );
      if (currentParticipant) {
        currentParticipant.isHost = false; // Definitely not host if others exist
        console.log("👤 Current user is joining existing meeting (not host)");
      }
    } else if (currentUser && participants.length === 0) {
      // If no existing participants, current user becomes host
      const currentParticipant = this.currentMeeting.participants.get(
        currentUser.id
      );
      if (currentParticipant) {
        currentParticipant.isHost = true;
        this.currentMeeting.hostId = currentUser.id;
        this.currentMeeting.title = `${currentParticipant.name}'s Meeting`;
        console.log("👑 Current user is the first participant (becomes host)");
      }
    }

    // Create peer connections with existing participants
    for (const participantInfo of participants) {
      const { participantId, participantName } = participantInfo;

      if (participantId !== currentUser?.id) {
        // Add participant to meeting
        if (!this.currentMeeting.participants.has(participantId)) {
          const participant: WebRTCParticipant = {
            id: participantId,
            name: participantName,
            isHost: false, // Existing participants are not necessarily hosts
            isMuted: false,
            isCameraOn: false,
            isScreenSharing: false,
          };

          this.currentMeeting.participants.set(participantId, participant);

          console.log(
            `🤝 Creating peer connection with existing participant: ${participantName}`
          );

          // Create peer connection and send offer
          const peerConnection = await this.createPeerConnection(participantId);

          // Add local stream if available
          if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, this.localStream!);
            });
          }

          // Create and send offer
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          signalingService.sendOffer(
            this.currentMeeting.id,
            participantId,
            currentUser!.id,
            offer
          );

          this.emit({
            type: "participant-joined",
            meetingId: this.currentMeeting.id,
            participantId,
            data: participant,
            timestamp: new Date(),
          });
        }
      }
    }
  }

  // Event system
  addEventListener(listener: WebRTCEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private emit(event: WebRTCEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in WebRTC event listener:", error);
      }
    });
  }

  // Public API methods
  async createMeeting(title: string): Promise<WebRTCMeeting> {
    try {
      const user = realTimeAuth.getCurrentUser();
      if (!user) {
        meetingDebugger.logError(
          "auth",
          "high",
          "User not authenticated when creating meeting"
        );
        throw new Error("User not authenticated");
      }

      console.log(`🎯 Creating meeting: ${title}`);

      const meetingId = `meeting_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`;

      const meeting: WebRTCMeeting = {
        id: meetingId,
        title,
        hostId: user.id,
        participants: new Map(),
        isActive: true,
        createdAt: new Date(),
      };

      // Add host as participant
      const hostParticipant: WebRTCParticipant = {
        id: user.id,
        name: (user as any).name || user.email || "Host",
        isHost: true,
        isMuted: false,
        isCameraOn: false,
        isScreenSharing: false,
      };

      meeting.participants.set(user.id, hostParticipant);
      this.meetings.set(meetingId, meeting);
      this.currentMeeting = meeting;

      console.log(`✅ Meeting created successfully: ${meetingId}`);
      return meeting;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error creating meeting";
      meetingDebugger.logError("webrtc", "high", "Failed to create meeting", {
        error: errorMessage,
      });
      throw error;
    }
  }

  async joinMeeting(meetingId: string): Promise<WebRTCMeeting> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    console.log(`🔄 Attempting to join meeting: ${meetingId}`);

    // Always create a fresh meeting object when joining
    // The real meeting state will be determined by the signaling server
    const meeting: WebRTCMeeting = {
      id: meetingId,
      title: `Meeting ${meetingId}`,
      hostId: "unknown", // Will be determined by server response
      participants: new Map(),
      isActive: true,
      createdAt: new Date(),
    };

    // Add current user as participant (NOT as host initially)
    const participant: WebRTCParticipant = {
      id: user.id,
      name: (user as any).name || user.email || "Participant",
      isHost: false, // Never assume host status when joining
      isMuted: false,
      isCameraOn: false,
      isScreenSharing: false,
    };

    meeting.participants.set(user.id, participant);
    this.meetings.set(meetingId, meeting);
    this.currentMeeting = meeting;

    console.log(`📤 Sending join-meeting request for: ${participant.name}`);

    // Send join-meeting message to signaling server
    // The server will tell us about existing participants and who the host is
    signalingService.sendMessage({
      type: "join-meeting" as any,
      meetingId,
      fromParticipant: user.id,
      data: {
        participantId: user.id,
        participantName: participant.name,
        isHost: false, // Let server determine host status
      },
    });

    // Emit local event
    this.emit({
      type: "participant-joined",
      meetingId,
      participantId: user.id,
      data: participant,
      timestamp: new Date(),
    });

    return meeting;
  }

  async startCamera(): Promise<MediaStream> {
    try {
      console.log("🎥 Starting camera...");

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }

      // Request camera and microphone access with better constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Camera and microphone access granted", this.localStream);

      // Add stream to all existing peer connections
      this.peerConnections.forEach((peerConnection, participantId) => {
        console.log(
          `📤 Adding local stream to peer connection with ${participantId}`
        );
        this.localStream!.getTracks().forEach((track) => {
          try {
            peerConnection.addTrack(track, this.localStream!);
            console.log(`✅ Added ${track.kind} track to ${participantId}`);
          } catch (error) {
            console.error(
              `❌ Failed to add ${track.kind} track to ${participantId}:`,
              error
            );
          }
        });
      });

      // Update current participant
      if (this.currentMeeting) {
        const user = realTimeAuth.getCurrentUser();
        if (user) {
          const participant = this.currentMeeting.participants.get(user.id);
          if (participant) {
            participant.isCameraOn = true;
            participant.stream = this.localStream;
            console.log(`✅ Updated participant ${user.id} camera status`);
          }
        }
      }

      return this.localStream;
    } catch (error) {
      console.error("❌ Error starting camera:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          throw new Error(
            "Camera and microphone access denied. Please allow access and try again."
          );
        } else if (error.name === "NotFoundError") {
          throw new Error(
            "No camera or microphone found. Please connect a device and try again."
          );
        } else if (error.name === "NotReadableError") {
          throw new Error(
            "Camera or microphone is already in use by another application."
          );
        } else if (error.name === "OverconstrainedError") {
          throw new Error(
            "Camera settings not supported. Trying with basic settings..."
          );
        }
      }

      throw error;
    }
  }

  async stopCamera(): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Update current participant
    if (this.currentMeeting) {
      const user = realTimeAuth.getCurrentUser();
      if (user) {
        const participant = this.currentMeeting.participants.get(user.id);
        if (participant) {
          participant.isCameraOn = false;
          participant.stream = undefined;
        }
      }
    }
  }

  async toggleMute(): Promise<boolean> {
    try {
      if (!this.localStream) {
        console.log("⚠️ No local stream available for mute toggle");
        return false;
      }

      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;

        console.log(`🎤 Audio ${isMuted ? "muted" : "unmuted"}`);

        // Update current participant
        if (this.currentMeeting) {
          const user = realTimeAuth.getCurrentUser();
          if (user) {
            const participant = this.currentMeeting.participants.get(user.id);
            if (participant) {
              participant.isMuted = isMuted;
              console.log(
                `✅ Updated participant ${user.id} mute status: ${isMuted}`
              );
            }
          }
        }

        return isMuted;
      } else {
        console.warn("⚠️ No audio track found in local stream");
        return false;
      }
    } catch (error) {
      console.error("❌ Error toggling mute:", error);
      return false;
    }
  }

  async toggleCamera(): Promise<boolean> {
    try {
      if (!this.localStream) {
        console.log("📹 Starting camera...");
        await this.startCamera();
        return true;
      } else {
        console.log("📹 Stopping camera...");
        await this.stopCamera();
        return false;
      }
    } catch (error) {
      console.error("❌ Error toggling camera:", error);
      throw error;
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Replace video track in all peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      this.peerConnections.forEach(async (peerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      // Update current participant
      if (this.currentMeeting) {
        const user = realTimeAuth.getCurrentUser();
        if (user) {
          const participant = this.currentMeeting.participants.get(user.id);
          if (participant) {
            participant.isScreenSharing = true;
          }
        }
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch (error) {
      console.error("Error starting screen share:", error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    // Restore camera video track
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        this.peerConnections.forEach(async (peerConnection) => {
          const sender = peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });
      }
    }

    // Update current participant
    if (this.currentMeeting) {
      const user = realTimeAuth.getCurrentUser();
      if (user) {
        const participant = this.currentMeeting.participants.get(user.id);
        if (participant) {
          participant.isScreenSharing = false;
        }
      }
    }
  }

  async leaveMeeting(): Promise<void> {
    if (!this.currentMeeting) return;

    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    // Notify other participants
    signalingService.broadcastParticipantLeft(this.currentMeeting.id, user.id);

    // Close all peer connections
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peerConnections.clear();

    // Stop local streams
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    // Remove from meeting
    this.currentMeeting.participants.delete(user.id);

    // If host is leaving and there are other participants, transfer host
    if (
      this.currentMeeting.hostId === user.id &&
      this.currentMeeting.participants.size > 0
    ) {
      const newHostId = Array.from(this.currentMeeting.participants.keys())[0];
      this.currentMeeting.hostId = newHostId;
      const newHost = this.currentMeeting.participants.get(newHostId);
      if (newHost) {
        newHost.isHost = true;
      }
    }

    // If no participants left, end meeting
    if (this.currentMeeting.participants.size === 0) {
      this.currentMeeting.isActive = false;
    }

    this.emit({
      type: "participant-left",
      meetingId: this.currentMeeting.id,
      participantId: user.id,
      data: {},
      timestamp: new Date(),
    });

    this.currentMeeting = null;
  }

  // Getters
  getCurrentMeeting(): WebRTCMeeting | null {
    return this.currentMeeting;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  getMeetings(): WebRTCMeeting[] {
    return Array.from(this.meetings.values());
  }

  // Cleanup
  destroy() {
    // Close all peer connections
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peerConnections.clear();

    // Stop all streams
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
    }

    this.meetings.clear();
    this.listeners = [];
    this.currentMeeting = null;
    this.localStream = null;
    this.screenStream = null;
  }
}

export const webrtcService = new WebRTCService();
