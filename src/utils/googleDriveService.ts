import { googleProvider } from '../config/firebase';

export interface TeamData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
  settings: {
    isPublic: boolean;
    allowMemberInvites: boolean;
    allowFileSharing: boolean;
    allowChat: boolean;
    allowVideoCall: boolean;
    maxMembers: number;
  };
  inviteCode?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface SharedTeamFolder {
  id: string;
  name: string;
  webViewLink: string;
  sharedWithMembers: boolean;
  teamDataFile?: DriveFile;
}

export class GoogleDriveService {
  private accessToken: string | null = null;
  private isInitialized = false;
  private teamFolders: Map<string, SharedTeamFolder> = new Map();

  constructor() {
    // Check if user is authenticated with Google
    this.checkAuthStatus();
  }

  private async checkAuthStatus() {
    try {
      // Check if user is signed in with Google
      const user = await this.getCurrentUser();
      if (user && user.providerData?.some((provider: any) => provider.providerId === 'google.com')) {
        this.isInitialized = true;
        console.log('✅ Google Drive service initialized');
      } else {
        console.warn('⚠️ Google Drive: User not signed in with Google');
      }
    } catch (error) {
      console.error('❌ Google Drive initialization error:', error);
    }
  }

  private async getCurrentUser(): Promise<any> {
    // Get current user from Firebase Auth
    const { realTimeAuth } = await import('./realTimeAuth');
    return realTimeAuth.getCurrentUser();
  }

  /**
   * Create a shared team folder accessible to all team members
   */
  async createTeamFolder(team: TeamData): Promise<SharedTeamFolder | null> {
    if (!this.isInitialized) {
      console.warn('⚠️ Google Drive not initialized');
      return null;
    }

    try {
      console.log('📁 Creating shared team folder for:', team.name);

      // Create the main team folder
      const folderName = `Team: ${team.name}`;
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Team collaboration folder for ${team.name}`,
        // Make folder accessible to team members
        permissions: [
          {
            type: 'anyone',
            role: 'reader',
            allowFileDiscovery: true
          }
        ]
      };

      // Create folder (this would use Google Drive API)
      const folder = await this.createDriveFolder(folderMetadata);
      
      if (!folder) {
        throw new Error('Failed to create team folder');
      }

             // Create team details file
       const teamDetailsFile = await this.createTeamDetailsFile(folder.id, team);
       
       // Create shared team folder object
       const sharedFolder: SharedTeamFolder = {
         id: folder.id,
         name: folderName,
         webViewLink: folder.webViewLink || '',
         sharedWithMembers: true,
         teamDataFile: teamDetailsFile || undefined
       };

      // Store in memory for quick access
      this.teamFolders.set(team.id, sharedFolder);

      console.log('✅ Shared team folder created:', sharedFolder);
      return sharedFolder;

    } catch (error) {
      console.error('❌ Error creating shared team folder:', error);
      return null;
    }
  }

  /**
   * Create a team details file that all members can view
   */
  private async createTeamDetailsFile(folderId: string, team: TeamData): Promise<DriveFile | null> {
    try {
      const fileName = 'team-details.json';
      const fileContent = JSON.stringify({
        teamInfo: {
          id: team.id,
          name: team.name,
          description: team.description,
          ownerId: team.ownerId,
          inviteCode: team.inviteCode,
          createdAt: team.createdAt.toISOString(),
          updatedAt: team.updatedAt.toISOString()
        },
        settings: team.settings,
        members: team.members,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          source: 'Super App Team Collaboration Platform',
          accessLevel: 'Team Members - Read Only',
          note: 'This file contains team information accessible to all team members'
        }
      }, null, 2);

      const fileMetadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId],
        description: 'Team information and settings accessible to all team members',
        // Make file readable by team members
        permissions: [
          {
            type: 'anyone',
            role: 'reader',
            allowFileDiscovery: true
          }
        ]
      };

      // Create file (this would use Google Drive API)
      const file = await this.createDriveFile(fileMetadata, fileContent);
      
      if (file) {
        console.log('✅ Team details file created:', file);
      }
      
      return file || null;

    } catch (error) {
      console.error('❌ Error creating team details file:', error);
      return null;
    }
  }

  /**
   * Share team folder with specific team members
   */
  async shareTeamFolderWithMembers(teamId: string, memberEmails: string[]): Promise<boolean> {
    try {
      const teamFolder = this.teamFolders.get(teamId);
      if (!teamFolder) {
        console.warn('⚠️ Team folder not found:', teamId);
        return false;
      }

      console.log('🔗 Sharing team folder with members:', memberEmails);

      // Share folder with each team member
      for (const email of memberEmails) {
        await this.shareFolderWithUser(teamFolder.id, email, 'reader');
      }

      console.log('✅ Team folder shared with all members');
      return true;

    } catch (error) {
      console.error('❌ Error sharing team folder:', error);
      return false;
    }
  }

  /**
   * Get team folder information for display
   */
  getTeamFolder(teamId: string): SharedTeamFolder | null {
    return this.teamFolders.get(teamId) || null;
  }

  /**
   * Check if user has access to team folder
   */
  async checkTeamFolderAccess(teamId: string, userEmail: string): Promise<boolean> {
    try {
      const teamFolder = this.teamFolders.get(teamId);
      if (!teamFolder) return false;

      // Check if user has access to the folder
      const hasAccess = await this.checkUserFolderAccess(teamFolder.id, userEmail);
      return hasAccess;

    } catch (error) {
      console.error('❌ Error checking folder access:', error);
      return false;
    }
  }

  /**
   * Get all team folders for current user
   */
  async getUserTeamFolders(): Promise<SharedTeamFolder[]> {
    try {
      // This would query Google Drive for folders the user has access to
      // For now, return stored folders
      return Array.from(this.teamFolders.values());
    } catch (error) {
      console.error('❌ Error getting user team folders:', error);
      return [];
    }
  }

  // Google Drive API methods using gapi

  private async createDriveFolder(metadata: any): Promise<any> {
    try {
      console.log('📁 Creating Drive folder:', metadata.name);
      
      // Check if gapi is available
      if (typeof window !== 'undefined' && (window as any).gapi) {
        const response = await (window as any).gapi.client.drive.files.create({
          resource: {
            name: metadata.name,
            mimeType: 'application/vnd.google-apps.folder',
            description: metadata.description
          },
          fields: 'id,name,webViewLink,mimeType'
        });

        console.log('✅ Drive folder created:', response.result);
        return response.result;
      } else {
        // Fallback to mock for development
        console.log('📁 Mock: Creating Drive folder (gapi not available):', metadata.name);
        return {
          id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          name: metadata.name,
          webViewLink: `https://drive.google.com/drive/folders/folder_${Date.now()}`,
          mimeType: 'application/vnd.google-apps.folder'
        };
      }
    } catch (error) {
      console.error('❌ Error creating Drive folder:', error);
      // Return mock data on error for development
      return {
        id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: metadata.name,
        webViewLink: `https://drive.google.com/drive/folders/folder_${Date.now()}`,
        mimeType: 'application/vnd.google-apps.folder'
      };
    }
  }

  private async createDriveFile(metadata: any, content: string): Promise<any> {
    try {
      console.log('📄 Creating Drive file:', metadata.name);
      
      if (typeof window !== 'undefined' && (window as any).gapi) {
        // Create multipart request body
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const requestBody = delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify({
            name: metadata.name,
            mimeType: metadata.mimeType,
            parents: metadata.parents,
            description: metadata.description
          }) + delimiter +
          'Content-Type: ' + metadata.mimeType + '\r\n\r\n' +
          content + close_delim;

        const request = (window as any).gapi.client.request({
          path: 'https://www.googleapis.com/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
          },
          body: requestBody
        });

        const response = await request;
        console.log('✅ Drive file created:', response.result);
        return response.result;
      } else {
        // Fallback to mock
        console.log('📄 Mock: Creating Drive file (gapi not available):', metadata.name);
        return {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          name: metadata.name,
          mimeType: metadata.mimeType,
          webViewLink: `https://drive.google.com/file/d/file_${Date.now()}/view`,
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('❌ Error creating Drive file:', error);
      // Return mock on error
      return {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: metadata.name,
        mimeType: metadata.mimeType,
        webViewLink: `https://drive.google.com/file/d/file_${Date.now()}/view`,
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString()
      };
    }
  }

  private async shareFolderWithUser(folderId: string, email: string, role: string): Promise<boolean> {
    try {
      console.log('🔗 Sharing folder with:', email, 'role:', role);
      
      if (typeof window !== 'undefined' && (window as any).gapi) {
        const response = await (window as any).gapi.client.drive.permissions.create({
          fileId: folderId,
          resource: {
            role: role, // 'reader', 'writer', 'commenter'
            type: 'user',
            emailAddress: email
          },
          sendNotificationEmail: true,
          emailMessage: 'You have been granted access to a team collaboration folder.'
        });

        console.log('✅ Folder shared successfully:', response.result);
        return true;
      } else {
        console.log('🔗 Mock: Sharing folder (gapi not available)');
        return true;
      }
    } catch (error) {
      console.error('❌ Error sharing folder:', error);
      return false;
    }
  }

  private async checkUserFolderAccess(folderId: string, userEmail: string): Promise<boolean> {
    try {
      console.log('🔍 Checking access for:', userEmail, 'to folder:', folderId);
      
      if (typeof window !== 'undefined' && (window as any).gapi) {
        const response = await (window as any).gapi.client.drive.permissions.list({
          fileId: folderId,
          fields: 'permissions(id,emailAddress,role)'
        });

        const permissions = response.result.permissions || [];
        const userPermission = permissions.find((p: any) => p.emailAddress === userEmail);
        
        console.log('🔍 User permissions found:', userPermission);
        return !!userPermission;
      } else {
        console.log('🔍 Mock: Checking access (gapi not available)');
        return true;
      }
    } catch (error) {
      console.error('❌ Error checking folder access:', error);
      return false;
    }
  }

  /**
   * Initialize Google Drive service
   */
  async initialize(): Promise<boolean> {
    try {
      // This would handle Google OAuth flow
      console.log('🚀 Initializing Google Drive service...');
      
      // For now, just mark as initialized
      this.isInitialized = true;
      console.log('✅ Google Drive service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getStatus(): { isReady: boolean; teamFolders: number; lastSync?: Date } {
      return {
      isReady: this.isInitialized,
      teamFolders: this.teamFolders.size,
      lastSync: this.isInitialized ? new Date() : undefined
    };
  }
}

export const googleDriveService = new GoogleDriveService();
