# JSON Job Import Feature - Quick Guide

## ✅ Feature Added!

You can now import jobs directly from JSON data in the Admin Dashboard!

## 🚀 How to Use

### 1. Go to Admin Dashboard → Job Management Tab

### 2. Scroll to "Import Jobs from JSON" Section

### 3. Paste Your JSON Data

The feature supports your exact format:

```json
[
  {
    "Job Title": "Software Engineer",
    "Company Name": "E - Solutions",
    "Location": "Chennai, Pune, Hyderabad, Bangalore",
    "Source Website": "internshala.com",
    "Application URL": "/job/detail/software-engineer-job-in-multiple-locations-at-e-solutions1757723591",
    "Posted Date": "3 weeks ago",
    "Type": "Full-time"
  },
  {
    "Job Title": "Data Scientist",
    "Company Name": "Tech Corp",
    "Location": "Hyderabad",
    "Source Website": "naukri.com",
    "Application URL": "https://naukri.com/job/12345",
    "Posted Date": "1 week ago",
    "Type": "Full-time"
  }
]
```

### 4. Click "Import Jobs"

- System will validate the JSON
- Transform it to the correct format
- Ask for confirmation
- Save all jobs to Firestore

## 📋 Supported JSON Fields

### Required Fields:
- `Job Title` or `title` - The job title
- `Company Name` or `company` - Company name
- `Location` or `location` - Job location(s)

### Important Fields:
- `Source Website` or `source` - Website domain (e.g., "internshala.com")
- `Application URL` or `url` - Link to apply
- `Posted Date` or `postedDate` - When posted (e.g., "3 weeks ago", "1 month ago")
- `Type` or `type` - Job type (full-time, part-time, contract, etc.)

### Optional Fields:
- `Description` or `description` - Job description
- `Skills` or `skills` - Array of required skills
- `Salary` or `salary` - Salary information
- `Experience` or `experience` - Required experience
- `Requirements` or `requirements` - Job requirements

## 🎯 Smart Features

### 1. Flexible Field Names
Works with both formats:
- `"Job Title"` ✅
- `"title"` ✅
- `"jobTitle"` ✅

### 2. Automatic Date Parsing
Understands natural language dates:
- "3 weeks ago" → Calculates actual date
- "1 month ago" → Calculates actual date
- "5 days ago" → Calculates actual date
- "2024-01-15" → Parses ISO date

### 3. URL Building
Handles both:
- Full URLs: `"https://internshala.com/job/123"` ✅
- Relative paths: `"/job/detail/123"` → Converts to `https://internshala.com/job/detail/123` ✅

### 4. Location Detection
Automatically detects:
- **Hyderabad jobs**: Sets `isHyderabad: true` if location contains "hyderabad"
- **Remote jobs**: Sets `isRemote: true` if location contains "remote"

### 5. Multiple Locations
Handles comma-separated locations:
```json
"Location": "Chennai, Pune, Hyderabad, Bangalore"
```
System will detect Hyderabad in the list!

## 📊 Example JSON Formats

### Format 1: Your Format (Fully Supported)
```json
[
  {
    "Job Title": "Full Stack Developer",
    "Company Name": "Startup Inc",
    "Location": "Hyderabad",
    "Source Website": "wellfound.com",
    "Application URL": "/companies/startup-inc/jobs/123",
    "Posted Date": "2 weeks ago",
    "Type": "Full-time"
  }
]
```

### Format 2: Alternative Field Names (Also Supported)
```json
[
  {
    "title": "Backend Engineer",
    "company": "Tech Solutions",
    "location": "Remote",
    "source": "linkedin.com",
    "url": "https://linkedin.com/jobs/view/123",
    "postedDate": "1 week ago",
    "type": "contract",
    "salary": "$80k - $120k",
    "skills": ["Node.js", "MongoDB", "AWS"]
  }
]
```

### Format 3: Mixed (Works Too!)
```json
[
  {
    "Job Title": "DevOps Engineer",
    "company": "Cloud Corp",
    "Location": "Bangalore, Hyderabad",
    "sourceWebsite": "naukri.com",
    "Application URL": "/job-listings/devops-456",
    "Posted Date": "3 days ago",
    "Type": "Full-time",
    "Experience": "3-5 years"
  }
]
```

## ⚡ Quick Steps

1. **Copy your JSON array**
2. **Paste into textarea**
3. **Click "Import Jobs"**
4. **Confirm**
5. **Done!** Jobs are now in the database

## ✅ What Happens After Import

- Jobs are saved to Firestore `jobListings` collection
- Users can see them in Job Hunt page
- Same format as API-fetched jobs
- Fully searchable and filterable

## 🔍 Validation

The system checks:
- ✅ Valid JSON syntax
- ✅ Required fields present
- ✅ Converts dates properly
- ✅ Builds complete URLs
- ✅ Detects location flags

If anything is wrong, you'll get a clear error message!

## 💡 Tips

1. **Always use array format** `[...]` even for single job
2. **Use double quotes** for JSON keys and values
3. **Escape special characters** in URLs and descriptions
4. **Test with 1-2 jobs first** before importing hundreds

## 🐛 Error Messages

### "Invalid JSON format"
→ Check your JSON syntax (use JSONLint.com to validate)

### "No jobs found in JSON"
→ Make sure you're using an array `[...]`

### "Failed to import jobs"
→ Check console for specific error details

## 📝 Example Workflow

1. **Scrape jobs from Internshala** (your external script)
2. **Get JSON output** in the format above
3. **Copy JSON**
4. **Open Admin Dashboard → Job Management**
5. **Scroll to "Import Jobs from JSON"**
6. **Paste JSON**
7. **Click "Import Jobs"**
8. **✅ Done! Jobs are live**

## 🎉 Benefits

- **Fast**: Import 100s of jobs in seconds
- **Flexible**: Supports multiple field name formats
- **Smart**: Automatically parses dates and locations
- **Safe**: Validates before importing
- **Visible**: All logs in console for debugging

## Need Help?

Check browser console (F12) for detailed logs:
```
📦 Transformed 50 jobs from JSON
✅ Successfully imported 50 job(s)!
```

---

**You're all set!** Just paste your JSON and import! 🚀
