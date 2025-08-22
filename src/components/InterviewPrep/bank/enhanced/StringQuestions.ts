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
      "To determine if two strings are anagrams, we need to verify they contain the exact same characters with the same frequencies. We can use three main strategies: sorting both strings and comparing equality (easiest but less efficient), using a hash map to track character frequencies (optimal for general cases), or using a fixed-size array for lowercase letters (most efficient for restricted character sets).",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Sorting Approach: This solution sorts both strings and compares them for equality. If they're anagrams, sorting will result in identical strings. Time complexity is O(n log n) due to sorting, and space complexity is O(n) for the sorted copies.",
        code: `function isAnagram(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    return s.split('').sort().join('') === t.split('').sort().join('');
}`,
      },
      {
        language: "Python",
        explanation:
          "Sorting Approach: This solution sorts both strings and compares them for equality. If they're anagrams, sorting will result in identical strings. Time complexity is O(n log n) due to sorting, and space complexity is O(n) for the sorted copies.",
        code: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    
    return sorted(s) == sorted(t)`,
      },
      {
        language: "typescript",
        explanation:
          "Character Count with Hash Map: We use a map to count occurrences of each character in the first string, then decrement counts for each character in the second string. If all characters match exactly, the map will be empty at the end. Time complexity is O(n) and space complexity is O(k) where k is the character set size.",
        code: `function isAnagramCount(s: string, t: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Character Count with Hash Map: We use a dictionary to count occurrences of each character in the first string, then decrement counts for each character in the second string. If all characters match exactly, the dictionary will be empty at the end. Time complexity is O(n) and space complexity is O(k) where k is the character set size.",
        code: `def isAnagramCount(s, t):
    if len(s) != len(t):
        return False
    
    char_count = {}
    
    # Count characters in s
    for char in s:
        char_count[char] = char_count.get(char, 0) + 1
    
    # Subtract characters in t
    for char in t:
        if char not in char_count:
            return False
        char_count[char] -= 1
        if char_count[char] == 0:
            del char_count[char]
    
    return len(char_count) == 0`,
      },
      {
        language: "typescript",
        explanation:
          "Array Count for ASCII Letters: For lowercase letter constraints, we can use a fixed-size array (length 26) for counting. This approach is more memory-efficient than a hash map for restricted character sets. We increment counts for first string chars and decrement for second string chars. Time complexity is O(n) and space complexity is O(1).",
        code: `function isAnagramArray(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    
    const count = new Array(26).fill(0);
    
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++; // 'a' = 97
        count[t.charCodeAt(i) - 97]--;
    }
    
    return count.every(c => c === 0);
}`,
      },
      {
        language: "Python",
        explanation:
          "Array Count for ASCII Letters: For lowercase letter constraints, we can use a fixed-size array (length 26) for counting. This approach is more memory-efficient than a hash map for restricted character sets. We increment counts for first string chars and decrement for second string chars. Time complexity is O(n) and space complexity is O(1).",
        code: `def isAnagramArray(s, t):
    if len(s) != len(t):
        return False
    
    count = [0] * 26
    
    for i in range(len(s)):
        count[ord(s[i]) - ord('a')] += 1
        count[ord(t[i]) - ord('a')] -= 1
    
    return all(c == 0 for c in count)`,
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
      "To validate parentheses matching, we use a stack data structure to track opening brackets and ensure they match with corresponding closing brackets. When we encounter an opening bracket, we push it onto the stack. When we find a closing bracket, we check if it matches the most recent opening bracket (top of stack). The string is valid if all brackets match properly and the stack is empty at the end.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Stack-based Solution: This is the standard approach using a stack to track opening brackets and match them with closing brackets. We map each closing bracket to its corresponding opening bracket. Time complexity is O(n) and space complexity is O(n) in worst case.",
        code: `function isValid(s: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Stack-based Solution: This is the standard approach using a stack to track opening brackets and match them with closing brackets. We map each closing bracket to its corresponding opening bracket. Time complexity is O(n) and space complexity is O(n) in worst case.",
        code: `def isValid(s):
    stack = []
    pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    }
    
    for char in s:
        if char in pairs:
            # Closing bracket
            if not stack or stack.pop() != pairs[char]:
                return False
        else:
            # Opening bracket
            stack.append(char)
    
    return len(stack) == 0`,
      },
      {
        language: "typescript",
        explanation:
          "String Replacement Approach: This alternative repeatedly replaces matching bracket pairs with empty strings until no more replacements can be made. If the resulting string is empty, all brackets matched. This approach is less efficient with O(n²) time complexity due to string manipulation operations.",
        code: `function isValidReplace(s: string): boolean {
    while (s.includes('()') || s.includes('{}') || s.includes('[]')) {
        s = s.replace('()', '').replace('{}', '').replace('[]', '');
    }
    return s === '';
}`,
      },
      {
        language: "Python",
        explanation:
          "String Replacement Approach: This alternative repeatedly replaces matching bracket pairs with empty strings until no more replacements can be made. If the resulting string is empty, all brackets matched. This approach is less efficient with O(n²) time complexity due to string manipulation operations.",
        code: `def isValidReplace(s):
    while '()' in s or '{}' in s or '[]' in s:
        s = s.replace('()', '').replace('{}', '').replace('[]', '')
    return s == ''`,
      },
      {
        language: "typescript",
        explanation:
          "Optimized Stack Solution: This solution adds early validation by checking if the string length is odd (guaranteed invalid) and uses a Set for faster lookup of opening brackets. It's still O(n) time and space complexity, but with optimizations for faster execution.",
        code: `function isValidOptimized(s: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Optimized Stack Solution: This solution adds early validation by checking if the string length is odd (guaranteed invalid) and uses a set for faster lookup of opening brackets. It's still O(n) time and space complexity, but with optimizations for faster execution.",
        code: `def isValidOptimized(s):
    if len(s) % 2 != 0:
        return False
    
    stack = []
    open_brackets = {'(', '{', '['}
    bracket_pairs = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in open_brackets:
            stack.append(char)
        else:
            if not stack or stack.pop() != bracket_pairs[char]:
                return False
    
    return len(stack) == 0`,
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
      "To find the longest palindromic substring, we can use several approaches. The expand-around-center approach checks each possible center position (both for odd and even length palindromes) and expands outward while characters match. Dynamic programming builds a table where dp[i][j] indicates if substring from i to j is a palindrome. For very large strings, Manacher's algorithm provides a linear time solution by reusing previously computed information.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Expand Around Centers: This approach treats each position as a potential center of a palindrome and expands outward as long as characters match. We need to check both odd-length palindromes (centered at a character) and even-length palindromes (centered between characters). Time complexity is O(n²) and space complexity is O(1).",
        code: `function longestPalindrome(s: string): string {
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
      },
      {
        language: "Python",
        explanation:
          "Expand Around Centers: This approach treats each position as a potential center of a palindrome and expands outward as long as characters match. We need to check both odd-length palindromes (centered at a character) and even-length palindromes (centered between characters). Time complexity is O(n²) and space complexity is O(1).",
        code: `def longestPalindrome(s):
    if not s or len(s) < 1:
        return ""
    
    start = 0
    max_length = 1
    
    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1
    
    for i in range(len(s)):
        # Check for odd-length palindromes (center at i)
        len1 = expand_around_center(i, i)
        # Check for even-length palindromes (center between i and i+1)
        len2 = expand_around_center(i, i + 1)
        
        current_max = max(len1, len2)
        
        if current_max > max_length:
            max_length = current_max
            start = i - (current_max - 1) // 2
    
    return s[start:start + max_length]`,
      },
      {
        language: "typescript",
        explanation:
          "Dynamic Programming: We use a 2D table where dp[i][j] is true if substring from index i to j is a palindrome. We fill this table for increasing substring lengths, starting with single characters (always palindromes) and pairs, then longer substrings. Time complexity is O(n²) and space complexity is O(n²).",
        code: `function longestPalindromeDP(s: string): string {
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
      },
      {
        language: "Python",
        explanation:
          "Dynamic Programming: We use a 2D table where dp[i][j] is true if substring from index i to j is a palindrome. We fill this table for increasing substring lengths, starting with single characters (always palindromes) and pairs, then longer substrings. Time complexity is O(n²) and space complexity is O(n²).",
        code: `def longestPalindromeDP(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    
    start = 0
    max_length = 1
    
    # Single characters are palindromes
    for i in range(n):
        dp[i][i] = True
    
    # Check for 2-character palindromes
    for i in range(n - 1):
        if s[i] == s[i + 1]:
            dp[i][i + 1] = True
            start = i
            max_length = 2
    
    # Check for palindromes of length 3 and more
    for length in range(3, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            
            if s[i] == s[j] and dp[i + 1][j - 1]:
                dp[i][j] = True
                start = i
                max_length = length
    
    return s[start:start + max_length]`,
      },
      {
        language: "typescript",
        explanation:
          "Manacher's Algorithm: This advanced algorithm achieves O(n) time complexity by cleverly reusing previously computed palindrome information. It transforms the string to handle both odd and even length palindromes uniformly by inserting special characters between each character. Time complexity is O(n) and space complexity is O(n).",
        code: `function longestPalindromeManacher(s: string): string {
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
      },
      {
        language: "Python",
        explanation:
          "Manacher's Algorithm: This advanced algorithm achieves O(n) time complexity by cleverly reusing previously computed palindrome information. It transforms the string to handle both odd and even length palindromes uniformly by inserting special characters between each character. Time complexity is O(n) and space complexity is O(n).",
        code: `def longestPalindromeManacher(s):
    # Transform string to handle even-length palindromes
    transformed = '#' + '#'.join(s) + '#'
    n = len(transformed)
    P = [0] * n
    center = 0
    right = 0
    
    for i in range(n):
        mirror = 2 * center - i
        
        if i < right:
            P[i] = min(right - i, P[mirror])
        
        # Try to expand palindrome centered at i
        while i + P[i] + 1 < n and i - P[i] - 1 >= 0 and transformed[i + P[i] + 1] == transformed[i - P[i] - 1]:
            P[i] += 1
        
        # If palindrome centered at i extends past right, adjust center and right
        if i + P[i] > right:
            center = i
            right = i + P[i]
    
    # Find the longest palindrome
    max_len = 0
    center_index = 0
    
    for i in range(n):
        if P[i] > max_len:
            max_len = P[i]
            center_index = i
    
    start = (center_index - max_len) // 2
    return s[start:start + max_len]`,
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
      "To find the minimum window substring containing all characters from a target string, we use the sliding window technique. We maintain a window with two pointers (left and right) and expand or shrink it based on whether all required characters are included. We track character frequencies using hash maps or arrays and optimize by only considering windows that contain all required characters.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Sliding Window with Hash Map: This approach uses two hash maps to track character frequencies in the target string and current window. We expand the window until we have all required characters (with correct frequencies), then shrink from the left to find the minimum valid window. Time complexity is O(|s| + |t|) where s and t are the input strings. Space complexity is O(|s| + |t|) for the hash maps.",
        code: `function minWindow(s: string, t: string): string {
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
      },
      {
        language: "Python",
        explanation:
          "Sliding Window with Hash Map: This approach uses two hash maps to track character frequencies in the target string and current window. We expand the window until we have all required characters (with correct frequencies), then shrink from the left to find the minimum valid window. Time complexity is O(|s| + |t|) where s and t are the input strings. Space complexity is O(|s| + |t|) for the hash maps.",
        code: `def minWindow(s, t):
    if len(s) < len(t):
        return ""
    
    # Count characters in t
    t_count = {}
    for char in t:
        t_count[char] = t_count.get(char, 0) + 1
    
    window_count = {}
    left = 0
    min_len = float('inf')
    min_start = 0
    formed = 0 # Number of unique characters in window with desired frequency
    required = len(t_count)
    
    for right in range(len(s)):
        char = s[right]
        window_count[char] = window_count.get(char, 0) + 1
        
        # Check if current character's frequency matches desired frequency
        if char in t_count and window_count[char] == t_count[char]:
            formed += 1
        
        # Try to shrink window from left
        while left <= right and formed == required:
            # Update minimum window if current is smaller
            if right - left + 1 < min_len:
                min_len = right - left + 1
                min_start = left
            
            left_char = s[left]
            window_count[left_char] -= 1
            
            if left_char in t_count and window_count[left_char] < t_count[left_char]:
                formed -= 1
            
            left += 1
    
    return s[min_start:min_start + min_len] if min_len != float('inf') else ""`,
      },
      {
        language: "typescript",
        explanation:
          "Optimized with Character Array: For ASCII characters, we can optimize further by using fixed-size arrays instead of hash maps. This approach has the same time complexity of O(|s| + |t|) but can be faster in practice due to reduced overhead. Space complexity is O(1) since the arrays are fixed size regardless of input length.",
        code: `function minWindowOptimized(s: string, t: string): string {
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
      },
      {
        language: "Python",
        explanation:
          "Optimized with Character Array: For ASCII characters, we can optimize further by using fixed-size arrays instead of hash maps. This approach has the same time complexity of O(|s| + |t|) but can be faster in practice due to reduced overhead. Space complexity is O(1) since the arrays are fixed size regardless of input length.",
        code: `def minWindowOptimized(s, t):
    if len(s) < len(t):
        return ""
    
    t_count = [0] * 128
    required = 0
    
    # Count characters in t
    for char in t:
        if t_count[ord(char)] == 0:
            required += 1
        t_count[ord(char)] += 1
    
    window_count = [0] * 128
    left = 0
    min_len = float('inf')
    min_start = 0
    formed = 0
    
    for right in range(len(s)):
        right_char = ord(s[right])
        window_count[right_char] += 1
        
        if t_count[right_char] > 0 and window_count[right_char] == t_count[right_char]:
            formed += 1
        
        while left <= right and formed == required:
            if right - left + 1 < min_len:
                min_len = right - left + 1
                min_start = left
            
            left_char = ord(s[left])
            window_count[left_char] -= 1
            
            if t_count[left_char] > 0 and window_count[left_char] < t_count[left_char]:
                formed -= 1
            
            left += 1
    
    return s[min_start:min_start + min_len] if min_len != float('inf') else ""`,
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
      "To group anagrams together, we need a way to identify strings that are anagrams of each other. Since anagrams have the same characters with the same frequencies, we can use various strategies to create a unique key for each anagram group: sorting each string (simple but less efficient), counting character frequencies (more efficient for long strings), or using a mathematical approach with prime numbers (creative but risks overflow).",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Sorting Approach: We use the sorted version of each string as a key in a hash map. Strings that are anagrams will have the same sorted representation. Time complexity is O(n * k log k) where n is the number of strings and k is the maximum string length. Space complexity is O(n * k).",
        code: `function groupAnagrams(strs: string[]): string[][] {
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
      },
      {
        language: "Python",
        explanation:
          "Sorting Approach: We use the sorted version of each string as a key in a hash map. Strings that are anagrams will have the same sorted representation. Time complexity is O(n * k log k) where n is the number of strings and k is the maximum string length. Space complexity is O(n * k).",
        code: `def groupAnagrams(strs):
    groups = {}
    
    for s in strs:
        sorted_s = ''.join(sorted(s))
        
        if sorted_s not in groups:
            groups[sorted_s] = []
        groups[sorted_s].append(s)
    
    return list(groups.values())`,
      },
      {
        language: "typescript",
        explanation:
          "Character Count Approach: Instead of sorting, we count the frequency of each character and use that count array as a key. This is more efficient for longer strings. Time complexity is O(n * k) where n is the number of strings and k is the maximum string length. Space complexity is O(n * k).",
        code: `function groupAnagramsCount(strs: string[]): string[][] {
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
      },
      {
        language: "Python",
        explanation:
          "Character Count Approach: Instead of sorting, we count the frequency of each character and use that count array as a key. This is more efficient for longer strings. Time complexity is O(n * k) where n is the number of strings and k is the maximum string length. Space complexity is O(n * k).",
        code: `def groupAnagramsCount(strs):
    groups = {}
    
    for s in strs:
        count = [0] * 26
        
        for char in s:
            count[ord(char) - ord('a')] += 1
        
        key = ','.join(map(str, count))
        
        if key not in groups:
            groups[key] = []
        groups[key].append(s)
    
    return list(groups.values())`,
      },
      {
        language: "typescript",
        explanation:
          "Prime Number Approach: This mathematical approach assigns a unique prime number to each character and multiplies them together to form a key. Since the product of prime numbers is unique for any combination (fundamental theorem of arithmetic), this creates a unique identifier for each anagram group. Caution: This can cause integer overflow with long strings. Time complexity is O(n * k) where n is the number of strings and k is the maximum string length.",
        code: `function groupAnagramsPrime(strs: string[]): string[][] {
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
      },
      {
        language: "Python",
        explanation:
          "Prime Number Approach: This mathematical approach assigns a unique prime number to each character and multiplies them together to form a key. Since the product of prime numbers is unique for any combination (fundamental theorem of arithmetic), this creates a unique identifier for each anagram group. Caution: This can cause integer overflow with long strings. Time complexity is O(n * k) where n is the number of strings and k is the maximum string length.",
        code: `def groupAnagramsPrime(strs):
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101]
    groups = {}
    
    for s in strs:
        key = 1
        for char in s:
            key *= primes[ord(char) - ord('a')]
        
        if key not in groups:
            groups[key] = []
        groups[key].append(s)
    
    return list(groups.values())`,
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
      "To find the longest substring without repeating characters, we use a sliding window approach that maintains a valid window without duplicates. We expand the window by moving the right pointer and contract it from the left when we encounter repeated characters. We can optimize this process by using a hash map to track character indices, allowing us to jump the left pointer directly to the position after a repeated character.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Sliding Window with Hash Set: This approach uses a set to track characters in the current window. When we encounter a repeated character, we remove characters from the left until the window is valid again. Time complexity is O(n) where each character is processed at most twice (once added, once removed). Space complexity is O(min(m, n)) where m is the character set size.",
        code: `function lengthOfLongestSubstring(s: string): number {
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
      },
      {
        language: "Python",
        explanation:
          "Sliding Window with Hash Set: This approach uses a set to track characters in the current window. When we encounter a repeated character, we remove characters from the left until the window is valid again. Time complexity is O(n) where each character is processed at most twice (once added, once removed). Space complexity is O(min(m, n)) where m is the character set size.",
        code: `def lengthOfLongestSubstring(s):
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
      },
      {
        language: "typescript",
        explanation:
          "Optimized with Hash Map: This improvement uses a map to store the most recent index of each character. When we find a repeated character, we can directly jump the left pointer to the position right after the previous occurrence. This avoids the need to remove characters one by one. Time complexity remains O(n) but with better practical performance. Space complexity is still O(min(m, n)).",
        code: `function lengthOfLongestSubstringOptimized(s: string): number {
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
      },
      {
        language: "Python",
        explanation:
          "Optimized with Hash Map: This improvement uses a map to store the most recent index of each character. When we find a repeated character, we can directly jump the left pointer to the position right after the previous occurrence. This avoids the need to remove characters one by one. Time complexity remains O(n) but with better practical performance. Space complexity is still O(min(m, n)).",
        code: `def lengthOfLongestSubstringOptimized(s):
    char_index = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        if s[right] in char_index:
            left = max(left, char_index[s[right]] + 1)
        
        char_index[s[right]] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
      },
      {
        language: "typescript",
        explanation:
          "Return the Substring: This variation returns the actual substring rather than just its length. We track the starting position of the maximum length substring as we go. It uses the same optimized approach with a hash map to track character indices. Time and space complexity remain O(n) and O(min(m, n)) respectively.",
        code: `function longestSubstringWithoutRepeating(s: string): string {
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
      },
      {
        language: "Python",
        explanation:
          "Return the Substring: This variation returns the actual substring rather than just its length. We track the starting position of the maximum length substring as we go. It uses the same optimized approach with a hash map to track character indices. Time and space complexity remain O(n) and O(min(m, n)) respectively.",
        code: `def longestSubstringWithoutRepeating(s):
    char_index = {}
    left = 0
    max_length = 0
    result_start = 0
    
    for right in range(len(s)):
        if s[right] in char_index:
            left = max(left, char_index[s[right]] + 1)
        
        char_index[s[right]] = right
        
        if right - left + 1 > max_length:
            max_length = right - left + 1
            result_start = left
    
    return s[result_start:result_start + max_length]`,
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
      "To check if a string is a valid palindrome after ignoring non-alphanumeric characters, we can use different approaches. The two-pointer technique compares characters from both ends while skipping invalid characters, avoiding extra space. Alternatively, we can first clean the string by removing invalid characters and then check if it's a palindrome, which is cleaner but uses more space.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Two Pointers Approach: This space-efficient solution uses pointers at both ends of the string, moving inward while comparing characters. We skip non-alphanumeric characters and convert to lowercase for case-insensitive comparison. Time complexity is O(n) and space complexity is O(1) as we don't create a new string.",
        code: `function isPalindrome(s: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Two Pointers Approach: This space-efficient solution uses pointers at both ends of the string, moving inward while comparing characters. We skip non-alphanumeric characters and convert to lowercase for case-insensitive comparison. Time complexity is O(n) and space complexity is O(1) as we don't create a new string.",
        code: `def isPalindrome(s):
    left = 0
    right = len(s) - 1
    
    while left < right:
        # Skip non-alphanumeric characters from left
        while left < right and not isAlphanumeric(s[left]):
            left += 1
        
        # Skip non-alphanumeric characters from right
        while left < right and not isAlphanumeric(s[right]):
            right -= 1
        
        # Compare characters (case-insensitive)
        if s[left].lower() != s[right].lower():
            return False
        
        left += 1
        right -= 1
    
    return True

def isAlphanumeric(char):
    return char.isalnum()`,
      },
      {
        language: "typescript",
        explanation:
          "Clean String First Approach: This approach first creates a cleaned version of the string (lowercase and only alphanumeric), then checks if it's a palindrome. This makes the code cleaner and simpler, but uses O(n) extra space for the cleaned string. Time complexity is still O(n).",
        code: `function isPalindromeClean(s: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Clean String First Approach: This approach first creates a cleaned version of the string (lowercase and only alphanumeric), then checks if it's a palindrome. This makes the code cleaner and simpler, but uses O(n) extra space for the cleaned string. Time complexity is still O(n).",
        code: `def isPalindromeClean(s):
    cleaned = ''.join(c for c in s.lower() if c.isalnum())
    left = 0
    right = len(cleaned) - 1
    
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    
    return True`,
      },
      {
        language: "typescript",
        explanation:
          "Concise Approach: This one-liner creates a cleaned string, then compares it with its reversed version. While elegant, it's less efficient than the other approaches because string reversal requires O(n) extra space and time. Time and space complexity are both O(n).",
        code: `function isPalindromeConcise(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`,
      },
      {
        language: "Python",
        explanation:
          "Concise Approach: This one-liner creates a cleaned string, then compares it with its reversed version. While elegant, it's less efficient than the other approaches because string reversal requires O(n) extra space and time. Time and space complexity are both O(n).",
        code: `def isPalindromeConcise(s):
    cleaned = ''.join(c for c in s.lower() if c.isalnum())
    return cleaned == cleaned[::-1]`,
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
      "To find the longest substring containing the same letter after at most k replacements, we use a sliding window approach. We track character frequencies within the current window and determine if the window is valid by checking if the number of replacements needed (window size - count of most frequent character) is at most k. If not valid, we shrink the window from the left until it becomes valid again.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Sliding Window with Character Count: This approach maintains a sliding window and keeps track of the count of each character in the current window. The key insight is that we only need to replace characters that aren't the most frequent character in the window. If (window size - max character count) > k, then we need more than k replacements, so the window is invalid. Time complexity is O(n) and space complexity is O(1) since we have a fixed alphabet size.",
        code: `function characterReplacement(s: string, k: number): number {
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
      },
      {
        language: "Python",
        explanation:
          "Sliding Window with Character Count: This approach maintains a sliding window and keeps track of the count of each character in the current window. The key insight is that we only need to replace characters that aren't the most frequent character in the window. If (window size - max character count) > k, then we need more than k replacements, so the window is invalid. Time complexity is O(n) and space complexity is O(1) since we have a fixed alphabet size.",
        code: `def characterReplacement(s, k):
    char_count = {}
    left = 0
    max_length = 0
    max_char_count = 0
    
    for right in range(len(s)):
        char = s[right]
        char_count[char] = char_count.get(char, 0) + 1
        max_char_count = max(max_char_count, char_count[char])
        
        # If window size - max char count > k, shrink window
        while right - left + 1 - max_char_count > k:
            left_char = s[left]
            char_count[left_char] -= 1
            left += 1
        
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
      },
      {
        language: "typescript",
        explanation:
          "Character-by-Character Approach: This alternative solution explicitly tries each letter as the target character to create a repeating substring. For each target character, it counts replacements needed in the current window and shrinks when we exceed k replacements. This approach is more intuitive but less efficient for large alphabets, as it runs in O(26 * n) time for uppercase English letters. Space complexity is O(1).",
        code: `function characterReplacementVerbose(s: string, k: number): number {
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
      },
      {
        language: "Python",
        explanation:
          "Character-by-Character Approach: This alternative solution explicitly tries each letter as the target character to create a repeating substring. For each target character, it counts replacements needed in the current window and shrinks when we exceed k replacements. This approach is more intuitive but less efficient for large alphabets, as it runs in O(26 * n) time for uppercase English letters. Space complexity is O(1).",
        code: `def characterReplacementVerbose(s, k):
    max_length = 0
    
    # Try each character as the target character
    for target_char_code in range(65, 91): # A-Z
        target = chr(target_char_code)
        left = 0
        replacements = 0
        
        for right in range(len(s)):
            if s[right] != target:
                replacements += 1
            
            while replacements > k:
                if s[left] != target:
                    replacements -= 1
                left += 1
            
            max_length = max(max_length, right - left + 1)
    
    return max_length`,
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
      "This problem can be solved using two main approaches: (1) Dynamic Programming - build a 2D table where dp[i][j] represents if s[0...i-1] matches p[0...j-1], handling special cases for '*'. (2) Recursive with Memoization - recursively check if patterns match with caching to avoid repeated calculations.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Dynamic Programming approach builds a 2D table bottom-up to determine if the string matches the pattern, handling the special cases for '.' and '*' characters.",
        code: `function isMatch(s: string, p: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Dynamic Programming approach builds a 2D table bottom-up to determine if the string matches the pattern, handling the special cases for '.' and '*' characters.",
        code: `def isMatch(s, p):
    m = len(s)
    n = len(p)
    
    # dp[i][j] = true if s[0...i-1] matches p[0...j-1]
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    
    dp[0][0] = True # Empty string matches empty pattern
    
    # Handle patterns like a*, a*b*, a*b*c*
    for j in range(2, n + 1, 2):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 2]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            current_char = s[i - 1]
            pattern_char = p[j - 1]
            
            if pattern_char == '*':
                prev_pattern_char = p[j - 2]
                
                # Zero occurrences
                dp[i][j] = dp[i][j - 2]
                
                # One or more occurrences
                if prev_pattern_char == '.' or prev_pattern_char == current_char:
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
            elif pattern_char == '.' or pattern_char == current_char:
                dp[i][j] = dp[i - 1][j - 1]
    
    return dp[m][n]`,
      },
      {
        language: "typescript",
        explanation:
          "Recursive with Memoization approach solves the problem top-down by breaking it into smaller subproblems and using a cache to avoid redundant calculations.",
        code: `function isMatchRecursive(s: string, p: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Recursive with Memoization approach solves the problem top-down by breaking it into smaller subproblems and using a cache to avoid redundant calculations.",
        code: `def isMatchRecursive(s, p):
    memo = {}
    
    def dp(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        
        if j == len(p):
            return i == len(s)
        
        first_match = i < len(s) and (p[j] == s[i] or p[j] == '.')
        
        if j + 1 < len(p) and p[j + 1] == '*':
            result = dp(i, j + 2) or (first_match and dp(i + 1, j))
        else:
            result = first_match and dp(i + 1, j + 1)
        
        memo[(i, j)] = result
        return result
    
    return dp(0, 0)`,
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
      "There are two primary approaches to solve wildcard pattern matching: (1) Dynamic Programming - build a 2D table where dp[i][j] represents if s[0...i-1] matches p[0...j-1], with special cases for '?' and '*'. (2) Two Pointers with Backtracking - process the string and pattern with two pointers, using backtracking for '*' characters to handle matching different lengths of text.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Dynamic Programming approach uses a 2D table to track whether substrings match subpatterns, with special cases for '?' matching any single character and '*' matching any sequence of characters.",
        code: `function isMatchWildcard(s: string, p: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Dynamic Programming approach uses a 2D table to track whether substrings match subpatterns, with special cases for '?' matching any single character and '*' matching any sequence of characters.",
        code: `def isMatchWildcard(s, p):
    m = len(s)
    n = len(p)
    
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    
    dp[0][0] = True
    
    # Handle leading stars
    for j in range(1, n + 1):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 1]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i - 1][j] or dp[i][j - 1]
            elif p[j - 1] == '?' or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    
    return dp[m][n]`,
      },
      {
        language: "typescript",
        explanation:
          "Two Pointers with Backtracking approach processes the string and pattern linearly with constant space, using backtracking for '*' to match different lengths of text.",
        code: `function isMatchWildcardTwoPointers(s: string, p: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "Two Pointers with Backtracking approach processes the string and pattern linearly with constant space, using backtracking for '*' to match different lengths of text.",
        code: `def isMatchWildcardTwoPointers(s, p):
    s_index = 0
    p_index = 0
    star_index = -1
    match = 0
    
    while s_index < len(s):
        if p_index < len(p) and (p[p_index] == '?' or p[p_index] == s[s_index]):
            s_index += 1
            p_index += 1
        elif p_index < len(p) and p[p_index] == '*':
            star_index = p_index
            match = s_index
            p_index += 1
        elif star_index != -1:
            p_index = star_index + 1
            match += 1
            s_index = match
        else:
            return False
    
    # Skip remaining stars in pattern
    while p_index < len(p) and p[p_index] == '*':
        p_index += 1
    
    return p_index == len(p)`,
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
      "The approach for text justification involves a greedy algorithm with line-by-line processing: (1) Pack as many words as possible in each line without exceeding the max width. (2) For each line except the last, distribute spaces evenly between words, with extra spaces placed from left to right. (3) For the last line or lines with a single word, use left justification with trailing spaces.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "This solution uses a greedy approach to pack as many words as possible in each line, then distributes spaces evenly between words according to the justification rules.",
        code: `function fullJustify(words: string[], maxWidth: number): string[] {
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
      },
      {
        language: "Python",
        explanation:
          "This solution uses a greedy approach to pack as many words as possible in each line, then distributes spaces evenly between words according to the justification rules.",
        code: `def fullJustify(words, maxWidth):
    result = []
    i = 0
    
    while i < len(words):
        # Determine how many words fit in current line
        line_length = len(words[i])
        j = i + 1
        
        while j < len(words) and line_length + 1 + len(words[j]) <= maxWidth:
            line_length += 1 + len(words[j])
            j += 1
        
        words_in_line = j - i
        is_last_line = j == len(words)
        
        if words_in_line == 1 or is_last_line:
            # Left justify
            line = ' '.join(words[i:j]) + ' ' * (maxWidth - line_length)
            result.append(line)
        else:
            # Full justify
            total_spaces = maxWidth - sum(len(w) for w in words[i:j])
            gaps = words_in_line - 1
            spaces_per_gap = total_spaces // gaps
            extra_spaces = total_spaces % gaps
            
            line = ''
            for k in range(i, j):
                line += words[k]
                if k < j - 1:
                    line += ' ' * (spaces_per_gap + (k - i < extra_spaces))
            result.append(line)
        
        i = j
    
    return result`,
      },
      {
        language: "typescript",
        explanation:
          "This helper function specifically handles the task of distributing spaces evenly between words according to the justification rules.",
        code: `function distributeSpaces(words: string[], totalSpaces: number): string {
    if (words.length === 1) {
        return words[0] + ' '.repeat(totalSpaces);
    }
    
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
      },
      {
        language: "Python",
        explanation:
          "This helper function specifically handles the task of distributing spaces evenly between words according to the justification rules.",
        code: `def distributeSpaces(words, total_spaces):
    if len(words) == 1:
        return words[0] + ' ' * total_spaces
    
    gaps = len(words) - 1
    spaces_per_gap = total_spaces // gaps
    extra_spaces = total_spaces % gaps
    
    result = ''
    for i in range(len(words)):
        result += words[i]
        if i < len(words) - 1:
            result += ' ' * (spaces_per_gap + (i < extra_spaces))
    
    return result`,
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
      "This problem explores several variants of string comparison algorithms: (1) One Edit Distance - Determine if two strings differ by exactly one edit operation (insert, delete, replace) using two-pointer technique. (2) Longest Common Subsequence - Find the length of the longest subsequence common to two strings using dynamic programming. (3) Distinct Subsequences - Count how many distinct ways a target string can be formed by deleting characters from a source string using DP.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "One Edit Distance checks if two strings differ by exactly one operation (insert, delete, replace) using a two-pointer approach to efficiently identify the potential edit point.",
        code: `function isOneEditDistance(s: string, t: string): boolean {
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
      },
      {
        language: "Python",
        explanation:
          "One Edit Distance checks if two strings differ by exactly one operation (insert, delete, replace) using a two-pointer approach to efficiently identify the potential edit point.",
        code: `def isOneEditDistance(s, t):
    m = len(s)
    n = len(t)
    
    if abs(m - n) > 1:
        return False
    if s == t:
        return False
    
    i = 0
    j = 0
    
    while i < m and j < n and s[i] == t[j]:
        i += 1
        j += 1
    
    if i == m and j == n:
        return False # Strings are identical
    
    if m == n:
        # Replace operation
        i += 1
        j += 1
    elif m < n:
        # Insert operation
        j += 1
    else:
        # Delete operation
        i += 1
    
    while i < m and j < n and s[i] == t[j]:
        i += 1
        j += 1
    
    return i == m and j == n`,
      },
      {
        language: "typescript",
        explanation:
          "Longest Common Subsequence finds the length of the longest subsequence common to two strings using dynamic programming with a 2D table.",
        code: `function longestCommonSubsequence(text1: string, text2: string): number {
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
      },
      {
        language: "Python",
        explanation:
          "Longest Common Subsequence finds the length of the longest subsequence common to two strings using dynamic programming with a 2D table.",
        code: `def longestCommonSubsequence(text1, text2):
    m = len(text1)
    n = len(text2)
    
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]`,
      },
      {
        language: "typescript",
        explanation:
          "Distinct Subsequences counts the number of ways a target string can be formed by deleting characters from a source string using dynamic programming.",
        code: `function numDistinct(s: string, t: string): number {
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
      },
      {
        language: "Python",
        explanation:
          "Distinct Subsequences counts the number of ways a target string can be formed by deleting characters from a source string using dynamic programming.",
        code: `def numDistinct(s, t):
    m = len(s)
    n = len(t)
    
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Empty string t can be formed in one way from any string s
    for i in range(m + 1):
        dp[i][0] = 1
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j] # Don't use s[i-1]
            
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1] # Use s[i-1]
    
    return dp[m][n]`,
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
