/**
 * Code Execution Service
 * Supports multiple programming languages using Piston API
 * Piston is a free, open-source code execution engine
 */

export interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  executionTime?: number;
  complexity?: {
    time: string;
    space: string;
    analysis: string[];
  };
}

export interface ExecutionRequest {
  language: string;
  code: string;
  stdin?: string;
}

// Piston API endpoint (free and open-source)
const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mappings for Piston
const LANGUAGE_MAP: { [key: string]: { language: string; version: string } } = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  swift: { language: 'swift', version: '5.3.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
};

class CodeExecutionService {
  /**
   * Execute code using Piston API
   */
  async executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
    const { language, code, stdin } = request;

    try {
      // Check if language is supported
      const langConfig = LANGUAGE_MAP[language.toLowerCase()];
      
      if (!langConfig) {
        return {
          success: false,
          output: [
            `⚠️ Language "${language}" not yet configured for remote execution.`,
            `💡 Supported languages:`,
            ...Object.keys(LANGUAGE_MAP).map(lang => `  - ${lang}`),
          ],
        };
      }

      const startTime = Date.now();

      // Make request to Piston API
      const response = await fetch(`${PISTON_API}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [
            {
              name: this.getFileName(language),
              content: code,
            },
          ],
          stdin: stdin || '',
          args: [],
          compile_timeout: 10000, // 10 seconds
          run_timeout: 3000, // 3 seconds
          compile_memory_limit: -1,
          run_memory_limit: -1,
        }),
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Process the result
      const output: string[] = [];

      // Add compilation output if present
      if (result.compile && result.compile.output) {
        output.push('📝 Compilation Output:');
        output.push(result.compile.output);
      }

      // Add runtime output
      if (result.run) {
        if (result.run.stdout) {
          output.push(...result.run.stdout.split('\n'));
        }
        if (result.run.stderr) {
          output.push('❌ Error Output:');
          output.push(...result.run.stderr.split('\n'));
        }
        if (result.run.code !== 0 && result.run.code !== null) {
          output.push(`⚠️ Exit code: ${result.run.code}`);
        }
      }

      const success = !result.run?.stderr && result.run?.code === 0;

      return {
        success,
        output: output.length > 0 ? output : ['✅ Code executed successfully (no output)'],
        executionTime,
      };
    } catch (error: any) {
      return {
        success: false,
        output: [`❌ Execution failed: ${error.message}`],
        error: error.message,
      };
    }
  }

  /**
   * Execute JavaScript code locally in browser
   */
  executeJavaScriptLocally(code: string): ExecutionResult {
    const output: string[] = [];
    
    try {
      // Capture console.log
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args: any[]) => {
        output.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      console.error = (...args: any[]) => {
        output.push('❌ ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      console.warn = (...args: any[]) => {
        output.push('⚠️ ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      try {
        // Execute the code
        const func = new Function(code);
        const result = func();
        if (result !== undefined) {
          output.push(`=> ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
        }
      } catch (err: any) {
        output.push(`❌ Runtime Error: ${err.message}`);
        if (err.stack) {
          output.push(`Stack: ${err.stack}`);
        }
        return {
          success: false,
          output,
          error: err.message,
        };
      } finally {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      }

      return {
        success: true,
        output: output.length > 0 ? output : ['✅ Code executed successfully (no output)'],
      };
    } catch (error: any) {
      return {
        success: false,
        output: [`❌ Execution error: ${error.message}`],
        error: error.message,
      };
    }
  }

  /**
   * Execute HTML code by opening in new window
   */
  executeHTML(code: string): ExecutionResult {
    try {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(code);
        newWindow.document.close();
        return {
          success: true,
          output: ['✅ HTML opened in new window'],
        };
      } else {
        return {
          success: false,
          output: ['❌ Please allow popups to view HTML'],
          error: 'Popup blocked',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        output: [`❌ Failed to open HTML: ${error.message}`],
        error: error.message,
      };
    }
  }

  /**
   * Execute CSS code by creating a preview
   */
  executeCSS(code: string): ExecutionResult {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${code}</style>
        </head>
        <body>
          <h1>CSS Preview</h1>
          <p>This is a sample paragraph.</p>
          <button>Sample Button</button>
          <div class="container">
            <div class="box">Box 1</div>
            <div class="box">Box 2</div>
          </div>
        </body>
        </html>
      `;
      
      return this.executeHTML(htmlContent);
    } catch (error: any) {
      return {
        success: false,
        output: [`❌ Failed to preview CSS: ${error.message}`],
        error: error.message,
      };
    }
  }

  /**
   * Get appropriate filename for language
   */
  private getFileName(language: string): string {
    const fileNames: { [key: string]: string } = {
      javascript: 'index.js',
      typescript: 'index.ts',
      python: 'main.py',
      java: 'Main.java',
      cpp: 'main.cpp',
      c: 'main.c',
      csharp: 'Main.cs',
      go: 'main.go',
      rust: 'main.rs',
      ruby: 'main.rb',
      php: 'index.php',
      swift: 'main.swift',
      kotlin: 'Main.kt',
      html: 'index.html',
      css: 'style.css',
    };
    return fileNames[language.toLowerCase()] || 'main.txt';
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_MAP);
  }

  /**
   * Check if a language supports remote execution
   */
  isLanguageSupported(language: string): boolean {
    return language.toLowerCase() in LANGUAGE_MAP;
  }

  /**
   * Get execution method description for a language
   */
  getExecutionMethod(language: string): string {
    const lang = language.toLowerCase();
    
    if (lang === 'javascript' || lang === 'typescript') {
      return 'Runs locally in your browser for instant feedback';
    } else if (lang === 'html') {
      return 'Opens in a new browser window';
    } else if (lang === 'css') {
      return 'Opens preview with sample HTML';
    } else if (this.isLanguageSupported(lang)) {
      return 'Runs on Piston API (secure cloud execution)';
    } else {
      return 'Not yet configured for execution';
    }
  }

  /**
   * Analyze code complexity
   */
  analyzeComplexity(code: string, language: string): {
    time: string;
    space: string;
    analysis: string[];
  } {
    const lang = language.toLowerCase();
    const analysis: string[] = [];
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    // Count loops and nested structures
    const forLoops = (code.match(/\bfor\s*\(/g) || []).length;
    const whileLoops = (code.match(/\bwhile\s*\(/g) || []).length;
    const recursiveCalls = this.countRecursiveCalls(code, lang);
    const arrayOperations = (code.match(/\.(map|filter|reduce|forEach)/g) || []).length;
    const nestedLoops = this.detectNestedLoops(code);
    
    // Analyze arrays/lists created
    const arrayCreations = (code.match(/\[|\bnew\s+Array|list\(|vector<|ArrayList/g) || []).length;
    const mapCreations = (code.match(/\{.*:.*\}|Map|dict\(|HashMap|unordered_map/g) || []).length;

    // Time Complexity Analysis
    if (recursiveCalls > 0) {
      if (code.includes('fibonacci') && !code.includes('memo')) {
        timeComplexity = 'O(2^n)';
        analysis.push('⚠️ Exponential time - Recursive Fibonacci without memoization');
        analysis.push('💡 Consider using dynamic programming to optimize to O(n)');
      } else if (code.includes('factorial')) {
        timeComplexity = 'O(n)';
        analysis.push('✅ Linear time - Recursive calls proportional to input size');
      } else {
        timeComplexity = 'O(n) or higher';
        analysis.push('⚠️ Recursive function detected - complexity depends on recursion depth');
      }
    } else if (nestedLoops >= 3) {
      timeComplexity = 'O(n^3)';
      analysis.push('⚠️ Cubic time - Three or more nested loops detected');
      analysis.push('💡 Consider optimization or alternative algorithms');
    } else if (nestedLoops === 2) {
      timeComplexity = 'O(n^2)';
      analysis.push('⚠️ Quadratic time - Nested loops detected');
      analysis.push('💡 For large inputs, consider O(n log n) algorithms');
    } else if (forLoops + whileLoops + arrayOperations > 0) {
      timeComplexity = 'O(n)';
      analysis.push('✅ Linear time - Single loop or array operation');
    } else if (code.match(/\.(sort|sorted)/)) {
      timeComplexity = 'O(n log n)';
      analysis.push('✅ Linearithmic time - Sorting operation detected');
    } else {
      timeComplexity = 'O(1)';
      analysis.push('✅ Constant time - No loops detected');
    }

    // Space Complexity Analysis
    if (recursiveCalls > 0) {
      spaceComplexity = 'O(n)';
      analysis.push('📊 Space: O(n) - Recursion uses call stack');
    } else if (arrayCreations + mapCreations > 0) {
      if (nestedLoops > 0) {
        spaceComplexity = 'O(n^2)';
        analysis.push('📊 Space: O(n²) - Nested data structures created');
      } else {
        spaceComplexity = 'O(n)';
        analysis.push('📊 Space: O(n) - Arrays or maps created');
      }
    } else {
      spaceComplexity = 'O(1)';
      analysis.push('📊 Space: O(1) - Constant space usage');
    }

    return {
      time: timeComplexity,
      space: spaceComplexity,
      analysis,
    };
  }

  /**
   * Count recursive function calls
   */
  private countRecursiveCalls(code: string, language: string): number {
    const functionNames: string[] = [];
    
    // Extract function names
    if (language === 'javascript' || language === 'typescript') {
      const funcMatches = code.matchAll(/function\s+(\w+)/g);
      const arrowMatches = code.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g);
      functionNames.push(...Array.from(funcMatches, m => m[1]));
      functionNames.push(...Array.from(arrowMatches, m => m[1]));
    } else if (language === 'python') {
      const matches = code.matchAll(/def\s+(\w+)/g);
      functionNames.push(...Array.from(matches, m => m[1]));
    } else if (language === 'java' || language === 'cpp') {
      const matches = code.matchAll(/\w+\s+(\w+)\s*\([^)]*\)\s*\{/g);
      functionNames.push(...Array.from(matches, m => m[1]));
    }

    // Count how many functions call themselves
    let recursiveCount = 0;
    for (const funcName of functionNames) {
      const regex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
      const matches = code.match(regex) || [];
      if (matches.length > 1) { // Function name appears more than once (definition + call)
        recursiveCount++;
      }
    }

    return recursiveCount;
  }

  /**
   * Detect nested loops
   */
  private detectNestedLoops(code: string): number {
    const lines = code.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;
    
    for (const line of lines) {
      const loopStart = (line.match(/\bfor\s*\(|\bwhile\s*\(/g) || []).length;
      const loopEnd = (line.match(/\}/g) || []).length;
      
      currentNesting += loopStart;
      maxNesting = Math.max(maxNesting, currentNesting);
      currentNesting = Math.max(0, currentNesting - loopEnd);
    }
    
    return maxNesting;
  }
}

export const codeExecutionService = new CodeExecutionService();

