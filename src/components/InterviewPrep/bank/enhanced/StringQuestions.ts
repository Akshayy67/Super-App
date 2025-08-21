import { Question } from "../../InterviewSubjects";

// Enhanced String DSA Questions with comprehensive implementations
export const enhancedStringQuestions: Question[] = [
  {
    id: "enhanced-string-1",
    question: "Valid Anagram - Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Approach 1: Sorting
// Time: O(n log n), Space: O(1)
function isAnagram(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    return s.split('').sort().join('') === t.split('').sort().join('');
}

// Approach 2: Character Count (Optimal)
// Time: O(n), Space: O(1) - fixed size alphabet
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
}

// Approach 3: Array for lowercase letters only
function isAnagramArray(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    const count = new Array(26).fill(0);
    
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++; // 'a' = 97
        count[t.charCodeAt(i) - 97]--;
    }
    
    return count.every(c => c === 0);
}`,
    tips: [
      "Check length equality first for quick rejection",
      "Character counting is more efficient than sorting",
      "Consider Unicode vs ASCII-only requirements",
      "Hash map vs array trade-offs for different character sets"
    ],
    tags: ["string", "hash-table", "sorting"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-2",
    question: "Valid Parentheses - Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Stack-based Solution (Optimal)
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
}

// Alternative: Replace method (less efficient)
function isValidReplace(s: string): boolean {
    while (s.includes('()') || s.includes('{}') || s.includes('[]')) {
        s = s.replace('()', '').replace('{}', '').replace('[]', '');
    }
    return s === '';
}

// Optimized with early termination
function isValidOptimized(s: string): boolean {
    if (s.length % 2 !== 0) return false;
    
    const stack: string[] = [];
    const openBrackets = new Set(['(', '{', '[']);
    const bracketPairs = { ')': '(', '}': '{', ']': '[' };
    
    for (const char of s) {
        if (openBrackets.has(char)) {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== bracketPairs[char as keyof typeof bracketPairs]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`,
    tips: [
      "Stack is perfect data structure for matching pairs",
      "Check odd length early for quick rejection",
      "Map closing brackets to their opening counterparts",
      "Empty stack at end confirms all brackets matched"
    ],
    tags: ["string", "stack"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-3",
    question: "Longest Palindromic Substring - Given a string s, return the longest palindromic substring in s.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Expand Around Centers (Optimal)
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
}

// Approach 2: Dynamic Programming
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
}

// Approach 3: Manacher's Algorithm (Advanced)
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
    tips: [
      "Expand around centers handles both odd and even length palindromes",
      "Consider each character and each pair as potential centers",
      "Dynamic programming builds up from smaller palindromes",
      "Manacher's algorithm achieves O(n) but complex to implement"
    ],
    tags: ["string", "dynamic-programming", "expand-around-center"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-4",
    question: "Minimum Window Substring - Given two strings s and t, return the minimum window substring of s such that every character in t is included in the window.",
    category: "technical",
    difficulty: "hard",
    type: "coding",
    sampleAnswer: `
// Sliding Window with Hash Map (Optimal)
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
}

// Alternative: Optimized with character array (for ASCII)
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
    tips: [
      "Use sliding window technique with two pointers",
      "Track character frequencies with hash map",
      "Expand right pointer to include characters, shrink left to minimize window",
      "Handle duplicate characters and case sensitivity requirements"
    ],
    tags: ["string", "sliding-window", "hash-table"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-5",
    question: "Group Anagrams - Given an array of strings strs, group the anagrams together.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: Sort each string as key
// Time: O(n * k log k), Space: O(n * k) where n = strs.length, k = max string length
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
}

// Approach 2: Character count as key (better for long strings)
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
}

// Approach 3: Prime number encoding (mathematical)
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
    tips: [
      "Anagrams have same character frequencies",
      "Sorted string serves as unique identifier for anagram group",
      "Character count array can be more efficient for long strings",
      "Consider memory usage vs time complexity trade-offs"
    ],
    tags: ["string", "hash-table", "sorting"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-6",
    question: "Longest Substring Without Repeating Characters - Given a string s, find the length of the longest substring without repeating characters.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Sliding Window with Hash Set (Optimal)
// Time: O(n), Space: O(min(m, n)) where m is character set size
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
}

// Optimized: Jump left pointer directly
// Time: O(n), Space: O(min(m, n))
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
}

// Return the actual substring (not just length)
function longestSubstringWithoutRepeating(s: string): string {
    const charIndex = new Map<string, number>();
    let left = 0;
    let maxLength = 0;
    let resultStart = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (charIndex.has(s[right])) {
            left = Math.max(left, charIndex.get(s[right])! + 1);
        }
        
        charIndex.set(s[right], right);
        
        if (right - left + 1 > maxLength) {
            maxLength = right - left + 1;
            resultStart = left;
        }
    }
    
    return s.substring(resultStart, resultStart + maxLength);
}`,
    tips: [
      "Sliding window maintains valid substring without duplicates",
      "Hash set tracks characters in current window",
      "Hash map optimization: jump left pointer to avoid redundant checks",
      "Consider ASCII vs Unicode character sets for space optimization"
    ],
    tags: ["string", "sliding-window", "hash-table"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-7",
    question: "Valid Palindrome - A phrase is a palindrome if it reads the same forward and backward after converting to lowercase and removing non-alphanumeric characters.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Two Pointers Approach (Optimal)
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
}

// Alternative: Clean string first
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
}

// Most concise (but less efficient)
function isPalindromeConcise(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`,
    tips: [
      "Two pointers avoid extra space for cleaned string",
      "Skip non-alphanumeric characters during traversal",
      "Case-insensitive comparison required",
      "Consider regex vs manual character checking performance"
    ],
    tags: ["string", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-string-8",
    question: "Longest Repeating Character Replacement - Given a string s and integer k, find the length of the longest substring containing the same letter after changing at most k characters.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Sliding Window with Character Count (Optimal)
// Time: O(n), Space: O(1) - fixed alphabet size
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
}

// Alternative: Check all characters
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
    tips: [
      "Sliding window maintains valid substring with at most k replacements",
      "Track frequency of most common character in current window",
      "Window is valid if: window_size - max_char_frequency <= k",
      "Don't need to decrease maxCharCount when shrinking window (optimization)"
    ],
    tags: ["string", "sliding-window"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];