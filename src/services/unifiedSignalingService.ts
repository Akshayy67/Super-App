// Unified Signaling Service - Uses Realtime Database (primary) with Firestore fallback
// Production-grade signaling that never fails

import { realtimeSignalingService, SignalingCallbacks } from './realtimeSignalingService';
import { webRTCSignalingService } from './webRTCSignalingService';
import { database } from '../config/firebase';

export interface UnifiedSignalingCallbacks {
  onOffer?: (offer: RTCSessionDescriptionInit, from: string) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit, from: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, from: string) => void;
  onHangup?: (from: string) => void;
  onError?: (error: Error) => void;
}

class UnifiedSignalingService {
  private useRealtimeDB: boolean = false;
  private activeConnections: Map<string, () => void> = new Map();
  private fallbackMode: Map<string, boolean> = new Map();

  constructor() {
    // Check if Realtime Database is available
    try {
      this.useRealtimeDB = !!database;
      console.log(this.useRealtimeDB 
        ? '✅ Using Firebase Realtime Database for signaling (ultra-low latency)'
        : '⚠️ Realtime Database not available, using Firestore fallback');
    } catch (error) {
      console.warn('⚠️ Realtime Database check failed, using Firestore:', error);
      this.useRealtimeDB = false;
    }
  }

  /**
   * Initialize signaling for a connection
   */
  async initializeSignaling(
    connectionId: string,
    userId: string,
    remoteUserId: string,
    callbacks: UnifiedSignalingCallbacks
  ): Promise<() => void> {
    const connectionKey = `${connectionId}_${userId}_${remoteUserId}`;

    // Try Realtime Database first
    if (this.useRealtimeDB) {
      try {
        const cleanup = await realtimeSignalingService.initializeSignaling(
          connectionId,
          userId,
          remoteUserId,
          {
            onOffer: callbacks.onOffer,
            onAnswer: callbacks.onAnswer,
            onIceCandidate: callbacks.onIceCandidate,
            onHangup: callbacks.onHangup,
            onError: (error) => {
              console.warn('⚠️ Realtime DB signaling error, switching to Firestore:', error);
              this.fallbackMode.set(connectionKey, true);
              this.initializeFallback(connectionId, userId, remoteUserId, callbacks);
              if (callbacks.onError) {
                callbacks.onError(error);
              }
            }
          }
        );

        this.activeConnections.set(connectionKey, cleanup);
        this.fallbackMode.set(connectionKey, false);
        return cleanup;
      } catch (error) {
        console.warn('⚠️ Realtime DB initialization failed, using Firestore:', error);
        this.useRealtimeDB = false;
      }
    }

    // Fallback to Firestore
    return this.initializeFallback(connectionId, userId, remoteUserId, callbacks);
  }

  /**
   * Initialize Firestore fallback signaling
   */
  private initializeFallback(
    connectionId: string,
    userId: string,
    remoteUserId: string,
    callbacks: UnifiedSignalingCallbacks
  ): () => void {
    const connectionKey = `${connectionId}_${userId}_${remoteUserId}`;
    this.fallbackMode.set(connectionKey, true);

    // Use Firestore signaling service
    const unsubscribe = webRTCSignalingService.subscribeToSignals(
      connectionId,
      userId,
      (signal) => {
        if (signal.senderId === userId) {
          return; // Skip our own signals
        }

        try {
          switch (signal.type) {
            case 'offer':
              if (callbacks.onOffer && signal.data) {
                callbacks.onOffer(signal.data as RTCSessionDescriptionInit, signal.senderId);
              }
              break;

            case 'answer':
              if (callbacks.onAnswer && signal.data) {
                callbacks.onAnswer(signal.data as RTCSessionDescriptionInit, signal.senderId);
              }
              break;

            case 'ice-candidate':
              if (callbacks.onIceCandidate && signal.data) {
                callbacks.onIceCandidate(signal.data as RTCIceCandidateInit, signal.senderId);
              }
              break;
          }
        } catch (error) {
          console.error('❌ Error handling Firestore signal:', error);
          if (callbacks.onError) {
            callbacks.onError(error as Error);
          }
        }
      }
    );

    const cleanup = () => {
      unsubscribe();
      this.activeConnections.delete(connectionKey);
      this.fallbackMode.delete(connectionKey);
    };

    this.activeConnections.set(connectionKey, cleanup);
    return cleanup;
  }

  /**
   * Send offer
   */
  async sendOffer(
    connectionId: string,
    senderId: string,
    recipientId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const connectionKey = `${connectionId}_${senderId}_${recipientId}`;
    const isFallback = this.fallbackMode.get(connectionKey) || !this.useRealtimeDB;

    if (isFallback) {
      await webRTCSignalingService.sendOffer(connectionId, senderId, recipientId, offer);
    } else {
      await realtimeSignalingService.sendOffer(connectionId, senderId, recipientId, offer);
    }
  }

  /**
   * Send answer
   */
  async sendAnswer(
    connectionId: string,
    senderId: string,
    recipientId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const connectionKey = `${connectionId}_${senderId}_${recipientId}`;
    const isFallback = this.fallbackMode.get(connectionKey) || !this.useRealtimeDB;

    if (isFallback) {
      await webRTCSignalingService.sendAnswer(connectionId, senderId, recipientId, answer);
    } else {
      await realtimeSignalingService.sendAnswer(connectionId, senderId, recipientId, answer);
    }
  }

  /**
   * Send ICE candidate
   */
  async sendIceCandidate(
    connectionId: string,
    senderId: string,
    recipientId: string,
    candidate: RTCIceCandidateInit | RTCIceCandidate
  ): Promise<void> {
    const connectionKey = `${connectionId}_${senderId}_${recipientId}`;
    const isFallback = this.fallbackMode.get(connectionKey) || !this.useRealtimeDB;

    const candidateData = candidate instanceof RTCIceCandidate 
      ? candidate.toJSON() 
      : candidate;

    if (isFallback) {
      // Firestore service expects RTCIceCandidate
      const iceCandidate = candidate instanceof RTCIceCandidate 
        ? candidate 
        : new RTCIceCandidate(candidate);
      await webRTCSignalingService.sendIceCandidate(connectionId, senderId, recipientId, iceCandidate);
    } else {
      await realtimeSignalingService.sendIceCandidate(connectionId, senderId, recipientId, candidateData);
    }
  }

  /**
   * Send hangup
   */
  async sendHangup(
    connectionId: string,
    senderId: string,
    recipientId: string
  ): Promise<void> {
    const connectionKey = `${connectionId}_${senderId}_${recipientId}`;
    const isFallback = this.fallbackMode.get(connectionKey) || !this.useRealtimeDB;

    if (!isFallback) {
      await realtimeSignalingService.sendHangup(connectionId, senderId, recipientId);
    }
    // Firestore doesn't have explicit hangup, connection cleanup handles it
  }

  /**
   * Get connection state
   */
  getConnectionState(connectionId: string, userId: string): 'connecting' | 'connected' | 'disconnected' | 'failed' {
    if (this.useRealtimeDB && !this.fallbackMode.get(`${connectionId}_${userId}`)) {
      return realtimeSignalingService.getConnectionState(connectionId, userId);
    }
    return 'connected'; // Firestore doesn't track connection state
  }

  /**
   * Cleanup signaling
   */
  cleanup(connectionId: string, userId: string, remoteUserId?: string): void {
    const connectionKey = remoteUserId 
      ? `${connectionId}_${userId}_${remoteUserId}`
      : `${connectionId}_${userId}`;

    const cleanup = this.activeConnections.get(connectionKey);
    if (cleanup) {
      cleanup();
    }

    // Also cleanup in underlying services
    if (this.useRealtimeDB) {
      realtimeSignalingService.cleanup(connectionId, userId);
    }
  }

  /**
   * Cleanup all connections
   */
  cleanupAll(): void {
    this.activeConnections.forEach((cleanup) => cleanup());
    this.activeConnections.clear();
    this.fallbackMode.clear();

    if (this.useRealtimeDB) {
      realtimeSignalingService.cleanupAll();
    }
  }
}

export const unifiedSignalingService = new UnifiedSignalingService();

