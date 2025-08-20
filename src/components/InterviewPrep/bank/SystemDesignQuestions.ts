import { Question } from "../InterviewSubjects";

// Collection of System Design interview questions
export const systemDesignQuestions: Question[] = [
  {
    id: "sd-1",
    question: "How would you design a URL shortening service like bit.ly?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "To design a URL shortening service like bit.ly, I'd start by clarifying requirements: handling millions of URL shortenings daily, redirecting billions of requests, ensuring shortened URLs are actually shorter, providing analytics, and achieving 100% availability with minimal latency. For data storage, I'd use a relational database for user data and a NoSQL database (like Redis or DynamoDB) for the URL mappings to handle high read/write throughput. The URL shortening algorithm would either use base62 encoding (converting the ID to a string with a-z, A-Z, 0-9) or generate a random 6-8 character string, both ensuring uniqueness. The system architecture would include: load balancers distributing traffic, stateless application servers handling shortening and redirection, separate databases for read and write operations, a cache layer (Redis/Memcached) to store frequently accessed URLs, and CDN integration for global performance. For analytics, I'd implement a message queue system to process clicks asynchronously without affecting redirection performance. To scale, I'd use horizontal scaling for application servers, database sharding for URL mappings, read replicas for improved read performance, and geographically distributed deployments. I'd also implement rate limiting to prevent abuse and consider custom short URLs and collision handling.",
    tips: [
      "Discuss potential bottlenecks and solutions",
      "Consider how to handle URL collisions",
      "Explain analytics capabilities",
      "Address security considerations",
    ],
    tags: ["system-design", "scalability", "databases", "architecture"],
    estimatedTime: 10,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "sd-2",
    question:
      "Design a distributed file storage service like Dropbox or Google Drive.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "For a distributed file storage service like Dropbox, I'd focus on these requirements: reliable file storage, synchronization across devices, file sharing, version history, and security. The architecture would include: client applications for various platforms with chunked file transfer and delta sync to minimize data transfer; an API gateway managing authentication, request validation, and rate limiting; metadata service tracking file info, user data, and sharing permissions in a relational database (PostgreSQL/MySQL); block storage service managing actual file data using content-addressable storage where files are split into chunks identified by their hash; notification service (using WebSockets or long polling) alerting clients about changes; and a search service indexing file content and metadata. For data storage, I'd use distributed object storage (S3-like) for file blocks with hot/cold tiering based on access patterns, a relational database for metadata with sharding for scalability, and a caching layer for frequently accessed metadata. Core features would include: client-side encryption for security, efficient synchronization using binary diffs and compression, deduplication to save storage space, and versioning by tracking metadata changes over time. Scalability considerations include horizontal scaling of all services, database sharding, CDN integration for downloads, and separated read/write paths. For reliability, I'd implement multi-region replication, regular backups, and checksums for data integrity verification.",
    tips: [
      "Explain synchronization algorithm in detail",
      "Address conflict resolution strategies",
      "Discuss privacy and access control",
      "Consider mobile-specific optimizations",
    ],
    tags: [
      "system-design",
      "distributed-systems",
      "storage",
      "synchronization",
    ],
    estimatedTime: 12,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "sd-3",
    question: "Design a real-time chat system like Slack or Discord.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "For a real-time chat system like Slack, I'd first establish requirements: real-time messaging, multiple channels/workspaces, direct messaging, message history, file sharing, notifications, and search functionality. The architecture would include: client applications across platforms using WebSockets for bidirectional communication; API gateway for authentication, rate limiting, and load balancing; messaging service for handling message delivery using a publisher/subscriber model; presence service tracking online status; notification service for push notifications; and search service for message indexing. For data storage, I'd use a combination of databases: a NoSQL database (MongoDB/Cassandra) for message storage with sharding by workspace/channel for scalability; a relational database (PostgreSQL) for user profiles, workspace data, and channel information; Redis for caching and supporting presence information; and a search engine like Elasticsearch for full-text search. The real-time messaging would use WebSockets for active connections with fallback to HTTP long polling, with messages flowing through message brokers (Kafka/RabbitMQ) to ensure reliable delivery and support offline message queueing. For scalability, I'd implement horizontal scaling of WebSocket servers using sticky sessions, database sharding, read replicas, and CDN integration for static content. Key features would include end-to-end encryption for direct messages, optimistic UI updates, typing indicators via ephemeral messages, and message status tracking (sent, delivered, read).",
    tips: [
      "Discuss how to handle message ordering",
      "Address offline message delivery",
      "Explain how to implement typing indicators",
      "Consider group chat performance optimizations",
    ],
    tags: ["system-design", "real-time", "messaging", "websockets"],
    estimatedTime: 12,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "sd-4",
    question:
      "Design a recommendation system like those used by Netflix or Amazon.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "For a recommendation system like Netflix's, I'd start by clarifying objectives: improving user engagement, increasing content consumption, and enhancing user satisfaction. The architecture would include: data collection layer capturing user interactions (views, ratings, time spent); feature processing pipeline extracting user preferences, content attributes, and contextual information; recommendation engines combining multiple algorithms; serving layer delivering personalized recommendations in real-time; and analytics systems measuring effectiveness. I'd use multiple recommendation approaches: collaborative filtering (matrix factorization) identifying patterns among similar users; content-based filtering using item attributes; hybrid models combining both approaches; and deep learning models (neural networks) for complex pattern recognition. The data storage would involve: distributed databases for user profiles and interaction history; data warehouses for offline processing; feature stores for preprocessed features; and caching layers for frequently accessed recommendations. The recommendation pipeline would include batch processing jobs (daily model retraining), near-real-time processing (updating user vectors based on recent activity), and real-time serving (contextual adaptation). To evaluate the system, I'd use offline metrics like precision, recall, and NDCG, combined with online A/B testing measuring actual user engagement. Key challenges include cold start problem (handling new users/items), addressing popularity bias, ensuring sufficient diversity, and maintaining explainability of recommendations.",
    tips: [
      "Compare different recommendation algorithms",
      "Discuss how to handle the cold start problem",
      "Explain A/B testing methodology",
      "Address recommendation diversity",
    ],
    tags: [
      "system-design",
      "machine-learning",
      "recommendations",
      "algorithms",
    ],
    estimatedTime: 12,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "sd-5",
    question: "Design a distributed key-value store like Redis.",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "To design a distributed key-value store like Redis, I'd start with requirements: high throughput, low latency, configurable persistence, data structure support beyond simple key-value pairs, and high availability. For data model and API, I'd implement core operations (GET, SET, DELETE) with options for expiration and atomic operations, supporting various data structures (strings, lists, sets, sorted sets, hashes). The architecture would include: client libraries in multiple languages with connection pooling; a proxy layer for request routing and aggregation; data nodes storing the actual key-value pairs; and coordination service for cluster management. For data distribution, I'd use consistent hashing to distribute keys across nodes, with virtual nodes to ensure even distribution when nodes join/leave. Each node would use an in-memory hash table for primary storage with configurable persistence options: snapshotting (point-in-time copies), append-only logs (recording all write operations), or no persistence for pure caching. For reliability and availability, I'd implement primary-replica replication (async by default, sync configurable) with automatic failover, and partition tolerance using quorum-based consistency. To scale, I'd use horizontal sharding across nodes, vertical scaling for memory-intensive workloads, and client-side sharding as an option. Performance optimization would include memory management with LRU/LFU eviction policies, pipelining to reduce round trips, batching operations, and network optimization through protocol design. Additional features would include pub/sub messaging, transactions, Lua scripting for server-side operations, and monitoring capabilities.",
    tips: [
      "Explain consistency models and trade-offs",
      "Discuss memory management strategies",
      "Address failure scenarios and recovery",
      "Compare with existing solutions like Memcached",
    ],
    tags: ["system-design", "distributed-systems", "databases", "caching"],
    estimatedTime: 12,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
