/**
 * Admin Service - Handles all admin-related API calls
 * Restricted to authorized admin users only
 */

interface AdminStats {
  users: {
    total: number;
    recent: number;
  };
  content: {
    resumes: number;
    jobDescriptions: number;
    scoreRuns: number;
  };
  activity: {
    recentScoreRuns: number;
    averageScore: number;
  };
  timestamp: string;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    resumesUploaded: number;
    jobDescriptionsAnalyzed: number;
    scoreRunsCompleted: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UserDetail extends User {
  recentResumes: any[];
  recentJobDescs: any[];
  recentScoreRuns: any[];
}

interface ScoreRun {
  id: string;
  overall: number;
  createdAt: string;
  modelVersion: string;
  userEmail: string;
  resumeTitle: string;
  resumeOriginalName: string;
  jobDescTitle: string;
  jobDescSource: string;
}

interface ScoreRunsResponse {
  scoreRuns: ScoreRun[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AnalyticsData {
  timeRange: number;
  userTrends: Array<{
    date: string;
    count: number;
  }>;
  scoreRunTrends: Array<{
    date: string;
    count: number;
    averageScore: number;
  }>;
  topUsers: Array<{
    id: string;
    email: string;
    scoreRunCount: number;
    averageScore: number;
  }>;
}

interface SystemHealth {
  database: {
    status: string;
    totalUsers: number;
    recentActivity: number;
  };
  server: {
    uptime: number;
    memory: {
      used: number;
      total: number;
    };
    nodeVersion: string;
  };
  timestamp: string;
}

class AdminService {
  private baseURL = "/api/admin";

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("ats_token");
    if (!token) {
      throw new Error(
        "No authentication token found. Please authenticate with the ATS backend first."
      );
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Admin API error: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data;
  }

  // Platform Statistics
  async getStats(): Promise<AdminStats> {
    return this.makeRequest<AdminStats>("/stats");
  }

  // User Management
  async getUsers(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/users${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.makeRequest<UsersResponse>(endpoint);
  }

  async getUserDetail(userId: string): Promise<UserDetail> {
    return this.makeRequest<UserDetail>(`/users/${userId}`);
  }

  async updateUser(
    userId: string,
    updates: { status?: string; notes?: string }
  ): Promise<any> {
    return this.makeRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: string): Promise<any> {
    return this.makeRequest(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Score Runs Management
  async getScoreRuns(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ScoreRunsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/score-runs${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return this.makeRequest<ScoreRunsResponse>(endpoint);
  }

  // Analytics
  async getAnalytics(timeRange: string = "30"): Promise<AnalyticsData> {
    return this.makeRequest<AnalyticsData>(`/analytics?timeRange=${timeRange}`);
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    return this.makeRequest<SystemHealth>("/system-health");
  }

  // Broadcast Notifications
  async sendBroadcast(data: {
    message: string;
    type?: string;
    targetUsers?: string[];
  }): Promise<any> {
    return this.makeRequest("/broadcast", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Utility Methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Check if current user is admin
  isAdmin(): boolean {
    // This should be called from a component that has access to the user context
    // For now, we'll check localStorage for the user email
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.email === "akshayjuluri6704@gmail.com";
    } catch {
      return false;
    }
  }

  // Check if user is authenticated with ATS backend
  isAuthenticated(): boolean {
    return !!localStorage.getItem("ats_token");
  }

  // Export data functionality
  async exportData(type: "users" | "scoreRuns" | "analytics"): Promise<Blob> {
    let data: any;
    let filename: string;

    switch (type) {
      case "users":
        data = await this.getUsers({ limit: 1000 });
        filename = `users_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        break;
      case "scoreRuns":
        data = await this.getScoreRuns({ limit: 1000 });
        filename = `score_runs_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        break;
      case "analytics":
        data = await this.getAnalytics("90");
        filename = `analytics_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        break;
      default:
        throw new Error("Invalid export type");
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    return blob;
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const adminService = new AdminService();
export type {
  AdminStats,
  User,
  UsersResponse,
  UserDetail,
  ScoreRun,
  ScoreRunsResponse,
  AnalyticsData,
  SystemHealth,
};
