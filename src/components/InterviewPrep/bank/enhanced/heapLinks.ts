// Define PracticeLink interface locally to avoid circular imports
interface PracticeLink {
  leetcode?: string;
  geeksforgeeks?: string;
  title: string;
}

// Practice links for Heap Questions
export const heapQuestionLinks: Record<string, PracticeLink> = {
  "enhanced-heap-1": {
    title: "Kth Largest Element in Array",
    leetcode: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/kth-largest-element-in-an-array/1",
  },
  "enhanced-heap-2": {
    title: "Top K Frequent Elements",
    leetcode: "https://leetcode.com/problems/top-k-frequent-elements/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
  },
  "enhanced-heap-3": {
    title: "Find Median from Data Stream",
    leetcode: "https://leetcode.com/problems/find-median-from-data-stream/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
  },
  "enhanced-heap-4": {
    title: "Merge K Sorted Lists",
    leetcode: "https://leetcode.com/problems/merge-k-sorted-lists/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
  },
  "enhanced-heap-5": {
    title: "Sliding Window Maximum",
    leetcode: "https://leetcode.com/problems/sliding-window-maximum/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k3101/1",
  },
  "enhanced-heap-6": {
    title: "Ugly Number II",
    leetcode: "https://leetcode.com/problems/ugly-number-ii/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/ugly-numbers2254/1",
  },
  "enhanced-heap-7": {
    title: "K Closest Points to Origin",
    leetcode: "https://leetcode.com/problems/k-closest-points-to-origin/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/k-closest-elements3619/1",
  },
  "enhanced-heap-8": {
    title: "Last Stone Weight",
    leetcode: "https://leetcode.com/problems/last-stone-weight/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
  },
  "enhanced-heap-9": {
    title: "Task Scheduler",
    leetcode: "https://leetcode.com/problems/task-scheduler/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/task-scheduler/1",
  },
  "enhanced-heap-10": {
    title: "Minimum Cost to Connect Sticks",
    leetcode: "https://leetcode.com/problems/minimum-cost-to-connect-sticks/",
    geeksforgeeks:
      "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
  },
};
