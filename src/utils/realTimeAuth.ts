import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../config/firebase";
import { User } from "../types";
import { googleDriveService } from "./googleDriveService";

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

class RealTimeAuthService {
  private googleAccessToken: string | null = null;

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get Google access token from credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        this.googleAccessToken = credential.accessToken;
        console.log(
          "✅ Google OAuth successful with access token:",
          !!this.googleAccessToken
        );

        // Store token in localStorage for persistence
        localStorage.setItem("google_access_token", this.googleAccessToken);
      } else {
        console.log("❌ No Google access token received");
        this.googleAccessToken = null;
      }

      // Create or update user document in Firestore with additional security info
      const userData: User = {
        id: firebaseUser.uid,
        username: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        createdAt: new Date().toISOString(),
      };

      // Store user data with last login timestamp
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          ...userData,
          lastLoginAt: new Date().toISOString(),
          authProvider: "google",
          hasGoogleDriveAccess: !!this.googleAccessToken,
        },
        {
          merge: true,
        }
      );

      // Initialize Google Drive app folder if user has access
      if (this.googleAccessToken) {
        try {
          await googleDriveService.getAppFolder();
          console.log("Google Drive app folder initialized");
        } catch (error) {
          console.error("Error initializing Google Drive folder:", error);
        }
      }

      return {
        success: true,
        message: "Google sign-in successful",
        user: userData,
      };
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  }

  // Get Google access token for Drive API
  getGoogleAccessToken(): string | null {
    // Check memory first
    if (this.googleAccessToken) {
      return this.googleAccessToken;
    }

    // Check localStorage as fallback
    const storedToken = localStorage.getItem("google_access_token");
    if (storedToken) {
      this.googleAccessToken = storedToken;
      return storedToken;
    }

    return null;
  }

  // Check if user has Google Drive access
  hasGoogleDriveAccess(): boolean {
    const token = this.getGoogleAccessToken();
    console.log("🔍 Checking Google Drive access, token exists:", !!token);
    return !!token;
  }
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Initialize Google access token from localStorage
    const storedToken = localStorage.getItem("google_access_token");
    if (storedToken) {
      this.googleAccessToken = storedToken;
      console.log("🔄 Restored Google access token from localStorage");
    }

    // Set up real-time auth state listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        this.currentUser = userData;
      } else {
        this.currentUser = null;
        // Clear Google token when user signs out
        this.googleAccessToken = null;
        localStorage.removeItem("google_access_token");
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
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled";
      case "auth/popup-blocked":
        return "Pop-up was blocked. Please allow pop-ups and try again";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later";
      default:
        return "An error occurred during sign-in. Please try again";
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
