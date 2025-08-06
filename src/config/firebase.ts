// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
    "super-app-54ae9.firebasestorage.app",
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
});

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized successfully");

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
