import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Mic,
  Play,
  Pause,
  Phone,
  PhoneOff,
  Camera,
  VideoOff,
  BarChart3,
  Brain,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  Volume2,
  Users,
  Target,
  Award,
  Clock,
  Zap,
} from "lucide-react";
import { vapi } from "../lib/vapi.sdk";
import { SpeechAnalyzer, SpeechAnalysisResult } from "../utils/speechAnalysis";
import {
  BodyLanguageAnalyzer,
  BodyLanguageAnalysisResult,
} from "../utils/bodyLanguageAnalysis";
import {
  IntelligentQuestionGenerator,
  QuestionGenerationContext,
} from "../utils/intelligentQuestionGeneration";
import {
  PerformanceAnalytics,
  InterviewPerformanceData,
} from "../utils/performanceAnalytics";

interface EnhancedMockInterviewProps {
  role: string;
  difficulty: "easy" | "medium" | "hard";
  interviewType: "technical" | "behavioral" | "mixed";
  onComplete?: (results: InterviewPerformanceData) => void;
}

enum CallStatus {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  ACTIVE = "active",
  FINISHED = "finished",
}

export const EnhancedMockInterview: React.FC<EnhancedMockInterviewProps> = ({
  role,
  difficulty,
  interviewType,
  onComplete,
}) => {
  // Core interview state
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Analysis state
  const [speechAnalysisResult, setSpeechAnalysisResult] =
    useState<SpeechAnalysisResult | null>(null);
  const [bodyLanguageResult, setBodyLanguageResult] =
    useState<BodyLanguageAnalysisResult | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    fillerWordCount: 0,
    eyeContactPercentage: 0,
    confidenceScore: 0,
    speakingPace: 0,
  });

  // Video and analysis
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyzers
  const speechAnalyzer = useRef<SpeechAnalyzer>(new SpeechAnalyzer());
  const bodyLanguageAnalyzer = useRef<BodyLanguageAnalyzer>(
    new BodyLanguageAnalyzer()
  );
  const questionGenerator = useRef<IntelligentQuestionGenerator>(
    new IntelligentQuestionGenerator()
  );
  const performanceAnalytics = useRef<PerformanceAnalytics>(
    new PerformanceAnalytics()
  );

  // Error handling
  const [error, setError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAnalyzers();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => {
        setInterviewDuration(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, startTime]);

  const initializeAnalyzers = async () => {
    try {
      // Initialize video stream
      if (isVideoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Initialize body language analyzer
        if (videoRef.current) {
          await bodyLanguageAnalyzer.current.initialize(videoRef.current);
        }
      }

      // Initialize speech analyzer
      const speechInitialized = await speechAnalyzer.current.initialize();

      if (!speechInitialized) {
        setError(
          "Failed to initialize speech analysis. Microphone access required."
        );
        return;
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize analyzers:", error);
      setError(
        "Failed to initialize analysis systems. Please check permissions."
      );
    }
  };

  const startInterview = async () => {
    if (!isInitialized) {
      setError(
        "Analysis systems not initialized. Please refresh and try again."
      );
      return;
    }

    try {
      setCallStatus(CallStatus.CONNECTING);
      setStartTime(Date.now());
      setError("");

      // Generate initial questions
      const context: QuestionGenerationContext = {
        role,
        difficulty,
        previousAnswers: [],
        performanceMetrics: {
          technicalScore: 75,
          communicationScore: 75,
          confidenceScore: 75,
        },
        focusAreas: ["communication", "technical skills"],
        interviewType,
        timeRemaining: 30,
      };

      const initialQuestions =
        await questionGenerator.current.generateInitialQuestions(context);
      if (initialQuestions.length > 0) {
        setCurrentQuestion(initialQuestions[0].question);
      }

      // Start analysis systems
      setIsAnalyzing(true);
      speechAnalyzer.current.startAnalysis();
      if (isVideoEnabled) {
        bodyLanguageAnalyzer.current.startAnalysis();
      }

      // Start real-time metrics updates
      startRealTimeMetrics();

      // Start VAPI call
      await vapi.start({
        name: "Enhanced Interviewer",
        firstMessage: `Hello! Welcome to your ${difficulty} level ${role} interview. I'll be conducting a comprehensive assessment that includes ${interviewType} questions. Let's begin with: ${currentQuestion}`,
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2",
          language: "en" as const,
        },
        voice: {
          provider: "11labs" as const,
          voiceId: "sarah",
          stability: 0.4,
          similarityBoost: 0.8,
          speed: 0.9,
          style: 0.5,
          useSpeakerBoost: true,
        },
        model: {
          provider: "openai" as const,
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are conducting an enhanced ${interviewType} interview for a ${role} position at ${difficulty} difficulty level. 

Key Instructions:
1. Ask thoughtful, role-appropriate questions
2. Listen carefully to responses and ask relevant follow-ups
3. Maintain a professional but friendly tone
4. Keep responses concise for voice conversation
5. Adapt question difficulty based on candidate responses
6. Focus on both technical skills and soft skills
7. Provide encouragement while maintaining assessment standards

Current question to start with: ${currentQuestion}

Remember: This is a voice conversation, so keep all responses short and conversational.`,
            },
          ],
        },
      });

      setCallStatus(CallStatus.ACTIVE);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting enhanced interview:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start interview"
      );
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const endInterview = async () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      setIsRecording(false);
      setIsAnalyzing(false);

      // Stop analysis systems
      const speechResults = await speechAnalyzer.current.stopAnalysis();
      const bodyLanguageResults = bodyLanguageAnalyzer.current.stopAnalysis();

      setSpeechAnalysisResult(speechResults);
      setBodyLanguageResult(bodyLanguageResults);

      // Stop VAPI call
      await vapi.stop();

      // Generate comprehensive performance data
      const performanceData = generatePerformanceData(
        speechResults,
        bodyLanguageResults
      );

      // Save performance data
      performanceAnalytics.current.savePerformanceData(performanceData);

      // Call completion callback
      if (onComplete) {
        onComplete(performanceData);
      }
    } catch (err) {
      console.error("Error ending interview:", err);
      setError("Error ending interview");
    }
  };

  const startRealTimeMetrics = () => {
    const updateMetrics = () => {
      if (!isAnalyzing) return;

      // Update real-time metrics (simplified for demo)
      setRealTimeMetrics((prev) => ({
        fillerWordCount: prev.fillerWordCount + (Math.random() < 0.1 ? 1 : 0),
        eyeContactPercentage: Math.max(
          0,
          Math.min(100, prev.eyeContactPercentage + (Math.random() - 0.5) * 5)
        ),
        confidenceScore: Math.max(
          0,
          Math.min(100, prev.confidenceScore + (Math.random() - 0.5) * 3)
        ),
        speakingPace: 140 + Math.random() * 40, // 140-180 WPM
      }));

      setTimeout(updateMetrics, 2000); // Update every 2 seconds
    };

    updateMetrics();
  };

  const generatePerformanceData = (
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): InterviewPerformanceData => {
    const duration = (Date.now() - startTime) / 1000;

    // Calculate scores based on analysis results
    const technicalScore = 70 + Math.random() * 25; // Mock technical assessment
    const communicationScore =
      (speechResults.pronunciationAssessment.overallScore +
        speechResults.confidenceScore.overall) /
      2;
    const behavioralScore = bodyLanguageResults.overallBodyLanguage.score;
    const overallScore =
      (technicalScore + communicationScore + behavioralScore) / 3;

    return {
      id: `interview_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role,
      difficulty,
      duration,
      overallScore: Math.round(overallScore),
      technicalScore: Math.round(technicalScore),
      communicationScore: Math.round(communicationScore),
      behavioralScore: Math.round(behavioralScore),
      speechAnalysis: speechResults,
      bodyLanguageAnalysis: bodyLanguageResults,
      questionsAnswered: questionCount,
      questionsCorrect: Math.floor(questionCount * 0.7), // Mock correct answers
      averageResponseTime: 15 + Math.random() * 10, // Mock response time
      detailedMetrics: {
        confidence: speechResults.confidenceScore.overall,
        clarity: speechResults.pronunciationAssessment.clarity,
        professionalism:
          bodyLanguageResults.overallBodyLanguage.professionalismScore,
        engagement: bodyLanguageResults.facialExpressions.engagement,
        adaptability: 75 + Math.random() * 20, // Mock adaptability score
      },
      strengths: [
        ...bodyLanguageResults.overallBodyLanguage.strengths,
        ...(speechResults.pronunciationAssessment.overallScore > 80
          ? ["Clear pronunciation"]
          : []),
        ...(speechResults.fillerWords.percentage < 5
          ? ["Minimal filler words"]
          : []),
      ],
      weaknesses: [
        ...bodyLanguageResults.overallBodyLanguage.improvements,
        ...speechResults.pronunciationAssessment.issues,
        ...(speechResults.fillerWords.percentage > 10
          ? ["Excessive filler words"]
          : []),
      ],
      recommendations: [
        "Continue practicing with mock interviews",
        "Focus on maintaining consistent eye contact",
        "Work on reducing speaking pace variations",
        "Practice answering behavioral questions with specific examples",
      ],
    };
  };

  const cleanup = () => {
    speechAnalyzer.current.cleanup();
    bodyLanguageAnalyzer.current.cleanup();

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case CallStatus.ACTIVE:
        return "text-green-600";
      case CallStatus.CONNECTING:
        return "text-yellow-600";
      case CallStatus.FINISHED:
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: CallStatus) => {
    switch (status) {
      case CallStatus.ACTIVE:
        return "Interview Active";
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.FINISHED:
        return "Interview Complete";
      default:
        return "Ready to Start";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Enhanced AI Interview
            </h2>
            <p className="text-gray-600">
              {role} • {difficulty} • {interviewType}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${getStatusColor(
                callStatus
              )}`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">{getStatusText(callStatus)}</span>
            </div>
            {callStatus === CallStatus.ACTIVE && (
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono">
                  {formatDuration(interviewDuration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video and Controls */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                muted
                playsInline
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-white">
                <VideoOff className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {callStatus === CallStatus.INACTIVE && (
              <button
                onClick={startInterview}
                disabled={!isInitialized}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Interview
              </button>
            )}

            {callStatus === CallStatus.ACTIVE && (
              <button
                onClick={endInterview}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
                End Interview
              </button>
            )}

            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3 rounded-lg transition-colors ${
                isVideoEnabled
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {isVideoEnabled ? (
                <Camera className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Real-time Analysis
          </h3>

          {/* Filler Words */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Filler Words</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {realTimeMetrics.fillerWordCount}
            </div>
            <div className="text-sm text-blue-700">
              {realTimeMetrics.fillerWordCount < 5
                ? "Excellent"
                : realTimeMetrics.fillerWordCount < 10
                ? "Good"
                : "Needs Improvement"}
            </div>
          </div>

          {/* Eye Contact */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Eye Contact</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(realTimeMetrics.eyeContactPercentage)}%
            </div>
            <div className="text-sm text-green-700">
              {realTimeMetrics.eyeContactPercentage > 70
                ? "Excellent"
                : realTimeMetrics.eyeContactPercentage > 50
                ? "Good"
                : "Needs Improvement"}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Confidence</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(realTimeMetrics.confidenceScore)}
            </div>
            <div className="text-sm text-purple-700">
              {realTimeMetrics.confidenceScore > 80
                ? "High"
                : realTimeMetrics.confidenceScore > 60
                ? "Moderate"
                : "Low"}
            </div>
          </div>

          {/* Speaking Pace */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Speaking Pace</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(realTimeMetrics.speakingPace)} WPM
            </div>
            <div className="text-sm text-orange-700">
              {realTimeMetrics.speakingPace >= 140 &&
              realTimeMetrics.speakingPace <= 160
                ? "Optimal"
                : realTimeMetrics.speakingPace < 140
                ? "Too Slow"
                : "Too Fast"}
            </div>
          </div>
        </div>
      </div>

      {/* Current Question Display */}
      {callStatus === CallStatus.ACTIVE && currentQuestion && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Current Question</span>
          </div>
          <p className="text-blue-800">{currentQuestion}</p>
        </div>
      )}
    </div>
  );
};
