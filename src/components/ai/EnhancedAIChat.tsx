import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader,
  Brain,
  FileText,
  Image as ImageIcon,
  Plus,
  MessageSquare,
  Camera,
  Upload,
  X,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { unifiedAIService } from "../../utils/aiConfig";
import { driveStorageUtils } from "../../utils/driveStorage";
import { AIStatus } from "../notifications/AIStatus";
import { extractTextFromPdfDataUrl } from "../../utils/pdfText";
import { dreamToPlanService } from "../../utils/dreamToPlanService";
import type { DreamToPlanResult } from "../../utils/journalService";
import { CheckCircle2, Calendar, Bell, ListTodo, Sparkles as SparklesIcon, Users, Mail } from "lucide-react";

type ChatMessage = {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  context?: string;
  imageUrl?: string;
  pdfUrl?: string;
  fileName?: string;
  isImageGeneration?: boolean;
  usedConversationContext?: boolean;
  contextualReferences?: string[];
  dreamToPlanResult?: DreamToPlanResult;
};

type ChatType = "study" | "research" | "general" | "creative" | "coding" | "business" | "dream-to-plan";

type ChatSession = {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  lastUpdated: string;
  chatType?: ChatType;
};

interface EnhancedAIChatProps {
  file?: any;
  fileContent?: string;
  initialPrompt?: string;
}

export const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({
  file,
  fileContent,
  initialPrompt,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [fileContextText, setFileContextText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [uploadedPdf, setUploadedPdf] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showChatTypeModal, setShowChatTypeModal] = useState(false);
  const [showDreamToPlanModal, setShowDreamToPlanModal] = useState(false);
  const [currentDreamToPlanResult, setCurrentDreamToPlanResult] = useState<DreamToPlanResult | null>(null);
  const [teamFormData, setTeamFormData] = useState<{ name: string; emails: string[]; currentEmail: string }>({
    name: "",
    emails: [],
    currentEmail: "",
  });
  const [meetingFormData, setMeetingFormData] = useState<{ [key: number]: { date: string; time: string } }>({});
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get chat type specific greeting
  const getChatTypeGreeting = (chatType?: ChatType): string => {
    switch (chatType) {
      case "study":
        return "Hello! I'm your AI Study Assistant. I specialize in helping you understand complex topics, create study materials, summarize content, and prepare for exams. How can I help with your studies today?";
      case "research":
        return "Hello! I'm your AI Research Assistant. I can help you analyze information, organize research findings, generate hypotheses, and provide detailed explanations. What research topic are you working on?";
      case "general":
        return "Hello! I'm your AI General Assistant. I can help with questions, provide information, have conversations, and assist with various tasks. What can I help you with?";
      case "creative":
        return "Hello! I'm your AI Creative Assistant. I specialize in brainstorming ideas, creative writing, storytelling, and imaginative problem-solving. What creative project are you working on?";
      case "coding":
        return "Hello! I'm your AI Coding Assistant. I can help you understand code, debug issues, explain algorithms, and provide programming guidance. What coding challenge can I help with?";
      case "business":
        return "Hello! I'm your AI Business Assistant. I can help with strategy, analysis, planning, presentations, and professional communication. What business task can I assist with?";
      case "dream-to-plan":
        return "Hello! I'm your Dream-to-Plan Assistant. Share your dreams, goals, journal entries, or plans in natural language, and I'll help you transform them into actionable todos, schedule meetings, and add items to your calendar. What would you like to plan today?";
      default:
        return "Hello! I'm your AI assistant. To provide you with the best experience, please select a chat type from the options. What would you like help with today?";
    }
  };

  // Get context-specific system prompt
  const getContextPrompt = (chatType?: ChatType): string => {
    switch (chatType) {
      case "study":
        return "You are a specialized study assistant. Focus on educational explanations, learning techniques, memory aids, and academic support. Break down complex topics into understandable parts.";
      case "research":
        return "You are a research assistant. Provide detailed, analytical responses with focus on accuracy, citations when relevant, and thorough exploration of topics. Help organize and synthesize information.";
      case "general":
        return "You are a helpful general assistant. Provide clear, accurate, and friendly responses to a wide range of questions.";
      case "creative":
        return "You are a creative assistant. Think imaginatively, help brainstorm ideas, and provide creative solutions. Encourage artistic and innovative thinking.";
      case "coding":
        return "You are a coding assistant. Provide technical explanations, help debug code, explain algorithms clearly, and offer best practices in programming.";
      case "business":
        return "You are a business assistant. Focus on professional communication, strategic thinking, data analysis, and practical business solutions.";
      case "dream-to-plan":
        return "You are a Dream-to-Plan assistant. Analyze journal entries, dreams, goals, and plans to extract actionable goals, todos, meetings, and calendar events. When users share their thoughts or plans, identify what should be added to todos, scheduled as meetings, or added to the calendar. Always ask for confirmation before creating items.";
      default:
        return "";
    }
  };

  // Initialize with a default session
  useEffect(() => {
    const defaultSession: ChatSession = {
      id: "default",
      name: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setSessions([defaultSession]);
    setCurrentSessionId("default");
    setShowChatTypeModal(true);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showHistoryDropdown &&
        !(event.target as Element).closest(".history-dropdown")
      ) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistoryDropdown]);

  // Process initial prompt
  useEffect(() => {
    if (initialPrompt && currentSessionId) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, currentSessionId]);

  const getCurrentSession = () => {
    return sessions.find((s) => s.id === currentSessionId);
  };

  const addMessage = (
    type: "user" | "ai",
    content: string,
    context?: string,
    imageUrl?: string,
    pdfUrl?: string,
    fileName?: string,
    isImageGeneration?: boolean,
    usedConversationContext?: boolean,
    contextualReferences?: string[]
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      context,
      imageUrl,
      pdfUrl,
      fileName,
      isImageGeneration,
      usedConversationContext,
      contextualReferences,
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              lastUpdated: new Date().toISOString(),
            }
          : session
      )
    );
  };

  // Helper function to detect contextual references in user messages
  const detectContextualReferences = (message: string): string[] => {
    const contextualPhrases = [
      "above",
      "that",
      "earlier",
      "previous",
      "before",
      "last",
      "recent",
      "you said",
      "you mentioned",
      "referring to",
      "based on what",
      "from what you",
      "in your",
      "your response",
      "your answer",
      "the explanation",
      "the example",
      "the concept",
      "this topic",
      "elaborate",
      "simplify",
      "clarify",
      "expand on",
      "more about",
    ];

    const foundReferences: string[] = [];
    const lowerMessage = message.toLowerCase();

    contextualPhrases.forEach((phrase) => {
      if (lowerMessage.includes(phrase)) {
        foundReferences.push(phrase);
      }
    });

    return foundReferences;
  };

  // Helper function to build conversation history for AI context
  const buildConversationHistory = (
    maxMessages: number = 8
  ): Array<{ role: string; content: string }> => {
    const currentSession = getCurrentSession();
    if (!currentSession) return [];

    // Get the last N messages (excluding the current one being processed)
    const recentMessages = currentSession.messages.slice(-maxMessages);

    return recentMessages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  };

  // Helper function to determine if conversation context should be used
  const shouldUseConversationContext = (
    message: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): boolean => {
    // Use context if there are previous messages and the message contains contextual references
    const hasHistory = conversationHistory.length > 0;
    const hasContextualReferences =
      detectContextualReferences(message).length > 0;

    // Also use context for follow-up questions or when the message is short and might be referencing previous content
    const isLikelyFollowUp = message.length < 50 && hasHistory;

    return hasHistory && (hasContextualReferences || isLikelyFollowUp);
  };

  const createNewSession = (chatType?: ChatType) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: chatType ? `${chatType.charAt(0).toUpperCase() + chatType.slice(1)} Chat` : `Chat ${sessions.length + 1}`,
      messages: chatType ? [
        {
          id: "1",
          type: "ai",
          content: getChatTypeGreeting(chatType),
          timestamp: new Date().toISOString(),
        },
      ] : [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      chatType,
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setUploadedImage("");
    setUploadedPdf("");
    setUploadedFileName("");
    setShowChatTypeModal(false);
  };

  const handleNewChatClick = () => {
    setShowChatTypeModal(true);
  };

  const selectChatType = (chatType: ChatType) => {
    // Update current session if it's the default without messages
    const currentSession = getCurrentSession();
    if (currentSession && currentSession.id === "default" && currentSession.messages.length === 0) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === "default"
            ? {
                ...session,
                chatType,
                name: `${chatType.charAt(0).toUpperCase() + chatType.slice(1)} Chat`,
                messages: [
                  {
                    id: "1",
                    type: "ai",
                    content: getChatTypeGreeting(chatType),
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : session
        )
      );
      setShowChatTypeModal(false);
    } else {
      createNewSession(chatType);
    }
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setUploadedImage("");
    setUploadedPdf("");
    setUploadedFileName("");
    setShowHistoryDropdown(false);
  };

  const getRecentSessions = () => {
    return sessions
      .sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
      .slice(0, 5);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    if (session.messages.length === 0) {
      return "New chat";
    }
    const lastMessage = session.messages[session.messages.length - 1];
    return (
      lastMessage.content.slice(0, 50) +
      (lastMessage.content.length > 50 ? "..." : "")
    );
  };

  const deleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return; // Keep at least one session

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      if (file.type.startsWith("image/")) {
        setUploadedImage(result);
        setUploadedPdf("");
        setUploadedFileName("");
      } else if (file.type === "application/pdf") {
        setUploadedPdf(result);
        setUploadedImage("");
        setUploadedFileName(file.name);
      }
      setShowFileUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || inputMessage.trim();
    if ((!userMessage && !uploadedImage && !uploadedPdf) || isLoading) return;

    const currentSession = getCurrentSession();
    const contextPrompt = getContextPrompt(currentSession?.chatType);

    setInputMessage("");

    // Detect contextual references before adding the user message
    const contextualReferences = detectContextualReferences(userMessage);

    // Add user message with file attachment if present
    if (uploadedImage) {
      addMessage(
        "user",
        userMessage || "Please analyze this image",
        undefined,
        uploadedImage,
        undefined,
        undefined,
        undefined,
        undefined,
        contextualReferences
      );
    } else if (uploadedPdf) {
      addMessage(
        "user",
        userMessage || "Please analyze this PDF",
        undefined,
        undefined,
        uploadedPdf,
        uploadedFileName,
        undefined,
        undefined,
        contextualReferences
      );
    } else {
      addMessage(
        "user",
        userMessage,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        contextualReferences
      );
    }

    setIsLoading(true);

    try {
      // Check if this is an image generation request
      const isImageRequest =
        /\b(generate|create|make|draw|show me)\s+(an?\s+)?(image|picture|photo|drawing|illustration)\b/i.test(
          userMessage
        ) ||
        /\b(image|picture|photo|drawing|illustration)\s+(of|showing|with)\b/i.test(
          userMessage
        );

      if (isImageRequest) {
        const result = await unifiedAIService.generateImage(userMessage);
        if (result.success && result.data) {
          addMessage("ai", result.data, undefined, undefined, undefined, undefined, true);
        } else {
          addMessage(
            "ai",
            result.error ||
              "Failed to generate image description. Please try again."
          );
        }
      } else if (uploadedImage) {
        // Analyze uploaded image with user's question
        const result = await unifiedAIService.analyzeImageContent(
          uploadedImage,
          userMessage
        );
        if (result.success && result.data) {
          addMessage(
            "ai",
            result.data,
            "Based on the uploaded image",
            uploadedImage
          );
        } else {
          addMessage(
            "ai",
            result.error || "Failed to analyze the image. Please try again."
          );
        }
        setUploadedImage("");
      } else if (uploadedPdf) {
        // Extract text from PDF and analyze with user's question
        try {
          const pdfText = await extractTextFromPdfDataUrl(uploadedPdf);
          const context = pdfText.slice(0, 8000); // Limit context size

          const response = await unifiedAIService.generateResponse(
            userMessage || "Please analyze this PDF content",
            context
          );

          if (response.success && response.data) {
            addMessage(
              "ai",
              response.data,
              `Based on the PDF: ${uploadedFileName}`,
              undefined,
              uploadedPdf,
              uploadedFileName
            );
          } else {
            addMessage(
              "ai",
              response.error || "Failed to analyze the PDF. Please try again."
            );
          }
        } catch (error) {
          addMessage(
            "ai",
            "Failed to extract text from the PDF. Please ensure it's a valid PDF file."
          );
        }
        setUploadedPdf("");
        setUploadedFileName("");
      } else {
        const isDreamToPlanMode = currentSession?.chatType === "dream-to-plan";

        // Regular text conversation with conversation context and file context
        const fileContext = fileContextText
          ? fileContextText.slice(0, 8000)
          : "";
        const conversationHistory = buildConversationHistory();
        const useConversationContext = shouldUseConversationContext(
          userMessage,
          conversationHistory
        );

        // Combine context prompt with file context
        const fullContext = contextPrompt ? `${contextPrompt}\n\n${fileContext}` : fileContext;

        // For dream-to-plan mode, IMMEDIATELY detect intent and open modal - SKIP AI conversational response
        if (isDreamToPlanMode) {
          try {
            // SKIP AI response - check actions first
            /*const response = await unifiedAIService.generateResponse(
              userMessage,
              fullContext,
              useConversationContext ? conversationHistory : undefined
            );

            if (response.success) {
              addMessage(
                "ai",
                response.data ?? "",
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                useConversationContext,
                useConversationContext ? contextualReferences : undefined
              );
            }*/

            // SKIP AI conversational response - check for actions FIRST
            // Immediately analyze user message for actionable intents (NO AI response)
            const dreamToPlanResult = await dreamToPlanService.processJournalEntry(
              userMessage,
              {
                autoCreateTodos: false,
                autoScheduleMeetings: false,
                autoCreateReminders: false,
              }
            );

            // If we found actionable items, show the dream-to-plan modal immediately (NO AI chat response)
            if (
              (dreamToPlanResult.suggestedGoals.length > 0 ||
                dreamToPlanResult.actionItems.length > 0)
            ) {
              setCurrentDreamToPlanResult(dreamToPlanResult);
              setShowDreamToPlanModal(true);
              // Clear input after opening modal
              setInputMessage("");
              setIsLoading(false);
              return; // Exit early - don't show conversational response
            } else {
              // If no actionable items found, show a simple help message (no long AI response)
              addMessage(
                "ai",
                "I couldn't detect any specific actions (team creation, meeting scheduling, or tasks) in your message. Try: 'create a team called X' or 'schedule a meeting with Y' or 'I need to do X'.",
                "Help"
              );
            }
          } catch (error) {
            console.error("Error in dream-to-plan processing:", error);
            addMessage(
              "ai",
              "Sorry, I encountered an error processing your request. Please try again."
            );
          }
          setIsLoading(false);
        } else {
          // Regular flow for non-dream-to-plan modes
          const response = await unifiedAIService.generateResponse(
            userMessage,
            fullContext,
            useConversationContext ? conversationHistory : undefined
          );

          if (response.success) {
            let contextDescription = "";
            if (fileContext && useConversationContext) {
              contextDescription =
                "Based on file content and conversation history";
            } else if (fileContext) {
              contextDescription = "Based on the current file preview";
            } else if (useConversationContext) {
              contextDescription = "Based on conversation history";
            }

            addMessage(
              "ai",
              response.data ?? "",
              contextDescription || undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              useConversationContext,
              useConversationContext ? contextualReferences : undefined
            );
          } else {
            addMessage(
              "ai",
              "I apologize, but I encountered an error processing your request. Please try again."
            );
          }
        }
      }
    } catch (error) {
      addMessage(
        "ai",
        "I'm experiencing technical difficulties. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!inputMessage.trim() || isEnhancing || isLoading) return;
    
    setIsEnhancing(true);
    try {
      const enhancePrompt = `Please enhance and improve the following prompt to make it more clear, specific, and effective for getting better AI responses. Return only the enhanced prompt without any explanation or additional text:\n\n"${inputMessage}"`;
      
      const response = await unifiedAIService.generateResponse(enhancePrompt, "");
      
      if (response.success && response.data) {
        // Clean up the response - remove quotes and extra formatting
        let enhanced = response.data.trim();
        // Remove surrounding quotes if present
        enhanced = enhanced.replace(/^["'](.*)["']$/s, '$1');
        setInputMessage(enhanced);
      } else {
        // Show error briefly in a subtle way
        console.error("Failed to enhance prompt:", response.error);
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getChatTypeIcon = (chatType?: ChatType) => {
    switch (chatType) {
      case "study": return "📚";
      case "research": return "🔬";
      case "general": return "💬";
      case "creative": return "🎨";
      case "coding": return "💻";
      case "business": return "💼";
      case "dream-to-plan": return "✨";
      default: return "🤖";
    }
  };

  const getChatTypeColor = (chatType?: ChatType) => {
    switch (chatType) {
      case "study": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "research": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "general": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "creative": return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      case "coding": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "business": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "dream-to-plan": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleAcceptDreamToPlan = async () => {
    if (!currentDreamToPlanResult) return;

    try {
      const hasTeamActions = currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "team");
      
      // Only create team if team form was filled and submitted
      if (hasTeamActions && showTeamForm && teamFormData.name.trim()) {
        await handleCreateTeam();
      }

      // Always add todos and goals to calendar
      await dreamToPlanService.createTodosFromGoals(currentDreamToPlanResult.suggestedGoals);
      await dreamToPlanService.createTodosFromActions(
        currentDreamToPlanResult.actionItems.filter((item) => item.type === "todo")
      );
      
      // Handle meetings with date/time from form
      const meetingItems = currentDreamToPlanResult.actionItems
        .map((item: any, originalIdx: number) => {
          if (item.type === "meeting") {
            const formData = meetingFormData[originalIdx];
            if (formData && formData.date && formData.time) {
              const dateTime = new Date(`${formData.date}T${formData.time}`);
              return { ...item, suggestedDate: dateTime };
            }
          }
          return item;
        })
        .filter((item: any) => item.type === "meeting");
      await dreamToPlanService.scheduleMeetingsFromActions(meetingItems);
      
      await dreamToPlanService.createRemindersFromActions(
        currentDreamToPlanResult.actionItems.filter((item) => item.type === "reminder")
      );

      // Only show success message - no long explanations
      addMessage(
        "ai",
        "✅ Done! All items have been added to your calendar.",
        "Success"
      );
      
      setShowDreamToPlanModal(false);
      setCurrentDreamToPlanResult(null);
      setTeamFormData({ name: "", emails: [], currentEmail: "" });
      setMeetingFormData({});
      setShowTeamForm(false);
    } catch (error) {
      console.error("Error accepting dream-to-plan:", error);
      addMessage("ai", "Sorry, I encountered an error adding items. Please try again.");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamFormData.name.trim()) return;

    setCreatingTeam(true);
    try {
      await dreamToPlanService.createTeamFromAction(
        teamFormData.name.trim(),
        "",
        teamFormData.emails
      );

      addMessage(
        "ai",
        `✅ Team "${teamFormData.name}" created${teamFormData.emails.length > 0 ? ` and ${teamFormData.emails.length} invitation${teamFormData.emails.length === 1 ? '' : 's'} sent` : ''}.`,
        "Success"
      );
      
      setTeamFormData({ name: "", emails: [], currentEmail: "" });
      setShowTeamForm(false);
      
      // Remove team action items from the result after creation
      if (currentDreamToPlanResult) {
        setCurrentDreamToPlanResult({
          ...currentDreamToPlanResult,
          actionItems: currentDreamToPlanResult.actionItems.filter((item: any) => item.type !== "team"),
        });
      }
    } catch (error) {
      console.error("Error creating team:", error);
      addMessage("ai", "❌ Failed to create team. Please try again.");
    } finally {
      setCreatingTeam(false);
    }
  };

  const addEmail = () => {
    if (teamFormData.currentEmail.trim() && !teamFormData.emails.includes(teamFormData.currentEmail.trim())) {
      setTeamFormData({
        ...teamFormData,
        emails: [...teamFormData.emails, teamFormData.currentEmail.trim()],
        currentEmail: "",
      });
    }
  };

  const removeEmail = (email: string) => {
    setTeamFormData({
      ...teamFormData,
      emails: teamFormData.emails.filter((e) => e !== email),
    });
  };

  const chatTypes: Array<{ type: ChatType; icon: string; title: string; description: string }> = [
    { type: "study", icon: "📚", title: "Study", description: "Learn, understand concepts, and prepare for exams" },
    { type: "research", icon: "🔬", title: "Research", description: "Analyze information and organize findings" },
    { type: "general", icon: "💬", title: "General", description: "Everyday questions and conversations" },
    { type: "creative", icon: "🎨", title: "Creative", description: "Brainstorm ideas and creative writing" },
    { type: "coding", icon: "💻", title: "Coding", description: "Programming help and code explanations" },
    { type: "business", icon: "💼", title: "Business", description: "Strategy, analysis, and professional tasks" },
    { type: "dream-to-plan", icon: "✨", title: "Dream-to-Plan", description: "Transform your dreams and plans into actionable todos and calendar events" },
  ];

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Chat Type Selection Modal */}
      {showChatTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Choose Your Chat Type
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select the type of assistance you need for the best experience
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {chatTypes.map((chatType) => (
                <button
                  key={chatType.type}
                  onClick={() => selectChatType(chatType.type)}
                  className="flex flex-col items-start p-4 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-all border-2 border-transparent hover:border-blue-500 text-left group"
                >
                  <div className="text-4xl mb-3">{chatType.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {chatType.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chatType.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={handleNewChatClick}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 border-b border-gray-100 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${
                currentSessionId === session.id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-400"
                  : ""
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {session.name}
                  </span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {session.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Enhanced AI Assistant
                  </h2>
                  {currentSession?.chatType && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getChatTypeColor(currentSession.chatType)}`}>
                      {getChatTypeIcon(currentSession.chatType)} {currentSession.chatType.charAt(0).toUpperCase() + currentSession.chatType.slice(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSession?.chatType 
                    ? `${currentSession.chatType.charAt(0).toUpperCase() + currentSession.chatType.slice(1)} mode - Multimodal AI with image & PDF analysis`
                    : "Multimodal AI with image, PDF analysis and generation"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative history-dropdown">
                <button
                  onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Chat history"
                >
                  <MessageSquare className="w-4 h-4" />
                  History
                </button>

                {showHistoryDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-600">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Recent Chats
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {getRecentSessions().map((session) => (
                        <button
                          key={session.id}
                          onClick={() => switchToSession(session.id)}
                          className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                            session.id === currentSessionId
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {getSessionPreview(session)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {session.messages.length} messages
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                              {formatTimestamp(session.lastUpdated)}
                            </span>
                          </div>
                        </button>
                      ))}
                      {sessions.length === 0 && (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No chat history yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleNewChatClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Start a new chat"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <AIStatus />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-800 min-h-0 max-h-full">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-600"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Uploaded content"
                      className="max-w-full h-auto rounded-lg mb-2"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                  {message.pdfUrl && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mb-2">
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-800 dark:text-red-300">
                        {message.fileName || "PDF Document"}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.context && (
                    <p className="text-xs mt-2 opacity-75">{message.context}</p>
                  )}
                  {message.usedConversationContext && (
                    <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Used conversation context</span>
                      {message.contextualReferences &&
                        message.contextualReferences.length > 0 && (
                          <span className="ml-1 text-blue-600 dark:text-blue-400">
                            (detected:{" "}
                            {message.contextualReferences
                              .slice(0, 2)
                              .join(", ")}
                            )
                          </span>
                        )}
                    </div>
                  )}
                  {message.contextualReferences &&
                    message.contextualReferences.length > 0 &&
                    message.type === "user" && (
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        <span className="text-blue-600 dark:text-blue-400">
                          🔗 Contextual references:{" "}
                          {message.contextualReferences.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    )}
                  {message.isImageGeneration && (
                    <div className="mt-2 text-xs opacity-75">
                      💡 This is an image description. In a full implementation,
                      this would generate an actual image.
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.type === "ai" && (
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="text-xs opacity-75 hover:opacity-100"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                onClick={() => setUploadedImage("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {uploadedPdf && (
            <div className="mb-3 relative inline-block">
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                  {uploadedFileName}
                </span>
                <button
                  onClick={() => {
                    setUploadedPdf("");
                    setUploadedFileName("");
                  }}
                  className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Upload File"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              {showFileUpload && (
                <div className="flex gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Choose Image or PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything, request an image, or upload an image/PDF to analyze..."
                className="w-full p-3 pr-12 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleEnhancePrompt}
              disabled={!inputMessage.trim() || isEnhancing || isLoading}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Enhance prompt"
              title="Enhance this prompt"
            >
              {isEnhancing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="text-sm hidden sm:inline">Enhance</span>
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dream-to-Plan Modal */}
      {showDreamToPlanModal && currentDreamToPlanResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Dream-to-Plan Analysis
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDreamToPlanModal(false);
                  setCurrentDreamToPlanResult(null);
                  setTeamFormData({ name: "", emails: [], currentEmail: "" });
                  setMeetingFormData({});
                  setShowTeamForm(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Motivation Insights */}
              {currentDreamToPlanResult.motivationInsights && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    💡 Motivation Insights
                  </h4>
                  <p className="text-purple-800 dark:text-purple-200">
                    {currentDreamToPlanResult.motivationInsights}
                  </p>
                </div>
              )}

              {/* Suggested Goals */}
              {currentDreamToPlanResult.suggestedGoals?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Suggested Goals ({currentDreamToPlanResult.suggestedGoals.length})
                  </h4>
                  <div className="space-y-2">
                    {currentDreamToPlanResult.suggestedGoals.map((goal: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {goal.title}
                          </h5>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              goal.priority === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : goal.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {goal.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.description}
                        </p>
                        {goal.suggestedDueDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Due: {new Date(goal.suggestedDueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Creation Section - Only show if team actions detected */}
              {currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "team") && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Create Team
                  </h4>
                  {currentDreamToPlanResult.actionItems
                    .filter((item: any) => item.type === "team")
                    .map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-3"
                      >
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">{item.text}</p>
                        {!showTeamForm ? (
                          <button
                            onClick={() => {
                              setShowTeamForm(true);
                              setTeamFormData({
                                name: item.teamName || "",
                                emails: [],
                                currentEmail: "",
                              });
                            }}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Create Team & Send Invitations
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Team Name
                              </label>
                              <input
                                type="text"
                                value={teamFormData.name}
                                onChange={(e) =>
                                  setTeamFormData({ ...teamFormData, name: e.target.value })
                                }
                                placeholder="Enter team name"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Team Description (Optional)
                              </label>
                              <textarea
                                placeholder="Enter team description"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Invite Members (Email Addresses)
                              </label>
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="email"
                                  value={teamFormData.currentEmail}
                                  onChange={(e) =>
                                    setTeamFormData({ ...teamFormData, currentEmail: e.target.value })
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addEmail();
                                    }
                                  }}
                                  placeholder="Enter email address"
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                                <button
                                  onClick={addEmail}
                                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              {teamFormData.emails.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {teamFormData.emails.map((email) => (
                                    <span
                                      key={email}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-sm"
                                    >
                                      <Mail className="w-3 h-3" />
                                      {email}
                                      <button
                                        onClick={() => removeEmail(email)}
                                        className="hover:text-red-600"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCreateTeam}
                                disabled={!teamFormData.name.trim() || creatingTeam}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {creatingTeam ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-4 h-4" />
                                    Create Team & Send Invites
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setShowTeamForm(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Meeting Scheduling Section - Only show if meeting actions detected */}
              {currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "meeting") && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Schedule Meeting
                  </h4>
                  <div className="space-y-3">
                    {currentDreamToPlanResult.actionItems
                      .filter((item: any) => item.type === "meeting")
                      .map((item: any, idx: number) => {
                        // Find original index in full array for form data
                        const originalIdx = currentDreamToPlanResult.actionItems.findIndex((i: any) => i === item);
                        return (
                          <div
                            key={idx}
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">{item.text}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={meetingFormData[originalIdx]?.date || ""}
                                  onChange={(e) =>
                                    setMeetingFormData({
                                      ...meetingFormData,
                                      [originalIdx]: {
                                        ...meetingFormData[originalIdx],
                                        date: e.target.value,
                                        time: meetingFormData[originalIdx]?.time || "",
                                      },
                                    })
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={meetingFormData[originalIdx]?.time || ""}
                                  onChange={(e) =>
                                    setMeetingFormData({
                                      ...meetingFormData,
                                      [originalIdx]: {
                                        ...meetingFormData[originalIdx],
                                        date: meetingFormData[originalIdx]?.date || "",
                                        time: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`meeting-todo-${idx}`}
                                defaultChecked
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <label htmlFor={`meeting-todo-${idx}`} className="text-xs text-gray-600 dark:text-gray-400">
                                Add todo reminder for this meeting
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Meeting will be added to calendar.
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Todo Tasks Section - Only show if todo actions detected */}
              {(currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "todo") || currentDreamToPlanResult.suggestedGoals?.length > 0) && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Todo Tasks
                  </h4>
                  <div className="space-y-2">
                    {currentDreamToPlanResult.actionItems
                      ?.filter((item: any) => item.type === "todo")
                      .map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{item.text}</span>
                        </div>
                      ))}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      All todos will be added to your calendar and task list.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {(() => {
                  const hasTeamActions = currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "team");
                  const hasMeetingActions = currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "meeting");
                  const hasTodoActions = currentDreamToPlanResult.actionItems?.some((item: any) => item.type === "todo") || currentDreamToPlanResult.suggestedGoals?.length > 0;
                  
                  let buttonText = "Add to Calendar";
                  if (hasTeamActions && !hasMeetingActions && !hasTodoActions) {
                    buttonText = "Create Team";
                  } else if (hasMeetingActions && !hasTeamActions && !hasTodoActions) {
                    buttonText = "Schedule Meeting & Add to Calendar";
                  } else if (hasTodoActions && !hasTeamActions && !hasMeetingActions) {
                    buttonText = "Add Todos & Calendar";
                  } else {
                    buttonText = "Add All to Calendar";
                  }

                  return (
                    <button
                      onClick={handleAcceptDreamToPlan}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      {buttonText}
                    </button>
                  );
                })()}
                <button
                  onClick={() => {
                    setShowDreamToPlanModal(false);
                    setCurrentDreamToPlanResult(null);
                    setTeamFormData({ name: "", emails: [], currentEmail: "" });
                    setMeetingFormData({});
                    setShowTeamForm(false);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
