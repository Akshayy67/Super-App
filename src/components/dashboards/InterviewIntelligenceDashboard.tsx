import React, { useState, useMemo, useCallback } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Award,
    BarChart3,
    Target,
    Brain,
    Download,
    Share2,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Minus,
    Zap,
    Star,
    Clock,
} from "lucide-react";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";
import { EnhancedAIAnalytics } from "../../utils/enhancedAIAnalytics";
import { useTheme } from "../../utils/themeManager";
import "./InterviewIntelligenceDashboard.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewIntelligenceDashboardProps {
    performanceHistory: InterviewPerformanceData[];
    currentPerformance?: InterviewPerformanceData | null;
}

interface SessionPlanStep {
    title: string;
    description: string;
    focus: string;
}

/* Industry benchmark reference data */
const INDUSTRY_BENCHMARKS: Record<string, number> = {
    Overall: 72,
    Technical: 68,
    Communication: 74,
    Behavioral: 70,
    Confidence: 71,
    Clarity: 73,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getHeatClass(score: number): string {
    if (score === 0) return "iid-heat-none";
    if (score >= 80) return "iid-heat-excellent";
    if (score >= 60) return "iid-heat-good";
    if (score >= 40) return "iid-heat-average";
    return "iid-heat-poor";
}

function computeTrend(
    history: InterviewPerformanceData[],
    accessor: (d: InterviewPerformanceData) => number
): { delta: number; direction: "up" | "down" | "stable" } {
    if (history.length < 2) return { delta: 0, direction: "stable" };
    const sorted = [...history].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const half = Math.floor(sorted.length / 2);
    const olderAvg =
        sorted.slice(0, half).reduce((s, d) => s + accessor(d), 0) / half;
    const recentAvg =
        sorted.slice(half).reduce((s, d) => s + accessor(d), 0) /
        (sorted.length - half);
    const delta = Math.round((recentAvg - olderAvg) * 10) / 10;
    return {
        delta,
        direction: Math.abs(delta) < 2 ? "stable" : delta > 0 ? "up" : "down",
    };
}

function buildSessionSteps(
    perf: InterviewPerformanceData
): SessionPlanStep[] {
    const steps: SessionPlanStep[] = [];
    const categories = [
        { name: "Technical", score: perf.technicalScore },
        { name: "Communication", score: perf.communicationScore },
        { name: "Behavioral", score: perf.behavioralScore },
        { name: "Confidence", score: perf.detailedMetrics?.confidence ?? 0 },
        { name: "Clarity", score: perf.detailedMetrics?.clarity ?? 0 },
    ].sort((a, b) => a.score - b.score);

    const weakest = categories[0];
    const secondWeakest = categories[1];
    const strongest = categories[categories.length - 1];

    steps.push({
        title: "Warm-up: " + weakest.name + " Drills",
        description:
            "Start with 10 min focused exercises on " +
            weakest.name.toLowerCase() +
            " (current: " +
            weakest.score +
            "/100). Use STAR method for behavioral, solve quick problems for technical.",
        focus: weakest.name,
    });

    steps.push({
        title: "Deep Practice: " + secondWeakest.name,
        description:
            "Spend 15 min on " +
            secondWeakest.name.toLowerCase() +
            " improvement (current: " +
            secondWeakest.score +
            "/100). Record yourself and review for filler words and pacing.",
        focus: secondWeakest.name,
    });

    steps.push({
        title: "Leverage Strength: " + strongest.name,
        description:
            "Practice framing answers to showcase your strong " +
            strongest.name.toLowerCase() +
            " skills (" +
            strongest.score +
            "/100). Prepare 3 stories that highlight this strength.",
        focus: strongest.name,
    });

    steps.push({
        title: "Full Mock Interview Simulation",
        description:
            "Run a 20-min mock interview covering all categories. Focus on maintaining confidence while applying the techniques practiced above.",
        focus: "All",
    });

    steps.push({
        title: "Review & Set Goals",
        description:
            "Review the session recording. Set targets: bring " +
            weakest.name +
            " above " +
            Math.min(weakest.score + 15, 100) +
            " and " +
            secondWeakest.name +
            " above " +
            Math.min(secondWeakest.score + 10, 100) +
            " by your next session.",
        focus: "Planning",
    });

    return steps;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const InterviewIntelligenceDashboard: React.FC<
    InterviewIntelligenceDashboardProps
> = ({ performanceHistory, currentPerformance }) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        trends: true,
        heatmap: true,
        benchmarks: true,
        plan: true,
    });

    const [aiPlan, setAiPlan] = useState<string[] | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const toggleSection = useCallback((key: string) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const latestPerf = currentPerformance ?? performanceHistory[0] ?? null;

    /* ---------- KPI aggregates ---------- */
    const kpis = useMemo(() => {
        const h = performanceHistory;
        if (h.length === 0)
            return {
                totalInterviews: 0,
                avgScore: 0,
                trend: { delta: 0, direction: "stable" as const },
                topStrength: "N/A",
                latestScore: 0,
                avgDuration: 0,
            };

        const avgScore =
            Math.round(
                (h.reduce((s, d) => s + d.overallScore, 0) / h.length) * 10
            ) / 10;

        const avgDuration =
            Math.round(h.reduce((s, d) => s + d.duration, 0) / h.length);

        const strengthMap: Record<string, number> = {};
        h.forEach((d) =>
            d.strengths?.forEach((s) => {
                strengthMap[s] = (strengthMap[s] || 0) + 1;
            })
        );
        const topStrength =
            Object.entries(strengthMap).sort((a, b) => b[1] - a[1])[0]?.[0] ??
            "N/A";

        return {
            totalInterviews: h.length,
            avgScore,
            trend: computeTrend(h, (d) => d.overallScore),
            topStrength,
            latestScore: h[0]?.overallScore ?? 0,
            avgDuration,
        };
    }, [performanceHistory]);

    /* ---------- Score trend chart data ---------- */
    const trendChartData = useMemo(() => {
        const sorted = [...performanceHistory].sort(
            (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return sorted.map((d, i) => ({
            name: new Date(d.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            interview: i + 1,
            Overall: d.overallScore,
            Technical: d.technicalScore,
            Communication: d.communicationScore,
            Behavioral: d.behavioralScore,
        }));
    }, [performanceHistory]);

    /* ---------- Heatmap data ---------- */
    const heatmapData = useMemo(() => {
        const categories = ["Technical", "Communication", "Behavioral"];
        const difficulties = ["Easy", "Medium", "Hard"];
        return categories.map((cat) => ({
            category: cat,
            cells: difficulties.map((diff) => {
                const matching = performanceHistory.filter(
                    (p) => p.difficulty?.toLowerCase() === diff.toLowerCase()
                );
                const accessor = (p: InterviewPerformanceData) => {
                    if (cat === "Technical") return p.technicalScore;
                    if (cat === "Communication") return p.communicationScore;
                    return p.behavioralScore;
                };
                const source = matching.length > 0 ? matching : performanceHistory;
                const avg =
                    source.length > 0
                        ? Math.round(
                            source.reduce((s, p) => s + accessor(p), 0) / source.length
                        )
                        : 0;
                return { difficulty: diff, score: avg, count: matching.length };
            }),
        }));
    }, [performanceHistory]);

    /* ---------- Benchmark data ---------- */
    const benchmarkData = useMemo(() => {
        if (performanceHistory.length === 0) return [];
        const h = performanceHistory;
        const avg = (fn: (d: InterviewPerformanceData) => number) =>
            Math.round(h.reduce((s, d) => s + fn(d), 0) / h.length);

        return [
            { metric: "Overall", yours: avg((d) => d.overallScore), industry: INDUSTRY_BENCHMARKS.Overall },
            { metric: "Technical", yours: avg((d) => d.technicalScore), industry: INDUSTRY_BENCHMARKS.Technical },
            { metric: "Communication", yours: avg((d) => d.communicationScore), industry: INDUSTRY_BENCHMARKS.Communication },
            { metric: "Behavioral", yours: avg((d) => d.behavioralScore), industry: INDUSTRY_BENCHMARKS.Behavioral },
            { metric: "Confidence", yours: avg((d) => d.detailedMetrics?.confidence ?? 0), industry: INDUSTRY_BENCHMARKS.Confidence },
            { metric: "Clarity", yours: avg((d) => d.detailedMetrics?.clarity ?? 0), industry: INDUSTRY_BENCHMARKS.Clarity },
        ];
    }, [performanceHistory]);

    /* ---------- Static session plan ---------- */
    const staticPlan = useMemo(() => {
        if (!latestPerf) return [];
        return buildSessionSteps(latestPerf);
    }, [latestPerf]);

    /* ---------- AI Plan Generation ---------- */
    const generateAIPlan = useCallback(async () => {
        if (!latestPerf) return;
        setAiLoading(true);
        try {
            const ai = EnhancedAIAnalytics.getInstance();
            const report = await ai.generateComprehensiveReport(
                latestPerf,
                performanceHistory
            );
            setAiPlan([
                ...(report.analysis.improvementRecommendations || []),
                ...(report.analysis.nextStepsAction || []),
            ]);
        } catch {
            setAiPlan(staticPlan.map((s) => s.title + ": " + s.description));
        } finally {
            setAiLoading(false);
        }
    }, [latestPerf, performanceHistory, staticPlan]);

    /* ---------- Export ---------- */
    const exportPortfolio = useCallback(() => {
        const payload = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalInterviews: kpis.totalInterviews,
                averageScore: kpis.avgScore,
                trend: kpis.trend.direction,
                topStrength: kpis.topStrength,
            },
            benchmarks: benchmarkData,
            heatmap: heatmapData,
            sessionPlan: aiPlan ?? staticPlan.map((s) => s.title + ": " + s.description),
            history: performanceHistory.map((p) => ({
                id: p.id,
                date: p.timestamp,
                role: p.role,
                difficulty: p.difficulty,
                scores: {
                    overall: p.overallScore,
                    technical: p.technicalScore,
                    communication: p.communicationScore,
                    behavioral: p.behavioralScore,
                },
            })),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
            "interview-intelligence-portfolio-" +
            new Date().toISOString().slice(0, 10) +
            ".json";
        a.click();
        URL.revokeObjectURL(url);
    }, [kpis, benchmarkData, heatmapData, aiPlan, staticPlan, performanceHistory]);

    /* ---------- Early return if no data ---------- */
    if (performanceHistory.length === 0) return null;

    const TrendIcon =
        kpis.trend.direction === "up"
            ? TrendingUp
            : kpis.trend.direction === "down"
                ? TrendingDown
                : Minus;

    return (
        <div className={"iid-root" + (isDark ? " iid-dark" : "")}>
            {/* Banner */}
            <div className="iid-banner iid-glass iid-animate-in">
                <div className="iid-banner-title">
                    <Sparkles size={24} style={{ color: isDark ? "#818cf8" : "#6366f1" }} />
                    <span style={{ color: isDark ? "#fff" : "#111827" }}>
                        Interview Intelligence
                    </span>
                </div>
                <p
                    className="iid-banner-subtitle"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                    Enterprise-grade analytics · AI-powered insights · Shareable portfolio
                </p>
            </div>

            {/* KPI Hero Cards */}
            <div className="iid-kpi-grid">
                <div className="iid-glass iid-kpi-card iid-animate-in">
                    <div className="iid-kpi-icon">
                        <BarChart3 size={22} />
                    </div>
                    <div className="iid-kpi-value">{kpis.totalInterviews}</div>
                    <div className="iid-kpi-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        Total Interviews
                    </div>
                </div>

                <div className="iid-glass iid-kpi-card iid-animate-in">
                    <div className="iid-kpi-icon">
                        <Award size={22} />
                    </div>
                    <div className="iid-kpi-value">{kpis.avgScore}</div>
                    <div className="iid-kpi-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        Average Score
                    </div>
                    <div
                        className={
                            "iid-kpi-trend " +
                            (kpis.trend.direction === "up"
                                ? "iid-trend-up"
                                : kpis.trend.direction === "down"
                                    ? "iid-trend-down"
                                    : "iid-trend-stable")
                        }
                    >
                        <TrendIcon size={13} />
                        {kpis.trend.delta > 0 ? "+" : ""}
                        {kpis.trend.delta} pts
                    </div>
                </div>

                <div className="iid-glass iid-kpi-card iid-animate-in">
                    <div className="iid-kpi-icon">
                        <Clock size={22} />
                    </div>
                    <div className="iid-kpi-value">{kpis.avgDuration}m</div>
                    <div className="iid-kpi-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        Avg Duration
                    </div>
                </div>

                <div className="iid-glass iid-kpi-card iid-animate-in">
                    <div className="iid-kpi-icon">
                        <Star size={22} />
                    </div>
                    <div
                        style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: isDark ? "#c4b5fd" : "#6366f1",
                            lineHeight: 1.3,
                            minHeight: 38,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {kpis.topStrength}
                    </div>
                    <div className="iid-kpi-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        Top Strength
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="iid-sections">
                {/* Score Trends */}
                <div className="iid-glass iid-section-content iid-animate-in">
                    <button className="iid-collapse-toggle" onClick={() => toggleSection("trends")}>
                        <div className="iid-section-header" style={{ marginBottom: 0 }}>
                            <TrendingUp size={18} style={{ color: isDark ? "#818cf8" : "#6366f1" }} />
                            <span className="iid-section-title" style={{ color: isDark ? "#fff" : "#111827" }}>
                                Score Trends Over Time
                            </span>
                            <span className="iid-section-badge">Live</span>
                        </div>
                        {openSections.trends ? (
                            <ChevronUp size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                        ) : (
                            <ChevronDown size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                        )}
                    </button>
                    <div className={"iid-collapse-body " + (openSections.trends ? "iid-open" : "iid-closed")}>
                        <div className="iid-divider" />
                        <div style={{ width: "100%", height: 300, marginTop: 16 }}>
                            <ResponsiveContainer>
                                <AreaChart data={trendChartData}>
                                    <defs>
                                        <linearGradient id="iidGradOverall" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="iidGradTech" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="iidGradComm" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="iidGradBehav" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                                        axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                                        axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: isDark ? "#1f2937" : "#fff",
                                            border: "1px solid " + (isDark ? "#374151" : "#e5e7eb"),
                                            borderRadius: 10,
                                            fontSize: 13,
                                            color: isDark ? "#f3f4f6" : "#111827",
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                    <Area type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={2.5} fill="url(#iidGradOverall)" dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                                    <Area type="monotone" dataKey="Technical" stroke="#10b981" strokeWidth={2} fill="url(#iidGradTech)" dot={{ r: 3, fill: "#10b981" }} />
                                    <Area type="monotone" dataKey="Communication" stroke="#f59e0b" strokeWidth={2} fill="url(#iidGradComm)" dot={{ r: 3, fill: "#f59e0b" }} />
                                    <Area type="monotone" dataKey="Behavioral" stroke="#ec4899" strokeWidth={2} fill="url(#iidGradBehav)" dot={{ r: 3, fill: "#ec4899" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Heatmap + Benchmarks (two columns) */}
                <div className="iid-two-col">
                    {/* Heatmap */}
                    <div className="iid-glass iid-section-content iid-animate-in">
                        <button className="iid-collapse-toggle" onClick={() => toggleSection("heatmap")}>
                            <div className="iid-section-header" style={{ marginBottom: 0 }}>
                                <Target size={18} style={{ color: isDark ? "#818cf8" : "#6366f1" }} />
                                <span className="iid-section-title" style={{ color: isDark ? "#fff" : "#111827" }}>
                                    Category Heatmap
                                </span>
                            </div>
                            {openSections.heatmap ? (
                                <ChevronUp size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                            ) : (
                                <ChevronDown size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                            )}
                        </button>
                        <div className={"iid-collapse-body " + (openSections.heatmap ? "iid-open" : "iid-closed")}>
                            <div className="iid-divider" />
                            <div className="iid-heatmap-grid" style={{ marginTop: 12 }}>
                                <div />
                                <div className="iid-heatmap-header" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Easy</div>
                                <div className="iid-heatmap-header" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Medium</div>
                                <div className="iid-heatmap-header" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Hard</div>

                                {heatmapData.map((row) => (
                                    <React.Fragment key={row.category}>
                                        <div className="iid-heatmap-label" style={{ color: isDark ? "#e5e7eb" : "#374151" }}>
                                            {row.category}
                                        </div>
                                        {row.cells.map((cell) => (
                                            <div
                                                key={row.category + "-" + cell.difficulty}
                                                className={"iid-heatmap-cell " + getHeatClass(cell.score)}
                                                title={row.category + " / " + cell.difficulty + ": " + cell.score + "/100 (" + cell.count + " interviews)"}
                                            >
                                                {cell.score > 0 ? cell.score : "\u2014"}
                                                <span className="iid-heatmap-sub">
                                                    {cell.count > 0 ? "n=" + cell.count : "No data"}
                                                </span>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="iid-legend" style={{ marginTop: 16 }}>
                                {[
                                    { cls: "iid-heat-excellent", label: "\u226580 Excellent" },
                                    { cls: "iid-heat-good", label: "60\u201379 Good" },
                                    { cls: "iid-heat-average", label: "40\u201359 Average" },
                                    { cls: "iid-heat-poor", label: "<40 Needs Work" },
                                ].map((l) => (
                                    <div className="iid-legend-item" key={l.label}>
                                        <div className={"iid-legend-dot " + l.cls} style={{ width: 10, height: 10 }} />
                                        <span style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Benchmarks */}
                    <div className="iid-glass iid-section-content iid-animate-in">
                        <button className="iid-collapse-toggle" onClick={() => toggleSection("benchmarks")}>
                            <div className="iid-section-header" style={{ marginBottom: 0 }}>
                                <Zap size={18} style={{ color: isDark ? "#818cf8" : "#6366f1" }} />
                                <span className="iid-section-title" style={{ color: isDark ? "#fff" : "#111827" }}>
                                    Industry Benchmarks
                                </span>
                            </div>
                            {openSections.benchmarks ? (
                                <ChevronUp size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                            ) : (
                                <ChevronDown size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                            )}
                        </button>
                        <div className={"iid-collapse-body " + (openSections.benchmarks ? "iid-open" : "iid-closed")}>
                            <div className="iid-divider" />
                            <div className="iid-bench-legend" style={{ marginTop: 12 }}>
                                <div className="iid-bench-legend-item">
                                    <div className="iid-bench-legend-dot" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} />
                                    <span style={{ color: isDark ? "#e5e7eb" : "#374151" }}>Your Score</span>
                                </div>
                                <div className="iid-bench-legend-item">
                                    <div className="iid-bench-legend-dot" style={{ background: isDark ? "rgba(156,163,175,0.25)" : "rgba(156,163,175,0.35)" }} />
                                    <span style={{ color: isDark ? "#e5e7eb" : "#374151" }}>Industry Avg</span>
                                </div>
                            </div>
                            {benchmarkData.map((row) => (
                                <div className="iid-benchmark-row" key={row.metric}>
                                    <div className="iid-benchmark-label" style={{ color: isDark ? "#e5e7eb" : "#374151" }}>
                                        {row.metric}
                                    </div>
                                    <div className="iid-benchmark-bars">
                                        <div className="iid-benchmark-bar-track" style={{ background: isDark ? "rgba(75,85,99,0.3)" : "rgba(229,231,235,0.6)" }}>
                                            <div className="iid-benchmark-bar-fill iid-bar-user" style={{ width: Math.min(row.yours, 100) + "%" }} />
                                        </div>
                                        <div className="iid-benchmark-bar-track" style={{ background: isDark ? "rgba(75,85,99,0.3)" : "rgba(229,231,235,0.6)" }}>
                                            <div className="iid-benchmark-bar-fill iid-bar-industry" style={{ width: Math.min(row.industry, 100) + "%" }} />
                                        </div>
                                    </div>
                                    <div className="iid-benchmark-score">
                                        <div style={{ color: row.yours >= row.industry ? (isDark ? "#34d399" : "#059669") : (isDark ? "#f87171" : "#dc2626"), fontWeight: 700 }}>
                                            {row.yours}
                                        </div>
                                        <div style={{ color: isDark ? "#6b7280" : "#9ca3af", fontSize: "0.68rem" }}>
                                            {row.industry}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Next Session Plan */}
                <div className="iid-glass iid-plan-card iid-animate-in">
                    <button className="iid-collapse-toggle" onClick={() => toggleSection("plan")}>
                        <div className="iid-section-header" style={{ marginBottom: 0 }}>
                            <Brain size={18} style={{ color: isDark ? "#818cf8" : "#6366f1" }} />
                            <span className="iid-section-title" style={{ color: isDark ? "#fff" : "#111827" }}>
                                AI Next Session Plan
                            </span>
                            <span className="iid-section-badge">AI</span>
                        </div>
                        {openSections.plan ? (
                            <ChevronUp size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                        ) : (
                            <ChevronDown size={18} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                        )}
                    </button>
                    <div className={"iid-collapse-body " + (openSections.plan ? "iid-open" : "iid-closed")}>
                        <div className="iid-divider" />
                        {staticPlan.map((step, i) => (
                            <div className="iid-plan-step" key={i}>
                                <div className="iid-plan-number">{i + 1}</div>
                                <div className="iid-plan-content">
                                    <div className="iid-plan-title" style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}>
                                        {step.title}
                                    </div>
                                    <div className="iid-plan-desc" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {aiPlan && (
                            <div style={{ marginTop: 16 }}>
                                <div className="iid-section-header" style={{ marginBottom: 12 }}>
                                    <Sparkles size={16} style={{ color: isDark ? "#c4b5fd" : "#8b5cf6" }} />
                                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: isDark ? "#c4b5fd" : "#6366f1" }}>
                                        AI-Enhanced Recommendations
                                    </span>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                                    {aiPlan.map((rec, i) => (
                                        <li key={i} style={{ fontSize: "0.85rem", lineHeight: 1.5, color: isDark ? "#d1d5db" : "#4b5563" }}>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button
                                className={"iid-generate-btn" + (aiLoading ? " iid-generating" : "")}
                                onClick={generateAIPlan}
                                disabled={aiLoading}
                            >
                                <Brain size={16} />
                                {aiLoading ? "Generating AI Plan\u2026" : aiPlan ? "Regenerate AI Plan" : "Enhance with AI"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Export Footer */}
                <div className="iid-export-footer iid-animate-in">
                    <p className="iid-export-note" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
                        Export your analytics as a shareable portfolio piece. Includes scores, benchmarks, heatmap, and session plan.
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button className="iid-export-btn" onClick={exportPortfolio}>
                            <Download size={16} />
                            Export Portfolio
                        </button>
                        <button
                            className="iid-export-btn"
                            style={{
                                background: isDark ? "rgba(75,85,99,0.5)" : "rgba(229,231,235,0.8)",
                                color: isDark ? "#e5e7eb" : "#374151",
                                boxShadow: "none",
                            }}
                            onClick={() => {
                                const summary =
                                    "My Interview Intelligence: " +
                                    kpis.totalInterviews +
                                    " interviews, avg score " +
                                    kpis.avgScore +
                                    "/100 (" +
                                    kpis.trend.direction +
                                    ") \u2014 via SuperApp";
                                navigator.clipboard.writeText(summary);
                                alert("Summary copied to clipboard!");
                            }}
                        >
                            <Share2 size={16} />
                            Share Summary
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ height: 32 }} />
        </div>
    );
};
