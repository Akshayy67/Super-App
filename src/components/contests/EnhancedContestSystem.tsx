// Enhanced Contest System with AI Question Generation, Manual Question Builder, and Advanced Leaderboard
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, Users, Award, Calendar, Target, Code, BookOpen, 
  Plus, Sparkles, Save, X, Edit, Trash2, Timer, BarChart3, CheckCircle,
  Loader, TrendingUp, Medal
} from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { realTimeAuth } from '../../utils/realTimeAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isAdmin } from '../../utils/adminUtils';

interface Question {
  id: string;
  questionType: 'multiple-choice' | 'coding';
  text: string;
  // For multiple choice
  options?: string[];
  correctAnswer?: number;
  // For coding
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: TestCase[];
  constraints?: string[];
  // Common
  points: number;
  explanation?: string;
  category?: string;
}

interface TestCase {
  input: string;
  output: string;
  hidden?: boolean;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'mixed' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
  startTime: Date;
  endTime: Date;
  prize?: string;
  maxParticipants: number;
  participants: string[];
  createdBy: string;
  creatorName: string;
  status: 'upcoming' | 'live' | 'ended';
  questions: Question[];
  totalQuestions: number;
  totalTime: number; // in minutes
  timePerQuestion: number; // in seconds
  isSynchronous: boolean; // true = everyone starts at same time
  leaderboard: LeaderboardEntry[];
  submissions: Record<string, Submission>;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  submittedAt: Date;
  timeTaken: number;
}

interface Submission {
  userId: string;
  username: string;
  answers: any[];
  score: number;
  submittedAt: Date;
}

export const EnhancedContestSystem: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);
  const [showContestTaking, setShowContestTaking] = useState<string | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [contestStartTime, setContestStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const user = realTimeAuth.getCurrentUser();
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const [newContest, setNewContest] = useState<Partial<Contest>>({
    title: '',
    description: '',
    type: 'quiz',
    difficulty: 'medium',
    prize: '',
    maxParticipants: 100,
    questions: [],
    participants: [],
    totalQuestions: 10,
    totalTime: 30,
    timePerQuestion: 60,
    isSynchronous: false,
    leaderboard: [],
    submissions: {}
  });

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    questionType: 'multiple-choice',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    sampleInput: '',
    sampleOutput: '',
    testCases: [],
    constraints: [],
    points: 10,
    explanation: '',
    category: ''
  });

  useEffect(() => {
    checkAdminStatus();
    loadContests();
  }, []);

  const checkAdminStatus = async () => {
    if (user) {
      const adminStatus = await isAdmin(user.id);
      setIsUserAdmin(adminStatus);
    }
  };

  const loadContests = async () => {
    try {
      const contestsRef = collection(db, 'contests');
      const snapshot = await getDocs(contestsRef);
      const loadedContests = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(data.startTime) || new Date(),
          endTime: data.endTime?.toDate?.() || new Date(data.endTime) || new Date(),
          participants: data.participants || [],
          questions: data.questions || [],
          leaderboard: data.leaderboard || [],
          submissions: data.submissions || {}
        };
      }) as Contest[];
      
      console.log('Loaded contests:', loadedContests.length);
      setContests(loadedContests);
    } catch (error) {
      console.error('Error loading contests:', error);
      alert('Failed to load contests. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate questions using AI
  const generateQuestionsWithAI = async () => {
    if (!newContest.totalQuestions || !newContest.title) {
      alert('Please fill in contest title and number of questions first');
      return;
    }

    setIsGeneratingQuestions(true);
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Generate ${newContest.totalQuestions} multiple-choice questions for a ${newContest.type} contest with ${newContest.difficulty} difficulty level.

Contest Topic: ${newContest.title}
Description: ${newContest.description || 'General knowledge'}

For each question, provide:
1. Question text
2. Four options (labeled A, B, C, D)
3. Correct answer (0-3 index)
4. Brief explanation
5. Category/topic

Format as JSON array:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct",
    "category": "Topic name",
    "points": 10
  }
]

Make questions challenging but fair for ${newContest.difficulty} level.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        setNewContest(prev => ({
          ...prev,
          questions: questions.map((q: any, idx: number) => ({
            ...q,
            id: `q_${Date.now()}_${idx}`
          }))
        }));
        alert(`Successfully generated ${questions.length} questions!`);
      } else {
        throw new Error('Could not parse AI response');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again or add manually.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Add question manually
  const addQuestionManually = () => {
    if (!newQuestion.text || newQuestion.options?.some(opt => !opt)) {
      alert('Please fill in question text and all options');
      return;
    }

    const question: Question = {
      id: newQuestion.id || `q_${Date.now()}`,
      text: newQuestion.text!,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer!,
      points: newQuestion.points || 10,
      explanation: newQuestion.explanation,
      category: newQuestion.category
    };

    if (newQuestion.id) {
      // Editing existing question
      setNewContest(prev => ({
        ...prev,
        questions: (prev.questions || []).map(q => q.id === question.id ? question : q)
      }));
    } else {
      // Adding new question
      setNewContest(prev => ({
        ...prev,
        questions: [...(prev.questions || []), question]
      }));
    }

    // Reset form
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      explanation: '',
      category: ''
    });

    setShowQuestionBuilder(false);
  };

  const deleteQuestion = (questionId: string) => {
    setNewContest(prev => ({
      ...prev,
      questions: (prev.questions || []).filter(q => q.id !== questionId)
    }));
  };

  const editQuestion = (question: Question) => {
    setNewQuestion(question);
    setShowQuestionBuilder(true);
  };

  const createContest = async () => {
    if (!user || !isUserAdmin) return;
    
    if (!newContest.title || !newContest.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (!newContest.questions || newContest.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      // Set default start and end times if not provided
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const contestData = {
        title: newContest.title,
        description: newContest.description,
        type: newContest.type,
        difficulty: newContest.difficulty,
        prize: newContest.prize || '',
        maxParticipants: newContest.maxParticipants || 100,
        questions: newContest.questions || [],
        totalQuestions: newContest.totalQuestions || 10,
        totalTime: newContest.totalTime || 30,
        timePerQuestion: newContest.timePerQuestion || 60,
        isSynchronous: newContest.isSynchronous || false,
        createdBy: user.id,
        creatorName: user.displayName || user.email || 'Admin',
        startTime: newContest.startTime || tomorrow,
        endTime: newContest.endTime || dayAfter,
        createdAt: serverTimestamp(),
        participants: [],
        leaderboard: [],
        submissions: {}
      };

      await addDoc(collection(db, 'contests'), contestData);
      
      // Reset form
      setNewContest({
        title: '',
        description: '',
        type: 'quiz',
        difficulty: 'medium',
        prize: '',
        maxParticipants: 100,
        questions: [],
        participants: [],
        totalQuestions: 10,
        totalTime: 30,
        timePerQuestion: 60,
        isSynchronous: false,
        leaderboard: [],
        submissions: {}
      });
      
      setShowCreateForm(false);
      loadContests();
      alert('Contest created successfully!');
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Failed to create contest');
    }
  };

  const handleRegister = async (contestId: string) => {
    if (!user) return;
    
    try {
      const contestRef = doc(db, 'contests', contestId);
      const contestDoc = await getDoc(contestRef);
      
      if (contestDoc.exists()) {
        const contest = contestDoc.data();
        const participants = contest.participants || [];
        
        if (!participants.includes(user.id)) {
          await updateDoc(contestRef, {
            participants: [...participants, user.id]
          });
          
          setContests(prev => prev.map(c => 
            c.id === contestId 
              ? { ...c, participants: [...c.participants, user.id] }
              : c
          ));
          
          alert('Successfully registered!');
        }
      }
    } catch (error) {
      console.error('Error registering for contest:', error);
    }
  };

  const deleteContest = async (contestId: string) => {
    if (!isUserAdmin) return;
    
    if (confirm('Are you sure you want to delete this contest?')) {
      try {
        await deleteDoc(doc(db, 'contests', contestId));
        setContests(prev => prev.filter(c => c.id !== contestId));
      } catch (error) {
        console.error('Error deleting contest:', error);
      }
    }
  };

  const filteredContests = contests.filter(c => {
    const now = new Date();
    if (activeTab === 'upcoming') return c.startTime > now;
    if (activeTab === 'active') return c.startTime <= now && c.endTime >= now;
    if (activeTab === 'completed') return c.endTime < now;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10" />
              Contests
            </h1>
            <p className="text-white/90 text-lg">Compete with AI-powered questions and win prizes!</p>
          </div>
          
          {isUserAdmin && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              {showCreateForm ? 'Cancel' : 'Create Contest'}
            </button>
          )}
        </div>
      </div>

      {/* Question Builder Modal */}
      {showQuestionBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {newQuestion.id ? 'Edit Question' : 'Add Question Manually'}
              </h3>
              <button
                onClick={() => {
                  setShowQuestionBuilder(false);
                  setNewQuestion({
                    text: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    points: 10,
                    explanation: '',
                    category: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter your question..."
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Options * (Select correct answer)
                </label>
                <div className="space-y-3">
                  {newQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === idx}
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(newQuestion.options || [])];
                          newOptions[idx] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Category and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Programming, Math"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Explain why this answer is correct..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addQuestionManually}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Question
                </button>
                <button
                  onClick={() => {
                    setShowQuestionBuilder(false);
                    setNewQuestion({
                      text: '',
                      options: ['', '', '', ''],
                      correctAnswer: 0,
                      points: 10,
                      explanation: '',
                      category: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-yellow-500" />
                Contest Leaderboard
              </h3>
              <button
                onClick={() => setShowLeaderboard(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const contest = contests.find(c => c.id === showLeaderboard);
                if (!contest) return null;

                const leaderboard = contest.leaderboard || [];
                
                if (leaderboard.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">No submissions yet</p>
                      <p className="text-sm">Be the first to participate!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {leaderboard
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((entry, idx) => (
                        <div
                          key={entry.userId}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            idx === 0 
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-2 border-yellow-400'
                              : idx === 1
                              ? 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700/30 dark:to-gray-800/20 border border-gray-300'
                              : idx === 2
                              ? 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-300'
                              : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                              idx === 0
                                ? 'bg-yellow-500 text-white text-lg'
                                : idx === 1
                                ? 'bg-gray-400 text-white'
                                : idx === 2
                                ? 'bg-orange-400 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {entry.username || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {entry.submittedAt?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {entry.score || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Create Contest Form */}
      {showCreateForm && isUserAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Contest</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contest Title *
              </label>
              <input
                type="text"
                value={newContest.title}
                onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Weekly JavaScript Challenge"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={newContest.description}
                onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Describe the contest..."
              />
            </div>

            {/* Type and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newContest.type}
                  onChange={(e) => setNewContest({ ...newContest, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="coding">Coding</option>
                  <option value="quiz">Quiz</option>
                  <option value="mixed">Mixed</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={newContest.difficulty}
                  onChange={(e) => setNewContest({ ...newContest, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Timing Configuration */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Timing Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={newContest.totalQuestions}
                    onChange={(e) => setNewContest({ ...newContest, totalQuestions: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={newContest.totalTime}
                    onChange={(e) => setNewContest({ ...newContest, totalTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time per Question (sec)
                  </label>
                  <input
                    type="number"
                    value={newContest.timePerQuestion}
                    onChange={(e) => setNewContest({ ...newContest, timePerQuestion: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="10"
                    max="600"
                  />
                </div>
              </div>

              {/* Synchronous/Asynchronous */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contest Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newContest.isSynchronous === true}
                      onChange={() => setNewContest({ ...newContest, isSynchronous: true })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Synchronous</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Everyone starts at the same time</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newContest.isSynchronous === false}
                      onChange={() => setNewContest({ ...newContest, isSynchronous: false })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Asynchronous</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Flexible timing, participate anytime</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Question Management */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Questions ({newContest.questions?.length || 0}/{newContest.totalQuestions || 0})
              </h3>

              {/* Question Actions - Only for admins/creators */}
              {isUserAdmin && (
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => setShowQuestionBuilder(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Manually
                  </button>
                  <button
                    onClick={generateQuestionsWithAI}
                    disabled={isGeneratingQuestions}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingQuestions ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              )}

              {/* Questions List */}
              {newContest.questions && newContest.questions.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newContest.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {idx + 1}. {q.text}
                          </p>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {q.category && <span className="mr-3">📁 {q.category}</span>}
                            <span className="text-green-600 dark:text-green-400">
                              ✓ {q.options[q.correctAnswer]}
                            </span>
                            <span className="ml-3">{q.points} pts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => editQuestion(q)}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteQuestion(q.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!newContest.questions || newContest.questions.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No questions added yet</p>
                  <p className="text-sm">Add questions manually or generate them with AI</p>
                </div>
              )}
            </div>

            {/* Start and End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newContest.startTime ? new Date(newContest.startTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNewContest({ ...newContest, startTime: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newContest.endTime ? new Date(newContest.endTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNewContest({ ...newContest, endTime: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Prize */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prize (Optional)
              </label>
              <input
                type="text"
                value={newContest.prize}
                onChange={(e) => setNewContest({ ...newContest, prize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., $100, Certificate, Trophy"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={createContest}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Create Contest
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contest Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'completed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Contest Cards */}
      {filteredContests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No {activeTab} contests</p>
          <p className="text-sm">
            {isUserAdmin && activeTab === 'upcoming' 
              ? 'Create your first contest to get started!' 
              : 'Check back later for new contests'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map(contest => {
            const isRegistered = contest.participants.includes(user?.id || '');
            
            return (
              <div key={contest.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{contest.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    contest.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    contest.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {contest.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{contest.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{contest.participants.length} registered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{contest.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{contest.totalTime} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Timer className="w-4 h-4" />
                    <span>{contest.isSynchronous ? 'Synchronous' : 'Asynchronous'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isRegistered && (
                    <button
                      onClick={() => handleRegister(contest.id)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Register Now
                    </button>
                  )}
                  
                  {isRegistered && (
                    <div className="text-center mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-green-600 font-medium text-sm">Registered!</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowLeaderboard(contest.id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    View Leaderboard
                  </button>

                  {isUserAdmin && (
                    <button
                      onClick={() => deleteContest(contest.id)}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
