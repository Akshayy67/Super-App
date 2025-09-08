import { unifiedAIService } from "./aiConfig";

export interface QuestionGenerationContext {
  role: string;
  difficulty: "easy" | "medium" | "hard";
  previousAnswers: string[];
  performanceMetrics: {
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
  };
  focusAreas: string[];
  interviewType: "technical" | "behavioral" | "mixed";
  timeRemaining: number;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswerPoints: string[];
  followUpQuestions: string[];
  evaluationCriteria: string[];
  timeLimit: number;
  hints?: string[];
  adaptationReason: string;
}

export interface QuestionAdaptationResult {
  nextQuestion: GeneratedQuestion;
  difficultyAdjustment: "increased" | "decreased" | "maintained";
  focusShift: string;
  reasoning: string;
}

export class IntelligentQuestionGenerator {
  private conversationHistory: {
    role: string;
    content: string;
    timestamp: number;
  }[] = [];
  private performanceHistory: { timestamp: number; scores: any }[] = [];
  private currentDifficulty: "easy" | "medium" | "hard" = "medium";
  private focusAreas: string[] = [];

  async generateInitialQuestions(
    context: QuestionGenerationContext
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildInitialQuestionsPrompt(context);

    try {
      const response = await unifiedAIService.generateResponse(prompt);

      if (response.success && response.data) {
        return this.parseGeneratedQuestions(response.data, context);
      }

      return this.getFallbackQuestions(context);
    } catch (error) {
      console.error("Failed to generate initial questions:", error);
      return this.getFallbackQuestions(context);
    }
  }

  async adaptNextQuestion(
    context: QuestionGenerationContext,
    lastAnswer: string,
    answerQuality: "poor" | "fair" | "good" | "excellent"
  ): Promise<QuestionAdaptationResult> {
    // Update conversation history
    this.conversationHistory.push({
      role: "candidate",
      content: lastAnswer,
      timestamp: Date.now(),
    });

    // Analyze the answer and adapt
    const analysisPrompt = this.buildAnswerAnalysisPrompt(
      context,
      lastAnswer,
      answerQuality
    );

    try {
      const analysisResponse = await unifiedAIService.generateResponse(
        analysisPrompt
      );

      if (analysisResponse.success && analysisResponse.data) {
        const analysis = this.parseAnswerAnalysis(analysisResponse.data);
        return await this.generateAdaptedQuestion(context, analysis);
      }

      return this.getFallbackAdaptation(context);
    } catch (error) {
      console.error("Failed to adapt question:", error);
      return this.getFallbackAdaptation(context);
    }
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    candidateAnswer: string,
    context: QuestionGenerationContext
  ): Promise<GeneratedQuestion> {
    const prompt = `
Based on the original question and candidate's answer, generate a relevant follow-up question.

Original Question: ${originalQuestion}
Candidate's Answer: ${candidateAnswer}
Role: ${context.role}
Difficulty: ${context.difficulty}

Generate a follow-up question that:
1. Digs deeper into their answer
2. Tests their understanding further
3. Explores related concepts
4. Maintains appropriate difficulty level

Format your response as JSON with these fields:
- question: The follow-up question
- category: Question category
- expectedAnswerPoints: Array of key points expected in answer
- evaluationCriteria: Array of evaluation criteria
- timeLimit: Time limit in seconds
- adaptationReason: Why this follow-up was chosen
`;

    try {
      const response = await unifiedAIService.generateResponse(prompt);

      if (response.success && response.data) {
        const questionData = this.parseQuestionJSON(response.data);
        return {
          id: `followup_${Date.now()}`,
          difficulty: context.difficulty,
          followUpQuestions: [],
          ...questionData,
        };
      }
    } catch (error) {
      console.error("Failed to generate follow-up question:", error);
    }

    return this.getFallbackFollowUp(originalQuestion, context);
  }

  private buildInitialQuestionsPrompt(
    context: QuestionGenerationContext
  ): string {
    return `
Generate ${
      context.interviewType === "mixed" ? "5" : "3"
    } interview questions for a ${context.difficulty} level ${
      context.role
    } position.

Context:
- Role: ${context.role}
- Difficulty: ${context.difficulty}
- Interview Type: ${context.interviewType}
- Focus Areas: ${context.focusAreas.join(", ")}
- Time Available: ${context.timeRemaining} minutes

Requirements:
1. Questions should be appropriate for the role and difficulty level
2. Include a mix of technical and behavioral questions if interview type is 'mixed'
3. Each question should have clear evaluation criteria
4. Provide expected answer points for each question
5. Include time limits for each question

Format your response as JSON array with each question having:
- question: The actual question text
- category: Question category (technical, behavioral, situational, etc.)
- difficulty: easy, medium, or hard
- expectedAnswerPoints: Array of key points expected in answer
- followUpQuestions: Array of potential follow-up questions
- evaluationCriteria: Array of criteria to evaluate the answer
- timeLimit: Time limit in seconds
- hints: Optional array of hints if candidate struggles
- adaptationReason: Why this question was chosen for this context
`;
  }

  private buildAnswerAnalysisPrompt(
    context: QuestionGenerationContext,
    answer: string,
    quality: string
  ): string {
    return `
Analyze the candidate's answer and provide recommendations for the next question.

Candidate's Answer: ${answer}
Answer Quality: ${quality}
Current Performance: Technical ${context.performanceMetrics.technicalScore}/100, Communication ${context.performanceMetrics.communicationScore}/100, Confidence ${context.performanceMetrics.confidenceScore}/100

Provide analysis in JSON format:
{
  "answerStrengths": ["strength1", "strength2"],
  "answerWeaknesses": ["weakness1", "weakness2"],
  "recommendedDifficultyAdjustment": "increase|decrease|maintain",
  "recommendedFocusAreas": ["area1", "area2"],
  "nextQuestionType": "technical|behavioral|situational",
  "reasoning": "Explanation for recommendations"
}
`;
  }

  private async generateAdaptedQuestion(
    context: QuestionGenerationContext,
    analysis: any
  ): Promise<QuestionAdaptationResult> {
    // Adjust difficulty based on analysis
    let newDifficulty = context.difficulty;
    if (
      analysis.recommendedDifficultyAdjustment === "increase" &&
      context.difficulty !== "hard"
    ) {
      newDifficulty = context.difficulty === "easy" ? "medium" : "hard";
    } else if (
      analysis.recommendedDifficultyAdjustment === "decrease" &&
      context.difficulty !== "easy"
    ) {
      newDifficulty = context.difficulty === "hard" ? "medium" : "easy";
    }

    // Update focus areas
    this.focusAreas = analysis.recommendedFocusAreas || context.focusAreas;

    const adaptedContext = {
      ...context,
      difficulty: newDifficulty,
      focusAreas: this.focusAreas,
    };

    const questionPrompt = `
Generate a single interview question based on the analysis.

Context:
- Role: ${context.role}
- Adjusted Difficulty: ${newDifficulty}
- Question Type: ${analysis.nextQuestionType}
- Focus Areas: ${this.focusAreas.join(", ")}
- Analysis Reasoning: ${analysis.reasoning}

Generate a question that addresses the identified focus areas and maintains engagement.

Format as JSON with the same structure as before.
`;

    try {
      const response = await unifiedAIService.generateResponse(questionPrompt);

      if (response.success && response.data) {
        const questionData = this.parseQuestionJSON(response.data);
        const nextQuestion: GeneratedQuestion = {
          id: `adapted_${Date.now()}`,
          difficulty: newDifficulty,
          followUpQuestions: [],
          ...questionData,
        };

        return {
          nextQuestion,
          difficultyAdjustment:
            newDifficulty === context.difficulty
              ? "maintained"
              : newDifficulty > context.difficulty
              ? "increased"
              : "decreased",
          focusShift: this.focusAreas.join(", "),
          reasoning:
            analysis.reasoning || "Adapted based on previous answer quality",
        };
      }
    } catch (error) {
      console.error("Failed to generate adapted question:", error);
    }

    return this.getFallbackAdaptation(context);
  }

  private parseGeneratedQuestions(
    response: string,
    context: QuestionGenerationContext
  ): GeneratedQuestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.map((q: any, index: number) => ({
          id: `generated_${Date.now()}_${index}`,
          question: q.question || "Generated question",
          category: q.category || "general",
          difficulty: q.difficulty || context.difficulty,
          expectedAnswerPoints: q.expectedAnswerPoints || [],
          followUpQuestions: q.followUpQuestions || [],
          evaluationCriteria: q.evaluationCriteria || [],
          timeLimit: q.timeLimit || 300,
          hints: q.hints,
          adaptationReason: q.adaptationReason || "Initial question generation",
        }));
      }
    } catch (error) {
      console.error("Failed to parse generated questions:", error);
    }

    return this.getFallbackQuestions(context);
  }

  private parseAnswerAnalysis(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Failed to parse answer analysis:", error);
    }

    return {
      answerStrengths: ["Response provided"],
      answerWeaknesses: ["Could be more detailed"],
      recommendedDifficultyAdjustment: "maintain",
      recommendedFocusAreas: ["communication"],
      nextQuestionType: "behavioral",
      reasoning: "Continue with current approach",
    };
  }

  private parseQuestionJSON(response: string): Partial<GeneratedQuestion> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Failed to parse question JSON:", error);
    }

    return {
      question: "Tell me about a challenging project you worked on.",
      category: "behavioral",
      expectedAnswerPoints: [
        "Project description",
        "Challenges faced",
        "Solutions implemented",
      ],
      evaluationCriteria: [
        "Clarity",
        "Problem-solving approach",
        "Results achieved",
      ],
      timeLimit: 300,
      adaptationReason: "Fallback question due to parsing error",
    };
  }

  private getFallbackQuestions(
    context: QuestionGenerationContext
  ): GeneratedQuestion[] {
    const baseQuestions = [
      {
        id: "fallback_1",
        question: `Tell me about your experience with ${context.role} responsibilities.`,
        category: "experience",
        difficulty: context.difficulty,
        expectedAnswerPoints: [
          "Relevant experience",
          "Specific examples",
          "Skills demonstrated",
        ],
        followUpQuestions: [
          "Can you elaborate on a specific project?",
          "What challenges did you face?",
        ],
        evaluationCriteria: [
          "Relevance",
          "Depth of experience",
          "Communication clarity",
        ],
        timeLimit: 300,
        adaptationReason: "Fallback question - experience focused",
      },
      {
        id: "fallback_2",
        question: "Describe a time when you had to solve a complex problem.",
        category: "problem-solving",
        difficulty: context.difficulty,
        expectedAnswerPoints: [
          "Problem description",
          "Solution approach",
          "Outcome",
        ],
        followUpQuestions: [
          "What would you do differently?",
          "How did you measure success?",
        ],
        evaluationCriteria: [
          "Problem-solving approach",
          "Analytical thinking",
          "Results orientation",
        ],
        timeLimit: 300,
        adaptationReason: "Fallback question - problem-solving focused",
      },
    ];

    return baseQuestions;
  }

  private getFallbackAdaptation(
    context: QuestionGenerationContext
  ): QuestionAdaptationResult {
    const fallbackQuestion: GeneratedQuestion = {
      id: `fallback_adapted_${Date.now()}`,
      question: "Can you tell me more about your approach to teamwork?",
      category: "behavioral",
      difficulty: context.difficulty,
      expectedAnswerPoints: [
        "Teamwork philosophy",
        "Specific examples",
        "Collaboration skills",
      ],
      followUpQuestions: [
        "How do you handle conflicts?",
        "What makes a team successful?",
      ],
      evaluationCriteria: [
        "Collaboration skills",
        "Communication",
        "Leadership potential",
      ],
      timeLimit: 300,
      adaptationReason: "Fallback adaptation - focusing on teamwork",
    };

    return {
      nextQuestion: fallbackQuestion,
      difficultyAdjustment: "maintained",
      focusShift: "teamwork and collaboration",
      reasoning: "Fallback adaptation due to analysis failure",
    };
  }

  private getFallbackFollowUp(
    originalQuestion: string,
    context: QuestionGenerationContext
  ): GeneratedQuestion {
    return {
      id: `fallback_followup_${Date.now()}`,
      question: "Can you provide a specific example to illustrate your point?",
      category: "clarification",
      difficulty: context.difficulty,
      expectedAnswerPoints: [
        "Specific example",
        "Detailed explanation",
        "Clear connection to original answer",
      ],
      followUpQuestions: [],
      evaluationCriteria: ["Specificity", "Relevance", "Clarity"],
      timeLimit: 180,
      adaptationReason: "Fallback follow-up for clarification",
    };
  }

  updatePerformanceMetrics(metrics: any): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      scores: metrics,
    });
  }

  getConversationHistory(): {
    role: string;
    content: string;
    timestamp: number;
  }[] {
    return [...this.conversationHistory];
  }

  reset(): void {
    this.conversationHistory = [];
    this.performanceHistory = [];
    this.currentDifficulty = "medium";
    this.focusAreas = [];
  }
}
