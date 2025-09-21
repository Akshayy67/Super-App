import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar,
  User,
  BarChart3,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";
import {
  DetailedInterviewSession,
  QuestionResponse,
  DetailedInterviewAnalyzer,
} from "../types/detailedInterviewData";
import { unifiedAnalyticsStorage } from "../utils/unifiedAnalyticsStorage";

interface DetailedInterviewHistoryProps {
  onClose?: () => void;
}

export const DetailedInterviewHistory: React.FC<
  DetailedInterviewHistoryProps
> = ({ onClose }) => {
  const [interviews, setInterviews] = useState<InterviewPerformanceData[]>([]);
  const [detailedSessions, setDetailedSessions] = useState<
    DetailedInterviewSession[]
  >([]);
  const [selectedInterview, setSelectedInterview] =
    useState<DetailedInterviewSession | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterviewHistory();
  }, []);

  const loadInterviewHistory = async () => {
    try {
      setIsLoading(true);
      const data = await unifiedAnalyticsStorage.getPerformanceHistory();
      setInterviews(data);

      // Convert to detailed format (for now, using basic conversion)
      const detailed = data.map((interview) =>
        DetailedInterviewAnalyzer.convertToDetailedFormat(interview, [], [])
      );
      setDetailedSessions(detailed);
    } catch (error) {
      console.error("Failed to load interview history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <Target className="w-4 h-4" />;
      case "behavioral":
        return <User className="w-4 h-4" />;
      case "communication":
        return <MessageSquare className="w-4 h-4" />;
      case "situational":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get actual question-response data from the interview session
  const getActualQuestionResponses = (
    interview: DetailedInterviewSession
  ): QuestionResponse[] => {
    console.log(
      "🔍 Getting actual question responses for interview:",
      interview.id,
      {
        questionResponsesCount: interview.questionResponses.length,
        hasQuestionResponses: interview.questionResponses.length > 0,
      }
    );

    // Return the actual question-response pairs extracted from the interview session
    if (interview.questionResponses.length > 0) {
      return interview.questionResponses;
    }

    // Fallback: if no question responses are available, show a message
    return [
      {
        id: `fallback-${interview.id}`,
        questionId: "no-data",
        question: "No detailed question data available for this interview",
        category: "general" as const,
        difficulty: "medium" as const,
        timeLimit: 0,
        userResponse:
          "This interview was completed before detailed question tracking was implemented. Only performance metrics are available.",
        responseTime: 0,
        responseStartTime: interview.timestamp,
        responseEndTime: interview.timestamp,
        aiAnalysis: {
          score: Math.round(interview.sessionAnalytics.averageScore / 10),
          convertedScore: interview.sessionAnalytics.averageScore,
          strengths: ["Interview completed successfully"],
          weaknesses: ["Detailed question data not available"],
          improvements: ["Complete new interviews for detailed analysis"],
          keyPoints: ["Performance metrics available"],
          relevance: 0,
          completeness: 0,
          clarity: 0,
          confidence: 0,
        },
        responseMetrics: {
          wordCount: 0,
          speakingTime: 0,
          pauseCount: 0,
          fillerWordCount: 0,
          averagePauseLength: 0,
          speakingPace: 0,
          volumeConsistency: 0,
          eyeContactDuration: 0,
          gestureCount: 0,
        },
        followUpQuestions: [],
      },
    ];
  };

  const filteredInterviews = detailedSessions.filter((interview) => {
    const matchesSearch =
      interview.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.difficulty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading interview history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detailed Interview History
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive question-by-question analysis of your interview
            performance
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="communication">Communication</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Interview List */}
      <div className="space-y-6">
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Interview History Found
            </h3>
            <p className="text-gray-600">
              Complete some mock interviews to see detailed analysis here.
            </p>
          </div>
        ) : (
          filteredInterviews.map((interview) => {
            // Get actual question-response data from the interview session
            const actualQuestions = getActualQuestionResponses(interview);

            return (
              <div
                key={interview.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Interview Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-gray-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {interview.role}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(interview.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(interview.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {interview.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {actualQuestions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${getScoreColor(
                          interview.sessionAnalytics.averageScore
                        )}`}
                      >
                        Overall: {interview.sessionAnalytics.averageScore}/100
                      </div>
                      <button
                        onClick={() =>
                          setSelectedInterview(
                            selectedInterview?.id === interview.id
                              ? null
                              : interview
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        {selectedInterview?.id === interview.id
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detailed Questions View */}
                {selectedInterview?.id === interview.id && (
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Question-by-Question Analysis
                    </h4>
                    <div className="space-y-4">
                      {actualQuestions.map((qr, index) => (
                        <div
                          key={qr.id}
                          className="border border-gray-200 rounded-lg"
                        >
                          {/* Question Header */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleQuestionExpansion(qr.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {expandedQuestions.has(qr.id) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                  <span className="text-sm font-medium text-gray-500">
                                    Q{index + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(qr.category)}
                                  <span className="text-sm text-gray-600 capitalize">
                                    {qr.category}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {qr.question}
                                </div>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(
                                  qr.aiAnalysis.convertedScore
                                )}`}
                              >
                                {qr.aiAnalysis.convertedScore}/100
                              </div>
                            </div>
                          </div>

                          {/* Expanded Question Details */}
                          {expandedQuestions.has(qr.id) && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Response */}
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">
                                    Your Response
                                  </h5>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                                    <p className="text-gray-700">
                                      {qr.userResponse}
                                    </p>
                                  </div>

                                  {/* Response Metrics */}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">
                                        Response Time:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {formatDuration(qr.responseTime)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Word Count:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {qr.responseMetrics.wordCount}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Speaking Pace:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {Math.round(
                                          qr.responseMetrics.speakingPace
                                        )}{" "}
                                        WPM
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Filler Words:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {qr.responseMetrics.fillerWordCount}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* AI Analysis */}
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">
                                    AI Analysis
                                  </h5>

                                  {/* Score Breakdown */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="text-sm text-gray-600">
                                        Relevance
                                      </div>
                                      <div className="text-lg font-semibold">
                                        {qr.aiAnalysis.relevance}/10
                                      </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="text-sm text-gray-600">
                                        Clarity
                                      </div>
                                      <div className="text-lg font-semibold">
                                        {qr.aiAnalysis.clarity}/10
                                      </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="text-sm text-gray-600">
                                        Completeness
                                      </div>
                                      <div className="text-lg font-semibold">
                                        {qr.aiAnalysis.completeness}/10
                                      </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="text-sm text-gray-600">
                                        Confidence
                                      </div>
                                      <div className="text-lg font-semibold">
                                        {qr.aiAnalysis.confidence}/10
                                      </div>
                                    </div>
                                  </div>

                                  {/* Strengths and Improvements */}
                                  <div className="space-y-3">
                                    <div>
                                      <h6 className="font-medium text-green-700 mb-1">
                                        Strengths
                                      </h6>
                                      <ul className="text-sm text-gray-600 space-y-1">
                                        {qr.aiAnalysis.strengths.map(
                                          (strength, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start gap-2"
                                            >
                                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                              {strength}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>

                                    <div>
                                      <h6 className="font-medium text-orange-700 mb-1">
                                        Areas for Improvement
                                      </h6>
                                      <ul className="text-sm text-gray-600 space-y-1">
                                        {qr.aiAnalysis.improvements.map(
                                          (improvement, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start gap-2"
                                            >
                                              <Lightbulb className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                              {improvement}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DetailedInterviewHistory;
