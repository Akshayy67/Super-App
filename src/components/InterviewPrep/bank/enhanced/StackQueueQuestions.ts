import { Question } from "../../InterviewSubjects";

// Enhanced Stack and Queue DSA Questions with comprehensive implementations
export const enhancedStackQueueQuestions: Question[] = [
  {
    id: "enhanced-stack-1",
    question: "Valid Parentheses - Given a string s containing just parentheses characters, determine if the input string is valid.",
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
    type: "coding",
    sampleAnswer: `
// Approach 1: Two Stacks (Optimal)
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
}

// Approach 2: Single Stack with Pairs
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
}

// Approach 3: Difference Encoding (Space optimized)
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
    type: "coding",
    sampleAnswer: `
// Stack-based Solution (Optimal)
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
}

// Using function map for operations
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
}

// Recursive approach (less practical)
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
    type: "coding",
    sampleAnswer: `
// Monotonic Stack (Optimal)
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
}

// Brute Force (for comparison)
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
}

// Optimized with early termination
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