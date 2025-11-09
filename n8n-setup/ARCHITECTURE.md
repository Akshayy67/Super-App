# System Architecture - SWOT Analysis & n8n Automation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SuperApp Frontend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Contest    │  │    User      │  │     Job      │         │
│  │  Interface   │  │  Dashboard   │  │    Board     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Integration Services                         │
│  ┌──────────────────┐         ┌─────────────────────────┐      │
│  │ swotAnalysis     │         │  n8nIntegration         │      │
│  │ Service          │◄────────┤  Service                │      │
│  └────────┬─────────┘         └──────────┬──────────────┘      │
└───────────┼────────────────────────────────┼─────────────────────┘
            │                                │
            ▼                                ▼
┌───────────────────────────┐    ┌──────────────────────────────┐
│      Firebase/Firestore   │    │      n8n Automation          │
│  ┌────────────────────┐   │    │  ┌────────────────────────┐ │
│  │  contestResults    │   │    │  │  Job Hunt Scraper      │ │
│  │  swotAnalysis      │   │    │  │  Daily Email           │ │
│  │  scrapedJobs       │   │    │  │  Monthly Summary       │ │
│  │  todos             │   │    │  │  Contest SWOT Trigger  │ │
│  │  calendarEvents    │   │    │  └────────────────────────┘ │
│  └────────────────────┘   │    └──────────────────────────────┘
└───────────────────────────┘                 │
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                    │  External    │ │   Email      │ │   Firebase   │
                    │  Job APIs    │ │   Service    │ │   Database   │
                    │  (RapidAPI,  │ │   (SMTP)     │ │              │
                    │   SerpAPI)   │ │              │ │              │
                    └──────────────┘ └──────────────┘ └──────────────┘
```

## 🔄 Data Flow Diagrams

### Flow 1: Contest Completion → SWOT Analysis

```
User Submits Contest
        │
        ▼
┌───────────────────────┐
│ ContestTakingInterface│
│   - Calculate score   │
│   - Analyze answers   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  ContestCompletion    │
│  WithSWOT Component   │
│   - Show results      │
│   - Trigger analysis  │
└───────────┬───────────┘
            │
            ├─────────────────────────┐
            ▼                         ▼
┌───────────────────────┐   ┌───────────────────────┐
│ swotAnalysisService   │   │ n8nIntegrationService │
│   - Identify SWOT     │   │   - Trigger webhook   │
│   - Generate recs     │   │   - Additional proc   │
│   - Save to Firebase  │   └───────────────────────┘
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  SWOTAnalysisDisplay  │
│   - Show SWOT grid    │
│   - Display metrics   │
│   - Show recs         │
└───────────────────────┘
            │
            ▼
      User sees insights
```

### Flow 2: Job Hunt Scraping

```
User Requests Jobs / Scheduled Trigger
        │
        ▼
┌───────────────────────┐
│ n8nIntegration        │
│ Service.triggerJobHunt│
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ n8n: Job Hunt Scraper │
│   - Prepare queries   │
│   - Split batches     │
└───────────┬───────────┘
            │
            ├────────────────────┐
            ▼                    ▼
┌───────────────────┐  ┌───────────────────┐
│  JSearch API      │  │  SerpAPI          │
│  (LinkedIn, etc)  │  │  (Google Jobs)    │
└─────────┬─────────┘  └─────────┬─────────┘
          │                       │
          └───────────┬───────────┘
                      ▼
          ┌───────────────────────┐
          │  Parse & Deduplicate  │
          │   - Normalize data    │
          │   - Remove dupes      │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  Save to Firebase     │
          │  Collection:          │
          │  scrapedJobs          │
          └───────────┬───────────┘
                      │
                      ▼
            User sees job listings
```

### Flow 3: Daily Email with Todos & Calendar

```
Cron Schedule (7 AM Daily)
        │
        ▼
┌───────────────────────┐
│ n8n: Daily Email      │
│   - Get all users     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  For Each User        │
│   - Get userId        │
│   - Get email         │
└───────────┬───────────┘
            │
            ├─────────────────────────┐
            ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│  Get User Todos   │     │ Get Calendar      │
│  - Query Firebase │     │ Events            │
│  - Filter pending │     │ - Today's events  │
└─────────┬─────────┘     └─────────┬─────────┘
          │                         │
          └────────────┬────────────┘
                       ▼
           ┌───────────────────────┐
           │ Generate Email HTML   │
           │   - Format data       │
           │   - Create template   │
           └───────────┬───────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │  Send Email (SMTP)    │
           │   - Gmail/SMTP        │
           └───────────┬───────────┘
                       │
                       ▼
              User receives email
```

### Flow 4: Monthly Summary Report

```
Cron Schedule (1st of Month, 9 AM)
        │
        ▼
┌───────────────────────┐
│ n8n: Monthly Summary  │
│   - Get all users     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  For Each User        │
│   - Calculate dates   │
│   - Last month range  │
└───────────┬───────────┘
            │
            ├─────────────────┬─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Get Contest      │ │ Get Study    │ │ Get Todos    │
│ Results          │ │ Sessions     │ │ Completed    │
│ - Last month     │ │ - Last month │ │ - Last month │
└────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
         │                   │                 │
         └────────────────┬──┴─────────────────┘
                          ▼
              ┌───────────────────────┐
              │ Calculate Statistics  │
              │   - Total contests    │
              │   - Average score     │
              │   - Study time        │
              │   - Tasks completed   │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Generate Report HTML │
              │   - Stats cards       │
              │   - Insights          │
              │   - Next month goals  │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Send Email Report    │
              └───────────┬───────────┘
                          │
                          ▼
                 User receives report
```

## 🗄️ Database Schema

### Firebase Collections

#### 1. contestResults
```javascript
{
  id: "auto-generated",
  userId: "string",
  contestId: "string",
  answers: {
    0: "answer1",
    1: { code: "...", language: "javascript" }
  },
  score: 75,
  totalQuestions: 10,
  timeTaken: 300,
  timeLimit: 600,
  correctAnswers: 7,
  wrongAnswers: 3,
  categoryPerformance: {
    "Data Structures": { correct: 3, total: 4 },
    "Algorithms": { correct: 4, total: 6 }
  },
  timestamp: Timestamp
}
```

#### 2. swotAnalysis
```javascript
{
  id: "auto-generated",
  userId: "string",
  contestId: "string",
  strengths: [
    "Excellent accuracy (>80%)",
    "Strong in Data Structures"
  ],
  weaknesses: [
    "Time management needs improvement",
    "Weak in Dynamic Programming"
  ],
  opportunities: [
    "Eligible for advanced contests",
    "High growth potential in Algorithms"
  ],
  threats: [
    "Declining performance trend"
  ],
  overallScore: 75,
  performanceMetrics: {
    accuracy: 70,
    speed: 50,
    consistency: 85,
    categoryScores: {
      "Data Structures": 75,
      "Algorithms": 66.67
    }
  },
  recommendations: [
    {
      type: "skill-development",
      priority: "high",
      title: "Improve Dynamic Programming",
      description: "...",
      actionItems: ["..."],
      resources: [{...}],
      estimatedTime: "2-3 weeks"
    }
  ],
  timestamp: Timestamp
}
```

#### 3. scrapedJobs
```javascript
{
  id: "auto-generated",
  userId: "string",
  title: "Software Engineer",
  company: "Google",
  location: "Remote",
  description: "Full job description...",
  url: "https://...",
  source: "LinkedIn",
  salary: "$100k-150k",
  postedDate: "2025-11-09",
  employmentType: "Full-time",
  remote: true,
  scrapedAt: Timestamp
}
```

#### 4. todos
```javascript
{
  id: "auto-generated",
  userId: "string",
  title: "Complete project",
  priority: "high",
  completed: false,
  dueDate: Timestamp,
  completedAt: Timestamp | null,
  category: "work",
  createdAt: Timestamp
}
```

#### 5. calendarEvents
```javascript
{
  id: "auto-generated",
  userId: "string",
  title: "Team Meeting",
  date: "2025-11-09",
  startTime: "10:00",
  endTime: "11:00",
  location: "Zoom",
  description: "Weekly sync",
  createdAt: Timestamp
}
```

#### 6. users (additions)
```javascript
{
  // ... existing fields
  dailyEmailEnabled: true,
  monthlySummaryEnabled: true,
  timezone: "America/New_York",
  jobPreferences: {
    role: "Software Engineer",
    location: "Remote",
    experience: "entry-level",
    remoteOnly: true
  }
}
```

## 🔌 API Endpoints

### n8n Webhook URLs

```
POST http://localhost:5678/webhook/job-hunt
Body: {
  userId: string,
  preferences: {
    role: string,
    location: string,
    experience: string
  }
}

POST http://localhost:5678/webhook/daily-email
Body: {
  userId: string,
  email: string
}

POST http://localhost:5678/webhook/monthly-summary
Body: {
  userId: string,
  email: string
}

POST http://localhost:5678/webhook/contest-swot
Body: {
  userId: string,
  contestId: string,
  contestResult: ContestResult
}
```

## 🔐 Authentication Flow

```
SuperApp Request
      │
      ▼
┌─────────────────────┐
│ Check Auth Token    │
│ (Firebase Auth)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Add Headers         │
│ X-Webhook-Secret    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ n8n Validates       │
│ Secret Token        │
└──────────┬──────────┘
           │
           ▼
     Execute Workflow
```

## 🎯 Component Hierarchy

```
App
 │
 ├── ContestSystem
 │    │
 │    ├── ContestTakingInterface
 │    │
 │    └── ContestCompletionWithSWOT
 │         │
 │         ├── Results View
 │         ├── Loading View
 │         └── SWOTAnalysisDisplay
 │              │
 │              ├── SWOT Grid
 │              ├── Performance Metrics
 │              ├── Recommendations
 │              └── Category Performance
 │
 ├── Dashboard
 │    │
 │    ├── Job Board (uses scrapedJobs)
 │    ├── Calendar View
 │    └── Todo List
 │
 └── Settings
      │
      └── Email Preferences
           ├── Daily Email Toggle
           └── Monthly Summary Toggle
```

## 🔄 State Management

```
Context Providers:
├── AuthContext (Firebase Auth)
├── UserContext (User data)
└── NotificationContext (n8n events)

Services:
├── swotAnalysisService
│   ├── generateSWOTAnalysis()
│   ├── getSWOTAnalysis()
│   └── getUserSWOTHistory()
│
└── n8nIntegrationService
    ├── triggerJobHunt()
    ├── triggerDailyEmail()
    ├── triggerMonthlySummary()
    ├── triggerContestSWOT()
    └── checkConnection()
```

## 📡 Event Flow

```
User Action → Service → Firebase/n8n → Response → UI Update

Example: Contest Submission
1. User clicks Submit
2. ContestTakingInterface.handleSubmit()
3. Calculate results locally
4. Save to Firebase (contestResults)
5. swotAnalysisService.generateSWOTAnalysis()
6. n8nIntegrationService.triggerContestSWOT()
7. Display SWOTAnalysisDisplay component
8. User sees personalized insights
```

## 🔧 Configuration Management

```
Environment Variables:
├── .env.local (SuperApp)
│   ├── VITE_N8N_URL
│   ├── VITE_N8N_WEBHOOK_SECRET
│   └── VITE_ENABLE_*
│
└── .env (n8n)
    ├── N8N_BASIC_AUTH_*
    ├── EMAIL_*
    ├── *_API_KEY
    └── FIREBASE_*
```

## 🚀 Deployment Architecture

```
Production Setup:

┌─────────────────────────────────────┐
│      Cloud Infrastructure           │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Vercel     │  │   n8n       │ │
│  │   (Frontend) │  │   (Docker)  │ │
│  │   SuperApp   │  │   Port 5678 │ │
│  └──────┬───────┘  └──────┬──────┘ │
│         │                 │         │
│         └────────┬────────┘         │
│                  │                  │
│         ┌────────▼────────┐         │
│         │   Firebase      │         │
│         │   (Database)    │         │
│         └─────────────────┘         │
└─────────────────────────────────────┘
```

## 📊 Performance Considerations

- **Caching**: User preferences cached locally
- **Batch Processing**: Job scraping in batches of 3
- **Lazy Loading**: SWOT analysis loaded on demand
- **Debouncing**: Webhook triggers debounced
- **Rate Limiting**: API calls rate-limited

## 🔍 Monitoring & Logging

```
Logging Points:
├── Contest submission
├── SWOT analysis generation
├── n8n workflow execution
├── Email delivery status
└── Job scraping results

Metrics to Track:
├── Contest completion rate
├── SWOT analysis accuracy
├── Email open rates
├── Job application conversions
└── System uptime
```

---

This architecture provides a scalable, maintainable system for SWOT analysis and automation workflows.
