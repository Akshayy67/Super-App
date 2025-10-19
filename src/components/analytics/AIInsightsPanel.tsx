import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  Zap,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";
import {
  enhancedAIAnalytics,
  AIAnalysisResult,
  TrendAnalysis,
  PersonalizedInsights,
} from "../../utils/enhancedAIAnalytics";
import { LoadingGlobe } from "../ui/LoadingGlobe";

interface AIInsightsPanelProps {
  performance: InterviewPerformanceData;
  performanceHistory: InterviewPerformanceData[];
  onInsightsGenerated?: (insights: AIAnalysisResult) => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  performance,
  performanceHistory,
  onInsightsGenerated,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(
    null
  );
  const [personalizedInsights, setPersonalizedInsights] =
    useState<PersonalizedInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (performance) {
      generateAIInsights();
    }
  }, [performance, performanceHistory]);

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log("🤖 Generating AI insights for performance:", performance.id);

      // Sequential execution with delays to avoid rate limiting
      console.log("🔄 Analyzing interview performance...");
      const analysis = await enhancedAIAnalytics.analyzeInterviewPerformance(
        performance
      );

      // Add delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay

      console.log("🔄 Analyzing trends...");
      const trends = await enhancedAIAnalytics.analyzeTrends(
        performanceHistory
      );

      // Add delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay

      console.log("🔄 Generating personalized insights...");
      const insights = await enhancedAIAnalytics.generatePersonalizedInsights(
        performance,
        performanceHistory
      );

      setAiAnalysis(analysis);
      setTrendAnalysis(trends);
      setPersonalizedInsights(insights);

      if (onInsightsGenerated) {
        onInsightsGenerated(analysis);
      }

      console.log("✅ AI insights generated successfully");
    } catch (error) {
      console.error("❌ Failed to generate AI insights:", error);
      setAnalysisError("Failed to generate AI insights. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case "declining":
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "declining":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { level: "Excellent", color: "text-green-600" };
    if (score >= 75) return { level: "Good", color: "text-blue-600" };
    if (score >= 65) return { level: "Fair", color: "text-yellow-600" };
    return { level: "Needs Work", color: "text-red-600" };
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <LoadingGlobe size={48} color="rgb(59, 130, 246)" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Generating AI Insights
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Analyzing your performance with advanced AI algorithms...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Analysis Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {analysisError}
          </p>
          <button
            onClick={generateAIInsights}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!aiAnalysis || !trendAnalysis) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="text-center py-8">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AI Analysis Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            AI insights are being generated. This may take a few moments.
          </p>
          <button
            onClick={generateAIInsights}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate AI Insights
          </button>
        </div>
      </div>
    );
  }

  const readiness = getReadinessLevel(aiAnalysis.readinessScore);

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">AI Performance Analysis</h2>
            <p className="text-blue-100">
              Advanced insights powered by artificial intelligence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-medium">Readiness Score</span>
            </div>
            <div className="text-2xl font-bold">
              {aiAnalysis.readinessScore}/100
            </div>
            <div
              className={`text-sm ${readiness.color.replace(
                "text-",
                "text-white/"
              )}`}
            >
              {readiness.level}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Confidence Level</span>
            </div>
            <div className="text-2xl font-bold">
              {aiAnalysis.confidenceLevel}%
            </div>
            <div className="text-sm text-white/80">Interview Confidence</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Performance Trend</span>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(trendAnalysis.performanceTrend)}
              <span className="text-lg font-bold capitalize">
                {trendAnalysis.performanceTrend}
              </span>
            </div>
            <div className="text-sm text-white/80">
              {trendAnalysis.trendConfidence}% confidence
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Key AI Insights
        </h3>
        <div className="space-y-3">
          {aiAnalysis.overallInsights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Identified Strengths
          </h3>
          <div className="space-y-3">
            {aiAnalysis.strengthsAnalysis.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {aiAnalysis.weaknessesAnalysis.map((weakness, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{weakness}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      {trendAnalysis.keyMetricChanges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendAnalysis.keyMetricChanges.map((change, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  change.change > 0
                    ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                    : change.change < 0
                    ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-900/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {change.metric}
                  </span>
                  {getTrendIcon(
                    change.change > 0
                      ? "improving"
                      : change.change < 0
                      ? "declining"
                      : "stable"
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg font-bold ${
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
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : change.significance === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                  >
                    {change.significance}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                Improvement Timeline
              </span>
            </div>
            <p className="text-blue-800 dark:text-blue-200">
              {trendAnalysis.timeToImprovement}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Predicted next score: {trendAnalysis.predictedNextScore}/100
            </p>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          AI-Powered Recommendations
        </h3>
        <div className="space-y-3">
          {aiAnalysis.improvementRecommendations.map(
            (recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {recommendation}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Market Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Market Comparison
        </h3>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-gray-700 dark:text-gray-300">
            {aiAnalysis.marketComparison}
          </p>
        </div>
      </div>

      {/* Personalized Career Insights */}
      {personalizedInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Role-Specific Advice
            </h3>
            <div className="space-y-2">
              {personalizedInsights.roleSpecificAdvice.map((advice, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">{advice}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Industry Insights
            </h3>
            <div className="space-y-2">
              {personalizedInsights.industryTrends.map((trend, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">{trend}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Recommended Next Steps
        </h3>
        <div className="space-y-3">
          {aiAnalysis.nextStepsAction.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-white/90">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
