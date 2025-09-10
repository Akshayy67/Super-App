import React, { useState } from "react";
import {
  Share2,
  MessageCircle,
  Mail,
  Copy,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl?: string;
  fileContent?: string;
  position?: { x: number; y: number };
}

export const ShareMenu: React.FC<ShareMenuProps> = ({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileContent,
  position,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Generate a shareable link with real sharing functionality
  const generateShareableLink = () => {
    if (fileUrl) {
      return fileUrl;
    }

    // Create a real shareable link based on file content
    if (fileContent) {
      // In a real app, this would upload to a sharing service and return a real URL
      // For now, we'll create a data URL or use a file sharing service
      try {
        const blob = new Blob([fileContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        return url;
      } catch (error) {
        console.error("Error creating shareable link:", error);
        return `${window.location.origin}/shared-file/${encodeURIComponent(
          fileName
        )}`;
      }
    }

    return `${window.location.origin}/shared-file/${encodeURIComponent(
      fileName
    )}`;
  };

  const handleCopyLink = async () => {
    const link = generateShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const link = generateShareableLink();
    const message = `Check out this file: ${fileName}\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  const handleEmailShare = () => {
    const link = generateShareableLink();
    const subject = `Shared file: ${fileName}`;
    const body = `Hi,\n\nI wanted to share this file with you: ${fileName}\n\nYou can access it here: ${link}\n\nBest regards`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    onClose();
  };

  const handleExternalLinkOpen = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
    onClose();
  };

  if (!isOpen) return null;

  const menuStyle = position
    ? {
        position: "fixed" as const,
        top: position.y,
        left: position.x,
        zIndex: 1000,
      }
    : {};

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Share Menu */}
      <div
        className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-50"
        style={menuStyle}
      >
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Share File</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">{fileName}</p>
        </div>

        <div className="py-1">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
            <span className={copied ? "text-green-600" : "text-gray-700"}>
              {copied ? "Link copied!" : "Copy link"}
            </span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Share via WhatsApp</span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">Share via Email</span>
          </button>

          {/* Open External Link */}
          {fileUrl && (
            <button
              onClick={handleExternalLinkOpen}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Open in new tab</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
