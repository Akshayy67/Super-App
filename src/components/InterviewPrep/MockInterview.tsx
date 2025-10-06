import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  Mic,
  Play,
  Pause,
  SkipForward,
  Clock,
  User,
  Bot,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Award,
  Target,
  BarChart3,
  ArrowRight,
  Headphones,
  MessageSquare,
  ArrowLeft,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  Camera,
  VideoOff,
  X,
  RotateCcw,
  BarChart,
} from "lucide-react";
import {
  vapi,
  isVapiConfigured,
  checkBrowserCompatibility,
  interviewer,
} from "../../lib/vapi.sdk";
import { aiService } from "../../utils/aiService";
import { InterviewFeedback } from "./InterviewFeedback";
import { JAMSession } from "./JAMSession";
import { useFaceDetection } from "../../hooks/useFaceDetection";
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
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    null
  );
  const [sessionToSave, setSessionToSave] = useState<InterviewSession | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("general");
  const [activeTab, setActiveTab] = useState<"templates" | "custom">(
    "templates"
  );
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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const [eyeContactHistory, setEyeContactHistory] = useState<boolean[]>([]);
  const [showFaceDetectionStats, setShowFaceDetectionStats] = useState(false);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);

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
    onEyeContactChange: (hasEyeContact: boolean) => {
      setEyeContactHistory((prev) => [...prev.slice(-99), hasEyeContact]); // Keep last 100 readings
    },
    eyeContactThreshold: {
      yaw: 15, // degrees
      pitch: 15, // degrees
    },
  });

  // Reset to templates view when component mounts or tab is clicked
  useEffect(() => {
    setActiveTab("templates");
    setSelectedTemplate("general");
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

      await saveInterviewPerformanceData(sessionForSaving);
      console.log("✅ saveInterviewPerformanceData completed");

      // Clear the captured session
      setSessionToSave(null);
    };

    const onMessage = (message: any) => {
      console.log("Message received:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role || "user",
          content: message.transcript,
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
      setError(error.message);
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
  }, []);

  const interviewTemplates = [
    {
      id: "general",
      name: "General Interview",
      description: "Mix of behavioral and general questions",
      duration: 30,
      questionCount: 10,
      difficulty: "medium" as const,
    },
    {
      id: "behavioral",
      name: "Behavioral Focus",
      description: "STAR method practice with situational questions",
      duration: 45,
      questionCount: 12,
      difficulty: "medium" as const,
    },
    {
      id: "technical",
      name: "Technical Interview",
      description: "Role-specific technical questions",
      duration: 60,
      questionCount: 15,
      difficulty: "hard" as const,
    },
    {
      id: "quick",
      name: "Quick Practice",
      description: "5-minute rapid fire questions",
      duration: 5,
      questionCount: 5,
      difficulty: "easy" as const,
    },
    {
      id: "executive",
      name: "Leadership Interview",
      description: "Senior position and leadership focused",
      duration: 45,
      questionCount: 10,
      difficulty: "hard" as const,
    },
    {
      id: "jam",
      name: "JAM Session",
      description: "Just A Minute practice with random topics",
      duration: 2,
      questionCount: 1,
      difficulty: "medium" as const,
    },
  ];

  // Different question sets for each interview type
  const questionSets = {
    general: [
      {
        id: "gen-1",
        question: "Tell me about yourself and your background.",
        category: "general",
        timeLimit: 120,
        hints: [
          "Keep it professional",
          "2-3 minutes max",
          "End with why this role",
        ],
      },
      {
        id: "gen-2",
        question: "Why are you interested in this position?",
        category: "general",
        timeLimit: 90,
        hints: ["Research the company", "Be specific", "Show enthusiasm"],
      },
      {
        id: "gen-3",
        question: "What are your greatest strengths?",
        category: "general",
        timeLimit: 120,
        hints: [
          "Give specific examples",
          "Relate to the role",
          "Show confidence",
        ],
      },
      {
        id: "gen-4",
        question: "Where do you see yourself in 5 years?",
        category: "general",
        timeLimit: 90,
        hints: ["Be realistic", "Show ambition", "Align with company growth"],
      },
      {
        id: "gen-5",
        question: "What are your salary expectations?",
        category: "general",
        timeLimit: 60,
        hints: ["Research market rates", "Be flexible", "Focus on value"],
      },
      {
        id: "gen-6",
        question: "Why should we hire you?",
        category: "general",
        timeLimit: 120,
        hints: [
          "Highlight unique skills",
          "Show enthusiasm",
          "Connect to company needs",
        ],
      },
      {
        id: "gen-7",
        question: "What do you know about our company?",
        category: "general",
        timeLimit: 90,
        hints: [
          "Do your research",
          "Show genuine interest",
          "Mention recent news",
        ],
      },
      {
        id: "gen-8",
        question: "Do you have any questions for us?",
        category: "general",
        timeLimit: 60,
        hints: [
          "Ask thoughtful questions",
          "Show engagement",
          "Learn about the role",
        ],
      },
      {
        id: "gen-9",
        question: "What motivates you?",
        category: "general",
        timeLimit: 90,
        hints: ["Be authentic", "Connect to work", "Show passion"],
      },
      {
        id: "gen-10",
        question: "How do you handle stress and pressure?",
        category: "general",
        timeLimit: 120,
        hints: [
          "Give specific examples",
          "Show resilience",
          "Mention coping strategies",
        ],
      },
    ],
    behavioral: [
      {
        id: "beh-1",
        question: "Describe a challenging project you've worked on.",
        category: "behavioral",
        timeLimit: 180,
        hints: ["Use STAR method", "Focus on your role", "Share the outcome"],
      },
      {
        id: "beh-2",
        question: "How do you handle tight deadlines?",
        category: "behavioral",
        timeLimit: 120,
        hints: [
          "Give specific examples",
          "Show organization skills",
          "Mention tools/methods",
        ],
      },
      {
        id: "beh-3",
        question: "Tell me about a time you failed and what you learned.",
        category: "behavioral",
        timeLimit: 150,
        hints: ["Be honest", "Focus on learning", "Show growth mindset"],
      },
      {
        id: "beh-4",
        question: "Describe a conflict you had with a colleague.",
        category: "behavioral",
        timeLimit: 150,
        hints: [
          "Stay professional",
          "Show conflict resolution",
          "Focus on outcome",
        ],
      },
      {
        id: "beh-5",
        question: "Give an example of when you went above and beyond.",
        category: "behavioral",
        timeLimit: 120,
        hints: ["Show initiative", "Be specific", "Highlight impact"],
      },
      {
        id: "beh-6",
        question: "How do you handle working with difficult people?",
        category: "behavioral",
        timeLimit: 120,
        hints: [
          "Show empathy",
          "Focus on solutions",
          "Maintain professionalism",
        ],
      },
      {
        id: "beh-7",
        question: "Tell me about a time you had to learn something quickly.",
        category: "behavioral",
        timeLimit: 120,
        hints: [
          "Show adaptability",
          "Mention learning strategies",
          "Highlight success",
        ],
      },
      {
        id: "beh-8",
        question:
          "Describe a situation where you had to make a difficult decision.",
        category: "behavioral",
        timeLimit: 150,
        hints: ["Show critical thinking", "Explain reasoning", "Share outcome"],
      },
      {
        id: "beh-9",
        question: "How do you prioritize your work?",
        category: "behavioral",
        timeLimit: 120,
        hints: ["Show organization", "Mention tools/methods", "Give examples"],
      },
      {
        id: "beh-10",
        question: "Tell me about a time you had to adapt to change.",
        category: "behavioral",
        timeLimit: 120,
        hints: [
          "Show flexibility",
          "Explain approach",
          "Highlight positive outcome",
        ],
      },
      {
        id: "beh-11",
        question: "Describe a time you had to work with limited resources.",
        category: "behavioral",
        timeLimit: 150,
        hints: [
          "Show creativity",
          "Mention problem-solving",
          "Highlight results",
        ],
      },
      {
        id: "beh-12",
        question: "How do you handle receiving feedback?",
        category: "behavioral",
        timeLimit: 120,
        hints: ["Show openness", "Mention growth", "Give examples"],
      },
    ],
    technical: [
      {
        id: "tech-1",
        question:
          "Explain a complex technical concept to a non-technical person.",
        category: "technical",
        timeLimit: 120,
        hints: ["Use analogies", "Avoid jargon", "Check understanding"],
      },
      {
        id: "tech-2",
        question: "How do you stay updated with the latest technology trends?",
        category: "technical",
        timeLimit: 90,
        hints: ["Mention specific sources", "Show passion", "Give examples"],
      },
      {
        id: "tech-3",
        question: "Describe your development process from idea to deployment.",
        category: "technical",
        timeLimit: 150,
        hints: [
          "Show methodology",
          "Mention tools",
          "Highlight best practices",
        ],
      },
      {
        id: "tech-4",
        question: "How do you approach debugging a complex issue?",
        category: "technical",
        timeLimit: 120,
        hints: [
          "Show systematic approach",
          "Mention tools",
          "Highlight problem-solving",
        ],
      },
      {
        id: "tech-5",
        question: "Tell me about a challenging technical problem you solved.",
        category: "technical",
        timeLimit: 180,
        hints: [
          "Explain the problem",
          "Show your approach",
          "Highlight the solution",
        ],
      },
      {
        id: "tech-6",
        question: "How do you ensure code quality in your projects?",
        category: "technical",
        timeLimit: 120,
        hints: ["Mention testing", "Code review", "Best practices"],
      },
      {
        id: "tech-7",
        question: "Describe your experience with version control systems.",
        category: "technical",
        timeLimit: 120,
        hints: [
          "Mention specific tools",
          "Show workflow",
          "Highlight collaboration",
        ],
      },
      {
        id: "tech-8",
        question: "How do you handle technical debt in your projects?",
        category: "technical",
        timeLimit: 120,
        hints: ["Show awareness", "Mention strategies", "Highlight balance"],
      },
      {
        id: "tech-9",
        question:
          "Tell me about a time you had to learn a new technology quickly.",
        category: "technical",
        timeLimit: 150,
        hints: [
          "Show learning ability",
          "Mention resources",
          "Highlight application",
        ],
      },
      {
        id: "tech-10",
        question: "How do you approach system design problems?",
        category: "technical",
        timeLimit: 150,
        hints: [
          "Show methodology",
          "Mention considerations",
          "Highlight trade-offs",
        ],
      },
      {
        id: "tech-11",
        question: "Describe your experience with cloud platforms.",
        category: "technical",
        timeLimit: 120,
        hints: [
          "Mention specific platforms",
          "Show understanding",
          "Highlight experience",
        ],
      },
      {
        id: "tech-12",
        question: "How do you handle performance optimization?",
        category: "technical",
        timeLimit: 120,
        hints: ["Show methodology", "Mention tools", "Highlight results"],
      },
      {
        id: "tech-13",
        question: "Tell me about your experience with databases.",
        category: "technical",
        timeLimit: 120,
        hints: ["Mention types", "Show understanding", "Highlight experience"],
      },
      {
        id: "tech-14",
        question: "How do you approach security in your applications?",
        category: "technical",
        timeLimit: 120,
        hints: [
          "Show awareness",
          "Mention practices",
          "Highlight considerations",
        ],
      },
      {
        id: "tech-15",
        question:
          "Describe your experience with agile development methodologies.",
        category: "technical",
        timeLimit: 120,
        hints: [
          "Show understanding",
          "Mention experience",
          "Highlight benefits",
        ],
      },
    ],
    quick: [
      {
        id: "quick-1",
        question: "What's your biggest professional achievement?",
        category: "quick",
        timeLimit: 60,
        hints: ["Be specific", "Show impact", "Keep it concise"],
      },
      {
        id: "quick-2",
        question: "Why are you looking for a new role?",
        category: "quick",
        timeLimit: 60,
        hints: ["Stay positive", "Be honest", "Focus on growth"],
      },
      {
        id: "quick-3",
        question: "What's your preferred work environment?",
        category: "quick",
        timeLimit: 45,
        hints: ["Be honest", "Show flexibility", "Connect to role"],
      },
      {
        id: "quick-4",
        question: "How do you handle criticism?",
        category: "quick",
        timeLimit: 45,
        hints: ["Show openness", "Mention growth", "Stay positive"],
      },
      {
        id: "quick-5",
        question: "What's your biggest weakness?",
        category: "quick",
        timeLimit: 60,
        hints: ["Be honest", "Show improvement", "Connect to growth"],
      },
    ],
    executive: [
      {
        id: "exec-1",
        question: "How do you define leadership?",
        category: "executive",
        timeLimit: 120,
        hints: ["Show understanding", "Give examples", "Connect to experience"],
      },
      {
        id: "exec-2",
        question: "Describe your leadership style.",
        category: "executive",
        timeLimit: 120,
        hints: ["Be authentic", "Give examples", "Show adaptability"],
      },
      {
        id: "exec-3",
        question: "How do you handle difficult team members?",
        category: "executive",
        timeLimit: 150,
        hints: ["Show empathy", "Focus on solutions", "Highlight leadership"],
      },
      {
        id: "exec-4",
        question: "Tell me about a time you had to make an unpopular decision.",
        category: "executive",
        timeLimit: 150,
        hints: ["Show reasoning", "Explain communication", "Highlight outcome"],
      },
      {
        id: "exec-5",
        question: "How do you build and maintain team morale?",
        category: "executive",
        timeLimit: 120,
        hints: ["Show understanding", "Give examples", "Highlight results"],
      },
      {
        id: "exec-6",
        question: "Describe your strategic planning process.",
        category: "executive",
        timeLimit: 150,
        hints: ["Show methodology", "Mention tools", "Highlight outcomes"],
      },
      {
        id: "exec-7",
        question: "How do you handle competing priorities?",
        category: "executive",
        timeLimit: 120,
        hints: [
          "Show methodology",
          "Mention tools",
          "Highlight decision-making",
        ],
      },
      {
        id: "exec-8",
        question:
          "Tell me about a time you had to manage change in your organization.",
        category: "executive",
        timeLimit: 180,
        hints: ["Show leadership", "Explain approach", "Highlight results"],
      },
      {
        id: "exec-9",
        question: "How do you measure success in your role?",
        category: "executive",
        timeLimit: 120,
        hints: ["Show metrics", "Mention KPIs", "Highlight impact"],
      },
      {
        id: "exec-10",
        question: "What's your vision for this role?",
        category: "executive",
        timeLimit: 120,
        hints: [
          "Show understanding",
          "Be ambitious",
          "Connect to company goals",
        ],
      },
    ],
  };

  const startInterview = (templateId: string) => {
    // Handle JAM session separately
    if (templateId === "jam") {
      setShowJAMSession(true);
      return;
    }

    const template = interviewTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Get the appropriate question set for this template
    const questionSet = questionSets[templateId as keyof typeof questionSets];
    if (!questionSet) {
      console.error(`No question set found for template: ${templateId}`);
      return;
    }

    const session: InterviewSession = {
      id: Date.now().toString(),
      type:
        templateId === "technical"
          ? "technical"
          : templateId === "behavioral"
          ? "behavioral"
          : "mixed",
      difficulty: template.difficulty,
      duration: template.duration,
      questions: questionSet.slice(0, template.questionCount),
      currentQuestionIndex: 0,
      startTime: new Date(),
    };

    setActiveSession(session);
    setTimeRemaining(session.questions[0].timeLimit);
    setCurrentAnswer("");
    setIsInterviewStarted(false); // Start in preparation mode

    // Auto-start camera if enabled and not already active
    if (showCameraPreview && !isCameraActive) {
      console.log("Auto-starting camera for interview...");
      startCamera();
    }
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
        (q: any, index: number) => ({
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

      console.log("Starting interview with questions:", formattedQuestions);
      await vapi.start({
        name: "Interviewer",
        firstMessage: `Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience. This is a ${
          activeSession?.difficulty || "medium"
        } level interview for a ${
          activeSession?.type || "general"
        } position. Let's begin!`,
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
              content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

${interviewContext}

Interview Guidelines:
Follow the structured question flow:
${formattedQuestions}

Engage naturally & react appropriately:
- Listen actively to responses and acknowledge them before moving forward
- Ask brief follow-up questions if a response is vague or requires more detail
- Keep the conversation flowing smoothly while maintaining control
- Adapt the difficulty and depth based on the candidate's responses

Be professional, yet warm and welcoming:
- Use official yet friendly language
- Keep responses concise and to the point (like in a real voice interview)
- Avoid robotic phrasing—sound natural and conversational
- Show genuine interest in the candidate's responses

Answer the candidate's questions professionally:
- If asked about the role, company, or expectations, provide a clear and relevant answer
- If unsure, redirect the candidate to HR for more details
- Be helpful and informative while maintaining professional boundaries

Conclude the interview properly:
- Thank the candidate for their time
- Inform them that the company will reach out soon with feedback
- End the conversation on a polite and positive note

Important:
- Keep all your responses short and simple
- Use official language, but be kind and welcoming
- This is a voice conversation, so keep responses concise
- Don't ramble for too long
- Focus on the specific questions provided and adapt based on the candidate's responses`,
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

  const saveInterviewPerformanceData = async (session?: InterviewSession) => {
    const sessionToUse = session || activeSession;

    console.log("🔍 saveInterviewPerformanceData called", {
      hasActiveSession: !!activeSession,
      hasSessionParam: !!session,
      hasSessionToUse: !!sessionToUse,
      messagesLength: messages.length,
      sessionToUse,
      messages: messages.slice(0, 3), // Show first 3 messages for debugging
    });

    if (!sessionToUse) {
      console.log("❌ Early return: No session available", {
        hasSession: !!sessionToUse,
        messagesLength: messages.length,
      });
      return;
    }

    // Allow saving even with empty messages for real score updates
    if (messages.length === 0) {
      console.warn(
        "⚠️ No messages available - this might be a real score update",
        {
          hasSession: !!sessionToUse,
          messagesLength: messages.length,
          hasRealAIScores: !!realAIScores,
        }
      );
    }

    try {
      // Calculate interview duration
      const duration = (Date.now() - sessionToUse.startTime.getTime()) / 1000; // in seconds

      // Convert session questions to InterviewQuestionData format
      const sessionQuestions = (sessionToUse.questions || []).map(
        (q, index) => ({
          id: q.id || `q_${index}`,
          question: q.question || "Question not available",
          category: q.category || "general",
          timeLimit: q.timeLimit || 120,
          hints: q.hints || [],
          askedAt: new Date(
            sessionToUse.startTime.getTime() + index * 180000
          ).toISOString(), // Estimate timing
          answeredAt:
            index <= sessionToUse.currentQuestionIndex
              ? new Date(
                  sessionToUse.startTime.getTime() + (index + 1) * 180000
                ).toISOString()
              : new Date(
                  sessionToUse.startTime.getTime() + (index + 1) * 180000
                ).toISOString(), // Always provide a timestamp
        })
      );

      // Generate performance data based on available information
      const performanceData: InterviewPerformanceData = {
        id: `interview_${Date.now()}`,
        timestamp: new Date().toISOString(),
        role:
          sessionToUse.type === "custom"
            ? customRole || "Custom Role"
            : sessionToUse.type,
        difficulty: sessionToUse.difficulty || "medium",
        duration: duration || 0,

        // Use real AI feedback scores if available, otherwise use minimal fallback
        overallScore: getActualPerformanceScore("overall"),
        technicalScore: getActualPerformanceScore("technical"),
        communicationScore: getActualPerformanceScore("communication"),
        behavioralScore: getActualPerformanceScore("behavioral"),

        // Question performance
        questionsAnswered: sessionToUse.currentQuestionIndex + 1,
        questionsCorrect: Math.floor(
          (sessionToUse.currentQuestionIndex + 1) * 0.7
        ), // Estimate 70% correct
        averageResponseTime: duration / (sessionToUse.currentQuestionIndex + 1),

        // Detailed metrics (using real analysis or transparent fallback)
        detailedMetrics: {
          confidence: getActualPerformanceScore("overall"), // Use same fallback for consistency
          clarity: getActualPerformanceScore("communication"),
          professionalism: getActualPerformanceScore("behavioral"),
          engagement: getActualPerformanceScore("behavioral"),
          adaptability: getActualPerformanceScore("overall"),
        },

        // Mock speech and body language analysis (since we don't have real analysis)
        speechAnalysis: generateMockSpeechAnalysis(),
        bodyLanguageAnalysis: generateMockBodyLanguageAnalysis(),

        // Generate insights based on conversation
        strengths: generateStrengths(),
        weaknesses: generateWeaknesses(),
        recommendations: generateRecommendations(),

        // NEW: Store actual interview session data
        interviewSession: {
          questions: sessionQuestions || [],
          messages: (messages || []).map((msg) => ({
            role: msg.role || "user",
            content: msg.content || "",
            timestamp: msg.timestamp || new Date().toISOString(),
          })),
          sessionType: sessionToUse.type || "general",
          interviewType:
            sessionToUse.type === "custom"
              ? customRole || "Custom Role"
              : sessionToUse.type || "general",
        },
      };

      // Validate data before saving to prevent undefined values
      const validateData = (obj: any, path = ""): void => {
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
            validateData(value, currentPath);
          }
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (item !== null && typeof item === "object") {
                validateData(item, `${currentPath}[${index}]`);
              }
            });
          }
        }
      };

      try {
        validateData(performanceData);
        console.log("✅ Data validation passed - no undefined values found");
      } catch (error) {
        console.error("❌ Data validation failed:", error);
        throw error;
      }

      console.log("💾 Saving performance data:", performanceData);

      // Save to all analytics systems
      performanceAnalytics.current.savePerformanceData(performanceData);
      analyticsStorage.savePerformanceData(performanceData);

      // Save to unified cloud storage for cross-device sync
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
  };

  // State to store real AI feedback scores
  const [realAIScores, setRealAIScores] = useState<{
    overall: number;
    technical: number;
    communication: number;
    behavioral: number;
  } | null>(null);

  // Function to get actual performance scores from AI feedback or provide transparent fallback
  const getActualPerformanceScore = (
    scoreType: "overall" | "technical" | "communication" | "behavioral"
  ): number => {
    // Use real AI scores if available
    if (realAIScores) {
      console.log(
        `✅ Using real AI score for ${scoreType}:`,
        realAIScores[scoreType]
      );
      return realAIScores[scoreType];
    }

    // Fallback: return minimal scores to indicate no real analysis was performed
    console.warn(
      `⚠️ Using fallback score for ${scoreType} - real AI feedback analysis not available`
    );
    return 10; // Minimal score to indicate no real analysis
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

    // Trigger analytics save with real scores (this will update the existing entry)
    setTimeout(() => {
      console.log("🔄 Updating analytics with real AI scores...");
      // Use sessionToSave if activeSession is null (interview ended)
      const sessionForUpdate = activeSession || sessionToSave;
      if (sessionForUpdate) {
        console.log(
          "✅ Using session for AI score update:",
          sessionForUpdate.id
        );
        saveInterviewPerformanceData(sessionForUpdate);

        // Clear saved session after AI analysis is complete
        if (sessionForUpdate === sessionToSave) {
          setTimeout(() => {
            console.log("🧹 Clearing saved session after AI analysis");
            setSessionToSave(null);
          }, 2000); // Clear after a delay to ensure save is complete
        }
      } else {
        console.warn("⚠️ No session available for real score update");
      }
    }, 1000); // Small delay to ensure scores are set
  };

  // Removed old scoring functions that generated inflated dummy scores
  // All scoring now uses getActualPerformanceScore() for transparency

  // All old scoring functions removed - now using getActualPerformanceScore() for transparency

  // Generate speech analysis from real data or provide minimal fallback
  const generateMockSpeechAnalysis = () => {
    console.warn(
      "⚠️ Using fallback speech analysis - real speech analysis not available"
    );

    return {
      wordsPerMinute: 0, // No real data available
      fillerWordCount: 0,
      pauseCount: 0,
      averagePauseLength: 0,
      volumeVariation: 0,
      clarityScore: 0, // Indicate no real analysis
      confidenceScore: 0,
      emotionalTone: "unknown", // Clear indication of no real data
      keyPhrases: [], // Empty array for no real data
      isFallbackData: true, // Mark as fallback data, not simulated
      analysisAvailable: false, // Explicitly indicate no real analysis performed
    };
  };

  const generateMockBodyLanguageAnalysis = () => {
    console.warn(
      "⚠️ Using fallback body language analysis - real video analysis not available"
    );

    return {
      eyeContactPercentage: 0, // No real data available
      postureScore: 0,
      gestureFrequency: 0,
      facialExpressionScore: 0,
      overallBodyLanguageScore: 0,
      confidenceIndicators: [], // Empty for no real data
      nervousBehaviors: [],
      engagementLevel: 0,
      isFallbackData: true, // Mark as fallback data, not simulated
      analysisAvailable: false, // Explicitly indicate no real analysis performed
    };
  };

  const generateStrengths = (): string[] => {
    // Return generic strengths since we don't have real analysis data
    // In a real implementation, this would be based on actual performance metrics
    console.warn(
      "⚠️ Using generic strengths - real performance analysis not available"
    );

    return [
      "Completed interview session",
      "Engaged with interview questions",
      "Maintained professional communication",
    ];
  };

  const generateWeaknesses = (): string[] => {
    // Return generic improvement areas since we don't have real analysis data
    console.warn(
      "⚠️ Using generic weaknesses - real performance analysis not available"
    );

    return [
      "Enable speech analysis for detailed feedback",
      "Enable video analysis for body language insights",
    ];
  };

  const generateRecommendations = (): string[] => {
    // Return actionable recommendations
    console.warn(
      "⚠️ Using generic recommendations - real performance analysis not available"
    );

    return [
      "Complete more interviews to build performance history",
      "Enable microphone access for speech analysis",
      "Enable camera access for body language analysis",
      "Practice behavioral questions using the STAR method",
    ];
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

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

      // Preserve session for AI analysis
      setSessionToSave(activeSession);
      setActiveSession(null);
      setIsRecording(false);
      setIsPaused(false);
      setCurrentAnswer("");
      setTimeRemaining(0);
      handleDisconnect();
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

    // Preserve session for AI analysis
    setSessionToSave(session);
    setActiveSession(null);
    setIsInterviewStarted(false);
    setIsRecording(false);
    setIsPaused(false);
    setCurrentAnswer("");
    setTimeRemaining(0);
    handleDisconnect();
    stopCamera();
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isCameraLoading
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      enableFaceDetection
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
                                ? `${faceDetection.faceCount} face${
                                    faceDetection.faceCount !== 1 ? "s" : ""
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

                    <div className="space-y-4">
                      <button
                        onClick={beginInterview}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold"
                      >
                        Start Interview
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isCameraLoading
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
                Question {activeSession.currentQuestionIndex + 1} of{" "}
                {activeSession.questions.length}
              </span>
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
              {/* Interview Status Indicator */}
              {callStatus === CallStatus.ACTIVE && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold text-lg">
                      Interview Session Active
                    </span>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Interview Video Area - Same video element will be shown here */}
              <div className="flex-1 bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden max-w-7xl mx-auto w-full aspect-video lg:aspect-[16/10] xl:aspect-[4/3] min-h-[500px] lg:min-h-[600px] xl:min-h-[700px]">
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
                    {/* Camera Status Overlay */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Camera className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">
                            Camera Active
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
                                ? `${faceDetection.faceCount} face${
                                    faceDetection.faceCount !== 1 ? "s" : ""
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

                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
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
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          isCameraLoading
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
                ) : (
                  <>
                    <button
                      onClick={() => handleNextQuestion()}
                      className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <SkipForward className="w-5 h-5" />
                      <span>Next Question</span>
                    </button>
                  </>
                )}
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
                <div className="flex items-center space-x-2 mb-3">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Interview Question
                  </h3>
                </div>
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
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
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
              className={`btn-touch flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0 ${
                showCameraPreview
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
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  enableFaceDetection
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-2xl shadow-inner">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                  activeTab === "templates"
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg scale-105 border-2 border-blue-200 dark:border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Interview Templates</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                  activeTab === "custom"
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg scale-105 border-2 border-purple-200 dark:border-purple-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Custom Interview</span>
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
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          template.id === "general"
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
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        template.difficulty === "easy"
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
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    customRole.trim() && !isGeneratingQuestions
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
          messages={messages}
          interviewType={
            (activeSession as InterviewSession | null)?.type || "general"
          }
          difficulty={
            (activeSession as InterviewSession | null)?.difficulty || "medium"
          }
          role={
            (activeSession as InterviewSession | null)?.type === "custom"
              ? customRole
              : (activeSession as InterviewSession | null)?.type || "general"
          }
          onClose={() => setShowFeedback(false)}
          onScoresAnalyzed={handleAIScoresAnalyzed}
        />
      )}

      {/* Face detection debug panel removed for production */}
    </div>
  );
};

export default MockInterview;
