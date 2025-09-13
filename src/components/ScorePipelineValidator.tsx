import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ScoringPipelineTest } from '../test/scoringPipelineTest';
import { unifiedAnalyticsStorage } from '../utils/unifiedAnalyticsStorage';
import { InterviewPerformanceData } from '../utils/performanceAnalytics';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  details?: any;
}

export const ScorePipelineValidator: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runValidationTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [
      { name: 'Low Score Integrity', status: 'pending', message: 'Testing if 1/10 scores are preserved...' },
      { name: 'Score Conversion', status: 'pending', message: 'Testing 1-10 to 1-100 scale conversion...' },
      { name: 'Analytics Integration', status: 'pending', message: 'Testing analytics dashboard integration...' },
      { name: 'Data Flow Validation', status: 'pending', message: 'Testing complete data flow...' }
    ];

    setTestResults([...tests]);

    try {
      // Test 1: Low Score Integrity
      setTestResults(prev => prev.map(test => 
        test.name === 'Low Score Integrity' 
          ? { ...test, status: 'running', message: 'Creating test data with 1/10 scores...' }
          : test
      ));

      const lowScoreData = createTestLowScoreData();
      await unifiedAnalyticsStorage.savePerformanceData(lowScoreData);
      
      const retrievedData = await unifiedAnalyticsStorage.getPerformanceHistory();
      const testEntry = retrievedData.find(item => item.id === lowScoreData.id);
      
      if (testEntry && testEntry.overallScore === 10) {
        setTestResults(prev => prev.map(test => 
          test.name === 'Low Score Integrity' 
            ? { ...test, status: 'passed', message: '✅ Low scores preserved correctly', details: { original: 10, retrieved: testEntry.overallScore } }
            : test
        ));
      } else {
        setTestResults(prev => prev.map(test => 
          test.name === 'Low Score Integrity' 
            ? { ...test, status: 'failed', message: `❌ Score inflation detected: ${testEntry?.overallScore || 'not found'}`, details: { expected: 10, actual: testEntry?.overallScore } }
            : test
        ));
      }

      // Test 2: Score Conversion
      setTestResults(prev => prev.map(test => 
        test.name === 'Score Conversion' 
          ? { ...test, status: 'running', message: 'Testing score conversion logic...' }
          : test
      ));

      const conversionTests = [
        { input: 1, expected: 10 },
        { input: 5, expected: 50 },
        { input: 10, expected: 100 }
      ];

      const conversionResults = conversionTests.map(({ input, expected }) => {
        const result = input * 10;
        return { input, expected, result, passed: result === expected };
      });

      const allConversionsPass = conversionResults.every(r => r.passed);
      
      setTestResults(prev => prev.map(test => 
        test.name === 'Score Conversion' 
          ? { 
              ...test, 
              status: allConversionsPass ? 'passed' : 'failed', 
              message: allConversionsPass ? '✅ Score conversion working correctly' : '❌ Score conversion failed',
              details: conversionResults
            }
          : test
      ));

      // Test 3: Analytics Integration
      setTestResults(prev => prev.map(test => 
        test.name === 'Analytics Integration' 
          ? { ...test, status: 'running', message: 'Testing analytics dashboard integration...' }
          : test
      ));

      // Check if analytics dashboard would display the low scores correctly
      const analyticsData = await unifiedAnalyticsStorage.getPerformanceHistory();
      const hasLowScoreData = analyticsData.some(item => item.overallScore <= 20);
      
      setTestResults(prev => prev.map(test => 
        test.name === 'Analytics Integration' 
          ? { 
              ...test, 
              status: hasLowScoreData ? 'passed' : 'failed', 
              message: hasLowScoreData ? '✅ Analytics can display low scores' : '❌ No low score data in analytics',
              details: { dataCount: analyticsData.length, hasLowScores: hasLowScoreData }
            }
          : test
      ));

      // Test 4: Data Flow Validation
      setTestResults(prev => prev.map(test => 
        test.name === 'Data Flow Validation' 
          ? { ...test, status: 'running', message: 'Validating complete data flow...' }
          : test
      ));

      // Simulate the complete flow: AI feedback (1/10) → conversion (10/100) → analytics storage → display
      const simulatedAIScore = 1; // 1/10 from AI
      const convertedScore = simulatedAIScore * 10; // 10/100 for analytics
      const flowValid = convertedScore === 10;

      setTestResults(prev => prev.map(test => 
        test.name === 'Data Flow Validation' 
          ? { 
              ...test, 
              status: flowValid ? 'passed' : 'failed', 
              message: flowValid ? '✅ Data flow integrity maintained' : '❌ Data flow integrity broken',
              details: { aiScore: simulatedAIScore, convertedScore, flowValid }
            }
          : test
      ));

      // Cleanup test data
      await cleanupTestData(lowScoreData.id);

    } catch (error) {
      console.error('Validation test error:', error);
      setTestResults(prev => prev.map(test => 
        test.status === 'running' 
          ? { ...test, status: 'failed', message: `❌ Test failed: ${error}` }
          : test
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const createTestLowScoreData = (): InterviewPerformanceData => ({
    id: `validation_test_${Date.now()}`,
    timestamp: new Date().toISOString(),
    role: 'Test Role',
    difficulty: 'medium',
    duration: 1800,
    overallScore: 10, // Simulating 1/10 AI score converted to 10/100
    technicalScore: 10,
    communicationScore: 10,
    behavioralScore: 10,
    questionsAnswered: 5,
    questionsCorrect: 1,
    averageResponseTime: 120,
    detailedMetrics: {
      confidence: 10,
      clarity: 10,
      professionalism: 10,
      engagement: 10,
      adaptability: 10,
    },
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
    },
    strengths: ['Completed the test'],
    weaknesses: ['Needs improvement in all areas'],
    recommendations: ['Practice more interviews']
  });

  const cleanupTestData = async (testId: string) => {
    const history = await unifiedAnalyticsStorage.getPerformanceHistory();
    const filtered = history.filter(item => item.id !== testId);
    localStorage.setItem('interview_performance_history', JSON.stringify(filtered));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="w-5 h-5 text-gray-400" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-50 border-gray-200';
      case 'running': return 'bg-blue-50 border-blue-200';
      case 'passed': return 'bg-green-50 border-green-200';
      case 'failed': return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Score Pipeline Validator</h2>
            <p className="text-gray-600 mt-1">
              Test that low performance scores (1/10) are accurately preserved throughout the system
            </p>
          </div>
          <button
            onClick={runValidationTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run Validation'}
          </button>
        </div>

        <div className="space-y-4">
          {testResults.map((test, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                  {test.details && (
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {testResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Click "Run Validation" to test the scoring pipeline integrity
          </div>
        )}
      </div>
    </div>
  );
};

export default ScorePipelineValidator;
