import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, MessageSquare, FileText, Activity } from 'lucide-react';
import { realTimeAuth } from '../utils/realTimeAuth';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: Date;
}

export const TeamSpace: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'chat'>('overview');

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    // Load teams - simplified version
    if (user) {
      // Mock data for now - in 4c3042b this would have been a simple implementation
      const mockTeams: Team[] = [
        {
          id: 'team1',
          name: 'Study Group Alpha',
          description: 'Main study group for computer science',
          members: [
            {
              id: user.id,
              name: user.username || 'You',
              email: user.email,
              role: 'owner',
              joinedAt: new Date()
            }
          ],
          createdAt: new Date()
        }
      ];
      setTeams(mockTeams);
      if (!selectedTeam && mockTeams.length > 0) {
        setSelectedTeam(mockTeams[0]);
      }
    }
  }, [user, selectedTeam]);

  const createTeam = (name: string, description: string) => {
    if (!user) return;

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name,
      description,
      members: [{
        id: user.id,
        name: user.username || 'You',
        email: user.email,
        role: 'owner',
        joinedAt: new Date()
      }],
      createdAt: new Date()
    };

    setTeams(prev => [...prev, newTeam]);
    setSelectedTeam(newTeam);
    setShowCreateTeam(false);
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
          <button
            onClick={() => setShowCreateTeam(true)}
            className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Team
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                selectedTeam?.id === team.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.members.length} members</p>
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
                <h1 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h1>
                <p className="text-gray-600">{selectedTeam.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mt-6 border-b border-gray-200">
              {(['overview', 'members', 'chat'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 capitalize transition-colors ${
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
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Team Members</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedTeam.members.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Shared Files</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
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
                    <p className="text-center text-gray-500">No recent activity</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Team Chat</h2>
                </div>
                <div className="flex-1 p-6 flex items-center justify-center">
                  <p className="text-gray-500">Chat feature coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Team Selected</h2>
            <p className="text-gray-600 mb-4">Create or select a team to get started</p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Team
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
    </div>
  );
};
