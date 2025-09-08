import { Question } from "../InterviewSubjects";

// Collection of JavaScript interview questions
export const javascriptQuestions: Question[] = [
  {
    id: "js-1",
    question:
      "Explain closures in JavaScript and give an example of their practical use.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "A closure in JavaScript is when a function retains access to variables from its outer (enclosing) scope even after that scope has finished executing. This happens because functions in JavaScript form closures—they 'close over' the variables from their parent scopes. Closures are created whenever a function is defined within another function, allowing the inner function to access the outer function's variables and parameters. Practical uses include: data privacy through module patterns (creating private variables and methods); maintaining state in event handlers or callbacks; implementing function factories that generate specialized functions; creating partially applied functions with preset arguments; and managing asynchronous operations where you need to preserve values from the original context. For example, closures are fundamental to React hooks like useState, which maintains state between renders, or for creating throttle and debounce utility functions that need to track timing information between calls.",
    tips: [
      "Explain lexical scoping as the foundation for closures",
      "Discuss memory implications and potential leaks",
      "Demonstrate common design patterns using closures",
      "Compare with alternative approaches",
    ],
    tags: ["javascript", "frontend", "fundamentals", "functions"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-2",
    question: "Explain the event loop in JavaScript.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "JavaScript's event loop is the mechanism that enables its non-blocking, asynchronous execution model despite being single-threaded. The event loop constantly checks if the call stack is empty and if there are tasks in the task queues that need processing. The key components include: the Call Stack which tracks function calls in a last-in-first-out manner; the Heap where objects are stored in memory; the Web APIs (in browsers) or C++ APIs (in Node.js) that handle asynchronous operations like timers, HTTP requests, and I/O; the Callback Queue (or Task Queue) which holds callbacks from completed asynchronous operations; the Microtask Queue which has higher priority than the Task Queue and processes promises and mutation observers. The execution flow is: synchronous code runs on the call stack; asynchronous operations are offloaded to Web/C++ APIs; when these complete, their callbacks are placed in appropriate queues; once the call stack is empty, the event loop first processes all microtasks, then takes one task from the task queue and pushes it to the call stack. This cycle continues, allowing JavaScript to handle concurrent operations despite being single-threaded.",
    tips: [
      "Demonstrate with setTimeout, Promises, and async/await examples",
      "Explain the difference between microtasks and macrotasks",
      "Discuss rendering updates timing in browsers",
      "Address common misconceptions about 'true' parallelism",
    ],
    tags: ["javascript", "frontend", "asynchronous", "fundamentals"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-3",
    question:
      "What is prototypal inheritance in JavaScript and how does it differ from classical inheritance?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Prototypal inheritance is JavaScript's native inheritance model where objects inherit directly from other objects, rather than from classes. Each object has an internal [[Prototype]] property (accessed via Object.getPrototypeOf() or the __proto__ accessor) that references another object—its prototype. When a property is accessed on an object but not found, JavaScript automatically looks up the prototype chain until it finds the property or reaches the end (null). Key differences from classical inheritance include: In prototypal inheritance, objects inherit from objects, while classical inheritance has classes inherit from classes and objects instantiate from classes; Prototypal inheritance is dynamic—an object's prototype can be modified at runtime; It uses a delegation approach (objects delegate property access to their prototypes) rather than copying properties from classes to instances; There's no distinction between classes and instances—any object can serve as a prototype for another object. JavaScript's class syntax (introduced in ES6) provides a more familiar classical inheritance interface, but it's syntactic sugar over the prototypal system. Understanding prototypal inheritance is crucial for effective JavaScript programming and grasping concepts like the prototype chain and property shadowing.",
    tips: [
      "Compare Object.create() vs constructor functions vs class syntax",
      "Explain performance implications of deep prototype chains",
      "Demonstrate multiple inheritance techniques in JavaScript",
      "Discuss common prototype pollution security issues",
    ],
    tags: ["javascript", "oop", "inheritance", "fundamentals"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-4",
    question:
      "Explain the differences between == and === operators in JavaScript.",
    category: "technical",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "The == (equality) and === (strict equality) operators in JavaScript both compare values, but they differ in how they handle type conversions. The == operator performs type coercion when comparing values of different types, attempting to convert them to a common type before comparison. For example, '5' == 5 returns true because the string '5' is converted to the number 5. The === operator, on the other hand, compares both value and type without any coercion—it returns true only if both operands are of the same type and have the same value. So '5' === 5 returns false because one is a string and the other is a number. The strict equality operator is generally preferred because it's more predictable and avoids unexpected results from type coercion. Some noteworthy edge cases include: null == undefined is true, but null === undefined is false; NaN is not equal to anything, including itself, with either operator; and comparing objects checks reference equality (whether they're the same object in memory), not structural equality, with both operators.",
    tips: [
      "Provide examples of unintuitive coercion results",
      "Explain Object.is() and when it differs from ===",
      "Discuss best practices for equality comparisons",
      "Address performance considerations (though minimal)",
    ],
    tags: ["javascript", "fundamentals", "operators"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-5",
    question: "What are Promises in JavaScript and how do they work?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Promises in JavaScript are objects representing the eventual completion (or failure) of an asynchronous operation and its resulting value. They provide a cleaner alternative to callback-based asynchronous patterns. A Promise exists in one of three states: pending (initial state), fulfilled (operation completed successfully), or rejected (operation failed). Once a Promise settles (fulfills or rejects), its state cannot change. Promises can be chained using .then() for success handling and .catch() for error handling. Each .then() returns a new Promise, enabling method chaining for sequential asynchronous operations. The .finally() method executes regardless of success or failure. Multiple Promises can be composed using static methods like Promise.all() (waits for all promises to resolve), Promise.race() (settles when the first promise settles), Promise.allSettled() (waits for all promises to settle regardless of outcome), and Promise.any() (resolves when the first promise resolves). Promises work with the microtask queue, meaning their callbacks execute before the next task in the event loop once the call stack is clear. ES2017 introduced async/await syntax, which provides a more synchronous-looking way to work with Promises, improving code readability while still leveraging Promise functionality under the hood.",
    tips: [
      "Compare with callback approaches",
      "Demonstrate proper error handling patterns",
      "Explain common anti-patterns to avoid",
      "Show how to convert callback APIs to Promises",
    ],
    tags: ["javascript", "asynchronous", "promises", "fundamentals"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-6",
    question:
      "What is the difference between `let`, `const`, and `var` in JavaScript?",
    category: "javascript",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "`var` has function scope, is hoisted, and can be redeclared. `let` has block scope, is hoisted but not initialized, and cannot be redeclared in the same scope. `const` has block scope, must be initialized at declaration, and cannot be reassigned (though objects/arrays can be mutated).",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// var - function scoped, hoisted
function varExample() {
  console.log(x); // undefined (hoisted but not initialized)
  var x = 1;
  if (true) {
    var x = 2; // same variable
  }
  console.log(x); // 2
}

// let - block scoped
function letExample() {
  // console.log(y); // ReferenceError: Cannot access 'y' before initialization
  let y = 1;
  if (true) {
    let y = 2; // different variable
    console.log(y); // 2
  }
  console.log(y); // 1
}

// const - block scoped, immutable binding
function constExample() {
  const z = 1;
  // z = 2; // TypeError: Assignment to constant variable

  const obj = { a: 1 };
  obj.a = 2; // OK - object mutation allowed
  console.log(obj); // { a: 2 }
}`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
      },
    ],
    tips: [
      "Explain hoisting behavior differences",
      "Demonstrate temporal dead zone with let/const",
      "Show practical examples of scope differences",
    ],
    tags: ["javascript", "variables", "scope", "hoisting"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-7",
    question: "Explain JavaScript closures and provide a practical example.",
    category: "javascript",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. Closures are created when a function is defined inside another function and references variables from the outer scope.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// Basic closure example
function outerFunction(x) {
  // This is the outer function's scope

  function innerFunction(y) {
    // Inner function has access to outer function's variables
    return x + y;
  }

  return innerFunction;
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8

// Practical example: Module pattern
function createCounter() {
  let count = 0;

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2
// count is private and cannot be accessed directly`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
      },
    ],
    tips: [
      "Explain lexical scoping",
      "Show memory implications of closures",
      "Demonstrate common use cases like module pattern",
    ],
    tags: ["javascript", "closures", "scope", "functions"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-8",
    question: "What is the event loop in JavaScript and how does it work?",
    category: "javascript",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "The event loop is JavaScript's concurrency model that handles asynchronous operations. It continuously checks the call stack and task queues, moving tasks from queues to the call stack when it's empty. There are different types of queues: microtask queue (promises, queueMicrotask) has higher priority than macrotask queue (setTimeout, setInterval, DOM events).",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// Event loop demonstration
console.log('1'); // Synchronous

setTimeout(() => {
  console.log('2'); // Macrotask
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // Microtask
});

console.log('4'); // Synchronous

// Output: 1, 4, 3, 2

// More complex example
console.log('Start');

setTimeout(() => console.log('Timeout 1'), 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    return Promise.resolve();
  })
  .then(() => console.log('Promise 2'));

setTimeout(() => console.log('Timeout 2'), 0);

console.log('End');

// Output: Start, End, Promise 1, Promise 2, Timeout 1, Timeout 2`,
        timeComplexity: "O(1) per operation",
        spaceComplexity: "O(n) for queued tasks",
      },
    ],
    tips: [
      "Draw the event loop diagram",
      "Explain call stack, heap, and queues",
      "Demonstrate microtask vs macrotask priority",
    ],
    tags: ["javascript", "event-loop", "asynchronous", "concurrency"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-9",
    question: "Explain `this` binding in JavaScript with different scenarios.",
    category: "javascript",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "`this` binding depends on how a function is called. In global scope, `this` refers to the global object (window in browsers). In object methods, `this` refers to the object. In constructors, `this` refers to the new instance. Arrow functions inherit `this` from enclosing scope. `call`, `apply`, and `bind` can explicitly set `this`.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// Global context
console.log(this); // Window object (in browser)

// Object method
const obj = {
  name: 'Object',
  regularMethod: function() {
    console.log(this.name); // 'Object'
  },
  arrowMethod: () => {
    console.log(this.name); // undefined (inherits from global)
  }
};

obj.regularMethod(); // 'Object'
obj.arrowMethod(); // undefined

// Constructor function
function Person(name) {
  this.name = name;
  this.greet = function() {
    console.log(\`Hello, I'm \${this.name}\`);
  };
}

const person = new Person('Alice');
person.greet(); // "Hello, I'm Alice"

// Method assignment loses context
const greet = person.greet;
greet(); // "Hello, I'm undefined" (this is global)

// Explicit binding
const boundGreet = person.greet.bind(person);
boundGreet(); // "Hello, I'm Alice"

// Call and apply
function introduce(age, city) {
  console.log(\`I'm \${this.name}, \${age} years old from \${city}\`);
}

const user = { name: 'Bob' };
introduce.call(user, 25, 'NYC'); // "I'm Bob, 25 years old from NYC"
introduce.apply(user, [25, 'NYC']); // Same result`,
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
      },
    ],
    tips: [
      "Show the four binding rules: default, implicit, explicit, new",
      "Explain arrow function behavior",
      "Demonstrate common pitfalls and solutions",
    ],
    tags: ["javascript", "this", "binding", "context"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-10",
    question:
      "What are Promises and how do they work? Compare with async/await.",
    category: "javascript",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Promises represent the eventual completion or failure of an asynchronous operation. They have three states: pending, fulfilled, or rejected. Promises provide `.then()`, `.catch()`, and `.finally()` methods for handling results. Async/await is syntactic sugar over Promises, making asynchronous code look synchronous.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// Creating a Promise
function fetchData(url) {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      if (url) {
        resolve({ data: 'Success', url });
      } else {
        reject(new Error('URL is required'));
      }
    }, 1000);
  });
}

// Using Promises with .then()
fetchData('https://api.example.com')
  .then(result => {
    console.log('Success:', result);
    return result.data;
  })
  .then(data => {
    console.log('Processed:', data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  })
  .finally(() => {
    console.log('Request completed');
  });

// Using async/await
async function fetchDataAsync() {
  try {
    const result = await fetchData('https://api.example.com');
    console.log('Success:', result);

    const processedData = result.data;
    console.log('Processed:', processedData);

    return processedData;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    console.log('Request completed');
  }
}

// Promise.all - parallel execution
async function fetchMultipleData() {
  try {
    const [data1, data2, data3] = await Promise.all([
      fetchData('url1'),
      fetchData('url2'),
      fetchData('url3')
    ]);

    console.log('All data fetched:', { data1, data2, data3 });
  } catch (error) {
    console.error('One or more requests failed:', error);
  }
}`,
        timeComplexity: "O(1) for Promise operations",
        spaceComplexity: "O(1) per Promise",
      },
    ],
    tips: [
      "Explain Promise states and transitions",
      "Show error handling differences",
      "Demonstrate Promise utility methods",
      "Compare performance and readability",
    ],
    tags: ["javascript", "promises", "async-await", "asynchronous"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-11",
    question:
      "What is the difference between `==` and `===` in JavaScript? (MCQ)",
    category: "javascript",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "A) `==` checks for value equality with type coercion, while `===` checks for strict equality without type coercion. For example: `'5' == 5` is true, but `'5' === 5` is false.",
    tips: [
      "Explain type coercion examples",
      "Show falsy value comparisons",
      "Recommend using === for safer comparisons",
    ],
    tags: ["javascript", "operators", "equality", "mcq"],
    estimatedTime: 2,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-12",
    question: "Debug this code: Why does this function not work as expected?",
    category: "javascript",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The issue is with variable hoisting and closure. The `var i` is function-scoped, so all setTimeout callbacks reference the same variable `i`, which has value 3 after the loop ends. Solutions: use `let` instead of `var`, or create a closure with IIFE.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// Buggy code
function createTimers() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log(i); // Prints 3, 3, 3 instead of 0, 1, 2
    }, 100);
  }
}

// Solution 1: Use let
function createTimersFixed1() {
  for (let i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log(i); // Prints 0, 1, 2
    }, 100);
  }
}

// Solution 2: IIFE closure
function createTimersFixed2() {
  for (var i = 0; i < 3; i++) {
    (function(index) {
      setTimeout(function() {
        console.log(index); // Prints 0, 1, 2
      }, 100);
    })(i);
  }
}

// Solution 3: bind
function createTimersFixed3() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function(index) {
      console.log(index); // Prints 0, 1, 2
    }.bind(null, i), 100);
  }
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
      },
    ],
    tips: [
      "Explain the difference between var and let scoping",
      "Show how closures capture variables",
      "Demonstrate multiple solutions",
    ],
    tags: ["javascript", "debugging", "closures", "hoisting"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-13",
    question: "Explain the concept of prototypal inheritance in JavaScript.",
    category: "javascript",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "JavaScript uses prototypal inheritance where objects can inherit directly from other objects. Every object has a prototype chain that leads to Object.prototype. When accessing a property, JavaScript looks up the prototype chain until it finds the property or reaches null.",
    codeImplementation: [
      {
        language: "JavaScript",
        code: `// Constructor function approach
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(\`\${this.name} makes a sound\`);
};

function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(\`\${this.name} barks\`);
};

const dog = new Dog('Rex', 'German Shepherd');
dog.speak(); // "Rex makes a sound"
dog.bark(); // "Rex barks"

// ES6 Class syntax (syntactic sugar)
class AnimalES6 {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(\`\${this.name} makes a sound\`);
  }
}

class DogES6 extends AnimalES6 {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  bark() {
    console.log(\`\${this.name} barks\`);
  }
}

// Object.create approach
const animalPrototype = {
  speak() {
    console.log(\`\${this.name} makes a sound\`);
  }
};

const dogPrototype = Object.create(animalPrototype);
dogPrototype.bark = function() {
  console.log(\`\${this.name} barks\`);
};

function createDog(name, breed) {
  const dog = Object.create(dogPrototype);
  dog.name = name;
  dog.breed = breed;
  return dog;
}`,
        timeComplexity: "O(1) for property access",
        spaceComplexity: "O(1) per object",
      },
    ],
    tips: [
      "Draw the prototype chain diagram",
      "Explain __proto__ vs prototype",
      "Show different inheritance patterns",
      "Compare with classical inheritance",
    ],
    tags: ["javascript", "inheritance", "prototypes", "oop"],
    estimatedTime: 6,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "js-14",
    question:
      "Implement a function to reverse a string. Provide multiple approaches and analyze their complexity.",
    category: "javascript",
    difficulty: "easy",
    type: "technical",
    sampleAnswer:
      "There are several approaches: 1) Built-in methods (split, reverse, join), 2) Two-pointer technique, 3) Recursion, 4) For loop with string concatenation. The built-in method is most readable, two-pointer is most efficient for arrays, recursion is elegant but uses stack space.",
    codeImplementation: [
      {
        language: "JavaScript",
        approach: "optimal",
        code: `// Approach 1: Built-in methods (Most readable)
// Time: O(n), Space: O(n)
function reverseString1(str) {
    return str.split('').reverse().join('');
}

// Approach 2: Two-pointer technique (Most efficient for arrays)
// Time: O(n), Space: O(n) for array conversion
function reverseString2(str) {
    const arr = str.split('');
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }

    return arr.join('');
}

// Approach 3: For loop (Traditional)
// Time: O(n), Space: O(n)
function reverseString3(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

// Approach 4: Recursion (Elegant but uses stack)
// Time: O(n), Space: O(n) due to call stack
function reverseString4(str) {
    if (str.length <= 1) return str;
    return str[str.length - 1] + reverseString4(str.slice(0, -1));
}

// Approach 5: Reduce (Functional)
// Time: O(n), Space: O(n)
function reverseString5(str) {
    return str.split('').reduce((reversed, char) => char + reversed, '');
}

// Test all approaches
function testReverseString() {
    const testCases = ['hello', 'world', 'a', '', 'racecar'];
    const functions = [reverseString1, reverseString2, reverseString3, reverseString4, reverseString5];

    testCases.forEach(test => {
        console.log(\`Original: "\${test}"\`);
        functions.forEach((fn, index) => {
            console.log(\`Approach \${index + 1}: "\${fn(test)}"\`);
        });
        console.log('---');
    });
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation:
          "Multiple JavaScript approaches showcasing different programming paradigms and built-in methods.",
      },
      {
        language: "Python",
        approach: "optimal",
        code: `# Approach 1: Slicing (Most Pythonic)
# Time: O(n), Space: O(n)
def reverse_string_slice(s):
    """Reverse string using Python slicing."""
    return s[::-1]

# Approach 2: Built-in reversed() function
# Time: O(n), Space: O(n)
def reverse_string_builtin(s):
    """Reverse string using built-in reversed() function."""
    return ''.join(reversed(s))

# Approach 3: Two-pointer technique
# Time: O(n), Space: O(n)
def reverse_string_two_pointer(s):
    """Reverse string using two-pointer technique."""
    chars = list(s)
    left, right = 0, len(chars) - 1

    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1

    return ''.join(chars)

# Approach 4: Recursion
# Time: O(n), Space: O(n) due to call stack
def reverse_string_recursive(s):
    """Reverse string using recursion."""
    if len(s) <= 1:
        return s
    return s[-1] + reverse_string_recursive(s[:-1])

# Approach 5: Stack-based
# Time: O(n), Space: O(n)
def reverse_string_stack(s):
    """Reverse string using stack (list as stack)."""
    stack = []

    # Push all characters to stack
    for char in s:
        stack.append(char)

    # Pop all characters to build reversed string
    reversed_str = ''
    while stack:
        reversed_str += stack.pop()

    return reversed_str

# Test function
def test_reverse_string():
    """Test all reverse string implementations."""
    test_cases = ['hello', 'world', 'a', '', 'racecar', 'Python']
    functions = [
        reverse_string_slice,
        reverse_string_builtin,
        reverse_string_two_pointer,
        reverse_string_recursive,
        reverse_string_stack
    ]

    for test in test_cases:
        print(f'Original: "{test}"')
        for i, func in enumerate(functions, 1):
            result = func(test)
            print(f'Approach {i}: "{result}"')
        print('---')

# Performance comparison
import time

def compare_performance():
    """Compare performance of different approaches."""
    test_string = 'a' * 10000  # Large string for performance testing

    approaches = [
        ('Slicing', reverse_string_slice),
        ('Built-in', reverse_string_builtin),
        ('Two-pointer', reverse_string_two_pointer),
        ('Stack', reverse_string_stack)
        # Skip recursive for large strings to avoid stack overflow
    ]

    for name, func in approaches:
        start_time = time.time()
        for _ in range(1000):
            func(test_string)
        end_time = time.time()
        print(f'{name}: {end_time - start_time:.4f} seconds')`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation:
          "Python implementations showcasing Pythonic approaches like slicing, built-in functions, and performance comparison.",
      },
      {
        language: "Java",
        approach: "optimal",
        code: `// Java implementations for string reversal
import java.util.*;

public class StringReversal {

    // Approach 1: StringBuilder (Most efficient)
    // Time: O(n), Space: O(n)
    public static String reverseStringBuilder(String str) {
        return new StringBuilder(str).reverse().toString();
    }

    // Approach 2: Character array (Manual reversal)
    // Time: O(n), Space: O(n)
    public static String reverseCharArray(String str) {
        char[] chars = str.toCharArray();
        int left = 0;
        int right = chars.length - 1;

        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }

        return new String(chars);
    }

    // Approach 3: Recursion
    // Time: O(n), Space: O(n) due to call stack
    public static String reverseRecursive(String str) {
        if (str.length() <= 1) {
            return str;
        }
        return str.charAt(str.length() - 1) +
               reverseRecursive(str.substring(0, str.length() - 1));
    }

    // Approach 4: Stack-based
    // Time: O(n), Space: O(n)
    public static String reverseStack(String str) {
        Stack<Character> stack = new Stack<>();

        // Push all characters to stack
        for (char c : str.toCharArray()) {
            stack.push(c);
        }

        // Pop all characters to build reversed string
        StringBuilder reversed = new StringBuilder();
        while (!stack.isEmpty()) {
            reversed.append(stack.pop());
        }

        return reversed.toString();
    }

    // Approach 5: Stream API (Java 8+)
    // Time: O(n), Space: O(n)
    public static String reverseStream(String str) {
        return str.chars()
                  .mapToObj(c -> (char) c)
                  .collect(StringBuilder::new,
                          (sb, c) -> sb.insert(0, c),
                          StringBuilder::append)
                  .toString();
    }

    // Test method
    public static void main(String[] args) {
        String[] testCases = {"hello", "world", "a", "", "racecar", "Java"};

        for (String test : testCases) {
            System.out.println("Original: \"" + test + "\"");
            System.out.println("StringBuilder: \"" + reverseStringBuilder(test) + "\"");
            System.out.println("CharArray: \"" + reverseCharArray(test) + "\"");
            System.out.println("Recursive: \"" + reverseRecursive(test) + "\"");
            System.out.println("Stack: \"" + reverseStack(test) + "\"");
            System.out.println("Stream: \"" + reverseStream(test) + "\"");
            System.out.println("---");
        }

        // Performance test
        performanceTest();
    }

    // Performance comparison
    public static void performanceTest() {
        String testString = "a".repeat(10000);
        int iterations = 1000;

        // Test StringBuilder approach
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            reverseStringBuilder(testString);
        }
        long end = System.nanoTime();
        System.out.println("StringBuilder: " + (end - start) / 1_000_000 + " ms");

        // Test CharArray approach
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            reverseCharArray(testString);
        }
        end = System.nanoTime();
        System.out.println("CharArray: " + (end - start) / 1_000_000 + " ms");
    }
}`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation:
          "Java implementations showcasing StringBuilder, character arrays, recursion, Stack, and Stream API approaches with performance testing.",
      },
    ],
    tips: [
      "Discuss trade-offs between readability and performance",
      "Explain why strings are immutable in Java and JavaScript",
      "Show how different approaches scale with input size",
      "Mention when to use each approach in real scenarios",
    ],
    followUps: [
      "How would you reverse a string in-place if it were mutable?",
      "What's the space complexity difference between approaches?",
      "How would you handle Unicode characters?",
    ],
    tags: ["javascript", "python", "java", "strings", "algorithms", "coding"],
    estimatedTime: 6,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
