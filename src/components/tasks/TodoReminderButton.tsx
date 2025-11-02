import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { todoReminderService } from '../../utils/todoReminderService';

interface TodoReminderButtonProps {
  userId?: string;
  userEmail?: string;
  variant?: 'button' | 'icon';
}

export const TodoReminderButton: React.FC<TodoReminderButtonProps> = ({
  userId,
  userEmail,
  variant = 'button'
}) => {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSendReminder = async () => {
    if (!userId || !userEmail) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setSending(true);
    setStatus('idle');

    try {
      // Ensure the service is configured
      todoReminderService.configure({
        emailjsTemplateId: import.meta.env.VITE_EMAILJS_TODO_TEMPLATE_ID || '',
        userEmail,
        userId,
        reminderTime: "09:00"
      });

      // Send the reminder
      await todoReminderService.checkAndSendReminders();
      
      setStatus('success');
      console.log('✅ Todo reminder sent successfully');
    } catch (error) {
      console.error('❌ Failed to send todo reminder:', error);
      setStatus('error');
    } finally {
      setSending(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSendReminder}
        disabled={sending || !userId || !userEmail}
        className={`p-2 rounded-full transition-all ${
          sending
            ? 'bg-gray-100 cursor-wait'
            : status === 'success'
            ? 'bg-green-100 text-green-600'
            : status === 'error'
            ? 'bg-red-100 text-red-600'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Send todo reminder email now"
      >
        {sending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : status === 'error' ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleSendReminder}
      disabled={sending || !userId || !userEmail}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        sending
          ? 'bg-gray-100 cursor-wait text-gray-600'
          : status === 'success'
          ? 'bg-green-100 text-green-700'
          : status === 'error'
          ? 'bg-red-100 text-red-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {sending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Reminder Sent!
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="w-4 h-4" />
          Failed
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Send Reminder Now
        </>
      )}
    </button>
  );
};







