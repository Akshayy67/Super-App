import { InterviewPerformanceData } from "./performanceAnalytics";
import { unifiedAnalyticsStorage } from "./unifiedAnalyticsStorage";
import { analyticsStorage } from "./analyticsStorage";

/**
 * Comprehensive validation utility for analytics data accuracy
 * Ensures all analytics data represents real user interview performance
 */
export class AnalyticsValidator {
  /**
   * Validate that interview performance data is real and not simulated
   */
  static validatePerformanceData(data: InterviewPerformanceData): {
    isValid: boolean;
    issues: string[];
    dataQuality: "real" | "simulated" | "mixed";
  } {
    const issues: string[] = [];
    let hasSimulatedData = false;
    let hasRealData = false;

    // Check for explicit simulation markers (only mark as simulated if explicitly flagged)
    // Note: isFallbackData indicates missing analysis capabilities, not simulated data
    if (
      data.speechAnalysis &&
      (data.speechAnalysis as any).isSimulated === true
    ) {
      issues.push("Speech analysis contains simulated data");
      hasSimulatedData = true;
    }

    if (
      data.bodyLanguageAnalysis &&
      (data.bodyLanguageAnalysis as any).isSimulated === true
    ) {
      issues.push("Body language analysis contains simulated data");
      hasSimulatedData = true;
    }

    // Check for fallback data (this is real interview data with limited analysis)
    const hasFallbackSpeechData =
      data.speechAnalysis &&
      (data.speechAnalysis as any).isFallbackData === true;
    const hasFallbackBodyLanguageData =
      data.bodyLanguageAnalysis &&
      (data.bodyLanguageAnalysis as any).isFallbackData === true;

    if (hasFallbackSpeechData || hasFallbackBodyLanguageData) {
      // This is real interview data, just with limited analysis capabilities
      // Don't mark as simulated, but note the limitations
      if (hasFallbackSpeechData) {
        issues.push(
          "Speech analysis not available - using fallback data structure"
        );
      }
      if (hasFallbackBodyLanguageData) {
        issues.push(
          "Body language analysis not available - using fallback data structure"
        );
      }
    }

    // Check for placeholder/dummy data patterns
    if (
      data.id.startsWith("sample_") ||
      data.id.startsWith("demo_") ||
      data.id.startsWith("test_")
    ) {
      issues.push("Performance data appears to be sample/demo data");
      hasSimulatedData = true;
    }

    // Check for obviously fake/generated data patterns
    if (
      data.role &&
      (data.role.includes("Sample") ||
        data.role.includes("Demo") ||
        data.role.includes("Test"))
    ) {
      issues.push("Interview role appears to be sample/demo data");
      hasSimulatedData = true;
    }

    // Validate score ranges
    const scores = [
      data.overallScore,
      data.technicalScore,
      data.communicationScore,
      data.behavioralScore,
    ];

    scores.forEach((score, index) => {
      if (score < 0 || score > 100) {
        issues.push(`Invalid score range detected: ${score}`);
      }
    });

    // Check for unrealistic perfect scores (potential dummy data)
    if (scores.every((score) => score >= 95)) {
      issues.push("Suspiciously high scores - may be dummy data");
      hasSimulatedData = true;
    }

    // Determine if this is real data (default to real unless explicitly marked as simulated)
    // Real interview data indicators:
    const hasValidTimestamp =
      data.timestamp && !isNaN(new Date(data.timestamp).getTime());
    const hasValidDuration = data.duration && data.duration > 0;
    const hasValidScores = scores.every((score) => score >= 0 && score <= 100);
    const hasInterviewContent =
      data.questionsAnswered && data.questionsAnswered > 0;

    // Mark as real data if it has valid interview characteristics and isn't explicitly simulated
    // Include interviews with fallback data as real data (they're real interviews with limited analysis)
    const hasFallbackData =
      hasFallbackSpeechData || hasFallbackBodyLanguageData;

    if (
      !hasSimulatedData &&
      hasValidTimestamp &&
      hasValidDuration &&
      hasValidScores
    ) {
      hasRealData = true;
    }

    // Also mark as real data if it has fallback data (real interview with limited analysis)
    if (hasFallbackData && !hasSimulatedData) {
      hasRealData = true;
    }

    // Determine data quality
    let dataQuality: "real" | "simulated" | "mixed";
    if (hasSimulatedData && hasRealData) {
      dataQuality = "mixed";
    } else if (hasSimulatedData) {
      dataQuality = "simulated";
    } else {
      // Default to 'real' for any interview data that isn't explicitly marked as simulated
      dataQuality = "real";
    }

    console.log(`🔍 Data validation for ${data.id}:`, {
      hasSimulatedData,
      hasRealData,
      dataQuality,
      hasValidTimestamp,
      hasValidDuration,
      hasValidScores,
      hasInterviewContent,
      hasFallbackData,
      hasFallbackSpeechData,
      hasFallbackBodyLanguageData,
      issues: issues.length,
    });

    return {
      isValid: issues.length === 0,
      issues,
      dataQuality,
    };
  }

  /**
   * Validate the complete analytics data flow
   */
  static async validateAnalyticsFlow(): Promise<{
    isValid: boolean;
    summary: string;
    details: {
      localStorageValid: boolean;
      unifiedStorageValid: boolean;
      dataConsistency: boolean;
      realDataPercentage: number;
      totalInterviews: number;
    };
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Get data from both storage systems
      const localData = analyticsStorage.getPerformanceHistory();
      const unifiedData = await unifiedAnalyticsStorage.getPerformanceHistory();

      console.log("🔍 Analytics Validation:", {
        localCount: localData.length,
        unifiedCount: unifiedData.length,
      });

      // Validate local storage data
      let localRealDataCount = 0;
      localData.forEach((data, index) => {
        const validation = this.validatePerformanceData(data);
        if (validation.dataQuality === "real") {
          localRealDataCount++;
        } else if (validation.dataQuality === "simulated") {
          issues.push(`Local data ${index + 1}: Contains simulated data`);
        }
      });

      // Validate unified storage data
      let unifiedRealDataCount = 0;
      unifiedData.forEach((data, index) => {
        const validation = this.validatePerformanceData(data);
        if (validation.dataQuality === "real") {
          unifiedRealDataCount++;
        } else if (validation.dataQuality === "simulated") {
          issues.push(`Unified data ${index + 1}: Contains simulated data`);
        }
      });

      // Check data consistency between storage systems
      const dataConsistency = localData.length === unifiedData.length;
      if (!dataConsistency) {
        issues.push(
          `Data inconsistency: Local (${localData.length}) vs Unified (${unifiedData.length})`
        );
      }

      // Calculate real data percentage
      const totalInterviews = Math.max(localData.length, unifiedData.length);
      const realDataCount = Math.max(localRealDataCount, unifiedRealDataCount);
      const realDataPercentage =
        totalInterviews > 0 ? (realDataCount / totalInterviews) * 100 : 0;

      // Generate summary
      let summary: string;
      if (realDataPercentage === 100) {
        summary = "✅ All analytics data represents real user interviews";
      } else if (realDataPercentage >= 80) {
        summary = `⚠️ Mostly real data (${realDataPercentage.toFixed(
          1
        )}%) with some simulated components`;
      } else if (realDataPercentage > 0) {
        summary = `❌ Mixed data quality (${realDataPercentage.toFixed(
          1
        )}% real)`;
      } else {
        summary =
          "❌ No real interview data found - all data appears to be simulated";
      }

      return {
        isValid: issues.length === 0 && realDataPercentage === 100,
        summary,
        details: {
          localStorageValid: localRealDataCount === localData.length,
          unifiedStorageValid: unifiedRealDataCount === unifiedData.length,
          dataConsistency,
          realDataPercentage,
          totalInterviews,
        },
        issues,
      };
    } catch (error) {
      issues.push(`Validation error: ${error}`);
      return {
        isValid: false,
        summary: "❌ Analytics validation failed due to errors",
        details: {
          localStorageValid: false,
          unifiedStorageValid: false,
          dataConsistency: false,
          realDataPercentage: 0,
          totalInterviews: 0,
        },
        issues,
      };
    }
  }

  /**
   * Generate a detailed analytics report
   */
  static async generateValidationReport(): Promise<string> {
    const validation = await this.validateAnalyticsFlow();

    let report = `# Analytics Data Validation Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Summary\n${validation.summary}\n\n`;

    report += `## Details\n`;
    report += `- **Total Interviews:** ${validation.details.totalInterviews}\n`;
    report += `- **Real Data Percentage:** ${validation.details.realDataPercentage.toFixed(
      1
    )}%\n`;
    report += `- **Local Storage Valid:** ${
      validation.details.localStorageValid ? "✅" : "❌"
    }\n`;
    report += `- **Unified Storage Valid:** ${
      validation.details.unifiedStorageValid ? "✅" : "❌"
    }\n`;
    report += `- **Data Consistency:** ${
      validation.details.dataConsistency ? "✅" : "❌"
    }\n\n`;

    if (validation.issues.length > 0) {
      report += `## Issues Found\n`;
      validation.issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue}\n`;
      });
      report += `\n`;
    }

    report += `## Recommendations\n`;
    if (validation.details.realDataPercentage === 0) {
      report += `- Complete at least one real interview to generate authentic analytics data\n`;
      report += `- Ensure microphone and camera permissions are enabled for accurate analysis\n`;
    } else if (validation.details.realDataPercentage < 100) {
      report += `- Some data components are simulated - enable all analysis features for complete accuracy\n`;
      report += `- Check that speech and video analysis are working properly\n`;
    } else {
      report += `- Analytics data is accurate and represents real interview performance\n`;
      report += `- Continue conducting interviews to build comprehensive performance history\n`;
    }

    return report;
  }

  /**
   * Quick validation check for UI components
   */
  static async quickValidation(): Promise<{
    hasRealData: boolean;
    dataCount: number;
    quality: "excellent" | "good" | "poor" | "none";
  }> {
    try {
      console.log("🔍 QuickValidation: Loading performance history...");
      const data = await unifiedAnalyticsStorage.getPerformanceHistory();
      console.log(`🔍 QuickValidation: Found ${data.length} interviews`);

      const validationResults = data.map((item) => {
        const validation = this.validatePerformanceData(item);
        console.log(
          `🔍 QuickValidation: Interview ${item.id} - Quality: ${validation.dataQuality}`
        );
        return validation;
      });

      const realDataCount = validationResults.filter(
        (result) => result.dataQuality === "real"
      ).length;
      console.log(
        `🔍 QuickValidation: ${realDataCount} out of ${data.length} interviews marked as real`
      );

      const hasRealData = realDataCount > 0;
      const percentage =
        data.length > 0 ? (realDataCount / data.length) * 100 : 0;

      let quality: "excellent" | "good" | "poor" | "none";
      if (percentage === 100 && data.length >= 3) quality = "excellent";
      else if (percentage >= 80) quality = "good";
      else if (percentage > 0) quality = "poor";
      else quality = "none";

      const result = {
        hasRealData,
        dataCount: data.length,
        quality,
      };

      console.log("🔍 QuickValidation: Final result:", result);
      return result;
    } catch (error) {
      console.error("❌ QuickValidation error:", error);
      return {
        hasRealData: false,
        dataCount: 0,
        quality: "none",
      };
    }
  }
}

// Export convenience functions
export const validateAnalyticsFlow = () =>
  AnalyticsValidator.validateAnalyticsFlow();
export const generateValidationReport = () =>
  AnalyticsValidator.generateValidationReport();
export const quickValidation = () => AnalyticsValidator.quickValidation();
