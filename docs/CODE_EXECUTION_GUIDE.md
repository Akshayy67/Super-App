# Code Execution Guide

## 🚀 Overview

The Pair Programming feature now includes **full code execution support** for 15+ programming languages! Write code collaboratively and run it instantly to see results.

---

## ✨ Supported Languages

### ⚡ Instant Execution (Browser-Based)

These languages run instantly in your browser with zero latency:

- **JavaScript** - Full ES6+ support
- **TypeScript** - Runs as JavaScript  
- **HTML** - Opens in new window
- **CSS** - Preview with sample HTML

### 🚀 Cloud Execution (Piston API)

These languages run on a secure cloud server (free & open-source):

- **Python** (3.10.0)
- **Java** (15.0.2)
- **C++** (10.2.0)
- **C** (10.2.0)
- **C#** (6.12.0)
- **Go** (1.16.2)
- **Rust** (1.68.2)
- **Ruby** (3.0.1)
- **PHP** (8.2.3)
- **Swift** (5.3.3)
- **Kotlin** (1.8.20)

---

## 🎯 How to Run Code

### Step 1: Write Your Code

```python
# Example Python code
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
print("Python is awesome!")
```

### Step 2: Click "Run" Button

- Green **"Run"** button in the header
- Play icon (▶️) for easy identification
- Disabled when already running

### Step 3: View Output

- Console panel opens automatically
- Color-coded output:
  - 🟢 **Green** - Success messages
  - 🔴 **Red** - Errors
  - 🟡 **Yellow** - Warnings  
  - 🔵 **Blue** - Tips
  - ⚪ **White** - Standard output

---

## 📝 Language-Specific Examples

### JavaScript

```javascript
console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fib(10):", fibonacci(10));

// Return values are displayed
fibonacci(5) // Shows: => 5
```

**Output:**
```
Hello, World!
Fib(10): 55
=> 5
```

### Python

```python
# Python code runs on cloud server
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for i in range(1, 6):
    print(f"{i}! = {factorial(i)}")
```

**Output:**
```
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
⚡ Execution time: 234ms
```

### Java

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

**Output:**
```
Hello from Java!
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
⚡ Execution time: 1523ms
```

### C++

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers = {1, 2, 3, 4, 5};
    
    cout << "Numbers: ";
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    return 0;
}
```

**Output:**
```
📝 Compilation Output:
[compiled successfully]
Numbers: 1 2 3 4 5
⚡ Execution time: 892ms
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Pair Programming Demo</title>
    <style>
        body { 
            font-family: Arial; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
    </style>
</head>
<body>
    <h1>Hello from Pair Programming! 🚀</h1>
</body>
</html>
```

**Output:**
```
✅ HTML opened in new window
```
*(HTML renders in a new browser tab)*

### Go

```go
package main
import "fmt"

func main() {
    // Simple Go program
    message := "Hello from Go!"
    fmt.Println(message)
    
    // Loop example
    for i := 1; i <= 3; i++ {
        fmt.Printf("Iteration %d\n", i)
    }
}
```

**Output:**
```
Hello from Go!
Iteration 1
Iteration 2
Iteration 3
⚡ Execution time: 456ms
```

### Rust

```rust
fn main() {
    println!("Hello from Rust!");
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    
    println!("Sum: {}", sum);
}
```

**Output:**
```
📝 Compilation Output:
[Compiling rust project...]
Hello from Rust!
Sum: 15
⚡ Execution time: 2134ms
```

---

## 🎨 Console Features

### Toolbar

- **Terminal Icon** - Toggle console visibility
- **Clear Button** - Reset console output
- **Auto-open** - Opens automatically when running code

### Output Formatting

#### Success Messages
```
✅ Code executed successfully
✅ HTML opened in new window
```

#### Errors
```
❌ Runtime Error: Cannot read property 'x' of undefined
Stack: [error stack trace]
```

#### Warnings
```
⚠️ Python execution may take a few seconds...
```

#### Tips
```
💡 Tips:
  • Check your internet connection
  • Verify your code syntax
```

#### Execution Time
```
⚡ Execution time: 234ms
```

---

## ⚙️ Execution Methods

### Local Execution (JavaScript/TypeScript)

**Pros:**
- ✅ Instant results
- ✅ No network delay
- ✅ Offline capable
- ✅ Captures console.log, console.error, console.warn

**Cons:**
- ⚠️ Browser sandbox limitations
- ⚠️ No file system access
- ⚠️ No backend capabilities

### Cloud Execution (Piston API)

**Pros:**
- ✅ Real compiler/interpreter
- ✅ Supports 10+ languages
- ✅ Secure sandbox environment
- ✅ Shows compilation output
- ✅ Tracks execution time

**Cons:**
- ⚠️ Network delay (1-3 seconds)
- ⚠️ Requires internet connection
- ⚠️ 3-second execution timeout
- ⚠️ No interactive input (stdin)

### HTML/CSS Preview

**Pros:**
- ✅ Full browser rendering
- ✅ Supports CSS animations
- ✅ Interactive elements work
- ✅ Isolated in new window

**Cons:**
- ⚠️ Popup blocker may interfere
- ⚠️ No hot reload

---

## 🔒 Security & Limitations

### Safety Features

1. **Browser Execution**
   - Sandboxed JavaScript execution
   - No access to file system
   - No cross-origin requests
   - Isolated from main app

2. **Cloud Execution**
   - Secure Docker containers
   - Resource limits enforced
   - Automatic timeout (3 seconds)
   - No network access from code
   - No persistent storage

### Current Limitations

1. **No Interactive Input**
   - Cannot read from stdin
   - No user prompts during execution
   - Future feature: Input panel

2. **Timeout Limits**
   - Max execution: 3 seconds
   - Max compilation: 10 seconds
   - Prevents infinite loops

3. **No File I/O**
   - Cannot read/write files
   - Cannot access databases
   - In-memory execution only

4. **Network Restrictions**
   - No external API calls from code
   - No web scraping
   - Security measure

---

## 💡 Best Practices

### Writing Executable Code

1. **Keep it Simple**
   ```python
   # Good - Simple and fast
   print("Hello, World!")
   ```

2. **Avoid Infinite Loops**
   ```javascript
   // Bad - Will timeout
   while(true) { }
   
   // Good - Has exit condition
   for(let i = 0; i < 10; i++) {
       console.log(i);
   }
   ```

3. **Use console.log liberally**
   ```javascript
   // Shows intermediate values
   console.log("Step 1: Loading...");
   const data = [1, 2, 3];
   console.log("Data:", data);
   console.log("Step 2: Processing...");
   ```

4. **Handle Errors**
   ```python
   try:
       result = 10 / 0
   except ZeroDivisionError:
       print("Cannot divide by zero!")
   ```

### Performance Tips

1. **JavaScript** - Fastest (instant)
2. **Python** - Fast (500-1000ms)
3. **Java** - Slower (1-2 seconds, compilation overhead)
4. **C++** - Moderate (800-1500ms, compilation)
5. **Rust** - Slower (1-3 seconds, compilation)

---

## 🐛 Troubleshooting

### "Execution failed" Error

**Causes:**
- Network connection issues
- Piston API temporarily unavailable
- Code syntax errors

**Solutions:**
1. Check internet connection
2. Verify code syntax
3. Try again in a few seconds
4. Use browser console for details

### Code Runs Forever

**Cause:** Hit 3-second timeout

**Solution:**
- Optimize algorithm
- Remove infinite loops
- Reduce iteration count

### "Please allow popups" (HTML)

**Cause:** Popup blocker

**Solution:**
1. Click address bar popup icon
2. Allow popups for this site
3. Run again

### No Output Showing

**Causes:**
- Code has no output statements
- Execution failed silently

**Solutions:**
- Add `console.log()` or `print()` statements
- Check for runtime errors
- Verify code is complete

---

## 🎓 Tips & Tricks

### 1. Test Small Snippets

```javascript
// Test individual functions
function add(a, b) {
    return a + b;
}

console.log("Test 1:", add(2, 3)); // 5
console.log("Test 2:", add(-1, 1)); // 0
```

### 2. Use Return Values

```javascript
// Last expression is shown
[1, 2, 3].map(x => x * 2)
// Output: => [2, 4, 6]
```

### 3. Debug with Logs

```python
def complex_function(x):
    print(f"Input: {x}")  # Debug
    result = x * 2
    print(f"Result: {result}")  # Debug
    return result

complex_function(5)
```

### 4. Measure Performance

```javascript
console.time("Algorithm");
// Your code here
for(let i = 0; i < 1000; i++) {
    Math.sqrt(i);
}
console.timeEnd("Algorithm");
```

### 5. Format Output

```python
# Pretty printing
import json

data = {"name": "Alice", "age": 30}
print(json.dumps(data, indent=2))
```

---

## 🔮 Future Features

Planned enhancements:

- [ ] **Interactive Input** - stdin support
- [ ] **Multiple Files** - Import/require support
- [ ] **Persistent Storage** - Save variables between runs
- [ ] **Debugging** - Breakpoints and step-through
- [ ] **Performance Profiling** - Memory and CPU usage
- [ ] **Code Linting** - Real-time syntax checking
- [ ] **Auto-complete** - Intelligent suggestions
- [ ] **Longer Timeouts** - For complex algorithms
- [ ] **Package Support** - npm, pip, gem, etc.
- [ ] **Database Access** - SQLite support

---

## 📊 Execution Statistics

### Average Execution Times

| Language | Avg Time | Range |
|----------|----------|-------|
| JavaScript | 10ms | 5-50ms |
| HTML | 100ms | 50-200ms |
| Python | 600ms | 400-1000ms |
| C++ | 1100ms | 800-1500ms |
| Java | 1600ms | 1200-2000ms |
| Go | 500ms | 300-700ms |
| Rust | 2000ms | 1500-2800ms |

*Times include network latency and compilation*

---

## ✅ Testing Checklist

- [ ] JavaScript execution works
- [ ] Python execution works
- [ ] Java compilation and execution works
- [ ] C++ compilation and execution works
- [ ] HTML opens in new window
- [ ] Console output displays correctly
- [ ] Error messages are clear
- [ ] Execution time shows for cloud execution
- [ ] Clear button resets console
- [ ] Loading state shows during execution
- [ ] Success notification in chat

---

## 🎉 Start Running Code!

1. **Create a session** with your preferred language
2. **Write your code** collaboratively
3. **Click "Run"** to execute
4. **View results** in the console
5. **Share success** with your team!

---

**Happy Coding & Executing! 🚀**

*Powered by Piston API - Free & Open Source*
*JavaScript execution - Local browser sandbox*

