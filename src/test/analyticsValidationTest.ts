/**
 * Manual validation test for analytics implementation
 * Run this in the browser console to validate analytics data flow
 */

import { AnalyticsValidator } from '../utils/analyticsValidation';
import { unifiedAnalyticsStorage } from '../utils/unifiedAnalyticsStorage';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';

/**
 * Test suite for analytics validation
 */
export class AnalyticsValidationTest {
  
  /**
   * Run all validation tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Analytics Validation Tests...\n');
    
    try {
      await this.testDataFlow();
      await this.testDataQuality();
      await this.testRealTimeUpdates();
      await this.generateReport();
      
      console.log('✅ All analytics validation tests completed successfully!');
    } catch (error) {
      console.error('❌ Analytics validation tests failed:', error);
    }
  }

  /**
   * Test data flow from storage to display
   */
  static async testDataFlow(): Promise<void> {
    console.log('📊 Testing data flow...');
    
    const data = await unifiedAnalyticsStorage.getPerformanceHistory();
    console.log(`- Found ${data.length} interviews in storage`);
    
    if (data.length > 0) {
      const latest = data[0];
      console.log(`- Latest interview: ${latest.role} (${latest.difficulty})`);
      console.log(`- Overall score: ${latest.overallScore}`);
      console.log(`- Timestamp: ${new Date(latest.timestamp).toLocaleString()}`);
    }
    
    console.log('✅ Data flow test completed\n');
  }

  /**
   * Test data quality and authenticity
   */
  static async testDataQuality(): Promise<void> {
    console.log('🔍 Testing data quality...');
    
    const validation = await AnalyticsValidator.validateAnalyticsFlow();
    console.log(`- Validation result: ${validation.isValid ? 'PASS' : 'FAIL'}`);
    console.log(`- Summary: ${validation.summary}`);
    console.log(`- Real data percentage: ${validation.details.realDataPercentage}%`);
    console.log(`- Total interviews: ${validation.details.totalInterviews}`);
    
    if (validation.issues.length > 0) {
      console.log('- Issues found:');
      validation.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    console.log('✅ Data quality test completed\n');
  }

  /**
   * Test real-time update mechanisms
   */
  static async testRealTimeUpdates(): Promise<void> {
    console.log('⚡ Testing real-time updates...');
    
    // Create a test interview performance data
    const testData: InterviewPerformanceData = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: 'Test Engineer',
      difficulty: 'medium',
      duration: 1800,
      overallScore: 85,
      technicalScore: 88,
      communicationScore: 82,
      behavioralScore: 87,
      detailedMetrics: {
        confidence: 85,
        clarity: 80,
        professionalism: 90,
        responseTime: 15,
        technicalDepth: 85,
        problemSolving: 88
      },
      strengths: ['Clear communication', 'Good technical knowledge'],
      weaknesses: ['Could improve response time'],
      recommendations: ['Practice more coding problems'],
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
      }
    };

    console.log('- Creating test interview data...');
    await unifiedAnalyticsStorage.savePerformanceData(testData);
    
    console.log('- Verifying data was saved...');
    const updatedData = await unifiedAnalyticsStorage.getPerformanceHistory();
    const testDataExists = updatedData.some(item => item.id === testData.id);
    
    if (testDataExists) {
      console.log('✅ Test data successfully saved and retrieved');
      
      // Clean up test data
      console.log('- Cleaning up test data...');
      const filteredData = updatedData.filter(item => item.id !== testData.id);
      localStorage.setItem('interview_performance_history', JSON.stringify(filteredData));
    } else {
      console.log('❌ Test data was not saved properly');
    }
    
    console.log('✅ Real-time updates test completed\n');
  }

  /**
   * Generate comprehensive validation report
   */
  static async generateReport(): Promise<void> {
    console.log('📋 Generating validation report...');
    
    const report = await AnalyticsValidator.generateValidationReport();
    console.log('\n' + '='.repeat(50));
    console.log(report);
    console.log('='.repeat(50) + '\n');
    
    console.log('✅ Validation report generated\n');
  }

  /**
   * Quick validation check
   */
  static async quickCheck(): Promise<void> {
    console.log('⚡ Quick validation check...');
    
    const result = await AnalyticsValidator.quickValidation();
    console.log(`- Has real data: ${result.hasRealData ? 'Yes' : 'No'}`);
    console.log(`- Data count: ${result.dataCount}`);
    console.log(`- Quality: ${result.quality}`);
    
    console.log('✅ Quick check completed\n');
  }
}

// Export for browser console usage
(window as any).AnalyticsValidationTest = AnalyticsValidationTest;

// Auto-run quick check when loaded
if (typeof window !== 'undefined') {
  console.log('🔧 Analytics Validation Test loaded. Run AnalyticsValidationTest.runAllTests() to start validation.');
}

export default AnalyticsValidationTest;
