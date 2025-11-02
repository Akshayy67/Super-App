import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
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
import { useTodoReminders } from "./hooks/useTodoReminders";
import { User } from "./types";
import { GlobalPomodoroProvider } from "./contexts/GlobalPomodoroContext";
import { GlobalPomodoroWidget } from "./components/pomodoro/GlobalPomodoroWidget";
import { PomodoroEducation } from "./components/pomodoro/PomodoroEducation";
import { useGlobalPomodoro } from "./contexts/GlobalPomodoroContext";
// Import the file permissions fixer to make it available in console
import "./utils/fixExistingFilePermissions";
// Import EmailJS test functions for console testing
import "./utils/testEmailJS";
// Import phone number test function for console testing
import "./utils/testPhoneNumber";
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
      await realTimeAuth.logout();
      console.log("✅ Logout successful");

      // Close mobile menu if open
      setIsMobileMenuOpen(false);

      // Navigate to dashboard after logout
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

      <div className="h-screen bg-gray-50 dark:bg-slate-900 flex flex-col lg:flex-row landscape-compact transition-colors duration-300">
        {/* Mobile Header */}
        <div className="mobile-header lg:hidden bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 p-3 sm:p-4 flex items-center justify-between relative z-30">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity min-w-0 flex-1 btn-touch"
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
              onError={(e) => {
                console.error("Logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-responsive-lg font-bold text-gray-900 dark:text-gray-100 truncate">
              Super Study
            </span>
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="compact" />
            <button
              onClick={toggleMobileMenu}
              className="btn-touch p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 flex-shrink-0 touch-manipulation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="mobile-nav-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar - Desktop & Mobile */}
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
        >
          <div className="h-full lg:h-auto">
            <Sidebar
              onLogout={handleLogout}
              isMobile={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1">
            <div className="h-full">
              <AppRouter invitationData={invitationData} />
            </div>
          </div>
        </div>

        {/* Global Feedback Button */}
        <FeedbackButton position="draggable" />
        
        {/* Contextual Feedback Prompts */}
        <ContextualFeedback />
        
        {/* Drag Instruction Tooltip */}
        <DragInstructionTooltip />

        {/* Global Pomodoro Widget */}
        <GlobalPomodoroWidget />

        {/* Pomodoro Education Modal */}
        <PomodoroEducation 
          isVisible={isEducationVisible} 
          onClose={hideEducation} 
        />
      </div>
    </ErrorBoundary>
  );
};

// Main App component with authentication and routing
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize todo reminders for authenticated user
  useTodoReminders(user);

  useEffect(() => {
    // Set up real-time auth state listener
    console.log("🔐 Setting up auth state listener...");
    const unsubscribe = realTimeAuth.onAuthStateChange((currentUser) => {
      console.log("👤 Auth state changed:", { user: !!currentUser, userId: currentUser?.id });
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    });

    // Clean up listener on component unmount
    return unsubscribe;
  }, []);

  const handleAuthSuccess = () => {
    console.log("🎉 Auth success handler called");
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <AuthWrapper>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <AuthForm onAuthSuccess={handleAuthSuccess} />
          </div>
        </ErrorBoundary>
      </AuthWrapper>
    );
  }

  return (
    <ThemeProvider>
      <FeedbackProvider>
        <GlobalPomodoroProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
        </GlobalPomodoroProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
