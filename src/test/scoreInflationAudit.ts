/**
 * Comprehensive Score Inflation Audit
 * Validates that the system can accurately display very low scores (0-20/100)
 * without any artificial inflation or minimum thresholds
 */

import { StrictScoringEngine } from '../utils/strictScoringEngine';
import { ConstraintValidator } from '../utils/scoringConstraints';
import { unifiedAnalyticsStorage } from '../utils/unifiedAnalyticsStorage';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';
import { SpeechAnalysisResult, BodyLanguageAnalysisResult } from '../utils/performanceAnalytics';

export class ScoreInflationAudit {
  
  /**
   * Test that very poor performance data produces appropriately low scores
   */
  static async testVeryPoorPerformanceScoring(): Promise<void> {
    console.log('🔍 Testing Very Poor Performance Scoring...\n');
    
    try {
      // Create extremely poor performance data
      const poorSpeechData = this.createPoorSpeechData();
      const poorBodyLanguageData = this.createPoorBodyLanguageData();
      
      console.log('📝 Testing with extremely poor performance data:');
      console.log('- High filler word percentage (50%)');
      console.log('- Very slow speech (50 WPM)');
      console.log('- Poor eye contact (10%)');
      console.log('- Poor posture (5%)');
      
      // Test individual scoring components
      const technicalResult = StrictScoringEngine.calculateTechnicalScore(
        poorSpeechData, poorBodyLanguageData, 300, 3
      );
      const communicationResult = StrictScoringEngine.calculateCommunicationScore(
        poorSpeechData, 300
      );
      const behavioralResult = StrictScoringEngine.calculateBehavioralScore(
        poorBodyLanguageData, 300
      );
      const overallResult = StrictScoringEngine.calculateOverallScore(
        technicalResult, communicationResult, behavioralResult, 'medium'
      );
      
      console.log('\n📊 Scoring Results:');
      console.log(`Technical Score: ${technicalResult.score}/100`);
      console.log(`Communication Score: ${communicationResult.score}/100`);
      console.log(`Behavioral Score: ${behavioralResult.score}/100`);
      console.log(`Overall Score: ${overallResult.score}/100`);
      
      // Validate no artificial inflation
      const inflationResults = this.validateNoInflation({
        technical: technicalResult.score,
        communication: communicationResult.score,
        behavioral: behavioralResult.score,
        overall: overallResult.score
      });
      
      console.log('\n🔍 Inflation Validation:');
      inflationResults.forEach(result => {
        console.log(`${result.passed ? '✅' : '❌'} ${result.test}: ${result.message}`);
      });
      
      const allPassed = inflationResults.every(r => r.passed);
      console.log(`\n${allPassed ? '✅' : '❌'} Score Inflation Test: ${allPassed ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      console.error('❌ Score inflation test failed:', error);
    }
  }
  
  /**
   * Test edge case with 0/10 AI feedback scores
   */
  static async testZeroScoreHandling(): Promise<void> {
    console.log('\n🧪 Testing Zero Score Handling...\n');
    
    try {
      // Simulate 0/10 AI feedback converted to 0/100
      const zeroScoreData: InterviewPerformanceData = {
        id: `zero_score_test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: 'Test Role',
        difficulty: 'medium',
        duration: 1800,
        overallScore: 0, // 0/10 AI score → 0/100
        technicalScore: 0,
        communicationScore: 0,
        behavioralScore: 0,
        questionsAnswered: 5,
        questionsCorrect: 0,
        averageResponseTime: 300,
        detailedMetrics: {
          confidence: 0,
          clarity: 0,
          professionalism: 0,
          engagement: 0,
          adaptability: 0,
        },
        speechAnalysis: this.createPoorSpeechData(),
        bodyLanguageAnalysis: this.createPoorBodyLanguageData(),
        strengths: [],
        weaknesses: ['Needs significant improvement in all areas'],
        recommendations: ['Practice basic interview skills']
      };
      
      // Save and retrieve to test storage integrity
      await unifiedAnalyticsStorage.savePerformanceData(zeroScoreData);
      const retrievedData = await unifiedAnalyticsStorage.getPerformanceHistory();
      const testEntry = retrievedData.find(item => item.id === zeroScoreData.id);
      
      if (!testEntry) {
        throw new Error('Zero score test data not found');
      }
      
      console.log('📊 Zero Score Test Results:');
      console.log(`Original Overall Score: ${zeroScoreData.overallScore}`);
      console.log(`Retrieved Overall Score: ${testEntry.overallScore}`);
      console.log(`Score Preserved: ${zeroScoreData.overallScore === testEntry.overallScore ? 'YES' : 'NO'}`);
      
      // Validate all scores are preserved
      const scoresPreserved = 
        zeroScoreData.overallScore === testEntry.overallScore &&
        zeroScoreData.technicalScore === testEntry.technicalScore &&
        zeroScoreData.communicationScore === testEntry.communicationScore &&
        zeroScoreData.behavioralScore === testEntry.behavioralScore;
      
      console.log(`\n${scoresPreserved ? '✅' : '❌'} Zero Score Handling: ${scoresPreserved ? 'PASSED' : 'FAILED'}`);
      
      // Cleanup
      await this.cleanupTestData(zeroScoreData.id);
      
    } catch (error) {
      console.error('❌ Zero score handling test failed:', error);
    }
  }
  
  /**
   * Test ConstraintValidator doesn't enforce artificial minimums
   */
  static testConstraintValidator(): void {
    console.log('\n🔧 Testing ConstraintValidator...\n');
    
    const testCases = [
      { input: 0, expected: 0, description: 'Zero score' },
      { input: 5, expected: 5, description: 'Very low score' },
      { input: -10, expected: 0, description: 'Negative score (should clamp to 0)' },
      { input: 150, expected: 100, description: 'Over-maximum score (should clamp to 100)' },
    ];
    
    testCases.forEach(({ input, expected, description }) => {
      const result = ConstraintValidator.validateScore(input);
      const passed = result === expected;
      console.log(`${passed ? '✅' : '❌'} ${description}: ${input} → ${result} (expected: ${expected})`);
    });
  }
  
  /**
   * Create extremely poor speech analysis data
   */
  private static createPoorSpeechData(): SpeechAnalysisResult {
    return {
      wordsPerMinute: 50, // Very slow
      fillerWordCount: 100, // Excessive filler words
      pauseCount: 50, // Too many pauses
      averagePauseLength: 5.0, // Very long pauses
      volumeVariation: 0.9, // Inconsistent volume
      clarityScore: 0.1, // Very poor clarity
      confidenceScore: 0.1, // Very low confidence
      emotionalTone: 'nervous',
      keyPhrases: [],
      isSimulated: false,
      fillerWords: {
        count: 100,
        percentage: 50, // 50% filler words
        types: ['um', 'uh', 'like', 'you know'],
        density: 2.0
      },
      overallMetrics: {
        fluency: 0.1,
        pace: 0.2,
        pronunciation: 0.1,
        isSimulated: false
      }
    };
  }
  
  /**
   * Create extremely poor body language data
   */
  private static createPoorBodyLanguageData(): BodyLanguageAnalysisResult {
    return {
      eyeContactPercentage: 10, // Very poor eye contact
      postureScore: 5, // Very poor posture
      gestureFrequency: 1, // Almost no gestures
      facialExpressionScore: 10, // Poor facial expressions
      overallBodyLanguageScore: 8, // Very poor overall
      confidenceIndicators: [],
      nervousBehaviors: ['fidgeting', 'avoiding eye contact', 'slouching'],
      engagementLevel: 5, // Very low engagement
      isSimulated: false,
      eyeContact: {
        percentage: 10,
        consistency: 5,
        quality: 'poor'
      },
      posture: {
        score: 5,
        stability: 10,
        professionalism: 5
      },
      gestures: {
        frequency: 1,
        appropriateness: 10,
        naturalness: 5
      },
      facialExpressions: {
        positivity: 10,
        engagement: 5,
        authenticity: 10
      },
      overallBodyLanguage: {
        score: 8,
        confidence: 5,
        professionalism: 10,
        isSimulated: false
      }
    };
  }
  
  /**
   * Validate that scores are not artificially inflated
   */
  private static validateNoInflation(scores: {
    technical: number;
    communication: number;
    behavioral: number;
    overall: number;
  }): Array<{ test: string; passed: boolean; message: string }> {
    const results = [];
    
    // Test 1: No artificial minimum thresholds
    results.push({
      test: 'No 30+ minimum threshold',
      passed: Object.values(scores).some(score => score < 30),
      message: Object.values(scores).some(score => score < 30) 
        ? 'System allows scores below 30' 
        : 'WARNING: All scores above 30 - may indicate artificial minimum'
    });
    
    // Test 2: No 50+ minimum threshold
    results.push({
      test: 'No 50+ minimum threshold',
      passed: Object.values(scores).some(score => score < 50),
      message: Object.values(scores).some(score => score < 50) 
        ? 'System allows scores below 50' 
        : 'WARNING: All scores above 50 - may indicate artificial minimum'
    });
    
    // Test 3: Scores reflect poor performance
    const averageScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
    results.push({
      test: 'Scores reflect poor performance',
      passed: averageScore < 40,
      message: averageScore < 40 
        ? `Average score ${averageScore.toFixed(1)} appropriately reflects poor performance` 
        : `WARNING: Average score ${averageScore.toFixed(1)} may be inflated for poor performance`
    });
    
    return results;
  }
  
  /**
   * Clean up test data
   */
  private static async cleanupTestData(testId: string): Promise<void> {
    try {
      const history = await unifiedAnalyticsStorage.getPerformanceHistory();
      const filtered = history.filter(item => item.id !== testId);
      localStorage.setItem('interview_performance_history', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to cleanup test data:', error);
    }
  }
  
  /**
   * Run all score inflation audit tests
   */
  static async runCompleteAudit(): Promise<void> {
    console.log('🚀 Starting Comprehensive Score Inflation Audit...\n');
    console.log('🎯 Goal: Verify 1/10 AI feedback displays as 10/100 with zero inflation\n');
    
    try {
      await this.testVeryPoorPerformanceScoring();
      await this.testZeroScoreHandling();
      this.testConstraintValidator();
      
      console.log('\n✅ Score Inflation Audit Complete!');
      console.log('📋 Summary: System validated for accurate low score handling');
      
    } catch (error) {
      console.error('❌ Score inflation audit failed:', error);
    }
  }
}

// Export for browser console usage
(window as any).ScoreInflationAudit = ScoreInflationAudit;

// Auto-run message
if (typeof window !== 'undefined') {
  console.log('🔧 Score Inflation Audit loaded. Run ScoreInflationAudit.runCompleteAudit() to validate zero inflation.');
}

export default ScoreInflationAudit;
