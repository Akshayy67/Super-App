// Resume Storage Utilities (localStorage + Firebase)
import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import type { ResumeData } from "../types/resumeBuilder";
import { realTimeAuth } from "./realTimeAuth";

const STORAGE_KEY = "resume_builder_data";
const STORAGE_VERSION = "1.0";

interface StoredResume {
  id: string;
  data: ResumeData;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ResumeStorage {
  /**
   * Save resume to localStorage (for offline/quick access)
   */
  static saveToLocal(resumeData: ResumeData): void {
    try {
      const storageData = {
        version: STORAGE_VERSION,
        data: resumeData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Error saving resume to localStorage:", error);
    }
  }

  /**
   * Load resume from localStorage
   */
  static loadFromLocal(): ResumeData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (parsed.version === STORAGE_VERSION && parsed.data) {
        return parsed.data;
      }
    } catch (error) {
      console.error("Error loading resume from localStorage:", error);
    }
    return null;
  }

  /**
   * Save resume to Firebase (cloud sync)
   */
  static async saveToCloud(resumeData: ResumeData): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      throw new Error("User must be authenticated to save to cloud");
    }

    try {
      const resumeId = resumeData.id || `resume_${Date.now()}`;
      const resumeRef = doc(db, "resumes", resumeId);

      const storedResume: StoredResume = {
        id: resumeId,
        data: {
          ...resumeData,
          id: resumeId,
          metadata: {
            ...resumeData.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
        userId: user.id,
        createdAt: resumeData.metadata.createdAt
          ? Timestamp.fromDate(new Date(resumeData.metadata.createdAt))
          : Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(resumeRef, storedResume);
      return resumeId;
    } catch (error) {
      console.error("Error saving resume to cloud:", error);
      throw error;
    }
  }

  /**
   * Load resume from Firebase
   */
  static async loadFromCloud(resumeId: string): Promise<ResumeData | null> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      throw new Error("User must be authenticated to load from cloud");
    }

    try {
      const resumeRef = doc(db, "resumes", resumeId);
      const docSnap = await getDoc(resumeRef);

      if (!docSnap.exists()) {
        return null;
      }

      const stored = docSnap.data() as StoredResume;
      if (stored.userId !== user.id) {
        throw new Error("Unauthorized access to resume");
      }

      return stored.data;
    } catch (error) {
      console.error("Error loading resume from cloud:", error);
      throw error;
    }
  }

  /**
   * List all user's resumes from Firebase
   */
  static async listUserResumes(): Promise<ResumeData[]> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      return [];
    }

    try {
      const resumesRef = collection(db, "resumes");
      const q = query(resumesRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const stored = doc.data() as StoredResume;
        return stored.data;
      });
    } catch (error) {
      console.error("Error listing resumes:", error);
      return [];
    }
  }

  /**
   * Delete resume from Firebase
   */
  static async deleteFromCloud(resumeId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      throw new Error("User must be authenticated to delete resume");
    }

    try {
      // Verify ownership
      const resume = await this.loadFromCloud(resumeId);
      if (!resume) {
        throw new Error("Resume not found");
      }

      const resumeRef = doc(db, "resumes", resumeId);
      await deleteDoc(resumeRef);
    } catch (error) {
      console.error("Error deleting resume:", error);
      throw error;
    }
  }

  /**
   * Auto-save resume (saves to both local and cloud)
   */
  static async autoSave(resumeData: ResumeData): Promise<void> {
    // Always save to local first (fast)
    this.saveToLocal(resumeData);

    // Try to save to cloud if user is authenticated
    const user = realTimeAuth.getCurrentUser();
    if (user) {
      try {
        await this.saveToCloud(resumeData);
      } catch (error) {
        console.warn("Cloud save failed, but local save succeeded:", error);
      }
    }
  }
}

