import { db } from '../config/firebase';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { emailTemplates } from './emailTemplates';
import { emailJSService } from './emailJSService';

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  inviteCode: string;
}

export interface EmailInviteData {
  teamName: string;
  inviterName: string;
  inviteeEmail: string;
  inviteCode: string;
  teamId: string;
}

class EmailService {
  private readonly INVITE_EXPIRY_DAYS = 7;

  /**
   * Send a team invitation email
   * This uses a simple approach that can be enhanced with a real email service
   */
  async sendTeamInvite(inviteData: EmailInviteData): Promise<{ success: boolean; error?: string }> {
    try {
      // Create invite record in Firestore
      const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.INVITE_EXPIRY_DAYS);

      const invite: TeamInvite = {
        id: inviteId,
        teamId: inviteData.teamId,
        teamName: inviteData.teamName,
        inviterId: '', // Will be set by the calling function
        inviterName: inviteData.inviterName,
        inviteeEmail: inviteData.inviteeEmail,
        status: 'pending',
        createdAt: new Date(),
        expiresAt,
        inviteCode: inviteData.inviteCode
      };

      // Store invite in Firestore
      await setDoc(doc(db, 'teamInvites', inviteId), {
        ...invite,
        createdAt: serverTimestamp(),
        expiresAt: serverTimestamp()
      });

      // Generate email content using templates
      const appUrl = window.location.origin;
      const emailData = {
        teamName: inviteData.teamName,
        inviterName: inviteData.inviterName,
        inviteeEmail: inviteData.inviteeEmail,
        inviteCode: inviteData.inviteCode,
        teamId: inviteData.teamId,
        appUrl
      };

      const emailSubject = emailTemplates.generateTeamInviteSubject(emailData);
      const emailHTML = emailTemplates.generateTeamInviteHTML(emailData);
      const emailText = emailTemplates.generateTeamInviteText(emailData);

      // Send the actual email via EmailJS
      const emailResult = await emailJSService.sendTeamInvite({
        to: inviteData.inviteeEmail,
        subject: emailSubject,
        html: emailHTML,
        text: emailText,
        teamName: inviteData.teamName,
        inviterName: inviteData.inviterName,
        inviteCode: inviteData.inviteCode
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      console.log('📧 Team invite created:', invite);
      console.log('📧 Email sent successfully to:', inviteData.inviteeEmail);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending team invite:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send invite' 
      };
    }
  }

  /**
   * Get all pending invites for a team
   */
  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    try {
      const invitesRef = collection(db, 'teamInvites');
      const q = query(
        invitesRef,
        where('teamId', '==', teamId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const invites: TeamInvite[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        invites.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date()
        } as TeamInvite);
      });

      return invites;
    } catch (error) {
      console.error('Error getting team invites:', error);
      return [];
    }
  }

  /**
   * Cancel a pending invite
   */
  async cancelInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await setDoc(doc(db, 'teamInvites', inviteId), {
        status: 'expired',
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error canceling invite:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel invite' 
      };
    }
  }

  /**
   * Accept a team invite
   */
  async acceptInvite(inviteId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update invite status
      await setDoc(doc(db, 'teamInvites', inviteId), {
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error accepting invite:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to accept invite' 
      };
    }
  }

  /**
   * Generate a unique invite code
   */
  generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Get invite by code
   */
  async getInviteByCode(inviteCode: string): Promise<TeamInvite | null> {
    try {
      const invitesRef = collection(db, 'teamInvites');
      const q = query(
        invitesRef,
        where('inviteCode', '==', inviteCode),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as TeamInvite;
    } catch (error) {
      console.error('Error getting invite by code:', error);
      return null;
    }
  }
}

export const emailService = new EmailService();
