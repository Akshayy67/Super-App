import React, { useState, useEffect } from "react";
import { DetectedFace } from "../utils/faceDetection";

interface FaceDetectionDebugProps {
  faces: DetectedFace[];
  isEnabled: boolean;
  isProcessing: boolean;
  stats: {
    totalFramesProcessed: number;
    eyeContactFrames: number;
    eyeContactPercentage: number;
    averageConfidence: number;
    isEyeContactActive: boolean;
  };
  className?: string;
}

export const FaceDetectionDebug: React.FC<FaceDetectionDebugProps> = ({
  faces,
  isEnabled,
  isProcessing,
  stats,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);

  useEffect(() => {
    if (faces.length > 0) {
      setLastDetectionTime(Date.now());
    }
  }, [faces]);

  const timeSinceLastDetection = Date.now() - lastDetectionTime;

  if (!isEnabled) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg mb-2 text-sm font-medium transition-colors"
      >
        🔍 Debug {isVisible ? "▼" : "▶"}
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="bg-black/90 backdrop-blur-sm text-white rounded-lg p-4 max-w-sm shadow-2xl border border-gray-600">
          <h3 className="text-lg font-bold mb-3 text-blue-400">
            Face Detection Debug
          </h3>

          {/* Status */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span
                className={`font-medium ${
                  isProcessing ? "text-yellow-400" : "text-green-400"
                }`}
              >
                {isProcessing ? "Processing..." : "Ready"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Faces Detected:</span>
              <span className="font-medium text-white">{faces.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Last Detection:</span>
              <span
                className={`font-medium ${
                  timeSinceLastDetection < 1000
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {timeSinceLastDetection < 1000
                  ? "Active"
                  : `${Math.floor(timeSinceLastDetection / 1000)}s ago`}
              </span>
            </div>
          </div>

          {/* Face Details */}
          {faces.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">
                Detected Faces:
              </h4>
              {faces.map((face, index) => (
                <div
                  key={face.id}
                  className="bg-gray-800 rounded p-2 mb-2 text-xs"
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Face {index + 1}:</span>
                    <span
                      className={`font-medium ${
                        face.eyeContact ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {face.eyeContact ? "✅ Eye Contact" : "❌ No Eye Contact"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-gray-400">Confidence:</span>
                      <span className="ml-1 text-white">
                        {(face.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Yaw:</span>
                      <span className="ml-1 text-white">
                        {face.headPose.yaw.toFixed(1)}°
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Pitch:</span>
                      <span className="ml-1 text-white">
                        {face.headPose.pitch.toFixed(1)}°
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Roll:</span>
                      <span className="ml-1 text-white">
                        {face.headPose.roll.toFixed(1)}°
                      </span>
                    </div>
                  </div>

                  <div className="mt-1">
                    <span className="text-gray-400">Position:</span>
                    <span className="ml-1 text-white">
                      {Math.round(face.boundingBox.x)},{" "}
                      {Math.round(face.boundingBox.y)}(
                      {Math.round(face.boundingBox.width)}×
                      {Math.round(face.boundingBox.height)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistics */}
          <div className="border-t border-gray-600 pt-3">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">
              Statistics:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Frames:</span>
                <span className="ml-1 text-white">
                  {stats.totalFramesProcessed}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Eye Contact:</span>
                <span className="ml-1 text-white">
                  {stats.eyeContactPercentage.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Avg Confidence:</span>
                <span className="ml-1 text-white">
                  {(stats.averageConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Current:</span>
                <span
                  className={`ml-1 font-medium ${
                    stats.isEyeContactActive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stats.isEyeContactActive ? "Good" : "Poor"}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Performance:</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < Math.floor(stats.averageConfidence * 5)
                        ? "bg-green-400"
                        : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
            <p>💡 Look directly at the camera for eye contact detection</p>
            <p>🎯 Move your head to test tracking</p>
          </div>
        </div>
      )}
    </div>
  );
};
