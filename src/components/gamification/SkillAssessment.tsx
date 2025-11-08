// Skill Assessment System - Quick skill tests with XP rewards
import React, { useState, useEffect } from "react";
import {
  Target,
  Clock,
  Trophy,
  Zap,
  Check,
  X,
  ArrowRight,
  RefreshCw,
  Award,
  Star,
  Brain,
  Code,
  Layers,
} from "lucide-react";
import { gamificationService, XP_REWARDS } from "../../services/gamificationService";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface AssessmentResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  xpEarned: number;
}

// Sample questions (in production, fetch from database)
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Data Structures"
  },
  {
    id: 2,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Array", "Tree"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Data Structures"
  },
  {
    id: 3,
    question: "What is the output of: console.log(typeof null)",
    options: ["'null'", "'undefined'", "'object'", "'number'"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "JavaScript"
  },
  {
    id: 4,
    question: "Which sorting algorithm has the best average time complexity?",
    options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Algorithms"
  },
  {
    id: 5,
    question: "What does REST stand for?",
    options: [
      "Remote Endpoint Service Transfer",
      "Representational State Transfer",
      "Resource Endpoint State Transfer",
      "Remote State Transfer"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Web Development"
  },
  {
    id: 6,
    question: "Which of these is NOT a valid HTTP method?",
    options: ["GET", "POST", "UPDATE", "DELETE"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Web Development"
  },
  {
    id: 7,
    question: "What is the space complexity of a recursive Fibonacci function?",
    options: ["O(1)", "O(n)", "O(log n)", "O(2^n)"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Algorithms"
  },
  {
    id: 8,
    question: "In React, what hook is used for side effects?",
    options: ["useState", "useEffect", "useContext", "useMemo"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "React"
  },
  {
    id: 9,
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Question Language",
      "Standard Query Language",
      "Sequential Query Language"
    ],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Databases"
  },
  {
    id: 10,
    question: "Which design pattern ensures a class has only one instance?",
    options: ["Factory", "Singleton", "Observer", "Decorator"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Design Patterns"
  }
];

export const SkillAssessment: React.FC = () => {
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [questionCount, setQuestionCount] = useState(5);
  
  // Assessment state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeStarted, setTimeStarted] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Results
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const user = realTimeAuth.getCurrentUser();
  const timerInterval = React.useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (assessmentActive && !result) {
      timerInterval.current = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - timeStarted) / 1000));
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [assessmentActive, result, timeStarted]);

  const categories = ["all", ...Array.from(new Set(SAMPLE_QUESTIONS.map(q => q.category)))];

  const startAssessment = () => {
    // Filter questions
    let filteredQuestions = SAMPLE_QUESTIONS;
    
    if (category !== "all") {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }
    
    if (difficulty !== "all") {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // Shuffle and select
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setQuestions(selected);
    setAnswers(new Array(selected.length).fill(null));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setResult(null);
    setTimeStarted(Date.now());
    setTimeElapsed(0);
    setAssessmentActive(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    
    // Move to next or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
      setShowAnswer(false);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const finishAssessment = async (finalAnswers: (number | null)[]) => {
    const correctCount = finalAnswers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    
    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = Math.floor((Date.now() - timeStarted) / 1000);
    
    // Calculate XP
    let xpEarned = XP_REWARDS.PASS_ASSESSMENT;
    if (score === 100) {
      xpEarned = XP_REWARDS.PERFECT_ASSESSMENT;
    } else if (score >= 80) {
      xpEarned = XP_REWARDS.PASS_ASSESSMENT + 100;
    }
    
    const assessmentResult: AssessmentResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      timeSpent,
      xpEarned
    };
    
    setResult(assessmentResult);
    setAssessmentActive(false);
    
    // Award XP
    if (user && score >= 60) {
      await gamificationService.awardXP(user.uid, xpEarned, `Skill Assessment: ${score}%`);
      
      // Increment problems solved stat
      await gamificationService.incrementStat(user.uid, "totalProblemsSolved", correctCount);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!assessmentActive && !result) {
    // Setup screen
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8" />
            Skill Assessment
          </h1>
          <p className="text-white/90">Test your knowledge and earn XP!</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Configure Assessment
          </h2>
          
          <div className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(["all", "easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      difficulty === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions: {questionCount}
              </label>
              <input
                type="range"
                min="5"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Start button */}
            <button
              onClick={startAssessment}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Target className="w-6 h-6" />
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    // Results screen
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assessment Complete!
          </h2>
          
          <div className="text-6xl font-bold mb-4" style={{
            background: result.score >= 80 ? 'linear-gradient(135deg, #10B981, #059669)' : 
                       result.score >= 60 ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 
                       'linear-gradient(135deg, #EF4444, #DC2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {result.score}%
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Check className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{result.correctAnswers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(result.timeSpent)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">+{result.xpEarned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">XP Earned</div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setResult(null);
              setAssessmentActive(false);
            }}
            className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Take Another Assessment
          </button>
        </div>
      </div>
    );
  }

  // Assessment in progress
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Target className="w-4 h-4" />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            currentQuestion.difficulty === "easy" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
            currentQuestion.difficulty === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
            "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}>
            {currentQuestion.difficulty}
          </div>
          
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            {currentQuestion.category}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showCorrectAnswer = showAnswer && isCorrect;
            const showWrongAnswer = showAnswer && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => !showAnswer && handleAnswerSelect(index)}
                disabled={showAnswer}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  showCorrectAnswer ? "border-green-500 bg-green-50 dark:bg-green-900/20" :
                  showWrongAnswer ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
                  isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" :
                  "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${showAnswer ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    showCorrectAnswer ? "border-green-500 bg-green-500" :
                    showWrongAnswer ? "border-red-500 bg-red-500" :
                    isSelected ? "border-blue-500 bg-blue-500" :
                    "border-gray-300 dark:border-gray-600"
                  }`}>
                    {(showCorrectAnswer || (isSelected && !showWrongAnswer)) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                    {showWrongAnswer && (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-3 mt-8">
          {!showAnswer && (
            <button
              onClick={handleShowAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Show Answer
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Finish Assessment
                <Trophy className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
