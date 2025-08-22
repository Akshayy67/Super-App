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
    { id: "interview", label: "Interview Prep", icon: Briefcase },
  ];

  return (
    <div className="bg-white h-full border-r border-gray-200 flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
          <button
            onClick={() => onViewChange("dashboard")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                console.error("Sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-lg font-semibold text-gray-900">
              Super Study
            </span>
          </button>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Desktop Header */}
      <div className={`p-4 border-b border-gray-200 ${isMobile ? "hidden lg:block" : ""}`}>
        <button
          onClick={() => onViewChange("dashboard")}
          className="text-left hover:opacity-80 transition-opacity w-full"
        >
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                console.error("Desktop sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <h1 className="text-lg font-semibold text-gray-900">Super Study</h1>
          </div>
          <p className="text-xs text-gray-600 ml-11">AI Academic Assistant</p>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="bg-gray-100 w-8 h-8 rounded flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-gray-600" />
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
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
