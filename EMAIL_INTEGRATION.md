# Email Integration Guide for Team Invitations

## Overview

The team invitation system is now fully functional with a complete email template system. Currently, it simulates sending emails by storing invites in Firestore and logging email content to the console. To enable actual email delivery, you'll need to integrate with a real email service.

## Current Implementation

✅ **Complete Invite System**
- Team invitation creation and management
- Invite codes and expiration handling
- Professional email templates (HTML + Text)
- Invite acceptance and team joining
- Pending invite management

✅ **Email Templates**
- Beautiful HTML emails with responsive design
- Plain text fallback versions
- Professional styling and branding
- Clear call-to-action buttons

❌ **Email Delivery** (Needs Integration)
- Currently logs email content to console
- No actual emails are sent to recipients

## Email Service Integration Options

### 1. SendGrid (Recommended)

**Pros:** Easy setup, generous free tier, excellent deliverability
**Free Tier:** 100 emails/day

```bash
npm install @sendgrid/mail
```

**Setup:**
1. Create SendGrid account
2. Get API key
3. Verify sender domain
4. Add environment variable: `VITE_SENDGRID_API_KEY`

**Integration Code:**
```typescript
// src/utils/sendGridService.ts
import sgMail from '@sendgrid/mail';

export class SendGridService {
  constructor() {
    sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY!);
  }

  async sendTeamInvite(to: string, subject: string, html: string, text: string) {
    const msg = {
      to,
      from: 'noreply@yourdomain.com', // Verified sender
      subject,
      html,
      text,
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('SendGrid error:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### 2. Mailgun

**Pros:** Good deliverability, reasonable pricing
**Free Tier:** 5,000 emails/month for 3 months

```bash
npm install mailgun.js
```

**Setup:**
1. Create Mailgun account
2. Get API key and domain
3. Add environment variables: `VITE_MAILGUN_API_KEY`, `VITE_MAILGUN_DOMAIN`

### 3. AWS SES

**Pros:** Very cost-effective, high deliverability
**Free Tier:** 62,000 emails/month (first year)

**Setup:**
1. AWS account required
2. Verify sender domain
3. Add environment variables: `VITE_AWS_SES_ACCESS_KEY`, `VITE_AWS_SES_SECRET_KEY`

### 4. Firebase Cloud Functions + Nodemailer

**Pros:** Serverless, integrates with existing Firebase setup
**Cons:** More complex setup

```bash
npm install -g firebase-tools
firebase init functions
cd functions && npm install nodemailer
```

## Quick Integration Steps

### Step 1: Choose Email Service
Select one of the services above based on your needs and budget.

### Step 2: Install Dependencies
```bash
npm install [email-service-package]
```

### Step 3: Create Email Service
Create a new service file (e.g., `src/utils/sendGridService.ts`) following the pattern above.

### Step 4: Update Email Service
Modify `src/utils/emailService.ts` to use your chosen email service:

```typescript
// Replace the TODO section with:
import { sendGridService } from './sendGridService';

// In sendTeamInvite function:
const emailResult = await sendGridService.sendTeamInvite(
  inviteData.inviteeEmail,
  emailSubject,
  emailHTML,
  emailText
);

if (!emailResult.success) {
  throw new Error(`Failed to send email: ${emailResult.error}`);
}
```

### Step 5: Environment Variables
Add your email service credentials to `.env`:

```env
VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
VITE_MAILGUN_API_KEY=your_mailgun_api_key_here
# etc.
```

### Step 6: Test
1. Create a team
2. Send an invitation
3. Check recipient's email
4. Verify invite acceptance works

## Email Template Customization

The email templates are located in `src/utils/emailTemplates.ts` and can be easily customized:

- **Colors:** Modify CSS variables in the HTML template
- **Branding:** Update logos, colors, and styling
- **Content:** Modify text and layout
- **Localization:** Add support for multiple languages

## Security Considerations

1. **Rate Limiting:** Implement rate limiting for invite creation
2. **Email Verification:** Consider verifying email addresses before sending invites
3. **Spam Protection:** Use proper authentication (SPF, DKIM, DMARC)
4. **Invite Expiration:** Current 7-day expiration is configurable

## Monitoring & Analytics

Track email delivery and engagement:

- **Delivery Rate:** Monitor successful email sends
- **Open Rate:** Track email opens (requires tracking pixels)
- **Click Rate:** Monitor invite link clicks
- **Bounce Rate:** Handle failed deliveries

## Troubleshooting

### Common Issues

1. **Emails not sending:** Check API keys and service configuration
2. **Emails going to spam:** Verify domain authentication
3. **Template rendering issues:** Test HTML in email clients
4. **Rate limiting:** Check service quotas and limits

### Debug Mode

Enable debug logging in the email service:

```typescript
console.log('📧 Email service debug:', {
  to: inviteData.inviteeEmail,
  subject: emailSubject,
  service: 'sendgrid',
  timestamp: new Date().toISOString()
});
```

## Next Steps

1. **Choose email service** based on your requirements
2. **Implement integration** following the guide above
3. **Test thoroughly** with real email addresses
4. **Monitor performance** and adjust as needed
5. **Customize templates** to match your brand

## Support

For issues with the invitation system:
- Check browser console for error logs
- Verify Firebase configuration
- Test with different email addresses
- Review email service documentation

The system is designed to be robust and easy to integrate with any email service provider.
