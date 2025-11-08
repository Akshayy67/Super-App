// Gamification Service - XP, Levels, Achievements, Badges
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, increment, Timestamp } from 'firebase/firestore';
import { realTimeAuth } from '../utils/realTimeAuth';

// Level thresholds
export const LEVELS = {
  1: { name: 'Novice', minXP: 0, maxXP: 1000, color: '#9CA3AF' },
  2: { name: 'Beginner', minXP: 1000, maxXP: 2500, color: '#10B981' },
  3: { name: 'Intermediate', minXP: 2500, maxXP: 5000, color: '#3B82F6' },
  4: { name: 'Advanced', minXP: 5000, maxXP: 10000, color: '#8B5CF6' },
  5: { name: 'Expert', minXP: 10000, maxXP: 20000, color: '#F59E0B' },
  6: { name: 'Master', minXP: 20000, maxXP: 50000, color: '#EF4444' },
  7: { name: 'Legend', minXP: 50000, maxXP: Infinity, color: '#FFD700' }
};

// XP Rewards for different activities
export const XP_REWARDS = {
  // Study activities
  COMPLETE_COURSE: 500,
  COMPLETE_MODULE: 100,
  WATCH_VIDEO: 20,
  READ_ARTICLE: 10,
  TAKE_NOTES: 15,
  
  // Practice
  SOLVE_PROBLEM: 50,
  PERFECT_SCORE: 100,
  FIRST_TRY_SUCCESS: 75,
  CODING_CHALLENGE: 150,
  
  // Assessments
  PASS_ASSESSMENT: 300,
  PERFECT_ASSESSMENT: 500,
  SKILL_CERTIFICATION: 1000,
  
  // Interview Prep
  MOCK_INTERVIEW: 200,
  CODING_INTERVIEW: 250,
  SYSTEM_DESIGN: 300,
  
  // Social
  HELP_PEER: 50,
  GET_UPVOTE: 10,
  SHARE_RESOURCE: 25,
  
  // Consistency
  DAILY_LOGIN: 10,
  WEEKLY_STREAK: 50,
  MONTHLY_STREAK: 200,
  
  // Achievements
  FIRST_ACHIEVEMENT: 100,
  REFERRAL: 150,
  PROFILE_COMPLETE: 200
};

// Achievement definitions
export const ACHIEVEMENTS = {
  // Streak achievements
  STREAK_7: {
    id: 'streak_7',
    name: '7 Day Warrior',
    description: 'Login for 7 consecutive days',
    icon: '🔥',
    xpReward: 100,
    requirement: { type: 'streak', value: 7 }
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Champion',
    description: 'Login for 30 consecutive days',
    icon: '⚡',
    xpReward: 500,
    requirement: { type: 'streak', value: 30 }
  },
  STREAK_100: {
    id: 'streak_100',
    name: '100 Day Legend',
    description: 'Login for 100 consecutive days',
    icon: '👑',
    xpReward: 2000,
    requirement: { type: 'streak', value: 100 }
  },
  
  // Problem solving
  PROBLEMS_10: {
    id: 'problems_10',
    name: 'Problem Solver',
    description: 'Solve 10 coding problems',
    icon: '💻',
    xpReward: 200,
    requirement: { type: 'problemsSolved', value: 10 }
  },
  PROBLEMS_50: {
    id: 'problems_50',
    name: 'Code Warrior',
    description: 'Solve 50 coding problems',
    icon: '⚔️',
    xpReward: 500,
    requirement: { type: 'problemsSolved', value: 50 }
  },
  PROBLEMS_100: {
    id: 'problems_100',
    name: 'Coding Master',
    description: 'Solve 100 coding problems',
    icon: '🏆',
    xpReward: 1000,
    requirement: { type: 'problemsSolved', value: 100 }
  },
  
  // Assessments
  FIRST_CERT: {
    id: 'first_cert',
    name: 'Certified',
    description: 'Earn your first certification',
    icon: '📜',
    xpReward: 500,
    requirement: { type: 'certifications', value: 1 }
  },
  CERTS_5: {
    id: 'certs_5',
    name: 'Multi-Certified',
    description: 'Earn 5 certifications',
    icon: '🎓',
    xpReward: 1500,
    requirement: { type: 'certifications', value: 5 }
  },
  
  // Interview prep
  INTERVIEWS_10: {
    id: 'interviews_10',
    name: 'Interview Ready',
    description: 'Complete 10 mock interviews',
    icon: '🎤',
    xpReward: 500,
    requirement: { type: 'mockInterviews', value: 10 }
  },
  PERFECT_INTERVIEW: {
    id: 'perfect_interview',
    name: 'Interview Ace',
    description: 'Score 100% in a mock interview',
    icon: '⭐',
    xpReward: 300,
    requirement: { type: 'perfectInterview', value: 1 }
  },
  
  // Social
  HELPFUL_PEER: {
    id: 'helpful_peer',
    name: 'Team Player',
    description: 'Help 10 peers with their doubts',
    icon: '🤝',
    xpReward: 200,
    requirement: { type: 'helpedPeers', value: 10 }
  },
  TOP_CONTRIBUTOR: {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Get 100 upvotes on your answers',
    icon: '👍',
    xpReward: 500,
    requirement: { type: 'upvotes', value: 100 }
  },
  
  // Special
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 6 AM',
    icon: '🌅',
    xpReward: 100,
    requirement: { type: 'earlyStudy', value: 1 }
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 11 PM',
    icon: '🦉',
    xpReward: 100,
    requirement: { type: 'lateStudy', value: 1 }
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Solve a hard problem in under 5 minutes',
    icon: '⚡',
    xpReward: 300,
    requirement: { type: 'fastSolve', value: 1 }
  },
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'Profile Complete',
    description: 'Complete your profile 100%',
    icon: '✅',
    xpReward: 200,
    requirement: { type: 'profileComplete', value: 100 }
  }
};

export interface UserGamification {
  userId: string;
  xp: number;
  level: number;
  levelName: string;
  nextLevelXP: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  
  // Stats
  totalProblemsolved: number;
  totalMockInterviews: number;
  totalCertifications: number;
  totalStudyHours: number;
  
  // Achievements
  achievements: string[]; // Achievement IDs
  badges: string[];
  
  // Activity
  activities: {
    date: string;
    xpEarned: number;
    activities: string[];
  }[];
  
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  photo?: string;
  xp: number;
  level: number;
  levelName: string;
  rank: number;
}

class GamificationService {
  private gamificationCollection = 'gamification';
  private achievementsCollection = 'userAchievements';
  private leaderboardCollection = 'leaderboard';

  // Calculate level from XP
  calculateLevel(xp: number): { level: number; levelName: string; nextLevelXP: number; progress: number; color: string } {
    let level = 1;
    let levelData = LEVELS[1];
    
    for (let i = 7; i >= 1; i--) {
      if (xp >= LEVELS[i].minXP) {
        level = i;
        levelData = LEVELS[i];
        break;
      }
    }
    
    const nextLevel = level < 7 ? LEVELS[level + 1] : LEVELS[7];
    const currentLevelMinXP = levelData.minXP;
    const nextLevelXP = nextLevel.minXP;
    
    const progress = level < 7 
      ? Math.round(((xp - currentLevelMinXP) / (nextLevelXP - currentLevelMinXP)) * 100)
      : 100;
    
    return {
      level,
      levelName: levelData.name,
      nextLevelXP: level < 7 ? nextLevelXP : xp,
      progress,
      color: levelData.color
    };
  }

  // Initialize user gamification data
  async initializeUser(userId: string): Promise<void> {
    const docRef = doc(db, this.gamificationCollection, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const initialData: any = {
        userId,
        xp: 0,
        level: 1,
        levelName: 'Novice',
        nextLevelXP: 1000,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: new Date().toISOString().split('T')[0],
        totalProblemsSolved: 0,
        totalMockInterviews: 0,
        totalCertifications: 0,
        totalStudyHours: 0,
        achievements: [],
        badges: [],
        activities: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(docRef, initialData);
    }
  }

  // Award XP to user
  async awardXP(userId: string, xpAmount: number, activityName: string): Promise<{ 
    newXP: number; 
    leveledUp: boolean; 
    newLevel?: number;
    newLevelName?: string;
  }> {
    if (!userId) {
      console.warn('No userId provided to awardXP');
      return { newXP: 0, leveledUp: false };
    }
    
    const docRef = doc(db, this.gamificationCollection, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await this.initializeUser(userId);
      return this.awardXP(userId, xpAmount, activityName);
    }
    
    const data = docSnap.data();
    const currentXP = data.xp || 0;
    const currentLevel = data.level || 1;
    
    const newXP = currentXP + xpAmount;
    const levelInfo = this.calculateLevel(newXP);
    const leveledUp = levelInfo.level > currentLevel;
    
    // Update activity log
    const today = new Date().toISOString().split('T')[0];
    const activities = data.activities || [];
    const todayActivity = activities.find((a: any) => a.date === today);
    
    if (todayActivity) {
      todayActivity.xpEarned += xpAmount;
      todayActivity.activities.push(activityName);
    } else {
      activities.push({
        date: today,
        xpEarned: xpAmount,
        activities: [activityName]
      });
    }
    
    // Keep only last 30 days
    const recentActivities = activities.slice(-30);
    
    await updateDoc(docRef, {
      xp: newXP,
      level: levelInfo.level,
      levelName: levelInfo.levelName,
      nextLevelXP: levelInfo.nextLevelXP,
      activities: recentActivities,
      updatedAt: Timestamp.now()
    });
    
    // Update leaderboard
    await this.updateLeaderboard(userId, newXP, levelInfo.level, levelInfo.levelName);
    
    return {
      newXP,
      leveledUp,
      newLevel: leveledUp ? levelInfo.level : undefined,
      newLevelName: leveledUp ? levelInfo.levelName : undefined
    };
  }

  // Update login streak
  async updateLoginStreak(userId: string): Promise<{ currentStreak: number; isNewStreak: boolean }> {
    if (!userId) {
      console.warn('No userId provided to updateLoginStreak');
      return { currentStreak: 0, isNewStreak: false };
    }
    
    const docRef = doc(db, this.gamificationCollection, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await this.initializeUser(userId);
      return this.updateLoginStreak(userId);
    }
    
    const data = docSnap.data();
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = data.lastLoginDate;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let currentStreak = data.currentStreak || 0;
    let isNewStreak = false;
    
    if (lastLogin === today) {
      // Already logged in today
      return { currentStreak, isNewStreak: false };
    }
    
    if (lastLogin === yesterdayStr) {
      // Continuing streak
      currentStreak += 1;
      isNewStreak = true;
    } else {
      // Streak broken
      currentStreak = 1;
      isNewStreak = true;
    }
    
    const longestStreak = Math.max(data.longestStreak || 0, currentStreak);
    
    await updateDoc(docRef, {
      currentStreak,
      longestStreak,
      lastLoginDate: today,
      updatedAt: Timestamp.now()
    });
    
    // Award daily login XP
    if (isNewStreak) {
      await this.awardXP(userId, XP_REWARDS.DAILY_LOGIN, 'Daily Login');
    }
    
    // Check streak achievements
    await this.checkStreakAchievements(userId, currentStreak);
    
    return { currentStreak, isNewStreak };
  }

  // Check and unlock achievements
  async checkStreakAchievements(userId: string, streak: number): Promise<void> {
    const achievementsToCheck = [
      { threshold: 7, achievement: ACHIEVEMENTS.STREAK_7 },
      { threshold: 30, achievement: ACHIEVEMENTS.STREAK_30 },
      { threshold: 100, achievement: ACHIEVEMENTS.STREAK_100 }
    ];
    
    for (const { threshold, achievement } of achievementsToCheck) {
      if (streak >= threshold) {
        await this.unlockAchievement(userId, achievement.id);
      }
    }
  }

  // Unlock achievement
  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const docRef = doc(db, this.gamificationCollection, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await this.initializeUser(userId);
      return false;
    }
    
    const data = docSnap.data();
    const achievements = data.achievements || [];
    
    // Check if already unlocked
    if (achievements.includes(achievementId)) {
      return false;
    }
    
    // Find achievement definition
    const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
    if (!achievement) return false;
    
    // Unlock achievement
    achievements.push(achievementId);
    
    await updateDoc(docRef, {
      achievements,
      updatedAt: Timestamp.now()
    });
    
    // Award XP
    await this.awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`);
    
    return true;
  }

  // Get user gamification data
  async getUserGamification(userId: string): Promise<UserGamification | null> {
    const docRef = doc(db, this.gamificationCollection, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await this.initializeUser(userId);
      return this.getUserGamification(userId);
    }
    
    const data = docSnap.data();
    return {
      ...data,
      updatedAt: data.updatedAt?.toDate()
    } as UserGamification;
  }

  // Get user achievements with unlock status
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const userData = await this.getUserGamification(userId);
    if (!userData) return [];
    
    const unlockedAchievements = userData.achievements || [];
    
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      isUnlocked: unlockedAchievements.includes(achievement.id),
      unlockedAt: undefined // TODO: Store unlock dates
    }));
  }

  // Update leaderboard
  async updateLeaderboard(userId: string, xp: number, level: number, levelName: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;
    
    const docRef = doc(db, this.leaderboardCollection, userId);
    
    await setDoc(docRef, {
      userId,
      name: user.displayName || 'Anonymous',
      photo: user.photoURL || '',
      xp,
      level,
      levelName,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }

  // Get global leaderboard
  async getGlobalLeaderboard(limitCount: number = 100): Promise<LeaderboardEntry[]> {
    const q = query(
      collection(db, this.leaderboardCollection),
      orderBy('xp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      entries.push({
        userId: data.userId,
        name: data.name,
        photo: data.photo,
        xp: data.xp,
        level: data.level,
        levelName: data.levelName,
        rank: index + 1
      });
    });
    
    return entries;
  }

  // Get friends leaderboard
  async getFriendsLeaderboard(friendIds: string[]): Promise<LeaderboardEntry[]> {
    if (friendIds.length === 0) return [];
    
    // Firestore 'in' query supports max 10 items, so batch if needed
    const batches = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      batches.push(friendIds.slice(i, i + 10));
    }
    
    const allEntries: any[] = [];
    
    for (const batch of batches) {
      const q = query(
        collection(db, this.leaderboardCollection),
        where('userId', 'in', batch)
      );
      
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        allEntries.push(doc.data());
      });
    }
    
    // Sort by XP and add ranks
    allEntries.sort((a, b) => b.xp - a.xp);
    
    return allEntries.map((data, index) => ({
      userId: data.userId,
      name: data.name,
      photo: data.photo,
      xp: data.xp,
      level: data.level,
      levelName: data.levelName,
      rank: index + 1
    }));
  }

  // Increment stat and check achievements
  async incrementStat(userId: string, statName: string, amount: number = 1): Promise<void> {
    const docRef = doc(db, this.gamificationCollection, userId);
    
    await updateDoc(docRef, {
      [statName]: increment(amount),
      updatedAt: Timestamp.now()
    });
    
    // Check related achievements
    const userData = await this.getUserGamification(userId);
    if (!userData) return;
    
    const statValue = (userData as any)[statName] || 0;
    
    // Check problem-solving achievements
    if (statName === 'totalProblemsSolved') {
      if (statValue >= 10) await this.unlockAchievement(userId, ACHIEVEMENTS.PROBLEMS_10.id);
      if (statValue >= 50) await this.unlockAchievement(userId, ACHIEVEMENTS.PROBLEMS_50.id);
      if (statValue >= 100) await this.unlockAchievement(userId, ACHIEVEMENTS.PROBLEMS_100.id);
    }
    
    // Check interview achievements
    if (statName === 'totalMockInterviews' && statValue >= 10) {
      await this.unlockAchievement(userId, ACHIEVEMENTS.INTERVIEWS_10.id);
    }
    
    // Check certification achievements
    if (statName === 'totalCertifications') {
      if (statValue >= 1) await this.unlockAchievement(userId, ACHIEVEMENTS.FIRST_CERT.id);
      if (statValue >= 5) await this.unlockAchievement(userId, ACHIEVEMENTS.CERTS_5.id);
    }
  }
}

export const gamificationService = new GamificationService();
