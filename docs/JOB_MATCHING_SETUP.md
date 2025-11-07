# Job Matching Feature Setup Guide

## Overview

The Job Matching feature uses AI (Gemini) to intelligently match job postings with your resume, providing detailed insights, match scores, and interview preparation tips.

## Features

- **Multi-Source Job Fetching**: Pulls jobs from Adzuna API (with fallback to mock data)
- **AI-Powered Matching**: Uses Gemini AI to analyze resume-job compatibility
- **Detailed Match Analysis**: 
  - Skills matching (40 points)
  - Experience relevance (30 points)
  - Education match (10 points)
  - Keyword matching (20 points)
- **Interview Prep Tips**: Personalized tips for each matched job
- **Recommendations**: Actionable suggestions to improve your match score

## Setup Instructions

### 1. Get Adzuna API Credentials (Optional but Recommended)

1. Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
2. Sign up for a free account
3. Create a new application
4. Copy your `APP_ID` and `APP_KEY`

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Gemini AI (Required for matching)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
# OR
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Adzuna API (Optional - will use mock data if not provided)
VITE_ADZUNA_APP_ID=your_adzuna_app_id_here
VITE_ADZUNA_APP_KEY=your_adzuna_app_key_here
```

### 3. Create a Resume

Before using Job Match, you need to create a resume:

1. Navigate to **Interview Prep → Resume Builder**
2. Fill in your resume details
3. Save your resume (auto-saved to localStorage)

### 4. Using Job Match

1. Navigate to **Interview Prep → Job Match**
2. Enter job search keywords (e.g., "Software Engineer", "React Developer")
3. Optionally add location filter
4. Set match threshold (minimum match score to display, default: 60%)
5. Click **Search Jobs**
6. Click **Match with Resume** to analyze matches
7. View detailed match analysis by clicking on any job card

## How It Works

### Job Fetching (Client-Side CORS Solution)

The system uses **client-side CORS proxies** to fetch jobs directly from the browser (no server needed):

1. **Primary Source**: Adzuna API (if configured)
   - Fetches real job postings from Adzuna
   - Uses CORS proxy services to bypass browser CORS restrictions
   - Supports filtering by keywords, location, salary, date posted
   - Automatically tries multiple proxy services if one fails
   
2. **Fallback**: Mock data
   - If API credentials not configured or all proxies fail
   - Provides sample jobs for testing

**CORS Proxy Services Used:**
- AllOrigins (primary)
- CORS Proxy (fallback)
- CodeTabs Proxy (fallback)

These are free public services that allow browser-to-API requests.

### AI Matching Process

1. **Resume Analysis**: Extracts skills, experience, education, projects from your resume
2. **Job Analysis**: Analyzes job description for requirements, skills, keywords
3. **AI Matching**: Gemini AI performs intelligent matching:
   - Compares skills (exact and semantic matching)
   - Evaluates experience relevance
   - Checks education requirements
   - Analyzes keyword alignment
4. **Score Calculation**: Weighted scoring system:
   - Skills: 40 points
   - Experience: 30 points
   - Education: 10 points
   - Keywords: 20 points
5. **Insights Generation**: AI provides:
   - Overall fit analysis
   - Strengths and weaknesses
   - Recommendations for improvement
   - Interview preparation tips

## Match Score Interpretation

- **80-100%**: Excellent match - Strong candidate
- **60-79%**: Good match - Competitive candidate
- **40-59%**: Moderate match - May need improvements
- **0-39%**: Weak match - Significant gaps

## Tips for Better Matches

1. **Keep Resume Updated**: Regularly update your resume with new skills and experiences
2. **Use Relevant Keywords**: Include industry-standard terms in your resume
3. **Highlight Achievements**: Quantify your accomplishments with metrics
4. **Match Job Requirements**: Tailor your resume to highlight relevant experience
5. **Review Recommendations**: Follow AI suggestions to improve match scores

## Troubleshooting

### "No resume found" Error

- **Solution**: Create a resume in Resume Builder first
- Resume is auto-saved to localStorage

### "Failed to fetch jobs" Error

- **Check**: Adzuna API credentials in `.env` file
- **CORS Proxy Issues**: If all CORS proxies fail, system falls back to mock data
- **Solution**: 
  - Wait a few minutes and try again (proxies may be temporarily unavailable)
  - Verify your API credentials are correct
  - Check browser console for specific error messages
- **Note**: Mock data is used automatically if API/proxies fail

### Low Match Scores

- **Review**: AI recommendations for each job
- **Improve**: Add missing skills to your resume
- **Adjust**: Lower match threshold to see more results

### API Rate Limits

- Adzuna free tier has rate limits
- If you hit limits, system falls back to mock data
- Consider upgrading Adzuna plan for production use

## Future Enhancements

- [ ] Add more job sources (Indeed, LinkedIn, etc.)
- [ ] Save favorite jobs
- [ ] Email notifications for new matching jobs
- [ ] Resume auto-enhancement based on job requirements
- [ ] Job application tracking
- [ ] Multi-resume support (different resumes for different job types)

## Technical Details

### Files Structure

```
src/
├── services/
│   ├── jobPostingService.ts    # Job fetching from APIs
│   └── jobMatchingService.ts   # AI matching logic
├── components/
│   └── InterviewPrep/
│       └── JobMatch.tsx         # UI component
└── types/
    └── jobMatching.ts          # TypeScript types
```

### API Integration

- **Adzuna API**: REST API for job postings
- **Gemini AI**: Google's Generative AI for intelligent matching
- **Resume Storage**: Uses existing ResumeStorage utility (localStorage + Firebase)

### Performance

- Matching is done client-side for privacy
- Jobs are cached to reduce API calls
- AI matching is optimized with batch processing
- Fallback mechanisms ensure reliability

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Verify environment variables are set correctly
4. Ensure resume is created and saved

---

**Note**: This feature requires a Gemini API key for AI matching. Without it, only basic keyword matching will work.

