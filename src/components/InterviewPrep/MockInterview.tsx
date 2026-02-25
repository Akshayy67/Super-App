import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Video,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  Headphones,
  MessageSquare,
  ArrowLeft,
  Phone,
  PhoneOff,
  Settings,
  Camera,
  VideoOff,
  X,
  RotateCcw,
  BarChart,
  Sparkles,
  Cpu,
} from "lucide-react";
import {
  vapi,
  isVapiConfigured,
  checkBrowserCompatibility,
} from "../../lib/vapi.sdk";
import { aiService } from "../../utils/aiService";
import { InterviewFeedback } from "./InterviewFeedback";
import { JAMSession } from "./JAMSession";
import { GeminiATSService } from "../../utils/geminiATSService";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { AICodingInterview } from "../gamification/AICodingInterview";
import { questionHistoryManager } from "../../utils/questionHistoryManager";
import {
  FaceDetectionOverlay,
  EyeContactStatus,
  FaceDetectionStats,
} from "../FaceDetectionOverlay";
// Face detection debug component removed for production
import { DetectedFace } from "../../utils/faceDetection";
import {
  PerformanceAnalytics,
  InterviewPerformanceData,
} from "../../utils/performanceAnalytics";
import { analyticsStorage } from "../../utils/analyticsStorage";
import { unifiedAnalyticsStorage } from "../../utils/unifiedAnalyticsStorage";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { ProfileService } from "../../services/profileService";

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  timeLimit: number;
  hints?: string[];
}

interface InterviewSession {
  id: string;
  type: string;
  difficulty: string;
  duration: number;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startTime: Date;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export const MockInterview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    null
  );
  const [sessionToSave, setSessionToSave] = useState<InterviewSession | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // ── Interview Mode ──
  type InterviewMode = "learning" | "realistic" | "stress" | "behavioral" | "technical_deep" | "custom_mode";
  const interviewModes: { id: InterviewMode; label: string; icon: string; desc: string; color: string }[] = [
    { id: "learning", label: "Learning Coach", icon: "📚", desc: "Guided practice with real-time tips, hints & teaching moments", color: "from-blue-500 to-cyan-500" },
    { id: "realistic", label: "Real Interview", icon: "🎯", desc: "Simulates an actual interview — no hints, realistic pacing", color: "from-indigo-500 to-purple-500" },
    { id: "stress", label: "Stress Test", icon: "🔥", desc: "Rapid-fire, high-pressure — tests how you perform under stress", color: "from-red-500 to-orange-500" },
    { id: "behavioral", label: "Behavioral Deep-Dive", icon: "🧠", desc: "STAR-focused — probes your stories, leadership & teamwork", color: "from-emerald-500 to-teal-500" },
    { id: "technical_deep", label: "Technical Grilling", icon: "⚙️", desc: "Deep system design & coding questions with follow-ups", color: "from-violet-500 to-fuchsia-500" },
    { id: "custom_mode", label: "Custom", icon: "✏️", desc: "Define your own interviewer style and behavior", color: "from-gray-500 to-slate-500" },
  ];
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("learning");
  const [customModePrompt, setCustomModePrompt] = useState("");
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"templates" | "custom" | "resume" | "coding">(
    (tabParam === "custom" || tabParam === "resume" || tabParam === "coding") ? tabParam : "templates"
  );

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam === "custom" || tabParam === "resume" || tabParam === "coding") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [showJAMSession, setShowJAMSession] = useState(false);

  // Custom interview configuration
  const [customRole, setCustomRole] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [customQuestionCount, setCustomQuestionCount] = useState(5);
  const [customDuration, setCustomDuration] = useState(15);
  const [customQuestions, setCustomQuestions] = useState<string[]>([""]);
  const [customFocusAreas, setCustomFocusAreas] = useState<string[]>([
    "general",
  ]);
  const [customTechTags, setCustomTechTags] = useState<string[]>([""]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Resume-based interview configuration
  const [resumeText, setResumeText] = useState("");
  const [parsedResumeData, setParsedResumeData] = useState<unknown>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeDifficulty, setResumeDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [resumeQuestionCount, setResumeQuestionCount] = useState(5);
  const [resumeDuration, setResumeDuration] = useState(15);
  const [isGeneratingResumeQuestions, setIsGeneratingResumeQuestions] = useState(false);

  // VAPI states
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [browserIssues, setBrowserIssues] = useState<string[]>([]);
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Camera preview state
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Callback ref to ensure video element is always tracked
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    if (element) {
      console.log("Video element attached to ref");
      videoRef.current = element;
      setIsVideoReady(true);
    } else {
      console.log("Video element detached from ref");
      setIsVideoReady(false);
    }
  }, []);

  // Face detection state
  const [enableFaceDetection, setEnableFaceDetection] = useState(true);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessages, setFeedbackMessages] = useState<SavedMessage[]>([]);
  const [feedbackSession, setFeedbackSession] = useState<InterviewSession | null>(null);

  // Performance analytics
  const performanceAnalytics = useRef(new PerformanceAnalytics());

  // Face detection integration - use the primary video element consistently
  const faceDetection = useFaceDetection({
    enabled: enableFaceDetection && isCameraActive,
    videoElement: videoRef.current, // Always use the main video ref
    onFaceDetected: (faces: DetectedFace[]) => {
      setDetectedFaces(faces);
      if (faces.length > 0) {
        console.log(
          `📊 MockInterview: Received ${faces.length} face(s) for overlay`
        );
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onEyeContactChange: (hasEyeContact: boolean) => {
      // Keep last 100 readings
    },
    eyeContactThreshold: {
      yaw: 15, // degrees
      pitch: 15, // degrees
    },
  });

  // Reset to templates view when component mounts or tab is clicked
  useEffect(() => {
    setActiveTab("templates");
    setIsInterviewStarted(false);
    setActiveSession(null);
    setShowJAMSession(false);
  }, []);

  useEffect(() => {
    // Check VAPI configuration and browser compatibility
    const checkSetup = () => {
      const vapiConfigured = isVapiConfigured();
      const compatibilityIssues = checkBrowserCompatibility();

      setIsVapiReady(vapiConfigured);
      setBrowserIssues(compatibilityIssues);

      if (!vapiConfigured) {
        setError(
          "VAPI is not properly configured. Please check your environment variables."
        );
      } else if (compatibilityIssues.length > 0) {
        setError(
          `Browser compatibility issues: ${compatibilityIssues.join(", ")}`
        );
      }
    };

    checkSetup();
  }, []);

  // Camera functions
  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      setIsCameraLoading(true);
      setCameraError("");

      // Check if camera is already active
      if (isCameraActive && streamRef.current) {
        console.log("Camera is already active");
        setIsCameraLoading(false);
        return;
      }

      // Check if video element already has a stream
      if (videoRef.current && videoRef.current.srcObject) {
        console.log("Video element already has a stream, reusing it");
        setIsCameraActive(true);
        setShowCameraPreview(true);
        setIsCameraLoading(false);
        return;
      }

      // Wait for video element to be available with multiple retries
      let retries = 0;
      const maxRetries = 20; // Increased retries
      while (!videoRef.current && retries < maxRetries) {
        console.log(
          `Waiting for video element... (${retries + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }

      if (!videoRef.current) {
        throw new Error("Video element not available. Please try again.");
      }

      console.log("Video element found, proceeding with camera start");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      console.log("Camera stream obtained:", stream);

      if (videoRef.current) {
        // Only set srcObject if it's not already set to avoid disrupting active streams
        if (!videoRef.current.srcObject) {
          videoRef.current.srcObject = stream;
          console.log("Stream assigned to video element");
        } else {
          console.log(
            "Video element already has a stream, skipping assignment"
          );
        }

        streamRef.current = stream;
        setIsCameraActive(true);
        setShowCameraPreview(true);
        setIsCameraLoading(false);
        console.log("Camera started successfully");
      } else {
        // Clean up the stream if video element is not available
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Video element not available. Please try again.");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraLoading(false);

      // Provide more specific error messages based on error type
      let errorMessage = "Unable to access camera. Please check permissions.";

      if (error instanceof Error) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          errorMessage =
            "Camera access denied. Please allow camera permissions in your browser settings and refresh the page.";
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          errorMessage =
            "No camera found. Please connect a camera and try again.";
        } else if (
          error.name === "NotReadableError" ||
          error.name === "TrackStartError"
        ) {
          errorMessage =
            "Camera is already in use by another application. Please close other apps using the camera and try again.";
        } else if (
          error.name === "OverconstrainedError" ||
          error.name === "ConstraintNotSatisfiedError"
        ) {
          errorMessage =
            "Camera doesn't support the required settings. Please try with a different camera.";
        } else if (error.message.includes("timeout")) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }

      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Clean up video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setShowCameraPreview(false);
    console.log("Camera stopped");
  };

  // Cleanup camera when component unmounts or interview ends
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, []);

  // Handle camera when interview session changes
  useEffect(() => {
    if (!activeSession) {
      // Interview ended, stop camera
      stopCamera();
    }
  }, [activeSession]);

  // Stop camera when camera preview is closed
  useEffect(() => {
    if (!showCameraPreview && isCameraActive) {
      console.log("Camera preview closed, stopping camera stream");
      stopCamera();
    }
  }, [showCameraPreview, isCameraActive]);

  // Ensure video element is available when component mounts
  useEffect(() => {
    console.log("Component mounted, video ref:", !!videoRef.current);

    // Check if video element is available after multiple delays
    const checkVideoElement = async () => {
      let attempts = 0;
      const maxAttempts = 10;

      while (!videoRef.current && attempts < maxAttempts) {
        console.log(
          `Checking for video element... (${attempts + 1}/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (videoRef.current) {
        console.log("Video element found after mount delay");
        setIsVideoReady(true);
      } else {
        console.log("Video element not available after mount delay");
        setIsVideoReady(false);
      }
    };

    checkVideoElement();
  }, []);

  // State to store real AI feedback scores
  const [realAIScores, setRealAIScores] = useState<{
    overall: number;
    technical: number;
    communication: number;
    behavioral: number;
  } | null>(null);

  // Function to get actual performance scores from AI feedback or provide transparent fallback
  const getActualPerformanceScore = useCallback((
    scoreType: "overall" | "technical" | "communication" | "behavioral"
  ): number => {
    if (realAIScores) {
      console.log(
        `✅ Using real AI score for ${scoreType}:`,
        realAIScores[scoreType]
      );
      return realAIScores[scoreType];
    }
    console.warn(
      `⚠️ Using fallback score for ${scoreType} - real AI feedback analysis not available`
    );
    return 10;
  }, [realAIScores]);

  // Generate speech analysis from real data or provide minimal fallback
  const generateMockSpeechAnalysis = useCallback(() => {
    return {
      fillerWords: { count: 0, words: [] as string[], percentage: 0, timestamps: [] as { word: string; time: number }[] },
      paceAnalysis: { wordsPerMinute: 0, averagePause: 0, paceRating: "optimal" as const, paceScore: 0 },
      confidenceScore: { overall: 0, volumeVariation: 0, voiceTremor: 0, pausePattern: 0, factors: [] as string[] },
      pronunciationAssessment: { clarity: 0, articulation: 0, fluency: 0, overallScore: 0, issues: [] as string[] },
      overallMetrics: { totalWords: 0, totalDuration: 0, averageVolume: 0, silencePercentage: 0 },
    };
  }, []);

  const generateMockBodyLanguageAnalysis = useCallback(() => {
    return {
      posture: { score: 0, alignment: "fair" as const, issues: [] as string[], recommendations: [] as string[] },
      facialExpressions: { confidence: 0, engagement: 0, nervousness: 0, expressions: [] as { emotion: string; confidence: number; timestamp: number }[] },
      eyeContact: { percentage: 0, consistency: 0, score: 0, patterns: [] as string[] },
      gestures: { frequency: 0, appropriateness: 0, variety: 0, score: 0, observations: [] as string[] },
      overallBodyLanguage: { score: 0, strengths: [] as string[], improvements: [] as string[], professionalismScore: 0 },
    };
  }, []);

  const generateStrengths = useCallback((): string[] => {
    return [
      "Completed interview session",
      "Engaged with interview questions",
      "Maintained professional communication",
    ];
  }, []);

  const generateWeaknesses = useCallback((): string[] => {
    return [
      "Enable speech analysis for detailed feedback",
      "Enable video analysis for body language insights",
    ];
  }, []);

  const generateRecommendations = useCallback((): string[] => {
    return [
      "Complete more interviews to build performance history",
      "Enable microphone access for speech analysis",
      "Enable camera access for body language analysis",
      "Practice behavioral questions using the STAR method",
    ];
  }, []);

  const saveInterviewPerformanceData = useCallback(async (session?: InterviewSession) => {
    const sessionToUse = session || activeSession;

    console.log("🔍 saveInterviewPerformanceData called", {
      hasActiveSession: !!activeSession,
      hasSessionParam: !!session,
      hasSessionToUse: !!sessionToUse,
      messagesLength: messages.length,
    });

    if (!sessionToUse) {
      console.log("❌ Early return: No session available");
      return;
    }

    if (messages.length === 0) {
      console.warn(
        "⚠️ No messages available - this might be a real score update"
      );
    }

    try {
      const duration = (Date.now() - sessionToUse.startTime.getTime()) / 1000;

      const sessionQuestions = (sessionToUse.questions || []).map(
        (q, index) => ({
          id: q.id || `q_${index}`,
          question: q.question || "Question not available",
          category: q.category || "general",
          timeLimit: q.timeLimit || 120,
          hints: q.hints || [],
          askedAt: new Date(
            sessionToUse.startTime.getTime() + index * 180000
          ).toISOString(),
          answeredAt: new Date(
            sessionToUse.startTime.getTime() + (index + 1) * 180000
          ).toISOString(),
        })
      );

      const performanceData: InterviewPerformanceData = {
        id: `interview_${Date.now()}`,
        timestamp: new Date().toISOString(),
        role:
          sessionToUse.type === "custom"
            ? customRole || "Custom Role"
            : sessionToUse.type === "resume"
              ? "Resume-Based Role"
              : sessionToUse.type,
        difficulty: sessionToUse.difficulty || "medium",
        duration: duration || 0,

        overallScore: getActualPerformanceScore("overall"),
        technicalScore: getActualPerformanceScore("technical"),
        communicationScore: getActualPerformanceScore("communication"),
        behavioralScore: getActualPerformanceScore("behavioral"),

        questionsAnswered: sessionToUse.currentQuestionIndex + 1,
        questionsCorrect: Math.floor(
          (sessionToUse.currentQuestionIndex + 1) * 0.7
        ),
        averageResponseTime: duration / (sessionToUse.currentQuestionIndex + 1),

        detailedMetrics: {
          confidence: getActualPerformanceScore("overall"),
          clarity: getActualPerformanceScore("communication"),
          professionalism: getActualPerformanceScore("behavioral"),
          engagement: getActualPerformanceScore("behavioral"),
          adaptability: getActualPerformanceScore("overall"),
        },

        speechAnalysis: generateMockSpeechAnalysis(),
        bodyLanguageAnalysis: generateMockBodyLanguageAnalysis(),

        strengths: generateStrengths(),
        weaknesses: generateWeaknesses(),
        recommendations: generateRecommendations(),

        interviewSession: {
          questions: sessionQuestions || [],
          messages: (messages || []).map((msg) => ({
            role: msg.role || "user",
            content: msg.content || "",
            timestamp: new Date().toISOString(),
          })),
          sessionType: sessionToUse.type || "general",
          interviewType:
            sessionToUse.type === "custom"
              ? customRole || "Custom Role"
              : sessionToUse.type || "general",
        },
      };

      // Validate data before saving
      const validateData = (obj: Record<string, unknown>, path = ""): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (value === undefined) {
            console.error(`❌ Undefined value found at ${currentPath}`);
            throw new Error(`Undefined value at ${currentPath}`);
          }
          if (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
          ) {
            validateData(value as Record<string, unknown>, currentPath);
          }
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (item !== null && typeof item === "object") {
                validateData(item as Record<string, unknown>, `${currentPath}[${index}]`);
              }
            });
          }
        }
      };

      try {
        validateData(performanceData as unknown as Record<string, unknown>);
        console.log("✅ Data validation passed");
      } catch (error) {
        console.error("❌ Data validation failed:", error);
        throw error;
      }

      console.log("💾 Saving performance data:", performanceData);

      performanceAnalytics.current.savePerformanceData(performanceData);
      analyticsStorage.savePerformanceData(performanceData);

      const cloudSaveResult = await unifiedAnalyticsStorage.savePerformanceData(
        performanceData
      );
      console.log("☁️ Cloud save result:", cloudSaveResult);

      console.log("✅ Performance data saved to analytics:", {
        id: performanceData.id,
        overallScore: performanceData.overallScore,
        timestamp: performanceData.timestamp,
      });
    } catch (error) {
      console.error("Error saving performance data:", error);
    }
  }, [activeSession, messages, customRole, getActualPerformanceScore, generateMockSpeechAnalysis, generateMockBodyLanguageAnalysis, generateStrengths, generateWeaknesses, generateRecommendations]);

  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started");
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setIsRecording(true);
    };

    const onCallEnd = async () => {
      console.log("📞 Call ended - onCallEnd triggered");
      setCallStatus(CallStatus.FINISHED);
      setIsRecording(false);

      // Save interview performance data to analytics using captured session
      console.log("💾 About to save interview performance data...");
      const sessionForSaving = sessionToSave || activeSession;
      console.log("🔍 Session for saving:", {
        hasSessionToSave: !!sessionToSave,
        hasActiveSession: !!activeSession,
        sessionForSaving: !!sessionForSaving,
      });

      await saveInterviewPerformanceData(sessionForSaving ?? undefined);
      console.log("✅ saveInterviewPerformanceData completed");

      // Clear the captured session
      setSessionToSave(null);
    };

    const onMessage = (message: unknown) => {
      console.log("Message received:", message);
      const msg = message as Record<string, unknown>;
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const newMessage: SavedMessage = {
          role: (msg.role as SavedMessage["role"]) || "user",
          content: msg.transcript as string,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("AI started speaking");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("AI stopped speaking");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("VAPI Error:", error);

      // Provide more helpful error messages based on error type
      let errorMessage = error.message;

      if (error.message.includes("ICE") || error.message.includes("connection") || error.message.includes("disconnected")) {
        errorMessage = "Connection failed. This may be due to network or firewall restrictions. Please check your internet connection and try again. If the issue persists, try using a different network or disabling VPN/firewall.";
      } else if (error.message.includes("permission") || error.message.includes("microphone")) {
        errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Connection timeout. Please check your internet connection and try again.";
      }

      setError(errorMessage);
      setCallStatus(CallStatus.INACTIVE);
      setIsRecording(false);
    };

    // Set up event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup function
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [activeSession, saveInterviewPerformanceData, sessionToSave]);

  // ═══════════════════════════════════════════════════════════
  // ENTERPRISE-GRADE INTERVIEW TEMPLATES & QUESTION BANKS
  // ═══════════════════════════════════════════════════════════

  const interviewTemplates = [
    {
      id: "general",
      name: "General Interview",
      description: "Culture fit, motivation & career-story questions",
      duration: 30,
      questionCount: 10,
      difficulty: "medium" as const,
    },
    {
      id: "behavioral",
      name: "Behavioral (STAR)",
      description: "Leadership, conflict, failure & growth deep-dives",
      duration: 45,
      questionCount: 12,
      difficulty: "medium" as const,
    },
    {
      id: "technical",
      name: "Technical Interview",
      description: "Architecture, coding concepts & problem-solving",
      duration: 60,
      questionCount: 12,
      difficulty: "hard" as const,
    },
    {
      id: "quick",
      name: "Quick Practice",
      description: "5-minute rapid warm-up with punchy questions",
      duration: 5,
      questionCount: 5,
      difficulty: "easy" as const,
    },
    {
      id: "executive",
      name: "Leadership Interview",
      description: "VP-level strategy, org design & stakeholder management",
      duration: 45,
      questionCount: 10,
      difficulty: "hard" as const,
    },
    {
      id: "system_design",
      name: "System Design",
      description: "Distributed systems, scalability & architecture trade-offs",
      duration: 60,
      questionCount: 8,
      difficulty: "hard" as const,
    },
    {
      id: "case_study",
      name: "Case Study / Product",
      description: "Product sense, market analysis & go-to-market strategy",
      duration: 45,
      questionCount: 8,
      difficulty: "medium" as const,
    },
    {
      id: "jam",
      name: "JAM Session",
      description: "Just A Minute — random topic impromptu speaking",
      duration: 2,
      questionCount: 1,
      difficulty: "medium" as const,
    },
  ];

  // ── ENTERPRISE QUESTION POOLS ──────────────────────────────
  // Each pool is ordered: Easy → Medium → Hard within the array.
  // The shuffler + AI generation layer handles final ordering.

  const questionSets: Record<string, { id: string; question: string; category: string; timeLimit: number; hints: string[] }[]> = {
    general: [
      // ── Easy ──
      { id: "gen-1", question: "Walk me through your career journey and what led you to apply here.", category: "general", timeLimit: 120, hints: ["Structure chronologically", "Highlight pivots with reasons", "End with why THIS role"] },
      { id: "gen-2", question: "What specifically about our company or product excites you, and how does it align with your career goals?", category: "general", timeLimit: 90, hints: ["Research the company beforehand", "Name specific products or initiatives", "Connect to your personal mission"] },
      { id: "gen-3", question: "Describe a professional accomplishment you're most proud of and quantify its impact.", category: "general", timeLimit: 120, hints: ["Use numbers/percentages", "Explain the challenge", "Show ownership"] },
      // ── Medium ──
      { id: "gen-4", question: "If I called your last manager right now, what would they say is your biggest strength and one area you need to develop?", category: "general", timeLimit: 120, hints: ["Be honest", "Show self-awareness", "Mention actions taken on the development area"] },
      { id: "gen-5", question: "How do you evaluate whether a new opportunity is the right career move for you?", category: "general", timeLimit: 90, hints: ["Show a framework", "Balance growth vs stability", "Mention learning opportunities"] },
      { id: "gen-6", question: "Tell me about a time you had to sell an unpopular idea to your team. What was the outcome?", category: "general", timeLimit: 150, hints: ["STAR method", "Show persuasion skills", "Acknowledge resistance"] },
      { id: "gen-7", question: "What does your ideal work environment look like, and how do you adapt when reality differs?", category: "general", timeLimit: 90, hints: ["Be authentic", "Show flexibility", "Give a real example of adapting"] },
      // ── Hard ──
      { id: "gen-8", question: "If you were to start in this role tomorrow, what would your 30-60-90 day plan look like?", category: "general", timeLimit: 180, hints: ["30 days: learn & listen", "60 days: quick wins", "90 days: strategic initiatives"] },
      { id: "gen-9", question: "We're growing fast. How do you handle ambiguity and make decisions when you only have 60% of the information you need?", category: "general", timeLimit: 150, hints: ["Show a decision framework", "Mention risk assessment", "Give a real example"] },
      { id: "gen-10", question: "What would you do in your first week if you discovered a fundamental disagreement between your approach and your new team's established practices?", category: "general", timeLimit: 150, hints: ["Show diplomacy", "Listen first", "Propose data-driven evaluation"] },
    ],

    behavioral: [
      // ── Easy ──
      { id: "beh-1", question: "Tell me about a time you received harsh feedback. Walk me through your reaction and what changed afterward.", category: "behavioral", timeLimit: 150, hints: ["STAR method", "Show emotional maturity", "Highlight concrete changes"] },
      { id: "beh-2", question: "Describe a situation where you had to collaborate with someone whose working style was completely different from yours.", category: "behavioral", timeLimit: 150, hints: ["Show empathy", "Explain adaptation strategy", "Focus on the outcome"] },
      { id: "beh-3", question: "Give me an example of when you went significantly above and beyond your job description. Why did you do it?", category: "behavioral", timeLimit: 120, hints: ["Show intrinsic motivation", "Quantify impact", "Explain what drove you"] },
      // ── Medium ──
      { id: "beh-4", question: "Tell me about a project that failed. What was your role, what went wrong, and what would you do differently with the knowledge you have now?", category: "behavioral", timeLimit: 180, hints: ["Own your part", "Analyze root causes", "Show retrospective thinking"] },
      { id: "beh-5", question: "Describe a time you had to make a critical decision with incomplete data and tight time pressure. Walk me through your thought process.", category: "behavioral", timeLimit: 180, hints: ["Show decision framework", "Mention risk assessment", "Explain the outcome"] },
      { id: "beh-6", question: "Tell me about a conflict with a senior stakeholder. How did you navigate the politics while maintaining your position?", category: "behavioral", timeLimit: 180, hints: ["Stay professional", "Show diplomacy", "Demonstrate influence without authority"] },
      { id: "beh-7", question: "Describe a time you identified a significant problem that no one else had noticed. How did you bring it to attention and drive resolution?", category: "behavioral", timeLimit: 150, hints: ["Show initiative", "Explain your discovery process", "Highlight impact"] },
      { id: "beh-8", question: "Give an example of when you had to rapidly learn a new domain or technology to deliver on a commitment. How did you approach it?", category: "behavioral", timeLimit: 150, hints: ["Show learning strategy", "Mention resources used", "Highlight speed-to-competence"] },
      // ── Hard ──
      { id: "beh-9", question: "Tell me about a time you had to fire or manage out an underperforming team member, or strongly advocate for it. How did you handle the human side?", category: "behavioral", timeLimit: 180, hints: ["Show empathy AND accountability", "Explain the process", "Discuss impact on the team"] },
      { id: "beh-10", question: "Describe a situation where you had to balance two equally important priorities with zero additional resources. What trade-offs did you make and why?", category: "behavioral", timeLimit: 180, hints: ["Show prioritization framework", "Explain trade-off reasoning", "Quantify impact of the choice"] },
      { id: "beh-11", question: "Give an example of when you took a significant professional risk. What was the calculus behind your decision, and how did it play out?", category: "behavioral", timeLimit: 180, hints: ["Show risk assessment", "Explain upside vs downside", "Be honest about the result"] },
      { id: "beh-12", question: "Tell me about a time you had to build trust with a team or client who was initially skeptical or hostile toward you. What specific actions did you take?", category: "behavioral", timeLimit: 150, hints: ["Show patience and empathy", "Describe specific trust-building actions", "Measure the turnaround"] },
    ],

    technical: [
      // ── Easy ──
      { id: "tech-1", question: "Explain the difference between SQL and NoSQL databases. When would you choose one over the other for a new project?", category: "technical", timeLimit: 120, hints: ["Cover CAP theorem", "Mention specific use cases", "Discuss trade-offs"] },
      { id: "tech-2", question: "Walk me through what happens from the moment a user types a URL into their browser until they see the page. Be as detailed as you can.", category: "technical", timeLimit: 180, hints: ["DNS → TCP → TLS → HTTP → Server → Response → Render", "Mention caching layers", "Discuss CDN if applicable"] },
      { id: "tech-3", question: "What's the difference between horizontal and vertical scaling? Give a real-world scenario where you'd pick each.", category: "technical", timeLimit: 120, hints: ["Cost vs complexity", "Stateless vs stateful", "Load balancer implications"] },
      // ── Medium ──
      { id: "tech-4", question: "You deploy a new feature and error rates spike 10x. Walk me through your incident response process, from detection to post-mortem.", category: "technical", timeLimit: 180, hints: ["Detection → Triage → Mitigation → Root cause → Post-mortem", "Mention monitoring tools", "Discuss rollback strategy"] },
      { id: "tech-5", question: "Explain how you would implement a rate limiter for an API gateway. What algorithm would you choose and why?", category: "technical", timeLimit: 180, hints: ["Token bucket vs sliding window", "Distributed rate limiting challenges", "Edge cases: bursts, fairness"] },
      { id: "tech-6", question: "How would you design the data model and API for a real-time collaborative editing feature (like Google Docs)?", category: "technical", timeLimit: 180, hints: ["OT vs CRDT", "Conflict resolution strategy", "WebSocket vs SSE"] },
      { id: "tech-7", question: "Describe how you've implemented CI/CD pipelines in a previous project. What was your testing strategy?", category: "technical", timeLimit: 150, hints: ["Build → Test → Deploy stages", "Testing pyramid", "Rollback mechanisms"] },
      { id: "tech-8", question: "Explain eventual consistency vs strong consistency. Describe a situation where you chose eventual consistency and how you handled the edge cases.", category: "technical", timeLimit: 150, hints: ["CAP theorem context", "Real-world trade-offs", "Compensation patterns"] },
      // ── Hard ──
      { id: "tech-9", question: "Your database is getting 50K reads/sec and writes are becoming a bottleneck. Walk me through your strategy to scale writes while maintaining data integrity.", category: "technical", timeLimit: 180, hints: ["Sharding strategies", "Write-ahead logging", "Conflict resolution", "Read replicas"] },
      { id: "tech-10", question: "Design a system to detect and prevent fraudulent transactions in real-time for a payment platform processing 10K TPS.", category: "technical", timeLimit: 240, hints: ["ML pipeline + rules engine", "Latency requirements", "False positive management", "Feature engineering"] },
      { id: "tech-11", question: "How would you migrate a monolithic application serving millions of users to microservices without downtime? What's your phased approach?", category: "technical", timeLimit: 240, hints: ["Strangler fig pattern", "API gateway", "Data ownership", "Monitoring during migration"] },
      { id: "tech-12", question: "Explain how a garbage collector works in your language of choice. What are the trade-offs between different GC strategies?", category: "technical", timeLimit: 150, hints: ["Mark-and-sweep vs generational", "Stop-the-world pauses", "Tuning for latency vs throughput"] },
    ],

    quick: [
      { id: "quick-1", question: "In 60 seconds, convince me to hire you for this role. Go.", category: "quick", timeLimit: 60, hints: ["Lead with impact", "Name your differentiator", "End with what excites you about the role"] },
      { id: "quick-2", question: "What's the most impactful thing you shipped in the last 12 months? Give me the three-line version.", category: "quick", timeLimit: 60, hints: ["Problem → Action → Result", "Use numbers", "Be concise"] },
      { id: "quick-3", question: "What's a controversial opinion you hold about your industry that most people would disagree with?", category: "quick", timeLimit: 60, hints: ["Be genuine", "Support with evidence", "Show independent thinking"] },
      { id: "quick-4", question: "If you had unlimited resources and one year, what would you build and why?", category: "quick", timeLimit: 60, hints: ["Show vision", "Connect to real problems", "Demonstrate passion"] },
      { id: "quick-5", question: "What's one skill you're actively working on improving right now, and how are you doing it?", category: "quick", timeLimit: 45, hints: ["Show growth mindset", "Be specific about method", "Mention measurable progress"] },
    ],

    executive: [
      // ── Easy ──
      { id: "exec-1", question: "How do you build a high-performing team from scratch? Walk me through your hiring philosophy and first 90 days.", category: "executive", timeLimit: 180, hints: ["Hiring bar & values", "Onboarding structure", "Culture setting"] },
      { id: "exec-2", question: "Describe your approach to setting and cascading OKRs across a multi-team organization.", category: "executive", timeLimit: 150, hints: ["Company → Team → Individual alignment", "Review cadence", "Course-correction triggers"] },
      // ── Medium ──
      { id: "exec-3", question: "Tell me about a time you had to shut down a project your team was emotionally invested in. How did you handle communication and morale?", category: "executive", timeLimit: 180, hints: ["Data-driven decision", "Empathetic communication", "Redirecting energy"] },
      { id: "exec-4", question: "How do you handle a situation where two of your direct reports have a deep, unresolved conflict that's affecting team performance?", category: "executive", timeLimit: 180, hints: ["Mediation approach", "Root cause analysis", "Escalation criteria"] },
      { id: "exec-5", question: "Describe a time you had to influence a C-level executive to change direction on a strategic initiative. What was your approach?", category: "executive", timeLimit: 180, hints: ["Stakeholder mapping", "Data + narrative", "Political awareness"] },
      { id: "exec-6", question: "How do you balance innovation and operational excellence when your team is already stretched thin?", category: "executive", timeLimit: 150, hints: ["Innovation time allocation", "Tech debt strategy", "Prioritization framework"] },
      // ── Hard ──
      { id: "exec-7", question: "You inherit a team with low morale, missed deadlines, and a 40% attrition rate. What's your 90-day turnaround plan?", category: "executive", timeLimit: 240, hints: ["Listen first", "Quick wins for credibility", "Address root causes of attrition"] },
      { id: "exec-8", question: "How would you evaluate and restructure an engineering organization that has grown from 50 to 500 people and is showing signs of dysfunction?", category: "executive", timeLimit: 240, hints: ["Org assessment framework", "Communication structure", "Team topology"] },
      { id: "exec-9", question: "Describe your approach to managing up — specifically, how you keep your VP/CTO informed without burdening them with noise.", category: "executive", timeLimit: 150, hints: ["Signal-to-noise ratio", "Proactive updates", "Escalation criteria"] },
      { id: "exec-10", question: "If the board asked you to cut 30% of your team's budget while maintaining output, how would you approach it?", category: "executive", timeLimit: 180, hints: ["Impact-based prioritization", "Automation opportunities", "Tough but fair decisions"] },
    ],

    system_design: [
      { id: "sd-1", question: "Design a URL shortener like bit.ly that handles 100M new URLs per month. Focus on the data model, API, and scaling strategy.", category: "system_design", timeLimit: 300, hints: ["Base62 encoding", "Read-heavy → caching layer", "Database sharding by hash", "Analytics pipeline"] },
      { id: "sd-2", question: "Design a real-time chat system like Slack. How would you handle presence indicators, message delivery guarantees, and search?", category: "system_design", timeLimit: 300, hints: ["WebSocket connections", "Message queue for reliability", "Eventual consistency for presence", "Full-text search index"] },
      { id: "sd-3", question: "Design a ride-sharing system like Uber. Focus on matching drivers to riders in real-time at scale.", category: "system_design", timeLimit: 300, hints: ["Geospatial indexing (QuadTree/S2)", "Location update frequency", "ETA estimation", "Supply-demand balancing"] },
      { id: "sd-4", question: "Design a news feed system like Instagram or Twitter. How would you handle fan-out, ranking, and real-time updates?", category: "system_design", timeLimit: 300, hints: ["Push vs pull model", "Hybrid fan-out", "Ranking algorithm", "Cache invalidation"] },
      { id: "sd-5", question: "Design a distributed key-value store like DynamoDB. Discuss consistency, partitioning, replication, and failure handling.", category: "system_design", timeLimit: 300, hints: ["Consistent hashing", "Quorum reads/writes", "Conflict resolution (vector clocks)", "Gossip protocol"] },
      { id: "sd-6", question: "Design a video streaming platform like YouTube. How would you handle upload, transcoding, storage, and adaptive bitrate streaming?", category: "system_design", timeLimit: 300, hints: ["Upload pipeline", "Async transcoding", "CDN distribution", "HLS/DASH adaptive streaming"] },
      { id: "sd-7", question: "Design a notification system that handles push notifications, email, SMS, and in-app alerts for 100M users with user preferences.", category: "system_design", timeLimit: 300, hints: ["Event-driven architecture", "Priority queue", "Rate limiting per user", "Delivery tracking"] },
      { id: "sd-8", question: "Design a search autocomplete system like Google Search suggestions. How would you handle real-time ranking and personalization?", category: "system_design", timeLimit: 300, hints: ["Trie data structure", "Frequency-based ranking", "Prefix caching", "Personalization layer"] },
    ],

    case_study: [
      { id: "case-1", question: "You're the PM for a food delivery app. Orders have dropped 20% in the last quarter while competitor orders are flat. Walk me through how you'd diagnose and fix this.", category: "case_study", timeLimit: 240, hints: ["Segment the funnel", "Check supply vs demand side", "Competitive analysis", "Hypothesis-driven approach"] },
      { id: "case-2", question: "A B2B SaaS startup asks you to define their go-to-market strategy for entering the European market. What's your framework?", category: "case_study", timeLimit: 240, hints: ["Market sizing (TAM/SAM/SOM)", "Regulatory landscape (GDPR)", "Localization strategy", "Channel partnerships"] },
      { id: "case-3", question: "Google wants to launch a new standalone product for small business accounting. How would you evaluate whether this is worth pursuing?", category: "case_study", timeLimit: 240, hints: ["Market size & growth", "Competitive moat analysis", "Build vs buy vs partner", "Success metrics"] },
      { id: "case-4", question: "You're leading product for a fintech company. Regulators just introduced a new compliance requirement that will break your existing user flow. How do you handle this?", category: "case_study", timeLimit: 240, hints: ["Compliance timeline", "User impact assessment", "Phased rollout", "Communication strategy"] },
      { id: "case-5", question: "An e-commerce platform's conversion rate dropped from 3.2% to 2.1% after a redesign. The design team insists the new design is better. How do you resolve this?", category: "case_study", timeLimit: 240, hints: ["Data analysis (segments, devices)", "A/B test setup", "Qualitative research", "Stakeholder management"] },
      { id: "case-6", question: "You're launching a new AI feature in your product. How do you think about pricing: free, freemium, usage-based, or bundled? Walk me through your framework.", category: "case_study", timeLimit: 240, hints: ["Value-based pricing", "Competitive benchmarking", "Margin analysis", "Behavioral pricing psychology"] },
      { id: "case-7", question: "A social media platform is experiencing a trust crisis due to misinformation. As VP of Product, what's your 6-month action plan?", category: "case_study", timeLimit: 240, hints: ["Content moderation strategy", "Transparency features", "User education", "Regulatory proactivity"] },
      { id: "case-8", question: "Your company's DAU is growing but revenue per user is declining. Diagnose the potential causes and propose three initiatives to reverse the trend.", category: "case_study", timeLimit: 240, hints: ["Monetization funnel analysis", "User segment profiling", "Pricing optimization", "New revenue streams"] },
    ],
  };

  // ── AI-Generated Adaptive Questions ───────────────────────
  const generateAdaptiveQuestions = async (
    templateType: string,
    role: string,
    difficulty: string,
    count: number
  ): Promise<{ id: string; question: string; category: string; timeLimit: number; hints: string[] }[] | null> => {
    try {
      const historyPrompt = questionHistoryManager.getAvoidancePrompt(templateType);

      const prompt = `You are an expert interview question designer for top-tier companies like Google, Meta, Amazon, Stripe, and McKinsey.

Generate ${count} unique, high-quality interview questions for the following parameters:
- Role: ${role || "General professional"}
- Interview Type: ${templateType}
- Difficulty: ${difficulty}
- Questions should progress from easier to harder.

${historyPrompt}

For each question, provide:
1. A clear, specific question (not generic — make it feel like a real FAANG/top-company interview)
2. A category tag
3. A time limit in seconds (60-300 depending on complexity)
4. Three coaching hints/frameworks the candidate should use

Respond with valid JSON only — an array of objects:
[
  {
    "id": "ai-1",
    "question": "...specific question...",
    "category": "${templateType}",
    "timeLimit": 120,
    "hints": ["hint1", "hint2", "hint3"]
  }
]

Do NOT include any markdown, explanation, or text outside the JSON array.`;

      const response = await aiService.generateResponse(prompt, "interview");
      const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
        // Re-assign IDs to be safe
        return parsed.map((q: { question: string; category?: string; timeLimit?: number; hints?: string[] }, i: number) => ({
          id: `ai-${templateType}-${i + 1}`,
          question: q.question,
          category: q.category || templateType,
          timeLimit: q.timeLimit || 120,
          hints: q.hints || ["Take your time", "Structure your answer", "Use specific examples"],
        }));
      }
      return null; // fallback
    } catch (err) {
      console.warn("[AdaptiveQuestions] AI generation failed, using fallback:", err);
      return null;
    }
  };

  const startInterview = (templateId: string) => {
    // Handle JAM session separately
    if (templateId === "jam") {
      setShowJAMSession(true);
      return;
    }

    const template = interviewTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // ── INSTANT START: use fallback questions immediately ──
    const pool = questionSets[templateId];
    const fallbackQuestions = pool
      ? questionHistoryManager.shuffleWithDeprioritization(pool, templateId).slice(0, template.questionCount)
      : [];

    if (fallbackQuestions.length === 0) {
      console.error(`No question set found for template: ${templateId}`);
      return;
    }

    setIsAIGenerated(false);

    const session: InterviewSession = {
      id: Date.now().toString(),
      type:
        templateId === "technical" || templateId === "system_design"
          ? "technical"
          : templateId === "behavioral"
            ? "behavioral"
            : "mixed",
      difficulty: template.difficulty,
      duration: template.duration,
      questions: fallbackQuestions,
      currentQuestionIndex: 0,
      startTime: new Date(),
    };

    // Record fallback questions in history
    questionHistoryManager.recordInterview(
      session.id,
      templateId,
      fallbackQuestions.map(q => q.question)
    );

    setActiveSession(session);
    setTimeRemaining(session.questions[0].timeLimit);
    setCurrentAnswer("");
    setIsInterviewStarted(false);

    // Auto-start camera if enabled and not already active
    if (showCameraPreview && !isCameraActive) {
      console.log("Auto-starting camera for interview...");
      startCamera();
    }

    // ── BACKGROUND: generate AI questions and swap them in silently ──
    generateAdaptiveQuestions(
      templateId,
      customRole || template.name,
      template.difficulty,
      template.questionCount
    ).then((aiQuestions) => {
      if (aiQuestions && aiQuestions.length > 0) {
        // Only swap if user hasn't started the interview yet
        setActiveSession((prev) => {
          if (!prev || prev.id !== session.id) return prev;
          // Re-record with AI questions
          questionHistoryManager.recordInterview(
            prev.id,
            templateId,
            aiQuestions.map(q => q.question)
          );
          return {
            ...prev,
            questions: aiQuestions.slice(0, template.questionCount),
          };
        });
        setIsAIGenerated(true);
        console.log("✅ AI questions swapped in successfully");
      }
    }).catch(() => {
      console.log("ℹ️ AI generation failed, keeping fallback questions");
    });
  };

  const beginInterview = () => {
    setIsInterviewStarted(true);
    setTimeRemaining(activeSession!.questions[0].timeLimit);
  };

  const createCustomInterview = async () => {
    // Ensure question count doesn't exceed 10
    const finalQuestionCount = Math.min(customQuestionCount, 10);

    // Generate custom questions based on role and focus areas
    const generatedQuestions: InterviewQuestion[] = [];

    // Add custom questions if provided
    customQuestions.forEach((question, index) => {
      if (question.trim()) {
        generatedQuestions.push({
          id: `custom-${index + 1}`,
          question: question.trim(),
          category: customFocusAreas[0] || "general",
          timeLimit: Math.max(
            60,
            Math.floor((customDuration * 60) / finalQuestionCount)
          ),
          hints: ["Be specific", "Use examples", "Stay relevant to the role"],
        });
      }
    });

    // Generate additional questions if needed
    const remainingCount = finalQuestionCount - generatedQuestions.length;
    if (remainingCount > 0) {
      const aiQuestions = await generateAIQuestions(
        customRole,
        customDifficulty,
        customFocusAreas,
        remainingCount
      );
      generatedQuestions.push(...aiQuestions);
    }

    const session: InterviewSession = {
      id: Date.now().toString(),
      type: "custom",
      difficulty: customDifficulty,
      duration: customDuration,
      questions: generatedQuestions,
      currentQuestionIndex: 0,
      startTime: new Date(),
    };

    setActiveSession(session);
    setTimeRemaining(session.questions[0].timeLimit);
    setCurrentAnswer("");
    setIsInterviewStarted(false);

    // Auto-start camera if enabled
    if (showCameraPreview) {
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  const generateRoleBasedQuestions = (
    role: string,
    focusAreas: string[],
    count: number
  ): InterviewQuestion[] => {
    const questions: InterviewQuestion[] = [];
    const baseQuestions = [
      "Tell me about your experience in this role.",
      "What specific skills do you bring to this position?",
      "How do you stay updated with industry trends?",
      "Describe a challenging project you've worked on.",
      "What are your career goals in this field?",
      "How do you handle tight deadlines?",
      "Tell me about a time you had to learn something quickly.",
      "How do you approach problem-solving?",
      "What's your preferred work environment?",
      "How do you handle feedback and criticism?",
    ];

    // Role-specific questions
    const roleSpecificQuestions: { [key: string]: string[] } = {
      "software engineer": [
        "How do you approach debugging complex issues?",
        "Describe your experience with version control systems.",
        "How do you ensure code quality in your projects?",
        "Tell me about a technical problem you solved.",
        "How do you handle technical debt?",
      ],
      "product manager": [
        "How do you prioritize product features?",
        "Describe your experience with user research.",
        "How do you handle competing stakeholder requirements?",
        "Tell me about a product launch you managed.",
        "How do you measure product success?",
      ],
      "data scientist": [
        "How do you approach data cleaning and preprocessing?",
        "Describe your experience with machine learning models.",
        "How do you handle missing or incomplete data?",
        "Tell me about a data analysis project.",
        "How do you communicate technical findings to non-technical stakeholders?",
      ],
      designer: [
        "How do you approach user experience design?",
        "Describe your design process from concept to final product.",
        "How do you handle design feedback and iterations?",
        "Tell me about a design challenge you solved.",
        "How do you stay inspired and creative?",
      ],
      marketing: [
        "How do you measure marketing campaign success?",
        "Describe your experience with digital marketing tools.",
        "How do you develop marketing strategies?",
        "Tell me about a successful marketing campaign.",
        "How do you stay updated with marketing trends?",
      ],
    };

    // Get role-specific questions if available
    const roleQuestions = roleSpecificQuestions[role.toLowerCase()] || [];
    const allQuestions = [...baseQuestions, ...roleQuestions];

    // Shuffle and select questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    selected.forEach((question, index) => {
      questions.push({
        id: `role-${index + 1}`,
        question,
        category: focusAreas[0] || "general",
        timeLimit: Math.max(
          60,
          Math.floor((customDuration * 60) / customQuestionCount)
        ),
        hints: ["Be specific", "Use examples", "Stay relevant to the role"],
      });
    });

    return questions;
  };

  const addCustomQuestion = () => {
    setCustomQuestions([...customQuestions, ""]);
  };

  const removeCustomQuestion = (index: number) => {
    const newQuestions = customQuestions.filter((_, i) => i !== index);
    setCustomQuestions(newQuestions);
  };

  const updateCustomQuestion = (index: number, value: string) => {
    const newQuestions = [...customQuestions];
    newQuestions[index] = value;
    setCustomQuestions(newQuestions);
  };

  const addFocusArea = () => {
    setCustomFocusAreas([...customFocusAreas, "general"]);
  };

  const removeFocusArea = (index: number) => {
    const newFocusAreas = customFocusAreas.filter((_, i) => i !== index);
    setCustomFocusAreas(newFocusAreas);
  };

  const updateFocusArea = (index: number, value: string) => {
    const newFocusAreas = [...customFocusAreas];
    newFocusAreas[index] = value;
    setCustomFocusAreas(newFocusAreas);
  };

  const addTechTag = () => {
    setCustomTechTags([...customTechTags, ""]);
  };

  const removeTechTag = (index: number) => {
    const newTechTags = customTechTags.filter((_, i) => i !== index);
    setCustomTechTags(newTechTags);
  };

  const updateTechTag = (index: number, value: string) => {
    const newTechTags = [...customTechTags];
    newTechTags[index] = value;
    setCustomTechTags(newTechTags);
  };

  const generateAIQuestions = async (
    role: string,
    difficulty: string,
    focusAreas: string[],
    count: number
  ): Promise<InterviewQuestion[]> => {
    try {
      setIsGeneratingQuestions(true);

      // Get technology tags (filter out empty ones)
      const techTags = customTechTags.filter((tag) => tag.trim()).join(", ");

      // Create a prompt for the AI to generate questions
      const prompt = `Generate ${count} interview questions for a ${difficulty} level ${role} position. 
      
Focus areas: ${focusAreas.join(", ")}
Difficulty: ${difficulty}
Role: ${role}
${techTags ? `Technologies: ${techTags}` : ""}

Requirements:
- Questions should be specific to the role and difficulty level
- Include a mix of technical, behavioral, and situational questions
- Questions should be realistic and industry-standard
- Each question should be challenging but appropriate for the difficulty level
- Questions should help assess the candidate's fit for the specific role
${techTags ? `- Include questions specifically about: ${techTags}` : ""}

Format each question as a JSON object with:
- question: the actual question text
- category: one of the focus areas
- timeLimit: appropriate time in seconds (60-180)
- hints: 2-3 helpful hints for the candidate

Return only the JSON array, no additional text.`;

      // Use the existing aiService instead of calling a separate API
      const response = await aiService.generateResponse(prompt);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate AI questions");
      }

      // Try to parse the AI response as JSON
      let aiQuestions;
      try {
        // Clean the response to extract just the JSON part
        const jsonMatch = response.data.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiQuestions = JSON.parse(jsonMatch[0]);
        } else {
          aiQuestions = JSON.parse(response.data);
        }
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        console.log("AI Response:", response.data);
        throw new Error("AI generated invalid response format");
      }

      // Convert AI questions to our format
      const formattedQuestions: InterviewQuestion[] = aiQuestions.map(
        (q: Record<string, unknown>, index: number) => ({
          id: `ai-${index + 1}`,
          question: q.question,
          category: q.category || focusAreas[0],
          timeLimit: q.timeLimit || 120,
          hints: q.hints || [
            "Be specific",
            "Use examples",
            "Stay relevant to the role",
          ],
        })
      );

      return formattedQuestions;
    } catch (error) {
      console.error("Error generating AI questions:", error);
      // Fallback to role-based questions if AI fails
      return generateRoleBasedQuestions(role, focusAreas, count);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Resume-based interview functions
  const handleResumeFileUpload = async (file: File) => {
    try {
      setIsParsingResume(true);
      setResumeFile(file);
      setError(null);

      // Read file as text if it's a text file
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        // Parse the resume
        const parsed = await GeminiATSService.parseResumeText(text, file.name);
        setParsedResumeData(parsed);
      } else {
        // For PDF/DOCX, use GeminiATSService to parse
        const parsed = await GeminiATSService.parseResumeFile(file);
        setResumeText(parsed.text);
        setParsedResumeData(parsed);
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to parse resume. Please try again."
      );
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleResumeTextInput = async (text: string) => {
    try {
      setIsParsingResume(true);
      setResumeText(text);
      setError(null);

      // Parse the resume text
      const parsed = await GeminiATSService.parseResumeText(text, "resume.txt");
      setParsedResumeData(parsed);
    } catch (error) {
      console.error("Error parsing resume text:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to parse resume. Please try again."
      );
    } finally {
      setIsParsingResume(false);
    }
  };

  const generateResumeBasedQuestions = async (
    resumeData: Record<string, unknown>,
    difficulty: string,
    count: number
  ): Promise<InterviewQuestion[]> => {
    try {
      setIsGeneratingResumeQuestions(true);

      const skills = resumeData.sections.skills || [];
      const experience = resumeData.sections.experience || [];
      const education = resumeData.sections.education || [];
      const projects = resumeData.sections.projects || [];
      const summary = resumeData.sections.summary || "";

      // Create a prompt for the AI to generate resume-based questions
      const prompt = `Generate ${count} personalized interview questions based on the candidate's resume. 

Resume Summary: ${summary}
Skills: ${skills.join(", ")}
Experience: ${experience.slice(0, 3).join("; ")}
Education: ${education.join("; ")}
Projects: ${projects.slice(0, 2).join("; ")}

Difficulty Level: ${difficulty}

Requirements:
- Questions should be personalized based on the candidate's actual experience, skills, and projects
- Ask about specific technologies, projects, or experiences mentioned in the resume
- Include a mix of technical questions (based on skills), behavioral questions (based on experience), and project-based questions
- Questions should be challenging but appropriate for the difficulty level
- Make questions feel natural and relevant to the candidate's background
- Reference specific items from the resume when appropriate

Format each question as a JSON object with:
- question: the actual question text (personalized to the resume)
- category: "technical" | "behavioral" | "project" | "experience"
- timeLimit: appropriate time in seconds (60-180)
- hints: 2-3 helpful hints for the candidate

Return only the JSON array, no additional text.`;

      // Use the existing aiService
      const response = await aiService.generateResponse(prompt);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate resume-based questions");
      }

      // Try to parse the AI response as JSON
      let aiQuestions;
      try {
        const jsonMatch = response.data.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiQuestions = JSON.parse(jsonMatch[0]);
        } else {
          aiQuestions = JSON.parse(response.data);
        }
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        throw new Error("AI generated invalid response format");
      }

      // Convert AI questions to our format
      const formattedQuestions: InterviewQuestion[] = aiQuestions.map(
        (q: Record<string, unknown>, index: number) => ({
          id: `resume-${index + 1}`,
          question: q.question,
          category: q.category || "general",
          timeLimit: q.timeLimit || 120,
          hints: q.hints || [
            "Reference your resume",
            "Be specific about your experience",
            "Use concrete examples",
          ],
        })
      );

      return formattedQuestions;
    } catch (error) {
      console.error("Error generating resume-based questions:", error);
      // Fallback to generic questions
      return [];
    } finally {
      setIsGeneratingResumeQuestions(false);
    }
  };

  const createResumeInterview = async () => {
    if (!parsedResumeData) {
      setError("Please upload and parse a resume first");
      return;
    }

    try {
      setIsGeneratingResumeQuestions(true);
      const finalQuestionCount = Math.min(resumeQuestionCount, 10);

      // Generate resume-based questions
      const generatedQuestions = await generateResumeBasedQuestions(
        parsedResumeData,
        resumeDifficulty,
        finalQuestionCount
      );

      if (generatedQuestions.length === 0) {
        throw new Error("Failed to generate questions from resume");
      }

      const session: InterviewSession = {
        id: Date.now().toString(),
        type: "resume",
        difficulty: resumeDifficulty,
        duration: resumeDuration,
        questions: generatedQuestions,
        currentQuestionIndex: 0,
        startTime: new Date(),
      };

      setActiveSession(session);
      setTimeRemaining(session.questions[0].timeLimit);
      setCurrentAnswer("");
      setIsInterviewStarted(false);

      // Auto-start camera if enabled
      if (showCameraPreview) {
        setTimeout(() => {
          startCamera();
        }, 100);
      }
    } catch (error) {
      console.error("Error creating resume interview:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create resume-based interview"
      );
    } finally {
      setIsGeneratingResumeQuestions(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      // Check if VAPI is ready
      if (!isVapiReady) {
        throw new Error(
          "VAPI is not properly configured. Please check your setup."
        );
      }

      // Check for browser issues
      if (browserIssues.length > 0) {
        throw new Error(
          `Browser compatibility issues: ${browserIssues.join(", ")}`
        );
      }

      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      // Format questions for the AI interviewer
      let formattedQuestions = "";
      let interviewContext = "";

      if (activeSession && activeSession.questions.length > 0) {
        formattedQuestions = activeSession.questions
          .map((question, index) => `${index + 1}. ${question.question}`)
          .join("\n");

        // Add context about the interview type and difficulty
        interviewContext = `Interview Type: ${activeSession.type}
Difficulty Level: ${activeSession.difficulty}
Duration: ${activeSession.duration} minutes
Total Questions: ${activeSession.questions.length}`;
      } else {
        formattedQuestions =
          "1. Tell me about yourself\n2. Why are you interested in this role?\n3. What are your greatest strengths?\n4. Where do you see yourself in 5 years?\n5. Do you have any questions for us?";
      }

      const currentUserInfo = realTimeAuth.getCurrentUser();
      const userName = currentUserInfo?.username || "Candidate";

      // Fetch user profile to get AI Tone preference
      let aiTone = "balanced";
      if (currentUserInfo?.id) {
        try {
          const profile = await ProfileService.getProfileByUserId(currentUserInfo.id);
          if (profile?.aiTone) {
            aiTone = profile.aiTone;
          }
        } catch (e) {
          console.error("Failed to fetch profile for AI Tone in MockInterview", e);
        }
      }

      let toneInstruction = `Be professional, yet warm, supportive, and welcoming:
- Use official yet very friendly language.
- Keep responses concise and to the point (like in a real voice conversation).
- Avoid robotic phrasing—sound natural, empathetic, and conversational.
- Show genuine interest in helping them succeed.`;

      if (aiTone === "motivating") {
        toneInstruction = `Be overwhelmingly positive, uplifting, and motivating:
- Act as their biggest cheerleader.
- Shower them with encouragement and praise for their efforts.
- Keep responses concise but highly energetic and friendly.
- Frame all feedback in the most positive light possible.`;
      } else if (aiTone === "honest") {
        toneInstruction = `Be direct, unvarnished, and completely honest:
- Do not sugarcoat any feedback. If an answer was poor, say so directly.
- Act as a strict, rigorous interviewer who expects excellence.
- Keep responses concise and highly critical, focusing entirely on what needs improvement.
- Maintain professionalism but do not prioritize warmth over accuracy.`;
      } else if (aiTone === "academic") {
        toneInstruction = `Be highly academic, formal, and analytical:
- Focus intensely on the theoretical correctness and structural logic of their answers.
- Speak with elevated, professional, and precise vocabulary.
- Keep responses concise but rigorous.
- Offer feedback rooted in industry standards and academic principles.`;
      }

      console.log("Starting interview with questions:", formattedQuestions);
      // ── Build mode-specific system prompt & firstMessage ──
      const modePrompts: Record<string, { system: string; greeting: string }> = {
        learning: {
          system: `You are an expert educational interview coach named Sarah. Your ultimate goal is to help ${userName} LEARN, improve, and gain confidence.

${interviewContext}

Questions to cover:
${formattedQuestions}

Coaching Guidelines:
- After each answer, give brief, constructive feedback (what they did well + one improvement).
- If they struggle, offer hints and guide them to the answer instead of moving on.
- Use encouragement: "Great start!", "I liked how you structured that."
- Ask clarifying follow-ups to deepen their thinking.
- Teach frameworks (STAR, CAR, etc.) when relevant.
- Keep responses SHORT — 2-3 sentences max.

${toneInstruction}`,
          greeting: `Hello ${userName}! I'm Sarah, your interview coach today. This is a safe space to learn and improve — I'll give you real-time tips as we go. Let's start with your ${activeSession?.type || "general"} practice session!`,
        },
        realistic: {
          system: `You are a professional interviewer named Sarah conducting a realistic interview for a ${activeSession?.type || "general"} role. Behave EXACTLY like a real interviewer at a top company.

${interviewContext}

Questions to cover:
${formattedQuestions}

Realistic Interview Rules:
- Do NOT give feedback, hints, or coaching during the interview.
- React naturally: nod acknowledgments like "I see", "Interesting", "Thank you for that."
- Ask follow-up questions when answers are vague or surface-level.
- Maintain professional but warm demeanor.
- Time-box appropriately — if an answer runs long, politely move on.
- After all questions, end with "Do you have any questions for me?"
- Keep responses SHORT and natural — this is a real interview.

${toneInstruction}`,
          greeting: `Hello ${userName}, thank you for joining us today. I'm Sarah, and I'll be conducting your interview for the ${activeSession?.type || "general"} position. This should take about ${activeSession?.duration || 30} minutes. Shall we begin?`,
        },
        stress: {
          system: `You are a demanding, fast-paced interviewer named Sarah. Your role is to stress-test ${userName} under pressure — rapid questions, tough follow-ups, and zero hand-holding.

${interviewContext}

Questions to cover:
${formattedQuestions}

Stress Test Rules:
- Ask questions in rapid succession. Don't let long pauses sit.
- Challenge vague answers immediately: "Can you be more specific?" "What exactly do you mean?"
- Interrupt politely if they ramble: "Let me stop you there — can you get to the key point?"
- Ask curveball follow-ups to test adaptability.
- Maintain professional intensity — firm but not rude.
- After the session, acknowledge their effort briefly.
- Keep all responses under 2 sentences to maintain pace.

${toneInstruction}`,
          greeting: `Hi ${userName}. I'm Sarah. We're going to move fast today — I have ${activeSession?.questions.length || 5} questions and limited time. Ready? Let's go.`,
        },
        behavioral: {
          system: `You are a behavioral interview specialist named Sarah with deep expertise in the STAR method, leadership assessment, and cultural fit evaluation.

${interviewContext}

Questions to cover:
${formattedQuestions}

Behavioral Interview Guidelines:
- For every answer, probe for the full STAR structure: Situation, Task, Action, Result.
- If they skip a component, ask: "What was the specific situation?" or "What measurable result did that produce?"
- Look for leadership signals, conflict resolution, teamwork evidence.
- Ask "Tell me about a time when..." follow-ups to go deeper.
- Evaluate self-awareness: "What would you do differently now?"
- Keep each exchange focused — don't let stories drift.
- Keep your responses brief — 1-2 sentences to redirect or probe.

${toneInstruction}`,
          greeting: `Hello ${userName}! I'm Sarah. Today we'll focus on your experiences and stories — I want to really understand how you've handled real situations. I'll be asking for specific details, so take your time to think before answering. Let's start!`,
        },
        technical_deep: {
          system: `You are a senior technical interviewer named Sarah at a FAANG-level company. Your role is to deeply evaluate ${userName}'s technical thinking, system design ability, and problem-solving approach.

${interviewContext}

Questions to cover:
${formattedQuestions}

Technical Interview Guidelines:
- Start with the question, then progressively increase complexity with follow-ups.
- Ask "Why?" and "What tradeoffs?" after every design decision.
- Probe edge cases: "What happens if this fails?" "How does this scale?"
- If they use a technology, ask them to explain HOW it works under the hood.
- Test their ability to communicate technical concepts clearly.
- Don't accept hand-wavy answers — push for specifics.
- Keep your responses technical and concise — 2-3 sentences.

${toneInstruction}`,
          greeting: `Hi ${userName}, I'm Sarah. Today we'll dive deep into technical topics — I'll be asking follow-ups to understand your thought process, so think out loud. Let's begin with the first question.`,
        },
        custom_mode: {
          system: `You are an interviewer named Sarah conducting a mock interview with ${userName}.

${interviewContext}

Questions to cover:
${formattedQuestions}

Custom Instructions from the candidate:
${customModePrompt || "Conduct a standard, balanced mock interview with moderate feedback."}

${toneInstruction}

Keep your responses concise — 2-3 sentences maximum.`,
          greeting: `Hello ${userName}! I'm Sarah, your interviewer today. Let's get started with your practice session!`,
        },
      };

      const selectedMode = modePrompts[interviewMode] || modePrompts.learning;

      await vapi.start({
        name: "Interviewer",
        firstMessage: selectedMode.greeting,
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
              role: "system" as const,
              content: selectedMode.system,
            },
          ],
        },
      });
    } catch (err) {
      console.error("Error starting call:", err);
      setError(err instanceof Error ? err.message : "Failed to start call");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log("Disconnecting call");

      // Capture session for saving before clearing it
      if (activeSession) {
        console.log("📝 Capturing session for saving:", activeSession.id);
        setSessionToSave(activeSession);
      }

      setCallStatus(CallStatus.FINISHED);
      setIsRecording(false);
      await vapi.stop();
    } catch (err) {
      console.error("Error stopping call:", err);
    }
  };

  // Callback to receive real AI scores from feedback component
  const handleAIScoresAnalyzed = (scores: {
    overall: number;
    technical: number;
    communication: number;
    behavioral: number;
  }) => {
    console.log("📊 Received real AI scores:", scores);
    setRealAIScores(scores);

    // Trigger analytics save with real scores
    setTimeout(() => {
      console.log("🔄 Updating analytics with real AI scores...");
      const sessionForUpdate = activeSession || sessionToSave;
      if (sessionForUpdate) {
        console.log(
          "✅ Using session for AI score update:",
          sessionForUpdate.id
        );
        saveInterviewPerformanceData(sessionForUpdate);

        if (sessionForUpdate === sessionToSave) {
          setTimeout(() => {
            console.log("🧹 Clearing saved session after AI analysis");
            setSessionToSave(null);
          }, 2000);
        }
      } else {
        console.warn("⚠️ No session available for real score update");
      }
    }, 1000);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNextQuestion = async () => {
    if (!activeSession) return;

    const updatedSession = {
      ...activeSession,
      currentQuestionIndex: activeSession.currentQuestionIndex + 1,
    };

    if (updatedSession.currentQuestionIndex >= activeSession.questions.length) {
      // End interview - save data before clearing session
      console.log("🏁 Interview completed, saving data...");
      await saveInterviewPerformanceData(activeSession);

      // Preserve session and messages for AI analysis and feedback
      setSessionToSave(activeSession);
      setFeedbackSession(activeSession);
      setFeedbackMessages([...messages]);
      setActiveSession(null);
      setIsRecording(false);
      setIsPaused(false);
      setCurrentAnswer("");
      setTimeRemaining(0);
      handleDisconnect();

      // Automatically show feedback popup after a short delay
      setTimeout(() => {
        setShowFeedback(true);
      }, 500);
    } else {
      // Move to next question
      setActiveSession(updatedSession);
      setTimeRemaining(
        activeSession.questions[updatedSession.currentQuestionIndex].timeLimit
      );
      setCurrentAnswer("");
    }
  };

  const endInterview = async (session: InterviewSession) => {
    console.log("🏁 Ending interview manually, saving data...");
    await saveInterviewPerformanceData(session);

    // Preserve session and messages for AI analysis and feedback
    setSessionToSave(session);
    setFeedbackSession(session);
    setFeedbackMessages([...messages]);
    setActiveSession(null);
    setIsInterviewStarted(false);
    setIsRecording(false);
    setIsPaused(false);
    setCurrentAnswer("");
    setTimeRemaining(0);
    handleDisconnect();
    stopCamera();

    // Automatically show feedback popup after a short delay
    setTimeout(() => {
      setShowFeedback(true);
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "hard":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700";
    }
  };

  // Show VAPI setup instructions if not configured
  if (!isVapiReady) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            VAPI Setup Required
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            To use real-time voice interviews, you need to configure VAPI (Voice
            AI Platform).
          </p>

          <div className="text-left bg-white dark:bg-slate-800 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Setup Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                Sign up at{" "}
                <a
                  href="https://vapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  vapi.ai
                </a>
              </li>
              <li>Get your Web Token from Settings → API Keys</li>
              <li>
                Create a{" "}
                <code className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">
                  .env
                </code>{" "}
                file in your project root
              </li>
              <li>
                Add:{" "}
                <code className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">
                  VITE_VAPI_WEB_TOKEN=your_token_here
                </code>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>For detailed instructions, see the VAPI setup documentation</p>
          </div>
        </div>
      </div>
    );
  }

  // Show JAM session if selected
  if (showJAMSession) {
    return <JAMSession onBack={() => setShowJAMSession(false)} />;
  }

  // If there's an active session, show the interview interface
  if (activeSession) {
    const currentQuestion =
      activeSession.questions[activeSession.currentQuestionIndex];
    const progress =
      ((activeSession.currentQuestionIndex + 1) /
        activeSession.questions.length) *
      100;

    // Show preparation screen if interview hasn't started
    if (!isInterviewStarted) {
      return (
        <div className="h-full flex flex-col">
          {/* Interview Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setActiveSession(null);
                    setIsInterviewStarted(false);
                    setIsRecording(false);
                    setIsPaused(false);
                    setCurrentAnswer("");
                    setTimeRemaining(0);
                    handleDisconnect();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Interview Preparation
                </h2>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(
                    activeSession.difficulty
                  )}`}
                >
                  {activeSession.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {/* Camera Toggle Button */}
                <button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  disabled={isCameraLoading}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${isCameraLoading
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
                    : isCameraActive
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    }`}
                >
                  {isCameraLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : isCameraActive ? (
                    <VideoOff className="w-4 h-4" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isCameraLoading
                      ? "Starting..."
                      : isCameraActive
                        ? "Stop Camera"
                        : "Start Camera"}
                  </span>
                </button>

                {/* Face Detection Toggle */}
                {isCameraActive && (
                  <button
                    onClick={() => setEnableFaceDetection(!enableFaceDetection)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${enableFaceDetection
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                  >
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {enableFaceDetection
                        ? "Face Detection ON"
                        : "Face Detection OFF"}
                    </span>
                  </button>
                )}

                {/* Eye Contact Status */}
                {enableFaceDetection &&
                  isCameraActive &&
                  faceDetection.hasActiveFaces && (
                    <EyeContactStatus
                      isEyeContact={faceDetection.eyeContactDetected}
                      confidence={faceDetection.confidence}
                      faceCount={faceDetection.faceCount}
                      className="hidden md:flex"
                    />
                  )}

                {/* Feedback Button */}
                {messages.length > 0 && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-all duration-300"
                  >
                    <BarChart className="w-4 h-4" />
                    <span className="text-sm font-medium">Get Feedback</span>
                  </button>
                )}

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preparation Content */}
          <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto">
            {/* Video/Interview Area */}
            <div className="flex-1 p-4 lg:p-6 min-w-0">
              <div className="h-full flex flex-col space-y-6">
                {/* Video Area - Preparation Mode */}
                <div className="flex-1 bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden max-w-7xl mx-auto w-full aspect-video lg:aspect-[16/10] xl:aspect-[4/3] min-h-[500px] lg:min-h-[600px] xl:min-h-[700px]">
                  {/* Camera preview placeholder when camera is off */}
                  {!isCameraActive && (
                    <div className="text-center text-gray-400">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Camera Preview</p>
                      <p className="text-sm">Start camera to see preview</p>
                    </div>
                  )}

                  {/* Camera active display for preparation mode */}
                  {isCameraActive && (
                    <div className="text-center text-gray-400">
                      <Video className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium text-green-400">
                        Camera Active
                      </p>
                      <p className="text-sm">
                        Camera will be visible during interview
                      </p>
                    </div>
                  )}

                  {/* Debug Info */}
                  {enableFaceDetection &&
                    isCameraActive &&
                    videoRef.current && (
                      <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded">
                        Video: {videoRef.current.videoWidth || 0}x
                        {videoRef.current.videoHeight || 0}
                        <br />
                        Faces: {detectedFaces.length}
                        <br />
                        Status:{" "}
                        {faceDetection.isProcessing ? "Processing" : "Ready"}
                      </div>
                    )}

                  {/* Camera Status Overlay */}
                  {isCameraActive && (
                    <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-white text-sm font-medium">
                            LIVE
                          </span>
                        </div>
                      </div>

                      {/* Face Detection Status */}
                      {enableFaceDetection && (
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <Target className="w-3 h-3 text-white" />
                            <span className="text-white text-sm font-medium">
                              {faceDetection.hasActiveFaces
                                ? `${faceDetection.faceCount} face${faceDetection.faceCount !== 1 ? "s" : ""
                                } detected`
                                : "Scanning..."}
                            </span>
                            {faceDetection.eyeContactDetected && (
                              <span className="text-green-400 text-sm">✅</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Interview Details */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Ready to Start Your Interview?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You're about to begin a {activeSession.type} interview
                      with {activeSession.questions.length} questions.
                    </p>

                    {/* AI-Generated Badge */}
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isAIGenerated
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600"
                        }`}>
                        {isAIGenerated ? <Sparkles className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                        {isAIGenerated ? "AI-Generated — Tailored to your role" : "Curated Question Pool"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activeSession.duration} min
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Duration
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activeSession.questions.length}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Questions
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activeSession.difficulty}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Level
                        </p>
                      </div>
                    </div>

                    {/* Face Detection Stats */}
                    {enableFaceDetection && isCameraActive && (
                      <FaceDetectionStats
                        stats={faceDetection.stats}
                        className="mb-4"
                      />
                    )}

                    {/* ── Interview Mode Selector ── */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Interview Style</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {interviewModes.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setInterviewMode(mode.id)}
                            className={`relative text-left p-3 rounded-xl border-2 transition-all duration-300 ${interviewMode === mode.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md"
                              : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                              }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{mode.icon}</span>
                              <span className={`text-xs font-bold ${interviewMode === mode.id ? "text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"
                                }`}>{mode.label}</span>
                            </div>
                            <p className="text-[10px] leading-tight text-gray-500 dark:text-gray-400 line-clamp-2">{mode.desc}</p>
                            {interviewMode === mode.id && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Custom mode text input */}
                      {interviewMode === "custom_mode" && (
                        <div className="mt-3">
                          <textarea
                            value={customModePrompt}
                            onChange={(e) => setCustomModePrompt(e.target.value)}
                            placeholder="Describe how you want the interviewer to behave... e.g. 'Act like a startup CTO who values speed over perfection'"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={beginInterview}
                        className={`w-full px-8 py-4 bg-gradient-to-r ${interviewModes.find(m => m.id === interviewMode)?.color || "from-blue-600 to-purple-600"} text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold`}
                      >
                        Start {interviewModes.find(m => m.id === interviewMode)?.label || "Interview"}
                      </button>

                      <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl p-4">
                        <div className="text-center space-y-3">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Changed your mind?
                          </p>
                          <button
                            onClick={() => {
                              setActiveSession(null);
                              setIsInterviewStarted(false);
                              setIsRecording(false);
                              setIsPaused(false);
                              setCurrentAnswer("");
                              setTimeRemaining(0);
                              handleDisconnect();
                            }}
                            className="px-6 py-3 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-500 transition-all duration-300 shadow-md hover:shadow-lg text-base font-medium border border-gray-300 dark:border-slate-500"
                          >
                            Cancel Interview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show actual interview interface when started
    return (
      <div className="h-full flex flex-col">
        {/* Interview Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setActiveSession(null);
                  setIsInterviewStarted(false);
                  setIsRecording(false);
                  setIsPaused(false);
                  setCurrentAnswer("");
                  setTimeRemaining(0);
                  handleDisconnect();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mock Interview Session
              </h2>
              <span
                className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(
                  activeSession.difficulty
                )}`}
              >
                {activeSession.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Camera Toggle Button */}
              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                disabled={isCameraLoading}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${isCameraLoading
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
                  : isCameraActive
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  }`}
              >
                {isCameraLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : isCameraActive ? (
                  <VideoOff className="w-4 h-4" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isCameraLoading
                    ? "Starting..."
                    : isCameraActive
                      ? "Stop Camera"
                      : "Start Camera"}
                </span>
              </button>

              {/* Feedback Button */}
              {messages.length > 0 && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-all duration-300"
                >
                  <BarChart className="w-4 h-4" />
                  <span className="text-sm font-medium">Get Feedback</span>
                </button>
              )}

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interview Content */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto">
          {/* Video/Interview Area */}
          <div className="flex-1 p-4 lg:p-6 min-w-0">
            <div className="h-full flex flex-col space-y-6">
              {/* Interview Status Indicator - Mobile responsive */}
              {callStatus === CallStatus.ACTIVE && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl shadow-lg mb-3 sm:mb-4">
                  <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold text-sm sm:text-base lg:text-lg" style={{ fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
                      Interview Session Active
                    </span>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Connection Status Warning */}
              {callStatus === CallStatus.CONNECTING && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold text-lg">
                      Connecting to Interview...
                    </span>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-yellow-100 mt-2 text-center">
                    If connection fails, check your network connection and try again
                  </p>
                </div>
              )}

              {/* Connection Error Help */}
              {error && error.includes("connection") && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-2">
                        Connection Troubleshooting
                      </h4>
                      <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
                        <li>Check your internet connection</li>
                        <li>Try disabling VPN or firewall temporarily</li>
                        <li>Ensure microphone permissions are granted</li>
                        <li>Try refreshing the page and starting again</li>
                        <li>If on a corporate network, contact IT about WebRTC/UDP port restrictions</li>
                      </ul>
                      <button
                        onClick={() => {
                          setError(null);
                          if (activeSession) {
                            handleStartRecording();
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interview Video Area - Mobile responsive */}
              <div className="flex-1 bg-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden max-w-7xl mx-auto w-full aspect-video min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
                {/* Video element - always present in DOM for interview mode */}
                <video
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-xl"
                  style={{
                    display: isCameraActive ? "block" : "none",
                    visibility: isCameraActive ? "visible" : "hidden",
                  }}
                  onLoadedMetadata={() => {
                    console.log("Video metadata loaded (interview mode)");
                    if (videoRef.current) {
                      videoRef.current
                        .play()
                        .catch((e) => console.log("Auto-play prevented:", e));
                    }
                  }}
                  onCanPlay={() =>
                    console.log("Video can play (interview mode)")
                  }
                  onPlay={() =>
                    console.log("Video started playing (interview mode)")
                  }
                  onError={(e) =>
                    console.error("Video error (interview mode):", e)
                  }
                />

                {/* Face Detection Overlay for Interview Mode */}
                {enableFaceDetection && isCameraActive && videoRef.current && (
                  <FaceDetectionOverlay
                    faces={detectedFaces}
                    videoWidth={videoRef.current.videoWidth || 640}
                    videoHeight={videoRef.current.videoHeight || 480}
                    showConfidence={true}
                    showHeadPose={false}
                    eyeContactPercentage={
                      faceDetection.stats.eyeContactPercentage
                    }
                  />
                )}

                {isCameraActive ? (
                  <div className="w-full h-full relative">
                    {/* Camera Status Overlay - Mobile responsive */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 z-20">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white flex-shrink-0" />
                          <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                            Camera Active
                          </span>
                        </div>
                      </div>

                      {/* Face Detection Status - Mobile responsive */}
                      {enableFaceDetection && (
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                          <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <Target className="w-3 h-3 text-white flex-shrink-0" />
                            <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                              {faceDetection.hasActiveFaces
                                ? `${faceDetection.faceCount} face${faceDetection.faceCount !== 1 ? "s" : ""
                                } detected`
                                : "Scanning..."}
                            </span>
                            {faceDetection.eyeContactDetected && (
                              <span className="text-green-400 text-xs sm:text-sm">✅</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recording Indicator - Mobile responsive */}
                    {isRecording && (
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center space-x-1.5 sm:space-x-2 z-20">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                          <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">
                              Recording
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Speaking Indicator */}
                    {isSpeaking && (
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">
                              AI Speaking
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {isCameraLoading ? (
                        <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                      ) : cameraError ? (
                        <AlertCircle className="w-16 h-16 text-red-500" />
                      ) : (
                        <Camera className="w-16 h-16 text-gray-600" />
                      )}
                    </div>
                    <p className="text-white mb-2">
                      {isCameraLoading
                        ? "Starting Camera..."
                        : cameraError
                          ? "Camera Error"
                          : "Camera Preview"}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      {isCameraLoading
                        ? "Please wait while we access your camera"
                        : cameraError ||
                        "Your video will appear here during the interview"}
                    </p>

                    {cameraError && (
                      <div className="bg-red-900/50 rounded-lg p-3 mb-4 max-w-sm mx-auto">
                        <p className="text-red-200 text-xs">{cameraError}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={startCamera}
                        disabled={isCameraLoading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isCameraLoading
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                      >
                        {isCameraLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        <span>
                          {isCameraLoading ? "Starting..." : "Start Camera"}
                        </span>
                      </button>

                      {showCameraPreview && !isCameraLoading && (
                        <button
                          onClick={() => {
                            console.log("Retrying camera start...");
                            setTimeout(() => startCamera(), 100);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                {callStatus === CallStatus.INACTIVE ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Start Interview</span>
                  </button>
                ) : callStatus === CallStatus.CONNECTING ? (
                  <button
                    disabled
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </button>
                ) : null}
              </div>

              {/* End Interview Button - Prominently displayed below video */}
              {callStatus === CallStatus.ACTIVE && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        Interview in Progress
                      </span>
                    </div>
                    <p className="text-red-600 text-sm">
                      Click the button below to end your interview session
                    </p>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to end this interview session? This action cannot be undone."
                          )
                        ) {
                          await endInterview(activeSession);
                        }
                      }}
                      className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg border-2 border-red-400 mx-auto"
                    >
                      <PhoneOff className="w-6 h-6" />
                      <span>End Interview Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Panel */}
          <div className="w-full lg:w-80 xl:w-80 2xl:w-96 bg-white dark:bg-slate-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-700 p-4 lg:p-6 overflow-y-auto flex-shrink-0 max-h-96 lg:max-h-none">
            <div className="space-y-6">
              {/* Current Question */}
              <div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {currentQuestion.question}
                  </p>
                </div>
              </div>

              {/* Conversation Transcript */}
              {messages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Conversation
                  </h4>
                  <div className="space-y-3">
                    {messages.slice(-5).map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                          }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                            }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium opacity-80">
                              {message.role === "user"
                                ? "You"
                                : "AI Interviewer"}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the template selection interface
  return (
    <div className="container-mobile space-responsive">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-responsive text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-y-12 -translate-x-12 sm:translate-y-24 sm:-translate-x-24"></div>

        <div className="relative z-10 flex-responsive items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-responsive-2xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Mock Interview Practice
            </h2>
            <p className="text-responsive-lg sm:text-xl text-purple-100 mb-6 leading-relaxed">
              Master your interview skills with AI-powered practice sessions,
              personalized questions, and real-time feedback
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
                <span className="text-responsive-sm font-medium">Voice AI</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                <span className="text-responsive-sm font-medium">
                  Video Practice
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 flex-shrink-0" />
                <span className="text-responsive-sm font-medium">
                  Text Practice
                </span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center">
              <Video className="w-12 h-12 sm:w-16 sm:h-16 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-responsive shadow-lg">
          <div className="flex-responsive items-start">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 mb-2 text-responsive-base">
                Something went wrong
              </h3>
              <p className="text-red-700 text-responsive-sm mb-3">{error}</p>
              <button
                onClick={() => setError(null)}
                className="btn-touch inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-responsive-sm font-medium"
              >
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browser Compatibility Issues */}
      {browserIssues.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-responsive shadow-lg">
          <div className="flex-responsive items-start">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-orange-900 mb-2 text-responsive-base">
                Browser Compatibility Issues
              </h3>
              <ul className="text-orange-700 text-responsive-sm space-y-1 mb-3">
                {browserIssues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="break-words">{issue}</span>
                  </li>
                ))}
              </ul>
              <p className="text-orange-600 text-responsive-sm font-medium">
                💡 Try using Chrome, Edge, or Firefox for the best experience.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interview Templates */}
      <div>
        <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Choose Interview Type
        </h3>

        {/* Camera Option */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-responsive border border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="flex-responsive items-center">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-responsive-base mb-1">
                  Enable Camera Preview
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-responsive-sm">
                  Practice while seeing yourself on screen during the interview
                  for better self-awareness
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCameraPreview(!showCameraPreview)}
              className={`btn-touch flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0 ${showCameraPreview
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500"
                }`}
            >
              {showCameraPreview ? (
                <>
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-responsive-sm">Enabled</span>
                </>
              ) : (
                <>
                  <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-responsive-sm">Disabled</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Face Detection Option */}
        {showCameraPreview && (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-lg mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                    Face Detection & Eye Contact Analysis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get real-time feedback on your eye contact and facial
                    positioning during practice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnableFaceDetection(!enableFaceDetection)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${enableFaceDetection
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-500"
                  }`}
              >
                {enableFaceDetection ? (
                  <>
                    <Target className="w-5 h-5" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
            </div>

            {enableFaceDetection && (
              <div className="mt-4 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200 dark:border-green-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">
                      ✅ Eye Contact Detection
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Real-time monitoring
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">
                      📊 Performance Analytics
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Detailed statistics
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">
                      🎯 Visual Feedback
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Live overlay indicators
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation - Mobile responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-inner">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-shrink-0 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === "templates"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg border-2 border-blue-200 dark:border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden xs:inline">Interview Templates</span>
                  <span className="xs:hidden">Templates</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-shrink-0 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === "custom"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg border-2 border-purple-200 dark:border-purple-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Custom Interview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("resume")}
                className={`flex-shrink-0 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === "resume"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg border-2 border-green-200 dark:border-green-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">Resume-Based Interview</span>
                  <span className="sm:hidden">Resume</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("coding")}
                className={`flex-shrink-0 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === "coding"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg border-2 border-orange-200 dark:border-orange-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  <span className="hidden sm:inline">AI Coding Interview</span>
                  <span className="sm:hidden">Coding</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => startInterview(template.id)}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 text-left transform hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600 relative overflow-hidden"
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${template.id === "general"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : template.id === "behavioral"
                            ? "bg-gradient-to-br from-green-500 to-green-600"
                            : template.id === "technical"
                              ? "bg-gradient-to-br from-purple-500 to-purple-600"
                              : template.id === "quick"
                                ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                : template.id === "jam"
                                  ? "bg-gradient-to-br from-pink-500 to-rose-600"
                                  : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                          }`}
                      >
                        {template.id === "jam" ? (
                          <MessageSquare className="w-5 h-5 text-white" />
                        ) : (
                          <Target className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {template.name}
                      </h4>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${template.difficulty === "easy"
                        ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30"
                        : template.difficulty === "medium"
                          ? "text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30"
                          : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30"
                        }`}
                    >
                      {template.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{template.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span>{template.questionCount} questions</span>
                    </div>
                  </div>

                  {showCameraPreview && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2">
                      <Camera className="w-4 h-4" />
                      <span className="font-medium">+ Camera Preview</span>
                    </div>
                  )}

                  {/* Hover effect indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom Interview Tab */}
        {activeTab === "custom" && (
          <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-3xl p-8 border border-gray-200 dark:border-slate-600 shadow-xl">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Create Your Perfect Interview
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Tailor every aspect to match your target role and preferences
                </p>
              </div>

              {/* Role and Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g., Software Engineer, Product Manager"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Difficulty Level
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={(e) =>
                      setCustomDifficulty(
                        e.target.value as "easy" | "medium" | "hard"
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={customQuestionCount}
                    onChange={(e) =>
                      setCustomQuestionCount(
                        Math.min(parseInt(e.target.value) || 3, 10)
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-800">
                    💡 Maximum 10 questions for optimal interview experience
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={customDuration}
                    onChange={(e) =>
                      setCustomDuration(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Focus Areas
                </label>
                <div className="space-y-3">
                  {customFocusAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <select
                        value={area}
                        onChange={(e) => updateFocusArea(index, e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="leadership">Leadership</option>
                        <option value="problem-solving">Problem Solving</option>
                        <option value="communication">Communication</option>
                      </select>
                      {customFocusAreas.length > 1 && (
                        <button
                          onClick={() => removeFocusArea(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border-2 border-red-200 hover:border-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addFocusArea}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors border border-blue-200"
                  >
                    + Add Focus Area
                  </button>
                </div>
              </div>

              {/* Technology Tags */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Technology Tags (Optional)
                </label>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600">
                  Add specific technologies, frameworks, or tools you want to be
                  asked about (e.g., React, Django, AWS, Docker)
                </p>

                {/* Quick Add Technology Buttons */}
                {customRole.toLowerCase().includes("engineer") && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-3">
                      Quick add for {customRole}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "React",
                        "Node.js",
                        "Python",
                        "JavaScript",
                        "Django",
                        "Express",
                        "MongoDB",
                        "PostgreSQL",
                        "AWS",
                        "Docker",
                      ].map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => {
                            if (!customTechTags.includes(tech)) {
                              setCustomTechTags([
                                ...customTechTags.filter((tag) => tag.trim()),
                                tech,
                              ]);
                            }
                          }}
                          className="px-3 py-2 text-sm bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 hover:border-blue-300 font-medium"
                        >
                          + {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {customRole.toLowerCase().includes("data") && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-3">
                      Quick add for {customRole}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Python",
                        "R",
                        "SQL",
                        "Pandas",
                        "NumPy",
                        "Scikit-learn",
                        "TensorFlow",
                        "PyTorch",
                        "Tableau",
                        "Power BI",
                      ].map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => {
                            if (!customTechTags.includes(tech)) {
                              setCustomTechTags([
                                ...customTechTags.filter((tag) => tag.trim()),
                                tech,
                              ]);
                            }
                          }}
                          className="px-3 py-2 text-sm bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors border border-green-200 hover:border-green-300 font-medium"
                        >
                          + {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {customTechTags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTechTag(index, e.target.value)}
                        placeholder="e.g., React, Django, AWS..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                      {customTechTags.length > 1 && (
                        <button
                          onClick={() => removeTechTag(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border-2 border-red-200 hover:border-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTechTag}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors border border-blue-200"
                  >
                    + Add Technology Tag
                  </button>
                </div>
              </div>

              {/* Custom Questions */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Custom Questions (Optional)
                </label>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600">
                  Add specific questions you want to practice. Leave blank to
                  generate questions automatically using AI.
                </p>
                <div className="space-y-3">
                  {customQuestions.map((question, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) =>
                          updateCustomQuestion(index, e.target.value)
                        }
                        placeholder="Enter your custom question..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      {customQuestions.length > 1 && (
                        <button
                          onClick={() => removeCustomQuestion(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border-2 border-red-200 hover:border-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addCustomQuestion}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors border border-blue-200"
                  >
                    + Add Custom Question
                  </button>
                </div>
              </div>

              {/* AI Generation Info */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                      AI-Powered Question Generation
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                      When you don't provide custom questions, our AI will
                      automatically generate up to {customQuestionCount}{" "}
                      personalized interview questions based on your role,
                      difficulty level, focus areas, and technology tags. These
                      questions will be tailored specifically for{" "}
                      {customRole || "your target position"}.
                      {customTechTags.filter((tag) => tag.trim()).length >
                        0 && (
                          <span className="block mt-3 p-3 bg-white/50 rounded-lg border border-blue-200">
                            <strong className="text-blue-800 dark:text-blue-200">
                              Technology focus:
                            </strong>{" "}
                            {customTechTags
                              .filter((tag) => tag.trim())
                              .join(", ")}
                          </span>
                        )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Interview Button */}
              <div className="pt-6">
                <button
                  onClick={createCustomInterview}
                  disabled={!customRole.trim() || isGeneratingQuestions}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${customRole.trim() && !isGeneratingQuestions
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/25 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-lg"
                    }`}
                >
                  {isGeneratingQuestions ? (
                    <div className="flex items-center justify-center space-x-3">
                      <svg
                        className="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Generating Questions...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Target className="w-6 h-6" />
                      <span>Create Custom Interview</span>
                    </div>
                  )}
                </button>
                {!customRole.trim() && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3 bg-gray-50 dark:bg-slate-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-slate-600">
                    Please enter a target role to create your custom interview
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume-Based Interview Tab */}
        {activeTab === "resume" && (
          <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-3xl p-8 border border-gray-200 dark:border-slate-600 shadow-xl">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Resume-Based Interview Practice
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Upload your resume and get personalized interview questions based on your actual experience, skills, and projects
                </p>
              </div>

              {/* Resume Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Upload Your Resume
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-green-500 dark:hover:border-green-600 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleResumeFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileText className="w-16 h-16 text-green-600 mb-4" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX, or TXT (Max 10MB)
                    </p>
                  </label>
                </div>

                {/* Or paste text */}
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">or</p>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    onBlur={() => {
                      if (resumeText.trim()) {
                        handleResumeTextInput(resumeText);
                      }
                    }}
                    placeholder="Paste your resume text here..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[200px]"
                  />
                </div>

                {/* Parsing Status */}
                {isParsingResume && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Parsing resume... This may take a moment for PDF files.
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Display for Resume Parsing */}
                {error && activeTab === "resume" && !isParsingResume && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                          Resume Parsing Error
                        </h4>
                        <p className="text-red-800 dark:text-red-200 text-sm mb-4 whitespace-pre-line">
                          {error}
                        </p>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                          <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                            Alternative Options:
                          </p>
                          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                            <li>Copy and paste your resume text in the text area below</li>
                            <li>Convert your PDF to a text file (.txt) and upload it</li>
                            <li>If your PDF is image-based, try using an OCR tool first</li>
                            <li>Ensure your PDF is not password-protected or encrypted</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parsed Resume Data Display */}
                {parsedResumeData && !isParsingResume && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          Resume Parsed Successfully!
                        </h4>
                        <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                          {parsedResumeData.sections.skills.length > 0 && (
                            <div>
                              <strong>Skills:</strong> {parsedResumeData.sections.skills.slice(0, 5).join(", ")}
                              {parsedResumeData.sections.skills.length > 5 && "..."}
                            </div>
                          )}
                          {parsedResumeData.sections.experience.length > 0 && (
                            <div>
                              <strong>Experience:</strong> {parsedResumeData.sections.experience.length} position(s) found
                            </div>
                          )}
                          {parsedResumeData.sections.projects.length > 0 && (
                            <div>
                              <strong>Projects:</strong> {parsedResumeData.sections.projects.length} project(s) found
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interview Settings */}
              {parsedResumeData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Difficulty Level
                      </label>
                      <select
                        value={resumeDifficulty}
                        onChange={(e) =>
                          setResumeDifficulty(
                            e.target.value as "easy" | "medium" | "hard"
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={resumeQuestionCount}
                        onChange={(e) =>
                          setResumeQuestionCount(
                            Math.min(parseInt(e.target.value) || 3, 10)
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={resumeDuration}
                      onChange={(e) =>
                        setResumeDuration(parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Info Card */}
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                          Personalized Questions Based on Your Resume
                        </h4>
                        <p className="text-green-700 dark:text-green-300 leading-relaxed">
                          Our AI will analyze your resume and generate {resumeQuestionCount} personalized interview questions
                          based on your actual skills, experience, projects, and education. Questions will reference specific
                          items from your resume to make the interview practice more realistic and relevant.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Create Interview Button */}
                  <div className="pt-6">
                    <button
                      onClick={createResumeInterview}
                      disabled={!parsedResumeData || isGeneratingResumeQuestions}
                      className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${parsedResumeData && !isGeneratingResumeQuestions
                        ? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl hover:shadow-green-500/25 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-lg"
                        }`}
                    >
                      {isGeneratingResumeQuestions ? (
                        <div className="flex items-center justify-center space-x-3">
                          <svg
                            className="animate-spin h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Generating Personalized Questions...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <FileText className="w-6 h-6" />
                          <span>Create Resume-Based Interview</span>
                        </div>
                      )}
                    </button>
                    {!parsedResumeData && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3 bg-gray-50 dark:bg-slate-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-slate-600">
                        Please upload or paste your resume to create a personalized interview
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20 rounded-3xl p-8 border border-yellow-200 dark:border-yellow-800 shadow-xl">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Pro Tips for Interview Practice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Choose the right difficulty level for your experience
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Practice in a quiet environment</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Record your responses for self-review</span>
                </li>
              </ul>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use the hints provided for each question</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Practice regularly to build confidence</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Focus on clear communication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI Coding Interview Tab */}
      {activeTab === "coding" && (
        <div className="mt-6">
          <AICodingInterview />
        </div>
      )}

      {/* Feedback Analysis Section */}
      {messages.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-blue-200 shadow-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Interview Feedback Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              You have interview conversation data available. Get comprehensive
              AI-powered feedback on your performance, communication skills,
              technical knowledge, and areas for improvement.
            </p>
            <button
              onClick={() => setShowFeedback(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Analyze Previous Interview
            </button>
          </div>
        </div>
      )}

      {/* Floating Camera Preview */}
      {showCameraPreview && isCameraActive && !activeSession && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm flex items-center">
                <Camera className="w-4 h-4 mr-2 text-blue-600" />
                Camera Preview
              </h4>
              <button
                onClick={stopCamera}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {cameraError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-3">
                <p className="text-xs text-red-700">{cameraError}</p>
              </div>
            )}

            <div className="relative">
              <div className="w-48 h-36 bg-gray-800 rounded-lg border border-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">Camera Active</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Practice your responses
              </p>
              <div className="flex items-center justify-center space-x-1 text-xs text-green-600 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Feedback Modal */}
      {showFeedback && (
        <InterviewFeedback
          messages={feedbackMessages.length > 0 ? feedbackMessages : messages}
          interviewType={
            feedbackSession?.type || (activeSession as InterviewSession | null)?.type || "general"
          }
          difficulty={
            feedbackSession?.difficulty || (activeSession as InterviewSession | null)?.difficulty || "medium"
          }
          role={
            feedbackSession?.type === "custom"
              ? customRole
              : feedbackSession?.type === "resume" || (activeSession as InterviewSession | null)?.type === "resume"
                ? parsedResumeData?.sections?.summary?.split(" ").slice(0, 5).join(" ") || "Resume-Based Role"
                : feedbackSession?.type || (activeSession as InterviewSession | null)?.type === "custom"
                  ? customRole
                  : (activeSession as InterviewSession | null)?.type || "general"
          }
          performanceData={null}
          onClose={() => {
            setShowFeedback(false);
            // Clear feedback data after closing
            setFeedbackMessages([]);
            setFeedbackSession(null);
          }}
          onScoresAnalyzed={handleAIScoresAnalyzed}
        />
      )}

      {/* Face detection debug panel removed for production */}
    </div>
  );
};

export default MockInterview;
