import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Target,
  Award,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import {
  enhancedAIAnalytics,
  AIAnalysisResult,
  TrendAnalysis,
  PersonalizedInsights,
} from "../../utils/enhancedAIAnalytics";
import { VisualAnalyticsDashboard } from "../dashboards/VisualAnalyticsDashboard";
import { LoadingGlobe } from "../ui/LoadingGlobe";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { AnalyticsDataStatus } from "./AnalyticsDataStatus";
// Test and debug components removed for production

interface EnhancedAnalyticsIntegrationProps {
  currentInterview?: InterviewPerformanceData;
  onStartNewInterview?: () => void;
  onScheduleFollowUp?: (weakAreas: string[]) => void;
}

export const EnhancedAnalyticsIntegration: React.FC<
  EnhancedAnalyticsIntegrationProps
> = ({ currentInterview, onStartNewInterview, onScheduleFollowUp }) => {
  // Use centralized analytics data hook instead of local state
  const {
    performanceHistory,
    currentPerformance: latestPerformance,
    isLoading: dataLoading,
    addNewPerformance,
  } = useAnalyticsData();

  const [currentPerformance, setCurrentPerformance] = useState<
    InterviewPerformanceData | undefined
  >(currentInterview || latestPerformance);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(
    null
  );
  const [personalizedInsights, setPersonalizedInsights] =
    useState<PersonalizedInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "ai-insights"
    | "trends"
    | "recommendations"
    | "data-status"
    | "debug"
  >("overview");
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  useEffect(() => {
    if (currentInterview) {
      setCurrentPerformance(currentInterview);
      // Save the new performance data using the hook
      addNewPerformance(currentInterview);
      // Trigger AI analysis for the new interview
      performAIAnalysis(currentInterview);
    }
  }, [currentInterview, addNewPerformance]);

  // Update current performance when latest performance changes
  useEffect(() => {
    if (!currentInterview && latestPerformance) {
      setCurrentPerformance(latestPerformance);
    }
  }, [latestPerformance, currentInterview]);

  // Trigger AI analysis when switching to AI insights tab and we have performance data
  useEffect(() => {
    if (
      activeTab === "ai-insights" &&
      currentPerformance &&
      !aiAnalysis &&
      !isAnalyzing
    ) {
      console.log(
        "🎯 AI Insights tab opened, triggering analysis for:",
        currentPerformance.id
      );
      performAIAnalysis(currentPerformance);
    }
  }, [activeTab, currentPerformance, aiAnalysis, isAnalyzing]);

  // Remove duplicate data refresh - useAnalyticsData hook already handles this
  // This was causing redundant API calls and data loading loops

  // Removed loadPerformanceData - now using useAnalyticsData hook
  // This eliminates redundant data loading and prevents infinite loops

  const performAIAnalysis = async (performance: InterviewPerformanceData) => {
    if (!performance) return;

    setIsAnalyzing(true);
    try {
      console.log("🤖 Starting AI analysis for interview:", performance.id);

      // Perform comprehensive AI analysis
      const report = await enhancedAIAnalytics.generateComprehensiveReport(
        performance,
        performanceHistory
      );

      setAiAnalysis(report.analysis);
      setTrendAnalysis(report.trends);
      setPersonalizedInsights(report.insights);
      setLastAnalysisTime(new Date());

      console.log("✅ AI analysis completed successfully");
    } catch (error) {
      console.error("❌ AI analysis failed:", error);
      // Set fallback analysis
      setAiAnalysis({
        overallInsights: ["Analysis completed with basic insights"],
        strengthsAnalysis: performance.strengths || ["Good foundation"],
        weaknessesAnalysis: performance.weaknesses || [
          "Areas for improvement identified",
        ],
        improvementRecommendations: performance.recommendations || [
          "Continue practicing",
        ],
        careerGuidance: ["Focus on skill development"],
        nextStepsAction: ["Schedule more practice sessions"],
        confidenceLevel: performance.detailedMetrics.confidence,
        readinessScore: performance.overallScore,
        marketComparison: "Analysis completed",
        skillGaps: ["Technical skills", "Communication"],
        learningPath: ["Continue learning and practicing"],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefreshAnalysis = () => {
    if (currentPerformance) {
      performAIAnalysis(currentPerformance);
    }
  };

  const handleExportReport = () => {
    if (!currentPerformance || !aiAnalysis) return;

    const report = {
      interview: currentPerformance,
      aiAnalysis,
      trendAnalysis,
      personalizedInsights,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-interview-analysis-${currentPerformance.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return "Interview Ready";
    if (score >= 60) return "Nearly Ready";
    return "Needs Practice";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <LoadingGlobe />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 mt-4">
              Loading Analytics Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Syncing your interview data from cloud storage...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (performanceHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Interview Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete an interview to see AI-powered analytics and insights.
            </p>
            {onStartNewInterview && (
              <button
                onClick={onStartNewInterview}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Your First Interview
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI-Powered Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced insights and recommendations powered by artificial
                intelligence
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshAnalysis}
                disabled={isAnalyzing || !currentPerformance}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
                />
                {isAnalyzing ? "Analyzing..." : "Refresh Analysis"}
              </button>
              <button
                onClick={handleExportReport}
                disabled={!aiAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {lastAnalysisTime && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last analysis: {lastAnalysisTime.toLocaleString()}
            </div>
          )}
        </div>

        {/* AI Analysis Status */}
        {isAnalyzing && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <LoadingGlobe size={24} color="rgb(59, 130, 246)" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  AI Analysis in Progress
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Analyzing your interview performance with advanced AI
                  algorithms...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {currentPerformance && aiAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overall Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentPerformance.overallScore}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Readiness
                  </p>
                  <p
                    className={`text-2xl font-bold ${getReadinessColor(
                      aiAnalysis.readinessScore
                    )}`}
                  >
                    {getReadinessLabel(aiAnalysis.readinessScore)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aiAnalysis.confidenceLevel}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Trend
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                    {trendAnalysis?.performanceTrend || "Stable"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "ai-insights", label: "AI Insights", icon: Brain },
            { id: "trends", label: "Trends", icon: TrendingUp },
            {
              id: "recommendations",
              label: "Recommendations",
              icon: Lightbulb,
            },
            { id: "data-status", label: "Data Status", icon: CheckCircle },
            { id: "debug", label: "Debug", icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "overview" && (
            <VisualAnalyticsDashboard
              currentPerformance={currentPerformance}
              onScheduleFollowUp={onScheduleFollowUp}
            />
          )}

          {activeTab === "ai-insights" && (
            <>
              {(() => {
                console.log("🔍 AI Insights Tab Debug:", {
                  currentPerformance: !!currentPerformance,
                  performanceId: currentPerformance?.id,
                  historyLength: performanceHistory.length,
                  aiAnalysis: !!aiAnalysis,
                  isAnalyzing,
                });
                return null;
              })()}
              {currentPerformance ? (
                <AIInsightsPanel
                  performance={currentPerformance}
                  performanceHistory={performanceHistory}
                  onInsightsGenerated={(insights) => setAiAnalysis(insights)}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Interview Data Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Complete an interview or create demo data to see
                      AI-powered insights and analysis.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Go to Overview to Create Demo Data
                      </button>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Or start a mock interview to generate real data
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "trends" && trendAnalysis && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance Trends
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Trend Direction
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                      {trendAnalysis.performanceTrend}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {trendAnalysis.trendConfidence}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Predicted Next Score
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {trendAnalysis.predictedNextScore}
                    </p>
                  </div>
                </div>

                {trendAnalysis.keyMetricChanges.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Key Changes
                    </h4>
                    <div className="space-y-2">
                      {trendAnalysis.keyMetricChanges.map((change, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            {change.metric}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                change.change > 0
                                  ? "text-green-600"
                                  : change.change < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {change.change > 0 ? "+" : ""}
                              {change.change.toFixed(1)}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                change.significance === "high"
                                  ? "bg-red-100 text-red-800"
                                  : change.significance === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {change.significance}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {trendAnalysis.timeToImprovement}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "recommendations" &&
            aiAnalysis &&
            personalizedInsights && (
              <div className="space-y-6">
                {/* Improvement Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-3">
                    {aiAnalysis.improvementRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                      >
                        <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Guidance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Career Guidance
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.careerGuidance.map((guidance, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {guidance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Next Steps
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.nextStepsAction.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalized Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Role-Specific Advice
                    </h3>
                    <div className="space-y-2">
                      {personalizedInsights.roleSpecificAdvice.map(
                        (advice, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {advice}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Industry Insights
                    </h3>
                    <div className="space-y-2">
                      {personalizedInsights.industryTrends.map(
                        (trend, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {trend}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {onScheduleFollowUp && aiAnalysis.skillGaps.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => onScheduleFollowUp(aiAnalysis.skillGaps)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Schedule Follow-up Practice
                    </button>
                  </div>
                )}
              </div>
            )}

          {activeTab === "data-status" && (
            <div className="space-y-6">
              <AnalyticsDataStatus
                onDataChange={() => {}} // Data changes handled by useAnalyticsData hook
                className="max-w-4xl mx-auto"
              />
              {/* Integration test runner removed for production */}
            </div>
          )}

          {activeTab === "debug" && (
            <div className="space-y-6">
              {/* Analytics debugger removed for production */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
