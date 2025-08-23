import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { googleDriveService } from './googleDriveService';

export interface SharedFile {
  id: string;
  teamId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: string; // For text files or base64 for small binary files
  url?: string; // For external URLs or Google Drive links
  driveFileId?: string; // Google Drive file ID for large files
  sharedBy: string;
  sharedAt: Date;
  permissions: {
    view: string[]; // User IDs who can view
    edit: string[]; // User IDs who can edit
    admin: string[]; // User IDs who can manage permissions
  };
  tags?: string[];
  description?: string;
  version: number;
  lastModified: Date;
  lastModifiedBy: string;
  storageType: 'firestore' | 'drive' | 'url'; // Where the file is actually stored
}

export interface FileShareData {
  teamId: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  content?: string;
  url?: string;
  file?: File; // For file uploads
  sharedBy: string;
  permissions: {
    view: string[];
    edit: string[];
    admin: string[];
  };
  tags?: string[];
  description?: string;
}

class FileShareService {
  // Share a file with the team
  async shareFile(fileData: FileShareData): Promise<SharedFile> {
    const { teamId, sharedBy } = fileData;

    // Verify user is team member
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[sharedBy]) {
      throw new Error('Access denied: Not a team member');
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let finalFileData: Partial<SharedFile> = {
      id: fileId,
      teamId,
      fileName: fileData.fileName,
      fileType: fileData.fileType || 'unknown',
      fileSize: fileData.fileSize || 0,
      sharedBy,
      permissions: {
        view: fileData.permissions?.view || [sharedBy],
        edit: fileData.permissions?.edit || [sharedBy],
        admin: fileData.permissions?.admin || [sharedBy]
      },
      tags: fileData.tags || [],
      description: fileData.description || '',
      version: 1,
      storageType: 'firestore'
    };

    // Determine storage strategy based on file size and type
    if (fileData.file) {
      // File upload - decide between Firestore and Google Drive
      if (fileData.file.size > 1024 * 1024) { // > 1MB, use Google Drive
        try {
          // Upload to Google Drive
          const driveFile = await googleDriveService.uploadTeamFile(
            fileData.file,
            teamId,
            `shared-files/${fileData.fileName}`
          );
          
          finalFileData.driveFileId = driveFile.id;
          finalFileData.url = driveFile.webViewLink;
          finalFileData.storageType = 'drive';
        } catch (error) {
          console.warn('Failed to upload to Google Drive, falling back to base64:', error);
          // Fallback to base64 in Firestore
          const base64Content = await this.fileToBase64(fileData.file);
          finalFileData.content = base64Content;
          finalFileData.storageType = 'firestore';
        }
      } else {
        // Small file - store as base64 in Firestore
        const base64Content = await this.fileToBase64(fileData.file);
        finalFileData.content = base64Content;
        finalFileData.storageType = 'firestore';
      }
    } else if (fileData.url) {
      // URL sharing
      finalFileData.url = fileData.url;
      finalFileData.storageType = 'url';
    } else if (fileData.content) {
      // Text content
      finalFileData.content = fileData.content;
      finalFileData.storageType = 'firestore';
    }

    // Save to Firestore
    const sharedFile: SharedFile = {
      ...finalFileData,
      sharedAt: new Date(),
      lastModified: new Date(),
      lastModifiedBy: sharedBy
    } as SharedFile;

    await setDoc(doc(db, 'sharedFiles', fileId), {
      ...sharedFile,
      sharedAt: serverTimestamp(),
      lastModified: serverTimestamp()
    });

    return sharedFile;
  }

  // Get shared files for a team
  async getTeamFiles(teamId: string, userId: string): Promise<SharedFile[]> {
    // Verify user is team member
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[userId]) {
      throw new Error('Access denied: Not a team member');
    }

    // Get shared files
    const filesRef = collection(db, 'sharedFiles');
    const q = query(filesRef, where('teamId', '==', teamId));
    const snapshot = await getDocs(q);

    const files: SharedFile[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const file = {
        id: doc.id,
        ...data,
        sharedAt: data.sharedAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      } as SharedFile;

      // Check if user has permission to view this file
      const userPermissions = this.getUserFilePermissions(file, userId);
      if (userPermissions.canView) {
        // Don't include content in list view for performance
        const { content, ...fileWithoutContent } = file;
        files.push({
          ...fileWithoutContent,
          userPermissions
        } as any);
      }
    });

    // Sort files by sharedAt (most recent first)
    files.sort((a, b) => b.sharedAt.getTime() - a.sharedAt.getTime());

    return files;
  }

  // Get a specific file with content
  async getFile(fileId: string, userId: string): Promise<SharedFile> {
    const fileDoc = await getDoc(doc(db, 'sharedFiles', fileId));
    
    if (!fileDoc.exists()) {
      throw new Error('File not found');
    }

    const data = fileDoc.data();
    const file: SharedFile = {
      id: fileDoc.id,
      ...data,
      sharedAt: data.sharedAt?.toDate() || new Date(),
      lastModified: data.lastModified?.toDate() || new Date()
    } as SharedFile;

    // Check permissions
    const userPermissions = this.getUserFilePermissions(file, userId);
    if (!userPermissions.canView) {
      throw new Error('Access denied: No view permission');
    }

    return {
      ...file,
      userPermissions
    } as any;
  }

  // Delete a shared file
  async deleteFile(fileId: string, userId: string): Promise<void> {
    const fileDoc = await getDoc(doc(db, 'sharedFiles', fileId));
    if (!fileDoc.exists()) {
      throw new Error('File not found');
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = this.getUserFilePermissions(fileData, userId);

    if (!userPermissions.canManage) {
      throw new Error('Access denied: No admin permission');
    }

    // Delete from Google Drive if stored there
    if (fileData.storageType === 'drive' && fileData.driveFileId) {
      try {
        await googleDriveService.deleteFile(fileData.driveFileId);
      } catch (error) {
        console.warn('Failed to delete from Google Drive:', error);
        // Continue with Firestore deletion even if Drive deletion fails
      }
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'sharedFiles', fileId));
  }

  // Update file permissions
  async updateFilePermissions(
    fileId: string, 
    userId: string, 
    targetUserId: string, 
    permission: 'view' | 'edit' | 'admin', 
    action: 'grant' | 'revoke'
  ): Promise<void> {
    const fileDoc = await getDoc(doc(db, 'sharedFiles', fileId));
    if (!fileDoc.exists()) {
      throw new Error('File not found');
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = this.getUserFilePermissions(fileData, userId);

    if (!userPermissions.canManage) {
      throw new Error('Access denied: No admin permission');
    }

    // Update permissions
    const permissions = { ...fileData.permissions };
    
    if (action === 'grant') {
      if (!permissions[permission].includes(targetUserId)) {
        permissions[permission].push(targetUserId);
      }
    } else if (action === 'revoke') {
      permissions[permission] = permissions[permission].filter(id => id !== targetUserId);
    }

    await updateDoc(doc(db, 'sharedFiles', fileId), {
      permissions,
      lastModified: serverTimestamp(),
      lastModifiedBy: userId
    });
  }

  // Helper function to get user permissions for a file
  private getUserFilePermissions(file: SharedFile, userId: string) {
    const canView = file.permissions.view.includes(userId) || 
                    file.permissions.edit.includes(userId) || 
                    file.permissions.admin.includes(userId);
    
    const canEdit = file.permissions.edit.includes(userId) || 
                    file.permissions.admin.includes(userId);
    
    const canManage = file.permissions.admin.includes(userId);

    return {
      canView,
      canEdit,
      canManage,
      isOwner: file.sharedBy === userId
    };
  }

  // Helper function to convert file to base64
  private fileToBase64(file: File): Promise<string> {
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

  // Download file content (for files stored in Firestore or Drive)
  async downloadFile(fileId: string, userId: string): Promise<Blob | string> {
    const file = await this.getFile(fileId, userId);

    if (file.storageType === 'drive' && file.driveFileId) {
      // Download from Google Drive
      try {
        return await googleDriveService.downloadFile(file.driveFileId);
      } catch (error) {
        throw new Error('Failed to download file from Google Drive');
      }
    } else if (file.storageType === 'firestore' && file.content) {
      // Return base64 content
      return file.content;
    } else if (file.storageType === 'url' && file.url) {
      // Return URL for external links
      return file.url;
    } else {
      throw new Error('File content not available');
    }
  }
}

export const fileShareService = new FileShareService();
