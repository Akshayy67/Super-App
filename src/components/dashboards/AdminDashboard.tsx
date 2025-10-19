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
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
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
import { GeneralLayout } from "../layout/PageLayout";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isATSAuthenticated, setIsATSAuthenticated] = useState(false);
  const [atsAuthLoading, setATSAuthLoading] = useState(false);

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
    if (user?.email === "akshayjuluri6704@gmail.com" && isATSAuthenticated) {
      loadAdminData();
    }
  }, [user, activeTab, currentPage, searchTerm, isATSAuthenticated]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

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
      } else if (activeTab === "firebase") {
        try {
          const firebaseStatsData =
            await firebaseAdminService.getFirebaseStats();
          setFirebaseStats(firebaseStatsData);

          const firebaseUsersData = await firebaseAdminService.getFirebaseUsers(
            20
          );
          setFirebaseUsers(firebaseUsersData.users);

          const teamsData = await firebaseAdminService.getTeams();
          setTeams(teamsData);
        } catch (firebaseError) {
          console.warn("Firebase admin access not available:", firebaseError);
          // Set empty data for Firebase tab if not accessible
          setFirebaseStats({
            users: {
              total: 0,
              activeLastWeek: 0,
              activeLastMonth: 0,
              newThisWeek: 0,
            },
            teams: { total: 0, activeTeams: 0, averageTeamSize: 0 },
            content: { flashcards: 0, interviewSessions: 0, notes: 0 },
            activity: { recentLogins: 0, recentInterviews: 0 },
          });
          setFirebaseUsers([]);
          setTeams([]);
        }
      }
    } catch (err) {
      console.error("Admin data loading error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load admin data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = adminService.formatDate;
  const formatNumber = adminService.formatNumber;

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

  // Show ATS authentication prompt if not authenticated
  if (!isATSAuthenticated) {
    return (
      <GeneralLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Admin Authentication Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to authenticate with the ATS backend system to access
                the admin dashboard.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

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

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                This will send a magic link to {user?.email}
              </p>
            </div>
          </div>
        </div>
      </GeneralLayout>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "firebase", label: "Firebase Data", icon: Database },
    { id: "content", label: "Content Management", icon: FileText },
    { id: "settings", label: "System Settings", icon: Settings },
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
                  onClick={loadAdminData}
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
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
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
                    onClick={() => loadAdminData()}
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
                          {adminService.formatUptime(
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
                      }
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </button>
                  <button
                    onClick={async () => {
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
                      }
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Score Runs
                  </button>
                  <button
                    onClick={async () => {
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
                      }
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {firebaseUsers.map((user) => (
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
                        </tr>
                      ))}
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
