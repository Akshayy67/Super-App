// Consolidate and export all question collections
import { algorithmQuestions } from "./AlgorithmQuestions";
import { frontendQuestions } from "./FrontendQuestions";
import { reactQuestions } from "./ReactQuestions";
import { javascriptQuestions } from "./JavaScriptQuestions";
import { databaseQuestions } from "./DatabaseQuestions";
import { systemDesignQuestions } from "./SystemDesignQuestions";
import { cloudDevOpsQuestions } from "./CloudDevOpsQuestions";
import { behavioralQuestions } from "./BehavioralQuestions";
import { operatingSystemQuestions } from "./OperatingSystemQuestions";
import { enhancedDSAQuestions } from "./enhanced/EnhancedDSAQuestions";
import { dsaQuestions } from "./DSAQuestions";
import { puzzleQuestions } from "./PuzzleQuestions";
import { aptitudeQuestions } from "./AptitudeQuestions";
import { computerNetworkQuestions } from "./ComputerNetworkQuestions";
import { Question } from "../InterviewSubjects";

// Export individual collections
export {
  algorithmQuestions,
  frontendQuestions,
  reactQuestions,
  javascriptQuestions,
  databaseQuestions,
  systemDesignQuestions,
  cloudDevOpsQuestions,
  behavioralQuestions,
  operatingSystemQuestions,
  enhancedDSAQuestions,
  dsaQuestions,
  puzzleQuestions,
  aptitudeQuestions,
  computerNetworkQuestions,
};

// Combined collection of all questions
export const allQuestions: Question[] = [
  ...algorithmQuestions,
  ...frontendQuestions,
  ...reactQuestions,
  ...javascriptQuestions,
  ...databaseQuestions,
  ...systemDesignQuestions,
  ...cloudDevOpsQuestions,
  ...behavioralQuestions,
  ...operatingSystemQuestions,
  ...enhancedDSAQuestions,
  ...dsaQuestions,
  ...puzzleQuestions,
  ...aptitudeQuestions,
  ...computerNetworkQuestions,
];

// Map subject names to their respective question collections
export const questionsBySubject: Record<string, Question[]> = {
  "Algorithms & Data Structures": algorithmQuestions,
  "Enhanced DSA (Top 75)": enhancedDSAQuestions,
  "Frontend Development": frontendQuestions,
  React: reactQuestions,
  JavaScript: javascriptQuestions,
  Databases: databaseQuestions,
  "System Design": systemDesignQuestions,
  "Cloud & DevOps": cloudDevOpsQuestions,
  Behavioral: behavioralQuestions,
  "Operating Systems": operatingSystemQuestions,
  Puzzles: puzzleQuestions,
  "Aptitude & Reasoning": aptitudeQuestions,
  "Computer Networks": computerNetworkQuestions,
};

// Helper function to get questions by subject name
export const getQuestionsBySubject = (subject: string): Question[] => {
  return questionsBySubject[subject] || [];
};

// Helper function to get questions by tags
export const getQuestionsByTags = (tags: string[]): Question[] => {
  if (!tags || tags.length === 0) return allQuestions;

  return allQuestions.filter(
    (question) =>
      question.tags && question.tags.some((tag) => tags.includes(tag))
  );
};
