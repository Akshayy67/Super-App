# AI-Powered Interview Setup Guide

## Overview
The custom interview feature now uses Google Gemini AI to generate personalized interview questions based on your preferences, then conducts the interview using VAPI (Voice AI Platform).

## Features
- **AI Question Generation**: Automatically creates role-specific, difficulty-appropriate questions using Google Gemini AI
- **VAPI Integration**: Conducts real-time voice interviews with AI-generated questions
- **Custom Preferences**: Set role, difficulty, focus areas, and question count
- **Fallback System**: If AI fails, falls back to pre-built role-specific questions

## Setup Requirements

### 1. Google Gemini AI API Key
To use AI-generated questions, you need a Google AI API key:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Go to API Keys section
4. Create a new API key
5. Add to your environment variables:

```bash
# Create a .env file in your project root
VITE_GOOGLE_AI_API_KEY=your_actual_api_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash
```

### 2. VAPI Configuration (Optional)
For voice interviews:

1. Sign up at [VAPI.ai](https://vapi.ai)
2. Get your Web Token from Settings → API Keys
3. Add to your environment variables:

```bash
VITE_VAPI_WEB_TOKEN=your_vapi_web_token_here
```

## How It Works

### 1. User Input
- Enter target role (e.g., "Software Engineer", "Product Manager")
- Select difficulty level (Easy, Medium, Hard)
- Choose number of questions (3-10 maximum for optimal experience)
- Set duration (5-120 minutes)
- Select focus areas (Technical, Behavioral, Leadership, etc.)
- Add technology tags (e.g., React, Django, AWS, Docker)
- Optionally add custom questions

### 2. AI Question Generation
When you click "Create Custom Interview":
- System sends your preferences to Google Gemini AI
- AI generates personalized questions based on role, difficulty, focus areas, and technology tags
- Questions are formatted and integrated into the interview session
- Technology-specific questions are included when tags are provided

### 3. VAPI Interview
- AI interviewer uses the generated questions
- Conducts real-time voice conversation
- Adapts difficulty based on your responses
- Provides professional interview experience

## Example AI-Generated Questions

### For Software Engineer (Hard Difficulty) with React, Node.js tags
1. "How would you design a scalable microservices architecture for a high-traffic e-commerce platform using React and Node.js?"
2. "Describe your approach to debugging a production issue that only occurs under specific load conditions in a React SPA."
3. "How do you ensure code quality and maintainability in a team of 10+ developers working with React and Node.js?"

### For Data Scientist (Medium Difficulty) with Python, TensorFlow tags
1. "How do you approach data cleaning and preprocessing in Python for machine learning projects?"
2. "Describe your experience with TensorFlow for building and deploying ML models."
3. "How do you handle missing or incomplete data in Python-based data analysis?"

## Fallback System
If AI question generation fails:
- System automatically falls back to pre-built role-specific questions
- Questions are still tailored to your preferences
- Interview continues without interruption

## Cost Considerations
- Google Gemini API calls: Very affordable, check [Google AI pricing](https://ai.google.dev/pricing)
- VAPI calls: Check [VAPI pricing](https://vapi.ai/pricing)
- Consider setting usage limits in your Google AI account

## Troubleshooting

### AI Questions Not Generating
- Check Google AI API key is correctly set as `VITE_GOOGLE_AI_API_KEY`
- Verify API key has sufficient credits
- Check browser console for error messages

### VAPI Not Working
- Ensure VAPI web token is configured
- Check browser compatibility
- Verify microphone permissions

### Performance Issues
- Reduce question count for faster generation
- Use lower difficulty levels for simpler questions
- Check internet connection stability

## Best Practices

### For Best AI Results
- Be specific with role titles
- Choose appropriate difficulty levels
- Select relevant focus areas
- Provide clear, descriptive role information

### For Smooth Interviews
- Test microphone before starting
- Use quiet environment
- Speak clearly and at normal pace
- Allow AI to complete questions before responding

## Support
If you encounter issues:
1. Check browser console for error messages
2. Verify all API keys are correctly configured
3. Ensure you have sufficient API credits
4. Check network connectivity
