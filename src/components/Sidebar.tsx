import React from "react";
import {
  FolderOpen,
  CheckSquare,
  StickyNote,
  MessageSquare,
  Brain,
  User,
  LogOut,
  X,
  BookOpen,
  Briefcase,
  Users,
  Edit3,
  Zap,
} from "lucide-react";
import { realTimeAuth } from "../utils/realTimeAuth";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onLogout,
  isMobile = false,
  onCloseMobile,
}) => {
  const user = realTimeAuth.getCurrentUser();

  const menuItems = [
    { id: "files", label: "File Manager", icon: FolderOpen },
    { id: "tasks", label: "To-Do List", icon: CheckSquare },
    { id: "notes", label: "Short Notes", icon: StickyNote },
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "tools", label: "Study Tools", icon: Brain },
    { id: "flashcards", label: "Flash Cards", icon: BookOpen },
    { id: "spaced-repetition", label: "Smart Review", icon: Zap },
    { id: "interview", label: "Interview Prep", icon: Briefcase },
    { id: "collaborate", label: "Collaborate", icon: Edit3 },
    { id: "team", label: "Team Space", icon: Users },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 h-full shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
          <button
            onClick={() => onViewChange("dashboard")}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity min-w-0 flex-1 btn-touch"
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
              onError={(e) => {
                console.error("Sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-responsive-lg font-bold text-gray-900 truncate">
              Super Study
            </span>
          </button>
          <button
            onClick={onCloseMobile}
            className="btn-touch p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Desktop Header */}
      <div
        className={`p-4 sm:p-6 border-b border-gray-200 ${
          isMobile ? "hidden lg:block" : ""
        }`}
      >
        <button
          onClick={() => onViewChange("dashboard")}
          className="text-left hover:opacity-80 transition-opacity w-full btn-touch"
        >
          <div className="flex items-center space-x-3 mb-2">
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              onError={(e) => {
                console.error("Desktop sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Super Study</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 ml-11 sm:ml-13 truncate">AI Academic Assistant</p>
        </button>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto scroll-area">
        <ul className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-3 sm:px-4 py-3 sm:py-3 text-left rounded-lg transition-all btn-touch touch-manipulation ${
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="bg-blue-100 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors btn-touch touch-manipulation"
        >
          <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
