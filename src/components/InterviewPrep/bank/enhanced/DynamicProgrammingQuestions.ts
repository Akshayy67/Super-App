import { EnhancedQuestion } from "../../InterviewSubjects";

export const dynamicProgrammingQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-11",
    question: "Fibonacci sequence using dynamic programming",
    category: "dynamic-programming",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use memoization (top-down) or tabulation (bottom-up) to avoid redundant calculations. Memoization: recursive with cache. Tabulation: iterative building from base cases. Can optimize space to O(1) by storing only last two values. Time complexity: O(n), Space complexity: O(n) or O(1) optimized.",
    tips: [
      "Compare naive recursive vs DP approaches",
      "Show both memoization and tabulation",
      "Discuss space optimization"
    ],
    tags: ["dynamic-programming", "memoization", "optimization"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Naive recursive (exponential time)
function fibNaive(n) {
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// Memoization (top-down DP)
function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}

// Tabulation (bottom-up DP)
function fibTabulation(n) {
    if (n <= 1) return n;
    
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Space optimized
function fibOptimized(n) {
    if (n <= 1) return n;
    
    let prev2 = 0;
    let prev1 = 1;
    
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}`,
        explanation: "Shows evolution from naive O(2^n) to optimized O(n) time with O(1) space. Demonstrates core DP principles of overlapping subproblems and optimal substructure.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) optimized",
        approach: "Dynamic Programming"
      },
      python: {
        solution: `def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

def fib_tabulation(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]

def fib_optimized(n):
    if n <= 1:
        return n
    
    prev2, prev1 = 0, 1
    
    for i in range(2, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    
    return prev1`,
        explanation: "Python implementation with tuple unpacking for clean variable swaps. Demonstrates the progression from exponential to linear time.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Dynamic Programming"
      },
      java: {
        solution: `public int fibNaive(int n) {
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

public int fibMemo(int n) {
    Map<Integer, Integer> memo = new HashMap<>();
    return fibMemoHelper(n, memo);
}

private int fibMemoHelper(int n, Map<Integer, Integer> memo) {
    if (memo.containsKey(n)) return memo.get(n);
    if (n <= 1) return n;
    
    int result = fibMemoHelper(n - 1, memo) + fibMemoHelper(n - 2, memo);
    memo.put(n, result);
    return result;
}

public int fibTabulation(int n) {
    if (n <= 1) return n;
    
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

public int fibOptimized(int n) {
    if (n <= 1) return n;
    
    int prev2 = 0;
    int prev1 = 1;
    
    for (int i = 2; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}`,
        explanation: "Java implementation showing all DP variants. Helper method pattern for memoization with HashMap.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) optimized",
        approach: "Dynamic Programming"
      }
    },
    algorithmSteps: [
      "Identify base cases (fib(0) = 0, fib(1) = 1)",
      "Recognize overlapping subproblems in naive recursion",
      "Apply memoization to cache computed results",
      "Convert to tabulation for bottom-up approach",
      "Optimize space by keeping only necessary previous values",
      "Handle edge cases like negative inputs"
    ],
    commonMistakes: [
      "Using naive recursion for large inputs (exponential time)",
      "Not initializing base cases correctly",
      "Off-by-one errors in loop bounds",
      "Not optimizing space when possible"
    ],
    optimizations: [
      "Space optimization from O(n) to O(1)",
      "Iterative approach avoids recursion overhead",
      "Matrix exponentiation for O(log n) solution"
    ],
    relatedQuestions: ["Climbing Stairs", "House Robber", "Coin Change"]
  },

  {
    id: "dsa-12",
    question: "Longest Common Subsequence (LCS)",
    category: "dynamic-programming",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use 2D DP table where dp[i][j] represents LCS length of first i characters of string1 and first j characters of string2. If characters match, dp[i][j] = dp[i-1][j-1] + 1. If not, dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Time complexity: O(m*n), Space complexity: O(m*n) or O(min(m,n)) optimized.",
    tips: [
      "Explain the DP recurrence relation",
      "Show how to reconstruct the actual subsequence",
      "Discuss space optimization using rolling array"
    ],
    tags: ["dynamic-programming", "strings", "2d-dp"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    
    // Create DP table
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// Space optimized version
function lcsSpaceOptimized(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    
    // Use only two rows
    let prev = new Array(n + 1).fill(0);
    let curr = new Array(n + 1).fill(0);
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                curr[j] = prev[j - 1] + 1;
            } else {
                curr[j] = Math.max(prev[j], curr[j - 1]);
            }
        }
        [prev, curr] = [curr, prev]; // Swap arrays
    }
    
    return prev[n];
}

// Reconstruct the actual LCS
function getLCS(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    // Reconstruct LCS
    const lcs = [];
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
        if (text1[i - 1] === text2[j - 1]) {
            lcs.unshift(text1[i - 1]);
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    
    return lcs.join('');
}`,
        explanation: "2D DP builds optimal solution bottom-up. Space can be optimized since we only need previous row. Reconstruction traces back through DP table.",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m * n) or O(min(m,n)) optimized",
        approach: "2D Dynamic Programming"
      },
      python: {
        solution: `def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    
    # Create DP table
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Fill DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]

def lcs_space_optimized(text1, text2):
    m, n = len(text1), len(text2)
    
    # Use only two rows
    prev = [0] * (n + 1)
    curr = [0] * (n + 1)
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                curr[j] = prev[j - 1] + 1
            else:
                curr[j] = max(prev[j], curr[j - 1])
        
        prev, curr = curr, prev
    
    return prev[n]

def get_lcs_string(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Fill DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    # Reconstruct LCS
    lcs = []
    i, j = m, n
    
    while i > 0 and j > 0:
        if text1[i - 1] == text2[j - 1]:
            lcs.append(text1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    
    return ''.join(reversed(lcs))`,
        explanation: "Python implementation with list comprehension for DP table creation. Clean reconstruction logic with tuple unpacking.",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m * n)",
        approach: "2D Dynamic Programming"
      },
      java: {
        solution: `public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

public String getLCSString(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    // Fill DP table
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    // Reconstruct LCS
    StringBuilder lcs = new StringBuilder();
    int i = m, j = n;
    
    while (i > 0 && j > 0) {
        if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
            lcs.append(text1.charAt(i - 1));
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    
    return lcs.reverse().toString();
}`,
        explanation: "Java implementation with 2D array for DP table. StringBuilder for efficient string construction during reconstruction.",
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m * n)",
        approach: "2D Dynamic Programming"
      }
    },
    algorithmSteps: [
      "Create 2D DP table with dimensions (m+1) x (n+1)",
      "Initialize base cases (empty string comparisons)",
      "For each cell, compare characters at current positions",
      "If characters match: dp[i][j] = dp[i-1][j-1] + 1",
      "If characters don't match: dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      "Result is dp[m][n]",
      "For reconstruction: trace back through DP table"
    ],
    commonMistakes: [
      "Off-by-one errors in string indexing",
      "Incorrect DP recurrence relation",
      "Not handling empty string cases",
      "Confusing LCS with Longest Common Substring"
    ],
    optimizations: [
      "Space optimization using rolling arrays",
      "Early termination if one string is much shorter",
      "Memory-efficient reconstruction"
    ],
    relatedQuestions: ["Longest Common Substring", "Edit Distance", "Distinct Subsequences"]
  },

  {
    id: "dsa-13",
    question: "0/1 Knapsack Problem",
    category: "dynamic-programming",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use 2D DP where dp[i][w] represents maximum value using first i items with weight limit w. For each item, choose max of including it (value + dp[i-1][w-weight]) or excluding it (dp[i-1][w]). Can optimize space to 1D array. Time complexity: O(n*W), Space complexity: O(n*W) or O(W) optimized.",
    tips: [
      "Explain the choice at each step (include vs exclude)",
      "Show how to track which items are selected",
      "Discuss space optimization technique"
    ],
    tags: ["dynamic-programming", "optimization", "knapsack"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function knapsack(weights, values, capacity) {
    const n = weights.length;
    
    // Create DP table
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            const weight = weights[i - 1];
            const value = values[i - 1];
            
            if (weight <= w) {
                // Can include this item
                dp[i][w] = Math.max(
                    dp[i - 1][w],              // Don't include
                    dp[i - 1][w - weight] + value  // Include
                );
            } else {
                // Can't include this item
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    return dp[n][capacity];
}

// Space optimized version
function knapsackOptimized(weights, values, capacity) {
    const n = weights.length;
    let prev = new Array(capacity + 1).fill(0);
    let curr = new Array(capacity + 1).fill(0);
    
    for (let i = 1; i <= n; i++) {
        const weight = weights[i - 1];
        const value = values[i - 1];
        
        for (let w = 0; w <= capacity; w++) {
            if (weight <= w) {
                curr[w] = Math.max(prev[w], prev[w - weight] + value);
            } else {
                curr[w] = prev[w];
            }
        }
        
        [prev, curr] = [curr, prev]; // Swap arrays
    }
    
    return prev[capacity];
}

// Get selected items
function knapsackWithItems(weights, values, capacity) {
    const n = weights.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            const weight = weights[i - 1];
            const value = values[i - 1];
            
            if (weight <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - weight] + value
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    // Reconstruct solution
    const selectedItems = [];
    let i = n, w = capacity;
    
    while (i > 0 && w > 0) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selectedItems.push(i - 1); // Item index
            w -= weights[i - 1];
        }
        i--;
    }
    
    return {
        maxValue: dp[n][capacity],
        items: selectedItems.reverse()
    };
}`,
        explanation: "Classic DP problem demonstrating optimal substructure. Space optimization reduces memory from O(n*W) to O(W) using rolling arrays.",
        timeComplexity: "O(n * W)",
        spaceComplexity: "O(n * W) or O(W) optimized",
        approach: "2D Dynamic Programming"
      },
      python: {
        solution: `def knapsack(weights, values, capacity):
    n = len(weights)
    
    # Create DP table
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    # Fill DP table
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            weight = weights[i - 1]
            value = values[i - 1]
            
            if weight <= w:
                dp[i][w] = max(
                    dp[i - 1][w],                    # Don't include
                    dp[i - 1][w - weight] + value    # Include
                )
            else:
                dp[i][w] = dp[i - 1][w]
    
    return dp[n][capacity]

def knapsack_optimized(weights, values, capacity):
    n = len(weights)
    prev = [0] * (capacity + 1)
    
    for i in range(n):
        curr = [0] * (capacity + 1)
        weight = weights[i]
        value = values[i]
        
        for w in range(capacity + 1):
            if weight <= w:
                curr[w] = max(prev[w], prev[w - weight] + value)
            else:
                curr[w] = prev[w]
        
        prev = curr
    
    return prev[capacity]`,
        explanation: "Python implementation with clean list comprehension for DP table. Space optimization using two 1D arrays.",
        timeComplexity: "O(n * W)",
        spaceComplexity: "O(W)",
        approach: "Dynamic Programming"
      },
      java: {
        solution: `public int knapsack(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[][] dp = new int[n + 1][capacity + 1];
    
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            int weight = weights[i - 1];
            int value = values[i - 1];
            
            if (weight <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],                    // Don't include
                    dp[i - 1][w - weight] + value    // Include
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    return dp[n][capacity];
}

public int knapsackOptimized(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[] prev = new int[capacity + 1];
    
    for (int i = 0; i < n; i++) {
        int[] curr = new int[capacity + 1];
        int weight = weights[i];
        int value = values[i];
        
        for (int w = 0; w <= capacity; w++) {
            if (weight <= w) {
                curr[w] = Math.max(prev[w], prev[w - weight] + value);
            } else {
                curr[w] = prev[w];
            }
        }
        
        prev = curr;
    }
    
    return prev[capacity];
}`,
        explanation: "Java implementation with 2D array for DP table. Space optimization uses two 1D arrays instead of full 2D table.",
        timeComplexity: "O(n * W)",
        spaceComplexity: "O(W)",
        approach: "Dynamic Programming"
      }
    },
    algorithmSteps: [
      "Create DP table with dimensions (n+1) x (capacity+1)",
      "Initialize base cases (0 items or 0 capacity = 0 value)",
      "For each item and capacity combination",
      "Check if current item's weight fits in current capacity",
      "If fits: choose max of including or excluding item",
      "If doesn't fit: exclude item (take previous row value)",
      "Final answer is dp[n][capacity]"
    ],
    commonMistakes: [
      "Not handling the case where item weight exceeds capacity",
      "Incorrect indexing between DP table and input arrays",
      "Forgetting to initialize base cases",
      "Confusing 0/1 knapsack with unbounded knapsack"
    ],
    optimizations: [
      "Space optimization using rolling arrays",
      "1D DP array processing from right to left",
      "Early termination if remaining items can't improve solution"
    ],
    relatedQuestions: ["Unbounded Knapsack", "Partition Equal Subset Sum", "Target Sum"]
  }
];