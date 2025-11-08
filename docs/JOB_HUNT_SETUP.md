# Job Hunt System - Complete Setup Guide

## 🎯 Overview

The Job Hunt system is a comprehensive job aggregation and matching platform that:
- Aggregates jobs from 10+ reliable sources
- Refreshes jobs every 6 hours automatically
- Focuses on Hyderabad, India and Remote positions
- Includes intelligent job matching based on your profile
- Provides ATS score checking and resume optimization

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Prerequisites](#prerequisites)
3. [Setup Steps](#setup-steps)
4. [Job Sources Configuration](#job-sources-configuration)
5. [Automated Job Scraping](#automated-job-scraping)
6. [API Keys Setup](#api-keys-setup)
7. [N8N Workflow Setup](#n8n-workflow-setup)
8. [Deployment](#deployment)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Job Hunt System                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  Job Sources │───▶│ Aggregation  │───▶│ Firebase  │ │
│  │   (10+ APIs) │    │   Service    │    │ Firestore │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                    │                    │      │
│         ▼                    ▼                    ▼      │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Web Scraping │    │   Filtering  │    │    Job    │ │
│  │  (Puppeteer) │    │  & Matching  │    │  Matching │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         N8N Workflow (6-hour scheduler)            │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Software
- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

### Optional but Recommended
- N8N (for automated workflows)
- Docker (for N8N deployment)
- Puppeteer (for web scraping)

### Required API Keys
1. **Adzuna API** (Free tier: 1000 calls/month)
   - Sign up: https://developer.adzuna.com/signup
   
2. **RapidAPI** (Free tier available)
   - Sign up: https://rapidapi.com/hub
   - Subscribe to: JSearch, LinkedIn Data API

3. **GitHub Personal Access Token** (Free)
   - For accessing job repos
   - Generate: https://github.com/settings/tokens

---

## 🚀 Setup Steps

### Step 1: Install Dependencies

```bash
cd SuperApp
npm install axios cheerio puppeteer rss-parser date-fns
```

### Step 2: Configure Environment Variables

Create/update `.env.local`:

```env
# Firebase (already configured)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config

# Job Hunt API Keys
VITE_ADZUNA_APP_ID=your_adzuna_app_id
VITE_ADZUNA_API_KEY=your_adzuna_api_key
VITE_RAPIDAPI_KEY=your_rapidapi_key

# N8N Configuration
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url

# Job Scraping Settings
VITE_JOB_REFRESH_INTERVAL=21600000  # 6 hours in milliseconds
VITE_MAX_JOBS_PER_SOURCE=50
```

### Step 3: Firebase Setup

1. **Create Firestore Collections:**

```javascript
// Collection: jobListings
{
  title: string,
  company: string,
  location: string,
  type: string,
  description: string,
  requirements: string[],
  salary: string,
  experience: string,
  skills: string[],
  url: string,
  source: string,
  postedDate: timestamp,
  scrapedAt: timestamp,
  isRemote: boolean,
  isHyderabad: boolean,
  applicationDeadline: timestamp,
  companyLogo: string,
  matchScore: number
}

// Collection: userJobPreferences
{
  userId: string,
  skills: string[],
  preferredLocations: string[],
  experience: string,
  jobType: string[],
  minSalary: number,
  updatedAt: timestamp
}

// Collection: jobApplications
{
  userId: string,
  jobId: string,
  status: string, // applied, interviewing, rejected, accepted
  appliedDate: timestamp,
  notes: string
}
```

2. **Firestore Indexes:**

Go to Firebase Console → Firestore → Indexes and create:

```
Collection: jobListings
- scrapedAt (Descending)
- isRemote (Ascending)
- isHyderabad (Ascending)

Collection: userJobPreferences
- userId (Ascending)
- updatedAt (Descending)
```

3. **Firestore Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobListings/{jobId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend/admin can write
    }
    
    match /userJobPreferences/{prefId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    match /jobApplications/{appId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🔌 Job Sources Configuration

### 1. Free Job APIs

#### Remotive (No API key needed)
```bash
curl https://remotive.io/api/remote-jobs
```

#### Adzuna (Requires API key)
```bash
curl "https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=YOUR_APP_ID&app_key=YOUR_API_KEY&results_per_page=50&what=software&where=hyderabad"
```

### 2. RSS Feeds (No API key)

- Stack Overflow Jobs: `https://stackoverflow.com/jobs/feed`
- Python Jobs: `https://www.python.org/jobs/feed/rss/`
- React Jobs: `https://www.react-jobs.com/rss`

### 3. GitHub Job Repositories

Popular repos with job listings:
- https://github.com/remoteintech/remote-jobs
- https://github.com/lukasz-madon/awesome-remote-job
- https://github.com/engineerapart/TheRemoteFreelancer

### 4. Web Scraping Targets (Requires Puppeteer)

**Priority Sources:**
1. Naukri.com (Hyderabad)
2. LinkedIn Jobs
3. Indeed India
4. Monster India
5. Foundit (formerly Monster)
6. Instahyre
7. Wellfound (AngelList)
8. Cutshort
9. HasJob

---

## 🤖 Automated Job Scraping

See [JOB_SCRAPING_SETUP.md](./JOB_SCRAPING_SETUP.md) for detailed scraping implementation.

---

## 🔑 API Keys Setup

### Adzuna API

1. Go to https://developer.adzuna.com/signup
2. Create account and verify email
3. Navigate to "Your Apps"
4. Create new application
5. Copy App ID and API Key
6. Add to `.env.local`:

```env
VITE_ADZUNA_APP_ID=12345678
VITE_ADZUNA_API_KEY=abcdef1234567890abcdef1234567890
```

### RapidAPI (JSearch)

1. Go to https://rapidapi.com/hub
2. Sign up and verify email
3. Search for "JSearch" API
4. Subscribe to Free plan (1000 requests/month)
5. Copy API key from "Code Snippets"
6. Add to `.env.local`:

```env
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
```

---

## 🔄 N8N Workflow Setup

See [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md) for complete N8N configuration.

**Quick Overview:**

1. Install N8N:
```bash
npm install -g n8n
# or with Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

2. Start N8N:
```bash
n8n start
```

3. Access: http://localhost:5678

4. Import workflow from `docs/n8n-workflows/job-hunt-workflow.json`

---

## 🚢 Deployment

### Option 1: Vercel (Recommended for Frontend)

```bash
npm run build
vercel --prod
```

### Option 2: Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Option 3: Firebase Functions (for Backend Job Aggregation)

```bash
cd functions
npm run deploy
```

---

## 📊 Testing the Setup

1. **Test Job Aggregation:**

```javascript
import { jobHuntService } from './services/jobHuntService';

// Fetch and save jobs
const jobs = await jobHuntService.aggregateJobsFromAllSources();
await jobHuntService.saveJobsToDatabase(jobs);

console.log(`Found ${jobs.length} jobs`);
```

2. **Test Job Matching:**

```javascript
// Set user preferences
await jobHuntService.saveUserJobPreferences('userId', {
  skills: ['React', 'TypeScript', 'Node.js'],
  preferredLocations: ['hyderabad', 'remote'],
  experience: '2-5 years',
  jobType: ['full-time', 'remote'],
});

// Get matched jobs
const matchedJobs = await jobHuntService.getJobs('userId', {
  location: ['hyderabad'],
  remote: true,
  postedWithin: 7,
});

console.log(matchedJobs);
```

---

## 🔧 Troubleshooting

### Issue: No jobs appearing

**Solution:**
1. Check API keys are correctly set in `.env.local`
2. Verify Firebase Firestore rules allow reads
3. Check console for errors
4. Run manual job aggregation test

### Issue: Scraping not working

**Solution:**
1. Install Puppeteer: `npm install puppeteer`
2. For Linux servers, install dependencies:
```bash
apt-get install -y libgbm-dev chromium-browser
```

### Issue: N8N workflow not triggering

**Solution:**
1. Check N8N is running: `curl http://localhost:5678`
2. Verify webhook URL in environment variables
3. Check N8N logs for errors

---

## 📚 Next Steps

1. Review [JOB_SCRAPING_SETUP.md](./JOB_SCRAPING_SETUP.md) for scraping configuration
2. Review [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md) for automation
3. Review [JOB_MATCHING_ALGORITHM.md](./JOB_MATCHING_ALGORITHM.md) for matching logic
4. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment

---

## 🎯 Success Metrics

After setup, you should have:
- ✅ 100+ jobs in database
- ✅ Jobs refreshing every 6 hours
- ✅ Match scores for each job
- ✅ Filter by location, skills, type
- ✅ Apply tracking system

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review individual setup docs
3. Check Firebase console for errors
4. Verify all API keys are active

---

**Last Updated:** 2025-01-08
**Version:** 1.0.0
