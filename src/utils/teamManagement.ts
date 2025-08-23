import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "./realTimeAuth";

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
      industry: teamData.industry,
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

    return userTeams;
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
    const batch = [];
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

    // In a real app, you'd send an email invitation
    // For now, create a pending invitation record
    const inviteId = `invite_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await setDoc(doc(db, "teamInvites", inviteId), {
      id: inviteId,
      teamId,
      email,
      role,
      invitedBy: user.id,
      status: "pending",
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.logActivity(teamId, "invited member", email, "member");
  }

  async joinTeamByInviteCode(inviteCode: string): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const teamsQuery = query(
      collection(db, "teams"),
      where("inviteCode", "==", inviteCode)
    );

    const teamsSnapshot = await getDocs(teamsQuery);

    if (teamsSnapshot.empty) {
      throw new Error("Invalid invite code");
    }

    const teamDoc = teamsSnapshot.docs[0];
    const team = teamDoc.data() as Team;

    if (team.members[user.id]) {
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
      [`members.${memberId}`]: deleteDoc as any,
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(
      teamId,
      "removed member",
      targetMember.name,
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
    targetRole: string,
    action: string
  ): boolean {
    const roleHierarchy = { owner: 3, admin: 2, member: 1, viewer: 0 };
    const currentLevel =
      roleHierarchy[currentRole as keyof typeof roleHierarchy] || 0;
    const targetLevel =
      roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

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
