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
  Brain,
} from "lucide-react";
import { InterviewLayout } from "../layout/PageLayout";

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
    {
      id: "ats-score",
      label: "ATS Score",
      icon: Brain,
      path: "/interview/ats-score",
    },
  ];

  return (
    <InterviewLayout>
      <div className="min-h-screen flex flex-col scroll-area transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-responsive">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
                Interview Preparation
              </h1>
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mt-1">
                Master your interview skills with comprehensive preparation
                tools
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
          {children}
        </div>
      </div>
    </InterviewLayout>
  );
};
