import React, { useState, useCallback } from "react";
import {
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
} from "lucide-react";
import { GeminiATSService } from "../../../utils/geminiATSService";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  placeholder = "Paste the job description here...",
  disabled = false,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!value.trim() || value.trim().length < 50) {
      setError("Job description must be at least 50 characters long");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await GeminiATSService.parseJobDescriptionText(value);
      setAnalysis(result);
      setShowAnalysis(true);
      console.log("✅ Job description analyzed:", result);
    } catch (error) {
      console.error("❌ Job description analysis failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to analyze job description"
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [value]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setIsAnalyzing(true);

      try {
        const result = await GeminiATSService.parseJobDescriptionFile(file);
        onChange(result.text);
        setAnalysis(result);
        setShowAnalysis(true);
        console.log("✅ Job description file parsed:", result);
      } catch (error) {
        console.error("❌ Job description file parsing failed:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to parse job description file"
        );
      } finally {
        setIsAnalyzing(false);
      }

      // Reset file input
      e.target.value = "";
    },
    [onChange]
  );

  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const charCount = value.length;

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {wordCount} words • {charCount} characters
          </div>

          {analysis && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Analyzed</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* File Upload */}
          <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload File</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={disabled || isAnalyzing}
            />
          </label>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={
              !value.trim() ||
              value.trim().length < 50 ||
              disabled ||
              isAnalyzing
            }
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? "Analyzing..." : "Analyze JD"}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && showAnalysis && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-purple-900 dark:text-purple-100">
              Job Description Analysis
            </h3>
            <button
              onClick={() => setShowAnalysis(false)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Requirements */}
            {analysis.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Hard Requirements ({analysis.requirements.length})
                </h4>
                <ul className="space-y-1">
                  {analysis.requirements
                    .slice(0, 3)
                    .map((req: string, index: number) => (
                      <li
                        key={index}
                        className="text-purple-700 dark:text-purple-300 text-xs"
                      >
                        • {req.length > 60 ? req.substring(0, 60) + "..." : req}
                      </li>
                    ))}
                  {analysis.requirements.length > 3 && (
                    <li className="text-purple-600 dark:text-purple-400 text-xs">
                      + {analysis.requirements.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Skills */}
            {analysis.skillsRequired.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Required Skills ({analysis.skillsRequired.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.skillsRequired
                    .slice(0, 8)
                    .map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  {analysis.skillsRequired.length > 8 && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400 rounded text-xs">
                      +{analysis.skillsRequired.length - 8}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {analysis.experienceYears && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Experience Required
                </h4>
                <p className="text-purple-700 dark:text-purple-300 text-xs">
                  {analysis.experienceYears} years minimum
                </p>
              </div>
            )}

            {/* Nice to Have */}
            {analysis.niceToHave.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Nice to Have ({analysis.niceToHave.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.niceToHave
                    .slice(0, 5)
                    .map((item: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded text-xs border border-purple-200 dark:border-purple-700"
                      >
                        {item.length > 20
                          ? item.substring(0, 20) + "..."
                          : item}
                      </span>
                    ))}
                  {analysis.niceToHave.length > 5 && (
                    <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900 text-purple-500 dark:text-purple-500 rounded text-xs border border-purple-200 dark:border-purple-700">
                      +{analysis.niceToHave.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
              <span>
                {analysis.metadata.wordCount} words •{" "}
                {analysis.metadata.requirementsCount} requirements •{" "}
                {analysis.metadata.skillsCount} skills
              </span>
              <span>Analysis complete ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          • <strong>Optional:</strong> Add a job description for targeted ATS
          analysis
        </p>
        <p>
          • <strong>Without JD:</strong> Get general resume quality assessment
        </p>
        <p>
          • <strong>With JD:</strong> Get specific matching score and targeted
          suggestions
        </p>
        <p>
          • Include requirements, responsibilities, and qualifications sections
          for best results
        </p>
      </div>
    </div>
  );
};
