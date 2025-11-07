/**
 * Student Verification Service
 * Handles student verification requests and manual approval
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

const STUDENT_VERIFICATION_COLLECTION = "student_verifications";
const PREMIUM_USERS_COLLECTION = "premium_users";

export interface StudentVerification {
  id: string;
  userId: string;
  email: string;
  mobileNumber?: string; // User's mobile number
  status: "pending" | "approved" | "rejected";
  submittedAt: any; // Firestore timestamp
  reviewedAt?: any; // Firestore timestamp
  reviewedBy?: string; // Admin user ID
  rejectionReason?: string;
  studentId?: string; // Student ID number
  institution?: string; // School/University name
  notes?: string; // Additional notes from user
}

/**
 * Create a student verification request
 */
export async function createStudentVerificationRequest(
  userId: string,
  email: string,
  mobileNumber?: string,
  studentId?: string,
  institution?: string,
  notes?: string
): Promise<string> {
  try {
    const verificationRef = doc(collection(db, STUDENT_VERIFICATION_COLLECTION));
    
    const verification: Omit<StudentVerification, 'id'> & { submittedAt: any } = {
      userId,
      email: email.toLowerCase(),
      status: "pending",
      submittedAt: serverTimestamp(),
      ...(mobileNumber && { mobileNumber }),
      ...(studentId && { studentId }),
      ...(institution && { institution }),
      ...(notes && { notes }),
    };
    
    await setDoc(verificationRef, verification);
    console.log(`✅ Student verification request created for ${email}`);
    
    return verificationRef.id;
  } catch (error) {
    console.error("Error creating student verification request:", error);
    throw error;
  }
}

/**
 * Get student verification request by user ID
 */
export async function getStudentVerificationByUserId(
  userId: string
): Promise<StudentVerification | null> {
  try {
    const q = query(
      collection(db, STUDENT_VERIFICATION_COLLECTION),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as StudentVerification;
  } catch (error) {
    console.error("Error getting student verification:", error);
    return null;
  }
}

/**
 * Get all pending student verification requests (admin only)
 */
export async function getAllPendingStudentVerifications(): Promise<StudentVerification[]> {
  try {
    const q = query(
      collection(db, STUDENT_VERIFICATION_COLLECTION),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as StudentVerification));
  } catch (error) {
    console.error("Error getting pending student verifications:", error);
    return [];
  }
}

/**
 * Get all student verification requests (admin only)
 */
export async function getAllStudentVerifications(): Promise<StudentVerification[]> {
  try {
    const querySnapshot = await getDocs(collection(db, STUDENT_VERIFICATION_COLLECTION));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as StudentVerification));
  } catch (error) {
    console.error("Error getting all student verifications:", error);
    return [];
  }
}

/**
 * Approve student verification (admin only)
 * Sends email to student with payment gateway link instead of granting premium
 */
export async function approveStudentVerification(
  verificationId: string,
  adminUserId: string
): Promise<void> {
  try {
    const verificationRef = doc(db, STUDENT_VERIFICATION_COLLECTION, verificationId);
    const verificationDoc = await getDoc(verificationRef);
    
    if (!verificationDoc.exists()) {
      throw new Error("Verification request not found");
    }
    
    const verification = verificationDoc.data() as StudentVerification;
    
    // Update verification status
    await updateDoc(verificationRef, {
      status: "approved",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUserId,
    });
    
    // Mark student as verified but DON'T grant premium - they need to pay
    const premiumRef = doc(db, PREMIUM_USERS_COLLECTION, verification.userId);
    const premiumDoc = await getDoc(premiumRef);
    
    if (premiumDoc.exists()) {
      await updateDoc(premiumRef, {
        studentVerified: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create record marking student as verified but NOT premium
      await setDoc(premiumRef, {
        userId: verification.userId,
        email: verification.email,
        isPremium: false, // NOT granting premium - they need to pay
        subscriptionType: "student",
        studentVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Send email to student with payment gateway link
    try {
      const { EmailJSService } = await import("../utils/emailJSService");
      const emailService = new EmailJSService();
      
      const paymentUrl = `${window.location.origin}/payment?studentApproved=true`;
      const emailSubject = "🎓 Student Verification Approved - Complete Your Payment";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Congratulations! Your Student Verification Has Been Approved</h2>
          <p>Dear Student,</p>
          <p>Great news! Your student verification request has been approved by our admin team.</p>
          <p>To complete your student subscription and unlock premium features, please complete your payment:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Complete Payment Now
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${paymentUrl}</p>
          <p>Thank you for choosing Super Study!</p>
          <p>Best regards,<br>Super Study Team</p>
        </div>
      `;
      
      await emailService.sendTeamInvite({
        to: verification.email,
        subject: emailSubject,
        html: emailHtml,
        text: `Your student verification has been approved. Please complete your payment at: ${paymentUrl}`,
      });
      
      console.log(`✅ Approval email sent to ${verification.email}`);
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // Don't throw - approval should still succeed even if email fails
    }
    
    console.log(`✅ Student verification approved for ${verification.email} - email sent with payment link`);
  } catch (error) {
    console.error("Error approving student verification:", error);
    throw error;
  }
}

/**
 * Reject student verification (admin only)
 */
export async function rejectStudentVerification(
  verificationId: string,
  adminUserId: string,
  rejectionReason?: string
): Promise<void> {
  try {
    const verificationRef = doc(db, STUDENT_VERIFICATION_COLLECTION, verificationId);
    const verificationDoc = await getDoc(verificationRef);
    
    if (!verificationDoc.exists()) {
      throw new Error("Verification request not found");
    }
    
    const verification = verificationDoc.data() as StudentVerification;
    
    // Update verification status
    await updateDoc(verificationRef, {
      status: "rejected",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUserId,
      ...(rejectionReason && { rejectionReason }),
    });
    
    // Revoke premium if user had student plan
    const premiumRef = doc(db, PREMIUM_USERS_COLLECTION, verification.userId);
    const premiumDoc = await getDoc(premiumRef);
    
    if (premiumDoc.exists()) {
      const premiumData = premiumDoc.data();
      if (premiumData.subscriptionType === "student" && !premiumData.studentVerified) {
        await updateDoc(premiumRef, {
          isPremium: false,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    console.log(`❌ Student verification rejected for ${verification.email}`);
  } catch (error) {
    console.error("Error rejecting student verification:", error);
    throw error;
  }
}

/**
 * Check if user is a verified student
 */
export async function isVerifiedStudent(userId: string): Promise<boolean> {
  try {
    const premiumDoc = await getDoc(doc(db, PREMIUM_USERS_COLLECTION, userId));
    
    if (!premiumDoc.exists()) {
      return false;
    }
    
    const data = premiumDoc.data();
    return data.studentVerified === true && data.subscriptionType === "student";
  } catch (error) {
    console.error("Error checking verified student:", error);
    return false;
  }
}

