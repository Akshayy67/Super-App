// Leaderboard Component - Global and Friends leaderboards
import React, { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Globe,
  Crown,
  Medal,
  TrendingUp,
  Zap,
  Award,
  Target,
  Flame,
} from "lucide-react";
import { gamificationService, LeaderboardEntry, LEVELS } from "../../services/gamificationService";
import { realTimeAuth } from "../../utils/realTimeAuth";

type LeaderboardTab = "global" | "friends";

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("global");
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setIsLoading(true);
    try {
      // Load global leaderboard
      const global = await gamificationService.getGlobalLeaderboard(100);
      setGlobalLeaderboard(global);
      
      // Find user's rank
      if (user) {
        const userEntry = global.find(entry => entry.userId === user.uid);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
      
      // Load friends leaderboard (TODO: get friend IDs from friends service)
      // For now, showing empty or could show top users as potential friends
      const friendIds: string[] = []; // TODO: Get from friends service
      if (friendIds.length > 0) {
        const friends = await gamificationService.getFriendsLeaderboard(friendIds);
        setFriendsLeaderboard(friends);
      }
    } catch (error) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getLevelColor = (level: number) => {
    return LEVELS[level]?.color || '#9CA3AF';
  };

  const currentLeaderboard = activeTab === "global" ? globalLeaderboard : friendsLeaderboard;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              Leaderboard
            </h1>
            <p className="text-white/90">Compete with students worldwide!</p>
          </div>
          
          {userRank && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-sm text-white/80 mb-1">Your Rank</div>
              <div className="text-3xl font-bold">#{userRank}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("global")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "global"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-5 h-5" />
              Global
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "friends"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Friends
            </div>
          </button>
        </div>

        {/* Leaderboard Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : currentLeaderboard.length > 0 ? (
            <div className="space-y-2">
              {currentLeaderboard.map((entry, index) => {
                const isCurrentUser = user?.uid === entry.userId;
                const isTopThree = entry.rank <= 3;
                
                return (
                  <div
                    key={entry.userId}
                    className={`p-4 rounded-lg transition-all ${
                      isCurrentUser
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                        : isTopThree
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10"
                        : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 text-center">
                        {getRankIcon(entry.rank) || (
                          <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                            {getRankBadge(entry.rank)}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                          {entry.photo ? (
                            <img src={entry.photo} alt={entry.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {entry.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Level Badge */}
                        <div 
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          style={{ backgroundColor: getLevelColor(entry.level) }}
                        >
                          {entry.level}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(You)</span>
                            )}
                          </h3>
                          {isTopThree && (
                            <Crown className="w-4 h-4" style={{ color: getLevelColor(entry.level) }} />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm" style={{ color: getLevelColor(entry.level) }}>
                          <Award className="w-4 h-4" />
                          <span>{entry.levelName}</span>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
                          <Zap className="w-5 h-5 text-yellow-500" />
                          <span>{entry.xp.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">XP</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === "friends" 
                  ? "No friends yet. Add some friends to see their rankings!"
                  : "No leaderboard data available yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {globalLeaderboard.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {globalLeaderboard[0]?.xp.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Top Player XP</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userRank ? `#${userRank}` : "—"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Rank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
