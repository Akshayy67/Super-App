import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage, auth } from "../config/firebase";
import { UserProfile } from "../types";
import { FILE_SIZE_LIMITS } from "../utils/firestoreHelpers";

const PROFILES_COLLECTION = "profiles";
const MAX_PROFILE_PHOTO_SIZE = 500 * 1024; // 500KB for base64 (safe limit for profile photos)

/**
 * Profile Service
 * Handles user profile operations including CRUD and photo uploads
 */
export class ProfileService {
  /**
   * Get profile by user ID
   */
  static async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const profilesRef = collection(db, PROFILES_COLLECTION);
      const q = query(profilesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      // Use photoBase64 as photoURL if photoURL doesn't exist (for backward compatibility)
      const photoURL = data.photoURL || data.photoBase64 || null;
      return {
        id: doc.id,
        ...data,
        photoURL,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || new Date().toISOString(),
      } as UserProfile;
    } catch (error) {
      console.error("Error getting profile by userId:", error);
      throw error;
    }
  }

  /**
   * Get profile by username
   */
  static async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const profilesRef = collection(db, PROFILES_COLLECTION);
      const q = query(profilesRef, where("username", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      // Use photoBase64 as photoURL if photoURL doesn't exist (for backward compatibility)
      const photoURL = data.photoURL || data.photoBase64 || null;
      return {
        id: doc.id,
        ...data,
        photoURL,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || new Date().toISOString(),
      } as UserProfile;
    } catch (error) {
      console.error("Error getting profile by username:", error);
      throw error;
    }
  }

  /**
   * Get profile by email
   */
  static async getProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const profilesRef = collection(db, PROFILES_COLLECTION);
      const q = query(profilesRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      // Use photoBase64 as photoURL if photoURL doesn't exist (for backward compatibility)
      const photoURL = data.photoURL || data.photoBase64 || null;
      return {
        id: doc.id,
        ...data,
        photoURL,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || new Date().toISOString(),
      } as UserProfile;
    } catch (error) {
      console.error("Error getting profile by email:", error);
      throw error;
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const profilesRef = collection(db, PROFILES_COLLECTION);
      const q = query(profilesRef, where("username", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return true;
      }

      // If checking for existing user, allow if it's their own username
      if (excludeUserId) {
        const existingProfile = querySnapshot.docs[0].data() as UserProfile;
        return existingProfile.userId === excludeUserId;
      }

      return false;
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw error;
    }
  }

  /**
   * Create or update profile
   */
  static async upsertProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      // Check if profile exists
      const existingProfile = await this.getProfileByUserId(userId);

      if (existingProfile) {
        // Update existing profile
        const profileRef = doc(db, PROFILES_COLLECTION, existingProfile.id);
        await updateDoc(profileRef, {
          ...profileData,
          updatedAt: serverTimestamp(),
        });

        const updatedDoc = await getDoc(profileRef);
        const data = updatedDoc.data();
        return {
          id: updatedDoc.id,
          ...data,
          createdAt: data?.createdAt?.toDate?.().toISOString() || data?.createdAt || new Date().toISOString(),
          updatedAt: data?.updatedAt?.toDate?.().toISOString() || data?.updatedAt || new Date().toISOString(),
        } as UserProfile;
      } else {
        // Create new profile
        const profileRef = doc(collection(db, PROFILES_COLLECTION));
        const newProfile = {
          userId,
          username: profileData.username || "",
          email: profileData.email || "",
          photoURL: profileData.photoURL || null,
          photoBase64: profileData.photoBase64 || null,
          phoneNumber: profileData.phoneNumber || null,
          bio: profileData.bio || null,
          location: profileData.location || null,
          website: profileData.website || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(profileRef, newProfile);

        const createdDoc = await getDoc(profileRef);
        const data = createdDoc.data();
        return {
          id: createdDoc.id,
          ...data,
          createdAt: data?.createdAt?.toDate?.().toISOString() || data?.createdAt || new Date().toISOString(),
          updatedAt: data?.updatedAt?.toDate?.().toISOString() || data?.updatedAt || new Date().toISOString(),
        } as UserProfile;
      }
    } catch (error) {
      console.error("Error upserting profile:", error);
      throw error;
    }
  }

  /**
   * Convert file to base64 data URL (FREE - no Firebase Storage needed)
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress image to reduce file size for Firestore storage
   */
  private static async compressImage(file: File, maxSizeKB: number = 500): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions (max 800x800 while maintaining aspect ratio)
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to get under size limit
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                
                const sizeKB = blob.size / 1024;
                if (sizeKB > maxSizeKB && quality > 0.3) {
                  quality -= 0.1;
                  tryCompress();
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };
          
          tryCompress();
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload profile photo (FREE - stores as base64 in Firestore, no Firebase Storage needed)
   */
  static async uploadProfilePhoto(
    userId: string,
    file: File
  ): Promise<string> {
    try {
      // Wait for auth to be ready
      await new Promise<void>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve();
        });
      });

      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to upload photos");
      }

      // Verify the userId matches the authenticated user
      if (auth.currentUser.uid !== userId) {
        throw new Error("User ID mismatch");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Compress image if needed (target: 500KB for Firestore)
      let processedFile = file;
      if (file.size > MAX_PROFILE_PHOTO_SIZE) {
        console.log("📦 Compressing image to fit Firestore limit (500KB)...");
        processedFile = await this.compressImage(file, 500);
        console.log(`✅ Compressed from ${Math.round(file.size / 1024)}KB to ${Math.round(processedFile.size / 1024)}KB`);
      }

      // Final size check
      if (processedFile.size > MAX_PROFILE_PHOTO_SIZE) {
        throw new Error(`Image is too large (${Math.round(processedFile.size / 1024)}KB). Maximum size is 500KB. Please use a smaller image.`);
      }

      // Convert to base64 (FREE - stored in Firestore)
      console.log("📄 Converting image to base64 for free Firestore storage...");
      const base64DataURL = await this.fileToBase64(processedFile);

      // Update profile with base64 photo (FREE - no Firebase Storage needed!)
      await this.upsertProfile(userId, { 
        photoBase64: base64DataURL,
        photoURL: base64DataURL // Also set as URL for compatibility with existing code
      });

      console.log("✅ Photo stored in Firestore (100% FREE - no Storage needed!)");
      return base64DataURL;
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      console.error("Error details:", {
        message: error.message,
        currentUser: auth.currentUser?.uid,
        userId: userId,
      });
      
      // Provide helpful error messages
      if (error.message?.includes('too large')) {
        throw error; // Re-throw size errors as-is
      } else if (error.message?.includes('Failed to compress')) {
        throw new Error("Failed to process image. Please try a different image file.");
      }
      throw error;
    }
  }

  /**
   * Delete profile photo
   */
  static async deleteProfilePhoto(userId: string): Promise<void> {
    try {
      // Remove photo from profile (FREE - just updates Firestore)
      await this.upsertProfile(userId, { 
        photoURL: null,
        photoBase64: null 
      });
      console.log("✅ Photo deleted from profile (FREE - no Storage needed)");
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      throw error;
    }
  }

  /**
   * Update profile fields
   */
  static async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      // Don't allow updating userId or id
      const { id, userId: _, ...safeUpdates } = updates as any;

      return await this.upsertProfile(userId, safeUpdates);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
}

export default ProfileService;

