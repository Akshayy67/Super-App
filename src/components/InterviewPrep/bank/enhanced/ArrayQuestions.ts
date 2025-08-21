import { EnhancedQuestion } from "../../InterviewSubjects";

export const arrayQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-01",
    question: "Two Sum - Find two numbers that add up to target",
    category: "arrays",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use hash map to store numbers and their indices. For each number, check if target - number exists in map. If yes, return indices. If no, add current number to map. Time complexity: O(n), Space complexity: O(n).",
    tips: [
      "Explain the brute force approach first",
      "Discuss the hash map optimization",
      "Handle edge cases like duplicate numbers"
    ],
    tags: ["arrays", "hash-map", "two-pointers"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return []; // No solution found
}

// Alternative: Two pointer approach (if array is sorted)
function twoSumSorted(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const sum = nums[left] + nums[right];
        
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [];
}`,
        explanation: "Hash map approach provides O(n) solution by trading space for time. Two pointer approach works for sorted arrays with O(1) space.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n) hash map, O(1) two pointers",
        approach: "Hash Map / Two Pointers"
      },
      python: {
        solution: `def two_sum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []

def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    
    while left < right:
        current_sum = nums[left] + nums[right]
        
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []`,
        explanation: "Python implementation using dictionary for O(n) lookup. Enumerate provides clean index access.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Hash Map"
      },
      java: {
        solution: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        
        map.put(nums[i], i);
    }
    
    return new int[0]; // No solution found
}

public int[] twoSumSorted(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        
        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return new int[0];
}`,
        explanation: "Java implementation using HashMap for efficient lookups. Returns array indices as required.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Hash Map"
      }
    },
    algorithmSteps: [
      "Initialize hash map to store number -> index mapping",
      "Iterate through array once",
      "For each number, calculate complement (target - current)",
      "Check if complement exists in hash map",
      "If found, return stored index and current index",
      "If not found, store current number and index in map",
      "Continue until solution found or array exhausted"
    ],
    commonMistakes: [
      "Using nested loops instead of hash map (O(n²) solution)",
      "Not handling the case where no solution exists",
      "Returning the same index twice",
      "Not considering negative numbers or zero"
    ],
    optimizations: [
      "Hash map reduces time complexity from O(n²) to O(n)",
      "Two pointer approach for sorted arrays uses O(1) space",
      "Early return when solution found"
    ],
    relatedQuestions: ["Three Sum", "Four Sum", "Two Sum II - Input Array Is Sorted"]
  },

  {
    id: "dsa-02",
    question: "Best Time to Buy and Sell Stock",
    category: "arrays",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Track minimum price seen so far and maximum profit. For each price, calculate profit if selling today (current price - min price). Update max profit if current profit is greater. Update min price if current price is lower. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Explain the greedy approach",
      "Discuss why we track minimum price",
      "Handle edge cases like decreasing prices"
    ],
    tags: ["arrays", "greedy", "dynamic-programming"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function maxProfit(prices) {
    if (prices.length < 2) return 0;
    
    let minPrice = prices[0];
    let maxProfit = 0;
    
    for (let i = 1; i < prices.length; i++) {
        // Calculate profit if we sell today
        const currentProfit = prices[i] - minPrice;
        
        // Update max profit if current is better
        maxProfit = Math.max(maxProfit, currentProfit);
        
        // Update min price if current is lower
        minPrice = Math.min(minPrice, prices[i]);
    }
    
    return maxProfit;
}

// Alternative: More explicit tracking
function maxProfitExplicit(prices) {
    let buyPrice = prices[0];
    let profit = 0;
    
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] < buyPrice) {
            buyPrice = prices[i]; // Found better buy price
        } else {
            profit = Math.max(profit, prices[i] - buyPrice);
        }
    }
    
    return profit;
}`,
        explanation: "Greedy approach tracks the minimum price and maximum profit in single pass. Key insight: we want to buy at lowest price before selling.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Greedy Algorithm"
      },
      python: {
        solution: `def max_profit(prices):
    if len(prices) < 2:
        return 0
    
    min_price = prices[0]
    max_profit = 0
    
    for price in prices[1:]:
        # Calculate profit if selling today
        current_profit = price - min_price
        
        # Update max profit
        max_profit = max(max_profit, current_profit)
        
        # Update min price
        min_price = min(min_price, price)
    
    return max_profit

def max_profit_kadane(prices):
    """Using Kadane's algorithm approach"""
    max_profit = 0
    min_price = float('inf')
    
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    
    return max_profit`,
        explanation: "Python implementation with clean logic. Second version shows connection to Kadane's algorithm for maximum subarray.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Greedy Algorithm"
      },
      java: {
        solution: `public int maxProfit(int[] prices) {
    if (prices.length < 2) return 0;
    
    int minPrice = prices[0];
    int maxProfit = 0;
    
    for (int i = 1; i < prices.length; i++) {
        // Calculate profit if selling today
        int currentProfit = prices[i] - minPrice;
        
        // Update max profit
        maxProfit = Math.max(maxProfit, currentProfit);
        
        // Update min price
        minPrice = Math.min(minPrice, prices[i]);
    }
    
    return maxProfit;
}`,
        explanation: "Java implementation with efficient single-pass solution. Handles edge cases and maintains O(1) space complexity.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Greedy Algorithm"
      }
    },
    algorithmSteps: [
      "Initialize min price to first element",
      "Initialize max profit to 0",
      "Iterate through prices starting from second element",
      "For each price, calculate profit if selling today",
      "Update max profit if current profit is greater",
      "Update min price if current price is lower",
      "Return max profit after processing all prices"
    ],
    commonMistakes: [
      "Trying to find global minimum and maximum (doesn't work)",
      "Not handling edge case of decreasing prices",
      "Overthinking with complex algorithms when greedy works",
      "Forgetting that we can't sell before we buy"
    ],
    optimizations: [
      "Single pass solution is optimal",
      "Constant space usage",
      "Early termination not beneficial since we need to see all prices"
    ],
    relatedQuestions: ["Best Time to Buy and Sell Stock II", "Best Time to Buy and Sell Stock with Cooldown"]
  },

  {
    id: "dsa-03",
    question: "Contains Duplicate - Check if array has duplicate values",
    category: "arrays",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use Set data structure to track seen numbers. For each number, check if it's already in the set. If yes, return true. If no, add to set. Return false if no duplicates found. Time complexity: O(n), Space complexity: O(n). Alternative: sort array and check adjacent elements.",
    tips: [
      "Compare Set approach vs sorting approach",
      "Discuss space-time tradeoffs",
      "Mention early return optimization"
    ],
    tags: ["arrays", "hash-set", "sorting"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Hash Set approach
function containsDuplicate(nums) {
    const seen = new Set();
    
    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }
    
    return false;
}

// One-liner using Set size
function containsDuplicateOneLiner(nums) {
    return new Set(nums).size !== nums.length;
}

// Sorting approach
function containsDuplicateSort(nums) {
    nums.sort((a, b) => a - b);
    
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            return true;
        }
    }
    
    return false;
}`,
        explanation: "Set approach provides optimal time complexity with early return. Sorting approach trades time for space but modifies input array.",
        timeComplexity: "O(n) set, O(n log n) sorting",
        spaceComplexity: "O(n) set, O(1) sorting",
        approach: "Hash Set / Sorting"
      },
      python: {
        solution: `def contains_duplicate(nums):
    seen = set()
    
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    
    return False

def contains_duplicate_one_liner(nums):
    return len(set(nums)) != len(nums)

def contains_duplicate_sort(nums):
    nums.sort()
    
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return True
    
    return False`,
        explanation: "Python set operations are highly optimized. One-liner approach is concise but less efficient for early termination.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Hash Set"
      },
      java: {
        solution: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    
    for (int num : nums) {
        if (seen.contains(num)) {
            return true;
        }
        seen.add(num);
    }
    
    return false;
}

public boolean containsDuplicateSort(int[] nums) {
    Arrays.sort(nums);
    
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) {
            return true;
        }
    }
    
    return false;
}`,
        explanation: "Java HashSet provides O(1) average lookup time. Enhanced for loop improves readability.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Hash Set"
      }
    },
    algorithmSteps: [
      "Initialize empty set to track seen numbers",
      "Iterate through array once",
      "For each number, check if it exists in set",
      "If found, return true immediately",
      "If not found, add number to set",
      "If loop completes, return false (no duplicates)"
    ],
    commonMistakes: [
      "Using nested loops for O(n²) solution",
      "Not considering early return optimization",
      "Modifying input array without permission",
      "Not handling empty array edge case"
    ],
    optimizations: [
      "Set approach allows early termination",
      "One-liner approach for simple cases",
      "Sorting approach if space is constrained"
    ],
    relatedQuestions: ["Contains Duplicate II", "Contains Duplicate III", "Find All Duplicates in Array"]
  },

  {
    id: "dsa-04",
    question: "Product of Array Except Self",
    category: "arrays",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Create result array where result[i] contains product of all elements except nums[i]. First pass: calculate left products. Second pass: calculate right products and multiply with left products. Avoid division to handle zeros correctly. Time complexity: O(n), Space complexity: O(1) excluding output array.",
    tips: [
      "Explain why division approach doesn't work with zeros",
      "Show the two-pass approach clearly",
      "Discuss space optimization using output array"
    ],
    tags: ["arrays", "prefix-sum", "two-pass"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function productExceptSelf(nums) {
    const n = nums.length;
    const result = new Array(n);
    
    // First pass: calculate left products
    result[0] = 1;
    for (let i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Second pass: calculate right products and multiply
    let rightProduct = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= nums[i];
    }
    
    return result;
}

// Alternative with separate arrays for clarity
function productExceptSelfVerbose(nums) {
    const n = nums.length;
    const leftProducts = new Array(n);
    const rightProducts = new Array(n);
    
    // Calculate left products
    leftProducts[0] = 1;
    for (let i = 1; i < n; i++) {
        leftProducts[i] = leftProducts[i - 1] * nums[i - 1];
    }
    
    // Calculate right products
    rightProducts[n - 1] = 1;
    for (let i = n - 2; i >= 0; i--) {
        rightProducts[i] = rightProducts[i + 1] * nums[i + 1];
    }
    
    // Multiply left and right products
    const result = [];
    for (let i = 0; i < n; i++) {
        result[i] = leftProducts[i] * rightProducts[i];
    }
    
    return result;
}`,
        explanation: "Two-pass approach calculates left and right products separately. Space-optimized version uses output array to store intermediate results.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) excluding output",
        approach: "Prefix/Suffix Products"
      },
      python: {
        solution: `def product_except_self(nums):
    n = len(nums)
    result = [1] * n
    
    # First pass: calculate left products
    for i in range(1, n):
        result[i] = result[i - 1] * nums[i - 1]
    
    # Second pass: calculate right products and multiply
    right_product = 1
    for i in range(n - 1, -1, -1):
        result[i] *= right_product
        right_product *= nums[i]
    
    return result

def product_except_self_verbose(nums):
    n = len(nums)
    left_products = [1] * n
    right_products = [1] * n
    
    # Calculate left products
    for i in range(1, n):
        left_products[i] = left_products[i - 1] * nums[i - 1]
    
    # Calculate right products
    for i in range(n - 2, -1, -1):
        right_products[i] = right_products[i + 1] * nums[i + 1]
    
    # Combine results
    return [left_products[i] * right_products[i] for i in range(n)]`,
        explanation: "Python implementation with list comprehension for final result. Clean range syntax for reverse iteration.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) excluding output",
        approach: "Prefix/Suffix Products"
      },
      java: {
        solution: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    
    // First pass: calculate left products
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Second pass: calculate right products and multiply
    int rightProduct = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= nums[i];
    }
    
    return result;
}`,
        explanation: "Java implementation following the space-optimized approach. Uses output array efficiently to minimize space usage.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Prefix/Suffix Products"
      }
    },
    algorithmSteps: [
      "Initialize result array with same length as input",
      "First pass: calculate left products (product of all elements to the left)",
      "Store left products in result array",
      "Second pass: calculate right products on the fly",
      "Multiply each position with corresponding right product",
      "Return result array containing products except self"
    ],
    commonMistakes: [
      "Trying to use division (fails with zeros)",
      "Not handling edge cases like single element",
      "Using extra space when output array can store intermediate results",
      "Incorrect index calculations in prefix/suffix computation"
    ],
    optimizations: [
      "Use output array to store intermediate results",
      "Single variable for right product calculation",
      "Avoid division to handle zeros naturally"
    ],
    relatedQuestions: ["Product of Array Except Self II", "Maximum Product Subarray", "Subarray Product Less Than K"]
  }
];