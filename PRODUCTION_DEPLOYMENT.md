# Production Deployment Guide

## 🚀 Team Collaboration Features - Production Ready

Your Super Study App now includes comprehensive team collaboration features that are ready for production deployment. This guide will help you set up and deploy all the features successfully.

## ✅ Features Implemented

### 1. **EmailJS Integration** 
- ✅ Real email invitations for team members
- ✅ Professional email templates with branding
- ✅ Email delivery tracking and error handling
- ✅ Test panel for email service validation

### 2. **Team Management System**
- ✅ Create and manage teams
- ✅ Role-based permissions (Owner, Admin, Member, Viewer)
- ✅ Member invitation system with invite codes
- ✅ Team settings and configuration
- ✅ Activity logging and audit trail

### 3. **File Sharing & Permissions**
- ✅ Upload and share files with teams
- ✅ Granular permission system (View, Edit, Admin)
- ✅ File tagging and organization
- ✅ Support for URLs and file uploads
- ✅ File type restrictions and size limits

### 4. **Google Drive Backup**
- ✅ Automatic team folder creation
- ✅ Real-time sync with Google Drive
- ✅ Member access management
- ✅ Team data backup and recovery

### 5. **REST API Endpoints**
- ✅ Complete API for team operations
- ✅ File sharing API with permissions
- ✅ CORS support for cross-origin requests
- ✅ Error handling and validation

### 6. **Real-time Features**
- ✅ Team chat functionality
- ✅ Real-time activity updates
- ✅ Member status tracking
- ✅ Live collaboration features

## 🛠️ Setup Instructions

### Step 1: Environment Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure Firebase:**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
   ```

3. **Configure EmailJS (Required for invitations):**
   ```env
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```

4. **Configure Google Drive (Optional):**
   ```env
   VITE_GOOGLE_API_KEY=your_google_api_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
   ```

### Step 2: EmailJS Setup

1. **Create EmailJS Account:**
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Create a free account
   - Create a new email service (Gmail, Outlook, etc.)

2. **Create Email Template:**
   ```html
   Subject: You're invited to join {{team_name}} - Team Collaboration Platform

   Hello {{to_name}},

   {{inviter_name}} has invited you to join their team {{team_name}} on our collaboration platform.

   Your personal invitation code is: {{invite_code}}

   To accept this invitation:
   1. Visit our app at {{app_url}}
   2. Click on "Join Team" in the Team Space section
   3. Enter the invitation code above
   4. Start collaborating with your team!

   Note: This invitation will expire in 7 days for security reasons.

   Best regards,
   The Team Collaboration Platform
   ```

3. **Get Configuration Values:**
   - Service ID from EmailJS dashboard
   - Template ID from your created template
   - Public Key from Account settings

### Step 3: Firebase Configuration

1. **Enable Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Teams collection
       match /teams/{teamId} {
         allow read, write: if request.auth != null && 
           request.auth.uid in resource.data.members;
       }
       
       // Team invites
       match /teamInvites/{inviteId} {
         allow read, write: if request.auth != null;
       }
       
       // Shared files
       match /sharedFiles/{fileId} {
         allow read, write: if request.auth != null &&
           request.auth.uid in resource.data.permissions.view ||
           request.auth.uid in resource.data.permissions.edit ||
           request.auth.uid in resource.data.permissions.admin;
       }
       
       // Team activities
       match /teamActivities/{activityId} {
         allow read, write: if request.auth != null;
       }
       
       // Team messages
       match /teamMessages/{messageId} {
         allow read, write: if request.auth != null;
       }
       
       // User profiles
       match /users/{userId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == userId;
       }
     }
   }
   ```

2. **Enable Authentication:**
   - Enable Google OAuth in Firebase Console
   - Add your domain to authorized domains
   - Configure OAuth consent screen

### Step 4: Google Drive API Setup (Optional)

1. **Enable Google Drive API:**
   - Go to Google Cloud Console
   - Enable Google Drive API
   - Create credentials (API Key + OAuth 2.0 Client ID)

2. **Configure OAuth Scopes:**
   ```javascript
   const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
   const SCOPES = 'https://www.googleapis.com/auth/drive.file';
   ```

### Step 5: Deploy to Production

#### Option 1: Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables:**
   - Add all `.env` variables in Vercel dashboard
   - Set `NODE_ENV=production`

#### Option 2: Netlify Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Upload `dist` folder to Netlify
   - Configure environment variables
   - Set redirects for SPA routing

#### Option 3: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 4173
   CMD ["npm", "run", "preview"]
   ```

2. **Build and run:**
   ```bash
   docker build -t super-study-app .
   docker run -p 4173:4173 super-study-app
   ```

## 🔧 API Endpoints

Your app now includes these REST API endpoints:

### Team Management
- `GET /api/teams?userId={userId}` - Get user's teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/{id}` - Update team
- `DELETE /api/teams/{id}` - Delete team
- `POST /api/teams?action=join` - Join team by invite code

### File Sharing
- `GET /api/files?teamId={teamId}&userId={userId}` - Get team files
- `POST /api/files` - Share new file
- `PUT /api/files/{id}` - Update file
- `DELETE /api/files/{id}` - Delete file
- `POST /api/files?action=permission` - Update file permissions

## 🧪 Testing the Features

### 1. Test Email Service
- Go to Team Settings → Email Service
- Click "Test Email Service"
- Enter your email and verify delivery

### 2. Test Team Creation
- Create a new team
- Verify Firebase storage
- Check Google Drive folder creation

### 3. Test Invitations
- Send invitation to team member
- Verify email delivery
- Test join process with invite code

### 4. Test File Sharing
- Upload a file to team
- Set different permissions
- Verify access controls

### 5. Test Role Management
- Change member roles
- Verify permission enforcement
- Test role-based access

## 🔒 Security Considerations

### 1. **Environment Variables**
- Never commit `.env` files
- Use different keys for development/production
- Rotate API keys regularly

### 2. **Firestore Security**
- Implement proper security rules
- Validate user permissions
- Audit access patterns

### 3. **File Upload Security**
- Implement file type validation
- Set size limits (5MB default)
- Scan for malicious content

### 4. **Rate Limiting**
- Implement API rate limiting
- Monitor for abuse patterns
- Set reasonable quotas

## 📊 Monitoring & Analytics

### 1. **Error Tracking**
- Set up Sentry for error monitoring
- Track API response times
- Monitor email delivery rates

### 2. **Usage Analytics**
- Track team creation rates
- Monitor file sharing activity
- Analyze user engagement

### 3. **Performance Monitoring**
- Monitor Firebase usage
- Track API response times
- Monitor file upload speeds

## 🎯 Feature Flags

Control features using environment variables:

```env
ENABLE_TEAM_FEATURES=true
ENABLE_FILE_SHARING=true
ENABLE_GOOGLE_DRIVE_BACKUP=true
ENABLE_EMAIL_INVITATIONS=true
ENABLE_REAL_TIME_CHAT=true
ENABLE_VIDEO_CALLS=false
```

## 📞 Support & Troubleshooting

### Common Issues:

1. **EmailJS not working:**
   - Verify service configuration
   - Check template parameters
   - Test with email service directly

2. **Firebase permissions denied:**
   - Check Firestore rules
   - Verify user authentication
   - Review collection permissions

3. **Google Drive integration failing:**
   - Verify API credentials
   - Check OAuth scopes
   - Test API access

4. **File uploads failing:**
   - Check file size limits
   - Verify file type restrictions
   - Test storage permissions

## 🚀 Go Live Checklist

- [ ] Environment variables configured
- [ ] EmailJS service tested
- [ ] Firebase rules deployed
- [ ] Google Drive API configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Error monitoring setup
- [ ] Backup strategy implemented
- [ ] Performance monitoring active
- [ ] User documentation updated

## 🎉 Congratulations!

Your Super Study App now has enterprise-grade team collaboration features that are production-ready! Users can:

- Create and manage teams with role-based permissions
- Invite members via email with professional templates
- Share files with granular permission controls
- Collaborate in real-time with chat and activity feeds
- Backup team data to Google Drive automatically
- Access everything through REST APIs for integrations

Your app is now ready to scale and support collaborative learning experiences! 🌟