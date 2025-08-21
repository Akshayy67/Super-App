import { Question } from "../InterviewSubjects";
import { enhancedArrayQuestions } from "./enhanced/ArrayQuestions";
import { enhancedStringQuestions } from "./enhanced/StringQuestions";
import { enhancedLinkedListQuestions } from "./enhanced/LinkedListQuestions";
import { enhancedTreeQuestions } from "./enhanced/TreeQuestions";
import { enhancedDPQuestions } from "./enhanced/DynamicProgrammingQuestions";
import { enhancedStackQueueQuestions } from "./enhanced/StackQueueQuestions";
import { enhancedGraphQuestions } from "./enhanced/GraphQuestions";
import { enhancedSearchSortQuestions } from "./enhanced/SearchSortQuestions";

// Enhanced collection of 75 most asked DSA interview questions with code implementations
export const enhancedDSAQuestions: Question[] = [
  ...enhancedArrayQuestions,
  ...enhancedStringQuestions,
  ...enhancedLinkedListQuestions,
  ...enhancedTreeQuestions,
  ...enhancedDPQuestions,
  ...enhancedStackQueueQuestions,
  ...enhancedGraphQuestions,
  ...enhancedSearchSortQuestions,
];

// Export individual categories for modular usage
export {
  enhancedArrayQuestions,
  enhancedStringQuestions,
  enhancedLinkedListQuestions,
  enhancedTreeQuestions,
  enhancedDPQuestions,
  enhancedStackQueueQuestions,
  enhancedGraphQuestions,
  enhancedSearchSortQuestions,
};