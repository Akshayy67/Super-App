// Define PracticeLink interface locally to avoid circular imports
interface PracticeLink {
  leetcode?: string;
  geeksforgeeks?: string;
  title: string;
}

// Practice links for LinkedList Questions
export const linkedListQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-linkedlist-1": {
    title: "Reverse Linked List",
    leetcode: "https://leetcode.com/problems/reverse-linked-list/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/reverse-a-linked-list/1",
  },
  "enhanced-linkedlist-2": {
    title: "Detect Cycle in a Linked List",
    leetcode: "https://leetcode.com/problems/linked-list-cycle/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
  },
  "enhanced-linkedlist-3": {
    title: "Merge Two Sorted Lists",
    leetcode: "https://leetcode.com/problems/merge-two-sorted-lists/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
  },
  "enhanced-linkedlist-4": {
    title: "Palindrome Linked List",
    leetcode: "https://leetcode.com/problems/palindrome-linked-list/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1",
  },
  "enhanced-linkedlist-5": {
    title: "LRU Cache",
    leetcode: "https://leetcode.com/problems/lru-cache/",
    geeksforgeeks: "https://practice.geeksforgeeks.org/problems/lru-cache/1",
  },
};
