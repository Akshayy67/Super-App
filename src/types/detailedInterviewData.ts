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
    // Use passed parameters first, fall back to basicData.interviewSession
    const effectiveMessages =
      messages.length > 0
        ? messages
        : basicData.interviewSession?.messages || [];
    const effectiveQuestions =
      questions.length > 0
        ? questions
        : basicData.interviewSession?.questions || [];

    console.log("🔍 Converting interview data to detailed format:", {
      hasInterviewSession: !!basicData.interviewSession,
      questionsCount: effectiveQuestions.length,
      messagesCount: effectiveMessages.length,
    });

    // Extract actual question-response pairs if available
    let questionResponses: QuestionResponse[] = [];

    if (effectiveQuestions.length > 0 && effectiveMessages.length > 0) {
      questionResponses = this.extractQuestionResponsePairs(
        effectiveQuestions,
        effectiveMessages,
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
   * Normalize text for fuzzy matching (lowercase, collapse whitespace, trim)
   */
  private static normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  }

  /**
   * Check if an assistant message contains a given question text (fuzzy match).
   * Uses normalized substring matching.
   */
  private static messageContainsQuestion(
    messageContent: string,
    questionText: string
  ): boolean {
    const normMsg = this.normalizeText(messageContent);
    const normQ = this.normalizeText(questionText);

    // Direct substring match
    if (normMsg.includes(normQ)) return true;

    // Try matching a significant portion (first 60 chars) for long questions
    // that might be slightly rephrased by the AI
    if (normQ.length > 40) {
      const prefix = normQ.slice(0, 60);
      if (normMsg.includes(prefix)) return true;
    }

    // Word-overlap check: if ≥ 70% of question words appear in the message
    const qWords = normQ.split(" ").filter((w) => w.length > 3);
    if (qWords.length > 0) {
      const matchCount = qWords.filter((w) => normMsg.includes(w)).length;
      if (matchCount / qWords.length >= 0.7) return true;
    }

    return false;
  }

  /**
   * Derive a per-question score from the actual answer content,
   * using the overall session scores as a baseline but varying by answer quality.
   */
  private static derivePerQuestionScore(
    userResponse: string,
    baseScore: number,
    questionText: string
  ): {
    score: number;
    convertedScore: number;
    relevance: number;
    completeness: number;
    clarity: number;
    confidence: number;
  } {
    const words = userResponse.trim().split(/\s+/);
    const wordCount = words.length;

    // Depth indicators: sentences, specific keywords, examples
    const sentenceCount = (userResponse.match(/[.!?]+/g) || []).length;
    const hasExamples =
      /for example|for instance|such as|like when|in my experience/i.test(
        userResponse
      );
    const hasStructure = /first|second|third|additionally|moreover|however/i.test(
      userResponse
    );
    const hasMetrics = /\d+%|\d+ percent|increased|decreased|improved|reduced/i.test(
      userResponse
    );

    // Question word overlap → relevance
    const qWords = questionText
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const answerLower = userResponse.toLowerCase();
    const relevantWordHits = qWords.filter((w) => answerLower.includes(w)).length;
    const relevanceRatio = qWords.length > 0 ? relevantWordHits / qWords.length : 0.5;

    // Scale factor: -2 to +2 from base score, based on quality
    let qualityDelta = 0;
    if (wordCount < 10) qualityDelta -= 2;
    else if (wordCount < 30) qualityDelta -= 1;
    else if (wordCount > 100) qualityDelta += 1;
    if (hasExamples) qualityDelta += 0.5;
    if (hasStructure) qualityDelta += 0.5;
    if (hasMetrics) qualityDelta += 0.5;
    if (sentenceCount >= 3) qualityDelta += 0.5;

    const base10 = Math.round(baseScore / 10); // convert 0-100 to 1-10 scale
    const raw = Math.max(1, Math.min(10, base10 + qualityDelta));
    const score = Math.round(raw * 10) / 10;
    const convertedScore = Math.round(score * 10);

    const relevance = Math.max(1, Math.min(10, Math.round(relevanceRatio * 10 + qualityDelta * 0.5)));
    const completeness = Math.max(
      1,
      Math.min(10, Math.round(base10 + (sentenceCount >= 3 ? 1 : -1) + (wordCount > 50 ? 1 : 0)))
    );
    const clarity = Math.max(
      1,
      Math.min(10, Math.round(base10 + (hasStructure ? 1 : 0) + (wordCount < 15 ? -1 : 0)))
    );
    const confidence = Math.max(
      1,
      Math.min(10, Math.round(base10 + (hasExamples ? 1 : 0) + (hasMetrics ? 1 : -0.5)))
    );

    return { score, convertedScore, relevance, completeness, clarity, confidence };
  }

  /**
   * Extract question-response pairs from interview session data.
   *
   * Uses content-based matching: for each question in the questions list,
   * finds the assistant message that contains the question text, then collects
   * ALL user messages between that point and the next question as the full answer.
   * This ensures multi-turn exchanges (follow-ups, clarifications) within one
   * question are properly grouped.
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

    if (questions.length === 0 || messages.length === 0) {
      console.log("⚠️ No questions or messages to extract pairs from");
      return [];
    }

    const questionResponses: QuestionResponse[] = [];

    // Step 1: For each question, find the assistant message index that contains it
    const questionMessageMap: { questionIdx: number; messageIdx: number }[] = [];

    for (let qi = 0; qi < questions.length; qi++) {
      const questionText = questions[qi].question || "";
      let bestMsgIdx = -1;

      // Search messages for one that contains this question
      for (let mi = 0; mi < messages.length; mi++) {
        if (
          messages[mi].role === "assistant" &&
          this.messageContainsQuestion(messages[mi].content || "", questionText)
        ) {
          // Ensure we haven't already mapped a different question to this message
          const alreadyUsed = questionMessageMap.some(
            (m) => m.messageIdx === mi
          );
          if (!alreadyUsed) {
            bestMsgIdx = mi;
            break;
          }
        }
      }

      if (bestMsgIdx !== -1) {
        questionMessageMap.push({ questionIdx: qi, messageIdx: bestMsgIdx });
      }
    }

    // Sort by message index so we process in conversation order
    questionMessageMap.sort((a, b) => a.messageIdx - b.messageIdx);

    console.log(
      `📋 Matched ${questionMessageMap.length}/${questions.length} questions to assistant messages`
    );

    // If content-based matching found nothing, fall back to sequential order
    if (questionMessageMap.length === 0) {
      console.log("⚠️ Content-based matching failed, falling back to sequential");
      let currentQuestionIndex = 0;
      for (let i = 0; i < messages.length && currentQuestionIndex < questions.length; i++) {
        if (messages[i].role === "assistant") {
          questionMessageMap.push({
            questionIdx: currentQuestionIndex,
            messageIdx: i,
          });
          currentQuestionIndex++;
        }
      }
      questionMessageMap.sort((a, b) => a.messageIdx - b.messageIdx);
    }

    // Step 2: For each matched question, collect all user messages until the next question
    for (let k = 0; k < questionMessageMap.length; k++) {
      const { questionIdx, messageIdx } = questionMessageMap[k];
      const question = questions[questionIdx];

      // Determine the boundary: next question's assistant message index, or end of messages
      const nextBoundary =
        k + 1 < questionMessageMap.length
          ? questionMessageMap[k + 1].messageIdx
          : messages.length;

      // Collect ALL user messages between this question and the next
      const userResponses: string[] = [];
      for (let mi = messageIdx + 1; mi < nextBoundary; mi++) {
        if (messages[mi].role === "user" && messages[mi].content?.trim()) {
          userResponses.push(messages[mi].content.trim());
        }
      }

      const fullResponse = userResponses.join("\n\n");
      const wordCount = fullResponse ? fullResponse.split(/\s+/).length : 0;

      // Calculate per-question scores based on actual answer quality
      const scores = this.derivePerQuestionScore(
        fullResponse,
        performanceData.overallScore || 50,
        question.question || ""
      );

      // Estimate response time from timestamps if available, else use word-based estimate
      let responseTime = 120;
      if (question.askedAt && question.answeredAt) {
        const asked = new Date(question.askedAt).getTime();
        const answered = new Date(question.answeredAt).getTime();
        if (answered > asked) {
          responseTime = Math.round((answered - asked) / 1000);
        }
      } else if (wordCount > 0) {
        // Estimate: ~130 words per minute speaking pace
        responseTime = Math.max(10, Math.round((wordCount / 130) * 60));
      }

      const questionResponse: QuestionResponse = {
        id: `qr-${performanceData.id}-${questionIdx}`,
        questionId: question.id || `q_${questionIdx}`,
        question: question.question || "Question not available",
        category: (question.category as any) || "general",
        difficulty: "medium" as const,
        timeLimit: question.timeLimit || 120,

        userResponse: fullResponse || "No response recorded",
        responseTime,
        responseStartTime: question.askedAt || new Date().toISOString(),
        responseEndTime: question.answeredAt || new Date().toISOString(),

        aiAnalysis: {
          score: scores.score,
          convertedScore: scores.convertedScore,
          strengths: this.deriveStrengths(fullResponse, performanceData),
          weaknesses: this.deriveWeaknesses(fullResponse, performanceData),
          improvements: this.deriveImprovements(fullResponse, performanceData),
          keyPoints: this.extractKeyPoints(fullResponse),
          relevance: scores.relevance,
          completeness: scores.completeness,
          clarity: scores.clarity,
          confidence: scores.confidence,
        },

        responseMetrics: {
          wordCount,
          speakingTime: responseTime * 0.8,
          pauseCount: Math.max(1, Math.floor(wordCount / 25)),
          fillerWordCount: this.countFillerWords(fullResponse),
          averagePauseLength: 1.5,
          speakingPace:
            responseTime > 0 ? Math.round((wordCount / responseTime) * 60) : 0,
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
    }

    console.log(
      `✅ Extracted ${questionResponses.length} question-response pairs`
    );
    return questionResponses;
  }

  /**
   * Derive per-question strengths from the actual answer text
   */
  private static deriveStrengths(
    response: string,
    performanceData: any
  ): string[] {
    const strengths: string[] = [];
    if (!response || response === "No response recorded") {
      return performanceData.strengths?.slice(0, 2) || ["Attempted the question"];
    }

    const words = response.split(/\s+/).length;
    if (words > 50) strengths.push("Provided a detailed response");
    if (/for example|for instance|such as/i.test(response))
      strengths.push("Included concrete examples");
    if (/first|second|third|additionally/i.test(response))
      strengths.push("Well-structured answer");
    if (/\d+%|\d+ percent|increased|decreased/i.test(response))
      strengths.push("Used quantifiable metrics");
    if (/team|collaborated|together/i.test(response))
      strengths.push("Demonstrated teamwork awareness");

    if (strengths.length === 0) strengths.push("Addressed the question directly");
    return strengths.slice(0, 3);
  }

  /**
   * Derive per-question weaknesses from the actual answer text
   */
  private static deriveWeaknesses(
    response: string,
    performanceData: any
  ): string[] {
    const weaknesses: string[] = [];
    if (!response || response === "No response recorded") {
      return ["No response provided"];
    }

    const words = response.split(/\s+/).length;
    if (words < 20) weaknesses.push("Response was quite brief");
    if (!/for example|for instance|such as/i.test(response))
      weaknesses.push("Could include more specific examples");
    if (!/first|second|third|additionally|however/i.test(response))
      weaknesses.push("Could improve answer structure");
    if (!/\d+%|\d+ percent|increased|decreased/i.test(response))
      weaknesses.push("Add quantifiable results for more impact");

    if (weaknesses.length === 0)
      return performanceData.weaknesses?.slice(0, 2) || ["Room for deeper analysis"];
    return weaknesses.slice(0, 3);
  }

  /**
   * Derive per-question improvements from the actual answer text
   */
  private static deriveImprovements(
    response: string,
    _performanceData: any
  ): string[] {
    const improvements: string[] = [];
    if (!response || response === "No response recorded") {
      return ["Practice answering this type of question"];
    }

    const words = response.split(/\s+/).length;
    if (words < 30) improvements.push("Expand your answer with more detail");
    if (!/STAR|situation|task|action|result/i.test(response))
      improvements.push("Try using the STAR method for structured responses");
    if (!/because|reason|led to/i.test(response))
      improvements.push("Explain the reasoning behind your decisions");

    if (improvements.length === 0) improvements.push("Continue practicing to refine your delivery");
    return improvements.slice(0, 3);
  }

  /**
   * Extract key talking points from the response
   */
  private static extractKeyPoints(response: string): string[] {
    if (!response || response === "No response recorded") return [];

    const points: string[] = [];
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 10);

    // Take first 2-3 meaningful sentences as key points
    for (const sentence of sentences.slice(0, 3)) {
      const trimmed = sentence.trim();
      if (trimmed.length > 15 && trimmed.length < 150) {
        points.push(trimmed);
      }
    }

    return points.length > 0 ? points : ["Response provided"];
  }

  /**
   * Count filler words in a response
   */
  private static countFillerWords(response: string): number {
    if (!response) return 0;
    const fillers = /\b(um|uh|like|you know|basically|actually|literally|so yeah|I mean)\b/gi;
    const matches = response.match(fillers);
    return matches ? matches.length : 0;
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
