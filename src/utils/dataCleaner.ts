/**
 * Data Cleaner Utility
 * Completely clears all stored interview and analytics data
 */

export class DataCleaner {
  /**
   * Clear all interview and analytics data from all storage locations
   */
  static clearAllInterviewData(): void {
    console.log('🧹 Clearing all stored interview data...');

    // Clear localStorage keys related to interviews and analytics
    const keysToRemove = [
      // Performance Analytics
      'interview_performance_history',
      'performance_analytics_data',
      'interview_analytics',
      'mock_interview_data',
      
      // Analytics Storage
      'analytics_settings',
      'user_preferences',
      'achievement_progress',
      'improvement_milestones',
      'feedback_responses',
      
      // Sample/Demo Data
      'show_sample_analytics_data',
      'sample_performance_data',
      'demo_interview_data',
      
      // Cache and temporary data
      'speech_analysis_cache',
      'body_language_cache',
      'interview_session_cache',
      'performance_cache',
      
      // Dark mode and UI preferences (keep these)
      // 'darkMode' - keeping this
      
      // Any other interview-related keys
      'last_interview_results',
      'current_interview_session',
      'interview_validation_data',
    ];

    // Remove all interview-related localStorage items
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      }
    });

    // Clear any sessionStorage items
    const sessionKeysToRemove = [
      'current_interview',
      'interview_state',
      'analytics_session',
      'performance_session',
    ];

    sessionKeysToRemove.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`✅ Removed from session: ${key}`);
      }
    });

    // Clear any IndexedDB data (if used)
    this.clearIndexedDBData();

    console.log('✅ All interview data cleared successfully!');
  }

  /**
   * Clear IndexedDB data related to interviews
   */
  private static clearIndexedDBData(): void {
    try {
      // List of potential IndexedDB databases to clear
      const dbNames = [
        'InterviewAnalytics',
        'PerformanceData',
        'SpeechAnalysis',
        'BodyLanguageAnalysis',
      ];

      dbNames.forEach(dbName => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        deleteRequest.onsuccess = () => {
          console.log(`✅ Cleared IndexedDB: ${dbName}`);
        };
        deleteRequest.onerror = () => {
          console.log(`ℹ️ IndexedDB ${dbName} not found or already cleared`);
        };
      });
    } catch (error) {
      console.log('ℹ️ IndexedDB clearing skipped (not supported or no data)');
    }
  }

  /**
   * Clear only sample/demo data while keeping real user data
   */
  static clearSampleDataOnly(): void {
    console.log('🧹 Clearing sample/demo data only...');

    const sampleDataKeys = [
      'show_sample_analytics_data',
      'sample_performance_data',
      'demo_interview_data',
      'demo_analytics_data',
    ];

    sampleDataKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed sample data: ${key}`);
      }
    });

    console.log('✅ Sample data cleared successfully!');
  }

  /**
   * Reset analytics settings to defaults
   */
  static resetAnalyticsSettings(): void {
    console.log('🔄 Resetting analytics settings to defaults...');

    // Remove analytics settings to force defaults
    localStorage.removeItem('analytics_settings');
    localStorage.removeItem('user_preferences');
    
    console.log('✅ Analytics settings reset to defaults!');
  }

  /**
   * Verify data has been cleared
   */
  static verifyDataCleared(): boolean {
    const criticalKeys = [
      'interview_performance_history',
      'performance_analytics_data',
      'show_sample_analytics_data',
    ];

    const remainingData = criticalKeys.filter(key => localStorage.getItem(key) !== null);
    
    if (remainingData.length === 0) {
      console.log('✅ Verification passed: All critical data cleared');
      return true;
    } else {
      console.warn('⚠️ Verification failed: Some data still exists:', remainingData);
      return false;
    }
  }

  /**
   * Get current storage usage for interview data
   */
  static getStorageUsage(): { [key: string]: number } {
    const usage: { [key: string]: number } = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.isInterviewRelatedKey(key)) {
        const value = localStorage.getItem(key);
        usage[key] = value ? value.length : 0;
      }
    }

    return usage;
  }

  /**
   * Check if a localStorage key is related to interview data
   */
  private static isInterviewRelatedKey(key: string): boolean {
    const interviewKeywords = [
      'interview',
      'performance',
      'analytics',
      'speech',
      'body_language',
      'mock',
      'analysis',
      'score',
      'feedback',
    ];

    return interviewKeywords.some(keyword => 
      key.toLowerCase().includes(keyword)
    );
  }

  /**
   * Complete data reset - clears everything and reloads page
   */
  static completeReset(): void {
    console.log('🔄 Performing complete data reset...');
    
    this.clearAllInterviewData();
    this.resetAnalyticsSettings();
    
    // Verify clearing was successful
    if (this.verifyDataCleared()) {
      console.log('✅ Complete reset successful! Reloading page...');
      
      // Add a small delay then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      console.error('❌ Reset verification failed');
    }
  }

  /**
   * Safe reset - clears data but asks for confirmation
   */
  static safeReset(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        'This will clear all stored interview data and analytics. Are you sure you want to continue?'
      );
      
      if (confirmed) {
        this.completeReset();
        resolve(true);
      } else {
        console.log('ℹ️ Reset cancelled by user');
        resolve(false);
      }
    });
  }
}

// Export convenience functions
export const clearAllInterviewData = () => DataCleaner.clearAllInterviewData();
export const clearSampleDataOnly = () => DataCleaner.clearSampleDataOnly();
export const completeReset = () => DataCleaner.completeReset();
export const safeReset = () => DataCleaner.safeReset();
