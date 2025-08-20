import React, { useState, useEffect } from "react";
import {
  Video,
  Mic,
  Play,
  Pause,
  SkipForward,
  Clock,
  User,
  Bot,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Award,
  Target,
  BarChart3,
  ArrowRight,
  Headphones,
  MessageSquare,
  ArrowLeft,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
} from "lucide-react";
import { vapi, isVapiConfigured, checkBrowserCompatibility, interviewer } from "../../lib/vapi.sdk";

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  timeLimit: number;
  hints?: string[];
}

interface InterviewSession {
  id: string;
  type: string;
  difficulty: string;
  duration: number;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startTime: Date;
}

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const MockInterview: React.FC = () => {
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("general");
  
  // VAPI states
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [browserIssues, setBrowserIssues] = useState<string[]>([]);
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Check VAPI configuration and browser compatibility
    const checkSetup = () => {
      const vapiConfigured = isVapiConfigured();
      const compatibilityIssues = checkBrowserCompatibility();
      
      setIsVapiReady(vapiConfigured);
      setBrowserIssues(compatibilityIssues);
      
      if (!vapiConfigured) {
        setError('VAPI is not properly configured. Please check your environment variables.');
      } else if (compatibilityIssues.length > 0) {
        setError(`Browser compatibility issues: ${compatibilityIssues.join(', ')}`);
      }
    };
    
    checkSetup();
  }, []);

  useEffect(() => {
    const onCallStart = () => {
      console.log('Call started');
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setIsRecording(true);
    };
    
    const onCallEnd = () => {
      console.log('Call ended');
      setCallStatus(CallStatus.FINISHED);
      setIsRecording(false);
    };

    const onMessage = (message: any) => {
      console.log('Message received:', message);
      if(message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { 
          role: message.role || 'user', 
          content: message.transcript 
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    }

    const onSpeechStart = () => {
      console.log('AI started speaking');
      setIsSpeaking(true);
    };
    
    const onSpeechEnd = () => {
      console.log('AI stopped speaking');
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error('VAPI Error:', error);
      setError(error.message);
      setCallStatus(CallStatus.INACTIVE);
      setIsRecording(false);
    };

            vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
  }, []);

  const interviewTemplates = [
    {
      id: "general",
      name: "General Interview",
      description: "Mix of behavioral and general questions",
      duration: 30,
      questionCount: 10,
      difficulty: "medium" as const,
    },
    {
      id: "behavioral",
      name: "Behavioral Focus",
      description: "STAR method practice with situational questions",
      duration: 45,
      questionCount: 12,
      difficulty: "medium" as const,
    },
    {
      id: "technical",
      name: "Technical Interview",
      description: "Role-specific technical questions",
      duration: 60,
      questionCount: 15,
      difficulty: "hard" as const,
    },
    {
      id: "quick",
      name: "Quick Practice",
      description: "5-minute rapid fire questions",
      duration: 5,
      questionCount: 5,
      difficulty: "easy" as const,
    },
    {
      id: "executive",
      name: "Leadership Interview",
      description: "Senior position and leadership focused",
      duration: 45,
      questionCount: 10,
      difficulty: "hard" as const,
    },
  ];

  const sampleQuestions: InterviewQuestion[] = [
    {
      id: "mock-1",
      question: "Tell me about yourself and your background.",
      category: "general",
      timeLimit: 120,
      hints: ["Keep it professional", "2-3 minutes max", "End with why this role"],
    },
    {
      id: "mock-2",
      question: "Why are you interested in this position?",
      category: "general",
      timeLimit: 90,
      hints: ["Research the company", "Be specific", "Show enthusiasm"],
    },
    {
      id: "mock-3",
      question: "Describe a challenging project you've worked on.",
      category: "behavioral",
      timeLimit: 180,
      hints: ["Use STAR method", "Focus on your role", "Share the outcome"],
    },
    {
      id: "mock-4",
      question: "How do you handle tight deadlines?",
      category: "behavioral",
      timeLimit: 120,
      hints: ["Give specific examples", "Show organization skills", "Mention tools/methods"],
    },
    {
      id: "mock-5",
      question: "What are your salary expectations?",
      category: "general",
      timeLimit: 60,
      hints: ["Research market rates", "Be flexible", "Focus on value"],
    },
  ];

  const startInterview = (templateId: string) => {
    const template = interviewTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const session: InterviewSession = {
      id: Date.now().toString(),
      type: templateId === "technical" ? "technical" : templateId === "behavioral" ? "behavioral" : "mixed",
      difficulty: template.difficulty,
      duration: template.duration,
      questions: sampleQuestions.slice(0, template.questionCount),
      currentQuestionIndex: 0,
      startTime: new Date(),
    };

    setActiveSession(session);
    setTimeRemaining(session.questions[0].timeLimit);
    setCurrentAnswer("");
  };

  const handleStartRecording = async () => {
    try {
      // Check if VAPI is ready
      if (!isVapiReady) {
        throw new Error('VAPI is not properly configured. Please check your setup.');
      }
      
      // Check for browser issues
      if (browserIssues.length > 0) {
        throw new Error(`Browser compatibility issues: ${browserIssues.join(', ')}`);
      }

      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      // Format questions for the AI interviewer
      let formattedQuestions = '';
      if (activeSession && activeSession.questions.length > 0) {
        formattedQuestions = activeSession.questions
          .map((question, index) => `${index + 1}. ${question.question}`)
          .join('\n');
      } else {
        formattedQuestions = "1. Tell me about yourself\n2. Why are you interested in this role?\n3. What are your greatest strengths?\n4. Where do you see yourself in 5 years?\n5. Do you have any questions for us?";
      }

      console.log('Starting interview with questions:', formattedQuestions);
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions
        }
      });
    } catch (err) {
      console.error('Error starting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting call');
      setCallStatus(CallStatus.FINISHED);
      setIsRecording(false);
      await vapi.stop();
    } catch (err) {
      console.error('Error stopping call:', err);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleNextQuestion = () => {
    if (!activeSession) return;

    const updatedSession = {
      ...activeSession,
      currentQuestionIndex: activeSession.currentQuestionIndex + 1,
    };

    if (updatedSession.currentQuestionIndex >= activeSession.questions.length) {
      // End interview
      setActiveSession(null);
      setIsRecording(false);
      setIsPaused(false);
      setCurrentAnswer("");
      setTimeRemaining(0);
      handleDisconnect();
    } else {
      // Move to next question
      setActiveSession(updatedSession);
      setTimeRemaining(activeSession.questions[updatedSession.currentQuestionIndex].timeLimit);
      setCurrentAnswer("");
    }
  };

  const endInterview = (session: InterviewSession) => {
    setActiveSession(null);
    setIsRecording(false);
    setIsPaused(false);
    setCurrentAnswer("");
    setTimeRemaining(0);
    handleDisconnect();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Show VAPI setup instructions if not configured
  if (!isVapiReady) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">VAPI Setup Required</h2>
          <p className="text-gray-700 mb-6">
            To use real-time voice interviews, you need to configure VAPI (Voice AI Platform).
          </p>
          
          <div className="text-left bg-white p-4 rounded-xl border border-yellow-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Sign up at <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vapi.ai</a></li>
              <li>Get your Web Token from Settings → API Keys</li>
              <li>Create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in your project root</li>
              <li>Add: <code className="bg-gray-100 px-2 py-1 rounded">VITE_VAPI_WEB_TOKEN=your_token_here</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>For detailed instructions, see the VAPI setup documentation</p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an active session, show the interview interface
  if (activeSession) {
    const currentQuestion = activeSession.questions[activeSession.currentQuestionIndex];
    const progress = ((activeSession.currentQuestionIndex + 1) / activeSession.questions.length) * 100;

    return (
      <div className="h-full flex flex-col">
        {/* Interview Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setActiveSession(null);
                  setIsRecording(false);
                  setIsPaused(false);
                  setCurrentAnswer("");
                  setTimeRemaining(0);
                  handleDisconnect();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Mock Interview Session</h2>
              <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(activeSession.difficulty)}`}>
                {activeSession.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{formatTime(timeRemaining)}</span>
              </div>
              <button
                onClick={() => endInterview(activeSession)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                End Interview
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Question {activeSession.currentQuestionIndex + 1} of {activeSession.questions.length}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interview Content */}
        <div className="flex-1 flex">
          {/* Video/Interview Area */}
          <div className="flex-1 p-6">
            <div className="h-full flex flex-col space-y-6">
              {/* Mock Video Area */}
              <div className="flex-1 bg-gray-900 rounded-xl flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                  <p className="text-white mb-2">Camera Preview</p>
                  <p className="text-gray-400 text-sm">Your video will appear here during the interview</p>
                </div>
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-white text-sm">Recording</span>
                  </div>
                )}

                {/* AI Speaking Indicator */}
                {isSpeaking && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-white text-sm">AI Speaking</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                {callStatus === CallStatus.INACTIVE ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Start Interview</span>
                  </button>
                ) : callStatus === CallStatus.CONNECTING ? (
                  <button
                    disabled
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Interview</span>
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <SkipForward className="w-5 h-5" />
                      <span>Next Question</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Question Panel */}
          <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Current Question */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Interview Question</h3>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-900 font-medium">{currentQuestion.question}</p>
                </div>
              </div>

              {/* Hints */}
              {currentQuestion.hints && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                    Tips for this question
                  </h4>
                  <ul className="space-y-1">
                    {currentQuestion.hints.map((hint, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Answer Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Notes</h4>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer notes here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Conversation Transcript */}
              {messages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Conversation</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                    {messages.slice(-3).map((message, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-600">
                          {message.role === 'user' ? 'You' : 'AI'}: 
                        </span>
                        <span className="text-gray-800 ml-2">{message.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{currentQuestion.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-medium text-gray-900">{currentQuestion.timeLimit}s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium text-gray-900">
                    {activeSession.currentQuestionIndex + 1}/{activeSession.questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the template selection interface
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Mock Interview Practice</h2>
            <p className="text-purple-100 mb-4">
              Choose your preferred interview practice method
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Headphones className="w-5 h-5" />
                <span className="text-sm">Voice AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span className="text-sm">Video Practice</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Text Practice</span>
              </div>
            </div>
          </div>
          <Video className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Browser Compatibility Issues */}
      {browserIssues.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-700 text-sm font-medium mb-2">Browser Compatibility Issues:</p>
          <ul className="text-orange-600 text-sm space-y-1">
            {browserIssues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
          <p className="text-orange-600 text-sm mt-2">
            Try using Chrome, Edge, or Firefox for the best experience.
          </p>
        </div>
      )}

      {/* Interview Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Interview Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => startInterview(template.id)}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{template.duration} minutes</span>
                <span>{template.questionCount} questions</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pro Tips for Interview Practice</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Choose the right difficulty level for your experience</li>
              <li>• Practice in a quiet environment</li>
              <li>• Record your responses for self-review</li>
              <li>• Use the hints provided for each question</li>
              <li>• Practice regularly to build confidence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
