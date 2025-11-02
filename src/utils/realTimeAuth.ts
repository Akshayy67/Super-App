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

  // Fetch phone number from Google People API
  private async fetchPhoneNumberFromGoogle(accessToken: string): Promise<string | null> {
    try {
      console.log("📱 Attempting to fetch phone number from Google People API...");
      const response = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=phoneNumbers",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Failed to fetch phone number from Google People API:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 403) {
          console.error("🔒 Permission denied. Possible issues:");
          console.error("   1. Google People API is not enabled in Google Cloud Console");
          console.error("   2. The phone number scope was not granted by the user");
          console.error("   3. Check: https://console.cloud.google.com/apis/library/people.googleapis.com");
        }
        
        return null;
      }

      const data = await response.json();
      const phoneNumbers = data.phoneNumbers;

      if (phoneNumbers && phoneNumbers.length > 0) {
        // Get the first phone number (usually the primary one)
        const phoneNumber = phoneNumbers[0].value;
        console.log("✅ Successfully fetched phone number from Google People API");
        return phoneNumber;
      }

      console.log("📱 No phone number found in Google profile");
      console.log("💡 The user may not have added a phone number to their Google account");
      return null;
    } catch (error) {
      console.error("❌ Error fetching phone number from Google People API:", error);
      return null;
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get Google access token from credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      let phoneNumber: string | null = null;
      
      if (credential && credential.accessToken) {
        this.googleAccessToken = credential.accessToken;
        console.log(
          "✅ Google OAuth successful with access token:",
          !!this.googleAccessToken
        );

        // Store token in localStorage for persistence
        localStorage.setItem("google_access_token", this.googleAccessToken);
        
        // Fetch phone number from Google People API
        phoneNumber = await this.fetchPhoneNumberFromGoogle(this.googleAccessToken);
      } else {
        console.log("❌ No Google access token received");
        this.googleAccessToken = null;
      }

      // Log the fetched phone number
      if (phoneNumber) {
        console.log("📱 User's mobile number:", phoneNumber);
      } else {
        console.log("📱 No mobile number found in user's Google profile");
      }

      // Create or update user document in Firestore with additional security info
      const userData: User = {
        id: firebaseUser.uid,
        username: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        phoneNumber: phoneNumber || undefined,
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
      console.log("✅ Found Google access token in memory");
      return this.googleAccessToken;
    }

    // Check localStorage as fallback
    const storedToken = localStorage.getItem("google_access_token");
    if (storedToken) {
      console.log(
        "✅ Found Google access token in localStorage, restoring to memory"
      );
      this.googleAccessToken = storedToken;
      return storedToken;
    }

    console.log("❌ No Google access token found in memory or localStorage");
    return null;
  }

  // Manually fetch and update phone number from Google People API
  async fetchAndUpdatePhoneNumber(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) {
      console.error("❌ No user is currently logged in");
      return null;
    }

    const accessToken = this.getGoogleAccessToken();
    if (!accessToken) {
      console.error("❌ No Google access token available");
      return null;
    }

    try {
      console.log("📱 Fetching phone number from Google People API...");
      const phoneNumber = await this.fetchPhoneNumberFromGoogle(accessToken);

      if (phoneNumber) {
        // Update user data in Firestore
        await setDoc(
          doc(db, "users", user.id),
          {
            phoneNumber: phoneNumber,
            updatedAt: new Date().toISOString(),
          },
          {
            merge: true,
          }
        );

        // Update current user object
        this.currentUser = {
          ...user,
          phoneNumber: phoneNumber,
        };

        // Notify all listeners about the update
        this.authStateListeners.forEach((listener) => listener(this.currentUser));

        console.log("✅ Phone number updated successfully:", phoneNumber);
        return phoneNumber;
      } else {
        console.log("📱 No phone number found in Google profile");
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching phone number:", error);
      return null;
    }
  }

  // Clear Google access token when expired
  clearGoogleAccessToken(): void {
    this.googleAccessToken = null;
    localStorage.removeItem("google_access_token");
    console.log("🧹 Cleared expired Google access token");
  }

  // Check if user has Google Drive access
  hasGoogleDriveAccess(): boolean {
    const token = this.getGoogleAccessToken();
    const hasAccess = !!token;
    console.log("🔍 Checking Google Drive access:", {
      tokenExists: !!token,
      tokenLength: token?.length,
      hasAccess,
      currentUser: !!this.currentUser,
      firebaseUser: !!auth.currentUser,
    });
    return hasAccess;
  }

  // Check if user originally signed in with Google and should have Drive access
  shouldHaveGoogleDriveAccess(): boolean {
    if (!this.currentUser) return false;
    return (
      this.currentUser.authProvider === "google" &&
      this.currentUser.hasGoogleDriveAccess === true
    );
  }

  // Check if user needs to re-authenticate for Google Drive
  needsGoogleDriveReauth(): boolean {
    return this.shouldHaveGoogleDriveAccess() && !this.hasGoogleDriveAccess();
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

  // Manually clear authentication state (useful for logout)
  clearAuthState(): void {
    console.log("🔄 Manually clearing authentication state...");
    this.currentUser = null;
    this.googleAccessToken = null;
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("user_session");

    // Notify all listeners about auth state change
    this.authStateListeners.forEach((listener) => listener(null));
    console.log("✅ Authentication state cleared");
  }

  async logout(): Promise<void> {
    try {
      console.log("🔄 Starting logout process...");

      // Clear Google access token
      this.googleAccessToken = null;
      localStorage.removeItem("google_access_token");
      console.log("✅ Google access token cleared");

      // Clear current user data
      this.currentUser = null;
      console.log("✅ Current user data cleared");

      // Sign out from Firebase
      await signOut(auth);
      console.log("✅ Firebase sign out successful");

      // Clear any other stored data
      localStorage.removeItem("user_session");

      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Even if Firebase logout fails, clear local data
      this.googleAccessToken = null;
      this.currentUser = null;
      localStorage.removeItem("google_access_token");
      localStorage.removeItem("user_session");
      throw error;
    }
  }

  // Get user data from Firestore
  private async getUserData(uid: string): Promise<User> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Log phone number if it exists in Firestore
        if (userData.phoneNumber) {
          console.log("📱 User's mobile number from Firestore:", userData.phoneNumber);
        } else {
          console.log("📱 No mobile number found in Firestore user data");
        }
        return userData;
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

  // Create a guest user for testing/demo purposes
  createGuestUser(name?: string): User {
    const guestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const guestUser: User = {
      id: guestId,
      username: name || `Guest_${guestId.slice(-6)}`,
      email: `${guestId}@guest.local`,
      createdAt: new Date().toISOString(),
    };

    this.currentUser = guestUser;
    console.log(`👤 Created guest user: ${guestUser.username}`);

    // Notify listeners
    this.authStateListeners.forEach((listener) => listener(this.currentUser));

    return guestUser;
  }

  // Check if current user is a guest
  isGuestUser(): boolean {
    return this.currentUser?.id.startsWith("guest_") || false;
  }
}

// Export singleton instance
export const realTimeAuth = new RealTimeAuthService();
