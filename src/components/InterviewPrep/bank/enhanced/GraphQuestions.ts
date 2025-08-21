import { Question } from "../../InterviewSubjects";

// Enhanced Graph DSA Questions with comprehensive implementations
export const enhancedGraphQuestions: Question[] = [
  {
    id: "enhanced-graph-1",
    question: "Number of Islands - Given a 2D grid map of '1's (land) and '0's (water), count the number of islands.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: DFS (Optimal)
// Time: O(m * n), Space: O(m * n) worst case for recursion
function numIslands(grid: string[][]): number {
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
}

// Approach 2: BFS
// Time: O(m * n), Space: O(min(m, n)) for queue
function numIslandsBFS(grid: string[][]): number {
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
}

// Union-Find Approach
class UnionFind {
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
    tips: [
      "DFS naturally explores connected components",
      "Mark visited cells to avoid revisiting",
      "BFS uses queue instead of recursion stack",
      "Union-Find tracks connected components efficiently"
    ],
    tags: ["graph", "dfs", "bfs", "matrix", "union-find"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-2",
    question: "Course Schedule - Given numCourses and prerequisites array, return true if you can finish all courses.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Approach 1: DFS Cycle Detection (Optimal)
// Time: O(V + E), Space: O(V + E)
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
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
}

// Approach 2: Kahn's Algorithm (Topological Sort)
// Time: O(V + E), Space: O(V + E)
function canFinishKahn(numCourses: number, prerequisites: number[][]): boolean {
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
    tips: [
      "Problem reduces to cycle detection in directed graph",
      "DFS with three states: unvisited, visiting, visited",
      "Kahn's algorithm uses indegree counting",
      "Both approaches detect if topological ordering exists"
    ],
    tags: ["graph", "dfs", "bfs", "topological-sort"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-3",
    question: "Course Schedule II - Return the ordering of courses you should take to finish all courses. If impossible, return empty array.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Kahn's Algorithm (Topological Sort)
// Time: O(V + E), Space: O(V + E)
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
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
}

// DFS Approach with Post-order
// Time: O(V + E), Space: O(V + E)
function findOrderDFS(numCourses: number, prerequisites: number[][]): number[] {
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
    tips: [
      "Extension of Course Schedule I that returns actual ordering",
      "Kahn's algorithm naturally produces topological order",
      "DFS approach needs to reverse post-order traversal",
      "Return empty array if cycle detected (impossible to complete)"
    ],
    tags: ["graph", "topological-sort", "dfs", "bfs"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-4",
    question: "Clone Graph - Given a reference of a node in a connected undirected graph, return a deep copy of the graph.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Graph Node Definition
class GraphNode {
    val: number;
    neighbors: GraphNode[];
    
    constructor(val?: number, neighbors?: GraphNode[]) {
        this.val = val === undefined ? 0 : val;
        this.neighbors = neighbors === undefined ? [] : neighbors;
    }
}

// Approach 1: DFS with Hash Map
// Time: O(V + E), Space: O(V)
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
}

// Approach 2: BFS with Hash Map
// Time: O(V + E), Space: O(V)
function cloneGraphBFS(node: GraphNode | null): GraphNode | null {
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
}

// Alternative: Using node values as keys (if values are unique)
function cloneGraphByValue(node: GraphNode | null): GraphNode | null {
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
    tips: [
      "Use hash map to track original → clone mapping",
      "Avoid infinite loops by checking if node already cloned",
      "DFS and BFS both work, DFS is more intuitive",
      "Clone node first, then clone and connect neighbors"
    ],
    tags: ["graph", "dfs", "bfs", "hash-table"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-5",
    question: "Pacific Atlantic Water Flow - Given heights matrix, find all cells where water can flow to both Pacific and Atlantic oceans.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Reverse DFS from Ocean Borders (Optimal)
// Time: O(m * n), Space: O(m * n)
function pacificAtlantic(heights: number[][]): number[][] {
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
}

// BFS Alternative
function pacificAtlanticBFS(heights: number[][]): number[][] {
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
    tips: [
      "Reverse thinking: start from ocean borders and flow inward",
      "Water flows from higher to lower or equal height",
      "Two separate DFS/BFS: one for each ocean",
      "Result is intersection of both reachable sets"
    ],
    tags: ["graph", "dfs", "bfs", "matrix"],
    estimatedTime: 30,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-6",
    question: "Network Delay Time - Given a network of n nodes and times array representing signal travel times, find minimum time for signal to reach all nodes from node k.",
    category: "technical",
    difficulty: "medium",
    type: "coding",
    sampleAnswer: `
// Dijkstra's Algorithm with Priority Queue
// Time: O((V + E) log V), Space: O(V + E)
function networkDelayTime(times: number[][], n: number, k: number): number {
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
}

// Bellman-Ford Algorithm (handles negative weights)
// Time: O(V * E), Space: O(V)
function networkDelayTimeBellmanFord(times: number[][], n: number, k: number): number {
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
}

// Floyd-Warshall (All pairs shortest path)
// Time: O(V³), Space: O(V²)
function networkDelayTimeFloyd(times: number[][], n: number, k: number): number {
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
    tips: [
      "Single-source shortest path problem → Dijkstra's algorithm",
      "Use priority queue to always process closest unvisited node",
      "Track distances to all nodes, return maximum distance",
      "Return -1 if any node is unreachable"
    ],
    tags: ["graph", "dijkstra", "shortest-path", "heap"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-graph-7",
    question: "Word Ladder - Given two words beginWord and endWord, and a dictionary wordList, return the length of shortest transformation sequence.",
    category: "technical",
    difficulty: "hard",
    type: "coding",
    sampleAnswer: `
// BFS Approach (Optimal for shortest path)
// Time: O(M² * N) where M = word length, N = wordList size
// Space: O(M * N)
function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
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
}

// Bidirectional BFS (More efficient)
// Time: O(M² * N), Space: O(M * N)
function ladderLengthBidirectional(beginWord: string, endWord: string, wordList: string[]): number {
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
}

// Build graph first, then BFS
function ladderLengthGraph(beginWord: string, endWord: string, wordList: string[]): number {
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
    tips: [
      "BFS finds shortest path in unweighted graph",
      "Generate neighbors by changing each character",
      "Use set for O(1) word lookups",
      "Bidirectional BFS can be more efficient for large graphs"
    ],
    tags: ["graph", "bfs", "string"],
    estimatedTime: 35,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];