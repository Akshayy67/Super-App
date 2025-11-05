import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  Award,
  Users,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Check,
  Sparkles,
  Timer,
} from "lucide-react";
import { quizService, Quiz, QuizQuestion, QuizAttempt, QuizLeaderboardEntry } from "../../services/quizService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { teamManagementService } from "../utils/teamManagement";
import { serverTimestamp } from "firebase/firestore";

interface TeamQuizProps {
  teamId: string;
}

export const TeamQuiz: React.FC<TeamQuizProps> = ({ teamId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userScore, setUserScore] = useState<QuizAttempt | null>(null);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [synchronizedCountdown, setSynchronizedCountdown] = useState<number | null>(null);
  const [synchronizedQuizId, setSynchronizedQuizId] = useState<string | null>(null);

  const questionStartTimeRef = useRef<number>(Date.now());
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedQuizRef = useRef<Quiz | null>(null);
  const currentQuestionIndexRef = useRef<number>(0);
  const currentAttemptRef = useRef<QuizAttempt | null>(null);
  const isProcessingNextRef = useRef<boolean>(false);
  const timerCallbackFiredRef = useRef<boolean>(false);

  const user = realTimeAuth.getCurrentUser();
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);
  const [canActivateQuiz, setCanActivateQuiz] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!teamId || !user) return;

    // Check if user is team admin/owner
    const checkAdminStatus = async () => {
      const isAdmin = await quizService.isTeamAdmin(teamId, user.id);
      setIsTeamAdmin(isAdmin);
    };
    checkAdminStatus();

    const unsubscribe = quizService.subscribeToTeamQuizzes(teamId, async (newQuizzes) => {
      setQuizzes(newQuizzes);
      setLoading(false);

      // Check permissions for each quiz
      const permissions: Record<string, boolean> = {};
      for (const quiz of newQuizzes) {
        permissions[quiz.id] = await quizService.canUserActivateQuiz(quiz.id, user.id, false);
      }
      setCanActivateQuiz(permissions);
    });

    return () => unsubscribe();
  }, [teamId, user]);

  useEffect(() => {
    if (selectedQuiz && showLeaderboard) {
      const unsubscribe = quizService.subscribeToQuizLeaderboard(
        selectedQuiz.id,
        false,
        (leaderboard) => {
          setLeaderboard(leaderboard);
        }
      );
      return () => unsubscribe();
    }
  }, [selectedQuiz, showLeaderboard]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Track synchronized countdown for active quizzes - update display, auto-start, and auto-complete
  useEffect(() => {
    // Clear any existing interval first
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    const synchronizedQuizzes = quizzes.filter(
      q => q.startMode === "synchronized" && q.status === "active"
    );

    if (synchronizedQuizzes.length === 0) {
      return;
    }

    // Use ref to track interval to prevent multiple intervals
    // Don't force re-render - rely on the countdown timer state instead
    // This prevents double updates that cause seconds to jump by 2
    countdownTimerRef.current = setInterval(async () => {
      // Get fresh quiz data from the current quizzes array
      // Read from state directly to avoid stale closures
      const currentSynchronizedQuizzes = quizzes.filter(
        q => q.startMode === "synchronized" && q.status === "active"
      );
      
      for (const quiz of currentSynchronizedQuizzes) {
        // Check if countdown has reached 0 and quiz should auto-start
        if (quiz.synchronizedStartTime && user) {
          const startTime = quiz.synchronizedStartTime instanceof Date 
            ? quiz.synchronizedStartTime.getTime()
            : (quiz.synchronizedStartTime as any).toMillis?.() || (quiz.synchronizedStartTime as any).seconds * 1000;
          const now = Date.now();
          const timeUntilStart = Math.floor((startTime - now) / 1000);
          
          // If countdown reached 0, allow users to start (but don't auto-start)
          // Users must click the button to start after countdown finishes
          // This ensures users are ready and aware when the quiz starts
          if (timeUntilStart <= 0) {
            // Countdown finished - button will be enabled, but don't auto-start
            // Just update the countdown display to 0
            if (synchronizedQuizId === quiz.id) {
              setSynchronizedCountdown(0);
            }
          }
        }
        
        // Check and auto-complete quizzes that have exceeded their time
        if (quiz.actualStartTime && quiz.settings.totalTime) {
          const actualStart = quiz.actualStartTime instanceof Date 
            ? quiz.actualStartTime.getTime()
            : (quiz.actualStartTime as any).toMillis?.() || (quiz.actualStartTime as any).seconds * 1000;
          const now = Date.now();
          const elapsed = Math.floor((now - actualStart) / 1000);
          
          // If quiz time has elapsed, auto-complete it
          if (elapsed >= quiz.settings.totalTime && quiz.status === "active") {
            // Use async function to handle the async operations
            (async () => {
              try {
                // Auto-submit all in-progress attempts (even if incomplete)
                const attempts = await quizService.getQuizAttempts(quiz.id, false);
                for (const attempt of attempts) {
                  if (attempt.status === "in-progress" && !attempt.submittedAt) {
                    try {
                      // Submit the attempt - it will calculate score based on submitted answers
                      await quizService.submitQuizAttempt(attempt.id, quiz.id, false);
                    } catch (error) {
                      console.error(`Error auto-submitting attempt ${attempt.id}:`, error);
                    }
                  }
                }
                
                // Mark quiz as completed
                await quizService.updateQuiz(quiz.id, { status: "completed", endedAt: serverTimestamp() as any }, false, user?.id);
              } catch (error) {
                console.error(`Error auto-completing quiz ${quiz.id}:`, error);
              }
            })();
          }
        }
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [quizzes, quizStarted, selectedQuiz, user, synchronizedQuizId]);

  const handleCreateQuiz = async () => {
    if (!user) return;

    // Check if user is team admin/owner
    if (!isTeamAdmin) {
      alert("Only team admins and owners can create quizzes.");
      return;
    }

    setShowCreateQuiz(true);
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    if (!user) return;

    // For synchronized mode, quiz must be activated first
    if (quiz.startMode === "synchronized") {
      if (quiz.status === "draft") {
        alert("This quiz has not been activated yet. Please wait for the quiz creator to activate it.");
        return;
      }
      
      if (quiz.status !== "active") {
        alert("This quiz is not available to start yet.");
        return;
      }

      // Fetch latest quiz data to get synchronizedStartTime
      const latestQuiz = await quizService.getQuiz(quiz.id, false);
      if (!latestQuiz?.synchronizedStartTime) {
        alert("Quiz start time has not been set. Please wait for activation.");
        return;
      }

      // Calculate time until start
      const startTime = latestQuiz.synchronizedStartTime instanceof Date 
        ? latestQuiz.synchronizedStartTime.getTime()
        : (latestQuiz.synchronizedStartTime as any).toMillis();
      const now = Date.now();
      const timeUntilStart = Math.max(0, Math.floor((startTime - now) / 1000));
      
      // Users can only start after the 10-second countdown finishes
      if (timeUntilStart > 0) {
        // Show countdown - don't allow starting yet
        setSynchronizedQuizId(quiz.id);
        setSynchronizedCountdown(timeUntilStart);
        
        // Clear any existing countdown timer
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        
        // Start countdown timer - use 1000ms (1 second)
        countdownTimerRef.current = setInterval(() => {
          const remaining = Math.max(0, Math.floor((startTime - Date.now()) / 1000));
          setSynchronizedCountdown(remaining);
          
          if (remaining === 0) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            // Countdown finished - allow starting now
            setSynchronizedCountdown(0);
          }
        }, 1000);
        
        // Don't start the quiz yet - wait for countdown to finish
        return;
      }
      
      // Countdown has finished - proceed to start
      if (timeUntilStart <= 0) {
        // Clear countdown timer if exists
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        // Start the quiz
        await actuallyStartQuiz(quiz);
        return;
      }
    }

    // For non-synchronized mode, start immediately
    await actuallyStartQuiz(quiz);
  };

  const actuallyStartQuiz = async (quiz: Quiz) => {
    if (!user) return;

    try {
      // Clear countdown timer if it exists
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      
      setSynchronizedQuizId(null);
      setSynchronizedCountdown(null);
      
      const attemptId = await quizService.startQuizAttempt(
        quiz.id,
        user.id,
        user.name || user.email || "Anonymous",
        user.avatar,
        false
      );

      const attempt = await quizService.getUserAttempts(quiz.id, user.id, false);
      if (attempt.length > 0) {
        setCurrentAttempt(attempt[0]);
        currentAttemptRef.current = attempt[0]; // Store in ref for timer callbacks
        setSelectedQuiz(quiz);
        selectedQuizRef.current = quiz; // Store quiz in ref for timer callbacks
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
        currentQuestionIndexRef.current = 0; // Store in ref for timer callbacks
        setAnswers({});
        setQuestionTimes({});
        setQuizCompleted(false);
        setUserScore(null);
        questionStartTimeRef.current = Date.now();

        // Initialize total timer if quiz has total time
        if (quiz.settings.totalTime) {
          setTotalTimeRemaining(quiz.settings.totalTime);
          totalTimerRef.current = setInterval(() => {
            setTotalTimeRemaining((prev) => {
              if (prev === null || prev <= 1) {
                if (totalTimerRef.current) clearInterval(totalTimerRef.current);
                setQuizCompleted((completed) => {
                  if (!completed && !autoSubmitting) {
                    setAutoSubmitting(true);
                    handleAutoSubmit();
                  }
                  return completed;
                });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

        // Initialize question timer if quiz has per-question time
        if (quiz.settings.timePerQuestion) {
          timerCallbackFiredRef.current = false; // Reset flag for new timer
          setQuestionTimeRemaining(quiz.settings.timePerQuestion);
          questionTimerRef.current = setInterval(() => {
            setQuestionTimeRemaining((prev) => {
              if (prev === null || prev <= 1) {
                // Prevent multiple fires
                if (timerCallbackFiredRef.current) {
                  return prev;
                }
                timerCallbackFiredRef.current = true;
                
                if (questionTimerRef.current) {
                  clearInterval(questionTimerRef.current);
                  questionTimerRef.current = null;
                }
                // Auto-skip to next question when time expires
                setTimeout(() => {
                  timerCallbackFiredRef.current = false; // Reset for next time
                  handleAutoSkip();
                }, 0);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Failed to start quiz. Please try again.");
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Auto-skip helper function
  const handleAutoSkip = async () => {
    // Prevent concurrent calls
    if (isProcessingNextRef.current) {
      return;
    }
    isProcessingNextRef.current = true;
    
    try {
      const quiz = selectedQuizRef.current;
      const currentIdx = currentQuestionIndexRef.current;
      const attempt = currentAttemptRef.current;
      
      if (!quiz || !attempt || currentIdx < 0 || currentIdx >= quiz.questions.length) {
        return;
      }
      
      const currentQuestion = quiz.questions[currentIdx];
      if (currentQuestion) {
        // Save current answer if any
        const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
        setQuestionTimes((prev) => ({
          ...prev,
          [currentQuestion.id]: timeSpent,
        }));
        
        if (answers[currentQuestion.id]) {
          await quizService.submitQuizAnswer(
            attempt.id,
            currentQuestion.id,
            answers[currentQuestion.id],
            timeSpent,
            false
          );
        }
      }
      
      // Move to next question
      const nextIdx = currentIdx + 1;
      if (nextIdx < quiz.questions.length) {
        // Not the last question - move forward
        setCurrentQuestionIndex(nextIdx);
        currentQuestionIndexRef.current = nextIdx;
        questionStartTimeRef.current = Date.now();
        
        // Set up timer for the next question
        if (quiz.settings.timePerQuestion) {
          timerCallbackFiredRef.current = false; // Reset flag for new timer
          setQuestionTimeRemaining(quiz.settings.timePerQuestion);
          questionTimerRef.current = setInterval(() => {
            setQuestionTimeRemaining((prev) => {
              if (prev === null || prev <= 1) {
                // Prevent multiple fires
                if (timerCallbackFiredRef.current) {
                  return prev;
                }
                timerCallbackFiredRef.current = true;
                
                if (questionTimerRef.current) {
                  clearInterval(questionTimerRef.current);
                  questionTimerRef.current = null;
                }
                // Auto-skip to next question
                setTimeout(() => {
                  timerCallbackFiredRef.current = false; // Reset for next time
                  handleAutoSkip();
                }, 0);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Last question - submit quiz
        handleSubmitQuiz();
      }
    } finally {
      isProcessingNextRef.current = false;
    }
  };

  const handleNextQuestion = async () => {
    // Prevent concurrent calls
    if (isProcessingNextRef.current) {
      return;
    }
    isProcessingNextRef.current = true;
    
    try {
      // Use refs as fallback if state is not available
      const quiz = selectedQuiz || selectedQuizRef.current;
      const attempt = currentAttempt || currentAttemptRef.current;
      if (!quiz || !attempt) return;

      const currentIdx = currentQuestionIndexRef.current;
      
      // Validate current index
      if (currentIdx < 0 || currentIdx >= quiz.questions.length) {
        return;
      }
    
      const currentQuestion = quiz.questions[currentIdx];
      if (!currentQuestion) {
        return;
      }
      
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion.id]: timeSpent,
      }));

      // Save answer
      if (answers[currentQuestion.id]) {
        await quizService.submitQuizAnswer(
          attempt.id,
          currentQuestion.id,
          answers[currentQuestion.id],
          timeSpent,
          false
        );
      }

      // Reset question timer
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      
      // Move to next question BEFORE setting up new timer
      const nextIdx = currentIdx + 1;
      if (nextIdx < quiz.questions.length) {
        // Not the last question - move forward
        setCurrentQuestionIndex(nextIdx);
        currentQuestionIndexRef.current = nextIdx; // Update ref
        questionStartTimeRef.current = Date.now();
        
        // Set up timer for the next question
        if (quiz.settings.timePerQuestion) {
          const totalQuestions = quiz.questions.length; // Capture questions length
          setQuestionTimeRemaining(quiz.settings.timePerQuestion);
          questionTimerRef.current = setInterval(() => {
            setQuestionTimeRemaining((prev) => {
              if (prev === null || prev <= 1) {
                // Clear timer immediately to prevent multiple triggers
                if (questionTimerRef.current) {
                  clearInterval(questionTimerRef.current);
                  questionTimerRef.current = null;
                }
                // Auto-skip to next question - use dedicated function
                setTimeout(() => handleAutoSkip(), 0);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // This was the last question - submit quiz
        handleSubmitQuiz();
      }
    } finally {
      isProcessingNextRef.current = false;
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleAutoSubmit = async () => {
    // Save current question answer first
    const quiz = selectedQuiz || selectedQuizRef.current;
    const attempt = currentAttempt || currentAttemptRef.current;
    const currentIdx = currentQuestionIndexRef.current;
    
    if (quiz && attempt) {
      const currentQuestion = quiz.questions[currentIdx];
      if (currentQuestion && answers[currentQuestion.id]) {
        const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
        await quizService.submitQuizAnswer(
          attempt.id,
          currentQuestion.id,
          answers[currentQuestion.id],
          timeSpent,
          false
        );
      }
    }
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    const quiz = selectedQuiz || selectedQuizRef.current;
    const attempt = currentAttempt || currentAttemptRef.current;
    const currentIdx = currentQuestionIndexRef.current;
    
    if (!quiz || !attempt) return;

    setSubmitting(true);

    try {
      // Save current question answer if any
      const currentQuestion = quiz.questions[currentIdx];
      if (currentQuestion && answers[currentQuestion.id]) {
        const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
        await quizService.submitQuizAnswer(
          attempt.id,
          currentQuestion.id,
          answers[currentQuestion.id],
          timeSpent,
          false
        );
      }

      // Submit quiz
      const submittedAttempt = await quizService.submitQuizAttempt(
        attempt.id,
        quiz.id,
        false
      );

      setUserScore(submittedAttempt);
      setQuizCompleted(true);
      setQuizStarted(false);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);

      // Show leaderboard after a delay
      setTimeout(() => {
        setShowLeaderboard(true);
      }, 2000);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (quizStarted && selectedQuiz && currentAttempt) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1;

    return (
      <div className="space-y-6">
        {/* Quiz Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedQuiz.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {totalTimeRemaining !== null && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Timer className="w-5 h-5" />
                  <span className="font-semibold">{formatTime(totalTimeRemaining)}</span>
                </div>
              )}
              {questionTimeRemaining !== null && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{formatTime(questionTimeRemaining)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                {currentQuestionIndex + 1}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="ml-11 space-y-3">
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-slate-700 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option)}
                        className="mr-3"
                      />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "true-false" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-slate-700 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option)}
                        className="mr-3"
                      />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQuestion.type === "short-answer" || currentQuestion.type === "essay") && (
                <textarea
                  value={(answers[currentQuestion.id] as string) || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={currentQuestion.type === "essay" ? 8 : 4}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {selectedQuiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  questionStartTimeRef.current = Date.now();
                }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                  idx === currentQuestionIndex
                    ? "bg-blue-600 text-white"
                    : answers[selectedQuiz.questions[idx].id]
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={isLastQuestion ? handleSubmitQuiz : handleNextQuestion}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : isLastQuestion ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Quiz
              </>
            ) : (
              <>
                Next
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Show leaderboard view (either after completion or when accessed from quiz list)
  if (showLeaderboard && selectedQuiz) {
    return (
      <div className="space-y-6">
        {/* User Score - only show if quiz was just completed */}
        {quizCompleted && userScore && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-xl mb-6">Your Score</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 inline-block">
                <div className="text-5xl font-bold">{userScore.percentage.toFixed(1)}%</div>
                <div className="text-lg mt-2">
                  {userScore.score} / {userScore.totalPoints} points
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Leaderboard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedQuiz.title}
              </p>
            </div>
            <button
              onClick={() => {
                setShowLeaderboard(false);
                setQuizCompleted(false);
                setSelectedQuiz(null);
                selectedQuizRef.current = null; // Clear ref when leaving
                setUserScore(null);
                setCurrentAttempt(null);
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back to Quizzes
            </button>
          </div>

          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No submissions yet. Be the first to take this quiz!</p>
              </div>
            ) : (
              leaderboard.map((entry, idx) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                    entry.userId === user?.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 font-bold text-lg">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {entry.userName}
                      {entry.userId === user?.id && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.percentage.toFixed(1)}% • {entry.score}/{entry.totalPoints} points •{" "}
                      {formatTime(entry.timeTaken)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Team Quizzes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and take quizzes with your team members
          </p>
        </div>
        {isTeamAdmin && (
          <button
            onClick={handleCreateQuiz}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </button>
        )}
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isTeamAdmin
              ? "Create your first quiz to test your team's knowledge!"
              : "No quizzes available. Contact a team admin to create a quiz."}
          </p>
          {isTeamAdmin && (
            <button
              onClick={handleCreateQuiz}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            // Debug: Log quiz info for synchronized quizzes
            if (quiz.startMode === "synchronized") {
              console.log("Synchronized quiz found:", {
                id: quiz.id,
                title: quiz.title,
                status: quiz.status,
                createdBy: quiz.createdBy,
                currentUserId: user?.id,
                isCreator: String(quiz.createdBy) === String(user?.id),
                canActivate: quiz.status === "draft" && String(quiz.createdBy) === String(user?.id)
              });
            }
            return (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {quiz.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    quiz.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : quiz.status === "completed"
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      : quiz.status === "scheduled"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}
                >
                  {quiz.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {quiz.questions.length} questions
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {quiz.participants.length} participants
                </div>
                {quiz.settings.totalTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(quiz.settings.totalTime)}
                  </div>
                )}
              </div>

              {/* Show synchronized countdown on card */}
              {quiz.startMode === "synchronized" && quiz.status === "active" && quiz.synchronizedStartTime && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      {(() => {
                        const startTime = quiz.synchronizedStartTime instanceof Date 
                          ? quiz.synchronizedStartTime.getTime()
                          : (quiz.synchronizedStartTime as any).toMillis?.() || (quiz.synchronizedStartTime as any).seconds * 1000;
                        const now = Date.now();
                        const timeUntilStart = Math.max(0, Math.floor((startTime - now) / 1000));
                        if (timeUntilStart > 0) {
                          return `Quiz starts in ${timeUntilStart}s`;
                        } else if (quiz.actualStartTime && quiz.settings.totalTime) {
                          // Show remaining time
                          const actualStart = quiz.actualStartTime instanceof Date 
                            ? quiz.actualStartTime.getTime()
                            : (quiz.actualStartTime as any).toMillis?.() || (quiz.actualStartTime as any).seconds * 1000;
                          const elapsed = Math.floor((Date.now() - actualStart) / 1000);
                          const remaining = Math.max(0, quiz.settings.totalTime - elapsed);
                          return remaining > 0 ? `Quiz in progress - ${formatTime(remaining)} remaining` : "Quiz completed";
                        } else {
                          return "Quiz is ready to start";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {quiz.status === "draft" && quiz.startMode === "synchronized" && (
                  <div className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Waiting for activation
                  </div>
                )}
                {(quiz.status === "active" || (quiz.status === "draft" && quiz.startMode !== "synchronized")) && (
                  <>
                    {quiz.startMode === "synchronized" && quiz.status === "active" ? (
                      // For synchronized quizzes, show countdown or allow starting
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        disabled={(() => {
                          if (!quiz.synchronizedStartTime) return true;
                          const startTime = quiz.synchronizedStartTime instanceof Date 
                            ? quiz.synchronizedStartTime.getTime()
                            : (quiz.synchronizedStartTime as any).toMillis?.() || (quiz.synchronizedStartTime as any).seconds * 1000;
                          const now = Date.now();
                          const timeUntilStart = Math.floor((startTime - now) / 1000);
                          // Disable if countdown hasn't finished or user already started
                          const hasStarted = quizStarted && selectedQuiz?.id === quiz.id;
                          return timeUntilStart > 0 || hasStarted;
                        })()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Clock className="w-4 h-4 animate-pulse" />
                        {quiz.synchronizedStartTime && (() => {
                          // Use synchronizedCountdown state if available, otherwise calculate
                          let timeUntilStart: number;
                          if (synchronizedQuizId === quiz.id && synchronizedCountdown !== null) {
                            timeUntilStart = synchronizedCountdown;
                          } else {
                            const startTime = quiz.synchronizedStartTime instanceof Date 
                              ? quiz.synchronizedStartTime.getTime()
                              : (quiz.synchronizedStartTime as any).toMillis?.() || (quiz.synchronizedStartTime as any).seconds * 1000;
                            const now = Date.now();
                            timeUntilStart = Math.max(0, Math.floor((startTime - now) / 1000));
                          }
                          // Check if user has already started
                          const hasStarted = quizStarted && selectedQuiz?.id === quiz.id;
                          if (hasStarted) {
                            return "Quiz Started";
                          }
                          return timeUntilStart > 0 ? `Starting in ${timeUntilStart}s` : "Start Quiz Now";
                        })()}
                      </button>
                    ) : (
                      // For individual mode, show Start Quiz button
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Quiz
                      </button>
                    )}
                  </>
                )}
                {quiz.status === "draft" && (
                  <>
                    {quiz.startMode === "synchronized" ? (
                      // For synchronized, only creator can activate
                      (() => {
                        // Use string comparison to handle type mismatches
                        const isCreator = String(quiz.createdBy) === String(user?.id);
                        console.log("Synchronized quiz activation check:", {
                          quizId: quiz.id,
                          quizCreatedBy: quiz.createdBy,
                          userId: user?.id,
                          isCreator,
                          quizTitle: quiz.title,
                          quizStatus: quiz.status,
                          startMode: quiz.startMode
                        });
                        return isCreator;
                      })() && (
                        <button
                          onClick={async () => {
                            if (!user) return;
                            try {
                              console.log("Activating synchronized quiz:", quiz.id, "by user:", user.id);
                              await quizService.updateQuiz(quiz.id, { status: "active" }, false, user.id);
                              // Refresh quizzes
                              const updatedQuiz = await quizService.getQuiz(quiz.id, false);
                              if (updatedQuiz) {
                                setQuizzes(quizzes.map(q => q.id === quiz.id ? updatedQuiz : q));
                              }
                            } catch (error: any) {
                              console.error("Error activating quiz:", error);
                              alert(error.message || "Failed to activate quiz. Only the quiz creator can activate synchronized quizzes.");
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Activate
                        </button>
                      )
                    ) : (
                      // For individual mode, check general permissions
                      canActivateQuiz[quiz.id] && (
                        <button
                          onClick={async () => {
                            if (!user) return;
                            try {
                              await quizService.updateQuiz(quiz.id, { status: "active" }, false, user.id);
                              // Refresh quizzes
                              const updatedQuiz = await quizService.getQuiz(quiz.id, false);
                              if (updatedQuiz) {
                                setQuizzes(quizzes.map(q => q.id === quiz.id ? updatedQuiz : q));
                                // Update permission check
                                const canActivate = await quizService.canUserActivateQuiz(quiz.id, user.id, false);
                                setCanActivateQuiz(prev => ({ ...prev, [quiz.id]: canActivate }));
                              }
                            } catch (error: any) {
                              console.error("Error activating quiz:", error);
                              alert(error.message || "Failed to activate quiz. Only quiz creator or team admin/owner can activate quizzes.");
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Activate
                        </button>
                      )
                    )}
                  </>
                )}
                {/* Debug info for synchronized quizzes */}
                {quiz.startMode === "synchronized" && quiz.status === "draft" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Debug: Created by {quiz.createdBy}, You are {user?.id}, Match: {String(quiz.createdBy) === String(user?.id) ? "Yes" : "No"}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  {/* Leaderboard button - always visible for all quiz statuses */}
                  <button
                    onClick={async () => {
                      try {
                        setSelectedQuiz(quiz);
                        setShowLeaderboard(true);
                        setQuizCompleted(false); // Reset completed state to show leaderboard view
                        setUserScore(null); // Don't show score card, just leaderboard
                        setCurrentAttempt(null);
                        // Load leaderboard immediately
                        const leaderboardData = await quizService.getQuizLeaderboard(quiz.id, false);
                        setLeaderboard(leaderboardData);
                      } catch (error) {
                        console.error("Error loading leaderboard:", error);
                        alert("Failed to load leaderboard. Please try again.");
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Leaderboard
                  </button>
                  
                  {/* Delete button - only for creator or team admin */}
                  {(String(quiz.createdBy) === String(user?.id) || isTeamAdmin) && (
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
                          return;
                        }
                        try {
                          await quizService.deleteQuiz(quiz.id, false);
                          // Remove quiz from list
                          setQuizzes(quizzes.filter(q => q.id !== quiz.id));
                        } catch (error: any) {
                          console.error("Error deleting quiz:", error);
                          alert(error.message || "Failed to delete quiz. Please try again.");
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Create Quiz Modal - This would be a separate component in production */}
      {showCreateQuiz && (
        <CreateQuizModal
          teamId={teamId}
          onClose={() => setShowCreateQuiz(false)}
          onCreated={(quiz) => {
            setShowCreateQuiz(false);
            setSelectedQuiz(quiz);
          }}
        />
      )}
    </div>
  );
};

// Create Quiz Modal Component
interface CreateQuizModalProps {
  teamId: string;
  onClose: () => void;
  onCreated: (quiz: Quiz) => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ teamId, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [totalTime, setTotalTime] = useState<number | undefined>();
  const [timePerQuestion, setTimePerQuestion] = useState<number | undefined>();
  const [startMode, setStartMode] = useState<"synchronized" | "individual">("individual");
  const [useAI, setUseAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  const user = realTimeAuth.getCurrentUser();

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      type: "multiple-choice",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "Option 1",
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setLoading(true);
    try {
      const aiQuestions = await quizService.generateAIQuestions(
        aiTopic,
        aiNumQuestions,
        "medium",
        ["multiple-choice"]
      );
      setQuestions(aiQuestions);
    } catch (error) {
      console.error("Error generating AI questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || questions.length === 0 || !user) return;

    setLoading(true);
    try {
      const quizId = await quizService.createTeamQuiz(teamId, user.id, user.name || user.email || "Anonymous", {
        title,
        description,
        questions,
        settings: {
          totalTime,
          timePerQuestion,
          shuffleQuestions: false,
          shuffleOptions: false,
          showResultsImmediately: true,
          allowReview: false,
        },
        status: startMode === "synchronized" ? "draft" : "active", // Synchronized quizzes start as draft, individual as active
        startMode, // Set start mode
      });

      const quiz = await quizService.getQuiz(quizId, false);
      if (quiz) {
        onCreated(quiz);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Quiz</h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter quiz description"
            />
          </div>

          {/* AI Generation */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded"
                />
                <span className="font-medium text-gray-900 dark:text-white">Generate questions with AI</span>
              </label>
            </div>

            {useAI && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                    placeholder="e.g., JavaScript, React, Data Structures"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={aiNumQuestions}
                    onChange={(e) => setAiNumQuestions(parseInt(e.target.value) || 5)}
                    min={1}
                    max={20}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                  />
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={loading || !aiTopic.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            )}
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Questions *
              </label>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, idx) => (
                <div key={question.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                      placeholder="Enter question"
                    />
                    <select
                      value={question.type}
                      onChange={(e) =>
                        handleQuestionChange(idx, "type", e.target.value as QuizQuestion["type"])
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="short-answer">Short Answer</option>
                    </select>

                    {(question.type === "multiple-choice" || question.type === "true-false") && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updated = [...(question.options || [])];
                                updated[optIdx] = e.target.value;
                                handleQuestionChange(idx, "options", updated);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Correct Answer
                          </label>
                          <select
                            value={Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer}
                            onChange={(e) => handleQuestionChange(idx, "correctAnswer", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                          >
                            {question.options?.map((opt, optIdx) => (
                              <option key={optIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {question.type === "short-answer" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer}
                          onChange={(e) => handleQuestionChange(idx, "correctAnswer", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(idx, "points", parseInt(e.target.value) || 1)}
                        min={1}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                        placeholder="Points"
                      />
                      <button
                        onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Mode
              </label>
              <select
                value={startMode}
                onChange={(e) => setStartMode(e.target.value as "synchronized" | "individual")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
              >
                <option value="individual">Individual - Members can start when ready</option>
                <option value="synchronized">Synchronized - Admin starts for all at once</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {startMode === "synchronized"
                  ? "Admin/creator must activate quiz before members can start"
                  : "Members can start the quiz individually when ready"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Time (seconds, optional)
                </label>
                <input
                  type="number"
                  value={totalTime || ""}
                  onChange={(e) => setTotalTime(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Per Question (seconds, optional)
                </label>
                <input
                  type="number"
                  value={timePerQuestion || ""}
                  onChange={(e) =>
                    setTimePerQuestion(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !title.trim() || questions.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};
