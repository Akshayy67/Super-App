/**
 * Analytics Test Suite
 * Tests the strict scoring engine and validation system
 */

import { StrictScoringEngine } from './strictScoringEngine';
import { PerformanceValidator } from './performanceValidator';
import { SpeechAnalysisResult } from './speechAnalysis';
import { BodyLanguageAnalysisResult } from './bodyLanguageAnalysis';
import { InterviewPerformanceData } from './performanceAnalytics';

// Mock data for testing
const createMockSpeechData = (quality: 'high' | 'medium' | 'low'): SpeechAnalysisResult => {
  const baseData = {
    fillerWords: {
      count: quality === 'high' ? 3 : quality === 'medium' ? 8 : 15,
      words: ['um', 'uh'],
      percentage: quality === 'high' ? 2.1 : quality === 'medium' ? 5.5 : 12.3,
      timestamps: []
    },
    paceAnalysis: {
      wordsPerMinute: quality === 'high' ? 150 : quality === 'medium' ? 135 : 95,
      averagePause: quality === 'high' ? 0.8 : quality === 'medium' ? 1.2 : 2.1,
      paceRating: quality === 'high' ? 'optimal' as const : quality === 'medium' ? 'optimal' as const : 'too_slow' as const,
      paceScore: quality === 'high' ? 92 : quality === 'medium' ? 78 : 55
    },
    confidenceScore: {
      overall: quality === 'high' ? 85 : quality === 'medium' ? 72 : 58,
      volumeVariation: quality === 'high' ? 88 : quality === 'medium' ? 75 : 62,
      voiceTremor: quality === 'high' ? 90 : quality === 'medium' ? 78 : 65,
      pausePattern: quality === 'high' ? 82 : quality === 'medium' ? 70 : 55,
      factors: []
    },
    pronunciationAssessment: {
      clarity: quality === 'high' ? 88 : quality === 'medium' ? 75 : 62,
      articulation: quality === 'high' ? 85 : quality === 'medium' ? 72 : 58,
      fluency: quality === 'high' ? 90 : quality === 'medium' ? 76 : 63,
      overallScore: quality === 'high' ? 87 : quality === 'medium' ? 74 : 61,
      issues: quality === 'low' ? ['Audio clarity could be improved'] : []
    },
    overallMetrics: {
      totalWords: quality === 'high' ? 120 : quality === 'medium' ? 85 : 45,
      totalDuration: quality === 'high' ? 180 : quality === 'medium' ? 160 : 140,
      averageVolume: quality === 'high' ? 45 : quality === 'medium' ? 35 : 15,
      silencePercentage: quality === 'high' ? 12 : quality === 'medium' ? 18 : 28
    }
  };
  
  return baseData;
};

const createMockBodyLanguageData = (quality: 'high' | 'medium' | 'low'): BodyLanguageAnalysisResult => {
  return {
    posture: {
      score: quality === 'high' ? 85 : quality === 'medium' ? 72 : 58,
      alignment: quality === 'high' ? 'good' as const : quality === 'medium' ? 'fair' as const : 'poor' as const,
      issues: quality === 'low' ? ['Slouching detected'] : [],
      recommendations: quality === 'low' ? ['Sit up straight'] : []
    },
    facialExpressions: {
      confidence: quality === 'high' ? 82 : quality === 'medium' ? 68 : 52,
      engagement: quality === 'high' ? 78 : quality === 'medium' ? 65 : 48,
      nervousness: quality === 'high' ? 15 : quality === 'medium' ? 25 : 45,
      expressions: []
    },
    eyeContact: {
      percentage: quality === 'high' ? 75 : quality === 'medium' ? 58 : 35,
      consistency: quality === 'high' ? 82 : quality === 'medium' ? 68 : 45,
      score: quality === 'high' ? 78 : quality === 'medium' ? 63 : 40
    },
    gestures: {
      appropriateness: quality === 'high' ? 80 : quality === 'medium' ? 68 : 52,
      frequency: quality === 'high' ? 12 : quality === 'medium' ? 8 : 4,
      score: quality === 'high' ? 76 : quality === 'medium' ? 62 : 48
    },
    overallBodyLanguage: {
      score: quality === 'high' ? 80 : quality === 'medium' ? 66 : 50,
      professionalismScore: quality === 'high' ? 82 : quality === 'medium' ? 68 : 52,
      engagementLevel: quality === 'high' ? 78 : quality === 'medium' ? 64 : 48,
      strengths: quality === 'high' ? ['Good posture', 'Appropriate gestures'] : [],
      improvements: quality === 'low' ? ['Improve eye contact', 'Better posture'] : []
    }
  };
};

export class AnalyticsTestSuite {
  /**
   * Run comprehensive analytics tests
   */
  static runAllTests(): { passed: number; failed: number; results: any[] } {
    const results: any[] = [];
    let passed = 0;
    let failed = 0;

    console.log('🧪 Starting Analytics Test Suite...');

    // Test 1: High Quality Data Scoring
    try {
      const result1 = this.testHighQualityScoring();
      results.push(result1);
      if (result1.passed) passed++; else failed++;
    } catch (error) {
      results.push({ test: 'High Quality Scoring', passed: false, error: error.message });
      failed++;
    }

    // Test 2: Low Quality Data Scoring
    try {
      const result2 = this.testLowQualityScoring();
      results.push(result2);
      if (result2.passed) passed++; else failed++;
    } catch (error) {
      results.push({ test: 'Low Quality Scoring', passed: false, error: error.message });
      failed++;
    }

    // Test 3: Score Range Validation
    try {
      const result3 = this.testScoreRangeValidation();
      results.push(result3);
      if (result3.passed) passed++; else failed++;
    } catch (error) {
      results.push({ test: 'Score Range Validation', passed: false, error: error.message });
      failed++;
    }

    // Test 4: Data Quality Assessment
    try {
      const result4 = this.testDataQualityAssessment();
      results.push(result4);
      if (result4.passed) passed++; else failed++;
    } catch (error) {
      results.push({ test: 'Data Quality Assessment', passed: false, error: error.message });
      failed++;
    }

    // Test 5: Difficulty-based Scoring
    try {
      const result5 = this.testDifficultyBasedScoring();
      results.push(result5);
      if (result5.passed) passed++; else failed++;
    } catch (error) {
      results.push({ test: 'Difficulty-based Scoring', passed: false, error: error.message });
      failed++;
    }

    console.log(`✅ Tests Passed: ${passed}`);
    console.log(`❌ Tests Failed: ${failed}`);
    console.log(`📊 Total Tests: ${passed + failed}`);

    return { passed, failed, results };
  }

  /**
   * Test high quality data produces appropriate scores
   */
  private static testHighQualityScoring(): any {
    const speechData = createMockSpeechData('high');
    const bodyData = createMockBodyLanguageData('high');

    const technicalResult = StrictScoringEngine.calculateTechnicalScore(speechData, bodyData, 180, 3);
    const communicationResult = StrictScoringEngine.calculateCommunicationScore(speechData, 180);
    const behavioralResult = StrictScoringEngine.calculateBehavioralScore(bodyData, 180);
    const overallResult = StrictScoringEngine.calculateOverallScore(
      technicalResult, communicationResult, behavioralResult, 'medium'
    );

    const passed = 
      technicalResult.score >= 70 &&
      communicationResult.score >= 75 &&
      behavioralResult.score >= 70 &&
      overallResult.score >= 70 &&
      technicalResult.dataQuality === 'high' &&
      communicationResult.dataQuality === 'high';

    return {
      test: 'High Quality Scoring',
      passed,
      scores: {
        technical: technicalResult.score,
        communication: communicationResult.score,
        behavioral: behavioralResult.score,
        overall: overallResult.score
      },
      dataQuality: {
        technical: technicalResult.dataQuality,
        communication: communicationResult.dataQuality,
        behavioral: behavioralResult.dataQuality
      }
    };
  }

  /**
   * Test low quality data produces appropriately lower scores
   */
  private static testLowQualityScoring(): any {
    const speechData = createMockSpeechData('low');
    const bodyData = createMockBodyLanguageData('low');

    const technicalResult = StrictScoringEngine.calculateTechnicalScore(speechData, bodyData, 180, 3);
    const communicationResult = StrictScoringEngine.calculateCommunicationScore(speechData, 180);
    const behavioralResult = StrictScoringEngine.calculateBehavioralScore(bodyData, 180);

    const passed = 
      technicalResult.score <= 65 &&
      communicationResult.score <= 70 &&
      behavioralResult.score <= 65 &&
      technicalResult.issues.length > 0 &&
      communicationResult.issues.length > 0;

    return {
      test: 'Low Quality Scoring',
      passed,
      scores: {
        technical: technicalResult.score,
        communication: communicationResult.score,
        behavioral: behavioralResult.score
      },
      issues: {
        technical: technicalResult.issues.length,
        communication: communicationResult.issues.length,
        behavioral: behavioralResult.issues.length
      }
    };
  }

  /**
   * Test that all scores are within valid ranges
   */
  private static testScoreRangeValidation(): any {
    const speechData = createMockSpeechData('medium');
    const bodyData = createMockBodyLanguageData('medium');

    const technicalResult = StrictScoringEngine.calculateTechnicalScore(speechData, bodyData, 180, 3);
    const communicationResult = StrictScoringEngine.calculateCommunicationScore(speechData, 180);
    const behavioralResult = StrictScoringEngine.calculateBehavioralScore(bodyData, 180);

    const allScoresValid = 
      this.isValidScore(technicalResult.score) &&
      this.isValidScore(communicationResult.score) &&
      this.isValidScore(behavioralResult.score) &&
      Object.values(technicalResult.breakdown).every(score => this.isValidScore(score)) &&
      Object.values(communicationResult.breakdown).every(score => this.isValidScore(score)) &&
      Object.values(behavioralResult.breakdown).every(score => this.isValidScore(score));

    return {
      test: 'Score Range Validation',
      passed: allScoresValid,
      scores: {
        technical: technicalResult.score,
        communication: communicationResult.score,
        behavioral: behavioralResult.score
      }
    };
  }

  /**
   * Test data quality assessment
   */
  private static testDataQualityAssessment(): any {
    const mockPerformanceData: InterviewPerformanceData = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      role: 'Software Engineer',
      difficulty: 'medium',
      duration: 180,
      overallScore: 75,
      technicalScore: 72,
      communicationScore: 78,
      behavioralScore: 74,
      speechAnalysis: createMockSpeechData('medium'),
      bodyLanguageAnalysis: createMockBodyLanguageData('medium'),
      questionsAnswered: 3,
      questionsCorrect: 2,
      averageResponseTime: 60,
      detailedMetrics: { confidence: 75, clarity: 78, professionalism: 74, engagement: 72, adaptability: 70 },
      strengths: ['Clear communication'],
      weaknesses: ['Could improve eye contact'],
      recommendations: ['Practice more interviews']
    };

    const validation = PerformanceValidator.validatePerformanceData(mockPerformanceData);

    const passed = 
      validation.confidence > 70 &&
      validation.dataQuality !== 'low' &&
      validation.errors.length === 0;

    return {
      test: 'Data Quality Assessment',
      passed,
      validation: {
        isValid: validation.isValid,
        dataQuality: validation.dataQuality,
        confidence: validation.confidence,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length
      }
    };
  }

  /**
   * Test difficulty-based scoring differences
   */
  private static testDifficultyBasedScoring(): any {
    const speechData = createMockSpeechData('medium');
    const bodyData = createMockBodyLanguageData('medium');

    const technicalResult = StrictScoringEngine.calculateTechnicalScore(speechData, bodyData, 180, 3);
    const communicationResult = StrictScoringEngine.calculateCommunicationScore(speechData, 180);
    const behavioralResult = StrictScoringEngine.calculateBehavioralScore(bodyData, 180);

    const easyOverall = StrictScoringEngine.calculateOverallScore(
      technicalResult, communicationResult, behavioralResult, 'easy'
    );
    const hardOverall = StrictScoringEngine.calculateOverallScore(
      technicalResult, communicationResult, behavioralResult, 'hard'
    );

    // Easy should weight communication more, hard should weight technical more
    const passed = easyOverall.score !== hardOverall.score;

    return {
      test: 'Difficulty-based Scoring',
      passed,
      scores: {
        easy: easyOverall.score,
        hard: hardOverall.score,
        difference: Math.abs(easyOverall.score - hardOverall.score)
      }
    };
  }

  private static isValidScore(score: number): boolean {
    return typeof score === 'number' && score >= 0 && score <= 100 && !isNaN(score);
  }
}

// Export test runner for easy access
export const runAnalyticsTests = () => AnalyticsTestSuite.runAllTests();
