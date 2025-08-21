import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, CheckCircle, Code2, BookOpen, Zap, TrendingUp } from 'lucide-react';
import { EnhancedQuestion } from './InterviewSubjects';
import { EnhancedQuestionCard } from './EnhancedQuestionCard';
import { enhancedDSAQuestions } from './bank/EnhancedDSAQuestions';

export const EnhancedDSAView: React.FC = () => {
  const [questions] = useState<EnhancedQuestion[]>(enhancedDSAQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState<EnhancedQuestion[]>(questions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPracticedOnly, setShowPracticedOnly] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [favoritedQuestions, setFavoritedQuestions] = useState<Set<string>>(new Set());
  const [practicedQuestions, setPracticedQuestions] = useState<Set<string>>(new Set());

  // Get unique categories and difficulties
  const categories = Array.from(new Set(questions.map(q => q.category)));
  const difficulties = ['easy', 'medium', 'hard'];

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || favoritedQuestions.has(question.id);
      const matchesPracticed = !showPracticedOnly || practicedQuestions.has(question.id);

      return matchesSearch && matchesDifficulty && matchesCategory && matchesFavorites && matchesPracticed;
    });

    setFilteredQuestions(filtered);
  }, [searchTerm, selectedDifficulty, selectedCategory, showFavoritesOnly, showPracticedOnly, questions, favoritedQuestions, practicedQuestions]);

  const toggleAnswer = (id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoritedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const togglePracticed = (id: string) => {
    setPracticedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyQuestion = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy question:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'behavioral':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'situational':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: questions.length,
    practiced: practicedQuestions.size,
    favorites: favoritedQuestions.size,
    withCode: questions.filter(q => q.codeImplementations).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enhanced DSA Question Bank
          </h1>
          <p className="text-gray-600 text-lg">
            75 Most Asked Data Structures & Algorithms Questions with Code Implementations
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.practiced}</div>
              <div className="text-sm text-gray-600">Practiced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.favorites}</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.withCode}</div>
              <div className="text-sm text-gray-600">With Code</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Quick Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Favorites</span>
              </button>
              
              <button
                onClick={() => setShowPracticedOnly(!showPracticedOnly)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showPracticedOnly
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Practiced</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((question, index) => (
            <EnhancedQuestionCard
              key={question.id}
              question={question}
              index={index}
              isExpanded={expandedQuestions.has(question.id)}
              isPracticed={practicedQuestions.has(question.id)}
              isFavorite={favoritedQuestions.has(question.id)}
              toggleAnswer={toggleAnswer}
              toggleFavorite={toggleFavorite}
              togglePracticed={togglePracticed}
              copyQuestion={copyQuestion}
              getDifficultyColor={getDifficultyColor}
              getTypeColor={getTypeColor}
            />
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};