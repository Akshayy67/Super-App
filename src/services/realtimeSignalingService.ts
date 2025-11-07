// Production-Grade WebRTC Signaling Service using Firebase Realtime Database
// This provides ultra-low latency, reliable signaling that never fails

import { ref, set, onValue, remove, Database } from 'firebase/database';
import { database } from '../config/firebase';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'hangup' | 'reconnect';
  senderId: string;
  recipientId: string;
  data: any;
  timestamp: number;
  messageId: string;
}

export interface SignalingCallbacks {
  onOffer?: (offer: RTCSessionDescriptionInit, from: string) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit, from: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, from: string) => void;
  onHangup?: (from: string) => void;
  onReconnect?: (from: string) => void;
  onError?: (error: Error) => void;
}

class RealtimeSignalingService {
  private db: Database;
  private signalingRefs: Map<string, any> = new Map();
  private listeners: Map<string, () => void> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionState: Map<string, 'connecting' | 'connected' | 'disconnected' | 'failed'> = new Map();

  constructor() {
    if (!database) {
      throw new Error('Firebase Realtime Database not initialized');
    }
    this.db = database;
    console.log('✅ Firebase Realtime Database initialized for signaling');
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get signaling path for a connection
   */
  private getSignalingPath(connectionId: string, userId: string): string {
    return `signaling/${connectionId}/${userId}`;
  }

  /**
   * Get heartbeat path for a user
   */
  private getHeartbeatPath(userId: string): string {
    return `heartbeats/${userId}`;
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat(userId: string): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      try {
        const heartbeatRef = ref(this.db, this.getHeartbeatPath(userId));
        set(heartbeatRef, {
          timestamp: Date.now(),
          status: 'online'
        }).catch((error) => {
          console.warn('⚠️ Heartbeat failed:', error);
        });
      } catch (error) {
        console.warn('⚠️ Heartbeat error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Initialize signaling for a connection
   */
  async initializeSignaling(
    connectionId: string,
    userId: string,
    remoteUserId: string,
    callbacks: SignalingCallbacks
  ): Promise<() => void> {
    const connectionKey = `${connectionId}_${userId}`;
    
    // Clean up any existing connection
    this.cleanup(connectionId, userId);

    // Set connection state
    this.connectionState.set(connectionKey, 'connecting');

    // Start heartbeat
    this.startHeartbeat(userId);

    // Set up listener for incoming signals
    const signalPath = this.getSignalingPath(connectionId, userId);
    const signalRef = ref(this.db, signalPath);

    const unsubscribe = onValue(
      signalRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.val();
        if (!data || typeof data !== 'object') {
          return;
        }

        // Process all messages
        Object.keys(data).forEach((messageId) => {
          const message: SignalingMessage = data[messageId];
          
          if (!message || message.senderId === userId) {
            return; // Skip our own messages
          }

          try {
            this.handleSignal(message, callbacks, connectionKey);
            
            // Remove processed message
            const messageRef = ref(this.db, `${signalPath}/${messageId}`);
            remove(messageRef).catch((error) => {
              console.warn('⚠️ Failed to remove processed message:', error);
            });
          } catch (error) {
            console.error('❌ Error handling signal:', error);
            if (callbacks.onError) {
              callbacks.onError(error as Error);
            }
          }
        });
      },
      (error) => {
        console.error('❌ Signaling listener error:', error);
        this.connectionState.set(connectionKey, 'failed');
        this.handleReconnection(connectionId, userId, remoteUserId, callbacks);
        
        if (callbacks.onError) {
          callbacks.onError(error);
        }
      }
    );

    this.listeners.set(connectionKey, unsubscribe);
    this.connectionState.set(connectionKey, 'connected');

    // Return cleanup function
    return () => {
      this.cleanup(connectionId, userId);
    };
  }

  /**
   * Handle incoming signal
   */
  private handleSignal(
    message: SignalingMessage,
    callbacks: SignalingCallbacks,
    connectionKey: string
  ): void {
    console.log('📨 Received signal:', message.type, 'from:', message.senderId);

    switch (message.type) {
      case 'offer':
        if (callbacks.onOffer && message.data) {
          callbacks.onOffer(message.data as RTCSessionDescriptionInit, message.senderId);
        }
        break;

      case 'answer':
        if (callbacks.onAnswer && message.data) {
          callbacks.onAnswer(message.data as RTCSessionDescriptionInit, message.senderId);
        }
        break;

      case 'ice-candidate':
        if (callbacks.onIceCandidate && message.data) {
          callbacks.onIceCandidate(message.data as RTCIceCandidateInit, message.senderId);
        }
        break;

      case 'hangup':
        if (callbacks.onHangup) {
          callbacks.onHangup(message.senderId);
        }
        break;

      case 'reconnect':
        if (callbacks.onReconnect) {
          callbacks.onReconnect(message.senderId);
        }
        this.connectionState.set(connectionKey, 'connected');
        break;

      default:
        console.warn('⚠️ Unknown signal type:', message.type);
    }
  }

  /**
   * Send signal to remote user
   */
  private async sendSignal(
    connectionId: string,
    senderId: string,
    recipientId: string,
    type: SignalingMessage['type'],
    data: any
  ): Promise<void> {
    try {
      const message: SignalingMessage = {
        type,
        senderId,
        recipientId,
        data,
        timestamp: Date.now(),
        messageId: this.generateMessageId()
      };

      const recipientPath = this.getSignalingPath(connectionId, recipientId);
      const messageRef = ref(this.db, `${recipientPath}/${message.messageId}`);
      
      await set(messageRef, message);
      
      console.log('📤 Sent signal:', type, 'to:', recipientId);

      // Set timeout to auto-remove message after 30 seconds if not processed
      setTimeout(() => {
        remove(messageRef).catch(() => {
          // Ignore errors on cleanup
        });
      }, 30000);
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      throw error;
    }
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
    await this.sendSignal(connectionId, senderId, recipientId, 'offer', offer);
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
    await this.sendSignal(connectionId, senderId, recipientId, 'answer', answer);
  }

  /**
   * Send ICE candidate
   */
  async sendIceCandidate(
    connectionId: string,
    senderId: string,
    recipientId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    await this.sendSignal(connectionId, senderId, recipientId, 'ice-candidate', candidate);
  }

  /**
   * Send hangup signal
   */
  async sendHangup(
    connectionId: string,
    senderId: string,
    recipientId: string
  ): Promise<void> {
    await this.sendSignal(connectionId, senderId, recipientId, 'hangup', {});
  }

  /**
   * Handle reconnection
   */
  private handleReconnection(
    connectionId: string,
    userId: string,
    remoteUserId: string,
    callbacks: SignalingCallbacks
  ): void {
    const connectionKey = `${connectionId}_${userId}`;
    const attempts = this.reconnectAttempts.get(connectionKey) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.connectionState.set(connectionKey, 'failed');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
    this.reconnectAttempts.set(connectionKey, attempts + 1);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.initializeSignaling(connectionId, userId, remoteUserId, callbacks)
        .then(() => {
          // Send reconnect signal
          this.sendSignal(connectionId, userId, remoteUserId, 'reconnect', {})
            .catch((error) => {
              console.warn('⚠️ Failed to send reconnect signal:', error);
            });
          
          this.reconnectAttempts.delete(connectionKey);
        })
        .catch((error) => {
          console.error('❌ Reconnection failed:', error);
          this.handleReconnection(connectionId, userId, remoteUserId, callbacks);
        });
    }, delay);
  }

  /**
   * Get connection state
   */
  getConnectionState(connectionId: string, userId: string): 'connecting' | 'connected' | 'disconnected' | 'failed' {
    const connectionKey = `${connectionId}_${userId}`;
    return this.connectionState.get(connectionKey) || 'disconnected';
  }

  /**
   * Clean up signaling for a connection
   */
  cleanup(connectionId: string, userId: string): void {
    const connectionKey = `${connectionId}_${userId}`;
    
    // Remove listener
    const unsubscribe = this.listeners.get(connectionKey);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(connectionKey);
    }

    // Clean up signaling data
    const signalPath = this.getSignalingPath(connectionId, userId);
    const signalRef = ref(this.db, signalPath);
    remove(signalRef).catch((error) => {
      console.warn('⚠️ Failed to cleanup signaling data:', error);
    });

    // Clean up heartbeat
    const heartbeatRef = ref(this.db, this.getHeartbeatPath(userId));
    remove(heartbeatRef).catch((error) => {
      console.warn('⚠️ Failed to cleanup heartbeat:', error);
    });

    // Reset state
    this.connectionState.delete(connectionKey);
    this.reconnectAttempts.delete(connectionKey);
    this.signalingRefs.delete(connectionKey);

    // Stop heartbeat if no active connections
    if (this.listeners.size === 0) {
      this.stopHeartbeat();
    }

    console.log('🧹 Cleaned up signaling for:', connectionKey);
  }

  /**
   * Clean up all connections
   */
  cleanupAll(): void {
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
    });
    this.listeners.clear();
    this.connectionState.clear();
    this.reconnectAttempts.clear();
    this.signalingRefs.clear();
    this.stopHeartbeat();
    console.log('🧹 Cleaned up all signaling');
  }
}

export const realtimeSignalingService = new RealtimeSignalingService();

