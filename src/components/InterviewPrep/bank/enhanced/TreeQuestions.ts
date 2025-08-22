import { Question } from "../../InterviewSubjects";

// Enhanced Tree DSA Questions with comprehensive implementations
export const enhancedTreeQuestions: Question[] = [
  {
    id: "enhanced-tree-1",
    question: "Invert Binary Tree - Given the root of a binary tree, invert the tree and return its root.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach: "Multiple approaches available: 1) Recursive DFS (O(n) time, O(h) space): Most intuitive approach using recursion to swap children and invert subtrees. 2) Iterative BFS (O(n) time, O(w) space): Use queue for level-by-level processing, avoiding potential stack overflow. 3) Iterative DFS with Stack (O(n) time, O(h) space): Use stack for depth-first traversal without recursion. Recursive approach is most intuitive, while iterative approaches provide better space control and avoid stack overflow for deep trees.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Tree Node Definition
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
}`,
        explanation: "Recursive DFS approach is most intuitive. Swaps children at each node and recursively inverts subtrees."
      },
      {
        language: "Python",
        code: `# Tree Node Definition
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Approach 1: Recursive (DFS)
# Time: O(n), Space: O(h) where h is height
def invertTree(root):
    if not root:
        return None
    
    # Swap children
    root.left, root.right = root.right, root.left
    
    # Recursively invert subtrees
    invertTree(root.left)
    invertTree(root.right)
    
    return root`,
        explanation: "Recursive DFS approach is most intuitive. Swaps children at each node and recursively inverts subtrees."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Iterative (BFS)
// Time: O(n), Space: O(w) where w is max width
function invertTreeIterative(root: TreeNode | null): TreeNode | null {
    if (!root) return null;
    
    const queue: TreeNode[] = [root];
    
    while (queue.length > 0) {
        const node = queue.shift()!;
        
        // Swap children
        [node.left, node.right] = [root.right, root.left];
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    
    return root;
}`,
        explanation: "Iterative BFS approach uses queue for level-by-level processing. Avoids stack overflow for deep trees."
      },
      {
        language: "Python",
        code: `# Approach 2: Iterative (BFS)
# Time: O(n), Space: O(w) where w is max width
from collections import deque

def invertTreeIterative(root):
    if not root:
        return None
    
    queue = deque([root])
    
    while queue:
        node = queue.popleft()
        
        # Swap children
        node.left, node.right = node.right, node.left
        
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    
    return root`,
        explanation: "Iterative BFS approach uses queue for level-by-level processing. Avoids stack overflow for deep trees."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Iterative (DFS with stack)
// Time: O(n), Space: O(h) where h is height
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
        explanation: "Iterative DFS with stack provides depth-first traversal without recursion. Good space control."
      },
      {
        language: "Python",
        code: `# Approach 3: Iterative (DFS with stack)
# Time: O(n), Space: O(h) where h is height
def invertTreeDFS(root):
    if not root:
        return None
    
    stack = [root]
    
    while stack:
        node = stack.pop()
        
        # Swap children
        node.left, node.right = node.right, node.left
        
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    
    return root`,
        explanation: "Iterative DFS with stack provides depth-first traversal without recursion. Good space control."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Recursive DFS (O(n) time, O(h) space): Most natural recursive solution using Math.max of left and right subtree depths. 2) Iterative BFS (O(n) time, O(w) space): Level-by-level processing with explicit depth tracking using queue. 3) Iterative DFS with Stack (O(n) time, O(h) space): Use stack with node-depth pairs for depth-first traversal. Recursive approach is most intuitive, while BFS provides explicit level tracking and DFS with stack offers alternative iterative solution.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Recursive DFS
// Time: O(n), Space: O(h) where h is height
function maxDepth(root: TreeNode | null): number {
    if (!root) return 0;
    
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
        explanation: "Recursive DFS approach is most natural for tree problems. Returns 1 + maximum of left and right subtree depths."
      },
      {
        language: "Python",
        code: `# Approach 1: Recursive DFS
# Time: O(n), Space: O(h) where h is height
def maxDepth(root):
    if not root:
        return 0
    
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
        explanation: "Recursive DFS approach is most natural for tree problems. Returns 1 + maximum of left and right subtree depths."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Iterative BFS
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
}`,
        explanation: "Iterative BFS processes level by level with explicit depth tracking. Good for understanding tree structure."
      },
      {
        language: "Python",
        code: `# Approach 2: Iterative BFS
# Time: O(n), Space: O(w) where w is max width
from collections import deque

def maxDepthBFS(root):
    if not root:
        return 0
    
    queue = deque([root])
    depth = 0
    
    while queue:
        level_size = len(queue)
        depth += 1
        
        for _ in range(level_size):
            node = queue.popleft()
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    
    return depth`,
        explanation: "Iterative BFS processes level by level with explicit depth tracking. Good for understanding tree structure."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Iterative DFS with stack
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
        explanation: "Iterative DFS with stack pairs nodes with their depths. Alternative iterative approach without recursion."
      },
      {
        language: "Python",
        code: `# Approach 3: Iterative DFS with stack
# Time: O(n), Space: O(h)
def maxDepthDFS(root):
    if not root:
        return 0
    
    stack = [(root, 1)]
    max_depth = 0
    
    while stack:
        node, depth = stack.pop()
        max_depth = max(max_depth, depth)
        
        if node.left:
            stack.append((node.left, depth + 1))
        if node.right:
            stack.append((node.right, depth + 1))
    
    return max_depth`,
        explanation: "Iterative DFS with stack pairs nodes with their depths. Alternative iterative approach without recursion."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Recursive Approach (O(n) time, O(h) space): Most readable solution with clear null handling and recursive subtree comparison. 2) Iterative DFS with Stack (O(n) time, O(h) space): Use stack to avoid potential stack overflow for deep trees. 3) BFS Approach (O(n) time, O(w) space): Level-by-level comparison using queue. Recursive approach is most intuitive and readable, while iterative approaches provide better space control and avoid stack overflow for very deep trees.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Recursive Approach (Optimal)
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
}`,
        explanation: "Recursive approach is most readable with clear null handling. Compares values and recursively checks subtrees."
      },
      {
        language: "Python",
        code: `# Approach 1: Recursive Approach (Optimal)
# Time: O(n), Space: O(h)
def isSameTree(p, q):
    # Both null
    if not p and not q:
        return True
    
    # One null, one not null
    if not p or not q:
        return False
    
    # Values different
    if p.val != q.val:
        return False
    
    # Check subtrees
    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)`,
        explanation: "Recursive approach is most readable with clear null handling. Compares values and recursively checks subtrees."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Iterative DFS with Stack
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
}`,
        explanation: "Iterative DFS with stack avoids potential stack overflow for deep trees. Uses stack for depth-first traversal."
      },
      {
        language: "Python",
        code: `# Approach 2: Iterative DFS with Stack
# Time: O(n), Space: O(h)
def isSameTreeIterative(p, q):
    stack = [(p, q)]
    
    while stack:
        node1, node2 = stack.pop()
        
        if not node1 and not node2:
            continue
        if not node1 or not node2 or node1.val != node2.val:
            return False
        
        stack.append((node1.left, node2.left))
        stack.append((node1.right, node2.right))
    
    return True`,
        explanation: "Iterative DFS with stack avoids potential stack overflow for deep trees. Uses stack for depth-first traversal."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: BFS Approach
// Time: O(n), Space: O(w) where w is max width
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
        explanation: "BFS approach provides level-by-level comparison using queue. Good for understanding tree structure."
      },
      {
        language: "Python",
        code: `# Approach 3: BFS Approach
# Time: O(n), Space: O(w) where w is max width
from collections import deque

def isSameTreeBFS(p, q):
    queue = deque([(p, q)])
    
    while queue:
        node1, node2 = queue.popleft()
        
        if not node1 and not node2:
            continue
        if not node1 or not node2 or node1.val != node2.val:
            return False
        
        queue.append((node1.left, node2.left))
        queue.append((node1.right, node2.right))
    
    return True`,
        explanation: "BFS approach provides level-by-level comparison using queue. Good for understanding tree structure."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Bounds Checking (O(n) time, O(h) space): Use min/max bounds to validate BST property at each node. 2) Inorder Traversal (O(n) time, O(h) space): Leverage fact that inorder traversal of BST should be strictly increasing. 3) Iterative Inorder (O(n) time, O(h) space): Iterative version of inorder traversal to avoid stack overflow. 4) Safe Bounds with Node References: Handle integer overflow by using node references instead of numeric bounds. Bounds checking is most intuitive, while inorder traversal leverages BST properties effectively.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Bounds Checking (Optimal)
// Time: O(n), Space: O(h)
function isValidBST(root: TreeNode | null): boolean {
    function validate(node: TreeNode | null, min: number, max: number): boolean {
        if (!node) return true;
        
        if (node.val <= min || node.val >= max) return false;
        
        return validate(node.left, min, node.val) && 
               validate(node.right, node.val, max);
    }
    
    return validate(root, -Infinity, Infinity);
}`,
        explanation: "Bounds checking approach maintains min/max constraints at each node. Most intuitive and efficient method."
      },
      {
        language: "Python",
        code: `# Approach 1: Bounds Checking (Optimal)
# Time: O(n), Space: O(h)
def isValidBST(root):
    def validate(node, min_val, max_val):
        if not node:
            return True
        
        if node.val <= min_val or node.val >= max_val:
            return False
        
        return (validate(node.left, min_val, node.val) and 
                validate(node.right, node.val, max_val))
    
    return validate(root, float('-inf'), float('inf'))`,
        explanation: "Bounds checking approach maintains min/max constraints at each node. Most intuitive and efficient method."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Inorder Traversal
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
}`,
        explanation: "Inorder traversal leverages BST property that values should be strictly increasing. Elegant recursive solution."
      },
      {
        language: "Python",
        code: `# Approach 2: Inorder Traversal
# Time: O(n), Space: O(h)
def isValidBSTInorder(root):
    def inorder(node):
        if not node:
            return True
        
        if not inorder(node.left):
            return False
        
        if inorder.prev is not None and node.val <= inorder.prev:
            return False
        inorder.prev = node.val
        
        return inorder(node.right)
    
    inorder.prev = None
    return inorder(root)`,
        explanation: "Inorder traversal leverages BST property that values should be strictly increasing. Elegant recursive solution."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Iterative Inorder
// Time: O(n), Space: O(h)
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
}`,
        explanation: "Iterative inorder traversal avoids stack overflow for deep trees. Same logic as recursive version."
      },
      {
        language: "Python",
        code: `# Approach 3: Iterative Inorder
# Time: O(n), Space: O(h)
def isValidBSTIterative(root):
    stack = []
    current = root
    prev = None
    
    while stack or current:
        while current:
            stack.append(current)
            current = current.left
        
        current = stack.pop()
        
        if prev is not None and current.val <= prev:
            return False
        prev = current.val
        
        current = current.right
    
    return True`,
        explanation: "Iterative inorder traversal avoids stack overflow for deep trees. Same logic as recursive version."
      },
      {
        language: "TypeScript",
        code: `// Approach 4: Safe Bounds with Node References
// Time: O(n), Space: O(h)
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
        explanation: "Safe bounds approach uses node references instead of numeric bounds to handle integer overflow cases."
      },
      {
        language: "Python",
        code: `# Approach 4: Safe Bounds with Node References
# Time: O(n), Space: O(h)
def isValidBSTSafe(root):
    def validate(node, min_node, max_node):
        if not node:
            return True
        
        if ((min_node and node.val <= min_node.val) or 
            (max_node and node.val >= max_node.val)):
            return False
        
        return (validate(node.left, min_node, node) and 
                validate(node.right, node, max_node))
    
    return validate(root, None, None)`,
        explanation: "Safe bounds approach uses node references instead of numeric bounds to handle integer overflow cases."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Recursive (O(h) time, O(h) space): Leverage BST property to determine which subtree contains both nodes. 2) Iterative (O(h) time, O(1) space): Same logic as recursive but more space-efficient. 3) General Binary Tree Solution: Works for any binary tree by finding nodes in left and right subtrees. Recursive approach is most intuitive for BST, while iterative version provides better space efficiency. General solution demonstrates how to solve LCA without BST properties.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Recursive (Optimal for BST)
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
}`,
        explanation: "Recursive approach leverages BST property to determine subtree direction. Most intuitive for BST problems."
      },
      {
        language: "Python",
        code: `# Approach 1: Recursive (Optimal for BST)
# Time: O(h), Space: O(h) where h is height
def lowestCommonAncestor(root, p, q):
    if not root:
        return None
    
    # Both nodes are in left subtree
    if p.val < root.val and q.val < root.val:
        return lowestCommonAncestor(root.left, p, q)
    
    # Both nodes are in right subtree
    if p.val > root.val and q.val > root.val:
        return lowestCommonAncestor(root.right, p, q)
    
    # Nodes are on different sides, current node is LCA
    return root`,
        explanation: "Recursive approach leverages BST property to determine subtree direction. Most intuitive for BST problems."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Iterative (Space Efficient)
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
}`,
        explanation: "Iterative solution provides same logic as recursive but with O(1) space complexity."
      },
      {
        language: "Python",
        code: `# Approach 2: Iterative (Space Efficient)
# Time: O(h), Space: O(1)
def lowestCommonAncestorIterative(root, p, q):
    current = root
    
    while current:
        if p.val < current.val and q.val < current.val:
            current = current.left
        elif p.val > current.val and q.val > current.val:
            current = current.right
        else:
            return current
    
    return None`,
        explanation: "Iterative solution provides same logic as recursive but with O(1) space complexity."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: For General Binary Tree (Not BST)
// Time: O(n), Space: O(h)
function lowestCommonAncestorBT(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
    if (!root || root === p || root === q) return root;
    
    const left = lowestCommonAncestorBT(root.left, p, q);
    const right = lowestCommonAncestorBT(root.right, p, q);
    
    if (left && right) return root; // Found both nodes in different subtrees
    return left || right; // Return the non-null result
}`,
        explanation: "General binary tree solution doesn't use BST properties. Works by finding nodes in left and right subtrees."
      },
      {
        language: "Python",
        code: `# Approach 3: For General Binary Tree (Not BST)
# Time: O(n), Space: O(h)
def lowestCommonAncestorBT(root, p, q):
    if not root or root == p or root == q:
        return root
    
    left = lowestCommonAncestorBT(root.left, p, q)
    right = lowestCommonAncestorBT(root.right, p, q)
    
    if left and right:
        return root  # Found both nodes in different subtrees
    return left or right  # Return the non-null result`,
        explanation: "General binary tree solution doesn't use BST properties. Works by finding nodes in left and right subtrees."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) BFS with Queue (O(n) time, O(w) space): Standard approach using queue for level-by-level processing. 2) DFS Approach (O(n) time, O(h) space): Less intuitive but possible using depth-first traversal with level tracking. 3) Flattened Array: Return single array instead of nested levels. BFS naturally processes nodes level by level and is most intuitive, while DFS approach demonstrates alternative thinking. Consider memory usage: queue width vs recursion depth.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: BFS with Queue (Standard approach)
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
}`,
        explanation: "BFS naturally processes nodes level by level using queue. Most intuitive and standard approach."
      },
      {
        language: "Python",
        code: `# Approach 1: BFS with Queue (Standard approach)
# Time: O(n), Space: O(w) where w is max width
from collections import deque

def levelOrder(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        current_level = []
        
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(current_level)
    
    return result`,
        explanation: "BFS naturally processes nodes level by level using queue. Most intuitive and standard approach."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: DFS Approach (Less intuitive but possible)
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
}`,
        explanation: "DFS approach requires tracking current level. Demonstrates alternative thinking for level order traversal."
      },
      {
        language: "Python",
        code: `# Approach 2: DFS Approach (Less intuitive but possible)
# Time: O(n), Space: O(h)
def levelOrderDFS(root):
    result = []
    
    def dfs(node, level):
        if not node:
            return
        
        if len(result) == level:
            result.append([])
        
        result[level].append(node.val)
        
        dfs(node.left, level + 1)
        dfs(node.right, level + 1)
    
    dfs(root, 0)
    return result`,
        explanation: "DFS approach requires tracking current level. Demonstrates alternative thinking for level order traversal."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Return Flattened Array Instead of Levels
// Time: O(n), Space: O(w)
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
        explanation: "Flattened array approach returns single array without level separation. Simpler output format."
      },
      {
        language: "Python",
        code: `# Approach 3: Return Flattened Array Instead of Levels
# Time: O(n), Space: O(w)
from collections import deque

def levelOrderFlat(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        node = queue.popleft()
        result.append(node.val)
        
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    
    return result`,
        explanation: "Flattened array approach returns single array without level separation. Simpler output format."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Recursive with Hash Map (O(n) time, O(n) space): Use hash map for O(1) inorder index lookups, most efficient approach. 2) Basic Recursive (O(n²) time, O(n) space): Simple recursive approach without hash map, less efficient due to O(n) searches. Hash map approach is optimal for time complexity, while basic approach demonstrates the fundamental concept. Both approaches use divide-and-conquer strategy: preorder gives root first, inorder shows left/right subtree split.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Recursive with Hash Map for O(1) lookups
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
}`,
        explanation: "Hash map approach provides O(1) inorder index lookups. Most efficient solution with optimal time complexity."
      },
      {
        language: "Python",
        code: `# Approach 1: Recursive with Hash Map for O(1) lookups
# Time: O(n), Space: O(n)
def buildTree(preorder, inorder):
    inorder_map = {val: i for i, val in enumerate(inorder)}
    preorder_index = 0
    
    def build(inorder_start, inorder_end):
        nonlocal preorder_index
        
        if inorder_start > inorder_end:
            return None
        
        # Root is always the next element in preorder
        root_val = preorder[preorder_index]
        preorder_index += 1
        root = TreeNode(root_val)
        
        # Find root position in inorder
        inorder_index = inorder_map[root_val]
        
        # Build left subtree first (preorder: root, left, right)
        root.left = build(inorder_start, inorder_index - 1)
        root.right = build(inorder_index + 1, inorder_end)
        
        return root
    
    return build(0, len(inorder) - 1)`,
        explanation: "Hash map approach provides O(1) inorder index lookups. Most efficient solution with optimal time complexity."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Alternative without hash map (less efficient)
// Time: O(n²), Space: O(n)
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
        explanation: "Basic recursive approach demonstrates fundamental concept without hash map. Less efficient due to O(n) searches."
      },
      {
        language: "Python",
        code: `# Approach 2: Alternative without hash map (less efficient)
# Time: O(n²), Space: O(n)
def buildTreeBasic(preorder, inorder):
    if not preorder or not inorder:
        return None
    
    root_val = preorder[0]
    root = TreeNode(root_val)
    
    root_index = inorder.index(root_val)
    
    # Split arrays
    left_inorder = inorder[:root_index]
    right_inorder = inorder[root_index + 1:]
    left_preorder = preorder[1:1 + len(left_inorder)]
    right_preorder = preorder[1 + len(left_inorder):]
    
    root.left = buildTreeBasic(left_preorder, left_inorder)
    root.right = buildTreeBasic(right_preorder, right_inorder)
    
    return root`,
        explanation: "Basic recursive approach demonstrates fundamental concept without hash map. Less efficient due to O(n) searches."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Inorder Traversal (O(h + k) time, O(h) space): Recursive inorder traversal with early termination when kth element is found. 2) Iterative Inorder (O(h + k) time, O(h) space): Iterative version using stack for better control over traversal. 3) Morris Traversal (O(n) time, O(1) space): Achieves constant space by temporarily modifying tree structure. Inorder traversal is most intuitive for BST, while Morris traversal provides space optimization at the cost of temporary tree modification.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Inorder Traversal (Optimal)
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
}`,
        explanation: "Recursive inorder traversal with early termination. Most intuitive approach leveraging BST sorted property."
      },
      {
        language: "Python",
        code: `# Approach 1: Inorder Traversal (Optimal)
# Time: O(h + k), Space: O(h)
def kthSmallest(root, k):
    def inorder(node):
        if not node:
            return False
        
        if inorder(node.left):
            return True
        
        inorder.count += 1
        if inorder.count == k:
            inorder.result = node.val
            return True
        
        return inorder(node.right)
    
    inorder.count = 0
    inorder.result = 0
    inorder(root)
    return inorder.result`,
        explanation: "Recursive inorder traversal with early termination. Most intuitive approach leveraging BST sorted property."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Iterative Inorder
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
}`,
        explanation: "Iterative inorder traversal gives more control over the process. Avoids potential stack overflow."
      },
      {
        language: "Python",
        code: `# Approach 2: Iterative Inorder
# Time: O(h + k), Space: O(h)
def kthSmallestIterative(root, k):
    stack = []
    current = root
    count = 0
    
    while stack or current:
        while current:
            stack.append(current)
            current = current.left
        
        current = stack.pop()
        count += 1
        
        if count == k:
            return current.val
        
        current = current.right
    
    return -1  # Should not reach here if k is valid`,
        explanation: "Iterative inorder traversal gives more control over the process. Avoids potential stack overflow."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Morris Traversal (O(1) space)
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
        explanation: "Morris traversal achieves O(1) space by temporarily modifying tree structure. Advanced optimization technique."
      },
      {
        language: "Python",
        code: `# Approach 3: Morris Traversal (O(1) space)
# Time: O(n), Space: O(1)
def kthSmallestMorris(root, k):
    current = root
    count = 0
    
    while current:
        if not current.left:
            count += 1
            if count == k:
                return current.val
            current = current.right
        else:
            # Find inorder predecessor
            predecessor = current.left
            while predecessor.right and predecessor.right != current:
                predecessor = predecessor.right
            
            if not predecessor.right:
                # Make current right child of predecessor
                predecessor.right = current
                current = current.left
            else:
                # Revert changes
                predecessor.right = None
                count += 1
                if count == k:
                    return current.val
                current = current.right
    
    return -1`,
        explanation: "Morris traversal achieves O(1) space by temporarily modifying tree structure. Advanced optimization technique."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Preorder DFS Approach (O(n) time, O(n) space): Use preorder traversal to naturally encode tree structure with null markers. 2) BFS Level Order Approach (O(n) time, O(n) space): Level-by-level encoding using queue for breadth-first serialization. Preorder approach is most intuitive as it naturally encodes tree structure, while BFS approach creates level-by-level encoding. Both approaches handle missing children with null markers and provide efficient serialization/deserialization.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Preorder DFS Approach
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
}`,
        explanation: "Preorder traversal naturally encodes tree structure. Most intuitive approach for serialization/deserialization."
      },
      {
        language: "Python",
        code: `# Approach 1: Preorder DFS Approach
# Time: O(n) for both operations, Space: O(n)
class Codec:
    def serialize(self, root):
        """Encodes a tree to a single string."""
        result = []
        
        def preorder(node):
            if not node:
                result.append("null")
                return
            
            result.append(str(node.val))
            preorder(node.left)
            preorder(node.right)
        
        preorder(root)
        return ",".join(result)
    
    def deserialize(self, data):
        """Decodes your encoded data to tree."""
        values = data.split(",")
        self.index = 0
        
        def build_tree():
            if self.index >= len(values) or values[self.index] == "null":
                self.index += 1
                return None
            
            node = TreeNode(int(values[self.index]))
            self.index += 1
            node.left = build_tree()
            node.right = build_tree()
            
            return node
        
        return build_tree()`,
        explanation: "Preorder traversal naturally encodes tree structure. Most intuitive approach for serialization/deserialization."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: BFS Level Order Approach
// Time: O(n) for both operations, Space: O(n)
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
        explanation: "BFS approach creates level-by-level encoding using queue. Alternative perspective on tree serialization."
      },
      {
        language: "Python",
        code: `# Approach 2: BFS Level Order Approach
# Time: O(n) for both operations, Space: O(n)
from collections import deque

class CodecBFS:
    def serialize(self, root):
        """Encodes a tree to a single string."""
        if not root:
            return ""
        
        result = []
        queue = deque([root])
        
        while queue:
            node = queue.popleft()
            
            if node:
                result.append(str(node.val))
                queue.append(node.left)
                queue.append(node.right)
            else:
                result.append("null")
        
        return ",".join(result)
    
    def deserialize(self, data):
        """Decodes your encoded data to tree."""
        if not data:
            return None
        
        values = data.split(",")
        root = TreeNode(int(values[0]))
        queue = deque([root])
        index = 1
        
        while queue and index < len(values):
            node = queue.popleft()
            
            if values[index] != "null":
                node.left = TreeNode(int(values[index]))
                queue.append(node.left)
            index += 1
            
            if index < len(values) and values[index] != "null":
                node.right = TreeNode(int(values[index]))
                queue.append(node.right)
            index += 1
        
        return root`,
        explanation: "BFS approach creates level-by-level encoding using queue. Alternative perspective on tree serialization."
      }
    ],
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
  },
  {
    id: "enhanced-tree-10",
    question: "Binary Tree Maximum Path Sum - Given a binary tree, find the maximum path sum where path may start and end at any node.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Post-order DFS with Global Maximum (O(n) time, O(h) space): Use post-order traversal to calculate maximum gain from subtrees and update global maximum. 2) Alternative with Path Tracking: Track actual path nodes for debugging and visualization. Post-order approach is optimal as it naturally handles the bottom-up calculation needed for this problem. The key insight is that at each node, we consider the path through the node vs paths in subtrees, and return the maximum gain the node can contribute upward to its parent.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Post-order DFS with Global Maximum (Optimal)
// Time: O(n), Space: O(h)
function maxPathSum(root: TreeNode | null): number {
    let maxSum = -Infinity;
    
    function maxGain(node: TreeNode | null): number {
        if (!node) return 0;
        
        // Maximum gain from left and right subtrees (ignore negative gains)
        const leftGain = Math.max(maxGain(node.left), 0);
        const rightGain = Math.max(maxGain(node.right), 0);
        
        // Current path sum including this node as the highest point
        const currentPathSum = node.val + leftGain + rightGain;
        
        // Update global maximum
        maxSum = Math.max(maxSum, currentPathSum);
        
        // Return maximum gain this node can contribute to its parent
        return node.val + Math.max(leftGain, rightGain);
    }
    
    maxGain(root);
    return maxSum;
}`,
        explanation: "Post-order DFS approach naturally handles bottom-up calculation. Most efficient solution for this problem."
      },
      {
        language: "Python",
        code: `# Approach 1: Post-order DFS with Global Maximum (Optimal)
# Time: O(n), Space: O(h)
def maxPathSum(root):
    def max_gain(node):
        if not node:
            return 0
        
        # Maximum gain from left and right subtrees (ignore negative gains)
        left_gain = max(max_gain(node.left), 0)
        right_gain = max(max_gain(node.right), 0)
        
        # Current path sum including this node as the highest point
        current_path_sum = node.val + left_gain + right_gain
        
        # Update global maximum
        max_gain.max_sum = max(max_gain.max_sum, current_path_sum)
        
        # Return maximum gain this node can contribute to its parent
        return node.val + max(left_gain, right_gain)
    
    max_gain.max_sum = float('-inf')
    max_gain(root)
    return max_gain.max_sum`,
        explanation: "Post-order DFS approach naturally handles bottom-up calculation. Most efficient solution for this problem."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Alternative with Path Tracking (for debugging)
// Time: O(n), Space: O(h)
function maxPathSumWithPath(root: TreeNode | null): { maxSum: number; path: number[] } {
    let maxSum = -Infinity;
    let bestPath: number[] = [];
    
    function maxGainWithPath(node: TreeNode | null): { gain: number; path: number[] } {
        if (!node) return { gain: 0, path: [] };
        
        const leftResult = maxGainWithPath(node.left);
        const rightResult = maxGainWithPath(node.right);
        
        const leftGain = Math.max(leftResult.gain, 0);
        const rightGain = Math.max(rightResult.gain, 0);
        
        const currentPathSum = node.val + leftGain + rightGain;
        
        if (currentPathSum > maxSum) {
            maxSum = currentPathSum;
            bestPath = [
                ...(leftGain > 0 ? leftResult.path : []),
                node.val,
                ...(rightGain > 0 ? rightResult.path : [])
            ];
        }
        
        const bestGain = Math.max(leftGain, rightGain);
        const bestSubPath = bestGain === leftGain ? leftResult.path : rightResult.path;
        
        return {
            gain: node.val + bestGain,
            path: [...bestSubPath, node.val]
        };
    }
    
    maxGainWithPath(root);
    return { maxSum, path: bestPath };
}`,
        explanation: "Alternative approach that tracks actual path nodes. Useful for debugging and understanding the solution."
      },
      {
        language: "Python",
        code: `# Approach 2: Alternative with Path Tracking (for debugging)
# Time: O(n), Space: O(h)
def maxPathSumWithPath(root):
    def max_gain_with_path(node):
        if not node:
            return {'gain': 0, 'path': []}
        
        left_result = max_gain_with_path(node.left)
        right_result = max_gain_with_path(node.right)
        
        left_gain = max(left_result['gain'], 0)
        right_gain = max(right_result['gain'], 0)
        
        current_path_sum = node.val + left_gain + right_gain
        
        if current_path_sum > max_gain_with_path.max_sum:
            max_gain_with_path.max_sum = current_path_sum
            max_gain_with_path.best_path = (
                (left_result['path'] if left_gain > 0 else []) + 
                [node.val] + 
                (right_result['path'] if right_gain > 0 else [])
            )
        
        best_gain = max(left_gain, right_gain)
        best_sub_path = left_result['path'] if best_gain == left_gain else right_result['path']
        
        return {
            'gain': node.val + best_gain,
            'path': best_sub_path + [node.val]
        }
    
    max_gain_with_path.max_sum = float('-inf')
    max_gain_with_path.best_path = []
    max_gain_with_path(root)
    return {'maxSum': max_gain_with_path.max_sum, 'path': max_gain_with_path.best_path}`,
        explanation: "Alternative approach that tracks actual path nodes. Useful for debugging and understanding the solution."
      }
    ],
    tips: [
      "Path can start and end at any nodes (not necessarily root to leaf)",
      "At each node, consider path through node vs path in subtree",
      "Return max gain node can contribute upward to parent",
      "Handle negative values by taking max with 0"
    ],
    tags: ["tree", "binary-tree", "dfs", "recursion"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];