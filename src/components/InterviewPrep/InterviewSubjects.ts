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
