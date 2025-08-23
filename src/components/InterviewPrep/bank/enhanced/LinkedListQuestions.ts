import { Question } from "../../InterviewSubjects";

// Enhanced Linked List DSA Questions with comprehensive implementations
export const enhancedLinkedListQuestions: Question[] = [
  {
    id: "enhanced-linkedlist-1",
    question:
      "Reverse Linked List - Given the head of a singly linked list, reverse the list and return the reversed list.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "To reverse a linked list, we need to change the direction of all next pointers. There are multiple approaches: iterative with temporary pointers, recursive by leveraging the call stack, or using a stack data structure for temporary storage. The iterative approach is most space-efficient, using only constant extra space.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Iterative Approach: We maintain three pointers - prev, current, and next. For each node, we save the next node, reverse the current node's pointer, update prev and current. Time complexity is O(n) for traversing the list once. Space complexity is O(1) as we use only a constant amount of extra space.",
        code: `// ListNode Definition
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = val === undefined ? 0 : val;
        this.next = next === undefined ? null : null;
    }
}

function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let current = head;
    
    while (current) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}`,
      },
      {
        language: "Python",
        explanation:
          "Iterative Approach: We maintain three pointers - prev, current, and next. For each node, we save the next node, reverse the current node's pointer, update prev and current. Time complexity is O(n) for traversing the list once. Space complexity is O(1) as we use only a constant amount of extra space.",
        code: `# ListNode Definition
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    prev = None
    current = head
    
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    
    return prev`,
      },
      {
        language: "Java",
        explanation:
          "Iterative Approach: We maintain three pointers - prev, current, and next. For each node, we save the next node, reverse the current node's pointer, update prev and current. Time complexity is O(n) for traversing the list once. Space complexity is O(1) as we use only a constant amount of extra space.",
        code: `// ListNode Definition
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
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
}`,
      },
      {
        language: "typescript",
        explanation:
          "Recursive Approach: We recursively traverse to the end of the list, then fix the pointers while unwinding the recursion stack. For each node, we set its next node's next pointer to point to itself and its next pointer to null. Time complexity is O(n), but space complexity is O(n) due to the recursion stack.",
        code: `function reverseListRecursive(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return head;
    
    const newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
      },
      {
        language: "Python",
        explanation:
          "Recursive Approach: We recursively traverse to the end of the list, then fix the pointers while unwinding the recursion stack. For each node, we set its next node's next pointer to point to itself and its next pointer to null. Time complexity is O(n), but space complexity is O(n) due to the recursion stack.",
        code: `def reverseListRecursive(head):
    if not head or not head.next:
        return head
    
    new_head = reverseListRecursive(head.next)
    head.next.next = head
    head.next = None
    
    return new_head`,
      },
      {
        language: "Java",
        explanation:
          "Recursive Approach: We recursively traverse to the end of the list, then fix the pointers while unwinding the recursion stack. For each node, we set its next node's next pointer to point to itself and its next pointer to null. Time complexity is O(n), but space complexity is O(n) due to the recursion stack.",
        code: `class Solution {
    public ListNode reverseListRecursive(ListNode head) {
        if (head == null || head.next == null) return head;
        
        ListNode newHead = reverseListRecursive(head.next);
        head.next.next = head;
        head.next = null;
        
        return newHead;
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "Stack-Based Approach: We first push all nodes onto a stack, then pop them off in reverse order to rebuild the list. This approach makes the reversal process more explicit. Time complexity is O(n) and space complexity is also O(n) for the stack.",
        code: `function reverseListStack(head: ListNode | null): ListNode | null {
    if (!head) return null;
    
    const stack: ListNode[] = [];
    let current = head;
    
    // Push all nodes to stack
    while (current) {
        stack.push(current);
        current = current.next;
    }
    
    // Pop and rebuild connections
    const newHead = stack.pop()!;
    current = newHead;
    
    while (stack.length > 0) {
        current.next = stack.pop()!;
        current = current.next;
    }
    
    current.next = null;
    return newHead;
}`,
      },
      {
        language: "Python",
        explanation:
          "Stack-Based Approach: We first push all nodes onto a stack, then pop them off in reverse order to rebuild the list. This approach makes the reversal process more explicit. Time complexity is O(n) and space complexity is also O(n) for the stack.",
        code: `def reverseListStack(head):
    if not head:
        return None
    
    stack = []
    current = head
    
    # Push all nodes to stack
    while current:
        stack.append(current)
        current = current.next
    
    # Pop and rebuild connections
    new_head = stack.pop()
    current = new_head
    
    while stack:
        current.next = stack.pop()
        current = current.next
    
    current.next = None
    return new_head`,
      },
      {
        language: "Java",
        explanation:
          "Stack-Based Approach: We first push all nodes onto a stack, then pop them off in reverse order to rebuild the list. This approach makes the reversal process more explicit. Time complexity is O(n) and space complexity is also O(n) for the stack.",
        code: `import java.util.*;
class Solution {
    public ListNode reverseListStack(ListNode head) {
        if (head == null) return null;
        
        Stack<ListNode> stack = new Stack<>();
        ListNode current = head;
        
        // Push all nodes to stack
        while (current != null) {
            stack.push(current);
            current = current.next;
        }
        
        // Pop and rebuild connections
        ListNode newHead = stack.pop();
        current = newHead;
        
        while (!stack.isEmpty()) {
            current.next = stack.pop();
            current = current.next;
        }
        
        current.next = null;
        return newHead;
    }
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three solutions: an iterative approach with O(1) space (preferred), a recursive approach using the call stack, and a stack-based approach. The key insight is changing the direction of pointers while keeping track of nodes to avoid losing references.",
    tips: [
      "Three pointers: prev, current, next",
      "Iterative solution is most space efficient",
      "Recursive solution is elegant but uses call stack",
      "Remember to set last node's next to null",
    ],
    tags: ["linked-list", "recursion", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-2",
    question:
      "Linked List Cycle - Given head of a linked list, determine if the linked list has a cycle in it.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "To detect a cycle in a linked list, we can use either space-efficient algorithms like Floyd's Cycle Detection (also known as the Tortoise and Hare algorithm) or a hash-based approach. Floyd's algorithm uses two pointers moving at different speeds - if there's a cycle, the fast pointer will eventually catch up to the slow pointer. The hash-based approach tracks visited nodes and detects a cycle when we encounter a previously visited node.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Floyd's Cycle Detection Algorithm: We use two pointers - a slow pointer that moves one step at a time and a fast pointer that moves two steps. If there's a cycle, the fast pointer will eventually meet the slow pointer. This approach uses O(1) space and O(n) time complexity.",
        code: `function hasCycle(head: ListNode | null): boolean {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next!;
        fast = fast.next.next;
        
        if (slow === fast) return true;
    }
    
    return false;
}`,
      },
      {
        language: "Python",
        explanation:
          "Floyd's Cycle Detection Algorithm: We use two pointers - a slow pointer that moves one step at a time and a fast pointer that moves two steps. If there's a cycle, the fast pointer will eventually meet the slow pointer. This approach uses O(1) space and O(n) time complexity.",
        code: `def hasCycle(head):
    if not head or not head.next:
        return False
    
    slow = head
    fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            return True
    
    return False`,
      },
      {
        language: "typescript",
        explanation:
          "Hash Set Approach: We track all visited nodes in a Set. If we encounter a node that's already in the set, we've found a cycle. This approach is more intuitive but uses O(n) extra space with O(n) time complexity.",
        code: `function hasCycleHashSet(head: ListNode | null): boolean {
    const visited = new Set<ListNode>();
    let current = head;
    
    while (current) {
        if (visited.has(current)) return true;
        visited.add(current);
        current = current.next;
    }
    
    return false;
}`,
      },
      {
        language: "Python",
        explanation:
          "Hash Set Approach: We track all visited nodes in a Set. If we encounter a node that's already in the set, we've found a cycle. This approach is more intuitive but uses O(n) extra space with O(n) time complexity.",
        code: `def hasCycleHashSet(head):
    visited = set()
    current = head
    
    while current:
        if current in visited:
            return True
        visited.add(current)
        current = current.next
    
    return False`,
      },
      {
        language: "typescript",
        explanation:
          "Finding Cycle Start Position: This is a follow-up that extends Floyd's algorithm. After detecting a cycle, we reset the slow pointer to the head and move both pointers at the same speed. The point where they meet is the start of the cycle. The mathematical proof relies on the properties of modular arithmetic. Time complexity remains O(n) and space O(1).",
        code: `function detectCycle(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return null;
    
    let slow = head;
    let fast = head;
    
    // Phase 1: Detect if cycle exists
    while (fast && fast.next) {
        slow = slow.next!;
        fast = fast.next.next;
        
        if (slow === fast) break;
    }
    
    if (!fast || !fast.next) return null; // No cycle
    
    // Phase 2: Find cycle start
    slow = head;
    while (slow !== fast) {
        slow = slow.next!;
        fast = fast.next!;
    }
    
    return slow;
}`,
      },
      {
        language: "Python",
        explanation:
          "Finding Cycle Start Position: This is a follow-up that extends Floyd's algorithm. After detecting a cycle, we reset the slow pointer to the head and move both pointers at the same speed. The point where they meet is the start of the cycle. The mathematical proof relies on the properties of modular arithmetic. Time complexity remains O(n) and space O(1).",
        code: `def detectCycle(head):
    if not head or not head.next:
        return None
    
    slow = head
    fast = head
    
    # Phase 1: Detect if cycle exists
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            break
    
    if not fast or not fast.next: # No cycle
        return None
    
    # Phase 2: Find cycle start
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow`,
      },
      {
        language: "Java",
        explanation:
          "Finding Cycle Start Position: This is a follow-up that extends Floyd's algorithm. After detecting a cycle, we reset the slow pointer to the head and move both pointers at the same speed. The point where they meet is the start of the cycle. The mathematical proof relies on the properties of modular arithmetic. Time complexity remains O(n) and space O(1).",
        code: `class Solution {
    public ListNode detectCycle(ListNode head) {
        if (head == null || head.next == null) return null;
        
        ListNode slow = head;
        ListNode fast = head;
        
        // Phase 1: Detect if cycle exists
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            
            if (slow == fast) break;
        }
        
        if (fast == null || fast.next == null) return null; // No cycle
        
        // Phase 2: Find cycle start
        slow = head;
        while (slow != fast) {
            slow = slow.next;
            fast = fast.next;
        }
        
        return slow;
    }
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for two approaches to detect cycles: Floyd's Cycle Detection (optimal with O(1) space) and a hash set approach. For the follow-up of finding the start of the cycle, we use an extension of Floyd's algorithm that resets one pointer to the head after cycle detection.",
    tips: [
      "Floyd's algorithm uses two pointers at different speeds",
      "If there's a cycle, fast pointer will eventually meet slow pointer",
      "Hash set approach is intuitive but uses extra space",
      "Cycle start detection requires additional phase after finding cycle",
    ],
    tags: ["linked-list", "two-pointers", "hash-table"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-3",
    question:
      "Merge Two Sorted Lists - Merge two sorted linked lists and return it as a sorted list.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    approach:
      "To merge two sorted linked lists, we compare values from both lists and build a new list in sorted order. There are multiple approaches: using a dummy node to simplify handling the head of the result list, using recursion to leverage the natural recursive structure of the problem, or merging in-place by directly manipulating the original lists.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Iterative Approach with Dummy Node: We use a dummy node to avoid edge cases for handling the head. We compare values from both lists and connect the smaller node to our result. Time complexity is O(m+n) where m and n are the lengths of the lists. Space complexity is O(1) as we only rearrange pointers without using extra space proportional to input size.",
        code: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let current = dummy;
    
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    
    // Attach remaining nodes
    current.next = list1 || list2;
    
    return dummy.next;
}`,
      },
      {
        language: "Python",
        explanation:
          "Iterative Approach with Dummy Node: We use a dummy node to avoid edge cases for handling the head. We compare values from both lists and connect the smaller node to our result. Time complexity is O(m+n) where m and n are the lengths of the lists. Space complexity is O(1) as we only rearrange pointers without using extra space proportional to input size.",
        code: `def mergeTwoLists(list1, list2):
    dummy = ListNode(0)
    current = dummy
    
    while list1 and list2:
        if list1.val <= list2.val:
            current.next = list1
            list1 = list1.next
        else:
            current.next = list2
            list2 = list2.next
        current = current.next
    
    # Attach remaining nodes
    current.next = list1 or list2
    
    return dummy.next`,
      },
      {
        language: "Java",
        explanation:
          "Iterative Approach with Dummy Node: We use a dummy node to avoid edge cases for handling the head. We compare values from both lists and connect the smaller node to our result. Time complexity is O(m+n) where m and n are the lengths of the lists. Space complexity is O(1) as we only rearrange pointers without using extra space proportional to input size.",
        code: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                current.next = list1;
                list1 = list1.next;
            } else {
                current.next = list2;
                list2 = list2.next;
            }
            current = current.next;
        }
        
        // Attach remaining nodes
        current.next = list1 != null ? list1 : list2;
        
        return dummy.next;
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "Recursive Approach: This elegant solution recursively merges the lists by choosing the smaller head node, then recursively attaching the result of merging the remaining lists. Time complexity is O(m+n), but space complexity is O(m+n) due to the recursion stack.",
        code: `function mergeTwoListsRecursive(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    if (!list1) return list2;
    if (!list2) return list1;
    
    if (list1.val <= list2.val) {
        list1.next = mergeTwoListsRecursive(list1.next, list2);
        return list1;
    } else {
        list2.next = mergeTwoListsRecursive(list1, list2.next);
        return list2;
    }
}`,
      },
      {
        language: "Python",
        explanation:
          "Recursive Approach: This elegant solution recursively merges the lists by choosing the smaller head node, then recursively attaching the result of merging the remaining lists. Time complexity is O(m+n), but space complexity is O(m+n) due to the recursion stack.",
        code: `def mergeTwoListsRecursive(list1, list2):
    if not list1:
        return list2
    if not list2:
        return list1
    
    if list1.val <= list2.val:
        list1.next = mergeTwoListsRecursive(list1.next, list2)
        return list1
    else:
        list2.next = mergeTwoListsRecursive(list1, list2.next)
        return list2`,
      },
      {
        language: "Java",
        explanation:
          "Recursive Approach: This elegant solution recursively merges the lists by choosing the smaller head node, then recursively attaching the result of merging the remaining lists. Time complexity is O(m+n), but space complexity is O(m+n) due to the recursion stack.",
        code: `class Solution {
    public ListNode mergeTwoListsRecursive(ListNode list1, ListNode list2) {
        if (list1 == null) return list2;
        if (list2 == null) return list1;
        
        if (list1.val <= list2.val) {
            list1.next = mergeTwoListsRecursive(list1.next, list2);
            return list1;
        } else {
            list2.next = mergeTwoListsRecursive(list1, list2.next);
            return list2;
        }
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "In-place Merge Approach: This approach avoids using a dummy node by directly handling the head edge case. It has the same time and space complexity as the iterative approach with dummy node (O(m+n) time, O(1) space) but might be slightly more complex to understand.",
        code: `function mergeTwoListsInPlace(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    if (!list1) return list2;
    if (!list2) return list1;
    
    let head: ListNode;
    
    if (list1.val <= list2.val) {
        head = list1;
        list1 = list1.next;
    } else {
        head = list2;
        list2 = list2.next;
    }
    
    let current = head;
    
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    
    current.next = list1 || list2;
    return head;
}`,
      },
      {
        language: "Python",
        explanation:
          "In-place Merge Approach: This approach avoids using a dummy node by directly handling the head edge case. It has the same time and space complexity as the iterative approach with dummy node (O(m+n) time, O(1) space) but might be slightly more complex to understand.",
        code: `def mergeTwoListsInPlace(list1, list2):
    if not list1:
        return list2
    if not list2:
        return list1
    
    head = None
    
    if list1.val <= list2.val:
        head = list1
        list1 = list1.next
    else:
        head = list2
        list2 = list2.next
    
    current = head
    
    while list1 and list2:
        if list1.val <= list2.val:
            current.next = list1
            list1 = list1.next
        else:
            current.next = list2
            list2 = list2.next
        current = current.next
    
    current.next = list1 or list2
    return head`,
      },
      {
        language: "Java",
        explanation:
          "In-place Merge Approach: This approach avoids using a dummy node by directly handling the head edge case. It has the same time and space complexity as the iterative approach with dummy node (O(m+n) time, O(1) space) but might be slightly more complex to understand.",
        code: `class Solution {
    public ListNode mergeTwoListsInPlace(ListNode list1, ListNode list2) {
        if (list1 == null) return list2;
        if (list2 == null) return list1;
        
        ListNode head;
        
        if (list1.val <= list2.val) {
            head = list1;
            list1 = list1.next;
        } else {
            head = list2;
            list2 = list2.next;
        }
        
        ListNode current = head;
        
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                current.next = list1;
                list1 = list1.next;
            } else {
                current.next = list2;
                list2 = list2.next;
            }
            current = current.next;
        }
        
        current.next = list1 != null ? list1 : list2;
        return head;
    }
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches: iterative with a dummy node (most common), recursive (elegant but uses stack space), and in-place without dummy node. All three compare values from both lists and build a new sorted list by reusing the original nodes.",
    tips: [
      "Dummy node simplifies edge case handling",
      "Compare values and advance pointer of smaller element",
      "Attach remaining nodes after one list is exhausted",
      "Recursive solution is elegant but uses stack space",
    ],
    tags: ["linked-list", "recursion", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-4",
    question:
      "Remove Nth Node From End of List - Given the head of a linked list, remove the nth node from the end and return its head.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem requires finding and removing the nth node from the end of a linked list. The key challenge is that in a singly linked list, we can only traverse forward. We can solve this using multiple approaches: using two pointers with a gap of n, counting the length in a first pass and then removing in a second pass, or using recursion to leverage the implicit stack for backward counting.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Two Pointers (One Pass) Approach: We use two pointers with a gap of n+1 between them. When the first pointer reaches the end, the second pointer will be at the node just before the one to be deleted. This allows us to remove the target node in a single pass. Time complexity is O(n) and space complexity is O(1).",
        code: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
    const dummy = new ListNode(0);
    dummy.next = head;
    
    let first = dummy;
    let second = dummy;
    
    // Move first pointer n+1 steps ahead
    for (let i = 0; i <= n; i++) {
        first = first.next!;
    }
    
    // Move both pointers until first reaches end
    while (first) {
        first = first.next!;
        second = second.next!;
    }
    
    // Remove the nth node from end
    second.next = second.next!.next;
    
    return dummy.next;
}`,
      },
      {
        language: "Python",
        explanation:
          "Two Pointers (One Pass) Approach: We use two pointers with a gap of n+1 between them. When the first pointer reaches the end, the second pointer will be at the node just before the one to be deleted. This allows us to remove the target node in a single pass. Time complexity is O(n) and space complexity is O(1).",
        code: `def removeNthFromEnd(head, n):
    dummy = ListNode(0)
    dummy.next = head
    
    first = dummy
    second = dummy
    
    # Move first pointer n+1 steps ahead
    for i in range(n + 1):
        first = first.next
    
    # Move both pointers until first reaches end
    while first:
        first = first.next
        second = second.next
    
    # Remove the nth node from end
    second.next = second.next.next
    
    return dummy.next`,
      },
      {
        language: "typescript",
        explanation:
          "Two Pass Approach: We first count the total number of nodes in the list, then calculate the position of the node to remove from the beginning. While less efficient than the one-pass solution, this approach might be more intuitive. Time complexity is O(n) with two passes, and space complexity is O(1).",
        code: `function removeNthFromEndTwoPass(head: ListNode | null, n: number): ListNode | null {
    // First pass: count total nodes
    let length = 0;
    let current = head;
    while (current) {
        length++;
        current = current.next;
    }
    
    // Handle edge case: remove head
    if (n === length) {
        return head?.next || null;
    }
    
    // Second pass: find node before target
    current = head;
    for (let i = 0; i < length - n - 1; i++) {
        current = current!.next;
    }
    
    current!.next = current!.next!.next;
    return head;
}`,
      },
      {
        language: "Python",
        explanation:
          "Two Pass Approach: We first count the total number of nodes in the list, then calculate the position of the node to remove from the beginning. While less efficient than the one-pass solution, this approach might be more intuitive. Time complexity is O(n) with two passes, and space complexity is O(1).",
        code: `def removeNthFromEndTwoPass(head, n):
    # First pass: count total nodes
    length = 0
    current = head
    while current:
        length += 1
        current = current.next
    
    # Handle edge case: remove head
    if n == length:
        return head.next if head else None
    
    # Second pass: find node before target
    current = head
    for i in range(length - n - 1):
        current = current.next
    
    current.next = current.next.next
    return head`,
      },
      {
        language: "typescript",
        explanation:
          "Recursive Approach: We use recursion to implicitly count from the end of the list. As we unwind the recursion stack, we track the position from the end and remove the target node when identified. Time complexity is O(n) and space complexity is O(n) due to the recursion stack.",
        code: `function removeNthFromEndRecursive(head: ListNode | null, n: number): ListNode | null {
    function helper(node: ListNode | null): number {
        if (!node) return 0;
        
        const index = helper(node.next) + 1;
        
        if (index === n + 1) {
            node.next = node.next!.next;
        }
        
        return index;
    }
    
    const dummy = new ListNode(0);
    dummy.next = head;
    helper(dummy);
    
    return dummy.next;
}`,
      },
      {
        language: "Python",
        explanation:
          "Recursive Approach: We use recursion to implicitly count from the end of the list. As we unwind the recursion stack, we track the position from the end and remove the target node when identified. Time complexity is O(n) and space complexity is O(n) due to the recursion stack.",
        code: `def removeNthFromEndRecursive(head, n):
    def helper(node):
        if not node:
            return 0
        
        index = helper(node.next) + 1
        
        if index == n + 1:
            node.next = node.next.next
        return index
    
    dummy = ListNode(0)
    dummy.next = head
    helper(dummy)
    
    return dummy.next`,
      },
      {
        language: "Java",
        explanation:
          "Recursive Approach: We use recursion to implicitly count from the end of the list. As we unwind the recursion stack, we track the position from the end and remove the target node when identified. Time complexity is O(n) and space complexity is O(n) due to the recursion stack.",
        code: `class Solution {
    public ListNode removeNthFromEndRecursive(ListNode head, int n) {
        class Helper {
            public int helper(ListNode node) {
                if (node == null) return 0;
                
                int index = helper(node.next) + 1;
                
                if (index == n + 1) {
                    node.next = node.next.next;
                }
                
                return index;
            }
        }
        
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        new Helper().helper(dummy);
        
        return dummy.next;
    }
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches: a two-pointer solution that finds the target node in one pass (optimal), a two-pass solution that first counts nodes then removes the target, and a recursive solution that leverages the call stack to count from the end. All three handle edge cases like removing the head node by using a dummy node.",
    tips: [
      "Two pointers with n+1 gap ensures second pointer stops at node before target",
      "Dummy node handles edge case of removing head",
      "One pass is more efficient than counting then removing",
      "Consider edge cases: single node, removing head, n > length",
    ],
    tags: ["linked-list", "two-pointers"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-5",
    question:
      "Reorder List - Given a singly linked list L: L0→L1→…→Ln-1→Ln, reorder it to: L0→Ln→L1→Ln-1→L2→Ln-2→…",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Reordering a linked list to interleave nodes from the beginning and end requires addressing several sub-problems. The most efficient approach breaks this down into three steps: finding the middle of the list, reversing the second half, and then merging the two halves alternately. Alternative approaches include using an array to store all nodes for easy access or using recursion with repeated operations to find the tail.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Three-Step Approach: This optimal solution first finds the middle using the slow/fast pointer technique, then reverses the second half of the list, and finally merges the two halves alternately. Time complexity is O(n) with only one pass through each step, and space complexity is O(1) as we only rearrange pointers without using extra data structures.",
        code: `function reorderList(head: ListNode | null): void {
    if (!head || !head.next) return;
    
    // Step 1: Find middle of the list
    let slow = head;
    let fast = head;
    
    while (fast.next && fast.next.next) {
        slow = slow.next!;
        fast = fast.next.next;
    }
    
    // Step 2: Reverse second half
    let secondHalf = slow.next;
    slow.next = null; // Split the list
    
    function reverseList(head: ListNode | null): ListNode | null {
        let prev: ListNode | null = null;
        let current = head;
        
        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        return prev;
    }
    
    secondHalf = reverseList(secondHalf);
    
    // Step 3: Merge two halves alternately
    let first = head;
    let second = secondHalf;
    
    while (second) {
        const firstNext = first.next;
        const secondNext = second.next;
        
        first.next = second;
        second.next = firstNext;
        
        first = firstNext!;
        second = secondNext;
    }
}`,
      },
      {
        language: "Python",
        explanation:
          "Three-Step Approach: This optimal solution first finds the middle using the slow/fast pointer technique, then reverses the second half of the list, and finally merges the two halves alternately. Time complexity is O(n) with only one pass through each step, and space complexity is O(1) as we only rearrange pointers without using extra data structures.",
        code: `def reorderList(head):
    if not head or not head.next:
        return
    
    # Step 1: Find middle of the list
    slow = head
    fast = head
    
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    
    # Step 2: Reverse second half
    second_half = slow.next
    slow.next = None # Split the list
    
    def reverseList(head):
        prev = None
        current = head
        
        while current:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        
        return prev
    
    second_half = reverseList(second_half)
    
    # Step 3: Merge two halves alternately
    first = head
    second = second_half
    
    while second:
        first_next = first.next
        second_next = second.next
        
        first.next = second
        second.next = first_next
        
        first = first_next
        second = second_next`,
      },
      {
        language: "typescript",
        explanation:
          "Array-Based Approach: This solution stores all nodes in an array first, then uses two pointers from both ends to reorder the list. While more intuitive, it uses O(n) extra space. Time complexity remains O(n).",
        code: `function reorderListArray(head: ListNode | null): void {
    if not head:
        return
    
    # Convert to array
    nodes = []
    current = head
    
    while current:
        nodes.append(current)
        current = current.next
    
    # Reorder using two pointers
    left = 0
    right = len(nodes) - 1
    
    while left < right:
        nodes[left].next = nodes[right]
        left += 1
        
        if left == right:
            break
        
        nodes[right].next = nodes[left]
        right -= 1
    
    nodes[left].next = None`,
      },
      {
        language: "Python",
        explanation:
          "Array-Based Approach: This solution stores all nodes in an array first, then uses two pointers from both ends to reorder the list. While more intuitive, it uses O(n) extra space. Time complexity remains O(n).",
        code: `def reorderListArray(head):
    if not head:
        return
    
    # Convert to array
    nodes = []
    current = head
    
    while current:
        nodes.append(current)
        current = current.next
    
    # Reorder using two pointers
    left = 0
    right = len(nodes) - 1
    
    while left < right:
        nodes[left].next = nodes[right]
        left += 1
        
        if left == right:
            break
        
        nodes[right].next = nodes[left]
        right -= 1
    
    nodes[left].next = None`,
      },
      {
        language: "typescript",
        explanation:
          "Recursive Approach: This solution recursively finds the tail of the list, disconnects it, inserts it after the head, and repeats on the remaining list. While elegant in concept, it has poor performance with O(n²) time complexity since finding the tail is repeated for each recursion level.",
        code: `function reorderListRecursive(head: ListNode | null): void {
    if (!head || !head.next) return;
    
    # Find tail and second-to-last
    prev = None
    tail = head
    
    while tail.next:
        prev = tail
        tail = tail.next
    
    # Disconnect tail
    prev.next = None
    
    # Insert tail after head
    tail.next = head.next
    head.next = tail
    
    # Recursively reorder remaining list
    reorderListRecursive(tail.next);
}`,
      },
      {
        language: "Python",
        explanation:
          "Recursive Approach: This solution recursively finds the tail of the list, disconnects it, inserts it after the head, and repeats on the remaining list. While elegant in concept, it has poor performance with O(n²) time complexity since finding the tail is repeated for each recursion level.",
        code: `def reorderListRecursive(head):
    if not head or not head.next:
        return
    
    # Find tail and second-to-last
    prev = None
    tail = head
    
    while tail.next:
        prev = tail
        tail = tail.next
    
    # Disconnect tail
    prev.next = None
    
    # Insert tail after head
    tail.next = head.next
    head.next = tail
    
    # Recursively reorder remaining list
    reorderListRecursive(tail.next)`,
      },
      {
        language: "Java",
        explanation:
          "Recursive Approach: This solution recursively finds the tail of the list, disconnects it, inserts it after the head, and repeats on the remaining list. While elegant in concept, it has poor performance with O(n²) time complexity since finding the tail is repeated for each recursion level.",
        code: `class Solution {
    public void reorderListRecursive(ListNode head) {
        if (head == null || head.next == null) return;
        
        // Find tail and second-to-last
        ListNode prev = null;
        ListNode tail = head;
        
        while (tail.next != null) {
            prev = tail;
            tail = tail.next;
        }
        
        // Disconnect tail
        prev.next = null;
        
        // Insert tail after head
        tail.next = head.next;
        head.next = tail;
        
        // Recursively reorder remaining list
        reorderListRecursive(tail.next);
    }
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches: a three-step approach (find middle, reverse second half, merge alternately) which is most efficient, an array-based approach for clarity but with more space usage, and a recursive approach that's intuitive but less efficient. The optimal solution uses O(n) time with only O(1) extra space.",
    tips: [
      "Break problem into: find middle, reverse second half, merge",
      "Use slow/fast pointers to find middle in one pass",
      "Reverse second half in-place to save space",
      "Merge alternately: take from first, then second half",
    ],
    tags: ["linked-list", "two-pointers", "recursion"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-6",
    question:
      "Merge k Sorted Lists - You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all into one sorted linked-list.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "Merging k sorted linked lists can be approached in several ways. Three common approaches are: a divide-and-conquer strategy that recursively merges pairs of lists, using a priority queue (min heap) to always select the minimum node among the k lists, or sequentially merging one list at a time. The first two approaches are more efficient with O(n log k) time complexity where n is the total number of nodes and k is the number of lists.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Divide and Conquer Approach: We recursively merge pairs of lists, reducing the total number of lists by half in each iteration until only one list remains. This approach has O(n log k) time complexity where n is the total number of nodes and k is the number of lists. The space complexity is O(log k) for the recursive call stack.",
        code: `function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
    if (lists.length === 0) return null;
    
    function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
        const dummy = new ListNode(0);
        let current = dummy;
        
        while (l1 && l2) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
        
        current.next = l1 || l2;
        return dummy.next;
    }
    
    while (lists.length > 1) {
        const mergedLists: (ListNode | null)[] = [];
        
        for (let i = 0; i < lists.length; i += 2) {
            const l1 = lists[i];
            const l2 = i + 1 < lists.length ? lists[i + 1] : null;
            mergedLists.push(mergeTwoLists(l1, l2));
        }
        
        lists = mergedLists;
    }
    
    return lists[0];
}`,
      },
      {
        language: "Python",
        explanation:
          "Divide and Conquer Approach: We recursively merge pairs of lists, reducing the total number of lists by half in each iteration until only one list remains. This approach has O(n log k) time complexity where n is the total number of nodes and k is the number of lists. The space complexity is O(log k) for the recursive call stack.",
        code: `def mergeKLists(lists):
    if not lists:
        return None
    
    def mergeTwoLists(l1, l2):
        dummy = ListNode(0)
        current = dummy
        
        while l1 and l2:
            if l1.val <= l2.val:
                current.next = l1
                l1 = l1.next
            else:
                current.next = l2
                l2 = l2.next
            current = current.next
        
        current.next = l1 or l2
        return dummy.next
    
    while len(lists) > 1:
        merged_lists = []
        
        for i in range(0, len(lists), 2):
            l1 = lists[i]
            l2 = lists[i + 1] if i + 1 < len(lists) else None
            merged_lists.append(mergeTwoLists(l1, l2))
        
        lists = merged_lists
    
    return lists[0] if lists else None`,
      },
      {
        language: "typescript",
        explanation:
          "Priority Queue Approach: We maintain a min heap of nodes from all lists, always extracting the minimum node and adding its next node to the heap. This approach also has O(n log k) time complexity, with O(k) space complexity for the heap. This implementation includes a simple min-heap implementation for clarity.",
        code: `function mergeKListsHeap(lists: (ListNode | null)[]): ListNode | null {
    # Simple priority queue implementation
    class MinHeap:
        def __init__(self):
            self.heap = []
        
        def push(self, node: ListNode):
            self.heap.append(node)
            self._bubbleUp(len(self.heap) - 1)
        
        def pop(self) -> ListNode | None:
            if not self.heap:
                return None
            if len(self.heap) == 1:
                return self.heap.pop()
            
            min_node = self.heap[0]
            self.heap[0] = self.heap.pop()
            self._bubbleDown(0)
            return min_node
        
        def _bubbleUp(self, index: int):
            while index > 0:
                parent_index = (index - 1) // 2
                if self.heap[parent_index].val <= self.heap[index].val:
                    break
                
                self.heap[parent_index], self.heap[index] = self.heap[index], self.heap[parent_index]
                index = parent_index
        
        def _bubbleDown(self, index: int):
            while True:
                min_index = index
                left_child = 2 * index + 1
                right_child = 2 * index + 2
                
                if left_child < len(self.heap) and self.heap[left_child].val < self.heap[min_index].val:
                    min_index = left_child
                
                if right_child < len(self.heap) and self.heap[right_child].val < self.heap[min_index].val:
                    min_index = right_child
                
                if min_index == index:
                    break
                
                self.heap[index], self.heap[min_index] = self.heap[min_index], self.heap[index]
                index = min_index
        
        def isEmpty(self) -> bool:
            return not self.heap
    
    heap = MinHeap()
    
    # Add first node from each list
    for lst in lists:
        if lst:
            heap.push(lst)
    
    dummy = ListNode(0)
    current = dummy
    
    while not heap.isEmpty():
        node = heap.pop()
        current.next = node
        current = current.next
        
        if node.next:
            heap.push(node.next)
    
    return dummy.next`,
      },
      {
        language: "Python",
        explanation:
          "Priority Queue Approach: We maintain a min heap of nodes from all lists, always extracting the minimum node and adding its next node to the heap. This approach also has O(n log k) time complexity, with O(k) space complexity for the heap. This implementation includes a simple min-heap implementation for clarity.",
        code: `import heapq

class MinHeap:
    def __init__(self):
        self.heap = []
    
    def push(self, node: ListNode):
        heapq.heappush(self.heap, node)
    
    def pop(self) -> ListNode | None:
        if not self.heap:
            return None
        return heapq.heappop(self.heap)
    
    def isEmpty(self) -> bool:
        return not self.heap

def mergeKListsHeap(lists):
    if not lists:
        return None
    
    heap = MinHeap()
    
    # Add first node from each list
    for lst in lists:
        if lst:
            heap.push(lst)
    
    dummy = ListNode(0)
    current = dummy
    
    while not heap.isEmpty():
        node = heap.pop()
        current.next = node
        current = current.next
        
        if node.next:
            heap.push(node.next)
    
    return dummy.next`,
      },
      {
        language: "typescript",
        explanation:
          "Sequential Merging Approach: This is the most straightforward approach where we merge lists one by one. For each iteration, we merge the result so far with the next list. Time complexity is O(kn) which is less efficient than the other approaches, but the implementation is simpler and uses only O(1) extra space.",
        code: `function mergeKListsSequential(lists: (ListNode | null)[]): ListNode | null {
    if (lists.length === 0) return null;
    
    function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
        const dummy = new ListNode(0);
        let current = dummy;
        
        while (l1 && l2) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
        
        current.next = l1 || l2;
        return dummy.next;
    }
    
    let result = lists[0];
    
    for (let i = 1; i < lists.length; i++) {
        result = mergeTwoLists(result, lists[i]);
    }
    
    return result;
}`,
      },
      {
        language: "Python",
        explanation:
          "Sequential Merging Approach: This is the most straightforward approach where we merge lists one by one. For each iteration, we merge the result so far with the next list. Time complexity is O(kn) which is less efficient than the other approaches, but the implementation is simpler and uses only O(1) extra space.",
        code: `def mergeKListsSequential(lists):
    if not lists:
        return None
    
    def mergeTwoLists(l1, l2):
        dummy = ListNode(0)
        current = dummy
        
        while l1 and l2:
            if l1.val <= l2.val:
                current.next = l1
                l1 = l1.next
            else:
                current.next = l2
                l2 = l2.next
            current = current.next
        
        current.next = l1 or l2
        return dummy.next
    
    result = lists[0]
    
    for i in range(1, len(lists)):
        result = mergeTwoLists(result, lists[i])
    
    return result`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three approaches: divide-and-conquer (optimal with O(n log k) time), priority queue/min heap (also O(n log k) time), and sequential merging (simpler but O(kn) time). All three leverage the merging of sorted linked lists, but the first two are more efficient for large inputs.",
    tips: [
      "Divide and conquer reduces time complexity from O(kn) to O(n log k)",
      "Priority queue maintains minimum element across all lists",
      "Merge pairs of lists in each iteration for optimal performance",
      "Consider space-time trade-offs between different approaches",
    ],
    tags: ["linked-list", "divide-and-conquer", "heap", "merge-sort"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-7",
    question:
      "Add Two Numbers - Given two non-empty linked lists representing non-negative integers, add them and return sum as linked list.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem involves adding two numbers represented as linked lists. In the standard problem, the digits are stored in reverse order (least significant digit first), which simplifies the addition process since we naturally add numbers from right to left. We need to handle carrying values to the next digit when the sum exceeds 9. For the follow-up where digits are stored in forward order (most significant digit first), we need additional steps to align the numbers correctly.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Single Pass with Carry: For the standard problem where digits are stored in reverse order, we can process both lists in a single pass. We add corresponding digits plus any carry from the previous addition, then create a new node with the result modulo 10 and carry the remainder to the next addition. Time complexity is O(max(m,n)) and space complexity is O(max(m,n)) for the result list.",
        code: `function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let current = dummy;
    let carry = 0;
    
    while (l1 || l2 || carry) {
        const val1 = l1?.val || 0;
        const val2 = l2?.val || 0;
        const sum = val1 + val2 + carry;
        
        carry = Math.floor(sum / 10);
        current.next = new ListNode(sum % 10);
        current = current.next;
        
        l1 = l1?.next || null;
        l2 = l2?.next || null;
    }
    
    return dummy.next;
}`,
      },
      {
        language: "Python",
        explanation:
          "Single Pass with Carry: For the standard problem where digits are stored in reverse order, we can process both lists in a single pass. We add corresponding digits plus any carry from the previous addition, then create a new node with the result modulo 10 and carry the remainder to the next addition. Time complexity is O(max(m,n)) and space complexity is O(max(m,n)) for the result list.",
        code: `def addTwoNumbers(l1, l2):
    dummy = ListNode(0)
    current = dummy
    carry = 0
    
    while l1 or l2 or carry:
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        sum = val1 + val2 + carry
        
        carry = sum // 10
        current.next = ListNode(sum % 10)
        current = current.next
        
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    
    return dummy.next`,
      },
      {
        language: "typescript",
        explanation:
          "Forward Order Addition (Add Two Numbers II): When digits are stored in forward order (most significant digit first), we need to align the digits properly. One approach is to get the lengths of both lists, pad the shorter one with leading zeros, then use recursion to add from right to left. Time complexity remains O(max(m,n)) but with additional steps for length calculation and padding.",
        code: `function addTwoNumbersII(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    # Get lengths
    function getLength(head: ListNode | null): number {
        let length = 0;
        while (head) {
            length++;
            head = head.next;
        }
        return length;
    }
    
    const len1 = getLength(l1);
    const len2 = getLength(l2);
    
    # Pad shorter list with zeros
    if (len1 < len2) {
        for (let i = 0; i < len2 - len1; i++) {
            const newNode = new ListNode(0);
            newNode.next = l1;
            l1 = newNode;
        }
    } else if (len2 < len1) {
        for (let i = 0; i < len1 - len2; i++) {
            const newNode = new ListNode(0);
            newNode.next = l2;
            l2 = newNode;
        }
    }
    
    # Recursive addition
    function addHelper(n1: ListNode | null, n2: ListNode | null): {node: ListNode | null, carry: number} {
        if (!n1 && !n2) return {node: null, carry: 0};
        
        const {node: nextNode, carry: nextCarry} = addHelper(n1?.next || null, n2?.next || null);
        const sum = (n1?.val || 0) + (n2?.val || 0) + nextCarry;
        
        const newNode = new ListNode(sum % 10);
        newNode.next = nextNode;
        
        return {node: newNode, carry: Math.floor(sum / 10)};
    }
    
    const {node, carry} = addHelper(l1, l2);
    
    if (carry > 0) {
        const carryNode = new ListNode(carry);
        carryNode.next = node;
        return carryNode;
    }
    
    return node;
}`,
      },
      {
        language: "Python",
        explanation:
          "Forward Order Addition (Add Two Numbers II): When digits are stored in forward order (most significant digit first), we need to align the digits properly. One approach is to get the lengths of both lists, pad the shorter one with leading zeros, then use recursion to add from right to left. Time complexity remains O(max(m,n)) but with additional steps for length calculation and padding.",
        code: `def addTwoNumbersII(l1, l2):
    # Get lengths
    def getLength(head):
        length = 0
        while head:
            length += 1
            head = head.next
        return length
    
    len1 = getLength(l1)
    len2 = getLength(l2)
    
    # Pad shorter list with zeros
    if len1 < len2:
        for i in range(len2 - len1):
            newNode = ListNode(0)
            newNode.next = l1
            l1 = newNode
    elif len2 < len1:
        for i in range(len1 - len2):
            newNode = ListNode(0)
            newNode.next = l2
            l2 = newNode
    
    # Recursive addition
    def addHelper(n1, n2):
        if not n1 and not n2:
            return (None, 0)
        
        (nextNode, nextCarry) = addHelper(n1.next if n1 else None, n2.next if n2 else None)
        sum = (n1.val if n1 else 0) + (n2.val if n2 else 0) + nextCarry
        
        newNode = ListNode(sum % 10)
        newNode.next = nextNode
        
        return (newNode, sum // 10)
    
    (node, carry) = addHelper(l1, l2)
    
    if carry > 0:
        carryNode = ListNode(carry)
        carryNode.next = node
        return carryNode
    
    return node`,
      },
      {
        language: "typescript",
        explanation:
          "Alternative Approach (Using Stack): Another approach for forward-order addition is to convert both lists to stacks, which naturally processes elements in reverse order. Then pop from both stacks and add as in the standard problem. This avoids recursion but uses additional space for the stacks.",
        code: `function addTwoNumbersIIWithStack(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    # Convert lists to stacks
    stack1: number[] = []
    stack2: number[] = []
    
    while l1:
        stack1.append(l1.val)
        l1 = l1.next
    
    while l2:
        stack2.append(l2.val)
        l2 = l2.next
    
    carry = 0
    result: ListNode | None = None
    
    # Process stacks from the end (least significant digit first)
    while stack1 or stack2 or carry > 0:
        val1 = stack1.pop() if stack1 else 0
        val2 = stack2.pop() if stack2 else 0
        sum = val1 + val2 + carry
        
        # Create new node and insert at beginning of result list
        newNode = ListNode(sum % 10)
        newNode.next = result
        result = newNode
        
        carry = sum // 10
    
    return result`,
      },
      {
        language: "Python",
        explanation:
          "Alternative Approach (Using Stack): Another approach for forward-order addition is to convert both lists to stacks, which naturally processes elements in reverse order. Then pop from both stacks and add as in the standard problem. This avoids recursion but uses additional space for the stacks.",
        code: `def addTwoNumbersIIWithStack(l1, l2):
    # Convert lists to stacks
    stack1 = []
    stack2 = []
    
    while l1:
        stack1.append(l1.val)
        l1 = l1.next
    
    while l2:
        stack2.append(l2.val)
        l2 = l2.next
    
    carry = 0
    result = None
    
    # Process stacks from the end (least significant digit first)
    while stack1 or stack2 or carry > 0:
        val1 = stack1.pop() if stack1 else 0
        val2 = stack2.pop() if stack2 else 0
        sum = val1 + val2 + carry
        
        # Create new node and insert at beginning of result list
        newNode = ListNode(sum % 10)
        newNode.next = result
        result = newNode
        
        carry = sum // 10
    
    return result`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for approaches to add numbers represented as linked lists. For reverse-order digits, we use a straightforward single-pass addition with carry. For forward-order digits (Add Two Numbers II), we can either use recursion after aligning the lists or convert to stacks to process digits from the end.",
    tips: [
      "Handle different length lists by using null checks",
      "Process carry properly - continue while carry exists",
      "For reverse order: pad shorter list or use recursion",
      "Dummy node simplifies result list construction",
    ],
    tags: ["linked-list", "math", "recursion"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-8",
    question:
      "Copy List with Random Pointer - Deep copy linked list where each node has random pointer to any node or null.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "To create a deep copy of a linked list with random pointers, we need two main approaches. The hash map approach uses a map to store mappings between original nodes and their copies, requiring O(n) extra space but with simple implementation. The interweaving approach achieves O(1) space complexity by interleaving new nodes within the original list, setting their random pointers, then separating the lists.",
    codeImplementation: [
      {
        language: "typescript",
        code: `class RandomListNode {
    val: number;
    next: RandomListNode | null;
    random: RandomListNode | null;
    
    constructor(val?: number, next?: RandomListNode | null, random?: RandomListNode | null) {
        this.val = val === undefined ? 0 : val;
        this.next = next === undefined ? null : next;
        this.random = random === undefined ? null : random;
    }
}

function copyRandomList(head: RandomListNode | null): RandomListNode | null {
    if (!head) return null;
    
    const nodeMap = new Map<RandomListNode, RandomListNode>();
    
    # First pass: create all nodes
    let current = head;
    while (current) {
        nodeMap.set(current, new RandomListNode(current.val));
        current = current.next;
    }
    
    # Second pass: set next and random pointers
    current = head;
    while (current) {
        const newNode = nodeMap.get(current)!;
        newNode.next = current.next ? nodeMap.get(current.next)! : null;
        newNode.random = current.random ? nodeMap.get(current.random)! : null;
        current = current.next;
    }
    
    return nodeMap.get(head)!;
}`,
        explanation:
          "This hash map implementation stores the mapping between original nodes and their copies. In the first pass, we create all new nodes and store them in the map. In the second pass, we set both next and random pointers using the mappings from the map. This approach uses O(n) extra space for the hash map.",
      },
      {
        language: "Python",
        code: `class RandomListNode:
    def __init__(self, val=0, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random

def copyRandomList(head):
    if not head:
        return None
    
    nodeMap = {}
    
    # First pass: create all nodes
    current = head
    while current:
        nodeMap[current] = RandomListNode(current.val)
        current = current.next
    
    # Second pass: set next and random pointers
    current = head
    while current:
        newNode = nodeMap[current]
        newNode.next = nodeMap[current.next] if current.next else None
        newNode.random = nodeMap[current.random] if current.random else None
        current = current.next
    
    return nodeMap[head]`,
        explanation:
          "This hash map implementation stores the mapping between original nodes and their copies. In the first pass, we create all new nodes and store them in the map. In the second pass, we set both next and random pointers using the mappings from the map. This approach uses O(n) extra space for the hash map.",
      },
      {
        language: "typescript",
        code: `function copyRandomListOptimized(head: RandomListNode | null): RandomListNode | null {
    if (!head) return null;
    
    # Step 1: Create interweaved list A->A'->B->B'->C->C'
    let current = head;
    while (current) {
        const newNode = new RandomListNode(current.val);
        newNode.next = current.next;
        current.next = newNode;
        current = newNode.next;
    }
    
    # Step 2: Set random pointers for new nodes
    current = head;
    while (current) {
        if (current.random) {
            current.next!.random = current.random.next;
        }
        current = current.next!.next;
    }
    
    # Step 3: Separate the lists
    const dummy = new RandomListNode(0);
    let newCurrent = dummy;
    current = head;
    
    while (current) {
        const newNode = current.next!;
        current.next = newNode.next;
        newCurrent.next = newNode;
        newCurrent = newNode;
        current = current.next;
    }
    
    return dummy.next;
}`,
      },
      {
        language: "Python",
        code: `def copyRandomListOptimized(head):
    if not head:
        return None
    
    # Step 1: Create interweaved list A->A'->B->B'->C->C'
    current = head
    while current:
        newNode = RandomListNode(current.val)
        newNode.next = current.next
        current.next = newNode
        current = newNode.next
    
    # Step 2: Set random pointers for new nodes
    current = head
    while current:
        if current.random:
            current.next.random = current.random.next
        current = current.next.next
    
    # Step 3: Separate the lists
    dummy = RandomListNode(0)
    newCurrent = dummy
    current = head
    
    while current:
        newNode = current.next
        current.next = newNode.next
        newCurrent.next = newNode
        newCurrent = newNode
        current = current.next
    
    return dummy.next`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for approaches to copy a linked list with random pointers. The hash map approach uses extra space to map original nodes to their copies, while the interweaving approach achieves O(1) space complexity through careful in-place node manipulation.",
    tips: [
      "Hash map approach: two passes to create nodes then set pointers",
      "Interweaving approach saves space by using original list",
      "Handle random pointers after creating all nodes",
      "Careful pointer manipulation to avoid breaking links",
    ],
    tags: ["linked-list", "hash-table", "recursion"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
