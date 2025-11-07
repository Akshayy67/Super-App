import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../config/firebase";
import { User } from "../types";
import { googleDriveService } from "./googleDriveService";

export interface AuthResult {
  success: boolean;
  message?: string | null;
  user?: User;
  isBlocked?: boolean;
  isPremium?: boolean;
}

class RealTimeAuthService {
  private googleAccessToken: string | null = null;

  async signInWithGoogle(useRedirect: boolean = false): Promise<AuthResult> {
    try {
      let firebaseUser;
      let credential;
      
      if (useRedirect) {
        // Use redirect method (more reliable, works better on mobile)
        console.log("🔄 Using redirect-based authentication...");
        await signInWithRedirect(auth, googleProvider);
        // This will redirect the page, so we won't reach here
        // The result will be handled by getRedirectResult in the component
        return { success: false, message: "Redirecting to Google..." };
      }
      
      // Use popup method (default - opens popup window)
      console.log("🔄 Opening Google sign-in popup...");
      
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
      credential = GoogleAuthProvider.credentialFromResult(result);
      console.log("✅ Popup authentication successful", {
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        hasCredential: !!credential,
        hasAccessToken: !!credential?.accessToken
      });

      // Check if user is blocked - but don't sign them out yet
      // Let them authenticate, then redirect to blocked page
      const { isUserBlockedByEmail } = await import("../services/blockedUsersService");
      const isBlocked = await isUserBlockedByEmail(firebaseUser.email || "");

      // Premium check disabled - all users have premium access
      const userEmail = firebaseUser.email || "";
      const isPremium = true; // All users have premium access
      console.log("✅ Premium check disabled - all users have access");
      
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

      // Initialize Google Drive app folder if user has access (only if not blocked)
      if (this.googleAccessToken && !isBlocked) {
        try {
          await googleDriveService.getAppFolder();
          console.log("Google Drive app folder initialized");
        } catch (error) {
          console.error("Error initializing Google Drive folder:", error);
        }
      }

      // If blocked, return success but with a flag to redirect
      if (isBlocked) {
        return {
          success: true,
          message: "Your account has been blocked. Please contact support if you believe this is an error.",
          user: userData,
          isBlocked: true,
          isPremium: false,
        };
      }

      return {
        success: true,
        message: "Google sign-in successful",
        user: userData,
        isPremium: isPremium,
      };
    } catch (error: any) {
      // Log detailed error information
      console.error("Google sign-in error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Handle popup-closed-by-user gracefully - sign in with demo credentials
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        console.log("ℹ️ Sign-in popup was closed by user - signing in with demo credentials");
        // Automatically sign in with demo credentials
        return await this.signInWithDemo();
      }
      
      // Handle popup-blocked - suggest redirect
      if (error.code === "auth/popup-blocked") {
        console.warn("⚠️ Popup was blocked by browser");
        return { success: false, message: "Pop-up was blocked. Please allow pop-ups and try again, or we can redirect you to sign in." };
      }
      
      // Log other errors with full details
      console.error("Google sign-in error:", error);
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  }

  // Handle redirect result after Google sign-in
  async handleRedirectResult(): Promise<AuthResult | null> {
    try {
      const result = await getRedirectResult(auth);
      if (!result) {
        return null; // No redirect result, user didn't come from redirect
      }

      const firebaseUser = result.user;
      console.log("✅ Redirect authentication successful");

      // Check if user is blocked
      const { isUserBlockedByEmail } = await import("../services/blockedUsersService");
      const isBlocked = await isUserBlockedByEmail(firebaseUser.email || "");

      // Premium check disabled - all users have premium access
      const userEmail = firebaseUser.email || "";
      const isPremium = true;
      console.log("✅ Premium check disabled - all users have access");

      // Get Google access token from credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential && credential.accessToken) {
        this.googleAccessToken = credential.accessToken;
        console.log("✅ Google OAuth successful with access token");
        localStorage.setItem("google_access_token", this.googleAccessToken);
      } else {
        console.log("❌ No Google access token received");
        this.googleAccessToken = null;
      }

      // Create or update user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        username: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        createdAt: new Date().toISOString(),
      };

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
      if (this.googleAccessToken && !isBlocked) {
        try {
          await googleDriveService.getAppFolder();
          console.log("Google Drive app folder initialized");
        } catch (error) {
          console.error("Error initializing Google Drive folder:", error);
        }
      }

      if (isBlocked) {
        return {
          success: true,
          message: "Your account has been blocked. Please contact support if you believe this is an error.",
          user: userData,
          isBlocked: true,
          isPremium: false,
        };
      }

      return {
        success: true,
        message: "Google sign-in successful",
        user: userData,
        isPremium: isPremium,
      };
    } catch (error: any) {
      console.error("Error handling redirect result:", error);
      return {
        success: false,
        message: this.getErrorMessage(error.code || "unknown"),
      };
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
        // Note: We don't sign out blocked users here anymore
        // They will be redirected to /blocked page by AuthenticatedApp or BlockedUserGuard
        // This allows them to see the blocked page with proper authentication
        
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

  // Sign in with demo credentials
  async signInWithDemo(): Promise<AuthResult> {
    try {
      const demoEmail = "demo@super-app.tech";
      const demoPassword = "demo123";
      
      console.log("🔄 Signing in with demo credentials...");
      
      let firebaseUser;
      
      // First, try to create the account (will fail if it already exists)
      try {
        console.log("📝 Attempting to create demo account...");
        const createCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        firebaseUser = createCredential.user;
        console.log("✅ Demo account created successfully");
      } catch (createError: any) {
        // If account already exists, try to sign in
        if (createError.code === "auth/email-already-in-use") {
          console.log("📝 Demo account exists, signing in...");
          try {
            const signInCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
            firebaseUser = signInCredential.user;
            console.log("✅ Demo sign-in successful");
          } catch (signInError: any) {
            // If sign-in fails, it might be wrong password - try to handle it
            console.error("Demo sign-in failed:", signInError);
            if (signInError.code === "auth/invalid-credential" || signInError.code === "auth/wrong-password") {
              // Account exists but password is wrong - this shouldn't happen with demo
              // But we'll handle it gracefully
              return {
                success: false,
                message: "Demo account exists but credentials are invalid. Please contact support."
              };
            }
            throw signInError;
          }
        } else {
          // Other creation errors
          console.error("Failed to create demo account:", createError);
          throw createError;
        }
      }

      // Create or update user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        username: "Demo User",
        email: demoEmail,
        createdAt: new Date().toISOString(),
      };

      // Store user data with last login timestamp
      try {
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          {
            ...userData,
            lastLoginAt: new Date().toISOString(),
            authProvider: "demo",
            isDemo: true,
          },
          {
            merge: true,
          }
        );
        console.log("✅ Demo user data stored in Firestore");
      } catch (firestoreError) {
        console.warn("⚠️ Could not store demo user in Firestore:", firestoreError);
        // Continue anyway - user is authenticated
      }

      console.log("✅ Demo user authenticated:", demoEmail);

      return {
        success: true,
        message: "Demo sign-in successful",
        user: userData,
        isPremium: true, // Demo users have premium access
      };
    } catch (error: any) {
      console.error("Demo sign-in error:", error);
      return { 
        success: false, 
        message: error.message || "Failed to sign in with demo credentials. Please make sure Email/Password authentication is enabled in Firebase Console." 
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

  /**
   * Request Google Drive access for users who didn't grant it initially
   * This signs the user out and prompts them to sign in again with Drive access
   */
  async requestGoogleDriveAccess(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Check if user already has Drive access
      if (this.hasGoogleDriveAccess()) {
        return { success: true, error: "Google Drive access already granted" };
      }

      console.log("🔄 Requesting Google Drive access...");

      // Store that user wants Drive access
      sessionStorage.setItem("request_drive_access", "true");
      
      // Store current session info
      const currentEmail = user.email;
      sessionStorage.setItem("preserve_session", "true");
      sessionStorage.setItem("user_email", currentEmail || "");
      
      // Sign out and redirect to sign-in
      // User will need to sign in again and grant Drive access
      await this.logout();
      
      return {
        success: true,
        error: "Please sign in again with Google and grant Drive access"
      };
    } catch (error: any) {
      console.error("Error requesting Drive access:", error);
      return {
        success: false,
        error: error.message || "Failed to request Drive access"
      };
    }
  }
}

// Export singleton instance
export const realTimeAuth = new RealTimeAuthService();
