/**
 * Types for Pair Drawing feature
 * This file exports all type definitions used in the pair drawing system
 */

export interface PairDrawingSession {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  canvasData: DrawingCanvasData;
  createdBy: string;
  creatorName: string;
  participants: { [key: string]: DrawingParticipant };
  status: "active" | "paused" | "ended";
  cursors: { [key: string]: DrawingCursorPosition };
  chat: DrawingChatMessage[];
  drawingHistory: DrawingSnapshot[];
  settings: DrawingSessionSettings;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

export interface DrawingParticipant {
  id: string;
  name: string;
  email: string;
  role: "drawer" | "viewer";
  color: string;
  isActive: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export interface DrawingCursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  timestamp: Date;
}

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingPath {
  id: string;
  tool: DrawingTool;
  points: DrawingPoint[];
  color: string;
  size: number;
  userId: string;
  userName: string;
  timestamp: Date;
  text?: string;
  textPosition?: { x: number; y: number };
  fillColor?: string;
  opacity?: number;
}

export interface DrawingCanvasData {
  paths: DrawingPath[];
  background: string;
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
}

export interface DrawingChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "text" | "system";
}

export interface DrawingSnapshot {
  id: string;
  canvasData: DrawingCanvasData;
  userId: string;
  userName: string;
  timestamp: Date;
  description?: string;
  thumbnail?: string;
}

export interface DrawingSessionSettings {
  allowMultipleDrawers: boolean;
  autoSaveInterval: number; // in seconds
  maxParticipants: number;
  requireApprovalToJoin: boolean;
  enableVoiceChat: boolean;
  showCursors: boolean;
  showDrawingHistory: boolean;
}

export type DrawingTool = 
  | "pen" 
  | "eraser" 
  | "line" 
  | "rectangle" 
  | "circle" 
  | "triangle"
  | "arrow"
  | "text" 
  | "select"
  | "fill"
  | "highlighter";

export type DrawingParticipantRole = "drawer" | "viewer";

export type DrawingSessionStatus = "active" | "paused" | "ended";

export type DrawingMessageType = "text" | "system";





