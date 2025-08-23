import { Question } from "../../InterviewSubjects";

// Enhanced Stack and Queue DSA Questions with comprehensive implementations
export const enhancedStackQueueQuestions: Question[] = [
  {
    id: "enhanced-stack-1",
    question: "Valid Parentheses - Given a string s containing just parentheses characters, determine if the input string is valid.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach: "Multiple approaches available: 1) Stack-based Solution (O(n) time, O(n) space): Use stack to match opening and closing brackets. 2) Optimized with Early Termination (O(n) time, O(n) space): Check odd length early and use optimized bracket matching. 3) Counter-based Approach: Use counters for each bracket type (less flexible but simpler). Stack approach is most intuitive and handles all bracket types, while early termination provides performance optimization for invalid cases.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Stack-based Solution (Optimal)
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
        explanation: "Classic stack-based solution using map for bracket pairs. Most intuitive and handles all bracket types."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Optimized with Early Termination
// Time: O(n), Space: O(n)
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
        explanation: "Optimized version with early odd-length check and set for open brackets. Better performance for invalid cases."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Counter-based Approach (Simpler but Less Flexible)
// Time: O(n), Space: O(1)
function isValidCounters(s: string): boolean {
    let round = 0, curly = 0, square = 0;
    
    for (const char of s) {
        switch (char) {
            case '(': round++; break;
            case ')': round--; break;
            case '{': curly++; break;
            case '}': curly--; break;
            case '[': square++; break;
            case ']': square--; break;
        }
        
        if (round < 0 || curly < 0 || square < 0) return false;
    }
    
    return round === 0 && curly === 0 && square === 0;
}`,
        explanation: "Counter-based approach using separate counters for each bracket type. Simpler but doesn't handle mixed bracket sequences correctly."
      },
      {
        language: "Python",
        code: `# Approach 1: Stack-based Solution (Optimal)
# Time: O(n), Space: O(n)
def is_valid(s):
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
        explanation: "Classic stack-based solution using dictionary for bracket pairs. Most intuitive and handles all bracket types."
      },
      {
        language: "Python",
        code: `# Approach 2: Optimized with Early Termination
# Time: O(n), Space: O(n)
def is_valid_optimized(s):
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
        explanation: "Optimized version with early odd-length check and set for open brackets. Better performance for invalid cases."
      },
      {
        language: "Python",
        code: `# Approach 3: Counter-based Approach (Simpler but Less Flexible)
# Time: O(n), Space: O(1)
def is_valid_counters(s):
    round_count = curly_count = square_count = 0
    
    for char in s:
        if char == '(':
            round_count += 1
        elif char == ')':
            round_count -= 1
        elif char == '{':
            curly_count += 1
        elif char == '}':
            curly_count -= 1
        elif char == '[':
            square_count += 1
        elif char == ']':
            square_count -= 1
        
        if round_count < 0 or curly_count < 0 or square_count < 0:
            return False
    
    return round_count == 0 and curly_count == 0 and square_count == 0`,
        explanation: "Counter-based approach using separate counters for each bracket type. Simpler but doesn't handle mixed bracket sequences correctly."
      }
    ],
    tips: [
      "Stack is perfect for matching pairs",
      "Map closing brackets to their opening counterparts",
      "Check odd length early for quick rejection",
      "Empty stack at end confirms all brackets matched"
    ],
    tags: ["string", "stack"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-stack-2",
    question: "Min Stack - Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Two Stacks (O(1) time for all operations, O(n) space): Use main stack and separate min stack to track minimum values. 2) Single Stack with Pairs (O(1) time for all operations, O(n) space): Store each element with current minimum in single stack. 3) Difference Encoding (O(1) time for all operations, O(n) space): Use difference encoding to save space but with more complex implementation. Two stacks approach is most intuitive, while difference encoding provides space optimization for large datasets.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Two Stacks (Optimal)
// All operations: O(1), Space: O(n)
class MinStack {
    private stack: number[] = [];
    private minStack: number[] = [];
    
    push(val: number): void {
        this.stack.push(val);
        
        if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
            this.minStack.push(val);
        }
    }
    
    pop(): void {
        const popped = this.stack.pop();
        
        if (popped === this.minStack[this.minStack.length - 1]) {
            this.minStack.pop();
        }
    }
    
    top(): number {
        return this.stack[this.stack.length - 1];
    }
    
    getMin(): number {
        return this.minStack[this.minStack.length - 1];
    }
}`,
        explanation: "Two stacks approach: main stack for values, min stack for minimum tracking. Most intuitive and efficient."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Single Stack with Pairs
// All operations: O(1), Space: O(n)
class MinStackPairs {
    private stack: [number, number][] = []; // [value, currentMin]
    
    push(val: number): void {
        const currentMin = this.stack.length === 0 ? val : 
                          Math.min(val, this.stack[this.stack.length - 1][1]);
        this.stack.push([val, currentMin]);
    }
    
    pop(): void {
        this.stack.pop();
    }
    
    top(): number {
        return this.stack[this.stack.length - 1][0];
    }
    
    getMin(): number {
        return this.stack[this.stack.length - 1][1];
    }
}`,
        explanation: "Single stack stores each element with its current minimum. Simpler structure but uses more space per element."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Difference Encoding (Space Optimized)
// All operations: O(1), Space: O(n)
class MinStackDiff {
    private stack: number[] = [];
    private min: number = 0;
    
    push(val: number): void {
        if (this.stack.length === 0) {
            this.stack.push(0);
            this.min = val;
        } else {
            this.stack.push(val - this.min);
            if (val < this.min) {
                this.min = val;
            }
        }
    }
    
    pop(): void {
        if (this.stack.length === 0) return;
        
        const diff = this.stack.pop()!;
        
        if (diff < 0) {
            this.min = this.min - diff;
        }
    }
    
    top(): number {
        const diff = this.stack[this.stack.length - 1];
        return diff < 0 ? this.min : this.min + diff;
    }
    
    getMin(): number {
        return this.min;
    }
}`,
        explanation: "Difference encoding stores differences from current minimum. Most space-efficient but more complex implementation."
      },
      {
        language: "Python",
        code: `# Approach 1: Two Stacks (Optimal)
# All operations: O(1), Space: O(n)
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        self.stack.append(val)
        
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    
    def pop(self):
        popped = self.stack.pop()
        
        if popped == self.min_stack[-1]:
            self.min_stack.pop()
    
    def top(self):
        return self.stack[-1]
    
    def get_min(self):
        return self.min_stack[-1]`,
        explanation: "Two stacks approach: main stack for values, min stack for minimum tracking. Most intuitive and efficient."
      },
      {
        language: "Python",
        code: `# Approach 2: Single Stack with Pairs
# All operations: O(1), Space: O(n)
class MinStackPairs:
    def __init__(self):
        self.stack = []  # Store tuples of (value, current_min)
    
    def push(self, val):
        if not self.stack:
            current_min = val
        else:
            current_min = min(val, self.stack[-1][1])
        self.stack.append((val, current_min))
    
    def pop(self):
        self.stack.pop()
    
    def top(self):
        return self.stack[-1][0]
    
    def get_min(self):
        return self.stack[-1][1]`,
        explanation: "Single stack stores each element with its current minimum. Simpler structure but uses more space per element."
      },
      {
        language: "Python",
        code: `# Approach 3: Difference Encoding (Space Optimized)
# All operations: O(1), Space: O(n)
class MinStackDiff:
    def __init__(self):
        self.stack = []
        self.min = 0
    
    def push(self, val):
        if not self.stack:
            self.stack.append(0)
            self.min = val
        else:
            self.stack.append(val - self.min)
            if val < self.min:
                self.min = val
    
    def pop(self):
        if not self.stack:
            return
        
        diff = self.stack.pop()
        
        if diff < 0:
            self.min = self.min - diff
    
    def top(self):
        diff = self.stack[-1]
        return self.min if diff < 0 else self.min + diff
    
    def get_min(self):
        return self.min`,
        explanation: "Difference encoding stores differences from current minimum. Most space-efficient but more complex implementation."
      }
    ],
    tips: [
      "Two stacks approach: main stack + min stack",
      "Only push to min stack when new minimum found",
      "Pair approach stores current minimum with each element",
      "Difference encoding saves space but more complex"
    ],
    tags: ["stack", "design"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-stack-3",
    question: "Evaluate Reverse Polish Notation - Evaluate the value of an arithmetic expression in Reverse Polish Notation.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Stack-based Solution (O(n) time, O(n) space): Classic stack approach using switch statements for operators. 2) Function Map Approach (O(n) time, O(n) space): Use map to store operator functions for cleaner code. 3) Recursive Approach (O(n) time, O(n) space): Recursive evaluation from right to left. Stack-based approach is most intuitive and efficient, while function map provides cleaner, more maintainable code.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Stack-based Solution (Optimal)
// Time: O(n), Space: O(n)
function evalRPN(tokens: string[]): number {
    const stack: number[] = [];
    const operators = new Set(['+', '-', '*', '/']);
    
    for (const token of tokens) {
        if (operators.has(token)) {
            const b = stack.pop()!;
            const a = stack.pop()!;
            
            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    stack.push(Math.trunc(a / b)); // Truncate towards zero
                    break;
            }
        } else {
            stack.push(parseInt(token));
        }
    }
    
    return stack[0];
}`,
        explanation: "Classic stack-based solution using switch statements. Most intuitive and handles all operators efficiently."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Using Function Map for Operations
// Time: O(n), Space: O(n)
function evalRPNMap(tokens: string[]): number {
    const stack: number[] = [];
    
    const operations = new Map<string, (a: number, b: number) => number>([
        ['+', (a, b) => a + b],
        ['-', (a, b) => a - b],
        ['*', (a, b) => a * b],
        ['/', (a, b) => Math.trunc(a / b)]
    ]);
    
    for (const token of tokens) {
        if (operations.has(token)) {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(operations.get(token)!(a, b));
        } else {
            stack.push(parseInt(token));
        }
    }
    
    return stack[0];
}`,
        explanation: "Function map approach provides cleaner, more maintainable code. Easy to extend with new operators."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Recursive Approach (Less Practical)
// Time: O(n), Space: O(n)
function evalRPNRecursive(tokens: string[]): number {
    let index = tokens.length - 1;
    
    function evaluate(): number {
        const token = tokens[index--];
        
        if (token === '+') {
            return evaluate() + evaluate();
        } else if (token === '-') {
            const b = evaluate();
            const a = evaluate();
            return a - b;
        } else if (token === '*') {
            return evaluate() * evaluate();
        } else if (token === '/') {
            const b = evaluate();
            const a = evaluate();
            return Math.trunc(a / b);
        } else {
            return parseInt(token);
        }
    }
    
    return evaluate();
}`,
        explanation: "Recursive approach evaluates from right to left. Less practical due to call stack overhead but demonstrates alternative thinking."
      },
      {
        language: "Python",
        code: `# Approach 1: Stack-based Solution (Optimal)
# Time: O(n), Space: O(n)
def eval_rpn(tokens):
    stack = []
    operators = {'+', '-', '*', '/'}
    
    for token in tokens:
        if token in operators:
            b = stack.pop()
            a = stack.pop()
            
            if token == '+':
                stack.append(a + b)
            elif token == '-':
                stack.append(a - b)
            elif token == '*':
                stack.append(a * b)
            elif token == '/':
                # Truncate towards zero (same as Math.trunc in JS)
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    
    return stack[0]`,
        explanation: "Classic stack-based solution using set for operators. Most intuitive and handles all operators efficiently."
      },
      {
        language: "Python",
        code: `# Approach 2: Using Function Dictionary for Operations
# Time: O(n), Space: O(n)
def eval_rpn_map(tokens):
    stack = []
    
    operations = {
        '+': lambda a, b: a + b,
        '-': lambda a, b: a - b,
        '*': lambda a, b: a * b,
        '/': lambda a, b: int(a / b)  # Truncate towards zero
    }
    
    for token in tokens:
        if token in operations:
            b = stack.pop()
            a = stack.pop()
            stack.append(operations[token](a, b))
        else:
            stack.append(int(token))
    
    return stack[0]`,
        explanation: "Function dictionary approach provides cleaner, more maintainable code. Easy to extend with new operators."
      },
      {
        language: "Python",
        code: `# Approach 3: Recursive Approach (Less Practical)
# Time: O(n), Space: O(n)
def eval_rpn_recursive(tokens):
    index = [len(tokens) - 1]  # Use list to maintain reference
    
    def evaluate():
        token = tokens[index[0]]
        index[0] -= 1
        
        if token == '+':
            return evaluate() + evaluate()
        elif token == '-':
            b = evaluate()
            a = evaluate()
            return a - b
        elif token == '*':
            return evaluate() * evaluate()
        elif token == '/':
            b = evaluate()
            a = evaluate()
            return int(a / b)  # Truncate towards zero
        else:
            return int(token)
    
    return evaluate()`,
        explanation: "Recursive approach evaluates from right to left. Less practical due to call stack overhead but demonstrates alternative thinking."
      }
    ],
    tips: [
      "Stack naturally handles postfix notation evaluation",
      "Pop two operands for binary operations (order matters for - and /)",
      "Handle division truncation towards zero correctly",
      "RPN eliminates need for parentheses and operator precedence"
    ],
    tags: ["stack", "math", "array"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-stack-4",
    question: "Daily Temperatures - Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait for a warmer temperature.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Monotonic Stack (O(n) time, O(n) space): Use monotonic decreasing stack to track temperature indices. 2) Brute Force (O(n²) time, O(1) space): Simple nested loops for comparison. 3) Optimized with Right-to-Left Processing: Process array from right to left for different stack logic. Monotonic stack is optimal, while brute force provides better understanding of the problem. Right-to-left approach offers alternative perspective on the same algorithm.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Monotonic Stack (Optimal)
// Time: O(n), Space: O(n)
function dailyTemperatures(temperatures: number[]): number[] {
    const result = new Array(temperatures.length).fill(0);
    const stack: number[] = []; // Store indices
    
    for (let i = 0; i < temperatures.length; i++) {
        // While current temperature is warmer than stack top
        while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
            const prevIndex = stack.pop()!;
            result[prevIndex] = i - prevIndex;
        }
        
        stack.push(i);
    }
    
    return result;
}`,
        explanation: "Monotonic decreasing stack maintains indices of decreasing temperatures. Most efficient approach with O(n) time complexity."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Brute Force (for comparison)
// Time: O(n²), Space: O(1)
function dailyTemperaturesBrute(temperatures: number[]): number[] {
    const result = new Array(temperatures.length).fill(0);
    
    for (let i = 0; i < temperatures.length; i++) {
        for (let j = i + 1; j < temperatures.length; j++) {
            if (temperatures[j] > temperatures[i]) {
                result[i] = j - i;
                break;
            }
        }
    }
    
    return result;
}`,
        explanation: "Brute force approach with nested loops. Simple to understand but inefficient for large arrays."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Optimized with Right-to-Left Processing
// Time: O(n), Space: O(n)
function dailyTemperaturesOptimized(temperatures: number[]): number[] {
    const result = new Array(temperatures.length).fill(0);
    const stack: number[] = [];
    
    for (let i = temperatures.length - 1; i >= 0; i--) {
        // Remove cooler temperatures from stack
        while (stack.length > 0 && temperatures[stack[stack.length - 1]] <= temperatures[i]) {
            stack.pop();
        }
        
        // If stack not empty, top element is next warmer day
        if (stack.length > 0) {
            result[i] = stack[stack.length - 1] - i;
        }
        
        stack.push(i);
    }
    
    return result;
}`,
        explanation: "Right-to-left processing with different stack logic. Alternative perspective on the same monotonic stack algorithm."
      },
      {
        language: "Python",
        code: `# Approach 1: Monotonic Stack (Optimal)
# Time: O(n), Space: O(n)
def daily_temperatures(temperatures):
    result = [0] * len(temperatures)
    stack = []  # Store indices
    
    for i in range(len(temperatures)):
        # While current temperature is warmer than stack top
        while stack and temperatures[i] > temperatures[stack[-1]]:
            prev_index = stack.pop()
            result[prev_index] = i - prev_index
        
        stack.append(i)
    
    return result`,
        explanation: "Monotonic decreasing stack maintains indices of decreasing temperatures. Most efficient approach with O(n) time complexity."
      },
      {
        language: "Python",
        code: `# Approach 2: Brute Force (for comparison)
# Time: O(n²), Space: O(1)
def daily_temperatures_brute(temperatures):
    result = [0] * len(temperatures)
    
    for i in range(len(temperatures)):
        for j in range(i + 1, len(temperatures)):
            if temperatures[j] > temperatures[i]:
                result[i] = j - i
                break
    
    return result`,
        explanation: "Brute force approach with nested loops. Simple to understand but inefficient for large arrays."
      },
      {
        language: "Python",
        code: `# Approach 3: Optimized with Right-to-Left Processing
# Time: O(n), Space: O(n)
def daily_temperatures_optimized(temperatures):
    result = [0] * len(temperatures)
    stack = []
    
    for i in range(len(temperatures) - 1, -1, -1):
        # Remove cooler temperatures from stack
        while stack and temperatures[stack[-1]] <= temperatures[i]:
            stack.pop()
        
        # If stack not empty, top element is next warmer day
        if stack:
            result[i] = stack[-1] - i
        
        stack.append(i)
    
    return result`,
        explanation: "Right-to-left processing with different stack logic. Alternative perspective on the same monotonic stack algorithm."
      }
    ],
    tips: [
      "Monotonic stack maintains decreasing temperature indices",
      "When warmer temperature found, resolve all cooler days in stack",
      "Stack stores indices, not temperatures, to calculate distances",
      "Process left to right or right to left with different stack logic"
    ],
    tags: ["array", "stack", "monotonic-stack"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];