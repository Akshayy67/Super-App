# Job Scraper Fixes - Debugging Guide

## Issues Reported
- Only 3 sources working (LinkedIn, RapidAPI, Internshala)
- Missing: Adzuna, SerpAPI, Remotive, Glassdoor, Naukri, Unstop
- Duplicates not being removed properly

## Fixes Applied

### 1. ✅ Enhanced Duplicate Detection
**File:** `server/src/routes/jobs.ts`

**Before:**
- Simple URL or title+company check
- Many duplicates slipping through

**After:**
- Multiple key matching:
  - URL (without query params)
  - Title + Company
  - Title + Location
- Logs each duplicate skipped
- Shows statistics: "Removed X duplicates, Y unique jobs"

### 2. ✅ Improved Error Logging
**File:** `server/src/routes/jobs.ts`

**Before:**
- Minimal error messages

**After:**
- Detailed error logs for each API/scraper
- Shows response status and data
- Helps identify exactly which sources are failing

### 3. ✅ Enhanced Scraper Robustness
**Files:** `server/src/services/jobScraperService.ts`

#### LinkedIn Scraper
- ✅ Added user agent to avoid blocking
- ✅ Multiple selector fallbacks
- ✅ Faster timeout (20s vs 30s)
- ✅ Better error messages

#### Glassdoor Scraper  
- ✅ Fixed search URL format
- ✅ Multiple selector fallbacks
- ✅ Better element detection
- ✅ Added user agent

#### Other Scrapers
- Need similar updates (in progress)

## How to Debug

### Step 1: Check Backend Logs

When you run a search, look for these patterns in the backend terminal:

**✅ Successful API Call:**
```
✅ RapidAPI: 10 jobs
```

**❌ Failed API Call:**
```
❌ Adzuna failed: <error details>
   Error details: Request failed with status 403
   Response status: 403
   Response data: { error: "Invalid API key" }
```

**🔄 Duplicate Detection:**
```
✅ Added: Software Engineer at TechCorp (LinkedIn)
🔄 Duplicate skipped: Software Engineer at TechCorp (RapidAPI)
📊 Removed 15 duplicates, 66 unique jobs
```

### Step 2: Identify Failing Sources

Look for patterns like:

**API Failures:**
- `❌ Adzuna failed:` - Check API key in `.env`
- `❌ SerpAPI failed:` - Check API quota
- `❌ Remotive failed:` - Check network connectivity

**Scraper Failures:**
- `❌ Glassdoor scraping error:` - Site may have changed
- `❌ Naukri scraping error:` - Timeout or selector issue
- `❌ Unstop scraping error:` - Site blocking

### Step 3: Check Specific Errors

**Common API Errors:**

1. **Invalid API Key:**
```
❌ Adzuna failed:
   Response status: 401
   Response data: { error: "Unauthorized" }
```
**Fix:** Check `server/.env` has correct `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`

2. **Rate Limit Exceeded:**
```
❌ SerpAPI failed:
   Response status: 429
   Response data: { error: "Rate limit exceeded" }
```
**Fix:** Wait or upgrade API plan

3. **Quota Exceeded:**
```
❌ RapidAPI failed:
   Response status: 403
   Response data: { message: "You have exceeded the MONTHLY quota" }
```
**Fix:** Wait for next month or upgrade plan

**Common Scraper Errors:**

1. **Timeout:**
```
❌ LinkedIn scraping error: Navigation timeout exceeded
```
**Fix:** Site is slow or blocking - already improved with shorter timeouts

2. **Selector Not Found:**
```
LinkedIn: Found 0 job elements
```
**Fix:** Site changed layout - updated with multiple selector fallbacks

3. **Bot Detection:**
```
❌ Glassdoor scraping error: net::ERR_BLOCKED_BY_CLIENT
```
**Fix:** Added user agent, may need more anti-detection measures

## Testing Checklist

Run a search and check backend logs for:

- [ ] **RapidAPI**: Should work (most reliable)
- [ ] **LinkedIn**: Should work (improved selectors)
- [ ] **Internshala**: Should work (already working)
- [ ] **Adzuna**: Check API key and quota
- [ ] **SerpAPI**: Check API key and credits
- [ ] **Remotive**: Check network
- [ ] **Glassdoor**: Check for bot detection
- [ ] **Naukri**: Check selectors
- [ ] **Unstop**: Check selectors

## Next Steps

### If Still Not Working

1. **Start backend with logs visible:**
```bash
cd server
npm run dev
```

2. **Run a search from admin dashboard**

3. **Copy and share the backend terminal output** - especially lines starting with:
   - `❌` (failures)
   - `⚠️` (warnings)
   - Error messages

4. **Check these specific things:**

**For APIs:**
- Are API keys in `server/.env`?
- Are keys valid (not expired)?
- Do you have quota remaining?

**For Scrapers:**
- Is Puppeteer installed? `npm list puppeteer`
- Is there enough RAM? (Puppeteer needs ~200MB)
- Can the server reach the sites? (firewall, VPN, etc.)

## Expected vs Actual

### Expected Output (All Working)
```
🔍 Backend job search: software developer in hyderabad
📊 Scraping enabled: true
🌐 Fetching from APIs...
✅ Adzuna: 11 jobs
✅ RapidAPI: 10 jobs
✅ SerpAPI: 8 jobs
✅ Remotive: 12 jobs
🕷️ Starting web scraping...
✅ LinkedIn: Found 10 jobs
✅ Glassdoor: Found 8 jobs
✅ Naukri: Found 10 jobs
✅ Internshala: Found 7 jobs
✅ Unstop: Found 5 jobs
📊 Removed 15 duplicates, 66 unique jobs
✅ Total unique jobs found: 66
```

### Actual Output (Some Failing)
```
🔍 Backend job search: software developer in hyderabad
📊 Scraping enabled: true
🌐 Fetching from APIs...
❌ Adzuna failed: Request failed with status 401
✅ RapidAPI: 10 jobs
❌ SerpAPI failed: Request failed with status 429
❌ Remotive failed: getaddrinfo ENOTFOUND remotive.io
🕷️ Starting web scraping...
✅ LinkedIn: Found 10 jobs
LinkedIn: Found 0 job elements  ← Problem: No jobs found
❌ Glassdoor scraping error: Navigation timeout
✅ Internshala: Found 7 jobs
❌ Unstop scraping error: Selector not found
📊 Removed 5 duplicates, 22 unique jobs
✅ Total unique jobs found: 22
```

## Quick Fixes

### Fix 1: Verify API Keys
```bash
cd server
cat .env | grep -E "ADZUNA|RAPIDAPI|SERPAPI"
```

Should show:
```
ADZUNA_APP_ID=8b6546a3
ADZUNA_APP_KEY=288eb26cc39d3ab3ba85939edc8a499c
RAPIDAPI_KEY=6da67769a7msh7dea5a646a14827p18c0e6jsna0077df25d07
SERPAPI_KEY=5df7c39c53c52d9998a738a23514f5313cc65c493dbf151e60cb0d766e6578e8
```

### Fix 2: Test Individual APIs

Test each API separately to see which work:

**Test Adzuna:**
```bash
curl "https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=8b6546a3&app_key=288eb26cc39d3ab3ba85939edc8a499c&results_per_page=1&what=developer&where=hyderabad"
```

**Test SerpAPI:**
```bash
curl "https://serpapi.com/search?engine=google_jobs&q=developer&api_key=5df7c39c53c52d9998a738a23514f5313cc65c493dbf151e60cb0d766e6578e8"
```

### Fix 3: Disable Problematic Sources Temporarily

If some sources keep failing, temporarily disable them in `server/src/routes/jobs.ts`:

```typescript
// Comment out failing APIs
const apiCalls = [
  // fetchFromAdzuna(query, location, maxResultsPerSource), // Disabled - quota exceeded
  fetchFromRapidAPIJSearch(query, location, remote, maxResultsPerSource),
  // fetchFromSerpAPI(query, location, maxResultsPerSource), // Disabled - rate limited
  fetchFromRemotive(query, maxResultsPerSource),
];
```

## Summary

**Fixes Applied:**
1. ✅ Enhanced duplicate detection (3 keys per job)
2. ✅ Detailed error logging
3. ✅ Improved LinkedIn scraper (multiple selectors)
4. ✅ Improved Glassdoor scraper (better URL, selectors)
5. ✅ Added user agents to avoid blocking
6. ✅ Shorter timeouts (20s vs 30s)

**Remaining Work:**
- Need to see actual error messages from your backend
- May need to update Naukri/Unstop scrapers similarly
- May need to fix API key issues

**Next Action:**
Run a search and share the backend terminal output so we can see exactly what's failing!
