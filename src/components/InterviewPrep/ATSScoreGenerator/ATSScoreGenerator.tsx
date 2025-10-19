import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Zap,
  BarChart3,
  Download,
  History,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader,
  Target,
  TrendingUp,
  Award,
  Brain,
} from "lucide-react";
import {
  GeminiATSService,
  ATSScoreResult,
} from "../../../utils/geminiATSService";
import { FileUploadZone } from "./FileUploadZone";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { ScoreDashboard } from "./ScoreDashboard";
import { ScoreHistory } from "./ScoreHistory";
import { LoadingSpinner } from "../../ui/LoadingSpinner";

interface ATSScoreGeneratorProps {
  className?: string;
}

type TabType = "score" | "history" | "settings";

export const ATSScoreGenerator: React.FC<ATSScoreGeneratorProps> = ({
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("score");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState<ATSScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "input" | "results">("upload");

  const handleResumeUpload = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const parsed = await GeminiATSService.parseResumeFile(file);
      setResumeFile(file);
      setResumeText(parsed.text);
      setStep("input");
      console.log("✅ Resume parsed successfully:", {
        fileName: file.name,
        wordCount: parsed.metadata.wordCount,
        sectionsFound: Object.keys(parsed.sections).length,
      });
    } catch (error) {
      console.error("❌ Resume parsing failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to parse resume";

      // Check if this is a copy-paste guidance error
      if (
        errorMessage.includes("copy-paste") ||
        errorMessage.includes("Paste Text")
      ) {
        // Show helpful guidance with an icon
        setError(`📋 ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResumeTextInput = useCallback((text: string) => {
    setResumeText(text);
    setResumeFile(null);
    if (text.trim().length > 50) {
      setStep("input");
    }
  }, []);

  const handleJobDescriptionInput = useCallback((text: string) => {
    setJobDescriptionText(text);
  }, []);

  const handleGenerateScore = useCallback(async () => {
    if (!resumeText.trim()) {
      setError("Please provide a resume");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await GeminiATSService.generateATSScore(
        resumeText,
        jobDescriptionText.trim() || null
      );

      setScoreResult(result);
      setStep("results");

      console.log("✅ Score generated successfully:", {
        overall: result.overall,
        sections: result.sections,
        scoreRunId: result.scoreRunId,
      });
    } catch (error) {
      console.error("❌ Scoring failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate score"
      );
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, jobDescriptionText]);

  const handleReset = useCallback(() => {
    setResumeFile(null);
    setResumeText("");
    setJobDescriptionText("");
    setScoreResult(null);
    setError(null);
    setStep("upload");
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!scoreResult?.scoreRunId) {
      setError("No score run available for download");
      return;
    }

    try {
      const blob = await ATSService.downloadPDFReport(scoreResult.scoreRunId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ats-score-report-${scoreResult.scoreRunId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ PDF download failed:", error);
      setError("Failed to download PDF report");
    }
  }, [scoreResult]);

  const tabs = [
    { id: "score" as TabType, label: "Generate Score", icon: Target },
    { id: "history" as TabType, label: "Score History", icon: History },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ATS Score Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Analyze your resume against job descriptions with AI-powered
                insights
              </p>
            </div>
          </div>

          {scoreResult && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div
            className={`mb-6 p-4 border rounded-lg ${
              error.includes("📋")
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {error.includes("📋") ? (
                <div className="text-blue-600 dark:text-blue-400 text-lg">
                  📋
                </div>
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p
                className={
                  error.includes("📋")
                    ? "text-blue-800 dark:text-blue-200"
                    : "text-red-800 dark:text-red-200"
                }
              >
                {error.replace("📋 ", "")}
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="mb-6">
            <LoadingSpinner message="Processing your request..." />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "score" && (
          <div className="space-y-6">
            {step === "upload" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Step 1: Upload Your Resume
                  </h2>
                  <FileUploadZone
                    onFileUpload={handleResumeUpload}
                    onTextInput={handleResumeTextInput}
                    acceptedTypes={[".pdf", ".docx", ".txt"]}
                    maxSize={5 * 1024 * 1024} // 5MB
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {step === "input" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Resume uploaded: {resumeFile?.name || "Text input"}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Step 2: Add Job Description
                    </h2>
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      Optional
                    </span>
                  </div>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Skip this step</strong> for general resume
                      analysis, or add a job description for targeted ATS
                      matching.
                    </p>
                  </div>
                  <JobDescriptionInput
                    value={jobDescriptionText}
                    onChange={handleJobDescriptionInput}
                    placeholder="Paste the job description here (optional - for targeted analysis)..."
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep("upload")}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    ← Back to Upload
                  </button>

                  <button
                    onClick={handleGenerateScore}
                    disabled={!resumeText.trim() || isLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Generate ATS Score</span>
                  </button>
                </div>
              </div>
            )}

            {step === "results" && scoreResult && (
              <div>
                <ScoreDashboard
                  scoreResult={scoreResult}
                  onDownloadPDF={handleDownloadPDF}
                  onNewAnalysis={handleReset}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && <ScoreHistory />}

        {activeTab === "settings" && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Settings Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Customize scoring weights, keywords, and preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
