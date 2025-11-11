import express from "express";
import axios from "axios";
import { jobScraperService } from "../services/jobScraperService.js";
import { modernJobScraperService } from "../services/modernJobScraperService.js";

const router = express.Router();

// Job search endpoint - combines API calls and web scraping
router.post("/search", async (req, res) => {
  try {
    const { query = "software developer", location = "hyderabad", remote = false, maxResults = 100, includeScraping = true } = req.body;

    console.log(`🔍 Backend job search: ${query} in ${location}`);
    console.log(`📊 Scraping enabled: ${includeScraping}`);

    const maxResultsPerSource = Math.ceil(maxResults / 9); // 4 APIs + 5 scrapers = 9 sources
    const allJobs: any[] = [];

    // Parallel API calls
    const apiCalls = [
      fetchFromAdzuna(query, location, maxResultsPerSource),
      fetchFromRapidAPIJSearch(query, location, remote, maxResultsPerSource),
      fetchFromSerpAPI(query, location, maxResultsPerSource),
      fetchFromRemotive(query, maxResultsPerSource),
    ];

    console.log("🌐 Fetching from APIs...");
    const apiResults = await Promise.allSettled(apiCalls);

    apiResults.forEach((result, index) => {
      const apiNames = ["Adzuna", "RapidAPI", "SerpAPI", "Remotive"];
      if (result.status === "fulfilled") {
        allJobs.push(...result.value);
        console.log(`✅ ${apiNames[index]}: ${result.value.length} jobs`);
      } else {
        console.error(`❌ ${apiNames[index]} failed:`, result.reason);
        console.error(`   Error details:`, result.reason.message);
        if (result.reason.response) {
          console.error(`   Response status:`, result.reason.response.status);
          console.error(`   Response data:`, result.reason.response.data);
        }
      }
    });

    // Add modern job sources (always enabled - they're reliable)
    console.log("🌐 Fetching from modern job sources (RemoteOK, Lever, Greenhouse, etc.)...");
    try {
      const modernJobs = await modernJobScraperService.fetchAll(query, location, maxResultsPerSource * 2);
      allJobs.push(...modernJobs);
      console.log(`✅ Modern sources completed: ${modernJobs.length} jobs`);
    } catch (modernError: any) {
      console.error("❌ Modern sources failed:", modernError.message);
      // Continue even if modern sources fail
    }

    // Add web scraping if enabled (optional - for traditional job sites)
    if (includeScraping) {
      console.log("🕷️ Starting traditional web scraping (LinkedIn, Internshala, etc.)...");
      try {
        const scrapedJobs = await jobScraperService.scrapeAll(query, location, maxResultsPerSource);
        allJobs.push(...scrapedJobs);
        console.log(`✅ Traditional scraping completed: ${scrapedJobs.length} jobs`);
      } catch (scrapingError: any) {
        console.error("❌ Traditional scraping failed:", scrapingError.message);
        // Continue with API results even if scraping fails
      }
    }

    // Remove duplicates
    const uniqueJobs = removeDuplicates(allJobs);

    console.log(`✅ Total unique jobs found: ${uniqueJobs.length}`);

    res.json({
      success: true,
      count: uniqueJobs.length,
      jobs: uniqueJobs.slice(0, maxResults),
      sources: {
        apis: 4, // Adzuna, RapidAPI, SerpAPI, Remotive
        modernSources: 6, // RemoteOK, Lever, Greenhouse, WeWorkRemotely, Wellfound, YCombinator
        traditionalScrapers: includeScraping ? 5 : 0, // LinkedIn, Glassdoor, Naukri, Internshala, Unstop
        total: includeScraping ? 15 : 10, // Total number of sources
      },
    });
  } catch (error: any) {
    console.error("Job search error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to search jobs",
      jobs: [],
    });
  }
});

// Adzuna API
async function fetchFromAdzuna(query: string, location: string, maxResults: number): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("⚠️ Adzuna API credentials not configured");
    return [];
  }

  try {
    const country = "in"; // India
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;
    
    const response = await axios.get(url, {
      params: {
        app_id: appId,
        app_key: appKey,
        results_per_page: maxResults,
        what: query,
        where: location,
        content_type: "json",
      },
      timeout: 15000,
    });

    const jobs = response.data.results || [];
    return jobs.map((job: any) => transformAdzunaJob(job));
  } catch (error: any) {
    console.error("Adzuna API error:", error.message);
    return [];
  }
}

// RapidAPI JSearch
async function fetchFromRapidAPIJSearch(query: string, location: string, remote: boolean, maxResults: number): Promise<any[]> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn("⚠️ RapidAPI key not configured");
    return [];
  }

  try {
    const searchQuery = `${query} ${location}`;
    const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: {
        query: searchQuery,
        page: "1",
        num_pages: "1",
        remote_jobs_only: remote ? "true" : "false",
      },
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      timeout: 15000,
    });

    const jobs = response.data.data || [];
    return jobs.slice(0, maxResults).map((job: any) => transformJSearchJob(job));
  } catch (error: any) {
    console.error("RapidAPI JSearch error:", error.message);
    return [];
  }
}

// SerpAPI (Google Jobs)
async function fetchFromSerpAPI(query: string, location: string, maxResults: number): Promise<any[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn("⚠️ SerpAPI key not configured");
    return [];
  }

  try {
    const searchQuery = `${query} ${location}`;
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google_jobs",
        q: searchQuery,
        api_key: apiKey,
        num: maxResults,
      },
      timeout: 15000,
    });

    const jobs = response.data.jobs_results || [];
    return jobs.map((job: any) => transformSerpAPIJob(job));
  } catch (error: any) {
    console.error("SerpAPI error:", error.message);
    return [];
  }
}

// Remotive API
async function fetchFromRemotive(query: string, maxResults: number): Promise<any[]> {
  try {
    const response = await axios.get("https://remotive.io/api/remote-jobs", {
      params: {
        search: query,
        limit: maxResults,
      },
      timeout: 15000,
    });

    const jobs = response.data.jobs || [];
    return jobs.slice(0, maxResults).map((job: any) => transformRemotiveJob(job));
  } catch (error: any) {
    console.error("Remotive API error:", error.message);
    return [];
  }
}

// Transform functions
function transformAdzunaJob(job: any) {
  return {
    title: job.title || "Untitled",
    company: job.company?.display_name || "Unknown Company",
    location: job.location?.display_name || "Unknown",
    type: job.contract_type || "full-time",
    description: job.description || "",
    requirements: [],
    salary: job.salary_min && job.salary_max 
      ? `₹${job.salary_min} - ₹${job.salary_max}/year` 
      : undefined,
    skills: job.category?.label ? [job.category.label] : [],
    url: job.redirect_url || "",
    source: "Adzuna",
    postedDate: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
    scrapedAt: new Date().toISOString(),
    isRemote: job.location?.display_name?.toLowerCase().includes("remote") || false,
    isHyderabad: job.location?.display_name?.toLowerCase().includes("hyderabad") || false,
  };
}

function transformJSearchJob(job: any) {
  return {
    title: job.job_title || "Untitled",
    company: job.employer_name || "Unknown Company",
    location: job.job_city && job.job_state 
      ? `${job.job_city}, ${job.job_state}` 
      : job.job_country || "Unknown",
    type: job.job_employment_type?.toLowerCase() || "full-time",
    description: job.job_description || "",
    requirements: job.job_required_skills || [],
    salary: job.job_salary_period && job.job_min_salary && job.job_max_salary
      ? `${job.job_salary_currency || "$"}${job.job_min_salary} - ${job.job_max_salary}/${job.job_salary_period}`
      : undefined,
    experience: job.job_required_experience?.no_experience_required === false
      ? job.job_required_experience?.experience_mentioned || undefined
      : undefined,
    skills: job.job_highlights?.Qualifications || job.job_required_skills || [],
    url: job.job_apply_link || job.job_google_link || "",
    source: "RapidAPI (JSearch)",
    postedDate: job.job_posted_at_datetime_utc 
      ? new Date(job.job_posted_at_datetime_utc).toISOString() 
      : new Date().toISOString(),
    scrapedAt: new Date().toISOString(),
    isRemote: job.job_is_remote === true,
    isHyderabad: job.job_city?.toLowerCase().includes("hyderabad") || false,
    companyLogo: job.employer_logo || undefined,
  };
}

function transformSerpAPIJob(job: any) {
  return {
    title: job.title || "Untitled",
    company: job.company_name || "Unknown Company",
    location: job.location || "Unknown",
    type: "full-time",
    description: job.description || "",
    requirements: job.related_links?.map((link: any) => link.text) || [],
    salary: job.detected_extensions?.salary || undefined,
    skills: [],
    url: job.share_url || job.apply_options?.[0]?.link || "",
    source: "SerpAPI (Google Jobs)",
    postedDate: job.detected_extensions?.posted_at 
      ? new Date(job.detected_extensions.posted_at).toISOString() 
      : new Date().toISOString(),
    scrapedAt: new Date().toISOString(),
    isRemote: job.title?.toLowerCase().includes("remote") || 
              job.description?.toLowerCase().includes("remote") || false,
    isHyderabad: job.location?.toLowerCase().includes("hyderabad") || false,
  };
}

function transformRemotiveJob(job: any) {
  return {
    title: job.title || "Untitled",
    company: job.company_name || "Unknown Company",
    location: "Remote",
    type: job.job_type?.toLowerCase() || "full-time",
    description: job.description || "",
    requirements: [],
    salary: job.salary || undefined,
    skills: job.tags || [],
    url: job.url || "",
    source: "Remotive (Remote Jobs)",
    postedDate: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString(),
    scrapedAt: new Date().toISOString(),
    isRemote: true,
    isHyderabad: false,
    companyLogo: job.company_logo || undefined,
  };
}

function removeDuplicates(jobs: any[]): any[] {
  const seen = new Set<string>();
  const uniqueJobs: any[] = [];
  
  for (const job of jobs) {
    // Create multiple keys for better duplicate detection
    const urlKey = job.url ? job.url.split('?')[0].toLowerCase() : null;
    const titleCompanyKey = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;
    const titleLocationKey = `${job.title.toLowerCase().trim()}_${job.location.toLowerCase().trim()}`;
    
    // Check all keys
    const isDuplicate = 
      (urlKey && seen.has(urlKey)) ||
      seen.has(titleCompanyKey) ||
      seen.has(titleLocationKey);
    
    if (!isDuplicate) {
      // Add all keys to seen set
      if (urlKey) seen.add(urlKey);
      seen.add(titleCompanyKey);
      seen.add(titleLocationKey);
      uniqueJobs.push(job);
      console.log(`✅ Added: ${job.title} at ${job.company} (${job.source})`);
    } else {
      console.log(`🔄 Duplicate skipped: ${job.title} at ${job.company} (${job.source})`);
    }
  }
  
  console.log(`📊 Removed ${jobs.length - uniqueJobs.length} duplicates, ${uniqueJobs.length} unique jobs`);
  return uniqueJobs;
}

export default router;
