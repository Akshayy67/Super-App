// Call Manager - Manages incoming calls and call state

import React, { useState, useEffect } from 'react';
import { callService, CallState } from '../../services/callService';
import { callSignalingService, CallInvitation } from '../../services/callSignalingService';
import { webRTCService } from '../../services/webRTCService';
import { EnhancedCallModal } from './EnhancedCallModal';
import { CallNotification } from './CallNotification';
import { realTimeAuth } from '../../utils/realTimeAuth';

export const CallManager: React.FC = () => {
  const [incomingCall, setIncomingCall] = useState<CallInvitation | null>(null);
  const [callState, setCallState] = useState<CallState | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [remoteUser, setRemoteUser] = useState<{ name?: string; photoURL?: string } | null>(null);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (!user) return;

    // Set current user ID in webRTC service and call service
    if ((webRTCService as any).setCurrentUserId) {
      (webRTCService as any).setCurrentUserId(user.id);
    }
    if ((callService as any).setCurrentUserId) {
      (callService as any).setCurrentUserId(user.id);
    }

    // Listen for incoming calls
    const unsubscribe = callSignalingService.subscribeToIncomingCalls(user.id, (call) => {
      setIncomingCall(call);
      setRemoteUser({
        name: call.callerName,
        photoURL: call.callerPhotoURL,
      });
    });

    // Subscribe to call state changes
    const unsubscribeCallState = callService.onCallStateChange((state) => {
      setCallState(state);
      const wasActive = isCallActive;
      const isNowActive = state.callId !== null && state.isConnected;
      setIsCallActive(isNowActive);
      
      // If call was active and now disconnected, update state
      if (wasActive && !isNowActive && (state.connectionState === 'closed' || state.connectionState === 'failed')) {
        // Call ended - reset state
        setTimeout(() => {
          setCallState(null);
          setRemoteUser(null);
        }, 1000);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeCallState();
    };
  }, [user]);

  const handleAcceptCall = () => {
    setIncomingCall(null);
    // Call state will be updated via subscription
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
    setRemoteUser(null);
  };

  const handleEndCall = async () => {
    await callService.endCall();
    setCallState(null);
    setIsCallActive(false);
    setRemoteUser(null);
  };

  const handleDismissNotification = () => {
    setIncomingCall(null);
    setRemoteUser(null);
  };

  return (
    <>
      {/* Incoming Call Notification */}
      {incomingCall && !isCallActive && (
        <CallNotification
          call={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onDismiss={handleDismissNotification}
        />
      )}

      {/* Active Call Modal */}
      {isCallActive && callState && (
        <EnhancedCallModal
          isOpen={isCallActive}
          onClose={handleEndCall}
          callState={callState}
          remoteUserName={remoteUser?.name}
          remoteUserPhotoURL={remoteUser?.photoURL}
          onEndCall={handleEndCall}
        />
      )}
    </>
  );
};

