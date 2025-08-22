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



// Practice links for Matrix Questions - Basic entries only (see matrixLinks.ts for full list)
export const matrixQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-matrix-1": {
    title: "Spiral Matrix",
    leetcode: "https://leetcode.com/problems/spiral-matrix/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/spirally-traversing-a-matrix-1587115621/1",
  },
  "enhanced-matrix-2": {
    title: "Rotate Image",
    leetcode: "https://leetcode.com/problems/rotate-image/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/rotate-by-90-degree-1587115621/1",
  },
  "enhanced-matrix-3": {
    title: "Set Matrix Zeroes",
    leetcode: "https://leetcode.com/problems/set-matrix-zeroes/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/boolean-matrix-problem-1587115620/1",
  },
  "enhanced-matrix-4": {
    title: "Word Search",
    leetcode: "https://leetcode.com/problems/word-search/",
    geeksforgeeks: "https://practice.geeksforgeeks.org/problems/word-search/1",
  },
  "enhanced-matrix-5": {
    title: "Number of Islands",
    leetcode: "https://leetcode.com/problems/number-of-islands/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/find-the-number-of-islands/1",
  },
  "enhanced-matrix-6": {
    title: "Pacific Atlantic Water Flow",
    leetcode: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/water-flow-in-a-1-d-array/1",
  },
  "enhanced-matrix-7": {
    title: "Surrounded Regions",
    leetcode: "https://leetcode.com/problems/surrounded-regions/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/replace-os-with-xs0052/1",
  },
  "enhanced-matrix-8": {
    title: "Game of Life",
    leetcode: "https://leetcode.com/problems/game-of-life/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/the-game-of-life/1",
  },
  "enhanced-matrix-9": {
    title: "Longest Increasing Path in a Matrix",
    leetcode:
      "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/longest-increasing-path-in-a-matrix/1",
  },
  "enhanced-matrix-10": {
    title: "Word Search II",
    leetcode: "https://leetcode.com/problems/word-search-ii/",
    geeksforgeeks: "https://practice.geeksforgeeks.org/problems/word-boggle/0",
  },
};

// Practice links for Array Questions
export const arrayQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-array-1": {
    title: "Two Sum",
    leetcode: "https://leetcode.com/problems/two-sum/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/find-pair-given-difference1559/1",
  },
  "enhanced-array-2": {
    title: "Container With Most Water",
    leetcode: "https://leetcode.com/problems/container-with-most-water/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/container-with-most-water0535/1",
  },
  "enhanced-array-3": {
    title: "3Sum",
    leetcode: "https://leetcode.com/problems/3sum/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1",
  },
  "enhanced-array-4": {
    title: "Maximum Subarray",
    leetcode: "https://leetcode.com/problems/maximum-subarray/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
  },
  "enhanced-array-5": {
    title: "Product of Array Except Self",
    leetcode: "https://leetcode.com/problems/product-of-array-except-self/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/product-array-puzzle4525/1",
  },
  "enhanced-array-6": {
    title: "Find Minimum in Rotated Sorted Array",
    leetcode:
      "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/minimum-number-in-a-sorted-rotated-array-1587115620/1",
  },
  "enhanced-array-7": {
    title: "Search in Rotated Sorted Array",
    leetcode: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
  },
  "enhanced-array-8": {
    title: "Best Time to Buy and Sell Stock",
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1",
  },
  "enhanced-array-9": {
    title: "Merge Intervals",
    leetcode: "https://leetcode.com/problems/merge-intervals/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/overlapping-intervals4919/1",
  },
  "enhanced-array-10": {
    title: "Next Permutation",
    leetcode: "https://leetcode.com/problems/next-permutation/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/next-permutation5226/1",
  },
};

// Practice links for String Questions
export const stringQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-string-1": {
    title: "Valid Anagram",
    leetcode: "https://leetcode.com/problems/valid-anagram/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/anagram-1587115620/1",
  },
  "enhanced-string-2": {
    title: "Valid Parentheses",
    leetcode: "https://leetcode.com/problems/valid-parentheses/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/parenthesis-checker2744/1",
  },
  "enhanced-string-3": {
    title: "Longest Palindromic Substring",
    leetcode: "https://leetcode.com/problems/longest-palindromic-substring/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/longest-palindrome-in-a-string3411/1",
  },
  "enhanced-string-4": {
    title: "Minimum Window Substring",
    leetcode: "https://leetcode.com/problems/minimum-window-substring/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1",
  },
  "enhanced-string-5": {
    title: "Group Anagrams",
    leetcode: "https://leetcode.com/problems/group-anagrams/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/print-anagrams-together/1",
  },
  "enhanced-string-6": {
    title: "Longest Substring Without Repeating Characters",
    leetcode:
      "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
  },
  "enhanced-string-7": {
    title: "Valid Palindrome",
    leetcode: "https://leetcode.com/problems/valid-palindrome/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/palindrome-string0817/1",
  },
  "enhanced-string-8": {
    title: "Longest Repeating Character Replacement",
    leetcode: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1",
  },
  "enhanced-string-9": {
    title: "Regular Expression Matching",
    leetcode: "https://leetcode.com/problems/regular-expression-matching/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/wildcard-string-matching1126/1",
  },
  "enhanced-string-10": {
    title: "Wildcard Matching",
    leetcode: "https://leetcode.com/problems/wildcard-matching/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/wildcard-string-matching1126/1",
  },
  "enhanced-string-11": {
    title: "Text Justification",
    leetcode: "https://leetcode.com/problems/text-justification/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/text-justification/1",
  },
  "enhanced-string-12": {
    title: "Edit Distance Variants",
    leetcode: "https://leetcode.com/problems/edit-distance/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/edit-distance3702/1",
  },
};

// Practice links for Graph Questions - Basic entries only (see graphLinks.ts for full list)
export const graphQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-graph-1": {
    title: "Number of Islands",
    leetcode: "https://leetcode.com/problems/number-of-islands/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/find-the-number-of-islands/1",
  },
  "enhanced-graph-2": {
    title: "Course Schedule",
    leetcode: "https://leetcode.com/problems/course-schedule/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/prerequisite-tasks/1",
  },
};

// Practice links for Tree Questions
export const treeQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-tree-1": {
    title: "Maximum Depth of Binary Tree",
    leetcode: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/height-of-binary-tree/1",
  },
  "enhanced-tree-2": {
    title: "Same Tree",
    leetcode: "https://leetcode.com/problems/same-tree/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
  },
};

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
  console.log('getPracticeLinks called with:', questionId);
  const result = allQuestionLinks[questionId];
  console.log('Found practice link:', result);
  return result;
}
