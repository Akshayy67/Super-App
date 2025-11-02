import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Post {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  comments: number;
  shares: number;
  views: number;
  viewedBy: string[];
  timestamp: Timestamp;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  attendees: string[];
  type: "study" | "workshop" | "webinar";
  createdBy: string;
  createdAt: Timestamp;
}

export interface LeaderboardUser {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  lastActive: Timestamp;
  achievements: string[];
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  type: string;
  author: string;
  authorId: string;
  downloads: number;
  downloadedBy: string[];
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: Timestamp;
}

class CommunityService {
  private postsCollection = collection(db, "community_posts");
  private eventsCollection = collection(db, "community_events");
  private leaderboardCollection = collection(db, "community_leaderboard");
  private resourcesCollection = collection(db, "community_resources");
  private commentsCollection = collection(db, "community_comments");

  // ==================== POSTS ====================

  async createPost(
    userId: string,
    userName: string,
    content: string,
    tags: string[]
  ): Promise<string> {
    try {
      const avatar = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const postData = {
        authorId: userId,
        author: userName,
        avatar,
        content,
        likes: 0,
        likedBy: [],
        comments: 0,
        shares: 0,
        views: 0,
        viewedBy: [],
        timestamp: serverTimestamp(),
        tags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(this.postsCollection, postData);

      // Award points for creating a post
      await this.updateUserPoints(userId, 10);

      return docRef.id;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  async updatePost(postId: string, content: string, tags: string[]): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        content,
        tags,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data();
      const likedBy = postData.likedBy || [];

      if (likedBy.includes(userId)) {
        // Unlike
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId),
          updatedAt: serverTimestamp(),
        });

        // Award points to post author for receiving a like
        if (postData.authorId !== userId) {
          await this.updateUserPoints(postData.authorId, 2);
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  }

  async viewPost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        return;
      }

      const postData = postDoc.data();
      const viewedBy = postData.viewedBy || [];

      if (!viewedBy.includes(userId)) {
        await updateDoc(postRef, {
          views: increment(1),
          viewedBy: arrayUnion(userId),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error viewing post:", error);
    }
  }

  async sharePost(postId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        shares: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sharing post:", error);
      throw error;
    }
  }

  subscribeToFeed(
    filterType: string = "all",
    callback: (posts: Post[]) => void
  ): () => void {
    try {
      let q;

      switch (filterType) {
        case "trending":
          q = query(
            this.postsCollection,
            orderBy("likes", "desc"),
            orderBy("timestamp", "desc"),
            limit(50)
          );
          break;
        case "recent":
          q = query(this.postsCollection, orderBy("timestamp", "desc"), limit(50));
          break;
        case "popular":
          q = query(
            this.postsCollection,
            orderBy("views", "desc"),
            orderBy("timestamp", "desc"),
            limit(50)
          );
          break;
        default:
          q = query(this.postsCollection, orderBy("timestamp", "desc"), limit(50));
      }

      return onSnapshot(q, (snapshot) => {
        const posts: Post[] = [];
        snapshot.forEach((doc) => {
          posts.push({
            id: doc.id,
            ...doc.data(),
          } as Post);
        });
        callback(posts);
      });
    } catch (error) {
      console.error("Error subscribing to feed:", error);
      return () => {};
    }
  }

  // ==================== COMMENTS ====================

  async addComment(
    postId: string,
    userId: string,
    userName: string,
    content: string
  ): Promise<void> {
    try {
      await addDoc(this.commentsCollection, {
        postId,
        authorId: userId,
        author: userName,
        content,
        createdAt: serverTimestamp(),
      });

      // Increment comment count on post
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        comments: increment(1),
      });

      // Award points
      await this.updateUserPoints(userId, 5);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  subscribeToComments(
    postId: string,
    callback: (comments: Comment[]) => void
  ): () => void {
    try {
      const q = query(
        this.commentsCollection,
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        const comments: Comment[] = [];
        snapshot.forEach((doc) => {
          comments.push({
            id: doc.id,
            ...doc.data(),
          } as Comment);
        });
        callback(comments);
      });
    } catch (error) {
      console.error("Error subscribing to comments:", error);
      return () => {};
    }
  }

  // ==================== EVENTS ====================

  async createEvent(
    userId: string,
    title: string,
    description: string,
    date: string,
    time: string,
    type: "study" | "workshop" | "webinar"
  ): Promise<string> {
    try {
      const eventData = {
        title,
        description,
        date,
        time,
        attendees: [userId],
        type,
        createdBy: userId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(this.eventsCollection, eventData);

      // Award points for creating an event
      await this.updateUserPoints(userId, 20);

      return docRef.id;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async joinEvent(eventId: string, userId: string): Promise<void> {
    try {
      const eventRef = doc(this.eventsCollection, eventId);
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }

      const eventData = eventDoc.data();
      const attendees = eventData.attendees || [];

      if (attendees.includes(userId)) {
        // Leave event
        await updateDoc(eventRef, {
          attendees: arrayRemove(userId),
        });
      } else {
        // Join event
        await updateDoc(eventRef, {
          attendees: arrayUnion(userId),
        });

        // Award points for joining an event
        await this.updateUserPoints(userId, 5);
      }
    } catch (error) {
      console.error("Error joining event:", error);
      throw error;
    }
  }

  subscribeToEvents(callback: (events: Event[]) => void): () => void {
    try {
      const q = query(this.eventsCollection, orderBy("date", "asc"), limit(20));

      return onSnapshot(q, (snapshot) => {
        const events: Event[] = [];
        snapshot.forEach((doc) => {
          events.push({
            id: doc.id,
            ...doc.data(),
          } as Event);
        });
        callback(events);
      });
    } catch (error) {
      console.error("Error subscribing to events:", error);
      return () => {};
    }
  }

  // ==================== LEADERBOARD ====================

  async initializeUserLeaderboard(
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const userRef = doc(this.leaderboardCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const avatar = userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        // Use setDoc to create the document if it doesn't exist
        await setDoc(userRef, {
          userId,
          name: userName,
          avatar,
          points: 0,
          streak: 0,
          lastActive: serverTimestamp(),
          achievements: [],
        });
      }
    } catch (error) {
      // Document doesn't exist or error occurred, create it with setDoc
      try {
        const avatar = userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const userRef = doc(this.leaderboardCollection, userId);
        await setDoc(userRef, {
          userId,
          name: userName,
          avatar,
          points: 0,
          streak: 0,
          lastActive: serverTimestamp(),
          achievements: [],
        }, { merge: true }); // Use merge: true to avoid overwriting if document exists
      } catch (createError) {
        console.error("Error initializing leaderboard:", createError);
      }
    }
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    try {
      const userRef = doc(this.leaderboardCollection, userId);
      await updateDoc(userRef, {
        points: increment(points),
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user points:", error);
    }
  }

  async updateUserStreak(userId: string): Promise<void> {
    try {
      const userRef = doc(this.leaderboardCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return;
      }

      const userData = userDoc.data();
      const lastActive = userData.lastActive?.toDate();
      const now = new Date();

      if (lastActive) {
        const diffTime = Math.abs(now.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continue streak
          await updateDoc(userRef, {
            streak: increment(1),
            lastActive: serverTimestamp(),
          });
        } else if (diffDays > 1) {
          // Reset streak
          await updateDoc(userRef, {
            streak: 1,
            lastActive: serverTimestamp(),
          });
        }
      } else {
        // First activity
        await updateDoc(userRef, {
          streak: 1,
          lastActive: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error updating user streak:", error);
    }
  }

  subscribeToLeaderboard(
    timeRange: string = "all",
    callback: (users: LeaderboardUser[]) => void
  ): () => void {
    try {
      const q = query(
        this.leaderboardCollection,
        orderBy("points", "desc"),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const users: LeaderboardUser[] = [];
        snapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data(),
          } as LeaderboardUser);
        });
        callback(users);
      });
    } catch (error) {
      console.error("Error subscribing to leaderboard:", error);
      return () => {};
    }
  }

  // ==================== RESOURCES ====================

  async shareResource(
    userId: string,
    userName: string,
    title: string,
    description: string,
    fileUrl: string,
    type: string
  ): Promise<string> {
    try {
      const resourceData = {
        title,
        description,
        fileUrl,
        type,
        author: userName,
        authorId: userId,
        downloads: 0,
        downloadedBy: [],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(this.resourcesCollection, resourceData);

      // Award points for sharing a resource
      await this.updateUserPoints(userId, 15);

      return docRef.id;
    } catch (error) {
      console.error("Error sharing resource:", error);
      throw error;
    }
  }

  async downloadResource(resourceId: string, userId: string): Promise<void> {
    try {
      const resourceRef = doc(this.resourcesCollection, resourceId);
      const resourceDoc = await getDoc(resourceRef);

      if (!resourceDoc.exists()) {
        throw new Error("Resource not found");
      }

      const resourceData = resourceDoc.data();
      const downloadedBy = resourceData.downloadedBy || [];

      if (!downloadedBy.includes(userId)) {
        await updateDoc(resourceRef, {
          downloads: increment(1),
          downloadedBy: arrayUnion(userId),
        });

        // Award points to resource author
        if (resourceData.authorId !== userId) {
          await this.updateUserPoints(resourceData.authorId, 3);
        }
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
      throw error;
    }
  }

  subscribeToResources(callback: (resources: Resource[]) => void): () => void {
    try {
      const q = query(
        this.resourcesCollection,
        orderBy("createdAt", "desc"),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const resources: Resource[] = [];
        snapshot.forEach((doc) => {
          resources.push({
            id: doc.id,
            ...doc.data(),
          } as Resource);
        });
        callback(resources);
      });
    } catch (error) {
      console.error("Error subscribing to resources:", error);
      return () => {};
    }
  }

  // ==================== STATISTICS ====================

  async getCommunityStats(): Promise<{
    activeMembers: number;
    postsToday: number;
    upcomingEvents: number;
  }> {
    try {
      // Count active members (users with recent activity)
      const leaderboardSnapshot = await getDocs(this.leaderboardCollection);
      const activeMembers = leaderboardSnapshot.size;

      // Count posts today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const postsQuery = query(
        this.postsCollection,
        where("timestamp", ">=", todayTimestamp)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsToday = postsSnapshot.size;

      // Count upcoming events
      const eventsSnapshot = await getDocs(this.eventsCollection);
      const upcomingEvents = eventsSnapshot.size;

      return {
        activeMembers,
        postsToday,
        upcomingEvents,
      };
    } catch (error) {
      console.error("Error getting community stats:", error);
      return {
        activeMembers: 0,
        postsToday: 0,
        upcomingEvents: 0,
      };
    }
  }

  async getUserStreak(userId: string): Promise<number> {
    try {
      const userRef = doc(this.leaderboardCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return 0;
      }

      return userDoc.data().streak || 0;
    } catch (error) {
      console.error("Error getting user streak:", error);
      return 0;
    }
  }
}

export const communityService = new CommunityService();

