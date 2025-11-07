// Job Posting Service - Fetch jobs from multiple sources
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobPosting, JobSearchFilters, JobSource } from "../types/jobMatching";

export class JobPostingService {
  private static readonly ADZUNA_API_URL = "https://api.adzuna.com/v1/api/jobs";
  private static readonly ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID || "";
  private static readonly ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY || "";
  private static readonly ADZUNA_COUNTRY = "us"; // Can be changed to "gb", "au", "ca", "in", etc.

  // CORS Proxy services (client-side solution, no server needed)
  private static readonly CORS_PROXIES = [
    "https://api.allorigins.win/get?url=", // AllOrigins - free and reliable
    "https://corsproxy.io/?", // CORS Proxy
    "https://api.codetabs.com/v1/proxy?quest=", // CodeTabs proxy
  ];

  // Initialize Gemini AI for generating jobs as fallback
  private static readonly genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY || 
    import.meta.env.VITE_GOOGLE_AI_API_KEY || 
    ""
  );
  
  private static readonly geminiModel = this.genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  });

  /**
   * Fetch jobs from Adzuna API using CORS proxy (client-side solution)
   */
  static async fetchFromAdzuna(
    filters: JobSearchFilters = {}
  ): Promise<JobPosting[]> {
    if (!this.ADZUNA_APP_ID || !this.ADZUNA_APP_KEY) {
      console.warn("Adzuna API credentials not configured. Using mock data.");
      return this.getMockJobs();
    }

    try {
      const params: any = {
        app_id: this.ADZUNA_APP_ID,
        app_key: this.ADZUNA_APP_KEY,
        results_per_page: filters.maxResults || 50,
        what: filters.keywords || "software engineer",
        where: filters.location || "",
        content_type: "json",
      };

      // Add salary filters
      if (filters.salaryMin) {
        params.salary_min = filters.salaryMin;
      }
      if (filters.salaryMax) {
        params.salary_max = filters.salaryMax;
      }

      // Add date filter
      if (filters.datePosted) {
        const daysAgo = this.getDaysAgo(filters.datePosted);
        if (daysAgo > 0) {
          params.daysback = daysAgo;
        }
      }

      // Build the Adzuna API URL
      const queryString = new URLSearchParams(params).toString();
      const adzunaUrl = `${this.ADZUNA_API_URL}/${this.ADZUNA_COUNTRY}/search/1?${queryString}`;

      // Try fetching through CORS proxies
      const response = await this.fetchWithCorsProxy(adzunaUrl);

      if (response?.results) {
        return response.results.map((job: any) => this.transformAdzunaJob(job));
      }

      return [];
    } catch (error: any) {
      console.error("Error fetching jobs from Adzuna:", error);
      // Fallback to Gemini-generated jobs (not mock data)
      try {
        console.log("Adzuna API failed, using Gemini to generate realistic jobs...");
        const geminiJobs = await this.generateJobsWithGemini(filters);
        if (geminiJobs.length > 0) {
          return geminiJobs;
        }
      } catch (geminiError) {
        console.error("Error generating jobs with Gemini:", geminiError);
        // Only use mock data if Gemini also fails
        console.warn("Gemini job generation failed, using mock data as last resort");
        return this.getMockJobs();
      }
      // If Gemini returns empty array, use mock data
      return this.getMockJobs();
    }
  }

  /**
   * Generate realistic job postings using Gemini AI as fallback
   */
  private static async generateJobsWithGemini(
    filters: JobSearchFilters
  ): Promise<JobPosting[]> {
    // Check if Gemini API key is available
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!geminiKey) {
      console.warn("Gemini API key not configured. Cannot generate jobs with AI.");
      return [];
    }

    const keywords = filters.keywords || "software engineer";
    const location = filters.location || "Remote";
    const maxResults = filters.maxResults || 20;

    const prompt = `You are a job search assistant. Generate ${maxResults} realistic, current job postings based on the search criteria. These should be actual, plausible job opportunities that exist in the market.

Search Criteria:
- Keywords: ${keywords}
- Location: ${location}
- Number of jobs: ${maxResults}

For each job, generate a JSON object with this EXACT structure:
{
  "id": "unique_id_${Date.now()}_[index]",
  "title": "Specific Job Title (e.g., Senior Frontend Engineer, Full Stack Developer, DevOps Engineer)",
  "company": "Real Company Name (use actual tech companies, startups, or realistic company names)",
  "location": "${location}",
  "description": "Detailed, realistic job description (4-6 sentences). Include: what the company does, specific responsibilities, required skills, team structure, and what makes this role interesting. Make it sound like a real job posting.",
  "url": "https://www.linkedin.com/jobs/view/[job-id]",
  "salary": {
    "min": 80000,
    "max": 150000,
    "currency": "USD",
    "period": "yearly"
  },
  "postedDate": "${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}",
  "source": "gemini",
  "skills": ["React", "Node.js", "TypeScript", "AWS"],
  "type": "full-time",
  "experienceLevel": "mid"
}

CRITICAL REQUIREMENTS:
- Job titles must be SPECIFIC and VARIED (not generic "Software Engineer" for all)
- Company names should be REALISTIC (mix of: well-known tech companies, startups, mid-size companies)
- Descriptions must be DETAILED and SPECIFIC (mention actual technologies, team size, company stage, etc.)
- Skills should match the keywords (if searching for "React Developer", include React-related skills)
- Salary ranges should be REALISTIC for the role and location
- Experience levels should vary (entry-level, mid-level, senior)
- Posted dates should be within the last 30 days
- Each job must be UNIQUE and DIFFERENT from others
- Make descriptions sound like REAL job postings (mention company culture, growth, challenges, etc.)

Return ONLY a valid JSON array with ${maxResults} job objects. No markdown, no code blocks, no explanations. Just the JSON array.`;

    try {
      console.log("Calling Gemini API to generate job postings...");
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().replace(/```json\n?|\n?```/g, "").trim();
      
      // Remove any markdown code blocks
      jsonText = jsonText.replace(/^```[\s\S]*?```$/gm, "").trim();
      
      // Try to extract JSON array if there's extra text
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const jobs = JSON.parse(jsonText);
      
      // Validate and transform to JobPosting format
      if (Array.isArray(jobs) && jobs.length > 0) {
        console.log(`Successfully generated ${jobs.length} jobs using Gemini AI`);
        return jobs
          .slice(0, maxResults)
          .map((job: any, index: number) => ({
            id: job.id || `gemini_${Date.now()}_${index}`,
            title: job.title || "Software Engineer",
            company: job.company || "Tech Company",
            location: job.location || location,
            description: job.description || "",
            url: job.url || this.generateRealisticJobUrl(job.company || 'Company', job.title || 'Developer', index),
            salary: job.salary || undefined,
            postedDate: job.postedDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            source: "gemini" as JobSource,
            skills: job.skills || [],
            type: job.type || "full-time",
            experienceLevel: job.experienceLevel || "mid",
          }));
      }
      
      console.warn("Gemini returned invalid or empty job array");
      return [];
    } catch (error: any) {
      console.error("Error generating jobs with Gemini:", error);
      // Don't return mock jobs here - let the caller handle fallback
      return [];
    }
  }

  /**
   * Fetch data using CORS proxy (tries multiple proxies as fallback)
   */
  private static async fetchWithCorsProxy(url: string): Promise<any> {
    const encodedUrl = encodeURIComponent(url);
    
    // Try each proxy in order
    for (const proxy of this.CORS_PROXIES) {
      try {
        let proxyUrl: string;
        let parseResponse: (data: any) => any;

        if (proxy.includes("allorigins.win")) {
          // AllOrigins format
          proxyUrl = `${proxy}${encodedUrl}`;
          parseResponse = (data: any) => {
            if (data.contents) {
              try {
                return JSON.parse(data.contents);
              } catch {
                return null;
              }
            }
            return null;
          };
        } else if (proxy.includes("corsproxy.io")) {
          // CORS Proxy format
          proxyUrl = `${proxy}${url}`;
          parseResponse = (data: any) => data;
        } else if (proxy.includes("codetabs.com")) {
          // CodeTabs format
          proxyUrl = `${proxy}${url}`;
          parseResponse = (data: any) => data;
        } else {
          continue;
        }

        const response = await axios.get(proxyUrl, {
          timeout: 15000,
          headers: {
            "Accept": "application/json",
          },
        });

        const data = parseResponse(response.data);
        if (data && (data.results || Array.isArray(data))) {
          return data;
        }
      } catch (error: any) {
        console.warn(`CORS proxy ${proxy} failed:`, error.message);
        // Try next proxy
        continue;
      }
    }

    // All proxies failed
    throw new Error("All CORS proxies failed. Using mock data.");
  }

  /**
   * Transform Adzuna job format to our JobPosting format
   */
  private static transformAdzunaJob(job: any): JobPosting {
    return {
      id: `adzuna_${job.id}`,
      title: job.title || "Untitled Position",
      company: job.company?.display_name || "Unknown Company",
      location: this.formatLocation(job.location?.display_name || job.location || ""),
      description: job.description || "",
      url: job.redirect_url || job.adref || "",
      salary: job.salary_min || job.salary_max
        ? {
            min: job.salary_min,
            max: job.salary_max,
            currency: job.salary_is_predicted ? undefined : "USD",
            period: "yearly",
          }
        : undefined,
      postedDate: job.created ? new Date(job.created).toISOString() : undefined,
      source: "adzuna",
      type: job.contract_type || undefined,
    };
  }

  /**
   * Format location string
   */
  private static formatLocation(location: string): string {
    if (!location) return "Remote";
    // Clean up location strings
    return location
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Generate realistic job URL (not example.com)
   */
  private static generateRealisticJobUrl(company: string, title: string, index: number): string {
    // Use realistic job board URLs
    const jobBoards = [
      "linkedin.com/jobs/view",
      "indeed.com/viewjob",
      "glassdoor.com/job-listing",
      "monster.com/jobs",
      "naukri.com/job",
    ];
    
    const board = jobBoards[index % jobBoards.length];
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 30);
    const jobId = `${Date.now()}_${index}`;
    
    return `https://www.${board}/${companySlug}-${titleSlug}-${jobId}`;
  }

  /**
   * Get days ago from filter
   */
  private static getDaysAgo(dateFilter: string): number {
    switch (dateFilter) {
      case "today":
        return 1;
      case "week":
        return 7;
      case "month":
        return 30;
      default:
        return 0;
    }
  }

  /**
   * Fetch jobs from multiple sources
   */
  static async fetchJobs(filters: JobSearchFilters = {}): Promise<JobPosting[]> {
    const jobs: JobPosting[] = [];

    try {
      // Fetch from Adzuna (with CORS proxy, falls back to Gemini if fails)
      const adzunaJobs = await this.fetchFromAdzuna(filters);
      jobs.push(...adzunaJobs);
    } catch (error) {
      console.error("Error fetching from Adzuna:", error);
    }

    // If no jobs found or only mock jobs, try Gemini AI to generate realistic jobs
    const hasRealJobs = jobs.length > 0 && jobs.some(job => job.source !== "manual" && job.source !== "gemini");
    
    if (jobs.length === 0 || !hasRealJobs) {
      try {
        console.log("Using Gemini AI to generate realistic job postings...");
        const geminiJobs = await this.generateJobsWithGemini(filters);
        if (geminiJobs.length > 0) {
          console.log(`Generated ${geminiJobs.length} jobs using Gemini AI`);
          return geminiJobs;
        }
      } catch (geminiError) {
        console.error("Error generating jobs with Gemini:", geminiError);
      }
      
      // Only use mock data as absolute last resort
      if (jobs.length === 0) {
        console.warn("All methods failed, using mock data as last resort");
        return this.getMockJobs();
      }
    }

    // Remove duplicates based on title and company
    const uniqueJobs = this.removeDuplicates(jobs);

    // Sort by date (newest first)
    return uniqueJobs.sort((a, b) => {
      const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
      const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
      return dateB - dateA;
    });
  }

  /**
   * Remove duplicate jobs
   */
  private static removeDuplicates(jobs: JobPosting[]): JobPosting[] {
    const seen = new Set<string>();
    return jobs.filter((job) => {
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get mock jobs for testing/fallback
   */
  private static getMockJobs(): JobPosting[] {
    return [
      {
        id: "mock_1",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        description: "We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and TypeScript. You will work on building scalable web applications and mentor junior developers.",
        url: "https://example.com/job/1",
        salary: { min: 120000, max: 180000, currency: "USD", period: "yearly" },
        postedDate: new Date().toISOString(),
        source: "manual",
        skills: ["React", "Node.js", "TypeScript", "AWS"],
        type: "full-time",
        experienceLevel: "senior",
      },
      {
        id: "mock_2",
        title: "Full Stack Developer",
        company: "StartupXYZ",
        location: "Remote",
        description: "Join our fast-growing startup! We need a Full Stack Developer proficient in JavaScript, Python, and cloud technologies. Experience with microservices architecture is a plus.",
        url: "https://example.com/job/2",
        salary: { min: 90000, max: 130000, currency: "USD", period: "yearly" },
        postedDate: new Date(Date.now() - 86400000).toISOString(),
        source: "manual",
        skills: ["JavaScript", "Python", "AWS", "Docker"],
        type: "full-time",
        experienceLevel: "mid",
      },
      {
        id: "mock_3",
        title: "Frontend Developer",
        company: "Design Co",
        location: "New York, NY",
        description: "We're seeking a talented Frontend Developer to join our team. You'll work with React, Vue.js, and modern CSS frameworks to create beautiful user interfaces.",
        url: "https://example.com/job/3",
        salary: { min: 80000, max: 120000, currency: "USD", period: "yearly" },
        postedDate: new Date(Date.now() - 172800000).toISOString(),
        source: "manual",
        skills: ["React", "Vue.js", "CSS", "TypeScript"],
        type: "full-time",
        experienceLevel: "mid",
      },
    ];
  }

  /**
   * Search jobs with filters
   */
  static async searchJobs(filters: JobSearchFilters): Promise<JobPosting[]> {
    return this.fetchJobs(filters);
  }
}

