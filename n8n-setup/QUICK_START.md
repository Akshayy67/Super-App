# Quick Start Guide - Get Running in 10 Minutes

## Prerequisites Check
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Port 5678 available
- [ ] Firebase project set up

## Quick Setup (10 Minutes)

### Step 1: Install n8n (2 minutes)
```bash
# Windows
cd n8n-setup
setup-n8n.bat

# Linux/Mac
npm install -g n8n
```

### Step 2: Configure Environment (3 minutes)
```bash
# Copy and edit .env file
cp .env.example .env
```

**Minimum required variables:**
```env
# Email for daily summaries
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Firebase (from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=super-app-54ae9
FIREBASE_PRIVATE_KEY=your-key-here
FIREBASE_CLIENT_EMAIL=your-service-account@email.com
```

**Optional but recommended:**
```env
# For job scraping
RAPIDAPI_KEY=get-from-rapidapi.com
SERPAPI_KEY=get-from-serpapi.com
```

### Step 3: Start n8n (1 minute)
```bash
# Windows
start-n8n.bat

# Linux/Mac
n8n start
```

Open: http://localhost:5678

### Step 4: Import Workflows (2 minutes)
1. In n8n, click "Workflows" → "Import from File"
2. Import all 3 workflow files:
   - `workflows/job-hunt-scraper.json`
   - `workflows/daily-email-todos.json`
   - `workflows/monthly-summary.json`

### Step 5: Quick Test (2 minutes)
```bash
# Test job hunt
curl -X POST http://localhost:5678/webhook/job-hunt \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"test\", \"preferences\": {\"role\": \"Developer\"}}"
```

## What's Working Now?

✅ **SWOT Analysis**: Automatic analysis after every contest
✅ **Job Scraping**: Scrapes 10+ sources (LinkedIn, Indeed, etc.)
✅ **Daily Emails**: Morning emails with calendar & todos
✅ **Monthly Reports**: Comprehensive monthly summaries

## Integration with SuperApp

1. **Add to `.env.local`:**
```env
VITE_N8N_URL=http://localhost:5678
VITE_ENABLE_SWOT_ANALYSIS=true
```

2. **Use in your code:**
```typescript
// After contest completion
import { ContestCompletionWithSWOT } from './components/contests/ContestCompletionWithSWOT';

<ContestCompletionWithSWOT 
  contestResult={result} 
  onClose={() => navigate('/dashboard')} 
/>
```

## Getting API Keys (Optional)

### Gmail App Password (Required for emails)
1. Go to Google Account Settings
2. Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use in `.env` as `EMAIL_PASSWORD`

### RapidAPI (For job scraping)
1. Sign up: https://rapidapi.com
2. Subscribe to "JSearch API" (free tier available)
3. Copy API key to `.env` as `RAPIDAPI_KEY`

### SerpAPI (For Google Jobs)
1. Sign up: https://serpapi.com
2. Get API key (100 free searches/month)
3. Add to `.env` as `SERPAPI_KEY`

## Testing

### Test SWOT Analysis
```bash
npm run dev
# Take a contest and submit
# You'll see automatic SWOT analysis!
```

### Test Job Scraping
Go to n8n UI → Open "Job Hunt Scraper" → Click "Execute Workflow"

### Test Daily Email
Go to n8n UI → Open "Daily Email" → Click "Execute Workflow"

## Common Issues

### n8n won't start
```bash
# Check if port is in use
netstat -ano | findstr :5678

# Kill process
taskkill /PID <PID> /F
```

### Workflows not executing
1. Check credentials are configured
2. Verify Firebase service account JSON
3. Check API keys are valid

### No SWOT analysis showing
1. Check Firebase permissions
2. Verify contest result format
3. Check browser console for errors

## Next Steps

1. ✅ **Activate workflows** in n8n (toggle switch)
2. ✅ **Test each workflow** manually first
3. ✅ **Take a contest** to see SWOT analysis
4. ✅ **Check email** for daily/monthly reports

## Need Help?

- Check `IMPLEMENTATION_GUIDE.md` for detailed setup
- Review `README.md` for troubleshooting
- Check n8n logs: http://localhost:5678/executions
- Check Firebase Console for data

## Production Checklist

Before deploying to production:
- [ ] Use HTTPS for n8n
- [ ] Enable authentication
- [ ] Secure webhook URLs
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all workflows end-to-end
