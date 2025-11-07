// Job Matching Types and Interfaces

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string; // "yearly", "monthly", "hourly"
  };
  postedDate?: string;
  source: JobSource;
  requirements?: string[];
  skills?: string[];
  type?: string; // "full-time", "part-time", "contract", etc.
  experienceLevel?: string; // "entry", "mid", "senior", "executive"
}

export type JobSource = "adzuna" | "indeed" | "linkedin" | "manual" | "other";

export interface JobMatchResult {
  job: JobPosting;
  matchScore: number;
  breakdown: {
    skills: { score: number; matched: string[]; missing: string[] };
    experience: { score: number; matched: string[]; missing: string[] };
    education: { score: number; matched: boolean; details: string };
    keywords: { score: number; matched: string[]; missing: string[] };
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  interviewPrepTips: string[];
  aiAnalysis: {
    overallFit: string;
    whyGoodMatch: string[];
    potentialConcerns: string[];
    suggestedImprovements: string[];
  };
}

export interface JobSearchFilters {
  keywords?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string[];
  experienceLevel?: string[];
  remote?: boolean;
  datePosted?: "today" | "week" | "month" | "all";
  maxResults?: number;
}

export interface JobMatchingConfig {
  resumeData: any; // ResumeData type
  filters?: JobSearchFilters;
  autoMatch?: boolean;
  matchThreshold?: number; // Minimum match score to show (0-100)
}




