/**
 * Enterprise Analytics Dashboard
 * ───────────────────────────────
 * 100% real-data-driven. Every metric is transparent and traceable.
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Brain,
    Target,
    TrendingUp,
    Award,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Download,
    Share2,
    Info,
    Zap,
    ShieldCheck,
    BookOpen,
    MessageSquare,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Sparkles,
} from "lucide-react";
import { InterviewPerformanceData } from "../../utils/performanceAnalytics";
import {
    generateFullAnalysis,
    FullAnalysisReport,
    ScoredMetric,
} from "../../utils/realDataAnalyticsEngine";
import {
    generateGrowthRoadmap,
    generateAIEnhancedRoadmap,
    GrowthRoadmap,
    loadAcceptedRoadmap,
    saveAcceptedRoadmap,
    computeRoadmapDiff,
    RoadmapDiff,
    onRoadmapUpdate,
} from "../../utils/growthEngine";
import {
    generatePortfolioReport,
    downloadPortfolioReport,
    PortfolioReport,
} from "../../utils/portfolioReportGenerator";
import { RoadmapMergePanel } from "./RoadmapMergePanel";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import "./EnterpriseAnalyticsDashboard.css";

/* ================================================================== */
/*  Props                                                              */
/* ================================================================== */

interface EnterpriseAnalyticsDashboardProps {
    performanceHistory: InterviewPerformanceData[];
    currentPerformance?: InterviewPerformanceData | null;
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function useDarkMode(): boolean {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
}

function fillClass(v: number): string {
    if (v >= 70) return "ead-fill-success";
    if (v >= 45) return "ead-fill-warning";
    return "ead-fill-danger";
}

function pClass(p: number): string {
    if (p >= 65) return "ead-p-high";
    if (p >= 35) return "ead-p-mid";
    return "ead-p-low";
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

const CollapsibleSection: React.FC<{
    icon: React.ReactNode;
    title: string;
    badge?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ icon, title, badge, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="ead-section ead-glass ead-animate-in">
            <button
                className="ead-collapse-toggle"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                <span className="ead-section-header">
                    {icon}
                    <span className="ead-section-title">{title}</span>
                    {badge && <span className="ead-section-badge">{badge}</span>}
                </span>
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className={"ead-collapse-body " + (open ? "ead-open" : "ead-closed")}>
                <div className="ead-divider" />
                {children}
            </div>
        </div>
    );
};

const MetricRow: React.FC<{
    metric: ScoredMetric;
    showCalc?: boolean;
}> = ({ metric, showCalc = true }) => (
    <div className="ead-metric-row">
        <span className="ead-metric-label">{metric.label}</span>
        <div className="ead-metric-bar">
            <div
                className={"ead-metric-fill " + fillClass(metric.value)}
                style={{ width: Math.min(metric.value, 100) + "%" }}
            />
        </div>
        <span className="ead-metric-score" style={{ color: metric.value >= 70 ? "var(--ead-success)" : metric.value >= 45 ? "var(--ead-warning)" : "var(--ead-danger)" }}>
            {metric.value}
        </span>
        {showCalc && metric.calculation && (
            <span title={metric.calculation} style={{ cursor: "help" }}>
                <Info size={13} color="var(--ead-text3)" />
            </span>
        )}
    </div>
);

/* ================================================================== */
/*  Main Dashboard                                                     */
/* ================================================================== */

export const EnterpriseAnalyticsDashboard: React.FC<
    EnterpriseAnalyticsDashboardProps
> = ({ performanceHistory: propHistory }) => {
    const isDark = useDarkMode();
    const [copied, setCopied] = useState(false);
    const [activeRoadmap, setActiveRoadmap] = useState<GrowthRoadmap | null>(null);
    const [pendingDiff, setPendingDiff] = useState<RoadmapDiff | null>(null);
    const [diffDismissed, setDiffDismissed] = useState(false);
    const [isAIRoadmapLoading, setIsAIRoadmapLoading] = useState(false);

    // Use own hook for fresh data — don't rely on parent prop which may be stale
    const { performanceHistory: hookHistory } = useAnalyticsData();

    // Use whichever source has MORE data (freshest), fallback to prop
    const performanceHistory = hookHistory.length >= propHistory.length
        ? hookHistory
        : propHistory;

    // Generate all analysis from REAL data
    const report: FullAnalysisReport | null = useMemo(() => {
        if (!performanceHistory || performanceHistory.length === 0) return null;
        return generateFullAnalysis(performanceHistory);
    }, [performanceHistory]);

    const generatedRoadmap: GrowthRoadmap | null = useMemo(() => {
        if (!report) return null;
        return generateGrowthRoadmap(report, performanceHistory);
    }, [report, performanceHistory]);

    // Track interview count to avoid triggering diff on 30-second refresh
    const lastCheckedCountRef = React.useRef<number>(-1);

    // Core function to check for roadmap updates and compute diff
    const checkForRoadmapUpdates = useCallback(async (forceAI: boolean = false) => {
        if (!report || !generatedRoadmap) return;
        const currentCount = performanceHistory.length;

        const stored = loadAcceptedRoadmap();
        if (!stored) {
            // First time — no previous roadmap
            if (forceAI) {
                setIsAIRoadmapLoading(true);
                try {
                    const aiRoadmap = await generateAIEnhancedRoadmap(report, performanceHistory);
                    setActiveRoadmap(aiRoadmap);
                } catch {
                    setActiveRoadmap(generatedRoadmap);
                } finally {
                    setIsAIRoadmapLoading(false);
                }
            } else {
                setActiveRoadmap(generatedRoadmap);
            }
            setPendingDiff(null);
            return;
        }

        const interviewsSince = currentCount - stored.interviewCount;
        if (interviewsSince <= 0 && !forceAI) {
            // No new interviews — use stored roadmap
            setActiveRoadmap(stored.roadmap);
            setPendingDiff(null);
            return;
        }

        // New interviews detected — generate AI-enhanced roadmap, then compute diff
        setIsAIRoadmapLoading(true);
        let newRoadmap: GrowthRoadmap;
        try {
            newRoadmap = await generateAIEnhancedRoadmap(report, performanceHistory);
        } catch {
            newRoadmap = generatedRoadmap;
        } finally {
            setIsAIRoadmapLoading(false);
        }

        const diff = computeRoadmapDiff(
            stored.roadmap,
            newRoadmap,
            Math.max(interviewsSince, 1)
        );

        if (diff.hasChanges) {
            setPendingDiff(diff);
            setDiffDismissed(false);
            setActiveRoadmap(stored.roadmap); // Keep showing old until merge
        } else {
            setActiveRoadmap(newRoadmap);
            setPendingDiff(null);
        }
    }, [report, generatedRoadmap, performanceHistory]);

    // Auto-detect roadmap changes ONLY when interview count actually changes
    useEffect(() => {
        const currentCount = performanceHistory.length;
        if (currentCount === lastCheckedCountRef.current) return;
        lastCheckedCountRef.current = currentCount;
        checkForRoadmapUpdates(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performanceHistory.length]);

    // Listen for roadmap update events from InterviewFeedback
    useEffect(() => {
        const unsubscribe = onRoadmapUpdate((payload) => {
            console.log("🗺️ Roadmap update event received in dashboard:", payload);
            // Force re-check with AI generation
            lastCheckedCountRef.current = -1; // Reset to allow re-check
            checkForRoadmapUpdates(true);
        });
        return unsubscribe;
    }, [checkForRoadmapUpdates]);

    // The roadmap used for portfolio and rendering
    const roadmap = activeRoadmap || generatedRoadmap;

    const portfolio: PortfolioReport | null = useMemo(() => {
        if (!report || !roadmap) return null;
        return generatePortfolioReport(report, roadmap, performanceHistory);
    }, [report, roadmap, performanceHistory]);

    const handleMergeComplete = useCallback((merged: GrowthRoadmap) => {
        setActiveRoadmap(merged);
        setPendingDiff(null);
        setDiffDismissed(false);
    }, []);

    const handleDiffDismiss = useCallback(() => {
        setDiffDismissed(true);
    }, []);

    const handleAcceptInitialRoadmap = useCallback(() => {
        if (generatedRoadmap) {
            saveAcceptedRoadmap(generatedRoadmap, performanceHistory.length);
            setActiveRoadmap(generatedRoadmap);
        }
    }, [generatedRoadmap, performanceHistory.length]);

    // Chart data
    const trendData = useMemo(() => {
        if (!performanceHistory || performanceHistory.length === 0) return [];
        const sorted = [...performanceHistory].sort(
            (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return sorted.map((p, i) => ({
            name: "#" + (i + 1),
            overall: p.overallScore,
            technical: p.technicalScore,
            communication: p.communicationScore,
            behavioral: p.behavioralScore,
            date: new Date(p.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
        }));
    }, [performanceHistory]);

    const handleExportHTML = useCallback(() => {
        if (portfolio) {
            downloadPortfolioReport(portfolio);
        }
    }, [portfolio]);

    const handleShareSummary = useCallback(async () => {
        if (!report || !portfolio) return;
        const summary = [
            "Interview Intelligence Summary",
            "Readiness Index: " + report.readinessIndex.value + "/100",
            "Recruiter Sim Score: " + report.recruiterSimScore.value + "/100",
            "Certification: " + portfolio.certificationScore.tier,
            "Interviews: " + report.dataQuality.totalInterviews,
            "",
            "Top Skills: " + portfolio.skillIndicators.slice(0, 3).map(s => s.skill + " (" + s.score + ")").join(", "),
        ].join("\n");
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.warn("Clipboard API unavailable");
        }
    }, [report, portfolio]);

    // ── Empty State ──
    if (!report || !performanceHistory || performanceHistory.length === 0) {
        return (
            <div className={"ead-root " + (isDark ? "ead-dark" : "")}>
                <div className="ead-banner ead-animate-in">
                    <div className="ead-banner-title">
                        <Brain size={22} /> Enterprise AI Analytics
                    </div>
                    <div className="ead-banner-sub">
                        Real-data intelligence — no mock data, no placeholders
                    </div>
                </div>
                <div className="ead-glass ead-empty-state ead-animate-in">
                    <h3>No Interview Data Yet</h3>
                    <p>Complete your first mock interview to see enterprise-grade analytics.</p>
                    <p style={{ marginTop: 8, fontSize: "0.75rem" }}>
                        All metrics are computed from your actual interview recordings, transcripts, and scores.
                    </p>
                </div>
            </div>
        );
    }

    // ── Render ──
    const certClass =
        portfolio?.certificationScore.tier === "Gold"
            ? "ead-cert-gold"
            : portfolio?.certificationScore.tier === "Silver"
                ? "ead-cert-silver"
                : portfolio?.certificationScore.tier === "Bronze"
                    ? "ead-cert-bronze"
                    : "ead-cert-progress";

    return (
        <div className={"ead-root " + (isDark ? "ead-dark" : "")}>
            {/* ── Banner ── */}
            <div className="ead-banner ead-animate-in">
                <div className="ead-banner-title">
                    <Brain size={22} /> Enterprise AI Analytics
                </div>
                <div className="ead-banner-sub">
                    100% real data — {report.dataQuality.totalInterviews} interview{report.dataQuality.totalInterviews !== 1 ? "s" : ""} analyzed, {report.dataQuality.totalTranscriptWords.toLocaleString()} transcript words processed
                </div>
                <div className="ead-data-quality">
                    <span className="ead-dq-badge">
                        <Activity size={12} />
                        Data completeness: {report.dataQuality.averageDataCompleteness}%
                    </span>
                    <span className="ead-dq-badge">
                        <ShieldCheck size={12} />
                        Confidence: {report.dataQuality.confidence}
                    </span>
                </div>
            </div>

            {/* ── Certification ── */}
            {portfolio && (
                <div className={"ead-cert " + certClass + " ead-animate-in"}>
                    <Award size={20} />
                    {portfolio.certificationScore.label} — {portfolio.certificationScore.value}/100
                    <span style={{ fontSize: "0.7rem", fontWeight: 400, opacity: 0.8 }}>
                        ({portfolio.certificationScore.criteria})
                    </span>
                </div>
            )}

            {/* ── KPI Hero Grid ── */}
            <div className="ead-kpi-grid">
                <div className="ead-glass ead-kpi ead-animate-in">
                    <div className="ead-kpi-value">{report.readinessIndex.value}</div>
                    <div className="ead-kpi-label">Readiness Index</div>
                    <div className="ead-kpi-sub" title={report.readinessIndex.calculation}>
                        {report.readinessIndex.confidence} confidence
                    </div>
                </div>
                <div className="ead-glass ead-kpi ead-animate-in">
                    <div className="ead-kpi-value">{report.recruiterSimScore.value}</div>
                    <div className="ead-kpi-label">Recruiter Sim</div>
                    <div className="ead-kpi-sub" title={report.recruiterSimScore.calculation}>
                        Simulated recruiter eval
                    </div>
                </div>
                <div className="ead-glass ead-kpi ead-animate-in">
                    <div className="ead-kpi-value">{report.dataQuality.totalInterviews}</div>
                    <div className="ead-kpi-label">Interviews</div>
                    <div className="ead-kpi-sub">Real sessions analyzed</div>
                </div>
                <div className="ead-glass ead-kpi ead-animate-in">
                    <div className="ead-kpi-value">
                        {report.growthPredictions.length > 0
                            ? (report.growthPredictions[0].regressionSlope >= 0 ? "+" : "") +
                            report.growthPredictions[0].regressionSlope
                            : "—"}
                    </div>
                    <div className="ead-kpi-label">Growth Rate</div>
                    <div className="ead-kpi-sub">Pts/interview (regression)</div>
                </div>
            </div>

            {/* ── Score Trends Chart ── */}
            {trendData.length >= 2 && (
                <CollapsibleSection
                    icon={<TrendingUp size={16} color="var(--ead-accent)" />}
                    title="Performance Trajectory"
                    badge="REAL DATA"
                >
                    <div style={{ width: "100%", height: 220, marginTop: 8 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="eadGradOverall" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="eadGradTech" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ead-border)" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: "var(--ead-text3)" }}
                                    stroke="var(--ead-border)"
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: "var(--ead-text3)" }}
                                    stroke="var(--ead-border)"
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--ead-card)",
                                        border: "1px solid var(--ead-border)",
                                        borderRadius: 10,
                                        fontSize: 12,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="overall"
                                    stroke="#6366f1"
                                    fill="url(#eadGradOverall)"
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: "#6366f1" }}
                                    name="Overall"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="technical"
                                    stroke="#10b981"
                                    fill="url(#eadGradTech)"
                                    strokeWidth={1.5}
                                    dot={{ r: 2, fill: "#10b981" }}
                                    name="Technical"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="communication"
                                    stroke="#f59e0b"
                                    fill="transparent"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    dot={{ r: 2, fill: "#f59e0b" }}
                                    name="Communication"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {report.growthPredictions.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ead-text)", marginBottom: 6 }}>
                                Growth Predictions (Linear Regression)
                            </div>
                            {report.growthPredictions.map((pred, i) => (
                                <div key={i} className="ead-pred-row">
                                    <span className="ead-pred-metric">{pred.metric}</span>
                                    <span style={{ color: "var(--ead-text2)", fontSize: "0.78rem" }}>
                                        {pred.currentValue}
                                    </span>
                                    <span className={"ead-pred-arrow " + (pred.regressionSlope > 0 ? "ead-up" : pred.regressionSlope < 0 ? "ead-down" : "ead-flat")}>
                                        {pred.regressionSlope > 0 ? "\u2192 " : pred.regressionSlope < 0 ? "\u2192 " : "\u2192 "}
                                        {pred.predictedNext}
                                    </span>
                                    <span style={{ fontSize: "0.68rem", color: "var(--ead-text3)" }}>
                                        R\u00b2={pred.rSquared} | {pred.timeToTarget}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>
            )}

            <div className="ead-two-col">
                {/* ── NLP Transcript Intelligence ── */}
                <CollapsibleSection
                    icon={<MessageSquare size={16} color="var(--ead-accent)" />}
                    title="Transcript Intelligence"
                    badge="NLP"
                >
                    <MetricRow metric={report.transcript.starScore} />
                    <MetricRow metric={report.transcript.fillerWordDensity} />
                    <MetricRow metric={report.transcript.semanticDepth} />
                    <MetricRow metric={report.transcript.answerStructure} />
                    <MetricRow metric={report.transcript.communicationEffectiveness} />
                    <MetricRow metric={report.transcript.vocabularyRichness} />

                    {report.transcript.topFillerWords.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--ead-text)", marginBottom: 4 }}>
                                Top Filler Words
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {report.transcript.topFillerWords.map((fw, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: "0.68rem",
                                            padding: "2px 8px",
                                            borderRadius: 6,
                                            background: "rgba(239,68,68,0.1)",
                                            color: "var(--ead-danger)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        &ldquo;{fw.word}&rdquo; x{fw.count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {report.transcript.strongAnswerPatterns.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            {report.transcript.strongAnswerPatterns.map((p, i) => (
                                <div key={i} style={{ fontSize: "0.73rem", color: "var(--ead-success)", display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                                    <CheckCircle size={11} /> {p}
                                </div>
                            ))}
                        </div>
                    )}
                    {report.transcript.weakAnswerPatterns.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            {report.transcript.weakAnswerPatterns.map((p, i) => (
                                <div key={i} style={{ fontSize: "0.73rem", color: "var(--ead-warning)", display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                                    <AlertTriangle size={11} /> {p}
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>

                {/* ── Behavioral Intelligence ── */}
                <CollapsibleSection
                    icon={<Brain size={16} color="var(--ead-accent)" />}
                    title="Behavioral Intelligence"
                    badge="AI MODEL"
                >
                    <MetricRow metric={report.behavioral.confidenceIndex} />
                    <MetricRow metric={report.behavioral.engagementTrajectory} />
                    <MetricRow metric={report.behavioral.stressResilience} />
                    <MetricRow metric={report.behavioral.adaptability} />
                    <MetricRow metric={report.behavioral.professionalPresence} />
                    <MetricRow metric={report.behavioral.emotionalIntelligence} />

                    <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                        <div style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--ead-accent)", marginBottom: 4 }}>
                            Composite Confidence Model — {report.behavioral.compositeModel.score}/100
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--ead-text3)", lineHeight: 1.5 }}>
                            Formula: {report.behavioral.compositeModel.formula}
                        </div>
                    </div>
                </CollapsibleSection>
            </div>

            {/* ── Benchmark Comparison ── */}
            {report.benchmarks.length > 0 && (
                <CollapsibleSection
                    icon={<BarChart3 size={16} color="var(--ead-accent)" />}
                    title="Benchmark Comparison"
                    badge={"P" + (report.benchmarks.find(b => b.metric === "Overall Score")?.percentile ?? "??") + " OVERALL"}
                >
                    {report.benchmarks.map((bm, i) => (
                        <div key={i} className="ead-bench-row">
                            <span className="ead-bench-label">{bm.metric}</span>
                            <div className="ead-bench-bars">
                                <div className="ead-bench-track">
                                    <div
                                        className="ead-bench-fill-user"
                                        style={{ width: bm.yourScore + "%" }}
                                    />
                                </div>
                                <div className="ead-bench-track">
                                    <div
                                        className="ead-bench-fill-p50"
                                        style={{ width: bm.benchmarkP50 + "%" }}
                                    />
                                </div>
                            </div>
                            <div className="ead-bench-scores">
                                <span style={{ fontWeight: 700, color: "var(--ead-accent)", fontSize: "0.8rem" }}>
                                    {bm.yourScore}
                                </span>
                                <span style={{ fontSize: "0.65rem", color: "var(--ead-text3)" }}>
                                    vs {bm.benchmarkP50}
                                </span>
                            </div>
                            <span className={"ead-percentile-badge " + pClass(bm.percentile)}>
                                P{bm.percentile}
                            </span>
                        </div>
                    ))}
                    <div className="ead-calc-tip" style={{ marginTop: 8 }}>
                        Benchmarks based on role-specific aggregate data. Percentile estimated via linear interpolation between P25/P50/P75 quartiles.
                    </div>
                </CollapsibleSection>
            )}

            {/* ── Knowledge Gaps ── */}
            {report.knowledgeGaps.length > 0 && (
                <CollapsibleSection
                    icon={<Target size={16} color="var(--ead-accent)" />}
                    title="Knowledge Gap Analysis"
                    badge={report.knowledgeGaps.filter(g => g.severity === "critical").length + " CRITICAL"}
                >
                    {report.knowledgeGaps.map((gap, i) => (
                        <div
                            key={i}
                            className={"ead-gap-card ead-gap-" + gap.severity}
                            style={{ background: "var(--ead-card)" }}
                        >
                            <div className="ead-gap-header">
                                <span className="ead-gap-title">
                                    {gap.severity === "critical" ? <XCircle size={14} style={{ marginRight: 4 }} /> : gap.severity === "moderate" ? <AlertTriangle size={14} style={{ marginRight: 4 }} /> : <CheckCircle size={14} style={{ marginRight: 4 }} />}
                                    {gap.category}
                                </span>
                                <span className={"ead-gap-severity ead-sev-" + gap.severity}>
                                    {gap.severity}
                                </span>
                            </div>
                            <div className="ead-gap-detail">
                                Your avg: <strong>{gap.averageScore}</strong> vs benchmark: <strong>{gap.benchmarkScore}</strong> (gap: -{gap.gap} pts, trend: {gap.trend}, n={gap.dataPoints})
                            </div>
                            {gap.specificWeaknesses.length > 0 && (
                                <div className="ead-gap-detail" style={{ marginTop: 4 }}>
                                    {gap.specificWeaknesses.map((w, j) => (
                                        <div key={j} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                            <span style={{ color: "var(--ead-danger)" }}>\u2022</span> {w}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {gap.recommendedTopics.length > 0 && (
                                <div className="ead-gap-detail" style={{ marginTop: 4, color: "var(--ead-accent)" }}>
                                    {gap.recommendedTopics.slice(0, 2).map((t, j) => (
                                        <div key={j} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                            <Zap size={11} /> {t}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </CollapsibleSection>
            )}

            {/* ── AI Roadmap Loading Indicator ── */}
            {isAIRoadmapLoading && (
                <div className="ead-ai-loading-banner" style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    animation: "pulse 2s ease-in-out infinite",
                }}>
                    <Sparkles size={20} style={{ color: "var(--ead-accent)", animation: "spin 3s linear infinite" }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ead-text1)" }}>
                            Generating AI-Powered Roadmap...
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--ead-text3)", marginTop: 2 }}>
                            Analyzing your performance data with Gemini AI for personalized drills and practice questions
                        </div>
                    </div>
                </div>
            )}

            {/* ── Roadmap Merge Panel (GitHub-style) ── */}
            {pendingDiff && pendingDiff.hasChanges && !diffDismissed && (
                <RoadmapMergePanel
                    diff={pendingDiff}
                    interviewCount={performanceHistory.length}
                    onMergeComplete={handleMergeComplete}
                    onDismiss={handleDiffDismiss}
                />
            )}

            {/* ── AI Growth Roadmap ── */}
            {roadmap && roadmap.weeklyPlans.length > 0 && (
                <CollapsibleSection
                    icon={<BookOpen size={16} color="var(--ead-accent)" />}
                    title="AI Growth Roadmap"
                    badge={roadmap.estimatedWeeksToGoal + " WEEKS"}
                    defaultOpen={false}
                >
                    <div style={{ fontSize: "0.78rem", color: "var(--ead-text2)", marginBottom: 12 }}>
                        <strong>Goal:</strong> {roadmap.overallGoal}
                    </div>

                    {/* First-time accept button */}
                    {!loadAcceptedRoadmap() && (
                        <div style={{ marginBottom: 12 }}>
                            <button
                                className="ead-export-btn"
                                onClick={handleAcceptInitialRoadmap}
                                style={{ fontSize: "0.78rem" }}
                            >
                                <CheckCircle size={14} /> Accept & Track This Roadmap
                            </button>
                            <div style={{ fontSize: "0.65rem", color: "var(--ead-text3)", marginTop: 4 }}>
                                Accept this roadmap to enable auto-update tracking. After new interviews, you&apos;ll see a diff of what changed.
                            </div>
                        </div>
                    )}

                    {roadmap.weeklyPlans.map((week, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--ead-accent)" }}>
                                    Week {week.weekNumber}: {week.theme}
                                </span>
                                <span style={{ fontSize: "0.63rem", color: "var(--ead-text3)" }}>
                                    ~{week.estimatedTimeMinutes} min
                                </span>
                            </div>

                            {/* Drills */}
                            {week.drills.map((drill, j) => (
                                <div key={j} className="ead-drill">
                                    <div className="ead-drill-title">
                                        <Zap size={13} style={{ display: "inline", marginRight: 4 }} />
                                        {drill.name}
                                    </div>
                                    <div className="ead-drill-desc">{drill.description}</div>
                                    <ol className="ead-drill-steps">
                                        {drill.steps.map((step, k) => (
                                            <li key={k}>{step}</li>
                                        ))}
                                    </ol>
                                    <div className="ead-drill-meta">
                                        <span>\u23f1 {drill.duration}</span>
                                        <span>\ud83c\udfaf {drill.targetMetric}: {drill.currentValue} \u2192 {drill.targetValue}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Practice Questions */}
                            {week.practiceQuestions.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--ead-text)", marginBottom: 4 }}>
                                        Practice Questions
                                    </div>
                                    {week.practiceQuestions.map((q, j) => (
                                        <div key={j} style={{ padding: "6px 0", borderBottom: "1px solid var(--ead-border)" }}>
                                            <div style={{ fontSize: "0.78rem", color: "var(--ead-text)", fontWeight: 600 }}>
                                                {q.question}
                                            </div>
                                            <div style={{ fontSize: "0.65rem", color: "var(--ead-text3)", marginTop: 2 }}>
                                                {q.category} \u2022 {q.difficulty} \u2022 Target: {q.targetSkill}
                                            </div>
                                            {q.rationale && (
                                                <div style={{ fontSize: "0.65rem", color: "var(--ead-accent)", marginTop: 1, fontStyle: "italic" }}>
                                                    {q.rationale}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {i < roadmap.weeklyPlans.length - 1 && <div className="ead-divider" style={{ marginTop: 12 }} />}
                        </div>
                    ))}
                </CollapsibleSection>
            )}

            {/* ── Export Footer ── */}
            <div className="ead-glass ead-export-footer ead-animate-in">
                <div style={{ fontSize: "0.73rem", color: "var(--ead-text3)" }}>
                    Generated from {report.dataQuality.totalInterviews} real interviews \u2022 {report.dataQuality.totalTranscriptWords.toLocaleString()} words analyzed \u2022 Data completeness: {report.dataQuality.averageDataCompleteness}%
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="ead-export-btn" onClick={handleExportHTML}>
                        <Download size={14} /> Export Report
                    </button>
                    <button
                        className="ead-export-btn ead-btn-secondary"
                        onClick={handleShareSummary}
                    >
                        <Share2 size={14} /> {copied ? "Copied!" : "Share Summary"}
                    </button>
                </div>
            </div>

            <div style={{ height: 24 }} />
        </div>
    );
};

export default EnterpriseAnalyticsDashboard;
