/**
 * Friends and Chat Types
 * 
 * This file contains all TypeScript interfaces and types related to:
 * - Friend relationships
 * - Friend requests
 * - Chat messages
 * - Chat sessions
 */

import { Timestamp } from "firebase/firestore";

/**
 * Friend relationship between two users
 */
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  friendAvatar?: string;
  status: "pending" | "accepted" | "blocked";
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  requestedBy: string; // userId who sent the request
}

/**
 * Friend request sent from one user to another
 */
export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}

/**
 * Chat message in a personal or group chat
 */
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: "text" | "image" | "file" | "system";
  timestamp: Timestamp;
  editedAt?: Timestamp;
  replyTo?: string; // message ID this is replying to
  readBy: string[]; // userIds who have read this message
}

/**
 * Chat session (personal or group)
 */
export interface Chat {
  id: string;
  type: "personal" | "group";
  name?: string; // For groups
  description?: string; // For groups
  participants: string[]; // userIds
  participantNames: Record<string, string>; // userId -> name mapping
  participantEmails: Record<string, string>;
  createdBy?: string; // For groups
  createdAt: Timestamp;
  lastMessage?: {
    text: string;
    senderName: string;
    timestamp: Timestamp;
  };
  unreadCount: Record<string, number>; // userId -> unread count
  avatar?: string; // For groups
}


