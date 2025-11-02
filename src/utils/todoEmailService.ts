import { emailJSService } from './emailJSService';
import { EmailData } from './emailJSService';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface TodoEmailConfig {
  emailjsTemplateId: string;
  recipientEmail: string;
  sendDailyDigest: boolean;
  sendOverdueReminders: boolean;
  reminderTime: string; // Format: "HH:mm"
}

export class TodoEmailService {
  private static instance: TodoEmailService;
  private config: TodoEmailConfig;

  private constructor() {
    // Default configuration
    this.config = {
      emailjsTemplateId: import.meta.env.VITE_EMAILJS_TODO_TEMPLATE_ID || '',
      recipientEmail: '',
      sendDailyDigest: true,
      sendOverdueReminders: true,
      reminderTime: "09:00" // Default to 9 AM
    };
  }

  public static getInstance(): TodoEmailService {
    if (!TodoEmailService.instance) {
      TodoEmailService.instance = new TodoEmailService();
    }
    return TodoEmailService.instance;
  }

  public configure(config: Partial<TodoEmailConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private formatTodoList(todos: TodoItem[]): string {
    if (todos.length === 0) return "No tasks for today! 🎉";

    return todos
      .map((todo, index) => {
        const priority = this.getPriorityEmoji(todo.priority);
        const status = todo.completed ? "✅" : "⏳";
        return `${index + 1}. ${status} ${priority} ${todo.title}${
          todo.description ? `\n   ${todo.description}` : ""
        }`;
      })
      .join("\n\n");
  }

  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  }

  private async sendEmail(subject: string, todos: TodoItem[]): Promise<boolean> {
    if (!this.config.recipientEmail) {
      console.error('Recipient email not configured');
      return false;
    }

    const formattedTodos = this.formatTodoList(todos);
    const today = new Date().toLocaleDateString();

    const emailData: EmailData = {
      to: this.config.recipientEmail,
      subject: subject,
      html: this.generateEmailHTML(subject, formattedTodos, today),
      text: this.generateEmailText(subject, formattedTodos, today),
    };

    try {
      const result = await emailJSService.sendTeamInvite(emailData);
      return result.success;
    } catch (error) {
      console.error('Failed to send todo email:', error);
      return false;
    }
  }

  private generateEmailHTML(subject: string, todoList: string, date: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .todo-list { background-color: white; padding: 20px; border-radius: 5px; }
          .footer { margin-top: 20px; color: #6c757d; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${subject}</h2>
            <p>Date: ${date}</p>
          </div>
          <div class="todo-list">
            <pre>${todoList}</pre>
          </div>
          <div class="footer">
            <p>This is an automated reminder from your Super App Todo Manager</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateEmailText(subject: string, todoList: string, date: string): string {
    return `
${subject}
Date: ${date}

${todoList}

This is an automated reminder from your Super App Todo Manager
    `.trim();
  }

  public async sendDailyDigest(todos: TodoItem[]): Promise<boolean> {
    if (!this.config.sendDailyDigest) return false;

    const todaysTodos = todos.filter(todo => {
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    });

    return this.sendEmail(
      "📅 Your Super App Todo Digest for Today",
      todaysTodos
    );
  }

  public async sendOverdueReminder(todos: TodoItem[]): Promise<boolean> {
    if (!this.config.sendOverdueReminders) return false;

    const overdueTodos = todos.filter(todo => {
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      return !todo.completed && dueDate < today;
    });

    if (overdueTodos.length === 0) return false;

    return this.sendEmail(
      "⚠️ Overdue Tasks Reminder - Super App",
      overdueTodos
    );
  }

  public scheduleReminders(getTodos: () => Promise<TodoItem[]>): void {
    const checkAndSendReminders = async () => {
      const now = new Date();
      const [targetHours, targetMinutes] = this.config.reminderTime.split(':').map(Number);
      
      if (now.getHours() === targetHours && now.getMinutes() === targetMinutes) {
        const todos = await getTodos();
        await this.sendDailyDigest(todos);
        await this.sendOverdueReminder(todos);
      }
    };

    // Check every minute
    setInterval(checkAndSendReminders, 60000);
  }
}

export const todoEmailService = TodoEmailService.getInstance();