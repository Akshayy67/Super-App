import { Question } from "../../InterviewSubjects";

// Enhanced Bit Manipulation DSA Questions with comprehensive implementations
export const enhancedBitManipulationQuestions: Question[] = [
  {
    id: "enhanced-bit-1",
    question:
      "Single Number - Given array where every element appears twice except one, find the single element.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "This problem can be solved in different ways, with the XOR approach being the most efficient. We can also extend the solution to handle variations like finding one number among triplets or finding two single numbers.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "XOR Approach: This is the most efficient solution that uses the properties of XOR (a ⊕ a = 0, a ⊕ 0 = a). Since all other numbers appear twice, they XOR to 0, leaving only the single element. Time: O(n), Space: O(1)",
        code: `function singleNumber(nums: number[]): number {
    let result = 0;
    
    for (const num of nums) {
        result ^= num;
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "XOR Approach: Java implementation using XOR properties. Since XOR is commutative and associative, all duplicate numbers cancel out, leaving only the single element. Time: O(n), Space: O(1)",
        code: `public class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        
        for (int num : nums) {
            result ^= num;
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Hash Set Approach: We add numbers to a set as we see them, and remove them if we encounter them again. After processing all numbers, only the single element remains in the set. Time: O(n), Space: O(n)",
        code: `function singleNumberSet(nums: number[]): number {
    const seen = new Set<number>();
    
    for (const num of nums) {
        if (seen.has(num)) {
            seen.delete(num);
        } else {
            seen.add(num);
        }
    }
    
    return seen.values().next().value;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Hash Set Approach: Java implementation using HashSet to track seen numbers. We add/remove numbers as we encounter them, leaving only the single element. Time: O(n), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    public int singleNumber(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        
        for (int num : nums) {
            if (seen.contains(num)) {
                seen.remove(num);
            } else {
                seen.add(num);
            }
        }
        
        return seen.iterator().next();
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Single Number II (Elements Appear 3 Times): This variation uses a finite state machine approach where we track ones and twos. Each bit position evolves independently based on the input. Time: O(n), Space: O(1)",
        code: `function singleNumberII(nums: number[]): number {
    let ones = 0;
    let twos = 0;
    
    for (const num of nums) {
        ones = (ones ^ num) & ~twos;
        twos = (twos ^ num) & ~ones;
    }
    
    return ones;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Single Number II (Elements Appear 3 Times): Java implementation using finite state machine with ones and twos variables. Each bit position tracks its count modulo 3. Time: O(n), Space: O(1)",
        code: `public class Solution {
    public int singleNumber(int[] nums) {
        int ones = 0;
        int twos = 0;
        
        for (int num : nums) {
            ones = (ones ^ num) & ~twos;
            twos = (twos ^ num) & ~ones;
        }
        
        return ones;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Single Number III (Two Single Elements): When there are two single elements, we first XOR all numbers to get the XOR of the two singles. Then we find a bit that differs between them and use it to partition the array. Time: O(n), Space: O(1)",
        code: `function singleNumberIII(nums: number[]): number[] {
    let xor = 0;
    for (const num of nums) {
        xor ^= num;
    }
    
    // Find rightmost set bit
    const rightmostBit = xor & (-xor);
    
    let num1 = 0;
    let num2 = 0;
    
    for (const num of nums) {
        if (num & rightmostBit) {
            num1 ^= num;
        } else {
            num2 ^= num;
        }
    }
    
    return [num1, num2];
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Single Number III (Two Single Elements): Java implementation that partitions array based on a differentiating bit. We use the rightmost set bit to separate the two single numbers. Time: O(n), Space: O(1)",
        code: `public class Solution {
    public int[] singleNumber(int[] nums) {
        int xor = 0;
        for (int num : nums) {
            xor ^= num;
        }
        
        // Find rightmost set bit
        int rightmostBit = xor & (-xor);
        
        int num1 = 0;
        int num2 = 0;
        
        for (int num : nums) {
            if ((num & rightmostBit) != 0) {
                num1 ^= num;
            } else {
                num2 ^= num;
            }
        }
        
        return new int[]{num1, num2};
    }
}`,
      },
      {
        language: "Python",
        code: `# Approach 1: XOR Approach (Optimal)
# Time: O(n), Space: O(1)
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
        explanation: "XOR Approach: Most efficient solution using XOR properties. All duplicate numbers cancel out, leaving only the single element."
      },
      {
        language: "Python",
        code: `# Approach 2: Hash Set Approach
# Time: O(n), Space: O(n)
def single_number_set(nums):
    seen = set()
    
    for num in nums:
        if num in seen:
            seen.remove(num)
        else:
            seen.add(num)
    
    return seen.pop()`,
        explanation: "Hash Set Approach: Add numbers to set as we see them, remove if encountered again. Only single element remains."
      },
      {
        language: "Python",
        code: `# Approach 3: Single Number II (Elements Appear 3 Times)
# Time: O(n), Space: O(1)
def single_number_ii(nums):
    ones = 0
    twos = 0
    
    for num in nums:
        ones = (ones ^ num) & ~twos
        twos = (twos ^ num) & ~ones
    
    return ones`,
        explanation: "Single Number II: Uses finite state machine approach where we track ones and twos. Each bit position evolves independently."
      },
      {
        language: "Python",
        code: `# Approach 4: Single Number III (Two Single Elements)
# Time: O(n), Space: O(1)
def single_number_iii(nums):
    # XOR all numbers to get XOR of two singles
    xor = 0
    for num in nums:
        xor ^= num
    
    # Find rightmost set bit
    rightmost_bit = xor & (-xor)
    
    num1 = 0
    num2 = 0
    
    # Partition array based on rightmost bit
    for num in nums:
        if num & rightmost_bit:
            num1 ^= num
        else:
            num2 ^= num
    
    return [num1, num2]`,
        explanation: "Single Number III: When there are two single elements, partition array based on a differentiating bit."
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "XOR properties: a ⊕ a = 0, a ⊕ 0 = a, commutative",
      "For three occurrences, use finite state machine",
      "For two singles, partition by differentiating bit",
      "Bit manipulation often provides O(1) space solutions",
    ],
    tags: ["bit-manipulation", "array", "math"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-bit-2",
    question:
      "Number of 1 Bits - Write function that takes unsigned integer and returns number of '1' bits.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "This problem, also known as Hamming Weight, can be solved in several ways. The most efficient approach uses Brian Kernighan's algorithm which exploits the property that n & (n-1) removes the rightmost set bit.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Brian Kernighan's Algorithm: This approach cleverly removes the rightmost set bit in each iteration using n & (n-1), counting how many times we need to do this until n becomes 0. Time: O(number of 1 bits), Space: O(1)",
        code: `function hammingWeight(n: number): number {
    let count = 0;
    
    while (n !== 0) {
        n = n & (n - 1); // Remove rightmost set bit
        count++;
    }
    
    return count;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Brian Kernighan's Algorithm: Java implementation that efficiently removes the rightmost set bit in each iteration. This is optimal when the number of set bits is small. Time: O(number of 1 bits), Space: O(1)",
        code: `public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        
        while (n != 0) {
            n = n & (n - 1); // Remove rightmost set bit
            count++;
        }
        
        return count;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Bit Shift Approach: This approach checks each bit position by using a bitwise AND with 1, then shifts the number right. It always takes 32 iterations for a 32-bit integer. Time: O(32), Space: O(1)",
        code: `function hammingWeightShift(n: number): number {
    let count = 0;
    
    while (n !== 0) {
        count += n & 1;
        n = n >>> 1; // Unsigned right shift
    }
    
    return count;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Bit Shift Approach: Java implementation that checks each bit position systematically. We use unsigned right shift to handle negative numbers correctly. Time: O(32), Space: O(1)",
        code: `public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        
        while (n != 0) {
            count += n & 1;
            n = n >>> 1; // Unsigned right shift
        }
        
        return count;
    }
}`,
      },
      {
        language: "typescript",
        approach: "brute-force",
        explanation:
          "Built-in Method: This approach uses JavaScript's built-in methods to convert the number to a binary string and count the '1' characters. While easy to understand, it's less efficient than bit manipulation. Time: O(log n), Space: O(log n)",
        code: `function hammingWeightBuiltIn(n: number): number {
    return n.toString(2).split('').filter(bit => bit === '1').length;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Built-in Method: Java implementation using built-in Integer.bitCount() method. This is the most concise approach and is highly optimized in the JVM. Time: O(1), Space: O(1)",
        code: `public class Solution {
    public int hammingWeight(int n) {
        return Integer.bitCount(n);
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Lookup Table Approach: This approach uses a precomputed table of bit counts for 8-bit numbers, then combines the results for each byte in the 32-bit number. This is efficient for frequent calls. Time: O(1) after preprocessing, Space: O(256)",
        code: `function hammingWeightLookup(n: number): number {
    const lookup = new Array(256);
    
    // Precompute for all 8-bit numbers
    for (let i = 0; i < 256; i++) {
        lookup[i] = (i & 1) + lookup[i >> 1];
    }
    
    return lookup[n & 0xff] + 
           lookup[(n >> 8) & 0xff] + 
           lookup[(n >> 16) & 0xff] + 
           lookup[(n >> 24) & 0xff];
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Lookup Table Approach: Java implementation using precomputed lookup table for 8-bit numbers. This is efficient when the function is called frequently. Time: O(1) after preprocessing, Space: O(256)",
        code: `public class Solution {
    private static final int[] lookup = new int[256];
    
    static {
        // Precompute for all 8-bit numbers
        for (int i = 0; i < 256; i++) {
            lookup[i] = (i & 1) + lookup[i >> 1];
        }
    }
    
    public int hammingWeight(int n) {
        return lookup[n & 0xff] + 
               lookup[(n >> 8) & 0xff] + 
               lookup[(n >> 16) & 0xff] + 
               lookup[(n >> 24) & 0xff];
    }
}`,
      },
      {
        language: "Python",
        code: `# Approach 1: Brian Kernighan's Algorithm (Optimal)
# Time: O(number of 1 bits), Space: O(1)
def hamming_weight(n):
    count = 0
    
    while n != 0:
        n = n & (n - 1)  # Remove rightmost set bit
        count += 1
    
    return count`,
        explanation: "Brian Kernighan's Algorithm: Efficiently removes the rightmost set bit in each iteration. Optimal when number of set bits is small."
      },
      {
        language: "Python",
        code: `# Approach 2: Bit Shift Approach
# Time: O(32), Space: O(1)
def hamming_weight_shift(n):
    count = 0
    
    while n != 0:
        count += n & 1
        n >>= 1  # Right shift
    
    return count`,
        explanation: "Bit Shift Approach: Checks each bit position systematically. Always takes 32 iterations for a 32-bit integer."
      },
      {
        language: "Python",
        code: `# Approach 3: Built-in Method
# Time: O(1), Space: O(1)
def hamming_weight_builtin(n):
    return bin(n).count('1')`,
        explanation: "Built-in Method: Uses Python's built-in bin() function and string count(). Most concise approach."
      },
      {
        language: "Python",
        code: `# Approach 4: Lookup Table Approach
# Time: O(1) after preprocessing, Space: O(256)
def hamming_weight_lookup(n):
    # Precompute lookup table (done once)
    lookup = [0] * 256
    for i in range(1, 256):
        lookup[i] = (i & 1) + lookup[i >> 1]
    
    return (lookup[n & 0xff] + 
            lookup[(n >> 8) & 0xff] + 
            lookup[(n >> 16) & 0xff] + 
            lookup[(n >> 24) & 0xff])`,
        explanation: "Lookup Table Approach: Uses precomputed table for 8-bit numbers. Efficient for frequent calls."
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "n & (n-1) removes rightmost set bit",
      "Count iterations until n becomes 0",
      "Unsigned right shift handles negative numbers correctly",
      "Lookup table optimization for frequent calls",
    ],
    tags: ["bit-manipulation", "math"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-bit-3",
    question:
      "Counting Bits - Given integer n, return array ans where ans[i] is number of 1's in binary representation of i.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "This problem can be efficiently solved using dynamic programming with bit manipulation. The key insight is to leverage previously calculated results instead of calculating each number from scratch.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Dynamic Programming with Bit Manipulation: This optimal approach uses the relationship between a number and its right-shifted version. The number of bits in i equals the number of bits in (i >> 1) plus the least significant bit (i & 1). Time: O(n), Space: O(1) excluding output",
        code: `function countBits(n: number): number[] {
    const result = new Array(n + 1);
    result[0] = 0;
    
    for (let i = 1; i <= n; i++) {
        // Key insight: dp[i] = dp[i >> 1] + (i & 1)
        result[i] = result[i >> 1] + (i & 1);
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Dynamic Programming with Bit Manipulation: Java implementation using the optimal DP recurrence relation. Each number's bit count equals its right-shifted version plus its least significant bit. Time: O(n), Space: O(1) excluding output",
        code: `public class Solution {
    public int[] countBits(int n) {
        int[] result = new int[n + 1];
        result[0] = 0;
        
        for (int i = 1; i <= n; i++) {
            // Key insight: dp[i] = dp[i >> 1] + (i & 1)
            result[i] = result[i >> 1] + (i & 1);
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Using i & (i-1) Pattern: This approach uses the fact that i & (i-1) removes the rightmost set bit. The number of bits in i equals the number of bits in i & (i-1) plus 1. Time: O(n), Space: O(1) excluding output",
        code: `function countBitsAlternative(n: number): number[] {
    const result = new Array(n + 1);
    result[0] = 0;
    
    for (let i = 1; i <= n; i++) {
        result[i] = result[i & (i - 1)] + 1;
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Using i & (i-1) Pattern: Java implementation using Brian Kernighan's bit manipulation trick. This leverages the property that i & (i-1) removes the rightmost set bit. Time: O(n), Space: O(1) excluding output",
        code: `public class Solution {
    public int[] countBits(int n) {
        int[] result = new int[n + 1];
        result[0] = 0;
        
        for (int i = 1; i <= n; i++) {
            result[i] = result[i & (i - 1)] + 1;
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "brute-force",
        explanation:
          "Brute Force Approach: This approach calculates the number of set bits for each number independently by checking each bit. While conceptually simple, it's less efficient than the DP approaches. Time: O(n log n), Space: O(1) excluding output",
        code: `function countBitsBrute(n: number): number[] {
    const result = new Array(n + 1);
    
    for (let i = 0; i <= n; i++) {
        let count = 0;
        let num = i;
        
        while (num !== 0) {
            count += num & 1;
            num >>= 1;
        }
        
        result[i] = count;
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "brute-force",
        explanation:
          "Brute Force Approach: Java implementation that counts bits for each number independently. This is straightforward but less efficient than the DP approaches. Time: O(n log n), Space: O(1) excluding output",
        code: `public class Solution {
    public int[] countBits(int n) {
        int[] result = new int[n + 1];
        
        for (int i = 0; i <= n; i++) {
            int count = 0;
            int num = i;
            
            while (num != 0) {
                count += num & 1;
                num >>= 1;
            }
            
            result[i] = count;
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "brute-force",
        explanation:
          "Using Built-in Method: This approach uses JavaScript's built-in methods to convert each number to a binary string and count the '1' characters. It's easy to understand but less efficient. Time: O(n log n), Space: O(n log n)",
        code: `function countBitsBuiltIn(n: number): number[] {
    const result = new Array(n + 1);
    
    for (let i = 0; i <= n; i++) {
        result[i] = i.toString(2).split('1').length - 1;
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Using Built-in Method: Java implementation using Integer.bitCount() for each number. This is concise and leverages optimized JVM implementations. Time: O(n), Space: O(1) excluding output",
        code: `public class Solution {
    public int[] countBits(int n) {
        int[] result = new int[n + 1];
        
        for (int i = 0; i <= n; i++) {
            result[i] = Integer.bitCount(i);
        }
        
        return result;
    }
}`,
      },
      {
        language: "Python",
        code: `# Approach 1: Dynamic Programming with Bit Manipulation (Optimal)
# Time: O(n), Space: O(1) excluding output
def count_bits(n):
    result = [0] * (n + 1)
    
    for i in range(1, n + 1):
        # Key insight: dp[i] = dp[i >> 1] + (i & 1)
        result[i] = result[i >> 1] + (i & 1)
    
    return result`,
        explanation: "Dynamic Programming with Bit Manipulation: Uses the relationship between a number and its right-shifted version. Each number's bit count equals its right-shifted version plus its least significant bit."
      },
      {
        language: "Python",
        code: `# Approach 2: Using i & (i-1) Pattern (Optimal)
# Time: O(n), Space: O(1) excluding output
def count_bits_alternative(n):
    result = [0] * (n + 1)
    
    for i in range(1, n + 1):
        result[i] = result[i & (i - 1)] + 1
    
    return result`,
        explanation: "Using i & (i-1) Pattern: Leverages Brian Kernighan's bit manipulation trick. i & (i-1) removes the rightmost set bit, so count[i] = count[i & (i-1)] + 1."
      },
      {
        language: "Python",
        code: `# Approach 3: Brute Force Approach
# Time: O(n log n), Space: O(1) excluding output
def count_bits_brute(n):
    result = [0] * (n + 1)
    
    for i in range(n + 1):
        count = 0
        num = i
        
        while num != 0:
            count += num & 1
            num >>= 1
        
        result[i] = count
    
    return result`,
        explanation: "Brute Force Approach: Calculates the number of set bits for each number independently by checking each bit. While conceptually simple, it's less efficient than the DP approaches."
      },
      {
        language: "Python",
        code: `# Approach 4: Using Built-in Method
# Time: O(n), Space: O(1) excluding output
def count_bits_builtin(n):
    result = [0] * (n + 1)
    
    for i in range(n + 1):
        result[i] = bin(i).count('1')
    
    return result`,
        explanation: "Using Built-in Method: Uses Python's built-in bin() function and string count(). Concise and leverages optimized Python implementations."
      }
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "DP relation: count[i] = count[i>>1] + (i&1)",
      "Right shift removes last bit, i&1 checks if it was set",
      "Alternative: count[i] = count[i&(i-1)] + 1",
      "Avoid recalculating by reusing previous results",
    ],
    tags: ["bit-manipulation", "dynamic-programming", "math"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-bit-4",
    question: "Reverse Bits - Reverse bits of a given 32-bit unsigned integer.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "This problem can be solved using several bit manipulation techniques. We can either reverse the bits one by one, use a divide and conquer approach to swap groups of bits, or use a lookup table for frequent operations.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Bit by Bit Reversal: This standard approach processes one bit at a time, shifting the result left and adding each bit from the input. It always takes 32 iterations for a 32-bit integer. Time: O(32), Space: O(1)",
        code: `function reverseBits(n: number): number {
    let result = 0;
    
    for (let i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>>= 1;
    }
    
    return result >>> 0; // Convert to unsigned 32-bit
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Bit by Bit Reversal: Java implementation that processes one bit at a time. We build the result by shifting left and adding each bit from the input. Time: O(32), Space: O(1)",
        code: `public class Solution {
    public int reverseBits(int n) {
        int result = 0;
        
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>>= 1;
        }
        
        return result;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Divide and Conquer Approach: This approach reverses bits by repeatedly swapping groups of bits of decreasing size (16, 8, 4, 2, 1). This is very efficient and has constant time complexity. Time: O(1), Space: O(1)",
        code: `function reverseBitsDivideConquer(n: number): number {
    // Swap 16-bit halves
    n = (n >>> 16) | (n << 16);
    
    // Swap 8-bit quarters
    n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);
    
    // Swap 4-bit nibbles
    n = ((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4);
    
    // Swap 2-bit pairs
    n = ((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2);
    
    // Swap 1-bit pairs
    n = ((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1);
    
    return n >>> 0;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Divide and Conquer Approach: Java implementation using divide and conquer strategy. We repeatedly swap groups of bits of decreasing size for ultra-fast reversal. Time: O(1), Space: O(1)",
        code: `public class Solution {
    public int reverseBits(int n) {
        // Swap 16-bit halves
        n = (n >>> 16) | (n << 16);
        
        // Swap 8-bit quarters
        n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);
        
        // Swap 4-bit nibbles
        n = ((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4);
        
        // Swap 2-bit pairs
        n = ((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2);
        
        // Swap 1-bit pairs
        n = ((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1);
        
        return n;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Lookup Table Approach: This approach precomputes the bit reversals for all 8-bit numbers, then combines the results for each byte in the 32-bit number. This is very efficient for frequent reversals. Time: O(1) after preprocessing, Space: O(256)",
        code: `function reverseBitsLookup(n: number): number {
    const lookup = new Array(256);
    
    // Precompute reverse for all 8-bit numbers
    for (let i = 0; i < 256; i++) {
        let reversed = 0;
        let num = i;
        for (let j = 0; j < 8; j++) {
            reversed = (reversed << 1) | (num & 1);
            num >>= 1;
        }
        lookup[i] = reversed;
    }
    
    return (lookup[n & 0xff] << 24) |
           (lookup[(n >> 8) & 0xff] << 16) |
           (lookup[(n >> 16) & 0xff] << 8) |
           lookup[(n >> 24) & 0xff];
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Lookup Table Approach: Java implementation using precomputed lookup table for 8-bit reversals. This is optimal when the function is called frequently. Time: O(1) after preprocessing, Space: O(256)",
        code: `public class Solution {
    private static final int[] lookup = new int[256];
    
    static {
        // Precompute reverse for all 8-bit numbers
        for (int i = 0; i < 256; i++) {
            int reversed = 0;
            int num = i;
            for (int j = 0; j < 8; j++) {
                reversed = (reversed << 1) | (num & 1);
                num >>= 1;
            }
            lookup[i] = reversed;
        }
    }
    
    public int reverseBits(int n) {
        return (lookup[n & 0xff] << 24) |
               (lookup[(n >>> 8) & 0xff] << 16) |
               (lookup[(n >>> 16) & 0xff] << 8) |
               lookup[(n >>> 24) & 0xff];
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Process bits from right to left, build result from left to right",
      "Use unsigned right shift (>>>) for correct handling",
      "Divide and conquer swaps bit groups of increasing size",
      "Lookup table trades space for time in frequent operations",
    ],
    tags: ["bit-manipulation", "divide-and-conquer"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-bit-5",
    question:
      "Power of Two - Given integer n, return true if it is a power of two.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "A key insight for this problem is that powers of two have exactly one bit set in their binary representation. There are multiple ways to check this property, with bit manipulation being the most efficient.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Bit Manipulation Trick: This optimal approach uses the fact that if n is a power of 2, then n & (n-1) equals 0. This is because a power of 2 has only one bit set, and (n-1) has that bit cleared and all lower bits set. Time: O(1), Space: O(1)",
        code: `function isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Bit Manipulation Trick: Java implementation using the optimal bit manipulation trick. A power of 2 has exactly one bit set, so n & (n-1) removes that bit, resulting in 0. Time: O(1), Space: O(1)",
        code: `public class Solution {
    public boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Count Set Bits Approach: This approach counts the number of set bits in the binary representation of n. If n is a power of 2, there should be exactly one set bit. Time: O(log n), Space: O(1)",
        code: `function isPowerOfTwoCount(n: number): boolean {
    if (n <= 0) return false;
    
    let count = 0;
    while (n > 0) {
        count += n & 1;
        n >>= 1;
    }
    
    return count === 1;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Count Set Bits Approach: Java implementation that counts the number of set bits. A power of 2 has exactly one bit set in its binary representation. Time: O(log n), Space: O(1)",
        code: `public class Solution {
    public boolean isPowerOfTwo(int n) {
        if (n <= 0) return false;
        
        int count = 0;
        while (n > 0) {
            count += n & 1;
            n >>= 1;
        }
        
        return count == 1;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Iterative Division: This approach repeatedly divides n by 2 until we can't divide evenly anymore. If n is a power of 2, the final result should be 1. Time: O(log n), Space: O(1)",
        code: `function isPowerOfTwoDiv(n: number): boolean {
    if (n <= 0) return false;
    
    while (n % 2 === 0) {
        n /= 2;
    }
    
    return n === 1;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Iterative Division: Java implementation using repeated division by 2. If n is a power of 2, we can keep dividing by 2 until we reach 1. Time: O(log n), Space: O(1)",
        code: `public class Solution {
    public boolean isPowerOfTwo(int n) {
        if (n <= 0) return false;
        
        while (n % 2 == 0) {
            n /= 2;
        }
        
        return n == 1;
    }
}`,
      },
      {
        language: "typescript",
        approach: "brute-force",
        explanation:
          "Using Built-in Method: This approach converts n to a binary string and checks if there's exactly one '1' character at the beginning. It's more readable but less efficient. Time: O(log n), Space: O(log n)",
        code: `function isPowerOfTwoBuiltIn(n: number): boolean {
    if (n <= 0) return false;
    
    const binary = n.toString(2);
    return binary.indexOf('1') === binary.lastIndexOf('1') && binary.indexOf('1') === 0;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Using Built-in Method: Java implementation using Integer.bitCount() to count set bits. A power of 2 has exactly one bit set. Time: O(1), Space: O(1)",
        code: `public class Solution {
    public boolean isPowerOfTwo(int n) {
        return n > 0 && Integer.bitCount(n) == 1;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Lookup Table Approach: For 32-bit integers, there are only 31 powers of 2. We can precompute all of them and check if n is in the set. Very efficient but uses additional space. Time: O(1), Space: O(log MAX_INT)",
        code: `function isPowerOfTwoLookup(n: number): boolean {
    const powersOfTwo = new Set([
        1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
        32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304,
        8388608, 16777216, 33554432, 67108864, 134217728, 268435456, 536870912, 1073741824
    ]);
    
    return powersOfTwo.has(n);
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Lookup Table Approach: Java implementation using HashSet with all 32-bit powers of 2. This provides O(1) lookup time but uses extra space. Time: O(1), Space: O(log MAX_INT)",
        code: `import java.util.*;

public class Solution {
    private static final Set<Integer> powersOfTwo = new HashSet<>(Arrays.asList(
        1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
        32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304,
        8388608, 16777216, 33554432, 67108864, 134217728, 268435456, 536870912, 1073741824
    ));
    
    public boolean isPowerOfTwo(int n) {
        return powersOfTwo.contains(n);
    }
}`,
      },
      {
        language: "Python",
        code: `# Approach 1: Bit by Bit Reversal (Moderate)
# Time: O(32), Space: O(1)
def reverse_bits(n):
    result = 0
    
    for i in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    
    return result`,
        explanation: "Bit by Bit Reversal: Processes one bit at a time, shifting the result left and adding each bit from the input. Always takes 32 iterations for a 32-bit integer."
      },
      {
        language: "Python",
        code: `# Approach 2: Divide and Conquer Approach (Optimal)
# Time: O(1), Space: O(1)
def reverse_bits_divide_conquer(n):
    # Swap 16-bit halves
    n = (n >> 16) | (n << 16)
    
    # Swap 8-bit quarters
    n = ((n & 0xff00ff00) >> 8) | ((n & 0x00ff00ff) << 8)
    
    # Swap 4-bit nibbles
    n = ((n & 0xf0f0f0f0) >> 4) | ((n & 0x0f0f0f0f) << 4)
    
    # Swap 2-bit pairs
    n = ((n & 0xcccccccc) >> 2) | ((n & 0x33333333) << 2)
    
    # Swap 1-bit pairs
    n = ((n & 0xaaaaaaaa) >> 1) | ((n & 0x55555555) << 1)
    
    return n`,
        explanation: "Divide and Conquer Approach: Reverses bits by repeatedly swapping groups of bits of decreasing size (16, 8, 4, 2, 1). Very efficient with constant time complexity."
      },
      {
        language: "Python",
        code: `# Approach 3: Lookup Table Approach (Optimal)
# Time: O(1) after preprocessing, Space: O(256)
def reverse_bits_lookup(n):
    # Precompute reverse for all 8-bit numbers
    lookup = [0] * 256
    for i in range(256):
        reversed_num = 0
        num = i
        for j in range(8):
            reversed_num = (reversed_num << 1) | (num & 1)
            num >>= 1
        lookup[i] = reversed_num
    
    return (lookup[n & 0xff] << 24) | \
           (lookup[(n >> 8) & 0xff] << 16) | \
           (lookup[(n >> 16) & 0xff] << 8) | \
           lookup[(n >> 24) & 0xff]`,
        explanation: "Lookup Table Approach: Precomputes bit reversals for all 8-bit numbers, then combines results for each byte. Very efficient for frequent reversals."
      }
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Power of 2 has exactly one bit set",
      "n & (n-1) removes rightmost set bit",
      "If n is power of 2, n & (n-1) equals 0",
      "Handle edge case: n must be positive",
    ],
    tags: ["bit-manipulation", "math"],
    estimatedTime: 10,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-bit-6",
    question:
      "Missing Number - Given array containing n distinct numbers in range [0, n], find the missing number.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "This problem can be solved using several approaches, with bit manipulation (XOR) and mathematical formulas being the most efficient. Other approaches include using a set or binary search if the array is sorted.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "XOR Approach: This optimal approach leverages the property that a ⊕ a = 0 and a ⊕ 0 = a. By XORing all indices and values together, the missing number is the only one that appears once. Time: O(n), Space: O(1)",
        code: `function missingNumber(nums: number[]): number {
    let missing = nums.length;
    
    for (let i = 0; i < nums.length; i++) {
        missing ^= i ^ nums[i];
    }
    
    return missing;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "XOR Approach: Java implementation using XOR properties. We XOR all indices with all values, and the missing number remains since it appears only once. Time: O(n), Space: O(1)",
        code: `public class Solution {
    public int missingNumber(int[] nums) {
        int missing = nums.length;
        
        for (int i = 0; i < nums.length; i++) {
            missing ^= i ^ nums[i];
        }
        
        return missing;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Sum Formula Approach: This approach calculates the expected sum of numbers from 0 to n using the formula n*(n+1)/2, and then subtracts the actual sum of the array. The difference is the missing number. Time: O(n), Space: O(1)",
        code: `function missingNumberSum(nums: number[]): number {
    const n = nums.length;
    const expectedSum = (n * (n + 1)) / 2;
    const actualSum = nums.reduce((sum, num) => sum + num, 0);
    
    return expectedSum - actualSum;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Sum Formula Approach: Java implementation using arithmetic sum formula. We calculate the expected sum and subtract the actual sum to find the missing number. Time: O(n), Space: O(1)",
        code: `public class Solution {
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int expectedSum = n * (n + 1) / 2;
        int actualSum = 0;
        
        for (int num : nums) {
            actualSum += num;
        }
        
        return expectedSum - actualSum;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Binary Search Approach: If the array is sorted, we can use binary search to find the missing number by checking if the value at each index equals the index. Time: O(n log n) if sorting is needed, O(log n) if already sorted, Space: O(1)",
        code: `function missingNumberBinarySearch(nums: number[]): number {
    nums.sort((a, b) => a - b);
    
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === mid) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return left;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Binary Search Approach: Java implementation using binary search on sorted array. We find the first position where value doesn't equal index. Time: O(n log n) if sorting needed, O(log n) if sorted, Space: O(1)",
        code: `import java.util.*;

public class Solution {
    public int missingNumber(int[] nums) {
        Arrays.sort(nums);
        
        int left = 0;
        int right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] == mid) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return left;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Set Approach: This approach adds all numbers in the array to a set, then checks which number from 0 to n is not in the set. Simple but uses extra space. Time: O(n), Space: O(n)",
        code: `function missingNumberSet(nums: number[]): number {
    const numSet = new Set(nums);
    
    for (let i = 0; i <= nums.length; i++) {
        if (!numSet.has(i)) {
            return i;
        }
    }
    
    return -1;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Set Approach: Java implementation using HashSet to store all numbers, then iterate to find the missing one. Simple but uses extra space. Time: O(n), Space: O(n)",
        code: `import java.util.*;

public class Solution {
    public int missingNumber(int[] nums) {
        Set<Integer> numSet = new HashSet<>();
        for (int num : nums) {
            numSet.add(num);
        }
        
        for (int i = 0; i <= nums.length; i++) {
            if (!numSet.contains(i)) {
                return i;
            }
        }
        
        return -1;
    }
}`,
      },
      {
        language: "Python",
        code: `# Approach 1: XOR Approach (Optimal)
# Time: O(n), Space: O(1)
def missing_number(nums):
    missing = len(nums)
    
    for i, num in enumerate(nums):
        missing ^= i ^ num
    
    return missing`,
        explanation: "XOR Approach: Leverages the property that a ⊕ a = 0 and a ⊕ 0 = a. By XORing all indices and values together, the missing number is the only one that appears once."
      },
      {
        language: "Python",
        code: `# Approach 2: Sum Formula Approach (Optimal)
# Time: O(n), Space: O(1)
def missing_number_sum(nums):
    n = len(nums)
    expected_sum = (n * (n + 1)) // 2
    actual_sum = sum(nums)
    
    return expected_sum - actual_sum`,
        explanation: "Sum Formula Approach: Calculates the expected sum of numbers from 0 to n using the formula n*(n+1)/2, and then subtracts the actual sum of the array. The difference is the missing number."
      },
      {
        language: "Python",
        code: `# Approach 3: Binary Search Approach (Moderate)
# Time: O(n log n) if sorting needed, O(log n) if already sorted, Space: O(1)
def missing_number_binary_search(nums):
    nums.sort()
    
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == mid:
            left = mid + 1
        else:
            right = mid - 1
    
    return left`,
        explanation: "Binary Search Approach: If the array is sorted, we can use binary search to find the missing number by checking if the value at each index equals the index."
      },
      {
        language: "Python",
        code: `# Approach 4: Set Approach (Moderate)
# Time: O(n), Space: O(n)
def missing_number_set(nums):
    num_set = set(nums)
    
    for i in range(len(nums) + 1):
        if i not in num_set:
            return i
    
    return -1`,
        explanation: "Set Approach: Adds all numbers in the array to a set, then checks which number from 0 to n is not in the set. Simple but uses extra space."
      }
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "XOR all indices and values; missing number remains",
      "Sum approach: expected_sum - actual_sum",
      "Binary search works if array is sorted",
      "XOR approach handles integer overflow better than sum",
    ],
    tags: ["bit-manipulation", "array", "math", "binary-search"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-bit-7",
    question:
      "Bitwise AND of Numbers Range - Given range [left, right], return bitwise AND of all numbers in range.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "The key insight for this problem is that the bitwise AND of a range of numbers equals the common prefix of the binary representations of the leftmost and rightmost numbers in the range. This is because any bit position where they differ will result in a 0 in the final AND result.",
    codeImplementation: [
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Right Shift Approach: This optimal approach finds the common prefix of left and right by right-shifting both numbers until they become equal. Then we left-shift the result by the same number of positions. Time: O(log n), Space: O(1)",
        code: `function rangeBitwiseAnd(left: number, right: number): number {
    let shift = 0;
    
    // Find common prefix
    while (left !== right) {
        left >>= 1;
        right >>= 1;
        shift++;
    }
    
    return left << shift;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Right Shift Approach: Java implementation that finds the common prefix by right-shifting both numbers until they match. This represents the bitwise AND of the entire range. Time: O(log n), Space: O(1)",
        code: `public class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        int shift = 0;
        
        // Find common prefix
        while (left != right) {
            left >>= 1;
            right >>= 1;
            shift++;
        }
        
        return left << shift;
    }
}`,
      },
      {
        language: "typescript",
        approach: "optimal",
        explanation:
          "Brian Kernighan's Algorithm: This approach repeatedly removes the rightmost set bit from 'right' until it becomes less than or equal to 'left'. The resulting value is the bitwise AND of the range. Time: O(log n), Space: O(1)",
        code: `function rangeBitwiseAndKernighan(left: number, right: number): number {
    while (left < right) {
        right = right & (right - 1); // Remove rightmost set bit
    }
    
    return right;
}`,
      },
      {
        language: "Java",
        approach: "optimal",
        explanation:
          "Brian Kernighan's Algorithm: Java implementation using Kernighan's bit manipulation trick. We remove rightmost set bits from right until it's ≤ left. Time: O(log n), Space: O(1)",
        code: `public class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        while (left < right) {
            right = right & (right - 1); // Remove rightmost set bit
        }
        
        return right;
    }
}`,
      },
      {
        language: "typescript",
        approach: "moderate",
        explanation:
          "Bit by Bit Analysis: This approach examines each bit position from most significant to least significant. Once we find a position where the bits differ between left and right, all lower positions will have 0 in the result. Time: O(1) for 32-bit integers, Space: O(1)",
        code: `function rangeBitwiseAndBitwise(left: number, right: number): number {
    let result = 0;
    
    for (let i = 31; i >= 0; i--) {
        const leftBit = (left >> i) & 1;
        const rightBit = (right >> i) & 1;
        
        if (leftBit !== rightBit) {
            break; // All lower bits will be 0
        }
        
        if (leftBit === 1) {
            result |= (1 << i);
        }
    }
    
    return result;
}`,
      },
      {
        language: "Java",
        approach: "moderate",
        explanation:
          "Bit by Bit Analysis: Java implementation that examines each bit position from MSB to LSB. When bits differ, all lower positions will be 0 in the result. Time: O(1) for 32-bit integers, Space: O(1)",
        code: `public class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        int result = 0;
        
        for (int i = 31; i >= 0; i--) {
            int leftBit = (left >> i) & 1;
            int rightBit = (right >> i) & 1;
            
            if (leftBit != rightBit) {
                break; // All lower bits will be 0
            }
            
            if (leftBit == 1) {
                result |= (1 << i);
            }
        }
        
        return result;
    }
}`,
      },
      {
        language: "Python",
        code: `# Approach 1: Right Shift Approach (Optimal)
# Time: O(log n), Space: O(1)
def range_bitwise_and(left, right):
    shift = 0
    
    # Find common prefix
    while left != right:
        left >>= 1
        right >>= 1
        shift += 1
    
    return left << shift`,
        explanation: "Right Shift Approach: Finds the common prefix of left and right by right-shifting both numbers until they become equal. Then left-shifts the result by the same number of positions."
      },
      {
        language: "Python",
        code: `# Approach 2: Brian Kernighan's Algorithm (Optimal)
# Time: O(log n), Space: O(1)
def range_bitwise_and_kernighan(left, right):
    while left < right:
        right = right & (right - 1)  # Remove rightmost set bit
    
    return right`,
        explanation: "Brian Kernighan's Algorithm: Repeatedly removes the rightmost set bit from 'right' until it becomes less than or equal to 'left'. The resulting value is the bitwise AND of the range."
      },
      {
        language: "Python",
        code: `# Approach 3: Bit by Bit Analysis (Moderate)
# Time: O(1) for 32-bit integers, Space: O(1)
def range_bitwise_and_bitwise(left, right):
    result = 0
    
    for i in range(31, -1, -1):
        left_bit = (left >> i) & 1
        right_bit = (right >> i) & 1
        
        if left_bit != right_bit:
            break  # All lower bits will be 0
        
        if left_bit == 1:
            result |= (1 << i)
    
    return result`,
        explanation: "Bit by Bit Analysis: Examines each bit position from most significant to least significant. Once we find a position where the bits differ between left and right, all lower positions will have 0 in the result."
      }
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "AND of range equals common prefix of left and right",
      "When bit positions differ, all lower bits become 0",
      "Kernighan's algorithm removes set bits from right",
      "Focus on finding longest common prefix",
    ],
    tags: ["bit-manipulation", "math"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
