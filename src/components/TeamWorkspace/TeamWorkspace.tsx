import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Settings,
  Shield,
  Folder,
  Activity,
  Calendar,
  MessageSquare,
  Video,
  Bell,
  Search,
  ChevronRight,
  UserPlus,
  Crown,
  Star,
  Clock,
  TrendingUp,
  Target,
  Award,
  Briefcase,
  Hash,
  Lock,
  Unlock,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../config/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "member" | "viewer";
  department?: string;
  title?: string;
  location?: string;
  timezone?: string;
  joinedAt: Timestamp;
  lastActive: Timestamp;
  isOnline: boolean;
  skills: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  stats: {
    tasksCompleted: number;
    projectsContributed: number;
    documentsCreated: number;
    hoursLogged: number;
  };
}

interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  industry?: string;
  size: string;
  members: { [key: string]: TeamMember };
  projects: string[];
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    requireApproval: boolean;
    defaultRole: "member" | "viewer";
  };
  billing?: {
    plan: "free" | "pro" | "enterprise";
    seats: number;
    billingCycle: "monthly" | "yearly";
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string;
  status: "planning" | "active" | "review" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  startDate: Date;
  endDate: Date;
  progress: number;
  members: string[];
  tasks: number;
  completedTasks: number;
  documents: string[];
  tags: string[];
  color: string;
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: Timestamp;
  type: "task" | "document" | "member" | "project" | "comment";
}

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export const TeamWorkspace: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<
    "overview" | "members" | "projects" | "activity"
  >("overview");

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData(selectedTeam.id);
      determineUserRole();
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const teamsRef = collection(db, "teams");
    const q = query(teamsRef, where(`members.${user.id}`, "!=", null));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTeams: Team[] = [];
      snapshot.forEach((doc) => {
        userTeams.push({ id: doc.id, ...doc.data() } as Team);
      });
      setTeams(userTeams);
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0]);
      }
    });

    return unsubscribe;
  };

  const loadTeamData = async (teamId: string) => {
    // Load projects, activities, etc.
    // Implementation similar to TeamSpace but simplified
  };

  const determineUserRole = () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !selectedTeam) return;

    const member = selectedTeam.members[user.id];
    setCurrentUserRole(member?.role || "member");
  };

  const hasPermission = (permission: string): boolean => {
    if (currentUserRole === "owner") return true;
    if (
      currentUserRole === "admin" &&
      ["create", "edit", "manage_members"].includes(permission)
    )
      return true;
    if (currentUserRole === "member" && ["create"].includes(permission))
      return true;
    return false;
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Simplified implementation */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Team Workspace
        </h1>

        {selectedTeam ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {selectedTeam.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedTeam.description}
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {Object.keys(selectedTeam.members).length} members
                </span>
                <span className="text-sm text-gray-500">
                  Created {selectedTeam.createdAt.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(selectedTeam.members).map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        AVATAR_COLORS[
                          member.id.charCodeAt(0) % AVATAR_COLORS.length
                        ]
                      }`}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-1">
                        <span>{member.name}</span>
                        {member.role === "owner" && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {member.role === "admin" && (
                          <Shield className="w-4 h-4 text-purple-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No teams found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create or join a team to get started with collaboration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
