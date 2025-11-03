/**
 * Blocked Users Service
 * Manages user blocking functionality - only admin can block/unblock users
 */

import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { isAdmin } from "../utils/adminUtils";

const BLOCKED_USERS_COLLECTION = "blocked_users";

export interface BlockedUser {
  userId: string;
  email: string;
  blockedAt: string;
  blockedBy: string; // Admin email who blocked them
  reason?: string;
}

/**
 * Check if a user is blocked
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  try {
    const blockedDoc = await getDoc(doc(db, BLOCKED_USERS_COLLECTION, userId));
    return blockedDoc.exists();
  } catch (error) {
    console.error("Error checking if user is blocked:", error);
    return false;
  }
}

/**
 * Check if a user is blocked by email
 */
export async function isUserBlockedByEmail(email: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, BLOCKED_USERS_COLLECTION),
      where("email", "==", email.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if user is blocked by email:", error);
    return false;
  }
}

/**
 * Get blocked user info
 */
export async function getBlockedUser(userId: string): Promise<BlockedUser | null> {
  try {
    const blockedDoc = await getDoc(doc(db, BLOCKED_USERS_COLLECTION, userId));
    if (!blockedDoc.exists()) {
      return null;
    }
    return {
      userId: blockedDoc.id,
      ...blockedDoc.data(),
    } as BlockedUser;
  } catch (error) {
    console.error("Error getting blocked user:", error);
    return null;
  }
}

/**
 * Block a user (admin only)
 */
export async function blockUser(userId: string, email: string, reason?: string): Promise<void> {
  if (!isAdmin()) {
    throw new Error("Only admin can block users");
  }

  try {
    const adminUser = await import("../utils/realTimeAuth").then(m => m.realTimeAuth.getCurrentUser());
    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    const blockedUser: BlockedUser = {
      userId,
      email: email.toLowerCase(),
      blockedAt: new Date().toISOString(),
      blockedBy: adminUser.email || "akshayjuluri6704@gmail.com",
      reason: reason || undefined,
    };

    await setDoc(doc(db, BLOCKED_USERS_COLLECTION, userId), blockedUser);
    console.log(`✅ User ${email} blocked by admin`);
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
}

/**
 * Unblock a user (admin only)
 */
export async function unblockUser(userId: string): Promise<void> {
  if (!isAdmin()) {
    throw new Error("Only admin can unblock users");
  }

  try {
    await deleteDoc(doc(db, BLOCKED_USERS_COLLECTION, userId));
    console.log(`✅ User ${userId} unblocked by admin`);
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
}

/**
 * Get all blocked users (admin only)
 */
export async function getAllBlockedUsers(): Promise<BlockedUser[]> {
  if (!isAdmin()) {
    throw new Error("Only admin can view blocked users");
  }

  try {
    const querySnapshot = await getDocs(collection(db, BLOCKED_USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data(),
    } as BlockedUser));
  } catch (error) {
    console.error("Error getting blocked users:", error);
    throw error;
  }
}

