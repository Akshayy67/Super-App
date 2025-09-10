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
    const roleSpecificContext = this.getRoleSpecificContext(context.role);
    const difficultyGuidelines = this.getDifficultyGuidelines(
      context.difficulty
    );
    const questionCount = context.interviewType === "mixed" ? "5" : "3";

    return `
You are an expert technical interviewer with 15+ years of experience. Generate ${questionCount} highly targeted interview questions for a ${
      context.role
    } position.

## Interview Context
- **Role**: ${context.role}
- **Difficulty Level**: ${context.difficulty}
- **Interview Type**: ${context.interviewType}
- **Focus Areas**: ${context.focusAreas.join(", ")}
- **Time Available**: ${context.timeRemaining} minutes
- **Performance Context**: ${this.getPerformanceContext(
      context.performanceMetrics
    )}

## Role-Specific Requirements
${roleSpecificContext}

## Difficulty Guidelines
${difficultyGuidelines}

## Question Generation Rules
1. **Relevance**: Each question must directly assess skills critical for the ${
      context.role
    } role
2. **Progressive Difficulty**: Questions should build upon each other logically
3. **Real-World Application**: Include scenarios the candidate would actually face
4. **Measurable Outcomes**: Provide clear, objective evaluation criteria
5. **Time Optimization**: Questions should be answerable within the time limit

## Expected Response Format
Return a JSON array with exactly ${questionCount} questions:

\`\`\`json
[
  {
    "question": "Detailed, role-specific question that tests core competencies",
    "category": "technical|behavioral|situational|problem-solving",
    "difficulty": "${context.difficulty}",
    "expectedAnswerPoints": [
      "Specific technical concept or approach",
      "Implementation detail or best practice",
      "Real-world consideration or trade-off"
    ],
    "followUpQuestions": [
      "Probing question to test deeper understanding",
      "Scenario-based follow-up to assess practical application"
    ],
    "evaluationCriteria": [
      "Technical accuracy and depth of knowledge",
      "Problem-solving approach and methodology",
      "Communication clarity and structure"
    ],
    "timeLimit": ${Math.floor(context.timeRemaining / parseInt(questionCount))},
    "hints": [
      "Helpful hint if candidate struggles",
      "Alternative approach suggestion"
    ],
    "adaptationReason": "Why this question was chosen for this specific context"
  }
]
\`\`\`

Generate questions that will effectively differentiate between candidates at the ${
      context.difficulty
    } level.
`;
  }

  private getRoleSpecificContext(role: string): string {
    const roleContexts: Record<string, string> = {
      "Software Engineer": `
- Focus on coding proficiency, system design, and problem-solving
- Assess knowledge of data structures, algorithms, and software architecture
- Evaluate experience with relevant technologies and frameworks
- Test debugging skills and code optimization abilities`,

      "Product Manager": `
- Assess product strategy and roadmap planning capabilities
- Evaluate stakeholder management and communication skills
- Test data-driven decision making and metrics understanding
- Focus on user experience and market analysis abilities`,

      "Data Scientist": `
- Evaluate statistical knowledge and machine learning expertise
- Assess data analysis and visualization capabilities
- Test programming skills in Python/R and SQL proficiency
- Focus on experimental design and hypothesis testing`,

      "Frontend Developer": `
- Assess UI/UX implementation skills and responsive design
- Evaluate JavaScript/TypeScript proficiency and framework knowledge
- Test performance optimization and accessibility awareness
- Focus on browser compatibility and modern development practices`,

      "Backend Developer": `
- Evaluate API design and database optimization skills
- Assess scalability and performance considerations
- Test security best practices and system architecture knowledge
- Focus on microservices and cloud platform experience`,
    };

    return (
      roleContexts[role] ||
      `
- Assess core competencies relevant to the ${role} position
- Evaluate problem-solving and analytical thinking abilities
- Test communication and collaboration skills
- Focus on relevant technical and domain expertise`
    );
  }

  private getDifficultyGuidelines(
    difficulty: "easy" | "medium" | "hard"
  ): string {
    const guidelines = {
      easy: `
- **Entry Level (0-2 years)**: Focus on fundamental concepts and basic problem-solving
- Questions should test foundational knowledge and learning ability
- Allow for some uncertainty and provide guidance when needed
- Emphasize potential and willingness to learn over deep expertise`,

      medium: `
- **Mid Level (2-5 years)**: Expect solid understanding of core concepts and practical experience
- Questions should test real-world application and decision-making skills
- Look for ability to handle complexity and trade-off analysis
- Assess leadership potential and mentoring capabilities`,

      hard: `
- **Senior Level (5+ years)**: Demand deep expertise and strategic thinking
- Questions should test system design, architecture, and optimization skills
- Expect innovative solutions and industry best practices knowledge
- Assess ability to lead teams and drive technical decisions`,
    };

    return guidelines[difficulty];
  }

  private getPerformanceContext(metrics: any): string {
    if (!metrics) return "No previous performance data available";

    const { technicalScore, communicationScore, confidenceScore } = metrics;

    let context = "Previous performance indicators:\n";

    if (technicalScore < 60) {
      context +=
        "- Consider focusing on fundamental concepts and providing more guidance\n";
    } else if (technicalScore > 80) {
      context +=
        "- Candidate shows strong technical aptitude, can handle complex scenarios\n";
    }

    if (communicationScore < 60) {
      context +=
        "- May need questions that encourage structured thinking and clear explanation\n";
    } else if (communicationScore > 80) {
      context +=
        "- Strong communicator, can handle open-ended and discussion-based questions\n";
    }

    if (confidenceScore < 60) {
      context +=
        "- Consider supportive questioning style with hints and encouragement\n";
    } else if (confidenceScore > 80) {
      context +=
        "- Confident candidate, can handle challenging and pressure-testing questions\n";
    }

    return context;
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
