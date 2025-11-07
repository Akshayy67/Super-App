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
  premiumMonths?: number; // Number of months to grant (for referral type)
  type?: "referral" | "discount" | "voucher"; // Type of code (defaults to "referral" for backward compatibility)
  discountPercentage?: number; // Discount percentage (for discount type, e.g., 50 for 50% off)
  voucherName?: string; // Custom name/prefix for voucher type
  description?: string; // Optional description
  worksForStudent?: boolean; // Whether voucher/discount works for student plans (default: true for backward compatibility)
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(prefix?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters
  let code = prefix ? prefix.toUpperCase() : '';
  
  // Generate random suffix (8 characters if no prefix, or remaining to make total 8-12 chars)
  const suffixLength = prefix ? Math.max(6, 12 - prefix.length) : 8;
  for (let i = 0; i < suffixLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new referral code (admin only)
 */
export async function createReferralCode(
  adminUserId: string,
  options: {
    type?: "referral" | "discount" | "voucher";
    premiumMonths?: number;
    discountPercentage?: number;
    voucherName?: string;
    description?: string;
    worksForStudent?: boolean; // Whether code works for student plans
  } = {}
): Promise<string> {
  try {
    const {
      type = "referral",
      premiumMonths = 1,
      discountPercentage,
      voucherName,
      description,
      worksForStudent = true, // Default to true for backward compatibility
    } = options;

    let code: string;
    let isUnique = false;
    let attempts = 0;
    
    // Generate unique code (max 10 attempts)
    while (!isUnique && attempts < 10) {
      // For voucher type, use the voucher name as prefix
      const prefix = type === "voucher" && voucherName ? voucherName : undefined;
      code = generateReferralCode(prefix);
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
      type,
      ...(type === "referral" && { premiumMonths }),
      ...(type === "discount" && { discountPercentage: discountPercentage || 50 }),
      ...(type === "voucher" && voucherName && { voucherName }),
      ...(description && { description }),
      // Only set worksForStudent if explicitly provided (for vouchers and discounts)
      ...((type === "voucher" || type === "discount") && { worksForStudent }),
    };
    
    await setDoc(doc(db, REFERRAL_CODES_COLLECTION, code!), referralCode);
    console.log(`✅ ${type} code created: ${code}`);
    
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
 * Validate a discount code (doesn't mark as used - that happens during payment)
 */
export async function validateDiscountCode(
  code: string
): Promise<{ valid: boolean; discountPercentage?: number; error?: string }> {
  try {
    const discountCode = await getReferralCode(code.toUpperCase());
    
    if (!discountCode) {
      return { valid: false, error: "Invalid discount code" };
    }
    
    if (discountCode.type !== "discount") {
      return { valid: false, error: "This is not a discount code" };
    }
    
    if (discountCode.isUsed) {
      return { valid: false, error: "This discount code has already been used" };
    }
    
    return { 
      valid: true, 
      discountPercentage: discountCode.discountPercentage || 50 
    };
  } catch (error: any) {
    console.error("Error validating discount code:", error);
    return { valid: false, error: error.message || "Failed to validate discount code" };
  }
}

/**
 * Apply a discount code (marks it as used after successful payment)
 */
export async function applyDiscountCode(
  code: string,
  userId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, REFERRAL_CODES_COLLECTION, code.toUpperCase()), {
      isUsed: true,
      usedBy: userId,
      usedAt: serverTimestamp(),
    });
    console.log(`✅ Discount code ${code} applied by user ${userId}`);
  } catch (error) {
    console.error("Error applying discount code:", error);
    throw error;
  }
}

/**
 * Redeem a referral code or voucher and grant premium access
 */
export async function redeemReferralCode(
  code: string,
  userId: string,
  userEmail: string,
  planType?: "monthly" | "yearly" | "student"
): Promise<{ success: boolean; premiumMonths?: number; error?: string; codeType?: string }> {
  try {
    const referralCode = await getReferralCode(code.toUpperCase());
    
    if (!referralCode) {
      return { success: false, error: "Invalid code" };
    }
    
    // Discount codes should be validated separately, not redeemed here
    if (referralCode.type === "discount") {
      return { 
        success: false, 
        error: "This is a discount code. Please apply it during payment.",
        codeType: "discount"
      };
    }
    
    if (referralCode.isUsed) {
      return { success: false, error: "This code has already been used" };
    }
    
    // Default to "referral" for backward compatibility
    const codeType = referralCode.type || "referral";
    
    // Only referral and voucher types grant premium access
    if (codeType !== "referral" && codeType !== "voucher") {
      return { success: false, error: "Invalid code type" };
    }
    
    // Check if voucher works for student plans
    if (planType === "student" && codeType === "voucher" && referralCode.worksForStudent === false) {
      return { 
        success: false, 
        error: "This voucher cannot be used with student plans" 
      };
    }
    
    // Mark code as used
    await updateDoc(doc(db, REFERRAL_CODES_COLLECTION, code.toUpperCase()), {
      isUsed: true,
      usedBy: userId,
      usedAt: serverTimestamp(),
    });
    
    // Grant premium access (vouchers default to 1 month if no premiumMonths specified)
    const premiumMonths = referralCode.premiumMonths || 1;
    const { createPremiumUser } = await import("./premiumUserService");
    
    // Calculate end date based on premium months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + premiumMonths);
    
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
      newEndDate.setMonth(newEndDate.getMonth() + premiumMonths);
      
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
    
    const codeTypeLabel = codeType === "voucher" ? "Voucher" : "Referral code";
    console.log(`✅ ${codeTypeLabel} ${code} redeemed by ${userEmail}. Premium granted for ${premiumMonths} month(s)`);
    
    return { success: true, premiumMonths, codeType };
  } catch (error: any) {
    console.error("Error redeeming code:", error);
    return { success: false, error: error.message || "Failed to redeem code" };
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

