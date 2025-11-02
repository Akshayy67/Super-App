// Firebase configuration
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDF_LuEtxNFC1mj9qMtjdzGl2nIYKX7uzo",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "super-app-54ae9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "super-app-54ae9",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "super-app-54ae9.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "305774764463",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:305774764463:web:50f80fbac56757cd998f5a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D25YP2476J",
};

// Debug logging for production
console.log("Environment check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  mode: import.meta.env.MODE,
  usingFallbacks: !import.meta.env.VITE_FIREBASE_API_KEY,
  envVars: {
    VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  }
});

// Initialize Firebase
console.log("Initializing Firebase...");
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized successfully");
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");
  
  // Initialize Cloud Firestore and get a reference to the service
  // Use getFirestore instead of initializeFirestore to avoid conflicts
  db = getFirestore(app);
  console.log("✅ Firestore initialized");
  
  // Configure Google Auth Provider with necessary scopes
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
  googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
  googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
  googleProvider.addScope("https://www.googleapis.com/auth/user.phonenumbers.read");
  console.log("✅ Google Auth Provider configured");
  
  // Set custom parameters for Google OAuth
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
  
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  throw error;
}

// Export the initialized services
export { auth, db, googleProvider };

// Set the client ID for Google OAuth (optional, Firebase handles this automatically)
// but we can access it for debugging
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default app;
