import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Star,
  CheckCircle,
  ArrowRight,
  Target,
  Award,
  Brain,
  Users,
  Clock,
  Zap,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";

interface ActionableStep {
  id: string;
  title: string;
  description: string;
  category: "immediate" | "short-term" | "long-term";
  priority: "high" | "medium" | "low";
  estimatedTime: number; // in minutes
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  resources: string[];
  successMetrics: string[];
}

interface FollowUpQuestion {
  id: string;
  question: string;
  category: string;
  triggerScore: number;
  type: "reflection" | "clarification" | "deep-dive";
  followUps?: string[];
}

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  earned: boolean;
  earnedDate?: string;
  criteria: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface TrendData {
  date: string;
  score: number;
  category: string;
}

interface AdvancedFeedbackSystemProps {
  performanceData: InterviewPerformanceData;
  previousPerformances?: InterviewPerformanceData[];
  isDarkMode?: boolean;
  onActionComplete?: (actionId: string) => void;
  onFollowUpAnswer?: (questionId: string, answer: string) => void;
}

export const AdvancedFeedbackSystem: React.FC<AdvancedFeedbackSystemProps> = ({
  performanceData,
  previousPerformances = [],
  isDarkMode = false,
  onActionComplete,
  onFollowUpAnswer,
}) => {
  const [actionableSteps, setActionableSteps] = useState<ActionableStep[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    FollowUpQuestion[]
  >([]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<string | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    generateActionableSteps();
    generateFollowUpQuestions();
    generateAchievements();
    generateTrendData();
  }, [performanceData, previousPerformances]);

  const generateActionableSteps = () => {
    const steps: ActionableStep[] = [];

    // Communication improvements
    if (performanceData.communicationScore < 80) {
      steps.push({
        id: "comm-filler-words",
        title: "Eliminate Filler Words",
        description:
          "Practice speaking without 'um', 'uh', 'like' by recording yourself daily",
        category: "immediate",
        priority: "high",
        estimatedTime: 15,
        difficulty: "easy",
        completed: false,
        resources: [
          "Toastmasters Filler Word Counter App",
          "Daily 5-minute recording practice",
          "Mirror practice sessions",
        ],
        successMetrics: [
          "Reduce filler words to <3 per minute",
          "Maintain natural speech flow",
          "Increase confidence in delivery",
        ],
      });

      steps.push({
        id: "comm-star-method",
        title: "Master STAR Method",
        description:
          "Structure all behavioral responses using Situation, Task, Action, Result framework",
        category: "short-term",
        priority: "high",
        estimatedTime: 60,
        difficulty: "medium",
        completed: false,
        resources: [
          "STAR Method template",
          "Practice question bank",
          "Mock interview sessions",
        ],
        successMetrics: [
          "Structure 10 stories using STAR",
          "Deliver each story in 2-3 minutes",
          "Include quantifiable results",
        ],
      });
    }

    // Technical improvements
    if (performanceData.technicalScore < 80) {
      steps.push({
        id: "tech-algorithm-explanation",
        title: "Improve Algorithm Explanations",
        description:
          "Practice explaining complex algorithms in simple, clear terms",
        category: "short-term",
        priority: "high",
        estimatedTime: 90,
        difficulty: "hard",
        completed: false,
        resources: [
          "Algorithm visualization tools",
          "Whiteboard practice",
          "Peer explanation sessions",
        ],
        successMetrics: [
          "Explain 20 common algorithms clearly",
          "Use appropriate analogies",
          "Maintain interviewer engagement",
        ],
      });
    }

    // Behavioral improvements
    if (performanceData.behavioralScore < 80) {
      steps.push({
        id: "behav-leadership-stories",
        title: "Develop Leadership Examples",
        description:
          "Create compelling stories that demonstrate leadership and impact",
        category: "long-term",
        priority: "medium",
        estimatedTime: 120,
        difficulty: "medium",
        completed: false,
        resources: [
          "Leadership competency framework",
          "Story development template",
          "Impact measurement guide",
        ],
        successMetrics: [
          "Prepare 5 leadership stories",
          "Demonstrate measurable impact",
          "Show progression and learning",
        ],
      });
    }

    setActionableSteps(steps);
  };

  const generateFollowUpQuestions = () => {
    const questions: FollowUpQuestion[] = [];

    if (performanceData.communicationScore < 70) {
      questions.push({
        id: "comm-clarity",
        question:
          "What specific situations make you feel less confident when speaking?",
        category: "communication",
        triggerScore: 70,
        type: "reflection",
        followUps: [
          "How do you typically prepare for important conversations?",
          "What techniques have you tried to improve your speaking confidence?",
          "When do you feel most articulate and confident?",
        ],
      });
    }

    if (performanceData.technicalScore < 70) {
      questions.push({
        id: "tech-knowledge-gaps",
        question:
          "Which technical areas do you feel need the most improvement?",
        category: "technical",
        triggerScore: 70,
        type: "clarification",
        followUps: [
          "How do you typically learn new technical concepts?",
          "What resources do you find most effective for skill development?",
          "How do you stay updated with industry trends?",
        ],
      });
    }

    setFollowUpQuestions(questions);
  };

  const generateAchievements = () => {
    const badges: AchievementBadge[] = [];

    // First interview achievement
    badges.push({
      id: "first-interview",
      name: "First Steps",
      description: "Completed your first mock interview",
      icon: Star,
      earned: true,
      earnedDate: performanceData.timestamp,
      criteria: "Complete 1 interview",
      rarity: "common",
    });

    // Improvement streak achievement (based on real data)
    const hasImprovementStreak = checkImprovementStreak();
    if (previousPerformances.length >= 2) {
      badges.push({
        id: "improvement-streak",
        name: "Rising Star",
        description: "Improved scores in 3 consecutive interviews",
        icon: TrendingUp,
        earned: hasImprovementStreak,
        earnedDate: hasImprovementStreak
          ? performanceData.timestamp
          : undefined,
        criteria: "3 consecutive improvements",
        rarity: "rare",
      });
    }

    // Communication master achievement
    if (performanceData.communicationScore >= 90) {
      badges.push({
        id: "communication-master",
        name: "Communication Expert",
        description: "Achieved 90+ in communication skills",
        icon: MessageSquare,
        earned: true,
        earnedDate: performanceData.timestamp,
        criteria: "Communication score ≥ 90",
        rarity: "epic",
      });
    }

    // Technical expert achievement
    if (performanceData.technicalScore >= 85) {
      badges.push({
        id: "technical-expert",
        name: "Technical Wizard",
        description: "Achieved 85+ in technical skills",
        icon: Brain,
        earned: true,
        earnedDate: performanceData.timestamp,
        criteria: "Technical score ≥ 85",
        rarity: "epic",
      });
    }

    // Perfect score achievement
    if (performanceData.overallScore >= 95) {
      badges.push({
        id: "perfect-score",
        name: "Interview Legend",
        description: "Achieved perfect scores across all categories",
        icon: Award,
        earned: true,
        earnedDate: performanceData.timestamp,
        criteria: "Overall score ≥ 95",
        rarity: "legendary",
      });
    }

    // Consistency achievement (based on multiple interviews)
    if (previousPerformances.length >= 3) {
      const recentScores = [
        ...previousPerformances.slice(-2),
        performanceData,
      ].map((p) => p.overallScore);
      const isConsistent = recentScores.every(
        (score) => Math.abs(score - recentScores[0]) <= 10
      );

      if (isConsistent) {
        badges.push({
          id: "consistency-champion",
          name: "Consistency Champion",
          description:
            "Maintained consistent performance across multiple interviews",
          icon: Target,
          earned: true,
          earnedDate: performanceData.timestamp,
          criteria: "Consistent scores across 3 interviews",
          rarity: "rare",
        });
      }
    }

    setAchievements(badges);
  };

  const generateTrendData = () => {
    const trends: TrendData[] = [];

    [...previousPerformances, performanceData].forEach((perf, index) => {
      trends.push(
        {
          date: new Date(perf.timestamp).toLocaleDateString(),
          score: perf.communicationScore,
          category: "Communication",
        },
        {
          date: new Date(perf.timestamp).toLocaleDateString(),
          score: perf.technicalScore,
          category: "Technical",
        },
        {
          date: new Date(perf.timestamp).toLocaleDateString(),
          score: perf.behavioralScore,
          category: "Behavioral",
        }
      );
    });

    setTrendData(trends);
  };

  const checkImprovementStreak = (): boolean => {
    if (previousPerformances.length < 2) return false;

    const recent = [...previousPerformances, performanceData].slice(-3);
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].overallScore <= recent[i - 1].overallScore) {
        return false;
      }
    }
    return true;
  };

  const handleActionComplete = (actionId: string) => {
    setActionableSteps((prev) =>
      prev.map((step) =>
        step.id === actionId ? { ...step, completed: true } : step
      )
    );
    onActionComplete?.(actionId);
  };

  const handleFollowUpSubmit = (questionId: string) => {
    const answer = followUpAnswers[questionId];
    if (answer) {
      onFollowUpAnswer?.(questionId, answer);
      setActiveFollowUp(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50";
      case "rare":
        return "border-blue-300 bg-blue-50";
      case "epic":
        return "border-purple-300 bg-purple-50";
      case "legendary":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const filteredSteps = actionableSteps.filter((step) => {
    if (selectedCategory !== "all" && step.category !== selectedCategory)
      return false;
    if (!showCompleted && step.completed) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Actionable Steps */}
      <div
        className={`rounded-lg shadow-lg p-6 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-6 h-6" />
            Actionable Improvement Steps
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All Categories</option>
              <option value="immediate">Immediate</option>
              <option value="short-term">Short-term</option>
              <option value="long-term">Long-term</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show completed</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSteps.map((step) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-all ${
                step.completed
                  ? isDarkMode
                    ? "border-green-600 bg-green-900/20"
                    : "border-green-200 bg-green-50"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className={`font-semibold ${
                        step.completed ? "line-through opacity-75" : ""
                      }`}
                    >
                      {step.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs border ${getPriorityColor(
                        step.priority
                      )}`}
                    >
                      {step.priority.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs ${getDifficultyColor(
                        step.difficulty
                      )}`}
                    >
                      {step.difficulty}
                    </span>
                  </div>
                  <p
                    className={`text-sm mb-3 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    } ${step.completed ? "opacity-75" : ""}`}
                  >
                    {step.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {step.estimatedTime} min
                    </span>
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      Category: {step.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      onClick={() => handleActionComplete(step.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Resources and Success Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Resources:</h4>
                  <ul className="space-y-1">
                    {step.resources.map((resource, index) => (
                      <li
                        key={index}
                        className={`text-xs ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        • {resource}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Success Metrics:</h4>
                  <ul className="space-y-1">
                    {step.successMetrics.map((metric, index) => (
                      <li
                        key={index}
                        className={`text-xs ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        • {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div
          className={`rounded-lg shadow-lg p-6 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Reflection Questions
          </h2>

          <div className="space-y-4">
            {followUpQuestions.map((question) => (
              <div
                key={question.id}
                className={`border rounded-lg p-4 ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{question.question}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        question.type === "reflection"
                          ? "bg-blue-100 text-blue-800"
                          : question.type === "clarification"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {question.type}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setActiveFollowUp(
                        activeFollowUp === question.id ? null : question.id
                      )
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    {activeFollowUp === question.id ? "Cancel" : "Answer"}
                  </button>
                </div>

                {activeFollowUp === question.id && (
                  <div className="mt-4">
                    <textarea
                      value={followUpAnswers[question.id] || ""}
                      onChange={(e) =>
                        setFollowUpAnswers((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      placeholder="Share your thoughts..."
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                      rows={3}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleFollowUpSubmit(question.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setActiveFollowUp(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div
        className={`rounded-lg shadow-lg p-6 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-6 h-6" />
          Achievement Badges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                badge.earned
                  ? `${getRarityColor(badge.rarity)} opacity-100`
                  : isDarkMode
                  ? "border-gray-600 bg-gray-700 opacity-50"
                  : "border-gray-300 bg-gray-100 opacity-50"
              }`}
            >
              <div className="text-center">
                <badge.icon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    badge.earned ? "text-yellow-500" : "text-gray-400"
                  }`}
                />
                <h3 className="font-semibold text-sm">{badge.name}</h3>
                <p
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {badge.description}
                </p>
                <div
                  className={`text-xs mt-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {badge.criteria}
                </div>
                {badge.earned && badge.earnedDate && (
                  <div className="text-xs text-green-600 mt-1">
                    Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
