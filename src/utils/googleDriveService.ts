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
      console.log("✅ Created Super Study App folder:", folder.id);
      return { success: true, data: folder };
    } catch (error) {
      console.error("Error creating app folder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create app folder",
      };
    }
  }

  // Create ignore folder inside Super Study App folder
  async createIgnoreFolder(): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const appFolderId = await this.getAppFolder();
      if (!appFolderId) {
        return { success: false, error: "Could not access app folder" };
      }

      // Check if ignore folder already exists
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='ignore' and mimeType='application/vnd.google-apps.folder' and '${appFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return { success: true, data: searchResult.files[0] };
      }

      // Create new ignore folder
      const folderMetadata = {
        name: "ignore",
        mimeType: "application/vnd.google-apps.folder",
        parents: [appFolderId],
        description: "Special folders for app data - Flashcards and ShortNotes",
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
      console.log("✅ Created ignore folder:", folder.id);
      return { success: true, data: folder };
    } catch (error) {
      console.error("Error creating ignore folder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create ignore folder",
      };
    }
  }

  // Get or create ignore folder
  async getIgnoreFolder(): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const appFolderId = await this.getAppFolder();
      if (!appFolderId) return null;

      // Search for existing ignore folder
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='ignore' and mimeType='application/vnd.google-apps.folder' and '${appFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
      }

      // Create new ignore folder if not found
      const createResult = await this.createIgnoreFolder();
      return createResult.success ? createResult.data.id : null;
    } catch (error) {
      console.error("Error getting ignore folder:", error);
      return null;
    }
  }

  // Create a specific folder for flashcards inside ignore folder
  async createFlashcardsFolder(): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const ignoreFolderId = await this.getIgnoreFolder();
      if (!ignoreFolderId) {
        return { success: false, error: "Could not access ignore folder" };
      }

      // Check if flashcards folder already exists
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='FlashCards' and mimeType='application/vnd.google-apps.folder' and '${ignoreFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return { success: true, data: searchResult.files[0] };
      }

      // Create new flashcards folder
      const folderMetadata = {
        name: "FlashCards",
        mimeType: "application/vnd.google-apps.folder",
        parents: [ignoreFolderId],
        description: "Flashcards created in Super Study App",
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
      console.log("✅ Created FlashCards folder:", folder.id);
      return { success: true, data: folder };
    } catch (error) {
      console.error("Error creating flashcards folder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create flashcards folder",
      };
    }
  }

  // Create a specific folder for short notes inside ignore folder
  async createShortNotesFolder(): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const ignoreFolderId = await this.getIgnoreFolder();
      if (!ignoreFolderId) {
        return { success: false, error: "Could not access ignore folder" };
      }

      // Check if short notes folder already exists
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='ShortNotes' and mimeType='application/vnd.google-apps.folder' and '${ignoreFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return { success: true, data: searchResult.files[0] };
      }

      // Create new short notes folder
      const folderMetadata = {
        name: "ShortNotes",
        mimeType: "application/vnd.google-apps.folder",
        parents: [ignoreFolderId],
        description: "Short notes created in Super Study App",
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
      console.log("✅ Created ShortNotes folder:", folder.id);
      return { success: true, data: folder };
    } catch (error) {
      console.error("Error creating short notes folder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create short notes folder",
      };
    }
  }

  // Get or create flashcards folder
  async getFlashcardsFolder(): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const ignoreFolderId = await this.getIgnoreFolder();
      if (!ignoreFolderId) return null;

      // Search for existing flashcards folder
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='FlashCards' and mimeType='application/vnd.google-apps.folder' and '${ignoreFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
      }

      // Create new flashcards folder if not found
      const createResult = await this.createFlashcardsFolder();
      return createResult.success ? createResult.data.id : null;
    } catch (error) {
      console.error("Error getting flashcards folder:", error);
      return null;
    }
  }

  // Get or create short notes folder
  async getShortNotesFolder(): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const ignoreFolderId = await this.getIgnoreFolder();
      if (!ignoreFolderId) return null;

      // Search for existing short notes folder
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='ShortNotes' and mimeType='application/vnd.google-apps.folder' and '${ignoreFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
      }

      // Create new short notes folder if not found
      const createResult = await this.createShortNotesFolder();
      return createResult.success ? createResult.data.id : null;
    } catch (error) {
      console.error("Error getting short notes folder:", error);
      return null;
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
      if (createResult.success && createResult.data) {
        this.appFolderId = createResult.data.id;
        return this.appFolderId;
      }
      return null;
    } catch (error) {
      console.error("Error getting app folder:", error);
      return null;
    }
  }

  // Create a shared folder for a team with team details
  async createTeamFolder(teamName: string, teamDescription: string, teamMembers?: string[]): Promise<{ folderId: string; folderUrl: string }> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Create team folder
      const folderResponse = await fetch(`${this.DRIVE_API_BASE}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Team: ${teamName}`,
          mimeType: 'application/vnd.google-apps.folder',
          description: teamDescription
        })
      });

      if (!folderResponse.ok) {
        throw new Error(`Failed to create team folder: ${folderResponse.statusText}`);
      }

      const folderData = await folderResponse.json();
      const folderId = folderData.id;

      // Create team info file with enhanced details
      const teamInfoContent = `Team Name: ${teamName}
Description: ${teamDescription}
Created: ${new Date().toISOString()}
Members: ${teamMembers?.length || 0}
${teamMembers ? `Member List:\n${teamMembers.map(member => `- ${member}`).join('\n')}` : ''}

This folder was automatically created by the Super Study App team collaboration system.
All team files and resources should be stored here for easy access and backup.`;
      
      // Create team info file
      const infoFileResponse = await fetch(`${this.UPLOAD_API_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
        },
        body: [
          '--foo_bar_baz',
          'Content-Type: application/json',
          '',
          JSON.stringify({
            name: 'Team Info.txt',
            parents: [folderId],
            description: 'Team information and details'
          }),
          '--foo_bar_baz',
          'Content-Type: text/plain',
          '',
          teamInfoContent,
          '--foo_bar_baz--'
        ].join('\r\n')
      });

      // Create subfolders for organization
      const subfolders = ['Shared Files', 'Team Documents', 'Resources', 'Archive'];
      for (const subfolder of subfolders) {
        await fetch(`${this.DRIVE_API_BASE}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [folderId],
            description: `${subfolder} for team ${teamName}`
          })
        });
      }

      const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
      return { folderId, folderUrl };
    } catch (error) {
      console.error('Error creating team folder:', error);
      throw error;
    }
  }

  // Backup team data to Google Drive
  async backupTeamData(teamId: string, teamData: any): Promise<{ fileId: string; fileUrl: string }> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const backupData = {
        teamId,
        teamName: teamData.name,
        description: teamData.description,
        members: teamData.members,
        settings: teamData.settings,
        createdAt: teamData.createdAt,
        updatedAt: teamData.updatedAt,
        backupDate: new Date().toISOString(),
        version: '1.0'
      };

      const fileName = `Team_${teamData.name}_Backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const response = await fetch(`${this.UPLOAD_API_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
        },
        body: [
          '--foo_bar_baz',
          'Content-Type: application/json',
          '',
          JSON.stringify({
            name: fileName,
            description: `Backup of team ${teamData.name} data`,
            parents: teamData.driveFolder ? [teamData.driveFolder] : undefined
          }),
          '--foo_bar_baz',
          'Content-Type: application/json',
          '',
          JSON.stringify(backupData, null, 2),
          '--foo_bar_baz--'
        ].join('\r\n')
      });

      if (!response.ok) {
        throw new Error(`Failed to backup team data: ${response.statusText}`);
      }

      const result = await response.json();
      const fileId = result.id;
      const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
      
      return { fileId, fileUrl };
    } catch (error) {
      console.error('Error backing up team data:', error);
      throw error;
    }
  }

  // Upload team file to Google Drive
  async uploadTeamFile(
    fileName: string, 
    fileContent: string, 
    mimeType: string, 
    teamFolderId?: string
  ): Promise<{ fileId: string; fileUrl: string }> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.UPLOAD_API_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
        },
        body: [
          '--foo_bar_baz',
          'Content-Type: application/json',
          '',
          JSON.stringify({
            name: fileName,
            parents: teamFolderId ? [teamFolderId] : undefined,
            description: 'Team file uploaded via Super Study App'
          }),
          '--foo_bar_baz',
          `Content-Type: ${mimeType}`,
          '',
          fileContent,
          '--foo_bar_baz--'
        ].join('\r\n')
      });

      if (!response.ok) {
        throw new Error(`Failed to upload team file: ${response.statusText}`);
      }

      const result = await response.json();
      const fileId = result.id;
      const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
      
      return { fileId, fileUrl };
    } catch (error) {
      console.error('Error uploading team file:', error);
      throw error;
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

  // Upload flashcards data as a JSON file
  async uploadFlashcards(
    flashcards: any[],
    filename: string = "flashcards.json"
  ): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      // Get or create flashcards folder
      const folderId = await this.getFlashcardsFolder();
      if (!folderId) {
        return { success: false, error: "Could not access flashcards folder" };
      }

      const jsonContent = JSON.stringify(flashcards, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });

      // Create file metadata
      const metadata = {
        name: filename,
        parents: [folderId],
        mimeType: "application/json",
      };

      // Create the file using multipart upload
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append("file", blob, filename);

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
      console.error("Error uploading flashcards:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload flashcards",
      };
    }
  }

  // Download flashcards from Google Drive
  async downloadFlashcards(filename: string = "flashcards.json"): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      // Get flashcards folder
      const folderId = await this.getFlashcardsFolder();
      if (!folderId) {
        return { success: false, error: "Could not access flashcards folder" };
      }

      // Search for the flashcards file
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='${filename}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (!searchResult.files || searchResult.files.length === 0) {
        return { success: false, error: "Flashcards file not found" };
      }

      const fileId = searchResult.files[0].id;

      // Download the file content
      const downloadResponse = await fetch(
        `${this.DRIVE_API_BASE}/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.status}`);
      }

      const content = await downloadResponse.text();
      const flashcards = JSON.parse(content);

      return { success: true, data: flashcards };
    } catch (error) {
      console.error("Error downloading flashcards:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to download flashcards",
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

      // Filter out old special folder names but keep the new structure
      const oldSpecialFolders = ['Flashcards', 'Flash Cards', 'Short Notes'];
      allFiles = allFiles.filter((file: any) => {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          return !oldSpecialFolders.includes(file.name);
        }
        return true;
      });

      // Now get files from all subfolders recursively (including the new special folders)
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

      console.log("📁 Total files found (including new special folders):", allFiles.length);
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

  // Upload short notes data as a JSON file
  async uploadShortNotes(
    shortNotes: any[],
    filename: string = "shortnotes.json"
  ): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      // Get or create short notes folder
      const folderId = await this.getShortNotesFolder();
      if (!folderId) {
        return { success: false, error: "Could not access short notes folder" };
      }

      const jsonContent = JSON.stringify(shortNotes, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });

      // Create file metadata
      const metadata = {
        name: filename,
        parents: [folderId],
        mimeType: "application/json",
      };

      // Create the file using multipart upload
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append("file", blob, filename);

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
      console.error("Error uploading short notes:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload short notes",
      };
    }
  }

  // Download short notes from Google Drive
  async downloadShortNotes(filename: string = "shortnotes.json"): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      // Get short notes folder
      const folderId = await this.getShortNotesFolder();
      if (!folderId) {
        return { success: false, error: "Could not access short notes folder" };
      }

      // Search for the short notes file
      const searchResponse = await fetch(
        `${this.DRIVE_API_BASE}/files?q=name='${filename}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (!searchResult.files || searchResult.files.length === 0) {
        return { success: false, error: "Short notes file not found" };
      }

      const fileId = searchResult.files[0].id;

      // Download the file content
      const downloadResponse = await fetch(
        `${this.DRIVE_API_BASE}/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.status}`);
      }

      const blob = await downloadResponse.blob();
      const text = await blob.text();
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (error) {
      console.error("Error downloading short notes:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  }

  // Get folder structure for display in file manager
  async getFolderStructure(): Promise<DriveApiResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "No access token available" };
      }

      const appFolderId = await this.getAppFolder();
      if (!appFolderId) {
        return { success: false, error: "Could not access app folder" };
      }

      // Get direct children of app folder
      const query = `'${appFolderId}' in parents and trashed=false`;
      const fields = "files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink)";

      const response = await fetch(
        `${this.DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${fields}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`List folders failed: ${response.status}`);
      }

      const result = await response.json();
      const folders = result.files || [];

      // Get contents of special folders
      const folderStructure = [];
      
      for (const folder of folders) {
        if (folder.mimeType === "application/vnd.google-apps.folder") {
          const folderContents = await this.getFilesFromFolder(folder.id, accessToken);
          folderStructure.push({
            ...folder,
            contents: folderContents
          });
        }
      }

      return { success: true, data: folderStructure };
    } catch (error) {
      console.error("Error getting folder structure:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get folder structure",
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
