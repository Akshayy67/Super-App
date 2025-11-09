// AI-Powered Predictive Learning Path Engine (APLPE)
// Core service for predicting student outcomes and adapting learning paths

import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

// ==================== TYPES ====================

export interface StudentProfile {
  userId: string;
  name: string;
  email: string;
  enrollmentDate: Date;
  major?: string;
  year?: number;
  gpa?: number;
  demographics?: {
    age?: number;
    international?: boolean;
    firstGen?: boolean;
  };
}

export interface LearningActivity {
  timestamp: Date;
  type: 'contest' | 'study-session' | 'video-watch' | 'quiz' | 'assignment' | 'peer-help';
  duration: number; // minutes
  performance?: number; // 0-100
  topicId?: string;
  completed: boolean;
}

export interface KnowledgeNode {
  topicId: string;
  topicName: string;
  category: string;
  mastery: number; // 0-100
  confidence: number; // 0-100, how confident we are in mastery score
  lastTested: Date;
  timesAttempted: number;
  timeSpent: number; // minutes
  prerequisitesMet: boolean;
  prerequisites: string[]; // topicIds
  nextTopics: string[]; // recommended next topics
  weaknessIndicators: string[];
  strengthIndicators: string[];
}

export interface RiskPrediction {
  userId: string;
  timestamp: Date;
  predictions: {
    dropoutRisk: PredictionScore;
    failureRisk: PredictionScore;
    burnoutRisk: PredictionScore;
    disengagementRisk: PredictionScore;
  };
  overallRiskScore: number; // 0-100, higher = more at risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: RiskFactor[];
  protectiveFactors: ProtectiveFactor[];
  recommendedInterventions: Intervention[];
  confidence: number; // model confidence 0-1
}

export interface PredictionScore {
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  changeFromLastWeek: number;
  likelihood: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
}

export interface RiskFactor {
  factor: string;
  category: 'academic' | 'behavioral' | 'social' | 'wellness';
  severity: 'low' | 'medium' | 'high';
  weight: number; // contribution to overall risk
  description: string;
  detected: Date;
  trend: 'improving' | 'worsening' | 'stable';
}

export interface ProtectiveFactor {
  factor: string;
  strength: 'low' | 'medium' | 'high';
  description: string;
}

export interface Intervention {
  type: 'automated' | 'advisor-recommended' | 'peer-support' | 'resource';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  resources?: Resource[];
  autoTrigger?: boolean;
}

export interface Resource {
  title: string;
  type: 'video' | 'article' | 'tutor' | 'study-group' | 'counselor' | 'workshop';
  url?: string;
  contactInfo?: string;
}

export interface AdaptiveLearningPath {
  userId: string;
  generated: Date;
  currentLevel: number; // 0-100
  targetLevel: number;
  estimatedTimeToTarget: number; // hours
  pathNodes: PathNode[];
  difficulty: 'easier' | 'same' | 'harder';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  nextMilestone: Milestone;
}

export interface PathNode {
  order: number;
  topic: string;
  topicId: string;
  currentMastery: number;
  targetMastery: number;
  recommendedActivities: RecommendedActivity[];
  estimatedTime: number; // minutes
  prerequisites: string[];
  unlocks: string[];
}

export interface RecommendedActivity {
  activityType: 'video' | 'contest' | 'practice' | 'reading' | 'peer-learning' | 'project';
  title: string;
  description: string;
  difficulty: number; // 1-10
  estimatedTime: number; // minutes
  expectedMasteryGain: number; // 0-20 points
  url?: string;
  contentId?: string;
}

export interface Milestone {
  title: string;
  description: string;
  targetDate: Date;
  progress: number; // 0-100
  requirements: string[];
  reward?: string;
}

export interface PerformanceMetrics {
  userId: string;
  period: 'week' | 'month' | 'semester' | 'year';
  metrics: {
    averageScore: number;
    consistency: number; // 0-100
    engagementLevel: number; // 0-100
    studyTime: number; // hours
    contestsCompleted: number;
    peerInteractions: number;
    helpSeeking: number;
    improvementRate: number; // % improvement
  };
  trends: {
    scoresTrend: 'up' | 'down' | 'stable';
    engagementTrend: 'up' | 'down' | 'stable';
    studyTimeTrend: 'up' | 'down' | 'stable';
  };
  comparisonToPeers: {
    percentile: number;
    averagePeerScore: number;
    standingInClass: number;
  };
}

// ==================== SERVICE CLASS ====================

class PredictiveLearningEngine {
  private readonly COLLECTIONS = {
    STUDENTS: 'users',
    ACTIVITIES: 'learningActivities',
    PREDICTIONS: 'riskPredictions',
    KNOWLEDGE_GRAPHS: 'knowledgeGraphs',
    LEARNING_PATHS: 'adaptivePaths',
    INTERVENTIONS: 'interventionHistory',
    CONTEST_RESULTS: 'contestResults',
  };

  // ==================== RISK PREDICTION ====================

  async predictStudentRisk(userId: string): Promise<RiskPrediction> {
    console.log(`🤖 Generating risk prediction for user: ${userId}`);

    // Gather all student data
    const profile = await this.getStudentProfile(userId);
    const activities = await this.getRecentActivities(userId, 90); // last 90 days
    const performance = await this.getPerformanceMetrics(userId, 'month');
    const historicalPredictions = await this.getHistoricalPredictions(userId, 4); // last 4 predictions

    // Extract features for ML model
    const features = this.extractPredictiveFeatures(profile, activities, performance);

    // Run predictions (in production, call actual ML models)
    const dropoutRisk = this.predictDropout(features);
    const failureRisk = this.predictFailure(features);
    const burnoutRisk = this.predictBurnout(features, activities);
    const disengagementRisk = this.predictDisengagement(features, activities);

    // Calculate overall risk score (weighted average)
    const overallRiskScore = Math.round(
      dropoutRisk.score * 0.35 +
      failureRisk.score * 0.30 +
      burnoutRisk.score * 0.20 +
      disengagementRisk.score * 0.15
    );

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(overallRiskScore);

    // Identify contributing factors
    const contributingFactors = this.identifyRiskFactors(features, activities, performance);
    const protectiveFactors = this.identifyProtectiveFactors(features, activities, performance);

    // Generate interventions
    const recommendedInterventions = await this.generateInterventions(
      userId,
      overallRiskScore,
      contributingFactors,
      dropoutRisk,
      failureRisk,
      burnoutRisk
    );

    const prediction: RiskPrediction = {
      userId,
      timestamp: new Date(),
      predictions: {
        dropoutRisk,
        failureRisk,
        burnoutRisk,
        disengagementRisk,
      },
      overallRiskScore,
      riskLevel,
      contributingFactors,
      protectiveFactors,
      recommendedInterventions,
      confidence: 0.82, // Model confidence (in production, from ML model)
    };

    // Save prediction to database
    await this.savePrediction(prediction);

    // Trigger automated interventions if critical
    if (riskLevel === 'critical' || riskLevel === 'high') {
      await this.triggerAutomatedInterventions(prediction);
    }

    return prediction;
  }

  private predictDropout(features: any): PredictionScore {
    // Simplified dropout prediction (in production, use trained ML model)
    let score = 0;

    // Academic factors (40% weight)
    if (features.gpa < 2.5) score += 20;
    if (features.failedCourses > 0) score += 15;
    if (features.withdrawnCourses > 1) score += 10;

    // Engagement factors (30% weight)
    if (features.attendanceRate < 0.7) score += 15;
    if (features.assignmentsCompletionRate < 0.6) score += 10;
    if (features.daysInactive > 14) score += 10;

    // Behavioral factors (20% weight)
    if (features.studyTimeDecline > 0.4) score += 10;
    if (features.peerInteractionDecline > 0.5) score += 8;
    if (features.helpSeekingFrequency < 2) score += 5;

    // Demographic factors (10% weight)
    if (features.firstGeneration) score += 5;
    if (features.international) score += 3;
    if (features.workingFullTime) score += 4;

    score = Math.min(100, Math.max(0, score));

    // Determine trend from historical data
    const trend = features.scoreImprovement > 0 ? 'improving' : 
                  features.scoreImprovement < -5 ? 'declining' : 'stable';

    return {
      score,
      trend,
      changeFromLastWeek: features.scoreImprovement || 0,
      likelihood: this.scoresToLikelihood(score),
    };
  }

  private predictFailure(features: any): PredictionScore {
    let score = 0;

    // Current performance (50% weight)
    if (features.currentGPA < 2.0) score += 30;
    else if (features.currentGPA < 2.5) score += 20;
    else if (features.currentGPA < 3.0) score += 10;

    if (features.averageTestScore < 60) score += 20;
    else if (features.averageTestScore < 70) score += 10;

    // Study patterns (30% weight)
    if (features.studyTimePerWeek < 10) score += 15;
    if (features.lastMinuteCramming > 0.6) score += 10;
    if (features.consistencyScore < 40) score += 8;

    // Help-seeking behavior (20% weight)
    if (features.questionsAsked < 2) score += 10;
    if (features.officeHoursAttendance === 0) score += 7;
    if (features.studyGroupParticipation === 0) score += 5;

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      trend: features.gradesTrend || 'stable',
      changeFromLastWeek: features.recentPerformanceChange || 0,
      likelihood: this.scoresToLikelihood(score),
    };
  }

  private predictBurnout(features: any, activities: LearningActivity[]): PredictionScore {
    let score = 0;

    // Study time patterns (40% weight)
    const recentActivities = activities.slice(0, 14); // last 2 weeks
    const avgDailyStudyTime = this.calculateAvgDailyStudyTime(recentActivities);
    
    if (avgDailyStudyTime > 8) score += 20; // studying too much
    if (avgDailyStudyTime < 2) score += 15; // studying too little (avoidance)

    const lateNightSessions = recentActivities.filter(a => {
      const hour = a.timestamp.getHours();
      return hour >= 23 || hour <= 5;
    }).length;
    
    if (lateNightSessions > 7) score += 15;

    // Engagement decline (30% weight)
    if (features.engagementDecline > 0.3) score += 15;
    if (features.motivationScore < 40) score += 10;
    if (features.completionRateDecline > 0.25) score += 8;

    // Social isolation (20% weight)
    if (features.peerInteractions < 5) score += 10;
    if (features.daysWithoutSocialActivity > 7) score += 7;
    if (features.studyGroupParticipation === 0) score += 5;

    // Self-reported indicators (10% weight)
    if (features.stressLevel > 7) score += 8;
    if (features.sleepQuality < 4) score += 5;

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      trend: features.burnoutTrend || 'stable',
      changeFromLastWeek: features.burnoutChange || 0,
      likelihood: this.scoresToLikelihood(score),
    };
  }

  private predictDisengagement(features: any, activities: LearningActivity[]): PredictionScore {
    let score = 0;

    const recentActivities = activities.slice(0, 30); // last 30 days

    // Activity frequency (40% weight)
    const activitiesPerWeek = (recentActivities.length / 30) * 7;
    if (activitiesPerWeek < 3) score += 25;
    else if (activitiesPerWeek < 7) score += 15;

    // Login frequency (30% weight)
    if (features.daysSinceLastLogin > 7) score += 20;
    else if (features.daysSinceLastLogin > 3) score += 10;

    const avgSessionDuration = recentActivities.reduce((sum, a) => sum + a.duration, 0) / recentActivities.length;
    if (avgSessionDuration < 15) score += 10;

    // Completion rates (20% weight)
    const completionRate = recentActivities.filter(a => a.completed).length / recentActivities.length;
    if (completionRate < 0.5) score += 12;
    else if (completionRate < 0.7) score += 8;

    // Interaction decline (10% weight)
    if (features.contestParticipationDecline > 0.5) score += 6;
    if (features.forumActivityDecline > 0.5) score += 5;

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      trend: features.engagementTrend || 'stable',
      changeFromLastWeek: features.activityChange || 0,
      likelihood: this.scoresToLikelihood(score),
    };
  }

  private identifyRiskFactors(
    features: any,
    activities: LearningActivity[],
    performance: PerformanceMetrics
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Academic risk factors
    if (features.gpa < 2.5) {
      factors.push({
        factor: 'Low GPA',
        category: 'academic',
        severity: features.gpa < 2.0 ? 'high' : 'medium',
        weight: 0.25,
        description: `Current GPA of ${features.gpa.toFixed(2)} is below threshold`,
        detected: new Date(),
        trend: features.gradesTrend || 'stable',
      });
    }

    if (performance.metrics.averageScore < 60) {
      factors.push({
        factor: 'Poor Test Performance',
        category: 'academic',
        severity: 'high',
        weight: 0.20,
        description: `Average test score of ${performance.metrics.averageScore}% indicates struggling`,
        detected: new Date(),
        trend: performance.trends.scoresTrend,
      });
    }

    // Behavioral risk factors
    if (features.studyTimeDecline > 0.3) {
      factors.push({
        factor: 'Declining Study Time',
        category: 'behavioral',
        severity: features.studyTimeDecline > 0.5 ? 'high' : 'medium',
        weight: 0.15,
        description: `Study time decreased by ${(features.studyTimeDecline * 100).toFixed(0)}%`,
        detected: new Date(),
        trend: 'worsening',
      });
    }

    const recentActivities = activities.slice(0, 14);
    const avgDailyStudyTime = this.calculateAvgDailyStudyTime(recentActivities);
    if (avgDailyStudyTime < 2) {
      factors.push({
        factor: 'Low Study Time',
        category: 'behavioral',
        severity: 'medium',
        weight: 0.12,
        description: `Studying only ${avgDailyStudyTime.toFixed(1)} hours per day`,
        detected: new Date(),
        trend: 'stable',
      });
    }

    // Social risk factors
    if (performance.metrics.peerInteractions < 5) {
      factors.push({
        factor: 'Social Isolation',
        category: 'social',
        severity: 'medium',
        weight: 0.10,
        description: `Limited peer interactions (${performance.metrics.peerInteractions} per week)`,
        detected: new Date(),
        trend: 'stable',
      });
    }

    // Wellness risk factors
    const lateNightSessions = recentActivities.filter(a => {
      const hour = a.timestamp.getHours();
      return hour >= 23 || hour <= 5;
    }).length;

    if (lateNightSessions > 7) {
      factors.push({
        factor: 'Poor Sleep Patterns',
        category: 'wellness',
        severity: 'medium',
        weight: 0.08,
        description: `${lateNightSessions} late-night study sessions in 2 weeks`,
        detected: new Date(),
        trend: 'worsening',
      });
    }

    if (features.daysInactive > 7) {
      factors.push({
        factor: 'Prolonged Inactivity',
        category: 'behavioral',
        severity: 'high',
        weight: 0.18,
        description: `No activity for ${features.daysInactive} days`,
        detected: new Date(),
        trend: 'worsening',
      });
    }

    // Sort by weight (most impactful first)
    factors.sort((a, b) => b.weight - a.weight);

    return factors;
  }

  private identifyProtectiveFactors(
    features: any,
    activities: LearningActivity[],
    performance: PerformanceMetrics
  ): ProtectiveFactor[] {
    const factors: ProtectiveFactor[] = [];

    if (performance.metrics.averageScore >= 80) {
      factors.push({
        factor: 'Strong Academic Performance',
        strength: 'high',
        description: `Maintaining ${performance.metrics.averageScore}% average`,
      });
    }

    if (performance.metrics.consistency >= 70) {
      factors.push({
        factor: 'Consistent Study Habits',
        strength: 'high',
        description: 'Regular and predictable study patterns',
      });
    }

    if (performance.metrics.peerInteractions >= 10) {
      factors.push({
        factor: 'Active Social Network',
        strength: 'medium',
        description: `Regular peer interactions (${performance.metrics.peerInteractions}/week)`,
      });
    }

    if (performance.metrics.helpSeeking >= 3) {
      factors.push({
        factor: 'Proactive Help-Seeking',
        strength: 'medium',
        description: 'Regularly asks questions and seeks assistance',
      });
    }

    if (features.studyGroupParticipation > 0) {
      factors.push({
        factor: 'Study Group Participation',
        strength: 'medium',
        description: 'Engaged in collaborative learning',
      });
    }

    return factors;
  }

  private async generateInterventions(
    userId: string,
    riskScore: number,
    factors: RiskFactor[],
    dropoutRisk: PredictionScore,
    failureRisk: PredictionScore,
    burnoutRisk: PredictionScore
  ): Promise<Intervention[]> {
    const interventions: Intervention[] = [];

    // Critical interventions for high-risk students
    if (riskScore >= 70) {
      interventions.push({
        type: 'advisor-recommended',
        priority: 'immediate',
        title: 'Schedule meeting with academic advisor',
        description: 'Your academic advisor can provide personalized support and resources',
        actions: [
          'Book an appointment through the student portal',
          'Prepare questions about your challenges',
          'Discuss course load and academic plan',
        ],
        estimatedImpact: 'high',
        resources: [
          {
            title: 'Schedule Advisor Meeting',
            type: 'counselor',
            url: '/advisor/schedule',
          },
        ],
        autoTrigger: true,
      });
    }

    // Academic support interventions
    if (failureRisk.score >= 60) {
      const weakTopics = factors
        .filter(f => f.category === 'academic')
        .map(f => f.factor);

      interventions.push({
        type: 'resource',
        priority: riskScore >= 70 ? 'high' : 'medium',
        title: 'Join tutoring sessions for struggling topics',
        description: `Get help with: ${weakTopics.join(', ')}`,
        actions: [
          'Identify your weakest topics',
          'Find a peer tutor or join study group',
          'Practice with targeted exercises',
          'Schedule regular tutoring sessions',
        ],
        estimatedImpact: 'high',
        resources: [
          {
            title: 'Find a Tutor',
            type: 'tutor',
            url: '/marketplace/tutors',
          },
          {
            title: 'Join Study Groups',
            type: 'study-group',
            url: '/study-rooms',
          },
        ],
      });
    }

    // Burnout prevention
    if (burnoutRisk.score >= 60) {
      interventions.push({
        type: 'automated',
        priority: burnoutRisk.score >= 80 ? 'immediate' : 'high',
        title: 'Take a break and practice self-care',
        description: 'Signs of burnout detected. Your wellbeing is important!',
        actions: [
          'Schedule breaks every 90 minutes',
          'Get 7-8 hours of sleep',
          'Practice relaxation techniques',
          'Consider reducing course load if needed',
        ],
        estimatedImpact: 'high',
        resources: [
          {
            title: 'Mental Health Resources',
            type: 'counselor',
            url: '/wellness/mental-health',
          },
          {
            title: 'Guided Meditation',
            type: 'video',
            url: '/wellness/meditation',
          },
        ],
        autoTrigger: burnoutRisk.score >= 75,
      });
    }

    // Engagement interventions
    if (riskScore >= 50 && factors.some(f => f.category === 'behavioral')) {
      interventions.push({
        type: 'peer-support',
        priority: 'medium',
        title: 'Join a study buddy program',
        description: 'Connect with peers for mutual support and accountability',
        actions: [
          'Find study partners with similar goals',
          'Schedule regular study sessions',
          'Join collaborative learning activities',
          'Participate in study challenges',
        ],
        estimatedImpact: 'medium',
        resources: [
          {
            title: 'Find Study Buddies',
            type: 'study-group',
            url: '/friends/find-study-buddy',
          },
        ],
      });
    }

    // Study skills improvement
    if (factors.some(f => f.factor.includes('Study Time') || f.factor.includes('Consistency'))) {
      interventions.push({
        type: 'resource',
        priority: 'medium',
        title: 'Improve study habits and time management',
        description: 'Learn effective study techniques and time management strategies',
        actions: [
          'Try the Pomodoro technique (25-min focus blocks)',
          'Create a study schedule and stick to it',
          'Use active learning techniques',
          'Minimize distractions during study time',
        ],
        estimatedImpact: 'medium',
        resources: [
          {
            title: 'Study Skills Workshop',
            type: 'workshop',
            url: '/resources/study-skills',
          },
          {
            title: 'Time Management Guide',
            type: 'article',
            url: '/resources/time-management',
          },
        ],
      });
    }

    // Social connection
    if (factors.some(f => f.category === 'social')) {
      interventions.push({
        type: 'peer-support',
        priority: 'low',
        title: 'Increase social connections',
        description: 'Building relationships can improve motivation and success',
        actions: [
          'Join student organizations',
          'Participate in group projects',
          'Attend study groups',
          'Connect with classmates',
        ],
        estimatedImpact: 'medium',
        resources: [
          {
            title: 'Student Organizations',
            type: 'article',
            url: '/campus/organizations',
          },
        ],
      });
    }

    // Sort by priority
    const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
    interventions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return interventions.slice(0, 5); // Return top 5 interventions
  }

  private async triggerAutomatedInterventions(prediction: RiskPrediction): Promise<void> {
    console.log(`⚠️ Triggering automated interventions for user ${prediction.userId}`);

    const autoInterventions = prediction.recommendedInterventions.filter(i => i.autoTrigger);

    for (const intervention of autoInterventions) {
      try {
        // Send notification to student
        await this.sendStudentNotification(prediction.userId, {
          title: intervention.title,
          message: intervention.description,
          priority: intervention.priority,
          actionUrl: intervention.resources?.[0]?.url,
        });

        // Alert advisor if risk is critical
        if (prediction.riskLevel === 'critical') {
          await this.alertAdvisor(prediction.userId, prediction);
        }

        // Log intervention
        await addDoc(collection(db, this.COLLECTIONS.INTERVENTIONS), {
          userId: prediction.userId,
          predictionId: prediction.timestamp.toISOString(),
          intervention: intervention,
          triggered: Timestamp.now(),
          status: 'sent',
        });

      } catch (error) {
        console.error('Error triggering intervention:', error);
      }
    }
  }

  private async sendStudentNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      priority: string;
      actionUrl?: string;
    }
  ): Promise<void> {
    // In production, send via Firebase Cloud Messaging, email, or in-app notification
    console.log(`📧 Sending notification to ${userId}:`, notification);
    
    // Add to notifications collection
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...notification,
      timestamp: Timestamp.now(),
      read: false,
    });
  }

  private async alertAdvisor(userId: string, prediction: RiskPrediction): Promise<void> {
    console.log(`🚨 Alerting advisor about critical risk for user ${userId}`);
    
    // Get student's advisor
    const studentDoc = await getDoc(doc(db, this.COLLECTIONS.STUDENTS, userId));
    const advisorId = studentDoc.data()?.advisorId;

    if (!advisorId) {
      console.log('No advisor assigned');
      return;
    }

    // Send alert to advisor
    await addDoc(collection(db, 'advisorAlerts'), {
      advisorId,
      studentId: userId,
      riskLevel: prediction.riskLevel,
      overallRiskScore: prediction.overallRiskScore,
      topFactors: prediction.contributingFactors.slice(0, 3),
      recommendedActions: prediction.recommendedInterventions.slice(0, 2),
      timestamp: Timestamp.now(),
      acknowledged: false,
    });
  }

  // ==================== HELPER METHODS ====================

  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private scoresToLikelihood(score: number): 'very-low' | 'low' | 'moderate' | 'high' | 'very-high' {
    if (score >= 80) return 'very-high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'very-low';
  }

  private calculateAvgDailyStudyTime(activities: LearningActivity[]): number {
    if (activities.length === 0) return 0;
    
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const days = Math.max(1, this.getDateRange(activities));
    
    return (totalMinutes / 60) / days; // hours per day
  }

  private getDateRange(activities: LearningActivity[]): number {
    if (activities.length === 0) return 1;
    
    const dates = activities.map(a => a.timestamp.getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    
    return Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
  }

  private extractPredictiveFeatures(
    profile: StudentProfile,
    activities: LearningActivity[],
    performance: PerformanceMetrics
  ): any {
    // Extract and calculate features for ML models
    const recentActivities = activities.slice(0, 30);
    const olderActivities = activities.slice(30, 90);

    return {
      // Demographics
      firstGeneration: profile.demographics?.firstGen || false,
      international: profile.demographics?.international || false,
      year: profile.year || 1,
      
      // Academic
      gpa: profile.gpa || 0,
      currentGPA: profile.gpa || 0,
      averageScore: performance.metrics.averageScore,
      averageTestScore: performance.metrics.averageScore,
      
      // Engagement
      studyTimePerWeek: performance.metrics.studyTime / 4, // monthly to weekly
      contestsCompleted: performance.metrics.contestsCompleted,
      consistencyScore: performance.metrics.consistency,
      engagementLevel: performance.metrics.engagementLevel,
      
      // Activity patterns
      activitiesPerWeek: (recentActivities.length / 30) * 7,
      completionRate: recentActivities.filter(a => a.completed).length / Math.max(1, recentActivities.length),
      assignmentsCompletionRate: recentActivities.filter(a => a.type === 'assignment' && a.completed).length / 
                                  Math.max(1, recentActivities.filter(a => a.type === 'assignment').length),
      attendanceRate: 0.85, // Would come from actual attendance data
      
      // Trends
      studyTimeDecline: this.calculateDecline(recentActivities, olderActivities, 'duration'),
      engagementDecline: recentActivities.length < olderActivities.length ? 
                         (olderActivities.length - recentActivities.length) / olderActivities.length : 0,
      scoreImprovement: 0, // Would calculate from historical scores
      gradesTrend: performance.trends.scoresTrend,
      engagementTrend: performance.trends.engagementTrend,
      
      // Social
      peerInteractions: performance.metrics.peerInteractions,
      studyGroupParticipation: recentActivities.filter(a => a.type === 'peer-help').length,
      helpSeekingFrequency: performance.metrics.helpSeeking,
      
      // Behavioral
      daysInactive: this.calculateInactiveDays(activities),
      daysSinceLastLogin: this.calculateDaysSinceLastActivity(activities),
      lateNightStudyFrequency: this.calculateLateNightSessions(recentActivities),
      lastMinuteCramming: 0.3, // Would calculate from study patterns
      
      // Other
      failedCourses: 0,
      withdrawnCourses: 0,
      workingFullTime: false,
    };
  }

  private calculateDecline(recent: LearningActivity[], older: LearningActivity[], metric: keyof LearningActivity): number {
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, a) => sum + (a[metric] as number || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + (a[metric] as number || 0), 0) / older.length;
    
    if (olderAvg === 0) return 0;
    return (olderAvg - recentAvg) / olderAvg;
  }

  private calculateInactiveDays(activities: LearningActivity[]): number {
    if (activities.length === 0) return 999;
    
    const now = new Date();
    const lastActivity = activities[0].timestamp;
    return Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateDaysSinceLastActivity(activities: LearningActivity[]): number {
    return this.calculateInactiveDays(activities);
  }

  private calculateLateNightSessions(activities: LearningActivity[]): number {
    const lateNight = activities.filter(a => {
      const hour = a.timestamp.getHours();
      return hour >= 23 || hour <= 5;
    }).length;
    
    return lateNight / Math.max(1, activities.length);
  }

  // ==================== DATA FETCHING ====================

  private async getStudentProfile(userId: string): Promise<StudentProfile> {
    const docRef = doc(db, this.COLLECTIONS.STUDENTS, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Student profile not found: ${userId}`);
    }
    
    const data = docSnap.data();
    return {
      userId,
      name: data.displayName || data.name || 'Student',
      email: data.email || '',
      enrollmentDate: data.createdAt?.toDate() || new Date(),
      major: data.major,
      year: data.year,
      gpa: data.gpa,
      demographics: data.demographics,
    };
  }

  private async getRecentActivities(userId: string, days: number): Promise<LearningActivity[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Collect activities from multiple sources
    const activities: LearningActivity[] = [];

    // Contest results
    const contestsQuery = query(
      collection(db, this.COLLECTIONS.CONTEST_RESULTS),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('timestamp', 'desc')
    );
    
    const contestsSnap = await getDocs(contestsQuery);
    contestsSnap.forEach(doc => {
      const data = doc.data();
      activities.push({
        timestamp: data.timestamp?.toDate() || new Date(),
        type: 'contest',
        duration: data.timeTaken / 60 || 30, // convert seconds to minutes
        performance: data.score || 0,
        topicId: data.contestId,
        completed: true,
      });
    });

    // Study sessions (if tracked)
    // Video watches (if tracked)
    // etc.

    // Sort by timestamp desc
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities;
  }

  private async getPerformanceMetrics(userId: string, period: string): Promise<PerformanceMetrics> {
    // Calculate metrics from activities
    const activities = await this.getRecentActivities(userId, 30);
    
    const totalScore = activities
      .filter(a => a.performance !== undefined)
      .reduce((sum, a) => sum + (a.performance || 0), 0);
    const scoreCount = activities.filter(a => a.performance !== undefined).length;
    
    return {
      userId,
      period: 'month',
      metrics: {
        averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
        consistency: 75, // Would calculate variance
        engagementLevel: Math.min(100, (activities.length / 30) * 10),
        studyTime: activities.reduce((sum, a) => sum + a.duration, 0) / 60,
        contestsCompleted: activities.filter(a => a.type === 'contest').length,
        peerInteractions: activities.filter(a => a.type === 'peer-help').length,
        helpSeeking: 5, // Would track from questions asked
        improvementRate: 0,
      },
      trends: {
        scoresTrend: 'stable',
        engagementTrend: 'stable',
        studyTimeTrend: 'stable',
      },
      comparisonToPeers: {
        percentile: 50,
        averagePeerScore: 70,
        standingInClass: 0,
      },
    };
  }

  private async getHistoricalPredictions(userId: string, count: number): Promise<RiskPrediction[]> {
    const q = query(
      collection(db, this.COLLECTIONS.PREDICTIONS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as RiskPrediction);
  }

  private async savePrediction(prediction: RiskPrediction): Promise<void> {
    await addDoc(collection(db, this.COLLECTIONS.PREDICTIONS), {
      ...prediction,
      timestamp: Timestamp.fromDate(prediction.timestamp),
    });
  }

  // ==================== PUBLIC API ====================

  async getLatestPrediction(userId: string): Promise<RiskPrediction | null> {
    const predictions = await this.getHistoricalPredictions(userId, 1);
    return predictions[0] || null;
  }

  async getAllPredictions(userId: string): Promise<RiskPrediction[]> {
    return this.getHistoricalPredictions(userId, 100);
  }
}

export const predictiveLearningEngine = new PredictiveLearningEngine();
