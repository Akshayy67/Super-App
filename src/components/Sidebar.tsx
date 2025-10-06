import React from "react";
import { useNavigate } from "react-router-dom";
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
  Info,
} from "lucide-react";
import { realTimeAuth } from "../utils/realTimeAuth";
import { useCurrentRoute } from "../hooks/useCurrentRoute";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  onLogout: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onLogout,
  isMobile = false,
  onCloseMobile,
}) => {
  const user = realTimeAuth.getCurrentUser();
  const navigate = useNavigate();
  const { activeView } = useCurrentRoute();

  const menuItems = [
    { id: "files", label: "File Manager", icon: FolderOpen, path: "/files" },
    { id: "tasks", label: "To-Do List", icon: CheckSquare, path: "/tasks" },
    { id: "notes", label: "Short Notes", icon: StickyNote, path: "/notes" },
    { id: "chat", label: "AI Assistant", icon: MessageSquare, path: "/chat" },
    { id: "tools", label: "Study Tools", icon: Brain, path: "/tools" },
    {
      id: "flashcards",
      label: "Flash Cards",
      icon: BookOpen,
      path: "/flashcards",
    },
    {
      id: "interview",
      label: "Interview Prep",
      icon: Briefcase,
      path: "/interview",
    },
    { id: "team", label: "Team Space", icon: Users, path: "/team" },
    { id: "about", label: "About Us", icon: Info, path: "/about" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full shadow-lg border-r border-gray-200 dark:border-slate-800 flex flex-col transition-colors duration-300">
      {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-header border-b border-gray-200 dark:border-slate-800 flex items-center justify-between lg:hidden">
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1 btn-touch"
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              onError={(e) => {
                console.error("Sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-responsive-base font-bold text-gray-900 dark:text-gray-100 truncate">
                Super Study
              </span>
              <span className="text-responsive-xs text-gray-600 dark:text-gray-400 truncate">
                AI Powered Learning
              </span>
            </div>
          </button>
          <button
            onClick={onCloseMobile}
            className="btn-touch p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Desktop Header */}
      <div
        className={`p-4 sm:p-6 border-b border-gray-200 dark:border-slate-800 ${
          isMobile ? "hidden lg:block" : ""
        }`}
      >
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="text-left hover:opacity-80 transition-opacity w-full btn-touch"
        >
          <div className="flex items-center space-x-3 mb-1">
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              onError={(e) => {
                console.error("Desktop sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold text-gray-900 dark:text-gray-100 truncate">
                Super Study
              </h1>
              <p className="text-xs sm:text-sm font-body text-gray-500 dark:text-gray-400 font-medium">
                AI Powered Learning
              </p>
            </div>
          </div>
        </button>

        {/* Theme Toggle for Desktop */}
        <div className="mt-4 flex justify-center">
          <ThemeToggle variant="dropdown" showLabel={true} />
        </div>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto scroll-area-mobile">
        <ul className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`btn-touch w-full flex items-center px-3 sm:px-4 py-3 text-left rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-heading font-medium text-responsive-sm truncate">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-responsive border-t border-gray-200 dark:border-slate-800">
        <div className="flex items-center mb-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-responsive-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.username || "User"}
            </p>
            <p className="text-responsive-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="btn-touch w-full flex items-center px-3 py-2 text-responsive-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
