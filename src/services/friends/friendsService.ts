/**
 * Friends Service
 * 
 * Handles friend relationship operations:
 * - Creating friend relationships
 * - Getting friends list
 * - Removing friends
 * - Subscribing to friends
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { Friend, FriendRequest } from "../../types/friends";
import { chatService } from "./chatService";

class FriendsService {
  private friendsCollection = collection(db, "friends");

  /**
   * Create bidirectional friend relationships when a request is accepted
   * @param request - The accepted friend request
   */
  async createFriendRelationship(request: FriendRequest): Promise<void> {
    // Get user details
    const [fromUserDoc, toUserDoc] = await Promise.all([
      getDoc(doc(db, "users", request.fromUserId)),
      getDoc(doc(db, "users", request.toUserId)),
    ]);

    const fromUserData = fromUserDoc.exists() ? fromUserDoc.data() : {};
    const toUserData = toUserDoc.exists() ? toUserDoc.data() : {};

    const batch = writeBatch(db);

    // Create friend relationship (bidirectional)
    const friendId1 = `friend_${request.fromUserId}_${request.toUserId}`;
    const friendId2 = `friend_${request.toUserId}_${request.fromUserId}`;

    const friend1: Omit<Friend, "id" | "createdAt" | "acceptedAt"> & {
      createdAt: any;
      acceptedAt: any;
      friendAvatar?: string | null;
    } = {
      userId: request.fromUserId,
      friendId: request.toUserId,
      friendName: request.toUserEmail.split("@")[0] || toUserData.username || "User",
      friendEmail: request.toUserEmail,
      friendAvatar: toUserData.photoURL || null,
      status: "accepted",
      requestedBy: request.fromUserId,
      createdAt: serverTimestamp(),
      acceptedAt: serverTimestamp(),
    };

    const friend2: Omit<Friend, "id" | "createdAt" | "acceptedAt"> & {
      createdAt: any;
      acceptedAt: any;
      friendAvatar?: string | null;
    } = {
      userId: request.toUserId,
      friendId: request.fromUserId,
      friendName: request.fromUserName,
      friendEmail: request.fromUserEmail,
      friendAvatar: request.fromUserAvatar || null,
      status: "accepted",
      requestedBy: request.fromUserId,
      createdAt: serverTimestamp(),
      acceptedAt: serverTimestamp(),
    };

    // Remove undefined fields before saving
    const cleanedFriend1: Record<string, any> = { ...friend1, id: friendId1 };
    const cleanedFriend2: Record<string, any> = { ...friend2, id: friendId2 };
    
    Object.keys(cleanedFriend1).forEach(key => {
      if (cleanedFriend1[key] === undefined) {
        delete cleanedFriend1[key];
      }
    });
    
    Object.keys(cleanedFriend2).forEach(key => {
      if (cleanedFriend2[key] === undefined) {
        delete cleanedFriend2[key];
      }
    });

    batch.set(doc(this.friendsCollection, friendId1), cleanedFriend1);
    batch.set(doc(this.friendsCollection, friendId2), cleanedFriend2);

    await batch.commit();
  }

  /**
   * Get all friends for the current user
   * @returns Promise resolving to array of friends
   */
  async getFriends(): Promise<Friend[]> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const q = query(
      this.friendsCollection,
      where("userId", "==", user.id),
      where("status", "==", "accepted"),
      orderBy("acceptedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Friend[];
  }

  /**
   * Subscribe to friends list (real-time updates)
   * @param callback - Callback function called when friends change
   * @returns Unsubscribe function
   */
  subscribeToFriends(callback: (friends: Friend[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    // Try with orderBy first (requires index), fallback to client-side sorting if index missing
    const q = query(
      this.friendsCollection,
      where("userId", "==", user.id),
      where("status", "==", "accepted"),
      orderBy("acceptedAt", "desc")
    );

    let unsubscribeFn: (() => void) | null = null;

    unsubscribeFn = onSnapshot(
      q,
      (snapshot) => {
        const friends = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Friend[];
        callback(friends);
      },
      (error) => {
        // If index is missing, fallback to query without orderBy and sort client-side
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for friends query, using fallback");
          const fallbackQuery = query(
            this.friendsCollection,
            where("userId", "==", user.id),
            where("status", "==", "accepted")
          );
          unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
            const friends = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as Friend[];
            // Sort client-side by acceptedAt descending
            friends.sort((a, b) => {
              const aTime = a.acceptedAt?.toMillis() || 0;
              const bTime = b.acceptedAt?.toMillis() || 0;
              return bTime - aTime;
            });
            callback(friends);
          });
        } else {
          console.error("Error subscribing to friends:", error);
          callback([]);
        }
      }
    );

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }

  /**
   * Remove a friend (deletes relationship and personal chat)
   * @param friendId - Friend's user ID to remove
   */
  async removeFriend(friendId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const batch = writeBatch(db);

    // Remove both friend relationships
    const friendId1 = `friend_${user.id}_${friendId}`;
    const friendId2 = `friend_${friendId}_${user.id}`;

    batch.delete(doc(this.friendsCollection, friendId1));
    batch.delete(doc(this.friendsCollection, friendId2));

    // Delete personal chat
    const chatId = chatService.getPersonalChatId(user.id, friendId);
    const chatCollection = collection(db, "chats");
    const chatDoc = await getDoc(doc(chatCollection, chatId));
    
    if (chatDoc.exists()) {
      batch.delete(doc(chatCollection, chatId));

      // Delete all messages in the chat
      const messagesCollection = collection(db, "chat_messages");
      const messagesQuery = query(
        messagesCollection,
        where("chatId", "==", chatId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.docs.forEach((msgDoc) => {
        batch.delete(msgDoc.ref);
      });
    }

    await batch.commit();
  }
}

export const friendsService = new FriendsService();

