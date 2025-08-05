import React from "react";
import {
  FolderOpen,
  CheckSquare,
  StickyNote,
  MessageSquare,
  Brain,
  User,
  LogOut,
} from "lucide-react";
import { realTimeAuth } from "../utils/realTimeAuth";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onLogout,
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
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Super Study</h1>
        <p className="text-sm text-gray-600 mt-1">AI Academic Assistant</p>
      </div>

      <nav className="flex-1 px-4 py-6">
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
                  <Icon className="w-5 h-5 mr-3" />
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
