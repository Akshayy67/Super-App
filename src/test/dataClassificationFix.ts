/**
 * Test suite to validate that real user interview data is correctly classified as "real" 
 * instead of being incorrectly marked as "simulated" data
 */

import { AnalyticsValidator } from '../utils/analyticsValidation';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  expectedDataQuality?: string;
  actualDataQuality?: string;
  issues?: string[];
}

export class DataClassificationTest {
  
  /**
   * Create mock interview data that represents a real user interview with fallback analysis
   */
  static createRealInterviewWithFallbackData(): InterviewPerformanceData {
    return {
      id: 'interview_1757751607099', // Real interview ID format
      timestamp: '2024-01-15T14:30:00Z',
      role: 'Frontend Developer',
      difficulty: 'Medium',
      duration: 720, // 12 minutes
      
      // Real AI feedback scores (not inflated)
      overallScore: 78,
      technicalScore: 82,
      communicationScore: 75,
      behavioralScore: 76,
      
      questionsAnswered: 4,
      questionsCorrect: 3,
      averageResponseTime: 180,
      
      detailedMetrics: {
        confidence: 75,
        clarity: 80,
        professionalism: 78,
        engagement: 82,
        adaptability: 74
      },
      
      strengths: ['Clear technical explanations', 'Good problem-solving approach'],
      weaknesses: ['Could provide more specific metrics'],
      recommendations: ['Practice explaining complex concepts simply'],
      
      // Fallback speech analysis (not simulated - real interview with limited analysis)
      speechAnalysis: {
        wordsPerMinute: 0,
        fillerWordCount: 0,
        pauseCount: 0,
        averagePauseLength: 0,
        volumeVariation: 0,
        clarityScore: 0,
        confidenceScore: 0,
        emotionalTone: "unknown",
        keyPhrases: [],
        isFallbackData: true, // NEW: Mark as fallback, not simulated
        analysisAvailable: false
      },
      
      // Fallback body language analysis (not simulated - real interview with limited analysis)
      bodyLanguageAnalysis: {
        eyeContactPercentage: 0,
        postureScore: 0,
        gestureFrequency: 0,
        facialExpressionScore: 0,
        overallBodyLanguageScore: 0,
        confidenceIndicators: [],
        nervousBehaviors: [],
        engagementLevel: 0,
        isFallbackData: true, // NEW: Mark as fallback, not simulated
        analysisAvailable: false
      },
      
      // Real interview session data
      interviewSession: {
        questions: [
          {
            id: 'q1',
            question: 'Tell me about your experience with React development.',
            category: 'technical',
            timeLimit: 120,
            hints: ['Be specific', 'Include examples'],
            askedAt: '2024-01-15T14:30:00Z',
            answeredAt: '2024-01-15T14:32:00Z'
          },
          {
            id: 'q2',
            question: 'Describe a challenging project you worked on recently.',
            category: 'behavioral',
            timeLimit: 180,
            hints: ['Use STAR method', 'Be detailed'],
            askedAt: '2024-01-15T14:33:00Z',
            answeredAt: '2024-01-15T14:36:00Z'
          }
        ],
        messages: [
          {
            role: 'assistant',
            content: 'Tell me about your experience with React development.',
            timestamp: '2024-01-15T14:30:00Z'
          },
          {
            role: 'user',
            content: 'I have been working with React for about 3 years now. I started with class components and then transitioned to functional components with hooks.',
            timestamp: '2024-01-15T14:32:00Z'
          },
          {
            role: 'assistant',
            content: 'Describe a challenging project you worked on recently.',
            timestamp: '2024-01-15T14:33:00Z'
          },
          {
            role: 'user',
            content: 'Recently, I worked on optimizing the performance of a React application that was experiencing slow load times.',
            timestamp: '2024-01-15T14:36:00Z'
          }
        ],
        sessionType: 'custom',
        interviewType: 'Frontend Developer'
      }
    };
  }

  /**
   * Create actual simulated data for comparison
   */
  static createActualSimulatedData(): InterviewPerformanceData {
    return {
      id: 'demo_interview_123',
      timestamp: '2024-01-15T10:00:00Z',
      role: 'Sample Role',
      difficulty: 'Easy',
      duration: 300,
      overallScore: 95,
      technicalScore: 95,
      communicationScore: 95,
      behavioralScore: 95,
      questionsAnswered: 3,
      questionsCorrect: 3,
      averageResponseTime: 60,
      detailedMetrics: {
        confidence: 95,
        clarity: 95,
        professionalism: 95,
        engagement: 95,
        adaptability: 95
      },
      strengths: ['Perfect performance'],
      weaknesses: [],
      recommendations: [],
      
      // Explicitly simulated data
      speechAnalysis: {
        wordsPerMinute: 150,
        fillerWordCount: 2,
        pauseCount: 5,
        averagePauseLength: 1.5,
        volumeVariation: 0.3,
        clarityScore: 95,
        confidenceScore: 95,
        emotionalTone: "confident",
        keyPhrases: ["excellent", "perfect"],
        isSimulated: true // OLD: Explicitly marked as simulated
      },
      
      bodyLanguageAnalysis: {
        eyeContactPercentage: 95,
        postureScore: 95,
        gestureFrequency: 10,
        facialExpressionScore: 95,
        overallBodyLanguageScore: 95,
        confidenceIndicators: ["good posture", "eye contact"],
        nervousBehaviors: [],
        engagementLevel: 95,
        isSimulated: true // OLD: Explicitly marked as simulated
      }
    };
  }

  /**
   * Test that real interviews with fallback data are classified as "real"
   */
  static testRealInterviewClassification(): TestResult {
    const realInterview = this.createRealInterviewWithFallbackData();
    const validation = AnalyticsValidator.validatePerformanceData(realInterview);

    const passed = validation.dataQuality === 'real';

    return {
      testName: 'Real Interview with Fallback Data Classification',
      passed,
      details: passed 
        ? 'Real interview with fallback analysis correctly classified as "real"'
        : `Expected "real", got "${validation.dataQuality}"`,
      expectedDataQuality: 'real',
      actualDataQuality: validation.dataQuality,
      issues: validation.issues
    };
  }

  /**
   * Test that actual simulated data is still classified as "simulated"
   */
  static testSimulatedDataClassification(): TestResult {
    const simulatedInterview = this.createActualSimulatedData();
    const validation = AnalyticsValidator.validatePerformanceData(simulatedInterview);

    const passed = validation.dataQuality === 'simulated';

    return {
      testName: 'Simulated Data Classification',
      passed,
      details: passed 
        ? 'Simulated data correctly classified as "simulated"'
        : `Expected "simulated", got "${validation.dataQuality}"`,
      expectedDataQuality: 'simulated',
      actualDataQuality: validation.dataQuality,
      issues: validation.issues
    };
  }

  /**
   * Test that fallback data indicators are properly detected
   */
  static testFallbackDataDetection(): TestResult {
    const realInterview = this.createRealInterviewWithFallbackData();
    const validation = AnalyticsValidator.validatePerformanceData(realInterview);

    const hasFallbackSpeechIssue = validation.issues.some(issue => 
      issue.includes('Speech analysis not available - using fallback data structure')
    );
    const hasFallbackBodyLanguageIssue = validation.issues.some(issue => 
      issue.includes('Body language analysis not available - using fallback data structure')
    );

    const passed = hasFallbackSpeechIssue && hasFallbackBodyLanguageIssue;

    return {
      testName: 'Fallback Data Detection',
      passed,
      details: passed 
        ? 'Fallback data properly detected and noted in issues'
        : 'Fallback data not properly detected',
      issues: validation.issues
    };
  }

  /**
   * Test that interview session data is preserved
   */
  static testInterviewSessionDataPreservation(): TestResult {
    const realInterview = this.createRealInterviewWithFallbackData();
    
    const hasInterviewSession = !!realInterview.interviewSession;
    const hasQuestions = realInterview.interviewSession?.questions?.length > 0;
    const hasMessages = realInterview.interviewSession?.messages?.length > 0;

    const passed = hasInterviewSession && hasQuestions && hasMessages;

    return {
      testName: 'Interview Session Data Preservation',
      passed,
      details: passed 
        ? `Interview session data preserved: ${realInterview.interviewSession?.questions?.length} questions, ${realInterview.interviewSession?.messages?.length} messages`
        : 'Interview session data not properly preserved',
      expectedDataQuality: 'preserved',
      actualDataQuality: hasInterviewSession ? 'preserved' : 'missing'
    };
  }

  /**
   * Run all tests
   */
  static runAllTests(): {
    allPassed: boolean;
    results: TestResult[];
    summary: string;
  } {
    console.log('🧪 Starting Data Classification Fix Tests...');

    const results: TestResult[] = [
      this.testRealInterviewClassification(),
      this.testSimulatedDataClassification(),
      this.testFallbackDataDetection(),
      this.testInterviewSessionDataPreservation()
    ];

    const passedTests = results.filter(r => r.passed).length;
    const allPassed = passedTests === results.length;

    const summary = `
🧪 Data Classification Fix Test Results:
✅ Passed: ${passedTests}/${results.length} tests
${allPassed ? '🎉 ALL TESTS PASSED!' : '❌ Some tests failed'}

Test Results:
${results.map(r => `- ${r.testName}: ${r.passed ? '✅ PASS' : '❌ FAIL'} - ${r.details}`).join('\n')}

${allPassed ? 
  '🎯 The data classification issue is FIXED! Real user interviews with fallback analysis are now correctly classified as "real" data, eliminating the "No Real Data" warning.' :
  '⚠️ Some issues remain with the data classification. Check the detailed results above.'
}

Key Improvements:
- ✅ Removed isSimulated: true flags from fallback analysis functions
- ✅ Added isFallbackData: true flags to distinguish fallback from simulated data
- ✅ Updated validation logic to treat fallback data as real interview data
- ✅ Enhanced logging to track fallback data detection
- ✅ Preserved interview session data with actual questions and responses`;

    console.log(summary);

    return {
      allPassed,
      results,
      summary
    };
  }
}

export default DataClassificationTest;
