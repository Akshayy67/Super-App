import React, { useState, useEffect, useRef } from "react";
import {
  Code,
  Users,
  Play,
  Save,
  Download,
  Upload,
  MessageSquare,
  Video,
  Monitor,
  RefreshCw,
  Settings,
  X,
  Send,
  Copy,
  Check,
  User,
  Crown,
  Eye,
  LogOut,
  History,
  Plus,
  RotateCcw,
  Maximize2,
  Minimize2,
  Terminal,
} from "lucide-react";
import {
  pairProgrammingService,
  PairProgrammingSession,
  Participant,
  ChatMessage,
} from "../../utils/pairProgrammingService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { CodeEditor } from "./CodeEditor";
import { codeExecutionService } from "../../utils/codeExecutionService";

interface PairProgrammingProps {
  teamId: string;
  sessionId?: string;
  onClose?: () => void;
}

export const PairProgramming: React.FC<PairProgrammingProps> = ({
  teamId,
  sessionId: initialSessionId,
  onClose,
}) => {
  const [sessions, setSessions] = useState<PairProgrammingSession[]>([]);
  const [currentSession, setCurrentSession] =
    useState<PairProgrammingSession | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionLanguage, setNewSessionLanguage] = useState("javascript");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = realTimeAuth.getCurrentUser();

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [teamId]);

  // Subscribe to session updates when a session is selected
  useEffect(() => {
    if (initialSessionId) {
      joinExistingSession(initialSessionId);
    }
  }, [initialSessionId]);

  useEffect(() => {
    if (!currentSession) return;

    const unsubscribe = pairProgrammingService.subscribeToSession(
      currentSession.id,
      (updatedSession) => {
        if (updatedSession) {
          setCurrentSession(updatedSession);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentSession?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession?.chat, showChat]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const loadedSessions = await pairProgrammingService.getTeamSessions(
        teamId,
        false
      );
      setSessions(loadedSessions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinExistingSession = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await pairProgrammingService.getSession(sessionId);
      if (!session) {
        setError("Session not found");
        return;
      }

      // Join the session if not already a participant
      if (user && !session.participants[user.id]) {
        await pairProgrammingService.joinSession(sessionId);
        // Reload session to get updated data
        const updatedSession = await pairProgrammingService.getSession(
          sessionId
        );
        setCurrentSession(updatedSession);
      } else {
        setCurrentSession(session);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!newSessionTitle.trim()) {
      setError("Please enter a session title");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await pairProgrammingService.createSession(
        teamId,
        newSessionTitle,
        newSessionLanguage,
        newSessionDescription
      );
      setCurrentSession(session);
      setShowCreateSession(false);
      setNewSessionTitle("");
      setNewSessionDescription("");
      setNewSessionLanguage("javascript");
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await pairProgrammingService.leaveSession(currentSession.id);
      setCurrentSession(null);
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await pairProgrammingService.endSession(currentSession.id);
      setCurrentSession(null);
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchDriver = async (newDriverId: string) => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await pairProgrammingService.switchRoles(currentSession.id, newDriverId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentSession || !chatMessage.trim()) return;

    try {
      await pairProgrammingService.sendMessage(currentSession.id, chatMessage);
      setChatMessage("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCodeChange = async (newCode: string) => {
    if (!currentSession) return;
    await pairProgrammingService.updateCode(currentSession.id, newCode);
  };

  const saveSnapshot = async () => {
    if (!currentSession) return;
    try {
      await pairProgrammingService.updateCode(
        currentSession.id,
        currentSession.code,
        true
      );
      setError(null);
      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      successMsg.textContent = "Snapshot saved!";
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downloadCode = () => {
    if (!currentSession) return;
    const element = document.createElement("a");
    const file = new Blob([currentSession.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    const ext = getFileExtension(currentSession.language);
    element.download = `${currentSession.title}.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyCode = async () => {
    if (!currentSession) return;
    try {
      await navigator.clipboard.writeText(currentSession.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getFileExtension = (language: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      html: "html",
      css: "css",
    };
    return extensions[language] || "txt";
  };

  const runCode = async () => {
    if (!currentSession) return;
    
    setIsRunning(true);
    setShowConsole(true);
    setConsoleOutput(['⏳ Executing code...']);

    try {
      const language = currentSession.language.toLowerCase();
      let result;

      // Analyze code complexity first
      const complexity = codeExecutionService.analyzeComplexity(currentSession.code, language);

      // Use different execution methods based on language
      if (language === 'javascript' || language === 'typescript') {
        // Execute JavaScript locally for instant feedback
        result = codeExecutionService.executeJavaScriptLocally(currentSession.code);
        result.complexity = complexity;
      } else if (language === 'html') {
        // Open HTML in new window
        result = codeExecutionService.executeHTML(currentSession.code);
      } else if (language === 'css') {
        // Preview CSS with sample HTML
        result = codeExecutionService.executeCSS(currentSession.code);
      } else if (codeExecutionService.isLanguageSupported(language)) {
        // Use Piston API for other languages
        setConsoleOutput([
          '⏳ Executing code on remote server...',
          '💡 This may take a few seconds...'
        ]);
        
        result = await codeExecutionService.executeCode({
          language,
          code: currentSession.code,
        });

        // Add complexity analysis
        result.complexity = complexity;

        // Add execution time if available
        if (result.executionTime) {
          result.output.push('');
          result.output.push(`⚡ Execution time: ${result.executionTime}ms`);
        }
      } else {
        // Language not supported
        result = {
          success: false,
          output: [
            `⚠️ "${language}" is not yet configured for execution.`,
            '',
            '✅ Supported languages:',
            ...codeExecutionService.getSupportedLanguages().map(lang => `  • ${lang}`),
            '',
            '💡 You can still:',
            '  • Write and edit code collaboratively',
            '  • Save code snapshots',
            '  • Download code to run locally',
            '  • Copy code to clipboard',
          ],
        };
      }

      // Add complexity analysis to output if available
      if (result.complexity) {
        result.output.push('');
        result.output.push('📊 Complexity Analysis:');
        result.output.push(`   Time:  ${result.complexity.time}`);
        result.output.push(`   Space: ${result.complexity.space}`);
        result.output.push('');
        result.output.push(...result.complexity.analysis);
      }

      setConsoleOutput(result.output);
      
      // Send execution result to chat if successful
      if (result.success && currentSession) {
        await pairProgrammingService.sendMessage(
          currentSession.id,
          `✅ Code executed successfully by ${user?.username || user?.email} | Time: ${result.complexity?.time || 'N/A'} | Space: ${result.complexity?.space || 'N/A'}`,
          'system'
        );
      }
    } catch (err: any) {
      setConsoleOutput([
        `❌ Execution error: ${err.message}`,
        '',
        '💡 Tips:',
        '  • Check your internet connection',
        '  • Verify your code syntax',
        '  • Try running again',
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const getCurrentUserRole = (): string | null => {
    if (!currentSession || !user) return null;
    const participant = currentSession.participants[user.id];
    return participant?.role || null;
  };

  const isDriver = getCurrentUserRole() === "driver";
  const isCreator = currentSession?.createdBy === user?.id;

  // Session List View
  if (!currentSession) {
    return (
      <div className="h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Pair Programming
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Collaborate in real-time with your team
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateSession(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No active sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a new pair programming session to get started
              </p>
              <button
                onClick={() => setShowCreateSession(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                Create Your First Session
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-6 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
                onClick={() => joinExistingSession(session.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {session.title}
                    </h3>
                    {session.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      session.status === "active"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    <span>{session.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {Object.keys(session.participants).length} participants
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    by {session.creatorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Session Modal */}
        {showCreateSession && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Create New Session
                  </h3>
                  <button
                    onClick={() => setShowCreateSession(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder="e.g., Feature Implementation"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Programming Language
                  </label>
                  <select
                    value={newSessionLanguage}
                    onChange={(e) => setNewSessionLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <optgroup label="Web Development">
                      <option value="javascript">JavaScript ⚡</option>
                      <option value="typescript">TypeScript ⚡</option>
                      <option value="html">HTML ⚡</option>
                      <option value="css">CSS ⚡</option>
                      <option value="php">PHP 🚀</option>
                    </optgroup>
                    <optgroup label="Popular Languages">
                      <option value="python">Python 🚀</option>
                      <option value="java">Java 🚀</option>
                      <option value="cpp">C++ 🚀</option>
                      <option value="c">C 🚀</option>
                      <option value="csharp">C# 🚀</option>
                      <option value="go">Go 🚀</option>
                      <option value="rust">Rust 🚀</option>
                      <option value="ruby">Ruby 🚀</option>
                      <option value="swift">Swift 🚀</option>
                      <option value="kotlin">Kotlin 🚀</option>
                    </optgroup>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ⚡ = Runs instantly in browser | 🚀 = Runs on cloud server
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    placeholder="What are you working on?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                <button
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createSession}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Session"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Session View
  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      } bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={leaveSession}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Leave Session"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentSession.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentSession.language}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run Code"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-sm">Run</span>
          </button>
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors ${
              showConsole ? "bg-gray-100 dark:bg-slate-700" : ""
            }`}
            title="Toggle Console"
          >
            <Terminal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-slate-600" />
          <button
            onClick={saveSnapshot}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Save Snapshot"
          >
            <Save className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={downloadCode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Download Code"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={copyCode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors ${
              showHistory ? "bg-gray-100 dark:bg-slate-700" : ""
            }`}
            title="Code History"
          >
            <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          {isCreator && (
            <button
              onClick={endSession}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex flex-col min-h-0">
            <CodeEditor
              code={currentSession.code}
              language={currentSession.language}
              onChange={handleCodeChange}
              readOnly={!isDriver}
              cursors={Object.values(currentSession.cursors)}
              onCursorChange={(line, column) => {
                if (currentSession) {
                  pairProgrammingService.updateCursor(
                    currentSession.id,
                    line,
                    column
                  );
                }
              }}
            />
            {!isDriver && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm text-center">
                You are in observer mode. Only the driver can edit the code.
              </div>
            )}
          </div>

          {/* Console Output */}
          {showConsole && (
            <div className="h-48 border-t border-gray-200 dark:border-slate-700 bg-slate-900 flex flex-col">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-gray-300">Console Output</span>
                </div>
                <button
                  onClick={() => setConsoleOutput([])}
                  className="px-2 py-1 text-xs bg-slate-700 text-gray-300 rounded hover:bg-slate-600 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-500 italic">
                    Click "Run" to execute your code...
                  </div>
                ) : (
                  consoleOutput.map((line, index) => (
                    <div
                      key={index}
                      className={`${
                        line.startsWith("❌")
                          ? "text-red-400"
                          : line.startsWith("⚠️")
                          ? "text-yellow-400"
                          : line.startsWith("✅")
                          ? "text-green-400"
                          : line.startsWith("💡")
                          ? "text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-gray-200 dark:border-slate-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => {
                setShowParticipants(true);
                setShowChat(false);
                setShowHistory(false);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                showParticipants
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Team
            </button>
            <button
              onClick={() => {
                setShowParticipants(false);
                setShowChat(true);
                setShowHistory(false);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                showChat
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
          </div>

          {/* Participants Panel */}
          {showParticipants && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Object.values(currentSession.participants).map((participant) => (
                <div
                  key={participant.id}
                  className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: participant.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {participant.name}
                      </span>
                      {participant.id === currentSession.createdBy && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        participant.role === "driver"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : participant.role === "navigator"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {participant.role}
                    </span>
                  </div>
                  {participant.role !== "driver" && (isDriver || isCreator) && (
                    <button
                      onClick={() => switchDriver(participant.id)}
                      className="w-full px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Make Driver
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentSession.chat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${
                      msg.type === "system"
                        ? "text-center text-sm text-gray-500 dark:text-gray-400 italic"
                        : ""
                    }`}
                  >
                    {msg.type !== "system" && (
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {msg.userName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div
                            className={`p-2 rounded-lg ${
                              msg.type === "code"
                                ? "bg-slate-900 text-white font-mono text-sm"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <pre className="whitespace-pre-wrap break-words">
                              {msg.message}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                    {msg.type === "system" && <span>{msg.message}</span>}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatMessage.trim()}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Code History Modal */}
      {showHistory && currentSession.codeHistory.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Code History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentSession.codeHistory.map((snapshot, index) => (
                <div
                  key={snapshot.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Snapshot #{currentSession.codeHistory.length - index}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {snapshot.userName} •{" "}
                        {snapshot.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await pairProgrammingService.updateCode(
                          currentSession.id,
                          snapshot.code
                        );
                        setShowHistory(false);
                      }}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-1" />
                      Restore
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-white p-4 rounded text-sm overflow-x-auto">
                    <code>{snapshot.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

