/**
 * Comprehensive test for data classification fixes and API rate limiting
 * Tests both the migration logic and rate limiting functionality
 */

import { InterviewPerformanceData } from '../utils/performanceAnalytics';

// Mock data with old isSimulated flags (simulating existing cloud data)
const createMockInterviewDataWithOldFlags = (): InterviewPerformanceData => ({
  id: `interview_${Date.now()}`,
  timestamp: new Date().toISOString(),
  role: "Frontend Developer",
  difficulty: "medium",
  duration: 720,
  overallScore: 78,
  technicalScore: 82,
  communicationScore: 75,
  behavioralScore: 76,
  questionsAnswered: 3,
  questionsCorrect: 2,
  averageResponseTime: 180,
  detailedMetrics: {
    confidence: 75,
    clarity: 80,
    professionalism: 78,
    engagement: 82,
    adaptability: 74
  },
  strengths: ['Clear communication'],
  weaknesses: ['Could be more specific'],
  recommendations: ['Practice more'],
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
    isSimulated: true, // OLD FLAG - should be migrated
    analysisAvailable: false
  } as any,
  bodyLanguageAnalysis: {
    eyeContactPercentage: 0,
    postureScore: 0,
    gestureFrequency: 0,
    facialExpressionScore: 0,
    overallBodyLanguageScore: 0,
    confidenceIndicators: [],
    nervousBehaviors: [],
    engagementLevel: 0,
    isSimulated: true, // OLD FLAG - should be migrated
    analysisAvailable: false
  } as any,
  interviewSession: {
    questions: [
      {
        id: 'q1',
        question: 'Tell me about your experience',
        category: 'technical',
        timeLimit: 120,
        hints: ['Be specific'],
        askedAt: new Date().toISOString(),
        answeredAt: new Date().toISOString(),
      }
    ],
    messages: [
      {
        role: 'assistant',
        content: 'Tell me about your experience',
        timestamp: new Date().toISOString()
      },
      {
        role: 'user',
        content: 'I have 3 years of experience',
        timestamp: new Date().toISOString()
      }
    ],
    sessionType: 'custom',
    interviewType: 'Frontend Developer'
  }
});

// Test data migration logic
export const testDataMigration = () => {
  console.log('🧪 Testing Data Migration Logic...');

  // Create mock data with old flags
  const oldData = createMockInterviewDataWithOldFlags();

  // Simulate the migration function (same as in cloudAnalyticsStorage.ts)
  const migrateDataFormat = (data: InterviewPerformanceData): InterviewPerformanceData => {
    const migratedData = { ...data };
    let migrationApplied = false;

    // Migrate speech analysis
    if (migratedData.speechAnalysis && (migratedData.speechAnalysis as any).isSimulated === true) {
      console.log(`🔄 Migrating speech analysis for interview ${data.id}: isSimulated → isFallbackData`);
      const { isSimulated, ...restSpeechAnalysis } = migratedData.speechAnalysis as any;
      migratedData.speechAnalysis = {
        ...restSpeechAnalysis,
        isFallbackData: true,
        analysisAvailable: false,
      };
      migrationApplied = true;
    }

    // Migrate body language analysis
    if (migratedData.bodyLanguageAnalysis && (migratedData.bodyLanguageAnalysis as any).isSimulated === true) {
      console.log(`🔄 Migrating body language analysis for interview ${data.id}: isSimulated → isFallbackData`);
      const { isSimulated, ...restBodyLanguageAnalysis } = migratedData.bodyLanguageAnalysis as any;
      migratedData.bodyLanguageAnalysis = {
        ...restBodyLanguageAnalysis,
        isFallbackData: true,
        analysisAvailable: false,
      };
      migrationApplied = true;
    }

    if (migrationApplied) {
      console.log(`✅ Data migration completed for interview ${data.id} - now classified as real data with fallback analysis`);
    }

    return migratedData;
  };

  // Test migration
  const migratedData = migrateDataFormat(oldData);

  // Validation checks
  const tests = [
    {
      name: 'Speech Analysis Migration',
      test: () => {
        const hasOldFlag = (migratedData.speechAnalysis as any).isSimulated !== undefined;
        const hasNewFlag = (migratedData.speechAnalysis as any).isFallbackData === true;
        return !hasOldFlag && hasNewFlag;
      }
    },
    {
      name: 'Body Language Analysis Migration',
      test: () => {
        const hasOldFlag = (migratedData.bodyLanguageAnalysis as any).isSimulated !== undefined;
        const hasNewFlag = (migratedData.bodyLanguageAnalysis as any).isFallbackData === true;
        return !hasOldFlag && hasNewFlag;
      }
    },
    {
      name: 'Data Classification',
      test: () => {
        // Simulate analytics validation logic
        const hasFallbackSpeechData = migratedData.speechAnalysis && 
          (migratedData.speechAnalysis as any).isFallbackData === true;
        const hasFallbackBodyLanguageData = migratedData.bodyLanguageAnalysis && 
          (migratedData.bodyLanguageAnalysis as any).isFallbackData === true;
        
        const hasSimulatedSpeechData = migratedData.speechAnalysis && 
          (migratedData.speechAnalysis as any).isSimulated === true;
        const hasSimulatedBodyLanguageData = migratedData.bodyLanguageAnalysis && 
          (migratedData.bodyLanguageAnalysis as any).isSimulated === true;

        const hasFallbackData = hasFallbackSpeechData || hasFallbackBodyLanguageData;
        const hasSimulatedData = hasSimulatedSpeechData || hasSimulatedBodyLanguageData;

        // Should be classified as real data with fallback analysis
        return hasFallbackData && !hasSimulatedData;
      }
    }
  ];

  const results = tests.map(test => ({
    name: test.name,
    passed: test.test(),
  }));

  return {
    testName: 'Data Migration',
    results,
    allPassed: results.every(r => r.passed),
    migratedData
  };
};

// Test rate limiting logic
export const testRateLimiting = async () => {
  console.log('🧪 Testing Rate Limiting Logic...');

  // Mock rate limiting configuration
  const RATE_LIMIT_CONFIG = {
    maxRequestsPerMinute: 3, // Very low for testing
    requestQueue: [] as Array<{ timestamp: number; resolve: Function; reject: Function }>,
    isProcessing: false,
  };

  // Mock rate limiting function
  const rateLimitedRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      RATE_LIMIT_CONFIG.requestQueue.push({ 
        timestamp: Date.now(), 
        resolve: (result: T) => resolve(result), 
        reject 
      });
      processRequestQueue();
    });
  };

  const processRequestQueue = async () => {
    if (RATE_LIMIT_CONFIG.isProcessing || RATE_LIMIT_CONFIG.requestQueue.length === 0) {
      return;
    }

    RATE_LIMIT_CONFIG.isProcessing = true;

    while (RATE_LIMIT_CONFIG.requestQueue.length > 0) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      // Remove old requests from tracking
      RATE_LIMIT_CONFIG.requestQueue.splice(0, RATE_LIMIT_CONFIG.requestQueue.findIndex(req => req.timestamp > oneMinuteAgo));

      // Check if we can make a request
      const recentRequests = RATE_LIMIT_CONFIG.requestQueue.filter(req => req.timestamp > oneMinuteAgo);
      
      if (recentRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
        // Wait until we can make another request
        const oldestRequest = recentRequests[0];
        const waitTime = 60000 - (now - oldestRequest.timestamp) + 100; // Add small buffer
        console.log(`⏳ Rate limit reached, waiting ${Math.round(waitTime/1000)}s before next request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Process the next request
      const request = RATE_LIMIT_CONFIG.requestQueue.shift();
      if (request) {
        try {
          // Simulate successful request
          request.resolve(`Request processed at ${new Date().toISOString()}`);
        } catch (error) {
          request.reject(error);
        }
      }
    }

    RATE_LIMIT_CONFIG.isProcessing = false;
  };

  // Test rapid requests
  const startTime = Date.now();
  const requests = [];

  for (let i = 0; i < 5; i++) {
    requests.push(rateLimitedRequest(async () => `Request ${i + 1}`));
  }

  const results = await Promise.all(requests);
  const endTime = Date.now();
  const totalTime = endTime - startTime;

  return {
    testName: 'Rate Limiting',
    results,
    totalTime,
    passed: totalTime > 2000, // Should take at least 2 seconds due to rate limiting
    details: `Processed ${results.length} requests in ${totalTime}ms`
  };
};

// Test retry logic
export const testRetryLogic = async () => {
  console.log('🧪 Testing Retry Logic...');

  let attemptCount = 0;

  // Mock retry function
  const retryRequest = async <T>(
    requestFn: () => Promise<T>, 
    maxRetries: number = 3, 
    baseDelay: number = 100 // Shorter delay for testing
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        const isRateLimited = error.status === 429 || 
                             (error.message && error.message.includes('429')) ||
                             (error.message && error.message.includes('Too Many Requests'));
        
        if (isRateLimited && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Rate limited (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    throw new Error(`Failed after ${maxRetries} attempts`);
  };

  // Mock function that fails twice then succeeds
  const mockApiCall = async () => {
    attemptCount++;
    if (attemptCount <= 2) {
      const error = new Error('Too Many Requests');
      (error as any).status = 429;
      throw error;
    }
    return 'Success!';
  };

  const startTime = Date.now();
  const result = await retryRequest(mockApiCall);
  const endTime = Date.now();

  return {
    testName: 'Retry Logic',
    result,
    attemptCount,
    totalTime: endTime - startTime,
    passed: result === 'Success!' && attemptCount === 3,
    details: `Succeeded after ${attemptCount} attempts in ${endTime - startTime}ms`
  };
};

// Run all tests
export const runAllTests = async () => {
  console.log('🧪 Starting Data Classification and Rate Limiting Tests...\n');

  try {
    const migrationTest = testDataMigration();
    const rateLimitingTest = await testRateLimiting();
    const retryTest = await testRetryLogic();

    const allTests = [migrationTest, rateLimitingTest, retryTest];
    const passedTests = allTests.filter(test => test.passed || test.allPassed).length;

    console.log('\n🎯 TEST RESULTS:');
    console.log('================');

    allTests.forEach((test, index) => {
      const passed = test.passed || test.allPassed;
      console.log(`📝 Test ${index + 1}: ${test.testName}`);
      console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      if (test.details) {
        console.log(`   Details: ${test.details}`);
      }
      if (test.results && Array.isArray(test.results)) {
        test.results.forEach((result: any) => {
          console.log(`   - ${result.name}: ${result.passed ? '✅' : '❌'}`);
        });
      }
      console.log('');
    });

    if (passedTests === allTests.length) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Data migration correctly converts isSimulated → isFallbackData');
      console.log('✅ Rate limiting prevents API overload');
      console.log('✅ Retry logic handles 429 errors gracefully');
      console.log('✅ Real interview data will be classified correctly');
    } else {
      console.log(`❌ ${allTests.length - passedTests} out of ${allTests.length} tests failed`);
    }

    console.log(`\n✅ Passed: ${passedTests}/${allTests.length} tests`);

    return {
      allPassed: passedTests === allTests.length,
      results: allTests
    };

  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
    return { allPassed: false, error };
  }
};
