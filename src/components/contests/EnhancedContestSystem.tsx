// Enhanced Contest System with AI Question Generation, Manual Question Builder, and Advanced Leaderboard
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, Users, Award, Calendar, Target, Code, BookOpen, 
  Plus, Sparkles, Save, X, Edit, Trash2, Timer, BarChart3, CheckCircle,
  Loader, TrendingUp, Medal, Play
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
  teamId?: string; // Optional: if set, contest belongs to a specific team
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

interface EnhancedContestSystemProps {
  teamId?: string; // If provided, only show/create contests for this team
}

export const EnhancedContestSystem: React.FC<EnhancedContestSystemProps> = ({ teamId }) => {
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
    testCases: [{ input: '', output: '', hidden: false }],
    constraints: [''],
    points: 10,
    explanation: '',
    category: ''
  });

  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [aiPromptType, setAiPromptType] = useState<'quiz' | 'coding'>('quiz');
  const [aiPrompt, setAiPrompt] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: number; total: number; details: any[] } | null>(null);

  useEffect(() => {
    checkAdminStatus();
    loadContests();
  }, []);

  // Handle auto-submit (when timer expires)
  const handleAutoSubmit = async (contestId: string | null) => {
    if (!contestId || !user) return;
    
    const contest = contests.find(c => c.id === contestId);
    if (!contest) return;

    alert('Time is up! Submitting your answers automatically...');

    // Calculate score
    let score = 0;
    contest.questions.forEach((q, idx) => {
      if (q.questionType === 'multiple-choice' && userAnswers[idx] === q.correctAnswer) {
        score += q.points;
      }
    });

    // Save submission
    try {
      const contestRef = doc(db, 'contests', contest.id);
      const contestDoc = await getDoc(contestRef);
      
      if (contestDoc.exists()) {
        const contestData = contestDoc.data();
        const timeTaken = contestStartTime ? Math.floor((Date.now() - contestStartTime.getTime()) / 1000) : contest.totalTime * 60;
        
        // Create submission entry
        const submission = {
          userId: user.id,
          username: user.displayName || user.email || 'Anonymous',
          answers: userAnswers,
          score: score,
          submittedAt: new Date(),
          timeTaken: timeTaken
        };

        // Update existing leaderboard or create new
        const currentLeaderboard = contestData.leaderboard || [];
        const existingEntryIndex = currentLeaderboard.findIndex((entry: any) => entry.userId === user.id);
        
        let updatedLeaderboard;
        if (existingEntryIndex >= 0) {
          // Update existing entry
          updatedLeaderboard = [...currentLeaderboard];
          updatedLeaderboard[existingEntryIndex] = {
            userId: user.id,
            username: user.displayName || user.email || 'Anonymous',
            score: score,
            submittedAt: new Date(),
            timeTaken: timeTaken
          };
        } else {
          // Add new entry
          updatedLeaderboard = [
            ...currentLeaderboard,
            {
              userId: user.id,
              username: user.displayName || user.email || 'Anonymous',
              score: score,
              submittedAt: new Date(),
              timeTaken: timeTaken
            }
          ];
        }

        // Sort leaderboard by score (descending), then by time (ascending)
        updatedLeaderboard.sort((a: any, b: any) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        });

        // Update Firestore with both submission and leaderboard
        await updateDoc(contestRef, {
          [`submissions.${user.id}`]: submission,
          leaderboard: updatedLeaderboard
        });

        alert(`Auto-submitted! Your score: ${score} points\nTime taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`);
        setShowContestTaking(null);
        setCurrentQuestion(0);
        setUserAnswers({});
        setContestStartTime(null);
        loadContests();
      }
    } catch (error) {
      console.error('Error auto-submitting:', error);
      alert('Failed to auto-submit. Please try submitting manually.');
    }
  };

  // Timer effect for contest
  useEffect(() => {
    if (showContestTaking && contestStartTime) {
      const contest = contests.find(c => c.id === showContestTaking);
      if (!contest) return;

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - contestStartTime.getTime()) / 1000);
        const remaining = (contest.totalTime * 60) - elapsed;
        
        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(interval);
          // Auto-submit when time runs out
          handleAutoSubmit(showContestTaking);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showContestTaking, contestStartTime, contests]);

  // Initialize timer when contest starts
  useEffect(() => {
    if (showContestTaking && !contestStartTime) {
      setContestStartTime(new Date());
      const contest = contests.find(c => c.id === showContestTaking);
      if (contest) {
        setTimeRemaining(contest.totalTime * 60);
      }
    }
    if (!showContestTaking) {
      setContestStartTime(null);
    }
  }, [showContestTaking]);

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
          submissions: data.submissions || {},
          teamId: data.teamId || null
        };
      }) as Contest[];
      
      // Filter contests based on context
      const filteredContests = loadedContests.filter(contest => {
        if (teamId) {
          // In team space: only show contests for this team
          return contest.teamId === teamId;
        } else {
          // In community: only show contests without teamId (public contests)
          return !contest.teamId;
        }
      });
      
      console.log('Loaded contests:', filteredContests.length, teamId ? `(team: ${teamId})` : '(community)');
      setContests(filteredContests);
    } catch (error) {
      console.error('Error loading contests:', error);
      alert('Failed to load contests. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate questions using AI with custom prompts
  const generateQuestionsWithAI = async (customPrompt?: string, questionType?: 'quiz' | 'coding') => {
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

      const type = questionType || aiPromptType;
      const userPrompt = customPrompt || aiPrompt;

      let prompt = '';
      
      if (type === 'quiz') {
        prompt = `Generate ${newContest.totalQuestions} multiple-choice quiz questions.

Contest Topic: ${newContest.title}
Description: ${newContest.description || 'General knowledge'}
Difficulty: ${newContest.difficulty}
${userPrompt ? `\nAdditional Requirements: ${userPrompt}` : ''}

For each question, provide:
1. Question text
2. Four options (labeled A, B, C, D)
3. Correct answer (0-3 index)
4. Brief explanation
5. Category/topic
6. Optional hint/tip

Format as JSON array:
[
  {
    "questionType": "multiple-choice",
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct",
    "category": "Topic name",
    "points": 10
  }
]

Make questions challenging but fair for ${newContest.difficulty} level.`;
      } else {
        // Coding questions
        prompt = `Generate ${newContest.totalQuestions} coding problems.

Contest Topic: ${newContest.title}
Description: ${newContest.description || 'Programming challenges'}
Difficulty: ${newContest.difficulty}
${userPrompt ? `\nAdditional Requirements: ${userPrompt}` : ''}

For each coding problem, provide:
1. Problem statement
2. Sample input
3. Sample output
4. At least 3 test cases (1 public, 2 hidden)
5. Constraints
6. Explanation of approach
7. Optional hint/tip

Format as JSON array:
[
  {
    "questionType": "coding",
    "text": "Problem statement here...",
    "sampleInput": "Example input",
    "sampleOutput": "Expected output",
    "testCases": [
      {"input": "test input 1", "output": "expected output 1", "hidden": false},
      {"input": "test input 2", "output": "expected output 2", "hidden": true},
      {"input": "test input 3", "output": "expected output 3", "hidden": true}
    ],
    "constraints": ["Time limit: 1 second", "Memory limit: 256 MB"],
    "explanation": "Approach explanation",
    "category": "Algorithms/Data Structures",
    "points": 20
  }
]

Make problems appropriate for ${newContest.difficulty} level.`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        setNewContest(prev => ({
          ...prev,
          questions: [...(prev.questions || []), ...questions.map((q: any, idx: number) => ({
            ...q,
            id: `q_${Date.now()}_${idx}`
          }))]
        }));
        alert(`Successfully generated ${questions.length} ${type} questions!`);
        setShowAIGenerateModal(false);
        setAiPrompt('');
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
    if (!newQuestion.text) {
      alert('Please fill in question text');
      return;
    }

    const questionType = newQuestion.questionType || 'multiple-choice';

    if (questionType === 'multiple-choice' && newQuestion.options?.some(opt => !opt)) {
      alert('Please fill in all options for multiple-choice question');
      return;
    }

    if (questionType === 'coding' && (!newQuestion.sampleInput || !newQuestion.sampleOutput)) {
      alert('Please fill in sample input and output for coding question');
      return;
    }

    const question: Question = {
      id: newQuestion.id || `q_${Date.now()}`,
      questionType: newQuestion.questionType || 'multiple-choice',
      text: newQuestion.text!,
      points: newQuestion.points || 10,
      explanation: newQuestion.explanation,
      category: newQuestion.category,
      ...(questionType === 'multiple-choice' ? {
        options: newQuestion.options as string[],
        correctAnswer: newQuestion.correctAnswer!
      } : {
        sampleInput: newQuestion.sampleInput,
        sampleOutput: newQuestion.sampleOutput,
        testCases: newQuestion.testCases || [],
        constraints: newQuestion.constraints || []
      })
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
      questionType: 'multiple-choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      sampleInput: '',
      sampleOutput: '',
      testCases: [{ input: '', output: '', hidden: false }],
      constraints: [''],
      points: 10,
      explanation: '',
      category: ''
    });

    setShowQuestionBuilder(false);
  };

  // Helper functions for test cases and constraints
  const addTestCase = () => {
    setNewQuestion(prev => ({
      ...prev,
      testCases: [...(prev.testCases || []), { input: '', output: '', hidden: false }]
    }));
  };

  const updateTestCase = (index: number, field: 'input' | 'output' | 'hidden', value: string | boolean) => {
    setNewQuestion(prev => {
      const newTestCases = [...(prev.testCases || [])];
      newTestCases[index] = { ...newTestCases[index], [field]: value };
      return { ...prev, testCases: newTestCases };
    });
  };

  const removeTestCase = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      testCases: (prev.testCases || []).filter((_, i) => i !== index)
    }));
  };

  const addConstraint = () => {
    setNewQuestion(prev => ({
      ...prev,
      constraints: [...(prev.constraints || []), '']
    }));
  };

  const updateConstraint = (index: number, value: string) => {
    setNewQuestion(prev => {
      const newConstraints = [...(prev.constraints || [])];
      newConstraints[index] = value;
      return { ...prev, constraints: newConstraints };
    });
  };

  const removeConstraint = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      constraints: (prev.constraints || []).filter((_, i) => i !== index)
    }));
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

      const contestData: any = {
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

      // If teamId is provided, this is a team contest
      if (teamId) {
        contestData.teamId = teamId;
      }

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

  // Update contest statuses dynamically
  const getContestStatus = (contest: Contest): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
  };

  const filteredContests = contests.filter(c => {
    const status = getContestStatus(c);
    if (activeTab === 'upcoming') return status === 'upcoming';
    if (activeTab === 'active') return status === 'active';
    if (activeTab === 'completed') return status === 'completed';
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
                    questionType: 'multiple-choice',
                    text: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    sampleInput: '',
                    sampleOutput: '',
                    testCases: [{ input: '', output: '', hidden: false }],
                    constraints: [''],
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
              {/* Question Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Type *
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewQuestion(prev => ({ ...prev, questionType: 'multiple-choice' }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      newQuestion.questionType === 'multiple-choice'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Quiz (Multiple Choice)</span>
                  </button>
                  <button
                    onClick={() => setNewQuestion(prev => ({ ...prev, questionType: 'coding' }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      newQuestion.questionType === 'coding'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Code className="w-5 h-5" />
                    <span className="font-medium">Coding Problem</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {newQuestion.questionType === 'coding' ? 'Problem Statement *' : 'Question Text *'}
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={newQuestion.questionType === 'coding' ? 5 : 3}
                  placeholder={newQuestion.questionType === 'coding' ? 'Describe the coding problem in detail...' : 'Enter your question...'}
                />
              </div>

              {/* Quiz-specific fields */}
              {newQuestion.questionType === 'multiple-choice' && (
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
              )}

              {/* Coding-specific fields */}
              {newQuestion.questionType === 'coding' && (
                <>
                  {/* Sample Input/Output */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sample Input *
                      </label>
                      <textarea
                        value={newQuestion.sampleInput}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, sampleInput: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        rows={3}
                        placeholder="e.g., 5 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sample Output *
                      </label>
                      <textarea
                        value={newQuestion.sampleOutput}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, sampleOutput: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        rows={3}
                        placeholder="e.g., 8"
                      />
                    </div>
                  </div>

                  {/* Test Cases */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Test Cases *
                      </label>
                      <button
                        onClick={addTestCase}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        <Plus className="w-4 h-4" />
                        Add Test Case
                      </button>
                    </div>
                    <div className="space-y-3">
                      {newQuestion.testCases?.map((testCase, idx) => (
                        <div key={idx} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Test Case {idx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <input
                                  type="checkbox"
                                  checked={testCase.hidden}
                                  onChange={(e) => updateTestCase(idx, 'hidden', e.target.checked)}
                                  className="rounded"
                                />
                                Hidden
                              </label>
                              <button
                                onClick={() => removeTestCase(idx)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Input</label>
                              <textarea
                                value={testCase.input}
                                onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Output</label>
                              <textarea
                                value={testCase.output}
                                onChange={(e) => updateTestCase(idx, 'output', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Constraints
                      </label>
                      <button
                        onClick={addConstraint}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        <Plus className="w-4 h-4" />
                        Add Constraint
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newQuestion.constraints?.map((constraint, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={constraint}
                            onChange={(e) => updateConstraint(idx, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="e.g., 1 ≤ N ≤ 10^5"
                          />
                          <button
                            onClick={() => removeConstraint(idx)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Common fields */}
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
                    placeholder={newQuestion.questionType === 'coding' ? 'e.g., Arrays, DP' : 'e.g., Programming, Math'}
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

              {/* Explanation / Hint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {newQuestion.questionType === 'coding' ? 'Hint / Approach (Optional)' : 'Explanation (Optional)'}
                </label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder={newQuestion.questionType === 'coding' ? 'Give a hint or explain the approach...' : 'Explain why this answer is correct...'}
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
                      questionType: 'multiple-choice',
                      text: '',
                      options: ['', '', '', ''],
                      correctAnswer: 0,
                      sampleInput: '',
                      sampleOutput: '',
                      testCases: [{ input: '', output: '', hidden: false }],
                      constraints: [''],
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

      {/* AI Generation Modal */}
      {showAIGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      AI Question Generator
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generate questions using AI with custom prompts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAIGenerateModal(false);
                    setAiPrompt('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Question Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Question Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAiPromptType('quiz')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      aiPromptType === 'quiz'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <BookOpen className={`w-8 h-8 mx-auto mb-2 ${
                      aiPromptType === 'quiz' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">Quiz Questions</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Multiple choice questions</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setAiPromptType('coding')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      aiPromptType === 'coding'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <Code className={`w-8 h-8 mx-auto mb-2 ${
                      aiPromptType === 'coding' ? 'text-purple-600' : 'text-gray-500'
                    }`} />
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">Coding Problems</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">With test cases & constraints</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder={aiPromptType === 'quiz' 
                    ? 'e.g., Focus on data structures and algorithms, include questions about arrays and linked lists'
                    : 'e.g., Include dynamic programming problems, medium difficulty, with edge cases'}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {aiPromptType === 'quiz'
                    ? '💡 Tip: Be specific about topics, difficulty level, or question style you want'
                    : '💡 Tip: Mention specific algorithms, data structures, or problem patterns you want'}
                </p>
              </div>

              {/* Info Box */}
              <div className={`p-4 rounded-lg border-2 ${
                aiPromptType === 'quiz'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
              }`}>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  AI will generate:
                </p>
                <ul className="text-sm space-y-1 ml-6">
                  {aiPromptType === 'quiz' ? (
                    <>
                      <li>• Multiple-choice questions with 4 options</li>
                      <li>• Correct answers marked</li>
                      <li>• Explanations for each answer</li>
                      <li>• Categorized by topic</li>
                    </>
                  ) : (
                    <>
                      <li>• Detailed problem statements</li>
                      <li>• Sample input/output</li>
                      <li>• Multiple test cases (public & hidden)</li>
                      <li>• Constraints and hints</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => generateQuestionsWithAI(aiPrompt, aiPromptType)}
                  disabled={isGeneratingQuestions}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate {newContest.totalQuestions} Questions
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAIGenerateModal(false);
                    setAiPrompt('');
                  }}
                  disabled={isGeneratingQuestions}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg font-medium"
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
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.userId}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            isCurrentUser
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md'
                              : idx === 0 
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
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {entry.username || 'Anonymous'}
                                </p>
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {entry.submittedAt && typeof entry.submittedAt === 'object' && 'toDate' in entry.submittedAt 
                                  ? entry.submittedAt.toDate().toLocaleString()
                                  : entry.submittedAt?.toLocaleString?.() || 'Recently'}
                              </p>
                              {entry.timeTaken !== undefined && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  ⏱️ {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {entry.score || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                          <span className="ml-2 font-bold text-gray-900 dark:text-white">{leaderboard.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Max Score:</span>
                          <span className="ml-2 font-bold text-gray-900 dark:text-white">
                            {contest.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
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
                    onClick={() => setShowAIGenerateModal(true)}
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
                          <div className="flex items-center gap-2 mb-1">
                            {q.questionType === 'coding' ? (
                              <Code className="w-4 h-4 text-purple-600" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {q.questionType === 'coding' ? 'Coding' : 'Quiz'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {idx + 1}. {q.text?.substring(0, 100)}{q.text?.length > 100 ? '...' : ''}
                          </p>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-3">
                            {q.category && <span>📁 {q.category}</span>}
                            {q.questionType === 'coding' ? (
                              <span className="text-purple-600 dark:text-purple-400">
                                🧪 {q.testCases?.length || 0} test cases
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400">
                                ✓ {q.options?.[q.correctAnswer || 0] || 'N/A'}
                              </span>
                            )}
                            <span>{q.points} pts</span>
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

                {/* Time Information */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Start Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(contest.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">End Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(contest.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const status = getContestStatus(contest);
                    const now = new Date();
                    const start = new Date(contest.startTime);
                    const end = new Date(contest.endTime);
                    
                    if (status === 'upcoming') {
                      const timeUntil = Math.floor((start.getTime() - now.getTime()) / 1000 / 60);
                      return (
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Starts in {timeUntil < 60 ? `${timeUntil} minutes` : `${Math.floor(timeUntil / 60)} hours`}
                        </div>
                      );
                    }
                    
                    if (status === 'active') {
                      const timeLeft = Math.floor((end.getTime() - now.getTime()) / 1000 / 60);
                      return (
                        <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          ⚡ Active - {timeLeft} minutes remaining
                        </div>
                      );
                    }
                    
                    return (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Contest ended
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  {(() => {
                    const contestStatus = getContestStatus(contest);
                    const isRegistered = contest.participants?.includes(user?.id || '');
                    const hasSubmitted = contest.submissions && user?.id && contest.submissions[user.id];

                    return (
                      <>
                        {/* Show register button only for upcoming contests */}
                        {contestStatus === 'upcoming' && !isRegistered && (
                          <button
                            onClick={() => handleRegister(contest.id)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Register Now
                          </button>
                        )}

                        {/* Show registered status for upcoming contests */}
                        {contestStatus === 'upcoming' && isRegistered && (
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                            <p className="text-green-600 font-medium">Registered!</p>
                            <p className="text-xs text-green-600/80 mt-1">Contest will start soon</p>
                          </div>
                        )}

                        {/* Show start button for active contests */}
                        {contestStatus === 'active' && !isRegistered && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                              ⚠️ You must register first
                            </p>
                          </div>
                        )}

                        {contestStatus === 'active' && isRegistered && !hasSubmitted && (
                          <button
                            onClick={() => setShowContestTaking(contest.id)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 animate-pulse"
                          >
                            <Play className="w-5 h-5" />
                            Start Contest
                          </button>
                        )}

                        {contestStatus === 'active' && isRegistered && hasSubmitted && (
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <p className="text-blue-600 font-medium">Submitted!</p>
                            <p className="text-xs text-blue-600/80 mt-1">Check leaderboard for results</p>
                          </div>
                        )}

                        {/* Show results for completed contests */}
                        {contestStatus === 'completed' && hasSubmitted && (
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <Award className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                            <p className="text-purple-600 font-medium">Contest Ended</p>
                            <p className="text-xs text-purple-600/80 mt-1">
                              Your Score: {contest.submissions[user!.id].score} points
                            </p>
                          </div>
                        )}

                        {contestStatus === 'completed' && !hasSubmitted && (
                          <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Contest has ended
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}

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

      {/* Contest Taking Interface - Full Screen */}
      {showContestTaking && (() => {
        const contest = contests.find(c => c.id === showContestTaking);
        if (!contest) return null;
        
        const currentQ = contest.questions[currentQuestion];
        const isCoding = currentQ?.questionType === 'coding';

        return (
          <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold">{contest.title}</h2>
                    <p className="text-sm opacity-90 mt-1">
                      Question {currentQuestion + 1} of {contest.questions.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <Clock className="w-5 h-5" />
                      <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-xs opacity-90">Time Remaining</p>
                  </div>
                </div>
              </div>

              {/* Question Content - Split view for coding */}
              <div className={`flex-1 ${isCoding ? 'flex overflow-hidden' : 'overflow-y-auto'}`}>
                {contest.questions[currentQuestion] && (() => {
                  const question = contest.questions[currentQuestion];
                  
                  // For non-coding questions, wrap in padding container
                  if (question.questionType !== 'coding') {
                    return (
                      <div className="p-6 space-y-6 max-w-4xl mx-auto">
                        {/* Question Type Badge */}
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Multiple Choice
                          </span>
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                            {question.points} points
                          </span>
                        </div>

                        {/* Question Text */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {question.text}
                          </h3>
                          
                          {/* Category */}
                          {question.category && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Category: {question.category}
                            </div>
                          )}
                        </div>

                        {/* Quiz Options */}
                        {question.options && (
                        <div className="space-y-3">
                          {question.options.map((option, idx) => (
                            <label
                              key={idx}
                              className={`w-full p-4 flex items-center gap-4 rounded-lg border-2 cursor-pointer transition-all ${
                                userAnswers[currentQuestion] === idx
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${currentQuestion}`}
                                checked={userAnswers[currentQuestion] === idx}
                                onChange={() => setUserAnswers(prev => ({ ...prev, [currentQuestion]: idx }))}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-lg font-bold text-gray-700 dark:text-gray-300 min-w-[30px]">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <span className="flex-1 text-gray-900 dark:text-white text-base">
                                {option}
                              </span>
                              {userAnswers[currentQuestion] === idx && (
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </label>
                          ))}
                        </div>
                        )}

                        {/* Hint/Explanation */}
                        {question.explanation && (
                          <details className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                            <summary className="cursor-pointer text-sm font-medium text-blue-800 dark:text-blue-300">
                              💡 Hint
                            </summary>
                            <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                              {question.explanation}
                            </p>
                          </details>
                        )}
                      </div>
                    );
                  }

                  // For coding questions, render split-screen layout
                  return (
                    <div className="flex h-full">
                      {/* Coding Problem - Split Screen */}
                      {question.questionType === 'coding' && (
                        <>
                          {/* Left Panel - Problem Description */}
                          <div className="w-1/2 border-r border-gray-300 dark:border-gray-700 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                            <div className="space-y-4">
                              {/* Problem Statement */}
                              <div className="mb-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                  {question.text}
                                </h3>
                                {question.category && (
                                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                    {question.category}
                                  </span>
                                )}
                              </div>
                              {/* Sample Input/Output */}
                              {(question.sampleInput || question.sampleOutput) && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Examples:</h4>
                                  <div className="space-y-3">
                                    {question.sampleInput && (
                                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Input:</p>
                                        <pre className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">
                                          {question.sampleInput}
                                        </pre>
                                      </div>
                                    )}
                                    {question.sampleOutput && (
                                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Output:</p>
                                        <pre className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">
                                          {question.sampleOutput}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Constraints */}
                              {question.constraints && question.constraints.length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Constraints:</p>
                                  <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                                    {question.constraints.map((constraint, idx) => (
                                      <li key={idx}>• {constraint}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Panel - Code Editor */}
                          <div className="w-1/2 flex flex-col">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                              <div className="flex items-center gap-3">
                                <select
                                  value={codeLanguage}
                                  onChange={(e) => setCodeLanguage(e.target.value)}
                                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="javascript">JavaScript</option>
                                  <option value="python">Python</option>
                                  <option value="java">Java</option>
                                  <option value="cpp">C++</option>
                                  <option value="c">C</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    const code = userAnswers[currentQuestion] || '';
                                    if (!code.trim()) {
                                      setCodeOutput('Error: No code to run');
                                      return;
                                    }

                                    setIsRunningCode(true);
                                    setCodeOutput('Running code...');
                                    setTestResults(null);
                                    
                                    try {
                                      if (codeLanguage === 'javascript') {
                                        // Execute JavaScript code directly
                                        let output = '';
                                        const originalLog = console.log;
                                        
                                        // Capture console.log output
                                        const logs: any[] = [];
                                        console.log = (...args) => {
                                          logs.push(args.map(arg => 
                                            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                                          ).join(' '));
                                        };

                                        try {
                                          // Create function and execute
                                          const func = new Function(code);
                                          const result = func();
                                          
                                          if (logs.length > 0) {
                                            output = logs.join('\n');
                                          } else if (result !== undefined) {
                                            output = String(result);
                                          } else {
                                            output = 'Code executed successfully (no output)';
                                          }
                                        } catch (execError: any) {
                                          output = `Runtime Error:\n${execError.message}`;
                                        } finally {
                                          console.log = originalLog;
                                        }

                                        setCodeOutput(output);
                                      } else {
                                        // Use Piston API for other languages
                                        const languageMap: Record<string, string> = {
                                          'python': 'python',
                                          'java': 'java',
                                          'cpp': 'cpp',
                                          'c': 'c'
                                        };

                                        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            language: languageMap[codeLanguage],
                                            version: '*',
                                            files: [{ content: code }]
                                          })
                                        });

                                        const data = await response.json();
                                        
                                        if (data.run) {
                                          const output = data.run.output || data.run.stdout || '';
                                          const error = data.run.stderr || '';
                                          setCodeOutput(error ? `Error:\n${error}` : output || 'No output');
                                        } else {
                                          setCodeOutput('Error: Could not execute code');
                                        }
                                      }
                                    } catch (error: any) {
                                      setCodeOutput(`Error: ${error.message || 'Failed to execute code'}`);
                                    } finally {
                                      setIsRunningCode(false);
                                    }
                                  }}
                                  disabled={isRunningCode}
                                  className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white text-sm rounded font-medium flex items-center gap-2 transition-all"
                                >
                                  {isRunningCode ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      Running...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4" />
                                      Run
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    const code = userAnswers[currentQuestion] || '';
                                    if (!code.trim()) {
                                      alert('Please write some code first');
                                      return;
                                    }

                                    if (!question.testCases || question.testCases.length === 0) {
                                      alert('No test cases available for this problem');
                                      return;
                                    }

                                    setIsRunningCode(true);
                                    setTestResults(null);
                                    
                                    try {
                                      const results = [];
                                      
                                      if (codeLanguage === 'javascript') {
                                        // Execute JavaScript code against test cases
                                        for (const tc of question.testCases) {
                                          try {
                                            const originalLog = console.log;
                                            const logs: any[] = [];
                                            
                                            console.log = (...args) => {
                                              logs.push(args.map(arg => 
                                                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                                              ).join(' '));
                                            };

                                            // Create function that takes input
                                            const func = new Function('input', code + '\nreturn typeof solution === "function" ? solution(input) : undefined;');
                                            const result = func(tc.input);
                                            
                                            console.log = originalLog;
                                            
                                            const actualOutput = logs.length > 0 ? logs.join('\n') : String(result || '');
                                            const passed = actualOutput.trim() === tc.output.trim();
                                            
                                            results.push({
                                              testCase: results.length + 1,
                                              input: tc.input,
                                              expectedOutput: tc.output,
                                              actualOutput,
                                              passed,
                                              hidden: tc.hidden
                                            });
                                          } catch (error: any) {
                                            results.push({
                                              testCase: results.length + 1,
                                              input: tc.input,
                                              expectedOutput: tc.output,
                                              actualOutput: `Error: ${error.message}`,
                                              passed: false,
                                              hidden: tc.hidden
                                            });
                                          }
                                        }
                                      } else {
                                        // Use Piston API for other languages
                                        const languageMap: Record<string, string> = {
                                          'python': 'python',
                                          'java': 'java',
                                          'cpp': 'cpp',
                                          'c': 'c'
                                        };

                                        for (const tc of question.testCases) {
                                          try {
                                            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                language: languageMap[codeLanguage],
                                                version: '*',
                                                files: [{ content: code }],
                                                stdin: tc.input
                                              })
                                            });

                                            const data = await response.json();
                                            const actualOutput = data.run?.output || data.run?.stdout || '';
                                            const passed = actualOutput.trim() === tc.output.trim();
                                            
                                            results.push({
                                              testCase: results.length + 1,
                                              input: tc.input,
                                              expectedOutput: tc.output,
                                              actualOutput: actualOutput || data.run?.stderr || 'No output',
                                              passed,
                                              hidden: tc.hidden
                                            });
                                          } catch (error: any) {
                                            results.push({
                                              testCase: results.length + 1,
                                              input: tc.input,
                                              expectedOutput: tc.output,
                                              actualOutput: `Error: ${error.message}`,
                                              passed: false,
                                              hidden: tc.hidden
                                            });
                                          }
                                        }
                                      }

                                      const passed = results.filter(r => r.passed).length;
                                      setTestResults({
                                        passed,
                                        total: results.length,
                                        details: results
                                      });
                                      
                                    } catch (error: any) {
                                      setCodeOutput(`Error: ${error.message || 'Failed to test code'}`);
                                    } finally {
                                      setIsRunningCode(false);
                                    }
                                  }}
                                  disabled={isRunningCode}
                                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded font-medium flex items-center gap-2 transition-all"
                                >
                                  {isRunningCode ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      Testing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Submit & Test
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Code Editor */}
                            <div className="flex-1 overflow-hidden bg-gray-900">
                              <textarea
                                value={userAnswers[currentQuestion] || ''}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
                                className="w-full h-full px-4 py-3 bg-gray-900 text-gray-100 font-mono text-base leading-relaxed resize-none focus:outline-none border-0"
                                style={{ tabSize: 4 }}
                                placeholder={`// Write your ${codeLanguage} code here...\n\nfunction solution() {\n    // Your code here\n    return result;\n}`}
                                spellCheck="false"
                              />
                            </div>

                            {/* Test Results Panel */}
                            {testResults && (
                              <div className="border-t border-gray-700 bg-gray-800 p-4 max-h-64 overflow-y-auto">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white">Test Results:</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      testResults.passed === testResults.total
                                        ? 'bg-green-600 text-white'
                                        : testResults.passed > 0
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-red-600 text-white'
                                    }`}>
                                      {testResults.passed} / {testResults.total} Passed
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setTestResults(null)}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="space-y-2">
                                  {testResults.details.map((result, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-lg border ${
                                        result.passed
                                          ? 'bg-green-900/20 border-green-600'
                                          : 'bg-red-900/20 border-red-600'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-300">
                                          Test Case {result.testCase} {result.hidden && '(Hidden)'}
                                        </span>
                                        {result.passed ? (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <X className="w-4 h-4 text-red-400" />
                                        )}
                                      </div>
                                      {!result.hidden && (
                                        <div className="text-xs text-gray-400 mt-2 space-y-1">
                                          <div>Input: <span className="text-gray-300">{result.input}</span></div>
                                          <div>Expected: <span className="text-gray-300">{result.expectedOutput}</span></div>
                                          {!result.passed && (
                                            <div>Got: <span className="text-red-400">{result.actualOutput}</span></div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Output Panel */}
                            {codeOutput && !testResults && (
                              <div className="border-t border-gray-700 bg-gray-800 p-4 max-h-48 overflow-y-auto">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-gray-300">Output:</p>
                                  <button
                                    onClick={() => setCodeOutput('')}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                  {codeOutput}
                                </pre>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Navigation Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg font-medium transition-all"
                  >
                    ← Previous
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Progress: {Object.keys(userAnswers).length} / {contest.questions.length} answered
                    </p>
                  </div>

                  {currentQuestion < contest.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (confirm(`Submit contest? You have answered ${Object.keys(userAnswers).length} out of ${contest.questions.length} questions.`)) {
                          // Calculate score
                          let score = 0;
                          contest.questions.forEach((q, idx) => {
                            if (q.questionType === 'multiple-choice' && userAnswers[idx] === q.correctAnswer) {
                              score += q.points;
                            }
                          });

                          // Save submission
                          try {
                            const contestRef = doc(db, 'contests', contest.id);
                            const contestDoc = await getDoc(contestRef);
                            
                            if (contestDoc.exists()) {
                              const contestData = contestDoc.data();
                              const timeTaken = contestStartTime ? Math.floor((Date.now() - contestStartTime.getTime()) / 1000) : 0;
                              
                              // Create submission entry
                              const submission = {
                                userId: user!.id,
                                username: user!.displayName || user!.email || 'Anonymous',
                                answers: userAnswers,
                                score: score,
                                submittedAt: new Date(),
                                timeTaken: timeTaken
                              };

                              // Update existing leaderboard or create new
                              const currentLeaderboard = contestData.leaderboard || [];
                              const existingEntryIndex = currentLeaderboard.findIndex((entry: any) => entry.userId === user!.id);
                              
                              let updatedLeaderboard;
                              if (existingEntryIndex >= 0) {
                                // Update existing entry
                                updatedLeaderboard = [...currentLeaderboard];
                                updatedLeaderboard[existingEntryIndex] = {
                                  userId: user!.id,
                                  username: user!.displayName || user!.email || 'Anonymous',
                                  score: score,
                                  submittedAt: new Date(),
                                  timeTaken: timeTaken
                                };
                              } else {
                                // Add new entry
                                updatedLeaderboard = [
                                  ...currentLeaderboard,
                                  {
                                    userId: user!.id,
                                    username: user!.displayName || user!.email || 'Anonymous',
                                    score: score,
                                    submittedAt: new Date(),
                                    timeTaken: timeTaken
                                  }
                                ];
                              }

                              // Sort leaderboard by score (descending), then by time (ascending)
                              updatedLeaderboard.sort((a: any, b: any) => {
                                if (b.score !== a.score) return b.score - a.score;
                                return a.timeTaken - b.timeTaken;
                              });

                              // Update Firestore with both submission and leaderboard
                              await updateDoc(contestRef, {
                                [`submissions.${user!.id}`]: submission,
                                leaderboard: updatedLeaderboard
                              });

                              alert(`Contest submitted! Your score: ${score} points\nTime taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`);
                              setShowContestTaking(null);
                              setCurrentQuestion(0);
                              setUserAnswers({});
                              loadContests();
                            }
                          } catch (error) {
                            console.error('Error submitting:', error);
                            alert('Failed to submit. Please try again.');
                          }
                        }
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Submit Contest
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                      setShowContestTaking(null);
                      setCurrentQuestion(0);
                      setUserAnswers({});
                    }
                  }}
                  className="mt-4 w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                >
                  Exit Contest
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
