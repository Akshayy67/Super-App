export interface BodyLanguageAnalysisResult {
  posture: {
    score: number;
    alignment: "good" | "fair" | "poor";
    issues: string[];
    recommendations: string[];
  };
  facialExpressions: {
    confidence: number;
    engagement: number;
    nervousness: number;
    expressions: { emotion: string; confidence: number; timestamp: number }[];
  };
  eyeContact: {
    percentage: number;
    consistency: number;
    score: number;
    patterns: string[];
  };
  gestures: {
    frequency: number;
    appropriateness: number;
    variety: number;
    score: number;
    observations: string[];
  };
  overallBodyLanguage: {
    score: number;
    strengths: string[];
    improvements: string[];
    professionalismScore: number;
  };
}

export class BodyLanguageAnalyzer {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isAnalyzing = false;
  private analysisInterval: number | null = null;
  private startTime = 0;

  // Analysis data storage
  private postureData: {
    timestamp: number;
    score: number;
    issues: string[];
  }[] = [];
  private expressionData: {
    timestamp: number;
    emotion: string;
    confidence: number;
  }[] = [];
  private eyeContactData: { timestamp: number; isLooking: boolean }[] = [];
  private gestureData: {
    timestamp: number;
    type: string;
    intensity: number;
  }[] = [];

  async initialize(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      this.videoElement = videoElement;
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");

      if (!this.context) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas size to match video
      this.canvas.width = videoElement.videoWidth || 640;
      this.canvas.height = videoElement.videoHeight || 480;

      // In a real implementation, you would initialize MediaPipe or similar
      // For now, we'll simulate the analysis
      console.log("Body language analyzer initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize body language analyzer:", error);
      return false;
    }
  }

  startAnalysis(): void {
    if (!this.videoElement || this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.startTime = Date.now();
    this.clearAnalysisData();

    // Analyze every 500ms
    this.analysisInterval = window.setInterval(() => {
      this.performAnalysis();
    }, 500);
  }

  stopAnalysis(): BodyLanguageAnalysisResult {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    this.isAnalyzing = false;
    return this.generateAnalysisResult();
  }

  private clearAnalysisData(): void {
    this.postureData = [];
    this.expressionData = [];
    this.eyeContactData = [];
    this.gestureData = [];
  }

  private performAnalysis(): void {
    if (!this.videoElement || !this.context || !this.canvas) return;

    const currentTime = Date.now() - this.startTime;

    // Draw current video frame to canvas for analysis
    this.context.drawImage(
      this.videoElement,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // In a real implementation, you would use MediaPipe or similar libraries
    // For demonstration, we'll simulate the analysis
    this.simulatePostureAnalysis(currentTime);
    this.simulateFacialExpressionAnalysis(currentTime);
    this.simulateEyeContactAnalysis(currentTime);
    this.simulateGestureAnalysis(currentTime);
  }

  private simulatePostureAnalysis(timestamp: number): void {
    // Simulate posture detection
    const postureScore = 70 + Math.random() * 25; // 70-95
    const issues: string[] = [];

    if (postureScore < 75) {
      issues.push("Slouching detected");
    }
    if (Math.random() < 0.3) {
      issues.push("Head tilted");
    }
    if (Math.random() < 0.2) {
      issues.push("Shoulders uneven");
    }

    this.postureData.push({
      timestamp,
      score: postureScore,
      issues,
    });
  }

  private simulateFacialExpressionAnalysis(timestamp: number): void {
    // Simulate facial expression detection
    const emotions = ["confident", "neutral", "nervous", "engaged", "focused"];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = 60 + Math.random() * 35; // 60-95

    this.expressionData.push({
      timestamp,
      emotion,
      confidence,
    });
  }

  private simulateEyeContactAnalysis(timestamp: number): void {
    // Simulate eye contact detection
    const isLooking = Math.random() > 0.3; // 70% chance of eye contact

    this.eyeContactData.push({
      timestamp,
      isLooking,
    });
  }

  private simulateGestureAnalysis(timestamp: number): void {
    // Simulate gesture detection
    const gestures = [
      "pointing",
      "open_palm",
      "clasped_hands",
      "fidgeting",
      "none",
    ];
    const gestureType = gestures[Math.floor(Math.random() * gestures.length)];
    const intensity = Math.random();

    if (gestureType !== "none") {
      this.gestureData.push({
        timestamp,
        type: gestureType,
        intensity,
      });
    }
  }

  private generateAnalysisResult(): BodyLanguageAnalysisResult {
    const posture = this.analyzePosture();
    const facialExpressions = this.analyzeFacialExpressions();
    const eyeContact = this.analyzeEyeContact();
    const gestures = this.analyzeGestures();
    const overallBodyLanguage = this.calculateOverallScore(
      posture,
      facialExpressions,
      eyeContact,
      gestures
    );

    return {
      posture,
      facialExpressions,
      eyeContact,
      gestures,
      overallBodyLanguage,
    };
  }

  private analyzePosture() {
    if (this.postureData.length === 0) {
      return {
        score: 0,
        alignment: "fair" as const,
        issues: ["No posture data available"],
        recommendations: ["Ensure camera is positioned properly"],
      };
    }

    const averageScore =
      this.postureData.reduce((sum, data) => sum + data.score, 0) /
      this.postureData.length;
    const allIssues = this.postureData.flatMap((data) => data.issues);
    const uniqueIssues = [...new Set(allIssues)];

    let alignment: "good" | "fair" | "poor";
    if (averageScore >= 85) alignment = "good";
    else if (averageScore >= 70) alignment = "fair";
    else alignment = "poor";

    const recommendations: string[] = [];
    if (uniqueIssues.includes("Slouching detected")) {
      recommendations.push("Sit up straight with shoulders back");
    }
    if (uniqueIssues.includes("Head tilted")) {
      recommendations.push("Keep your head level and centered");
    }
    if (uniqueIssues.includes("Shoulders uneven")) {
      recommendations.push("Relax your shoulders and keep them level");
    }

    return {
      score: Math.round(averageScore),
      alignment,
      issues: uniqueIssues,
      recommendations,
    };
  }

  private analyzeFacialExpressions() {
    if (this.expressionData.length === 0) {
      return {
        confidence: 0,
        engagement: 0,
        nervousness: 0,
        expressions: [],
      };
    }

    const expressions = this.expressionData.map((data) => ({
      emotion: data.emotion,
      confidence: Math.round(data.confidence),
      timestamp: data.timestamp,
    }));

    // Calculate emotion percentages
    const emotionCounts = this.expressionData.reduce((acc, data) => {
      acc[data.emotion] = (acc[data.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = this.expressionData.length;
    const confidence = Math.round(
      ((emotionCounts.confident || 0) / total) * 100
    );
    const engagement = Math.round(
      (((emotionCounts.engaged || 0) + (emotionCounts.focused || 0)) / total) *
        100
    );
    const nervousness = Math.round(
      ((emotionCounts.nervous || 0) / total) * 100
    );

    return {
      confidence,
      engagement,
      nervousness,
      expressions,
    };
  }

  private analyzeEyeContact() {
    if (this.eyeContactData.length === 0) {
      return {
        percentage: 0,
        consistency: 0,
        score: 0,
        patterns: ["No eye contact data available"],
      };
    }

    const lookingCount = this.eyeContactData.filter(
      (data) => data.isLooking
    ).length;
    const percentage = Math.round(
      (lookingCount / this.eyeContactData.length) * 100
    );

    // Calculate consistency (how evenly distributed eye contact is)
    const consistency = this.calculateEyeContactConsistency();

    // Calculate overall score
    let score = 0;
    if (percentage >= 60 && percentage <= 80) {
      score = 90 + Math.random() * 10; // Optimal range
    } else if (percentage >= 50 && percentage <= 90) {
      score = 75 + Math.random() * 15; // Good range
    } else {
      score = Math.max(0, percentage - 10); // Below optimal
    }

    const patterns: string[] = [];
    if (percentage < 50)
      patterns.push("Low eye contact - try to look at the camera more");
    if (percentage > 90)
      patterns.push("Excessive staring - natural breaks are okay");
    if (consistency < 0.5) patterns.push("Inconsistent eye contact patterns");

    return {
      percentage,
      consistency: Math.round(consistency * 100),
      score: Math.round(score),
      patterns,
    };
  }

  private calculateEyeContactConsistency(): number {
    if (this.eyeContactData.length < 4) return 0.5;

    // Divide timeline into segments and check distribution
    const segments = 4;
    const segmentSize = Math.floor(this.eyeContactData.length / segments);
    const segmentScores: number[] = [];

    for (let i = 0; i < segments; i++) {
      const start = i * segmentSize;
      const end = start + segmentSize;
      const segmentData = this.eyeContactData.slice(start, end);
      const lookingInSegment = segmentData.filter(
        (data) => data.isLooking
      ).length;
      segmentScores.push(lookingInSegment / segmentData.length);
    }

    // Calculate variance - lower variance means more consistent
    const mean =
      segmentScores.reduce((sum, score) => sum + score, 0) /
      segmentScores.length;
    const variance =
      segmentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      segmentScores.length;

    return Math.max(0, 1 - variance);
  }

  private analyzeGestures() {
    const frequency = this.gestureData.length;
    const totalTime = (Date.now() - this.startTime) / 1000; // in seconds
    const gesturesPerMinute = totalTime > 0 ? (frequency / totalTime) * 60 : 0;

    // Analyze gesture types
    const gestureTypes = this.gestureData.reduce((acc, data) => {
      acc[data.type] = (acc[data.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const appropriateGestures = ["pointing", "open_palm"];
    const inappropriateGestures = ["fidgeting"];

    const appropriateCount = appropriateGestures.reduce(
      (sum, type) => sum + (gestureTypes[type] || 0),
      0
    );
    const inappropriateCount = inappropriateGestures.reduce(
      (sum, type) => sum + (gestureTypes[type] || 0),
      0
    );

    const appropriateness =
      frequency > 0 ? (appropriateCount / frequency) * 100 : 100;
    const variety = Object.keys(gestureTypes).length;

    // Calculate overall gesture score
    let score = 70; // Base score
    if (gesturesPerMinute >= 2 && gesturesPerMinute <= 8) score += 15; // Good frequency
    if (appropriateness >= 80) score += 10; // Appropriate gestures
    if (variety >= 2) score += 5; // Good variety

    const observations: string[] = [];
    if (gesturesPerMinute < 1)
      observations.push(
        "Very few gestures - consider using more hand movements"
      );
    if (gesturesPerMinute > 10)
      observations.push("Too many gestures - try to be more selective");
    if (inappropriateCount > appropriateCount)
      observations.push("Reduce fidgeting and nervous gestures");
    if (variety === 1) observations.push("Try to vary your gestures more");

    return {
      frequency: Math.round(gesturesPerMinute * 10) / 10,
      appropriateness: Math.round(appropriateness),
      variety,
      score: Math.min(100, Math.round(score)),
      observations,
    };
  }

  private calculateOverallScore(
    posture: any,
    facialExpressions: any,
    eyeContact: any,
    gestures: any
  ) {
    const weights = {
      posture: 0.25,
      expressions: 0.25,
      eyeContact: 0.3,
      gestures: 0.2,
    };

    const expressionScore =
      (facialExpressions.confidence + facialExpressions.engagement) / 2;

    const overallScore = Math.round(
      posture.score * weights.posture +
        expressionScore * weights.expressions +
        eyeContact.score * weights.eyeContact +
        gestures.score * weights.gestures
    );

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (posture.score >= 85) strengths.push("Excellent posture");
    else if (posture.score < 70)
      improvements.push("Improve posture and alignment");

    if (eyeContact.score >= 85) strengths.push("Great eye contact");
    else if (eyeContact.score < 70)
      improvements.push("Work on maintaining appropriate eye contact");

    if (facialExpressions.confidence >= 70)
      strengths.push("Confident facial expressions");
    else improvements.push("Work on projecting more confidence");

    if (gestures.score >= 80) strengths.push("Appropriate use of gestures");
    else if (gestures.score < 60)
      improvements.push("Improve gesture usage and reduce fidgeting");

    const professionalismScore = Math.round(
      (overallScore + eyeContact.score + posture.score) / 3
    );

    return {
      score: overallScore,
      strengths,
      improvements,
      professionalismScore,
    };
  }

  cleanup(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    this.isAnalyzing = false;
    this.videoElement = null;
    this.canvas = null;
    this.context = null;
  }
}
