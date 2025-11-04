// Call Button Component
// Displays a call button on user profiles to initiate calls

import React, { useState } from 'react';
import { Phone, Video, Loader2 } from 'lucide-react';
import { startCall } from './CallManager';
import { realTimeAuth } from '../../utils/realTimeAuth';
import { ProfileService } from '../../services/profileService';
import { UserProfile } from '../../types';

interface CallButtonProps {
  recipientId: string;
  variant?: 'default' | 'icon' | 'compact';
  callType?: 'video' | 'audio';
}

export const CallButton: React.FC<CallButtonProps> = ({
  recipientId,
  variant = 'default',
  callType = 'video',
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const user = realTimeAuth.getCurrentUser();

  const handleCall = async () => {
    if (!user || isCalling) return;

    setIsCalling(true);
    try {
      // Get current user profile for caller info
      const callerProfile = await ProfileService.getProfileByUserId(user.id);
      
      // Start the call
      await startCall(
        recipientId,
        callType,
        callerProfile?.username || user.username || 'User',
        callerProfile?.photoURL
      );

      // The CallManager will handle showing the call interface
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call. Please try again.');
    } finally {
      setIsCalling(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCall}
        disabled={isCalling}
        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Start ${callType} call`}
      >
        {isCalling ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : callType === 'video' ? (
          <Video className="w-5 h-5" />
        ) : (
          <Phone className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleCall}
        disabled={isCalling}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Start ${callType} call`}
      >
        {isCalling ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calling...</span>
          </>
        ) : callType === 'video' ? (
          <>
            <Video className="w-4 h-4" />
            <span>Video Call</span>
          </>
        ) : (
          <>
            <Phone className="w-4 h-4" />
            <span>Audio Call</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCall}
      disabled={isCalling}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Start ${callType} call`}
    >
      {isCalling ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Starting call...</span>
        </>
      ) : callType === 'video' ? (
        <>
          <Video className="w-5 h-5" />
          <span>Video Call</span>
        </>
      ) : (
        <>
          <Phone className="w-5 h-5" />
          <span>Audio Call</span>
        </>
      )}
    </button>
  );
};

