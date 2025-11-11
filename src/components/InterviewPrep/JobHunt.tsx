// Job Hunt Component - Comprehensive job hunting system with job matching
import React, { useState, useEffect } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  TrendingUp,
  Filter,
  RefreshCw,
  Star,
  AlertCircle,
  Target,
  Sparkles,
  Loader2,
  Building2,
  Clock,
  Bookmark,
  CheckCircle2,
  XCircle,
  Settings,
  BarChart3,
  Zap,
} from "lucide-react";
import { jobHuntService, Job, JobFilter } from "../../services/jobHuntService";
import { realTimeAuth } from "../../utils/realTimeAuth";

// Job Hunt Tabs
type JobHuntTab = "search" | "matched" | "saved" | "applied" | "preferences";

export const JobHunt: React.FC = () => {
  const [activeTab, setActiveTab] = useState<JobHuntTab>("search");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters - More permissive defaults (passed to service)
  const [filters, setFilters] = useState<JobFilter>({
    // Leave location empty to load ALL jobs, filter in UI instead
    location: [],
    remote: true, // Include remote jobs
    postedWithin: 0, // 0 = no date filter at service level
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all"); // Changed to "all" to show all locations
  const [remoteFilter, setRemoteFilter] = useState(true);
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [postedWithinDays, setPostedWithinDays] = useState(365); // Changed to 365 days
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalJobs: 0,
    matchedJobs: 0,
    savedJobs: 0,
    appliedJobs: 0,
  });

  const userId = realTimeAuth.getCurrentUser()?.uid || "";

  // Load jobs on mount
  useEffect(() => {
    if (userId) {
      loadJobs();
      loadUserPreferences();
    }
  }, [userId]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, locationFilter, remoteFilter, skillsFilter, postedWithinDays]);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    console.log("🔄 Loading jobs for user:", userId);
    console.log("   Filters:", filters);
    
    try {
      const fetchedJobs = await jobHuntService.getJobs(userId, filters);
      console.log(`✅ Loaded ${fetchedJobs.length} jobs from service`);
      
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
      
      setStats({
        totalJobs: fetchedJobs.length,
        matchedJobs: fetchedJobs.filter(j => j.matchScore && j.matchScore >= 70).length,
        savedJobs: 0, // TODO: Track saved jobs
        appliedJobs: 0, // TODO: Track applied jobs
      });
      
      if (fetchedJobs.length === 0) {
        console.warn("⚠️ No jobs found in database");
        setError("No jobs available yet. Admin needs to add jobs from Job Management.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load jobs";
      setError(errorMessage);
      console.error("❌ Error loading jobs:", err);
      console.error("   Error details:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const prefs = await jobHuntService.getUserJobPreferences(userId);
      setUserPreferences(prefs);
      
      if (prefs?.skills) {
        setSkillsFilter(prefs.skills);
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    }
  };

  const handleRefreshJobs = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await jobHuntService.refreshJobs();
      await loadJobs();
    } catch (err: any) {
      setError("Failed to refresh jobs. Please try again later.");
      console.error("Error refreshing jobs:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    console.log(`🔍 Applying local filters to ${jobs.length} jobs...`);
    let filtered = [...jobs];
    
    // Search query
    if (searchQuery.trim()) {
      const beforeSearch = filtered.length;
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
      console.log(`   After search query "${searchQuery}": ${filtered.length} jobs (removed ${beforeSearch - filtered.length})`);
    }
    
    // Location and Remote filter (OR logic - show jobs matching location OR remote)
    const hasLocationFilter = locationFilter && locationFilter !== "all";
    const hasRemoteFilter = remoteFilter;
    
    // Only apply filter if a specific location is selected (not "all")
    if (hasLocationFilter) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter((job) => {
        // If remote filter is enabled, include remote jobs
        if (hasRemoteFilter && job.isRemote) {
          return true;
        }
        
        // If location filter is set, include jobs matching location
        if (locationFilter === "remote") {
          return job.isRemote;
        } else if (locationFilter === "hyderabad") {
          return job.isHyderabad || job.location.toLowerCase().includes("hyderabad");
        }
        // Check if job location contains the filter
        return job.location.toLowerCase().includes(locationFilter.toLowerCase());
      });
      console.log(`   After location/remote filter: ${filtered.length} jobs (removed ${beforeFilter - filtered.length})`);
    } else {
      console.log(`   Skipping location filter (showing all locations)`);
    }
    
    // Skills filter
    if (skillsFilter.length > 0) {
      const beforeSkills = filtered.length;
      filtered = filtered.filter((job) =>
        skillsFilter.some((skill) =>
          job.skills.some((jobSkill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
      console.log(`   After skills filter: ${filtered.length} jobs (removed ${beforeSkills - filtered.length})`);
    }
    
    // Posted within filter
    if (postedWithinDays > 0) {
      const beforeDate = filtered.length;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - postedWithinDays);
      filtered = filtered.filter((job) => job.postedDate >= cutoffDate);
      console.log(`   After postedWithin (${postedWithinDays} days) filter: ${filtered.length} jobs (removed ${beforeDate - filtered.length})`);
    }
    
    console.log(`   Final filtered jobs: ${filtered.length}`);
    setFilteredJobs(filtered);
  };

  const saveUserPreferences = async () => {
    if (!userId) return;
    
    try {
      await jobHuntService.saveUserJobPreferences(userId, {
        skills: skillsFilter,
        preferredLocations: [locationFilter],
        jobType: ["full-time", "remote"],
        updatedAt: new Date(),
      });
      
      setIsEditingPreferences(false);
      await loadUserPreferences();
      await loadJobs(); // Reload jobs to recalculate match scores
    } catch (err: any) {
      setError("Failed to save preferences");
      console.error("Error saving preferences:", err);
    }
  };

  const getMatchScoreColor = (score: number | undefined): string => {
    if (!score) return "text-gray-600 dark:text-gray-400";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchScoreBgColor = (score: number | undefined): string => {
    if (!score) return "bg-gray-100 dark:bg-gray-700";
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const getDaysAgo = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Job Hunt
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Find your perfect job in Hyderabad and remote positions
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefreshJobs}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Jobs</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Total Jobs</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalJobs}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 text-green-600 dark:text-green-400 mb-1">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">High Matches</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.matchedJobs}
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Saved</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.savedJobs}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Applied</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.appliedJobs}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "search"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Search Jobs</span>
              <span className="sm:hidden">Search</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("matched")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "matched"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Job Match</span>
              <span className="sm:hidden">Match</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "preferences"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Settings</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-6">
          {/* Search Jobs Tab */}
          {activeTab === "search" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Job title, company, keywords..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Posted Within
                  </label>
                  <select
                    value={postedWithinDays}
                    onChange={(e) => setPostedWithinDays(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">24 hours</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                    <option value="0">Any time</option>
                  </select>
                </div>
              </div>

              {/* Remote Filter Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remoteInclude"
                  checked={remoteFilter}
                  onChange={(e) => setRemoteFilter(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remoteInclude" className="text-sm text-gray-700 dark:text-gray-300">
                  Include remote jobs
                </label>
              </div>

              {/* Job Listings */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      {/* Match Score */}
                      {job.matchScore && (
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getMatchScoreBgColor(
                              job.matchScore
                            )} ${getMatchScoreColor(job.matchScore)}`}
                          >
                            {job.matchScore}% Match
                          </div>
                          {job.matchScore >= 80 && (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      )}

                      {/* Job Info */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {job.company}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </div>
                        {job.isRemote && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Zap className="w-3 h-3" />
                            Remote
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getDaysAgo(job.postedDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {job.source}
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description Preview */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(job.url, "_blank");
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          View Job
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Save job
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No jobs found matching your filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setLocationFilter("all");
                      setRemoteFilter(false);
                    }}
                    className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Job Match Tab */}
          {activeTab === "matched" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    AI Job Matching
                  </h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Jobs are automatically matched with your resume and preferences. Match scores are calculated based on skills, experience, location, and other factors.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  To improve match scores, update your preferences below and upload your resume in the Resume Builder.
                </p>
              </div>

              {/* Matched Jobs */}
              {jobs.filter((j) => j.matchScore && j.matchScore >= 60).length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {jobs
                    .filter((j) => j.matchScore && j.matchScore >= 60)
                    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                    .map((job) => (
                      <div
                        key={job.id}
                        className="bg-white dark:bg-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-6"
                      >
                        <div
                          className={`px-4 py-2 rounded-lg text-center mb-4 ${getMatchScoreBgColor(
                            job.matchScore
                          )}`}
                        >
                          <div className={`text-2xl font-bold ${getMatchScoreColor(job.matchScore)}`}>
                            {job.matchScore}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Match Score</div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {job.company} • {job.location}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => window.open(job.url, "_blank")}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          View Job <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No matched jobs found. Update your preferences to get personalized job matches.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Job Preferences
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Set your job preferences to get better matches and personalized recommendations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsFilter.join(", ")}
                    onChange={(e) => setSkillsFilter(e.target.value.split(",").map((s) => s.trim()))}
                    placeholder="React, TypeScript, Node.js, Python..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hyderabad">Hyderabad</option>
                    <option value="remote">Remote</option>
                    <option value="all">Anywhere</option>
                  </select>
                </div>

                <button
                  onClick={saveUserPreferences}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Job Details</h2>
              <button onClick={() => setSelectedJob(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedJob.matchScore && (
                <div className={`text-center py-4 rounded-lg ${getMatchScoreBgColor(selectedJob.matchScore)}`}>
                  <div className={`text-3xl font-bold ${getMatchScoreColor(selectedJob.matchScore)}`}>
                    {selectedJob.matchScore}% Match
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedJob.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {selectedJob.company} • {selectedJob.location}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {selectedJob.isRemote && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm">
                      Remote
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    {selectedJob.type}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                    {selectedJob.source}
                  </span>
                </div>
              </div>

              {selectedJob.salary && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Salary</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedJob.salary}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    // TODO: Save job
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
