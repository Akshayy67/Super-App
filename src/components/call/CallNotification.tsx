// Call Notification - Shows incoming call notification

import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, X } from 'lucide-react';
import { CallInvitation } from '../../services/callSignalingService';
import { callService } from '../../services/callService';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface CallNotificationProps {
  call: CallInvitation;
  onAccept: () => void;
  onReject: () => void;
  onDismiss: () => void;
}

export const CallNotification: React.FC<CallNotificationProps> = ({
  call,
  onAccept,
  onReject,
  onDismiss,
}) => {
  const [ringing, setRinging] = useState(true);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      if (ringing) {
        handleReject();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [ringing]);

  const handleAccept = async () => {
    setRinging(false);
    try {
      await callService.acceptCall(call.callId, call.callerId, call.type);
      onAccept();
    } catch (error) {
      console.error('Error accepting call:', error);
      onReject();
    }
  };

  const handleReject = async () => {
    setRinging(false);
    try {
      await callService.rejectCall(call.callId);
      onReject();
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
    onDismiss();
  };

  if (!ringing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-pulse">
        <div className="text-center mb-6">
          {call.callerPhotoURL ? (
            <img
              src={call.callerPhotoURL}
              alt={call.callerName || 'Caller'}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {(call.callerName || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {call.callerName || 'Unknown Caller'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {call.type === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all transform hover:scale-110"
            title="Decline"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className={`p-4 rounded-full text-white transition-all transform hover:scale-110 ${
              call.type === 'video'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            title={call.type === 'video' ? 'Accept Video Call' : 'Accept Audio Call'}
          >
            {call.type === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

