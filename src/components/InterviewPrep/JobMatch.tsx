// Job Match Component - Match jobs with resume for interview prep
import React, { useState, useEffect } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  Filter,
  RefreshCw,
  Star,
  AlertCircle,
  Lightbulb,
  Target,
} from "lucide-react";
import { JobPostingService } from "../../services/jobPostingService";
import { JobMatchingService } from "../../services/jobMatchingService";
import { ResumeStorage } from "../../utils/resumeStorage";
import type { JobPosting, JobMatchResult, JobSearchFilters } from "../../types/jobMatching";
import type { ResumeData } from "../../types/resumeBuilder";

export const JobMatch: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<JobMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobMatchResult | null>(null);
  const [searchFilters, setSearchFilters] = useState<JobSearchFilters>({
    keywords: "software engineer",
    location: "",
    maxResults: 20,
  });
  const [matchThreshold, setMatchThreshold] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [matchingProgress, setMatchingProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);

  // Load resume on mount
  useEffect(() => {
    const loadResume = () => {
      const saved = ResumeStorage.loadFromLocal();
      if (saved) {
        setResumeData(saved);
      } else {
        setError("No resume found. Please create a resume first in the Resume Builder.");
      }
    };
    loadResume();
  }, []);

  // Fetch jobs
  const handleSearch = async () => {
    if (!searchFilters.keywords?.trim()) {
      setError("Please enter job keywords to search");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedJobs = await JobPostingService.searchJobs(searchFilters);
      setJobs(fetchedJobs);

      // Auto-match if resume is available
      if (resumeData && fetchedJobs.length > 0) {
        await handleMatch(fetchedJobs);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs. Please try again.");
      console.error("Error fetching jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Match jobs with resume
  const handleMatch = async (jobsToMatch: JobPosting[] = jobs) => {
    if (!resumeData) {
      setError("No resume found. Please create a resume first.");
      return;
    }

    setIsMatching(true);
    setError(null);
    setMatchingProgress({
      current: 0,
      total: jobsToMatch.length,
      message: "Starting job matching...",
    });

    try {
      // Simulate progress updates (since matching happens in batches)
      const progressInterval = setInterval(() => {
        setMatchingProgress((prev) => {
          if (!prev) return null;
          const newCurrent = Math.min(prev.current + 2, prev.total);
          return {
            ...prev,
            current: newCurrent,
            message: `Matching jobs... ${newCurrent}/${prev.total}`,
          };
        });
      }, 2000);

      const results = await JobMatchingService.matchMultipleJobs(
        jobsToMatch,
        resumeData,
        matchThreshold
      );

      clearInterval(progressInterval);
      setMatchingProgress({
        current: jobsToMatch.length,
        total: jobsToMatch.length,
        message: "Matching complete!",
      });

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMatchedJobs(results);
      setMatchingProgress(null);
      
      if (results.length === 0) {
        setError(`No jobs found with match score above ${matchThreshold}%. Try lowering the threshold or improving your resume.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to match jobs. Please try again.");
      console.error("Error matching jobs:", err);
      setMatchingProgress(null);
    } finally {
      setIsMatching(false);
    }
  };

  // Get match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Get match score bg color
  const getMatchScoreBgColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Job Matcher
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find and match job postings with your resume using AI
            </p>
          </div>
        </div>

        {/* Resume Status */}
        {resumeData ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>Resume loaded: {resumeData.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <XCircle className="w-4 h-4" />
            <span>No resume found. Please create one in the Resume Builder.</span>
          </div>
        )}
      </div>

      {/* Search Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Keywords
            </label>
            <input
              type="text"
              value={searchFilters.keywords || ""}
              onChange={(e) =>
                setSearchFilters({ ...searchFilters, keywords: e.target.value })
              }
              placeholder="e.g., Software Engineer, React Developer"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={searchFilters.location || ""}
              onChange={(e) =>
                setSearchFilters({ ...searchFilters, location: e.target.value })
              }
              placeholder="e.g., San Francisco, Remote"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Match Threshold (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={isLoading || !resumeData}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search Jobs
          </button>

          {jobs.length > 0 && resumeData && (
            <button
              onClick={() => handleMatch()}
              disabled={isMatching}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMatching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              Match with Resume
            </button>
          )}
        </div>
      </div>

      {/* Matching Progress */}
      {matchingProgress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {matchingProgress.message}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(matchingProgress.current / matchingProgress.total) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Processing in batches to avoid rate limits. This may take a minute...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {matchedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Matched Jobs ({matchedJobs.length})
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Sorted by match score
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matchedJobs.map((match) => (
              <div
                key={match.job.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${
                  selectedJob?.job.id === match.job.id
                    ? "border-blue-500 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                } p-6 cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => setSelectedJob(match)}
              >
                {/* Match Score Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`px-3 py-1 rounded-full ${getMatchScoreBgColor(
                      match.matchScore
                    )} ${getMatchScoreColor(match.matchScore)} font-bold text-sm`}
                  >
                    {match.matchScore}% Match
                  </div>
                  {match.matchScore >= 80 && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>

                {/* Job Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {match.job.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {match.job.company}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {match.job.location}
                  </div>
                  {match.job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {match.job.salary.min && match.job.salary.max
                        ? `$${match.job.salary.min.toLocaleString()} - $${match.job.salary.max.toLocaleString()}`
                        : match.job.salary.min
                        ? `$${match.job.salary.min.toLocaleString()}+`
                        : ""}
                    </div>
                  )}
                  {match.job.postedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.job.postedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Skills Match
                    </div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {match.breakdown.skills.score}%
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Experience
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {match.breakdown.experience.score}%
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(match);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Match Details
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedJob.job.title}
                  </h3>
                  <div
                    className={`px-4 py-2 rounded-lg ${getMatchScoreBgColor(
                      selectedJob.matchScore
                    )} ${getMatchScoreColor(selectedJob.matchScore)} font-bold`}
                  >
                    {selectedJob.matchScore}% Match
                  </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {selectedJob.job.company} • {selectedJob.job.location}
                </p>
                <a
                  href={selectedJob.job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Job Posting <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* AI Analysis */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  AI Analysis
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {selectedJob.aiAnalysis.overallFit}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                      Why You're a Good Match:
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {selectedJob.aiAnalysis.whyGoodMatch.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                      Potential Concerns:
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {selectedJob.aiAnalysis.potentialConcerns.map((concern, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Match Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Match Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Skills Match
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {selectedJob.breakdown.skills.score}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <div className="mb-1">
                        Matched: {selectedJob.breakdown.skills.matched.join(", ") || "None"}
                      </div>
                      {selectedJob.breakdown.skills.missing.length > 0 && (
                        <div className="text-red-600 dark:text-red-400">
                          Missing: {selectedJob.breakdown.skills.missing.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Experience Match
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {selectedJob.breakdown.experience.score}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedJob.breakdown.experience.matched.length > 0 && (
                        <div>
                          Matched: {selectedJob.breakdown.experience.matched.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {selectedJob.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interview Prep Tips */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  Interview Prep Tips
                </h4>
                <ul className="space-y-2">
                  {selectedJob.interviewPrepTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

