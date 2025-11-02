# Todo Reminder Email Setup Guide

This guide will help you set up automated todo reminder emails using EmailJS.

## Features

- ✅ **Automatic Daily Reminders**: Sends emails at a configured time (default: 9:00 AM)
- ✅ **Active Todo Detection**: Only sends emails if there are active (pending) todos
- ✅ **Smart Todo Filtering**: Separates today's tasks from overdue tasks
- ✅ **Manual Trigger**: Test button available in the Task Manager interface
- ✅ **Premium Email Design**: Stunning, aesthetic emails with modern gradients and animations
- ✅ **Motivational Messaging**: Dynamic motivational messages to inspire action
- ✅ **Inspirational Quotes**: Beautiful quote cards to start the day right
- ✅ **Visual Priority Badges**: Elegant emoji-enhanced priority indicators (🔥 High, ⭐ Medium, ✨ Low)
- ✅ **Task Statistics**: Quick overview cards showing task counts
- ✅ **Mobile Responsive**: Beautiful on all devices
- ✅ **Mock Mode**: Development mode with email logging to localStorage

## Setup Steps

### 1. Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Note down your **Public Key** from the Account section

### 2. Create Email Service

1. In EmailJS Dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your **Service ID**

### 3. Create Todo Reminder Email Template

1. Go to "Email Templates" in EmailJS Dashboard
2. Click "Create New Template"
3. Use this template configuration:

#### Template Name
`Todo Reminder Template`

#### Template Subject
```
{{subject}}
```

#### Template Content (HTML)

**Note:** The premium email template is fully embedded in the application code. For EmailJS, you can use this simplified template (the app will handle all the styling):

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    {{{message_html}}}
</body>
</html>
```

**Alternative:** If you prefer to have EmailJS handle the wrapper, use this template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0;">
    {{{message_html}}}
</body>
</html>
```

The application automatically generates a complete, premium HTML email with:
- Beautiful gradients and modern design
- Motivational messaging and inspirational quotes
- Task statistics and priority badges
- Smooth animations and responsive layout
- Call-to-action buttons

#### Template Settings
- **To Email**: `{{to_email}}`
- **From Name**: `Super App Todo Reminders`
- **From Email**: Your verified email
- **Reply To**: `{{reply_to}}`

4. Save the template and note down your **Template ID**

### 4. Configure Environment Variables

Update your `.env` file with the EmailJS credentials:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_general_template_id_here
VITE_EMAILJS_TODO_TEMPLATE_ID=your_todo_reminder_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### 5. Configure Reminder Schedule

The default reminder time is **9:00 AM**. You can change this in `src/hooks/useTodoReminders.ts`:

```typescript
todoReminderService.configure({
  emailjsTemplateId: import.meta.env.VITE_EMAILJS_TODO_TEMPLATE_ID || '',
  userEmail: user.email,
  userId: user.id,
  reminderTime: "09:00" // Change this to your preferred time (24-hour format)
});
```

## How It Works

### Automatic Reminders

1. When a user logs in, the `useTodoReminders` hook is automatically initialized
2. The service checks every minute if it's time to send reminders
3. At the configured time (default 9:00 AM), it:
   - Fetches all active todos from Firestore
   - Filters for today's tasks and overdue tasks
   - Sends an email only if there are active todos
   - Includes color-coded priority indicators (🔴 High, 🟡 Medium, 🟢 Low)

### Manual Testing

1. Open the **Task Manager** page
2. Look for the **bell icon** (🔔) in the header
3. Click it to manually send a todo reminder email
4. The button will show:
   - **Loading spinner** while sending
   - **Green checkmark** on success
   - **Red X** on error

### Email Content

The premium reminder email includes:

#### 🎨 Visual Design
- **Beautiful Header**: Gradient background with animated sparkle icon ✨
- **Motivational Banner**: Dynamic encouraging messages with pink gradient
- **Responsive Layout**: Looks stunning on desktop, tablet, and mobile
- **Smooth Animations**: Subtle fade-in and slide-in effects
- **Premium Typography**: Modern, clean fonts with proper hierarchy

#### 📊 Content Sections

- **Dynamic Subject Line**: 
  - With overdue: "✨ X overdue & Y tasks today - You've got this!"
  - Without overdue: "🌟 X task(s) for today - Let's make it happen!"

- **Task Statistics Cards**: 
  - Visual cards showing task counts at a glance
  - Gradient numbers that stand out
  - Hover effects for interactivity

- **Inspirational Quote**: 
  - Beautiful golden gradient quote card
  - Motivational wisdom to start the day
  - Changes randomly to keep it fresh

- **Today's Tasks Section**: 
  - Elegant task cards with gradient backgrounds
  - Priority badges with emojis (🔥 High, ⭐ Medium, ✨ Low)
  - Full task details: title, description, due date
  - Staggered animations for visual appeal

- **Overdue Tasks Section**: 
  - Titled "Needs Your Attention"
  - Same beautiful card design
  - Clear priority indicators

- **Call-to-Action**: 
  - Large, prominent "🚀 Open Super App" button
  - Gradient background with white button
  - Motivating text: "Ready to conquer your day?"

- **Footer**: 
  - Encouraging message: "Keep pushing forward! Every task completed is a victory! 🎉"
  - Beautiful gradient divider
  - Sent with ❤️ branding

### Priority Styling

- 🔥 **High Priority**: Red gradient badge, pink-red card background, left border accent
- ⭐ **Medium Priority**: Orange gradient badge, orange card background, left border accent
- ✨ **Low Priority**: Green gradient badge, green card background, left border accent

### Motivational Messages

The email randomly selects from inspiring messages:

**For tasks without overdue:**
- "Ready to make today amazing? Let's crush these goals! 🎯"
- "Your future self will thank you for staying on top of things! 🌈"
- "Great things are accomplished one task at a time! ✨"
- "You're doing great! Keep that momentum going! 🚀"

**For tasks with overdue:**
- "Don't worry, it's never too late to get back on track! 🚀"
- "Small steps today lead to big achievements tomorrow! 💪"
- "You've got this! Let's tackle these tasks together! 🌟"
- "Every completed task is a step towards your goals! ⭐"

## Development Mode

When EmailJS is not configured or unavailable, the system operates in **mock mode**:

- Emails are logged to browser console
- Email data is stored in localStorage under `emailLog`
- You can view the log by running in console:
  ```javascript
  JSON.parse(localStorage.getItem('emailLog'))
  ```

## Troubleshooting

### No emails received

1. **Check environment variables**: Ensure all EmailJS variables are set correctly
2. **Check spam folder**: First emails might go to spam
3. **Verify EmailJS template**: Make sure template ID matches
4. **Check console logs**: Look for error messages in browser console
5. **Check email log**: Run `emailJSService.getEmailLog()` in console

### Emails not sending at scheduled time

1. **User must be logged in**: Reminders only work when user is authenticated
2. **App must be open**: Browser-based scheduling requires the app to be running
3. **Check reminder time**: Verify the time is set correctly in 24-hour format

### Template not working

1. **Verify template variables**: Ensure you're using the exact variable names:
   - `{{to_email}}`
   - `{{subject}}`
   - `{{{message_html}}}` (note the triple braces for HTML)
   - `{{reply_to}}`

2. **Test the template**: Use EmailJS's built-in template tester

## Testing Checklist

- [ ] EmailJS account created
- [ ] Email service configured
- [ ] Todo reminder template created
- [ ] Environment variables set in `.env`
- [ ] Application restarted to load new env vars
- [ ] User logged in
- [ ] At least one active todo created
- [ ] Manual reminder button works
- [ ] Email received successfully
- [ ] Email formatting looks correct
- [ ] Priority colors display correctly

## Premium Design Features

### 🎨 Visual Excellence

The TODO reminder emails are designed to provide a **premium, motivating experience**:

1. **Modern Gradient Design**
   - Beautiful purple gradient header (#667eea to #764ba2)
   - Pink motivational banner (#f093fb to #f5576c)
   - Smooth color transitions throughout

2. **Animated Elements**
   - Bouncing sparkle icon in header ✨
   - Shimmer effect on header background
   - Fade-in animation for main content
   - Staggered slide-in for task cards
   - Hover effects on buttons and cards

3. **Premium Typography**
   - System fonts for optimal rendering (-apple-system, Segoe UI, etc.)
   - Clear hierarchy with varied font sizes and weights
   - Proper line spacing for readability
   - Text shadows for depth

4. **Task Card Design**
   - Rounded corners with shadows for depth
   - Gradient backgrounds based on priority
   - Left border accent in priority color
   - Smooth hover transitions
   - Clean separation of content sections

5. **Responsive Design**
   - Mobile-optimized layout
   - Flexible grid system
   - Touch-friendly button sizes
   - Readable on all screen sizes

### 🎯 Motivational Psychology

The email is designed to inspire action:

1. **Positive Reinforcement**: Encouraging language throughout
2. **Visual Rewards**: Beautiful design makes checking tasks pleasurable
3. **Clear Goals**: Task counts and statistics provide clarity
4. **Inspirational Content**: Daily quotes to boost motivation
5. **Achievement Focus**: Victory-oriented messaging
6. **Urgency Without Stress**: Gentle reminders, not panic-inducing

### 📱 Mobile-First Approach

Special optimizations for mobile devices:
- Reduced padding for smaller screens
- Single column layout on narrow devices
- Larger touch targets
- Optimized font sizes
- Faster loading with inline CSS

## Advanced Configuration

### Custom Email Template

You can customize the email template by modifying the methods in `src/utils/todoReminderService.ts`:

#### Customize Motivational Messages

```typescript
private getMotivationalMessage(hasOverdue: boolean, taskCount: number): string {
  // Add your own motivational messages here
  const messages = hasOverdue ? [
    "Your custom message for overdue tasks",
    // ... more messages
  ] : [
    "Your custom message for on-track tasks",
    // ... more messages
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
```

#### Customize Inspirational Quotes

Edit the email HTML generation to add your own quotes:

```typescript
<div class="inspirational-quote">
  💡 "Your custom inspirational quote here"
</div>
```

#### Customize Priority Emojis

```typescript
private formatTodoItem(task: Task, index: number): string {
  const priorityEmoji = task.priority === 'high' ? '🔥' : 
                        task.priority === 'medium' ? '⭐' : '✨';
  // Change emojis above to your preference
}
```

### Different Schedules

To set different reminder times for different users, modify the configuration in `useTodoReminders`:

```typescript
const reminderTime = user.preferences?.reminderTime || "09:00";
```

### Multiple Reminders Per Day

Modify `todoReminderService.ts` to check for multiple times:

```typescript
const reminderTimes = ["09:00", "14:00", "18:00"];
const currentTime = `${now.getHours()}:${now.getMinutes()}`;
if (reminderTimes.includes(currentTime)) {
  // Send reminder
}
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Review EmailJS dashboard for delivery logs
3. Check the email log: `emailJSService.getEmailLog()`
4. Verify Firestore todos are being fetched correctly

## Security Notes

- Never commit your `.env` file with actual credentials
- Use environment variables for all sensitive data
- EmailJS Public Key is safe to expose in client-side code
- Service and Template IDs are also safe to expose

## User Experience

### 📧 What Users Will See

When users receive their TODO reminder email, they'll experience:

1. **Immediate Visual Impact**
   - Eye-catching subject line with emojis
   - Beautiful gradient header when opened
   - Premium, polished design

2. **Motivational Boost**
   - Personalized encouraging message
   - Inspirational quote to start the day
   - Positive, achievement-focused language

3. **Clear Information**
   - At-a-glance task statistics
   - Easy-to-scan task cards
   - Clear priority indicators
   - Full task details including descriptions

4. **Easy Action**
   - Prominent "Open Super App" button
   - Direct link to start working
   - Mobile-friendly for on-the-go access

### 💭 Psychological Benefits

The premium design provides several psychological benefits:

- **Dopamine Trigger**: Beautiful visuals create positive associations
- **Motivation**: Encouraging messages reduce task aversion
- **Clarity**: Clean design reduces cognitive load
- **Achievement Focus**: Frames tasks as victories to be won
- **Reduced Anxiety**: Gentle language vs. urgent/panic-inducing
- **Habit Formation**: Pleasant emails encourage regular task completion

### 📊 Expected User Response

Users typically respond to premium email design with:
- **Higher open rates** (beautiful subject lines)
- **Better engagement** (appealing design encourages reading)
- **Increased action** (clear CTAs and motivation)
- **Positive brand perception** (premium = professional)
- **Regular habit formation** (pleasure in checking emails)

## Success Criteria

✅ You should receive an email reminder when:
- You have active (pending) todos
- It's the configured reminder time
- You're logged into the app
- The app is running in your browser

The system will NOT send emails if you have no active todos (to avoid spam).

### Visual Quality Checklist

When you receive your first email, verify:
- [ ] Gradients display correctly (not solid colors)
- [ ] Animations work (header sparkle bounces)
- [ ] Priority badges have correct colors and emojis
- [ ] Text is readable and well-spaced
- [ ] Images/emojis display properly
- [ ] CTA button is prominent and clickable
- [ ] Mobile view is responsive (if viewing on phone)
- [ ] Inspirational quote card is visible
- [ ] Footer message displays
- [ ] Overall design looks premium and polished

