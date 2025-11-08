# Job Scraping Setup Guide

## 📦 Overview

This guide covers setting up web scraping for job sites that don't provide APIs. We'll use Puppeteer for dynamic content and Cheerio for static HTML parsing.

---

## 🛠️ Prerequisites

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth cheerio axios
```

---

## 🎯 Scraping Targets

### Tier 1: High Priority (Hyderabad Focus)
1. Naukri.com - Most popular in India
2. LinkedIn Jobs - Professional network
3. Indeed India - Global job board
4. Monster India - Established platform

### Tier 2: Tech Focused
5. Instahyre - Tech jobs
6. Cutshort - Startup jobs
7. Wellfound - Startup ecosystem
8. HasJob - Indian tech community

### Tier 3: Additional Sources
9. Foundit (formerly Monster)
10. TimesJobs
11. Shine.com
12. Freshersworld (for entry-level)

---

## 📝 Implementation

### Step 1: Create Scraper Service

Create `src/services/jobScraperService.ts`:

```typescript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cheerio from 'cheerio';
import axios from 'axios';
import { Job } from './jobHuntService';

puppeteer.use(StealthPlugin());

class JobScraperService {
  
  // Naukri.com Scraper
  async scrapeNaukriJobs(): Promise<Job[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const jobs: Job[] = [];
      const keywords = ['software developer', 'full stack', 'react', 'node js'];
      
      for (const keyword of keywords) {
        const url = `https://www.naukri.com/${keyword.replace(/ /g, '-')}-jobs-in-hyderabad`;
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Wait for job listings to load
        await page.waitForSelector('.jobTuple', { timeout: 10000 }).catch(() => {});
        
        const jobElements = await page.$$('.jobTuple');
        
        for (const element of jobElements.slice(0, 20)) { // Limit to 20 per keyword
          try {
            const title = await element.$eval('.title', el => el.textContent?.trim() || '');
            const company = await element.$eval('.companyInfo', el => el.textContent?.trim() || '');
            const experience = await element.$eval('.expwdth', el => el.textContent?.trim() || '');
            const salary = await element.$eval('.salaryTxt', el => el.textContent?.trim() || '').catch(() => '');
            const location = await element.$eval('.locWdth', el => el.textContent?.trim() || '');
            const description = await element.$eval('.job-description', el => el.textContent?.trim() || '').catch(() => '');
            const url = await element.$eval('.title', el => el.getAttribute('href') || '');
            const skills = await element.$$eval('.tags', tags => 
              tags.map(tag => tag.textContent?.trim() || '').filter(Boolean)
            ).catch(() => []);
            
            jobs.push({
              title,
              company,
              location,
              type: 'full-time',
              description,
              requirements: [],
              salary,
              experience,
              skills,
              url: url.startsWith('http') ? url : `https://www.naukri.com${url}`,
              source: 'Naukri',
              postedDate: new Date(), // Naukri doesn't always show exact date
              scrapedAt: new Date(),
              isRemote: location.toLowerCase().includes('remote'),
              isHyderabad: location.toLowerCase().includes('hyderabad'),
            });
          } catch (error) {
            console.error('Error parsing Naukri job element:', error);
          }
        }
        
        // Wait between keywords to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return jobs;
    } finally {
      await browser.close();
    }
  }
  
  // Indeed India Scraper
  async scrapeIndeedJobs(): Promise<Job[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      const jobs: Job[] = [];
      
      const url = 'https://in.indeed.com/jobs?q=software+developer&l=Hyderabad';
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      await page.waitForSelector('.job_seen_beacon', { timeout: 10000 }).catch(() => {});
      
      const jobElements = await page.$$('.job_seen_beacon');
      
      for (const element of jobElements.slice(0, 30)) {
        try {
          const title = await element.$eval('.jobTitle', el => el.textContent?.trim() || '').catch(() => '');
          const company = await element.$eval('.companyName', el => el.textContent?.trim() || '').catch(() => '');
          const location = await element.$eval('.companyLocation', el => el.textContent?.trim() || '').catch(() => '');
          const description = await element.$eval('.job-snippet', el => el.textContent?.trim() || '').catch(() => '');
          const salary = await element.$eval('.salary-snippet', el => el.textContent?.trim() || '').catch(() => '');
          const url = await element.$eval('.jobTitle a', el => el.getAttribute('href') || '').catch(() => '');
          
          if (title && company) {
            jobs.push({
              title,
              company,
              location,
              type: 'full-time',
              description,
              requirements: [],
              salary,
              skills: [],
              url: url.startsWith('http') ? url : `https://in.indeed.com${url}`,
              source: 'Indeed',
              postedDate: new Date(),
              scrapedAt: new Date(),
              isRemote: location.toLowerCase().includes('remote'),
              isHyderabad: location.toLowerCase().includes('hyderabad'),
            });
          }
        } catch (error) {
          console.error('Error parsing Indeed job:', error);
        }
      }
      
      return jobs;
    } finally {
      await browser.close();
    }
  }
  
  // LinkedIn Jobs (Limited - requires auth for full access)
  async scrapeLinkedInJobs(): Promise<Job[]> {
    // LinkedIn heavily rate-limits and requires authentication
    // Recommended: Use LinkedIn API if available, or RapidAPI's LinkedIn scraper
    
    try {
      const response = await axios.get(
        'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search',
        {
          params: {
            keywords: 'software developer',
            location: 'Hyderabad',
            start: 0
          },
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );
      
      const $ = cheerio.load(response.data);
      const jobs: Job[] = [];
      
      $('.job-search-card').each((i, element) => {
        const title = $(element).find('.base-search-card__title').text().trim();
        const company = $(element).find('.base-search-card__subtitle').text().trim();
        const location = $(element).find('.job-search-card__location').text().trim();
        const url = $(element).find('a').attr('href') || '';
        
        jobs.push({
          title,
          company,
          location,
          type: 'full-time',
          description: '',
          requirements: [],
          skills: [],
          url,
          source: 'LinkedIn',
          postedDate: new Date(),
          scrapedAt: new Date(),
          isRemote: location.toLowerCase().includes('remote'),
          isHyderabad: location.toLowerCase().includes('hyderabad'),
        });
      });
      
      return jobs;
    } catch (error) {
      console.error('Error scraping LinkedIn jobs:', error);
      return [];
    }
  }
  
  // Instahyre Scraper
  async scrapeInstahyreJobs(): Promise<Job[]> {
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      const jobs: Job[] = [];
      
      await page.goto('https://www.instahyre.com/search-jobs/', { waitUntil: 'networkidle2' });
      
      // Instahyre requires login for full access, but we can get some listings
      await page.waitForSelector('.job-card', { timeout: 10000 }).catch(() => {});
      
      const jobCards = await page.$$('.job-card');
      
      for (const card of jobCards.slice(0, 20)) {
        try {
          const title = await card.$eval('.job-title', el => el.textContent?.trim() || '').catch(() => '');
          const company = await card.$eval('.company-name', el => el.textContent?.trim() || '').catch(() => '');
          const location = await card.$eval('.location', el => el.textContent?.trim() || '').catch(() => '');
          const experience = await card.$eval('.experience', el => el.textContent?.trim() || '').catch(() => '');
          const skills = await card.$$eval('.skill-tag', tags => 
            tags.map(tag => tag.textContent?.trim() || '')
          ).catch(() => []);
          const url = await card.$eval('a', el => el.getAttribute('href') || '').catch(() => '');
          
          if (title) {
            jobs.push({
              title,
              company,
              location,
              type: 'full-time',
              description: '',
              requirements: [],
              experience,
              skills,
              url: url.startsWith('http') ? url : `https://www.instahyre.com${url}`,
              source: 'Instahyre',
              postedDate: new Date(),
              scrapedAt: new Date(),
              isRemote: location.toLowerCase().includes('remote'),
              isHyderabad: location.toLowerCase().includes('hyderabad'),
            });
          }
        } catch (error) {
          console.error('Error parsing Instahyre job:', error);
        }
      }
      
      return jobs;
    } finally {
      await browser.close();
    }
  }
  
  // Monster India Scraper
  async scrapeMonsterJobs(): Promise<Job[]> {
    try {
      const response = await axios.get(
        'https://www.monsterindia.com/srp/results',
        {
          params: {
            query: 'software developer',
            locations: 'Hyderabad'
          }
        }
      );
      
      const $ = cheerio.load(response.data);
      const jobs: Job[] = [];
      
      $('.card-body').each((i, element) => {
        const title = $(element).find('.job-tittle').text().trim();
        const company = $(element).find('.company-name').text().trim();
        const location = $(element).find('.location').text().trim();
        const experience = $(element).find('.experience').text().trim();
        const skills = $(element).find('.chips-container span').map((i, el) => 
          $(el).text().trim()
        ).get();
        const url = $(element).find('a').attr('href') || '';
        
        if (title) {
          jobs.push({
            title,
            company,
            location,
            type: 'full-time',
            description: '',
            requirements: [],
            experience,
            skills,
            url: url.startsWith('http') ? url : `https://www.monsterindia.com${url}`,
            source: 'Monster',
            postedDate: new Date(),
            scrapedAt: new Date(),
            isRemote: location.toLowerCase().includes('remote'),
            isHyderabad: location.toLowerCase().includes('hyderabad'),
          });
        }
      });
      
      return jobs;
    } catch (error) {
      console.error('Error scraping Monster jobs:', error);
      return [];
    }
  }
  
  // Run all scrapers
  async scrapeAllSources(): Promise<Job[]> {
    console.log('Starting job scraping from all sources...');
    
    const results = await Promise.allSettled([
      this.scrapeNaukriJobs(),
      this.scrapeIndeedJobs(),
      this.scrapeLinkedInJobs(),
      this.scrapeInstahyreJobs(),
      this.scrapeMonsterJobs(),
    ]);
    
    const allJobs: Job[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
        console.log(`Source ${index + 1}: Found ${result.value.length} jobs`);
      } else {
        console.error(`Source ${index + 1} failed:`, result.reason);
      }
    });
    
    console.log(`Total jobs scraped: ${allJobs.length}`);
    return allJobs;
  }
}

export const jobScraperService = new JobScraperService();
```

---

## ⚙️ Configuration

### Puppeteer Setup for Linux/Docker

If deploying to Linux server or Docker:

```bash
# Install Chrome dependencies
apt-get update && apt-get install -y \
  chromium-browser \
  libgbm-dev \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2
```

### Environment Variables

Add to `.env.local`:

```env
# Scraping Configuration
VITE_SCRAPING_ENABLED=true
VITE_SCRAPING_TIMEOUT=30000
VITE_MAX_CONCURRENT_SCRAPERS=3
VITE_SCRAPER_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

---

## 🔄 Integration with Job Hunt Service

Update `jobHuntService.ts`:

```typescript
import { jobScraperService } from './jobScraperService';

// In JobHuntService class
async aggregateJobsFromAllSources(): Promise<Job[]> {
  console.log('Starting job aggregation from all sources...');
  
  const allJobs: Job[] = [];
  
  // Fetch from free APIs
  const remotiveJobs = await this.fetchRemotiveJobs();
  allJobs.push(...remotiveJobs);
  
  // Fetch from scrapers
  const scrapedJobs = await jobScraperService.scrapeAllSources();
  allJobs.push(...scrapedJobs);
  
  // Fetch from GitHub repos
  const githubJobs = await this.fetchGitHubJobRepos();
  allJobs.push(...githubJobs);
  
  // Remove duplicates based on URL
  const uniqueJobs = this.removeDuplicateJobs(allJobs);
  
  console.log(`Aggregated ${uniqueJobs.length} unique jobs from all sources`);
  return uniqueJobs;
}

private removeDuplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter(job => {
    if (seen.has(job.url)) {
      return false;
    }
    seen.add(job.url);
    return true;
  });
}
```

---

## 🚨 Anti-Bot Detection Bypass

### Use Stealth Plugin

```typescript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
```

### Random User Agents

```typescript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
];

await page.setUserAgent(
  userAgents[Math.floor(Math.random() * userAgents.length)]
);
```

### Rate Limiting

```typescript
// Add delays between requests
await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
```

---

## 🔍 Testing

Test individual scrapers:

```typescript
import { jobScraperService } from './jobScraperService';

// Test Naukri scraper
const naukriJobs = await jobScraperService.scrapeNaukriJobs();
console.log('Naukri jobs:', naukriJobs.length);

// Test all scrapers
const allJobs = await jobScraperService.scrapeAllSources();
console.log('Total jobs:', allJobs.length);
```

---

## 📊 Monitoring

Add logging:

```typescript
class ScraperLogger {
  logScrapingStart(source: string) {
    console.log(`[${new Date().toISOString()}] Starting scraping: ${source}`);
  }
  
  logScrapingSuccess(source: string, count: number) {
    console.log(`[${new Date().toISOString()}] ✓ ${source}: ${count} jobs`);
  }
  
  logScrapingError(source: string, error: any) {
    console.error(`[${new Date().toISOString()}] ✗ ${source}:`, error.message);
  }
}
```

---

## ⚠️ Legal & Ethical Considerations

1. **Respect robots.txt**: Check each site's robots.txt
2. **Rate limiting**: Don't overload servers
3. **Terms of Service**: Review each site's ToS
4. **Personal use**: Keep scraped data for personal/internal use
5. **Attribution**: Credit original job sources
6. **User agents**: Always identify your scraper

---

## 🔧 Troubleshooting

### Issue: Puppeteer fails to launch

```bash
# Install Chrome
npm install puppeteer --ignore-scripts=false
```

### Issue: Selectors not found

- Sites change their HTML structure
- Update selectors by inspecting current HTML
- Add fallbacks and try-catch blocks

### Issue: Rate limited or blocked

- Add more delays
- Rotate user agents
- Use proxy services (optional)
- Reduce concurrent requests

---

**Next:** See [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md) for automation.
