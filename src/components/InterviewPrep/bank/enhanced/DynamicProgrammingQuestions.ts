import { Question } from "../../InterviewSubjects";

// Enhanced Dynamic Programming DSA Questions with comprehensive implementations
export const enhancedDPQuestions: Question[] = [
  {
    id: "enhanced-dp-1",
    question: "Climbing Stairs - You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Approach 1: Bottom-up DP (Optimal)
// Time: O(n), Space: O(1)
function climbStairs(n: number): number {
    if (n <= 2) return n;
    
    let prev2 = 1; // f(1)
    let prev1 = 2; // f(2)
    
    for (let i = 3; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Approach 2: Top-down DP with Memoization
// Time: O(n), Space: O(n)
function climbStairsMemo(n: number): number {
    const memo = new Map<number, number>();
    
    function dp(i: number): number {
        if (i <= 2) return i;
        if (memo.has(i)) return memo.get(i)!;
        
        const result = dp(i - 1) + dp(i - 2);
        memo.set(i, result);
        return result;
    }
    
    return dp(n);
}

// Approach 3: Matrix Exponentiation (Advanced)
// Time: O(log n), Space: O(1)
function climbStairsMatrix(n: number): number {
    if (n <= 2) return n;
    
    function multiply(a: number[][], b: number[][]): number[][] {
        return [
            [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
            [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]]
        ];
    }
    
    function matrixPower(matrix: number[][], power: number): number[][] {
        let result = [[1, 0], [0, 1]]; // Identity matrix
        let base = matrix;
        
        while (power > 0) {
            if (power % 2 === 1) {
                result = multiply(result, base);
            }
            base = multiply(base, base);
            power = Math.floor(power / 2);
        }
        
        return result;
    }
    
    const transformMatrix = [[1, 1], [1, 0]];
    const result = matrixPower(transformMatrix, n);
    
    return result[0][0];
}`,
    tips: [
      "Recognize Fibonacci pattern: f(n) = f(n-1) + f(n-2)",
      "Space optimization: only need last two values",
      "Memoization prevents redundant recursive calculations",
      "Matrix exponentiation achieves O(log n) for very large n"
    ],
    tags: ["dynamic-programming", "math", "recursion"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-2",
    question: "House Robber - You are a robber planning to rob houses along a street. You cannot rob two adjacent houses. What is the maximum amount you can rob?",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Space-optimized DP (Optimal)
// Time: O(n), Space: O(1)
function rob(nums: number[]): number {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    
    let prev2 = 0;      // Max money up to i-2
    let prev1 = nums[0]; // Max money up to i-1
    
    for (let i = 1; i < nums.length; i++) {
        const current = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Approach 2: Standard DP Array
// Time: O(n), Space: O(n)
function robDP(nums: number[]): number {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    
    const dp = new Array(nums.length);
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    
    for (let i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    }
    
    return dp[nums.length - 1];
}

// Approach 3: Recursive with Memoization
// Time: O(n), Space: O(n)
function robMemo(nums: number[]): number {
    const memo = new Map<number, number>();
    
    function robFrom(i: number): number {
        if (i >= nums.length) return 0;
        if (memo.has(i)) return memo.get(i)!;
        
        const result = Math.max(
            robFrom(i + 1),           // Skip current house
            nums[i] + robFrom(i + 2)  // Rob current house
        );
        
        memo.set(i, result);
        return result;
    }
    
    return robFrom(0);
}`,
    tips: [
      "At each house: choose to rob (can't rob next) or skip",
      "State: dp[i] = max money from houses 0 to i",
      "Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
      "Space optimization: only need previous two values"
    ],
    tags: ["dynamic-programming", "array"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-3",
    question: "Unique Paths - A robot is located at top-left corner of m x n grid. It can only move right or down. How many unique paths are there to bottom-right corner?",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Space-optimized DP (Optimal)
// Time: O(m * n), Space: O(min(m, n))
function uniquePaths(m: number, n: number): number {
    // Use smaller dimension for space optimization
    const [rows, cols] = m < n ? [m, n] : [n, m];
    let dp = new Array(rows).fill(1);
    
    for (let col = 1; col < cols; col++) {
        for (let row = 1; row < rows; row++) {
            dp[row] += dp[row - 1];
        }
    }
    
    return dp[rows - 1];
}

// Approach 2: 2D DP Array
// Time: O(m * n), Space: O(m * n)
function uniquePaths2D(m: number, n: number): number {
    const dp = Array(m).fill(null).map(() => Array(n).fill(1));
    
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    
    return dp[m - 1][n - 1];
}

// Approach 3: Mathematical (Combinatorics)
// Time: O(min(m, n)), Space: O(1)
function uniquePathsMath(m: number, n: number): number {
    // Total moves: (m-1) down + (n-1) right = m+n-2
    // Choose (m-1) positions for down moves: C(m+n-2, m-1)
    
    const totalMoves = m + n - 2;
    const downMoves = m - 1;
    
    let result = 1;
    
    // Calculate C(totalMoves, downMoves) efficiently
    for (let i = 0; i < downMoves; i++) {
        result = result * (totalMoves - i) / (i + 1);
    }
    
    return Math.round(result);
}

// Recursive with Memoization (for understanding)
function uniquePathsRecursive(m: number, n: number): number {
    const memo = new Map<string, number>();
    
    function dp(row: number, col: number): number {
        if (row === m - 1 && col === n - 1) return 1;
        if (row >= m || col >= n) return 0;
        
        const key = \`\${row},\${col}\`;
        if (memo.has(key)) return memo.get(key)!;
        
        const result = dp(row + 1, col) + dp(row, col + 1);
        memo.set(key, result);
        return result;
    }
    
    return dp(0, 0);
}`,
    tips: [
      "Classic 2D DP: paths to cell = paths from above + paths from left",
      "First row and column always have 1 path",
      "Space optimization: only need previous row",
      "Mathematical solution uses combinations formula"
    ],
    tags: ["dynamic-programming", "math", "combinatorics"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-4",
    question: "Jump Game - Given an array where each element represents max jump length from that position, determine if you can reach the last index.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Greedy (Optimal)
// Time: O(n), Space: O(1)
function canJump(nums: number[]): boolean {
    let maxReach = 0;
    
    for (let i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        maxReach = Math.max(maxReach, i + nums[i]);
        
        // Early termination if we can reach the end
        if (maxReach >= nums.length - 1) return true;
    }
    
    return true;
}

// Approach 2: Dynamic Programming
// Time: O(n²), Space: O(n)
function canJumpDP(nums: number[]): boolean {
    const n = nums.length;
    const dp = new Array(n).fill(false);
    dp[0] = true;
    
    for (let i = 0; i < n; i++) {
        if (!dp[i]) continue;
        
        for (let j = 1; j <= nums[i] && i + j < n; j++) {
            dp[i + j] = true;
        }
    }
    
    return dp[n - 1];
}

// Approach 3: Backtracking from end
// Time: O(n), Space: O(1)
function canJumpBacktrack(nums: number[]): boolean {
    let lastGoodIndex = nums.length - 1;
    
    for (let i = nums.length - 2; i >= 0; i--) {
        if (i + nums[i] >= lastGoodIndex) {
            lastGoodIndex = i;
        }
    }
    
    return lastGoodIndex === 0;
}

// Jump Game II: Minimum jumps to reach end
function jump(nums: number[]): number {
    let jumps = 0;
    let currentEnd = 0;
    let farthest = 0;
    
    for (let i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        
        if (i === currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }
    
    return jumps;
}`,
    tips: [
      "Greedy approach: track maximum reachable position",
      "If current index > max reach, impossible to continue",
      "DP approach builds reachability from start",
      "Backward approach checks if each position can reach a 'good' position"
    ],
    tags: ["dynamic-programming", "greedy", "array"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-5",
    question: "Edit Distance (Levenshtein Distance) - Given two strings word1 and word2, return the minimum operations to convert word1 to word2.",
    category: "technical",
    difficulty: "hard",
    type: "coding",
    sampleAnswer: `
// 2D DP Approach (Standard)
// Time: O(m * n), Space: O(m * n)
function minDistance(word1: string, word2: string): number {
    const m = word1.length;
    const n = word2.length;
    
    // dp[i][j] = min operations to convert word1[0...i-1] to word2[0...j-1]
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i; // Delete all characters
    for (let j = 0; j <= n; j++) dp[0][j] = j; // Insert all characters
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // No operation needed
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // Delete
                    dp[i][j - 1],     // Insert
                    dp[i - 1][j - 1]  // Replace
                );
            }
        }
    }
    
    return dp[m][n];
}

// Space-optimized: O(min(m, n)) space
// Time: O(m * n), Space: O(min(m, n))
function minDistanceOptimized(word1: string, word2: string): number {
    let [shorter, longer] = word1.length <= word2.length ? [word1, word2] : [word2, word1];
    
    let prev = Array(shorter.length + 1).fill(0).map((_, i) => i);
    
    for (let i = 1; i <= longer.length; i++) {
        const curr = new Array(shorter.length + 1);
        curr[0] = i;
        
        for (let j = 1; j <= shorter.length; j++) {
            if (longer[i - 1] === shorter[j - 1]) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
            }
        }
        
        prev = curr;
    }
    
    return prev[shorter.length];
}

// Recursive with Memoization
function minDistanceRecursive(word1: string, word2: string): number {
    const memo = new Map<string, number>();
    
    function dp(i: number, j: number): number {
        if (i === 0) return j; // Insert all remaining characters of word2
        if (j === 0) return i; // Delete all remaining characters of word1
        
        const key = \`\${i},\${j}\`;
        if (memo.has(key)) return memo.get(key)!;
        
        let result: number;
        
        if (word1[i - 1] === word2[j - 1]) {
            result = dp(i - 1, j - 1);
        } else {
            result = 1 + Math.min(
                dp(i - 1, j),     // Delete
                dp(i, j - 1),     // Insert
                dp(i - 1, j - 1)  // Replace
            );
        }
        
        memo.set(key, result);
        return result;
    }
    
    return dp(word1.length, word2.length);
}`,
    tips: [
      "Three operations: insert, delete, replace",
      "2D DP: dp[i][j] represents min operations for prefixes",
      "If characters match, no operation needed",
      "Space optimization: only need previous row"
    ],
    tags: ["dynamic-programming", "string"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-6",
    question: "Coin Change - Given coins of different denominations and amount, return the fewest coins needed to make up that amount.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Bottom-up DP (Optimal)
// Time: O(amount * coins.length), Space: O(amount)
function coinChange(coins: number[], amount: number): number {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] === Infinity ? -1 : dp[amount];
}

// Top-down DP with Memoization
// Time: O(amount * coins.length), Space: O(amount)
function coinChangeMemo(coins: number[], amount: number): number {
    const memo = new Map<number, number>();
    
    function dp(remaining: number): number {
        if (remaining === 0) return 0;
        if (remaining < 0) return Infinity;
        if (memo.has(remaining)) return memo.get(remaining)!;
        
        let minCoins = Infinity;
        
        for (const coin of coins) {
            const result = dp(remaining - coin);
            if (result !== Infinity) {
                minCoins = Math.min(minCoins, result + 1);
            }
        }
        
        memo.set(remaining, minCoins);
        return minCoins;
    }
    
    const result = dp(amount);
    return result === Infinity ? -1 : result;
}

// BFS Approach (finds minimum level)
function coinChangeBFS(coins: number[], amount: number): number {
    if (amount === 0) return 0;
    
    const queue: number[] = [0];
    const visited = new Set<number>([0]);
    let level = 0;
    
    while (queue.length > 0) {
        const size = queue.length;
        level++;
        
        for (let i = 0; i < size; i++) {
            const current = queue.shift()!;
            
            for (const coin of coins) {
                const next = current + coin;
                
                if (next === amount) return level;
                if (next < amount && !visited.has(next)) {
                    visited.add(next);
                    queue.push(next);
                }
            }
        }
    }
    
    return -1;
}`,
    tips: [
      "Classic unbounded knapsack problem",
      "State: dp[i] = minimum coins to make amount i",
      "Try each coin and take minimum result",
      "BFS finds minimum steps but uses more space"
    ],
    tags: ["dynamic-programming", "bfs"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-7",
    question: "Longest Increasing Subsequence - Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Binary Search with Patience Sorting (Optimal)
// Time: O(n log n), Space: O(n)
function lengthOfLIS(nums: number[]): number {
    const tails: number[] = [];
    
    for (const num of nums) {
        let left = 0;
        let right = tails.length;
        
        // Binary search for insertion position
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (tails[mid] < num) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        // If num is larger than all elements, append
        if (left === tails.length) {
            tails.push(num);
        } else {
            // Replace the first element >= num
            tails[left] = num;
        }
    }
    
    return tails.length;
}

// Approach 2: Dynamic Programming
// Time: O(n²), Space: O(n)
function lengthOfLISDP(nums: number[]): number {
    if (nums.length === 0) return 0;
    
    const dp = new Array(nums.length).fill(1);
    let maxLength = 1;
    
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLength = Math.max(maxLength, dp[i]);
    }
    
    return maxLength;
}

// Return actual LIS (not just length)
function findLIS(nums: number[]): number[] {
    if (nums.length === 0) return [];
    
    const dp = new Array(nums.length).fill(1);
    const parent = new Array(nums.length).fill(-1);
    let maxLength = 1;
    let maxIndex = 0;
    
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                parent[i] = j;
            }
        }
        
        if (dp[i] > maxLength) {
            maxLength = dp[i];
            maxIndex = i;
        }
    }
    
    // Reconstruct LIS
    const lis: number[] = [];
    let current = maxIndex;
    
    while (current !== -1) {
        lis.unshift(nums[current]);
        current = parent[current];
    }
    
    return lis;
}`,
    tips: [
      "Binary search approach maintains array of smallest tail elements",
      "DP approach: dp[i] = length of LIS ending at position i",
      "Binary search finds position to replace for optimal subsequence",
      "Can reconstruct actual subsequence with parent tracking"
    ],
    tags: ["dynamic-programming", "binary-search", "array"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];