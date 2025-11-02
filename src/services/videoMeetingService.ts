import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  VideoMeeting, 
  VideoMeetingParticipant, 
  ChatMessage, 
  MeetingSettings,
  Reaction 
} from '../types/videoMeeting';

class VideoMeetingService {
  private meetingsCollection = collection(db, 'videoMeetings');

  // Generate unique meeting ID
  generateMeetingId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate invite code
  generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 10).toUpperCase();
  }

  // Create a new meeting
  async createMeeting(
    hostId: string,
    hostName: string,
    title: string,
    description?: string,
    customSettings?: Partial<MeetingSettings>
  ): Promise<string> {
    const meetingId = this.generateMeetingId();
    
    const defaultSettings: MeetingSettings = {
      allowParticipantsToShare: true,
      allowParticipantsToRecord: false,
      muteOnJoin: false,
      requireHostApproval: false,
      enableWaitingRoom: false,
      enableChat: true,
      enableReactions: true,
      enableVirtualBackground: true,
      maxParticipants: 100,
      ...customSettings
    };

    const meeting: Omit<VideoMeeting, 'createdAt' | 'startedAt' | 'endedAt'> & {
      createdAt: any;
      startedAt?: any;
      endedAt?: any;
    } = {
      id: meetingId,
      title,
      description,
      hostId,
      hostName,
      createdAt: serverTimestamp(),
      status: 'waiting',
      participants: {},
      settings: defaultSettings,
      chatMessages: [],
      recordingStatus: 'idle'
    };

    await setDoc(doc(this.meetingsCollection, meetingId), meeting);
    return meetingId;
  }

  // Join a meeting
  async joinMeeting(
    meetingId: string,
    userId: string,
    userName: string,
    userEmail: string,
    avatar?: string
  ): Promise<VideoMeetingParticipant> {
    const meetingDoc = await getDoc(doc(this.meetingsCollection, meetingId));
    
    if (!meetingDoc.exists()) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingDoc.data() as VideoMeeting;

    if (meeting.status === 'ended') {
      throw new Error('Meeting has ended');
    }

    const participantCount = Object.keys(meeting.participants || {}).length;
    if (participantCount >= meeting.settings.maxParticipants) {
      throw new Error('Meeting is full');
    }

    const participant: Omit<VideoMeetingParticipant, 'joinedAt'> & { joinedAt: any } = {
      id: userId,
      userId,
      name: userName,
      email: userEmail,
      ...(avatar && { avatar }), // Only include avatar if it exists
      isHost: userId === meeting.hostId,
      isMuted: meeting.settings.muteOnJoin,
      isCameraOff: false,
      isScreenSharing: false,
      isHandRaised: false,
      joinedAt: serverTimestamp(),
    };

    await updateDoc(doc(this.meetingsCollection, meetingId), {
      [`participants.${userId}`]: participant,
      status: 'active',
      ...(meeting.status === 'waiting' && { startedAt: serverTimestamp() })
    });

    // Add system message
    const systemMessage: Omit<ChatMessage, 'timestamp'> & { timestamp: any } = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      message: `${userName} joined the meeting`,
      timestamp: new Date(),
      type: 'system'
    };

    await this.sendChatMessage(meetingId, systemMessage);

    return participant as VideoMeetingParticipant;
  }

  // Leave meeting
  async leaveMeeting(meetingId: string, userId: string, userName: string): Promise<void> {
    const meetingDoc = await getDoc(doc(this.meetingsCollection, meetingId));
    
    if (!meetingDoc.exists()) return;

    const meeting = meetingDoc.data() as VideoMeeting;
    const updatedParticipants = { ...meeting.participants };
    delete updatedParticipants[userId];

    await updateDoc(doc(this.meetingsCollection, meetingId), {
      participants: updatedParticipants
    });

    // Add system message
    const systemMessage: Omit<ChatMessage, 'timestamp'> & { timestamp: any } = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      message: `${userName} left the meeting`,
      timestamp: new Date(),
      type: 'system'
    };

    await this.sendChatMessage(meetingId, systemMessage);

    // End meeting if host left or no participants
    if (userId === meeting.hostId || Object.keys(updatedParticipants).length === 0) {
      await this.endMeeting(meetingId);
    }
  }

  // Update participant state
  async updateParticipantState(
    meetingId: string,
    userId: string,
    updates: Partial<Pick<VideoMeetingParticipant, 'isMuted' | 'isCameraOff' | 'isScreenSharing' | 'isHandRaised' | 'avatarType'>>
  ): Promise<void> {
    const updateFields: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      updateFields[`participants.${userId}.${key}`] = value;
    });

    await updateDoc(doc(this.meetingsCollection, meetingId), updateFields);
  }

  // Send chat message
  async sendChatMessage(
    meetingId: string,
    message: Omit<ChatMessage, 'timestamp'> & { timestamp: any }
  ): Promise<void> {
    const meetingDoc = await getDoc(doc(this.meetingsCollection, meetingId));
    if (!meetingDoc.exists()) return;

    const meeting = meetingDoc.data() as VideoMeeting;
    
    // Convert serverTimestamp to actual Date before adding to array
    const messageWithDate = {
      ...message,
      timestamp: new Date()
    };
    
    const updatedMessages = [...(meeting.chatMessages || []), messageWithDate];

    await updateDoc(doc(this.meetingsCollection, meetingId), {
      chatMessages: updatedMessages
    });
  }

  // Update meeting transcript
  async updateMeetingTranscript(meetingId: string, transcript: string): Promise<void> {
    await updateDoc(doc(this.meetingsCollection, meetingId), {
      transcript,
      ...(!(await getDoc(doc(this.meetingsCollection, meetingId))).data()?.transcriptionStartTime && {
        transcriptionStartTime: serverTimestamp()
      })
    });
  }

  // Update meeting AI summary
  async updateMeetingSummary(meetingId: string, summary: string): Promise<void> {
    await updateDoc(doc(this.meetingsCollection, meetingId), {
      aiSummary: summary
    });
  }

  // End meeting
  async endMeeting(meetingId: string): Promise<void> {
    await updateDoc(doc(this.meetingsCollection, meetingId), {
      status: 'ended',
      endedAt: serverTimestamp()
    });
  }

  // Subscribe to meeting updates
  subscribeMeeting(
    meetingId: string,
    callback: (meeting: VideoMeeting | null) => void
  ): () => void {
    return onSnapshot(
      doc(this.meetingsCollection, meetingId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const meeting: VideoMeeting = {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            startedAt: data.startedAt?.toDate(),
            endedAt: data.endedAt?.toDate(),
            transcriptionStartTime: data.transcriptionStartTime?.toDate(),
            participants: Object.entries(data.participants || {}).reduce((acc, [key, value]: [string, any]) => {
              acc[key] = {
                ...value,
                joinedAt: value.joinedAt?.toDate() || new Date()
              };
              return acc;
            }, {} as Record<string, VideoMeetingParticipant>),
            chatMessages: (data.chatMessages || []).map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp?.toDate() || new Date()
            })),
            whiteboard: data.whiteboard ? {
              ...data.whiteboard,
              paths: (data.whiteboard.paths || []).map((path: any) => ({
                ...path,
                timestamp: path.timestamp?.toDate() || new Date()
              }))
            } : undefined
          } as VideoMeeting;
          callback(meeting);
        } else {
          callback(null);
        }
      }
    );
  }

  // Update meeting settings
  async updateMeetingSettings(
    meetingId: string,
    settings: Partial<MeetingSettings>
  ): Promise<void> {
    const meetingDoc = await getDoc(doc(this.meetingsCollection, meetingId));
    if (!meetingDoc.exists()) return;

    const meeting = meetingDoc.data() as VideoMeeting;
    const updatedSettings = { ...meeting.settings, ...settings };

    await updateDoc(doc(this.meetingsCollection, meetingId), {
      settings: updatedSettings
    });
  }

  // Start/Stop recording
  async updateRecordingStatus(
    meetingId: string,
    status: 'idle' | 'recording' | 'paused'
  ): Promise<void> {
    await updateDoc(doc(this.meetingsCollection, meetingId), {
      recordingStatus: status
    });
  }

  // Get meeting by ID
  async getMeeting(meetingId: string): Promise<VideoMeeting | null> {
    const meetingDoc = await getDoc(doc(this.meetingsCollection, meetingId));
    
    if (!meetingDoc.exists()) {
      return null;
    }

    const data = meetingDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate(),
      endedAt: data.endedAt?.toDate(),
      participants: Object.entries(data.participants || {}).reduce((acc, [key, value]: [string, any]) => {
        acc[key] = {
          ...value,
          joinedAt: value.joinedAt?.toDate() || new Date()
        };
        return acc;
      }, {} as Record<string, VideoMeetingParticipant>),
      chatMessages: (data.chatMessages || []).map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate() || new Date()
      }))
    } as VideoMeeting;
  }

  // Get all meetings for a user (as host or participant)
  async getUserMeetings(userId: string): Promise<VideoMeeting[]> {
    try {
      // Get all meetings (we filter client-side for host or participant)
      const allSnapshot = await getDocs(query(this.meetingsCollection));
      const meetings: VideoMeeting[] = [];
      
      allSnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const meeting = {
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          startedAt: data.startedAt?.toDate(),
          endedAt: data.endedAt?.toDate(),
          participants: Object.entries(data.participants || {}).reduce((acc, [key, value]: [string, any]) => {
            acc[key] = {
              ...value,
              joinedAt: value.joinedAt?.toDate() || new Date()
            };
            return acc;
          }, {} as Record<string, VideoMeetingParticipant>),
          chatMessages: (data.chatMessages || []).map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date()
          })),
          whiteboard: data.whiteboard ? {
            ...data.whiteboard,
            paths: (data.whiteboard.paths || []).map((path: any) => ({
              ...path,
              timestamp: path.timestamp?.toDate() || new Date()
            }))
          } : undefined
        } as VideoMeeting;
        
        // Include if user is host or participant
        if (meeting.hostId === userId || (meeting.participants && meeting.participants[userId])) {
          meetings.push(meeting);
        }
      });
      
      return meetings;
    } catch (error) {
      console.error('Error getting user meetings:', error);
      return [];
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId: string): Promise<void> {
    await deleteDoc(doc(this.meetingsCollection, meetingId));
  }
}

export const videoMeetingService = new VideoMeetingService();

