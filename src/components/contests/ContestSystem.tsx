// Contest System - Coding Contests, Quiz Contests, and More
import React, { useState, useEffect } from "react";
import {
  Trophy,
  Code,
  Brain,
  Clock,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Play,
  Check,
  X,
  Trash2,
  Star,
  Zap,
  Target,
  Flame,
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { db } from "../../config/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { isAdmin } from "../../utils/adminUtils";

interface Contest {
  id: string;
  title: string;
  description: string;
  type: "coding" | "quiz" | "mixed" | "creative";
  difficulty: "easy" | "medium" | "hard";
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  maxParticipants?: number;
  prize?: string;
  rules: string[];
  problems?: CodingProblem[];
  questions?: QuizQuestion[];
  participants: string[];
  submissions: Record<string, Submission>;
  leaderboard: LeaderboardEntry[];
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  status: "upcoming" | "active" | "completed";
}

interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  testCases: TestCase[];
  constraints: string[];
  examples: string[];
}

interface TestCase {
  input: string;
  output: string;
  hidden?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
}

interface Submission {
  userId: string;
  username: string;
  score: number;
  timeTaken: number;
  submittedAt: Date;
  answers: any[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  timeTaken: number;
  rank: number;
}

export const ContestSystem: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "active" | "completed">("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create contest form
  const [newContest, setNewContest] = useState<Partial<Contest>>({
    title: "",
    description: "",
    type: "coding",
    difficulty: "medium",
    duration: 60,
    rules: ["No plagiarism", "No external help", "Submit before time runs out"],
    problems: [],
    questions: [],
  });

  useEffect(() => {
    checkAdminStatus();
    loadContests();
  }, []);

  const checkAdminStatus = async () => {
    if (user?.email) {
      const adminStatus = await isAdmin(user.email);
      setIsUserAdmin(adminStatus);
    }
  };

  const loadContests = async () => {
    try {
      setLoading(true);
      const contestsRef = collection(db, "contests");
      const snapshot = await getDocs(contestsRef);
      
      const contestsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          participants: data.participants || [],
          submissions: data.submissions || {},
          leaderboard: data.leaderboard || [],
          rules: data.rules || [],
          problems: data.problems || [],
          questions: data.questions || [],
        };
      }) as Contest[];

      // Sort by start time
      contestsData.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      console.log("Loaded contests:", contestsData);
      setContests(contestsData);
    } catch (error) {
      console.error("Error loading contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const createContest = async () => {
    if (!user || !isUserAdmin) return;
    
    try {
      const contestId = `contest_${Date.now()}`;
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1); // Start in 1 hour
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (newContest.duration || 60));

      const contest: Contest = {
        id: contestId,
        title: newContest.title || "Untitled Contest",
        description: newContest.description || "",
        type: newContest.type || "coding",
        difficulty: newContest.difficulty || "medium",
        startTime,
        endTime,
        duration: newContest.duration || 60,
        prize: newContest.prize || "",
        rules: newContest.rules || [],
        problems: newContest.problems || [],
        questions: newContest.questions || [],
        participants: [],
        submissions: {},
        leaderboard: [],
        createdBy: user.id,
        createdByName: user.username || user.email || "Admin",
        createdAt: new Date(),
        status: "upcoming",
      };

      // Remove undefined fields before saving
      const contestData: any = {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        type: contest.type,
        difficulty: contest.difficulty,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        duration: contest.duration,
        rules: contest.rules,
        problems: contest.problems,
        questions: contest.questions,
        participants: contest.participants,
        submissions: contest.submissions,
        leaderboard: contest.leaderboard,
        createdBy: contest.createdBy,
        createdByName: contest.createdByName,
        createdAt: serverTimestamp(),
        status: contest.status,
      };
      
      // Only add prize if it's not empty
      if (contest.prize) {
        contestData.prize = contest.prize;
      }
      
      await setDoc(doc(db, "contests", contestId), contestData);

      setContests([...contests, contest]);
      setShowCreateForm(false);
      setNewContest({
        title: "",
        description: "",
        type: "coding",
        difficulty: "medium",
        duration: 60,
        rules: ["No plagiarism", "No external help", "Submit before time runs out"],
      });
    } catch (error) {
      console.error("Error creating contest:", error);
      alert("Failed to create contest");
    }
  };

  const joinContest = async (contestId: string) => {
    if (!user) return;
    
    try {
      const contest = contests.find(c => c.id === contestId);
      if (!contest) return;

      if (contest.participants.includes(user.id)) {
        alert("You're already registered for this contest!");
        return;
      }

      await updateDoc(doc(db, "contests", contestId), {
        participants: [...contest.participants, user.id],
      });

      // Update local state
      setContests(contests.map(c => 
        c.id === contestId 
          ? { ...c, participants: [...c.participants, user.id] }
          : c
      ));

      alert("Successfully registered for the contest!");
    } catch (error) {
      console.error("Error joining contest:", error);
      alert("Failed to join contest");
    }
  };

  const deleteContest = async (contestId: string) => {
    if (!isUserAdmin) return;
    
    if (confirm("Are you sure you want to delete this contest?")) {
      try {
        await deleteDoc(doc(db, "contests", contestId));
        setContests(contests.filter(c => c.id !== contestId));
      } catch (error) {
        console.error("Error deleting contest:", error);
        alert("Failed to delete contest");
      }
    }
  };

  const getContestIcon = (type: string) => {
    switch (type) {
      case "coding": return Code;
      case "quiz": return Brain;
      case "mixed": return Zap;
      case "creative": return Star;
      default: return Trophy;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "hard": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusBadge = (contest: Contest) => {
    const now = new Date();
    if (now < contest.startTime) {
      return <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">Upcoming</span>;
    } else if (now >= contest.startTime && now <= contest.endTime) {
      return <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full animate-pulse">Live</span>;
    } else {
      return <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 rounded-full">Ended</span>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredContests = contests.filter(c => {
    const now = new Date();
    if (activeTab === "upcoming") return now < c.startTime;
    if (activeTab === "active") return now >= c.startTime && now <= c.endTime;
    if (activeTab === "completed") return now > c.endTime;
    return true;
  });

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
            <p className="text-white/90 text-lg">Compete, Learn, and Win! Coding & Quiz Contests</p>
          </div>
          
          {isUserAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Create Contest
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex gap-2">
          {(["upcoming", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab}
              {tab === "active" && contests.filter(c => {
                const now = new Date();
                return now >= c.startTime && now <= c.endTime;
              }).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {contests.filter(c => {
                    const now = new Date();
                    return now >= c.startTime && now <= c.endTime;
                  }).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Create Contest Form */}
      {showCreateForm && isUserAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Contest</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contest Title
              </label>
              <input
                type="text"
                value={newContest.title}
                onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                placeholder="e.g., Weekly Coding Challenge #1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newContest.description}
                onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                placeholder="Describe the contest..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newContest.type}
                  onChange={(e) => setNewContest({ ...newContest, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newContest.duration}
                  onChange={(e) => setNewContest({ ...newContest, duration: Number(e.target.value) })}
                  min="15"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prize (Optional)
              </label>
              <input
                type="text"
                value={newContest.prize || ""}
                onChange={(e) => setNewContest({ ...newContest, prize: e.target.value })}
                placeholder="e.g., ₹500 Amazon Voucher"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={createContest}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Create Contest
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contests Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading contests...</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No {activeTab} contests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => {
            const Icon = getContestIcon(contest.type);
            const isRegistered = contest.participants.includes(user?.id || "");
            
            return (
              <div
                key={contest.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{contest.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(contest.difficulty)}`}>
                          {contest.difficulty}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(contest)}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {contest.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{contest.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(contest.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{contest.participants.length} registered</span>
                    </div>
                    {contest.prize && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                        <Award className="w-4 h-4" />
                        <span>{contest.prize}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isRegistered && activeTab !== "completed" && (
                      <button
                        onClick={() => joinContest(contest.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Register
                      </button>
                    )}
                    
                    {isRegistered && (
                      <button
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 cursor-default"
                      >
                        <Check className="w-4 h-4" />
                        Registered
                      </button>
                    )}

                    {isUserAdmin && (
                      <button
                        onClick={() => deleteContest(contest.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
