/**
 * Chat Service
 * 
 * Handles all chat-related operations:
 * - Sending messages
 * - Creating personal chats
 * - Managing chat subscriptions
 * - Marking messages as read
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
  arrayUnion,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { Chat, ChatMessage } from "../../types/friends";

class ChatService {
  private chatsCollection = collection(db, "chats");
  private messagesCollection = collection(db, "chat_messages");

  /**
   * Get personal chat ID for two users (deterministic)
   */
  getPersonalChatId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `personal_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Create a personal chat between two users
   * @param userId1 - First user ID
   * @param userId2 - Second user ID
   * @returns Promise resolving to the chat ID
   */
  async createPersonalChat(userId1: string, userId2: string): Promise<string> {
    const chatId = this.getPersonalChatId(userId1, userId2);
    const chatDoc = await getDoc(doc(this.chatsCollection, chatId));

    if (chatDoc.exists()) {
      return chatId;
    }

    // Get user details
    const [user1Doc, user2Doc] = await Promise.all([
      getDoc(doc(db, "users", userId1)),
      getDoc(doc(db, "users", userId2)),
    ]);

    const user1Data = user1Doc.exists() ? user1Doc.data() : {};
    const user2Data = user2Doc.exists() ? user2Doc.data() : {};

    const chatData: Omit<Chat, "id" | "createdAt"> & {
      createdAt: any;
    } = {
      type: "personal",
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: user1Data.displayName || user1Data.email || "User",
        [userId2]: user2Data.displayName || user2Data.email || "User",
      },
      participantEmails: {
        [userId1]: user1Data.email || "",
        [userId2]: user2Data.email || "",
      },
      createdAt: serverTimestamp(),
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
    };

    await setDoc(doc(this.chatsCollection, chatId), {
      ...chatData,
      id: chatId,
    });

    return chatId;
  }

  /**
   * Get or create personal chat with a friend
   * @param friendId - Friend's user ID
   * @returns Promise resolving to the chat ID
   */
  async getPersonalChat(friendId: string): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const chatId = this.getPersonalChatId(user.id, friendId);
    const chatDoc = await getDoc(doc(this.chatsCollection, chatId));

    if (chatDoc.exists()) {
      return chatId;
    }

    // Import friends service to get friend details
    const { friendsService } = await import("./friendsService");
    const friends = await friendsService.getFriends();
    const friend = friends.find((f) => f.friendId === friendId);

    if (!friend) {
      throw new Error("Friend relationship not found");
    }

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
   * Send a chat message
   * @param chatId - Chat ID to send message to
   * @param message - Message text
   * @param type - Message type (text, image, file, system)
   * @param replyTo - Optional message ID to reply to
   * @returns Promise resolving to the message ID
   */
  async sendMessage(
    chatId: string,
    message: string,
    type: "text" | "image" | "file" | "system" = "text",
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
      readBy: [user.id],
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

    // Update chat with last message and increment unread for other participants
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
   * @param chatId - Chat ID to subscribe to
   * @param callback - Callback function called when messages change
   * @returns Unsubscribe function
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      this.messagesCollection,
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    let unsubscribeFn: (() => void) | null = null;

    unsubscribeFn = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as ChatMessage[];
        callback(messages);
      },
      (error) => {
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for messages query, using fallback");
          const fallbackQuery = query(
            this.messagesCollection,
            where("chatId", "==", chatId)
          );
          unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as ChatMessage[];
            // Sort client-side by timestamp
            messages.sort((a, b) => {
              let aTime = 0;
              let bTime = 0;
              
              if (a.timestamp) {
                if (a.timestamp.toMillis) {
                  aTime = a.timestamp.toMillis();
                } else if ((a.timestamp as any).seconds) {
                  aTime = (a.timestamp as any).seconds * 1000;
                }
              }
              
              if (b.timestamp) {
                if (b.timestamp.toMillis) {
                  bTime = b.timestamp.toMillis();
                } else if ((b.timestamp as any).seconds) {
                  bTime = (b.timestamp as any).seconds * 1000;
                }
              }
              
              return aTime - bTime;
            });
            callback(messages);
          });
        } else {
          console.error("Error subscribing to messages:", error);
          callback([]);
        }
      }
    );
    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }

  /**
   * Mark chat messages as read
   * @param chatId - Chat ID to mark as read
   */
  async markAsRead(chatId: string): Promise<void> {
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

    // Reset unread count
    await updateDoc(doc(this.chatsCollection, chatId), {
      [`unreadCount.${user.id}`]: 0,
    });

    // Mark recent messages as read
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
   * Subscribe to user's chats
   * @param callback - Callback function called when chats change
   * @returns Unsubscribe function
   */
  subscribeToChats(callback: (chats: Chat[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    // Try with orderBy first (requires index), fallback to client-side sorting if index missing
    const q = query(
      this.chatsCollection,
      where("participants", "array-contains", user.id),
      orderBy("lastMessage.timestamp", "desc")
    );

    let unsubscribeFn: (() => void) | null = null;

    unsubscribeFn = onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Chat[];
        callback(chats);
      },
      (error) => {
        // If index is missing, fallback to query without orderBy and sort client-side
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for chats query, using fallback");
          const fallbackQuery = query(
            this.chatsCollection,
            where("participants", "array-contains", user.id)
          );
          unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
            const chats = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as Chat[];
            // Sort client-side by lastMessage.timestamp descending
            chats.sort((a, b) => {
              const aTime = a.lastMessage?.timestamp?.toMillis() || 0;
              const bTime = b.lastMessage?.timestamp?.toMillis() || 0;
              return bTime - aTime;
            });
            callback(chats);
          });
        } else {
          console.error("Error subscribing to chats:", error);
          callback([]);
        }
      }
    );

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }
}

export const chatService = new ChatService();

