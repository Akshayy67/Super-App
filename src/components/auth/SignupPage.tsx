import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "./AuthForm";
import { AuthWrapper } from "./AuthWrapper";
import { realTimeAuth } from "../../utils/realTimeAuth";

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const currentUser = realTimeAuth.getCurrentUser();
      if (currentUser?.email) {
        console.log("✅ User already authenticated, redirecting from signup page");
        try {
          const { isUserBlockedByEmail } = await import("../../services/blockedUsersService");
          const isBlocked = await isUserBlockedByEmail(currentUser.email);
          if (isBlocked) {
            navigate("/blocked", { replace: true });
            return;
          }
          
          // Freemium: All authenticated users go to dashboard
          console.log("✅ Redirecting to dashboard (freemium)");
          navigate("/dashboard", { replace: true });
        } catch (error) {
          console.error("Error checking user status:", error);
          // If check fails, still go to dashboard (freemium)
          navigate("/dashboard", { replace: true });
        }
      }
    };

    checkAuthAndRedirect();

    // Also listen for auth state changes
    const unsubscribe = realTimeAuth.onAuthStateChange((user) => {
      if (user?.email) {
        console.log("✅ Auth state changed - user authenticated, redirecting from signup");
        checkAuthAndRedirect();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
            navigate("/blocked", { replace: true });
            return;
          }

          // Freemium: All authenticated users go to dashboard
          console.log("✅ User authenticated - redirecting to dashboard (freemium)");
          navigate("/dashboard", { replace: true });
        } catch (error) {
          console.error("Error checking user status:", error);
          // If check fails, still go to dashboard (freemium)
          navigate("/dashboard", { replace: true });
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

