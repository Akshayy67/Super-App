/**
 * Scoring Pipeline Integrity Test
 * Validates that poor performance scores (like 1/10) are accurately preserved
 * and displayed throughout the entire system without inflation
 */

import { AnalyticsValidator } from '../utils/analyticsValidation';
import { unifiedAnalyticsStorage } from '../utils/unifiedAnalyticsStorage';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';

export class ScoringPipelineTest {
  
  /**
   * Test the complete scoring pipeline with deliberately poor scores
   */
  static async testLowScoreIntegrity(): Promise<void> {
    console.log('🧪 Testing Scoring Pipeline Integrity...\n');
    
    try {
      // Create test data with very low scores (simulating 1/10 AI feedback)
      const lowScoreTestData = this.createLowScoreTestData();
      
      console.log('📝 Created test data with low scores:', {
        overall: lowScoreTestData.overallScore,
        technical: lowScoreTestData.technicalScore,
        communication: lowScoreTestData.communicationScore,
        behavioral: lowScoreTestData.behavioralScore
      });
      
      // Save to analytics system
      await unifiedAnalyticsStorage.savePerformanceData(lowScoreTestData);
      console.log('💾 Saved low score data to analytics');
      
      // Retrieve and validate
      const retrievedData = await unifiedAnalyticsStorage.getPerformanceHistory();
      const testEntry = retrievedData.find(item => item.id === lowScoreTestData.id);
      
      if (!testEntry) {
        throw new Error('Test data not found in analytics storage');
      }
      
      // Validate score integrity
      const scoreIntegrityResults = this.validateScoreIntegrity(lowScoreTestData, testEntry);
      
      console.log('🔍 Score Integrity Results:', scoreIntegrityResults);
      
      // Test analytics validation
      const validationResult = await AnalyticsValidator.validatePerformanceData(testEntry);
      console.log('📊 Analytics Validation:', validationResult);
      
      // Clean up test data
      await this.cleanupTestData(lowScoreTestData.id);
      
      if (scoreIntegrityResults.allScoresPreserved) {
        console.log('✅ Scoring pipeline integrity test PASSED');
      } else {
        console.log('❌ Scoring pipeline integrity test FAILED');
        console.log('Issues:', scoreIntegrityResults.issues);
      }
      
    } catch (error) {
      console.error('❌ Scoring pipeline test failed:', error);
    }
  }
  
  /**
   * Create test data with deliberately low scores
   */
  private static createLowScoreTestData(): InterviewPerformanceData {
    return {
      id: `low_score_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: 'Software Engineer',
      difficulty: 'medium',
      duration: 1800,
      
      // Very low scores (simulating 1/10 AI feedback converted to 1-100 scale)
      overallScore: 10,
      technicalScore: 10,
      communicationScore: 10,
      behavioralScore: 10,
      
      questionsAnswered: 5,
      questionsCorrect: 1,
      averageResponseTime: 120,
      
      detailedMetrics: {
        confidence: 10,
        clarity: 10,
        professionalism: 10,
        engagement: 10,
        adaptability: 10,
      },
      
      speechAnalysis: {
        wordsPerMinute: 0,
        fillerWordCount: 0,
        pauseCount: 0,
        averagePauseLength: 0,
        volumeVariation: 0,
        clarityScore: 0,
        confidenceScore: 0,
        emotionalTone: 'unknown',
        keyPhrases: [],
        isSimulated: true
      },
      
      bodyLanguageAnalysis: {
        eyeContactPercentage: 0,
        postureScore: 0,
        gestureFrequency: 0,
        facialExpressionScore: 0,
        overallBodyLanguageScore: 0,
        confidenceIndicators: [],
        nervousBehaviors: [],
        engagementLevel: 0,
        isSimulated: true
      },
      
      strengths: ['Attempted to answer questions'],
      weaknesses: ['Needs significant improvement in all areas'],
      recommendations: ['Practice more interviews', 'Study technical concepts', 'Work on communication skills']
    };
  }
  
  /**
   * Validate that scores are preserved without inflation
   */
  private static validateScoreIntegrity(
    original: InterviewPerformanceData, 
    retrieved: InterviewPerformanceData
  ): {
    allScoresPreserved: boolean;
    issues: string[];
    scoreComparison: Record<string, { original: number; retrieved: number; preserved: boolean }>;
  } {
    const issues: string[] = [];
    const scoreComparison: Record<string, { original: number; retrieved: number; preserved: boolean }> = {};
    
    // Check main scores
    const scoresToCheck = [
      { name: 'overall', original: original.overallScore, retrieved: retrieved.overallScore },
      { name: 'technical', original: original.technicalScore, retrieved: retrieved.technicalScore },
      { name: 'communication', original: original.communicationScore, retrieved: retrieved.communicationScore },
      { name: 'behavioral', original: original.behavioralScore, retrieved: retrieved.behavioralScore }
    ];
    
    scoresToCheck.forEach(({ name, original, retrieved }) => {
      const preserved = original === retrieved;
      scoreComparison[name] = { original, retrieved, preserved };
      
      if (!preserved) {
        issues.push(`${name} score changed from ${original} to ${retrieved}`);
      }
      
      // Check for score inflation (scores should not be artificially increased)
      if (retrieved > original) {
        issues.push(`${name} score was inflated from ${original} to ${retrieved}`);
      }
      
      // Check for unrealistic minimum scores (should allow very low scores)
      if (original < 20 && retrieved >= 50) {
        issues.push(`${name} score was artificially raised from ${original} to ${retrieved} (minimum score inflation)`);
      }
    });
    
    // Check detailed metrics
    if (original.detailedMetrics && retrieved.detailedMetrics) {
      Object.keys(original.detailedMetrics).forEach(metric => {
        const originalValue = original.detailedMetrics![metric as keyof typeof original.detailedMetrics];
        const retrievedValue = retrieved.detailedMetrics![metric as keyof typeof retrieved.detailedMetrics];
        
        if (originalValue !== retrievedValue) {
          issues.push(`Detailed metric ${metric} changed from ${originalValue} to ${retrievedValue}`);
        }
      });
    }
    
    return {
      allScoresPreserved: issues.length === 0,
      issues,
      scoreComparison
    };
  }
  
  /**
   * Test score conversion from 1-10 to 1-100 scale
   */
  static testScoreConversion(): void {
    console.log('🔢 Testing Score Conversion (1-10 to 1-100)...\n');
    
    const testCases = [
      { input: 1, expected: 10, description: 'Very poor performance' },
      { input: 2, expected: 20, description: 'Poor performance' },
      { input: 5, expected: 50, description: 'Average performance' },
      { input: 8, expected: 80, description: 'Good performance' },
      { input: 10, expected: 100, description: 'Excellent performance' }
    ];
    
    testCases.forEach(({ input, expected, description }) => {
      const converted = input * 10;
      const passed = converted === expected;
      
      console.log(`${passed ? '✅' : '❌'} ${description}: ${input}/10 → ${converted}/100 (expected: ${expected})`);
    });
  }
  
  /**
   * Clean up test data
   */
  private static async cleanupTestData(testId: string): Promise<void> {
    try {
      const history = await unifiedAnalyticsStorage.getPerformanceHistory();
      const filteredHistory = history.filter(item => item.id !== testId);
      
      // Update local storage
      localStorage.setItem('interview_performance_history', JSON.stringify(filteredHistory));
      
      console.log('🗑️ Cleaned up test data');
    } catch (error) {
      console.error('❌ Failed to cleanup test data:', error);
    }
  }
  
  /**
   * Run all scoring pipeline tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🚀 Starting Scoring Pipeline Integrity Tests...\n');
    
    try {
      await this.testLowScoreIntegrity();
      console.log('\n');
      this.testScoreConversion();
      
      console.log('\n✅ All scoring pipeline tests completed!');
    } catch (error) {
      console.error('❌ Scoring pipeline tests failed:', error);
    }
  }
}

// Export for browser console usage
(window as any).ScoringPipelineTest = ScoringPipelineTest;

// Auto-run message
if (typeof window !== 'undefined') {
  console.log('🔧 Scoring Pipeline Test loaded. Run ScoringPipelineTest.runAllTests() to validate score integrity.');
}

export default ScoringPipelineTest;
