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
  serverTimestamp,
  onSnapshot,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "./realTimeAuth";
import {
  PairDrawingSession,
  DrawingParticipant,
  DrawingCursorPosition,
  DrawingChatMessage,
  DrawingSnapshot,
  DrawingSessionSettings,
  DrawingCanvasData,
  DrawingPath,
} from "../team/types/pairDrawingTypes";

const PARTICIPANT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // orange
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange-red
];

class PairDrawingService {
  private sessionListeners: Map<string, () => void> = new Map();

  /**
   * Create a new pair drawing session
   */
  async createSession(
    teamId: string,
    title: string,
    description?: string
  ): Promise<PairDrawingSession> {
    try {
      const user = realTimeAuth.getCurrentUser();
      console.log('🎨 Creating drawing session - User:', user);
      
      if (!user) {
        throw new Error("User not authenticated. Please log in and try again.");
      }

      if (!user.id) {
        throw new Error("User ID is missing. Please refresh and try again.");
      }

      const sessionId = `pd_session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log('🎨 Session ID generated:', sessionId);

      const session: PairDrawingSession = {
        id: sessionId,
        teamId,
        title,
        description: description || undefined, // Keep as undefined if empty, but we'll handle it in Firestore
        canvasData: {
          paths: [],
          background: "#ffffff",
          zoom: 1,
          panX: 0,
          panY: 0,
          width: 1200,
          height: 800,
        },
        createdBy: user.id,
        creatorName: user.username || user.email || "Anonymous",
        participants: {
          [user.id]: {
            id: user.id,
            name: user.username || user.email || "Anonymous",
            email: user.email || "",
            role: "drawer",
            color: PARTICIPANT_COLORS[0],
            isActive: true,
            joinedAt: new Date(),
            lastActivity: new Date(),
          },
        },
        status: "active",
        cursors: {},
        chat: [
          {
            id: `msg_${Date.now()}`,
            userId: "system",
            userName: "System",
            message: `${user.username || user.email || "User"} created the drawing session`,
            timestamp: new Date(),
            type: "system",
          },
        ],
        drawingHistory: [],
        settings: {
          allowMultipleDrawers: true,
          autoSaveInterval: 30,
          maxParticipants: 10,
          requireApprovalToJoin: false,
          enableVoiceChat: true,
          showCursors: true,
          showDrawingHistory: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('🎨 Writing session to Firestore:', sessionId);

      // Prepare data for Firestore - remove undefined fields
      const firestoreData: any = {
        ...session,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Remove undefined description to avoid Firestore error
      if (firestoreData.description === undefined) {
        delete firestoreData.description;
      }

      await setDoc(doc(db, "pairDrawingSessions", sessionId), firestoreData);

      console.log('🎨 Session created successfully!');

      return session;
    } catch (error: any) {
      console.error('🎨 Error in createSession:', error);
      throw new Error(error.message || "Failed to create drawing session");
    }
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<PairDrawingSession | null> {
    const sessionDoc = await getDoc(
      doc(db, "pairDrawingSessions", sessionId)
    );
    if (!sessionDoc.exists()) return null;

    const data = sessionDoc.data();
    return this.convertFirestoreSession(sessionDoc.id, data);
  }

  /**
   * Get all sessions for a team
   */
  async getTeamSessions(
    teamId: string,
    includeEnded: boolean = false
  ): Promise<PairDrawingSession[]> {
    try {
      let q = query(
        collection(db, "pairDrawingSessions"),
        where("teamId", "==", teamId),
        orderBy("updatedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const sessions: PairDrawingSession[] = [];

      snapshot.forEach((doc) => {
        const session = this.convertFirestoreSession(doc.id, doc.data());
        if (includeEnded || session.status !== "ended") {
          sessions.push(session);
        }
      });

      return sessions;
    } catch (error: any) {
      // Fallback if index is missing
      if (
        error.code === "failed-precondition" ||
        error.message?.includes("index")
      ) {
        const simpleQuery = query(
          collection(db, "pairDrawingSessions"),
          where("teamId", "==", teamId)
        );

        const snapshot = await getDocs(simpleQuery);
        const sessions: PairDrawingSession[] = [];

        snapshot.forEach((doc) => {
          const session = this.convertFirestoreSession(doc.id, doc.data());
          if (includeEnded || session.status !== "ended") {
            sessions.push(session);
          }
        });

        return sessions.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        );
      }

      throw error;
    }
  }

  /**
   * Join an existing session
   */
  async joinSession(sessionId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status === "ended") {
      throw new Error("Cannot join an ended session");
    }

    const participantCount = Object.keys(session.participants).length;
    if (participantCount >= session.settings.maxParticipants) {
      throw new Error("Session is full");
    }

    const colorIndex = participantCount % PARTICIPANT_COLORS.length;
    const participant: DrawingParticipant = {
      id: user.id,
      name: user.username || user.email,
      email: user.email,
      role: session.settings.allowMultipleDrawers ? "drawer" : "viewer",
      color: PARTICIPANT_COLORS[colorIndex],
      isActive: true,
      joinedAt: new Date(),
      lastActivity: new Date(),
    };

    const chatMessage: DrawingChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `${user.username || user.email} joined the session`,
      timestamp: new Date(),
      type: "system",
    };

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      [`participants.${user.id}`]: participant,
      chat: [...session.chat, chatMessage],
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Leave a session
   */
  async leaveSession(sessionId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const participant = session.participants[user.id];
    if (!participant) return;

    const chatMessage: DrawingChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `${participant.name} left the session`,
      timestamp: new Date(),
      type: "system",
    };

    const updates: any = {
      chat: [...session.chat, chatMessage],
      updatedAt: serverTimestamp(),
    };

    // Remove participant
    const updatedParticipants = { ...session.participants };
    delete updatedParticipants[user.id];
    updates.participants = updatedParticipants;

    // Remove cursor
    if (session.cursors[user.id]) {
      const updatedCursors = { ...session.cursors };
      delete updatedCursors[user.id];
      updates.cursors = updatedCursors;
    }

    // If this was the last participant, end the session
    if (Object.keys(updatedParticipants).length === 0) {
      updates.status = "ended";
      updates.endedAt = serverTimestamp();
    }

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), updates);
  }

  /**
   * Add a drawing path to the canvas
   */
  async addDrawingPath(sessionId: string, path: DrawingPath): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const updatedPaths = [...session.canvasData.paths, path];

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      "canvasData.paths": updatedPaths,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update canvas data (for batch updates)
   */
  async updateCanvasData(
    sessionId: string,
    canvasData: Partial<DrawingCanvasData>,
    createSnapshot: boolean = false
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const updates: any = {
      updatedAt: serverTimestamp(),
    };

    // Update canvas data fields
    Object.keys(canvasData).forEach((key) => {
      updates[`canvasData.${key}`] = canvasData[key as keyof DrawingCanvasData];
    });

    if (createSnapshot) {
      const session = await this.getSession(sessionId);
      if (session) {
        const snapshot: DrawingSnapshot = {
          id: `snapshot_${Date.now()}`,
          canvasData: { ...session.canvasData, ...canvasData },
          userId: user.id,
          userName: user.username || user.email,
          timestamp: new Date(),
        };
        updates.drawingHistory = [...session.drawingHistory, snapshot];
      }
    }

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), updates);
  }

  /**
   * Clear the canvas
   */
  async clearCanvas(sessionId: string): Promise<void> {
    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      "canvasData.paths": [],
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Undo last action
   */
  async undoLastPath(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session || session.canvasData.paths.length === 0) return;

    const updatedPaths = session.canvasData.paths.slice(0, -1);

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      "canvasData.paths": updatedPaths,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update cursor position
   */
  async updateCursor(
    sessionId: string,
    x: number,
    y: number
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) return;

    const participant = session.participants[user.id];
    if (!participant) return;

    const cursor: DrawingCursorPosition = {
      userId: user.id,
      userName: participant.name,
      x,
      y,
      color: participant.color,
      timestamp: new Date(),
    };

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      [`cursors.${user.id}`]: cursor,
      [`participants.${user.id}.lastActivity`]: serverTimestamp(),
    });
  }

  /**
   * Send a chat message
   */
  async sendMessage(sessionId: string, message: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const chatMessage: DrawingChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.username || user.email,
      message: message.trim(),
      timestamp: new Date(),
      type: "text",
    };

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      chat: [...session.chat, chatMessage],
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Switch roles between drawer and viewer
   */
  async switchRole(sessionId: string, targetUserId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    // Only creator can switch roles
    if (user.id !== session.createdBy) {
      throw new Error("Only the session creator can switch roles");
    }

    const targetParticipant = session.participants[targetUserId];
    if (!targetParticipant) throw new Error("Participant not found");

    const newRole = targetParticipant.role === "drawer" ? "viewer" : "drawer";

    const updates: any = {};
    updates[`participants.${targetUserId}.role`] = newRole;
    updates.updatedAt = serverTimestamp();

    const chatMessage: DrawingChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `${targetParticipant.name} is now a ${newRole}`,
      timestamp: new Date(),
      type: "system",
    };

    updates.chat = [...session.chat, chatMessage];

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), updates);
  }

  /**
   * Save a snapshot
   */
  async saveSnapshot(
    sessionId: string,
    description?: string
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const snapshot: DrawingSnapshot = {
      id: `snapshot_${Date.now()}`,
      canvasData: session.canvasData,
      userId: user.id,
      userName: user.username || user.email,
      timestamp: new Date(),
      description,
    };

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      drawingHistory: [...session.drawingHistory, snapshot],
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Restore a snapshot
   */
  async restoreSnapshot(sessionId: string, snapshotId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const snapshot = session.drawingHistory.find((s) => s.id === snapshotId);
    if (!snapshot) throw new Error("Snapshot not found");

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      canvasData: snapshot.canvasData,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    // Only creator can end the session
    if (user.id !== session.createdBy) {
      throw new Error("Only the session creator can end the session");
    }

    const chatMessage: DrawingChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `Session ended by ${user.username || user.email}`,
      timestamp: new Date(),
      type: "system",
    };

    await updateDoc(doc(db, "pairDrawingSessions", sessionId), {
      status: "ended",
      chat: [...session.chat, chatMessage],
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Subscribe to session updates
   */
  subscribeToSession(
    sessionId: string,
    callback: (session: PairDrawingSession | null) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      doc(db, "pairDrawingSessions", sessionId),
      (doc) => {
        if (doc.exists()) {
          const session = this.convertFirestoreSession(doc.id, doc.data());
          callback(session);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error subscribing to session:", error);
        callback(null);
      }
    );

    this.sessionListeners.set(sessionId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from session updates
   */
  unsubscribeFromSession(sessionId: string): void {
    const unsubscribe = this.sessionListeners.get(sessionId);
    if (unsubscribe) {
      unsubscribe();
      this.sessionListeners.delete(sessionId);
    }
  }

  /**
   * Convert Firestore document to PairDrawingSession
   */
  private convertFirestoreSession(
    id: string,
    data: any
  ): PairDrawingSession {
    return {
      id,
      teamId: data.teamId,
      title: data.title,
      description: data.description,
      canvasData: data.canvasData || {
        paths: [],
        background: "#ffffff",
        zoom: 1,
        panX: 0,
        panY: 0,
        width: 1200,
        height: 800,
      },
      createdBy: data.createdBy,
      creatorName: data.creatorName,
      participants: data.participants || {},
      status: data.status,
      cursors: data.cursors || {},
      chat: (data.chat || []).map((msg: any) => ({
        ...msg,
        timestamp:
          msg.timestamp instanceof Timestamp
            ? msg.timestamp.toDate()
            : new Date(msg.timestamp),
      })),
      drawingHistory: (data.drawingHistory || []).map((snapshot: any) => ({
        ...snapshot,
        timestamp:
          snapshot.timestamp instanceof Timestamp
            ? snapshot.timestamp.toDate()
            : new Date(snapshot.timestamp),
      })),
      settings: data.settings || {},
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt),
      endedAt:
        data.endedAt instanceof Timestamp
          ? data.endedAt.toDate()
          : data.endedAt
          ? new Date(data.endedAt)
          : undefined,
    };
  }
}

export const pairDrawingService = new PairDrawingService();

