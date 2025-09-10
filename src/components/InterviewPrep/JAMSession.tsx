import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  MessageSquare,
  BarChart,
  CheckCircle,
  AlertCircle,
  Headphones,
} from "lucide-react";
import { getRandomJAMTopic } from "./bank/JAMTopics";
import { aiService } from "../../utils/aiService";

interface JAMSessionProps {
  onBack: () => void;
}

enum SessionState {
  TOPIC_DISPLAY = "TOPIC_DISPLAY",
  PREPARATION = "PREPARATION",
  SPEAKING = "SPEAKING",
  COMPLETED = "COMPLETED",
}

interface JAMFeedback {
  overallScore: number;
  fluency: number;
  content: number;
  confidence: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export const JAMSession: React.FC<JAMSessionProps> = ({ onBack }) => {
  const [sessionState, setSessionState] = useState<SessionState>(
    SessionState.TOPIC_DISPLAY
  );
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [preparationTime, setPreparationTime] = useState(30);
  const [speakingTime, setSpeakingTime] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [feedback, setFeedback] = useState<JAMFeedback | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const preparationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }

        setInterimTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };
    }

    // Get initial topic
    setCurrentTopic(getRandomJAMTopic());

    return () => {
      if (preparationIntervalRef.current)
        clearInterval(preparationIntervalRef.current);
      if (speakingIntervalRef.current)
        clearInterval(speakingIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startPreparation = () => {
    setSessionState(SessionState.PREPARATION);
    setPreparationTime(30);

    preparationIntervalRef.current = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(preparationIntervalRef.current!);
          startSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startSpeaking = async () => {
    setSessionState(SessionState.SPEAKING);
    setSpeakingTime(60);
    setTranscript("");
    setInterimTranscript("");
    audioChunksRef.current = [];

    try {
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start speaking timer
      speakingIntervalRef.current = setInterval(() => {
        setSpeakingTime((prev) => {
          if (prev <= 1) {
            clearInterval(speakingIntervalRef.current!);
            stopSpeaking();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopSpeaking = () => {
    setIsRecording(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
    }

    setSessionState(SessionState.COMPLETED);
  };

  const generateFeedback = async () => {
    if (!transcript.trim()) {
      alert("No speech detected. Please try again.");
      return;
    }

    setIsGeneratingFeedback(true);

    try {
      const prompt = `Analyze this JAM (Just A Minute) session performance and provide detailed feedback.

Topic: "${currentTopic}"
Transcript: "${transcript}"

Please provide feedback in the following JSON format:
{
  "overallScore": 85,
  "fluency": 80,
  "content": 90,
  "confidence": 85,
  "strengths": ["Good use of examples", "Clear articulation", "Stayed on topic"],
  "improvements": ["Could reduce filler words", "More structured approach"],
  "detailedFeedback": "Detailed paragraph about the performance..."
}

Evaluate based on:
1. Fluency and speech flow (0-100)
2. Content relevance and depth (0-100) 
3. Confidence and delivery (0-100)
4. Overall performance (0-100)

Focus on JAM-specific criteria: staying on topic, avoiding repetition, confident delivery, and engaging content within the time limit.`;

      const response = await aiService.generateResponse(prompt);

      if (response.success && response.data) {
        try {
          // Try to extract JSON from the response
          const jsonMatch = response.data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const feedbackData = JSON.parse(jsonMatch[0]);
            setFeedback(feedbackData);
          } else {
            // Enhanced fallback analysis based on actual speech content
            const contentAnalysis = analyzeTranscriptContent(transcript);
            setFeedback({
              ...contentAnalysis,
              detailedFeedback: response.data,
            });
          }
        } catch (parseError) {
          console.error("Failed to parse feedback JSON:", parseError);
          // Use transcript-based analysis as fallback
          const contentAnalysis = analyzeTranscriptContent(transcript);
          setFeedback({
            ...contentAnalysis,
            detailedFeedback:
              "Feedback generated successfully. Keep practicing to improve your JAM skills!",
          });
        }
      } else {
        throw new Error(response.error || "Failed to generate feedback");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      alert("Failed to generate feedback. Please try again.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const analyzeTranscriptContent = (transcript: string) => {
    const words = transcript
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;
    const uniqueWords = new Set(words).size;
    const averageWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / wordCount;

    // Calculate scores based on actual content
    const contentScore = Math.min(100, Math.max(30, (wordCount / 100) * 100)); // Based on word count
    const fluencyScore = Math.min(
      100,
      Math.max(40, (uniqueWords / wordCount) * 200)
    ); // Vocabulary diversity
    const confidenceScore = Math.min(100, Math.max(50, averageWordLength * 15)); // Word complexity
    const overallScore = Math.round(
      (contentScore + fluencyScore + confidenceScore) / 3
    );

    // Generate insights based on analysis
    const strengths = [];
    const improvements = [];

    if (wordCount > 80) strengths.push("Good content length and elaboration");
    if (uniqueWords / wordCount > 0.6) strengths.push("Rich vocabulary usage");
    if (averageWordLength > 4.5)
      strengths.push("Use of sophisticated language");

    if (wordCount < 50) improvements.push("Provide more detailed explanations");
    if (uniqueWords / wordCount < 0.4)
      improvements.push("Use more varied vocabulary");
    if (averageWordLength < 3.5)
      improvements.push("Include more specific terminology");

    // Ensure we have at least some feedback
    if (strengths.length === 0)
      strengths.push("Completed the speaking session");
    if (improvements.length === 0)
      improvements.push("Continue practicing to build confidence");

    return {
      overallScore,
      fluency: fluencyScore,
      content: contentScore,
      confidence: confidenceScore,
      strengths,
      improvements,
    };
  };

  const resetSession = () => {
    setSessionState(SessionState.TOPIC_DISPLAY);
    setCurrentTopic(getRandomJAMTopic());
    setPreparationTime(30);
    setSpeakingTime(60);
    setIsRecording(false);
    setAudioBlob(null);
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);

    if (preparationIntervalRef.current)
      clearInterval(preparationIntervalRef.current);
    if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  JAM Session
                </h2>
                <p className="text-sm text-gray-500">Just A Minute Practice</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {sessionState === SessionState.PREPARATION && (
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Prep: {formatTime(preparationTime)}
                </span>
              </div>
            )}

            {sessionState === SessionState.SPEAKING && (
              <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  Speaking: {formatTime(speakingTime)}
                </span>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center space-x-2 bg-red-500 px-3 py-2 rounded-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-sm font-medium text-white">
                  Recording
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {sessionState === SessionState.TOPIC_DISPLAY && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Your JAM Topic
              </h3>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-800 shadow-lg mb-6">
                <p className="text-xl font-semibold text-purple-900 leading-relaxed">
                  "{currentTopic}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      Preparation
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">30 sec</p>
                </div>

                <div className="bg-white/50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Mic className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      Speaking
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">1 min</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={startPreparation}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  Start JAM Session
                </button>

                <button
                  onClick={() => setCurrentTopic(getRandomJAMTopic())}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Get New Topic
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">
                JAM Rules & Tips
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Speak continuously for 1 minute</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Stay on the given topic</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Avoid long pauses and repetition</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Use the 30-second prep time wisely</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Speak clearly and confidently</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Use examples to support your points</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {sessionState === SessionState.PREPARATION && (
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-200">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">
                  {preparationTime}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Preparation Time
              </h3>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-yellow-100 dark:border-yellow-800 shadow-lg mb-6">
                <p className="text-lg font-semibold text-yellow-900 mb-2">
                  Your Topic:
                </p>
                <p className="text-xl text-gray-800">"{currentTopic}"</p>
              </div>

              <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Use this time to organize your thoughts, think of examples,
                  and structure your response.
                </p>
              </div>
            </div>
          </div>
        )}

        {sessionState === SessionState.SPEAKING && (
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 border border-red-200">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">
                  {speakingTime}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Speaking Time
              </h3>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-red-100 dark:border-red-800 shadow-lg mb-6">
                <p className="text-lg font-semibold text-red-900 mb-2">
                  Your Topic:
                </p>
                <p className="text-xl text-gray-800">"{currentTopic}"</p>
              </div>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-full text-white">
                  <Mic className="w-5 h-5" />
                  <span className="font-medium">Recording...</span>
                </div>

                {recognitionRef.current && (
                  <div className="flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-full text-white">
                    <Headphones className="w-5 h-5" />
                    <span className="font-medium">Listening</span>
                  </div>
                )}
              </div>

              <button
                onClick={stopSpeaking}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Stop Early
              </button>
            </div>

            {/* Live transcript - Always visible during speaking */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-blue-600" />
                Live Transcript
                {!transcript && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Start speaking...)
                  </span>
                )}
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100 min-h-32 max-h-48 overflow-y-auto">
                {transcript || interimTranscript ? (
                  <div className="text-base leading-relaxed">
                    <span className="text-gray-800">{transcript}</span>
                    <span className="text-blue-600 opacity-75">
                      {interimTranscript}
                    </span>
                    <span className="inline-block w-0.5 h-5 bg-blue-500 animate-pulse ml-1"></span>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-center py-4">
                    Your words will appear here as you speak...
                  </p>
                )}
              </div>
              {(transcript || interimTranscript) && (
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>
                    Word count:{" "}
                    {
                      (transcript + interimTranscript)
                        .trim()
                        .split(/\s+/)
                        .filter((word) => word.length > 0).length
                    }
                  </span>
                  <span className="text-blue-600">
                    {interimTranscript && "● Live transcription"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {sessionState === SessionState.COMPLETED && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Session Complete!
              </h3>
              <p className="text-gray-600">
                Great job completing your JAM session on "{currentTopic}"
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Speech Transcript
                </h4>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{transcript}</p>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {feedback ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart className="w-8 h-8 text-blue-600" />
                  <h4 className="text-2xl font-bold text-blue-900">
                    AI Feedback Analysis
                  </h4>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-sm text-gray-600 mb-1">Overall</p>
                    <p
                      className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(
                        feedback.overallScore
                      )}`}
                    >
                      {feedback.overallScore}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-sm text-gray-600 mb-1">Fluency</p>
                    <p
                      className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(
                        feedback.fluency
                      )}`}
                    >
                      {feedback.fluency}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-sm text-gray-600 mb-1">Content</p>
                    <p
                      className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(
                        feedback.content
                      )}`}
                    >
                      {feedback.content}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <p
                      className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(
                        feedback.confidence
                      )}`}
                    >
                      {feedback.confidence}
                    </p>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-6 border border-green-100">
                    <h5 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Strengths
                    </h5>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="text-green-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-orange-100">
                    <h5 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-2">
                      {feedback.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="text-orange-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-blue-100">
                  <h5 className="text-lg font-semibold text-blue-800 mb-3">
                    Detailed Analysis
                  </h5>
                  <p className="text-gray-700 leading-relaxed">
                    {feedback.detailedFeedback}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={generateFeedback}
                  disabled={isGeneratingFeedback || !transcript.trim()}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isGeneratingFeedback || !transcript.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isGeneratingFeedback ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Performance...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <BarChart className="w-6 h-6" />
                      <span>Get AI Feedback</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetSession}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <RotateCcw className="w-5 h-5" />
                <span>New Session</span>
              </button>

              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Back to Templates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
