import { useEffect } from 'react';
import { todoReminderService } from '../utils/todoReminderService';
import { User } from '../types';

export const useTodoReminders = (user: User | null) => {
  useEffect(() => {
    if (!user) return;

    // Configure the reminder service for the current user
    todoReminderService.configure({
      emailjsTemplateId: import.meta.env.VITE_EMAILJS_TODO_TEMPLATE_ID || '',
      userEmail: user.email,
      userId: user.id,
      reminderTime: "09:00" // Send reminders at 9 AM by default
    });

    // Start the daily reminder checks
    todoReminderService.startDailyReminders();

    // Cleanup when component unmounts or user changes
    return () => {
      todoReminderService.stopReminders();
    };
  }, [user]);

  // Function to manually trigger reminders if needed
  const sendManualReminder = async () => {
    if (!user) return;
    await todoReminderService.checkAndSendReminders();
  };

  return { sendManualReminder };
};