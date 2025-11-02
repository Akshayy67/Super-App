# EmailJS Templates Reference

Quick reference guide for all EmailJS templates used in the Super App.

## 📧 Template IDs

| Template Purpose | Template ID | Environment Variable |
|-----------------|-------------|---------------------|
| **Team Invitations** | `template_0tnir1s` | `VITE_EMAILJS_TEMPLATE_ID` or `VITE_EMAILJS_TEAM_INVITE_TEMPLATE_ID` |
| **Todo Reminders** | `template_oi33v6o` | `VITE_EMAILJS_TODO_TEMPLATE_ID` |
| **Feedback Requests** | `template_00lom57` | `VITE_EMAILJS_FEEDBACK_TEMPLATE_ID` |

---

## 🔧 Environment Variables Configuration

Add these to your `.env` file:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=template_0tnir1s
VITE_EMAILJS_TEAM_INVITE_TEMPLATE_ID=template_0tnir1s
VITE_EMAILJS_TODO_TEMPLATE_ID=template_oi33v6o
VITE_EMAILJS_FEEDBACK_TEMPLATE_ID=template_00lom57
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

---

## 📋 Template Variables Reference

### 1. Team Invitation Template (`template_0tnir1s`)

**Variables used:**
- `{{to_email}}` - Recipient email address
- `{{to_name}}` - Recipient name (extracted from email)
- `{{team_name}}` - Name of the team
- `{{inviter_name}}` - Name of person sending invite
- `{{invite_code}}` - Unique invitation code
- `{{app_url}}` - Application URL
- `{{message}}` - Plain text message (fallback)
- `{{reply_to}}` - Reply-to address

**Used in:** `src/utils/emailJSService.ts` → `sendTeamInvite()`

---

### 2. Todo Reminder Template (`template_oi33v6o`)

**Variables used:**
- `{{to_email}}` - Recipient email address
- `{{to_name}}` - Recipient name (extracted from email)
- `{{subject}}` - Email subject line
- `{{{message_html}}}` - Complete HTML email content (triple braces)
- `{{message_text}}` - Plain text version
- `{{reply_to}}` - Reply-to address

**Used in:** `src/utils/emailJSService.ts` → `sendTodoReminder()`

**Setup Guide:** See [EMAILJS_TODO_TEMPLATE_SETUP.md](./EMAILJS_TODO_TEMPLATE_SETUP.md)

---

### 3. Feedback Request Template (`template_00lom57`)

**Variables used:**
- `{{feedback_type}}` - Type of feedback (FEEDBACK, SUGGESTION, BUG, FEATURE)
- `{{feedback_title}}` - Title of the feedback
- `{{feedback_description}}` - Detailed description
- `{{feedback_category}}` - Category (UI, Feature, Bug, etc.)
- `{{user_email}}` - User's email (or "Anonymous")
- `{{rating}}` - Rating out of 5 (e.g., "4/5 stars")
- `{{priority}}` - Priority level (low, medium, high)
- `{{feature_name}}` - Feature name (if applicable)
- `{{action_name}}` - Action name (if applicable)
- `{{timestamp}}` - When feedback was submitted
- `{{user_agent}}` - User's browser info
- `{{page_url}}` - URL where feedback was submitted
- `{{formatted_message}}` - Complete formatted message
- `{{recipients_list}}` - Comma-separated list of recipient emails
- `{{to_email}}` - Primary recipient email
- `{{cc_email_1}}`, `{{cc_email_2}}`, `{{cc_email_3}}` - Additional recipients

**Used in:** `src/services/emailService.ts` → `sendFeedback()`

---

## ✅ Verification Checklist

After setting up templates in EmailJS:

- [ ] Team Invite template (`template_0tnir1s`) created and configured
- [ ] Todo Reminder template (`template_oi33v6o`) created and configured
- [ ] Feedback Request template (`template_00lom57`) created and configured
- [ ] All environment variables set in `.env` file
- [ ] Development server restarted after `.env` changes
- [ ] Test team invite sent successfully
- [ ] Test todo reminder sent successfully
- [ ] Test feedback request sent successfully

---

## 🚀 Quick Test

To test each template:

1. **Team Invite**: Create a team and invite a member
2. **Todo Reminder**: Click the bell icon (🔔) in Tasks page
3. **Feedback Request**: Submit feedback through the feedback system

---

## 📚 Related Documentation

- [Todo Reminder Setup Guide](./EMAILJS_TODO_TEMPLATE_SETUP.md)
- [Todo Reminder Quick Start](./EMAILJS_TODO_TEMPLATE_QUICK_START.md)
- [Todo Reminder Setup (Full)](./TODO_REMINDER_SETUP.md)

---

**Last Updated:** Template IDs configured and verified



