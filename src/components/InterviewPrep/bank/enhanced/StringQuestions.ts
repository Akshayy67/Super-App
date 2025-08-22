import { Question } from "../../InterviewSubjects";

// Enhanced String DSA Questions with comprehensive implementations
export const enhancedStringQuestions: Question[] = [
  {
    id: "enhanced-string-1",
    question:
      "Valid Anagram - Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Sorting (O(n log n) time, O(n) space): Sort both strings and compare for equality. 2) Hash Map (O(n) time, O(n) space): Count character frequencies using a map. 3) Fixed Array (O(n) time, O(1) space): Use fixed-size array for limited character sets like lowercase letters. The hash map approach is optimal for general cases, while fixed array is most efficient for constrained character sets.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Sorting
// Time: O(n log n), Space: O(n)
function isAnagram(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    return s.split('').sort().join('') === t.split('').sort().join('');
}`,
        explanation:
          "Sort both strings and compare for equality. Simple but less efficient due to sorting overhead.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Hash Map (Optimal)
// Time: O(n), Space: O(n)
function isAnagramCount(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    const charCount = new Map<string, number>();
    
    // Count characters in s
    for (const char of s) {
        charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    
    // Subtract characters in t
    for (const char of t) {
        if (!charCount.has(char)) return false;
        charCount.set(char, charCount.get(char)! - 1);
        if (charCount.get(char) === 0) {
            charCount.delete(char);
        }
    }
    
    return charCount.size === 0;
}`,
        explanation:
          "Count character frequencies using a map. Optimal time complexity for general character sets.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Fixed Array (Most efficient for constrained sets)
// Time: O(n), Space: O(1)
function isAnagramArray(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    const count = new Array(26).fill(0);
    
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++; // 'a' = 97
        count[t.charCodeAt(i) - 97]--;
    }
    
    return count.every(c => c === 0);
}`,
        explanation:
          "Use fixed-size array for counting. Most efficient for constrained character sets like lowercase letters.",
      },
      {
        language: "Java",
        code: `// Approach 1: Sorting
// Time: O(n log n), Space: O(n)
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    
    char[] sArray = s.toCharArray();
    char[] tArray = t.toCharArray();
    
    Arrays.sort(sArray);
    Arrays.sort(tArray);
    
    return Arrays.equals(sArray, tArray);
}`,
        explanation:
          "Sort both strings and compare for equality. Simple but less efficient due to sorting overhead.",
      },
      {
        language: "Java",
        code: `// Approach 2: Hash Map (Optimal)
// Time: O(n), Space: O(n)
public boolean isAnagramCount(String s, String t) {
    if (s.length() != t.length()) return false;
    
    Map<Character, Integer> charCount = new HashMap<>();
    
    // Count characters in s
    for (char c : s.toCharArray()) {
        charCount.put(c, charCount.getOrDefault(c, 0) + 1);
    }
    
    // Subtract characters in t
    for (char c : t.toCharArray()) {
        if (!charCount.containsKey(c)) return false;
        charCount.put(c, charCount.get(c) - 1);
        if (charCount.get(c) == 0) {
            charCount.remove(c);
        }
    }
    
    return charCount.isEmpty();
}`,
        explanation:
          "Count character frequencies using a map. Optimal time complexity for general character sets.",
      },
      {
        language: "Java",
        code: `// Approach 3: Fixed Array (Most efficient for constrained sets)
// Time: O(n), Space: O(1)
public boolean isAnagramArray(String s, String t) {
    if (s.length() != t.length()) return false;
    
    int[] count = new int[26];
    
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    
    for (int c : count) {
        if (c != 0) return false;
    }
    
    return true;
}`,
        explanation:
          "Use fixed-size array for counting. Most efficient for constrained character sets like lowercase letters.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches to determine if strings are anagrams: a sorting-based approach (O(n log n)), a hash map approach using character counting (O(n)), and an array-based solution specifically optimized for lowercase English letters (O(n) with constant space).",
    tips: [
      "Check length equality first for quick rejection",
      "Character counting is more efficient than sorting",
      "Consider Unicode vs ASCII-only requirements",
      "Hash map vs array trade-offs for different character sets",
    ],
    tags: ["string", "hash-table", "sorting"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-2",
    question:
      "Valid Parentheses - Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Stack (O(n) time, O(n) space): Use stack to track opening brackets and match with closing ones. 2) String Replacement (O(n²) time, O(n) space): Repeatedly replace matched pairs until no more matches. 3) Counter Approach (O(n) time, O(1) space): Count brackets for simple cases without mixed types. Stack approach is optimal for general cases with multiple bracket types.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Stack (Optimal)
// Time: O(n), Space: O(n)
function isValid(s: string): boolean {
    const stack: string[] = [];
    const pairs = new Map([
        [')', '('],
        ['}', '{'],
        [']', '[']
    ]);
    
    for (const char of s) {
        if (pairs.has(char)) {
            // Closing bracket
            if (stack.length === 0 || stack.pop() !== pairs.get(char)) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
        explanation:
          "Use stack to track opening brackets and match with closing ones. Standard and optimal approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: String Replacement
// Time: O(n²), Space: O(n)
function isValidReplace(s: string): boolean {
    while (s.includes('()') || s.includes('{}') || s.includes('[]')) {
        s = s.replace('()', '').replace('{}', '').replace('[]', '');
    }
    return s === '';
}`,
        explanation:
          "Repeatedly replace matched pairs until no more matches. Less efficient due to string operations.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Counter (for single bracket type)
// Time: O(n), Space: O(1)
function isValidSimple(s: string): boolean {
    if (s.length % 2 !== 0) return false;
    
    let count = 0;
    for (const char of s) {
        if (char === '(') count++;
        else if (char === ')') count--;
        if (count < 0) return false; // More closing than opening
    }
    
    return count === 0;
}`,
        explanation:
          "Simple counter for single bracket type. Most space efficient but limited to one bracket type.",
      },
      {
        language: "Java",
        code: `// Approach 1: Stack (Optimal)
// Time: O(n), Space: O(n)
public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    Map<Character, Character> pairs = new HashMap<>();
    pairs.put(')', '(');
    pairs.put('}', '{');
    pairs.put(']', '[');
    
    for (char c : s.toCharArray()) {
        if (pairs.containsKey(c)) {
            // Closing bracket
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(c);
        }
    }
    
    return stack.isEmpty();
}`,
        explanation:
          "Use stack to track opening brackets and match with closing ones. Standard and optimal approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: String Replacement
// Time: O(n²), Space: O(n)
public boolean isValidReplace(String s) {
    while (s.contains("()") || s.contains("{}") || s.contains("[]")) {
        s = s.replace("()", "").replace("{}", "").replace("[]", "");
    }
    return s.isEmpty();
}`,
        explanation:
          "Repeatedly replace matched pairs until no more matches. Less efficient due to string operations.",
      },
      {
        language: "Java",
        code: `// Approach 3: Counter (for single bracket type)
// Time: O(n), Space: O(1)
public boolean isValidSimple(String s) {
    if (s.length() % 2 != 0) return false;
    
    int count = 0;
    for (char c : s.toCharArray()) {
        if (c == '(') count++;
        else if (c == ')') count--;
        if (count < 0) return false; // More closing than opening
    }
    
    return count == 0;
}`,
        explanation:
          "Simple counter for single bracket type. Most space efficient but limited to one bracket type.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for approaches to validate matching parentheses. The standard solution uses a stack to track opening brackets and match them with closing brackets. I've also included a string replacement approach (less efficient) and an optimized stack solution with early termination for odd-length strings.",
    tips: [
      "Stack is perfect data structure for matching pairs",
      "Check odd length early for quick rejection",
      "Map closing brackets to their opening counterparts",
      "Empty stack at end confirms all brackets matched",
    ],
    tags: ["string", "stack"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-3",
    question:
      "Longest Palindromic Substring - Given a string s, return the longest palindromic substring in s.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Expand Around Centers (O(n²) time, O(1) space): Check each position as potential center and expand outward. 2) Dynamic Programming (O(n²) time, O(n²) space): Build table where dp[i][j] indicates if substring is palindrome. 3) Manacher's Algorithm (O(n) time, O(n) space): Linear time solution using clever preprocessing and reusing computed information. Expand around centers is most intuitive and space efficient.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Expand Around Centers (Optimal for space)
// Time: O(n²), Space: O(1)
function longestPalindrome(s: string): string {
    if (!s || s.length < 1) return "";
    
    let start = 0;
    let maxLength = 1;
    
    function expandAroundCenter(left: number, right: number): number {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }
    
    for (let i = 0; i < s.length; i++) {
        // Check for odd-length palindromes (center at i)
        const len1 = expandAroundCenter(i, i);
        // Check for even-length palindromes (center between i and i+1)
        const len2 = expandAroundCenter(i, i + 1);
        
        const currentMax = Math.max(len1, len2);
        
        if (currentMax > maxLength) {
            maxLength = currentMax;
            start = i - Math.floor((currentMax - 1) / 2);
        }
    }
    
    return s.substring(start, start + maxLength);
}`,
        explanation:
          "Expand around each potential center. Most intuitive and space efficient approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Dynamic Programming
// Time: O(n²), Space: O(n²)
function longestPalindromeDP(s: string): string {
    const n = s.length;
    const dp: boolean[][] = Array(n).fill(null).map(() => Array(n).fill(false));
    
    let start = 0;
    let maxLength = 1;
    
    // Single characters are palindromes
    for (let i = 0; i < n; i++) {
        dp[i][i] = true;
    }
    
    // Check for 2-character palindromes
    for (let i = 0; i < n - 1; i++) {
        if (s[i] === s[i + 1]) {
            dp[i][i + 1] = true;
            start = i;
            maxLength = 2;
        }
    }
    
    // Check for palindromes of length 3 and more
    for (let length = 3; length <= n; length++) {
        for (let i = 0; i < n - length + 1; i++) {
            const j = i + length - 1;
            
            if (s[i] === s[j] && dp[i + 1][j - 1]) {
                dp[i][j] = true;
                start = i;
                maxLength = length;
            }
        }
    }
    
    return s.substring(start, start + maxLength);
}`,
        explanation:
          "Build 2D table where dp[i][j] indicates if substring is palindrome. More space but structured approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Manacher's Algorithm (Advanced)
// Time: O(n), Space: O(n)
function longestPalindromeManacher(s: string): string {
    // Transform string to handle even-length palindromes
    const transformed = '#' + s.split('').join('#') + '#';
    const n = transformed.length;
    const P = new Array(n).fill(0);
    let center = 0;
    let right = 0;
    
    for (let i = 0; i < n; i++) {
        const mirror = 2 * center - i;
        
        if (i < right) {
            P[i] = Math.min(right - i, P[mirror]);
        }
        
        // Try to expand palindrome centered at i
        while (i + P[i] + 1 < n && i - P[i] - 1 >= 0 && 
               transformed[i + P[i] + 1] === transformed[i - P[i] - 1]) {
            P[i]++;
        }
        
        // If palindrome centered at i extends past right, adjust center and right
        if (i + P[i] > right) {
            center = i;
            right = i + P[i];
        }
    }
    
    // Find the longest palindrome
    let maxLen = 0;
    let centerIndex = 0;
    
    for (let i = 0; i < n; i++) {
        if (P[i] > maxLen) {
            maxLen = P[i];
            centerIndex = i;
        }
    }
    
    const start = (centerIndex - maxLen) / 2;
    return s.substring(start, start + maxLen);
}`,
        explanation:
          "Advanced linear time algorithm using preprocessing. Complex but optimal time complexity.",
      },
      {
        language: "Java",
        code: `// Approach 1: Expand Around Centers (Optimal for space)
// Time: O(n²), Space: O(1)
public String longestPalindrome(String s) {
    if (s == null || s.length() < 1) return "";
    
    int start = 0;
    int maxLength = 1;
    
    for (int i = 0; i < s.length(); i++) {
        // Check for odd-length palindromes (center at i)
        int len1 = expandAroundCenter(s, i, i);
        // Check for even-length palindromes (center between i and i+1)
        int len2 = expandAroundCenter(s, i, i + 1);
        
        int currentMax = Math.max(len1, len2);
        
        if (currentMax > maxLength) {
            maxLength = currentMax;
            start = i - (currentMax - 1) / 2;
        }
    }
    
    return s.substring(start, start + maxLength);
}

private int expandAroundCenter(String s, int left, int right) {
    while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
        left--;
        right++;
    }
    return right - left - 1;
}`,
        explanation:
          "Expand around each potential center. Most intuitive and space efficient approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Dynamic Programming
// Time: O(n²), Space: O(n²)
public String longestPalindromeDP(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    
    int start = 0;
    int maxLength = 1;
    
    // Single characters are palindromes
    for (int i = 0; i < n; i++) {
        dp[i][i] = true;
    }
    
    // Check for 2-character palindromes
    for (int i = 0; i < n - 1; i++) {
        if (s.charAt(i) == s.charAt(i + 1)) {
            dp[i][i + 1] = true;
            start = i;
            maxLength = 2;
        }
    }
    
    // Check for palindromes of length 3 and more
    for (int length = 3; length <= n; length++) {
        for (int i = 0; i < n - length + 1; i++) {
            int j = i + length - 1;
            
            if (s.charAt(i) == s.charAt(j) && dp[i + 1][j - 1]) {
                dp[i][j] = true;
                start = i;
                maxLength = length;
            }
        }
    }
    
    return s.substring(start, start + maxLength);
}`,
        explanation:
          "Build 2D table where dp[i][j] indicates if substring is palindrome. More space but structured approach.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches to find the longest palindromic substring. The expand-around-centers approach (O(n²)) is most intuitive, dynamic programming offers a structured solution using a 2D table, and Manacher's algorithm provides a more complex but optimal O(n) solution.",
    tips: [
      "Expand around centers handles both odd and even length palindromes",
      "Consider each character and each pair as potential centers",
      "Dynamic programming builds up from smaller palindromes",
      "Manacher's algorithm achieves O(n) but complex to implement",
    ],
    tags: ["string", "dynamic-programming", "expand-around-center"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-4",
    question:
      "Minimum Window Substring - Given two strings s and t, return the minimum window substring of s such that every character in t is included in the window.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Sliding Window with Hash Map (O(|s| + |t|) time, O(|s| + |t|) space): Two pointers with frequency tracking using maps. 2) Optimized with Arrays (O(|s| + |t|) time, O(1) space): Use fixed-size arrays for ASCII characters. 3) Brute Force (O(|s|² * |t|) time, O(|t|) space): Check all possible substrings. Sliding window with hash map is optimal for general cases.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Sliding Window with Hash Map (Optimal)
// Time: O(|s| + |t|), Space: O(|s| + |t|)
function minWindow(s: string, t: string): string {
    if (s.length < t.length) return "";
    
    // Count characters in t
    const tCount = new Map<string, number>();
    for (const char of t) {
        tCount.set(char, (tCount.get(char) || 0) + 1);
    }
    
    const windowCount = new Map<string, number>();
    let left = 0;
    let minLen = Infinity;
    let minStart = 0;
    let formed = 0; // Number of unique characters in window with desired frequency
    const required = tCount.size;
    
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        windowCount.set(char, (windowCount.get(char) || 0) + 1);
        
        // Check if current character's frequency matches desired frequency
        if (tCount.has(char) && windowCount.get(char) === tCount.get(char)) {
            formed++;
        }
        
        // Try to shrink window from left
        while (left <= right && formed === required) {
            // Update minimum window if current is smaller
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            
            const leftChar = s[left];
            windowCount.set(leftChar, windowCount.get(leftChar)! - 1);
            
            if (tCount.has(leftChar) && windowCount.get(leftChar)! < tCount.get(leftChar)!) {
                formed--;
            }
            
            left++;
        }
    }
    
    return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
}`,
        explanation:
          "Two pointers with frequency tracking using maps. Optimal approach for general character sets.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Optimized with Arrays
// Time: O(|s| + |t|), Space: O(1)
function minWindowOptimized(s: string, t: string): string {
    if (s.length < t.length) return "";
    
    const tCount = new Array(128).fill(0);
    let required = 0;
    
    // Count characters in t
    for (const char of t) {
        if (tCount[char.charCodeAt(0)] === 0) required++;
        tCount[char.charCodeAt(0)]++;
    }
    
    const windowCount = new Array(128).fill(0);
    let left = 0;
    let minLen = Infinity;
    let minStart = 0;
    let formed = 0;
    
    for (let right = 0; right < s.length; right++) {
        const rightChar = s.charCodeAt(right);
        windowCount[rightChar]++;
        
        if (tCount[rightChar] > 0 && windowCount[rightChar] === tCount[rightChar]) {
            formed++;
        }
        
        while (left <= right && formed === required) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            
            const leftChar = s.charCodeAt(left);
            windowCount[leftChar]--;
            
            if (tCount[leftChar] > 0 && windowCount[leftChar] < tCount[leftChar]) {
                formed--;
            }
            
            left++;
        }
    }
    
    return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
}`,
        explanation:
          "Use fixed-size arrays for ASCII characters. Same complexity but faster in practice.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Brute Force
// Time: O(|s|² * |t|), Space: O(|t|)
function minWindowBrute(s: string, t: string): string {
    if (s.length < t.length) return "";
    
    const tCount = new Map<string, number>();
    for (const char of t) {
        tCount.set(char, (tCount.get(char) || 0) + 1);
    }
    
    let minLen = Infinity;
    let result = "";
    
    for (let i = 0; i < s.length; i++) {
        for (let j = i + t.length - 1; j < s.length; j++) {
            const substring = s.substring(i, j + 1);
            
            if (containsAllChars(substring, tCount) && substring.length < minLen) {
                minLen = substring.length;
                result = substring;
            }
        }
    }
    
    return result;
}

function containsAllChars(str: string, required: Map<string, number>): boolean {
    const count = new Map<string, number>();
    for (const char of str) {
        count.set(char, (count.get(char) || 0) + 1);
    }
    
    for (const [char, freq] of required) {
        if ((count.get(char) || 0) < freq) return false;
    }
    
    return true;
}`,
        explanation:
          "Check all possible substrings. Simple but very inefficient for large strings.",
      },
      {
        language: "Java",
        code: `// Approach 1: Sliding Window with Hash Map (Optimal)
// Time: O(|s| + |t|), Space: O(|s| + |t|)
public String minWindow(String s, String t) {
    if (s.length() < t.length()) return "";
    
    Map<Character, Integer> tCount = new HashMap<>();
    for (char c : t.toCharArray()) {
        tCount.put(c, tCount.getOrDefault(c, 0) + 1);
    }
    
    Map<Character, Integer> windowCount = new HashMap<>();
    int left = 0;
    int minLen = Integer.MAX_VALUE;
    int minStart = 0;
    int formed = 0;
    int required = tCount.size();
    
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        windowCount.put(c, windowCount.getOrDefault(c, 0) + 1);
        
        if (tCount.containsKey(c) && windowCount.get(c).intValue() == tCount.get(c).intValue()) {
            formed++;
        }
        
        while (left <= right && formed == required) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            
            char leftChar = s.charAt(left);
            windowCount.put(leftChar, windowCount.get(leftChar) - 1);
            
            if (tCount.containsKey(leftChar) && windowCount.get(leftChar) < tCount.get(leftChar)) {
                formed--;
            }
            
            left++;
        }
    }
    
    return minLen == Integer.MAX_VALUE ? "" : s.substring(minStart, minStart + minLen);
}`,
        explanation:
          "Two pointers with frequency tracking using maps. Optimal approach for general character sets.",
      },
      {
        language: "Java",
        code: `// Approach 2: Optimized with Arrays
// Time: O(|s| + |t|), Space: O(1)
public String minWindowOptimized(String s, String t) {
    if (s.length() < t.length()) return "";
    
    int[] tCount = new int[128];
    int required = 0;
    
    for (char c : t.toCharArray()) {
        if (tCount[c] == 0) required++;
        tCount[c]++;
    }
    
    int[] windowCount = new int[128];
    int left = 0;
    int minLen = Integer.MAX_VALUE;
    int minStart = 0;
    int formed = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char rightChar = s.charAt(right);
        windowCount[rightChar]++;
        
        if (tCount[rightChar] > 0 && windowCount[rightChar] == tCount[rightChar]) {
            formed++;
        }
        
        while (left <= right && formed == required) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            
            char leftChar = s.charAt(left);
            windowCount[leftChar]--;
            
            if (tCount[leftChar] > 0 && windowCount[leftChar] < tCount[leftChar]) {
                formed--;
            }
            
            left++;
        }
    }
    
    return minLen == Integer.MAX_VALUE ? "" : s.substring(minStart, minStart + minLen);
}`,
        explanation:
          "Use fixed-size arrays for ASCII characters. Same complexity but faster in practice.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for sliding window approaches to find the minimum window substring. The main approach uses hash maps to track character frequencies, while the optimized version uses fixed-size arrays for ASCII characters. Both maintain a window that expands to include required characters and shrinks to find the minimum valid substring.",
    tips: [
      "Use sliding window technique with two pointers",
      "Track character frequencies with hash map",
      "Expand right pointer to include characters, shrink left to minimize window",
      "Handle duplicate characters and case sensitivity requirements",
    ],
    tags: ["string", "sliding-window", "hash-table"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-5",
    question:
      "Group Anagrams - Given an array of strings strs, group the anagrams together.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Sorting Keys (O(n * k log k) time, O(n * k) space): Use sorted string as key for grouping. 2) Character Count Keys (O(n * k) time, O(n * k) space): Use character frequency array as key. 3) Prime Number Keys (O(n * k) time, O(n * k) space): Use product of prime numbers as key (risk of overflow). Character count approach is optimal for longer strings.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Sorting Keys
// Time: O(n * k log k), Space: O(n * k)
function groupAnagrams(strs: string[]): string[][] {
    const groups = new Map<string, string[]>();
    
    for (const str of strs) {
        const sorted = str.split('').sort().join('');
        
        if (!groups.has(sorted)) {
            groups.set(sorted, []);
        }
        groups.get(sorted)!.push(str);
    }
    
    return Array.from(groups.values());
}`,
        explanation:
          "Use sorted string as key for grouping. Simple but less efficient due to sorting overhead.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Character Count Keys (Optimal)
// Time: O(n * k), Space: O(n * k)
function groupAnagramsCount(strs: string[]): string[][] {
    const groups = new Map<string, string[]>();
    
    for (const str of strs) {
        const count = new Array(26).fill(0);
        
        for (const char of str) {
            count[char.charCodeAt(0) - 97]++;
        }
        
        const key = count.join(',');
        
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(str);
    }
    
    return Array.from(groups.values());
}`,
        explanation:
          "Use character frequency array as key. More efficient for longer strings.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Prime Number Keys
// Time: O(n * k), Space: O(n * k)
function groupAnagramsPrime(strs: string[]): string[][] {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];
    const groups = new Map<number, string[]>();
    
    for (const str of strs) {
        let key = 1;
        for (const char of str) {
            key *= primes[char.charCodeAt(0) - 97];
        }
        
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(str);
    }
    
    return Array.from(groups.values());
}`,
        explanation:
          "Use product of prime numbers as key. Creative approach but risks overflow with long strings.",
      },
      {
        language: "Java",
        code: `// Approach 1: Sorting Keys
// Time: O(n * k log k), Space: O(n * k)
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    
    for (String str : strs) {
        char[] chars = str.toCharArray();
        Arrays.sort(chars);
        String sorted = new String(chars);
        
        if (!groups.containsKey(sorted)) {
            groups.put(sorted, new ArrayList<>());
        }
        groups.get(sorted).add(str);
    }
    
    return new ArrayList<>(groups.values());
}`,
        explanation:
          "Use sorted string as key for grouping. Simple but less efficient due to sorting overhead.",
      },
      {
        language: "Java",
        code: `// Approach 2: Character Count Keys (Optimal)
// Time: O(n * k), Space: O(n * k)
public List<List<String>> groupAnagramsCount(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    
    for (String str : strs) {
        int[] count = new int[26];
        
        for (char c : str.toCharArray()) {
            count[c - 'a']++;
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 26; i++) {
            sb.append(count[i]).append(',');
        }
        String key = sb.toString();
        
        if (!groups.containsKey(key)) {
            groups.put(key, new ArrayList<>());
        }
        groups.get(key).add(str);
    }
    
    return new ArrayList<>(groups.values());
}`,
        explanation:
          "Use character frequency array as key. More efficient for longer strings.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches to group anagrams: a sorting-based approach that uses sorted strings as keys, a character count approach that counts letter frequencies, and a mathematical approach using prime numbers. The character count method offers the best balance of efficiency and readability for most cases.",
    tips: [
      "Anagrams have same character frequencies",
      "Sorted string serves as unique identifier for anagram group",
      "Character count array can be more efficient for long strings",
      "Consider memory usage vs time complexity trade-offs",
    ],
    tags: ["string", "hash-table", "sorting"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-6",
    question:
      "Longest Substring Without Repeating Characters - Given a string s, find the length of the longest substring without repeating characters.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Sliding Window with Set (O(n) time, O(min(m,n)) space): Use set to track characters, shrink window when duplicates found. 2) Optimized with Hash Map (O(n) time, O(min(m,n)) space): Track character indices to jump left pointer directly. 3) Fixed Array (O(n) time, O(1) space): Use fixed-size array for ASCII characters. Hash map approach is most efficient as it avoids redundant character removal.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Sliding Window with Set
// Time: O(n), Space: O(min(m,n))
function lengthOfLongestSubstring(s: string): number {
    const charSet = new Set<string>();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Use set to track characters, shrink window when duplicates found. Standard sliding window approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Optimized with Hash Map (Most efficient)
// Time: O(n), Space: O(min(m,n))
function lengthOfLongestSubstringOptimized(s: string): number {
    const charIndex = new Map<string, number>();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (charIndex.has(s[right])) {
            left = Math.max(left, charIndex.get(s[right])! + 1);
        }
        
        charIndex.set(s[right], right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Track character indices to jump left pointer directly. Avoids redundant character removal.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Fixed Array for ASCII
// Time: O(n), Space: O(1)
function lengthOfLongestSubstringArray(s: string): number {
    const charIndex = new Array(128).fill(-1);
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        const charCode = s.charCodeAt(right);
        
        if (charIndex[charCode] >= left) {
            left = charIndex[charCode] + 1;
        }
        
        charIndex[charCode] = right;
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Use fixed-size array for ASCII characters. Most space efficient for constrained character sets.",
      },
      {
        language: "Java",
        code: `// Approach 1: Sliding Window with Set
// Time: O(n), Space: O(min(m,n))
public int lengthOfLongestSubstring(String s) {
    Set<Character> charSet = new HashSet<>();
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        while (charSet.contains(s.charAt(right))) {
            charSet.remove(s.charAt(left));
            left++;
        }
        
        charSet.add(s.charAt(right));
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Use set to track characters, shrink window when duplicates found. Standard sliding window approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Optimized with Hash Map (Most efficient)
// Time: O(n), Space: O(min(m,n))
public int lengthOfLongestSubstringOptimized(String s) {
    Map<Character, Integer> charIndex = new HashMap<>();
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        
        if (charIndex.containsKey(c)) {
            left = Math.max(left, charIndex.get(c) + 1);
        }
        
        charIndex.put(c, right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Track character indices to jump left pointer directly. Avoids redundant character removal.",
      },
      {
        language: "Java",
        code: `// Approach 3: Fixed Array for ASCII
// Time: O(n), Space: O(1)
public int lengthOfLongestSubstringArray(String s) {
    int[] charIndex = new int[128];
    Arrays.fill(charIndex, -1);
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        
        if (charIndex[c] >= left) {
            left = charIndex[c] + 1;
        }
        
        charIndex[c] = right;
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Use fixed-size array for ASCII characters. Most space efficient for constrained character sets.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for sliding window approaches to find the longest substring without repeating characters. The basic approach uses a hash set to track characters in the window, while the optimized version uses a hash map to directly jump the left pointer when encountering duplicates. I've also included a variation that returns the actual substring rather than just its length.",
    tips: [
      "Sliding window maintains valid substring without duplicates",
      "Hash set tracks characters in current window",
      "Hash map optimization: jump left pointer to avoid redundant checks",
      "Consider ASCII vs Unicode character sets for space optimization",
    ],
    tags: ["string", "sliding-window", "hash-table"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-7",
    question:
      "Valid Palindrome - A phrase is a palindrome if it reads the same forward and backward after converting to lowercase and removing non-alphanumeric characters.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Two Pointers (O(n) time, O(1) space): Compare characters from both ends while skipping non-alphanumeric. 2) Clean String First (O(n) time, O(n) space): Remove invalid characters first, then check palindrome. 3) Reverse and Compare (O(n) time, O(n) space): Clean string and compare with its reverse. Two pointers approach is most space efficient.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n), Space: O(1)
function isPalindrome(s: string): boolean {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Skip non-alphanumeric characters from left
        while (left < right && !isAlphanumeric(s[left])) {
            left++;
        }
        
        // Skip non-alphanumeric characters from right
        while (left < right && !isAlphanumeric(s[right])) {
            right--;
        }
        
        // Compare characters (case-insensitive)
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

function isAlphanumeric(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char);
}`,
        explanation:
          "Compare characters from both ends while skipping non-alphanumeric. Most space efficient approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Clean String First
// Time: O(n), Space: O(n)
function isPalindromeClean(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`,
        explanation:
          "Clean string first, then check palindrome. More readable but uses extra space.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Reverse and Compare
// Time: O(n), Space: O(n)
function isPalindromeConcise(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`,
        explanation:
          "Clean string and compare with its reverse. Most concise but least efficient.",
      },
      {
        language: "Java",
        code: `// Approach 1: Two Pointers (Optimal)
// Time: O(n), Space: O(1)
public boolean isPalindrome(String s) {
    int left = 0;
    int right = s.length() - 1;
    
    while (left < right) {
        // Skip non-alphanumeric characters from left
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
            left++;
        }
        
        // Skip non-alphanumeric characters from right
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
            right--;
        }
        
        // Compare characters (case-insensitive)
        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}`,
        explanation:
          "Compare characters from both ends while skipping non-alphanumeric. Most space efficient approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Clean String First
// Time: O(n), Space: O(n)
public boolean isPalindromeClean(String s) {
    String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    int left = 0;
    int right = cleaned.length() - 1;
    
    while (left < right) {
        if (cleaned.charAt(left) != cleaned.charAt(right)) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`,
        explanation:
          "Clean string first, then check palindrome. More readable but uses extra space.",
      },
      {
        language: "Java",
        code: `// Approach 3: Reverse and Compare
// Time: O(n), Space: O(n)
public boolean isPalindromeConcise(String s) {
    String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    return cleaned.equals(new StringBuilder(cleaned).reverse().toString());
}`,
        explanation:
          "Clean string and compare with its reverse. Most concise but least efficient.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches to validate palindromes. The two-pointer approach is most efficient with O(1) space by skipping non-alphanumeric characters during traversal. The clean-string-first approach is more readable but uses O(n) space. Finally, there's a concise one-liner using string reversal, which is elegant but less efficient.",
    tips: [
      "Two pointers avoid extra space for cleaned string",
      "Skip non-alphanumeric characters during traversal",
      "Case-insensitive comparison required",
      "Consider regex vs manual character checking performance",
    ],
    tags: ["string", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-8",
    question:
      "Longest Repeating Character Replacement - Given a string s and integer k, find the length of the longest substring containing the same letter after changing at most k characters.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Sliding Window with Hash Map (O(n) time, O(1) space): Track character frequencies and most frequent character count. 2) Character-by-Character (O(26 * n) time, O(1) space): Try each letter as target character. 3) Brute Force (O(n²) time, O(1) space): Check all possible substrings. Sliding window with hash map is optimal for general cases.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Sliding Window with Hash Map (Optimal)
// Time: O(n), Space: O(1)
function characterReplacement(s: string, k: number): number {
    const charCount = new Map<string, number>();
    let left = 0;
    let maxLength = 0;
    let maxCharCount = 0;
    
    for (let right = 0; right < s.length; right++) {
        const rightChar = s[right];
        charCount.set(rightChar, (charCount.get(rightChar) || 0) + 1);
        maxCharCount = Math.max(maxCharCount, charCount.get(rightChar)!);
        
        // If window size - max char count > k, shrink window
        while (right - left + 1 - maxCharCount > k) {
            const leftChar = s[left];
            charCount.set(leftChar, charCount.get(leftChar)! - 1);
            left++;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Track character frequencies and most frequent character count. Most efficient general approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Character-by-Character
// Time: O(26 * n), Space: O(1)
function characterReplacementVerbose(s: string, k: number): number {
    let maxLength = 0;
    
    // Try each character as the target character
    for (let targetChar = 65; targetChar <= 90; targetChar++) { // A-Z
        const target = String.fromCharCode(targetChar);
        let left = 0;
        let replacements = 0;
        
        for (let right = 0; right < s.length; right++) {
            if (s[right] !== target) {
                replacements++;
            }
            
            while (replacements > k) {
                if (s[left] !== target) {
                    replacements--;
                }
                left++;
            }
            
            maxLength = Math.max(maxLength, right - left + 1);
        }
    }
    
    return maxLength;
}`,
        explanation:
          "Try each letter as target character. More intuitive but less efficient for large alphabets.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Brute Force
// Time: O(n²), Space: O(1)
function characterReplacementBrute(s: string, k: number): number {
    let maxLength = 0;
    
    for (let i = 0; i < s.length; i++) {
        const charCount = new Map<string, number>();
        let maxCharFreq = 0;
        
        for (let j = i; j < s.length; j++) {
            charCount.set(s[j], (charCount.get(s[j]) || 0) + 1);
            maxCharFreq = Math.max(maxCharFreq, charCount.get(s[j])!);
            
            const windowSize = j - i + 1;
            if (windowSize - maxCharFreq <= k) {
                maxLength = Math.max(maxLength, windowSize);
            } else {
                break;
            }
        }
    }
    
    return maxLength;
}`,
        explanation:
          "Check all possible substrings. Simple but inefficient for large strings.",
      },
      {
        language: "Java",
        code: `// Approach 1: Sliding Window with Hash Map (Optimal)
// Time: O(n), Space: O(1)
public int characterReplacement(String s, int k) {
    Map<Character, Integer> charCount = new HashMap<>();
    int left = 0;
    int maxLength = 0;
    int maxCharCount = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char rightChar = s.charAt(right);
        charCount.put(rightChar, charCount.getOrDefault(rightChar, 0) + 1);
        maxCharCount = Math.max(maxCharCount, charCount.get(rightChar));
        
        // If window size - max char count > k, shrink window
        while (right - left + 1 - maxCharCount > k) {
            char leftChar = s.charAt(left);
            charCount.put(leftChar, charCount.get(leftChar) - 1);
            left++;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation:
          "Track character frequencies and most frequent character count. Most efficient general approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Character-by-Character
// Time: O(26 * n), Space: O(1)
public int characterReplacementVerbose(String s, int k) {
    int maxLength = 0;
    
    // Try each character as the target character
    for (char target = 'A'; target <= 'Z'; target++) {
        int left = 0;
        int replacements = 0;
        
        for (int right = 0; right < s.length(); right++) {
            if (s.charAt(right) != target) {
                replacements++;
            }
            
            while (replacements > k) {
                if (s.charAt(left) != target) {
                    replacements--;
                }
                left++;
            }
            
            maxLength = Math.max(maxLength, right - left + 1);
        }
    }
    
    return maxLength;
}`,
        explanation:
          "Try each letter as target character. More intuitive but less efficient for large alphabets.",
      },
    ],
    sampleAnswer:
      "See the code implementations tab for two sliding window approaches to find the longest substring with at most k character replacements. The optimal approach tracks character frequencies within the window and ensures that (window size - max character count) ≤ k for a valid window. I've also included a more intuitive but less efficient approach that tries each letter as the potential repeating character.",
    tips: [
      "Sliding window maintains valid substring with at most k replacements",
      "Track frequency of most common character in current window",
      "Window is valid if: window_size - max_char_frequency <= k",
      "Don't need to decrease maxCharCount when shrinking window (optimization)",
    ],
    tags: ["string", "sliding-window"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-9",
    question:
      "Regular Expression Matching - Given string s and pattern p, implement regular expression matching with '.' and '*'.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Dynamic Programming (O(m*n) time, O(m*n) space): Build 2D table where dp[i][j] represents if s[0...i-1] matches p[0...j-1]. 2) Recursive with Memoization (O(m*n) time, O(m*n) space): Top-down approach with caching. 3) Backtracking (O(2^(m+n)) time, O(m+n) space): Recursive without memoization. Dynamic programming is most efficient and commonly used.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Dynamic Programming (Optimal)
// Time: O(m*n), Space: O(m*n)
function isMatch(s: string, p: string): boolean {
    const m = s.length;
    const n = p.length;
    
    // dp[i][j] = true if s[0...i-1] matches p[0...j-1]
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(false));
    
    dp[0][0] = true; // Empty string matches empty pattern
    
    // Handle patterns like a*, a*b*, a*b*c*
    for (let j = 2; j <= n; j += 2) {
        if (p[j - 1] === '*') {
            dp[0][j] = dp[0][j - 2];
        }
    }
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const currentChar = s[i - 1];
            const patternChar = p[j - 1];
            
            if (patternChar === '*') {
                const prevPatternChar = p[j - 2];
                
                // Zero occurrences
                dp[i][j] = dp[i][j - 2];
                
                // One or more occurrences
                if (prevPatternChar === '.' || prevPatternChar === currentChar) {
                    dp[i][j] = dp[i][j] || dp[i - 1][j];
                }
            } else if (patternChar === '.' || patternChar === currentChar) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Build 2D table bottom-up to determine pattern matching. Most efficient and commonly used approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Recursive with Memoization
// Time: O(m*n), Space: O(m*n)
function isMatchRecursive(s: string, p: string): boolean {
    const memo = new Map<string, boolean>();
    
    function dp(i: number, j: number): boolean {
        if (j === p.length) return i === s.length;
        
        const key = \`\${i},\${j}\`;
        if (memo.has(key)) return memo.get(key)!;
        
        const firstMatch = i < s.length && (p[j] === s[i] || p[j] === '.');
        
        let result: boolean;
        
        if (j + 1 < p.length && p[j + 1] === '*') {
            result = dp(i, j + 2) || (firstMatch && dp(i + 1, j));
        } else {
            result = firstMatch && dp(i + 1, j + 1);
        }
        
        memo.set(key, result);
        return result;
    }
    
    return dp(0, 0);
}`,
        explanation:
          "Top-down approach with caching. Alternative to DP with same complexity.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Backtracking (Without memoization)
// Time: O(2^(m+n)), Space: O(m+n)
function isMatchBacktrack(s: string, p: string): boolean {
    function backtrack(i: number, j: number): boolean {
        if (j === p.length) return i === s.length;
        
        const firstMatch = i < s.length && (p[j] === s[i] || p[j] === '.');
        
        if (j + 1 < p.length && p[j + 1] === '*') {
            return backtrack(i, j + 2) || (firstMatch && backtrack(i + 1, j));
        } else {
            return firstMatch && backtrack(i + 1, j + 1);
        }
    }
    
    return backtrack(0, 0);
}`,
        explanation:
          "Pure recursive approach without caching. Simple but exponential time complexity.",
      },
      {
        language: "Java",
        code: `// Approach 1: Dynamic Programming (Optimal)
// Time: O(m*n), Space: O(m*n)
public boolean isMatch(String s, String p) {
    int m = s.length();
    int n = p.length();
    
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    
    // Handle patterns like a*, a*b*, a*b*c*
    for (int j = 2; j <= n; j += 2) {
        if (p.charAt(j - 1) == '*') {
            dp[0][j] = dp[0][j - 2];
        }
    }
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            char currentChar = s.charAt(i - 1);
            char patternChar = p.charAt(j - 1);
            
            if (patternChar == '*') {
                char prevPatternChar = p.charAt(j - 2);
                
                // Zero occurrences
                dp[i][j] = dp[i][j - 2];
                
                // One or more occurrences
                if (prevPatternChar == '.' || prevPatternChar == currentChar) {
                    dp[i][j] = dp[i][j] || dp[i - 1][j];
                }
            } else if (patternChar == '.' || patternChar == currentChar) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Build 2D table bottom-up to determine pattern matching. Most efficient and commonly used approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Recursive with Memoization
// Time: O(m*n), Space: O(m*n)
public boolean isMatchRecursive(String s, String p) {
    Map<String, Boolean> memo = new HashMap<>();
    return dp(s, p, 0, 0, memo);
}

private boolean dp(String s, String p, int i, int j, Map<String, Boolean> memo) {
    if (j == p.length()) return i == s.length();
    
    String key = i + "," + j;
    if (memo.containsKey(key)) return memo.get(key);
    
    boolean firstMatch = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
    
    boolean result;
    if (j + 1 < p.length() && p.charAt(j + 1) == '*') {
        result = dp(s, p, i, j + 2, memo) || (firstMatch && dp(s, p, i + 1, j, memo));
    } else {
        result = firstMatch && dp(s, p, i + 1, j + 1, memo);
    }
    
    memo.put(key, result);
    return result;
}`,
        explanation:
          "Top-down approach with caching. Alternative to DP with same complexity.",
      },
    ],
    sampleAnswer:
      "See implementation tab for complete solutions using Dynamic Programming and Recursive Memoization approaches.",
    tips: [
      "Handle '*' as zero or more of preceding character",
      "'.' matches any single character",
      "DP state: dp[i][j] = s[0...i-1] matches p[0...j-1]",
      "Consider '*' patterns first, then regular character matching",
    ],
    tags: ["string", "dynamic-programming", "recursion"],
    estimatedTime: 40,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-10",
    question:
      "Wildcard Matching - Given string s and pattern p with '?' and '*', implement wildcard pattern matching.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Dynamic Programming (O(m*n) time, O(m*n) space): Build 2D table where dp[i][j] represents if s[0...i-1] matches p[0...j-1]. 2) Two Pointers with Backtracking (O(m*n) time, O(1) space): Process with two pointers, backtrack for '*' characters. 3) Recursive with Memoization (O(m*n) time, O(m*n) space): Top-down approach with caching. Two pointers approach is most space efficient.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Dynamic Programming
// Time: O(m*n), Space: O(m*n)
function isMatchWildcard(s: string, p: string): boolean {
    const m = s.length;
    const n = p.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(false));
    
    dp[0][0] = true;
    
    // Handle leading stars
    for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
            dp[0][j] = dp[0][j - 1];
        }
    }
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (p[j - 1] === '*') {
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Build 2D table to track substring pattern matches. Standard DP approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Two Pointers with Backtracking (Most space efficient)
// Time: O(m*n), Space: O(1)
function isMatchWildcardTwoPointers(s: string, p: string): boolean {
    let sIndex = 0;
    let pIndex = 0;
    let starIndex = -1;
    let match = 0;
    
    while (sIndex < s.length) {
        if (pIndex < p.length && (p[pIndex] === '?' || p[pIndex] === s[sIndex])) {
            sIndex++;
            pIndex++;
        } else if (pIndex < p.length && p[pIndex] === '*') {
            starIndex = pIndex;
            match = sIndex;
            pIndex++;
        } else if (starIndex !== -1) {
            pIndex = starIndex + 1;
            match++;
            sIndex = match;
        } else {
            return false;
        }
    }
    
    // Skip remaining stars in pattern
    while (pIndex < p.length && p[pIndex] === '*') {
        pIndex++;
    }
    
    return pIndex === p.length;
}`,
        explanation:
          "Process with two pointers, backtrack for '*' characters. Most space efficient approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Recursive with Memoization
// Time: O(m*n), Space: O(m*n)
function isMatchWildcardRecursive(s: string, p: string): boolean {
    const memo = new Map<string, boolean>();
    
    function dp(i: number, j: number): boolean {
        if (j === p.length) return i === s.length;
        if (i === s.length) return p.slice(j).split('').every(c => c === '*');
        
        const key = \`\${i},\${j}\`;
        if (memo.has(key)) return memo.get(key)!;
        
        let result: boolean;
        
        if (p[j] === '*') {
            result = dp(i + 1, j) || dp(i, j + 1);
        } else if (p[j] === '?' || p[j] === s[i]) {
            result = dp(i + 1, j + 1);
        } else {
            result = false;
        }
        
        memo.set(key, result);
        return result;
    }
    
    return dp(0, 0);
}`,
        explanation:
          "Top-down recursive approach with caching. Alternative to DP.",
      },
      {
        language: "Java",
        code: `// Approach 1: Dynamic Programming
// Time: O(m*n), Space: O(m*n)
public boolean isMatch(String s, String p) {
    int m = s.length();
    int n = p.length();
    
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    
    // Handle leading stars
    for (int j = 1; j <= n; j++) {
        if (p.charAt(j - 1) == '*') {
            dp[0][j] = dp[0][j - 1];
        }
    }
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p.charAt(j - 1) == '*') {
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else if (p.charAt(j - 1) == '?' || p.charAt(j - 1) == s.charAt(i - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Build 2D table to track substring pattern matches. Standard DP approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Two Pointers with Backtracking (Most space efficient)
// Time: O(m*n), Space: O(1)
public boolean isMatchTwoPointers(String s, String p) {
    int sIndex = 0;
    int pIndex = 0;
    int starIndex = -1;
    int match = 0;
    
    while (sIndex < s.length()) {
        if (pIndex < p.length() && (p.charAt(pIndex) == '?' || p.charAt(pIndex) == s.charAt(sIndex))) {
            sIndex++;
            pIndex++;
        } else if (pIndex < p.length() && p.charAt(pIndex) == '*') {
            starIndex = pIndex;
            match = sIndex;
            pIndex++;
        } else if (starIndex != -1) {
            pIndex = starIndex + 1;
            match++;
            sIndex = match;
        } else {
            return false;
        }
    }
    
    // Skip remaining stars in pattern
    while (pIndex < p.length() && p.charAt(pIndex) == '*') {
        pIndex++;
    }
    
    return pIndex == p.length();
}`,
        explanation:
          "Process with two pointers, backtrack for '*' characters. Most space efficient approach.",
      },
    ],
    sampleAnswer:
      "See implementation tab for complete solutions using Dynamic Programming and Two Pointers with Backtracking approaches.",
    tips: [
      "'*' matches any sequence of characters (including empty)",
      "'?' matches any single character",
      "DP approach builds up from smaller subproblems",
      "Two pointers with backtracking handles '*' greedily",
    ],
    tags: ["string", "dynamic-programming", "greedy", "backtracking"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-11",
    question:
      "Text Justification - Given array of words and max width, format text to be fully justified.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple approaches available: 1) Greedy Line Packing (O(n) time, O(n) space): Pack words greedily, distribute spaces evenly. 2) Modular Approach (O(n) time, O(n) space): Separate word packing from space distribution logic. 3) In-place Formatting (O(n) time, O(1) space): Format each line without extra space. Greedy approach is most commonly used and intuitive.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Greedy Line Packing (Optimal)
// Time: O(n), Space: O(n)
function fullJustify(words: string[], maxWidth: number): string[] {
    const result: string[] = [];
    let i = 0;
    
    while (i < words.length) {
        // Determine how many words fit in current line
        let lineLength = words[i].length;
        let j = i + 1;
        
        while (j < words.length && lineLength + 1 + words[j].length <= maxWidth) {
            lineLength += 1 + words[j].length;
            j++;
        }
        
        const wordsInLine = j - i;
        const isLastLine = j === words.length;
        
        if (wordsInLine === 1 || isLastLine) {
            // Left justify
            let line = words.slice(i, j).join(' ');
            line += ' '.repeat(maxWidth - line.length);
            result.push(line);
        } else {
            // Full justify
            const totalSpaces = maxWidth - words.slice(i, j).reduce((sum, word) => sum + word.length, 0);
            const gaps = wordsInLine - 1;
            const spacesPerGap = Math.floor(totalSpaces / gaps);
            const extraSpaces = totalSpaces % gaps;
            
            let line = '';
            for (let k = i; k < j; k++) {
                line += words[k];
                if (k < j - 1) {
                    line += ' '.repeat(spacesPerGap + (k - i < extraSpaces ? 1 : 0));
                }
            }
            
            result.push(line);
        }
        
        i = j;
    }
    
    return result;
}`,
        explanation:
          "Pack words greedily, distribute spaces evenly. Most commonly used approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Modular Approach
// Time: O(n), Space: O(n)
function fullJustifyModular(words: string[], maxWidth: number): string[] {
    const result: string[] = [];
    let i = 0;
    
    while (i < words.length) {
        const lineWords = packWords(words, i, maxWidth);
        const isLastLine = i + lineWords.length === words.length;
        
        if (isLastLine || lineWords.length === 1) {
            result.push(leftJustify(lineWords, maxWidth));
        } else {
            result.push(fullJustifyLine(lineWords, maxWidth));
        }
        
        i += lineWords.length;
    }
    
    return result;
}

function packWords(words: string[], start: number, maxWidth: number): string[] {
    const line: string[] = [words[start]];
    let length = words[start].length;
    
    for (let i = start + 1; i < words.length; i++) {
        if (length + 1 + words[i].length <= maxWidth) {
            line.push(words[i]);
            length += 1 + words[i].length;
        } else {
            break;
        }
    }
    
    return line;
}

function leftJustify(words: string[], maxWidth: number): string {
    const line = words.join(' ');
    return line + ' '.repeat(maxWidth - line.length);
}

function fullJustifyLine(words: string[], maxWidth: number): string {
    const totalSpaces = maxWidth - words.reduce((sum, word) => sum + word.length, 0);
    const gaps = words.length - 1;
    const spacesPerGap = Math.floor(totalSpaces / gaps);
    const extraSpaces = totalSpaces % gaps;
    
    let result = '';
    for (let i = 0; i < words.length; i++) {
        result += words[i];
        if (i < words.length - 1) {
            result += ' '.repeat(spacesPerGap + (i < extraSpaces ? 1 : 0));
        }
    }
    
    return result;
}`,
        explanation:
          "Separate word packing from space distribution logic. More modular and testable.",
      },
      {
        language: "Java",
        code: `// Approach 1: Greedy Line Packing (Optimal)
// Time: O(n), Space: O(n)
public List<String> fullJustify(String[] words, int maxWidth) {
    List<String> result = new ArrayList<>();
    int i = 0;
    
    while (i < words.length) {
        // Determine how many words fit in current line
        int lineLength = words[i].length();
        int j = i + 1;
        
        while (j < words.length && lineLength + 1 + words[j].length() <= maxWidth) {
            lineLength += 1 + words[j].length();
            j++;
        }
        
        int wordsInLine = j - i;
        boolean isLastLine = j == words.length;
        
        if (wordsInLine == 1 || isLastLine) {
            // Left justify
            StringBuilder line = new StringBuilder();
            for (int k = i; k < j; k++) {
                line.append(words[k]);
                if (k < j - 1) line.append(' ');
            }
            while (line.length() < maxWidth) {
                line.append(' ');
            }
            result.add(line.toString());
        } else {
            // Full justify
            int totalSpaces = maxWidth;
            for (int k = i; k < j; k++) {
                totalSpaces -= words[k].length();
            }
            
            int gaps = wordsInLine - 1;
            int spacesPerGap = totalSpaces / gaps;
            int extraSpaces = totalSpaces % gaps;
            
            StringBuilder line = new StringBuilder();
            for (int k = i; k < j; k++) {
                line.append(words[k]);
                if (k < j - 1) {
                    for (int s = 0; s < spacesPerGap; s++) {
                        line.append(' ');
                    }
                    if (k - i < extraSpaces) {
                        line.append(' ');
                    }
                }
            }
            
            result.add(line.toString());
        }
        
        i = j;
    }
    
    return result;
}`,
        explanation:
          "Pack words greedily, distribute spaces evenly. Most commonly used approach.",
      },
    ],
    sampleAnswer:
      "See implementation tab for complete solution using a greedy approach with even space distribution.",
    tips: [
      "Pack as many words as possible in each line",
      "Distribute extra spaces evenly, starting from left",
      "Last line should be left-justified only",
      "Single word lines are left-justified with trailing spaces",
    ],
    tags: ["string", "simulation", "greedy"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-12",
    question:
      "Edit Distance Variants - Implement different variants of edit distance with custom operations.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Multiple edit distance variants: 1) One Edit Distance (O(n) time, O(1) space): Check if strings differ by exactly one operation using two pointers. 2) Longest Common Subsequence (O(m*n) time, O(m*n) space): Find longest common subsequence using DP. 3) Distinct Subsequences (O(m*n) time, O(m*n) space): Count ways to form target from source using DP. Each variant uses similar DP principles but different state transitions.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: One Edit Distance
// Time: O(n), Space: O(1)
function isOneEditDistance(s: string, t: string): boolean {
    const m = s.length;
    const n = t.length;
    
    if (Math.abs(m - n) > 1) return false;
    if (s === t) return false;
    
    let i = 0, j = 0;
    
    while (i < m && j < n && s[i] === t[j]) {
        i++;
        j++;
    }
    
    if (i === m && j === n) return false; // Strings are identical
    
    if (m === n) {
        // Replace operation
        i++; j++;
    } else if (m < n) {
        // Insert operation
        j++;
    } else {
        // Delete operation
        i++;
    }
    
    while (i < m && j < n && s[i] === t[j]) {
        i++;
        j++;
    }
    
    return i === m && j === n;
}`,
        explanation:
          "Check if strings differ by exactly one operation using two pointers. Most efficient approach.",
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Longest Common Subsequence
// Time: O(m*n), Space: O(m*n)
function longestCommonSubsequence(text1: string, text2: string): number {
    const m = text1.length;
    const n = text2.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Find longest subsequence common to two strings using DP. Standard LCS algorithm.",
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Distinct Subsequences
// Time: O(m*n), Space: O(m*n)
function numDistinct(s: string, t: string): number {
    const m = s.length;
    const n = t.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Empty string t can be formed in one way from any string s
    for (let i = 0; i <= m; i++) {
        dp[i][0] = 1;
    }
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j]; // Don't use s[i-1]
            
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] += dp[i - 1][j - 1]; // Use s[i-1]
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Count ways to form target from source using DP. Advanced subsequence counting.",
      },
      {
        language: "Java",
        code: `// Approach 1: One Edit Distance
// Time: O(n), Space: O(1)
public boolean isOneEditDistance(String s, String t) {
    int m = s.length();
    int n = t.length();
    
    if (Math.abs(m - n) > 1) return false;
    if (s.equals(t)) return false;
    
    int i = 0, j = 0;
    
    while (i < m && j < n && s.charAt(i) == t.charAt(j)) {
        i++;
        j++;
    }
    
    if (i == m && j == n) return false; // Strings are identical
    
    if (m == n) {
        // Replace operation
        i++; j++;
    } else if (m < n) {
        // Insert operation
        j++;
    } else {
        // Delete operation
        i++;
    }
    
    while (i < m && j < n && s.charAt(i) == t.charAt(j)) {
        i++;
        j++;
    }
    
    return i == m && j == n;
}`,
        explanation:
          "Check if strings differ by exactly one operation using two pointers. Most efficient approach.",
      },
      {
        language: "Java",
        code: `// Approach 2: Longest Common Subsequence
// Time: O(m*n), Space: O(m*n)
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Find longest subsequence common to two strings using DP. Standard LCS algorithm.",
      },
      {
        language: "Java",
        code: `// Approach 3: Distinct Subsequences
// Time: O(m*n), Space: O(m*n)
public int numDistinct(String s, String t) {
    int m = s.length();
    int n = t.length();
    
    int[][] dp = new int[m + 1][n + 1];
    
    // Empty string t can be formed in one way from any string s
    for (int i = 0; i <= m; i++) {
        dp[i][0] = 1;
    }
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j]; // Don't use s[i-1]
            
            if (s.charAt(i - 1) == t.charAt(j - 1)) {
                dp[i][j] += dp[i - 1][j - 1]; // Use s[i-1]
            }
        }
    }
    
    return dp[m][n];
}`,
        explanation:
          "Count ways to form target from source using DP. Advanced subsequence counting.",
      },
    ],
    sampleAnswer:
      "See implementation tab for complete solutions for One Edit Distance, Longest Common Subsequence, and Distinct Subsequences variants.",
    tips: [
      "One edit distance: check if exactly one operation needed",
      "LCS: find longest common subsequence using DP",
      "Distinct subsequences: count ways to form target from source",
      "All variants use similar DP state transitions",
    ],
    tags: ["string", "dynamic-programming", "edit-distance"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
