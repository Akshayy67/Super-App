/**
 * Friend Requests Service
 * 
 * Handles all friend request operations:
 * - Sending friend requests by email
 * - Accepting/rejecting friend requests
 * - Querying friend requests
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { FriendRequest } from "../../types/friends";

class FriendRequestsService {
  private friendRequestsCollection = collection(db, "friend_requests");
  private friendsCollection = collection(db, "friends");

  /**
   * Send a friend request by email address
   * @param email - Email address of the user to send request to
   * @returns Promise resolving to the request ID
   * @throws Error if email is invalid or request already exists
   */
  async sendFriendRequestByEmail(email: string): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Validate email
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === user.email?.toLowerCase()) {
      throw new Error("You cannot send a friend request to yourself");
    }

    // Find user by email
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), where("email", "==", normalizedEmail), limit(1))
    );

    if (usersSnapshot.empty) {
      throw new Error("User with this email not found");
    }

    const targetUserDoc = usersSnapshot.docs[0];
    const targetUserId = targetUserDoc.id;

    // Check if already friends
    const existingFriendQuery = query(
      this.friendsCollection,
      where("userId", "==", user.id),
      where("friendId", "==", targetUserId),
      limit(1)
    );

    const existingFriend = await getDocs(existingFriendQuery);
    if (!existingFriend.empty) {
      const friend = existingFriend.docs[0].data();
      if (friend.status === "accepted") {
        throw new Error("You are already friends with this user");
      }
      if (friend.status === "pending") {
        throw new Error("Friend request already sent");
      }
    }

    // Check if request already exists
    const existingRequestQuery = query(
      this.friendRequestsCollection,
      where("fromUserId", "==", user.id),
      where("toUserId", "==", targetUserId),
      where("status", "==", "pending"),
      limit(1)
    );

    const existingRequest = await getDocs(existingRequestQuery);
    if (!existingRequest.empty) {
      throw new Error("Friend request already sent");
    }

    // Create friend request
    const requestId = `fr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const requestData: Omit<FriendRequest, "id" | "createdAt"> & {
      createdAt: any;
      fromUserAvatar?: string | null;
    } = {
      fromUserId: user.id,
      fromUserName: user.displayName || user.email || "Unknown",
      fromUserEmail: user.email || "",
      fromUserAvatar: user.photoURL || null,
      toUserId: targetUserId,
      toUserEmail: normalizedEmail,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    // Remove undefined fields before saving
    const cleanedRequestData: Record<string, any> = {
      ...requestData,
      id: requestId,
    };
    Object.keys(cleanedRequestData).forEach(key => {
      if (cleanedRequestData[key] === undefined) {
        delete cleanedRequestData[key];
      }
    });

    await setDoc(doc(this.friendRequestsCollection, requestId), cleanedRequestData);

    return requestId;
  }

  /**
   * Accept a friend request
   * Creates bidirectional friend relationships and a personal chat
   * @param requestId - ID of the friend request to accept
   * @throws Error if request not found or already responded to
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const requestDoc = await getDoc(doc(this.friendRequestsCollection, requestId));
    if (!requestDoc.exists()) {
      throw new Error("Friend request not found");
    }

    const request = requestDoc.data() as FriendRequest;

    if (request.toUserId !== user.id) {
      throw new Error("You can only accept requests sent to you");
    }

    if (request.status !== "pending") {
      throw new Error("This request has already been responded to");
    }

    // Import services to create friend relationships
    const { friendsService } = await import("./friendsService");
    const { chatService } = await import("./chatService");

    // Create friend relationships and chat
    await friendsService.createFriendRelationship(request);
    await chatService.createPersonalChat(request.fromUserId, request.toUserId);

    // Update request status
    await updateDoc(doc(this.friendRequestsCollection, requestId), {
      status: "accepted",
      respondedAt: serverTimestamp(),
    });
  }

  /**
   * Reject a friend request
   * @param requestId - ID of the friend request to reject
   * @throws Error if request not found or already responded to
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const requestDoc = await getDoc(doc(this.friendRequestsCollection, requestId));
    if (!requestDoc.exists()) {
      throw new Error("Friend request not found");
    }

    const request = requestDoc.data() as FriendRequest;

    if (request.toUserId !== user.id) {
      throw new Error("You can only reject requests sent to you");
    }

    if (request.status !== "pending") {
      throw new Error("This request has already been responded to");
    }

    await updateDoc(doc(this.friendRequestsCollection, requestId), {
      status: "rejected",
      respondedAt: serverTimestamp(),
    });
  }

  /**
   * Subscribe to incoming friend requests
   * @param callback - Callback function called when requests change
   * @returns Unsubscribe function
   */
  subscribeToFriendRequests(
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    // Try with orderBy first (requires index), fallback to client-side sorting if index missing
    const q = query(
      this.friendRequestsCollection,
      where("toUserId", "==", user.id),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    let unsubscribeFn: (() => void) | null = null;

    unsubscribeFn = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as FriendRequest[];
        callback(requests);
      },
      (error) => {
        // If index is missing, fallback to query without orderBy and sort client-side
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for friend requests query, using fallback");
          const fallbackQuery = query(
            this.friendRequestsCollection,
            where("toUserId", "==", user.id),
            where("status", "==", "pending")
          );
          unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
            const requests = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as FriendRequest[];
            // Sort client-side by createdAt descending
            requests.sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0;
              const bTime = b.createdAt?.toMillis() || 0;
              return bTime - aTime;
            });
            callback(requests);
          });
        } else {
          console.error("Error subscribing to friend requests:", error);
          callback([]);
        }
      }
    );

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }

  /**
   * Subscribe to sent friend requests
   * @param callback - Callback function called when requests change
   * @returns Unsubscribe function
   */
  subscribeToSentFriendRequests(
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    // Try with orderBy first (requires index), fallback to client-side sorting if index missing
    const q = query(
      this.friendRequestsCollection,
      where("fromUserId", "==", user.id),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    let unsubscribeFn: (() => void) | null = null;

    unsubscribeFn = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as FriendRequest[];
        callback(requests);
      },
      (error) => {
        // If index is missing, fallback to query without orderBy and sort client-side
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for sent friend requests query, using fallback");
          const fallbackQuery = query(
            this.friendRequestsCollection,
            where("fromUserId", "==", user.id),
            where("status", "==", "pending")
          );
          unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
            const requests = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as FriendRequest[];
            // Sort client-side by createdAt descending
            requests.sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0;
              const bTime = b.createdAt?.toMillis() || 0;
              return bTime - aTime;
            });
            callback(requests);
          });
        } else {
          console.error("Error subscribing to sent friend requests:", error);
          callback([]);
        }
      }
    );

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }
}

export const friendRequestsService = new FriendRequestsService();

