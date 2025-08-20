import React from "react";
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
  Share2
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
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  reviewCount?: number;
  masteryLevel?: number; // 0-100
  tags?: string[];
  createdAt: Date;
};

type StudyMode = 'review' | 'quiz' | 'spaced' | 'mastery';
type StudySession = {
  id: string;
  mode: StudyMode;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
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
  const [currentView, setCurrentView] = React.useState<'create' | 'study' | 'manage' | 'stats'>('create');
  const [studyMode, setStudyMode] = React.useState<StudyMode>('review');
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [studySession, setStudySession] = React.useState<StudySession | null>(null);
  const [sessionStats, setSessionStats] = React.useState({ correct: 0, incorrect: 0, total: 0 });
  const [showCardEditor, setShowCardEditor] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<ParsedCard | null>(null);
  const [cardOrder, setCardOrder] = React.useState<'sequential' | 'random'>('sequential');
  const [autoAdvance, setAutoAdvance] = React.useState(false);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = React.useState(3);
  const [showFeedback, setShowFeedback] = React.useState<string | null>(null);
  const [inputTags, setInputTags] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaveStatus, setLastSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showSessionExpiredModal, setShowSessionExpiredModal] = React.useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = React.useState('');

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
          const loadedCards = await driveStorageUtils.loadFlashcardsFromDrive(user.id);
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

  React.useEffect(() => {
    filterCards();
  }, [cards, searchTerm, selectedCategory, selectedDifficulty, selectedTags, cardOrder]);

  // Initialize filteredCards when cards are first loaded
  React.useEffect(() => {
    if (cards.length > 0 && filteredCards.length === 0) {
      setFilteredCards(cards);
    }
  }, [cards, filteredCards.length]);

  // Ensure study session is properly initialized when entering study view
  React.useEffect(() => {
    if (currentView === 'study' && !studySession) {
      // If we're in study view but no session, start one automatically
      if (cards.length > 0) {
        if (filteredCards.length === 0) {
          setFilteredCards(cards);
        }
        const session: StudySession = {
          id: generateId(),
          mode: 'review',
          startTime: new Date(),
          cardsReviewed: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
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
      filtered = filtered.filter(card =>
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(card => card.difficulty === selectedDifficulty);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(card => 
        card.tags && selectedTags.some(tag => card.tags!.includes(tag))
      );
    }

    // Sort cards based on order preference
    if (cardOrder === 'sequential') {
      // Newest first (most recently created)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (cardOrder === 'random') {
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
        if (mime.startsWith("image/") || file.content.startsWith("data:image")) {
          const ocr = await unifiedAIService.extractTextFromImage(file.content);
          return ocr.success && ocr.data ? ocr.data : "";
        }
        if (mime.includes("pdf") || (file.name && file.name.toLowerCase().endsWith(".pdf"))) {
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
        const downloaded = await driveStorageUtils.downloadFileContent(file.driveFileId);
        if (typeof downloaded === "string" && downloaded.length > 0) {
          const mime = file.mimeType || "";
          if (mime.includes("pdf") || (file.name && file.name.toLowerCase().endsWith(".pdf"))) {
            if (downloaded.startsWith("data:")) {
              try {
                return await extractTextFromPdfDataUrl(downloaded);
              } catch {
                return "";
              }
            }
            return "";
          }
          if (mime.startsWith("image/") || downloaded.startsWith("data:image")) {
            const ocr = await unifiedAIService.extractTextFromImage(downloaded);
            return ocr.success && ocr.data ? ocr.data : "";
          }
          if (
            mime === "text/plain" ||
            mime.startsWith("text/") ||
            (file.name && file.name.match(/\.(txt|md|json|js|ts|html|css|csv)$/i))
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

  const parseFlashcards = (raw: string, tags: string[] = []): ParsedCard[] => {
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
      return {
        id: generateId(),
        question: clean(qPart),
        answer: clean(aPart),
        reasoning: clean(rPart) || undefined,
        category: "General",
        difficulty: "medium" as const,
        lastReviewed: new Date(),
        reviewCount: 0,
        masteryLevel: 0,
        tags: tags,
        createdAt: new Date(),
      };
    });
    return parsed;
  };

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
        // Parse tags from input
        const tags = inputTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        const newCards = parseFlashcards(result.data, tags);
        const updatedCards = [...cards, ...newCards];
        setCards(updatedCards);
        
                 // Save to Drive/localStorage
         if (user) {
           try {
             const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(updatedCards, user.id);
             if (savedToDrive) {
               console.log("✅ Flashcards saved to Google Drive");
             } else {
               console.log("📱 Flashcards saved to localStorage only");
             }
           } catch (error) {
             console.error("Error saving flashcards:", error);
             // Handle session expired errors
             handleSessionExpired(error);
           }
         }
        
        setInputText("");
        setSelectedDocument("");
        setInputTags(""); // Clear tags input
        // Switch to manage view to show the newly created cards
        setCurrentView('manage');
        alert(`Successfully generated ${newCards.length} flashcards!`);
      } else {
        alert("AI processing failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      alert("An error occurred while generating flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const startStudySession = (mode: StudyMode) => {
    // Ensure we have cards to study
    if (cards.length === 0) {
      alert("No cards available for study. Please create some flashcards first.");
      return;
    }
    
    // Determine which cards to use for study
    let cardsToStudy = filteredCards;
    if (filteredCards.length === 0) {
      cardsToStudy = cards;
      setFilteredCards(cards);
    }
    
    if (cardsToStudy.length === 0) {
      alert("No cards available for study. Please create some flashcards first.");
      return;
    }

    console.log('Starting study session:', { mode, filteredCardsLength: cardsToStudy.length, cardsToStudy });

    const session: StudySession = {
      id: generateId(),
      mode,
      startTime: new Date(),
      cardsReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    };

    // Set the study session first
    setStudySession(session);
    
    // Ensure filteredCards is set before proceeding
    if (filteredCards.length === 0) {
      setFilteredCards(cards);
    }
    
    setCurrentCardIndex(0);
    setShowAnswer(false);
    // Reset session stats
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    setCurrentView('study');
    
    console.log('Study session started:', session);
  };

  const endStudySession = () => {
    if (studySession) {
      const updatedSession = {
        ...studySession,
        endTime: new Date(),
        cardsReviewed: sessionStats.total,
        correctAnswers: sessionStats.correct,
        incorrectAnswers: sessionStats.incorrect,
      };
      setStudySession(updatedSession);
    }
    setCurrentView('stats');
  };

  const markCardAnswer = async (isCorrect: boolean) => {
    console.log('markCardAnswer called with:', { isCorrect, studySession, currentCardIndex, filteredCardsLength: filteredCards.length });
    
    if (!studySession) {
      console.error('No study session active');
      console.log('Current state:', { studySession, currentView, cards: cards.length, filteredCards: filteredCards.length });
      return;
    }

    const currentCard = filteredCards[currentCardIndex];
    if (!currentCard) {
      console.error('No current card found');
      console.log('Current state:', { currentCardIndex, filteredCardsLength: filteredCards.length, filteredCardsArray: filteredCards });
      return;
    }

    // Prevent multiple calls
    if (showFeedback) {
      console.log('Feedback already showing, ignoring duplicate call');
      return;
    }

    console.log('Marking card answer:', { isCorrect, currentCard, currentCardIndex });

    // Update card mastery level
    const updatedCards = cards.map(card => {
      if (card.id === currentCard.id) {
        const currentMastery = card.masteryLevel || 0;
        const newMasteryLevel = Math.min(100, currentMastery + (isCorrect ? 10 : -5));
        console.log('Updating card mastery:', { currentMastery, newMasteryLevel, cardId: card.id });
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
        const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(updatedCards, user.id);
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
    setSessionStats(prev => {
      const newStats = {
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        total: prev.total + 1,
      };
      console.log('Updated session stats:', newStats);
      return newStats;
    });

    // Show feedback
    setShowFeedback(isCorrect ? 'Correct! +10 mastery' : 'Incorrect! -5 mastery');
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
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      endStudySession();
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
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

    const updatedCards = cards.map(card =>
      card.id === editingCard.id ? editingCard : card
    );
    setCards(updatedCards);
    
    // Save to Drive/localStorage
    if (user) {
      try {
        const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(updatedCards, user.id);
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
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      
      // Save to Drive/localStorage
      if (user) {
        try {
          const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(updatedCards, user.id);
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
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flashcards.json';
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
        setCards(prev => [...prev, ...importedCards]);
        alert(`Successfully imported ${importedCards.length} cards!`);
      } catch (error) {
        alert('Error importing cards. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const getCategories = () => {
    const categories = new Set(cards.map(card => card.category).filter(Boolean));
    return Array.from(categories);
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    cards.forEach(card => {
      if (card.tags) {
        card.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  // Handle session expired errors
  const handleSessionExpired = (error: any) => {
    if (error.message && error.message.includes('Google Drive access expired')) {
      setSessionExpiredMessage('Your Google Drive session has expired. You can continue using flashcards with local storage, or sign in again to sync with Google Drive.');
      setShowSessionExpiredModal(true);
      return true; // Indicates session expired was handled
    }
    return false; // Not a session expired error
  };

  // Handle relogin
  const handleRelogin = async () => {
    try {
      setShowSessionExpiredModal(false);
      setSessionExpiredMessage('');
      
      // Sign out first
      await realTimeAuth.logout();
      
      // Show a message that user should sign in again
      alert('Please sign in again to refresh your Google Drive access. You will be redirected to the sign-in page.');
      
      // Redirect to sign-in (this will be handled by the auth system)
      // The user will need to manually navigate to sign-in or refresh the page
    } catch (error) {
      console.error('Error during relogin:', error);
      alert('Error during relogin. Please try signing out and signing in again manually.');
    }
  };

  // Continue with local storage only
  const continueWithLocalStorage = () => {
    setShowSessionExpiredModal(false);
    setSessionExpiredMessage('');
    alert('You can continue using flashcards with local storage. Your data will be saved locally and can be synced to Google Drive later when you sign in again.');
  };

  // Manual save function
  const saveFlashcards = async () => {
    if (!user || cards.length === 0) return;
    
    setIsSaving(true);
    setLastSaveStatus('saving');
    
    try {
      const savedToDrive = await driveStorageUtils.saveFlashcardsToDrive(cards, user.id);
      if (savedToDrive) {
        setLastSaveStatus('saved');
        console.log("✅ Manual save to Google Drive successful");
      } else {
        setLastSaveStatus('saved');
        console.log("📱 Manual save to localStorage successful");
      }
      
      // Reset status after 3 seconds
      setTimeout(() => setLastSaveStatus('idle'), 3000);
    } catch (error) {
      setLastSaveStatus('error');
      console.error("Error during manual save:", error);
      // Handle session expired errors
      if (!handleSessionExpired(error)) {
        // If not a session expired error, show generic error
        setTimeout(() => setLastSaveStatus('idle'), 5000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 60) return 'text-yellow-600';
    if (level >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

    const Flashcard: React.FC<{ card: ParsedCard; idx: number }> = ({ card, idx }) => {
    const [flipped, setFlipped] = React.useState(false);
    const toggle = () => setFlipped((f) => !f);

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
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getDifficultyColor(card.difficulty || 'medium')}`}>
                  {card.difficulty || 'medium'}
                </span>
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200 relative overflow-hidden"
                      style={{
                        background: `conic-gradient(${getMasteryColor(card.masteryLevel || 0).includes('green') ? '#10b981' : getMasteryColor(card.masteryLevel || 0).includes('yellow') ? '#f59e0b' : getMasteryColor(card.masteryLevel || 0).includes('orange') ? '#f97316' : '#ef4444'} ${(card.masteryLevel || 0) * 3.6}deg, #e5e7eb 0deg)`
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
                    {card.tags.slice(0, 3).map((tag, tagIdx) => (
                      <span key={tagIdx} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200">
                        {tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-full font-medium shadow-sm">
                        +{card.tags.length - 3}
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

              {/* Action buttons */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); editCard(card); }}
                  className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
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
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
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
                  <span className="font-semibold text-blue-900 text-sm">Reasoning</span>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed">{card.reasoning}</div>
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
    console.log('StudyCard render:', { 
      currentCard, 
      currentCardIndex, 
      filteredCardsLength: filteredCards.length, 
      studySession,
      sessionStats,
      showAnswer
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
              style={{ width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}% Complete
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-200/50 backdrop-blur-sm">
          {showFeedback && (
            <div className={`text-center mb-6 p-4 rounded-2xl font-bold text-lg shadow-lg transform animate-bounce ${
              showFeedback.includes('Correct') 
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-2 border-green-300' 
                : 'bg-gradient-to-r from-red-400 to-red-600 text-white border-2 border-red-300'
            }`}>
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
                <div className="font-bold text-gray-800 text-xl mb-4">{currentCard.answer}</div>
                {currentCard.reasoning && (
                  <div className="mt-4 pt-4 border-t border-blue-200/50">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-900">Reasoning</span>
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed">{currentCard.reasoning}</div>
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
                    console.log('Incorrect button clicked');
                    markCardAnswer(false);
                  }}
                  disabled={showFeedback !== null}
                  className={`px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center ${
                    showFeedback ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {showFeedback ? 'Processing...' : 'Incorrect'}
                </button>
                <button
                  onClick={() => {
                    console.log('Correct button clicked');
                    markCardAnswer(true);
                  }}
                  disabled={showFeedback !== null}
                  className={`px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center ${
                    showFeedback ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {showFeedback ? 'Processing...' : 'Correct'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={previousCard}
            disabled={currentCardIndex === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center bg-white p-6 rounded-2xl shadow-lg border border-gray-200/50">
            <div className="text-sm text-gray-500 mb-2">Session Progress</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {sessionStats.correct + sessionStats.incorrect} / {filteredCards.length}
            </div>
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{sessionStats.correct} correct</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{sessionStats.incorrect} incorrect</span>
              </div>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              Session: {studySession?.id ? 'Active' : 'None'} | 
              Mode: {studySession?.mode} | 
              Card: {currentCardIndex + 1}
            </div>
          </div>
          
          <button
            onClick={nextCard}
            disabled={currentCardIndex === filteredCards.length - 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
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
        <input
          type="text"
          value={inputTags}
          placeholder="Enter tags separated by commas (e.g., math, algebra, equations)"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          onChange={(e) => setInputTags(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">Tags help organize and search your flashcards</p>
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
          {studyMode === 'review' && 'Review Mode'}
          {studyMode === 'quiz' && 'Quiz Mode'}
          {studyMode === 'spaced' && 'Spaced Repetition'}
          {studyMode === 'mastery' && 'Mastery Mode'}
        </h3>
        <p className="text-gray-600">
          {studyMode === 'review' && 'Review your flashcards at your own pace'}
          {studyMode === 'quiz' && 'Test your knowledge with immediate feedback'}
          {studyMode === 'spaced' && 'Review cards based on your performance'}
          {studyMode === 'mastery' && 'Focus on cards you need to improve'}
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

  const renderManageView = () => (
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
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={cardOrder}
            onChange={(e) => setCardOrder(e.target.value as 'sequential' | 'random')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sequential">Newest First</option>
            <option value="random">Random Order</option>
          </select>

          <div className="relative">
            <select
              multiple
              value={selectedTags}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedTags(selectedOptions);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="">All Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tags</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedDifficulty("");
              setSelectedTags([]);
              setCardOrder('sequential');
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
                   const loadedCards = await driveStorageUtils.loadFlashcardsFromDrive(user.id);
                   if (loadedCards.length > 0) {
                     setCards(loadedCards);
                     alert(`Synced ${loadedCards.length} flashcards from Drive!`);
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

      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card, index) => (
            <Flashcard key={card.id} card={card} idx={index} />
          ))}
        </div>
      )}
    </div>
  );

  const renderStatsView = () => {
    const totalCards = cards.length;
    const reviewedCards = cards.filter(card => card.reviewCount && card.reviewCount > 0).length;
    const masteredCards = cards.filter(card => (card.masteryLevel || 0) >= 80).length;
    const averageMastery = totalCards > 0 ? Math.round(cards.reduce((sum, card) => sum + (card.masteryLevel || 0), 0) / totalCards) : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-gray-900">{reviewedCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mastered</p>
                <p className="text-2xl font-bold text-gray-900">{masteredCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Mastery</p>
                <p className="text-2xl font-bold text-gray-900">{averageMastery}%</p>
              </div>
            </div>
          </div>
        </div>

        {studySession && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Study Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mode</p>
                <p className="font-medium text-gray-900 capitalize">{studySession.mode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cards Reviewed</p>
                <p className="font-medium text-gray-900">{studySession.cardsReviewed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="font-medium text-gray-900">
                  {studySession.cardsReviewed > 0
                    ? Math.round((studySession.correctAnswers / studySession.cardsReviewed) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Modes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards); // Show all cards if no filters applied
                }
                startStudySession('review');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
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
                startStudySession('quiz');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Quiz Mode</span>
              </div>
              <p className="text-sm text-gray-600">Test your knowledge</p>
            </button>

            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards);
                }
                startStudySession('spaced');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-gray-900">Spaced Repetition</span>
              </div>
              <p className="text-sm text-gray-600">Review based on performance</p>
            </button>

            <button
              onClick={() => {
                if (filteredCards.length === 0) {
                  setFilteredCards(cards);
                }
                startStudySession('mastery');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Mastery Mode</span>
              </div>
              <p className="text-sm text-gray-600">Focus on weak areas</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 h-full flex flex-col" data-component="flashcards">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center">
             <div className="bg-gradient-to-r from-green-100 to-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
               <BookOpen className="w-6 h-6 text-green-600" />
             </div>
             <div>
               <h2 className="text-3xl font-bold text-gray-900">Flash Cards</h2>
               <p className="text-gray-600">Create, study, and master your knowledge</p>
                               {/* Save Status Indicator */}
                <div className="flex items-center space-x-2 mt-1">
                  {lastSaveStatus === 'saving' && (
                    <div className="flex items-center space-x-1 text-sm text-blue-600">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  )}
                  {lastSaveStatus === 'saved' && (
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Saved!</span>
                    </div>
                  )}
                  {lastSaveStatus === 'error' && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <XCircle className="w-3 h-3" />
                      <span>Save failed</span>
                    </div>
                  )}
                  {lastSaveStatus === 'idle' && cards.length > 0 && (
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

                     <div className="flex items-center space-x-3">
             <button
               onClick={() => setCurrentView('create')}
               className={`px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                 currentView === 'create'
                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
                   : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
               }`}
             >
               <Plus className="w-5 h-5 mr-2 inline" />
               <span className="font-semibold">Create</span>
             </button>
             <button
               onClick={() => setCurrentView('study')}
               className={`px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                 currentView === 'study'
                   ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-xl'
                   : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
               }`}
             >
               <Play className="w-5 h-5 mr-2 inline" />
               <span className="font-semibold">Study</span>
             </button>
             <button
               onClick={() => setCurrentView('manage')}
               className={`px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                 currentView === 'manage'
                   ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                   : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
               }`}
             >
               <Settings className="w-5 h-5 mr-2 inline" />
               <span className="font-semibold">Manage</span>
             </button>
             <button
               onClick={() => setCurrentView('stats')}
               className={`px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                 currentView === 'stats'
                   ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl'
                   : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-orange-300'
               }`}
             >
               <BarChart3 className="w-5 h-5 mr-2 inline" />
               <span className="font-semibold">Stats</span>
             </button>
           </div>
                          </div>
       </div>

       {/* Google Drive Access Warning */}
       {user && !realTimeAuth.hasGoogleDriveAccess() && realTimeAuth.shouldHaveGoogleDriveAccess() && (
         <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-6 mt-4 rounded-r-lg">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
             </div>
             <div className="ml-3">
               <p className="text-sm text-orange-800">
                 <strong>Google Drive Access Expired:</strong> Your session has expired. 
                 <button
                   onClick={handleRelogin}
                   className="ml-2 underline hover:no-underline font-medium"
                 >
                   Sign in again
                 </button>
                 to sync your flashcards with Google Drive, or continue using local storage.
               </p>
             </div>
           </div>
         </div>
       )}

       {/* Main Content */}
       <div className="flex-1 overflow-auto p-6">
         {currentView === 'create' && (
           <div className="space-y-8">
             {/* Create Form Section */}
             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
               <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Flashcards</h3>
               {renderCreateView()}
             </div>
             
             {/* Recently Created Cards Section */}
             {cards.length > 0 && (
               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                 <h3 className="text-xl font-semibold text-gray-900 mb-6">Recently Created Cards</h3>
                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                   {cards.slice(-6).map((card, index) => (
                     <Flashcard key={card.id} card={card} idx={cards.length - 6 + index} />
                   ))}
                 </div>
                 <div className="text-center mt-6">
                   <button
                     onClick={() => setCurrentView('manage')}
                     className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                   >
                     View All Cards →
                   </button>
                 </div>
               </div>
             )}
           </div>
         )}
         {currentView === 'study' && renderStudyView()}
         {currentView === 'manage' && renderManageView()}
         {currentView === 'stats' && renderStatsView()}
       </div>

             {/* Session Expired Modal */}
       {showSessionExpiredModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-md">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <div className="w-8 h-8 bg-red-500 rounded-full"></div>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expired</h3>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Flashcard</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <textarea
                  value={editingCard.question}
                  onChange={(e) => setEditingCard({...editingCard, question: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                <textarea
                  value={editingCard.answer}
                  onChange={(e) => setEditingCard({...editingCard, answer: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reasoning (Optional)</label>
                <textarea
                  value={editingCard.reasoning || ''}
                  onChange={(e) => setEditingCard({...editingCard, reasoning: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

                             <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                   <input
                     type="text"
                     value={editingCard.category || ''}
                     onChange={(e) => setEditingCard({...editingCard, category: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                   <select
                     value={editingCard.difficulty || 'medium'}
                     onChange={(e) => setEditingCard({...editingCard, difficulty: e.target.value as any})}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="easy">Easy</option>
                     <option value="medium">Medium</option>
                     <option value="hard">Hard</option>
                   </select>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                 <input
                   type="text"
                   value={editingCard.tags?.join(', ') || ''}
                   onChange={(e) => {
                     const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                     setEditingCard({...editingCard, tags});
                   }}
                   placeholder="Enter tags separated by commas"
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
                 <p className="text-sm text-gray-500 mt-1">Separate multiple tags with commas</p>
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
    </div>
  );
};

export default FlashCards;


