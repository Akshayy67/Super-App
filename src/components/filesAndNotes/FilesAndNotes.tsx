import React from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { FolderOpen, StickyNote } from "lucide-react";

export const FilesAndNotes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (pathname: string): string => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2 && segments[0] === "files-notes") {
      return segments[1]; // Get the subroute after /files-notes/
    }
    return "files";
  };

  const activeTab = getActiveTab(location.pathname);

  const tabs = [
    {
      id: "files",
      label: "Files",
      icon: FolderOpen,
      path: "/files-notes/files",
    },
    {
      id: "notes",
      label: "Short Notes",
      icon: StickyNote,
      path: "/files-notes/notes",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col scroll-area transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-responsive">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
              Files and Short Notes
            </h1>
            <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mt-1">
              Your files and short notes
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-mobile mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`tab-mobile btn-touch flex items-center gap-2 ${
                  isActive ? "active" : ""
                } ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-responsive-sm font-medium truncate">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scroll-area container-safe py-responsive">
        <Outlet />
      </div>
    </div>
  );
};

