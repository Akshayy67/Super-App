import { EnhancedQuestion } from "../../InterviewSubjects";

export const enhancedGraphQuestions: EnhancedQuestion[] = [
  {
    id: "dsa-29",
    question: "Implement Depth-First Search (DFS) in a graph",
    category: "graphs",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "DFS explores as far as possible along each branch before backtracking. Can be implemented recursively or iteratively with a stack. Recursive: mark current node visited, recursively visit all unvisited neighbors. Iterative: use explicit stack, push start node, while stack not empty pop node and visit unvisited neighbors. Time complexity: O(V + E), Space complexity: O(V).",
    tips: [
      "Explain recursive vs iterative implementations",
      "Discuss visited array importance",
      "Compare with BFS characteristics"
    ],
    tags: ["graphs", "dfs", "traversal"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `// Recursive DFS
function dfsRecursive(graph, start, visited = new Set()) {
    const result = [];
    
    function dfs(node) {
        visited.add(node);
        result.push(node);
        
        // Visit all unvisited neighbors
        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }
    }
    
    dfs(start);
    return result;
}

// Iterative DFS
function dfsIterative(graph, start) {
    const visited = new Set();
    const stack = [start];
    const result = [];
    
    while (stack.length > 0) {
        const node = stack.pop();
        
        if (!visited.has(node)) {
            visited.add(node);
            result.push(node);
            
            // Add neighbors to stack (in reverse order for same order as recursive)
            const neighbors = graph[node] || [];
            for (let i = neighbors.length - 1; i >= 0; i--) {
                if (!visited.has(neighbors[i])) {
                    stack.push(neighbors[i]);
                }
            }
        }
    }
    
    return result;
}

// DFS for connected components
function findConnectedComponents(graph) {
    const visited = new Set();
    const components = [];
    
    for (const node in graph) {
        if (!visited.has(node)) {
            const component = dfsRecursive(graph, node, visited);
            components.push(component);
        }
    }
    
    return components;
}`,
        explanation: "DFS goes deep before exploring siblings. Recursive version uses call stack, iterative uses explicit stack. Both mark nodes to avoid cycles.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V) for visited set + O(V) for recursion/stack",
        approach: "Depth-First Search"
      },
      python: {
        solution: `def dfs_recursive(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    result = []
    
    def dfs(node):
        visited.add(node)
        result.append(node)
        
        # Visit all unvisited neighbors
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
    
    dfs(start)
    return result

def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    result = []
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            # Add neighbors to stack
            neighbors = graph.get(node, [])
            for neighbor in reversed(neighbors):  # Reverse for same order as recursive
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return result

def find_connected_components(graph):
    visited = set()
    components = []
    
    for node in graph:
        if node not in visited:
            component = []
            dfs_component(graph, node, visited, component)
            components.append(component)
    
    return components

def dfs_component(graph, node, visited, component):
    visited.add(node)
    component.append(node)
    
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            dfs_component(graph, neighbor, visited, component)`,
        explanation: "Python implementation with clean syntax. Uses defaultdict or get() method to handle missing keys gracefully.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Depth-First Search"
      },
      java: {
        solution: `import java.util.*;

public class DFS {
    // Recursive DFS
    public List<Integer> dfsRecursive(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        List<Integer> result = new ArrayList<>();
        dfsHelper(graph, start, visited, result);
        return result;
    }
    
    private void dfsHelper(Map<Integer, List<Integer>> graph, int node, 
                          Set<Integer> visited, List<Integer> result) {
        visited.add(node);
        result.add(node);
        
        // Visit all unvisited neighbors
        List<Integer> neighbors = graph.getOrDefault(node, new ArrayList<>());
        for (int neighbor : neighbors) {
            if (!visited.contains(neighbor)) {
                dfsHelper(graph, neighbor, visited, result);
            }
        }
    }
    
    // Iterative DFS
    public List<Integer> dfsIterative(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        Stack<Integer> stack = new Stack<>();
        List<Integer> result = new ArrayList<>();
        
        stack.push(start);
        
        while (!stack.isEmpty()) {
            int node = stack.pop();
            
            if (!visited.contains(node)) {
                visited.add(node);
                result.add(node);
                
                // Add neighbors to stack
                List<Integer> neighbors = graph.getOrDefault(node, new ArrayList<>());
                for (int i = neighbors.size() - 1; i >= 0; i--) {
                    if (!visited.contains(neighbors.get(i))) {
                        stack.push(neighbors.get(i));
                    }
                }
            }
        }
        
        return result;
    }
}`,
        explanation: "Java implementation using Map for graph representation and HashSet for visited tracking. Handles missing nodes gracefully.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Depth-First Search"
      }
    },
    algorithmSteps: [
      "Initialize visited set and result list",
      "Start from given node",
      "Mark current node as visited",
      "Add current node to result",
      "For each unvisited neighbor, recursively apply DFS",
      "Backtrack when no more unvisited neighbors",
      "Continue until all reachable nodes visited"
    ],
    commonMistakes: [
      "Not marking nodes as visited (infinite loops)",
      "Visiting same node multiple times",
      "Not handling disconnected components",
      "Stack overflow in recursive approach for large graphs"
    ],
    optimizations: [
      "Use iterative approach for very deep graphs",
      "Early termination when target found",
      "Path tracking for specific applications"
    ],
    relatedQuestions: ["Breadth-First Search", "Topological Sort", "Connected Components"]
  },

  {
    id: "dsa-30",
    question: "Implement Breadth-First Search (BFS) in a graph",
    category: "graphs",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "BFS explores all neighbors at current depth before moving to next depth level. Use a queue: start with initial node in queue, while queue not empty, dequeue node, visit it, and enqueue all unvisited neighbors. Naturally finds shortest path in unweighted graphs. Time complexity: O(V + E), Space complexity: O(V).",
    tips: [
      "Explain level-by-level exploration",
      "Discuss shortest path property",
      "Compare queue vs stack data structures"
    ],
    tags: ["graphs", "bfs", "shortest-path"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    const result = [];
    
    visited.add(start);
    
    while (queue.length > 0) {
        const node = queue.shift(); // Dequeue
        result.push(node);
        
        // Add all unvisited neighbors to queue
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor); // Enqueue
            }
        }
    }
    
    return result;
}

// BFS with level tracking
function bfsWithLevels(graph, start) {
    const visited = new Set();
    const queue = [[start, 0]]; // [node, level]
    const result = [];
    
    visited.add(start);
    
    while (queue.length > 0) {
        const [node, level] = queue.shift();
        result.push({ node, level });
        
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, level + 1]);
            }
        }
    }
    
    return result;
}

// Shortest path in unweighted graph
function shortestPath(graph, start, target) {
    const visited = new Set();
    const queue = [[start, [start]]]; // [node, path]
    
    visited.add(start);
    
    while (queue.length > 0) {
        const [node, path] = queue.shift();
        
        if (node === target) {
            return path;
        }
        
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, [...path, neighbor]]);
            }
        }
    }
    
    return null; // No path found
}`,
        explanation: "BFS uses queue for FIFO processing, ensuring level-by-level exploration. Naturally finds shortest paths in unweighted graphs.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Breadth-First Search"
      },
      python: {
        solution: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []
    
    visited.add(start)
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        # Add all unvisited neighbors to queue
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

def bfs_with_levels(graph, start):
    visited = set()
    queue = deque([(start, 0)])  # (node, level)
    result = []
    
    visited.add(start)
    
    while queue:
        node, level = queue.popleft()
        result.append((node, level))
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, level + 1))
    
    return result

def shortest_path(graph, start, target):
    visited = set()
    queue = deque([(start, [start])])  # (node, path)
    
    visited.add(start)
    
    while queue:
        node, path = queue.popleft()
        
        if node == target:
            return path
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None  # No path found`,
        explanation: "Python implementation using deque for efficient queue operations. Includes level tracking and shortest path finding variants.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Breadth-First Search"
      },
      java: {
        solution: `import java.util.*;

public class BFS {
    public List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> queue = new LinkedList<>();
        List<Integer> result = new ArrayList<>();
        
        queue.offer(start);
        visited.add(start);
        
        while (!queue.isEmpty()) {
            int node = queue.poll();
            result.add(node);
            
            // Add all unvisited neighbors to queue
            List<Integer> neighbors = graph.getOrDefault(node, new ArrayList<>());
            for (int neighbor : neighbors) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
        
        return result;
    }
    
    public List<Integer> shortestPath(Map<Integer, List<Integer>> graph, 
                                     int start, int target) {
        Set<Integer> visited = new HashSet<>();
        Queue<List<Integer>> queue = new LinkedList<>();
        
        queue.offer(Arrays.asList(start));
        visited.add(start);
        
        while (!queue.isEmpty()) {
            List<Integer> path = queue.poll();
            int node = path.get(path.size() - 1);
            
            if (node == target) {
                return path;
            }
            
            List<Integer> neighbors = graph.getOrDefault(node, new ArrayList<>());
            for (int neighbor : neighbors) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    List<Integer> newPath = new ArrayList<>(path);
                    newPath.add(neighbor);
                    queue.offer(newPath);
                }
            }
        }
        
        return null; // No path found
    }
}`,
        explanation: "Java implementation using LinkedList as Queue. Includes shortest path finding which leverages BFS's level-by-level exploration property.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "Breadth-First Search"
      }
    },
    algorithmSteps: [
      "Initialize visited set and queue with start node",
      "Mark start node as visited",
      "While queue is not empty:",
      "Dequeue a node and process it",
      "For each unvisited neighbor:",
      "Mark neighbor as visited",
      "Add neighbor to queue",
      "Continue until queue is empty"
    ],
    commonMistakes: [
      "Not marking nodes as visited when adding to queue",
      "Using stack instead of queue (becomes DFS)",
      "Visiting nodes multiple times",
      "Not handling disconnected graphs"
    ],
    optimizations: [
      "Mark nodes as visited when adding to queue, not when processing",
      "Use deque for efficient queue operations",
      "Early termination when target found"
    ],
    relatedQuestions: ["Shortest Path in Binary Matrix", "Word Ladder", "Minimum Steps to Reach Target"]
  },

  {
    id: "dsa-31",
    question: "Detect cycle in a directed graph",
    category: "graphs",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use DFS with three colors: white (unvisited), gray (visiting), black (visited). During DFS, if we encounter a gray node, there's a back edge indicating a cycle. Gray nodes represent the current path in recursion stack. Time complexity: O(V + E), Space complexity: O(V).",
    tips: [
      "Explain the three-color approach",
      "Differentiate from undirected graph cycle detection",
      "Discuss topological sorting relation"
    ],
    tags: ["graphs", "cycle-detection", "dfs"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
    codeImplementations: {
      javascript: {
        solution: `function hasCycleDirected(graph) {
    const WHITE = 0; // Unvisited
    const GRAY = 1;  // Visiting (in current path)
    const BLACK = 2; // Visited (completed)
    
    const colors = new Map();
    
    // Initialize all nodes as white
    for (const node in graph) {
        colors.set(parseInt(node), WHITE);
    }
    
    function dfs(node) {
        colors.set(node, GRAY); // Mark as visiting
        
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (colors.get(neighbor) === GRAY) {
                return true; // Back edge found - cycle detected
            }
            
            if (colors.get(neighbor) === WHITE && dfs(neighbor)) {
                return true;
            }
        }
        
        colors.set(node, BLACK); // Mark as completed
        return false;
    }
    
    // Check each component
    for (const node in graph) {
        const nodeNum = parseInt(node);
        if (colors.get(nodeNum) === WHITE) {
            if (dfs(nodeNum)) {
                return true;
            }
        }
    }
    
    return false;
}

// Alternative: Using recursion stack tracking
function hasCycleRecStack(graph) {
    const visited = new Set();
    const recStack = new Set(); // Current recursion path
    
    function dfs(node) {
        visited.add(node);
        recStack.add(node);
        
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) return true;
            } else if (recStack.has(neighbor)) {
                return true; // Back edge found
            }
        }
        
        recStack.delete(node); // Remove from current path
        return false;
    }
    
    for (const node in graph) {
        const nodeNum = parseInt(node);
        if (!visited.has(nodeNum)) {
            if (dfs(nodeNum)) return true;
        }
    }
    
    return false;
}`,
        explanation: "Three-color approach tracks node states during DFS. Gray nodes indicate current recursion path - encountering gray node means back edge (cycle).",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "DFS with Three Colors"
      },
      python: {
        solution: `def has_cycle_directed(graph):
    WHITE, GRAY, BLACK = 0, 1, 2
    colors = {node: WHITE for node in graph}
    
    def dfs(node):
        colors[node] = GRAY  # Mark as visiting
        
        for neighbor in graph.get(node, []):
            if colors[neighbor] == GRAY:
                return True  # Back edge found - cycle detected
            
            if colors[neighbor] == WHITE and dfs(neighbor):
                return True
        
        colors[node] = BLACK  # Mark as completed
        return False
    
    # Check each component
    for node in graph:
        if colors[node] == WHITE:
            if dfs(node):
                return True
    
    return False

def has_cycle_rec_stack(graph):
    visited = set()
    rec_stack = set()  # Current recursion path
    
    def dfs(node):
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True  # Back edge found
        
        rec_stack.remove(node)  # Remove from current path
        return False
    
    for node in graph:
        if node not in visited:
            if dfs(node):
                return True
    
    return False`,
        explanation: "Python implementation with clean dictionary comprehension for initialization. Recursion stack approach explicitly tracks current path.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "DFS with Three Colors"
      },
      java: {
        solution: `public class DirectedGraphCycle {
    private static final int WHITE = 0;
    private static final int GRAY = 1;
    private static final int BLACK = 2;
    
    public boolean hasCycle(Map<Integer, List<Integer>> graph) {
        Map<Integer, Integer> colors = new HashMap<>();
        
        // Initialize all nodes as white
        for (int node : graph.keySet()) {
            colors.put(node, WHITE);
        }
        
        // Check each component
        for (int node : graph.keySet()) {
            if (colors.get(node) == WHITE) {
                if (dfs(graph, node, colors)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    private boolean dfs(Map<Integer, List<Integer>> graph, int node, 
                       Map<Integer, Integer> colors) {
        colors.put(node, GRAY); // Mark as visiting
        
        List<Integer> neighbors = graph.getOrDefault(node, new ArrayList<>());
        for (int neighbor : neighbors) {
            if (colors.get(neighbor) == GRAY) {
                return true; // Back edge found - cycle detected
            }
            
            if (colors.get(neighbor) == WHITE && dfs(graph, neighbor, colors)) {
                return true;
            }
        }
        
        colors.put(node, BLACK); // Mark as completed
        return false;
    }
}`,
        explanation: "Java implementation using constants for color states. The algorithm efficiently detects cycles by tracking the current DFS path.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        approach: "DFS with Three Colors"
      }
    },
    algorithmSteps: [
      "Initialize all nodes as WHITE (unvisited)",
      "For each unvisited node, start DFS",
      "Mark current node as GRAY (visiting)",
      "For each neighbor:",
      "If neighbor is GRAY, cycle detected (back edge)",
      "If neighbor is WHITE, recursively check",
      "Mark current node as BLACK (completed)",
      "Return true if any cycle found"
    ],
    commonMistakes: [
      "Using undirected graph cycle detection for directed graphs",
      "Not distinguishing between cross edges and back edges",
      "Forgetting to mark nodes as BLACK after processing",
      "Not checking all disconnected components"
    ],
    optimizations: [
      "Early termination when first cycle found",
      "Topological sort can detect cycles as byproduct",
      "Union-Find for specific cycle types"
    ],
    relatedQuestions: ["Course Schedule", "Topological Sort", "Find Eventual Safe States"]
  }
];