// Code implementation interface
export interface CodeImplementation {
  language: "pseudo" | "java" | "python";
  approach: "brute-force" | "moderate" | "optimal";
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

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
<<<<<<< Current (Your changes)
=======
  codeImplementations?: CodeImplementation[]; // New field for code solutions
>>>>>>> Incoming (Background Agent changes)
}
