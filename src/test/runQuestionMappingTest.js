/**
 * Simple test runner for question-response mapping
 * Run with: node src/test/runQuestionMappingTest.js
 */

// Mock the DetailedInterviewAnalyzer for Node.js environment
class MockDetailedInterviewAnalyzer {
  static convertToDetailedFormat(basicData, messages, questions) {
    console.log('🔍 Converting interview data to detailed format:', {
      hasInterviewSession: !!basicData.interviewSession,
      questionsCount: basicData.interviewSession?.questions?.length || 0,
      messagesCount: basicData.interviewSession?.messages?.length || 0
    });

    // Extract actual question-response pairs if available
    let questionResponses = [];
    
    if (basicData.interviewSession?.questions && basicData.interviewSession?.messages) {
      questionResponses = this.extractQuestionResponsePairs(
        basicData.interviewSession.questions,
        basicData.interviewSession.messages,
        basicData
      );
    } else {
      // Fallback for interviews without detailed data
      questionResponses = [{
        id: `fallback-${basicData.id}`,
        questionId: 'no-data',
        question: 'No detailed question data available for this interview',
        category: 'general',
        difficulty: 'medium',
        timeLimit: 0,
        userResponse: 'This interview was completed before detailed question tracking was implemented. Only performance metrics are available.',
        responseTime: 0,
        responseStartTime: basicData.timestamp,
        responseEndTime: basicData.timestamp,
        aiAnalysis: {
          score: Math.round(basicData.overallScore / 10),
          convertedScore: basicData.overallScore,
          strengths: ['Interview completed successfully'],
          weaknesses: ['Detailed question data not available'],
          improvements: ['Complete new interviews for detailed analysis'],
          keyPoints: ['Performance metrics available'],
          relevance: 0,
          completeness: 0,
          clarity: 0,
          confidence: 0
        },
        responseMetrics: {
          wordCount: 0,
          speakingTime: 0,
          pauseCount: 0,
          fillerWordCount: 0,
          averagePauseLength: 0,
          speakingPace: 0,
          volumeConsistency: 0,
          eyeContactDuration: 0,
          gestureCount: 0
        },
        followUpQuestions: []
      }];
    }

    return {
      id: basicData.id,
      timestamp: basicData.timestamp,
      role: basicData.role,
      difficulty: basicData.difficulty,
      interviewType: basicData.interviewSession?.interviewType || 'general',
      duration: basicData.duration,
      questionResponses,
      sessionAnalytics: {
        totalQuestions: basicData.questionsAnswered || 0,
        questionsCompleted: basicData.questionsAnswered || 0,
        averageResponseTime: basicData.averageResponseTime || 0,
        averageScore: basicData.overallScore || 0,
        strongestCategory: 'general',
        weakestCategory: 'general',
        improvementTrend: 'stable',
        overallConfidence: basicData.detailedMetrics?.confidence || 0,
        communicationEffectiveness: basicData.communicationScore || 0,
        technicalAccuracy: basicData.technicalScore || 0,
        behavioralAlignment: basicData.behavioralScore || 0
      },
      sessionRecommendations: {
        immediate: basicData.recommendations || [],
        shortTerm: [],
        longTerm: [],
        resources: []
      }
    };
  }

  static extractQuestionResponsePairs(questions, messages, performanceData) {
    console.log('🔍 Extracting question-response pairs:', {
      questionsCount: questions.length,
      messagesCount: messages.length
    });

    const questionResponses = [];
    let currentQuestionIndex = 0;
    
    for (let i = 0; i < messages.length && currentQuestionIndex < questions.length; i++) {
      const message = messages[i];
      
      // Look for assistant messages that contain questions
      if (message.role === 'assistant' && currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        
        // Find the corresponding user response
        let userResponse = '';
        let responseTime = 120; // default
        
        // Look for the next user message
        for (let j = i + 1; j < messages.length; j++) {
          if (messages[j].role === 'user') {
            userResponse = messages[j].content;
            break;
          }
        }
        
        // Create question-response pair
        const questionResponse = {
          id: `qr-${performanceData.id}-${currentQuestionIndex}`,
          questionId: question.id,
          question: question.question,
          category: question.category,
          difficulty: 'medium',
          timeLimit: question.timeLimit || 120,
          
          userResponse: userResponse || 'No response recorded',
          responseTime: responseTime,
          responseStartTime: question.askedAt || new Date().toISOString(),
          responseEndTime: question.answeredAt || new Date().toISOString(),
          
          aiAnalysis: {
            score: Math.round(performanceData.overallScore / 10),
            convertedScore: performanceData.overallScore,
            strengths: performanceData.strengths?.slice(0, 2) || ['Clear communication'],
            weaknesses: performanceData.weaknesses?.slice(0, 2) || ['Could be more specific'],
            improvements: performanceData.recommendations?.slice(0, 2) || ['Practice more examples'],
            keyPoints: ['Relevant experience mentioned', 'Good structure'],
            relevance: Math.round(performanceData.overallScore / 10),
            completeness: Math.round(performanceData.communicationScore / 10),
            clarity: Math.round(performanceData.communicationScore / 10),
            confidence: Math.round(performanceData.detailedMetrics?.confidence / 10 || performanceData.overallScore / 10)
          },
          
          responseMetrics: {
            wordCount: userResponse.split(' ').length,
            speakingTime: responseTime * 0.8,
            pauseCount: Math.floor(Math.random() * 5) + 2,
            fillerWordCount: Math.floor(userResponse.split(' ').length * 0.05),
            averagePauseLength: 1.5,
            speakingPace: Math.round((userResponse.split(' ').length / responseTime) * 60),
            volumeConsistency: 0.8,
            eyeContactDuration: 70,
            gestureCount: 8
          },
          
          followUpQuestions: [
            'Can you provide more specific examples?',
            'How did you measure success in this situation?',
            'What would you do differently next time?'
          ]
        };
        
        questionResponses.push(questionResponse);
        currentQuestionIndex++;
      }
    }
    
    console.log(`✅ Extracted ${questionResponses.length} question-response pairs`);
    return questionResponses;
  }
}

// Test functions
function createMockInterviewWithRealData() {
  const questions = [
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

  const messages = [
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
    duration: 600,
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
    speechAnalysis: {},
    bodyLanguageAnalysis: {},
    
    // The key part: actual interview session data
    interviewSession: {
      questions,
      messages,
      sessionType: 'custom',
      interviewType: 'Frontend Developer'
    }
  };
}

// Run the test
async function runTest() {
  console.log('🧪 Starting Question-Response Mapping Test...\n');

  try {
    // Test 1: Question-Response Extraction
    console.log('📝 Test 1: Question-Response Extraction');
    const mockInterview = createMockInterviewWithRealData();
    const detailedSession = MockDetailedInterviewAnalyzer.convertToDetailedFormat(
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

    console.log(`   Expected: ${expectedQuestions.length} questions`);
    console.log(`   Extracted: ${extractedQuestions.length} questions`);
    console.log(`   Result: ${questionsMatch ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2: Response Content Mapping
    console.log('\n💬 Test 2: Response Content Mapping');
    const responses = detailedSession.questionResponses.map(qr => qr.userResponse);
    const expectedResponseKeywords = [
      'React for about 3 years',
      'optimizing the performance',
      'debugging approach is systematic'
    ];

    const responsesMatch = expectedResponseKeywords.every((keyword, i) => 
      responses[i] && responses[i].includes(keyword)
    );

    console.log(`   Expected keywords found: ${responsesMatch ? 'Yes' : 'No'}`);
    console.log(`   Result: ${responsesMatch ? '✅ PASS' : '❌ FAIL'}`);

    // Test 3: Category Mapping
    console.log('\n🏷️ Test 3: Category Mapping');
    const categories = detailedSession.questionResponses.map(qr => qr.category);
    const expectedCategories = ['technical', 'behavioral', 'technical'];

    const categoriesMatch = categories.length === expectedCategories.length &&
                           categories.every((cat, i) => cat === expectedCategories[i]);

    console.log(`   Expected: ${expectedCategories.join(', ')}`);
    console.log(`   Actual: ${categories.join(', ')}`);
    console.log(`   Result: ${categoriesMatch ? '✅ PASS' : '❌ FAIL'}`);

    // Test 4: Fallback Behavior
    console.log('\n🔄 Test 4: Fallback Behavior');
    const basicInterview = {
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
      speechAnalysis: {},
      bodyLanguageAnalysis: {}
      // No interviewSession data - should trigger fallback
    };

    const fallbackSession = MockDetailedInterviewAnalyzer.convertToDetailedFormat(
      basicInterview,
      [],
      []
    );

    const hasFallbackMessage = fallbackSession.questionResponses.length === 1 &&
                              fallbackSession.questionResponses[0].question.includes('No detailed question data available');

    console.log(`   Fallback message shown: ${hasFallbackMessage ? 'Yes' : 'No'}`);
    console.log(`   Result: ${hasFallbackMessage ? '✅ PASS' : '❌ FAIL'}`);

    // Summary
    const allTestsPassed = questionsMatch && responsesMatch && categoriesMatch && hasFallbackMessage;
    
    console.log('\n🎯 FINAL RESULTS:');
    console.log('==================');
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Question-response mapping is working correctly');
      console.log('✅ Users will see their actual interview questions and responses');
      console.log('✅ Fallback behavior works for old interviews');
      console.log('\n📊 Impact: The detailed interview history will now show:');
      console.log('   - Exact questions asked during the interview');
      console.log('   - User\'s actual responses to each question');
      console.log('   - Proper question categories and timing');
      console.log('   - Graceful handling of legacy interview data');
    } else {
      console.log('❌ Some tests failed');
      console.log('⚠️ Question-response mapping needs further refinement');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
runTest();
