// Job Matching Service - Match jobs with resume using Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobPosting, JobMatchResult, ResumeData } from "../types/jobMatching";
import type { ResumeData as ResumeBuilderData } from "../types/resumeBuilder";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || 
  import.meta.env.VITE_GOOGLE_AI_API_KEY || 
  ""
);

export class JobMatchingService {
  private static model = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  });

  // Rate limiting: Free tier allows 15 requests per minute
  private static readonly MAX_CONCURRENT_REQUESTS = 10; // Stay under 15/min limit
  private static readonly REQUEST_DELAY_MS = 4000; // 4 seconds between batches (15 req/min = 4 sec/req)
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_BASE_MS = 2000; // Base delay for exponential backoff

  /**
   * Sleep/delay utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is a rate limit/quota error
   */
  private static isRateLimitError(error: any): boolean {
    if (!error) return false;
    const errorMessage = error.message || error.toString() || "";
    return (
      errorMessage.includes("429") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("Resource has been exhausted")
    );
  }

  /**
   * Extract retry delay from error (if provided by API)
   */
  private static getRetryDelay(error: any): number {
    try {
      // Try to extract retry delay from error response
      if (error?.response?.data?.error?.details) {
        const details = error.response.data.error.details;
        const retryInfo = details.find((d: any) => d["@type"]?.includes("RetryInfo"));
        if (retryInfo?.retryDelay) {
          // Convert seconds to milliseconds
          return parseFloat(retryInfo.retryDelay) * 1000;
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return this.RETRY_DELAY_BASE_MS;
  }

  /**
   * Match a single job with resume using AI (with retry logic)
   */
  static async matchJobWithResume(
    job: JobPosting,
    resumeData: ResumeBuilderData,
    retryCount: number = 0
  ): Promise<JobMatchResult> {
    try {
      // Convert resume to text (not PDF - just text)
      const resumeText = this.resumeDataToText(resumeData);
      
      // Create comprehensive matching prompt
      const prompt = `You are an expert career advisor and resume matcher. Analyze how well a candidate's resume matches a job posting and provide detailed insights.

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}
${job.salary ? `Salary: ${job.salary.min || 'N/A'} - ${job.salary.max || 'N/A'} ${job.salary.currency || ''}` : ''}
${job.requirements ? `Requirements: ${job.requirements.join(', ')}` : ''}
${job.skills ? `Skills: ${job.skills.join(', ')}` : ''}

CANDIDATE RESUME (TEXT):
${resumeText}

TASK:
1. Calculate a match score (0-100) based on:
   - Skills alignment (40 points)
   - Experience relevance (30 points)
   - Education match (10 points)
   - Keyword matching (20 points)

2. Provide detailed breakdown for each category:
   - What matches (specific skills, experiences, keywords)
   - What's missing (gaps in skills, experience, education)

3. Identify strengths and weaknesses

4. Provide actionable recommendations to improve match

5. Generate interview prep tips specific to this job

6. Provide AI analysis of overall fit

Return a JSON object with this EXACT structure:
{
  "matchScore": 85,
  "breakdown": {
    "skills": {
      "score": 80,
      "matched": ["React", "TypeScript", "Node.js"],
      "missing": ["AWS", "Docker"]
    },
    "experience": {
      "score": 75,
      "matched": ["5 years of web development", "Team leadership experience"],
      "missing": ["Cloud infrastructure experience", "Microservices architecture"]
    },
    "education": {
      "score": 100,
      "matched": true,
      "details": "Bachelor's in Computer Science matches requirement"
    },
    "keywords": {
      "score": 70,
      "matched": ["agile", "scrum", "full-stack"],
      "missing": ["kubernetes", "CI/CD"]
    }
  },
  "strengths": [
    "Strong technical skills in React and TypeScript",
    "Relevant work experience in similar role",
    "Good educational background"
  ],
  "weaknesses": [
    "Missing cloud platform experience",
    "No experience with containerization"
  ],
  "recommendations": [
    "Add AWS certification to resume",
    "Highlight any Docker experience in projects",
    "Emphasize scalable system design experience"
  ],
  "interviewPrepTips": [
    "Prepare examples of React projects you've built",
    "Be ready to discuss system architecture decisions",
    "Research the company's tech stack and products"
  ],
  "aiAnalysis": {
    "overallFit": "Strong match with 85% alignment. Candidate has excellent technical skills and relevant experience. Main gaps are in cloud infrastructure and DevOps practices, which can be addressed through certifications or side projects.",
    "whyGoodMatch": [
      "5+ years of relevant experience",
      "Strong technical skills match job requirements",
      "Proven track record in similar role"
    ],
    "potentialConcerns": [
      "Limited cloud platform experience",
      "May need training on specific DevOps tools"
    ],
    "suggestedImprovements": [
      "Complete AWS certification",
      "Add Docker/Kubernetes to skills section",
      "Highlight any scalable system design work"
    ]
  }
}

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().replace(/```json\n?|\n?```/g, "").trim();
      
      // Remove any markdown code blocks
      jsonText = jsonText.replace(/^```[\s\S]*?```$/gm, "").trim();
      
      const matchData = JSON.parse(jsonText);

      // Create JobMatchResult
      return {
        job,
        matchScore: matchData.matchScore || 0,
        breakdown: matchData.breakdown || {
          skills: { score: 0, matched: [], missing: [] },
          experience: { score: 0, matched: [], missing: [] },
          education: { score: 0, matched: false, details: "" },
          keywords: { score: 0, matched: [], missing: [] },
        },
        strengths: matchData.strengths || [],
        weaknesses: matchData.weaknesses || [],
        recommendations: matchData.recommendations || [],
        interviewPrepTips: matchData.interviewPrepTips || [],
        aiAnalysis: matchData.aiAnalysis || {
          overallFit: "",
          whyGoodMatch: [],
          potentialConcerns: [],
          suggestedImprovements: [],
        },
      };
    } catch (error: any) {
      // Handle rate limit errors with retry
      if (this.isRateLimitError(error) && retryCount < this.MAX_RETRIES) {
        const retryDelay = this.getRetryDelay(error) * Math.pow(2, retryCount); // Exponential backoff
        console.warn(
          `Rate limit hit for job "${job.title}". Retrying in ${retryDelay / 1000}s... (Attempt ${retryCount + 1}/${this.MAX_RETRIES})`
        );
        
        await this.sleep(retryDelay);
        return this.matchJobWithResume(job, resumeData, retryCount + 1);
      }

      console.error("Error matching job with resume:", error);
      
      // Fallback: Use basic matching
      return this.basicMatch(job, resumeData);
    }
  }

  /**
   * Basic matching fallback (without AI) - Enhanced version
   */
  private static basicMatch(
    job: JobPosting,
    resumeData: ResumeBuilderData
  ): JobMatchResult {
    const resumeText = this.resumeDataToText(resumeData).toLowerCase();
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    // Extract skills from resume
    const resumeSkills = this.extractSkills(resumeData);
    const jobSkills = this.extractSkillsFromJob(job);

    // Calculate basic match score
    const matchedSkills = jobSkills.filter((skill) =>
      resumeSkills.some((rs) =>
        rs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(rs.toLowerCase())
      )
    );

    const skillsScore = jobSkills.length > 0
      ? (matchedSkills.length / jobSkills.length) * 40
      : 0;

    const keywordsScore = this.calculateKeywordMatch(resumeText, jobText) * 20;
    const experienceScore = this.hasRelevantExperience(resumeData, job) ? 30 : 10;
    const educationScore = 10; // Default

    const matchScore = Math.round(skillsScore + keywordsScore + experienceScore + educationScore);

    // Extract matched keywords
    const jobWords = new Set(
      jobText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );
    const resumeWords = new Set(
      resumeText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );
    const matchedKeywords = Array.from(jobWords).filter((word) => resumeWords.has(word));

    // Generate basic recommendations
    const missingSkills = jobSkills.filter((s) => !matchedSkills.includes(s));
    const recommendations = missingSkills.length > 0
      ? [
          `Consider adding ${missingSkills.slice(0, 3).join(", ")} to your resume`,
          "Highlight relevant experience that matches the job description",
          "Include specific achievements and metrics in your resume",
        ]
      : [
          "Your skills align well with this position",
          "Emphasize your most relevant experience in your cover letter",
        ];

    const interviewPrepTips = [
      `Research ${job.company} and their products/services`,
      "Prepare examples of projects that demonstrate relevant skills",
      "Review common interview questions for this role",
    ];

    return {
      job,
      matchScore,
      breakdown: {
        skills: {
          score: Math.round(skillsScore),
          matched: matchedSkills,
          missing: missingSkills,
        },
        experience: {
          score: experienceScore,
          matched: this.hasRelevantExperience(resumeData, job) ? ["Relevant experience found"] : [],
          missing: [],
        },
        education: {
          score: educationScore,
          matched: true,
          details: "Education requirements met",
        },
        keywords: {
          score: Math.round(keywordsScore),
          matched: matchedKeywords.slice(0, 10),
          missing: [],
        },
      },
      strengths: matchedSkills.length > 0 
        ? [
            `Strong skills in ${matchedSkills.slice(0, 3).join(", ")}`,
            "Relevant experience matches job requirements",
          ]
        : ["Good foundational skills"],
      weaknesses: missingSkills.length > 0
        ? [`Missing skills: ${missingSkills.slice(0, 3).join(", ")}`]
        : [],
      recommendations,
      interviewPrepTips,
      aiAnalysis: {
        overallFit: `Match score: ${matchScore}%. ${matchedSkills.length} out of ${jobSkills.length} required skills match. ${matchScore >= 70 ? "Strong candidate" : matchScore >= 50 ? "Moderate match" : "Consider improving your resume to better align with this position."}`,
        whyGoodMatch: matchedSkills.length > 0
          ? [
              `Strong alignment with ${matchedSkills.slice(0, 2).join(" and ")}`,
              "Relevant experience in similar role",
            ]
          : ["Good potential with some skill development"],
        potentialConcerns: missingSkills.length > 0
          ? [`Consider learning or highlighting: ${missingSkills.slice(0, 2).join(", ")}`]
          : [],
        suggestedImprovements: recommendations,
      },
    };
  }

  /**
   * Extract skills from resume
   */
  private static extractSkills(resumeData: ResumeBuilderData): string[] {
    const skills: string[] = [];
    
    resumeData.sections.forEach((section) => {
      if (section.type === "skills" && Array.isArray(section.content)) {
        section.content.forEach((skill: any) => {
          if (skill.name) skills.push(skill.name);
        });
      }
      if (section.type === "experience" && Array.isArray(section.content)) {
        section.content.forEach((exp: any) => {
          if (exp.technologies) {
            skills.push(...exp.technologies);
          }
        });
      }
      if (section.type === "projects" && Array.isArray(section.content)) {
        section.content.forEach((proj: any) => {
          if (proj.technologies) {
            skills.push(...proj.technologies);
          }
        });
      }
    });

    return [...new Set(skills)];
  }

  /**
   * Extract skills from job description
   */
  private static extractSkillsFromJob(job: JobPosting): string[] {
    if (job.skills && job.skills.length > 0) {
      return job.skills;
    }

    // Common tech skills to look for
    const commonSkills = [
      "React", "Vue", "Angular", "JavaScript", "TypeScript", "Python", "Java",
      "Node.js", "Express", "Django", "Flask", "AWS", "Azure", "GCP",
      "Docker", "Kubernetes", "Git", "MongoDB", "PostgreSQL", "MySQL",
      "Redis", "GraphQL", "REST", "CI/CD", "Jenkins", "GitHub Actions",
    ];

    const jobText = `${job.title} ${job.description}`.toLowerCase();
    return commonSkills.filter((skill) =>
      jobText.includes(skill.toLowerCase())
    );
  }

  /**
   * Calculate keyword match score
   */
  private static calculateKeywordMatch(resumeText: string, jobText: string): number {
    const jobWords = new Set(
      jobText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );

    const resumeWords = new Set(
      resumeText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );

    let matches = 0;
    jobWords.forEach((word) => {
      if (resumeWords.has(word)) {
        matches++;
      }
    });

    return jobWords.size > 0 ? matches / jobWords.size : 0;
  }

  /**
   * Check if resume has relevant experience
   */
  private static hasRelevantExperience(
    resumeData: ResumeBuilderData,
    job: JobPosting
  ): boolean {
    const jobTitle = job.title.toLowerCase();
    const jobDesc = job.description.toLowerCase();

    return resumeData.sections.some((section) => {
      if (section.type === "experience" && Array.isArray(section.content)) {
        return section.content.some((exp: any) => {
          const expText = `${exp.jobTitle} ${exp.description}`.toLowerCase();
          return (
            expText.includes(jobTitle.split(" ")[0]) ||
            jobDesc.split(" ").some((word) => expText.includes(word))
          );
        });
      }
      return false;
    });
  }

  /**
   * Convert resume data to text
   */
  private static resumeDataToText(resumeData: ResumeBuilderData): string {
    let text = "";

    resumeData.sections.forEach((section) => {
      text += `\n${section.title}:\n`;

      switch (section.type) {
        case "header":
          const header = section.content as any;
          text += `${header.fullName || ""}\n${header.email || ""}\n`;
          break;
        case "summary":
          text += `${section.content || ""}\n`;
          break;
        case "experience":
          if (Array.isArray(section.content)) {
            section.content.forEach((exp: any) => {
              text += `${exp.jobTitle || ""} at ${exp.company || ""}\n`;
              text += `${exp.description || ""}\n`;
              if (exp.achievements) {
                text += `Achievements: ${exp.achievements.join(", ")}\n`;
              }
              if (exp.technologies) {
                text += `Technologies: ${exp.technologies.join(", ")}\n`;
              }
            });
          }
          break;
        case "education":
          if (Array.isArray(section.content)) {
            section.content.forEach((edu: any) => {
              text += `${edu.degree || ""} from ${edu.institution || ""}\n`;
            });
          }
          break;
        case "skills":
          if (Array.isArray(section.content)) {
            text += section.content.map((s: any) => s.name || s).join(", ");
          }
          break;
        case "projects":
          if (Array.isArray(section.content)) {
            section.content.forEach((proj: any) => {
              text += `${proj.name || ""}: ${proj.description || ""}\n`;
              if (proj.technologies) {
                text += `Technologies: ${proj.technologies.join(", ")}\n`;
              }
            });
          }
          break;
      }
    });

    return text;
  }

  /**
   * Match multiple jobs with resume in a SINGLE API call (efficient)
   */
  static async matchMultipleJobs(
    jobs: JobPosting[],
    resumeData: ResumeBuilderData,
    matchThreshold: number = 50
  ): Promise<JobMatchResult[]> {
    if (jobs.length === 0) {
      return [];
    }

    // If only 1 job, use single job matching
    if (jobs.length === 1) {
      const result = await this.matchJobWithResume(jobs[0], resumeData);
      return result.matchScore >= matchThreshold ? [result] : [];
    }

    try {
      // Convert resume to text
      const resumeText = this.resumeDataToText(resumeData);

      // Limit jobs to avoid token limits (Gemini has context limits)
      const maxJobsPerCall = 15;
      const jobsToProcess = jobs.slice(0, maxJobsPerCall);
      
      // Create jobs summary for the prompt (with limited description length)
      const jobsSummary = jobsToProcess.map((job, index) => ({
        id: index,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description.substring(0, 500), // Limit description length
        skills: job.skills || [],
        salary: job.salary,
      }));

      const prompt = `You are an expert career advisor. Analyze how well a candidate's resume matches MULTIPLE job postings and provide match scores for each.

CANDIDATE RESUME (TEXT):
${resumeText.substring(0, 2000)}${resumeText.length > 2000 ? '...' : ''}

JOB POSTINGS (${jobsToProcess.length} jobs):
${JSON.stringify(jobsSummary, null, 2)}

TASK:
For EACH job posting, calculate a match score (0-100) and provide analysis. Return a JSON array where each element matches this structure:

{
  "jobId": 0,
  "matchScore": 85,
  "breakdown": {
    "skills": {
      "score": 80,
      "matched": ["React", "TypeScript", "Node.js"],
      "missing": ["AWS", "Docker"]
    },
    "experience": {
      "score": 75,
      "matched": ["5 years of web development"],
      "missing": ["Cloud infrastructure experience"]
    },
    "education": {
      "score": 100,
      "matched": true,
      "details": "Education requirements met"
    },
    "keywords": {
      "score": 70,
      "matched": ["agile", "scrum"],
      "missing": ["kubernetes"]
    }
  },
  "strengths": ["Strong technical skills", "Relevant experience"],
  "weaknesses": ["Missing cloud experience"],
  "recommendations": ["Add AWS certification", "Highlight Docker experience"],
  "interviewPrepTips": ["Prepare React examples", "Research company"],
  "aiAnalysis": {
    "overallFit": "Strong match with 85% alignment...",
    "whyGoodMatch": ["5+ years experience", "Strong skills"],
    "potentialConcerns": ["Limited cloud experience"],
    "suggestedImprovements": ["Complete AWS certification"]
  }
}

IMPORTANT:
- Return an array with ONE object per job (same order as input)
- Calculate match scores based on: Skills (40%), Experience (30%), Education (10%), Keywords (20%)
- Make each analysis specific to that job
- Be concise but thorough
- Return ONLY valid JSON array, no markdown, no code blocks`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().replace(/```json\n?|\n?```/g, "").trim();
      jsonText = jsonText.replace(/^```[\s\S]*?```$/gm, "").trim();

      // Try to extract JSON array from response (handle cases where there's extra text)
      let matchDataArray: any[];
      try {
        // First, try to find JSON array in the response
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        matchDataArray = JSON.parse(jsonText);
      } catch (parseError: any) {
        console.error("JSON parse error, attempting to fix:", parseError);
        
        // Try to fix common JSON issues
        try {
          // Remove any trailing commas before closing brackets
          jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
          // Fix unescaped quotes in strings
          jsonText = jsonText.replace(/([^\\])"/g, '$1\\"');
          // Try to extract just the array part
          const arrayStart = jsonText.indexOf('[');
          const arrayEnd = jsonText.lastIndexOf(']');
          if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
            jsonText = jsonText.substring(arrayStart, arrayEnd + 1);
          }
          matchDataArray = JSON.parse(jsonText);
        } catch (secondError) {
          console.error("Failed to parse JSON after fixes:", secondError);
          // If still fails, throw to trigger fallback
          throw new Error("Failed to parse AI response. Using fallback matching.");
        }
      }

      // Map results back to jobs (only for processed jobs)
      const results: JobMatchResult[] = matchDataArray
        .slice(0, jobsToProcess.length)
        .map((matchData: any, index: number) => {
          const job = jobsToProcess[index] || jobsToProcess[matchData?.jobId] || jobsToProcess[0];
        
        return {
          job,
          matchScore: matchData.matchScore || 0,
          breakdown: matchData.breakdown || {
            skills: { score: 0, matched: [], missing: [] },
            experience: { score: 0, matched: [], missing: [] },
            education: { score: 0, matched: false, details: "" },
            keywords: { score: 0, matched: [], missing: [] },
          },
          strengths: matchData.strengths || [],
          weaknesses: matchData.weaknesses || [],
          recommendations: matchData.recommendations || [],
          interviewPrepTips: matchData.interviewPrepTips || [],
          aiAnalysis: matchData.aiAnalysis || {
            overallFit: "",
            whyGoodMatch: [],
            potentialConcerns: [],
            suggestedImprovements: [],
          },
        };
      });

      // If we had more jobs than we processed, add basic matches for the rest
      if (jobs.length > maxJobsPerCall) {
        const remainingJobs = jobs.slice(maxJobsPerCall);
        const remainingResults = remainingJobs.map((job) => this.basicMatch(job, resumeData));
        results.push(...remainingResults);
      }

      // Filter by threshold and sort by match score
      return results
        .filter((result) => result.matchScore >= matchThreshold)
        .sort((a, b) => b.matchScore - a.matchScore);
    } catch (error: any) {
      console.error("Error matching multiple jobs in single call:", error);
      
      // Fallback: Try to use Gemini to generate better job matches
      try {
        console.log("Falling back to Gemini-enhanced basic matching...");
        return await this.matchJobsWithGeminiFallback(jobs, resumeData, matchThreshold);
      } catch (geminiError) {
        console.error("Gemini fallback also failed:", geminiError);
        // Final fallback: Use basic matching for all jobs
        console.log("Using basic matching for all jobs...");
        const results = jobs.map((job) => this.basicMatch(job, resumeData));
        
        return results
          .filter((result) => result.matchScore >= matchThreshold)
          .sort((a, b) => b.matchScore - a.matchScore);
      }
    }
  }

  /**
   * Fallback: Use Gemini to enhance basic matching results
   */
  private static async matchJobsWithGeminiFallback(
    jobs: JobPosting[],
    resumeData: ResumeBuilderData,
    matchThreshold: number
  ): Promise<JobMatchResult[]> {
    // First, do basic matching for all jobs
    const basicResults = jobs.map((job) => this.basicMatch(job, resumeData));

    // Then use Gemini to enhance the top matches (limit to avoid quota)
    const topJobs = basicResults
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Only enhance top 5 to save quota

    const enhancedResults: JobMatchResult[] = [];

    // Enhance top matches one by one (with delays to avoid rate limits)
    for (const basicResult of topJobs) {
      try {
        const enhanced = await this.matchJobWithResume(basicResult.job, resumeData);
        enhancedResults.push(enhanced);
        // Small delay between requests
        await this.sleep(1000);
      } catch (error) {
        // If enhancement fails, use basic result
        enhancedResults.push(basicResult);
      }
    }

    // Add remaining basic results
    const remainingJobs = basicResults.filter(
      (result) => !topJobs.some((tr) => tr.job.id === result.job.id)
    );
    enhancedResults.push(...remainingJobs);

    return enhancedResults
      .filter((result) => result.matchScore >= matchThreshold)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

