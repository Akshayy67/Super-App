import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { isPremiumUser } from "../../services/premiumUserService";
import { PremiumUpsell } from "../premium/PremiumUpsell";

interface PremiumGuardProps {
  children: React.ReactNode;
  featureName?: string;
}

/**
 * Route guard that checks if user is premium and shows upsell if not
 */
export const PremiumGuard: React.FC<PremiumGuardProps> = ({ children, featureName }) => {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Checking access...</div>
        </div>
      </div>
    );
  }

  // If user is not premium, show beautiful upsell screen
  if (!isPremium) {
    // Store the attempted URL so we can redirect back after payment
    sessionStorage.setItem('redirectAfterPayment', location.pathname);
    
    // Get feature name from pathname if not provided
    const defaultFeatureName = featureName || getFeatureName(location.pathname);
    
    return <PremiumUpsell featureName={defaultFeatureName} />;
  }

  // Allow access if user is premium
  return <>{children}</>;
};

// Helper function to get friendly feature names from paths
function getFeatureName(pathname: string): string {
  const featureMap: Record<string, string> = {
    '/chat': 'AI Assistant',
    '/tools': 'Study Tools',
    '/interview': 'Interview Prep',
    '/ai-assistant': 'AI Learning Assistant',
    '/study-rooms': 'Study Rooms',
    '/team': 'Team Space',
    '/community': 'Community',
    '/calendar': 'Calendar',
    '/journal': 'Journal',
    '/meetings': 'Meetings',
    '/gamified-profile': 'Gamified Profile',
    '/leaderboard': 'Leaderboard',
    '/coding-interview': 'AI Coding Interview',
    '/skill-assessment': 'Skill Assessment',
    '/contests': 'Contests',
  };

  for (const [path, name] of Object.entries(featureMap)) {
    if (pathname.startsWith(path)) {
      return name;
    }
  }

  return 'this premium feature';
}

