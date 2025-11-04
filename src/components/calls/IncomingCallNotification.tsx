// Incoming Call Notification Component
// Shows a beautiful notification when receiving an incoming call

import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { CallInvitation } from '../../services/callSignalingService';
import { UserProfile } from '../../types';

interface IncomingCallNotificationProps {
  call: CallInvitation;
  callerProfile: UserProfile | null;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  call,
  callerProfile,
  onAccept,
  onReject,
}) => {
  const [ringing, setRinging] = useState(true);

  // Play ringtone (visual only, no audio for browser compatibility)
  useEffect(() => {
    const interval = setInterval(() => {
      setRinging((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const displayName = callerProfile?.username || call.callerName || 'Unknown User';
  const photoURL = callerProfile?.photoURL || call.callerPhotoURL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-300">
        {/* Caller Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className={`w-24 h-24 rounded-full object-cover border-4 ${
                  ringing
                    ? 'border-blue-500 animate-pulse'
                    : 'border-gray-300 dark:border-gray-600'
                } transition-all duration-500`}
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 border-4 ${
                  ringing
                    ? 'border-blue-500 animate-pulse'
                    : 'border-gray-300 dark:border-gray-600'
                } transition-all duration-500`}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {ringing && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {displayName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            {call.type === 'video' ? (
              <>
                <Video className="w-4 h-4" />
                Incoming Video Call
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Incoming Audio Call
              </>
            )}
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex items-center justify-center gap-4">
          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            aria-label="Accept call"
          >
            <Phone className="w-8 h-8" />
          </button>

          {/* Reject Button */}
          <button
            onClick={onReject}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            aria-label="Reject call"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>

        {/* Call Type Indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {ringing ? 'Ringing...' : 'Incoming call'}
          </p>
        </div>
      </div>
    </div>
  );
};

