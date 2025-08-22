import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Share2,
  MessageSquare,
  FileText,
  Folder,
  Activity,
  Settings,
  Shield,
  Globe,
  Lock,
  Unlock,
  Eye,
  Edit3,
  Trash2,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Hash,
  Video,
  Mic,
  Send
} from 'lucide-react';
import { realTimeAuth } from '../utils/realTimeAuth';
import { db } from '../config/firebase';
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
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastActive?: Date;
  status: 'online' | 'away' | 'offline';
}

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
  settings: TeamSettings;
  inviteCode?: string;
}

interface TeamSettings {
  isPublic: boolean;
  allowMemberInvites: boolean;
  allowFileSharing: boolean;
  allowChat: boolean;
  allowVideoCall: boolean;
  maxMembers: number;
}

interface SharedResource {
  id: string;
  teamId: string;
  type: 'file' | 'note' | 'task' | 'flashcard';
  title: string;
  content?: string;
  sharedBy: string;
  sharedAt: Date;
  permissions: 'view' | 'edit' | 'admin';
  tags?: string[];
}

interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  timestamp: Date;
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

export const TeamSpace: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'chat' | 'members' | 'settings'>('overview');

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData(selectedTeam.id);
      subscribeToTeamUpdates(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(
        teamsRef,
        where('members', 'array-contains', user.id),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const loadedTeams: Team[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedTeams.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Team);
      });

      setTeams(loadedTeams);
      if (loadedTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(loadedTeams[0]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      // Load team members
      const membersPromises = selectedTeam?.members.map(async (memberId) => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            id: memberId,
            ...userData,
            joinedAt: userData.joinedAt?.toDate(),
            lastActive: userData.lastActive?.toDate()
          } as TeamMember;
        }
        return null;
      }) || [];

      const members = (await Promise.all(membersPromises)).filter(Boolean) as TeamMember[];
      setTeamMembers(members);

      // Load shared resources
      const resourcesRef = collection(db, 'sharedResources');
      const resourcesQuery = query(
        resourcesRef,
        where('teamId', '==', teamId),
        orderBy('sharedAt', 'desc')
      );
      
      const resourcesSnapshot = await getDocs(resourcesQuery);
      const resources: SharedResource[] = [];
      
      resourcesSnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          id: doc.id,
          ...data,
          sharedAt: data.sharedAt?.toDate()
        } as SharedResource);
      });
      
      setSharedResources(resources);

      // Load recent activities
      const activitiesRef = collection(db, 'teamActivities');
      const activitiesQuery = query(
        activitiesRef,
        where('teamId', '==', teamId),
        orderBy('timestamp', 'desc')
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const loadedActivities: TeamActivity[] = [];
      
      activitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        loadedActivities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()
        } as TeamActivity);
      });
      
      setActivities(loadedActivities);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  const subscribeToTeamUpdates = (teamId: string) => {
    // Subscribe to real-time messages
    const messagesRef = collection(db, 'teamMessages');
    const messagesQuery = query(
      messagesRef,
      where('teamId', '==', teamId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages: TeamMessage[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()
        } as TeamMessage);
      });
      
      setMessages(loadedMessages.reverse());
    });

    return unsubscribe;
  };

  const createTeam = async (name: string, description: string) => {
    if (!user) return;

    try {
      const teamId = Date.now().toString();
      const team: Team = {
        id: teamId,
        name,
        description,
        ownerId: user.id,
        members: [user.id],
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          isPublic: false,
          allowMemberInvites: true,
          allowFileSharing: true,
          allowChat: true,
          allowVideoCall: false,
          maxMembers: 50
        },
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      await setDoc(doc(db, 'teams', teamId), {
        ...team,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add activity
      await logActivity(teamId, 'created the team');

      setShowCreateTeam(false);
      loadTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const inviteMember = async (email: string) => {
    if (!selectedTeam || !user) return;

    try {
      // In a real app, you'd send an email invitation
      // For now, we'll just add to pending invites
      await updateDoc(doc(db, 'teams', selectedTeam.id), {
        pendingInvites: arrayUnion(email),
        updatedAt: serverTimestamp()
      });

      await logActivity(selectedTeam.id, `invited ${email} to the team`);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!selectedTeam || !user) return;

    try {
      await updateDoc(doc(db, 'teams', selectedTeam.id), {
        members: arrayRemove(memberId),
        updatedAt: serverTimestamp()
      });

      await logActivity(selectedTeam.id, `removed a member from the team`);
      loadTeamData(selectedTeam.id);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const shareResource = async (resource: any, permissions: 'view' | 'edit' | 'admin') => {
    if (!selectedTeam || !user) return;

    try {
      const sharedResource: SharedResource = {
        id: Date.now().toString(),
        teamId: selectedTeam.id,
        type: resource.type,
        title: resource.title,
        content: resource.content,
        sharedBy: user.id,
        sharedAt: new Date(),
        permissions,
        tags: resource.tags
      };

      await setDoc(doc(db, 'sharedResources', sharedResource.id), {
        ...sharedResource,
        sharedAt: serverTimestamp()
      });

      await logActivity(selectedTeam.id, `shared a ${resource.type}: ${resource.title}`);
      loadTeamData(selectedTeam.id);
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTeam || !user || !messageInput.trim()) return;

    try {
      const message: TeamMessage = {
        id: Date.now().toString(),
        teamId: selectedTeam.id,
        userId: user.id,
        userName: user.name || user.email,
        message: messageInput,
        timestamp: new Date()
      };

      await setDoc(doc(db, 'teamMessages', message.id), {
        ...message,
        timestamp: serverTimestamp()
      });

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const logActivity = async (teamId: string, action: string) => {
    if (!user) return;

    try {
      const activity: TeamActivity = {
        id: Date.now().toString(),
        teamId,
        userId: user.id,
        userName: user.name || user.email,
        action,
        timestamp: new Date()
      };

      await setDoc(doc(db, 'teamActivities', activity.id), {
        ...activity,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const updateTeamSettings = async (settings: Partial<TeamSettings>) => {
    if (!selectedTeam || !user) return;

    try {
      await updateDoc(doc(db, 'teams', selectedTeam.id), {
        settings: { ...selectedTeam.settings, ...settings },
        updatedAt: serverTimestamp()
      });

      await logActivity(selectedTeam.id, 'updated team settings');
      loadTeams();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Teams Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowCreateTeam(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create Team
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedTeam?.id === team.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {team.members.length} members
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
          {/* Team Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h1>
                <p className="text-gray-600">{selectedTeam.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-4 border-b border-gray-200">
              {(['overview', 'files', 'chat', 'members', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold">{teamMembers.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Team Members</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold">{sharedResources.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Shared Resources</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold">{messages.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Messages</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      <span className="text-2xl font-bold">{activities.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Activities</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      Recent Activity
                    </h2>
                  </div>
                  <div className="p-4 space-y-3">
                    {activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.userName}</span>{' '}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-600" />
                      Shared Resources
                    </h2>
                  </div>
                  <div className="p-4">
                    {sharedResources.length > 0 ? (
                      <div className="space-y-3">
                        {sharedResources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">{resource.title}</p>
                                <p className="text-sm text-gray-600">
                                  Shared by {resource.sharedBy} • {resource.sharedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {resource.permissions === 'view' && <Eye className="w-4 h-4 text-gray-500" />}
                              {resource.permissions === 'edit' && <Edit3 className="w-4 h-4 text-blue-500" />}
                              {resource.permissions === 'admin' && <Shield className="w-4 h-4 text-green-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No shared resources yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.userId === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {msg.userId !== user?.id && (
                          <p className="text-xs font-medium mb-1 opacity-75">{msg.userName}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Team Members
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name?.[0] || member.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.name || member.email}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                member.status === 'online'
                                  ? 'bg-green-500'
                                  : member.status === 'away'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            {member.id !== user?.id && member.role !== 'owner' && (
                              <button
                                onClick={() => removeMember(member.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      Team Settings
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Public Team</p>
                        <p className="text-sm text-gray-600">Allow anyone to join with invite code</p>
                      </div>
                      <button
                        onClick={() => updateTeamSettings({ isPublic: !selectedTeam.settings.isPublic })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          selectedTeam.settings.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedTeam.settings.isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Member Invites</p>
                        <p className="text-sm text-gray-600">Allow members to invite others</p>
                      </div>
                      <button
                        onClick={() => updateTeamSettings({ allowMemberInvites: !selectedTeam.settings.allowMemberInvites })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          selectedTeam.settings.allowMemberInvites ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedTeam.settings.allowMemberInvites ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {selectedTeam.inviteCode && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Invite Code</p>
                        <p className="font-mono text-lg font-bold text-blue-600">{selectedTeam.inviteCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Team Selected</h2>
            <p className="text-gray-600 mb-4">Create or join a team to start collaborating</p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <UserPlus className="w-5 h-5" />
              Create Your First Team
            </button>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Team</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTeam(
                  formData.get('name') as string,
                  formData.get('description') as string
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
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                inviteMember(formData.get('email') as string);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="member@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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