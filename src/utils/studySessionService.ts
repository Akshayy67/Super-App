import { realTimeAuth } from './realTimeAuth';

export interface StudySession {
  id: string;
  title: string;
  description: string;
  subject: string;
  hostId: string;
  teamId?: string;
  participants: string[];
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  type: 'individual' | 'group' | 'pomodoro' | 'meeting';
  settings: {
    isPublic: boolean;
    maxParticipants: number;
    allowLateJoin: boolean;
    requireApproval: boolean;
    sendReminders: boolean;
  };
  pomodoroConfig?: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
  meetingId?: string;
  goals: string[];
  materials: StudyMaterial[];
  progress: StudyProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyMaterial {
  id: string;
  name: string;
  type: 'document' | 'video' | 'link' | 'note';
  url?: string;
  content?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface StudyProgress {
  totalTimeSpent: number; // in minutes
  goalsCompleted: number;
  materialsReviewed: number;
  pomodoroSessionsCompleted: number;
  participantProgress: { [participantId: string]: ParticipantProgress };
}

export interface ParticipantProgress {
  joinTime?: Date;
  leaveTime?: Date;
  timeSpent: number; // in minutes
  goalsCompleted: string[];
  materialsReviewed: string[];
  pomodoroSessions: number;
  focusScore: number; // 0-100
  participationScore: number; // 0-100
}

export interface StudySessionStats {
  totalSessions: number;
  totalStudyTime: number; // in minutes
  averageSessionLength: number; // in minutes
  completionRate: number; // percentage
  favoriteSubjects: { subject: string; count: number }[];
  weeklyProgress: { week: string; sessions: number; time: number }[];
  productivityTrends: { date: string; focusScore: number; sessions: number }[];
  streakDays: number;
  longestSession: number; // in minutes
  mostProductiveTime: string; // hour of day
}

export interface SessionReminder {
  id: string;
  sessionId: string;
  type: 'start' | 'preparation' | 'followup';
  scheduledTime: Date;
  sent: boolean;
  message: string;
}

export type SessionEventType = 
  | 'sessionCreated'
  | 'sessionStarted'
  | 'sessionEnded'
  | 'participantJoined'
  | 'participantLeft'
  | 'goalCompleted'
  | 'materialAdded'
  | 'progressUpdated';

export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  participantId?: string;
  data?: any;
  timestamp: Date;
}

export type SessionEventListener = (event: SessionEvent) => void;

class StudySessionService {
  private sessions: Map<string, StudySession> = new Map();
  private listeners: SessionEventListener[] = [];
  private reminders: Map<string, SessionReminder> = new Map();
  private activeSessionId: string | null = null;

  constructor() {
    this.loadSessions();
    this.initializeReminderSystem();
  }

  // Event system
  addEventListener(listener: SessionEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private emit(event: SessionEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  // Session management
  async createSession(sessionData: {
    title: string;
    description: string;
    subject: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    type: StudySession['type'];
    teamId?: string;
    settings?: Partial<StudySession['settings']>;
    pomodoroConfig?: StudySession['pomodoroConfig'];
    goals?: string[];
  }): Promise<StudySession> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: StudySession = {
      id: sessionId,
      title: sessionData.title,
      description: sessionData.description,
      subject: sessionData.subject,
      hostId: user.id,
      teamId: sessionData.teamId,
      participants: [user.id],
      scheduledStart: sessionData.scheduledStart,
      scheduledEnd: sessionData.scheduledEnd,
      status: 'scheduled',
      type: sessionData.type,
      settings: {
        isPublic: false,
        maxParticipants: 10,
        allowLateJoin: true,
        requireApproval: false,
        sendReminders: true,
        ...sessionData.settings,
      },
      pomodoroConfig: sessionData.pomodoroConfig,
      goals: sessionData.goals || [],
      materials: [],
      progress: {
        totalTimeSpent: 0,
        goalsCompleted: 0,
        materialsReviewed: 0,
        pomodoroSessionsCompleted: 0,
        participantProgress: {
          [user.id]: {
            timeSpent: 0,
            goalsCompleted: [],
            materialsReviewed: [],
            pomodoroSessions: 0,
            focusScore: 0,
            participationScore: 0,
          },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.saveSessions();

    // Schedule reminders
    if (session.settings.sendReminders) {
      this.scheduleReminders(session);
    }

    this.emit({
      type: 'sessionCreated',
      sessionId,
      timestamp: new Date(),
    });

    return session;
  }

  async joinSession(sessionId: string): Promise<StudySession> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new Error('Session has ended');
    }

    if (!session.settings.allowLateJoin && session.status === 'active') {
      throw new Error('Late joining is not allowed for this session');
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    if (!session.participants.includes(user.id)) {
      session.participants.push(user.id);
      session.progress.participantProgress[user.id] = {
        joinTime: new Date(),
        timeSpent: 0,
        goalsCompleted: [],
        materialsReviewed: [],
        pomodoroSessions: 0,
        focusScore: 0,
        participationScore: 0,
      };

      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);
      this.saveSessions();

      this.emit({
        type: 'participantJoined',
        sessionId,
        participantId: user.id,
        timestamp: new Date(),
      });
    }

    return session;
  }

  async startSession(sessionId: string): Promise<StudySession> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.hostId !== user.id) {
      throw new Error('Only the host can start the session');
    }

    if (session.status !== 'scheduled') {
      throw new Error('Session cannot be started');
    }

    session.status = 'active';
    session.actualStart = new Date();
    session.updatedAt = new Date();
    this.activeSessionId = sessionId;

    this.sessions.set(sessionId, session);
    this.saveSessions();

    this.emit({
      type: 'sessionStarted',
      sessionId,
      timestamp: new Date(),
    });

    return session;
  }

  async endSession(sessionId: string): Promise<StudySession> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.hostId !== user.id) {
      throw new Error('Only the host can end the session');
    }

    session.status = 'completed';
    session.actualEnd = new Date();
    session.updatedAt = new Date();

    // Calculate final progress
    this.calculateFinalProgress(session);

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    this.sessions.set(sessionId, session);
    this.saveSessions();

    this.emit({
      type: 'sessionEnded',
      sessionId,
      timestamp: new Date(),
    });

    return session;
  }

  async leaveSession(sessionId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participantIndex = session.participants.indexOf(user.id);
    if (participantIndex > -1) {
      session.participants.splice(participantIndex, 1);
      
      // Update participant progress
      const progress = session.progress.participantProgress[user.id];
      if (progress && progress.joinTime) {
        progress.leaveTime = new Date();
        progress.timeSpent = Math.round(
          (progress.leaveTime.getTime() - progress.joinTime.getTime()) / (1000 * 60)
        );
      }

      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);
      this.saveSessions();

      this.emit({
        type: 'participantLeft',
        sessionId,
        participantId: user.id,
        timestamp: new Date(),
      });
    }
  }

  // Progress tracking
  async updateProgress(sessionId: string, updates: {
    goalCompleted?: string;
    materialReviewed?: string;
    pomodoroSessionCompleted?: boolean;
    focusScore?: number;
  }): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participantProgress = session.progress.participantProgress[user.id];
    if (!participantProgress) return;

    if (updates.goalCompleted && !participantProgress.goalsCompleted.includes(updates.goalCompleted)) {
      participantProgress.goalsCompleted.push(updates.goalCompleted);
      session.progress.goalsCompleted++;
      
      this.emit({
        type: 'goalCompleted',
        sessionId,
        participantId: user.id,
        data: { goal: updates.goalCompleted },
        timestamp: new Date(),
      });
    }

    if (updates.materialReviewed && !participantProgress.materialsReviewed.includes(updates.materialReviewed)) {
      participantProgress.materialsReviewed.push(updates.materialReviewed);
      session.progress.materialsReviewed++;
    }

    if (updates.pomodoroSessionCompleted) {
      participantProgress.pomodoroSessions++;
      session.progress.pomodoroSessionsCompleted++;
    }

    if (updates.focusScore !== undefined) {
      participantProgress.focusScore = updates.focusScore;
    }

    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    this.saveSessions();

    this.emit({
      type: 'progressUpdated',
      sessionId,
      participantId: user.id,
      data: updates,
      timestamp: new Date(),
    });
  }

  // Materials management
  async addMaterial(sessionId: string, material: Omit<StudyMaterial, 'id' | 'uploadedBy' | 'uploadedAt'>): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const materialId = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMaterial: StudyMaterial = {
      ...material,
      id: materialId,
      uploadedBy: user.id,
      uploadedAt: new Date(),
    };

    session.materials.push(newMaterial);
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    this.saveSessions();

    this.emit({
      type: 'materialAdded',
      sessionId,
      participantId: user.id,
      data: { material: newMaterial },
      timestamp: new Date(),
    });

    return materialId;
  }

  // Statistics and analytics
  getSessionStats(): StudySessionStats {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      return this.getEmptyStats();
    }

    const userSessions = Array.from(this.sessions.values()).filter(
      session => session.participants.includes(user.id)
    );

    const totalSessions = userSessions.length;
    const completedSessions = userSessions.filter(s => s.status === 'completed');
    
    const totalStudyTime = completedSessions.reduce((total, session) => {
      const progress = session.progress.participantProgress[user.id];
      return total + (progress?.timeSpent || 0);
    }, 0);

    const averageSessionLength = completedSessions.length > 0 
      ? totalStudyTime / completedSessions.length 
      : 0;

    const completionRate = totalSessions > 0 
      ? (completedSessions.length / totalSessions) * 100 
      : 0;

    // Calculate favorite subjects
    const subjectCounts = new Map<string, number>();
    userSessions.forEach(session => {
      const count = subjectCounts.get(session.subject) || 0;
      subjectCounts.set(session.subject, count + 1);
    });

    const favoriteSubjects = Array.from(subjectCounts.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate streak
    const streakDays = this.calculateStreakDays(completedSessions);

    // Find longest session
    const longestSession = Math.max(
      ...completedSessions.map(session => {
        const progress = session.progress.participantProgress[user.id];
        return progress?.timeSpent || 0;
      }),
      0
    );

    return {
      totalSessions,
      totalStudyTime,
      averageSessionLength,
      completionRate,
      favoriteSubjects,
      weeklyProgress: [], // TODO: Implement weekly progress calculation
      productivityTrends: [], // TODO: Implement productivity trends
      streakDays,
      longestSession,
      mostProductiveTime: '10:00', // TODO: Calculate most productive time
    };
  }

  private getEmptyStats(): StudySessionStats {
    return {
      totalSessions: 0,
      totalStudyTime: 0,
      averageSessionLength: 0,
      completionRate: 0,
      favoriteSubjects: [],
      weeklyProgress: [],
      productivityTrends: [],
      streakDays: 0,
      longestSession: 0,
      mostProductiveTime: '10:00',
    };
  }

  private calculateStreakDays(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDates = sessions
      .filter(session => session.actualEnd)
      .map(session => {
        const date = new Date(session.actualEnd!);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a); // Sort descending

    let streak = 0;
    let currentDate = today.getTime();

    for (const sessionDate of sessionDates) {
      if (sessionDate === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000; // Go back one day
      } else if (sessionDate < currentDate) {
        break; // Gap in streak
      }
    }

    return streak;
  }

  private calculateFinalProgress(session: StudySession): void {
    const totalParticipants = session.participants.length;
    let totalTimeSpent = 0;

    session.participants.forEach(participantId => {
      const progress = session.progress.participantProgress[participantId];
      if (progress) {
        totalTimeSpent += progress.timeSpent;
        
        // Calculate participation score based on goals completed and time spent
        const goalCompletionRate = session.goals.length > 0 
          ? (progress.goalsCompleted.length / session.goals.length) * 100 
          : 100;
        
        const expectedTime = session.actualEnd && session.actualStart
          ? (session.actualEnd.getTime() - session.actualStart.getTime()) / (1000 * 60)
          : 0;
        
        const timeParticipationRate = expectedTime > 0 
          ? Math.min((progress.timeSpent / expectedTime) * 100, 100)
          : 0;

        progress.participationScore = Math.round((goalCompletionRate + timeParticipationRate) / 2);
      }
    });

    session.progress.totalTimeSpent = totalTimeSpent;
  }

  // Reminder system
  private scheduleReminders(session: StudySession): void {
    const now = new Date();
    
    // Preparation reminder (15 minutes before)
    const prepTime = new Date(session.scheduledStart.getTime() - 15 * 60 * 1000);
    if (prepTime > now) {
      const prepReminder: SessionReminder = {
        id: `prep_${session.id}`,
        sessionId: session.id,
        type: 'preparation',
        scheduledTime: prepTime,
        sent: false,
        message: `Your study session "${session.title}" starts in 15 minutes. Get ready!`,
      };
      this.reminders.set(prepReminder.id, prepReminder);
    }

    // Start reminder
    if (session.scheduledStart > now) {
      const startReminder: SessionReminder = {
        id: `start_${session.id}`,
        sessionId: session.id,
        type: 'start',
        scheduledTime: session.scheduledStart,
        sent: false,
        message: `Your study session "${session.title}" is starting now!`,
      };
      this.reminders.set(startReminder.id, startReminder);
    }
  }

  private initializeReminderSystem(): void {
    // Check for due reminders every minute
    setInterval(() => {
      this.checkReminders();
    }, 60000);
  }

  private checkReminders(): void {
    const now = new Date();
    
    this.reminders.forEach(reminder => {
      if (!reminder.sent && reminder.scheduledTime <= now) {
        this.sendReminder(reminder);
        reminder.sent = true;
      }
    });
  }

  private sendReminder(reminder: SessionReminder): void {
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Study Session Reminder', {
        body: reminder.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
    }
  }

  // Getters
  getSession(sessionId: string): StudySession | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSessions(): StudySession[] {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return [];

    return Array.from(this.sessions.values()).filter(
      session => session.participants.includes(user.id)
    );
  }

  getActiveSession(): StudySession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) || null;
  }

  getUpcomingSessions(): StudySession[] {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return [];

    const now = new Date();
    return Array.from(this.sessions.values())
      .filter(session => 
        session.participants.includes(user.id) &&
        session.status === 'scheduled' &&
        session.scheduledStart > now
      )
      .sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());
  }

  // Persistence
  private loadSessions(): void {
    const saved = localStorage.getItem('studySessions');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([id, sessionData]: [string, any]) => {
          // Convert date strings back to Date objects
          const session: StudySession = {
            ...sessionData,
            scheduledStart: new Date(sessionData.scheduledStart),
            scheduledEnd: new Date(sessionData.scheduledEnd),
            actualStart: sessionData.actualStart ? new Date(sessionData.actualStart) : undefined,
            actualEnd: sessionData.actualEnd ? new Date(sessionData.actualEnd) : undefined,
            createdAt: new Date(sessionData.createdAt),
            updatedAt: new Date(sessionData.updatedAt),
          };
          this.sessions.set(id, session);
        });
      } catch (error) {
        console.error('Failed to load study sessions:', error);
      }
    }
  }

  private saveSessions(): void {
    const data = Object.fromEntries(this.sessions);
    localStorage.setItem('studySessions', JSON.stringify(data));
  }

  // Cleanup
  destroy(): void {
    this.sessions.clear();
    this.listeners = [];
    this.reminders.clear();
  }
}

export const studySessionService = new StudySessionService();
