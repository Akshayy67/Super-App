# 🚀 n8n Complete Setup Guide - Step by Step

## What is n8n?
n8n is an automation tool that runs workflows (like sending emails, scraping jobs, generating reports) without blocking your main app. It runs as a separate service.

## 📋 Prerequisites (Check These First)

### 1. Software Requirements
```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Check if port 5678 is free
netstat -ano | findstr :5678
```

### 2. Accounts You Need
- ✅ Gmail account (for sending emails)
- ✅ Firebase project (you already have this)
- ⚡ RapidAPI account (optional - for job scraping)
- ⚡ OpenAI API key (optional - for AI summaries)

---

## 🎯 Part 1: Install n8n (5 minutes)

### Option A: Windows Quick Install
```bash
# Open PowerShell or Command Prompt
cd C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp\n8n-setup
setup-n8n.bat
```

### Option B: Manual Install (All Platforms)
```bash
# Install n8n globally
npm install -g n8n

# Verify installation
n8n --version
```

---

## 🎯 Part 2: Configure Environment (10 minutes)

### Step 1: Create .env file
```bash
cd C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp\n8n-setup
copy .env.example .env
```

### Step 2: Get Gmail App Password

**Required for email workflows!**

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Create app password:
   - App: Mail
   - Device: Windows Computer
5. Copy the 16-character password
6. Add to `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-here
```

### Step 3: Get Firebase Service Account

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: **super-app-54ae9**
3. Click ⚙️ Settings → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download JSON file
7. Open the JSON and copy values to `.env`:
```env
FIREBASE_PROJECT_ID=super-app-54ae9
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY_HERE]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@super-app-xxxxx.iam.gserviceaccount.com
```

### Step 4: Optional API Keys

**For Job Scraping (Optional):**

#### RapidAPI (100 free requests/month)
1. Sign up: https://rapidapi.com
2. Subscribe to **JSearch API**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
3. Copy API key
4. Add to `.env`:
```env
RAPIDAPI_KEY=your-rapidapi-key-here
```

#### SerpAPI (100 free searches/month)
1. Sign up: https://serpapi.com
2. Copy API key from dashboard
3. Add to `.env`:
```env
SERPAPI_KEY=your-serpapi-key-here
```

**For AI Summaries (Optional):**
1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Add to `.env`:
```env
OPENAI_API_KEY=[your-openai-key-here]
```

### Final .env File Should Look Like:
```env
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# Email Service (REQUIRED)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Firebase (REQUIRED)
FIREBASE_PROJECT_ID=super-app-54ae9
FIREBASE_PRIVATE_KEY="[paste-your-private-key-here]"
FIREBASE_CLIENT_EMAIL=[your-service-account-email-here]

# Job Scraping APIs (OPTIONAL)
RAPIDAPI_KEY=[your-rapidapi-key]
SERPAPI_KEY=[your-serpapi-key]

# AI Features (OPTIONAL)
OPENAI_API_KEY=[your-openai-key]
```

---

## 🎯 Part 3: Start n8n (2 minutes)

### Windows
```bash
cd C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp\n8n-setup
start-n8n.bat
```

### Linux/Mac
```bash
n8n start
```

### What You Should See:
```
Editor is now accessible via:
http://localhost:5678/

Webhook URLs are accessible via:
http://localhost:5678/webhook/
```

**Open your browser:** http://localhost:5678

---

## 🎯 Part 4: First Time n8n Setup (5 minutes)

### Step 1: Create n8n Account
1. Open http://localhost:5678
2. Create owner account:
   - Email: your-email@gmail.com
   - Password: your-secure-password
3. Click **Get Started**

### Step 2: Add Credentials

#### Gmail Credentials
1. Click **Settings** (bottom left) → **Credentials**
2. Click **+ Add Credential**
3. Search for **Gmail OAuth2**
4. Click **Connect**
5. Sign in with Google
6. Grant permissions
7. Name it: `Gmail - SuperApp`
8. Click **Save**

#### Firebase Credentials
1. Click **+ Add Credential**
2. Search for **HTTP Request**
3. Name it: `Firebase Service Account`
4. Authentication: **Generic Credential Type** → **JSON**
5. Add credentials from your downloaded Firebase JSON file
6. Name it: `Firebase Service Account`
6. Click **Save**

---

## 🎯 Part 5: Import Workflows (5 minutes)

### Available Workflows:
1. **Job Hunt Scraper** - Scrapes jobs from 10+ sources
2. **Daily Email Todos** - Sends morning emails with tasks
3. **Monthly Summary** - Generates monthly reports
4. **Contest SWOT** - Analyzes contest performance

### Import Each Workflow:

1. Click **Workflows** (top left)
2. Click **Import from File**
3. Select workflow file:
   ```
   C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp\n8n-setup\workflows\job-hunt-scraper.json
   ```
4. Click **Import**
5. Repeat for all workflows

### Configure Each Workflow:

#### For Job Hunt Scraper:
1. Open the workflow
2. Find **HTTP Request** nodes
3. Click each node
4. Add your **RapidAPI Key** to headers
5. Click **Save**
6. Toggle **Active** (top right)

#### For Daily Email Todos:
1. Open the workflow
2. Find **Gmail** node
3. Select credential: `Gmail - SuperApp`
4. Find **Firebase** nodes
5. Configure Firebase credentials
6. Click **Save**
7. Toggle **Active**

#### For Monthly Summary:
1. Same as Daily Email
2. Configure Gmail + Firebase
3. Click **Save**
4. Toggle **Active**

---

## 🎯 Part 6: Test Workflows (5 minutes)

### Test Job Hunt Scraper

#### Method 1: From n8n UI
1. Open **Job Hunt Scraper** workflow
2. Click **Execute Workflow** (top right)
3. Wait for execution to complete
4. Check results in execution log

#### Method 2: Using Webhook
```bash
# Windows PowerShell
curl.exe -X POST http://localhost:5678/webhook/job-hunt `
  -H "Content-Type: application/json" `
  -d '{\"userId\": \"test-user\", \"preferences\": {\"role\": \"Software Engineer\", \"location\": \"Remote\"}}'

# Linux/Mac
curl -X POST http://localhost:5678/webhook/job-hunt \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "preferences": {"role": "Software Engineer", "location": "Remote"}}'
```

### Test Daily Email
```bash
# Windows PowerShell
curl.exe -X POST http://localhost:5678/webhook/daily-email `
  -H "Content-Type: application/json" `
  -d '{\"userId\": \"test-user\", \"email\": \"your-email@gmail.com\"}'
```

### Test Contest SWOT
1. Take a coding contest in your app
2. Complete it
3. SWOT analysis should automatically trigger
4. Check Firebase for results

---

## 🎯 Part 7: Connect to SuperApp (5 minutes)

### Update SuperApp .env.local
```bash
cd C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp
```

Add to `.env.local`:
```env
# n8n Integration
VITE_N8N_URL=http://localhost:5678
VITE_N8N_WEBHOOK_SECRET=your-webhook-secret-here
VITE_ENABLE_SWOT_ANALYSIS=true
```

### Restart Your SuperApp
```bash
npm run dev
```

### Test Integration:
1. Go to http://localhost:5173
2. Take a coding contest
3. Complete the contest
4. Should see SWOT analysis automatically

---

## 🎯 Part 8: Set Up Automated Schedules (Optional)

### Daily Emails (8 AM every day)
1. Open **Daily Email Todos** workflow
2. Add **Cron** node at start
3. Set schedule: `0 8 * * *` (8 AM daily)
4. Connect to Firebase node (fetch users)
5. Loop through users and send emails
6. **Save** and **Activate**

### Monthly Reports (1st of every month)
1. Open **Monthly Summary** workflow
2. Add **Cron** node: `0 0 1 * *` (1st day of month)
3. Connect to Firebase → Get all users
4. Generate and email reports
5. **Save** and **Activate**

---

## 🎯 Part 9: Monitoring & Troubleshooting

### View Execution Logs
1. Go to http://localhost:5678
2. Click **Executions** (left sidebar)
3. See all workflow runs
4. Click any execution to see details

### Common Issues:

#### n8n won't start - Port in use
```bash
# Find process using port 5678
netstat -ano | findstr :5678

# Kill it
taskkill /PID <PID_NUMBER> /F

# Restart n8n
n8n start
```

#### Gmail authentication fails
1. Re-generate app password
2. Make sure 2-Step Verification is enabled
3. Use the 16-character password without spaces
4. Re-add Gmail credential in n8n

#### Firebase permission denied
1. Check service account JSON is correct
2. Verify Firebase rules allow service account access
3. Go to Firebase Console → Database → Rules
4. Make sure service account email is allowed

#### Workflow execution fails
1. Check **Executions** tab
2. Click failed execution
3. See error message
4. Common fixes:
   - Invalid API key → Re-enter key
   - Rate limit → Wait or upgrade plan
   - Network error → Check internet connection

---

## 🎯 Part 10: Production Deployment (Advanced)

### For Production Server:

#### 1. Use Docker (Recommended)
```bash
cd n8n-setup
docker-compose up -d
```

#### 2. Set Up SSL (HTTPS)
```bash
# Install certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update n8n config
N8N_PROTOCOL=https
N8N_HOST=your-domain.com
```

#### 3. Secure Webhooks
Add authentication to all webhooks:
1. Generate secret: `openssl rand -hex 32`
2. Add to `.env`: `VITE_N8N_WEBHOOK_SECRET=your-secret`
3. In workflow, add **IF** node to check secret
4. Reject unauthorized requests

#### 4. Set Up Monitoring
1. Enable n8n logs: `N8N_LOG_LEVEL=info`
2. Set up Sentry for error tracking
3. Configure email alerts for failures
4. Monitor execution history

---

## 📊 What You Have Now

✅ **Automated Job Scraping** - 10+ job sources
✅ **Daily Task Emails** - Morning emails with calendar + todos
✅ **Monthly Reports** - Comprehensive monthly summaries
✅ **Contest SWOT Analysis** - Automatic after each contest
✅ **Webhook Triggers** - Trigger workflows from your app
✅ **Scheduled Tasks** - Cron-based automation

---

## 🆘 Need Help?

### Check These Resources:
1. **n8n Documentation**: https://docs.n8n.io
2. **Workflow Templates**: https://n8n.io/workflows
3. **Community Forum**: https://community.n8n.io

### Quick Checks:
- ✅ n8n running: http://localhost:5678
- ✅ Workflows active: Toggle switches ON
- ✅ Credentials configured: Settings → Credentials
- ✅ Executions working: Executions tab

### Debug Mode:
```bash
# Start n8n with debug logs
N8N_LOG_LEVEL=debug n8n start
```

---

## 🚀 Next Steps

1. ✅ **Test all workflows** - Make sure they work
2. ✅ **Take a contest** - See SWOT analysis
3. ✅ **Check email** - Daily reports
4. ✅ **Monitor executions** - Watch for errors
5. ✅ **Customize workflows** - Add your own automations

---

## 📝 Workflow Summary

| Workflow | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| Job Hunt Scraper | Webhook/Manual | Scrape jobs from multiple sources | Ready |
| Daily Email Todos | Cron (8 AM) | Send daily tasks & calendar | Ready |
| Monthly Summary | Cron (1st of month) | Monthly activity report | Ready |
| Contest SWOT | Webhook | Analyze contest performance | Ready |

---

**Your n8n setup is complete! 🎉**

All workflows are ready to use. Just activate them and they'll run automatically or on-demand!
