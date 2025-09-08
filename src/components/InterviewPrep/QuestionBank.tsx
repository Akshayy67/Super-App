import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { EnhancedQuestionCard } from "./EnhancedQuestionCard";
import { Question } from "./InterviewSubjects";
import {
  allQuestions,
  questionsBySubject,
  getQuestionsBySubject,
} from "./bank";

interface QuestionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  questionCount: number;
}

export const QuestionBank: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Debug logging for imports
  console.log("QuestionBank component rendered");
  console.log("allQuestions imported:", allQuestions.length);
  console.log("questionsBySubject imported:", Object.keys(questionsBySubject));
  console.log("Sample questions:", allQuestions.slice(0, 2));

  // Log individual question counts by subject
  Object.entries(questionsBySubject).forEach(([subject, questions]) => {
    console.log(`${subject}: ${questions.length} questions`);
  });

  // Get initial values from URL parameters
  const initialCategory = searchParams.get("category") || "all";
  const initialDifficulty = searchParams.get("difficulty") || "all";

  console.log("URL Parameters:", { initialCategory, initialDifficulty });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>(initialDifficulty);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [practicedQuestions, setPracticedQuestions] = useState<string[]>([]);
  const [favoriteQuestions, setFavoriteQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add useEffect to handle loading state
  useEffect(() => {
    // Check if questions are loaded
    if (allQuestions.length > 0) {
      setIsLoading(false);
      console.log("Questions loaded successfully:", allQuestions.length);
    } else {
      console.error("No questions found in allQuestions array");
      setIsLoading(false);
    }
  }, []);

  // Update state when URL parameters change
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlDifficulty = searchParams.get("difficulty");

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else if (!urlCategory && !urlDifficulty) {
      setSelectedCategory("all");
    }

    if (urlDifficulty) {
      setSelectedDifficulty(urlDifficulty);
    } else if (!urlCategory && !urlDifficulty) {
      setSelectedDifficulty("all");
    }

    setSearchQuery("");
    setSelectedType("all");
  }, [searchParams]);

  // Define questions based on selected category
  const questions = useMemo(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const subjectMap: Record<string, string> = {
        webdev: "Frontend Development",
        database: "Databases",
        algorithms: "Algorithms & Data Structures",
        systemdesign: "System Design",
        "system-design": "System Design", // Handle hyphenated version
        cloud: "Cloud & DevOps",
        react: "React",
        frontend: "Frontend Development",
        javascript: "JavaScript",
        behavioral: "Behavioral",
        technical: "Algorithms & Data Structures", // Map technical to algorithms
        os: "Operating Systems",
        puzzles: "Puzzles",
        aptitude: "Aptitude & Reasoning",
        enhanceddsa: "Enhanced DSA (Top 75)",
        networks: "Computer Networks",
      };

      const subject = subjectMap[selectedCategory];
      const subjectQuestions = subject
        ? getQuestionsBySubject(subject)
        : allQuestions;

      // Debug logging
      console.log(`Selected category: ${selectedCategory}`);
      console.log(`Subject: ${subject}`);
      console.log(`Questions found: ${subjectQuestions.length}`);
      console.log("Sample questions:", subjectQuestions.slice(0, 2));

      if (subjectQuestions.length === 0) {
        console.warn(`No questions found for subject: ${subject}`);
        console.log("Available subjects:", Object.keys(questionsBySubject));
      }

      return subjectQuestions;
    }

    // Debug logging for all questions
    console.log(`Showing all questions: ${allQuestions.length}`);
    console.log("Sample all questions:", allQuestions.slice(0, 2));

    return allQuestions;
  }, [selectedCategory]);

  // Categories
  const categories: QuestionCategory[] = [
    {
      id: "enhanceddsa",
      name: "Most Important DSA",
      icon: BookOpen,
      color: "green",
      description:
        "DSA problems with multiple coding approaches and implementations",
      questionCount: questionsBySubject["Enhanced DSA (Top 75)"]?.length || 0,
    },
    {
      id: "behavioral",
      name: "Behavioral Questions",
      icon: BookOpen,
      color: "purple",
      description:
        "Questions about past experiences and how you handle situations",
      questionCount: questionsBySubject["Behavioral"]?.length || 0,
    },
    {
      id: "webdev",
      name: "Web Development",
      icon: BookOpen,
      color: "indigo",
      description:
        "Frontend, backend, and full-stack web development questions",
      questionCount: questionsBySubject["Frontend Development"]?.length || 0,
    },
    {
      id: "database",
      name: "Database Systems",
      icon: BookOpen,
      color: "blue",
      description: "SQL, NoSQL, and database design questions",
      questionCount: questionsBySubject["Databases"]?.length || 0,
    },
    {
      id: "algorithms",
      name: "Algorithms & Data Structures",
      icon: BookOpen,
      color: "amber",
      description: "Algorithmic problem-solving and optimization",
      questionCount:
        questionsBySubject["Algorithms & Data Structures"]?.length || 0,
    },
    {
      id: "systemdesign",
      name: "System Design",
      icon: BookOpen,
      color: "violet",
      description: "Scalable and distributed systems design",
      questionCount: questionsBySubject["System Design"]?.length || 0,
    },
    {
      id: "cloud",
      name: "Cloud Computing",
      icon: BookOpen,
      color: "cyan",
      description: "Cloud platforms, serverless, and DevOps",
      questionCount: questionsBySubject["Cloud & DevOps"]?.length || 0,
    },
    {
      id: "react",
      name: "React",
      icon: BookOpen,
      color: "blue",
      description: "React framework specific questions",
      questionCount: questionsBySubject["React"]?.length || 0,
    },
    {
      id: "frontend",
      name: "Frontend Development",
      icon: BookOpen,
      color: "orange",
      description: "Frontend development, UI/UX, and browser technologies",
      questionCount: questionsBySubject["Frontend Development"]?.length || 0,
    },
    {
      id: "javascript",
      name: "JavaScript",
      icon: BookOpen,
      color: "yellow",
      description: "JavaScript language, concepts and patterns",
      questionCount: questionsBySubject["JavaScript"]?.length || 0,
    },
    {
      id: "os",
      name: "Operating Systems",
      icon: BookOpen,
      color: "teal",
      description:
        "Operating system concepts, memory management, and processes",
      questionCount: questionsBySubject["Operating Systems"]?.length || 0,
    },
    {
      id: "puzzles",
      name: "Puzzles",
      icon: BookOpen,
      color: "pink",
      description: "Logical puzzles and brain teasers from GeeksforGeeks",
      questionCount: questionsBySubject["Puzzles"]?.length || 0,
    },
    {
      id: "aptitude",
      name: "Aptitude & Reasoning",
      icon: BookOpen,
      color: "rose",
      description: "Quantitative aptitude and logical reasoning questions",
      questionCount: questionsBySubject["Aptitude & Reasoning"]?.length || 0,
    },
    {
      id: "networks",
      name: "Computer Networks",
      icon: BookOpen,
      color: "indigo",
      description: "Computer networking concepts, protocols, and architecture",
      questionCount: questionsBySubject["Computer Networks"]?.length || 0,
    },
  ];

  const toggleAnswer = (questionId: string) => {
    console.log("toggleAnswer called for:", questionId);
    setShowAnswers((prev) => {
      const newState = {
        ...prev,
        [questionId]: !prev[questionId],
      };
      console.log("New showAnswers state:", newState);
      return newState;
    });
  };

  const togglePracticed = (questionId: string) => {
    setPracticedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleFavorite = (questionId: string) => {
    setFavoriteQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const copyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "behavioral":
        return "text-purple-600 bg-purple-100 border-purple-200";
      case "technical":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "situational":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "general":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Handle category filtering based on subject selection
    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== "all") {
      const subjectMap: Record<string, string[]> = {
        webdev: ["frontend", "backend", "fullstack", "web", "html", "css"],
        database: [
          "database",
          "sql",
          "nosql",
          "db",
          "mysql",
          "postgresql",
          "mongodb",
        ],
        algorithms: [
          "algorithms",
          "data structures",
          "algorithm",
          "array",
          "list",
          "tree",
          "graph",
          "sorting",
          "searching",
          "complexity",
          "big o",
        ],
        technical: [
          "algorithms",
          "data structures",
          "algorithm",
          "array",
          "list",
          "tree",
          "graph",
          "sorting",
          "searching",
          "complexity",
          "big o",
          "technical",
          "coding",
          "programming",
        ],
        systemdesign: [
          "system design",
          "architecture",
          "scalability",
          "distributed",
          "microservices",
          "load balancing",
          "caching",
          "database design",
        ],
        "system-design": [
          "system design",
          "architecture",
          "scalability",
          "distributed",
          "microservices",
          "load balancing",
          "caching",
          "database design",
        ],
        cloud: [
          "cloud",
          "devops",
          "infrastructure",
          "aws",
          "azure",
          "gcp",
          "docker",
          "kubernetes",
          "ci/cd",
        ],
        react: ["react", "jsx", "hooks", "component", "state", "props"],
        frontend: [
          "frontend",
          "ui",
          "ux",
          "html",
          "css",
          "javascript",
          "browser",
          "dom",
        ],
        javascript: [
          "javascript",
          "js",
          "es6",
          "async",
          "promise",
          "closure",
          "prototype",
        ],
        behavioral: [
          "behavioral",
          "experience",
          "situation",
          "teamwork",
          "leadership",
          "conflict",
        ],
        os: [
          "operating systems",
          "os",
          "kernel",
          "process",
          "thread",
          "memory management",
          "virtual memory",
          "scheduling",
          "deadlock",
          "paging",
          "segmentation",
          "file system",
        ],
        puzzles: [
          "puzzle",
          "brain teaser",
          "logic",
          "riddle",
          "problem solving",
        ],
        aptitude: [
          "aptitude",
          "reasoning",
          "quantitative",
          "logical",
          "numerical",
          "verbal",
          "percentage",
          "time-and-work",
          "ratio-proportion",
          "average",
          "profit-loss",
          "interest",
          "data-interpretation",
          "number-series",
          "calendar",
          "age-problems",
          "geometry",
          "mensuration",
          "partnership",
          "hcf-lcm",
          "coding-decoding",
          "blood-relations",
          "direction-distance",
          "statistics",
          "algebra",
          "mixture",
          "permutation-combination",
        ],
        networks: [
          "networking",
          "protocols",
          "architecture",
          "tcp/ip",
          "dns",
          "http",
          "https",
          "ssh",
          "firewall",
          "load balancer",
        ],
        enhanceddsa: [
          "array",
          "string",
          "linked list",
          "tree",
          "graph",
          "dynamic programming",
          "stack",
          "queue",
          "heap",
          "backtracking",
          "bit manipulation",
          "matrix",
          "search",
          "sort",
          "algorithms",
          "data structures",
          "complexity",
          "big o",
          "two-pointers",
          "sliding window",
          "binary search",
          "hash table",
          "dfs",
          "bfs",
          "divide and conquer",
          "greedy",
        ],
      };

      const allowedCategories = subjectMap[selectedCategory] || [];

      // More flexible matching - check if any tag contains any of the allowed categories
      matchesCategory = allowedCategories.some((cat) => {
        const catLower = cat.toLowerCase();
        return (
          // Check if any tag contains the category
          q.tags?.some((tag) => tag.toLowerCase().includes(catLower)) ||
          // Check if question text contains the category
          q.question.toLowerCase().includes(catLower) ||
          // Check if answer contains the category (if available)
          (q.sampleAnswer && q.sampleAnswer.toLowerCase().includes(catLower)) ||
          // Check if category field matches
          q.category?.toLowerCase().includes(catLower)
        );
      });

      // Debug logging for category matching
      if (!matchesCategory) {
        console.log(
          `Question "${q.question.substring(
            0,
            50
          )}..." doesn't match category ${selectedCategory}`
        );
        console.log(`Question tags:`, q.tags);
        console.log(`Question category:`, q.category);
        console.log(`Question text contains:`, q.question.toLowerCase());
        console.log(`Allowed categories:`, allowedCategories);
      }
    }

    const matchesDifficulty =
      selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === "all" || q.type === selectedType;

    const matches =
      matchesSearch && matchesCategory && matchesDifficulty && matchesType;

    // Debug logging for overall filtering
    if (selectedCategory !== "all" && matches) {
      console.log(
        `Question "${q.question.substring(0, 50)}..." matches all filters`
      );
    }

    return matches;
  });

  // Debug logging for filtered results
  console.log(`Filtered questions count: ${filteredQuestions.length}`);
  console.log(`Total questions before filtering: ${questions.length}`);

  return (
    <div className="space-y-6">
      {/* Welcome Header - Only show when viewing categories */}
      {selectedCategory === "all" && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Question Bank Hub</h2>
              <p className="text-blue-100 mb-4">
                Choose a category to start practicing with our comprehensive
                collection of interview questions
              </p>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">
                  Select a category below to begin
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <BookOpen className="w-16 h-16 text-white/20" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions by keywords or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="sm:w-32">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:w-32">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="situational">Situational</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {questions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Questions
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {practicedQuestions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Practiced
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {favoriteQuestions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Favorites
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {filteredQuestions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Filtered
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {searchQuery === "" && selectedCategory === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isMostImportantDSA = category.id === "enhanceddsa";

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-2xl p-6 border transition-all duration-300 text-left group hover:shadow-lg ${
                  isMostImportantDSA
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 hover:shadow-xl hover:scale-[1.02] transform hover:border-slate-600"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-lg text-left group hover:border-blue-200 dark:hover:border-blue-600"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl border ${
                      isMostImportantDSA
                        ? "bg-white/10 text-white border-white/20"
                        : "bg-blue-100 text-blue-600 border-blue-200"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {isMostImportantDSA && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      <div
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  )}
                </div>

                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isMostImportantDSA
                      ? "text-white"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {category.name}
                  {isMostImportantDSA && (
                    <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30">
                      PREMIUM
                    </span>
                  )}
                </h3>
                <p
                  className={`text-sm mb-4 leading-relaxed ${
                    isMostImportantDSA
                      ? "text-slate-300"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isMostImportantDSA
                        ? "text-slate-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {category.questionCount} questions
                  </span>
                  {isMostImportantDSA && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs text-emerald-300 font-medium">
                        Essential
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Questions...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load the interview question bank.
          </p>
        </div>
      )}

      {/* Questions Display - Only when a category is selected */}
      {!isLoading && selectedCategory !== "all" && (
        <div className="space-y-6">
          {/* Filter Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800 font-medium">
                  Showing {filteredQuestions.length} questions for{" "}
                  {categories.find((cat) => cat.id === selectedCategory)
                    ?.name || selectedCategory}
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Back to Categories
              </button>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question, index) => {
              const isExpanded = showAnswers[question.id];
              const isPracticed = practicedQuestions.includes(question.id);
              const isFavorite = favoriteQuestions.includes(question.id);

              // Use EnhancedQuestionCard for enhanced DSA questions (ID starts with "enhanced-")
              const isEnhancedQuestion = question.id.startsWith("enhanced-");

              return isEnhancedQuestion ? (
                <EnhancedQuestionCard
                  key={question.id}
                  question={question}
                  onPractice={() => togglePracticed(question.id)}
                />
              ) : (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  isExpanded={isExpanded}
                  isPracticed={isPracticed}
                  isFavorite={isFavorite}
                  toggleAnswer={toggleAnswer}
                  toggleFavorite={toggleFavorite}
                  togglePracticed={togglePracticed}
                  copyQuestion={copyQuestion}
                  getDifficultyColor={getDifficultyColor}
                  getTypeColor={getTypeColor}
                  setSelectedQuestions={() => {}}
                  setShowPracticeModal={() => {}}
                />
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700 shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No questions found for this category
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This category might not have questions yet, or they might not be
                loaded properly.
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-6 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors border border-blue-200"
              >
                Back to Categories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
