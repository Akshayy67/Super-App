import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { emailService } from "../../utils/emailService";
import { teamFilePermissionService } from "./teamFilePermissionService";

export interface TeamMember {
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

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  industry?: string;
  size: string;
  ownerId: string;
  members: { [key: string]: TeamMember };
  projects: string[];
  exitRequests?: { [key: string]: ExitRequest };
  teamType: "general" | "study"; // New field for team type
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    requireApproval: boolean;
    defaultRole: "member" | "viewer";
  };
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExitRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  reason?: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
}

export interface Project {
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

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: Date;
  type: "task" | "document" | "member" | "project" | "comment";
}

export interface TeamMessage {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  edited?: boolean;
  attachments?: string[];
}

class TeamManagementService {
  // Team CRUD operations
  async createTeam(teamData: {
    name: string;
    description: string;
    size: string;
    industry?: string;
    teamType: "general" | "study";
  }): Promise<Team> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const teamId = `team_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const inviteCode = `${teamData.name
      .substring(0, 3)
      .toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const newTeam: Team = {
      id: teamId,
      name: teamData.name,
      description: teamData.description,
      size: teamData.size,
      ...(teamData.industry && { industry: teamData.industry }),
      teamType: teamData.teamType,
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
      inviteCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "teams", teamId), {
      ...newTeam,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newTeam;
  }

  async getUserTeams(): Promise<Team[]> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return [];

    try {
      // Get all teams and filter on client side to avoid complex queries
      const teamsRef = collection(db, "teams");
      const teamsSnapshot = await getDocs(teamsRef);

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

      // Sort by updatedAt in memory
      return userTeams.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      console.error("Error fetching user teams:", error);
      return [];
    }
  }

  async getTeam(teamId: string): Promise<Team | null> {
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) return null;

    const data = teamDoc.data();
    return {
      id: teamDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Team;
  }

  async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    await updateDoc(doc(db, "teams", teamId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteTeam(teamId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team || team.ownerId !== user.id) {
      throw new Error("Only team owner can delete the team");
    }

    // Delete related projects and activities
    const projectsSnapshot = await getDocs(
      query(collection(db, "projects"), where("teamId", "==", teamId))
    );

    const activitiesSnapshot = await getDocs(
      query(collection(db, "activities"), where("teamId", "==", teamId))
    );

    const messagesSnapshot = await getDocs(
      query(collection(db, "teamMessages"), where("teamId", "==", teamId))
    );

    // Delete all related documents
    const batch: Promise<void>[] = [];
    projectsSnapshot.forEach((doc) => batch.push(deleteDoc(doc.ref)));
    activitiesSnapshot.forEach((doc) => batch.push(deleteDoc(doc.ref)));
    messagesSnapshot.forEach((doc) => batch.push(deleteDoc(doc.ref)));

    await Promise.all(batch);

    // Finally delete the team
    await deleteDoc(doc(db, "teams", teamId));
  }

  // Member management
  async inviteMember(
    teamId: string,
    email: string,
    role: "member" | "admin" | "viewer" = "member"
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const currentMember = team.members[user.id];
    if (
      !currentMember ||
      (currentMember.role !== "owner" && currentMember.role !== "admin")
    ) {
      throw new Error("Insufficient permissions to invite members");
    }

    // Generate unique invite code
    const inviteCode = emailService.generateInviteCode();
    const inviteId = `invite_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create invitation record in database
    await setDoc(doc(db, "teamInvites", inviteId), {
      id: inviteId,
      teamId,
      teamName: team.name,
      email,
      role,
      invitedBy: user.id,
      inviterName: currentMember.name,
      status: "pending",
      inviteCode,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send email invitation using the email service
    const emailResult = await emailService.sendTeamInvite({
      teamId,
      teamName: team.name,
      inviterName: currentMember.name,
      inviteeEmail: email,
      inviteCode,
    });

    if (emailResult.success) {
      console.log(`✅ Team invitation sent successfully to ${email}`);
    } else {
      console.warn("Failed to send email invitation:", emailResult.error);
      // Continue with the process even if email fails (for development)
    }

    await this.logActivity(teamId, "invited member", email, "member");
  }

  async joinTeamByInviteCode(inviteCode: string): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    console.log("🔍 Searching for team with invite code:", inviteCode);

    const teamsQuery = query(
      collection(db, "teams"),
      where("inviteCode", "==", inviteCode)
    );

    const teamsSnapshot = await getDocs(teamsQuery);

    console.log("🔍 Query results:", {
      empty: teamsSnapshot.empty,
      size: teamsSnapshot.size,
      docs: teamsSnapshot.docs.length,
    });

    if (teamsSnapshot.empty) {
      console.log("❌ No teams found with invite code:", inviteCode);
      throw new Error("Invalid invite code");
    }

    const teamDoc = teamsSnapshot.docs[0];
    const team = teamDoc.data() as Team;

    console.log("✅ Found team:", {
      id: teamDoc.id,
      name: team.name,
      inviteCode: team.inviteCode,
      memberCount: Object.keys(team.members).length,
    });

    if (team.members[user.id]) {
      console.log("ℹ️ User is already a member of this team");
      throw new Error("You are already a member of this team");
    }

    const newMember: TeamMember = {
      id: user.id,
      name: user.username || user.email,
      email: user.email,
      role: team.settings.defaultRole,
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
    };

    await updateDoc(doc(db, "teams", teamDoc.id), {
      [`members.${user.id}`]: newMember,
      updatedAt: serverTimestamp(),
    });

    // Grant access to all existing team files for the new member
    try {
      console.log("🔄 Granting file access to new team member...");
      const fileUpdates =
        await teamFilePermissionService.grantTeamFileAccessToNewMember(
          teamDoc.id,
          user.id,
          newMember.role
        );
      console.log(
        `✅ Granted access to ${
          fileUpdates.filter((u) => u.updated).length
        } files/folders`
      );
    } catch (error) {
      console.error("⚠️ Error granting file access to new member:", error);
      // Don't fail the join operation if file permission update fails
    }

    await this.logActivity(
      teamDoc.id,
      "joined team",
      user.username || user.email,
      "member"
    );

    return teamDoc.id;
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const currentMember = team.members[user.id];
    const targetMember = team.members[memberId];

    if (!currentMember || !targetMember) {
      throw new Error("Member not found");
    }

    // Only owners can remove admins, owners and admins can remove members
    if (targetMember.role === "owner") {
      throw new Error("Cannot remove team owner");
    }

    if (targetMember.role === "admin" && currentMember.role !== "owner") {
      throw new Error("Only team owner can remove admins");
    }

    if (currentMember.role !== "owner" && currentMember.role !== "admin") {
      throw new Error("Insufficient permissions to remove members");
    }

    await updateDoc(doc(db, "teams", teamId), {
      [`members.${memberId}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });

    // Revoke access to all team files for the removed member
    try {
      console.log("🔄 Revoking file access from removed team member...");
      const fileUpdates =
        await teamFilePermissionService.revokeTeamFileAccessFromMember(
          teamId,
          memberId
        );
      console.log(
        `✅ Revoked access from ${
          fileUpdates.filter((u) => u.updated).length
        } files/folders`
      );
    } catch (error) {
      console.error(
        "⚠️ Error revoking file access from removed member:",
        error
      );
      // Don't fail the removal operation if file permission update fails
    }

    await this.logActivity(
      teamId,
      "removed member",
      targetMember.name,
      "member"
    );
  }

  async requestExit(teamId: string, reason?: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const member = team.members[user.id];
    if (!member) throw new Error("You are not a member of this team");

    if (member.role === "owner") {
      throw new Error(
        "Team owners cannot exit the team. Transfer ownership first."
      );
    }

    // Check if there's already a pending exit request
    const existingRequest = team.exitRequests?.[user.id];
    if (existingRequest && existingRequest.status === "pending") {
      throw new Error("You already have a pending exit request");
    }

    const exitRequest: ExitRequest = {
      id: user.id,
      memberId: user.id,
      memberName: member.name,
      memberEmail: member.email,
      reason,
      requestedAt: new Date(),
      status: "pending",
    };

    await updateDoc(doc(db, "teams", teamId), {
      [`exitRequests.${user.id}`]: exitRequest,
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(teamId, "requested to exit", member.name, "member");
  }

  async approveExitRequest(teamId: string, memberId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const currentMember = team.members[user.id];
    if (
      !currentMember ||
      (currentMember.role !== "owner" && currentMember.role !== "admin")
    ) {
      throw new Error("Only team owners and admins can approve exit requests");
    }

    const exitRequest = team.exitRequests?.[memberId];
    if (!exitRequest || exitRequest.status !== "pending") {
      throw new Error("No pending exit request found for this member");
    }

    const targetMember = team.members[memberId];
    if (!targetMember) throw new Error("Member not found");

    // Remove the member and the exit request
    await updateDoc(doc(db, "teams", teamId), {
      [`members.${memberId}`]: deleteField(),
      [`exitRequests.${memberId}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(
      teamId,
      "approved exit request",
      targetMember.name,
      "member"
    );
  }

  async rejectExitRequest(
    teamId: string,
    memberId: string,
    reason?: string
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const currentMember = team.members[user.id];
    if (
      !currentMember ||
      (currentMember.role !== "owner" && currentMember.role !== "admin")
    ) {
      throw new Error("Only team owners and admins can reject exit requests");
    }

    const exitRequest = team.exitRequests?.[memberId];
    if (!exitRequest || exitRequest.status !== "pending") {
      throw new Error("No pending exit request found for this member");
    }

    // Update the exit request status
    await updateDoc(doc(db, "teams", teamId), {
      [`exitRequests.${memberId}.status`]: "rejected",
      [`exitRequests.${memberId}.rejectedReason`]: reason,
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(
      teamId,
      "rejected exit request",
      exitRequest.memberName,
      "member"
    );
  }

  async cancelExitRequest(teamId: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const exitRequest = team.exitRequests?.[user.id];
    if (!exitRequest || exitRequest.status !== "pending") {
      throw new Error("No pending exit request found");
    }

    await updateDoc(doc(db, "teams", teamId), {
      [`exitRequests.${user.id}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(
      teamId,
      "cancelled exit request",
      exitRequest.memberName,
      "member"
    );
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    newRole: "admin" | "member" | "viewer"
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const currentMember = team.members[user.id];
    const targetMember = team.members[memberId];

    if (!currentMember || !targetMember) {
      throw new Error("Member not found");
    }

    if (currentMember.role !== "owner") {
      throw new Error("Only team owner can change member roles");
    }

    if (targetMember.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    await updateDoc(doc(db, "teams", teamId), {
      [`members.${memberId}.role`]: newRole,
      updatedAt: serverTimestamp(),
    });

    // Update file permissions based on new role
    try {
      console.log(
        `🔄 Updating file permissions for role change: ${targetMember.role} -> ${newRole}`
      );
      // First revoke all current permissions
      await teamFilePermissionService.revokeTeamFileAccessFromMember(
        teamId,
        memberId
      );
      // Then grant new permissions based on new role
      const fileUpdates =
        await teamFilePermissionService.grantTeamFileAccessToNewMember(
          teamId,
          memberId,
          newRole
        );
      console.log(
        `✅ Updated permissions for ${
          fileUpdates.filter((u) => u.updated).length
        } files/folders`
      );
    } catch (error) {
      console.error(
        "⚠️ Error updating file permissions for role change:",
        error
      );
      // Don't fail the role update if file permission update fails
    }

    await this.logActivity(
      teamId,
      "updated member role",
      `${targetMember.name} to ${newRole}`,
      "member"
    );
  }

  // Project management
  async createProject(
    teamId: string,
    projectData: {
      name: string;
      description: string;
      priority?: "low" | "medium" | "high" | "critical";
      endDate?: Date;
    }
  ): Promise<Project> {
    const user = realTimeAuth.getCurrentUser();
    const team = await this.getTeam(teamId);

    if (!user || !team) throw new Error("Team or user not found");

    const currentMember = team.members[user.id];
    if (!currentMember || currentMember.role === "viewer") {
      throw new Error("Insufficient permissions to create projects");
    }

    const projectId = `project_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newProject: Project = {
      id: projectId,
      teamId,
      name: projectData.name,
      description: projectData.description,
      status: "planning",
      priority: projectData.priority || "medium",
      startDate: new Date(),
      endDate:
        projectData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 0,
      members: [user.id],
      tasks: 0,
      completedTasks: 0,
      documents: [],
      tags: [],
      color: [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
      ][Math.floor(Math.random() * 5)],
    };

    await setDoc(doc(db, "projects", projectId), {
      ...newProject,
      startDate: serverTimestamp(),
      endDate:
        projectData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Update team projects list
    await updateDoc(doc(db, "teams", teamId), {
      projects: arrayUnion(projectId),
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(
      teamId,
      "created project",
      newProject.name,
      "project"
    );

    return newProject;
  }

  async getTeamProjects(teamId: string): Promise<Project[]> {
    try {
      // First try the optimized query
      const projectsQuery = query(
        collection(db, "projects"),
        where("teamId", "==", teamId),
        orderBy("startDate", "desc")
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects: Project[] = [];

      projectsSnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
        } as Project);
      });

      return projects;
    } catch (error: any) {
      // If index is missing, fall back to simple query and sort in memory
      if (
        error.code === "failed-precondition" ||
        error.message?.includes("index")
      ) {
        console.warn(
          "Firestore index missing for projects, using fallback query."
        );

        const simpleQuery = query(
          collection(db, "projects"),
          where("teamId", "==", teamId)
        );

        const snapshot = await getDocs(simpleQuery);
        const projects: Project[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          projects.push({
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || new Date(),
          } as Project);
        });

        // Sort in memory
        return projects.sort(
          (a, b) => b.startDate.getTime() - a.startDate.getTime()
        );
      }

      throw error;
    }
  }

  // Activity logging
  async logActivity(
    teamId: string,
    action: string,
    target: string,
    type: TeamActivity["type"]
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const activityId = `activity_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await setDoc(doc(db, "activities", activityId), {
      id: activityId,
      teamId,
      userId: user.id,
      userName: user.username || user.email,
      action,
      target,
      type,
      timestamp: serverTimestamp(),
    });
  }

  async getTeamActivities(teamId: string, limit = 20): Promise<TeamActivity[]> {
    try {
      // First try the optimized query with orderBy
      const activitiesQuery = query(
        collection(db, "activities"),
        where("teamId", "==", teamId),
        orderBy("timestamp", "desc")
      );

      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activities: TeamActivity[] = [];

      activitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as TeamActivity);
      });

      return activities.slice(0, limit);
    } catch (error: any) {
      // If index is missing, fall back to simple query and sort in memory
      if (
        error.code === "failed-precondition" ||
        error.message?.includes("index")
      ) {
        console.warn(
          "Firestore index missing, using fallback query. Consider creating the index for better performance."
        );

        const simpleQuery = query(
          collection(db, "activities"),
          where("teamId", "==", teamId)
        );

        const snapshot = await getDocs(simpleQuery);
        const activities: TeamActivity[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as TeamActivity);
        });

        // Sort in memory and return limited results
        return activities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      }

      // Re-throw other errors
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToTeams(callback: (teams: Team[]) => void): () => void {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return () => {};

    const teamsRef = collection(db, "teams");

    return onSnapshot(teamsRef, (snapshot) => {
      const userTeams: Team[] = [];

      snapshot.forEach((doc) => {
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

      callback(userTeams);
    });
  }

  subscribeToTeamMessages(
    teamId: string,
    callback: (messages: TeamMessage[]) => void
  ): () => void {
    const messagesQuery = query(
      collection(db, "teamMessages"),
      where("teamId", "==", teamId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: TeamMessage[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as TeamMessage);
      });

      callback(messages);
    });
  }

  // Messaging
  async sendMessage(teamId: string, message: string): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const messageId = `msg_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await setDoc(doc(db, "teamMessages", messageId), {
      id: messageId,
      teamId,
      userId: user.id,
      userName: user.username || user.email,
      message: message.trim(),
      timestamp: serverTimestamp(),
    });
  }

  // Utility functions
  generateInviteCode(teamName: string): string {
    return `${teamName.substring(0, 3).toUpperCase()}${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
  }

  validateMemberRole(
    currentRole: string,
    _targetRole: string,
    action: string
  ): boolean {
    const roleHierarchy = { owner: 3, admin: 2, member: 1, viewer: 0 };
    const currentLevel =
      roleHierarchy[currentRole as keyof typeof roleHierarchy] || 0;

    switch (action) {
      case "invite":
      case "remove":
        return currentLevel >= 2; // admin or owner
      case "promote":
      case "demote":
        return currentLevel >= 3; // owner only
      case "create_project":
        return currentLevel >= 1; // member or above
      default:
        return false;
    }
  }
}

export const teamManagementService = new TeamManagementService();
