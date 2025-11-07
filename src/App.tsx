import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";
import { AuthForm } from "./components/auth/AuthForm";
import { Sidebar } from "./components/layout/Sidebar";
import { AppRouter } from "./components/router/AppRouter";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { realTimeAuth } from "./utils/realTimeAuth";
import { Menu, X } from "lucide-react";
import { GlobalNoteCreator } from "./components/notes/GlobalNoteCreator";
import { useGlobalCopyListener } from "./hooks/useGlobalCopyListener";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import { FeedbackButton } from "./components/feedback/FeedbackButton";
import { FeedbackProvider } from "./components/feedback/FeedbackContext";
import { ContextualFeedback } from "./components/feedback/SmartFeedbackPrompt";
import { DragInstructionTooltip } from "./components/feedback/DragInstructionTooltip";
import { DreamToPlanButton } from "./components/dreamToPlan/DreamToPlanButton";
import { useTodoReminders } from "./hooks/useTodoReminders";
import { User } from "./types";
import { dailyTaskReminderService } from "./services/dailyTaskReminderService";
import { GlobalPomodoroProvider } from "./contexts/GlobalPomodoroContext";
import { GlobalPomodoroWidget } from "./components/pomodoro/GlobalPomodoroWidget";
import { PomodoroEducation } from "./components/pomodoro/PomodoroEducation";
import { useGlobalPomodoro } from "./contexts/GlobalPomodoroContext";
import { CallManager } from "./components/calls/CallManager";
// Import the file permissions fixer to make it available in console
import "./utils/fixExistingFilePermissions";
// Import EmailJS test functions for console testing
import "./utils/testEmailJS";
// Test utilities removed for production

// Component to handle authenticated app content
const AuthenticatedApp: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    inviteCode?: string;
    teamId?: string;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Global copy listener for note creation
  const { copyEvent, isModalVisible, closeModal } = useGlobalCopyListener();
  
  // Global Pomodoro state
  const { isEducationVisible, hideEducation } = useGlobalPomodoro();

  // Check if user is blocked and redirect (premium check is handled by PremiumGuard)
  useEffect(() => {
    const checkUserStatus = async () => {
      const user = realTimeAuth.getCurrentUser();
      if (!user || !user.email) return;

      // Don't check if already on blocked, payment, about, landing, signup, or admin page
      // Also check sessionStorage flag to prevent redirects while on payment page
      if (location.pathname === "/blocked" || 
          location.pathname === "/payment" || 
          location.pathname === "/payment-success" ||
          location.pathname === "/about" ||
          location.pathname === "/" ||
          location.pathname === "/landing" ||
          location.pathname === "/signup" ||
          location.pathname.startsWith("/admin") ||
          sessionStorage.getItem('onPaymentPage') === 'true') {
        return;
      }

      try {
        // Only check if user is blocked - premium check is handled by PremiumGuard
        const { isUserBlockedByEmail } = await import("./services/blockedUsersService");
        const isBlocked = await isUserBlockedByEmail(user.email);
        if (isBlocked) {
          navigate("/blocked", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserStatus();
  }, [navigate, location.pathname]);

  // Handle URL parameters for team invitations
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get("invite") || urlParams.get("code");
    const teamId = urlParams.get("team");

    // Debug URL parsing if needed
    /*
    console.log("🔍 URL Parsing Debug:", {
      fullURL: window.location.href,
      searchParams: window.location.search,
      allParams: Object.fromEntries(urlParams.entries()),
      inviteCode,
      teamId,
      inviteCodeLength: inviteCode?.length,
      inviteCodeChars: inviteCode?.split("").join(", "),
    });
    */

    if (inviteCode || teamId) {
      console.log("🎯 Team invitation detected:", { inviteCode, teamId });

      // Store invitation data in sessionStorage to persist through login
      const invitationData = {
        inviteCode: inviteCode || undefined,
        teamId: teamId || undefined,
      };
      sessionStorage.setItem(
        "pendingTeamInvitation",
        JSON.stringify(invitationData)
      );

      setInvitationData(invitationData);

      // Automatically switch to team view for invitation
      navigate("/team");

      // Clean up URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("invite");
      newUrl.searchParams.delete("code");
      newUrl.searchParams.delete("team");
      window.history.replaceState({}, "", newUrl.toString());
    } else {
      // Check if there's a pending invitation from sessionStorage
      const pendingInvitation = sessionStorage.getItem("pendingTeamInvitation");
      if (pendingInvitation) {
        console.log("🔄 Found pending team invitation from storage");
        try {
          const invitationData = JSON.parse(pendingInvitation);
          setInvitationData(invitationData);
          navigate("/team");
        } catch (error) {
          console.error("❌ Error parsing pending invitation:", error);
          sessionStorage.removeItem("pendingTeamInvitation");
        }
      }
    }
  }, [navigate]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      console.log("🔄 Starting logout process...");

      // Close mobile menu if open
      setIsMobileMenuOpen(false);

      await realTimeAuth.logout();
      console.log("✅ Logout successful");

      // Use window.location for a hard redirect to ensure proper navigation
      // This ensures the app state resets and user goes to landing page
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, redirect to landing page
      window.location.href = "/";
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Routes where sidebar should not be shown (auth pages)
  const authRoutes = ["/", "/landing", "/signup", "/blocked", "/payment"];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      {/* Global Note Creator Modal */}
      {isModalVisible && copyEvent && (
        <GlobalNoteCreator
          isVisible={isModalVisible}
          onClose={closeModal}
          copiedText={copyEvent.text}
          sourceContext={copyEvent.sourceContext}
        />
      )}

      <div className="h-screen bg-gray-50 dark:bg-slate-900 flex flex-col lg:flex-row landscape-compact transition-colors duration-300 overflow-hidden" style={{ maxWidth: '100vw', width: '100%' }}>
        {/* Mobile Header - Only show on non-auth pages */}
        {!isAuthPage && (
        <div className="mobile-header lg:hidden bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 safe-area-top flex items-center justify-between relative z-30" style={{ padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)', minHeight: '60px' }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity min-w-0 flex-1 btn-touch"
            style={{ gap: 'clamp(0.5rem, 2vw, 0.75rem)' }}
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="object-contain flex-shrink-0"
              style={{ width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)' }}
              onError={(e) => {
                console.error("Logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-responsive-lg font-bold text-gray-900 dark:text-gray-100 truncate" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>
              Super Study
            </span>
          </button>

          <div className="flex items-center gap-2" style={{ gap: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
            <ThemeToggle variant="compact" />
            <button
              onClick={toggleMobileMenu}
              className="btn-touch p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 flex-shrink-0 touch-manipulation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', minWidth: '44px', minHeight: '44px' }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)' }} />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)' }} />
              )}
            </button>
          </div>
        </div>
        )}

        {/* Mobile Menu Overlay - Only show on non-auth pages */}
        {!isAuthPage && isMobileMenuOpen && (
          <div
            className="mobile-nav-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar - Desktop & Mobile - Only show on non-auth pages */}
        {!isAuthPage && (
        <div
          className={`
            ${isMobileMenuOpen ? "mobile-nav-panel" : "hidden"}
            lg:block lg:w-64 xl:w-72 lg:flex-shrink-0
            ${
              isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
          style={{ height: '100vh', maxHeight: '100vh' }}
        >
          <div className="h-full lg:h-screen" style={{ maxHeight: '100vh' }}>
            <Sidebar
              onLogout={handleLogout}
              isMobile={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col relative min-w-0 overflow-hidden ${isAuthPage ? 'w-full' : ''}`} style={{ maxWidth: '100vw', width: '100%' }}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-area-mobile" style={{ maxWidth: '100%', width: '100%' }}>
            <AppRouter invitationData={invitationData} />
          </div>
        </div>

        {/* Global Feedback Button - Only show on non-auth pages */}
        {!isAuthPage && <FeedbackButton position="draggable" />}
        
        {/* Global Dream to Plan AI Button - Only show on non-auth pages */}
        {!isAuthPage && <DreamToPlanButton position="draggable" />}
        
        {/* Contextual Feedback Prompts - Only show on non-auth pages */}
        {!isAuthPage && <ContextualFeedback />}
        
        {/* Drag Instruction Tooltip - Only show on non-auth pages */}
        {!isAuthPage && <DragInstructionTooltip />}

        {/* Global Pomodoro Widget - Only show on non-auth pages */}
        {!isAuthPage && <GlobalPomodoroWidget />}

        {/* Pomodoro Education Modal - Only show on non-auth pages */}
        {!isAuthPage && (
        <PomodoroEducation 
          isVisible={isEducationVisible} 
          onClose={hideEducation} 
        />
        )}

        {/* Global Call Manager - Only show on non-auth pages */}
        {!isAuthPage && <CallManager />}
      </div>
    </ErrorBoundary>
  );
};

// Component to check current location
const AppContent: React.FC<{
  isAuthenticated: boolean;
  showPaymentGateway: boolean;
}> = ({ isAuthenticated, showPaymentGateway }) => {
  const location = useLocation();
  
  // Always show AppRouter if on payment page
  if (location.pathname === '/payment') {
    return (
      <ErrorBoundary>
        <AppRouter invitationData={null} />
      </ErrorBoundary>
    );
  }
  
  // Show AuthenticatedApp if authenticated and not showing payment gateway
  if (isAuthenticated && !showPaymentGateway) {
    return <AuthenticatedApp />;
  }
  
  // Otherwise show AppRouter
  return (
    <ErrorBoundary>
      <AppRouter invitationData={null} />
    </ErrorBoundary>
  );
};

// Main App component with authentication and routing
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Initialize todo reminders for authenticated user
  useTodoReminders(user);

  useEffect(() => {
    // Set up real-time auth state listener
    console.log("🔐 Setting up auth state listener...");
    const unsubscribe = realTimeAuth.onAuthStateChange((currentUser) => {
      console.log("👤 Auth state changed:", { user: !!currentUser, userId: currentUser?.id });
      setUser(currentUser);
      // Check if payment gateway should be shown before authenticating
      const shouldShowPayment = sessionStorage.getItem('showPaymentGateway') === 'true';
      if (shouldShowPayment && currentUser) {
        console.log("💳 Payment gateway flag detected - showing payment gateway");
        setShowPaymentGateway(true);
        // Don't set isAuthenticated yet - wait for payment gateway to complete
        return;
      }
      // Only set authenticated if payment gateway is not active
      if (!shouldShowPayment) {
        setIsAuthenticated(!!currentUser);
      }
    });

    // Check for payment gateway flag on mount (after auth state is set up)
    const checkPaymentGateway = () => {
      const shouldShowPayment = sessionStorage.getItem('showPaymentGateway') === 'true';
      const currentUser = realTimeAuth.getCurrentUser();
      if (shouldShowPayment && currentUser) {
        console.log("💳 Payment gateway flag found on mount - showing payment gateway");
        setShowPaymentGateway(true);
        // Don't set isAuthenticated - wait for payment gateway to complete
      } else if (currentUser && !shouldShowPayment) {
        // User is authenticated and payment gateway is not needed
        console.log("✅ User authenticated on mount - setting authenticated state");
        setIsAuthenticated(true);
      } else if (!currentUser) {
        // No user - not authenticated
        setIsAuthenticated(false);
      }
    };
    
    // Check after a short delay to ensure auth state is initialized
    setTimeout(checkPaymentGateway, 100);

    // Start daily task reminder service (sends emails at 8am daily)
    console.log("📧 Starting daily task reminder service...");
    dailyTaskReminderService.startDailyReminders();

    // Clean up listener on component unmount
    return () => {
      unsubscribe();
      dailyTaskReminderService.stopReminders();
    };
  }, []);

  const handleAuthSuccess = async () => {
    console.log("🎉 Auth success handler called");
    // Clear payment gateway flag
    sessionStorage.removeItem('showPaymentGateway');
    setShowPaymentGateway(false);
    
    // Check if user is blocked or premium after authentication
    // Small delay to ensure auth state is updated
    setTimeout(async () => {
      const currentUser = realTimeAuth.getCurrentUser();
      if (currentUser?.email) {
        try {
          // Check if user is blocked
          const { isUserBlockedByEmail } = await import("./services/blockedUsersService");
          const isBlocked = await isUserBlockedByEmail(currentUser.email);
          if (isBlocked) {
            window.location.href = "/blocked";
            return;
          }

          // Check if user is premium
          const { isPremiumUser } = await import("./services/premiumUserService");
          const isPremium = await isPremiumUser(currentUser.id);
          
          if (isPremium) {
            // User is premium - redirect to dashboard
            console.log("✅ User is premium, redirecting to dashboard");
            window.location.href = "/dashboard";
          } else {
            // User is not premium - redirect to payment page
            console.log("⚠️ User is not premium, redirecting to payment page");
            window.location.href = "/payment";
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // If check fails, redirect to payment page to be safe
          window.location.href = "/payment";
        }
      } else {
        // No user found, redirect to home
        window.location.href = "/";
      }
    }, 200);
  };

  return (
    <ThemeProvider>
      <FeedbackProvider>
        <GlobalPomodoroProvider>
          <Router>
            <AppContent 
              isAuthenticated={isAuthenticated} 
              showPaymentGateway={showPaymentGateway} 
            />
          </Router>
        </GlobalPomodoroProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
