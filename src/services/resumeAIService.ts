// AI Service for Resume Enhancement
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  ResumeData,
  JobDescription,
  AIEnhancementResult,
  ExperienceItem,
  SkillItem,
  ProjectItem,
} from "../types/resumeBuilder";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export class ResumeAIService {
  private static model = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  });

  /**
   * Analyze Job Description and extract key requirements
   */
  static async analyzeJobDescription(
    jdText: string
  ): Promise<{
    skills: string[];
    responsibilities: string[];
    keywords: string[];
    tone: string;
    requirements: string[];
    preferred: string[];
  }> {
    const prompt = `Analyze the following job description and extract structured information. Return a JSON object with this exact structure:

{
  "skills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "tone": "professional/technical/casual/formal",
  "requirements": ["requirement1", "requirement2", ...],
  "preferred": ["preferred1", "preferred2", ...]
}

Extract:
- Skills: Technical skills, tools, technologies, programming languages mentioned
- Responsibilities: Key job duties and responsibilities
- Keywords: Important keywords and phrases for ATS matching
- Tone: Overall tone of the job description (professional, technical, casual, formal)
- Requirements: Must-have requirements
- Preferred: Nice-to-have qualifications

Job Description:
${jdText}

Return only valid JSON, no markdown formatting.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      throw new Error("Failed to analyze job description");
    }
  }

  /**
   * Enhance resume sections based on job description
   */
  static async enhanceResume(
    resumeData: ResumeData,
    jobDescription: JobDescription
  ): Promise<AIEnhancementResult> {
    // First analyze the JD
    const jdAnalysis = await this.analyzeJobDescription(jobDescription.text);

    // Extract current resume content
    const resumeText = this.resumeDataToText(resumeData);

    const prompt = `You are an expert resume strategist and career coach. Your task is to enhance a resume to better match a job description while maintaining authenticity and clarity.

Job Description Analysis:
- Required Skills: ${jdAnalysis.skills.join(", ")}
- Key Responsibilities: ${jdAnalysis.responsibilities.join(", ")}
- Important Keywords: ${jdAnalysis.keywords.join(", ")}
- Tone: ${jdAnalysis.tone}
- Requirements: ${jdAnalysis.requirements.join(", ")}

Current Resume:
${resumeText}

Your task:
1. Rewrite resume sections to align with JD keywords and tone
2. Use measurable achievements with numbers/metrics where possible
3. Preserve clarity and professional style
4. Suggest improvements for grammar, action verbs, and readability
5. Calculate a match score (0-100) based on keyword alignment, skill match, and experience relevance

Return a JSON object with this exact structure:
{
  "enhancedSections": {
    "summary": "Enhanced professional summary",
    "experience": [
      {
        "id": "exp1",
        "jobTitle": "Job Title",
        "company": "Company Name",
        "location": "Location",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM or Present",
        "description": "Enhanced description",
        "achievements": ["achievement1", "achievement2"],
        "technologies": ["tech1", "tech2"]
      }
    ],
    "skills": [
      {
        "id": "skill1",
        "name": "Skill Name",
        "category": "Category",
        "proficiency": "Advanced"
      }
    ],
    "projects": [
      {
        "id": "proj1",
        "name": "Project Name",
        "description": "Enhanced description",
        "technologies": ["tech1", "tech2"],
        "achievements": ["achievement1"]
      }
    ]
  },
  "matchScore": 85,
  "insights": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "missingKeywords": ["keyword1", "keyword2"],
    "suggestions": ["suggestion1", "suggestion2"],
    "toneAnalysis": "Analysis of tone alignment"
  },
  "improvements": {
    "grammar": [
      {
        "text": "original text",
        "suggestion": "improved text"
      }
    ],
    "actionVerbs": [
      {
        "original": "worked on",
        "suggested": "developed"
      }
    ],
    "keywords": [
      {
        "keyword": "keyword",
        "context": "where to add it"
      }
    ],
    "readability": {
      "score": 75,
      "suggestions": ["suggestion1", "suggestion2"]
    }
  }
}

Return only valid JSON, no markdown formatting.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json\n?|\n?```/g, "").trim();
      const enhancement = JSON.parse(jsonText);

      // Calculate match score if not provided
      if (!enhancement.matchScore) {
        enhancement.matchScore = this.calculateMatchScore(
          resumeData,
          jdAnalysis
        );
      }

      return enhancement;
    } catch (error) {
      console.error("Error enhancing resume:", error);
      throw new Error("Failed to enhance resume");
    }
  }

  /**
   * Calculate match score between resume and job description
   */
  static calculateMatchScore(
    resumeData: ResumeData,
    jdAnalysis: {
      skills: string[];
      keywords: string[];
      requirements: string[];
    }
  ): number {
    let score = 0;
    let maxScore = 0;

    // Skill matching (40 points)
    maxScore += 40;
    const resumeSkills = this.extractSkills(resumeData);
    const matchedSkills = jdAnalysis.skills.filter((skill) =>
      resumeSkills.some((rs) =>
        rs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(rs.toLowerCase())
      )
    );
    score += (matchedSkills.length / jdAnalysis.skills.length) * 40;

    // Keyword matching (30 points)
    maxScore += 30;
    const resumeText = this.resumeDataToText(resumeData).toLowerCase();
    const matchedKeywords = jdAnalysis.keywords.filter((keyword) =>
      resumeText.includes(keyword.toLowerCase())
    );
    score += (matchedKeywords.length / jdAnalysis.keywords.length) * 30;

    // Experience relevance (30 points)
    maxScore += 30;
    const hasRelevantExperience = resumeData.sections.some(
      (section) => section.type === "experience" && section.content?.length > 0
    );
    score += hasRelevantExperience ? 30 : 10;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Extract skills from resume data
   */
  private static extractSkills(resumeData: ResumeData): string[] {
    const skills: string[] = [];
    resumeData.sections.forEach((section) => {
      if (section.type === "skills" && Array.isArray(section.content)) {
        section.content.forEach((skill: SkillItem) => {
          skills.push(skill.name);
        });
      }
      if (section.type === "experience" && Array.isArray(section.content)) {
        section.content.forEach((exp: ExperienceItem) => {
          if (exp.technologies) {
            skills.push(...exp.technologies);
          }
        });
      }
      if (section.type === "projects" && Array.isArray(section.content)) {
        section.content.forEach((proj: ProjectItem) => {
          if (proj.technologies) {
            skills.push(...proj.technologies);
          }
        });
      }
    });
    return [...new Set(skills)];
  }

  /**
   * Convert resume data to plain text for AI processing
   */
  private static resumeDataToText(resumeData: ResumeData): string {
    let text = "";

    resumeData.sections.forEach((section) => {
      text += `\n${section.title}:\n`;

      switch (section.type) {
        case "header":
          const header = section.content as any;
          text += `${header.fullName}\n${header.email}\n${header.phone}\n`;
          break;
        case "summary":
          text += `${section.content}\n`;
          break;
        case "experience":
          if (Array.isArray(section.content)) {
            section.content.forEach((exp: ExperienceItem) => {
              text += `${exp.jobTitle} at ${exp.company}\n`;
              text += `${exp.description}\n`;
              if (exp.achievements) {
                text += `Achievements: ${exp.achievements.join(", ")}\n`;
              }
            });
          }
          break;
        case "education":
          if (Array.isArray(section.content)) {
            section.content.forEach((edu: any) => {
              text += `${edu.degree} from ${edu.institution}\n`;
            });
          }
          break;
        case "skills":
          if (Array.isArray(section.content)) {
            text += section.content.map((s: SkillItem) => s.name).join(", ");
          }
          break;
        case "projects":
          if (Array.isArray(section.content)) {
            section.content.forEach((proj: ProjectItem) => {
              text += `${proj.name}: ${proj.description}\n`;
            });
          }
          break;
        default:
          text += JSON.stringify(section.content) + "\n";
      }
    });

    return text;
  }

  /**
   * Get AI feedback on resume content
   */
  static async getResumeFeedback(
    resumeData: ResumeData,
    jobDescription?: JobDescription
  ): Promise<{
    grammar: Array<{ text: string; suggestion: string }>;
    actionVerbs: Array<{ original: string; suggested: string }>;
    missingKeywords: string[];
    readability: { score: number; suggestions: string[] };
  }> {
    const resumeText = this.resumeDataToText(resumeData);
    const jdContext = jobDescription
      ? `\n\nJob Description Context:\n${jobDescription.text}`
      : "";

    const prompt = `Analyze the following resume and provide specific feedback. Return a JSON object:

{
  "grammar": [
    {"text": "original text with issue", "suggestion": "corrected text"}
  ],
  "actionVerbs": [
    {"original": "weak verb", "suggested": "strong action verb"}
  ],
  "missingKeywords": ["keyword1", "keyword2"],
  "readability": {
    "score": 75,
    "suggestions": ["suggestion1", "suggestion2"]
  }
}

Resume:
${resumeText}${jdContext}

Focus on:
- Grammar and spelling errors
- Weak action verbs that should be replaced
- Missing important keywords (if JD provided)
- Readability improvements

Return only valid JSON, no markdown formatting.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error getting resume feedback:", error);
      throw new Error("Failed to get resume feedback");
    }
  }
}

