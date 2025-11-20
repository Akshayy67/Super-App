// Bug Report and Credits System Types

export interface BugReport {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  title: string;
  description: string;
  screenshots?: string[];
  deviceInfo?: DeviceInfo;
  status: 'pending' | 'validated' | 'invalid';
  adminNotes?: string;
  validatedBy?: string;
  validatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenResolution?: string;
  browserVersion?: string;
  appVersion?: string;
}

export interface UserCredits {
  userId: string;
  totalCredits: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  lastUpdated: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'bug_reward' | 'redeem_premium' | 'gift_premium' | 'payout' | 'bonus' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  metadata?: {
    bugReportId?: string;
    recipientEmail?: string;
    premiumPlan?: string;
    payoutRequestId?: string;
  };
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amount: number;
  credits: number;
  paymentMethod: 'upi' | 'bank';
  paymentDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftPremium {
  id: string;
  senderId: string;
  senderEmail: string;
  recipientEmail: string;
  premiumPlan: 'monthly' | 'yearly';
  creditsUsed: number;
  redeemCode: string;
  status: 'pending' | 'redeemed' | 'expired';
  redeemedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

// Constants
export const CREDITS_CONFIG = {
  BUG_REPORT_REWARD: 10,
  CREDIT_VALUE: 1, // 1 credit = ₹1
  MINIMUM_PAYOUT: 100,
  PREMIUM_MONTHLY_CREDITS: 99,
  PREMIUM_YEARLY_CREDITS: 999,
  GIFT_GITHUB_PREMIUM_CREDITS: 199,
};

export const BUG_STATUS_LABELS = {
  pending: 'Pending Review',
  validated: 'Validated',
  invalid: 'Invalid'
} as const;

export const TRANSACTION_TYPE_LABELS = {
  bug_reward: 'Bug Report Reward',
  redeem_premium: 'Premium Subscription',
  gift_premium: 'Premium Gift',
  payout: 'Cash Payout',
  bonus: 'Bonus Credits',
  refund: 'Refund'
} as const;
