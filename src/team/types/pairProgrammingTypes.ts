/**
 * Types for Pair Programming feature
 * This file exports all type definitions used in the pair programming system
 */

export interface PairProgrammingSession {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  createdBy: string;
  creatorName: string;
  participants: { [key: string]: Participant };
  status: "active" | "paused" | "ended";
  isLocked: boolean;
  lockedBy?: string;
  cursors: { [key: string]: CursorPosition };
  chat: ChatMessage[];
  codeHistory: CodeSnapshot[];
  settings: SessionSettings;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: "driver" | "navigator" | "observer";
  color: string;
  isActive: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  line: number;
  column: number;
  color: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "text" | "code" | "system";
}

export interface CodeSnapshot {
  id: string;
  code: string;
  userId: string;
  userName: string;
  timestamp: Date;
  description?: string;
}

export interface SessionSettings {
  allowMultipleDrivers: boolean;
  autoSaveInterval: number; // in seconds
  maxParticipants: number;
  requireApprovalToJoin: boolean;
  enableVoiceChat: boolean;
  enableScreenShare: boolean;
  enableCodeSuggestions: boolean;
}

export type ProgrammingLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "html"
  | "css"
  | "go"
  | "rust"
  | "ruby"
  | "php"
  | "swift"
  | "kotlin"
  | "csharp";

export type ParticipantRole = "driver" | "navigator" | "observer";

export type SessionStatus = "active" | "paused" | "ended";

export type MessageType = "text" | "code" | "system";

