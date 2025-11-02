/**
 * Group Management Service
 * 
 * Handles group creation, settings, and membership management:
 * - Creating groups
 * - Updating group settings
 * - Managing admins
 * - Exiting/deleting groups
 */

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
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { Group, GroupSettings } from "../../types/groups";
import { ChatMessage } from "../../types/friends";
import { chatService } from "../friends/chatService";

class GroupManagementService {
  private groupsCollection = collection(db, "groups");
  private chatsCollection = collection(db, "chats");
  private messagesCollection = collection(db, "chat_messages");

  /**
   * Create a new group
   * @param name - Group name
   * @param description - Optional group description
   * @param settings - Optional group settings
   * @returns Promise resolving to the group ID
   */
  async createGroup(
    name: string,
    description?: string,
    settings?: Partial<GroupSettings>
  ): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    if (!name.trim()) {
      throw new Error("Group name is required");
    }

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const defaultSettings: GroupSettings = {
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
      admins: [user.id],
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
    const chatData = {
      type: "group" as const,
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
   * @param groupId - Group ID to fetch
   * @returns Promise resolving to Group or null if not found
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
   * @param groupId - Group ID to subscribe to
   * @param callback - Callback function called when group changes
   * @returns Unsubscribe function
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
   * Update group settings (admin only)
   * @param groupId - Group ID to update
   * @param settings - Partial settings to update
   */
  async updateGroupSettings(
    groupId: string,
    settings: Partial<GroupSettings>
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
   * Promote a member to admin
   * @param groupId - Group ID
   * @param memberId - User ID to promote
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
   * Exit a group (removes user from group)
   * @param groupId - Group ID to exit
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
    await this.sendSystemMessage(batch, groupId, `${group.participantNames[user.id]} left the group`);

    await batch.commit();
  }

  /**
   * Delete a group (creator only)
   * @param groupId - Group ID to delete
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
   * Remove a member from group (admin only)
   * @param groupId - Group ID
   * @param memberId - User ID to remove
   */
  async removeMember(groupId: string, memberId: string): Promise<void> {
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
    await this.sendSystemMessage(batch, groupId, `${group.participantNames[memberId]} was removed from the group`);

    await batch.commit();
  }

  /**
   * Subscribe to user's groups
   * @param callback - Callback function called when groups change
   * @returns Unsubscribe function
   */
  subscribeToGroups(callback: (groups: Group[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const q = query(
      this.groupsCollection,
      where("participants", "array-contains", user.id),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Group[];
      callback(groups);
    });
  }

  /**
   * Helper: Send system message to a group
   */
  private async sendSystemMessage(
    batch: writeBatch,
    groupId: string,
    message: string
  ): Promise<void> {
    const systemMessage: Omit<ChatMessage, "id" | "timestamp"> & {
      timestamp: any;
    } = {
      chatId: groupId,
      senderId: "system",
      senderName: "System",
      message,
      type: "system",
      readBy: [],
    };

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    batch.set(doc(this.messagesCollection, messageId), {
      ...systemMessage,
      id: messageId,
      timestamp: serverTimestamp(),
    });
  }
}

export const groupManagementService = new GroupManagementService();


