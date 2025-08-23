import { Question } from "../../InterviewSubjects";

// Enhanced Dynamic Programming DSA Questions with comprehensive implementations
export const enhancedDPQuestions: Question[] = [
  {
    id: "enhanced-dp-1",
    question: "Climbing Stairs - You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach: "Multiple approaches available: 1) Bottom-up DP (O(n) time, O(1) space): Recognize Fibonacci pattern and use space-optimized iteration. 2) Top-down DP with Memoization (O(n) time, O(n) space): Recursive approach with memoization to avoid redundant calculations. 3) Matrix Exponentiation (O(log n) time, O(1) space): Advanced mathematical approach for very large n. Bottom-up DP is optimal for most practical cases.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Bottom-up DP (Optimal)
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
}`,
        explanation: "Space-optimized iterative approach. Recognizes Fibonacci pattern and only stores last two values."
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Bottom-up DP (Optimal)
// Time: O(n), Space: O(1)
public class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        
        int prev2 = 1; // f(1)
        int prev1 = 2; // f(2)
        
        for (int i = 3; i <= n; i++) {
            int current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        
        return prev1;
    }
}`,
        explanation: "Java implementation using space-optimized iterative approach. Recognizes Fibonacci pattern and only stores last two values."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Top-down DP with Memoization
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
}`,
        explanation: "Recursive approach with memoization. More intuitive but uses extra space for the call stack and memo."
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 2: Top-down DP with Memoization
// Time: O(n), Space: O(n)
import java.util.*;

public class Solution {
    private Map<Integer, Integer> memo = new HashMap<>();
    
    public int climbStairs(int n) {
        return dp(n);
    }
    
    private int dp(int i) {
        if (i <= 2) return i;
        if (memo.containsKey(i)) return memo.get(i);
        
        int result = dp(i - 1) + dp(i - 2);
        memo.put(i, result);
        return result;
    }
}`,
        explanation: "Java implementation using recursive approach with memoization. More intuitive but uses extra space for the call stack and memo."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Matrix Exponentiation (Advanced)
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
        explanation: "Advanced mathematical approach using matrix exponentiation. Achieves O(log n) time for very large n."
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Matrix Exponentiation (Advanced)
// Time: O(log n), Space: O(1)
public class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        
        int[][] transformMatrix = {{1, 1}, {1, 0}};
        int[][] result = matrixPower(transformMatrix, n);
        
        return result[0][0];
    }
    
    private int[][] multiply(int[][] a, int[][] b) {
        return new int[][]{
            {a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]},
            {a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]}
        };
    }
    
    private int[][] matrixPower(int[][] matrix, int power) {
        int[][] result = {{1, 0}, {0, 1}}; // Identity matrix
        int[][] base = matrix;
        
        while (power > 0) {
            if (power % 2 == 1) {
                result = multiply(result, base);
            }
            base = multiply(base, base);
            power /= 2;
        }
        
        return result;
    }
}`,
        explanation: "Java implementation using advanced mathematical approach with matrix exponentiation. Achieves O(log n) time for very large n."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Space-optimized DP (O(n) time, O(1) space): Track maximum money from last two positions using variables. 2) Standard DP Array (O(n) time, O(n) space): Build DP table to store maximum money at each position. 3) Recursive with Memoization (O(n) time, O(n) space): Top-down approach with memoization. Space-optimized DP is optimal for space efficiency.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Space-optimized DP (Optimal)
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
}`,
        explanation: "Space-optimized approach tracking only the maximum money from the last two positions. Most efficient solution."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 1: Space-optimized DP (Optimal)
// Time: O(n), Space: O(1)
public class Solution {
    public int rob(int[] nums) {
        if (nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];
        
        int prev2 = 0;      // Max money up to i-2
        int prev1 = nums[0]; // Max money up to i-1
        
        for (int i = 1; i < nums.length; i++) {
            int current = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = current;
        }
        
        return prev1;
    }
}`,
        explanation: "Java implementation using space-optimized approach tracking only the maximum money from the last two positions. Most efficient solution."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Standard DP Array
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
}`,
        explanation: "Standard DP approach with array to store maximum money at each position. Easier to understand and debug."
      },
      {
        language: "java",
        code: `// Approach 2: Standard DP Array
// Time: O(n), Space: O(n)
public class Solution {
    public int rob(int[] nums) {
        if (nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];
        
        int[] dp = new int[nums.length];
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]);
        
        for (int i = 2; i < nums.length; i++) {
            dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
        }
        
        return dp[nums.length - 1];
    }
}`,
        explanation: "Java implementation using standard DP approach with array to store maximum money at each position. Easier to understand and debug."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Recursive with Memoization
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
        explanation: "Top-down recursive approach with memoization. More intuitive for some but uses call stack space."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `// Approach 3: Recursive with Memoization
// Time: O(n), Space: O(n)
import java.util.*;

public class Solution {
    private Map<Integer, Integer> memo = new HashMap<>();
    private int[] nums;
    
    public int rob(int[] nums) {
        this.nums = nums;
        return robFrom(0);
    }
    
    private int robFrom(int i) {
        if (i >= nums.length) return 0;
        if (memo.containsKey(i)) return memo.get(i);
        
        int result = Math.max(
            robFrom(i + 1),           // Skip current house
            nums[i] + robFrom(i + 2)  // Rob current house
        );
        
        memo.put(i, result);
        return result;
    }
}`,
        explanation: "Java implementation using top-down recursive approach with memoization. More intuitive for some but uses call stack space."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Space-optimized DP (O(m * n) time, O(min(m, n)) space): Use 1D array optimizing for smaller dimension. 2) 2D DP Array (O(m * n) time, O(m * n) space): Classic 2D DP table approach. 3) Mathematical Combinatorics (O(min(m, n)) time, O(1) space): Use combinations formula to calculate directly. 4) Recursive with Memoization: Top-down approach for understanding. Space-optimized DP balances clarity and efficiency.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Space-optimized DP (Optimal)
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
}`,
        explanation: "Space-optimized approach using 1D array. Optimizes for the smaller dimension to minimize space usage."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 1: Space-optimized DP (Optimal)
// Time: O(m * n), Space: O(min(m, n))
public class Solution {
    public int uniquePaths(int m, int n) {
        // Use smaller dimension for space optimization
        int rows = Math.min(m, n);
        int cols = Math.max(m, n);
        int[] dp = new int[rows];
        Arrays.fill(dp, 1);
        
        for (int col = 1; col < cols; col++) {
            for (int row = 1; row < rows; row++) {
                dp[row] += dp[row - 1];
            }
        }
        
        return dp[rows - 1];
    }
}`,
        explanation: "Java implementation using space-optimized approach with 1D array. Optimizes for the smaller dimension to minimize space usage."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: 2D DP Array
// Time: O(m * n), Space: O(m * n)
function uniquePaths2D(m: number, n: number): number {
    const dp = Array(m).fill(null).map(() => Array(n).fill(1));
    
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    
    return dp[m - 1][n - 1];
}`,
        explanation: "Classic 2D DP approach. Easier to understand and visualize. Each cell stores paths to reach that position."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 2: 2D DP Array
// Time: O(m * n), Space: O(m * n)
import java.util.Arrays;

public class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        
        // Fill first row and column with 1s
        Arrays.fill(dp[0], 1);
        for (int i = 0; i < m; i++) {
            dp[i][0] = 1;
        }
        
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        
        return dp[m - 1][n - 1];
    }
}`,
        explanation: "Java implementation using classic 2D DP approach. Easier to understand and visualize. Each cell stores paths to reach that position."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Mathematical (Combinatorics)
// Time: O(min(m, n)), Space: O(1)
function uniquePathsMath(m: number, n: number): number {
    // Total moves: (m-1) down + (n-1) right = m+n-2
    // Choose (m-1) positions for down moves: C(m+n-2, m-1)
    
    const totalMoves = m + n - 2;
    const downMoves = m - 1;
    
    const totalMoves = m + n - 2;
    const downMoves = m - 1;
    
    let result = 1;
    
    // Calculate C(totalMoves, downMoves) efficiently
    for (let i = 0; i < downMoves; i++) {
        result = result * (totalMoves - i) / (i + 1);
    }
    
    return Math.round(result);
}`,
        explanation: "Mathematical approach using combinations. Most efficient but requires understanding of combinatorics."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `// Approach 3: Mathematical (Combinatorics)
// Time: O(min(m, n)), Space: O(1)
public class Solution {
    public int uniquePaths(int m, int n) {
        // Total moves: (m-1) down + (n-1) right = m+n-2
        // Choose (m-1) positions for down moves: C(m+n-2, m-1)
        
        long totalMoves = m + n - 2;
        long downMoves = m - 1;
        
        long result = 1;
        
        // Calculate C(totalMoves, downMoves) efficiently
        for (int i = 0; i < downMoves; i++) {
            result = result * (totalMoves - i) / (i + 1);
        }
        
        return (int) result;
    }
}`,
        explanation: "Java implementation using mathematical approach with combinations. Most efficient but requires understanding of combinatorics. Uses long to avoid overflow."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 4: Recursive with Memoization
// Time: O(m * n), Space: O(m * n)
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
        explanation: "Top-down recursive approach with memoization. Good for understanding the problem structure."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `// Approach 4: Recursive with Memoization
// Time: O(m * n), Space: O(m * n)
import java.util.*;

public class Solution {
    private Map<String, Integer> memo = new HashMap<>();
    private int m, n;
    
    public int uniquePaths(int m, int n) {
        this.m = m;
        this.n = n;
        return dp(0, 0);
    }
    
    private int dp(int row, int col) {
        if (row == m - 1 && col == n - 1) return 1;
        if (row >= m || col >= n) return 0;
        
        String key = row + "," + col;
        if (memo.containsKey(key)) return memo.get(key);
        
        int result = dp(row + 1, col) + dp(row, col + 1);
        memo.put(key, result);
        return result;
    }
}`,
        explanation: "Java implementation using top-down recursive approach with memoization. Good for understanding the problem structure."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Greedy (O(n) time, O(1) space): Track maximum reachable position and check if current position is reachable. 2) Dynamic Programming (O(n²) time, O(n) space): Mark reachable positions in DP array. 3) Backtracking from End (O(n) time, O(1) space): Work backwards to find if start is reachable. 4) Jump Game II: Extension to find minimum jumps. Greedy approach is optimal for most cases.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Greedy (Optimal)
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
}`,
        explanation: "Greedy approach tracking maximum reachable position. Most efficient solution with early termination."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 1: Greedy (Optimal)
// Time: O(n), Space: O(1)
public class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0;
        
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
            
            // Early termination if we can reach the end
            if (maxReach >= nums.length - 1) return true;
        }
        
        return true;
    }
}`,
        explanation: "Java implementation using greedy approach tracking maximum reachable position. Most efficient solution with early termination."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Dynamic Programming
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
}`,
        explanation: "DP approach marking all reachable positions. Less efficient but more explicit about reachability."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 2: Dynamic Programming
// Time: O(n²), Space: O(n)
import java.util.Arrays;

public class Solution {
    public boolean canJump(int[] nums) {
        int n = nums.length;
        boolean[] dp = new boolean[n];
        dp[0] = true;
        
        for (int i = 0; i < n; i++) {
            if (!dp[i]) continue;
            
            for (int j = 1; j <= nums[i] && i + j < n; j++) {
                dp[i + j] = true;
            }
        }
        
        return dp[n - 1];
    }
}`,
        explanation: "Java implementation using DP approach marking all reachable positions. Less efficient but more explicit about reachability."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 3: Backtracking from End
// Time: O(n), Space: O(1)
function canJumpBacktrack(nums: number[]): boolean {
    let lastGoodIndex = nums.length - 1;
    
    for (let i = nums.length - 2; i >= 0; i--) {
        if (i + nums[i] >= lastGoodIndex) {
            lastGoodIndex = i;
        }
    }
    
    return lastGoodIndex === 0;
}`,
        explanation: "Works backwards from the end to check if each position can reach a 'good' position."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 3: Backtracking from End
// Time: O(n), Space: O(1)
public class Solution {
    public boolean canJump(int[] nums) {
        int lastGoodIndex = nums.length - 1;
        
        for (int i = nums.length - 2; i >= 0; i--) {
            if (i + nums[i] >= lastGoodIndex) {
                lastGoodIndex = i;
            }
        }
        
        return lastGoodIndex == 0;
    }
}`,
        explanation: "Java implementation working backwards from the end to check if each position can reach a 'good' position."
      },
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 4: Jump Game II - Minimum Jumps
// Time: O(n), Space: O(1)
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
        explanation: "Extension that finds minimum number of jumps needed to reach the end. Uses greedy BFS approach."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 4: Jump Game II - Minimum Jumps
// Time: O(n), Space: O(1)
public class Solution {
    public int jump(int[] nums) {
        int jumps = 0;
        int currentEnd = 0;
        int farthest = 0;
        
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
            }
        }
        
        return jumps;
    }
}`,
        explanation: "Java implementation finding minimum number of jumps needed to reach the end. Uses greedy BFS approach."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) 2D DP (O(m * n) time, O(m * n) space): Build complete table tracking minimum operations for all prefixes. 2) Space-optimized DP (O(m * n) time, O(min(m, n)) space): Use only two rows to save memory. 3) Recursive with Memoization (O(m * n) time, O(m * n) space): Top-down approach exploring all possibilities. 2D DP is most intuitive while space-optimized is most memory efficient.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 1: 2D DP (Standard)
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
}`,
        explanation: "Classic 2D DP approach building complete table. Most intuitive and allows reconstruction of operations sequence."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 1: 2D DP (Standard)
// Time: O(m * n), Space: O(m * n)
public class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length();
        int n = word2.length();
        
        // dp[i][j] = min operations to convert word1[0...i-1] to word2[0...j-1]
        int[][] dp = new int[m + 1][n + 1];
        
        // Initialize base cases
        for (int i = 0; i <= m; i++) dp[i][0] = i; // Delete all characters
        for (int j = 0; j <= n; j++) dp[0][j] = j; // Insert all characters
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1]; // No operation needed
                } else {
                    dp[i][j] = 1 + Math.min(
                        Math.min(dp[i - 1][j], dp[i][j - 1]), // Delete, Insert
                        dp[i - 1][j - 1]  // Replace
                    );
                }
            }
        }
        
        return dp[m][n];
    }
}`,
        explanation: "Java implementation using classic 2D DP approach building complete table. Most intuitive and allows reconstruction of operations sequence."
      },
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 2: Space-optimized DP
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
}`,
        explanation: "Space-optimized version using only current and previous rows. Memory efficient for very long strings."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 2: Space-optimized DP
// Time: O(m * n), Space: O(min(m, n))
public class Solution {
    public int minDistance(String word1, String word2) {
        String shorter = word1.length() <= word2.length() ? word1 : word2;
        String longer = word1.length() <= word2.length() ? word2 : word1;
        
        int[] prev = new int[shorter.length() + 1];
        for (int i = 0; i <= shorter.length(); i++) {
            prev[i] = i;
        }
        
        for (int i = 1; i <= longer.length(); i++) {
            int[] curr = new int[shorter.length() + 1];
            curr[0] = i;
            
            for (int j = 1; j <= shorter.length(); j++) {
                if (longer.charAt(i - 1) == shorter.charAt(j - 1)) {
                    curr[j] = prev[j - 1];
                } else {
                    curr[j] = 1 + Math.min(Math.min(prev[j], curr[j - 1]), prev[j - 1]);
                }
            }
            
            prev = curr;
        }
        
        return prev[shorter.length()];
    }
}`,
        explanation: "Java implementation using space-optimized version with only current and previous rows. Memory efficient for very long strings."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Recursive with Memoization
// Time: O(m * n), Space: O(m * n)
function minDistanceRecursive(word1: string, word2: string): number {
    const memo = new Map<string, number>();
    
    function dp(i: number, j: number): number {
        if (i === 0) return j; // Insert all remaining characters of word2
        if (2 === 0) return i; // Delete all remaining characters of word1
        
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
        explanation: "Top-down recursive approach with memoization. Good for understanding the problem structure and recurrence."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `// Approach 3: Recursive with Memoization
// Time: O(m * n), Space: O(m * n)
import java.util.*;

public class Solution {
    private Map<String, Integer> memo = new HashMap<>();
    private String word1, word2;
    
    public int minDistance(String word1, String word2) {
        this.word1 = word1;
        this.word2 = word2;
        return dp(word1.length(), word2.length());
    }
    
    private int dp(int i, int j) {
        if (i == 0) return j; // Insert all remaining characters of word2
        if (j == 0) return i; // Delete all remaining characters of word1
        
        String key = i + "," + j;
        if (memo.containsKey(key)) return memo.get(key);
        
        int result;
        
        if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
            result = dp(i - 1, j - 1);
        } else {
            result = 1 + Math.min(
                Math.min(dp(i - 1, j), dp(i, j - 1)), // Delete, Insert
                dp(i - 1, j - 1)  // Replace
            );
        }
        
        memo.put(key, result);
        return result;
    }
}`,
        explanation: "Java implementation using top-down recursive approach with memoization. Good for understanding the problem structure and recurrence."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Bottom-up DP (O(amount * coins.length) time, O(amount) space): Classic unbounded knapsack approach building solution iteratively. 2) Top-down DP with Memoization (O(amount * coins.length) time, O(amount) space): Recursive approach with memoization to avoid redundant calculations. 3) BFS Approach (O(amount * coins.length) time, O(amount) space): Breadth-first search to find minimum steps, naturally finds optimal solution. Bottom-up DP is most efficient for space, while BFS provides intuitive understanding of the process.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Bottom-up DP (Optimal)
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
}`,
        explanation: "Bottom-up DP builds solution iteratively. Most space-efficient approach that fills DP table systematically."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 1: Bottom-up DP (Optimal)
// Time: O(amount * coins.length), Space: O(amount)
import java.util.Arrays;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i && dp[i - coin] != Integer.MAX_VALUE) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        
        return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
    }
}`,
        explanation: "Java implementation using bottom-up DP building solution iteratively. Most space-efficient approach that fills DP table systematically."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Top-down DP with Memoization
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
}`,
        explanation: "Top-down approach with memoization avoids redundant calculations. More intuitive recursive structure."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 2: Top-down DP with Memoization
// Time: O(amount * coins.length), Space: O(amount)
import java.util.*;

public class Solution {
    private Map<Integer, Integer> memo = new HashMap<>();
    private int[] coins;
    
    public int coinChange(int[] coins, int amount) {
        this.coins = coins;
        int result = dp(amount);
        return result == Integer.MAX_VALUE ? -1 : result;
    }
    
    private int dp(int remaining) {
        if (remaining == 0) return 0;
        if (remaining < 0) return Integer.MAX_VALUE;
        if (memo.containsKey(remaining)) return memo.get(remaining);
        
        int minCoins = Integer.MAX_VALUE;
        
        for (int coin : coins) {
            int result = dp(remaining - coin);
            if (result != Integer.MAX_VALUE) {
                minCoins = Math.min(minCoins, result + 1);
            }
        }
        
        memo.put(remaining, minCoins);
        return minCoins;
    }
}`,
        explanation: "Java implementation using top-down approach with memoization avoids redundant calculations. More intuitive recursive structure."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: BFS Approach
// Time: O(amount * coins.length), Space: O(amount)
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
        explanation: "BFS naturally finds minimum steps by exploring levels. Intuitive approach that shows the process step by step."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `// Approach 3: BFS Approach
// Time: O(amount * coins.length), Space: O(amount)
import java.util.*;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        if (amount == 0) return 0;
        
        Queue<Integer> queue = new LinkedList<>();
        Set<Integer> visited = new HashSet<>();
        queue.offer(0);
        visited.add(0);
        int level = 0;
        
        while (!queue.isEmpty()) {
            int size = queue.size();
            level++;
            
            for (int i = 0; i < size; i++) {
                int current = queue.poll();
                
                for (int coin : coins) {
                    int next = current + coin;
                    
                    if (next == amount) return level;
                    if (next < amount && !visited.contains(next)) {
                        visited.add(next);
                        queue.offer(next);
                    }
                }
            }
        }
        
        return -1;
    }
}`,
        explanation: "Java implementation using BFS naturally finds minimum steps by exploring levels. Intuitive approach that shows the process step by step."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Binary Search with Patience Sorting (O(n log n) time, O(n) space): Most efficient approach using patience sorting algorithm. 2) Dynamic Programming (O(n²) time, O(n) space): Classic DP approach building LIS ending at each position. 3) LIS Reconstruction: Extension to find the actual subsequence, not just length. Binary search approach is optimal for time complexity, while DP approach provides better understanding of the problem structure.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Binary Search with Patience Sorting (Optimal)
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
}`,
        explanation: "Binary search approach maintains array of smallest tail elements. Most efficient with O(n log n) time complexity."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 1: Binary Search with Patience Sorting (Optimal)
// Time: O(n log n), Space: O(n)
import java.util.*;

public class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        
        for (int num : nums) {
            int left = 0;
            int right = tails.size();
            
            // Binary search for insertion position
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (tails.get(mid) < num) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }
            
            // If num is larger than all elements, append
            if (left == tails.size()) {
                tails.add(num);
            } else {
                // Replace the first element >= num
                tails.set(left, num);
            }
        }
        
        return tails.size();
    }
}`,
        explanation: "Java implementation using binary search approach maintaining array of smallest tail elements. Most efficient with O(n log n) time complexity."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Dynamic Programming
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
}`,
        explanation: "Classic DP approach builds LIS ending at each position. More intuitive but less efficient than binary search."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 2: Dynamic Programming
// Time: O(n²), Space: O(n)
import java.util.Arrays;

public class Solution {
    public int lengthOfLIS(int[] nums) {
        if (nums.length == 0) return 0;
        
        int[] dp = new int[nums.length];
        Arrays.fill(dp, 1);
        int maxLength = 1;
        
        for (int i = 1; i < nums.length; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLength = Math.max(maxLength, dp[i]);
        }
        
        return maxLength;
    }
}`,
        explanation: "Java implementation using classic DP approach building LIS ending at each position. More intuitive but less efficient than binary search."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: LIS Reconstruction
// Time: O(n²), Space: O(n)
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
        explanation: "Extension of DP approach that reconstructs the actual LIS sequence, not just the length."
      }
    ],
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
  },
  {
    id: "enhanced-dp-8",
    question: "0/1 Knapsack Problem - Given weights and values of items and knapsack capacity, maximize value without exceeding weight.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) 2D DP Approach (O(n * W) time, O(n * W) space): Standard dynamic programming solution building complete table. 2) Space-optimized DP (O(n * W) time, O(W) space): Uses only one row to save memory by processing weights in reverse order. 3) Knapsack with Item Selection: Extension to return both maximum value and selected items using backtracking. Space-optimized approach is most practical for large capacity values.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 1: 2D DP Approach (Standard)
// Time: O(n * W), Space: O(n * W)
function knapsack(weights: number[], values: number[], capacity: number): number {
    const n = weights.length;
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w], // Don't take item
                    dp[i - 1][w - weights[i - 1]] + values[i - 1] // Take item
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    return dp[n][capacity];
}`,
        explanation: "Standard 2D DP approach builds complete table. Most intuitive but uses more memory."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 1: 2D DP Approach (Standard)
// Time: O(n * W), Space: O(n * W)
public class Solution {
    public int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];
        
        for (int i = 1; i <= n; i++) {
            for (int w = 1; w <= capacity; w++) {
                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(
                        dp[i - 1][w], // Don't take item
                        dp[i - 1][w - weights[i - 1]] + values[i - 1] // Take item
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        
        return dp[n][capacity];
    }
}`,
        explanation: "Java implementation using standard 2D DP approach builds complete table. Most intuitive but uses more memory."
      },
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 2: Space-optimized DP
// Time: O(n * W), Space: O(W)
function knapsackOptimized(weights: number[], values: number[], capacity: number): number {
    const dp = new Array(capacity + 1).fill(0);
    
    for (let i = 0; i < weights.length; i++) {
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    
    return dp[capacity];
}`,
        explanation: "Space-optimized approach uses only one row. Process weights in reverse order to avoid overwriting."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 2: Space-optimized DP
// Time: O(n * W), Space: O(W)
public class Solution {
    public int knapsack(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1];
        
        for (int i = 0; i < weights.length; i++) {
            for (int w = capacity; w >= weights[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        
        return dp[capacity];
    }
}`,
        explanation: "Java implementation using space-optimized approach with only one row. Process weights in reverse order to avoid overwriting."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Knapsack with Item Selection
// Time: O(n * W), Space: O(n * W)
function knapsackWithItems(weights: number[], values: number[], capacity: number): {maxValue: number, items: number[]} {
    const n = weights.length;
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    // Backtrack to find selected items
    const items: number[] = [];
    let w = capacity;
    
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            items.push(i - 1);
            w -= weights[i - 1];
        }
    }
    
    return {maxValue: dp[n][capacity], items: items.reverse()};
}`,
        explanation: "Extension that returns both maximum value and selected items using backtracking through DP table."
      }
    ],
    tips: [
      "Classic DP: dp[i][w] = max value using first i items with weight ≤ w",
      "For each item: choose to include or exclude",
      "Space optimization: process weights in reverse order",
      "Backtrack through DP table to find selected items"
    ],
    tags: ["dynamic-programming", "optimization"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-9",
    question: "Palindrome Partitioning - Given string s, partition s such that every substring is a palindrome. Return all possible partitions.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Backtracking with Palindrome Check (O(n * 2^n) time, O(n) space): Standard backtracking approach checking palindromes on-the-fly. 2) Optimized with Precomputed Palindromes (O(n * 2^n) time, O(n²) space): Precompute palindrome table for O(1) palindrome checks. 3) Minimum Cuts Extension: Find minimum cuts needed to partition string into palindromes. Precomputed approach trades space for time efficiency in palindrome checks.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 1: Backtracking with Palindrome Check
// Time: O(n * 2^n), Space: O(n)
function partition(s: string): string[][] {
    const result: string[][] = [];
    
    function isPalindrome(str: string, start: number, end: number): boolean {
        while (start < end) {
            if (str[start] !== str[end]) return false;
            start++;
            end--;
        }
        return true;
    }
    
    function backtrack(start: number, currentPartition: string[]): void {
        if (start === s.length) {
            result.push([...currentPartition]);
            return;
        }
        
        for (let end = start; end < s.length; end++) {
            if (isPalindrome(s, start, end)) {
                currentPartition.push(s.substring(start, end + 1));
                backtrack(end + 1, currentPartition);
                currentPartition.pop();
            }
        }
    }
    
    backtrack(0, []);
    return result;
}`,
        explanation: "Standard backtracking approach checks palindromes on-the-fly. Most space-efficient but slower palindrome checks."
      },
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 2: Optimized with Precomputed Palindromes
// Time: O(n * 2^n), Space: O(n²)
function partitionOptimized(s: string): string[][] {
    const n = s.length;
    const isPalin = Array(n).fill(null).map(() => Array(n).fill(false));
    
    // Precompute palindrome table
    for (let i = n - 1; i >= 0; i--) {
        for (let j = i; j < n; j++) {
            if (s[i] === s[j] && (j - i <= 2 || isPalin[i + 1][j - 1])) {
                isPalin[i][j] = true;
            }
        }
    }
    
    const result: string[][] = [];
    
    function backtrack(start: number, currentPartition: string[]): void {
        if (start === n) {
            result.push([...currentPartition]);
            return;
        }
        
        for (let end = start; end < n; end++) {
            if (isPalin[start][end]) {
                currentPartition.push(s.substring(start, end + 1));
                backtrack(end + 1, currentPartition);
                currentPartition.pop();
            }
        }
    }
    
    backtrack(0, []);
    return result;
}`,
        explanation: "Precomputed palindrome table provides O(1) palindrome checks. Trades space for time efficiency."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Minimum Cuts Extension
// Time: O(n²), Space: O(n²)
function minCut(s: string): number {
    const n = s.length;
    const isPalin = Array(n).fill(null).map(() => Array(n).fill(false));
    
    // Precompute palindromes
    for (let i = n - 1; i >= 0; i--) {
        for (let j = i; j < n; j++) {
            if (s[i] === s[j] && (j - i <= 2 || isPalin[i + 1][j - 1])) {
                isPalin[i][j] = true;
            }
        }
    }
    
    const cuts = new Array(n).fill(Infinity);
    
    for (let i = 0; i < n; i++) {
        if (isPalin[0][i]) {
            cuts[i] = 0;
        } else {
            for (let j = 0; j < i; j++) {
                if (isPalin[j + 1][i]) {
                    cuts[i] = Math.min(cuts[i], cuts[j] + 1);
                }
            }
        }
    }
    
    return cuts[n - 1];
}`,
        explanation: "Extension that finds minimum cuts needed to partition string into palindromes using DP."
      }
    ],
    tips: [
      "Backtrack by trying all possible palindromic prefixes",
      "Precompute palindrome table for O(1) palindrome checks",
      "For min cuts: DP where cuts[i] = min cuts for s[0...i]",
      "Expand around centers for palindrome detection"
    ],
    tags: ["string", "dynamic-programming", "backtracking"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-dp-10",
    question: "Word Break - Given string s and dictionary, determine if s can be segmented into space-separated sequence of dictionary words.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Dynamic Programming (O(n² * m) time, O(n) space): Standard DP approach building solution iteratively. 2) BFS Approach (O(n² * m) time, O(n) space): Breadth-first search explores positions level by level. 3) Word Break II Extension: Return all possible sentences using memoization and backtracking. DP approach is most intuitive, while BFS provides natural exploration of the solution space.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Dynamic Programming (Optimal)
// Time: O(n² * m), Space: O(n) where m = avg word length
function wordBreak(s: string, wordDict: string[]): boolean {
    const wordSet = new Set(wordDict);
    const dp = new Array(s.length + 1).fill(false);
    dp[0] = true; // Empty string can always be segmented
    
    for (let i = 1; i <= s.length; i++) {
        for (let j = 0; j < i; j++) {
            if (dp[j] && wordSet.has(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    
    return dp[s.length];
}`,
        explanation: "Standard DP approach builds solution iteratively. Most intuitive with clear state definition."
      },
      {
        language: "java",
        approach: "optimal",
        code: `// Approach 1: Dynamic Programming (Optimal)
// Time: O(n² * m), Space: O(n) where m = avg word length
import java.util.*;

public class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> wordSet = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true; // Empty string can always be segmented
        
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && wordSet.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        
        return dp[s.length()];
    }
}`,
        explanation: "Java implementation using standard DP approach building solution iteratively. Most intuitive with clear state definition."
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: BFS Approach
// Time: O(n² * m), Space: O(n)
function wordBreakBFS(s: string, wordDict: string[]): boolean {
    const wordSet = new Set(wordDict);
    const visited = new Set<number>();
    const queue: number[] = [0];
    
    while (queue.length > 0) {
        const start = queue.shift()!;
        
        if (start === s.length) return true;
        if (visited.has(start)) continue;
        
        visited.add(start);
        
        for (let end = start + 1; end <= s.length; end++) {
        if (wordSet.has(s.substring(start, end))) {
            queue.push(end);
        }
    }
    
    return false;
}`,
        explanation: "BFS explores positions level by level. Natural approach that shows the process step by step."
      },
      {
        language: "java",
        approach: "moderate",
        code: `// Approach 2: BFS Approach
// Time: O(n² * m), Space: O(n)
import java.util.*;

public class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> wordSet = new HashSet<>(wordDict);
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> queue = new LinkedList<>();
        
        queue.offer(0);
        
        while (!queue.isEmpty()) {
            int start = queue.poll();
            
            if (start == s.length()) return true;
            if (visited.contains(start)) continue;
            
            visited.add(start);
            
            for (int end = start + 1; end <= s.length(); end++) {
                if (wordSet.contains(s.substring(start, end))) {
                    queue.offer(end);
                }
            }
        }
        
        return false;
    }
}`,
        explanation: "Java implementation using BFS explores positions level by level. Natural approach that shows the process step by step."
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Word Break II - All Possible Sentences
// Time: O(n² * m), Space: O(n)
function wordBreakII(s: string, wordDict: string[]): string[] {
    const wordSet = new Set(wordDict);
    const memo = new Map<number, string[]>();
    
    function dp(start: number): string[] {
        if (start === s.length) return [''];
        if (memo.has(start)) return memo.get(start)!;
        
        const result: string[] = [];
        
        for (let end = start + 1; end <= s.length; end++) {
            const word = s.substring(start, end);
            
            if (wordSet.has(word)) {
                const suffixes = dp(end);
                for (const suffix of suffixes) high) {
                    result.push(word + (suffix ? ' ' + suffix : ''));
                }
            }
        }
        
        memo.set(start, result);
        return result;
    }
    
    return dp(0);
}`,
        explanation: "Extension that returns all possible sentences using memoization to avoid recomputation."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `// Approach 3: Word Break II - All Possible Sentences
// Time: O(n² * m), Space: O(n)
import java.util.*;

public class Solution {
    private Map<Integer, List<String>> memo = new HashMap<>();
    private Set<String> wordSet;
    private String s;
    
    public List<String> wordBreak(String s, List<String> wordDict) {
        this.wordSet = new HashSet<>(wordDict);
        this.s = s;
        return dp(0);
    }
    
    private List<String> dp(int start) {
        if (start == s.length()) {
            List<String> result = new ArrayList<>();
            result.add("");
            return result;
        }
        
        if (memo.containsKey(start)) {
            return memo.get(start);
        }
        
        List<String> result = new ArrayList<>();
        
        for (int end = start + 1; end <= s.length(); end++) {
            String word = s.substring(start, end);
            
            if (wordSet.contains(word)) {
                List<String> suffixes = dp(end);
                for (String suffix : suffixes) {
                    result.add(word + (suffix.isEmpty() ? "" : " " + suffix));
                }
            }
        }
        
        memo.put(start, result);
        return result;
    }
}`,
        explanation: "Java implementation of extension that returns all possible sentences using memoization to avoid recomputation."
      }
    ],
    tips: [
      "DP state: dp[i] = true if s[0...i-1] can be segmented",
      "For each position, try all possible word endings",
      "BFS explores positions level by level",
      "Word Break II uses memoization to avoid recomputation"
    ],
    tags: ["string", "dynamic-programming", "bfs", "backtracking"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];