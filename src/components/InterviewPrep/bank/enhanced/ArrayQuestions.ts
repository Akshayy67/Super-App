import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedArrayQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-1",
    question: "Find two numbers in an array that add up to a target sum (Two Sum)",
    category: "arrays",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use a hash map to store numbers and their indices. For each element, check if (target - current element) exists in the hash map. If yes, return the indices. If no, add current element to hash map. Time complexity: O(n), Space complexity: O(n).",
    tips: [
      "Consider using a hash map for O(1) lookup",
      "Handle edge cases like duplicate numbers",
      "Discuss brute force vs optimized approach"
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
    
    return [];
}`,
        explanation: "We iterate through the array once, storing each number and its index in a hash map. For each element, we calculate what number we need to reach the target and check if it exists in our map.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Hash Map"
      },
      python: {
        solution: `def two_sum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []`,
        explanation: "Python implementation using dictionary for O(1) lookups. We store each number as key and index as value.",
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
    
    return new int[]{};
}`,
        explanation: "Java implementation using HashMap for efficient lookups. We check for complement before adding current element to avoid using same element twice.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Hash Map"
      }
    },
    algorithmSteps: [
      "Create a hash map to store numbers and their indices",
      "Iterate through the array",
      "For each element, calculate the complement (target - current element)",
      "Check if complement exists in hash map",
      "If found, return the indices",
      "If not found, add current element and index to hash map",
      "Continue until solution found"
    ],
    commonMistakes: [
      "Using the same element twice",
      "Not handling edge cases like empty array",
      "Forgetting to return indices instead of values",
      "Not considering negative numbers"
    ],
    optimizations: [
      "Single pass instead of nested loops",
      "Hash map provides O(1) lookup instead of O(n) search",
      "Early termination when solution found"
    ],
    relatedQuestions: ["Three Sum", "Four Sum", "Two Sum II - Input array is sorted"]
  },

  {
    id: "dsa-2",
    question: "Find the maximum subarray sum (Kadane's Algorithm)",
    category: "arrays",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use Kadane's algorithm: maintain a running sum, reset to 0 when it becomes negative, and track the maximum sum seen so far. The key insight is that a negative prefix doesn't help maximize the sum. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Explain the intuition behind Kadane's algorithm",
      "Handle all negative numbers case",
      "Discuss dynamic programming approach"
    ],
    tags: ["arrays", "dynamic-programming", "kadane"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        // Either extend existing subarray or start new one
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`,
        explanation: "Kadane's algorithm maintains the maximum sum ending at current position. If current sum becomes negative, we start fresh from current element.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Dynamic Programming (Kadane's Algorithm)"
      },
      python: {
        solution: `def max_subarray(nums):
    max_sum = current_sum = nums[0]
    
    for i in range(1, len(nums)):
        # Either extend existing subarray or start new one
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum`,
        explanation: "Python implementation of Kadane's algorithm. We keep track of maximum sum ending at current position and global maximum.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Dynamic Programming (Kadane's Algorithm)"
      },
      java: {
        solution: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        // Either extend existing subarray or start new one
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`,
        explanation: "Java implementation using Kadane's algorithm. The key insight is that any subarray with negative sum should be discarded.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Dynamic Programming (Kadane's Algorithm)"
      }
    },
    algorithmSteps: [
      "Initialize maxSum and currentSum with first element",
      "Iterate through array starting from second element",
      "For each element, decide whether to extend existing subarray or start new one",
      "Update currentSum to max of (current element, currentSum + current element)",
      "Update maxSum if currentSum is greater",
      "Continue until end of array",
      "Return maxSum"
    ],
    commonMistakes: [
      "Not handling all negative numbers case",
      "Forgetting to update global maximum",
      "Starting currentSum with 0 instead of first element",
      "Not understanding when to start a new subarray"
    ],
    optimizations: [
      "Single pass through array",
      "Constant space complexity",
      "No need for nested loops or additional data structures"
    ],
    relatedQuestions: ["Maximum Product Subarray", "Circular Array Maximum Sum", "Best Time to Buy and Sell Stock"]
  },

  {
    id: "dsa-74",
    question: "Trapping rain water",
    category: "arrays",
    difficulty: "hard",
    type: "technical",
    sampleAnswer: "Multiple approaches: 1) For each position, water level = min(max_left, max_right) - current_height. 2) Two pointers: move pointer with smaller max inward, water trapped is determined by smaller max. 3) Stack-based: store indices of bars, calculate water when finding taller bar. Two pointers approach is most elegant with O(1) space.",
    tips: [
      "Visualize the water trapping concept",
      "Explain the two-pointer logic",
      "Compare space-time tradeoffs of different approaches"
    ],
    tags: ["arrays", "two-pointers", "water-trapping"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function trap(height) {
    if (height.length < 3) return 0;
    
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
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
        explanation: "Two pointers approach: we move the pointer with smaller maximum height inward, as water level is determined by the smaller of the two maximums.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Two Pointers"
      },
      python: {
        solution: `def trap(height):
    if len(height) < 3:
        return 0
    
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    
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
        explanation: "Python implementation using two pointers. We maintain maximum heights from both sides and calculate trapped water.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Two Pointers"
      },
      java: {
        solution: `public int trap(int[] height) {
    if (height.length < 3) return 0;
    
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0;
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
        explanation: "Java implementation with two pointers. The algorithm ensures we always have a valid boundary to trap water.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Two Pointers"
      }
    },
    algorithmSteps: [
      "Initialize two pointers at start and end of array",
      "Maintain maximum heights seen from left and right",
      "Move pointer with smaller maximum height inward",
      "If current height is less than its maximum, add trapped water",
      "If current height is greater or equal, update maximum",
      "Continue until pointers meet",
      "Return total trapped water"
    ],
    commonMistakes: [
      "Not understanding why two pointers work",
      "Incorrect water calculation formula",
      "Not handling edge cases like arrays with length < 3",
      "Confusing left and right maximum updates"
    ],
    optimizations: [
      "Single pass with constant space",
      "No need for preprocessing arrays",
      "Efficient compared to brute force O(n²) approach"
    ],
    relatedQuestions: ["Container With Most Water", "Largest Rectangle in Histogram", "Rain Water Trapping 2D"]
  }
];