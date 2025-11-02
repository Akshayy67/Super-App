import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "../utils/realTimeAuth";

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

export interface Group extends Chat {
  type: "group";
  admins: string[]; // userIds who are admins
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    onlyAdminsCanPost: boolean;
  };
}

class FriendsService {
  private friendsCollection = collection(db, "friends");
  private friendRequestsCollection = collection(db, "friend_requests");
  private chatsCollection = collection(db, "chats");
  private messagesCollection = collection(db, "chat_messages");

  // ==================== FRIEND REQUESTS ====================

  /**
   * Send a friend request by email
   */
  async sendFriendRequestByEmail(email: string): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === user.email?.toLowerCase()) {
      throw new Error("You cannot send a friend request to yourself");
    }

    // Find user by email
    const usersSnapshot = await getDocs(
      query(
        collection(db, "users"),
        where("email", "==", normalizedEmail),
        limit(1)
      )
    );

    if (usersSnapshot.empty) {
      throw new Error("User with this email not found");
    }

    const targetUserDoc = usersSnapshot.docs[0];
    const targetUserId = targetUserDoc.id;
    const targetUserData = targetUserDoc.data();

    // Check if already friends
    const existingFriendQuery = query(
      this.friendsCollection,
      where("userId", "==", user.id),
      where("friendId", "==", targetUserId),
      limit(1)
    );

    const existingFriend = await getDocs(existingFriendQuery);
    if (!existingFriend.empty) {
      const friend = existingFriend.docs[0].data() as Friend;
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

    // Get user details for both users
    const fromUserDoc = await getDoc(doc(db, "users", request.fromUserId));
    const toUserDoc = await getDoc(doc(db, "users", request.toUserId));

    const fromUserData = fromUserDoc.exists() ? fromUserDoc.data() : {};
    const toUserData = toUserDoc.exists() ? toUserDoc.data() : {};

    const batch = writeBatch(db);

    // Create friend relationship (bidirectional)
    const friendId1 = `friend_${request.fromUserId}_${request.toUserId}`;
    const friendId2 = `friend_${request.toUserId}_${request.fromUserId}`;

    const friend1: Omit<Friend, "id" | "createdAt" | "acceptedAt"> & {
      createdAt: any;
      acceptedAt: any;
    } = {
      userId: request.fromUserId,
      friendId: request.toUserId,
      friendName: request.toUserEmail.split("@")[0] || toUserData.username || toUserData.email?.split("@")[0] || "User",
      friendEmail: request.toUserEmail,
      friendAvatar: toUserData.photoURL,
      status: "accepted",
      requestedBy: request.fromUserId,
      createdAt: serverTimestamp(),
      acceptedAt: serverTimestamp(),
    };

    const friend2: Omit<Friend, "id" | "createdAt" | "acceptedAt"> & {
      createdAt: any;
      acceptedAt: any;
    } = {
      userId: request.toUserId,
      friendId: request.fromUserId,
      friendName: request.fromUserName,
      friendEmail: request.fromUserEmail,
      friendAvatar: request.fromUserAvatar,
      status: "accepted",
      requestedBy: request.fromUserId,
      createdAt: serverTimestamp(),
      acceptedAt: serverTimestamp(),
    };

    batch.set(doc(this.friendsCollection, friendId1), { ...friend1, id: friendId1 });
    batch.set(doc(this.friendsCollection, friendId2), { ...friend2, id: friendId2 });

    // Update request status
    batch.update(doc(this.friendRequestsCollection, requestId), {
      status: "accepted",
      respondedAt: serverTimestamp(),
    });

    // Create personal chat between the two friends
    const chatId = this.getPersonalChatId(request.fromUserId, request.toUserId);
    const personalChat: Omit<Chat, "id" | "createdAt"> & {
      createdAt: any;
    } = {
      type: "personal",
      participants: [request.fromUserId, request.toUserId],
      participantNames: {
        [request.fromUserId]: request.fromUserName,
        [request.toUserId]: user.displayName || user.email || "User",
      },
      participantEmails: {
        [request.fromUserId]: request.fromUserEmail,
        [request.toUserId]: request.toUserEmail,
      },
      createdAt: serverTimestamp(),
      unreadCount: {
        [request.fromUserId]: 0,
        [request.toUserId]: 0,
      },
    };

    batch.set(doc(this.chatsCollection, chatId), { ...personalChat, id: chatId });

    await batch.commit();
  }

  /**
   * Reject a friend request
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
   * Get personal chat ID for two users
   */
  private getPersonalChatId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `personal_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Subscribe to friend requests
   */
  subscribeToFriendRequests(
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const q = query(
      this.friendRequestsCollection,
      where("toUserId", "==", user.id),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as FriendRequest[];
      callback(requests);
    });
  }

  /**
   * Subscribe to sent friend requests
   */
  subscribeToSentFriendRequests(
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const q = query(
      this.friendRequestsCollection,
      where("fromUserId", "==", user.id),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as FriendRequest[];
      callback(requests);
    });
  }

  /**
   * Get all friends
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
   * Subscribe to friends list
   */
  subscribeToFriends(callback: (friends: Friend[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const q = query(
      this.friendsCollection,
      where("userId", "==", user.id),
      where("status", "==", "accepted"),
      orderBy("acceptedAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const friends = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Friend[];
      callback(friends);
    });
  }

  /**
   * Remove a friend
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
    const chatId = this.getPersonalChatId(user.id, friendId);
    const chatDoc = await getDoc(doc(this.chatsCollection, chatId));
    if (chatDoc.exists()) {
      batch.delete(doc(this.chatsCollection, chatId));
      
      // Delete all messages in the chat
      const messagesQuery = query(
        this.messagesCollection,
        where("chatId", "==", chatId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.docs.forEach((msgDoc) => {
        batch.delete(msgDoc.ref);
      });
    }

    await batch.commit();
  }

  // ==================== CHAT ====================

  /**
   * Send a chat message
   */
  async sendChatMessage(
    chatId: string,
    message: string,
    type: "text" | "image" | "file" = "text",
    replyTo?: string
  ): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const chatDoc = await getDoc(doc(this.chatsCollection, chatId));
    if (!chatDoc.exists()) {
      throw new Error("Chat not found");
    }

    const chat = chatDoc.data() as Chat;

    if (!chat.participants.includes(user.id)) {
      throw new Error("You are not a participant of this chat");
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData: Omit<ChatMessage, "id" | "timestamp"> & {
      timestamp: any;
      senderAvatar?: string | null;
    } = {
      chatId,
      senderId: user.id,
      senderName: user.displayName || user.email || "User",
      senderAvatar: user.photoURL || null,
      message: message.trim(),
      type,
      timestamp: serverTimestamp(),
      readBy: [user.id], // Sender has read their own message
      ...(replyTo && { replyTo }),
    };

    // Remove undefined fields before saving
    const cleanedMessageData: Record<string, any> = {
      ...messageData,
      id: messageId,
    };
    Object.keys(cleanedMessageData).forEach(key => {
      if (cleanedMessageData[key] === undefined) {
        delete cleanedMessageData[key];
      }
    });

    await setDoc(doc(this.messagesCollection, messageId), cleanedMessageData);

    // Update chat with last message
    const otherParticipants = chat.participants.filter((id) => id !== user.id);
    const unreadUpdates: Record<string, any> = {};
    otherParticipants.forEach((participantId) => {
      unreadUpdates[`unreadCount.${participantId}`] = increment(1);
    });

    await updateDoc(doc(this.chatsCollection, chatId), {
      lastMessage: {
        text: message.trim(),
        senderName: user.displayName || user.email || "User",
        timestamp: serverTimestamp(),
      },
      ...unreadUpdates,
    });

    return messageId;
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToChatMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      this.messagesCollection,
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as ChatMessage[];
      callback(messages);
    });
  }

  /**
   * Mark messages as read
   */
  async markChatAsRead(chatId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const chatDoc = await getDoc(doc(this.chatsCollection, chatId));
    if (!chatDoc.exists()) {
      throw new Error("Chat not found");
    }

    const chat = chatDoc.data() as Chat;
    if (!chat.participants.includes(user.id)) {
      throw new Error("You are not a participant of this chat");
    }

    // Mark all unread messages in this chat as read
    const unreadMessagesQuery = query(
      this.messagesCollection,
      where("chatId", "==", chatId),
      where("readBy", "array-contains", user.id) === false
    );

    // Note: Firestore doesn't support "array-contains" negation directly
    // We'll get all messages and filter client-side, or update chat unreadCount
    await updateDoc(doc(this.chatsCollection, chatId), {
      [`unreadCount.${user.id}`]: 0,
    });

    // Also update readBy for recent messages
    const recentMessagesQuery = query(
      this.messagesCollection,
      where("chatId", "==", chatId),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const messagesSnapshot = await getDocs(recentMessagesQuery);
    const batch = writeBatch(db);

    messagesSnapshot.docs.forEach((msgDoc) => {
      const message = msgDoc.data() as ChatMessage;
      if (!message.readBy.includes(user.id)) {
        batch.update(msgDoc.ref, {
          readBy: arrayUnion(user.id),
        });
      }
    });

    await batch.commit();
  }

  /**
   * Get or create personal chat
   */
  async getPersonalChat(friendId: string): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const chatId = this.getPersonalChatId(user.id, friendId);
    const chatDoc = await getDoc(doc(this.chatsCollection, chatId));

    if (chatDoc.exists()) {
      return chatId;
    }

    // Get friend details
    const friendDoc = await getDoc(doc(this.friendsCollection, `friend_${user.id}_${friendId}`));
    if (!friendDoc.exists()) {
      throw new Error("Friend relationship not found");
    }

    const friend = friendDoc.data() as Friend;
    const userDoc = await getDoc(doc(db, "users", user.id));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const chatData: Omit<Chat, "id" | "createdAt"> & {
      createdAt: any;
    } = {
      type: "personal",
      participants: [user.id, friendId],
      participantNames: {
        [user.id]: user.displayName || user.email || "User",
        [friendId]: friend.friendName,
      },
      participantEmails: {
        [user.id]: user.email || "",
        [friendId]: friend.friendEmail,
      },
      createdAt: serverTimestamp(),
      unreadCount: {
        [user.id]: 0,
        [friendId]: 0,
      },
    };

    await setDoc(doc(this.chatsCollection, chatId), {
      ...chatData,
      id: chatId,
    });

    return chatId;
  }

  /**
   * Subscribe to user's chats
   */
  subscribeToChats(callback: (chats: Chat[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const q = query(
      this.chatsCollection,
      where("participants", "array-contains", user.id),
      orderBy("lastMessage.timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Chat[];
      callback(chats);
    });
  }
}

export const friendsService = new FriendsService();

