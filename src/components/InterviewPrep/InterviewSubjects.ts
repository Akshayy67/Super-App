// Code implementation interface
export interface CodeImplementation {
  language: string;
  approach?: "brute-force" | "moderate" | "optimal" | "general";
  code: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  explanation?: string;
}

// Question interface definition
export interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  type: "behavioral" | "technical" | "situational" | "general";
  sampleAnswer?: string;
  approach?: string; // Separate approach explanation from sample answer
  codeImplementation?: CodeImplementation[];
  tips?: string[];
  followUps?: string[];
  tags?: string[];
  estimatedTime?: number; // in minutes
  industry?: string[];
  lastPracticed?: Date;
  practiceCount?: number;
  successRate?: number;
}
