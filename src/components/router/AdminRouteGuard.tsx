import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that ensures only the admin email can access admin routes
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(realTimeAuth.getCurrentUser());
  const ADMIN_EMAIL = "akshayjuluri6704@gmail.com";

  useEffect(() => {
    // Wait for auth state to be ready
    const checkAuth = async () => {
      // Get current user
      const currentUser = realTimeAuth.getCurrentUser();
      setUser(currentUser);
      
      // Also subscribe to auth state changes
      const unsubscribe = realTimeAuth.onAuthStateChange((updatedUser) => {
        setUser(updatedUser);
        setIsChecking(false);
      });

      // If we have a user immediately, stop checking
      if (currentUser) {
        setIsChecking(false);
      } else {
        // Wait a bit for auth state to initialize
        setTimeout(() => {
          const finalUser = realTimeAuth.getCurrentUser();
          setUser(finalUser);
          setIsChecking(false);
        }, 500);
      }

      return () => unsubscribe();
    };

    checkAuth();
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    );
  }

  // Debug logging
  console.log("🔐 Admin Route Guard Check:", {
    hasUser: !!user,
    userEmail: user?.email,
    adminEmail: ADMIN_EMAIL,
    isMatch: user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  });

  // If not authenticated, redirect to landing page
  if (!user) {
    console.warn("⚠️ Admin access denied: No authenticated user");
    return <Navigate to="/" replace />;
  }

  // Check if user is the admin
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  if (!isAdmin) {
    console.warn("⚠️ Admin access denied: User is not admin", {
      userEmail: user.email,
      adminEmail: ADMIN_EMAIL,
    });
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Admin access granted:", user.email);
  // Allow access if user is admin
  return <>{children}</>;
};

