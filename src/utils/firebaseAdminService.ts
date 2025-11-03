/**
 * Firebase Admin Service - Handles Firebase/Firestore admin operations
 * For managing Super Study App's Firebase data including users, teams, flashcards, etc.
 */

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  updateDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface FirebaseUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
  authProvider?: string;
  hasGoogleDriveAccess?: boolean;
}

interface TeamData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FlashcardData {
  id: string;
  userId: string;
  question: string;
  answer: string;
  category?: string;
  createdAt: Timestamp;
  lastReviewed?: Timestamp;
}

interface InterviewAnalytics {
  id: string;
  userId: string;
  timestamp: Timestamp;
  role: string;
  difficulty: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
}

interface FirebaseStats {
  users: {
    total: number;
    activeLastWeek: number;
    activeLastMonth: number;
    newThisWeek: number;
  };
  teams: {
    total: number;
    activeTeams: number;
    averageTeamSize: number;
  };
  content: {
    flashcards: number;
    interviewSessions: number;
    notes: number;
  };
  activity: {
    recentLogins: number;
    recentInterviews: number;
  };
}

class FirebaseAdminService {
  // Check if current user is admin
  isAdmin(): boolean {
    try {
      // Check Firebase auth user
      const firebaseUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (firebaseUser.email === "akshayjuluri6704@gmail.com") {
        return true;
      }

      // Also check realTimeAuth if available
      if (typeof window !== "undefined" && (window as any).realTimeAuth) {
        const currentUser = (window as any).realTimeAuth.getCurrentUser();
        return currentUser?.email === "akshayjuluri6704@gmail.com";
      }

      return false;
    } catch {
      return false;
    }
  }

  // Get comprehensive Firebase statistics
  async getFirebaseStats(): Promise<FirebaseStats> {
    // For now, we'll allow access if the method is called from admin dashboard
    // In production, you might want stricter checks
    console.log("Getting Firebase stats for admin dashboard...");

    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get users statistics
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const activeLastWeek = users.filter(
        (user) => user.lastLoginAt && new Date(user.lastLoginAt) > oneWeekAgo
      ).length;

      const activeLastMonth = users.filter(
        (user) => user.lastLoginAt && new Date(user.lastLoginAt) > oneMonthAgo
      ).length;

      const newThisWeek = users.filter(
        (user) => user.createdAt && new Date(user.createdAt) > oneWeekAgo
      ).length;

      // Get teams statistics
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teams = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamData[];

      const activeTeams = teams.filter((team) => {
        const memberCount = Object.keys(team.members || {}).length;
        return memberCount > 1; // Teams with more than just the owner
      }).length;

      const averageTeamSize =
        teams.length > 0
          ? teams.reduce(
              (sum, team) => sum + Object.keys(team.members || {}).length,
              0
            ) / teams.length
          : 0;

      // Get content statistics
      const flashcardsSnapshot = await getDocs(collection(db, "flashcards"));
      const interviewAnalyticsSnapshot = await getDocs(
        collection(db, "interview_analytics")
      );
      const notesSnapshot = await getDocs(collection(db, "notes"));

      // Get recent activity
      const recentLoginsQuery = query(
        collection(db, "users"),
        where("lastLoginAt", ">=", oneWeekAgo.toISOString())
      );
      const recentLoginsSnapshot = await getDocs(recentLoginsQuery);

      const recentInterviewsQuery = query(
        collection(db, "interview_analytics"),
        where("timestamp", ">=", Timestamp.fromDate(oneWeekAgo))
      );
      const recentInterviewsSnapshot = await getDocs(recentInterviewsQuery);

      return {
        users: {
          total: users.length,
          activeLastWeek,
          activeLastMonth,
          newThisWeek,
        },
        teams: {
          total: teams.length,
          activeTeams,
          averageTeamSize: Math.round(averageTeamSize * 10) / 10,
        },
        content: {
          flashcards: flashcardsSnapshot.size,
          interviewSessions: interviewAnalyticsSnapshot.size,
          notes: notesSnapshot.size,
        },
        activity: {
          recentLogins: recentLoginsSnapshot.size,
          recentInterviews: recentInterviewsSnapshot.size,
        },
      };
    } catch (error) {
      console.error("Error getting Firebase stats:", error);
      throw error;
    }
  }

  // Get all Firebase users with pagination
  async getFirebaseUsers(
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{
    users: FirebaseUser[];
    hasMore: boolean;
    lastDoc: any;
  }> {
    console.log("Getting Firebase users for admin dashboard...");

    try {
      let usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      if (lastDoc) {
        usersQuery = query(usersQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseUser[];

      return {
        users,
        hasMore: snapshot.docs.length === pageSize,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error("Error getting Firebase users:", error);
      throw error;
    }
  }

  // Get user details including their content
  async getUserDetails(userId: string): Promise<{
    user: FirebaseUser;
    teams: TeamData[];
    flashcards: FlashcardData[];
    interviews: InterviewAnalytics[];
  }> {
    console.log("Getting user details for admin dashboard...");

    try {
      // Get user document
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const user = { id: userDoc.id, ...userDoc.data() } as FirebaseUser;

      // Get user's teams
      const teamsQuery = query(
        collection(db, "teams"),
        where(`members.${userId}`, "!=", null)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      const teams = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamData[];

      // Get user's flashcards (if stored in Firestore)
      const flashcardsQuery = query(
        collection(db, "flashcards"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      const flashcards = flashcardsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FlashcardData[];

      // Get user's interview analytics
      const interviewsQuery = query(
        collection(db, "interview_analytics"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      const interviews = interviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InterviewAnalytics[];

      return {
        user,
        teams,
        flashcards,
        interviews,
      };
    } catch (error) {
      console.error("Error getting user details:", error);
      throw error;
    }
  }

  // Delete user and all associated data
  async deleteUser(userId: string): Promise<void> {
    console.log("Deleting user for admin dashboard...");

    try {
      const batch = writeBatch(db);

      // Delete user document
      batch.delete(doc(db, "users", userId));

      // Delete user's flashcards
      const flashcardsQuery = query(
        collection(db, "flashcards"),
        where("userId", "==", userId)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      flashcardsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's interview analytics
      const interviewsQuery = query(
        collection(db, "interview_analytics"),
        where("userId", "==", userId)
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      interviewsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Remove user from teams (update team documents)
      const teamsQuery = query(
        collection(db, "teams"),
        where(`members.${userId}`, "!=", null)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      teamsSnapshot.docs.forEach((teamDoc) => {
        const teamData = teamDoc.data();
        const updatedMembers = { ...teamData.members };
        delete updatedMembers[userId];

        batch.update(teamDoc.ref, {
          members: updatedMembers,
          updatedAt: Timestamp.now(),
        });
      });

      // Commit all deletions
      await batch.commit();

      console.log(
        `🗑️ Firebase admin deletion: User ${userId} and all associated data deleted`
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Get all teams with statistics
  async getTeams(): Promise<TeamData[]> {
    console.log("Getting teams for admin dashboard...");

    try {
      const teamsSnapshot = await getDocs(
        query(collection(db, "teams"), orderBy("createdAt", "desc"))
      );

      return teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamData[];
    } catch (error) {
      console.error("Error getting teams:", error);
      throw error;
    }
  }

  // Get recent interview analytics
  async getRecentInterviews(limit: number = 50): Promise<InterviewAnalytics[]> {
    console.log("Getting recent interviews for admin dashboard...");

    try {
      const interviewsQuery = query(
        collection(db, "interview_analytics"),
        orderBy("timestamp", "desc"),
        limit(limit)
      );

      const snapshot = await getDocs(interviewsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InterviewAnalytics[];
    } catch (error) {
      console.error("Error getting recent interviews:", error);
      throw error;
    }
  }

  // Export Firebase data
  async exportFirebaseData(
    type: "users" | "teams" | "interviews" | "all"
  ): Promise<any> {
    console.log("Exporting Firebase data for admin dashboard...");

    try {
      const exportData: any = {
        exportedAt: new Date().toISOString(),
        type,
      };

      if (type === "users" || type === "all") {
        const usersSnapshot = await getDocs(collection(db, "users"));
        exportData.users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      if (type === "teams" || type === "all") {
        exportData.teams = await this.getTeams();
      }

      if (type === "interviews" || type === "all") {
        exportData.interviews = await this.getRecentInterviews(1000);
      }

      return exportData;
    } catch (error) {
      console.error("Error exporting Firebase data:", error);
      throw error;
    }
  }
}

export const firebaseAdminService = new FirebaseAdminService();
export type {
  FirebaseUser,
  TeamData,
  FlashcardData,
  InterviewAnalytics,
  FirebaseStats,
};
