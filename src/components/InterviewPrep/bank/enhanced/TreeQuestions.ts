import { EnhancedQuestion } from "../../InterviewSubjects";

export const treeQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-21",
    question: "Binary tree inorder, preorder, and postorder traversal",
    category: "trees",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Inorder (Left-Root-Right): useful for BST to get sorted order. Preorder (Root-Left-Right): useful for copying tree. Postorder (Left-Right-Root): useful for deleting tree. Can be implemented recursively or iteratively using stack. Recursive is simpler, iterative uses explicit stack.",
    tips: [
      "Explain the order of visits for each traversal",
      "Discuss recursive vs iterative implementations",
      "Mention practical use cases for each traversal"
    ],
    tags: ["trees", "traversal", "recursion"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Recursive Traversals
function inorderRecursive(root, result = []) {
    if (root) {
        inorderRecursive(root.left, result);   // Left
        result.push(root.val);                 // Root
        inorderRecursive(root.right, result);  // Right
    }
    return result;
}

function preorderRecursive(root, result = []) {
    if (root) {
        result.push(root.val);                  // Root
        preorderRecursive(root.left, result);   // Left
        preorderRecursive(root.right, result);  // Right
    }
    return result;
}

function postorderRecursive(root, result = []) {
    if (root) {
        postorderRecursive(root.left, result);  // Left
        postorderRecursive(root.right, result); // Right
        result.push(root.val);                  // Root
    }
    return result;
}

// Iterative Traversals
function inorderIterative(root) {
    const result = [];
    const stack = [];
    let current = root;
    
    while (current || stack.length > 0) {
        // Go to leftmost node
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        // Process node
        current = stack.pop();
        result.push(current.val);
        
        // Move to right subtree
        current = current.right;
    }
    
    return result;
}

function preorderIterative(root) {
    if (!root) return [];
    
    const result = [];
    const stack = [root];
    
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node.val);
        
        // Push right first so left is processed first
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    
    return result;
}`,
        explanation: "Tree traversals visit nodes in different orders. Recursive implementations are intuitive, iterative use explicit stack to simulate recursion.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) where h is height of tree",
        approach: "DFS Traversal"
      },
      python: {
        solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Recursive Traversals
def inorder_recursive(root):
    result = []
    
    def inorder(node):
        if node:
            inorder(node.left)    # Left
            result.append(node.val)  # Root
            inorder(node.right)   # Right
    
    inorder(root)
    return result

def preorder_recursive(root):
    result = []
    
    def preorder(node):
        if node:
            result.append(node.val)  # Root
            preorder(node.left)      # Left
            preorder(node.right)     # Right
    
    preorder(root)
    return result

def postorder_recursive(root):
    result = []
    
    def postorder(node):
        if node:
            postorder(node.left)     # Left
            postorder(node.right)    # Right
            result.append(node.val)  # Root
    
    postorder(root)
    return result

# Iterative Traversals
def inorder_iterative(root):
    result = []
    stack = []
    current = root
    
    while current or stack:
        # Go to leftmost node
        while current:
            stack.append(current)
            current = current.left
        
        # Process node
        current = stack.pop()
        result.append(current.val)
        
        # Move to right subtree
        current = current.right
    
    return result`,
        explanation: "Python implementation with clean syntax. Uses nested functions for recursive approach and explicit stack for iterative.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        approach: "DFS Traversal"
      },
      java: {
        solution: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Recursive Traversals
public List<Integer> inorderRecursive(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    inorderHelper(root, result);
    return result;
}

private void inorderHelper(TreeNode node, List<Integer> result) {
    if (node != null) {
        inorderHelper(node.left, result);   // Left
        result.add(node.val);               // Root
        inorderHelper(node.right, result);  // Right
    }
}

// Iterative Inorder
public List<Integer> inorderIterative(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    TreeNode current = root;
    
    while (current != null || !stack.isEmpty()) {
        // Go to leftmost node
        while (current != null) {
            stack.push(current);
            current = current.left;
        }
        
        // Process node
        current = stack.pop();
        result.add(current.val);
        
        // Move to right subtree
        current = current.right;
    }
    
    return result;
}`,
        explanation: "Java implementation with proper TreeNode class. Uses helper methods for recursion and Stack class for iteration.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        approach: "DFS Traversal"
      }
    },
    algorithmSteps: [
      "Choose traversal type based on use case",
      "Recursive: Define base case (null node)",
      "Visit nodes in specified order (left, root, right for inorder)",
      "Iterative: Use explicit stack to simulate recursion",
      "For inorder: go left, process, go right",
      "For preorder: process, go left, go right",
      "For postorder: go left, go right, process"
    ],
    commonMistakes: [
      "Confusing the order of operations for different traversals",
      "Not handling null nodes in recursive base case",
      "Stack overflow for very deep trees in recursive approach",
      "Incorrect stack operations in iterative implementation"
    ],
    optimizations: [
      "Iterative approach avoids recursion overhead",
      "Morris traversal can achieve O(1) space",
      "Early termination for search operations"
    ],
    relatedQuestions: ["Binary Tree Level Order Traversal", "Binary Tree Zigzag Traversal", "Morris Traversal"]
  },

  {
    id: "dsa-22",
    question: "Maximum depth/height of a binary tree",
    category: "trees",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Recursive approach: if node is null, return 0; otherwise return 1 + max(height of left subtree, height of right subtree). Iterative approach: use level-order traversal (BFS) and count levels. Time complexity: O(n), Space complexity: O(h) where h is height.",
    tips: [
      "Clarify difference between depth and height",
      "Consider balanced vs unbalanced trees",
      "Discuss BFS vs DFS approaches"
    ],
    tags: ["trees", "height", "recursion"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Recursive approach (DFS)
function maxDepthRecursive(root) {
    if (root === null) {
        return 0;
    }
    
    const leftDepth = maxDepthRecursive(root.left);
    const rightDepth = maxDepthRecursive(root.right);
    
    return 1 + Math.max(leftDepth, rightDepth);
}

// Iterative approach (BFS)
function maxDepthIterative(root) {
    if (root === null) return 0;
    
    const queue = [root];
    let depth = 0;
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        depth++;
        
        // Process all nodes at current level
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    
    return depth;
}

// DFS with stack
function maxDepthDFSStack(root) {
    if (root === null) return 0;
    
    const stack = [[root, 1]]; // [node, depth]
    let maxDepth = 0;
    
    while (stack.length > 0) {
        const [node, depth] = stack.pop();
        maxDepth = Math.max(maxDepth, depth);
        
        if (node.left) stack.push([node.left, depth + 1]);
        if (node.right) stack.push([node.right, depth + 1]);
    }
    
    return maxDepth;
}`,
        explanation: "Multiple approaches: recursive DFS is most intuitive, BFS counts levels, DFS with stack avoids recursion. All achieve same result with different space characteristics.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursive, O(w) BFS where w is max width",
        approach: "DFS / BFS"
      },
      python: {
        solution: `from collections import deque

def max_depth_recursive(root):
    if not root:
        return 0
    
    left_depth = max_depth_recursive(root.left)
    right_depth = max_depth_recursive(root.right)
    
    return 1 + max(left_depth, right_depth)

def max_depth_iterative_bfs(root):
    if not root:
        return 0
    
    queue = deque([root])
    depth = 0
    
    while queue:
        level_size = len(queue)
        depth += 1
        
        # Process all nodes at current level
        for _ in range(level_size):
            node = queue.popleft()
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    
    return depth

def max_depth_dfs_stack(root):
    if not root:
        return 0
    
    stack = [(root, 1)]  # (node, depth)
    max_depth = 0
    
    while stack:
        node, depth = stack.pop()
        max_depth = max(max_depth, depth)
        
        if node.left:
            stack.append((node.left, depth + 1))
        if node.right:
            stack.append((node.right, depth + 1))
    
    return max_depth`,
        explanation: "Python implementation using deque for efficient queue operations. Shows three different approaches with same time complexity.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursive, O(w) BFS",
        approach: "DFS / BFS"
      },
      java: {
        solution: `public int maxDepthRecursive(TreeNode root) {
    if (root == null) {
        return 0;
    }
    
    int leftDepth = maxDepthRecursive(root.left);
    int rightDepth = maxDepthRecursive(root.right);
    
    return 1 + Math.max(leftDepth, rightDepth);
}

public int maxDepthIterativeBFS(TreeNode root) {
    if (root == null) return 0;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    int depth = 0;
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        depth++;
        
        // Process all nodes at current level
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    
    return depth;
}

public int maxDepthDFSStack(TreeNode root) {
    if (root == null) return 0;
    
    Stack<Pair<TreeNode, Integer>> stack = new Stack<>();
    stack.push(new Pair<>(root, 1));
    int maxDepth = 0;
    
    while (!stack.isEmpty()) {
        Pair<TreeNode, Integer> current = stack.pop();
        TreeNode node = current.getKey();
        int depth = current.getValue();
        
        maxDepth = Math.max(maxDepth, depth);
        
        if (node.left != null) {
            stack.push(new Pair<>(node.left, depth + 1));
        }
        if (node.right != null) {
            stack.push(new Pair<>(node.right, depth + 1));
        }
    }
    
    return maxDepth;
}`,
        explanation: "Java implementation using Queue for BFS and Stack for DFS. The Pair class helps store node with its depth.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) recursive, O(w) BFS",
        approach: "DFS / BFS"
      }
    },
    algorithmSteps: [
      "Choose between recursive or iterative approach",
      "Recursive: Base case - return 0 for null node",
      "Calculate depth of left and right subtrees",
      "Return 1 + maximum of left and right depths",
      "Iterative BFS: Use queue to process level by level",
      "Count levels as depth",
      "DFS with stack: Store node with current depth"
    ],
    commonMistakes: [
      "Confusing depth vs height terminology",
      "Not handling null root case",
      "Stack overflow for very deep trees",
      "Incorrect level counting in BFS"
    ],
    optimizations: [
      "BFS approach good for wide trees",
      "DFS recursive natural for balanced trees",
      "Early termination possible if max depth limit known"
    ],
    relatedQuestions: ["Minimum Depth of Binary Tree", "Balanced Binary Tree", "Diameter of Binary Tree"]
  },

  {
    id: "dsa-24",
    question: "Lowest Common Ancestor (LCA) in a binary tree",
    category: "trees",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Recursive approach: if current node is null or equals either target node, return current node. Recursively find LCA in left and right subtrees. If both return non-null, current node is LCA. If only one returns non-null, that's the LCA. Time complexity: O(n), Space complexity: O(h).",
    tips: [
      "Handle case where one node is ancestor of another",
      "Consider BST vs general binary tree",
      "Discuss iterative approach using parent pointers"
    ],
    tags: ["trees", "lca", "recursion"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function lowestCommonAncestor(root, p, q) {
    // Base case: if root is null or equals either target
    if (root === null || root === p || root === q) {
        return root;
    }
    
    // Search in left and right subtrees
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    
    // If both sides return non-null, current node is LCA
    if (left && right) {
        return root;
    }
    
    // Return whichever side found the nodes
    return left || right;
}

// Alternative: Using parent pointers (if available)
function lcaWithParents(p, q) {
    const ancestors = new Set();
    
    // Collect all ancestors of p
    let current = p;
    while (current) {
        ancestors.add(current);
        current = current.parent;
    }
    
    // Find first common ancestor of q
    current = q;
    while (current) {
        if (ancestors.has(current)) {
            return current;
        }
        current = current.parent;
    }
    
    return null;
}`,
        explanation: "Recursive approach leverages the tree structure. If both subtrees contain target nodes, current node is LCA. Parent pointer approach treats it as finding intersection of two linked lists.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h) for recursion stack",
        approach: "Recursive DFS"
      },
      python: {
        solution: `def lowest_common_ancestor(root, p, q):
    # Base case: if root is null or equals either target
    if not root or root == p or root == q:
        return root
    
    # Search in left and right subtrees
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    
    # If both sides return non-null, current node is LCA
    if left and right:
        return root
    
    # Return whichever side found the nodes
    return left or right

# For BST (more efficient)
def lca_bst(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None`,
        explanation: "Python implementation with clean logic. Includes BST optimization that uses the ordering property for O(h) time complexity.",
        timeComplexity: "O(n) general tree, O(h) BST",
        spaceComplexity: "O(h)",
        approach: "Recursive DFS"
      },
      java: {
        solution: `public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    // Base case: if root is null or equals either target
    if (root == null || root == p || root == q) {
        return root;
    }
    
    // Search in left and right subtrees
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    
    // If both sides return non-null, current node is LCA
    if (left != null && right != null) {
        return root;
    }
    
    // Return whichever side found the nodes
    return left != null ? left : right;
}

// For BST optimization
public TreeNode lcaBST(TreeNode root, TreeNode p, TreeNode q) {
    while (root != null) {
        if (p.val < root.val && q.val < root.val) {
            root = root.left;
        } else if (p.val > root.val && q.val > root.val) {
            root = root.right;
        } else {
            return root;
        }
    }
    return null;
}`,
        explanation: "Java implementation with null safety. BST version uses ordering property to avoid recursion and achieve better space complexity.",
        timeComplexity: "O(n) general tree, O(h) BST",
        spaceComplexity: "O(h) recursive, O(1) BST iterative",
        approach: "Recursive DFS"
      }
    },
    algorithmSteps: [
      "Start from root node",
      "Check if current node is null or equals either target",
      "If yes, return current node",
      "Recursively search in left subtree",
      "Recursively search in right subtree",
      "If both subtrees return non-null, current node is LCA",
      "Otherwise, return the non-null result"
    ],
    commonMistakes: [
      "Not handling case where one node is ancestor of another",
      "Incorrect base case handling",
      "Not understanding when current node is the LCA",
      "Forgetting that nodes might not exist in tree"
    ],
    optimizations: [
      "BST optimization using ordering property",
      "Early termination when both targets found",
      "Iterative approach to save space"
    ],
    relatedQuestions: ["LCA of BST", "LCA of Deepest Leaves", "Distance Between Nodes"]
  }
];