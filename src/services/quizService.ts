import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "../utils/realTimeAuth";

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "essay";
  options?: string[]; // For multiple-choice and true-false
  correctAnswer: string | string[]; // Single answer or array for multiple correct answers
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    totalTime?: number; // Total quiz time in seconds
    timePerQuestion?: number; // Time per question in seconds
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultsImmediately: boolean;
    allowReview: boolean;
    passingScore?: number; // Percentage to pass
  };
  // Team/Community specific
  teamId?: string; // For team quizzes
  communityId?: string; // For community quizzes (always "global" for now)
  status: "draft" | "scheduled" | "active" | "completed" | "archived";
  scheduledStart?: Timestamp;
  scheduledEnd?: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  participants: string[]; // User IDs who can take the quiz
  maxParticipants?: number;
  startMode?: "synchronized" | "individual"; // How quiz starts: synchronized (admin starts for all) or individual (members start when ready)
  authorizedUsers?: string[]; // User IDs who can activate/start the quiz (creator + team admins/owners)
  synchronizedStartTime?: Date | FirebaseFirestore.Timestamp; // When synchronized quiz starts (10 seconds after activation)
  actualStartTime?: Date | FirebaseFirestore.Timestamp; // When synchronized quiz actually begins (after countdown)
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  startedAt: Timestamp;
  submittedAt?: Timestamp;
  answers: {
    questionId: string;
    answer: string | string[];
    timeSpent: number; // Time spent on question in seconds
  }[];
  score: number;
  totalPoints: number;
  percentage: number;
  status: "in-progress" | "submitted" | "timeout";
  timeRemaining?: number; // Time remaining when submitted
}

export interface QuizLeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number; // Time taken in seconds
  submittedAt: Timestamp;
  rank: number;
}

class QuizService {
  private teamQuizzesCollection = collection(db, "team_quizzes");
  private communityQuizzesCollection = collection(db, "community_quizzes");
  private teamQuizAttemptsCollection = collection(db, "team_quiz_attempts");
  private communityQuizAttemptsCollection = collection(db, "community_quiz_attempts");

  // ==================== QUIZ CRUD ====================

  async createTeamQuiz(
    teamId: string,
    userId: string,
    userName: string,
    quizData: Omit<Quiz, "id" | "createdBy" | "createdByName" | "createdAt" | "updatedAt" | "participants" | "authorizedUsers">
  ): Promise<string> {
    // Get authorized users (creator + team admins/owners)
    const authorizedUsers = await this.getAuthorizedUsers(teamId, userId);

    const quiz: Omit<Quiz, "id"> = {
      ...quizData,
      teamId,
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      participants: [], // Initially empty, can be set later
      status: quizData.status || "draft",
      startMode: quizData.startMode || "individual", // Default to individual
      authorizedUsers, // Set authorized users who can activate/start
    };

    const docRef = await addDoc(this.teamQuizzesCollection, quiz);
    return docRef.id;
  }

  async createCommunityQuiz(
    userId: string,
    userName: string,
    quizData: Omit<Quiz, "id" | "createdBy" | "createdByName" | "createdAt" | "updatedAt" | "participants" | "communityId" | "authorizedUsers">
  ): Promise<string> {
    // For community quizzes, only creator is authorized
    const authorizedUsers = [userId];

    const quiz: Omit<Quiz, "id"> = {
      ...quizData,
      communityId: "global",
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      participants: [], // For community, all members can participate
      status: quizData.status || "draft",
      startMode: quizData.startMode || "individual", // Default to individual
      authorizedUsers, // Only creator can activate community quizzes
    };

    const docRef = await addDoc(this.communityQuizzesCollection, quiz);
    return docRef.id;
  }

  async updateQuiz(
    quizId: string, 
    updates: Partial<Quiz>, 
    isCommunity: boolean = false,
    userId?: string
  ): Promise<void> {
    // If status is being changed to "active", check permissions
    if (updates.status === "active" && userId) {
      const quiz = await this.getQuiz(quizId, isCommunity);
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      
      console.log("updateQuiz permission check:", {
        quizId,
        startMode: quiz.startMode,
        quizCreatedBy: quiz.createdBy,
        userId,
        createdByType: typeof quiz.createdBy,
        userIdType: typeof userId,
        areEqual: quiz.createdBy === userId,
        stringEqual: String(quiz.createdBy) === String(userId)
      });
      
      // For synchronized mode, only creator can activate
      if (quiz.startMode === "synchronized") {
        // Use string comparison to handle any type mismatches
        if (String(quiz.createdBy) !== String(userId)) {
          throw new Error("Only the quiz creator can activate synchronized quizzes");
        }
      } else {
        // For other modes, check general permissions
        const canActivate = await this.canUserActivateQuiz(quizId, userId, isCommunity);
        if (!canActivate) {
          throw new Error("Only quiz creator or team admin/owner can activate quizzes");
        }
      }
    }

    const quizRef = doc(
      isCommunity ? this.communityQuizzesCollection : this.teamQuizzesCollection,
      quizId
    );
    
    // If status is being changed to "active", set startedAt
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    if (updates.status === "active" && !updates.startedAt) {
      updateData.startedAt = serverTimestamp();
      // For synchronized mode, set synchronized start time (10 seconds from now)
      const quiz = await this.getQuiz(quizId, isCommunity);
      if (quiz?.startMode === "synchronized") {
        // Set start time to 10 seconds from now
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + 10);
        updateData.synchronizedStartTime = Timestamp.fromDate(startTime);
        
        // Also set actual start time (when quiz actually begins after countdown)
        const actualStartTime = new Date();
        actualStartTime.setSeconds(actualStartTime.getSeconds() + 10);
        updateData.actualStartTime = Timestamp.fromDate(actualStartTime);
      }
    }
    
    await updateDoc(quizRef, updateData);
  }

  async deleteQuiz(quizId: string, userId: string, isCommunity: boolean = false): Promise<void> {
    const quizRef = doc(
      isCommunity ? this.communityQuizzesCollection : this.teamQuizzesCollection,
      quizId
    );
    
    const quizDoc = await getDoc(quizRef);
    if (!quizDoc.exists()) {
      throw new Error("Quiz not found");
    }

    const quizData = quizDoc.data();
    
    // Allow admin to delete any quiz, or creator to delete their own quiz
    const user = realTimeAuth.getCurrentUser();
    const isAdminUser = user?.email?.toLowerCase() === "akshayjuluri6704@gmail.com";
    
    if (!isAdminUser && quizData.createdBy !== userId) {
      throw new Error("Only quiz creator or admin can delete quizzes");
    }

    await deleteDoc(quizRef);
  }

  async getQuiz(quizId: string, isCommunity: boolean = false): Promise<Quiz | null> {
    const quizRef = doc(
      isCommunity ? this.communityQuizzesCollection : this.teamQuizzesCollection,
      quizId
    );
    const docSnap = await getDoc(quizRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Quiz;
    }
    return null;
  }

  // ==================== QUIZ SUBSCRIPTIONS ====================

  subscribeToTeamQuizzes(
    teamId: string,
    callback: (quizzes: Quiz[]) => void
  ): () => void {
    // Try optimized query first, fallback to simpler query if index is missing
    const optimizedQuery = query(
      this.teamQuizzesCollection,
      where("teamId", "==", teamId),
      orderBy("createdAt", "desc")
    );

    let unsubscribeFn: (() => void) | null = null;
    let usingFallback = false;

    // Helper to set up fallback subscription
    const setupFallback = () => {
      if (usingFallback) return; // Prevent multiple fallback setups
      usingFallback = true;
      
      console.warn(
        "Firestore index missing for team_quizzes, using fallback query. Consider creating the index for better performance."
      );

      const fallbackQuery = query(
        this.teamQuizzesCollection,
        where("teamId", "==", teamId)
      );

      unsubscribeFn = onSnapshot(fallbackQuery, (snapshot) => {
        const quizzes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Quiz[];

        // Sort in memory by createdAt (descending)
        quizzes.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });

        callback(quizzes);
      });
    };

    unsubscribeFn = onSnapshot(
      optimizedQuery,
      (snapshot) => {
        const quizzes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Quiz[];
        callback(quizzes);
      },
      (error) => {
        // If index is missing, fallback to simpler query
        if (
          error.code === "failed-precondition" ||
          error.message?.includes("index")
        ) {
          setupFallback();
        } else {
          // For other errors, log and use fallback as well
          console.error("Error subscribing to team quizzes:", error);
          setupFallback();
        }
      }
    );

    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }

  subscribeToCommunityQuizzes(
    callback: (quizzes: Quiz[]) => void
  ): () => void {
    const q = query(
      this.communityQuizzesCollection,
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const quizzes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Quiz[];
      callback(quizzes);
    });
  }

  subscribeToQuiz(
    quizId: string,
    isCommunity: boolean,
    callback: (quiz: Quiz | null) => void
  ): () => void {
    const quizRef = doc(
      isCommunity ? this.communityQuizzesCollection : this.teamQuizzesCollection,
      quizId
    );

    return onSnapshot(quizRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Quiz);
      } else {
        callback(null);
      }
    });
  }

  // ==================== QUIZ ATTEMPTS ====================

  async startQuizAttempt(
    quizId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    isCommunity: boolean = false
  ): Promise<string> {
    const quiz = await this.getQuiz(quizId, isCommunity);
    if (!quiz) throw new Error("Quiz not found");

    // For synchronized quizzes, check if quiz is active and countdown has finished
    if (quiz.startMode === "synchronized") {
      if (quiz.status !== "active") {
        throw new Error("This quiz has not been activated yet. Please wait for activation.");
      }
      
      // Check if countdown has finished
      if (quiz.synchronizedStartTime) {
        const startTime = quiz.synchronizedStartTime instanceof Date 
          ? quiz.synchronizedStartTime.getTime()
          : (quiz.synchronizedStartTime as any).toMillis?.() || (quiz.synchronizedStartTime as any).seconds * 1000;
        const now = Date.now();
        const timeUntilStart = Math.floor((startTime - now) / 1000);
        
        if (timeUntilStart > 0) {
          throw new Error(`Please wait ${timeUntilStart} more second(s) before starting the quiz.`);
        }
      }
    }

    // Check if user already has an attempt
    const existingAttempts = await this.getUserAttempts(quizId, userId, isCommunity);
    if (existingAttempts.length > 0 && !existingAttempts[0].submittedAt) {
      // Return existing in-progress attempt
      return existingAttempts[0].id;
    }

    const attempt: Omit<QuizAttempt, "id"> = {
      quizId,
      userId,
      userName,
      ...(userAvatar && { userAvatar }), // Only include userAvatar if it's defined
      startedAt: serverTimestamp() as Timestamp,
      answers: [],
      score: 0,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      status: "in-progress",
    };

    const collectionRef = isCommunity
      ? this.communityQuizAttemptsCollection
      : this.teamQuizAttemptsCollection;

    const docRef = await addDoc(collectionRef, attempt);

    // Update quiz to mark as started if first attempt
    // BUT: For synchronized quizzes, don't auto-activate - they must be activated manually
    if ((quiz.status === "scheduled" || quiz.status === "draft") && quiz.startMode !== "synchronized") {
      await this.updateQuiz(quizId, { 
        status: "active",
        startedAt: serverTimestamp() as Timestamp,
      }, isCommunity);
    }

    // Add user to participants if not already added
    if (!quiz.participants.includes(userId)) {
      await this.updateQuiz(quizId, {
        participants: arrayUnion(userId),
      }, isCommunity);
    }

    return docRef.id;
  }

  async submitQuizAnswer(
    attemptId: string,
    questionId: string,
    answer: string | string[],
    timeSpent: number,
    isCommunity: boolean = false
  ): Promise<void> {
    const collectionRef = isCommunity
      ? this.communityQuizAttemptsCollection
      : this.teamQuizAttemptsCollection;

    const attemptRef = doc(collectionRef, attemptId);
    const attemptSnap = await getDoc(attemptRef);

    if (!attemptSnap.exists()) throw new Error("Attempt not found");

    const attempt = attemptSnap.data() as QuizAttempt;
    
    // Remove existing answer for this question if exists
    const existingAnswers = attempt.answers.filter((a) => a.questionId !== questionId);
    existingAnswers.push({ questionId, answer, timeSpent });

    await updateDoc(attemptRef, {
      answers: existingAnswers,
    });
  }

  async submitQuizAttempt(
    attemptId: string,
    quizId: string,
    isCommunity: boolean = false
  ): Promise<QuizAttempt> {
    const collectionRef = isCommunity
      ? this.communityQuizAttemptsCollection
      : this.teamQuizAttemptsCollection;

    const attemptRef = doc(collectionRef, attemptId);
    const attemptSnap = await getDoc(attemptRef);

    if (!attemptSnap.exists()) throw new Error("Attempt not found");

    const attempt = attemptSnap.data() as QuizAttempt;
    const quiz = await this.getQuiz(quizId, isCommunity);
    if (!quiz) throw new Error("Quiz not found");

    // Calculate score
    let score = 0;
    attempt.answers.forEach((ans) => {
      const question = quiz.questions.find((q) => q.id === ans.questionId);
      if (!question) return;

      if (Array.isArray(question.correctAnswer)) {
        // Multiple correct answers
        const userAnswers = Array.isArray(ans.answer) ? ans.answer : [ans.answer];
        const correctAnswers = question.correctAnswer;
        const allCorrect = correctAnswers.every((ca) => userAnswers.includes(ca));
        if (allCorrect) score += question.points;
      } else {
        // Single correct answer
        const userAnswer = Array.isArray(ans.answer) ? ans.answer[0] : ans.answer;
        if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          score += question.points;
        }
      }
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    await updateDoc(attemptRef, {
      submittedAt: serverTimestamp(),
      score,
      totalPoints,
      percentage,
      status: "submitted",
    });

    const updatedAttempt = {
      ...attempt,
      submittedAt: serverTimestamp() as Timestamp,
      score,
      totalPoints,
      percentage,
      status: "submitted" as const,
    };

    // Check if all participants have submitted
    const allAttempts = await this.getQuizAttempts(quizId, isCommunity);
    const allSubmitted = allAttempts.every(
      (a) => a.submittedAt || a.status === "submitted"
    );

    if (allSubmitted && quiz.status === "active") {
      await this.updateQuiz(quizId, {
        status: "completed",
        endedAt: serverTimestamp() as Timestamp,
      }, isCommunity);
    }

    return updatedAttempt as QuizAttempt;
  }

  async getUserAttempts(
    quizId: string,
    userId: string,
    isCommunity: boolean = false
  ): Promise<QuizAttempt[]> {
    const collectionRef = isCommunity
      ? this.communityQuizAttemptsCollection
      : this.teamQuizAttemptsCollection;

    const q = query(
      collectionRef,
      where("quizId", "==", quizId),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizAttempt[];
  }

  async getQuizAttempts(
    quizId: string,
    isCommunity: boolean = false
  ): Promise<QuizAttempt[]> {
    const collectionRef = isCommunity
      ? this.communityQuizAttemptsCollection
      : this.teamQuizAttemptsCollection;

    const q = query(
      collectionRef,
      where("quizId", "==", quizId),
      orderBy("submittedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizAttempt[];
  }

  subscribeToQuizAttempts(
    quizId: string,
    isCommunity: boolean,
    callback: (attempts: QuizAttempt[]) => void
  ): () => void {
    const collectionRef = isCommunity
      ? this.communityQuizAttemptsCollection
      : this.teamQuizAttemptsCollection;

    const q = query(
      collectionRef,
      where("quizId", "==", quizId),
      orderBy("submittedAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const attempts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuizAttempt[];
      callback(attempts);
    });
  }

  // ==================== LEADERBOARD ====================

  async getQuizLeaderboard(
    quizId: string,
    isCommunity: boolean = false
  ): Promise<QuizLeaderboardEntry[]> {
    const attempts = await this.getQuizAttempts(quizId, isCommunity);
    
    const submittedAttempts = attempts
      .filter((a) => a.submittedAt && a.status === "submitted")
      .map((a) => {
        const timeTaken = a.submittedAt
          ? a.submittedAt.toMillis() - a.startedAt.toMillis()
          : 0;
        return {
          userId: a.userId,
          userName: a.userName,
          userAvatar: a.userAvatar,
          score: a.score,
          totalPoints: a.totalPoints,
          percentage: a.percentage,
          timeTaken: Math.floor(timeTaken / 1000), // Convert to seconds
          submittedAt: a.submittedAt!,
          rank: 0, // Will be set after sorting
        };
      });

    // Sort by percentage (desc), then by time (asc), then by submission time (asc)
    submittedAttempts.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      if (a.timeTaken !== b.timeTaken) {
        return a.timeTaken - b.timeTaken;
      }
      return a.submittedAt.toMillis() - b.submittedAt.toMillis();
    });

    // Assign ranks
    submittedAttempts.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return submittedAttempts;
  }

  subscribeToQuizLeaderboard(
    quizId: string,
    isCommunity: boolean,
    callback: (leaderboard: QuizLeaderboardEntry[]) => void
  ): () => void {
    return this.subscribeToQuizAttempts(
      quizId,
      isCommunity,
      async (attempts) => {
        const leaderboard = await this.getQuizLeaderboard(quizId, isCommunity);
        callback(leaderboard);
      }
    );
  }

  // ==================== AI QUESTION GENERATION ====================

  async generateAIQuestions(
    topic: string,
    numQuestions: number = 5,
    difficulty: "easy" | "medium" | "hard" = "medium",
    questionTypes: Array<"multiple-choice" | "true-false" | "short-answer"> = ["multiple-choice"]
  ): Promise<QuizQuestion[]> {
    // Try to use Google Gemini API if available
    const geminiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    
    if (geminiKey && geminiKey.trim() !== "") {
      try {
        return await this.generateQuestionsWithGemini(topic, numQuestions, difficulty, questionTypes);
      } catch (error) {
        console.error("Error generating questions with Gemini:", error);
        console.log("Falling back to improved mock questions...");
      }
    }

    // Fallback: Generate improved varied mock questions
    return this.generateVariedMockQuestions(topic, numQuestions, difficulty, questionTypes);
  }

  private async generateQuestionsWithGemini(
    topic: string,
    numQuestions: number,
    difficulty: "easy" | "medium" | "hard",
    questionTypes: Array<"multiple-choice" | "true-false" | "short-answer">
  ): Promise<QuizQuestion[]> {
    const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash-exp";

    const prompt = `Generate ${numQuestions} ${difficulty} difficulty quiz questions about "${topic}".
Each question should be unique and cover different aspects of ${topic}.

Requirements:
- Questions should be varied and test different concepts within ${topic}
- For multiple-choice questions: Provide 4 distinct options with one correct answer
- For true/false questions: Make them meaningful statements about ${topic}
- For short-answer questions: Ask about specific concepts that can be explained briefly
- Mix the question types: ${questionTypes.join(", ")}

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text here",
    "type": "multiple-choice" | "true-false" | "short-answer",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"] (only for multiple-choice and true-false),
    "correctAnswer": "Correct answer text",
    "explanation": "Brief explanation of why this is correct",
    "points": 1
  }
]

Make sure each question is unique and tests different aspects of ${topic}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Our AI servers are busy right now. Please try again in a few moments.");
    }

    const data = await response.json();
    const responseText = data.candidates[0]?.content?.parts[0]?.text || "";

    // Extract JSON from the response (handle markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0].trim();
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0].trim();
    }

    const parsedQuestions = JSON.parse(jsonText);

    // Map to our QuizQuestion format
    return parsedQuestions.map((q: any, index: number) => ({
      id: `ai-q-${Date.now()}-${index}`,
      question: q.question || "",
      type: q.type || "multiple-choice",
      options: q.options || (q.type === "true-false" ? ["True", "False"] : []),
      correctAnswer: q.correctAnswer || "",
      points: q.points || (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3),
      explanation: q.explanation || "",
    }));
  }

  private generateVariedMockQuestions(
    topic: string,
    numQuestions: number,
    difficulty: "easy" | "medium" | "hard",
    questionTypes: Array<"multiple-choice" | "true-false" | "short-answer">
  ): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const topicLower = topic.toLowerCase();
    
    // Question templates for different aspects of a topic
    const questionTemplates: Record<string, string[]> = {
      programming: [
        "What is the primary purpose of",
        "Which keyword is used for",
        "What is the difference between",
        "Which method is used to",
        "What does the following concept allow you to do:",
        "In which scenario would you use",
        "What is the time complexity of",
        "Which design pattern is best for",
      ],
      general: [
        "What is the main characteristic of",
        "Which feature distinguishes",
        "What are the key benefits of",
        "What problem does",
        "How does",
        "What is the relationship between",
        "Which aspect is most important when",
      ],
    };

    // Determine question category
    const isProgramming = /(java|javascript|python|react|node|html|css|programming|code|algorithm|data structure|function|class|variable|api|database)/i.test(topic);
    const templates = isProgramming ? questionTemplates.programming : questionTemplates.general;

    // Generate varied options for multiple choice
    const generateOptions = (correctAnswer: string, index: number) => {
      const options = [correctAnswer];
      
      // Generate plausible distractors
      const distractorPatterns = [
        `${topic} alternative`,
        `opposite of ${correctAnswer}`,
        `related concept in ${topic}`,
        `incorrect implementation`,
      ];

      for (let i = 0; i < 3; i++) {
        const pattern = distractorPatterns[i % distractorPatterns.length];
        options.push(`${pattern} (Option ${String.fromCharCode(66 + i)})`);
      }

      // Shuffle options
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    };

    for (let i = 0; i < numQuestions; i++) {
      const questionType = questionTypes[i % questionTypes.length];
      const templateIndex = i % templates.length;
      const questionNum = i + 1;

      if (questionType === "multiple-choice") {
        // Generate varied questions
        const questionTexts = [
          `${templates[templateIndex]} ${topic}?`,
          `Question ${questionNum}: What is a key ${topicLower} concept?`,
          `Which of the following is true about ${topic}?`,
          `In ${topic}, what is the primary use of...?`,
          `What distinguishes ${topic} from similar concepts?`,
        ];

        const correctAnswers = [
          `Primary ${topic} feature`,
          `Core ${topic} concept`,
          `Essential ${topic} component`,
          `Fundamental ${topic} principle`,
        ];

        const questionText = questionTexts[i % questionTexts.length];
        const correctAnswer = correctAnswers[i % correctAnswers.length];
        const options = generateOptions(correctAnswer, i);

        questions.push({
          id: `ai-q-${Date.now()}-${i}`,
          question: questionText,
          type: "multiple-choice",
          options,
          correctAnswer,
          points: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3,
          explanation: `This answer is correct because it represents a fundamental aspect of ${topic}.`,
        });
      } else if (questionType === "true-false") {
        const statements = [
          `${topic} is primarily used for specific purposes.`,
          `Understanding ${topic} requires knowledge of related concepts.`,
          `${topic} can be implemented in multiple ways.`,
          `The concepts of ${topic} are widely applicable.`,
          `${topic} is essential for modern development.`,
        ];

        const correctAnswer = i % 2 === 0 ? "True" : "False";

        questions.push({
          id: `ai-q-${Date.now()}-${i}`,
          question: statements[i % statements.length],
          type: "true-false",
          options: ["True", "False"],
          correctAnswer,
          points: difficulty === "easy" ? 1 : 2,
          explanation: `This statement is ${correctAnswer.toLowerCase()} because...`,
        });
      } else {
        const shortAnswerQuestions = [
          `Explain a fundamental concept of ${topic}.`,
          `What are the key features of ${topic}?`,
          `Describe how ${topic} works.`,
          `What is the importance of ${topic}?`,
          `Explain a common use case for ${topic}.`,
        ];

        questions.push({
          id: `ai-q-${Date.now()}-${i}`,
          question: shortAnswerQuestions[i % shortAnswerQuestions.length],
          type: "short-answer",
          correctAnswer: `${topic} involves key concepts and principles that enable...`,
          points: difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5,
        });
      }
    }

    return questions;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user is team admin or owner
   */
  async isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
    try {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (!teamDoc.exists()) return false;

      const teamData = teamDoc.data();
      const member = teamData.members?.[userId];
      
      if (!member) return false;
      
      // Owner or admin can manage quizzes
      return member.role === "owner" || member.role === "admin";
    } catch (error) {
      console.error("Error checking team admin status:", error);
      return false;
    }
  }

  /**
   * Check if user can activate/start a quiz
   */
  async canUserActivateQuiz(
    quizId: string,
    userId: string,
    isCommunity: boolean = false
  ): Promise<boolean> {
    const quiz = await this.getQuiz(quizId, isCommunity);
    if (!quiz) return false;

    // Creator can always activate
    if (quiz.createdBy === userId) return true;

    // Check authorized users list
    if (quiz.authorizedUsers && quiz.authorizedUsers.includes(userId)) {
      return true;
    }

    // For team quizzes, check if user is team admin/owner
    if (quiz.teamId && !isCommunity) {
      return await this.isTeamAdmin(quiz.teamId, userId);
    }

    // For community quizzes, only creator can activate (handled above)
    return false;
  }

  /**
   * Get authorized users for a quiz (creator + team admins/owners)
   */
  async getAuthorizedUsers(teamId: string | undefined, creatorId: string): Promise<string[]> {
    const authorized: string[] = [creatorId];

    if (teamId) {
      try {
        const teamDoc = await getDoc(doc(db, "teams", teamId));
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          const members = teamData.members || {};

          // Add all admins and owners
          Object.entries(members).forEach(([memberId, member]: [string, any]) => {
            if ((member.role === "owner" || member.role === "admin") && !authorized.includes(memberId)) {
              authorized.push(memberId);
            }
          });
        }
      } catch (error) {
        console.error("Error getting authorized users:", error);
      }
    }

    return authorized;
  }

  async checkUserCanTakeQuiz(
    quizId: string,
    userId: string,
    isCommunity: boolean = false
  ): Promise<boolean> {
    const quiz = await this.getQuiz(quizId, isCommunity);
    if (!quiz) return false;

    // For synchronized mode, quiz must be active
    if (quiz.startMode === "synchronized" && quiz.status !== "active") {
      return false;
    }

    // Check if quiz is active or scheduled (for individual mode)
    if (quiz.status !== "active" && quiz.status !== "scheduled") {
      return false;
    }

    // Check if user has already submitted
    const attempts = await this.getUserAttempts(quizId, userId, isCommunity);
    if (attempts.some((a) => a.submittedAt)) {
      return false;
    }

    // For team quizzes, check if user is a participant
    if (quiz.teamId && quiz.participants.length > 0) {
      return quiz.participants.includes(userId);
    }

    // For community quizzes, anyone can take
    if (quiz.communityId === "global") {
      return true;
    }

    return true;
  }
}

export const quizService = new QuizService();
