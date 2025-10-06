# EmailJS Setup Guide for Super Study App Feedback System

## 🚀 Quick Setup Instructions

### 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended):
   - **Gmail**: Select Gmail and connect your account
   - **Outlook**: Select Outlook and connect your account
   - **Custom SMTP**: Use your own email server
4. Note down your **Service ID** (e.g., `service_superapp`)

### 3. Create Email Templates

#### Template 1: Main Feedback Template

1. Go to **Email Templates** → **Create New Template**
2. **Template ID**: `template_00lom57` (your existing template)
3. **IMPORTANT**: Configure the "To" field in EmailJS to: `{{to_email}}`
4. **Template Content**:

```html
Subject: 🎯 {{feedback_type}} - {{feedback_title}}

<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .header {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
        background: #f9fafb;
      }
      .section {
        margin: 15px 0;
        padding: 15px;
        background: white;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }
      .priority-high {
        border-left-color: #ef4444;
      }
      .priority-medium {
        border-left-color: #f59e0b;
      }
      .priority-low {
        border-left-color: #10b981;
      }
      .footer {
        padding: 20px;
        text-align: center;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>📧 Super Study App Feedback</h1>
      <p>{{feedback_type}} from {{user_email}}</p>
    </div>

    <div class="content">
      <div class="section priority-{{priority}}">
        <h2>📝 {{feedback_title}}</h2>
        <p><strong>Category:</strong> {{feedback_category}}</p>
        <p><strong>Priority:</strong> {{priority}}</p>
        {{#rating}}
        <p><strong>Rating:</strong> {{rating}}</p>
        {{/rating}}
      </div>

      <div class="section">
        <h3>💬 Description</h3>
        <p>{{feedback_description}}</p>
      </div>

      {{#feature_name}}
      <div class="section">
        <h3>🔧 Feature Context</h3>
        <p><strong>Feature:</strong> {{feature_name}}</p>
        <p><strong>Action:</strong> {{action_name}}</p>
      </div>
      {{/feature_name}}

      <div class="section">
        <h3>📊 Technical Details</h3>
        <p><strong>Timestamp:</strong> {{timestamp}}</p>
        <p><strong>Page URL:</strong> {{page_url}}</p>
        <p><strong>User Agent:</strong> {{user_agent}}</p>
      </div>
    </div>

    <div class="footer">
      <p>Sent via Super Study App Feedback System</p>
      <p>Reply to: {{user_email}}</p>
    </div>
  </body>
</html>
```

#### Template 2: Urgent Notification Template (Optional)

1. **Template ID**: `template_urgent`
2. **Template Content**:

```html
Subject: 🚨 URGENT: {{subject}}

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div
    style="background: #ef4444; color: white; padding: 20px; text-align: center;"
  >
    <h1>🚨 URGENT FEEDBACK</h1>
  </div>

  <div style="padding: 20px; background: #fef2f2; border: 2px solid #ef4444;">
    <h2>{{subject}}</h2>
    <p><strong>User:</strong> {{user_email}}</p>
    <p><strong>Time:</strong> {{timestamp}}</p>

    <div
      style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;"
    >
      {{message}}
    </div>

    <p style="color: #dc2626; font-weight: bold;">
      ⚠️ This requires immediate attention!
    </p>
  </div>
</div>
```

### 4. Get Your Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `user_abc123xyz`)

### 5. Update Configuration

Edit `src/services/emailService.ts` and replace the placeholder values:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_superapp", // Replace with your Service ID
  TEMPLATE_ID: "template_feedback", // Replace with your Template ID
  PUBLIC_KEY: "user_abc123xyz", // Replace with your Public Key
};
```

### 6. Test the Setup

1. Run your app: `npm run dev`
2. Click the feedback button
3. Submit a test feedback
4. Check your email inbox

## 📧 Email Recipients Configuration

The feedback will be sent to:

- **Primary**: `akshay.juluri@super-app.tech`
- **CC**: `gyanmote.akhil@super-app.tech`

To change recipients, update the `templateParams` in `emailService.ts`:

```typescript
to_email: 'your-email@domain.com',
cc_email: 'another-email@domain.com',
```

## 🔧 Advanced Configuration

### Custom Email Templates

You can create different templates for different feedback types:

- `template_feedback` - General feedback
- `template_bug` - Bug reports
- `template_feature` - Feature requests
- `template_urgent` - High priority issues

### Environment Variables (Recommended)

For security, store your EmailJS credentials in environment variables:

1. Create `.env.local`:

```env
VITE_EMAILJS_SERVICE_ID=service_superapp
VITE_EMAILJS_TEMPLATE_ID=template_feedback
VITE_EMAILJS_PUBLIC_KEY=user_abc123xyz
```

2. Update `emailService.ts`:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
```

### Rate Limiting

EmailJS free plan includes:

- **200 emails/month**
- **50 emails/day**

For higher volumes, consider upgrading to a paid plan.

## 🛠️ Troubleshooting

### Common Issues:

1. **"Failed to send email"**

   - Check your Service ID, Template ID, and Public Key
   - Verify your email service is connected
   - Check browser console for detailed errors

2. **Emails not received**

   - Check spam/junk folder
   - Verify template variables match the data being sent
   - Test with a simple template first

3. **Rate limit exceeded**
   - EmailJS free plan has daily/monthly limits
   - Implement local storage fallback (already included)

### Debug Mode:

Enable detailed logging by adding to `emailService.ts`:

```typescript
console.log("EmailJS Config:", EMAILJS_CONFIG);
console.log("Template Params:", templateParams);
```

## 🎯 Features Included

✅ **Email delivery** via EmailJS
✅ **Fallback storage** in localStorage if email fails
✅ **Retry mechanism** for failed sends
✅ **Urgent notifications** for high-priority feedback
✅ **Rich HTML templates** with styling
✅ **Technical context** (URL, user agent, timestamp)
✅ **Error handling** with user-friendly messages
✅ **Rate limiting** awareness

## 📞 Support

If you need help setting up EmailJS:

1. Check [EmailJS Documentation](https://www.emailjs.com/docs/)
2. Contact EmailJS support
3. Review the browser console for error messages

Your feedback system is now ready to collect and email user feedback directly to your inbox! 🎉
