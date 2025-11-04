import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { isUserBlockedByEmail } from "../../services/blockedUsersService";

interface BlockedUserGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that checks if user is blocked and redirects to blocked page
 */
export const BlockedUserGuard: React.FC<BlockedUserGuardProps> = ({ children }) => {
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    const checkBlockedStatus = async () => {
      if (!user || !user.email) {
        setIsChecking(false);
        // If no user, they'll be redirected by the main App component
        // But we can also redirect here to be safe
        return;
      }

      try {
        const blocked = await isUserBlockedByEmail(user.email);
        setIsBlocked(blocked);
      } catch (error) {
        console.error("Error checking if user is blocked:", error);
        setIsBlocked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBlockedStatus();
  }, [user]);

  // If no user, redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If user is blocked, redirect to blocked page
  if (isBlocked) {
    return <Navigate to="/blocked" replace />;
  }

  // Allow access if user is not blocked
  return <>{children}</>;
};

