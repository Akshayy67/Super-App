// WebRTC Signaling Service using Firestore
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface SignalMessage {
  senderId: string;
  recipientId: string;
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  timestamp: Timestamp | any;
}

class WebRTCSignalingService {
  private signalingCollection = collection(db, 'webrtcSignaling');

  // Send offer
  async sendOffer(
    meetingId: string,
    senderId: string,
    recipientId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const signalId = `${meetingId}_${senderId}_${recipientId}_${Date.now()}`;
    
    try {
      const docData = {
        meetingId,
        senderId,
        recipientId,
        type: 'offer',
        data: offer,
        timestamp: serverTimestamp()
      };
      
      await setDoc(doc(this.signalingCollection, signalId), docData);
      console.log('📤 Sent offer signal:', { 
        signalId, 
        from: senderId, 
        to: recipientId,
        meetingId,
        docData: { ...docData, timestamp: 'serverTimestamp()' }
      });
      
      // Verify it was written
      const writtenDoc = await getDoc(doc(this.signalingCollection, signalId));
      if (writtenDoc.exists()) {
        console.log('✅ Offer document verified in Firestore:', writtenDoc.data());
      } else {
        console.error('❌ Offer document NOT found after write!');
      }
    } catch (error) {
      console.error('❌ Error sending offer:', error);
      throw error;
    }
  }

  // Send answer
  async sendAnswer(
    meetingId: string,
    senderId: string,
    recipientId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const signalId = `${meetingId}_${senderId}_${recipientId}_${Date.now()}`;
    
    try {
      await setDoc(doc(this.signalingCollection, signalId), {
        meetingId,
        senderId,
        recipientId,
        type: 'answer',
        data: answer,
        timestamp: serverTimestamp()
      });
      console.log('📤 Sent answer signal:', { signalId, from: senderId, to: recipientId });
    } catch (error) {
      console.error('❌ Error sending answer:', error);
      throw error;
    }
  }

  // Send ICE candidate
  async sendIceCandidate(
    meetingId: string,
    senderId: string,
    recipientId: string,
    candidate: RTCIceCandidate
  ): Promise<void> {
    const signalId = `${meetingId}_${senderId}_${recipientId}_ice_${Date.now()}`;
    
    try {
      await setDoc(doc(this.signalingCollection, signalId), {
        meetingId,
        senderId,
        recipientId,
        type: 'ice-candidate',
        data: candidate.toJSON(),
        timestamp: serverTimestamp()
      });
      console.log('📤 Sent ICE candidate');
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }

  // Listen for signals directed to this user
  subscribeToSignals(
    meetingId: string,
    userId: string,
    callback: (signal: SignalMessage) => void
  ): () => void {
    console.log('👂 Subscribing to signals for:', { userId, meetingId });
    console.log('📋 Query: where("meetingId", "==", "' + meetingId + '") AND where("recipientId", "==", "' + userId + '")');
    
    const q = query(
      this.signalingCollection,
      where('meetingId', '==', meetingId),
      where('recipientId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      console.log('📬 Signal snapshot received:', snapshot.docs.length, 'documents');
      
      // Log all documents in snapshot for debugging
      if (snapshot.docs.length > 0) {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('  📄 Doc:', doc.id, '| Type:', data.type, '| From:', data.senderId, '| To:', data.recipientId);
        });
      }
      
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          console.log('✉️ Processing signal:', data.type, 'from:', data.senderId, 'doc ID:', change.doc.id);
          
          callback({
            senderId: data.senderId,
            recipientId: data.recipientId,
            type: data.type,
            data: data.data,
            timestamp: data.timestamp
          });

          // Delete the signal after processing
          try {
            await deleteDoc(change.doc.ref);
            console.log('🗑️ Deleted signal:', change.doc.id);
          } catch (error) {
            console.error('❌ Error deleting signal:', error);
          }
        }
      });
    }, (error) => {
      console.error('❌ Error in signal subscription:', error);
    });
  }

  // Clean up old signals for a meeting (called when meeting ends)
  async cleanupMeetingSignals(meetingId: string): Promise<void> {
    // In production, this would be handled by Cloud Functions
    // For now, signals are automatically deleted after being processed
  }
}

export const webRTCSignalingService = new WebRTCSignalingService();
