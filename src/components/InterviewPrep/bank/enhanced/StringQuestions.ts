import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedStringQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-6",
    question: "Check if a string is a valid palindrome",
    category: "strings",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use two pointers from start and end, moving towards center. Compare characters after converting to lowercase and skipping non-alphanumeric characters. Return false if any mismatch found. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Handle case sensitivity and special characters",
      "Consider recursive vs iterative approach",
      "Discuss preprocessing vs on-the-fly filtering"
    ],
    tags: ["strings", "two-pointers", "palindrome"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function isPalindrome(s) {
    // Clean and normalize the string
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

// Alternative: Without preprocessing
function isPalindromeOnTheFly(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Skip non-alphanumeric from left
        while (left < right && !isAlphanumeric(s[left])) {
            left++;
        }
        
        // Skip non-alphanumeric from right
        while (left < right && !isAlphanumeric(s[right])) {
            right--;
        }
        
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

function isAlphanumeric(char) {
    return /[a-zA-Z0-9]/.test(char);
}`,
        explanation: "Two approaches: preprocessing the string vs checking characters on-the-fly. Both use two pointers moving toward center.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) for on-the-fly, O(n) for preprocessing",
        approach: "Two Pointers"
      },
      python: {
        solution: `def is_palindrome(s):
    # Clean and normalize
    cleaned = ''.join(char.lower() for char in s if char.isalnum())
    
    left, right = 0, len(cleaned) - 1
    
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    
    return True

# Alternative: Without preprocessing
def is_palindrome_on_the_fly(s):
    left, right = 0, len(s) - 1
    
    while left < right:
        # Skip non-alphanumeric from left
        while left < right and not s[left].isalnum():
            left += 1
        
        # Skip non-alphanumeric from right
        while left < right and not s[right].isalnum():
            right -= 1
        
        if s[left].lower() != s[right].lower():
            return False
        
        left += 1
        right -= 1
    
    return True`,
        explanation: "Python implementation with built-in string methods. The on-the-fly approach saves space by not creating a new string.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) for on-the-fly, O(n) for preprocessing",
        approach: "Two Pointers"
      },
      java: {
        solution: `public boolean isPalindrome(String s) {
    int left = 0;
    int right = s.length() - 1;
    
    while (left < right) {
        // Skip non-alphanumeric from left
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
            left++;
        }
        
        // Skip non-alphanumeric from right
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
            right--;
        }
        
        if (Character.toLowerCase(s.charAt(left)) != 
            Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}`,
        explanation: "Java implementation using Character utility methods for alphanumeric checking and case conversion. No extra space needed.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Two Pointers"
      }
    },
    algorithmSteps: [
      "Initialize two pointers at start and end of string",
      "Skip non-alphanumeric characters from both ends",
      "Compare characters (case-insensitive)",
      "If mismatch found, return false",
      "Move pointers toward center",
      "Continue until pointers meet or cross",
      "Return true if no mismatches found"
    ],
    commonMistakes: [
      "Not handling case sensitivity",
      "Not skipping non-alphanumeric characters",
      "Off-by-one errors in pointer movement",
      "Not handling empty string or single character"
    ],
    optimizations: [
      "On-the-fly character filtering saves space",
      "Two pointers avoid reversing string",
      "Early termination on first mismatch"
    ],
    relatedQuestions: ["Longest Palindromic Substring", "Palindrome Partitioning", "Valid Palindrome II"]
  },

  {
    id: "dsa-7",
    question: "Find the longest substring without repeating characters",
    category: "strings",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use sliding window technique with a hash set. Expand window by moving right pointer and adding characters to set. When duplicate found, shrink window from left until duplicate is removed. Track maximum window size. Time complexity: O(n), Space complexity: O(min(m,n)) where m is charset size.",
    tips: [
      "Explain sliding window concept clearly",
      "Handle empty string edge case",
      "Discuss optimization using character indices"
    ],
    tags: ["strings", "sliding-window", "hash-set"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function lengthOfLongestSubstring(s) {
    const charSet = new Set();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        // Shrink window until no duplicate
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Optimized version using character indices
function lengthOfLongestSubstringOptimized(s) {
    const charIndex = new Map();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (charIndex.has(s[right]) && charIndex.get(s[right]) >= left) {
            left = charIndex.get(s[right]) + 1;
        }
        
        charIndex.set(s[right], right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation: "Sliding window with hash set. The optimized version uses character indices to jump directly to position after duplicate instead of moving left pointer one by one.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(m, n)) where m is charset size",
        approach: "Sliding Window"
      },
      python: {
        solution: `def length_of_longest_substring(s):
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        # Shrink window until no duplicate
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Optimized version
def length_of_longest_substring_optimized(s):
    char_index = {}
    left = 0
    max_length = 0
    
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        
        char_index[char] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
        explanation: "Python implementation with set for character tracking. The optimized version uses dictionary to store character indices for faster left pointer updates.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(m, n))",
        approach: "Sliding Window"
      },
      java: {
        solution: `public int lengthOfLongestSubstring(String s) {
    Set<Character> charSet = new HashSet<>();
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        // Shrink window until no duplicate
        while (charSet.contains(s.charAt(right))) {
            charSet.remove(s.charAt(left));
            left++;
        }
        
        charSet.add(s.charAt(right));
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Optimized version
public int lengthOfLongestSubstringOptimized(String s) {
    Map<Character, Integer> charIndex = new HashMap<>();
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        if (charIndex.containsKey(s.charAt(right)) && 
            charIndex.get(s.charAt(right)) >= left) {
            left = charIndex.get(s.charAt(right)) + 1;
        }
        
        charIndex.put(s.charAt(right), right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
        explanation: "Java implementation using HashSet and HashMap. The optimized version avoids redundant left pointer movements.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(m, n))",
        approach: "Sliding Window"
      }
    },
    algorithmSteps: [
      "Initialize sliding window with left and right pointers",
      "Expand window by moving right pointer",
      "Add current character to tracking set/map",
      "If duplicate found, shrink window from left",
      "Update maximum length seen so far",
      "Continue until right pointer reaches end",
      "Return maximum length"
    ],
    commonMistakes: [
      "Not handling empty string case",
      "Incorrect window size calculation",
      "Not properly removing characters when shrinking window",
      "Off-by-one errors in pointer movements"
    ],
    optimizations: [
      "Using character indices to skip redundant left movements",
      "Single pass through string",
      "Hash set provides O(1) character lookup"
    ],
    relatedQuestions: ["Longest Substring with At Most K Distinct Characters", "Minimum Window Substring", "Longest Repeating Character Replacement"]
  },

  {
    id: "dsa-8",
    question: "Implement string matching algorithm (KMP or naive)",
    category: "strings",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Naive approach: check every position in text for pattern match, O(nm) time. KMP algorithm: preprocess pattern to create LPS (Longest Proper Prefix which is also Suffix) array, then use it to skip characters during matching, achieving O(n+m) time complexity. KMP avoids redundant comparisons.",
    tips: [
      "Explain LPS array construction",
      "Compare naive vs KMP approaches",
      "Discuss other algorithms like Rabin-Karp"
    ],
    tags: ["strings", "pattern-matching", "kmp"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Naive approach
function strStrNaive(haystack, needle) {
    if (needle.length === 0) return 0;
    
    for (let i = 0; i <= haystack.length - needle.length; i++) {
        let j = 0;
        while (j < needle.length && haystack[i + j] === needle[j]) {
            j++;
        }
        if (j === needle.length) {
            return i;
        }
    }
    
    return -1;
}

// KMP Algorithm
function strStrKMP(haystack, needle) {
    if (needle.length === 0) return 0;
    
    // Build LPS array
    const lps = buildLPS(needle);
    
    let i = 0; // haystack pointer
    let j = 0; // needle pointer
    
    while (i < haystack.length) {
        if (haystack[i] === needle[j]) {
            i++;
            j++;
        }
        
        if (j === needle.length) {
            return i - j;
        } else if (i < haystack.length && haystack[i] !== needle[j]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    return -1;
}

function buildLPS(pattern) {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;
    
    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    
    return lps;
}`,
        explanation: "KMP algorithm uses LPS array to avoid redundant comparisons. When mismatch occurs, we use LPS to determine how many characters we can skip.",
        timeComplexity: "O(n + m) for KMP, O(nm) for naive",
        spaceComplexity: "O(m) for LPS array",
        approach: "KMP Algorithm"
      },
      python: {
        solution: `def str_str_kmp(haystack, needle):
    if not needle:
        return 0
    
    # Build LPS array
    lps = build_lps(needle)
    
    i = j = 0  # haystack and needle pointers
    
    while i < len(haystack):
        if haystack[i] == needle[j]:
            i += 1
            j += 1
        
        if j == len(needle):
            return i - j
        elif i < len(haystack) and haystack[i] != needle[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    
    return -1

def build_lps(pattern):
    lps = [0] * len(pattern)
    length = 0
    i = 1
    
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    
    return lps`,
        explanation: "Python implementation of KMP algorithm. The LPS array helps us skip redundant character comparisons when mismatch occurs.",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(m)",
        approach: "KMP Algorithm"
      },
      java: {
        solution: `public int strStr(String haystack, String needle) {
    if (needle.length() == 0) return 0;
    
    // Build LPS array
    int[] lps = buildLPS(needle);
    
    int i = 0; // haystack pointer
    int j = 0; // needle pointer
    
    while (i < haystack.length()) {
        if (haystack.charAt(i) == needle.charAt(j)) {
            i++;
            j++;
        }
        
        if (j == needle.length()) {
            return i - j;
        } else if (i < haystack.length() && 
                   haystack.charAt(i) != needle.charAt(j)) {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    return -1;
}

private int[] buildLPS(String pattern) {
    int[] lps = new int[pattern.length()];
    int len = 0;
    int i = 1;
    
    while (i < pattern.length()) {
        if (pattern.charAt(i) == pattern.charAt(len)) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    
    return lps;
}`,
        explanation: "Java implementation of KMP with LPS array construction. The algorithm efficiently handles pattern matching with linear time complexity.",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(m)",
        approach: "KMP Algorithm"
      }
    },
    algorithmSteps: [
      "Build LPS (Longest Proper Prefix which is also Suffix) array for pattern",
      "Initialize two pointers: i for text, j for pattern",
      "Compare characters at current positions",
      "If match, advance both pointers",
      "If complete pattern matched, return starting index",
      "If mismatch and j > 0, use LPS to skip characters",
      "If mismatch and j = 0, advance text pointer",
      "Continue until pattern found or text exhausted"
    ],
    commonMistakes: [
      "Incorrect LPS array construction",
      "Not handling edge cases like empty pattern",
      "Wrong pointer updates during mismatch",
      "Not understanding why LPS array works"
    ],
    optimizations: [
      "LPS array avoids redundant comparisons",
      "Linear time complexity vs quadratic naive approach",
      "Preprocessing pattern once for multiple searches"
    ],
    relatedQuestions: ["Rabin-Karp Algorithm", "Boyer-Moore Algorithm", "String Matching with Wildcards"]
  }
];