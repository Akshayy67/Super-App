import React, { useState } from "react";
import { realTimeAuth } from "../utils/realTimeAuth";
import { PrivacyNotice } from "./PrivacyNotice";
import { ParticleField } from "./ParticleField";
import { LoadingGlobe } from "./LoadingGlobe";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

interface Toast {
  message: string;
  type: "error" | "success";
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Fade out toast after 3 seconds
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setToast(null);

    try {
      const result = await realTimeAuth.signInWithGoogle();
      if (result.success) {
        setToast({ message: "Welcome! Sign-in successful.", type: "success" });
        onAuthSuccess();
      } else {
        setToast({ message: result.message, type: "error" });
      }
    } catch (err) {
      setToast({ message: "Sign-in failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[radial-gradient(circle_at_30%_30%,rgba(199,210,254,0.6),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(165,180,252,0.5),transparent_55%)] bg-indigo-50">
      {/* Particle Field Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleField
          className="absolute inset-0"
          baseCount={220}
          maxMultiplier={3.5}
          maxLineParticles={650}
          targetLines={1800}
          speedFactor={3}
          sizeFactor={2}
          brightness={1.6}
          lineWidthFactor={1.8}
          particleColor="#60a5fa"
          glowColor="#bfdbfe"
          lineColor="#3b82f6"
        />
        {/* Light overlay toned down so particles remain visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-indigo-100/20" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-4">
          <LoadingGlobe size={90} color="rgb(59,130,246)" />
          <p className="text-sm font-medium text-white/90 tracking-wide animate-pulse">
            Connecting securely...
          </p>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl ring-1 ring-indigo-200/40 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-hidden will-change-transform transition-transform">
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white shadow-lg">
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            Super Study App
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your AI-Powered Academic Assistant
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in to continue
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              We use your Google account to securely sign you in and access your
              Drive files when needed.
            </p>
          </div>

          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            loading={loading}
            disabled={loading}
          />

          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By signing in, you agree to our terms of service. We only access
              your Google account information and Drive files that you
              explicitly share with our app.{" "}
              <button
                onClick={() => setShowPrivacyNotice(true)}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Learn more about privacy
              </button>
            </p>
          </div>
        </div>

        <PrivacyNotice
          isOpen={showPrivacyNotice}
          onClose={() => setShowPrivacyNotice(false)}
        />
      </div>
    </div>
  );
};
