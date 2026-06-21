// PlaylistPilot - Mock Database
// This data is attached to the window object to support both file:// protocol and local servers.

window.PlaylistPilotData = {
  // Helper to get a playlist by URL or ID
  getPlaylistByUrl: function(url) {
    const cleanUrl = url.trim().toLowerCase();
    if (cleanUrl.includes('design') || cleanUrl.includes('ui') || cleanUrl.includes('ux')) {
      return this.playlists.find(p => p.id === 'uiux-course');
    } else if (cleanUrl.includes('python') || cleanUrl.includes('algo') || cleanUrl.includes('py')) {
      return this.playlists.find(p => p.id === 'python-algo');
    }
    // Default fallback to JavaScript course
    return this.playlists.find(p => p.id === 'js-course');
  },

  playlists: [
    {
      id: 'js-course',
      title: 'JavaScript Mastery & Web Development Full Course',
      creator: 'Code Academy',
      videoCount: 120,
      durationHours: 48,
      estimatedDays: 24,
      category: 'Development',
      thumbnailGradient: 'linear-gradient(135deg, #F7DF1E 0%, #F07E15 100%)',
      // Generating 120 videos programmatically to keep codebase clean but highly realistic
      videos: (function() {
        const topics = [
          'Introduction to JavaScript & Environment Setup',
          'Variables, Const, and Let: Temporal Dead Zone explained',
          'Primitive Data Types & Dynamic Typing',
          'Operators: Arithmetic, Assignment, and Logical',
          'Implicit vs Explicit Type Coercion',
          'Conditionals: If/Else, Ternary Operators, and Switch blocks',
          'Loops: For, While, and Do-While structures',
          'Loop Control: Break, Continue, and Labels',
          'Functions: Declarations, Expressions, and Arrow functions',
          'Block Scope, Function Scope, and Global Scope',
          'Execution Context and the JavaScript Call Stack',
          'Understanding Closures and Lexical Scope',
          'Immediately Invoked Function Expressions (IIFE)',
          'Introduction to Arrays and basic indexing',
          'Array Operations: Push, Pop, Shift, Unshift',
          'Advanced Array Methods: Map, Filter, Reduce',
          'Array Search: Find, FindIndex, Includes, Some, Every',
          'Objects: Properties, Dot notation vs Bracket notation',
          'Object Manipulation: Destructuring and Spread operator',
          'Object Methods: keys(), values(), entries(), freeze()',
          'Memory Management: Stack vs Heap allocation',
          'Value vs Reference Types',
          'Introduction to the Document Object Model (DOM)',
          'DOM Selectors: querySelector vs getElementById',
          'DOM Manipulation: Creating, updating, and deleting nodes',
          'Styling elements dynamically via classList and style',
          'Event Handling: addEventListener, Event object, default behavior',
          'Event Bubbling, Capturing, and Event Delegation',
          'Form Handling: Validation, Submit events, FormData object',
          'Working with LocalStorage, SessionStorage, and Cookies',
          'Asynchronous JS: Understanding the Event Loop & Callback Queue',
          'Callbacks & Callback Hell',
          'Promises: States, Chaining, and error handling with catch()',
          'Promise API: Promise.all, allSettled, race, any',
          'Async / Await: Syntactic sugar over Promises',
          'Error Handling: Try, Catch, Finally, Custom Errors',
          'Fetch API: GET requests and handling JSON responses',
          'Fetch API: POST, PUT, DELETE requests and headers',
          'Understanding APIs, REST, and HTTP status codes',
          'Object Oriented JavaScript: Prototypes and inheritance',
          'ES6 Classes: Constructor, Getters, Setters, Static methods',
          'Class Inheritance: extends, super(), overriding methods',
          'The "this" keyword: binding, call(), apply(), bind()',
          'Modules: ES Modules (import/export) vs CommonJS (require)',
          'Regular Expressions (RegEx): Patterns and match testing',
          'Cookies and Client-side Sessions',
          'Web Storage security and cross-site scripting (XSS)',
          'Introduction to WebSockets for real-time communication',
          'Understanding CORS and basic headers configurations',
          'Debouncing and Throttling: Performance optimizations',
          'Intersection Observer API for lazy loading and infinite scroll',
          'Geolocation API and Browser Geolocation',
          'History API & Single Page Application (SPA) routing basics',
          'Canvas API: Creating 2D graphics and basic animations',
          'Audio & Video APIs: Custom media player interfaces',
          'Intersection of JS and CSS: Custom properties styling',
          'Web Workers: Multi-threaded JS execution',
          'Introduction to Clean Code principles in JavaScript',
          'Functional Programming concepts: Pure functions, Immutability',
          'Testing JavaScript: Unit tests vs Integration tests basics',
          'Webpack, Vite & Bundlers: Why do we need them?',
          'Babel & Transpilation: Supporting older browsers',
          'NPM & Package.json: Managing dependencies',
          'Debugging JS: Chrome DevTools, breakpoints, and call stack inspection'
        ];

        // Fill up to 120 videos by adding sub-chapters and advanced extensions
        const list = [];
        for (let i = 1; i <= 120; i++) {
          const topicIndex = (i - 1) % topics.length;
          const isExtension = i > topics.length;
          const title = isExtension 
            ? `Deep Dive: ${topics[topicIndex]} (Part ${Math.floor(i / topics.length) + 1})`
            : `${i}. ${topics[topicIndex]}`;
          
          // Durations ranging between 12 minutes (720s) and 35 minutes (2100s)
          // Seeded randomly but consistently
          const durationSeconds = 720 + ((i * 123) % 1380); 
          list.push({ title, durationSeconds });
        }
        return list;
      })()
    },
    {
      id: 'uiux-course',
      title: 'UI/UX Design Essentials: Master Figma & Design Theory',
      creator: 'DesignLab',
      videoCount: 45,
      durationHours: 18,
      estimatedDays: 9,
      category: 'Design',
      thumbnailGradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
      videos: (function() {
        const topics = [
          'Introduction to UI/UX Design: Industry overview & roles',
          'Understanding User Research & Empathy Maps',
          'Creating User Personas & User Journeys',
          'Information Architecture & Sitemapping',
          'Wireframing: Low-Fidelity sketches to digital drafts',
          'Introduction to Figma: Workspace overview & basic tools',
          'Figma Layers, Groups, and Frame structures',
          'Typography Hierarchy: Choosing fonts, scale, and line heights',
          'Color Theory in UI: Contrast ratios, accessibility, and palettes',
          'Grid Systems: 8pt grid, columns, gutters, and layout grids',
          'Spacing & Padding: Creating visual breathability and alignment',
          'Component Design: Buttons, inputs, cards, and navigation bars',
          'Figma Components & Instances: Creating reusable assets',
          'Figma Auto Layout: Building responsive UI elements',
          'Advanced Auto Layout: Wrap, min/max dimensions',
          'Figma Component Properties: Boolean, instance swap, text',
          'Figma Variables: Implementing color modes and tokens',
          'Visual Hierarchy: Scale, weight, color, and positioning',
          'Form Design Best Practices: Inputs, labels, and error states',
          'Navigation Patterns: Mobile tab bars, sidebars, and dropdowns',
          'Micro-interactions: Enhancing user delight and feedback',
          'Prototyping in Figma: Smart animate, transitions, and easing',
          'Interactive Components: Hover states, active states, and toggles',
          'Usability Testing: Formulating tasks, running interviews, gathering metrics',
          'Analyzing Test Results: Affinity mapping & priority matrix',
          'Design Systems: UI Kits, style guides, and documentation',
          'Responsive Web Design: Designing for mobile, tablet, and desktop',
          'Native iOS Design Guidelines (Human Interface Guidelines)',
          'Native Android Design Guidelines (Material Design 3)',
          'Dark Mode Design: Contrast, colors, and accessibility rules',
          'Accessibility (WCAG 2.1): Contrast checkers, screen readers, focus states',
          'Design Handoff: Preparing Figma files for developers',
          'Writing Design Specifications & Redlines',
          'Landing Page Design: Visual anchors and CTA optimization',
          'Dashboard Design: Data visualization, tables, and analytics cards',
          'E-commerce UI: Product grids, checkout flows, and trust signals',
          'SaaS Product Design: Onboarding, user settings, and empty states',
          'Portfolio Building: How to showcase your process and UX cases',
          'Design Criticism: Giving and receiving constructive feedback',
          'Figma Plugins: Speeding up your UX/UI design workflow',
          'Illustration & Iconography: Integrating vector assets',
          'Future of UI/UX: AI tools, spatial design, and trends'
        ];

        const list = [];
        for (let i = 1; i <= 45; i++) {
          const topicIndex = (i - 1) % topics.length;
          const title = `${i}. ${topics[topicIndex]}`;
          // Durations ranging between 10 minutes (600s) and 30 minutes (1800s)
          const durationSeconds = 600 + ((i * 345) % 1200);
          list.push({ title, durationSeconds });
        }
        return list;
      })()
    },
    {
      id: 'python-algo',
      title: 'Advanced Python & Data Structures Course',
      creator: 'TechPrep',
      videoCount: 75,
      durationHours: 32,
      estimatedDays: 16,
      category: 'Computer Science',
      thumbnailGradient: 'linear-gradient(135deg, #306998 0%, #FFD43B 100%)',
      videos: (function() {
        const topics = [
          'Python Installation, Pip, and Virtual Environments',
          'Pythonic Code: Lists, Tuples, Dictionaries, and Sets',
          'List Comprehensions, Dict Comprehensions, and Generator Expressions',
          'Advanced Functions: *args, **kwargs, and default values scope',
          'Decorators: Writing wrappers, custom logger decorators',
          'Generators & Iterators: The yield keyword and memory optimization',
          'Context Managers: The "with" statement and custom __enter__/__exit__',
          'Object-Oriented Python: Dunder methods, properties, slots',
          'Inheritance, Polymorphism, and Multiple Inheritance (MRO)',
          'Abstract Base Classes (ABC) and Interfaces',
          'Metaclasses: Customizing class creation in Python',
          'Concurrency: Threading vs Multiprocessing vs Asyncio',
          'Memory Management in Python: Garbage collection and reference counts',
          'Algorithmic Complexity: Big O Notation (Time vs Space)',
          'Arrays & Contiguous Memory Allocation',
          'Linked Lists: Singly Linked List operations (insertion, deletion)',
          'Linked Lists: Doubly Linked List and Circular Linked List',
          'Stack Data Structure: Array-based vs Node-based implementation',
          'Queue Data Structure: FIFO, Deque, Priority Queue (heapq)',
          'Hash Tables: Collision resolution (chaining vs open addressing)',
          'Recursion: Call stack behavior, Base case vs Recursive step',
          'Binary Trees: Nodes, height, depth, and properties',
          'Binary Tree Traversals: Pre-order, In-order, Post-order',
          'Binary Search Trees (BST): Insertion, search, and delete algorithms',
          'Balanced BSTs: AVL Trees and Red-Black Trees conceptual overview',
          'Tries (Prefix Trees): Autocomplete algorithms and search optimization',
          'Graphs: Adjacency List vs Adjacency Matrix representations',
          'Graph Traversals: Breadth-First Search (BFS) implementation',
          'Graph Traversals: Depth-First Search (DFS) implementation',
          'Dijkstra\'s Shortest Path Algorithm',
          'A* Search Algorithm for pathfinding',
          'Sorting Algorithms: Bubble, Selection, and Insertion Sorts',
          'Divide and Conquer: Merge Sort implementation',
          'Divide and Conquer: Quick Sort and Quick Select',
          'Heap Sort & Priority Queues review',
          'Search Algorithms: Binary Search, Binary Search on ranges',
          'Backtracking: N-Queens problem and Sudoku solver',
          'Dynamic Programming: Memoization vs Tabulation',
          'Classic DP Problems: Fibonacci, Knapsack (0/1), Longest Common Subsequence',
          'Greedy Algorithms: Huffman Coding, Fractional Knapsack',
          'Bit Manipulation: Bitwise operations and masks',
          'String Matching Algorithms: KMP and Robin-Karp conceptual basics',
          'Design Patterns in Python: Singleton, Factory, Observer',
          'Unit Testing in Python: unittest, pytest, and mocking',
          'Profiling and Benchmarking Python code',
          'Static Type Checking in Python with mypy',
          'Integrating C/C++ libraries with Python (Ctypes and Cython)'
        ];

        const list = [];
        for (let i = 1; i <= 75; i++) {
          const topicIndex = (i - 1) % topics.length;
          const isExtension = i > topics.length;
          const title = isExtension 
            ? `Advanced Applications: ${topics[topicIndex]} (Part 2)`
            : `${i}. ${topics[topicIndex]}`;
          // Durations ranging between 15 minutes (900s) and 38 minutes (2280s)
          const durationSeconds = 900 + ((i * 219) % 1380);
          list.push({ title, durationSeconds });
        }
        return list;
      })()
    }
  ]
};
