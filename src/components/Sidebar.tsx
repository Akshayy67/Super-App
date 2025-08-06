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
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "tools", label: "Study Tools", icon: Brain },
  ];

  return (
    <div className="bg-white h-full shadow-lg border-r border-gray-200 flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
          <button
            onClick={() => onViewChange("dashboard")}
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
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Desktop Header */}
      <div
        className={`p-6 border-b border-gray-200 ${
          isMobile ? "hidden lg:block" : ""
        }`}
      >
        <button
          onClick={() => onViewChange("dashboard")}
          className="text-left hover:opacity-80 transition-opacity w-full"
        >
          <div className="flex items-center space-x-3 mb-2">
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900">Super Study</h1>
          </div>
          <p className="text-sm text-gray-600 ml-13">AI Academic Assistant</p>
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-blue-600" />
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
          className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
