/**
 * Test suite to validate the data validation fix
 * Ensures real interview data is properly recognized and not marked as simulated
 */

import { AnalyticsValidator } from '../utils/analyticsValidation';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  expectedQuality: 'real' | 'simulated';
  actualQuality: 'real' | 'simulated' | 'mixed';
}

export class DataValidationFixTest {
  
  /**
   * Create a realistic interview data sample (should be marked as REAL)
   */
  static createRealInterviewData(): InterviewPerformanceData {
    return {
      id: `interview_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: 'Software Engineer',
      difficulty: 'Medium',
      duration: 1800, // 30 minutes
      questionsAnswered: 5,
      overallScore: 72,
      technicalScore: 68,
      communicationScore: 75,
      behavioralScore: 74,
      recommendations: [
        'Practice explaining technical concepts more clearly',
        'Provide more specific examples in behavioral questions'
      ],
      detailedMetrics: {
        confidence: 70,
        clarity: 75,
        pace: 68,
        eyeContact: 80,
        posture: 72,
        gestures: 65,
        voiceStability: 78,
        responseTime: 45,
        vocabularyRange: 82,
        grammarAccuracy: 88
      },
      speechAnalysis: {
        wordsPerMinute: 145,
        pauseFrequency: 0.12,
        fillerWordCount: 8,
        volumeConsistency: 0.85,
        clarityScore: 75,
        confidenceLevel: 70,
        // Note: No isSimulated flag - should default to real
      },
      bodyLanguageAnalysis: {
        eyeContactPercentage: 80,
        postureScore: 72,
        gestureFrequency: 0.3,
        facialExpressionVariety: 6,
        overallBodyLanguageScore: 75,
        // Note: No isSimulated flag - should default to real
      }
    };
  }

  /**
   * Create explicitly simulated data (should be marked as SIMULATED)
   */
  static createSimulatedInterviewData(): InterviewPerformanceData {
    return {
      id: 'sample_demo_interview',
      timestamp: new Date().toISOString(),
      role: 'Sample Software Engineer',
      difficulty: 'Demo',
      duration: 1200,
      questionsAnswered: 3,
      overallScore: 95,
      technicalScore: 96,
      communicationScore: 94,
      behavioralScore: 97,
      recommendations: ['This is demo data'],
      detailedMetrics: {
        confidence: 95,
        clarity: 96,
        pace: 94,
        eyeContact: 97,
        posture: 95,
        gestures: 96,
        voiceStability: 95,
        responseTime: 30,
        vocabularyRange: 98,
        grammarAccuracy: 99
      },
      speechAnalysis: {
        wordsPerMinute: 150,
        pauseFrequency: 0.05,
        fillerWordCount: 0,
        volumeConsistency: 0.99,
        clarityScore: 96,
        confidenceLevel: 95,
        isSimulated: true // Explicitly marked as simulated
      } as any,
      bodyLanguageAnalysis: {
        eyeContactPercentage: 97,
        postureScore: 95,
        gestureFrequency: 0.4,
        facialExpressionVariety: 8,
        overallBodyLanguageScore: 96,
        isSimulated: true // Explicitly marked as simulated
      } as any
    };
  }

  /**
   * Create poor performance real data (should still be marked as REAL)
   */
  static createPoorPerformanceRealData(): InterviewPerformanceData {
    return {
      id: `poor_interview_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: 'Junior Developer',
      difficulty: 'Easy',
      duration: 900, // 15 minutes
      questionsAnswered: 3,
      overallScore: 25, // Very low score
      technicalScore: 20,
      communicationScore: 30,
      behavioralScore: 25,
      recommendations: [
        'Practice basic programming concepts',
        'Work on communication skills',
        'Prepare more examples'
      ],
      detailedMetrics: {
        confidence: 25,
        clarity: 30,
        pace: 20,
        eyeContact: 35,
        posture: 28,
        gestures: 22,
        voiceStability: 40,
        responseTime: 120,
        vocabularyRange: 45,
        grammarAccuracy: 55
      },
      speechAnalysis: {
        wordsPerMinute: 80, // Slow speaking
        pauseFrequency: 0.25, // Many pauses
        fillerWordCount: 25, // Many filler words
        volumeConsistency: 0.45, // Inconsistent volume
        clarityScore: 30,
        confidenceLevel: 25,
        // No isSimulated flag - should be real despite poor performance
      },
      bodyLanguageAnalysis: {
        eyeContactPercentage: 35, // Poor eye contact
        postureScore: 28, // Poor posture
        gestureFrequency: 0.1, // Few gestures
        facialExpressionVariety: 2, // Limited expressions
        overallBodyLanguageScore: 30,
        // No isSimulated flag - should be real despite poor performance
      }
    };
  }

  /**
   * Run comprehensive validation tests
   */
  static async runValidationTests(): Promise<{
    allPassed: boolean;
    results: TestResult[];
    summary: string;
  }> {
    const results: TestResult[] = [];

    console.log('🧪 Starting Data Validation Fix Tests...');

    // Test 1: Real interview data should be marked as REAL
    const realData = this.createRealInterviewData();
    const realValidation = AnalyticsValidator.validatePerformanceData(realData);
    results.push({
      testName: 'Real Interview Data Recognition',
      passed: realValidation.dataQuality === 'real',
      details: `Expected: real, Got: ${realValidation.dataQuality}. Issues: ${realValidation.issues.join(', ') || 'None'}`,
      expectedQuality: 'real',
      actualQuality: realValidation.dataQuality
    });

    // Test 2: Simulated data should be marked as SIMULATED
    const simulatedData = this.createSimulatedInterviewData();
    const simulatedValidation = AnalyticsValidator.validatePerformanceData(simulatedData);
    results.push({
      testName: 'Simulated Data Detection',
      passed: simulatedValidation.dataQuality === 'simulated',
      details: `Expected: simulated, Got: ${simulatedValidation.dataQuality}. Issues: ${simulatedValidation.issues.join(', ') || 'None'}`,
      expectedQuality: 'simulated',
      actualQuality: simulatedValidation.dataQuality
    });

    // Test 3: Poor performance real data should still be marked as REAL
    const poorData = this.createPoorPerformanceRealData();
    const poorValidation = AnalyticsValidator.validatePerformanceData(poorData);
    results.push({
      testName: 'Poor Performance Real Data Recognition',
      passed: poorValidation.dataQuality === 'real',
      details: `Expected: real, Got: ${poorValidation.dataQuality}. Issues: ${poorValidation.issues.join(', ') || 'None'}`,
      expectedQuality: 'real',
      actualQuality: poorValidation.dataQuality
    });

    // Test 4: Quick validation with mixed data
    console.log('🧪 Testing quick validation with mixed data...');
    
    // Create a temporary test to simulate the quick validation
    const testData = [realData, simulatedData, poorData];
    const realCount = testData.filter(item => {
      const validation = AnalyticsValidator.validatePerformanceData(item);
      return validation.dataQuality === 'real';
    }).length;

    const expectedRealCount = 2; // realData and poorData should be real
    results.push({
      testName: 'Quick Validation Real Data Count',
      passed: realCount === expectedRealCount,
      details: `Expected ${expectedRealCount} real interviews, found ${realCount}`,
      expectedQuality: 'real',
      actualQuality: realCount === expectedRealCount ? 'real' : 'simulated'
    });

    // Calculate overall results
    const passedTests = results.filter(r => r.passed).length;
    const allPassed = passedTests === results.length;

    const summary = `
🧪 Data Validation Fix Test Results:
✅ Passed: ${passedTests}/${results.length} tests
${allPassed ? '🎉 ALL TESTS PASSED!' : '❌ Some tests failed'}

Key Findings:
- Real interview data recognition: ${results[0].passed ? '✅' : '❌'}
- Simulated data detection: ${results[1].passed ? '✅' : '❌'}
- Poor performance data handling: ${results[2].passed ? '✅' : '❌'}
- Quick validation accuracy: ${results[3].passed ? '✅' : '❌'}

${allPassed ? 
  'The data validation fix is working correctly. Real interview data should now be properly recognized in the analytics dashboard.' :
  'Some issues remain with the data validation logic. Check the detailed results above.'
}`;

    console.log(summary);

    return {
      allPassed,
      results,
      summary
    };
  }

  /**
   * Test the specific issue mentioned by the user
   */
  static async testUserScenario(): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log('🔍 Testing user scenario: Real data showing as "No Real Data" warning...');

    try {
      // Create realistic interview data that matches what a user would have
      const userInterviewData = {
        id: `user_interview_${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: 'Frontend Developer',
        difficulty: 'Medium',
        duration: 2100, // 35 minutes
        questionsAnswered: 6,
        overallScore: 67,
        technicalScore: 72,
        communicationScore: 65,
        behavioralScore: 64,
        recommendations: [
          'Practice system design questions',
          'Improve confidence in technical explanations'
        ],
        detailedMetrics: {
          confidence: 65,
          clarity: 68,
          pace: 70,
          eyeContact: 72,
          posture: 66,
          gestures: 60,
          voiceStability: 75,
          responseTime: 55,
          vocabularyRange: 78,
          grammarAccuracy: 82
        },
        speechAnalysis: {
          wordsPerMinute: 135,
          pauseFrequency: 0.15,
          fillerWordCount: 12,
          volumeConsistency: 0.78,
          clarityScore: 68,
          confidenceLevel: 65
          // No isSimulated flag - this is real user data
        },
        bodyLanguageAnalysis: {
          eyeContactPercentage: 72,
          postureScore: 66,
          gestureFrequency: 0.25,
          facialExpressionVariety: 5,
          overallBodyLanguageScore: 68
          // No isSimulated flag - this is real user data
        }
      };

      const validation = AnalyticsValidator.validatePerformanceData(userInterviewData);
      
      if (validation.dataQuality === 'real') {
        return {
          success: true,
          message: '✅ SUCCESS: User interview data is correctly recognized as REAL data. The "No Real Data" warning should no longer appear.'
        };
      } else {
        return {
          success: false,
          message: `❌ FAILED: User interview data is incorrectly marked as ${validation.dataQuality}. Issues: ${validation.issues.join(', ')}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ ERROR: Failed to test user scenario: ${error}`
      };
    }
  }
}

// Export for use in other test files
export default DataValidationFixTest;
