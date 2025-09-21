import { InterviewPerformanceData } from './performanceAnalytics';
import { analyticsStorage } from './analyticsStorage';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataCount: number;
  lastInterviewDate?: string;
  suggestions: string[];
}

export class AnalyticsDataValidator {
  private static instance: AnalyticsDataValidator;

  public static getInstance(): AnalyticsDataValidator {
    if (!AnalyticsDataValidator.instance) {
      AnalyticsDataValidator.instance = new AnalyticsDataValidator();
    }
    return AnalyticsDataValidator.instance;
  }

  /**
   * Validate the current analytics data state
   */
  public validateAnalyticsData(): DataValidationResult {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataCount: 0,
      suggestions: []
    };

    try {
      // Get performance history
      const performanceHistory = analyticsStorage.getPerformanceHistory();
      result.dataCount = performanceHistory.length;

      if (performanceHistory.length === 0) {
        result.isValid = false;
        result.errors.push('No interview performance data found');
        result.suggestions.push('Complete an interview to generate analytics data');
        return result;
      }

      // Validate each performance record
      const validationErrors: string[] = [];
      const validationWarnings: string[] = [];

      performanceHistory.forEach((performance, index) => {
        const recordErrors = this.validatePerformanceRecord(performance, index);
        validationErrors.push(...recordErrors.errors);
        validationWarnings.push(...recordErrors.warnings);
      });

      result.errors = validationErrors;
      result.warnings = validationWarnings;
      result.isValid = validationErrors.length === 0;

      // Get last interview date
      if (performanceHistory.length > 0) {
        const sortedHistory = [...performanceHistory].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        result.lastInterviewDate = sortedHistory[0].timestamp;
      }

      // Generate suggestions
      result.suggestions = this.generateSuggestions(performanceHistory, result);

      console.log('📊 Analytics data validation completed:', {
        isValid: result.isValid,
        dataCount: result.dataCount,
        errors: result.errors.length,
        warnings: result.warnings.length
      });

    } catch (error) {
      console.error('❌ Analytics data validation failed:', error);
      result.isValid = false;
      result.errors.push('Failed to validate analytics data: ' + (error as Error).message);
    }

    return result;
  }

  /**
   * Validate a single performance record
   */
  private validatePerformanceRecord(
    performance: InterviewPerformanceData,
    index: number
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!performance.id) {
      errors.push(`Record ${index + 1}: Missing ID`);
    }

    if (!performance.timestamp) {
      errors.push(`Record ${index + 1}: Missing timestamp`);
    } else {
      const date = new Date(performance.timestamp);
      if (isNaN(date.getTime())) {
        errors.push(`Record ${index + 1}: Invalid timestamp format`);
      }
    }

    if (!performance.role) {
      errors.push(`Record ${index + 1}: Missing role`);
    }

    if (!performance.difficulty) {
      errors.push(`Record ${index + 1}: Missing difficulty`);
    }

    // Score validation
    const scores = [
      { name: 'overallScore', value: performance.overallScore },
      { name: 'technicalScore', value: performance.technicalScore },
      { name: 'communicationScore', value: performance.communicationScore },
      { name: 'behavioralScore', value: performance.behavioralScore }
    ];

    scores.forEach(score => {
      if (typeof score.value !== 'number') {
        errors.push(`Record ${index + 1}: ${score.name} is not a number`);
      } else if (score.value < 0 || score.value > 100) {
        warnings.push(`Record ${index + 1}: ${score.name} (${score.value}) is outside normal range (0-100)`);
      }
    });

    // Duration validation
    if (typeof performance.duration !== 'number' || performance.duration <= 0) {
      warnings.push(`Record ${index + 1}: Invalid duration (${performance.duration})`);
    } else if (performance.duration < 60) { // Less than 1 minute
      warnings.push(`Record ${index + 1}: Very short interview duration (${performance.duration}s)`);
    } else if (performance.duration > 7200) { // More than 2 hours
      warnings.push(`Record ${index + 1}: Very long interview duration (${Math.round(performance.duration / 60)}min)`);
    }

    // Speech analysis validation
    if (!performance.speechAnalysis) {
      warnings.push(`Record ${index + 1}: Missing speech analysis data`);
    } else {
      if (!performance.speechAnalysis.confidenceScore) {
        warnings.push(`Record ${index + 1}: Missing speech confidence score`);
      }
      if (!performance.speechAnalysis.pronunciationAssessment) {
        warnings.push(`Record ${index + 1}: Missing pronunciation assessment`);
      }
      if (!performance.speechAnalysis.fillerWords) {
        warnings.push(`Record ${index + 1}: Missing filler words analysis`);
      }
    }

    // Body language validation
    if (!performance.bodyLanguageAnalysis) {
      warnings.push(`Record ${index + 1}: Missing body language analysis data`);
    } else {
      if (!performance.bodyLanguageAnalysis.eyeContact) {
        warnings.push(`Record ${index + 1}: Missing eye contact analysis`);
      }
      if (!performance.bodyLanguageAnalysis.posture) {
        warnings.push(`Record ${index + 1}: Missing posture analysis`);
      }
    }

    // Detailed metrics validation
    if (!performance.detailedMetrics) {
      warnings.push(`Record ${index + 1}: Missing detailed metrics`);
    } else {
      const requiredMetrics = ['confidence', 'clarity', 'professionalism', 'engagement', 'adaptability'];
      requiredMetrics.forEach(metric => {
        if (typeof performance.detailedMetrics[metric as keyof typeof performance.detailedMetrics] !== 'number') {
          warnings.push(`Record ${index + 1}: Missing or invalid ${metric} metric`);
        }
      });
    }

    // Arrays validation
    if (!Array.isArray(performance.strengths)) {
      warnings.push(`Record ${index + 1}: Strengths should be an array`);
    }
    if (!Array.isArray(performance.weaknesses)) {
      warnings.push(`Record ${index + 1}: Weaknesses should be an array`);
    }
    if (!Array.isArray(performance.recommendations)) {
      warnings.push(`Record ${index + 1}: Recommendations should be an array`);
    }

    return { errors, warnings };
  }

  /**
   * Generate suggestions based on validation results
   */
  private generateSuggestions(
    performanceHistory: InterviewPerformanceData[],
    validationResult: DataValidationResult
  ): string[] {
    const suggestions: string[] = [];

    if (performanceHistory.length === 0) {
      suggestions.push('Complete your first interview to start building analytics data');
      return suggestions;
    }

    if (performanceHistory.length < 3) {
      suggestions.push('Complete more interviews to see meaningful trends and comparisons');
    }

    if (validationResult.warnings.length > 0) {
      suggestions.push('Some interview data may be incomplete - consider retaking interviews for better analytics');
    }

    // Check data freshness
    if (validationResult.lastInterviewDate) {
      const lastDate = new Date(validationResult.lastInterviewDate);
      const daysSinceLastInterview = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastInterview > 7) {
        suggestions.push('Consider taking a new interview to keep your analytics data current');
      }
    }

    // Check for data diversity
    const roles = new Set(performanceHistory.map(p => p.role));
    const difficulties = new Set(performanceHistory.map(p => p.difficulty));

    if (roles.size === 1) {
      suggestions.push('Try interviews for different roles to get broader analytics insights');
    }

    if (difficulties.size === 1) {
      suggestions.push('Practice with different difficulty levels to challenge yourself');
    }

    // Performance-based suggestions
    const avgScore = performanceHistory.reduce((sum, p) => sum + p.overallScore, 0) / performanceHistory.length;
    
    if (avgScore < 60) {
      suggestions.push('Focus on fundamental interview skills - your average score suggests room for improvement');
    } else if (avgScore > 85) {
      suggestions.push('Great performance! Consider trying harder difficulty levels or different roles');
    }

    return suggestions;
  }

  /**
   * Repair common data issues
   */
  public repairAnalyticsData(): { repaired: boolean; changes: string[] } {
    const changes: string[] = [];
    let repaired = false;

    try {
      const performanceHistory = analyticsStorage.getPerformanceHistory();
      const repairedHistory: InterviewPerformanceData[] = [];

      performanceHistory.forEach((performance, index) => {
        const repairedPerformance = { ...performance };

        // Fix missing or invalid IDs
        if (!repairedPerformance.id) {
          repairedPerformance.id = `interview_${Date.now()}_${index}`;
          changes.push(`Added missing ID for record ${index + 1}`);
          repaired = true;
        }

        // Fix missing timestamps
        if (!repairedPerformance.timestamp) {
          repairedPerformance.timestamp = new Date().toISOString();
          changes.push(`Added missing timestamp for record ${index + 1}`);
          repaired = true;
        }

        // Fix score ranges
        const scoreFields = ['overallScore', 'technicalScore', 'communicationScore', 'behavioralScore'];
        scoreFields.forEach(field => {
          const score = repairedPerformance[field as keyof InterviewPerformanceData] as number;
          if (typeof score === 'number') {
            if (score < 0) {
              (repairedPerformance as any)[field] = 0;
              changes.push(`Fixed negative ${field} in record ${index + 1}`);
              repaired = true;
            } else if (score > 100) {
              (repairedPerformance as any)[field] = 100;
              changes.push(`Fixed excessive ${field} in record ${index + 1}`);
              repaired = true;
            }
          }
        });

        // Ensure arrays exist
        if (!Array.isArray(repairedPerformance.strengths)) {
          repairedPerformance.strengths = [];
          changes.push(`Fixed strengths array for record ${index + 1}`);
          repaired = true;
        }
        if (!Array.isArray(repairedPerformance.weaknesses)) {
          repairedPerformance.weaknesses = [];
          changes.push(`Fixed weaknesses array for record ${index + 1}`);
          repaired = true;
        }
        if (!Array.isArray(repairedPerformance.recommendations)) {
          repairedPerformance.recommendations = [];
          changes.push(`Fixed recommendations array for record ${index + 1}`);
          repaired = true;
        }

        repairedHistory.push(repairedPerformance);
      });

      if (repaired) {
        // Save repaired data
        repairedHistory.forEach(performance => {
          analyticsStorage.savePerformanceData(performance);
        });
        console.log('✅ Analytics data repaired successfully:', changes);
      }

    } catch (error) {
      console.error('❌ Failed to repair analytics data:', error);
      changes.push('Failed to repair data: ' + (error as Error).message);
    }

    return { repaired, changes };
  }

  /**
   * Clear all analytics data (for testing/reset purposes)
   */
  public clearAllData(): boolean {
    try {
      localStorage.removeItem('interview_performance_history');
      console.log('🗑️ All analytics data cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear analytics data:', error);
      return false;
    }
  }

  /**
   * Export analytics data for backup
   */
  public exportData(): string {
    try {
      return analyticsStorage.exportAllData();
    } catch (error) {
      console.error('❌ Failed to export analytics data:', error);
      return JSON.stringify({ error: 'Export failed' });
    }
  }

  /**
   * Import analytics data from backup
   */
  public importData(data: string): { success: boolean; message: string } {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.performanceHistory && Array.isArray(parsedData.performanceHistory)) {
        parsedData.performanceHistory.forEach((performance: InterviewPerformanceData) => {
          analyticsStorage.savePerformanceData(performance);
        });
        
        console.log('✅ Analytics data imported successfully');
        return { success: true, message: `Imported ${parsedData.performanceHistory.length} interview records` };
      } else {
        return { success: false, message: 'Invalid data format' };
      }
    } catch (error) {
      console.error('❌ Failed to import analytics data:', error);
      return { success: false, message: 'Failed to parse import data' };
    }
  }
}

export const analyticsDataValidator = AnalyticsDataValidator.getInstance();
