import React, { useState } from "react";
import {
  Briefcase,
  BookOpen,
  Target,
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
  action: () => void;
}

export const InterviewPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const prepCards: PrepCard[] = [
    {
      id: "tips",
      title: "Interview Tips",
      description: "Essential advice for successful interviews",
      icon: Lightbulb,
      action: () => setActiveTab("tips"),
    },
    {
      id: "questions",
      title: "Question Bank",
      description: "Practice common interview questions",
      icon: BookOpen,
      action: () => setActiveTab("questions"),
    },
    {
      id: "mock",
      title: "Mock Interviews",
      description: "Simulate real interview experiences",
      icon: Video,
      action: () => setActiveTab("mock"),
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Simplified Welcome Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Interview Preparation
        </h2>
        <p className="text-gray-600 text-sm">
          Prepare for your next interview with our comprehensive tools
        </p>
      </div>

      {/* Simplified Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prepCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.action}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center mb-3">
                <div className="p-2 bg-gray-100 rounded">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Simplified Quick Tip */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1 text-sm">Quick Tip</h3>
            <p className="text-sm text-gray-700">
              Research the company beforehand. Understanding their values and culture 
              helps you tailor your responses effectively.
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
    { id: "tips" as TabType, label: "Tips", icon: Lightbulb },
    { id: "questions" as TabType, label: "Questions", icon: BookOpen },
    { id: "mock" as TabType, label: "Mock", icon: Video },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Simplified Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Interview Preparation
        </h1>
        <p className="text-sm text-gray-600">
          Master your interview skills with comprehensive preparation tools
        </p>

        {/* Simplified Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{renderContent()}</div>
    </div>
  );
};
