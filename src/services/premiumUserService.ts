/**
 * Premium User Service
 * Handles premium user status checks and subscription management
 */

import { db } from "../config/firebase";
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, deleteField } from "firebase/firestore";

const PREMIUM_USERS_COLLECTION = "premium_users";

// Creator email - gets automatic premium access
const CREATOR_EMAIL = "akshayjuluri6704@gmail.com";

export interface PremiumUser {
  userId: string;
  email: string;
  isPremium: boolean;
  subscriptionType?: "monthly" | "yearly" | "student" | "lifetime";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  studentVerified?: boolean;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Check if a user is premium (includes expiration check)
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  try {
    const premiumDoc = await getDoc(doc(db, PREMIUM_USERS_COLLECTION, userId));
    if (!premiumDoc.exists()) {
      return false;
    }
    const data = premiumDoc.data();
    
    // Check if premium is active
    if (data.isPremium !== true) {
      return false;
    }
    
    // Check if subscription has expired (unless it's lifetime)
    if (data.subscriptionType !== "lifetime" && data.subscriptionEndDate) {
      const endDate = new Date(data.subscriptionEndDate);
      const now = new Date();
      if (endDate < now) {
        // Subscription expired - revoke premium
        console.log(`⚠️ Subscription expired for user ${userId}, revoking premium`);
        await revokePremium(userId);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking if user is premium:", error);
    return false;
  }
}

/**
 * Check if a user is premium by email
 */
export async function isPremiumUserByEmail(email: string): Promise<boolean> {
  try {
    const emailLower = email.toLowerCase();
    
    // Creator email always has premium access
    if (emailLower === CREATOR_EMAIL.toLowerCase()) {
      console.log("✅ Creator email detected - granting premium access");
      // Ensure creator has premium record in database
      try {
        const user = await import("../utils/realTimeAuth").then(m => m.realTimeAuth.getCurrentUser());
        if (user) {
          await ensureCreatorPremium(user.id, emailLower);
        }
      } catch (error) {
        console.error("Error ensuring creator premium:", error);
      }
      return true;
    }
    
    const q = query(
      collection(db, PREMIUM_USERS_COLLECTION),
      where("email", "==", emailLower)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return false;
    }
    
    const premiumDoc = querySnapshot.docs[0];
    const data = premiumDoc.data();
    return data.isPremium === true;
  } catch (error) {
    console.error("Error checking if user is premium by email:", error);
    return false;
  }
}

/**
 * Get premium user info
 */
export async function getPremiumUser(userId: string): Promise<PremiumUser | null> {
  try {
    const premiumDoc = await getDoc(doc(db, PREMIUM_USERS_COLLECTION, userId));
    if (!premiumDoc.exists()) {
      return null;
    }
    return {
      userId: premiumDoc.id,
      ...premiumDoc.data(),
    } as PremiumUser;
  } catch (error) {
    console.error("Error getting premium user:", error);
    return null;
  }
}

/**
 * Create premium user record
 */
export async function createPremiumUser(
  userId: string,
  email: string,
  subscriptionType: "monthly" | "yearly" | "student" | "lifetime",
  studentVerified?: boolean
): Promise<void> {
  try {
    // Build premium user object - don't include subscriptionEndDate for lifetime subscriptions
    const premiumUser: any = {
      userId,
      email: email.toLowerCase(),
      isPremium: true,
      subscriptionType,
      subscriptionStartDate: new Date().toISOString(),
      studentVerified: studentVerified || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Only add subscriptionEndDate if it's not a lifetime subscription
    if (subscriptionType !== "lifetime") {
      premiumUser.subscriptionEndDate = subscriptionType === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    await setDoc(doc(db, PREMIUM_USERS_COLLECTION, userId), premiumUser);
    console.log(`✅ User ${email} upgraded to premium`);
  } catch (error) {
    console.error("Error creating premium user:", error);
    throw error;
  }
}

/**
 * Update premium user subscription
 */
export async function updatePremiumSubscription(
  userId: string,
  subscriptionType: "monthly" | "yearly" | "student" | "lifetime"
): Promise<void> {
  try {
    const premiumRef = doc(db, PREMIUM_USERS_COLLECTION, userId);
    const updates: any = {
      subscriptionType,
      isPremium: true,
      updatedAt: new Date().toISOString(),
    };

    if (subscriptionType === "lifetime") {
      // Remove subscriptionEndDate for lifetime subscriptions
      updates.subscriptionEndDate = deleteField();
    } else {
      // Set subscriptionEndDate for non-lifetime subscriptions
      updates.subscriptionEndDate = subscriptionType === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    await updateDoc(premiumRef, updates);
    console.log(`✅ Updated premium subscription for user ${userId}`);
  } catch (error) {
    console.error("Error updating premium subscription:", error);
    throw error;
  }
}

/**
 * Revoke premium status
 */
export async function revokePremium(userId: string): Promise<void> {
  try {
    const premiumRef = doc(db, PREMIUM_USERS_COLLECTION, userId);
    await updateDoc(premiumRef, {
      isPremium: false,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ Premium revoked for user ${userId}`);
  } catch (error) {
    console.error("Error revoking premium:", error);
    throw error;
  }
}

/**
 * Ensure creator has premium access (called automatically)
 */
async function ensureCreatorPremium(userId: string, email: string): Promise<void> {
  try {
    const premiumDoc = await getDoc(doc(db, PREMIUM_USERS_COLLECTION, userId));
    
    if (!premiumDoc.exists()) {
      // Create premium record for creator - don't include subscriptionEndDate for lifetime
      const premiumUser: any = {
        userId,
        email: email.toLowerCase(),
        isPremium: true,
        subscriptionType: "lifetime",
        subscriptionStartDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, PREMIUM_USERS_COLLECTION, userId), premiumUser);
      console.log(`✅ Creator premium access granted: ${email}`);
    } else {
      // Update existing record to ensure premium status
      const data = premiumDoc.data();
      if (!data.isPremium || data.subscriptionType !== "lifetime") {
        // Remove subscriptionEndDate if it exists (for lifetime subscriptions)
        const updates: any = {
          isPremium: true,
          subscriptionType: "lifetime",
          subscriptionEndDate: deleteField(), // Remove the field for lifetime subscriptions
          updatedAt: new Date().toISOString(),
        };
        
        await updateDoc(doc(db, PREMIUM_USERS_COLLECTION, userId), updates);
        console.log(`✅ Creator premium access updated: ${email}`);
      }
    }
  } catch (error) {
    console.error("Error ensuring creator premium:", error);
  }
}

/**
 * Check if email is creator email
 */
export function isCreatorEmail(email: string): boolean {
  return email.toLowerCase() === CREATOR_EMAIL.toLowerCase();
}

/**
 * Get all premium users
 */
export async function getAllPremiumUsers(): Promise<PremiumUser[]> {
  try {
    const premiumUsersRef = collection(db, PREMIUM_USERS_COLLECTION);
    const querySnapshot = await getDocs(premiumUsersRef);
    
    const premiumUsers: PremiumUser[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to ISO strings if needed
      const processedData: any = { ...data };
      if (data.subscriptionStartDate?.toDate) {
        processedData.subscriptionStartDate = data.subscriptionStartDate.toDate().toISOString();
      } else if (data.subscriptionStartDate?.seconds) {
        processedData.subscriptionStartDate = new Date(data.subscriptionStartDate.seconds * 1000).toISOString();
      }
      
      if (data.subscriptionEndDate?.toDate) {
        processedData.subscriptionEndDate = data.subscriptionEndDate.toDate().toISOString();
      } else if (data.subscriptionEndDate?.seconds) {
        processedData.subscriptionEndDate = new Date(data.subscriptionEndDate.seconds * 1000).toISOString();
      }
      
      if (data.createdAt?.toDate) {
        processedData.createdAt = data.createdAt.toDate().toISOString();
      } else if (data.createdAt?.seconds) {
        processedData.createdAt = new Date(data.createdAt.seconds * 1000).toISOString();
      }
      
      if (data.updatedAt?.toDate) {
        processedData.updatedAt = data.updatedAt.toDate().toISOString();
      } else if (data.updatedAt?.seconds) {
        processedData.updatedAt = new Date(data.updatedAt.seconds * 1000).toISOString();
      }
      
      premiumUsers.push({
        userId: doc.id,
        ...processedData,
      } as PremiumUser);
    });
    
    // Sort by subscription end date (expired first, then by date)
    premiumUsers.sort((a, b) => {
      if (!a.subscriptionEndDate && !b.subscriptionEndDate) return 0;
      if (!a.subscriptionEndDate) return 1; // Lifetime subscriptions last
      if (!b.subscriptionEndDate) return -1;
      
      const dateA = new Date(a.subscriptionEndDate).getTime();
      const dateB = new Date(b.subscriptionEndDate).getTime();
      const now = Date.now();
      
      // Expired subscriptions first
      if (dateA < now && dateB >= now) return -1;
      if (dateA >= now && dateB < now) return 1;
      
      // Then sort by date (earliest first)
      return dateA - dateB;
    });
    
    return premiumUsers;
  } catch (error) {
    console.error("Error getting all premium users:", error);
    return [];
  }
}

