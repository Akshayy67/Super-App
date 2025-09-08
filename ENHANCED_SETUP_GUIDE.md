# Enhanced AI Interview System - Setup Guide

## 🚀 Quick Start

This guide will help you set up the enhanced AI interview system with all advanced features including speech analysis, body language detection, intelligent question generation, and performance analytics.

## 📋 Prerequisites

### System Requirements

- **Node.js**: Version 18 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Camera Access**: Required for body language analysis
- **Microphone Access**: Required for speech analysis
- **Stable Internet**: Required for AI services

### API Keys Required

1. **Google AI (Gemini) API Key** - For AI chat and question generation
2. **VAPI Web Token** - For voice interview functionality
3. **Firebase Configuration** - For user authentication and data storage

## 🛠️ Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-interview-system

# Install all dependencies (including new enhanced features)
npm install

# The following packages are automatically installed:
# - @mediapipe/camera_utils, @mediapipe/control_utils, etc. (for computer vision)
# - canvas-confetti (for celebrations)
# - chart.js, react-chartjs-2 (for analytics charts)
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Enable Enhanced Features
VITE_USE_ENHANCED_APP=true

# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=your_actual_gemini_api_key
VITE_GEMINI_MODEL=gemini-2.0-flash

# VAPI Configuration
VITE_VAPI_WEB_TOKEN=your_actual_vapi_token

# Firebase Configuration (existing)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config

# Enhanced Features Settings
VITE_SPEECH_ANALYSIS_ENABLED=true
VITE_BODY_LANGUAGE_ENABLED=true
VITE_PERFORMANCE_TRACKING_ENABLED=true
VITE_INTELLIGENT_QUESTIONS_ENABLED=true
```

### 3. API Key Setup

#### Google AI (Gemini) API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `VITE_GOOGLE_AI_API_KEY` in your `.env` file

#### VAPI Web Token

1. Sign up at [VAPI.ai](https://vapi.ai)
2. Create a new project
3. Get your web token from the dashboard
4. Copy to `VITE_VAPI_WEB_TOKEN` in your `.env` file

### 4. Browser Permissions Setup

The enhanced system requires specific browser permissions:

#### Required Permissions

- **Camera Access**: For body language analysis
- **Microphone Access**: For speech analysis and voice interviews
- **Storage Access**: For performance data persistence

#### Permission Setup

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. When prompted, allow camera and microphone access
4. For production, ensure HTTPS is enabled for permission access

## 🎯 Feature Configuration

### Speech Analysis Settings

```env
# Filler word detection threshold (percentage)
VITE_FILLER_WORD_THRESHOLD=10

# Optimal speaking pace (words per minute)
VITE_OPTIMAL_WPM_MIN=140
VITE_OPTIMAL_WPM_MAX=160
```

### Body Language Analysis Settings

```env
# Eye contact optimal range (percentage)
VITE_EYE_CONTACT_OPTIMAL_MIN=60
VITE_EYE_CONTACT_OPTIMAL_MAX=80
```

### Performance Analytics Settings

```env
# Data retention period (days)
VITE_HISTORICAL_DATA_RETENTION_DAYS=365

# Maximum questions per interview
VITE_MAX_QUESTIONS_PER_INTERVIEW=10
```

## 🚀 Running the Enhanced System

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Accessing Enhanced Features

1. **Enhanced AI Chat**:

   - Navigate to "AI Assistant" in the sidebar
   - Upload images, PDFs, or documents
   - Create multiple chat sessions
   - Request image generation

2. **Smart Interview**:

   - Go to "Smart Interview" section
   - Configure role, difficulty, and type
   - Allow camera and microphone permissions
   - Start comprehensive interview with real-time analysis

3. **Performance Dashboard**:
   - View "Performance" section
   - See detailed analytics and trends
   - Compare with previous interviews
   - Export/import performance data

## 🔧 Troubleshooting

### Common Issues

#### 1. Camera/Microphone Not Working

```bash
# Check browser permissions
# Ensure HTTPS in production
# Verify camera/microphone hardware
```

#### 2. AI Features Not Responding

```bash
# Verify VITE_GOOGLE_AI_API_KEY is set correctly
# Check API key permissions and quotas
# Ensure internet connectivity
```

#### 3. VAPI Voice Interview Issues

```bash
# Verify VITE_VAPI_WEB_TOKEN is correct
# Check VAPI account status and credits
# Ensure microphone permissions are granted
```

#### 4. Performance Data Not Saving

```bash
# Check browser storage permissions
# Verify localStorage is enabled
# Clear browser cache if needed
```

### Debug Mode

Enable debug logging by adding to `.env`:

```env
VITE_DEBUG_MODE=true
```

## 📊 Performance Optimization

### Recommended Settings

#### For Development

```env
VITE_SPEECH_ANALYSIS_ENABLED=true
VITE_BODY_LANGUAGE_ENABLED=true
VITE_DEBUG_MODE=true
```

#### For Production

```env
VITE_SPEECH_ANALYSIS_ENABLED=true
VITE_BODY_LANGUAGE_ENABLED=true
VITE_DEBUG_MODE=false
VITE_PERFORMANCE_TRACKING_ENABLED=true
```

### Browser Compatibility

| Feature               | Chrome | Firefox | Safari | Edge |
| --------------------- | ------ | ------- | ------ | ---- |
| Speech Analysis       | ✅     | ✅      | ✅     | ✅   |
| Body Language         | ✅     | ✅      | ⚠️     | ✅   |
| Voice Interview       | ✅     | ✅      | ✅     | ✅   |
| Performance Analytics | ✅     | ✅      | ✅     | ✅   |

⚠️ Safari may have limited MediaPipe support

## 🔐 Security Considerations

### Data Privacy

- All speech and video analysis is processed locally
- Performance data is stored in browser localStorage
- No sensitive data is sent to external services without encryption

### API Security

- Store API keys securely
- Use environment variables, never commit keys to version control
- Implement rate limiting for production use

### Browser Security

- Ensure HTTPS in production for camera/microphone access
- Implement Content Security Policy (CSP)
- Regular security updates for dependencies

## 📈 Monitoring and Analytics

### Performance Metrics

- Speech analysis accuracy
- Body language detection reliability
- Question generation quality
- User engagement metrics

### Health Checks

```bash
# Check API connectivity
curl -H "Authorization: Bearer $VITE_GOOGLE_AI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models

# Verify VAPI status
curl -H "Authorization: Bearer $VITE_VAPI_WEB_TOKEN" \
  https://api.vapi.ai/health
```

## 🆘 Support

### Getting Help

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all environment variables are set correctly
4. Ensure all required permissions are granted

### Common Solutions

- **Clear browser cache** for permission issues
- **Restart development server** after environment changes
- **Check network connectivity** for API-related issues
- **Update browser** for compatibility issues

### Advanced Configuration

For advanced users, additional configuration options are available in the source code:

- `src/utils/speechAnalysis.ts` - Speech analysis parameters
- `src/utils/bodyLanguageAnalysis.ts` - Computer vision settings
- `src/utils/performanceAnalytics.ts` - Analytics configuration

---

## 🎉 You're Ready!

Once setup is complete, you'll have access to:

- ✅ Enhanced AI chat with image support
- ✅ Real-time speech analysis
- ✅ Computer vision body language detection
- ✅ Intelligent question generation
- ✅ Comprehensive performance analytics
- ✅ Historical progress tracking

Start your first enhanced interview and experience the world-class AI analysis system!
