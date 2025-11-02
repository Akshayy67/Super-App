import { emailJSService } from './emailJSService';
import { firestoreUserTasks } from './firestoreUserTasks';
import { Task } from '../types';
import { format, isToday, isBefore, startOfDay } from 'date-fns';

interface ReminderConfig {
  emailjsTemplateId: string;
  userEmail: string;
  userId: string;
  reminderTime: string; // Format: "HH:mm"
  appUrl?: string;
}

class TodoReminderService {
  private static instance: TodoReminderService;
  private config: ReminderConfig | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  public static getInstance(): TodoReminderService {
    if (!TodoReminderService.instance) {
      TodoReminderService.instance = new TodoReminderService();
    }
    return TodoReminderService.instance;
  }

  public configure(config: ReminderConfig): void {
    this.config = {
      ...config,
      appUrl: config.appUrl || window.location.origin
    };
  }

  private formatTodoItem(task: Task, index: number): string {
    const priorityClass = task.priority.toLowerCase();
    const priorityEmoji = task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⭐' : '✨';
    const priorityLabel = task.priority === 'high' ? 'High Priority' : task.priority === 'medium' ? 'Medium Priority' : 'Low Priority';
    
    return `
      <div class="todo-item ${priorityClass}" style="animation: slideIn 0.5s ease-out ${index * 0.1}s both;">
        <div class="todo-header">
          <span class="priority-badge ${priorityClass}">${priorityEmoji} ${priorityLabel}</span>
        </div>
        <h4 class="todo-title">${task.title}</h4>
        ${task.description ? `<p class="todo-description">${task.description}</p>` : ''}
        <div class="todo-meta">
          <span class="due-date">📅 ${format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>
    `;
  }

  private getMotivationalMessage(hasOverdue: boolean, taskCount: number): string {
    const messages = hasOverdue 
      ? [
          "Don't worry, it's never too late to get back on track! 🚀",
          "Small steps today lead to big achievements tomorrow! 💪",
          "You've got this! Let's tackle these tasks together! 🌟",
          "Every completed task is a step towards your goals! ⭐"
        ]
      : [
          "Ready to make today amazing? Let's crush these goals! 🎯",
          "Your future self will thank you for staying on top of things! 🌈",
          "Great things are accomplished one task at a time! ✨",
          "You're doing great! Keep that momentum going! 🚀"
        ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getProgressBar(completed: number, total: number): string {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return `
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Your Progress</span>
          <span class="progress-percentage">${percentage}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  private async getTasks(userId: string): Promise<{
    todayTasks: Task[];
    overdueTasks: Task[];
  }> {
    const tasks = await firestoreUserTasks.getTasks(userId);
    const now = new Date();
    const today = startOfDay(now);

    return tasks.reduce(
      (acc, task) => {
        if (task.status === 'completed') return acc;

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
  }

  private async sendReminderEmail(tasks: { todayTasks: Task[]; overdueTasks: Task[] }): Promise<boolean> {
    if (!this.config) {
      console.error('TodoReminderService not configured');
      return false;
    }

    const { todayTasks, overdueTasks } = tasks;
    
    if (todayTasks.length === 0 && overdueTasks.length === 0) {
      return true; // No tasks to remind about
    }

    const today = format(new Date(), 'EEEE, MMMM d, yyyy');
    const totalTasks = todayTasks.length + overdueTasks.length;
    const hasOverdue = overdueTasks.length > 0;
    const motivationalMsg = this.getMotivationalMessage(hasOverdue, totalTasks);
    
    const subject = hasOverdue 
      ? `✨ ${overdueTasks.length} overdue & ${todayTasks.length} tasks today - You've got this!`
      : `🌟 ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} for today - Let's make it happen!`;

    const emailData = {
      to: this.config.userEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6; 
                    color: #2d3748;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                
                .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: fadeIn 0.6s ease-out;
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: shimmer 3s infinite;
                }
                
                .header-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                    display: inline-block;
                    animation: bounce 2s infinite;
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                }
                
                .header-date {
                    font-size: 16px;
                    opacity: 0.95;
                    font-weight: 300;
                }
                
                .motivational-banner {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                
                .content {
                    padding: 30px;
                    background: linear-gradient(to bottom, #ffffff 0%, #f7fafc 100%);
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
                    border: 2px solid #e2e8f0;
                    transition: transform 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                }
                
                .stat-number {
                    font-size: 36px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .stat-label {
                    font-size: 14px;
                    color: #718096;
                    margin-top: 5px;
                    font-weight: 500;
                }
                
                .section-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 30px 0 20px 0;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .todo-item {
                    background: white;
                    padding: 20px;
                    margin: 15px 0;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    border-left: 5px solid #e2e8f0;
                }
                
                .todo-item:hover {
                    transform: translateX(5px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .todo-item.high {
                    border-left-color: #f56565;
                    background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
                }
                
                .todo-item.medium {
                    border-left-color: #ed8936;
                    background: linear-gradient(135deg, #fffaf0 0%, #ffffff 100%);
                }
                
                .todo-item.low {
                    border-left-color: #48bb78;
                    background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
                }
                
                .todo-header {
                    margin-bottom: 12px;
                }
                
                .priority-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .priority-badge.high {
                    background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
                    color: white;
                }
                
                .priority-badge.medium {
                    background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
                    color: white;
                }
                
                .priority-badge.low {
                    background: linear-gradient(135deg, #68d391 0%, #48bb78 100%);
                    color: white;
                }
                
                .todo-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 10px 0;
                    line-height: 1.4;
                }
                
                .todo-description {
                    font-size: 14px;
                    color: #4a5568;
                    margin: 8px 0;
                    line-height: 1.6;
                }
                
                .todo-meta {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #e2e8f0;
                }
                
                .due-date {
                    font-size: 13px;
                    color: #718096;
                    font-weight: 500;
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
                    transition: all 0.3s ease;
                }
                
                .cta-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                
                .cta-text {
                    color: white;
                    font-size: 16px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }
                
                .footer {
                    padding: 30px;
                    text-align: center;
                    background: #f7fafc;
                    color: #718096;
                    font-size: 14px;
                    border-top: 1px solid #e2e8f0;
                }
                
                .footer-divider {
                    width: 60px;
                    height: 3px;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    margin: 20px auto;
                    border-radius: 2px;
                }
                
                .social-links {
                    margin-top: 20px;
                }
                
                .social-links a {
                    display: inline-block;
                    margin: 0 10px;
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .inspirational-quote {
                    background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
                    padding: 20px 30px;
                    border-radius: 12px;
                    margin: 20px 0;
                    border-left: 5px solid #fdcb6e;
                    font-style: italic;
                    color: #2d3748;
                    box-shadow: 0 4px 6px rgba(253, 203, 110, 0.3);
                }
                
                @media only screen and (max-width: 600px) {
                    body { padding: 20px 10px; }
                    .email-wrapper { border-radius: 15px; }
                    .header { padding: 30px 20px; }
                    .header h1 { font-size: 24px; }
                    .content { padding: 20px; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .todo-item { padding: 15px; }
                    .cta-button { padding: 14px 30px; font-size: 16px; }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <!-- Header -->
                <div class="header">
                    <div class="header-icon">✨</div>
                    <h1>Your Daily Task Reminder</h1>
                    <p class="header-date">${today}</p>
                </div>
                
                <!-- Motivational Banner -->
                <div class="motivational-banner">
                    ${motivationalMsg}
                </div>
                
                <!-- Content -->
                <div class="content">
                    <!-- Stats Grid -->
                    <div class="stats-grid">
                        ${todayTasks.length > 0 ? `
                            <div class="stat-card">
                                <div class="stat-number">${todayTasks.length}</div>
                                <div class="stat-label">Today's Tasks</div>
                            </div>
                        ` : ''}
                        ${overdueTasks.length > 0 ? `
                            <div class="stat-card">
                                <div class="stat-number">${overdueTasks.length}</div>
                                <div class="stat-label">Overdue Tasks</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Inspirational Quote -->
                    <div class="inspirational-quote">
                        💡 "The secret of getting ahead is getting started." - Mark Twain
                    </div>
                    
                    <!-- Today's Tasks -->
                    ${todayTasks.length > 0 ? `
                        <h2 class="section-title">
                            <span>📅</span>
                            <span>Today's Tasks</span>
                        </h2>
                        ${todayTasks.map((task, index) => this.formatTodoItem(task, index)).join('')}
                    ` : ''}
                    
                    <!-- Overdue Tasks -->
                    ${overdueTasks.length > 0 ? `
                        <h2 class="section-title">
                            <span>⚠️</span>
                            <span>Needs Your Attention</span>
                        </h2>
                        ${overdueTasks.map((task, index) => this.formatTodoItem(task, todayTasks.length + index)).join('')}
                    ` : ''}
                    
                    <!-- CTA Section -->
                    <div class="cta-section">
                        <p class="cta-text">Ready to conquer your day?</p>
                        <a href="${this.config.appUrl}" class="cta-button">🚀 Open Super App</a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p><strong>Keep pushing forward! Every task completed is a victory! 🎉</strong></p>
                    <div class="footer-divider"></div>
                    <p>You received this email because you have active tasks in Super App</p>
                    <p style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
                        Sent with ❤️ from Super App
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
${subject}
${today}

${motivationalMsg}

${todayTasks.length > 0 ? `
TODAY'S TASKS (${todayTasks.length}):
${todayTasks.map((task, i) => `${i + 1}. ${task.title} [${task.priority.toUpperCase()}]${task.description ? '\n   ' + task.description : ''}\n   Due: ${format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}`).join('\n\n')}
` : ''}

${overdueTasks.length > 0 ? `
NEEDS YOUR ATTENTION (${overdueTasks.length}):
${overdueTasks.map((task, i) => `${i + 1}. ${task.title} [${task.priority.toUpperCase()}]${task.description ? '\n   ' + task.description : ''}\n   Due: ${format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}`).join('\n\n')}
` : ''}

Ready to conquer your day?
Open Super App: ${this.config.appUrl}

---
Keep pushing forward! Every task completed is a victory!
Sent with love from Super App
      `.trim()
    };

    try {
      const result = await emailJSService.sendTodoReminder(emailData);
      return result.success;
    } catch (error) {
      console.error('Failed to send todo reminder:', error);
      return false;
    }
  }

  public async checkAndSendReminders(): Promise<void> {
    if (!this.config) {
      console.error('TodoReminderService not configured');
      return;
    }

    const tasks = await this.getTasks(this.config.userId);
    await this.sendReminderEmail(tasks);
  }

  public startDailyReminders(): void {
    if (!this.config) {
      console.error('TodoReminderService not configured');
      return;
    }

    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute if it's time to send reminders
    this.checkInterval = setInterval(() => {
      const now = new Date();
      const [targetHours, targetMinutes] = this.config!.reminderTime.split(':').map(Number);
      
      if (now.getHours() === targetHours && now.getMinutes() === targetMinutes) {
        this.checkAndSendReminders();
      }
    }, 60000); // Check every minute
  }

  public stopReminders(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const todoReminderService = TodoReminderService.getInstance();