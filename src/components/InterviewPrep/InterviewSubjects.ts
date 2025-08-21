// Question interface definition
export interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  type: "behavioral" | "technical" | "situational" | "general";
  sampleAnswer?: string;
  tips?: string[];
  followUps?: string[];
  tags?: string[];
  estimatedTime?: number; // in minutes
  industry?: string[];
  lastPracticed?: Date;
  practiceCount?: number;
  successRate?: number;
}

// Enhanced Question interface with code implementations
export interface EnhancedQuestion extends Question {
  codeImplementations?: {
    [language: string]: {
      solution: string;
      explanation: string;
      timeComplexity: string;
      spaceComplexity: string;
      approach?: string;
    };
  };
  algorithmSteps?: string[];
  commonMistakes?: string[];
  optimizations?: string[];
  relatedQuestions?: string[];
}
