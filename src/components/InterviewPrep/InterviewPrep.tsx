import React, { useState } from "react";
import {
  Briefcase,
  BookOpen,
  Users,
  Award,
  Target,
  ChevronRight,
  Star,
  TrendingUp,
  Video,
  Lightbulb,
  Calendar,
  Clock,
  CheckCircle2,
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
  stats?: {
    label: string;
    value: string | number;
  };
  action: () => void;
}

export const InterviewPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userProgress, setUserProgress] = useState({
    questionsAnswered: 45,
    mockInterviews: 3,
    tipsViewed: 12,
    preparationScore: 78,
  });

  const prepCards: PrepCard[] = [
    {
      id: "tips",
      title: "Interview Tips",
      description: "Master the art of interviewing with expert advice on dressing, attitude, body language, and more",
      icon: Lightbulb,
      color: "purple",
      stats: {
        label: "Tips Viewed",
        value: `${userProgress.tipsViewed}/25`,
      },
      action: () => setActiveTab("tips"),
    },
    {
      id: "questions",
      title: "Question Bank",
      description: "Practice with our comprehensive collection of interview questions across various categories",
      icon: BookOpen,
      color: "blue",
      stats: {
        label: "Questions Practiced",
        value: userProgress.questionsAnswered,
      },
      action: () => setActiveTab("questions"),
    },
    {
      id: "mock",
      title: "Mock Interviews",
      description: "Simulate real interview experiences with AI-powered mock sessions and instant feedback",
      icon: Video,
      color: "green",
      stats: {
        label: "Sessions Completed",
        value: userProgress.mockInterviews,
      },
      action: () => setActiveTab("mock"),
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Interview Prep Hub</h2>
            <p className="text-blue-100 mb-4">
              Your comprehensive platform for mastering job interviews
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span className="text-sm">
                  Preparation Score: <strong>{userProgress.preparationScore}%</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Keep practicing to improve!</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Briefcase className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {userProgress.questionsAnswered}
            </span>
          </div>
          <p className="text-sm text-gray-600">Questions Practiced</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Video className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {userProgress.mockInterviews}
            </span>
          </div>
          <p className="text-sm text-gray-600">Mock Interviews</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {userProgress.tipsViewed}
            </span>
          </div>
          <p className="text-sm text-gray-600">Tips Reviewed</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">
              {userProgress.preparationScore}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Ready Score</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    colorClasses[card.color as keyof typeof colorClasses]
                  } transition-colors`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{card.description}</p>
              {card.stats && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{card.stats.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {card.stats.value}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Tips Section */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pro Tip of the Day</h3>
            <p className="text-sm text-gray-700">
              Always research the company before your interview. Understanding their values,
              recent news, and culture shows genuine interest and helps you tailor your responses.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Schedule New
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Software Engineer - TechCorp</p>
                <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
              </div>
            </div>
            <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
              Prepare
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Product Manager - StartupXYZ</p>
                <p className="text-xs text-gray-500">Next Week, Monday 10:00 AM</p>
              </div>
            </div>
            <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
              Prepare
            </button>
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Preparation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Master your interview skills with comprehensive preparation tools
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">1,000+ users prepared</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
    </div>
  );
};
