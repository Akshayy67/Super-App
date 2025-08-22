import React, { useState, useEffect } from "react";
import { realTimeAuth } from "../utils/realTimeAuth";
import { PrivacyNotice } from "./PrivacyNotice";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await realTimeAuth.signInWithGoogle();
      onAuthSuccess();
    } catch (error) {
      console.error("Google sign-in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showPrivacyNotice) {
    return (
      <PrivacyNotice
        isOpen={showPrivacyNotice}
        onClose={() => setShowPrivacyNotice(false)}
      />
    );
  }

  // Simplified loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Signing In</h2>
          <p className="text-sm text-gray-600">Connecting to Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Simplified Auth Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Simple Logo */}
          <div className="text-center mb-6">
            <img
              src="/SuperApp.png"
              alt="Super Study App"
              className="w-16 h-16 mx-auto mb-4"
              onError={(e) => {
                console.error("Auth logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Super Study App
            </h1>
            <p className="text-sm text-gray-600">
              Your AI-powered academic assistant
            </p>
          </div>

          {/* Simple Sign In Section */}
          <div className="space-y-4">
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            />

            <div className="text-center">
              <button
                onClick={() => setShowPrivacyNotice(true)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Privacy Policy & Terms
              </button>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
};
