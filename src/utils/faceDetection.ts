/**
 * Face Detection and Eye Contact Analysis Utility
 * Integrates with existing video stream for real-time face recognition and eye contact detection
 */

// Type definitions for Face Detection API
declare global {
  interface Window {
    FaceDetector?: {
      new(options?: {
        maxDetectedFaces?: number;
        fastMode?: boolean;
      }): FaceDetector;
    };
  }
}

interface FaceDetector {
  detect(image: ImageBitmapSource): Promise<DetectedFaceAPI[]>;
}

interface DetectedFaceAPI {
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: Array<{ x: number; y: number }>;
}

interface FaceDetectionResult {
  faces: DetectedFace[];
  eyeContactDetected: boolean;
  confidence: number;
  eyeContactConfidence: number;
}

interface DetectedFace {
  id: string;
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  eyeContact: boolean;
  headPose: {
    yaw: number;
    pitch: number;
    roll: number;
  };
}

interface EyeContactSettings {
  yawThreshold: number;
  pitchThreshold: number;
  confidenceThreshold: number;
}

class FaceDetectionService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isProcessing: boolean = false;
  private lastProcessTime: number = 0;
  private processInterval: number = 150; // Process every 150ms for better performance

  // Eye contact detection settings - Calibrated for accuracy
  private eyeContactSettings: EyeContactSettings = {
    yawThreshold: 20, // degrees - moderate tolerance for left-right
    pitchThreshold: 18, // degrees - moderate tolerance for up-down
    confidenceThreshold: 0.5, // Minimum weighted score to count as eye contact
  };

  // Face detection using browser APIs
  private faceDetector: FaceDetector | null = null;
  private isInitialized: boolean = false;
  private supportsNativeFaceDetection: boolean = false;
  private useMediaPipe: boolean = false;
  private mediaPipeService: any = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
  }

  /**
   * Initialize the face detection service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log("🔄 Initializing face detection service...");

      // Try MediaPipe first (most accurate)
      try {
        const { mediaPipeFaceDetection } = await import(
          "./mediaPipeFaceDetection"
        );
        const mediaSuccess = await mediaPipeFaceDetection.initialize();
        if (mediaSuccess) {
          this.mediaPipeService = mediaPipeFaceDetection;
          this.useMediaPipe = true;
          console.log("✅ Using MediaPipe Face Detection (most accurate)");
          this.isInitialized = true;
          return true;
        }
      } catch (e) {
        console.log("⚠️ MediaPipe not available:", e);
        console.log("🔄 Trying native API...");
      }

      // Try native Face Detection API
      if ("FaceDetector" in window) {
        try {
          this.faceDetector = new (window as any).FaceDetector({
            maxDetectedFaces: 5,
            fastMode: true,
          });
          this.supportsNativeFaceDetection = true;
          console.log("✅ Using native Face Detection API");
          this.isInitialized = true;
          return true;
        } catch (e) {
          console.log(
            "⚠️ Native Face Detection API not available, using computer vision fallback"
          );
        }
      }

      // Fallback to computer vision approach
      console.log("🔄 Using computer vision face detection (basic)...");
      this.isInitialized = true;
      console.log("✅ Face detection service initialized with basic CV");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize face detection:", error);
      return false;
    }
  }

  /**
   * Process video frame for face detection and eye contact analysis
   */
  async processFrame(video: HTMLVideoElement): Promise<FaceDetectionResult> {
    if (!this.isInitialized || this.isProcessing) {
      return { faces: [], eyeContactDetected: false, confidence: 0, eyeContactConfidence: 0 };
    }

    const now = Date.now();
    if (now - this.lastProcessTime < this.processInterval) {
      return { faces: [], eyeContactDetected: false, confidence: 0, eyeContactConfidence: 0 };
    }

    this.isProcessing = true;
    this.lastProcessTime = now;

    try {
      // Set canvas size to match video
      this.canvas.width = video.videoWidth || 640;
      this.canvas.height = video.videoHeight || 480;

      // Draw video frame to canvas
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

      // Get image data for processing
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // Perform face detection with video element for MediaPipe
      const faces = await this.detectFaces(imageData, video);

      // Analyze eye contact for each face
      const eyeContactResults: { isEyeContact: boolean; confidenceScore: number }[] = [];
      const processedFaces = faces.map((face) => {
        const ecResult = this.analyzeEyeContact(
          face.headPose,
          face.boundingBox,
          this.canvas.width,
          this.canvas.height
        );
        eyeContactResults.push(ecResult);
        return {
          ...face,
          eyeContact: ecResult.isEyeContact,
        };
      });

      // Determine overall eye contact status
      const eyeContactDetected = processedFaces.some((face) => face.eyeContact);
      const confidence =
        processedFaces.length > 0
          ? Math.max(...processedFaces.map((f) => f.confidence))
          : 0;
      const eyeContactConfidence =
        eyeContactResults.length > 0
          ? Math.max(...eyeContactResults.map((r) => r.confidenceScore))
          : 0;

      return {
        faces: processedFaces,
        eyeContactDetected,
        confidence,
        eyeContactConfidence,
      };
    } catch (error) {
      console.error("Error processing frame:", error);
      return { faces: [], eyeContactDetected: false, confidence: 0, eyeContactConfidence: 0 };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Real face detection using MediaPipe, browser APIs, and computer vision
   */
  private async detectFaces(
    imageData: ImageData,
    video?: HTMLVideoElement
  ): Promise<DetectedFace[]> {
    const faces: DetectedFace[] = [];

    try {
      // Try MediaPipe first (most accurate)
      if (this.useMediaPipe && this.mediaPipeService && video) {
        const detectedFaces = await this.mediaPipeService.processFrame(video);
        if (detectedFaces.length > 0) {
          console.log(`🎯 MediaPipe detected ${detectedFaces.length} face(s)`);
        }
        faces.push(...detectedFaces);
      }
      // Try native Face Detection API
      else if (this.supportsNativeFaceDetection && this.faceDetector) {
        const detectedFaces = await this.faceDetector.detect(this.canvas);

        detectedFaces.forEach((face: any, index: number) => {
          const bbox = face.boundingBox;
          faces.push({
            id: `face_${index}`,
            name: `User ${index + 1}`,
            confidence: 0.9, // Native API doesn't provide confidence
            boundingBox: {
              x: bbox.x,
              y: bbox.y,
              width: bbox.width,
              height: bbox.height,
            },
            eyeContact: false, // Will be calculated later
            headPose: this.estimateHeadPose(
              bbox,
              imageData.width,
              imageData.height
            ),
          });
        });
      }
      // Fallback: Use computer vision-based face detection
      else {
        const detectedFaces = await this.detectFacesCV(imageData);
        faces.push(...detectedFaces);
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }

    return faces;
  }

  /**
   * Computer vision-based face detection fallback
   */
  private async detectFacesCV(imageData: ImageData): Promise<DetectedFace[]> {
    // Simple skin color detection and blob analysis
    const faces: DetectedFace[] = [];
    const { width, height, data } = imageData;

    console.log(`🔍 CV Face Detection: Processing ${width}x${height} image`);

    // Create a binary mask for skin-like colors
    const skinMask = new Uint8Array(width * height);
    let skinPixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simple skin color detection (HSV-based)
      const isSkin = this.isSkinColor(r, g, b);
      const pixelIndex = Math.floor(i / 4);
      skinMask[pixelIndex] = isSkin ? 255 : 0;
      if (isSkin) skinPixelCount++;
    }

    console.log(
      `🔍 CV Face Detection: Found ${skinPixelCount} skin pixels (${(
        (skinPixelCount / (width * height)) *
        100
      ).toFixed(1)}%)`
    );

    // Find connected components (face regions)
    const faceRegions = this.findFaceRegions(skinMask, width, height);
    console.log(
      `🔍 CV Face Detection: Found ${faceRegions.length} potential face regions`
    );

    faceRegions.forEach((region, index) => {
      console.log(
        `🔍 Region ${index}: area=${region.area}, bbox=${JSON.stringify(
          region.boundingBox
        )}`
      );
      if (region.area > 1000) {
        // Minimum face size
        faces.push({
          id: `cv_face_${index}`,
          name: `User ${index + 1}`,
          confidence: Math.min(0.9, region.area / 10000), // Confidence based on size
          boundingBox: region.boundingBox,
          eyeContact: false,
          headPose: this.estimateHeadPose(region.boundingBox, width, height),
        });
        console.log(
          `✅ CV Face Detection: Added face ${index} with confidence ${Math.min(
            0.9,
            region.area / 10000
          ).toFixed(2)}`
        );
      }
    });

    console.log(`🔍 CV Face Detection: Returning ${faces.length} faces`);
    return faces;
  }

  /**
   * Simple skin color detection
   */
  private isSkinColor(r: number, g: number, b: number): boolean {
    // Convert RGB to HSV for better skin detection
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    // Simple skin color ranges
    const skinConditions = [
      r > 95 && g > 40 && b > 20,
      max - min > 15,
      Math.abs(r - g) > 15,
      r > g && r > b,
    ];

    return skinConditions.every((condition) => condition);
  }

  /**
   * Find face regions using connected component analysis
   */
  private findFaceRegions(mask: Uint8Array, width: number, height: number) {
    const visited = new Uint8Array(width * height);
    const regions: Array<{
      boundingBox: { x: number; y: number; width: number; height: number };
      area: number;
    }> = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;

        if (mask[index] === 255 && !visited[index]) {
          const region = this.floodFill(mask, visited, x, y, width, height);
          if (region.area > 500) {
            // Minimum region size
            regions.push(region);
          }
        }
      }
    }

    return regions;
  }

  /**
   * Flood fill algorithm for connected component analysis
   */
  private floodFill(
    mask: Uint8Array,
    visited: Uint8Array,
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    const stack = [{ x: startX, y: startY }];
    let minX = startX,
      maxX = startX,
      minY = startY,
      maxY = startY;
    let area = 0;

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const index = y * width + x;

      if (
        x < 0 ||
        x >= width ||
        y < 0 ||
        y >= height ||
        visited[index] ||
        mask[index] !== 255
      ) {
        continue;
      }

      visited[index] = 1;
      area++;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // Add neighbors
      stack.push(
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      );
    }

    return {
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      area,
    };
  }

  /**
   * Estimate head pose based on face position
   */
  private estimateHeadPose(
    boundingBox: { x: number; y: number; width: number; height: number },
    frameWidth: number,
    frameHeight: number
  ) {
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    // Estimate yaw based on horizontal position
    const yaw = (centerX / frameWidth - 0.5) * 60; // -30 to +30 degrees

    // Estimate pitch based on vertical position
    const pitch = (centerY / frameHeight - 0.4) * 40; // -16 to +24 degrees (eyes typically in upper part)

    // Estimate roll based on face width/height ratio
    const aspectRatio = boundingBox.width / boundingBox.height;
    const roll = (aspectRatio - 0.75) * 20; // Approximate roll based on face shape

    return { yaw, pitch, roll };
  }

  /**
   * Analyze eye contact using weighted confidence scoring.
   * Returns both a boolean and a continuous confidence score (0-1).
   */
  private analyzeEyeContact(
    headPose: {
      yaw: number;
      pitch: number;
      roll: number;
    },
    boundingBox: { x: number; y: number; width: number; height: number },
    frameWidth: number,
    frameHeight: number
  ): { isEyeContact: boolean; confidenceScore: number } {
    const { yaw, pitch } = headPose;
    const { yawThreshold, pitchThreshold, confidenceThreshold } = this.eyeContactSettings;

    // ── Primary: Head pose score (weight 0.60) ──
    // Score falls off smoothly as yaw/pitch exceed thresholds
    const yawScore = Math.max(0, 1 - Math.abs(yaw) / (yawThreshold * 1.5));
    const pitchScore = Math.max(0, 1 - Math.abs(pitch) / (pitchThreshold * 1.5));
    const headPoseScore = yawScore * pitchScore; // 0-1, product penalises if either axis is off

    // ── Secondary: Position-based score (weight 0.30) ──
    const faceCenter = {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2,
    };
    const frameCenterX = frameWidth / 2;
    const frameCenterY = frameHeight / 2;
    const horizontalOffset = Math.abs(faceCenter.x - frameCenterX) / frameWidth;
    const verticalOffset = Math.abs(faceCenter.y - frameCenterY) / frameHeight;
    // Score drops off when face moves away from center; max offset ~0.35
    const positionScore = Math.max(0, 1 - (horizontalOffset / 0.35)) *
      Math.max(0, 1 - (verticalOffset / 0.30));

    // ── Tertiary: Face presence bonus (weight 0.10) ──
    const faceArea = boundingBox.width * boundingBox.height;
    const frameArea = frameWidth * frameHeight;
    const faceAreaRatio = faceArea / frameArea;
    // Best when face is 5-30% of frame (typical webcam)
    const presenceScore =
      faceAreaRatio >= 0.03 && faceAreaRatio <= 0.45
        ? Math.min(1, faceAreaRatio / 0.05) // ramp up from 3-5%
        : 0;

    // ── Weighted combination ──
    const confidenceScore =
      headPoseScore * 0.60 +
      positionScore * 0.30 +
      presenceScore * 0.10;

    const isEyeContact = confidenceScore >= confidenceThreshold;

    // Reduced logging — only log periodically or on state change
    if (Math.random() < 0.05) { // ~5% of frames for debug
      console.log(`👁️ Eye Contact:`, {
        yaw: yaw.toFixed(1), pitch: pitch.toFixed(1),
        headPoseScore: headPoseScore.toFixed(2),
        positionScore: positionScore.toFixed(2),
        presenceScore: presenceScore.toFixed(2),
        confidence: confidenceScore.toFixed(2),
        result: isEyeContact,
      });
    }

    return { isEyeContact, confidenceScore };
  }

  /**
   * Update eye contact detection settings
   */
  updateSettings(settings: Partial<EyeContactSettings>): void {
    this.eyeContactSettings = { ...this.eyeContactSettings, ...settings };
  }

  /**
   * Draw face detection overlay on canvas
   */
  drawOverlay(
    targetCanvas: HTMLCanvasElement,
    faces: DetectedFace[],
    videoWidth: number,
    videoHeight: number
  ): void {
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;

    // Clear previous overlay
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    // Set canvas size to match video
    targetCanvas.width = videoWidth;
    targetCanvas.height = videoHeight;

    faces.forEach((face) => {
      const { boundingBox, name, eyeContact, confidence } = face;

      // Choose colors based on eye contact
      const boxColor = eyeContact ? "#10B981" : "#EF4444"; // Green or Red
      const textColor = "#FFFFFF";

      // Draw bounding box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // Draw background for text
      const textY = boundingBox.y - 10;
      const textHeight = 25;
      ctx.fillStyle = boxColor;
      ctx.fillRect(
        boundingBox.x,
        textY - textHeight,
        boundingBox.width,
        textHeight
      );

      // Draw text
      ctx.fillStyle = textColor;
      ctx.font = "14px Arial";
      ctx.textAlign = "left";

      const eyeContactText = eyeContact ? "✅" : "❌";
      const displayText = `${name} ${eyeContactText}`;

      ctx.fillText(displayText, boundingBox.x + 5, textY - 8);

      // Draw confidence
      ctx.font = "12px Arial";
      ctx.fillText(
        `${(confidence * 100).toFixed(0)}%`,
        boundingBox.x + 5,
        boundingBox.y + boundingBox.height + 15
      );
    });
  }

  /**
   * Get eye contact statistics
   */
  getEyeContactStats(faces: DetectedFace[]): {
    totalFaces: number;
    eyeContactCount: number;
    eyeContactPercentage: number;
  } {
    const totalFaces = faces.length;
    const eyeContactCount = faces.filter((face) => face.eyeContact).length;
    const eyeContactPercentage =
      totalFaces > 0 ? (eyeContactCount / totalFaces) * 100 : 0;

    return {
      totalFaces,
      eyeContactCount,
      eyeContactPercentage,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.isProcessing = false;
    this.isInitialized = false;

    // Cleanup MediaPipe
    if (this.mediaPipeService) {
      this.mediaPipeService.cleanup();
      this.mediaPipeService = null;
    }

    // Cleanup other resources
    this.faceDetector = null;
    this.useMediaPipe = false;
    this.supportsNativeFaceDetection = false;
  }
}

// Export singleton instance
export const faceDetectionService = new FaceDetectionService();
export type { FaceDetectionResult, DetectedFace, EyeContactSettings };
