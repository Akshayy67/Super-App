/**
 * Groups Types
 * 
 * This file contains all TypeScript interfaces and types related to groups
 */

import { Timestamp } from "firebase/firestore";
import { Chat } from "./friends";

/**
 * Group settings that control group behavior
 */
export interface GroupSettings {
  isPublic: boolean;
  allowInvites: boolean;
  onlyAdminsCanPost: boolean;
  maxMembers?: number;
}

/**
 * Group with extended properties beyond basic Chat
 */
export interface Group extends Chat {
  type: "group";
  name: string;
  admins: string[]; // userIds who are admins
  settings: GroupSettings;
  updatedAt: Timestamp;
}


