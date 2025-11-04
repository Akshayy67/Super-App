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
  const [user, setUser] = useState(realTimeAuth.getCurrentUser());
  const [isChecking, setIsChecking] = useState(true);
  const ADMIN_EMAIL = "akshayjuluri6704@gmail.com";

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = realTimeAuth.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setIsChecking(false);
    });

    // Check initial state
    const currentUser = realTimeAuth.getCurrentUser();
    setUser(currentUser);
    setIsChecking(false);

    return unsubscribe;
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    console.log("⚠️ Admin route accessed without authentication, redirecting to landing");
    return <Navigate to="/" replace />;
  }

  // Check if user is the admin
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (!isAdmin) {
    console.log(`⚠️ Admin route accessed by non-admin user: ${user.email}, redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  // Allow access if user is admin
  console.log(`✅ Admin access granted for: ${user.email}`);
  return <>{children}</>;
};

