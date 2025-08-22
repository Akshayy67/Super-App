import React, { useState } from "react";
import {
  Briefcase,
  BookOpen,
  Target,
  ChevronRight,
  Star,
  Video,
  Lightbulb,
} from "lucide-react";
import { InterviewTips } from "./InterviewTips";
import { QuestionBank } from "./QuestionBank";
import { MockInterview } from "./MockInterview";

type TabType = "overview" | "tips" | "questions" | "mock";

interface PrepCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
}

export const InterviewPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const prepCards: PrepCard[] = [
    {
      id: "tips",
      title: "Interview Tips",
      description:
        "Master the art of interviewing with expert advice on dressing, attitude, body language, and more",
      icon: Lightbulb,
      color: "purple",
      action: () => setActiveTab("tips"),
    },
    {
      id: "questions",
      title: "Question Bank",
      description:
        "Practice with our comprehensive collection of interview questions across various categories",
      icon: BookOpen,
      color: "blue",
      action: () => setActiveTab("questions"),
    },
    {
      id: "mock",
      title: "Mock Interviews",
      description:
        "Simulate real interview experiences with AI-powered mock sessions and instant feedback",
      icon: Video,
      color: "green",
      action: () => setActiveTab("mock"),
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Welcome to Interview Prep Hub
            </h2>
            <p className="text-blue-100 mb-4 text-sm sm:text-base">
              Your comprehensive platform for mastering job interviews
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Prepare for your next interview</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0">
            <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {prepCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
            blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
            green: "bg-green-100 text-green-600 hover:bg-green-200",
            orange: "bg-orange-100 text-orange-600 hover:bg-orange-200",
          };

          return (
            <div
              key={card.id}
              onClick={card.action}
              className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group touch-manipulation"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-2 sm:p-3 rounded-lg ${
                    colorClasses[card.color as keyof typeof colorClasses]
                  } transition-colors`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Tips Section */}
      <div className="bg-yellow-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Pro Tip</h3>
            <p className="text-xs sm:text-sm text-gray-700">
              Always research the company before your interview. Understanding
              their values, recent news, and culture shows genuine interest and
              helps you tailor your responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "tips":
        return <InterviewTips />;
      case "questions":
        return <QuestionBank />;
      case "mock":
        return <MockInterview />;
      default:
        return renderOverview();
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Briefcase },
    { id: "tips" as TabType, label: "Interview Tips", icon: Lightbulb },
    { id: "questions" as TabType, label: "Question Bank", icon: BookOpen },
    { id: "mock" as TabType, label: "Mock Interview", icon: Video },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 scroll-area">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-responsive">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-responsive-xl font-bold text-gray-900">
              Interview Preparation
            </h1>
            <p className="text-responsive-sm text-gray-600 mt-1">
              Master your interview skills with comprehensive preparation tools
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-touch flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap touch-manipulation ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scroll-area container-safe py-responsive">{renderContent()}</div>
    </div>
  );
};
