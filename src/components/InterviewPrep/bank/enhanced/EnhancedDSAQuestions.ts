import { Question } from "../../InterviewSubjects";
import { enhancedArrayQuestions } from "./ArrayQuestions";
import { enhancedStringQuestions } from "./StringQuestions";
import { enhancedLinkedListQuestions } from "./LinkedListQuestions";
import { enhancedTreeQuestions } from "./TreeQuestions";
import { enhancedDPQuestions } from "./DynamicProgrammingQuestions";
import { enhancedStackQueueQuestions } from "./StackQueueQuestions";
import { enhancedGraphQuestions } from "./GraphQuestions";
import { enhancedSearchSortQuestions } from "./SearchSortQuestions";
import { enhancedHeapQuestions } from "./HeapQuestions";
import { enhancedBacktrackingQuestions } from "./BacktrackingQuestions";
import { enhancedBitManipulationQuestions } from "./BitManipulationQuestions";
import { enhancedMatrixQuestions } from "./MatrixQuestions";

// Complete collection of Enhanced DSA Questions
// Comprehensive 100+ interview questions with detailed implementations
export const enhancedDSAQuestions: Question[] = [
  ...enhancedArrayQuestions,
  ...enhancedStringQuestions,
  ...enhancedLinkedListQuestions,
  ...enhancedTreeQuestions,
  ...enhancedDPQuestions,
  ...enhancedStackQueueQuestions,
  ...enhancedGraphQuestions,
  ...enhancedSearchSortQuestions,
  ...enhancedHeapQuestions,
  ...enhancedBacktrackingQuestions,
  ...enhancedBitManipulationQuestions,
  ...enhancedMatrixQuestions,
];

// Questions organized by category
export const enhancedQuestionsByCategory = {
  "Array": enhancedArrayQuestions,
  "String": enhancedStringQuestions,
  "Linked List": enhancedLinkedListQuestions,
  "Tree": enhancedTreeQuestions,
  "Dynamic Programming": enhancedDPQuestions,
  "Stack & Queue": enhancedStackQueueQuestions,
  "Graph": enhancedGraphQuestions,
  "Search & Sort": enhancedSearchSortQuestions,
  "Heap & Priority Queue": enhancedHeapQuestions,
  "Backtracking": enhancedBacktrackingQuestions,
  "Bit Manipulation": enhancedBitManipulationQuestions,
  "Matrix & 2D Array": enhancedMatrixQuestions,
};

// Questions organized by difficulty
export const enhancedQuestionsByDifficulty = {
  easy: enhancedDSAQuestions.filter(q => q.difficulty === "easy"),
  medium: enhancedDSAQuestions.filter(q => q.difficulty === "medium"),
  hard: enhancedDSAQuestions.filter(q => q.difficulty === "hard"),
};

// Popular interview question patterns
export const enhancedQuestionPatterns = {
  "Two Pointers": enhancedDSAQuestions.filter(q => q.tags?.includes("two-pointers")),
  "Sliding Window": enhancedDSAQuestions.filter(q => q.tags?.includes("sliding-window")),
  "Binary Search": enhancedDSAQuestions.filter(q => q.tags?.includes("binary-search")),
  "Hash Table": enhancedDSAQuestions.filter(q => q.tags?.includes("hash-table")),
  "DFS": enhancedDSAQuestions.filter(q => q.tags?.includes("dfs")),
  "BFS": enhancedDSAQuestions.filter(q => q.tags?.includes("bfs")),
  "Dynamic Programming": enhancedDSAQuestions.filter(q => q.tags?.includes("dynamic-programming")),
  "Divide and Conquer": enhancedDSAQuestions.filter(q => q.tags?.includes("divide-and-conquer")),
  "Greedy": enhancedDSAQuestions.filter(q => q.tags?.includes("greedy")),
  "Backtracking": enhancedDSAQuestions.filter(q => q.tags?.includes("backtracking")),
};

// Helper functions
export const getEnhancedQuestionsByTag = (tag: string): Question[] => {
  return enhancedDSAQuestions.filter(q => q.tags?.includes(tag));
};

export const getEnhancedQuestionsByDifficulty = (difficulty: string): Question[] => {
  return enhancedDSAQuestions.filter(q => q.difficulty === difficulty);
};

export const getRandomEnhancedQuestion = (): Question => {
  const randomIndex = Math.floor(Math.random() * enhancedDSAQuestions.length);
  return enhancedDSAQuestions[randomIndex];
};

export const getEnhancedQuestionById = (id: string): Question | undefined => {
  return enhancedDSAQuestions.find(q => q.id === id);
};

// Statistics
export const enhancedDSAStats = {
  totalQuestions: enhancedDSAQuestions.length,
  questionsByDifficulty: {
    easy: enhancedQuestionsByDifficulty.easy.length,
    medium: enhancedQuestionsByDifficulty.medium.length,
    hard: enhancedQuestionsByDifficulty.hard.length,
  },
  questionsByCategory: Object.fromEntries(
    Object.entries(enhancedQuestionsByCategory).map(([key, questions]) => [key, questions.length])
  ),
};
