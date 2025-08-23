import { Question } from "../../InterviewSubjects";

// Enhanced Backtracking DSA Questions with comprehensive implementations
export const enhancedBacktrackingQuestions: Question[] = [
  {
    id: "enhanced-backtrack-1",
    question:
      "Generate Parentheses - Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem can be solved using multiple approaches: backtracking (most intuitive), iterative with queue, or dynamic programming.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Backtracking (Recursive): This approach uses backtracking to build strings character by character. We track the count of open and closed parentheses and add them when valid conditions are met. Time: O(4^n / √n), Space: O(4^n / √n)",
        code: `function generateParenthesis(n: number): string[] {
    const result: string[] = [];
    
    function backtrack(current: string, open: number, close: number): void {
        if (current.length === 2 * n) {
            result.push(current);
            return;
        }
        
        if (open < n) {
            backtrack(current + '(', open + 1, close);
        }
        
        if (close < open) {
            backtrack(current + ')', open, close + 1);
        }
    }
    
    backtrack('', 0, 0);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Backtracking (Recursive): Java implementation using the same backtracking approach. We use ArrayList to store results and StringBuilder for efficient string building. Time: O(4^n / √n), Space: O(4^n / √n)",
        code: `import java.util.*;

public class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        backtrack(result, new StringBuilder(), 0, 0, n);
        return result;
    }
    
    private void backtrack(List<String> result, StringBuilder current, int open, int close, int n) {
        if (current.length() == 2 * n) {
            result.add(current.toString());
            return;
        }
        
        if (open < n) {
            current.append('(');
            backtrack(result, current, open + 1, close, n);
            current.deleteCharAt(current.length() - 1);
        }
        
        if (close < open) {
            current.append(')');
            backtrack(result, current, open, close + 1, n);
            current.deleteCharAt(current.length() - 1);
        }
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Iterative with Queue: This approach uses a queue to simulate the recursive calls, tracking the same state information (current string, open count, close count). Time: O(4^n / √n), Space: O(4^n / √n)",
        code: `function generateParenthesisIterative(n: number): string[] {
    const result: string[] = [];
    const queue: [string, number, number][] = [['', 0, 0]]; // [current, open, close]
    
    while (queue.length > 0) {
        const [current, open, close] = queue.shift()!;
        
        if (current.length === 2 * n) {
            result.push(current);
            continue;
        }
        
        if (open < n) {
            queue.push([current + '(', open + 1, close]);
        }
        
        if (close < open) {
            queue.push([current + ')', open, close + 1]);
        }
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Iterative with Queue: Java implementation using a queue to simulate recursive calls. We use a custom State class to track the current string and counts. Time: O(4^n / √n), Space: O(4^n / √n)",
        code: `import java.util.*;

public class Solution {
    class State {
        String current;
        int open, close;
        
        State(String current, int open, int close) {
            this.current = current;
            this.open = open;
            this.close = close;
        }
    }
    
    public List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        Queue<State> queue = new LinkedList<>();
        queue.offer(new State("", 0, 0));
        
        while (!queue.isEmpty()) {
            State state = queue.poll();
            
            if (state.current.length() == 2 * n) {
                result.add(state.current);
                continue;
            }
            
            if (state.open < n) {
                queue.offer(new State(state.current + "(", state.open + 1, state.close));
            }
            
            if (state.close < state.open) {
                queue.offer(new State(state.current + ")", state.open, state.close + 1));
            }
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Dynamic Programming: This approach uses DP to build solutions using the Catalan number recurrence relation. For each position, we consider all possible combinations of valid substrings. Time: O(4^n / √n), Space: O(4^n / √n)",
        code: `function generateParenthesisDP(n: number): string[] {
    const dp: string[][] = [['']];
    
    for (let i = 1; i <= n; i++) {
        dp[i] = [];
        for (let j = 0; j < i; j++) {
            for (const left of dp[j]) {
                for (const right of dp[i - 1 - j]) {
                    dp[i].push('(' + left + ')' + right);
                }
            }
        }
    }
    
    return dp[n];
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Dynamic Programming: Java implementation using DP with Catalan number recurrence. We use ArrayList arrays to store solutions for each position. Time: O(4^n / √n), Space: O(4^n / √n)",
        code: `import java.util.*;

public class Solution {
    public List<String> generateParenthesis(int n) {
        List<List<String>> dp = new ArrayList<>();
        dp.add(Arrays.asList(""));
        
        for (int i = 1; i <= n; i++) {
            List<String> current = new ArrayList<>();
            for (int j = 0; j < i; j++) {
                for (String left : dp.get(j)) {
                    for (String right : dp.get(i - 1 - j)) {
                        current.add("(" + left + ")" + right);
                    }
                }
            }
            dp.add(current);
        }
        
        return dp.get(n);
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Use backtracking to build valid combinations",
      "Track open and close parentheses count",
      "Add '(' when open < n, add ')' when close < open",
      "DP approach uses Catalan number recurrence",
    ],
    tags: ["backtracking", "string", "recursion"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-backtrack-2",
    question:
      "Permutations - Given array of distinct integers, return all possible permutations.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem can be solved using multiple backtracking approaches or an iterative approach. We can also extend the solution to handle arrays with duplicate values.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Backtracking with Used Array: This approach keeps track of used elements with a boolean array, building permutations one element at a time. Time: O(n! * n), Space: O(n)",
        code: `function permute(nums: number[]): number[][] {
    const result: number[][] = [];
    const used = new Array(nums.length).fill(false);
    
    function backtrack(current: number[]): void {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {
            if (!used[i]) {
                used[i] = true;
                current.push(nums[i]);
                
                backtrack(current);
                
                current.pop();
                used[i] = false;
            }
        }
    }
    
    backtrack([]);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Backtracking with Used Array: Java implementation using boolean array to track used elements. We use ArrayList for dynamic result collection and backtracking. Time: O(n! * n), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(result, new ArrayList<>(), nums, used);
        return result;
    }
    
    private void backtrack(List<List<Integer>> result, List<Integer> current, int[] nums, boolean[] used) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        
        for (int i = 0; i < nums.length; i++) {
            if (!used[i]) {
                used[i] = true;
                current.add(nums[i]);
                
                backtrack(result, current, nums, used);
                
                current.remove(current.size() - 1);
                used[i] = false;
            }
        }
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Swap-based Backtracking (In-place): This approach performs swaps to generate permutations, avoiding the need for a used array by working directly on the input array. Time: O(n! * n), Space: O(n) recursion stack",
        code: `function permuteSwap(nums: number[]): number[][] {
    const result: number[][] = [];
    
    function backtrack(start: number): void {
        if (start === nums.length) {
            result.push([...nums]);
            return;
        }
        
        for (let i = start; i < nums.length; i++) {
            [nums[start], nums[i]] = [nums[i], nums[start]];
            backtrack(start + 1);
            [nums[start], nums[i]] = [nums[i], nums[start]]; // Backtrack
        }
    }
    
    backtrack(0);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Swap-based Backtracking (In-place): Java implementation using in-place swaps to generate permutations. This avoids extra space for tracking used elements. Time: O(n! * n), Space: O(n) recursion stack",
        code: `import java.util.*;

public class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(result, nums, 0);
        return result;
    }
    
    private void backtrack(List<List<Integer>> result, int[] nums, int start) {
        if (start == nums.length) {
            List<Integer> permutation = new ArrayList<>();
            for (int num : nums) {
                permutation.add(num);
            }
            result.add(permutation);
            return;
        }
        
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            backtrack(result, nums, start + 1);
            swap(nums, start, i); // Backtrack
        }
    }
    
    private void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Iterative Approach: This approach builds permutations by inserting each new number at every possible position in existing permutations. Time: O(n! * n), Space: O(n!)",
        code: `function permuteIterative(nums: number[]): number[][] {
    const result: number[][] = [[]];
    
    for (const num of nums) {
        const newResult: number[][] = [];
        
        for (const perm of result) {
            for (let i = 0; i <= perm.length; i++) {
                newResult.push([...perm.slice(0, i), num, ...perm.slice(i)]);
            }
        }
        
        result.length = 0;
        result.push(...newResult);
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Iterative Approach: Java implementation that builds permutations by inserting each new number at every possible position. We use ArrayList operations for insertion. Time: O(n! * n), Space: O(n!)",
        code: `import java.util.*;

public class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        result.add(new ArrayList<>());
        
        for (int num : nums) {
            List<List<Integer>> newResult = new ArrayList<>();
            
            for (List<Integer> perm : result) {
                for (int i = 0; i <= perm.size(); i++) {
                    List<Integer> newPerm = new ArrayList<>(perm);
                    newPerm.add(i, num);
                    newResult.add(newPerm);
                }
            }
            
            result = newResult;
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Handling Duplicates (Permutations II): This approach modifies the backtracking algorithm to handle duplicate values by sorting the array first and skipping duplicate choices. Time: O(n! * n), Space: O(n)",
        code: `function permuteUnique(nums: number[]): number[][] {
    const result: number[][] = [];
    nums.sort((a, b) => a - b);
    const used = new Array(nums.length).fill(false);
    
    function backtrack(current: number[]): void {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {
            if (used[i] || (i > 0 && nums[i] === nums[i - 1] && !used[i - 1])) {
                continue;
            }
            
            used[i] = true;
            current.push(nums[i]);
            
            backtrack(current);
            
            current.pop();
            used[i] = false;
        }
    }
    
    backtrack([]);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Handling Duplicates (Permutations II): Java implementation that handles duplicate values by sorting first and skipping duplicate branches. The key is to avoid using duplicate elements at the same recursion level. Time: O(n! * n), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    public List<List<Integer>> permuteUnique(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        boolean[] used = new boolean[nums.length];
        backtrack(result, new ArrayList<>(), nums, used);
        return result;
    }
    
    private void backtrack(List<List<Integer>> result, List<Integer> current, int[] nums, boolean[] used) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        
        for (int i = 0; i < nums.length; i++) {
            if (used[i] || (i > 0 && nums[i] == nums[i - 1] && !used[i - 1])) {
                continue;
            }
            
            used[i] = true;
            current.add(nums[i]);
            
            backtrack(result, current, nums, used);
            
            current.remove(current.size() - 1);
            used[i] = false;
        }
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Backtrack by undoing choices after exploring",
      "Use boolean array to track used elements",
      "Swap-based approach modifies array in-place",
      "For duplicates: sort first and skip duplicate branches",
    ],
    tags: ["backtracking", "array", "recursion"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-backtrack-3",
    question:
      "Combinations - Given two integers n and k, return all possible combinations of k numbers chosen from range [1, n].",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem can be solved using backtracking with different optimizations or an iterative approach. The key is to avoid duplicate combinations by using a start index.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Backtracking Approach: This is the standard backtracking solution that uses a start index to avoid duplicate combinations. Time: O(C(n,k) * k), Space: O(C(n,k) * k)",
        code: `function combine(n: number, k: number): number[][] {
    const result: number[][] = [];
    
    function backtrack(start: number, current: number[]): void {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        
        for (let i = start; i <= n; i++) {
            current.push(i);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    
    backtrack(1, []);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Backtracking Approach: Java implementation using standard backtracking with start index to avoid duplicates. We use ArrayList for dynamic collection management. Time: O(C(n,k) * k), Space: O(C(n,k) * k)",
        code: `import java.util.*;

public class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(result, new ArrayList<>(), 1, n, k);
        return result;
    }
    
    private void backtrack(List<List<Integer>> result, List<Integer> current, int start, int n, int k) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }
        
        for (int i = start; i <= n; i++) {
            current.add(i);
            backtrack(result, current, i + 1, n, k);
            current.remove(current.size() - 1);
        }
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Optimized with Early Pruning: This approach adds pruning checks to avoid exploring branches that can't lead to valid combinations, reducing computation time. Time: O(C(n,k) * k), Space: O(C(n,k) * k)",
        code: `function combineOptimized(n: number, k: number): number[][] {
    const result: number[][] = [];
    
    function backtrack(start: number, current: number[]): void {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        
        const needed = k - current.length;
        const available = n - start + 1;
        
        if (available < needed) return; // Pruning
        
        for (let i = start; i <= n - needed + 1; i++) {
            current.push(i);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    
    backtrack(1, []);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Optimized with Early Pruning: Java implementation with pruning optimization to skip branches that cannot lead to valid combinations. This reduces unnecessary computation. Time: O(C(n,k) * k), Space: O(C(n,k) * k)",
        code: `import java.util.*;

public class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(result, new ArrayList<>(), 1, n, k);
        return result;
    }
    
    private void backtrack(List<List<Integer>> result, List<Integer> current, int start, int n, int k) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }
        
        int needed = k - current.size();
        int available = n - start + 1;
        
        if (available < needed) return; // Pruning
        
        for (int i = start; i <= n - needed + 1; i++) {
            current.add(i);
            backtrack(result, current, i + 1, n, k);
            current.remove(current.size() - 1);
        }
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Iterative Approach: This approach uses an explicit stack to simulate the recursive calls, which can be more efficient in languages where recursion is expensive. Time: O(C(n,k) * k), Space: O(C(n,k) * k)",
        code: `function combineIterative(n: number, k: number): number[][] {
    const result: number[][] = [];
    const stack: [number, number[]][] = [[1, []]]; // [start, current]
    
    while (stack.length > 0) {
        const [start, current] = stack.pop()!;
        
        if (current.length === k) {
            result.push([...current]);
            continue;
        }
        
        for (let i = start; i <= n; i++) {
            stack.push([i + 1, [...current, i]]);
        }
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Iterative Approach: Java implementation using explicit stack to simulate recursive calls. We use a custom State class to track the start position and current combination. Time: O(C(n,k) * k), Space: O(C(n,k) * k)",
        code: `import java.util.*;

public class Solution {
    class State {
        int start;
        List<Integer> current;
        
        State(int start, List<Integer> current) {
            this.start = start;
            this.current = new ArrayList<>(current);
        }
    }
    
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        Stack<State> stack = new Stack<>();
        stack.push(new State(1, new ArrayList<>()));
        
        while (!stack.isEmpty()) {
            State state = stack.pop();
            
            if (state.current.size() == k) {
                result.add(new ArrayList<>(state.current));
                continue;
            }
            
            for (int i = state.start; i <= n; i++) {
                List<Integer> newCurrent = new ArrayList<>(state.current);
                newCurrent.add(i);
                stack.push(new State(i + 1, newCurrent));
            }
        }
        
        return result;
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Use start index to avoid duplicate combinations",
      "Prune branches when remaining numbers < needed numbers",
      "Backtrack by removing last added element",
      "Iterative approach uses explicit stack",
    ],
    tags: ["backtracking", "math", "combinatorics"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-backtrack-4",
    question:
      "N-Queens - Place n queens on n×n chessboard so that no two queens attack each other.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "This classic backtracking problem can be solved using several approaches, from standard set-based tracking to optimized bit manipulation techniques.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Backtracking with Conflict Detection: This approach uses sets to track occupied columns and diagonals. By placing queens row by row, we only need to check if the current position conflicts with any previously placed queen. Time: O(n!), Space: O(n)",
        code: `function solveNQueens(n: number): string[][] {
    const result: string[][] = [];
    const board = Array(n).fill(null).map(() => Array(n).fill('.'));
    const cols = new Set<number>();
    const diag1 = new Set<number>(); // row - col
    const diag2 = new Set<number>(); // row + col
    
    function backtrack(row: number): void {
        if (row === n) {
            result.push(board.map(row => row.join('')));
            return;
        }
        
        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue;
            }
            
            // Place queen
            board[row][col] = 'Q';
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            
            backtrack(row + 1);
            
            // Remove queen (backtrack)
            board[row][col] = '.';
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
        }
    }
    
    backtrack(0);
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Backtracking with Conflict Detection: Java implementation using HashSet to track conflicts. We use char arrays for the board and convert to strings for the result. Time: O(n!), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        char[][] board = new char[n][n];
        
        // Initialize board
        for (int i = 0; i < n; i++) {
            Arrays.fill(board[i], '.');
        }
        
        Set<Integer> cols = new HashSet<>();
        Set<Integer> diag1 = new HashSet<>(); // row - col
        Set<Integer> diag2 = new HashSet<>(); // row + col
        
        backtrack(result, board, 0, cols, diag1, diag2, n);
        return result;
    }
    
    private void backtrack(List<List<String>> result, char[][] board, int row, 
                          Set<Integer> cols, Set<Integer> diag1, Set<Integer> diag2, int n) {
        if (row == n) {
            List<String> solution = new ArrayList<>();
            for (char[] r : board) {
                solution.add(new String(r));
            }
            result.add(solution);
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (cols.contains(col) || diag1.contains(row - col) || diag2.contains(row + col)) {
                continue;
            }
            
            // Place queen
            board[row][col] = 'Q';
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            
            backtrack(result, board, row + 1, cols, diag1, diag2, n);
            
            // Remove queen (backtrack)
            board[row][col] = '.';
            cols.remove(col);
            diag1.remove(row - col);
            diag2.remove(row + col);
        }
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Count Solutions Only (N-Queens II): This variation focuses only on counting valid solutions rather than constructing the boards, which can be more efficient when only the count is needed. Time: O(n!), Space: O(n)",
        code: `function totalNQueens(n: number): number {
    let count = 0;
    const cols = new Set<number>();
    const diag1 = new Set<number>();
    const diag2 = new Set<number>();
    
    function backtrack(row: number): void {
        if (row === n) {
            count++;
            return;
        }
        
        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue;
            }
            
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            
            backtrack(row + 1);
            
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
        }
    }
    
    backtrack(0);
    return count;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Count Solutions Only (N-Queens II): Java implementation that only counts solutions without constructing the boards. This is more memory efficient when only the count is needed. Time: O(n!), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    private int count = 0;
    
    public int totalNQueens(int n) {
        Set<Integer> cols = new HashSet<>();
        Set<Integer> diag1 = new HashSet<>();
        Set<Integer> diag2 = new HashSet<>();
        
        backtrack(0, cols, diag1, diag2, n);
        return count;
    }
    
    private void backtrack(int row, Set<Integer> cols, Set<Integer> diag1, Set<Integer> diag2, int n) {
        if (row == n) {
            count++;
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (cols.contains(col) || diag1.contains(row - col) || diag2.contains(row + col)) {
                continue;
            }
            
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            
            backtrack(row + 1, cols, diag1, diag2, n);
            
            cols.remove(col);
            diag1.remove(row - col);
            diag2.remove(row + col);
        }
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Bit Manipulation Optimization: This approach uses bitwise operations to track conflicts, which is significantly faster than using sets. The available positions are calculated using bit operations, and we find the least significant bit to place the queen. Time: O(n!), Space: O(n)",
        code: `function solveNQueensBit(n: number): string[][] {
    const result: string[][] = [];
    const solutions: number[] = [];
    
    function backtrack(row: number, cols: number, diag1: number, diag2: number): void {
        if (row === n) {
            result.push(constructBoard(solutions, n));
            return;
        }
        
        let availablePositions = ((1 << n) - 1) & (~(cols | diag1 | diag2));
        
        while (availablePositions) {
            const position = availablePositions & (-availablePositions);
            availablePositions &= availablePositions - 1;
            
            const col = Math.log2(position);
            solutions[row] = col;
            
            backtrack(
                row + 1,
                cols | position,
                (diag1 | position) << 1,
                (diag2 | position) >> 1
            );
        }
    }
    
    backtrack(0, 0, 0, 0);
    return result;
}

function constructBoard(solutions: number[], n: number): string[] {
    const board: string[] = [];
    
    for (let i = 0; i < n; i++) {
        let row = '.'.repeat(n);
        row = row.substring(0, solutions[i]) + 'Q' + row.substring(solutions[i] + 1);
        board.push(row);
    }
    
    return board;
}`,
      },
      {
        language: "Java",
        explanation:
          "Bit Manipulation Optimization: Java implementation using bitwise operations for ultra-fast conflict checking. We use bit manipulation to track columns and diagonals efficiently. Time: O(n!), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        int[] solutions = new int[n];
        backtrack(result, solutions, 0, 0, 0, 0, n);
        return result;
    }
    
    private void backtrack(List<List<String>> result, int[] solutions, int row, 
                          int cols, int diag1, int diag2, int n) {
        if (row == n) {
            result.add(constructBoard(solutions, n));
            return;
        }
        
        int availablePositions = ((1 << n) - 1) & (~(cols | diag1 | diag2));
        
        while (availablePositions != 0) {
            int position = availablePositions & (-availablePositions);
            availablePositions &= (availablePositions - 1);
            
            int col = Integer.numberOfTrailingZeros(position);
            solutions[row] = col;
            
            backtrack(result, solutions, row + 1, 
                     cols | position, 
                     (diag1 | position) << 1, 
                     (diag2 | position) >> 1, n);
        }
    }
    
    private List<String> constructBoard(int[] solutions, int n) {
        List<String> board = new ArrayList<>();
        
        for (int i = 0; i < n; i++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[solutions[i]] = 'Q';
            board.add(new String(row));
        }
        
        return board;
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Track conflicts using sets for columns and diagonals",
      "Diagonals identified by row±col values",
      "Place queens row by row to avoid row conflicts",
      "Bit manipulation can optimize conflict checking",
    ],
    tags: ["backtracking", "array", "bit-manipulation"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-backtrack-5",
    question:
      "Sudoku Solver - Write a program to solve a Sudoku puzzle by filling empty cells.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Sudoku can be solved efficiently using backtracking with various optimizations for constraint checking. The key is to try placing numbers and backtrack when constraints are violated.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Backtracking with Constraint Propagation: This approach checks each cell for valid placements by explicitly checking row, column, and 3x3 box constraints for each candidate number. Time: O(9^(n*n)), Space: O(n*n)",
        code: `function solveSudoku(board: string[][]): void {
    function isValid(board: string[][], row: number, col: number, num: string): boolean {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        
        return true;
    }
    
    function solve(): boolean {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === '.') {
                    for (let num = 1; num <= 9; num++) {
                        const numStr = num.toString();
                        
                        if (isValid(board, i, j, numStr)) {
                            board[i][j] = numStr;
                            
                            if (solve()) return true;
                            
                            board[i][j] = '.'; // Backtrack
                        }
                    }
                    
                    return false; // No valid number found
                }
            }
        }
        
        return true; // All cells filled
    }
    
    solve();
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Backtracking with Constraint Propagation: Java implementation using char arrays for the board. We check row, column, and 3x3 box constraints before placing each number. Time: O(9^(n*n)), Space: O(n*n)",
        code: `public class Solution {
    public void solveSudoku(char[][] board) {
        solve(board);
    }
    
    private boolean solve(char[][] board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    for (char num = '1'; num <= '9'; num++) {
                        if (isValid(board, i, j, num)) {
                            board[i][j] = num;
                            
                            if (solve(board)) return true;
                            
                            board[i][j] = '.'; // Backtrack
                        }
                    }
                    
                    return false; // No valid number found
                }
            }
        }
        
        return true; // All cells filled
    }
    
    private boolean isValid(char[][] board, int row, int col, char num) {
        // Check row
        for (int j = 0; j < 9; j++) {
            if (board[row][j] == num) return false;
        }
        
        // Check column
        for (int i = 0; i < 9; i++) {
            if (board[i][col] == num) return false;
        }
        
        // Check 3x3 box
        int boxRow = (row / 3) * 3;
        int boxCol = (col / 3) * 3;
        
        for (int i = boxRow; i < boxRow + 3; i++) {
            for (int j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] == num) return false;
            }
        }
        
        return true;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Optimized with Bit Sets: This approach uses bit manipulation to efficiently track used digits in each row, column, and box, greatly reducing the time needed to check constraints. Time: O(9^(n*n)), Space: O(n)",
        code: `function solveSudokuOptimized(board: string[][]): void {
    const rows = Array(9).fill(0);
    const cols = Array(9).fill(0);
    const boxes = Array(9).fill(0);
    
    // Initialize constraints
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== '.') {
                const num = parseInt(board[i][j]);
                const bit = 1 << (num - 1);
                const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                
                rows[i] |= bit;
                cols[j] |= bit;
                boxes[boxIndex] |= bit;
            }
        }
    }
    
    function solve(): boolean {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === '.') {
                    const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                    const mask = rows[i] | cols[j] | boxes[boxIndex];
                    
                    for (let num = 1; num <= 9; num++) {
                        const bit = 1 << (num - 1);
                        
                        if (!(mask & bit)) {
                            board[i][j] = num.toString();
                            rows[i] |= bit;
                            cols[j] |= bit;
                            boxes[boxIndex] |= bit;
                            
                            if (solve()) return true;
                            
                            board[i][j] = '.';
                            rows[i] &= ~bit;
                            cols[j] &= ~bit;
                            boxes[boxIndex] &= ~bit;
                        }
                    }
                    
                    return false;
                }
            }
        }
        
        return true;
    }
    
    solve();
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Optimized with Bit Sets: Java implementation using bit manipulation for ultra-fast constraint checking. We use bitmasks to track used digits in each row, column, and box. Time: O(9^(n*n)), Space: O(n)",
        code: `public class Solution {
    public void solveSudoku(char[][] board) {
        int[] rows = new int[9];
        int[] cols = new int[9];
        int[] boxes = new int[9];
        
        // Initialize constraints
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] != '.') {
                    int num = board[i][j] - '0';
                    int bit = 1 << (num - 1);
                    int boxIndex = (i / 3) * 3 + j / 3;
                    
                    rows[i] |= bit;
                    cols[j] |= bit;
                    boxes[boxIndex] |= bit;
                }
            }
        }
        
        solve(board, rows, cols, boxes);
    }
    
    private boolean solve(char[][] board, int[] rows, int[] cols, int[] boxes) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    int boxIndex = (i / 3) * 3 + j / 3;
                    int mask = rows[i] | cols[j] | boxes[boxIndex];
                    
                    for (int num = 1; num <= 9; num++) {
                        int bit = 1 << (num - 1);
                        
                        if ((mask & bit) == 0) {
                            board[i][j] = (char)(num + '0');
                            rows[i] |= bit;
                            cols[j] |= bit;
                            boxes[boxIndex] |= bit;
                            
                            if (solve(board, rows, cols, boxes)) return true;
                            
                            board[i][j] = '.';
                            rows[i] &= ~bit;
                            cols[j] &= ~bit;
                            boxes[boxIndex] &= ~bit;
                        }
                    }
                    
                    return false;
                }
            }
        }
        
        return true;
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Check row, column, and 3×3 box constraints",
      "Try numbers 1-9 for each empty cell",
      "Backtrack when no valid number can be placed",
      "Bit manipulation can optimize constraint checking",
    ],
    tags: ["backtracking", "matrix", "bit-manipulation"],
    estimatedTime: 40,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-backtrack-6",
    question:
      "Word Search - Given 2D board and word, find if word exists in the grid (horizontally or vertically).",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem uses DFS with backtracking to explore all possible paths through the grid to find the target word. A more advanced version uses a Trie data structure to efficiently search for multiple words.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "DFS Backtracking: This approach explores paths from each cell in the grid, marking visited cells to avoid cycles. When the path doesn't match the word, we backtrack and try other directions. Time: O(m * n * 4^L), Space: O(L) where L is word length",
        code: `function exist(board: string[][], word: string): boolean {
    const rows = board.length;
    const cols = board[0].length;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    function dfs(row: number, col: number, index: number): boolean {
        if (index === word.length) return true;
        
        if (row < 0 || row >= rows || col < 0 || col >= cols || 
            board[row][col] !== word[index]) {
            return false;
        }
        
        // Mark cell as visited
        const temp = board[row][col];
        board[row][col] = '#';
        
        // Explore all 4 directions
        for (const [dr, dc] of directions) {
            if (dfs(row + dr, col + dc, index + 1)) {
                board[row][col] = temp; // Restore
                return true;
            }
        }
        
        // Backtrack
        board[row][col] = temp;
        return false;
    }
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (dfs(i, j, 0)) {
                return true;
            }
        }
    }
    
    return false;
}`,
      },
      {
        language: "Java",
        explanation:
          "DFS Backtracking: Java implementation using DFS to explore all paths from each starting cell. We modify the board in-place to mark visited cells and restore them during backtracking. Time: O(m * n * 4^L), Space: O(L) where L is word length",
        code: `public class Solution {
    private int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    
    public boolean exist(char[][] board, String word) {
        int rows = board.length;
        int cols = board[0].length;
        
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (dfs(board, word, i, j, 0)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    private boolean dfs(char[][] board, String word, int row, int col, int index) {
        if (index == word.length()) return true;
        
        if (row < 0 || row >= board.length || col < 0 || col >= board[0].length ||
            board[row][col] != word.charAt(index)) {
            return false;
        }
        
        // Mark cell as visited
        char temp = board[row][col];
        board[row][col] = '#';
        
        // Explore all 4 directions
        for (int[] dir : directions) {
            if (dfs(board, word, row + dir[0], col + dir[1], index + 1)) {
                board[row][col] = temp; // Restore
                return true;
            }
        }
        
        // Backtrack
        board[row][col] = temp;
        return false;
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "Word Search II (Multiple Words): This enhanced version uses a Trie data structure to efficiently search for multiple words simultaneously. As we explore the board, we track our position in the Trie to quickly identify if we're on a path to any valid word. Time: O(m*n*4^L), Space: O(k) where k is total length of all words",
        code: `function findWords(board: string[][], words: string[]): string[] {
    class TrieNode {
        children = new Map<string, TrieNode>();
        word: string | null = null;
    }
    
    // Build trie
    const root = new TrieNode();
    for (const word of words) {
        let node = root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.word = word;
    }
    
    const result: string[] = [];
    const rows = board.length;
    const cols = board[0].length;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    function dfs(row: number, col: number, node: TrieNode): void {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return;
        
        const char = board[row][col];
        if (char === '#' || !node.children.has(char)) return;
        
        node = node.children.get(char)!;
        
        if (node.word) {
            result.push(node.word);
            node.word = null; // Avoid duplicates
        }
        
        board[row][col] = '#'; // Mark visited
        
        for (const [dr, dc] of directions) {
            dfs(row + dr, col + dc, node);
        }
        
        board[row][col] = char; // Backtrack
    }
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            dfs(i, j, root);
        }
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        explanation:
          "Word Search II (Multiple Words): Java implementation using Trie for efficient multiple word search. We build a Trie from all words and traverse it while exploring the board, finding all words in a single pass. Time: O(m*n*4^L), Space: O(k) where k is total length of all words",
        code: `import java.util.*;

public class Solution {
    class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        String word = null;
    }
    
    private int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    
    public List<String> findWords(char[][] board, String[] words) {
        // Build trie
        TrieNode root = new TrieNode();
        for (String word : words) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node.children.putIfAbsent(c, new TrieNode());
                node = node.children.get(c);
            }
            node.word = word;
        }
        
        List<String> result = new ArrayList<>();
        int rows = board.length;
        int cols = board[0].length;
        
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                dfs(board, i, j, root, result);
            }
        }
        
        return result;
    }
    
    private void dfs(char[][] board, int row, int col, TrieNode node, List<String> result) {
        if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) return;
        
        char c = board[row][col];
        if (c == '#' || !node.children.containsKey(c)) return;
        
        node = node.children.get(c);
        
        if (node.word != null) {
            result.add(node.word);
            node.word = null; // Avoid duplicates
        }
        
        board[row][col] = '#'; // Mark visited
        
        for (int[] dir : directions) {
            dfs(board, row + dir[0], col + dir[1], node, result);
        }
        
        board[row][col] = c; // Backtrack
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "DFS explores all possible paths from each starting cell",
      "Mark visited cells to avoid cycles",
      "Backtrack by restoring original cell value",
      "Trie optimization for multiple word search",
    ],
    tags: ["backtracking", "matrix", "dfs", "trie"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
