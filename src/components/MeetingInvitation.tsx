import React, { useState, useEffect } from "react";
import {
  Copy,
  Share2,
  Users,
  Clock,
  Video,
  Mail,
  MessageSquare,
  ExternalLink,
  Check,
  QrCode,
  Calendar,
} from "lucide-react";
import { StudyMeeting } from "../utils/studyMeetingService";
import { format } from "date-fns";

interface MeetingInvitationProps {
  meeting: StudyMeeting;
  onJoinMeeting?: () => void;
  className?: string;
}

export const MeetingInvitation: React.FC<MeetingInvitationProps> = ({
  meeting,
  onJoinMeeting,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const meetingUrl = `${window.location.origin}/meeting/${meeting.id}`;

  // Safely format the date
  const formatMeetingDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "Recently";
      }
      return format(dateObj, "PPP p");
    } catch (error) {
      return "Recently";
    }
  };

  const inviteText = `Join "${meeting.title}" study meeting\n\nMeeting ID: ${
    meeting.id
  }\nLink: ${meetingUrl}\n\nScheduled: ${formatMeetingDate(
    meeting.createdAt
  )}\nHost: ${meeting.hostName}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join Study Meeting: ${meeting.title}`);
    const body = encodeURIComponent(inviteText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const body = encodeURIComponent(`Join study meeting: ${meetingUrl}`);
    window.open(`sms:?body=${body}`);
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Study Meeting: ${meeting.title}`,
          text: `Join our study meeting!`,
          url: meetingUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const generateQRCode = () => {
    // Simple QR code generation using a service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      meetingUrl
    )}`;
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}
    >
      {/* Meeting Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {meeting.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hosted by {meeting.hostName}
            </p>
          </div>
        </div>

        {meeting.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {meeting.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {meeting.participants.length} participant
              {meeting.participants.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              Started {formatMeetingDate(meeting.createdAt).split(" ").pop()}
            </span>
          </div>
          {meeting.isActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 dark:text-green-400">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Meeting ID and Link */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meeting ID
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={meeting.id}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(meeting.id)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Copy Meeting ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meeting Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={meetingUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm"
            />
            <button
              onClick={() => copyToClipboard(meetingUrl)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Copy Meeting Link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Join Meeting Button */}
        {onJoinMeeting && meeting.isActive && (
          <button
            onClick={onJoinMeeting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Video className="w-4 h-4" />
            Join Meeting
          </button>
        )}

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => copyToClipboard(inviteText)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Invite
          </button>

          <button
            onClick={shareViaEmail}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>

          {navigator.share && (
            <button
              onClick={shareViaWebShare}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="flex justify-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-center">
              <img
                src={generateQRCode()}
                alt="Meeting QR Code"
                className="mx-auto mb-2 rounded-lg"
                width={200}
                height={200}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scan to join meeting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Status */}
      {!meeting.isActive && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This meeting has ended. You can still share the meeting details for
            reference.
          </p>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
};
