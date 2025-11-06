// Resume Parser Service - Parse pasted resume text into structured data
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  ResumeData,
  ResumeSection,
  HeaderSection,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
} from "../types/resumeBuilder";
import { DEFAULT_RESUME_DATA } from "../utils/resumeTemplates";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export class ResumeParserService {
  private static model = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  });

  /**
   * Parse pasted resume text into structured ResumeData
   */
  static async parseResumeText(resumeText: string): Promise<ResumeData> {
    if (!resumeText.trim()) {
      throw new Error("Resume text cannot be empty");
    }

    const prompt = `You are an expert resume parser. Parse the following resume text and extract structured information. Return a JSON object with this exact structure:

{
  "header": {
    "fullName": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "portfolio": "portfolio.com"
  },
  "summary": "Professional summary text",
  "experience": [
    {
      "jobTitle": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": "Job description",
      "achievements": ["achievement1", "achievement2"],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "location": "City, State",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "gpa": "3.8",
      "honors": "Summa Cum Laude"
    }
  ],
  "skills": [
    {
      "name": "Skill Name",
      "category": "Category"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "url": "project-url.com"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM"
    }
  ],
  "awards": [
    {
      "title": "Award Title",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM",
      "description": "Award description"
    }
  ]
}

Extract all information accurately:
- Header: Name, contact info, links (GitHub, LinkedIn, portfolio, website)
- Summary: Professional summary or objective
- Experience: All work experiences with dates, descriptions, achievements
- Education: All degrees with institutions, dates, GPA, percentage
- Skills: Technical and soft skills, grouped by category
- Projects: Personal/professional projects with descriptions and technologies
- Certifications: Professional certifications with issuer and date. Parse formats like "Cert Name - Issuer (Platform)" or "Cert Name, Issuer" correctly
- Awards: Honors, awards, recognitions with issuer and date. Include hackathon wins, competitions, academic honors, etc. Parse formats like "Won X at Y" or "Award Name by Organization"

Resume text:
${resumeText}

Return only valid JSON, no markdown formatting, no code blocks.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      const parsed = JSON.parse(jsonText);

      // Convert parsed data to ResumeData structure
      return this.convertToResumeData(parsed);
    } catch (error) {
      console.error("Error parsing resume:", error);
      throw new Error("Failed to parse resume. Please check the format and try again.");
    }
  }

  /**
   * Convert parsed JSON to ResumeData structure
   */
  private static convertToResumeData(parsed: any): ResumeData {
    const sections: ResumeSection[] = [];
    let order = 0;

    // Header Section
    if (parsed.header) {
      sections.push({
        id: "header-1",
        type: "header",
        title: "Contact Information",
        content: {
          fullName: parsed.header.fullName || "",
          email: parsed.header.email || "",
          phone: parsed.header.phone || "",
          location: parsed.header.location || "",
          linkedin: parsed.header.linkedin || "",
          github: parsed.header.github || "",
          portfolio: parsed.header.portfolio || "",
        } as HeaderSection,
        order: order++,
        visible: true,
      });
    }

    // Summary Section
    if (parsed.summary) {
      sections.push({
        id: "summary-1",
        type: "summary",
        title: "Professional Summary",
        content: parsed.summary,
        order: order++,
        visible: true,
      });
    }

    // Experience Section
    if (parsed.experience && Array.isArray(parsed.experience) && parsed.experience.length > 0) {
      const experienceItems: ExperienceItem[] = parsed.experience.map((exp: any, idx: number) => ({
        id: `exp_${Date.now()}_${idx}`,
        jobTitle: exp.jobTitle || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "Present",
        description: exp.description || "",
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      }));

      sections.push({
        id: "experience-1",
        type: "experience",
        title: "Work Experience",
        content: experienceItems,
        order: order++,
        visible: true,
      });
    }

    // Education Section
    if (parsed.education && Array.isArray(parsed.education) && parsed.education.length > 0) {
      const educationItems: EducationItem[] = parsed.education.map((edu: any, idx: number) => ({
        id: `edu_${Date.now()}_${idx}`,
        degree: edu.degree || "",
        institution: edu.institution || "",
        location: edu.location || "",
        startDate: edu.startDate || "",
        endDate: edu.endDate || "Present",
        gpa: edu.gpa || "",
        honors: edu.honors || "",
        coursework: Array.isArray(edu.coursework) ? edu.coursework : [],
      }));

      sections.push({
        id: "education-1",
        type: "education",
        title: "Education",
        content: educationItems,
        order: order++,
        visible: true,
      });
    }

    // Skills Section
    if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
      const skillItems: SkillItem[] = parsed.skills.map((skill: any, idx: number) => ({
        id: `skill_${Date.now()}_${idx}`,
        name: skill.name || skill,
        category: skill.category || "General",
        proficiency: skill.proficiency,
      }));

      sections.push({
        id: "skills-1",
        type: "skills",
        title: "Skills",
        content: skillItems,
        order: order++,
        visible: true,
      });
    }

    // Projects Section
    if (parsed.projects && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      const projectItems: ProjectItem[] = parsed.projects.map((proj: any, idx: number) => ({
        id: `proj_${Date.now()}_${idx}`,
        name: proj.name || "",
        description: proj.description || "",
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        url: proj.url || "",
        github: proj.github || "",
        startDate: proj.startDate,
        endDate: proj.endDate || "Present",
        achievements: Array.isArray(proj.achievements) ? proj.achievements : [],
      }));

      sections.push({
        id: "projects-1",
        type: "projects",
        title: "Projects",
        content: projectItems,
        order: order++,
        visible: true,
      });
    }

    // Certifications Section
    if (
      parsed.certifications &&
      Array.isArray(parsed.certifications) &&
      parsed.certifications.length > 0
    ) {
      sections.push({
        id: "certifications-1",
        type: "certifications",
        title: "Certifications",
        content: parsed.certifications.map((cert: any, idx: number) => ({
          id: `cert_${Date.now()}_${idx}`,
          name: cert.name || "",
          issuer: cert.issuer || "",
          date: cert.date || "",
          expiryDate: cert.expiryDate,
          credentialId: cert.credentialId,
          url: cert.url || "",
        })),
        order: order++,
        visible: true,
      });
    }

    // Awards Section
    if (
      parsed.awards &&
      Array.isArray(parsed.awards) &&
      parsed.awards.length > 0
    ) {
      sections.push({
        id: "awards-1",
        type: "awards",
        title: "Honors & Awards",
        content: parsed.awards.map((award: any, idx: number) => ({
          id: `award_${Date.now()}_${idx}`,
          title: award.title || award.name || "",
          issuer: award.issuer || award.organization || "",
          date: award.date || "",
          description: award.description || "",
          url: award.url || "",
        })),
        order: order++,
        visible: true,
      });
    }

    return {
      ...DEFAULT_RESUME_DATA,
      name: parsed.header?.fullName
        ? `${parsed.header.fullName}'s Resume`
        : "Imported Resume",
      sections,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    };
  }

  /**
   * Quick parse with basic pattern matching (fallback if AI fails)
   */
  static parseResumeTextBasic(resumeText: string): ResumeData {
    const lines = resumeText.split("\n").map((line) => line.trim()).filter(Boolean);
    const sections: ResumeSection[] = [];
    let order = 0;

    // Try to extract header (first few lines)
    const headerSection: HeaderSection = {
      fullName: "",
      email: "",
      phone: "",
      location: "",
    };

    // Extract email
    const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      headerSection.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = resumeText.match(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    );
    if (phoneMatch) {
      headerSection.phone = phoneMatch[0];
    }

    // First line is usually name
    if (lines.length > 0) {
      headerSection.fullName = lines[0];
    }

    sections.push({
      id: "header-1",
      type: "header",
      title: "Contact Information",
      content: headerSection,
      order: order++,
      visible: true,
    });

    // Try to find summary section
    let summaryStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (
        /summary|objective|profile|about/i.test(lines[i]) &&
        lines[i].length < 30
      ) {
        summaryStart = i + 1;
        break;
      }
    }

    if (summaryStart > 0 && summaryStart < lines.length) {
      const summaryLines: string[] = [];
      for (let i = summaryStart; i < Math.min(summaryStart + 5, lines.length); i++) {
        if (lines[i].length > 10) {
          summaryLines.push(lines[i]);
        } else {
          break;
        }
      }
      if (summaryLines.length > 0) {
        sections.push({
          id: "summary-1",
          type: "summary",
          title: "Professional Summary",
          content: summaryLines.join(" "),
          order: order++,
          visible: true,
        });
      }
    }

    return {
      ...DEFAULT_RESUME_DATA,
      name: headerSection.fullName || "Imported Resume",
      sections,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    };
  }
}

