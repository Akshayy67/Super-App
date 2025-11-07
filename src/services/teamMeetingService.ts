// Team Meeting Service - Manages team meetings using Firebase Cloud Functions

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TeamMeeting {
  meetingId: string;
  teamId: string;
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  scheduledTime: Timestamp | Date;
  isInstant: boolean;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  participants: Array<{
    userId: string;
    name: string;
    email?: string;
    joinedAt: Timestamp | Date;
    isHost: boolean;
  }>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

class TeamMeetingService {
  private meetingsCollection = collection(db, 'teamMeetings');

  /**
   * Create a team meeting using Cloud Function
   */
  async createMeeting(
    teamId: string,
    title: string,
    options?: {
      description?: string;
      scheduledTime?: Date;
      isInstant?: boolean;
    }
  ): Promise<TeamMeeting> {
    try {
      const functions = getFunctions(app);
      const createTeamMeetingFunction = httpsCallable(functions, 'createTeamMeeting');

      const result = await createTeamMeetingFunction({
        teamId,
        title,
        description: options?.description || '',
        scheduledTime: options?.scheduledTime?.toISOString(),
        isInstant: options?.isInstant ?? true,
      });

      const data = result.data as { success: boolean; meetingId: string; meeting: TeamMeeting };

      if (!data.success || !data.meetingId) {
        throw new Error('Failed to create meeting');
      }

      return data.meeting;
    } catch (error: any) {
      console.error('❌ Error creating team meeting:', error);
      throw error;
    }
  }

  /**
   * Get meeting by ID
   */
  async getMeeting(meetingId: string): Promise<TeamMeeting | null> {
    try {
      const meetingDoc = await getDoc(doc(this.meetingsCollection, meetingId));
      if (!meetingDoc.exists()) {
        return null;
      }

      const data = meetingDoc.data();
      return {
        ...data,
        scheduledTime: data.scheduledTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        participants: data.participants?.map((p: any) => ({
          ...p,
          joinedAt: p.joinedAt?.toDate() || new Date(),
        })) || [],
      } as TeamMeeting;
    } catch (error) {
      console.error('❌ Error getting meeting:', error);
      return null;
    }
  }

  /**
   * Get all meetings for a team
   */
  async getTeamMeetings(teamId: string): Promise<TeamMeeting[]> {
    try {
      const q = query(this.meetingsCollection, where('teamId', '==', teamId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          scheduledTime: data.scheduledTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          participants: data.participants?.map((p: any) => ({
            ...p,
            joinedAt: p.joinedAt?.toDate() || new Date(),
          })) || [],
        } as TeamMeeting;
      });
    } catch (error) {
      console.error('❌ Error getting team meetings:', error);
      return [];
    }
  }

  /**
   * Join a meeting
   */
  async joinMeeting(meetingId: string, userId: string, userName: string, userEmail?: string): Promise<void> {
    try {
      const meetingRef = doc(this.meetingsCollection, meetingId);
      const meetingDoc = await getDoc(meetingRef);

      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found');
      }

      const meetingData = meetingDoc.data() as TeamMeeting;
      const participants = meetingData.participants || [];

      // Check if user is already a participant
      if (participants.some((p) => p.userId === userId)) {
        return;
      }

      // Add participant
      participants.push({
        userId,
        name: userName,
        email: userEmail,
        joinedAt: serverTimestamp() as any,
        isHost: false,
      });

      await updateDoc(meetingRef, {
        participants,
        status: 'active',
        updatedAt: serverTimestamp(),
      });

      console.log('✅ User joined meeting:', meetingId);
    } catch (error) {
      console.error('❌ Error joining meeting:', error);
      throw error;
    }
  }

  /**
   * Leave a meeting
   */
  async leaveMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      const meetingRef = doc(this.meetingsCollection, meetingId);
      const meetingDoc = await getDoc(meetingRef);

      if (!meetingDoc.exists()) {
        return;
      }

      const meetingData = meetingDoc.data() as TeamMeeting;
      const participants = meetingData.participants || [];

      // Remove participant
      const updatedParticipants = participants.filter((p) => p.userId !== userId);

      // If no participants left, end the meeting
      if (updatedParticipants.length === 0) {
        await updateDoc(meetingRef, {
          status: 'ended',
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(meetingRef, {
          participants: updatedParticipants,
          updatedAt: serverTimestamp(),
        });
      }

      console.log('✅ User left meeting:', meetingId);
    } catch (error) {
      console.error('❌ Error leaving meeting:', error);
      throw error;
    }
  }

  /**
   * Cancel a meeting
   */
  async cancelMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      const meetingRef = doc(this.meetingsCollection, meetingId);
      const meetingDoc = await getDoc(meetingRef);

      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found');
      }

      const meetingData = meetingDoc.data() as TeamMeeting;

      // Only host can cancel
      if (meetingData.hostId !== userId) {
        throw new Error('Only host can cancel meeting');
      }

      await updateDoc(meetingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Meeting cancelled:', meetingId);
    } catch (error) {
      console.error('❌ Error cancelling meeting:', error);
      throw error;
    }
  }

  /**
   * Subscribe to team meetings
   */
  subscribeToTeamMeetings(
    teamId: string,
    callback: (meetings: TeamMeeting[]) => void
  ): () => void {
    const q = query(this.meetingsCollection, where('teamId', '==', teamId));

    return onSnapshot(
      q,
      (snapshot) => {
        const meetings = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            scheduledTime: data.scheduledTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            participants: data.participants?.map((p: any) => ({
              ...p,
              joinedAt: p.joinedAt?.toDate() || new Date(),
            })) || [],
          } as TeamMeeting;
        });
        callback(meetings);
      },
      (error) => {
        console.error('❌ Error subscribing to team meetings:', error);
      }
    );
  }

  /**
   * Subscribe to a specific meeting
   */
  subscribeToMeeting(meetingId: string, callback: (meeting: TeamMeeting | null) => void): () => void {
    const meetingRef = doc(this.meetingsCollection, meetingId);

    return onSnapshot(
      meetingRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }

        const data = snapshot.data();
        const meeting = {
          ...data,
          scheduledTime: data.scheduledTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          participants: data.participants?.map((p: any) => ({
            ...p,
            joinedAt: p.joinedAt?.toDate() || new Date(),
          })) || [],
        } as TeamMeeting;

        callback(meeting);
      },
      (error) => {
        console.error('❌ Error subscribing to meeting:', error);
        callback(null);
      }
    );
  }

  /**
   * Get TURN server credentials
   */
  async getTurnCredentials(): Promise<{
    servers: RTCIceServer[];
    username: string;
    credential: string;
  }> {
    try {
      const functions = getFunctions(app);
      const getTurnCredentialsFunction = httpsCallable(functions, 'getTurnCredentials');

      const result = await getTurnCredentialsFunction({});
      const data = result.data as {
        success: boolean;
        servers: RTCIceServer[];
        username: string;
        credential: string;
      };

      if (!data.success) {
        throw new Error('Failed to get TURN credentials');
      }

      return {
        servers: data.servers,
        username: data.username,
        credential: data.credential,
      };
    } catch (error: any) {
      console.error('❌ Error getting TURN credentials:', error);
      // Return default STUN servers as fallback
      return {
        servers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        username: '',
        credential: '',
      };
    }
  }

  /**
   * Log call event for analytics
   */
  async logCallEvent(
    callId: string,
    eventType: string,
    options?: {
      callType?: 'video' | 'audio' | 'meeting';
      duration?: number;
      participantCount?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const functions = getFunctions(app);
      const logCallEventFunction = httpsCallable(functions, 'logCallEvent');

      await logCallEventFunction({
        callId,
        eventType,
        callType: options?.callType || 'meeting',
        duration: options?.duration || 0,
        participantCount: options?.participantCount || 1,
        metadata: options?.metadata || {},
      });
    } catch (error) {
      // Non-critical, don't throw
      console.warn('⚠️ Error logging call event:', error);
    }
  }
}

export const teamMeetingService = new TeamMeetingService();

