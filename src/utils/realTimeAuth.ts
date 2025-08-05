import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { User } from "../types";

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

class RealTimeAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Set up real-time auth state listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        this.currentUser = userData;
      } else {
        this.currentUser = null;
      }

      // Notify all listeners about auth state change
      this.authStateListeners.forEach((listener) => listener(this.currentUser));
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResult> {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: username,
      });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        username,
        email,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      return {
        success: true,
        message: "Registration successful",
        user: userData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const userData = await this.getUserData(firebaseUser.uid);

      return {
        success: true,
        message: "Login successful",
        user: userData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: this.getErrorMessage(error.code),
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Get user data from Firestore
  private async getUserData(uid: string): Promise<User> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      throw new Error("User data not found");
    } catch (error) {
      // Fallback to Firebase user data
      const firebaseUser = auth.currentUser;
      return {
        id: uid,
        username: firebaseUser?.displayName || "Unknown",
        email: firebaseUser?.email || "",
        createdAt: new Date().toISOString(),
      };
    }
  }

  // Convert Firebase error codes to user-friendly messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "An account with this email already exists";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later";
      default:
        return "An error occurred. Please try again";
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// Export singleton instance
export const realTimeAuth = new RealTimeAuthService();
