import { Question } from "../../InterviewSubjects";

// Enhanced Heap and Priority Queue DSA Questions with comprehensive implementations
export const enhancedHeapQuestions: Question[] = [
  {
    id: "enhanced-heap-1",
    question: "Kth Largest Element in Array - Find the kth largest element in an unsorted array.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Quick Select (O(n) average, O(n²) worst case, O(1) space): Partition-based algorithm similar to quicksort. 2) Min Heap (O(n log k) time, O(k) space): Maintain heap of size k with largest elements. 3) Sorting (O(n log n) time, O(1) space): Simple but less efficient approach. Quick Select is optimal for average case, while Min Heap is better for worst-case guarantees.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Quick Select (Optimal average case)
// Time: O(n) average, O(n²) worst, Space: O(1)
function findKthLargest(nums: number[], k: number): number {
    k = nums.length - k; // Convert to kth smallest (0-indexed)
    
    function quickSelect(left: number, right: number): number {
        const pivot = partition(left, right);
        
        if (pivot === k) {
            return nums[pivot];
        } else if (pivot < k) {
            return quickSelect(pivot + 1, right);
        } else {
            return quickSelect(left, pivot - 1);
        }
    }
    
    function partition(left: number, right: number): number {
        const pivotValue = nums[right];
        let i = left;
        
        for (let j = left; j < right; j++) {
            if (nums[j] <= pivotValue) {
                [nums[i], nums[j]] = [nums[j], nums[i]];
                i++;
            }
        }
        
        [nums[i], nums[right]] = [nums[right], nums[i]];
        return i;
    }
    
    return quickSelect(0, nums.length - 1);
}`,
        explanation: "Quick Select uses partitioning to find the kth element. Most efficient average case but can degrade to O(n²) in worst case."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Min Heap
// Time: O(n log k), Space: O(k)
function findKthLargestHeap(nums: number[], k: number): number {
    class MinHeap {
        heap: number[] = [];
        
        push(val: number): void {
            this.heap.push(val);
            this.bubbleUp(this.heap.length - 1);
        }
        
        pop(): number {
            if (this.heap.length === 1) return this.heap.pop()!;
            
            const min = this.heap[0];
            this.heap[0] = this.heap.pop()!;
            this.bubbleDown(0);
            return min;
        }
        
        peek(): number {
            return this.heap[0];
        }
        
        size(): number {
            return this.heap.length;
        }
        
        private bubbleUp(index: number): void {
            while (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                if (this.heap[parentIndex] <= this.heap[index]) break;
                
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
        }
        
        private bubbleDown(index: number): void {
            while (true) {
                let minIndex = index;
                const leftChild = 2 * index + 1;
                const rightChild = 2 * index + 2;
                
                if (leftChild < this.heap.length && this.heap[leftChild] < this.heap[minIndex]) {
                    minIndex = leftChild;
                }
                
                if (rightChild < this.heap.length && this.heap[rightChild] < this.heap[minIndex]) {
                    minIndex = rightChild;
                }
                
                if (minIndex === index) break;
                
                [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
                index = minIndex;
            }
        }
    }
    
    const minHeap = new MinHeap();
    
    for (const num of nums) {
        minHeap.push(num);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
    }
    
    return minHeap.peek();
}`,
        explanation: "Min Heap maintains k largest elements. Guaranteed O(n log k) time complexity but uses extra space."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Sorting
// Time: O(n log n), Space: O(1)
function findKthLargestSort(nums: number[], k: number): number {
    nums.sort((a, b) => b - a);
    return nums[k - 1];
}`,
        explanation: "Simple sorting approach. Less efficient but easiest to implement and understand."
      }
    ],
    tips: [
      "Quick select is optimal average case with O(n) time",
      "Min heap of size k maintains k largest elements",
      "Quick select modifies array, heap approach doesn't",
      "Consider randomized pivot for better average performance"
    ],
    tags: ["array", "heap", "quickselect", "sorting"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-2",
    question: "Top K Frequent Elements - Given integer array and integer k, return k most frequent elements.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Bucket Sort (O(n) time, O(n) space): Most efficient approach using frequency buckets. 2) Min Heap (O(n log k) time, O(n + k) space): Maintain heap of size k with most frequent elements. 3) Quick Select (O(n) average time, O(n) space): Partition-based approach for finding kth most frequent. Bucket sort is optimal for time complexity, while heap approach provides better space efficiency for large k.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Bucket Sort (Optimal)
// Time: O(n), Space: O(n)
function topKFrequent(nums: number[], k: number): number[] {
    // Count frequencies
    const frequencyMap = new Map<number, number>();
    for (const num of nums) {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    }
    
    // Create buckets for each frequency
    const buckets: number[][] = Array(nums.length + 1).fill(null).map(() => []);
    
    for (const [num, freq] of frequencyMap) {
        buckets[freq].push(num);
    }
    
    // Collect top k elements
    const result: number[] = [];
    for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
        result.push(...buckets[i]);
    }
    
    return result.slice(0, k);
}`,
        explanation: "Bucket sort approach groups elements by frequency. Most efficient with O(n) time complexity."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Min Heap
// Time: O(n log k), Space: O(n + k)
function topKFrequentHeap(nums: number[], k: number): number[] {
    const frequencyMap = new Map<number, number>();
    for (const num of nums) {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    }
    
    // Min heap to keep k most frequent elements
    const minHeap: [number, number][] = []; // [frequency, number]
    
    for (const [num, freq] of frequencyMap) {
        minHeap.push([freq, num]);
        minHeap.sort((a, b) => a[0] - b[0]);
        
        if (minHeap.length > k) {
            minHeap.shift();
        }
    }
    
    return minHeap.map(([freq, num]) => num);
}`,
        explanation: "Min heap maintains k most frequent elements. Good for when k is much smaller than n."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Quick Select
// Time: O(n) average, Space: O(n)
function topKFrequentQuickSelect(nums: number[], k: number): number[] {
    const frequencyMap = new Map<number, number>();
    for (const num of nums) {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    }
    
    const uniqueNums = Array.from(frequencyMap.keys());
    
    function quickSelect(left: number, right: number, kSmallest: number): void {
        if (left === right) return;
        
        const pivotIndex = partition(left, right);
        
        if (kSmallest === pivotIndex) {
            return;
        } else if (kSmallest < pivotIndex) {
            quickSelect(left, pivotIndex - 1, kSmallest);
        } else {
            quickSelect(pivotIndex + 1, right, kSmallest);
        }
    }
    
    function partition(left: number, right: number): number {
        const pivotFreq = frequencyMap.get(uniqueNums[right])!;
        let i = left;
        
        for (let j = left; j < right; j++) {
            if (frequencyMap.get(uniqueNums[j])! < pivotFreq) {
                [uniqueNums[i], uniqueNums[j]] = [uniqueNums[j], uniqueNums[i]];
                i++;
            }
        }
        
        [uniqueNums[i], uniqueNums[right]] = [uniqueNums[right], uniqueNums[i]];
        return i;
    }
    
    quickSelect(0, uniqueNums.length - 1, uniqueNums.length - k);
    return uniqueNums.slice(uniqueNums.length - k);
}`,
        explanation: "Quick select approach finds kth most frequent element. Good average case performance."
      }
    ],
    tips: [
      "Bucket sort achieves O(n) by using frequency as index",
      "Min heap of size k keeps track of top k elements",
      "Quick select finds kth element without full sorting",
      "Count frequencies first, then find top k by frequency"
    ],
    tags: ["array", "heap", "bucket-sort", "quickselect", "hash-table"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-3",
    question: "Merge k Sorted Arrays - Given k sorted arrays, merge them into one sorted array.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Min Heap (O(n log k) time, O(k) space): Most efficient approach using priority queue to track smallest element from each array. 2) Divide and Conquer (O(n log k) time, O(log k) space): Merge arrays pairwise until one remains. 3) Simple Merge (O(nk) time, O(n) space): Merge arrays one by one sequentially. Min heap approach is optimal for time complexity and provides the best practical performance.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Min Heap (Optimal)
// Time: O(n log k), Space: O(k) where n = total elements
function mergeKSortedArrays(arrays: number[][]): number[] {
    class MinHeap {
        heap: [number, number, number][] = []; // [value, arrayIndex, elementIndex]
        
        push(item: [number, number, number]): void {
            this.heap.push(item);
            this.bubbleUp(this.heap.length - 1);
        }
        
        pop(): [number, number, number] | null {
            if (this.heap.length === 0) return null;
            if (this.heap.length === 1) return this.heap.pop()!;
            
            const min = this.heap[0];
            this.heap[0] = this.heap.pop()!;
            this.bubbleDown(0);
            return min;
        }
        
        private bubbleUp(index: number): void {
            while (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                if (this.heap[parentIndex][0] <= this.heap[index][0]) break;
                
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
        }
        
        private bubbleDown(index: number): void {
            while (true) {
                let minIndex = index;
                const leftChild = 2 * index + 1;
                const rightChild = 2 * index + 2;
                
                if (leftChild < this.heap.length && this.heap[leftChild][0] < this.heap[minIndex][0]) {
                    minIndex = leftChild;
                }
                
                if (rightChild < this.heap.length && this.heap[rightChild][0] < this.heap[minIndex][0]) {
                    minIndex = rightChild;
                }
                
                if (minIndex === index) break;
                
                [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
                index = minIndex;
            }
        }
        
        isEmpty(): boolean {
            return this.heap.length === 0;
        }
    }
    
    const result: number[] = [];
    const minHeap = new MinHeap();
    
    // Initialize heap with first element from each array
    for (let i = 0; i < arrays.length; i++) {
        if (arrays[i].length > 0) {
            minHeap.push([arrays[i][0], i, 0]);
        }
    }
    
    while (!minHeap.isEmpty()) {
        const [value, arrayIndex, elementIndex] = minHeap.pop()!;
        result.push(value);
        
        // Add next element from same array
        if (elementIndex + 1 < arrays[arrayIndex].length) {
            minHeap.push([
                arrays[arrayIndex][elementIndex + 1],
                arrayIndex,
                elementIndex + 1
            ]);
        }
    }
    
    return result;
}`,
        explanation: "Min heap approach tracks smallest unprocessed element from each array. Most efficient with O(n log k) time complexity."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Divide and Conquer
// Time: O(n log k), Space: O(log k)
function mergeKSortedArraysDC(arrays: number[][]): number[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];
    
    function mergeTwo(arr1: number[], arr2: number[]): number[] {
        const result: number[] = [];
        let i = 0, j = 0;
        
        while (i < arr1.length && j < arr2.length) {
            if (arr1[i] <= arr2[j]) {
                result.push(arr1[i++]);
            } else {
                result.push(arr2[j++]);
            }
        }
        
        while (i < arr1.length) result.push(arr1[i++]);
        while (j < arr2.length) result.push(arr2[j++]);
        
        return result;
    }
    
    while (arrays.length > 1) {
        const mergedArrays: number[][] = [];
        
        for (let i = 0; i < arrays.length; i += 2) {
            const arr1 = arrays[i];
            const arr2 = i + 1 < arrays.length ? arrays[i + 1] : [];
            mergedArrays.push(mergeTwo(arr1, arr2));
        }
        
        arrays = mergedArrays;
    }
    
    return arrays[0];
}`,
        explanation: "Divide and conquer approach merges arrays pairwise until one remains. Good space efficiency but more complex."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Simple Merge
// Time: O(nk), Space: O(n)
function mergeKSortedArraysSimple(arrays: number[][]): number[] {
    if (arrays.length === 0) return [];
    
    let result = arrays[0];
    
    for (let i = 1; i < arrays.length; i++) {
        result = mergeTwo(result, arrays[i]);
    }
    
    function mergeTwo(arr1: number[], arr2: number[]): number[] {
        const result: number[] = [];
        let i = 0, j = 0;
        
        while (i < arr1.length && j < arr2.length) {
            if (arr1[i] <= arr2[j]) {
                result.push(arr1[i++]);
            } else {
                result.push(arr2[j++]);
            }
        }
        
        while (i < arr1.length) result.push(arr1[i++]);
        while (j < arr2.length) result.push(arr2[j++]);
        
        return result;
    }
    
    return result;
}`,
        explanation: "Simple approach merges arrays sequentially. Less efficient but easier to implement and understand."
      }
    ],
    tips: [
      "Min heap tracks smallest unprocessed element from each array",
      "Always extract minimum and add next element from same array",
      "Divide and conquer merges arrays pairwise",
      "Heap approach processes elements in sorted order"
    ],
    tags: ["heap", "divide-and-conquer", "merge-sort", "array"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-4",
    question: "Find Median from Data Stream - Design data structure that supports adding integers and finding median.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Two Heaps (O(log n) add, O(1) median, O(n) space): Use max heap for left half and min heap for right half. 2) Optimized Heap Implementation: Same logic but with proper heap data structures instead of arrays. 3) Balanced Tree Approach: Use ordered data structure to maintain sorted order. Two heaps approach is optimal for this problem, providing efficient insertion and constant-time median retrieval.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Heaps (Optimal)
// addNum: O(log n), findMedian: O(1), Space: O(n)
class MedianFinder {
    private maxHeap: number[] = []; // Left half (smaller elements)
    private minHeap: number[] = []; // Right half (larger elements)
    
    addNum(num: number): void {
        // Add to appropriate heap
        if (this.maxHeap.length === 0 || num <= this.maxHeap[0]) {
            this.maxHeapPush(num);
        } else {
            this.minHeapPush(num);
        }
        
        // Balance heaps
        if (this.maxHeap.length > this.minHeap.length + 1) {
            this.minHeapPush(this.maxHeapPop());
        } else if (this.minHeap.length > this.maxHeap.length + 1) {
            this.maxHeapPush(this.minHeapPop());
        }
    }
    
    findMedian(): number {
        if (this.maxHeap.length === this.minHeap.length) {
            return (this.maxHeap[0] + this.minHeap[0]) / 2;
        } else if (this.maxHeap.length > this.minHeap.length) {
            return this.maxHeap[0];
        } else {
            return this.minHeap[0];
        }
    }
    
    private maxHeapPush(val: number): void {
        this.maxHeap.push(val);
        this.maxHeap.sort((a, b) => b - a);
    }
    
    private maxHeapPop(): number {
        return this.maxHeap.shift()!;
    }
    
    private minHeapPush(val: number): void {
        this.minHeap.push(val);
        this.minHeap.sort((a, b) => a - b);
    }
    
    private minHeapPop(): number {
        return this.minHeap.shift()!;
    }
}`,
        explanation: "Two heaps approach maintains balanced left and right halves. Max heap stores smaller elements, min heap stores larger ones."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Optimized Heap Implementation
// addNum: O(log n), findMedian: O(1), Space: O(n)
class OptimizedMedianFinder {
    private maxHeap: MaxHeap = new MaxHeap();
    private minHeap: MinHeap = new MinHeap();
    
    addNum(num: number): void {
        if (this.maxHeap.isEmpty() || num <= this.maxHeap.peek()) {
            this.maxHeap.push(num);
        } else {
            this.minHeap.push(num);
        }
        
        // Balance heaps
        if (this.maxHeap.size() > this.minHeap.size() + 1) {
            this.minHeap.push(this.maxHeap.pop());
        } else if (this.minHeap.size() > this.maxHeap.size() + 1) {
            this.maxHeap.push(this.minHeap.pop());
        }
    }
    
    findMedian(): number {
        if (this.maxHeap.size() === this.minHeap.size()) {
            return (this.maxHeap.peek() + this.minHeap.peek()) / 2;
        } else if (this.maxHeap.size() > this.minHeap.size()) {
            return this.maxHeap.peek();
        } else {
            return this.minHeap.peek();
        }
    }
}`,
        explanation: "Same logic as approach 1 but uses proper heap data structures for better performance and cleaner code."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Balanced Tree Approach
// addNum: O(log n), findMedian: O(1), Space: O(n)
class BalancedTreeMedianFinder {
    private sortedArray: number[] = [];
    
    addNum(num: number): void {
        // Insert in sorted order using binary search
        const insertIndex = this.binarySearch(num);
        this.sortedArray.splice(insertIndex, 0, num);
    }
    
    findMedian(): number {
        const n = this.sortedArray.length;
        if (n % 2 === 0) {
            return (this.sortedArray[n/2 - 1] + this.sortedArray[n/2]) / 2;
        } else {
            return this.sortedArray[Math.floor(n/2)];
        }
    }
    
    private binarySearch(target: number): number {
        let left = 0;
        let right = this.sortedArray.length;
        
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (this.sortedArray[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        return left;
    }
}`,
        explanation: "Maintains sorted array using binary search insertion. Simpler to understand but less efficient than heap approach."
      }
    ],
    tips: [
      "Use two heaps: max heap for left half, min heap for right half",
      "Keep heaps balanced: size difference ≤ 1",
      "Median is top of larger heap or average of both tops",
      "Add to appropriate heap based on comparison with current median"
    ],
    tags: ["heap", "design", "data-stream"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-5",
    question: "Task Scheduler - Given array of tasks and cooldown time n, return minimum time to complete all tasks.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Max Heap with Cooldown Queue (O(n) time, O(1) space): Simulate task execution using priority queue and cooldown tracking. 2) Mathematical Approach (O(n) time, O(1) space): Calculate minimum time using frequency analysis and idle slot calculation. 3) Greedy Simulation: Track task execution order and cooldown periods. Mathematical approach is most efficient, while heap approach provides better understanding of the process.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Max Heap with Cooldown Queue
// Time: O(n), Space: O(1) - limited by 26 task types
function leastInterval(tasks: string[], n: number): number {
    // Count task frequencies
    const taskCount = new Map<string, number>();
    for (const task of tasks) {
        taskCount.set(task, (taskCount.get(task) || 0) + 1);
    }
    
    // Max heap of frequencies
    const maxHeap = Array.from(taskCount.values()).sort((a, b) => b - a);
    const cooldownQueue: [number, number][] = []; // [count, availableTime]
    
    let time = 0;
    
    while (maxHeap.length > 0 || cooldownQueue.length > 0) {
        time++;
        
        // Add tasks back from cooldown
        if (cooldownQueue.length > 0 && cooldownQueue[0][1] === time) {
            const [count] = cooldownQueue.shift()!;
            maxHeap.push(count);
            maxHeap.sort((a, b) => b - a);
        }
        
        // Execute most frequent available task
        if (maxHeap.length > 0) {
            const count = maxHeap.shift()!;
            if (count > 1) {
                cooldownQueue.push([count - 1, time + n + 1]);
            }
        }
    }
    
    return time;
}`,
        explanation: "Simulates actual task execution using max heap and cooldown queue. Most intuitive approach that shows the process step by step."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Mathematical Approach (Most Efficient)
// Time: O(n), Space: O(1)
function leastIntervalMath(tasks: string[], n: number): number {
    const taskCount = new Array(26).fill(0);
    
    for (const task of tasks) {
        taskCount[task.charCodeAt(0) - 65]++;
    }
    
    taskCount.sort((a, b) => b - a);
    
    const maxCount = taskCount[0];
    let idleSlots = (maxCount - 1) * n;
    
    for (let i = 1; i < 26 && taskCount[i] > 0; i++) {
        idleSlots -= Math.min(taskCount[i], maxCount - 1);
    }
    
    return tasks.length + Math.max(0, idleSlots);
}`,
        explanation: "Mathematical approach calculates minimum time needed by analyzing task frequencies and required idle slots. Most efficient solution."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Greedy with Frequency Tracking
// Time: O(n), Space: O(1)
function leastIntervalGreedy(tasks: string[], n: number): number {
    const taskCount = new Array(26).fill(0);
    
    for (const task of tasks) {
        taskCount[task.charCodeAt(0) - 65]++;
    }
    
    taskCount.sort((a, b) => b - a);
    
    // Find how many tasks have maximum frequency
    let maxFreqCount = 0;
    for (let i = 0; i < 26 && taskCount[i] === taskCount[0]; i++) {
        maxFreqCount++;
    }
    
    // Calculate minimum time needed
    const minTime = (taskCount[0] - 1) * (n + 1) + maxFreqCount;
    
    return Math.max(minTime, tasks.length);
}`,
        explanation: "Greedy approach considers tasks with maximum frequency and calculates minimum time based on cooldown requirements."
      }
    ],
    tips: [
      "Schedule most frequent task first to minimize idle time",
      "Use cooldown queue to track when tasks become available",
      "Mathematical approach: calculate idle slots needed",
      "Answer is max(tasks.length, calculated_time_with_idles)"
    ],
    tags: ["heap", "greedy", "queue", "simulation"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];
