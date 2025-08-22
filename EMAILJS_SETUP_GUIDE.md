# 🚀 EmailJS Setup Guide - Real Email Delivery

## 🎯 **What We Just Implemented**

Your team invitation system now uses **EmailJS** - a service that allows you to send **real emails directly from the browser** without needing a server!

## ✅ **What's Working Now**

- ✅ **EmailJS integration** implemented
- ✅ **Real email sending** capability
- ✅ **Beautiful email templates** (HTML + Text)
- ✅ **Email logging** and debugging
- ✅ **Connection testing** functionality

## 🔧 **Setup Steps Required**

### **Step 1: Create EmailJS Account**

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** and create a free account
3. Verify your email address

### **Step 2: Create Email Service**

1. **Login to EmailJS Dashboard**
2. Go to **"Email Services"** tab
3. Click **"Add New Service"**
4. Choose **"Gmail"** (recommended for testing)
5. **Connect your Gmail account**:
   - Enable 2-factor authentication on Gmail
   - Generate an app password
   - Use your Gmail credentials

### **Step 3: Create Email Template**

1. Go to **"Email Templates"** tab
2. Click **"Create New Template"**
3. **Template Name**: `team-invite`
4. **Subject**: `You're invited to join {{team_name}} - Team Collaboration Platform`
5. **Content**: Use this template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Team Invitation</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">You're Invited to Join {{team_name}}!</h2>
        
        <p>Hi {{to_name}},</p>
        
        <p>{{inviter_name}} has invited you to join their team <strong>{{team_name}}</strong> on our collaboration platform.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Team Details:</h3>
            <p><strong>Team Name:</strong> {{team_name}}</p>
            <p><strong>Invited by:</strong> {{inviter_name}}</p>
            <p><strong>Invite Code:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">{{invite_code}}</code></p>
        </div>
        
        <p>To accept this invitation:</p>
        <ol>
            <li>Visit our platform</li>
            <li>Click "Join Team"</li>
            <li>Enter the invite code: <strong>{{invite_code}}</strong></li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{app_url}}/join-team?code={{invite_code}}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Join Team Now
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            This invitation will expire in 7 days. If you have any questions, please contact {{inviter_name}}.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This email was sent from our team collaboration platform.
        </p>
    </div>
</body>
</html>
```

### **Step 4: Get Your Credentials**

1. **Service ID**: Copy from Email Services tab
2. **Template ID**: Copy from Email Templates tab  
3. **Public Key**: Copy from Account → API Keys tab

### **Step 5: Create .env File**

Create a `.env` file in your project root:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Example:**
```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_def456
```

## 🧪 **Testing Your Setup**

### **1. Restart Your Development Server**
```bash
npm run dev
```

### **2. Test Email Service**
1. Go to **Team Space** → **Settings** tab
2. Click **"Test Email Service"**
3. Enter your email address
4. Click **"Test Email Service"**

### **3. Send Team Invitation**
1. Create or select a team
2. Click **"Invite"** button
3. Enter recipient's email
4. Click **"Send Invite"**

## 📧 **How EmailJS Works**

1. **User clicks "Send Invite"**
2. **EmailJS sends email** using your Gmail account
3. **Recipient receives real email** in their inbox
4. **Email contains invitation link** and code
5. **Recipient can join team** using the link

## 🚨 **Important Notes**

- **Free tier**: 200 emails/month
- **Gmail limits**: 500 emails/day
- **Template variables**: Must match your template
- **Service credentials**: Never expose in client code (public key is safe)

## 🔍 **Troubleshooting**

### **"EmailJS not initialized" Error**
- Check your `.env` file exists
- Verify all 3 environment variables are set
- Restart development server

### **"Service not found" Error**
- Verify Service ID in EmailJS dashboard
- Check if service is active

### **"Template not found" Error**
- Verify Template ID in EmailJS dashboard
- Check if template is published

### **"Authentication failed" Error**
- Verify Gmail credentials in EmailJS service
- Check if 2FA is enabled and app password is correct

## 🎉 **Result**

Once configured, your team invitation system will:
- ✅ **Send real emails** to recipients
- ✅ **Use beautiful HTML templates**
- ✅ **Include invitation links** and codes
- ✅ **Work immediately** without server setup
- ✅ **Be production-ready** for real users

## 🚀 **Next Steps**

1. **Follow setup steps** above
2. **Test with your own email** first
3. **Send invitations** to team members
4. **Monitor email delivery** and success rates

Your team collaboration platform is now ready for **real email invitations**! 🎯
