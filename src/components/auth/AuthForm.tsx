import React, { useState, useEffect } from "react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { PrivacyNotice } from "../layout/PrivacyNotice";
import { ParticleField } from "../ui/ParticleField";
import { LoadingGlobe } from "../ui/LoadingGlobe";

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
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-white">
        {/* Background Particle Effect */}
        <div className="absolute inset-0 z-0 opacity-60">
          <ParticleField
            baseCount={200}
            connectLines={true}
            lineDistance={180}
            speedFactor={0.5}
            particleColor="#1e40af"
            glowColor="#3b82f6"
            brightness={1.4}
            sizeFactor={1.3}
            lineColor="rgba(30, 64, 175, 0.5)"
            lineWidthFactor={0.9}
          />
        </div>

        {/* Subtle Light Blue Accents */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-100/60 to-indigo-100/60 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-50/70 to-cyan-50/70 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

        {/* Centered Loading Content */}
        <div className="z-10 relative text-center flex flex-col items-center">
          {/* Large Loading Globe */}
          <div className="mb-8 flex justify-center">
            <LoadingGlobe size={120} color="rgb(15, 23, 42)" />
          </div>

          {/* Loading Text */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent mb-4">
            Loading Super App
          </h2>

          {/* Loading Subtitle */}
          <p className="text-gray-600 text-lg font-medium max-w-xs mx-auto">
            Preparing your productivity suite...
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show centered loading state during sign-in process
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-white">
        {/* Background Particle Effect */}
        <div className="absolute inset-0 z-0 opacity-60">
          <ParticleField
            baseCount={200}
            connectLines={true}
            lineDistance={180}
            speedFactor={0.5}
            particleColor="#1e40af"
            glowColor="#3b82f6"
            brightness={1.4}
            sizeFactor={1.3}
            lineColor="rgba(30, 64, 175, 0.5)"
            lineWidthFactor={0.9}
          />
        </div>

        {/* Subtle Light Blue Accents */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-100/60 to-indigo-100/60 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-50/70 to-cyan-50/70 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

        {/* Centered Sign-In Loading Content */}
        <div className="z-10 relative text-center flex flex-col items-center">
          {/* Large Loading Globe */}
          <div className="mb-8 flex justify-center">
            <LoadingGlobe size={120} color="rgb(15, 23, 42)" />
          </div>

          {/* Loading Text */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent mb-4">
            Signing In
          </h2>

          {/* Loading Subtitle */}
          <p className="text-gray-600 text-lg font-medium max-w-xs mx-auto">
            Connecting to Google...
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center container-safe overflow-hidden bg-white">
      {/* Background Particle Effect */}
      <div className="absolute inset-0 z-0 opacity-40 sm:opacity-60">
        <ParticleField
          baseCount={150}
          connectLines={true}
          lineDistance={150}
          speedFactor={0.4}
          particleColor="#1e40af"
          glowColor="#3b82f6"
          brightness={1.2}
          sizeFactor={1.1}
          lineColor="rgba(30, 64, 175, 0.4)"
          lineWidthFactor={0.8}
        />
      </div>

      {/* Subtle Light Blue Accents */}
      <div className="absolute -top-32 -left-32 sm:-top-40 sm:-left-40 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-100/60 to-indigo-100/60 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-32 -right-32 sm:-bottom-40 sm:-right-40 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-50/70 to-cyan-50/70 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

      {/* Content Layer */}
      <div className="w-full max-w-sm sm:max-w-md z-10 relative">
        {/* Enhanced Auth Card */}
        <div
          className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-100/50 p-6 sm:p-8 lg:p-12 transition-all duration-700 backdrop-blur-sm hover:shadow-3xl hover:scale-[1.02] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Enhanced Card Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-indigo-50/40 rounded-3xl blur-xl -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-3xl blur-2xl -z-20 animate-pulse-slow"></div>

          {/* App Logo with Enhanced Effects */}
          <div className="flex flex-col items-center mb-8 sm:mb-12">
            <div className="relative group">
              {/* Multiple glow layers for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-lg opacity-20 animate-pulse-slow"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-xl opacity-15 animate-pulse-slow animation-delay-2000"></div>

              {/* Logo container with hover effects */}
              <div className="relative z-10 p-3 sm:p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/30 group-hover:border-blue-200/50 transition-all duration-500 group-hover:shadow-lg">
                <img
                  src="/SuperApp.png"
                  alt="Super App"
                  className={`h-16 sm:h-20 lg:h-24 w-auto drop-shadow-lg animate-float transition-all duration-700 group-hover:scale-110 ${
                    mounted ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>

            {/* Enhanced Title */}
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight animate-reveal animation-delay-500 text-center ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              Super App
            </h1>

            {/* Enhanced Divider */}
            <div className="relative mt-6 mb-6">
              <div
                className={`h-1 w-24 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 delay-300 ${
                  mounted ? "opacity-100 w-24" : "opacity-0 w-0"
                }`}
              ></div>
              <div className="absolute inset-0 h-1 w-24 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full blur-sm opacity-50"></div>
            </div>

            {/* Enhanced Subtitle */}
            <p
              className={`text-gray-700 text-lg font-medium animate-reveal animation-delay-500 text-center max-w-xs leading-relaxed ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              Your all-in-one productivity suite
            </p>

            {/* Feature Highlights */}
            <div
              className={`mt-6 flex items-center space-x-6 text-sm text-gray-500 animate-reveal animation-delay-500 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Smart</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Enhanced Google Sign In Button */}
          <div
            className={`space-y-6 mt-12 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Button Container with Enhanced Effects */}
            <div className="relative group">
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500 -z-10"></div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 border border-white/20"
              >
                {/* Enhanced Hover Overlay */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></span>

                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                {loading ? (
                  <div className="relative z-10 flex items-center space-x-3">
                    <span className="text-lg font-semibold">Signing in...</span>
                  </div>
                ) : (
                  <>
                    {/* Enhanced Google Icon */}
                    <div className="relative z-10 p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <path
                          fill="#FFFFFF"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#FFFFFF"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FFFFFF"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#FFFFFF"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <span className="relative z-10 text-xl font-semibold tracking-wide">
                      Continue with Google
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Trust Indicators */}
            <div
              className={`text-center space-y-3 animate-reveal animation-delay-500 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Private</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Privacy Notice Link */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => setShowPrivacyNotice(true)}
              className="group relative px-6 py-3 text-sm text-gray-500 hover:text-blue-600 transition-all duration-300 font-medium rounded-xl hover:bg-blue-50 hover:shadow-md"
            >
              <span className="relative z-10">Privacy Policy</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className="absolute top-8 right-8 w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-70 animate-pulse-slow shadow-lg"></div>
          <div className="absolute bottom-8 left-8 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-70 animate-pulse-slow animation-delay-500 shadow-lg"></div>
          <div className="absolute top-1/2 left-6 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/2 right-6 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-pulse-slow animation-delay-1500"></div>

          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-300 rounded-full opacity-40 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-1 h-1 bg-indigo-300 rounded-full opacity-40 animate-float animation-delay-1000"></div>
        </div>
      </div>
    </div>
  );
};
