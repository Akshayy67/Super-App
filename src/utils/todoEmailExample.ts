// Example of how to use the TodoEmailService
import { todoEmailService } from '../utils/todoEmailService';
import { TodoItem } from '../utils/todoEmailService';  // Import the TodoItem type

// Configure the service with user's email and preferences
todoEmailService.configure({
  recipientEmail: "user@example.com",
  sendDailyDigest: true,
  sendOverdueReminders: true,
  reminderTime: "09:00" // Daily reminders at 9 AM
});

// Example function to get todos from your storage
async function getUserTodos(): Promise<TodoItem[]> {
  // Replace this with your actual todo fetching logic
  return [
    {
      id: "1",
      title: "Complete project documentation",
      description: "Write technical documentation for the new features",
      dueDate: new Date(),
      completed: false,
      priority: "high" as const
    },
    {
      id: "2",
      title: "Review pull requests",
      dueDate: new Date(),
      completed: false,
      priority: "medium" as const
    },
    {
      id: "3",
      title: "Update dependencies",
      dueDate: new Date(Date.now() - 86400000), // Yesterday
      completed: false,
      priority: "low" as const
    }
  ];
}

// Start the reminder service
todoEmailService.scheduleReminders(getUserTodos);

// Export the manual trigger function in case it's needed elsewhere
export async function sendManualReminders() {
  const todos = await getUserTodos();
  await todoEmailService.sendDailyDigest(todos);
  await todoEmailService.sendOverdueReminder(todos);
}