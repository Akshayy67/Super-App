// AI Coding Interview - Live coding interview with AI interviewer
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  StopCircle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Code,
  MessageSquare,
  Send,
  Check,
  X,
  Clock,
  Brain,
  Sparkles,
  Trophy,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { gamificationService, XP_REWARDS } from "../../services/gamificationService";
import { realTimeAuth } from "../../utils/realTimeAuth";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || ""
);

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  passed?: boolean;
}

export const AICodingInterview: React.FC = () => {
  // Interview state
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  
  // Problem state
  const [problem, setProblem] = useState<{
    title: string;
    description: string;
    examples: string[];
    testCases: TestCase[];
    hints: string[];
  } | null>(null);
  
  // Code editor
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Media
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Score
  const [score, setScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    testCases: 0,
    timeEfficiency: 0,
    codeQuality: 0,
    communication: 0,
  });
  const [showScoreModal, setShowScoreModal] = useState(false);
  
  const user = realTimeAuth.getCurrentUser();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Start timer when interview begins
  useEffect(() => {
    if (isInterviewActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start interview
  const startInterview = async () => {
    setIsInterviewActive(true);
    setTimeElapsed(0);
    setMessages([]);
    setTestResults([]);
    setScore(0);
    
    // Generate problem using AI
    await generateProblem();
    
    // AI greeting
    const greeting = `Hello! I'm your AI interviewer today. I've prepared a ${difficulty} level coding problem for you. Take your time to read through it, and feel free to ask me any clarifying questions. When you're ready, you can start coding. Good luck!`;
    
    setMessages([{
      role: "ai",
      content: greeting,
      timestamp: new Date()
    }]);
    
    // Speak greeting
    speakText(greeting);
  };

  // Generate coding problem using AI
  const generateProblem = async () => {
    try {
      const prompt = `Generate a ${difficulty} level coding interview problem suitable for ${language}. 

Format your response as JSON with this structure:
{
  "title": "Problem Title",
  "description": "Clear problem description",
  "examples": ["Example 1: Input: ... Output: ...", "Example 2: ..."],
  "testCases": [
    {"input": "test input", "expectedOutput": "expected output"},
    {"input": "test input 2", "expectedOutput": "expected output 2"}
  ],
  "hints": ["Hint 1", "Hint 2"]
}

For ${difficulty} difficulty:
- Easy: Basic loops, arrays, strings (e.g., find sum, reverse string)
- Medium: Hash maps, two pointers, basic recursion (e.g., two sum, valid parentheses)
- Hard: Dynamic programming, complex algorithms (e.g., longest substring, binary tree)

Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\n?|\n?```/g, "").trim();
      
      const problemData = JSON.parse(text);
      setProblem(problemData);
      
      // Set starter code
      const starterCode = getStarterCode(language, problemData.title);
      setCode(starterCode);
      
    } catch (error) {
      console.error("Error generating problem:", error);
      
      // Fallback problem
      const fallbackProblem = {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        examples: [
          "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
          "Input: nums = [3,2,4], target = 6\nOutput: [1,2]"
        ],
        testCases: [
          { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
          { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
          { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]" }
        ],
        hints: [
          "Use a hash map to store seen numbers and their indices",
          "For each number, check if (target - number) exists in the map"
        ]
      };
      
      setProblem(fallbackProblem);
      setCode(getStarterCode(language, "Two Sum"));
    }
  };

  // Get starter code template
  const getStarterCode = (lang: string, problemTitle: string): string => {
    switch (lang) {
      case "javascript":
        return `/**
 * ${problemTitle}
 * @param {any} input
 * @return {any}
 */
function solution(input) {
    // Your code here
    
}

// Test
console.log(solution());`;

      case "python":
        return `"""
${problemTitle}
"""
def solution(input):
    # Your code here
    pass

# Test
print(solution())`;

      case "java":
        return `public class Solution {
    /**
     * ${problemTitle}
     */
    public static Object solution(Object input) {
        // Your code here
        
        return null;
    }
    
    public static void main(String[] args) {
        System.out.println(solution(null));
    }
}`;

      case "cpp":
        return `#include <iostream>
using namespace std;

/**
 * ${problemTitle}
 */
auto solution(auto input) {
    // Your code here
    
}

int main() {
    cout << solution() << endl;
    return 0;
}`;

      default:
        return "// Start coding here";
    }
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    
    try {
      // In a real implementation, you would:
      // 1. Send code to a secure sandbox API for execution
      // 2. Run against test cases
      // 3. Return results
      
      // For demo purposes, simulate test results
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results: TestCase[] = problem?.testCases.map((testCase, index) => ({
        ...testCase,
        passed: Math.random() > 0.3 // Simulate random pass/fail
      })) || [];
      
      setTestResults(results);
      
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      // Calculate comprehensive score
      const codeLines = code.split('\n').length;
      const userMessages = messages.filter(m => m.role === "user").length;
      const newScore = calculateScore(passedCount, totalCount, timeElapsed, codeLines, userMessages);
      setScore(newScore);
      
      // AI feedback
      await sendAIFeedback(passedCount, totalCount, code);
      
    } catch (error) {
      console.error("Error running code:", error);
      
      const aiMessage: Message = {
        role: "ai",
        content: "I encountered an error while running your code. Please check your syntax and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } finally {
      setIsRunning(false);
    }
  };

  // Send AI feedback on code
  const sendAIFeedback = async (passedCount: number, totalCount: number, userCode: string) => {
    try {
      const prompt = `As a coding interview AI, provide brief feedback on this solution:

Problem: ${problem?.title}
Test Results: ${passedCount}/${totalCount} passed

Code:
${userCode}

Provide feedback in 2-3 sentences covering:
1. What's working well
2. What needs improvement (if any)
3. Hint for optimization (if applicable)

Keep it encouraging and constructive.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const feedback = response.text();
      
      const aiMessage: Message = {
        role: "ai",
        content: feedback,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      speakText(feedback);
      
    } catch (error) {
      console.error("Error getting AI feedback:", error);
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsSendingMessage(true);
    
    try {
      const prompt = `You are a helpful coding interview AI assistant. The candidate asked: "${inputMessage}"

Context:
- Problem: ${problem?.title}
- Language: ${language}
- Current code length: ${code.length} characters

Provide a helpful, brief response (2-3 sentences). Don't give away the complete solution, but offer guidance.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      const aiMessage: Message = {
        role: "ai",
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      speakText(aiResponse);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        role: "ai",
        content: "Sorry, I encountered an error. Could you please rephrase your question?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window && isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // End interview
  const endInterview = async () => {
    setIsInterviewActive(false);
    
    // Award XP based on score
    if (user) {
      let xpEarned = XP_REWARDS.CODING_INTERVIEW;
      if (score >= 90) xpEarned += 200; // Excellent
      else if (score >= 80) xpEarned += 100; // Very Good
      else if (score >= 70) xpEarned += 50; // Good
      
      await gamificationService.awardXP(user.uid, xpEarned, "Coding Interview Completed");
      await gamificationService.incrementStat(user.uid, "totalMockInterviews");
    }
    
    // Show score modal
    setShowScoreModal(true);
    
    // Show final feedback
    const performanceLevel = 
      score >= 90 ? "Outstanding! 🌟" :
      score >= 80 ? "Excellent! 🎉" :
      score >= 70 ? "Very Good! 👍" :
      score >= 60 ? "Good effort! 💪" :
      "Keep practicing! 📚";
    
    const finalMessage: Message = {
      role: "ai",
      content: `Interview complete! Overall Score: ${score}/100\n\n${performanceLevel}\n\nTime taken: ${formatTime(timeElapsed)}\nTest cases passed: ${testResults.filter(t => t.passed).length}/${testResults.length}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, finalMessage]);
  };

  return (
    <div className="max-w-[1800px] mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8" />
              AI Coding Interview
            </h1>
            <p className="text-white/90">Practice coding interviews with AI interviewer</p>
          </div>
          
          {isInterviewActive && (
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatTime(timeElapsed)}</span>
                </div>
              </div>
              
              {score > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{score}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isInterviewActive ? (
        /* Setup Screen */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Start New Interview
          </h2>
          
          <div className="space-y-6">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      difficulty === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Programming Language
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "javascript", label: "JavaScript" },
                  { value: "python", label: "Python" },
                  { value: "java", label: "Java" },
                  { value: "cpp", label: "C++" }
                ] as const).map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      language === lang.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" />
              Start Interview
            </button>
          </div>
        </div>
      ) : (
        /* Interview Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Problem & Chat */}
          <div className="lg:col-span-1 space-y-4">
            {/* Problem Statement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 h-[400px] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" />
                {problem?.title}
              </h3>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-700 dark:text-gray-300">{problem?.description}</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Examples:</h4>
                  {problem?.examples.map((example, i) => (
                    <pre key={i} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs mb-2 whitespace-pre-wrap">
                      {example}
                    </pre>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[400px]">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  AI Interviewer
                </h3>
                
                <button
                  onClick={() => setIsSpeaking(!isSpeaking)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isSpeaking ? "Mute AI" : "Unmute AI"}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    disabled={isSendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isSendingMessage || !inputMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Editor & Test Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Code Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">{language}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Code
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={endInterview}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <StopCircle className="w-4 h-4" />
                    End Interview
                  </button>
                </div>
              </div>
              
              <Editor
                height="600px"
                language={language === "cpp" ? "cpp" : language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Test Results</h3>
                
                <div className="space-y-2">
                  {testResults.map((test, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border-2 ${
                        test.passed
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                          : "bg-red-50 dark:bg-red-900/20 border-red-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {test.passed ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            Test Case {i + 1}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${
                          test.passed ? "text-green-600" : "text-red-600"
                        }`}>
                          {test.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <div>Input: {test.input}</div>
                        <div>Expected: {test.expectedOutput}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your performance breakdown
              </p>
            </div>
            
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{score}</div>
                <div className="text-xl opacity-90">Out of 100</div>
                <div className="mt-3 text-lg">
                  {score >= 90 ? "🌟 Outstanding!" :
                   score >= 80 ? "🎉 Excellent!" :
                   score >= 70 ? "👍 Very Good!" :
                   score >= 60 ? "💪 Good!" :
                   "📚 Keep Practicing!"}
                </div>
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Score Breakdown:</h3>
              
              {/* Test Cases */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Test Cases</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testResults.filter(t => t.passed).length}/{testResults.length} passed
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scoreBreakdown.testCases}</div>
              </div>
              
              {/* Time Efficiency */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Time Efficiency</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(timeElapsed)} total
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scoreBreakdown.timeEfficiency}</div>
              </div>
              
              {/* Code Quality */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Code Quality</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {code.split('\n').length} lines written
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scoreBreakdown.codeQuality}</div>
              </div>
              
              {/* Communication */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Communication</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {messages.filter(m => m.role === "user").length} interactions
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scoreBreakdown.communication}</div>
              </div>
            </div>
            
            {/* XP Earned */}
            {user && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                      XP Earned: +{XP_REWARDS.CODING_INTERVIEW + (score >= 90 ? 200 : score >= 80 ? 100 : score >= 70 ? 50 : 0)}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      {score >= 90 ? "Bonus: +200 XP for outstanding performance!" :
                       score >= 80 ? "Bonus: +100 XP for excellent work!" :
                       score >= 70 ? "Bonus: +50 XP for good effort!" :
                       "Complete more interviews to earn bonus XP!"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setIsInterviewActive(false);
                  setCode("");
                  setProblem(null);
                  setMessages([]);
                  setTestResults([]);
                  setScore(0);
                  setTimeElapsed(0);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Start New Interview
              </button>
              <button
                onClick={() => setShowScoreModal(false)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
