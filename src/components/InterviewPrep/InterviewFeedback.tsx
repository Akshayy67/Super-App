import React, { useState } from "react";
import {
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Star,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { aiService } from "../../utils/aiService";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";

interface FeedbackSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: string;
  score?: number;
  suggestions?: string[];
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
            `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${
              msg.content
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

      // Create feedback sections
      const sections: FeedbackSection[] = [
        {
          id: "communication",
          title: "Communication Skills",
          icon: <MessageSquare className="w-6 h-6" />,
          color: "text-blue-600",
          content: communicationAnalysis.content,
          score: communicationAnalysis.score,
          suggestions: communicationAnalysis.suggestions,
        },
        {
          id: "technical",
          title: "Technical Knowledge",
          icon: <TrendingUp className="w-6 h-6" />,
          color: "text-green-600",
          content: technicalAnalysis.content,
          score: technicalAnalysis.score,
          suggestions: technicalAnalysis.suggestions,
        },
        {
          id: "behavioral",
          title: "Behavioral Responses",
          icon: <Star className="w-6 h-6" />,
          color: "text-purple-600",
          content: behavioralAnalysis.content,
          score: behavioralAnalysis.score,
          suggestions: behavioralAnalysis.suggestions,
        },
        {
          id: "improvements",
          title: "Areas for Improvement",
          icon: <AlertTriangle className="w-6 h-6" />,
          color: "text-orange-600",
          content: overallAnalysis.improvements,
          suggestions: overallAnalysis.improvementSuggestions,
        },
        {
          id: "strengths",
          title: "Key Strengths",
          icon: <Lightbulb className="w-6 h-6" />,
          color: "text-yellow-600",
          content: overallAnalysis.strengths,
          suggestions: overallAnalysis.strengthSuggestions,
        },
      ];

      setFeedbackSections(sections);
      setOverallScore(overallAnalysis.overallScore);
      setAnalysisComplete(true);

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
    } catch (error) {
      console.error("Error analyzing interview:", error);
      // Fallback feedback
      setFeedbackSections([
        {
          id: "error",
          title: "Analysis Error",
          icon: <AlertTriangle className="w-6 h-6" />,
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
        content: `Your communication score is ${
          performanceData.communicationScore
        }/100. ${
          performanceData.communicationScore >= 80
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
        content: `Your technical score is ${
          performanceData.technicalScore
        }/100. ${
          performanceData.technicalScore >= 80
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
        content: `Your behavioral score is ${
          performanceData.behavioralScore
        }/100. ${
          performanceData.bodyLanguageAnalysis.eyeContact.score >= 70
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
        content: `Overall performance: ${performanceData.overallScore}/100. ${
          performanceData.overallScore >= 80
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
  };

  const analyzeCommunication = async (
    conversation: string,
    role: string,
    difficulty: string
  ) => {
    const prompt = `Analyze the communication skills demonstrated in this interview conversation for a ${difficulty} level ${role} position.

Conversation:
${conversation}

Focus on:
1. Clarity and articulation
2. Professional language usage
3. Response structure and organization
4. Active listening and engagement
5. Confidence and poise

Provide:
- A score out of 10
- 2-3 specific observations about communication
- 2-3 actionable suggestions for improvement

Format as JSON:
{
  "score": number,
  "content": "detailed analysis text",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const response = await aiService.generateResponse(prompt);
    if (response.success && response.data) {
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse communication analysis:", e);
      }
    }

    return {
      score: 7,
      content:
        "Communication analysis could not be completed. Please check your AI configuration.",
      suggestions: [
        "Ensure clear articulation",
        "Practice professional language",
        "Structure responses better",
      ],
    };
  };

  const analyzeTechnicalSkills = async (
    conversation: string,
    role: string,
    difficulty: string
  ) => {
    const prompt = `Analyze the technical knowledge and skills demonstrated in this interview conversation for a ${difficulty} level ${role} position.

Conversation:
${conversation}

Focus on:
1. Technical knowledge depth
2. Problem-solving approach
3. Relevant experience demonstration
4. Technical terminology usage
5. Learning ability and adaptability

Provide:
- A score out of 10
- 2-3 specific observations about technical skills
- 2-3 actionable suggestions for improvement

Format as JSON:
{
  "score": number,
  "content": "detailed analysis text",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const response = await aiService.generateResponse(prompt);
    if (response.success && response.data) {
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse technical analysis:", e);
      }
    }

    return {
      score: 7,
      content:
        "Technical skills analysis could not be completed. Please check your AI configuration.",
      suggestions: [
        "Deepen technical knowledge",
        "Practice problem-solving",
        "Demonstrate more experience",
      ],
    };
  };

  const analyzeBehavioralAspects = async (
    conversation: string,
    role: string,
    difficulty: string
  ) => {
    const prompt = `Analyze the behavioral responses and soft skills demonstrated in this interview conversation for a ${difficulty} level ${role} position.

Conversation:
${conversation}

Focus on:
1. STAR method usage
2. Specific examples provided
3. Problem-solving approach
4. Teamwork and collaboration
5. Adaptability and learning

Provide:
- A score out of 10
- 2-3 specific observations about behavioral responses
- 2-3 actionable suggestions for improvement

Format as JSON:
{
  "score": number,
  "content": "detailed analysis text",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const response = await aiService.generateResponse(prompt);
    if (response.success && response.data) {
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse behavioral analysis:", e);
      }
    }

    return {
      score: 7,
      content:
        "Behavioral analysis could not be completed. Please check your AI configuration.",
      suggestions: [
        "Use STAR method",
        "Provide specific examples",
        "Show problem-solving process",
      ],
    };
  };

  const analyzeOverallPerformance = async (
    conversation: string,
    role: string,
    difficulty: string,
    interviewType: string
  ) => {
    const prompt = `Provide a comprehensive overall analysis of this interview performance for a ${difficulty} level ${role} position.

Interview Type: ${interviewType}
Conversation:
${conversation}

Provide:
1. Overall score out of 10
2. Key strengths demonstrated
3. Areas that need improvement
4. Specific suggestions for each area
5. Overall assessment and recommendations

Format as JSON:
{
  "overallScore": number,
  "strengths": "detailed strengths text",
  "improvements": "detailed improvements text",
  "strengthSuggestions": ["suggestion1", "suggestion2"],
  "improvementSuggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const response = await aiService.generateResponse(prompt);
    if (response.success && response.data) {
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse overall analysis:", e);
      }
    }

    return {
      overallScore: 7,
      strengths:
        "Overall analysis could not be completed. Please check your AI configuration.",
      improvements: "Unable to provide specific improvement areas.",
      strengthSuggestions: [
        "Focus on your strengths",
        "Build on positive aspects",
      ],
      improvementSuggestions: [
        "Practice regularly",
        "Seek feedback",
        "Work on identified areas",
      ],
    };
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

${
  section.suggestions && section.suggestions.length > 0
    ? `Suggestions:
${section.suggestions.map((s) => `- ${s}`).join("\n")}`
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
    a.download = `interview-feedback-${role}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Interview Feedback Analysis
              </h2>
              <p className="text-blue-100 mt-1">
                {role} • {interviewType} • {difficulty} level
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {analysisComplete && (
                <>
                  <button
                    onClick={downloadFeedback}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={analyzeInterview}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-analyze</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!analysisComplete && !isAnalyzing && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Ready to Analyze Your Interview?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Get comprehensive feedback on your communication, technical
                skills, behavioral responses, and areas for improvement.
              </p>
              <button
                onClick={analyzeInterview}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Analysis
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Analyzing Your Interview...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI is carefully reviewing your responses across multiple
                dimensions.
              </p>
            </div>
          )}

          {analysisComplete && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-gray-200 dark:border-slate-600">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Overall Performance Score
                  </h3>
                  <div
                    className={`inline-flex items-center justify-center w-24 h-24 ${getScoreBackground(
                      overallScore
                    )} rounded-full mb-4`}
                  >
                    <span
                      className={`text-3xl font-bold ${getScoreColor(
                        overallScore
                      )}`}
                    >
                      {overallScore}/10
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {overallScore >= 8
                      ? "Excellent performance!"
                      : overallScore >= 6
                      ? "Good performance with room for improvement"
                      : "Performance needs improvement"}
                  </p>
                </div>
              </div>

              {/* Feedback Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {feedbackSections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white dark:bg-slate-700 rounded-2xl p-6 border border-gray-200 dark:border-slate-600 shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div
                        className={`w-10 h-10 ${section.color} bg-gray-100 dark:bg-slate-600 rounded-xl flex items-center justify-center`}
                      >
                        {section.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {section.title}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {section.content}
                      </p>

                      {section.score && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Score:
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBackground(
                              section.score
                            )} ${getScoreColor(section.score)}`}
                          >
                            {section.score}/10
                          </span>
                        </div>
                      )}

                      {section.suggestions &&
                        section.suggestions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Suggestions:
                            </h5>
                            <ul className="space-y-1">
                              {section.suggestions.map((suggestion, index) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                                >
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Items */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Next Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-green-200 dark:border-green-700">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Immediate Actions
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Review the feedback thoroughly</li>
                      <li>• Practice identified weak areas</li>
                      <li>• Record yourself answering similar questions</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-green-200 dark:border-green-700">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Long-term Development
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Schedule regular practice sessions</li>
                      <li>• Seek feedback from mentors</li>
                      <li>• Track your progress over time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
