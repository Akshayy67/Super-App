import { EnhancedQuestion } from "../../InterviewSubjects";

export const searchSortQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-14",
    question: "Binary Search implementation and variations",
    category: "searching",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Binary search works on sorted arrays by repeatedly dividing search space in half. Compare target with middle element: if equal, found; if target smaller, search left half; if larger, search right half. Time complexity: O(log n), Space complexity: O(1) iterative, O(log n) recursive.",
    tips: [
      "Explain the divide and conquer approach",
      "Discuss iterative vs recursive implementations",
      "Handle edge cases and boundary conditions"
    ],
    tags: ["searching", "binary-search", "divide-conquer"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Standard binary search
function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Not found
}

// Recursive implementation
function binarySearchRecursive(nums, target, left = 0, right = nums.length - 1) {
    if (left > right) return -1;
    
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
        return mid;
    } else if (nums[mid] < target) {
        return binarySearchRecursive(nums, target, mid + 1, right);
    } else {
        return binarySearchRecursive(nums, target, left, mid - 1);
    }
}

// Find first occurrence (leftmost)
function findFirst(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            result = mid;
            right = mid - 1; // Continue searching left
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

// Find last occurrence (rightmost)
function findLast(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            result = mid;
            left = mid + 1; // Continue searching right
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}`,
        explanation: "Binary search family: standard search, first/last occurrence finding. Key insight is adjusting search bounds while maintaining the invariant.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1) iterative, O(log n) recursive",
        approach: "Binary Search"
      },
      python: {
        solution: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

def binary_search_recursive(nums, target, left=0, right=None):
    if right is None:
        right = len(nums) - 1
    
    if left > right:
        return -1
    
    mid = (left + right) // 2
    
    if nums[mid] == target:
        return mid
    elif nums[mid] < target:
        return binary_search_recursive(nums, target, mid + 1, right)
    else:
        return binary_search_recursive(nums, target, left, mid - 1)

def find_first_last(nums, target):
    def find_boundary(is_first):
        left, right = 0, len(nums) - 1
        result = -1
        
        while left <= right:
            mid = (left + right) // 2
            
            if nums[mid] == target:
                result = mid
                if is_first:
                    right = mid - 1  # Search left for first
                else:
                    left = mid + 1   # Search right for last
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return result
    
    return [find_boundary(True), find_boundary(False)]`,
        explanation: "Python implementation with integer division operator. Helper function pattern for finding boundaries reduces code duplication.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        approach: "Binary Search"
      },
      java: {
        solution: `public int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2; // Avoid overflow
        
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

public int findFirst(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            result = mid;
            right = mid - 1; // Continue searching left
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

public int[] searchRange(int[] nums, int target) {
    int first = findFirst(nums, target);
    if (first == -1) return new int[]{-1, -1};
    
    int last = findLast(nums, target);
    return new int[]{first, last};
}

private int findLast(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            result = mid;
            left = mid + 1; // Continue searching right
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}`,
        explanation: "Java implementation with overflow-safe mid calculation. Separate methods for finding first and last occurrences.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        approach: "Binary Search"
      }
    },
    algorithmSteps: [
      "Initialize left and right pointers to array bounds",
      "While left <= right, calculate middle index",
      "Compare middle element with target",
      "If equal, return index (or continue for first/last)",
      "If middle < target, search right half (left = mid + 1)",
      "If middle > target, search left half (right = mid - 1)",
      "Return -1 if not found"
    ],
    commonMistakes: [
      "Integer overflow in mid calculation",
      "Incorrect loop condition (left < right vs left <= right)",
      "Off-by-one errors in boundary updates",
      "Not handling empty array case"
    ],
    optimizations: [
      "Overflow-safe mid calculation: left + (right - left) / 2",
      "Early termination when target found",
      "Template approach for finding boundaries"
    ],
    relatedQuestions: ["Search in Rotated Sorted Array", "Find Peak Element", "Search a 2D Matrix"]
  },

  {
    id: "dsa-15",
    question: "Quick Sort implementation and analysis",
    category: "sorting",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Quick sort uses divide-and-conquer with pivot partitioning. Choose pivot, partition array so elements < pivot are left, > pivot are right. Recursively sort left and right subarrays. Average case: O(n log n), Worst case: O(n²), Space: O(log n) average. Pivot selection strategy affects performance.",
    tips: [
      "Explain the partitioning process clearly",
      "Discuss different pivot selection strategies",
      "Compare with merge sort and heap sort"
    ],
    tags: ["sorting", "divide-conquer", "partitioning"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Partition and get pivot index
        const pivotIndex = partition(arr, low, high);
        
        // Recursively sort left and right subarrays
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    
    return arr;
}

function partition(arr, low, high) {
    // Choose rightmost element as pivot
    const pivot = arr[high];
    let i = low - 1; // Index of smaller element
    
    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
        }
    }
    
    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

// Randomized version for better average performance
function quickSortRandomized(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Randomize pivot selection
        const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
        [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];
        
        const pivotIndex = partition(arr, low, high);
        quickSortRandomized(arr, low, pivotIndex - 1);
        quickSortRandomized(arr, pivotIndex + 1, high);
    }
    
    return arr;
}

// Three-way partitioning for duplicate elements
function quickSort3Way(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const [lt, gt] = partition3Way(arr, low, high);
        quickSort3Way(arr, low, lt - 1);
        quickSort3Way(arr, gt + 1, high);
    }
    
    return arr;
}

function partition3Way(arr, low, high) {
    const pivot = arr[low];
    let lt = low;      // arr[low..lt-1] < pivot
    let i = low + 1;   // arr[lt..i-1] == pivot
    let gt = high;     // arr[gt+1..high] > pivot
    
    while (i <= gt) {
        if (arr[i] < pivot) {
            [arr[lt], arr[i]] = [arr[i], arr[lt]];
            lt++;
            i++;
        } else if (arr[i] > pivot) {
            [arr[i], arr[gt]] = [arr[gt], arr[i]];
            gt--;
        } else {
            i++;
        }
    }
    
    return [lt, gt];
}`,
        explanation: "Classic quicksort with Lomuto partitioning. Randomized version improves average case. Three-way partitioning handles duplicates efficiently.",
        timeComplexity: "O(n log n) average, O(n²) worst",
        spaceComplexity: "O(log n) average, O(n) worst",
        approach: "Divide and Conquer"
      },
      python: {
        solution: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort(arr, low, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

import random

def quick_sort_randomized(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Randomize pivot
        random_index = random.randint(low, high)
        arr[random_index], arr[high] = arr[high], arr[random_index]
        
        pivot_index = partition(arr, low, high)
        quick_sort_randomized(arr, low, pivot_index - 1)
        quick_sort_randomized(arr, pivot_index + 1, high)
    
    return arr

def quick_sort_iterative(arr):
    if len(arr) <= 1:
        return arr
    
    stack = [(0, len(arr) - 1)]
    
    while stack:
        low, high = stack.pop()
        
        if low < high:
            pivot_index = partition(arr, low, high)
            stack.append((low, pivot_index - 1))
            stack.append((pivot_index + 1, high))
    
    return arr`,
        explanation: "Python implementation with tuple unpacking for swaps. Includes randomized and iterative versions to avoid recursion depth issues.",
        timeComplexity: "O(n log n) average",
        spaceComplexity: "O(log n) average",
        approach: "Divide and Conquer"
      },
      java: {
        solution: `public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

private int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }
    
    swap(arr, i + 1, high);
    return i + 1;
}

private void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// Iterative version
public void quickSortIterative(int[] arr) {
    Stack<int[]> stack = new Stack<>();
    stack.push(new int[]{0, arr.length - 1});
    
    while (!stack.isEmpty()) {
        int[] bounds = stack.pop();
        int low = bounds[0];
        int high = bounds[1];
        
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            stack.push(new int[]{low, pivotIndex - 1});
            stack.push(new int[]{pivotIndex + 1, high});
        }
    }
}`,
        explanation: "Java implementation with helper swap method. Iterative version uses explicit stack to avoid recursion depth issues.",
        timeComplexity: "O(n log n) average",
        spaceComplexity: "O(log n)",
        approach: "Divide and Conquer"
      }
    },
    algorithmSteps: [
      "Choose a pivot element (commonly last element)",
      "Partition array: elements ≤ pivot on left, > pivot on right",
      "Place pivot in its final sorted position",
      "Recursively apply quicksort to left and right subarrays",
      "Base case: subarray with ≤ 1 element is already sorted",
      "Combine results (in-place, so no explicit combining needed)"
    ],
    commonMistakes: [
      "Poor pivot selection leading to O(n²) performance",
      "Incorrect partitioning logic",
      "Not handling duplicate elements efficiently",
      "Stack overflow on already sorted arrays"
    ],
    optimizations: [
      "Randomized pivot selection",
      "Three-way partitioning for duplicates",
      "Hybrid approach with insertion sort for small arrays",
      "Iterative implementation to avoid stack overflow"
    ],
    relatedQuestions: ["Merge Sort", "Heap Sort", "Kth Largest Element"]
  }
];