import React from 'react';
import { X, Mic, MicOff, VideoOff, Crown, Hand, MoreVertical, UserMinus } from 'lucide-react';
import { VideoMeeting } from '../../types/videoMeeting';

interface ParticipantsListProps {
  meeting: VideoMeeting;
  currentUserId: string;
  onClose: () => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  meeting,
  currentUserId,
  onClose
}) => {
  const participants = Object.values(meeting.participants);
  const isHost = meeting.hostId === currentUserId;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-white">Participants</h3>
          <p className="text-sm text-gray-400">{participants.length} in meeting</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {participant.avatar ? (
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(participant.name)}
                  </div>
                )}
                {participant.isHandRaised && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 animate-bounce">
                    <Hand className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">
                    {participant.name}
                  </span>
                  {participant.id === currentUserId && (
                    <span className="text-xs text-gray-400">(You)</span>
                  )}
                  {participant.isHost && (
                    <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{participant.email}</p>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {participant.isMuted ? (
                  <div className="p-1.5 bg-red-500/20 rounded">
                    <MicOff className="w-4 h-4 text-red-400" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-green-500/20 rounded">
                    <Mic className="w-4 h-4 text-green-400" />
                  </div>
                )}
                {participant.isCameraOff && (
                  <div className="p-1.5 bg-red-500/20 rounded">
                    <VideoOff className="w-4 h-4 text-red-400" />
                  </div>
                )}
                {isHost && participant.id !== currentUserId && (
                  <button className="p-1.5 hover:bg-gray-600 rounded transition-colors text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{participants.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {participants.filter(p => !p.isMuted).length}
            </p>
            <p className="text-xs text-gray-400">Unmuted</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              {participants.filter(p => p.isHandRaised).length}
            </p>
            <p className="text-xs text-gray-400">Raised</p>
          </div>
        </div>
      </div>
    </div>
  );
};





