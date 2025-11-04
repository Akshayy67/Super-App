import React from "react";
import { Navigate } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that ensures only the admin email can access admin routes
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const user = realTimeAuth.getCurrentUser();
  const ADMIN_EMAIL = "akshayjuluri6704@gmail.com";

  // Check if user is authenticated and is the admin
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  // Allow access if user is admin
  return <>{children}</>;
};

