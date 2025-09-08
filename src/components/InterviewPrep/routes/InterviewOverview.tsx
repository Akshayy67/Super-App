import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  BookOpen,
  Target,
  ChevronRight,
  Star,
  Video,
  Lightbulb,
  Code,
  ExternalLink,
} from "lucide-react";

interface PrepCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
}

export const InterviewOverview: React.FC = () => {
  const navigate = useNavigate();

  const prepCards: PrepCard[] = [
    {
      id: "practice",
      title: "Practice Sessions",
      description:
        "Interactive practice sessions with real-time feedback and performance tracking",
      icon: Target,
      color: "green",
      path: "/interview/practice",
    },
    {
      id: "questions",
      title: "Question Bank",
      description:
        "Comprehensive collection of interview questions across various categories and difficulty levels",
      icon: BookOpen,
      color: "blue",
      path: "/interview/question-bank",
    },
    {
      id: "code",
      title: "Code Solutions",
      description:
        "Working code solutions in Python, TypeScript, and Java with complexity analysis",
      icon: Code,
      color: "purple",
      path: "/interview/view-code",
    },
    {
      id: "references",
      title: "References & Resources",
      description:
        "Curated collection of study materials, documentation, and external resources",
      icon: ExternalLink,
      color: "orange",
      path: "/interview/references",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50",
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50",
      green:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50",
      orange:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50",
    };
    return (
      colorMap[color as keyof typeof colorMap] ||
      "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
    );
  };

  return (
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
                <span className="text-xs sm:text-sm">
                  Prepare for your next interview
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0">
            <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {prepCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group touch-manipulation"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-2 sm:p-3 rounded-lg ${getColorClasses(
                    card.color
                  )} transition-colors`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors flex-shrink-0" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Tips Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-3">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">
              Pro Tip
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Always research the company before your interview. Understanding
              their values, recent news, and culture shows genuine interest and
              helps you tailor your responses.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              500+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Questions
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              15
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Categories
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              3
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Languages
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              100+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Code Solutions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
