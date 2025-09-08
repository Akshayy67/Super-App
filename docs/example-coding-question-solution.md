# Example Coding Question: Two Sum Problem

## Problem Statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

## Approach Analysis

### Approach 1: Brute Force
- **Time Complexity**: O(n²)
- **Space Complexity**: O(1)
- **Description**: Check every possible pair of numbers

### Approach 2: Hash Map (Optimal)
- **Time Complexity**: O(n)
- **Space Complexity**: O(n)
- **Description**: Use hash map to store complements for O(1) lookup

## Solutions

### TypeScript Implementation

```typescript
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
}

// Test cases
function testTwoSum(): void {
    console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
    console.log(twoSum([3, 2, 4], 6));      // [1, 2]
    console.log(twoSum([3, 3], 6));         // [0, 1]
}

// Performance comparison
function comparePerformance(): void {
    const largeArray = Array.from({length: 10000}, (_, i) => i);
    const target = 19999; // Last two elements
    
    console.time('Hash Map Approach');
    twoSum(largeArray, target);
    console.timeEnd('Hash Map Approach');
    
    console.time('Brute Force Approach');
    twoSumBruteForce(largeArray, target);
    console.timeEnd('Brute Force Approach');
}
```

### Python Implementation

```python
# Approach 1: Hash Map (Optimal)
# Time: O(n), Space: O(n)
def two_sum(nums, target):
    """
    Find two numbers in array that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
        
    Returns:
        List of two indices that sum to target
    """
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    
    return []

# Approach 2: Brute Force
# Time: O(n²), Space: O(1)
def two_sum_brute_force(nums, target):
    """
    Brute force approach checking all pairs.
    
    Args:
        nums: List of integers
        target: Target sum
        
    Returns:
        List of two indices that sum to target
    """
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Approach 3: Using enumerate and dictionary comprehension
# Time: O(n), Space: O(n)
def two_sum_pythonic(nums, target):
    """
    Pythonic approach using dictionary comprehension.
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test function
def test_two_sum():
    """Test all two sum implementations."""
    test_cases = [
        ([2, 7, 11, 15], 9, [0, 1]),
        ([3, 2, 4], 6, [1, 2]),
        ([3, 3], 6, [0, 1]),
        ([1, 2, 3, 4, 5], 8, [2, 4]),
    ]
    
    functions = [two_sum, two_sum_brute_force, two_sum_pythonic]
    
    for nums, target, expected in test_cases:
        print(f"Input: nums={nums}, target={target}")
        for func in functions:
            result = func(nums, target)
            status = "✓" if result == expected else "✗"
            print(f"  {func.__name__}: {result} {status}")
        print()

# Performance comparison
import time

def compare_performance():
    """Compare performance of different approaches."""
    large_array = list(range(10000))
    target = 19999  # Last two elements
    
    # Hash map approach
    start_time = time.time()
    for _ in range(100):
        two_sum(large_array, target)
    hash_time = time.time() - start_time
    
    # Brute force approach (smaller iterations due to O(n²))
    start_time = time.time()
    for _ in range(1):
        two_sum_brute_force(large_array, target)
    brute_time = time.time() - start_time
    
    print(f"Hash Map (100 iterations): {hash_time:.4f} seconds")
    print(f"Brute Force (1 iteration): {brute_time:.4f} seconds")
    print(f"Performance ratio: {brute_time / (hash_time / 100):.2f}x slower")

if __name__ == "__main__":
    test_two_sum()
    compare_performance()
```

### Java Implementation

```java
// Approach 1: Hash Map (Optimal)
// Time: O(n), Space: O(n)
import java.util.*;

public class TwoSum {
    
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        
        return new int[]{};
    }
    
    // Approach 2: Brute Force
    // Time: O(n²), Space: O(1)
    public int[] twoSumBruteForce(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
    
    // Approach 3: Using streams (Java 8+)
    // Time: O(n), Space: O(n)
    public int[] twoSumStream(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        return IntStream.range(0, nums.length)
            .filter(i -> {
                int complement = target - nums[i];
                if (map.containsKey(complement)) {
                    return true;
                }
                map.put(nums[i], i);
                return false;
            })
            .findFirst()
            .map(i -> new int[]{map.get(target - nums[i]), i})
            .orElse(new int[]{});
    }
    
    // Test method
    public static void main(String[] args) {
        TwoSum solution = new TwoSum();
        
        // Test cases
        int[][] testCases = {
            {2, 7, 11, 15},
            {3, 2, 4},
            {3, 3}
        };
        int[] targets = {9, 6, 6};
        int[][] expected = {{0, 1}, {1, 2}, {0, 1}};
        
        for (int i = 0; i < testCases.length; i++) {
            int[] nums = testCases[i];
            int target = targets[i];
            int[] expectedResult = expected[i];
            
            System.out.println("Input: nums=" + Arrays.toString(nums) + 
                             ", target=" + target);
            
            // Test hash map approach
            int[] result1 = solution.twoSum(nums, target);
            System.out.println("  Hash Map: " + Arrays.toString(result1) + 
                             (Arrays.equals(result1, expectedResult) ? " ✓" : " ✗"));
            
            // Test brute force approach
            int[] result2 = solution.twoSumBruteForce(nums, target);
            System.out.println("  Brute Force: " + Arrays.toString(result2) + 
                             (Arrays.equals(result2, expectedResult) ? " ✓" : " ✗"));
            
            System.out.println();
        }
        
        // Performance comparison
        solution.comparePerformance();
    }
    
    // Performance comparison
    public void comparePerformance() {
        int[] largeArray = IntStream.range(0, 10000).toArray();
        int target = 19999; // Last two elements
        
        // Hash map approach
        long startTime = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            twoSum(largeArray, target);
        }
        long hashTime = System.nanoTime() - startTime;
        
        // Brute force approach (fewer iterations due to O(n²))
        startTime = System.nanoTime();
        twoSumBruteForce(largeArray, target);
        long bruteTime = System.nanoTime() - startTime;
        
        System.out.println("Performance Comparison:");
        System.out.println("Hash Map (1000 iterations): " + 
                          hashTime / 1_000_000 + " ms");
        System.out.println("Brute Force (1 iteration): " + 
                          bruteTime / 1_000_000 + " ms");
        System.out.println("Performance ratio: " + 
                          String.format("%.2f", (double) bruteTime / (hashTime / 1000)) + 
                          "x slower");
    }
}
```

## Complexity Analysis Summary

| Approach | Time Complexity | Space Complexity | Pros | Cons |
|----------|----------------|------------------|------|------|
| Hash Map | O(n) | O(n) | Fast, optimal time | Uses extra space |
| Brute Force | O(n²) | O(1) | No extra space | Slow for large inputs |

## Key Learning Points

1. **Trade-offs**: Hash map trades space for time efficiency
2. **Language Features**: 
   - TypeScript: Strong typing and Map interface
   - Python: Clean syntax with enumerate and dictionary
   - Java: HashMap and stream API options
3. **Performance**: Hash map approach is significantly faster for large inputs
4. **Testing**: Comprehensive test cases validate correctness
5. **Real-world**: Hash map approach is preferred in production code

## Interview Tips

1. **Start with brute force** to show you understand the problem
2. **Optimize step by step** and explain your thought process
3. **Discuss trade-offs** between time and space complexity
4. **Write clean, readable code** with proper variable names
5. **Test your solution** with edge cases
6. **Consider follow-up questions** like handling duplicates or multiple solutions
