/**
 * Roadmap Merge Panel
 * ───────────────────
 * GitHub-style diff/merge UI for growth roadmap updates.
 * Shows what changed, lets user accept/reject/keep-both per item.
 */

import React, { useState, useCallback } from "react";
import {
    TrendingUp,
    TrendingDown,
    Plus,
    Trash2,
    Check,
    X,
    GitMerge,
    GitPullRequest,
    ChevronDown,
    ChevronRight,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    Minus,
    Sparkles,
} from "lucide-react";
import {
    RoadmapDiff,
    TargetDiff,
    ChangeType,
    GrowthRoadmap,
    applyMergeResolutions,
    saveAcceptedRoadmap,
} from "../../utils/growthEngine";
import "./RoadmapMergePanel.css";

/* ================================================================== */
/*  Props                                                              */
/* ================================================================== */

interface RoadmapMergePanelProps {
    diff: RoadmapDiff;
    interviewCount: number;
    onMergeComplete: (mergedRoadmap: GrowthRoadmap) => void;
    onDismiss: () => void;
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function changeTypeIcon(ct: ChangeType) {
    switch (ct) {
        case "improved":
            return <TrendingUp size={14} />;
        case "degraded":
            return <TrendingDown size={14} />;
        case "new":
            return <Plus size={14} />;
        case "removed":
            return <Trash2 size={14} />;
        case "unchanged":
            return <Minus size={14} />;
    }
}

function changeTypeColor(ct: ChangeType): string {
    switch (ct) {
        case "improved":
            return "#10b981";
        case "degraded":
            return "#ef4444";
        case "new":
            return "#6366f1";
        case "removed":
            return "#94a3b8";
        case "unchanged":
            return "#64748b";
    }
}

function changeTypeLabel(ct: ChangeType): string {
    switch (ct) {
        case "improved":
            return "IMPROVED";
        case "degraded":
            return "NEEDS FOCUS";
        case "new":
            return "NEW";
        case "removed":
            return "RESOLVED";
        case "unchanged":
            return "NO CHANGE";
    }
}

function statusBannerClass(status: RoadmapDiff["overallStatus"]): string {
    switch (status) {
        case "improved":
            return "rmp-banner-improved";
        case "degraded":
            return "rmp-banner-degraded";
        case "mixed":
            return "rmp-banner-mixed";
        default:
            return "rmp-banner-neutral";
    }
}

/* ================================================================== */
/*  DiffRow Component                                                  */
/* ================================================================== */

const DiffRow: React.FC<{
    td: TargetDiff;
    onResolve: (metric: string, resolution: TargetDiff["resolution"]) => void;
}> = ({ td, onResolve }) => {
    const [expanded, setExpanded] = useState(td.changeType !== "unchanged");
    const color = changeTypeColor(td.changeType);
    const isResolved = td.resolution !== "pending";

    return (
        <div
            className={"rmp-diff-row " + (isResolved ? "rmp-resolved" : "")}
            style={{ borderLeftColor: color }}
        >
            {/* Header */}
            <button
                className="rmp-diff-header"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="rmp-diff-icon" style={{ color }}>
                    {changeTypeIcon(td.changeType)}
                </span>
                <span className="rmp-diff-metric">{td.metric}</span>
                <span
                    className="rmp-diff-badge"
                    style={{ background: color + "18", color }}
                >
                    {changeTypeLabel(td.changeType)}
                </span>
                {td.deltaCurrentValue !== 0 && (
                    <span
                        className="rmp-diff-delta"
                        style={{
                            color:
                                td.deltaCurrentValue > 0
                                    ? "#10b981"
                                    : "#ef4444",
                        }}
                    >
                        {td.deltaCurrentValue > 0 ? "+" : ""}
                        {td.deltaCurrentValue} pts
                    </span>
                )}
                {isResolved && (
                    <span className="rmp-resolution-badge">
                        <CheckCircle size={12} />{" "}
                        {td.resolution === "accept"
                            ? "Accepted"
                            : td.resolution === "reject"
                                ? "Rejected"
                                : "Kept Both"}
                    </span>
                )}
                <span className="rmp-diff-chevron">
                    {expanded ? (
                        <ChevronDown size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )}
                </span>
            </button>

            {/* Expanded diff body */}
            {expanded && (
                <div className="rmp-diff-body">
                    <div className="rmp-diff-summary">{td.summary}</div>

                    {/* Side-by-side comparison for existing targets */}
                    {td.oldTarget && td.newTarget && (
                        <div className="rmp-diff-compare">
                            <div className="rmp-diff-side rmp-side-old">
                                <div className="rmp-side-label">
                                    <X size={12} /> Previous Plan
                                </div>
                                <div className="rmp-side-content">
                                    <div className="rmp-side-row">
                                        <span>Score:</span>
                                        <strong>
                                            {td.oldTarget.currentValue}
                                        </strong>
                                    </div>
                                    <div className="rmp-side-row">
                                        <span>Target:</span>
                                        <strong>
                                            {td.oldTarget.targetValue}
                                        </strong>
                                    </div>
                                    <div className="rmp-side-row">
                                        <span>Priority:</span>
                                        <strong>
                                            {td.oldTarget.priority}
                                        </strong>
                                    </div>
                                    <div className="rmp-side-row">
                                        <span>Timeframe:</span>
                                        <strong>
                                            {td.oldTarget.timeframe}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <div className="rmp-diff-arrow">
                                <ArrowRight size={16} />
                            </div>
                            <div className="rmp-diff-side rmp-side-new">
                                <div className="rmp-side-label">
                                    <Check size={12} /> Updated Plan
                                </div>
                                <div className="rmp-side-content">
                                    <div className="rmp-side-row">
                                        <span>Score:</span>
                                        <strong
                                            style={{
                                                color:
                                                    td.deltaCurrentValue > 0
                                                        ? "#10b981"
                                                        : td.deltaCurrentValue <
                                                            0
                                                            ? "#ef4444"
                                                            : "inherit",
                                            }}
                                        >
                                            {td.newTarget.currentValue}
                                            {td.deltaCurrentValue !== 0 &&
                                                " (" +
                                                (td.deltaCurrentValue > 0
                                                    ? "+"
                                                    : "") +
                                                td.deltaCurrentValue +
                                                ")"}
                                        </strong>
                                    </div>
                                    <div className="rmp-side-row">
                                        <span>Target:</span>
                                        <strong>
                                            {td.newTarget.targetValue}
                                        </strong>
                                    </div>
                                    <div className="rmp-side-row">
                                        <span>Priority:</span>
                                        <strong
                                            style={{
                                                color:
                                                    td.newTarget.priority !==
                                                        td.oldTarget.priority
                                                        ? "#f59e0b"
                                                        : "inherit",
                                            }}
                                        >
                                            {td.newTarget.priority}
                                            {td.newTarget.priority !==
                                                td.oldTarget.priority &&
                                                " (was " +
                                                td.oldTarget.priority +
                                                ")"}
                                        </strong>
                                    </div>
                                    <div className="rmp-side-row">
                                        <span>Timeframe:</span>
                                        <strong>
                                            {td.newTarget.timeframe}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New target only */}
                    {td.newTarget && !td.oldTarget && (
                        <div className="rmp-diff-new-only">
                            <div className="rmp-side-label" style={{ color: "#6366f1" }}>
                                <Sparkles size={12} /> New Target Detected
                            </div>
                            <div className="rmp-side-content">
                                <div className="rmp-side-row">
                                    <span>Score:</span>
                                    <strong>{td.newTarget.currentValue}</strong>
                                </div>
                                <div className="rmp-side-row">
                                    <span>Target:</span>
                                    <strong>{td.newTarget.targetValue}</strong>
                                </div>
                                <div className="rmp-side-row">
                                    <span>Priority:</span>
                                    <strong>{td.newTarget.priority}</strong>
                                </div>
                                {td.newTarget.actionItems.length > 0 && (
                                    <div className="rmp-side-actions">
                                        {td.newTarget.actionItems.slice(0, 2).map((a, i) => (
                                            <div key={i} className="rmp-action-item">• {a}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Removed target only */}
                    {td.oldTarget && !td.newTarget && (
                        <div className="rmp-diff-removed-only">
                            <div className="rmp-side-label" style={{ color: "#94a3b8" }}>
                                <CheckCircle size={12} /> Target Resolved
                            </div>
                            <div className="rmp-side-content">
                                <div className="rmp-side-row">
                                    <span>Previous score:</span>
                                    <strong>{td.oldTarget.currentValue}</strong>
                                </div>
                                <div className="rmp-side-row">
                                    <span>Was targeting:</span>
                                    <strong>{td.oldTarget.targetValue}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resolution buttons */}
                    {td.changeType !== "unchanged" && (
                        <div className="rmp-actions">
                            <button
                                className={
                                    "rmp-action-btn rmp-btn-accept " +
                                    (td.resolution === "accept"
                                        ? "rmp-btn-active"
                                        : "")
                                }
                                onClick={() => onResolve(td.metric, "accept")}
                                title={
                                    td.changeType === "removed"
                                        ? "Remove this target from the plan"
                                        : "Accept the updated plan"
                                }
                            >
                                <Check size={13} />{" "}
                                {td.changeType === "removed"
                                    ? "Remove"
                                    : td.changeType === "new"
                                        ? "Add to Plan"
                                        : "Accept Change"}
                            </button>
                            <button
                                className={
                                    "rmp-action-btn rmp-btn-reject " +
                                    (td.resolution === "reject"
                                        ? "rmp-btn-active"
                                        : "")
                                }
                                onClick={() => onResolve(td.metric, "reject")}
                                title={
                                    td.changeType === "removed"
                                        ? "Keep this target in the plan"
                                        : "Keep the previous plan"
                                }
                            >
                                <X size={13} />{" "}
                                {td.changeType === "removed"
                                    ? "Keep Target"
                                    : td.changeType === "new"
                                        ? "Skip"
                                        : "Keep Previous"}
                            </button>
                            {td.oldTarget && td.newTarget && (
                                <button
                                    className={
                                        "rmp-action-btn rmp-btn-merge " +
                                        (td.resolution === "keep_both"
                                            ? "rmp-btn-active"
                                            : "")
                                    }
                                    onClick={() =>
                                        onResolve(td.metric, "keep_both")
                                    }
                                    title="Keep both old and new targets"
                                >
                                    <GitMerge size={13} /> Keep Both
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ================================================================== */
/*  Main Panel                                                         */
/* ================================================================== */

export const RoadmapMergePanel: React.FC<RoadmapMergePanelProps> = ({
    diff,
    interviewCount,
    onMergeComplete,
    onDismiss,
}) => {
    const [resolutions, setResolutions] = useState<
        Record<string, TargetDiff["resolution"]>
    >(() => {
        const initial: Record<string, TargetDiff["resolution"]> = {};
        diff.targetDiffs.forEach((td) => {
            initial[td.metric] = td.resolution;
        });
        return initial;
    });

    const handleResolve = useCallback(
        (metric: string, resolution: TargetDiff["resolution"]) => {
            setResolutions((prev) => ({
                ...prev,
                [metric]:
                    prev[metric] === resolution ? "pending" : resolution,
            }));
        },
        []
    );

    const pendingCount = Object.values(resolutions).filter(
        (r) => r === "pending"
    ).length;
    const nonUnchangedCount = diff.targetDiffs.filter(
        (d) => d.changeType !== "unchanged"
    ).length;
    const allResolved = pendingCount === 0 || nonUnchangedCount === 0;

    const handleAcceptAll = useCallback(() => {
        const newRes: Record<string, TargetDiff["resolution"]> = {};
        diff.targetDiffs.forEach((td) => {
            newRes[td.metric] = "accept";
        });
        setResolutions(newRes);
    }, [diff]);

    const handleMerge = useCallback(() => {
        // Apply resolutions to diff
        const resolved: RoadmapDiff = {
            ...diff,
            targetDiffs: diff.targetDiffs.map((td) => ({
                ...td,
                resolution: resolutions[td.metric] || td.resolution,
            })),
        };
        const merged = applyMergeResolutions(resolved);
        saveAcceptedRoadmap(merged, interviewCount);
        onMergeComplete(merged);
    }, [diff, resolutions, interviewCount, onMergeComplete]);

    const bannerClass = statusBannerClass(diff.overallStatus);

    return (
        <div className="rmp-root">
            {/* Status banner */}
            <div className={"rmp-banner " + bannerClass}>
                <div className="rmp-banner-icon">
                    <GitPullRequest size={20} />
                </div>
                <div className="rmp-banner-content">
                    <div className="rmp-banner-title">
                        Roadmap Update Available
                    </div>
                    <div className="rmp-banner-headline">{diff.headline}</div>
                    <div className="rmp-banner-stats">
                        {diff.improvedCount > 0 && (
                            <span className="rmp-stat rmp-stat-improved">
                                <TrendingUp size={12} /> {diff.improvedCount}{" "}
                                improved
                            </span>
                        )}
                        {diff.degradedCount > 0 && (
                            <span className="rmp-stat rmp-stat-degraded">
                                <TrendingDown size={12} />{" "}
                                {diff.degradedCount} need focus
                            </span>
                        )}
                        {diff.newCount > 0 && (
                            <span className="rmp-stat rmp-stat-new">
                                <Plus size={12} /> {diff.newCount} new
                            </span>
                        )}
                        {diff.removedCount > 0 && (
                            <span className="rmp-stat rmp-stat-removed">
                                <CheckCircle size={12} /> {diff.removedCount}{" "}
                                resolved
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Diff rows */}
            <div className="rmp-diff-list">
                {diff.targetDiffs
                    .filter((td) => td.changeType !== "unchanged")
                    .map((td, i) => (
                        <DiffRow
                            key={td.metric + i}
                            td={{
                                ...td,
                                resolution:
                                    resolutions[td.metric] || td.resolution,
                            }}
                            onResolve={handleResolve}
                        />
                    ))}

                {/* Unchanged targets (collapsed) */}
                {diff.targetDiffs.some(
                    (td) => td.changeType === "unchanged"
                ) && (
                        <div className="rmp-unchanged-group">
                            <div className="rmp-unchanged-label">
                                <Minus size={12} />{" "}
                                {
                                    diff.targetDiffs.filter(
                                        (td) => td.changeType === "unchanged"
                                    ).length
                                }{" "}
                                unchanged targets (auto-accepted)
                            </div>
                        </div>
                    )}
            </div>

            {/* Action footer */}
            <div className="rmp-footer">
                <div className="rmp-footer-left">
                    {!allResolved && (
                        <span className="rmp-pending-badge">
                            <AlertTriangle size={12} />
                            {pendingCount} change
                            {pendingCount !== 1 ? "s" : ""} pending
                        </span>
                    )}
                    {allResolved && (
                        <span className="rmp-ready-badge">
                            <CheckCircle size={12} />
                            All changes resolved
                        </span>
                    )}
                </div>
                <div className="rmp-footer-actions">
                    <button
                        className="rmp-footer-btn rmp-btn-secondary"
                        onClick={onDismiss}
                    >
                        Dismiss
                    </button>
                    <button
                        className="rmp-footer-btn rmp-btn-secondary"
                        onClick={handleAcceptAll}
                    >
                        <Check size={13} /> Accept All
                    </button>
                    <button
                        className="rmp-footer-btn rmp-btn-primary"
                        onClick={handleMerge}
                        disabled={!allResolved}
                        title={
                            allResolved
                                ? "Apply your decisions and update the roadmap"
                                : "Resolve all pending changes first"
                        }
                    >
                        <GitMerge size={14} /> Merge & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoadmapMergePanel;
