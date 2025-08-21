import { Question, CodeImplementation } from "../InterviewSubjects";

// Enhanced DSA Questions with code implementations
// Top 75 most asked DSA interview questions with multiple solution approaches

export const enhancedDSAQuestions: Question[] = [
  // Array Questions
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
    codeImplementations: [
      {
        language: "pseudo",
        approach: "brute-force",
        code: `ALGORITHM TwoSum_BruteForce(nums, target)
INPUT: nums[] - array of integers, target - target sum
OUTPUT: indices of two numbers that sum to target

FOR i = 0 to length(nums) - 2
    FOR j = i + 1 to length(nums) - 1
        IF nums[i] + nums[j] == target
            RETURN [i, j]
        END IF
    END FOR
END FOR
RETURN []  // No solution found`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Check every pair of numbers by nested loops. Simple but inefficient for large arrays."
      },
      {
        language: "pseudo",
        approach: "optimal",
        code: `ALGORITHM TwoSum_HashMap(nums, target)
INPUT: nums[] - array of integers, target - target sum
OUTPUT: indices of two numbers that sum to target

CREATE hashMap = empty map
FOR i = 0 to length(nums) - 1
    complement = target - nums[i]
    IF complement EXISTS IN hashMap
        RETURN [hashMap[complement], i]
    END IF
    hashMap[nums[i]] = i
END FOR
RETURN []  // No solution found`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Use hash map to store seen numbers and their indices. Check if complement exists in single pass."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length - 1; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[0]; // No solution found
}`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Nested loops to check all pairs. Simple implementation but inefficient."
      },
      {
        language: "java",
        approach: "optimal",
        code: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    
    return new int[0]; // No solution found
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "HashMap provides O(1) average lookup time. Single pass through array."
      },
      {
        language: "python",
        approach: "brute-force",
        code: `def two_sum(nums, target):
    """
    Find two numbers that add up to target using brute force
    """
    for i in range(len(nums) - 1):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []  # No solution found`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Check every possible pair using nested loops. Straightforward but slow."
      },
      {
        language: "python",
        approach: "optimal",
        code: `def two_sum(nums, target):
    """
    Find two numbers that add up to target using hash map
    """
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    
    return []  # No solution found`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Dictionary provides O(1) average lookup. Most efficient solution for this problem."
      }
    ]
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
    codeImplementations: [
      {
        language: "pseudo",
        approach: "brute-force",
        code: `ALGORITHM MaxSubarray_BruteForce(nums)
INPUT: nums[] - array of integers
OUTPUT: maximum sum of any contiguous subarray

maxSum = negative infinity
FOR i = 0 to length(nums) - 1
    FOR j = i to length(nums) - 1
        currentSum = 0
        FOR k = i to j
            currentSum = currentSum + nums[k]
        END FOR
        maxSum = MAX(maxSum, currentSum)
    END FOR
END FOR
RETURN maxSum`,
        timeComplexity: "O(n³)",
        spaceComplexity: "O(1)",
        explanation: "Check all possible subarrays by trying every start and end position. Very inefficient."
      },
      {
        language: "pseudo",
        approach: "moderate",
        code: `ALGORITHM MaxSubarray_Optimized(nums)
INPUT: nums[] - array of integers
OUTPUT: maximum sum of any contiguous subarray

maxSum = negative infinity
FOR i = 0 to length(nums) - 1
    currentSum = 0
    FOR j = i to length(nums) - 1
        currentSum = currentSum + nums[j]
        maxSum = MAX(maxSum, currentSum)
    END FOR
END FOR
RETURN maxSum`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Optimize by calculating sum incrementally instead of recalculating from scratch."
      },
      {
        language: "pseudo",
        approach: "optimal",
        code: `ALGORITHM MaxSubarray_Kadane(nums)
INPUT: nums[] - array of integers
OUTPUT: maximum sum of any contiguous subarray

maxSum = nums[0]
currentSum = nums[0]

FOR i = 1 to length(nums) - 1
    currentSum = MAX(nums[i], currentSum + nums[i])
    maxSum = MAX(maxSum, currentSum)
END FOR
RETURN maxSum`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Kadane's algorithm: at each position, decide whether to start new subarray or extend current one."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `public int maxSubArray(int[] nums) {
    int maxSum = Integer.MIN_VALUE;
    
    for (int i = 0; i < nums.length; i++) {
        for (int j = i; j < nums.length; j++) {
            int currentSum = 0;
            for (int k = i; k <= j; k++) {
                currentSum += nums[k];
            }
            maxSum = Math.max(maxSum, currentSum);
        }
    }
    
    return maxSum;
}`,
        timeComplexity: "O(n³)",
        spaceComplexity: "O(1)",
        explanation: "Triple nested loops to check all subarrays. Inefficient but easy to understand."
      },
      {
        language: "java",
        approach: "moderate",
        code: `public int maxSubArray(int[] nums) {
    int maxSum = Integer.MIN_VALUE;
    
    for (int i = 0; i < nums.length; i++) {
        int currentSum = 0;
        for (int j = i; j < nums.length; j++) {
            currentSum += nums[j];
            maxSum = Math.max(maxSum, currentSum);
        }
    }
    
    return maxSum;
}`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Two nested loops with incremental sum calculation. Better than brute force."
      },
      {
        language: "java",
        approach: "optimal",
        code: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Kadane's algorithm implementation. Optimal solution with single pass."
      },
      {
        language: "python",
        approach: "brute-force",
        code: `def max_subarray(nums):
    """
    Find maximum subarray sum using brute force
    """
    max_sum = float('-inf')
    
    for i in range(len(nums)):
        for j in range(i, len(nums)):
            current_sum = sum(nums[i:j+1])
            max_sum = max(max_sum, current_sum)
    
    return max_sum`,
        timeComplexity: "O(n³)",
        spaceComplexity: "O(1)",
        explanation: "Check all subarrays using slicing. Python's sum() adds another O(n) factor."
      },
      {
        language: "python",
        approach: "moderate",
        code: `def max_subarray(nums):
    """
    Find maximum subarray sum with optimized brute force
    """
    max_sum = float('-inf')
    
    for i in range(len(nums)):
        current_sum = 0
        for j in range(i, len(nums)):
            current_sum += nums[j]
            max_sum = max(max_sum, current_sum)
    
    return max_sum`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Avoid recalculating sum by maintaining running total."
      },
      {
        language: "python",
        approach: "optimal",
        code: `def max_subarray(nums):
    """
    Find maximum subarray sum using Kadane's algorithm
    """
    max_sum = current_sum = nums[0]
    
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Kadane's algorithm: optimal solution with linear time complexity."
      }
    ]
  },

  {
    id: "dsa-3",
    question: "Rotate an array to the right by k steps",
    category: "arrays",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Three approaches: 1) Extra space: create new array with elements at correct positions. 2) Reverse approach: reverse entire array, then reverse first k elements, then reverse remaining elements. 3) Cyclic replacements: move elements to their final positions in cycles. Reverse approach is most elegant with O(1) space.",
    tips: [
      "Consider k > array length case",
      "Discuss in-place vs extra space solutions",
      "Explain the reverse method step by step"
    ],
    tags: ["arrays", "rotation", "reverse"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: [
      {
        language: "pseudo",
        approach: "brute-force",
        code: `ALGORITHM RotateArray_BruteForce(nums, k)
INPUT: nums[] - array to rotate, k - steps to rotate right
OUTPUT: rotated array

n = length(nums)
k = k MOD n  // Handle k > n case

FOR step = 1 to k
    temp = nums[n-1]  // Store last element
    FOR i = n-1 down to 1
        nums[i] = nums[i-1]  // Shift each element right
    END FOR
    nums[0] = temp  // Place last element at start
END FOR`,
        timeComplexity: "O(k × n)",
        spaceComplexity: "O(1)",
        explanation: "Rotate one step at a time by shifting all elements. Inefficient for large k."
      },
      {
        language: "pseudo",
        approach: "moderate",
        code: `ALGORITHM RotateArray_ExtraSpace(nums, k)
INPUT: nums[] - array to rotate, k - steps to rotate right
OUTPUT: rotated array

n = length(nums)
k = k MOD n  // Handle k > n case
result = new array of size n

FOR i = 0 to n-1
    newIndex = (i + k) MOD n
    result[newIndex] = nums[i]
END FOR

COPY result back to nums`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Calculate final position for each element directly. Uses extra space but efficient."
      },
      {
        language: "pseudo",
        approach: "optimal",
        code: `ALGORITHM RotateArray_Reverse(nums, k)
INPUT: nums[] - array to rotate, k - steps to rotate right
OUTPUT: rotated array in-place

n = length(nums)
k = k MOD n  // Handle k > n case

REVERSE(nums, 0, n-1)      // Reverse entire array
REVERSE(nums, 0, k-1)      // Reverse first k elements  
REVERSE(nums, k, n-1)      // Reverse remaining elements

FUNCTION REVERSE(arr, start, end)
    WHILE start < end
        SWAP arr[start] and arr[end]
        start = start + 1
        end = end - 1
    END WHILE`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Three reversal operations achieve rotation in-place. Most elegant solution."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `public void rotate(int[] nums, int k) {
    int n = nums.length;
    k = k % n; // Handle k > n
    
    for (int step = 0; step < k; step++) {
        int temp = nums[n - 1];
        for (int i = n - 1; i > 0; i--) {
            nums[i] = nums[i - 1];
        }
        nums[0] = temp;
    }
}`,
        timeComplexity: "O(k × n)",
        spaceComplexity: "O(1)",
        explanation: "Rotate one position at a time. Simple but inefficient for large k values."
      },
      {
        language: "java",
        approach: "moderate",
        code: `public void rotate(int[] nums, int k) {
    int n = nums.length;
    k = k % n; // Handle k > n
    
    int[] result = new int[n];
    for (int i = 0; i < n; i++) {
        result[(i + k) % n] = nums[i];
    }
    
    System.arraycopy(result, 0, nums, 0, n);
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Direct placement using extra array. Efficient but uses additional space."
      },
      {
        language: "java",
        approach: "optimal",
        code: `public void rotate(int[] nums, int k) {
    int n = nums.length;
    k = k % n; // Handle k > n
    
    reverse(nums, 0, n - 1);     // Reverse entire array
    reverse(nums, 0, k - 1);     // Reverse first k elements
    reverse(nums, k, n - 1);     // Reverse remaining elements
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
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Reverse-based approach. In-place rotation with optimal time and space complexity."
      },
      {
        language: "python",
        approach: "brute-force",
        code: `def rotate(nums, k):
    """
    Rotate array right by k steps using brute force
    """
    n = len(nums)
    k = k % n  # Handle k > n
    
    for _ in range(k):
        # Rotate by one position
        temp = nums[-1]
        for i in range(n - 1, 0, -1):
            nums[i] = nums[i - 1]
        nums[0] = temp`,
        timeComplexity: "O(k × n)",
        spaceComplexity: "O(1)",
        explanation: "Rotate one step at a time. Simple but inefficient for large k."
      },
      {
        language: "python",
        approach: "moderate",
        code: `def rotate(nums, k):
    """
    Rotate array using extra space
    """
    n = len(nums)
    k = k % n  # Handle k > n
    
    result = [0] * n
    for i in range(n):
        result[(i + k) % n] = nums[i]
    
    nums[:] = result  # Copy back to original array`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Calculate final positions directly. Uses extra space but linear time."
      },
      {
        language: "python",
        approach: "optimal",
        code: `def rotate(nums, k):
    """
    Rotate array using reverse approach
    """
    n = len(nums)
    k = k % n  # Handle k > n
    
    # Reverse entire array
    nums.reverse()
    # Reverse first k elements
    nums[:k] = nums[:k][::-1]
    # Reverse remaining elements
    nums[k:] = nums[k:][::-1]

# Alternative implementation with helper function
def rotate_with_helper(nums, k):
    def reverse(start, end):
        while start < end:
            nums[start], nums[end] = nums[end], nums[start]
            start += 1
            end -= 1
    
    n = len(nums)
    k = k % n
    
    reverse(0, n - 1)    # Reverse entire array
    reverse(0, k - 1)    # Reverse first k elements
    reverse(k, n - 1)    # Reverse remaining elements`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Elegant reverse-based solution. In-place with optimal complexity."
      }
    ]
  },

  {
    id: "dsa-4",
    question: "Remove duplicates from sorted array in-place",
    category: "arrays",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use two pointers: one for reading (fast) and one for writing (slow). When fast pointer finds a new unique element, copy it to slow pointer position and increment slow. Return slow + 1 as the new length. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Emphasize in-place modification",
      "Handle empty array edge case",
      "Explain why two pointers work here"
    ],
    tags: ["arrays", "two-pointers", "in-place"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: [
      {
        language: "pseudo",
        approach: "brute-force",
        code: `ALGORITHM RemoveDuplicates_BruteForce(nums)
INPUT: nums[] - sorted array with duplicates
OUTPUT: length of array after removing duplicates

n = length(nums)
FOR i = 0 to n-2
    IF nums[i] == nums[i+1]
        // Shift all elements left
        FOR j = i+1 to n-2
            nums[j] = nums[j+1]
        END FOR
        n = n - 1  // Decrease array size
        i = i - 1  // Check current position again
    END IF
END FOR
RETURN n`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Remove duplicates by shifting elements. Inefficient due to repeated shifting."
      },
      {
        language: "pseudo",
        approach: "optimal",
        code: `ALGORITHM RemoveDuplicates_TwoPointers(nums)
INPUT: nums[] - sorted array with duplicates
OUTPUT: length of array after removing duplicates

IF length(nums) == 0
    RETURN 0
END IF

slow = 0  // Write pointer
FOR fast = 1 to length(nums) - 1
    IF nums[fast] != nums[slow]
        slow = slow + 1
        nums[slow] = nums[fast]
    END IF
END FOR

RETURN slow + 1  // New length`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Two pointers maintain unique elements at the beginning. Optimal in-place solution."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    
    int n = nums.length;
    for (int i = 0; i < n - 1; i++) {
        if (nums[i] == nums[i + 1]) {
            // Shift elements left
            for (int j = i + 1; j < n - 1; j++) {
                nums[j] = nums[j + 1];
            }
            n--; // Decrease effective size
            i--; // Check current position again
        }
    }
    return n;
}`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Shift elements when duplicates found. Simple but inefficient approach."
      },
      {
        language: "java",
        approach: "optimal",
        code: `public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    
    int slow = 0; // Write pointer
    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    
    return slow + 1; // New length
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Two-pointer technique. Fast pointer reads, slow pointer writes unique elements."
      },
      {
        language: "python",
        approach: "brute-force",
        code: `def remove_duplicates(nums):
    """
    Remove duplicates using brute force approach
    """
    if not nums:
        return 0
    
    i = 0
    while i < len(nums) - 1:
        if nums[i] == nums[i + 1]:
            nums.pop(i + 1)  # Remove duplicate
        else:
            i += 1
    
    return len(nums)`,
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "Remove duplicates using list.pop(). Simple but pop operation is O(n)."
      },
      {
        language: "python",
        approach: "optimal",
        code: `def remove_duplicates(nums):
    """
    Remove duplicates using two pointers
    """
    if not nums:
        return 0
    
    slow = 0  # Write pointer
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    
    return slow + 1  # New length`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Two-pointer approach. Optimal solution for in-place duplicate removal."
      }
    ]
  },

  {
    id: "dsa-5",
    question: "Find the intersection of two arrays",
    category: "arrays",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Two approaches: 1) Hash set: put one array in a set, iterate through second array and check membership. 2) Sort both arrays and use two pointers. Hash set approach is generally better with O(n+m) time complexity. Handle duplicates by using a frequency map if needed.",
    tips: [
      "Consider if arrays are sorted",
      "Handle duplicate elements properly",
      "Discuss space-time tradeoffs"
    ],
    tags: ["arrays", "hash-set", "two-pointers"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: [
      {
        language: "pseudo",
        approach: "brute-force",
        code: `ALGORITHM Intersection_BruteForce(nums1, nums2)
INPUT: nums1[], nums2[] - two arrays
OUTPUT: array containing intersection elements

result = empty list
FOR each element in nums1
    FOR each element in nums2
        IF nums1[i] == nums2[j] AND element not in result
            ADD element to result
        END IF
    END FOR
END FOR
RETURN result`,
        timeComplexity: "O(n × m × k)",
        spaceComplexity: "O(k)",
        explanation: "Check every element of first array against every element of second array. k is result size."
      },
      {
        language: "pseudo",
        approach: "moderate",
        code: `ALGORITHM Intersection_Sort(nums1, nums2)
INPUT: nums1[], nums2[] - two arrays
OUTPUT: array containing intersection elements

SORT nums1
SORT nums2
result = empty list
i = 0, j = 0

WHILE i < length(nums1) AND j < length(nums2)
    IF nums1[i] == nums2[j]
        IF result is empty OR last element != nums1[i]
            ADD nums1[i] to result
        END IF
        i++, j++
    ELSE IF nums1[i] < nums2[j]
        i++
    ELSE
        j++
    END IF
END WHILE
RETURN result`,
        timeComplexity: "O(n log n + m log m)",
        spaceComplexity: "O(1)",
        explanation: "Sort both arrays then use two pointers. Good when arrays are already sorted."
      },
      {
        language: "pseudo",
        approach: "optimal",
        code: `ALGORITHM Intersection_HashSet(nums1, nums2)
INPUT: nums1[], nums2[] - two arrays
OUTPUT: array containing intersection elements

hashSet = empty set
FOR each element in nums1
    ADD element to hashSet
END FOR

result = empty list
FOR each element in nums2
    IF element EXISTS IN hashSet
        ADD element to result
        REMOVE element from hashSet  // Avoid duplicates
    END IF
END FOR
RETURN result`,
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(n)",
        explanation: "Hash set provides O(1) average lookup time. Most efficient for general case."
      },
      {
        language: "java",
        approach: "brute-force",
        code: `public int[] intersection(int[] nums1, int[] nums2) {
    List<Integer> result = new ArrayList<>();
    
    for (int i = 0; i < nums1.length; i++) {
        for (int j = 0; j < nums2.length; j++) {
            if (nums1[i] == nums2[j] && !result.contains(nums1[i])) {
                result.add(nums1[i]);
                break;
            }
        }
    }
    
    return result.stream().mapToInt(Integer::intValue).toArray();
}`,
        timeComplexity: "O(n × m × k)",
        spaceComplexity: "O(k)",
        explanation: "Nested loops with contains check. Inefficient due to linear search in result list."
      },
      {
        language: "java",
        approach: "moderate",
        code: `public int[] intersection(int[] nums1, int[] nums2) {
    Arrays.sort(nums1);
    Arrays.sort(nums2);
    
    List<Integer> result = new ArrayList<>();
    int i = 0, j = 0;
    
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] == nums2[j]) {
            if (result.isEmpty() || result.get(result.size() - 1) != nums1[i]) {
                result.add(nums1[i]);
            }
            i++;
            j++;
        } else if (nums1[i] < nums2[j]) {
            i++;
        } else {
            j++;
        }
    }
    
    return result.stream().mapToInt(Integer::intValue).toArray();
}`,
        timeComplexity: "O(n log n + m log m)",
        spaceComplexity: "O(1)",
        explanation: "Sort then merge approach. Efficient when arrays are already sorted or nearly sorted."
      },
      {
        language: "java",
        approach: "optimal",
        code: `public int[] intersection(int[] nums1, int[] nums2) {
    Set<Integer> set1 = new HashSet<>();
    for (int num : nums1) {
        set1.add(num);
    }
    
    Set<Integer> resultSet = new HashSet<>();
    for (int num : nums2) {
        if (set1.contains(num)) {
            resultSet.add(num);
        }
    }
    
    return resultSet.stream().mapToInt(Integer::intValue).toArray();
}`,
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(n)",
        explanation: "HashSet approach with automatic duplicate handling. Most efficient for general case."
      },
      {
        language: "python",
        approach: "brute-force",
        code: `def intersection(nums1, nums2):
    """
    Find intersection using brute force
    """
    result = []
    for num1 in nums1:
        for num2 in nums2:
            if num1 == num2 and num1 not in result:
                result.append(num1)
                break
    return result`,
        timeComplexity: "O(n × m × k)",
        spaceComplexity: "O(k)",
        explanation: "Check each element against all elements in other array. Inefficient approach."
      },
      {
        language: "python",
        approach: "moderate",
        code: `def intersection(nums1, nums2):
    """
    Find intersection using sorting and two pointers
    """
    nums1.sort()
    nums2.sort()
    
    result = []
    i = j = 0
    
    while i < len(nums1) and j < len(nums2):
        if nums1[i] == nums2[j]:
            if not result or result[-1] != nums1[i]:
                result.append(nums1[i])
            i += 1
            j += 1
        elif nums1[i] < nums2[j]:
            i += 1
        else:
            j += 1
    
    return result`,
        timeComplexity: "O(n log n + m log m)",
        spaceComplexity: "O(1)",
        explanation: "Sort both arrays then use two pointers. Good space efficiency."
      },
      {
        language: "python",
        approach: "optimal",
        code: `def intersection(nums1, nums2):
    """
    Find intersection using set operations
    """
    return list(set(nums1) & set(nums2))

# Alternative explicit implementation
def intersection_explicit(nums1, nums2):
    """
    Find intersection using hash set
    """
    set1 = set(nums1)
    result = set()
    
    for num in nums2:
        if num in set1:
            result.add(num)
    
    return list(result)`,
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(n)",
        explanation: "Set operations provide optimal time complexity. Python's set intersection is very efficient."
      }
    ]
  }
];