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
  Send,
  FileText,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../config/firebase";
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
  getDocs,
} from "firebase/firestore";
import { realTimeAuth } from "../utils/realTimeAuth";

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
  joinedAt: Date;
  lastActive: Date;
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
  ownerId: string;
  members: { [key: string]: TeamMember };
  projects: string[];
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    requireApproval: boolean;
    defaultRole: "member" | "viewer";
  };
  createdAt: Date;
  updatedAt: Date;
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
  timestamp: Date;
  type: "task" | "document" | "member" | "project" | "comment";
}

interface TeamMessage {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  edited?: boolean;
  attachments?: string[];
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

export const TeamSpace: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<
    "overview" | "members" | "projects" | "activity" | "chat"
  >("overview");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const teamsRef = collection(db, "teams");
      const teamsQuery = query(teamsRef);
      const teamsSnapshot = await getDocs(teamsQuery);

      const userTeams: Team[] = [];

      teamsSnapshot.forEach((doc) => {
        const teamData = doc.data();
        // Check if user is a member of this team
        if (teamData.members && teamData.members[user.id]) {
          userTeams.push({
            id: doc.id,
            ...teamData,
            createdAt: teamData.createdAt?.toDate() || new Date(),
            updatedAt: teamData.updatedAt?.toDate() || new Date(),
          } as Team);
        }
      });

      setTeams(userTeams);
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0]);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      // Load projects
      const projectsRef = collection(db, "projects");
      const projectsQuery = query(projectsRef, where("teamId", "==", teamId));
      const projectsSnapshot = await getDocs(projectsQuery);

      const teamProjects: Project[] = [];
      projectsSnapshot.forEach((doc) => {
        const data = doc.data();
        teamProjects.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
        } as Project);
      });

      setProjects(teamProjects);

      // Load activities - simplified query to avoid index requirement
      const activitiesRef = collection(db, "activities");
      const activitiesQuery = query(
        activitiesRef,
        where("teamId", "==", teamId)
      );

      try {
        const activitiesSnapshot = await getDocs(activitiesQuery);

        const teamActivities: Activity[] = [];
        activitiesSnapshot.forEach((doc) => {
          const data = doc.data();
          teamActivities.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as Activity);
        });

        // Sort activities by timestamp in JavaScript instead of in query
        teamActivities.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        setActivities(teamActivities);
      } catch (activityError) {
        console.warn("Could not load activities:", activityError);
        setActivities([]); // Set empty array if activities fail to load
      }

      // Load messages - simplified query
      const messagesRef = collection(db, "teamMessages");
      const messagesQuery = query(messagesRef, where("teamId", "==", teamId));

      try {
        const messagesSnapshot = await getDocs(messagesQuery);

        const teamMessages: TeamMessage[] = [];
        messagesSnapshot.forEach((doc) => {
          const data = doc.data();
          teamMessages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as TeamMessage);
        });

        // Sort messages by timestamp in JavaScript
        teamMessages.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
        setMessages(teamMessages);
      } catch (messageError) {
        console.warn("Could not load messages:", messageError);
        setMessages([]); // Set empty array if messages fail to load
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  };

  const determineUserRole = () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !selectedTeam || !selectedTeam.members) return;

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

  const createTeam = async (teamData: {
    name: string;
    description: string;
    size: string;
  }) => {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const teamId = `team_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newTeam: Team = {
      id: teamId,
      name: teamData.name || "New Team",
      description: teamData.description || "",
      size: teamData.size || "small",
      ownerId: user.id,
      members: {
        [user.id]: {
          id: user.id,
          name: user.username || user.email,
          email: user.email,
          role: "owner",
          joinedAt: new Date(),
          lastActive: new Date(),
          isOnline: true,
          skills: [],
          stats: {
            tasksCompleted: 0,
            projectsContributed: 0,
            documentsCreated: 0,
            hoursLogged: 0,
          },
        },
      },
      projects: [],
      settings: {
        isPublic: false,
        allowInvites: true,
        requireApproval: true,
        defaultRole: "member",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await setDoc(doc(db, "teams", teamId), {
        ...newTeam,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTeams((prev) => [...prev, newTeam]);
      setSelectedTeam(newTeam);
      setShowCreateTeam(false);
      await logActivity("created team", newTeam.name, "project");
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const inviteMember = async (email: string, role: string = "member") => {
    if (!selectedTeam || !hasPermission("manage_members")) return;

    try {
      // In a real app, you'd send an email invitation
      // For now, we'll just add a placeholder member
      const memberId = `temp_${Date.now()}`;
      const newMember: TeamMember = {
        id: memberId,
        name: email.split("@")[0],
        email,
        role: role as "member" | "viewer",
        joinedAt: new Date(),
        lastActive: new Date(),
        isOnline: false,
        skills: [],
        stats: {
          tasksCompleted: 0,
          projectsContributed: 0,
          documentsCreated: 0,
          hoursLogged: 0,
        },
      };

      const updatedTeam = {
        ...selectedTeam,
        members: {
          ...selectedTeam.members,
          [memberId]: newMember,
        },
      };

      await updateDoc(doc(db, "teams", selectedTeam.id), {
        members: updatedTeam.members,
        updatedAt: serverTimestamp(),
      });

      setSelectedTeam(updatedTeam);
      await logActivity("invited member", email, "member");
      setShowInviteModal(false);
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const createProject = async (projectData: Partial<Project>) => {
    if (!selectedTeam || !hasPermission("create")) return;

    const projectId = `project_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newProject: Project = {
      id: projectId,
      teamId: selectedTeam.id,
      name: projectData.name || "New Project",
      description: projectData.description || "",
      status: "planning",
      priority: "medium",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      progress: 0,
      members: [realTimeAuth.getCurrentUser()?.id || ""],
      tasks: 0,
      completedTasks: 0,
      documents: [],
      tags: [],
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };

    try {
      await setDoc(doc(db, "projects", projectId), {
        ...newProject,
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
      });

      // Update team projects
      await updateDoc(doc(db, "teams", selectedTeam.id), {
        projects: arrayUnion(projectId),
        updatedAt: serverTimestamp(),
      });

      setProjects((prev) => [...prev, newProject]);
      await logActivity("created project", newProject.name, "project");
      setShowProjectModal(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTeam || !newMessage.trim()) return;

    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const messageId = `msg_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const message: TeamMessage = {
      id: messageId,
      teamId: selectedTeam.id,
      userId: user.id,
      userName: user.username || user.email,
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    try {
      await setDoc(doc(db, "teamMessages", messageId), {
        ...message,
        timestamp: serverTimestamp(),
      });

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const logActivity = async (
    action: string,
    target: string,
    type: Activity["type"]
  ) => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !selectedTeam) return;

    const activityId = `activity_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      await setDoc(doc(db, "activities", activityId), {
        id: activityId,
        teamId: selectedTeam.id,
        userId: user.id,
        userName: user.username || user.email,
        action,
        target,
        type,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: Date | any): string => {
    // Handle different timestamp types
    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp && typeof timestamp.toDate === "function") {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (
      timestamp &&
      typeof timestamp === "object" &&
      timestamp.seconds
    ) {
      // Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      date = new Date(timestamp);
    } else {
      return "Unknown time";
    }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Team Space
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTeam
                    ? `${selectedTeam.name} • ${
                        Object.keys(selectedTeam.members).length
                      } members`
                    : "Collaborate with your team"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {selectedTeam && (
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(
                    [
                      "overview",
                      "members",
                      "projects",
                      "activity",
                      "chat",
                    ] as const
                  ).map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                        activeView === view
                          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowCreateTeam(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Team</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTeam ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {teams.length === 0 ? "Create your first team" : "Select a team"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {teams.length === 0
                ? "Start collaborating by creating a team and inviting members."
                : "Choose a team from the sidebar to view its details."}
            </p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeView === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTeam.members
                        ? Object.keys(selectedTeam.members).length
                        : 0}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Team Members
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTeam.members
                      ? Object.values(selectedTeam.members).filter(
                          (m) => m.isOnline
                        ).length
                      : 0}{" "}
                    online
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="w-8 h-8 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {projects.length}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Active Projects
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {projects.filter((p) => p.status === "completed").length}{" "}
                    completed
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-purple-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activities.length}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This week
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <MessageSquare className="w-8 h-8 text-orange-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {messages.length}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recent discussions
                  </p>
                </motion.div>
              </div>
            )}

            {activeView === "members" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Team Members
                  </h2>
                  {hasPermission("manage_members") && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedTeam.members ? (
                    Object.values(selectedTeam.members).map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                AVATAR_COLORS[
                                  member.id.charCodeAt(0) % AVATAR_COLORS.length
                                ]
                              }`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                                <span>{member.name}</span>
                                {member.role === "owner" && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                                {member.role === "admin" && (
                                  <Shield className="w-4 h-4 text-purple-500" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.title || member.role}
                              </p>
                            </div>
                          </div>
                          {member.isOnline && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.location && (
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>{member.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                              Last seen {formatTimestamp(member.lastActive)}
                            </span>
                          </div>
                        </div>

                        {member.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
                                +{member.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No team members found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Projects
                  </h2>
                  {hasPermission("create") && (
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4"
                      style={{
                        borderLeftColor: project.color.replace("bg-", "#"),
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {project.description}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 3).map((memberId) => {
                            const member = selectedTeam.members[memberId];
                            if (!member) return null;
                            return (
                              <div
                                key={memberId}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white dark:border-gray-800 ${
                                  AVATAR_COLORS[
                                    memberId.charCodeAt(0) %
                                      AVATAR_COLORS.length
                                  ]
                                }`}
                                title={member.name}
                              >
                                {getInitials(member.name)}
                              </div>
                            );
                          })}
                          {project.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                              +{project.members.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {project.completedTasks}/{project.tasks} tasks
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeView === "activity" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        {activity.type === "task" && (
                          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                        {activity.type === "document" && (
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                        {activity.type === "member" && (
                          <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                        {activity.type === "project" && (
                          <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">
                            {activity.userName}
                          </span>{" "}
                          {activity.action}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeView === "chat" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-96 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Team Chat
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage =
                      message.userId === realTimeAuth.getCurrentUser()?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">
                            {message.userName}
                          </p>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          onSubmit={createTeam}
        />
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={inviteMember}
        />
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={createProject}
        />
      )}

      {/* Team Selector Sidebar */}
      {teams.length > 0 && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-40">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Teams
            </h3>
          </div>
          <div className="p-2">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedTeam?.id === team.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="font-medium truncate">{team.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {Object.keys(team.members).length} members
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Create Team Modal Component
const CreateTeamModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; size: string }) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: "small",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Team
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Brief description of your team"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Size
            </label>
            <select
              value={formData.size}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, size: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="small">Small (2-10 members)</option>
              <option value="medium">Medium (11-50 members)</option>
              <option value="large">Large (50+ members)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invite Member Modal Component
const InviteMemberModal: React.FC<{
  onClose: () => void;
  onSubmit: (email: string, role: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim(), role);
      setEmail("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Invite Team Member
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Project Modal Component
const CreateProjectModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Project
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Brief description of the project"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
