import React, { useEffect, useRef } from "react";
import { DetectedFace } from "../utils/faceDetection";

interface FaceDetectionOverlayProps {
  faces: DetectedFace[];
  videoWidth: number;
  videoHeight: number;
  className?: string;
  showConfidence?: boolean;
  showHeadPose?: boolean;
  eyeContactPercentage?: number;
}

export const FaceDetectionOverlay: React.FC<FaceDetectionOverlayProps> = ({
  faces,
  videoWidth,
  videoHeight,
  className = "",
  showConfidence = true,
  showHeadPose = false,
  eyeContactPercentage = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Debug logging
    console.log(
      `🎨 Canvas: ${videoWidth}x${videoHeight}, Faces: ${faces.length}`
    );

    if (faces.length > 0) {
      console.log(
        `🎨 Drawing ${faces.length} face(s) on canvas ${videoWidth}x${videoHeight}`
      );
      faces.forEach((face, index) => {
        console.log(`Face ${index}:`, {
          boundingBox: face.boundingBox,
          eyeContact: face.eyeContact,
          confidence: face.confidence,
        });
      });
    }

    // Draw a test border to verify canvas is working
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, videoWidth - 4, videoHeight - 4);

    // Draw each face
    faces.forEach((face) => {
      drawFace(ctx, face, showConfidence, showHeadPose, eyeContactPercentage);
    });
  }, [faces, videoWidth, videoHeight, showConfidence, showHeadPose]);

  const drawFace = (
    ctx: CanvasRenderingContext2D,
    face: DetectedFace,
    showConf: boolean,
    showPose: boolean,
    eyeContactPerc: number = 0
  ) => {
    const { boundingBox, name, eyeContact, confidence, headPose } = face;

    // Colors
    const boxColor = eyeContact ? "#10B981" : "#EF4444"; // Green for eye contact, red otherwise
    const textColor = "#FFFFFF";
    const bgColor = eyeContact
      ? "rgba(16, 185, 129, 0.8)"
      : "rgba(239, 68, 68, 0.8)";

    // Draw bounding box
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    );

    // Prepare text
    const eyeContactIcon = eyeContact ? "✅" : "❌";
    const mainText = `${name} ${eyeContactIcon}`;

    // Calculate text dimensions
    ctx.font = "bold 14px Arial";
    const mainTextWidth = ctx.measureText(mainText).width;

    let additionalTexts: string[] = [];
    if (showConf) {
      additionalTexts.push(`Eye Contact: ${eyeContactPerc.toFixed(0)}%`);
    }
    if (showPose) {
      additionalTexts.push(`Yaw: ${headPose.yaw.toFixed(1)}°`);
      additionalTexts.push(`Pitch: ${headPose.pitch.toFixed(1)}°`);
    }

    // Calculate background dimensions
    const lineHeight = 18;
    const padding = 8;
    const totalLines = 1 + additionalTexts.length;
    const bgHeight = totalLines * lineHeight + padding * 2;
    const bgWidth =
      Math.max(
        mainTextWidth,
        ...additionalTexts.map((text) => {
          ctx.font = "12px Arial";
          return ctx.measureText(text).width;
        })
      ) +
      padding * 2;

    // Draw background
    const bgY = boundingBox.y - bgHeight - 5;
    ctx.fillStyle = bgColor;
    ctx.fillRect(boundingBox.x, bgY, bgWidth, bgHeight);

    // Draw main text
    ctx.fillStyle = textColor;
    ctx.font = "bold 14px Arial";
    ctx.fillText(mainText, boundingBox.x + padding, bgY + lineHeight + padding);

    // Draw additional text
    ctx.font = "12px Arial";
    additionalTexts.forEach((text, index) => {
      ctx.fillText(
        text,
        boundingBox.x + padding,
        bgY + (index + 2) * lineHeight + padding
      );
    });

    // Draw eye contact indicator on the face
    if (eyeContact) {
      // Draw a small green circle for eye contact
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(
        boundingBox.x + boundingBox.width - 15,
        boundingBox.y + 15,
        8,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Add checkmark
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(boundingBox.x + boundingBox.width - 18, boundingBox.y + 15);
      ctx.lineTo(boundingBox.x + boundingBox.width - 15, boundingBox.y + 18);
      ctx.lineTo(boundingBox.x + boundingBox.width - 12, boundingBox.y + 12);
      ctx.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 pointer-events-none z-10 ${className}`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
};

// Eye Contact Status Component
interface EyeContactStatusProps {
  isEyeContact: boolean;
  confidence: number;
  faceCount: number;
  className?: string;
}

export const EyeContactStatus: React.FC<EyeContactStatusProps> = ({
  isEyeContact,
  confidence,
  faceCount,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
          isEyeContact
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700"
        }`}
      >
        <span>{isEyeContact ? "✅" : "❌"}</span>
        <span>Eye Contact</span>
      </div>

      {faceCount > 0 && (
        <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
          <span>👤</span>
          <span>
            {faceCount} face{faceCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {confidence > 0 && (
        <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">
          <span>📊</span>
          <span>{(confidence * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

// Face Detection Stats Component
interface FaceDetectionStatsProps {
  stats: {
    totalFramesProcessed: number;
    eyeContactFrames: number;
    eyeContactPercentage: number;
    averageConfidence: number;
  };
  className?: string;
}

export const FaceDetectionStats: React.FC<FaceDetectionStatsProps> = ({
  stats,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Eye Contact Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.eyeContactPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Eye Contact
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(stats.averageConfidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Confidence
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {stats.eyeContactFrames}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Good Frames
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {stats.totalFramesProcessed}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Frames
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Eye Contact Progress</span>
          <span>{stats.eyeContactPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(stats.eyeContactPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
