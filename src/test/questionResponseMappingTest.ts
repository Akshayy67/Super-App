/**
 * Test suite to validate question-response mapping in detailed interview history
 * Ensures actual interview questions are captured and displayed correctly
 */

import { DetailedInterviewAnalyzer } from '../types/detailedInterviewData';
import { InterviewPerformanceData, SavedMessage, InterviewQuestionData } from '../utils/performanceAnalytics';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  actualQuestions?: string[];
  expectedQuestions?: string[];
}

export class QuestionResponseMappingTest {
  
  /**
   * Create mock interview data with actual questions and messages
   */
  static createMockInterviewWithRealData(): InterviewPerformanceData {
    const questions: InterviewQuestionData[] = [
      {
        id: 'q1',
        question: 'Tell me about your experience with React development.',
        category: 'technical',
        timeLimit: 120,
        hints: ['Be specific', 'Include examples'],
        askedAt: '2024-01-15T10:00:00Z',
        answeredAt: '2024-01-15T10:02:00Z'
      },
      {
        id: 'q2',
        question: 'Describe a challenging project you worked on recently.',
        category: 'behavioral',
        timeLimit: 180,
        hints: ['Use STAR method', 'Be detailed'],
        askedAt: '2024-01-15T10:03:00Z',
        answeredAt: '2024-01-15T10:06:00Z'
      },
      {
        id: 'q3',
        question: 'How do you handle debugging complex issues?',
        category: 'technical',
        timeLimit: 150,
        hints: ['Explain your process', 'Give examples'],
        askedAt: '2024-01-15T10:07:00Z',
        answeredAt: '2024-01-15T10:09:30Z'
      }
    ];

    const messages: SavedMessage[] = [
      {
        role: 'assistant',
        content: 'Tell me about your experience with React development.',
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        role: 'user',
        content: 'I have been working with React for about 3 years now. I started with class components and then transitioned to functional components with hooks. I have built several large-scale applications including an e-commerce platform and a project management tool.',
        timestamp: '2024-01-15T10:02:00Z'
      },
      {
        role: 'assistant',
        content: 'Describe a challenging project you worked on recently.',
        timestamp: '2024-01-15T10:03:00Z'
      },
      {
        role: 'user',
        content: 'Recently, I worked on optimizing the performance of a React application that was experiencing slow load times. The challenge was identifying bottlenecks in a complex component tree. I used React DevTools profiler, implemented code splitting, and optimized re-renders using useMemo and useCallback.',
        timestamp: '2024-01-15T10:06:00Z'
      },
      {
        role: 'assistant',
        content: 'How do you handle debugging complex issues?',
        timestamp: '2024-01-15T10:07:00Z'
      },
      {
        role: 'user',
        content: 'My debugging approach is systematic. First, I reproduce the issue consistently. Then I use browser dev tools, console logs, and debugger statements to trace the problem. For React-specific issues, I use React DevTools. I also write unit tests to isolate the problem.',
        timestamp: '2024-01-15T10:09:30Z'
      }
    ];

    return {
      id: 'test_interview_123',
      timestamp: '2024-01-15T10:00:00Z',
      role: 'Frontend Developer',
      difficulty: 'Medium',
      duration: 600, // 10 minutes
      overallScore: 78,
      technicalScore: 82,
      communicationScore: 75,
      behavioralScore: 76,
      questionsAnswered: 3,
      questionsCorrect: 3,
      averageResponseTime: 120,
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
      speechAnalysis: {} as any,
      bodyLanguageAnalysis: {} as any,
      
      // The key part: actual interview session data
      interviewSession: {
        questions,
        messages,
        sessionType: 'custom',
        interviewType: 'Frontend Developer'
      }
    };
  }

  /**
   * Test question-response extraction
   */
  static testQuestionResponseExtraction(): TestResult {
    const mockInterview = this.createMockInterviewWithRealData();
    
    // Convert to detailed format
    const detailedSession = DetailedInterviewAnalyzer.convertToDetailedFormat(
      mockInterview,
      mockInterview.interviewSession?.messages || [],
      mockInterview.interviewSession?.questions || []
    );

    const extractedQuestions = detailedSession.questionResponses.map(qr => qr.question);
    const expectedQuestions = [
      'Tell me about your experience with React development.',
      'Describe a challenging project you worked on recently.',
      'How do you handle debugging complex issues?'
    ];

    const questionsMatch = extractedQuestions.length === expectedQuestions.length &&
                          extractedQuestions.every((q, i) => q === expectedQuestions[i]);

    return {
      testName: 'Question-Response Extraction',
      passed: questionsMatch,
      details: questionsMatch 
        ? `Successfully extracted ${extractedQuestions.length} questions`
        : `Expected ${expectedQuestions.length} questions, got ${extractedQuestions.length}`,
      actualQuestions: extractedQuestions,
      expectedQuestions
    };
  }

  /**
   * Test response content mapping
   */
  static testResponseContentMapping(): TestResult {
    const mockInterview = this.createMockInterviewWithRealData();
    
    const detailedSession = DetailedInterviewAnalyzer.convertToDetailedFormat(
      mockInterview,
      mockInterview.interviewSession?.messages || [],
      mockInterview.interviewSession?.questions || []
    );

    const responses = detailedSession.questionResponses.map(qr => qr.userResponse);
    const expectedResponseKeywords = [
      'React for about 3 years',
      'optimizing the performance',
      'debugging approach is systematic'
    ];

    const responsesMatch = expectedResponseKeywords.every((keyword, i) => 
      responses[i] && responses[i].includes(keyword)
    );

    return {
      testName: 'Response Content Mapping',
      passed: responsesMatch,
      details: responsesMatch 
        ? 'User responses correctly mapped to questions'
        : 'User responses do not match expected content',
      actualQuestions: responses,
      expectedQuestions: expectedResponseKeywords
    };
  }

  /**
   * Test category mapping
   */
  static testCategoryMapping(): TestResult {
    const mockInterview = this.createMockInterviewWithRealData();
    
    const detailedSession = DetailedInterviewAnalyzer.convertToDetailedFormat(
      mockInterview,
      mockInterview.interviewSession?.messages || [],
      mockInterview.interviewSession?.questions || []
    );

    const categories = detailedSession.questionResponses.map(qr => qr.category);
    const expectedCategories = ['technical', 'behavioral', 'technical'];

    const categoriesMatch = categories.length === expectedCategories.length &&
                           categories.every((cat, i) => cat === expectedCategories[i]);

    return {
      testName: 'Category Mapping',
      passed: categoriesMatch,
      details: categoriesMatch 
        ? 'Question categories correctly preserved'
        : `Expected categories ${expectedCategories.join(', ')}, got ${categories.join(', ')}`,
      actualQuestions: categories,
      expectedQuestions: expectedCategories
    };
  }

  /**
   * Test fallback behavior for interviews without detailed data
   */
  static testFallbackBehavior(): TestResult {
    const basicInterview: InterviewPerformanceData = {
      id: 'old_interview_456',
      timestamp: '2024-01-10T10:00:00Z',
      role: 'Software Engineer',
      difficulty: 'Hard',
      duration: 1800,
      overallScore: 65,
      technicalScore: 70,
      communicationScore: 60,
      behavioralScore: 65,
      questionsAnswered: 5,
      questionsCorrect: 3,
      averageResponseTime: 180,
      detailedMetrics: {
        confidence: 60,
        clarity: 65,
        professionalism: 70,
        engagement: 58,
        adaptability: 62
      },
      strengths: ['Good technical knowledge'],
      weaknesses: ['Needs to improve communication'],
      recommendations: ['Practice explaining concepts clearly'],
      speechAnalysis: {} as any,
      bodyLanguageAnalysis: {} as any
      // No interviewSession data - should trigger fallback
    };

    const detailedSession = DetailedInterviewAnalyzer.convertToDetailedFormat(
      basicInterview,
      [],
      []
    );

    const hasFallbackMessage = detailedSession.questionResponses.length === 1 &&
                              detailedSession.questionResponses[0].question.includes('No detailed question data available');

    return {
      testName: 'Fallback Behavior',
      passed: hasFallbackMessage,
      details: hasFallbackMessage 
        ? 'Correctly shows fallback message for interviews without detailed data'
        : 'Fallback behavior not working correctly',
      actualQuestions: detailedSession.questionResponses.map(qr => qr.question),
      expectedQuestions: ['No detailed question data available for this interview']
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
    console.log('🧪 Starting Question-Response Mapping Tests...');

    const results: TestResult[] = [
      this.testQuestionResponseExtraction(),
      this.testResponseContentMapping(),
      this.testCategoryMapping(),
      this.testFallbackBehavior()
    ];

    const passedTests = results.filter(r => r.passed).length;
    const allPassed = passedTests === results.length;

    const summary = `
🧪 Question-Response Mapping Test Results:
✅ Passed: ${passedTests}/${results.length} tests
${allPassed ? '🎉 ALL TESTS PASSED!' : '❌ Some tests failed'}

Test Results:
${results.map(r => `- ${r.testName}: ${r.passed ? '✅ PASS' : '❌ FAIL'} - ${r.details}`).join('\n')}

${allPassed ? 
  '🎯 The question-response mapping is working correctly. Users will now see their actual interview questions and responses in the detailed history.' :
  '⚠️ Some issues remain with the question-response mapping. Check the detailed results above.'
}`;

    console.log(summary);

    return {
      allPassed,
      results,
      summary
    };
  }
}

export default QuestionResponseMappingTest;
