import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { realTimeAuth } from "./realTimeAuth";

export interface JournalEntry {
  id: string;
  userId: string;
  date: Date;
  content: string;
  mood?: string;
  tags?: string[];
  goals?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DreamToPlanResult {
  themes?: Array<{
    name: string;
    description: string;
    confidence: number; // 0-100
    tags?: string[];
  }>;
  suggestedGoals: Array<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    suggestedDueDate?: Date;
  }>;
  motivationInsights: string;
  actionItems: Array<{
    text: string;
    type: "todo" | "meeting" | "reminder" | "event" | "team";
    suggestedDate?: Date;
    teamName?: string; // For team creation action items
  }>;
}

class JournalService {
  private getJournalsCollection(userId: string) {
    return collection(db, "users", userId, "journalEntries");
  }

  async createJournalEntry(
    entryData: Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<JournalEntry> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const entry: Omit<JournalEntry, "id"> = {
      ...entryData,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(this.getJournalsCollection(user.id), {
      ...entry,
      date: Timestamp.fromDate(entry.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...entry,
      id: docRef.id,
    };
  }

  async getJournalEntries(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<JournalEntry[]> {
    const journalsCollection = this.getJournalsCollection(userId);
    let q = query(journalsCollection, orderBy("date", "desc"));

    if (startDate || endDate) {
      const conditions = [];
      if (startDate) {
        conditions.push(where("date", ">=", Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        conditions.push(where("date", "<=", Timestamp.fromDate(endDate)));
      }
      q = query(journalsCollection, ...conditions, orderBy("date", "desc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: docSnapshot.id,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as JournalEntry;
    });
  }

  async getTodayJournal(userId: string): Promise<JournalEntry | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await this.getJournalEntries(userId, today, tomorrow);
    return entries[0] || null;
  }

  async updateJournalEntry(
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<void> {
    const updatesToApply: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.date) {
      updatesToApply.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(doc(this.getJournalsCollection(userId), entryId), updatesToApply);
  }

  async deleteJournalEntry(userId: string, entryId: string): Promise<void> {
    await deleteDoc(doc(this.getJournalsCollection(userId), entryId));
  }
}

export const journalService = new JournalService();

