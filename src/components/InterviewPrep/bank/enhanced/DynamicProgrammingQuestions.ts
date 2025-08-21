import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedDPQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-34",
    question: "Fibonacci sequence using dynamic programming",
    category: "dynamic-programming",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Three approaches: 1) Recursive with memoization: store computed values in array/map. 2) Bottom-up tabulation: build from base cases up. 3) Space-optimized: only keep last two values. Bottom-up with space optimization is best: use two variables to track previous two Fibonacci numbers. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Compare recursive vs iterative approaches",
      "Explain memoization benefits",
      "Discuss space optimization technique"
    ],
    tags: ["dynamic-programming", "fibonacci", "optimization"],
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

// Memoized recursive
function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}

// Bottom-up tabulation
function fibDP(n) {
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
    
    let prev2 = 0; // F(0)
    let prev1 = 1; // F(1)
    
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}`,
        explanation: "Evolution from naive exponential to optimized linear solution. Memoization caches results, tabulation builds bottom-up, space optimization keeps only needed values.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) optimized, O(n) tabulation",
        approach: "Dynamic Programming"
      },
      python: {
        solution: `# Memoized recursive
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

# Bottom-up tabulation
def fib_dp(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]

# Space optimized
def fib_optimized(n):
    if n <= 1:
        return n
    
    prev2, prev1 = 0, 1
    
    for i in range(2, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    
    return prev1

# Using lru_cache decorator
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n <= 1:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)`,
        explanation: "Python implementation with multiple approaches including built-in lru_cache decorator for automatic memoization.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) optimized, O(n) memoized",
        approach: "Dynamic Programming"
      },
      java: {
        solution: `public int fibMemo(int n) {
    return fibMemoHelper(n, new HashMap<>());
}

private int fibMemoHelper(int n, Map<Integer, Integer> memo) {
    if (memo.containsKey(n)) return memo.get(n);
    if (n <= 1) return n;
    
    int result = fibMemoHelper(n - 1, memo) + fibMemoHelper(n - 2, memo);
    memo.put(n, result);
    return result;
}

public int fibDP(int n) {
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
    
    int prev2 = 0; // F(0)
    int prev1 = 1; // F(1)
    
    for (int i = 2; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}`,
        explanation: "Java implementation showing progression from memoized recursion to space-optimized iteration. HashMap provides memoization.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) optimized, O(n) memoized",
        approach: "Dynamic Programming"
      }
    },
    algorithmSteps: [
      "Identify overlapping subproblems in naive recursion",
      "Choose memoization (top-down) or tabulation (bottom-up)",
      "For memoization: cache results of recursive calls",
      "For tabulation: build solution from base cases",
      "Optimize space by keeping only necessary previous values",
      "Handle base cases (F(0) = 0, F(1) = 1)",
      "Return final result"
    ],
    commonMistakes: [
      "Not recognizing the overlapping subproblems",
      "Incorrect base case handling",
      "Not optimizing space when possible",
      "Integer overflow for large n values"
    ],
    optimizations: [
      "Space optimization from O(n) to O(1)",
      "Memoization reduces time from O(2^n) to O(n)",
      "Matrix exponentiation for O(log n) solution"
    ],
    relatedQuestions: ["Climbing Stairs", "House Robber", "Tribonacci Sequence"]
  },

  {
    id: "dsa-35",
    question: "0/1 Knapsack problem",
    category: "dynamic-programming",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use 2D DP table where dp[i][w] represents maximum value achievable with first i items and weight limit w. For each item, choose max of: including item (value + dp[i-1][w-weight]) or excluding item (dp[i-1][w]). Can optimize space to O(w) using 1D array. Time complexity: O(n*W), Space complexity: O(W) optimized.",
    tips: [
      "Explain the choice at each step",
      "Discuss space optimization technique",
      "Compare with fractional knapsack (greedy)"
    ],
    tags: ["dynamic-programming", "knapsack", "optimization"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// 2D DP approach
function knapsack2D(weights, values, capacity) {
    const n = weights.length;
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            // Don't include current item
            dp[i][w] = dp[i - 1][w];
            
            // Include current item if it fits
            if (weights[i - 1] <= w) {
                const includeValue = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                dp[i][w] = Math.max(dp[i][w], includeValue);
            }
        }
    }
    
    return dp[n][capacity];
}

// Space optimized 1D DP
function knapsackOptimized(weights, values, capacity) {
    const n = weights.length;
    const dp = new Array(capacity + 1).fill(0);
    
    for (let i = 0; i < n; i++) {
        // Traverse backwards to avoid using updated values
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    
    return dp[capacity];
}

// With item tracking
function knapsackWithItems(weights, values, capacity) {
    const n = weights.length;
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            dp[i][w] = dp[i - 1][w];
            if (weights[i - 1] <= w) {
                const includeValue = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                dp[i][w] = Math.max(dp[i][w], includeValue);
            }
        }
    }
    
    // Backtrack to find items
    const items = [];
    let w = capacity;
    for (let i = n; i > 0 && w > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            items.push(i - 1);
            w -= weights[i - 1];
        }
    }
    
    return { maxValue: dp[n][capacity], items: items.reverse() };
}`,
        explanation: "Classic DP problem with multiple implementations. 2D approach is intuitive, 1D saves space, backtracking finds actual items selected.",
        timeComplexity: "O(n × W)",
        spaceComplexity: "O(W) optimized, O(n × W) 2D",
        approach: "Dynamic Programming"
      },
      python: {
        solution: `def knapsack_2d(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            # Don't include current item
            dp[i][w] = dp[i - 1][w]
            
            # Include current item if it fits
            if weights[i - 1] <= w:
                include_value = values[i - 1] + dp[i - 1][w - weights[i - 1]]
                dp[i][w] = max(dp[i][w], include_value)
    
    return dp[n][capacity]

def knapsack_optimized(weights, values, capacity):
    dp = [0] * (capacity + 1)
    
    for i in range(len(weights)):
        # Traverse backwards to avoid using updated values
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

def knapsack_with_items(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    # Fill DP table
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                include_value = values[i - 1] + dp[i - 1][w - weights[i - 1]]
                dp[i][w] = max(dp[i][w], include_value)
    
    # Backtrack to find items
    items = []
    w = capacity
    for i in range(n, 0, -1):
        if w > 0 and dp[i][w] != dp[i - 1][w]:
            items.append(i - 1)
            w -= weights[i - 1]
    
    return dp[n][capacity], items[::-1]`,
        explanation: "Python implementation with clean list comprehensions. Shows progression from 2D to optimized 1D solution.",
        timeComplexity: "O(n × W)",
        spaceComplexity: "O(W) optimized",
        approach: "Dynamic Programming"
      },
      java: {
        solution: `public int knapsack2D(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[][] dp = new int[n + 1][capacity + 1];
    
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= capacity; w++) {
            // Don't include current item
            dp[i][w] = dp[i - 1][w];
            
            // Include current item if it fits
            if (weights[i - 1] <= w) {
                int includeValue = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                dp[i][w] = Math.max(dp[i][w], includeValue);
            }
        }
    }
    
    return dp[n][capacity];
}

public int knapsackOptimized(int[] weights, int[] values, int capacity) {
    int[] dp = new int[capacity + 1];
    
    for (int i = 0; i < weights.length; i++) {
        // Traverse backwards to avoid using updated values
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    
    return dp[capacity];
}`,
        explanation: "Java implementation showing both 2D and space-optimized versions. The backward traversal in 1D version is crucial to avoid using updated values.",
        timeComplexity: "O(n × W)",
        spaceComplexity: "O(W) optimized",
        approach: "Dynamic Programming"
      }
    },
    algorithmSteps: [
      "Define state: dp[i][w] = max value with first i items and capacity w",
      "Initialize base case: dp[0][w] = 0 for all w",
      "For each item and weight combination:",
      "Option 1: Don't include item (dp[i-1][w])",
      "Option 2: Include item if it fits (value[i] + dp[i-1][w-weight[i]])",
      "Take maximum of both options",
      "Space optimization: use 1D array and traverse backwards"
    ],
    commonMistakes: [
      "Not understanding the state definition",
      "Incorrect base case initialization",
      "Using forward traversal in space-optimized version",
      "Not checking if item fits before including"
    ],
    optimizations: [
      "Space optimization from O(n×W) to O(W)",
      "Early termination if remaining items can't improve solution",
      "Branch and bound for exact solutions"
    ],
    relatedQuestions: ["Fractional Knapsack", "Unbounded Knapsack", "Partition Equal Subset Sum"]
  },

  {
    id: "dsa-36",
    question: "Longest Common Subsequence (LCS)",
    category: "dynamic-programming",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use 2D DP table where dp[i][j] represents LCS length of first i characters of string1 and first j characters of string2. If characters match, dp[i][j] = 1 + dp[i-1][j-1]. If not, dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Can optimize space to O(min(m,n)). Time complexity: O(m*n), Space complexity: O(m*n) or O(min(m,n)) optimized.",
    tips: [
      "Explain the recurrence relation",
      "Discuss how to reconstruct the actual LCS",
      "Compare with Longest Common Substring"
    ],
    tags: ["dynamic-programming", "strings", "lcs"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// 2D DP approach
function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// Space optimized (using only 2 rows)
function lcsOptimized(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    
    // Use shorter string for space optimization
    if (m < n) return lcsOptimized(text2, text1);
    
    let prev = new Array(n + 1).fill(0);
    let curr = new Array(n + 1).fill(0);
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                curr[j] = 1 + prev[j - 1];
            } else {
                curr[j] = Math.max(prev[j], curr[j - 1]);
            }
        }
        [prev, curr] = [curr, prev]; // Swap arrays
        curr.fill(0);
    }
    
    return prev[n];
}

// Reconstruct actual LCS
function getLCS(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    // Backtrack to construct LCS
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
        explanation: "LCS builds optimal solution by considering whether to include matching characters or take best from excluding either character. Backtracking reconstructs actual sequence.",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(min(m, n)) optimized",
        approach: "Dynamic Programming"
      },
      python: {
        solution: `def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]

def lcs_optimized(text1, text2):
    m, n = len(text1), len(text2)
    
    # Use shorter string for columns
    if m < n:
        text1, text2 = text2, text1
        m, n = n, m
    
    prev = [0] * (n + 1)
    curr = [0] * (n + 1)
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                curr[j] = 1 + prev[j - 1]
            else:
                curr[j] = max(prev[j], curr[j - 1])
        prev, curr = curr, [0] * (n + 1)
    
    return prev[n]

def get_lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Fill DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
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
        explanation: "Python implementation with list comprehensions for clean DP table creation. Space optimization uses two arrays instead of full 2D table.",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(min(m, n)) optimized",
        approach: "Dynamic Programming"
      },
      java: {
        solution: `public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

public int lcsOptimized(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    
    // Use shorter string for columns
    if (m < n) return lcsOptimized(text2, text1);
    
    int[] prev = new int[n + 1];
    int[] curr = new int[n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                curr[j] = 1 + prev[j - 1];
            } else {
                curr[j] = Math.max(prev[j], curr[j - 1]);
            }
        }
        // Swap arrays
        int[] temp = prev;
        prev = curr;
        curr = temp;
        Arrays.fill(curr, 0);
    }
    
    return prev[n];
}`,
        explanation: "Java implementation with proper array initialization. Space optimization technique reduces memory usage significantly for large inputs.",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(min(m, n)) optimized",
        approach: "Dynamic Programming"
      }
    },
    algorithmSteps: [
      "Create 2D DP table with dimensions (m+1) × (n+1)",
      "Initialize base cases: dp[0][j] = dp[i][0] = 0",
      "For each cell dp[i][j]:",
      "If characters match: dp[i][j] = 1 + dp[i-1][j-1]",
      "If not match: dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      "Return dp[m][n] as LCS length",
      "Optional: backtrack to reconstruct actual LCS"
    ],
    commonMistakes: [
      "Confusing LCS with Longest Common Substring",
      "Incorrect index handling (off-by-one errors)",
      "Not initializing DP table properly",
      "Wrong recurrence relation"
    ],
    optimizations: [
      "Space optimization using rolling arrays",
      "Use shorter string for columns",
      "Early termination if one string is exhausted"
    ],
    relatedQuestions: ["Longest Common Substring", "Edit Distance", "Shortest Common Supersequence"]
  }
];