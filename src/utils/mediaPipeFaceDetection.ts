/**
 * MediaPipe Face Detection Integration
 * Advanced face detection using MediaPipe FaceMesh for more accurate results
 */

import { DetectedFace } from "./faceDetection";

// MediaPipe types (simplified)
interface MediaPipeResults {
  multiFaceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
  multiFaceDetections?: Array<{
    boundingBox: {
      xCenter: number;
      yCenter: number;
      width: number;
      height: number;
    };
    score: number;
  }>;
}

interface MediaPipeFaceMesh {
  setOptions(options: any): void;
  onResults(callback: (results: MediaPipeResults) => void): void;
  send(data: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
  close(): void;
}

declare global {
  interface Window {
    FaceMesh?: {
      new (options: any): MediaPipeFaceMesh;
    };
  }
}

export class MediaPipeFaceDetectionService {
  private faceMesh: MediaPipeFaceMesh | null = null;
  private isInitialized: boolean = false;
  private lastResults: MediaPipeResults | null = null;
  private isProcessing: boolean = false;

  /**
   * Initialize MediaPipe Face Mesh
   */
  async initialize(): Promise<boolean> {
    try {
      console.log("🔄 Initializing MediaPipe Face Detection...");

      // Check if MediaPipe is available
      if (!window.FaceMesh) {
        console.log("⚠️ MediaPipe not available, loading from CDN...");
        await this.loadMediaPipe();
      }

      if (window.FaceMesh) {
        this.faceMesh = new window.FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        this.faceMesh.setOptions({
          maxNumFaces: 5,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.faceMesh.onResults((results: MediaPipeResults) => {
          this.lastResults = results;
          this.isProcessing = false;

          // Debug logging
          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            console.log(
              `🎯 MediaPipe: Detected ${results.multiFaceLandmarks.length} face(s)`
            );
          }
        });

        this.isInitialized = true;
        console.log("✅ MediaPipe Face Detection initialized");
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Failed to initialize MediaPipe:", error);
      return false;
    }
  }

  /**
   * Load MediaPipe from CDN
   */
  private async loadMediaPipe(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MediaPipe"));
      document.head.appendChild(script);
    });
  }

  /**
   * Process video frame with MediaPipe
   */
  async processFrame(video: HTMLVideoElement): Promise<DetectedFace[]> {
    if (!this.isInitialized || !this.faceMesh || this.isProcessing) {
      return [];
    }

    try {
      this.isProcessing = true;
      await this.faceMesh.send({ image: video });

      // Wait for results (with timeout)
      const results = await this.waitForResults(1000);

      if (results) {
        return this.convertToDetectedFaces(
          results,
          video.videoWidth,
          video.videoHeight
        );
      }

      return [];
    } catch (error) {
      console.error("MediaPipe processing error:", error);
      this.isProcessing = false;
      return [];
    }
  }

  /**
   * Wait for MediaPipe results with timeout
   */
  private async waitForResults(
    timeout: number
  ): Promise<MediaPipeResults | null> {
    const startTime = Date.now();

    while (this.isProcessing && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    if (this.lastResults) {
      const results = this.lastResults;
      this.lastResults = null;
      return results;
    }

    return null;
  }

  /**
   * Convert MediaPipe results to DetectedFace format
   */
  private convertToDetectedFaces(
    results: MediaPipeResults,
    width: number,
    height: number
  ): DetectedFace[] {
    const faces: DetectedFace[] = [];

    console.log("🔍 MediaPipe Results:", {
      multiFaceLandmarks: results.multiFaceLandmarks?.length || 0,
      multiFaceDetections: results.multiFaceDetections?.length || 0,
      width,
      height,
    });

    // MediaPipe FaceMesh only provides landmarks, not detections
    // We need to calculate bounding box from landmarks
    if (results.multiFaceLandmarks) {
      results.multiFaceLandmarks.forEach((landmarks, index) => {
        console.log(`🔍 Processing face ${index}:`, {
          landmarksCount: landmarks.length,
        });

        if (landmarks.length > 0) {
          // Calculate bounding box from landmarks
          const xs = landmarks.map((l) => l.x * width);
          const ys = landmarks.map((l) => l.y * height);

          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          // Add some padding
          const padding = 20;
          const bbox = {
            x: Math.max(0, minX - padding),
            y: Math.max(0, minY - padding),
            width: Math.min(width, maxX - minX + padding * 2),
            height: Math.min(height, maxY - minY + padding * 2),
          };

          // Calculate head pose from landmarks
          const headPose = this.calculateHeadPose(landmarks, width, height);

          const face = {
            id: `mediapipe_face_${index}`,
            name: `User ${index + 1}`,
            confidence: 0.9, // High confidence since MediaPipe detected landmarks
            boundingBox: bbox,
            eyeContact: false, // Will be calculated later
            headPose,
          };

          console.log(`🔍 MediaPipe Face ${index}:`, {
            boundingBox: bbox,
            headPose,
            confidence: 0.9,
          });

          faces.push(face);
        }
      });
    }

    console.log(`🔍 MediaPipe: Returning ${faces.length} faces`);
    return faces;
  }

  /**
   * Calculate head pose from facial landmarks
   */
  private calculateHeadPose(
    landmarks: Array<{ x: number; y: number; z: number }>,
    width: number,
    height: number
  ) {
    // Key landmark indices for head pose estimation
    const noseTip = landmarks[1]; // Nose tip
    const leftEye = landmarks[33]; // Left eye corner
    const rightEye = landmarks[263]; // Right eye corner
    const chin = landmarks[175]; // Chin
    const forehead = landmarks[10]; // Forehead

    // Convert normalized coordinates to pixel coordinates
    const noseTipPx = { x: noseTip.x * width, y: noseTip.y * height };
    const leftEyePx = { x: leftEye.x * width, y: leftEye.y * height };
    const rightEyePx = { x: rightEye.x * width, y: rightEye.y * height };
    const chinPx = { x: chin.x * width, y: chin.y * height };
    const foreheadPx = { x: forehead.x * width, y: forehead.y * height };

    // Calculate yaw (left-right rotation) - simplified approach
    const eyeCenter = {
      x: (leftEyePx.x + rightEyePx.x) / 2,
      y: (leftEyePx.y + rightEyePx.y) / 2,
    };

    // Simplified yaw calculation based on nose position relative to eye center
    const faceCenter = { x: width / 2, y: height / 2 };
    const yaw = ((noseTipPx.x - eyeCenter.x) / width) * 60; // Scale to degrees

    // Calculate pitch (up-down rotation) - simplified approach
    const faceHeight = Math.abs(foreheadPx.y - chinPx.y);
    const noseVerticalOffset = (noseTipPx.y - eyeCenter.y) / faceHeight;
    const pitch = noseVerticalOffset * 30; // Scale to degrees

    // Calculate roll (tilt rotation)
    const eyeAngle = Math.atan2(
      rightEyePx.y - leftEyePx.y,
      rightEyePx.x - leftEyePx.x
    );
    const roll = eyeAngle * (180 / Math.PI);

    const clampedYaw = Math.max(-45, Math.min(45, yaw));
    const clampedPitch = Math.max(-30, Math.min(30, pitch));
    const clampedRoll = Math.max(-30, Math.min(30, roll));

    console.log(`🎯 MediaPipe Head Pose:`, {
      raw: {
        yaw: yaw.toFixed(1),
        pitch: pitch.toFixed(1),
        roll: roll.toFixed(1),
      },
      clamped: {
        yaw: clampedYaw.toFixed(1),
        pitch: clampedPitch.toFixed(1),
        roll: clampedRoll.toFixed(1),
      },
    });

    return {
      yaw: clampedYaw,
      pitch: clampedPitch,
      roll: clampedRoll,
    };
  }

  /**
   * Check if MediaPipe is available
   */
  static isAvailable(): boolean {
    return typeof window !== "undefined" && "FaceMesh" in window;
  }

  /**
   * Get MediaPipe landmarks for advanced analysis
   */
  getLastLandmarks(): Array<Array<{ x: number; y: number; z: number }>> | null {
    return this.lastResults?.multiFaceLandmarks || null;
  }

  /**
   * Cleanup MediaPipe resources
   */
  cleanup(): void {
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
    this.isInitialized = false;
    this.lastResults = null;
  }
}

// Export singleton instance
export const mediaPipeFaceDetection = new MediaPipeFaceDetectionService();
