import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Search, Filter, Play, Settings } from "lucide-react";
import { Question } from "./InterviewSubjects";
import { QuestionCard } from "./QuestionCard";
import {
  allQuestions,
  questionsBySubject,
  getQuestionsBySubject,
  getQuestionsByTags,
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
  // Debug logging for imports
  console.log("QuestionBank component rendered");
  console.log("allQuestions imported:", allQuestions.length);
  console.log("questionsBySubject imported:", Object.keys(questionsBySubject));
  console.log("Sample questions:", allQuestions.slice(0, 2));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
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

  // Define questions based on selected category
  const questions = useMemo(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const subjectMap: Record<string, string> = {
        webdev: "Frontend Development",
        database: "Databases",
        algorithm: "Algorithms & Data Structures",
        system: "System Design",
        cloud: "Cloud & DevOps",
        react: "React",
        frontend: "Frontend Development",
        javascript: "JavaScript",
        behavioral: "Behavioral",
        os: "Operating Systems",
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
  ];

  const toggleAnswer = (questionId: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
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
        algorithm: [
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
        system: [
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full mb-6 shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Interview Question Bank
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Master your interview skills with our comprehensive collection of
          questions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions, tags, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.questionCount})
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="situational">Situational</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {questions.length}
            </div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {practicedQuestions.length}
            </div>
            <div className="text-sm text-gray-600">Practiced</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {favoriteQuestions.length}
            </div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredQuestions.length}
            </div>
            <div className="text-sm text-gray-600">Filtered</div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {searchQuery === "" && selectedCategory === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-left group hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl border bg-blue-100 text-blue-600 border-blue-200">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">
                    {category.questionCount} questions
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Questions...
          </h3>
          <p className="text-gray-600">
            Please wait while we load the interview question bank.
          </p>
        </div>
      )}

      {/* Questions Display */}
      {!isLoading && (
        <>
          {/* Show filtered questions if any */}
          {filteredQuestions.length > 0 && (
            <div className="space-y-6">
              {/* Filter Status */}
              {selectedCategory !== "all" && (
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
                      Show All Questions
                    </button>
                  </div>
                </div>
              )}

              {filteredQuestions.map((question, index) => {
                const isExpanded = showAnswers[question.id];
                const isPracticed = practicedQuestions.includes(question.id);
                const isFavorite = favoriteQuestions.includes(question.id);

                return (
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
              })}
            </div>
          )}

          {/* Fallback: Show some related questions when category is selected but filtering returns empty */}
          {selectedCategory !== "all" &&
            filteredQuestions.length === 0 &&
            questions.length > 0 && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-800 font-medium">
                        Showing related questions (filtering returned empty)
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      Show All Questions
                    </button>
                  </div>
                </div>

                {/* Show first 5 questions as fallback */}
                {questions.slice(0, 5).map((question, index) => {
                  const isExpanded = showAnswers[question.id];
                  const isPracticed = practicedQuestions.includes(question.id);
                  const isFavorite = favoriteQuestions.includes(question.id);

                  return (
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
                })}

                <div className="text-center">
                  <p className="text-sm text-yellow-700 mb-3">
                    Showing {questions.length} total questions for this
                    category. The filtering might be too strict.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors border border-yellow-200"
                  >
                    View All Questions
                  </button>
                </div>

                {/* Debug: Show all questions for this category */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Debug: All Questions for{" "}
                    {categories.find((cat) => cat.id === selectedCategory)
                      ?.name || selectedCategory}
                  </h4>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {index + 1}. {question.question.substring(0, 100)}
                              ...
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Tags: {question.tags?.join(", ") || "No tags"} |
                              Category: {question.category || "No category"} |
                              Type: {question.type || "No type"}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleAnswer(question.id)}
                            className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            {showAnswers[question.id] ? "Hide" : "Show"} Answer
                          </button>
                        </div>
                        {showAnswers[question.id] && question.sampleAnswer && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {question.sampleAnswer.substring(0, 200)}...
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredQuestions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedCategory !== "all"
              ? `No questions found for ${
                  categories.find((cat) => cat.id === selectedCategory)?.name ||
                  selectedCategory
                }`
              : "No questions found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory !== "all"
              ? `The filtering might be too strict. Try viewing all questions or adjusting the filters.`
              : "Try adjusting your filters or search terms to find more questions."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
                setSelectedType("all");
              }}
              className="px-6 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors border border-blue-200"
            >
              Clear All Filters
            </button>
            {selectedCategory !== "all" && (
              <>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  Show All Categories
                </button>
                <button
                  onClick={() => {
                    // Show all questions for debugging
                    console.log("Showing all questions for debugging");
                    console.log("All questions:", allQuestions);
                    console.log("Questions by subject:", questionsBySubject);
                  }}
                  className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors border border-yellow-200"
                >
                  Debug Questions
                </button>
              </>
            )}
          </div>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Debug Info:</strong>
            </p>
            <p className="text-xs text-gray-500">
              Total questions available: {questions.length}
              <br />
              Selected category: {selectedCategory}
              <br />
              Search query: "{searchQuery}"<br />
              Difficulty filter: {selectedDifficulty}
              <br />
              Type filter: {selectedType}
              <br />
              Questions by subject keys:{" "}
              {Object.keys(questionsBySubject).join(", ")}
              <br />
              Sample question tags:{" "}
              {allQuestions[0]?.tags?.join(", ") || "No tags"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
