// Knowledge Graph Builder - Maps student knowledge and generates adaptive paths

import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { KnowledgeNode, AdaptiveLearningPath, PathNode, RecommendedActivity, Milestone } from './predictiveLearningEngine';

interface TopicDependency {
  topicId: string;
  prerequisiteIds: string[];
  difficulty: number; // 1-10
  estimatedTime: number; // minutes to master
  category: string;
}

class KnowledgeGraphService {
  // Topic dependencies (in production, load from database)
  private readonly TOPIC_GRAPH: Record<string, TopicDependency> = {
    'variables': {
      topicId: 'variables',
      prerequisiteIds: [],
      difficulty: 1,
      estimatedTime: 120,
      category: 'programming-basics',
    },
    'data-types': {
      topicId: 'data-types',
      prerequisiteIds: ['variables'],
      difficulty: 2,
      estimatedTime: 150,
      category: 'programming-basics',
    },
    'conditionals': {
      topicId: 'conditionals',
      prerequisiteIds: ['variables', 'data-types'],
      difficulty: 3,
      estimatedTime: 180,
      category: 'control-flow',
    },
    'loops': {
      topicId: 'loops',
      prerequisiteIds: ['conditionals'],
      difficulty: 4,
      estimatedTime: 200,
      category: 'control-flow',
    },
    'functions': {
      topicId: 'functions',
      prerequisiteIds: ['loops'],
      difficulty: 5,
      estimatedTime: 240,
      category: 'functions',
    },
    'arrays': {
      topicId: 'arrays',
      prerequisiteIds: ['loops'],
      difficulty: 5,
      estimatedTime: 200,
      category: 'data-structures',
    },
    'objects': {
      topicId: 'objects',
      prerequisiteIds: ['arrays'],
      difficulty: 6,
      estimatedTime: 220,
      category: 'data-structures',
    },
    'recursion': {
      topicId: 'recursion',
      prerequisiteIds: ['functions'],
      difficulty: 7,
      estimatedTime: 300,
      category: 'advanced-concepts',
    },
    'algorithms-basics': {
      topicId: 'algorithms-basics',
      prerequisiteIds: ['arrays', 'functions'],
      difficulty: 6,
      estimatedTime: 400,
      category: 'algorithms',
    },
    'sorting': {
      topicId: 'sorting',
      prerequisiteIds: ['algorithms-basics'],
      difficulty: 7,
      estimatedTime: 350,
      category: 'algorithms',
    },
    'searching': {
      topicId: 'searching',
      prerequisiteIds: ['algorithms-basics'],
      difficulty: 6,
      estimatedTime: 300,
      category: 'algorithms',
    },
    'linked-lists': {
      topicId: 'linked-lists',
      prerequisiteIds: ['objects', 'recursion'],
      difficulty: 7,
      estimatedTime: 300,
      category: 'data-structures',
    },
    'trees': {
      topicId: 'trees',
      prerequisiteIds: ['linked-lists', 'recursion'],
      difficulty: 8,
      estimatedTime: 400,
      category: 'data-structures',
    },
    'graphs': {
      topicId: 'graphs',
      prerequisiteIds: ['trees'],
      difficulty: 9,
      estimatedTime: 450,
      category: 'data-structures',
    },
    'dynamic-programming': {
      topicId: 'dynamic-programming',
      prerequisiteIds: ['recursion', 'algorithms-basics'],
      difficulty: 9,
      estimatedTime: 500,
      category: 'advanced-algorithms',
    },
  };

  // ==================== BUILD KNOWLEDGE GRAPH ====================

  async buildKnowledgeGraph(userId: string): Promise<KnowledgeNode[]> {
    console.log(`🧠 Building knowledge graph for user: ${userId}`);

    const nodes: KnowledgeNode[] = [];

    try {
      // Get user's contest history
      console.log('📊 Fetching contest results...');
      const contestResults = await this.getContestResults(userId);
      console.log('✅ Contest results loaded:', contestResults.length, 'contests');

    // Analyze performance by topic
    for (const [topicId, topicInfo] of Object.entries(this.TOPIC_GRAPH)) {
      const topicPerformance = this.analyzeTopicPerformance(topicId, contestResults);
      
      const node: KnowledgeNode = {
        topicId,
        topicName: this.formatTopicName(topicId),
        category: topicInfo.category,
        mastery: topicPerformance.mastery,
        confidence: topicPerformance.confidence,
        lastTested: topicPerformance.lastTested,
        timesAttempted: topicPerformance.attempts,
        timeSpent: topicPerformance.timeSpent,
        prerequisitesMet: this.checkPrerequisites(topicId, nodes),
        prerequisites: topicInfo.prerequisiteIds,
        nextTopics: this.getNextTopics(topicId),
        weaknessIndicators: topicPerformance.weaknesses,
        strengthIndicators: topicPerformance.strengths,
      };

      nodes.push(node);
    }

      // Save to database
      console.log('💾 Saving knowledge graph...');
      await this.saveKnowledgeGraph(userId, nodes);
      console.log('✅ Knowledge graph saved successfully');

      return nodes;
    } catch (error) {
      console.error('❌ Error building knowledge graph:', error);
      throw error;
    }
  }

  private analyzeTopicPerformance(topicId: string, contestResults: any[]): any {
    // Filter contest results for this topic
    const topicResults = contestResults.filter(r => 
      r.categoryPerformance && r.categoryPerformance[topicId]
    );

    if (topicResults.length === 0) {
      return {
        mastery: 0,
        confidence: 0,
        lastTested: new Date(0),
        attempts: 0,
        timeSpent: 0,
        weaknesses: ['Not yet attempted'],
        strengths: [],
      };
    }

    // Calculate mastery (average performance)
    const performances = topicResults.map(r => {
      const perf = r.categoryPerformance[topicId];
      return (perf.correct / perf.total) * 100;
    });

    const mastery = performances.reduce((sum, p) => sum + p, 0) / performances.length;
    
    // Calculate confidence (based on consistency and sample size)
    const variance = this.calculateVariance(performances);
    const sampleSizeBonus = Math.min(30, topicResults.length * 5); // more attempts = more confidence
    const confidence = Math.max(0, Math.min(100, 100 - variance + sampleSizeBonus));

    // Last tested
    const lastTested = new Date(Math.max(...topicResults.map(r => r.timestamp?.toDate?.()?.getTime() || 0)));

    // Time spent
    const timeSpent = topicResults.reduce((sum, r) => sum + (r.timeTaken || 0), 0) / 60; // seconds to minutes

    // Identify weaknesses and strengths
    const weaknesses = mastery < 50 ? ['Low accuracy', 'Needs more practice'] :
                      mastery < 70 ? ['Inconsistent performance'] : [];
    
    const strengths = mastery >= 80 ? ['High mastery', 'Consistent performance'] :
                     mastery >= 60 ? ['Good understanding'] : [];

    return {
      mastery,
      confidence,
      lastTested,
      attempts: topicResults.length,
      timeSpent,
      weaknesses,
      strengths,
    };
  }

  private checkPrerequisites(topicId: string, existingNodes: KnowledgeNode[]): boolean {
    const topicInfo = this.TOPIC_GRAPH[topicId];
    if (!topicInfo || topicInfo.prerequisiteIds.length === 0) return true;

    return topicInfo.prerequisiteIds.every(prereqId => {
      const prereqNode = existingNodes.find(n => n.topicId === prereqId);
      return prereqNode && prereqNode.mastery >= 60; // 60% mastery required
    });
  }

  private getNextTopics(topicId: string): string[] {
    // Find topics that have this topic as a prerequisite
    return Object.entries(this.TOPIC_GRAPH)
      .filter(([_, info]) => info.prerequisiteIds.includes(topicId))
      .map(([id]) => id);
  }

  // ==================== GENERATE ADAPTIVE LEARNING PATH ====================

  async generateAdaptivePath(userId: string, targetTopics?: string[]): Promise<AdaptiveLearningPath> {
    console.log(`🎯 Generating adaptive learning path for user: ${userId}`);

    try {
      // Build/refresh knowledge graph
      console.log('🧠 Building knowledge graph...');
      const knowledgeGraph = await this.buildKnowledgeGraph(userId);
      console.log('✅ Knowledge graph built with', knowledgeGraph.length, 'topics');

    // Determine learning style (in production, from user preferences or ML)
    const learningStyle = 'mixed'; // 'visual' | 'auditory' | 'kinesthetic' | 'reading'

    // Calculate current level (average mastery)
    const currentLevel = Math.round(
      knowledgeGraph.reduce((sum, node) => sum + node.mastery, 0) / knowledgeGraph.length
    );

    // Determine target level
    const targetLevel = targetTopics ? 100 : currentLevel + 20; // aim for +20 points

    // Find topics to focus on
    const focusTopics = this.identifyFocusTopics(knowledgeGraph, targetTopics);

    // Generate path nodes
    const pathNodes = await this.generatePathNodes(focusTopics, knowledgeGraph, learningStyle);

    // Calculate estimated time
    const estimatedTime = pathNodes.reduce((sum, node) => sum + node.estimatedTime, 0) / 60; // minutes to hours

    // Generate next milestone
    const nextMilestone = this.generateMilestone(pathNodes, targetLevel);

    // Determine difficulty adjustment
    const difficulty = this.calculateDifficulty(knowledgeGraph, currentLevel);

    const path: AdaptiveLearningPath = {
      userId,
      generated: new Date(),
      currentLevel,
      targetLevel,
      estimatedTimeToTarget: estimatedTime,
      pathNodes,
      difficulty,
      learningStyle,
      nextMilestone,
    };

      // Save path to database
      console.log('💾 Saving learning path...');
      await this.saveLearningPath(path);
      console.log('✅ Learning path saved successfully');

      return path;
    } catch (error) {
      console.error('❌ Error generating adaptive path:', error);
      throw error;
    }
  }

  private identifyFocusTopics(graph: KnowledgeNode[], targetTopics?: string[]): KnowledgeNode[] {
    // If specific topics requested, focus on those
    if (targetTopics && targetTopics.length > 0) {
      return graph.filter(node => targetTopics.includes(node.topicId));
    }

    // Otherwise, intelligently select topics to focus on
    const topics: KnowledgeNode[] = [];

    // 1. Topics with low mastery that prerequisites are met
    const weakTopics = graph
      .filter(node => node.mastery < 60 && node.prerequisitesMet)
      .sort((a, b) => a.mastery - b.mastery);
    topics.push(...weakTopics.slice(0, 3));

    // 2. Topics that are moderately mastered (can push to high mastery)
    const mediumTopics = graph
      .filter(node => node.mastery >= 60 && node.mastery < 80 && node.prerequisitesMet)
      .sort((a, b) => b.mastery - a.mastery);
    topics.push(...mediumTopics.slice(0, 2));

    // 3. New topics that are unlocked (prerequisites met but not attempted)
    const newTopics = graph
      .filter(node => node.mastery === 0 && node.prerequisitesMet)
      .slice(0, 2);
    topics.push(...newTopics);

    // Remove duplicates
    return Array.from(new Set(topics));
  }

  private async generatePathNodes(
    focusTopics: KnowledgeNode[],
    graph: KnowledgeNode[],
    learningStyle: string
  ): Promise<PathNode[]> {
    return focusTopics.map((topic, index) => {
      const topicInfo = this.TOPIC_GRAPH[topic.topicId];
      const targetMastery = Math.min(100, topic.mastery + 30); // aim for +30 points

      return {
        order: index + 1,
        topic: topic.topicName,
        topicId: topic.topicId,
        currentMastery: topic.mastery,
        targetMastery,
        recommendedActivities: this.generateActivities(topic, learningStyle, targetMastery),
        estimatedTime: this.estimateTimeToTarget(topic.mastery, targetMastery, topicInfo.difficulty),
        prerequisites: topic.prerequisites,
        unlocks: topic.nextTopics,
      };
    });
  }

  private generateActivities(
    topic: KnowledgeNode,
    learningStyle: string,
    targetMastery: number
  ): RecommendedActivity[] {
    const activities: RecommendedActivity[] = [];
    const masteryGap = targetMastery - topic.mastery;

    // Start with video for context (always helpful)
    activities.push({
      activityType: 'video',
      title: `Watch: ${topic.topicName} Fundamentals`,
      description: `Comprehensive video tutorial on ${topic.topicName}`,
      difficulty: Math.ceil(topic.mastery / 20) + 1, // Adaptive difficulty
      estimatedTime: 30,
      expectedMasteryGain: 5,
      url: `/videos/${topic.topicId}-intro`,
      contentId: `video-${topic.topicId}-1`,
    });

    // Add practice problems (most important)
    activities.push({
      activityType: 'practice',
      title: `Practice: ${topic.topicName} Problems`,
      description: `Solve ${Math.ceil(masteryGap / 5)} problems on ${topic.topicName}`,
      difficulty: Math.ceil((topic.mastery + 20) / 20),
      estimatedTime: masteryGap * 3, // 3 min per mastery point needed
      expectedMasteryGain: 15,
      url: `/practice/${topic.topicId}`,
      contentId: `practice-${topic.topicId}`,
    });

    // Add contest for assessment
    activities.push({
      activityType: 'contest',
      title: `Test: ${topic.topicName} Challenge`,
      description: `Take a timed challenge to test your ${topic.topicName} skills`,
      difficulty: Math.ceil((topic.mastery + 30) / 20),
      estimatedTime: 45,
      expectedMasteryGain: 8,
      url: `/contests?topic=${topic.topicId}`,
      contentId: `contest-${topic.topicId}`,
    });

    // Add peer learning
    if (topic.mastery < 50) {
      activities.push({
        activityType: 'peer-learning',
        title: `Join: ${topic.topicName} Study Group`,
        description: `Learn with peers who are studying ${topic.topicName}`,
        difficulty: 3,
        estimatedTime: 60,
        expectedMasteryGain: 7,
        url: `/study-rooms?topic=${topic.topicId}`,
        contentId: `study-group-${topic.topicId}`,
      });
    }

    // Add reading for theory
    activities.push({
      activityType: 'reading',
      title: `Read: ${topic.topicName} Guide`,
      description: `In-depth article explaining ${topic.topicName} concepts`,
      difficulty: Math.ceil(topic.mastery / 20) + 2,
      estimatedTime: 20,
      expectedMasteryGain: 4,
      url: `/guides/${topic.topicId}`,
      contentId: `guide-${topic.topicId}`,
    });

    // Add project if high mastery (for reinforcement)
    if (topic.mastery >= 60) {
      activities.push({
        activityType: 'project',
        title: `Build: ${topic.topicName} Project`,
        description: `Apply ${topic.topicName} knowledge in a real project`,
        difficulty: 7,
        estimatedTime: 120,
        expectedMasteryGain: 12,
        url: `/projects/${topic.topicId}`,
        contentId: `project-${topic.topicId}`,
      });
    }

    // Sort by expected mastery gain (highest impact first)
    activities.sort((a, b) => b.expectedMasteryGain - a.expectedMasteryGain);

    return activities;
  }

  private estimateTimeToTarget(currentMastery: number, targetMastery: number, difficulty: number): number {
    const masteryGap = targetMastery - currentMastery;
    const baseTime = masteryGap * 5; // 5 minutes per mastery point
    const difficultyMultiplier = 1 + (difficulty / 10); // harder topics take longer
    return Math.round(baseTime * difficultyMultiplier);
  }

  private generateMilestone(nodes: PathNode[], targetLevel: number): Milestone {
    const firstNode = nodes[0];
    if (!firstNode) {
      return {
        title: 'Begin Learning',
        description: 'Start your personalized learning journey',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        progress: 0,
        requirements: ['Complete initial assessment'],
      };
    }

    const totalEstimatedTime = nodes.reduce((sum, n) => sum + n.estimatedTime, 0);
    const daysToComplete = Math.ceil(totalEstimatedTime / (60 * 2)); // 2 hours per day
    const targetDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);

    return {
      title: `Master ${firstNode.topic}`,
      description: `Reach ${firstNode.targetMastery}% mastery in ${firstNode.topic}`,
      targetDate,
      progress: (firstNode.currentMastery / firstNode.targetMastery) * 100,
      requirements: [
        `Complete ${firstNode.recommendedActivities.length} learning activities`,
        `Score ${firstNode.targetMastery}%+ on assessment`,
      ],
      reward: '🎯 Topic Mastery Badge',
    };
  }

  private calculateDifficulty(graph: KnowledgeNode[], currentLevel: number): 'easier' | 'same' | 'harder' {
    // Analyze recent performance trend
    const recentTopics = graph.slice(-5); // last 5 topics attempted
    const avgMastery = recentTopics.reduce((sum, t) => sum + t.mastery, 0) / recentTopics.length;

    if (avgMastery >= 80) return 'harder'; // Student is excelling, increase difficulty
    if (avgMastery < 50) return 'easier'; // Student is struggling, decrease difficulty
    return 'same'; // Maintain current difficulty
  }

  // ==================== HELPER METHODS ====================

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return Math.sqrt(squareDiffs.reduce((sum, n) => sum + n, 0) / numbers.length);
  }

  private formatTopicName(topicId: string): string {
    return topicId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // ==================== DATABASE OPERATIONS ====================

  private async getContestResults(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'contestResults'),
        where('userId', '==', userId)
      );
      
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.warn('Error fetching contest results:', error);
      return []; // Return empty array if no results
    }
  }

  private async saveKnowledgeGraph(userId: string, nodes: KnowledgeNode[]): Promise<void> {
    await addDoc(collection(db, 'knowledgeGraphs'), {
      userId,
      nodes,
      generated: Timestamp.now(),
    });
  }

  private async saveLearningPath(path: AdaptiveLearningPath): Promise<void> {
    await addDoc(collection(db, 'adaptivePaths'), {
      ...path,
      generated: Timestamp.fromDate(path.generated),
      nextMilestone: {
        ...path.nextMilestone,
        targetDate: Timestamp.fromDate(path.nextMilestone.targetDate),
      },
    });
  }

  // ==================== PUBLIC API ====================

  async getKnowledgeGraph(userId: string): Promise<KnowledgeNode[]> {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'knowledgeGraphs'),
      where('userId', '==', userId)
    );
    
    const snap = await getDocs(q);
    if (snap.empty) {
      return this.buildKnowledgeGraph(userId);
    }
    
    // Sort in memory instead
    const docs = snap.docs.sort((a, b) => {
      const aTime = a.data().generated?.toMillis?.() || 0;
      const bTime = b.data().generated?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    const nodes = docs[0].data().nodes as KnowledgeNode[];
    
    // Convert Firestore Timestamps to Date objects
    return nodes.map(node => ({
      ...node,
      lastTested: node.lastTested instanceof Date ? node.lastTested : 
                  (node.lastTested as any)?.toDate?.() || new Date(0),
    }));
  }

  async getLearningPath(userId: string): Promise<AdaptiveLearningPath | null> {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'adaptivePaths'),
      where('userId', '==', userId)
    );
    
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    // Sort in memory instead
    const docs = snap.docs.sort((a, b) => {
      const aTime = a.data().generated?.toMillis?.() || 0;
      const bTime = b.data().generated?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    const data = docs[0].data();
    return {
      ...data,
      generated: data.generated.toDate(),
      nextMilestone: {
        ...data.nextMilestone,
        targetDate: data.nextMilestone.targetDate.toDate(),
      },
    } as AdaptiveLearningPath;
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
