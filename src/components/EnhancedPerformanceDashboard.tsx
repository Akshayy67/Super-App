import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Download,
  Share2,
  Settings,
  Moon,
  Sun,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PerformanceAnalytics,
  InterviewPerformanceData,
} from "../utils/performanceAnalytics";
import { VisualAnalyticsDashboard } from "./VisualAnalyticsDashboard";
import { EnhancedScoringSystem } from "./EnhancedScoringSystem";
import { AIImprovementFeatures } from "./AIImprovementFeatures";
import { AdvancedFeedbackSystem } from "./AdvancedFeedbackSystem";
import {
  EmbeddablePerformanceWidget,
  WidgetConfigurator,
} from "./EmbeddablePerformanceWidget";
import { exportPerformanceReport, PDFExportOptions } from "../utils/pdfExport";

interface EnhancedPerformanceDashboardProps {
  currentPerformance?: InterviewPerformanceData;
  onExportData?: () => void;
  onImportData?: (data: string) => void;
  onScheduleFollowUp?: (weakAreas: string[]) => void;
}

export const EnhancedPerformanceDashboard: React.FC<
  EnhancedPerformanceDashboardProps
> = ({
  currentPerformance,
  onExportData,
  onImportData,
  onScheduleFollowUp,
}) => {
  const [performanceAnalytics] = useState(() => new PerformanceAnalytics());
  const [performanceHistory, setPerformanceHistory] = useState<
    InterviewPerformanceData[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<
    "analytics" | "scoring" | "improvement" | "feedback" | "sharing"
  >("analytics");
  const [isExporting, setIsExporting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    loadPerformanceData();
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const loadPerformanceData = () => {
    const history = performanceAnalytics.getPerformanceHistory();
    setPerformanceHistory(history);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleExportPDF = async () => {
    if (!currentPerformance) return;

    setIsExporting(true);
    try {
      const options: PDFExportOptions = {
        includeCharts: true,
        includeRoadmap: true,
        includeDetailedScores: true,
        includeRecommendations: true,
        format: "A4",
        orientation: "portrait",
      };

      await exportPerformanceReport(currentPerformance, options);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateScoreData = () => {
    if (!currentPerformance) return [];

    const performanceHistory = performanceAnalytics.getPerformanceHistory();
    const calculatePercentile = (
      score: number,
      category: "overall" | "technical" | "communication" | "behavioral"
    ) => {
      if (performanceHistory.length < 2) return null;

      const scores = performanceHistory.map((p) => {
        switch (category) {
          case "overall":
            return p.overallScore;
          case "technical":
            return p.technicalScore;
          case "communication":
            return p.communicationScore;
          case "behavioral":
            return p.behavioralScore;
          default:
            return p.overallScore;
        }
      });

      const lowerScores = scores.filter((s) => s < score).length;
      return Math.round((lowerScores / scores.length) * 100);
    };

    const calculateTrend = (
      category: "overall" | "technical" | "communication" | "behavioral"
    ) => {
      if (performanceHistory.length < 2)
        return { trend: "stable" as const, value: 0 };

      const recent = performanceHistory.slice(-2);
      const current = recent[1];
      const previous = recent[0];

      let currentScore, previousScore;
      switch (category) {
        case "overall":
          currentScore = current.overallScore;
          previousScore = previous.overallScore;
          break;
        case "technical":
          currentScore = current.technicalScore;
          previousScore = previous.technicalScore;
          break;
        case "communication":
          currentScore = current.communicationScore;
          previousScore = previous.communicationScore;
          break;
        case "behavioral":
          currentScore = current.behavioralScore;
          previousScore = previous.behavioralScore;
          break;
      }

      const difference = currentScore - previousScore;
      const trend = difference > 2 ? "up" : difference < -2 ? "down" : "stable";
      return { trend: trend as const, value: Math.abs(difference) };
    };

    return [
      {
        value: currentPerformance.overallScore,
        maxValue: 100,
        label: "Overall Performance",
        category: "overall",
        percentile: calculatePercentile(
          currentPerformance.overallScore,
          "overall"
        ),
        ...calculateTrend("overall"),
        subScores: {
          consistency: currentPerformance.detailedMetrics.adaptability,
          engagement: currentPerformance.detailedMetrics.engagement,
          professionalism: currentPerformance.detailedMetrics.professionalism,
        },
      },
      {
        value: currentPerformance.technicalScore,
        maxValue: 100,
        label: "Technical Skills",
        category: "technical",
        percentile: calculatePercentile(
          currentPerformance.technicalScore,
          "technical"
        ),
        ...calculateTrend("technical"),
        subScores: {
          problemSolving: Math.round(currentPerformance.technicalScore * 0.9),
          codeQuality: Math.round(currentPerformance.technicalScore * 1.1),
          explanation: Math.round(currentPerformance.technicalScore * 0.95),
        },
      },
      {
        value: currentPerformance.communicationScore,
        maxValue: 100,
        label: "Communication",
        category: "communication",
        percentile: calculatePercentile(
          currentPerformance.communicationScore,
          "communication"
        ),
        ...calculateTrend("communication"),
        subScores: {
          clarity: currentPerformance.detailedMetrics.clarity,
          confidence: currentPerformance.detailedMetrics.confidence,
          articulation: Math.round(
            currentPerformance.communicationScore * 0.95
          ),
        },
      },
      {
        value: currentPerformance.behavioralScore,
        maxValue: 100,
        label: "Behavioral Skills",
        category: "behavioral",
        percentile: calculatePercentile(
          currentPerformance.behavioralScore,
          "behavioral"
        ),
        ...calculateTrend("behavioral"),
        subScores: {
          leadership: Math.round(currentPerformance.behavioralScore * 0.95),
          teamwork: Math.round(currentPerformance.behavioralScore * 1.05),
          adaptability: currentPerformance.detailedMetrics.adaptability,
        },
      },
    ];
  };

  const navigationItems = [
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Interactive charts and trends",
    },
    {
      id: "scoring",
      label: "Scoring",
      icon: Award,
      description: "Enhanced visual scoring system",
    },
    {
      id: "improvement",
      label: "Improvement",
      icon: Target,
      description: "AI-powered roadmaps",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: TrendingUp,
      description: "Advanced feedback system",
    },
    {
      id: "sharing",
      label: "Sharing",
      icon: Share2,
      description: "Export and embed widgets",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-50 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Performance Dashboard</h1>
              <span
                className={`ml-3 px-2 py-1 text-xs rounded-full ${
                  isDarkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                Enhanced
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Export Button */}
              <button
                onClick={handleExportPDF}
                disabled={!currentPerformance || isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export PDF
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className={`mb-6 ${showMobileMenu ? "block" : "hidden md:block"}`}>
          <div className="flex flex-col md:flex-row gap-2 md:gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as any);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 md:py-2 rounded-lg font-medium transition-colors text-left ${
                  activeView === item.id
                    ? "bg-blue-600 text-white"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div
                    className={`text-xs opacity-75 md:hidden ${
                      activeView === item.id
                        ? "text-blue-100"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300">
          {activeView === "analytics" && (
            <VisualAnalyticsDashboard
              currentPerformance={currentPerformance}
              onExportData={onExportData}
              onImportData={onImportData}
              onScheduleFollowUp={onScheduleFollowUp}
            />
          )}

          {activeView === "scoring" && currentPerformance && (
            <EnhancedScoringSystem
              scores={generateScoreData()}
              isDarkMode={isDarkMode}
              showPercentiles={true}
              showTrends={true}
              showSubScores={true}
            />
          )}

          {activeView === "improvement" && currentPerformance && (
            <AIImprovementFeatures
              performanceData={currentPerformance}
              isDarkMode={isDarkMode}
              onScheduleFollowUp={onScheduleFollowUp}
            />
          )}

          {activeView === "feedback" && currentPerformance && (
            <AdvancedFeedbackSystem
              performanceData={currentPerformance}
              previousPerformances={performanceHistory.slice(-5)}
              isDarkMode={isDarkMode}
            />
          )}

          {activeView === "sharing" && currentPerformance && (
            <div className="space-y-6">
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Share Your Performance
                </h2>
                <p
                  className={`mb-6 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Create embeddable widgets to share your interview performance
                  with mentors, coaches, or potential employers.
                </p>

                <WidgetConfigurator
                  performanceData={currentPerformance}
                  onConfigChange={(config) =>
                    console.log("Widget config:", config)
                  }
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!currentPerformance && (
            <div
              className={`rounded-lg shadow-lg p-12 text-center ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <BarChart3
                className={`w-16 h-16 mx-auto mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-400"
                }`}
              />
              <h3 className="text-xl font-semibold mb-2">
                No Performance Data Yet
              </h3>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Complete your first interview to unlock the full power of our
                enhanced analytics dashboard.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Your First Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
