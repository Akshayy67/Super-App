import { Question } from "../../InterviewSubjects";

// Enhanced Heap and Priority Queue DSA Questions with comprehensive implementations
export const enhancedHeapQuestions: Question[] = [
  {
    id: "enhanced-heap-1",
    question:
      "Kth Largest Element in Array - Find the kth largest element in an unsorted array.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Quick Select (O(n) average, O(n²) worst case, O(1) space): Partition-based algorithm similar to quicksort. 2) Min Heap (O(n log k) time, O(k) space): Maintain heap of size k with largest elements. 3) Sorting (O(n log n) time, O(1) space): Simple but less efficient approach. Quick Select is optimal for average case, while Min Heap is better for worst-case guarantees.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
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
        explanation:
          "Quick Select uses partitioning to find the kth element. Most efficient average case but can degrade to O(n²) in worst case.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Quick Select (Optimal average case)
// Time: O(n) average, O(n²) worst, Space: O(1)
public int findKthLargest(int[] nums, int k) {
    k = nums.length - k; // Convert to kth smallest (0-indexed)
    return quickSelect(nums, 0, nums.length - 1, k);
}

private int quickSelect(int[] nums, int left, int right, int k) {
    if (left == right) {
        return nums[left];
    }
    
    int pivot = partition(nums, left, right);
    
    if (pivot == k) {
        return nums[pivot];
    } else if (pivot < k) {
        return quickSelect(nums, pivot + 1, right, k);
    } else {
        return quickSelect(nums, left, pivot - 1, k);
    }
}

private int partition(int[] nums, int left, int right) {
    int pivotValue = nums[right];
    int i = left;
    
    for (int j = left; j < right; j++) {
        if (nums[j] <= pivotValue) {
            swap(nums, i, j);
            i++;
        }
    }
    
    swap(nums, i, right);
    return i;
}

private void swap(int[] nums, int i, int j) {
    int temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}`,
        explanation:
          "Java implementation of Quick Select. Recursively partitions the array to find the kth largest element.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
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
        explanation:
          "Min Heap maintains k largest elements. Guaranteed O(n log k) time complexity but uses extra space.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 2: Min Heap
// Time: O(n log k), Space: O(k)
public int findKthLargestHeap(int[] nums, int k) {
    // Use PriorityQueue as min heap
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    
    for (int num : nums) {
        minHeap.offer(num);
        
        // Keep heap size at k
        if (minHeap.size() > k) {
            minHeap.poll();
        }
    }
    
    // Top of min heap is kth largest
    return minHeap.peek();
}`,
        explanation:
          "Java implementation using PriorityQueue as min heap. Maintains k largest elements efficiently.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
        code: `// Approach 3: Sorting
// Time: O(n log n), Space: O(1)
function findKthLargestSort(nums: number[], k: number): number {
    nums.sort((a, b) => b - a);
    return nums[k - 1];
}`,
        explanation:
          "Simple sorting approach. Less efficient but easiest to implement and understand.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Sorting
// Time: O(n log n), Space: O(1)
public int findKthLargestSort(int[] nums, int k) {
    // Sort in descending order
    Arrays.sort(nums);
    reverse(nums);
    
    // Return the kth element
    return nums[k - 1];
}

private void reverse(int[] nums) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int temp = nums[left];
        nums[left] = nums[right];
        nums[right] = temp;
        left++;
        right--;
    }
}`,
        explanation:
          "Java implementation using sorting. Simple approach using built-in Arrays.sort and manual reversal.",
      },
      {
        language: "Python",
        code: `# Approach 1: Quick Select (Optimal average case)
# Time: O(n) average, O(n²) worst, Space: O(1)
def find_kth_largest(nums, k):
    k = len(nums) - k  # Convert to kth smallest (0-indexed)
    
    def quick_select(left, right):
        pivot = partition(left, right)
        
        if pivot == k:
            return nums[pivot]
        elif pivot < k:
            return quick_select(pivot + 1, right)
        else:
            return quick_select(left, pivot - 1)
    
    def partition(left, right):
        pivot_value = nums[right]
        i = left
        
        for j in range(left, right):
            if nums[j] <= pivot_value:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        
        nums[i], nums[right] = nums[right], nums[i]
        return i
    
    return quick_select(0, len(nums) - 1)`,
        explanation: "Quick Select uses partitioning to find the kth element. Most efficient average case but can degrade to O(n²) in worst case."
      },
      {
        language: "Python",
        code: `# Approach 2: Min Heap
# Time: O(n log k), Space: O(k)
import heapq

def find_kth_largest_heap(nums, k):
    # Use min heap to maintain k largest elements
    min_heap = []
    
    for num in nums:
        heapq.heappush(min_heap, num)
        
        # Keep heap size at k
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    
    # Top of min heap is kth largest
    return min_heap[0]`,
        explanation: "Min Heap maintains k largest elements using Python's heapq module. Guaranteed O(n log k) time complexity."
      },
      {
        language: "Python",
        code: `# Approach 3: Sorting
# Time: O(n log n), Space: O(1)
def find_kth_largest_sort(nums, k):
    nums.sort(reverse=True)
    return nums[k - 1]`,
        explanation: "Simple sorting approach. Less efficient but easiest to implement and understand."
      },
    ],
    tips: [
      "Quick select is optimal average case with O(n) time",
      "Min heap of size k maintains k largest elements",
      "Quick select modifies array, heap approach doesn't",
      "Consider randomized pivot for better average performance",
    ],
    tags: ["array", "heap", "quickselect", "sorting"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-2",
    question:
      "Top K Frequent Elements - Given integer array and integer k, return k most frequent elements.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Bucket Sort (O(n) time, O(n) space): Most efficient approach using frequency buckets. 2) Min Heap (O(n log k) time, O(n + k) space): Maintain heap of size k with most frequent elements. 3) Quick Select (O(n) average time, O(n) space): Partition-based approach for finding kth most frequent. Bucket sort is optimal for time complexity, while heap approach provides better space efficiency for large k.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
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
        explanation:
          "Bucket sort approach groups elements by frequency. Most efficient with O(n) time complexity.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Bucket Sort (Optimal)
// Time: O(n), Space: O(n)
public int[] topKFrequent(int[] nums, int k) {
    // Count frequencies
    Map<Integer, Integer> frequencyMap = new HashMap<>();
    for (int num : nums) {
        frequencyMap.put(num, frequencyMap.getOrDefault(num, 0) + 1);
    }
    
    // Create buckets for each frequency
    List<Integer>[] buckets = new ArrayList[nums.length + 1];
    for (int i = 0; i < buckets.length; i++) {
        buckets[i] = new ArrayList<>();
    }
    
    // Add numbers to frequency buckets
    for (Map.Entry<Integer, Integer> entry : frequencyMap.entrySet()) {
        int num = entry.getKey();
        int freq = entry.getValue();
        buckets[freq].add(num);
    }
    
    // Collect top k elements
    List<Integer> result = new ArrayList<>();
    for (int i = buckets.length - 1; i >= 0 && result.size() < k; i--) {
        result.addAll(buckets[i]);
    }
    
    // Convert list to array
    int[] topK = new int[k];
    for (int i = 0; i < k; i++) {
        topK[i] = result.get(i);
    }
    
    return topK;
}`,
        explanation:
          "Java implementation using bucket sort. Groups elements by frequency for O(n) time complexity.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
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
        explanation:
          "Min heap maintains k most frequent elements. Good for when k is much smaller than n.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 2: Min Heap
// Time: O(n log k), Space: O(n + k)
public int[] topKFrequentHeap(int[] nums, int k) {
    // Count frequencies
    Map<Integer, Integer> frequencyMap = new HashMap<>();
    for (int num : nums) {
        frequencyMap.put(num, frequencyMap.getOrDefault(num, 0) + 1);
    }
    
    // Min heap to keep k most frequent elements
    PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    
    // Add elements to heap
    for (Map.Entry<Integer, Integer> entry : frequencyMap.entrySet()) {
        int num = entry.getKey();
        int freq = entry.getValue();
        
        minHeap.offer(new int[]{freq, num});
        
        if (minHeap.size() > k) {
            minHeap.poll();
        }
    }
    
    // Extract results from heap
    int[] result = new int[k];
    for (int i = k - 1; i >= 0; i--) {
        result[i] = minHeap.poll()[1];
    }
    
    return result;
}`,
        explanation:
          "Java implementation using PriorityQueue (min heap). Efficiently maintains the k most frequent elements.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
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
        explanation:
          "Quick select approach finds kth most frequent element. Good average case performance.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Quick Select
// Time: O(n) average, Space: O(n)
public int[] topKFrequentQuickSelect(int[] nums, int k) {
    // Count frequencies
    Map<Integer, Integer> frequencyMap = new HashMap<>();
    for (int num : nums) {
        frequencyMap.put(num, frequencyMap.getOrDefault(num, 0) + 1);
    }
    
    // Extract unique numbers
    int[] uniqueNums = new int[frequencyMap.size()];
    int i = 0;
    for (int num : frequencyMap.keySet()) {
        uniqueNums[i++] = num;
    }
    
    // Find k most frequent using quick select
    quickSelect(uniqueNums, 0, uniqueNums.length - 1, uniqueNums.length - k, frequencyMap);
    
    // Extract top k elements
    int[] result = new int[k];
    System.arraycopy(uniqueNums, uniqueNums.length - k, result, 0, k);
    return result;
}

private void quickSelect(int[] nums, int left, int right, int kSmallest, Map<Integer, Integer> freqMap) {
    if (left == right) return;
    
    int pivotIndex = partition(nums, left, right, freqMap);
    
    if (kSmallest == pivotIndex) {
        return;
    } else if (kSmallest < pivotIndex) {
        quickSelect(nums, left, pivotIndex - 1, kSmallest, freqMap);
    } else {
        quickSelect(nums, pivotIndex + 1, right, kSmallest, freqMap);
    }
}

private int partition(int[] nums, int left, int right, Map<Integer, Integer> freqMap) {
    int pivotFreq = freqMap.get(nums[right]);
    int i = left;
    
    for (int j = left; j < right; j++) {
        if (freqMap.get(nums[j]) < pivotFreq) {
            swap(nums, i, j);
            i++;
        }
    }
    
    swap(nums, i, right);
    return i;
}

private void swap(int[] nums, int i, int j) {
    int temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}`,
        explanation:
          "Java implementation of quick select approach. Partitions based on frequencies to find k most frequent elements.",
      },
      {
        language: "Python",
        code: `# Approach 1: Bucket Sort (Optimal)
# Time: O(n), Space: O(n)
def top_k_frequent(nums, k):
    # Count frequencies
    frequency_map = {}
    for num in nums:
        frequency_map[num] = frequency_map.get(num, 0) + 1
    
    # Create buckets for each frequency
    buckets = [[] for _ in range(len(nums) + 1)]
    
    for num, freq in frequency_map.items():
        buckets[freq].append(num)
    
    # Collect top k elements
    result = []
    for i in range(len(buckets) - 1, -1, -1):
        if len(result) >= k:
            break
        result.extend(buckets[i])
    
    return result[:k]`,
        explanation: "Bucket sort approach groups elements by frequency. Most efficient with O(n) time complexity."
      },
      {
        language: "Python",
        code: `# Approach 2: Min Heap
# Time: O(n log k), Space: O(n + k)
import heapq

def top_k_frequent_heap(nums, k):
    # Count frequencies
    frequency_map = {}
    for num in nums:
        frequency_map[num] = frequency_map.get(num, 0) + 1
    
    # Min heap to keep k most frequent elements
    min_heap = []
    
    for num, freq in frequency_map.items():
        heapq.heappush(min_heap, (freq, num))
        
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    
    # Extract results from heap
    return [num for freq, num in min_heap]`,
        explanation: "Min heap maintains k most frequent elements. Good for when k is much smaller than n."
      },
      {
        language: "Python",
        code: `# Approach 3: Quick Select
# Time: O(n) average, Space: O(n)
def top_k_frequent_quickselect(nums, k):
    # Count frequencies
    frequency_map = {}
    for num in nums:
        frequency_map[num] = frequency_map.get(num, 0) + 1
    
    unique_nums = list(frequency_map.keys())
    
    def quick_select(left, right, k_smallest):
        if left == right:
            return
        
        pivot_index = partition(left, right)
        
        if k_smallest == pivot_index:
            return
        elif k_smallest < pivot_index:
            quick_select(left, pivot_index - 1, k_smallest)
        else:
            quick_select(pivot_index + 1, right, k_smallest)
    
    def partition(left, right):
        pivot_freq = frequency_map[unique_nums[right]]
        i = left
        
        for j in range(left, right):
            if frequency_map[unique_nums[j]] < pivot_freq:
                unique_nums[i], unique_nums[j] = unique_nums[j], unique_nums[i]
                i += 1
        
        unique_nums[i], unique_nums[right] = unique_nums[right], unique_nums[i]
        return i
    
    quick_select(0, len(unique_nums) - 1, len(unique_nums) - k)
    return unique_nums[len(unique_nums) - k:]`,
        explanation: "Quick select approach finds kth most frequent element. Good average case performance."
      },
    ],
    tips: [
      "Bucket sort achieves O(n) by using frequency as index",
      "Min heap of size k keeps track of top k elements",
      "Quick select finds kth element without full sorting",
      "Count frequencies first, then find top k by frequency",
    ],
    tags: ["array", "heap", "bucket-sort", "quickselect", "hash-table"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-3",
    question:
      "Merge k Sorted Arrays - Given k sorted arrays, merge them into one sorted array.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Min Heap (O(n log k) time, O(k) space): Most efficient approach using priority queue to track smallest element from each array. 2) Divide and Conquer (O(n log k) time, O(log k) space): Merge arrays pairwise until one remains. 3) Simple Merge (O(nk) time, O(n) space): Merge arrays one by one sequentially. Min heap approach is optimal for time complexity and provides the best practical performance.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
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
        explanation:
          "Min heap approach tracks smallest unprocessed element from each array. Most efficient with O(n log k) time complexity.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Min Heap (Optimal)
// Time: O(n log k), Space: O(k) where n = total elements
public List<Integer> mergeKSortedArrays(int[][] arrays) {
    List<Integer> result = new ArrayList<>();
    
    // Min heap to track smallest element from each array
    PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    
    // Initialize heap with first element from each array
    for (int i = 0; i < arrays.length; i++) {
        if (arrays[i].length > 0) {
            // Structure: [value, arrayIndex, elementIndex]
            minHeap.offer(new int[]{arrays[i][0], i, 0});
        }
    }
    
    while (!minHeap.isEmpty()) {
        int[] current = minHeap.poll();
        int value = current[0];
        int arrayIndex = current[1];
        int elementIndex = current[2];
        
        result.add(value);
        
        // Add next element from same array
        if (elementIndex + 1 < arrays[arrayIndex].length) {
            minHeap.offer(new int[]{
                arrays[arrayIndex][elementIndex + 1],
                arrayIndex,
                elementIndex + 1
            });
        }
    }
    
    return result;
}`,
        explanation:
          "Java implementation using PriorityQueue. Tracks smallest element from each array efficiently.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
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
        explanation:
          "Divide and conquer approach merges arrays pairwise until one remains. Good space efficiency but more complex.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 2: Divide and Conquer
// Time: O(n log k), Space: O(log k)
public List<Integer> mergeKSortedArraysDC(int[][] arrays) {
    if (arrays.length == 0) return new ArrayList<>();
    if (arrays.length == 1) return arrayToList(arrays[0]);
    
    List<List<Integer>> lists = new ArrayList<>();
    for (int[] arr : arrays) {
        lists.add(arrayToList(arr));
    }
    
    while (lists.size() > 1) {
        List<List<Integer>> mergedLists = new ArrayList<>();
        
        for (int i = 0; i < lists.size(); i += 2) {
            List<Integer> list1 = lists.get(i);
            List<Integer> list2 = (i + 1 < lists.size()) ? lists.get(i + 1) : new ArrayList<>();
            mergedLists.add(mergeTwoLists(list1, list2));
        }
        
        lists = mergedLists;
    }
    
    return lists.get(0);
}

private List<Integer> mergeTwoLists(List<Integer> list1, List<Integer> list2) {
    List<Integer> result = new ArrayList<>();
    int i = 0, j = 0;
    
    while (i < list1.size() && j < list2.size()) {
        if (list1.get(i) <= list2.get(j)) {
            result.add(list1.get(i++));
        } else {
            result.add(list2.get(j++));
        }
    }
    
    while (i < list1.size()) result.add(list1.get(i++));
    while (j < list2.size()) result.add(list2.get(j++));
    
    return result;
}

private List<Integer> arrayToList(int[] arr) {
    List<Integer> list = new ArrayList<>();
    for (int num : arr) {
        list.add(num);
    }
    return list;
}`,
        explanation:
          "Java implementation of divide and conquer approach. Recursively merges arrays in pairs.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
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
        explanation:
          "Simple approach merges arrays sequentially. Less efficient but easier to implement and understand.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Simple Merge
// Time: O(nk), Space: O(n)
public List<Integer> mergeKSortedArraysSimple(int[][] arrays) {
    if (arrays.length == 0) return new ArrayList<>();
    
    List<Integer> result = arrayToList(arrays[0]);
    
    for (int i = 1; i < arrays.length; i++) {
        result = mergeTwoArrays(result, arrays[i]);
    }
    
    return result;
}

private List<Integer> mergeTwoArrays(List<Integer> list, int[] arr) {
    List<Integer> result = new ArrayList<>();
    int i = 0, j = 0;
    
    while (i < list.size() && j < arr.length) {
        if (list.get(i) <= arr[j]) {
            result.add(list.get(i++));
        } else {
            result.add(arr[j++]);
        }
    }
    
    while (i < list.size()) result.add(list.get(i++));
    while (j < arr.length) result.add(arr[j++]);
    
    return result;
}

private List<Integer> arrayToList(int[] arr) {
    List<Integer> list = new ArrayList<>();
    for (int num : arr) {
        list.add(num);
    }
    return list;
}`,
        explanation:
          "Java implementation of the simple merge approach. Merges arrays sequentially one by one.",
      },
      {
        language: "Python",
        code: `# Approach 1: Min Heap (Optimal)
# Time: O(n log k), Space: O(k) where n = total elements
import heapq

def merge_k_sorted_arrays(arrays):
    result = []
    min_heap = []
    
    # Initialize heap with first element from each array
    for i, array in enumerate(arrays):
        if array:
            heapq.heappush(min_heap, (array[0], i, 0))
    
    while min_heap:
        value, array_index, element_index = heapq.heappop(min_heap)
        result.append(value)
        
        # Add next element from same array
        if element_index + 1 < len(arrays[array_index]):
            next_val = arrays[array_index][element_index + 1]
            heapq.heappush(min_heap, (next_val, array_index, element_index + 1))
    
    return result`,
        explanation: "Min heap approach tracks smallest unprocessed element from each array. Most efficient with O(n log k) time complexity."
      },
      {
        language: "Python",
        code: `# Approach 2: Divide and Conquer
# Time: O(n log k), Space: O(log k)
def merge_k_sorted_arrays_dc(arrays):
    if not arrays:
        return []
    if len(arrays) == 1:
        return arrays[0]
    
    def merge_two(arr1, arr2):
        result = []
        i = j = 0
        
        while i < len(arr1) and j < len(arr2):
            if arr1[i] <= arr2[j]:
                result.append(arr1[i])
                i += 1
            else:
                result.append(arr2[j])
                j += 1
        
        result.extend(arr1[i:])
        result.extend(arr2[j:])
        return result
    
    while len(arrays) > 1:
        merged_arrays = []
        
        for i in range(0, len(arrays), 2):
            arr1 = arrays[i]
            arr2 = arrays[i + 1] if i + 1 < len(arrays) else []
            merged_arrays.append(merge_two(arr1, arr2))
        
        arrays = merged_arrays
    
    return arrays[0]`,
        explanation: "Divide and conquer approach merges arrays pairwise until one remains. Good space efficiency but more complex."
      },
      {
        language: "Python",
        code: `# Approach 3: Simple Merge
# Time: O(nk), Space: O(n)
def merge_k_sorted_arrays_simple(arrays):
    if not arrays:
        return []
    
    def merge_two(arr1, arr2):
        result = []
        i = j = 0
        
        while i < len(arr1) and j < len(arr2):
            if arr1[i] <= arr2[j]:
                result.append(arr1[i])
                i += 1
            else:
                result.append(arr2[j])
                j += 1
        
        result.extend(arr1[i:])
        result.extend(arr2[j:])
        return result
    
    result = arrays[0][:]
    for i in range(1, len(arrays)):
        result = merge_two(result, arrays[i])
    
    return result`,
        explanation: "Simple approach merges arrays sequentially. Less efficient but easier to implement and understand."
      },
    ],
    tips: [
      "Min heap tracks smallest unprocessed element from each array",
      "Always extract minimum and add next element from same array",
      "Divide and conquer merges arrays pairwise",
      "Heap approach processes elements in sorted order",
    ],
    tags: ["heap", "divide-and-conquer", "merge-sort", "array"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-4",
    question:
      "Find Median from Data Stream - Design data structure that supports adding integers and finding median.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Heaps (O(log n) add, O(1) median, O(n) space): Use max heap for left half and min heap for right half. 2) Optimized Heap Implementation: Same logic but with proper heap data structures instead of arrays. 3) Balanced Tree Approach: Use ordered data structure to maintain sorted order. Two heaps approach is optimal for this problem, providing efficient insertion and constant-time median retrieval.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "optimal",
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
        explanation:
          "Two heaps approach maintains balanced left and right halves. Max heap stores smaller elements, min heap stores larger ones.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 1: Two Heaps (Optimal)
// addNum: O(log n), findMedian: O(1), Space: O(n)
class MedianFinder {
    // Max heap for the lower half (smaller elements)
    private PriorityQueue<Integer> maxHeap;
    // Min heap for the upper half (larger elements)
    private PriorityQueue<Integer> minHeap;
    
    public MedianFinder() {
        maxHeap = new PriorityQueue<>((a, b) -> b - a); // Max heap
        minHeap = new PriorityQueue<>(); // Min heap (default)
    }
    
    public void addNum(int num) {
        // Add to appropriate heap
        if (maxHeap.isEmpty() || num <= maxHeap.peek()) {
            maxHeap.offer(num);
        } else {
            minHeap.offer(num);
        }
        
        // Balance heaps
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.offer(maxHeap.poll());
        } else if (minHeap.size() > maxHeap.size() + 1) {
            maxHeap.offer(minHeap.poll());
        }
    }
    
    public double findMedian() {
        if (maxHeap.size() == minHeap.size()) {
            return (maxHeap.peek() + minHeap.peek()) / 2.0;
        } else if (maxHeap.size() > minHeap.size()) {
            return maxHeap.peek();
        } else {
            return minHeap.peek();
        }
    }
}`,
        explanation:
          "Java implementation using two PriorityQueues. Efficiently maintains balanced heaps for O(log n) insertion and O(1) median retrieval.",
      },
      {
        language: "TypeScript",
        approach: "moderate",
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
        explanation:
          "Same logic as approach 1 but uses proper heap data structures for better performance and cleaner code.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 2: Optimized Heap Implementation
// addNum: O(log n), findMedian: O(1), Space: O(n)
class OptimizedMedianFinder {
    // Using Java's built-in PriorityQueue which is already optimized
    private PriorityQueue<Integer> maxHeap;
    private PriorityQueue<Integer> minHeap;
    
    public OptimizedMedianFinder() {
        maxHeap = new PriorityQueue<>((a, b) -> b - a); // Max heap
        minHeap = new PriorityQueue<>(); // Min heap
    }
    
    public void addNum(int num) {
        // Add to appropriate heap
        if (maxHeap.isEmpty() || num <= maxHeap.peek()) {
            maxHeap.offer(num);
        } else {
            minHeap.offer(num);
        }
        
        // Balance heaps
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.offer(maxHeap.poll());
        } else if (minHeap.size() > maxHeap.size() + 1) {
            maxHeap.offer(minHeap.poll());
        }
    }
    
    public double findMedian() {
        if (maxHeap.size() == minHeap.size()) {
            return (maxHeap.peek() + minHeap.peek()) / 2.0;
        } else if (maxHeap.size() > minHeap.size()) {
            return maxHeap.peek();
        } else {
            return minHeap.peek();
        }
    }
}`,
        explanation:
          "Java implementation with optimized heap structures. Uses Java's built-in PriorityQueue implementation.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
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
        explanation:
          "Maintains sorted array using binary search insertion. Simpler to understand but less efficient than heap approach.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Balanced Tree Approach
// addNum: O(log n), findMedian: O(1), Space: O(n)
class BalancedTreeMedianFinder {
    private List<Integer> sortedList;
    
    public BalancedTreeMedianFinder() {
        sortedList = new ArrayList<>();
    }
    
    public void addNum(int num) {
        // Insert in sorted order using binary search
        int insertIndex = binarySearch(num);
        sortedList.add(insertIndex, num);
    }
    
    public double findMedian() {
        int n = sortedList.size();
        if (n % 2 == 0) {
            return (sortedList.get(n/2 - 1) + sortedList.get(n/2)) / 2.0;
        } else {
            return sortedList.get(n/2);
        }
    }
    
    private int binarySearch(int target) {
        int left = 0;
        int right = sortedList.size();
        
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (sortedList.get(mid) < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        return left;
    }
}`,
        explanation:
          "Java implementation using ArrayList with binary search insertion. Maintains sorted order for O(log n) insertion and O(1) median retrieval.",
      },
      {
        language: "Python",
        code: `# Approach 1: Two Heaps (Optimal)
# addNum: O(log n), findMedian: O(1), Space: O(n)
import heapq

class MedianFinder:
    def __init__(self):
        # Max heap for the lower half (smaller elements)
        # Python heapq is min heap, so negate values for max heap
        self.max_heap = []
        # Min heap for the upper half (larger elements)
        self.min_heap = []
    
    def add_num(self, num):
        # Add to appropriate heap
        if not self.max_heap or num <= -self.max_heap[0]:
            heapq.heappush(self.max_heap, -num)
        else:
            heapq.heappush(self.min_heap, num)
        
        # Balance heaps
        if len(self.max_heap) > len(self.min_heap) + 1:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        elif len(self.min_heap) > len(self.max_heap) + 1:
            val = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -val)
    
    def find_median(self):
        if len(self.max_heap) == len(self.min_heap):
            return (-self.max_heap[0] + self.min_heap[0]) / 2
        elif len(self.max_heap) > len(self.min_heap):
            return -self.max_heap[0]
        else:
            return self.min_heap[0]`,
        explanation: "Two heaps approach maintains balanced left and right halves. Max heap stores smaller elements, min heap stores larger ones."
      },
      {
        language: "Python",
        code: `# Approach 2: Sorted List (Alternative)
# addNum: O(n), findMedian: O(1), Space: O(n)
import bisect

class MedianFinderSorted:
    def __init__(self):
        self.nums = []
    
    def add_num(self, num):
        bisect.insort(self.nums, num)
    
    def find_median(self):
        n = len(self.nums)
        if n % 2 == 0:
            return (self.nums[n // 2 - 1] + self.nums[n // 2]) / 2
        else:
            return self.nums[n // 2]`,
        explanation: "Alternative approach using sorted list with binary search insertion. Simpler but less efficient for large datasets."
      },
    ],
    tips: [
      "Use two heaps: max heap for left half, min heap for right half",
      "Keep heaps balanced: size difference ≤ 1",
      "Median is top of larger heap or average of both tops",
      "Add to appropriate heap based on comparison with current median",
    ],
    tags: ["heap", "design", "data-stream"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-heap-5",
    question:
      "Task Scheduler - Given array of tasks and cooldown time n, return minimum time to complete all tasks.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Max Heap with Cooldown Queue (O(n) time, O(1) space): Simulate task execution using priority queue and cooldown tracking. 2) Mathematical Approach (O(n) time, O(1) space): Calculate minimum time using frequency analysis and idle slot calculation. 3) Greedy Simulation: Track task execution order and cooldown periods. Mathematical approach is most efficient, while heap approach provides better understanding of the process.",
    codeImplementation: [
      {
        language: "TypeScript",
        approach: "moderate",
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
        explanation:
          "Simulates actual task execution using max heap and cooldown queue. Most intuitive approach that shows the process step by step.",
      },
      {
        language: "Java",
        approach: "moderate",
        code: `// Approach 1: Max Heap with Cooldown Queue
// Time: O(n), Space: O(1) - limited by 26 task types
public int leastInterval(char[] tasks, int n) {
    // Count task frequencies
    Map<Character, Integer> taskCount = new HashMap<>();
    for (char task : tasks) {
        taskCount.put(task, taskCount.getOrDefault(task, 0) + 1);
    }
    
    // Max heap of frequencies
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
    maxHeap.addAll(taskCount.values());
    
    Queue<int[]> cooldownQueue = new LinkedList<>(); // [count, availableTime]
    
    int time = 0;
    
    while (!maxHeap.isEmpty() || !cooldownQueue.isEmpty()) {
        time++;
        
        // Add tasks back from cooldown
        if (!cooldownQueue.isEmpty() && cooldownQueue.peek()[1] == time) {
            maxHeap.offer(cooldownQueue.poll()[0]);
        }
        
        // Execute most frequent available task
        if (!maxHeap.isEmpty()) {
            int count = maxHeap.poll();
            if (count > 1) {
                cooldownQueue.offer(new int[]{count - 1, time + n + 1});
            }
        }
    }
    
    return time;
}`,
        explanation:
          "Java implementation using PriorityQueue for max heap and Queue for cooldown tracking. Simulates task execution step by step.",
      },
      {
        language: "TypeScript",
        approach: "optimal",
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
        explanation:
          "Mathematical approach calculates minimum time needed by analyzing task frequencies and required idle slots. Most efficient solution.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Approach 2: Mathematical Approach (Most Efficient)
// Time: O(n), Space: O(1)
public int leastIntervalMath(char[] tasks, int n) {
    int[] taskCount = new int[26];
    
    // Count frequency of each task
    for (char task : tasks) {
        taskCount[task - 'A']++;
    }
    
    // Sort in descending order (using built-in sort)
    Arrays.sort(taskCount);
    
    // Get maximum frequency
    int maxCount = taskCount[25];
    
    // Calculate idle slots needed between tasks of max frequency
    int idleSlots = (maxCount - 1) * n;
    
    // Fill idle slots with other tasks
    for (int i = 24; i >= 0 && taskCount[i] > 0; i--) {
        idleSlots -= Math.min(taskCount[i], maxCount - 1);
    }
    
    // If we have enough tasks to fill all idle slots, time = tasks.length
    // Otherwise, we need additional idle time
    return tasks.length + Math.max(0, idleSlots);
}`,
        explanation:
          "Java implementation of the mathematical approach. Analyzes task frequencies to calculate minimum required time.",
      },
      {
        language: "TypeScript",
        approach: "brute-force",
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
        explanation:
          "Greedy approach that calculates minimum time by analyzing task frequencies and finding tasks with maximum frequency.",
      },
      {
        language: "Java",
        approach: "brute-force",
        code: `// Approach 3: Greedy with Frequency Tracking
// Time: O(n), Space: O(1)
public int leastIntervalGreedy(char[] tasks, int n) {
    int[] taskCount = new int[26];
    
    // Count frequency of each task
    for (char task : tasks) {
        taskCount[task - 'A']++;
    }
    
    Arrays.sort(taskCount);
    
    // Find how many tasks have maximum frequency
    int maxFreq = taskCount[25];
    int maxFreqCount = 0;
    for (int i = 25; i >= 0 && taskCount[i] == maxFreq; i--) {
        maxFreqCount++;
    }
    
    // Calculate minimum time needed
    // (maxFreq-1) complete cycles of (n+1) slots + maxFreqCount slots for the final tasks
    int minTime = (maxFreq - 1) * (n + 1) + maxFreqCount;
    
    return Math.max(minTime, tasks.length);
}`,
        explanation:
          "Java implementation of greedy approach. Calculates optimal schedule based on task frequencies and cooldown requirements.",
      },
      {
        language: "Python",
        code: `# Approach 1: Max Heap with Cooldown Queue
# Time: O(n), Space: O(1) - limited by 26 task types
import heapq
from collections import deque, Counter

def least_interval(tasks, n):
    # Count task frequencies
    task_count = Counter(tasks)
    
    # Max heap of frequencies (negate for max heap behavior)
    max_heap = [-count for count in task_count.values()]
    heapq.heapify(max_heap)
    
    cooldown_queue = deque()  # [(count, available_time)]
    time = 0
    
    while max_heap or cooldown_queue:
        time += 1
        
        # Move tasks from cooldown back to heap
        if cooldown_queue and cooldown_queue[0][1] <= time:
            count, _ = cooldown_queue.popleft()
            heapq.heappush(max_heap, count)
        
        # Execute task if available
        if max_heap:
            count = heapq.heappop(max_heap)
            count += 1  # Reduce frequency (was negative)
            
            if count < 0:  # Task still has remaining executions
                cooldown_queue.append((count, time + n + 1))
    
    return time`,
        explanation: "Max heap with cooldown queue simulates task execution. Tracks when tasks become available after cooldown."
      },
      {
        language: "Python",
        code: `# Approach 2: Mathematical Approach (Optimal)
# Time: O(n), Space: O(1)
def least_interval_math(tasks, n):
    # Count task frequencies
    task_count = [0] * 26
    for task in tasks:
        task_count[ord(task) - ord('A')] += 1
    
    task_count.sort()
    
    # Find maximum frequency and count of tasks with max frequency
    max_freq = task_count[25]
    max_freq_count = 0
    for i in range(25, -1, -1):
        if task_count[i] == max_freq:
            max_freq_count += 1
        else:
            break
    
    # Calculate minimum time needed
    min_time = (max_freq - 1) * (n + 1) + max_freq_count
    
    return max(min_time, len(tasks))`,
        explanation: "Mathematical approach calculates minimum time using frequency analysis. Most efficient solution."
      },
      {
        language: "Python",
        code: `# Approach 3: Greedy with Frequency Tracking
# Time: O(n), Space: O(1)
def least_interval_greedy(tasks, n):
    from collections import Counter
    
    # Count frequency of each task
    task_count = Counter(tasks)
    frequencies = sorted(task_count.values(), reverse=True)
    
    # Find how many tasks have maximum frequency
    max_freq = frequencies[0]
    max_freq_count = 0
    for freq in frequencies:
        if freq == max_freq:
            max_freq_count += 1
        else:
            break
    
    # Calculate minimum time needed
    # (max_freq-1) complete cycles of (n+1) slots + max_freq_count slots for final tasks
    min_time = (max_freq - 1) * (n + 1) + max_freq_count
    
    return max(min_time, len(tasks))`,
        explanation: "Greedy approach that calculates minimum time by analyzing task frequencies and finding tasks with maximum frequency."
      },
    ],
    tips: [
      "Schedule most frequent task first to minimize idle time",
      "Use cooldown queue to track when tasks become available",
      "Mathematical approach: calculate idle slots needed",
      "Answer is max(tasks.length, calculated_time_with_idles)",
    ],
    tags: ["heap", "greedy", "queue", "simulation"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
