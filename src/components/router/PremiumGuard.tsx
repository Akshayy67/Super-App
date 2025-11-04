import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { isPremiumUserByEmail } from "../../services/premiumUserService";

interface PremiumGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that checks if user is premium and redirects to payment page if not
 */
export const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const user = realTimeAuth.getCurrentUser();
      if (!user || !user.email) {
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      try {
        const premium = await isPremiumUserByEmail(user.email);
        setIsPremium(premium);
      } catch (error) {
        console.error("Error checking if user is premium:", error);
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking premium status...</p>
        </div>
      </div>
    );
  }

  // If user is not premium, redirect to payment
  if (!isPremium) {
    return <Navigate to="/payment" replace />;
  }

  // Allow access if user is premium
  return <>{children}</>;
};

