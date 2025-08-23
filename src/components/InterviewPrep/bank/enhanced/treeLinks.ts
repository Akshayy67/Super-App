// Define PracticeLink interface locally to avoid circular imports
interface PracticeLink {
  leetcode?: string;
  geeksforgeeks?: string;
  title: string;
}

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
  "enhanced-tree-3": {
    title: "Invert Binary Tree",
    leetcode: "https://leetcode.com/problems/invert-binary-tree/",
    geeksforgeeks: "https://practice.geeksforgeeks.org/problems/mirror-tree/1",
  },
  "enhanced-tree-4": {
    title: "Binary Tree Level Order Traversal",
    leetcode:
      "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/level-order-traversal/1",
  },
  "enhanced-tree-5": {
    title: "Validate Binary Search Tree",
    leetcode: "https://leetcode.com/problems/validate-binary-search-tree/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/check-for-bst/1",
  },
  "enhanced-tree-6": {
    title: "Symmetric Tree",
    leetcode: "https://leetcode.com/problems/symmetric-tree/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/symmetric-tree/1",
  },
  "enhanced-tree-7": {
    title: "Path Sum",
    leetcode: "https://leetcode.com/problems/path-sum/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/root-to-leaf-path-sum/1",
  },
  "enhanced-tree-8": {
    title: "Binary Tree Zigzag Level Order Traversal",
    leetcode:
      "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/zigzag-tree-traversal/1",
  },
  "enhanced-tree-9": {
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    leetcode:
      "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/construct-tree-1/1",
  },
  "enhanced-tree-10": {
    title: "Lowest Common Ancestor of a Binary Tree",
    leetcode:
      "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1",
  },
};
