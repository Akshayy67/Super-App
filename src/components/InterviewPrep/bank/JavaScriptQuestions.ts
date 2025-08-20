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
];
