import { EnhancedQuestion } from "../../InterviewSubjects";

export const graphQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-09",
    question: "Depth-First Search (DFS) and Breadth-First Search (BFS) in graphs",
    category: "graphs",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "DFS explores as far as possible along each branch before backtracking. Can be implemented recursively or with stack. BFS explores neighbors level by level using queue. DFS: O(V+E) time, O(V) space. BFS: O(V+E) time, O(V) space. DFS good for topological sort, BFS good for shortest path in unweighted graphs.",
    tips: [
      "Explain the difference in exploration patterns",
      "Discuss when to use DFS vs BFS",
      "Show both recursive and iterative implementations"
    ],
    tags: ["graphs", "dfs", "bfs", "traversal"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Graph representation using adjacency list
class Graph {
    constructor() {
        this.adjacencyList = new Map();
    }
    
    addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }
    
    addEdge(v1, v2) {
        this.adjacencyList.get(v1).push(v2);
        this.adjacencyList.get(v2).push(v1); // For undirected graph
    }
    
    // DFS Recursive
    dfsRecursive(start) {
        const visited = new Set();
        const result = [];
        
        const dfs = (vertex) => {
            visited.add(vertex);
            result.push(vertex);
            
            const neighbors = this.adjacencyList.get(vertex) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                }
            }
        };
        
        dfs(start);
        return result;
    }
    
    // DFS Iterative
    dfsIterative(start) {
        const visited = new Set();
        const result = [];
        const stack = [start];
        
        while (stack.length > 0) {
            const vertex = stack.pop();
            
            if (!visited.has(vertex)) {
                visited.add(vertex);
                result.push(vertex);
                
                const neighbors = this.adjacencyList.get(vertex) || [];
                // Add neighbors in reverse order for consistent traversal
                for (let i = neighbors.length - 1; i >= 0; i--) {
                    if (!visited.has(neighbors[i])) {
                        stack.push(neighbors[i]);
                    }
                }
            }
        }
        
        return result;
    }
    
    // BFS
    bfs(start) {
        const visited = new Set();
        const result = [];
        const queue = [start];
        visited.add(start);
        
        while (queue.length > 0) {
            const vertex = queue.shift();
            result.push(vertex);
            
            const neighbors = this.adjacencyList.get(vertex) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        
        return result;
    }
}`,
        explanation: "Graph class with adjacency list representation. DFS can be recursive or iterative with stack. BFS uses queue for level-by-level exploration.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "DFS / BFS Traversal"
      },
      python: {
        solution: `from collections import defaultdict, deque

class Graph:
    def __init__(self):
        self.graph = defaultdict(list)
    
    def add_edge(self, u, v):
        self.graph[u].append(v)
        self.graph[v].append(u)  # For undirected graph
    
    def dfs_recursive(self, start):
        visited = set()
        result = []
        
        def dfs(vertex):
            visited.add(vertex)
            result.append(vertex)
            
            for neighbor in self.graph[vertex]:
                if neighbor not in visited:
                    dfs(neighbor)
        
        dfs(start)
        return result
    
    def dfs_iterative(self, start):
        visited = set()
        result = []
        stack = [start]
        
        while stack:
            vertex = stack.pop()
            
            if vertex not in visited:
                visited.add(vertex)
                result.append(vertex)
                
                # Add neighbors to stack
                for neighbor in reversed(self.graph[vertex]):
                    if neighbor not in visited:
                        stack.append(neighbor)
        
        return result
    
    def bfs(self, start):
        visited = set()
        result = []
        queue = deque([start])
        visited.add(start)
        
        while queue:
            vertex = queue.popleft()
            result.append(vertex)
            
            for neighbor in self.graph[vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        return result`,
        explanation: "Python implementation using defaultdict for clean adjacency list and deque for efficient queue operations.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Graph Traversal"
      },
      java: {
        solution: `import java.util.*;

class Graph {
    private Map<Integer, List<Integer>> adjacencyList;
    
    public Graph() {
        adjacencyList = new HashMap<>();
    }
    
    public void addVertex(int vertex) {
        adjacencyList.putIfAbsent(vertex, new ArrayList<>());
    }
    
    public void addEdge(int u, int v) {
        adjacencyList.get(u).add(v);
        adjacencyList.get(v).add(u); // For undirected graph
    }
    
    public List<Integer> dfsRecursive(int start) {
        Set<Integer> visited = new HashSet<>();
        List<Integer> result = new ArrayList<>();
        dfsHelper(start, visited, result);
        return result;
    }
    
    private void dfsHelper(int vertex, Set<Integer> visited, List<Integer> result) {
        visited.add(vertex);
        result.add(vertex);
        
        for (int neighbor : adjacencyList.getOrDefault(vertex, new ArrayList<>())) {
            if (!visited.contains(neighbor)) {
                dfsHelper(neighbor, visited, result);
            }
        }
    }
    
    public List<Integer> bfs(int start) {
        Set<Integer> visited = new HashSet<>();
        List<Integer> result = new ArrayList<>();
        Queue<Integer> queue = new LinkedList<>();
        
        queue.offer(start);
        visited.add(start);
        
        while (!queue.isEmpty()) {
            int vertex = queue.poll();
            result.add(vertex);
            
            for (int neighbor : adjacencyList.getOrDefault(vertex, new ArrayList<>())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
        
        return result;
    }
}`,
        explanation: "Java implementation with proper graph representation. Uses helper method for DFS recursion and Queue interface for BFS.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Graph Traversal"
      }
    },
    algorithmSteps: [
      "Choose appropriate graph representation (adjacency list/matrix)",
      "Initialize visited set to avoid cycles",
      "DFS: Start from source, mark visited, explore unvisited neighbors recursively",
      "BFS: Use queue, start from source, mark visited, add neighbors to queue",
      "Continue until all reachable vertices are visited",
      "Return traversal order or perform operation during traversal"
    ],
    commonMistakes: [
      "Not marking vertices as visited (infinite loops)",
      "Visiting vertices multiple times",
      "Incorrect queue/stack operations",
      "Not handling disconnected components"
    ],
    optimizations: [
      "Adjacency list for sparse graphs",
      "Early termination for search problems",
      "Iterative DFS to avoid stack overflow"
    ],
    relatedQuestions: ["Number of Islands", "Course Schedule", "Clone Graph"]
  },

  {
    id: "dsa-10",
    question: "Find shortest path in unweighted graph",
    category: "graphs",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use BFS from source vertex. BFS guarantees shortest path in unweighted graphs because it explores vertices level by level. Track distances and optionally parent pointers to reconstruct path. Time complexity: O(V+E), Space complexity: O(V).",
    tips: [
      "Explain why BFS finds shortest path in unweighted graphs",
      "Discuss path reconstruction using parent pointers",
      "Compare with Dijkstra's algorithm for weighted graphs"
    ],
    tags: ["graphs", "bfs", "shortest-path"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function shortestPath(graph, start, end) {
    if (start === end) return [start];
    
    const queue = [start];
    const visited = new Set([start]);
    const parent = new Map();
    const distances = new Map();
    
    distances.set(start, 0);
    parent.set(start, null);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Check if we reached the target
        if (current === end) {
            return reconstructPath(parent, start, end);
        }
        
        const neighbors = graph.get(current) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, current);
                distances.set(neighbor, distances.get(current) + 1);
                queue.push(neighbor);
            }
        }
    }
    
    return []; // No path found
}

function reconstructPath(parent, start, end) {
    const path = [];
    let current = end;
    
    while (current !== null) {
        path.unshift(current);
        current = parent.get(current);
    }
    
    return path[0] === start ? path : [];
}

// Distance only (without path reconstruction)
function shortestDistance(graph, start, end) {
    if (start === end) return 0;
    
    const queue = [start];
    const visited = new Set([start]);
    const distances = new Map([[start, 0]]);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        const neighbors = graph.get(current) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                const newDistance = distances.get(current) + 1;
                distances.set(neighbor, newDistance);
                
                if (neighbor === end) {
                    return newDistance;
                }
                
                queue.push(neighbor);
            }
        }
    }
    
    return -1; // No path found
}`,
        explanation: "BFS guarantees shortest path in unweighted graphs. Parent map enables path reconstruction. Early termination when target found.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "BFS"
      },
      python: {
        solution: `from collections import deque, defaultdict

def shortest_path(graph, start, end):
    if start == end:
        return [start]
    
    queue = deque([start])
    visited = {start}
    parent = {start: None}
    
    while queue:
        current = queue.popleft()
        
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = current
                queue.append(neighbor)
                
                if neighbor == end:
                    return reconstruct_path(parent, start, end)
    
    return []  # No path found

def reconstruct_path(parent, start, end):
    path = []
    current = end
    
    while current is not None:
        path.append(current)
        current = parent[current]
    
    path.reverse()
    return path if path[0] == start else []

def shortest_distance(graph, start, end):
    if start == end:
        return 0
    
    queue = deque([(start, 0)])
    visited = {start}
    
    while queue:
        current, distance = queue.popleft()
        
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                new_distance = distance + 1
                
                if neighbor == end:
                    return new_distance
                
                queue.append((neighbor, new_distance))
    
    return -1  # No path found`,
        explanation: "Python implementation using deque for efficient queue operations. Clean syntax with tuple unpacking for distance tracking.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "BFS"
      },
      java: {
        solution: `public List<Integer> shortestPath(Map<Integer, List<Integer>> graph, int start, int end) {
    if (start == end) {
        return Arrays.asList(start);
    }
    
    Queue<Integer> queue = new LinkedList<>();
    Set<Integer> visited = new HashSet<>();
    Map<Integer, Integer> parent = new HashMap<>();
    
    queue.offer(start);
    visited.add(start);
    parent.put(start, null);
    
    while (!queue.isEmpty()) {
        int current = queue.poll();
        
        for (int neighbor : graph.getOrDefault(current, new ArrayList<>())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                parent.put(neighbor, current);
                queue.offer(neighbor);
                
                if (neighbor == end) {
                    return reconstructPath(parent, start, end);
                }
            }
        }
    }
    
    return new ArrayList<>(); // No path found
}

private List<Integer> reconstructPath(Map<Integer, Integer> parent, int start, int end) {
    List<Integer> path = new ArrayList<>();
    Integer current = end;
    
    while (current != null) {
        path.add(current);
        current = parent.get(current);
    }
    
    Collections.reverse(path);
    return path.get(0) == start ? path : new ArrayList<>();
}`,
        explanation: "Java implementation with proper collections usage. Map stores parent relationships for path reconstruction.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "BFS"
      }
    },
    algorithmSteps: [
      "Initialize queue with start vertex and mark as visited",
      "While queue is not empty, dequeue current vertex",
      "For each unvisited neighbor of current vertex",
      "Mark neighbor as visited and add to queue",
      "Track parent relationship for path reconstruction",
      "If target found, reconstruct path using parent pointers",
      "Return path or empty if no path exists"
    ],
    commonMistakes: [
      "Not marking vertices as visited when adding to queue",
      "Using DFS when shortest path is required",
      "Incorrect path reconstruction logic",
      "Not handling disconnected graphs"
    ],
    optimizations: [
      "Early termination when target found",
      "Bidirectional BFS for long paths",
      "Adjacency list for sparse graphs"
    ],
    relatedQuestions: ["Word Ladder", "01 Matrix", "Rotting Oranges"]
  }
];