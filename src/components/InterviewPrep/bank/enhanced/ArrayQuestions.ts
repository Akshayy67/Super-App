import { Question } from "../../InterviewSubjects";

// Enhanced Array DSA Questions with comprehensive implementations
export const enhancedArrayQuestions: Question[] = [
  {
    id: "enhanced-array-1",
    question:
      "Two Sum - Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "There are two main approaches: 1) Brute Force (O(n²)): Check every pair - simple but inefficient. 2) Hash Map (O(n)): Use a hash map to store complements. For each element, check if its complement (target - current) exists in the map. The hash map approach is optimal, trading space for time efficiency.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Hash Map (Optimal)
// Time: O(n), Space: O(n)
function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
        explanation:
          "Hash map stores each number with its index. For each element, we check if its complement exists in the map.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: Hash Map (Optimal)
# Time: O(n), Space: O(n)
def two_sum(nums, target):
    """
    Find two numbers in array that add up to target.

    Args:
        nums: List of integers
        target: Target sum

    Returns:
        List of two indices that sum to target
    """
    num_map = {}

    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i

    return []

# Test cases
def test_two_sum():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]
    assert two_sum([3, 2, 4], 6) == [1, 2]
    assert two_sum([3, 3], 6) == [0, 1]`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation:
          "Python implementation using dictionary for O(1) lookup. Enumerate provides both index and value.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Hash Map (Optimal)
// Time: O(n), Space: O(n)
import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }

        return new int[]{};
    }

    // Test method
    public static void main(String[] args) {
        Solution solution = new Solution();

        // Test case 1
        int[] nums1 = {2, 7, 11, 15};
        int[] result1 = solution.twoSum(nums1, 9);
        System.out.println(Arrays.toString(result1)); // [0, 1]

        // Test case 2
        int[] nums2 = {3, 2, 4};
        int[] result2 = solution.twoSum(nums2, 6);
        System.out.println(Arrays.toString(result2)); // [1, 2]
    }
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation:
          "Java implementation using HashMap for efficient lookups. Returns array of indices.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 2: Brute Force
// Time: O(n²), Space: O(1)
function twoSumBruteForce(nums: number[], target: number): number[] {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`,
        explanation:
          "Brute force checks every possible pair. Simple but inefficient for large arrays.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Hash Map (Optimal)
// Time: O(n), Space: O(n)
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    
    return new int[0];
}`,
        explanation:
          "Hash map stores each number with its index. For each element, we check if its complement exists in the map.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 2: Brute Force
// Time: O(n²), Space: O(1)
public int[] twoSumBruteForce(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[] { i, j };
            }
        }
    }
    return new int[0];
}`,
        explanation:
          "Brute force checks every possible pair. Simple but inefficient for large arrays.",
      },
      {
        language: "Python",
        code: `# Approach 1: Hash Map (Optimal)
# Time: O(n), Space: O(n)
def two_sum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    
    return []`,
        explanation:
          "Hash map stores each number with its index. For each element, we check if its complement exists in the map.",
      },
      {
        language: "Python",
        code: `# Approach 2: Brute Force
# Time: O(n²), Space: O(1)
def two_sum_brute_force(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
        explanation:
          "Brute force checks every possible pair. Simple but inefficient for large arrays.",
      },
    ],
    tips: [
      "Hash map approach trades space for time efficiency",
      "Consider edge cases: empty array, no solution, duplicate numbers",
      "Explain why we can't use the same element twice",
      "Discuss follow-up: what if array is sorted?",
    ],
    tags: ["array", "hash-table", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-2",
    question:
      "Best Time to Buy and Sell Stock - You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "Track the minimum price seen so far and calculate profit at each step. Two approaches: 1) Single Pass: Keep track of minimum price and maximum profit as we iterate. 2) Dynamic Programming: Maintain states for buying and selling. The single pass approach is optimal with O(n) time and O(1) space.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Single Pass Solution (Optimal)
// Time: O(n), Space: O(1)
function maxProfit(prices: number[]): number {
    let minPrice = Infinity;
    let maxProfit = 0;
    
    for (let i = 0; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else if (prices[i] - minPrice > maxProfit) {
            maxProfit = prices[i] - minPrice;
        }
    }
    
    return maxProfit;
}`,
        explanation:
          "Track minimum price and calculate profit at each step. Greedy approach ensures we buy at the lowest price before selling.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Alternative: Dynamic Programming approach
// Time: O(n), Space: O(1)
function maxProfitDP(prices: number[]): number {
    if (prices.length <= 1) return 0;
    
    let buy = -prices[0]; // Max profit after buying
    let sell = 0;         // Max profit after selling
    
    for (let i = 1; i < prices.length; i++) {
        buy = Math.max(buy, -prices[i]);
        sell = Math.max(sell, buy + prices[i]);
    }
    
    return sell;
}`,
        explanation:
          "DP approach maintains states for buying and selling. Buy represents max profit after buying, sell represents max profit after selling.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Single Pass Solution (Optimal)
# Time: O(n), Space: O(1)
def max_profit(prices):
    """
    Find maximum profit from buying and selling stock once.

    Args:
        prices: List of stock prices by day

    Returns:
        Maximum profit possible
    """
    if not prices or len(prices) < 2:
        return 0

    min_price = float('inf')
    max_profit = 0

    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price

    return max_profit

# Test cases
def test_max_profit():
    assert max_profit([7, 1, 5, 3, 6, 4]) == 5  # Buy at 1, sell at 6
    assert max_profit([7, 6, 4, 3, 1]) == 0     # No profit possible
    assert max_profit([1, 2, 3, 4, 5]) == 4     # Buy at 1, sell at 5`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation:
          "Python implementation using float('inf') for initial min_price. Clean and readable solution.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Dynamic Programming approach
# Time: O(n), Space: O(1)
def max_profit_dp(prices):
    """
    DP approach maintaining buy/sell states.

    Args:
        prices: List of stock prices

    Returns:
        Maximum profit
    """
    if len(prices) <= 1:
        return 0

    # buy: max profit after buying (negative because we spent money)
    # sell: max profit after selling
    buy = -prices[0]
    sell = 0

    for i in range(1, len(prices)):
        buy = max(buy, -prices[i])
        sell = max(sell, buy + prices[i])

    return sell

# Alternative one-liner using reduce
from functools import reduce

def max_profit_functional(prices):
    """Functional approach using reduce."""
    if len(prices) <= 1:
        return 0

    def update_states(state, price):
        buy, sell = state
        return (max(buy, -price), max(sell, buy + price))

    _, final_sell = reduce(update_states, prices[1:], (-prices[0], 0))
    return final_sell`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation:
          "DP approach with Python-specific features. Includes functional programming alternative using reduce.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Single Pass Solution (Optimal)
// Time: O(n), Space: O(1)
public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE;
    int maxProfit = 0;
    
    for (int i = 0; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else if (prices[i] - minPrice > maxProfit) {
            maxProfit = prices[i] - minPrice;
        }
    }
    
    return maxProfit;
}`,
        explanation:
          "Track minimum price and calculate profit at each step. Greedy approach ensures we buy at the lowest price before selling.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Alternative: Dynamic Programming approach
// Time: O(n), Space: O(1)
public int maxProfitDP(int[] prices) {
    if (prices.length <= 1) return 0;
    
    int buy = -prices[0]; // Max profit after buying
    int sell = 0;         // Max profit after selling
    
    for (int i = 1; i < prices.length; i++) {
        buy = Math.max(buy, -prices[i]);
        sell = Math.max(sell, buy + prices[i]);
    }
    
    return sell;
}`,
        explanation:
          "DP approach maintains states for buying and selling. Buy represents max profit after buying, sell represents max profit after selling.",
      },
      {
        language: "Python",
        code: `# Single Pass Solution (Optimal)
# Time: O(n), Space: O(1)
def max_profit(prices):
    if not prices:
        return 0
    
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    
    return max_profit`,
        explanation:
          "Track minimum price and calculate profit at each step. Greedy approach ensures we buy at the lowest price before selling.",
      },
      {
        language: "Python",
        code: `# Alternative: Dynamic Programming approach
# Time: O(n), Space: O(1)
def max_profit_dp(prices):
    if len(prices) <= 1:
        return 0
    
    buy = -prices[0]  # Max profit after buying
    sell = 0          # Max profit after selling
    
    for i in range(1, len(prices)):
        buy = max(buy, -prices[i])
        sell = max(sell, buy + prices[i])
    
    return sell`,
        explanation:
          "DP approach maintains states for buying and selling. Buy represents max profit after buying, sell represents max profit after selling.",
      },
    ],
    tips: [
      "Track minimum price seen so far and maximum profit",
      "Only one transaction allowed (buy once, sell once)",
      "Consider edge cases: empty array, single element, decreasing prices",
      "Explain the greedy approach: buy at lowest price before selling",
    ],
    tags: ["array", "dynamic-programming", "greedy"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-3",
    question:
      "Contains Duplicate - Given an integer array nums, return true if any value appears at least twice in the array.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Hash Set (O(n) time, O(n) space): Check each element against a set of seen values. 2) Sorting (O(n log n) time, O(1) space): Sort array and check adjacent elements. 3) Set Size Comparison: Create a set and compare its size to the original array length. Hash set approach is optimal for time complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Hash Set (Optimal)
// Time: O(n), Space: O(n)
function containsDuplicate(nums: number[]): boolean {
    const seen = new Set<number>();
    
    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }
    
    return false;
}`,
        explanation:
          "Use a Set to track seen numbers. Return true immediately when we find a duplicate.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Sorting
// Time: O(n log n), Space: O(1)
function containsDuplicateSort(nums: number[]): boolean {
    nums.sort((a, b) => a - b);
    
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            return true;
        }
    }
    
    return false;
}`,
        explanation:
          "Sort the array first, then check adjacent elements for duplicates. Uses less space but slower due to sorting.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Length comparison (Most concise)
// Time: O(n), Space: O(n)
function containsDuplicateConcise(nums: number[]): boolean {
    return new Set(nums).size !== nums.length;
}`,
        explanation:
          "Create a Set from the array. If the set size is different from array length, there are duplicates.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Hash Set (Optimal)
// Time: O(n), Space: O(n)
public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    
    for (int num : nums) {
        if (seen.contains(num)) {
            return true;
        }
        seen.add(num);
    }
    
    return false;
}`,
        explanation:
          "Use a HashSet to track seen numbers. Return true immediately when we find a duplicate.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 2: Sorting
// Time: O(n log n), Space: O(1)
public boolean containsDuplicateSort(int[] nums) {
    Arrays.sort(nums);
    
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) {
            return true;
        }
    }
    
    return false;
}`,
        explanation:
          "Sort the array first, then check adjacent elements for duplicates. Uses less space but slower due to sorting.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Length comparison (Most concise)
// Time: O(n), Space: O(n)
public boolean containsDuplicateConcise(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) {
        set.add(num);
    }
    return set.size() != nums.length;
}`,
        explanation:
          "Create a HashSet from the array. If the set size is different from array length, there are duplicates.",
      },
      {
        language: "Python",
        code: `# Approach 1: Hash Set (Optimal)
# Time: O(n), Space: O(n)
def contains_duplicate(nums):
    seen = set()
    
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    
    return False`,
        explanation:
          "Use a set to track seen numbers. Return True immediately when we find a duplicate.",
      },
      {
        language: "Python",
        code: `# Approach 2: Sorting
# Time: O(n log n), Space: O(1)
def contains_duplicate_sort(nums):
    nums.sort()
    
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return True
    
    return False`,
        explanation:
          "Sort the array first, then check adjacent elements for duplicates. Uses less space but slower due to sorting.",
      },
      {
        language: "Python",
        code: `# Approach 3: Length comparison (Most concise)
# Time: O(n), Space: O(n)
def contains_duplicate_concise(nums):
    return len(set(nums)) != len(nums)`,
        explanation:
          "Create a set from the array. If the set size is different from array length, there are duplicates.",
      },
    ],
    tips: [
      "Hash set provides optimal time complexity",
      "Sorting approach uses less space but slower",
      "Set size comparison is most concise but creates entire set",
      "Consider memory constraints for very large arrays",
    ],
    tags: ["array", "hash-table", "sorting"],
    estimatedTime: 10,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-4",
    question:
      "Product of Array Except Self - Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i].",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Passes (O(n) time, O(1) space): Calculate left products first, then multiply by right products. 2) Left and Right Arrays (O(n) time, O(n) space): Create separate arrays for left and right products, then combine. 3) Division Method (O(n) time, O(1) space): Calculate total product and divide by each element (not allowed in this problem). The two-pass approach is optimal for space complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
        code: `// Approach 1: Two Passes (Optimal)
// Time: O(n), Space: O(1) extra space
function productExceptSelf(nums: number[]): number[] {
    const result = new Array(nums.length);
    
    // First pass: calculate left products
    result[0] = 1;
    for (let i = 1; i < nums.length; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Second pass: multiply by right products
    let rightProduct = 1;
    for (let i = nums.length - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= nums[i];
    }
    
    return result;
}`,
        explanation:
          "Two-pass approach: first calculate left products, then multiply by right products. Most space efficient.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
        code: `// Approach 2: Left and Right Arrays
// Time: O(n), Space: O(n)
function productExceptSelfVerbose(nums: number[]): number[] {
    const n = nums.length;
    const left = new Array(n);
    const right = new Array(n);
    const result = new Array(n);
    
    // Calculate left products
    left[0] = 1;
    for (let i = 1; i < n; i++) {
        left[i] = left[i - 1] * nums[i - 1];
    }
    
    // Calculate right products
    right[n - 1] = 1;
    for (let i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] * nums[i + 1];
    }
    
    // Combine results
    for (let i = 0; i < n; i++) {
        result[i] = left[i] * right[i];
    }
    
    return result;
}`,
        explanation:
          "Creates separate arrays for left and right products. Easier to understand but uses more space.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Division Method (Not allowed in this problem)
// Time: O(n), Space: O(1)
function productExceptSelfDivision(nums: number[]): number[] {
    const totalProduct = nums.reduce((acc, num) => acc * num, 1);
    return nums.map(num => totalProduct / num);
}`,
        explanation:
          "Division method is simple but not allowed in this problem. Shows why we need alternative approaches.",
      },
      {
        language: "Java",
        code: `// Approach 1: Two Passes (Optimal)
// Time: O(n), Space: O(1) extra space
public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    
    // First pass: calculate left products
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Second pass: multiply by right products
    int rightProduct = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= nums[i];
    }
    
    return result;
}`,
        explanation:
          "Two-pass approach: first calculate left products, then multiply by right products. Most space efficient.",
      },
      {
        language: "Java",
        code: `// Approach 2: Left and Right Arrays
// Time: O(n), Space: O(n)
public int[] productExceptSelfVerbose(int[] nums) {
    int n = nums.length;
    int[] left = new int[n];
    int[] right = new int[n];
    int[] result = new int[n];
    
    // Calculate left products
    left[0] = 1;
    for (int i = 1; i < n; i++) {
        left[i] = left[i - 1] * nums[i - 1];
    }
    
    // Calculate right products
    right[n - 1] = 1;
    for (int i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] * nums[i + 1];
    }
    
    // Combine results
    for (int i = 0; i < n; i++) {
        result[i] = left[i] * right[i];
    }
    
    return result;
}`,
        explanation:
          "Creates separate arrays for left and right products. Easier to understand but uses more space.",
      },
      {
        language: "Java",
        code: `// Approach 3: Division Method (Not allowed in this problem)
// Time: O(n), Space: O(1)
public int[] productExceptSelfDivision(int[] nums) {
    int totalProduct = 1;
    for (int num : nums) {
        totalProduct *= num;
    }
    
    int[] result = new int[nums.length];
    for (int i = 0; i < nums.length; i++) {
        result[i] = totalProduct / nums[i];
    }
    
    return result;
}`,
        explanation:
          "Division method is simple but not allowed in this problem. Shows why we need alternative approaches.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: Two Passes (Optimal)
# Time: O(n), Space: O(1) extra space
def product_except_self(nums):
    n = len(nums)
    result = [1] * n
    
    # First pass: calculate left products
    for i in range(1, n):
        result[i] = result[i - 1] * nums[i - 1]
    
    # Second pass: multiply by right products
    right_product = 1
    for i in range(n - 1, -1, -1):
        result[i] *= right_product
        right_product *= nums[i]
    
    return result`,
        explanation:
          "Two-pass approach: first calculate left products, then multiply by right products. Most space efficient.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 2: Left and Right Arrays
# Time: O(n), Space: O(n)
def product_except_self_verbose(nums):
    n = len(nums)
    left = [1] * n
    right = [1] * n
    result = [1] * n
    
    # Calculate left products
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    
    # Calculate right products
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    
    # Combine results
    for i in range(n):
        result[i] = left[i] * right[i]
    
    return result`,
        explanation:
          "Creates separate arrays for left and right products. Easier to understand but uses more space.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 3: Division Method (Not allowed in this problem)
# Time: O(n), Space: O(1)
def product_except_self_division(nums):
    total_product = 1
    for num in nums:
        total_product *= num
    
    result = []
    for num in nums:
        result.append(total_product // num)
    
    return result`,
        explanation:
          "Division method is simple but not allowed in this problem. Shows why we need alternative approaches.",
      },
    ],
    tips: [
      "Cannot use division operator (constraint)",
      "Two-pass approach: left products, then right products",
      "Optimize space by using result array for left products",
      "Consider edge cases: zeros in array, single element",
    ],
    tags: ["array", "prefix-sum"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-5",
    question:
      "Maximum Subarray (Kadane's Algorithm) - Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Kadane's Algorithm (O(n) time, O(1) space): Track maximum sum ending at each position and global maximum. 2) Return Indices: Extend Kadane's to return start and end indices of the subarray. 3) Divide and Conquer (O(n log n) time, O(log n) space): Split array and find maximum of left, right, and crossing subarrays. Kadane's algorithm is optimal for time complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Kadane's Algorithm (Optimal)
// Time: O(n), Space: O(1)
function maxSubArray(nums: number[]): number {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}`,
        explanation:
          "Kadane's algorithm tracks maximum sum ending at each position and global maximum. Optimal O(n) solution.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Return Indices of Subarray
// Time: O(n), Space: O(1)
function maxSubArrayWithIndices(nums: number[]): {sum: number, start: number, end: number} {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    let start = 0, end = 0, tempStart = 0;
    
    for (let i = 1; i < nums.length; i++) {
        if (maxEndingHere < 0) {
            maxEndingHere = nums[i];
            tempStart = i;
        } else {
            maxEndingHere += nums[i];
        }
        
        if (maxEndingHere > maxSoFar) {
            maxSoFar = maxEndingHere;
            start = tempStart;
            end = i;
        }
    }
    
    return { sum: maxSoFar, start, end };
}`,
        explanation:
          "Extended Kadane's algorithm that returns the start and end indices of the maximum subarray.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Divide and Conquer
// Time: O(n log n), Space: O(log n)
function maxSubArrayDC(nums: number[]): number {
    function maxCrossingSum(nums: number[], left: number, mid: number, right: number): number {
        let leftSum = -Infinity;
        let sum = 0;
        
        for (let i = mid; i >= left; i--) {
            sum += nums[i];
            leftSum = Math.max(leftSum, sum);
        }
        
        let rightSum = -Infinity;
        sum = 0;
        
        for (let i = mid + 1; i <= right; i++) {
            sum += nums[i];
            rightSum = Math.max(rightSum, sum);
        }
        
        return leftSum + rightSum;
    }
    
    function maxSubArrayRec(nums: number[], left: number, right: number): number {
        if (left === right) return nums[left];
        
        const mid = Math.floor((left + right) / 2);
        const leftMax = maxSubArrayRec(nums, left, mid);
        const rightMax = maxSubArrayRec(nums, mid + 1, right);
        const crossMax = maxCrossingSum(nums, left, mid, right);
        
        return Math.max(leftMax, rightMax, crossMax);
    }
    
    return maxSubArrayRec(nums, 0, nums.length - 1);
}`,
        explanation:
          "Divide and conquer approach splits array and finds maximum of left, right, and crossing subarrays.",
      },
      {
        language: "Java",
        code: `// Approach 1: Kadane's Algorithm (Optimal)
// Time: O(n), Space: O(1)
public int maxSubArray(int[] nums) {
    int maxSoFar = nums[0];
    int maxEndingHere = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}`,
        explanation:
          "Kadane's algorithm tracks maximum sum ending at each position and global maximum. Optimal O(n) solution.",
      },
      {
        language: "Java",
        code: `// Approach 2: Return Indices of Subarray
// Time: O(n), Space: O(1)
public class SubarrayResult {
    int sum;
    int start;
    int end;
    
    public SubarrayResult(int sum, int start, int end) {
        this.sum = sum;
        this.start = start;
        this.end = end;
    }
}

public SubarrayResult maxSubArrayWithIndices(int[] nums) {
    int maxSoFar = nums[0];
    int maxEndingHere = nums[0];
    int start = 0, end = 0, tempStart = 0;
    
    for (int i = 1; i < nums.length; i++) {
        if (maxEndingHere < 0) {
            maxEndingHere = nums[i];
            tempStart = i;
        } else {
            maxEndingHere += nums[i];
        }
        
        if (maxEndingHere > maxSoFar) {
            maxSoFar = maxEndingHere;
            start = tempStart;
            end = i;
        }
    }
    
    return new SubarrayResult(maxSoFar, start, end);
}`,
        explanation:
          "Extended Kadane's algorithm that returns the start and end indices of the maximum subarray.",
      },
      {
        language: "Java",
        code: `// Approach 3: Divide and Conquer
// Time: O(n log n), Space: O(log n)
public int maxSubArrayDC(int[] nums) {
    return maxSubArrayRec(nums, 0, nums.length - 1);
}

private int maxCrossingSum(int[] nums, int left, int mid, int right) {
    int leftSum = Integer.MIN_VALUE;
    int sum = 0;
    
    for (int i = mid; i >= left; i--) {
        sum += nums[i];
        leftSum = Math.max(leftSum, sum);
    }
    
    int rightSum = Integer.MIN_VALUE;
    sum = 0;
    
    for (int i = mid + 1; i <= right; i++) {
        sum += nums[i];
        rightSum = Math.max(rightSum, sum);
    }
    
    return leftSum + rightSum;
}

private int maxSubArrayRec(int[] nums, int left, int right) {
    if (left == right) return nums[left];
    
    int mid = (left + right) / 2;
    int leftMax = maxSubArrayRec(nums, left, mid);
    int rightMax = maxSubArrayRec(nums, mid + 1, right);
    int crossMax = maxCrossingSum(nums, left, mid, right);
    
    return Math.max(Math.max(leftMax, rightMax), crossMax);
}`,
        explanation:
          "Divide and conquer approach splits array and finds maximum of left, right, and crossing subarrays.",
      },
      {
        language: "Python",
        code: `# Approach 1: Kadane's Algorithm (Optimal)
# Time: O(n), Space: O(1)
def max_sub_array(nums):
    if not nums:
        return 0
    
    max_so_far = max_ending_here = nums[0]
    
    for i in range(1, len(nums)):
        max_ending_here = max(nums[i], max_ending_here + nums[i])
        max_so_far = max(max_so_far, max_ending_here)
    
    return max_so_far`,
        explanation:
          "Kadane's algorithm tracks maximum sum ending at each position and global maximum. Optimal O(n) solution.",
      },
      {
        language: "Python",
        code: `# Approach 2: Return Indices of Subarray
# Time: O(n), Space: O(1)
def max_sub_array_with_indices(nums):
    if not nums:
        return {'sum': 0, 'start': 0, 'end': 0}
    
    max_so_far = max_ending_here = nums[0]
    start = end = temp_start = 0
    
    for i in range(1, len(nums)):
        if max_ending_here < 0:
            max_ending_here = nums[i]
            temp_start = i
        else:
            max_ending_here += nums[i]
        
        if max_ending_here > max_so_far:
            max_so_far = max_ending_here
            start = temp_start
            end = i
    
    return {'sum': max_so_far, 'start': start, 'end': end}`,
        explanation:
          "Extended Kadane's algorithm that returns the start and end indices of the maximum subarray.",
      },
      {
        language: "Python",
        code: `# Approach 3: Divide and Conquer
# Time: O(n log n), Space: O(log n)
def max_sub_array_dc(nums):
    def max_crossing_sum(arr, left, mid, right):
        left_sum = float('-inf')
        current_sum = 0
        
        for i in range(mid, left - 1, -1):
            current_sum += arr[i]
            left_sum = max(left_sum, current_sum)
        
        right_sum = float('-inf')
        current_sum = 0
        
        for i in range(mid + 1, right + 1):
            current_sum += arr[i]
            right_sum = max(right_sum, current_sum)
        
        return left_sum + right_sum
    
    def max_sub_array_rec(arr, left, right):
        if left == right:
            return arr[left]
        
        mid = (left + right) // 2
        left_max = max_sub_array_rec(arr, left, mid)
        right_max = max_sub_array_rec(arr, mid + 1, right)
        cross_max = max_crossing_sum(arr, left, mid, right)
        
        return max(left_max, right_max, cross_max)
    
    return max_sub_array_rec(nums, 0, len(nums) - 1)`,
        explanation:
          "Divide and conquer approach splits array and finds maximum of left, right, and crossing subarrays.",
      },
    ],
    tips: [
      "Kadane's algorithm is the optimal O(n) solution",
      "Key insight: at each position, decide whether to extend or start new subarray",
      "Handle all negative numbers case",
      "Can be extended to return actual subarray indices",
    ],
    tags: ["array", "dynamic-programming", "divide-and-conquer"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-6",
    question:
      "Merge Intervals - Given an array of intervals, merge all overlapping intervals.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Sort and Merge (O(n log n) time, O(n) space): Sort intervals by start time, then merge overlapping ones. 2) Using Reduce (O(n log n) time, O(n) space): Functional approach using reduce method. 3) In-place Merging (O(n log n) time, O(1) space): Modify intervals array in place. The sort and merge approach is most intuitive and commonly used.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Sort then Merge (Optimal)
// Time: O(n log n), Space: O(n)
function merge(intervals: number[][]): number[][] {
    if (intervals.length <= 1) return intervals;
    
    // Sort by start time
    intervals.sort((a, b) => a[0] - b[0]);
    
    const merged: number[][] = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const lastMerged = merged[merged.length - 1];
        
        if (current[0] <= lastMerged[1]) {
            // Overlapping intervals, merge them
            lastMerged[1] = Math.max(lastMerged[1], current[1]);
        } else {
            // Non-overlapping interval, add to result
            merged.push(current);
        }
    }
    
    return merged;
}`,
        explanation:
          "Sort intervals by start time first, then merge overlapping ones. Most intuitive approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Using Reduce (Functional)
// Time: O(n log n), Space: O(n)
function mergeReduce(intervals: number[][]): number[][] {
    if (intervals.length <= 1) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    
    return intervals.reduce((merged: number[][], current: number[]) => {
        if (merged.length === 0 || merged[merged.length - 1][1] < current[0]) {
            merged.push(current);
        } else {
            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], current[1]);
        }
        return merged;
    }, []);
}`,
        explanation:
          "Functional approach using reduce method. Same logic but more functional programming style.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: In-place Merging
// Time: O(n log n), Space: O(1)
function mergeInPlace(intervals: number[][]): number[][] {
    if (intervals.length <= 1) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    
    let writeIndex = 0;
    
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] <= intervals[writeIndex][1]) {
            // Overlapping, merge
            intervals[writeIndex][1] = Math.max(intervals[writeIndex][1], intervals[i][1]);
        } else {
            // Non-overlapping, move to next position
            writeIndex++;
            intervals[writeIndex] = intervals[i];
        }
    }
    
    return intervals.slice(0, writeIndex + 1);
}`,
        explanation:
          "In-place merging modifies the original array. More space efficient but modifies input.",
      },
      {
        language: "Java",
        code: `// Approach 1: Sort then Merge (Optimal)
// Time: O(n log n), Space: O(n)
public int[][] merge(int[][] intervals) {
    if (intervals.length <= 1) return intervals;
    
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    
    List<int[]> merged = new ArrayList<>();
    merged.add(intervals[0]);
    
    for (int i = 1; i < intervals.length; i++) {
        int[] current = intervals[i];
        int[] lastMerged = merged.get(merged.size() - 1);
        
        if (current[0] <= lastMerged[1]) {
            // Overlapping intervals, merge them
            lastMerged[1] = Math.max(lastMerged[1], current[1]);
        } else {
            // Non-overlapping interval, add to result
            merged.add(current);
        }
    }
    
    return merged.toArray(new int[merged.size()][]);
}`,
        explanation:
          "Sort intervals by start time first, then merge overlapping ones. Most intuitive approach.",
      },
      {
        language: "Java",
        code: `// Approach 3: In-place Merging
// Time: O(n log n), Space: O(1)
public int[][] mergeInPlace(int[][] intervals) {
    if (intervals.length <= 1) return intervals;
    
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    
    int writeIndex = 0;
    
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] <= intervals[writeIndex][1]) {
            // Overlapping, merge
            intervals[writeIndex][1] = Math.max(intervals[writeIndex][1], intervals[i][1]);
        } else {
            // Non-overlapping, move to next position
            writeIndex++;
            intervals[writeIndex] = intervals[i];
        }
    }
    
    return Arrays.copyOfRange(intervals, 0, writeIndex + 1);
}`,
        explanation:
          "In-place merging modifies the original array. More space efficient but modifies input.",
      },
      {
        language: "Python",
        code: `# Approach 1: Sort then Merge (Optimal)
# Time: O(n log n), Space: O(n)
def merge(intervals):
    if len(intervals) <= 1:
        return intervals
    
    # Sort by start time
    intervals.sort(key=lambda x: x[0])
    
    merged = [intervals[0]]
    
    for i in range(1, len(intervals)):
        current = intervals[i]
        last_merged = merged[-1]
        
        if current[0] <= last_merged[1]:
            # Overlapping intervals, merge them
            last_merged[1] = max(last_merged[1], current[1])
        else:
            # Non-overlapping interval, add to result
            merged.append(current)
    
    return merged`,
        explanation:
          "Sort intervals by start time first, then merge overlapping ones. Most intuitive approach.",
      },
      {
        language: "Python",
        code: `# Approach 2: Using List Comprehension (Functional)
# Time: O(n log n), Space: O(n)
def merge_functional(intervals):
    if len(intervals) <= 1:
        return intervals
    
    intervals.sort(key=lambda x: x[0])
    
    result = []
    for current in intervals:
        if not result or result[-1][1] < current[0]:
            result.append(current)
        else:
            result[-1][1] = max(result[-1][1], current[1])
    
    return result`,
        explanation:
          "Functional approach using list operations. Same logic but more Pythonic style.",
      },
      {
        language: "Python",
        code: `# Approach 3: In-place Merging
# Time: O(n log n), Space: O(1)
def merge_in_place(intervals):
    if len(intervals) <= 1:
        return intervals
    
    intervals.sort(key=lambda x: x[0])
    
    write_index = 0
    
    for i in range(1, len(intervals)):
        if intervals[i][0] <= intervals[write_index][1]:
            # Overlapping, merge
            intervals[write_index][1] = max(intervals[write_index][1], intervals[i][1])
        else:
            # Non-overlapping, move to next position
            write_index += 1
            intervals[write_index] = intervals[i]
    
    return intervals[:write_index + 1]`,
        explanation:
          "In-place merging modifies the original array. More space efficient but modifies input.",
      },
    ],
    tips: [
      "Sort intervals by start time first",
      "Compare current interval start with previous interval end",
      "Merge by updating the end time to maximum of both intervals",
      "Handle edge cases: empty array, single interval, no overlaps",
    ],
    tags: ["array", "sorting", "intervals"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-7",
    question:
      "Rotate Array - Given an array, rotate the array to the right by k steps, where k is non-negative.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Reverse Method (O(n) time, O(1) space): Reverse entire array, then reverse first k and remaining elements. 2) Extra Array (O(n) time, O(n) space): Use temporary array to store rotated elements. 3) Cyclic Replacements (O(n) time, O(1) space): Move elements in cycles. The reverse method is most elegant and commonly used in interviews.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Reverse Method (Optimal)
// Time: O(n), Space: O(1)
function rotate(nums: number[], k: number): void {
    k = k % nums.length; // Handle k > nums.length
    
    // Helper function to reverse array in place
    function reverse(start: number, end: number): void {
        while (start < end) {
            [nums[start], nums[end]] = [nums[end], nums[start]];
            start++;
            end--;
        }
    }
    
    // Reverse entire array
    reverse(0, nums.length - 1);
    // Reverse first k elements
    reverse(0, k - 1);
    // Reverse remaining elements
    reverse(k, nums.length - 1);
}`,
        explanation:
          "Reverse method: reverse all, then reverse first k and remaining elements. Most elegant approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Extra Array
// Time: O(n), Space: O(n)
function rotateExtraArray(nums: number[], k: number): void {
    const n = nums.length;
    k = k % n;
    const result = new Array(n);
    
    for (let i = 0; i < n; i++) {
        result[(i + k) % n] = nums[i];
    }
    
    for (let i = 0; i < n; i++) {
        nums[i] = result[i];
    }
}`,
        explanation:
          "Uses temporary array to store rotated elements. Simple to understand but uses extra space.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Cyclic Replacements
// Time: O(n), Space: O(1)
function rotateCyclic(nums: number[], k: number): void {
    const n = nums.length;
    k = k % n;
    let count = 0;
    
    for (let start = 0; count < n; start++) {
        let current = start;
        let prev = nums[start];
        
        do {
            const next = (current + k) % n;
            [nums[next], prev] = [prev, nums[next]];
            current = next;
            count++;
        } while (start !== current);
    }
}`,
        explanation:
          "Moves elements in cycles. Handles cases where gcd(n, k) > 1. In-place but more complex.",
      },
      {
        language: "Java",
        code: `// Approach 1: Reverse Method (Optimal)
// Time: O(n), Space: O(1)
public void rotate(int[] nums, int k) {
    k = k % nums.length; // Handle k > nums.length
    
    // Reverse entire array
    reverse(nums, 0, nums.length - 1);
    // Reverse first k elements
    reverse(nums, 0, k - 1);
    // Reverse remaining elements
    reverse(nums, k, nums.length - 1);
}

private void reverse(int[] nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}`,
        explanation:
          "Reverse method: reverse all, then reverse first k and remaining elements. Most elegant approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Extra Array
// Time: O(n), Space: O(n)
public void rotateExtraArray(int[] nums, int k) {
    int n = nums.length;
    k = k % n;
    int[] result = new int[n];
    
    for (int i = 0; i < n; i++) {
        result[(i + k) % n] = nums[i];
    }
    
    for (int i = 0; i < n; i++) {
        nums[i] = result[i];
    }
}`,
        explanation:
          "Uses temporary array to store rotated elements. Simple to understand but uses extra space.",
      },
      {
        language: "Java",
        code: `// Approach 3: Cyclic Replacements
// Time: O(n), Space: O(1)
public void rotateCyclic(int[] nums, int k) {
    int n = nums.length;
    k = k % n;
    int count = 0;
    
    for (int start = 0; count < n; start++) {
        int current = start;
        int prev = nums[start];
        
        do {
            int next = (current + k) % n;
            int temp = nums[next];
            nums[next] = prev;
            prev = temp;
            current = next;
            count++;
        } while (start != current);
    }
}`,
        explanation:
          "Moves elements in cycles. Handles cases where gcd(n, k) > 1. In-place but more complex.",
      },
      {
        language: "Python",
        code: `# Approach 1: Reverse Method (Optimal)
# Time: O(n), Space: O(1)
def rotate(nums, k):
    if not nums:
        return
    
    n = len(nums)
    k = k % n  # Handle k > array length
    
    # Helper function to reverse array in place
    def reverse(start, end):
        while start < end:
            nums[start], nums[end] = nums[end], nums[start]
            start += 1
            end -= 1
    
    # Reverse entire array
    reverse(0, n - 1)
    # Reverse first k elements
    reverse(0, k - 1)
    # Reverse remaining elements
    reverse(k, n - 1)`,
        explanation:
          "Reverse method: reverse all, then reverse first k and remaining elements. Most elegant approach.",
      },
      {
        language: "Python",
        code: `# Approach 2: Extra Array
# Time: O(n), Space: O(n)
def rotate_extra_array(nums, k):
    if not nums:
        return
    
    n = len(nums)
    k = k % n
    result = [0] * n
    
    for i in range(n):
        result[(i + k) % n] = nums[i]
    
    for i in range(n):
        nums[i] = result[i]`,
        explanation:
          "Uses temporary array to store rotated elements. Simple to understand but uses extra space.",
      },
      {
        language: "Python",
        code: `# Approach 3: Cyclic Replacements
# Time: O(n), Space: O(1)
def rotate_cyclic(nums, k):
    if not nums:
        return
    
    n = len(nums)
    k = k % n
    count = 0
    
    for start in range(n):
        if count >= n:
            break
            
        current = start
        prev = nums[start]
        
        while True:
            next_pos = (current + k) % n
            nums[next_pos], prev = prev, nums[next_pos]
            current = next_pos
            count += 1
            
            if start == current:
                break`,
        explanation:
          "Moves elements in cycles. Handles cases where gcd(n, k) > 1. In-place but more complex.",
      },
    ],
    tips: [
      "Reverse method is most elegant: reverse all, then reverse parts",
      "Handle k > array length with modulo operation",
      "Cyclic replacement handles cases where gcd(n, k) > 1",
      "Consider space constraints: in-place vs extra space trade-off",
    ],
    tags: ["array", "two-pointers", "math"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-8",
    question:
      "3Sum - Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Pointers (O(n²) time, O(1) space): Sort array, fix first element, use two pointers for remaining two. 2) Hash Set (O(n²) time, O(n) space): Use hash set to find complement of two numbers. 3) Brute Force (O(n³) time, O(1) space): Check all possible triplets. Two pointers approach is most efficient and commonly used.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n²), Space: O(1) excluding output
function threeSum(nums: number[]): number[][] {
    const result: number[][] = [];
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < nums.length - 2; i++) {
        // Skip duplicates for first number
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // Skip duplicates for second number
                while (left < right && nums[left] === nums[left + 1]) left++;
                // Skip duplicates for third number
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Sort array first, then use two pointers technique. Most efficient approach for 3Sum problem.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Hash Set
// Time: O(n²), Space: O(n)
function threeSumHashSet(nums: number[]): number[][] {
    const result: number[][] = [];
    const n = nums.length;
    
    for (let i = 0; i < n - 2; i++) {
        const seen = new Set<number>();
        
        for (let j = i + 1; j < n; j++) {
            const complement = -(nums[i] + nums[j]);
            
            if (seen.has(complement)) {
                const triplet = [nums[i], nums[j], complement].sort((a, b) => a - b);
                const tripletStr = triplet.join(',');
                
                if (!result.some(r => r.join(',') === tripletStr)) {
                    result.push(triplet);
                }
            }
            
            seen.add(nums[j]);
        }
    }
    
    return result;
}`,
        explanation:
          "Uses hash set to find complement. Less efficient due to duplicate checking and string operations.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Brute Force
// Time: O(n³), Space: O(1)
function threeSumBruteForce(nums: number[]): number[][] {
    const result: number[][] = [];
    const n = nums.length;
    
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                if (nums[i] + nums[j] + nums[k] === 0) {
                    const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
                    const tripletStr = triplet.join(',');
                    
                    if (!result.some(r => r.join(',') === tripletStr)) {
                        result.push(triplet);
                    }
                }
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Brute force checks all possible triplets. Simple but very inefficient for large arrays.",
      },
      {
        language: "Java",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n²), Space: O(1) excluding output
public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);
    
    for (int i = 0; i < nums.length - 2; i++) {
        // Skip duplicates for first number
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        int left = i + 1;
        int right = nums.length - 1;
        
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                
                // Skip duplicates for second number
                while (left < right && nums[left] == nums[left + 1]) left++;
                // Skip duplicates for third number
                while (left < right && nums[right] == nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Sort array first, then use two pointers technique. Most efficient approach for 3Sum problem.",
      },
      {
        language: "Java",
        code: `// Approach 2: Hash Set
// Time: O(n²), Space: O(n)
public List<List<Integer>> threeSumHashSet(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    int n = nums.length;
    
    for (int i = 0; i < n - 2; i++) {
        Set<Integer> seen = new HashSet<>();
        
        for (int j = i + 1; j < n; j++) {
            int complement = -(nums[i] + nums[j]);
            
            if (seen.contains(complement)) {
                List<Integer> triplet = Arrays.asList(nums[i], nums[j], complement);
                Collections.sort(triplet);
                if (!result.contains(triplet)) {
                    result.add(triplet);
                }
            }
            
            seen.add(nums[j]);
        }
    }
    
    return result;
}`,
        explanation:
          "Uses hash set to find complement. Less efficient due to duplicate checking and list operations.",
      },
      {
        language: "Java",
        code: `// Approach 3: Brute Force
// Time: O(n³), Space: O(1)
public List<List<Integer>> threeSumBruteForce(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    int n = nums.length;
    
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            for (int k = j + 1; k < n; k++) {
                if (nums[i] + nums[j] + nums[k] == 0) {
                    List<Integer> triplet = Arrays.asList(nums[i], nums[j], nums[k]);
                    Collections.sort(triplet);
                    if (!result.contains(triplet)) {
                        result.add(triplet);
                    }
                }
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Brute force checks all possible triplets. Simple but very inefficient for large arrays.",
      },
      {
        language: "Python",
        code: `# Approach 1: Two Pointers (Optimal)
# Time: O(n²), Space: O(1) excluding output
def three_sum(nums):
    result = []
    nums.sort()
    
    for i in range(len(nums) - 2):
        # Skip duplicates for first number
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        left = i + 1
        right = len(nums) - 1
        
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                
                # Skip duplicates for second number
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                # Skip duplicates for third number
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    
    return result`,
        explanation:
          "Sort array first, then use two pointers technique. Most efficient approach for 3Sum problem.",
      },
      {
        language: "Python",
        code: `# Approach 2: Hash Set
# Time: O(n²), Space: O(n)
def three_sum_hash_set(nums):
    result = []
    n = len(nums)
    
    for i in range(n - 2):
        seen = set()
        
        for j in range(i + 1, n):
            complement = -(nums[i] + nums[j])
            
            if complement in seen:
                triplet = sorted([nums[i], nums[j], complement])
                if triplet not in result:
                    result.append(triplet)
            
            seen.add(nums[j])
    
    return result`,
        explanation:
          "Uses hash set to find complement. Less efficient due to duplicate checking and list operations.",
      },
      {
        language: "Python",
        code: `# Approach 3: Brute Force
# Time: O(n³), Space: O(1)
def three_sum_brute_force(nums):
    result = []
    n = len(nums)
    
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    triplet = sorted([nums[i], nums[j], nums[k]])
                    if triplet not in result:
                        result.append(triplet)
    
    return result`,
        explanation:
          "Brute force checks all possible triplets. Simple but very inefficient for large arrays.",
      },
    ],
    tips: [
      "Sort array first to enable two-pointer technique",
      "Skip duplicates to avoid duplicate triplets",
      "Fix first element, then use two pointers for remaining two",
      "Time complexity dominated by sorting step",
    ],
    tags: ["array", "two-pointers", "sorting"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-9",
    question:
      "Container With Most Water - Given n non-negative integers representing heights, find two lines that form a container holding the most water.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Pointers (O(n) time, O(1) space): Start from both ends, move pointer with smaller height inward. 2) Brute Force (O(n²) time, O(1) space): Check all possible pairs of lines. 3) Dynamic Programming (O(n) time, O(n) space): Track maximum area ending at each position. Two pointers approach is optimal and most commonly used.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n), Space: O(1)
function maxArea(height: number[]): number {
    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;
    
    while (left < right) {
        // Calculate current area
        const width = right - left;
        const currentHeight = Math.min(height[left], height[right]);
        const currentArea = width * currentHeight;
        
        maxWater = Math.max(maxWater, currentArea);
        
        // Move pointer with smaller height
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}`,
        explanation:
          "Two pointers start at both ends and move inward. Always move the pointer with smaller height.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Brute Force
// Time: O(n²), Space: O(1)
function maxAreaBruteForce(height: number[]): number {
    let maxWater = 0;
    
    for (let i = 0; i < height.length; i++) {
        for (let j = i + 1; j < height.length; j++) {
            const width = j - i;
            const currentHeight = Math.min(height[i], height[j]);
            const area = width * currentHeight;
            maxWater = Math.max(maxWater, area);
        }
    }
    
    return maxWater;
}`,
        explanation:
          "Checks all possible pairs of lines. Simple to understand but inefficient for large arrays.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Dynamic Programming
// Time: O(n), Space: O(n)
function maxAreaDP(height: number[]): number {
    const n = height.length;
    const dp = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const area = (j - i) * Math.min(height[i], height[j]);
            dp[i] = Math.max(dp[i], area);
        }
    }
    
    return Math.max(...dp);
}`,
        explanation:
          "Dynamic programming approach that tracks maximum area ending at each position.",
      },
      {
        language: "Java",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n), Space: O(1)
public int maxArea(int[] height) {
    int left = 0;
    int right = height.length - 1;
    int maxWater = 0;
    
    while (left < right) {
        // Calculate current area
        int width = right - left;
        int currentHeight = Math.min(height[left], height[right]);
        int currentArea = width * currentHeight;
        
        maxWater = Math.max(maxWater, currentArea);
        
        // Move pointer with smaller height
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}`,
        explanation:
          "Two pointers start at both ends and move inward. Always move the pointer with smaller height.",
      },
      {
        language: "Java",
        code: `// Approach 2: Brute Force
// Time: O(n²), Space: O(1)
public int maxAreaBruteForce(int[] height) {
    int maxWater = 0;
    
    for (int i = 0; i < height.length; i++) {
        for (int j = i + 1; j < height.length; j++) {
            int width = j - i;
            int currentHeight = Math.min(height[i], height[j]);
            int area = width * currentHeight;
            maxWater = Math.max(maxWater, area);
        }
    }
    
    return maxWater;
}`,
        explanation:
          "Checks all possible pairs of lines. Simple to understand but inefficient for large arrays.",
      },
      {
        language: "Java",
        code: `// Approach 3: Dynamic Programming
// Time: O(n), Space: O(n)
public int maxAreaDP(int[] height) {
    int n = height.length;
    int[] dp = new int[n];
    
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int area = (j - i) * Math.min(height[i], height[j]);
            dp[i] = Math.max(dp[i], area);
        }
    }
    
    int maxWater = 0;
    for (int area : dp) {
        maxWater = Math.max(maxWater, area);
    }
    
    return maxWater;
}`,
        explanation:
          "Dynamic programming approach that tracks maximum area ending at each position.",
      },
      {
        language: "Python",
        code: `# Approach 1: Two Pointers (Optimal)
# Time: O(n), Space: O(1)
def max_area(height):
    if not height or len(height) < 2:
        return 0
    
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(height[left], height[right])
        current_area = width * current_height
        
        max_water = max(max_water, current_area)
        
        # Move pointer with smaller height
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water`,
        explanation:
          "Two pointers start at both ends and move inward. Always move the pointer with smaller height.",
      },
      {
        language: "Python",
        code: `# Approach 2: Brute Force
# Time: O(n²), Space: O(1)
def max_area_brute_force(height):
    if not height or len(height) < 2:
        return 0
    
    max_water = 0
    
    for i in range(len(height)):
        for j in range(i + 1, len(height)):
            width = j - i
            current_height = min(height[i], height[j])
            area = width * current_height
            max_water = max(max_water, area)
    
    return max_water`,
        explanation:
          "Checks all possible pairs of lines. Simple to understand but inefficient for large arrays.",
      },
      {
        language: "Python",
        code: `# Approach 3: Dynamic Programming
# Time: O(n), Space: O(n)
def max_area_dp(height):
    if not height or len(height) < 2:
        return 0
    
    n = len(height)
    dp = [0] * n
    
    for i in range(n):
        for j in range(i + 1, n):
            area = (j - i) * min(height[i], height[j])
            dp[i] = max(dp[i], area)
    
    return max(dp)`,
        explanation:
          "Dynamic programming approach that tracks maximum area ending at each position.",
      },
    ],
    tips: [
      "Two pointers start at both ends and move inward",
      "Always move the pointer with smaller height",
      "Area = width × min(height[left], height[right])",
      "Greedy approach: moving smaller height might find better solution",
    ],
    tags: ["array", "two-pointers", "greedy"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-10",
    question:
      "Find Minimum in Rotated Sorted Array - Suppose an array of length n sorted in ascending order is rotated. Find the minimum element.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Binary Search (O(log n) time, O(1) space): Compare mid element with right element to determine rotation point. 2) Handle Duplicates: Modified binary search for arrays with duplicate elements. 3) Linear Scan (O(n) time, O(1) space): Simple fallback approach. Binary search is optimal for time complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Binary Search (Optimal)
// Time: O(log n), Space: O(1)
function findMin(nums: number[]): number {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] > nums[right]) {
            // Minimum is in right half
            left = mid + 1;
        } else {
            // Minimum is in left half (including mid)
            right = mid;
        }
    }
    
    return nums[left];
}`,
        explanation:
          "Binary search approach compares mid element with right element to determine rotation point.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Handle Duplicates
// Time: O(log n), Space: O(1)
function findMinWithDuplicates(nums: number[]): number {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            // nums[mid] === nums[right], can't determine which side
            right--;
        }
    }
    
    return nums[left];
}`,
        explanation:
          "Modified binary search that handles arrays with duplicate elements by decrementing right pointer.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Linear Scan (Fallback)
// Time: O(n), Space: O(1)
function findMinLinear(nums: number[]): number {
    return Math.min(...nums);
}`,
        explanation:
          "Simple linear scan approach. Used as fallback when binary search complexity is not needed.",
      },
      {
        language: "Java",
        code: `// Approach 1: Binary Search (Optimal)
// Time: O(log n), Space: O(1)
public int findMin(int[] nums) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] > nums[right]) {
            // Minimum is in right half
            left = mid + 1;
        } else {
            // Minimum is in left half (including mid)
            right = mid;
        }
    }
    
    return nums[left];
}`,
        explanation:
          "Binary search approach compares mid element with right element to determine rotation point.",
      },
      {
        language: "Java",
        code: `// Approach 2: Handle Duplicates
// Time: O(log n), Space: O(1)
public int findMinWithDuplicates(int[] nums) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            // nums[mid] === nums[right], can't determine which side
            right--;
        }
    }
    
    return nums[left];
}`,
        explanation:
          "Modified binary search that handles arrays with duplicate elements by decrementing right pointer.",
      },
      {
        language: "Java",
        code: `// Approach 3: Linear Scan (Fallback)
// Time: O(n), Space: O(1)
public int findMinLinear(int[] nums) {
    int min = nums[0];
    for (int num : nums) {
        if (num < min) {
            min = num;
        }
    }
    return min;
}`,
        explanation:
          "Simple linear scan approach. Used as fallback when binary search complexity is not needed.",
      },
      {
        language: "Python",
        code: `# Approach 1: Binary Search (Optimal)
# Time: O(log n), Space: O(1)
def find_min(nums):
    if not nums:
        return None
    
    left = 0
    right = len(nums) - 1
    
    while left < right:
        mid = (left + right) // 2
        
        if nums[mid] > nums[right]:
            # Minimum is in right half
            left = mid + 1
        else:
            # Minimum is in left half (including mid)
            right = mid
    
    return nums[left]`,
        explanation:
          "Binary search approach compares mid element with right element to determine rotation point.",
      },
      {
        language: "Python",
        code: `# Approach 2: Handle Duplicates
# Time: O(log n), Space: O(1)
def find_min_with_duplicates(nums):
    if not nums:
        return None
    
    left = 0
    right = len(nums) - 1
    
    while left < right:
        mid = (left + right) // 2
        
        if nums[mid] > nums[right]:
            left = mid + 1
        elif nums[mid] < nums[right]:
            right = mid
        else:
            # nums[mid] == nums[right], can't determine which side
            right -= 1
    
    return nums[left]`,
        explanation:
          "Modified binary search that handles arrays with duplicate elements by decrementing right pointer.",
      },
      {
        language: "Python",
        code: `# Approach 3: Linear Scan (Fallback)
# Time: O(n), Space: O(1)
def find_min_linear(nums):
    if not nums:
        return None
    
    return min(nums)`,
        explanation:
          "Simple linear scan approach. Used as fallback when binary search complexity is not needed.",
      },
    ],
    tips: [
      "Use binary search to achieve O(log n) time complexity",
      "Compare mid with right (not left) to determine rotation point",
      "Handle duplicates by decrementing right pointer",
      "Original array was sorted, rotation creates at most one 'break' point",
    ],
    tags: ["array", "binary-search"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-11",
    question:
      "4Sum - Given an array nums of n integers, return an array of all unique quadruplets that sum to target.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Pointers (O(n³) time, O(1) space): Extension of 3Sum with additional nested loop. 2) Hash Map (O(n³) time, O(n) space): Use hash set to find complement of three numbers. 3) Brute Force (O(n⁴) time, O(1) space): Check all possible quadruplets. Two pointers approach is most efficient and commonly used.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Pointers (Extension of 3Sum)
// Time: O(n³), Space: O(1) excluding output
function fourSum(nums: number[], target: number): number[][] {
    const result: number[][] = [];
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < nums.length - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        for (let j = i + 1; j < nums.length - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
            let left = j + 1;
            let right = nums.length - 1;
            
            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];
                
                if (sum === target) {
                    result.push([nums[i], nums[j], nums[left], nums[right]]);
                    
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    
                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Extension of 3Sum with additional nested loop. Uses two pointers for innermost pair.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Hash Map
// Time: O(n³), Space: O(n)
function fourSumHash(nums: number[], target: number): number[][] {
    const result: number[][] = [];
    const n = nums.length;
    
    if (n < 4) return result;
    
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        for (let j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
            const seen = new Set<number>();
            
            for (let k = j + 1; k < n; k++) {
                const complement = target - nums[i] - nums[j] - nums[k];
                
                if (seen.has(complement)) {
                    result.push([nums[i], nums[j], complement, nums[k]]);
                    
                    while (k + 1 < n && nums[k] === nums[k + 1]) k++;
                }
                
                seen.add(nums[k]);
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Uses hash set to find complement of three numbers. Alternative approach to two pointers.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Brute Force
// Time: O(n⁴), Space: O(1)
function fourSumBruteForce(nums: number[], target: number): number[][] {
    const result: number[][] = [];
    const n = nums.length;
    
    for (let i = 0; i < n - 3; i++) {
        for (let j = i + 1; j < n - 2; j++) {
            for (let k = j + 1; k < n - 1; k++) {
                for (let l = k + 1; l < n; l++) {
                    if (nums[i] + nums[j] + nums[k] + nums[l] === target) {
                        const quadruplet = [nums[i], nums[j], nums[k], nums[l]].sort((a, b) => a - b);
                        const quadrupletStr = quadruplet.join(',');
                        
                        if (!result.some(r => r.join(',') === quadrupletStr)) {
                            result.push(quadruplet);
                        }
                    }
                }
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Brute force checks all possible quadruplets. Simple but very inefficient for large arrays.",
      },
      {
        language: "Java",
        code: `// Approach 1: Two Pointers (Extension of 3Sum)
// Time: O(n³), Space: O(1) excluding output
public List<List<Integer>> fourSum(int[] nums, int target) {
    List<List<Integer>> result = new ArrayList<>();
    
    if (nums == null || nums.length < 4) {
        return result;
    }
    
    Arrays.sort(nums);
    int n = nums.length;
    
    for (int i = 0; i < n - 3; i++) {
        // Skip duplicates for first number
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        // Early termination
        if ((long) nums[i] + nums[i+1] + nums[i+2] + nums[i+3] > target) break;
        if ((long) nums[i] + nums[n-3] + nums[n-2] + nums[n-1] < target) continue;
        
        for (int j = i + 1; j < n - 2; j++) {
            // Skip duplicates for second number
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            
            // Early termination
            if ((long) nums[i] + nums[j] + nums[j+1] + nums[j+2] > target) break;
            if ((long) nums[i] + nums[j] + nums[n-2] + nums[n-1] < target) continue;
            
            int left = j + 1;
            int right = n - 1;
            
            while (left < right) {
                long sum = (long) nums[i] + nums[j] + nums[left] + nums[right];
                
                if (sum == target) {
                    result.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));
                    
                    // Skip duplicates
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    
                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Extension of 3Sum with additional nested loop. Uses two pointers for innermost pair. Includes early termination optimizations.",
      },
      {
        language: "Java",
        code: `// Approach 2: Hash Map
// Time: O(n³), Space: O(n)
public List<List<Integer>> fourSumHash(int[] nums, int target) {
    List<List<Integer>> result = new ArrayList<>();
    
    if (nums == null || nums.length < 4) {
        return result;
    }
    
    Arrays.sort(nums);
    int n = nums.length;
    
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            
            Set<Integer> seen = new HashSet<>();
            
            for (int k = j + 1; k < n; k++) {
                // Skip duplicates for third number
                if (k > j + 1 && nums[k] == nums[k - 1] && k < n - 1) continue;
                
                int complement = target - nums[i] - nums[j] - nums[k];
                
                if (seen.contains(complement)) {
                    result.add(Arrays.asList(nums[i], nums[j], complement, nums[k]));
                    
                    while (k + 1 < n && nums[k] == nums[k + 1]) k++;
                }
                
                seen.add(nums[k]);
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Uses hash set to find complement of three numbers. Alternative approach to two pointers.",
      },
      {
        language: "Java",
        code: `// Approach 3: Brute Force
// Time: O(n⁴), Space: O(1)
public List<List<Integer>> fourSumBruteForce(int[] nums, int target) {
    List<List<Integer>> result = new ArrayList<>();
    int n = nums.length;
    
    Arrays.sort(nums);
    
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            
            for (int k = j + 1; k < n - 1; k++) {
                if (k > j + 1 && nums[k] == nums[k - 1]) continue;
                
                for (int l = k + 1; l < n; l++) {
                    if (l > k + 1 && nums[l] == nums[l - 1]) continue;
                    
                    if ((long) nums[i] + nums[j] + nums[k] + nums[l] == target) {
                        result.add(Arrays.asList(nums[i], nums[j], nums[k], nums[l]));
                    }
                }
            }
        }
    }
    
    return result;
}`,
        explanation:
          "Brute force checks all possible quadruplets. Simple but very inefficient for large arrays. Added duplicate skipping for efficiency.",
      },
      {
        language: "Python",
        code: `# Approach 1: Two Pointers (Extension of 3Sum)
# Time: O(n³), Space: O(1) excluding output
def four_sum(nums, target):
    if not nums or len(nums) < 4:
        return []
    
    result = []
    nums.sort()
    n = len(nums)
    
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            
            left = j + 1
            right = n - 1
            
            while left < right:
                total = nums[i] + nums[j] + nums[left] + nums[right]
                
                if total == target:
                    result.append([nums[i], nums[j], nums[left], nums[right]])
                    
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    
                    left += 1
                    right -= 1
                elif total < target:
                    left += 1
                else:
                    right -= 1
    
    return result`,
        explanation:
          "Extension of 3Sum with additional nested loop. Uses two pointers for innermost pair.",
      },
      {
        language: "Python",
        code: `# Approach 2: Hash Map
# Time: O(n³), Space: O(n)
def four_sum_hash(nums, target):
    if not nums or len(nums) < 4:
        return []
    
    result = []
    n = len(nums)
    nums.sort()
    
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            
            seen = set()
            
            for k in range(j + 1, n):
                if k > j + 1 and nums[k] == nums[k - 1] and k < n - 1:
                    continue
                
                complement = target - nums[i] - nums[j] - nums[k]
                
                if complement in seen:
                    result.append([nums[i], nums[j], complement, nums[k]])
                    
                    while k + 1 < n and nums[k] == nums[k + 1]:
                        k += 1
                
                seen.add(nums[k])
    
    return result`,
        explanation:
          "Uses hash set to find complement of three numbers. Alternative approach to two pointers.",
      },
      {
        language: "Python",
        code: `# Approach 3: Brute Force
# Time: O(n⁴), Space: O(1)
def four_sum_brute_force(nums, target):
    if not nums or len(nums) < 4:
        return []
    
    result = []
    n = len(nums)
    nums.sort()
    
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            
            for k in range(j + 1, n - 1):
                if k > j + 1 and nums[k] == nums[k - 1]:
                    continue
                
                for l in range(k + 1, n):
                    if l > k + 1 and nums[l] == nums[l - 1]:
                        continue
                    
                    if nums[i] + nums[j] + nums[k] + nums[l] == target:
                        result.append([nums[i], nums[j], nums[k], nums[l]])
    
    return result`,
        explanation:
          "Brute force checks all possible quadruplets. Simple but very inefficient for large arrays. Added duplicate skipping for efficiency.",
      },
    ],
    tips: [
      "Extension of 3Sum with additional nested loop",
      "Sort array first to enable duplicate skipping",
      "Use two pointers for innermost pair",
      "Skip duplicates at all levels to avoid duplicate quadruplets",
    ],
    tags: ["array", "two-pointers", "sorting", "hash-table"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-12",
    question:
      "Trapping Rain Water - Given n non-negative integers representing elevation map, compute how much water it can trap after raining.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Pointers (O(n) time, O(1) space): Track left and right maximum heights, move pointer with smaller height. 2) Dynamic Programming (O(n) time, O(n) space): Pre-compute left and right maximum heights for each position. 3) Stack (O(n) time, O(n) space): Process water layer by layer using stack. Two pointers approach is most space efficient.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n), Space: O(1)
function trap(height: number[]): number {
    if (height.length <= 2) return 0;
    
    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let water = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    
    return water;
}`,
        explanation:
          "Two pointers approach tracks left and right maximum heights. Most space efficient solution.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Dynamic Programming
// Time: O(n), Space: O(n)
function trapDP(height: number[]): number {
    if (height.length <= 2) return 0;
    
    const n = height.length;
    const leftMax = new Array(n);
    const rightMax = new Array(n);
    
    leftMax[0] = height[0];
    for (let i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    }
    
    rightMax[n - 1] = height[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    }
    
    let water = 0;
    for (let i = 0; i < n; i++) {
        water += Math.min(leftMax[i], rightMax[i]) - height[i];
    }
    
    return water;
}`,
        explanation:
          "DP approach pre-computes left and right maximum heights for each position.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Stack
// Time: O(n), Space: O(n)
function trapStack(height: number[]): number {
    const stack: number[] = [];
    let water = 0;
    
    for (let i = 0; i < height.length; i++) {
        while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
            const top = stack.pop()!;
            
            if (stack.length === 0) break;
            
            const distance = i - stack[stack.length - 1] - 1;
            const boundedHeight = Math.min(height[i], height[stack[stack.length - 1]]) - height[top];
            water += distance * boundedHeight;
        }
        
        stack.push(i);
    }
    
    return water;
}`,
        explanation:
          "Stack approach processes water layer by layer. More complex but shows different perspective.",
      },
      {
        language: "Java",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n), Space: O(1)
public int trap(int[] height) {
    if (height == null || height.length <= 2) return 0;
    
    int left = 0;
    int right = height.length - 1;
    int leftMax = 0;
    int rightMax = 0;
    int water = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    
    return water;
}`,
        explanation:
          "Two pointers approach tracks left and right maximum heights. Most space efficient solution.",
      },
      {
        language: "Java",
        code: `// Approach 2: Dynamic Programming
// Time: O(n), Space: O(n)
public int trapDP(int[] height) {
    if (height == null || height.length <= 2) return 0;
    
    int n = height.length;
    int[] leftMax = new int[n];
    int[] rightMax = new int[n];
    
    leftMax[0] = height[0];
    for (int i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    }
    
    rightMax[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    }
    
    int water = 0;
    for (int i = 0; i < n; i++) {
        water += Math.min(leftMax[i], rightMax[i]) - height[i];
    }
    
    return water;
}`,
        explanation:
          "DP approach pre-computes left and right maximum heights for each position.",
      },
      {
        language: "Java",
        code: `// Approach 3: Stack
// Time: O(n), Space: O(n)
public int trapStack(int[] height) {
    if (height == null || height.length <= 2) return 0;
    
    Stack<Integer> stack = new Stack<>();
    int water = 0;
    
    for (int i = 0; i < height.length; i++) {
        while (!stack.isEmpty() && height[i] > height[stack.peek()]) {
            int top = stack.pop();
            
            if (stack.isEmpty()) break;
            
            int distance = i - stack.peek() - 1;
            int boundedHeight = Math.min(height[i], height[stack.peek()]) - height[top];
            water += distance * boundedHeight;
        }
        
        stack.push(i);
    }
    
    return water;
}`,
        explanation:
          "Stack approach processes water layer by layer. More complex but shows different perspective.",
      },
      {
        language: "Python",
        code: `# Approach 1: Two Pointers (Optimal)
# Time: O(n), Space: O(1)
def trap(height):
    if not height or len(height) <= 2:
        return 0
    
    left = 0
    right = len(height) - 1
    left_max = 0
    right_max = 0
    water = 0
    
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    
    return water`,
        explanation:
          "Two pointers approach tracks left and right maximum heights. Most space efficient solution.",
      },
      {
        language: "Python",
        code: `# Approach 2: Dynamic Programming
# Time: O(n), Space: O(n)
def trap_dp(height):
    if not height or len(height) <= 2:
        return 0
    
    n = len(height)
    left_max = [0] * n
    right_max = [0] * n
    
    left_max[0] = height[0]
    for i in range(1, n):
        left_max[i] = max(left_max[i - 1], height[i])
    
    right_max[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        right_max[i] = max(right_max[i + 1], height[i])
    
    water = 0
    for i in range(n):
        water += min(left_max[i], right_max[i]) - height[i]
    
    return water`,
        explanation:
          "DP approach pre-computes left and right maximum heights for each position.",
      },
      {
        language: "Python",
        code: `# Approach 3: Stack
# Time: O(n), Space: O(n)
def trap_stack(height):
    if not height or len(height) <= 2:
        return 0
    
    stack = []
    water = 0
    
    for i in range(len(height)):
        while stack and height[i] > height[stack[-1]]:
            top = stack.pop()
            
            if not stack:
                break
            
            distance = i - stack[-1] - 1
            bounded_height = min(height[i], height[stack[-1]]) - height[top]
            water += distance * bounded_height
        
        stack.append(i)
    
    return water`,
        explanation:
          "Stack approach processes water layer by layer. More complex but shows different perspective.",
      },
    ],
    tips: [
      "Water level at position = min(max_left, max_right) - height[i]",
      "Two pointers approach is most space efficient",
      "DP approach pre-computes max heights for each position",
      "Stack approach processes water layer by layer",
    ],
    tags: ["array", "two-pointers", "dynamic-programming", "stack"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-13",
    question:
      "Subarray Sum Equals K - Given an array of integers and integer k, find total number of continuous subarrays whose sum equals k.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Prefix Sum with Hash Map (O(n) time, O(n) space): Use prefix sums to convert to two-sum problem. 2) Brute Force (O(n²) time, O(1) space): Check all possible subarrays. 3) Return Actual Subarrays: Modified version that returns the actual subarrays instead of just count. Prefix sum approach is optimal for time complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Prefix Sum with Hash Map (Optimal)
// Time: O(n), Space: O(n)
function subarraySum(nums: number[], k: number): number {
    const prefixSumCount = new Map<number, number>();
    prefixSumCount.set(0, 1); // Empty subarray has sum 0
    
    let count = 0;
    let prefixSum = 0;
    
    for (const num of nums) {
        prefixSum += num;
        
        // Check if there's a prefix sum such that current - prefix = k
        if (prefixSumCount.has(prefixSum - k)) {
            count += prefixSumCount.get(prefixSum - k)!;
        }
        
        prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) || 0) + 1);
    }
    
    return count;
}`,
        explanation:
          "Uses prefix sums to convert to two-sum problem. Hash map tracks frequency of prefix sums seen.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Brute Force
// Time: O(n²), Space: O(1)
function subarraySumBrute(nums: number[], k: number): number {
    let count = 0;
    
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum === k) count++;
        }
    }
    
    return count;
}`,
        explanation:
          "Checks all possible subarrays. Simple to understand but inefficient for large arrays.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Return Actual Subarrays
// Time: O(n), Space: O(n)
function findSubarraysWithSum(nums: number[], k: number): number[][] {
    const result: number[][] = [];
    const prefixSumIndices = new Map<number, number[]>();
    prefixSumIndices.set(0, [-1]); // Empty subarray
    
    let prefixSum = 0;
    
    for (let i = 0; i < nums.length; i++) {
        prefixSum += nums[i];
        
        if (prefixSumIndices.has(prefixSum - k)) {
            for (const startIndex of prefixSumIndices.get(prefixSum - k)!) {
                result.push(nums.slice(startIndex + 1, i + 1));
            }
        }
        
        if (!prefixSumIndices.has(prefixSum)) {
            prefixSumIndices.set(prefixSum, []);
        }
        prefixSumIndices.get(prefixSum)!.push(i);
    }
    
    return result;
}`,
        explanation:
          "Modified version that returns the actual subarrays instead of just count.",
      },
      {
        language: "Java",
        code: `// Approach 1: Prefix Sum with Hash Map (Optimal)
// Time: O(n), Space: O(n)
public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> prefixSumCount = new HashMap<>();
    prefixSumCount.put(0, 1); // Empty subarray has sum 0
    
    int count = 0;
    int prefixSum = 0;
    
    for (int num : nums) {
        prefixSum += num;
        
        // Check if there's a prefix sum such that current - prefix = k
        if (prefixSumCount.containsKey(prefixSum - k)) {
            count += prefixSumCount.get(prefixSum - k);
        }
        
        prefixSumCount.put(prefixSum, prefixSumCount.getOrDefault(prefixSum, 0) + 1);
    }
    
    return count;
}`,
        explanation:
          "Uses prefix sums to convert to two-sum problem. Hash map tracks frequency of prefix sums seen.",
      },
      {
        language: "Java",
        code: `// Approach 2: Brute Force
// Time: O(n²), Space: O(1)
public int subarraySumBrute(int[] nums, int k) {
    int count = 0;
    
    for (int i = 0; i < nums.length; i++) {
        int sum = 0;
        for (int j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum == k) count++;
        }
    }
    
    return count;
}`,
        explanation:
          "Checks all possible subarrays. Simple to understand but inefficient for large arrays.",
      },
      {
        language: "Java",
        code: `// Approach 3: Return Actual Subarrays
// Time: O(n), Space: O(n)
public List<List<Integer>> findSubarraysWithSum(int[] nums, int k) {
    List<List<Integer>> result = new ArrayList<>();
    Map<Integer, List<Integer>> prefixSumIndices = new HashMap<>();
    
    List<Integer> initialList = new ArrayList<>();
    initialList.add(-1);
    prefixSumIndices.put(0, initialList); // Empty subarray
    
    int prefixSum = 0;
    
    for (int i = 0; i < nums.length; i++) {
        prefixSum += nums[i];
        
        if (prefixSumIndices.containsKey(prefixSum - k)) {
            for (int startIndex : prefixSumIndices.get(prefixSum - k)) {
                List<Integer> subarray = new ArrayList<>();
                for (int j = startIndex + 1; j <= i; j++) {
                    subarray.add(nums[j]);
                }
                result.add(subarray);
            }
        }
        
        if (!prefixSumIndices.containsKey(prefixSum)) {
            prefixSumIndices.put(prefixSum, new ArrayList<>());
        }
        prefixSumIndices.get(prefixSum).add(i);
    }
    
    return result;
}`,
        explanation:
          "Modified version that returns the actual subarrays instead of just count.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: Prefix Sum with Hash Map (Optimal)
# Time: O(n), Space: O(n)
def subarray_sum(nums, k):
    prefix_sum_count = {0: 1}  # Empty subarray has sum 0
    count = 0
    prefix_sum = 0
    
    for num in nums:
        prefix_sum += num
        
        # Check if there's a prefix sum such that current - prefix = k
        if prefix_sum - k in prefix_sum_count:
            count += prefix_sum_count[prefix_sum - k]
        
        prefix_sum_count[prefix_sum] = prefix_sum_count.get(prefix_sum, 0) + 1
    
    return count`,
        explanation:
          "Uses prefix sums to convert to two-sum problem. Hash map tracks frequency of prefix sums seen.",
      },
      {
        language: "Python",
        approach: "brute-force",
        code: `# Approach 2: Brute Force
# Time: O(n²), Space: O(1)
def subarray_sum_brute(nums, k):
    count = 0
    
    for i in range(len(nums)):
        current_sum = 0
        for j in range(i, len(nums)):
            current_sum += nums[j]
            if current_sum == k:
                count += 1
    
    return count`,
        explanation:
          "Checks all possible subarrays. Simple to understand but inefficient for large arrays.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 3: Return Actual Subarrays
# Time: O(n), Space: O(n)
def find_subarrays_with_sum(nums, k):
    result = []
    prefix_sum_indices = {0: [-1]}  # Empty subarray
    
    prefix_sum = 0
    
    for i in range(len(nums)):
        prefix_sum += nums[i]
        
        if prefix_sum - k in prefix_sum_indices:
            for start_index in prefix_sum_indices[prefix_sum - k]:
                result.append(nums[start_index + 1:i + 1])
        
        if prefix_sum not in prefix_sum_indices:
            prefix_sum_indices[prefix_sum] = []
        prefix_sum_indices[prefix_sum].append(i)
    
    return result`,
        explanation:
          "Modified version that returns the actual subarrays instead of just count.",
      },
    ],
    tips: [
      "Use prefix sum to convert to two-sum problem",
      "Hash map tracks frequency of prefix sums seen so far",
      "Key insight: sum[i,j] = prefixSum[j] - prefixSum[i-1]",
      "Handle empty subarray case by initializing map with (0,1)",
    ],
    tags: ["array", "hash-table", "prefix-sum"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-14",
    question:
      "Next Permutation - Implement next permutation, which rearranges numbers into the lexicographically next greater permutation.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) In-place Algorithm (O(n) time, O(1) space): Find pivot, swap with next greater element, reverse suffix. 2) Generate All Permutations: Backtracking approach to generate all permutations (for understanding). 3) Lexicographic Order: Sort permutations and find next one. The in-place algorithm is optimal and most commonly used.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: In-place Algorithm (Optimal)
// Time: O(n), Space: O(1)
function nextPermutation(nums: number[]): void {
    let i = nums.length - 2;
    
    // Step 1: Find first decreasing element from right
    while (i >= 0 && nums[i] >= nums[i + 1]) {
        i--;
    }
    
    if (i >= 0) {
        // Step 2: Find smallest element greater than nums[i]
        let j = nums.length - 1;
        while (nums[j] <= nums[i]) {
            j--;
        }
        
        // Step 3: Swap elements
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    
    // Step 4: Reverse suffix
    reverse(nums, i + 1);
}

function reverse(nums: number[], start: number): void {
    let left = start;
    let right = nums.length - 1;
    
    while (left < right) {
        [nums[left], nums[right]] = [nums[right], nums[left]];
        left++;
        right--;
    }
}`,
        explanation:
          "In-place algorithm: find pivot, swap with next greater element, then reverse suffix.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Generate All Permutations (for understanding)
// Time: O(n!), Space: O(n!)
function getAllPermutations(nums: number[]): number[][] {
    const result: number[][] = [];
    
    function backtrack(current: number[], remaining: number[]): void {
        if (remaining.length === 0) {
            result.push([...current]);
            return;
        }
        
        for (let i = 0; i < remaining.length; i++) {
            current.push(remaining[i]);
            const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
            backtrack(current, newRemaining);
            current.pop();
        }
    }
    
    backtrack([], nums);
    return result.sort((a, b) => {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
        }
        return 0;
    });
}`,
        explanation:
          "Backtracking approach to generate all permutations. Used for understanding the concept.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Lexicographic Order
// Time: O(n log n), Space: O(n)
function nextPermutationLexicographic(nums: number[]): number[] {
    const sorted = [...nums].sort((a, b) => a - b);
    const current = nums.join('');
    
    // Find current permutation in sorted list
    let currentIndex = -1;
    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].join('') === current) {
            currentIndex = i;
            break;
        }
    }
    
    // Return next permutation or first if at end
    if (currentIndex === sorted.length - 1) {
        return sorted[0];
    }
    
    return sorted[currentIndex + 1];
}`,
        explanation:
          "Sorts all permutations and finds next one. Not efficient but shows lexicographic concept.",
      },
      {
        language: "Java",
        code: `// Approach 1: In-place Algorithm (Optimal)
// Time: O(n), Space: O(1)
public void nextPermutation(int[] nums) {
    int i = nums.length - 2;
    
    // Step 1: Find first decreasing element from right
    while (i >= 0 && nums[i] >= nums[i + 1]) {
        i--;
    }
    
    if (i >= 0) {
        // Step 2: Find smallest element greater than nums[i]
        int j = nums.length - 1;
        while (nums[j] <= nums[i]) {
            j--;
        }
        
        // Step 3: Swap elements
        swap(nums, i, j);
    }
    
    // Step 4: Reverse suffix
    reverse(nums, i + 1);
}

private void swap(int[] nums, int i, int j) {
    int temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}

private void reverse(int[] nums, int start) {
    int left = start;
    int right = nums.length - 1;
    
    while (left < right) {
        swap(nums, left, right);
        left++;
        right--;
    }
}`,
        explanation:
          "In-place algorithm: find pivot, swap with next greater element, then reverse suffix.",
      },
      {
        language: "Java",
        code: `// Approach 2: Generate All Permutations (for understanding)
// Time: O(n!), Space: O(n!)
public List<List<Integer>> getAllPermutations(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    List<Integer> current = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    
    backtrack(nums, used, current, result);
    
    // Sort permutations lexicographically
    Collections.sort(result, (a, b) -> {
        for (int i = 0; i < a.size(); i++) {
            if (!a.get(i).equals(b.get(i))) {
                return a.get(i) - b.get(i);
            }
        }
        return 0;
    });
    
    return result;
}

private void backtrack(int[] nums, boolean[] used, List<Integer> current, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        
        current.add(nums[i]);
        used[i] = true;
        backtrack(nums, used, current, result);
        used[i] = false;
        current.remove(current.size() - 1);
    }
}`,
        explanation:
          "Backtracking approach to generate all permutations. Used for understanding the concept.",
      },
      {
        language: "Java",
        code: `// Approach 3: Built-in Next Permutation
// Time: O(n), Space: O(1)
public boolean nextPermutationBuiltIn(int[] nums) {
    // Find longest non-increasing suffix
    int i = nums.length - 1;
    while (i > 0 && nums[i - 1] >= nums[i]) {
        i--;
    }
    
    // If no pivot found, array is largest permutation
    if (i <= 0) {
        reverse(nums, 0);
        return false;
    }
    
    // Find rightmost successor to pivot
    int j = nums.length - 1;
    while (nums[j] <= nums[i - 1]) {
        j--;
    }
    
    // Swap with pivot
    int temp = nums[i - 1];
    nums[i - 1] = nums[j];
    nums[j] = temp;
    
    // Reverse the suffix
    reverse(nums, i);
    return true;
}`,
        explanation:
          "Implementation similar to Java's Collections.nextPermutation(). Returns boolean to indicate if next permutation exists.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: In-place Algorithm (Optimal)
# Time: O(n), Space: O(1)
def next_permutation(nums):
    i = len(nums) - 2
    
    # Step 1: Find first decreasing element from right
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    
    if i >= 0:
        # Step 2: Find smallest element greater than nums[i]
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        
        # Step 3: Swap elements
        nums[i], nums[j] = nums[j], nums[i]
    
    # Step 4: Reverse suffix
    reverse(nums, i + 1)

def reverse(nums, start):
    left, right = start, len(nums) - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1`,
        explanation:
          "In-place algorithm: find pivot, swap with next greater element, then reverse suffix.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 2: Generate All Permutations (for understanding)
# Time: O(n!), Space: O(n!)
def get_all_permutations(nums):
    result = []
    
    def backtrack(current, remaining):
        if len(remaining) == 0:
            result.append(current[:])
            return
        
        for i in range(len(remaining)):
            current.append(remaining[i])
            new_remaining = remaining[:i] + remaining[i+1:]
            backtrack(current, new_remaining)
            current.pop()
    
    backtrack([], nums)
    return sorted(result)`,
        explanation:
          "Backtracking approach to generate all permutations. Used for understanding the concept.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 3: Built-in Next Permutation
# Time: O(n), Space: O(1)
def next_permutation_builtin(nums):
    # Find longest non-increasing suffix
    i = len(nums) - 1
    while i > 0 and nums[i - 1] >= nums[i]:
        i -= 1
    
    # If no pivot found, array is largest permutation
    if i <= 0:
        nums.reverse()
        return False
    
    # Find rightmost successor to pivot
    j = len(nums) - 1
    while nums[j] <= nums[i - 1]:
        j -= 1
    
    # Swap with pivot
    nums[i - 1], nums[j] = nums[j], nums[i - 1]
    
    # Reverse the suffix
    nums[i:] = nums[i:][::-1]
    return True`,
        explanation:
          "Implementation similar to Python's itertools.permutations(). Returns boolean to indicate if next permutation exists.",
      },
    ],
    tips: [
      "Find rightmost character that is smaller than character next to it",
      "Find smallest character to right that's larger than pivot",
      "Swap pivot with that character, then reverse suffix",
      "If no such character exists, array is largest permutation",
    ],
    tags: ["array", "two-pointers", "math"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-15",
    question:
      "Sliding Window Maximum - Given array and sliding window of size k, return max element in each window position.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Deque (O(n) time, O(k) space): Maintain decreasing order of values in deque, front always contains maximum. 2) Brute Force (O(n * k) time, O(1) space): Check maximum in each window. 3) Max Heap (O(n log k) time, O(k) space): Use priority queue to track maximum. Deque approach is optimal for time complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Deque (Optimal)
// Time: O(n), Space: O(k)
function maxSlidingWindow(nums: number[], k: number): number[] {
    const result: number[] = [];
    const deque: number[] = []; // Store indices
    
    for (let i = 0; i < nums.length; i++) {
        // Remove indices outside current window
        while (deque.length > 0 && deque[0] <= i - k) {
            deque.shift();
        }
        
        // Remove indices of smaller elements (maintain decreasing order)
        while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
            deque.pop();
        }
        
        deque.push(i);
        
        // Start recording results after first window
        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    
    return result;
}`,
        explanation:
          "Deque maintains indices in decreasing order of values. Front always contains maximum of current window.",
      },
      {
        language: "Java",
        code: `// Approach 1: Deque (Optimal)
// Time: O(n), Space: O(k)
public int[] maxSlidingWindow(int[] nums, int k) {
    if (nums == null || nums.length == 0) {
        return new int[0];
    }
    
    int[] result = new int[nums.length - k + 1];
    Deque<Integer> deque = new ArrayDeque<>(); // Store indices
    
    for (int i = 0; i < nums.length; i++) {
        // Remove indices outside current window
        while (!deque.isEmpty() && deque.peekFirst() <= i - k) {
            deque.pollFirst();
        }
        
        // Remove indices of smaller elements (maintain decreasing order)
        while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {
            deque.pollLast();
        }
        
        deque.offerLast(i);
        
        // Start recording results after first window
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }
    
    return result;
}`,
        explanation:
          "Java implementation using ArrayDeque. Same approach as TypeScript - maintains indices in decreasing order of values.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Brute Force
// Time: O(n * k), Space: O(1)
function maxSlidingWindowBrute(nums: number[], k: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i <= nums.length - k; i++) {
        let max = nums[i];
        for (let j = i + 1; j < i + k; j++) {
            max = Math.max(max, nums[j]);
        }
        result.push(max);
      }
    
    return result;
}`,
        explanation:
          "Checks maximum in each window. Simple to understand but inefficient for large windows.",
      },
      {
        language: "Java",
        code: `// Approach 2: Brute Force
// Time: O(n * k), Space: O(1)
public int[] maxSlidingWindowBrute(int[] nums, int k) {
    if (nums == null || nums.length == 0) {
        return new int[0];
    }
    
    int[] result = new int[nums.length - k + 1];
    
    for (int i = 0; i <= nums.length - k; i++) {
        int max = nums[i];
        for (int j = i + 1; j < i + k; j++) {
            max = Math.max(max, nums[j]);
        }
        result[i] = max;
    }
    
    return result;
}`,
        explanation:
          "Java implementation of the brute force approach. Simple linear scan through each window to find maximum.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Max Heap (Priority Queue)
// Time: O(n log k), Space: O(k)
function maxSlidingWindowHeap(nums: number[], k: number): number[] {
    const result: number[] = [];
    const maxHeap: [number, number][] = []; // [value, index]
    
    for (let i = 0; i < nums.length; i++) {
        // Add current element
        maxHeap.push([nums[i], i]);
        maxHeap.sort((a, b) => b[0] - a[0]); // Sort by value descending
        
        // Remove elements outside window
        while (maxHeap.length > 0 && maxHeap[0][1] <= i - k) {
            maxHeap.shift();
        }
        
        if (i >= k - 1) {
            result.push(maxHeap[0][0]);
        }
    }
    
    return result;
}`,
        explanation:
          "Uses priority queue to track maximum. Alternative approach with different time complexity trade-offs.",
      },
      {
        language: "Java",
        code: `// Approach 3: Max Heap (Priority Queue)
// Time: O(n log k), Space: O(k)
public int[] maxSlidingWindowHeap(int[] nums, int k) {
    if (nums == null || nums.length == 0) {
        return new int[0];
    }
    
    int[] result = new int[nums.length - k + 1];
    // PriorityQueue with custom comparator for max heap (value, index)
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
    
    for (int i = 0; i < nums.length; i++) {
        // Add current element
        maxHeap.offer(new int[]{nums[i], i});
        
        // Remove elements outside window
        while (!maxHeap.isEmpty() && maxHeap.peek()[1] <= i - k) {
            maxHeap.poll();
        }
        
        if (i >= k - 1) {
            result[i - k + 1] = maxHeap.peek()[0];
        }
    }
    
    return result;
}`,
        explanation:
          "Java implementation using PriorityQueue (Max Heap). Maintains the window's maximum at the top of the heap.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: Deque (Optimal)
# Time: O(n), Space: O(k)
from collections import deque

def max_sliding_window(nums, k):
    if not nums or k == 0:
        return []
    
    result = []
    dq = deque()  # Store indices
    
    for i in range(len(nums)):
        # Remove indices outside current window
        while dq and dq[0] <= i - k:
            dq.popleft()
        
        # Remove indices of smaller elements (maintain decreasing order)
        while dq and nums[dq[-1]] <= nums[i]:
            dq.pop()
        
        dq.append(i)
        
        # Start recording results after first window
        if i >= k - 1:
            result.append(nums[dq[0]])
    
    return result`,
        explanation:
          "Deque maintains indices in decreasing order of values. Front always contains maximum of current window.",
      },
      {
        language: "Python",
        approach: "brute-force",
        code: `# Approach 2: Brute Force
# Time: O(n * k), Space: O(1)
def max_sliding_window_brute(nums, k):
    if not nums or k == 0:
        return []
    
    result = []
    
    for i in range(len(nums) - k + 1):
        max_val = max(nums[i:i + k])
        result.append(max_val)
    
    return result`,
        explanation:
          "Checks maximum in each window. Simple to understand but inefficient for large windows.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 3: Max Heap (Priority Queue)
# Time: O(n log k), Space: O(k)
import heapq

def max_sliding_window_heap(nums, k):
    if not nums or k == 0:
        return []
    
    result = []
    max_heap = []  # Store (-value, index) for max heap
    
    for i in range(len(nums)):
        # Add current element (negative for max heap)
        heapq.heappush(max_heap, (-nums[i], i))
        
        # Remove elements outside window
        while max_heap and max_heap[0][1] <= i - k:
            heapq.heappop(max_heap)
        
        if i >= k - 1:
            result.append(-max_heap[0][0])
    
    return result`,
        explanation:
          "Uses priority queue to track maximum. Alternative approach with different time complexity trade-offs.",
      },
    ],
    tips: [
      "Deque maintains indices in decreasing order of values",
      "Front of deque always contains maximum of current window",
      "Remove indices outside window and smaller elements",
      "Each element is added and removed at most once",
    ],
    tags: ["array", "sliding-window", "deque", "heap"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-16",
    question:
      "First Missing Positive - Given unsorted integer array, find the smallest missing positive integer.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Cyclic Sort (O(n) time, O(1) space): Place each positive number at its correct index, then find first missing. 2) Array as Hash Set (O(n) time, O(1) space): Use array indices and sign manipulation to mark presence. 3) Set Approach (O(n) time, O(n) space): Use hash set to track seen numbers. Cyclic sort approach is optimal for space constraints.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Cyclic Sort (Optimal)
// Time: O(n), Space: O(1)
function firstMissingPositive(nums: number[]): number {
    const n = nums.length;
    
    // Step 1: Place each positive number i at index i-1
    for (let i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
            [nums[nums[i] - 1], nums[i]] = [nums[i], nums[nums[i] - 1]];
        }
    }
    
    // Step 2: Find first missing positive
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) {
            return i + 1;
        }
    }
    
    return n + 1;
}`,
        explanation:
          "Cyclic sort places each positive number at its correct index, then finds first missing positive.",
      },
      {
        language: "Java",
        code: `// Approach 1: Cyclic Sort (Optimal)
// Time: O(n), Space: O(1)
public int firstMissingPositive(int[] nums) {
    int n = nums.length;
    
    // Step 1: Place each positive number i at index i-1
    for (int i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int temp = nums[nums[i] - 1];
            nums[nums[i] - 1] = nums[i];
            nums[i] = temp;
        }
    }
    
    // Step 2: Find first missing positive
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) {
            return i + 1;
        }
    }
    
    return n + 1;
}`,
        explanation:
          "Java implementation using cyclic sort approach. Each number is placed at its correct position (nums[i] should be at position i+1).",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Array as Hash Set
// Time: O(n), Space: O(1)
function firstMissingPositiveHash(nums: number[]): number {
    const n = nums.length;
    
    // Step 1: Handle edge cases and mark presence using array indices
    for (let i = 0; i < n; i++) {
        if (nums[i] <= 0 || nums[i] > n) {
            nums[i] = n + 1; // Mark as invalid
        }
    }
    
    // Step 2: Use sign to mark presence
    for (let i = 0; i < n; i++) {
        const num = Math.abs(nums[i]);
        if (num <= n) {
            nums[num - 1] = -Math.abs(nums[num - 1]);
        }
    }
    
    // Step 3: Find first positive index
    for (let i = 0; i < n; i++) {
        if (nums[i] > 0) {
            return i + 1;
        }
    }
    
    return n + 1;
}`,
        explanation:
          "Uses array indices and sign manipulation to mark presence of numbers. In-place approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Array as Hash Set
// Time: O(n), Space: O(1)
public int firstMissingPositiveHash(int[] nums) {
    int n = nums.length;
    
    // Step 1: Handle edge cases and mark presence using array indices
    for (int i = 0; i < n; i++) {
        if (nums[i] <= 0 || nums[i] > n) {
            nums[i] = n + 1; // Mark as invalid
        }
    }
    
    // Step 2: Use sign to mark presence
    for (int i = 0; i < n; i++) {
        int num = Math.abs(nums[i]);
        if (num <= n) {
            nums[num - 1] = -Math.abs(nums[num - 1]);
        }
    }
    
    // Step 3: Find first positive index
    for (int i = 0; i < n; i++) {
        if (nums[i] > 0) {
            return i + 1;
        }
    }
    
    return n + 1;
}`,
        explanation:
          "Java implementation using array as hash set. Uses negative marking to track seen positive numbers.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Set Approach
// Time: O(n), Space: O(n)
function firstMissingPositiveSet(nums: number[]): number {
    const numSet = new Set(nums);
    
    for (let i = 1; i <= nums.length + 1; i++) {
        if (!numSet.has(i)) {
            return i;
        }
    }
    
    return nums.length + 1;
}`,
        explanation:
          "Uses hash set to track seen numbers. Simple but uses extra space.",
      },
      {
        language: "Java",
        code: `// Approach 3: Set Approach
// Time: O(n), Space: O(n)
public int firstMissingPositiveSet(int[] nums) {
    Set<Integer> numSet = new HashSet<>();
    
    // Add all numbers to the set
    for (int num : nums) {
        numSet.add(num);
    }
    
    // Check for missing positive integers
    for (int i = 1; i <= nums.length + 1; i++) {
        if (!numSet.contains(i)) {
            return i;
        }
    }
    
    return nums.length + 1;
}`,
        explanation:
          "Java implementation using HashSet. Straightforward approach but uses O(n) extra space.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: Cyclic Sort (Optimal)
# Time: O(n), Space: O(1)
def first_missing_positive(nums):
    n = len(nums)
    
    # Step 1: Place each positive number i at index i-1
    for i in range(n):
        while (nums[i] > 0 and nums[i] <= n and 
               nums[nums[i] - 1] != nums[i]):
            nums[nums[i] - 1], nums[i] = nums[i], nums[nums[i] - 1]
    
    # Step 2: Find first missing positive
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    
    return n + 1`,
        explanation:
          "Cyclic sort places each positive number at its correct index, then finds first missing positive.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 2: Array as Hash Set
# Time: O(n), Space: O(1)
def first_missing_positive_hash(nums):
    n = len(nums)
    
    # Step 1: Handle edge cases and mark presence using array indices
    for i in range(n):
        if nums[i] <= 0 or nums[i] > n:
            nums[i] = n + 1  # Mark as invalid
    
    # Step 2: Use sign to mark presence
    for i in range(n):
        num = abs(nums[i])
        if num <= n:
            nums[num - 1] = -abs(nums[num - 1])
    
    # Step 3: Find first positive index
    for i in range(n):
        if nums[i] > 0:
            return i + 1
    
    return n + 1`,
        explanation:
          "Uses array indices and sign manipulation to mark presence of numbers. In-place approach.",
      },
      {
        language: "Python",
        approach: "moderate",
        code: `# Approach 3: Set Approach
# Time: O(n), Space: O(n)
def first_missing_positive_set(nums):
    num_set = set(nums)
    
    for i in range(1, len(nums) + 2):
        if i not in num_set:
            return i
    
    return len(nums) + 1`,
        explanation:
          "Uses hash set to track seen numbers. Simple but uses extra space.",
      },
    ],
    tips: [
      "Constraint: use O(1) extra space and O(n) time",
      "Key insight: answer is in range [1, n+1] where n = array length",
      "Cyclic sort places each number at its 'correct' position",
      "Use array indices as hash set by manipulating signs or values",
    ],
    tags: ["array", "hash-table", "cyclic-sort"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
