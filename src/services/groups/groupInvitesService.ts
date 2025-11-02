/**
 * Group Invites Service
 * 
 * Handles inviting friends to groups:
 * - Inviting friends by friend IDs
 * - Validating invitations
 * - Managing group membership
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  limit,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { Group } from "../../types/groups";
import { ChatMessage } from "../../types/friends";
import { friendsService } from "../friends/friendsService";
import { emailJSService } from "../../utils/emailJSService";

class GroupInvitesService {
  private groupsCollection = collection(db, "groups");
  private chatsCollection = collection(db, "chats");
  private messagesCollection = collection(db, "chat_messages");

  /**
   * Invite friends to a group
   * @param groupId - Group ID to invite to
   * @param friendIds - Array of friend IDs to invite
   */
  async inviteFriendsToGroup(groupId: string, friendIds: string[]): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    // Check permissions
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
      const chat = chatDoc.data();
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
   * Invite user to group by email
   * @param groupId - Group ID to invite to
   * @param email - Email address of the user to invite
   */
  async inviteByEmail(groupId: string, email: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get group
    const groupDoc = await getDoc(doc(this.groupsCollection, groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const group = groupDoc.data() as Group;

    // Check permissions
    if (!group.admins.includes(user.id) && !group.settings.allowInvites) {
      throw new Error("You don't have permission to invite members");
    }

    // Check if already a member
    const userEmailMap = Object.entries(group.participantEmails || {});
    const isAlreadyMember = userEmailMap.some(([_, email]) => 
      email?.toLowerCase() === normalizedEmail
    );

    if (isAlreadyMember) {
      throw new Error("User is already a member of this group");
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
      // User not found - create a pending invite that can be accepted later
      const inviteId = `gi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const inviteCode = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      // Calculate expiresAt timestamp
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days
      
      await setDoc(doc(db, "group_invites", inviteId), {
        id: inviteId,
        groupId,
        groupName: group.name,
        email: normalizedEmail,
        invitedBy: user.id,
        inviterName: user.displayName || user.email || "User",
        inviteCode,
        status: "pending",
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
      });

      // Try to send email invitation
      try {
        const appUrl = window.location.origin;
        await emailJSService.sendGroupInvite({
          to: normalizedEmail,
          subject: `${user.displayName || user.email} invited you to join "${group.name}"`,
          groupName: group.name,
          inviterName: user.displayName || user.email || "Someone",
          inviteCode,
          appUrl: `${appUrl}/community?invite=${inviteCode}`,
        });
      } catch (emailError) {
        console.warn("Failed to send email invitation:", emailError);
        // Continue even if email fails
      }

      return;
    }

    // User found - add them directly
    const targetUserDoc = usersSnapshot.docs[0];
    const targetUserId = targetUserDoc.id;
    const targetUserData = targetUserDoc.data();

    // Check member limit
    const currentMemberCount = group.participants.length;
    const maxMembers = group.settings.maxMembers || 100;
    if (currentMemberCount >= maxMembers) {
      throw new Error(`Group is full. Maximum ${maxMembers} members allowed.`);
    }

    if (group.participants.includes(targetUserId)) {
      throw new Error("User is already a member of this group");
    }

    const batch = writeBatch(db);

    // Update group
    batch.update(doc(this.groupsCollection, groupId), {
      participants: arrayUnion(targetUserId),
      participantNames: {
        ...group.participantNames,
        [targetUserId]: targetUserData.username || targetUserData.displayName || normalizedEmail.split("@")[0],
      },
      participantEmails: {
        ...group.participantEmails,
        [targetUserId]: normalizedEmail,
      },
      [`unreadCount.${targetUserId}`]: 0,
      updatedAt: serverTimestamp(),
    });

    // Update chat
    const chatDoc = await getDoc(doc(this.chatsCollection, groupId));
    if (chatDoc.exists()) {
      const chat = chatDoc.data();
      batch.update(doc(this.chatsCollection, groupId), {
        participants: arrayUnion(targetUserId),
        participantNames: {
          ...chat.participantNames,
          [targetUserId]: targetUserData.username || targetUserData.displayName || normalizedEmail.split("@")[0],
        },
        participantEmails: {
          ...chat.participantEmails,
          [targetUserId]: normalizedEmail,
        },
        [`unreadCount.${targetUserId}`]: 0,
      });
    }

    // Send system message
    const systemMessage: Omit<ChatMessage, "id" | "timestamp"> & {
      timestamp: any;
    } = {
      chatId: groupId,
      senderId: "system",
      senderName: "System",
      message: `${targetUserData.username || targetUserData.displayName || normalizedEmail.split("@")[0]} joined the group`,
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
   * Generate a simple invite code
   */
  generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }
}

export const groupInvitesService = new GroupInvitesService();

