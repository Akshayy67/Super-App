# N8N Workflow Setup for Automated Job Scraping

## 🎯 Overview

N8N is a free, self-hostable workflow automation tool that will run our job scraping every 6 hours automatically.

---

## 📦 Installation

### Option 1: NPM (Easiest)

```bash
npm install -g n8n
n8n start
```

Access at: http://localhost:5678

### Option 2: Docker (Recommended for Production)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option 3: Docker Compose (Best for Persistent Setup)

Create `docker-compose.yml`:

```yaml
version: '3.7'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - ~/.n8n:/home/node/.n8n
      - ./n8n-backups:/backups
```

Run:
```bash
docker-compose up -d
```

---

## 🔧 N8N Workflow Configuration

### Step 1: Create New Workflow

1. Open N8N: http://localhost:5678
2. Click "Create New Workflow"
3. Name it: "Job Hunt - 6 Hour Scraper"

### Step 2: Add Schedule Trigger

1. Add node: **Schedule Trigger**
2. Configure:
   - **Mode**: Interval
   - **Interval**: 6 hours
   - **Start**: Immediately

### Step 3: Add HTTP Request Nodes

#### Node 1: Trigger Job Aggregation

1. Add node: **HTTP Request**
2. Configure:
   - **Method**: POST
   - **URL**: `https://your-app.vercel.app/api/jobs/aggregate`
   - **Authentication**: None (or Bearer Token if secured)
   - **Headers**:
     ```json
     {
       "Content-Type": "application/json",
       "X-API-Key": "your_api_key"
     }
     ```

#### Node 2: Wait for Completion

1. Add node: **Wait**
2. Configure:
   - **Time**: 5 minutes
   - **Keep only most recent**: true

#### Node 3: Verify Job Count

1. Add node: **HTTP Request**
2. Configure:
   - **Method**: GET
   - **URL**: `https://your-app.vercel.app/api/jobs/count`

### Step 4: Add Conditional Logic

1. Add node: **IF**
2. Configure:
   - **Condition**: Number
   - **Value 1**: `{{$json["count"]}}`
   - **Operation**: Greater than
   - **Value 2**: 50

### Step 5: Send Notifications (True Branch)

1. Add node: **Send Email** (optional)
2. Or add: **Discord/Slack** webhook
3. Configure success message:
   ```
   Job Hunt Update: Successfully scraped {{$json["count"]}} jobs!
   ```

### Step 6: Send Alert (False Branch)

1. Add node: **Send Email**
2. Configure alert message:
   ```
   Job Hunt Warning: Only {{$json["count"]}} jobs found. Check scraper status.
   ```

---

## 📋 Complete Workflow JSON

Save this as `job-hunt-workflow.json`:

```json
{
  "name": "Job Hunt - 6 Hour Scraper",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 6
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://your-app.vercel.app/api/jobs/aggregate",
        "options": {
          "timeout": 300000
        }
      },
      "name": "Trigger Job Aggregation",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "amount": 300,
        "unit": "seconds"
      },
      "name": "Wait for Completion",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://your-app.vercel.app/api/jobs/count"
      },
      "name": "Check Job Count",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [850, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json[\"count\"]}}",
              "operation": "larger",
              "value2": 50
            }
          ]
        }
      },
      "name": "Success Check",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Trigger Job Aggregation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Trigger Job Aggregation": {
      "main": [
        [
          {
            "node": "Wait for Completion",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait for Completion": {
      "main": [
        [
          {
            "node": "Check Job Count",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Job Count": {
      "main": [
        [
          {
            "node": "Success Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "tags": []
}
```

Import this in N8N: **Settings → Import from File**

---

## 🔌 Alternative: Firebase Functions Scheduled Job

If you don't want to run N8N, use Firebase Functions:

Create `functions/src/scheduledJobScraper.ts`:

```typescript
import * as functions from 'firebase-functions';
import { jobHuntService } from '../../src/services/jobHuntService';
import { jobScraperService } from '../../src/services/jobScraperService';

export const scheduledJobAggregation = functions
  .region('asia-south1') // Mumbai region for India
  .pubsub
  .schedule('every 6 hours')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Starting scheduled job aggregation...');
    
    try {
      // Aggregate from all sources
      const jobs = await jobHuntService.aggregateJobsFromAllSources();
      
      // Save to Firestore
      await jobHuntService.saveJobsToDatabase(jobs);
      
      console.log(`Successfully aggregated ${jobs.length} jobs`);
      return { success: true, count: jobs.length };
    } catch (error) {
      console.error('Job aggregation failed:', error);
      throw error;
    }
  });
```

Deploy:
```bash
cd functions
npm run deploy
```

---

## 🎨 Alternative: GitHub Actions (Free)

Create `.github/workflows/job-scraper.yml`:

```yaml
name: Job Scraper

on:
  schedule:
    # Runs every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  scrape-jobs:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          npm install puppeteer
      
      - name: Run job scraper
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          ADZUNA_API_KEY: ${{ secrets.ADZUNA_API_KEY }}
          ADZUNA_APP_ID: ${{ secrets.ADZUNA_APP_ID }}
        run: |
          node scripts/scrapeJobs.js
      
      - name: Notify completion
        if: success()
        run: echo "Job scraping completed successfully"
```

Create `scripts/scrapeJobs.js`:

```javascript
const { jobHuntService } = require('../src/services/jobHuntService');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  )
});

async function main() {
  console.log('Starting job aggregation...');
  
  const jobs = await jobHuntService.aggregateJobsFromAllSources();
  await jobHuntService.saveJobsToDatabase(jobs);
  
  console.log(`✓ Scraped ${jobs.length} jobs`);
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## 📊 Monitoring & Logging

### Add Logging to N8N Workflow

1. Add node: **Function**
2. Code:
```javascript
const timestamp = new Date().toISOString();
const jobCount = $input.item.json.count || 0;

// Log to console
console.log(`[${timestamp}] Job scraping completed: ${jobCount} jobs`);

// Return data for next node
return {
  json: {
    timestamp,
    jobCount,
    status: jobCount > 50 ? 'success' : 'warning'
  }
};
```

### Send to Discord

1. Create Discord Webhook
2. Add node: **HTTP Request**
3. Configure:
   - **Method**: POST
   - **URL**: Your Discord webhook URL
   - **Body**:
```json
{
  "content": "Job Hunt Update",
  "embeds": [{
    "title": "Job Scraping Completed",
    "description": "Successfully scraped {{$json[\"jobCount\"]}} jobs",
    "color": 3066993,
    "timestamp": "{{$json[\"timestamp\"]}}"
  }]
}
```

---

## 🚀 Deployment

### Deploy N8N to Cloud

#### Heroku:
```bash
git clone https://github.com/n8n-io/n8n.git
cd n8n
heroku create your-n8n-app
git push heroku master
```

#### DigitalOcean:
Use 1-Click N8N Droplet: https://marketplace.digitalocean.com/apps/n8n

#### Railway:
1. Go to https://railway.app
2. New Project → Deploy N8N
3. Add environment variables

---

## 🔐 Security

### Secure N8N Access

Add to environment:
```bash
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=secure_password_here
```

### Secure Webhook Endpoints

Add API key validation:
```typescript
// In your API endpoint
if (req.headers['x-api-key'] !== process.env.N8N_WEBHOOK_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## 🧪 Testing

### Test Workflow Manually

1. In N8N, click "Execute Workflow"
2. Check each node's output
3. Verify job count increases in Firebase

### Test Schedule

```bash
# Check N8N logs
docker logs -f n8n

# Or if using npm
cat ~/.n8n/logs/n8n.log
```

---

## 📈 Next Steps

1. Set up monitoring dashboard
2. Configure error alerts
3. Add more job sources
4. Optimize scraping performance
5. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Recommended Setup**: Firebase Functions (easiest) or GitHub Actions (free).
**N8N**: Best for complex workflows with multiple integrations.
