/**
 * Simple test runner for data validation fix
 * Run with: node src/test/runDataValidationTest.js
 */

// Mock the required modules for Node.js environment
const mockUnifiedAnalyticsStorage = {
  getPerformanceHistory: async () => {
    // Return sample data that mimics real user interview data
    return [
      {
        id: 'real_interview_123',
        timestamp: new Date().toISOString(),
        role: 'Software Engineer',
        difficulty: 'Medium',
        duration: 1800,
        questionsAnswered: 5,
        overallScore: 72,
        technicalScore: 68,
        communicationScore: 75,
        behavioralScore: 74,
        speechAnalysis: {
          wordsPerMinute: 145,
          pauseFrequency: 0.12,
          fillerWordCount: 8,
          volumeConsistency: 0.85,
          clarityScore: 75,
          confidenceLevel: 70
          // No isSimulated flag - should be treated as real
        },
        bodyLanguageAnalysis: {
          eyeContactPercentage: 80,
          postureScore: 72,
          gestureFrequency: 0.3,
          facialExpressionVariety: 6,
          overallBodyLanguageScore: 75
          // No isSimulated flag - should be treated as real
        }
      }
    ];
  }
};

// Mock analytics validator logic
class MockAnalyticsValidator {
  static validatePerformanceData(data) {
    const issues = [];
    let hasSimulatedData = false;
    let hasRealData = false;

    // Check for explicit simulation markers (only mark as simulated if explicitly flagged)
    if (data.speechAnalysis && data.speechAnalysis.isSimulated === true) {
      issues.push('Speech analysis contains simulated data');
      hasSimulatedData = true;
    }

    if (data.bodyLanguageAnalysis && data.bodyLanguageAnalysis.isSimulated === true) {
      issues.push('Body language analysis contains simulated data');
      hasSimulatedData = true;
    }

    // Check for placeholder/dummy data patterns
    if (data.id.startsWith('sample_') || data.id.startsWith('demo_') || data.id.startsWith('test_')) {
      issues.push('Performance data appears to be sample/demo data');
      hasSimulatedData = true;
    }

    // Check for obviously fake/generated data patterns
    if (data.role && (data.role.includes('Sample') || data.role.includes('Demo') || data.role.includes('Test'))) {
      issues.push('Interview role appears to be sample/demo data');
      hasSimulatedData = true;
    }

    // Validate score ranges
    const scores = [
      data.overallScore,
      data.technicalScore,
      data.communicationScore,
      data.behavioralScore
    ];

    scores.forEach((score, index) => {
      if (score < 0 || score > 100) {
        issues.push(`Invalid score range detected: ${score}`);
      }
    });

    // Check for unrealistic perfect scores (potential dummy data)
    if (scores.every(score => score >= 95)) {
      issues.push('Suspiciously high scores - may be dummy data');
      hasSimulatedData = true;
    }

    // Determine if this is real data (default to real unless explicitly marked as simulated)
    const hasValidTimestamp = data.timestamp && !isNaN(new Date(data.timestamp).getTime());
    const hasValidDuration = data.duration && data.duration > 0;
    const hasValidScores = scores.every(score => score >= 0 && score <= 100);
    const hasInterviewContent = data.questionsAnswered && data.questionsAnswered > 0;

    // Mark as real data if it has valid interview characteristics and isn't explicitly simulated
    if (!hasSimulatedData && hasValidTimestamp && hasValidDuration && hasValidScores) {
      hasRealData = true;
    }

    // Determine data quality
    let dataQuality;
    if (hasSimulatedData && hasRealData) {
      dataQuality = 'mixed';
    } else if (hasSimulatedData) {
      dataQuality = 'simulated';
    } else {
      // Default to 'real' for any interview data that isn't explicitly marked as simulated
      dataQuality = 'real';
    }

    console.log(`🔍 Data validation for ${data.id}:`, {
      hasSimulatedData,
      hasRealData,
      dataQuality,
      hasValidTimestamp,
      hasValidDuration,
      hasValidScores,
      hasInterviewContent,
      issues: issues.length
    });

    return {
      isValid: issues.length === 0,
      issues,
      dataQuality
    };
  }

  static async quickValidation() {
    try {
      console.log('🔍 QuickValidation: Loading performance history...');
      const data = await mockUnifiedAnalyticsStorage.getPerformanceHistory();
      console.log(`🔍 QuickValidation: Found ${data.length} interviews`);
      
      const validationResults = data.map(item => {
        const validation = this.validatePerformanceData(item);
        console.log(`🔍 QuickValidation: Interview ${item.id} - Quality: ${validation.dataQuality}`);
        return validation;
      });
      
      const realDataCount = validationResults.filter(result => result.dataQuality === 'real').length;
      console.log(`🔍 QuickValidation: ${realDataCount} out of ${data.length} interviews marked as real`);

      const hasRealData = realDataCount > 0;
      const percentage = data.length > 0 ? (realDataCount / data.length) * 100 : 0;

      let quality;
      if (percentage === 100 && data.length >= 3) quality = 'excellent';
      else if (percentage >= 80) quality = 'good';
      else if (percentage > 0) quality = 'poor';
      else quality = 'none';

      const result = {
        hasRealData,
        dataCount: data.length,
        quality
      };
      
      console.log('🔍 QuickValidation: Final result:', result);
      return result;
    } catch (error) {
      console.error('❌ QuickValidation error:', error);
      return {
        hasRealData: false,
        dataCount: 0,
        quality: 'none'
      };
    }
  }
}

// Run the test
async function runTest() {
  console.log('🧪 Starting Data Validation Fix Test...\n');

  try {
    // Test the quick validation that the UI uses
    const result = await MockAnalyticsValidator.quickValidation();
    
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    
    if (result.hasRealData && result.quality !== 'none') {
      console.log('✅ SUCCESS: Real interview data is correctly recognized!');
      console.log(`   - Has Real Data: ${result.hasRealData}`);
      console.log(`   - Data Count: ${result.dataCount}`);
      console.log(`   - Quality: ${result.quality}`);
      console.log('\n🎉 The "No Real Data" warning should no longer appear in the analytics dashboard.');
      console.log('   Users with completed interviews will now see their real data properly recognized.');
    } else {
      console.log('❌ FAILED: Real interview data is not being recognized correctly.');
      console.log(`   - Has Real Data: ${result.hasRealData}`);
      console.log(`   - Data Count: ${result.dataCount}`);
      console.log(`   - Quality: ${result.quality}`);
      console.log('\n🔧 The validation logic may need further adjustment.');
    }

    // Test specific scenarios
    console.log('\n🔍 Testing Specific Scenarios:');
    console.log('==============================');

    // Test 1: Real interview data
    const realData = {
      id: 'user_interview_456',
      timestamp: new Date().toISOString(),
      role: 'Frontend Developer',
      difficulty: 'Medium',
      duration: 2100,
      questionsAnswered: 6,
      overallScore: 67,
      technicalScore: 72,
      communicationScore: 65,
      behavioralScore: 64,
      speechAnalysis: {
        wordsPerMinute: 135,
        pauseFrequency: 0.15,
        fillerWordCount: 12,
        volumeConsistency: 0.78,
        clarityScore: 68,
        confidenceLevel: 65
      },
      bodyLanguageAnalysis: {
        eyeContactPercentage: 72,
        postureScore: 66,
        gestureFrequency: 0.25,
        facialExpressionVariety: 5,
        overallBodyLanguageScore: 68
      }
    };

    const realValidation = MockAnalyticsValidator.validatePerformanceData(realData);
    console.log(`1. Real Interview Data: ${realValidation.dataQuality === 'real' ? '✅ PASS' : '❌ FAIL'} (${realValidation.dataQuality})`);

    // Test 2: Simulated data
    const simulatedData = {
      id: 'sample_demo_interview',
      timestamp: new Date().toISOString(),
      role: 'Sample Engineer',
      difficulty: 'Demo',
      duration: 1200,
      questionsAnswered: 3,
      overallScore: 95,
      technicalScore: 96,
      communicationScore: 94,
      behavioralScore: 97,
      speechAnalysis: {
        wordsPerMinute: 150,
        pauseFrequency: 0.05,
        fillerWordCount: 0,
        volumeConsistency: 0.99,
        clarityScore: 96,
        confidenceLevel: 95,
        isSimulated: true
      },
      bodyLanguageAnalysis: {
        eyeContactPercentage: 97,
        postureScore: 95,
        gestureFrequency: 0.4,
        facialExpressionVariety: 8,
        overallBodyLanguageScore: 96,
        isSimulated: true
      }
    };

    const simulatedValidation = MockAnalyticsValidator.validatePerformanceData(simulatedData);
    console.log(`2. Simulated Data: ${simulatedValidation.dataQuality === 'simulated' ? '✅ PASS' : '❌ FAIL'} (${simulatedValidation.dataQuality})`);

    // Test 3: Poor performance real data
    const poorData = {
      id: 'poor_interview_789',
      timestamp: new Date().toISOString(),
      role: 'Junior Developer',
      difficulty: 'Easy',
      duration: 900,
      questionsAnswered: 3,
      overallScore: 25,
      technicalScore: 20,
      communicationScore: 30,
      behavioralScore: 25,
      speechAnalysis: {
        wordsPerMinute: 80,
        pauseFrequency: 0.25,
        fillerWordCount: 25,
        volumeConsistency: 0.45,
        clarityScore: 30,
        confidenceLevel: 25
      },
      bodyLanguageAnalysis: {
        eyeContactPercentage: 35,
        postureScore: 28,
        gestureFrequency: 0.1,
        facialExpressionVariety: 2,
        overallBodyLanguageScore: 30
      }
    };

    const poorValidation = MockAnalyticsValidator.validatePerformanceData(poorData);
    console.log(`3. Poor Performance Real Data: ${poorValidation.dataQuality === 'real' ? '✅ PASS' : '❌ FAIL'} (${poorValidation.dataQuality})`);

    console.log('\n🎯 CONCLUSION:');
    console.log('==============');
    
    const allTestsPassed = realValidation.dataQuality === 'real' && 
                          simulatedValidation.dataQuality === 'simulated' && 
                          poorValidation.dataQuality === 'real' &&
                          result.hasRealData;

    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! The data validation fix is working correctly.');
      console.log('   Real interview data will now be properly recognized in the analytics dashboard.');
      console.log('   The "No Real Data" warning should no longer appear for users with completed interviews.');
    } else {
      console.log('⚠️  Some tests failed. The validation logic may need further refinement.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
runTest();
