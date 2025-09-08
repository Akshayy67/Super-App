import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Clock, Target, Trophy, BarChart3, Settings } from "lucide-react";

interface PracticeSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  questionsCount: number;
}

export const InterviewPractice: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const practiceSessions: PracticeSession[] = [
    {
      id: "behavioral-basics",
      title: "Behavioral Interview Basics",
      description: "Practice common behavioral questions using the STAR method",
      duration: 30,
      difficulty: "easy",
      category: "behavioral",
      questionsCount: 10,
    },
    {
      id: "technical-algorithms",
      title: "Algorithm Problem Solving",
      description: "Solve coding problems with step-by-step guidance",
      duration: 45,
      difficulty: "medium",
      category: "technical",
      questionsCount: 8,
    },
    {
      id: "system-design-fundamentals",
      title: "System Design Fundamentals",
      description: "Learn to design scalable systems from scratch",
      duration: 60,
      difficulty: "hard",
      category: "system-design",
      questionsCount: 5,
    },
    {
      id: "frontend-deep-dive",
      title: "Frontend Development Deep Dive",
      description: "Advanced frontend concepts and best practices",
      duration: 40,
      difficulty: "medium",
      category: "frontend",
      questionsCount: 12,
    },
  ];

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "behavioral", label: "Behavioral" },
    { id: "technical", label: "Technical" },
    { id: "system-design", label: "System Design" },
    { id: "frontend", label: "Frontend" },
  ];

  const difficulties = [
    { id: "all", label: "All Levels" },
    { id: "easy", label: "Easy" },
    { id: "medium", label: "Medium" },
    { id: "hard", label: "Hard" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const filteredSessions = practiceSessions.filter((session) => {
    const matchesCategory =
      selectedCategory === "all" || session.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || session.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const startPracticeSession = (sessionId: string) => {
    console.log("Starting practice session:", sessionId);
    // Navigate to question bank with the selected category filter
    const session = practiceSessions.find((s) => s.id === sessionId);
    if (session) {
      // Navigate to question bank with category filter
      navigate(
        `/interview/question-bank?category=${session.category}&difficulty=${session.difficulty}`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Practice Sessions</h2>
            <p className="text-green-100 mb-4">
              Improve your interview skills with guided practice sessions
            </p>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">
                Choose a session to begin practicing
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <Play className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Practice Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {session.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {session.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(
                  session.difficulty
                )}`}
              >
                {session.difficulty}
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{session.duration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{session.questionsCount} questions</span>
              </div>
            </div>

            <button
              onClick={() => startPracticeSession(session.id)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Play className="w-4 h-4" />
              <span>Start Practice</span>
            </button>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Your Progress
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sessions Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Questions Answered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Success Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Time Practiced
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
