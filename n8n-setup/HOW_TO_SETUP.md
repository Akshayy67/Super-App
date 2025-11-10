# 🚀 How to Setup n8n - Simple 5-Step Guide

## What Does `setup-n8n.bat` Do?
This batch file automatically installs n8n on your Windows computer. It's a one-time setup.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Command Prompt or PowerShell

**Option A: Using File Explorer**
1. Open File Explorer
2. Navigate to: `C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp\n8n-setup`
3. Hold `Shift` and `Right-click` in the folder
4. Click **"Open PowerShell window here"** or **"Open in Terminal"**

**Option B: Using Command Prompt**
```bash
cd C:\Users\Akshay\OneDrive\Desktop\newProject\SuperApp\n8n-setup
```

---

### Step 2: Run the Setup Script

**Just double-click the file:**
```
setup-n8n.bat
```

**OR type in terminal:**
```bash
setup-n8n.bat
```

### What Happens When You Run It:
```
====================================
n8n Setup Script for Windows
====================================

Node.js version:
v18.x.x

npm version:
9.x.x

====================================
Installing n8n globally...
====================================
[Installing packages...]

====================================
n8n installed successfully!
====================================

To start n8n, run: n8n start

n8n will be available at: http://localhost:5678
```

**This will take 2-3 minutes** - it's downloading and installing n8n.

---

### Step 3: Configure Environment Variables

Create your `.env` file with your credentials:

```bash
# Copy the example file
copy .env.example .env
```

**OR manually create `.env` file** and add:

```env
# Email for sending daily reports (REQUIRED)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Firebase (REQUIRED)
FIREBASE_PROJECT_ID=super-app-54ae9
FIREBASE_PRIVATE_KEY="your-firebase-private-key-here"
FIREBASE_CLIENT_EMAIL=your-firebase-service-account@email.com

# Optional APIs
RAPIDAPI_KEY=your-rapidapi-key
SERPAPI_KEY=your-serpapi-key
OPENAI_API_KEY=your-openai-key
```

#### How to Get These Values:

**📧 Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy 16-character password
4. Paste into `EMAIL_PASSWORD`

**🔥 Firebase Service Account:**
1. Go to: https://console.firebase.google.com
2. Select project: **super-app-54ae9**
3. Settings ⚙️ → Project Settings
4. Service Accounts tab
5. Click "Generate new private key"
6. Download JSON file
7. Copy values from JSON to `.env`

---

### Step 4: Start n8n

**Double-click:**
```
start-n8n.bat
```

**OR in terminal:**
```bash
start-n8n.bat
```

**OR manually:**
```bash
n8n start
```

### What You'll See:
```
====================================
Starting n8n...
====================================

n8n is starting...

Access n8n at: http://localhost:5678

Press Ctrl+C to stop n8n

Editor is now accessible via:
http://localhost:5678/
```

---

### Step 5: Open n8n in Browser

1. Open your browser
2. Go to: **http://localhost:5678**
3. Create your n8n account (first-time only):
   - Email: your-email@gmail.com
   - Password: your-secure-password
4. Click "Get Started"

---

## ✅ What to Do Next

### Import Workflows

1. In n8n UI, click **"Workflows"** (top left)
2. Click **"Import from File"**
3. Import these files one by one:
   - `workflows/job-hunt-scraper.json`
   - `workflows/daily-email-todos.json`
   - `workflows/monthly-summary.json`

### Add Credentials

1. Click **"Settings"** (bottom left)
2. Click **"Credentials"**
3. Add:
   - **Gmail OAuth2** - for sending emails
   - **HTTP Request** - for Firebase API calls

### Activate Workflows

1. Open each imported workflow
2. Click the toggle switch (top right) to **Activate**
3. Status should change from "Inactive" to "Active"

---

## 🧪 Test That It Works

### Test 1: Check n8n is Running
Open browser: http://localhost:5678
You should see the n8n dashboard.

### Test 2: Manual Workflow Execution
1. Open any workflow
2. Click **"Execute Workflow"** (top right)
3. Should see green checkmarks if successful

### Test 3: Webhook Test (PowerShell)
```powershell
curl.exe -X POST http://localhost:5678/webhook/job-hunt `
  -H "Content-Type: application/json" `
  -d '{\"userId\": \"test\", \"preferences\": {\"role\": \"Developer\"}}'
```

---

## 🛑 How to Stop n8n

In the terminal where n8n is running:
- Press **Ctrl + C**
- Type **Y** to confirm

---

## 🔄 How to Restart n8n

Just run the start script again:
```bash
start-n8n.bat
```

---

## ❌ Troubleshooting

### Error: "Node.js is not installed"
**Solution:** Install Node.js from https://nodejs.org/
- Download the LTS version
- Run installer
- Restart terminal
- Try again

### Error: "n8n is not installed"
**Solution:** Run the setup script first:
```bash
setup-n8n.bat
```

### Error: "Port 5678 is already in use"
**Solution:** Kill the process using that port:
```bash
# Find process
netstat -ano | findstr :5678

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F

# Start n8n again
start-n8n.bat
```

### Error: "Cannot find module"
**Solution:** Reinstall n8n:
```bash
npm uninstall -g n8n
npm install -g n8n
```

### Error: Gmail authentication fails
**Solutions:**
1. Enable 2-Step Verification on Google Account
2. Generate a NEW app password
3. Make sure it's the 16-character password (no spaces)
4. Re-add Gmail credential in n8n

### Workflow execution fails
**Check:**
1. ✅ Credentials are configured correctly
2. ✅ API keys are valid (not expired)
3. ✅ .env file has correct values
4. ✅ Firestore rules allow access
5. ✅ Check execution logs in n8n UI

---

## 📊 What's Running?

When n8n is running, you have:

| Component | Location | Purpose |
|-----------|----------|---------|
| n8n Dashboard | http://localhost:5678 | Visual workflow editor |
| Webhook Endpoint | http://localhost:5678/webhook/[name] | Trigger workflows |
| API Endpoint | http://localhost:5678/api/v1 | n8n REST API |

---

## 🎯 Quick Commands Reference

```bash
# Setup (one-time)
setup-n8n.bat

# Start n8n
start-n8n.bat

# Stop n8n
Ctrl + C

# Check n8n version
n8n --version

# Clear n8n cache
rmdir /s /q %USERPROFILE%\.n8n\cache

# View n8n logs
# Logs appear in the terminal where n8n is running
```

---

## 🆘 Still Having Issues?

1. **Check Node.js version:** `node --version` (should be 18+)
2. **Check npm version:** `npm --version`
3. **Check n8n installed:** `n8n --version`
4. **Check port is free:** `netstat -ano | findstr :5678`
5. **Check .env file exists:** `dir .env`
6. **Read full guide:** `N8N_COMPLETE_SETUP_GUIDE.md`

---

## ✨ You're All Set!

Once n8n is running and workflows are imported:
- ✅ Job scraping works automatically
- ✅ Daily emails can be scheduled
- ✅ SWOT analysis runs after contests
- ✅ Monthly reports can be generated

**Happy Automating! 🚀**
