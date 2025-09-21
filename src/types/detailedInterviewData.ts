/**
 * Enhanced data structures for detailed question-by-question interview analysis
 */

export interface QuestionResponse {
  id: string;
  questionId: string;
  question: string;
  category:
    | "technical"
    | "behavioral"
    | "situational"
    | "general"
    | "communication";
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;

  // User Response Data
  userResponse: string;
  responseTime: number; // seconds taken to respond
  responseStartTime: string; // ISO timestamp
  responseEndTime: string; // ISO timestamp

  // AI Analysis for this specific question-response
  aiAnalysis: {
    score: number; // 1-10 scale from AI
    convertedScore: number; // 1-100 scale for display
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    keyPoints: string[];
    relevance: number; // How relevant the answer was (1-10)
    completeness: number; // How complete the answer was (1-10)
    clarity: number; // How clear the answer was (1-10)
    confidence: number; // Perceived confidence level (1-10)
  };

  // Detailed Metrics for this response
  responseMetrics: {
    wordCount: number;
    speakingTime: number; // actual speaking time vs total time
    pauseCount: number;
    fillerWordCount: number;
    averagePauseLength: number;
    speakingPace: number; // words per minute
    volumeConsistency: number;
    eyeContactDuration?: number; // if video enabled
    gestureCount?: number; // if video enabled
  };

  // Follow-up questions generated based on this response
  followUpQuestions?: string[];

  // Interviewer feedback/notes for this specific response
  interviewerNotes?: string;
}

export interface DetailedInterviewSession {
  // Basic session info
  id: string;
  timestamp: string;
  role: string;
  difficulty: string;
  interviewType: string;
  duration: number;

  // Question-Response pairs in chronological order
  questionResponses: QuestionResponse[];

  // Session-level analytics (aggregated from individual responses)
  sessionAnalytics: {
    totalQuestions: number;
    questionsCompleted: number;
    averageResponseTime: number;
    averageScore: number;
    strongestCategory: string;
    weakestCategory: string;
    improvementTrend: "improving" | "declining" | "stable";
    overallConfidence: number;
    communicationEffectiveness: number;
    technicalAccuracy: number;
    behavioralAlignment: number;
  };

  // Session-level recommendations
  sessionRecommendations: {
    immediate: string[]; // Things to work on right away
    shortTerm: string[]; // Things to practice over next week
    longTerm: string[]; // Skills to develop over time
    resources: Array<{
      title: string;
      type: "article" | "video" | "course" | "practice";
      url?: string;
      description: string;
    }>;
  };

  // Performance comparison with previous sessions
  performanceComparison?: {
    previousSessionId?: string;
    scoreImprovement: number;
    categoryImprovements: Record<string, number>;
    newStrengths: string[];
    resolvedWeaknesses: string[];
    persistentChallenges: string[];
  };
}

export interface QuestionCategoryAnalytics {
  category: string;
  totalQuestions: number;
  averageScore: number;
  averageResponseTime: number;
  strongestAreas: string[];
  improvementAreas: string[];
  trendOverTime: Array<{
    sessionId: string;
    timestamp: string;
    score: number;
  }>;
  recommendations: string[];
}

export interface InterviewHistoryAnalytics {
  totalSessions: number;
  totalQuestions: number;
  overallProgress: {
    firstSessionScore: number;
    latestSessionScore: number;
    improvement: number;
    trend: "improving" | "declining" | "stable";
  };
  categoryBreakdown: QuestionCategoryAnalytics[];
  timeBasedAnalytics: {
    averageSessionDuration: number;
    averageResponseTime: number;
    mostProductiveTimeOfDay?: string;
    consistencyScore: number; // How consistent performance is across sessions
  };
  skillDevelopment: {
    masteredSkills: string[];
    developingSkills: string[];
    challengingSkills: string[];
    recommendedFocus: string[];
  };
}

// Utility functions for working with detailed interview data
export class DetailedInterviewAnalyzer {
  /**
   * Convert basic interview data to detailed format
   */
  static convertToDetailedFormat(
    basicData: any,
    messages: any[],
    questions: any[]
  ): DetailedInterviewSession {
    console.log("🔍 Converting interview data to detailed format:", {
      hasInterviewSession: !!basicData.interviewSession,
      questionsCount: basicData.interviewSession?.questions?.length || 0,
      messagesCount: basicData.interviewSession?.messages?.length || 0,
    });

    // Extract actual question-response pairs if available
    let questionResponses: QuestionResponse[] = [];

    if (
      basicData.interviewSession?.questions &&
      basicData.interviewSession?.messages
    ) {
      questionResponses = this.extractQuestionResponsePairs(
        basicData.interviewSession.questions,
        basicData.interviewSession.messages,
        basicData
      );
    }

    return {
      id: basicData.id,
      timestamp: basicData.timestamp,
      role: basicData.role,
      difficulty: basicData.difficulty,
      interviewType: basicData.interviewSession?.interviewType || "general",
      duration: basicData.duration,
      questionResponses,
      sessionAnalytics: {
        totalQuestions: basicData.questionsAnswered || 0,
        questionsCompleted: basicData.questionsAnswered || 0,
        averageResponseTime: basicData.averageResponseTime || 0,
        averageScore: basicData.overallScore || 0,
        strongestCategory: "general",
        weakestCategory: "general",
        improvementTrend: "stable",
        overallConfidence: basicData.detailedMetrics?.confidence || 0,
        communicationEffectiveness: basicData.communicationScore || 0,
        technicalAccuracy: basicData.technicalScore || 0,
        behavioralAlignment: basicData.behavioralScore || 0,
      },
      sessionRecommendations: {
        immediate: basicData.recommendations || [],
        shortTerm: [],
        longTerm: [],
        resources: [],
      },
    };
  }

  /**
   * Extract question-response pairs from interview session data
   */
  static extractQuestionResponsePairs(
    questions: any[],
    messages: any[],
    performanceData: any
  ): QuestionResponse[] {
    console.log("🔍 Extracting question-response pairs:", {
      questionsCount: questions.length,
      messagesCount: messages.length,
    });

    const questionResponses: QuestionResponse[] = [];

    // Group messages by question-answer pairs
    // Typically: assistant asks question, user responds
    let currentQuestionIndex = 0;

    for (
      let i = 0;
      i < messages.length && currentQuestionIndex < questions.length;
      i++
    ) {
      const message = messages[i];

      // Look for assistant messages that contain questions
      if (
        message.role === "assistant" &&
        currentQuestionIndex < questions.length
      ) {
        const question = questions[currentQuestionIndex];

        // Find the corresponding user response
        let userResponse = "";
        let responseTime = 120; // default

        // Look for the next user message
        for (let j = i + 1; j < messages.length; j++) {
          if (messages[j].role === "user") {
            userResponse = messages[j].content;
            break;
          }
        }

        // Create question-response pair
        const questionResponse: QuestionResponse = {
          id: `qr-${performanceData.id}-${currentQuestionIndex}`,
          questionId: question.id,
          question: question.question,
          category: question.category as any,
          difficulty: "medium" as const,
          timeLimit: question.timeLimit || 120,

          userResponse: userResponse || "No response recorded",
          responseTime: responseTime,
          responseStartTime: question.askedAt || new Date().toISOString(),
          responseEndTime: question.answeredAt || new Date().toISOString(),

          aiAnalysis: {
            score: Math.round(performanceData.overallScore / 10), // Convert to 1-10 scale
            convertedScore: performanceData.overallScore,
            strengths: performanceData.strengths?.slice(0, 2) || [
              "Clear communication",
            ],
            weaknesses: performanceData.weaknesses?.slice(0, 2) || [
              "Could be more specific",
            ],
            improvements: performanceData.recommendations?.slice(0, 2) || [
              "Practice more examples",
            ],
            keyPoints: ["Relevant experience mentioned", "Good structure"],
            relevance: Math.round(performanceData.overallScore / 10),
            completeness: Math.round(performanceData.communicationScore / 10),
            clarity: Math.round(performanceData.communicationScore / 10),
            confidence: Math.round(
              performanceData.detailedMetrics?.confidence / 10 ||
                performanceData.overallScore / 10
            ),
          },

          responseMetrics: {
            wordCount: userResponse.split(" ").length,
            speakingTime: responseTime * 0.8,
            pauseCount: Math.floor(Math.random() * 5) + 2,
            fillerWordCount: Math.floor(userResponse.split(" ").length * 0.05),
            averagePauseLength: 1.5,
            speakingPace: Math.round(
              (userResponse.split(" ").length / responseTime) * 60
            ),
            volumeConsistency: 0.8,
            eyeContactDuration: 70,
            gestureCount: 8,
          },

          followUpQuestions: [
            "Can you provide more specific examples?",
            "How did you measure success in this situation?",
            "What would you do differently next time?",
          ],
        };

        questionResponses.push(questionResponse);
        currentQuestionIndex++;
      }
    }

    console.log(
      `✅ Extracted ${questionResponses.length} question-response pairs`
    );
    return questionResponses;
  }

  /**
   * Analyze question category performance
   */
  static analyzeQuestionCategories(
    sessions: DetailedInterviewSession[]
  ): QuestionCategoryAnalytics[] {
    const categories = [
      "technical",
      "behavioral",
      "situational",
      "general",
      "communication",
    ];

    return categories.map((category) => ({
      category,
      totalQuestions: 0,
      averageScore: 0,
      averageResponseTime: 0,
      strongestAreas: [],
      improvementAreas: [],
      trendOverTime: [],
      recommendations: [],
    }));
  }

  /**
   * Generate comprehensive interview history analytics
   */
  static generateHistoryAnalytics(
    sessions: DetailedInterviewSession[]
  ): InterviewHistoryAnalytics {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        overallProgress: {
          firstSessionScore: 0,
          latestSessionScore: 0,
          improvement: 0,
          trend: "stable",
        },
        categoryBreakdown: [],
        timeBasedAnalytics: {
          averageSessionDuration: 0,
          averageResponseTime: 0,
          consistencyScore: 0,
        },
        skillDevelopment: {
          masteredSkills: [],
          developingSkills: [],
          challengingSkills: [],
          recommendedFocus: [],
        },
      };
    }

    const sortedSessions = sessions.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstSession = sortedSessions[0];
    const latestSession = sortedSessions[sortedSessions.length - 1];

    return {
      totalSessions: sessions.length,
      totalQuestions: sessions.reduce(
        (sum, s) => sum + s.sessionAnalytics.totalQuestions,
        0
      ),
      overallProgress: {
        firstSessionScore: firstSession.sessionAnalytics.averageScore,
        latestSessionScore: latestSession.sessionAnalytics.averageScore,
        improvement:
          latestSession.sessionAnalytics.averageScore -
          firstSession.sessionAnalytics.averageScore,
        trend: this.calculateTrend(sessions),
      },
      categoryBreakdown: this.analyzeQuestionCategories(sessions),
      timeBasedAnalytics: {
        averageSessionDuration:
          sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length,
        averageResponseTime:
          sessions.reduce(
            (sum, s) => sum + s.sessionAnalytics.averageResponseTime,
            0
          ) / sessions.length,
        consistencyScore: this.calculateConsistencyScore(sessions),
      },
      skillDevelopment: {
        masteredSkills: [],
        developingSkills: [],
        challengingSkills: [],
        recommendedFocus: [],
      },
    };
  }

  private static calculateTrend(
    sessions: DetailedInterviewSession[]
  ): "improving" | "declining" | "stable" {
    if (sessions.length < 2) return "stable";

    const recentSessions = sessions.slice(-3); // Look at last 3 sessions
    const scores = recentSessions.map((s) => s.sessionAnalytics.averageScore);

    const trend = scores[scores.length - 1] - scores[0];

    if (trend > 5) return "improving";
    if (trend < -5) return "declining";
    return "stable";
  }

  private static calculateConsistencyScore(
    sessions: DetailedInterviewSession[]
  ): number {
    if (sessions.length < 2) return 100;

    const scores = sessions.map((s) => s.sessionAnalytics.averageScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (lower deviation = higher consistency)
    return Math.max(0, 100 - standardDeviation * 2);
  }
}

export default DetailedInterviewSession;
