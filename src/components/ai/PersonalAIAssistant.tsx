// Personal AI Learning Assistant with Memory Control - World Class
import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Brain,
  Trash2,
  Download,
  Upload,
  Settings,
  Sparkles,
  BookOpen,
  Code,
  Calculator,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Database,
  Zap,
  X,
} from "lucide-react";
import * as THREE from "three";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { db } from "../../config/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with proper API key
const getGeminiAI = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_GOOGLE_AI_API_KEY not found in environment variables"
    );
  }
  return new GoogleGenerativeAI(apiKey);
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  stored: boolean;
}

interface AssistantMemory {
  learningStyle?: string;
  strengths?: string[];
  weaknesses?: string[];
  goals?: string[];
  preferences?: Record<string, any>;
  conversationHistory?: Message[];
}

export const PersonalAIAssistant: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Memory control
  const [storeMemory, setStoreMemory] = useState(true);
  const [memory, setMemory] = useState<AssistantMemory>({});
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  // AI Settings
  const [showSettings, setShowSettings] = useState(false);
  const [aiPersonality, setAiPersonality] = useState<
    "tutor" | "friend" | "coach" | "expert"
  >("tutor");
  const [responseLength, setResponseLength] = useState<
    "concise" | "detailed" | "comprehensive"
  >("detailed");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadMemory();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Three.js particles background
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      3000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });

    const updateSize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    updateSize();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Create particles cloud
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const initialPositions = new Float32Array(particleCount * 3);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      initialPositions[i] = x;
      initialPositions[i + 1] = y;
      initialPositions[i + 2] = z;
      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      const color = new THREE.Color();
      color.setHSL(0.6, 0.8, 0.5 + Math.random() * 0.5);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.set(0, 0, 800);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = initialPositions[i3] + Math.sin(time + i * 0.01) * 50;
        positions[i3 + 1] =
          initialPositions[i3 + 1] + Math.cos(time * 0.7 + i * 0.01) * 50;
        positions[i3 + 2] =
          initialPositions[i3 + 2] + Math.sin(time * 0.5 + i * 0.01) * 30;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMemory = async () => {
    if (!user?.id || !storeMemory) return;

    try {
      const memoryDoc = await getDoc(doc(db, "aiAssistantMemory", user.id));
      if (memoryDoc.exists()) {
        const data = memoryDoc.data();
        setMemory(data as AssistantMemory);
        if (data.conversationHistory) {
          setMessages(
            data.conversationHistory.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error loading memory:", error);
    }
  };

  const saveMemory = async (
    newMessages: Message[],
    updatedMemory?: Partial<AssistantMemory>
  ) => {
    if (!user?.id || !storeMemory) return;

    try {
      const memoryRef = doc(db, "aiAssistantMemory", user.id);
      await setDoc(
        memoryRef,
        {
          ...memory,
          ...updatedMemory,
          conversationHistory: newMessages.map((msg) => ({
            ...msg,
            timestamp: msg.timestamp,
          })),
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving memory:", error);
    }
  };

  const clearMemory = async () => {
    if (!user?.id) return;

    if (
      confirm(
        "Are you sure you want to clear all conversation history and memory? This cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "aiAssistantMemory", user.id));
        setMemory({});
        setMessages([]);
      } catch (error) {
        console.error("Error clearing memory:", error);
      }
    }
  };

  const exportMemory = () => {
    const dataStr = JSON.stringify({ messages, memory }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-assistant-memory-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importMemory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setMessages(data.messages || []);
        setMemory(data.memory || {});
        if (storeMemory) {
          await saveMemory(data.messages || [], data.memory || {});
        }
      } catch (error) {
        alert("Error importing memory. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const getPersonalityPrompt = () => {
    const personalities = {
      tutor:
        "You are a patient, encouraging tutor who explains concepts step-by-step. You ask clarifying questions to ensure understanding and provide examples.",
      friend:
        "You are a supportive friend who helps with studying. You're casual, encouraging, and make learning fun with analogies and relatable examples.",
      coach:
        "You are a motivational coach focused on goals and progress. You challenge the user to push their limits and track their improvement.",
      expert:
        "You are an expert professor who provides deep, academic-level explanations. You use technical terminology and reference research.",
    };
    return personalities[aiPersonality];
  };

  const getLengthPrompt = () => {
    const lengths = {
      concise: "Keep responses brief and to the point (2-3 sentences).",
      detailed:
        "Provide balanced responses with explanations and examples (1-2 paragraphs).",
      comprehensive:
        "Give thorough, in-depth responses with multiple examples and detailed explanations.",
    };
    return lengths[responseLength];
  };

  const buildContext = () => {
    let context = `${getPersonalityPrompt()} ${getLengthPrompt()}\n\n`;

    if (storeMemory && memory) {
      if (memory.learningStyle) {
        context += `User's learning style: ${memory.learningStyle}\n`;
      }
      if (memory.strengths?.length) {
        context += `User's strengths: ${memory.strengths.join(", ")}\n`;
      }
      if (memory.weaknesses?.length) {
        context += `User's weaknesses: ${memory.weaknesses.join(", ")}\n`;
      }
      if (memory.goals?.length) {
        context += `User's goals: ${memory.goals.join(", ")}\n`;
      }
    }

    return context;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      stored: storeMemory,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const genAI = getGeminiAI();
      const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-pro";
      const model = genAI.getGenerativeModel({ model: modelName });

      // Build conversation history
      const history = newMessages.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: history.slice(0, -1),
        generationConfig: {
          maxOutputTokens:
            responseLength === "concise"
              ? 200
              : responseLength === "detailed"
              ? 500
              : 1000,
        },
      });

      const context = buildContext();
      const prompt = `${context}\n\nUser: ${input}`;

      const result = await chat.sendMessage(prompt);
      const response = result.response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        stored: storeMemory,
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Save to memory if enabled
      if (storeMemory) {
        await saveMemory(updatedMessages);
      }

      // Auto-detect and update memory
      await detectAndUpdateMemory(input, response);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        stored: false,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAndUpdateMemory = async (
    userInput: string,
    aiResponse: string
  ) => {
    if (!storeMemory) return;

    const inputLower = userInput.toLowerCase();
    const updatedMemory: Partial<AssistantMemory> = {};

    // Detect learning goals
    if (
      inputLower.includes("want to learn") ||
      inputLower.includes("goal is") ||
      inputLower.includes("studying")
    ) {
      const goals = memory.goals || [];
      if (!goals.includes(userInput)) {
        updatedMemory.goals = [...goals, userInput];
      }
    }

    // Detect struggles (weaknesses)
    if (
      inputLower.includes("struggling") ||
      inputLower.includes("difficult") ||
      inputLower.includes("don't understand")
    ) {
      const topic = userInput.split(" ").slice(0, 10).join(" ");
      const weaknesses = memory.weaknesses || [];
      if (!weaknesses.includes(topic)) {
        updatedMemory.weaknesses = [...weaknesses, topic];
      }
    }

    // Save updated memory
    if (Object.keys(updatedMemory).length > 0) {
      const newMemory = { ...memory, ...updatedMemory };
      setMemory(newMemory);
      await saveMemory(messages, updatedMemory);
    }
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const quickPrompts = [
    { icon: BookOpen, text: "Explain this concept", category: "Learn" },
    { icon: Code, text: "Help me debug code", category: "Code" },
    { icon: Calculator, text: "Solve this problem", category: "Math" },
    { icon: Lightbulb, text: "Give me study tips", category: "Tips" },
    { icon: Target, text: "Set learning goals", category: "Goals" },
    { icon: TrendingUp, text: "Track my progress", category: "Progress" },
  ];

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-white dark:bg-slate-900">
      {/* Three.js Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          zIndex: 0,
          opacity: 0.6,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Header */}
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 shadow-sm border-b border-gray-200 dark:border-slate-700 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bot className="w-12 h-12" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Personal AI Learning Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your 24/7 study companion with adaptive memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Memory Toggle */}
            <button
              onClick={() => setStoreMemory(!storeMemory)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {storeMemory ? (
                <Database className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {storeMemory ? "Memory On" : "Memory Off"}
              </span>
            </button>

            <button
              onClick={() => setShowMemoryPanel(!showMemoryPanel)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Brain className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Quick prompts */}
          {messages.length === 0 && (
            <div className="p-6 max-w-4xl mx-auto w-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Start
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt.text)}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
                  >
                    <prompt.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {prompt.category}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {prompt.text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <Clock className="w-3 h-3" />
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {message.stored && <Database className="w-3 h-3" />}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {user?.displayName?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative z-10">
            <div className="max-w-4xl mx-auto flex gap-3">
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`p-3 rounded-lg transition-colors ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
                placeholder="Ask me anything about your studies..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {!storeMemory && (
              <div className="max-w-4xl mx-auto mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <X className="w-4 h-4" />
                <span>Memory is off - this conversation won't be saved</span>
              </div>
            )}
          </div>
        </div>

        {/* Memory Panel */}
        {showMemoryPanel && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Memory & Context
                </h3>
                <button
                  onClick={() => setShowMemoryPanel(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {messages.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Messages
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {memory.goals?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Goals
                  </div>
                </div>
              </div>

              {/* Goals */}
              {memory.goals && memory.goals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Your Goals
                  </h4>
                  <div className="space-y-2">
                    {memory.goals.map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Target className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {memory.weaknesses && memory.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Focus Areas
                  </h4>
                  <div className="space-y-2">
                    {memory.weaknesses.map((weakness, idx) => (
                      <div
                        key={idx}
                        className="text-sm px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg"
                      >
                        {weakness}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={exportMemory}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Memory
                </button>

                <label className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Memory
                  <input
                    type="file"
                    accept=".json"
                    onChange={importMemory}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={clearMemory}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Memory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  AI Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Personality
                </label>
                <div className="space-y-2">
                  {(["tutor", "friend", "coach", "expert"] as const).map(
                    (personality) => (
                      <button
                        key={personality}
                        onClick={() => setAiPersonality(personality)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          aiPersonality === personality
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {personality}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {personality === "tutor" &&
                            "Patient, explains step-by-step"}
                          {personality === "friend" &&
                            "Casual, encouraging, fun"}
                          {personality === "coach" &&
                            "Motivational, goal-focused"}
                          {personality === "expert" &&
                            "Academic, technical, in-depth"}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Length
                </label>
                <div className="space-y-2">
                  {(["concise", "detailed", "comprehensive"] as const).map(
                    (length) => (
                      <button
                        key={length}
                        onClick={() => setResponseLength(length)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          responseLength === length
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {length === "concise" && "Brief, 2-3 sentences"}
                          {length === "detailed" && "Balanced, 1-2 paragraphs"}
                          {length === "comprehensive" &&
                            "In-depth, thorough explanations"}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
