import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedSearchSortQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-40",
    question: "Implement QuickSort and explain its time complexity",
    category: "sorting",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "QuickSort uses divide-and-conquer: choose a pivot, partition array so elements < pivot are left, elements > pivot are right, recursively sort both parts. Partition is key: use two pointers to swap elements. Average time complexity: O(n log n), worst case: O(n²) when pivot is always smallest/largest. Space complexity: O(log n) average for recursion stack.",
    tips: [
      "Explain partitioning process clearly",
      "Discuss pivot selection strategies",
      "Compare with other sorting algorithms"
    ],
    tags: ["sorting", "quicksort", "divide-conquer"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Partition the array and get pivot index
        const pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
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
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
        }
    }
    
    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

// Random pivot for better average case
function quickSortRandom(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Random pivot selection
        const randomIndex = Math.floor(Math.random() * (high - low + 1)) + low;
        [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];
        
        const pivotIndex = partition(arr, low, high);
        quickSortRandom(arr, low, pivotIndex - 1);
        quickSortRandom(arr, pivotIndex + 1, high);
    }
    return arr;
}`,
        explanation: "QuickSort partitions array around pivot and recursively sorts subarrays. Random pivot selection helps avoid worst-case performance on sorted arrays.",
        timeComplexity: "O(n log n) average, O(n²) worst case",
        spaceComplexity: "O(log n) average recursion depth",
        approach: "Divide and Conquer"
      },
      python: {
        solution: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Partition the array and get pivot index
        pivot_index = partition(arr, low, high)
        
        # Recursively sort elements before and after partition
        quick_sort(arr, low, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    # Choose rightmost element as pivot
    pivot = arr[high]
    i = low - 1  # Index of smaller element
    
    for j in range(low, high):
        # If current element is smaller than or equal to pivot
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]  # Swap
    
    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Pythonic version using list slicing (not in-place)
def quick_sort_pythonic(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort_pythonic(left) + middle + quick_sort_pythonic(right)`,
        explanation: "Python implementation with both in-place and Pythonic versions. List comprehension version is more readable but uses extra space.",
        timeComplexity: "O(n log n) average, O(n²) worst case",
        spaceComplexity: "O(log n) in-place, O(n) Pythonic",
        approach: "Divide and Conquer"
      },
      java: {
        solution: `public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        // Partition the array and get pivot index
        int pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

private int partition(int[] arr, int low, int high) {
    // Choose rightmost element as pivot
    int pivot = arr[high];
    int i = low - 1; // Index of smaller element
    
    for (int j = low; j < high; j++) {
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }
    
    // Place pivot in correct position
    swap(arr, i + 1, high);
    return i + 1;
}

private void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// Three-way partitioning for duplicate elements
public void quickSort3Way(int[] arr, int low, int high) {
    if (low < high) {
        int[] pivots = partition3Way(arr, low, high);
        quickSort3Way(arr, low, pivots[0] - 1);
        quickSort3Way(arr, pivots[1] + 1, high);
    }
}

private int[] partition3Way(int[] arr, int low, int high) {
    int pivot = arr[high];
    int lt = low;      // arr[low..lt-1] < pivot
    int gt = high;     // arr[gt+1..high] > pivot
    int i = low;       // arr[lt..i-1] == pivot
    
    while (i <= gt) {
        if (arr[i] < pivot) {
            swap(arr, lt++, i++);
        } else if (arr[i] > pivot) {
            swap(arr, i, gt--);
        } else {
            i++;
        }
    }
    
    return new int[]{lt, gt};
}`,
        explanation: "Java implementation with three-way partitioning optimization for arrays with many duplicates. Handles equal elements efficiently.",
        timeComplexity: "O(n log n) average, O(n²) worst case",
        spaceComplexity: "O(log n) average",
        approach: "Divide and Conquer"
      }
    },
    algorithmSteps: [
      "Choose a pivot element (often last element)",
      "Partition array: elements < pivot on left, > pivot on right",
      "Place pivot in its correct sorted position",
      "Recursively apply QuickSort to left subarray",
      "Recursively apply QuickSort to right subarray",
      "Base case: subarrays of size 0 or 1 are already sorted",
      "Combine results (array is sorted in-place)"
    ],
    commonMistakes: [
      "Incorrect partitioning logic",
      "Not handling duplicate elements properly",
      "Poor pivot selection leading to worst-case performance",
      "Off-by-one errors in recursive calls"
    ],
    optimizations: [
      "Random pivot selection to avoid worst case",
      "Three-way partitioning for arrays with duplicates",
      "Hybrid approach (switch to insertion sort for small subarrays)",
      "Iterative implementation to avoid stack overflow"
    ],
    relatedQuestions: ["Merge Sort", "Heap Sort", "Kth Largest Element"]
  },

  {
    id: "dsa-42",
    question: "Binary search in a sorted array",
    category: "searching",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Divide and conquer approach: compare target with middle element. If equal, found. If target is smaller, search left half. If larger, search right half. Continue until found or search space is empty. Key is updating left/right pointers correctly to avoid infinite loops. Time complexity: O(log n), Space complexity: O(1) iterative, O(log n) recursive.",
    tips: [
      "Handle integer overflow in mid calculation",
      "Discuss termination conditions",
      "Explain why array must be sorted"
    ],
    tags: ["searching", "binary-search", "divide-conquer"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Iterative binary search
function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2); // Avoid overflow
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Target not found
}

// Recursive binary search
function binarySearchRecursive(nums, target, left = 0, right = nums.length - 1) {
    if (left > right) {
        return -1; // Target not found
    }
    
    const mid = Math.floor(left + (right - left) / 2);
    
    if (nums[mid] === target) {
        return mid;
    } else if (nums[mid] < target) {
        return binarySearchRecursive(nums, target, mid + 1, right);
    } else {
        return binarySearchRecursive(nums, target, left, mid - 1);
    }
}

// Find leftmost occurrence
function searchFirst(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
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
}`,
        explanation: "Binary search eliminates half the search space each iteration. Careful pointer updates prevent infinite loops. Variants can find first/last occurrence.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1) iterative, O(log n) recursive",
        approach: "Divide and Conquer"
      },
      python: {
        solution: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2  # Avoid overflow
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Target not found

def binary_search_recursive(nums, target, left=0, right=None):
    if right is None:
        right = len(nums) - 1
    
    if left > right:
        return -1  # Target not found
    
    mid = left + (right - left) // 2
    
    if nums[mid] == target:
        return mid
    elif nums[mid] < target:
        return binary_search_recursive(nums, target, mid + 1, right)
    else:
        return binary_search_recursive(nums, target, left, mid - 1)

# Using bisect module
import bisect

def binary_search_bisect(nums, target):
    index = bisect.bisect_left(nums, target)
    return index if index < len(nums) and nums[index] == target else -1`,
        explanation: "Python implementation with built-in bisect module option. Floor division prevents float results in mid calculation.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1) iterative, O(log n) recursive",
        approach: "Divide and Conquer"
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
    
    return -1; // Target not found
}

public int binarySearchRecursive(int[] nums, int target) {
    return binarySearchHelper(nums, target, 0, nums.length - 1);
}

private int binarySearchHelper(int[] nums, int target, int left, int right) {
    if (left > right) {
        return -1; // Target not found
    }
    
    int mid = left + (right - left) / 2;
    
    if (nums[mid] == target) {
        return mid;
    } else if (nums[mid] < target) {
        return binarySearchHelper(nums, target, mid + 1, right);
    } else {
        return binarySearchHelper(nums, target, left, mid - 1);
    }
}

// Find first and last position
public int[] searchRange(int[] nums, int target) {
    return new int[]{searchFirst(nums, target), searchLast(nums, target)};
}

private int searchFirst(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
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
}`,
        explanation: "Java implementation with overflow-safe mid calculation. Includes variants for finding first and last occurrence of target.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1) iterative, O(log n) recursive",
        approach: "Divide and Conquer"
      }
    },
    algorithmSteps: [
      "Initialize left and right pointers to array bounds",
      "While left <= right:",
      "Calculate mid point (avoiding integer overflow)",
      "Compare target with element at mid",
      "If equal, return mid index",
      "If target smaller, search left half (right = mid - 1)",
      "If target larger, search right half (left = mid + 1)",
      "Return -1 if not found"
    ],
    commonMistakes: [
      "Integer overflow in mid calculation (use left + (right-left)/2)",
      "Incorrect termination condition (left <= right vs left < right)",
      "Wrong pointer updates leading to infinite loops",
      "Not handling empty array case"
    ],
    optimizations: [
      "Iterative approach saves stack space",
      "Overflow-safe mid calculation",
      "Early termination when target found"
    ],
    relatedQuestions: ["Search in Rotated Array", "Find Peak Element", "Search Insert Position"]
  },

  {
    id: "dsa-44",
    question: "Search in rotated sorted array",
    category: "searching",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Modified binary search: first determine which half is sorted by comparing with boundaries. If target is in the sorted half and within its range, search that half; otherwise search the other half. Key insight is that at least one half is always sorted in rotated array. Time complexity: O(log n), Space complexity: O(1).",
    tips: [
      "Identify which half is properly sorted",
      "Handle duplicates case separately",
      "Explain the rotation point concept"
    ],
    tags: ["searching", "binary-search", "rotation"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (nums[mid] === target) {
            return mid;
        }
        
        // Determine which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1; // Target in left half
            } else {
                left = mid + 1;   // Target in right half
            }
        } else {
            // Right half is sorted
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;   // Target in right half
            } else {
                right = mid - 1;  // Target in left half
            }
        }
    }
    
    return -1;
}

// Find minimum in rotated sorted array
function findMin(nums) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor(left + (right - left) / 2);
        
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

// Handle duplicates
function searchWithDuplicates(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (nums[mid] === target) {
            return true;
        }
        
        // Handle duplicates
        if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
            left++;
            right--;
        } else if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return false;
}`,
        explanation: "Modified binary search that identifies which half is properly sorted and searches accordingly. Duplicates require special handling.",
        timeComplexity: "O(log n) average, O(n) worst case with duplicates",
        spaceComplexity: "O(1)",
        approach: "Modified Binary Search"
      },
      python: {
        solution: `def search(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        
        # Determine which half is sorted
        if nums[left] <= nums[mid]:
            # Left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1  # Target in left half
            else:
                left = mid + 1   # Target in right half
        else:
            # Right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1   # Target in right half
            else:
                right = mid - 1  # Target in left half
    
    return -1

def find_min(nums):
    left, right = 0, len(nums) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        if nums[mid] > nums[right]:
            # Minimum is in right half
            left = mid + 1
        else:
            # Minimum is in left half (including mid)
            right = mid
    
    return nums[left]

def search_with_duplicates(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return True
        
        # Handle duplicates
        if nums[left] == nums[mid] == nums[right]:
            left += 1
            right -= 1
        elif nums[left] <= nums[mid]:
            # Left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            # Right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return False`,
        explanation: "Python implementation with clean syntax. Handles the key insight that one half is always properly sorted in rotated array.",
        timeComplexity: "O(log n) average, O(n) with duplicates",
        spaceComplexity: "O(1)",
        approach: "Modified Binary Search"
      },
      java: {
        solution: `public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        }
        
        // Determine which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1; // Target in left half
            } else {
                left = mid + 1;   // Target in right half
            }
        } else {
            // Right half is sorted
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;   // Target in right half
            } else {
                right = mid - 1;  // Target in left half
            }
        }
    }
    
    return -1;
}

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
        explanation: "Java implementation focusing on the core insight: one half is always sorted. Uses this property to decide which half to search.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        approach: "Modified Binary Search"
      }
    },
    algorithmSteps: [
      "Initialize left and right pointers",
      "While left <= right:",
      "Calculate mid point",
      "If mid element equals target, return mid",
      "Determine which half is properly sorted",
      "Check if target lies in the sorted half's range",
      "If yes, search sorted half; otherwise search other half",
      "Update pointers accordingly and continue"
    ],
    commonMistakes: [
      "Not identifying which half is sorted correctly",
      "Incorrect range checking for target",
      "Not handling the rotation point properly",
      "Forgetting edge cases like single element array"
    ],
    optimizations: [
      "Single pass with logarithmic time",
      "No need to find rotation point first",
      "Handles all rotation scenarios uniformly"
    ],
    relatedQuestions: ["Find Minimum in Rotated Sorted Array", "Search in Rotated Sorted Array II", "Find Peak Element"]
  }
];