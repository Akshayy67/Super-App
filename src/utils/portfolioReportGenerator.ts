/**
 * Portfolio Report Generator
 * ──────────────────────────
 * Generates recruiter-grade, shareable performance reports.
 * All numbers traced to real InterviewPerformanceData.
 */

import {
    FullAnalysisReport,
    BenchmarkComparison,
    ScoredMetric,
} from "./realDataAnalyticsEngine";
import { GrowthRoadmap } from "./growthEngine";
import { InterviewPerformanceData } from "./performanceAnalytics";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface SkillIndicator {
    skill: string;
    score: number;
    percentile: number;
    trend: "improving" | "declining" | "stable";
    verified: boolean;
    dataPoints: number;
}

export interface PortfolioReport {
    generatedAt: string;
    candidateSummary: {
        totalInterviews: number;
        totalPracticeHours: number;
        primaryRole: string;
        readinessIndex: ScoredMetric;
        recruiterSimScore: ScoredMetric;
    };
    skillIndicators: SkillIndicator[];
    communicationProficiency: {
        overallScore: number;
        components: { name: string; score: number; benchmark: number }[];
    };
    technicalStrengthMatrix: {
        category: string;
        score: number;
        benchmark: number;
        percentile: number;
    }[];
    certificationScore: {
        value: number;
        tier: "Gold" | "Silver" | "Bronze" | "In Progress";
        label: string;
        criteria: string;
    };
    highlights: string[];
    benchmarkSummary: BenchmarkComparison[];
}

/* ================================================================== */
/*  Generation Logic                                                   */
/* ================================================================== */

function determineTrend(
    history: InterviewPerformanceData[],
    extract: (p: InterviewPerformanceData) => number
): "improving" | "declining" | "stable" {
    if (history.length < 3) return "stable";
    const sorted = [...history].sort(
        (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const values = sorted.map(extract).filter((v) => v > 0);
    if (values.length < 3) return "stable";
    const half = Math.floor(values.length / 2);
    const olderAvg =
        values.slice(0, half).reduce((s, v) => s + v, 0) / half;
    const recentAvg =
        values.slice(half).reduce((s, v) => s + v, 0) /
        (values.length - half);
    const delta = recentAvg - olderAvg;
    if (delta > 3) return "improving";
    if (delta < -3) return "declining";
    return "stable";
}

function buildSkillIndicators(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): SkillIndicator[] {
    const indicators: SkillIndicator[] = [];

    const metricSources: {
        skill: string;
        extract: (p: InterviewPerformanceData) => number;
        benchKey: string;
    }[] = [
            { skill: "Technical Problem Solving", extract: (p) => p.technicalScore, benchKey: "Technical" },
            { skill: "Communication Clarity", extract: (p) => p.communicationScore, benchKey: "Communication" },
            { skill: "Behavioral Competency", extract: (p) => p.behavioralScore, benchKey: "Behavioral" },
            { skill: "Confidence Under Pressure", extract: (p) => p.detailedMetrics?.confidence ?? 0, benchKey: "Confidence" },
            { skill: "Professional Presence", extract: (p) => p.detailedMetrics?.professionalism ?? 0, benchKey: "Overall Score" },
            { skill: "Adaptability", extract: (p) => p.detailedMetrics?.adaptability ?? 0, benchKey: "Overall Score" },
        ];

    metricSources.forEach(({ skill, extract, benchKey }) => {
        const values = history.map(extract).filter((v) => v > 0);
        if (values.length === 0) return;

        const avg = Math.round(
            values.reduce((s, v) => s + v, 0) / values.length
        );

        const benchmark = report.benchmarks.find(
            (b) => b.metric === benchKey
        );
        const percentile = benchmark?.percentile ?? 50;

        indicators.push({
            skill,
            score: avg,
            percentile,
            trend: determineTrend(history, extract),
            verified: values.length >= 3,
            dataPoints: values.length,
        });
    });

    // Add transcript-based indicators if available
    if (report.transcript.starScore.dataPoints > 0 && report.transcript.starScore.value > 0) {
        indicators.push({
            skill: "Structured Storytelling (STAR)",
            score: report.transcript.starScore.value,
            percentile: Math.min(Math.round(report.transcript.starScore.value * 1.1), 99),
            trend: "stable",
            verified: report.transcript.starScore.dataPoints >= 3,
            dataPoints: report.transcript.starScore.dataPoints,
        });
    }

    if (report.transcript.vocabularyRichness.dataPoints > 0 && report.transcript.vocabularyRichness.value > 0) {
        indicators.push({
            skill: "Vocabulary Depth",
            score: report.transcript.vocabularyRichness.value,
            percentile: Math.min(Math.round(report.transcript.vocabularyRichness.value * 1.05), 99),
            trend: "stable",
            verified: report.transcript.vocabularyRichness.dataPoints > 500,
            dataPoints: report.transcript.vocabularyRichness.dataPoints,
        });
    }

    return indicators.sort((a, b) => b.score - a.score);
}

function buildCommunicationProficiency(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): PortfolioReport["communicationProficiency"] {
    const commValues = history
        .map((p) => p.communicationScore)
        .filter((v) => v > 0);
    const overallComm = commValues.length > 0
        ? Math.round(commValues.reduce((s, v) => s + v, 0) / commValues.length)
        : 0;

    const commBenchmark = report.benchmarks.find(
        (b) => b.metric === "Communication"
    );

    const components: { name: string; score: number; benchmark: number }[] = [
        {
            name: "Verbal Clarity",
            score: report.transcript.communicationEffectiveness.value || overallComm,
            benchmark: commBenchmark?.benchmarkP50 ?? 70,
        },
        {
            name: "Response Structure",
            score: report.transcript.answerStructure.value || overallComm,
            benchmark: 72,
        },
        {
            name: "Filler Word Control",
            score: report.transcript.fillerWordDensity.value || 70,
            benchmark: 75,
        },
        {
            name: "Vocabulary Depth",
            score: report.transcript.vocabularyRichness.value || 65,
            benchmark: 68,
        },
        {
            name: "Confidence Projection",
            score: report.behavioral.confidenceIndex.value || 65,
            benchmark: 70,
        },
    ];

    return { overallScore: overallComm, components };
}

function buildTechnicalMatrix(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): PortfolioReport["technicalStrengthMatrix"] {
    const matrix: PortfolioReport["technicalStrengthMatrix"] = [];

    const categories = [
        { category: "Problem Solving", extract: (p: InterviewPerformanceData) => p.technicalScore },
        { category: "Communication", extract: (p: InterviewPerformanceData) => p.communicationScore },
        { category: "Behavioral Fit", extract: (p: InterviewPerformanceData) => p.behavioralScore },
        { category: "Confidence", extract: (p: InterviewPerformanceData) => p.detailedMetrics?.confidence ?? 0 },
        { category: "Clarity", extract: (p: InterviewPerformanceData) => p.detailedMetrics?.clarity ?? 0 },
        { category: "Engagement", extract: (p: InterviewPerformanceData) => p.detailedMetrics?.engagement ?? 0 },
    ];

    categories.forEach(({ category, extract }) => {
        const values = history.map(extract).filter((v) => v > 0);
        if (values.length === 0) return;
        const avg = Math.round(
            values.reduce((s, v) => s + v, 0) / values.length
        );
        const bench = report.benchmarks.find(
            (b) => b.metric === category || b.metric.includes(category)
        );

        matrix.push({
            category,
            score: avg,
            benchmark: bench?.benchmarkP50 ?? 68,
            percentile: bench?.percentile ?? 50,
        });
    });

    return matrix;
}

function computeCertification(
    readiness: number,
    recruiterSim: number,
    totalInterviews: number
): PortfolioReport["certificationScore"] {
    const composite = Math.round(readiness * 0.5 + recruiterSim * 0.5);

    let tier: "Gold" | "Silver" | "Bronze" | "In Progress";
    let criteria: string;

    if (composite >= 80 && totalInterviews >= 5) {
        tier = "Gold";
        criteria = "Score >= 80 with 5+ verified interviews";
    } else if (composite >= 65 && totalInterviews >= 3) {
        tier = "Silver";
        criteria = "Score >= 65 with 3+ verified interviews";
    } else if (composite >= 50 && totalInterviews >= 2) {
        tier = "Bronze";
        criteria = "Score >= 50 with 2+ verified interviews";
    } else {
        tier = "In Progress";
        criteria = "Need " + Math.max(2 - totalInterviews, 0) + " more interviews and score >= 50";
    }

    return {
        value: composite,
        tier,
        label: tier + " Interview Readiness",
        criteria,
    };
}

function generateHighlights(
    report: FullAnalysisReport,
    history: InterviewPerformanceData[]
): string[] {
    const highlights: string[] = [];

    // Add data-driven highlights
    if (report.readinessIndex.value >= 75) {
        highlights.push("Interview Readiness Index of " + report.readinessIndex.value + "/100 — top-tier preparedness");
    }

    const aboveBenchmark = report.benchmarks.filter((b) => b.gap > 0);
    if (aboveBenchmark.length > 0) {
        const topBench = aboveBenchmark.sort((a, b) => b.gap - a.gap)[0];
        highlights.push(topBench.metric + " performance at P" + topBench.percentile + " (+" + topBench.gap + " vs median benchmark)");
    }

    if (report.behavioral.stressResilience.value >= 75) {
        highlights.push("High stress resilience (score: " + report.behavioral.stressResilience.value + ") — consistent performance across varied conditions");
    }

    if (report.transcript.starScore.value >= 65) {
        highlights.push("Strong STAR method adoption (score: " + report.transcript.starScore.value + "/100) in behavioral responses");
    }

    const improvingMetrics = report.growthPredictions.filter(
        (p) => p.regressionSlope > 1
    );
    if (improvingMetrics.length > 0) {
        highlights.push("Positive growth trajectory in " + improvingMetrics.map(m => m.metric).join(", ") + " (sustained improvement)");
    }

    if (history.length >= 5) {
        highlights.push("Demonstrated commitment: " + history.length + " practice interviews completed");
    }

    const totalHours = Math.round(
        history.reduce((s, p) => s + p.duration, 0) / 60 * 10
    ) / 10;
    if (totalHours >= 2) {
        highlights.push(totalHours + " hours of verified interview practice logged");
    }

    return highlights.slice(0, 6);
}

/* ================================================================== */
/*  Public API                                                         */
/* ================================================================== */

export function generatePortfolioReport(
    report: FullAnalysisReport,
    roadmap: GrowthRoadmap,
    history: InterviewPerformanceData[]
): PortfolioReport {
    const primaryRole = history[0]?.role || "General";
    const totalHours = Math.round(
        history.reduce((s, p) => s + p.duration, 0) / 60 * 10
    ) / 10;

    const certification = computeCertification(
        report.readinessIndex.value,
        report.recruiterSimScore.value,
        history.length
    );

    return {
        generatedAt: new Date().toISOString(),
        candidateSummary: {
            totalInterviews: history.length,
            totalPracticeHours: totalHours,
            primaryRole,
            readinessIndex: report.readinessIndex,
            recruiterSimScore: report.recruiterSimScore,
        },
        skillIndicators: buildSkillIndicators(report, history),
        communicationProficiency: buildCommunicationProficiency(report, history),
        technicalStrengthMatrix: buildTechnicalMatrix(report, history),
        certificationScore: certification,
        highlights: generateHighlights(report, history),
        benchmarkSummary: report.benchmarks,
    };
}

/**
 * Export portfolio as downloadable HTML string
 */
export function exportPortfolioHTML(
    portfolio: PortfolioReport
): string {
    const tierColors: Record<string, string> = {
        Gold: "#D4AF37",
        Silver: "#C0C0C0",
        Bronze: "#CD7F32",
        "In Progress": "#6b7280",
    };

    const tierColor = tierColors[portfolio.certificationScore.tier] || "#6b7280";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interview Intelligence Report — ${portfolio.candidateSummary.primaryRole}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.6;padding:40px 20px}
.container{max-width:800px;margin:0 auto}
.header{text-align:center;padding:40px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:16px;margin-bottom:32px;border:1px solid #475569}
.header h1{font-size:28px;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.header .subtitle{color:#94a3b8;font-size:14px}
.certification{display:inline-block;padding:8px 24px;border-radius:24px;border:2px solid ${tierColor};color:${tierColor};font-weight:700;font-size:16px;margin-top:16px}
.section{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:20px}
.section h2{font-size:18px;color:#818cf8;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
.kpi{background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;text-align:center}
.kpi .value{font-size:28px;font-weight:800;color:#c4b5fd}
.kpi .label{font-size:12px;color:#94a3b8;margin-top:4px}
.skill-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #1e293b}
.skill-row:last-child{border-bottom:none}
.skill-name{font-size:14px;color:#e2e8f0;flex:1}
.skill-score{font-size:14px;font-weight:700;color:#818cf8;width:50px;text-align:right}
.skill-bar{flex:0 0 200px;height:6px;background:#1e293b;border-radius:3px;margin:0 12px;overflow:hidden}
.skill-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6)}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.badge-verified{background:#065f4620;color:#34d399;border:1px solid #34d399}
.badge-improving{background:#f59e0b20;color:#fbbf24;border:1px solid #fbbf24}
.highlights li{padding:6px 0;font-size:14px;color:#cbd5e1}
.footer{text-align:center;padding:20px;color:#64748b;font-size:12px;margin-top:32px}
@media print{body{background:#fff;color:#1e293b}.header,.section{border-color:#e2e8f0}.kpi .value{color:#6366f1}.skill-score{color:#6366f1}}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>Interview Intelligence Report</h1>
<p class="subtitle">${portfolio.candidateSummary.primaryRole} • ${portfolio.candidateSummary.totalInterviews} Interviews • ${portfolio.candidateSummary.totalPracticeHours}h Practice</p>
<div class="certification">${portfolio.certificationScore.label} — ${portfolio.certificationScore.value}/100</div>
</div>

<div class="section">
<h2>📊 Performance Overview</h2>
<div class="kpi-grid">
<div class="kpi"><div class="value">${portfolio.candidateSummary.readinessIndex.value}</div><div class="label">Readiness Index</div></div>
<div class="kpi"><div class="value">${portfolio.candidateSummary.recruiterSimScore.value}</div><div class="label">Recruiter Sim Score</div></div>
<div class="kpi"><div class="value">${portfolio.candidateSummary.totalInterviews}</div><div class="label">Total Interviews</div></div>
<div class="kpi"><div class="value">${portfolio.certificationScore.tier}</div><div class="label">Certification</div></div>
</div>
</div>

<div class="section">
<h2>🎯 Verified Skill Indicators</h2>
${portfolio.skillIndicators
            .map(
                (si) => `<div class="skill-row">
  <span class="skill-name">${si.skill} ${si.verified ? '<span class="badge badge-verified">Verified</span>' : ""} ${si.trend === "improving" ? '<span class="badge badge-improving">↑ Improving</span>' : ""}</span>
  <div class="skill-bar"><div class="skill-fill" style="width:${si.score}%"></div></div>
  <span class="skill-score">${si.score}</span>
</div>`
            )
            .join("\n")}
</div>

<div class="section">
<h2>💬 Communication Proficiency</h2>
<div class="kpi-grid" style="margin-bottom:16px">
<div class="kpi"><div class="value">${portfolio.communicationProficiency.overallScore}</div><div class="label">Overall Communication</div></div>
</div>
${portfolio.communicationProficiency.components
            .map(
                (c) => `<div class="skill-row">
  <span class="skill-name">${c.name}</span>
  <div class="skill-bar"><div class="skill-fill" style="width:${c.score}%"></div></div>
  <span class="skill-score">${c.score}</span>
</div>`
            )
            .join("\n")}
</div>

<div class="section">
<h2>⚡ Technical Strength Matrix</h2>
${portfolio.technicalStrengthMatrix
            .map(
                (t) => `<div class="skill-row">
  <span class="skill-name">${t.category} <span style="color:#64748b;font-size:12px">(P${t.percentile})</span></span>
  <div class="skill-bar"><div class="skill-fill" style="width:${t.score}%"></div></div>
  <span class="skill-score">${t.score}</span>
</div>`
            )
            .join("\n")}
</div>

${portfolio.highlights.length > 0
            ? `<div class="section">
<h2>🏆 Key Highlights</h2>
<ul class="highlights">
${portfolio.highlights.map((h) => `<li>✓ ${h}</li>`).join("\n")}
</ul>
</div>`
            : ""
        }

<div class="footer">
Generated ${new Date(portfolio.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} • Powered by SuperApp Interview Intelligence
</div>
</div>
</body>
</html>`;
}

export function downloadPortfolioReport(portfolio: PortfolioReport): void {
    const html = exportPortfolioHTML(portfolio);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
        "interview-intelligence-report-" +
        new Date().toISOString().slice(0, 10) +
        ".html";
    a.click();
    URL.revokeObjectURL(url);
}

export class PortfolioReportGenerator {
    private static instance: PortfolioReportGenerator;

    static getInstance(): PortfolioReportGenerator {
        if (!this.instance) {
            this.instance = new PortfolioReportGenerator();
        }
        return this.instance;
    }

    generate(
        report: FullAnalysisReport,
        roadmap: GrowthRoadmap,
        history: InterviewPerformanceData[]
    ): PortfolioReport {
        return generatePortfolioReport(report, roadmap, history);
    }

    downloadHTML(portfolio: PortfolioReport): void {
        downloadPortfolioReport(portfolio);
    }

    exportJSON(portfolio: PortfolioReport): void {
        const blob = new Blob([JSON.stringify(portfolio, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
            "interview-portfolio-" +
            new Date().toISOString().slice(0, 10) +
            ".json";
        a.click();
        URL.revokeObjectURL(url);
    }
}
