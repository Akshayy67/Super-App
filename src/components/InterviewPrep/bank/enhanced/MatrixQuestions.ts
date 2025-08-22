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
        language: "Python",
        code: `# Approach 1: Layer by Layer (Optimal)
# Time: O(m * n), Space: O(1) excluding output
def spiralOrder(matrix):
    if not matrix or not matrix[0]:
        return []
    
    result = []
    top = 0
    bottom = len(matrix) - 1
    left = 0
    right = len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        # Traverse right
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        
        # Traverse down
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        
        # Traverse left (if still valid row)
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        
        # Traverse up (if still valid column)
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    
    return result`,
        explanation: "Layer by Layer approach processes matrix from outside to inside. Most space-efficient with clear boundary management."
      },
      {
        language: "Java",
        code: `// Approach 1: Layer by Layer (Optimal)
// Time: O(m * n), Space: O(1) excluding output
import java.util.*;
class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        if (matrix == null || matrix.length == 0) return new ArrayList<>();
        
        List<Integer> result = new ArrayList<>();
        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;
        
        while (top <= bottom && left <= right) {
            // Traverse right
            for (int col = left; col <= right; col++) {
                result.add(matrix[top][col]);
            }
            top++;
            
            // Traverse down
            for (int row = top; row <= bottom; row++) {
                result.add(matrix[row][right]);
            }
            right--;
            
            // Traverse left (if still valid row)
            if (top <= bottom) {
                for (int col = right; col >= left; col--) {
                    result.add(matrix[bottom][col]);
                }
                bottom--;
            }
            
            // Traverse up (if still valid column)
            if (left <= right) {
                for (int row = bottom; row >= top; row--) {
                    result.add(matrix[row][left]);
                }
                left++;
            }
        }
        
        return result;
    }
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
        language: "Python",
        code: `# Approach 2: Direction-based Approach
# Time: O(m * n), Space: O(m * n)
def spiralOrderDirection(matrix):
    if not matrix or not matrix[0]:
        return []
    
    result = []
    rows = len(matrix)
    cols = len(matrix[0])
    visited = [[False] * cols for _ in range(rows)]
    
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)] # right, down, left, up
    dir_index = 0
    row, col = 0, 0
    
    for _ in range(rows * cols):
        result.append(matrix[row][col])
        visited[row][col] = True
        
        dr, dc = directions[dir_index]
        new_row = row + dr
        new_col = col + dc
        
        if (new_row < 0 or new_row >= rows or new_col < 0 or 
            new_col >= cols or visited[new_row][new_col]):
            dir_index = (dir_index + 1) % 4
            new_dr, new_dc = directions[dir_index]
            row += new_dr
            col += new_dc
        else:
            row = new_row
            col = new_col
    
    return result`,
        explanation: "Direction-based approach uses direction array and visited matrix. More flexible but uses extra space."
      },
      {
        language: "Java",
        code: `// Approach 3: Recursive Approach
// Time: O(m * n), Space: O(m * n) for call stack
import java.util.*;
class Solution {
    public List<Integer> spiralOrderRecursive(int[][] matrix) {
        if (matrix == null || matrix.length == 0) return new ArrayList<>();
        
        List<Integer> result = new ArrayList<>();
        
        void spiralLayer(int top, int bottom, int left, int right) {
            if (top > bottom || left > right) return;
            
            // Single row
            if (top == bottom) {
                for (int col = left; col <= right; col++) {
                    result.add(matrix[top][col]);
                }
                return;
            }
            
            // Single column
            if (left == right) {
                for (int row = top; row <= bottom; row++) {
                    result.add(matrix[row][left]);
                }
                return;
            }
            
            // Traverse outer layer
            for (int col = left; col <= right; col++) result.add(matrix[top][col]);
            for (int row = top + 1; row <= bottom; row++) result.add(matrix[row][right]);
            for (int col = right - 1; col >= left; col--) result.add(matrix[bottom][col]);
            for (int row = bottom - 1; row > top; row--) result.add(matrix[row][left]);
            
            // Recursively process inner submatrix
            spiralLayer(top + 1, bottom - 1, left + 1, right - 1);
        }
        
        spiralLayer(0, matrix.length - 1, 0, matrix[0].length - 1);
        return result;
    }
}`,
        explanation: "Recursive approach processes outer layer and recursively handles inner submatrix. Elegant but uses call stack space."
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
      },
      {
        language: "Python",
        code: `# Approach 3: Recursive Approach
# Time: O(m * n), Space: O(m * n) for call stack
def spiralOrderRecursive(matrix):
    if not matrix or not matrix[0]:
        return []
    
    result = []
    
    def spiralLayer(top, bottom, left, right):
        if top > bottom or left > right:
            return
        
        # Single row
        if top == bottom:
            for col in range(left, right + 1):
                result.append(matrix[top][col])
            return
        
        # Single column
        if left == right:
            for row in range(top, bottom + 1):
                result.append(matrix[row][left])
            return
        
        # Traverse outer layer
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        for row in range(top + 1, bottom + 1):
            result.append(matrix[row][right])
        for col in range(right - 1, left - 1, -1):
            result.append(matrix[bottom][col])
        for row in range(bottom - 1, top, -1):
            result.append(matrix[row][left])
        
        # Recursively process inner submatrix
        spiralLayer(top + 1, bottom - 1, left + 1, right - 1)
    
    spiralLayer(0, len(matrix) - 1, 0, len(matrix[0]) - 1)
    return result`,
        explanation: "Recursive approach processes outer layer and recursively handles inner submatrix. Elegant but uses call stack space."
      },
      {
        language: "Java",
        code: `// Approach 1: Transpose + Reverse (Optimal)
// Time: O(n²), Space: O(1)
import java.util.*;
class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        
        // Step 1: Transpose matrix (swap matrix[i][j] with matrix[j][i])
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
        
        // Step 2: Reverse each row
        for (int i = 0; i < n; i++) {
            int left = 0;
            int right = n - 1;
            while (left < right) {
                int temp = matrix[i][left];
                matrix[i][left] = matrix[i][right];
                matrix[i][right] = temp;
                left++;
                right--;
            }
        }
    }
}`,
        explanation: "Transpose + Reverse approach is most intuitive. 90° clockwise rotation = transpose + reverse rows."
      },
      {
        language: "Python",
        code: `# Approach 1: Transpose + Reverse (Optimal)
# Time: O(n²), Space: O(1)
def rotate(matrix):
    n = len(matrix)
    
    # Step 1: Transpose matrix (swap matrix[i][j] with matrix[j][i])
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    
    # Step 2: Reverse each row
    for i in range(n):
        left, right = 0, n - 1
        while left < right:
            matrix[i][left], matrix[i][right] = matrix[i][right], matrix[i][left]
            left += 1
            right -= 1`,
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
        language: "Python",
        code: `# Approach 2: Layer by Layer Rotation
# Time: O(n²), Space: O(1)
def rotateLayered(matrix):
    n = len(matrix)
    
    for layer in range(n // 2):
        first = layer
        last = n - 1 - layer
        
        for i in range(first, last):
            offset = i - first
            
            # Save top element
            top = matrix[first][i]
            
            # top = left
            matrix[first][i] = matrix[last - offset][first]
            
            # left = bottom
            matrix[last - offset][first] = matrix[last][last - offset]
            
            # bottom = right
            matrix[last][last - offset] = matrix[i][last]
            
            # right = top
            matrix[i][last] = top`,
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
      },
      {
        language: "Python",
        code: `# Approach 3: Four-way Swap in One Pass
# Time: O(n²), Space: O(1)
def rotateFourWay(matrix):
    n = len(matrix)
    
    for i in range(n // 2):
        for j in range(i, n - 1 - i):
            # Four-way rotation
            temp = matrix[i][j]
            matrix[i][j] = matrix[n - 1 - j][i]
            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j]
            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i]
            matrix[j][n - 1 - i] = temp`,
        explanation: "Four-way swap moves elements to final positions directly in one pass. Most efficient but harder to understand."
      },
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
        language: "Python",
        code: `# Approach 1: First Row/Column as Markers (Optimal)
# Time: O(m * n), Space: O(1)
def setZeroes(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    firstRowZero = False
    firstColZero = False
    
    # Check if first row should be zero
    for j in range(cols):
        if matrix[0][j] == 0:
            firstRowZero = True
            break
    
    # Check if first column should be zero
    for i in range(rows):
        if matrix[i][0] == 0:
            firstColZero = True
            break
    
    # Use first row and column as markers
    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][j] == 0:
                matrix[i][0] = 0 # Mark row
                matrix[0][j] = 0 # Mark column
    
    # Set zeros based on markers
    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    
    # Handle first row
    if firstRowZero:
        for j in range(cols):
            matrix[0][j] = 0
    
    # Handle first column
    if firstColZero:
        for i in range(rows):
            matrix[i][0] = 0`,
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
        language: "Python",
        code: `# Approach 2: Extra Space Approach (Clearer)
# Time: O(m * n), Space: O(m + n)
def setZeroesExtraSpace(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    zeroRows = set()
    zeroCols = set()
    
    # Find all zero positions
    for i in range(rows):
        for j in range(cols):
            if matrix[i][j] == 0:
                zeroRows.add(i)
                zeroCols.add(j)
    
    # Set rows to zero
    for row in zeroRows:
        for j in range(cols):
            matrix[row][j] = 0
    
    # Set columns to zero
    for col in zeroCols:
        for i in range(rows):
            matrix[i][col] = 0`,
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
      },
      {
        language: "Python",
        code: `# Approach 3: Brute Force with Markers
# Time: O(m * n), Space: O(1)
def setZeroesBruteForce(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    MARKER = -1000000 # Special value to mark zeros
    
    # Mark zeros with special value
    for i in range(rows):
        for j in range(cols):
            if matrix[i][j] == 0:
                # Mark entire row
                for k in range(cols):
                    if matrix[i][k] != 0:
                        matrix[i][k] = MARKER
                # Mark entire column
                for k in range(rows):
                    if matrix[k][j] != 0:
                        matrix[k][j] = MARKER
    
    # Convert markers back to zeros
    for i in range(rows):
        for j in range(cols):
            if matrix[i][j] == MARKER:
                matrix[i][j] = 0`,
        explanation: "Brute force approach marks zeros with special value then converts back. Simple but less efficient."
      },
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
        language: "Python",
        code: `# Approach 1: Binary Search (Matrix I - fully sorted)
# Time: O(log(m * n)), Space: O(1)
def searchMatrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    
    rows = len(matrix)
    cols = len(matrix[0])
    left = 0
    right = rows * cols - 1
    
    while left <= right:
        mid = (left + right) // 2
        midValue = matrix[mid // cols][mid % cols]
        
        if midValue == target:
            return True
        elif midValue < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return False`,
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
        language: "Python",
        code: `# Approach 2: Search from Top-Right (Matrix II - row and column sorted)
# Time: O(m + n), Space: O(1)
def searchMatrixII(matrix, target):
    if not matrix or not matrix[0]:
        return False
    
    row = 0
    col = len(matrix[0]) - 1
    
    while row < len(matrix) and col >= 0:
        if matrix[row][col] == target:
            return True
        elif matrix[row][col] > target:
            col -= 1 # Move left
        else:
            row += 1 # Move down
    
    return False`,
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
      },
      {
        language: "Python",
        code: `# Approach 3: Count Occurrences in Sorted Matrix
# Time: O(m + n), Space: O(1)
def countInMatrix(matrix, target):
    count = 0
    row = 0
    col = len(matrix[0]) - 1
    
    while row < len(matrix) and col >= 0:
        if matrix[row][col] == target:
            count += 1
            col -= 1 # Continue searching left
        elif matrix[row][col] > target:
            col -= 1
        else:
            row += 1
    
    return count`,
        explanation: "Extension that counts occurrences of target value in sorted matrix using top-right approach."
      },
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
        language: "Python",
        code: `# Approach 1: Hash Set Validation (Optimal)
# Time: O(1) - fixed 9×9 size, Space: O(1)
def isValidSudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    
    for i in range(9):
        for j in range(9):
            cell = board[i][j]
            
            if cell == '.':
                continue
            
            box_index = (i // 3) * 3 + (j // 3)
            
            if cell in rows[i] or cell in cols[j] or cell in boxes[box_index]:
                return False
            
            rows[i].add(cell)
            cols[j].add(cell)
            boxes[box_index].add(cell)
    
    return True`,
        explanation: "Uses sets to track seen numbers in rows, columns, and 3×3 boxes. Most intuitive and clear approach."
      },
      {
        language: "Java",
        code: `// Approach 1: Hash Set Validation (Optimal)
// Time: O(1) - fixed 9×9 size, Space: O(1)
import java.util.*;
class Solution {
    public boolean isValidSudoku(char[][] board) {
        Set<String> seenRows = new HashSet<>();
        Set<String> seenCols = new HashSet<>();
        Set<String> seenBoxes = new HashSet<>();
        
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char cell = board[i][j];
                
                if (cell == '.') continue;
                
                int boxIndex = (i / 3) * 3 + (j / 3);
                
                String rowKey = "row" + i + "-" + cell;
                String colKey = "col" + j + "-" + cell;
                String boxKey = "box" + boxIndex + "-" + cell;
                
                if (seenRows.contains(rowKey) || seenCols.contains(colKey) || seenBoxes.contains(boxKey)) {
                    return false;
                }
                
                seenRows.add(rowKey);
                seenCols.add(colKey);
                seenBoxes.add(boxKey);
            }
        }
        
        return true;
    }
}`,
        explanation: "Uses sets to track seen numbers in rows, columns, and 3×3 boxes. Most intuitive and clear approach."
      },
      {
        language: "Python",
        code: `# Approach 1: Hash Set Validation (Optimal)
# Time: O(1) - fixed 9×9 size, Space: O(1)
def isValidSudoku(board):
    seen = set()
    
    for i in range(9):
        for j in range(9):
            cell = board[i][j]
            
            if cell == '.':
                continue
            
            row_key = f"row{i}-{cell}"
            col_key = f"col{j}-{cell}"
            box_key = f"box{(i // 3)}{(j // 3)}-{cell}"
            
            if row_key in seen or col_key in seen or box_key in seen:
                return False
            
            seen.add(row_key)
            seen.add(col_key)
            seen.add(box_key)
    
    return True`,
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
        language: "Python",
        code: `# Approach 2: Bit Manipulation Approach
# Time: O(1), Space: O(1)
def isValidSudokuBit(board):
    rows = [0] * 9
    cols = [0] * 9
    boxes = [0] * 9
    
    for i in range(9):
        for j in range(9):
            if board[i][j] == '.':
                continue
            
            num = int(board[i][j])
            bit = 1 << (num - 1)
            box_index = (i // 3) * 3 + (j // 3)
            
            if (rows[i] & bit) or (cols[j] & bit) or (boxes[box_index] & bit):
                return False
            
            rows[i] |= bit
            cols[j] |= bit
            boxes[box_index] |= bit
    
    return True`,
        explanation: "Uses bit masks to track seen numbers. Most space-efficient approach for this problem."
      },
      {
        language: "Java",
        code: `// Approach 2: Bit Manipulation Approach
// Time: O(1), Space: O(1)
import java.util.*;
class Solution {
    public boolean isValidSudokuBit(char[][] board) {
        int[] rows = new int[9];
        int[] cols = new int[9];
        int[] boxes = new int[9];
        
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') continue;
                
                int num = board[i][j] - '0';
                int bit = 1 << (num - 1);
                int boxIndex = (i / 3) * 3 + (j / 3);
                
                if ((rows[i] & bit) != 0 || (cols[j] & bit) != 0 || (boxes[boxIndex] & bit) != 0) {
                    return false;
                }
                
                rows[i] |= bit;
                cols[j] |= bit;
                boxes[boxIndex] |= bit;
            }
        }
        
        return true;
    }
}`,
        explanation: "Uses bit masks to track seen numbers. Most space-efficient approach for this problem."
      },
      {
        language: "Python",
        code: `# Approach 2: Bit Manipulation Approach
# Time: O(1), Space: O(1)
def isValidSudokuBit(board):
    rows = [0] * 9
    cols = [0] * 9
    boxes = [0] * 9
    
    for i in range(9):
        for j in range(9):
            if board[i][j] == '.':
                continue
            
            num = int(board[i][j])
            bit = 1 << (num - 1)
            box_index = (i // 3) * 3 + (j // 3)
            
            if (rows[i] & bit) or (cols[j] & bit) or (boxes[box_index] & bit):
                return False
            
            rows[i] |= bit
            cols[j] |= bit
            boxes[box_index] |= bit
    
    return True`,
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
      },
      {
        language: "Python",
        code: `# Approach 3: Single Pass with String Encoding
# Time: O(1), Space: O(1)
def isValidSudokuEncoded(board):
    seen = set()
    
    for i in range(9):
        for j in range(9):
            cell = board[i][j]
            
            if cell == '.':
                continue
            
            row_key = f"row{i}-{cell}"
            col_key = f"col{j}-{cell}"
            box_key = f"box{(i // 3)}{(j // 3)}-{cell}"
            
            if row_key in seen or col_key in seen or box_key in seen:
                return False
            
            seen.add(row_key)
            seen.add(col_key)
            seen.add(box_key)
    
    return True`,
        explanation: "Single pass approach encodes constraints as strings. Elegant solution using one set for all constraints."
      },
      {
        language: "Java",
        code: `// Approach 3: Single Pass with String Encoding
// Time: O(1), Space: O(1)
import java.util.*;
class Solution {
    public boolean isValidSudokuEncoded(char[][] board) {
        Set<String> seen = new HashSet<>();
        
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char cell = board[i][j];
                
                if (cell == '.') continue;
                
                String rowKey = "row" + i + "-" + cell;
                String colKey = "col" + j + "-" + cell;
                String boxKey = "box" + (i / 3) + (j / 3) + "-" + cell;
                
                if (seen.contains(rowKey) || seen.contains(colKey) || seen.contains(boxKey)) {
                    return false;
                }
                
                seen.add(rowKey);
                seen.add(colKey);
                seen.add(boxKey);
            }
        }
        
        return true;
    }
}`,
        explanation: "Single pass approach encodes constraints as strings. Elegant solution using one set for all constraints."
      },
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
        language: "Python",
        code: `# Approach 1: Trie + DFS Backtracking (Optimal)
# Time: O(m * n * 4^L), Space: O(TRIE_SIZE)
def findWordsInBoard(board, words):
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.word = None
    
    # Build trie
    root = TrieNode()
    for word in words:
        node = root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.word = word
    
    result = []
    rows = len(board)
    cols = len(board[0])
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    
    def dfs(row, col, node):
        if row < 0 or row >= rows or col < 0 or col >= cols:
            return
        
        char = board[row][col]
        if char == '#' or char not in node.children:
            return
        
        node = node.children[char]
        
        if node.word:
            result.append(node.word)
            node.word = None # Avoid duplicates
        
        board[row][col] = '#' # Mark visited
        
        for dr, dc in directions:
            dfs(row + dr, col + dc, node)
        
        board[row][col] = char # Backtrack
    
    for i in range(rows):
        for j in range(cols):
            dfs(i, j, root)
    
    return result`,
        explanation: "Trie + DFS approach enables efficient multi-word search. Builds trie from words and explores board using DFS."
      },
      {
        language: "Java",
        code: `// Approach 2: Optimized with Trie Pruning
// Time: O(m * n * 4^L), Space: O(TRIE_SIZE)
import java.util.*;
class Solution {
    public List<String> findWordsOptimized(char[][] board, String[] words) {
        class TrieNode {
            Map<Character, TrieNode> children = new HashMap<>();
            String word = null;
            
            void removeWord() {
                this.word = null;
            }
            
            boolean isEmpty() {
                return this.children.size() == 0 && this.word == null;
            }
        }
        
        TrieNode root = new TrieNode();
        
        // Build trie
        for (String word : words) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node.children.putIfAbsent(c, new TrieNode());
                node = node.children.get(c);
            }
            node.word = word;
        }
        
        List<String> result = new ArrayList<>();
        
        void dfs(int row, int col, TrieNode parent, TrieNode node) {
            if (node.word != null) {
                result.add(node.word);
                node.removeWord();
            }
            
            if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) return;
            
            char c = board[row][col];
            if (c == '#' || !node.children.containsKey(c)) return;
            
            TrieNode nextNode = node.children.get(c);
            board[row][col] = '#';
            
            int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
            for (int[] dir : directions) {
                dfs(row + dir[0], col + dir[1], node, nextNode);
            }
            
            board[row][col] = c;
            
            // Prune empty nodes
            if (nextNode.isEmpty()) {
                parent.children.remove(c);
            }
        }
        
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                if (root.children.containsKey(board[i][j])) {
                    dfs(i, j, null, root);
                }
            }
        }
        
        return result;
    }
}`,
        explanation: "Optimized version with trie pruning. Removes found words and prunes empty nodes for better performance."
      },
      {
        language: "Python",
        code: `# Approach 2: Optimized with Trie Pruning
# Time: O(m * n * 4^L), Space: O(TRIE_SIZE)
def findWordsOptimized(board, words):
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.word = None
        
        def removeWord(self):
            self.word = None
        
        def isEmpty(self):
            return len(self.children) == 0 and self.word is None
    
    root = TrieNode()
    
    # Build trie
    for word in words:
        node = root
        for char in word:
            node.children[char] = node.children.get(char, TrieNode())
            node = node.children[char]
        node.word = word
    
    result = []
    
    def dfs(row, col, parent, node):
        if node.word:
            result.append(node.word)
            node.removeWord()
        
        if row < 0 or row >= len(board) or col < 0 or col >= len(board[0]):
            return
        
        char = board[row][col]
        if char == '#' or char not in node.children:
            return
        
        nextNode = node.children[char]
        board[row][col] = '#'
        
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        for dr, dc in directions:
            dfs(row + dr, col + dc, node, nextNode)
        
        board[row][col] = char
        
        # Prune empty nodes
        if nextNode.isEmpty():
            parent.children.pop(char)
    
    for i in range(len(board)):
        for j in range(len(board[0])):
            if board[i][j] in root.children:
                dfs(i, j, None, root)
    
    return result`,
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
      },
      {
        language: "Python",
        code: `# Approach 3: Brute Force DFS (Less Efficient)
# Time: O(m * n * 4^L * W), Space: O(L) where W = number of words
def findWordsBruteForce(board, words):
    result = []
    rows = len(board)
    cols = len(board[0])
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    
    def dfs(row, col, word, index):
        if index == len(word):
            return True
        if row < 0 or row >= rows or col < 0 or col >= cols:
            return False
        if board[row][col] != word[index]:
            return False
        
        temp = board[row][col]
        board[row][col] = '#'
        
        for dr, dc in directions:
            if dfs(row + dr, col + dc, word, index + 1):
                board[row][col] = temp
                return True
        
        board[row][col] = temp
        return False
    
    for word in words:
        for i in range(rows):
            for j in range(cols):
                if dfs(i, j, word, 0):
                    result.append(word)
                    break
                if word in result:
                    break
    
    return result`,
        explanation: "Brute force approach checks each word individually using DFS. Less efficient for multiple words but simpler to implement."
      },
      {
        language: "Java",
        code: `// Approach 3: Brute Force DFS (Less Efficient)
// Time: O(m * n * 4^L * W), Space: O(L) where W = number of words
import java.util.*;
class Solution {
    public List<String> findWordsBruteForce(char[][] board, String[] words) {
        List<String> result = new ArrayList<>();
        int rows = board.length;
        int cols = board[0].length;
        int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        
        boolean dfs(int row, int col, String word, int index) {
            if (index == word.length()) return true;
            if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
            if (board[row][col] != word.charAt(index)) return false;
            
            char temp = board[row][col];
            board[row][col] = '#';
            
            for (int[] dir : directions) {
                if (dfs(row + dir[0], col + dir[1], word, index + 1)) {
                    board[row][col] = temp;
                    return true;
                }
            }
            
            board[row][col] = temp;
            return false;
        }
        
        for (String word : words) {
            for (int i = 0; i < rows; i++) {
                for (int j = 0; j < cols; j++) {
                    if (dfs(i, j, word, 0)) {
                        result.add(word);
                        break;
                    }
                }
                if (result.contains(word)) break;
            }
        }
        
        return result;
    }
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
