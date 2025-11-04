import React from "react";
import { AuthForm } from "./AuthForm";
import { AuthWrapper } from "./AuthWrapper";
import { realTimeAuth } from "../../utils/realTimeAuth";

export const SignupPage: React.FC = () => {

  const handleAuthSuccess = async () => {
    console.log("🎉 Signup success handler called");
    
    // Small delay to ensure auth state is updated
    setTimeout(async () => {
      const currentUser = realTimeAuth.getCurrentUser();
      if (currentUser?.email) {
        try {
          const { isUserBlockedByEmail } = await import("../../services/blockedUsersService");
          const isBlocked = await isUserBlockedByEmail(currentUser.email);
          if (isBlocked) {
            window.location.href = "/blocked";
            return;
          }

          // Check premium status
          const { isPremiumUserByEmail, isCreatorEmail } = await import("../../services/premiumUserService");
          
          // Creator email always has premium access
          let isPremium = false;
          if (isCreatorEmail(currentUser.email)) {
            isPremium = true;
            console.log("✅ Creator email - premium access granted");
            // Ensure creator has premium record
            try {
              const { createPremiumUser } = await import("../../services/premiumUserService");
              await createPremiumUser(currentUser.id, currentUser.email, "lifetime");
            } catch (error) {
              console.error("Error creating creator premium record:", error);
            }
          } else {
            isPremium = await isPremiumUserByEmail(currentUser.email);
          }
          
          // After signup, redirect to payment if not premium
          if (!isPremium) {
            window.location.href = "/payment";
            return;
          } else {
            // Premium user - redirect to dashboard
            window.location.href = "/dashboard";
          }
        } catch (error) {
          console.error("Error checking user status:", error);
        }
      }
    }, 200);
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </div>
    </AuthWrapper>
  );
};

