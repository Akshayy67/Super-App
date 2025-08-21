import { Question } from "../../InterviewSubjects";

// Enhanced Search and Sort DSA Questions with comprehensive implementations
export const enhancedSearchSortQuestions: Question[] = [
  {
    id: "enhanced-search-1",
    question: "Binary Search - Given a sorted array of integers nums and an integer target, return the index of target or -1 if not found.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Standard Binary Search (Optimal)
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
}

// Recursive Binary Search
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
}

// Find insertion position (lower bound)
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
    type: "coding",
    sampleAnswer: `
// Modified Binary Search (Optimal)
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
}

// Handle duplicates version
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
}

// Find minimum in rotated array
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
    type: "coding",
    sampleAnswer: `
// Merge Sort Implementation
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
}

// In-place Merge Sort (more space efficient)
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
}

// Bottom-up Merge Sort (iterative)
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
    type: "coding",
    sampleAnswer: `
// Quick Sort with Lomuto Partition
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
}

// Hoare Partition Scheme (more efficient)
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
}

// Randomized Quick Sort (better average case)
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
}

// 3-Way Quick Sort (handles duplicates efficiently)
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
    type: "coding",
    sampleAnswer: `
// Binary Search Approach (Optimal)
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
}

// Linear Search (for comparison)
// Time: O(n), Space: O(1)
function findPeakElementLinear(nums: number[]): number {
    for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i] > nums[i + 1]) {
            return i;
        }
    }
    return nums.length - 1;
}

// Find all peaks
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
}

// 2D Peak Finding (Advanced)
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