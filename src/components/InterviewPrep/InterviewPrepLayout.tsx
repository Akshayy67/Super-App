import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  BookOpen,
  Target,
  Mic,
  Home,
  Lightbulb,
  BarChart3,
} from "lucide-react";

interface InterviewPrepLayoutProps {
  children: React.ReactNode;
}

export const InterviewPrepLayout: React.FC<InterviewPrepLayoutProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (pathname: string): string => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return segments[1]; // Get the subroute after /interview/
    }
    return "overview";
  };

  const activeTab = getActiveTab(location.pathname);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
      path: "/interview/overview",
    },
    {
      id: "practice",
      label: "Practice",
      icon: Target,
      path: "/interview/practice",
    },
    {
      id: "question-bank",
      label: "Question Bank",
      icon: BookOpen,
      path: "/interview/question-bank",
    },
    {
      id: "mock-interview",
      label: "Mock Interview",
      icon: Mic,
      path: "/interview/mock-interview",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/interview/analytics",
    },
    {
      id: "interview-tips",
      label: "Interview Tips",
      icon: Lightbulb,
      path: "/interview/interview-tips",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-900 scroll-area transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-responsive">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
              Interview Preparation
            </h1>
            <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mt-1">
              Master your interview skills with comprehensive preparation tools
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`btn-touch flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap touch-manipulation ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scroll-area container-safe py-responsive">
        {children}
      </div>
    </div>
  );
};
