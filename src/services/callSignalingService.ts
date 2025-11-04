// Call Signaling Service for 1-to-1 Calls
// Handles secure call invitations, acceptances, rejections, and signaling data

import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { e2eEncryptionService } from './e2eEncryptionService';

export interface CallInvitation {
  callId: string;
  callerId: string;
  callerName?: string;
  callerPhotoURL?: string;
  recipientId: string;
  type: 'video' | 'audio';
  status: 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
  encryptionKey?: string; // Public key for E2E encryption
  timestamp: Timestamp | any;
  endedAt?: Timestamp | any;
}

export interface CallSignal {
  callId: string;
  senderId: string;
  recipientId: string;
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any; // Encrypted SDP or ICE candidate
  timestamp: Timestamp | any;
}

class CallSignalingService {
  private callsCollection = collection(db, 'calls');
  private callSignalsCollection = collection(db, 'callSignals');

  /**
   * Create a new call invitation
   */
  async createCall(
    callerId: string,
    recipientId: string,
    type: 'video' | 'audio',
    callerName?: string,
    callerPhotoURL?: string
  ): Promise<{ callId: string; encryptionKey: string }> {
    try {
      const callId = `call_${callerId}_${recipientId}_${Date.now()}`;
      
      // Generate encryption key for this call
      const { publicKey: encryptionKey, privateKey } = await e2eEncryptionService.generateKeyPair();
      e2eEncryptionService.cacheKey(callId, privateKey);

      const callData: CallInvitation = {
        callId,
        callerId,
        callerName,
        callerPhotoURL,
        recipientId,
        type,
        status: 'ringing',
        encryptionKey,
        timestamp: serverTimestamp(),
      };

      await setDoc(doc(this.callsCollection, callId), callData);
      console.log('📞 Call invitation created:', callId);

      return { callId, encryptionKey };
    } catch (error) {
      console.error('❌ Error creating call:', error);
      throw error;
    }
  }

  /**
   * Accept a call
   */
  async acceptCall(callId: string, recipientId: string): Promise<void> {
    try {
      const callRef = doc(this.callsCollection, callId);
      const callDoc = await getDoc(callRef);

      if (!callDoc.exists()) {
        throw new Error('Call not found');
      }

      const callData = callDoc.data() as CallInvitation;
      if (callData.recipientId !== recipientId) {
        throw new Error('Unauthorized');
      }

      if (callData.status !== 'ringing') {
        throw new Error(`Call is already ${callData.status}`);
      }

      // Import the encryption key from the caller
      if (callData.encryptionKey) {
        const key = await e2eEncryptionService.importKey(callData.encryptionKey);
        e2eEncryptionService.cacheKey(callId, key);
      }

      await updateDoc(callRef, {
        status: 'accepted',
        timestamp: serverTimestamp(),
      });

      console.log('✅ Call accepted:', callId);
    } catch (error) {
      console.error('❌ Error accepting call:', error);
      throw error;
    }
  }

  /**
   * Reject a call
   */
  async rejectCall(callId: string, recipientId: string): Promise<void> {
    try {
      const callRef = doc(this.callsCollection, callId);
      const callDoc = await getDoc(callRef);

      if (!callDoc.exists()) {
        throw new Error('Call not found');
      }

      const callData = callDoc.data() as CallInvitation;
      if (callData.recipientId !== recipientId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(callRef, {
        status: 'rejected',
        endedAt: serverTimestamp(),
      });

      console.log('❌ Call rejected:', callId);
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(callId: string, userId: string): Promise<void> {
    try {
      const callRef = doc(this.callsCollection, callId);
      const callDoc = await getDoc(callRef);

      if (!callDoc.exists()) {
        return; // Call already ended
      }

      const callData = callDoc.data() as CallInvitation;
      if (callData.callerId !== userId && callData.recipientId !== userId) {
        throw new Error('Unauthorized');
      }

      const newStatus = callData.status === 'ringing' ? 'missed' : 'ended';

      await updateDoc(callRef, {
        status: newStatus,
        endedAt: serverTimestamp(),
      });

      // Clear encryption key cache
      e2eEncryptionService.clearCachedKey(callId);

      console.log('📞 Call ended:', callId);
    } catch (error) {
      console.error('❌ Error ending call:', error);
      throw error;
    }
  }

  /**
   * Get call details
   */
  async getCall(callId: string): Promise<CallInvitation | null> {
    try {
      const callDoc = await getDoc(doc(this.callsCollection, callId));
      if (!callDoc.exists()) {
        return null;
      }

      const data = callDoc.data();
      return {
        ...data,
        timestamp: data.timestamp,
        endedAt: data.endedAt,
      } as CallInvitation;
    } catch (error) {
      console.error('❌ Error getting call:', error);
      return null;
    }
  }

  /**
   * Listen for incoming calls
   */
  subscribeToIncomingCalls(
    userId: string,
    callback: (call: CallInvitation) => void
  ): () => void {
    const q = query(
      this.callsCollection,
      where('recipientId', '==', userId),
      where('status', '==', 'ringing')
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          callback({
            ...data,
            timestamp: data.timestamp,
          } as CallInvitation);
        }
      });
    }, (error) => {
      console.error('❌ Error in incoming calls subscription:', error);
    });
  }

  /**
   * Send encrypted offer
   */
  async sendOffer(
    callId: string,
    senderId: string,
    recipientId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      const key = e2eEncryptionService.getCachedKey(callId);
      if (!key) {
        throw new Error('Encryption key not found for call');
      }

      const encryptedOffer = await e2eEncryptionService.encryptSDP(offer, key);
      const signalId = `${callId}_offer_${Date.now()}`;

      await setDoc(doc(this.callSignalsCollection, signalId), {
        callId,
        senderId,
        recipientId,
        type: 'offer',
        data: encryptedOffer,
        timestamp: serverTimestamp(),
      });

      console.log('📤 Sent encrypted offer:', signalId);
    } catch (error) {
      console.error('❌ Error sending offer:', error);
      throw error;
    }
  }

  /**
   * Send encrypted answer
   */
  async sendAnswer(
    callId: string,
    senderId: string,
    recipientId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      const key = e2eEncryptionService.getCachedKey(callId);
      if (!key) {
        throw new Error('Encryption key not found for call');
      }

      const encryptedAnswer = await e2eEncryptionService.encryptSDP(answer, key);
      const signalId = `${callId}_answer_${Date.now()}`;

      await setDoc(doc(this.callSignalsCollection, signalId), {
        callId,
        senderId,
        recipientId,
        type: 'answer',
        data: encryptedAnswer,
        timestamp: serverTimestamp(),
      });

      console.log('📤 Sent encrypted answer:', signalId);
    } catch (error) {
      console.error('❌ Error sending answer:', error);
      throw error;
    }
  }

  /**
   * Send encrypted ICE candidate
   */
  async sendIceCandidate(
    callId: string,
    senderId: string,
    recipientId: string,
    candidate: RTCIceCandidate
  ): Promise<void> {
    try {
      const key = e2eEncryptionService.getCachedKey(callId);
      if (!key) {
        // ICE candidates can arrive before key is set, queue them
        console.warn('⚠️ Encryption key not found for ICE candidate, skipping encryption for now');
        return;
      }

      const encryptedCandidate = await e2eEncryptionService.encryptICECandidate(
        candidate.toJSON(),
        key
      );
      const signalId = `${callId}_ice_${Date.now()}`;

      await setDoc(doc(this.callSignalsCollection, signalId), {
        callId,
        senderId,
        recipientId,
        type: 'ice-candidate',
        data: encryptedCandidate,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Error sending ICE candidate:', error);
    }
  }

  /**
   * Listen for call signals (offers, answers, ICE candidates)
   */
  subscribeToCallSignals(
    callId: string,
    userId: string,
    callback: (signal: CallSignal) => void
  ): () => void {
    const q = query(
      this.callSignalsCollection,
      where('callId', '==', callId),
      where('recipientId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const signal: CallSignal = {
            callId: data.callId,
            senderId: data.senderId,
            recipientId: data.recipientId,
            type: data.type,
            data: data.data,
            timestamp: data.timestamp,
          };

          // Decrypt the signal data
          try {
            const key = e2eEncryptionService.getCachedKey(callId);
            if (!key) {
              console.warn('⚠️ Encryption key not found, signal may be queued');
              callback(signal); // Still call callback, decryption will happen later
              return;
            }

            let decryptedData: any;
            if (signal.type === 'offer' || signal.type === 'answer') {
              decryptedData = await e2eEncryptionService.decryptSDP(signal.data, key);
            } else if (signal.type === 'ice-candidate') {
              decryptedData = await e2eEncryptionService.decryptICECandidate(signal.data, key);
            }

            callback({
              ...signal,
              data: decryptedData,
            });
          } catch (error) {
            console.error('❌ Error decrypting signal:', error);
            callback(signal); // Send encrypted signal, component will handle retry
          }

          // Delete signal after processing
          try {
            await deleteDoc(change.doc.ref);
          } catch (error) {
            console.error('❌ Error deleting signal:', error);
          }
        }
      });
    }, (error) => {
      console.error('❌ Error in call signals subscription:', error);
    });
  }

  /**
   * Clean up old signals (called when call ends)
   */
  async cleanupCallSignals(callId: string): Promise<void> {
    // In production, this would be handled by Cloud Functions
    // For now, signals are automatically deleted after being processed
  }
}

export const callSignalingService = new CallSignalingService();

