// Call Service - Manages WebRTC peer connections for 1-to-1 calls
// Enterprise-grade with end-to-end encryption

import { webRTCService } from './webRTCService';
import { callSignalingService, CallSignal } from './callSignalingService';

export interface CallState {
  callId: string | null;
  remoteUserId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: 'video' | 'audio' | null;
  isConnected: boolean;
  connectionState: RTCPeerConnectionState;
}

class CallService {
  private currentCall: CallState = {
    callId: null,
    remoteUserId: null,
    localStream: null,
    remoteStream: null,
    callType: null,
    isConnected: false,
    connectionState: 'closed',
  };

  private signalUnsubscribe: (() => void) | null = null;
  private callStateCallbacks: Set<(state: CallState) => void> = new Set();
  private remoteStreamCallbacks: Set<(stream: MediaStream | null) => void> = new Set();

  /**
   * Start a call (as caller)
   */
  async startCall(
    recipientId: string,
    type: 'video' | 'audio',
    callerName?: string,
    callerPhotoURL?: string
  ): Promise<string> {
    try {
      // Create call invitation
      const { callId } = await callSignalingService.createCall(
        (webRTCService as any).getCurrentUserId() || 'unknown',
        recipientId,
        type,
        callerName,
        callerPhotoURL
      );

      // Start local stream
      const localStream = await webRTCService.startLocalStream(
        true, // audio always enabled
        type === 'video' // video only if video call
      );

      this.currentCall = {
        callId,
        remoteUserId: recipientId,
        localStream,
        remoteStream: null,
        callType: type,
        isConnected: false,
        connectionState: 'new',
      };

      this.notifyStateChange();

      // Set up signaling listeners
      this.setupSignaling(callId, recipientId);

      // Set up WebRTC callbacks
      webRTCService.onRemoteStream((userId, stream) => {
        if (userId === recipientId) {
          this.currentCall.remoteStream = stream;
          this.currentCall.isConnected = true;
          this.notifyStateChange();
          this.notifyRemoteStream(stream);
        }
      });

      webRTCService.onConnectionStateChange((userId, state) => {
        if (userId === recipientId) {
          this.currentCall.connectionState = state;
          this.currentCall.isConnected = state === 'connected';
          this.notifyStateChange();

          // Handle disconnection
          if (state === 'closed' || state === 'failed' || state === 'disconnected') {
            console.log('📞 Connection lost:', state);
            // If connection is closed or failed, end the call
            if (state === 'closed' || state === 'failed') {
              setTimeout(() => {
                // Give a moment for reconnection, then end call if still disconnected
                const currentState = this.currentCall.connectionState;
                if (currentState === 'closed' || currentState === 'failed' || currentState === 'disconnected') {
                  console.log('📞 Ending call due to connection loss');
                  this.endCall();
                }
              }, 2000); // Wait 2 seconds for potential reconnection
            }
          }
        }
      });

      // Handle ICE restart offers for reconnection
      webRTCService.onIceRestartOffer((userId, offer) => {
        if (userId === recipientId && this.currentCall.callId) {
          console.log('🔄 Sending ICE restart offer for reconnection');
          callSignalingService.sendOffer(
            this.currentCall.callId,
            (webRTCService as any).getCurrentUserId() || 'unknown',
            recipientId,
            offer
          ).catch((error) => {
            console.error('❌ Error sending ICE restart offer:', error);
          });
        }
      });

      // Initiate connection immediately - signaling is already set up
      // Small delay only to ensure everything is ready
      setTimeout(() => {
        this.initiateConnection(recipientId, callId).catch((error) => {
          console.error('Error initiating connection:', error);
        });
      }, 100); // Reduced from 500ms to 100ms

      return callId;
    } catch (error) {
      console.error('❌ Error starting call:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Accept an incoming call (as recipient)
   */
  async acceptCall(callId: string, callerId: string, type: 'video' | 'audio'): Promise<void> {
    try {
      // Accept call in signaling service
      await callSignalingService.acceptCall(callId, (webRTCService as any).getCurrentUserId() || 'unknown');

      // Start local stream
      const localStream = await webRTCService.startLocalStream(
        true, // audio always enabled
        type === 'video' // video only if video call
      );

      this.currentCall = {
        callId,
        remoteUserId: callerId,
        localStream,
        remoteStream: null,
        callType: type,
        isConnected: false,
        connectionState: 'new',
      };

      this.notifyStateChange();

      // Set up signaling listeners
      this.setupSignaling(callId, callerId);

      // Set up WebRTC callbacks
      webRTCService.onRemoteStream((userId, stream) => {
        if (userId === callerId) {
          this.currentCall.remoteStream = stream;
          this.currentCall.isConnected = true;
          this.notifyStateChange();
          this.notifyRemoteStream(stream);
        }
      });

      webRTCService.onConnectionStateChange((userId, state) => {
        if (userId === callerId) {
          this.currentCall.connectionState = state;
          this.currentCall.isConnected = state === 'connected';
          this.notifyStateChange();

          // Handle disconnection
          if (state === 'closed' || state === 'failed' || state === 'disconnected') {
            console.log('📞 Connection lost:', state);
            // If connection is closed or failed, end the call
            if (state === 'closed' || state === 'failed') {
              setTimeout(() => {
                // Give a moment for reconnection, then end call if still disconnected
                const currentState = this.currentCall.connectionState;
                if (currentState === 'closed' || currentState === 'failed' || currentState === 'disconnected') {
                  console.log('📞 Ending call due to connection loss');
                  this.endCall();
                }
              }, 2000); // Wait 2 seconds for potential reconnection
            }
          }
        }
      });

      // Handle ICE restart offers for reconnection
      webRTCService.onIceRestartOffer((userId, offer) => {
        if (userId === callerId && this.currentCall.callId) {
          console.log('🔄 Sending ICE restart offer for reconnection');
          callSignalingService.sendOffer(
            this.currentCall.callId,
            (webRTCService as any).getCurrentUserId() || 'unknown',
            callerId,
            offer
          ).catch((error) => {
            console.error('❌ Error sending ICE restart offer:', error);
          });
        }
      });
    } catch (error) {
      console.error('❌ Error accepting call:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * End the current call
   */
  async endCall(): Promise<void> {
    if (this.currentCall.callId && this.currentCall.remoteUserId) {
      try {
        // Send hangup signal to remote user
        const userId = (webRTCService as any).getCurrentUserId() || 'unknown';
        await callSignalingService.sendHangup(
          this.currentCall.callId,
          userId,
          this.currentCall.remoteUserId
        );
        
        // Update call status in database
        await callSignalingService.endCall(
          this.currentCall.callId,
          userId
        );
      } catch (error) {
        console.error('❌ Error ending call in signaling:', error);
      }
    }

    this.cleanup();
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string): Promise<void> {
    try {
      await callSignalingService.rejectCall(
        callId,
        (webRTCService as any).getCurrentUserId() || 'unknown'
      );
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
    }
  }

  /**
   * Get current call state
   */
  getCallState(): CallState {
    return { ...this.currentCall };
  }

  /**
   * Toggle audio mute/unmute
   */
  toggleAudio(enabled: boolean): void {
    webRTCService.toggleAudio(enabled);
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(enabled: boolean): void {
    webRTCService.toggleVideo(enabled);
  }

  /**
   * Subscribe to call state changes
   */
  onCallStateChange(callback: (state: CallState) => void): () => void {
    this.callStateCallbacks.add(callback);
    callback(this.currentCall); // Call immediately with current state

    return () => {
      this.callStateCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to remote stream changes
   */
  onRemoteStreamChange(callback: (stream: MediaStream | null) => void): () => void {
    this.remoteStreamCallbacks.add(callback);
    callback(this.currentCall.remoteStream); // Call immediately with current stream

    return () => {
      this.remoteStreamCallbacks.delete(callback);
    };
  }

  /**
   * Set up signaling for a call
   */
  private setupSignaling(callId: string, remoteUserId: string): void {
    // Clean up existing subscription
    if (this.signalUnsubscribe) {
      this.signalUnsubscribe();
    }

    // Subscribe to signals for this call
    this.signalUnsubscribe = callSignalingService.subscribeToCallSignals(
      callId,
      (webRTCService as any).getCurrentUserId() || 'unknown',
      async (signal: CallSignal) => {
        await this.handleSignal(signal, remoteUserId, callId);
      }
    );
  }

  /**
   * Handle incoming signaling messages
   */
  private async handleSignal(
    signal: CallSignal,
    remoteUserId: string,
    callId: string
  ): Promise<void> {
    try {
      if (signal.type === 'offer') {
        await this.handleOffer(signal, remoteUserId, callId);
      } else if (signal.type === 'answer') {
        await this.handleAnswer(signal, remoteUserId);
      } else if (signal.type === 'ice-candidate') {
        await this.handleIceCandidate(signal, remoteUserId);
      } else if (signal.type === 'hangup') {
        // Remote user hung up
        console.log('📞 Remote user hung up:', remoteUserId);
        this.handleRemoteHangup();
      }
    } catch (error) {
      console.error('❌ Error handling signal:', error);
    }
  }

  /**
   * Handle remote hangup
   */
  private async handleRemoteHangup(): Promise<void> {
    console.log('📞 Handling remote hangup');
    try {
      // Update call state immediately
      this.currentCall.connectionState = 'closed';
      this.currentCall.isConnected = false;
      this.notifyStateChange();
      
      // Clean up resources
      await this.endCall();
    } catch (error) {
      console.error('❌ Error ending call after remote hangup:', error);
      // Still cleanup even if there's an error
      this.cleanup();
    }
  }

  /**
   * Handle incoming offer
   */
  private async handleOffer(
    signal: CallSignal,
    remoteUserId: string,
    callId: string
  ): Promise<void> {
    const offer = signal.data as RTCSessionDescriptionInit;
    
    // Check if this is an ICE restart offer
    const existingPC = webRTCService.getPeerConnection(remoteUserId);
    const isIceRestart = existingPC && existingPC.signalingState === 'stable';

    if (isIceRestart) {
      console.log('🔄 Handling ICE restart offer from', remoteUserId);
      // For ICE restart, we reuse the existing connection
      // The connection will be reused by createPeerConnection if it's valid
    }

    // Create peer connection (will reuse if exists and valid)
    // For ICE restart, this will reuse the existing connection
    webRTCService.createPeerConnection(remoteUserId, async (candidate) => {
      await callSignalingService.sendIceCandidate(callId, (webRTCService as any).getCurrentUserId() || 'unknown', remoteUserId, candidate);
    });

    // Set remote description (will handle ICE restart automatically)
    await webRTCService.setRemoteDescription(remoteUserId, offer);

    // Create and send answer
    const answer = await webRTCService.createAnswer(remoteUserId);
    await callSignalingService.sendAnswer(callId, (webRTCService as any).getCurrentUserId() || 'unknown', remoteUserId, answer);
  }

  /**
   * Handle incoming answer
   */
  private async handleAnswer(signal: CallSignal, remoteUserId: string): Promise<void> {
    const answer = signal.data as RTCSessionDescriptionInit;
    
    try {
      await webRTCService.setRemoteDescription(remoteUserId, answer);
    } catch (error: any) {
      // If peer connection not found, the answer is stored as pending
      if (error?.message?.includes('Peer connection not found')) {
        console.log('📥 Answer stored as pending, will be processed when peer connection is created');
        return; // This is handled - answer is stored in pendingAnswers
      }
      
      // If answer fails due to wrong state, check if we should ignore it
      if (error?.message?.includes('invalid state') || error?.message?.includes('wrong state')) {
        const existingPC = webRTCService.getPeerConnection(remoteUserId);
        if (existingPC && existingPC.signalingState === 'stable') {
          // Answer arrived in stable state - this is a duplicate or out-of-order answer
          // The setRemoteDescription method will have already handled this gracefully
          console.log('🔄 Answer received in stable state - duplicate or out-of-order, already handled');
          return; // Silently ignore - already handled in setRemoteDescription
        }
      }
      // For other errors, log but don't throw - connection might still work
      console.warn('⚠️ Error handling answer (non-fatal):', error?.message);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(signal: CallSignal, remoteUserId: string): Promise<void> {
    const candidate = signal.data as RTCIceCandidateInit;
    await webRTCService.addIceCandidate(remoteUserId, candidate);
  }

  /**
   * Initiate WebRTC connection (caller side)
   */
  async initiateConnection(remoteUserId: string, callId: string): Promise<void> {
    try {
      // Create peer connection
      webRTCService.createPeerConnection(remoteUserId, async (candidate) => {
        await callSignalingService.sendIceCandidate(callId, (webRTCService as any).getCurrentUserId() || 'unknown', remoteUserId, candidate);
      });

      // Create and send offer
      const offer = await webRTCService.createOffer(remoteUserId);
      await callSignalingService.sendOffer(callId, (webRTCService as any).getCurrentUserId() || 'unknown', remoteUserId, offer);
    } catch (error) {
      console.error('❌ Error initiating connection:', error);
      throw error;
    }
  }

  /**
   * Clean up call resources
   */
  private cleanup(): void {
    if (this.currentCall.remoteUserId) {
      webRTCService.closePeerConnection(this.currentCall.remoteUserId);
    }

    webRTCService.stopLocalStream();

    if (this.signalUnsubscribe) {
      this.signalUnsubscribe();
      this.signalUnsubscribe = null;
    }

    this.currentCall = {
      callId: null,
      remoteUserId: null,
      localStream: null,
      remoteStream: null,
      callType: null,
      isConnected: false,
      connectionState: 'closed',
    };

    this.notifyStateChange();
    this.notifyRemoteStream(null);
  }

  /**
   * Notify all state change callbacks
   */
  private notifyStateChange(): void {
    this.callStateCallbacks.forEach((callback) => {
      callback({ ...this.currentCall });
    });
  }

  /**
   * Notify all remote stream callbacks
   */
  private notifyRemoteStream(stream: MediaStream | null): void {
    this.remoteStreamCallbacks.forEach((callback) => {
      callback(stream);
    });
  }
}

// Extend webRTCService to add getCurrentUserId method
if (!(webRTCService as any).getCurrentUserId) {
  (webRTCService as any).getCurrentUserId = () => {
    // This will be set by the call manager
    return (webRTCService as any).currentUserId || null;
  };
  
  (webRTCService as any).setCurrentUserId = (userId: string) => {
    (webRTCService as any).currentUserId = userId;
  };
}

export const callService = new CallService();

