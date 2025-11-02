import React, { useState } from 'react';
import { X, Sparkles, Briefcase, Palette, User } from 'lucide-react';
import type { VideoMeetingParticipant } from '../../types/videoMeeting';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarType: 'Innovation' | 'Professional' | 'Creative' | 'Default') => void;
  currentType?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentType
}) => {
  if (!isOpen) return null;

  const avatars = [
    {
      type: 'Innovation' as const,
      icon: Sparkles,
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      description: 'Innovation & Ideas'
    },
    {
      type: 'Professional' as const,
      icon: Briefcase,
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      description: 'Professional'
    },
    {
      type: 'Creative' as const,
      icon: Palette,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      description: 'Creative'
    },
    {
      type: 'Default' as const,
      icon: User,
      gradient: 'from-blue-600 to-purple-600',
      description: 'Default'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Choose Your Avatar Style
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {avatars.map((avatar) => {
            const Icon = avatar.icon;
            const isSelected = currentType === avatar.type;
            
            return (
              <button
                key={avatar.type}
                onClick={() => {
                  onSelect(avatar.type);
                  onClose();
                }}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {avatar.type}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {avatar.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


