import { EnhancedQuestion } from "../../InterviewSubjects";

export const linkedListQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-05",
    question: "Reverse a linked list iteratively and recursively",
    category: "linked-lists",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Iterative: Use three pointers (prev, current, next). Set current.next = prev, then move all pointers forward. Recursive: Reverse rest of list first, then adjust pointers. Time complexity: O(n), Space complexity: O(1) iterative, O(n) recursive.",
    tips: [
      "Draw the pointer movements step by step",
      "Explain both iterative and recursive approaches",
      "Handle edge cases like empty list or single node"
    ],
    tags: ["linked-lists", "pointers", "recursion"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

// Iterative approach
function reverseListIterative(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        const next = current.next;  // Store next node
        current.next = prev;        // Reverse the link
        prev = current;             // Move prev forward
        current = next;             // Move current forward
    }
    
    return prev; // prev is the new head
}

// Recursive approach
function reverseListRecursive(head) {
    // Base case
    if (head === null || head.next === null) {
        return head;
    }
    
    // Recursively reverse the rest
    const newHead = reverseListRecursive(head.next);
    
    // Reverse current connection
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
        explanation: "Iterative uses three pointers to reverse links in place. Recursive reverses from the end and adjusts pointers on the way back.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) iterative, O(n) recursive",
        approach: "Two Pointers / Recursion"
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
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    
    return prev

def reverse_list_recursive(head):
    if not head or not head.next:
        return head
    
    new_head = reverse_list_recursive(head.next)
    head.next.next = head
    head.next = None
    
    return new_head`,
        explanation: "Python implementation with clean syntax. Recursive approach shows the power of recursion for linked list problems.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) iterative, O(n) recursive",
        approach: "Iterative / Recursive"
      },
      java: {
        solution: `public ListNode reverseListIterative(ListNode head) {
    ListNode prev = null;
    ListNode current = head;
    
    while (current != null) {
        ListNode next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}

public ListNode reverseListRecursive(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    
    ListNode newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
        explanation: "Java implementation with explicit null checks. Both approaches handle edge cases properly.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) iterative, O(n) recursive",
        approach: "Iterative / Recursive"
      }
    },
    algorithmSteps: [
      "Iterative: Initialize three pointers (prev=null, current=head, next)",
      "While current is not null: store next, reverse link, move pointers",
      "Return prev as new head",
      "Recursive: Base case - return head if null or single node",
      "Recursively reverse rest of list",
      "Adjust current node's pointers",
      "Return new head from recursion"
    ],
    commonMistakes: [
      "Losing reference to next node before reversing link",
      "Not updating prev pointer correctly",
      "Forgetting to set head.next = null in recursive approach",
      "Not handling empty list case"
    ],
    optimizations: [
      "Iterative approach uses constant space",
      "Single pass through the list",
      "In-place reversal without extra data structures"
    ],
    relatedQuestions: ["Reverse Linked List II", "Reverse Nodes in k-Group", "Swap Nodes in Pairs"]
  },

  {
    id: "dsa-06",
    question: "Detect cycle in a linked list (Floyd's algorithm)",
    category: "linked-lists",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Use Floyd's cycle detection algorithm with slow and fast pointers. Slow moves one step, fast moves two steps. If there's a cycle, fast will eventually meet slow. If no cycle, fast will reach null. Time complexity: O(n), Space complexity: O(1).",
    tips: [
      "Explain why fast and slow pointers work",
      "Discuss mathematical proof of cycle detection",
      "Handle edge cases like empty list or single node"
    ],
    tags: ["linked-lists", "two-pointers", "cycle-detection"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function hasCycle(head) {
    if (head === null || head.next === null) {
        return false;
    }
    
    let slow = head;
    let fast = head;
    
    while (fast !== null && fast.next !== null) {
        slow = slow.next;        // Move one step
        fast = fast.next.next;   // Move two steps
        
        if (slow === fast) {
            return true;         // Cycle detected
        }
    }
    
    return false; // No cycle
}

// Find the start of the cycle
function detectCycleStart(head) {
    if (head === null || head.next === null) {
        return null;
    }
    
    let slow = head;
    let fast = head;
    
    // Phase 1: Detect if cycle exists
    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            break; // Cycle detected
        }
    }
    
    // No cycle found
    if (fast === null || fast.next === null) {
        return null;
    }
    
    // Phase 2: Find cycle start
    slow = head;
    while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    return slow; // Start of cycle
}`,
        explanation: "Floyd's algorithm uses two pointers moving at different speeds. Mathematical proof ensures they meet if cycle exists. Second phase finds cycle start.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Two Pointers (Floyd's Algorithm)"
      },
      python: {
        solution: `def has_cycle(head):
    if not head or not head.next:
        return False
    
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            return True
    
    return False

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
    
    # Phase 2: Find start
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow`,
        explanation: "Python implementation with clean syntax. Uses walrus operator and else clause on while loop for elegant cycle detection.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Floyd's Cycle Detection"
      },
      java: {
        solution: `public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) {
        return false;
    }
    
    ListNode slow = head;
    ListNode fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow == fast) {
            return true;
        }
    }
    
    return false;
}

public ListNode detectCycleStart(ListNode head) {
    if (head == null || head.next == null) {
        return null;
    }
    
    ListNode slow = head;
    ListNode fast = head;
    
    // Phase 1: Detect cycle
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow == fast) {
            break;
        }
    }
    
    if (fast == null || fast.next == null) {
        return null; // No cycle
    }
    
    // Phase 2: Find start
    slow = head;
    while (slow != fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    return slow;
}`,
        explanation: "Java implementation with proper null checking. Two-phase approach first detects cycle, then finds the starting node.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        approach: "Floyd's Cycle Detection"
      }
    },
    algorithmSteps: [
      "Initialize slow and fast pointers to head",
      "Move slow pointer one step at a time",
      "Move fast pointer two steps at a time",
      "If fast reaches null, no cycle exists",
      "If slow equals fast, cycle detected",
      "To find cycle start: reset slow to head, move both one step until they meet"
    ],
    commonMistakes: [
      "Not checking for null pointers before accessing next",
      "Moving pointers incorrectly",
      "Not handling edge cases like empty list",
      "Confusing cycle detection with cycle start detection"
    ],
    optimizations: [
      "Constant space complexity",
      "Single pass for detection",
      "Mathematical guarantee of meeting in cycle"
    ],
    relatedQuestions: ["Linked List Cycle II", "Find Duplicate Number", "Happy Number"]
  }
];