import axios from 'axios';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

// Job Sources Configuration
const JOB_SOURCES = {
  // Free APIs
  REMOTIVE: 'https://remotive.io/api/remote-jobs',
  ADZUNA: 'https://api.adzuna.com/v1/api/jobs', // Requires free API key
  GITHUB_JOBS: 'https://jobs.github.com/positions.json', // Deprecated but still works
  REED: 'https://www.reed.co.uk/api/1.0/search', // UK based, requires API key
  
  // RSS/Atom Feeds (can be parsed)
  STACKOVERFLOW: 'https://stackoverflow.com/jobs/feed',
  ANGELLIST: 'https://angel.co/jobs',
  
  // Scraping targets (use Puppeteer/Cheerio)
  NAUKRI: 'https://www.naukri.com/jobs-in-hyderabad',
  LINKEDIN: 'https://www.linkedin.com/jobs/search',
  INDEED: 'https://in.indeed.com/jobs',
  MONSTER: 'https://www.monsterindia.com/jobs-in-hyderabad',
  FOUNDIT: 'https://www.foundit.in/jobs-in-hyderabad',
  INSTAHYRE: 'https://www.instahyre.com/search-jobs/',
  WELLFOUND: 'https://wellfound.com/jobs',
  CUTSHORT: 'https://cutshort.io/jobs',
  HASJOB: 'https://hasjob.co/',
  
  // Tech specific
  REACTJOBS: 'https://www.react-jobs.com/remote',
  PYTHONJOBS: 'https://www.python.org/jobs/',
};

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string; // full-time, part-time, contract, remote
  description: string;
  requirements: string[];
  salary?: string;
  experience?: string;
  skills: string[];
  url: string;
  source: string;
  postedDate: Date;
  scrapedAt: Date;
  isRemote: boolean;
  isHyderabad: boolean;
  applicationDeadline?: Date;
  companyLogo?: string;
  matchScore?: number; // For job matching feature
}

export interface JobFilter {
  location?: string[];
  type?: string[];
  skills?: string[];
  experience?: string;
  minSalary?: number;
  remote?: boolean;
  postedWithin?: number; // days
}

class JobHuntService {
  private jobsCollection = 'jobListings';
  private userJobPreferencesCollection = 'userJobPreferences';
  
  // Fetch jobs from Remotive (Remote jobs API)
  async fetchRemotiveJobs(): Promise<Job[]> {
    try {
      const response = await axios.get(JOB_SOURCES.REMOTIVE);
      const jobs = response.data.jobs || [];
      
      return jobs.map((job: any) => ({
        title: job.title,
        company: job.company_name,
        location: 'Remote',
        type: job.job_type || 'full-time',
        description: job.description,
        requirements: [],
        salary: job.salary || '',
        skills: job.tags || [],
        url: job.url,
        source: 'Remotive',
        postedDate: new Date(job.publication_date),
        scrapedAt: new Date(),
        isRemote: true,
        isHyderabad: false,
      }));
    } catch (error) {
      console.error('Error fetching Remotive jobs:', error);
      return [];
    }
  }

  // Fetch jobs from Adzuna API
  async fetchAdzunaJobs(apiKey: string, appId: string): Promise<Job[]> {
    try {
      const locations = ['hyderabad', 'india remote'];
      const allJobs: Job[] = [];

      for (const location of locations) {
        const response = await axios.get(
          `${JOB_SOURCES.ADZUNA}/in/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=50&what=software developer&where=${location}`
        );
        
        const jobs = response.data.results || [];
        const mappedJobs = jobs.map((job: any) => ({
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          type: job.contract_type || 'full-time',
          description: job.description,
          requirements: [],
          salary: job.salary_min && job.salary_max 
            ? `₹${job.salary_min} - ₹${job.salary_max}` 
            : '',
          skills: job.category?.tag ? [job.category.tag] : [],
          url: job.redirect_url,
          source: 'Adzuna',
          postedDate: new Date(job.created),
          scrapedAt: new Date(),
          isRemote: location.includes('remote'),
          isHyderabad: location.includes('hyderabad'),
        }));
        
        allJobs.push(...mappedJobs);
      }

      return allJobs;
    } catch (error) {
      console.error('Error fetching Adzuna jobs:', error);
      return [];
    }
  }

  // Scrape GitHub repos for job aggregators
  async fetchGitHubJobRepos(): Promise<Job[]> {
    try {
      // Example: Fetch from awesome-remote-job lists or job posting repos
      const repos = [
        'https://raw.githubusercontent.com/remoteintech/remote-jobs/main/company-profiles',
        // Add more GitHub-based job lists
      ];
      
      const jobs: Job[] = [];
      // Implementation would parse JSON/markdown files from these repos
      return jobs;
    } catch (error) {
      console.error('Error fetching GitHub job repos:', error);
      return [];
    }
  }

  // RSS Feed Parser (for Stack Overflow, etc.)
  async fetchRSSJobs(feedUrl: string, sourceName: string): Promise<Job[]> {
    try {
      // Use rss-parser or similar
      // This is a placeholder - would need actual RSS parsing
      return [];
    } catch (error) {
      console.error(`Error fetching RSS jobs from ${sourceName}:`, error);
      return [];
    }
  }

  // Aggregate all jobs from multiple sources
  async aggregateJobsFromAllSources(): Promise<Job[]> {
    console.log('Starting job aggregation from all sources...');
    
    const allJobs: Job[] = [];
    
    // Fetch from free APIs
    const remotiveJobs = await this.fetchRemotiveJobs();
    allJobs.push(...remotiveJobs);
    
    // Note: Adzuna requires API keys - would need to be configured
    // const adzunaJobs = await this.fetchAdzunaJobs(apiKey, appId);
    // allJobs.push(...adzunaJobs);
    
    // Fetch from GitHub repos
    const githubJobs = await this.fetchGitHubJobRepos();
    allJobs.push(...githubJobs);
    
    console.log(`Aggregated ${allJobs.length} jobs from all sources`);
    return allJobs;
  }

  // Save jobs to Firestore
  async saveJobsToDatabase(jobs: Job[]): Promise<void> {
    try {
      const batch = [];
      
      for (const job of jobs) {
        // Check if job already exists (based on URL)
        const existingQuery = query(
          collection(db, this.jobsCollection),
          where('url', '==', job.url),
          limit(1)
        );
        
        const existingDocs = await getDocs(existingQuery);
        
        if (existingDocs.empty) {
          // Add new job
          const docRef = await addDoc(collection(db, this.jobsCollection), {
            ...job,
            postedDate: Timestamp.fromDate(job.postedDate),
            scrapedAt: Timestamp.fromDate(job.scrapedAt),
          });
          batch.push(docRef.id);
        }
      }
      
      console.log(`Saved ${batch.length} new jobs to database`);
    } catch (error) {
      console.error('Error saving jobs to database:', error);
      throw error;
    }
  }

  // Get jobs with filters
  async getJobs(userId: string, filters: JobFilter): Promise<Job[]> {
    try {
      // Try with orderBy first, fall back to simple query if index doesn't exist
      let snapshot;
      try {
        let q = query(
          collection(db, this.jobsCollection),
          orderBy('scrapedAt', 'desc'),
          limit(500) // Increased from 100 to 500
        );
        snapshot = await getDocs(q);
      } catch (indexError: any) {
        console.warn("⚠️ Firestore index not found for 'scrapedAt', using simple query:", indexError.message);
        // Fallback: Query without orderBy (no index needed)
        let q = query(
          collection(db, this.jobsCollection),
          limit(500) // Increased from 100 to 500
        );
        snapshot = await getDocs(q);
      }

      let jobs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          postedDate: data.postedDate?.toDate?.() || new Date(data.postedDate),
          scrapedAt: data.scrapedAt?.toDate?.() || new Date(data.scrapedAt || Date.now()),
        } as Job;
      });

      console.log(`📊 Loaded ${jobs.length} jobs from Firestore`);

      // Sort in memory if we couldn't use orderBy
      jobs.sort((a, b) => b.scrapedAt.getTime() - a.scrapedAt.getTime());

      // Apply filters
      // Location filter: Show jobs that match location OR are remote
      const hasLocationFilter = filters.location && filters.location.length > 0;
      const hasRemoteFilter = filters.remote === true;
      
      if (hasLocationFilter || hasRemoteFilter) {
        jobs = jobs.filter(job => {
          // If remote filter is enabled, include all remote jobs
          if (hasRemoteFilter && job.isRemote) {
            return true;
          }
          
          // If location filter is enabled, include jobs matching location
          if (hasLocationFilter) {
            if (filters.location!.includes('hyderabad') && job.isHyderabad) {
              return true;
            }
            // Check if job location contains any of the filter locations
            const jobLocationLower = job.location.toLowerCase();
            if (filters.location!.some(loc => jobLocationLower.includes(loc.toLowerCase()))) {
              return true;
            }
          }
          
          return false;
        });
        
        console.log(`   After location/remote filter: ${jobs.length} jobs`);
      }

      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter(job => 
          filters.skills!.some(skill => 
            job.skills.some(jobSkill => 
              jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      if (filters.postedWithin) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.postedWithin);
        const beforeFilter = jobs.length;
        jobs = jobs.filter(job => job.postedDate >= cutoffDate);
        console.log(`   After postedWithin (${filters.postedWithin} days) filter: ${jobs.length} jobs (removed ${beforeFilter - jobs.length})`);
      }

      // Calculate match scores if user preferences exist
      const userPrefs = await this.getUserJobPreferences(userId);
      if (userPrefs) {
        jobs = jobs.map(job => ({
          ...job,
          matchScore: this.calculateJobMatch(job, userPrefs),
        }));
        
        // Sort by match score
        jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      return jobs;
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }

  // Job Matching Algorithm
  calculateJobMatch(job: Job, userPreferences: any): number {
    let score = 0;
    let maxScore = 0;

    // Skills match (40% weight)
    if (userPreferences.skills && userPreferences.skills.length > 0) {
      const matchingSkills = job.skills.filter(skill =>
        userPreferences.skills.some((userSkill: string) =>
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      score += (matchingSkills.length / userPreferences.skills.length) * 40;
    }
    maxScore += 40;

    // Location match (20% weight)
    if (userPreferences.preferredLocations) {
      if (userPreferences.preferredLocations.includes('remote') && job.isRemote) {
        score += 20;
      } else if (userPreferences.preferredLocations.includes('hyderabad') && job.isHyderabad) {
        score += 20;
      }
    }
    maxScore += 20;

    // Experience match (20% weight)
    if (userPreferences.experience && job.experience) {
      // Simple matching logic - can be enhanced
      if (job.experience.toLowerCase().includes(userPreferences.experience.toLowerCase())) {
        score += 20;
      }
    }
    maxScore += 20;

    // Job type match (10% weight)
    if (userPreferences.jobType && userPreferences.jobType.includes(job.type)) {
      score += 10;
    }
    maxScore += 10;

    // Freshness (10% weight) - prefer recent jobs
    const daysSincePosted = Math.floor(
      (new Date().getTime() - job.postedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosted <= 7) {
      score += 10;
    } else if (daysSincePosted <= 14) {
      score += 5;
    }
    maxScore += 10;

    return Math.round((score / maxScore) * 100);
  }

  // Save user job preferences
  async saveUserJobPreferences(userId: string, preferences: any): Promise<void> {
    try {
      await addDoc(collection(db, this.userJobPreferencesCollection), {
        userId,
        ...preferences,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  // Get user job preferences
  async getUserJobPreferences(userId: string): Promise<any> {
    try {
      const q = query(
        collection(db, this.userJobPreferencesCollection),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return snapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Periodic job refresh (call this every 6 hours)
  async refreshJobs(): Promise<void> {
    try {
      console.log('Starting periodic job refresh...');
      const jobs = await this.aggregateJobsFromAllSources();
      await this.saveJobsToDatabase(jobs);
      console.log('Job refresh completed successfully');
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  }
}

export const jobHuntService = new JobHuntService();
