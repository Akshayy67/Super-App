// Meeting Whiteboard Service - Handles real-time whiteboard synchronization for video meetings
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { realTimeAuth } from '../utils/realTimeAuth';

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingPath {
  id: string;
  tool: 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text';
  points: DrawingPoint[];
  color: string;
  size: number;
  userId: string;
  userName: string;
  timestamp: Date;
  text?: string;
  textPosition?: { x: number; y: number };
}

export interface WhiteboardState {
  paths: DrawingPath[];
  background: string;
}

class MeetingWhiteboardService {
  private unsubscribeCallbacks: Map<string, () => void> = new Map();

  /**
   * Add a drawing path to the meeting whiteboard
   */
  async addPath(meetingId: string, path: DrawingPath): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const meetingRef = doc(db, 'videoMeetings', meetingId);
    const meetingDoc = await getDoc(meetingRef);
    
    if (!meetingDoc.exists()) {
      throw new Error('Meeting not found');
    }

    const currentData = meetingDoc.data();
    const whiteboardState: WhiteboardState = currentData.whiteboard || {
      paths: [],
      background: '#ffffff',
    };

    const updatedPaths = [...whiteboardState.paths, {
      ...path,
      timestamp: new Date(),
    }];

    await updateDoc(meetingRef, {
      whiteboard: {
        ...whiteboardState,
        paths: updatedPaths,
      },
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Clear all paths from the whiteboard
   */
  async clearCanvas(meetingId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const meetingRef = doc(db, 'videoMeetings', meetingId);
    const meetingDoc = await getDoc(meetingRef);
    
    if (!meetingDoc.exists()) {
      throw new Error('Meeting not found');
    }

    const currentData = meetingDoc.data();
    const whiteboardState: WhiteboardState = currentData.whiteboard || {
      paths: [],
      background: '#ffffff',
    };

    await updateDoc(meetingRef, {
      whiteboard: {
        ...whiteboardState,
        paths: [],
      },
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Undo the last path (only if user drew it or is host)
   */
  async undoLastPath(meetingId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const meetingRef = doc(db, 'videoMeetings', meetingId);
    const meetingDoc = await getDoc(meetingRef);
    
    if (!meetingDoc.exists()) {
      throw new Error('Meeting not found');
    }

    const currentData = meetingDoc.data();
    const whiteboardState: WhiteboardState = currentData.whiteboard || {
      paths: [],
      background: '#ffffff',
    };

    if (whiteboardState.paths.length === 0) return;

    const lastPath = whiteboardState.paths[whiteboardState.paths.length - 1];
    const isHost = currentData.hostId === user.id;
    const isLastPathOwner = lastPath.userId === user.id;

    // Only allow undo if user is host or drew the last path
    if (!isHost && !isLastPathOwner) {
      throw new Error('You can only undo your own drawings');
    }

    const updatedPaths = whiteboardState.paths.slice(0, -1);

    await updateDoc(meetingRef, {
      whiteboard: {
        ...whiteboardState,
        paths: updatedPaths,
      },
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Subscribe to whiteboard updates for a meeting
   */
  subscribeToWhiteboard(
    meetingId: string,
    callback: (whiteboard: WhiteboardState | null) => void
  ): () => void {
    // Clean up existing subscription for this meeting if any
    if (this.unsubscribeCallbacks.has(meetingId)) {
      this.unsubscribeCallbacks.get(meetingId)?.();
    }

    const meetingRef = doc(db, 'videoMeetings', meetingId);

    const unsubscribe = onSnapshot(
      meetingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const whiteboardData = data.whiteboard;

          if (whiteboardData) {
            // Convert Firestore timestamps to Date objects
            const paths = (whiteboardData.paths || []).map((path: any) => ({
              ...path,
              timestamp: path.timestamp?.toDate() || new Date(),
            }));

            callback({
              paths,
              background: whiteboardData.background || '#ffffff',
            });
          } else {
            // Initialize whiteboard if it doesn't exist
            callback({
              paths: [],
              background: '#ffffff',
            });
          }
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to whiteboard:', error);
        callback(null);
      }
    );

    this.unsubscribeCallbacks.set(meetingId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from whiteboard updates
   */
  unsubscribeFromWhiteboard(meetingId: string): void {
    const unsubscribe = this.unsubscribeCallbacks.get(meetingId);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribeCallbacks.delete(meetingId);
    }
  }
}

export const meetingWhiteboardService = new MeetingWhiteboardService();

