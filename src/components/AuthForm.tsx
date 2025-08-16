import React, { useState } from "react";
import { User, LogIn, Mail, Lock } from "lucide-react";
import { realTimeAuth } from "../utils/realTimeAuth";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  // State to highlight 'Forgot password?' in red
  const [forgotError, setForgotError] = useState(false);
  // Validation helpers
  const validateEmail = (email: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fade out toast after 2 seconds
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
        setForgotError(false); // Remove red highlight after toast fades
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setToast(null);
    // Client-side validation
    if (!validateEmail(formData.email)) {
      setLoading(false);
      setToast({
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }
    if (!isLogin && !formData.username.trim()) {
      setLoading(false);
      setToast({ message: "Username is required", type: "error" });
      return;
    }
    let result;
    if (isLogin) {
      result = await realTimeAuth.login(formData.email, formData.password);
    } else {
      result = await realTimeAuth.register(
        formData.username,
        formData.email,
        formData.password
      );
    }
    if (result.success) {
      setToast({
        message: isLogin ? "Login successful!" : "Account created!",
        type: "success",
      });
      onAuthSuccess();
    } else {
      setToast({ message: result.message, type: "error" });
      setError(result.message);
      // Highlight 'Forgot password?' in red if password/credential error
      if (
        isLogin &&
        result.message &&
        (result.message.toLowerCase().includes("password") ||
          result.message.toLowerCase().includes("credential"))
      ) {
        setForgotError(true);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setToast(null);
    try {
      const result = await realTimeAuth.signInWithGoogle();
      if (result.success) {
        setToast({ message: "Google sign-in successful!", type: "success" });
        onAuthSuccess();
      } else {
        setToast({ message: result.message, type: "error" });
        setError(result.message);
      }
    } catch (err) {
      setToast({ message: "Google sign-in failed", type: "error" });
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setToast(null);
    if (!validateEmail(resetEmail)) {
      setLoading(false);
      setToast({
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }
    try {
      const result = await realTimeAuth.resetPassword(resetEmail);
      if (result.success) {
        setToast({
          message: result.message + " Please check your inbox and spam folder.",
          type: "success",
        });
        setError("");
      } else {
        setToast({ message: result.message, type: "error" });
        setError(result.message);
      }
    } catch (err) {
      setToast({ message: "Password reset failed", type: "error" });
      setError("Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white shadow-lg">
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Super Study App
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your AI-Powered Academic Assistant
          </p>
        </div>

        {showReset ? (
          <form
            onSubmit={handlePasswordReset}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <label
                htmlFor="resetEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="resetEmail"
                  type="email"
                  name="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                  aria-label="Reset Email"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Sending..." : "Send Password Reset Email"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError("");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {!isLogin && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Enter your username"
                      required={!isLogin}
                      aria-label="Username"
                    />
                  </div>
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                    aria-label="Email"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Enter your password"
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.175-6.125M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className={`font-medium transition-colors text-sm sm:text-base text-left mt-2 ${
                      forgotError
                        ? "text-red-600"
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </div>
                )}
              </button>
            </form>
            <div className="mt-4 sm:mt-6 text-center space-y-2">
              <div className="w-full flex items-center my-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-2 text-gray-400 text-xs">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center"
                aria-label="Sign in with Google"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.24-1.39 3.64-5.27 3.64-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.72 1.43l2.54-2.47C16.18 4.7 14.36 3.7 12.17 3.7 6.98 3.7 2.83 7.85 2.83 13.04s4.15 9.34 9.34 9.34c5.39 0 8.94-3.79 8.94-9.13 0-.61-.07-1.21-.18-1.78z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
              <div className="w-full flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setFormData({ username: "", email: "", password: "" });
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base text-left"
                  aria-label={isLogin ? "Sign up" : "Sign in"}
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
