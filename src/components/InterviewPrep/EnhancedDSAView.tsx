import React, { useState, useMemo, useEffect } from "react";
import {
  enhancedDSAQuestions,
  enhancedQuestionsByCategory,
  enhancedQuestionsByDifficulty,
  enhancedQuestionPatterns,
  enhancedDSAStats,
} from "./bank/enhanced";
import { Question } from "./QuestionTypes";
import { EnhancedQuestionCard } from "./EnhancedQuestionCard";

interface EnhancedDSAViewProps {
  onQuestionSelect?: (question: Question) => void;
}

export const EnhancedDSAView: React.FC<EnhancedDSAViewProps> = ({
  onQuestionSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedPattern, setSelectedPattern] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [practicedQuestions, setPracticedQuestions] = useState<string[]>([]);

  // Load practiced questions from localStorage on component mount
  useEffect(() => {
    const storedPracticedQuestions = localStorage.getItem("practicedQuestions");
    if (storedPracticedQuestions) {
      setPracticedQuestions(JSON.parse(storedPracticedQuestions));
    }
  }, []);

  // Handle practice button click
  const handlePracticeQuestion = (questionId: string) => {
    const updatedPracticedQuestions = [...practicedQuestions, questionId];
    setPracticedQuestions(updatedPracticedQuestions);
    localStorage.setItem(
      "practicedQuestions",
      JSON.stringify(updatedPracticedQuestions)
    );

    // Update the question's practice count in the UI
    // This is just for UI indication, the actual tracking is done with practicedQuestions array
  };

  const filteredQuestions = useMemo(() => {
    let questions = enhancedDSAQuestions;

    // Filter by category
    if (selectedCategory !== "all") {
      questions =
        enhancedQuestionsByCategory[
          selectedCategory as keyof typeof enhancedQuestionsByCategory
        ] || [];
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      questions = questions.filter((q) => q.difficulty === selectedDifficulty);
    }

    // Filter by pattern
    if (selectedPattern !== "all") {
      questions = questions.filter((q) => q.tags?.includes(selectedPattern));
    }

    // Filter by search term
    if (searchTerm) {
      questions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return questions;
  }, [selectedCategory, selectedDifficulty, selectedPattern, searchTerm]);

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced DSA Questions (Top 75+)
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive collection of interview-ready data structures and
          algorithms questions with detailed implementations and multiple
          solution approaches.
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {enhancedDSAStats.totalQuestions}
            </div>
            <div className="text-sm text-blue-600">Total Questions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {enhancedDSAStats.questionsByDifficulty.easy}
            </div>
            <div className="text-sm text-green-600">Easy</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {enhancedDSAStats.questionsByDifficulty.medium}
            </div>
            <div className="text-sm text-yellow-600">Medium</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {enhancedDSAStats.questionsByDifficulty.hard}
            </div>
            <div className="text-sm text-red-600">Hard</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(enhancedQuestionsByCategory).map((category) => (
                <option key={category} value={category}>
                  {category} (
                  {
                    enhancedQuestionsByCategory[
                      category as keyof typeof enhancedQuestionsByCategory
                    ].length
                  }
                  )
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">
                Easy ({enhancedDSAStats.questionsByDifficulty.easy})
              </option>
              <option value="medium">
                Medium ({enhancedDSAStats.questionsByDifficulty.medium})
              </option>
              <option value="hard">
                Hard ({enhancedDSAStats.questionsByDifficulty.hard})
              </option>
            </select>
          </div>

          {/* Pattern Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Patterns</option>
              {Object.entries(enhancedQuestionPatterns).map(
                ([pattern, questions]) => (
                  <option
                    key={pattern}
                    value={pattern.toLowerCase().replace(/\s+/g, "-")}
                  >
                    {pattern} ({questions.length})
                  </option>
                )
              )}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory("all")}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedDifficulty !== "all" && (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                difficultyColors[
                  selectedDifficulty as keyof typeof difficultyColors
                ]
              }`}
            >
              {selectedDifficulty.charAt(0).toUpperCase() +
                selectedDifficulty.slice(1)}
              <button
                onClick={() => setSelectedDifficulty("all")}
                className="ml-2 hover:opacity-75"
              >
                ×
              </button>
            </span>
          )}
          {selectedPattern !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Pattern: {selectedPattern}
              <button
                onClick={() => setSelectedPattern("all")}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredQuestions.length} of {enhancedDSAQuestions.length}{" "}
          questions
        </p>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuestions.map((question) => (
          <EnhancedQuestionCard
            key={question.id}
            question={question}
            onSelect={onQuestionSelect}
            onPractice={handlePracticeQuestion}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No questions found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}

      {/* Quick Stats by Category */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Question Distribution by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(enhancedQuestionsByCategory).map(
            ([category, questions]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-600">{category}</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
