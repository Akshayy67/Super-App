import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Settings, Shield, Folder, Activity,
  Calendar, MessageSquare, Video, Bell, Search,
  ChevronRight, UserPlus, Crown, Star, Clock,
  TrendingUp, Target, Award, Briefcase, Hash,
  Lock, Unlock, Eye, Edit3, Trash2, MoreVertical,
  CheckCircle, AlertCircle, Mail, Phone, MapPin,
  Github, Linkedin, Twitter, Globe, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../config/firebase';
import {
  collection, doc, setDoc, getDoc, updateDoc,
  query, where, onSnapshot, serverTimestamp,
  Timestamp, deleteDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
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
    defaultRole: 'member' | 'viewer';
  };
  billing?: {
    plan: 'free' | 'pro' | 'enterprise';
    seats: number;
    billingCycle: 'monthly' | 'yearly';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'review' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
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
  type: 'task' | 'document' | 'member' | 'project' | 'comment';
}

const ROLE_PERMISSIONS = {
  owner: ['all'],
  admin: ['manage_members', 'manage_projects', 'manage_settings', 'create', 'edit', 'delete', 'view'],
  member: ['create', 'edit', 'view', 'comment'],
  viewer: ['view', 'comment']
};

const AVATAR_COLORS = [
  'bg-gradient-to-br from-purple-400 to-pink-400',
  'bg-gradient-to-br from-blue-400 to-cyan-400',
  'bg-gradient-to-br from-green-400 to-teal-400',
  'bg-gradient-to-br from-yellow-400 to-orange-400',
  'bg-gradient-to-br from-red-400 to-pink-400',
  'bg-gradient-to-br from-indigo-400 to-purple-400'
];

export const TeamWorkspace: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'members' | 'projects' | 'activity'>('overview');

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

    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where(`members.${user.id}`, '!=', null));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData: Team[] = [];
      snapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() } as Team);
      });
      setTeams(teamsData);
      
      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0]);
      }
    });

    return unsubscribe;
  };

  const loadTeamData = async (teamId: string) => {
    // Load projects
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(projectsRef, where('teamId', '==', teamId));
    
    onSnapshot(projectsQuery, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
    });

    // Load activities
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(
      activitiesRef,
      where('teamId', '==', teamId)
    );
    
    onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData: Activity[] = [];
      snapshot.forEach((doc) => {
        activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
      });
      setActivities(activitiesData.sort((a, b) => 
        b.timestamp.toMillis() - a.timestamp.toMillis()
      ));
    });
  };

  const determineUserRole = () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !selectedTeam) return;
    
    const member = selectedTeam.members[user.id];
    if (member) {
      setCurrentUserRole(member.role);
    }
  };

  const createTeam = async (teamData: Partial<Team>) => {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTeam: Team = {
      id: teamId,
      name: teamData.name || 'New Team',
      description: teamData.description || '',
      size: 'small',
      members: {
        [user.id]: {
          id: user.id,
          name: user.name || 'Team Owner',
          email: user.email || '',
          role: 'owner',
          joinedAt: serverTimestamp() as Timestamp,
          lastActive: serverTimestamp() as Timestamp,
          isOnline: true,
          skills: [],
          stats: {
            tasksCompleted: 0,
            projectsContributed: 0,
            documentsCreated: 0,
            hoursLogged: 0
          }
        }
      },
      projects: [],
      settings: {
        isPublic: false,
        allowInvites: true,
        requireApproval: true,
        defaultRole: 'member'
      },
      billing: {
        plan: 'free',
        seats: 5,
        billingCycle: 'monthly'
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    await setDoc(doc(db, 'teams', teamId), newTeam);
    setShowCreateTeam(false);
    
    // Log activity
    await logActivity('created team', newTeam.name, 'member');
  };

  const inviteMember = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!selectedTeam || !hasPermission('manage_members')) return;

    // Generate invite token
    const inviteToken = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store invite in database
    await setDoc(doc(db, 'invites', inviteToken), {
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      email,
      role,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Send invite email (mock)
    console.log(`Invite sent to ${email} with role ${role}`);
    
    // Log activity
    await logActivity('invited member', email, 'member');
    
    setShowInviteModal(false);
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (!selectedTeam || !hasPermission('manage_members')) return;

    const teamRef = doc(db, 'teams', selectedTeam.id);
    await updateDoc(teamRef, {
      [`members.${memberId}.role`]: newRole,
      updatedAt: serverTimestamp()
    });

    await logActivity('updated role', `${memberId} to ${newRole}`, 'member');
  };

  const removeMember = async (memberId: string) => {
    if (!selectedTeam || !hasPermission('manage_members')) return;
    
    const teamRef = doc(db, 'teams', selectedTeam.id);
    const updatedMembers = { ...selectedTeam.members };
    delete updatedMembers[memberId];
    
    await updateDoc(teamRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });

    await logActivity('removed member', memberId, 'member');
  };

  const createProject = async (projectData: Partial<Project>) => {
    if (!selectedTeam || !hasPermission('create')) return;

    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newProject: Project = {
      id: projectId,
      teamId: selectedTeam.id,
      name: projectData.name || 'New Project',
      description: projectData.description || '',
      status: 'planning',
      priority: 'medium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      progress: 0,
      members: [realTimeAuth.getCurrentUser()?.id || ''],
      tasks: 0,
      completedTasks: 0,
      documents: [],
      tags: [],
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    await setDoc(doc(db, 'projects', projectId), newProject);
    
    // Update team projects
    const teamRef = doc(db, 'teams', selectedTeam.id);
    await updateDoc(teamRef, {
      projects: arrayUnion(projectId),
      updatedAt: serverTimestamp()
    });

    await logActivity('created project', newProject.name, 'project');
    setShowProjectModal(false);
  };

  const logActivity = async (action: string, target: string, type: Activity['type']) => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !selectedTeam) return;

    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, 'activities', activityId), {
      id: activityId,
      teamId: selectedTeam.id,
      userId: user.id,
      userName: user.name || 'Unknown',
      action,
      target,
      type,
      timestamp: serverTimestamp()
    });
  };

  const hasPermission = (permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[currentUserRole as keyof typeof ROLE_PERMISSIONS];
    return permissions?.includes('all') || permissions?.includes(permission);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Team Selector */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === e.target.value);
                    setSelectedTeam(team || null);
                  }}
                  className="appearance-none bg-gray-50 dark:bg-gray-700 px-4 py-2 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowCreateTeam(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Create new team"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-1">
              {['overview', 'members', 'projects', 'activity'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === view
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Video className="w-5 h-5" />
              </button>
              
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTeam && (
          <>
            {/* Overview */}
            {activeView === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-500" />
                      <span className="text-2xl font-bold">{Object.keys(selectedTeam.members).length}</span>
                    </div>
                    <h3 className="font-semibold dark:text-white">Team Members</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Object.values(selectedTeam.members).filter(m => m.isOnline).length} online
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Briefcase className="w-8 h-8 text-green-500" />
                      <span className="text-2xl font-bold">{projects.length}</span>
                    </div>
                    <h3 className="font-semibold dark:text-white">Active Projects</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {projects.filter(p => p.status === 'completed').length} completed
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="w-8 h-8 text-purple-500" />
                      <span className="text-2xl font-bold">{activities.length}</span>
                    </div>
                    <h3 className="font-semibold dark:text-white">Activities</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This week</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                      <span className="text-2xl font-bold">
                        {projects.reduce((acc, p) => acc + p.progress, 0) / Math.max(projects.length, 1)}%
                      </span>
                    </div>
                    <h3 className="font-semibold dark:text-white">Avg Progress</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Across all projects</p>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          {activity.type === 'task' && <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          {activity.type === 'document' && <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          {activity.type === 'member' && <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          {activity.type === 'project' && <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm dark:text-gray-300">
                            <span className="font-medium">{activity.userName}</span>{' '}
                            {activity.action}{' '}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Members View */}
            {activeView === 'members' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold dark:text-white">Team Members</h2>
                  {hasPermission('manage_members') && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(selectedTeam.members).map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            AVATAR_COLORS[member.id.charCodeAt(0) % AVATAR_COLORS.length]
                          }`}>
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <h3 className="font-semibold dark:text-white flex items-center space-x-1">
                              <span>{member.name}</span>
                              {member.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                              {member.role === 'admin' && <Shield className="w-4 h-4 text-purple-500" />}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{member.title || member.role}</p>
                          </div>
                        </div>
                        {member.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                          <span>Last seen {formatTimestamp(member.lastActive)}</span>
                        </div>
                      </div>

                      {member.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                              +{member.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {hasPermission('manage_members') && member.role !== 'owner' && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between">
                          <select
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                            className="text-sm bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects View */}
            {activeView === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold dark:text-white">Projects</h2>
                  {hasPermission('create') && (
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${project.color} flex items-center justify-center`}>
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          project.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {project.priority}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg dark:text-white mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
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
                                className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-white font-bold border-2 border-white dark:border-gray-800"
                                title={member.name}
                              >
                                {getInitials(member.name)}
                              </div>
                            );
                          })}
                          {project.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs border-2 border-white dark:border-gray-800">
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
          </>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Team</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createTeam({
                name: formData.get('name') as string,
                description: formData.get('description') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Team Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Describe your team"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Invite Team Member</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              inviteMember(
                formData.get('email') as string,
                formData.get('role') as 'admin' | 'member' | 'viewer'
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Role</label>
                  <select
                    name="role"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
