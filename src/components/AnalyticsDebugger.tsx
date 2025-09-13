import React, { useState, useEffect } from 'react';
import { analyticsStorage } from '../utils/analyticsStorage';
import { unifiedAnalyticsStorage } from '../utils/unifiedAnalyticsStorage';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';

const AnalyticsDebugger: React.FC = () => {
  const [localData, setLocalData] = useState<InterviewPerformanceData[]>([]);
  const [unifiedData, setUnifiedData] = useState<InterviewPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load local data
      const local = analyticsStorage.getPerformanceHistory();
      setLocalData(local);
      console.log("🔍 Local data:", local);

      // Load unified data
      const unified = await unifiedAnalyticsStorage.getPerformanceHistory();
      setUnifiedData(unified);
      console.log("🔍 Unified data:", unified);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestData = async () => {
    const testData: InterviewPerformanceData = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: "Software Engineer",
      difficulty: "medium",
      duration: 1800,
      overallScore: 85,
      technicalScore: 88,
      communicationScore: 82,
      behavioralScore: 87,
      questionsAnswered: 10,
      questionsCorrect: 8,
      averageResponseTime: 45,
      detailedMetrics: {
        confidence: 85,
        clarity: 80,
        professionalism: 90,
        engagement: 88,
        adaptability: 82
      },
      speechAnalysis: {
        wordsPerMinute: 150,
        fillerWords: 5,
        pauseFrequency: 8,
        volumeConsistency: 85,
        clarityScore: 88
      },
      bodyLanguageAnalysis: {
        eyeContact: 85,
        posture: 90,
        gestures: 80,
        facialExpressions: 88,
        overallConfidence: 86
      },
      strengths: ["Clear communication", "Technical knowledge"],
      weaknesses: ["Could improve confidence"],
      recommendations: ["Practice more technical questions"]
    };

    console.log("🧪 Creating test data:", testData);
    
    // Save using unified storage
    const result = await unifiedAnalyticsStorage.savePerformanceData(testData);
    console.log("💾 Save result:", result);
    
    // Reload data
    await loadData();
  };

  const clearAllData = () => {
    analyticsStorage.clearAllData();
    setLocalData([]);
    setUnifiedData([]);
    console.log("🗑️ All data cleared");
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Analytics Debugger
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Reload Data"}
          </button>
          
          <button
            onClick={createTestData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Test Interview
          </button>
          
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Local Storage ({localData.length} interviews)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {localData.map((interview) => (
                <div key={interview.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  <div className="font-medium">{interview.role}</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Score: {interview.overallScore} | {new Date(interview.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {localData.length === 0 && (
                <div className="text-gray-500 italic">No local data found</div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Unified Storage ({unifiedData.length} interviews)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unifiedData.map((interview) => (
                <div key={interview.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  <div className="font-medium">{interview.role}</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Score: {interview.overallScore} | {new Date(interview.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {unifiedData.length === 0 && (
                <div className="text-gray-500 italic">No unified data found</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Debug Instructions:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            <li>Check browser console for detailed logs</li>
            <li>Create test interview to verify save functionality</li>
            <li>Check if data appears in both local and unified storage</li>
            <li>Verify authentication status for cloud sync</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDebugger;
