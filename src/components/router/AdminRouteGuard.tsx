import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { LoadingGlobe } from "../ui/LoadingGlobe";
import { User } from "../../types";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that ensures only the admin email can access admin routes
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const ADMIN_EMAIL = "akshayjuluri6704@gmail.com";

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;
    
    // Listen to Firebase auth state directly (more reliable)
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      
      if (firebaseUser) {
        console.log("🔍 AdminRouteGuard - Firebase auth user found:", firebaseUser.email);
        
        // Check admin status using Firebase user email directly (immediate check)
        const firebaseEmail = firebaseUser.email?.toLowerCase();
        const isAdminEmail = firebaseEmail === ADMIN_EMAIL.toLowerCase();
        
        if (!isAdminEmail) {
          console.log("⚠️ AdminRouteGuard - Not admin email, redirecting");
          setUser(null);
          setIsChecking(false);
          return;
        }
        
        // User is admin - now wait for realTimeAuth to load full user data
        console.log("✅ AdminRouteGuard - Admin email confirmed, waiting for user data...");
        
        // Try to get user data from realTimeAuth
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryGetUserData = () => {
          if (!mounted) return;
          
          const currentUser = realTimeAuth.getCurrentUser();
          if (currentUser) {
            console.log("✅ AdminRouteGuard - User data loaded:", currentUser.email);
            setUser(currentUser);
            setIsChecking(false);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryGetUserData, 300);
          } else {
            // If realTimeAuth hasn't loaded, create a minimal user object from Firebase auth
            console.log("⚠️ AdminRouteGuard - realTimeAuth not loaded, using Firebase user data");
            const minimalUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              username: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              createdAt: new Date().toISOString(),
              authProvider: "google",
            };
            setUser(minimalUser);
            setIsChecking(false);
          }
        };
        
        // Start trying to get user data
        tryGetUserData();
      } else {
        console.log("🔍 AdminRouteGuard - No Firebase auth user");
        setUser(null);
        setIsChecking(false);
      }
    });

    // Also listen to realTimeAuth changes (backup)
    const unsubscribeRealTime = realTimeAuth.onAuthStateChange((currentUser) => {
      if (!mounted) return;
      console.log("🔍 AdminRouteGuard - RealTimeAuth state changed:", currentUser?.email || "No user");
      
      // Only update if we have a user and it's the admin
      if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setUser(currentUser);
        setIsChecking(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribeFirebase();
      unsubscribeRealTime();
    };
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <LoadingGlobe size={48} className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    console.log("⚠️ Admin route accessed without authentication, redirecting to landing");
    console.log("🔍 Debug - User object:", user);
    return <Navigate to="/" replace />;
  }

  // Check if user is the admin
  const userEmail = user.email?.toLowerCase();
  const adminEmailLower = ADMIN_EMAIL.toLowerCase();
  const isAdmin = userEmail === adminEmailLower;
  
  console.log("🔍 AdminRouteGuard - User check:", {
    userEmail,
    adminEmail: adminEmailLower,
    isAdmin,
    hasEmail: !!user.email
  });
  
  if (!isAdmin) {
    console.log(`⚠️ Admin route accessed by non-admin user: ${user.email}, redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  // Allow access if user is admin
  console.log(`✅ Admin access granted for: ${user.email}`);
  return <>{children}</>;
};

