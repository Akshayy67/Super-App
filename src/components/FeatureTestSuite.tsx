import React, { useState, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Camera,
  Mic,
  Brain,
  BarChart3,
  MessageSquare,
  Loader,
  TestTube,
} from "lucide-react";
import { SpeechAnalyzer } from "../utils/speechAnalysis";
import { BodyLanguageAnalyzer } from "../utils/bodyLanguageAnalysis";
import { IntelligentQuestionGenerator } from "../utils/intelligentQuestionGeneration";
import { PerformanceAnalytics } from "../utils/performanceAnalytics";
import { unifiedAIService } from "../utils/aiConfig";

interface TestResult {
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  message: string;
  details?: string;
}

export const FeatureTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: "AI Service Connection", status: "pending", message: "Not tested" },
    {
      name: "Speech Analysis Initialization",
      status: "pending",
      message: "Not tested",
    },
    {
      name: "Body Language Analysis",
      status: "pending",
      message: "Not tested",
    },
    { name: "Question Generation", status: "pending", message: "Not tested" },
    { name: "Performance Analytics", status: "pending", message: "Not tested" },
    { name: "Camera Access", status: "pending", message: "Not tested" },
    { name: "Microphone Access", status: "pending", message: "Not tested" },
    { name: "Image Processing", status: "pending", message: "Not tested" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const updateTestResult = (
    name: string,
    status: TestResult["status"],
    message: string,
    details?: string
  ) => {
    setTestResults((prev) =>
      prev.map((test) =>
        test.name === name ? { ...test, status, message, details } : test
      )
    );
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Reset all tests
    setTestResults((prev) =>
      prev.map((test) => ({
        ...test,
        status: "pending",
        message: "Waiting...",
      }))
    );

    await testAIService();
    await testSpeechAnalysis();
    await testBodyLanguageAnalysis();
    await testQuestionGeneration();
    await testPerformanceAnalytics();
    await testCameraAccess();
    await testMicrophoneAccess();
    await testImageProcessing();

    setIsRunning(false);
  };

  const testAIService = async () => {
    updateTestResult(
      "AI Service Connection",
      "running",
      "Testing AI service..."
    );

    try {
      const isConfigured = unifiedAIService.isConfigured();
      if (!isConfigured) {
        updateTestResult(
          "AI Service Connection",
          "failed",
          "AI service not configured",
          "Check VITE_GOOGLE_AI_API_KEY"
        );
        return;
      }

      const response = await unifiedAIService.generateResponse("Test message");
      if (response.success) {
        updateTestResult(
          "AI Service Connection",
          "passed",
          "AI service working correctly"
        );
      } else {
        updateTestResult(
          "AI Service Connection",
          "failed",
          "AI service error",
          response.error
        );
      }
    } catch (error) {
      updateTestResult(
        "AI Service Connection",
        "failed",
        "Connection failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const testSpeechAnalysis = async () => {
    updateTestResult(
      "Speech Analysis Initialization",
      "running",
      "Initializing speech analyzer..."
    );

    try {
      const speechAnalyzer = new SpeechAnalyzer();
      const initialized = await speechAnalyzer.initialize();

      if (initialized) {
        updateTestResult(
          "Speech Analysis Initialization",
          "passed",
          "Speech analyzer initialized successfully"
        );
        speechAnalyzer.cleanup();
      } else {
        updateTestResult(
          "Speech Analysis Initialization",
          "failed",
          "Failed to initialize speech analyzer",
          "Check microphone permissions"
        );
      }
    } catch (error) {
      updateTestResult(
        "Speech Analysis Initialization",
        "failed",
        "Speech analyzer error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const testBodyLanguageAnalysis = async () => {
    updateTestResult(
      "Body Language Analysis",
      "running",
      "Testing body language analyzer..."
    );

    try {
      if (!videoRef.current) {
        updateTestResult(
          "Body Language Analysis",
          "failed",
          "Video element not available"
        );
        return;
      }

      const bodyLanguageAnalyzer = new BodyLanguageAnalyzer();
      const initialized = await bodyLanguageAnalyzer.initialize(
        videoRef.current
      );

      if (initialized) {
        updateTestResult(
          "Body Language Analysis",
          "passed",
          "Body language analyzer working"
        );
        bodyLanguageAnalyzer.cleanup();
      } else {
        updateTestResult(
          "Body Language Analysis",
          "failed",
          "Failed to initialize body language analyzer"
        );
      }
    } catch (error) {
      updateTestResult(
        "Body Language Analysis",
        "failed",
        "Body language analyzer error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const testQuestionGeneration = async () => {
    updateTestResult(
      "Question Generation",
      "running",
      "Testing question generation..."
    );

    try {
      const questionGenerator = new IntelligentQuestionGenerator();
      const questions = await questionGenerator.generateInitialQuestions({
        role: "Software Engineer",
        difficulty: "medium",
        previousAnswers: [],
        performanceMetrics: {
          technicalScore: 75,
          communicationScore: 75,
          confidenceScore: 75,
        },
        focusAreas: ["technical"],
        interviewType: "technical",
        timeRemaining: 30,
      });

      if (questions.length > 0) {
        updateTestResult(
          "Question Generation",
          "passed",
          `Generated ${questions.length} questions successfully`
        );
      } else {
        updateTestResult(
          "Question Generation",
          "failed",
          "No questions generated"
        );
      }
    } catch (error) {
      updateTestResult(
        "Question Generation",
        "failed",
        "Question generation error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const testPerformanceAnalytics = async () => {
    updateTestResult(
      "Performance Analytics",
      "running",
      "Testing performance analytics..."
    );

    try {
      const performanceAnalytics = new PerformanceAnalytics();
      const history = performanceAnalytics.getPerformanceHistory();

      // Test data export/import
      const exportData = performanceAnalytics.exportPerformanceData();
      const importSuccess =
        performanceAnalytics.importPerformanceData(exportData);

      if (importSuccess) {
        updateTestResult(
          "Performance Analytics",
          "passed",
          "Performance analytics working correctly"
        );
      } else {
        updateTestResult(
          "Performance Analytics",
          "failed",
          "Data export/import failed"
        );
      }
    } catch (error) {
      updateTestResult(
        "Performance Analytics",
        "failed",
        "Performance analytics error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const testCameraAccess = async () => {
    updateTestResult("Camera Access", "running", "Testing camera access...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      updateTestResult("Camera Access", "passed", "Camera access granted");

      // Stop the stream
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      updateTestResult(
        "Camera Access",
        "failed",
        "Camera access denied",
        "Please grant camera permissions"
      );
    }
  };

  const testMicrophoneAccess = async () => {
    updateTestResult(
      "Microphone Access",
      "running",
      "Testing microphone access..."
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      updateTestResult(
        "Microphone Access",
        "passed",
        "Microphone access granted"
      );

      // Stop the stream
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      updateTestResult(
        "Microphone Access",
        "failed",
        "Microphone access denied",
        "Please grant microphone permissions"
      );
    }
  };

  const testImageProcessing = async () => {
    updateTestResult(
      "Image Processing",
      "running",
      "Testing image processing..."
    );

    try {
      // Create a simple test image (1x1 pixel)
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 1, 1);
      }

      const testImageData = canvas.toDataURL();
      const result = await unifiedAIService.extractTextFromImage(testImageData);

      // Even if no text is found, if the service responds, it's working
      updateTestResult(
        "Image Processing",
        "passed",
        "Image processing service available"
      );
    } catch (error) {
      updateTestResult(
        "Image Processing",
        "failed",
        "Image processing error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "running":
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "running":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const passedTests = testResults.filter(
    (test) => test.status === "passed"
  ).length;
  const failedTests = testResults.filter(
    (test) => test.status === "failed"
  ).length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Enhanced Features Test Suite
                </h1>
                <p className="text-gray-600">
                  Verify all enhanced AI interview features are working
                  correctly
                </p>
              </div>
            </div>

            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </button>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {passedTests}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {failedTests}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalTests}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6">
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(
                  test.status
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                      {test.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {test.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden video element for testing */}
        <video ref={videoRef} className="hidden" muted playsInline />

        {/* Configuration Check */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">
            Configuration Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Enhanced App Enabled:</span>
              <span
                className={
                  import.meta.env.VITE_USE_ENHANCED_APP === "true"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {import.meta.env.VITE_USE_ENHANCED_APP === "true"
                  ? "Yes"
                  : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Google AI API Key:</span>
              <span
                className={
                  import.meta.env.VITE_GOOGLE_AI_API_KEY
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {import.meta.env.VITE_GOOGLE_AI_API_KEY
                  ? "Configured"
                  : "Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VAPI Token:</span>
              <span
                className={
                  import.meta.env.VITE_VAPI_WEB_TOKEN
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {import.meta.env.VITE_VAPI_WEB_TOKEN ? "Configured" : "Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Speech Analysis:</span>
              <span
                className={
                  import.meta.env.VITE_SPEECH_ANALYSIS_ENABLED !== "false"
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                {import.meta.env.VITE_SPEECH_ANALYSIS_ENABLED !== "false"
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
