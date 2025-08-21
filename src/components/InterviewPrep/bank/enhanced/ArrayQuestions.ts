import { Question } from "../../InterviewSubjects";

// Enhanced Array DSA Questions with comprehensive implementations
export const enhancedArrayQuestions: Question[] = [
  {
    id: "enhanced-array-1",
    question: "Two Sum - Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Approach 1: Hash Map (Optimal)
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
}

// Approach 2: Brute Force
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
    tips: [
      "Hash map approach trades space for time efficiency",
      "Consider edge cases: empty array, no solution, duplicate numbers",
      "Explain why we can't use the same element twice",
      "Discuss follow-up: what if array is sorted?"
    ],
    tags: ["array", "hash-table", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-2",
    question: "Best Time to Buy and Sell Stock - You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Single Pass Solution
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
}

// Alternative: Dynamic Programming approach
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
    tips: [
      "Track minimum price seen so far and maximum profit",
      "Only one transaction allowed (buy once, sell once)",
      "Consider edge cases: empty array, single element, decreasing prices",
      "Explain the greedy approach: buy at lowest price before selling"
    ],
    tags: ["array", "dynamic-programming", "greedy"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-3",
    question: "Contains Duplicate - Given an integer array nums, return true if any value appears at least twice in the array.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Approach 1: Hash Set (Optimal)
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
}

// Approach 2: Sorting
// Time: O(n log n), Space: O(1)
function containsDuplicateSort(nums: number[]): boolean {
    nums.sort((a, b) => a - b);
    
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            return true;
        }
    }
    
    return false;
}

// Approach 3: Length comparison (Most concise)
function containsDuplicateConcise(nums: number[]): boolean {
    return new Set(nums).size !== nums.length;
}`,
    tips: [
      "Hash set provides optimal time complexity",
      "Sorting approach uses less space but slower",
      "Set size comparison is most concise but creates entire set",
      "Consider memory constraints for very large arrays"
    ],
    tags: ["array", "hash-table", "sorting"],
    estimatedTime: 10,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-4",
    question: "Product of Array Except Self - Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i].",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Optimal Solution: Two passes without division
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
}

// Alternative: Left and Right arrays (easier to understand)
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
    tips: [
      "Cannot use division operator (constraint)",
      "Two-pass approach: left products, then right products",
      "Optimize space by using result array for left products",
      "Consider edge cases: zeros in array, single element"
    ],
    tags: ["array", "prefix-sum"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-5",
    question: "Maximum Subarray (Kadane's Algorithm) - Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Kadane's Algorithm - Optimal Solution
// Time: O(n), Space: O(1)
function maxSubArray(nums: number[]): number {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

// Alternative: Return indices of the subarray
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
}

// Divide and Conquer approach
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
    tips: [
      "Kadane's algorithm is the optimal O(n) solution",
      "Key insight: at each position, decide whether to extend or start new subarray",
      "Handle all negative numbers case",
      "Can be extended to return actual subarray indices"
    ],
    tags: ["array", "dynamic-programming", "divide-and-conquer"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-6",
    question: "Merge Intervals - Given an array of intervals, merge all overlapping intervals.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Optimal Solution: Sort then merge
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
}

// Alternative: Using reduce
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
    tips: [
      "Sort intervals by start time first",
      "Compare current interval start with previous interval end",
      "Merge by updating the end time to maximum of both intervals",
      "Handle edge cases: empty array, single interval, no overlaps"
    ],
    tags: ["array", "sorting", "intervals"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-7",
    question: "Rotate Array - Given an array, rotate the array to the right by k steps, where k is non-negative.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Reverse Method (Optimal)
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
}

// Approach 2: Extra Array
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
}

// Approach 3: Cyclic Replacements
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
    tips: [
      "Reverse method is most elegant: reverse all, then reverse parts",
      "Handle k > array length with modulo operation",
      "Cyclic replacement handles cases where gcd(n, k) > 1",
      "Consider space constraints: in-place vs extra space trade-off"
    ],
    tags: ["array", "two-pointers", "math"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-8",
    question: "3Sum - Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Two Pointers Approach after sorting
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
}

// Alternative: Hash Set approach (less efficient)
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
    tips: [
      "Sort array first to enable two-pointer technique",
      "Skip duplicates to avoid duplicate triplets",
      "Fix first element, then use two pointers for remaining two",
      "Time complexity dominated by sorting step"
    ],
    tags: ["array", "two-pointers", "sorting"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-9",
    question: "Container With Most Water - Given n non-negative integers representing heights, find two lines that form a container holding the most water.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Two Pointers Approach (Optimal)
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
}

// Brute Force Approach (for comparison)
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
    tips: [
      "Two pointers start at both ends and move inward",
      "Always move the pointer with smaller height",
      "Area = width × min(height[left], height[right])",
      "Greedy approach: moving smaller height might find better solution"
    ],
    tags: ["array", "two-pointers", "greedy"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-10",
    question: "Find Minimum in Rotated Sorted Array - Suppose an array of length n sorted in ascending order is rotated. Find the minimum element.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Binary Search Approach (Optimal)
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
}

// Handle duplicates version
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
}

// Linear scan (fallback)
function findMinLinear(nums: number[]): number {
    return Math.min(...nums);
}`,
    tips: [
      "Use binary search to achieve O(log n) time complexity",
      "Compare mid with right (not left) to determine rotation point",
      "Handle duplicates by decrementing right pointer",
      "Original array was sorted, rotation creates at most one 'break' point"
    ],
    tags: ["array", "binary-search"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];