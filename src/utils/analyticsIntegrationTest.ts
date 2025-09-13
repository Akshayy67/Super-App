import { InterviewPerformanceData } from "./performanceAnalytics";
import { analyticsStorage } from "./analyticsStorage";
import { enhancedAIAnalytics } from "./enhancedAIAnalytics";
import { analyticsDataValidator } from "./analyticsDataValidator";
import { unifiedAnalyticsStorage } from "./unifiedAnalyticsStorage";

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

export class AnalyticsIntegrationTest {
  private testResults: TestResult[] = [];

  /**
   * Run all integration tests
   */
  public async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];

    console.log("🧪 Starting Analytics Integration Tests...");

    // Test data storage
    await this.testDataStorage();

    // Test data validation
    await this.testDataValidation();

    // Test AI analysis
    await this.testAIAnalysis();

    // Test data flow
    await this.testDataFlow();

    // Test cloud storage integration
    await this.testCloudStorage();

    // Summary
    const passed = this.testResults.filter((r) => r.passed).length;
    const total = this.testResults.length;

    console.log(`🧪 Tests completed: ${passed}/${total} passed`);

    return this.testResults;
  }

  /**
   * Test data storage functionality
   */
  private async testDataStorage(): Promise<void> {
    try {
      // Create test data
      const testData: InterviewPerformanceData =
        this.createTestPerformanceData();

      // Test saving
      analyticsStorage.savePerformanceData(testData);
      this.addTestResult(
        "Data Storage - Save",
        true,
        "Successfully saved test data"
      );

      // Test retrieval
      const retrieved = analyticsStorage.getPerformanceById(testData.id);
      if (retrieved && retrieved.id === testData.id) {
        this.addTestResult(
          "Data Storage - Retrieve",
          true,
          "Successfully retrieved test data"
        );
      } else {
        this.addTestResult(
          "Data Storage - Retrieve",
          false,
          "Failed to retrieve test data"
        );
      }

      // Test history
      const history = analyticsStorage.getPerformanceHistory();
      if (history.length > 0) {
        this.addTestResult(
          "Data Storage - History",
          true,
          `Found ${history.length} records in history`
        );
      } else {
        this.addTestResult(
          "Data Storage - History",
          false,
          "No records found in history"
        );
      }

      // Clean up test data
      analyticsStorage.deletePerformanceData(testData.id);
    } catch (error) {
      this.addTestResult(
        "Data Storage",
        false,
        `Storage test failed: ${error}`
      );
    }
  }

  /**
   * Test data validation functionality
   */
  private async testDataValidation(): Promise<void> {
    try {
      // Test validation with current data
      const validationResult = analyticsDataValidator.validateAnalyticsData();

      this.addTestResult(
        "Data Validation - Basic",
        true,
        `Validation completed: ${validationResult.dataCount} records, ${validationResult.errors.length} errors`,
        validationResult
      );

      // Test with invalid data
      const invalidData = {
        ...this.createTestPerformanceData(),
        overallScore: 150, // Invalid score
        timestamp: "invalid-date",
      } as InterviewPerformanceData;

      analyticsStorage.savePerformanceData(invalidData);
      const invalidValidation = analyticsDataValidator.validateAnalyticsData();

      if (
        invalidValidation.errors.length > 0 ||
        invalidValidation.warnings.length > 0
      ) {
        this.addTestResult(
          "Data Validation - Invalid Data",
          true,
          "Correctly detected invalid data"
        );
      } else {
        this.addTestResult(
          "Data Validation - Invalid Data",
          false,
          "Failed to detect invalid data"
        );
      }

      // Clean up
      analyticsStorage.deletePerformanceData(invalidData.id);
    } catch (error) {
      this.addTestResult(
        "Data Validation",
        false,
        `Validation test failed: ${error}`
      );
    }
  }

  /**
   * Test AI analysis functionality
   */
  private async testAIAnalysis(): Promise<void> {
    try {
      const testData = this.createTestPerformanceData();
      const testHistory = [testData];

      // Test individual analysis
      const analysis = await enhancedAIAnalytics.analyzeInterviewPerformance(
        testData
      );

      if (
        analysis &&
        analysis.overallInsights &&
        analysis.overallInsights.length > 0
      ) {
        this.addTestResult(
          "AI Analysis - Performance",
          true,
          "Successfully generated performance analysis"
        );
      } else {
        this.addTestResult(
          "AI Analysis - Performance",
          false,
          "Failed to generate performance analysis"
        );
      }

      // Test trend analysis
      const trends = await enhancedAIAnalytics.analyzeTrends(testHistory);

      if (trends && trends.performanceTrend) {
        this.addTestResult(
          "AI Analysis - Trends",
          true,
          `Generated trend analysis: ${trends.performanceTrend}`
        );
      } else {
        this.addTestResult(
          "AI Analysis - Trends",
          false,
          "Failed to generate trend analysis"
        );
      }

      // Test personalized insights
      const insights = await enhancedAIAnalytics.generatePersonalizedInsights(
        testData,
        testHistory
      );

      if (
        insights &&
        insights.roleSpecificAdvice &&
        insights.roleSpecificAdvice.length > 0
      ) {
        this.addTestResult(
          "AI Analysis - Insights",
          true,
          "Successfully generated personalized insights"
        );
      } else {
        this.addTestResult(
          "AI Analysis - Insights",
          false,
          "Failed to generate personalized insights"
        );
      }

      // Test comprehensive report
      const report = await enhancedAIAnalytics.generateComprehensiveReport(
        testData,
        testHistory
      );

      if (report && report.analysis && report.trends && report.insights) {
        this.addTestResult(
          "AI Analysis - Comprehensive",
          true,
          "Successfully generated comprehensive report"
        );
      } else {
        this.addTestResult(
          "AI Analysis - Comprehensive",
          false,
          "Failed to generate comprehensive report"
        );
      }
    } catch (error) {
      this.addTestResult(
        "AI Analysis",
        false,
        `AI analysis test failed: ${error}`
      );
    }
  }

  /**
   * Test cloud storage integration
   */
  private async testCloudStorage(): Promise<void> {
    try {
      const testData = this.createTestPerformanceData();

      // Test unified storage save
      const saveSuccess = await unifiedAnalyticsStorage.savePerformanceData(
        testData
      );

      if (saveSuccess) {
        this.addTestResult(
          "Cloud Storage - Save",
          true,
          "Successfully saved to unified storage"
        );
      } else {
        this.addTestResult(
          "Cloud Storage - Save",
          false,
          "Failed to save to unified storage"
        );
      }

      // Test unified storage retrieval
      const retrieved = await unifiedAnalyticsStorage.getPerformanceById(
        testData.id
      );

      if (retrieved && retrieved.id === testData.id) {
        this.addTestResult(
          "Cloud Storage - Retrieve",
          true,
          "Successfully retrieved from unified storage"
        );
      } else {
        this.addTestResult(
          "Cloud Storage - Retrieve",
          false,
          "Failed to retrieve from unified storage"
        );
      }

      // Test storage status
      const status = unifiedAnalyticsStorage.getStorageStatus();

      this.addTestResult(
        "Cloud Storage - Status",
        true,
        `Storage status: Online=${status.isOnline}, Auth=${
          status.isAuthenticated
        }, Sync=${!status.needsSync}`,
        status
      );

      // Test analytics stats
      const stats = await unifiedAnalyticsStorage.getAnalyticsStats();

      if (stats.totalInterviews >= 0) {
        this.addTestResult(
          "Cloud Storage - Stats",
          true,
          `Analytics stats retrieved: ${stats.totalInterviews} interviews`
        );
      } else {
        this.addTestResult(
          "Cloud Storage - Stats",
          false,
          "Failed to get analytics stats"
        );
      }

      // Clean up
      await unifiedAnalyticsStorage.deletePerformanceData(testData.id);
    } catch (error) {
      this.addTestResult(
        "Cloud Storage",
        false,
        `Cloud storage test failed: ${error}`
      );
    }
  }

  /**
   * Test complete data flow
   */
  private async testDataFlow(): Promise<void> {
    try {
      // Simulate interview completion
      const interviewData = this.createTestPerformanceData();

      // Step 1: Save interview data using unified storage
      const saveSuccess = await unifiedAnalyticsStorage.savePerformanceData(
        interviewData
      );
      if (!saveSuccess) {
        this.addTestResult(
          "Data Flow - Save",
          false,
          "Interview data was not saved"
        );
        return;
      }

      // Step 2: Validate data was saved
      const saved = await unifiedAnalyticsStorage.getPerformanceById(
        interviewData.id
      );
      if (!saved) {
        this.addTestResult(
          "Data Flow - Retrieve",
          false,
          "Interview data was not retrieved"
        );
        return;
      }

      // Step 3: Load data for analytics
      const history = await unifiedAnalyticsStorage.getPerformanceHistory();
      if (history.length === 0) {
        this.addTestResult(
          "Data Flow - Load",
          false,
          "No data available for analytics"
        );
        return;
      }

      // Step 4: Generate AI analysis
      const analysis = await enhancedAIAnalytics.analyzeInterviewPerformance(
        saved
      );
      if (!analysis) {
        this.addTestResult(
          "Data Flow - AI Analysis",
          false,
          "Failed to generate AI analysis"
        );
        return;
      }

      // Step 5: Validate complete flow
      this.addTestResult(
        "Data Flow - Complete",
        true,
        "Successfully completed full data flow: save → load → analyze"
      );

      // Clean up
      await unifiedAnalyticsStorage.deletePerformanceData(interviewData.id);
    } catch (error) {
      this.addTestResult("Data Flow", false, `Data flow test failed: ${error}`);
    }
  }

  /**
   * Create test performance data
   */
  private createTestPerformanceData(): InterviewPerformanceData {
    const now = new Date();
    return {
      id: `test_interview_${Date.now()}`,
      timestamp: now.toISOString(),
      role: "Software Engineer",
      difficulty: "medium",
      duration: 1800, // 30 minutes
      overallScore: 78,
      technicalScore: 82,
      communicationScore: 75,
      behavioralScore: 76,
      questionsAnswered: 8,
      questionsCorrect: 6,
      averageResponseTime: 45,
      speechAnalysis: {
        pronunciationAssessment: {
          clarity: 78,
          pronunciation: 82,
          fluency: 75,
        },
        paceAnalysis: {
          wordsPerMinute: 145,
          pauseFrequency: 12,
          paceVariation: 8,
        },
        confidenceScore: {
          overall: 74,
          voiceStability: 76,
          speechPattern: 72,
        },
        fillerWords: {
          count: 15,
          percentage: 3.2,
          types: ["um", "uh", "like"],
        },
      },
      bodyLanguageAnalysis: {
        eyeContact: {
          percentage: 68,
          consistency: 72,
        },
        posture: {
          score: 78,
          stability: 82,
        },
        gestures: {
          appropriateness: 75,
          frequency: 14,
        },
        overallBodyLanguage: {
          professionalismScore: 79,
          engagementLevel: 73,
          score: 76,
        },
      },
      detailedMetrics: {
        confidence: 74,
        clarity: 78,
        professionalism: 85,
        engagement: 72,
        adaptability: 69,
      },
      strengths: [
        "Strong technical problem-solving approach",
        "Clear explanation of complex concepts",
        "Good use of examples and analogies",
      ],
      weaknesses: [
        "Could improve response time for behavioral questions",
        "Occasional use of filler words",
        "Could maintain better eye contact",
      ],
      recommendations: [
        "Practice explaining complex concepts simply",
        "Work on reducing filler words",
        "Prepare more specific examples from experience",
        "Practice maintaining eye contact",
        "Work on confident body language",
      ],
    };
  }

  /**
   * Add a test result
   */
  private addTestResult(
    testName: string,
    passed: boolean,
    message: string,
    details?: any
  ): void {
    const result: TestResult = {
      testName,
      passed,
      message,
      details,
    };

    this.testResults.push(result);

    const status = passed ? "✅" : "❌";
    console.log(`${status} ${testName}: ${message}`);
  }

  /**
   * Get test results summary
   */
  public getTestSummary(): { passed: number; failed: number; total: number } {
    const passed = this.testResults.filter((r) => r.passed).length;
    const failed = this.testResults.filter((r) => !r.passed).length;
    const total = this.testResults.length;

    return { passed, failed, total };
  }

  /**
   * Export test results
   */
  public exportTestResults(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: this.getTestSummary(),
        results: this.testResults,
      },
      null,
      2
    );
  }
}

// Export singleton instance
export const analyticsIntegrationTest = new AnalyticsIntegrationTest();
