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
    let accessToken = realTimeAuth.getGoogleAccessToken();

    // If no token, user needs to re-authenticate
    if (!accessToken) {
      console.error("No Google Drive access token available");
      throw new Error(
        "No Google Drive access token available. Please sign in again."
      );
    }

    // Test the token by making a simple API call
    try {
      const testResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?pageSize=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // If token is expired or invalid, clear it and ask user to re-authenticate
      if (!testResponse.ok && testResponse.status === 401) {
        console.warn("Google Drive access token expired or invalid");
        localStorage.removeItem("google_access_token");
        realTimeAuth.clearGoogleAccessToken();
        throw new Error(
          "Your Google Drive access has expired. Please sign out and sign in again to refresh your access."
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("expired")) {
        throw error;
      }
      // If it's a network error, continue with the token
      console.warn(
        "Token validation failed due to network error, continuing..."
      );
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

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return {
            success: false,
            error:
              "Your Google Drive access has expired. Please sign out and sign in again to refresh your access.",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Unknown error occurred while accessing Google Drive",
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
      console.log("📁 Google Drive upload - using folderId:", {
        parentFolderId,
        appFolderId: await this.getAppFolder(),
        finalFolderId: folderId,
      });

      if (!folderId) {
        return { success: false, error: "Could not access app folder" };
      }

      const metadata = {
        name: file.name,
        parents: [folderId],
      };

      console.log("📄 Upload metadata:", metadata);

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

  // List all files recursively from the app folder and its subfolders
  async listFiles(_folderId?: string): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const appFolderId = await this.getAppFolder();
      if (!appFolderId) {
        return { success: false, error: "Could not access app folder" };
      }

      // Get all files that are descendants of the app folder
      // This query finds all files where the app folder is anywhere in the parent hierarchy
      const query = `'${appFolderId}' in parents and trashed=false`;
      const fields =
        "files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink)";

      console.log("🔍 Listing files with query:", query);

      // First, get direct children of app folder
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
      let allFiles = result.files || [];

      // Now get files from all subfolders recursively
      const folders = allFiles.filter(
        (file: any) => file.mimeType === "application/vnd.google-apps.folder"
      );

      for (const folder of folders) {
        const subfolderFiles = await this.getFilesFromFolder(
          folder.id,
          accessToken
        );
        allFiles = allFiles.concat(subfolderFiles);
      }

      console.log("📁 Total files found:", allFiles.length);
      return { success: true, data: allFiles };
    } catch (error) {
      console.error("Error listing files:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return {
            success: false,
            error:
              "Your Google Drive access has expired. Please sign out and sign in again to refresh your access.",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to list files from Google Drive",
      };
    }
  }

  // Helper method to recursively get files from a folder
  private async getFilesFromFolder(
    folderId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const query = `'${folderId}' in parents and trashed=false`;
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
        console.error(
          `Failed to list files from folder ${folderId}:`,
          response.status
        );
        return [];
      }

      const result = await response.json();
      let files = result.files || [];

      // Recursively get files from subfolders
      const subfolders = files.filter(
        (file: any) => file.mimeType === "application/vnd.google-apps.folder"
      );
      for (const subfolder of subfolders) {
        const subfolderFiles = await this.getFilesFromFolder(
          subfolder.id,
          accessToken
        );
        files = files.concat(subfolderFiles);
      }

      return files;
    } catch (error) {
      console.error(`Error getting files from folder ${folderId}:`, error);
      return [];
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
