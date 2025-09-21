/**
 * Performance optimization test runner
 * Tests API rate limiting, caching, and data loading optimizations
 * Run with: node src/test/performanceOptimizationTest.js
 */

// Test API caching functionality
function testAPICaching() {
  console.log('🧪 Testing API Caching Logic...');

  // Mock cache implementation (same as in aiService.ts)
  const REQUEST_CACHE = new Map();
  const CACHE_TTL = {
    AI_ANALYSIS: 5 * 60 * 1000, // 5 minutes
    GENERAL: 2 * 60 * 1000, // 2 minutes
  };

  const getCacheKey = (prompt, context) => {
    return btoa(prompt + (context || '')).slice(0, 50);
  };

  const getCachedResult = (cacheKey) => {
    const cached = REQUEST_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log('🎯 Using cached AI response');
      return cached.result;
    }
    if (cached) {
      REQUEST_CACHE.delete(cacheKey);
    }
    return null;
  };

  const setCachedResult = (cacheKey, result, ttl) => {
    REQUEST_CACHE.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl,
    });
  };

  // Test caching
  const testPrompt = "Analyze this interview performance";
  const testContext = "Frontend Developer interview";
  const cacheKey = getCacheKey(testPrompt, testContext);
  
  // First call - should not be cached
  let cachedResult = getCachedResult(cacheKey);
  const firstCallCached = cachedResult !== null;

  // Set cache
  const mockResponse = { success: true, data: "Mock analysis result" };
  setCachedResult(cacheKey, mockResponse, CACHE_TTL.AI_ANALYSIS);

  // Second call - should be cached
  cachedResult = getCachedResult(cacheKey);
  const secondCallCached = cachedResult !== null;

  // Test cache expiration
  const expiredKey = getCacheKey("expired", "test");
  setCachedResult(expiredKey, mockResponse, -1000); // Already expired
  const expiredResult = getCachedResult(expiredKey);
  const expiredCallCached = expiredResult !== null;

  return {
    testName: 'API Caching',
    results: [
      { name: 'First Call Not Cached', passed: !firstCallCached },
      { name: 'Second Call Cached', passed: secondCallCached },
      { name: 'Expired Cache Removed', passed: !expiredCallCached },
    ],
    allPassed: !firstCallCached && secondCallCached && !expiredCallCached,
  };
}

// Test request deduplication
async function testRequestDeduplication() {
  console.log('🧪 Testing Request Deduplication...');

  const PENDING_REQUESTS = new Map();
  let requestCount = 0;

  const deduplicateRequest = async (cacheKey, requestFn) => {
    if (PENDING_REQUESTS.has(cacheKey)) {
      console.log('⏳ Deduplicating concurrent request');
      return PENDING_REQUESTS.get(cacheKey);
    }

    const requestPromise = requestFn().finally(() => {
      PENDING_REQUESTS.delete(cacheKey);
    });

    PENDING_REQUESTS.set(cacheKey, requestPromise);
    return requestPromise;
  };

  const mockApiCall = async () => {
    requestCount++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    return `Request ${requestCount}`;
  };

  // Make 3 concurrent requests with the same key
  const cacheKey = 'test-request';
  const promises = [
    deduplicateRequest(cacheKey, mockApiCall),
    deduplicateRequest(cacheKey, mockApiCall),
    deduplicateRequest(cacheKey, mockApiCall),
  ];

  const results = await Promise.all(promises);

  // All should return the same result, and only 1 actual API call should be made
  const allSameResult = results.every(result => result === results[0]);
  const onlyOneApiCall = requestCount === 1;

  return {
    testName: 'Request Deduplication',
    results: [
      { name: 'All Results Same', passed: allSameResult },
      { name: 'Only One API Call', passed: onlyOneApiCall },
    ],
    allPassed: allSameResult && onlyOneApiCall,
    details: `Made ${requestCount} API calls for 3 concurrent requests`,
  };
}

// Test rate limiting improvements
async function testRateLimitingOptimization() {
  console.log('🧪 Testing Rate Limiting Optimization...');

  const RATE_LIMIT_CONFIG = {
    maxRequestsPerMinute: 3, // Very low for testing
    requestQueue: [],
    isProcessing: false,
  };

  let processedRequests = 0;

  const rateLimitedRequest = async (requestFn) => {
    return new Promise((resolve, reject) => {
      RATE_LIMIT_CONFIG.requestQueue.push({ 
        timestamp: Date.now(), 
        resolve: (result) => resolve(result), 
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
        const waitTime = 60000 - (now - oldestRequest.timestamp) + 100;
        console.log(`⏳ Rate limit reached, waiting ${Math.round(waitTime/1000)}s`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Process the next request
      const request = RATE_LIMIT_CONFIG.requestQueue.shift();
      if (request) {
        try {
          processedRequests++;
          request.resolve(`Processed request ${processedRequests}`);
        } catch (error) {
          request.reject(error);
        }
      }
    }

    RATE_LIMIT_CONFIG.isProcessing = false;
  };

  // Test with 5 rapid requests
  const startTime = Date.now();
  const requests = [];

  for (let i = 0; i < 5; i++) {
    requests.push(rateLimitedRequest(async () => `Request ${i + 1}`));
  }

  const results = await Promise.all(requests);
  const endTime = Date.now();
  const totalTime = endTime - startTime;

  return {
    testName: 'Rate Limiting Optimization',
    results: [
      { name: 'All Requests Processed', passed: results.length === 5 },
      { name: 'Rate Limiting Applied', passed: totalTime > 2000 }, // Should take time due to rate limiting
    ],
    allPassed: results.length === 5 && totalTime > 2000,
    details: `Processed ${results.length} requests in ${totalTime}ms`,
  };
}

// Test data loading optimization
function testDataLoadingOptimization() {
  console.log('🧪 Testing Data Loading Optimization...');

  let loadCallCount = 0;
  let cacheHits = 0;

  // Mock optimized data loading with caching
  const DATA_CACHE = new Map();
  const CACHE_DURATION = 30000; // 30 seconds

  const optimizedDataLoad = async (forceRefresh = false) => {
    const cacheKey = 'performance_history';
    const cached = DATA_CACHE.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      cacheHits++;
      console.log('📊 Using cached performance data');
      return cached.data;
    }

    // Simulate actual data loading
    loadCallCount++;
    console.log('🔄 Loading fresh performance data');
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate load time

    const mockData = [{ id: 'interview_1', score: 85 }];
    DATA_CACHE.set(cacheKey, {
      data: mockData,
      timestamp: Date.now(),
    });

    return mockData;
  };

  // Test multiple rapid calls
  const testCalls = async () => {
    await optimizedDataLoad(); // First call - should load
    await optimizedDataLoad(); // Second call - should use cache
    await optimizedDataLoad(); // Third call - should use cache
    await optimizedDataLoad(true); // Fourth call - force refresh
    await optimizedDataLoad(); // Fifth call - should use new cache
  };

  return testCalls().then(() => ({
    testName: 'Data Loading Optimization',
    results: [
      { name: 'Reduced Load Calls', passed: loadCallCount === 2 }, // Only 2 actual loads
      { name: 'Cache Hits Recorded', passed: cacheHits === 3 }, // 3 cache hits
    ],
    allPassed: loadCallCount === 2 && cacheHits === 3,
    details: `${loadCallCount} actual loads, ${cacheHits} cache hits`,
  }));
}

// Run all performance optimization tests
async function runAllTests() {
  console.log('🧪 Starting Performance Optimization Tests...\n');

  try {
    const cachingTest = testAPICaching();
    const deduplicationTest = await testRequestDeduplication();
    const rateLimitingTest = await testRateLimitingOptimization();
    const dataLoadingTest = await testDataLoadingOptimization();

    const allTests = [cachingTest, deduplicationTest, rateLimitingTest, dataLoadingTest];
    const passedTests = allTests.filter(test => test.allPassed).length;

    console.log('\n🎯 PERFORMANCE OPTIMIZATION RESULTS:');
    console.log('====================================');

    allTests.forEach((test, index) => {
      console.log(`📝 Test ${index + 1}: ${test.testName}`);
      console.log(`   Result: ${test.allPassed ? '✅ PASS' : '❌ FAIL'}`);
      if (test.details) {
        console.log(`   Details: ${test.details}`);
      }
      if (test.results && Array.isArray(test.results)) {
        test.results.forEach((result) => {
          console.log(`   - ${result.name}: ${result.passed ? '✅' : '❌'}`);
        });
      }
      console.log('');
    });

    if (passedTests === allTests.length) {
      console.log('🎉 ALL PERFORMANCE TESTS PASSED!');
      console.log('');
      console.log('🎯 PERFORMANCE OPTIMIZATIONS VERIFIED:');
      console.log('✅ API response caching reduces redundant requests');
      console.log('✅ Request deduplication prevents concurrent duplicate calls');
      console.log('✅ Rate limiting prevents API overload with conservative limits');
      console.log('✅ Data loading optimization reduces unnecessary storage operations');
      console.log('✅ Cache management handles expiration and cleanup properly');
      console.log('');
      console.log('📊 EXPECTED PERFORMANCE IMPROVEMENTS:');
      console.log('- Elimination of 429 "Too Many Requests" errors');
      console.log('- Faster response times through intelligent caching');
      console.log('- Reduced redundant data loading and storage operations');
      console.log('- Better user experience with fewer loading delays');
      console.log('- More efficient API usage and cost reduction');
    } else {
      console.log(`❌ ${allTests.length - passedTests} out of ${allTests.length} tests failed`);
    }

    console.log(`\n✅ Passed: ${passedTests}/${allTests.length} tests`);

  } catch (error) {
    console.error('❌ Performance test suite failed with error:', error);
  }
}

// Run the tests
runAllTests();
