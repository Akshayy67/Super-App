import React, { useState, useEffect } from "react";
import { AuthForm } from "./components/AuthForm";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { FileManager } from "./components/FileManager";
import { TaskManager } from "./components/TaskManager";
import { NotesManager } from "./components/NotesManager";
import { AIChat } from "./components/AIChat";
import { StudyTools } from "./components/StudyTools";
import { FilePreview } from "./components/FilePreview";
import ErrorBoundary from "./components/ErrorBoundary";
import { realTimeAuth } from "./utils/realTimeAuth";
import { FileItem, User } from "./types";
import { Menu, X } from "lucide-react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Set up real-time auth state listener
    const unsubscribe = realTimeAuth.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
    });

    // Clean up listener on component unmount
    return unsubscribe;
  }, []);

  const handleAuthSuccess = () => {
    setActiveView("dashboard");
  };

  const handleLogout = async () => {
    await realTimeAuth.logout();
    // setActiveView("dashboard");
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false); // Close mobile menu when view changes
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onViewChange={handleViewChange} />;
      case "files":
        return <FileManager onPreviewFile={handlePreviewFile} />;
      case "tasks":
        return <TaskManager />;
      case "notes":
        return <NotesManager />;
      case "chat":
        return <AIChat />;
      case "tools":
        return <StudyTools />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50 flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => handleViewChange("dashboard")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Super Study</span>
          </button>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Sidebar - Desktop & Mobile Overlay */}
        <div
          className={`
          ${isMobileMenuOpen ? "fixed inset-0 z-50" : "hidden"}
          lg:relative lg:block lg:w-64 lg:flex-shrink-0
        `}
        >
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar Content */}
          <div
            className={`
            ${isMobileMenuOpen ? "absolute left-0 top-0 w-64" : "w-full"}
            h-full lg:h-auto
          `}
          >
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
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden">{renderActiveView()}</div>
        </div>

        {/* File Preview Modal */}
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
