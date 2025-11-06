// Resume Builder Types and Interfaces

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  title: string;
  content: any; // Section-specific content
  order: number;
  visible: boolean;
}

export type ResumeSectionType =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "awards"
  | "publications"
  | "volunteer"
  | "custom";

export interface HeaderSection {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  customFields?: Array<{ label: string; value: string }>;
}

export interface SummarySection {
  content: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string | "Present";
  description: string;
  achievements: string[];
  technologies?: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string | "Present";
  gpa?: string;
  honors?: string;
  coursework?: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string | "Present";
  achievements?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  url?: string;
}

export interface ResumeData {
  id?: string;
  name: string;
  template: string;
  sections: ResumeSection[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  settings: {
    fontFamily: string;
    fontSize: number;
    colorScheme: string;
    spacing: number;
    showPageNumbers: boolean;
  };
}

export interface JobDescription {
  text: string;
  title?: string;
  company?: string;
  url?: string;
}

export interface AIEnhancementResult {
  enhancedSections: {
    summary?: string;
    experience?: ExperienceItem[];
    skills?: SkillItem[];
    projects?: ProjectItem[];
  };
  matchScore: number;
  insights: {
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    suggestions: string[];
    toneAnalysis: string;
  };
  improvements: {
    grammar: Array<{ text: string; suggestion: string }>;
    actionVerbs: Array<{ original: string; suggested: string }>;
    keywords: Array<{ keyword: string; context: string }>;
    readability: {
      score: number;
      suggestions: string[];
    };
  };
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: "ats" | "creative" | "modern" | "classic";
  layout: "single" | "two-column";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ExportOptions {
  format: "pdf" | "docx" | "json";
  includeMetadata?: boolean;
  pageSize?: "A4" | "Letter";
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

