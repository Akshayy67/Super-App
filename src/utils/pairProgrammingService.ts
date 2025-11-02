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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "./realTimeAuth";

export interface PairProgrammingSession {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  createdBy: string;
  creatorName: string;
  participants: { [key: string]: Participant };
  status: "active" | "paused" | "ended";
  isLocked: boolean;
  lockedBy?: string;
  cursors: { [key: string]: CursorPosition };
  chat: ChatMessage[];
  codeHistory: CodeSnapshot[];
  settings: SessionSettings;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: "driver" | "navigator" | "observer";
  color: string;
  isActive: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  line: number;
  column: number;
  color: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "text" | "code" | "system";
}

export interface CodeSnapshot {
  id: string;
  code: string;
  userId: string;
  userName: string;
  timestamp: Date;
  description?: string;
}

export interface SessionSettings {
  allowMultipleDrivers: boolean;
  autoSaveInterval: number; // in seconds
  maxParticipants: number;
  requireApprovalToJoin: boolean;
  enableVoiceChat: boolean;
  enableScreenShare: boolean;
  enableCodeSuggestions: boolean;
}

const PARTICIPANT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // orange
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
];

class PairProgrammingService {
  private sessionListeners: Map<string, () => void> = new Map();

  /**
   * Create a new pair programming session
   */
  async createSession(
    teamId: string,
    title: string,
    language: string = "javascript",
    description?: string
  ): Promise<PairProgrammingSession> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const sessionId = `pp_session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const session: PairProgrammingSession = {
      id: sessionId,
      teamId,
      title,
      description,
      language,
      code: this.getTemplateCode(language),
      createdBy: user.id,
      creatorName: user.username || user.email,
      participants: {
        [user.id]: {
          id: user.id,
          name: user.username || user.email,
          email: user.email,
          role: "driver",
          color: PARTICIPANT_COLORS[0],
          isActive: true,
          joinedAt: new Date(),
          lastActivity: new Date(),
        },
      },
      status: "active",
      isLocked: false,
      cursors: {},
      chat: [
        {
          id: `msg_${Date.now()}`,
          userId: "system",
          userName: "System",
          message: `${user.username || user.email} created the session`,
          timestamp: new Date(),
          type: "system",
        },
      ],
      codeHistory: [],
      settings: {
        allowMultipleDrivers: false,
        autoSaveInterval: 30,
        maxParticipants: 6,
        requireApprovalToJoin: false,
        enableVoiceChat: true,
        enableScreenShare: true,
        enableCodeSuggestions: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "pairProgrammingSessions", sessionId), {
      ...session,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return session;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<PairProgrammingSession | null> {
    const sessionDoc = await getDoc(
      doc(db, "pairProgrammingSessions", sessionId)
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
  ): Promise<PairProgrammingSession[]> {
    try {
      let q = query(
        collection(db, "pairProgrammingSessions"),
        where("teamId", "==", teamId),
        orderBy("updatedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const sessions: PairProgrammingSession[] = [];

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
          collection(db, "pairProgrammingSessions"),
          where("teamId", "==", teamId)
        );

        const snapshot = await getDocs(simpleQuery);
        const sessions: PairProgrammingSession[] = [];

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
    const participant: Participant = {
      id: user.id,
      name: user.username || user.email,
      email: user.email,
      role: "navigator",
      color: PARTICIPANT_COLORS[colorIndex],
      isActive: true,
      joinedAt: new Date(),
      lastActivity: new Date(),
    };

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `${user.username || user.email} joined the session`,
      timestamp: new Date(),
      type: "system",
    };

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), {
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

    const chatMessage: ChatMessage = {
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

    // If the driver left and there are other participants, assign a new driver
    if (
      participant.role === "driver" &&
      Object.keys(updatedParticipants).length > 0
    ) {
      const nextDriver = Object.values(updatedParticipants)[0];
      updates[`participants.${nextDriver.id}.role`] = "driver";
    }

    // If this was the last participant, end the session
    if (Object.keys(updatedParticipants).length === 0) {
      updates.status = "ended";
      updates.endedAt = serverTimestamp();
    }

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), updates);
  }

  /**
   * Update code in the session
   */
  async updateCode(
    sessionId: string,
    code: string,
    createSnapshot: boolean = false
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const updates: any = {
      code,
      updatedAt: serverTimestamp(),
    };

    if (createSnapshot) {
      const session = await this.getSession(sessionId);
      if (session) {
        const snapshot: CodeSnapshot = {
          id: `snapshot_${Date.now()}`,
          code,
          userId: user.id,
          userName: user.username || user.email,
          timestamp: new Date(),
        };
        updates.codeHistory = [...session.codeHistory, snapshot];
      }
    }

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), updates);
  }

  /**
   * Update cursor position
   */
  async updateCursor(
    sessionId: string,
    line: number,
    column: number
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) return;

    const participant = session.participants[user.id];
    if (!participant) return;

    const cursor: CursorPosition = {
      userId: user.id,
      userName: participant.name,
      line,
      column,
      color: participant.color,
      timestamp: new Date(),
    };

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), {
      [`cursors.${user.id}`]: cursor,
      [`participants.${user.id}.lastActivity`]: serverTimestamp(),
    });
  }

  /**
   * Send a chat message
   */
  async sendMessage(
    sessionId: string,
    message: string,
    type: "text" | "code" = "text"
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.username || user.email,
      message: message.trim(),
      timestamp: new Date(),
      type,
    };

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), {
      chat: [...session.chat, chatMessage],
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Switch roles between driver and navigator
   */
  async switchRoles(sessionId: string, newDriverId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    // Find current driver
    const currentDriver = Object.values(session.participants).find(
      (p) => p.role === "driver"
    );

    if (!currentDriver) throw new Error("No current driver found");

    // Only the current driver or session creator can switch roles
    if (user.id !== currentDriver.id && user.id !== session.createdBy) {
      throw new Error("Only the driver or session creator can switch roles");
    }

    const newDriver = session.participants[newDriverId];
    if (!newDriver) throw new Error("New driver not found in session");

    const updates: any = {};
    updates[`participants.${currentDriver.id}.role`] = "navigator";
    updates[`participants.${newDriverId}.role`] = "driver";
    updates.updatedAt = serverTimestamp();

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `${newDriver.name} is now the driver`,
      timestamp: new Date(),
      type: "system",
    };

    updates.chat = [...session.chat, chatMessage];

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), updates);
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

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `Session ended by ${user.username || user.email}`,
      timestamp: new Date(),
      type: "system",
    };

    await updateDoc(doc(db, "pairProgrammingSessions", sessionId), {
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
    callback: (session: PairProgrammingSession | null) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      doc(db, "pairProgrammingSessions", sessionId),
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
   * Get template code for different languages
   */
  private getTemplateCode(language: string): string {
    const templates: { [key: string]: string } = {
      javascript: `// Welcome to Pair Programming!
// Start coding together...

function helloWorld() {
  console.log("Hello, World!");
}

helloWorld();`,
      typescript: `// Welcome to Pair Programming!
// Start coding together...

function helloWorld(): void {
  console.log("Hello, World!");
}

helloWorld();`,
      python: `# Welcome to Pair Programming!
# Start coding together...

def hello_world():
    print("Hello, World!")

hello_world()`,
      java: `// Welcome to Pair Programming!
// Start coding together...

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      cpp: `// Welcome to Pair Programming!
// Start coding together...

#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
      html: `<!-- Welcome to Pair Programming! -->
<!-- Start coding together... -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pair Programming</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
      css: `/* Welcome to Pair Programming! */
/* Start coding together... */

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
  color: white;
  text-align: center;
}`,
    };

    return templates[language] || templates.javascript;
  }

  /**
   * Convert Firestore document to PairProgrammingSession
   */
  private convertFirestoreSession(
    id: string,
    data: any
  ): PairProgrammingSession {
    return {
      id,
      teamId: data.teamId,
      title: data.title,
      description: data.description,
      language: data.language,
      code: data.code,
      createdBy: data.createdBy,
      creatorName: data.creatorName,
      participants: data.participants || {},
      status: data.status,
      isLocked: data.isLocked || false,
      lockedBy: data.lockedBy,
      cursors: data.cursors || {},
      chat: (data.chat || []).map((msg: any) => ({
        ...msg,
        timestamp:
          msg.timestamp instanceof Timestamp
            ? msg.timestamp.toDate()
            : new Date(msg.timestamp),
      })),
      codeHistory: (data.codeHistory || []).map((snapshot: any) => ({
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

export const pairProgrammingService = new PairProgrammingService();

