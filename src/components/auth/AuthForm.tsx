import React, { useState, useEffect } from "react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { PrivacyNotice } from "../layout/PrivacyNotice";
import { ParticleField } from "../ui/ParticleField";
import { LoadingGlobe } from "../ui/LoadingGlobe";
import { ConnectingDotsBackground } from "../ui/ConnectingDotsBackground";

// Add animation styles
const styles = `
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes reveal {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 6s ease-in-out infinite;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-reveal {
    animation: reveal 0.8s ease-out forwards;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-500 {
    animation-delay: 0.5s;
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animation-delay-400 {
    animation-delay: 0.4s;
  }
`;

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Add animation styles to document
  useEffect(() => {
    // Add styles to head
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false);
      setMounted(true);
    }, 1500);

    // Cleanup
    return () => {
      document.head.removeChild(styleEl);
      clearTimeout(timer);
    };
  }, []);

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

  // Show centered loading state while page is loading
  if (pageLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
        {/* Connecting Dots Background */}
        <ConnectingDotsBackground />

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 z-0"></div>

        {/* Centered Loading Content */}
        <div className="z-10 relative text-center flex flex-col items-center">
          {/* Loading Text */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Loading Super App
          </h2>

          {/* Loading Subtitle */}
          <p className="text-white/80 text-lg font-medium max-w-xs mx-auto">
            Preparing your productivity suite...
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show centered loading state during sign-in process
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
        {/* Connecting Dots Background */}
        <ConnectingDotsBackground />

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 z-0"></div>

        {/* Centered Sign-In Loading Content */}
        <div className="z-10 relative text-center flex flex-col items-center">
          {/* Loading Text */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Signing In
          </h2>

          {/* Loading Subtitle */}
          <p className="text-white/80 text-lg font-medium max-w-xs mx-auto">
            Connecting to Google...
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center container-safe overflow-hidden bg-black">
      {/* Connecting Dots Background */}
      <ConnectingDotsBackground />

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 z-0"></div>

      {/* Top Right - Sign In Button */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`text-white text-xs font-medium hover:opacity-70 transition-opacity px-4 py-2 border border-white/30 rounded uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={{ fontFamily: '"Inter", sans-serif' }}
        >
          {loading ? (
            "Signing in..."
          ) : (
            "Sign in with Google"
          )}
        </button>
      </div>

      {/* Center Content - SUPER APP Text */}
      <div className="z-10 relative flex flex-col items-center justify-center text-center px-4">
        {/* SUPER APP Text with Subtle Glow Effect */}
        <h1
          className={`font-bold leading-none text-white mb-4 transition-all duration-1000 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={{
            fontSize: "clamp(3rem, 12vw, 8rem)",
            fontFamily: '"Inter", sans-serif',
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            textShadow: "0 0 30px rgba(255, 255, 255, 0.25), 0 0 50px rgba(255, 255, 255, 0.15)",
            opacity: 0.9,
          }}
        >
          SUPER APP
        </h1>

        {/* Tagline */}
        <p
          className={`text-white/90 text-lg sm:text-xl lg:text-2xl font-medium tracking-wide transition-all duration-1000 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            fontFamily: '"Inter", sans-serif',
            letterSpacing: "0.05em",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
          }}
        >
          World's First AI-Powered Academic Ecosystem
        </p>
      </div>
    </div>
  );
};
