import express from "express";
import multer from "multer";
import { z } from "zod";
import { FileParserService } from "../services/fileParser.js";
import { NLPService } from "../services/nlpService.js";
import { ValidationError } from "../middleware/errorHandler.js";
import { optionalAuth, AuthenticatedRequest } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Validation schemas
const parseTextSchema = z.object({
  text: z
    .string()
    .min(10, "Text must be at least 10 characters")
    .max(50000, "Text too long"),
  type: z.enum(["resume", "job_description"]),
});

// POST /api/parse/resume - Parse resume from file upload
router.post(
  "/resume",
  optionalAuth,
  upload.single("resume"),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        throw new ValidationError("No file uploaded");
      }

      // Validate file
      FileParserService.validateFileSize(req.file.size);
      FileParserService.validateFileName(req.file.originalname);

      // Parse file
      const parsed = await FileParserService.parseFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Extract resume sections
      const sections = NLPService.extractResumeSections(parsed.text);

      res.json({
        success: true,
        data: {
          text: parsed.text,
          sections,
          metadata: parsed.metadata,
        },
      });
    } catch (error) {
      console.error("Resume parsing error:", error);
      throw error;
    }
  }
);

// POST /api/parse/resume-text - Parse resume from text input
router.post(
  "/resume-text",
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { text } = parseTextSchema.parse(req.body);

      // Extract resume sections
      const sections = NLPService.extractResumeSections(text);

      res.json({
        success: true,
        data: {
          text,
          sections,
          metadata: {
            wordCount: text.split(/\s+/).length,
            characterCount: text.length,
            fileType: "text/plain",
            fileName: "pasted-text",
          },
        },
      });
    } catch (error) {
      console.error("Resume text parsing error:", error);
      throw error;
    }
  }
);

// POST /api/parse/job-description - Parse job description
router.post(
  "/job-description",
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { text } = parseTextSchema.parse(req.body);

      // Extract job requirements
      const requirements = NLPService.extractRequirements(text);

      res.json({
        success: true,
        data: {
          text,
          requirements: requirements.hardRequirements,
          skillsRequired: requirements.skillsRequired,
          niceToHave: requirements.niceToHave,
          experienceYears: requirements.experienceYears,
          metadata: {
            wordCount: text.split(/\s+/).length,
            characterCount: text.length,
            requirementsCount: requirements.hardRequirements.length,
            skillsCount: requirements.skillsRequired.length,
          },
        },
      });
    } catch (error) {
      console.error("Job description parsing error:", error);
      throw error;
    }
  }
);

// POST /api/parse/jd-file - Parse job description from file
router.post(
  "/jd-file",
  optionalAuth,
  upload.single("jobDescription"),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        throw new ValidationError("No file uploaded");
      }

      // Validate file
      FileParserService.validateFileSize(req.file.size);
      FileParserService.validateFileName(req.file.originalname);

      // Parse file
      const parsed = await FileParserService.parseFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Extract job requirements
      const requirements = NLPService.extractRequirements(parsed.text);

      res.json({
        success: true,
        data: {
          text: parsed.text,
          requirements: requirements.hardRequirements,
          skillsRequired: requirements.skillsRequired,
          niceToHave: requirements.niceToHave,
          experienceYears: requirements.experienceYears,
          metadata: {
            ...parsed.metadata,
            requirementsCount: requirements.hardRequirements.length,
            skillsCount: requirements.skillsRequired.length,
          },
        },
      });
    } catch (error) {
      console.error("Job description file parsing error:", error);
      throw error;
    }
  }
);

// GET /api/parse/supported-formats - Get supported file formats
router.get("/supported-formats", (req, res) => {
  res.json({
    success: true,
    data: {
      formats: [
        {
          type: "PDF",
          mimeType: "application/pdf",
          extensions: [".pdf"],
          description: "Portable Document Format",
        },
        {
          type: "DOCX",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          extensions: [".docx"],
          description: "Microsoft Word Document",
        },
        {
          type: "TXT",
          mimeType: "text/plain",
          extensions: [".txt"],
          description: "Plain Text File",
        },
      ],
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
      maxFileSizeMB: Math.round(
        parseInt(process.env.MAX_FILE_SIZE || "5242880") / 1024 / 1024
      ),
    },
  });
});

export default router;
