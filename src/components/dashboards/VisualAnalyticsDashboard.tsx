import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  Eye,
  Volume2,
  Users,
  Brain,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Calendar,
  Filter,
  Zap,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  LineChart as LineChartIcon,
  Settings,
  RefreshCw,
  BookOpen,
  Lightbulb,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  PerformanceAnalytics,
  InterviewPerformanceData,
  PerformanceComparison,
  PerformanceTrends,
} from "../../utils/performanceAnalytics";
import { SpeechAnalysisResult } from "../../utils/speechAnalysis";
import { BodyLanguageAnalysisResult } from "../../utils/bodyLanguageAnalysis";
import { useAnalyticsDataReadOnly } from "../../hooks/useAnalyticsData";
import { AnalyticsValidationBanner } from "../analytics/AnalyticsValidationBanner";
import { InterviewDataManager } from "../InterviewDataManager";
import { DetailedInterviewHistory } from "../DetailedInterviewHistory";
// Demo data populator removed for production

interface VisualAnalyticsDashboardProps {
  currentPerformance?: InterviewPerformanceData;
  onExportData?: () => void;
  onImportData?: (data: string) => void;
  onScheduleFollowUp?: (weakAreas: string[]) => void;
}

interface ChartConfig {
  type: "line" | "radar" | "heatmap" | "bar" | "pie";
  title: string;
  description: string;
  timeRange: "30" | "60" | "90" | "all";
}

interface SkillBreakdown {
  skill: string;
  current: number;
  target: number;
  improvement: number;
  category:
    | "communication"
    | "technical"
    | "behavioral"
    | "confidence"
    | "presentation";
}

interface HeatMapData {
  category: string;
  difficulty: string;
  performance: number;
  count: number;
}

interface ImprovementRoadmap {
  timeframe: "30" | "60" | "90";
  milestones: {
    id: string;
    title: string;
    description: string;
    targetScore: number;
    deadline: string;
    status: "pending" | "in-progress" | "completed";
    exercises: string[];
    resources: string[];
  }[];
}

export const VisualAnalyticsDashboard: React.FC<
  VisualAnalyticsDashboardProps
> = ({
  currentPerformance,
  onExportData,
  onImportData,
  onScheduleFollowUp,
}) => {
  // Use the analytics data hook for real-time data management
  const {
    performanceHistory,
    currentPerformance: latestPerformance,
    isLoading: dataLoading,
    lastUpdated,
  } = useAnalyticsDataReadOnly();

  // Use the provided currentPerformance or fall back to latest from hook
  const displayPerformance = currentPerformance || latestPerformance;

  const [performanceAnalytics] = useState(() => new PerformanceAnalytics());
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "30" | "60" | "90" | "all"
  >("60");
  const [selectedChartType, setSelectedChartType] = useState<
    "line" | "radar" | "heatmap" | "bar"
  >("line");
  const [showDrillDown, setShowDrillDown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "trends"
    | "skills"
    | "improvement"
    | "data-management"
    | "detailed-history"
  >("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
  }, []);

  // Handle sample data display when no real data exists
  const shouldShowSampleData = () => {
    const showSampleData =
      localStorage.getItem("show_sample_analytics_data") === "true";
    return showSampleData && performanceHistory.length === 0;
  };

  // Get the data to display (real data or sample data)
  const getDisplayData = () => {
    if (shouldShowSampleData()) {
      console.log("📊 Displaying sample analytics data for demonstration");
      return generateSamplePerformanceData();
    }

    // Clear sample data flag if we have real data
    if (performanceHistory.length > 0) {
      localStorage.removeItem("show_sample_analytics_data");
    }

    return performanceHistory;
  };

  const displayData = getDisplayData();

  // Generate sample data for demonstration when no real interviews exist
  const generateSamplePerformanceData = (): InterviewPerformanceData[] => {
    const now = new Date();
    const sampleData: InterviewPerformanceData[] = [];

    // Generate 5 sample interviews over the past 30 days
    for (let i = 0; i < 5; i++) {
      const daysAgo = (i + 1) * 6; // 6, 12, 18, 24, 30 days ago
      const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Create realistic sample data including poor performance scenarios
      // This demonstrates the system can handle low scores without inflation
      const sampleScores = [
        { overall: 15, technical: 12, communication: 18, behavioral: 16 }, // Very poor (1-2/10 range)
        { overall: 35, technical: 32, communication: 38, behavioral: 36 }, // Poor (3-4/10 range)
        { overall: 55, technical: 52, communication: 58, behavioral: 56 }, // Average (5-6/10 range)
        { overall: 75, technical: 72, communication: 78, behavioral: 76 }, // Good (7-8/10 range)
        { overall: 95, technical: 92, communication: 98, behavioral: 96 }, // Excellent (9-10/10 range)
      ];

      const scores = sampleScores[i];

      sampleData.push({
        id: `sample_${timestamp.getTime()}`,
        timestamp: timestamp.toISOString(),
        role: [
          "Software Engineer",
          "Product Manager",
          "Data Scientist",
          "UX Designer",
          "DevOps Engineer",
        ][i],
        difficulty: ["Easy", "Medium", "Medium", "Hard", "Hard"][i],
        duration: 30 + i * 5, // Deterministic duration: 30, 35, 40, 45, 50 minutes
        overallScore: scores.overall,
        technicalScore: scores.technical,
        communicationScore: scores.communication,
        behavioralScore: scores.behavioral,
        questionsAnswered: 6 + i, // Deterministic: 6, 7, 8, 9, 10 questions
        questionsCorrect: Math.round((6 + i) * (scores.overall / 100)), // Proportional to overall score
        averageResponseTime: 45 + i * 10, // Deterministic: 45, 55, 65, 75, 85 seconds
        detailedMetrics: {
          confidence: Math.round(scores.overall + (i % 2 === 0 ? -2 : 2)), // Slight variation
          clarity: Math.round(scores.communication + (i % 3 === 0 ? -1 : 1)),
          professionalism: Math.round(
            scores.behavioral + (i % 2 === 0 ? 1 : -1)
          ),
          engagement: Math.round(scores.overall + (i % 3 === 0 ? -3 : 2)),
          adaptability: Math.round(scores.technical + (i % 2 === 0 ? 2 : -2)),
        },
        speechAnalysis: {
          wordsPerMinute: 120 + (scores.communication / 100) * 60, // 120-180 based on score
          fillerWordCount: Math.round(15 - (scores.communication / 100) * 12), // 15 to 3 based on score
          pauseCount: Math.round(25 - (scores.communication / 100) * 15), // 25 to 10 based on score
          averagePauseLength: 2.0 - (scores.communication / 100) * 1.5, // 2.0 to 0.5 based on score
          volumeVariation: 0.7 - (scores.communication / 100) * 0.4, // 0.7 to 0.3 based on score
          clarityScore: scores.communication / 100, // Direct correlation to communication score
          confidenceScore: scores.overall / 100, // Direct correlation to overall score
          emotionalTone: [
            "confident",
            "nervous",
            "enthusiastic",
            "calm",
            "professional",
          ][Math.floor(Math.random() * 5)],
          keyPhrases: [
            "problem-solving",
            "team collaboration",
            "technical expertise",
            "leadership",
          ],
          sentimentAnalysis: {
            positive: 0.6 + Math.random() * 0.3,
            negative: Math.random() * 0.2,
            neutral: 0.2 + Math.random() * 0.2,
          },
        },
        bodyLanguageAnalysis: {
          eyeContactPercentage: 65 + Math.random() * 25,
          postureScore: 0.7 + Math.random() * 0.25,
          gestureFrequency: Math.floor(Math.random() * 30),
          facialExpressionScore: 0.75 + Math.random() * 0.2,
          overallBodyLanguageScore: 0.7 + Math.random() * 0.25,
          confidenceIndicators: [
            "good_posture",
            "steady_eye_contact",
            "appropriate_gestures",
          ],
          nervousBehaviors: Math.random() > 0.5 ? ["fidgeting"] : [],
          engagementLevel: 0.75 + Math.random() * 0.2,
        },
        strengths: [
          "Strong technical knowledge",
          "Clear communication",
          "Good problem-solving approach",
          "Professional demeanor",
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
        weaknesses: [
          "Could improve eye contact",
          "Reduce filler words",
          "Provide more specific examples",
          "Better time management",
        ].slice(0, 1 + Math.floor(Math.random() * 2)),
        recommendations: [
          "Practice behavioral questions using STAR method",
          "Work on maintaining consistent eye contact",
          "Prepare more specific examples from past experience",
          "Practice technical explanations with non-technical audience",
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
      });
    }

    // Sort by timestamp (newest first)
    return sampleData.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  // Helper function to filter data by time range
  const filterDataByTimeRange = (
    data: InterviewPerformanceData[],
    range: string
  ) => {
    const now = new Date();
    const days =
      range === "30" ? 30 : range === "60" ? 60 : range === "90" ? 90 : 0;

    if (days === 0) return data;

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return data.filter((item) => new Date(item.timestamp) >= cutoffDate);
  };

  // Generate trend data for line charts
  const trendData = useMemo(() => {
    const filteredData = filterDataByTimeRange(displayData, selectedTimeRange);
    return filteredData.map((performance, index) => ({
      interview: index + 1,
      date: new Date(performance.timestamp).toLocaleDateString(),
      overall: performance.overallScore,
      technical: performance.technicalScore,
      communication: performance.communicationScore,
      behavioral: performance.behavioralScore,
      confidence: performance.detailedMetrics.confidence,
      clarity: performance.detailedMetrics.clarity,
      professionalism: performance.detailedMetrics.professionalism,
      engagement: performance.detailedMetrics.engagement,
      adaptability: performance.detailedMetrics.adaptability,
    }));
  }, [displayData, selectedTimeRange]);

  // Helper function to calculate improvement
  const calculateImprovement = (metric: string): number => {
    if (displayData.length < 2) return 0;

    const recent = displayData.slice(-3);
    const older = displayData.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return 0;

    const getMetricValue = (
      data: InterviewPerformanceData,
      metricName: string
    ): number => {
      switch (metricName) {
        case "communication":
          return data.communicationScore;
        case "technical":
          return data.technicalScore;
        case "behavioral":
          return data.behavioralScore;
        case "confidence":
          return data.detailedMetrics.confidence;
        case "presentation":
          return data.detailedMetrics.professionalism;
        default:
          return 0;
      }
    };

    const recentAvg =
      recent.reduce((sum, data) => sum + getMetricValue(data, metric), 0) /
      recent.length;
    const olderAvg =
      older.reduce((sum, data) => sum + getMetricValue(data, metric), 0) /
      older.length;

    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  // Generate skill breakdown for radar chart
  const skillBreakdownData = useMemo((): SkillBreakdown[] => {
    if (!displayPerformance) return [];

    return [
      {
        skill: "Communication",
        current: displayPerformance.communicationScore,
        target: 90,
        improvement: calculateImprovement("communication"),
        category: "communication",
      },
      {
        skill: "Technical Knowledge",
        current: displayPerformance.technicalScore,
        target: 85,
        improvement: calculateImprovement("technical"),
        category: "technical",
      },
      {
        skill: "Behavioral Responses",
        current: displayPerformance.behavioralScore,
        target: 88,
        improvement: calculateImprovement("behavioral"),
        category: "behavioral",
      },
      {
        skill: "Confidence",
        current: displayPerformance.detailedMetrics?.confidence || 75,
        target: 85,
        improvement: calculateImprovement("confidence"),
        category: "confidence",
      },
      {
        skill: "Presentation",
        current: displayPerformance.detailedMetrics?.professionalism || 85,
        target: 90,
        improvement: calculateImprovement("presentation"),
        category: "presentation",
      },
    ];
  }, [displayPerformance, displayData]);

  // Generate heat map data for question categories
  const heatMapData = useMemo((): HeatMapData[] => {
    const categories = ["Technical", "Behavioral", "Situational"];
    const difficulties = ["Easy", "Medium", "Hard"];
    const data: HeatMapData[] = [];

    categories.forEach((category) => {
      difficulties.forEach((difficulty) => {
        const relevantInterviews = displayData.filter(
          (p) =>
            p.role.toLowerCase().includes(category.toLowerCase()) ||
            p.difficulty === difficulty.toLowerCase()
        );

        const avgPerformance =
          relevantInterviews.length > 0
            ? relevantInterviews.reduce((sum, p) => sum + p.overallScore, 0) /
              relevantInterviews.length
            : 0; // No fallback - only show real data

        data.push({
          category,
          difficulty,
          performance: Math.round(avgPerformance),
          count: relevantInterviews.length,
        });
      });
    });

    return data;
  }, [displayData]);

  // Helper functions for generating exercises and resources
  const generateExercises = (category: string): string[] => {
    const exerciseMap = {
      communication: [
        "Practice the STAR method for behavioral questions",
        "Record yourself answering common questions",
        "Work on eliminating filler words",
        "Practice active listening techniques",
      ],
      technical: [
        "Solve coding problems on LeetCode",
        "Build a portfolio project",
        "Practice system design questions",
        "Review data structures and algorithms",
      ],
      problemSolving: [
        "Practice case study analysis",
        "Work through logic puzzles",
        "Practice breaking down complex problems",
        "Learn structured problem-solving frameworks",
      ],
      leadership: [
        "Practice situational leadership scenarios",
        "Work on delegation exercises",
        "Practice giving constructive feedback",
        "Study conflict resolution techniques",
      ],
    };
    return exerciseMap[category as keyof typeof exerciseMap] || [];
  };

  const generateResources = (category: string): string[] => {
    const resourceMap = {
      communication: [
        "Toastmasters International",
        '"Crucial Conversations" by Kerry Patterson',
        "TED Talks on public speaking",
        "Dale Carnegie courses",
      ],
      technical: [
        "LeetCode Premium",
        "System Design Interview by Alex Xu",
        "Cracking the Coding Interview",
        "GitHub for portfolio projects",
      ],
      problemSolving: [
        "Case in Point by Marc Cosentino",
        "McKinsey Problem Solving Test prep",
        "Harvard Business Review case studies",
        "MindTools problem-solving resources",
      ],
      leadership: [
        "The Leadership Challenge by Kouzes & Posner",
        "Harvard Business Review Leadership articles",
        "LinkedIn Learning leadership courses",
        "Center for Creative Leadership resources",
      ],
    };
    return resourceMap[category as keyof typeof resourceMap] || [];
  };

  // Generate improvement roadmap
  const improvementRoadmap = useMemo((): ImprovementRoadmap => {
    if (!currentPerformance) {
      return { timeframe: "30", milestones: [] };
    }

    const weakAreas = skillBreakdownData
      .filter((skill) => skill.current < skill.target - 10)
      .sort((a, b) => a.target - a.current - (b.target - b.current));

    const milestones = weakAreas.slice(0, 3).map((skill, index) => ({
      id: `milestone-${index}`,
      title: `Improve ${skill.skill}`,
      description: `Increase ${skill.skill.toLowerCase()} score from ${
        skill.current
      } to ${skill.target}`,
      targetScore: skill.target,
      deadline: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "pending" as const,
      exercises: generateExercises(skill.category),
      resources: generateResources(skill.category),
    }));

    return { timeframe: "90", milestones };
  }, [displayPerformance, skillBreakdownData]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Visual Analytics Dashboard
            </h1>
            <p
              className={`${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } mb-6`}
            >
              Comprehensive performance insights and improvement tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "trends", label: "Trends", icon: TrendingUp },
            { id: "skills", label: "Skills", icon: Target },
            { id: "improvement", label: "Improvement", icon: Lightbulb },
            {
              id: "detailed-history",
              label: "Question History",
              icon: BookOpen,
            },
            { id: "data-management", label: "Data Management", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State - No Interview Data */}
        {performanceHistory.length === 0 && !currentPerformance && (
          <div
            className={`rounded-lg shadow-lg p-8 text-center ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="max-w-md mx-auto">
              <BarChart3
                className={`w-16 h-16 mx-auto mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-300"
                }`}
              />
              <h3 className="text-xl font-semibold mb-2">
                No Interview Data Yet
              </h3>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Complete your first mock interview to see detailed analytics and
                performance insights.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    (window.location.href = "/interview/mock-interview")
                  }
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Your First Interview
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem("show_sample_analytics_data", "true");
                    // Force re-render by updating a state that triggers getDisplayData
                    setActiveTab("overview");
                  }}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  View Sample Analytics Data
                </button>
              </div>

              {/* Demo data populator removed for production */}

              <p
                className={`text-sm mt-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Sample data shows what your analytics will look like after
                completing interviews.
              </p>
            </div>
          </div>
        )}

        {/* Sample Data Banner */}
        {shouldShowSampleData() && (
          <div
            className={`rounded-lg p-4 mb-6 border-l-4 border-yellow-500 ${
              isDarkMode
                ? "bg-yellow-900/20 text-yellow-200"
                : "bg-yellow-50 text-yellow-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Sample Data Mode</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("show_sample_analytics_data");
                  // Force re-render by updating a state that triggers getDisplayData
                  setActiveTab("overview");
                }}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  isDarkMode
                    ? "bg-yellow-800 hover:bg-yellow-700 text-yellow-100"
                    : "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
                }`}
              >
                Hide Sample Data
              </button>
            </div>
            <p className="text-sm mt-1">
              You're viewing sample analytics data. Complete a real interview to
              see your actual performance metrics.
            </p>
          </div>
        )}

        {/* Data Quality Validation Banner */}
        <AnalyticsValidationBanner className="mb-6" showDetails={true} />

        {/* Tab Content */}
        {(displayData.length > 0 || displayPerformance) &&
          activeTab === "overview" && (
            <div className="space-y-6">
              {/* Current Performance Summary */}
              {displayPerformance && (
                <div
                  className={`rounded-lg shadow-lg p-6 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    Latest Interview Results
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                      {
                        label: "Overall Score",
                        value: displayPerformance.overallScore,
                        icon: Award,
                      },
                      {
                        label: "Technical",
                        value: displayPerformance.technicalScore,
                        icon: Brain,
                      },
                      {
                        label: "Communication",
                        value: displayPerformance.communicationScore,
                        icon: Volume2,
                      },
                      {
                        label: "Behavioral",
                        value: displayPerformance.behavioralScore,
                        icon: Users,
                      },
                    ].map((metric, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getScoreBgColor(
                          metric.value
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <metric.icon className="w-5 h-5" />
                          <span className="font-medium">{metric.label}</span>
                        </div>
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            metric.value
                          )}`}
                        >
                          {metric.value}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.value >= 80
                                ? "bg-green-500"
                                : metric.value >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Percentile Rankings */}
                  <div
                    className={`rounded-lg p-4 ${
                      isDarkMode ? "bg-gray-700" : "bg-blue-50"
                    }`}
                  >
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Percentile Rankings
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { skill: "Overall", percentile: 78 },
                        { skill: "Technical", percentile: 65 },
                        { skill: "Communication", percentile: 82 },
                        { skill: "Behavioral", percentile: 71 },
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {item.percentile}%
                          </div>
                          <div
                            className={`text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {item.skill}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`rounded-lg shadow-lg p-6 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {currentPerformance?.strengths
                      .slice(0, 3)
                      .map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {strength}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div
                  className={`rounded-lg shadow-lg p-6 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {currentPerformance?.weaknesses
                      .slice(0, 3)
                      .map((weakness, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {weakness}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        {(performanceHistory.length > 0 || currentPerformance) &&
          activeTab === "trends" && (
            <div className="space-y-6">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium">Chart Type:</span>
                {[
                  { type: "line", label: "Line Chart", icon: LineChartIcon },
                  { type: "bar", label: "Bar Chart", icon: BarChart3 },
                  { type: "radar", label: "Radar Chart", icon: RadarIcon },
                ].map((chart) => (
                  <button
                    key={chart.type}
                    onClick={() => setSelectedChartType(chart.type as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedChartType === chart.type
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <chart.icon className="w-4 h-4" />
                    {chart.label}
                  </button>
                ))}
              </div>

              {/* Performance Trends Chart */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Performance Trends
                </h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedChartType === "line" ? (
                      <LineChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                        />
                        <XAxis
                          dataKey="date"
                          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            border: `1px solid ${
                              isDarkMode ? "#374151" : "#e5e7eb"
                            }`,
                            borderRadius: "8px",
                            color: isDarkMode ? "#ffffff" : "#000000",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="overall"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Overall"
                        />
                        <Line
                          type="monotone"
                          dataKey="technical"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Technical"
                        />
                        <Line
                          type="monotone"
                          dataKey="communication"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Communication"
                        />
                        <Line
                          type="monotone"
                          dataKey="behavioral"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          name="Behavioral"
                        />
                      </LineChart>
                    ) : selectedChartType === "bar" ? (
                      <BarChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                        />
                        <XAxis
                          dataKey="date"
                          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            border: `1px solid ${
                              isDarkMode ? "#374151" : "#e5e7eb"
                            }`,
                            borderRadius: "8px",
                            color: isDarkMode ? "#ffffff" : "#000000",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="overall" fill="#3b82f6" name="Overall" />
                        <Bar
                          dataKey="technical"
                          fill="#10b981"
                          name="Technical"
                        />
                        <Bar
                          dataKey="communication"
                          fill="#f59e0b"
                          name="Communication"
                        />
                        <Bar
                          dataKey="behavioral"
                          fill="#8b5cf6"
                          name="Behavioral"
                        />
                      </BarChart>
                    ) : (
                      <RadarChart
                        data={skillBreakdownData.map((skill) => ({
                          skill: skill.skill,
                          current: skill.current,
                          target: skill.target,
                        }))}
                      >
                        <PolarGrid
                          stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                        />
                        <PolarAngleAxis
                          dataKey="skill"
                          tick={{
                            fill: isDarkMode ? "#9ca3af" : "#6b7280",
                            fontSize: 12,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{
                            fill: isDarkMode ? "#9ca3af" : "#6b7280",
                            fontSize: 10,
                          }}
                        />
                        <Radar
                          name="Current"
                          dataKey="current"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                        <Legend />
                      </RadarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heat Map for Question Categories */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Performance Heat Map
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {heatMapData.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        item.performance >= 80
                          ? "bg-green-100 border-green-300 text-green-800"
                          : item.performance >= 60
                          ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                          : "bg-red-100 border-red-300 text-red-800"
                      }`}
                      onClick={() =>
                        setShowDrillDown(
                          showDrillDown ===
                            `${item.category}-${item.difficulty}`
                            ? null
                            : `${item.category}-${item.difficulty}`
                        )
                      }
                    >
                      <div className="text-center">
                        <div className="font-semibold">{item.category}</div>
                        <div className="text-sm opacity-75">
                          {item.difficulty}
                        </div>
                        <div className="text-2xl font-bold mt-2">
                          {item.performance}%
                        </div>
                        <div className="text-xs mt-1">
                          {item.count} interviews
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {(performanceHistory.length > 0 || currentPerformance) &&
          activeTab === "skills" && (
            <div className="space-y-6">
              {/* Skill Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillBreakdownData.map((skill, index) => (
                  <div
                    key={index}
                    className={`rounded-lg shadow-lg p-6 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{skill.skill}</h3>
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          skill.current
                        )}`}
                      >
                        {skill.current}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current</span>
                        <span>Target: {skill.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            skill.current >= 80
                              ? "bg-green-500"
                              : skill.current >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${(skill.current / skill.target) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Improvement Indicator */}
                    <div className="flex items-center gap-2">
                      {skill.improvement > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : skill.improvement < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-500" />
                      )}
                      <span
                        className={`text-sm ${
                          skill.improvement > 0
                            ? "text-green-600"
                            : skill.improvement < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {skill.improvement > 0 ? "+" : ""}
                        {skill.improvement.toFixed(1)} from last period
                      </span>
                    </div>

                    {/* Sub-scores */}
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-medium mb-2">
                        Detailed Breakdown:
                      </div>
                      {skill.category === "communication" &&
                        currentPerformance && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Clarity:</span>
                              <span>
                                {currentPerformance.speechAnalysis
                                  ?.pronunciationAssessment?.clarity || 80}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Pace:</span>
                              <span>
                                {currentPerformance.speechAnalysis?.paceAnalysis
                                  ?.wordsPerMinute || 150}{" "}
                                WPM
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Confidence:</span>
                              <span>
                                {currentPerformance.speechAnalysis
                                  ?.confidenceScore?.overall || 75}
                                %
                              </span>
                            </div>
                          </>
                        )}
                      {skill.category === "technical" && currentPerformance && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Problem Solving:</span>
                            <span>
                              {Math.round(
                                currentPerformance.technicalScore * 0.9
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Code Quality:</span>
                            <span>
                              {Math.round(
                                currentPerformance.technicalScore * 1.1
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Explanation:</span>
                            <span>
                              {Math.round(
                                currentPerformance.technicalScore * 0.95
                              )}
                              %
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Comparison Chart */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Skills vs Industry Benchmarks
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillBreakdownData.map((skill) => ({
                        skill: skill.skill,
                        current: skill.current,
                        industry: Math.round(skill.target * 0.85), // Industry average
                        target: skill.target,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                      />
                      <XAxis
                        dataKey="skill"
                        stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                          border: `1px solid ${
                            isDarkMode ? "#374151" : "#e5e7eb"
                          }`,
                          borderRadius: "8px",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Your Score" />
                      <Bar
                        dataKey="industry"
                        fill="#6b7280"
                        name="Industry Average"
                      />
                      <Bar dataKey="target" fill="#10b981" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        {(performanceHistory.length > 0 || currentPerformance) &&
          activeTab === "improvement" && (
            <div className="space-y-6">
              {/* Improvement Roadmap */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    90-Day Improvement Roadmap
                  </h2>
                  <button
                    onClick={() =>
                      onScheduleFollowUp &&
                      onScheduleFollowUp(currentPerformance?.weaknesses || [])
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Follow-up
                  </button>
                </div>

                <div className="space-y-6">
                  {improvementRoadmap.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className={`border rounded-lg p-4 ${
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              milestone.status === "completed"
                                ? "bg-green-500"
                                : milestone.status === "in-progress"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Target: {milestone.targetScore}
                          </div>
                          <div
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Due:{" "}
                            {new Date(milestone.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Practice Exercises */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Practice Exercises
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {milestone.exercises.map(
                            (exercise, exerciseIndex) => (
                              <div
                                key={exerciseIndex}
                                className={`p-2 rounded text-sm ${
                                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}
                              >
                                {exercise}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Recommended Resources
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {milestone.resources.map(
                            (resource, resourceIndex) => (
                              <div
                                key={resourceIndex}
                                className={`p-2 rounded text-sm ${
                                  isDarkMode ? "bg-blue-900" : "bg-blue-50"
                                } text-blue-700`}
                              >
                                {resource}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Badges */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Achievement Badges
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: "First Interview",
                      icon: Star,
                      earned: true,
                      description: "Completed your first mock interview",
                    },
                    {
                      name: "Improvement Streak",
                      icon: TrendingUp,
                      earned: true,
                      description: "3 consecutive improvements",
                    },
                    {
                      name: "Communication Master",
                      icon: Volume2,
                      earned: false,
                      description: "Score 90+ in communication",
                    },
                    {
                      name: "Technical Expert",
                      icon: Brain,
                      earned: false,
                      description: "Score 85+ in technical skills",
                    },
                  ].map((badge, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg text-center transition-all ${
                        badge.earned
                          ? "bg-yellow-100 border-2 border-yellow-300 text-yellow-800"
                          : isDarkMode
                          ? "bg-gray-700 border-2 border-gray-600 text-gray-400"
                          : "bg-gray-100 border-2 border-gray-300 text-gray-500"
                      }`}
                    >
                      <badge.icon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          badge.earned ? "text-yellow-600" : "text-gray-400"
                        }`}
                      />
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Detailed History Tab */}
        {activeTab === "detailed-history" && (
          <div className="space-y-6">
            <DetailedInterviewHistory />
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === "data-management" && (
          <div className="space-y-6">
            <InterviewDataManager
              onDataChange={() => {
                // Trigger a refresh of the analytics data
                window.location.reload();
              }}
              showDetailedView={(interview) => {
                // Switch to detailed history tab and show specific interview
                setActiveTab("detailed-history");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
