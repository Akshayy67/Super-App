/**
 * Growth Engine
 * ─────────────
 * Generates hyper-personalized improvement roadmaps using 100% real data.
 * No generic advice — every recommendation is data-backed with measurable targets.
 */

import {
    FullAnalysisReport,
    ScoredMetric,
    KnowledgeGap,
    GrowthPrediction,
} from "./realDataAnalyticsEngine";
import { InterviewPerformanceData } from "./performanceAnalytics";
import { aiService } from "./aiService";

/* ================================================================== */
/*  Roadmap Update Event System                                        */
/* ================================================================== */

export const ROADMAP_UPDATE_EVENT = "superapp:roadmap-update";

export interface RoadmapUpdatePayload {
    trigger: "interview_complete" | "manual_refresh";
    interviewCount: number;
    timestamp: string;
}

/** Fire this after an interview feedback is analyzed to tell the dashboard to refresh */
export function triggerRoadmapUpdate(interviewCount: number, trigger: RoadmapUpdatePayload["trigger"] = "interview_complete"): void {
    const payload: RoadmapUpdatePayload = {
        trigger,
        interviewCount,
        timestamp: new Date().toISOString(),
    };
    window.dispatchEvent(new CustomEvent(ROADMAP_UPDATE_EVENT, { detail: payload }));
    console.log("🗺️ Roadmap update event dispatched:", payload);
}

/** Listen for roadmap update events */
export function onRoadmapUpdate(callback: (payload: RoadmapUpdatePayload) => void): () => void {
    const handler = (e: Event) => {
        const detail = (e as CustomEvent<RoadmapUpdatePayload>).detail;
        callback(detail);
    };
    window.addEventListener(ROADMAP_UPDATE_EVENT, handler);
    return () => window.removeEventListener(ROADMAP_UPDATE_EVENT, handler);
}

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface GrowthTarget {
    metric: string;
    currentValue: number;
    targetValue: number;
    timeframe: string;
    milestones: { value: number; label: string }[];
    actionItems: string[];
    priority: "critical" | "high" | "medium" | "low";
}

export interface PracticeQuestion {
    question: string;
    category: string;
    difficulty: string;
    targetSkill: string;
    rationale: string;
}

export interface SpeakingDrill {
    name: string;
    duration: string;
    description: string;
    targetMetric: string;
    currentValue: string;
    targetValue: string;
    steps: string[];
}

export interface WeeklyPlan {
    weekNumber: number;
    theme: string;
    targets: GrowthTarget[];
    drills: SpeakingDrill[];
    practiceQuestions: PracticeQuestion[];
    estimatedTimeMinutes: number;
}

export interface GrowthRoadmap {
    generatedAt: string;
    overallGoal: string;
    readinessTarget: number;
    currentReadiness: number;
    estimatedWeeksToGoal: number;
    weeklyPlans: WeeklyPlan[];
    topPriorityGaps: KnowledgeGap[];
    growthTargets: GrowthTarget[];
}

/* ================================================================== */
/*  Drill & Question Banks                                             */
/* ================================================================== */

const SPEAKING_DRILLS: Record<string, SpeakingDrill[]> = {
    filler_words: [
        {
            name: "Pause & Replace",
            duration: "5 min",
            description: "Record yourself answering a question. Every time you use a filler word, stop, pause 1 second, then rephrase.",
            targetMetric: "Filler Word %",
            currentValue: "",
            targetValue: "< 5%",
            steps: [
                "Set a timer for 2 minutes",
                "Answer: 'Tell me about a challenging project'",
                "Record yourself with your phone",
                "Listen back and count fillers: um, uh, like, basically, actually",
                "Re-record, replacing each filler with a 1-second pause",
                "Compare the two recordings",
            ],
        },
        {
            name: "Silent Bridge Technique",
            duration: "3 min",
            description: "Practice transitioning between thoughts using silence instead of filler words.",
            targetMetric: "Filler Word %",
            currentValue: "",
            targetValue: "< 5%",
            steps: [
                "Pick any topic (e.g., your favorite project)",
                "Speak for 60 seconds about it",
                "Whenever you feel a filler coming, STOP and breathe",
                "Resume after a 1-second pause",
                "Repeat until the pause feels natural",
            ],
        },
    ],
    confidence: [
        {
            name: "Power Opening",
            duration: "5 min",
            description: "Rehearse the first 30 seconds of 3 different interview answers with strong, declarative openings.",
            targetMetric: "Confidence Score",
            currentValue: "",
            targetValue: "> 75",
            steps: [
                "Write down 3 common questions for your target role",
                "For each, write a strong opening sentence (no hedging: 'I think...', 'Maybe...')",
                "Practice saying each opening 3 times with increasing volume",
                "Record the final version and rate yourself 1-10",
                "Aim for declarative statements: 'I led a team of 5 to ship...'",
            ],
        },
        {
            name: "Volume Calibration",
            duration: "3 min",
            description: "Practice speaking at 3 volume levels to build vocal flexibility and projection.",
            targetMetric: "Confidence Score",
            currentValue: "",
            targetValue: "> 75",
            steps: [
                "Read a paragraph at whisper volume",
                "Read the same paragraph at normal speaking volume",
                "Read it again at 'presenting to 20 people' volume",
                "Notice the difference in how confident each feels",
                "Default to level 2.5 in interviews (slightly above normal)",
            ],
        },
    ],
    structure: [
        {
            name: "STAR Speed Drill",
            duration: "7 min",
            description: "Practice structuring behavioral answers using the STAR framework in under 90 seconds.",
            targetMetric: "STAR Score",
            currentValue: "",
            targetValue: "> 70",
            steps: [
                "Pick a behavioral prompt: 'Tell me about a time you failed'",
                "Set a 90-second timer",
                "Situation: 15 seconds — ONE sentence of context",
                "Task: 10 seconds — What was your specific responsibility?",
                "Action: 45 seconds — 2-3 concrete steps you took",
                "Result: 20 seconds — Quantified outcome + what you learned",
                "Repeat with a new prompt",
            ],
        },
        {
            name: "Bottom-Line Up Front (BLUF)",
            duration: "4 min",
            description: "Practice starting every answer with the conclusion, then backfilling with context.",
            targetMetric: "Answer Structure",
            currentValue: "",
            targetValue: "> 75",
            steps: [
                "Question: 'How do you handle tight deadlines?'",
                "BAD start: 'Well, in my last role, there was this project...'",
                "GOOD start: 'I prioritize ruthlessly — I decompose work and cut scope. For example...'",
                "Practice 3 questions using BLUF format",
                "Record and check: did you answer the question in the first sentence?",
            ],
        },
    ],
    technical: [
        {
            name: "Explain Like I'm Five (ELI5)",
            duration: "5 min",
            description: "Practice explaining technical concepts simply to improve clarity and reduce jargon overload.",
            targetMetric: "Technical Precision + Clarity",
            currentValue: "",
            targetValue: "> 75",
            steps: [
                "Pick a complex concept from your domain (e.g., 'microservices', 'gradient descent')",
                "Explain it in 30 seconds using ZERO jargon",
                "Now explain it in 45 seconds for a technical interviewer, with 2-3 key terms",
                "Compare: did the jargon ADD clarity or REDUCE it?",
                "Practice the 'sandwich': simple hook → technical detail → simple summary",
            ],
        },
    ],
    pace: [
        {
            name: "Metronome Speaking",
            duration: "4 min",
            description: "Use a metronome (or tapping) at 140 BPM to calibrate your speaking pace.",
            targetMetric: "Words Per Minute",
            currentValue: "",
            targetValue: "130-160 WPM",
            steps: [
                "Open a metronome app, set to 140 BPM",
                "Read a passage aloud, hitting roughly 1 word per beat",
                "This is approximately 140 WPM — the ideal interview pace",
                "Speed up to 160 BPM and notice how rushed it feels",
                "Slow down to 120 BPM and notice how deliberate it feels",
                "Practice your interview answers at 140 BPM",
            ],
        },
    ],
};

const PRACTICE_QUESTION_TEMPLATES: Record<string, PracticeQuestion[]> = {
    behavioral: [
        { question: "Describe a situation where you had to deliver results under significant pressure. What was the outcome?", category: "Behavioral", difficulty: "Medium", targetSkill: "Stress Resilience", rationale: "" },
        { question: "Tell me about a time you disagreed with your manager. How did you handle it?", category: "Behavioral", difficulty: "Hard", targetSkill: "Conflict Resolution", rationale: "" },
        { question: "Give an example of a project where you had to learn a new skill quickly. How did you approach it?", category: "Behavioral", difficulty: "Medium", targetSkill: "Adaptability", rationale: "" },
        { question: "Describe a time you received critical feedback. What did you do with it?", category: "Behavioral", difficulty: "Medium", targetSkill: "Growth Mindset", rationale: "" },
        { question: "Tell me about a time you had to convince others to adopt your approach. What was your strategy?", category: "Behavioral", difficulty: "Hard", targetSkill: "Influence", rationale: "" },
    ],
    technical: [
        { question: "Walk me through the architecture of the most complex system you've worked on. What tradeoffs did you make?", category: "Technical", difficulty: "Hard", targetSkill: "System Design", rationale: "" },
        { question: "Explain a performance optimization you implemented. What was the before/after impact?", category: "Technical", difficulty: "Medium", targetSkill: "Optimization", rationale: "" },
        { question: "How do you approach debugging a production issue you've never seen before?", category: "Technical", difficulty: "Medium", targetSkill: "Problem-Solving", rationale: "" },
        { question: "Describe a technical decision you made that had long-term consequences. Would you make the same choice today?", category: "Technical", difficulty: "Hard", targetSkill: "Technical Judgment", rationale: "" },
    ],
    communication: [
        { question: "How would you explain [your most recent project] to a non-technical stakeholder?", category: "Communication", difficulty: "Medium", targetSkill: "Clarity", rationale: "" },
        { question: "Describe a time you had to present bad news to your team or a client. How did you frame it?", category: "Communication", difficulty: "Hard", targetSkill: "Difficult Conversations", rationale: "" },
        { question: "How do you ensure everyone is aligned when working with cross-functional teams?", category: "Communication", difficulty: "Medium", targetSkill: "Cross-functional Communication", rationale: "" },
    ],
};

/* ================================================================== */
/*  Roadmap Generation                                                 */
/* ================================================================== */

function buildGrowthTargets(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): GrowthTarget[] {
    const targets: GrowthTarget[] = [];

    // Target from knowledge gaps
    report.knowledgeGaps.forEach((gap) => {
        const improvement = Math.min(gap.gap, 20); // realistic improvement per cycle
        targets.push({
            metric: gap.category,
            currentValue: gap.averageScore,
            targetValue: Math.min(gap.averageScore + improvement, 100),
            timeframe: gap.severity === "critical" ? "2 weeks" : "4 weeks",
            milestones: [
                { value: gap.averageScore + Math.round(improvement * 0.3), label: "Week 1 checkpoint" },
                { value: gap.averageScore + Math.round(improvement * 0.6), label: "Week 2 checkpoint" },
                { value: gap.averageScore + improvement, label: "Target achieved" },
            ],
            actionItems: gap.recommendedTopics,
            priority: gap.severity === "critical" ? "critical" : gap.severity === "moderate" ? "high" : "medium",
        });
    });

    // Target from transcript analysis
    const filler = report.transcript.fillerWordDensity;
    if (filler.value > 0 && filler.value < 75) {
        targets.push({
            metric: "Filler Word Control",
            currentValue: filler.value,
            targetValue: Math.min(filler.value + 20, 95),
            timeframe: "3 weeks",
            milestones: [
                { value: filler.value + 7, label: "Awareness phase" },
                { value: filler.value + 14, label: "Active replacement" },
                { value: Math.min(filler.value + 20, 95), label: "Natural pausing" },
            ],
            actionItems: [
                "Practice the 'Pause & Replace' drill daily for 5 minutes",
                "Use the Silent Bridge technique in daily conversations",
                "Record and review one mock answer per day",
            ],
            priority: filler.value < 50 ? "high" : "medium",
        });
    }

    const star = report.transcript.starScore;
    if (star.value > 0 && star.value < 60) {
        targets.push({
            metric: "STAR Method Proficiency",
            currentValue: star.value,
            targetValue: Math.min(star.value + 25, 85),
            timeframe: "2 weeks",
            milestones: [
                { value: star.value + 10, label: "Framework memorized" },
                { value: star.value + 18, label: "Applied in practice" },
                { value: Math.min(star.value + 25, 85), label: "Natural integration" },
            ],
            actionItems: [
                "Prepare 5 STAR stories covering: leadership, failure, conflict, innovation, teamwork",
                "Practice each story with the STAR Speed Drill",
                "Record and verify each response has all 4 STAR components",
            ],
            priority: "high",
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    targets.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return targets;
}

function selectDrills(
    report: FullAnalysisReport
): SpeakingDrill[] {
    const drills: SpeakingDrill[] = [];

    // Select drills based on weakest areas
    if (report.transcript.fillerWordDensity.value < 70) {
        drills.push(...SPEAKING_DRILLS.filler_words.map(d => ({
            ...d,
            currentValue: report.transcript.fillerWordDensity.value + "/100",
        })));
    }

    if (report.behavioral.confidenceIndex.value < 70) {
        drills.push(...SPEAKING_DRILLS.confidence.map(d => ({
            ...d,
            currentValue: report.behavioral.confidenceIndex.value + "/100",
        })));
    }

    if (report.transcript.starScore.value < 60) {
        drills.push(...SPEAKING_DRILLS.structure.map(d => ({
            ...d,
            currentValue: report.transcript.starScore.value + "/100",
        })));
    }

    if (report.transcript.technicalPrecision.value < 70) {
        drills.push(...SPEAKING_DRILLS.technical.map(d => ({
            ...d,
            currentValue: report.transcript.technicalPrecision.value + "/100",
        })));
    }

    // Always include pace drill if we have pace data
    if (drills.length < 3) {
        drills.push(...SPEAKING_DRILLS.pace.map(d => ({
            ...d,
            currentValue: "See speech analysis",
        })));
    }

    return drills.slice(0, 6); // Max 6 drills
}

function selectPracticeQuestions(
    report: FullAnalysisReport,
    role: string
): PracticeQuestion[] {
    const questions: PracticeQuestion[] = [];

    // Prioritize weak areas
    const weakCategories = report.knowledgeGaps
        .filter((g) => g.severity !== "minor")
        .map((g) => g.category.toLowerCase());

    if (weakCategories.some((c) => c.includes("behavioral") || c.includes("soft"))) {
        questions.push(...PRACTICE_QUESTION_TEMPLATES.behavioral.map(q => ({
            ...q,
            rationale: "Your behavioral score needs improvement (gap: " + (report.knowledgeGaps.find(g => g.category.toLowerCase().includes("behavioral"))?.gap ?? "?") + " points below benchmark)",
        })));
    }

    if (weakCategories.some((c) => c.includes("technical"))) {
        questions.push(...PRACTICE_QUESTION_TEMPLATES.technical.map(q => ({
            ...q,
            question: q.question.replace("[your most recent project]", "your work as a " + role),
            rationale: "Technical gap detected — practice explaining technical decisions clearly",
        })));
    }

    if (weakCategories.some((c) => c.includes("communication") || c.includes("clarity"))) {
        questions.push(...PRACTICE_QUESTION_TEMPLATES.communication.map(q => ({
            ...q,
            question: q.question.replace("[your most recent project]", "your work as a " + role),
            rationale: "Communication effectiveness below benchmark — practice structured explanations",
        })));
    }

    // If no specific gaps, provide a balanced set
    if (questions.length === 0) {
        questions.push(
            ...PRACTICE_QUESTION_TEMPLATES.behavioral.slice(0, 2).map(q => ({ ...q, rationale: "General behavioral practice" })),
            ...PRACTICE_QUESTION_TEMPLATES.technical.slice(0, 2).map(q => ({ ...q, rationale: "General technical practice" })),
            ...PRACTICE_QUESTION_TEMPLATES.communication.slice(0, 1).map(q => ({
                ...q,
                question: q.question.replace("[your most recent project]", "your work as a " + role),
                rationale: "General communication practice",
            })),
        );
    }

    return questions.slice(0, 8);
}

function buildWeeklyPlans(
    targets: GrowthTarget[],
    drills: SpeakingDrill[],
    questions: PracticeQuestion[]
): WeeklyPlan[] {
    const plans: WeeklyPlan[] = [];
    const totalWeeks = Math.min(4, Math.max(2, targets.length));

    for (let w = 0; w < totalWeeks; w++) {
        const weekTargets = targets.filter((t) => {
            if (t.priority === "critical") return true;
            if (t.priority === "high" && w < 3) return true;
            if (t.priority === "medium" && w >= 1) return true;
            return w >= 2;
        }).slice(0, 3);

        const weekDrills = drills.slice(
            w * 2,
            Math.min((w + 1) * 2, drills.length)
        );
        if (weekDrills.length === 0 && drills.length > 0) {
            weekDrills.push(drills[w % drills.length]);
        }

        const weekQuestions = questions.slice(
            w * 2,
            Math.min((w + 1) * 2, questions.length)
        );

        const themes = [
            "Foundation Building",
            "Targeted Improvement",
            "Integration & Practice",
            "Polish & Readiness",
        ];

        plans.push({
            weekNumber: w + 1,
            theme: themes[w] || "Continued Practice",
            targets: weekTargets,
            drills: weekDrills,
            practiceQuestions: weekQuestions,
            estimatedTimeMinutes: 30 + weekDrills.length * 5 + weekQuestions.length * 10,
        });
    }

    return plans;
}

/* ================================================================== */
/*  Public API                                                         */
/* ================================================================== */

export function generateGrowthRoadmap(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): GrowthRoadmap {
    const primaryRole = history[0]?.role || "General";
    const targets = buildGrowthTargets(report, history);
    const drills = selectDrills(report);
    const questions = selectPracticeQuestions(report, primaryRole);
    const weeklyPlans = buildWeeklyPlans(targets, drills, questions);

    const readinessCurrent = report.readinessIndex.value;
    const readinessTarget = Math.min(readinessCurrent + 20, 90);

    // Estimate weeks to goal from growth predictions
    const overallPred = report.growthPredictions.find(
        (p) => p.metric === "Overall Score"
    );
    const estimatedWeeks = overallPred && overallPred.regressionSlope > 0
        ? Math.ceil((readinessTarget - readinessCurrent) / overallPred.regressionSlope)
        : targets.length > 0 ? 4 : 2;

    return {
        generatedAt: new Date().toISOString(),
        overallGoal:
            "Raise Interview Readiness Index from " +
            readinessCurrent +
            " to " +
            readinessTarget +
            " within " +
            Math.min(estimatedWeeks, 8) +
            " weeks through targeted practice",
        readinessTarget,
        currentReadiness: readinessCurrent,
        estimatedWeeksToGoal: Math.min(estimatedWeeks, 8),
        weeklyPlans,
        topPriorityGaps: report.knowledgeGaps
            .filter((g) => g.severity !== "minor")
            .slice(0, 3),
        growthTargets: targets,
    };
}

export class GrowthEngine {
    private static instance: GrowthEngine;

    static getInstance(): GrowthEngine {
        if (!this.instance) {
            this.instance = new GrowthEngine();
        }
        return this.instance;
    }

    generateRoadmap(
        report: FullAnalysisReport,
        history: InterviewPerformanceData[]
    ): GrowthRoadmap {
        return generateGrowthRoadmap(report, history);
    }
}

/* ================================================================== */
/*  AI-Enhanced Roadmap Generation                                     */
/* ================================================================== */

/**
 * Calls Gemini AI with real performance data to generate a much higher-quality,
 * personalized roadmap. Falls back to rule-based generation if AI fails.
 */
export async function generateAIEnhancedRoadmap(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): Promise<GrowthRoadmap> {
    // Always generate the rule-based roadmap as baseline/fallback
    const baseRoadmap = generateGrowthRoadmap(report, history);

    try {
        const primaryRole = history[0]?.role || "General";
        const latestInterview = history[0];

        // Build a compact data summary for the AI prompt
        const dataSummary = {
            role: primaryRole,
            totalInterviews: history.length,
            latestScores: latestInterview ? {
                overall: latestInterview.overallScore,
                technical: latestInterview.technicalScore,
                communication: latestInterview.communicationScore,
                behavioral: latestInterview.behavioralScore,
            } : null,
            readinessIndex: report.readinessIndex.value,
            knowledgeGaps: report.knowledgeGaps.map(g => ({
                category: g.category,
                gap: g.gap,
                severity: g.severity,
                trend: g.trend,
            })),
            transcript: {
                starScore: report.transcript.starScore.value,
                fillerWordControl: report.transcript.fillerWordDensity.value,
                semanticDepth: report.transcript.semanticDepth.value,
                avgResponseLength: report.transcript.averageResponseLength.value,
                weakPatterns: report.transcript.weakAnswerPatterns,
                strongPatterns: report.transcript.strongAnswerPatterns,
            },
            behavioral: {
                confidence: report.behavioral.confidenceIndex.value,
                engagement: report.behavioral.engagementTrajectory.value,
                stressResilience: report.behavioral.stressResilience.value,
                adaptability: report.behavioral.adaptability.value,
            },
            currentTargets: baseRoadmap.growthTargets.map(t => ({
                metric: t.metric,
                current: t.currentValue,
                target: t.targetValue,
                priority: t.priority,
            })),
        };

        const prompt = `You are an elite interview coach who has trained 10,000+ candidates for FAANG, top startups, and Fortune 500 companies. Generate a hyper-personalized 4-week growth roadmap for this candidate.

CANDIDATE DATA (100% real — from their actual interviews):
${JSON.stringify(dataSummary, null, 2)}

Based on this REAL data, create a detailed growth roadmap. Be specific — reference their actual scores, not generic advice. Every recommendation must tie back to a measurable weak point.

RULES:
1. Focus on their WEAKEST areas first (below 60 = critical, 60-75 = high priority)
2. Each drill must be a concrete exercise they can do TODAY, not vague advice
3. Practice questions must be calibrated to their role (${primaryRole}) and difficulty gaps
4. Each week should build on the previous — progressive difficulty
5. Include specific target scores they should aim for

Respond with ONLY valid JSON matching this exact structure:
{
  "overallGoal": "<one-line goal referencing their readiness index and target>",
  "estimatedWeeksToGoal": <number 2-6>,
  "weeklyPlans": [
    {
      "weekNumber": 1,
      "theme": "<specific theme based on their gaps>",
      "estimatedTimeMinutes": <number>,
      "drills": [
        {
          "name": "<specific drill name>",
          "duration": "<e.g., 5 min>",
          "description": "<detailed description>",
          "targetMetric": "<what metric this improves>",
          "currentValue": "<their current score>",
          "targetValue": "<target to aim for>",
          "steps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>", "<step 5>"]
        }
      ],
      "practiceQuestions": [
        {
          "question": "<specific interview question>",
          "category": "<behavioral/technical/communication>",
          "difficulty": "<easy/medium/hard>",
          "targetSkill": "<what skill this practices>",
          "rationale": "<why this question based on their data>"
        }
      ]
    }
  ],
  "growthTargets": [
    {
      "metric": "<metric name>",
      "currentValue": <number>,
      "targetValue": <number>,
      "timeframe": "<e.g., 2 weeks>",
      "priority": "<critical/high/medium/low>",
      "actionItems": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
      "milestones": [
        {"value": <number>, "label": "<milestone description>"}
      ]
    }
  ]
}

Generate 4 weekly plans with 2-3 drills and 2-3 practice questions each. Generate 3-5 growth targets based on their weakest areas.
DO NOT include any text outside the JSON. No markdown, no explanation.`;

        const response = await aiService.generateResponse(prompt, "interview");
        const rawText = typeof response === "string" ? response : (response as { data?: string })?.data || "";
        const cleanedResponse = rawText.replace(/```json\n?|\n?```/g, "").trim();
        const aiRoadmap = JSON.parse(cleanedResponse);

        // Merge AI response into a valid GrowthRoadmap
        const merged: GrowthRoadmap = {
            generatedAt: new Date().toISOString(),
            overallGoal: aiRoadmap.overallGoal || baseRoadmap.overallGoal,
            readinessTarget: baseRoadmap.readinessTarget,
            currentReadiness: baseRoadmap.currentReadiness,
            estimatedWeeksToGoal: aiRoadmap.estimatedWeeksToGoal || baseRoadmap.estimatedWeeksToGoal,
            topPriorityGaps: baseRoadmap.topPriorityGaps,
            weeklyPlans: (aiRoadmap.weeklyPlans || []).map((wp: {
                weekNumber?: number;
                theme?: string;
                estimatedTimeMinutes?: number;
                drills?: SpeakingDrill[];
                practiceQuestions?: PracticeQuestion[];
                targets?: GrowthTarget[];
            }, i: number) => ({
                weekNumber: wp.weekNumber || i + 1,
                theme: wp.theme || "Week " + (i + 1),
                estimatedTimeMinutes: wp.estimatedTimeMinutes || 45,
                drills: (wp.drills || []).map((d: Partial<SpeakingDrill>) => ({
                    name: d.name || "Practice Drill",
                    duration: d.duration || "5 min",
                    description: d.description || "",
                    targetMetric: d.targetMetric || "",
                    currentValue: String(d.currentValue || ""),
                    targetValue: String(d.targetValue || ""),
                    steps: d.steps || [],
                })),
                practiceQuestions: (wp.practiceQuestions || []).map((q: Partial<PracticeQuestion>) => ({
                    question: q.question || "",
                    category: q.category || "general",
                    difficulty: q.difficulty || "medium",
                    targetSkill: q.targetSkill || "",
                    rationale: q.rationale || "",
                })),
                targets: wp.targets || [],
            })),
            growthTargets: (aiRoadmap.growthTargets || baseRoadmap.growthTargets).map(
                (t: Partial<GrowthTarget>) => ({
                    metric: t.metric || "Unknown",
                    currentValue: t.currentValue ?? 0,
                    targetValue: t.targetValue ?? 80,
                    timeframe: t.timeframe || "4 weeks",
                    priority: t.priority || "medium",
                    actionItems: t.actionItems || [],
                    milestones: t.milestones || [],
                })
            ),
        };

        // Fallback: if AI returned empty plans, use base
        if (merged.weeklyPlans.length === 0) {
            merged.weeklyPlans = baseRoadmap.weeklyPlans;
        }
        if (merged.growthTargets.length === 0) {
            merged.growthTargets = baseRoadmap.growthTargets;
        }

        console.log("🤖 AI-enhanced roadmap generated successfully");
        return merged;

    } catch (error) {
        console.warn("⚠️ AI roadmap generation failed, using rule-based fallback:", error);
        return baseRoadmap;
    }
}

/* ================================================================== */
/*  Roadmap Diff / Merge System                                        */
/* ================================================================== */

const ROADMAP_STORAGE_KEY = "superapp_accepted_roadmap";

export type ChangeType = "improved" | "degraded" | "new" | "removed" | "unchanged";

export interface TargetDiff {
    metric: string;
    changeType: ChangeType;
    oldTarget?: GrowthTarget;
    newTarget?: GrowthTarget;
    deltaCurrentValue: number;   // +ve = improved, -ve = degraded
    deltaTargetValue: number;
    summary: string;             // Human-readable description of the change
    resolution: "pending" | "accept" | "reject" | "keep_both";
}

export interface RoadmapDiff {
    hasChanges: boolean;
    overallStatus: "improved" | "mixed" | "degraded" | "no_change";
    headline: string;
    improvedCount: number;
    degradedCount: number;
    newCount: number;
    removedCount: number;
    targetDiffs: TargetDiff[];
    oldRoadmap: GrowthRoadmap;
    newRoadmap: GrowthRoadmap;
    interviewsSinceLastUpdate: number;
}

/** Save accepted roadmap to localStorage */
export function saveAcceptedRoadmap(roadmap: GrowthRoadmap, interviewCount: number): void {
    try {
        const payload = {
            roadmap,
            interviewCount,
            acceptedAt: new Date().toISOString(),
        };
        localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn("Failed to save roadmap:", e);
    }
}

/** Load previously accepted roadmap from localStorage */
export function loadAcceptedRoadmap(): {
    roadmap: GrowthRoadmap;
    interviewCount: number;
    acceptedAt: string;
} | null {
    try {
        const raw = localStorage.getItem(ROADMAP_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/** Clear stored roadmap */
export function clearAcceptedRoadmap(): void {
    try {
        localStorage.removeItem(ROADMAP_STORAGE_KEY);
    } catch (e) {
        console.warn("Failed to clear roadmap:", e);
    }
}

/** Compute the diff between old (accepted) and new (generated) roadmap */
export function computeRoadmapDiff(
    oldRoadmap: GrowthRoadmap,
    newRoadmap: GrowthRoadmap,
    interviewsSinceLastUpdate: number
): RoadmapDiff {
    const targetDiffs: TargetDiff[] = [];
    const oldTargetMap = new Map(oldRoadmap.growthTargets.map(t => [t.metric, t]));
    const newTargetMap = new Map(newRoadmap.growthTargets.map(t => [t.metric, t]));
    const allMetrics = new Set([...oldTargetMap.keys(), ...newTargetMap.keys()]);

    allMetrics.forEach(metric => {
        const oldT = oldTargetMap.get(metric);
        const newT = newTargetMap.get(metric);

        if (oldT && newT) {
            // Metric exists in both — compare
            const deltaCurrent = newT.currentValue - oldT.currentValue;
            const deltaTarget = newT.targetValue - oldT.targetValue;
            const isImproved = deltaCurrent > 2;
            const isDegraded = deltaCurrent < -2;
            const isUnchanged = Math.abs(deltaCurrent) <= 2 && Math.abs(deltaTarget) <= 2;

            let changeType: ChangeType;
            let summary: string;

            if (isUnchanged) {
                changeType = "unchanged";
                summary = metric + " remains stable (" + oldT.currentValue + " → " + newT.currentValue + ")";
            } else if (isImproved) {
                changeType = "improved";
                summary = metric + " improved by +" + deltaCurrent.toFixed(0) + " points (" + oldT.currentValue + " → " + newT.currentValue + "). Target adjusted: " + oldT.targetValue + " → " + newT.targetValue;
            } else if (isDegraded) {
                changeType = "degraded";
                summary = metric + " dropped by " + deltaCurrent.toFixed(0) + " points (" + oldT.currentValue + " → " + newT.currentValue + "). New focus areas added.";
            } else {
                changeType = "unchanged";
                summary = metric + " stable with minor shift (" + oldT.currentValue + " → " + newT.currentValue + ")";
            }

            targetDiffs.push({
                metric,
                changeType,
                oldTarget: oldT,
                newTarget: newT,
                deltaCurrentValue: Math.round(deltaCurrent),
                deltaTargetValue: Math.round(deltaTarget),
                summary,
                resolution: changeType === "unchanged" ? "accept" : "pending",
            });
        } else if (newT && !oldT) {
            // New target identified
            targetDiffs.push({
                metric,
                changeType: "new",
                newTarget: newT,
                deltaCurrentValue: 0,
                deltaTargetValue: 0,
                summary: "New gap detected: " + metric + " (score: " + newT.currentValue + ", target: " + newT.targetValue + ", priority: " + newT.priority + ")",
                resolution: "pending",
            });
        } else if (oldT && !newT) {
            // Target resolved / no longer needed
            targetDiffs.push({
                metric,
                changeType: "removed",
                oldTarget: oldT,
                deltaCurrentValue: 0,
                deltaTargetValue: 0,
                summary: metric + " no longer flagged as a gap — target may have been achieved!",
                resolution: "pending",
            });
        }
    });

    // Sort: degraded first, then new, then improved, then removed, then unchanged
    const sortOrder: Record<ChangeType, number> = {
        degraded: 0,
        new: 1,
        improved: 2,
        removed: 3,
        unchanged: 4
    };
    targetDiffs.sort((a, b) => sortOrder[a.changeType] - sortOrder[b.changeType]);

    const improvedCount = targetDiffs.filter(d => d.changeType === "improved").length;
    const degradedCount = targetDiffs.filter(d => d.changeType === "degraded").length;
    const newCount = targetDiffs.filter(d => d.changeType === "new").length;
    const removedCount = targetDiffs.filter(d => d.changeType === "removed").length;
    const hasChanges = targetDiffs.some(d => d.changeType !== "unchanged");

    let overallStatus: RoadmapDiff["overallStatus"];
    if (!hasChanges) overallStatus = "no_change";
    else if (degradedCount === 0 && improvedCount > 0) overallStatus = "improved";
    else if (improvedCount === 0 && degradedCount > 0) overallStatus = "degraded";
    else overallStatus = "mixed";

    let headline: string;
    if (!hasChanges) {
        headline = "No significant changes since last update.";
    } else if (overallStatus === "improved") {
        headline = "Great progress! " + improvedCount + " area" + (improvedCount !== 1 ? "s" : "") + " improved since your last " + interviewsSinceLastUpdate + " interview" + (interviewsSinceLastUpdate !== 1 ? "s" : "") + ".";
    } else if (overallStatus === "degraded") {
        headline = "Heads up — " + degradedCount + " area" + (degradedCount !== 1 ? "s" : "") + " need" + (degradedCount === 1 ? "s" : "") + " more focus. Let's update your plan.";
    } else {
        headline = "Mixed results: " + improvedCount + " improved, " + degradedCount + " need" + (degradedCount === 1 ? "s" : "") + " attention. Review the changes below.";
    }

    return {
        hasChanges,
        overallStatus,
        headline,
        improvedCount,
        degradedCount,
        newCount,
        removedCount,
        targetDiffs,
        oldRoadmap,
        newRoadmap,
        interviewsSinceLastUpdate,
    };
}

/** Apply user resolutions to produce a merged roadmap */
export function applyMergeResolutions(diff: RoadmapDiff): GrowthRoadmap {
    const mergedTargets: GrowthTarget[] = [];

    diff.targetDiffs.forEach(td => {
        switch (td.resolution) {
            case "accept":
                // Use the new target (or remove if removed)
                if (td.newTarget) mergedTargets.push(td.newTarget);
                // If removed + accepted, don't add anything
                break;
            case "reject":
                // Keep the old target (or ignore if new)
                if (td.oldTarget) mergedTargets.push(td.oldTarget);
                // If new + rejected, don't add
                break;
            case "keep_both":
                // Keep both old and new
                if (td.oldTarget) mergedTargets.push({ ...td.oldTarget, metric: td.oldTarget.metric + " (previous)" });
                if (td.newTarget) mergedTargets.push(td.newTarget);
                break;
            case "pending":
                // Default: accept new if available, else keep old
                if (td.newTarget) mergedTargets.push(td.newTarget);
                else if (td.oldTarget) mergedTargets.push(td.oldTarget);
                break;
        }
    });

    // Use the new roadmap as base, but replace growthTargets with merged ones
    return {
        ...diff.newRoadmap,
        growthTargets: mergedTargets,
        generatedAt: new Date().toISOString(),
    };
}
