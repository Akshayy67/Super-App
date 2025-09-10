import { useState, useEffect, useRef, useCallback } from "react";
import {
  faceDetectionService,
  FaceDetectionResult,
  DetectedFace,
} from "../utils/faceDetection";

interface UseFaceDetectionOptions {
  enabled: boolean;
  videoElement: HTMLVideoElement | null;
  onFaceDetected?: (faces: DetectedFace[]) => void;
  onEyeContactChange?: (hasEyeContact: boolean) => void;
  eyeContactThreshold?: {
    yaw: number;
    pitch: number;
  };
}

interface FaceDetectionStats {
  totalFramesProcessed: number;
  eyeContactFrames: number;
  eyeContactPercentage: number;
  averageConfidence: number;
  currentFaces: DetectedFace[];
  isEyeContactActive: boolean;
  recentEyeContactHistory: boolean[]; // Rolling window for smoother percentage
}

export const useFaceDetection = (options: UseFaceDetectionOptions) => {
  const {
    enabled,
    videoElement,
    onFaceDetected,
    onEyeContactChange,
    eyeContactThreshold = { yaw: 15, pitch: 15 },
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<FaceDetectionResult>({
    faces: [],
    eyeContactDetected: false,
    confidence: 0,
  });
  const [stats, setStats] = useState<FaceDetectionStats>({
    totalFramesProcessed: 0,
    eyeContactFrames: 0,
    eyeContactPercentage: 0,
    averageConfidence: 0,
    currentFaces: [],
    isEyeContactActive: false,
    recentEyeContactHistory: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Refs
  const animationFrameRef = useRef<number>();
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const statsRef = useRef(stats);
  const lastEyeContactState = useRef(false);

  // Update stats ref when stats change
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Initialize face detection service
  useEffect(() => {
    if (enabled && !isInitialized) {
      const initializeService = async () => {
        try {
          setError(null);
          const success = await faceDetectionService.initialize();
          if (success) {
            // Update settings
            faceDetectionService.updateSettings({
              yawThreshold: eyeContactThreshold.yaw,
              pitchThreshold: eyeContactThreshold.pitch,
            });
            setIsInitialized(true);
          } else {
            setError("Failed to initialize face detection service");
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Unknown error occurred"
          );
        }
      };

      initializeService();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, eyeContactThreshold]);

  // Process video frames
  const processFrame = useCallback(async () => {
    if (!enabled || !isInitialized || !videoElement || isProcessing) {
      return;
    }

    if (videoElement.readyState < 2) {
      // Video not ready, try again next frame
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await faceDetectionService.processFrame(videoElement);

      setCurrentResult(result);

      // Update statistics with rolling window for smoother percentage
      setStats((prevStats) => {
        // Update rolling window (keep last 100 frames for responsive but stable percentage)
        const maxHistoryLength = 100;
        const currentHistory = prevStats.recentEyeContactHistory || [];
        const newHistory = [...currentHistory, result.eyeContactDetected];
        if (newHistory.length > maxHistoryLength) {
          newHistory.shift(); // Remove oldest entry
        }

        // Calculate percentage from rolling window
        const recentEyeContactCount = newHistory.filter(Boolean).length;
        const rollingPercentage =
          newHistory.length > 0
            ? (recentEyeContactCount / newHistory.length) * 100
            : 0;

        const newStats = {
          ...prevStats,
          totalFramesProcessed: prevStats.totalFramesProcessed + 1,
          eyeContactFrames:
            prevStats.eyeContactFrames + (result.eyeContactDetected ? 1 : 0),
          currentFaces: result.faces,
          isEyeContactActive: result.eyeContactDetected,
          recentEyeContactHistory: newHistory,
          eyeContactPercentage: rollingPercentage, // Use rolling window percentage
        };

        // Calculate average confidence
        if (result.faces.length > 0) {
          const totalConfidence = result.faces.reduce(
            (sum, face) => sum + face.confidence,
            0
          );
          newStats.averageConfidence = totalConfidence / result.faces.length;
        }

        return newStats;
      });

      // Trigger callbacks
      if (onFaceDetected && result.faces.length > 0) {
        onFaceDetected(result.faces);
      }

      if (
        onEyeContactChange &&
        result.eyeContactDetected !== lastEyeContactState.current
      ) {
        lastEyeContactState.current = result.eyeContactDetected;
        onEyeContactChange(result.eyeContactDetected);
      }

      // Draw overlay if canvas is available
      if (overlayCanvasRef.current && result.faces.length > 0) {
        faceDetectionService.drawOverlay(
          overlayCanvasRef.current,
          result.faces,
          videoElement.videoWidth || 640,
          videoElement.videoHeight || 480
        );
      }
    } catch (err) {
      console.error("Error processing frame:", err);
      setError(err instanceof Error ? err.message : "Frame processing error");
    } finally {
      setIsProcessing(false);
    }

    // Schedule next frame
    if (enabled && isInitialized) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [
    enabled,
    isInitialized,
    videoElement,
    isProcessing,
    onFaceDetected,
    onEyeContactChange,
  ]);

  // Start/stop processing based on enabled state
  useEffect(() => {
    if (enabled && isInitialized && videoElement) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isInitialized, videoElement, processFrame]);

  // Create overlay canvas
  const createOverlayCanvas = useCallback(
    (width: number = 640, height: number = 480) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "10";
      overlayCanvasRef.current = canvas;
      return canvas;
    },
    []
  );

  // Reset statistics
  const resetStats = useCallback(() => {
    setStats({
      totalFramesProcessed: 0,
      eyeContactFrames: 0,
      eyeContactPercentage: 0,
      averageConfidence: 0,
      currentFaces: [],
      isEyeContactActive: false,
      recentEyeContactHistory: [],
    });
  }, []);

  // Update thresholds
  const updateThresholds = useCallback(
    (newThresholds: { yaw?: number; pitch?: number }) => {
      faceDetectionService.updateSettings({
        yawThreshold: newThresholds.yaw,
        pitchThreshold: newThresholds.pitch,
      });
    },
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      faceDetectionService.cleanup();
    };
  }, []);

  return {
    // State
    isInitialized,
    isProcessing,
    currentResult,
    stats,
    error,

    // Methods
    createOverlayCanvas,
    resetStats,
    updateThresholds,

    // Computed values
    hasActiveFaces: currentResult.faces.length > 0,
    eyeContactDetected: currentResult.eyeContactDetected,
    faceCount: currentResult.faces.length,
    confidence: currentResult.confidence,
  };
};
