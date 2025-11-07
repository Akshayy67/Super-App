import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { isPremiumUser } from "../../services/premiumUserService";
import { LoadingGlobe } from "../ui/LoadingGlobe";
import { Crown, Lock } from "lucide-react";

interface PremiumGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that checks if user is premium and redirects to payment if not
 */
export const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsChecking(false);
        setIsPremium(false);
        return;
      }

      try {
        const premium = await isPremiumUser(user.id);
        setIsPremium(premium);
      } catch (error) {
        console.error("Error checking premium status:", error);
        setIsPremium(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <LoadingGlobe size={64} className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking premium access...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to landing
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is not premium, redirect to payment page
  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Premium Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This feature is available for premium users only. Upgrade to unlock all features!
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
              <Crown className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Get Premium Access</p>
              <p className="text-sm opacity-90">Unlock all features and resources</p>
            </div>
            
            <button
              onClick={() => window.location.href = "/payment"}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Go to Payment Page
            </button>
            
            <button
              onClick={() => window.location.href = "/"}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Allow access if user is premium
  return <>{children}</>;
};

