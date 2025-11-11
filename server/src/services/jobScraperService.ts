import puppeteer, { Browser, Page } from "puppeteer";

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: string;
  skills: string[];
  url: string;
  source: string;
  postedDate: string;
  scrapedAt: string;
  isRemote: boolean;
  isHyderabad: boolean;
}

export class JobScraperService {
  private browser: Browser | null = null;
  private isInitialized = false;

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.browser) {
      return;
    }

    try {
      console.log("🌐 Initializing Puppeteer browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920,1080",
        ],
      });
      this.isInitialized = true;
      console.log("✅ Puppeteer browser initialized");
    } catch (error: any) {
      console.error("❌ Failed to initialize Puppeteer:", error.message);
      throw error;
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      console.log("🔒 Puppeteer browser closed");
    }
  }

  /**
   * Scrape jobs from LinkedIn
   */
  async scrapeLinkedIn(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    await this.initialize();
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping LinkedIn for: ${query} in ${location}`);
      
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // LinkedIn jobs search URL (no login required for basic search)
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      
      // Wait for job cards to load with multiple possible selectors
      await Promise.race([
        page.waitForSelector(".jobs-search__results-list", { timeout: 8000 }),
        page.waitForSelector(".base-card", { timeout: 8000 }),
        page.waitForSelector("[class*='job']", { timeout: 8000 }),
      ]).catch(() => console.warn("LinkedIn: No job list container found"));

      // Extract job listings with multiple selector fallbacks
      let jobElements = await page.$$(".base-card");
      if (jobElements.length === 0) {
        jobElements = await page.$$("[class*='base-card']");
      }
      if (jobElements.length === 0) {
        jobElements = await page.$$("[class*='job-card']");
      }
      
      console.log(`LinkedIn: Found ${jobElements.length} job elements`);
      
      for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
        try {
          const jobElement = jobElements[i];
          
          // Try multiple selectors for title
          const title = await jobElement.$eval(".base-search-card__title", el => el.textContent?.trim() || "")
            .catch(() => jobElement.$eval("[class*='title']", el => el.textContent?.trim() || ""))
            .catch(() => "");
            
          // Try multiple selectors for company
          const company = await jobElement.$eval(".base-search-card__subtitle", el => el.textContent?.trim() || "")
            .catch(() => jobElement.$eval("[class*='company']", el => el.textContent?.trim() || ""))
            .catch(() => "");
            
          // Try multiple selectors for location
          const loc = await jobElement.$eval(".job-search-card__location", el => el.textContent?.trim() || "")
            .catch(() => jobElement.$eval("[class*='location']", el => el.textContent?.trim() || ""))
            .catch(() => location);
            
          // Get job URL
          const jobUrl = await jobElement.$eval("a", el => el.getAttribute("href") || "").catch(() => "");
          
          if (title && company && jobUrl) {
            jobs.push({
              title,
              company,
              location: loc,
              type: "full-time",
              description: `${title} position at ${company}`,
              requirements: [],
              skills: [],
              url: jobUrl.split("?")[0], // Remove query params
              source: "LinkedIn",
              postedDate: new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: loc.toLowerCase().includes("remote"),
              isHyderabad: loc.toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err: any) {
          console.error(`LinkedIn job parsing error [${i}]:`, err.message);
        }
      }

      console.log(`✅ LinkedIn: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ LinkedIn scraping error:", error.message);
      console.error("   Stack:", error.stack);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Scrape jobs from Glassdoor
   */
  async scrapeGlassdoor(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    await this.initialize();
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping Glassdoor for: ${query} in ${location}`);
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const searchUrl = `https://www.glassdoor.co.in/Job/${encodeURIComponent(location)}-${encodeURIComponent(query)}-jobs-SRCH_IL.0,${location.length}_KO${location.length + 1},${location.length + query.length + 1}.htm`;
      
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      
      // Wait for job listings with multiple selectors
      await Promise.race([
        page.waitForSelector(".JobsList_jobsList__Gy2Vo", { timeout: 8000 }),
        page.waitForSelector(".react-job-listing", { timeout: 8000 }),
        page.waitForSelector("[data-test='jobListing']", { timeout: 8000 }),
        page.waitForSelector("[class*='job']", { timeout: 8000 }),
      ]).catch(() => console.warn("Glassdoor: No job list found"));

      // Extract job listings with multiple selectors
      let jobCards = await page.$$(".react-job-listing");
      if (jobCards.length === 0) jobCards = await page.$$("[data-test='jobListing']");
      if (jobCards.length === 0) jobCards = await page.$$("[class*='JobCard']");
      if (jobCards.length === 0) jobCards = await page.$$("li[class*='job']");
      
      console.log(`Glassdoor: Found ${jobCards.length} job elements`);
      
      for (let i = 0; i < Math.min(jobCards.length, maxResults); i++) {
        try {
          const card = jobCards[i];
          
          const title = await card.$eval("[data-test='job-title']", el => el.textContent?.trim() || "")
            .catch(() => card.$eval(".jobTitle", el => el.textContent?.trim() || ""))
            .catch(() => card.$eval("[class*='jobTitle']", el => el.textContent?.trim() || ""))
            .catch(() => "");
            
          const company = await card.$eval(".EmployerProfile_employerName__Xemli", el => el.textContent?.trim() || "")
            .catch(() => card.$eval(".employer-name", el => el.textContent?.trim() || ""))
            .catch(() => card.$eval("[class*='employer']", el => el.textContent?.trim() || ""))
            .catch(() => "");
            
          const loc = await card.$eval("[data-test='emp-location']", el => el.textContent?.trim() || "")
            .catch(() => card.$eval(".location", el => el.textContent?.trim() || ""))
            .catch(() => card.$eval("[class*='location']", el => el.textContent?.trim() || ""))
            .catch(() => location);
            
          const salary = await card.$eval("[data-test='detailSalary']", el => el.textContent?.trim() || "")
            .catch(() => card.$eval(".salary-estimate", el => el.textContent?.trim() || ""))
            .catch(() => undefined);
          
          // Get job URL
          const jobUrl = await card.$eval("a", el => el.getAttribute("href") || "").catch(() => "");
          const fullUrl = jobUrl.startsWith("http") ? jobUrl : `https://www.glassdoor.co.in${jobUrl}`;
          
          if (title && company && fullUrl) {
            jobs.push({
              title,
              company,
              location: loc || location,
              type: "full-time",
              description: `${title} role at ${company}`,
              requirements: [],
              salary,
              skills: [],
              url: fullUrl,
              source: "Glassdoor",
              postedDate: new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: (loc || "").toLowerCase().includes("remote"),
              isHyderabad: (loc || "").toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err: any) {
          console.error(`Glassdoor job parsing error [${i}]:`, err.message);
        }
      }

      console.log(`✅ Glassdoor: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ Glassdoor scraping error:", error.message);
      console.error("   Stack:", error.stack);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Scrape jobs from Naukri
   */
  async scrapeNaukri(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    await this.initialize();
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping Naukri for: ${query} in ${location}`);
      
      const searchUrl = `https://www.naukri.com/${encodeURIComponent(query)}-jobs-in-${encodeURIComponent(location)}`;
      
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
      await page.waitForSelector(".srp-jobtuple-wrapper, article.jobTuple", { timeout: 10000 }).catch(() => {});

      // Extract job listings
      const jobCards = await page.$$(".srp-jobtuple-wrapper, article.jobTuple").catch(() => []);
      
      for (let i = 0; i < Math.min(jobCards.length, maxResults); i++) {
        try {
          const card = jobCards[i];
          
          const title = await card.$eval(".title, .jobTuple-title", el => el.textContent?.trim() || "").catch(() => "");
          const company = await card.$eval(".comp-name, .companyInfo", el => el.textContent?.trim() || "").catch(() => "");
          const loc = await card.$eval(".location, .locWdth", el => el.textContent?.trim() || "").catch(() => location);
          const exp = await card.$eval(".experience, .expwdth", el => el.textContent?.trim() || "").catch(() => undefined);
          const salary = await card.$eval(".salary, .salaryWdth", el => el.textContent?.trim() || "").catch(() => undefined);
          
          // Get job URL
          const jobUrl = await card.$eval("a.title, a.jobTuple-title", el => el.getAttribute("href") || "").catch(() => "");
          const fullUrl = jobUrl.startsWith("http") ? jobUrl : `https://www.naukri.com${jobUrl}`;
          
          if (title && company) {
            jobs.push({
              title,
              company,
              location: loc || location,
              type: "full-time",
              description: `${title} position at ${company}`,
              requirements: exp ? [exp] : [],
              salary,
              skills: [],
              url: fullUrl,
              source: "Naukri",
              postedDate: new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: (loc || "").toLowerCase().includes("remote"),
              isHyderabad: (loc || "").toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err) {
          console.error("Error parsing Naukri job:", err);
        }
      }

      console.log(`✅ Naukri: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ Naukri scraping error:", error.message);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Scrape jobs from Internshala
   */
  async scrapeInternshala(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    await this.initialize();
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping Internshala for: ${query} in ${location}`);
      
      const searchUrl = `https://internshala.com/jobs/${encodeURIComponent(query.replace(/\s+/g, "-"))}-jobs-in-${encodeURIComponent(location.replace(/\s+/g, "-"))}`;
      
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
      await page.waitForSelector(".individual_internship, .internship_meta", { timeout: 10000 }).catch(() => {});

      // Extract job listings
      const jobCards = await page.$$(".individual_internship").catch(() => []);
      
      for (let i = 0; i < Math.min(jobCards.length, maxResults); i++) {
        try {
          const card = jobCards[i];
          
          const title = await card.$eval(".job-internship-name, .profile", el => el.textContent?.trim() || "").catch(() => "");
          const company = await card.$eval(".company-name, .company_name", el => el.textContent?.trim() || "").catch(() => "");
          const loc = await card.$eval(".location_link, .locations", el => el.textContent?.trim() || "").catch(() => location);
          const stipend = await card.$eval(".stipend, .salary", el => el.textContent?.trim() || "").catch(() => undefined);
          const duration = await card.$eval(".duration, .other_detail_item", el => el.textContent?.trim() || "").catch(() => undefined);
          
          // Get job URL
          const jobUrl = await card.$eval("a", el => el.getAttribute("href") || "").catch(() => "");
          const fullUrl = jobUrl.startsWith("http") ? jobUrl : `https://internshala.com${jobUrl}`;
          
          if (title && company) {
            jobs.push({
              title,
              company,
              location: loc || location,
              type: duration?.includes("month") ? "internship" : "full-time",
              description: `${title} opportunity at ${company}`,
              requirements: duration ? [duration] : [],
              salary: stipend,
              skills: [],
              url: fullUrl,
              source: "Internshala",
              postedDate: new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: (loc || "").toLowerCase().includes("remote") || (loc || "").toLowerCase().includes("work from home"),
              isHyderabad: (loc || "").toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err) {
          console.error("Error parsing Internshala job:", err);
        }
      }

      console.log(`✅ Internshala: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ Internshala scraping error:", error.message);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Scrape jobs from Unstop (formerly Dare2Compete)
   */
  async scrapeUnstop(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    await this.initialize();
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping Unstop for: ${query} in ${location}`);
      
      const searchUrl = `https://unstop.com/jobs?search=${encodeURIComponent(query)}`;
      
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
      await page.waitForSelector(".opportunity-card, .job-card", { timeout: 10000 }).catch(() => {});

      // Extract job listings
      const jobCards = await page.$$(".opportunity-card, .job-card, [class*='JobCard']").catch(() => []);
      
      for (let i = 0; i < Math.min(jobCards.length, maxResults); i++) {
        try {
          const card = jobCards[i];
          
          const title = await card.$eval("h3, .title, [class*='title']", el => el.textContent?.trim() || "").catch(() => "");
          const company = await card.$eval(".company, [class*='company']", el => el.textContent?.trim() || "").catch(() => "");
          const loc = await card.$eval(".location, [class*='location']", el => el.textContent?.trim() || "").catch(() => location);
          const salary = await card.$eval(".salary, .stipend, [class*='salary']", el => el.textContent?.trim() || "").catch(() => undefined);
          
          // Get job URL
          const jobUrl = await card.$eval("a", el => el.getAttribute("href") || "").catch(() => "");
          const fullUrl = jobUrl.startsWith("http") ? jobUrl : `https://unstop.com${jobUrl}`;
          
          if (title && company) {
            jobs.push({
              title,
              company,
              location: loc || location,
              type: "full-time",
              description: `${title} role at ${company}`,
              requirements: [],
              salary,
              skills: [],
              url: fullUrl,
              source: "Unstop",
              postedDate: new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: (loc || "").toLowerCase().includes("remote") || (loc || "").toLowerCase().includes("work from home"),
              isHyderabad: (loc || "").toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err) {
          console.error("Error parsing Unstop job:", err);
        }
      }

      console.log(`✅ Unstop: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ Unstop scraping error:", error.message);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Scrape jobs from all platforms
   */
  async scrapeAll(query: string, location: string, maxResultsPerSite: number = 10): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = [];

    // Run all scrapers in parallel with individual error handling
    const scrapers = [
      this.scrapeLinkedIn(query, location, maxResultsPerSite).catch((err) => {
        console.error("LinkedIn scraper failed:", err.message);
        return [];
      }),
      this.scrapeGlassdoor(query, location, maxResultsPerSite).catch((err) => {
        console.error("Glassdoor scraper failed:", err.message);
        return [];
      }),
      this.scrapeNaukri(query, location, maxResultsPerSite).catch((err) => {
        console.error("Naukri scraper failed:", err.message);
        return [];
      }),
      this.scrapeInternshala(query, location, maxResultsPerSite).catch((err) => {
        console.error("Internshala scraper failed:", err.message);
        return [];
      }),
      this.scrapeUnstop(query, location, maxResultsPerSite).catch((err) => {
        console.error("Unstop scraper failed:", err.message);
        return [];
      }),
    ];

    const results = await Promise.all(scrapers);

    results.forEach((jobs) => {
      allJobs.push(...jobs);
    });

    console.log(`✅ Total scraped jobs: ${allJobs.length}`);

    // Close browser after scraping
    await this.close();

    return allJobs;
  }
}

// Singleton instance
export const jobScraperService = new JobScraperService();
