import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_ATS_API_URL || "http://localhost:3001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ats_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("ats_token");
      // Optionally redirect to login or show auth modal
    }
    return Promise.reject(error);
  }
);

export interface ParsedResume {
  text: string;
  sections: {
    summary?: string;
    skills: string[];
    experience: string[];
    education: string[];
    projects: string[];
    certifications: string[];
  };
  metadata: {
    wordCount: number;
    characterCount: number;
    fileType: string;
    fileName: string;
    pageCount?: number;
  };
}

export interface ParsedJobDescription {
  text: string;
  requirements: string[];
  skillsRequired: string[];
  niceToHave: string[];
  experienceYears: number | null;
  metadata: {
    wordCount: number;
    characterCount: number;
    requirementsCount: number;
    skillsCount: number;
  };
}

export interface ScoreResult {
  overall: number;
  sections: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  gates: Array<{
    rule: string;
    passed: boolean;
    details: string;
    impact?: string;
  }>;
  matches: Array<{
    jdItem: string;
    matchedPhrases: string[];
    similarity: number;
    sourceSection: string;
  }>;
  missingKeywords: string[];
  suggestions: {
    bullets: string[];
    topActions: string[];
  };
  scoreRunId?: string;
  timestamp: string;
  debug?: any;
}

export interface ScoreRun {
  id: string;
  overall: number;
  sections: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  createdAt: string;
  modelVersion: string;
  resume: {
    id: string;
    title: string;
    originalName: string;
  };
  jobDescription: {
    id: string;
    title: string;
    source?: string;
  };
}

export interface UserStats {
  totals: {
    scoreRuns: number;
    resumes: number;
    jobDescriptions: number;
  };
  scores: {
    average: number;
    highest: number;
    lowest: number;
  };
  activity: {
    recentRuns: number;
    periodDays: number;
  };
  distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export class ATSService {
  // Authentication
  static async login(
    email: string,
    password: string
  ): Promise<{ user: any; token: string }> {
    const response = await api.post("/auth/login", { email, password });
    const { user, token } = response.data.data;
    localStorage.setItem("ats_token", token);
    return { user, token };
  }

  static async register(
    email: string,
    password: string
  ): Promise<{ user: any; token: string }> {
    const response = await api.post("/auth/register", { email, password });
    const { user, token } = response.data.data;
    localStorage.setItem("ats_token", token);
    return { user, token };
  }

  static async magicLink(email: string): Promise<{ user: any; token: string }> {
    const response = await api.post("/auth/magic", { email });
    const { user, token } = response.data.data;
    localStorage.setItem("ats_token", token);
    return { user, token };
  }

  static async getCurrentUser(): Promise<any> {
    const response = await api.get("/auth/me");
    return response.data.data.user;
  }

  static logout(): void {
    localStorage.removeItem("ats_token");
  }

  // File parsing
  static async parseResumeFile(file: File): Promise<ParsedResume> {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post("/parse/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  static async parseResumeText(text: string): Promise<ParsedResume> {
    const response = await api.post("/parse/resume-text", { text });
    return response.data.data;
  }

  static async parseJobDescriptionText(
    text: string
  ): Promise<ParsedJobDescription> {
    const response = await api.post("/parse/job-description", { text });
    return response.data.data;
  }

  static async parseJobDescriptionFile(
    file: File
  ): Promise<ParsedJobDescription> {
    const formData = new FormData();
    formData.append("jobDescription", file);

    const response = await api.post("/parse/jd-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  // Scoring
  static async scoreResume(
    resumeText: string,
    jobDescriptionText: string,
    includeDebug = false
  ): Promise<ScoreResult> {
    const response = await api.post("/score", {
      resume: { text: resumeText },
      jobDescription: { text: jobDescriptionText },
      includeDebug,
    });

    return response.data.data;
  }

  static async bulkScoreResumes(
    resumes: Array<{ text: string; title?: string }>,
    jobDescriptionText: string
  ): Promise<any> {
    const response = await api.post("/score/bulk", {
      resumes,
      jobDescription: { text: jobDescriptionText },
    });

    return response.data.data;
  }

  static async suggestBullets(
    resumeSectionText: string,
    targetKeywords: string[],
    experienceLevel: "entry" | "mid" | "senior" = "mid"
  ): Promise<{ bullets: string[] }> {
    const response = await api.post("/score/suggest-bullets", {
      resumeSectionText,
      targetKeywords,
      experienceLevel,
    });

    return response.data.data;
  }

  // Score runs management
  static async getScoreRuns(
    page = 1,
    limit = 10,
    sortBy: "createdAt" | "overall" | "title" = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<{ runs: ScoreRun[]; pagination: any }> {
    const response = await api.get("/runs", {
      params: { page, limit, sortBy, sortOrder },
    });

    return response.data.data;
  }

  static async getScoreRun(id: string): Promise<any> {
    const response = await api.get(`/runs/${id}`);
    return response.data.data;
  }

  static async deleteScoreRun(id: string): Promise<void> {
    await api.delete(`/runs/${id}`);
  }

  static async downloadPDFReport(id: string): Promise<Blob> {
    const response = await api.get(`/runs/${id}/pdf`, {
      responseType: "blob",
    });

    return response.data;
  }

  static async getUserStats(): Promise<UserStats> {
    const response = await api.get("/runs/stats/summary");
    return response.data.data;
  }

  // Utility methods
  static async getSupportedFormats(): Promise<any> {
    const response = await api.get("/parse/supported-formats");
    return response.data.data;
  }

  static async getScoringWeights(): Promise<any> {
    const response = await api.get("/score/weights");
    return response.data.data;
  }

  static async healthCheck(): Promise<any> {
    const response = await api.get("/health");
    return response.data.data;
  }

  // Helper methods
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("ats_token");
  }

  static getScoreColor(score: number): string {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  }

  static getScoreGrade(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export default ATSService;
