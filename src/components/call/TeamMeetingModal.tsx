// Team Meeting Modal - Create or join team meetings

import React, { useState } from 'react';
import { Video, Calendar, Clock, Users, X, Plus } from 'lucide-react';
import { teamMeetingService, TeamMeeting } from '../../services/teamMeetingService';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface TeamMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onJoinMeeting: (meetingId: string) => void;
}

export const TeamMeetingModal: React.FC<TeamMeetingModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onJoinMeeting,
}) => {
  const [mode, setMode] = useState<'create' | 'list'>('list');
  const [meetings, setMeetings] = useState<TeamMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isInstant, setIsInstant] = useState(true);
  const user = realTimeAuth.getCurrentUser();

  React.useEffect(() => {
    if (isOpen && mode === 'list') {
      loadMeetings();
    }
  }, [isOpen, mode, teamId]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const teamMeetings = await teamMeetingService.getTeamMeetings(teamId);
      setMeetings(teamMeetings.filter((m) => m.status !== 'ended' && m.status !== 'cancelled'));
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!title.trim()) {
      alert('Please enter a meeting title');
      return;
    }

    try {
      setLoading(true);
      const meeting = await teamMeetingService.createMeeting(teamId, title, {
        description,
        scheduledTime: isInstant ? undefined : new Date(scheduledTime),
        isInstant,
      });

      if (isInstant) {
        // Join instant meeting immediately
        onJoinMeeting(meeting.meetingId);
        onClose();
      } else {
        // Show success and refresh list
        setMode('list');
        loadMeetings();
        setTitle('');
        setDescription('');
        setScheduledTime('');
      }
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      alert(error.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meeting: TeamMeeting) => {
    if (user) {
      try {
        await teamMeetingService.joinMeeting(meeting.meetingId, user.id, user.name || user.email || 'Unknown', user.email);
        onJoinMeeting(meeting.meetingId);
        onClose();
      } catch (error: any) {
        console.error('Error joining meeting:', error);
        alert(error.message || 'Failed to join meeting');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Meetings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'list' ? (
            <>
              {/* Create Meeting Button */}
              <button
                onClick={() => setMode('create')}
                className="w-full mb-6 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Meeting</span>
              </button>

              {/* Meetings List */}
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No active meetings. Create one to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.meetingId}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {meeting.title}
                          </h3>
                          {meeting.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {meeting.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{meeting.participants.length} participants</span>
                            </div>
                            {!meeting.isInstant && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(meeting.scheduledTime).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Create Meeting Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter meeting description (optional)"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstant}
                      onChange={(e) => setIsInstant(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start meeting instantly
                    </span>
                  </label>
                </div>

                {!isInstant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setMode('list');
                      setTitle('');
                      setDescription('');
                      setScheduledTime('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMeeting}
                    disabled={loading || !title.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : isInstant ? 'Create & Join' : 'Schedule Meeting'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

