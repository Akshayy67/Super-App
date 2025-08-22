// Define PracticeLink interface locally to avoid circular imports
interface PracticeLink {
  leetcode?: string;
  geeksforgeeks?: string;
  title: string;
}

// Practice links for Backtracking Questions
export const backtrackingQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-backtrack-1": {
    title: "Generate Parentheses",
    leetcode: "https://leetcode.com/problems/generate-parentheses/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/generate-all-possible-parentheses/1",
  },
  "enhanced-backtrack-2": {
    title: "N-Queens",
    leetcode: "https://leetcode.com/problems/n-queens/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/n-queen-problem0315/1",
  },
  "enhanced-backtrack-3": {
    title: "Subsets",
    leetcode: "https://leetcode.com/problems/subsets/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/power-set4302/1",
  },
  "enhanced-backtrack-4": {
    title: "Permutations",
    leetcode: "https://leetcode.com/problems/permutations/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
  },
  "enhanced-backtrack-5": {
    title: "Combination Sum",
    leetcode: "https://leetcode.com/problems/combination-sum/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/combination-sum-1587115620/1",
  },
  "enhanced-backtrack-6": {
    title: "Word Search",
    leetcode: "https://leetcode.com/problems/word-search/",
    geeksforgeeks: "https://practice.geeksforgeeks.org/problems/word-search/1",
  },
  "enhanced-backtrack-7": {
    title: "Sudoku Solver",
    leetcode: "https://leetcode.com/problems/sudoku-solver/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1",
  },
  "enhanced-backtrack-8": {
    title: "Letter Combinations of a Phone Number",
    leetcode:
      "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/possible-words-from-phone-digits-1587115620/1",
  },
  "enhanced-backtrack-9": {
    title: "Palindrome Partitioning",
    leetcode: "https://leetcode.com/problems/palindrome-partitioning/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/palindromic-patitioning4845/1",
  },
  "enhanced-backtrack-10": {
    title: "Word Break II",
    leetcode: "https://leetcode.com/problems/word-break-ii/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/word-break-part-23249/1",
  },
};
