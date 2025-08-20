import { Question } from "../InterviewSubjects";

// Collection of Frontend Development interview questions
export const frontendQuestions: Question[] = [
  {
    id: "frontend-1",
    question:
      "Explain CSS positioning (static, relative, absolute, fixed, and sticky).",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "CSS positioning controls how elements are positioned in a document. Static is the default, where elements follow normal document flow. Relative positioning positions an element relative to its normal position, without affecting other elements. Absolute positioning removes an element from the normal flow and positions it relative to its nearest positioned ancestor (or the document body if none exists). Fixed positioning is similar to absolute but positions relative to the viewport, so it stays in the same place even when scrolling. Sticky positioning is a hybrid that acts like relative positioning until the element crosses a specified threshold, then acts like fixed positioning. z-index only works on positioned elements (any position value except static) and determines the stacking order when elements overlap.",
    tips: [
      "Explain stacking context and z-index",
      "Discuss containing blocks",
      "Compare positioned vs. non-positioned elements",
      "Provide practical use cases for each position",
    ],
    tags: ["frontend", "css", "layout", "web-fundamentals"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "frontend-2",
    question: "Describe the box model in CSS and how box-sizing affects it.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "The CSS box model describes how elements are represented as rectangular boxes. Each box has content, padding, border, and margin areas. By default, with box-sizing: content-box, the width and height properties only set the content area size, so padding and border are added to the specified dimensions. This can make layout calculations difficult. With box-sizing: border-box, the width and height include padding and border, so the total size remains consistent with the specified dimensions. This is often preferred for predictable layouts, and many developers apply it globally using the universal selector. The box model can be inspected in browser developer tools, and understanding it is crucial for creating accurate layouts and spacing in CSS.",
    tips: [
      "Explain how margin collapse works",
      "Compare content-box vs. border-box",
      "Demonstrate how to globally apply border-box",
      "Discuss negative margins and their use cases",
    ],
    tags: ["frontend", "css", "layout", "web-fundamentals"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "frontend-3",
    question:
      "What is the difference between localStorage, sessionStorage, and cookies?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "localStorage, sessionStorage, and cookies are all ways to store data on the client-side, but they differ in several key aspects. localStorage provides persistent storage with no expiration date and typically has a 5-10MB limit. Data remains available across browser sessions until explicitly deleted. sessionStorage is similar but limited to a single browser session—data is lost when the browser tab is closed. Both storage APIs use a simple key-value format and are accessible only via JavaScript on the same domain. Cookies are smaller (typically limited to 4KB) and can be accessed both by client-side JavaScript and server-side code through HTTP requests. They can be set with expiration dates and various flags like HttpOnly (not accessible to JavaScript), Secure (sent only over HTTPS), and SameSite (controls cross-site sending). Cookies are automatically sent with every HTTP request to the same domain, which can increase request size but enables server awareness of client state, while Web Storage APIs are JavaScript-only and don't automatically transmit data to the server.",
    tips: [
      "Discuss security implications of each method",
      "Explain when to use each type of storage",
      "Mention third-party cookie restrictions",
      "Address performance considerations",
    ],
    tags: ["frontend", "web", "javascript", "storage", "browser"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "frontend-4",
    question:
      "Explain the concept of responsive web design and its key components.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Responsive web design (RWD) is an approach to web development that creates dynamic changes to the appearance of a website, depending on the screen size and orientation of the device being used to view it. The key components include: Fluid grids that use relative units like percentages rather than fixed pixels for layout elements; Flexible images that scale with the layout using max-width: 100% and height: auto; Media queries that allow different styles to be applied based on device characteristics; Viewport meta tag that ensures proper scaling on mobile devices; Mobile-first design approach that starts with designing for small screens and then progressively enhances for larger ones; Breakpoints strategically chosen based on content rather than specific devices; Typography that scales proportionally using relative units like em or rem; Touch-friendly interfaces with appropriately sized tap targets for mobile users. RWD eliminates the need for separate mobile websites and provides a consistent user experience across devices while maintaining a single codebase, which improves maintainability and SEO.",
    tips: [
      "Discuss CSS frameworks like Bootstrap or Tailwind",
      "Explain the difference between adaptive and responsive design",
      "Address performance considerations for responsive sites",
      "Mention responsive images techniques (srcset, picture element)",
    ],
    tags: [
      "frontend",
      "css",
      "responsive-design",
      "web-fundamentals",
      "mobile",
    ],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "frontend-5",
    question: "What are CSS preprocessors and what benefits do they provide?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "CSS preprocessors are scripting languages that extend CSS with features like variables, nesting, mixins, functions, and mathematical operations. Popular preprocessors include Sass, LESS, and Stylus. They improve CSS development in several ways: Variables allow defining values once and reusing them throughout stylesheets, ensuring consistency and easier maintenance; Nesting helps organize code more logically by structuring selectors in a hierarchical manner similar to HTML; Mixins enable reusable groups of CSS declarations, reducing repetition; Functions perform operations on values, especially useful for color manipulation or complex calculations; Partials/imports support modular file organization; Inheritance through extends/placeholders reduces redundant code; Control directives like conditionals and loops add programming capabilities to styling. Preprocessors compile to standard CSS that browsers can understand, and modern tooling makes integration with development workflows seamless. While CSS now has native variables and nesting (with @nest), preprocessors still offer more comprehensive features for large-scale projects.",
    tips: [
      "Compare different preprocessors (Sass vs. LESS vs. Stylus)",
      "Discuss integration with build tools",
      "Address potential downsides like debugging complexity",
      "Compare with modern CSS features like custom properties",
    ],
    tags: ["frontend", "css", "preprocessors", "sass", "tools"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
