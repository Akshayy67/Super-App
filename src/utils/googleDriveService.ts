import { auth } from "../config/firebase";
import { realTimeAuth } from "./realTimeAuth";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  createdTime: string;
  parents?: string[];
}

export interface DriveApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class GoogleDriveService {
  private readonly DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
  private readonly UPLOAD_API_BASE =
    "https://www.googleapis.com/upload/drive/v3";
  private appFolderId: string | null = null;

  // Get access token from realTimeAuth service
  private async getAccessToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get Google access token from realTimeAuth service
    const accessToken = realTimeAuth.getGoogleAccessToken();
    if (!accessToken) {
      console.error("No Google Drive access token available");
      // For debugging, let's try to get a fresh token
      try {
        const firebaseToken = await user.getIdToken(true);
        console.log("Using Firebase token as fallback");
        return firebaseToken;
      } catch (error) {
        throw new Error(
          "No Google Drive access token available. Please sign in again."
        );
      }
    }

    return accessToken;
  }

  // Create app-specific folder in Google Drive
  async createAppFolder(): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const folderMetadata = {
        name: "Super Study App",
        mimeType: "application/vnd.google-apps.folder",
        description:
          "Files from Super Study App - Your AI-Powered Academic Assistant",
      };

      const response = await fetch(`${this.DRIVE_API_BASE}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderMetadata),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const folder = await response.json();
      this.appFolderId = folder.id;

      return { success: true, data: folder };
    } catch (error) {
      console.error("Error creating app folder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get or create app folder
  async getAppFolder(): Promise<string | null> {
    if (this.appFolderId) {
      return this.appFolderId;
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      // Search for existing app folder
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='Super Study App' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        this.appFolderId = searchResult.files[0].id;
        return this.appFolderId;
      }

      // Create new folder if not found
      const createResult = await this.createAppFolder();
      return createResult.success ? createResult.data.id : null;
    } catch (error) {
      console.error("Error getting app folder:", error);
      return null;
    }
  }

  // Upload file to Google Drive
  async uploadFile(
    file: File,
    parentFolderId?: string
  ): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const folderId = parentFolderId || (await this.getAppFolder());
      if (!folderId) {
        return { success: false, error: "Could not access app folder" };
      }

      const metadata = {
        name: file.name,
        parents: [folderId],
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append("file", file);

      const response = await fetch(
        `${this.UPLOAD_API_BASE}/files?uploadType=multipart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // List files in a folder
  async listFiles(folderId?: string): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const targetFolderId = folderId || (await this.getAppFolder());
      if (!targetFolderId) {
        return { success: false, error: "Could not access folder" };
      }

      const query = `'${targetFolderId}' in parents and trashed=false`;
      const fields =
        "files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink)";

      const response = await fetch(
        `${this.DRIVE_API_BASE}/files?q=${encodeURIComponent(
          query
        )}&fields=${fields}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`List files failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result.files || [] };
    } catch (error) {
      console.error("Error listing files:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "List failed",
      };
    }
  }

  // Download file content
  async downloadFile(fileId: string): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const response = await fetch(
        `${this.DRIVE_API_BASE}/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      console.error("Error downloading file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  }

  // Delete file
  async deleteFile(fileId: string): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const response = await fetch(`${this.DRIVE_API_BASE}/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  // Create folder
  async createFolder(
    name: string,
    parentFolderId?: string
  ): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const folderId = parentFolderId || (await this.getAppFolder());
      if (!folderId) {
        return { success: false, error: "Could not access parent folder" };
      }

      const folderMetadata = {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId],
      };

      const response = await fetch(`${this.DRIVE_API_BASE}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderMetadata),
      });

      if (!response.ok) {
        throw new Error(`Create folder failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("Error creating folder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create folder failed",
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
