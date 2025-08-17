import { firestoreUserTasks } from "./firestoreUserTasks";
import { Task } from "../types";

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
      dueDate: today.toISOString().split('T')[0], // Today
      priority: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Read Science Chapter",
      description: "Read Chapter 8: Chemical Reactions",
      subject: "Chemistry",
      dueDate: today.toISOString().split('T')[0], // Today
      priority: "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "History Essay Draft",
      description: "Write first draft of World War II essay",
      subject: "History",
      dueDate: tomorrow.toISOString().split('T')[0], // Tomorrow
      priority: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Physics Lab Report",
      description: "Complete lab report on pendulum experiment",
      subject: "Physics",
      dueDate: tomorrow.toISOString().split('T')[0], // Tomorrow
      priority: "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "English Vocabulary",
      description: "Study vocabulary words 1-50",
      subject: "English",
      dueDate: nextWeek.toISOString().split('T')[0], // Next week
      priority: "low",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Biology Quiz Prep",
      description: "Review cell structure and functions",
      subject: "Biology",
      dueDate: yesterday.toISOString().split('T')[0], // Overdue
      priority: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Spanish Homework",
      description: "Complete conjugation exercises",
      subject: "Spanish",
      dueDate: yesterday.toISOString().split('T')[0], // Completed task
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
