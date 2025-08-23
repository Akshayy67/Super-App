// This file contains practice links for the enhanced DSA questions
// Maps question titles to their LeetCode/GeeksforGeeks practice links

import { arrayQuestionLinks as fullArrayLinks } from "./arrayLinks";
import { linkedListQuestionLinks } from "./linkedListLinks";
import { backtrackingQuestionLinks } from "./backtrackingLinks";
import { bitManipulationQuestionLinks } from "./bitManipulationLinks";
import { dpQuestionLinks } from "./dynamicProgrammingLinks";
import { graphQuestionLinks as fullGraphLinks } from "./graphLinks";
import { heapQuestionLinks } from "./heapLinks";
import { matrixQuestionLinks as fullMatrixLinks } from "./matrixLinks";
import { searchSortQuestionLinks } from "./searchSortLinks";
import { stringQuestionLinks as fullStringLinks } from "./stringLinks";
import { treeQuestionLinks as fullTreeLinks } from "./treeLinks";

export interface PracticeLink {
  leetcode?: string;
  geeksforgeeks?: string;
  title: string;
}

// Combine all question links - use imported full versions only
const allQuestionLinks: Record<string, PracticeLink> = {
  ...fullArrayLinks,
  ...linkedListQuestionLinks,
  ...backtrackingQuestionLinks,
  ...bitManipulationQuestionLinks,
  ...dpQuestionLinks,
  ...fullGraphLinks,
  ...heapQuestionLinks,
  ...fullMatrixLinks,
  ...searchSortQuestionLinks,
  ...fullStringLinks,
  ...fullTreeLinks,
};

// Function to get practice links for a question
export function getPracticeLinks(questionId: string): PracticeLink | undefined {
  const result = allQuestionLinks[questionId];

  // Only log for debugging specific questions to reduce console noise
  if (questionId === "enhanced-array-1" || questionId === "enhanced-string-1") {
    console.log(`=== getPracticeLinks Debug for ${questionId} ===`);
    console.log(
      `Total available links: ${Object.keys(allQuestionLinks).length}`
    );
    console.log(`Found result:`, result);

    if (!result) {
      console.log(`❌ No practice link found for question ID: ${questionId}`);
    } else {
      console.log(`✅ Practice link found!`);
    }
  }

  return result;
}
