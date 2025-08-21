import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedStackQueueQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-16",
    question: "Implement a stack using queues",
    category: "stacks-queues",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Two approaches: 1) Make push expensive: use two queues, for push operation move all elements from q1 to q2, add new element to q1, move all back. 2) Make pop expensive: use one queue, for pop rotate all elements except last one to back of queue. First approach is more intuitive.",
    tips: [
      "Compare both approaches",
      "Discuss time complexities of operations",
      "Consider using deque for optimization"
    ],
    tags: ["stacks", "queues", "implementation"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `class MyStack {
    constructor() {
        this.queue1 = [];
        this.queue2 = [];
    }
    
    // Approach 1: Make push expensive
    push(x) {
        // Move all elements from q1 to q2
        while (this.queue1.length > 0) {
            this.queue2.push(this.queue1.shift());
        }
        
        // Add new element to q1
        this.queue1.push(x);
        
        // Move all elements back to q1
        while (this.queue2.length > 0) {
            this.queue1.push(this.queue2.shift());
        }
    }
    
    pop() {
        if (this.queue1.length === 0) return null;
        return this.queue1.shift();
    }
    
    top() {
        if (this.queue1.length === 0) return null;
        return this.queue1[0];
    }
    
    empty() {
        return this.queue1.length === 0;
    }
}

// Approach 2: Make pop expensive (using single queue)
class MyStackSingleQueue {
    constructor() {
        this.queue = [];
    }
    
    push(x) {
        this.queue.push(x);
    }
    
    pop() {
        if (this.queue.length === 0) return null;
        
        // Rotate all elements except last one
        for (let i = 0; i < this.queue.length - 1; i++) {
            this.queue.push(this.queue.shift());
        }
        
        return this.queue.shift();
    }
    
    top() {
        if (this.queue.length === 0) return null;
        
        const result = this.pop();
        this.push(result);
        return result;
    }
    
    empty() {
        return this.queue.length === 0;
    }
}`,
        explanation: "Two approaches: expensive push maintains LIFO order after each push, expensive pop rotates queue to access last element. Both achieve stack behavior using queue operations.",
        timeComplexity: "O(n) for expensive operation, O(1) for others",
        spaceComplexity: "O(n)",
        approach: "Queue Manipulation"
      },
      python: {
        solution: `from collections import deque

class MyStack:
    def __init__(self):
        self.queue1 = deque()
        self.queue2 = deque()
    
    def push(self, x):
        # Move all elements from q1 to q2
        while self.queue1:
            self.queue2.append(self.queue1.popleft())
        
        # Add new element to q1
        self.queue1.append(x)
        
        # Move all elements back to q1
        while self.queue2:
            self.queue1.append(self.queue2.popleft())
    
    def pop(self):
        if not self.queue1:
            return None
        return self.queue1.popleft()
    
    def top(self):
        if not self.queue1:
            return None
        return self.queue1[0]
    
    def empty(self):
        return len(self.queue1) == 0

# Single queue approach
class MyStackSingleQueue:
    def __init__(self):
        self.queue = deque()
    
    def push(self, x):
        self.queue.append(x)
    
    def pop(self):
        if not self.queue:
            return None
        
        # Rotate all elements except last one
        for _ in range(len(self.queue) - 1):
            self.queue.append(self.queue.popleft())
        
        return self.queue.popleft()
    
    def top(self):
        if not self.queue:
            return None
        
        result = self.pop()
        self.push(result)
        return result
    
    def empty(self):
        return len(self.queue) == 0`,
        explanation: "Python implementation using deque for efficient queue operations. Shows both two-queue and single-queue approaches.",
        timeComplexity: "O(n) for expensive operation",
        spaceComplexity: "O(n)",
        approach: "Queue Manipulation"
      },
      java: {
        solution: `class MyStack {
    private Queue<Integer> queue1;
    private Queue<Integer> queue2;
    
    public MyStack() {
        queue1 = new LinkedList<>();
        queue2 = new LinkedList<>();
    }
    
    public void push(int x) {
        // Move all elements from q1 to q2
        while (!queue1.isEmpty()) {
            queue2.offer(queue1.poll());
        }
        
        // Add new element to q1
        queue1.offer(x);
        
        // Move all elements back to q1
        while (!queue2.isEmpty()) {
            queue1.offer(queue2.poll());
        }
    }
    
    public int pop() {
        if (queue1.isEmpty()) return -1;
        return queue1.poll();
    }
    
    public int top() {
        if (queue1.isEmpty()) return -1;
        return queue1.peek();
    }
    
    public boolean empty() {
        return queue1.isEmpty();
    }
}`,
        explanation: "Java implementation using LinkedList as Queue. The expensive push approach ensures the most recent element is always at front of queue1.",
        timeComplexity: "O(n) for push, O(1) for others",
        spaceComplexity: "O(n)",
        approach: "Queue Manipulation"
      }
    },
    algorithmSteps: [
      "Choose between expensive push or expensive pop approach",
      "For expensive push: move all elements to auxiliary queue",
      "Add new element to main queue",
      "Move all elements back to maintain LIFO order",
      "For expensive pop: rotate queue to bring last element to front",
      "Pop the front element",
      "Implement top() by popping and pushing back"
    ],
    commonMistakes: [
      "Not understanding LIFO vs FIFO behavior",
      "Incorrect queue rotation in single-queue approach",
      "Not handling empty stack cases",
      "Confusing which operations should be expensive"
    ],
    optimizations: [
      "Single queue approach saves space",
      "Deque can provide better performance than array-based queue",
      "Consider hybrid approach based on usage patterns"
    ],
    relatedQuestions: ["Implement Queue using Stacks", "Design Circular Queue", "Min Stack"]
  },

  {
    id: "dsa-17",
    question: "Valid parentheses checker",
    category: "stacks-queues",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use a stack to track opening brackets. For each character: if opening bracket, push to stack; if closing bracket, check if stack is empty or top doesn't match - return false; otherwise pop. Return true if stack is empty at end. Time complexity: O(n), Space complexity: O(n).",
    tips: [
      "Handle different types of brackets",
      "Consider edge cases like empty string",
      "Explain why stack is perfect for this problem"
    ],
    tags: ["stacks", "strings", "validation"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            // Opening bracket - push to stack
            stack.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            // Closing bracket - check if matches
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}

// Alternative implementation using Map
function isValidMap(s) {
    const stack = [];
    const map = new Map([
        [')', '('],
        ['}', '{'],
        [']', '[']
    ]);
    
    for (const char of s) {
        if (map.has(char)) {
            // Closing bracket
            if (stack.length === 0 || stack.pop() !== map.get(char)) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
        explanation: "Stack naturally handles nested structure of parentheses. We push opening brackets and match them with closing brackets using LIFO order.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Stack"
      },
      python: {
        solution: `def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in pairs:
            # Closing bracket
            if not stack or stack.pop() != pairs[char]:
                return False
        else:
            # Opening bracket
            stack.append(char)
    
    return len(stack) == 0

# One-liner using try-except
def is_valid_oneliner(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        try:
            if pairs[char] != stack.pop():
                return False
        except (KeyError, IndexError):
            stack.append(char)
    
    return not stack`,
        explanation: "Python implementation with clean dictionary lookup. The one-liner version uses exception handling for control flow.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Stack"
      },
      java: {
        solution: `public boolean isValid(String s) {
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
}

// Alternative using switch statement
public boolean isValidSwitch(String s) {
    Stack<Character> stack = new Stack<>();
    
    for (char c : s.toCharArray()) {
        switch (c) {
            case '(':
            case '{':
            case '[':
                stack.push(c);
                break;
            case ')':
                if (stack.isEmpty() || stack.pop() != '(') return false;
                break;
            case '}':
                if (stack.isEmpty() || stack.pop() != '{') return false;
                break;
            case ']':
                if (stack.isEmpty() || stack.pop() != '[') return false;
                break;
        }
    }
    
    return stack.isEmpty();
}`,
        explanation: "Java implementation using Stack class and HashMap for bracket pairs. Switch statement version is more explicit about bracket types.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        approach: "Stack"
      }
    },
    algorithmSteps: [
      "Initialize empty stack",
      "Iterate through each character in string",
      "If opening bracket, push to stack",
      "If closing bracket, check if stack is empty",
      "If stack empty, return false (unmatched closing)",
      "Pop from stack and check if it matches current closing bracket",
      "If no match, return false",
      "After processing all characters, return true if stack is empty"
    ],
    commonMistakes: [
      "Not checking if stack is empty before popping",
      "Not handling different bracket types correctly",
      "Forgetting to check if stack is empty at the end",
      "Not understanding LIFO matching requirement"
    ],
    optimizations: [
      "Early termination on first invalid bracket",
      "Using hash map for O(1) bracket pair lookup",
      "Single pass through string"
    ],
    relatedQuestions: ["Generate Parentheses", "Remove Invalid Parentheses", "Longest Valid Parentheses"]
  },

  {
    id: "dsa-18",
    question: "Design a min stack with O(1) getMin operation",
    category: "stacks-queues",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Two approaches: 1) Use two stacks - one for data, one for minimums. Push to min stack only if new element ≤ current min. 2) Use single stack storing pairs (value, current_min). Both maintain O(1) for all operations including getMin.",
    tips: [
      "Compare space efficiency of both approaches",
      "Handle duplicate minimum values",
      "Discuss when to push/pop from min stack"
    ],
    tags: ["stacks", "design", "optimization"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Approach 1: Two stacks
class MinStack {
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
        
        // Pop from min stack if popped element was the minimum
        if (popped === this.getMin()) {
            this.minStack.pop();
        }
        
        return popped;
    }
    
    top() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }
    
    getMin() {
        return this.minStack.length > 0 ? this.minStack[this.minStack.length - 1] : null;
    }
}

// Approach 2: Single stack with pairs
class MinStackPairs {
    constructor() {
        this.stack = []; // Store [value, currentMin] pairs
    }
    
    push(val) {
        const currentMin = this.stack.length === 0 ? val : Math.min(val, this.getMin());
        this.stack.push([val, currentMin]);
    }
    
    pop() {
        return this.stack.length > 0 ? this.stack.pop()[0] : null;
    }
    
    top() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1][0] : null;
    }
    
    getMin() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1][1] : null;
    }
}`,
        explanation: "Two-stack approach maintains separate min tracking. Single-stack approach stores minimum with each element. Both achieve O(1) for all operations.",
        timeComplexity: "O(1) for all operations",
        spaceComplexity: "O(n)",
        approach: "Auxiliary Stack / Paired Storage"
      },
      python: {
        solution: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        self.stack.append(val)
        
        # Push to min stack if it's empty or val is <= current min
        if not self.min_stack or val <= self.get_min():
            self.min_stack.append(val)
    
    def pop(self):
        if not self.stack:
            return None
        
        popped = self.stack.pop()
        
        # Pop from min stack if popped element was the minimum
        if popped == self.get_min():
            self.min_stack.pop()
        
        return popped
    
    def top(self):
        return self.stack[-1] if self.stack else None
    
    def get_min(self):
        return self.min_stack[-1] if self.min_stack else None

# Single stack with tuples
class MinStackTuples:
    def __init__(self):
        self.stack = []  # Store (value, current_min) tuples
    
    def push(self, val):
        current_min = val if not self.stack else min(val, self.get_min())
        self.stack.append((val, current_min))
    
    def pop(self):
        return self.stack.pop()[0] if self.stack else None
    
    def top(self):
        return self.stack[-1][0] if self.stack else None
    
    def get_min(self):
        return self.stack[-1][1] if self.stack else None`,
        explanation: "Python implementation with clean list operations. Tuple approach stores minimum with each element for easy access.",
        timeComplexity: "O(1) for all operations",
        spaceComplexity: "O(n)",
        approach: "Auxiliary Stack / Tuple Storage"
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
        
        // Push to min stack if it's empty or val is <= current min
        if (minStack.isEmpty() || val <= getMin()) {
            minStack.push(val);
        }
    }
    
    public void pop() {
        if (stack.isEmpty()) return;
        
        int popped = stack.pop();
        
        // Pop from min stack if popped element was the minimum
        if (popped == getMin()) {
            minStack.pop();
        }
    }
    
    public int top() {
        return stack.isEmpty() ? -1 : stack.peek();
    }
    
    public int getMin() {
        return minStack.isEmpty() ? -1 : minStack.peek();
    }
}

// Single stack with custom node
class MinStackNode {
    private Node top;
    
    class Node {
        int val;
        int min;
        Node next;
        
        Node(int val, int min, Node next) {
            this.val = val;
            this.min = min;
            this.next = next;
        }
    }
    
    public void push(int val) {
        int currentMin = (top == null) ? val : Math.min(val, top.min);
        top = new Node(val, currentMin, top);
    }
    
    public void pop() {
        if (top != null) {
            top = top.next;
        }
    }
    
    public int top() {
        return (top != null) ? top.val : -1;
    }
    
    public int getMin() {
        return (top != null) ? top.min : -1;
    }
}`,
        explanation: "Java implementation with two approaches: separate min stack and custom node with embedded minimum. Both maintain O(1) operations.",
        timeComplexity: "O(1) for all operations",
        spaceComplexity: "O(n)",
        approach: "Auxiliary Stack / Custom Node"
      }
    },
    algorithmSteps: [
      "Choose between two-stack or single-stack approach",
      "For push: add element to main stack",
      "Update minimum tracking (separate stack or embedded)",
      "For pop: remove from main stack and update minimum if needed",
      "For top: return top element without removing",
      "For getMin: return current minimum in O(1) time",
      "Handle edge cases like empty stack"
    ],
    commonMistakes: [
      "Not handling duplicate minimum values correctly",
      "Forgetting to update min stack during pop operations",
      "Not considering space efficiency trade-offs",
      "Incorrect minimum tracking logic"
    ],
    optimizations: [
      "Only store minimums when they change",
      "Use single stack with embedded min for space efficiency",
      "Handle duplicate minimums properly"
    ],
    relatedQuestions: ["Max Stack", "Design Stack with Increment Operation", "Implement Queue using Stacks"]
  }
];