import express from "express";
import { z } from "zod";
import { ScoringService } from "../services/scoringService.js";
import { db } from "../services/database.js";
import { optionalAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { ValidationError } from "../middleware/errorHandler.js";

const router = express.Router();

// Validation schemas
const scoreRequestSchema = z.object({
  resume: z.object({
    text: z.string().min(10, "Resume text too short"),
    id: z.string().optional(),
  }),
  jobDescription: z.object({
    text: z.string().min(10, "Job description text too short"),
    id: z.string().optional(),
  }),
  includeDebug: z.boolean().optional().default(false),
});

const bulkScoreSchema = z.object({
  resumes: z
    .array(
      z.object({
        text: z.string().min(10),
        id: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .max(5, "Maximum 5 resumes per request"),
  jobDescription: z.object({
    text: z.string().min(10),
    id: z.string().optional(),
  }),
});

const suggestBulletsSchema = z.object({
  resumeSectionText: z.string().min(10, "Section text too short"),
  targetKeywords: z
    .array(z.string())
    .min(1, "At least one keyword required")
    .max(10, "Maximum 10 keywords"),
  experienceLevel: z.enum(["entry", "mid", "senior"]).optional().default("mid"),
});

// POST /api/score - Generate ATS score
router.post("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { resume, jobDescription, includeDebug } = scoreRequestSchema.parse(
      req.body
    );

    console.log("📊 Scoring request:", {
      userId: req.user?.id,
      resumeLength: resume.text.length,
      jdLength: jobDescription.text.length,
      includeDebug,
    });

    // Generate score
    const scoreResult = await ScoringService.scoreResume(
      resume.text,
      jobDescription.text,
      includeDebug
    );

    // Save score run if user is authenticated
    let scoreRunId: string | undefined;
    if (req.user) {
      try {
        // Save or get resume
        let resumeRecord;
        if (resume.id) {
          resumeRecord = await db.resume.findUnique({
            where: { id: resume.id },
          });
        }

        if (!resumeRecord) {
          resumeRecord = await db.resume.create({
            data: {
              userId: req.user.id,
              title: "Uploaded Resume",
              originalName: "resume.txt",
              text: resume.text,
              parsedJson: JSON.stringify({}),
            },
          });
        }

        // Save or get job description
        let jobDescRecord;
        if (jobDescription.id) {
          jobDescRecord = await db.jobDesc.findUnique({
            where: { id: jobDescription.id },
          });
        }

        if (!jobDescRecord) {
          jobDescRecord = await db.jobDesc.create({
            data: {
              userId: req.user.id,
              title: "Job Description",
              text: jobDescription.text,
              parsedJson: JSON.stringify({}),
            },
          });
        }

        // Save score run
        const scoreRun = await db.scoreRun.create({
          data: {
            userId: req.user.id,
            resumeId: resumeRecord.id,
            jobDescId: jobDescRecord.id,
            overall: scoreResult.overall,
            sectionJson: JSON.stringify(scoreResult.sections),
            gapsJson: JSON.stringify({
              missingKeywords: scoreResult.missingKeywords,
              gates: scoreResult.gates,
            }),
            suggestionsJson: JSON.stringify(scoreResult.suggestions),
            modelVersion: "1.0",
          },
        });

        scoreRunId = scoreRun.id;
        console.log("✅ Score run saved:", scoreRunId);
      } catch (dbError) {
        console.error("❌ Failed to save score run:", dbError);
        // Continue without saving - don't fail the request
      }
    }

    res.json({
      success: true,
      data: {
        ...scoreResult,
        scoreRunId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Scoring error:", error);
    throw error;
  }
});

// POST /api/score/bulk - Score multiple resumes against one job description
router.post("/bulk", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { resumes, jobDescription } = bulkScoreSchema.parse(req.body);

    console.log("📊 Bulk scoring request:", {
      userId: req.user?.id,
      resumeCount: resumes.length,
      jdLength: jobDescription.text.length,
    });

    const results = await Promise.all(
      resumes.map(async (resume, index) => {
        try {
          const scoreResult = await ScoringService.scoreResume(
            resume.text,
            jobDescription.text,
            false // No debug for bulk requests
          );

          return {
            resumeIndex: index,
            resumeTitle: resume.title || `Resume ${index + 1}`,
            success: true,
            score: scoreResult,
          };
        } catch (error) {
          console.error(`Error scoring resume ${index}:`, error);
          return {
            resumeIndex: index,
            resumeTitle: resume.title || `Resume ${index + 1}`,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // Calculate summary statistics
    const successfulResults = results.filter((r) => r.success);
    const scores = successfulResults.map((r) => r.score!.overall);

    const summary = {
      totalResumes: resumes.length,
      successfulScores: successfulResults.length,
      averageScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    };

    res.json({
      success: true,
      data: {
        results,
        summary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Bulk scoring error:", error);
    throw error;
  }
});

// POST /api/score/suggest-bullets - Generate bullet point suggestions
router.post(
  "/suggest-bullets",
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { resumeSectionText, targetKeywords, experienceLevel } =
        suggestBulletsSchema.parse(req.body);

      // Generate bullet suggestions based on keywords and experience level
      const bullets = generateBulletSuggestions(
        resumeSectionText,
        targetKeywords,
        experienceLevel
      );

      res.json({
        success: true,
        data: {
          bullets,
          targetKeywords,
          experienceLevel,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Bullet suggestion error:", error);
      throw error;
    }
  }
);

// GET /api/score/weights - Get current scoring weights
router.get("/weights", async (req, res) => {
  try {
    const config = await db.config.findUnique({
      where: { key: "scoring_weights" },
    });

    const weights = config
      ? JSON.parse(config.jsonValue)
      : {
          skills: 0.4,
          experience: 0.35,
          education: 0.1,
          keywords: 0.15,
        };

    res.json({
      success: true,
      data: { weights },
    });
  } catch (error) {
    console.error("Error fetching weights:", error);
    throw error;
  }
});

// Helper function to generate bullet suggestions
function generateBulletSuggestions(
  sectionText: string,
  keywords: string[],
  experienceLevel: string
): string[] {
  const bullets: string[] = [];

  // Action verbs by experience level
  const actionVerbs = {
    entry: [
      "Assisted",
      "Supported",
      "Contributed",
      "Participated",
      "Learned",
      "Developed",
    ],
    mid: [
      "Led",
      "Managed",
      "Implemented",
      "Designed",
      "Optimized",
      "Delivered",
    ],
    senior: [
      "Architected",
      "Spearheaded",
      "Transformed",
      "Established",
      "Mentored",
      "Strategized",
    ],
  };

  const verbs =
    actionVerbs[experienceLevel as keyof typeof actionVerbs] || actionVerbs.mid;

  // Generate bullets incorporating keywords
  keywords.forEach((keyword, index) => {
    if (index < 3) {
      // Limit to 3 suggestions per request
      const verb = verbs[index % verbs.length];
      const metrics = generateMetrics(experienceLevel);

      bullets.push(
        `• ${verb} ${keyword}-based solutions that ${metrics.achievement}, resulting in ${metrics.impact}`
      );
    }
  });

  // Add general improvement bullets
  if (bullets.length < 3) {
    bullets.push(
      `• ${verbs[0]} cross-functional team initiatives that improved system performance by 25%`,
      `• ${verbs[1]} automated testing processes, reducing deployment time by 40%`
    );
  }

  return bullets.slice(0, 5); // Return max 5 bullets
}

function generateMetrics(experienceLevel: string): {
  achievement: string;
  impact: string;
} {
  const achievements = {
    entry: [
      "improved code quality",
      "enhanced user experience",
      "streamlined processes",
    ],
    mid: [
      "increased system efficiency",
      "reduced processing time",
      "enhanced scalability",
    ],
    senior: [
      "transformed architecture",
      "established best practices",
      "drove innovation",
    ],
  };

  const impacts = {
    entry: [
      "15% improvement in performance",
      "20% reduction in bugs",
      "10% faster load times",
    ],
    mid: [
      "30% increase in throughput",
      "25% cost reduction",
      "40% faster deployment",
    ],
    senior: [
      "50% improvement in scalability",
      "60% reduction in downtime",
      "45% increase in team productivity",
    ],
  };

  const levelAchievements =
    achievements[experienceLevel as keyof typeof achievements] ||
    achievements.mid;
  const levelImpacts =
    impacts[experienceLevel as keyof typeof impacts] || impacts.mid;

  return {
    achievement:
      levelAchievements[Math.floor(Math.random() * levelAchievements.length)],
    impact: levelImpacts[Math.floor(Math.random() * levelImpacts.length)],
  };
}

export default router;
