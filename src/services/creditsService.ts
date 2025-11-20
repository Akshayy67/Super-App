// Credits and Wallet Service
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction,
  limit,
  startAfter,
  DocumentSnapshot,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  UserCredits, 
  CreditTransaction, 
  PayoutRequest,
  GiftPremium,
  CREDITS_CONFIG 
} from '../types/bugReport';
import { premiumUserService } from './premiumUserService';

class CreditsService {
  private creditsCollection = 'userCredits';
  private transactionsCollection = 'creditTransactions';
  private payoutRequestsCollection = 'payoutRequests';
  private giftsCollection = 'premiumGifts';

  // Initialize user credits
  async initializeUserCredits(userId: string): Promise<void> {
    try {
      const creditsDoc = doc(db, this.creditsCollection, userId);
      const docSnap = await getDoc(creditsDoc);

      if (!docSnap.exists()) {
        const initialCredits: UserCredits = {
          userId,
          totalCredits: 0,
          pendingCredits: 0,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
          lastUpdated: new Date()
        };

        await setDoc(creditsDoc, {
          ...initialCredits,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error initializing user credits:', error);
      throw new Error('Failed to initialize user credits');
    }
  }

  // Get user credits
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const docSnap = await getDoc(doc(db, this.creditsCollection, userId));
      
      if (!docSnap.exists()) {
        await this.initializeUserCredits(userId);
        return this.getUserCredits(userId);
      }

      const data = docSnap.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as UserCredits;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw new Error('Failed to fetch user credits');
    }
  }

  // Add credits transaction
  private async addTransaction(
    userId: string,
    type: CreditTransaction['type'],
    amount: number,
    description: string,
    metadata?: CreditTransaction['metadata']
  ): Promise<string> {
    const transactionId = `txn_${Date.now()}_${userId}`;
    
    // Get current balance
    const credits = await this.getUserCredits(userId);
    const balanceAfter = (credits?.totalCredits || 0) + amount;

    const transaction: Omit<CreditTransaction, 'id'> = {
      userId,
      type,
      amount,
      balanceAfter,
      description,
      metadata,
      status: 'completed',
      createdAt: new Date()
    };

    await setDoc(doc(db, this.transactionsCollection, transactionId), {
      ...transaction,
      createdAt: serverTimestamp()
    });

    return transactionId;
  }

  // Reward bug report
  async rewardBugReport(
    userId: string,
    bugReportId: string,
    amount: number = CREDITS_CONFIG.BUG_REPORT_REWARD
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const creditsDoc = doc(db, this.creditsCollection, userId);
        const creditsSnap = await transaction.get(creditsDoc);

        if (!creditsSnap.exists()) {
          // Initialize if doesn't exist
          transaction.set(creditsDoc, {
            userId,
            totalCredits: amount,
            pendingCredits: 0,
            lifetimeEarned: amount,
            lifetimeRedeemed: 0,
            lastUpdated: serverTimestamp()
          });
        } else {
          // Update existing
          transaction.update(creditsDoc, {
            totalCredits: increment(amount),
            lifetimeEarned: increment(amount),
            lastUpdated: serverTimestamp()
          });
        }
      });

      // Add transaction record
      await this.addTransaction(
        userId,
        'bug_reward',
        amount,
        `Reward for validated bug report`,
        { bugReportId }
      );
    } catch (error) {
      console.error('Error rewarding bug report:', error);
      throw new Error('Failed to reward bug report');
    }
  }

  // Redeem for premium
  async redeemPremium(
    userId: string,
    userEmail: string,
    plan: 'monthly' | 'yearly'
  ): Promise<void> {
    const requiredCredits = plan === 'monthly' 
      ? CREDITS_CONFIG.PREMIUM_MONTHLY_CREDITS 
      : CREDITS_CONFIG.PREMIUM_YEARLY_CREDITS;

    try {
      await runTransaction(db, async (transaction) => {
        const creditsDoc = doc(db, this.creditsCollection, userId);
        const creditsSnap = await transaction.get(creditsDoc);

        if (!creditsSnap.exists()) {
          throw new Error('Credits not found');
        }

        const credits = creditsSnap.data() as UserCredits;
        
        if (credits.totalCredits < requiredCredits) {
          throw new Error('Insufficient credits');
        }

        // Deduct credits
        transaction.update(creditsDoc, {
          totalCredits: increment(-requiredCredits),
          lifetimeRedeemed: increment(requiredCredits),
          lastUpdated: serverTimestamp()
        });
      });

      // Upgrade user to premium
      const days = plan === 'monthly' ? 30 : 365;
      await premiumUserService.upgradeToPremium(
        userId,
        userEmail,
        plan,
        days,
        'credits_redemption'
      );

      // Add transaction record
      await this.addTransaction(
        userId,
        'redeem_premium',
        -requiredCredits,
        `Redeemed ${plan} premium subscription`,
        { premiumPlan: plan }
      );
    } catch (error) {
      console.error('Error redeeming premium:', error);
      throw error;
    }
  }

  // Gift premium to friend
  async giftPremium(
    senderId: string,
    senderEmail: string,
    recipientEmail: string,
    plan: 'monthly' | 'yearly'
  ): Promise<string> {
    const requiredCredits = plan === 'monthly' 
      ? CREDITS_CONFIG.PREMIUM_MONTHLY_CREDITS 
      : CREDITS_CONFIG.PREMIUM_YEARLY_CREDITS;

    try {
      // Check and deduct credits
      await runTransaction(db, async (transaction) => {
        const creditsDoc = doc(db, this.creditsCollection, senderId);
        const creditsSnap = await transaction.get(creditsDoc);

        if (!creditsSnap.exists()) {
          throw new Error('Credits not found');
        }

        const credits = creditsSnap.data() as UserCredits;
        
        if (credits.totalCredits < requiredCredits) {
          throw new Error('Insufficient credits');
        }

        // Deduct credits
        transaction.update(creditsDoc, {
          totalCredits: increment(-requiredCredits),
          lifetimeRedeemed: increment(requiredCredits),
          lastUpdated: serverTimestamp()
        });
      });

      // Create gift record
      const giftId = `gift_${Date.now()}_${senderId}`;
      const redeemCode = this.generateRedeemCode();
      
      const gift: Omit<GiftPremium, 'id'> = {
        senderId,
        senderEmail,
        recipientEmail,
        premiumPlan: plan,
        creditsUsed: requiredCredits,
        redeemCode,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date()
      };

      await setDoc(doc(db, this.giftsCollection, giftId), {
        ...gift,
        createdAt: serverTimestamp(),
        expiresAt: serverTimestamp()
      });

      // Add transaction record
      await this.addTransaction(
        senderId,
        'gift_premium',
        -requiredCredits,
        `Gifted ${plan} premium to ${recipientEmail}`,
        { recipientEmail, premiumPlan: plan }
      );

      // TODO: Send email to recipient with redeem code

      return redeemCode;
    } catch (error) {
      console.error('Error gifting premium:', error);
      throw error;
    }
  }

  // Create payout request
  async createPayoutRequest(
    userId: string,
    userEmail: string,
    amount: number,
    paymentMethod: 'upi' | 'bank',
    paymentDetails: PayoutRequest['paymentDetails'],
    userName?: string
  ): Promise<string> {
    if (amount < CREDITS_CONFIG.MINIMUM_PAYOUT) {
      throw new Error(`Minimum payout is ${CREDITS_CONFIG.MINIMUM_PAYOUT} credits`);
    }

    try {
      // Check balance
      const credits = await this.getUserCredits(userId);
      if (!credits || credits.totalCredits < amount) {
        throw new Error('Insufficient credits');
      }

      // Create payout request
      const requestId = `payout_${Date.now()}_${userId}`;
      
      const payoutRequest: Omit<PayoutRequest, 'id'> = {
        userId,
        userEmail,
        userName,
        amount: amount * CREDITS_CONFIG.CREDIT_VALUE, // Convert to money
        credits: amount,
        paymentMethod,
        paymentDetails,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, this.payoutRequestsCollection, requestId), {
        ...payoutRequest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Put credits on hold (move to pending)
      await updateDoc(doc(db, this.creditsCollection, userId), {
        totalCredits: increment(-amount),
        pendingCredits: increment(amount),
        lastUpdated: serverTimestamp()
      });

      return requestId;
    } catch (error) {
      console.error('Error creating payout request:', error);
      throw error;
    }
  }

  // Process payout (admin only)
  async processPayout(
    requestId: string,
    adminId: string,
    status: 'completed' | 'rejected',
    transactionId?: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      const payoutDoc = await getDoc(doc(db, this.payoutRequestsCollection, requestId));
      
      if (!payoutDoc.exists()) {
        throw new Error('Payout request not found');
      }

      const payout = payoutDoc.data() as PayoutRequest;
      
      if (payout.status !== 'pending') {
        throw new Error('Payout request has already been processed');
      }

      await runTransaction(db, async (transaction) => {
        const creditsDoc = doc(db, this.creditsCollection, payout.userId);

        if (status === 'completed') {
          // Deduct pending credits permanently
          transaction.update(creditsDoc, {
            pendingCredits: increment(-payout.credits),
            lifetimeRedeemed: increment(payout.credits),
            lastUpdated: serverTimestamp()
          });

          // Update payout request
          transaction.update(doc(db, this.payoutRequestsCollection, requestId), {
            status: 'completed',
            processedBy: adminId,
            processedAt: serverTimestamp(),
            transactionId,
            adminNotes,
            updatedAt: serverTimestamp()
          });
        } else {
          // Return credits to available balance
          transaction.update(creditsDoc, {
            totalCredits: increment(payout.credits),
            pendingCredits: increment(-payout.credits),
            lastUpdated: serverTimestamp()
          });

          // Update payout request
          transaction.update(doc(db, this.payoutRequestsCollection, requestId), {
            status: 'rejected',
            processedBy: adminId,
            processedAt: serverTimestamp(),
            adminNotes,
            updatedAt: serverTimestamp()
          });
        }
      });

      // Add transaction record
      if (status === 'completed') {
        await this.addTransaction(
          payout.userId,
          'payout',
          -payout.credits,
          `Payout of ₹${payout.amount} completed`,
          { payoutRequestId: requestId }
        );
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  // Get user transactions
  async getUserTransactions(
    userId: string,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    transactions: CreditTransaction[];
    lastDoc: DocumentSnapshot | null;
  }> {
    try {
      let q = query(
        collection(db, this.transactionsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const transactions: CreditTransaction[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as CreditTransaction);
      });

      const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      return { transactions, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  // Get all payout requests (admin only)
  async getPayoutRequests(
    status?: PayoutRequest['status']
  ): Promise<PayoutRequest[]> {
    try {
      let q = query(
        collection(db, this.payoutRequestsCollection),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, this.payoutRequestsCollection),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const requests: PayoutRequest[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          processedAt: data.processedAt?.toDate()
        } as PayoutRequest);
      });

      return requests;
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      throw new Error('Failed to fetch payout requests');
    }
  }

  // Generate unique redeem code
  private generateRedeemCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}

export const creditsService = new CreditsService();
