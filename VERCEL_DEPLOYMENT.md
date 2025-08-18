# Vercel Deployment Configuration

## Environment Variables Setup

To deploy your Super App with working AI services on Vercel, you need to set the following environment variables in your Vercel dashboard:

### Required Environment Variables

1. **VITE_GOOGLE_AI_API_KEY**
   - Value: `AIzaSyCv0kE7tjPswgTP3UTdMbw_cbmBbgY0nYk`
   - This enables Google Gemini AI functionality

2. **VITE_GEMINI_MODEL** (Optional)
   - Value: `gemini-2.0-flash`
   - Default model to use for AI responses

### How to Set Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Super-App project
3. Go to **Settings** → **Environment Variables**
4. Add the variables above
5. Redeploy your project

### Why This is Needed

- Vite environment variables (`VITE_*`) are only available at build time
- Local `.env` files are not included in production builds
- Vercel needs these variables to be set in their dashboard
- The variables are then baked into the build during deployment

### Testing

After setting the environment variables and redeploying:
- AI Chat should work without "Demo mode" messages
- Study Tools should generate real AI responses
- File Manager AI features should work properly
- AI Status should show "Google Gemini ✓"

### Troubleshooting

If AI still shows as not configured:
1. Verify environment variables are set in Vercel dashboard
2. Redeploy the project after setting variables
3. Check browser console for any API errors
4. Ensure the API key is valid and has proper permissions
