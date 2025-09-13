import { firestoreUserTasks } from "./firestoreUserTasks";
import { Task } from "../types";
import { InterviewPerformanceData } from "./performanceAnalytics";
import { unifiedAnalyticsStorage } from "./unifiedAnalyticsStorage";

export const createDemoTasks = async (userId: string) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const demoTasks: Omit<Task, "id" | "userId">[] = [
    {
      title: "Complete Math Assignment",
      description: "Solve problems 1-20 from Chapter 5",
      subject: "Mathematics",
      dueDate: today.toISOString().split("T")[0], // Today
      priority: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Read Science Chapter",
      description: "Read Chapter 8: Chemical Reactions",
      subject: "Chemistry",
      dueDate: today.toISOString().split("T")[0], // Today
      priority: "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "History Essay Draft",
      description: "Write first draft of World War II essay",
      subject: "History",
      dueDate: tomorrow.toISOString().split("T")[0], // Tomorrow
      priority: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Physics Lab Report",
      description: "Complete lab report on pendulum experiment",
      subject: "Physics",
      dueDate: tomorrow.toISOString().split("T")[0], // Tomorrow
      priority: "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "English Vocabulary",
      description: "Study vocabulary words 1-50",
      subject: "English",
      dueDate: nextWeek.toISOString().split("T")[0], // Next week
      priority: "low",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Biology Quiz Prep",
      description: "Review cell structure and functions",
      subject: "Biology",
      dueDate: yesterday.toISOString().split("T")[0], // Overdue
      priority: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Spanish Homework",
      description: "Complete conjugation exercises",
      subject: "Spanish",
      dueDate: yesterday.toISOString().split("T")[0], // Completed task
      priority: "medium",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    for (const task of demoTasks) {
      await firestoreUserTasks.addTask(userId, task);
    }
    console.log("Demo tasks created successfully!");
  } catch (error) {
    console.error("Error creating demo tasks:", error);
  }
};

// Helper function to clear all tasks (for testing)
export const clearAllTasks = async (userId: string) => {
  try {
    const tasks = await firestoreUserTasks.getTasks(userId);
    for (const task of tasks) {
      await firestoreUserTasks.deleteTask(userId, task.id);
    }
    console.log("All tasks cleared successfully!");
  } catch (error) {
    console.error("Error clearing tasks:", error);
  }
};

/**
 * Generate realistic demo interview performance data
 */
export const generateDemoInterviewData = (
  index: number = 0,
  baseDate: Date = new Date()
): InterviewPerformanceData => {
  const roles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "Mobile Developer",
  ];

  const difficulties = ["easy", "medium", "hard"];

  // Create variation in scores to make data realistic
  const baseScore = 60 + Math.random() * 30; // 60-90 range
  const variation = (Math.random() - 0.5) * 20; // ±10 variation

  const role = roles[index % roles.length];
  const difficulty = difficulties[index % difficulties.length];

  // Create interview date going back in time
  const interviewDate = new Date(baseDate);
  interviewDate.setDate(interviewDate.getDate() - index * 3); // Every 3 days

  const overallScore = Math.max(20, Math.min(95, baseScore + variation));
  const technicalScore = Math.max(
    15,
    Math.min(100, overallScore + (Math.random() - 0.5) * 15)
  );
  const communicationScore = Math.max(
    15,
    Math.min(100, overallScore + (Math.random() - 0.5) * 15)
  );
  const behavioralScore = Math.max(
    15,
    Math.min(100, overallScore + (Math.random() - 0.5) * 15)
  );

  return {
    id: `demo_interview_${Date.now()}_${index}`,
    timestamp: interviewDate.toISOString(),
    role,
    difficulty,
    duration: 1200 + Math.random() * 1800, // 20-50 minutes
    overallScore: Math.round(overallScore),
    technicalScore: Math.round(technicalScore),
    communicationScore: Math.round(communicationScore),
    behavioralScore: Math.round(behavioralScore),
    questionsAnswered: 3 + Math.floor(Math.random() * 5), // 3-7 questions
    questionsCorrect:
      Math.floor((overallScore / 100) * 5) + Math.floor(Math.random() * 2),
    averageResponseTime: 30 + Math.random() * 90, // 30-120 seconds

    speechAnalysis: {
      pronunciationAssessment: {
        clarity: Math.round(communicationScore + (Math.random() - 0.5) * 10),
        pronunciation: Math.round(
          communicationScore + (Math.random() - 0.5) * 10
        ),
        fluency: Math.round(communicationScore + (Math.random() - 0.5) * 10),
      },
      paceAnalysis: {
        wordsPerMinute: 120 + Math.random() * 60, // 120-180 WPM
        pauseFrequency: 5 + Math.random() * 15,
        paceVariation: Math.random() * 20,
      },
      confidenceScore: {
        overall: Math.round(behavioralScore + (Math.random() - 0.5) * 10),
        voiceStability: Math.round(
          behavioralScore + (Math.random() - 0.5) * 10
        ),
        speechPattern: Math.round(behavioralScore + (Math.random() - 0.5) * 10),
      },
      fillerWords: {
        count: Math.floor(Math.random() * 20),
        percentage: Math.random() * 5,
        types: ["um", "uh", "like", "you know"],
      },
    },

    bodyLanguageAnalysis: {
      eyeContact: {
        score: Math.round(behavioralScore + (Math.random() - 0.5) * 15),
        frequency: Math.random() * 100,
        duration: Math.random() * 100,
      },
      posture: {
        score: Math.round(behavioralScore + (Math.random() - 0.5) * 15),
        stability: Math.random() * 100,
        confidence: Math.random() * 100,
      },
      gestures: {
        score: Math.round(behavioralScore + (Math.random() - 0.5) * 15),
        frequency: Math.random() * 100,
        appropriateness: Math.random() * 100,
      },
      overallBodyLanguage: {
        score: Math.round(behavioralScore + (Math.random() - 0.5) * 10),
        confidence: Math.random() * 100,
        engagement: Math.random() * 100,
      },
    },

    detailedMetrics: {
      confidence: Math.round(behavioralScore + (Math.random() - 0.5) * 10),
      clarity: Math.round(communicationScore + (Math.random() - 0.5) * 10),
      professionalism: Math.round(overallScore + (Math.random() - 0.5) * 10),
      engagement: Math.round(behavioralScore + (Math.random() - 0.5) * 10),
      adaptability: Math.round(overallScore + (Math.random() - 0.5) * 10),
    },
  };
};

/**
 * Create multiple demo interview performance records
 */
export const createDemoInterviewData = async (count: number = 10) => {
  try {
    console.log(`🎯 Creating ${count} demo interview records...`);

    const baseDate = new Date();
    const interviews: InterviewPerformanceData[] = [];

    for (let i = 0; i < count; i++) {
      const interview = generateDemoInterviewData(i, baseDate);
      interviews.push(interview);

      // Save each interview to storage
      await unifiedAnalyticsStorage.savePerformanceData(interview);

      console.log(
        `✅ Created demo interview ${i + 1}/${count}: ${interview.role} (${
          interview.overallScore
        }%)`
      );

      // Small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`🎉 Successfully created ${count} demo interview records!`);
    return interviews;
  } catch (error) {
    console.error("❌ Error creating demo interview data:", error);
    throw error;
  }
};

/**
 * Clear all interview performance data (for testing)
 */
export const clearAllInterviewData = async () => {
  try {
    await unifiedAnalyticsStorage.clearAllData();
    console.log("✅ All interview data cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing interview data:", error);
    throw error;
  }
};
