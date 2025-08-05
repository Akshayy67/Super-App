// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDF_LuEtxNFC1mj9qMtjdzGl2nIYKX7uzo",
  authDomain: "super-app-54ae9.firebaseapp.com",
  projectId: "super-app-54ae9",
  storageBucket: "super-app-54ae9.firebasestorage.app",
  messagingSenderId: "305774764463",
  appId: "1:305774764463:web:50f80fbac56757cd998f5a",
  measurementId: "G-D25YP2476J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
