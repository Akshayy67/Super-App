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

// Enhanced question interface with code implementations
export interface CodeImplementation {
  solution: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  approach: string;
}

export interface EnhancedQuestion extends Question {
  codeImplementations?: {
    javascript?: CodeImplementation;
    python?: CodeImplementation;
    java?: CodeImplementation;
    cpp?: CodeImplementation;
  };
  algorithmSteps?: string[];
  commonMistakes?: string[];
  optimizations?: string[];
  relatedQuestions?: string[];
}
