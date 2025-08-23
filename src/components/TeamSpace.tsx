import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Settings,
  MessageSquare,
  FileText,
  Activity,
  Share2,
  Mail,
  ExternalLink,
  Eye,
  Edit3,
  Shield,
  Hash,
  Star,
  CheckCircle,
  Folder,
  Trash2,
  Copy,
  Search,
  X,
  Send,
  Crown,
  XCircle,
  Plus,
} from "lucide-react";
import { realTimeAuth } from "../utils/realTimeAuth";
import {
  teamManagementService,
  Team,
  TeamMember,
  TeamActivity,
} from "../utils/teamManagement";
import { FileShareModal } from "./FileShareModal";
import { JoinTeamModal } from "./JoinTeamModal";
import { EmailTestPanel } from "./EmailTestPanel";
import { fileShareService } from "../utils/fileShareService";
import { CreateProjectModal } from "./CreateProjectModal";
import { AddProjectTaskModal } from "./AddProjectTaskModal";
import { TeamProject, projectService } from "../utils/projectService";

interface SharedResource {
  id: string;
  title: string;
  type: "file" | "note" | "task" | "flashcard";
  sharedBy: string;
  sharedAt: Date;
  permissions: "view" | "edit" | "admin";
  tags?: string[];
}

export const TeamSpace: React.FC<{
  invitationData?: { inviteCode?: string; teamId?: string } | null;
}> = ({ invitationData }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [showFileShareModal, setShowFileShareModal] = useState(false);
  const [showEmailTestPanel, setShowEmailTestPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "files" | "projects" | "chat" | "settings"
  >("overview");
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] =
    useState<TeamProject | null>(null);
  const [editingProject, setEditingProject] = useState<TeamProject | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "viewer">(
    "member"
  );
  const [inviteCode, setInviteCode] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [showDiscoverTeams, setShowDiscoverTeams] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  // Subscribe to team messages in real time when chat tab is active and a team is selected
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (activeTab === "chat" && selectedTeam) {
      unsubscribe = teamManagementService.subscribeToTeamMessages(
        selectedTeam.id,
        setMessages
      );
    }
    // Cleanup subscription on tab/team change
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab, selectedTeam]);
  const [newMessage, setNewMessage] = useState("");
  const [showExitRequestModal, setShowExitRequestModal] = useState(false);
  const [exitReason, setExitReason] = useState("");
  const [showExitRequestsPanel, setShowExitRequestsPanel] = useState(false);
  const [pendingExitRequests, setPendingExitRequests] = useState<any[]>([]);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData(selectedTeam.id);
      loadSharedFiles();
      loadProjects();
    }
  }, [selectedTeam]);

  // Handle invitation data from URL parameters
  useEffect(() => {
    if (invitationData?.inviteCode && user) {
      console.log("🎯 Processing team invitation:", invitationData);

      // Auto-join team directly instead of showing modal
      const autoJoinTeam = async () => {
        try {
          console.log(
            "🚀 Auto-joining team with code:",
            invitationData.inviteCode
          );
          console.log(
            "🚀 Auto-join - Code length:",
            invitationData.inviteCode?.length
          );
          console.log(
            "🚀 Auto-join - Code characters:",
            invitationData.inviteCode?.split("").join(", ")
          );

          // Ensure teams are loaded first to avoid race conditions
          console.log("🔄 Loading teams before auto-join...");
          await loadTeams();
          console.log("✅ Teams loaded, proceeding with auto-join...");

          await joinTeamByLink(invitationData.inviteCode!);
          console.log("✅ Successfully auto-joined team!");
        } catch (error) {
          console.error("❌ Auto-join failed, showing manual modal:", error);
          // Fallback to manual join modal if auto-join fails
          setInviteCode(invitationData.inviteCode ?? "");
          setShowJoinTeamModal(true);
        }
      };

      autoJoinTeam();
    } else if (invitationData?.inviteCode && !user) {
      // User not authenticated yet, wait for auth then process
      console.log(
        "⏳ User not authenticated yet, will process invite after login"
      );
    }
  }, [invitationData, user]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const userTeams = await teamManagementService.getUserTeams();
      setTeams(userTeams);

      if (!selectedTeam && userTeams.length > 0) {
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
      const activities = await teamManagementService.getTeamActivities(teamId);
      setTeamActivities(activities);

      // Mock shared resources for now
      setSharedResources([
        {
          id: "1",
          title: "Team Guidelines.pdf",
          type: "file",
          sharedBy: user?.id || "",
          sharedAt: new Date(),
          permissions: "view",
          tags: ["guidelines", "important"],
        },
      ]);
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  };

  const createTeam = async (
    name: string,
    description: string,
    size: string = "small"
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      const newTeam = await teamManagementService.createTeam({
        name,
        description,
        size,
      });

      setTeams((prev) => [...prev, newTeam]);
      setSelectedTeam(newTeam);
      setShowCreateTeam(false);

      // Log the invite code for testing
      console.log("🎉 Team created successfully!");
      console.log("📋 Team Name:", newTeam.name);
      console.log("🔗 Invite Code:", newTeam.inviteCode);
      console.log(
        "🌐 Join URL:",
        `${window.location.origin}/join-team?code=${newTeam.inviteCode}`
      );
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!selectedTeam || !inviteEmail.trim()) return;

    try {
      setLoading(true);
      setInviteError(null);
      setInviteSuccess(null);

      await teamManagementService.inviteMember(
        selectedTeam.id,
        inviteEmail.trim(),
        inviteRole
      );

      setInviteSuccess(`Invitation sent successfully to ${inviteEmail}!`);
      setInviteEmail("");

      // Close modal after a short delay to show success message
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess(null);
      }, 2000);

      // Refresh team data
      loadTeamData(selectedTeam.id);
    } catch (error) {
      console.error("Error inviting member:", error);
      setInviteError(
        error instanceof Error ? error.message : "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced join functionality
  const joinTeamByLink = async (code: string) => {
    if (!user || !code.trim()) return;

    try {
      setLoading(true);
      console.log("🔄 Attempting to join team with code:", code.trim());
      console.log("🔄 Current user:", user.id, user.email);
      console.log("🔄 Code length:", code.trim().length);
      console.log("🔄 Code characters:", code.trim().split("").join(", "));

      const teamId = await teamManagementService.joinTeamByInviteCode(
        code.trim()
      );
      console.log("✅ Successfully got team ID:", teamId);

      // Refresh teams and auto-select the new team
      await loadTeams();
      const team = await teamManagementService.getTeam(teamId);
      if (team) {
        setSelectedTeam(team);
        // Success notification
        alert(`Successfully joined "${team.name}"!`);
        console.log("🎉 Team joined and selected:", team.name);

        // Clear pending invitation from storage
        sessionStorage.removeItem("pendingTeamInvitation");
      }

      return teamId;
    } catch (error) {
      console.error("❌ Error joining team:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : String(error),
        code: code.trim(),
        userId: user?.id,
        userEmail: user?.email,
      });
      alert("Failed to join team. Please check the invite code and try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadPublicTeams = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate public teams - in a real app you'd call an API
      // const publicTeams = await teamManagementService.getPublicTeams();

      // Mock data for demonstration
      const mockPublicTeams: Team[] = [
        {
          id: "demo-team-1",
          name: "Study Group - Computer Science",
          description: "Join fellow CS students for collaborative learning",
          ownerId: "demo-user",
          members: {},
          projects: [],
          settings: {
            isPublic: true,
            allowInvites: true,
            requireApproval: false,
            defaultRole: "member",
          },
          inviteCode: "CSTUDY",
          createdAt: new Date(),
          updatedAt: new Date(),
          size: "10-20 members",
        },
        {
          id: "demo-team-2",
          name: "Web Development Bootcamp",
          description: "Learn modern web development together",
          ownerId: "demo-user-2",
          members: {},
          projects: [],
          settings: {
            isPublic: true,
            allowInvites: true,
            requireApproval: false,
            defaultRole: "member",
          },
          inviteCode: "WEBDEV",
          createdAt: new Date(),
          updatedAt: new Date(),
          size: "20-50 members",
        },
      ];

      setPublicTeams(mockPublicTeams);
    } catch (error) {
      console.error("Error loading public teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickJoinTeam = async (team: Team) => {
    if (!team.inviteCode) return;

    try {
      await joinTeamByLink(team.inviteCode);
      setShowDiscoverTeams(false);
    } catch (error) {
      // Error already handled in joinTeamByLink
    }
  };

  const joinTeam = async () => {
    if (!inviteCode.trim()) return;

    try {
      console.log("🚀 Manual join - Code entered:", inviteCode.trim());
      console.log("🚀 Manual join - Code length:", inviteCode.trim().length);
      console.log(
        "🚀 Manual join - Code characters:",
        inviteCode.trim().split("").join(", ")
      );

      await joinTeamByLink(inviteCode.trim());
      setInviteCode("");
      setShowJoinTeamModal(false);
    } catch (error) {
      // Error already handled in joinTeamByLink
    }
  };

  const confirmRemoveMember = (member: TeamMember) => {
    setMemberToRemove(member);
  };

  const removeMember = async () => {
    if (!selectedTeam || !memberToRemove) return;

    try {
      setLoading(true);
      await teamManagementService.removeMember(
        selectedTeam.id,
        memberToRemove.id
      );
      // Refresh team data
      const updatedTeam = await teamManagementService.getTeam(selectedTeam.id);
      if (updatedTeam) setSelectedTeam(updatedTeam);
      setMemberToRemove(null);
      console.log(`Member ${memberToRemove.name} removed successfully`);
    } catch (error) {
      console.error("Error removing member:", error);
      alert(
        `Failed to remove member. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedTeam || !newMessage.trim()) return;

    try {
      await teamManagementService.sendMessage(
        selectedTeam.id,
        newMessage.trim()
      );
      setNewMessage("");
      // Messages will be updated via real-time subscription
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Exit request functions
  const requestExit = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      await teamManagementService.requestExit(selectedTeam.id, exitReason);
      setShowExitRequestModal(false);
      setExitReason("");

      // Refresh team data to show the exit request
      const updatedTeam = await teamManagementService.getTeam(selectedTeam.id);
      if (updatedTeam) setSelectedTeam(updatedTeam);

      alert(
        "Exit request submitted successfully. Waiting for approval from team leaders."
      );
    } catch (error) {
      console.error("Error requesting exit:", error);
      alert(
        `Failed to submit exit request. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const approveExitRequest = async (memberId: string) => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      await teamManagementService.approveExitRequest(selectedTeam.id, memberId);

      // Refresh team data
      const updatedTeam = await teamManagementService.getTeam(selectedTeam.id);
      if (updatedTeam) setSelectedTeam(updatedTeam);

      alert("Exit request approved successfully.");
    } catch (error) {
      console.error("Error approving exit request:", error);
      alert(
        `Failed to approve exit request. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const rejectExitRequest = async (memberId: string, reason?: string) => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      await teamManagementService.rejectExitRequest(
        selectedTeam.id,
        memberId,
        reason
      );

      // Refresh team data
      const updatedTeam = await teamManagementService.getTeam(selectedTeam.id);
      if (updatedTeam) setSelectedTeam(updatedTeam);

      alert("Exit request rejected.");
    } catch (error) {
      console.error("Error rejecting exit request:", error);
      alert(
        `Failed to reject exit request. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelExitRequest = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      await teamManagementService.cancelExitRequest(selectedTeam.id);

      // Refresh team data
      const updatedTeam = await teamManagementService.getTeam(selectedTeam.id);
      if (updatedTeam) setSelectedTeam(updatedTeam);

      alert("Exit request cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling exit request:", error);
      alert(
        `Failed to cancel exit request. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    // You could show a toast notification here
  };

  const getTeamMembers = (): TeamMember[] => {
    if (!selectedTeam) return [];
    return Object.values(selectedTeam.members);
  };

  const deleteTeam = async () => {
    if (!selectedTeam || !user) return;

    try {
      setLoading(true);

      // Debug information
      console.log("=== DELETE TEAM DEBUG ===");
      console.log("Current user:", user);
      console.log("Current user ID:", user.id);
      console.log("Selected team:", selectedTeam);
      console.log("Team owner ID:", selectedTeam.ownerId);
      console.log("IDs match:", selectedTeam.ownerId === user.id);
      console.log("User is owner:", selectedTeam.ownerId === user.id);

      // QUICK FIX: If ownerId is undefined, set it to current user
      if (!selectedTeam.ownerId && user.id) {
        console.log("🔧 FIXING: ownerId is undefined, setting to current user");
        try {
          await teamManagementService.updateTeam(selectedTeam.id, {
            ownerId: user.id,
          });
          // Update local state
          const updatedTeam = { ...selectedTeam, ownerId: user.id };
          setSelectedTeam(updatedTeam);
          setTeams((prev) =>
            prev.map((team) =>
              team.id === selectedTeam.id ? updatedTeam : team
            )
          );
          console.log("✅ Fixed ownerId, now attempting delete again...");
        } catch (fixError) {
          console.error("Failed to fix ownerId:", fixError);
          alert("Failed to fix team ownership. Please contact support.");
          return;
        }
      }

      await teamManagementService.deleteTeam(selectedTeam.id);

      // Remove team from local state
      setTeams((prev) => prev.filter((team) => team.id !== selectedTeam.id));
      setSelectedTeam(null);
      setShowDeleteConfirmation(false);

      // Show success message
      console.log("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      console.error("Error details:", error);
      alert("Failed to delete team. Only team owners can delete teams.");
    } finally {
      setLoading(false);
    }
  };

  const loadSharedFiles = async () => {
    if (!selectedTeam || !user) return;

    try {
      const files = await fileShareService.getTeamFiles(
        selectedTeam.id,
        user.id
      );
      setSharedFiles(files);
    } catch (error) {
      console.error("Error loading shared files:", error);
    }
  };

  const loadProjects = async () => {
    if (!selectedTeam || !user) return;

    try {
      const teamProjects = await projectService.getTeamProjects(
        selectedTeam.id,
        user.id
      );
      setProjects(teamProjects);

      const stats = await projectService.getProjectStats(
        selectedTeam.id,
        user.id
      );
      setProjectStats(stats);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleCreateProject = (project: TeamProject) => {
    setProjects((prev) => [project, ...prev]);
    loadProjects(); // Refresh stats
  };

  const handleEditProject = (project: TeamProject) => {
    setEditingProject(project);
    setShowCreateProjectModal(true);
  };

  const handleAddTaskToProject = (project: TeamProject) => {
    setSelectedProjectForTask(project);
    setShowAddTaskModal(true);
  };

  const handleTaskAdded = () => {
    loadProjects(); // Refresh projects to update task counts
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please log in to access team space</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => setShowCreateTeam(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Team
            </button>
            <button
              onClick={() => setShowJoinTeamModal(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Team
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                selectedTeam?.id === team.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {Object.keys(team.members).length} members
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {selectedTeam ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedTeam.name}
                </h1>
                <p className="text-gray-600">{selectedTeam.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invite via Email
                </button>
                <button
                  onClick={() => setShowJoinTeamModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Team
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {import.meta.env.VITE_DEBUG_MODE === "true" && (
                  <button
                    onClick={() => setShowEmailTestPanel(true)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Test Email Service"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mt-6 border-b border-gray-200">
              {(
                [
                  "overview",
                  "members",
                  "files",
                  "projects",
                  "chat",
                  "settings",
                ] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 capitalize transition-colors flex items-center gap-2 ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "overview" && <Activity className="w-4 h-4" />}
                  {tab === "members" && <Users className="w-4 h-4" />}
                  {tab === "files" && <FileText className="w-4 h-4" />}
                  {tab === "chat" && <MessageSquare className="w-4 h-4" />}
                  {tab === "settings" && <Settings className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Team Members</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {getTeamMembers().length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Shared Files</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {sharedResources.length}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Messages</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-orange-500" />
                      Recent Activity
                    </h2>
                  </div>
                  <div className="p-6">
                    {teamActivities.length > 0 ? (
                      <div className="space-y-3">
                        {teamActivities.slice(0, 5).map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">
                                  {activity.userName}
                                </span>{" "}
                                {activity.action} {activity.target}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">
                        No recent activity
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTeamMembers().map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                member.isOnline ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {member.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              {member.role === "owner" && (
                                <Crown className="w-3 h-3 text-yellow-500" />
                              )}
                              {member.role === "admin" && (
                                <Shield className="w-3 h-3 text-purple-500" />
                              )}
                              <p className="text-sm text-gray-600 capitalize">
                                {member.role}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {/* Exit team button for current user (non-owners) */}
                          {member.id === user?.id &&
                            member.role !== "owner" && (
                              <button
                                onClick={() => {
                                  const hasExitRequest =
                                    selectedTeam?.exitRequests?.[user.id];
                                  if (hasExitRequest?.status === "pending") {
                                    if (
                                      confirm(
                                        "You have a pending exit request. Would you like to cancel it?"
                                      )
                                    ) {
                                      cancelExitRequest();
                                    }
                                  } else {
                                    setShowExitRequestModal(true);
                                  }
                                }}
                                className={`p-1 rounded transition-colors text-sm px-2 py-1 ${
                                  selectedTeam?.exitRequests?.[user.id]
                                    ?.status === "pending"
                                    ? "text-orange-600 hover:bg-orange-50 bg-orange-100"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                                title={
                                  selectedTeam?.exitRequests?.[user.id]
                                    ?.status === "pending"
                                    ? "Cancel exit request"
                                    : "Request to exit team"
                                }
                              >
                                {selectedTeam?.exitRequests?.[user.id]
                                  ?.status === "pending"
                                  ? "Cancel Exit"
                                  : "Exit Team"}
                              </button>
                            )}

                          {/* Remove member button for leaders */}
                          {member.id !== user?.id &&
                            member.role !== "owner" &&
                            (getTeamMembers().find((m) => m.id === user?.id)
                              ?.role === "owner" ||
                              getTeamMembers().find((m) => m.id === user?.id)
                                ?.role === "admin") && (
                              <button
                                onClick={() => confirmRemoveMember(member)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title={`Remove ${member.name} from team`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Exit request indicator */}
                      {selectedTeam?.exitRequests?.[member.id]?.status ===
                        "pending" && (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <span className="font-medium">
                              Exit request pending
                            </span>
                            {selectedTeam.exitRequests[member.id].reason && (
                              <>
                                <br />
                                <span className="text-orange-600">
                                  Reason:{" "}
                                  {selectedTeam.exitRequests[member.id].reason}
                                </span>
                              </>
                            )}
                          </p>
                          {(getTeamMembers().find((m) => m.id === user?.id)
                            ?.role === "owner" ||
                            getTeamMembers().find((m) => m.id === user?.id)
                              ?.role === "admin") && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => approveExitRequest(member.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectExitRequest(member.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {member.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{member.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-600" />
                      Shared Files ({sharedFiles.length})
                    </h2>
                    <button
                      onClick={() => setShowFileShareModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share File
                    </button>
                  </div>
                  <div className="p-4">
                    {sharedFiles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sharedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {file.fileType?.startsWith("image/") && (
                                  <FileText className="w-8 h-8 text-green-500" />
                                )}
                                {file.fileType?.startsWith("video/") && (
                                  <FileText className="w-8 h-8 text-purple-500" />
                                )}
                                {file.fileType?.startsWith("audio/") && (
                                  <FileText className="w-8 h-8 text-orange-500" />
                                )}
                                {file.fileType === "url" && (
                                  <ExternalLink className="w-8 h-8 text-blue-500" />
                                )}
                                {!file.fileType?.startsWith("image/") &&
                                  !file.fileType?.startsWith("video/") &&
                                  !file.fileType?.startsWith("audio/") &&
                                  file.fileType !== "url" && (
                                    <FileText className="w-8 h-8 text-gray-500" />
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {file.fileName}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  Shared by{" "}
                                  {getTeamMembers().find(
                                    (m) => m.id === file.sharedBy
                                  )?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {file.sharedAt?.toLocaleDateString
                                    ? file.sharedAt.toLocaleDateString()
                                    : new Date(
                                        file.sharedAt
                                      ).toLocaleDateString()}
                                </p>
                                {file.description && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {file.description}
                                  </p>
                                )}
                                {file.tags && file.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {file.tags
                                      .slice(0, 2)
                                      .map((tag: string) => (
                                        <span
                                          key={tag}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                        >
                                          <Hash className="w-3 h-3 mr-1" />
                                          {tag}
                                        </span>
                                      ))}
                                    {file.tags.length > 2 && (
                                      <span className="text-xs text-gray-500">
                                        +{file.tags.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-1">
                                {file.userPermissions?.canView && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Eye className="w-3 h-3" />
                                    View
                                  </span>
                                )}
                                {file.userPermissions?.canEdit && (
                                  <span className="flex items-center gap-1 text-xs text-blue-600">
                                    <Edit3 className="w-3 h-3" />
                                    Edit
                                  </span>
                                )}
                                {file.userPermissions?.canManage && (
                                  <span className="flex items-center gap-1 text-xs text-green-600">
                                    <Shield className="w-3 h-3" />
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    if (file.url) {
                                      window.open(file.url, "_blank");
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="View File"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {file.userPermissions?.canManage && (
                                  <button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this file?"
                                        )
                                      ) {
                                        fileShareService
                                          .deleteFile(file.id, user.id)
                                          .then(() => {
                                            loadSharedFiles();
                                          });
                                      }
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete File"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No files shared yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Share files with your team to get started
                        </p>
                        <button
                          onClick={() => setShowFileShareModal(true)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Share2 className="w-5 h-5" />
                          Share Your First File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-green-600" />
                      Team Projects
                    </h2>
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setShowCreateProjectModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                  </div>
                  <div className="p-4">
                    {/* Project Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-900">
                              Active Projects
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {projectStats.active}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Star className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-900">
                              In Progress
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {projectStats.inProgress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-purple-900">
                              Team Members
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              {Object.keys(selectedTeam?.members || {}).length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-orange-900">
                              Completed
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {projectStats.completed}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projects List */}
                    <div className="space-y-4">
                      {projects.length > 0 ? (
                        projects.map((project) => {
                          const getStatusColor = (
                            status: TeamProject["status"]
                          ) => {
                            switch (status) {
                              case "active":
                                return "bg-green-100 text-green-800";
                              case "in-progress":
                                return "bg-blue-100 text-blue-800";
                              case "completed":
                                return "bg-gray-100 text-gray-800";
                              case "on-hold":
                                return "bg-yellow-100 text-yellow-800";
                              case "cancelled":
                                return "bg-red-100 text-red-800";
                              case "planning":
                                return "bg-purple-100 text-purple-800";
                              default:
                                return "bg-gray-100 text-gray-800";
                            }
                          };

                          const getProgressColor = (progress: number) => {
                            if (progress >= 80)
                              return "bg-green-100 text-green-800";
                            if (progress >= 50)
                              return "bg-blue-100 text-blue-800";
                            if (progress >= 25)
                              return "bg-yellow-100 text-yellow-800";
                            return "bg-red-100 text-red-800";
                          };

                          const getPriorityIcon = (
                            priority: TeamProject["priority"]
                          ) => {
                            switch (priority) {
                              case "urgent":
                                return "🔥";
                              case "high":
                                return "⚡";
                              case "medium":
                                return "📋";
                              case "low":
                                return "📝";
                              default:
                                return "📋";
                            }
                          };

                          return (
                            <div
                              key={project.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Folder className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-gray-900">
                                        {project.name}
                                      </h3>
                                      <span className="text-sm">
                                        {getPriorityIcon(project.priority)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      Updated{" "}
                                      {project.updatedAt.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
                                      project.status
                                    )}`}
                                  >
                                    {project.status.replace("-", " ")}
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getProgressColor(
                                      project.progress
                                    )}`}
                                  >
                                    {project.progress}% Complete
                                  </span>
                                </div>
                              </div>

                              <p className="text-gray-600 text-sm mb-3">
                                {project.description ||
                                  "No description provided"}
                              </p>

                              {/* Tags */}
                              {project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {project.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                    >
                                      <Hash className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                  {project.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{project.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Tasks Summary */}
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Tasks:</span>
                                  <span className="font-medium text-gray-900">
                                    {project.stats.completedTasks}/
                                    {project.stats.totalTasks} completed
                                  </span>
                                </div>
                                {project.stats.totalTasks > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${
                                          (project.stats.completedTasks /
                                            project.stats.totalTasks) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-2">
                                    {project.assignedMembers
                                      .slice(0, 3)
                                      .map((memberId) => {
                                        const member = getTeamMembers().find(
                                          (m) => m.id === memberId
                                        );
                                        return member ? (
                                          <div
                                            key={member.id}
                                            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white"
                                            title={member.name}
                                          >
                                            {member.name
                                              .charAt(0)
                                              .toUpperCase()}
                                          </div>
                                        ) : null;
                                      })}
                                  </div>
                                  {project.assignedMembers.length > 3 && (
                                    <span className="text-sm text-gray-500">
                                      +{project.assignedMembers.length - 3} more
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleAddTaskToProject(project)
                                    }
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                    title="Add Task"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Task
                                  </button>
                                  <button
                                    onClick={() => handleEditProject(project)}
                                    className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                                    title="Edit Project"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <div className="text-sm text-gray-500">
                                    {project.dueDate
                                      ? `Due: ${project.dueDate.toLocaleDateString()}`
                                      : project.status === "completed" &&
                                        project.completedDate
                                      ? `Completed: ${project.completedDate.toLocaleDateString()}`
                                      : "No due date"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Projects Yet
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Create your first project to start collaborating
                            with your team.
                          </p>
                          <button
                            onClick={() => {
                              setEditingProject(null);
                              setShowCreateProjectModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                          >
                            <Plus className="w-4 h-4" />
                            Create First Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Team Chat
                  </h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {message.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {message.userName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && selectedTeam && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      Team Settings
                    </h2>
                  </div>
                  <div className="p-4 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-900">
                        Team Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Name
                          </label>
                          <input
                            type="text"
                            value={selectedTeam.name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Size
                          </label>
                          <input
                            type="text"
                            value={selectedTeam.size}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={selectedTeam.description}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                    </div>

                    {selectedTeam.inviteCode && (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium text-gray-900">
                          Team Invite
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Invite Code</p>
                            <button
                              onClick={() =>
                                copyInviteCode(selectedTeam.inviteCode!)
                              }
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy Link
                            </button>
                          </div>
                          <p className="font-mono text-lg font-bold text-blue-600">
                            {selectedTeam.inviteCode}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Share this code with people you want to invite to
                            your team
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Danger Zone - Only for team owners */}
                    {getTeamMembers().find((m) => m.id === user?.id)?.role ===
                      "owner" && (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium text-red-900">
                          Danger Zone
                        </h3>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-900">
                                Delete Team
                              </h4>
                              <p className="text-sm text-red-700 mt-1">
                                Permanently delete this team and all associated
                                data. This action cannot be undone.
                              </p>
                            </div>
                            <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Team
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Team Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Create or join a team to get started with collaborative learning
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setShowCreateTeam(true)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Team
              </button>

              <button
                onClick={() => {
                  loadPublicTeams();
                  setShowDiscoverTeams(true);
                }}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Discover Teams
              </button>

              <button
                onClick={() => setShowJoinTeamModal(true)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join with Code
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                💡 <strong>Create Team:</strong> Start your own study group
              </p>
              <p>
                🔍 <strong>Discover Teams:</strong> Browse public teams to join
              </p>
              <p>
                🔐 <strong>Join with Code:</strong> Use an invite code from a
                friend
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create New Team
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTeam(
                  formData.get("name") as string,
                  formData.get("description") as string,
                  formData.get("size") as string
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your team"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Size
                  </label>
                  <select
                    name="size"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Small (2-10 members)</option>
                    <option value="medium">Medium (11-50 members)</option>
                    <option value="large">Large (50+ members)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Invite Team Member
            </h2>
            {inviteSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{inviteSuccess}</span>
                </div>
              </div>
            )}

            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{inviteError}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(
                      e.target.value as "member" | "admin" | "viewer"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError(null);
                  setInviteSuccess(null);
                  setInviteEmail("");
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={inviteMember}
                disabled={loading || !inviteEmail.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join Team</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg tracking-wider"
                  maxLength={12}
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Enter the invite code you received to join a team
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowJoinTeamModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={joinTeam}
                disabled={loading || !inviteCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Join Team
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Share Modal */}
      {showFileShareModal && selectedTeam && (
        <FileShareModal
          isOpen={showFileShareModal}
          onClose={() => setShowFileShareModal(false)}
          teamId={selectedTeam.id}
          teamMembers={getTeamMembers().map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
          }))}
          onFileShared={() => {
            // Refresh the shared files list
            loadSharedFiles();
          }}
        />
      )}

      {/* Join Team Modal */}
      <JoinTeamModal
        isOpen={showJoinTeamModal}
        onClose={() => setShowJoinTeamModal(false)}
        onTeamJoined={() => {
          // Refresh teams when user joins a new team
          loadTeams();
        }}
      />

      {/* Email Test Panel */}
      {showEmailTestPanel && <EmailTestPanel />}

      {/* Create/Edit Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => {
          setShowCreateProjectModal(false);
          setEditingProject(null);
        }}
        teamId={selectedTeam?.id || ""}
        teamMembers={getTeamMembers()}
        onProjectCreated={handleCreateProject}
        editProject={editingProject}
      />

      {/* Add Task to Project Modal */}
      {selectedProjectForTask && (
        <AddProjectTaskModal
          isOpen={showAddTaskModal}
          onClose={() => {
            setShowAddTaskModal(false);
            setSelectedProjectForTask(null);
          }}
          project={selectedProjectForTask}
          teamMembers={getTeamMembers()}
          onTaskAdded={handleTaskAdded}
        />
      )}

      {/* Delete Team Confirmation Modal */}
      {showDeleteConfirmation && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Team
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <strong>"{selectedTeam.name}"</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• All team data and settings</li>
                  <li>• All shared files and messages</li>
                  <li>• All team activities and projects</li>
                  <li>• All pending invitations</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={deleteTeam}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Team
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Request Modal */}
      {showExitRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Request to Exit Team
                </h3>
                <p className="text-sm text-gray-500">
                  Request approval from team leaders
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                You are requesting to leave{" "}
                <strong>"{selectedTeam?.name}"</strong>. Team leaders will
                review your request.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Why do you want to leave this team?"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> You will remain in the team until a
                  team leader approves your exit request.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowExitRequestModal(false);
                  setExitReason("");
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={requestExit}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Remove Team Member
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove{" "}
                <strong>"{memberToRemove.name}"</strong> from the team?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">This member will:</p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Lose access to all team resources</li>
                  <li>• Be removed from all team projects</li>
                  <li>• No longer receive team notifications</li>
                  <li>• Need a new invitation to rejoin</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={removeMember}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discover Teams Modal */}
      {showDiscoverTeams && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Discover Teams
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Browse and join public teams
                  </p>
                </div>
                <button
                  onClick={() => setShowDiscoverTeams(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading teams...</span>
                </div>
              ) : publicTeams.length > 0 ? (
                <div className="space-y-4">
                  {publicTeams.map((team) => (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {team.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {team.size}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {team.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {Object.keys(team.members).length || 0} members
                            </div>
                            <div className="flex items-center">
                              <Hash className="w-4 h-4 mr-1" />
                              {team.inviteCode}
                            </div>
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Public
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => quickJoinTeam(team)}
                          disabled={loading}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          Join Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Public Teams Found
                  </h4>
                  <p className="text-gray-600 mb-4">
                    There are no public teams available right now. Try creating
                    your own team or joining with an invite code.
                  </p>
                  <button
                    onClick={() => setShowDiscoverTeams(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
