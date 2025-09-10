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
  const streamRef = useRef<MediaStream | null>(null);
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

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    console.log("Video stream stopped and cleaned up");
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up video stream");
      stopVideoStream();
      speechAnalyzer.current.stopAnalysis();
      bodyLanguageAnalyzer.current.stopAnalysis();
    };
  }, []);

  const initializeAnalyzers = async () => {
    try {
      // Initialize video stream
      if (isVideoEnabled) {
        console.log("Initializing video stream...");

        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera access not supported in this browser");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: true,
        });

        console.log("Video stream obtained:", stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Wait for video to be ready before playing
          await new Promise((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error("Video element not available"));
              return;
            }

            const video = videoRef.current;

            const onLoadedMetadata = () => {
              video.removeEventListener("loadedmetadata", onLoadedMetadata);
              video.removeEventListener("error", onError);
              resolve(void 0);
            };

            const onError = (e: Event) => {
              video.removeEventListener("loadedmetadata", onLoadedMetadata);
              video.removeEventListener("error", onError);
              reject(new Error("Video failed to load"));
            };

            video.addEventListener("loadedmetadata", onLoadedMetadata);
            video.addEventListener("error", onError);
          });

          await videoRef.current.play();
          console.log("Video playing successfully");

          // Initialize body language analyzer
          await bodyLanguageAnalyzer.current.initialize(videoRef.current);
          console.log("Body language analyzer initialized");
        }
      }

      // Initialize speech analyzer
      console.log("Initializing speech analyzer...");
      const speechInitialized = await speechAnalyzer.current.initialize();

      if (!speechInitialized) {
        setError(
          "Failed to initialize speech analysis. Microphone access required."
        );
        return;
      }

      console.log("All analyzers initialized successfully");
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize analyzers:", error);

      let errorMessage = "Failed to initialize analysis systems.";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera and microphone access denied. Please allow permissions and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage =
            "No camera or microphone found. Please connect a device and try again.";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Camera or microphone not supported in this browser.";
        } else {
          errorMessage = `${errorMessage} ${error.message}`;
        }
      }

      setError(errorMessage);
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);

    if (!newVideoState) {
      // If disabling video, stop the stream
      stopVideoStream();
      bodyLanguageAnalyzer.current.stopAnalysis();
    } else if (isInitialized) {
      // If enabling video and already initialized, restart the analyzers
      initializeAnalyzers();
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

    // Calculate sophisticated scores based on real analysis results
    const technicalScore = calculateTechnicalScore(
      speechResults,
      bodyLanguageResults,
      duration
    );
    const communicationScore = calculateCommunicationScore(speechResults);
    const behavioralScore = calculateBehavioralScore(bodyLanguageResults);
    const overallScore = calculateOverallScore(
      technicalScore,
      communicationScore,
      behavioralScore,
      difficulty
    );

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
      questionsCorrect: calculateCorrectAnswers(
        speechResults,
        bodyLanguageResults
      ),
      averageResponseTime: calculateAverageResponseTime(
        speechResults,
        duration
      ),
      detailedMetrics: {
        confidence: speechResults.confidenceScore.overall,
        clarity: speechResults.pronunciationAssessment.clarity,
        professionalism:
          bodyLanguageResults.overallBodyLanguage.professionalismScore,
        engagement: bodyLanguageResults.facialExpressions.engagement,
        adaptability: calculateAdaptabilityScore(
          speechResults,
          bodyLanguageResults
        ),
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

  // Sophisticated scoring calculation functions
  const calculateTechnicalScore = (
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult,
    duration: number
  ): number => {
    let baseScore = 60; // Starting point

    // Speech clarity and articulation (30% weight)
    const speechClarity = speechResults.pronunciationAssessment.clarity;
    const articulation = speechResults.pronunciationAssessment.articulation;
    const speechContribution = ((speechClarity + articulation) / 2) * 0.3;

    // Response structure and coherence (25% weight)
    const fillerWordPenalty = Math.min(
      20,
      speechResults.fillerWords.percentage * 2
    );
    const coherenceScore = Math.max(0, 100 - fillerWordPenalty);
    const coherenceContribution = coherenceScore * 0.25;

    // Professional presence (20% weight)
    const professionalismScore =
      bodyLanguageResults.overallBodyLanguage.professionalismScore;
    const professionalismContribution = professionalismScore * 0.2;

    // Engagement and confidence (15% weight)
    const confidence = speechResults.confidenceScore.overall;
    const engagement = bodyLanguageResults.facialExpressions.engagement;
    const engagementScore = (confidence + engagement) / 2;
    const engagementContribution = engagementScore * 0.15;

    // Time management (10% weight)
    const expectedDuration = questionCount * 120; // 2 minutes per question
    const timeEfficiency = Math.min(100, (expectedDuration / duration) * 100);
    const timeContribution = timeEfficiency * 0.1;

    const finalScore =
      baseScore +
      speechContribution +
      coherenceContribution +
      professionalismContribution +
      engagementContribution +
      timeContribution;

    return Math.round(Math.min(100, Math.max(0, finalScore)));
  };

  const calculateCommunicationScore = (
    speechResults: SpeechAnalysisResult
  ): number => {
    const weights = {
      pronunciation: 0.3,
      fluency: 0.25,
      confidence: 0.2,
      pace: 0.15,
      clarity: 0.1,
    };

    const pronunciation = speechResults.pronunciationAssessment.overallScore;
    const fluency = speechResults.pronunciationAssessment.fluency;
    const confidence = speechResults.confidenceScore.overall;
    const pace = Math.min(100, speechResults.paceAnalysis.wordsPerMinute / 1.5); // Normalize to 150 WPM
    const clarity = speechResults.pronunciationAssessment.clarity;

    const score =
      pronunciation * weights.pronunciation +
      fluency * weights.fluency +
      confidence * weights.confidence +
      pace * weights.pace +
      clarity * weights.clarity;

    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const calculateBehavioralScore = (
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number => {
    const weights = {
      eyeContact: 0.3,
      posture: 0.25,
      facialExpressions: 0.2,
      gestures: 0.15,
      overall: 0.1,
    };

    const eyeContactScore = bodyLanguageResults.eyeContact.score;
    const postureScore = bodyLanguageResults.posture.score;
    const expressionScore =
      (bodyLanguageResults.facialExpressions.confidence +
        bodyLanguageResults.facialExpressions.engagement) /
      2;
    const gestureScore = bodyLanguageResults.gestures.score;
    const overallScore = bodyLanguageResults.overallBodyLanguage.score;

    const score =
      eyeContactScore * weights.eyeContact +
      postureScore * weights.posture +
      expressionScore * weights.facialExpressions +
      gestureScore * weights.gestures +
      overallScore * weights.overall;

    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const calculateOverallScore = (
    technicalScore: number,
    communicationScore: number,
    behavioralScore: number,
    difficulty: string
  ): number => {
    // Adjust weights based on difficulty level
    let weights = { technical: 0.4, communication: 0.35, behavioral: 0.25 };

    switch (difficulty) {
      case "easy":
        weights = { technical: 0.3, communication: 0.4, behavioral: 0.3 }; // More focus on communication
        break;
      case "hard":
        weights = { technical: 0.5, communication: 0.3, behavioral: 0.2 }; // More focus on technical
        break;
      default: // medium
        weights = { technical: 0.4, communication: 0.35, behavioral: 0.25 };
    }

    const weightedScore =
      technicalScore * weights.technical +
      communicationScore * weights.communication +
      behavioralScore * weights.behavioral;

    return Math.round(Math.min(100, Math.max(0, weightedScore)));
  };

  const calculateCorrectAnswers = (
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number => {
    // Estimate correct answers based on communication quality and confidence
    const communicationQuality =
      (speechResults.pronunciationAssessment.overallScore +
        speechResults.confidenceScore.overall +
        speechResults.pronunciationAssessment.fluency) /
      3;

    const engagementLevel = bodyLanguageResults.facialExpressions.engagement;
    const overallQuality = (communicationQuality + engagementLevel) / 2;

    // Convert quality score to percentage of correct answers
    let correctPercentage = 0.4; // Base 40% correct

    if (overallQuality >= 80) correctPercentage = 0.85;
    else if (overallQuality >= 70) correctPercentage = 0.75;
    else if (overallQuality >= 60) correctPercentage = 0.65;
    else if (overallQuality >= 50) correctPercentage = 0.55;

    return Math.floor(questionCount * correctPercentage);
  };

  const calculateAverageResponseTime = (
    speechResults: SpeechAnalysisResult,
    totalDuration: number
  ): number => {
    // Calculate based on actual speech patterns and pauses
    const wordsPerMinute = speechResults.paceAnalysis.wordsPerMinute;
    const averagePause = speechResults.paceAnalysis.averagePause;
    const fillerWordPercentage = speechResults.fillerWords.percentage;

    // Base response time calculation
    let baseResponseTime = totalDuration / questionCount;

    // Adjust based on speech patterns
    if (wordsPerMinute < 120) baseResponseTime *= 1.2; // Slower speakers take longer
    if (wordsPerMinute > 180) baseResponseTime *= 0.9; // Faster speakers are quicker

    // Adjust for pauses and filler words
    const pauseAdjustment = Math.min(10, averagePause * 2);
    const fillerAdjustment = Math.min(5, fillerWordPercentage * 0.5);

    return Math.round(baseResponseTime + pauseAdjustment + fillerAdjustment);
  };

  const calculateAdaptabilityScore = (
    speechResults: SpeechAnalysisResult,
    bodyLanguageResults: BodyLanguageAnalysisResult
  ): number => {
    // Measure adaptability based on consistency and confidence throughout interview
    const confidenceConsistency =
      100 - speechResults.confidenceScore.volumeVariation * 0.5;
    const engagementLevel = bodyLanguageResults.facialExpressions.engagement;
    const postureStability = bodyLanguageResults.posture.score;

    // Factor in speech pace consistency
    const paceConsistency = Math.max(
      0,
      100 - (speechResults.paceAnalysis.wordsPerMinute > 200 ? 20 : 0)
    );

    const adaptabilityScore =
      confidenceConsistency * 0.3 +
      engagementLevel * 0.3 +
      postureStability * 0.2 +
      paceConsistency * 0.2;

    return Math.round(Math.min(100, Math.max(40, adaptabilityScore)));
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

      <div className="flex gap-6">
        {/* Video and Controls - Takes most space */}
        <div className="flex-1">
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-4 relative h-64">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  transform: "scaleX(-1)",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                onLoadedMetadata={() => {
                  console.log("Enhanced video metadata loaded");
                  if (videoRef.current) {
                    videoRef.current
                      .play()
                      .catch((e) => console.log("Auto-play prevented:", e));
                  }
                }}
                onCanPlay={() => console.log("Enhanced video can play")}
                onPlay={() => console.log("Enhanced video started playing")}
                onError={(e) => {
                  console.error("Enhanced video error:", e);
                  setError("Video playback error. Please check your camera.");
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white absolute top-0 left-0">
                <VideoOff className="w-12 h-12" />
                <div className="ml-4">
                  <p className="text-lg font-medium">Camera Disabled</p>
                  <p className="text-sm opacity-75">
                    Click the camera button to enable
                  </p>
                </div>
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
              onClick={toggleVideo}
              className={`p-3 rounded-lg transition-colors ${
                isVideoEnabled
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
              title={isVideoEnabled ? "Disable Camera" : "Enable Camera"}
            >
              {isVideoEnabled ? (
                <Camera className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Question Panel */}
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Current Question */}
            {currentQuestion && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Current Question
                  </h3>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-900 font-medium">{currentQuestion}</p>
                </div>
              </div>
            )}

            {/* Real-time Metrics - Compact Version */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Live Analysis</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Filler Words */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">
                    {realTimeMetrics.fillerWordCount}
                  </div>
                  <div className="text-xs text-blue-700">Filler Words</div>
                </div>

                {/* Eye Contact */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(realTimeMetrics.eyeContactPercentage)}%
                  </div>
                  <div className="text-xs text-green-700">Eye Contact</div>
                </div>

                {/* Confidence */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(realTimeMetrics.confidenceScore)}
                  </div>
                  <div className="text-xs text-purple-700">Confidence</div>
                </div>

                {/* Speaking Pace */}
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(realTimeMetrics.speakingPace)}
                  </div>
                  <div className="text-xs text-orange-700">WPM</div>
                </div>
              </div>
            </div>

            {/* Interview Progress */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions Asked</span>
                  <span>{questionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{formatDuration(interviewDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
