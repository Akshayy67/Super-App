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
import { db } from "../../config/firebase";
import { SharedFolder, SharedFile } from "../../utils/fileShareService";

export interface TeamFolderItem {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  permissions: {
    view: string[];
    edit: string[];
    admin: string[];
  };
  // File-specific properties
  fileType?: string;
  fileSize?: number;
  content?: string;
  url?: string;
  tags?: string[];
  description?: string;
  version?: number;
  storageType?: "firestore" | "drive" | "url";
  // Folder-specific properties
  folderPath?: string;
}

export interface FolderNavigationState {
  currentFolderId: string | null;
  currentPath: string;
  breadcrumbs: Array<{
    id: string | null;
    name: string;
    path: string;
  }>;
}

class TeamFolderService {
  // Get all items (files and folders) for a team in a specific folder
  async getTeamFolderContents(
    teamId: string,
    userId: string,
    parentId: string | null = null
  ): Promise<TeamFolderItem[]> {
    try {
      // Verify user is team member
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (!teamDoc.exists()) {
        throw new Error("Team not found");
      }

      const teamData = teamDoc.data();
      if (!teamData?.members?.[userId]) {
        throw new Error("Access denied: Not a team member");
      }

      const items: TeamFolderItem[] = [];

      // Get folders
      const foldersQuery = query(
        collection(db, "sharedFolders"),
        where("teamId", "==", teamId),
        where("parentId", "==", parentId),
        orderBy("folderName")
      );

      const foldersSnapshot = await getDocs(foldersQuery);
      foldersSnapshot.forEach((doc) => {
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

        // Check permissions
        const userPermissions = this.getUserPermissions(
          folderData.permissions,
          userId
        );
        if (userPermissions.canView) {
          items.push({
            id: folderData.id,
            name: folderData.folderName,
            type: "folder",
            parentId: folderData.parentId,
            teamId: folderData.teamId,
            createdBy: folderData.createdBy,
            createdAt: folderData.createdAt,
            lastModified: folderData.lastModified,
            permissions: folderData.permissions,
            folderPath: folderData.folderPath,
            description: folderData.description,
            userPermissions,
          } as any);
        }
      });

      // Get files - try with index first, fallback to simpler query
      let filesQuery;
      try {
        filesQuery = query(
          collection(db, "sharedFiles"),
          where("teamId", "==", teamId),
          where("parentId", "==", parentId),
          orderBy("fileName")
        );
      } catch (indexError) {
        console.warn("Using fallback query for files (index missing)");
        // Fallback: simpler query without orderBy
        filesQuery = query(
          collection(db, "sharedFiles"),
          where("teamId", "==", teamId),
          where("parentId", "==", parentId)
        );
      }

      const filesSnapshot = await getDocs(filesQuery);
      filesSnapshot.forEach((doc) => {
        const fileData = doc.data() as SharedFile;

        // Convert Firestore timestamps
        if (fileData.sharedAt && typeof fileData.sharedAt !== "string") {
          fileData.sharedAt = (fileData.sharedAt as any).toDate();
        }
        if (
          fileData.lastModified &&
          typeof fileData.lastModified !== "string"
        ) {
          fileData.lastModified = (fileData.lastModified as any).toDate();
        }

        // Check permissions
        const userPermissions = this.getUserPermissions(
          fileData.permissions,
          userId
        );
        if (userPermissions.canView) {
          items.push({
            id: fileData.id,
            name: fileData.fileName,
            type: "file",
            parentId: fileData.parentId,
            teamId: fileData.teamId,
            createdBy: fileData.sharedBy,
            createdAt: fileData.sharedAt,
            lastModified: fileData.lastModified,
            permissions: fileData.permissions,
            fileType: fileData.fileType,
            fileSize: fileData.fileSize,
            content: fileData.content,
            url: fileData.url,
            tags: fileData.tags,
            description: fileData.description,
            version: fileData.version,
            storageType: fileData.storageType,
            folderPath: fileData.folderPath,
            userPermissions,
          } as any);
        }
      });

      return items.sort((a, b) => {
        // Folders first, then files
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        // Then alphabetically by name
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error("Error getting team folder contents:", error);

      // If it's an index error, provide helpful guidance
      if (
        error instanceof Error &&
        error.message.includes("requires an index")
      ) {
        console.warn("🔧 Firestore Index Required:");
        console.warn(
          "The hierarchical file organization requires Firestore indexes to work properly."
        );
        console.warn(
          "Please create the required indexes by clicking the link in the error message above."
        );
        console.warn(
          "📖 For detailed instructions, see FIRESTORE_SETUP_GUIDE.md"
        );
      }

      throw error;
    }
  }

  // Build navigation breadcrumbs
  async buildBreadcrumbs(
    teamId: string,
    currentFolderId: string | null
  ): Promise<Array<{ id: string | null; name: string; path: string }>> {
    const breadcrumbs = [{ id: null, name: "Team Files", path: "/" }];

    if (!currentFolderId) {
      return breadcrumbs;
    }

    try {
      const folderDoc = await getDoc(doc(db, "sharedFolders", currentFolderId));
      if (!folderDoc.exists()) {
        return breadcrumbs;
      }

      const folderData = folderDoc.data() as SharedFolder;
      const pathParts = folderData.folderPath?.split("/").filter(Boolean) || [];

      // Build breadcrumbs from path
      let currentPath = "";
      for (const part of pathParts) {
        currentPath += `/${part}`;
        // Find folder ID for this path part
        const folderId = await this.findFolderIdByPath(teamId, currentPath);
        breadcrumbs.push({
          id: folderId,
          name: part,
          path: currentPath,
        });
      }

      return breadcrumbs;
    } catch (error) {
      console.error("Error building breadcrumbs:", error);
      return breadcrumbs;
    }
  }

  // Find folder ID by path
  private async findFolderIdByPath(
    teamId: string,
    path: string
  ): Promise<string | null> {
    try {
      const foldersQuery = query(
        collection(db, "sharedFolders"),
        where("teamId", "==", teamId),
        where("folderPath", "==", path)
      );

      const snapshot = await getDocs(foldersQuery);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error("Error finding folder by path:", error);
      return null;
    }
  }

  // Move item to a different folder
  async moveItem(
    itemId: string,
    itemType: "file" | "folder",
    newParentId: string | null,
    userId: string
  ): Promise<void> {
    const collection_name =
      itemType === "folder" ? "sharedFolders" : "sharedFiles";
    const itemDoc = await getDoc(doc(db, collection_name, itemId));

    if (!itemDoc.exists()) {
      throw new Error(`${itemType} not found`);
    }

    const itemData = itemDoc.data();
    const userPermissions = this.getUserPermissions(
      itemData.permissions,
      userId
    );

    if (!userPermissions.canEdit) {
      throw new Error("Access denied: No edit permission");
    }

    // Update the item's parent
    await updateDoc(doc(db, collection_name, itemId), {
      parentId: newParentId,
      lastModified: serverTimestamp(),
      lastModifiedBy: userId,
    });

    // If it's a folder, update the folder path
    if (itemType === "folder") {
      const newPath = await this.buildNewFolderPath(
        itemData.teamId,
        newParentId,
        itemData.folderName
      );
      await updateDoc(doc(db, collection_name, itemId), {
        folderPath: newPath,
      });
    }
  }

  // Build new folder path when moving
  private async buildNewFolderPath(
    teamId: string,
    parentId: string | null,
    folderName: string
  ): Promise<string> {
    if (!parentId) {
      return `/${folderName}`;
    }

    try {
      const parentDoc = await getDoc(doc(db, "sharedFolders", parentId));
      if (!parentDoc.exists()) {
        return `/${folderName}`;
      }

      const parentFolder = parentDoc.data() as SharedFolder;
      const parentPath = parentFolder.folderPath || "/";

      return `${parentPath}${parentPath.endsWith("/") ? "" : "/"}${folderName}`;
    } catch (error) {
      console.error("Error building new folder path:", error);
      return `/${folderName}`;
    }
  }

  // Get user permissions for an item
  private getUserPermissions(permissions: any, userId: string) {
    return {
      canView:
        permissions.view.includes(userId) ||
        permissions.edit.includes(userId) ||
        permissions.admin.includes(userId),
      canEdit:
        permissions.edit.includes(userId) || permissions.admin.includes(userId),
      canManage: permissions.admin.includes(userId),
    };
  }
}

export const teamFolderService = new TeamFolderService();
