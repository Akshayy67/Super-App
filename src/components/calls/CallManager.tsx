// Call Manager - Global call management component
// Handles incoming calls, active calls, and call state

import React, { useEffect, useState } from 'react';
import { callService, CallState } from '../../services/callService';
import { callSignalingService, CallInvitation } from '../../services/callSignalingService';
import { realTimeAuth } from '../../utils/realTimeAuth';
import { IncomingCallNotification } from './IncomingCallNotification';
import { ActiveCallInterface } from './ActiveCallInterface';
import { ProfileService } from '../../services/profileService';
import { UserProfile } from '../../types';

export const CallManager: React.FC = () => {
  const [incomingCall, setIncomingCall] = useState<CallInvitation | null>(null);
  const [callState, setCallState] = useState<CallState>(callService.getCallState());
  const [callerProfile, setCallerProfile] = useState<UserProfile | null>(null);
  const [remoteProfile, setRemoteProfile] = useState<UserProfile | null>(null);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (!user) return;

    // Set current user ID in webRTCService
    (webRTCService as any).setCurrentUserId(user.id);

    // Subscribe to incoming calls
    const unsubscribeIncoming = callSignalingService.subscribeToIncomingCalls(
      user.id,
      async (call: CallInvitation) => {
        setIncomingCall(call);
        
        // Fetch caller profile
        try {
          const profile = await ProfileService.getProfileByUserId(call.callerId);
          setCallerProfile(profile);
        } catch (error) {
          console.error('Error fetching caller profile:', error);
        }
      }
    );

    // Subscribe to call state changes
    const unsubscribeCallState = callService.onCallStateChange((state) => {
      setCallState(state);

      // Fetch remote user profile when call is active
      if (state.remoteUserId && !remoteProfile) {
        ProfileService.getProfileByUserId(state.remoteUserId)
          .then((profile) => {
            setRemoteProfile(profile);
          })
          .catch((error) => {
            console.error('Error fetching remote profile:', error);
          });
      }

      // Clear profiles when call ends
      if (!state.callId) {
        setRemoteProfile(null);
        setCallerProfile(null);
      }
    });

    return () => {
      unsubscribeIncoming();
      unsubscribeCallState();
    };
  }, [user]);

  const handleAcceptCall = async () => {
    if (!incomingCall || !user) return;

    try {
      await callService.acceptCall(
        incomingCall.callId,
        incomingCall.callerId,
        incomingCall.type
      );
      
      // The callService will handle connection setup automatically
      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;

    try {
      await callService.rejectCall(incomingCall.callId);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      await callService.endCall();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  // Show incoming call notification
  if (incomingCall && !callState.callId) {
    return (
      <IncomingCallNotification
        call={incomingCall}
        callerProfile={callerProfile}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    );
  }

  // Show active call interface
  if (callState.callId && callState.remoteUserId) {
    return (
      <ActiveCallInterface
        callState={callState}
        remoteProfile={remoteProfile}
        onEndCall={handleEndCall}
      />
    );
  }

  return null;
};

// Export helper function to start a call
export const startCall = async (
  recipientId: string,
  type: 'video' | 'audio',
  callerName?: string,
  callerPhotoURL?: string
): Promise<string> => {
  return await callService.startCall(recipientId, type, callerName, callerPhotoURL);
};

// Import webRTCService for setting user ID
import { webRTCService } from '../../services/webRTCService';

