// Resume Templates Configuration
import type { ResumeTemplate, ResumeData } from "../types/resumeBuilder";

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean, ATS-friendly single-column layout",
    preview: "modern-minimal-preview.jpg",
    category: "ats",
    layout: "single",
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#0ea5e9",
    },
  },
  {
    id: "professional-classic",
    name: "Professional Classic",
    description: "Traditional two-column format with sidebar",
    preview: "professional-classic-preview.jpg",
    category: "classic",
    layout: "two-column",
    colors: {
      primary: "#1e293b",
      secondary: "#475569",
      accent: "#3b82f6",
    },
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    description: "Bold design with color accents",
    preview: "creative-modern-preview.jpg",
    category: "creative",
    layout: "single",
    colors: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      accent: "#ec4899",
    },
  },
  {
    id: "ats-optimized",
    name: "ATS Optimized",
    description: "Maximum ATS compatibility with simple formatting",
    preview: "ats-optimized-preview.jpg",
    category: "ats",
    layout: "single",
    colors: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#000000",
    },
  },
  {
    id: "executive-elegant",
    name: "Executive Elegant",
    description: "Sophisticated design for senior roles",
    preview: "executive-elegant-preview.jpg",
    category: "modern",
    layout: "two-column",
    colors: {
      primary: "#0f172a",
      secondary: "#334155",
      accent: "#1e40af",
    },
  },
  {
    id: "tech-focused",
    name: "Tech Focused",
    description: "Modern layout perfect for tech roles",
    preview: "tech-focused-preview.jpg",
    category: "modern",
    layout: "single",
    colors: {
      primary: "#059669",
      secondary: "#10b981",
      accent: "#34d399",
    },
  },
];

export const DEFAULT_RESUME_DATA: ResumeData = {
  name: "My Resume",
  template: "modern-minimal",
  sections: [
    {
      id: "header-1",
      type: "header",
      title: "Contact Information",
      content: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
      },
      order: 0,
      visible: true,
    },
    {
      id: "summary-1",
      type: "summary",
      title: "Professional Summary",
      content: "",
      order: 1,
      visible: true,
    },
    {
      id: "experience-1",
      type: "experience",
      title: "Work Experience",
      content: [],
      order: 2,
      visible: true,
    },
    {
      id: "education-1",
      type: "education",
      title: "Education",
      content: [],
      order: 3,
      visible: true,
    },
    {
      id: "skills-1",
      type: "skills",
      title: "Skills",
      content: [],
      order: 4,
      visible: true,
    },
    {
      id: "projects-1",
      type: "projects",
      title: "Projects",
      content: [],
      order: 5,
      visible: true,
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  settings: {
    fontFamily: "Inter",
    fontSize: 11,
    colorScheme: "default",
    spacing: 1,
    showPageNumbers: false,
  },
};

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((t) => t.id === id);
}

export function createResumeFromTemplate(
  templateId: string,
  name: string = "My Resume"
): ResumeData {
  const template = getTemplateById(templateId);
  return {
    ...DEFAULT_RESUME_DATA,
    name,
    template: templateId,
  };
}

