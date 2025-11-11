import axios from "axios";
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

export class ModernJobScraperService {
  private browser: Browser | null = null;
  
  /**
   * Initialize browser for scraping
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * RemoteOK - Full JSON API (No scraping needed!)
   */
  async fetchRemoteOK(query: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    try {
      console.log(`🔍 Fetching from RemoteOK API for: ${query}`);
      
      const response = await axios.get("https://remoteok.com/api", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      const jobs: ScrapedJob[] = [];
      const data = response.data || [];
      
      // First item is metadata, skip it
      const jobList = Array.isArray(data) ? data.slice(1) : [];
      
      for (const job of jobList) {
        if (jobs.length >= maxResults) break;
        
        const positionLower = (job.position || "").toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Filter by query
        if (!positionLower.includes(queryLower)) continue;
        
        jobs.push({
          title: job.position || "Untitled",
          company: job.company || "Unknown Company",
          location: job.location || "Remote",
          type: "full-time",
          description: job.description || "",
          requirements: job.tags || [],
          salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : undefined,
          skills: job.tags || [],
          url: `https://remoteok.com/remote-jobs/${job.id}` || "",
          source: "RemoteOK",
          postedDate: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
          scrapedAt: new Date().toISOString(),
          isRemote: true,
          isHyderabad: false,
        });
      }

      console.log(`✅ RemoteOK: Found ${jobs.length} jobs`);
      return jobs;
    } catch (error: any) {
      console.error("❌ RemoteOK API error:", error.message);
      return [];
    }
  }

  /**
   * Lever - JSON API
   */
  async fetchLever(companies: string[], query: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    try {
      console.log(`🔍 Fetching from Lever API for companies: ${companies.join(", ")}`);
      
      const jobs: ScrapedJob[] = [];
      
      for (const company of companies) {
        if (jobs.length >= maxResults) break;
        
        try {
          const response = await axios.get(`https://api.lever.co/v0/postings/${company}`, {
            params: { mode: "json" },
            timeout: 10000,
          });

          const companyJobs = response.data || [];
          const queryLower = query.toLowerCase();
          
          for (const job of companyJobs) {
            if (jobs.length >= maxResults) break;
            
            const titleLower = (job.text || "").toLowerCase();
            if (!titleLower.includes(queryLower)) continue;
            
            jobs.push({
              title: job.text || "Untitled",
              company: company,
              location: job.categories?.location || job.workplaceType || "Remote",
              type: job.categories?.commitment || "full-time",
              description: job.description || "",
              requirements: job.lists?.map((list: any) => list.content).flat() || [],
              skills: job.categories?.team ? [job.categories.team] : [],
              url: job.hostedUrl || job.applyUrl || "",
              source: "Lever",
              postedDate: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: (job.workplaceType || "").toLowerCase().includes("remote"),
              isHyderabad: (job.categories?.location || "").toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err: any) {
          console.warn(`⚠️ Lever API error for ${company}:`, err.message);
        }
      }

      console.log(`✅ Lever: Found ${jobs.length} jobs`);
      return jobs;
    } catch (error: any) {
      console.error("❌ Lever API error:", error.message);
      return [];
    }
  }

  /**
   * Greenhouse - JSON API
   */
  async fetchGreenhouse(companies: string[], query: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    try {
      console.log(`🔍 Fetching from Greenhouse API for companies: ${companies.join(", ")}`);
      
      const jobs: ScrapedJob[] = [];
      
      for (const company of companies) {
        if (jobs.length >= maxResults) break;
        
        try {
          const response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs`, {
            params: { content: "true" },
            timeout: 10000,
          });

          const companyJobs = response.data.jobs || [];
          const queryLower = query.toLowerCase();
          
          for (const job of companyJobs) {
            if (jobs.length >= maxResults) break;
            
            const titleLower = (job.title || "").toLowerCase();
            if (!titleLower.includes(queryLower)) continue;
            
            jobs.push({
              title: job.title || "Untitled",
              company: company,
              location: job.location?.name || "Remote",
              type: "full-time",
              description: job.content || "",
              requirements: [],
              skills: job.departments?.map((d: any) => d.name) || [],
              url: job.absolute_url || "",
              source: "Greenhouse",
              postedDate: job.updated_at ? new Date(job.updated_at).toISOString() : new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: (job.location?.name || "").toLowerCase().includes("remote"),
              isHyderabad: (job.location?.name || "").toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err: any) {
          console.warn(`⚠️ Greenhouse API error for ${company}:`, err.message);
        }
      }

      console.log(`✅ Greenhouse: Found ${jobs.length} jobs`);
      return jobs;
    } catch (error: any) {
      console.error("❌ Greenhouse API error:", error.message);
      return [];
    }
  }

  /**
   * We Work Remotely - HTML Scraping
   */
  async fetchWeWorkRemotely(query: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping We Work Remotely for: ${query}`);
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
      await page.goto("https://weworkremotely.com/remote-jobs/search", { waitUntil: "domcontentloaded", timeout: 20000 });
      
      // Wait for job listings
      await page.waitForSelector("li.feature", { timeout: 10000 }).catch(() => {});
      
      const jobElements = await page.$$("li.feature");
      
      for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
        try {
          const elem = jobElements[i];
          
          const title = await elem.$eval(".title", el => el.textContent?.trim()).catch(() => "");
          const company = await elem.$eval(".company", el => el.textContent?.trim()).catch(() => "");
          const jobType = await elem.$eval(".region", el => el.textContent?.trim()).catch(() => "");
          const url = await elem.$eval("a", el => el.getAttribute("href")).catch(() => "");
          
          const titleLower = title.toLowerCase();
          const queryLower = query.toLowerCase();
          
          if (!titleLower.includes(queryLower)) continue;
          
          jobs.push({
            title,
            company,
            location: "Remote",
            type: jobType || "full-time",
            description: `${title} at ${company}`,
            requirements: [],
            skills: [],
            url: url.startsWith("http") ? url : `https://weworkremotely.com${url}`,
            source: "We Work Remotely",
            postedDate: new Date().toISOString(),
            scrapedAt: new Date().toISOString(),
            isRemote: true,
            isHyderabad: false,
          });
        } catch (err: any) {
          console.error(`We Work Remotely parsing error [${i}]:`, err.message);
        }
      }

      console.log(`✅ We Work Remotely: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ We Work Remotely scraping error:", error.message);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Wellfound (AngelList) - HTML Scraping
   */
  async fetchWellfound(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    const jobs: ScrapedJob[] = [];

    try {
      console.log(`🔍 Scraping Wellfound for: ${query} in ${location}`);
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
      
      const searchUrl = `https://wellfound.com/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      
      // Wait for job cards
      await page.waitForSelector("[class*='job']", { timeout: 10000 }).catch(() => {});
      
      const jobCards = await page.$$("[class*='JobSearchCard']");
      
      for (let i = 0; i < Math.min(jobCards.length, maxResults); i++) {
        try {
          const card = jobCards[i];
          
          const title = await card.$eval("[class*='title']", el => el.textContent?.trim()).catch(() => "");
          const company = await card.$eval("[class*='company']", el => el.textContent?.trim()).catch(() => "");
          const loc = await card.$eval("[class*='location']", el => el.textContent?.trim()).catch(() => location);
          const salary = await card.$eval("[class*='salary']", el => el.textContent?.trim()).catch(() => undefined);
          const url = await card.$eval("a", el => el.getAttribute("href")).catch(() => "");
          
          if (title && company) {
            jobs.push({
              title,
              company,
              location: loc,
              type: "full-time",
              description: `${title} at ${company}`,
              requirements: [],
              salary,
              skills: [],
              url: url.startsWith("http") ? url : `https://wellfound.com${url}`,
              source: "Wellfound",
              postedDate: new Date().toISOString(),
              scrapedAt: new Date().toISOString(),
              isRemote: loc.toLowerCase().includes("remote"),
              isHyderabad: loc.toLowerCase().includes("hyderabad"),
            });
          }
        } catch (err: any) {
          console.error(`Wellfound parsing error [${i}]:`, err.message);
        }
      }

      console.log(`✅ Wellfound: Found ${jobs.length} jobs`);
    } catch (error: any) {
      console.error("❌ Wellfound scraping error:", error.message);
    } finally {
      await page.close();
    }

    return jobs;
  }

  /**
   * Y Combinator Jobs - JSON Scrape
   */
  async fetchYCombinatorJobs(query: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    try {
      console.log(`🔍 Fetching Y Combinator jobs for: ${query}`);
      
      // YC has a public jobs API endpoint
      const response = await axios.get("https://www.ycombinator.com/jobs/api", {
        timeout: 15000,
      });

      const jobs: ScrapedJob[] = [];
      const data = response.data || [];
      const queryLower = query.toLowerCase();
      
      for (const job of data) {
        if (jobs.length >= maxResults) break;
        
        const titleLower = (job.title || "").toLowerCase();
        if (!titleLower.includes(queryLower)) continue;
        
        jobs.push({
          title: job.title || "Untitled",
          company: job.company_name || "YC Company",
          location: job.location || "Remote",
          type: job.job_type || "full-time",
          description: job.description || "",
          requirements: [],
          salary: job.salary || undefined,
          skills: job.skills || [],
          url: job.url || `https://www.ycombinator.com/jobs/${job.id}`,
          source: "Y Combinator",
          postedDate: job.posted_at ? new Date(job.posted_at).toISOString() : new Date().toISOString(),
          scrapedAt: new Date().toISOString(),
          isRemote: (job.location || "").toLowerCase().includes("remote"),
          isHyderabad: (job.location || "").toLowerCase().includes("hyderabad"),
        });
      }

      console.log(`✅ Y Combinator: Found ${jobs.length} jobs`);
      return jobs;
    } catch (error: any) {
      console.error("❌ Y Combinator API error:", error.message);
      return [];
    }
  }

  /**
   * Fetch from all modern sources
   */
  async fetchAll(query: string, location: string, maxResults: number = 10): Promise<ScrapedJob[]> {
    console.log("🌐 Fetching from modern job sources...");
    
    const maxPerSource = Math.ceil(maxResults / 6);
    
    // Popular tech companies for Lever/Greenhouse
    const techCompanies = ["netflix", "shopify", "stripe", "gitlab", "reddit", "canva"];
    
    const results = await Promise.allSettled([
      this.fetchRemoteOK(query, maxPerSource),
      this.fetchLever(techCompanies, query, maxPerSource),
      this.fetchGreenhouse(techCompanies, query, maxPerSource),
      this.fetchWeWorkRemotely(query, maxPerSource),
      this.fetchWellfound(query, location, maxPerSource),
      this.fetchYCombinatorJobs(query, maxPerSource),
    ]);

    const allJobs: ScrapedJob[] = [];
    
    results.forEach((result, index) => {
      const sourceNames = ["RemoteOK", "Lever", "Greenhouse", "We Work Remotely", "Wellfound", "Y Combinator"];
      if (result.status === "fulfilled") {
        allJobs.push(...result.value);
        console.log(`✅ ${sourceNames[index]}: ${result.value.length} jobs`);
      } else {
        console.error(`❌ ${sourceNames[index]} failed:`, result.reason.message);
      }
    });

    await this.closeBrowser();
    
    console.log(`✅ Total modern source jobs: ${allJobs.length}`);
    return allJobs;
  }
}

export const modernJobScraperService = new ModernJobScraperService();
