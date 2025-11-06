import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  Settings,
  Shield,
  Activity,
  FileText,
  Video,
  MessageSquare,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  UserX,
  UserCheck,
  Database,
  Gift,
  Copy,
  Check,
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { 
  blockUser, 
  unblockUser, 
  getAllBlockedUsers, 
  isUserBlocked,
  BlockedUser 
} from "../../services/blockedUsersService";
import { ATSService } from "../../utils/atsService";
import {
  adminService,
  AdminStats,
  UsersResponse,
  AnalyticsData,
  SystemHealth,
} from "../../utils/adminService";
import {
  firebaseAdminService,
  FirebaseStats,
  FirebaseUser,
  TeamData,
} from "../../utils/firebaseAdminService";
import { 
  communityService, 
  Report as ReportType 
} from "../../services/communityService";
import { GeneralLayout } from "../layout/PageLayout";
import {
  createReferralCode,
  getAllReferralCodes,
  ReferralCode,
} from "../../services/referralCodeService";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("firebase"); // Start with Firebase tab (no ATS required)
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [firebaseStats, setFirebaseStats] = useState<FirebaseStats | null>(
    null
  );
  const [firebaseUsers, setFirebaseUsers] = useState<FirebaseUser[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockingUser, setBlockingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isATSAuthenticated, setIsATSAuthenticated] = useState(false);
  const [atsAuthLoading, setATSAuthLoading] = useState(false);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  const user = realTimeAuth.getCurrentUser();

  // Check admin access
  useEffect(() => {
    if (!user || user.email !== "akshayjuluri6704@gmail.com") {
      navigate("/dashboard");
      return;
    }

    // Check if user is authenticated with ATS backend
    setIsATSAuthenticated(ATSService.isAuthenticated());
  }, [user, navigate]);

  // Load admin data
  useEffect(() => {
    if (user?.email === "akshayjuluri6704@gmail.com") {
      // Always load Firebase admin features (blocked users, Firebase users, etc.)
      loadBlockedUsers();
      
      // Load reports (doesn't require ATS)
      if (activeTab === "reports") {
        loadReports();
        return;
      }
      
      // Load Firebase tab data (doesn't require ATS)
      if (activeTab === "firebase") {
        loadFirebaseData();
        return; // Don't load any ATS data when on Firebase tab
      }
      
      // Only load ATS backend data if authenticated AND not on Firebase/reports tab
      if (isATSAuthenticated && activeTab !== "firebase" && activeTab !== "reports") {
        loadAdminData();
      } else {
        // Clear ATS-related state if not authenticated
        setStats(null);
        setUsers(null);
        setAnalytics(null);
        setSystemHealth(null);
      }
    }
  }, [user, activeTab, currentPage, searchTerm, isATSAuthenticated]);

  // Load Firebase data separately (doesn't require ATS)
  const loadFirebaseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseStatsData = await firebaseAdminService.getFirebaseStats();
      setFirebaseStats(firebaseStatsData);

      const firebaseUsersData = await firebaseAdminService.getFirebaseUsers(20);
      setFirebaseUsers(firebaseUsersData.users);

      const teamsData = await firebaseAdminService.getTeams();
      setTeams(teamsData);

      // Load referral codes
      await loadReferralCodes();
    } catch (firebaseError) {
      console.warn("Firebase admin access not available:", firebaseError);
      setError("Failed to load Firebase data. Please check your Firebase configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Load referral codes
  const loadReferralCodes = async () => {
    try {
      const codes = await getAllReferralCodes();
      // Sort by created date (newest first)
      codes.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bTime = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bTime - aTime;
      });
      setReferralCodes(codes);
    } catch (error) {
      console.error("Error loading referral codes:", error);
    }
  };

  // Generate new referral code
  const handleGenerateCode = async () => {
    if (!user) return;
    
    try {
      setGeneratingCode(true);
      const newCode = await createReferralCode(user.id, 1); // 1 month premium
      await loadReferralCodes(); // Reload codes to show the new one
      alert(`Referral code generated: ${newCode}`);
    } catch (error: any) {
      console.error("Error generating referral code:", error);
      alert(error.message || "Failed to generate referral code");
    } finally {
      setGeneratingCode(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  // Load blocked users
  const loadBlockedUsers = async () => {
    try {
      const blocked = await getAllBlockedUsers();
      setBlockedUsers(blocked);
    } catch (error) {
      console.error("Error loading blocked users:", error);
    }
  };

  // Load reports
  const loadReports = () => {
    try {
      setLoading(true);
      const unsubscribe = communityService.subscribeToReports((newReports) => {
        setReports(newReports);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error loading reports:", error);
      setLoading(false);
      return () => {};
    }
  };

  // Handle report status update
  const handleUpdateReportStatus = async (
    reportId: string,
    status: "pending" | "reviewed" | "resolved" | "dismissed"
  ) => {
    if (!user) return;
    
    setUpdatingReportId(reportId);
    try {
      await communityService.updateReportStatus(reportId, status, user.id);
    } catch (error: any) {
      console.error("Error updating report status:", error);
      alert(error.message || "Failed to update report status");
    } finally {
      setUpdatingReportId(null);
    }
  };

  // Handle delete comment from report
  const handleDeleteCommentFromReport = async (commentId: string, postId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }

    setUpdatingReportId(commentId);
    try {
      await communityService.deleteComment(commentId, postId);
      alert("Comment deleted successfully");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Failed to delete comment");
    } finally {
      setUpdatingReportId(null);
    }
  };

  const loadAdminData = async () => {
    // STRICT CHECK: Don't load ATS backend data if not authenticated
    if (!isATSAuthenticated) {
      console.log("🚫 Skipping ATS backend data load - not authenticated");
      return;
    }

    // Double-check: Don't load if on Firebase tab
    if (activeTab === "firebase") {
      console.log("🚫 Skipping ATS backend data load - on Firebase tab");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // All these calls require ATS authentication
      if (activeTab === "overview") {
        const statsData = await adminService.getStats();
        setStats(statsData);
      } else if (activeTab === "users") {
        const usersData = await adminService.getUsers({
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
        });
        setUsers(usersData);
      } else if (activeTab === "analytics") {
        const analyticsData = await adminService.getAnalytics("30");
        setAnalytics(analyticsData);
      } else if (activeTab === "settings") {
        const healthData = await adminService.getSystemHealth();
        setSystemHealth(healthData);
      }
      // Firebase tab is handled separately in loadFirebaseData() - doesn't require ATS
    } catch (err) {
      console.error("Admin data loading error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load admin data";
      // Don't show ATS auth errors if user hasn't authenticated
      if (errorMessage.includes("authentication token") || errorMessage.includes("ATS backend")) {
        setError("ATS backend authentication required. Please authenticate or use Firebase Admin features.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Utility functions (don't require ATS)
  const formatDate = (date: string | Date): string => {
    if (!date) return "N/A";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatNumber = (num: number): string => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatUptime = (seconds: number): string => {
    if (!seconds || seconds === 0) return "0s";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(" ");
  };

  // Handle ATS authentication
  const handleATSAuth = async () => {
    try {
      setATSAuthLoading(true);
      setError(null);

      // Use the admin email for ATS authentication
      const adminEmail = "akshayjuluri6704@gmail.com";

      // Try to authenticate with ATS backend using magic link
      await ATSService.magicLink(adminEmail);
      setIsATSAuthenticated(true);
    } catch (err) {
      console.error("ATS authentication error:", err);
      setError("Failed to authenticate with ATS backend. Please try again.");
    } finally {
      setATSAuthLoading(false);
    }
  };

  if (!user || user.email !== "akshayjuluri6704@gmail.com") {
    return (
      <GeneralLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access the admin dashboard.
            </p>
          </div>
        </div>
      </GeneralLayout>
    );
  }

  // Show ATS authentication prompt if not authenticated (optional - can skip)
  if (!isATSAuthenticated) {
    return (
      <GeneralLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ATS Backend Authentication (Optional)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Some features require ATS backend authentication. You can skip this to access Firebase admin features.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {error}
                  </p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-500 mt-1">
                    ATS backend may not be running. You can skip authentication to access Firebase admin features.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleATSAuth}
                  disabled={atsAuthLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {atsAuthLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Authenticate with ATS Backend
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsATSAuthenticated(true);
                    setActiveTab("firebase"); // Switch to Firebase tab which doesn't require ATS
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Skip Authentication (Use Firebase Admin Only)
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Note: ATS features require backend authentication. Firebase admin features (blocking users, viewing users, etc.) work without ATS.
              </p>
            </div>
          </div>
        </div>
      </GeneralLayout>
    );
  }

  const tabs = [
    { id: "firebase", label: "Firebase Admin", icon: Database, requiresATS: false },
    { id: "reports", label: "Reports", icon: AlertTriangle, requiresATS: false },
    { id: "overview", label: "Overview", icon: BarChart3, requiresATS: true },
    { id: "users", label: "User Management", icon: Users, requiresATS: true },
    { id: "analytics", label: "Analytics", icon: TrendingUp, requiresATS: true },
    { id: "content", label: "Content Management", icon: FileText, requiresATS: true },
    { id: "settings", label: "System Settings", icon: Settings, requiresATS: true },
  ];

  return (
    <GeneralLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Super Study App Administration
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right mr-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Admin: {user?.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    URL Access Only
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!isATSAuthenticated) {
                      // Only refresh Firebase data if not authenticated
                      if (activeTab === "firebase") {
                        loadFirebaseData();
                      }
                      return;
                    }
                    loadAdminData();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome, {user.username}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const requiresATS = tab.requiresATS !== false;
                const isDisabled = requiresATS && !isATSAuthenticated;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isDisabled) {
                        alert("This tab requires ATS backend authentication. Please authenticate first.");
                        return;
                      }
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    disabled={isDisabled}
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : isDisabled
                        ? "border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                    title={isDisabled ? "Requires ATS backend authentication" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {requiresATS && !isATSAuthenticated && (
                      <span className="ml-1 text-xs">(ATS)</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading admin data...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && activeTab === "overview" && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats.users.total)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 dark:text-green-400">
                      +{stats.users.recent} this month
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Resumes Analyzed
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats.content.resumes)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Score Runs
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats.content.scoreRuns)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {stats.activity.recentScoreRuns} this week
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Avg Score
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.activity.averageScore}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Platform Overview
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Last updated: {formatDate(stats.timestamp)}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(stats.content.jobDescriptions)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Job Descriptions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.activity.recentScoreRuns}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Recent Analyses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.activity.averageScore}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Platform Average
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && activeTab === "users" && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isATSAuthenticated) {
                        alert("This feature requires ATS backend authentication.");
                        return;
                      }
                      loadAdminData();
                    }}
                    disabled={!isATSAuthenticated}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                </div>
              </div>

              {/* Users Table */}
              {users && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Users ({formatNumber(users.pagination.total)})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {users.users.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user.email}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {user.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                <div>Resumes: {user.stats.resumesUploaded}</div>
                                <div>
                                  Analyses: {user.stats.scoreRunsCompleted}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() =>
                                  navigate(`/admin/users/${user.id}`)
                                }
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {users.pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Showing {(currentPage - 1) * 20 + 1} to{" "}
                          {Math.min(currentPage * 20, users.pagination.total)}{" "}
                          of {users.pagination.total} users
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(
                                  users.pagination.pages,
                                  currentPage + 1
                                )
                              )
                            }
                            disabled={currentPage === users.pagination.pages}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && !error && activeTab === "analytics" && analytics && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Platform Analytics (Last {analytics.timeRange} days)
                </h3>

                {/* Top Users */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Top Active Users
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Score Runs</th>
                          <th className="px-4 py-2 text-left">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {analytics.topUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.scoreRunCount}</td>
                            <td className="px-4 py-2">{user.averageScore}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Trends Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Registration Trend
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analytics.userTrends.length} registration events in the
                      last {analytics.timeRange} days
                    </p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Score Run Activity
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analytics.scoreRunTrends.length} score runs completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && activeTab === "settings" && systemHealth && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  System Health
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Database Health */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Database
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Status:
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {systemHealth.database.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Users:
                        </span>
                        <span className="text-sm font-medium">
                          {formatNumber(systemHealth.database.totalUsers)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Recent Activity:
                        </span>
                        <span className="text-sm font-medium">
                          {systemHealth.database.recentActivity} (24h)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Server Health */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Server
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Uptime:
                        </span>
                        <span className="text-sm font-medium">
                          {formatUptime(
                            systemHealth.server.uptime
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Memory Used:
                        </span>
                        <span className="text-sm font-medium">
                          {systemHealth.server.memory.used}MB /{" "}
                          {systemHealth.server.memory.total}MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Node Version:
                        </span>
                        <span className="text-sm font-medium">
                          {systemHealth.server.nodeVersion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {formatDate(systemHealth.timestamp)}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Admin Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={async () => {
                      if (!isATSAuthenticated) {
                        alert("This feature requires ATS backend authentication.");
                        return;
                      }
                      try {
                        const blob = await adminService.exportData("users");
                        adminService.downloadBlob(
                          blob,
                          `users_export_${
                            new Date().toISOString().split("T")[0]
                          }.json`
                        );
                      } catch (error) {
                        console.error("Export failed:", error);
                        alert("Export failed. Please ensure ATS backend is running and authenticated.");
                      }
                    }}
                    disabled={!isATSAuthenticated}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </button>
                  <button
                    onClick={async () => {
                      if (!isATSAuthenticated) {
                        alert("This feature requires ATS backend authentication.");
                        return;
                      }
                      try {
                        const blob = await adminService.exportData("scoreRuns");
                        adminService.downloadBlob(
                          blob,
                          `score_runs_export_${
                            new Date().toISOString().split("T")[0]
                          }.json`
                        );
                      } catch (error) {
                        console.error("Export failed:", error);
                        alert("Export failed. Please ensure ATS backend is running and authenticated.");
                      }
                    }}
                    disabled={!isATSAuthenticated}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Score Runs
                  </button>
                  <button
                    onClick={async () => {
                      if (!isATSAuthenticated) {
                        alert("This feature requires ATS backend authentication.");
                        return;
                      }
                      try {
                        const blob = await adminService.exportData("analytics");
                        adminService.downloadBlob(
                          blob,
                          `analytics_export_${
                            new Date().toISOString().split("T")[0]
                          }.json`
                        );
                      } catch (error) {
                        console.error("Export failed:", error);
                        alert("Export failed. Please ensure ATS backend is running and authenticated.");
                      }
                    }}
                    disabled={!isATSAuthenticated}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Analytics
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && activeTab === "firebase" && firebaseStats && (
            <div className="space-y-6">
              {/* Firebase Statistics */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Firebase Platform Statistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatNumber(firebaseStats.users.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Active This Week
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatNumber(firebaseStats.users.activeLastWeek)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Teams
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatNumber(firebaseStats.teams.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Flashcards
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatNumber(firebaseStats.content.flashcards)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Activity
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {firebaseStats.users.newThisWeek} new users this week
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {firebaseStats.users.activeLastMonth} active this month
                    </p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Collaboration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {firebaseStats.teams.activeTeams} active teams
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avg {firebaseStats.teams.averageTeamSize} members per team
                    </p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content & Interviews
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {firebaseStats.content.interviewSessions} interview
                      sessions
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {firebaseStats.activity.recentInterviews} recent
                      interviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Firebase Users Table */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Firebase Users (Recent 20)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Created</th>
                        <th className="px-4 py-2 text-left">Last Login</th>
                        <th className="px-4 py-2 text-left">Drive Access</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {firebaseUsers.map((user) => {
                        const isBlockedUser = blockedUsers.some(bu => bu.userId === user.id || bu.email === user.email);
                        return (
                          <tr key={user.id}>
                            <td className="px-4 py-2 font-medium">
                              {user.username}
                            </td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-4 py-2">
                              {user.lastLoginAt
                                ? formatDate(user.lastLoginAt)
                                : "Never"}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  user.hasGoogleDriveAccess
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {user.hasGoogleDriveAccess ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  isBlockedUser
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                }`}
                              >
                                {isBlockedUser ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {isBlockedUser ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      setBlockingUser(user.id);
                                      await unblockUser(user.id);
                                      await loadBlockedUsers();
                                      setBlockingUser(null);
                                    } catch (error: any) {
                                      console.error("Error unblocking user:", error);
                                      alert(error.message || "Failed to unblock user");
                                      setBlockingUser(null);
                                    }
                                  }}
                                  disabled={blockingUser === user.id}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                  {blockingUser === user.id ? "Unblocking..." : "Unblock"}
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    const reason = window.prompt("Enter reason for blocking (optional):");
                                    try {
                                      setBlockingUser(user.id);
                                      await blockUser(user.id, user.email, reason || undefined);
                                      await loadBlockedUsers();
                                      setBlockingUser(null);
                                    } catch (error: any) {
                                      console.error("Error blocking user:", error);
                                      alert(error.message || "Failed to block user");
                                      setBlockingUser(null);
                                    }
                                  }}
                                  disabled={blockingUser === user.id}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                  {blockingUser === user.id ? "Blocking..." : "Block"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Teams Overview */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Study Teams ({teams.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.slice(0, 6).map((team) => (
                    <div
                      key={team.id}
                      className="border border-gray-200 dark:border-slate-600 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {team.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {team.description}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {Object.keys(team.members || {}).length} members
                        </span>
                        <span>
                          {formatDate(team.createdAt.toDate().toISOString())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {teams.length > 6 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    And {teams.length - 6} more teams...
                  </p>
                )}
              </div>

              {/* Referral Codes Section */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Referral Codes
                    </h3>
                  </div>
                  <button
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingCode ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        Generate Code
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Generate one-time referral codes that grant 1 month of premium access when redeemed.
                </p>

                {referralCodes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No referral codes generated yet.</p>
                    <p className="text-sm mt-1">Click "Generate Code" to create one.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Code</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Premium Months</th>
                          <th className="px-4 py-2 text-left">Created</th>
                          <th className="px-4 py-2 text-left">Used By</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {referralCodes.map((code) => {
                          const createdDate = code.createdAt?.toDate?.() 
                            ? formatDate(code.createdAt.toDate().toISOString())
                            : code.createdAt 
                            ? formatDate(new Date(code.createdAt).toISOString())
                            : "Unknown";
                          
                          const usedDate = code.usedAt?.toDate?.()
                            ? formatDate(code.usedAt.toDate().toISOString())
                            : code.usedAt
                            ? formatDate(new Date(code.usedAt).toISOString())
                            : null;

                          return (
                            <tr key={code.code}>
                              <td className="px-4 py-2">
                                <code className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
                                  {code.code}
                                </code>
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    code.isUsed
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  }`}
                                >
                                  {code.isUsed ? "Used" : "Available"}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {code.premiumMonths || 1} month{code.premiumMonths !== 1 ? "s" : ""}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {createdDate}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {code.isUsed ? (code.usedBy || "Unknown") : "-"}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleCopyCode(code.code)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                  title="Copy code"
                                >
                                  {copiedCode === code.code ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && activeTab === "reports" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Community Reports
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Review and manage reported comments from the community
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {reports.filter(r => r.status === "pending").length} pending
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No reports yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All reported comments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const isPending = report.status === "pending";
                      const createdAt = report.createdAt?.toDate?.() 
                        ? report.createdAt.toDate() 
                        : report.createdAt 
                        ? new Date(report.createdAt) 
                        : new Date();
                      
                      return (
                        <div
                          key={report.id}
                          className={`border rounded-lg p-4 ${
                            isPending
                              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isPending
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : report.status === "resolved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : report.status === "dismissed"
                                      ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}
                                >
                                  {report.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(createdAt)}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Reported by:
                                  </span>{" "}
                                  <span className="text-gray-900 dark:text-white">
                                    {report.reportedByName}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Reported user:
                                  </span>{" "}
                                  <span className="text-gray-900 dark:text-white">
                                    {report.reportedUserName}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Reason:
                                  </span>{" "}
                                  <span className="text-gray-900 dark:text-white">
                                    {report.reason}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Comment ID:
                                  </span>{" "}
                                  <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {report.commentId}
                                  </code>
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Post ID:
                                  </span>{" "}
                                  <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {report.postId}
                                  </code>
                                </p>
                              </div>
                            </div>
                          </div>
                          {isPending && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, "resolved")}
                                disabled={updatingReportId === report.id}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                {updatingReportId === report.id ? "Updating..." : "Resolve"}
                              </button>
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, "dismissed")}
                                disabled={updatingReportId === report.id}
                                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                              >
                                {updatingReportId === report.id ? "Updating..." : "Dismiss"}
                              </button>
                              <button
                                onClick={() => handleDeleteCommentFromReport(report.commentId, report.postId)}
                                disabled={updatingReportId === report.commentId}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                {updatingReportId === report.commentId ? "Deleting..." : "Delete Comment"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && activeTab === "content" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Content Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Content management features will be implemented here. This
                  will include:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Flashcards and study materials moderation</li>
                  <li>• User-generated content review</li>
                  <li>• Interview session monitoring</li>
                  <li>• Video call session logs</li>
                  <li>• Study group management</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </GeneralLayout>
  );
};
