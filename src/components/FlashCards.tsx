import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Loader,
  Zap,
  Brain,
  Play,
  BarChart3,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Target,
  TrendingUp,
  Calendar,
  Bookmark,
  Share2,
  X,
} from "lucide-react";
import { unifiedAIService } from "../utils/aiConfig";
import { driveStorageUtils } from "../utils/driveStorage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { extractTextFromPdfDataUrl } from "../utils/pdfText";

type ParsedCard = {
  id: string;
  question: string;
  answer: string;
  reasoning?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  reviewCount?: number;
  masteryLevel?: number; // 0-100
  tags?: string[];
  userTags?: string[]; // User-defined tags
  systemTags?: string[]; // System-generated tags
  createdAt: Date;
  // Spaced repetition fields
  nextReviewDate?: Date;
  interval?: number; // Days until next review
  easeFactor?: number; // Multiplier for interval (starts at 2.5)
  consecutiveCorrect?: number;
  consecutiveIncorrect?: number;
  totalStudyTime?: number; // Total time spent studying in seconds
  averageResponseTime?: number; // Average time to answer in seconds
  lastStudySession?: Date;
  studyStreak?: number; // Consecutive days studied
};

// Spaced repetition algorithm constants
const SPACED_REPETITION = {
  INITIAL_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  EASE_FACTOR_DECREASE: 0.1,
  EASE_FACTOR_INCREASE: 0.15,
  INTERVALS: [1, 6, 15, 30, 90, 180, 365], // Days
  MASTERY_THRESHOLD: 85, // Mastery level to consider card "learned"
  REVIEW_THRESHOLD: 70, // Minimum mastery to avoid review
};

// Study session types
type StudyMode = "new" | "review" | "mastered" | "difficult" | "mixed";
type StudySession = {
  id: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: string[];
  correctAnswers: number;
  incorrectAnswers: number;
  totalTime: number;
  mode: StudyMode;
};

export const FlashCards: React.FC = () => {
  const [inputText, setInputText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableDocuments, setAvailableDocuments] = React.useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState("");
  const [cards, setCards] = React.useState<ParsedCard[]>([]);
  const [filteredCards, setFilteredCards] = React.useState<ParsedCard[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [currentView, setCurrentView] = React.useState<
    "create" | "study" | "manage" | "stats"
  >("create");
  const [studyMode, setStudyMode] = React.useState<StudyMode>("mixed");
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [studySession, setStudySession] = React.useState<StudySession | null>(
    null
  );
  const [sessionStats, setSessionStats] = React.useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [showCardEditor, setShowCardEditor] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<ParsedCard | null>(null);
  const [cardOrder, setCardOrder] = React.useState<"sequential" | "random">(
    "sequential"
  );
  const [autoAdvance, setAutoAdvance] = React.useState(false);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = React.useState(3);
  const [showFeedback, setShowFeedback] = React.useState<string | null>(null);
  const [inputTags, setInputTags] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaveStatus, setLastSaveStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showSessionExpiredModal, setShowSessionExpiredModal] =
    React.useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = React.useState("");
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [popularTags, setPopularTags] = React.useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = React.useState(false);
  const [currentStudyCard, setCurrentStudyCard] =
    React.useState<ParsedCard | null>(null);
  const [showStudyModal, setShowStudyModal] = React.useState(false);
  const [studyStats, setStudyStats] = React.useState({
    totalCards: 0,
    newCards: 0,
    dueCards: 0,
    masteredCards: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    averageAccuracy: 0,
  });

  const user = realTimeAuth.getCurrentUser();

  React.useEffect(() => {
    const loadDocuments = async () => {
      if (user) {
        try {
          const files = await driveStorageUtils.getFiles(user.id);
          const documents = files.filter((file) => file.type === "file");
          setAvailableDocuments(documents);
        } catch (error) {
          console.error("Error loading documents:", error);
          // Handle session expired errors
          if (!handleSessionExpired(error)) {
            // If not a session expired error, show generic error
            console.error("Generic error loading documents:", error);
          }
        }
      }
    };

    loadDocuments();
  }, [user]);

  // Load flashcards from Drive/localStorage on component mount
  React.useEffect(() => {
    const loadFlashcards = async () => {
      if (user) {
        try {
          console.log("🔄 Loading flashcards for user:", user.id);
          const loadedCards = await driveStorageUtils.loadFlashcardsFromDrive(
            user.id
          );
          if (loadedCards.length > 0) {
            console.log("✅ Loaded flashcards:", loadedCards.length);
            setCards(loadedCards);
          } else {
            console.log("📝 No existing flashcards found");
          }
        } catch (error) {
          console.error("Error loading flashcards:", error);
          // Handle session expired errors
          if (!handleSessionExpired(error)) {
            // If not a session expired error, show generic error
            console.error("Generic error loading flashcards:", error);
          }
        }
      }
    };

    loadFlashcards();
  }, [user]);

  // Load popular tags from existing cards
  React.useEffect(() => {
    if (cards.length > 0) {
      const tagCounts: { [key: string]: number } = {};
      cards.forEach((card) => {
        if (card.tags) {
          card.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      setPopularTags(sortedTags);
    }
  }, [cards]);

  React.useEffect(() => {
    filterCards();
  }, [
    cards,
    searchTerm,
    selectedCategory,
    selectedDifficulty,
    selectedTags,
    cardOrder,
  ]);

  // Initialize filteredCards when cards are first loaded
  React.useEffect(() => {
    if (cards.length > 0 && filteredCards.length === 0) {
      setFilteredCards(cards);
    }
  }, [cards, filteredCards.length]);

  // Ensure study session is properly initialized when entering study view
  React.useEffect(() => {
    if (currentView === "study" && !studySession) {
      // If we're in study view but no session, start one automatically
      if (cards.length > 0) {
        if (filteredCards.length === 0) {
          setFilteredCards(cards);
        }
        const session: StudySession = {
          id: Date.now().toString(),
          startTime: new Date(),
          cardsStudied: [],
          correctAnswers: 0,
          incorrectAnswers: 0,
          totalTime: 0,
          mode: "mixed",
        };
        setStudySession(session);
        setSessionStats({ correct: 0, incorrect: 0, total: 0 });
        setCurrentCardIndex(0);
        setShowAnswer(false);
      }
    }
  }, [currentView, studySession, cards.length, filteredCards.length]);

  const filterCards = () => {
    let filtered = [...cards];

    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((card) => card.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (card) => card.difficulty === selectedDifficulty
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(
        (card) =>
          card.tags && selectedTags.some((tag) => card.tags!.includes(tag))
      );
    }

    // Sort cards based on order preference
    if (cardOrder === "sequential") {
      // Newest first (most recently created)
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (cardOrder === "random") {
      // Random order
      filtered.sort(() => Math.random() - 0.5);
    }

    setFilteredCards(filtered);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const decodeTextFromDataUrl = (dataUrl: string): string => {
    try {
      if (dataUrl.startsWith("data:")) {
        const base64 = dataUrl.split(",")[1];
        return atob(base64);
      }
      return atob(dataUrl);
    } catch {
      return dataUrl;
    }
  };

  const getDocumentContent = async (documentId: string): Promise<string> => {
    const file = availableDocuments.find((doc) => doc.id === documentId);
    if (!file) return "";

    try {
      if (typeof file.content === "string" && file.content.length > 0) {
        const mime = file.mimeType || "";
        if (
          mime.startsWith("image/") ||
          file.content.startsWith("data:image")
        ) {
          const ocr = await unifiedAIService.extractTextFromImage(file.content);
          return ocr.success && ocr.data ? ocr.data : "";
        }
        if (
          mime.includes("pdf") ||
          (file.name && file.name.toLowerCase().endsWith(".pdf"))
        ) {
          if (file.content.startsWith("data:")) {
            try {
              return await extractTextFromPdfDataUrl(file.content);
            } catch {
              return "";
            }
          }
          return "";
        }

        if (
          mime === "text/plain" ||
          mime.startsWith("text/") ||
          (file.name && file.name.match(/\.(txt|md|json|js|ts|html|css|csv)$/i))
        ) {
          return decodeTextFromDataUrl(file.content);
        }

        return decodeTextFromDataUrl(file.content);
      }

      if (file.driveFileId) {
        const downloaded = await driveStorageUtils.downloadFileContent(
          file.driveFileId
        );
        if (typeof downloaded === "string" && downloaded.length > 0) {
          const mime = file.mimeType || "";
          if (
            mime.includes("pdf") ||
            (file.name && file.name.toLowerCase().endsWith(".pdf"))
          ) {
            if (downloaded.startsWith("data:")) {
              try {
                return await extractTextFromPdfDataUrl(downloaded);
              } catch {
                return "";
              }
            }
            return "";
          }
          if (
            mime.startsWith("image/") ||
            downloaded.startsWith("data:image")
          ) {
            const ocr = await unifiedAIService.extractTextFromImage(downloaded);
            return ocr.success && ocr.data ? ocr.data : "";
          }
          if (
            mime === "text/plain" ||
            mime.startsWith("text/") ||
            (file.name &&
              file.name.match(/\.(txt|md|json|js|ts|html|css|csv)$/i))
          ) {
            return decodeTextFromDataUrl(downloaded);
          }
          return decodeTextFromDataUrl(downloaded);
        }
      }

      return "";
    } catch (e) {
      return "";
    }
  };

  const parseFlashcards = (
    raw: string,
    userTags: string[] = []
  ): ParsedCard[] => {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && l.includes("|"));

    const parsed: ParsedCard[] = lines.map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const qPart = parts.find((p) => /^Q:/i.test(p)) || parts[0] || "";
      const aPart = parts.find((p) => /^A:/i.test(p)) || parts[1] || "";
      const rPart = parts.find((p) => /^R:/i.test(p)) || parts[2] || "";
      const clean = (s: string) => s.replace(/^[QAR]:\s*/i, "").trim();

      const question = clean(qPart);
      const answer = clean(aPart);
      const reasoning = clean(rPart) || undefined;

      // Generate system tags
      const systemTags = generateSystemTags(question, answer, reasoning);

      // Combine user tags and system tags
      const allTags = [...new Set([...userTags, ...systemTags])];

      return {
        id: generateId(),
        question,
        answer,
        reasoning,
        category: "General",
        difficulty: "medium" as const,
        lastReviewed: new Date(),
        reviewCount: 0,
        masteryLevel: 0,
        tags: allTags,
        userTags: userTags,
        systemTags: systemTags,
        createdAt: new Date(),
      };
    });
    return parsed;
  };

  // Generate system-suggested tags based on content
  const generateSystemTags = (
    question: string,
    answer: string,
    reasoning?: string
  ): string[] => {
    const content = `${question} ${answer} ${reasoning || ""}`.toLowerCase();
    const systemTags: string[] = [];

    // Subject-based tags
    if (content.includes("javascript") || content.includes("js"))
      systemTags.push("JavaScript");
    if (content.includes("react") || content.includes("jsx"))
      systemTags.push("React");
    if (content.includes("python")) systemTags.push("Python");
    if (content.includes("java")) systemTags.push("Java");
    if (content.includes("sql") || content.includes("database"))
      systemTags.push("Database");
    if (content.includes("algorithm") || content.includes("data structure"))
      systemTags.push("Algorithms");
    if (content.includes("html") || content.includes("css"))
      systemTags.push("Web Development");
    if (content.includes("api") || content.includes("rest"))
      systemTags.push("API");
    if (content.includes("git") || content.includes("version control"))
      systemTags.push("Version Control");
    if (content.includes("testing") || content.includes("unit test"))
      systemTags.push("Testing");
    if (content.includes("design pattern")) systemTags.push("Design Patterns");
    if (content.includes("security") || content.includes("authentication"))
      systemTags.push("Security");
    if (content.includes("performance") || content.includes("optimization"))
      systemTags.push("Performance");
    if (
      content.includes("cloud") ||
      content.includes("aws") ||
      content.includes("azure")
    )
      systemTags.push("Cloud Computing");
    if (content.includes("docker") || content.includes("kubernetes"))
      systemTags.push("DevOps");
    if (content.includes("machine learning") || content.includes("ai"))
      systemTags.push("Machine Learning");
    if (content.includes("frontend") || content.includes("ui"))
      systemTags.push("Frontend");
    if (content.includes("backend") || content.includes("server"))
      systemTags.push("Backend");
    if (
      content.includes("mobile") ||
      content.includes("ios") ||
      content.includes("android")
    )
      systemTags.push("Mobile Development");

    // Difficulty-based tags
    if (content.includes("basic") || content.includes("fundamental"))
      systemTags.push("Fundamentals");
    if (content.includes("advanced") || content.includes("complex"))
      systemTags.push("Advanced");
    if (content.includes("interview") || content.includes("question"))
      systemTags.push("Interview Prep");

    // Topic-based tags
    if (content.includes("array") || content.includes("list"))
      systemTags.push("Data Structures");
    if (content.includes("function") || content.includes("method"))
      systemTags.push("Functions");
    if (content.includes("class") || content.includes("object"))
      systemTags.push("OOP");
    if (content.includes("async") || content.includes("promise"))
      systemTags.push("Asynchronous");
    if (content.includes("error") || content.includes("exception"))
      systemTags.push("Error Handling");

    return [...new Set(systemTags)]; // Remove duplicates
  };

  // Generate flashcards with enhanced tagging
  const generateFlashcards = async () => {
    if (isLoading) return;
    let content = inputText;
    if (selectedDocument) {
      content = await getDocumentContent(selectedDocument);
      if (!content) {
        alert(
          "Could not extract text from the selected document. Please try with a text file or paste the content manually."
        );
        return;
      }
    }

    if (!content.trim()) {
      alert("Please provide some text to generate flashcards.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await unifiedAIService.generateFlashcards(content);
      if (result.success && result.data) {
        // Parse user tags from input
        const userTags = inputTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        const newCards = parseFlashcards(result.data, userTags);
        const updatedCards = [...cards, ...newCards];
        setCards(updatedCards);

        // Save to Drive/localStorage
        if (user) {
          try {
            const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(
              updatedCards,
              user.id
            );
            if (savedToDrive) {
              console.log("✅ Flashcards saved to Google Drive");
            } else {
              console.log("📱 Flashcards saved to localStorage only");
            }
          } catch (error) {
            console.error("Error saving flashcards:", error);
            handleSessionExpired(error);
          }
        }

        setInputText("");
        setSelectedDocument("");
        setInputTags(""); // Clear tags input
        setCurrentView("manage");
        alert(
          `Successfully generated ${newCards.length} flashcards with enhanced tagging!`
        );
      } else {
        alert("AI processing failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      alert("An error occurred while generating flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced tag management functions
  const addTagToCard = async (cardId: string, newTag: string) => {
    const updatedCards = cards.map((card) => {
      if (card.id === cardId) {
        const userTags = card.userTags || [];
        const updatedUserTags = [...new Set([...userTags, newTag])];
        const allTags = [
          ...new Set([...updatedUserTags, ...(card.systemTags || [])]),
        ];

        return {
          ...card,
          tags: allTags,
          userTags: updatedUserTags,
        };
      }
      return card;
    });

    setCards(updatedCards);

    // Save to Drive/localStorage
    if (user) {
      try {
        await driveStorageUtils.saveFlashcardsToDrive(updatedCards, user.id);
      } catch (error) {
        console.error("Error saving tag changes:", error);
      }
    }
  };

  const removeTagFromCard = async (cardId: string, tagToRemove: string) => {
    const updatedCards = cards.map((card) => {
      if (card.id === cardId) {
        const userTags = card.userTags || [];
        const systemTags = card.systemTags || [];

        // Only allow removal of user tags, not system tags
        if (systemTags.includes(tagToRemove)) {
          return card; // Don't modify system tags
        }

        const updatedUserTags = userTags.filter((tag) => tag !== tagToRemove);
        const allTags = [...new Set([...updatedUserTags, ...systemTags])];

        return {
          ...card,
          tags: allTags,
          userTags: updatedUserTags,
        };
      }
      return card;
    });

    setCards(updatedCards);

    // Save to Drive/localStorage
    if (user) {
      try {
        await driveStorageUtils.saveFlashcardsToDrive(updatedCards, user.id);
      } catch (error) {
        console.error("Error saving tag changes:", error);
      }
    }
  };

  // Get all tags with counts and types
  const getAllTagsWithInfo = () => {
    const tagInfo: {
      [key: string]: { count: number; type: "user" | "system" | "both" };
    } = {};

    cards.forEach((card) => {
      if (card.tags) {
        card.tags.forEach((tag) => {
          if (!tagInfo[tag]) {
            tagInfo[tag] = { count: 0, type: "system" };
          }
          tagInfo[tag].count++;

          // Determine tag type
          const isUserTag = card.userTags?.includes(tag);
          const isSystemTag = card.systemTags?.includes(tag);

          if (isUserTag && isSystemTag) {
            tagInfo[tag].type = "both";
          } else if (isUserTag) {
            tagInfo[tag].type = "user";
          }
        });
      }
    });

    return Object.entries(tagInfo)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([tag, info]) => ({ tag, ...info }));
  };

  // Spaced repetition algorithm
  const calculateNextReview = (
    card: ParsedCard,
    quality: number
  ): ParsedCard => {
    const now = new Date();
    let newCard = { ...card };

    // Quality: 0-5 (0=complete blackout, 5=perfect response)
    if (quality < 3) {
      // Incorrect or poor response
      newCard.consecutiveIncorrect = (card.consecutiveIncorrect || 0) + 1;
      newCard.consecutiveCorrect = 0;
      newCard.interval = 1; // Review tomorrow
      newCard.easeFactor = Math.max(
        SPACED_REPETITION.MIN_EASE_FACTOR,
        (card.easeFactor || SPACED_REPETITION.INITIAL_EASE_FACTOR) -
          SPACED_REPETITION.EASE_FACTOR_DECREASE
      );
    } else {
      // Correct response
      newCard.consecutiveCorrect = (card.consecutiveCorrect || 0) + 1;
      newCard.consecutiveIncorrect = 0;

      if ((card.consecutiveCorrect || 0) === 0) {
        // First correct response
        newCard.interval = SPACED_REPETITION.INTERVALS[0];
      } else if (
        (card.consecutiveCorrect || 0) < SPACED_REPETITION.INTERVALS.length
      ) {
        // Use predefined intervals
        newCard.interval =
          SPACED_REPETITION.INTERVALS[card.consecutiveCorrect || 0];
      } else {
        // Use spaced repetition formula
        newCard.interval = Math.round(
          (card.interval || 1) *
            (card.easeFactor || SPACED_REPETITION.INITIAL_EASE_FACTOR)
        );
      }

      // Increase ease factor for good performance
      if (quality >= 4) {
        newCard.easeFactor =
          (card.easeFactor || SPACED_REPETITION.INITIAL_EASE_FACTOR) +
          SPACED_REPETITION.EASE_FACTOR_INCREASE;
      }
    }

    // Calculate next review date
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + (newCard.interval || 1));
    newCard.nextReviewDate = nextReview;

    // Update mastery level
    const masteryChange = quality >= 3 ? 15 : -10;
    newCard.masteryLevel = Math.max(
      0,
      Math.min(100, (card.masteryLevel || 0) + masteryChange)
    );

    // Update review count and last reviewed
    newCard.reviewCount = (card.reviewCount || 0) + 1;
    newCard.lastReviewed = now;

    return newCard;
  };

  // Get cards for study session
  const getStudyCards = (mode: StudyMode): ParsedCard[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (mode) {
      case "new":
        return cards.filter((card) => !card.lastReviewed).slice(0, 20);

      case "review":
        return cards
          .filter(
            (card) =>
              card.nextReviewDate &&
              new Date(card.nextReviewDate) <= today &&
              (card.masteryLevel || 0) < SPACED_REPETITION.MASTERY_THRESHOLD
          )
          .slice(0, 30);

      case "mastered":
        return cards
          .filter(
            (card) =>
              (card.masteryLevel || 0) >= SPACED_REPETITION.MASTERY_THRESHOLD
          )
          .slice(0, 20);

      case "difficult":
        return cards
          .filter(
            (card) =>
              (card.consecutiveIncorrect || 0) > 2 ||
              (card.masteryLevel || 0) < 30
          )
          .slice(0, 15);

      case "mixed":
      default:
        const newCards = cards
          .filter((card) => !card.lastReviewed)
          .slice(0, 10);
        const dueCards = cards
          .filter(
            (card) =>
              card.nextReviewDate && new Date(card.nextReviewDate) <= today
          )
          .slice(0, 20);
        return [...newCards, ...dueCards];
    }
  };

  // Start study session
  const startStudySession = (mode: StudyMode) => {
    const studyCards = getStudyCards(mode);
    if (studyCards.length === 0) {
      alert("No cards available for study in this mode!");
      return;
    }

    const session: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      cardsStudied: [],
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTime: 0,
      mode,
    };

    setStudySession(session);
    setCurrentStudyCard(studyCards[0]);
    setShowStudyModal(true);
  };

  // Handle card response
  const handleCardResponse = (quality: number) => {
    if (!currentStudyCard || !studySession) return;

    const startTime = Date.now();
    const updatedCard = calculateNextReview(currentStudyCard, quality);

    // Update card in the array
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );

    // Update study session
    const sessionTime = (Date.now() - startTime) / 1000;
    setStudySession((prev) =>
      prev
        ? {
            ...prev,
            cardsStudied: [...prev.cardsStudied, updatedCard.id],
            correctAnswers: prev.correctAnswers + (quality >= 3 ? 1 : 0),
            incorrectAnswers: prev.incorrectAnswers + (quality < 3 ? 1 : 0),
            totalTime: prev.totalTime + sessionTime,
          }
        : null
    );

    // Move to next card or end session
    const studyCards = getStudyCards(studySession.mode);
    const currentIndex = studyCards.findIndex(
      (card) => card.id === currentStudyCard.id
    );
    const nextCard = studyCards[currentIndex + 1];

    if (nextCard) {
      setCurrentStudyCard(nextCard);
    } else {
      endStudySession();
    }
  };

  // End study session
  const endStudySession = () => {
    if (!studySession) return;

    const endTime = new Date();
    const finalSession = {
      ...studySession,
      endTime,
    };

    // Save session to localStorage for analytics
    const savedSessions = JSON.parse(
      localStorage.getItem("flashcardSessions") || "[]"
    );
    savedSessions.push(finalSession);
    localStorage.setItem("flashcardSessions", JSON.stringify(savedSessions));

    // Update study stats
    updateStudyStats();

    setStudySession(null);
    setCurrentStudyCard(null);
    setShowStudyModal(false);
  };

  // Update study statistics
  const updateStudyStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalCards = cards.length;
    const newCards = cards.filter((card) => !card.lastReviewed).length;
    const dueCards = cards.filter(
      (card) => card.nextReviewDate && new Date(card.nextReviewDate) <= today
    ).length;
    const masteredCards = cards.filter(
      (card) => (card.masteryLevel || 0) >= SPACED_REPETITION.MASTERY_THRESHOLD
    ).length;

    // Calculate study streak
    const savedSessions = JSON.parse(
      localStorage.getItem("flashcardSessions") || "[]"
    );
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const hasSession = savedSessions.some((session: StudySession) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === currentDate.toDateString();
      });

      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate average accuracy
    const totalCorrect = savedSessions.reduce(
      (sum: number, session: StudySession) => sum + session.correctAnswers,
      0
    );
    const totalAnswered = savedSessions.reduce(
      (sum: number, session: StudySession) =>
        sum + session.correctAnswers + session.incorrectAnswers,
      0
    );
    const averageAccuracy =
      totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    // Calculate total study time
    const totalStudyTime = savedSessions.reduce(
      (sum: number, session: StudySession) => sum + session.totalTime,
      0
    );

    setStudyStats({
      totalCards,
      newCards,
      dueCards,
      masteredCards,
      studyStreak: streak,
      totalStudyTime,
      averageAccuracy,
    });
  };

  // Load study stats on component mount
  React.useEffect(() => {
    updateStudyStats();
  }, [cards]);

  const markCardAnswer = async (isCorrect: boolean) => {
    console.log("markCardAnswer called with:", {
      isCorrect,
      studySession,
      currentCardIndex,
      filteredCardsLength: filteredCards.length,
    });

    if (!studySession) {
      console.error("No study session active");
      console.log("Current state:", {
        studySession,
        currentView,
        cards: cards.length,
        filteredCards: filteredCards.length,
      });
      return;
    }

    const currentCard = filteredCards[currentCardIndex];
    if (!currentCard) {
      console.error("No current card found");
      console.log("Current state:", {
        currentCardIndex,
        filteredCardsLength: filteredCards.length,
        filteredCardsArray: filteredCards,
      });
      return;
    }

    // Prevent multiple calls
    if (showFeedback) {
      console.log("Feedback already showing, ignoring duplicate call");
      return;
    }

    console.log("Marking card answer:", {
      isCorrect,
      currentCard,
      currentCardIndex,
    });

    // Update card mastery level
    const updatedCards = cards.map((card) => {
      if (card.id === currentCard.id) {
        const currentMastery = card.masteryLevel || 0;
        const newMasteryLevel = Math.min(
          100,
          currentMastery + (isCorrect ? 10 : -5)
        );
        console.log("Updating card mastery:", {
          currentMastery,
          newMasteryLevel,
          cardId: card.id,
        });
        return {
          ...card,
          masteryLevel: Math.max(0, newMasteryLevel),
          lastReviewed: new Date(),
          reviewCount: (card.reviewCount || 0) + 1,
        };
      }
      return card;
    });

    setCards(updatedCards);

    // Save mastery level changes to Drive/localStorage
    if (user) {
      try {
        const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(
          updatedCards,
          user.id
        );
        if (savedToDrive) {
          console.log("✅ Mastery level changes saved to Google Drive");
        } else {
          console.log("📱 Mastery level changes saved to localStorage only");
        }
      } catch (error) {
        console.error("Error saving mastery level changes:", error);
      }
    }

    // Update session stats
    setSessionStats((prev) => {
      const newStats = {
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        total: prev.total + 1,
      };
      console.log("Updated session stats:", newStats);
      return newStats;
    });

    // Show feedback
    setShowFeedback(
      isCorrect ? "Correct! +10 mastery" : "Incorrect! -5 mastery"
    );
    setTimeout(() => setShowFeedback(null), 2000);

    // Auto-advance if enabled
    if (autoAdvance) {
      setTimeout(() => {
        nextCard();
      }, autoAdvanceDelay * 1000);
    } else {
      // If auto-advance is disabled, wait a bit then move to next card
      setTimeout(() => {
        nextCard();
      }, 1500);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      endStudySession();
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setFilteredCards(shuffled);
    setCurrentCardIndex(0);
  };

  const editCard = (card: ParsedCard) => {
    setEditingCard(card);
    setShowCardEditor(true);
  };

  const saveCardEdit = async () => {
    if (!editingCard) return;

    const updatedCards = cards.map((card) =>
      card.id === editingCard.id ? editingCard : card
    );
    setCards(updatedCards);

    // Save to Drive/localStorage
    if (user) {
      try {
        const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(
          updatedCards,
          user.id
        );
        if (savedToDrive) {
          console.log("✅ Edited flashcards saved to Google Drive");
        } else {
          console.log("📱 Edited flashcards saved to localStorage only");
        }
      } catch (error) {
        console.error("Error saving edited flashcards:", error);
      }
    }

    setShowCardEditor(false);
    setEditingCard(null);
  };

  const deleteCard = async (cardId: string) => {
    if (confirm("Are you sure you want to delete this card?")) {
      const updatedCards = cards.filter((card) => card.id !== cardId);
      setCards(updatedCards);

      // Save to Drive/localStorage
      if (user) {
        try {
          const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(
            updatedCards,
            user.id
          );
          if (savedToDrive) {
            console.log("✅ Deleted flashcards saved to Google Drive");
          } else {
            console.log("📱 Deleted flashcards saved to localStorage only");
          }
        } catch (error) {
          console.error("Error saving flashcards after deletion:", error);
        }
      }
    }
  };

  const exportCards = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flashcards.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCards = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCards = JSON.parse(e.target?.result as string);
        setCards((prev) => [...prev, ...importedCards]);
        alert(`Successfully imported ${importedCards.length} cards!`);
      } catch (error) {
        alert("Error importing cards. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const getCategories = () => {
    const categories = new Set(
      cards.map((card) => card.category).filter(Boolean)
    );
    return Array.from(categories);
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    cards.forEach((card) => {
      if (card.tags) {
        card.tags.forEach((tag) => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  // Handle session expired errors
  const handleSessionExpired = (error: any) => {
    if (
      error.message &&
      error.message.includes("Google Drive access expired")
    ) {
      setSessionExpiredMessage(
        "Your Google Drive session has expired. You can continue using flashcards with local storage, or sign in again to sync with Google Drive."
      );
      setShowSessionExpiredModal(true);
      return true; // Indicates session expired was handled
    }
    return false; // Not a session expired error
  };

  // Handle relogin
  const handleRelogin = async () => {
    try {
      setShowSessionExpiredModal(false);
      setSessionExpiredMessage("");

      // Sign out first
      await realTimeAuth.logout();

      // Show a message that user should sign in again
      alert(
        "Please sign in again to refresh your Google Drive access. You will be redirected to the sign-in page."
      );

      // Redirect to sign-in (this will be handled by the auth system)
      // The user will need to manually navigate to sign-in or refresh the page
    } catch (error) {
      console.error("Error during relogin:", error);
      alert(
        "Error during relogin. Please try signing out and signing in again manually."
      );
    }
  };

  // Continue with local storage only
  const continueWithLocalStorage = () => {
    setShowSessionExpiredModal(false);
    setSessionExpiredMessage("");
    alert(
      "You can continue using flashcards with local storage. Your data will be saved locally and can be synced to Google Drive later when you sign in again."
    );
  };

  // Manual save function
  const saveFlashcards = async () => {
    if (!user || cards.length === 0) return;

    setIsSaving(true);
    setLastSaveStatus("saving");

    try {
      const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(
        cards,
        user.id
      );
      if (savedToDrive) {
        setLastSaveStatus("saved");
        console.log("✅ Manual save to Google Drive successful");
      } else {
        setLastSaveStatus("saved");
        console.log("📱 Manual save to localStorage successful");
      }

      // Reset status after 3 seconds
      setTimeout(() => setLastSaveStatus("idle"), 3000);
    } catch (error) {
      setLastSaveStatus("error");
      console.error("Error during manual save:", error);
      // Handle session expired errors
      if (!handleSessionExpired(error)) {
        // If not a session expired error, show generic error
        setTimeout(() => setLastSaveStatus("idle"), 5000);
      }
    } finally {
      setIsSaving(false);
    }
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

  const getMasteryColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 60) return "text-yellow-600";
    if (level >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const Flashcard: React.FC<{ card: ParsedCard; idx: number }> = ({
    card,
    idx,
  }) => {
    const [flipped, setFlipped] = React.useState(false);
    const [showTagInput, setShowTagInput] = React.useState(false);
    const [newTagInput, setNewTagInput] = React.useState("");
    const toggle = () => setFlipped((f) => !f);

    const handleAddTag = () => {
      if (newTagInput.trim()) {
        addTagToCard(card.id, newTagInput.trim());
        setNewTagInput("");
        setShowTagInput(false);
      }
    };

    const handleRemoveTag = (tag: string) => {
      removeTagFromCard(card.id, tag);
    };

    return (
      <div className="relative group" style={{ perspective: 1200 }}>
        <div
          className="relative w-full h-52 md:h-64 cursor-pointer"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 800ms cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={toggle}
        >
          {/* Front of card */}
          <div
            className="absolute inset-0 border-0 rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 p-6 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Header with card number and badges */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="text-sm text-gray-600 font-medium">Card</div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getDifficultyColor(
                    card.difficulty || "medium"
                  )}`}
                >
                  {card.difficulty || "medium"}
                </span>
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-200 relative overflow-hidden"
                      style={{
                        background: `conic-gradient(${
                          getMasteryColor(card.masteryLevel || 0).includes(
                            "green"
                          )
                            ? "#10b981"
                            : getMasteryColor(card.masteryLevel || 0).includes(
                                "yellow"
                              )
                            ? "#f59e0b"
                            : getMasteryColor(card.masteryLevel || 0).includes(
                                "orange"
                              )
                            ? "#f97316"
                            : "#ef4444"
                        } ${(card.masteryLevel || 0) * 3.6}deg, #e5e7eb 0deg)`,
                      }}
                    />
                    <span className="absolute text-xs font-bold text-gray-700">
                      {card.masteryLevel || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question content */}
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="font-bold text-gray-800 text-lg leading-relaxed max-w-full">
                {card.question}
              </div>
            </div>

            {/* Footer with tags and actions */}
            <div className="mt-4">
              {/* Tags */}
              <div className="mb-3">
                {card.tags && card.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {card.tags.slice(0, 5).map((tag, tagIdx) => {
                      const isUserTag = card.userTags?.includes(tag);
                      const isSystemTag = card.systemTags?.includes(tag);
                      const tagType =
                        isUserTag && isSystemTag
                          ? "both"
                          : isUserTag
                          ? "user"
                          : "system";

                      return (
                        <div key={tagIdx} className="relative group/tag">
                          <span
                            className={`px-3 py-1.5 text-white text-xs rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-1 ${
                              tagType === "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : tagType === "system"
                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                : "bg-gradient-to-r from-purple-500 to-purple-600"
                            }`}
                          >
                            <span>{tag}</span>
                            {tagType === "user" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTag(tag);
                                }}
                                className="w-4 h-4 bg-white/20 rounded-full hover:bg-white/40 transition-colors flex items-center justify-center"
                              >
                                <span className="text-xs">×</span>
                              </button>
                            )}
                          </span>

                          {/* Tag type indicator */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {tagType === "user"
                                ? "User Tag"
                                : tagType === "system"
                                ? "System Tag"
                                : "Both"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {card.tags.length > 5 && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-full font-medium shadow-sm">
                        +{card.tags.length - 5}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                      No tags
                    </span>
                  </div>
                )}
              </div>

              {/* Add Tag Button */}
              <div className="flex items-center justify-center">
                {!showTagInput ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTagInput(true);
                    }}
                    className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors text-xs font-medium"
                  >
                    + Add Tag
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="Enter tag..."
                      className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTagInput("");
                      }}
                      className="px-2 py-1 text-gray-500 text-xs rounded hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editCard(card);
                  }}
                  className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCard(card.id);
                  }}
                  className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <span>Click to flip</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0 border-0 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Answer header */}
            <div className="flex items-center justify-center mb-4">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <span className="text-white text-sm font-bold">ANSWER</span>
              </div>
            </div>

            {/* Answer content */}
            <div className="flex-1 flex items-center justify-center text-center mb-4">
              <div className="font-bold text-gray-800 text-lg leading-relaxed max-w-full">
                {card.answer}
              </div>
            </div>

            {/* Reasoning section */}
            {card.reasoning && (
              <div className="mb-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-900 text-sm">
                    Reasoning
                  </span>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed">
                  {card.reasoning}
                </div>
              </div>
            )}

            {/* Footer info */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Click to flip back</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Reviewed {card.reviewCount || 0} times</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card shadow effect */}
        <div className="absolute -bottom-2 left-2 right-2 h-2 bg-black/10 rounded-full blur-sm transform scale-x-95 group-hover:scale-x-100 transition-transform duration-300"></div>
      </div>
    );
  };

  const StudyCard: React.FC = () => {
    const currentCard = filteredCards[currentCardIndex];
    console.log("StudyCard render:", {
      currentCard,
      currentCardIndex,
      filteredCardsLength: filteredCards.length,
      studySession,
      sessionStats,
      showAnswer,
    });
    if (!currentCard) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="text-lg font-semibold text-gray-700">
              Card {currentCardIndex + 1} of {filteredCards.length}
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{
                width: `${
                  ((currentCardIndex + 1) / filteredCards.length) * 100
                }%`,
              }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}%
            Complete
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-200/50 backdrop-blur-sm">
          {showFeedback && (
            <div
              className={`text-center mb-6 p-4 rounded-2xl font-bold text-lg shadow-lg transform animate-bounce ${
                showFeedback.includes("Correct")
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white border-2 border-green-300"
                  : "bg-gradient-to-r from-red-400 to-red-600 text-white border-2 border-red-300"
              }`}
            >
              {showFeedback}
            </div>
          )}

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
              {currentCard.question}
            </h3>

            {showAnswer && (
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200/50 shadow-lg transform transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                    <span className="text-white text-sm font-bold">ANSWER</span>
                  </div>
                </div>
                <div className="font-bold text-gray-800 text-xl mb-4">
                  {currentCard.answer}
                </div>
                {currentCard.reasoning && (
                  <div className="mt-4 pt-4 border-t border-blue-200/50">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-900">
                        Reasoning
                      </span>
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed">
                      {currentCard.reasoning}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-6">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <Eye className="w-5 h-5 mr-2 inline" />
                Show Answer
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    console.log("Incorrect button clicked");
                    markCardAnswer(false);
                  }}
                  disabled={showFeedback !== null}
                  className={`px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center ${
                    showFeedback ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {showFeedback ? "Processing..." : "Incorrect"}
                </button>
                <button
                  onClick={() => {
                    console.log("Correct button clicked");
                    markCardAnswer(true);
                  }}
                  disabled={showFeedback !== null}
                  className={`px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center ${
                    showFeedback ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {showFeedback ? "Processing..." : "Correct"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={previousCard}
            disabled={currentCardIndex === 0}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-600/50">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Session Progress
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {sessionStats.correct + sessionStats.incorrect} /{" "}
              {filteredCards.length}
            </div>
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {sessionStats.correct} correct
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {sessionStats.incorrect} incorrect
                </span>
              </div>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              Session: {studySession?.id ? "Active" : "None"} | Mode:{" "}
              {studySession?.mode} | Card: {currentCardIndex + 1}
            </div>
          </div>

          <button
            onClick={nextCard}
            disabled={currentCardIndex === filteredCards.length - 1}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderCreateView = () => (
    <div className="space-y-6">
      {availableDocuments.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Document (Optional)
          </label>
          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Choose a document...</option>
            {availableDocuments.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text to Convert into Flashcards
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={
            selectedDocument
              ? "Text will be extracted from the selected document, or you can add additional text here..."
              : "Paste your text here to generate flashcards..."
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (Optional)
        </label>
        <div className="space-y-3">
          <input
            type="text"
            value={inputTags}
            placeholder="Enter tags separated by commas (e.g., math, algebra, equations)"
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            onChange={(e) => setInputTags(e.target.value)}
            onFocus={() => setShowTagSuggestions(true)}
          />

          {/* Tag Suggestions */}
          {showTagSuggestions &&
            (popularTags.length > 0 || suggestedTags.length > 0) && (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-lg">
                <div className="space-y-4">
                  {/* Popular Tags */}
                  {popularTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Popular Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              const currentTags = inputTags
                                ? inputTags.split(",").map((t) => t.trim())
                                : [];
                              if (!currentTags.includes(tag)) {
                                const newTags = [...currentTags, tag];
                                setInputTags(newTags.join(", "));
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Tags */}
                  {suggestedTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Suggested Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              const currentTags = inputTags
                                ? inputTags.split(",").map((t) => t.trim())
                                : [];
                              if (!currentTags.includes(tag)) {
                                const newTags = [...currentTags, tag];
                                setInputTags(newTags.join(", "));
                              }
                            }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full hover:bg-green-200 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowTagSuggestions(false)}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  Hide suggestions
                </button>
              </div>
            )}

          <p className="text-sm text-gray-500">
            Tags help organize and search your flashcards. Our system will also
            automatically add relevant tags based on content.
          </p>
        </div>
      </div>

      <button
        onClick={generateFlashcards}
        disabled={isLoading || (!inputText.trim() && !selectedDocument)}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Generating Flashcards...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Generate Flashcards
          </>
        )}
      </button>
    </div>
  );

  const renderStudyView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {studyMode === "review" && "Review Mode"}
          {studyMode === "new" && "New Cards"}
          {studyMode === "mastered" && "Mastered Cards"}
          {studyMode === "difficult" && "Difficult Cards"}
          {studyMode === "mixed" && "Mixed Study"}
        </h3>
        <p className="text-gray-600">
          {studyMode === "review" && "Review your flashcards at your own pace"}
          {studyMode === "new" && "Learn new cards for the first time"}
          {studyMode === "mastered" && "Review cards you have mastered"}
          {studyMode === "difficult" && "Focus on cards you find challenging"}
          {studyMode === "mixed" && "Mix of new and review cards"}
        </p>
      </div>

      <StudyCard />

      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={endStudySession}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );

  const renderManageView = () => {
    // Group cards by creation date
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentCards = filteredCards.filter(
      (card) => new Date(card.createdAt) >= oneWeekAgo
    );
    const previousCards = filteredCards.filter(
      (card) => new Date(card.createdAt) < oneWeekAgo
    );

    const allTagsInfo = getAllTagsWithInfo();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {getCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={cardOrder}
              onChange={(e) =>
                setCardOrder(e.target.value as "sequential" | "random")
              }
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="sequential">Newest First</option>
              <option value="random">Random Order</option>
            </select>

            <div className="relative">
              <select
                multiple
                value={selectedTags}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setSelectedTags(selectedOptions);
                }}
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px] bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Tags</option>
                {getAllTags().map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple tags
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedDifficulty("");
                setSelectedTags([]);
                setCardOrder("sequential");
              }}
              className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4 mr-1 inline" />
              Reset Filters
            </button>
            <button
              onClick={shuffleCards}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Shuffle cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={exportCards}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Export cards"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (user) {
                  try {
                    const loadedCards =
                      await driveStorageUtils.loadFlashcardsFromDrive(user.id);
                    if (loadedCards.length > 0) {
                      setCards(loadedCards);
                      alert(
                        `Synced ${loadedCards.length} flashcards from Drive!`
                      );
                    } else {
                      alert("No flashcards found in Drive.");
                    }
                  } catch (error) {
                    alert("Error syncing from Drive: " + error);
                  }
                }
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Sync from Drive"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <label className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={importCards}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Enhanced Tag Filter */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Filter by Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {allTagsInfo.slice(0, 20).map(({ tag, count, type }) => (
              <button
                key={tag}
                onClick={() => {
                  const isSelected = selectedTags.includes(tag);
                  if (isSelected) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 text-white shadow-md"
                    : type === "user"
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : type === "system"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                {tag} ({count})
                <span className="ml-1 text-xs opacity-75">
                  {type === "user" ? "👤" : type === "system" ? "🤖" : "🔗"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No flashcards found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recently Created Cards Section */}
            {recentCards.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Recently Created
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    {recentCards.length} cards
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recentCards.map((card, index) => (
                    <Flashcard key={card.id} card={card} idx={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Previous Cards Section */}
            {previousCards.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Previous
                  </h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {previousCards.length} cards
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {previousCards.map((card, index) => (
                    <Flashcard key={card.id} card={card} idx={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStatsView = () => {
    const totalCards = cards.length;
    const reviewedCards = cards.filter(
      (card) => card.reviewCount && card.reviewCount > 0
    ).length;
    const masteredCards = cards.filter(
      (card) => (card.masteryLevel || 0) >= 80
    ).length;
    const averageMastery =
      totalCards > 0
        ? Math.round(
            cards.reduce((sum, card) => sum + (card.masteryLevel || 0), 0) /
              totalCards
          )
        : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Cards
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalCards}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Reviewed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {reviewedCards}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mastered
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {masteredCards}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Mastery
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {averageMastery}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {studySession && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Last Study Session
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mode</p>
                <p className="font-medium text-gray-900 capitalize">
                  {studySession.mode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cards Reviewed</p>
                <p className="font-medium text-gray-900">
                  {studySession.cardsStudied.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="font-medium text-gray-900">
                  {studySession.cardsStudied.length > 0
                    ? Math.round(
                        (studySession.correctAnswers /
                          studySession.cardsStudied.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Study Modes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards); // Show all cards if no filters applied
                }
                startStudySession("review");
              }}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left bg-white dark:bg-slate-800"
            >
              <div className="flex items-center mb-2">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Review Mode</span>
              </div>
              <p className="text-sm text-gray-600">Study at your own pace</p>
            </button>

            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards);
                }
                startStudySession("new");
              }}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left bg-white dark:bg-slate-800"
            >
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">New Cards</span>
              </div>
              <p className="text-sm text-gray-600">Learn new cards</p>
            </button>

            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards);
                }
                startStudySession("difficult");
              }}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left bg-white dark:bg-slate-800"
            >
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-gray-900">
                  Difficult Cards
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Focus on challenging cards
              </p>
            </button>

            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards);
                }
                startStudySession("mastered");
              }}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left bg-white dark:bg-slate-800"
            >
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">
                  Mastered Cards
                </span>
              </div>
              <p className="text-sm text-gray-600">Review mastered content</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-gray-50 dark:bg-slate-900 h-full flex flex-col transition-colors duration-300"
      data-component="flashcards"
    >
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Flash Cards
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create, study, and master your knowledge
              </p>
              {/* Save Status Indicator */}
              <div className="flex items-center space-x-2 mt-1">
                {lastSaveStatus === "saving" && (
                  <div className="flex items-center space-x-1 text-sm text-blue-600">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                )}
                {lastSaveStatus === "saved" && (
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Saved!</span>
                  </div>
                )}
                {lastSaveStatus === "error" && (
                  <div className="flex items-center space-x-1 text-sm text-red-600">
                    <XCircle className="w-3 h-3" />
                    <span>Save failed</span>
                  </div>
                )}
                {lastSaveStatus === "idle" && cards.length > 0 && (
                  <>
                    {realTimeAuth.hasGoogleDriveAccess() ? (
                      <button
                        onClick={saveFlashcards}
                        disabled={isSaving}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3 h-3" />
                        <span>Save to Drive</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 text-sm text-orange-600">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Local Storage Only</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile-friendly navigation tabs */}
          <div className="tabs-mobile">
            <button
              onClick={() => setCurrentView("create")}
              className={`tab-mobile btn-touch flex items-center gap-2 ${
                currentView === "create" ? "active" : ""
              } ${
                currentView === "create"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="text-responsive-sm font-semibold truncate">
                Create
              </span>
            </button>
            <button
              onClick={() => setCurrentView("study")}
              className={`tab-mobile btn-touch flex items-center gap-2 ${
                currentView === "study" ? "active" : ""
              } ${
                currentView === "study"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Play className="w-4 h-4 flex-shrink-0" />
              <span className="text-responsive-sm font-semibold truncate">
                Study
              </span>
            </button>
            <button
              onClick={() => setCurrentView("manage")}
              className={`tab-mobile btn-touch flex items-center gap-2 ${
                currentView === "manage" ? "active" : ""
              } ${
                currentView === "manage"
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className="text-responsive-sm font-semibold truncate">
                Manage
              </span>
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className={`tab-mobile btn-touch flex items-center gap-2 ${
                currentView === "stats" ? "active" : ""
              } ${
                currentView === "stats"
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="text-responsive-sm font-semibold truncate">
                Stats
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Drive Access Warning */}
      {user &&
        !realTimeAuth.hasGoogleDriveAccess() &&
        realTimeAuth.shouldHaveGoogleDriveAccess() && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-6 mt-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-800">
                  <strong>Google Drive Access Expired:</strong> Your session has
                  expired.
                  <button
                    onClick={handleRelogin}
                    className="ml-2 underline hover:no-underline font-medium"
                  >
                    Sign in again
                  </button>
                  to sync your flashcards with Google Drive, or continue using
                  local storage.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {currentView === "create" && (
          <div className="space-y-8">
            {/* Create Form Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Create New Flashcards
              </h3>
              {renderCreateView()}
            </div>

            {/* Recently Created Cards Section */}
            {cards.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Recently Created Cards
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.slice(-6).map((card, index) => (
                    <Flashcard
                      key={card.id}
                      card={card}
                      idx={cards.length - 6 + index}
                    />
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button
                    onClick={() => setCurrentView("manage")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    View All Cards →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {currentView === "study" && renderStudyView()}
        {currentView === "manage" && renderManageView()}
        {currentView === "stats" && renderStatsView()}
      </div>

      {/* Session Expired Modal */}
      {showSessionExpiredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Session Expired
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {sessionExpiredMessage}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRelogin}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign In Again
              </button>
              <button
                onClick={continueWithLocalStorage}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Continue with Local Storage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Editor Modal */}
      {showCardEditor && editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Edit Flashcard
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={editingCard.question}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, question: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={editingCard.answer}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, answer: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reasoning (Optional)
                </label>
                <textarea
                  value={editingCard.reasoning || ""}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      reasoning: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingCard.category || ""}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={editingCard.difficulty || "medium"}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        difficulty: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Enhanced Tag Management */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>

                {/* Current Tags Display */}
                {editingCard.tags && editingCard.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Current tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {editingCard.tags.map((tag, index) => {
                        const isUserTag = editingCard.userTags?.includes(tag);
                        const isSystemTag =
                          editingCard.systemTags?.includes(tag);
                        const tagType =
                          isUserTag && isSystemTag
                            ? "both"
                            : isUserTag
                            ? "user"
                            : "system";

                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-1"
                          >
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                tagType === "user"
                                  ? "bg-blue-100 text-blue-700"
                                  : tagType === "system"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {tag}
                              <span className="ml-1 text-xs opacity-75">
                                {tagType === "user"
                                  ? "👤"
                                  : tagType === "system"
                                  ? "🤖"
                                  : "🔗"}
                              </span>
                            </span>
                            {isUserTag && (
                              <button
                                onClick={() => {
                                  const updatedUserTags = (
                                    editingCard.userTags || []
                                  ).filter((t) => t !== tag);
                                  const updatedTags = [
                                    ...new Set([
                                      ...updatedUserTags,
                                      ...(editingCard.systemTags || []),
                                    ]),
                                  ];
                                  setEditingCard({
                                    ...editingCard,
                                    tags: updatedTags,
                                    userTags: updatedUserTags,
                                  });
                                }}
                                className="w-4 h-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add New Tag */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add new tag..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const newTag = e.currentTarget.value.trim();
                        if (newTag && !editingCard.tags?.includes(newTag)) {
                          const updatedUserTags = [
                            ...(editingCard.userTags || []),
                            newTag,
                          ];
                          const updatedTags = [
                            ...new Set([
                              ...updatedUserTags,
                              ...(editingCard.systemTags || []),
                            ]),
                          ];
                          setEditingCard({
                            ...editingCard,
                            tags: updatedTags,
                            userTags: updatedUserTags,
                          });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      const newTag = input.value.trim();
                      if (newTag && !editingCard.tags?.includes(newTag)) {
                        const updatedUserTags = [
                          ...(editingCard.userTags || []),
                          newTag,
                        ];
                        const updatedTags = [
                          ...new Set([
                            ...updatedUserTags,
                            ...(editingCard.systemTags || []),
                          ]),
                        ];
                        setEditingCard({
                          ...editingCard,
                          tags: updatedTags,
                          userTags: updatedUserTags,
                        });
                        input.value = "";
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  💡 System tags (🤖) are automatically generated and cannot be
                  removed. User tags (👤) can be edited.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCardEditor(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCardEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Modal */}
      {showStudyModal && studySession && currentStudyCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {studySession.mode === "new" && "New Card Study"}
                {studySession.mode === "review" && "Review Session"}
                {studySession.mode === "mastered" && "Mastered Cards Review"}
                {studySession.mode === "difficult" &&
                  "Difficult Cards Practice"}
                {studySession.mode === "mixed" && "Mixed Study Session"}
              </h3>
              <button
                onClick={endStudySession}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>
                  Progress: {studySession.cardsStudied.length} /{" "}
                  {getStudyCards(studySession.mode).length}
                </span>
                <span>
                  Accuracy:{" "}
                  {studySession.cardsStudied.length > 0
                    ? Math.round(
                        (studySession.correctAnswers /
                          studySession.cardsStudied.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (studySession.cardsStudied.length /
                        getStudyCards(studySession.mode).length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Card Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Mastery: {currentStudyCard.masteryLevel || 0}%</span>
                <span>Reviews: {currentStudyCard.reviewCount || 0}</span>
                {currentStudyCard.nextReviewDate && (
                  <span>
                    Next:{" "}
                    {new Date(
                      currentStudyCard.nextReviewDate
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                <p className="text-gray-700">{currentStudyCard.question}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Answer:</h4>
                <p className="text-gray-700">{currentStudyCard.answer}</p>
              </div>

              {/* Quality Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  How well did you know this?
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    {
                      value: 1,
                      label: "Again",
                      color: "bg-red-100 text-red-700 hover:bg-red-200",
                    },
                    {
                      value: 2,
                      label: "Hard",
                      color:
                        "bg-orange-100 text-orange-700 hover:bg-orange-200",
                    },
                    {
                      value: 3,
                      label: "Good",
                      color:
                        "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                    },
                    {
                      value: 4,
                      label: "Easy",
                      color: "bg-green-100 text-green-700 hover:bg-green-200",
                    },
                    {
                      value: 5,
                      label: "Perfect",
                      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
                    },
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => handleCardResponse(value)}
                      className={`px-3 py-2 rounded-lg transition-colors font-medium ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  1=Complete blackout, 5=Perfect response
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCards;
