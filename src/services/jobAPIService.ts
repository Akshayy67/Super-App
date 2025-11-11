// Enhanced Job API Service - Integrates multiple job search APIs
import axios from "axios";
import { db } from "../config/firebase";
import { collection, addDoc, Timestamp, query, where, getDocs, limit, deleteDoc, doc, orderBy } from "firebase/firestore";
import type { Job } from "./jobHuntService";

export interface JobSearchParams {
  query?: string;
  location?: string;
  remote?: boolean;
  maxResults?: number;
  experienceLevel?: string;
  jobType?: string;
}

export class JobAPIService {
  private static readonly ADZUNA_API_URL = "https://api.adzuna.com/v1/api/jobs";
  private static readonly ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID || "";
  private static readonly ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY || "";
  
  private static readonly RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "";
  private static readonly SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY || "";

  // RapidAPI Job Search endpoints
  private static readonly RAPIDAPI_ENDPOINTS = {
    jsearch: "https://jsearch.p.rapidapi.com/search",
    linkedinJobs: "https://linkedin-jobs-search.p.rapidapi.com/",
    remoteOk: "https://remote-jobs-api.p.rapidapi.com/jobs",
  };

  /**
   * Fetch jobs from Adzuna API
   */
  static async fetchFromAdzuna(params: JobSearchParams): Promise<Job[]> {
    if (!this.ADZUNA_APP_ID || !this.ADZUNA_APP_KEY) {
      console.warn("Adzuna API credentials not configured");
      return [];
    }

    try {
      const country = "in"; // India
      const what = params.query || "software developer";
      const where = params.location || "hyderabad";
      const maxResults = params.maxResults || 50;

      const url = `${this.ADZUNA_API_URL}/${country}/search/1`;
      const response = await axios.get(url, {
        params: {
          app_id: this.ADZUNA_APP_ID,
          app_key: this.ADZUNA_APP_KEY,
          results_per_page: maxResults,
          what: what,
          where: where,
          content_type: "json",
        },
        timeout: 15000,
      });

      const jobs = response.data.results || [];
      return jobs.map((job: any) => this.transformAdzunaJob(job));
    } catch (error: any) {
      console.error("Adzuna API error:", error);
      return [];
    }
  }

  /**
   * Fetch jobs from RapidAPI - JSearch (Indeed, LinkedIn, Glassdoor aggregator)
   */
  static async fetchFromRapidAPIJSearch(params: JobSearchParams): Promise<Job[]> {
    if (!this.RAPIDAPI_KEY) {
      console.warn("RapidAPI key not configured");
      return [];
    }

    try {
      const query = `${params.query || "software developer"} ${params.location || "hyderabad"}`;
      const response = await axios.get(this.RAPIDAPI_ENDPOINTS.jsearch, {
        params: {
          query: query,
          page: "1",
          num_pages: "1",
          remote_jobs_only: params.remote ? "true" : "false",
        },
        headers: {
          "X-RapidAPI-Key": this.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        timeout: 15000,
      });

      const jobs = response.data.data || [];
      return jobs.slice(0, params.maxResults || 50).map((job: any) => this.transformJSearchJob(job));
    } catch (error: any) {
      console.error("RapidAPI JSearch error:", error);
      return [];
    }
  }

  /**
   * Fetch jobs from SerpAPI (Google Jobs)
   */
  static async fetchFromSerpAPI(params: JobSearchParams): Promise<Job[]> {
    if (!this.SERPAPI_KEY) {
      console.warn("SerpAPI key not configured");
      return [];
    }

    try {
      const query = `${params.query || "software developer"} ${params.location || "hyderabad"}`;
      const response = await axios.get("https://serpapi.com/search", {
        params: {
          engine: "google_jobs",
          q: query,
          api_key: this.SERPAPI_KEY,
          num: params.maxResults || 10,
        },
        timeout: 15000,
      });

      const jobs = response.data.jobs_results || [];
      return jobs.map((job: any) => this.transformSerpAPIJob(job));
    } catch (error: any) {
      console.error("SerpAPI error:", error);
      return [];
    }
  }

  /**
   * Fetch jobs from GitHub Jobs (via third-party APIs)
   */
  static async fetchFromGitHubJobs(params: JobSearchParams): Promise<Job[]> {
    try {
      // GitHub Jobs API was deprecated, but we can use alternatives
      // Option 1: Use Remotive API (remote jobs)
      const response = await axios.get("https://remotive.io/api/remote-jobs", {
        params: {
          search: params.query || "developer",
          limit: params.maxResults || 50,
        },
        timeout: 15000,
      });

      const jobs = response.data.jobs || [];
      return jobs.slice(0, params.maxResults || 50).map((job: any) => this.transformRemotiveJob(job));
    } catch (error: any) {
      console.error("GitHub/Remotive Jobs error:", error);
      return [];
    }
  }

  /**
   * Search all APIs and aggregate results (via backend proxy to avoid CORS)
   */
  static async searchAllAPIs(params: JobSearchParams & { includeScraping?: boolean }): Promise<Job[]> {
    console.log("🔍 Searching all job APIs with params:", params);

    try {
      // Call backend API which will handle all the external API calls and scraping
      const response = await axios.post("http://localhost:3001/api/jobs/search", {
        query: params.query || "software developer",
        location: params.location || "hyderabad",
        remote: params.remote || false,
        maxResults: params.maxResults || 100,
        includeScraping: params.includeScraping !== false, // Default to true
      }, {
        timeout: 60000, // 60 seconds timeout for all APIs + scraping
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to fetch jobs");
      }

      let jobs = response.data.jobs || [];

      // Apply additional filters
      if (params.experienceLevel) {
        jobs = jobs.filter((job: Job) => 
          job.experience?.toLowerCase().includes(params.experienceLevel!.toLowerCase())
        );
      }

      if (params.jobType) {
        jobs = jobs.filter((job: Job) => 
          job.type.toLowerCase() === params.jobType!.toLowerCase()
        );
      }

      // Convert date strings back to Date objects
      jobs = jobs.map((job: any) => ({
        ...job,
        postedDate: new Date(job.postedDate),
        scrapedAt: new Date(job.scrapedAt),
      }));

      console.log(`✅ Found ${jobs.length} jobs from backend API`);
      return jobs.slice(0, params.maxResults || 50);
    } catch (error: any) {
      console.error("Backend job search error:", error);
      
      // If backend is not available, return empty array with helpful message
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.warn("⚠️ Backend server not running. Please start it with: cd server && npm run dev");
      }
      
      return [];
    }
  }

  /**
   * Save job to Firestore
   */
  static async saveJobToFirestore(job: Job): Promise<string> {
    try {
      // Check for duplicates using multiple strategies
      
      // Strategy 1: Check by URL (most reliable if URL exists)
      if (job.url && job.url !== "" && !job.url.includes("/jobs/search/")) {
        const urlQuery = query(
          collection(db, "jobListings"),
          where("url", "==", job.url),
          limit(1)
        );
        const urlDocs = await getDocs(urlQuery);
        if (!urlDocs.empty) {
          console.log(`⏭️ Skipping duplicate (same URL): ${job.title} at ${job.company}`);
          return urlDocs.docs[0].id;
        }
      }
      
      // Strategy 2: Check by title + company combination (catches duplicates with different URLs)
      const titleCompanyQuery = query(
        collection(db, "jobListings"),
        where("title", "==", job.title),
        where("company", "==", job.company),
        limit(1)
      );
      const titleCompanyDocs = await getDocs(titleCompanyQuery);
      if (!titleCompanyDocs.empty) {
        console.log(`⏭️ Skipping duplicate (same title+company): ${job.title} at ${job.company}`);
        return titleCompanyDocs.docs[0].id;
      }

      // Validate and normalize posted date
      let postedDateTimestamp: Timestamp;
      if (job.postedDate instanceof Date && !isNaN(job.postedDate.getTime())) {
        // Valid Date object
        postedDateTimestamp = Timestamp.fromDate(job.postedDate);
      } else if (job.postedDate) {
        // Try to convert to Date if it's something else
        try {
          const dateObj = new Date(job.postedDate);
          if (!isNaN(dateObj.getTime())) {
            postedDateTimestamp = Timestamp.fromDate(dateObj);
          } else {
            console.warn(`⚠️ Invalid posted date for job "${job.title}", using current time`);
            postedDateTimestamp = Timestamp.now();
          }
        } catch {
          console.warn(`⚠️ Could not parse posted date for job "${job.title}", using current time`);
          postedDateTimestamp = Timestamp.now();
        }
      } else {
        // No posted date provided
        postedDateTimestamp = Timestamp.now();
      }

      // Validate and normalize array fields
      const normalizeArray = (arr: any): string[] => {
        if (!arr) return [];
        if (!Array.isArray(arr)) return [];
        // Flatten and convert to strings, filter out nested arrays/objects
        return arr
          .filter(item => typeof item === 'string' || typeof item === 'number')
          .map(item => String(item))
          .filter(item => item.trim().length > 0);
      };

      // Build clean document for Firestore
      const jobDoc = {
        title: String(job.title || "Untitled"),
        company: String(job.company || "Unknown Company"),
        location: String(job.location || ""),
        type: String(job.type || "full-time"),
        description: String(job.description || ""),
        requirements: normalizeArray(job.requirements),
        skills: normalizeArray(job.skills),
        url: String(job.url || ""),
        source: String(job.source || "manual"),
        postedDate: postedDateTimestamp,
        scrapedAt: Timestamp.now(),
        isRemote: Boolean(job.isRemote),
        isHyderabad: Boolean(job.isHyderabad),
        addedBy: "admin",
        // Optional fields - only add if they exist
        ...(job.salary && { salary: String(job.salary) }),
        ...(job.experience && { experience: String(job.experience) }),
        ...(job.companyLogo && { companyLogo: String(job.companyLogo) }),
        ...(job.matchScore && typeof job.matchScore === 'number' && { matchScore: job.matchScore }),
      };

      const docRef = await addDoc(collection(db, "jobListings"), jobDoc);
      
      console.log("✅ Job saved to Firestore:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("❌ Error saving job to Firestore:", error);
      console.error("   Job data:", { title: job.title, company: job.company, url: job.url });
      console.error("   Full error:", error);
      throw new Error("Failed to save job: " + (error.message || error.toString()));
    }
  }

  /**
   * Save multiple jobs to Firestore
   */
  static async saveJobsToFirestore(jobs: Job[]): Promise<{ success: number; failed: number; duplicates: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    let duplicates = 0;
    const errors: string[] = [];
    const existingIds = new Set<string>();

    for (const job of jobs) {
      try {
        const docId = await this.saveJobToFirestore(job);
        if (existingIds.has(docId)) {
          // This was a duplicate
          duplicates++;
        } else {
          existingIds.add(docId);
          success++;
        }
      } catch (error: any) {
        const errorMsg = `${job.title} at ${job.company}: ${error.message}`;
        console.error("❌ Failed to save job:", errorMsg);
        errors.push(errorMsg);
        failed++;
      }
    }

    console.log(`✅ Saved ${success} new jobs, ${duplicates} duplicates skipped, ${failed} failed`);
    if (errors.length > 0) {
      console.error("Failed jobs:", errors);
    }
    return { success, failed, duplicates, errors };
  }

  /**
   * Transform Adzuna job to our Job format
   */
  private static transformAdzunaJob(job: any): Job {
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
      postedDate: job.created ? new Date(job.created) : new Date(),
      scrapedAt: new Date(),
      isRemote: job.location?.display_name?.toLowerCase().includes("remote") || false,
      isHyderabad: job.location?.display_name?.toLowerCase().includes("hyderabad") || false,
    };
  }

  /**
   * Transform JSearch (RapidAPI) job to our Job format
   */
  private static transformJSearchJob(job: any): Job {
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
        ? new Date(job.job_posted_at_datetime_utc) 
        : new Date(),
      scrapedAt: new Date(),
      isRemote: job.job_is_remote === true,
      isHyderabad: job.job_city?.toLowerCase().includes("hyderabad") || false,
      companyLogo: job.employer_logo || undefined,
    };
  }

  /**
   * Transform SerpAPI job to our Job format
   */
  private static transformSerpAPIJob(job: any): Job {
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
        ? new Date(job.detected_extensions.posted_at) 
        : new Date(),
      scrapedAt: new Date(),
      isRemote: job.title?.toLowerCase().includes("remote") || 
                job.description?.toLowerCase().includes("remote") || false,
      isHyderabad: job.location?.toLowerCase().includes("hyderabad") || false,
    };
  }

  /**
   * Transform Remotive job to our Job format
   */
  private static transformRemotiveJob(job: any): Job {
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
      postedDate: job.publication_date ? new Date(job.publication_date) : new Date(),
      scrapedAt: new Date(),
      isRemote: true,
      isHyderabad: false,
      companyLogo: job.company_logo || undefined,
    };
  }

  /**
   * Remove duplicate jobs
   */
  private static removeDuplicates(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = job.url || `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get all jobs from Firestore (for admin management)
   */
  static async getAllJobs(limitCount: number = 500): Promise<Job[]> {
    try {
      const q = query(
        collection(db, "jobListings"),
        orderBy("scrapedAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          postedDate: data.postedDate?.toDate?.() || new Date(data.postedDate),
          scrapedAt: data.scrapedAt?.toDate?.() || new Date(data.scrapedAt),
        } as Job;
      });
    } catch (error: any) {
      console.error("Error getting all jobs:", error);
      throw error;
    }
  }

  /**
   * Delete a job from Firestore
   */
  static async deleteJob(jobId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "jobListings", jobId));
      console.log(`🗑️ Deleted job: ${jobId}`);
    } catch (error: any) {
      console.error("Error deleting job:", error);
      throw new Error("Failed to delete job: " + error.message);
    }
  }

  /**
   * Delete multiple jobs from Firestore
   */
  static async deleteJobs(jobIds: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const jobId of jobIds) {
      try {
        await this.deleteJob(jobId);
        success++;
      } catch (error) {
        console.error(`Failed to delete job ${jobId}:`, error);
        failed++;
      }
    }

    console.log(`🗑️ Deleted ${success} jobs, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Find duplicate jobs in Firestore
   */
  static async findDuplicates(): Promise<{ duplicates: Job[][]; totalDuplicates: number }> {
    try {
      console.log("🔍 Finding duplicates...");
      
      // Get all jobs
      const allJobs = await this.getAllJobs(1000);
      
      // Group by title + company
      const groups = new Map<string, Job[]>();
      
      for (const job of allJobs) {
        const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(job);
      }
      
      // Filter groups with more than 1 job (duplicates)
      const duplicates: Job[][] = [];
      let totalDuplicates = 0;
      
      for (const [key, jobs] of groups.entries()) {
        if (jobs.length > 1) {
          duplicates.push(jobs);
          totalDuplicates += jobs.length - 1; // Count extras (keep 1)
        }
      }
      
      console.log(`Found ${duplicates.length} duplicate groups (${totalDuplicates} extra jobs)`);
      
      // Sort by number of duplicates (descending)
      duplicates.sort((a, b) => b.length - a.length);
      
      return { duplicates, totalDuplicates };
    } catch (error: any) {
      console.error("Error finding duplicates:", error);
      throw error;
    }
  }

  /**
   * Remove all duplicates, keeping only the most recent job in each group
   */
  static async removeDuplicateJobs(): Promise<{ deleted: number; kept: number }> {
    try {
      const { duplicates } = await this.findDuplicates();
      
      let deleted = 0;
      let kept = 0;
      
      for (const group of duplicates) {
        // Sort by scrapedAt (most recent first)
        group.sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());
        
        // Keep the first (most recent), delete the rest
        kept++;
        for (let i = 1; i < group.length; i++) {
          if (group[i].id) {
            await this.deleteJob(group[i].id);
            deleted++;
          }
        }
      }
      
      console.log(`✅ Kept ${kept} jobs, deleted ${deleted} duplicates`);
      return { deleted, kept };
    } catch (error: any) {
      console.error("Error removing duplicates:", error);
      throw error;
    }
  }
}
