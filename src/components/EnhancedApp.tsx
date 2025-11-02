import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  Brain,
  BarChart3,
  MessageSquare,
  Video,
  Settings,
  Menu,
  X,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react";
import { EnhancedAIChat } from "./ai/EnhancedAIChat";
import { EnhancedMockInterview } from "./EnhancedMockInterview";
import { PerformanceDashboard } from "./dashboards/PerformanceDashboard";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";
import { AuthForm } from "./auth/AuthForm";
import { realTimeAuth } from "../utils/realTimeAuth";
import { ThemeProvider } from "./ui/ThemeProvider";
import { ThemeToggle } from "./ui/ThemeToggle";
import { AuthWrapper } from "./auth/AuthWrapper";
import { useTodoReminders } from "../hooks/useTodoReminders";

interface User {
  id: string;
  email: string;
  name: string;
}

type ViewType = "chat" | "interview" | "dashboard" | "settings";

export const EnhancedApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [latestPerformance, setLatestPerformance] =
    useState<InterviewPerformanceData | null>(null);

  // Interview configuration
  const [interviewConfig, setInterviewConfig] = useState({
    role: "Software Engineer",
    difficulty: "medium" as "easy" | "medium" | "hard",
    interviewType: "mixed" as "technical" | "behavioral" | "mixed",
  });

  // Initialize todo reminders for authenticated user
  const { sendManualReminder } = useTodoReminders(user);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await realTimeAuth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = realTimeAuth.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await realTimeAuth.logout();
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleInterviewComplete = (results: InterviewPerformanceData) => {
    setLatestPerformance(results);
    setCurrentView("dashboard");
  };

  const navigationItems = [
    {
      id: "chat" as ViewType,
      label: "AI Assistant",
      icon: MessageSquare,
      description: "Enhanced AI chat with multimodal capabilities",
    },
    {
      id: "interview" as ViewType,
      label: "Smart Interview",
      icon: Video,
      description: "AI-powered interview with advanced analysis",
    },
    {
      id: "dashboard" as ViewType,
      label: "Performance",
      icon: BarChart3,
      description: "Detailed analytics and progress tracking",
    },
    {
      id: "settings" as ViewType,
      label: "Settings",
      icon: Settings,
      description: "Configure your interview preferences",
    },
  ];

  if (isLoading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Loading Enhanced AI Interview System...
            </p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  if (!user) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <AuthForm onAuthSuccess={(user) => setUser(user)} />
        </div>
      </AuthWrapper>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div
          className={`${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-gray-900">
                  AI Interview Pro
                </h1>
                <p className="text-xs font-body text-gray-500">
                  Enhanced Analysis Suite
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-heading font-medium">{item.label}</div>
                    <div className="text-xs font-body text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Performance Summary */}
          {latestPerformance && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Latest Score
              </h3>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold text-gray-900">
                  {latestPerformance.overallScore}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>View detailed analysis</span>
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>

                <div>
                  <h2 className="text-xl font-heading font-semibold text-gray-900">
                    {
                      navigationItems.find((item) => item.id === currentView)
                        ?.label
                    }
                  </h2>
                  <p className="text-sm font-body text-gray-500">
                    {
                      navigationItems.find((item) => item.id === currentView)
                        ?.description
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                {latestPerformance && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Score: {latestPerformance.overallScore}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            {currentView === "chat" && (
              <div className="h-full p-6">
                <EnhancedAIChat />
              </div>
            )}

            {currentView === "interview" && (
              <div className="p-6">
                <EnhancedMockInterview
                  role={interviewConfig.role}
                  difficulty={interviewConfig.difficulty}
                  interviewType={interviewConfig.interviewType}
                  onComplete={handleInterviewComplete}
                />
              </div>
            )}

            {currentView === "dashboard" && (
              <div className="p-6">
                <PerformanceDashboard
                  currentPerformance={latestPerformance || undefined}
                />
              </div>
            )}

            {currentView === "settings" && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Interview Configuration
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Role
                        </label>
                        <input
                          type="text"
                          value={interviewConfig.role}
                          onChange={(e) =>
                            setInterviewConfig((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Software Engineer, Product Manager"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <select
                          value={interviewConfig.difficulty}
                          onChange={(e) =>
                            setInterviewConfig((prev) => ({
                              ...prev,
                              difficulty: e.target.value as
                                | "easy"
                                | "medium"
                                | "hard",
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interview Type
                        </label>
                        <select
                          value={interviewConfig.interviewType}
                          onChange={(e) =>
                            setInterviewConfig((prev) => ({
                              ...prev,
                              interviewType: e.target.value as
                                | "technical"
                                | "behavioral"
                                | "mixed",
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="technical">Technical Only</option>
                          <option value="behavioral">Behavioral Only</option>
                          <option value="mixed">Mixed (Recommended)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Enhanced Features Enabled:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                          ✓ Real-time speech analysis with filler word detection
                        </li>
                        <li>✓ Computer vision body language assessment</li>
                        <li>
                          ✓ Intelligent question generation and adaptation
                        </li>
                        <li>✓ Advanced performance analytics and comparison</li>
                        <li>✓ Multimodal AI chat with image support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
