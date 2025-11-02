import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Smile } from 'lucide-react';
import { VideoMeeting, ChatMessage } from '../../types/videoMeeting';
import { videoMeetingService } from '../../services/videoMeetingService';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface MeetingChatProps {
  meeting: VideoMeeting;
  onClose: () => void;
}

const reactions = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

export const MeetingChat: React.FC<MeetingChatProps> = ({ meeting, onClose }) => {
  const [message, setMessage] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    scrollToBottom();
  }, [meeting.chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const chatMessage: Omit<ChatMessage, 'timestamp'> & { timestamp: any } = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      senderName: user.username || user.email,
      message: message.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    await videoMeetingService.sendChatMessage(meeting.id, chatMessage);
    setMessage('');
  };

  const handleReaction = async (reaction: string) => {
    if (!user) return;

    const chatMessage: Omit<ChatMessage, 'timestamp'> & { timestamp: any } = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      senderName: user.username || user.email,
      message: reaction,
      timestamp: new Date(),
      type: 'text'
    };

    await videoMeetingService.sendChatMessage(meeting.id, chatMessage);
    setShowReactions(false);
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {meeting.chatMessages.map((msg) => {
          const isOwnMessage = msg.senderId === user?.id;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <p className="text-xs text-gray-400 italic">{msg.message}</p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isOwnMessage && (
                  <span className="text-xs text-gray-400 mb-1">{msg.senderName}</span>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-white rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        {showReactions && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowReactions(!showReactions)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

