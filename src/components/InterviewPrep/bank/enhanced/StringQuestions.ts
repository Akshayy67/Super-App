import { EnhancedQuestion } from "../../InterviewSubjects";

export const stringQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-16",
    question: "Longest Palindromic Substring",
    category: "strings",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Expand around centers approach: for each possible center (characters and between characters), expand outward while characters match. Track longest palindrome found. Time complexity: O(n²), Space complexity: O(1). Alternative: Manacher's algorithm achieves O(n) time.",
    tips: [
      "Explain the expand around centers technique",
      "Handle odd and even length palindromes",
      "Discuss Manacher's algorithm for optimization"
    ],
    tags: ["strings", "palindromes", "two-pointers"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function longestPalindrome(s) {
    if (s.length < 2) return s;
    
    let start = 0;
    let maxLength = 1;
    
    for (let i = 0; i < s.length; i++) {
        // Check for odd length palindromes (center at i)
        const len1 = expandAroundCenter(s, i, i);
        
        // Check for even length palindromes (center between i and i+1)
        const len2 = expandAroundCenter(s, i, i + 1);
        
        const currentMax = Math.max(len1, len2);
        
        if (currentMax > maxLength) {
            maxLength = currentMax;
            start = i - Math.floor((currentMax - 1) / 2);
        }
    }
    
    return s.substring(start, start + maxLength);
}

function expandAroundCenter(s, left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
        left--;
        right++;
    }
    
    return right - left - 1; // Length of palindrome
}

// Dynamic Programming approach
function longestPalindromeDP(s) {
    const n = s.length;
    if (n < 2) return s;
    
    const dp = Array(n).fill().map(() => Array(n).fill(false));
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
        for (let i = 0; i <= n - length; i++) {
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
        explanation: "Expand around centers is more space-efficient. DP approach builds up palindrome knowledge systematically but uses O(n²) space.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) expand, O(n²) DP",
        approach: "Expand Around Centers / DP"
      },
      python: {
        solution: `def longest_palindrome(s):
    if len(s) < 2:
        return s
    
    start = 0
    max_length = 1
    
    for i in range(len(s)):
        # Odd length palindromes
        len1 = expand_around_center(s, i, i)
        
        # Even length palindromes
        len2 = expand_around_center(s, i, i + 1)
        
        current_max = max(len1, len2)
        
        if current_max > max_length:
            max_length = current_max
            start = i - (current_max - 1) // 2
    
    return s[start:start + max_length]

def expand_around_center(s, left, right):
    while left >= 0 and right < len(s) and s[left] == s[right]:
        left -= 1
        right += 1
    
    return right - left - 1

def longest_palindrome_manacher(s):
    """Manacher's algorithm for O(n) solution"""
    # Preprocess string
    processed = '#'.join('^{}$'.format(s))
    n = len(processed)
    p = [0] * n  # Array to store palindrome lengths
    center = right = 0
    
    for i in range(1, n - 1):
        # Mirror of i
        mirror = 2 * center - i
        
        if i < right:
            p[i] = min(right - i, p[mirror])
        
        # Try to expand palindrome centered at i
        try:
            while processed[i + (1 + p[i])] == processed[i - (1 + p[i])]:
                p[i] += 1
        except:
            pass
        
        # If palindrome centered at i extends past right, adjust center and right
        if i + p[i] > right:
            center, right = i, i + p[i]
    
    # Find longest palindrome
    max_length = max(p)
    center_index = p.index(max_length)
    start = (center_index - max_length) // 2
    
    return s[start:start + max_length]`,
        explanation: "Python implementation with string slicing. Manacher's algorithm achieves linear time using preprocessing and symmetry properties.",
        timeComplexity: "O(n²) expand, O(n) Manacher",
        spaceComplexity: "O(1) expand, O(n) Manacher",
        approach: "Expand Around Centers"
      },
      java: {
        solution: `public String longestPalindrome(String s) {
    if (s.length() < 2) return s;
    
    int start = 0;
    int maxLength = 1;
    
    for (int i = 0; i < s.length(); i++) {
        int len1 = expandAroundCenter(s, i, i);     // Odd length
        int len2 = expandAroundCenter(s, i, i + 1); // Even length
        
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
}

public String longestPalindromeDP(String s) {
    int n = s.length();
    if (n < 2) return s;
    
    boolean[][] dp = new boolean[n][n];
    int start = 0;
    int maxLength = 1;
    
    // Single characters
    for (int i = 0; i < n; i++) {
        dp[i][i] = true;
    }
    
    // Two characters
    for (int i = 0; i < n - 1; i++) {
        if (s.charAt(i) == s.charAt(i + 1)) {
            dp[i][i + 1] = true;
            start = i;
            maxLength = 2;
        }
    }
    
    // Three or more characters
    for (int length = 3; length <= n; length++) {
        for (int i = 0; i <= n - length; i++) {
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
        explanation: "Java implementation with charAt for character access. DP version systematically builds palindrome knowledge from smaller to larger substrings.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) expand, O(n²) DP",
        approach: "Expand Around Centers"
      }
    },
    algorithmSteps: [
      "For each possible center position in string",
      "Expand around center while characters match",
      "Handle both odd-length (single center) and even-length (dual center) palindromes",
      "Track the longest palindrome found so far",
      "Calculate start position based on center and length",
      "Return substring of longest palindrome"
    ],
    commonMistakes: [
      "Only checking odd-length palindromes",
      "Incorrect start position calculation",
      "Not handling edge cases like empty or single character strings",
      "Off-by-one errors in expansion logic"
    ],
    optimizations: [
      "Expand around centers uses O(1) space",
      "Early termination when remaining centers can't yield longer palindromes",
      "Manacher's algorithm for O(n) time complexity"
    ],
    relatedQuestions: ["Palindromic Substrings", "Valid Palindrome", "Shortest Palindrome"]
  },

  {
    id: "dsa-17",
    question: "Valid Anagram - Check if two strings are anagrams",
    category: "strings",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Two strings are anagrams if they contain the same characters with the same frequencies. Approach 1: Sort both strings and compare. Approach 2: Count character frequencies using hash map or array. Time complexity: O(n log n) sorting, O(n) frequency counting. Space complexity: O(1) or O(k) where k is alphabet size.",
    tips: [
      "Compare sorting vs frequency counting approaches",
      "Discuss space-time tradeoffs",
      "Handle edge cases like different lengths"
    ],
    tags: ["strings", "hash-map", "sorting", "anagrams"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Sorting approach
function isAnagramSort(s, t) {
    if (s.length !== t.length) return false;
    
    const sortedS = s.split('').sort().join('');
    const sortedT = t.split('').sort().join('');
    
    return sortedS === sortedT;
}

// Frequency counting with Map
function isAnagramMap(s, t) {
    if (s.length !== t.length) return false;
    
    const charCount = new Map();
    
    // Count characters in first string
    for (const char of s) {
        charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    
    // Subtract characters from second string
    for (const char of t) {
        if (!charCount.has(char)) return false;
        
        charCount.set(char, charCount.get(char) - 1);
        
        if (charCount.get(char) === 0) {
            charCount.delete(char);
        }
    }
    
    return charCount.size === 0;
}

// Array approach (for lowercase letters only)
function isAnagramArray(s, t) {
    if (s.length !== t.length) return false;
    
    const count = new Array(26).fill(0);
    
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++; // 'a' = 97
        count[t.charCodeAt(i) - 97]--;
    }
    
    return count.every(c => c === 0);
}`,
        explanation: "Multiple approaches: sorting is simple but slower, frequency counting is optimal. Array approach works for limited character sets.",
        timeComplexity: "O(n log n) sort, O(n) frequency",
        spaceComplexity: "O(1) array, O(k) map",
        approach: "Sorting / Frequency Counting"
      },
      python: {
        solution: `def is_anagram_sort(s, t):
    return sorted(s) == sorted(t)

def is_anagram_counter(s, t):
    if len(s) != len(t):
        return False
    
    from collections import Counter
    return Counter(s) == Counter(t)

def is_anagram_manual(s, t):
    if len(s) != len(t):
        return False
    
    char_count = {}
    
    # Count characters in first string
    for char in s:
        char_count[char] = char_count.get(char, 0) + 1
    
    # Subtract characters from second string
    for char in t:
        if char not in char_count:
            return False
        
        char_count[char] -= 1
        
        if char_count[char] == 0:
            del char_count[char]
    
    return len(char_count) == 0

def is_anagram_array(s, t):
    if len(s) != len(t):
        return False
    
    count = [0] * 26
    
    for i in range(len(s)):
        count[ord(s[i]) - ord('a')] += 1
        count[ord(t[i]) - ord('a')] -= 1
    
    return all(c == 0 for c in count)`,
        explanation: "Python's Counter class provides elegant solution. Manual implementation shows the underlying logic. Array approach is most efficient for limited alphabets.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) for lowercase letters",
        approach: "Frequency Counting"
      },
      java: {
        solution: `public boolean isAnagram(String s, String t) {
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
}

public boolean isAnagramSort(String s, String t) {
    if (s.length() != t.length()) return false;
    
    char[] sArray = s.toCharArray();
    char[] tArray = t.toCharArray();
    
    Arrays.sort(sArray);
    Arrays.sort(tArray);
    
    return Arrays.equals(sArray, tArray);
}

public boolean isAnagramMap(String s, String t) {
    if (s.length() != t.length()) return false;
    
    Map<Character, Integer> charCount = new HashMap<>();
    
    // Count characters in first string
    for (char c : s.toCharArray()) {
        charCount.put(c, charCount.getOrDefault(c, 0) + 1);
    }
    
    // Subtract characters from second string
    for (char c : t.toCharArray()) {
        if (!charCount.containsKey(c)) return false;
        
        charCount.put(c, charCount.get(c) - 1);
        
        if (charCount.get(c) == 0) {
            charCount.remove(c);
        }
    }
    
    return charCount.isEmpty();
}`,
        explanation: "Java implementation with array approach for optimal performance. HashMap version handles Unicode characters. Enhanced for loops improve readability.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Frequency Counting"
      }
    },
    algorithmSteps: [
      "Check if strings have equal length (early return if not)",
      "Choose approach: sorting or frequency counting",
      "Sorting: sort both strings and compare",
      "Frequency: count characters in first string",
      "Subtract character counts using second string",
      "Return true if all counts are zero"
    ],
    commonMistakes: [
      "Not checking string lengths first",
      "Using inefficient nested loops",
      "Not handling Unicode characters properly",
      "Forgetting to handle empty strings"
    ],
    optimizations: [
      "Array approach for limited character sets",
      "Single pass counting and comparison",
      "Early termination on length mismatch"
    ],
    relatedQuestions: ["Group Anagrams", "Find All Anagrams in String", "Valid Palindrome"]
  }
];