// Video Meeting Types

export interface WhiteboardState {
  paths: any[];
  background: string;
}

export interface VideoMeetingParticipant {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  avatarType?: 'Innovation' | 'Professional' | 'Creative' | 'Default';
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: Date;
  stream?: MediaStream;
  audioLevel?: number;
}

export interface VideoMeeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: 'waiting' | 'active' | 'ended';
  participants: Record<string, VideoMeetingParticipant>;
  settings: MeetingSettings;
  chatMessages: ChatMessage[];
  recordingStatus?: 'idle' | 'recording' | 'paused';
  recordingUrl?: string;
  breakoutRooms?: BreakoutRoom[];
  transcript?: string;
  aiSummary?: string;
  transcriptionStartTime?: Date;
  whiteboard?: WhiteboardState;
}

export interface MeetingSettings {
  allowParticipantsToShare: boolean;
  allowParticipantsToRecord: boolean;
  muteOnJoin: boolean;
  requireHostApproval: boolean;
  enableWaitingRoom: boolean;
  enableChat: boolean;
  enableReactions: boolean;
  enableVirtualBackground: boolean;
  maxParticipants: number;
  password?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export interface Reaction {
  id: string;
  userId: string;
  type: '👍' | '❤️' | '😂' | '😮' | '👏' | '🎉';
  timestamp: Date;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  createdAt: Date;
}

export interface MeetingInvitation {
  meetingId: string;
  meetingTitle: string;
  hostName: string;
  inviteCode: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface RecordingData {
  id: string;
  meetingId: string;
  title: string;
  startTime: Date;
  duration: number;
  url: string;
  size: number;
}

export type ViewMode = 'grid' | 'speaker' | 'sidebar';

export interface MediaDevices {
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
}




