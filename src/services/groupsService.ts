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
  deleteField,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "../utils/realTimeAuth";
import { Chat, ChatMessage, friendsService } from "./friendsService";

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  type: "group";
  participants: string[]; // userIds
  participantNames: Record<string, string>;
  participantEmails: Record<string, string>;
  admins: string[]; // userIds who are admins
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: {
    text: string;
    senderName: string;
    timestamp: Timestamp;
  };
  unreadCount: Record<string, number>; // userId -> unread count
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    onlyAdminsCanPost: boolean;
    maxMembers?: number;
  };
}

class GroupsService {
  private groupsCollection = collection(db, "groups");
  private chatsCollection = collection(db, "chats");
  private messagesCollection = collection(db, "chat_messages");

  /**
   * Create a new group
   */
  async createGroup(
    name: string,
    description?: string,
    settings?: Partial<Group["settings"]>
  ): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    if (!name.trim()) {
      throw new Error("Group name is required");
    }

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const defaultSettings: Group["settings"] = {
      isPublic: false,
      allowInvites: true,
      onlyAdminsCanPost: false,
      maxMembers: 100,
      ...settings,
    };

    const groupData: Omit<Group, "id" | "createdAt" | "updatedAt"> & {
      createdAt: any;
      updatedAt: any;
    } = {
      name: name.trim(),
      description: description?.trim(),
      type: "group",
      participants: [user.id],
      participantNames: {
        [user.id]: user.displayName || user.email || "User",
      },
      participantEmails: {
        [user.id]: user.email || "",
      },
      admins: [user.id], // Creator is admin
      createdBy: user.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: {
        [user.id]: 0,
      },
      settings: defaultSettings,
    };

    // Create group document
    await setDoc(doc(this.groupsCollection, groupId), {
      ...groupData,
      id: groupId,
    });

    // Create corresponding chat
    const chatData: Omit<Chat, "id" | "createdAt"> & {
      createdAt: any;
    } = {
      type: "group",
      name: name.trim(),
      description: description?.trim(),
      participants: [user.id],
      participantNames: {
        [user.id]: user.displayName || user.email || "User",
      },
      participantEmails: {
        [user.id]: user.email || "",
      },
      createdBy: user.id,
      createdAt: serverTimestamp(),
      unreadCount: {
        [user.id]: 0,
      },
    };

    await setDoc(doc(this.chatsCollection, groupId), {
      ...chatData,
      id: groupId,
    });

    return groupId;
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group | null> {
    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      return null;
    }
    return { ...groupDoc.data(), id: groupDoc.id } as Group;
  }

  /**
   * Subscribe to group updates
   */
  subscribeToGroup(
    groupId: string,
    callback: (group: Group | null) => void
  ): () => void {
    return onSnapshot(doc(this.groupsCollection, groupId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...snapshot.data(), id: snapshot.id } as Group);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Invite friends to group
   */
  async inviteFriendsToGroup(groupId: string, friendIds: string[]): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    // Check if user is admin or if invites are allowed
    if (!group.admins.includes(user.id) && !group.settings.allowInvites) {
      throw new Error("You don't have permission to invite members");
    }

    // Check member limit
    const currentMemberCount = group.participants.length;
    const maxMembers = group.settings.maxMembers || 100;
    if (currentMemberCount + friendIds.length > maxMembers) {
      throw new Error(
        `Group is full. Maximum ${maxMembers} members allowed.`
      );
    }

    // Get friend details
    const friends = await friendsService.getFriends();
    const friendsMap = new Map(friends.map((f) => [f.friendId, f]));

    const newParticipants: string[] = [];
    const newParticipantNames: Record<string, string> = {};
    const newParticipantEmails: Record<string, string> = {};
    const newUnreadCount: Record<string, number> = {};

    for (const friendId of friendIds) {
      if (group.participants.includes(friendId)) {
        continue; // Already in group
      }

      const friend = friendsMap.get(friendId);
      if (!friend) {
        continue; // Not a friend, skip
      }

      newParticipants.push(friendId);
      newParticipantNames[friendId] = friend.friendName;
      newParticipantEmails[friendId] = friend.friendEmail;
      newUnreadCount[friendId] = 0;
    }

    if (newParticipants.length === 0) {
      throw new Error("No valid friends to invite");
    }

    const batch = writeBatch(db);

    // Update group
    batch.update(doc(this.groupsCollection, groupId), {
      participants: arrayUnion(...newParticipants),
      participantNames: { ...group.participantNames, ...newParticipantNames },
      participantEmails: {
        ...group.participantEmails,
        ...newParticipantEmails,
      },
      [`unreadCount.${user.id}`]: increment(0), // Trigger update
      updatedAt: serverTimestamp(),
    });

    // Also add unreadCount entries
    newParticipants.forEach((participantId) => {
      batch.update(doc(this.groupsCollection, groupId), {
        [`unreadCount.${participantId}`]: 0,
      });
    });

    // Update chat
    const chatDoc = await getDoc(doc(this.chatsCollection, groupId));
    if (chatDoc.exists()) {
      const chat = chatDoc.data() as Chat;
      batch.update(doc(this.chatsCollection, groupId), {
        participants: arrayUnion(...newParticipants),
        participantNames: { ...chat.participantNames, ...newParticipantNames },
        participantEmails: {
          ...chat.participantEmails,
          ...newParticipantEmails,
        },
      });

      newParticipants.forEach((participantId) => {
        batch.update(doc(this.chatsCollection, groupId), {
          [`unreadCount.${participantId}`]: 0,
        });
      });
    }

    // Send system message about new members
    const systemMessage: Omit<ChatMessage, "id" | "timestamp"> & {
      timestamp: any;
    } = {
      chatId: groupId,
      senderId: "system",
      senderName: "System",
      message: `${newParticipants
        .map((id) => newParticipantNames[id])
        .join(", ")} joined the group`,
      type: "system",
      readBy: [],
    };

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    batch.set(doc(this.messagesCollection, messageId), {
      ...systemMessage,
      id: messageId,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
  }

  /**
   * Exit a group
   */
  async exitGroup(groupId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    if (!group.participants.includes(user.id)) {
      throw new Error("You are not a member of this group");
    }

    // If user is the creator and only member, delete the group
    if (group.createdBy === user.id && group.participants.length === 1) {
      await this.deleteGroup(groupId);
      return;
    }

    const batch = writeBatch(db);

    // Remove from group
    const groupUpdate: any = {
      participants: arrayRemove(user.id),
      updatedAt: serverTimestamp(),
    };
    groupUpdate[`unreadCount.${user.id}`] = deleteField();
    batch.update(doc(this.groupsCollection, groupId), groupUpdate);

    // If user was an admin, remove from admins
    if (group.admins.includes(user.id)) {
      batch.update(doc(this.groupsCollection, groupId), {
        admins: arrayRemove(user.id),
      });
    }

    // Remove from chat
    const chatDoc = await getDoc(doc(this.chatsCollection, groupId));
    if (chatDoc.exists()) {
      const chatUpdate: any = {
        participants: arrayRemove(user.id),
      };
      chatUpdate[`unreadCount.${user.id}`] = deleteField();
      batch.update(doc(this.chatsCollection, groupId), chatUpdate);
    }

    // Send system message
    const systemMessage: Omit<ChatMessage, "id" | "timestamp"> & {
      timestamp: any;
    } = {
      chatId: groupId,
      senderId: "system",
      senderName: "System",
      message: `${group.participantNames[user.id]} left the group`,
      type: "system",
      readBy: [],
    };

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    batch.set(doc(this.messagesCollection, messageId), {
      ...systemMessage,
      id: messageId,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
  }

  /**
   * Delete a group (creator only)
   */
  async deleteGroup(groupId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    if (group.createdBy !== user.id) {
      throw new Error("Only the group creator can delete the group");
    }

    const batch = writeBatch(db);

    // Delete group
    batch.delete(doc(this.groupsCollection, groupId));

    // Delete chat
    batch.delete(doc(this.chatsCollection, groupId));

    // Delete all messages
    const messagesQuery = query(
      this.messagesCollection,
      where("chatId", "==", groupId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.docs.forEach((msgDoc) => {
      batch.delete(msgDoc.ref);
    });

    await batch.commit();
  }

  /**
   * Update group settings
   */
  async updateGroupSettings(
    groupId: string,
    settings: Partial<Group["settings"]>
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    if (!group.admins.includes(user.id)) {
      throw new Error("Only admins can update group settings");
    }

    await updateDoc(doc(this.groupsCollection, groupId), {
      settings: { ...group.settings, ...settings },
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Promote member to admin
   */
  async promoteToAdmin(groupId: string, memberId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    if (!group.admins.includes(user.id)) {
      throw new Error("Only admins can promote members");
    }

    if (!group.participants.includes(memberId)) {
      throw new Error("User is not a member of this group");
    }

    if (group.admins.includes(memberId)) {
      throw new Error("User is already an admin");
    }

    await updateDoc(doc(this.groupsCollection, groupId), {
      admins: arrayUnion(memberId),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Remove member from group (admin only)
   */
  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    if (!group.admins.includes(user.id)) {
      throw new Error("Only admins can remove members");
    }

    if (memberId === group.createdBy) {
      throw new Error("Cannot remove the group creator");
    }

    if (!group.participants.includes(memberId)) {
      throw new Error("User is not a member of this group");
    }

    const batch = writeBatch(db);

    // Remove from group
    const groupUpdate: any = {
      participants: arrayRemove(memberId),
      updatedAt: serverTimestamp(),
    };
    groupUpdate[`unreadCount.${memberId}`] = deleteField();
    batch.update(doc(this.groupsCollection, groupId), groupUpdate);

    // Remove from admins if they were admin
    if (group.admins.includes(memberId)) {
      batch.update(doc(this.groupsCollection, groupId), {
        admins: arrayRemove(memberId),
      });
    }

    // Remove from chat
    const chatDoc = await getDoc(doc(this.chatsCollection, groupId));
    if (chatDoc.exists()) {
      const chatUpdate: any = {
        participants: arrayRemove(memberId),
      };
      chatUpdate[`unreadCount.${memberId}`] = deleteField();
      batch.update(doc(this.chatsCollection, groupId), chatUpdate);
    }

    // Send system message
    const systemMessage: Omit<ChatMessage, "id" | "timestamp"> & {
      timestamp: any;
    } = {
      chatId: groupId,
      senderId: "system",
      senderName: "System",
      message: `${group.participantNames[memberId]} was removed from the group`,
      type: "system",
      readBy: [],
    };

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    batch.set(doc(this.messagesCollection, messageId), {
      ...systemMessage,
      id: messageId,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
  }

  /**
   * Subscribe to user's groups
   */
  subscribeToGroups(callback: (groups: Group[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    // Try with orderBy first (requires index), fallback to client-side sorting if index missing
    const q = query(
      this.groupsCollection,
      where("participants", "array-contains", user.id),
      orderBy("updatedAt", "desc")
    );

    let unsubscribeFn: (() => void) | null = null;

    unsubscribeFn = onSnapshot(
      q,
      (snapshot) => {
        const groups = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Group[];
        callback(groups);
      },
      (error) => {
        // If index is missing, fallback to query without orderBy and sort client-side
        if (error.code === 'failed-precondition') {
          console.warn("Index missing for groups query, using fallback");
          const fallbackQuery = query(
            this.groupsCollection,
            where("participants", "array-contains", user.id)
          );
          unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
            const groups = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as Group[];
            // Sort client-side by updatedAt descending
            groups.sort((a, b) => {
              const aTime = a.updatedAt?.toMillis() || 0;
              const bTime = b.updatedAt?.toMillis() || 0;
              return bTime - aTime;
            });
            callback(groups);
          });
        } else {
          console.error("Error subscribing to groups:", error);
          callback([]);
        }
      }
    );

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }
}

export const groupsService = new GroupsService();


