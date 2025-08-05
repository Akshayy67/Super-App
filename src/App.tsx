import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FileManager } from './components/FileManager';
import { TaskManager } from './components/TaskManager';
import { NotesManager } from './components/NotesManager';
import { AIChat } from './components/AIChat';
import { StudyTools } from './components/StudyTools';
import { FilePreview } from './components/FilePreview';
import { authUtils } from './utils/auth';
import { FileItem } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    authUtils.logout();
    setIsAuthenticated(false);
    setActiveView('dashboard');
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'files':
        return <FileManager onPreviewFile={handlePreviewFile} />;
      case 'tasks':
        return <TaskManager />;
      case 'notes':
        return <NotesManager />;
      case 'chat':
        return <AIChat />;
      case 'tools':
        return <StudyTools />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
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
      <FilePreview
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

export default App;