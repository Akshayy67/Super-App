/**
 * Strict Scoring Engine for Interview Analytics
 * Ensures all scores are data-driven and follow precise constraints
 */

import { SCORING_CONSTRAINTS, ConstraintValidator } from "./scoringConstraints";
import { SpeechAnalysisResult } from "./speechAnalysis";
import { BodyLanguageAnalysisResult } from "./bodyLanguageAnalysis";

export interface StrictScoreResult {
  score: number;
  category: "excellent" | "good" | "fair" | "poor";
  confidence: number; // How confident we are in this score (0-1)
  dataQuality: "high" | "medium" | "low"; // Quality of underlying data
  breakdown: Record<string, number>;
  issues: string[];
  recommendations: string[];
}

export interface ComprehensiveScoreResult {
  technical: StrictScoreResult;
  communication: StrictScoreResult;
  behavioral: StrictScoreResult;
  overall: StrictScoreResult;
  metadata: {
    duration: number;
    difficulty: string;
    dataQuality: "high" | "medium" | "low";
    analysisTimestamp: string;
  };
}

export class StrictScoringEngine {
  /**
   * Calculate communication score based strictly on speech analysis data
   */
  static calculateCommunicationScore(
    speechResults: SpeechAnalysisResult,
    duration: number
  ): StrictScoreResult {
    const constraints = SCORING_CONSTRAINTS.communication;
    const weights = constraints.weights;

    // Validate that we have actual data, not simulated
    const dataQuality = this.assessSpeechDataQuality(speechResults);

    // Calculate individual components with strict constraints
    const pronunciation = this.calculatePronunciationScore(speechResults);
    const fluency = this.calculateFluencyScore(speechResults);
    const confidence = this.calculateConfidenceScore(speechResults);
    const pace = this.calculatePaceScore(speechResults, duration);
    const clarity = this.calculateClarityScore(speechResults);

    // Weighted score calculation
    const weightedScore =
      pronunciation * weights.pronunciation +
      fluency * weights.fluency +
      confidence * weights.confidence +
      pace * weights.pace +
      clarity * weights.clarity;

    const finalScore = ConstraintValidator.validateScore(weightedScore);
    const category = ConstraintValidator.getScoreCategory(
      finalScore,
      constraints.thresholds
    );

    // Calculate confidence based on data quality and consistency
    const scoreConfidence = this.calculateScoreConfidence(
      [pronunciation, fluency, confidence, pace, clarity],
      dataQuality
    );

    const breakdown = {
      pronunciation: Math.round(pronunciation),
      fluency: Math.round(fluency),
      confidence: Math.round(confidence),
      pace: Math.round(pace),
      clarity: Math.round(clarity),
    };

    const { issues, recommendations } = this.generateCommunicationFeedback(
      breakdown,
      category
    );

    return {
      score: finalScore,
      category,
      confidence: scoreConfidence,
      dataQuality,
      breakdown,
      issues,
      recommendations,
    };
  }

  /**
   * Calculate behavioral score based strictly on body language analysis
   */
  static calculateBehavioralScore(
    bodyLanguageResults: BodyLanguageAnalysisResult,
    duration: number
  ): StrictScoreResult {
    const constraints = SCORING_CONSTRAINTS.behavioral;
    const weights = constraints.weights;

    const dataQuality = this.assessBodyLanguageDataQuality(bodyLanguageResults);

    // Calculate individual components
    const eyeContact = this.calculateEyeContactScore(bodyLanguageResults);
    const posture = this.calculatePostureScore(bodyLanguageResults);
    const facialExpressions =
      this.calculateFacialExpressionScore(bodyLanguageResults);
    const gestures = this.calculateGestureScore(bodyLanguageResults);
    const overall = this.calculateOverallBodyLanguageScore(bodyLanguageResults);

    // Weighted score calculation
    const weightedScore =
      eyeContact * weights.eyeContact +
      posture * weights.posture +
      facialExpressions * weights.facialExpressions +
      gestures * weights.gestures +
      overall * weights.overall;

    const finalScore = ConstraintValidator.validateScore(weightedScore);
    const category = ConstraintValidator.getScoreCategory(
      finalScore,
      constraints.thresholds
    );

    const scoreConfidence = this.calculateScoreConfidence(
      [eyeContact, posture, facialExpressions, gestures, overall],
      dataQuality
    );

    const breakdown = {
      eyeContact: Math.round(eyeContact),
      posture: Math.round(posture),
      facialExpressions: Math.round(facialExpressions),
      gestures: Math.round(gestures),
      overall: Math.round(overall),
    };

    const { issues, recommendations } = this.generateBehavioralFeedback(
      breakdown,
      category
    );

    return {
      score: finalScore,
      category,
      confidence: scoreConfidence,
      dataQuality,
      breakdown,
      issues,
      recommendations,
    };
  }

  /**
   * Calculate technical score based on speech coherence and response quality
   */
  static calculateTechnicalScore(
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult,
    duration: number,
    questionCount: number
  ): StrictScoreResult {
    const constraints = SCORING_CONSTRAINTS.technical;

    // Calculate response quality metrics
    const coherence = this.calculateCoherenceScore(speechResults);
    const depth = this.calculateResponseDepthScore(speechResults, duration);
    const accuracy = this.calculateResponseAccuracyScore(
      speechResults,
      bodyLanguageResults
    );
    const timeManagement = this.calculateTimeManagementScore(
      duration,
      questionCount
    );
    const completeness = this.calculateCompletenessScore(
      speechResults,
      questionCount
    );

    // Technical score is weighted average of quality metrics
    const technicalScore =
      coherence * 0.3 +
      depth * 0.25 +
      accuracy * 0.2 +
      timeManagement * 0.15 +
      completeness * 0.1;

    const finalScore = ConstraintValidator.validateScore(technicalScore);
    const category = ConstraintValidator.getScoreCategory(finalScore, {
      excellent: 85,
      good: 70,
      fair: 55,
      poor: 40,
    });

    const dataQuality = this.assessTechnicalDataQuality(
      speechResults,
      bodyLanguageResults
    );
    const scoreConfidence = this.calculateScoreConfidence(
      [coherence, depth, accuracy, timeManagement, completeness],
      dataQuality
    );

    const breakdown = {
      coherence: Math.round(coherence),
      depth: Math.round(depth),
      accuracy: Math.round(accuracy),
      timeManagement: Math.round(timeManagement),
      completeness: Math.round(completeness),
    };

    const { issues, recommendations } = this.generateTechnicalFeedback(
      breakdown,
      category
    );

    return {
      score: finalScore,
      category,
      confidence: scoreConfidence,
      dataQuality,
      breakdown,
      issues,
      recommendations,
    };
  }

  /**
   * Calculate overall score with strict difficulty-based weighting
   */
  static calculateOverallScore(
    technicalScore: StrictScoreResult,
    communicationScore: StrictScoreResult,
    behavioralScore: StrictScoreResult,
    difficulty: string,
    experience: string = "mid"
  ): StrictScoreResult {
    const constraints = SCORING_CONSTRAINTS.overall;
    const weights =
      constraints.difficultyWeights[
        difficulty as keyof typeof constraints.difficultyWeights
      ] || constraints.difficultyWeights.medium;

    // Validate weights sum to 1.0
    if (!ConstraintValidator.validateWeights(weights)) {
      throw new Error("Invalid difficulty weights - must sum to 1.0");
    }

    // Calculate weighted overall score
    const weightedScore =
      technicalScore.score * weights.technical +
      communicationScore.score * weights.communication +
      behavioralScore.score * weights.behavioral;

    // Apply experience adjustments
    const experienceAdjustment =
      constraints.experienceAdjustments[
        experience as keyof typeof constraints.experienceAdjustments
      ] || constraints.experienceAdjustments.mid;

    let adjustedScore = weightedScore * experienceAdjustment.multiplier;

    // Apply bonus/penalty caps
    if (experienceAdjustment.maxBonus > 0) {
      adjustedScore = Math.min(
        adjustedScore,
        weightedScore + experienceAdjustment.maxBonus
      );
    }
    if (experienceAdjustment.maxPenalty < 0) {
      adjustedScore = Math.max(
        adjustedScore,
        weightedScore + experienceAdjustment.maxPenalty
      );
    }

    const finalScore = ConstraintValidator.validateScore(adjustedScore);
    const category = ConstraintValidator.getScoreCategory(finalScore, {
      excellent: 85,
      good: 70,
      fair: 55,
      poor: 40,
    });

    // Overall confidence is the minimum of component confidences
    const overallConfidence = Math.min(
      technicalScore.confidence,
      communicationScore.confidence,
      behavioralScore.confidence
    );

    // Overall data quality is the lowest of component qualities
    const dataQualities = [
      technicalScore.dataQuality,
      communicationScore.dataQuality,
      behavioralScore.dataQuality,
    ];
    const overallDataQuality = dataQualities.includes("low")
      ? "low"
      : dataQualities.includes("medium")
      ? "medium"
      : "high";

    const breakdown = {
      technical: technicalScore.score,
      communication: communicationScore.score,
      behavioral: behavioralScore.score,
      experienceAdjustment:
        Math.round((adjustedScore - weightedScore) * 100) / 100,
    };

    const { issues, recommendations } = this.generateOverallFeedback(
      technicalScore,
      communicationScore,
      behavioralScore,
      category
    );

    return {
      score: finalScore,
      category,
      confidence: overallConfidence,
      dataQuality: overallDataQuality,
      breakdown,
      issues,
      recommendations,
    };
  }

  // Private helper methods for individual score calculations
  private static calculatePronunciationScore(
    speechResults: SpeechAnalysisResult
  ): number {
    const constraints = SCORING_CONSTRAINTS.speech.pronunciation;
    const clarity = speechResults.pronunciationAssessment.clarity;
    const articulation = speechResults.pronunciationAssessment.articulation;
    const fluency = speechResults.pronunciationAssessment.fluency;

    // Weighted average of pronunciation components
    const score = clarity * 0.4 + articulation * 0.35 + fluency * 0.25;
    return ConstraintValidator.validateScore(score);
  }

  private static calculateFluencyScore(
    speechResults: SpeechAnalysisResult
  ): number {
    const fillerWordPercentage = speechResults.fillerWords.percentage;
    const constraints = SCORING_CONSTRAINTS.speech.fillerWords;

    // Score based on filler word percentage
    let score = 100;
    if (fillerWordPercentage <= constraints.percentage.excellent[1]) {
      score = 95;
    } else if (fillerWordPercentage <= constraints.percentage.good[1]) {
      score = 80;
    } else if (fillerWordPercentage <= constraints.percentage.fair[1]) {
      score = 65;
    } else {
      // Allow very low scores for poor performance - no artificial minimum
      score = Math.max(0, 100 - fillerWordPercentage * 8);
    }

    return ConstraintValidator.validateScore(score);
  }

  private static calculateConfidenceScore(
    speechResults: SpeechAnalysisResult
  ): number {
    const constraints = SCORING_CONSTRAINTS.speech.confidence;
    const volumeStability = speechResults.confidenceScore.volumeVariation;
    const voiceTremor = speechResults.confidenceScore.voiceTremor;
    const pausePattern = speechResults.confidenceScore.pausePattern;

    // Weighted confidence score
    const score =
      volumeStability * 0.4 + voiceTremor * 0.35 + pausePattern * 0.25;

    return ConstraintValidator.validateScore(score);
  }

  private static calculatePaceScore(
    speechResults: SpeechAnalysisResult,
    duration: number
  ): number {
    const wordsPerMinute = speechResults.paceAnalysis.wordsPerMinute;
    const constraints = SCORING_CONSTRAINTS.speech.pace;

    // Score based on WPM ranges
    if (
      ConstraintValidator.isInRange(
        wordsPerMinute,
        constraints.wordsPerMinute.optimal
      )
    ) {
      return 95; // Optimal pace
    } else if (
      ConstraintValidator.isInRange(
        wordsPerMinute,
        constraints.wordsPerMinute.acceptable
      )
    ) {
      return 80; // Acceptable pace
    } else {
      // Poor pace - calculate penalty
      const optimalMid =
        (constraints.wordsPerMinute.optimal[0] +
          constraints.wordsPerMinute.optimal[1]) /
        2;
      const deviation = Math.abs(wordsPerMinute - optimalMid);
      // Allow very low scores for poor pace - no artificial minimum
      const score = Math.max(0, 100 - deviation * 0.5);
      return ConstraintValidator.validateScore(score);
    }
  }

  private static calculateClarityScore(
    speechResults: SpeechAnalysisResult
  ): number {
    return ConstraintValidator.validateScore(
      speechResults.pronunciationAssessment.clarity
    );
  }

  private static calculateEyeContactScore(
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number {
    const percentage = bodyLanguageResults.eyeContact.percentage;
    const consistency = bodyLanguageResults.eyeContact.consistency;
    const constraints = SCORING_CONSTRAINTS.bodyLanguage.eyeContact;

    // Score based on percentage and consistency
    let percentageScore = 0;
    if (
      ConstraintValidator.isInRange(
        percentage,
        constraints.percentage.excellent
      )
    ) {
      percentageScore = 95;
    } else if (
      ConstraintValidator.isInRange(percentage, constraints.percentage.good)
    ) {
      percentageScore = 80;
    } else if (
      ConstraintValidator.isInRange(percentage, constraints.percentage.fair)
    ) {
      percentageScore = 65;
    } else {
      // Allow very low scores for poor eye contact - no artificial minimum
      percentageScore = Math.max(0, percentage * 0.8);
    }

    let consistencyScore = 0;
    if (
      ConstraintValidator.isInRange(
        consistency,
        constraints.consistency.excellent
      )
    ) {
      consistencyScore = 95;
    } else if (
      ConstraintValidator.isInRange(consistency, constraints.consistency.good)
    ) {
      consistencyScore = 80;
    } else if (
      ConstraintValidator.isInRange(consistency, constraints.consistency.fair)
    ) {
      consistencyScore = 65;
    } else {
      // Allow very low scores for poor consistency - no artificial minimum
      consistencyScore = Math.max(0, consistency * 0.7);
    }

    // Weighted average
    const score = percentageScore * 0.6 + consistencyScore * 0.4;
    return ConstraintValidator.validateScore(score);
  }

  private static calculatePostureScore(
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number {
    const postureScore = bodyLanguageResults.posture.score;
    return ConstraintValidator.validateScore(postureScore);
  }

  private static calculateFacialExpressionScore(
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number {
    const confidence = bodyLanguageResults.facialExpressions.confidence;
    const engagement = bodyLanguageResults.facialExpressions.engagement;
    const nervousness = bodyLanguageResults.facialExpressions.nervousness;

    // Weighted score with nervousness as negative factor
    const score =
      confidence * 0.4 + engagement * 0.4 + (100 - nervousness) * 0.2;
    return ConstraintValidator.validateScore(score);
  }

  private static calculateGestureScore(
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number {
    const appropriateness = bodyLanguageResults.gestures.appropriateness;
    const frequency = bodyLanguageResults.gestures.frequency;
    const constraints = SCORING_CONSTRAINTS.bodyLanguage.gestures;

    // Score appropriateness
    let appropriatenessScore =
      ConstraintValidator.validateScore(appropriateness);

    // Score frequency
    let frequencyScore = 0;
    if (
      ConstraintValidator.isInRange(frequency, constraints.frequency.optimal)
    ) {
      frequencyScore = 90;
    } else if (
      ConstraintValidator.isInRange(frequency, constraints.frequency.acceptable)
    ) {
      frequencyScore = 75;
    } else {
      // Allow very low scores for poor gesture frequency - no artificial minimum
      frequencyScore = Math.max(0, 100 - Math.abs(frequency - 13) * 3);
    }

    // Weighted average
    const score = appropriatenessScore * 0.7 + frequencyScore * 0.3;
    return ConstraintValidator.validateScore(score);
  }

  private static calculateOverallBodyLanguageScore(
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number {
    return ConstraintValidator.validateScore(
      bodyLanguageResults.overallBodyLanguage.score
    );
  }

  private static calculateCoherenceScore(
    speechResults: SpeechAnalysisResult
  ): number {
    const fillerWordPenalty = speechResults.fillerWords.percentage * 2;
    // Allow very low scores for poor coherence - no artificial minimum
    const score = Math.max(0, 100 - fillerWordPenalty);
    return ConstraintValidator.validateScore(score);
  }

  private static calculateResponseDepthScore(
    speechResults: SpeechAnalysisResult,
    duration: number
  ): number {
    const totalWords = speechResults.overallMetrics.totalWords;
    const wordsPerMinute = duration > 0 ? (totalWords / duration) * 60 : 0;

    // Score based on response length and pace
    let score = 50; // Base score

    if (totalWords >= 100) score += 20; // Substantial response
    if (totalWords >= 200) score += 15; // Detailed response
    if (wordsPerMinute >= 120 && wordsPerMinute <= 180) score += 15; // Good pace

    return ConstraintValidator.validateScore(score);
  }

  private static calculateResponseAccuracyScore(
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number {
    // Estimate accuracy based on confidence and engagement
    const speechConfidence = speechResults.confidenceScore.overall;
    const engagement = bodyLanguageResults.facialExpressions.engagement;
    const nervousness = bodyLanguageResults.facialExpressions.nervousness;

    const score =
      speechConfidence * 0.4 + engagement * 0.4 + (100 - nervousness) * 0.2;
    return ConstraintValidator.validateScore(score);
  }

  private static calculateTimeManagementScore(
    duration: number,
    questionCount: number
  ): number {
    const expectedDuration = questionCount * 120; // 2 minutes per question
    const efficiency =
      expectedDuration > 0
        ? Math.min(100, (expectedDuration / duration) * 100)
        : 0;

    let score = 50; // Base score

    if (efficiency >= 80 && efficiency <= 120) score = 90; // Optimal timing
    else if (efficiency >= 60 && efficiency <= 140)
      score = 75; // Acceptable timing
    // Allow very low scores for poor time management - no artificial minimum
    else score = Math.max(0, 100 - Math.abs(efficiency - 100) * 0.5);

    return ConstraintValidator.validateScore(score);
  }

  private static calculateCompletenessScore(
    speechResults: SpeechAnalysisResult,
    questionCount: number
  ): number {
    const totalWords = speechResults.overallMetrics.totalWords;
    const expectedWords = questionCount * 80; // ~80 words per question

    const completeness =
      expectedWords > 0 ? Math.min(100, (totalWords / expectedWords) * 100) : 0;
    return ConstraintValidator.validateScore(completeness);
  }

  // Data quality assessment methods
  private static assessSpeechDataQuality(
    speechResults: SpeechAnalysisResult
  ): "high" | "medium" | "low" {
    const totalWords = speechResults.overallMetrics.totalWords;
    const duration = speechResults.overallMetrics.totalDuration;
    const averageVolume = speechResults.overallMetrics.averageVolume;

    // High quality: substantial speech data with good audio
    if (totalWords >= 50 && duration >= 30 && averageVolume > 10) {
      return "high";
    }
    // Medium quality: some speech data
    else if (totalWords >= 20 && duration >= 15) {
      return "medium";
    }
    // Low quality: minimal or poor data
    else {
      return "low";
    }
  }

  private static assessBodyLanguageDataQuality(
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): "high" | "medium" | "low" {
    const eyeContactData = bodyLanguageResults.eyeContact.percentage;
    const postureScore = bodyLanguageResults.posture.score;
    const expressionConfidence =
      bodyLanguageResults.facialExpressions.confidence;

    // High quality: all metrics available and reasonable
    if (eyeContactData > 0 && postureScore > 0 && expressionConfidence > 0) {
      return "high";
    }
    // Medium quality: some metrics available
    else if (eyeContactData > 0 || postureScore > 0) {
      return "medium";
    }
    // Low quality: minimal data
    else {
      return "low";
    }
  }

  private static assessTechnicalDataQuality(
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): "high" | "medium" | "low" {
    const speechQuality = this.assessSpeechDataQuality(speechResults);
    const bodyQuality = this.assessBodyLanguageDataQuality(bodyLanguageResults);

    if (speechQuality === "high" && bodyQuality === "high") return "high";
    if (speechQuality === "low" || bodyQuality === "low") return "low";
    return "medium";
  }

  private static calculateScoreConfidence(
    scores: number[],
    dataQuality: "high" | "medium" | "low"
  ): number {
    // Calculate variance in scores
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Base confidence on consistency and data quality - allow very low confidence
    let confidence = Math.max(0.0, 1 - standardDeviation / 100);

    // Adjust for data quality
    switch (dataQuality) {
      case "high":
        confidence *= 1.0;
        break;
      case "medium":
        confidence *= 0.8;
        break;
      case "low":
        confidence *= 0.5;
        break;
    }

    return Math.round(confidence * 100) / 100;
  }

  // Feedback generation methods
  private static generateCommunicationFeedback(
    breakdown: Record<string, number>,
    category: "excellent" | "good" | "fair" | "poor"
  ): { issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (breakdown.pronunciation < 70) {
      issues.push("Pronunciation clarity needs improvement");
      recommendations.push(
        "Practice speaking more clearly and articulating words fully"
      );
    }

    if (breakdown.fluency < 70) {
      issues.push("Speech fluency could be enhanced");
      recommendations.push(
        "Reduce filler words and practice smooth speech flow"
      );
    }

    if (breakdown.confidence < 60) {
      issues.push("Voice confidence appears low");
      recommendations.push(
        "Practice speaking with more conviction and steady volume"
      );
    }

    if (breakdown.pace < 60) {
      issues.push("Speaking pace needs adjustment");
      recommendations.push(
        "Aim for 140-160 words per minute for optimal communication"
      );
    }

    if (breakdown.clarity < 70) {
      issues.push("Audio clarity could be improved");
      recommendations.push(
        "Ensure good microphone quality and speak directly into it"
      );
    }

    return { issues, recommendations };
  }

  private static generateBehavioralFeedback(
    breakdown: Record<string, number>,
    category: "excellent" | "good" | "fair" | "poor"
  ): { issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (breakdown.eyeContact < 60) {
      issues.push("Eye contact frequency is below optimal");
      recommendations.push(
        "Maintain eye contact 60-80% of the time, looking at the camera"
      );
    }

    if (breakdown.posture < 65) {
      issues.push("Posture alignment needs improvement");
      recommendations.push(
        "Sit up straight with shoulders back and head level"
      );
    }

    if (breakdown.facialExpressions < 60) {
      issues.push("Facial expressions could be more engaging");
      recommendations.push(
        "Show appropriate emotions and maintain an engaged expression"
      );
    }

    if (breakdown.gestures < 60) {
      issues.push("Hand gestures could be more natural");
      recommendations.push(
        "Use appropriate hand gestures to emphasize points naturally"
      );
    }

    return { issues, recommendations };
  }

  private static generateTechnicalFeedback(
    breakdown: Record<string, number>,
    category: "excellent" | "good" | "fair" | "poor"
  ): { issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (breakdown.coherence < 70) {
      issues.push("Response coherence needs improvement");
      recommendations.push(
        "Structure your answers more clearly with logical flow"
      );
    }

    if (breakdown.depth < 65) {
      issues.push("Response depth could be enhanced");
      recommendations.push("Provide more detailed explanations and examples");
    }

    if (breakdown.accuracy < 75) {
      issues.push("Response accuracy appears uncertain");
      recommendations.push(
        "Be more confident in your answers and provide specific details"
      );
    }

    if (breakdown.timeManagement < 60) {
      issues.push("Time management needs attention");
      recommendations.push(
        "Aim for 1-2 minutes per response for optimal pacing"
      );
    }

    if (breakdown.completeness < 65) {
      issues.push("Responses could be more complete");
      recommendations.push(
        "Ensure you fully address all parts of each question"
      );
    }

    return { issues, recommendations };
  }

  private static generateOverallFeedback(
    technical: StrictScoreResult,
    communication: StrictScoreResult,
    behavioral: StrictScoreResult,
    category: "excellent" | "good" | "fair" | "poor"
  ): { issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Combine issues from all categories
    issues.push(
      ...technical.issues,
      ...communication.issues,
      ...behavioral.issues
    );
    recommendations.push(
      ...technical.recommendations,
      ...communication.recommendations,
      ...behavioral.recommendations
    );

    // Add overall feedback based on category
    switch (category) {
      case "excellent":
        recommendations.push(
          "Maintain your excellent performance and continue practicing"
        );
        break;
      case "good":
        recommendations.push(
          "Focus on the identified areas for improvement to reach excellence"
        );
        break;
      case "fair":
        recommendations.push(
          "Significant improvement needed in multiple areas - practice regularly"
        );
        break;
      case "poor":
        recommendations.push(
          "Comprehensive practice needed across all interview skills"
        );
        break;
    }

    return {
      issues: [...new Set(issues)],
      recommendations: [...new Set(recommendations)],
    };
  }
}
