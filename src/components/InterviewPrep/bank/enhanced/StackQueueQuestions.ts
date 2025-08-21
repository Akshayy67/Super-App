import { EnhancedQuestion } from "../../InterviewSubjects";

export const stackQueueQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-07",
    question: "Valid Parentheses - Check if string has valid bracket pairs",
    category: "stacks",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use stack to track opening brackets. For each character: if opening bracket, push to stack; if closing bracket, check if stack is empty or top doesn't match - return false; pop from stack. Return true if stack is empty at end. Time complexity: O(n), Space complexity: O(n).",
    tips: [
      "Explain the stack's role in tracking opening brackets",
      "Discuss different bracket types and matching",
      "Handle edge cases like empty string or unmatched brackets"
    ],
    tags: ["stacks", "strings", "validation"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function isValid(s) {
    const stack = [];
    const mapping = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (const char of s) {
        if (char in mapping) {
            // Closing bracket
            if (stack.length === 0 || stack.pop() !== mapping[char]) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}

// Alternative with explicit bracket checking
function isValidExplicit(s) {
    const stack = [];
    
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            if (stack.length === 0) return false;
            
            const top = stack.pop();
            if ((char === ')' && top !== '(') ||
                (char === '}' && top !== '{') ||
                (char === ']' && top !== '[')) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`,
        explanation: "Stack naturally handles the Last-In-First-Out nature of bracket matching. Mapping object provides clean bracket pair lookup.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Stack"
      },
      python: {
        solution: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            # Closing bracket
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            # Opening bracket
            stack.append(char)
    
    return len(stack) == 0

def is_valid_explicit(s):
    stack = []
    
    for char in s:
        if char in '({[':
            stack.append(char)
        elif char in ')}]':
            if not stack:
                return False
            
            top = stack.pop()
            if (char == ')' and top != '(' or
                char == '}' and top != '{' or
                char == ']' and top != '['):
                return False
    
    return len(stack) == 0`,
        explanation: "Python implementation using dictionary for bracket mapping. Clean syntax with 'in' operator for set membership.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Stack"
      },
      java: {
        solution: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    Map<Character, Character> mapping = new HashMap<>();
    mapping.put(')', '(');
    mapping.put('}', '{');
    mapping.put(']', '[');
    
    for (char c : s.toCharArray()) {
        if (mapping.containsKey(c)) {
            // Closing bracket
            if (stack.isEmpty() || stack.pop() != mapping.get(c)) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(c);
        }
    }
    
    return stack.isEmpty();
}`,
        explanation: "Java implementation using Stack and HashMap. Enhanced for loop provides clean character iteration.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Stack"
      }
    },
    algorithmSteps: [
      "Initialize empty stack and bracket mapping",
      "Iterate through each character in string",
      "If opening bracket, push to stack",
      "If closing bracket, check if stack is empty",
      "Pop from stack and verify it matches current closing bracket",
      "Return false if mismatch or empty stack when expecting opening bracket",
      "Return true if stack is empty at end"
    ],
    commonMistakes: [
      "Not checking if stack is empty before popping",
      "Incorrect bracket pair matching",
      "Not returning false for unmatched opening brackets",
      "Forgetting to check stack emptiness at the end"
    ],
    optimizations: [
      "Early termination on first mismatch",
      "Using mapping for clean bracket pair lookup",
      "Single pass through the string"
    ],
    relatedQuestions: ["Generate Parentheses", "Remove Invalid Parentheses", "Longest Valid Parentheses"]
  },

  {
    id: "dsa-08",
    question: "Implement Min Stack with O(1) operations",
    category: "stacks",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use two stacks: main stack for values and auxiliary stack for minimums. When pushing, always push to main stack and push to min stack if value is less than or equal to current minimum. When popping, pop from both stacks if popped value equals current minimum. getMin() returns top of min stack.",
    tips: [
      "Explain why we need auxiliary stack",
      "Discuss the <= condition for min stack",
      "Consider space optimization techniques"
    ],
    tags: ["stacks", "design", "data-structures"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `class MinStack {
    constructor() {
        this.stack = [];
        this.minStack = [];
    }
    
    push(val) {
        this.stack.push(val);
        
        // Push to min stack if it's empty or val is <= current min
        if (this.minStack.length === 0 || val <= this.getMin()) {
            this.minStack.push(val);
        }
    }
    
    pop() {
        if (this.stack.length === 0) return;
        
        const popped = this.stack.pop();
        
        // Pop from min stack if popped value was the minimum
        if (popped === this.getMin()) {
            this.minStack.pop();
        }
        
        return popped;
    }
    
    top() {
        return this.stack[this.stack.length - 1];
    }
    
    getMin() {
        return this.minStack[this.minStack.length - 1];
    }
}

// Space-optimized version using single stack
class MinStackOptimized {
    constructor() {
        this.stack = [];
        this.min = null;
    }
    
    push(val) {
        if (this.stack.length === 0) {
            this.stack.push(val);
            this.min = val;
        } else if (val >= this.min) {
            this.stack.push(val);
        } else {
            // Push encoded value when new minimum
            this.stack.push(2 * val - this.min);
            this.min = val;
        }
    }
    
    pop() {
        if (this.stack.length === 0) return;
        
        const top = this.stack.pop();
        
        if (top < this.min) {
            // Decode the previous minimum
            const actualValue = this.min;
            this.min = 2 * this.min - top;
            return actualValue;
        }
        
        return top;
    }
    
    top() {
        const stackTop = this.stack[this.stack.length - 1];
        return stackTop < this.min ? this.min : stackTop;
    }
    
    getMin() {
        return this.min;
    }
}`,
        explanation: "Two-stack approach is straightforward and intuitive. Optimized version uses encoding to store minimum information in single stack.",
        timeComplexity: "O(1) all operations",
        spaceComplexity: "O(n) two stacks, O(n) optimized",
        approach: "Auxiliary Stack / Encoding"
      },
      python: {
        solution: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        self.stack.append(val)
        
        if not self.min_stack or val <= self.get_min():
            self.min_stack.append(val)
    
    def pop(self):
        if not self.stack:
            return
        
        popped = self.stack.pop()
        
        if popped == self.get_min():
            self.min_stack.pop()
        
        return popped
    
    def top(self):
        return self.stack[-1] if self.stack else None
    
    def get_min(self):
        return self.min_stack[-1] if self.min_stack else None`,
        explanation: "Python implementation with list operations. Clean and readable with proper edge case handling.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        approach: "Auxiliary Stack"
      },
      java: {
        solution: `class MinStack {
    private Stack<Integer> stack;
    private Stack<Integer> minStack;
    
    public MinStack() {
        stack = new Stack<>();
        minStack = new Stack<>();
    }
    
    public void push(int val) {
        stack.push(val);
        
        if (minStack.isEmpty() || val <= getMin()) {
            minStack.push(val);
        }
    }
    
    public void pop() {
        if (stack.isEmpty()) return;
        
        int popped = stack.pop();
        
        if (popped == getMin()) {
            minStack.pop();
        }
    }
    
    public int top() {
        return stack.peek();
    }
    
    public int getMin() {
        return minStack.peek();
    }
}`,
        explanation: "Java implementation using Stack class. Proper encapsulation with private fields and public methods.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        approach: "Auxiliary Stack"
      }
    },
    algorithmSteps: [
      "Initialize main stack and auxiliary min stack",
      "Push: Add to main stack, add to min stack if <= current minimum",
      "Pop: Remove from main stack, remove from min stack if popped == minimum",
      "Top: Return top of main stack",
      "GetMin: Return top of min stack",
      "Maintain invariant: min stack top is always current minimum"
    ],
    commonMistakes: [
      "Using < instead of <= when comparing with minimum",
      "Not popping from min stack when minimum is removed",
      "Not handling empty stack cases",
      "Trying to optimize space incorrectly"
    ],
    optimizations: [
      "Two-stack approach is simple and efficient",
      "Space can be optimized using encoding techniques",
      "All operations maintain O(1) time complexity"
    ],
    relatedQuestions: ["Max Stack", "Design Stack With Increment Operation", "Implement Queue using Stacks"]
  }
];