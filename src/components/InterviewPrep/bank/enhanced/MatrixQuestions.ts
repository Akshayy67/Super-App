import { Question } from "../../InterviewSubjects";

// Enhanced Matrix and 2D Array DSA Questions with comprehensive implementations
export const enhancedMatrixQuestions: Question[] = [
  {
    id: "enhanced-matrix-1",
    question: "Spiral Matrix - Given m x n matrix, return all elements in spiral order.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Layer by Layer (O(m * n) time, O(1) space): Process matrix layer by layer from outside to inside using boundary variables. 2) Direction-based Approach (O(m * n) time, O(m * n) space): Use direction array and visited matrix to simulate spiral traversal. 3) Recursive Approach: Recursively process outer layer and inner submatrix. Layer by Layer approach is most space-efficient and intuitive for understanding the spiral pattern.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Layer by Layer (Optimal)
// Time: O(m * n), Space: O(1) excluding output
function spiralOrder(matrix: number[][]): number[] {
    if (!matrix || matrix.length === 0) return [];
    
    const result: number[] = [];
    let top = 0;
    let bottom = matrix.length - 1;
    let left = 0;
    let right = matrix[0].length - 1;
    
    while (top <= bottom && left <= right) {
        // Traverse right
        for (let col = left; col <= right; col++) {
            result.push(matrix[top][col]);
        }
        top++;
        
        // Traverse down
        for (let row = top; row <= bottom; row++) {
            result.push(matrix[row][right]);
        }
        right--;
        
        // Traverse left (if still valid row)
        if (top <= bottom) {
            for (let col = right; col >= left; col--) {
                result.push(matrix[bottom][col]);
            }
            bottom--;
        }
        
        // Traverse up (if still valid column)
        if (left <= right) {
            for (let row = bottom; row >= top; row--) {
                result.push(matrix[row][left]);
            }
            left++;
        }
    }
    
    return result;
}`,
        explanation: "Layer by Layer approach processes matrix from outside to inside. Most space-efficient with clear boundary management."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Direction-based Approach
// Time: O(m * n), Space: O(m * n)
function spiralOrderDirection(matrix: number[][]): number[] {
    if (!matrix || matrix.length === 0) return [];
    
    const result: number[] = [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
    let dirIndex = 0;
    let row = 0, col = 0;
    
    for (let i = 0; i < rows * cols; i++) {
        result.push(matrix[row][col]);
        visited[row][col] = true;
        
        const [dr, dc] = directions[dirIndex];
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols || visited[newRow][newCol]) {
            dirIndex = (dirIndex + 1) % 4;
            const [newDr, newDc] = directions[dirIndex];
            row += newDr;
            col += newDc;
        } else {
            row = newRow;
            col = newCol;
        }
    }
    
    return result;
}`,
        explanation: "Direction-based approach uses direction array and visited matrix. More flexible but uses extra space."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Recursive Approach
// Time: O(m * n), Space: O(m * n) for call stack
function spiralOrderRecursive(matrix: number[][]): number[] {
    if (!matrix || matrix.length === 0) return [];
    
    const result: number[] = [];
    
    function spiralLayer(top: number, bottom: number, left: number, right: number): void {
        if (top > bottom || left > right) return;
        
        // Single row
        if (top === bottom) {
            for (let col = left; col <= right; col++) {
                result.push(matrix[top][col]);
            }
            return;
        }
        
        // Single column
        if (left === right) {
            for (let row = top; row <= bottom; row++) {
                result.push(matrix[row][left]);
            }
            return;
        }
        
        // Traverse outer layer
        for (let col = left; col <= right; col++) result.push(matrix[top][col]);
        for (let row = top + 1; row <= bottom; row++) result.push(matrix[row][right]);
        for (let col = right - 1; col >= left; col--) result.push(matrix[bottom][col]);
        for (let row = bottom - 1; row > top; row--) result.push(matrix[row][left]);
        
        // Recursively process inner submatrix
        spiralLayer(top + 1, bottom - 1, left + 1, right - 1);
    }
    
    spiralLayer(0, matrix.length - 1, 0, matrix[0].length - 1);
    return result;
}`,
        explanation: "Recursive approach processes outer layer and recursively handles inner submatrix. Elegant but uses call stack space."
      }
    ],
    tips: [
      "Process matrix layer by layer from outside to inside",
      "Maintain four boundaries: top, bottom, left, right",
      "Update boundaries after completing each direction",
      "Check boundaries before traversing to avoid duplicates"
    ],
    tags: ["matrix", "array", "simulation"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-matrix-2",
    question: "Rotate Image - Rotate n×n 2D matrix representing image by 90 degrees clockwise in-place.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Transpose + Reverse (O(n²) time, O(1) space): Most intuitive approach - transpose matrix then reverse each row. 2) Layer by Layer Rotation (O(n²) time, O(1) space): Rotate matrix layer by layer from outer to inner. 3) Four-way Swap (O(n²) time, O(1) space): Direct four-way rotation in one pass. Transpose + Reverse is most intuitive, while Layer approach provides better understanding of the rotation process.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Transpose + Reverse (Optimal)
// Time: O(n²), Space: O(1)
function rotate(matrix: number[][]): void {
    const n = matrix.length;
    
    // Step 1: Transpose matrix (swap matrix[i][j] with matrix[j][i])
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    
    // Step 2: Reverse each row
    for (let i = 0; i < n; i++) {
        matrix[i].reverse();
    }
}`,
        explanation: "Transpose + Reverse approach is most intuitive. 90° clockwise rotation = transpose + reverse rows."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Layer by Layer Rotation
// Time: O(n²), Space: O(1)
function rotateLayered(matrix: number[][]): void {
    const n = matrix.length;
    
    for (let layer = 0; layer < Math.floor(n / 2); layer++) {
        const first = layer;
        const last = n - 1 - layer;
        
        for (let i = first; i < last; i++) {
            const offset = i - first;
            
            // Save top element
            const top = matrix[first][i];
            
            // top = left
            matrix[first][i] = matrix[last - offset][first];
            
            // left = bottom
            matrix[last - offset][first] = matrix[last][last - offset];
            
            // bottom = right
            matrix[last][last - offset] = matrix[i][last];
            
            // right = top
            matrix[i][last] = top;
        }
    }
}`,
        explanation: "Layer approach rotates matrix from outer to inner layers. More complex but shows the rotation process clearly."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Four-way Swap in One Pass
// Time: O(n²), Space: O(1)
function rotateFourWay(matrix: number[][]): void {
    const n = matrix.length;
    
    for (let i = 0; i < Math.floor(n / 2); i++) {
        for (let j = i; j < n - 1 - i; j++) {
            // Four-way rotation
            const temp = matrix[i][j];
            matrix[i][j] = matrix[n - 1 - j][i];
            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
            matrix[j][n - 1 - i] = temp;
        }
    }
}`,
        explanation: "Four-way swap moves elements to final positions directly in one pass. Most efficient but harder to understand."
      }
    ],
    tips: [
      "90° clockwise rotation = transpose + reverse rows",
      "Layer approach rotates from outer to inner layers",
      "Four-way swap moves elements to final positions directly",
      "In-place requirement eliminates extra space solutions"
    ],
    tags: ["matrix", "array", "math"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-matrix-3",
    question: "Set Matrix Zeroes - Given m×n matrix, if element is 0, set its entire row and column to 0.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) First Row/Column as Markers (O(m * n) time, O(1) space): Use first row and column as markers to avoid extra space. 2) Extra Space Approach (O(m * n) time, O(m + n) space): Use separate arrays to track zero rows and columns. 3) Brute Force with Markers: Mark zeros with special value then convert back. First row/column approach is most space-efficient, while extra space approach is clearer and easier to understand.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: First Row/Column as Markers (Optimal)
// Time: O(m * n), Space: O(1)
function setZeroes(matrix: number[][]): void {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let firstRowZero = false;
    let firstColZero = false;
    
    // Check if first row should be zero
    for (let j = 0; j < cols; j++) {
        if (matrix[0][j] === 0) {
            firstRowZero = true;
            break;
        }
    }
    
    // Check if first column should be zero
    for (let i = 0; i < rows; i++) {
        if (matrix[i][0] === 0) {
            firstColZero = true;
            break;
        }
    }
    
    // Use first row and column as markers
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            if (matrix[i][j] === 0) {
                matrix[i][0] = 0; // Mark row
                matrix[0][j] = 0; // Mark column
            }
        }
    }
    
    // Set zeros based on markers
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            if (matrix[i][0] === 0 || matrix[0][j] === 0) {
                matrix[i][j] = 0;
            }
        }
    }
    
    // Handle first row
    if (firstRowZero) {
        for (let j = 0; j < cols; j++) {
            matrix[0][j] = 0;
        }
    }
    
    // Handle first column
    if (firstColZero) {
        for (let i = 0; i < rows; i++) {
            matrix[i][0] = 0;
        }
    }
}`,
        explanation: "Uses first row and column as markers to avoid extra space. Most space-efficient approach."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Extra Space Approach (Clearer)
// Time: O(m * n), Space: O(m + n)
function setZeroesExtraSpace(matrix: number[][]): void {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const zeroRows = new Set<number>();
    const zeroCols = new Set<number>();
    
    // Find all zero positions
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j] === 0) {
                zeroRows.add(i);
                zeroCols.add(j);
            }
        }
    }
    
    // Set rows to zero
    for (const row of zeroRows) {
        for (let j = 0; j < cols; j++) {
            matrix[row][j] = 0;
        }
    }
    
    // Set columns to zero
    for (const col of zeroCols) {
        for (let i = 0; i < rows; i++) {
            matrix[i][col] = 0;
        }
    }
}`,
        explanation: "Uses separate arrays to track zero rows and columns. Clearer and easier to understand."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Brute Force with Markers
// Time: O(m * n), Space: O(1)
function setZeroesBruteForce(matrix: number[][]): void {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const MARKER = -1000000; // Special value to mark zeros
    
    // Mark zeros with special value
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j] === 0) {
                // Mark entire row
                for (let k = 0; k < cols; k++) {
                    if (matrix[i][k] !== 0) matrix[i][k] = MARKER;
                }
                // Mark entire column
                for (let k = 0; k < rows; k++) {
                    if (matrix[k][j] !== 0) matrix[k][j] = MARKER;
                }
            }
        }
    }
    
    // Convert markers back to zeros
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j] === MARKER) {
                matrix[i][j] = 0;
            }
        }
    }
}`,
        explanation: "Brute force approach marks zeros with special value then converts back. Simple but less efficient."
      }
    ],
    tips: [
      "Use first row and column as markers to save space",
      "Handle first row/column separately to avoid conflicts",
      "Two-pass approach: mark zeros, then set zeros",
      "Extra space approach is clearer but uses O(m+n) space"
    ],
    tags: ["matrix", "array"],
    estimatedTime: 25,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-matrix-4",
    question: "Search 2D Matrix - Write efficient algorithm to search for value in m×n matrix with sorted properties.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Binary Search (O(log(m * n)) time, O(1) space): For Matrix I (fully sorted) - treat as 1D array with coordinate conversion. 2) Search from Top-Right (O(m + n) time, O(1) space): For Matrix II (row and column sorted) - start from top-right and eliminate row or column. 3) Count Occurrences Extension: Find count of target value in sorted matrix. Binary search is optimal for fully sorted matrices, while top-right approach works for row/column sorted matrices.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Binary Search (Matrix I - fully sorted)
// Time: O(log(m * n)), Space: O(1)
function searchMatrix(matrix: number[][], target: number): boolean {
    if (!matrix || matrix.length === 0) return false;
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    let left = 0;
    let right = rows * cols - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midValue = matrix[Math.floor(mid / cols)][mid % cols];
        
        if (midValue === target) {
            return true;
        } else if (midValue < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return false;
}`,
        explanation: "Binary search treats matrix as 1D array with coordinate conversion. Optimal for fully sorted matrices."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Search from Top-Right (Matrix II - row and column sorted)
// Time: O(m + n), Space: O(1)
function searchMatrixII(matrix: number[][], target: number): boolean {
    if (!matrix || matrix.length === 0) return false;
    
    let row = 0;
    let col = matrix[0].length - 1;
    
    while (row < matrix.length && col >= 0) {
        if (matrix[row][col] === target) {
            return true;
        } else if (matrix[row][col] > target) {
            col--; // Move left
        } else {
            row++; // Move down
        }
    }
    
    return false;
}`,
        explanation: "Top-right approach eliminates row or column at each step. Works for row and column sorted matrices."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Count Occurrences in Sorted Matrix
// Time: O(m + n), Space: O(1)
function countInMatrix(matrix: number[][], target: number): number {
    let count = 0;
    let row = 0;
    let col = matrix[0].length - 1;
    
    while (row < matrix.length && col >= 0) {
        if (matrix[row][col] === target) {
            count++;
            col--; // Continue searching left
        } else if (matrix[row][col] > target) {
            col--;
        } else {
            row++;
        }
    }
    
    return count;
}`,
        explanation: "Extension that counts occurrences of target value in sorted matrix using top-right approach."
      }
    ],
    tips: [
      "Matrix I: treat as 1D array with coordinate conversion",
      "Matrix II: start from top-right, eliminate row or column",
      "Top-right approach: larger values down, smaller values left",
      "Binary search works when matrix is fully sorted"
    ],
    tags: ["matrix", "binary-search", "two-pointers"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-matrix-5",
    question: "Valid Sudoku - Determine if 9×9 Sudoku board is valid according to Sudoku rules.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    approach: "Multiple approaches available: 1) Hash Set Validation (O(1) time, O(1) space): Use sets to track seen numbers in rows, columns, and 3×3 boxes. 2) Bit Manipulation (O(1) time, O(1) space): Use bit masks to optimize space usage for tracking seen numbers. 3) Single Pass with String Encoding: Encode row, column, and box constraints as strings in single set. Hash set approach is most intuitive, while bit manipulation provides optimal space efficiency.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Hash Set Validation (Optimal)
// Time: O(1) - fixed 9×9 size, Space: O(1)
function isValidSudoku(board: string[][]): boolean {
    const rows = Array(9).fill(null).map(() => new Set<string>());
    const cols = Array(9).fill(null).map(() => new Set<string>());
    const boxes = Array(9).fill(null).map(() => new Set<string>());
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = board[i][j];
            
            if (cell === '.') continue;
            
            const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            
            if (rows[i].has(cell) || cols[j].has(cell) || boxes[boxIndex].has(cell)) {
                return false;
            }
            
            rows[i].add(cell);
            cols[j].add(cell);
            boxes[boxIndex].add(cell);
        }
    }
    
    return true;
}`,
        explanation: "Uses sets to track seen numbers in rows, columns, and 3×3 boxes. Most intuitive and clear approach."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Bit Manipulation Approach
// Time: O(1), Space: O(1)
function isValidSudokuBit(board: string[][]): boolean {
    const rows = new Array(9).fill(0);
    const cols = new Array(9).fill(0);
    const boxes = new Array(9).fill(0);
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === '.') continue;
            
            const num = parseInt(board[i][j]);
            const bit = 1 << (num - 1);
            const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            
            if ((rows[i] & bit) || (cols[j] & bit) || (boxes[boxIndex] & bit)) {
                return false;
            }
            
            rows[i] |= bit;
            cols[j] |= bit;
            boxes[boxIndex] |= bit;
        }
    }
    
    return true;
}`,
        explanation: "Uses bit masks to track seen numbers. Most space-efficient approach for this problem."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Single Pass with String Encoding
// Time: O(1), Space: O(1)
function isValidSudokuEncoded(board: string[][]): boolean {
    const seen = new Set<string>();
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = board[i][j];
            
            if (cell === '.') continue;
            
            const rowKey = \`row\${i}-\${cell}\`;
            const colKey = \`col\${j}-\${cell}\`;
            const boxKey = \`box\${Math.floor(i/3)}\${Math.floor(j/3)}-\${cell}\`;
            
            if (seen.has(rowKey) || seen.has(colKey) || seen.has(boxKey)) {
                return false;
            }
            
            seen.add(rowKey);
            seen.add(colKey);
            seen.add(boxKey);
        }
    }
    
    return true;
}`,
        explanation: "Single pass approach encodes constraints as strings. Elegant solution using one set for all constraints."
      }
    ],
    tips: [
      "Check three constraints: row, column, and 3×3 box",
      "Box index = (row/3)*3 + (col/3)",
      "Use sets to track seen numbers in each constraint",
      "Bit manipulation can optimize space usage"
    ],
    tags: ["matrix", "hash-table", "bit-manipulation"],
    estimatedTime: 20,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "enhanced-matrix-6",
    question: "Word Search II - Given 2D board and list of words, find all words that exist in the board.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    approach: "Multiple approaches available: 1) Trie + DFS Backtracking (O(m * n * 4^L) time, O(TRIE_SIZE) space): Build trie from words and use DFS to search board. 2) Optimized with Trie Pruning: Remove found words and prune empty trie nodes to optimize subsequent searches. 3) Brute Force DFS: Check each word individually using DFS (less efficient for multiple words). Trie approach is optimal for multiple word search, while pruning optimizes performance by removing found words and empty paths.",
    codeImplementation: [
      {
        language: "TypeScript",
        code: `// Approach 1: Trie + DFS Backtracking (Optimal)
// Time: O(m * n * 4^L), Space: O(TRIE_SIZE)
function findWordsInBoard(board: string[][], words: string[]): string[] {
    class TrieNode {
        children = new Map<string, TrieNode>();
        word: string | null = null;
    }
    
    // Build trie
    const root = new TrieNode();
    for (const word of words) {
        let node = root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.word = word;
    }
    
    const result: string[] = [];
    const rows = board.length;
    const cols = board[0].length;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    function dfs(row: number, col: number, node: TrieNode): void {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return;
        
        const char = board[row][col];
        if (char === '#' || !node.children.has(char)) return;
        
        node = node.children.get(char)!;
        
        if (node.word) {
            result.push(node.word);
            node.word = null; // Avoid duplicates
        }
        
        board[row][col] = '#'; // Mark visited
        
        for (const [dr, dc] of directions) {
            dfs(row + dr, col + dc, node);
        }
        
        board[row][col] = char; // Backtrack
    }
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            dfs(i, j, root);
        }
    }
    
    return result;
}`,
        explanation: "Trie + DFS approach enables efficient multi-word search. Builds trie from words and explores board using DFS."
      },
      {
        language: "TypeScript",
        code: `// Approach 2: Optimized with Trie Pruning
// Time: O(m * n * 4^L), Space: O(TRIE_SIZE)
function findWordsOptimized(board: string[][], words: string[]): string[] {
    class TrieNode {
        children = new Map<string, TrieNode>();
        word: string | null = null;
        
        removeWord(): void {
            this.word = null;
        }
        
        isEmpty(): boolean {
            return this.children.size === 0 && !this.word;
        }
    }
    
    const root = new TrieNode();
    
    // Build trie
    for (const word of words) {
        let node = root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.word = word;
    }
    
    const result: string[] = [];
    
    function dfs(row: number, col: number, parent: TrieNode | null, node: TrieNode): void {
        if (node.word) {
            result.push(node.word);
            node.removeWord();
        }
        
        if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) return;
        
        const char = board[row][col];
        if (char === '#' || !node.children.has(char)) return;
        
        const nextNode = node.children.get(char)!;
        board[row][col] = '#';
        
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of directions) {
            dfs(row + dr, col + dc, node, nextNode);
        }
        
        board[row][col] = char;
        
        // Prune empty nodes
        if (nextNode.isEmpty()) {
            node.children.delete(char);
        }
    }
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (root.children.has(board[i][j])) {
                dfs(i, j, null, root);
            }
        }
    }
    
    return result;
}`,
        explanation: "Optimized version with trie pruning. Removes found words and prunes empty nodes for better performance."
      },
      {
        language: "TypeScript",
        code: `// Approach 3: Brute Force DFS (Less Efficient)
// Time: O(m * n * 4^L * W), Space: O(L) where W = number of words
function findWordsBruteForce(board: string[][], words: string[]): string[] {
    const result: string[] = [];
    const rows = board.length;
    const cols = board[0].length;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    function dfs(row: number, col: number, word: string, index: number): boolean {
        if (index === word.length) return true;
        if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
        if (board[row][col] !== word[index]) return false;
        
        const temp = board[row][col];
        board[row][col] = '#';
        
        for (const [dr, dc] of directions) {
            if (dfs(row + dr, col + dc, word, index + 1)) {
                board[row][col] = temp;
                return true;
            }
        }
        
        board[row][col] = temp;
        return false;
    }
    
    for (const word of words) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (dfs(i, j, word, 0)) {
                    result.push(word);
                    break;
                }
            }
            if (result.includes(word)) break;
        }
    }
    
    return result;
}`,
        explanation: "Brute force approach checks each word individually using DFS. Less efficient for multiple words but simpler to implement."
      }
    ],
    tips: [
      "Trie enables efficient multi-word search",
      "DFS explores all paths from each starting position",
      "Mark cells as visited during DFS, restore after",
      "Prune trie nodes to optimize subsequent searches"
    ],
    tags: ["matrix", "trie", "dfs", "backtracking"],
    estimatedTime: 40,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  }
];
