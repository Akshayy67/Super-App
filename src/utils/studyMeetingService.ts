import { realTimeAuth } from "./realTimeAuth";

export interface StudyMeetingParticipant {
  id: string;
  name: string;
  email: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  lastSeen: Date;
}

export interface StudyMeeting {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  teamId?: string;
  participants: StudyMeetingParticipant[];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  settings: {
    allowScreenShare: boolean;
    allowChat: boolean;
    requireApproval: boolean;
    maxParticipants: number;
    recordSession: boolean;
    isPublic: boolean;
    requirePassword: boolean;
    password?: string;
  };
  pomodoroSettings?: {
    enabled: boolean;
    workDuration: number;
    breakDuration: number;
    autoStart: boolean;
  };
}

export interface MeetingMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "text" | "system";
}

export type MeetingEventType =
  | "participantJoined"
  | "participantLeft"
  | "participantMuted"
  | "participantUnmuted"
  | "cameraToggled"
  | "screenShareStarted"
  | "screenShareStopped"
  | "messageReceived"
  | "meetingEnded";

export interface MeetingEvent {
  type: MeetingEventType;
  meetingId: string;
  participantId?: string;
  data?: any;
  timestamp: Date;
}

export type MeetingEventListener = (event: MeetingEvent) => void;

class StudyMeetingService {
  private meetings: Map<string, StudyMeeting> = new Map();
  private listeners: MeetingEventListener[] = [];
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  constructor() {
    this.initializeSampleMeetings();
  }

  private initializeSampleMeetings() {
    // Create some sample meetings for testing
    const sampleMeetings: StudyMeeting[] = [
      {
        id: "meeting_sample_1",
        title: "Math Study Group",
        description: "Working on calculus problems together",
        hostId: "sample_host_1",
        hostName: "Alice Johnson",
        teamId: undefined,
        createdAt: new Date(),
        participants: [],
        isActive: true,
        startTime: new Date(),
        settings: {
          allowScreenShare: true,
          allowChat: true,
          requireApproval: false,
          maxParticipants: 8,
          recordSession: false,
          isPublic: true,
          requirePassword: false,
        },
        pomodoroSettings: {
          enabled: true,
          workDuration: 25,
          breakDuration: 5,
          autoStart: false,
        },
      },
      {
        id: "meeting_sample_2",
        title: "Private Physics Session",
        description: "Advanced quantum mechanics discussion",
        hostId: "sample_host_2",
        hostName: "Dr. Smith",
        teamId: undefined,
        createdAt: new Date(),
        participants: [],
        isActive: true,
        startTime: new Date(),
        settings: {
          allowScreenShare: true,
          allowChat: true,
          requireApproval: false,
          maxParticipants: 5,
          recordSession: false,
          isPublic: true,
          requirePassword: true,
          password: "physics123",
        },
        pomodoroSettings: {
          enabled: false,
          workDuration: 25,
          breakDuration: 5,
          autoStart: false,
        },
      },
      {
        id: "meeting_sample_3",
        title: "Computer Science Study Hall",
        description: "Open study session for CS students",
        hostId: "sample_host_3",
        hostName: "Bob Wilson",
        teamId: undefined,
        createdAt: new Date(),
        participants: [],
        isActive: true,
        startTime: new Date(),
        settings: {
          allowScreenShare: true,
          allowChat: true,
          requireApproval: false,
          maxParticipants: 15,
          recordSession: false,
          isPublic: true,
          requirePassword: false,
        },
        pomodoroSettings: {
          enabled: true,
          workDuration: 30,
          breakDuration: 10,
          autoStart: true,
        },
      },
    ];

    sampleMeetings.forEach((meeting) => {
      this.meetings.set(meeting.id, meeting);
    });
  }
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  // Event system
  addEventListener(listener: MeetingEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private emit(event: MeetingEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  // Meeting management
  async createMeeting(meetingData: {
    title: string;
    description: string;
    teamId?: string;
    settings?: Partial<StudyMeeting["settings"]>;
    pomodoroSettings?: Partial<StudyMeeting["pomodoroSettings"]>;
  }): Promise<StudyMeeting> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const meetingId = `meeting_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const meeting: StudyMeeting = {
      id: meetingId,
      title: meetingData.title,
      description: meetingData.description,
      hostId: user.id,
      hostName: user.name || user.email || "Unknown Host",
      teamId: meetingData.teamId,
      createdAt: new Date(),
      participants: [
        {
          id: user.id,
          name: user.username || user.email,
          email: user.email,
          isHost: true,
          isMuted: false,
          isCameraOn: false,
          isScreenSharing: false,
          joinedAt: new Date(),
          lastSeen: new Date(),
        },
      ],
      isActive: true,
      startTime: new Date(),
      settings: {
        allowScreenShare: true,
        allowChat: true,
        requireApproval: false,
        maxParticipants: 10,
        recordSession: false,
        isPublic: true,
        requirePassword: false,
        ...meetingData.settings,
      },
      pomodoroSettings: {
        enabled: false,
        workDuration: 25,
        breakDuration: 5,
        autoStart: false,
        ...meetingData.pomodoroSettings,
      },
    };

    this.meetings.set(meetingId, meeting);
    return meeting;
  }

  async joinMeeting(
    meetingId: string,
    password?: string
  ): Promise<StudyMeeting> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error("Meeting not found");

    if (!meeting.isActive) throw new Error("Meeting has ended");

    // Check password if required
    if (meeting.settings.requirePassword) {
      if (!password) throw new Error("Meeting password required");
      if (password !== meeting.settings.password)
        throw new Error("Incorrect password");
    }

    // Check if user is already in the meeting
    const existingParticipant = meeting.participants.find(
      (p) => p.id === user.id
    );
    if (existingParticipant) {
      existingParticipant.lastSeen = new Date();
      return meeting;
    }

    // Check participant limit
    if (meeting.participants.length >= meeting.settings.maxParticipants) {
      throw new Error("Meeting is full");
    }

    const participant: StudyMeetingParticipant = {
      id: user.id,
      name: user.username || user.email,
      email: user.email,
      isHost: false,
      isMuted: true, // Join muted by default
      isCameraOn: false,
      isScreenSharing: false,
      joinedAt: new Date(),
      lastSeen: new Date(),
    };

    meeting.participants.push(participant);
    this.meetings.set(meetingId, meeting);

    this.emit({
      type: "participantJoined",
      meetingId,
      participantId: user.id,
      timestamp: new Date(),
    });

    return meeting;
  }

  async leaveMeeting(meetingId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const meeting = this.meetings.get(meetingId);
    if (!meeting) return;

    // Remove participant
    meeting.participants = meeting.participants.filter((p) => p.id !== user.id);

    // If host leaves and there are other participants, transfer host to first participant
    if (meeting.hostId === user.id && meeting.participants.length > 0) {
      meeting.hostId = meeting.participants[0].id;
      meeting.participants[0].isHost = true;
    }

    // End meeting if no participants left
    if (meeting.participants.length === 0) {
      meeting.isActive = false;
      meeting.endTime = new Date();
    }

    this.meetings.set(meetingId, meeting);

    // Clean up media streams
    this.stopLocalStream();
    this.stopScreenShare();

    this.emit({
      type: "participantLeft",
      meetingId,
      participantId: user.id,
      timestamp: new Date(),
    });
  }

  // Media management
  async startCamera(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: true,
      });

      return this.localStream;
    } catch (error) {
      console.error("Failed to start camera:", error);
      throw new Error("Failed to access camera and microphone");
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Handle screen share end
      this.screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        this.stopScreenShare();
      });

      return this.screenStream;
    } catch (error) {
      console.error("Failed to start screen share:", error);
      throw new Error("Failed to start screen sharing");
    }
  }

  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
  }

  async toggleMute(meetingId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const meeting = this.meetings.get(meetingId);
    if (!meeting) return;

    const participant = meeting.participants.find((p) => p.id === user.id);
    if (!participant) return;

    participant.isMuted = !participant.isMuted;

    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !participant.isMuted;
      }
    }

    this.emit({
      type: participant.isMuted ? "participantMuted" : "participantUnmuted",
      meetingId,
      participantId: user.id,
      timestamp: new Date(),
    });
  }

  async toggleCamera(meetingId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const meeting = this.meetings.get(meetingId);
    if (!meeting) return;

    const participant = meeting.participants.find((p) => p.id === user.id);
    if (!participant) return;

    participant.isCameraOn = !participant.isCameraOn;

    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = participant.isCameraOn;
      }
    }

    this.emit({
      type: "cameraToggled",
      meetingId,
      participantId: user.id,
      data: { isCameraOn: participant.isCameraOn },
      timestamp: new Date(),
    });
  }

  async toggleScreenShare(meetingId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const meeting = this.meetings.get(meetingId);
    if (!meeting) return;

    const participant = meeting.participants.find((p) => p.id === user.id);
    if (!participant) return;

    if (participant.isScreenSharing) {
      this.stopScreenShare();
      participant.isScreenSharing = false;
      this.emit({
        type: "screenShareStopped",
        meetingId,
        participantId: user.id,
        timestamp: new Date(),
      });
    } else {
      try {
        await this.startScreenShare();
        participant.isScreenSharing = true;
        this.emit({
          type: "screenShareStarted",
          meetingId,
          participantId: user.id,
          timestamp: new Date(),
        });
      } catch (error) {
        throw error;
      }
    }
  }

  // Getters
  getMeeting(meetingId: string): StudyMeeting | undefined {
    return this.meetings.get(meetingId);
  }

  getAvailableMeetings(): StudyMeeting[] {
    // Return all public meetings that are either active or recently created (within 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return Array.from(this.meetings.values()).filter(
      (meeting) =>
        meeting.settings.isPublic &&
        (meeting.isActive || meeting.createdAt > oneDayAgo)
    );
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  getUserMeetings(): StudyMeeting[] {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return [];

    return Array.from(this.meetings.values()).filter((meeting) =>
      meeting.participants.some((p) => p.id === user.id)
    );
  }

  // Utility methods
  generateMeetingLink(meetingId: string): string {
    return `${window.location.origin}/study-meeting/${meetingId}`;
  }

  // Cleanup
  destroy(): void {
    this.stopLocalStream();
    this.stopScreenShare();
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.meetings.clear();
    this.listeners = [];
  }
}

export const studyMeetingService = new StudyMeetingService();
