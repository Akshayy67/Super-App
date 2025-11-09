# Implementation Guide - SWOT Analysis & n8n Automation

## Overview
This guide explains how to implement and use the newly created SWOT analysis system and n8n automation workflows.

## Features Implemented

### 1. SWOT Analysis System
- **Automatic analysis** after contest completion
- **Personalized insights** based on performance
- **Recommendations** with actionable steps
- **Category-wise performance tracking**
- **Historical trend analysis**

### 2. n8n Automation Workflows
- **Job Hunt Scraper**: Scrapes jobs from 10+ sources
- **Daily Email**: Sends calendar events & todos every morning
- **Monthly Summary**: Comprehensive monthly performance report
- **Contest SWOT Trigger**: Automated analysis after contests

## Setup Instructions

### Step 1: Install n8n

**On Windows:**
```bash
cd n8n-setup
setup-n8n.bat
```

**On Linux/Mac:**
```bash
npm install -g n8n
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` in the `n8n-setup` directory:
   ```bash
   cp n8n-setup/.env.example n8n-setup/.env
   ```

2. Update the `.env` file with your credentials:
   - Email credentials (Gmail App Password)
   - RapidAPI key for job scraping
   - SerpAPI key for Google Jobs
   - Firebase service account credentials
   - OpenAI API key (optional)

### Step 3: Start n8n

**On Windows:**
```bash
cd n8n-setup
start-n8n.bat
```

**On Linux/Mac:**
```bash
n8n start
```

Access n8n at: http://localhost:5678

### Step 4: Import Workflows

1. Open n8n at http://localhost:5678
2. Create an account or login
3. Go to "Workflows" → "Import from File"
4. Import each workflow file from `n8n-setup/workflows/`:
   - `job-hunt-scraper.json`
   - `daily-email-todos.json`
   - `monthly-summary.json`

### Step 5: Configure Credentials in n8n

For each workflow, you need to configure:

#### Gmail/SMTP Credentials
1. Go to Credentials → Add Credential → Gmail/SMTP
2. Use OAuth2 or App Password method
3. For App Password:
   - Email: your-email@gmail.com
   - Password: your-16-digit-app-password
   - Host: smtp.gmail.com
   - Port: 587

#### Google Service Account (Firebase)
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. In n8n: Credentials → Add → Google Service Account
5. Paste the JSON key

#### RapidAPI
1. Sign up at https://rapidapi.com
2. Subscribe to JSearch API
3. Copy your API key
4. In n8n: Credentials → Add → HTTP Header Auth
5. Header: X-RapidAPI-Key
6. Value: your-api-key

#### SerpAPI
1. Sign up at https://serpapi.com
2. Get your API key
3. Add to workflow nodes as needed

### Step 6: Activate Workflows

1. Open each imported workflow
2. Click "Activate" toggle in top-right
3. Test each workflow manually first

### Step 7: Configure SuperApp Environment

Add to your `.env.local` file:

```env
# n8n Integration
VITE_N8N_URL=http://localhost:5678
VITE_N8N_WEBHOOK_SECRET=your-random-secret-key

# Enable features
VITE_ENABLE_SWOT_ANALYSIS=true
VITE_ENABLE_JOB_SCRAPING=true
VITE_ENABLE_DAILY_EMAILS=true
```

## Usage

### Using SWOT Analysis

1. **After Contest Completion:**
   ```typescript
   import { swotAnalysisService } from './services/swotAnalysisService';
   
   // Generate analysis
   const swot = await swotAnalysisService.generateSWOTAnalysis(contestResult);
   ```

2. **Display SWOT Analysis:**
   ```tsx
   import { SWOTAnalysisDisplay } from './components/contests/SWOTAnalysisDisplay';
   
   <SWOTAnalysisDisplay userId={userId} contestId={contestId} />
   ```

3. **Integrated Contest Completion:**
   ```tsx
   import { ContestCompletionWithSWOT } from './components/contests/ContestCompletionWithSWOT';
   
   <ContestCompletionWithSWOT 
     contestResult={result} 
     onClose={() => navigate('/dashboard')} 
   />
   ```

### Triggering n8n Workflows

1. **Job Hunt Scraper:**
   ```typescript
   import { n8nIntegrationService } from './services/n8nIntegrationService';
   
   await n8nIntegrationService.triggerJobHunt(userId, {
     role: 'Software Engineer',
     location: 'Remote',
     experience: 'entry-level'
   });
   ```

2. **Daily Email (Manual):**
   ```typescript
   await n8nIntegrationService.triggerDailyEmail(userId, userEmail);
   ```

3. **Monthly Summary:**
   ```typescript
   await n8nIntegrationService.triggerMonthlySummary(userId, userEmail);
   ```

## Integrating with Existing Contest System

Update your `ContestTakingInterface.tsx`:

```typescript
import { ContestCompletionWithSWOT } from './ContestCompletionWithSWOT';
import { swotAnalysisService, ContestResult } from '../../services/swotAnalysisService';

// In your submit handler:
const handleContestSubmit = async (answers: any, timeTaken: number) => {
  // Calculate results
  const result: ContestResult = {
    userId: currentUser.uid,
    contestId: contest.id,
    answers,
    score: calculateScore(answers),
    totalQuestions: contest.questions.length,
    timeTaken,
    timeLimit: contest.totalTime * 60,
    correctAnswers: calculateCorrectAnswers(answers),
    wrongAnswers: calculateWrongAnswers(answers),
    categoryPerformance: calculateCategoryPerformance(answers),
    timestamp: new Date(),
  };

  // Save to Firebase
  await saveContestResult(result);

  // Show results with SWOT analysis
  setShowSWOTCompletion(true);
  setContestResult(result);
};

// In your render:
{showSWOTCompletion && contestResult && (
  <ContestCompletionWithSWOT
    contestResult={contestResult}
    onClose={() => setShowSWOTCompletion(false)}
  />
)}
```

## Firestore Collections Required

### 1. `contestResults`
```javascript
{
  userId: string,
  contestId: string,
  answers: object,
  score: number,
  totalQuestions: number,
  timeTaken: number,
  timeLimit: number,
  correctAnswers: number,
  wrongAnswers: number,
  categoryPerformance: object,
  timestamp: timestamp
}
```

### 2. `swotAnalysis`
```javascript
{
  userId: string,
  contestId: string,
  strengths: array,
  weaknesses: array,
  opportunities: array,
  threats: array,
  overallScore: number,
  performanceMetrics: object,
  recommendations: array,
  timestamp: timestamp
}
```

### 3. `scrapedJobs`
```javascript
{
  userId: string,
  title: string,
  company: string,
  location: string,
  description: string,
  url: string,
  source: string,
  salary: string,
  postedDate: string,
  employmentType: string,
  remote: boolean,
  scrapedAt: timestamp
}
```

### 4. User Preferences
Add to existing `users` collection:
```javascript
{
  ...existingFields,
  dailyEmailEnabled: boolean,
  monthlySummaryEnabled: boolean,
  jobPreferences: {
    role: string,
    location: string,
    experience: string,
    remoteOnly: boolean
  }
}
```

## Testing

### Test SWOT Analysis
```typescript
// Create a test contest result
const testResult: ContestResult = {
  userId: 'test-user',
  contestId: 'test-contest',
  answers: {},
  score: 75,
  totalQuestions: 10,
  timeTaken: 300,
  timeLimit: 600,
  correctAnswers: 7,
  wrongAnswers: 3,
  categoryPerformance: {
    'Data Structures': { correct: 3, total: 4 },
    'Algorithms': { correct: 4, total: 6 }
  },
  timestamp: new Date()
};

const swot = await swotAnalysisService.generateSWOTAnalysis(testResult);
console.log('SWOT Analysis:', swot);
```

### Test n8n Workflows

1. **Job Hunt:**
   ```bash
   curl -X POST http://localhost:5678/webhook/job-hunt \
     -H "Content-Type: application/json" \
     -d '{"userId": "test-user", "preferences": {"role": "Software Engineer"}}'
   ```

2. **Daily Email:**
   ```bash
   curl -X POST http://localhost:5678/webhook/daily-email \
     -H "Content-Type: application/json" \
     -d '{"userId": "test-user", "email": "test@example.com"}'
   ```

## Monitoring

### n8n Dashboard
- View workflow executions: http://localhost:5678/executions
- Check logs for errors
- Monitor success/failure rates

### Firebase Console
- Check `swotAnalysis` collection for generated analyses
- Monitor `scrapedJobs` collection for job data
- Review user activity in `contestResults`

## Troubleshooting

### SWOT Analysis Issues
- **Error: "Failed to generate"**: Check Firebase permissions
- **Incomplete analysis**: Ensure contest result has all required fields
- **No recommendations**: Verify category performance data

### n8n Workflow Issues
- **Workflow not triggering**: Check webhook URL
- **Email not sending**: Verify SMTP credentials
- **Job scraping failing**: Check API keys and rate limits

### Integration Issues
- **n8n not connecting**: Ensure n8n is running on port 5678
- **CORS errors**: Configure n8n CORS settings
- **Authentication failures**: Verify webhook secret

## Production Deployment

### n8n Production Setup
```bash
# Using Docker Compose
cd n8n-setup
docker-compose up -d

# Or with environment variables
N8N_BASIC_AUTH_ACTIVE=true \
N8N_BASIC_AUTH_USER=admin \
N8N_BASIC_AUTH_PASSWORD=secure_password \
N8N_HOST=your-domain.com \
N8N_PROTOCOL=https \
n8n start
```

### Security Considerations
1. **Use HTTPS** for n8n in production
2. **Enable authentication** with strong passwords
3. **Secure webhook URLs** with secret tokens
4. **Rate limit** API calls
5. **Encrypt** sensitive credentials
6. **Regular backups** of workflows and data

## Support

For issues or questions:
1. Check n8n documentation: https://docs.n8n.io
2. Review Firebase documentation
3. Check console logs for errors
4. Test workflows individually in n8n UI

## Next Steps

1. Customize SWOT analysis criteria
2. Add more job sources to scraper
3. Create additional n8n workflows
4. Implement push notifications
5. Add analytics dashboard
6. Create admin panel for workflow management
