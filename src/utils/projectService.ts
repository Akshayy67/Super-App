import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task } from '../types';
import { firestoreUserTasks } from './firestoreUserTasks';

export interface TeamProject {
  id: string;
  teamId: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number; // 0-100
  startDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  createdBy: string;
  assignedMembers: string[]; // User IDs
  tags: string[];
  tasks: ProjectTask[]; // Associated tasks
  milestones: ProjectMilestone[];
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  settings: {
    allowTaskCreation: boolean;
    requireApproval: boolean;
    isPublic: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    activeMembers: number;
  };
}

export interface ProjectTask {
  id: string;
  projectId: string;
  taskId: string; // Reference to main task system
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: Date;
  completedDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[]; // Other task IDs this depends on
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: Date;
  tasks: string[]; // Task IDs associated with this milestone
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: 'created' | 'updated' | 'task_added' | 'task_completed' | 'member_added' | 'milestone_reached';
  description: string;
  userId: string;
  timestamp: Date;
  metadata?: any;
}

class ProjectService {
  // Create a new project
  async createProject(teamId: string, userId: string, projectData: Omit<TeamProject, 'id' | 'createdAt' | 'updatedAt' | 'lastModifiedBy' | 'stats' | 'tasks'>): Promise<TeamProject> {
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const project: TeamProject = {
      id: projectId,
      ...projectData,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: userId,
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        activeMembers: projectData.assignedMembers.length
      }
    };

    await setDoc(doc(db, 'teamProjects', projectId), {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Log activity
    await this.addProjectActivity(projectId, {
      type: 'created',
      description: `Project "${project.name}" was created`,
      userId,
      metadata: { projectName: project.name }
    });

    return project;
  }

  // Get all projects for a team
  async getTeamProjects(teamId: string, userId: string): Promise<TeamProject[]> {
    try {
      // First try optimized query with orderBy
      const projectsRef = collection(db, 'teamProjects');
      let q = query(
        projectsRef,
        where('teamId', '==', teamId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const projects: TeamProject[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const project = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as TeamProject;

        // Check if user has access to this project
        if (project.assignedMembers.includes(userId) || project.createdBy === userId || project.settings.isPublic) {
          projects.push(project);
        }
      });

      return projects;
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        // Fallback to simple query and sort in memory
        console.warn('Firestore index not available, falling back to in-memory sorting');
        const projectsRef = collection(db, 'teamProjects');
        const q = query(projectsRef, where('teamId', '==', teamId));
        const snapshot = await getDocs(q);
        
        const projects: TeamProject[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const project = {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            dueDate: data.dueDate?.toDate(),
            completedDate: data.completedDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as TeamProject;

          if (project.assignedMembers.includes(userId) || project.createdBy === userId || project.settings.isPublic) {
            projects.push(project);
          }
        });

        // Sort by updatedAt in memory
        return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
      throw error;
    }
  }

  // Get a specific project
  async getProject(projectId: string, userId: string): Promise<TeamProject | null> {
    const projectDoc = await getDoc(doc(db, 'teamProjects', projectId));
    
    if (!projectDoc.exists()) {
      return null;
    }

    const data = projectDoc.data();
    const project = {
      id: projectDoc.id,
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      dueDate: data.dueDate?.toDate(),
      completedDate: data.completedDate?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as TeamProject;

    // Check access permissions
    if (!project.assignedMembers.includes(userId) && project.createdBy !== userId && !project.settings.isPublic) {
      throw new Error('Access denied: You do not have permission to view this project');
    }

    return project;
  }

  // Update project
  async updateProject(projectId: string, userId: string, updates: Partial<TeamProject>): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user can edit
    if (project.createdBy !== userId && !project.assignedMembers.includes(userId)) {
      throw new Error('Access denied: You cannot edit this project');
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId
    };

    await updateDoc(doc(db, 'teamProjects', projectId), updateData);

    // Log activity
    await this.addProjectActivity(projectId, {
      type: 'updated',
      description: `Project was updated`,
      userId
    });
  }

  // Delete project
  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Only creator can delete
    if (project.createdBy !== userId) {
      throw new Error('Access denied: Only the project creator can delete this project');
    }

    // Delete all associated tasks from the main task system
    for (const projectTask of project.tasks) {
      try {
        await firestoreUserTasks.deleteTask(userId, projectTask.taskId);
      } catch (error) {
        console.warn(`Failed to delete task ${projectTask.taskId}:`, error);
      }
    }

    // Delete project activities
    const activitiesRef = collection(db, 'projectActivities');
    const activitiesQuery = query(activitiesRef, where('projectId', '==', projectId));
    const activitiesSnapshot = await getDocs(activitiesQuery);
    
    const deletePromises = activitiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the project
    await deleteDoc(doc(db, 'teamProjects', projectId));
  }

  // Add task to project (integrates with main task system)
  async addTaskToProject(projectId: string, userId: string, taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<ProjectTask> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.settings.allowTaskCreation && !project.assignedMembers.includes(userId) && project.createdBy !== userId) {
      throw new Error('Access denied: You cannot add tasks to this project');
    }

    // Create task in main task system
    const mainTask: Omit<Task, 'id'> = {
      ...taskData,
      userId,
      createdAt: new Date().toISOString(),
      subject: `${project.name} - ${taskData.subject || 'Project Task'}`
    };

    await firestoreUserTasks.addTask(userId, mainTask);

    // Get the created task to get its ID
    const userTasks = await firestoreUserTasks.getTasks(userId);
    const createdTask = userTasks.find(t => 
      t.title === mainTask.title && 
      t.description === mainTask.description &&
      t.dueDate === mainTask.dueDate
    );

    if (!createdTask) {
      throw new Error('Failed to create task');
    }

    // Create project task reference
    const projectTask: ProjectTask = {
      id: `ptask_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      taskId: createdTask.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status === 'completed' ? 'completed' : 'todo',
      priority: taskData.priority,
      assignedTo: userId,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: [],
      tags: []
    };

    // Update project with new task
    await updateDoc(doc(db, 'teamProjects', projectId), {
      tasks: arrayUnion(projectTask),
      'stats.totalTasks': project.stats.totalTasks + 1,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId
    });

    // Log activity
    await this.addProjectActivity(projectId, {
      type: 'task_added',
      description: `Task "${taskData.title}" was added to the project`,
      userId,
      metadata: { taskTitle: taskData.title }
    });

    return projectTask;
  }

  // Update project task status (syncs with main task system)
  async updateProjectTaskStatus(projectId: string, projectTaskId: string, userId: string, status: ProjectTask['status']): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    const projectTask = project.tasks.find(t => t.id === projectTaskId);
    if (!projectTask) {
      throw new Error('Task not found in project');
    }

    // Update in main task system
    const mainTaskStatus = status === 'completed' ? 'completed' : 'pending';
    await firestoreUserTasks.updateTask(userId, projectTask.taskId, { 
      status: mainTaskStatus 
    });

    // Update project task
    const updatedTasks = project.tasks.map(t => 
      t.id === projectTaskId 
        ? { ...t, status, updatedAt: new Date(), completedDate: status === 'completed' ? new Date() : undefined }
        : t
    );

    const completedTasks = updatedTasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completedTasks / updatedTasks.length) * 100);

    await updateDoc(doc(db, 'teamProjects', projectId), {
      tasks: updatedTasks,
      progress,
      'stats.completedTasks': completedTasks,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId
    });

    if (status === 'completed') {
      await this.addProjectActivity(projectId, {
        type: 'task_completed',
        description: `Task "${projectTask.title}" was completed`,
        userId,
        metadata: { taskTitle: projectTask.title }
      });
    }
  }

  // Get project statistics for dashboard
  async getProjectStats(teamId: string, userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    inProgress: number;
    overdue: number;
  }> {
    const projects = await this.getTeamProjects(teamId, userId);
    
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'in-progress').length,
      overdue: projects.filter(p => p.dueDate && p.dueDate < new Date() && p.status !== 'completed').length
    };
  }

  // Add project activity log
  private async addProjectActivity(projectId: string, activity: Omit<ProjectActivity, 'id' | 'projectId' | 'timestamp'>): Promise<void> {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const activityData: ProjectActivity = {
      id: activityId,
      projectId,
      ...activity,
      timestamp: new Date()
    };

    await setDoc(doc(db, 'projectActivities', activityId), {
      ...activityData,
      timestamp: serverTimestamp()
    });
  }

  // Get project activities
  async getProjectActivities(projectId: string, limit: number = 10): Promise<ProjectActivity[]> {
    const activitiesRef = collection(db, 'projectActivities');
    const q = query(
      activitiesRef,
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc')
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ProjectActivity));
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        // Fallback without orderBy
        const simpleQuery = query(activitiesRef, where('projectId', '==', projectId));
        const snapshot = await getDocs(simpleQuery);
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        } as ProjectActivity));
        
        return activities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      }
      throw error;
    }
  }

  // Add member to project
  async addMemberToProject(projectId: string, userId: string, memberUserId: string): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.createdBy !== userId) {
      throw new Error('Access denied: Only the project creator can add members');
    }

    if (project.assignedMembers.includes(memberUserId)) {
      throw new Error('User is already a member of this project');
    }

    await updateDoc(doc(db, 'teamProjects', projectId), {
      assignedMembers: arrayUnion(memberUserId),
      'stats.activeMembers': project.stats.activeMembers + 1,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId
    });

    await this.addProjectActivity(projectId, {
      type: 'member_added',
      description: `A new member was added to the project`,
      userId,
      metadata: { addedMember: memberUserId }
    });
  }

  // Remove member from project
  async removeMemberFromProject(projectId: string, userId: string, memberUserId: string): Promise<void> {
    const project = await this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.createdBy !== userId) {
      throw new Error('Access denied: Only the project creator can remove members');
    }

    await updateDoc(doc(db, 'teamProjects', projectId), {
      assignedMembers: arrayRemove(memberUserId),
      'stats.activeMembers': Math.max(0, project.stats.activeMembers - 1),
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId
    });
  }
}

export const projectService = new ProjectService();
