# SendGrid Email Service Setup Guide

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Create SendGrid Account**
1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email address

### **Step 2: Get Your API Key**
1. Login to SendGrid Dashboard
2. Go to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name it: "Team Invitations"
5. Choose **"Restricted Access"** → **"Mail Send"**
6. Click **"Create & View"**
7. **Copy the API key** (you won't see it again!)

### **Step 3: Verify Your Sender Domain**
1. In SendGrid Dashboard, go to **Settings** → **Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Follow the DNS setup instructions
4. Wait for verification (usually 5-15 minutes)

### **Step 4: Add Environment Variables**
Create or update your `.env` file in the project root:

```env
# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.your_actual_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Example with actual values:
VITE_SENDGRID_API_KEY=SG.ABC123xyz789...
VITE_SENDGRID_FROM_EMAIL=noreply@super-app.tech
```

### **Step 5: Test the Setup**
1. Restart your development server
2. Go to Team Space
3. Create a team
4. Send an invitation to a real email address
5. Check if the email is received

## 🔧 **Alternative: Use Gmail for Testing**

If you want to test quickly without SendGrid setup:

```env
# Gmail SMTP (for testing only)
VITE_GMAIL_USER=your_email@gmail.com
VITE_GMAIL_PASS=your_app_password
```

## 📧 **Email Templates**

The system now generates beautiful HTML emails with:
- Professional styling
- Team invitation details
- Invite codes
- Clear call-to-action buttons
- Mobile-responsive design

## 🚨 **Important Notes**

1. **API Key Security**: Never commit your `.env` file to git
2. **Domain Verification**: Must verify your sender domain for production
3. **Rate Limits**: Free tier allows 100 emails/day
4. **Spam Protection**: SendGrid handles deliverability automatically

## 🐛 **Troubleshooting**

### **"SendGrid not initialized" Error**
- Check if `VITE_SENDGRID_API_KEY` is set in `.env`
- Restart your development server
- Check browser console for API key warnings

### **"Unauthorized" Error**
- Verify your API key is correct
- Check if your SendGrid account is active
- Ensure you have "Mail Send" permissions

### **Emails Still Not Sending**
- Check browser console for detailed error messages
- Verify your sender domain is authenticated
- Test with a simple email address first

## 📱 **Testing Checklist**

- [ ] SendGrid account created
- [ ] API key generated and copied
- [ ] Sender domain verified
- [ ] Environment variables set
- [ ] Development server restarted
- [ ] Test invitation sent
- [ ] Email received in inbox

## 🎯 **Next Steps**

1. **Test thoroughly** with real email addresses
2. **Monitor delivery** in SendGrid dashboard
3. **Customize templates** to match your brand
4. **Set up analytics** to track email performance

Your team invitation system is now fully functional with real email delivery! 🎉
