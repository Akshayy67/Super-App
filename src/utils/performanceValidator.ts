/**
 * Performance Validation System
 * Ensures all analytics scores are accurate, data-driven, and within proper constraints
 */

import { InterviewPerformanceData } from "./performanceAnalytics";
import { SpeechAnalysisResult } from "./speechAnalysis";
import { BodyLanguageAnalysisResult } from "./bodyLanguageAnalysis";
import { SCORING_CONSTRAINTS, ConstraintValidator } from "./scoringConstraints";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: "high" | "medium" | "low";
  confidence: number;
  recommendations: string[];
}

export interface DataQualityMetrics {
  speechDataQuality: number;
  bodyLanguageDataQuality: number;
  overallDataQuality: number;
  missingDataPoints: string[];
  inconsistencies: string[];
}

export class PerformanceValidator {
  /**
   * Validate complete interview performance data
   */
  static validatePerformanceData(
    data: InterviewPerformanceData
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate score ranges
    const scoreValidation = this.validateScoreRanges(data);
    errors.push(...scoreValidation.errors);
    warnings.push(...scoreValidation.warnings);

    // Validate data consistency
    const consistencyValidation = this.validateDataConsistency(data);
    errors.push(...consistencyValidation.errors);
    warnings.push(...consistencyValidation.warnings);

    // Validate scoring logic
    const logicValidation = this.validateScoringLogic(data);
    errors.push(...logicValidation.errors);
    warnings.push(...logicValidation.warnings);

    // Assess data quality
    const dataQuality = this.assessDataQuality(
      data.speechAnalysis,
      data.bodyLanguageAnalysis
    );

    // Calculate overall confidence
    const confidence = this.calculateValidationConfidence(
      errors,
      warnings,
      dataQuality
    );

    // Generate recommendations
    recommendations.push(
      ...this.generateValidationRecommendations(errors, warnings, dataQuality)
    );

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dataQuality:
        dataQuality.overallDataQuality > 80
          ? "high"
          : dataQuality.overallDataQuality > 60
          ? "medium"
          : "low",
      confidence,
      recommendations,
    };
  }

  /**
   * Validate that all scores are within proper ranges
   */
  private static validateScoreRanges(data: InterviewPerformanceData): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check main scores
    if (data.overallScore < 0 || data.overallScore > 100) {
      errors.push(
        `Overall score ${data.overallScore} is outside valid range [0-100]`
      );
    }
    if (data.technicalScore < 0 || data.technicalScore > 100) {
      errors.push(
        `Technical score ${data.technicalScore} is outside valid range [0-100]`
      );
    }
    if (data.communicationScore < 0 || data.communicationScore > 100) {
      errors.push(
        `Communication score ${data.communicationScore} is outside valid range [0-100]`
      );
    }
    if (data.behavioralScore < 0 || data.behavioralScore > 100) {
      errors.push(
        `Behavioral score ${data.behavioralScore} is outside valid range [0-100]`
      );
    }

    // Check detailed metrics
    Object.entries(data.detailedMetrics).forEach(([metric, value]) => {
      if (value < 0 || value > 100) {
        errors.push(
          `Detailed metric ${metric} (${value}) is outside valid range [0-100]`
        );
      }
    });

    // Check for unrealistic score combinations
    const avgComponentScore =
      (data.technicalScore + data.communicationScore + data.behavioralScore) /
      3;
    const scoreDifference = Math.abs(data.overallScore - avgComponentScore);

    if (scoreDifference > 15) {
      warnings.push(
        `Overall score (${
          data.overallScore
        }) significantly differs from component average (${avgComponentScore.toFixed(
          1
        )})`
      );
    }

    return { errors, warnings };
  }

  /**
   * Validate data consistency across different metrics
   */
  private static validateDataConsistency(data: InterviewPerformanceData): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check speech analysis consistency
    const speechData = data.speechAnalysis;
    if (
      speechData.overallMetrics.totalWords === 0 &&
      data.communicationScore > 50
    ) {
      warnings.push("High communication score with no recorded speech data");
    }

    if (
      speechData.fillerWords.percentage > 20 &&
      data.communicationScore > 80
    ) {
      warnings.push("High communication score despite excessive filler words");
    }

    // Check body language consistency
    const bodyData = data.bodyLanguageAnalysis;
    if (bodyData.eyeContact.percentage === 0 && data.behavioralScore > 70) {
      warnings.push("High behavioral score with no eye contact data");
    }

    // Check time consistency
    if (data.duration < 60 && data.questionsAnswered > 5) {
      warnings.push("Too many questions answered for the interview duration");
    }

    if (
      data.averageResponseTime * data.questionsAnswered >
      data.duration * 1.5
    ) {
      warnings.push("Response times inconsistent with total duration");
    }

    // Check correct answers ratio
    const correctRatio = data.questionsCorrect / data.questionsAnswered;
    if (correctRatio > 0.95 && data.overallScore < 80) {
      warnings.push("High correct answer ratio but low overall score");
    }
    if (correctRatio < 0.3 && data.overallScore > 70) {
      warnings.push("Low correct answer ratio but high overall score");
    }

    return { errors, warnings };
  }

  /**
   * Validate scoring logic and constraints
   */
  private static validateScoringLogic(data: InterviewPerformanceData): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate difficulty-based scoring
    const constraints =
      SCORING_CONSTRAINTS.overall.difficultyWeights[
        data.difficulty as keyof typeof SCORING_CONSTRAINTS.overall.difficultyWeights
      ];

    if (!constraints) {
      errors.push(`Invalid difficulty level: ${data.difficulty}`);
      return { errors, warnings };
    }

    // Check if scores align with difficulty expectations
    if (data.difficulty === "easy" && data.overallScore < 60) {
      warnings.push("Unusually low score for easy difficulty level");
    }
    if (data.difficulty === "hard" && data.overallScore > 90) {
      warnings.push("Unusually high score for hard difficulty level");
    }

    // Validate score distribution
    const scoreVariance = this.calculateScoreVariance([
      data.technicalScore,
      data.communicationScore,
      data.behavioralScore,
    ]);

    if (scoreVariance > 400) {
      // Standard deviation > 20
      warnings.push(
        "High variance in component scores - may indicate inconsistent analysis"
      );
    }

    return { errors, warnings };
  }

  /**
   * Assess the quality of underlying data
   */
  private static assessDataQuality(
    speechData: SpeechAnalysisResult,
    bodyData: BodyLanguageAnalysisResult
  ): DataQualityMetrics {
    const missingDataPoints: string[] = [];
    const inconsistencies: string[] = [];

    // Check for simulated data first - this is critical
    const speechIsSimulated = (speechData.overallMetrics as any)?.isSimulated;
    const bodyIsSimulated = (bodyData.overallBodyLanguage as any)?.isSimulated;

    // Assess speech data quality
    let speechQuality = 100;

    if (speechIsSimulated) {
      speechQuality = 0;
      missingDataPoints.push(
        "CRITICAL: Speech analysis is using simulated data - results are not accurate"
      );
    } else {
      if (speechData.overallMetrics.totalWords < 20) {
        speechQuality -= 30;
        missingDataPoints.push("Insufficient speech data");
      }

      if (speechData.overallMetrics.totalDuration < 30) {
        speechQuality -= 20;
        missingDataPoints.push("Very short recording duration");
      }

      if (speechData.overallMetrics.averageVolume < 5) {
        speechQuality -= 25;
        missingDataPoints.push("Very low audio volume");
      }
    }

    // Assess body language data quality
    let bodyQuality = 100;

    if (bodyIsSimulated) {
      bodyQuality = 0;
      missingDataPoints.push(
        "CRITICAL: Body language analysis is using simulated data - results are not accurate"
      );
    } else {
      if (bodyData.eyeContact.percentage === 0) {
        bodyQuality -= 30;
        missingDataPoints.push("No eye contact data");
      }

      if (bodyData.posture.score === 0) {
        bodyQuality -= 25;
        missingDataPoints.push("No posture analysis data");
      }

      if (bodyData.facialExpressions.confidence === 0) {
        bodyQuality -= 20;
        missingDataPoints.push("No facial expression data");
      }
    }

    // Check for inconsistencies
    if (
      speechData.confidenceScore.overall > 80 &&
      bodyData.facialExpressions.nervousness > 60
    ) {
      inconsistencies.push(
        "High speech confidence but high visual nervousness"
      );
    }

    const overallQuality = (speechQuality + bodyQuality) / 2;

    return {
      speechDataQuality: Math.max(0, speechQuality),
      bodyLanguageDataQuality: Math.max(0, bodyQuality),
      overallDataQuality: Math.max(0, overallQuality),
      missingDataPoints,
      inconsistencies,
    };
  }

  /**
   * Calculate validation confidence score
   */
  private static calculateValidationConfidence(
    errors: string[],
    warnings: string[],
    dataQuality: DataQualityMetrics
  ): number {
    let confidence = 100;

    // Reduce confidence for errors and warnings
    confidence -= errors.length * 20;
    confidence -= warnings.length * 5;

    // Adjust for data quality
    confidence = confidence * (dataQuality.overallDataQuality / 100);

    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Generate validation recommendations
   */
  private static generateValidationRecommendations(
    errors: string[],
    warnings: string[],
    dataQuality: DataQualityMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push(
        "Critical errors found - review scoring algorithm implementation"
      );
    }

    if (warnings.length > 3) {
      recommendations.push(
        "Multiple warnings detected - consider reviewing data collection process"
      );
    }

    if (dataQuality.overallDataQuality < 60) {
      recommendations.push(
        "Low data quality - ensure proper camera and microphone setup"
      );
    }

    if (dataQuality.missingDataPoints.length > 2) {
      recommendations.push(
        "Multiple missing data points - verify all analysis systems are functioning"
      );
    }

    if (dataQuality.inconsistencies.length > 0) {
      recommendations.push(
        "Data inconsistencies detected - review analysis algorithms for accuracy"
      );
    }

    return recommendations;
  }

  /**
   * Calculate variance of scores
   */
  private static calculateScoreVariance(scores: number[]): number {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    return variance;
  }

  /**
   * Validate individual score against constraints
   */
  static validateScore(
    score: number,
    category: string,
    constraints: any
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (score < 0 || score > 100) {
      issues.push(`${category} score ${score} is outside valid range [0-100]`);
    }

    if (constraints && score < constraints.min) {
      issues.push(
        `${category} score ${score} is below minimum threshold ${constraints.min}`
      );
    }

    if (constraints && score > constraints.max) {
      issues.push(
        `${category} score ${score} exceeds maximum threshold ${constraints.max}`
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
