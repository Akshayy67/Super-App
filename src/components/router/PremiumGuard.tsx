import React from "react";

interface PremiumGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard - premium check disabled, all users have access
 */
export const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
  // Premium check disabled - allow all users
  return <>{children}</>;
};

