import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface ATSScoreResult {
  overall: number;
  sections: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  matches: Array<{
    category: string;
    matched: string[];
    missing: string[];
    score: number;
  }>;
  missingKeywords: string[];
  suggestions: {
    bullets: string[];
    topActions: string[];
    improvements: string[];
  };
  strengths: string[];
  weaknesses: string[];
  timestamp: string;
}

export interface ParsedResumeData {
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
    formatting?: {
      isWellFormatted: boolean;
      hasGoodAlignment: boolean;
      isATSFriendly: boolean;
      formatIssues: string[];
    };
  };
}

export class GeminiATSService {
  private static model = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  });

  // Parse resume text and extract structured data
  static async parseResumeText(
    text: string,
    fileName: string = "resume.txt"
  ): Promise<ParsedResumeData> {
    const prompt = `
Analyze the following resume text and extract structured information. Return a JSON object with the following structure:

{
  "sections": {
    "summary": "Brief professional summary if found",
    "skills": ["skill1", "skill2", ...],
    "experience": ["experience1", "experience2", ...],
    "education": ["education1", "education2", ...],
    "projects": ["project1", "project2", ...],
    "certifications": ["cert1", "cert2", ...]
  }
}

Extract:
- Skills: Technical skills, programming languages, tools, frameworks
- Experience: Job titles, companies, key responsibilities and achievements
- Education: Degrees, institutions, relevant coursework
- Projects: Personal/professional projects with descriptions
- Certifications: Professional certifications, licenses

Resume text:
${text}

Return only the JSON object, no additional text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response
        .text()
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      const parsed = JSON.parse(jsonText);

      return {
        text,
        sections: {
          summary: parsed.sections.summary || "",
          skills: parsed.sections.skills || [],
          experience: parsed.sections.experience || [],
          education: parsed.sections.education || [],
          projects: parsed.sections.projects || [],
          certifications: parsed.sections.certifications || [],
        },
        metadata: {
          wordCount: text.split(/\s+/).length,
          characterCount: text.length,
          fileType: fileName.split(".").pop() || "txt",
          fileName,
        },
      };
    } catch (error) {
      console.error("Error parsing resume:", error);
      // Fallback parsing
      return this.fallbackParseResume(text, fileName);
    }
  }

  // Parse resume file (PDF, DOCX, TXT) using Gemini's multimodal capabilities
  static async parseResumeFile(file: File): Promise<ParsedResumeData> {
    try {
      if (file.type === "text/plain") {
        // For text files, just read the content
        const text = await file.text();
        return this.parseResumeText(text, file.name);
      } else if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Use Gemini's multimodal capabilities for PDF and DOCX files
        return await this.parseFileWithGemini(file);
      } else {
        throw new Error(
          "Unsupported file type. Please use TXT, PDF, or DOCX files."
        );
      }
    } catch (error) {
      console.error("Error parsing resume file:", error);
      // Preserve helpful copy-paste messages
      if (
        error instanceof Error &&
        (error.message.includes("copy-paste") ||
          error.message.includes("Paste Text"))
      ) {
        throw error; // Re-throw the helpful message as-is
      }
      throw error;
    }
  }

  // Parse file using Gemini's multimodal capabilities with fallback
  private static async parseFileWithGemini(
    file: File
  ): Promise<ParsedResumeData> {
    try {
      // First, try to extract text using browser APIs for better compatibility
      const extractedText = await this.extractTextFromFile(file);

      if (extractedText && extractedText.trim().length > 50) {
        // If we successfully extracted text, use it with enhanced analysis
        const result = await this.parseResumeText(extractedText, file.name);

        // Add formatting analysis based on file type
        const formatAnalysis = this.analyzeFileFormatting(file, extractedText);

        return {
          ...result,
          metadata: {
            ...result.metadata,
            formatting: formatAnalysis,
          },
        };
      } else {
        throw new Error("Could not extract text from file");
      }
    } catch (error) {
      console.error("Error parsing file with Gemini:", error);
      // If it's already a helpful copy-paste message, preserve it
      if (
        error instanceof Error &&
        (error.message.includes("copy-paste") ||
          error.message.includes("Paste Text"))
      ) {
        throw error; // Re-throw the original helpful message
      }
      // Otherwise, provide a generic error message
      throw new Error(
        `Failed to parse ${file.name}. Please ensure the file is not corrupted and try copying and pasting the text directly.`
      );
    }
  }

  // Analyze file formatting based on file type and content
  private static analyzeFileFormatting(file: File, text: string) {
    const isPDF = file.type.includes("pdf");
    const isDOCX = file.type.includes("word");

    // Basic formatting analysis based on text structure
    const hasGoodStructure =
      text.includes("EXPERIENCE") ||
      text.includes("SKILLS") ||
      text.includes("EDUCATION");
    const hasConsistentFormatting =
      text.split("\n").filter((line) => line.trim()).length > 5;
    const wordCount = text.split(/\s+/).length;

    return {
      isWellFormatted: hasGoodStructure && hasConsistentFormatting,
      hasGoodAlignment: isPDF || isDOCX, // Assume structured files have better alignment
      isATSFriendly: hasGoodStructure && wordCount > 100,
      formatIssues: [
        ...(hasGoodStructure ? [] : ["Missing clear section headers"]),
        ...(hasConsistentFormatting
          ? []
          : ["Inconsistent formatting detected"]),
        ...(wordCount > 100 ? [] : ["Resume appears too short"]),
      ],
    };
  }

  // Extract text from file using browser APIs and PDF.js
  private static async extractTextFromFile(file: File): Promise<string> {
    if (file.type === "text/plain") {
      return await file.text();
    } else if (file.type === "application/pdf") {
      // Extract text from PDF using PDF.js
      return await this.extractTextFromPDF(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // For DOCX files, we'll need to inform the user to copy-paste
      throw new Error(
        "DOCX text extraction requires copy-paste. Please copy the text from your Word document and use the 'Paste Text' option."
      );
    } else {
      throw new Error(
        "Unsupported file type. Please use TXT or PDF files, or use the 'Paste Text' option."
      );
    }
  }

  // Validate PDF file structure
  private static async validatePDF(file: File): Promise<boolean> {
    try {
      // Check file size (should be > 0)
      if (file.size === 0) {
        throw new Error("PDF file is empty");
      }

      // Check if file starts with PDF header
      const arrayBuffer = await file.slice(0, 1024).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array.slice(0, 4));
      
      if (header !== "%PDF") {
        throw new Error("File does not appear to be a valid PDF");
      }

      return true;
    } catch (error) {
      console.error("PDF validation error:", error);
      return false;
    }
  }

  // Extract text from PDF using PDF.js with fallback to Gemini Vision
  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      // First, validate the PDF structure
      const isValid = await this.validatePDF(file);
      if (!isValid) {
        throw new Error(
          "Invalid PDF file. The file may be corrupted, not a valid PDF, or in an unsupported format. Please try:\n1. Re-saving the PDF from the original application\n2. Using the 'Paste Text' option below\n3. Converting to a text file (.txt)"
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // Try to load PDF with PDF.js
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0, // Suppress warnings
          stopAtErrors: false, // Continue even with some errors
          maxImageSize: 1024 * 1024, // 1MB max image size
        }).promise;
      } catch (pdfError: any) {
        console.error("Error loading PDF with PDF.js:", pdfError);
        
        // Provide specific error messages based on error type
        if (pdfError?.name === "InvalidPDFException" || pdfError?.message?.includes("Invalid PDF")) {
          throw new Error(
            "Invalid PDF structure. The PDF may be corrupted or in an unsupported format. Please try:\n1. Opening and re-saving the PDF in a PDF viewer\n2. Using the 'Paste Text' option below\n3. Converting the PDF to a text file"
          );
        }
        
        if (pdfError?.message?.includes("password") || pdfError?.message?.includes("encrypted")) {
          throw new Error(
            "This PDF is password-protected or encrypted. Please remove the password protection and try again, or use the 'Paste Text' option below."
          );
        }
        
        // For other PDF.js errors, try Gemini Vision as fallback
        console.log("PDF.js failed, attempting Gemini Vision fallback...");
        try {
          return await this.extractTextFromPDFWithGemini(file);
        } catch (geminiError) {
          throw new Error(
            "Cannot process this PDF. It may be corrupted, encrypted, or in an unsupported format. Please use the 'Paste Text' option below to manually enter your resume content."
          );
        }
      }

      let fullText = "";
      let hasText = false;

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          
          if (pageText.trim().length > 0) {
            hasText = true;
            fullText += pageText + "\n";
          }
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }

      // If no text was extracted, try Gemini Vision API as fallback
      if (!hasText || fullText.trim().length < 50) {
        console.log("No text extracted from PDF, trying Gemini Vision API...");
        try {
          return await this.extractTextFromPDFWithGemini(file);
        } catch (geminiError) {
          console.error("Gemini Vision API also failed:", geminiError);
          throw new Error(
            "Failed to extract text from PDF. The PDF might be image-based, encrypted, or corrupted. Please try:\n1. Opening the PDF and copying the text manually\n2. Using the 'Paste Text' option below\n3. Converting the PDF to a text file"
          );
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      
      // If it's already a helpful error message, preserve it
      if (error instanceof Error && error.message.includes("Paste Text")) {
        throw error;
      }
      
      // Try Gemini Vision as last resort
      try {
        console.log("Attempting Gemini Vision API fallback...");
        return await this.extractTextFromPDFWithGemini(file);
      } catch (geminiError) {
        console.error("All PDF extraction methods failed:", geminiError);
        throw new Error(
          "Failed to extract text from PDF. Please ensure the PDF contains selectable text and try again, or use the 'Paste Text' option below."
        );
      }
    }
  }

  // Extract text from PDF using Gemini Vision API (for image-based/scanned PDFs)
  // Converts PDF pages to images first, then uses Gemini Vision
  private static async extractTextFromPDFWithGemini(file: File): Promise<string> {
    try {
      console.log("Using Gemini Vision API to extract text from PDF (converting pages to images)...");
      
      // First, load the PDF with PDF.js to convert pages to images
      const arrayBuffer = await file.arrayBuffer();
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0
        }).promise;
      } catch (pdfError) {
        console.error("Cannot load PDF for image conversion:", pdfError);
        throw new Error(
          "Cannot process this PDF. It may be corrupted or encrypted. Please use the 'Paste Text' option below."
        );
      }

      if (pdf.numPages === 0) {
        throw new Error("PDF has no pages");
      }

      // Convert each PDF page to an image and extract text using Gemini
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 5); // Limit to first 5 pages for performance

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          
          // Render page to canvas
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          
          if (!context) {
            throw new Error("Cannot create canvas context");
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert canvas to base64 image
          const imageData = canvas.toDataURL("image/png");
          const base64Data = imageData.split(",")[1];

          // Use Gemini Vision to extract text from the image
          const prompt = pageNum === 1 
            ? `Extract all text from this resume page. Return the complete text content exactly as it appears, preserving structure. Include all sections like contact info, summary, skills, experience, education, projects, certifications, etc. Return only the extracted text, no commentary.`
            : `Extract all text from this resume page (page ${pageNum}). Return the complete text content exactly as it appears. Return only the extracted text, no commentary.`;

          const result = await this.model.generateContent([
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/png",
              },
            },
            prompt,
          ]);

          const response = await result.response;
          const pageText = response.text().trim();
          
          if (pageText.length > 0) {
            fullText += pageText + "\n\n";
          }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    if (fullText.trim().length < 50) {
      throw new Error("Extracted very little text from PDF pages");
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error using Gemini Vision API for PDF:", error);
    
    // If it's already a helpful error message from validation, preserve it
    if (error instanceof Error && (
      error.message.includes("Invalid PDF") || 
      error.message.includes("password") ||
      error.message.includes("corrupted")
    )) {
      throw error;
    }
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("quota")) {
        throw new Error(
          "Gemini API issue. Please check your API key configuration. For now, please use the 'Paste Text' option to manually paste your resume content."
        );
      }
      
      if (error.message.includes("no pages") || error.message.includes("no pages")) {
        throw new Error(
          "The PDF appears to be empty or corrupted. Please try:\n1. Opening the PDF to verify it's not corrupted\n2. Using the 'Paste Text' option below\n3. Converting the PDF to a text file"
        );
      }
    }
    
    throw new Error(
      "Could not extract text using AI. The PDF might be corrupted, encrypted, or image-based. Please use the 'Paste Text' option below to manually enter your resume content."
    );
  }
}

  // Convert file to format suitable for Gemini
  private static async fileToGenerativePart(file: File) {
    const base64EncodedData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
  }

  // Parse job description text using Gemini
  static async parseJobDescriptionText(text: string): Promise<any> {
    const prompt = `
Analyze the following job description and extract key information in JSON format:

JOB DESCRIPTION:
${text}

Extract and return the following information in JSON format:
{
  "requirements": ["requirement1", "requirement2"],
  "skillsRequired": ["skill1", "skill2"],
  "experienceYears": 3,
  "niceToHave": ["nice1", "nice2"],
  "metadata": {
    "wordCount": ${text.split(/\s+/).length},
    "requirementsCount": 0,
    "skillsCount": 0
  }
}

Focus on:
- Hard requirements (must-have qualifications)
- Technical skills and tools
- Years of experience required
- Nice-to-have qualifications
- Soft skills

Return only the JSON object, no additional text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response
        .text()
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      const parsed = JSON.parse(jsonText);

      // Update metadata counts
      parsed.metadata.requirementsCount = parsed.requirements?.length || 0;
      parsed.metadata.skillsCount = parsed.skillsRequired?.length || 0;

      return parsed;
    } catch (error) {
      console.error("Error parsing job description:", error);

      // Check for quota exceeded error
      if (error instanceof Error && error.message.includes("quota")) {
        throw new Error(
          "API quota exceeded. Please wait a few minutes before trying again, or consider upgrading your Gemini API plan."
        );
      }

      throw new Error("Failed to parse job description. Please try again.");
    }
  }

  // Parse job description file using Gemini
  static async parseJobDescriptionFile(file: File): Promise<any> {
    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await this.extractTextFromPDF(file);
      } else if (file.type === "text/plain") {
        text = await file.text();
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        throw new Error(
          "DOCX files are not supported yet. Please copy and paste the text instead."
        );
      } else {
        throw new Error("Unsupported file type. Please use PDF or TXT files.");
      }

      const analysis = await this.parseJobDescriptionText(text);
      return {
        ...analysis,
        text,
      };
    } catch (error) {
      console.error("Error parsing job description file:", error);
      throw error;
    }
  }

  // Generate ATS score using Gemini
  static async generateATSScore(
    resumeText: string,
    jobDescriptionText: string | null
  ): Promise<ATSScoreResult> {
    const hasJobDescription =
      jobDescriptionText && jobDescriptionText.trim().length > 0;

    let fullPrompt: string = "";

    if (hasJobDescription) {
      fullPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and provide a comprehensive ATS compatibility score.

JOB DESCRIPTION:
${jobDescriptionText}

RESUME:
${resumeText}

Please provide a detailed analysis in the following JSON format:`;
    } else {
      fullPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume and provide a comprehensive ATS compatibility assessment focusing on general best practices and resume quality.

RESUME:
${resumeText}

Please provide a detailed analysis in the following JSON format:`;
    }

    const jsonFormat = `
{
  "overall": 85,
  "sections": {
    "skills": 90,
    "experience": 80,
    "education": 75,
    "keywords": 88
  },
  "matches": [
    {
      "category": "Technical Skills",
      "matched": ["Python", "React", "SQL"],
      "missing": ["AWS", "Docker"],
      "score": 85
    }
  ],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": {
    "bullets": [
      "Add specific metrics to quantify achievements",
      "Include more relevant technical skills"
    ],
    "topActions": [
      "Add AWS certification",
      "Highlight leadership experience"
    ],
    "improvements": [
      "Use more action verbs",
      "Include industry-specific keywords"
    ]
  },
  "strengths": [
    "Strong technical background",
    "Relevant work experience"
  ],
  "weaknesses": [
    "Missing key certifications",
    "Limited quantified achievements"
  ]
}`;

    const scoringCriteria = hasJobDescription
      ? `Scoring criteria (with job description):
- Skills (40%): Match between required skills and resume skills
- Experience (35%): Relevance of work experience to job requirements
- Education (10%): Educational background alignment
- Keywords (15%): Presence of important keywords from job description`
      : `Scoring criteria (general assessment):
- Skills (40%): Quality and relevance of technical/professional skills
- Experience (35%): Quality of work experience and achievements
- Education (10%): Educational background and certifications
- Keywords (15%): Use of industry-standard terminology and action words`;

    const completePrompt = `${fullPrompt}${jsonFormat}

${scoringCriteria}

Provide specific, actionable suggestions for improvement. Be precise with scores (0-100).
Return only the JSON object, no additional text.`;

    try {
      const result = await this.model.generateContent(completePrompt);
      const response = await result.response;
      const jsonText = response
        .text()
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      const parsed = JSON.parse(jsonText);

      return {
        ...parsed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating ATS score:", error);

      // Check for quota exceeded error
      if (error instanceof Error && error.message.includes("quota")) {
        throw new Error(
          "API quota exceeded. Please wait a few minutes before trying again, or consider upgrading your Gemini API plan."
        );
      }

      throw new Error("Failed to generate ATS score. Please try again.");
    }
  }

  // Fallback resume parsing for when AI parsing fails
  private static fallbackParseResume(
    text: string,
    fileName: string
  ): ParsedResumeData {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Simple keyword-based extraction
    const skills: string[] = [];
    const experience: string[] = [];
    const education: string[] = [];

    // Common skill keywords
    const skillKeywords = [
      "javascript",
      "python",
      "java",
      "react",
      "node",
      "sql",
      "aws",
      "docker",
      "kubernetes",
      "git",
      "html",
      "css",
      "typescript",
      "angular",
      "vue",
    ];

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();

      // Extract skills
      skillKeywords.forEach((skill) => {
        if (lowerLine.includes(skill) && !skills.includes(skill)) {
          skills.push(skill);
        }
      });

      // Extract experience (lines with years or job titles)
      if (
        lowerLine.includes("experience") ||
        lowerLine.includes("engineer") ||
        lowerLine.includes("developer") ||
        /\d{4}\s*-\s*\d{4}/.test(line)
      ) {
        experience.push(line);
      }

      // Extract education
      if (
        lowerLine.includes("university") ||
        lowerLine.includes("college") ||
        lowerLine.includes("degree") ||
        lowerLine.includes("bachelor") ||
        lowerLine.includes("master")
      ) {
        education.push(line);
      }
    });

    return {
      text,
      sections: {
        summary: "",
        skills,
        experience,
        education,
        projects: [],
        certifications: [],
      },
      metadata: {
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        fileType: fileName.split(".").pop() || "txt",
        fileName,
      },
    };
  }

  // Utility methods
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

export default GeminiATSService;
