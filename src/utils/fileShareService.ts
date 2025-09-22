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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { googleDriveService } from "./googleDriveService";
import {
  filterUndefinedValues,
  validateFirestoreDocumentSize,
  FILE_SIZE_LIMITS,
} from "./firestoreHelpers";

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
  storageType: "firestore" | "drive" | "url"; // Where the file is actually stored
  // Hierarchical organization fields
  itemType: "file" | "folder"; // Type of item
  parentId?: string; // Parent folder ID for hierarchical organization
  folderPath?: string; // Full path for easier navigation (e.g., "/folder1/subfolder2")
}

export interface SharedFolder {
  id: string;
  teamId: string;
  folderName: string;
  description?: string;
  parentId?: string; // Parent folder ID
  folderPath: string; // Full path (e.g., "/folder1/subfolder2")
  createdBy: string;
  createdAt: Date;
  permissions: {
    view: string[]; // User IDs who can view
    edit: string[]; // User IDs who can edit/add files
    admin: string[]; // User IDs who can manage permissions and delete folder
  };
  lastModified: Date;
  lastModifiedBy: string;
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
  parentId?: string; // Target folder for the file
}

export interface FolderCreateData {
  teamId: string;
  folderName: string;
  description?: string;
  parentId?: string; // Parent folder ID
  createdBy: string;
  permissions: {
    view: string[];
    edit: string[];
    admin: string[];
  };
}

class FileShareService {
  // Helper function to get team-based permissions for new files/folders
  private async getTeamBasedPermissions(teamId: string, creatorId: string) {
    try {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (!teamDoc.exists()) {
        throw new Error("Team not found");
      }

      const teamData = teamDoc.data();
      const members = teamData?.members || {};

      const permissions = {
        view: [] as string[],
        edit: [] as string[],
        admin: [] as string[],
      };

      // Add all team members to appropriate permission levels based on their roles
      Object.entries(members).forEach(([memberId, member]: [string, any]) => {
        const role = member.role || "member";

        switch (role) {
          case "owner":
          case "admin":
            permissions.admin.push(memberId);
            break;
          case "member":
            permissions.edit.push(memberId);
            break;
          case "viewer":
            permissions.view.push(memberId);
            break;
          default:
            permissions.view.push(memberId);
        }
      });

      // Ensure creator has admin access regardless of role
      if (!permissions.admin.includes(creatorId)) {
        permissions.admin = permissions.admin.filter((id) => id !== creatorId);
        permissions.edit = permissions.edit.filter((id) => id !== creatorId);
        permissions.view = permissions.view.filter((id) => id !== creatorId);
        permissions.admin.push(creatorId);
      }

      return permissions;
    } catch (error) {
      console.error("Error getting team-based permissions:", error);
      // Fallback to creator-only permissions
      return {
        view: [creatorId],
        edit: [creatorId],
        admin: [creatorId],
      };
    }
  }

  // Share a file with the team
  async shareFile(fileData: FileShareData): Promise<SharedFile> {
    const { teamId, sharedBy } = fileData;

    // Verify user is team member
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) {
      throw new Error("Team not found");
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[sharedBy]) {
      throw new Error("Access denied: Not a team member");
    }

    const fileId = `file_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    // Get team-based permissions instead of individual permissions
    const teamPermissions =
      fileData.permissions ||
      (await this.getTeamBasedPermissions(teamId, sharedBy));

    let finalFileData: Partial<SharedFile> = {
      id: fileId,
      teamId,
      fileName: fileData.fileName,
      fileType: fileData.fileType || "unknown",
      fileSize: fileData.fileSize || 0,
      sharedBy,
      permissions: teamPermissions,
      tags: fileData.tags || [],
      description: fileData.description || "",
      version: 1,
      storageType: "firestore",
      itemType: "file",
      parentId: fileData.parentId,
      folderPath: await this.buildFolderPath(teamId, fileData.parentId),
    };

    console.log("💾 shareFile called with:", {
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      hasFile: !!fileData.file,
      hasContent: !!fileData.content,
      contentLength: fileData.content?.length || 0,
      hasUrl: !!fileData.url,
    });

    // Determine storage strategy based on file size and type
    if (fileData.file) {
      console.log(
        "📁 Processing file upload:",
        fileData.file.name,
        fileData.file.size,
        "bytes"
      );
      // File upload - decide between Firestore and Google Drive
      // Use consistent file size limits from constants

      if (fileData.file.size > FILE_SIZE_LIMITS.GOOGLE_DRIVE_THRESHOLD) {
        // > 1MB, use Google Drive
        try {
          console.log("☁️ Uploading large file to Google Drive...");
          // Upload to Google Drive
          const driveFile = await googleDriveService.uploadTeamFile(
            fileData.file,
            teamId,
            `shared-files/${fileData.fileName}`
          );

          finalFileData.driveFileId = driveFile.id;
          finalFileData.url = driveFile.webViewLink;
          finalFileData.storageType = "drive";
          console.log("✅ Uploaded to Google Drive:", driveFile.id);
        } catch (error) {
          console.warn("Failed to upload to Google Drive:", error);

          // Check if file is too large for Firestore fallback
          if (fileData.file.size > FILE_SIZE_LIMITS.FIRESTORE_SAFE_LIMIT) {
            throw new Error(
              `File is too large (${Math.round(
                fileData.file.size / 1024
              )}KB). ` +
                `Google Drive upload failed and file exceeds Firestore limit (${Math.round(
                  FILE_SIZE_LIMITS.FIRESTORE_SAFE_LIMIT / 1024
                )}KB). ` +
                `Please try a smaller file or check your Google Drive connection.`
            );
          }

          // Fallback to base64 in Firestore for smaller files only
          console.log("📄 Fallback: storing as base64 in Firestore...");
          const base64Content = await this.fileToBase64(fileData.file);
          finalFileData.content = base64Content;
          finalFileData.storageType = "firestore";
          console.log("✅ Fallback: stored as base64 in Firestore");
        }
      } else if (fileData.file.size > FILE_SIZE_LIMITS.FIRESTORE_SAFE_LIMIT) {
        // Between 700KB and 1MB - try Google Drive first, then error if it fails
        try {
          console.log("☁️ Uploading medium file to Google Drive...");
          const driveFile = await googleDriveService.uploadTeamFile(
            fileData.file,
            teamId,
            `shared-files/${fileData.fileName}`
          );

          finalFileData.driveFileId = driveFile.id;
          finalFileData.url = driveFile.webViewLink;
          finalFileData.storageType = "drive";
          console.log("✅ Uploaded to Google Drive:", driveFile.id);
        } catch (error) {
          throw new Error(
            `File is too large for Firestore storage (${Math.round(
              fileData.file.size / 1024
            )}KB > ${Math.round(
              FILE_SIZE_LIMITS.FIRESTORE_SAFE_LIMIT / 1024
            )}KB limit). ` +
              `Google Drive upload failed: ${
                error instanceof Error ? error.message : "Unknown error"
              }. ` +
              `Please check your Google Drive connection or try a smaller file.`
          );
        }
      } else {
        console.log("📄 Storing small file as base64 in Firestore...");
        // Small file - store as base64 in Firestore
        const base64Content = await this.fileToBase64(fileData.file);
        finalFileData.content = base64Content;
        finalFileData.storageType = "firestore";
        console.log("✅ Stored as base64 in Firestore");
      }
    } else if (fileData.content) {
      console.log("📝 Using provided content (already converted)");
      // Content already provided (e.g., from FileShareModal)
      finalFileData.content = fileData.content;
      finalFileData.storageType = "firestore";
    } else if (fileData.url) {
      console.log("🔗 Storing as URL reference");
      // URL sharing
      finalFileData.url = fileData.url;
      finalFileData.storageType = "url";
    }

    // Save to Firestore
    const sharedFile: SharedFile = {
      ...finalFileData,
      sharedAt: new Date(),
      lastModified: new Date(),
      lastModifiedBy: sharedBy,
    } as SharedFile;

    console.log("💾 Saving to Firestore:", {
      id: fileId,
      fileName: sharedFile.fileName,
      storageType: sharedFile.storageType,
      hasContent: !!sharedFile.content,
      contentLength: sharedFile.content?.length || 0,
      hasUrl: !!sharedFile.url,
      hasDriveFileId: !!sharedFile.driveFileId,
    });

    // Filter out undefined values before saving to Firestore
    const firestoreData = filterUndefinedValues({
      ...sharedFile,
      sharedAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });

    // Validate document size before saving
    const sizeValidation = validateFirestoreDocumentSize(firestoreData);
    if (!sizeValidation.isValid) {
      console.error("❌ Document size validation failed:", sizeValidation);
      throw new Error(
        `Document too large for Firestore: ${sizeValidation.errors.join(
          ", "
        )}. ` + `Consider using Google Drive for large files.`
      );
    }

    console.log(
      `📏 Document size: ${Math.round(sizeValidation.sizeMB * 100) / 100}MB`
    );
    await setDoc(doc(db, "sharedFiles", fileId), firestoreData);

    console.log("✅ File saved successfully to Firestore");
    return sharedFile;
  }

  // Get shared files for a team
  async getTeamFiles(teamId: string, userId: string): Promise<SharedFile[]> {
    // Verify user is team member
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) {
      throw new Error("Team not found");
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[userId]) {
      throw new Error("Access denied: Not a team member");
    }

    // Get shared files
    const filesRef = collection(db, "sharedFiles");
    const q = query(filesRef, where("teamId", "==", teamId));
    const snapshot = await getDocs(q);

    const files: SharedFile[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const file = {
        id: doc.id,
        ...data,
        sharedAt: data.sharedAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date(),
        // Ensure backward compatibility with new hierarchical fields
        itemType: data.itemType || "file",
        parentId: data.parentId || null,
        folderPath: data.folderPath || "/",
      } as SharedFile;

      // Check if user has permission to view this file
      const userPermissions = this.getUserFilePermissions(file, userId);
      if (userPermissions.canView) {
        // Don't include content in list view for performance
        const { content, ...fileWithoutContent } = file;
        files.push({
          ...fileWithoutContent,
          userPermissions,
        } as any);
      }
    });

    // Sort files by sharedAt (most recent first)
    files.sort((a, b) => b.sharedAt.getTime() - a.sharedAt.getTime());

    return files;
  }

  // Get a specific file with content
  async getFile(fileId: string, userId: string): Promise<SharedFile> {
    console.log("🔍 getFile called for:", fileId);
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));

    if (!fileDoc.exists()) {
      throw new Error("File not found");
    }

    const data = fileDoc.data();
    console.log("📄 File data from Firestore:", {
      id: fileId,
      fileName: data.fileName,
      fileType: data.fileType,
      storageType: data.storageType,
      hasContent: !!data.content,
      contentLength: data.content?.length || 0,
      hasUrl: !!data.url,
      hasDriveFileId: !!data.driveFileId,
    });

    const file: SharedFile = {
      id: fileDoc.id,
      ...data,
      sharedAt: data.sharedAt?.toDate() || new Date(),
      lastModified: data.lastModified?.toDate() || new Date(),
      // Ensure backward compatibility with new hierarchical fields
      itemType: data.itemType || "file",
      parentId: data.parentId || null,
      folderPath: data.folderPath || "/",
    } as SharedFile;

    // Check permissions
    const userPermissions = this.getUserFilePermissions(file, userId);
    if (!userPermissions.canView) {
      throw new Error("Access denied: No view permission");
    }

    return {
      ...file,
      userPermissions,
    } as any;
  }

  // Delete a shared file
  async deleteFile(fileId: string, userId: string): Promise<void> {
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));
    if (!fileDoc.exists()) {
      throw new Error("File not found");
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = this.getUserFilePermissions(fileData, userId);

    if (!userPermissions.canManage) {
      throw new Error("Access denied: No admin permission");
    }

    // Delete from Google Drive if stored there
    if (fileData.storageType === "drive" && fileData.driveFileId) {
      try {
        await googleDriveService.deleteFile(fileData.driveFileId);
      } catch (error) {
        console.warn("Failed to delete from Google Drive:", error);
        // Continue with Firestore deletion even if Drive deletion fails
      }
    }

    // Delete from Firestore
    await deleteDoc(doc(db, "sharedFiles", fileId));
  }

  // Update file permissions
  async updateFilePermissions(
    fileId: string,
    userId: string,
    targetUserId: string,
    permission: "view" | "edit" | "admin",
    action: "grant" | "revoke"
  ): Promise<void> {
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));
    if (!fileDoc.exists()) {
      throw new Error("File not found");
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = this.getUserFilePermissions(fileData, userId);

    if (!userPermissions.canManage) {
      throw new Error("Access denied: No admin permission");
    }

    // Update permissions
    const permissions = { ...fileData.permissions };

    if (action === "grant") {
      if (!permissions[permission].includes(targetUserId)) {
        permissions[permission].push(targetUserId);
      }
    } else if (action === "revoke") {
      permissions[permission] = permissions[permission].filter(
        (id) => id !== targetUserId
      );
    }

    await updateDoc(doc(db, "sharedFiles", fileId), {
      permissions,
      lastModified: serverTimestamp(),
      lastModifiedBy: userId,
    });
  }

  // Helper function to get user permissions for a file
  private getUserFilePermissions(file: SharedFile, userId: string) {
    const canView =
      file.permissions.view.includes(userId) ||
      file.permissions.edit.includes(userId) ||
      file.permissions.admin.includes(userId);

    const canEdit =
      file.permissions.edit.includes(userId) ||
      file.permissions.admin.includes(userId);

    const canManage = file.permissions.admin.includes(userId);

    return {
      canView,
      canEdit,
      canManage,
      isOwner: file.sharedBy === userId,
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
    console.log(
      "🔽 downloadFile called for:",
      fileId,
      "storageType:",
      file.storageType,
      "hasContent:",
      !!file.content
    );

    if (file.storageType === "drive" && file.driveFileId) {
      // Download from Google Drive
      try {
        console.log("📥 Downloading from Google Drive:", file.driveFileId);
        const response = await googleDriveService.downloadFile(
          file.driveFileId
        );
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(
            response.error || "Failed to download from Google Drive"
          );
        }
      } catch (error) {
        console.error("❌ Google Drive download failed:", error);
        throw new Error("Failed to download file from Google Drive");
      }
    } else if (file.storageType === "firestore" && file.content) {
      // Return base64 content
      console.log(
        "📄 Returning Firestore content:",
        file.content.substring(0, 100) + "..."
      );
      return file.content;
    } else if (file.storageType === "url" && file.url) {
      // Return URL for external links
      console.log("🔗 Returning URL:", file.url);
      return file.url;
    } else {
      console.error("❌ No content available for file:", {
        storageType: file.storageType,
        hasContent: !!file.content,
        hasUrl: !!file.url,
        hasDriveFileId: !!file.driveFileId,
      });
      throw new Error("File content not available");
    }
  }

  // Folder management methods

  // Create a new folder
  async createFolder(folderData: FolderCreateData): Promise<SharedFolder> {
    const { teamId, createdBy } = folderData;

    // Verify user is team member
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) {
      throw new Error("Team not found");
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[createdBy]) {
      throw new Error("Access denied: Not a team member");
    }

    const folderId = `folder_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const folderPath = await this.buildFolderPath(
      teamId,
      folderData.parentId,
      folderData.folderName
    );

    // Get team-based permissions instead of individual permissions
    const teamPermissions =
      folderData.permissions ||
      (await this.getTeamBasedPermissions(teamId, createdBy));

    const newFolder: SharedFolder = {
      id: folderId,
      teamId,
      folderName: folderData.folderName,
      description: folderData.description || "",
      parentId: folderData.parentId,
      folderPath,
      createdBy,
      createdAt: new Date(),
      permissions: teamPermissions,
      lastModified: new Date(),
      lastModifiedBy: createdBy,
    };

    // Store in Firestore with a separate collection for folders
    // Filter out undefined values before saving to Firestore
    const firestoreData = filterUndefinedValues({
      ...newFolder,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });

    await setDoc(doc(db, "sharedFolders", folderId), firestoreData);

    return newFolder;
  }

  // Get folders for a team
  async getTeamFolders(
    teamId: string,
    userId: string
  ): Promise<SharedFolder[]> {
    // Verify user is team member
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) {
      throw new Error("Team not found");
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[userId]) {
      throw new Error("Access denied: Not a team member");
    }

    const foldersQuery = query(
      collection(db, "sharedFolders"),
      where("teamId", "==", teamId),
      orderBy("folderName")
    );

    const querySnapshot = await getDocs(foldersQuery);
    const folders: SharedFolder[] = [];

    querySnapshot.forEach((doc) => {
      const folderData = doc.data() as SharedFolder;

      // Convert Firestore timestamps
      if (folderData.createdAt && typeof folderData.createdAt !== "string") {
        folderData.createdAt = (folderData.createdAt as any).toDate();
      }
      if (
        folderData.lastModified &&
        typeof folderData.lastModified !== "string"
      ) {
        folderData.lastModified = (folderData.lastModified as any).toDate();
      }

      // Check if user has permission to view this folder
      const userPermissions = this.getUserFolderPermissions(folderData, userId);
      if (userPermissions.canView) {
        folders.push({
          ...folderData,
          userPermissions,
        } as any);
      }
    });

    return folders;
  }

  // Build folder path for hierarchical navigation
  private async buildFolderPath(
    teamId: string,
    parentId?: string,
    currentFolderName?: string
  ): Promise<string> {
    if (!parentId) {
      return currentFolderName ? `/${currentFolderName}` : "/";
    }

    try {
      const parentDoc = await getDoc(doc(db, "sharedFolders", parentId));
      if (!parentDoc.exists()) {
        return currentFolderName ? `/${currentFolderName}` : "/";
      }

      const parentFolder = parentDoc.data() as SharedFolder;
      const parentPath = parentFolder.folderPath || "/";

      if (currentFolderName) {
        return `${parentPath}${
          parentPath.endsWith("/") ? "" : "/"
        }${currentFolderName}`;
      }

      return parentPath;
    } catch (error) {
      console.error("Error building folder path:", error);
      return currentFolderName ? `/${currentFolderName}` : "/";
    }
  }

  // Get user permissions for a folder
  private getUserFolderPermissions(folder: SharedFolder, userId: string) {
    return {
      canView:
        folder.permissions.view.includes(userId) ||
        folder.permissions.edit.includes(userId) ||
        folder.permissions.admin.includes(userId),
      canEdit:
        folder.permissions.edit.includes(userId) ||
        folder.permissions.admin.includes(userId),
      canManage: folder.permissions.admin.includes(userId),
    };
  }

  // Delete a folder (and optionally its contents)
  async deleteFolder(
    folderId: string,
    userId: string,
    deleteContents: boolean = false
  ): Promise<void> {
    const folderDoc = await getDoc(doc(db, "sharedFolders", folderId));
    if (!folderDoc.exists()) {
      throw new Error("Folder not found");
    }

    const folderData = folderDoc.data() as SharedFolder;
    const userPermissions = this.getUserFolderPermissions(folderData, userId);

    if (!userPermissions.canManage) {
      throw new Error("Access denied: No admin permission");
    }

    if (deleteContents) {
      // Delete all files in this folder
      const filesQuery = query(
        collection(db, "sharedFiles"),
        where("teamId", "==", folderData.teamId),
        where("parentId", "==", folderId)
      );

      const filesSnapshot = await getDocs(filesQuery);
      const deletePromises = filesSnapshot.docs.map((doc) =>
        this.deleteFile(doc.id, userId)
      );
      await Promise.all(deletePromises);

      // Delete all subfolders recursively
      const subfoldersQuery = query(
        collection(db, "sharedFolders"),
        where("teamId", "==", folderData.teamId),
        where("parentId", "==", folderId)
      );

      const subfoldersSnapshot = await getDocs(subfoldersQuery);
      const deleteFolderPromises = subfoldersSnapshot.docs.map((doc) =>
        this.deleteFolder(doc.id, userId, true)
      );
      await Promise.all(deleteFolderPromises);
    }

    // Delete the folder itself
    await deleteDoc(doc(db, "sharedFolders", folderId));
  }
}

export const fileShareService = new FileShareService();
