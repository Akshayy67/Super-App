import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { firestoreUserTasks } from "../utils/firestoreUserTasks";
import { emailJSService } from "../utils/emailJSService";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { Task } from "../types";

interface User {
  id: string;
  email?: string;
  username?: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class DailyTaskReminderService {
  private static instance: DailyTaskReminderService;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private lastSentDate: string | null = null;

  private constructor() {}

  public static getInstance(): DailyTaskReminderService {
    if (!DailyTaskReminderService.instance) {
      DailyTaskReminderService.instance = new DailyTaskReminderService();
    }
    return DailyTaskReminderService.instance;
  }

  /**
   * Get all users from Firestore
   */
  private async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  /**
   * Get tasks for a user (today's and overdue tasks)
   */
  private async getTasksForUser(userId: string): Promise<{
    todayTasks: Task[];
    overdueTasks: Task[];
  }> {
    try {
      const tasks = await firestoreUserTasks.getTasks(userId);
      const now = new Date();
      const today = startOfDay(now);

      return tasks.reduce(
        (acc, task) => {
          if (task.status === "completed") return acc;

          const dueDate = new Date(task.dueDate);
          if (isToday(dueDate)) {
            acc.todayTasks.push(task);
          } else if (isBefore(dueDate, today)) {
            acc.overdueTasks.push(task);
          }
          return acc;
        },
        { todayTasks: [] as Task[], overdueTasks: [] as Task[] }
      );
    } catch (error) {
      console.error(`Error getting tasks for user ${userId}:`, error);
      return { todayTasks: [], overdueTasks: [] };
    }
  }

  /**
   * Format task item for email
   */
  private formatTaskItem(task: Task, index: number): string {
    const priorityEmoji =
      task.priority === "high"
        ? "🔥"
        : task.priority === "medium"
        ? "⭐"
        : "✨";
    const priorityLabel =
      task.priority === "high"
        ? "High Priority"
        : task.priority === "medium"
        ? "Medium Priority"
        : "Low Priority";

    return `
      <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 5px solid ${
        task.priority === "high"
          ? "#f56565"
          : task.priority === "medium"
          ? "#ed8936"
          : "#48bb78"
      };">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${
            task.priority === "high"
              ? "linear-gradient(135deg, #fc8181 0%, #f56565 100%)"
              : task.priority === "medium"
              ? "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)"
              : "linear-gradient(135deg, #68d391 0%, #48bb78 100%)"
          }; color: white;">
            ${priorityEmoji} ${priorityLabel}
          </span>
        </div>
        <h4 style="font-size: 18px; font-weight: 700; color: #2d3748; margin: 10px 0;">${task.title}</h4>
        ${
          task.description
            ? `<p style="font-size: 14px; color: #4a5568; margin: 8px 0;">${task.description}</p>`
            : ""
        }
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
          <span style="font-size: 13px; color: #718096; font-weight: 500;">📅 ${format(
            new Date(task.dueDate),
            "EEEE, MMMM d, yyyy"
          )}</span>
        </div>
      </div>
    `;
  }

  /**
   * Generate email HTML for task reminder
   */
  private generateEmailHTML(
    userEmail: string,
    userName: string,
    tasks: { todayTasks: Task[]; overdueTasks: Task[] }
  ): string {
    const { todayTasks, overdueTasks } = tasks;
    const today = format(new Date(), "EEEE, MMMM d, yyyy");
    const totalTasks = todayTasks.length + overdueTasks.length;
    const hasOverdue = overdueTasks.length > 0;

    const motivationalMsg = hasOverdue
      ? "Don't worry, it's never too late to get back on track! 🚀"
      : "Ready to make today amazing? Let's crush these goals! 🎯";

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .header-date {
            font-size: 16px;
            opacity: 0.95;
          }
          .motivational-banner {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px 30px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
            background: #f7fafc;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
          }
          .stat-number {
            font-size: 36px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .stat-label {
            font-size: 14px;
            color: #718096;
            margin-top: 5px;
          }
          .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #2d3748;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #e2e8f0;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0 30px 0;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
          }
          .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .footer {
            padding: 30px;
            text-align: center;
            background: #f7fafc;
            color: #718096;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">✨</div>
            <h1>Your Daily Task Reminder</h1>
            <p class="header-date">${today}</p>
          </div>
          
          <div class="motivational-banner">
            ${motivationalMsg}
          </div>
          
          <div class="content">
            <div class="stats-grid">
              ${todayTasks.length > 0 ? `
                <div class="stat-card">
                  <div class="stat-number">${todayTasks.length}</div>
                  <div class="stat-label">Today's Tasks</div>
                </div>
              ` : ""}
              ${overdueTasks.length > 0 ? `
                <div class="stat-card">
                  <div class="stat-number">${overdueTasks.length}</div>
                  <div class="stat-label">Overdue Tasks</div>
                </div>
              ` : ""}
            </div>
            
            ${todayTasks.length > 0 ? `
              <h2 class="section-title">📅 Today's Tasks</h2>
              ${todayTasks.map((task, index) => this.formatTaskItem(task, index)).join("")}
            ` : ""}
            
            ${overdueTasks.length > 0 ? `
              <h2 class="section-title">⚠️ Needs Your Attention</h2>
              ${overdueTasks.map((task, index) => this.formatTaskItem(task, todayTasks.length + index)).join("")}
            ` : ""}
            
            <div class="cta-section">
              <p style="color: white; font-size: 16px; margin-bottom: 20px;">Ready to conquer your day?</p>
              <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://super-app.tech'}" class="cta-button">🚀 Open Super App</a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Keep pushing forward! Every task completed is a victory! 🎉</strong></p>
            <p style="margin-top: 10px;">You received this email because you have active tasks in Super App</p>
            <p style="margin-top: 10px; font-size: 12px;">Sent with ❤️ from Super App</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate email text version
   */
  private generateEmailText(
    tasks: { todayTasks: Task[]; overdueTasks: Task[] }
  ): string {
    const { todayTasks, overdueTasks } = tasks;
    const today = format(new Date(), "EEEE, MMMM d, yyyy");
    const subject = overdueTasks.length > 0
      ? `✨ ${overdueTasks.length} overdue & ${todayTasks.length} tasks today - You've got this!`
      : `🌟 ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} for today - Let's make it happen!`;

    return `
${subject}
${today}

${overdueTasks.length > 0 ? "Don't worry, it's never too late to get back on track! 🚀" : "Ready to make today amazing? Let's crush these goals! 🎯"}

${todayTasks.length > 0 ? `
TODAY'S TASKS (${todayTasks.length}):
${todayTasks.map((task, i) => `${i + 1}. ${task.title} [${task.priority.toUpperCase()}]${task.description ? "\n   " + task.description : ""}\n   Due: ${format(new Date(task.dueDate), "EEEE, MMMM d, yyyy")}`).join("\n\n")}
` : ""}

${overdueTasks.length > 0 ? `
NEEDS YOUR ATTENTION (${overdueTasks.length}):
${overdueTasks.map((task, i) => `${i + 1}. ${task.title} [${task.priority.toUpperCase()}]${task.description ? "\n   " + task.description : ""}\n   Due: ${format(new Date(task.dueDate), "EEEE, MMMM d, yyyy")}`).join("\n\n")}
` : ""}

Ready to conquer your day?
Open Super App: ${typeof window !== 'undefined' ? window.location.origin : 'https://super-app.tech'}

---
Keep pushing forward! Every task completed is a victory!
Sent with love from Super App
    `.trim();
  }

  /**
   * Send reminder email to a user
   */
  private async sendReminderToUser(user: User): Promise<boolean> {
    if (!user.email) {
      console.log(`Skipping user ${user.id} - no email address`);
      return false;
    }

    try {
      const tasks = await this.getTasksForUser(user.id);

      // Only send if user has tasks
      if (tasks.todayTasks.length === 0 && tasks.overdueTasks.length === 0) {
        return true; // No tasks, but that's okay
      }

      const subject =
        tasks.overdueTasks.length > 0
          ? `✨ ${tasks.overdueTasks.length} overdue & ${tasks.todayTasks.length} tasks today - You've got this!`
          : `🌟 ${tasks.todayTasks.length} task${tasks.todayTasks.length > 1 ? "s" : ""} for today - Let's make it happen!`;

      const emailData: EmailData = {
        to: user.email,
        subject,
        html: this.generateEmailHTML(
          user.email,
          user.username || "User",
          tasks
        ),
        text: this.generateEmailText(tasks),
      };

      const result = await emailJSService.sendTodoReminder(emailData);
      return result.success;
    } catch (error) {
      console.error(`Error sending reminder to ${user.email}:`, error);
      return false;
    }
  }

  /**
   * Send reminders to all users
   */
  public async sendRemindersToAllUsers(): Promise<void> {
    const today = format(new Date(), "yyyy-MM-dd");
    
    // Prevent sending multiple times on the same day
    if (this.lastSentDate === today) {
      console.log("Reminders already sent today");
      return;
    }

    console.log("Starting daily task reminder process...");
    const users = await this.getAllUsers();
    console.log(`Found ${users.length} users`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const success = await this.sendReminderToUser(user);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        failCount++;
      }
    }

    this.lastSentDate = today;
    console.log(
      `Daily reminders sent: ${successCount} successful, ${failCount} failed`
    );
  }

  /**
   * Start the daily reminder service (checks every minute if it's 8am)
   */
  public startDailyReminders(): void {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    console.log("Starting daily task reminder service (8am daily)...");

    // Check every minute if it's 8am
    this.checkInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's 8:00 AM
      if (hours === 8 && minutes === 0) {
        const today = format(now, "yyyy-MM-dd");
        
        // Only send if we haven't sent today
        if (this.lastSentDate !== today) {
          console.log("It's 8am! Sending daily task reminders...");
          this.sendRemindersToAllUsers().catch((error) => {
            console.error("Error in daily reminder service:", error);
          });
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop the daily reminder service
   */
  public stopReminders(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("Daily task reminder service stopped");
    }
  }
}

export const dailyTaskReminderService =
  DailyTaskReminderService.getInstance();

