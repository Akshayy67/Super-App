import natural from "natural";
import compromise from "compromise";
import { removeStopwords } from "stopword";

export interface ProcessedText {
  original: string;
  cleaned: string;
  tokens: string[];
  lemmatized: string[];
  sentences: string[];
  keywords: string[];
  entities: {
    skills: string[];
    companies: string[];
    locations: string[];
    dates: string[];
  };
}

export interface SimilarityResult {
  score: number;
  matchedPhrases: string[];
  sourceText: string;
  targetText: string;
}

export class NLPService {
  private static stemmer = natural.PorterStemmer;
  private static tokenizer = new natural.WordTokenizer();
  private static tfidf = new natural.TfIdf();

  // Tech skills dictionary for better recognition
  private static techSkills = new Set([
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "go",
    "rust",
    "swift",
    "react",
    "angular",
    "vue",
    "node",
    "express",
    "django",
    "flask",
    "spring",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "elasticsearch",
    "git",
    "jenkins",
    "ci/cd",
    "agile",
    "scrum",
    "devops",
    "machine learning",
    "ai",
    "data science",
    "analytics",
    "big data",
  ]);

  static processText(text: string): ProcessedText {
    // Clean and normalize text
    const cleaned = this.cleanText(text);

    // Tokenize
    const tokens = this.tokenizer.tokenize(cleaned.toLowerCase()) || [];

    // Remove stopwords but preserve technical terms
    const filteredTokens = removeStopwords(tokens, ["en"]).filter(
      (token) => token.length > 1 && /^[a-zA-Z0-9+#.-]+$/.test(token)
    );

    // Lemmatize (simplified stemming for now)
    const lemmatized = filteredTokens.map((token) => this.stemmer.stem(token));

    // Extract sentences
    const sentences = this.extractSentences(cleaned);

    // Extract keywords using TF-IDF
    const keywords = this.extractKeywords(cleaned, filteredTokens);

    // Extract entities
    const entities = this.extractEntities(cleaned);

    return {
      original: text,
      cleaned,
      tokens: filteredTokens,
      lemmatized,
      sentences,
      keywords,
      entities,
    };
  }

  static calculateSimilarity(text1: string, text2: string): SimilarityResult {
    const processed1 = this.processText(text1);
    const processed2 = this.processText(text2);

    // Calculate cosine similarity using TF-IDF vectors
    const similarity = this.cosineSimilarity(
      processed1.tokens,
      processed2.tokens
    );

    // Find matching phrases
    const matchedPhrases = this.findMatchingPhrases(
      processed1.sentences,
      processed2.sentences
    );

    return {
      score: similarity,
      matchedPhrases,
      sourceText: text1,
      targetText: text2,
    };
  }

  static extractRequirements(jobDescText: string): {
    hardRequirements: string[];
    skillsRequired: string[];
    niceToHave: string[];
    experienceYears: number | null;
  } {
    const processed = this.processText(jobDescText);
    const doc = compromise(jobDescText);

    // Extract hard requirements using patterns
    const hardRequirements = this.extractHardRequirements(jobDescText);

    // Extract skills
    const skillsRequired = this.extractSkills(processed);

    // Extract nice-to-have items
    const niceToHave = this.extractNiceToHave(jobDescText);

    // Extract experience years
    const experienceYears = this.extractExperienceYears(jobDescText);

    return {
      hardRequirements,
      skillsRequired,
      niceToHave,
      experienceYears,
    };
  }

  static extractResumeSections(resumeText: string): {
    summary?: string;
    skills: string[];
    experience: string[];
    education: string[];
    projects: string[];
    certifications: string[];
  } {
    const sections = this.identifySections(resumeText);
    const processed = this.processText(resumeText);

    return {
      summary: sections.summary,
      skills: this.extractSkills(processed),
      experience: sections.experience || [],
      education: sections.education || [],
      projects: sections.projects || [],
      certifications: sections.certifications || [],
    };
  }

  private static cleanText(text: string): string {
    return text
      .replace(/[^\w\s.,!?;:()\-+#]/g, " ") // Keep basic punctuation and tech chars
      .replace(/\s+/g, " ")
      .trim();
  }

  private static extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  }

  private static extractKeywords(text: string, tokens: string[]): string[] {
    // Simple TF-IDF based keyword extraction
    this.tfidf.addDocument(tokens);

    const keywords: Array<{ term: string; score: number }> = [];
    this.tfidf.listTerms(0).forEach((item) => {
      if (item.tfidf > 0.1) {
        // Threshold for relevance
        keywords.push({ term: item.term, score: item.tfidf });
      }
    });

    return keywords
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((k) => k.term);
  }

  private static extractEntities(text: string): ProcessedText["entities"] {
    const doc = compromise(text);

    return {
      skills: this.extractSkills({
        tokens: this.tokenizer.tokenize(text.toLowerCase()) || [],
      } as ProcessedText),
      companies: doc.organizations().out("array"),
      locations: doc.places().out("array"),
      dates: doc.dates().out("array"),
    };
  }

  private static extractSkills(processed: ProcessedText): string[] {
    const skills = new Set<string>();

    // Check against known tech skills
    processed.tokens.forEach((token) => {
      if (this.techSkills.has(token.toLowerCase())) {
        skills.add(token.toLowerCase());
      }
    });

    // Look for compound skills (e.g., "machine learning", "data science")
    const text = processed.cleaned.toLowerCase();
    this.techSkills.forEach((skill) => {
      if (text.includes(skill)) {
        skills.add(skill);
      }
    });

    return Array.from(skills);
  }

  private static cosineSimilarity(
    tokens1: string[],
    tokens2: string[]
  ): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));

    const magnitude1 = Math.sqrt(set1.size);
    const magnitude2 = Math.sqrt(set2.size);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return intersection.size / (magnitude1 * magnitude2);
  }

  private static findMatchingPhrases(
    sentences1: string[],
    sentences2: string[]
  ): string[] {
    const matches: string[] = [];
    const threshold = 0.6;

    sentences1.forEach((s1) => {
      sentences2.forEach((s2) => {
        const similarity = this.cosineSimilarity(
          this.tokenizer.tokenize(s1.toLowerCase()) || [],
          this.tokenizer.tokenize(s2.toLowerCase()) || []
        );

        if (similarity > threshold) {
          matches.push(s1.trim());
        }
      });
    });

    return [...new Set(matches)]; // Remove duplicates
  }

  private static extractHardRequirements(text: string): string[] {
    const patterns = [
      /must have\s+([^.!?]+)/gi,
      /required:\s*([^.!?]+)/gi,
      /mandatory\s+([^.!?]+)/gi,
      /essential\s+([^.!?]+)/gi,
      /minimum\s+(\d+)\s*years?\s+([^.!?]+)/gi,
    ];

    const requirements: string[] = [];

    patterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          requirements.push(match[1].trim());
        }
      }
    });

    return requirements;
  }

  private static extractNiceToHave(text: string): string[] {
    const patterns = [
      /nice to have\s+([^.!?]+)/gi,
      /preferred\s+([^.!?]+)/gi,
      /bonus\s+([^.!?]+)/gi,
      /plus\s+([^.!?]+)/gi,
    ];

    const niceToHave: string[] = [];

    patterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          niceToHave.push(match[1].trim());
        }
      }
    });

    return niceToHave;
  }

  private static extractExperienceYears(text: string): number | null {
    const patterns = [
      /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
      /minimum\s+(\d+)\s*years?/gi,
      /at least\s+(\d+)\s*years?/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }

    return null;
  }

  private static identifySections(
    text: string
  ): Record<string, string | string[]> {
    const sections: Record<string, string | string[]> = {};
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentSection = "";
    let currentContent: string[] = [];

    const sectionHeaders = {
      summary: /^(summary|profile|objective|about)/i,
      skills: /^(skills|technical skills|competencies)/i,
      experience:
        /^(experience|work experience|employment|professional experience)/i,
      education: /^(education|academic|qualifications)/i,
      projects: /^(projects|portfolio)/i,
      certifications: /^(certifications|certificates|licenses)/i,
    };

    lines.forEach((line) => {
      let foundSection = false;

      for (const [section, pattern] of Object.entries(sectionHeaders)) {
        if (pattern.test(line)) {
          // Save previous section
          if (currentSection && currentContent.length > 0) {
            sections[currentSection] =
              currentSection === "summary"
                ? currentContent.join(" ")
                : currentContent;
          }

          currentSection = section;
          currentContent = [];
          foundSection = true;
          break;
        }
      }

      if (!foundSection && currentSection) {
        currentContent.push(line);
      }
    });

    // Save last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] =
        currentSection === "summary"
          ? currentContent.join(" ")
          : currentContent;
    }

    return sections;
  }
}
