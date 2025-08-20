# VAPI Setup for Main App Mock Interviews

## Quick Setup (5 minutes)

### 1. Get VAPI Account
- Sign up at [vapi.ai](https://vapi.ai)
- Verify your email and complete setup

### 2. Get Your API Key
- Log into VAPI dashboard
- Go to **Settings** → **API Keys**
- Copy your **Web Token** (starts with `sk-`)

### 3. Configure Environment
Create a `.env` file in your project root:

```bash
# Required for real-time interviews
VITE_VAPI_WEB_TOKEN=sk_your_actual_token_here
```

### 4. Restart & Test
```bash
npm run dev
```
Navigate to Interview Prep → Mock Interview and click "Start Interview"

## What's New

The Mock Interview component now includes:
- ✅ Real-time voice AI interviews
- ✅ AI interviewer asking questions
- ✅ Voice transcription
- ✅ Conversation tracking
- ✅ Professional interview flow

## Troubleshooting

### ❌ "VAPI is not properly configured"
**Solution**: Set up your environment variables
```bash
# Create .env file
echo "VITE_VAPI_WEB_TOKEN=sk_your_token_here" > .env

# Restart your dev server
npm run dev
```

### ❌ "Failed to start call"
**Common causes**:
- Invalid API token
- Insufficient VAPI credits
- Network connectivity issues
- Browser permissions denied

**Solutions**:
1. Check your token is correct
2. Verify you have credits in VAPI account
3. Check browser console for errors
4. Grant microphone permissions

### ❌ Audio not working
**Checklist**:
- [ ] Microphone permission granted
- [ ] No other apps using microphone
- [ ] Browser supports WebRTC
- [ ] VAPI token is valid
- [ ] Sufficient VAPI credits

## Browser Requirements
- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅  
- **Safari**: Limited support ⚠️
- **Mobile**: Limited support ⚠️

## Testing Your Setup

### 1. Check Console Logs
Open browser console and look for:
```
VAPI SDK initialized successfully
```

### 2. Test Microphone Access
Visit [https://webrtc.github.io/samples/src/content/getusermedia/audio/](https://webrtc.github.io/samples/src/content/getusermedia/audio/) to test microphone

### 3. Verify VAPI Token
Test your token with a simple API call:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.vapi.ai/assistant
```

## Support Resources

- **VAPI Documentation**: [docs.vapi.ai](https://docs.vapi.ai)
- **VAPI Discord**: [discord.gg/vapi](https://discord.gg/vapi)
- **VAPI Status**: [status.vapi.ai](https://status.vapi.ai)

## Common Questions

**Q: Do I need a paid VAPI plan?**
A: VAPI offers free credits for new users. Check their pricing at [vapi.ai/pricing](https://vapi.ai/pricing)

**Q: Can I use this without VAPI?**
A: No, the real-time voice functionality requires VAPI. However, you can still use the tips and question bank features.

**Q: Is my data secure?**
A: VAPI processes audio in real-time and doesn't store your conversations. Check their [privacy policy](https://vapi.ai/privacy) for details.

**Q: What if I run out of credits?**
A: You'll need to add more credits to your VAPI account to continue using real-time interviews.
