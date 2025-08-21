import { Question } from "../../InterviewSubjects";

// Enhanced Linked List DSA Questions with comprehensive implementations
export const enhancedLinkedListQuestions: Question[] = [
  {
    id: "enhanced-linkedlist-1",
    question: "Reverse Linked List - Given the head of a singly linked list, reverse the list and return the reversed list.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// ListNode Definition
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = val === undefined ? 0 : val;
        this.next = next === undefined ? null : next;
    }
}

// Approach 1: Iterative (Optimal)
// Time: O(n), Space: O(1)
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

// Approach 2: Recursive
// Time: O(n), Space: O(n) due to call stack
function reverseListRecursive(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return head;
    
    const newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}

// Approach 3: Using Stack
// Time: O(n), Space: O(n)
function reverseListStack(head: ListNode | null): ListNode | null {
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
    tips: [
      "Three pointers: prev, current, next",
      "Iterative solution is most space efficient",
      "Recursive solution is elegant but uses call stack",
      "Remember to set last node's next to null"
    ],
    tags: ["linked-list", "recursion", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-2",
    question: "Linked List Cycle - Given head of a linked list, determine if the linked list has a cycle in it.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Floyd's Cycle Detection (Tortoise and Hare)
// Time: O(n), Space: O(1)
function hasCycle(head: ListNode | null): boolean {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next!;
        fast = fast.next.next;
        
        if (slow === fast) return true;
    }
    
    return false;
}

// Hash Set Approach
// Time: O(n), Space: O(n)
function hasCycleHashSet(head: ListNode | null): boolean {
    const visited = new Set<ListNode>();
    let current = head;
    
    while (current) {
        if (visited.has(current)) return true;
        visited.add(current);
        current = current.next;
    }
    
    return false;
}

// Find cycle start position (follow-up)
function detectCycle(head: ListNode | null): ListNode | null {
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
    tips: [
      "Floyd's algorithm uses two pointers at different speeds",
      "If there's a cycle, fast pointer will eventually meet slow pointer",
      "Hash set approach is intuitive but uses extra space",
      "Cycle start detection requires additional phase after finding cycle"
    ],
    tags: ["linked-list", "two-pointers", "hash-table"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-3",
    question: "Merge Two Sorted Lists - Merge two sorted linked lists and return it as a sorted list.",
    category: "technical",
    difficulty: "easy",
    type: "coding",
    sampleAnswer: `
// Approach 1: Iterative with Dummy Node
// Time: O(m + n), Space: O(1)
function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
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
}

// Approach 2: Recursive
// Time: O(m + n), Space: O(m + n) due to call stack
function mergeTwoListsRecursive(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    if (!list1) return list2;
    if (!list2) return list1;
    
    if (list1.val <= list2.val) {
        list1.next = mergeTwoListsRecursive(list1.next, list2);
        return list1;
    } else {
        list2.next = mergeTwoListsRecursive(list1, list2.next);
        return list2;
    }
}

// In-place merge (modifies original lists)
function mergeTwoListsInPlace(list1: ListNode | null, list2: ListNode | null): ListNode | null {
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
    tips: [
      "Dummy node simplifies edge case handling",
      "Compare values and advance pointer of smaller element",
      "Attach remaining nodes after one list is exhausted",
      "Recursive solution is elegant but uses stack space"
    ],
    tags: ["linked-list", "recursion", "two-pointers"],
    estimatedTime: 15,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-4",
    question: "Remove Nth Node From End of List - Given the head of a linked list, remove the nth node from the end and return its head.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Two Pointers (One Pass) - Optimal
// Time: O(n), Space: O(1)
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
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
}

// Two Pass Approach
// Time: O(n), Space: O(1)
function removeNthFromEndTwoPass(head: ListNode | null, n: number): ListNode | null {
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
}

// Recursive Approach
function removeNthFromEndRecursive(head: ListNode | null, n: number): ListNode | null {
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
    tips: [
      "Two pointers with n+1 gap ensures second pointer stops at node before target",
      "Dummy node handles edge case of removing head",
      "One pass is more efficient than counting then removing",
      "Consider edge cases: single node, removing head, n > length"
    ],
    tags: ["linked-list", "two-pointers"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-5",
    question: "Reorder List - Given a singly linked list L: L0→L1→…→Ln-1→Ln, reorder it to: L0→Ln→L1→Ln-1→L2→Ln-2→…",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Three Step Approach: Find Middle + Reverse + Merge
// Time: O(n), Space: O(1)
function reorderList(head: ListNode | null): void {
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
}

// Using Array (Less space efficient but clearer)
// Time: O(n), Space: O(n)
function reorderListArray(head: ListNode | null): void {
    if (!head) return;
    
    // Convert to array
    const nodes: ListNode[] = [];
    let current = head;
    
    while (current) {
        nodes.push(current);
        current = current.next;
    }
    
    // Reorder using two pointers
    let left = 0;
    let right = nodes.length - 1;
    
    while (left < right) {
        nodes[left].next = nodes[right];
        left++;
        
        if (left === right) break;
        
        nodes[right].next = nodes[left];
        right--;
    }
    
    nodes[left].next = null;
}

// Recursive approach (for understanding)
function reorderListRecursive(head: ListNode | null): void {
    if (!head || !head.next) return;
    
    // Find tail and second-to-last
    let prev: ListNode | null = null;
    let tail = head;
    
    while (tail.next) {
        prev = tail;
        tail = tail.next;
    }
    
    // Disconnect tail
    prev!.next = null;
    
    // Insert tail after head
    tail.next = head.next;
    head.next = tail;
    
    // Recursively reorder remaining list
    reorderListRecursive(tail.next);
}`,
    tips: [
      "Break problem into: find middle, reverse second half, merge",
      "Use slow/fast pointers to find middle in one pass",
      "Reverse second half in-place to save space",
      "Merge alternately: take from first, then second half"
    ],
    tags: ["linked-list", "two-pointers", "recursion"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-linkedlist-6",
    question: "Merge k Sorted Lists - You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all into one sorted linked-list.",
    category: "technical",
    difficulty: "hard",
    type: "coding",
    sampleAnswer: `
// Approach 1: Divide and Conquer (Optimal)
// Time: O(n log k), Space: O(log k) where n = total nodes, k = number of lists
function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
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
}

// Approach 2: Priority Queue (Min Heap)
// Time: O(n log k), Space: O(k)
function mergeKListsHeap(lists: (ListNode | null)[]): ListNode | null {
    // Simple priority queue implementation
    class MinHeap {
        heap: ListNode[] = [];
        
        push(node: ListNode): void {
            this.heap.push(node);
            this.bubbleUp(this.heap.length - 1);
        }
        
        pop(): ListNode | null {
            if (this.heap.length === 0) return null;
            if (this.heap.length === 1) return this.heap.pop()!;
            
            const min = this.heap[0];
            this.heap[0] = this.heap.pop()!;
            this.bubbleDown(0);
            return min;
        }
        
        private bubbleUp(index: number): void {
            while (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                if (this.heap[parentIndex].val <= this.heap[index].val) break;
                
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
        }
        
        private bubbleDown(index: number): void {
            while (true) {
                let minIndex = index;
                const leftChild = 2 * index + 1;
                const rightChild = 2 * index + 2;
                
                if (leftChild < this.heap.length && this.heap[leftChild].val < this.heap[minIndex].val) {
                    minIndex = leftChild;
                }
                
                if (rightChild < this.heap.length && this.heap[rightChild].val < this.heap[minIndex].val) {
                    minIndex = rightChild;
                }
                
                if (minIndex === index) break;
                
                [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
                index = minIndex;
            }
        }
        
        isEmpty(): boolean {
            return this.heap.length === 0;
        }
    }
    
    const heap = new MinHeap();
    
    // Add first node from each list
    for (const list of lists) {
        if (list) heap.push(list);
    }
    
    const dummy = new ListNode(0);
    let current = dummy;
    
    while (!heap.isEmpty()) {
        const node = heap.pop()!;
        current.next = node;
        current = current.next;
        
        if (node.next) {
            heap.push(node.next);
        }
    }
    
    return dummy.next;
}

// Approach 3: Sequential Merging
// Time: O(k * n), Space: O(1)
function mergeKListsSequential(lists: (ListNode | null)[]): ListNode | null {
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
    tips: [
      "Divide and conquer reduces time complexity from O(kn) to O(n log k)",
      "Priority queue maintains minimum element across all lists",
      "Merge pairs of lists in each iteration for optimal performance",
      "Consider space-time trade-offs between different approaches"
    ],
    tags: ["linked-list", "divide-and-conquer", "heap", "merge-sort"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];