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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

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
    setActiveView("dashboard");
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
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
      <div className="h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar
            activeView={activeView}
            onViewChange={handleViewChange}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderActiveView()}
        </div>

        {/* File Preview Modal */}
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
