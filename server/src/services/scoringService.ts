import { NLPService } from "./nlpService.js";
import { db } from "./database.js";

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  keywords: number;
}

export interface SectionScores {
  skills: number;
  experience: number;
  education: number;
  keywords: number;
}

export interface GateResult {
  rule: string;
  passed: boolean;
  details: string;
  impact?: string;
}

export interface MatchResult {
  jdItem: string;
  matchedPhrases: string[];
  similarity: number;
  sourceSection: string;
}

export interface ScoreResult {
  overall: number;
  sections: SectionScores;
  gates: GateResult[];
  matches: MatchResult[];
  missingKeywords: string[];
  suggestions: {
    bullets: string[];
    topActions: string[];
  };
  debug?: {
    weights: ScoringWeights;
    tfidfStats: any;
    processingInfo: any;
  };
}

export class ScoringService {
  private static defaultWeights: ScoringWeights = {
    skills: 0.4,
    experience: 0.35,
    education: 0.1,
    keywords: 0.15,
  };

  static async scoreResume(
    resumeText: string,
    jobDescText: string,
    includeDebug = false
  ): Promise<ScoreResult> {
    // Get configuration
    const weights = await this.getScoringWeights();

    // Process texts
    const resumeData = NLPService.extractResumeSections(resumeText);
    const jdData = NLPService.extractRequirements(jobDescText);

    // Calculate section scores
    const skillsScore = await this.calculateSkillsScore(
      resumeData.skills,
      jdData.skillsRequired
    );
    const experienceScore = this.calculateExperienceScore(
      resumeData.experience,
      jdData
    );
    const educationScore = this.calculateEducationScore(
      resumeData.education,
      jdData
    );
    const keywordsScore = this.calculateKeywordsScore(resumeText, jobDescText);

    const sections: SectionScores = {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      keywords: keywordsScore,
    };

    // Calculate weighted overall score
    let overall =
      sections.skills * weights.skills +
      sections.experience * weights.experience +
      sections.education * weights.education +
      sections.keywords * weights.keywords;

    // Apply gates (hard requirements)
    const gates = this.evaluateGates(resumeData, jdData);
    const failedGates = gates.filter((gate) => !gate.passed);

    if (failedGates.length > 0) {
      // Cap score if hard requirements are not met
      overall = Math.min(overall, 60);
    }

    // Find matches between resume and JD
    const matches = this.findMatches(resumeData, jdData);

    // Identify missing keywords
    const missingKeywords = this.findMissingKeywords(
      resumeData.skills,
      jdData.skillsRequired
    );

    // Generate suggestions
    const suggestions = this.generateSuggestions(resumeData, jdData, sections);

    const result: ScoreResult = {
      overall: Math.round(overall),
      sections: {
        skills: Math.round(sections.skills),
        experience: Math.round(sections.experience),
        education: Math.round(sections.education),
        keywords: Math.round(sections.keywords),
      },
      gates,
      matches,
      missingKeywords,
      suggestions,
    };

    if (includeDebug) {
      result.debug = {
        weights,
        tfidfStats: {
          /* TF-IDF statistics */
        },
        processingInfo: {
          resumeSections: Object.keys(resumeData),
          jdRequirements: jdData.hardRequirements.length,
          skillsFound: resumeData.skills.length,
          experienceItems: resumeData.experience.length,
        },
      };
    }

    return result;
  }

  private static async calculateSkillsScore(
    resumeSkills: string[],
    requiredSkills: string[]
  ): Promise<number> {
    if (requiredSkills.length === 0) return 85; // Default good score if no specific skills required

    const synonyms = await this.getSkillSynonyms();
    let matchedSkills = 0;
    let totalWeight = 0;

    requiredSkills.forEach((required) => {
      const weight = this.getSkillWeight(required);
      totalWeight += weight;

      const isMatched = resumeSkills.some((resume) =>
        this.skillsMatch(resume, required, synonyms)
      );

      if (isMatched) {
        matchedSkills += weight;
      }
    });

    return totalWeight > 0 ? (matchedSkills / totalWeight) * 100 : 0;
  }

  private static calculateExperienceScore(
    experienceItems: string[],
    jdData: ReturnType<typeof NLPService.extractRequirements>
  ): number {
    if (experienceItems.length === 0) return 20; // Low score for no experience

    let totalSimilarity = 0;
    let maxSimilarity = 0;

    // Compare each experience item with JD requirements
    experienceItems.forEach((experience) => {
      jdData.hardRequirements.forEach((requirement) => {
        const similarity = NLPService.calculateSimilarity(
          experience,
          requirement
        );
        totalSimilarity += similarity.score;
        maxSimilarity = Math.max(maxSimilarity, similarity.score);
      });
    });

    // Base score from similarity
    const avgSimilarity =
      totalSimilarity /
      (experienceItems.length * Math.max(jdData.hardRequirements.length, 1));
    let score = avgSimilarity * 100;

    // Boost for having multiple relevant experiences
    if (experienceItems.length >= 3) score += 10;
    if (maxSimilarity > 0.7) score += 15; // Bonus for highly relevant experience

    return Math.min(score, 100);
  }

  private static calculateEducationScore(
    educationItems: string[],
    jdData: ReturnType<typeof NLPService.extractRequirements>
  ): number {
    if (educationItems.length === 0) return 50; // Neutral score

    // Simple education scoring - can be enhanced
    const hasRelevantEducation = educationItems.some((edu) => {
      const eduLower = edu.toLowerCase();
      return (
        eduLower.includes("computer") ||
        eduLower.includes("engineering") ||
        eduLower.includes("science") ||
        eduLower.includes("technology")
      );
    });

    return hasRelevantEducation ? 85 : 70;
  }

  private static calculateKeywordsScore(
    resumeText: string,
    jobDescText: string
  ): number {
    const resumeProcessed = NLPService.processText(resumeText);
    const jdProcessed = NLPService.processText(jobDescText);

    const resumeKeywords = new Set(resumeProcessed.keywords);
    const jdKeywords = new Set(jdProcessed.keywords);

    const intersection = new Set(
      [...resumeKeywords].filter((x) => jdKeywords.has(x))
    );
    const coverage =
      jdKeywords.size > 0 ? intersection.size / jdKeywords.size : 0;

    return coverage * 100;
  }

  private static evaluateGates(
    resumeData: ReturnType<typeof NLPService.extractResumeSections>,
    jdData: ReturnType<typeof NLPService.extractRequirements>
  ): GateResult[] {
    const gates: GateResult[] = [];

    // Check hard requirements
    jdData.hardRequirements.forEach((requirement) => {
      const passed = this.checkHardRequirement(resumeData, requirement);
      gates.push({
        rule: `Hard Requirement: ${requirement}`,
        passed,
        details: passed ? "Requirement met" : "Requirement not found in resume",
        impact: passed ? undefined : "Caps overall score at 60%",
      });
    });

    // Check experience years if specified
    if (jdData.experienceYears) {
      const hasEnoughExperience = this.checkExperienceYears(
        resumeData,
        jdData.experienceYears
      );
      gates.push({
        rule: `Minimum ${jdData.experienceYears} years experience`,
        passed: hasEnoughExperience,
        details: hasEnoughExperience
          ? "Experience requirement met"
          : "Insufficient experience indicated",
        impact: hasEnoughExperience ? undefined : "Caps overall score at 60%",
      });
    }

    return gates;
  }

  private static findMatches(
    resumeData: ReturnType<typeof NLPService.extractResumeSections>,
    jdData: ReturnType<typeof NLPService.extractRequirements>
  ): MatchResult[] {
    const matches: MatchResult[] = [];

    // Match skills
    jdData.skillsRequired.forEach((skill) => {
      const matchedSkill = resumeData.skills.find(
        (resumeSkill) =>
          resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(resumeSkill.toLowerCase())
      );

      if (matchedSkill) {
        matches.push({
          jdItem: skill,
          matchedPhrases: [matchedSkill],
          similarity: 1.0,
          sourceSection: "skills",
        });
      }
    });

    // Match experience with requirements
    jdData.hardRequirements.forEach((requirement) => {
      resumeData.experience.forEach((exp, index) => {
        const similarity = NLPService.calculateSimilarity(exp, requirement);
        if (similarity.score > 0.5) {
          matches.push({
            jdItem: requirement,
            matchedPhrases: similarity.matchedPhrases,
            similarity: similarity.score,
            sourceSection: `experience-${index}`,
          });
        }
      });
    });

    return matches;
  }

  private static findMissingKeywords(
    resumeSkills: string[],
    requiredSkills: string[]
  ): string[] {
    const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());
    return requiredSkills.filter(
      (required) =>
        !resumeSkillsLower.some(
          (resume) =>
            resume.includes(required.toLowerCase()) ||
            required.toLowerCase().includes(resume)
        )
    );
  }

  private static generateSuggestions(
    resumeData: ReturnType<typeof NLPService.extractResumeSections>,
    jdData: ReturnType<typeof NLPService.extractRequirements>,
    sections: SectionScores
  ): { bullets: string[]; topActions: string[] } {
    const bullets: string[] = [];
    const topActions: string[] = [];

    // Suggest missing skills
    const missingSkills = this.findMissingKeywords(
      resumeData.skills,
      jdData.skillsRequired
    );
    if (missingSkills.length > 0) {
      topActions.push(
        `Add missing skills: ${missingSkills.slice(0, 3).join(", ")}`
      );
      bullets.push(
        `• Developed proficiency in ${missingSkills[0]} through hands-on projects and training`
      );
    }

    // Suggest experience improvements
    if (sections.experience < 70) {
      topActions.push(
        "Enhance experience descriptions with specific achievements and metrics"
      );
      bullets.push(
        "• Led cross-functional team of 5 engineers to deliver project 2 weeks ahead of schedule"
      );
      bullets.push(
        "• Improved system performance by 40% through optimization and refactoring"
      );
    }

    // Suggest keyword improvements
    if (sections.keywords < 60) {
      topActions.push(
        "Incorporate more job-specific keywords throughout your resume"
      );
    }

    // General improvements
    if (sections.skills < 80) {
      topActions.push(
        "Expand technical skills section with relevant technologies"
      );
    }

    return { bullets, topActions };
  }

  // Helper methods
  private static async getScoringWeights(): Promise<ScoringWeights> {
    try {
      const config = await db.config.findUnique({
        where: { key: "scoring_weights" },
      });

      if (config) {
        return JSON.parse(config.jsonValue);
      }
    } catch (error) {
      console.warn(
        "Failed to load scoring weights from database, using defaults"
      );
    }

    return this.defaultWeights;
  }

  private static async getSkillSynonyms(): Promise<Record<string, string[]>> {
    try {
      const config = await db.config.findUnique({
        where: { key: "skill_synonyms" },
      });

      if (config) {
        return JSON.parse(config.jsonValue);
      }
    } catch (error) {
      console.warn("Failed to load skill synonyms from database");
    }

    return {};
  }

  private static skillsMatch(
    resumeSkill: string,
    requiredSkill: string,
    synonyms: Record<string, string[]>
  ): boolean {
    const resume = resumeSkill.toLowerCase();
    const required = requiredSkill.toLowerCase();

    // Direct match
    if (
      resume === required ||
      resume.includes(required) ||
      required.includes(resume)
    ) {
      return true;
    }

    // Synonym match
    const requiredSynonyms = synonyms[required] || [];
    return requiredSynonyms.some((synonym) =>
      resume.includes(synonym.toLowerCase())
    );
  }

  private static getSkillWeight(skill: string): number {
    // High-priority skills get higher weights
    const highPrioritySkills = [
      "javascript",
      "python",
      "react",
      "node",
      "aws",
      "sql",
    ];
    return highPrioritySkills.includes(skill.toLowerCase()) ? 1.5 : 1.0;
  }

  private static checkHardRequirement(
    resumeData: ReturnType<typeof NLPService.extractResumeSections>,
    requirement: string
  ): boolean {
    const reqLower = requirement.toLowerCase();

    // Check in skills
    if (
      resumeData.skills.some((skill) => skill.toLowerCase().includes(reqLower))
    ) {
      return true;
    }

    // Check in experience
    if (
      resumeData.experience.some((exp) => exp.toLowerCase().includes(reqLower))
    ) {
      return true;
    }

    return false;
  }

  private static checkExperienceYears(
    resumeData: ReturnType<typeof NLPService.extractResumeSections>,
    requiredYears: number
  ): boolean {
    // Simple heuristic: if they have multiple experience entries, assume they meet requirements
    // In a real implementation, you'd parse dates and calculate actual years
    return resumeData.experience.length >= Math.min(requiredYears / 2, 3);
  }
}
