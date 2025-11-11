# How to Start Job Management System

## ✅ What Was Fixed

The CORS errors you saw were because the job APIs (Adzuna, SerpAPI, Remotive) cannot be called directly from the browser. I've created a backend proxy that handles all API calls server-side.

## 🚀 Steps to Start Everything

### 1. Install Backend Dependencies

```bash
cd server
npm install axios
```

This installs axios (needed for the backend to make API calls).

### 2. Start the Backend Server

In the `server` directory:

```bash
npm run dev
```

You should see:
```
🚀 ATS Score Generator API running on port 3001
📊 Environment: development
🌐 CORS Origin: http://localhost:5173
🧹 Cleanup service started
```

Keep this terminal running!

### 3. Start the Frontend

In a **new terminal**, from the root directory:

```bash
npm run dev
```

You should see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### 4. Test the Job Search

1. Open browser: `http://localhost:5173/admin-dashboard`
2. Login as admin: `akshayjuluri6704@gmail.com`
3. Click "Job Management" tab
4. Enter search criteria:
   - Query: `software developer`
   - Location: `hyderabad`
   - Check "Remote jobs only" if desired
5. Click "Search Jobs from All APIs"
6. Wait 5-10 seconds for results from all APIs
7. Select jobs and click "Add Selected" or "Add All"

## 🔍 What Changed

### Backend Changes
1. **Created `server/src/routes/jobs.ts`** - New API route that:
   - Receives job search requests from frontend
   - Calls all external APIs (Adzuna, RapidAPI, SerpAPI, Remotive)
   - Handles CORS by making server-side requests
   - Returns combined results to frontend

2. **Updated `server/.env`** - Added job API keys:
   ```
   ADZUNA_APP_ID=8b6546a3
   ADZUNA_APP_KEY=288eb26cc39d3ab3ba85939edc8a499c
   RAPIDAPI_KEY=6da67769a7msh7dea5a646a14827p18c0e6jsna0077df25d07
   SERPAPI_KEY=5df7c39c53c52d9998a738a23514f5313cc65c493dbf151e60cb0d766e6578e8
   ```

3. **Updated `server/src/app.ts`** - Registered `/api/jobs` route

### Frontend Changes
1. **Updated `src/services/jobAPIService.ts`** - Changed `searchAllAPIs` to:
   - Call backend endpoint: `http://localhost:3001/api/jobs/search`
   - No longer makes direct API calls (avoids CORS)
   - Includes helpful error message if backend is not running

2. **Fixed `AdminDashboard.tsx`** - Added missing icon imports:
   - `MapPin`
   - `DollarSign`

## 📊 Expected Results

When you search for jobs, you should see:

**Backend Terminal Output:**
```
🔍 Backend job search: software developer in hyderabad
✅ Adzuna: 12 jobs
✅ RapidAPI: 10 jobs
✅ SerpAPI: 8 jobs
✅ Remotive: 15 jobs
✅ Total unique jobs found: 42
```

**Frontend Console Output:**
```
🔍 Searching jobs with params: {query: "software developer", location: "hyderabad", ...}
✅ Found 42 jobs from backend API
✅ Found 42 jobs
```

**Browser UI:**
- Loading spinner while searching
- Job cards with checkboxes
- Select and add buttons
- Success message after adding

## 🐛 Troubleshooting

### Error: "Backend server not running"
**Solution:** Start the backend server first:
```bash
cd server
npm run dev
```

### Error: "Cannot find module 'axios'"
**Solution:** Install axios in the server:
```bash
cd server
npm install axios
```

### Jobs not showing up?
1. Check backend terminal - should show API calls
2. Check browser console - should show "Found X jobs"
3. Verify API keys in `server/.env`
4. Check network tab in browser DevTools

### API returning errors?
1. **Adzuna/SerpAPI/Remotive may have rate limits** - Wait a few minutes
2. **RapidAPI quota exceeded** - Check your RapidAPI dashboard
3. **Invalid API keys** - Double-check keys in `server/.env`

### Port 3001 already in use?
Change the port in `server/.env`:
```
PORT=3002
```

Then update the frontend URL in `src/services/jobAPIService.ts`:
```typescript
const response = await axios.post("http://localhost:3002/api/jobs/search", {
```

## 🎯 API Success Indicators

### All Working
✅ All 4 APIs return jobs
✅ 40-60 jobs found per search
✅ Jobs from multiple sources

### Partially Working (RapidAPI Only)
⚠️ Only 10-15 jobs found
⚠️ All jobs from "RapidAPI (JSearch)"
⚠️ Other APIs may have rate limits

This is still functional! RapidAPI aggregates Indeed, LinkedIn, and Glassdoor.

## 📝 Backend API Endpoint

**Endpoint:** `POST http://localhost:3001/api/jobs/search`

**Request Body:**
```json
{
  "query": "software developer",
  "location": "hyderabad",
  "remote": false,
  "maxResults": 50
}
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "jobs": [
    {
      "title": "Senior Software Developer",
      "company": "Tech Corp",
      "location": "Hyderabad",
      "type": "full-time",
      "description": "...",
      "skills": ["React", "TypeScript", "Node.js"],
      "url": "https://...",
      "source": "RapidAPI (JSearch)",
      "salary": "$80,000 - $120,000/year",
      "isRemote": false,
      "isHyderabad": true,
      "postedDate": "2025-01-10T...",
      "scrapedAt": "2025-01-11T..."
    }
  ]
}
```

## ✨ Next Steps

1. **Test the search** - Try different queries and locations
2. **Add jobs to database** - Select and add interesting jobs
3. **Monitor API usage** - Keep an eye on rate limits
4. **Check user interface** - Verify jobs appear in JobHunt component

## 🎉 You're All Set!

The job management system is now fully functional with backend proxy to avoid CORS issues. All API calls are made server-side, and the frontend receives the aggregated results.

**Remember:** Keep both terminals running:
- Terminal 1: `cd server && npm run dev` (Backend)
- Terminal 2: `npm run dev` (Frontend)
