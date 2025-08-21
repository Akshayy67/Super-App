import { Question } from "../../InterviewSubjects";

// Enhanced Array DSA Questions with comprehensive implementations
export const enhancedArrayQuestions: Question[] = [
  {
    id: "enhanced-array-1",
    question: "Two Sum - Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach: "There are two main approaches: 1) Brute Force (O(n²)): Check every pair - simple but inefficient. 2) Hash Map (O(n)): Use a hash map to store complements. For each element, check if its complement (target - current) exists in the map. The hash map approach is optimal, trading space for time efficiency.",
    codeImplementation: [
      {
        language: "TypeScript",
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
        explanation: "Hash map stores each number with its index. For each element, we check if its complement exists in the map."
      },
      {
        language: "TypeScript",
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
        explanation: "Brute force checks every possible pair. Simple but inefficient for large arrays."
      }
    ],
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
    type: "technical",
    approach: "Track the minimum price seen so far and calculate profit at each step. Two approaches: 1) Single Pass: Keep track of minimum price and maximum profit as we iterate. 2) Dynamic Programming: Maintain states for buying and selling. The single pass approach is optimal with O(n) time and O(1) space.",
    codeImplementation: [
      {
        language: "TypeScript",
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
        explanation: "Track minimum price and calculate profit at each step. Greedy approach ensures we buy at the lowest price before selling."
      },
      {
        language: "TypeScript",
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
        explanation: "DP approach maintains states for buying and selling. Buy represents max profit after buying, sell represents max profit after selling."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Hash Set (O(n) time, O(n) space): Check each element against a set of seen values. 2) Sorting (O(n log n) time, O(1) space): Sort array and check adjacent elements. 3) Set Size Comparison: Create a set and compare its size to the original array length. Hash set approach is optimal for time complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
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
        explanation: "Use a Set to track seen numbers. Return true immediately when we find a duplicate."
      },
      {
        language: "TypeScript",
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
        explanation: "Sort the array first, then check adjacent elements for duplicates. Uses less space but slower due to sorting."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Length comparison (Most concise)
// Time: O(n), Space: O(n)
function containsDuplicateConcise(nums: number[]): boolean {
    return new Set(nums).size !== nums.length;
}`,
        explanation: "Create a Set from the array. If the set size is different from array length, there are duplicates."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Two Passes (O(n) time, O(1) space): Calculate left products first, then multiply by right products. 2) Left and Right Arrays (O(n) time, O(n) space): Create separate arrays for left and right products, then combine. 3) Division Method (O(n) time, O(1) space): Calculate total product and divide by each element (not allowed in this problem). The two-pass approach is optimal for space complexity.",
    codeImplementation: [
      {
        language: "TypeScript",
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
        explanation: "Two-pass approach: first calculate left products, then multiply by right products. Most space efficient."
      },
      {
        language: "TypeScript",
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
        explanation: "Creates separate arrays for left and right products. Easier to understand but uses more space."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Division Method (Not allowed in this problem)
// Time: O(n), Space: O(1)
function productExceptSelfDivision(nums: number[]): number[] {
    const totalProduct = nums.reduce((acc, num) => acc * num, 1);
    return nums.map(num => totalProduct / num);
}`,
        explanation: "Division method is simple but not allowed in this problem. Shows why we need alternative approaches."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Kadane's Algorithm (O(n) time, O(1) space): Track maximum sum ending at each position and global maximum. 2) Return Indices: Extend Kadane's to return start and end indices of the subarray. 3) Divide and Conquer (O(n log n) time, O(log n) space): Split array and find maximum of left, right, and crossing subarrays. Kadane's algorithm is optimal for time complexity.",
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
        explanation: "Kadane's algorithm tracks maximum sum ending at each position and global maximum. Optimal O(n) solution."
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
        explanation: "Extended Kadane's algorithm that returns the start and end indices of the maximum subarray."
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
        explanation: "Divide and conquer approach splits array and finds maximum of left, right, and crossing subarrays."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Sort and Merge (O(n log n) time, O(n) space): Sort intervals by start time, then merge overlapping ones. 2) Using Reduce (O(n log n) time, O(n) space): Functional approach using reduce method. 3) In-place Merging (O(n log n) time, O(1) space): Modify intervals array in place. The sort and merge approach is most intuitive and commonly used.",
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
        explanation: "Sort intervals by start time first, then merge overlapping ones. Most intuitive approach."
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
        explanation: "Functional approach using reduce method. Same logic but more functional programming style."
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
        explanation: "In-place merging modifies the original array. More space efficient but modifies input."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Reverse Method (O(n) time, O(1) space): Reverse entire array, then reverse first k and remaining elements. 2) Extra Array (O(n) time, O(n) space): Use temporary array to store rotated elements. 3) Cyclic Replacements (O(n) time, O(1) space): Move elements in cycles. The reverse method is most elegant and commonly used in interviews.",
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
        explanation: "Reverse method: reverse all, then reverse first k and remaining elements. Most elegant approach."
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
        explanation: "Uses temporary array to store rotated elements. Simple to understand but uses extra space."
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
        explanation: "Moves elements in cycles. Handles cases where gcd(n, k) > 1. In-place but more complex."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Two Pointers (O(n²) time, O(1) space): Sort array, fix first element, use two pointers for remaining two. 2) Hash Set (O(n²) time, O(n) space): Use hash set to find complement of two numbers. 3) Brute Force (O(n³) time, O(1) space): Check all possible triplets. Two pointers approach is most efficient and commonly used.",
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
        explanation: "Sort array first, then use two pointers technique. Most efficient approach for 3Sum problem."
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
        explanation: "Uses hash set to find complement. Less efficient due to duplicate checking and string operations."
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
        explanation: "Brute force checks all possible triplets. Simple but very inefficient for large arrays."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Two Pointers (O(n) time, O(1) space): Start from both ends, move pointer with smaller height inward. 2) Brute Force (O(n²) time, O(1) space): Check all possible pairs of lines. 3) Dynamic Programming (O(n) time, O(n) space): Track maximum area ending at each position. Two pointers approach is optimal and most commonly used.",
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
        explanation: "Two pointers start at both ends and move inward. Always move the pointer with smaller height."
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
        explanation: "Checks all possible pairs of lines. Simple to understand but inefficient for large arrays."
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
        explanation: "Dynamic programming approach that tracks maximum area ending at each position."
      }
    ],
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
    type: "technical",
    approach: "Multiple approaches available: 1) Binary Search (O(log n) time, O(1) space): Compare mid element with right element to determine rotation point. 2) Handle Duplicates: Modified binary search for arrays with duplicate elements. 3) Linear Scan (O(n) time, O(1) space): Simple fallback approach. Binary search is optimal for time complexity.",
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
        explanation: "Binary search approach compares mid element with right element to determine rotation point."
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
        explanation: "Modified binary search that handles arrays with duplicate elements by decrementing right pointer."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Linear Scan (Fallback)
// Time: O(n), Space: O(1)
function findMinLinear(nums: number[]): number {
    return Math.min(...nums);
}`,
        explanation: "Simple linear scan approach. Used as fallback when binary search complexity is not needed."
      }
    ],
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
  },
  {
    id: "enhanced-array-11",
    question: "4Sum - Given an array nums of n integers, return an array of all unique quadruplets that sum to target.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Two Pointers (O(n³) time, O(1) space): Extension of 3Sum with additional nested loop. 2) Hash Map (O(n³) time, O(n) space): Use hash set to find complement of three numbers. 3) Brute Force (O(n⁴) time, O(1) space): Check all possible quadruplets. Two pointers approach is most efficient and commonly used.",
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
        explanation: "Extension of 3Sum with additional nested loop. Uses two pointers for innermost pair."
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
        explanation: "Uses hash set to find complement of three numbers. Alternative approach to two pointers."
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
        explanation: "Brute force checks all possible quadruplets. Simple but very inefficient for large arrays."
      }
    ],
    tips: [
      "Extension of 3Sum with additional nested loop",
      "Sort array first to enable duplicate skipping",
      "Use two pointers for innermost pair",
      "Skip duplicates at all levels to avoid duplicate quadruplets"
    ],
    tags: ["array", "two-pointers", "sorting", "hash-table"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-12",
    question: "Trapping Rain Water - Given n non-negative integers representing elevation map, compute how much water it can trap after raining.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Two Pointers (O(n) time, O(1) space): Track left and right maximum heights, move pointer with smaller height. 2) Dynamic Programming (O(n) time, O(n) space): Pre-compute left and right maximum heights for each position. 3) Stack (O(n) time, O(n) space): Process water layer by layer using stack. Two pointers approach is most space efficient.",
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
        explanation: "Two pointers approach tracks left and right maximum heights. Most space efficient solution."
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
        explanation: "DP approach pre-computes left and right maximum heights for each position."
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
        explanation: "Stack approach processes water layer by layer. More complex but shows different perspective."
      }
    ],
    tips: [
      "Water level at position = min(max_left, max_right) - height[i]",
      "Two pointers approach is most space efficient",
      "DP approach pre-computes max heights for each position",
      "Stack approach processes water layer by layer"
    ],
    tags: ["array", "two-pointers", "dynamic-programming", "stack"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-13",
    question: "Subarray Sum Equals K - Given an array of integers and integer k, find total number of continuous subarrays whose sum equals k.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Prefix Sum with Hash Map (O(n) time, O(n) space): Use prefix sums to convert to two-sum problem. 2) Brute Force (O(n²) time, O(1) space): Check all possible subarrays. 3) Return Actual Subarrays: Modified version that returns the actual subarrays instead of just count. Prefix sum approach is optimal for time complexity.",
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
        explanation: "Uses prefix sums to convert to two-sum problem. Hash map tracks frequency of prefix sums seen."
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
        explanation: "Checks all possible subarrays. Simple to understand but inefficient for large arrays."
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
        explanation: "Modified version that returns the actual subarrays instead of just count."
      }
    ],
    tips: [
      "Use prefix sum to convert to two-sum problem",
      "Hash map tracks frequency of prefix sums seen so far",
      "Key insight: sum[i,j] = prefixSum[j] - prefixSum[i-1]",
      "Handle empty subarray case by initializing map with (0,1)"
    ],
    tags: ["array", "hash-table", "prefix-sum"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
    {
    id: "enhanced-array-14",
    question: "Next Permutation - Implement next permutation, which rearranges numbers into the lexicographically next greater permutation.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) In-place Algorithm (O(n) time, O(1) space): Find pivot, swap with next greater element, reverse suffix. 2) Generate All Permutations: Backtracking approach to generate all permutations (for understanding). 3) Lexicographic Order: Sort permutations and find next one. The in-place algorithm is optimal and most commonly used.",
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
        explanation: "In-place algorithm: find pivot, swap with next greater element, then reverse suffix."
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
        explanation: "Backtracking approach to generate all permutations. Used for understanding the concept."
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
        explanation: "Sorts all permutations and finds next one. Not efficient but shows lexicographic concept."
      }
    ],
    tips: [
      "Find rightmost character that is smaller than character next to it",
      "Find smallest character to right that's larger than pivot",
      "Swap pivot with that character, then reverse suffix",
      "If no such character exists, array is largest permutation"
    ],
    tags: ["array", "two-pointers", "math"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-15",
    question: "Sliding Window Maximum - Given array and sliding window of size k, return max element in each window position.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Deque (O(n) time, O(k) space): Maintain decreasing order of values in deque, front always contains maximum. 2) Brute Force (O(n * k) time, O(1) space): Check maximum in each window. 3) Max Heap (O(n log k) time, O(k) space): Use priority queue to track maximum. Deque approach is optimal for time complexity.",
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
        explanation: "Deque maintains indices in decreasing order of values. Front always contains maximum of current window."
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
        explanation: "Checks maximum in each window. Simple to understand but inefficient for large windows."
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
        explanation: "Uses priority queue to track maximum. Alternative approach with different time complexity trade-offs."
      }
    ],
    tips: [
      "Deque maintains indices in decreasing order of values",
      "Front of deque always contains maximum of current window",
      "Remove indices outside window and smaller elements",
      "Each element is added and removed at most once"
    ],
    tags: ["array", "sliding-window", "deque", "heap"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-array-16",
    question: "First Missing Positive - Given unsorted integer array, find the smallest missing positive integer.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Cyclic Sort (O(n) time, O(1) space): Place each positive number at its correct index, then find first missing. 2) Array as Hash Set (O(n) time, O(1) space): Use array indices and sign manipulation to mark presence. 3) Set Approach (O(n) time, O(n) space): Use hash set to track seen numbers. Cyclic sort approach is optimal for space constraints.",
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
        explanation: "Cyclic sort places each positive number at its correct index, then finds first missing positive."
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
        explanation: "Uses array indices and sign manipulation to mark presence of numbers. In-place approach."
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
        explanation: "Uses hash set to track seen numbers. Simple but uses extra space."
      }
    ],
    tips: [
      "Constraint: use O(1) extra space and O(n) time",
      "Key insight: answer is in range [1, n+1] where n = array length",
      "Cyclic sort places each number at its 'correct' position",
      "Use array indices as hash set by manipulating signs or values"
    ],
    tags: ["array", "hash-table", "cyclic-sort"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];