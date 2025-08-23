// Define PracticeLink interface locally to avoid circular imports
interface PracticeLink {
  leetcode?: string;
  geeksforgeeks?: string;
  title: string;
}

// Practice links for String Questions
export const stringQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-string-1": {
    title: "Valid Anagram",
    leetcode: "https://leetcode.com/problems/valid-anagram/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/anagram-1587115620/1",
  },
  "enhanced-string-2": {
    title: "Longest Substring Without Repeating Characters",
    leetcode:
      "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
  },
  "enhanced-string-3": {
    title: "Longest Palindromic Substring",
    leetcode: "https://leetcode.com/problems/longest-palindromic-substring/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/longest-palindrome-in-a-string3411/1",
  },
  "enhanced-string-4": {
    title: "Valid Parentheses",
    leetcode: "https://leetcode.com/problems/valid-parentheses/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/parenthesis-checker2744/1",
  },
  "enhanced-string-5": {
    title: "Group Anagrams",
    leetcode: "https://leetcode.com/problems/group-anagrams/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/print-anagrams-together/1",
  },
  "enhanced-string-6": {
    title: "String to Integer (atoi)",
    leetcode: "https://leetcode.com/problems/string-to-integer-atoi/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/implement-atoi/1",
  },
  "enhanced-string-7": {
    title: "Minimum Window Substring",
    leetcode: "https://leetcode.com/problems/minimum-window-substring/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1",
  },
  "enhanced-string-8": {
    title: "Longest Common Prefix",
    leetcode: "https://leetcode.com/problems/longest-common-prefix/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1",
  },
  "enhanced-string-9": {
    title: "Valid Palindrome",
    leetcode: "https://leetcode.com/problems/valid-palindrome/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/palindrome-string0817/1",
  },
  "enhanced-string-10": {
    title: "Regular Expression Matching",
    leetcode: "https://leetcode.com/problems/regular-expression-matching/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/wildcard-pattern-matching/1",
  },
};
