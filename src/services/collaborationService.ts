import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { realTimeAuth } from '../utils/realTimeAuth';

export interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentDocument?: string;
  cursorPosition?: { line: number; column: number };
  selectionRange?: { start: number; end: number };
  color: string;
}

export interface CollaborativeEdit {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
}

export interface CollaborationSession {
  id: string;
  documentId: string;
  documentType: 'note' | 'task' | 'flashcard' | 'file';
  participants: string[];
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface DocumentLock {
  documentId: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
}

class CollaborationService {
  private presenceListeners: Map<string, Unsubscribe> = new Map();
  private editListeners: Map<string, Unsubscribe> = new Map();
  private userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];
  private userColorMap: Map<string, string> = new Map();

  // Presence Management
  async updatePresence(status: 'online' | 'away' | 'offline', documentId?: string) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const presence: UserPresence = {
      userId: user.id,
      userName: user.name || user.email,
      status,
      lastSeen: new Date(),
      currentDocument: documentId,
      color: this.getUserColor(user.id)
    };

    try {
      await setDoc(doc(db, 'presence', user.id), {
        ...presence,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  subscribeToPresence(documentId: string, callback: (users: UserPresence[]) => void): Unsubscribe {
    const presenceQuery = query(
      collection(db, 'presence'),
      where('currentDocument', '==', documentId),
      where('status', '!=', 'offline')
    );

    const unsubscribe = onSnapshot(presenceQuery, (snapshot) => {
      const users: UserPresence[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          lastSeen: data.lastSeen?.toDate()
        } as UserPresence);
      });
      callback(users);
    });

    this.presenceListeners.set(documentId, unsubscribe);
    return unsubscribe;
  }

  // Cursor and Selection Tracking
  async updateCursor(documentId: string, position: { line: number; column: number }) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'presence', user.id), {
        cursorPosition: position,
        currentDocument: documentId,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating cursor:', error);
    }
  }

  async updateSelection(documentId: string, range: { start: number; end: number }) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'presence', user.id), {
        selectionRange: range,
        currentDocument: documentId,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating selection:', error);
    }
  }

  // Collaborative Editing
  async sendEdit(
    documentId: string,
    operation: 'insert' | 'delete' | 'replace',
    position: number,
    content?: string,
    length?: number
  ) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const edit: CollaborativeEdit = {
      id: Date.now().toString(),
      documentId,
      userId: user.id,
      userName: user.name || user.email,
      timestamp: new Date(),
      operation,
      position,
      content,
      length
    };

    try {
      await setDoc(doc(db, 'edits', edit.id), {
        ...edit,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending edit:', error);
    }
  }

  subscribeToEdits(
    documentId: string,
    callback: (edit: CollaborativeEdit) => void
  ): Unsubscribe {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const editsQuery = query(
      collection(db, 'edits'),
      where('documentId', '==', documentId),
      where('userId', '!=', user.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(editsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          callback({
            ...data,
            timestamp: data.timestamp?.toDate()
          } as CollaborativeEdit);
        }
      });
    });

    this.editListeners.set(documentId, unsubscribe);
    return unsubscribe;
  }

  // Session Management
  async createSession(
    documentId: string,
    documentType: 'note' | 'task' | 'flashcard' | 'file'
  ): Promise<CollaborationSession> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session: CollaborationSession = {
      id: Date.now().toString(),
      documentId,
      documentType,
      participants: [user.id],
      createdBy: user.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };

    await setDoc(doc(db, 'collaborationSessions', session.id), {
      ...session,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });

    return session;
  }

  async joinSession(sessionId: string) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'collaborationSessions', sessionId), {
        participants: [...new Set([user.id])],
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error joining session:', error);
    }
  }

  async leaveSession(sessionId: string) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      const sessionRef = doc(db, 'collaborationSessions', sessionId);
      // Remove user from participants
      // In a real app, you'd use arrayRemove
      await updateDoc(sessionRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }

  // Document Locking
  async acquireLock(documentId: string, duration: number = 30000): Promise<boolean> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return false;

    const lockRef = doc(db, 'documentLocks', documentId);
    const expiresAt = new Date(Date.now() + duration);

    try {
      // Check if document is already locked
      const existingLock = await getDoc(lockRef);
      if (existingLock.exists()) {
        const lockData = existingLock.data() as DocumentLock;
        if (new Date(lockData.expiresAt) > new Date() && lockData.lockedBy !== user.id) {
          return false; // Document is locked by another user
        }
      }

      // Acquire lock
      await setDoc(lockRef, {
        documentId,
        lockedBy: user.id,
        lockedAt: serverTimestamp(),
        expiresAt
      });

      return true;
    } catch (error) {
      console.error('Error acquiring lock:', error);
      return false;
    }
  }

  async releaseLock(documentId: string) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      const lockRef = doc(db, 'documentLocks', documentId);
      const lock = await getDoc(lockRef);
      
      if (lock.exists() && lock.data()?.lockedBy === user.id) {
        await deleteDoc(lockRef);
      }
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  }

  // Conflict Resolution
  async resolveConflict(
    documentId: string,
    localVersion: string,
    remoteVersion: string
  ): Promise<string> {
    // Simple last-write-wins strategy
    // In a real app, you'd implement operational transformation or CRDTs
    const user = realTimeAuth.getCurrentUser();
    if (!user) return remoteVersion;

    try {
      // Log conflict for analysis
      await setDoc(doc(collection(db, 'conflicts')), {
        documentId,
        userId: user.id,
        localVersion,
        remoteVersion,
        timestamp: serverTimestamp(),
        resolution: 'remote_wins'
      });

      return remoteVersion;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return remoteVersion;
    }
  }

  // Activity Tracking
  async logActivity(
    documentId: string,
    action: string,
    details?: any
  ) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      await setDoc(doc(collection(db, 'activities')), {
        documentId,
        userId: user.id,
        userName: user.name || user.email,
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  subscribeToActivities(
    documentId: string,
    callback: (activities: any[]) => void
  ): Unsubscribe {
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('documentId', '==', documentId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(activitiesQuery, (snapshot) => {
      const activities: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()
        });
      });
      callback(activities);
    });
  }

  // Commenting System
  async addComment(
    documentId: string,
    content: string,
    position?: { line: number; column: number }
  ) {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      await setDoc(doc(collection(db, 'comments')), {
        documentId,
        userId: user.id,
        userName: user.name || user.email,
        content,
        position,
        timestamp: serverTimestamp(),
        resolved: false
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  subscribeToComments(
    documentId: string,
    callback: (comments: any[]) => void
  ): Unsubscribe {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('documentId', '==', documentId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(commentsQuery, (snapshot) => {
      const comments: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()
        });
      });
      callback(comments);
    });
  }

  // Helper Methods
  private getUserColor(userId: string): string {
    if (this.userColorMap.has(userId)) {
      return this.userColorMap.get(userId)!;
    }
    
    const color = this.userColors[this.userColorMap.size % this.userColors.length];
    this.userColorMap.set(userId, color);
    return color;
  }

  // Cleanup
  cleanup() {
    // Unsubscribe from all listeners
    this.presenceListeners.forEach(unsubscribe => unsubscribe());
    this.editListeners.forEach(unsubscribe => unsubscribe());
    this.presenceListeners.clear();
    this.editListeners.clear();
    
    // Set user status to offline
    this.updatePresence('offline');
  }
}

export const collaborationService = new CollaborationService();
