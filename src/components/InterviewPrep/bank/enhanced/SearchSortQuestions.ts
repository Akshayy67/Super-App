import { Question } from "../../InterviewSubjects";

// Enhanced Search and Sort DSA Questions with comprehensive implementations
export const enhancedSearchSortQuestions: Question[] = [
  {
    id: "enhanced-search-1",
    question: "Binary Search - Given a sorted array of integers nums and an integer target, return the index of target or -1 if not found.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach: "Multiple approaches available: 1) Standard Binary Search (O(log n) time, O(1) space): Classic iterative binary search with left <= right condition. 2) Recursive Binary Search (O(log n) time, O(log n) space): Recursive implementation that's more intuitive but uses call stack space. 3) Find Insertion Position: Extension to find where target should be inserted (lower bound). Standard iterative approach is most space-efficient, while recursive approach provides better understanding of the divide-and-conquer strategy.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Standard Binary Search (Optimal)
// Time: O(log n), Space: O(1)
function search(nums: number[], target: number): number {
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
    
    return -1;
}`,
        explanation: "Standard iterative binary search. Most space-efficient with O(1) space complexity."
      },
      {
        language: "Java",
        code: `// Approach 1: Standard Binary Search (Optimal)
// Time: O(log n), Space: O(1)
class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
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
}`,
        explanation: "Standard iterative binary search. Most space-efficient with O(1) space complexity."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Recursive Binary Search
// Time: O(log n), Space: O(log n)
function searchRecursive(nums: number[], target: number): number {
    function binarySearch(left: number, right: number): number {
        if (left > right) return -1;
        
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            return binarySearch(mid + 1, right);
        } else {
            return binarySearch(left, mid - 1);
        }
    }
    
    return binarySearch(0, nums.length - 1);
}`,
        explanation: "Recursive binary search implementation. More intuitive but uses call stack space."
      },
      {
        language: "Java",
        code: `// Approach 2: Recursive Binary Search
// Time: O(log n), Space: O(log n)
class Solution {
    public int searchRecursive(int[] nums, int target) {
        return binarySearch(nums, target, 0, nums.length - 1);
    }
    
    private int binarySearch(int[] nums, int target, int left, int right) {
        if (left > right) return -1;
        
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            return binarySearch(nums, target, mid + 1, right);
        } else {
            return binarySearch(nums, target, left, mid - 1);
        }
    }
}`,
        explanation: "Recursive binary search implementation. More intuitive but uses call stack space."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Find Insertion Position (Lower Bound)
// Time: O(log n), Space: O(1)
function searchInsert(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return left;
}`,
        explanation: "Extension that finds insertion position for target. Uses left < right condition for bounds."
      },
      {
        language: "Java",
        code: `// Approach 3: Find Insertion Position (Lower Bound)
// Time: O(log n), Space: O(1)
class Solution {
    public int searchInsert(int[] nums, int target) {
        int left = 0;
        int right = nums.length;
        
        while (left < right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        return left;
    }
}`,
        explanation: "Extension that finds insertion position for target. Uses left < right condition for bounds."
      },
      {
        language: "Python",
        code: `# Approach 1: Standard Binary Search (Optimal)
# Time: O(log n), Space: O(1)
def search(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
        explanation: "Standard iterative binary search. Most space-efficient with O(1) space complexity."
      },
      {
        language: "Python",
        code: `# Approach 2: Recursive Binary Search
# Time: O(log n), Space: O(log n)
def search_recursive(nums, target):
    def binary_search(left, right):
        if left > right:
            return -1
        
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            return binary_search(mid + 1, right)
        else:
            return binary_search(left, mid - 1)
    
    return binary_search(0, len(nums) - 1)`,
        explanation: "Recursive binary search implementation. More intuitive but uses call stack space."
      },
      {
        language: "Python",
        code: `# Approach 3: Find Insertion Position (Lower Bound)
# Time: O(log n), Space: O(1)
def search_insert(nums, target):
    left, right = 0, len(nums)
    
    while left < right:
        mid = (left + right) // 2
        
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    
    return left`,
        explanation: "Extension that finds insertion position for target. Uses left < right condition for bounds."
      }
    ],
    tips: [
      "Maintain loop invariant: target in [left, right] if exists",
      "Use left <= right for exact search, left < right for bounds",
      "Avoid integer overflow: mid = left + (right - left) / 2",
      "Consider variations: first/last occurrence, insertion point"
    ],
    tags: ["array", "binary-search"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-search-2",
    question: "Search in Rotated Sorted Array - Given a rotated sorted array and target, return the index of target or -1.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Modified Binary Search (O(log n) time, O(1) space): Adapt binary search to handle rotated sorted arrays by determining which half is sorted. 2) Handle Duplicates Version: Extension to handle arrays with duplicate elements by incrementing/decrementing pointers when endpoints are equal. 3) Find Minimum Extension: Find the minimum element in rotated sorted array using binary search. Modified binary search is optimal, while handling duplicates requires additional logic to avoid getting stuck.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Modified Binary Search (Optimal)
// Time: O(log n), Space: O(1)
function searchRotated(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) return mid;
        
        // Determine which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}`,
        explanation: "Modified binary search handles rotated sorted arrays by determining which half is sorted."
      },
      {
        language: "Java",
        code: `// Approach 1: Modified Binary Search (Optimal)
// Time: O(log n), Space: O(1)
class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] == target) return mid;
            
            // Determine which half is sorted
            if (nums[left] <= nums[mid]) {
                // Left half is sorted
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                // Right half is sorted
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        
        return -1;
    }
}`,
        explanation: "Modified binary search handles rotated sorted arrays by determining which half is sorted."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Handle Duplicates Version
// Time: O(log n), Space: O(1)
function searchRotatedWithDuplicates(nums: number[], target: number): boolean {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) return true;
        
        // Handle duplicates
        if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
            left++;
            right--;
        } else if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return false;
}`,
        explanation: "Extension that handles duplicate elements by incrementing/decrementing pointers when endpoints are equal."
      },
      {
        language: "Java",
        code: `// Approach 2: Handle Duplicates Version
// Time: O(log n), Space: O(1)
class Solution {
    public boolean search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] == target) return true;
            
            // Handle duplicates
            if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
                left++;
                right--;
            } else if (nums[left] <= nums[mid]) {
                // Left half is sorted
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                // Right half is sorted
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        
        return false;
    }
}`,
        explanation: "Extension that handles duplicate elements by incrementing/decrementing pointers when endpoints are equal."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Find Minimum in Rotated Array
// Time: O(log n), Space: O(1)
function findMin(nums: number[]): number {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return nums[left];
}`,
        explanation: "Binary search to find minimum element in rotated sorted array. Uses left < right condition."
      },
      {
        language: "Java",
        code: `// Approach 3: Find Minimum in Rotated Array
// Time: O(log n), Space: O(1)
class Solution {
    public int findMin(int[] nums) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left < right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        return nums[left];
    }
}`,
        explanation: "Binary search to find minimum element in rotated sorted array. Uses left < right condition."
      },
      {
        language: "Python",
        code: `# Approach 1: Modified Binary Search (Optimal)
# Time: O(log n), Space: O(1)
def search_rotated(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        
        # Determine which half is sorted
        if nums[left] <= nums[mid]:
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
    
    return -1`,
        explanation: "Modified binary search handles rotated sorted arrays by determining which half is sorted."
      },
      {
        language: "Python",
        code: `# Approach 2: Handle Duplicates Version
# Time: O(log n), Space: O(1)
def search_rotated_with_duplicates(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
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
        explanation: "Extension that handles duplicate elements by incrementing/decrementing pointers when endpoints are equal."
      },
      {
        language: "Python",
        code: `# Approach 3: Find Minimum in Rotated Array
# Time: O(log n), Space: O(1)
def find_min(nums):
    left, right = 0, len(nums) - 1
    
    while left < right:
        mid = (left + right) // 2
        
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid
    
    return nums[left]`,
        explanation: "Binary search to find minimum element in rotated sorted array. Uses left < right condition."
      }
    ],
    tips: [
      "One half of rotated array is always sorted",
      "Determine which half is sorted by comparing endpoints",
      "Check if target is in sorted half's range",
      "Handle duplicates by incrementing/decrementing pointers"
    ],
    tags: ["array", "binary-search"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-sort-1",
    question: "Merge Sort Implementation - Implement merge sort algorithm and explain its time/space complexity.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Standard Merge Sort (O(n log n) time, O(n) space): Classic divide-and-conquer recursive implementation. 2) In-place Merge Sort (O(n log n) time, O(n) space): More space-efficient version using temporary array. 3) Bottom-up Merge Sort (O(n log n) time, O(n) space): Iterative approach that avoids recursion overhead. Standard merge sort is most intuitive, while bottom-up approach provides better performance for large arrays by avoiding call stack overhead.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Standard Merge Sort (Classic)
// Time: O(n log n), Space: O(n)
function mergeSort(nums: number[]): number[] {
    if (nums.length <= 1) return nums;
    
    const mid = Math.floor(nums.length / 2);
    const left = mergeSort(nums.slice(0, mid));
    const right = mergeSort(nums.slice(mid));
    
    return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    // Add remaining elements
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    
    return result;
}`,
        explanation: "Classic divide-and-conquer recursive implementation. Most intuitive and easy to understand."
      },
      {
        language: "Java",
        code: `// Approach 1: Standard Merge Sort (Classic)
// Time: O(n log n), Space: O(n)
import java.util.*;
class Solution {
    public int[] mergeSort(int[] nums) {
        if (nums.length <= 1) return nums;
        
        int mid = nums.length / 2;
        int[] left = Arrays.copyOfRange(nums, 0, mid);
        int[] right = Arrays.copyOfRange(nums, mid, nums.length);
        
        left = mergeSort(left);
        right = mergeSort(right);
        
        return merge(left, right);
    }
    
    private int[] merge(int[] left, int[] right) {
        int[] result = new int[left.length + right.length];
        int i = 0, j = 0, k = 0;
        
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result[k++] = left[i++];
            } else {
                result[k++] = right[j++];
            }
        }
        
        // Add remaining elements
        while (i < left.length) result[k++] = left[i++];
        while (j < right.length) result[k++] = right[j++];
        
        return result;
    }
}`,
        explanation: "Classic divide-and-conquer recursive implementation. Most intuitive and easy to understand."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: In-place Merge Sort (Space Efficient)
// Time: O(n log n), Space: O(n)
function mergeSortInPlace(nums: number[]): void {
    function mergeSortHelper(arr: number[], temp: number[], left: number, right: number): void {
        if (left >= right) return;
        
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(arr, temp, left, mid);
        mergeSortHelper(arr, temp, mid + 1, right);
        mergeInPlace(arr, temp, left, mid, right);
    }
    
    function mergeInPlace(arr: number[], temp: number[], left: number, mid: number, right: number): void {
        // Copy to temp array
        for (let i = left; i <= right; i++) {
            temp[i] = arr[i];
        }
        
        let i = left, j = mid + 1, k = left;
        
        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
            }
        }
        
        while (i <= mid) arr[k++] = temp[i++];
        while (j <= right) arr[k++] = temp[j++];
    }
    
    const temp = new Array(nums.length);
    mergeSortHelper(nums, temp, 0, nums.length - 1);
}`,
        explanation: "In-place version using temporary array. More space-efficient than creating new arrays."
      },
      {
        language: "Java",
        code: `// Approach 2: In-place Merge Sort (Space Efficient)
// Time: O(n log n), Space: O(n)
import java.util.*;
class Solution {
    public void mergeSortInPlace(int[] nums) {
        int[] temp = new int[nums.length];
        mergeSortHelper(nums, temp, 0, nums.length - 1);
    }
    
    private void mergeSortHelper(int[] arr, int[] temp, int left, int right) {
        if (left >= right) return;
        
        int mid = (left + right) / 2;
        mergeSortHelper(arr, temp, left, mid);
        mergeSortHelper(arr, temp, mid + 1, right);
        mergeInPlace(arr, temp, left, mid, right);
    }
    
    private void mergeInPlace(int[] arr, int[] temp, int left, int mid, int right) {
        // Copy to temp array
        for (int i = left; i <= right; i++) {
            temp[i] = arr[i];
        }
        
        int i = left, j = mid + 1, k = left;
        
        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
            }
        }
        
        while (i <= mid) arr[k++] = temp[i++];
        while (j <= right) arr[k++] = temp[j++];
    }
}`,
        explanation: "In-place version using temporary array. More space-efficient than creating new arrays."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Bottom-up Merge Sort (Iterative)
// Time: O(n log n), Space: O(n)
function mergeSortBottomUp(nums: number[]): number[] {
    const n = nums.length;
    const result = [...nums];
    const temp = new Array(n);
    
    for (let size = 1; size < n; size *= 2) {
        for (let left = 0; left < n - size; left += 2 * size) {
            const mid = left + size - 1;
            const right = Math.min(left + 2 * size - 1, n - 1);
            
            mergeBottomUp(result, temp, left, mid, right);
        }
    }
    
    return result;
}

function mergeBottomUp(arr: number[], temp: number[], left: number, mid: number, right: number): void {
    for (let i = left; i <= right; i++) {
        temp[i] = arr[i];
    }
    
    let i = left, j = mid + 1, k = left;
    
    while (i <= mid && j <= right) {
        if (temp[i] <= temp[j]) {
            arr[k++] = temp[i++];
        } else {
            arr[k++] = temp[j++];
        }
    }
    
    while (i <= mid) arr[k++] = temp[i++];
    while (j <= right) arr[k++] = temp[j++];
}`,
        explanation: "Iterative bottom-up approach avoids recursion overhead. Better performance for large arrays."
      },
      {
        language: "Java",
        code: `// Approach 3: Bottom-up Merge Sort (Iterative)
// Time: O(n log n), Space: O(n)
import java.util.*;
class Solution {
    public int[] mergeSortBottomUp(int[] nums) {
        int n = nums.length;
        int[] result = Arrays.copyOf(nums, n);
        int[] temp = new int[n];
        
        for (int size = 1; size < n; size *= 2) {
            for (int left = 0; left < n - size; left += 2 * size) {
                int mid = left + size - 1;
                int right = Math.min(left + 2 * size - 1, n - 1);
                
                mergeBottomUp(result, temp, left, mid, right);
            }
        }
        
        return result;
    }
    
    private void mergeBottomUp(int[] arr, int[] temp, int left, int mid, int right) {
        for (int i = left; i <= right; i++) {
            temp[i] = arr[i];
        }
        
        int i = left, j = mid + 1, k = left;
        
        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
            }
        }
        
        while (i <= mid) arr[k++] = temp[i++];
        while (j <= right) arr[k++] = temp[j++];
    }
}`,
        explanation: "Iterative bottom-up approach avoids recursion overhead. Better performance for large arrays."
      },
      {
        language: "Python",
        code: `# Approach 1: Standard Merge Sort (Classic)
# Time: O(n log n), Space: O(n)
def merge_sort(nums):
    if len(nums) <= 1:
        return nums
    
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Add remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result`,
        explanation: "Classic divide-and-conquer recursive implementation. Most intuitive and easy to understand."
      },
      {
        language: "Python",
        code: `# Approach 2: In-place Merge Sort (Space Efficient)
# Time: O(n log n), Space: O(n)
def merge_sort_in_place(nums):
    def merge_sort_helper(arr, temp, left, right):
        if left >= right:
            return
        
        mid = (left + right) // 2
        merge_sort_helper(arr, temp, left, mid)
        merge_sort_helper(arr, temp, mid + 1, right)
        merge_in_place(arr, temp, left, mid, right)
    
    def merge_in_place(arr, temp, left, mid, right):
        # Copy to temp array
        for i in range(left, right + 1):
            temp[i] = arr[i]
        
        i, j, k = left, mid + 1, left
        
        while i <= mid and j <= right:
            if temp[i] <= temp[j]:
                arr[k] = temp[i]
                i += 1
            else:
                arr[k] = temp[j]
                j += 1
            k += 1
        
        while i <= mid:
            arr[k] = temp[i]
            i += 1
            k += 1
        while j <= right:
            arr[k] = temp[j]
            j += 1
            k += 1
    
    temp = [0] * len(nums)
    merge_sort_helper(nums, temp, 0, len(nums) - 1)`,
        explanation: "In-place version using temporary array. More space-efficient than creating new arrays."
      },
      {
        language: "Python",
        code: `# Approach 3: Bottom-up Merge Sort (Iterative)
# Time: O(n log n), Space: O(n)
def merge_sort_bottom_up(nums):
    n = len(nums)
    result = nums[:]
    temp = [0] * n
    
    size = 1
    while size < n:
        left = 0
        while left < n - size:
            mid = left + size - 1
            right = min(left + 2 * size - 1, n - 1)
            
            merge_bottom_up(result, temp, left, mid, right)
            left += 2 * size
        size *= 2
    
    return result

def merge_bottom_up(arr, temp, left, mid, right):
    for i in range(left, right + 1):
        temp[i] = arr[i]
    
    i, j, k = left, mid + 1, left
    
    while i <= mid and j <= right:
        if temp[i] <= temp[j]:
            arr[k] = temp[i]
            i += 1
        else:
            arr[k] = temp[j]
            j += 1
        k += 1
    
    while i <= mid:
        arr[k] = temp[i]
        i += 1
        k += 1
    while j <= right:
        arr[k] = temp[j]
        j += 1
        k += 1`,
        explanation: "Iterative bottom-up approach avoids recursion overhead. Better performance for large arrays."
      }
    ],
    tips: [
      "Divide and conquer: split array, sort halves, merge",
      "Stable sort: maintains relative order of equal elements",
      "Guaranteed O(n log n) performance in all cases",
      "Bottom-up approach avoids recursion overhead"
    ],
    tags: ["sorting", "divide-and-conquer", "merge-sort"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-sort-2",
    question: "Quick Sort Implementation - Implement quick sort algorithm with different partitioning schemes.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Lomuto Partition (O(n log n) average, O(n²) worst, O(log n) space): Classic partitioning scheme using last element as pivot. 2) Hoare Partition (O(n log n) average, O(n²) worst, O(log n) space): More efficient partitioning scheme with better cache performance. 3) Randomized Quick Sort: Random pivot selection to avoid worst-case scenarios. 4) 3-Way Quick Sort: Handles duplicate elements efficiently by partitioning into three regions. Hoare partition is generally more efficient, while 3-way partitioning is optimal for arrays with many duplicates.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Quick Sort with Lomuto Partition
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
function quickSort(nums: number[]): number[] {
    const arr = [...nums];
    
    function quickSortHelper(low: number, high: number): void {
        if (low < high) {
            const pivotIndex = partition(low, high);
            quickSortHelper(low, pivotIndex - 1);
            quickSortHelper(pivotIndex + 1, high);
        }
    }
    
    function partition(low: number, high: number): number {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }
    
    quickSortHelper(0, arr.length - 1);
    return arr;
}`,
        explanation: "Classic Lomuto partitioning scheme using last element as pivot. Simple to implement and understand."
      },
      {
        language: "Java",
        code: `// Approach 1: Quick Sort with Lomuto Partition
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
import java.util.*;
class Solution {
    public int[] quickSort(int[] nums) {
        int[] arr = Arrays.copyOf(nums, nums.length);
        quickSortHelper(arr, 0, arr.length - 1);
        return arr;
    }
    
    private void quickSortHelper(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quickSortHelper(arr, low, pivotIndex - 1);
            quickSortHelper(arr, pivotIndex + 1, high);
        }
    }
    
    private int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
}`,
        explanation: "Classic Lomuto partitioning scheme using last element as pivot. Simple to implement and understand."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Hoare Partition Scheme (More Efficient)
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
function quickSortHoare(nums: number[]): number[] {
    const arr = [...nums];
    
    function quickSortHelper(low: number, high: number): void {
        if (low < high) {
            const pivotIndex = partitionHoare(low, high);
            quickSortHelper(low, pivotIndex);
            quickSortHelper(pivotIndex + 1, high);
        }
    }
    
    function partitionHoare(low: number, high: number): number {
        const pivot = arr[low];
        let i = low - 1;
        let j = high + 1;
        
        while (true) {
            do { i++; } while (arr[i] < pivot);
            do { j--; } while (arr[j] > pivot);
            
            if (i >= j) return j;
            
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    quickSortHelper(0, arr.length - 1);
    return arr;
}`,
        explanation: "Hoare partitioning scheme is more efficient with better cache performance and fewer swaps."
      },
      {
        language: "Java",
        code: `// Approach 2: Hoare Partition Scheme (More Efficient)
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
import java.util.*;
class Solution {
    public int[] quickSortHoare(int[] nums) {
        int[] arr = Arrays.copyOf(nums, nums.length);
        quickSortHelper(arr, 0, arr.length - 1);
        return arr;
    }
    
    private void quickSortHelper(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partitionHoare(arr, low, high);
            quickSortHelper(arr, low, pivotIndex);
            quickSortHelper(arr, pivotIndex + 1, high);
        }
    }
    
    private int partitionHoare(int[] arr, int low, int high) {
        int pivot = arr[low];
        int i = low - 1;
        int j = high + 1;
        
        while (true) {
            do { i++; } while (arr[i] < pivot);
            do { j--; } while (arr[j] > pivot);
            
            if (i >= j) return j;
            
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
}`,
        explanation: "Hoare partitioning scheme is more efficient with better cache performance and fewer swaps."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Randomized Quick Sort (Better Average Case)
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
function quickSortRandomized(nums: number[]): number[] {
    const arr = [...nums];
    
    function quickSortHelper(low: number, high: number): void {
        if (low < high) {
            // Randomize pivot selection
            const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
            [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];
            
            const pivotIndex = partition(low, high);
            quickSortHelper(low, pivotIndex - 1);
            quickSortHelper(pivotIndex + 1, high);
        }
    }
    
    function partition(low: number, high: number): number {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }
    
    quickSortHelper(0, arr.length - 1);
    return arr;
}`,
        explanation: "Randomized pivot selection prevents worst-case O(n²) performance on sorted arrays."
      },
      {
        language: "Java",
        code: `// Approach 3: Randomized Quick Sort (Better Average Case)
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
import java.util.*;
class Solution {
    public int[] quickSortRandomized(int[] nums) {
        int[] arr = Arrays.copyOf(nums, nums.length);
        quickSortHelper(arr, 0, arr.length - 1);
        return arr;
    }
    
    private void quickSortHelper(int[] arr, int low, int high) {
        if (low < high) {
            // Randomize pivot selection
            int randomIndex = low + (int)(Math.random() * (high - low + 1));
            int temp = arr[randomIndex];
            arr[randomIndex] = arr[high];
            arr[high] = temp;
            
            int pivotIndex = partition(arr, low, high);
            quickSortHelper(arr, low, pivotIndex - 1);
            quickSortHelper(arr, pivotIndex + 1, high);
        }
    }
    
    private int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
}`,
        explanation: "Randomized pivot selection prevents worst-case O(n²) performance on sorted arrays."
      },
      {
        language: "TypeScript",
        code: `// Approach 4: 3-Way Quick Sort (Handles Duplicates Efficiently)
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
function quickSort3Way(nums: number[]): number[] {
    const arr = [...nums];
    
    function quickSort3WayHelper(low: number, high: number): void {
        if (low >= high) return;
        
        const [lt, gt] = partition3Way(low, high);
        quickSort3WayHelper(low, lt - 1);
        quickSort3WayHelper(gt + 1, high);
    }
    
    function partition3Way(low: number, high: number): [number, number] {
        const pivot = arr[low];
        let lt = low;      // arr[low...lt-1] < pivot
        let i = low + 1;   // arr[lt...i-1] = pivot
        let gt = high + 1; // arr[gt...high] > pivot
        
        while (i < gt) {
            if (arr[i] < pivot) {
                [arr[lt], arr[i]] = [arr[i], arr[lt]];
                lt++;
                i++;
            } else if (arr[i] > pivot) {
                gt--;
                [arr[i], arr[gt]] = [arr[gt], arr[i]];
            } else {
                i++;
            }
        }
        
        return [lt, gt];
    }
    
    quickSort3WayHelper(0, arr.length - 1);
    return arr;
}`,
        explanation: "3-way partitioning handles duplicate elements efficiently by creating three regions."
      },
      {
        language: "Java",
        code: `// Approach 4: 3-Way Quick Sort (Handles Duplicates Efficiently)
// Time: O(n log n) average, O(n²) worst, Space: O(log n) average
import java.util.*;
class Solution {
    public int[] quickSort3Way(int[] nums) {
        int[] arr = Arrays.copyOf(nums, nums.length);
        quickSort3WayHelper(arr, 0, arr.length - 1);
        return arr;
    }
    
    private void quickSort3WayHelper(int[] arr, int low, int high) {
        if (low >= high) return;
        
        int[] pivotRange = partition3Way(arr, low, high);
        int lt = pivotRange[0];
        int gt = pivotRange[1];
        
        quickSort3WayHelper(arr, low, lt - 1);
        quickSort3WayHelper(arr, gt + 1, high);
    }
    
    private int[] partition3Way(int[] arr, int low, int high) {
        int pivot = arr[low];
        int lt = low;      // arr[low...lt-1] < pivot
        int i = low + 1;   // arr[lt...i-1] = pivot
        int gt = high + 1; // arr[gt...high] > pivot
        
        while (i < gt) {
            if (arr[i] < pivot) {
                int temp = arr[lt];
                arr[lt] = arr[i];
                arr[i] = temp;
                lt++;
                i++;
            } else if (arr[i] > pivot) {
                gt--;
                int temp = arr[i];
                arr[i] = arr[gt];
                arr[gt] = temp;
            } else {
                i++;
            }
        }
        
        return new int[]{lt, gt};
    }
}`,
        explanation: "3-way partitioning handles duplicate elements efficiently by creating three regions."
      },
      {
        language: "Python",
        code: `# Approach 1: Quick Sort with Lomuto Partition
# Time: O(n log n) average, O(n²) worst, Space: O(log n) average
def quick_sort(nums):
    arr = nums[:]
    
    def quick_sort_helper(low, high):
        if low < high:
            pivot_index = partition(low, high)
            quick_sort_helper(low, pivot_index - 1)
            quick_sort_helper(pivot_index + 1, high)
    
    def partition(low, high):
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        return i + 1
    
    quick_sort_helper(0, len(arr) - 1)
    return arr`,
        explanation: "Classic Lomuto partitioning scheme using last element as pivot. Simple to implement and understand."
      },
      {
        language: "Python",
        code: `# Approach 2: Hoare Partition Scheme (More Efficient)
# Time: O(n log n) average, O(n²) worst, Space: O(log n) average
def quick_sort_hoare(nums):
    arr = nums[:]
    
    def quick_sort_helper(low, high):
        if low < high:
            pivot_index = partition_hoare(low, high)
            quick_sort_helper(low, pivot_index)
            quick_sort_helper(pivot_index + 1, high)
    
    def partition_hoare(low, high):
        pivot = arr[low]
        i = low - 1
        j = high + 1
        
        while True:
            i += 1
            while arr[i] < pivot:
                i += 1
            
            j -= 1
            while arr[j] > pivot:
                j -= 1
            
            if i >= j:
                return j
            
            arr[i], arr[j] = arr[j], arr[i]
    
    quick_sort_helper(0, len(arr) - 1)
    return arr`,
        explanation: "Hoare partitioning scheme is more efficient with better cache performance and fewer swaps."
      },
      {
        language: "Python",
        code: `# Approach 3: Randomized Quick Sort (Better Average Case)
# Time: O(n log n) average, O(n²) worst, Space: O(log n) average
import random

def quick_sort_randomized(nums):
    arr = nums[:]
    
    def quick_sort_helper(low, high):
        if low < high:
            # Randomize pivot selection
            random_index = random.randint(low, high)
            arr[random_index], arr[high] = arr[high], arr[random_index]
            
            pivot_index = partition(low, high)
            quick_sort_helper(low, pivot_index - 1)
            quick_sort_helper(pivot_index + 1, high)
    
    def partition(low, high):
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        return i + 1
    
    quick_sort_helper(0, len(arr) - 1)
    return arr`,
        explanation: "Randomized pivot selection prevents worst-case O(n²) performance on sorted arrays."
      },
      {
        language: "Python",
        code: `# Approach 4: 3-Way Quick Sort (Handles Duplicates Efficiently)
# Time: O(n log n) average, O(n²) worst, Space: O(log n) average
def quick_sort_3way(nums):
    arr = nums[:]
    
    def quick_sort_3way_helper(low, high):
        if low >= high:
            return
        
        lt, gt = partition_3way(low, high)
        quick_sort_3way_helper(low, lt - 1)
        quick_sort_3way_helper(gt + 1, high)
    
    def partition_3way(low, high):
        pivot = arr[low]
        lt = low        # arr[low...lt-1] < pivot
        i = low + 1     # arr[lt...i-1] = pivot
        gt = high + 1   # arr[gt...high] > pivot
        
        while i < gt:
            if arr[i] < pivot:
                arr[lt], arr[i] = arr[i], arr[lt]
                lt += 1
                i += 1
            elif arr[i] > pivot:
                gt -= 1
                arr[i], arr[gt] = arr[gt], arr[i]
            else:
                i += 1
        
        return lt, gt
    
    quick_sort_3way_helper(0, len(arr) - 1)
    return arr`,
        explanation: "3-way partitioning handles duplicate elements efficiently by creating three regions."
      }
    ],
    tips: [
      "Choose pivot carefully: last element, random, or median-of-three",
      "Lomuto vs Hoare partitioning schemes have different characteristics",
      "Randomization prevents worst-case O(n²) on sorted arrays",
      "3-way partitioning handles many duplicates efficiently"
    ],
    tags: ["sorting", "divide-and-conquer", "quick-sort"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-search-3",
    question: "Find Peak Element - A peak element is greater than its neighbors. Given an array, find a peak element and return its index.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Binary Search Approach (O(log n) time, O(1) space): Most efficient approach using binary search to eliminate half of the array based on slope. 2) Linear Search (O(n) time, O(1) space): Simple linear scan to find first peak element. 3) Find All Peaks Extension: Find all peak elements in the array. 4) 2D Peak Finding: Advanced extension to find peak in 2D grid. Binary search is optimal for finding a single peak, while linear search provides better understanding of the problem.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Binary Search Approach (Optimal)
// Time: O(log n), Space: O(1)
function findPeakElement(nums: number[]): number {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] < nums[mid + 1]) {
            // Peak is in right half
            left = mid + 1;
        } else {
            // Peak is in left half (including mid)
            right = mid;
        }
    }
    
    return left;
}`,
        explanation: "Binary search eliminates half of array based on slope. Most efficient approach for finding a single peak."
      },
      {
        language: "Java",
        code: `// Approach 1: Binary Search Approach (Optimal)
// Time: O(log n), Space: O(1)
class Solution {
    public int findPeakElement(int[] nums) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left < right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] < nums[mid + 1]) {
                // Peak is in right half
                left = mid + 1;
            } else {
                // Peak is in left half (including mid)
                right = mid;
            }
        }
        
        return left;
    }
}`,
        explanation: "Binary search eliminates half of array based on slope. Most efficient approach for finding a single peak."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Linear Search (for comparison)
// Time: O(n), Space: O(1)
function findPeakElementLinear(nums: number[]): number {
    for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i] > nums[i + 1]) {
            return i;
        }
    }
    return nums.length - 1;
}`,
        explanation: "Linear search finds first peak element. Simple but less efficient than binary search."
      },
      {
        language: "Java",
        code: `// Approach 2: Linear Search (for comparison)
// Time: O(n), Space: O(1)
class Solution {
    public int findPeakElementLinear(int[] nums) {
        for (int i = 0; i < nums.length - 1; i++) {
            if (nums[i] > nums[i + 1]) {
                return i;
            }
        }
        return nums.length - 1;
    }
}`,
        explanation: "Linear search finds first peak element. Simple but less efficient than binary search."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Find All Peaks
// Time: O(n), Space: O(1)
function findAllPeaks(nums: number[]): number[] {
    const peaks: number[] = [];
    
    for (let i = 0; i < nums.length; i++) {
        const leftOk = i === 0 || nums[i] > nums[i - 1];
        const rightOk = i === nums.length - 1 || nums[i] > nums[i + 1];
        
        if (leftOk && rightOk) {
            peaks.push(i);
        }
    }
    
    return peaks;
}`,
        explanation: "Extension that finds all peak elements in the array. Useful when multiple peaks are needed."
      },
      {
        language: "Java",
        code: `// Approach 3: Find All Peaks
// Time: O(n), Space: O(1)
import java.util.*;
class Solution {
    public List<Integer> findAllPeaks(int[] nums) {
        List<Integer> peaks = new ArrayList<>();
        
        for (int i = 0; i < nums.length; i++) {
            boolean leftOk = i == 0 || nums[i] > nums[i - 1];
            boolean rightOk = i == nums.length - 1 || nums[i] > nums[i + 1];
            
            if (leftOk && rightOk) {
                peaks.add(i);
            }
        }
        
        return peaks;
    }
}`,
        explanation: "Extension that finds all peak elements in the array. Useful when multiple peaks are needed."
      },
      {
        language: "TypeScript",
        code: `// Approach 4: 2D Peak Finding (Advanced)
// Time: O(n log m), Space: O(1) where n = rows, m = columns
function findPeakGrid(mat: number[][]): number[] {
    const m = mat.length;
    const n = mat[0].length;
    
    let left = 0;
    let right = n - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        // Find max element in middle column
        let maxRow = 0;
        for (let i = 1; i < m; i++) {
            if (mat[i][mid] > mat[maxRow][mid]) {
                maxRow = i;
            }
        }
        
        const leftVal = mid > 0 ? mat[maxRow][mid - 1] : -1;
        const rightVal = mid < n - 1 ? mat[maxRow][mid + 1] : -1;
        
        if (mat[maxRow][mid] > leftVal && mat[maxRow][mid] > rightVal) {
            return [maxRow, mid];
        } else if (mat[maxRow][mid] < leftVal) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return [-1, -1];
}`,
        explanation: "Advanced 2D peak finding using column-wise binary search. Demonstrates extension to higher dimensions."
      },
      {
        language: "Java",
        code: `// Approach 4: 2D Peak Finding (Advanced)
// Time: O(n log m), Space: O(1) where n = rows, m = columns
import java.util.*;
class Solution {
    public int[] findPeakGrid(int[][] mat) {
        int m = mat.length;
        int n = mat[0].length;
        
        int left = 0;
        int right = n - 1;
        
        while (left <= right) {
            int mid = (left + right) / 2;
            
            // Find max element in middle column
            int maxRow = 0;
            for (int i = 1; i < m; i++) {
                if (mat[i][mid] > mat[maxRow][mid]) {
                    maxRow = i;
                }
            }
            
            int leftVal = mid > 0 ? mat[maxRow][mid - 1] : -1;
            int rightVal = mid < n - 1 ? mat[maxRow][mid + 1] : -1;
            
            if (mat[maxRow][mid] > leftVal && mat[maxRow][mid] > rightVal) {
                return new int[]{maxRow, mid};
            } else if (mat[maxRow][mid] < leftVal) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        return new int[]{-1, -1};
    }
}`,
        explanation: "Advanced 2D peak finding using column-wise binary search. Demonstrates extension to higher dimensions."
      },
      {
        language: "Python",
        code: `# Approach 1: Binary Search Approach (Optimal)
# Time: O(log n), Space: O(1)
def find_peak_element(nums):
    left, right = 0, len(nums) - 1
    
    while left < right:
        mid = (left + right) // 2
        
        if nums[mid] < nums[mid + 1]:
            # Peak is in right half
            left = mid + 1
        else:
            # Peak is in left half (including mid)
            right = mid
    
    return left`,
        explanation: "Binary search eliminates half of array based on slope. Most efficient approach for finding a single peak."
      },
      {
        language: "Python",
        code: `# Approach 2: Linear Search (for comparison)
# Time: O(n), Space: O(1)
def find_peak_element_linear(nums):
    for i in range(len(nums) - 1):
        if nums[i] > nums[i + 1]:
            return i
    return len(nums) - 1`,
        explanation: "Linear search finds first peak element. Simple but less efficient than binary search."
      },
      {
        language: "Python",
        code: `# Approach 3: Find All Peaks
# Time: O(n), Space: O(1)
def find_all_peaks(nums):
    peaks = []
    
    for i in range(len(nums)):
        left_ok = i == 0 or nums[i] > nums[i - 1]
        right_ok = i == len(nums) - 1 or nums[i] > nums[i + 1]
        
        if left_ok and right_ok:
            peaks.append(i)
    
    return peaks`,
        explanation: "Extension that finds all peak elements in the array. Useful when multiple peaks are needed."
      },
      {
        language: "Python",
        code: `# Approach 4: 2D Peak Finding (Advanced)
# Time: O(n log m), Space: O(1) where n = rows, m = columns
def find_peak_grid(mat):
    m, n = len(mat), len(mat[0])
    left, right = 0, n - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        # Find max element in middle column
        max_row = 0
        for i in range(1, m):
            if mat[i][mid] > mat[max_row][mid]:
                max_row = i
        
        left_val = mat[max_row][mid - 1] if mid > 0 else -1
        right_val = mat[max_row][mid + 1] if mid < n - 1 else -1
        
        if mat[max_row][mid] > left_val and mat[max_row][mid] > right_val:
            return [max_row, mid]
        elif mat[max_row][mid] < left_val:
            right = mid - 1
        else:
            left = mid + 1
    
    return [-1, -1]`,
        explanation: "Advanced 2D peak finding using column-wise binary search. Demonstrates extension to higher dimensions."
      }
    ],
    tips: [
      "Binary search works because we can eliminate half based on slope",
      "If nums[mid] < nums[mid+1], peak must be on right side",
      "Array boundaries are treated as negative infinity",
      "2D version uses similar principle with column-wise binary search"
    ],
    tags: ["array", "binary-search"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];