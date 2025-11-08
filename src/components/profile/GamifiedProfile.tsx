// Gamified Profile Page - Shows levels, XP, achievements, badges, social links
import React, { useState, useEffect } from "react";
import {
  User,
  Trophy,
  Star,
  Award,
  TrendingUp,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Zap,
  Target,
  Flame,
  Crown,
  Edit,
  ExternalLink,
  Lock,
  Check,
  Code,
  BookOpen,
  Users,
} from "lucide-react";
import { gamificationService, LEVELS, Achievement, UserGamification } from "../../services/gamificationService";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
}

export const GamifiedProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserGamification | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user || !user.uid) {
      console.warn('No user or user.uid available');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Update login streak
      await gamificationService.updateLoginStreak(user.uid);
      
      // Load gamification data
      const data = await gamificationService.getUserGamification(user.uid);
      setUserData(data);
      
      // Load achievements
      const achievementsData = await gamificationService.getUserAchievements(user.uid);
      setAchievements(achievementsData);
      
      // TODO: Load social links from profile service
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    return LEVELS[level]?.color || '#9CA3AF';
  };

  const getLevelGradient = (level: number) => {
    const color = getLevelColor(level);
    return `linear-gradient(135deg, ${color}20, ${color}40)`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) return null;

  const levelInfo = gamificationService.calculateLevel(userData.xp);
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ background: getLevelGradient(userData.level) }}
      >
        {/* Cover Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full border-4 overflow-hidden"
                style={{ borderColor: getLevelColor(userData.level) }}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {(user?.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Level Badge */}
              <div 
                className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: getLevelColor(userData.level) }}
              >
                Lv {userData.level}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.displayName || 'Anonymous User'}
              </h1>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5" style={{ color: getLevelColor(userData.level) }} />
                <span className="text-xl font-semibold" style={{ color: getLevelColor(userData.level) }}>
                  {userData.levelName}
                </span>
              </div>
              
              {/* XP Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {userData.xp.toLocaleString()} XP
                  </span>
                  {userData.level < 7 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {(levelInfo.nextLevelXP - userData.xp).toLocaleString()} to next level
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${levelInfo.progress}%`,
                      backgroundColor: getLevelColor(userData.level)
                    }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {userData.currentStreak} day streak
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {unlockedAchievements.length} achievements
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Code className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {userData.totalProblemsSolved} problems solved
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button 
              onClick={() => setIsEditingLinks(!isEditingLinks)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Social Links */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{userData.currentStreak} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{userData.longestStreak} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{userData.totalProblemsSolved}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mock Interviews</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{userData.totalMockInterviews}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Certifications</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{userData.totalCertifications}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Study Hours</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{userData.totalStudyHours}h</span>
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Social Links
              </h2>
              {!isEditingLinks && (
                <button 
                  onClick={() => setIsEditingLinks(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditingLinks ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/username"
                    value={socialLinks.github || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/username"
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    placeholder="https://twitter.com/username"
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Portfolio
                  </label>
                  <input
                    type="text"
                    placeholder="https://yoursite.com"
                    value={socialLinks.portfolio || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => {
                    // TODO: Save social links
                    setIsEditingLinks(false);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Links
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {socialLinks.github ? (
                  <a 
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">GitHub</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ) : null}
                
                {socialLinks.linkedin ? (
                  <a 
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">LinkedIn</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ) : null}
                
                {socialLinks.twitter ? (
                  <a 
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Twitter</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ) : null}
                
                {socialLinks.portfolio ? (
                  <a 
                    href={socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Portfolio</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ) : null}
                
                {!socialLinks.github && !socialLinks.linkedin && !socialLinks.twitter && !socialLinks.portfolio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No social links added yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Middle & Right Columns - Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unlocked Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements ({unlockedAchievements.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{achievement.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{achievement.description}</p>
                  <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                    <Zap className="w-3 h-3" />
                    <span>+{achievement.xpReward} XP</span>
                  </div>
                </div>
              ))}
              
              {unlockedAchievements.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No achievements unlocked yet. Keep learning to earn your first achievement!
                </div>
              )}
            </div>
          </div>

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-500" />
                Locked Achievements
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.slice(0, 9).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-60"
                  >
                    <div className="text-4xl mb-2 grayscale">{achievement.icon}</div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">{achievement.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{achievement.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Lock className="w-3 h-3" />
                      <span>{achievement.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
