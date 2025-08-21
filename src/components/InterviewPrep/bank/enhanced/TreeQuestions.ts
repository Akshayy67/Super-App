import { Question } from "../../InterviewSubjects";

// Enhanced Tree DSA Questions with comprehensive implementations
export const enhancedTreeQuestions: Question[] = [
  {
    id: "enhanced-tree-1",
    question: "Invert Binary Tree - Given the root of a binary tree, invert the tree and return its root.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Tree Node Definition
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = val === undefined ? 0 : val;
        this.left = left === undefined ? null : left;
        this.right = right === undefined ? null : right;
    }
}

// Approach 1: Recursive (DFS)
// Time: O(n), Space: O(h) where h is height
function invertTree(root: TreeNode | null): TreeNode | null {
    if (!root) return null;
    
    // Swap children
    [root.left, root.right] = [root.right, root.left];
    
    // Recursively invert subtrees
    invertTree(root.left);
    invertTree(root.right);
    
    return root;
}

// Approach 2: Iterative (BFS)
// Time: O(n), Space: O(w) where w is max width
function invertTreeIterative(root: TreeNode | null): TreeNode | null {
    if (!root) return null;
    
    const queue: TreeNode[] = [root];
    
    while (queue.length > 0) {
        const node = queue.shift()!;
        
        // Swap children
        [node.left, node.right] = [node.right, node.left];
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    
    return root;
}

// Approach 3: Iterative (DFS with stack)
function invertTreeDFS(root: TreeNode | null): TreeNode | null {
    if (!root) return null;
    
    const stack: TreeNode[] = [root];
    
    while (stack.length > 0) {
        const node = stack.pop()!;
        
        // Swap children
        [node.left, node.right] = [node.right, node.left];
        
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    
    return root;
}`,
    tips: [
      "Simple problem but fundamental tree manipulation",
      "Recursive solution is most intuitive",
      "Iterative approaches avoid potential stack overflow",
      "BFS vs DFS iterative approaches have different space characteristics"
    ],
    tags: ["tree", "binary-tree", "recursion", "dfs", "bfs"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-2",
    question: "Maximum Depth of Binary Tree - Given the root of a binary tree, return its maximum depth.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Approach 1: Recursive DFS
// Time: O(n), Space: O(h) where h is height
function maxDepth(root: TreeNode | null): number {
    if (!root) return 0;
    
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Approach 2: Iterative BFS
// Time: O(n), Space: O(w) where w is max width
function maxDepthBFS(root: TreeNode | null): number {
    if (!root) return 0;
    
    const queue: TreeNode[] = [root];
    let depth = 0;
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        depth++;
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    
    return depth;
}

// Approach 3: Iterative DFS with stack
// Time: O(n), Space: O(h)
function maxDepthDFS(root: TreeNode | null): number {
    if (!root) return 0;
    
    const stack: [TreeNode, number][] = [[root, 1]];
    let maxDepth = 0;
    
    while (stack.length > 0) {
        const [node, depth] = stack.pop()!;
        maxDepth = Math.max(maxDepth, depth);
        
        if (node.left) stack.push([node.left, depth + 1]);
        if (node.right) stack.push([node.right, depth + 1]);
    }
    
    return maxDepth;
}`,
    tips: [
      "Recursive solution is most natural for tree problems",
      "BFS processes level by level, tracking depth explicitly",
      "DFS with stack pairs nodes with their depths",
      "Consider balanced vs skewed tree space complexity"
    ],
    tags: ["tree", "binary-tree", "dfs", "bfs", "recursion"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-3",
    question: "Same Tree - Given the roots of two binary trees p and q, check if they are the same tree.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Recursive Approach (Optimal)
// Time: O(n), Space: O(h)
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
    // Both null
    if (!p && !q) return true;
    
    // One null, one not null
    if (!p || !q) return false;
    
    // Values different
    if (p.val !== q.val) return false;
    
    // Check subtrees
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

// Iterative Approach
// Time: O(n), Space: O(h)
function isSameTreeIterative(p: TreeNode | null, q: TreeNode | null): boolean {
    const stack: [TreeNode | null, TreeNode | null][] = [[p, q]];
    
    while (stack.length > 0) {
        const [node1, node2] = stack.pop()!;
        
        if (!node1 && !node2) continue;
        if (!node1 || !node2 || node1.val !== node2.val) return false;
        
        stack.push([node1.left, node2.left]);
        stack.push([node1.right, node2.right]);
    }
    
    return true;
}

// BFS Approach
function isSameTreeBFS(p: TreeNode | null, q: TreeNode | null): boolean {
    const queue: [TreeNode | null, TreeNode | null][] = [[p, q]];
    
    while (queue.length > 0) {
        const [node1, node2] = queue.shift()!;
        
        if (!node1 && !node2) continue;
        if (!node1 || !node2 || node1.val !== node2.val) return false;
        
        queue.push([node1.left, node2.left]);
        queue.push([node1.right, node2.right]);
    }
    
    return true;
}`,
    tips: [
      "Handle null cases first: both null vs one null",
      "Compare values before recursing into subtrees",
      "Recursive solution is most readable",
      "Iterative approaches avoid potential stack overflow"
    ],
    tags: ["tree", "binary-tree", "dfs", "bfs"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-4",
    question: "Validate Binary Search Tree - Given the root of a binary tree, determine if it is a valid binary search tree.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Bounds Checking (Optimal)
// Time: O(n), Space: O(h)
function isValidBST(root: TreeNode | null): boolean {
    function validate(node: TreeNode | null, min: number, max: number): boolean {
        if (!node) return true;
        
        if (node.val <= min || node.val >= max) return false;
        
        return validate(node.left, min, node.val) && 
               validate(node.right, node.val, max);
    }
    
    return validate(root, -Infinity, Infinity);
}

// Approach 2: Inorder Traversal
// Time: O(n), Space: O(h)
function isValidBSTInorder(root: TreeNode | null): boolean {
    let prev: number | null = null;
    
    function inorder(node: TreeNode | null): boolean {
        if (!node) return true;
        
        if (!inorder(node.left)) return false;
        
        if (prev !== null && node.val <= prev) return false;
        prev = node.val;
        
        return inorder(node.right);
    }
    
    return inorder(root);
}

// Approach 3: Iterative Inorder
function isValidBSTIterative(root: TreeNode | null): boolean {
    const stack: TreeNode[] = [];
    let current = root;
    let prev: number | null = null;
    
    while (stack.length > 0 || current) {
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        current = stack.pop()!;
        
        if (prev !== null && current.val <= prev) return false;
        prev = current.val;
        
        current = current.right;
    }
    
    return true;
}

// Edge case handler for integer overflow
function isValidBSTSafe(root: TreeNode | null): boolean {
    function validate(node: TreeNode | null, min: TreeNode | null, max: TreeNode | null): boolean {
        if (!node) return true;
        
        if ((min && node.val <= min.val) || (max && node.val >= max.val)) {
            return false;
        }
        
        return validate(node.left, min, node) && validate(node.right, node, max);
    }
    
    return validate(root, null, null);
}`,
    tips: [
      "BST property: left subtree < node < right subtree",
      "Bounds checking approach maintains min/max constraints",
      "Inorder traversal of BST should be strictly increasing",
      "Be careful with integer overflow in bounds"
    ],
    tags: ["tree", "binary-search-tree", "dfs", "recursion"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-5",
    question: "Lowest Common Ancestor of BST - Given a binary search tree and two nodes, find their lowest common ancestor.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Recursive (Optimal)
// Time: O(h), Space: O(h) where h is height
function lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
    if (!root) return null;
    
    // Both nodes are in left subtree
    if (p.val < root.val && q.val < root.val) {
        return lowestCommonAncestor(root.left, p, q);
    }
    
    // Both nodes are in right subtree
    if (p.val > root.val && q.val > root.val) {
        return lowestCommonAncestor(root.right, p, q);
    }
    
    // Nodes are on different sides, current node is LCA
    return root;
}

// Approach 2: Iterative
// Time: O(h), Space: O(1)
function lowestCommonAncestorIterative(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
    let current = root;
    
    while (current) {
        if (p.val < current.val && q.val < current.val) {
            current = current.left;
        } else if (p.val > current.val && q.val > current.val) {
            current = current.right;
        } else {
            return current;
        }
    }
    
    return null;
}

// For general binary tree (not BST)
function lowestCommonAncestorBT(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
    if (!root || root === p || root === q) return root;
    
    const left = lowestCommonAncestorBT(root.left, p, q);
    const right = lowestCommonAncestorBT(root.right, p, q);
    
    if (left && right) return root; // Found both nodes in different subtrees
    return left || right; // Return the non-null result
}`,
    tips: [
      "Leverage BST property: compare values to determine direction",
      "LCA is the split point where nodes go to different subtrees",
      "Iterative solution is more space efficient",
      "General binary tree solution doesn't use BST property"
    ],
    tags: ["tree", "binary-search-tree", "recursion"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-6",
    question: "Binary Tree Level Order Traversal - Given the root of a binary tree, return the level order traversal of its nodes' values.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// BFS with Queue (Standard approach)
// Time: O(n), Space: O(w) where w is max width
function levelOrder(root: TreeNode | null): number[][] {
    if (!root) return [];
    
    const result: number[][] = [];
    const queue: TreeNode[] = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel: number[] = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            currentLevel.push(node.val);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        result.push(currentLevel);
    }
    
    return result;
}

// DFS Approach (less intuitive but possible)
// Time: O(n), Space: O(h)
function levelOrderDFS(root: TreeNode | null): number[][] {
    const result: number[][] = [];
    
    function dfs(node: TreeNode | null, level: number): void {
        if (!node) return;
        
        if (result.length === level) {
            result.push([]);
        }
        
        result[level].push(node.val);
        
        dfs(node.left, level + 1);
        dfs(node.right, level + 1);
    }
    
    dfs(root, 0);
    return result;
}

// Return flattened array instead of levels
function levelOrderFlat(root: TreeNode | null): number[] {
    if (!root) return [];
    
    const result: number[] = [];
    const queue: TreeNode[] = [root];
    
    while (queue.length > 0) {
        const node = queue.shift()!;
        result.push(node.val);
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    
    return result;
}`,
    tips: [
      "BFS naturally processes nodes level by level",
      "Track level size to separate levels in result",
      "DFS approach requires tracking current level",
      "Consider memory usage: queue width vs recursion depth"
    ],
    tags: ["tree", "binary-tree", "bfs", "queue"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-7",
    question: "Construct Binary Tree from Preorder and Inorder Traversal - Given two arrays preorder and inorder, construct and return the binary tree.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Recursive with Hash Map for O(1) lookups
// Time: O(n), Space: O(n)
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
    const inorderMap = new Map<number, number>();
    
    // Build map for O(1) inorder index lookups
    for (let i = 0; i < inorder.length; i++) {
        inorderMap.set(inorder[i], i);
    }
    
    let preorderIndex = 0;
    
    function build(inorderStart: number, inorderEnd: number): TreeNode | null {
        if (inorderStart > inorderEnd) return null;
        
        // Root is always the next element in preorder
        const rootVal = preorder[preorderIndex++];
        const root = new TreeNode(rootVal);
        
        // Find root position in inorder
        const inorderIndex = inorderMap.get(rootVal)!;
        
        // Build left subtree first (preorder: root, left, right)
        root.left = build(inorderStart, inorderIndex - 1);
        root.right = build(inorderIndex + 1, inorderEnd);
        
        return root;
    }
    
    return build(0, inorder.length - 1);
}

// Alternative without hash map (less efficient)
function buildTreeBasic(preorder: number[], inorder: number[]): TreeNode | null {
    if (preorder.length === 0 || inorder.length === 0) return null;
    
    const rootVal = preorder[0];
    const root = new TreeNode(rootVal);
    
    const rootIndex = inorder.indexOf(rootVal);
    
    // Split arrays
    const leftInorder = inorder.slice(0, rootIndex);
    const rightInorder = inorder.slice(rootIndex + 1);
    const leftPreorder = preorder.slice(1, 1 + leftInorder.length);
    const rightPreorder = preorder.slice(1 + leftInorder.length);
    
    root.left = buildTreeBasic(leftPreorder, leftInorder);
    root.right = buildTreeBasic(rightPreorder, rightInorder);
    
    return root;
}`,
    tips: [
      "Preorder gives root first, inorder shows left/right subtree split",
      "Hash map for inorder indices avoids O(n) searches",
      "Build left subtree before right (preorder sequence)",
      "Handle edge cases: empty arrays, single node"
    ],
    tags: ["tree", "binary-tree", "array", "hash-table", "divide-and-conquer"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-8",
    question: "Kth Smallest Element in BST - Given the root of a binary search tree and k, return the kth smallest value.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Inorder Traversal (Optimal)
// Time: O(h + k), Space: O(h)
function kthSmallest(root: TreeNode | null, k: number): number {
    let count = 0;
    let result = 0;
    
    function inorder(node: TreeNode | null): boolean {
        if (!node) return false;
        
        if (inorder(node.left)) return true;
        
        count++;
        if (count === k) {
            result = node.val;
            return true;
        }
        
        return inorder(node.right);
    }
    
    inorder(root);
    return result;
}

// Approach 2: Iterative Inorder
// Time: O(h + k), Space: O(h)
function kthSmallestIterative(root: TreeNode | null, k: number): number {
    const stack: TreeNode[] = [];
    let current = root;
    let count = 0;
    
    while (stack.length > 0 || current) {
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        current = stack.pop()!;
        count++;
        
        if (count === k) return current.val;
        
        current = current.right;
    }
    
    return -1; // Should not reach here if k is valid
}

// Approach 3: Morris Traversal (O(1) space)
// Time: O(n), Space: O(1)
function kthSmallestMorris(root: TreeNode | null, k: number): number {
    let current = root;
    let count = 0;
    
    while (current) {
        if (!current.left) {
            count++;
            if (count === k) return current.val;
            current = current.right;
        } else {
            // Find inorder predecessor
            let predecessor = current.left;
            while (predecessor.right && predecessor.right !== current) {
                predecessor = predecessor.right;
            }
            
            if (!predecessor.right) {
                // Make current right child of predecessor
                predecessor.right = current;
                current = current.left;
            } else {
                // Revert changes
                predecessor.right = null;
                count++;
                if (count === k) return current.val;
                current = current.right;
            }
        }
    }
    
    return -1;
}`,
    tips: [
      "Inorder traversal of BST gives sorted sequence",
      "Stop early when kth element is found",
      "Iterative approach gives more control over traversal",
      "Morris traversal achieves O(1) space but modifies tree temporarily"
    ],
    tags: ["tree", "binary-search-tree", "dfs"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-tree-9",
    question: "Serialize and Deserialize Binary Tree - Design an algorithm to serialize and deserialize a binary tree.",
    category: "technical",
    difficulty: "hard",
    type: "coding",
    sampleAnswer: `
// Preorder DFS Approach
// Time: O(n) for both operations, Space: O(n)
class Codec {
    // Serialize tree to string
    serialize(root: TreeNode | null): string {
        const result: string[] = [];
        
        function preorder(node: TreeNode | null): void {
            if (!node) {
                result.push("null");
                return;
            }
            
            result.push(node.val.toString());
            preorder(node.left);
            preorder(node.right);
        }
        
        preorder(root);
        return result.join(",");
    }
    
    // Deserialize string to tree
    deserialize(data: string): TreeNode | null {
        const values = data.split(",");
        let index = 0;
        
        function buildTree(): TreeNode | null {
            if (index >= values.length || values[index] === "null") {
                index++;
                return null;
            }
            
            const node = new TreeNode(parseInt(values[index++]));
            node.left = buildTree();
            node.right = buildTree();
            
            return node;
        }
        
        return buildTree();
    }
}

// BFS Level Order Approach
class CodecBFS {
    serialize(root: TreeNode | null): string {
        if (!root) return "";
        
        const result: string[] = [];
        const queue: (TreeNode | null)[] = [root];
        
        while (queue.length > 0) {
            const node = queue.shift()!;
            
            if (node) {
                result.push(node.val.toString());
                queue.push(node.left);
                queue.push(node.right);
            } else {
                result.push("null");
            }
        }
        
        return result.join(",");
    }
    
    deserialize(data: string): TreeNode | null {
        if (!data) return null;
        
        const values = data.split(",");
        const root = new TreeNode(parseInt(values[0]));
        const queue: TreeNode[] = [root];
        let index = 1;
        
        while (queue.length > 0 && index < values.length) {
            const node = queue.shift()!;
            
            if (values[index] !== "null") {
                node.left = new TreeNode(parseInt(values[index]));
                queue.push(node.left);
            }
            index++;
            
            if (index < values.length && values[index] !== "null") {
                node.right = new TreeNode(parseInt(values[index]));
                queue.push(node.right);
            }
            index++;
        }
        
        return root;
    }
}`,
    tips: [
      "Preorder traversal naturally encodes tree structure",
      "Include null markers to handle missing children",
      "Deserialize by maintaining global index for preorder",
      "BFS approach creates level-by-level encoding"
    ],
    tags: ["tree", "binary-tree", "dfs", "bfs", "design"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];