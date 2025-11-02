# EmailJS Todo Template - Quick Start Guide

## 🚀 Copy-Paste Template for EmailJS Dashboard

### Template HTML (Copy This Entire Block)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7;">
    {{{message_html}}}
</body>
</html>
```

---

## 📝 EmailJS Template Settings

When creating your template in EmailJS dashboard, configure these fields:

| Field | Value |
|-------|-------|
| **Template Name** | `Todo Reminder Template` |
| **Subject** | `{{subject}}` |
| **To Email** | `{{to_email}}` |
| **From Name** | `Super App Todo Reminders` |
| **From Email** | `[Your verified email]` |
| **Reply To** | `{{reply_to}}` |
| **Content** | `[Paste the HTML template above]` |

---

## 🔑 Template Variables Used

The Super App automatically sends these variables:

| Variable | Format | Description |
|----------|--------|-------------|
| `{{to_email}}` | Text | Recipient email address |
| `{{subject}}` | Text | Email subject line |
| `{{{message_html}}}` | **HTML (triple braces)** | Complete styled email content |
| `{{message_text}}` | Text | Plain text version |
| `{{reply_to}}` | Text | Reply-to address |
| `{{to_name}}` | Text | Recipient name (extracted from email) |

**⚠️ Important:** Use `{{{message_html}}}` with **TRIPLE braces** to render HTML correctly!

---

## ⚙️ Environment Variables Required

Add these to your `.env` file:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TODO_TEMPLATE_ID=template_oi33v6o
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

**📌 Your Template ID:** `template_oi33v6o`

**Where to find:**
- **Service ID**: Email Services → Your Service → Service ID
- **Template ID**: Email Templates → Todo Reminder Template → Template ID
- **Public Key**: Account → General → Public Key

---

## ✅ Setup Checklist

- [ ] Created EmailJS account
- [ ] Connected email service (Gmail/Outlook)
- [ ] Created template with HTML above
- [ ] Set all template fields (Subject, To, From, etc.)
- [ ] Saved template and copied Template ID
- [ ] Added environment variables to `.env`
- [ ] Restarted development server
- [ ] Tested with manual reminder button (🔔)

---

## 🎯 Test Values (For EmailJS Template Tester)

Use these to test your template in EmailJS dashboard:

```
to_email: your-email@example.com
subject: ✨ 2 tasks for today - Let's make it happen!
message_html: <h1>Test Email</h1><p>This is a test of your todo reminder template!</p>
reply_to: noreply@super-app.com
```

---

## 📧 What Gets Sent

The app generates a beautiful HTML email with:
- ✨ Gradient header with sparkle animation
- 📊 Task statistics cards
- 📝 Task list with priority badges (🔥 High, ⭐ Medium, ✨ Low)
- 💬 Motivational messages
- 📖 Inspirational quotes
- 🚀 Call-to-action button

All styling is included in `{{{message_html}}}`, so the template just needs to wrap it!

---

**For detailed setup instructions, see:** [EMAILJS_TODO_TEMPLATE_SETUP.md](./EMAILJS_TODO_TEMPLATE_SETUP.md)

