import { Question } from "../../InterviewSubjects";

// Enhanced Graph DSA Questions with comprehensive implementations
export const enhancedGraphQuestions: Question[] = [
  {
    id: "enhanced-graph-1",
    question:
      "Number of Islands - Given a 2D grid map of '1's (land) and '0's (water), count the number of islands.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem can be solved using graph traversal algorithms (DFS or BFS) to find connected components in the grid. Each island is a connected component of '1's. Union-Find is another approach that can be used for more complex variations.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "DFS Approach: This solution uses depth-first search to explore each land cell and all its connected land cells, marking them as visited. Each time we find an unvisited land cell, we increment our island counter and explore the entire island. Time: O(m * n), Space: O(m * n) worst case for recursion stack",
        code: `function numIslands(grid: string[][]): number {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islands = 0;
    
    function dfs(row: number, col: number): void {
        if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === '0') {
            return;
        }
        
        grid[row][col] = '0'; // Mark as visited
        
        // Explore all 4 directions
        dfs(row + 1, col);
        dfs(row - 1, col);
        dfs(row, col + 1);
        dfs(row, col - 1);
    }
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1') {
                islands++;
                dfs(row, col);
            }
        }
    }
    
    return islands;
}`,
      },
      {
        language: "Python",
        explanation:
          "DFS Approach: This solution uses depth-first search to explore each land cell and all its connected land cells, marking them as visited. Each time we find an unvisited land cell, we increment our island counter and explore the entire island. Time: O(m * n), Space: O(m * n) worst case for recursion stack",
        code: `def numIslands(grid):
    if not grid or not grid[0]:
        return 0
    
    rows = len(grid)
    cols = len(grid[0])
    islands = 0
    
    def dfs(row, col):
        if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == '0':
            return
        
        grid[row][col] = '0' # Mark as visited
        
        # Explore all 4 directions
        dfs(row + 1, col)
        dfs(row - 1, col)
        dfs(row, col + 1)
        dfs(row, col - 1)
    
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == '1':
                islands += 1
                dfs(row, col)
    
    return islands`,
      },
      {
        language: "Java",
        explanation:
          "DFS Approach: Java implementation using Depth-First Search to explore the grid. We mark visited cells by changing their value and restore them during backtracking. Time: O(m*n), Space: O(m*n)",
        code: `public class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        
        int rows = grid.length;
        int cols = grid[0].length;
        int islands = 0;
        
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (grid[row][col] == '1') {
                    islands++;
                    dfs(grid, row, col);
                }
            }
        }
        
        return islands;
    }
    
    private void dfs(char[][] grid, int row, int col) {
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length || 
            grid[row][col] == '0') {
            return;
        }
        
        grid[row][col] = '0'; // Mark as visited
        
        // Explore all 4 directions
        dfs(grid, row + 1, col);
        dfs(grid, row - 1, col);
        dfs(grid, row, col + 1);
        dfs(grid, row, col - 1);
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "BFS Approach: This solution uses breadth-first search to explore islands level by level. Instead of using recursion, we use a queue to keep track of cells to explore. Time: O(m * n), Space: O(min(m, n)) for the queue in worst case",
        code: `function numIslandsBFS(grid: string[][]): number {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islands = 0;
    
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1') {
                islands++;
                
                const queue: [number, number][] = [[row, col]];
                grid[row][col] = '0';
                
                while (queue.length > 0) {
                    const [r, c] = queue.shift()!;
                    
                    for (const [dr, dc] of directions) {
                        const newRow = r + dr;
                        const newCol = c + dc;
                        
                        if (newRow >= 0 && newRow < rows && 
                            newCol >= 0 && newCol < cols && 
                            grid[newRow][newCol] === '1') {
                            grid[newRow][newCol] = '0';
                            queue.push([newRow, newCol]);
                        }
                    }
                }
            }
        }
    }
    
    return islands;
}`,
      },
      {
        language: "Python",
        explanation:
          "BFS Approach: This solution uses breadth-first search to explore islands level by level. Instead of using recursion, we use a queue to keep track of cells to explore. Time: O(m * n), Space: O(min(m, n)) for the queue in worst case",
        code: `from collections import deque

def numIslandsBFS(grid):
    if not grid or not grid[0]:
        return 0
    
    rows = len(grid)
    cols = len(grid[0])
    islands = 0
    
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == '1':
                islands += 1
                
                queue = deque([(row, col)])
                grid[row][col] = '0'
                
                while queue:
                    r, c = queue.popleft()
                    
                    for dr, dc in directions:
                        new_row = r + dr
                        new_col = c + dc
                        
                        if (0 <= new_row < rows and 
                            0 <= new_col < cols and 
                            grid[new_row][new_col] == '1'):
                            grid[new_row][new_col] = '0'
                            queue.append((new_row, new_col))
    
    return islands`,
      },
      {
        language: "typescript",
        explanation:
          "Union-Find Approach: This solution uses the disjoint set (Union-Find) data structure to keep track of connected components. We initialize each land cell as its own set, then merge sets when adjacent cells are both land. Time: O(m * n), Space: O(m * n)",
        code: `class UnionFind {
    parent: number[];
    rank: number[];
    count: number;
    
    constructor(n: number) {
        this.parent = Array(n).fill(0).map((_, i) => i);
        this.rank = Array(n).fill(1);
        this.count = 0;
    }
    
    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }
    
    union(x: number, y: number): void {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX !== rootY) {
            if (this.rank[rootX] < this.rank[rootY]) {
                this.parent[rootX] = rootY;
            } else if (this.rank[rootX] > this.rank[rootY]) {
                this.parent[rootY] = rootX;
            } else {
                this.parent[rootY] = rootX;
                this.rank[rootX]++;
            }
            this.count--;
        }
    }
}

function numIslandsUnionFind(grid: string[][]): number {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    const uf = new UnionFind(rows * cols);
    
    // Count initial islands
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === '1') {
                uf.count++;
            }
        }
    }
    
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === '1') {
                for (const [di, dj] of directions) {
                    const ni = i + di;
                    const nj = j + dj;
                    
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] === '1') {
                        uf.union(i * cols + j, ni * cols + nj);
                    }
                }
            }
        }
    }
    
    return uf.count;
}`,
      },
      {
        language: "java",
        explanation:
          "Union-Find Approach: Java implementation using disjoint set data structure to track connected components. We initialize each land cell as its own set and merge adjacent land cells. Time: O(m * n), Space: O(m * n)",
        code: `class UnionFind {
    private int[] parent;
    private int[] rank;
    private int count;
    
    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        count = 0;
        
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            rank[i] = 1;
        }
    }
    
    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // Path compression
        }
        return parent[x];
    }
    
    public void union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX != rootY) {
            if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX;
            } else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }
            count--;
        }
    }
    
    public void incrementCount() {
        count++;
    }
    
    public int getCount() {
        return count;
    }
}

public class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        
        int rows = grid.length;
        int cols = grid[0].length;
        UnionFind uf = new UnionFind(rows * cols);
        
        // Count initial islands
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == '1') {
                    uf.incrementCount();
                }
            }
        }
        
        int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == '1') {
                    for (int[] dir : directions) {
                        int ni = i + dir[0];
                        int nj = j + dir[1];
                        
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] == '1') {
                            uf.union(i * cols + j, ni * cols + nj);
                        }
                    }
                }
            }
        }
        
        return uf.getCount();
    }
}`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "DFS naturally explores connected components",
      "Mark visited cells to avoid revisiting",
      "BFS uses queue instead of recursion stack",
      "Union-Find tracks connected components efficiently",
    ],
    tags: ["graph", "dfs", "bfs", "matrix", "union-find"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-2",
    question:
      "Course Schedule - Given numCourses and prerequisites array, return true if you can finish all courses.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem is a cycle detection problem in a directed graph. If there's a cycle, it means some courses have circular dependencies and cannot be completed. We can use either DFS cycle detection or Kahn's algorithm (topological sorting) to solve it.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "DFS Cycle Detection: This approach uses depth-first search with three states (unvisited, visiting, visited) to detect cycles in the directed graph. If we encounter a node that's already in the 'visiting' state, we've found a cycle. Time: O(V + E), Space: O(V + E)",
        code: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
    // Build adjacency list
    const graph = Array(numCourses).fill(null).map(() => [] as number[]);
    
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
    }
    
    // 0: unvisited, 1: visiting, 2: visited
    const state = new Array(numCourses).fill(0);
    
    function hasCycle(course: number): boolean {
        if (state[course] === 1) return true;  // Back edge found, cycle detected
        if (state[course] === 2) return false; // Already processed
        
        state[course] = 1; // Mark as visiting
        
        for (const nextCourse of graph[course]) {
            if (hasCycle(nextCourse)) return true;
        }
        
        state[course] = 2; // Mark as visited
        return false;
    }
    
    for (let i = 0; i < numCourses; i++) {
        if (state[i] === 0 && hasCycle(i)) {
            return false;
        }
    }
    
    return true;
}`,
      },
      {
        language: "Python",
        explanation:
          "DFS Cycle Detection: This approach uses depth-first search with three states (unvisited, visiting, visited) to detect cycles in the directed graph. If we encounter a node that's already in the 'visiting' state, we've found a cycle. Time: O(V + E), Space: O(V + E)",
        code: `def canFinish(numCourses, prerequisites):
    # Build adjacency list
    graph = [[] for _ in range(numCourses)]
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
    
    # 0: unvisited, 1: visiting, 2: visited
    state = [0] * numCourses
    
    def hasCycle(course):
        if state[course] == 1:
            return True  # Back edge found, cycle detected
        if state[course] == 2:
            return False  # Already processed
        
        state[course] = 1  # Mark as visiting
        
        for nextCourse in graph[course]:
            if hasCycle(nextCourse):
                return True
        
        state[course] = 2  # Mark as visited
        return False
    
    for i in range(numCourses):
        if state[i] == 0 and hasCycle(i):
            return False
    
    return True`,
      },
      {
        language: "typescript",
        explanation:
          "Kahn's Algorithm (Topological Sort): This approach uses breadth-first search to perform a topological sort of the graph. We start with nodes that have no dependencies, and progressively remove them from the graph. If there's a cycle, we won't be able to process all courses. Time: O(V + E), Space: O(V + E)",
        code: `function canFinishKahn(numCourses: number, prerequisites: number[][]): boolean {
    const graph = Array(numCourses).fill(null).map(() => [] as number[]);
    const indegree = new Array(numCourses).fill(0);
    
    // Build graph and calculate indegrees
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        indegree[course]++;
    }
    
    // Find courses with no prerequisites
    const queue: number[] = [];
    for (let i = 0; i < numCourses; i++) {
        if (indegree[i] === 0) {
            queue.push(i);
        }
    }
    
    let processedCourses = 0;
    
    while (queue.length > 0) {
        const course = queue.shift()!;
        processedCourses++;
        
        for (const nextCourse of graph[course]) {
            indegree[nextCourse]--;
            if (indegree[nextCourse] === 0) {
                queue.push(nextCourse);
            }
        }
    }
    
    return processedCourses === numCourses;
}`,
      },
      {
        language: "Python",
        explanation:
          "Kahn's Algorithm (Topological Sort): This approach uses breadth-first search to perform a topological sort of the graph. We start with nodes that have no dependencies, and progressively remove them from the graph. If there's a cycle, we won't be able to process all courses. Time: O(V + E), Space: O(V + E)",
        code: `from collections import deque

def canFinishKahn(numCourses, prerequisites):
    graph = [[] for _ in range(numCourses)]
    indegree = [0] * numCourses
    
    # Build graph and calculate indegrees
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        indegree[course] += 1
    
    # Find courses with no prerequisites
    queue = deque()
    for i in range(numCourses):
        if indegree[i] == 0:
            queue.append(i)
    
    processed_courses = 0
    
    while queue:
        course = queue.popleft()
        processed_courses += 1
        
        for next_course in graph[course]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0:
                queue.append(next_course)
    
    return processed_courses == numCourses`,
      },
    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Problem reduces to cycle detection in directed graph",
      "DFS with three states: unvisited, visiting, visited",
      "Kahn's algorithm uses indegree counting",
      "Both approaches detect if topological ordering exists",
    ],
    tags: ["graph", "dfs", "bfs", "topological-sort"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-3",
    question:
      "Course Schedule II - Return the ordering of courses you should take to finish all courses. If impossible, return empty array.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem extends Course Schedule I by requiring the actual ordering of courses. We need to perform topological sorting on the directed graph. There are two main approaches: Kahn's algorithm (BFS) and DFS with post-order traversal.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Kahn's Algorithm (Topological Sort): This approach uses BFS starting with courses that have no prerequisites. As we process each course, we reduce the indegree of its dependent courses. If we can process all courses, we have a valid ordering. Time: O(V + E), Space: O(V + E)",
        code: `function findOrder(numCourses: number, prerequisites: number[][]): number[] {
    const graph = Array(numCourses).fill(null).map(() => [] as number[]);
    const indegree = new Array(numCourses).fill(0);
    
    // Build graph
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        indegree[course]++;
    }
    
    // Find starting courses (no prerequisites)
    const queue: number[] = [];
    for (let i = 0; i < numCourses; i++) {
        if (indegree[i] === 0) {
            queue.push(i);
        }
    }
    
    const order: number[] = [];
    
    while (queue.length > 0) {
        const course = queue.shift()!;
        order.push(course);
        
        for (const nextCourse of graph[course]) {
            indegree[nextCourse]--;
            if (indegree[nextCourse] === 0) {
                queue.push(nextCourse);
            }
        }
    }
    
    return order.length === numCourses ? order : [];
}`,
      },
      {
        language: "Python",
        explanation:
          "Kahn's Algorithm (Topological Sort): This approach uses BFS starting with courses that have no prerequisites. As we process each course, we reduce the indegree of its dependent courses. If we can process all courses, we have a valid ordering. Time: O(V + E), Space: O(V + E)",
        code: `import java.util.*;

public class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        int[] indegree = new int[numCourses];
        
        // Initialize graph
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }
        
        // Build graph and calculate indegrees
        for (int[] prereq : prerequisites) {
            graph.get(prereq[1]).add(prereq[0]);
            indegree[prereq[0]]++;
        }
        
        // Find courses with no prerequisites
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                queue.offer(i);
            }
        }
        
        int processedCourses = 0;
        
        while (!queue.isEmpty()) {
            int course = queue.poll();
            processedCourses++;
            
            for (int nextCourse : graph.get(course)) {
                indegree[nextCourse]--;
                if (indegree[nextCourse] == 0) {
                    queue.offer(nextCourse);
                }
            }
        }
        
        return processedCourses == numCourses;
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "DFS Approach with Post-order: This approach uses DFS with cycle detection. We add courses to the order after processing all their prerequisites (post-order). Since we process prerequisites first, we need to reverse the final order. Time: O(V + E), Space: O(V + E)",
        code: `function findOrderDFS(numCourses: number, prerequisites: number[][]): number[] {
    const graph = Array(numCourses).fill(null).map(() => [] as number[]);
    
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
    }
    
    const state = new Array(numCourses).fill(0); // 0: unvisited, 1: visiting, 2: visited
    const order: number[] = [];
    
    function dfs(course: number): boolean {
        if (state[course] === 1) return false; // Cycle detected
        if (state[course] === 2) return true;  // Already processed
        
        state[course] = 1; // Mark as visiting
        
        for (const nextCourse of graph[course]) {
            if (!dfs(nextCourse)) return false;
        }
        
        state[course] = 2; // Mark as visited
        order.push(course); // Add to order after processing dependencies
        
        return true;
    }
    
    for (let i = 0; i < numCourses; i++) {
        if (state[i] === 0 && !dfs(i)) {
            return [];
        }
    }
    
    return order.reverse(); // Reverse post-order to get topological order
}`,
      },
      {
        language: "Python",
        explanation:
          "DFS Approach with Post-order: This approach uses DFS with cycle detection. We add courses to the order after processing all their prerequisites (post-order). Since we process prerequisites first, we need to reverse the final order. Time: O(V + E), Space: O(V + E)",
        code: `def findOrderDFS(numCourses, prerequisites):
    graph = [[] for _ in range(numCourses)]
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
    
    state = [0] * numCourses  # 0: unvisited, 1: visiting, 2: visited
    order = []
    
    def dfs(course):
        if state[course] == 1:
            return False  # Cycle detected
        if state[course] == 2:
            return True   # Already processed
        
        state[course] = 1  # Mark as visiting
        
        for next_course in graph[course]:
            if not dfs(next_course):
                return False
        
        state[course] = 2  # Mark as visited
        order.append(course)  # Add to order after processing dependencies
        
        return True
    
    for i in range(numCourses):
        if state[i] == 0 and not dfs(i):
            return []
    
    return order[::-1]  # Reverse post-order to get topological order`,
      },

    ],
    sampleAnswer: `See the code implementations tab for different approaches to solve this problem.`,
    tips: [
      "Extension of Course Schedule I that returns actual ordering",
      "Kahn's algorithm naturally produces topological order",
      "DFS approach needs to reverse post-order traversal",
      "Return empty array if cycle detected (impossible to complete)",
    ],
    tags: ["graph", "topological-sort", "dfs", "bfs"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-4",
    question:
      "Clone Graph - Given a reference of a node in a connected undirected graph, return a deep copy of the graph.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem requires creating a deep copy of a graph. The key challenge is to correctly handle cycles in the graph. We need to track which nodes have already been cloned to avoid infinite recursion. Two common approaches are DFS and BFS, both using a hash map to track already cloned nodes.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "DFS with HashMap Approach: We first define a GraphNode class, then use depth-first search to traverse the original graph. For each node, we check if we've already cloned it using a HashMap. If not, we create a new node, store it in our map, then recursively clone all its neighbors. Time complexity is O(V+E) where V is the number of vertices and E is the number of edges. Space complexity is O(V) for the HashMap and recursion stack.",
        code: `// Graph Node Definition
class GraphNode {
    val: number;
    neighbors: GraphNode[];
    
    constructor(val?: number, neighbors?: GraphNode[]) {
        this.val = val === undefined ? 0 : val;
        this.neighbors = neighbors === undefined ? [] : neighbors;
    }
}

function cloneGraph(node: GraphNode | null): GraphNode | null {
    if (!node) return null;
    
    const cloned = new Map<GraphNode, GraphNode>();
    
    function dfs(original: GraphNode): GraphNode {
        if (cloned.has(original)) {
            return cloned.get(original)!;
        }
        
        const clone = new GraphNode(original.val);
        cloned.set(original, clone);
        
        for (const neighbor of original.neighbors) {
            clone.neighbors.push(dfs(neighbor));
        }
        
        return clone;
    }
    
    return dfs(node);
}`,
      },
      {
        language: "Python",
        explanation:
          "DFS with HashMap Approach: We first define a GraphNode class, then use depth-first search to traverse the original graph. For each node, we check if we've already cloned it using a HashMap. If not, we create a new node, store it in our map, then recursively clone all its neighbors. Time complexity is O(V+E) where V is the number of vertices and E is the number of edges. Space complexity is O(V) for the HashMap and recursion stack.",
        code: `# Graph Node Definition
class GraphNode:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def cloneGraph(node):
    if not node:
        return None
    
    cloned = {}
    
    def dfs(original):
        if original in cloned:
            return cloned[original]
        
        clone = GraphNode(original.val)
        cloned[original] = clone
        
        for neighbor in original.neighbors:
            clone.neighbors.append(dfs(neighbor))
        
        return clone
    
    return dfs(node)`,
      },

      {
        language: "typescript",
        explanation:
          "BFS with HashMap Approach: We use breadth-first search with a queue to iterate through the nodes. We create the clones first, then process the neighbors in a level-by-level fashion. This is more iterative and uses less stack space than the DFS solution. Time complexity remains O(V+E) and space complexity is O(V).",
        code: `function cloneGraphBFS(node: GraphNode | null): GraphNode | null {
    if (!node) return null;
    
    const cloned = new Map<GraphNode, GraphNode>();
    const queue: GraphNode[] = [node];
    
    // Clone the starting node
    cloned.set(node, new GraphNode(node.val));
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        
        for (const neighbor of current.neighbors) {
            if (!cloned.has(neighbor)) {
                cloned.set(neighbor, new GraphNode(neighbor.val));
                queue.push(neighbor);
            }
            
            cloned.get(current)!.neighbors.push(cloned.get(neighbor)!);
        }
    }
    
    return cloned.get(node)!;
}`,
      },
      {
        language: "Python",
        explanation:
          "BFS with HashMap Approach: We use breadth-first search with a queue to iterate through the nodes. We create the clones first, then process the neighbors in a level-by-level fashion. This is more iterative and uses less stack space than the DFS solution. Time complexity remains O(V+E) and space complexity is O(V).",
        code: `from collections import deque

def cloneGraphBFS(node):
    if not node:
        return None
    
    cloned = {}
    queue = deque([node])
    
    # Clone the starting node
    cloned[node] = GraphNode(node.val)
    
    while queue:
        current = queue.popleft()
        
        for neighbor in current.neighbors:
            if neighbor not in cloned:
                cloned[neighbor] = GraphNode(neighbor.val)
                queue.append(neighbor)
            
            cloned[current].neighbors.append(cloned[neighbor])
    
    return cloned[node]`,
      },

      {
        language: "typescript",
        explanation:
          "Value-Based HashMap Approach: If node values are unique, we can use node values as HashMap keys instead of node references. This makes the implementation simpler in some cases. Time and space complexity remain O(V+E) and O(V) respectively.",
        code: `function cloneGraphByValue(node: GraphNode | null): GraphNode | null {
    if (!node) return null;
    
    const cloned = new Map<number, GraphNode>();
    
    function dfs(original: GraphNode): GraphNode {
        if (cloned.has(original.val)) {
            return cloned.get(original.val)!;
        }
        
        const clone = new GraphNode(original.val);
        cloned.set(original.val, clone);
        
        for (const neighbor of original.neighbors) {
            clone.neighbors.push(dfs(neighbor));
        }
        
        return clone;
    }
    
    return dfs(node);
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for detailed solutions using both DFS and BFS approaches. The key is to use a HashMap to track already cloned nodes to handle cycles in the graph.",
    tips: [
      "Use hash map to track original → clone mapping",
      "Avoid infinite loops by checking if node already cloned",
      "DFS and BFS both work, DFS is more intuitive",
      "Clone node first, then clone and connect neighbors",
    ],
    tags: ["graph", "dfs", "bfs", "hash-table"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-5",
    question:
      "Pacific Atlantic Water Flow - Given heights matrix, find all cells where water can flow to both Pacific and Atlantic oceans.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem requires finding cells from which water can flow to both the Pacific and Atlantic oceans. Instead of checking each cell by tracing paths to oceans, we can reverse the problem: start from the ocean borders and track cells where water can flow from the ocean (or equivalently, where water can flow to the ocean from the cell). We run two separate traversals (one for each ocean) and then find the intersection.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "DFS from Ocean Borders Approach: We perform two separate DFS, starting from Pacific and Atlantic border cells. Instead of flowing down, we flow up (to cells with height >= current). Any cell reachable from both oceans is part of our answer. Time complexity is O(m*n) where m and n are the dimensions of the matrix. Space complexity is O(m*n) for the visited arrays.",
        code: `function pacificAtlantic(heights: number[][]): number[][] {
    if (!heights || heights.length === 0) return [];
    
    const rows = heights.length;
    const cols = heights[0].length;
    
    const pacificReachable = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const atlanticReachable = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    function dfs(row: number, col: number, reachable: boolean[][], prevHeight: number): void {
        if (row < 0 || row >= rows || col < 0 || col >= cols || 
            reachable[row][col] || heights[row][col] < prevHeight) {
            return;
        }
        
        reachable[row][col] = true;
        
        for (const [dr, dc] of directions) {
            dfs(row + dr, col + dc, reachable, heights[row][col]);
        }
    }
    
    // Start DFS from Pacific borders (top and left)
    for (let i = 0; i < rows; i++) {
        dfs(i, 0, pacificReachable, heights[i][0]);
        dfs(i, cols - 1, atlanticReachable, heights[i][cols - 1]);
    }
    
    for (let j = 0; j < cols; j++) {
        dfs(0, j, pacificReachable, heights[0][j]);
        dfs(rows - 1, j, atlanticReachable, heights[rows - 1][j]);
    }
    
    // Find cells reachable by both oceans
    const result: number[][] = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (pacificReachable[i][j] && atlanticReachable[i][j]) {
                result.push([i, j]);
            }
        }
    }
    
    return result;
}`,
      },
      {
        language: "Python",
        explanation:
          "DFS from Ocean Borders Approach: We perform two separate DFS, starting from Pacific and Atlantic border cells. Instead of flowing down, we flow up (to cells with height >= current). Any cell reachable from both oceans is part of our answer. Time complexity is O(m*n) where m and n are the dimensions of the matrix. Space complexity is O(m*n) for the visited arrays.",
        code: `def pacificAtlantic(heights):
    if not heights or not heights[0]:
        return []
    
    rows = len(heights)
    cols = len(heights[0])
    
    pacific_reachable = [[False] * cols for _ in range(rows)]
    atlantic_reachable = [[False] * cols for _ in range(rows)]
    
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    
    def dfs(row, col, reachable, prev_height):
        if (row < 0 or row >= rows or col < 0 or col >= cols or 
            reachable[row][col] or heights[row][col] < prev_height):
            return
        
        reachable[row][col] = True
        
        for dr, dc in directions:
            dfs(row + dr, col + dc, reachable, heights[row][col])
    
    # Start DFS from Pacific borders (top and left)
    for i in range(rows):
        dfs(i, 0, pacific_reachable, heights[i][0])
        dfs(i, cols - 1, atlantic_reachable, heights[i][cols - 1])
    
    for j in range(cols):
        dfs(0, j, pacific_reachable, heights[0][j])
        dfs(rows - 1, j, atlantic_reachable, heights[rows - 1][j])
    
    # Find cells reachable by both oceans
    result = []
    for i in range(rows):
        for j in range(cols):
            if pacific_reachable[i][j] and atlantic_reachable[i][j]:
                result.append([i, j])
    
    return result`,
      },
      {
        language: "Python",
        explanation:
          "DFS from Ocean Borders Approach: We perform two separate DFS, starting from Pacific and Atlantic border cells. Instead of flowing down, we flow up (to cells with height >= current). Any cell reachable from both oceans is part of our answer. Time complexity is O(m*n) where m and n are the dimensions of the matrix. Space complexity is O(m*n) for the visited arrays.",
        code: `import java.util.*;

public class Solution {
    private int[][] heights;
    private int rows, cols;
    private int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    
    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        if (heights == null || heights.length == 0) return new ArrayList<>();
        
        this.heights = heights;
        this.rows = heights.length;
        this.cols = heights[0].length;
        
        boolean[][] pacificReachable = new boolean[rows][cols];
        boolean[][] atlanticReachable = new boolean[rows][cols];
        
        // Start DFS from Pacific borders (top and left)
        for (int i = 0; i < rows; i++) {
            dfs(i, 0, pacificReachable, heights[i][0]);
            dfs(i, cols - 1, atlanticReachable, heights[i][cols - 1]);
        }
        
        for (int j = 0; j < cols; j++) {
            dfs(0, j, pacificReachable, heights[0][j]);
            dfs(rows - 1, j, atlanticReachable, heights[rows - 1][j]);
        }
        
        // Find cells reachable by both oceans
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (pacificReachable[i][j] && atlanticReachable[i][j]) {
                    result.add(Arrays.asList(i, j));
                }
            }
        }
        
        return result;
    }
    
    private void dfs(int row, int col, boolean[][] reachable, int prevHeight) {
        if (row < 0 || row >= rows || col < 0 || col >= cols || 
            reachable[row][col] || heights[row][col] < prevHeight) {
            return;
        }
        
        reachable[row][col] = true;
        
        for (int[] dir : directions) {
            dfs(row + dir[0], col + dir[1], reachable, heights[row][col]);
        }
    }
}`,
      },
      {
        language: "typescript",
        explanation:
          "BFS Alternative: Instead of DFS, we use BFS starting from the ocean borders. We process cells level by level, marking them as reachable by each ocean. This approach is less likely to cause stack overflow for large matrices. Time and space complexity remain O(m*n).",
        code: `function pacificAtlanticBFS(heights: number[][]): number[][] {
    if (!heights || heights.length === 0) return [];
    
    const rows = heights.length;
    const cols = heights[0].length;
    
    const pacificQueue: [number, number][] = [];
    const atlanticQueue: [number, number][] = [];
    const pacificReachable = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const atlanticReachable = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    // Initialize border cells
    for (let i = 0; i < rows; i++) {
        pacificQueue.push([i, 0]);
        atlanticQueue.push([i, cols - 1]);
        pacificReachable[i][0] = true;
        atlanticReachable[i][cols - 1] = true;
    }
    
    for (let j = 0; j < cols; j++) {
        pacificQueue.push([0, j]);
        atlanticQueue.push([rows - 1, j]);
        pacificReachable[0][j] = true;
        atlanticReachable[rows - 1][j] = true;
    }
    
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    function bfs(queue: [number, number][], reachable: boolean[][]): void {
        while (queue.length > 0) {
            const [row, col] = queue.shift()!;
            
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
                    !reachable[newRow][newCol] && heights[newRow][newCol] >= heights[row][col]) {
                    reachable[newRow][newCol] = true;
                    queue.push([newRow, newCol]);
                }
            }
        }
    }
    
    bfs(pacificQueue, pacificReachable);
    bfs(atlanticQueue, atlanticReachable);
    
    const result: number[][] = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (pacificReachable[i][j] && atlanticReachable[i][j]) {
                result.push([i, j]);
            }
        }
    }
    
    return result;
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for detailed solutions using both DFS and BFS approaches. The key insight is to start from the ocean borders and work inward, marking cells that can reach each ocean.",
    tips: [
      "Reverse thinking: start from ocean borders and flow inward",
      "Water flows from higher to lower or equal height",
      "Two separate DFS/BFS: one for each ocean",
      "Result is intersection of both reachable sets",
    ],
    tags: ["graph", "dfs", "bfs", "matrix"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-6",
    question:
      "Network Delay Time - Given a network of n nodes and times array representing signal travel times, find minimum time for signal to reach all nodes from node k.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "This problem is a classic single-source shortest path problem. We need to find the time it takes for a signal to reach all nodes from a source node k, which is the maximum of all shortest paths from k to every other node. If any node is unreachable, we return -1. There are several algorithms we can use, including Dijkstra's algorithm, Bellman-Ford, and Floyd-Warshall.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Dijkstra's Algorithm: This is the most efficient approach for graphs with non-negative weights. We use a priority queue (simulated here with a sorted array) to always process the node with the shortest distance next. Time complexity is O((V+E)logV) where V is the number of vertices and E is the number of edges. Space complexity is O(V+E) for the adjacency list and distances map.",
        code: `function networkDelayTime(times: number[][], n: number, k: number): number {
    // Build adjacency list
    const graph = new Map<number, [number, number][]>();
    
    for (const [u, v, w] of times) {
        if (!graph.has(u)) graph.set(u, []);
        graph.get(u)!.push([v, w]);
    }
    
    // Min heap: [distance, node]
    const pq: [number, number][] = [[0, k]];
    const distances = new Map<number, number>();
    
    while (pq.length > 0) {
        // Extract minimum distance node
        pq.sort((a, b) => a[0] - b[0]);
        const [dist, node] = pq.shift()!;
        
        if (distances.has(node)) continue;
        
        distances.set(node, dist);
        
        // Relax neighbors
        if (graph.has(node)) {
            for (const [neighbor, weight] of graph.get(node)!) {
                if (!distances.has(neighbor)) {
                    pq.push([dist + weight, neighbor]);
                }
            }
        }
    }
    
    if (distances.size !== n) return -1;
    
    return Math.max(...Array.from(distances.values()));
}`,
      },
      {
        language: "Python",
        explanation:
          "Dijkstra's Algorithm: This is the most efficient approach for graphs with non-negative weights. We use a priority queue (simulated here with a sorted array) to always process the node with the shortest distance next. Time complexity is O((V+E)logV) where V is the number of vertices and E is the number of edges. Space complexity is O(V+E) for the adjacency list and distances map.",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Bellman-Ford Algorithm: This algorithm can handle graphs with negative edge weights (though not negative cycles). It's generally slower than Dijkstra's but more versatile. Time complexity is O(V*E) which is worse than Dijkstra's, but it can handle negative weights. Space complexity is O(V).",
        code: `function networkDelayTimeBellmanFord(times: number[][], n: number, k: number): number {
    const distances = new Array(n + 1).fill(Infinity);
    distances[k] = 0;
    
    // Relax edges n-1 times
    for (let i = 0; i < n - 1; i++) {
        for (const [u, v, w] of times) {
            if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
                distances[v] = distances[u] + w;
            }
        }
    }
    
    let maxTime = 0;
    for (let i = 1; i <= n; i++) {
        if (distances[i] === Infinity) return -1;
        maxTime = Math.max(maxTime, distances[i]);
    }
    
    return maxTime;
}`,
      },
      {
        language: "Python",
        explanation:
          "Bellman-Ford Algorithm: This algorithm can handle graphs with negative edge weights (though not negative cycles). It's generally slower than Dijkstra's but more versatile. Time complexity is O(V*E) which is worse than Dijkstra's, but it can handle negative weights. Space complexity is O(V).",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Floyd-Warshall Algorithm: This is an all-pairs shortest path algorithm, which finds the shortest paths between all pairs of nodes. It's overkill for this problem since we only need paths from a single source, but it's a good approach to know. Time complexity is O(V³) and space complexity is O(V²).",
        code: `function networkDelayTimeFloyd(times: number[][], n: number, k: number): number {
    const dist = Array(n + 1).fill(null).map(() => Array(n + 1).fill(Infinity));
    
    // Initialize distances
    for (let i = 1; i <= n; i++) {
        dist[i][i] = 0;
    }
    
    for (const [u, v, w] of times) {
        dist[u][v] = w;
    }
    
    // Floyd-Warshall
    for (let k = 1; k <= n; k++) {
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    
    let maxTime = 0;
    for (let i = 1; i <= n; i++) {
        if (dist[k][i] === Infinity) return -1;
        maxTime = Math.max(maxTime, dist[k][i]);
    }
    
    return maxTime;
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for three different approaches: Dijkstra's algorithm (most efficient for non-negative weights), Bellman-Ford (can handle negative weights), and Floyd-Warshall (finds all-pairs shortest paths).",
    tips: [
      "Single-source shortest path problem → Dijkstra's algorithm",
      "Use priority queue to always process closest unvisited node",
      "Track distances to all nodes, return maximum distance",
      "Return -1 if any node is unreachable",
    ],
    tags: ["graph", "dijkstra", "shortest-path", "heap"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-7",
    question:
      "Word Ladder - Given two words beginWord and endWord, and a dictionary wordList, return the length of shortest transformation sequence.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "This problem can be modeled as a shortest path problem on an implicit graph. Each word is a node, and two words have an edge between them if they differ by exactly one character. We need to find the shortest path from beginWord to endWord, where each step transforms one character while maintaining a valid word. Breadth-First Search (BFS) is ideal for finding the shortest path in an unweighted graph.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Standard BFS Approach: We use BFS to find the shortest path by exploring all possible one-character changes at each step. We track the level (or distance) as we go. Time complexity is O(M²*N) where M is the word length and N is the number of words in the word list. Space complexity is O(M*N).",
        code: `function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
    const wordSet = new Set(wordList);
    if (!wordSet.has(endWord)) return 0;
    
    const queue: [string, number][] = [[beginWord, 1]];
    const visited = new Set<string>([beginWord]);
    
    while (queue.length > 0) {
        const [word, level] = queue.shift()!;
        
        if (word === endWord) return level;
        
        // Try all possible one-character changes
        for (let i = 0; i < word.length; i++) {
            for (let c = 97; c <= 122; c++) { // 'a' to 'z'
                const char = String.fromCharCode(c);
                if (char === word[i]) continue;
                
                const newWord = word.slice(0, i) + char + word.slice(i + 1);
                
                if (wordSet.has(newWord) && !visited.has(newWord)) {
                    visited.add(newWord);
                    queue.push([newWord, level + 1]);
                }
            }
        }
    }
    
    return 0;
}`,
      },
      {
        language: "Python",
        explanation:
          "Standard BFS Approach: We use BFS to find the shortest path by exploring all possible one-character changes at each step. We track the level (or distance) as we go. Time complexity is O(M²*N) where M is the word length and N is the number of words in the word list. Space complexity is O(M*N).",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Bidirectional BFS: This approach runs BFS from both beginWord and endWord simultaneously, which can significantly reduce the search space. We stop when the two searches meet in the middle. Time complexity remains O(M²*N) but with a much better average case performance. Space complexity is still O(M*N).",
        code: `function ladderLengthBidirectional(beginWord: string, endWord: string, wordList: string[]): number {
    const wordSet = new Set(wordList);
    if (!wordSet.has(endWord)) return 0;
    
    let beginSet = new Set([beginWord]);
    let endSet = new Set([endWord]);
    let level = 1;
    
    while (beginSet.size > 0 && endSet.size > 0) {
        // Always expand the smaller set
        if (beginSet.size > endSet.size) {
            [beginSet, endSet] = [endSet, beginSet];
        }
        
        const nextSet = new Set<string>();
        
        for (const word of beginSet) {
            for (let i = 0; i < word.length; i++) {
                for (let c = 97; c <= 122; c++) {
                    const char = String.fromCharCode(c);
                    if (char === word[i]) continue;
                    
                    const newWord = word.slice(0, i) + char + word.slice(i + 1);
                    
                    if (endSet.has(newWord)) {
                        return level + 1;
                    }
                    
                    if (wordSet.has(newWord)) {
                        nextSet.add(newWord);
                        wordSet.delete(newWord); // Mark as visited
                    }
                }
            }
        }
        
        beginSet = nextSet;
        level++;
    }
    
    return 0;
}`,
      },
      {
        language: "Python",
        explanation:
          "Bidirectional BFS: This approach runs BFS from both beginWord and endWord simultaneously, which can significantly reduce the search space. We stop when the two searches meet in the middle. Time complexity remains O(M²*N) but with a much better average case performance. Space complexity is still O(M*N).",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Explicit Graph BFS: In this approach, we first build the graph explicitly by connecting all words that differ by exactly one character, then perform BFS. This can be faster when the word list is small and word length is long. Time complexity for graph building is O(N²*M) and BFS is O(N+E) where E is the number of edges.",
        code: `function ladderLengthGraph(beginWord: string, endWord: string, wordList: string[]): number {
    if (!wordList.includes(endWord)) return 0;
    
    const words = [beginWord, ...wordList];
    const graph = new Map<string, string[]>();
    
    // Build adjacency list
    for (const word of words) {
        graph.set(word, []);
    }
    
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
            if (isOneCharDiff(words[i], words[j])) {
                graph.get(words[i])!.push(words[j]);
                graph.get(words[j])!.push(words[i]);
            }
        }
    }
    
    // BFS
    const queue: [string, number][] = [[beginWord, 1]];
    const visited = new Set([beginWord]);
    
    while (queue.length > 0) {
        const [word, level] = queue.shift()!;
        
        if (word === endWord) return level;
        
        for (const neighbor of graph.get(word) || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, level + 1]);
            }
        }
    }
    
    return 0;
}

function isOneCharDiff(word1: string, word2: string): boolean {
    if (word1.length !== word2.length) return false;
    
    let diffCount = 0;
    for (let i = 0; i < word1.length; i++) {
        if (word1[i] !== word2[i]) {
            diffCount++;
            if (diffCount > 1) return false;
        }
    }
    
    return diffCount === 1;
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for detailed solutions using standard BFS, bidirectional BFS, and explicit graph building approaches. The key is to use a HashMap to track already cloned nodes to handle cycles in the graph.",
    tips: [
      "BFS finds shortest path in unweighted graph",
      "Generate neighbors by changing each character",
      "Use set for O(1) word lookups",
      "Bidirectional BFS can be more efficient for large graphs",
    ],
    tags: ["graph", "bfs", "string"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-8",
    question:
      "Union Find Implementation - Implement Union-Find (Disjoint Set Union) data structure with path compression and union by rank.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach:
      "Union-Find (also known as Disjoint-Set Union) is a data structure that efficiently keeps track of a partition of elements into disjoint sets. It supports two primary operations: finding which set an element belongs to (find), and merging two sets (union). Two key optimizations make this data structure extremely efficient: path compression during find operations, and union by rank to keep the trees balanced.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Optimized Union-Find Implementation: We implement the Union-Find data structure with both path compression and union by rank optimizations. The find operation uses path compression by directly linking each node to its root during traversal, which flattens the tree. The union operation uses rank to always attach the shorter tree to the taller one, keeping the tree balanced. With these optimizations, operations run in O(α(n)) amortized time, where α is the inverse Ackermann function (practically constant).",
        code: `class UnionFind {
    parent: number[];
    rank: number[];
    components: number;
    
    constructor(n: number) {
        this.parent = Array(n).fill(0).map((_, i) => i);
        this.rank = Array(n).fill(0);
        this.components = n;
    }
    
    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
    }
    
    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX === rootY) return false; // Already connected
        
        // Union by rank
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        
        this.components--;
        return true;
    }
    
    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y);
    }
    
    getComponentCount(): number {
        return this.components;
    }
    
    getComponentSize(x: number): number {
        const root = this.find(x);
        let size = 0;
        
        for (let i = 0; i < this.parent.length; i++) {
            if (this.find(i) === root) {
                size++;
            }
        }
        
        return size;
    }
}`,
      },
      {
        language: "Python",
        explanation:
          "Optimized Union-Find Implementation: We implement the Union-Find data structure with both path compression and union by rank optimizations. The find operation uses path compression by directly linking each node to its root during traversal, which flattens the tree. The union operation uses rank to always attach the shorter tree to the taller one, keeping the tree balanced. With these optimizations, operations run in O(α(n)) amortized time, where α is the inverse Ackermann function (practically constant).",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Application - Counting Connected Components: One common application of Union-Find is to count the number of connected components in an undirected graph. We start with n components (each node in its own set) and then union edges. The final component count tells us how many connected components exist in the graph.",
        code: `function countComponents(n: number, edges: number[][]): number {
    const uf = new UnionFind(n);
    
    for (const [u, v] of edges) {
        uf.union(u, v);
    }
    
    return uf.getComponentCount();
}`,
      },
      {
        language: "typescript",
        explanation:
          "Application - Valid Tree Detection: Another application is determining if a graph is a valid tree. A graph is a valid tree if it has exactly n-1 edges (where n is the number of nodes) and it doesn't contain any cycles. Union-Find can detect cycles by checking if two nodes are already in the same set before performing a union.",
        code: `function validTree(n: number, edges: number[][]): boolean {
    if (edges.length !== n - 1) return false;
    
    const uf = new UnionFind(n);
    
    for (const [u, v] of edges) {
        if (!uf.union(u, v)) {
            return false; // Cycle detected
        }
    }
    
    return uf.getComponentCount() === 1;
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for a complete Union-Find implementation with path compression and union by rank optimizations. Union-Find is extremely efficient for operations like checking if two elements are in the same set or merging sets. The tab also includes practical applications like counting connected components and detecting valid trees.",
    tips: [
      "Path compression flattens tree during find operations",
      "Union by rank keeps tree balanced",
      "Amortized O(α(n)) time where α is inverse Ackermann",
      "Useful for connectivity queries and cycle detection",
    ],
    tags: ["graph", "union-find", "data-structure"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-9",
    question:
      "Minimum Spanning Tree - Given weighted undirected graph, find minimum spanning tree using Kruskal's and Prim's algorithms.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach:
      "A Minimum Spanning Tree (MST) is a subset of the edges of a connected, undirected, weighted graph that connects all vertices together with the minimum possible total edge weight, without any cycles. There are two classic algorithms to find MST: Kruskal's algorithm, which sorts all edges and greedily adds them if they don't create a cycle, and Prim's algorithm, which grows a tree from a single vertex by always adding the edge with minimum weight.",
    codeImplementation: [
      {
        language: "typescript",
        explanation:
          "Kruskal's Algorithm: This approach sorts all edges by weight and greedily adds them to the MST if they don't create a cycle. We use Union-Find to efficiently check for cycles. Time complexity is O(E log E) due to sorting, where E is the number of edges. Space complexity is O(V) where V is the number of vertices.",
        code: `function kruskalMST(n: number, edges: [number, number, number][]): [number, number, number][] {
    // Sort edges by weight
    edges.sort((a, b) => a[2] - b[2]);
    
    const uf = new UnionFind(n);
    const mst: [number, number, number][] = [];
    
    for (const [u, v, weight] of edges) {
        if (uf.union(u, v)) {
            mst.push([u, v, weight]);
            if (mst.length === n - 1) break;
        }
    }
    
    return mst;
}`,
      },
      {
        language: "Python",
        explanation:
          "Kruskal's Algorithm: This approach sorts all edges by weight and greedily adds them to the MST if they don't create a cycle. We use Union-Find to efficiently check for cycles. Time complexity is O(E log E) due to sorting, where E is the number of edges. Space complexity is O(V) where V is the number of vertices.",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Prim's Algorithm: This approach grows the MST from a single vertex, always choosing the minimum weight edge that connects a vertex in the tree to a vertex outside. We use a priority queue (simulated with a sorted array here) to efficiently find the next edge to add. Time complexity is O(E log V) and space complexity is O(V).",
        code: `function primMST(n: number, edges: [number, number, number][]): [number, number, number][] {
    // Build adjacency list
    const graph = Array(n).fill(null).map(() => [] as [number, number][]);
    
    for (const [u, v, weight] of edges) {
        graph[u].push([v, weight]);
        graph[v].push([u, weight]);
    }
    
    const mst: [number, number, number][] = [];
    const visited = new Array(n).fill(false);
    const minHeap: [number, number, number][] = []; // [weight, from, to]
    
    // Start from vertex 0
    visited[0] = true;
    for (const [neighbor, weight] of graph[0]) {
        minHeap.push([weight, 0, neighbor]);
    }
    minHeap.sort((a, b) => a[0] - b[0]);
    
    while (minHeap.length > 0 && mst.length < n - 1) {
        const [weight, from, to] = minHeap.shift()!;
        
        if (visited[to]) continue;
        
        visited[to] = true;
        mst.push([from, to, weight]);
        
        for (const [neighbor, edgeWeight] of graph[to]) {
            if (!visited[neighbor]) {
                minHeap.push([edgeWeight, to, neighbor]);
                minHeap.sort((a, b) => a[0] - b[0]);
            }
        }
    }
    
    return mst;
}`,
      },
      {
        language: "Python",
        explanation:
          "Prim's Algorithm: This approach grows the MST from a single vertex, always choosing the minimum weight edge that connects a vertex in the tree to a vertex outside. We use a priority queue (simulated with a sorted array here) to efficiently find the next edge to add. Time complexity is O(E log V) and space complexity is O(V).",
        code: `import heapq

def networkDelayTime(times, n, k):
    graph = {}
    for u, v, w in times:
        if u not in graph:
            graph[u] = []
        graph[u].append((v, w))
    
    pq = [(0, k)]
    distances = {i: float('inf') for i in range(1, n + 1)}
    distances[k] = 0
    
    while pq:
        current_dist, node = heapq.heappop(pq)
        
        if current_dist > distances[node]:
            continue
            
        if node in graph:
            for neighbor, weight in graph[node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return max(distances.values()) if len(distances) == n else -1`,
      },
      {
        language: "typescript",
        explanation:
          "Optimized for Finding MST Weight Only: If we only need the total weight of the MST rather than the edges themselves, we can optimize by just accumulating the weight as we go. This is particularly useful for Kruskal's algorithm where we can avoid building the edge list. Time complexity remains O(E log E).",
        code: `function findMSTWeight(n: number, edges: [number, number, number][]): number {
    edges.sort((a, b) => a[2] - b[2]);
    
    const uf = new UnionFind(n);
    let totalWeight = 0;
    let edgesUsed = 0;
    
    for (const [u, v, weight] of edges) {
        if (uf.union(u, v)) {
            totalWeight += weight;
            edgesUsed++;
            if (edgesUsed === n - 1) break;
        }
    }
    
    return totalWeight;
}`,
      },
    ],
    sampleAnswer:
      "See the code implementations tab for both Kruskal's and Prim's algorithms. Kruskal's works by sorting edges and adding them if they don't create cycles, while Prim's grows a tree from a single vertex by always adding the edge with minimum weight. Both algorithms correctly find the MST, though Kruskal's is generally better for sparse graphs and Prim's for dense graphs.",
    tips: [
      "Kruskal's: sort edges, use Union-Find to avoid cycles",
      "Prim's: grow tree from single vertex using min edge",
      "Both algorithms produce MST with same total weight",
      "Kruskal's better for sparse graphs, Prim's for dense graphs",
    ],
    tags: ["graph", "minimum-spanning-tree", "union-find", "greedy"],
    estimatedTime: 40,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
