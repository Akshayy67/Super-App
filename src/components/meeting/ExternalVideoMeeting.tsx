import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  Settings,
  Copy,
  UserPlus,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface ExternalVideoMeetingProps {
  meetingId?: string;
  onMeetingEnd?: () => void;
  className?: string;
}

interface MeetingConfig {
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail: string;
  signature: string;
  sdkKey: string;
}

export const ExternalVideoMeeting: React.FC<ExternalVideoMeetingProps> = ({
  meetingId: initialMeetingId,
  onMeetingEnd,
  className = "",
}) => {
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(!initialMeetingId);
  const [error, setError] = useState<string | null>(null);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  // Zoom SDK will be loaded dynamically
  const [zoomSDK, setZoomSDK] = useState<any>(null);

  useEffect(() => {
    // Load Zoom Web SDK
    loadZoomSDK();

    return () => {
      // Cleanup on unmount
      if (zoomSDK) {
        zoomSDK.leaveMeeting();
      }
    };
  }, []);

  const loadZoomSDK = async () => {
    try {
      console.log("Loading Zoom Web SDK...");

      // Check if Zoom Web SDK is loaded
      if (typeof window !== "undefined" && (window as any).ZoomMtgEmbedded) {
        console.log("Zoom Web SDK found, initializing...");

        const ZoomMtgEmbedded = (window as any).ZoomMtgEmbedded;
        const client = ZoomMtgEmbedded.createClient();

        // Initialize the client
        await new Promise((resolve, reject) => {
          client
            .init({
              debug: true,
              zoomAppRoot: meetingContainerRef.current,
              language: "en-US",
              customize: {
                meetingInfo: [
                  "topic",
                  "host",
                  "mn",
                  "pwd",
                  "telPwd",
                  "invite",
                  "participant",
                  "dc",
                  "enctype",
                ],
                toolbar: {
                  buttons: [
                    {
                      text: "Custom Button",
                      className: "CustomButton",
                      onClick: () => {
                        console.log("custom button");
                      },
                    },
                  ],
                },
              },
            })
            .then(() => {
              console.log("Zoom SDK initialized successfully");
              resolve(client);
            })
            .catch((error: any) => {
              console.error("Failed to initialize Zoom SDK:", error);
              reject(error);
            });
        });

        setZoomSDK(client);
      } else {
        throw new Error(
          "Zoom Web SDK not loaded. Please ensure the SDK scripts are included in your HTML."
        );
      }
    } catch (error) {
      console.error("Failed to load Zoom SDK:", error);
      setError(
        "Failed to load video conferencing SDK. Please refresh the page and try again."
      );
    }
  };

  const generateMeetingSignature = async (
    meetingNumber: string,
    role: number = 0
  ) => {
    // In a real implementation, this would call your backend to generate a JWT signature
    // The signature should be generated server-side for security
    try {
      const response = await fetch("http://localhost:3001/api/zoom/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingNumber,
          role, // 0 for participant, 1 for host
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate meeting signature");
      }

      const data = await response.json();
      return data.signature;
    } catch (error) {
      console.error("Error generating signature:", error);
      // For demo purposes, return a mock signature
      return "mock_signature_" + Date.now();
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeetingTitle.trim()) {
      setError("Please enter a meeting title");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = realTimeAuth.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create meeting via API
      const response = await fetch(
        "http://localhost:3001/api/zoom/create-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: newMeetingTitle,
            duration: 60,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      const meeting = await response.json();
      console.log("Meeting created:", meeting);

      const signature = await generateMeetingSignature(meeting.id, 1); // Host role

      const meetingConfig: MeetingConfig = {
        meetingNumber: meeting.id,
        password: meeting.password,
        userName: user.name || user.email || "Study Partner",
        userEmail: user.email || "",
        signature,
        sdkKey: import.meta.env.VITE_ZOOM_SDK_KEY || "your_zoom_sdk_key",
      };

      await joinZoomMeeting(meetingConfig);
      setShowCreateMeeting(false);
    } catch (error) {
      console.error("Error creating meeting:", error);
      setError("Failed to create meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinMeetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = realTimeAuth.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const signature = await generateMeetingSignature(joinMeetingId, 0); // Participant role

      const meetingConfig: MeetingConfig = {
        meetingNumber: joinMeetingId,
        password: joinPassword,
        userName: user.name || user.email || "Study Partner",
        userEmail: user.email || "",
        signature,
        sdkKey: import.meta.env.VITE_ZOOM_SDK_KEY || "your_zoom_sdk_key",
      };

      await joinZoomMeeting(meetingConfig);
    } catch (error) {
      console.error("Error joining meeting:", error);
      setError(
        "Failed to join meeting. Please check the meeting ID and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const joinZoomMeeting = async (config: MeetingConfig) => {
    if (!zoomSDK) {
      throw new Error("Zoom SDK not loaded");
    }

    try {
      console.log("Joining Zoom meeting with config:", config);

      // Join the meeting using the real Zoom SDK
      await zoomSDK.join({
        sdkKey: config.sdkKey,
        signature: config.signature,
        meetingNumber: config.meetingNumber,
        password: config.password,
        userName: config.userName,
        userEmail: config.userEmail,
        tk: "", // Leave empty for Web SDK
        zak: "", // Leave empty for Web SDK
      });

      setIsInMeeting(true);
      console.log("Successfully joined Zoom meeting");
    } catch (error) {
      console.error("Error joining Zoom meeting:", error);
      throw error;
    }
  };

  const handleLeaveMeeting = () => {
    if (zoomSDK) {
      try {
        zoomSDK.leaveMeeting();
        setIsInMeeting(false);
        console.log("Left Zoom meeting");
      } catch (error) {
        console.error("Error leaving meeting:", error);
      }
    }
  };

  const copyMeetingLink = () => {
    const meetingUrl = `${window.location.origin}/team?meeting=${joinMeetingId}`;
    navigator.clipboard.writeText(meetingUrl);
    // You could show a toast notification here
  };

  if (isInMeeting) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}
      >
        {/* Meeting Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Video Meeting
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connected via Zoom
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMeetingLink}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Copy meeting link"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleLeaveMeeting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave Meeting
            </button>
          </div>
        </div>

        {/* Zoom Meeting Container */}
        <div
          ref={meetingContainerRef}
          className="w-full h-96 bg-gray-100 dark:bg-slate-700 flex items-center justify-center"
        >
          <div className="text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Zoom meeting interface will appear here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              In a real implementation, the Zoom Web SDK would render the
              meeting interface in this container
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Video Meeting
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start or join a video meeting powered by Zoom
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {showCreateMeeting ? (
          <div className="space-y-6">
            {/* Create Meeting */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Create New Meeting
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    placeholder="Enter meeting title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={handleCreateMeeting}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Creating..." : "Create Meeting"}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            {/* Join Meeting */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Join Existing Meeting
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value)}
                    placeholder="Enter meeting ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Enter meeting password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={handleJoinMeeting}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Joining..." : "Join Meeting"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ready to start your meeting?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create a new meeting or join an existing one
            </p>
            <button
              onClick={() => setShowCreateMeeting(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
