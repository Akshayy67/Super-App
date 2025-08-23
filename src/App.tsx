import { useState, useEffect } from "react";
import { AuthForm } from "./components/AuthForm";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { FileManager } from "./components/FileManager";
import { TaskManager } from "./components/TaskManager";
import { NotesManager } from "./components/NotesManager";
import { AIChat } from "./components/AIChat";
import { StudyTools } from "./components/StudyTools";
import { FlashCards } from "./components/FlashCards";
import { InterviewPrep } from "./components/InterviewPrep/InterviewPrep";
import { TeamSpace } from "./components/TeamSpace";
// Removed unused FilePreview import
import ErrorBoundary from "./components/ErrorBoundary";
import { realTimeAuth } from "./utils/realTimeAuth";
// Removed unused FileItem and User imports
import { Menu, X } from "lucide-react";
import { GlobalNoteCreator } from "./components/GlobalNoteCreator";
import { useGlobalCopyListener } from "./hooks/useGlobalCopyListener";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Removed unused currentUser state
  const [activeView, setActiveView] = useState("dashboard");
  // Removed unused previewFile state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    inviteCode?: string;
    teamId?: string;
  } | null>(null);

  // Global copy listener for note creation
  const { copyEvent, isModalVisible, closeModal } = useGlobalCopyListener();

  useEffect(() => {
    // Set up real-time auth state listener
    console.log("🔐 Setting up auth state listener...");
    const unsubscribe = realTimeAuth.onAuthStateChange((user) => {
      console.log("👤 Auth state changed:", { user: !!user, userId: user?.id });
      setIsAuthenticated(!!user);
      // Removed unused setCurrentUser
    });

    // Clean up listener on component unmount
    return unsubscribe;
  }, []);

  // Handle URL parameters for team invitations
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get("invite") || urlParams.get("code");
    const teamId = urlParams.get("team");

    console.log("🔍 URL Parsing Debug:", {
      fullURL: window.location.href,
      searchParams: window.location.search,
      allParams: Object.fromEntries(urlParams.entries()),
      inviteCode,
      teamId,
      inviteCodeLength: inviteCode?.length,
      inviteCodeChars: inviteCode?.split("").join(", "),
    });

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
      setActiveView("team");

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
          setActiveView("team");
        } catch (error) {
          console.error("❌ Error parsing pending invitation:", error);
          sessionStorage.removeItem("pendingTeamInvitation");
        }
      }
    }
  }, []);

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

  const handleAuthSuccess = () => {
    console.log("🎉 Auth success handler called, setting view to dashboard");
    setActiveView("dashboard");
  };

  const handleLogout = async () => {
    try {
      console.log("🔄 Starting logout process...");
      await realTimeAuth.logout();
      console.log("✅ Logout successful");

      // Force update authentication state
      setIsAuthenticated(false);

      // Reset view to dashboard for next login
      setActiveView("dashboard");

      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, we should still redirect to auth
      setIsAuthenticated(false);
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false); // Close mobile menu when view changes
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Removed unused handlePreviewFile

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onViewChange={handleViewChange} />;
      case "files":
        return <FileManager />;
      case "tasks":
        return <TaskManager />;
      case "notes":
        return <NotesManager />;
      case "chat":
        return <AIChat />;
      case "tools":
        return <StudyTools />;
      case "flashcards":
        return <FlashCards />;
      case "interview":
        return <InterviewPrep />;
      case "team":
        return <TeamSpace invitationData={invitationData} />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </ErrorBoundary>
    );
  }

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

      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row landscape-compact">
        {/* Mobile Header */}
        <div className="mobile-header lg:hidden bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between relative z-30">
          <button
            onClick={() => handleViewChange("dashboard")}
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
            <span className="text-responsive-lg font-bold text-gray-900 truncate">
              Super Study
            </span>
          </button>
          <button
            onClick={toggleMobileMenu}
            className="btn-touch p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 touch-manipulation"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
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
            lg:relative lg:block lg:w-64 xl:w-72 lg:flex-shrink-0
            ${
              isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          <div className="h-full lg:h-auto">
            <Sidebar
              activeView={activeView}
              onViewChange={handleViewChange}
              onLogout={handleLogout}
              isMobile={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
          <div className="flex-1 overflow-hidden scroll-area">
            <div className="h-full">{renderActiveView()}</div>
          </div>
        </div>

        {/* File Preview Modal */}
        {/* Removed FilePreview usage since previewFile and setPreviewFile are removed */}
      </div>
    </ErrorBoundary>
  );
}

export default App;
