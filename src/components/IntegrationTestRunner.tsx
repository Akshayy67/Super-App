import React, { useState } from "react";
import {
  Play,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  analyticsIntegrationTest,
  TestResult,
} from "../utils/analyticsIntegrationTest";

export const IntegrationTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<{
    passed: number;
    failed: number;
    total: number;
  } | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setTestSummary(null);

    try {
      console.log("🧪 Starting analytics integration tests...");
      const results = await analyticsIntegrationTest.runAllTests();
      setTestResults(results);
      setTestSummary(analyticsIntegrationTest.getTestSummary());
    } catch (error) {
      console.error("Test execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    const data = analyticsIntegrationTest.exportTestResults();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-test-results-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTestIcon = (result: TestResult) => {
    if (result.passed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getOverallStatus = () => {
    if (!testSummary) return null;
    
    if (testSummary.failed === 0) {
      return {
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        text: "All Tests Passed",
        color: "text-green-600 bg-green-50 border-green-200",
      };
    } else if (testSummary.passed > testSummary.failed) {
      return {
        icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
        text: "Some Tests Failed",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    } else {
      return {
        icon: <XCircle className="w-6 h-6 text-red-600" />,
        text: "Multiple Failures",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Analytics Integration Tests
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Validate the complete analytics integration flow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? "Running Tests..." : "Run Tests"}
          </button>
          {testResults.length > 0 && (
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          )}
        </div>
      </div>

      {/* Test Status */}
      {isRunning && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Running Integration Tests
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Testing data storage, validation, AI analysis, and complete data flow...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Summary */}
      {testSummary && overallStatus && (
        <div className={`mb-6 p-4 border rounded-lg ${overallStatus.color}`}>
          <div className="flex items-center gap-3">
            {overallStatus.icon}
            <div className="flex-1">
              <h3 className="font-medium">{overallStatus.text}</h3>
              <p className="text-sm">
                {testSummary.passed} passed, {testSummary.failed} failed out of{" "}
                {testSummary.total} tests
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round((testSummary.passed / testSummary.total) * 100)}%
              </div>
              <div className="text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Results
          </h3>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  result.passed
                    ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                    : "border-red-200 bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {getTestIcon(result)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {result.testName}
                    </h4>
                    <p
                      className={`text-sm ${
                        result.passed
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Ready to Test Analytics Integration
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click "Run Tests" to validate the complete analytics integration flow.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Tests will validate:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Data storage and retrieval</li>
              <li>Data validation and error detection</li>
              <li>AI analysis functionality</li>
              <li>Complete data flow from interview to analytics</li>
            </ul>
          </div>
        </div>
      )}

      {/* Test Categories Info */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Test Categories
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200">
              Data Storage Tests
            </h5>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Save interview data</li>
              <li>• Retrieve by ID</li>
              <li>• Performance history</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200">
              Data Validation Tests
            </h5>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Basic validation</li>
              <li>• Invalid data detection</li>
              <li>• Error reporting</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200">
              AI Analysis Tests
            </h5>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Performance analysis</li>
              <li>• Trend analysis</li>
              <li>• Personalized insights</li>
              <li>• Comprehensive reports</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200">
              Data Flow Tests
            </h5>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• End-to-end flow</li>
              <li>• Interview completion</li>
              <li>• Analytics display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
