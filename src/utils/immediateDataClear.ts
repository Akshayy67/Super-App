/**
 * Immediate Data Clear - Run this to clear all stored data right now
 */

// Clear all localStorage items related to interviews
const clearLocalStorage = () => {
  console.log('🧹 Clearing localStorage...');
  
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
    'demo_analytics_data',
    
    // Cache and temporary data
    'speech_analysis_cache',
    'body_language_cache',
    'interview_session_cache',
    'performance_cache',
    
    // Any other interview-related keys
    'last_interview_results',
    'current_interview_session',
    'interview_validation_data',
  ];

  let clearedCount = 0;
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Removed: ${key}`);
    }
  });

  console.log(`✅ Cleared ${clearedCount} localStorage items`);
};

// Clear sessionStorage
const clearSessionStorage = () => {
  console.log('🧹 Clearing sessionStorage...');
  
  const sessionKeysToRemove = [
    'current_interview',
    'interview_state', 
    'analytics_session',
    'performance_session',
  ];

  let clearedCount = 0;
  sessionKeysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Removed from session: ${key}`);
    }
  });

  console.log(`✅ Cleared ${clearedCount} sessionStorage items`);
};

// Clear IndexedDB
const clearIndexedDB = () => {
  console.log('🧹 Clearing IndexedDB...');
  
  const dbNames = [
    'InterviewAnalytics',
    'PerformanceData', 
    'SpeechAnalysis',
    'BodyLanguageAnalysis',
  ];

  dbNames.forEach(dbName => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => {
        console.log(`✅ Cleared IndexedDB: ${dbName}`);
      };
      deleteRequest.onerror = () => {
        console.log(`ℹ️ IndexedDB ${dbName} not found`);
      };
    } catch (error) {
      console.log(`ℹ️ IndexedDB ${dbName} clearing skipped`);
    }
  });
};

// Main clearing function
const clearAllData = () => {
  console.log('🚀 Starting immediate data clear...');
  
  clearLocalStorage();
  clearSessionStorage();
  clearIndexedDB();
  
  console.log('✅ Immediate data clear completed!');
  console.log('🔄 Data cleared - analytics will now be based purely on your real interview data');
};

// Run the clearing immediately when this module is imported
clearAllData();

export { clearAllData };
