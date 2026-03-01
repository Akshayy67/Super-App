import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Star,
  Loader2,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  Target,
  Zap,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { aiService } from "../../utils/aiService";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";
import { aspectScoresManager } from "../../utils/interviewAspectScores";
import { triggerRoadmapUpdate } from "../../utils/growthEngine";
import { unifiedAnalyticsStorage } from "../../utils/unifiedAnalyticsStorage";
import "./InterviewFeedback.css";

interface FeedbackSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: string;
  score?: number;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  actionItems?: string[];
  subScores?: Record<string, number>;
}

interface ImprovementData {
  aspects: {
    name: string;
    current: number;
    previous: number;
    average: number;
    trend: "improving" | "declining" | "stable";
    delta: number;
  }[];
  isFirstInterview: boolean;
  overallTrend: "improving" | "declining" | "stable";
  progressNarrative?: string;
}

interface InterviewFeedbackProps {
  messages: Array<{ role: "user" | "system" | "assistant"; content: string }>;
  interviewType: string;
  difficulty: string;
  role: string;
  performanceData?: InterviewPerformanceData | null;
  onClose: () => void;
  onScoresAnalyzed?: (scores: {
    overall: number;
    technical: number;
    communication: number;
    behavioral: number;
  }) => void;
}

/* ── Animated Count-Up Hook ── */
function useCountUp(end: number, duration = 1200, start = 0): number {
  const [current, setCurrent] = useState(start);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (end === 0) { setCurrent(0); return; }
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.round((start + (end - start) * eased) * 10) / 10);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration, start]);

  return current;
}

export const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({
  messages,
  interviewType,
  difficulty,
  role,
  performanceData,
  onClose,
  onScoresAnalyzed,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackSections, setFeedbackSections] = useState<FeedbackSection[]>(
    []
  );
  const [overallScore, setOverallScore] = useState<number>(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [improvementData, setImprovementData] = useState<ImprovementData | null>(null);
  const [overallAnalysisExtra, setOverallAnalysisExtra] = useState<{
    hireSignal?: string;
    improvementRoadmap?: string[];
    progressAnalysis?: string;
  }>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const animatedScore = useCountUp(analysisComplete ? overallScore : 0, 1400);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getImprovementData = (): ImprovementData => {
    const allHistories = aspectScoresManager.getAllAspectHistories();
    if (allHistories.length === 0) {
      return { aspects: [], isFirstInterview: true, overallTrend: "stable" };
    }

    const aspects = allHistories.map(h => {
      const scores = h.scores;
      const previous = scores.length >= 2 ? scores[scores.length - 2].score : h.latestScore;
      return {
        name: h.aspectName,
        current: h.latestScore,
        previous,
        average: h.averageScore,
        trend: h.trend,
        delta: h.latestScore - previous,
      };
    });

    const improvingCount = aspects.filter(a => a.trend === "improving").length;
    const decliningCount = aspects.filter(a => a.trend === "declining").length;
    const overallTrend = improvingCount > decliningCount ? "improving" : decliningCount > improvingCount ? "declining" : "stable";

    return { aspects, isFirstInterview: false, overallTrend };
  };

  // Auto-expand first 2 sections when analysis completes
  useEffect(() => {
    if (analysisComplete && feedbackSections.length > 0) {
      setExpandedSections(new Set(feedbackSections.slice(0, 2).map(s => s.id)));
    }
  }, [analysisComplete, feedbackSections]);

  const getScoreRingColor = (score: number) => {
    if (score >= 8) return { stroke: "#10b981", glow: "rgba(16,185,129,0.25)" };
    if (score >= 6) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.25)" };
    return { stroke: "#ef4444", glow: "rgba(239,68,68,0.25)" };
  };

  const getStatusBadge = (score: number) => {
    if (score >= 8) return { label: "Excellent", cls: "fb-status-excellent" };
    if (score >= 6) return { label: "Good", cls: "fb-status-good" };
    return { label: "Needs Improvement", cls: "fb-status-improve" };
  };

  const getCardIconClass = (id: string): string => {
    switch (id) {
      case "communication": return "fb-card-icon-blue";
      case "technical": return "fb-card-icon-green";
      case "behavioral": return "fb-card-icon-purple";
      case "improvements": return "fb-card-icon-amber";
      case "strengths": return "fb-card-icon-rose";
      default: return "fb-card-icon-blue";
    }
  };

  const getSubScoreClass = (value: number): string => {
    if (value >= 8) return "green";
    if (value >= 6) return "amber";
    return "red";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 6) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const analyzeInterview = async () => {
    setIsAnalyzing(true);
    setFeedbackSections([]);

    try {
      // If we have ML performance data, use it for enhanced analysis
      if (performanceData) {
        generateMLBasedFeedback();
        return;
      }

      // Fallback to conversation-based analysis
      const conversationText = messages
        .filter((msg) => msg.role !== "system") // Filter out system messages
        .map(
          (msg) =>
            `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content
            }`
        )
        .join("\n\n");

      // Analyze different aspects with separate API calls
      const [
        communicationAnalysis,
        technicalAnalysis,
        behavioralAnalysis,
        overallAnalysis,
      ] = await Promise.all([
        analyzeCommunication(conversationText, role, difficulty),
        analyzeTechnicalSkills(conversationText, role, difficulty),
        analyzeBehavioralAspects(conversationText, role, difficulty),
        analyzeOverallPerformance(
          conversationText,
          role,
          difficulty,
          interviewType
        ),
      ]);

      // Create feedback sections with extended enterprise-grade fields
      const sections: FeedbackSection[] = [
        {
          id: "communication",
          title: "Communication Skills",
          icon: <MessageSquare className="w-5 h-5" />,
          color: "text-blue-600",
          content: communicationAnalysis.content,
          score: communicationAnalysis.score,
          suggestions: communicationAnalysis.suggestions,
          strengths: communicationAnalysis.strengths,
          weaknesses: communicationAnalysis.weaknesses,
          actionItems: communicationAnalysis.actionItems,
          subScores: communicationAnalysis.subScores,
        },
        {
          id: "technical",
          title: "Technical Knowledge",
          icon: <TrendingUp className="w-5 h-5" />,
          color: "text-green-600",
          content: technicalAnalysis.content,
          score: technicalAnalysis.score,
          suggestions: technicalAnalysis.suggestions,
          strengths: technicalAnalysis.strengths,
          weaknesses: technicalAnalysis.weaknesses,
          actionItems: technicalAnalysis.actionItems,
          subScores: technicalAnalysis.subScores,
        },
        {
          id: "behavioral",
          title: "Behavioral Responses",
          icon: <Star className="w-5 h-5" />,
          color: "text-purple-600",
          content: behavioralAnalysis.content,
          score: behavioralAnalysis.score,
          suggestions: behavioralAnalysis.suggestions,
          strengths: behavioralAnalysis.strengths,
          weaknesses: behavioralAnalysis.weaknesses,
          actionItems: behavioralAnalysis.actionItems,
          subScores: behavioralAnalysis.subScores,
        },
        {
          id: "improvements",
          title: "Areas for Improvement",
          icon: <AlertTriangle className="w-5 h-5" />,
          color: "text-orange-600",
          content: overallAnalysis.improvements,
          suggestions: overallAnalysis.improvementSuggestions,
        },
        {
          id: "strengths",
          title: "Key Strengths",
          icon: <Lightbulb className="w-5 h-5" />,
          color: "text-yellow-600",
          content: overallAnalysis.strengths,
          suggestions: overallAnalysis.strengthSuggestions,
        },
      ];

      setFeedbackSections(sections);
      setOverallScore(overallAnalysis.overallScore);
      setOverallAnalysisExtra({
        hireSignal: overallAnalysis.hireSignal,
        improvementRoadmap: overallAnalysis.improvementRoadmap,
        progressAnalysis: overallAnalysis.progressAnalysis,
      });
      setImprovementData(getImprovementData());
      setAnalysisComplete(true);

      // Generate unique interview ID for this analysis
      const interviewId = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      // Store aspect scores in the aspect scores manager
      const aspectScores: Record<string, any> = {
        "Communication": {
          score: communicationAnalysis.score * 10, // Convert to 0-100 scale
          category: "communication" as const,
          subScores: communicationAnalysis.subScores
            ? Object.fromEntries(
              Object.entries(communicationAnalysis.subScores).map(([k, v]) => [
                k,
                (v as number) * 10,
              ])
            )
            : undefined,
          metadata: {
            confidence: 0.9,
            analysisQuality: "high" as const,
            notes: "AI-generated communication analysis",
          },
        },
        "Technical Skills": {
          score: technicalAnalysis.score * 10,
          category: "technical" as const,
          subScores: technicalAnalysis.subScores
            ? Object.fromEntries(
              Object.entries(technicalAnalysis.subScores).map(([k, v]) => [
                k,
                (v as number) * 10,
              ])
            )
            : undefined,
          metadata: {
            confidence: 0.9,
            analysisQuality: "high" as const,
            notes: "AI-generated technical analysis",
          },
        },
        "Behavioral": {
          score: behavioralAnalysis.score * 10,
          category: "behavioral" as const,
          subScores: behavioralAnalysis.subScores
            ? Object.fromEntries(
              Object.entries(behavioralAnalysis.subScores).map(([k, v]) => [
                k,
                (v as number) * 10,
              ])
            )
            : undefined,
          metadata: {
            confidence: 0.9,
            analysisQuality: "high" as const,
            notes: "AI-generated behavioral analysis",
          },
        },
        "Overall": {
          score: overallAnalysis.overallScore * 10,
          category: "overall" as const,
          metadata: {
            confidence: 0.85,
            analysisQuality: "high" as const,
            notes: "AI-generated overall performance analysis",
          },
        },
      };

      // Store all aspect scores
      aspectScoresManager.addScoresForInterview(
        interviewId,
        timestamp,
        aspectScores
      );

      console.log("📊 Stored aspect scores:", {
        interviewId,
        aspectScores,
        timestamp,
      });

      // Pass the real AI scores back to parent component for analytics
      if (onScoresAnalyzed) {
        const realScores = {
          overall: overallAnalysis.overallScore * 10, // Convert 1-10 to 1-100 scale
          technical: technicalAnalysis.score * 10,
          communication: communicationAnalysis.score * 10,
          behavioral: behavioralAnalysis.score * 10,
        };
        console.log("📊 Passing real AI scores to analytics:", realScores);
        onScoresAnalyzed(realScores);
      }

      // Trigger roadmap auto-update after feedback is complete
      try {
        const currentHistory = await unifiedAnalyticsStorage.getPerformanceHistory();
        triggerRoadmapUpdate(currentHistory.length);
      } catch (e) {
        console.warn("Could not trigger roadmap update:", e);
      }
    } catch (error) {
      console.error("Error analyzing interview:", error);
      // Fallback feedback
      setFeedbackSections([
        {
          id: "error",
          title: "Analysis Error",
          icon: <AlertTriangle className="w-5 h-5" />,
          color: "text-red-600",
          content:
            "Unable to analyze the interview. Please try again or check your AI configuration.",
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMLBasedFeedback = () => {
    if (!performanceData) return;

    const sections: FeedbackSection[] = [
      {
        id: "communication",
        title: "Communication Skills",
        icon: <MessageSquare className="w-5 h-5" />,
        color: "blue",
        content: `Your communication score is ${performanceData.communicationScore
          }/100. ${performanceData.communicationScore >= 80
            ? "Excellent communication with clear articulation and confident delivery."
            : performanceData.communicationScore >= 60
              ? "Good communication skills with room for improvement in clarity and confidence."
              : "Communication needs improvement. Focus on speaking clearly and confidently."
          }`,
        score: performanceData.communicationScore,
        suggestions: [
          ...(performanceData.speechAnalysis.pronunciationAssessment.clarity <
            80
            ? ["Practice speaking more clearly and distinctly"]
            : []),
          ...(performanceData.speechAnalysis.fillerWords.percentage > 10
            ? ["Reduce use of filler words like 'um', 'uh', 'like'"]
            : []),
          ...(performanceData.speechAnalysis.paceAnalysis.wordsPerMinute < 120
            ? ["Increase speaking pace for better engagement"]
            : []),
        ],
      },
      {
        id: "technical",
        title: "Technical Performance",
        icon: <TrendingUp className="w-5 h-5" />,
        color: "green",
        content: `Your technical score is ${performanceData.technicalScore
          }/100. ${performanceData.technicalScore >= 80
            ? "Strong technical performance with good problem-solving approach."
            : performanceData.technicalScore >= 60
              ? "Solid technical foundation with opportunities for deeper knowledge demonstration."
              : "Technical skills need development. Focus on core concepts and practical application."
          }`,
        score: performanceData.technicalScore,
        suggestions: [
          "Practice explaining technical concepts clearly",
          "Prepare examples from your experience",
          "Review fundamental concepts for your role",
        ],
      },
      {
        id: "behavioral",
        title: "Body Language & Presence",
        icon: <Star className="w-5 h-5" />,
        color: "purple",
        content: `Your behavioral score is ${performanceData.behavioralScore
          }/100. ${performanceData.bodyLanguageAnalysis.eyeContact.score >= 70
            ? "Good eye contact and professional presence."
            : "Work on maintaining better eye contact and posture."
          }`,
        score: performanceData.behavioralScore,
        suggestions: [
          ...(performanceData.bodyLanguageAnalysis.eyeContact.score < 70
            ? ["Maintain more consistent eye contact with the camera"]
            : []),
          ...(performanceData.bodyLanguageAnalysis.posture.score < 70
            ? ["Improve posture - sit up straight and appear confident"]
            : []),
          ...(performanceData.bodyLanguageAnalysis.facialExpressions
            .engagement < 70
            ? ["Show more engagement through facial expressions"]
            : []),
        ],
      },
      {
        id: "overall",
        title: "Overall Assessment",
        icon: <Lightbulb className="w-5 h-5" />,
        color: "yellow",
        content: `Overall performance: ${performanceData.overallScore}/100. ${performanceData.overallScore >= 80
          ? "Excellent interview performance! You demonstrated strong skills across all areas."
          : performanceData.overallScore >= 60
            ? "Good interview performance with clear strengths and some areas for improvement."
            : "Interview performance shows potential with significant room for growth."
          }`,
        score: performanceData.overallScore,
        suggestions: performanceData.recommendations,
      },
    ];

    setFeedbackSections(sections);
    setOverallScore(performanceData.overallScore);
    setAnalysisComplete(true);
    setIsAnalyzing(false);

    // Trigger roadmap auto-update for ML-based path too
    (async () => {
      try {
        const currentHistory = await unifiedAnalyticsStorage.getPerformanceHistory();
        triggerRoadmapUpdate(currentHistory.length);
      } catch (e) {
        console.warn("Could not trigger roadmap update:", e);
      }
    })();
  };

  const analyzeCommunication = async (
    conversation: string,
    role: string,
    difficulty: string
  ) => {
    const prompt = `You are a world-class interview communication coach with 20+ years of experience at McKinsey, Google, and Harvard Business School. Analyze this candidate's communication skills with surgical precision.

ROLE: ${role} | DIFFICULTY: ${difficulty}

INTERVIEW TRANSCRIPT:
${conversation}

SCORING RUBRIC (1-10, be brutally honest but fair):

Score each sub-dimension:
1. "clarity" - How clear and understandable are the candidate's responses?
2. "structure" - Are answers logically organized with clear beginnings, middles, and ends?
3. "conciseness" - Does the candidate get to the point without rambling?
4. "language" - Vocabulary sophistication and professional terminology usage
5. "confidence" - Voice of authority, conviction in statements
6. "engagement" - Active listening indicators, building on interviewer's points
7. "persuasiveness" - Ability to make compelling arguments
8. "professionalism" - Appropriate tone, register, and business etiquette

TONE APPROACH: Start with what the candidate did WELL (be genuine and specific with examples from the transcript). Then transition honestly into areas needing improvement. End with 2-3 specific, actionable exercises they can practice TODAY.



You MUST respond with valid JSON only:
{
  "score": <number 1-10>,
  "content": "<2-3 paragraph analysis: praise first, then honest assessment with transcript evidence>",
  "suggestions": ["<specific actionable tip>", "<specific actionable tip>", "<specific actionable tip>"],
  "strengths": ["<observed strength>", "<observed strength>"],
  "weaknesses": ["<area to improve>", "<area to improve>"],
  "actionItems": ["<practice exercise>", "<practice exercise>"],
  "subScores": {
    "clarity": <1-10>,
    "structure": <1-10>,
    "conciseness": <1-10>,
    "language": <1-10>,
    "confidence": <1-10>,
    "engagement": <1-10>,
    "persuasiveness": <1-10>,
    "professionalism": <1-10>
  }
}`;

    try {
      const response = await aiService.generateResponse(prompt, "interview");
      const rawText = typeof response === "string" ? response : (response?.data || "");
      const cleanedResponse = rawText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch {
      return {
        score: 5,
        content: "Communication analysis could not be completed.",
        suggestions: ["Practice clear communication"],
        subScores: {},
      };
    }
  };

  const analyzeTechnicalSkills = async (
    conversation: string,
    role: string,
    difficulty: string
  ) => {
    const prompt = `You are a FAANG principal-level technical interviewer who has conducted 5,000+ interviews. Evaluate this candidate's technical responses with the rigor of a Google L6 hiring committee.

ROLE: ${role} | DIFFICULTY: ${difficulty}

INTERVIEW TRANSCRIPT:
${conversation}

SCORING RUBRIC (1-10, calibrated to industry standards):

Score each sub-dimension:
1. "domainKnowledge" - Depth of knowledge in the relevant technical domain
2. "problemSolving" - Analytical approach, breaking down complex problems
3. "systemsThinking" - Understanding of how components interact in larger systems
4. "bestPractices" - Awareness of industry standards, patterns, and anti-patterns
5. "experience" - Quality and relevance of real-world examples shared
6. "terminology" - Correct and natural use of technical vocabulary
7. "analyticalReasoning" - Logical thinking and ability to reason through unknowns
8. "adaptability" - Response to follow-up questions and ability to pivot

TONE: Begin by acknowledging specific technical strengths demonstrated in the transcript. Then provide calibrated, honest feedback on gaps compared to ${role} expectations at ${difficulty} level. End with targeted study recommendations.



You MUST respond with valid JSON only:
{
  "score": <number 1-10>,
  "content": "<2-3 paragraph technical evaluation with specific references to their answers>",
  "suggestions": ["<technical improvement tip>", "<technical improvement tip>", "<technical improvement tip>"],
  "strengths": ["<technical strength>", "<technical strength>"],
  "weaknesses": ["<technical gap>", "<technical gap>"],
  "actionItems": ["<specific study/practice task>", "<specific study/practice task>"],
  "subScores": {
    "domainKnowledge": <1-10>,
    "problemSolving": <1-10>,
    "systemsThinking": <1-10>,
    "bestPractices": <1-10>,
    "experience": <1-10>,
    "terminology": <1-10>,
    "analyticalReasoning": <1-10>,
    "adaptability": <1-10>
  }
}`;

    try {
      const response = await aiService.generateResponse(prompt, "interview");
      const rawText = typeof response === "string" ? response : (response?.data || "");
      const cleanedResponse = rawText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch {
      return {
        score: 5,
        content: "Technical analysis could not be completed.",
        suggestions: ["Review core technical concepts"],
        subScores: {},
      };
    }
  };

  const analyzeBehavioralAspects = async (
    conversation: string,
    role: string,
    difficulty: string
  ) => {
    const prompt = `You are an organizational psychologist and executive behavioral interviewer with deep expertise in STAR methodology, leadership assessment, and cultural fit evaluation at Fortune 500 companies.

ROLE: ${role} | DIFFICULTY: ${difficulty}

INTERVIEW TRANSCRIPT:
${conversation}

SCORING RUBRIC (1-10):

Score each sub-dimension:
1. "starMethod" - Quality of Situation-Task-Action-Result storytelling
2. "examples" - Specificity and relevance of real-world examples
3. "problemSolving" - Demonstrated approach to handling challenges
4. "teamwork" - Evidence of collaboration and interpersonal skills
5. "leadership" - Initiative, ownership, and influence demonstrated
6. "adaptability" - Response to ambiguity and changing circumstances
7. "selfAwareness" - Honest reflection on failures and growth areas
8. "culturalFit" - Alignment with professional values and growth mindset

TONE: Lead with genuine recognition of the candidate's behavioral strengths and compelling stories. Then honestly assess gaps in behavioral competencies. End with concrete practice scenarios.



You MUST respond with valid JSON only:
{
  "score": <number 1-10>,
  "content": "<2-3 paragraph behavioral assessment with evidence from their stories>",
  "suggestions": ["<behavioral improvement tip>", "<behavioral improvement tip>", "<behavioral improvement tip>"],
  "strengths": ["<behavioral strength>", "<behavioral strength>"],
  "weaknesses": ["<behavioral gap>", "<behavioral gap>"],
  "actionItems": ["<practice scenario>", "<practice scenario>"],
  "subScores": {
    "starMethod": <1-10>,
    "examples": <1-10>,
    "problemSolving": <1-10>,
    "teamwork": <1-10>,
    "leadership": <1-10>,
    "adaptability": <1-10>,
    "selfAwareness": <1-10>,
    "culturalFit": <1-10>
  }
}`;

    try {
      const response = await aiService.generateResponse(prompt, "interview");
      const rawText = typeof response === "string" ? response : (response?.data || "");
      const cleanedResponse = rawText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch {
      return {
        score: 5,
        content: "Behavioral analysis could not be completed.",
        suggestions: ["Practice STAR method responses"],
        subScores: {},
      };
    }
  };

  const analyzeOverallPerformance = async (
    conversation: string,
    role: string,
    difficulty: string,
    interviewType: string
  ) => {
    // Fetch historical data for improvement comparison
    const allHistories = aspectScoresManager.getAllAspectHistories();
    const hasHistory = allHistories.length > 0;
    const historyContext = hasHistory
      ? `\n\nHISTORICAL PERFORMANCE DATA:\n${JSON.stringify(allHistories.map(h => ({
        aspect: h.aspectName,
        latestScore: h.latestScore,
        averageScore: h.averageScore,
        trend: h.trend,
        totalInterviews: h.scores.length,
      })), null, 2)}`
      : "";

    const progressField = hasHistory
      ? `,\n  "progressAnalysis": "<2-3 sentence comparison of current performance vs previous interviews, highlighting specific improvements and areas that still need work>"`
      : "";

    const prompt = `You are a Chief People Officer at a top-tier tech company, conducting a final holistic review of this candidate's interview performance. Your assessment will determine the hiring recommendation.

ROLE: ${role} | DIFFICULTY: ${difficulty} | TYPE: ${interviewType}
${historyContext}

INTERVIEW TRANSCRIPT:
${conversation}

Provide an executive-level assessment covering:
1. Overall interview effectiveness and readiness for the ${role} role
2. Hire/No-Hire signal with confidence level
3. Top 3 strengths that would add value to a team
4. Top 3 areas where the candidate needs development
5. A 90-day improvement roadmap (3 specific steps)
${hasHistory ? "6. Progress analysis comparing current vs previous interviews" : ""}

TONE: Start by highlighting what genuinely impressed you about this candidate. Be encouraging about their potential. Then provide an honest, calibrated assessment that respects their effort while being truthful about gaps.



You MUST respond with valid JSON only:
{
  "overallScore": <number 1-10>,
  "strengths": "<paragraph about key strengths with specific evidence>",
  "improvements": "<paragraph about areas needing improvement>",
  "strengthSuggestions": ["<leverage this strength>", "<leverage this strength>"],
  "improvementSuggestions": ["<specific improvement action>", "<specific improvement action>", "<specific improvement action>"],
  "hireSignal": "<one-line hire recommendation, e.g. 'Strong Hire — 85% confidence' or 'Lean No Hire — needs more technical depth'>",
  "improvementRoadmap": ["<30-day action>", "<60-day action>", "<90-day action>"]${progressField}
}`;

    try {
      const response = await aiService.generateResponse(prompt, "interview");
      const rawText = typeof response === "string" ? response : (response?.data || "");
      const cleanedResponse = rawText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanedResponse);
    } catch {
      return {
        overallScore: 5,
        strengths: "Overall analysis could not be completed. Please check your AI configuration.",
        improvements: "Unable to provide specific improvement areas.",
        strengthSuggestions: ["Focus on your strengths", "Build on positive aspects"],
        improvementSuggestions: ["Practice regularly", "Seek feedback", "Work on identified areas"],
      };
    }
  };

  const downloadFeedback = () => {
    const feedbackText = `
Interview Feedback Report
========================

Role: ${role}
Type: ${interviewType}
Difficulty: ${difficulty}
Overall Score: ${overallScore}/10

${feedbackSections
        .map(
          (section) => `
${section.title}
${"=".repeat(section.title.length)}
${section.content}

${section.suggestions && section.suggestions.length > 0
              ? `Suggestions:\n${section.suggestions.map((s) => `- ${s}`).join("\n")}`
              : ""
            }

Score: ${section.score ? `${section.score}/10` : "N/A"}
`
        )
        .join("\n")}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([feedbackText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-feedback-${role}-${new Date().toISOString().split("T")[0]
      }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ringColor = getScoreRingColor(overallScore);
  const status = getStatusBadge(overallScore);
  const circumference = 2 * Math.PI * 52; // r=52

  return (
    <div className="fb-overlay">
      <div className="fb-modal">
        {/* ── Header ── */}
        <div className="fb-header">
          <div className="fb-header-content">
            <div>
              <h2 className="fb-header-title">Performance Report</h2>
              <p className="fb-header-subtitle">
                {role} · {interviewType} · {difficulty}
              </p>
            </div>
            <div className="fb-header-actions">
              {analysisComplete && (
                <>
                  <button className="fb-header-btn" onClick={downloadFeedback}>
                    <Download className="w-4 h-4" /> <span>Export</span>
                  </button>
                  <button className="fb-header-btn" onClick={analyzeInterview}>
                    <RefreshCw className="w-4 h-4" /> <span>Re-analyze</span>
                  </button>
                </>
              )}
              <button className="fb-close-btn" onClick={onClose}>✕</button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="fb-content">

          {/* Start State */}
          {!analysisComplete && !isAnalyzing && (
            <div className="fb-start-state">
              <div className="fb-start-icon">
                <Sparkles className="w-9 h-9 text-indigo-500" />
              </div>
              <h3 className="fb-start-title">Ready for Your AI Analysis?</h3>
              <p className="fb-start-desc">
                Our AI will evaluate your communication, technical depth, behavioral
                responses, and provide a personalized improvement plan.
              </p>
              <button className="fb-start-btn" onClick={analyzeInterview}>
                <Sparkles className="w-4 h-4" /> Start Analysis
              </button>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="fb-loading">
              <div className="fb-loading-spinner" />
              <p className="fb-loading-text">Analyzing your interview...</p>
              <p className="fb-loading-sub">
                Evaluating communication, technical skills, and behavioral responses
              </p>
              <div className="fb-loading-dots">
                <div className="fb-loading-dot" />
                <div className="fb-loading-dot" />
                <div className="fb-loading-dot" />
              </div>
            </div>
          )}

          {/* Results */}
          {analysisComplete && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── Overall Score Hero ── */}
              <div className="fb-score-hero">
                <div className="fb-score-ring-wrap">
                  <svg className="fb-score-ring-svg" viewBox="0 0 120 120">
                    <circle className="fb-score-ring-bg" cx="60" cy="60" r="52" />
                    <circle
                      className="fb-score-ring-fill"
                      cx="60" cy="60" r="52"
                      stroke={ringColor.stroke}
                      strokeDasharray={`${(overallScore / 10) * circumference} ${circumference}`}
                      style={{ "--ring-glow": ringColor.glow } as React.CSSProperties}
                    />
                  </svg>
                  <div className="fb-score-value">
                    <span className="fb-score-number">{animatedScore}</span>
                    <span className="fb-score-label">out of 10</span>
                  </div>
                </div>
                <div className="fb-score-info">
                  <h3 className="fb-score-title">Overall Performance</h3>
                  <p className="fb-score-desc">
                    {overallScore >= 8
                      ? "Outstanding interview performance. You demonstrated exceptional depth and clarity across all dimensions."
                      : overallScore >= 6
                        ? "Solid performance with clear strengths. Targeted practice in specific areas will accelerate your growth."
                        : "A promising foundation to build on. Focus on the improvement areas below and you'll see meaningful progress."}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className={`fb-status-badge ${status.cls}`}>
                      {overallScore >= 8 ? <Star className="w-3.5 h-3.5" /> : overallScore >= 6 ? <TrendingUp className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                      {status.label}
                    </span>
                    {overallAnalysisExtra.hireSignal && (
                      <span className="fb-status-badge fb-status-excellent" style={{ background: "rgba(99,102,241,0.08)", color: "#4f46e5", borderColor: "rgba(99,102,241,0.15)" }}>
                        <Target className="w-3.5 h-3.5" />
                        {overallAnalysisExtra.hireSignal}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Mini Score Cards ── */}
              {feedbackSections.filter(s => s.score).length > 0 && (
                <div className="fb-mini-scores">
                  {feedbackSections.filter(s => s.score).map(section => (
                    <div key={section.id} className="fb-mini-card" onClick={() => toggleSection(section.id)}>
                      <div className="fb-mini-card-label">{section.title}</div>
                      <div className={`fb-mini-card-value ${getScoreColor(section.score || 0)}`}>
                        {section.score}
                      </div>
                      <div className="fb-mini-card-sub">out of 10</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Feedback Section Cards (Expandable) ── */}
              <div className="fb-sections-grid">
                {feedbackSections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  return (
                    <div key={section.id} className="fb-card">
                      <div className="fb-card-header" onClick={() => toggleSection(section.id)}>
                        <div className="fb-card-header-left">
                          <div className={`fb-card-icon ${getCardIconClass(section.id)}`}>
                            {section.icon}
                          </div>
                          <span className="fb-card-title">{section.title}</span>
                        </div>
                        <div className="fb-card-header-right">
                          {section.score && (
                            <span className={`fb-card-score ${getScoreBackground(section.score)} ${getScoreColor(section.score)}`}>
                              {section.score}/10
                            </span>
                          )}
                          <ChevronDown className={`fb-card-chevron ${isExpanded ? "expanded" : ""}`} />
                        </div>
                      </div>

                      <div className={`fb-card-body ${isExpanded ? "expanded" : ""}`}>
                        {/* Sub-Score Bars */}
                        {section.subScores && Object.keys(section.subScores).length > 0 && (
                          <div className="fb-subscore-grid">
                            {Object.entries(section.subScores).map(([key, value]) => (
                              <div key={key} className="fb-subscore-row">
                                <span className="fb-subscore-label">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <div className="fb-subscore-bar">
                                  <div
                                    className={`fb-subscore-fill ${getSubScoreClass(value)}`}
                                    style={{ width: isExpanded ? `${(value / 10) * 100}%` : "0%" }}
                                  />
                                </div>
                                <span className="fb-subscore-value">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content */}
                        <p className="fb-card-text">{section.content}</p>

                        {/* Strength Tags */}
                        {section.strengths && section.strengths.length > 0 && (
                          <div className="fb-tags">
                            {section.strengths.map((s, i) => (
                              <span key={i} className="fb-tag fb-tag-green">✓ {s}</span>
                            ))}
                          </div>
                        )}

                        {/* Weakness Tags */}
                        {section.weaknesses && section.weaknesses.length > 0 && (
                          <div className="fb-tags">
                            {section.weaknesses.map((w, i) => (
                              <span key={i} className="fb-tag fb-tag-amber">△ {w}</span>
                            ))}
                          </div>
                        )}

                        {/* Suggestions */}
                        {section.suggestions && section.suggestions.length > 0 && (
                          <div className="fb-suggestions">
                            <div className="fb-suggestions-title">Recommendations</div>
                            {section.suggestions.map((suggestion, index) => (
                              <div key={index} className="fb-suggestion-item">
                                <div className="fb-suggestion-dot" />
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Items */}
                        {section.actionItems && section.actionItems.length > 0 && (
                          <div className="fb-action-box">
                            <div className="fb-action-title">
                              <Zap className="w-3.5 h-3.5" /> Practice Exercises
                            </div>
                            {section.actionItems.map((item, index) => (
                              <div key={index} className="fb-action-item">
                                <span className="fb-action-num">{index + 1}</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── 90-Day Roadmap ── */}
              {overallAnalysisExtra.improvementRoadmap && overallAnalysisExtra.improvementRoadmap.length > 0 && (
                <div className="fb-roadmap">
                  <div className="fb-roadmap-title">
                    <Target className="w-5 h-5" style={{ color: "#6366f1" }} />
                    90-Day Improvement Roadmap
                  </div>
                  <div className="fb-roadmap-grid">
                    {overallAnalysisExtra.improvementRoadmap.map((step, i) => (
                      <div key={i} className="fb-roadmap-step">
                        <div className="fb-roadmap-num">{i + 1}</div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Progress & Improvement Journey ── */}
              <div className="fb-journey">
                <div className="fb-journey-title">
                  <Trophy className="w-5 h-5" style={{ color: "#10b981" }} />
                  Progress & Improvement Journey
                </div>

                {improvementData?.isFirstInterview || !improvementData ? (
                  <div className="fb-journey-empty">
                    <div className="fb-journey-empty-icon">
                      <Star className="w-7 h-7" style={{ color: "#10b981" }} />
                    </div>
                    <p className="fb-journey-empty-title">Welcome! This is your first recorded interview.</p>
                    <p className="fb-journey-empty-desc">
                      Complete more interviews to see your progress tracked here with score
                      comparisons, trend analysis, and improvement narratives.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <span className={`fb-trend-badge ${improvementData.overallTrend === "improving" ? "fb-trend-up"
                        : improvementData.overallTrend === "declining" ? "fb-trend-down"
                          : "fb-trend-stable"
                        }`}>
                        {improvementData.overallTrend === "improving" && <><ArrowUp className="w-4 h-4" /> Trending Up</>}
                        {improvementData.overallTrend === "declining" && <><ArrowDown className="w-4 h-4" /> Needs Attention</>}
                        {improvementData.overallTrend === "stable" && <><Minus className="w-4 h-4" /> Holding Steady</>}
                      </span>
                    </div>

                    <div className="fb-delta-grid">
                      {improvementData.aspects.map((aspect) => (
                        <div key={aspect.name} className="fb-delta-card">
                          <div className="fb-delta-name">{aspect.name}</div>
                          <div className="fb-delta-value">{Math.round(aspect.current)}</div>
                          <div className={`fb-delta-change ${aspect.delta > 0 ? "text-green-600" : aspect.delta < 0 ? "text-red-600" : "text-gray-500"
                            }`}>
                            {aspect.delta > 0 && <ArrowUp className="w-3 h-3" />}
                            {aspect.delta < 0 && <ArrowDown className="w-3 h-3" />}
                            {aspect.delta === 0 && <Minus className="w-3 h-3" />}
                            {aspect.delta > 0 ? "+" : ""}{Math.round(aspect.delta)}
                          </div>
                          <div className="fb-delta-avg">avg: {Math.round(aspect.average)}</div>
                        </div>
                      ))}
                    </div>

                    {overallAnalysisExtra.progressAnalysis && (
                      <div className="fb-narrative">
                        <div className="fb-narrative-title">
                          <Lightbulb className="w-4 h-4" style={{ color: "#f59e0b" }} />
                          AI Progress Analysis
                        </div>
                        <p className="fb-narrative-text">{overallAnalysisExtra.progressAnalysis}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
