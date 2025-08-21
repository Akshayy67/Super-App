import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedLinkedListQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-11",
    question: "Reverse a linked list (iterative and recursive)",
    category: "linked-lists",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Iterative: Use three pointers (prev, current, next). For each node, store next, reverse current's link to prev, move pointers forward. Recursive: reverse rest of list first, then fix current node's links. Both have O(n) time, iterative uses O(1) space, recursive uses O(n) space.",
    tips: [
      "Draw the pointer movements",
      "Handle empty list and single node cases",
      "Compare iterative vs recursive space complexity"
    ],
    tags: ["linked-lists", "pointers", "recursion"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// ListNode definition
class ListNode {
    constructor(val, next = null) {
        this.val = val;
        this.next = next;
    }
}

// Iterative approach
function reverseListIterative(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        let next = current.next; // Store next
        current.next = prev;     // Reverse link
        prev = current;          // Move prev
        current = next;          // Move current
    }
    
    return prev; // New head
}

// Recursive approach
function reverseListRecursive(head) {
    // Base case
    if (head === null || head.next === null) {
        return head;
    }
    
    // Reverse rest of the list
    let newHead = reverseListRecursive(head.next);
    
    // Reverse current connection
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
        explanation: "Iterative uses three pointers to reverse links. Recursive reverses from tail to head, fixing connections on the way back.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) iterative, O(n) recursive",
        approach: "Three Pointers / Recursion"
      },
      python: {
        solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list_iterative(head):
    prev = None
    current = head
    
    while current:
        next_node = current.next  # Store next
        current.next = prev       # Reverse link
        prev = current            # Move prev
        current = next_node       # Move current
    
    return prev  # New head

def reverse_list_recursive(head):
    # Base case
    if not head or not head.next:
        return head
    
    # Reverse rest of the list
    new_head = reverse_list_recursive(head.next)
    
    # Reverse current connection
    head.next.next = head
    head.next = None
    
    return new_head`,
        explanation: "Python implementation showing both approaches. Recursive approach is elegant but uses call stack space.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) iterative, O(n) recursive",
        approach: "Three Pointers / Recursion"
      },
      java: {
        solution: `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// Iterative approach
public ListNode reverseListIterative(ListNode head) {
    ListNode prev = null;
    ListNode current = head;
    
    while (current != null) {
        ListNode next = current.next; // Store next
        current.next = prev;          // Reverse link
        prev = current;               // Move prev
        current = next;               // Move current
    }
    
    return prev; // New head
}

// Recursive approach
public ListNode reverseListRecursive(ListNode head) {
    // Base case
    if (head == null || head.next == null) {
        return head;
    }
    
    // Reverse rest of the list
    ListNode newHead = reverseListRecursive(head.next);
    
    // Reverse current connection
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
        explanation: "Java implementation with proper ListNode class definition. Both approaches modify the original list structure.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) iterative, O(n) recursive",
        approach: "Three Pointers / Recursion"
      }
    },
    algorithmSteps: [
      "Iterative: Initialize prev=null, current=head",
      "Store next node before breaking link",
      "Reverse current node's link to point to prev",
      "Move prev and current pointers forward",
      "Repeat until current becomes null",
      "Return prev as new head",
      "Recursive: Reverse rest first, then fix current links"
    ],
    commonMistakes: [
      "Losing reference to next node",
      "Not updating pointers in correct order",
      "Forgetting to set original head's next to null",
      "Incorrect base case in recursive approach"
    ],
    optimizations: [
      "Iterative approach uses constant space",
      "Single pass through list",
      "In-place reversal without extra data structures"
    ],
    relatedQuestions: ["Reverse Nodes in k-Group", "Swap Nodes in Pairs", "Reverse Linked List II"]
  },

  {
    id: "dsa-12",
    question: "Detect cycle in a linked list (Floyd's Algorithm)",
    category: "linked-lists",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use Floyd's cycle detection (tortoise and hare): two pointers moving at different speeds. Slow moves one step, fast moves two steps. If there's a cycle, they'll meet inside the cycle. If fast reaches null, no cycle exists. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Explain why fast and slow pointers meet",
      "Discuss finding the start of cycle",
      "Handle edge cases like empty list"
    ],
    tags: ["linked-lists", "cycle-detection", "two-pointers"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function hasCycle(head) {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;        // Move one step
        fast = fast.next.next;   // Move two steps
        
        if (slow === fast) {
            return true; // Cycle detected
        }
    }
    
    return false; // No cycle
}

// Find cycle start position
function detectCycleStart(head) {
    if (!head || !head.next) return null;
    
    let slow = head;
    let fast = head;
    
    // Phase 1: Detect if cycle exists
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            break; // Cycle found
        }
    }
    
    // No cycle
    if (!fast || !fast.next) return null;
    
    // Phase 2: Find cycle start
    slow = head;
    while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    return slow; // Cycle start
}`,
        explanation: "Floyd's algorithm uses two pointers at different speeds. Mathematical proof shows they will meet if cycle exists. To find cycle start, reset one pointer to head and move both at same speed.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Floyd's Cycle Detection"
      },
      python: {
        solution: `def has_cycle(head):
    if not head or not head.next:
        return False
    
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next        # Move one step
        fast = fast.next.next   # Move two steps
        
        if slow == fast:
            return True  # Cycle detected
    
    return False  # No cycle

def detect_cycle_start(head):
    if not head or not head.next:
        return None
    
    slow = fast = head
    
    # Phase 1: Detect cycle
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            break
    else:
        return None  # No cycle
    
    # Phase 2: Find cycle start
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow`,
        explanation: "Python implementation with clean syntax. Uses walrus operator and else clause on while loop for elegant no-cycle handling.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Floyd's Cycle Detection"
      },
      java: {
        solution: `public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) return false;
    
    ListNode slow = head;
    ListNode fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;        // Move one step
        fast = fast.next.next;   // Move two steps
        
        if (slow == fast) {
            return true; // Cycle detected
        }
    }
    
    return false; // No cycle
}

public ListNode detectCycleStart(ListNode head) {
    if (head == null || head.next == null) return null;
    
    ListNode slow = head;
    ListNode fast = head;
    
    // Phase 1: Detect cycle
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow == fast) {
            break; // Cycle found
        }
    }
    
    // No cycle
    if (fast == null || fast.next == null) return null;
    
    // Phase 2: Find cycle start
    slow = head;
    while (slow != fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    return slow; // Cycle start
}`,
        explanation: "Java implementation with null safety checks. The algorithm works because of mathematical properties of cycle detection.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Floyd's Cycle Detection"
      }
    },
    algorithmSteps: [
      "Initialize slow and fast pointers at head",
      "Move slow pointer one step, fast pointer two steps",
      "If pointers meet, cycle exists",
      "If fast reaches null, no cycle",
      "To find cycle start: reset slow to head",
      "Move both pointers one step at a time",
      "Where they meet is cycle start"
    ],
    commonMistakes: [
      "Not checking for null pointers",
      "Incorrect pointer speed (both moving at same speed)",
      "Not understanding the mathematical proof",
      "Forgetting to handle empty list case"
    ],
    optimizations: [
      "Constant space complexity",
      "Single pass through list for detection",
      "No additional data structures needed"
    ],
    relatedQuestions: ["Linked List Cycle II", "Find Duplicate Number", "Happy Number"]
  }
];