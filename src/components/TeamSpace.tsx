import React, { useState, useEffect, useCallback } from 'react';
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
  Send,
  Mail,
  Copy,
  ExternalLink,
  Info,
  TestTube
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
import { emailService, TeamInvite } from '../utils/emailService';
import { googleDriveService } from '../utils/googleDriveService';
import { JoinTeamModal } from './JoinTeamModal';
import { EmailTestPanel } from './EmailTestPanel';

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
  const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [showEmailTest, setShowEmailTest] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const user = realTimeAuth.getCurrentUser();

  const loadTeams = useCallback(async () => {
    if (!user) {
      console.log('loadTeams: No user found');
      return;
    }

    console.log('loadTeams: Starting to load teams for user:', user.id);
    setLoading(true);
    
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(
        teamsRef,
        where('members', 'array-contains', user.id),
        orderBy('updatedAt', 'desc')
      );

      console.log('loadTeams: Executing query:', q);
      const snapshot = await getDocs(q);
      console.log('loadTeams: Query result:', snapshot.size, 'teams found');

      const loadedTeams: Team[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('loadTeams: Team data:', doc.id, data);
        
        // Convert Firestore timestamps to Date objects
        const team: Team = {
          id: doc.id,
          name: data.name,
          description: data.description,
          ownerId: data.ownerId,
          members: data.members || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          settings: data.settings || {
            isPublic: false,
            allowMemberInvites: true,
            allowFileSharing: true,
            allowChat: true,
            allowVideoCall: false,
            maxMembers: 50
          },
          inviteCode: data.inviteCode
        };
        
        loadedTeams.push(team);
      });

      console.log('loadTeams: Processed teams:', loadedTeams);
      setTeams(loadedTeams);
      
      if (loadedTeams.length > 0 && !selectedTeam) {
        console.log('loadTeams: Setting first team as selected:', loadedTeams[0]);
        setSelectedTeam(loadedTeams[0]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedTeam]);

  const loadTeamData = useCallback(async (teamId: string) => {
    if (!selectedTeam) return;
    
    try {
      console.log('loadTeamData: Loading data for team:', teamId);
      
      // Load team members
      const membersPromises = selectedTeam.members.map(async (memberId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', memberId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: memberId,
              email: userData.email || '',
              name: userData.username || userData.email || 'Unknown User',
              avatar: userData.avatar,
              role: memberId === selectedTeam.ownerId ? 'owner' : 'member',
              joinedAt: userData.joinedAt?.toDate() || new Date(),
              lastActive: userData.lastLoginAt ? new Date(userData.lastLoginAt) : new Date(),
              status: 'online' as const
            } as TeamMember;
          } else {
            // Fallback for users not in the users collection
            return {
              id: memberId,
              email: memberId,
              name: 'Unknown User',
              role: memberId === selectedTeam.ownerId ? 'owner' : 'member',
              joinedAt: new Date(),
              lastActive: new Date(),
              status: 'offline' as const
            } as TeamMember;
          }
        } catch (error) {
          console.error('Error loading user data for member:', memberId, error);
          return null;
        }
      });

      const members = (await Promise.all(membersPromises)).filter(Boolean) as TeamMember[];
      console.log('loadTeamData: Loaded members:', members);
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
          sharedAt: data.sharedAt?.toDate() || new Date()
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
          timestamp: data.timestamp?.toDate() || new Date()
        } as TeamActivity);
      });
      
      setActivities(loadedActivities);

      // Load pending invites
      const invites = await emailService.getTeamInvites(teamId);
      setPendingInvites(invites);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }, [selectedTeam]);

  useEffect(() => {
    console.log('TeamSpace: User changed:', user);
    if (user) {
      console.log('TeamSpace: Loading teams for user:', user.id);
      loadTeams();
    } else {
      console.log('TeamSpace: No user, clearing teams');
      setTeams([]);
      setSelectedTeam(null);
      setLoading(false);
    }
  }, [user, loadTeams]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData(selectedTeam.id);
      subscribeToTeamUpdates(selectedTeam.id);
    }
  }, [selectedTeam, loadTeamData]);

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
    if (!user) {
      console.error('No user found when trying to create team');
      alert('You must be logged in to create a team');
      return;
    }

    if (!user.id) {
      console.error('User object missing ID:', user);
      alert('User authentication error. Please try logging in again.');
      return;
    }

    try {
      console.log('Creating team with user:', user);
      
      // Test Firebase connection first
      try {
        const testDoc = doc(db, 'test', 'test');
        await setDoc(testDoc, { test: true, timestamp: serverTimestamp() });
        await deleteDoc(testDoc);
        console.log('Firebase connection test successful');
      } catch (testError) {
        console.error('Firebase connection test failed:', testError);
        alert('Firebase connection failed. Please check your internet connection and try again.');
        return;
      }
      
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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

      console.log('Team object to create:', team);

      // Create the team document in Firebase
      await setDoc(doc(db, 'teams', teamId), {
        ...team,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Team created successfully in Firestore');

      // Save team to Google Drive as backup
      let driveFolder = null;
      try {
        driveFolder = await googleDriveService.createTeamFolder(team);
        if (driveFolder) {
          console.log('✅ Team saved to Google Drive:', driveFolder);
        } else {
          console.warn('⚠️ Failed to save team to Google Drive, but Firebase save succeeded');
        }
      } catch (driveError) {
        console.warn('⚠️ Google Drive save failed, but Firebase save succeeded:', driveError);
      }

      // Add activity
      await logActivity(teamId, 'created the team');

      // Immediately add the team to local state
      const newTeam: Team = {
        ...team,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTeams(prevTeams => [newTeam, ...prevTeams]);
      setSelectedTeam(newTeam);

      // Close modal
      setShowCreateTeam(false);
      
      // Also refresh from server to ensure consistency
      await loadTeams();
      
      // Show success message
      alert(`Team "${name}" created successfully!\n\n✅ Saved to Firebase\n${driveFolder ? '✅ Saved to Google Drive' : '⚠️ Google Drive save failed'}`);
      
    } catch (error) {
      console.error('Error creating team:', error);
      
      // Provide user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          alert('Permission denied. Please check your Firebase rules.');
        } else if (error.message.includes('unavailable')) {
          alert('Firebase is currently unavailable. Please try again later.');
        } else if (error.message.includes('not-found')) {
          alert('Firebase collection not found. Please check your configuration.');
        } else {
          alert(`Failed to create team: ${error.message}`);
        }
      } else {
        alert('An unexpected error occurred while creating the team.');
      }
    }
  };

  const inviteMember = async (email: string) => {
    if (!selectedTeam || !user) return;

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      // Generate a unique invite code
      const inviteCode = emailService.generateInviteCode();

      // Send the team invitation
      const result = await emailService.sendTeamInvite({
        teamName: selectedTeam.name,
        inviterName: user.username || user.email,
        inviteeEmail: email,
        inviteCode,
        teamId: selectedTeam.id
      });

      if (result.success) {
        // Update the invite with the inviter ID
        await setDoc(doc(db, 'teamInvites', `invite_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`), {
          inviterId: user.id,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Log the activity
        await logActivity(selectedTeam.id, `invited ${email} to the team`);

        // Show success message
        setInviteSuccess(`Invitation sent successfully to ${email}!`);
        setInviteEmail('');

        // Refresh pending invites
        const invites = await emailService.getTeamInvites(selectedTeam.id);
        setPendingInvites(invites);

        // Close modal after a delay
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(null);
        }, 2000);
      } else {
        setInviteError(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setInviteError('An unexpected error occurred while sending the invitation');
    } finally {
      setInviteLoading(false);
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

  const cancelInvite = async (inviteId: string) => {
    if (!selectedTeam || !user) return;

    try {
      const result = await emailService.cancelInvite(inviteId);
      if (result.success) {
        await logActivity(selectedTeam.id, 'cancelled a team invitation');
        
        // Refresh pending invites
        const invites = await emailService.getTeamInvites(selectedTeam.id);
        setPendingInvites(invites);
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
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
        userName: user.username || user.email,
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
        userName: user.username || user.email,
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

  const copyInviteLink = async (inviteCode: string) => {
    try {
      const inviteLink = `${window.location.origin}/join-team?code=${inviteCode}`;
      await navigator.clipboard.writeText(inviteLink);
      
      // Show temporary success feedback
      const originalText = 'Copy Link';
      const button = document.querySelector(`[data-invite-code="${inviteCode}"]`) as HTMLButtonElement;
      if (button) {
        button.textContent = 'Copied!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (error) {
      console.error('Error copying invite link:', error);
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
    <div className={`h-full flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Teams Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Management</h3>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create Team
          </button>
          <button
            onClick={() => setShowJoinTeamModal(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Join Team
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                selectedTeam?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="w-full px-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xs break-words leading-tight line-clamp-2">{team.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTeam.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">{selectedTeam.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-gray-700">
              {(['overview', 'files', 'chat', 'members', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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

                                     <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                     <div className="flex items-center justify-between mb-2">
                       <Mail className="w-5 h-5 text-orange-500" />
                       <span className="text-2xl font-bold">{pendingInvites.length}</span>
                     </div>
                     <p className="text-sm text-gray-600">Pending Invites</p>
                   </div>

                   {/* Google Drive Folder Status */}
                   {googleDriveService.isReady() && selectedTeam && (() => {
                     const teamFolder = googleDriveService.getTeamFolder(selectedTeam.id);
                     return (
                       <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                         <div className="flex items-center justify-between mb-2">
                           <Folder className="w-5 h-5 text-green-500" />
                           <span className="text-2xl font-bold">
                             {teamFolder ? '📁' : '⏳'}
                           </span>
                         </div>
                         <p className="text-sm text-gray-600">
                           {teamFolder ? 'Drive Folder' : 'Creating...'}
                         </p>
                         {teamFolder && (
                           <a
                             href={teamFolder.webViewLink}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                           >
                             View in Google Drive
                           </a>
                         )}
                       </div>
                     );
                   })()}
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
              <div className="p-6 space-y-6">
                {/* Team Members */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Team Members ({teamMembers.length})
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex flex-col items-center p-3 bg-gray-50 rounded-lg w-full max-w-[200px]"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-sm font-medium text-blue-600">
                              {member.name?.[0] || member.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="text-center w-full">
                            <p className="font-medium text-gray-900 text-sm break-words leading-tight">{member.name || member.email}</p>
                            <p className="text-xs text-gray-600 mt-1">{member.role}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
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

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-orange-500" />
                        Pending Invitations ({pendingInvites.length})
                      </h2>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {pendingInvites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{invite.inviteeEmail}</p>
                                <p className="text-xs text-gray-600">
                                  Invited by {invite.inviterName} • {invite.createdAt.toLocaleDateString()}
                                </p>
                                <p className="text-xs text-orange-600 font-mono">
                                  Code: {invite.inviteCode}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyInviteLink(invite.inviteCode)}
                                data-invite-code={invite.inviteCode}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copy Link
                              </button>
                              <button
                                onClick={() => cancelInvite(invite.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Cancel Invite"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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

                                                              {/* Email Service Test */}
                     <div className="p-4 bg-blue-50 rounded-lg">
                       <p className="text-sm text-gray-600 mb-2">Email Service</p>
                       <button
                         onClick={() => setShowEmailTest(true)}
                         className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                       >
                         <TestTube className="w-4 h-4" />
                         Test Email Service
                       </button>
                       <p className="text-xs text-gray-500 mt-2">
                         Test your EmailJS email service configuration
                       </p>
                     </div>

                                           {/* Google Drive Status */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Google Drive Backup</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${googleDriveService.isReady() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="text-sm font-medium">
                            {googleDriveService.isReady() ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Team data is automatically backed up to Google Drive and shared with all team members
                        </p>
                        
                        {/* Show current team's Drive folder if available */}
                        {googleDriveService.isReady() && selectedTeam && (
                          <div className="mt-3 p-3 bg-white rounded border border-green-200">
                            <p className="text-xs font-medium text-green-800 mb-2">📁 Team Drive Folder</p>
                            {(() => {
                              const teamFolder = googleDriveService.getTeamFolder(selectedTeam.id);
                              if (teamFolder) {
                                return (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-green-700">{teamFolder.name}</span>
                                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                        Shared with Team
                                      </span>
                                    </div>
                                    <a
                                      href={teamFolder.webViewLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Open in Google Drive
                                    </a>
                                    <p className="text-xs text-gray-600">
                                      All team members can view team details and files
                                    </p>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="text-xs text-gray-600">
                                    Team folder will be created when you save changes
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          {!googleDriveService.isReady() ? (
                            <button
                              onClick={() => googleDriveService.initialize()}
                              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              Connect Google Drive
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    // Sync all existing teams to Google Drive
                                    for (const team of teams) {
                                      await googleDriveService.createTeamFolder(team);
                                    }
                                    alert('✅ All teams synced to Google Drive!');
                                  } catch (error) {
                                    alert('❌ Failed to sync teams: ' + error);
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                              >
                                Sync All Teams
                              </button>
                              {selectedTeam && (
                                <button
                                  onClick={async () => {
                                    try {
                                      // Share current team folder with members
                                      const memberEmails = teamMembers.map(m => m.email).filter(Boolean);
                                      if (memberEmails.length > 0) {
                                        await googleDriveService.shareTeamFolderWithMembers(selectedTeam.id, memberEmails);
                                        alert('✅ Team folder shared with all members!');
                                      } else {
                                        alert('ℹ️ No team members with emails to share with');
                                      }
                                    } catch (error) {
                                      alert('❌ Failed to share team folder: ' + error);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                                >
                                  Share with Team
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Invite Team Member
            </h2>
            
            {/* Success/Error Messages */}
            {inviteSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{inviteSuccess}</span>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  📧 Email sent successfully! Check the recipient's inbox.
                </div>
              </div>
            )}
            
            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{inviteError}</span>
                </div>
                <div className="mt-2 text-xs text-red-700">
                  💡 Make sure you've configured SendGrid in your .env file
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMember(inviteEmail);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="member@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={inviteLoading}
                />
              </div>
              
                             <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                 <div className="flex items-center gap-2 text-blue-800 text-sm">
                   <Info className="w-4 h-4" />
                   <span>
                     An invitation email will be sent to the specified address with a link to join the team.
                     <br />
                     <span className="text-xs text-blue-700 mt-1 block">
                       💡 Using EmailJS for real email delivery. Check your inbox!
                     </span>
                   </span>
                 </div>
               </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteError(null);
                    setInviteSuccess(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  disabled={inviteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {inviteLoading ? (
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
            </form>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      <JoinTeamModal
        isOpen={showJoinTeamModal}
        onClose={() => setShowJoinTeamModal(false)}
      />

      {/* Email Test Panel */}
      {showEmailTest && (
        <EmailTestPanel />
      )}
    </div>
  );
};
