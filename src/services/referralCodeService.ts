/**
 * Referral Code Service
 * Handles generating, storing, and redeeming referral codes
 */

import { db } from "../config/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";

const REFERRAL_CODES_COLLECTION = "referral_codes";

export interface ReferralCode {
  code: string;
  createdBy: string; // Admin user ID
  createdAt: any; // Firestore timestamp
  usedBy?: string; // User ID who redeemed it
  usedAt?: any; // Firestore timestamp
  isUsed: boolean;
  premiumMonths: number; // Number of months to grant (default: 1)
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new referral code (admin only)
 */
export async function createReferralCode(
  adminUserId: string,
  premiumMonths: number = 1
): Promise<string> {
  try {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    
    // Generate unique code (max 10 attempts)
    while (!isUnique && attempts < 10) {
      code = generateReferralCode();
      const codeDoc = await getDoc(doc(db, REFERRAL_CODES_COLLECTION, code));
      
      if (!codeDoc.exists()) {
        isUnique = true;
      } else {
        attempts++;
      }
    }
    
    if (!isUnique) {
      throw new Error("Failed to generate unique code after multiple attempts");
    }
    
    const referralCode: Omit<ReferralCode, 'createdAt'> & { createdAt: any } = {
      code: code!,
      createdBy: adminUserId,
      createdAt: serverTimestamp(),
      isUsed: false,
      premiumMonths,
    };
    
    await setDoc(doc(db, REFERRAL_CODES_COLLECTION, code!), referralCode);
    console.log(`✅ Referral code created: ${code}`);
    
    return code!;
  } catch (error) {
    console.error("Error creating referral code:", error);
    throw error;
  }
}

/**
 * Get referral code by code string
 */
export async function getReferralCode(code: string): Promise<ReferralCode | null> {
  try {
    const codeDoc = await getDoc(doc(db, REFERRAL_CODES_COLLECTION, code.toUpperCase()));
    
    if (!codeDoc.exists()) {
      return null;
    }
    
    return {
      code: codeDoc.id,
      ...codeDoc.data(),
    } as ReferralCode;
  } catch (error) {
    console.error("Error getting referral code:", error);
    return null;
  }
}

/**
 * Check if a referral code is valid and unused
 */
export async function isValidReferralCode(code: string): Promise<boolean> {
  try {
    const referralCode = await getReferralCode(code);
    
    if (!referralCode) {
      return false;
    }
    
    return !referralCode.isUsed;
  } catch (error) {
    console.error("Error checking referral code validity:", error);
    return false;
  }
}

/**
 * Redeem a referral code and grant premium access
 */
export async function redeemReferralCode(
  code: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; premiumMonths?: number; error?: string }> {
  try {
    const referralCode = await getReferralCode(code.toUpperCase());
    
    if (!referralCode) {
      return { success: false, error: "Invalid referral code" };
    }
    
    if (referralCode.isUsed) {
      return { success: false, error: "This referral code has already been used" };
    }
    
    // Mark code as used
    await updateDoc(doc(db, REFERRAL_CODES_COLLECTION, code.toUpperCase()), {
      isUsed: true,
      usedBy: userId,
      usedAt: serverTimestamp(),
    });
    
    // Grant premium access
    const { createPremiumUser } = await import("./premiumUserService");
    
    // Calculate end date based on premium months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + referralCode.premiumMonths);
    
    // Create or update premium user record
    const premiumDoc = await getDoc(doc(db, "premium_users", userId));
    
    if (premiumDoc.exists()) {
      // Get existing premium data
      const existingData = premiumDoc.data();
      const existingEndDate = existingData.subscriptionEndDate 
        ? new Date(existingData.subscriptionEndDate)
        : new Date();
      
      // If user already has premium extending beyond today, extend from existing date
      // Otherwise, start from today
      const startDate = existingEndDate > new Date() ? existingEndDate : new Date();
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + referralCode.premiumMonths);
      
      // Update existing premium user
      await updateDoc(doc(db, "premium_users", userId), {
        isPremium: true,
        subscriptionType: "monthly",
        subscriptionStartDate: existingData.subscriptionStartDate || new Date().toISOString(),
        subscriptionEndDate: newEndDate.toISOString(),
        referralCode: code.toUpperCase(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new premium user
      await createPremiumUser(userId, userEmail, "monthly");
      
      // Update with referral code info and correct end date
      await updateDoc(doc(db, "premium_users", userId), {
        referralCode: code.toUpperCase(),
        subscriptionEndDate: endDate.toISOString(),
      });
    }
    
    console.log(`✅ Referral code ${code} redeemed by ${userEmail}. Premium granted for ${referralCode.premiumMonths} month(s)`);
    
    return { success: true, premiumMonths: referralCode.premiumMonths };
  } catch (error: any) {
    console.error("Error redeeming referral code:", error);
    return { success: false, error: error.message || "Failed to redeem referral code" };
  }
}

/**
 * Get all referral codes (admin only)
 */
export async function getAllReferralCodes(): Promise<ReferralCode[]> {
  try {
    const querySnapshot = await getDocs(collection(db, REFERRAL_CODES_COLLECTION));
    
    return querySnapshot.docs.map(doc => ({
      code: doc.id,
      ...doc.data(),
    } as ReferralCode));
  } catch (error) {
    console.error("Error getting all referral codes:", error);
    return [];
  }
}

/**
 * Get unused referral codes (admin only)
 */
export async function getUnusedReferralCodes(): Promise<ReferralCode[]> {
  try {
    const q = query(
      collection(db, REFERRAL_CODES_COLLECTION),
      where("isUsed", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      code: doc.id,
      ...doc.data(),
    } as ReferralCode));
  } catch (error) {
    console.error("Error getting unused referral codes:", error);
    return [];
  }
}

