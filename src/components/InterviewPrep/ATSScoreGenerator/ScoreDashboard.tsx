import React, { useState } from "react";
import {
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Copy,
  Eye,
  EyeOff,
  Lightbulb,
  BarChart3,
  Zap,
} from "lucide-react";
import { ScoreResult, ATSService } from "../../../utils/atsService";

interface ScoreDashboardProps {
  scoreResult: ScoreResult;
  onDownloadPDF: () => void;
  onNewAnalysis: () => void;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  scoreResult,
  onDownloadPDF,
  onNewAnalysis,
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState<number | null>(null);

  if (!scoreResult) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600 dark:text-gray-400">
          No score data available. Please run an analysis first.
        </p>
      </div>
    );
  }

  const { overall, sections, gates, matches, missingKeywords, suggestions } =
    scoreResult;

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/20";
    if (score >= 50) return "bg-orange-100 dark:bg-orange-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBullet(index);
      setTimeout(() => setCopiedBullet(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const failedGates = (gates || []).filter((gate) => !gate.passed);
  const passedGates = (gates || []).filter((gate) => gate.passed);

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(
            overall || 0
          )} mb-4`}
        >
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overall || 0)}`}>
              {overall || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ATS Score
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {getScoreGrade(overall || 0)} Match
        </h2>

        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your resume has been analyzed against the job description.
          {(overall || 0) >= 70
            ? " Great job! Your resume shows strong alignment with the requirements."
            : " There are opportunities to improve your resume for better ATS compatibility."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onDownloadPDF}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download Report</span>
        </button>

        <button
          onClick={onNewAnalysis}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Zap className="w-5 h-5" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Section Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(sections || {}).map(([section, score]) => {
          const icons = {
            skills: Target,
            experience: TrendingUp,
            education: Award,
            keywords: BarChart3,
          };

          const Icon = icons[section as keyof typeof icons];

          return (
            <div
              key={section}
              className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {section === "keywords" ? "Keywords" : section}
                </h3>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Requirements Gates */}
      {gates && gates.length > 0 && (
        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Requirements Check
          </h3>

          <div className="space-y-3">
            {failedGates.map((gate, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 dark:text-red-100">
                    {gate.rule}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {gate.details}
                  </p>
                  {gate.impact && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Impact: {gate.impact}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {passedGates.map((gate, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {gate.rule}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {gate.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords && missingKeywords.length > 0 && (
        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Missing Keywords
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Consider adding these keywords to improve your ATS score:
          </p>

          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Improvement Suggestions
          </h3>
        </div>

        {/* Top Actions */}
        {suggestions?.topActions && suggestions.topActions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Priority Actions
            </h4>
            <ul className="space-y-2">
              {suggestions.topActions.map((action, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Bullets */}
        {suggestions?.bullets && suggestions.bullets.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Suggested Bullet Points
            </h4>
            <div className="space-y-3">
              {suggestions.bullets.map((bullet, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                      {bullet}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bullet, index)}
                    className="flex items-center space-x-1 px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-xs">
                      {copiedBullet === index ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Debug Information */}
      {scoreResult.debug && (
        <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {showDebug ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {showDebug ? "Hide" : "Show"} Debug Information
            </span>
          </button>

          {showDebug && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Scoring Weights
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(scoreResult.debug.weights).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {key}:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {((value as number) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Processing Info
                </h4>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-700 p-3 rounded overflow-x-auto">
                  {JSON.stringify(scoreResult.debug.processingInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
