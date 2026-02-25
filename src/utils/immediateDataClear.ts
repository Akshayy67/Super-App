/**
 * Immediate Data Clear - One-time nuclear reset of ALL analytics data
 * Clears localStorage, sessionStorage, IndexedDB, AND Firestore cloud data
 */
import { unifiedAnalyticsStorage } from "./unifiedAnalyticsStorage";

const CLEAR_FLAG = "data_cleared_v3";

// Clear all localStorage items related to interviews
const clearLocalStorage = () => {
  console.log('🧹 Clearing localStorage...');

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== CLEAR_FLAG) {
      const lower = key.toLowerCase();
      if (
        lower.includes('interview') ||
        lower.includes('performance') ||
        lower.includes('analytics') ||
        lower.includes('score') ||
        lower.includes('feedback') ||
        lower.includes('mock') ||
        lower.includes('sample') ||
        lower.includes('demo') ||
        lower.includes('speech') ||
        lower.includes('body_language') ||
        lower.includes('question_history') ||
        lower.includes('improvement') ||
        lower.includes('achievement') ||
        lower.includes('cache')
      ) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  });

  console.log(`✅ Cleared ${keysToRemove.length} localStorage items`);
};

// Clear sessionStorage
const clearSessionStorage = () => {
  console.log('🧹 Clearing sessionStorage...');
  sessionStorage.clear();
  console.log('✅ Cleared all sessionStorage');
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

// Clear Firestore cloud data (async)
const clearCloudData = async () => {
  try {
    console.log('🧹 Clearing cloud analytics data...');
    await unifiedAnalyticsStorage.clearAllData();
    console.log('✅ Cloud analytics data cleared!');
  } catch (error) {
    console.warn('⚠️ Cloud data clearing failed (may not be authenticated yet):', error);
  }
};

// Main clearing function
const clearAllData = () => {
  // Only run this nuclear clear ONCE
  if (localStorage.getItem(CLEAR_FLAG)) {
    return;
  }

  console.log('🚀 Starting one-time nuclear data clear...');

  clearLocalStorage();
  clearSessionStorage();
  clearIndexedDB();
  clearCloudData(); // async, runs in background

  // Set flag so this never runs again
  localStorage.setItem(CLEAR_FLAG, new Date().toISOString());

  console.log('✅ Nuclear data clear completed!');
  console.log('🔄 Analytics will now be based purely on your real interview data going forward');
};

// Run the clearing immediately when this module is imported
clearAllData();

export { clearAllData };
