import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../src/config/firebase";
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
import { filterUndefinedValues } from "../src/utils/firestoreHelpers";

interface SharedFile {
  id: string;
  teamId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: string; // For text files or base64 for binary
  url?: string; // For external URLs
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
  // Hierarchical organization fields
  itemType: "file" | "folder";
  parentId?: string;
  folderPath?: string;
}

interface FilePermissionRequest {
  userId: string;
  fileId: string;
  permission: "view" | "edit" | "admin";
  action: "grant" | "revoke";
}

// GET /api/files - Get shared files for a team
// POST /api/files - Share a new file
// PUT /api/files/:id - Update file or permissions
// DELETE /api/files/:id - Delete shared file
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query: urlQuery, body } = req;
  const fileId = urlQuery.id as string;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case "GET":
        if (fileId) {
          return await getFile(req, res, fileId);
        } else {
          return await getTeamFiles(req, res);
        }

      case "POST":
        if (urlQuery.action === "permission") {
          return await updateFilePermission(req, res);
        } else {
          return await shareFile(req, res);
        }

      case "PUT":
        return await updateFile(req, res, fileId);

      case "DELETE":
        return await deleteFile(req, res, fileId);

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error("File API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Get shared files for a team
async function getTeamFiles(req: NextApiRequest, res: NextApiResponse) {
  const { teamId, userId } = req.query;

  if (!teamId || !userId) {
    return res.status(400).json({ error: "Team ID and User ID are required" });
  }

  try {
    // Verify user is team member
    const teamDoc = await getDoc(doc(db, "teams", teamId as string));
    if (!teamDoc.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[userId as string]) {
      return res
        .status(403)
        .json({ error: "Access denied: Not a team member" });
    }

    // Get shared files - use simple query to avoid index requirements
    const filesRef = collection(db, "sharedFiles");
    const q = query(filesRef, where("teamId", "==", teamId as string));

    const snapshot = await getDocs(q);
    const files: SharedFile[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const file = {
        id: doc.id,
        ...data,
        sharedAt: data.sharedAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date(),
      } as SharedFile;

      // Check if user has permission to view this file
      const userPermissions = getUserFilePermissions(file, userId as string);
      if (userPermissions.canView) {
        // Don't include content in list view for performance
        const { content, ...fileWithoutContent } = file;
        files.push({
          ...fileWithoutContent,
          userPermissions,
        } as any);
      }
    });

    // Sort files by sharedAt in memory (most recent first)
    files.sort((a, b) => b.sharedAt.getTime() - a.sharedAt.getTime());

    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching team files:", error);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
}

// Get a specific file
async function getFile(
  req: NextApiRequest,
  res: NextApiResponse,
  fileId: string
) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));

    if (!fileDoc.exists()) {
      return res.status(404).json({ error: "File not found" });
    }

    const data = fileDoc.data();
    const file: SharedFile = {
      id: fileDoc.id,
      ...data,
      sharedAt: data.sharedAt?.toDate() || new Date(),
      lastModified: data.lastModified?.toDate() || new Date(),
    } as SharedFile;

    // Check permissions
    const userPermissions = getUserFilePermissions(file, userId as string);
    if (!userPermissions.canView) {
      return res
        .status(403)
        .json({ error: "Access denied: No view permission" });
    }

    return res.status(200).json({
      file: {
        ...file,
        userPermissions,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ error: "Failed to fetch file" });
  }
}

// Share a new file
async function shareFile(req: NextApiRequest, res: NextApiResponse) {
  const {
    teamId,
    fileName,
    fileType,
    fileSize,
    content,
    url,
    sharedBy,
    permissions,
    tags,
    description,
  } = req.body;

  if (!teamId || !fileName || !sharedBy) {
    return res.status(400).json({
      error: "Team ID, file name, and shared by user ID are required",
    });
  }

  try {
    // Verify user is team member and has sharing permissions
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.[sharedBy]) {
      return res
        .status(403)
        .json({ error: "Access denied: Not a team member" });
    }

    if (!teamData?.settings?.allowFileSharing) {
      return res
        .status(403)
        .json({ error: "File sharing is disabled for this team" });
    }

    const fileId = `file_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    const file: SharedFile = {
      id: fileId,
      teamId,
      fileName,
      fileType: fileType || "unknown",
      fileSize: fileSize || 0,
      content,
      url,
      sharedBy,
      sharedAt: new Date(),
      permissions: {
        view: permissions?.view || [sharedBy],
        edit: permissions?.edit || [sharedBy],
        admin: permissions?.admin || [sharedBy],
      },
      tags: tags || [],
      description: description || "",
      version: 1,
      lastModified: new Date(),
      lastModifiedBy: sharedBy,
      itemType: "file",
      parentId: req.body.parentId,
      folderPath: req.body.folderPath || "/",
    };

    // Filter out undefined values before saving to Firestore
    const firestoreData = filterUndefinedValues({
      ...file,
      sharedAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });

    await setDoc(doc(db, "sharedFiles", fileId), firestoreData);

    return res.status(201).json({
      file,
      message: "File shared successfully",
    });
  } catch (error) {
    console.error("Error sharing file:", error);
    return res.status(500).json({ error: "Failed to share file" });
  }
}

// Update file content or metadata
async function updateFile(
  req: NextApiRequest,
  res: NextApiResponse,
  fileId: string
) {
  const { userId, content, fileName, description, tags } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));
    if (!fileDoc.exists()) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = getUserFilePermissions(fileData, userId);

    if (!userPermissions.canEdit) {
      return res
        .status(403)
        .json({ error: "Access denied: No edit permission" });
    }

    const updateData: any = {
      lastModified: serverTimestamp(),
      lastModifiedBy: userId,
      version: (fileData.version || 1) + 1,
    };

    if (content !== undefined) updateData.content = content;
    if (fileName) updateData.fileName = fileName;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = tags;

    await updateDoc(doc(db, "sharedFiles", fileId), updateData);

    return res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.error("Error updating file:", error);
    return res.status(500).json({ error: "Failed to update file" });
  }
}

// Update file permissions
async function updateFilePermission(req: NextApiRequest, res: NextApiResponse) {
  const {
    userId,
    fileId,
    targetUserId,
    permission,
    action,
  }: FilePermissionRequest & { targetUserId: string } = req.body;

  if (!userId || !fileId || !targetUserId || !permission || !action) {
    return res.status(400).json({
      error:
        "User ID, file ID, target user ID, permission, and action are required",
    });
  }

  try {
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));
    if (!fileDoc.exists()) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = getUserFilePermissions(fileData, userId);

    if (!userPermissions.canManage) {
      return res
        .status(403)
        .json({ error: "Access denied: No admin permission" });
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

    return res
      .status(200)
      .json({ message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return res.status(500).json({ error: "Failed to update permissions" });
  }
}

// Delete shared file
async function deleteFile(
  req: NextApiRequest,
  res: NextApiResponse,
  fileId: string
) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const fileDoc = await getDoc(doc(db, "sharedFiles", fileId));
    if (!fileDoc.exists()) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileData = fileDoc.data() as SharedFile;
    const userPermissions = getUserFilePermissions(fileData, userId);

    if (!userPermissions.canManage) {
      return res
        .status(403)
        .json({ error: "Access denied: No admin permission" });
    }

    await deleteDoc(doc(db, "sharedFiles", fileId));

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
}

// Helper function to get user permissions for a file
function getUserFilePermissions(file: SharedFile, userId: string) {
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
