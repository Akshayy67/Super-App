import { Question } from "../InterviewSubjects";

// Collection of Algorithms & Data Structures interview questions
export const algorithmQuestions: Question[] = [
  {
    id: "algo-1",
    question:
      "Explain Big O notation and analyze the time complexity of common sorting algorithms.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "Big O notation describes the upper bound of an algorithm's time or space complexity as input size grows, ignoring constants and focusing on the dominant term. Common time complexities from fastest to slowest are O(1) (constant), O(log n) (logarithmic), O(n) (linear), O(n log n), O(n²), O(2^n), and O(n!). For sorting algorithms: Quicksort averages O(n log n) but can degrade to O(n²) in worst cases with bad pivot selection; Mergesort guarantees O(n log n) in all cases but requires O(n) extra space; Heapsort provides O(n log n) worst-case performance with O(1) extra space; Bubble, insertion, and selection sorts are simple but inefficient with O(n²) average and worst-case performance, though insertion sort can be O(n) for nearly sorted data; Counting and radix sorts achieve O(n) for specific input types but have limitations. Algorithm selection should consider factors beyond asymptotic complexity like space requirements, stability, adaptive behavior, and real-world performance on expected data distributions and sizes.",
    tips: [
      "Explain the difference between best, average, and worst-case analysis",
      "Discuss space complexity alongside time complexity",
      "Address constant factors and why they matter in practice",
      "Provide examples of when a theoretically 'slower' algorithm might perform better",
    ],
    tags: ["algorithms", "data-structures", "complexity", "sorting"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-2",
    question: "Describe common approaches to solving algorithm problems.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Effective algorithm problem-solving involves several key approaches. Brute force solutions examine all possibilities and are useful as a starting point but often inefficient. Divide and conquer breaks problems into smaller subproblems, solves them, and combines results (like in mergesort and quicksort). Greedy algorithms make locally optimal choices at each step, hoping to reach a global optimum (effective for problems like Dijkstra's algorithm or interval scheduling). Dynamic programming optimizes recursive solutions by storing subproblem results to avoid redundant calculations, using either top-down (memoization) or bottom-up (tabulation) approaches. Binary search efficiently finds values in sorted arrays with O(log n) complexity. Two-pointer technique uses multiple pointers to traverse data structures, often solving problems in linear time that would otherwise be quadratic. BFS and DFS traversals explore graph or tree structures systematically. Problem-specific data structures like hash tables, heaps, or specialized trees often provide optimal solutions. Sliding window approaches maintain a subset of elements as a window that slides through data. Recursive backtracking systematically explores all possibilities by building and undoing choices. Most importantly, problem-solving requires practice, pattern recognition, and the ability to analyze space and time complexity.",
    tips: [
      "Demonstrate how to recognize which approach fits a problem",
      "Explain trade-offs between different approaches",
      "Discuss interview-specific strategies for algorithm problems",
      "Provide examples of common patterns in interview questions",
    ],
    tags: ["algorithms", "problem-solving", "technique", "strategy"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-3",
    question: "Explain the concept of dynamic programming with an example.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "Dynamic programming (DP) is an algorithmic technique that solves complex problems by breaking them down into overlapping subproblems and storing the results to avoid redundant calculations. It's applicable when problems have optimal substructure (optimal solution contains optimal solutions to subproblems) and overlapping subproblems (same subproblems are solved multiple times). Take the Fibonacci sequence as a simple example: a naive recursive implementation recalculates the same Fibonacci values repeatedly, resulting in exponential time complexity. With memoization (top-down DP), we store previously computed Fibonacci values in a cache (typically an array or hash map), reducing time complexity to O(n). With tabulation (bottom-up DP), we build the solution iteratively, filling a table from the smallest subproblems up to the original problem. A more practical example is the knapsack problem: given items with weights and values, find the most valuable subset that fits within a weight limit. The DP solution creates a 2D table where cell [i][w] represents the maximum value possible using the first i items with weight limit w, filling this table iteratively and avoiding exponential complexity. Other classic DP problems include longest common subsequence, edit distance, and coin change, all sharing the pattern of optimal substructure and overlapping subproblems.",
    tips: [
      "Compare top-down (memoization) vs. bottom-up (tabulation) approaches",
      "Discuss how to formulate a recurrence relation",
      "Explain space optimization techniques for DP",
      "Walk through state transition and base case identification",
    ],
    tags: ["algorithms", "dynamic-programming", "optimization"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-4",
    question:
      "What are hash tables, and how do they work? Discuss collision resolution strategies.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Hash tables are data structures that implement an associative array, mapping keys to values with average O(1) time complexity for insertions, deletions, and lookups. They work by using a hash function to convert keys into array indices where values are stored. Internally, a hash table consists of an array of buckets and a hash function. When inserting a key-value pair, the hash function computes an index from the key, and the value is stored at that index. However, since the hash function might map multiple keys to the same index, collisions occur. Collision resolution strategies include: Chaining, where each bucket contains a linked list (or other data structure) of all key-value pairs that hash to that index; Open addressing, where if a collision occurs, the algorithm probes for the next available slot using techniques like linear probing (check next slot), quadratic probing (check slots at quadratically increasing distances), or double hashing (use a secondary hash function to determine the step size). The load factor (ratio of filled slots to total slots) affects performance—a higher load factor increases collision probability. When the load factor exceeds a threshold (typically 0.7-0.8), the hash table is resized and all elements are rehashed. Hash tables are widely used in programming language implementations for objects/dictionaries, database indexing, caching, and symbol tables.",
    tips: [
      "Discuss properties of good hash functions",
      "Compare performance characteristics of different collision strategies",
      "Explain amortized analysis of hash table operations",
      "Address real-world implementations in programming languages",
    ],
    tags: ["data-structures", "hash-tables", "algorithms"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-5",
    question:
      "Explain graph traversal algorithms (BFS and DFS) and their applications.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Breadth-First Search (BFS) and Depth-First Search (DFS) are fundamental graph traversal algorithms. BFS explores all neighbors at the current depth before moving to nodes at the next depth level, using a queue data structure. It finds the shortest path in unweighted graphs and is useful for finding the closest or minimum-step solutions. Applications include social network friend suggestions, web crawling, network broadcasting, and finding the shortest path. DFS explores as far as possible along each branch before backtracking, using a stack (or recursion). It's useful for topological sorting, cycle detection, path finding, and maze generation. DFS implementations are often simpler and use less memory for deep graphs. Both algorithms have O(V + E) time complexity where V is the number of vertices and E is the number of edges. Common variations include bidirectional search (running searches from both start and goal to meet in the middle) and iterative deepening DFS (combines DFS's space efficiency with BFS's completeness). When implementing these algorithms, tracking visited nodes is crucial to prevent infinite loops in cyclic graphs. The choice between BFS and DFS depends on the problem: BFS for shortest paths and level-by-level exploration, DFS for exhaustive search and problems where path storage is important.",
    tips: [
      "Compare iterative vs. recursive implementations",
      "Discuss time and space complexity considerations",
      "Explain how to represent graphs for traversal algorithms",
      "Demonstrate how to adapt the algorithms for specific applications",
    ],
    tags: ["algorithms", "graphs", "data-structures", "traversal"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-6",
    question: "How would you implement a solution to the Two Sum problem?",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "The Two Sum problem asks us to find two numbers in an array that add up to a target value. There are two main approaches: 1) Brute Force (O(n²)): Check every pair of numbers - simple but inefficient for large arrays. 2) Hash Map (O(n)): Use a hash map to store complements. For each element, check if its complement (target - current) exists in the map. If yes, return the indices; if no, add the current element to the map. This single-pass approach is optimal for time complexity.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `function twoSum(nums, target) {
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        
        numMap.set(nums[i], i);
    }
    
    return []; // No solution found
}

// Example usage:
console.log(twoSum([2, 7, 11, 15], 9)); // Output: [0, 1]
console.log(twoSum([3, 2, 4], 6));      // Output: [1, 2]`,
        explanation: "We use a Map to store each number and its index. For each element, we calculate its complement and check if it exists in our map. If found, we return both indices. Time: O(n), Space: O(n)."
      },
      {
        language: "Python",
        code: `def two_sum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []  # No solution found

# Example usage:
print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]
print(two_sum([3, 2, 4], 6))       # Output: [1, 2]`,
        explanation: "Python dictionary provides O(1) average lookup time. We iterate once through the array, checking if each number's complement exists in our dictionary."
      },
      {
        language: "Java",
        code: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> numMap = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (numMap.containsKey(complement)) {
                return new int[]{numMap.get(complement), i};
            }
            
            numMap.put(nums[i], i);
        }
        
        return new int[]{}; // No solution found
    }
}

// Example usage:
// Solution sol = new Solution();
// int[] result = sol.twoSum(new int[]{2, 7, 11, 15}, 9); // [0, 1]`,
        explanation: "HashMap in Java provides efficient key-value storage. We check for complement existence before adding current element to avoid using the same element twice."
      }
    ],
    tips: [
      "Discuss both brute force and optimized hash map approaches",
      "Explain how the hash map solution achieves O(n) time complexity",
      "Mention how to handle edge cases like no solution or multiple solutions",
      "Consider follow-up variants like sorted input arrays (two-pointer approach)",
    ],
    tags: ["algorithms", "arrays", "hash-tables", "problem-solving"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-7",
    question: "Explain how to detect a cycle in a linked list.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "To detect a cycle in a linked list, Floyd's Tortoise and Hare algorithm (also known as the 'fast and slow pointer' technique) is the most elegant solution, achieving O(n) time complexity with O(1) space. The algorithm uses two pointers that move through the list at different speeds: the slow pointer (tortoise) advances one node at a time, while the fast pointer (hare) advances two nodes. If there's a cycle, the fast pointer will eventually catch up to the slow pointer, proving the cycle's existence. If the fast pointer reaches the end (null), then no cycle exists. To find the cycle's starting point, we reset one pointer to the head while keeping the other at the meeting point, then advance both at the same speed; they'll meet at the cycle's start. Alternatively, a hash set approach tracks visited nodes, adding each node to the set during traversal. If we encounter a node already in the set, we've found a cycle. While conceptually simpler, this requires O(n) space. Floyd's algorithm is preferred for its constant space usage, though the hash set approach can be more intuitive for beginners. When implementing either solution, careful handling of edge cases like empty lists or single-node lists is essential.",
    tips: [
      "Explain both the Floyd's algorithm and hash set approaches",
      "Discuss how to find the start of the cycle once detected",
      "Analyze space and time complexity tradeoffs between approaches",
      "Address edge cases like empty lists or single-node cycles",
    ],
    tags: ["algorithms", "linked-lists", "cycle-detection", "two-pointers"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-8",
    question: "Implement a solution for the Valid Parentheses problem.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "The Valid Parentheses problem requires checking if brackets are properly matched and nested. The key insight is to use a stack data structure. Strategy: 1) For opening brackets ('(', '{', '['), push them onto the stack. 2) For closing brackets (')', '}', ']'), check if stack is empty or if the top doesn't match - if so, return false. Otherwise, pop the matching opening bracket. 3) After processing all characters, the stack should be empty for a valid string. This works because stacks follow LIFO (Last In, First Out), perfectly matching the nesting nature of valid parentheses.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            // Opening bracket: push to stack
            stack.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            // Closing bracket: check match
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}

// Example usage:
console.log(isValid("()"));       // true
console.log(isValid("()[]{}"));   // true
console.log(isValid("(]"));       // false
console.log(isValid("([)]"));     // false`,
        explanation: "We use an array as a stack and a map to store bracket pairs. For each character, we either push opening brackets or check closing brackets against the stack top."
      },
      {
        language: "Python",
        code: `def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in '({[':
            # Opening bracket: push to stack
            stack.append(char)
        elif char in ')}]':
            # Closing bracket: check match
            if not stack or stack.pop() != pairs[char]:
                return False
    
    return len(stack) == 0

# Example usage:
print(is_valid("()"))       # True
print(is_valid("()[]{}"))   # True
print(is_valid("(]"))       # False
print(is_valid("([)]"))     # False`,
        explanation: "Python's list works as a stack with append() and pop(). We check membership in strings for efficient bracket type detection."
      },
      {
        language: "Java",
        code: `import java.util.Stack;
import java.util.HashMap;
import java.util.Map;

public class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> pairs = new HashMap<>();
        pairs.put(')', '(');
        pairs.put('}', '{');
        pairs.put(']', '[');
        
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                // Opening bracket: push to stack
                stack.push(c);
            } else if (c == ')' || c == '}' || c == ']') {
                // Closing bracket: check match
                if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                    return false;
                }
            }
        }
        
        return stack.isEmpty();
    }
}

// Example usage:
// Solution sol = new Solution();
// boolean result = sol.isValid("()[]{}"); // true`,
        explanation: "Java's Stack class provides push() and pop() methods. HashMap stores the bracket pairs for quick lookup during validation."
      }
    ],
    tips: [
      "Explain how the stack data structure is perfect for this problem",
      "Discuss how to efficiently check for bracket matches",
      "Analyze time and space complexity",
      "Mention variations like handling additional characters or multiple bracket types",
    ],
    tags: ["algorithms", "stacks", "strings", "validation"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-9",
    question:
      "Describe how to find the longest substring without repeating characters.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem uses the sliding window technique with a hash map. Maintain two pointers (left and right) to form a window. Strategy: 1) Expand the right pointer and add characters to a hash map with their indices. 2) When a duplicate character is found, move the left pointer to skip past the first occurrence of that character. 3) Track the maximum window size throughout the process. The key insight is that we only need to track the most recent position of each character, allowing us to efficiently skip over duplicates in O(1) time.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `function lengthOfLongestSubstring(s) {
    const charMap = new Map();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        
        // If character is already in current window
        if (charMap.has(char) && charMap.get(char) >= left) {
            // Move left pointer past the duplicate
            left = charMap.get(char) + 1;
        }
        
        // Update character position
        charMap.set(char, right);
        
        // Update max length
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Example usage:
console.log(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
console.log(lengthOfLongestSubstring("bbbbb"));    // 1 ("b")
console.log(lengthOfLongestSubstring("pwwkew"));   // 3 ("wke")`,
        explanation: "We use a Map to track character positions and two pointers for the sliding window. When we find a duplicate, we jump the left pointer to skip past the previous occurrence."
      },
      {
        language: "Python",
        code: `def length_of_longest_substring(s):
    char_map = {}
    left = 0
    max_length = 0
    
    for right, char in enumerate(s):
        # If character is already in current window
        if char in char_map and char_map[char] >= left:
            # Move left pointer past the duplicate
            left = char_map[char] + 1
        
        # Update character position
        char_map[char] = right
        
        # Update max length
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example usage:
print(length_of_longest_substring("abcabcbb"))  # 3
print(length_of_longest_substring("bbbbb"))     # 1
print(length_of_longest_substring("pwwkew"))    # 3`,
        explanation: "Python's dictionary provides O(1) lookup. We use enumerate() to get both index and character, making the code more Pythonic."
      },
      {
        language: "Java",
        code: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> charMap = new HashMap<>();
        int left = 0;
        int maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            
            // If character is already in current window
            if (charMap.containsKey(c) && charMap.get(c) >= left) {
                // Move left pointer past the duplicate
                left = charMap.get(c) + 1;
            }
            
            // Update character position
            charMap.put(c, right);
            
            // Update max length
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }
}

// Example usage:
// Solution sol = new Solution();
// int result = sol.lengthOfLongestSubstring("abcabcbb"); // 3`,
        explanation: "HashMap provides efficient character-to-index mapping. We check both containsKey() and position to ensure the duplicate is within our current window."
      }
    ],
    tips: [
      "Explain the sliding window technique in detail",
      "Discuss optimizations for different character set constraints",
      "Analyze how to handle edge cases efficiently",
      "Compare with less efficient approaches like checking all possible substrings",
    ],
    tags: ["algorithms", "sliding-window", "strings", "hash-tables"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-10",
    question: "How would you implement a solution to merge two sorted arrays?",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "To merge two sorted arrays efficiently, we can use a two-pointer approach. Given two sorted arrays nums1 and nums2, we initialize two pointers i and j at the beginning of each array. We then compare the elements at these pointers, add the smaller one to our result array, and advance that pointer. We repeat until we've processed all elements from both arrays. This approach has O(n+m) time complexity, where n and m are the lengths of the input arrays, and O(n+m) space for the output array. If we need to merge in-place (e.g., when nums1 has enough space at the end to hold nums2), we can work backwards using three pointers: one at the end of the filled portion of nums1, one at the end of nums2, and one at the very end of nums1. We then compare elements and place the larger one at the end pointer's position, working backwards until all elements are placed. This in-place approach maintains O(n+m) time complexity but uses O(1) extra space. Edge cases to consider include empty arrays, arrays of significantly different sizes, and handling duplicates (which are typically preserved in both arrays). This merging technique forms the core of merge sort and is useful in many other algorithms that leverage sorted data.",
    tips: [
      "Explain both standard and in-place implementations",
      "Discuss time and space complexity considerations",
      "Address how to handle edge cases efficiently",
      "Mention real-world applications of array merging",
    ],
    tags: ["algorithms", "arrays", "sorting", "two-pointers"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-11",
    question:
      "Describe how to implement a binary search algorithm and analyze its efficiency.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Binary search is an efficient algorithm for finding a target value in a sorted array. It works by repeatedly dividing the search interval in half. Begin by comparing the target value with the middle element of the array. If they match, the search is complete. If the target is less than the middle element, continue searching the lower half; otherwise, search the upper half. This process continues until the target is found or the interval is empty. Binary search achieves O(log n) time complexity because it halves the search space in each step. For example, in a sorted array of 1 million elements, binary search requires at most 20 comparisons, compared to up to 1 million for linear search. Implementation requires careful handling of index arithmetic to avoid integer overflow in large arrays. The mid-point calculation should use mid = low + (high - low) / 2 rather than (low + high) / 2. Common pitfalls include incorrect boundary updates (ensure the search space reduces by including/excluding the middle element appropriately) and off-by-one errors when determining the new search ranges. Binary search can be implemented iteratively or recursively, with the iterative version typically preferred for better space efficiency. Variants include finding the insertion position for a non-existent element or the first/last occurrence of a repeating element, which require small modifications to the basic algorithm.",
    tips: [
      "Compare iterative and recursive implementations",
      "Explain why binary search requires sorted input",
      "Discuss common implementation pitfalls and how to avoid them",
      "Show how to adapt binary search for variants like finding insertion points",
    ],
    tags: ["algorithms", "binary-search", "searching", "divide-and-conquer"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-12",
    question:
      "Explain how to implement a solution for the Maximum Subarray problem.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The Maximum Subarray problem asks us to find the contiguous subarray with the largest sum within an array of integers. Kadane's algorithm provides an elegant O(n) solution by using dynamic programming principles. We maintain two variables: currentSum tracks the maximum sum ending at the current position, and maxSum stores the overall maximum sum found so far. For each element, we decide whether to extend the previous subarray or start a new one by taking the maximum of (current element) and (current element + currentSum). We then update maxSum if needed. For example, with array [-2, 1, -3, 4, -1, 2, 1, -5, 4], we start with both variables at 0. Processing -2, currentSum becomes max(-2, 0) = 0. For 1, currentSum = max(1, 1+0) = 1, and we update maxSum to 1. We continue this process, eventually finding the maximum subarray [4, -1, 2, 1] with sum 6. Edge cases include arrays with all negative numbers (where the answer is the single largest element) and empty arrays (typically defined to have sum 0). The divide-and-conquer approach is an alternative solution with O(n log n) complexity that splits the array recursively and considers subarrays that cross the midpoint. Kadane's algorithm is preferred for its linear time complexity and simpler implementation.",
    tips: [
      "Explain Kadane's algorithm step by step with an example",
      "Discuss how to handle all-negative arrays and other edge cases",
      "Compare with alternative approaches like divide-and-conquer",
      "Extend to variations like maximum product subarray",
    ],
    tags: ["algorithms", "dynamic-programming", "arrays", "kadane"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-13",
    question: "How would you reverse a linked list?",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "Reversing a linked list is a fundamental operation that can be implemented both iteratively and recursively. In the iterative approach, we use three pointers: prev (initialized to null), current (pointing to the head), and next. We iterate through the list, for each node: save the next node, point current.next to prev, move prev to current, and current to next. When current becomes null, prev points to the new head of the reversed list. This approach has O(n) time complexity and O(1) space complexity. The recursive solution, while more elegant, uses O(n) space due to the call stack. We define a function that takes a node, recursively reverses the rest of the list, and then fixes the current node's connections. The base case is when the node is null or the last node. For example, with list 1->2->3->4->null, we recursively reverse from 2 onward, getting 1->2<-3<-4, then fix node 1's connection by setting 2.next = 1 and 1.next = null. Edge cases include empty lists (return null), single-node lists (remain unchanged), and maintaining references to the new head and tail if needed. Both implementations preserve the original nodes while changing only their next pointers, making this operation suitable for in-place reversal without additional memory beyond the pointers mentioned.",
    tips: [
      "Compare iterative and recursive implementations in detail",
      "Analyze time and space complexity of both approaches",
      "Discuss how to handle edge cases properly",
      "Explain how to extend the solution to reverse only a portion of the list",
    ],
    tags: ["algorithms", "linked-lists", "recursion", "pointers"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-14",
    question:
      "Describe the concept of a heap data structure and its applications.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "A heap is a specialized tree-based data structure that satisfies the heap property: in a max heap, for any given node, the node's value is greater than or equal to the values of its children; in a min heap, the node's value is less than or equal to its children's values. Heaps are commonly implemented as arrays, where for a node at index i, its left child is at index 2i+1, right child at 2i+2, and parent at floor((i-1)/2). This representation avoids the overhead of storing pointers. The key operations are insertion (O(log n)), extraction of the min/max element (O(log n)), and peeking at the min/max element (O(1)). Heapsort uses a heap to sort an array in O(n log n) time. Heaps are crucial for priority queues, which are used in algorithms like Dijkstra's shortest path, Prim's minimum spanning tree, and Huffman coding. They're also used for scheduling processes in operating systems, maintaining top-k elements in streaming data, and implementing efficient median-finding algorithms. The heapify operation, which converts an array into a valid heap, can be performed in O(n) time using bottom-up construction. Variations include binary heaps (most common), Fibonacci heaps (improved amortized performance for certain operations), and d-ary heaps (where each node has d children, offering tradeoffs between extraction and insertion costs).",
    tips: [
      "Compare min heaps and max heaps with examples",
      "Explain how heap operations are implemented efficiently",
      "Discuss real-world applications of heaps",
      "Compare heaps with other priority queue implementations",
    ],
    tags: ["data-structures", "heaps", "priority-queues", "algorithms"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-15",
    question:
      "How would you implement a solution to check if a binary tree is balanced?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "A balanced binary tree has a height difference of at most 1 between the left and right subtrees of every node. To check if a tree is balanced, we can use a depth-first traversal approach. A naive solution would calculate the height of each subtree separately for every node, resulting in O(n²) time complexity in the worst case. A more efficient approach combines the height calculation and balance checking in a single traversal. We define a recursive function that returns the height of the tree if it's balanced, or -1 if it's unbalanced. For each node, we recursively check if its left and right subtrees are balanced and calculate their heights. If either subtree is unbalanced (returned -1) or their height difference exceeds 1, we return -1. Otherwise, we return the height of the current subtree (max height of children + 1). This approach has O(n) time complexity since we visit each node once, and O(h) space complexity where h is the height of the tree (due to the recursion stack). Edge cases include empty trees (considered balanced) and trees with just one node (also balanced). This efficient solution is particularly important for self-balancing trees like AVL trees, where balance checks are frequent operations.",
    tips: [
      "Compare naive and optimized approaches",
      "Explain the depth-first recursive solution in detail",
      "Discuss handling of special cases like empty trees",
      "Analyze time and space complexity carefully",
    ],
    tags: ["algorithms", "binary-trees", "recursion", "depth-first-search"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-16",
    question:
      "Explain how to implement a solution for the Climbing Stairs problem.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "The Climbing Stairs problem asks for the number of distinct ways to climb n stairs when you can take either 1 or 2 steps at a time. This is a classic dynamic programming problem that follows the Fibonacci sequence pattern. For n stairs, the number of ways equals the sum of the number of ways to climb (n-1) stairs plus the number of ways to climb (n-2) stairs. This is because for the last step, we either take a single step from stair (n-1) or a double step from stair (n-2). A bottom-up dynamic programming approach uses an array dp where dp[i] represents the number of ways to climb i stairs. We initialize dp[1]=1 and dp[2]=2, then for each i from 3 to n, set dp[i] = dp[i-1] + dp[i-2]. The final answer is dp[n]. This solution has O(n) time and O(n) space complexity. We can optimize the space to O(1) by maintaining only the two most recent values instead of the entire array. Edge cases include n=0 (typically defined as 1 way - doing nothing) and n=1 (1 way). The problem can be extended to allow 1, 2, ..., k steps, in which case dp[i] would be the sum of dp[i-j] for all valid j steps. While a recursive approach with memoization also works, the iterative approach is generally more efficient due to reduced function call overhead.",
    tips: [
      "Explain the recurrence relation and why it works",
      "Compare recursive (top-down) and iterative (bottom-up) solutions",
      "Discuss space optimization techniques",
      "Explore extensions like variable step sizes",
    ],
    tags: ["algorithms", "dynamic-programming", "fibonacci", "recursion"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-17",
    question:
      "How would you implement a solution to find the lowest common ancestor in a binary tree?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Finding the lowest common ancestor (LCA) of two nodes in a binary tree requires identifying the deepest node that has both nodes as descendants. For a binary search tree, we can leverage the ordering property: if both nodes' values are less than the current node, we search the left subtree; if both are greater, we search the right subtree; otherwise, the current node is the LCA. For a general binary tree, we use a recursive approach: if the current node is null, one of the target nodes, or both target nodes are found in different subtrees, we've found the LCA. The algorithm performs a post-order traversal, returning the current node if it's one of the target nodes. For each node, we recursively search both left and right subtrees. If both searches return non-null values, the current node is the LCA. If only one search returns non-null, that result is propagated upward. This solution has O(n) time complexity and O(h) space complexity, where h is the tree height. Edge cases include: when one node is an ancestor of the other (the ancestor is the LCA), when the nodes aren't in the tree (typically return null), and handling duplicate values (if allowed in the tree). For repeated LCA queries, we can optimize by preprocessing the tree using techniques like Euler tour with range minimum queries or parent pointers.",
    tips: [
      "Compare solutions for binary search trees vs. general binary trees",
      "Walk through the recursive approach with examples",
      "Discuss optimizations for repeated LCA queries",
      "Address edge cases like one node being an ancestor of the other",
    ],
    tags: ["algorithms", "binary-trees", "recursion", "tree-traversal"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-18",
    question:
      "Describe how to implement a solution for the Coin Change problem.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The Coin Change problem asks for the fewest number of coins needed to make a given amount, given a set of coin denominations. This is a classic dynamic programming problem. We create an array dp where dp[i] represents the minimum number of coins needed to make amount i. We initialize dp[0]=0 (it takes 0 coins to make amount 0) and dp[i]=∞ for i>0. Then, for each coin denomination and each amount from coin value to the target amount, we update dp[amount] = min(dp[amount], dp[amount-coin]+1). This formula represents the choice: either keep the previous minimum number of coins for this amount, or use the current coin plus the minimum number of coins needed for the remaining amount. After processing all coins and amounts, dp[target] contains our answer. If it's still ∞, no solution exists. This bottom-up approach has O(amount × n) time complexity and O(amount) space complexity, where n is the number of coin denominations. A greedy approach (always take the largest possible coin) can fail for certain denominations like [1,3,4] when making amount 6. Edge cases include zero amount (answer 0), no coins available (impossible), and negative amounts (typically invalid input). The problem can be extended to find the combination of coins used by tracking which coin led to each dp[i] update.",
    tips: [
      "Compare dynamic programming and greedy approaches",
      "Explain why greedy can fail with certain examples",
      "Walk through the DP solution step by step",
      "Discuss how to reconstruct the actual coins used",
    ],
    tags: ["algorithms", "dynamic-programming", "greedy", "optimization"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-19",
    question:
      "How would you implement a trie (prefix tree) and what are its applications?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "A trie (prefix tree) is a specialized tree-based data structure for efficient string operations. Each node represents a character, and paths from root to nodes form strings. Unlike binary trees, nodes can have multiple children, each corresponding to a different character. Typically, a trie node contains a boolean flag indicating if the node represents a complete word and an array or map of children. Implementation involves three main operations: insertion (iteratively add characters, creating nodes as needed), search (follow character path, checking if the final node is marked as a word), and prefix search (similar to search but without checking the word flag). The time complexity for all operations is O(m), where m is the string length, regardless of the dictionary size. Tries excel at autocomplete suggestions, spell checking, IP routing (CIDR lookup), and text mining applications like word frequency analysis. Their advantages include O(m) lookups independent of dictionary size, prefix-based retrieval, and lexicographical ordering of strings. Disadvantages include higher space requirements than hash tables, especially with sparse character distributions. Space optimization techniques include path compression (merging chain nodes with single children) and using specialized node structures like ternary search tries. Modern variants include compressed tries (minimizing space) and suffix tries (for substring searches).",
    tips: [
      "Explain the structure of a trie node and its implementation",
      "Walk through key operations with complexity analysis",
      "Compare tries with other data structures for string operations",
      "Discuss real-world applications and optimizations",
    ],
    tags: ["data-structures", "tries", "strings", "algorithms"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-20",
    question: "Explain how to solve the Longest Palindromic Substring problem.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Finding the longest palindromic substring can be approached in several ways. The brute force method checks all possible substrings, taking O(n³) time, which is inefficient. A more optimal approach is the expand-around-center technique with O(n²) time complexity and O(1) space. For each position in the string, we treat it as a potential center of a palindrome and expand outward while characters match. We handle both odd-length palindromes (single-character centers) and even-length palindromes (between two characters). For example, in 'babad', starting from the middle 'a', we expand to find 'bab'. We track the longest palindrome found during expansion. Manacher's algorithm offers an even better O(n) solution by reusing previous computations, but it's complex to implement. Dynamic programming provides another O(n²) approach by maintaining a 2D boolean array where dp[i][j] indicates if the substring from index i to j is a palindrome. We fill this table for substrings of increasing length, using the recurrence relation dp[i][j] = (s[i] == s[j]) && (j-i <= 2 || dp[i+1][j-1]). Edge cases include empty strings (return empty), single-character strings (entire string is palindromic), and strings with no palindromes longer than one character (return any single character).",
    tips: [
      "Compare different approaches with time and space complexity analysis",
      "Explain expand-around-center approach in detail with examples",
      "Mention Manacher's algorithm as an advanced technique",
      "Discuss how to handle edge cases properly",
    ],
    tags: ["algorithms", "strings", "dynamic-programming", "palindromes"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-21",
    question:
      "How would you implement a solution for the Container With Most Water problem?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The Container With Most Water problem asks for the maximum area that can be formed between vertical lines represented as an array of heights. A brute force approach would check all line pairs, taking O(n²) time. However, an efficient two-pointer approach achieves O(n) time complexity. We initialize two pointers at the start and end of the array. At each step, we calculate the area formed by these lines (minimum of the two heights multiplied by the distance between them) and update the maximum area seen so far. Then, we move the pointer that points to the shorter line inward, as this has the potential to increase area. We continue until the pointers meet. This approach works because the limiting factor for area is the shorter line. Moving the pointer at the shorter line might find a taller line that increases area, while moving the pointer at the taller line can only decrease or maintain the width without increasing the minimum height. For example, with heights [1,8,6,2,5,4,8,3,7], we start with pointers at indices 0 and 8. The area is min(1,7) * (8-0) = 1*8 = 8. Since height[0] is shorter, we move the left pointer and continue this process, eventually finding the maximum area of 49 (between heights 8 at index 1 and 7 at index 8). This approach efficiently handles edge cases like arrays with just two elements or arrays with all identical heights.",
    tips: [
      "Explain the intuition behind the two-pointer approach",
      "Demonstrate why moving the pointer at the shorter line is optimal",
      "Walk through an example step by step",
      "Discuss how to handle edge cases and verify the solution",
    ],
    tags: ["algorithms", "arrays", "two-pointers", "optimization"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-22",
    question:
      "Describe how to implement a solution for the Number of Islands problem.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The Number of Islands problem asks us to count the number of distinct islands in a 2D grid, where '1' represents land and '0' represents water. Two primary approaches are depth-first search (DFS) and breadth-first search (BFS), both with O(m×n) time complexity where m and n are the grid dimensions. In the DFS approach, we iterate through each cell in the grid. When we encounter a '1', we increment our island count and perform DFS to mark all connected land cells as visited by changing them to '0' (or using a separate visited matrix). For each land cell, we recursively explore all four adjacent cells (up, down, left, right) that contain land. The BFS approach similarly iterates through the grid but uses a queue to explore adjacent land cells level by level. When we find an unvisited land cell, we increment the island count, add the cell to the queue, and mark it as visited. We then process cells from the queue, adding their unvisited land neighbors to continue the BFS. This continues until the queue is empty, completing one island. Both approaches correctly identify distinct islands because they completely explore each connected land mass before moving to the next unvisited land cell. Edge cases include empty grids (return 0), grids with no land (return 0), and grids filled entirely with land (return 1). This problem can be extended to variations like finding the largest island, counting islands with specific shapes, or determining if islands are connected when considering diagonal adjacencies.",
    tips: [
      "Compare DFS and BFS approaches for island identification",
      "Explain how to mark visited cells efficiently",
      "Discuss handling grid boundaries carefully",
      "Mention variations like diagonal connections or different island counting criteria",
    ],
    tags: [
      "algorithms",
      "graphs",
      "depth-first-search",
      "breadth-first-search",
    ],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-23",
    question:
      "How would you implement a solution for the Find Median from Data Stream problem?",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "The Find Median from Data Stream problem requires efficiently maintaining the median of a stream of integers with fast insertion and median retrieval. An optimal solution uses two heaps: a max-heap for the smaller half of elements and a min-heap for the larger half. This allows us to find the median in O(1) time: if the heaps have equal size, the median is the average of the two heap tops; otherwise, it's the top of the heap with more elements. When inserting a new number, we maintain the invariant that every element in the max-heap is less than or equal to every element in the min-heap, and their size difference is at most 1. If the number is smaller than the max-heap top, we add it to the max-heap; otherwise, we add it to the min-heap. After insertion, if one heap becomes more than one element larger than the other, we transfer the top element from the larger heap to the smaller one to rebalance. This approach guarantees O(log n) time for insertion and O(1) time for finding the median. Other solutions include using a self-balancing binary search tree (which can provide O(log n) for both operations) or using an insertion sort approach (O(n) insertion, O(1) median finding). The two-heap method is preferred for its optimal balance between insertion and retrieval operations, making it ideal for streaming applications where the median needs to be accessed frequently.",
    tips: [
      "Explain why two heaps provide an optimal solution",
      "Describe the rebalancing process in detail",
      "Compare with alternative approaches like sorted arrays or BSTs",
      "Discuss how to handle duplicates and edge cases",
    ],
    tags: ["algorithms", "heaps", "data-structures", "streams"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-24",
    question:
      "Explain the concept of topological sorting and its applications.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Topological sorting is an ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge (u, v), vertex u comes before v in the ordering. It represents a linear sequencing of tasks that respects all dependencies. There are two main algorithms to perform topological sorting: Kahn's algorithm (using BFS) and DFS-based approach. Kahn's algorithm works by repeatedly removing nodes with no incoming edges and adding them to the result, then removing their outgoing edges. The DFS approach performs a depth-first search, adding nodes to the result in reverse post-order (after all descendants are processed). Both algorithms have O(V+E) time complexity, where V is the number of vertices and E is the number of edges. Topological sorting is applicable only to DAGs; the presence of a cycle makes a valid ordering impossible (which these algorithms can detect). Applications include dependency resolution in build systems and package managers, course scheduling (determining a valid sequence of courses given prerequisites), task scheduling in project management, and ordering of operations in spreadsheet calculations. It's also used in compiler design for instruction scheduling and determining evaluation order of expressions. Edge cases include empty graphs (empty result) and graphs with multiple valid orderings (both algorithms produce valid but potentially different orderings). When cycles exist, modifications to these algorithms can identify the cycles, which is useful for detecting dependency conflicts.",
    tips: [
      "Compare Kahn's algorithm and the DFS-based approach",
      "Explain how to detect cycles during topological sorting",
      "Describe real-world applications with specific examples",
      "Discuss variations like lexicographically smallest topological sort",
    ],
    tags: ["algorithms", "graphs", "directed-acyclic-graphs", "sorting"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-25",
    question: "How would you implement a solution for the Word Break problem?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The Word Break problem asks if a string can be segmented into words from a dictionary. A dynamic programming approach is most efficient. We create a boolean array dp where dp[i] indicates whether the substring from the beginning up to index i can be segmented into dictionary words. We initialize dp[0]=true (empty string is always valid). For each position i from 1 to the string length, we check if there exists a valid word break by examining all possible last words. For each j from 0 to i-1, if dp[j] is true and the substring from j to i is in the dictionary, we set dp[i]=true and break. If after checking all j values dp[i] remains false, the substring up to i cannot be segmented. The time complexity is O(n²×m) where n is the string length and m is the average cost of dictionary lookup. Using a trie or hash set for the dictionary can optimize lookups to near-constant time. For example, with string 'leetcode' and dictionary ['leet','code'], dp[4]=true because dp[0]=true and 'leet' is in the dictionary, and subsequently dp[8]=true because dp[4]=true and 'code' is in the dictionary. A recursive approach with memoization can also work by checking if the current substring can be segmented. Edge cases include empty strings (typically considered segmentable) and strings that can be segmented in multiple ways (we only need to find one valid segmentation).",
    tips: [
      "Compare bottom-up DP and recursive memoization approaches",
      "Explain optimization techniques for dictionary lookups",
      "Walk through an example with the DP array fully filled out",
      "Discuss how to extend the solution to return all possible segmentations",
    ],
    tags: ["algorithms", "dynamic-programming", "strings", "dictionary"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-26",
    question:
      "Describe how to implement a solution for the Rotate Image problem.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The Rotate Image problem asks us to rotate an n×n matrix 90 degrees clockwise in-place. A straightforward approach is to perform the rotation layer by layer, starting from the outermost layer and moving inward. For each layer, we rotate four elements at a time in a cyclic fashion. Another elegant approach is to first transpose the matrix (swap rows and columns) and then reverse each row. For example, transposing [[1,2,3],[4,5,6],[7,8,9]] gives [[1,4,7],[2,5,8],[3,6,9]], and reversing each row gives [[7,4,1],[8,5,2],[9,6,3]], which is the 90-degree clockwise rotation. Both approaches have O(n²) time complexity, which is optimal since we must touch every element in the matrix. The space complexity is O(1) as we perform the rotation in-place. For counterclockwise rotation, we can transpose and then reverse columns instead of rows. Edge cases include 1×1 matrices (remain unchanged) and empty matrices (no action needed). When implementing the layer-by-layer approach, care must be taken with the indices to avoid duplicate swaps. The transpose-and-reverse approach is generally preferred for its simplicity and reduced chance of off-by-one errors, though both approaches are equally valid solutions. This problem demonstrates the importance of visualizing transformations and leveraging matrix properties to simplify complex operations.",
    tips: [
      "Explain both layer-by-layer rotation and transpose-reverse approaches",
      "Demonstrate the mathematics behind each transformation",
      "Discuss how to avoid common indexing errors",
      "Show how to adapt the solution for different rotation angles",
    ],
    tags: ["algorithms", "arrays", "matrices", "in-place"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-27",
    question: "How would you implement a solution for the LRU Cache problem?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "An LRU (Least Recently Used) Cache maintains a fixed-size collection of items, evicting the least recently accessed item when capacity is reached. The optimal implementation combines a hash map for O(1) lookups with a doubly linked list for O(1) insertions, removals, and updates to access order. Each cache node contains a key, value, and pointers to previous and next nodes. The hash map maps keys to their corresponding nodes in the linked list. For get operations, we retrieve the node from the map, move it to the front of the list (marking it as most recently used), and return its value. For put operations, if the key exists, we update its value and move it to the front. If the key doesn't exist, we create a new node at the front and add it to the map. If this exceeds capacity, we remove the tail node (least recently used) from both the list and the map. All operations run in O(1) time. This implementation handles edge cases like capacity of 1 (single-item cache), repeated access to the same key, and accessing non-existent keys (return a sentinel value like -1). Real-world optimizations include periodic batch evictions rather than single-item removals, using weak references for automatic garbage collection, and implementing size-aware eviction policies when cached items have variable sizes. LRU caches are widely used in database buffer management, web browsers, operating system page replacement, and distributed caching systems like Redis and Memcached.",
    tips: [
      "Explain the data structures needed and why they work together efficiently",
      "Walk through the get and put operations in detail",
      "Discuss edge cases and how to handle them",
      "Compare with other caching policies like LFU, FIFO, or MRU",
    ],
    tags: ["algorithms", "data-structures", "caching", "linked-lists"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-28",
    question:
      "Explain how to implement a solution for the Trapping Rain Water problem.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "The Trapping Rain Water problem asks how much water can be trapped between bars represented by an array of heights. Three primary approaches exist: brute force, dynamic programming, and two-pointer technique. In the brute force approach, for each position, we find the maximum height to its left and right, then calculate trapped water as min(leftMax, rightMax) - height[i], with O(n²) time complexity. The dynamic programming approach precomputes the left and right maximum heights for each position in two passes, then calculates water trapped in a final pass, achieving O(n) time and O(n) space. The most efficient solution uses a two-pointer technique with O(n) time and O(1) space. We maintain two pointers (left and right) at array ends and two variables tracking the maximum height seen from each direction. We move the pointer with the smaller height inward: if the current height is less than its respective maximum, water is trapped equal to the difference; otherwise, we update the maximum. For example, with heights [0,1,0,2,1,0,1,3,2,1,2,1], the two-pointer approach works by comparing heights from both ends, calculating trapped water at each step. Edge cases include empty arrays or arrays with fewer than three elements (no water can be trapped), and monotonically increasing or decreasing heights (also no water trapped). This problem demonstrates how complex calculations can be simplified by approaching from multiple directions simultaneously.",
    tips: [
      "Compare all three approaches with complexity analysis",
      "Explain the intuition behind the two-pointer technique",
      "Walk through a complex example step by step",
      "Discuss the problem's extension to 2D (Trapping Rain Water II)",
    ],
    tags: ["algorithms", "arrays", "two-pointers", "dynamic-programming"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-29",
    question:
      "How would you implement a solution for the Serialize and Deserialize Binary Tree problem?",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "Serializing and deserializing a binary tree requires converting a tree structure to a string format and back. A common approach uses a preorder traversal with null markers. For serialization, we perform a preorder traversal (root, left, right), appending each node's value to a string and using a special symbol (like 'null' or '#') for null nodes. Values are separated by a delimiter like comma. For example, the tree [1,2,3,null,null,4,5] serializes to '1,2,#,#,3,4,#,#,5,#,#'. For deserialization, we split the string by the delimiter and process it recursively. We read the next value: if it's the null symbol, return null; otherwise, create a new node with the value, recursively build its left and right children, and return the node. This approach has O(n) time and space complexity for both operations. Alternative formats include level-order traversal (BFS), which is intuitive but requires careful null handling, or parenthesized expressions like '1(2()())(3(4()())(5()()))'. Edge cases include empty trees (serialize to a single null symbol), single-node trees, and highly unbalanced trees. Optimizations include using binary format for compact representation, compressing repeated patterns, or implementing special handling for complete or perfect trees. The choice of format depends on requirements like human readability, space efficiency, or preservation of specific tree properties. This serialization enables tree persistence, transmission over networks, and comparison of tree structures.",
    tips: [
      "Explain different traversal options for serialization",
      "Walk through the recursive deserialization process in detail",
      "Discuss format choices and their tradeoffs",
      "Address edge cases like empty trees and highly unbalanced trees",
    ],
    tags: ["algorithms", "binary-trees", "serialization", "recursion"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "algo-30",
    question:
      "Describe how to implement a solution for the Word Search II problem.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "Word Search II asks us to find all words from a dictionary that can be formed in a 2D board by connecting adjacent cells. The optimal approach combines a trie data structure with backtracking. First, we build a trie from the dictionary words, with each node containing a character, a flag indicating if it forms a complete word, and links to child nodes. Then, for each cell in the board, we initiate a backtracking DFS if the cell's character matches a trie root child. During backtracking, we explore all four adjacent cells that match the next character in our current trie path. To avoid revisiting cells, we temporarily mark visited cells (e.g., changing the character to a special symbol). When we reach a trie node marked as a complete word, we add that word to our result set. This approach has O(m×n×4^L) time complexity in the worst case, where m and n are the board dimensions and L is the maximum word length. Optimizations include removing words from the trie after finding them and terminating paths that don't lead to remaining words. Compared to checking each dictionary word individually, which would be O(k×m×n×4^L) for k words, the trie approach is significantly more efficient when words share prefixes. Edge cases include empty boards, empty word lists, single-character boards, and words longer than possible paths in the board. This problem demonstrates how specialized data structures can dramatically improve performance for specific pattern-matching tasks.",
    tips: [
      "Explain the trie structure and how to build it efficiently",
      "Detail the backtracking process with pruning optimizations",
      "Compare with naive approaches and analyze complexity improvements",
      "Discuss memory management techniques for large boards or dictionaries",
    ],
    tags: ["algorithms", "backtracking", "tries", "depth-first-search"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
