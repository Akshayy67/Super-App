// Team File Permission Service
// Handles automatic permission synchronization when team membership changes

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { realTimeAuth } from '../../utils/realTimeAuth';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface FilePermissionUpdate {
  fileId: string;
  fileName: string;
  type: 'file' | 'folder';
  updated: boolean;
  error?: string;
}

class TeamFilePermissionService {
  
  // Grant access to all team files for a new member
  async grantTeamFileAccessToNewMember(
    teamId: string, 
    newMemberId: string, 
    memberRole: string = 'member'
  ): Promise<FilePermissionUpdate[]> {
    console.log(`🔄 Granting team file access to new member: ${newMemberId} with role: ${memberRole}`);
    
    const updates: FilePermissionUpdate[] = [];
    
    try {
      // Get all team files
      const filesQuery = query(
        collection(db, 'sharedFiles'),
        where('teamId', '==', teamId)
      );
      
      const filesSnapshot = await getDocs(filesQuery);
      
      // Get all team folders
      const foldersQuery = query(
        collection(db, 'sharedFolders'),
        where('teamId', '==', teamId)
      );
      
      const foldersSnapshot = await getDocs(foldersQuery);
      
      // Use batch operations for better performance
      const batch = writeBatch(db);
      let batchCount = 0;
      const maxBatchSize = 500; // Firestore batch limit
      
      // Process files
      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data();
        const fileId = fileDoc.id;
        
        try {
          const currentPermissions = fileData.permissions || { view: [], edit: [], admin: [] };
          const updatedPermissions = this.addMemberToFilePermissions(
            currentPermissions, 
            newMemberId, 
            memberRole
          );
          
          // Only update if permissions actually changed
          if (this.permissionsChanged(currentPermissions, updatedPermissions)) {
            batch.update(doc(db, 'sharedFiles', fileId), {
              permissions: updatedPermissions,
              lastModified: new Date(),
              lastModifiedBy: 'system'
            });
            
            batchCount++;
            
            updates.push({
              fileId,
              fileName: fileData.fileName || 'Unknown File',
              type: 'file',
              updated: true
            });
          } else {
            updates.push({
              fileId,
              fileName: fileData.fileName || 'Unknown File',
              type: 'file',
              updated: false
            });
          }
          
          // Execute batch if we reach the limit
          if (batchCount >= maxBatchSize) {
            await batch.commit();
            batchCount = 0;
          }
          
        } catch (error) {
          console.error(`Error updating file ${fileId}:`, error);
          updates.push({
            fileId,
            fileName: fileData.fileName || 'Unknown File',
            type: 'file',
            updated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Process folders
      for (const folderDoc of foldersSnapshot.docs) {
        const folderData = folderDoc.data();
        const folderId = folderDoc.id;
        
        try {
          const currentPermissions = folderData.permissions || { view: [], edit: [], admin: [] };
          const updatedPermissions = this.addMemberToFilePermissions(
            currentPermissions, 
            newMemberId, 
            memberRole
          );
          
          // Only update if permissions actually changed
          if (this.permissionsChanged(currentPermissions, updatedPermissions)) {
            batch.update(doc(db, 'sharedFolders', folderId), {
              permissions: updatedPermissions,
              lastModified: new Date(),
              lastModifiedBy: 'system'
            });
            
            batchCount++;
            
            updates.push({
              fileId: folderId,
              fileName: folderData.folderName || 'Unknown Folder',
              type: 'folder',
              updated: true
            });
          } else {
            updates.push({
              fileId: folderId,
              fileName: folderData.folderName || 'Unknown Folder',
              type: 'folder',
              updated: false
            });
          }
          
          // Execute batch if we reach the limit
          if (batchCount >= maxBatchSize) {
            await batch.commit();
            batchCount = 0;
          }
          
        } catch (error) {
          console.error(`Error updating folder ${folderId}:`, error);
          updates.push({
            fileId: folderId,
            fileName: folderData.folderName || 'Unknown Folder',
            type: 'folder',
            updated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Execute remaining batch operations
      if (batchCount > 0) {
        await batch.commit();
      }
      
      const updatedCount = updates.filter(u => u.updated).length;
      console.log(`✅ Successfully updated permissions for ${updatedCount} files/folders`);
      
      return updates;
      
    } catch (error) {
      console.error('Error granting team file access:', error);
      throw error;
    }
  }
  
  // Remove access to all team files when a member leaves
  async revokeTeamFileAccessFromMember(
    teamId: string, 
    memberId: string
  ): Promise<FilePermissionUpdate[]> {
    console.log(`🔄 Revoking team file access from member: ${memberId}`);
    
    const updates: FilePermissionUpdate[] = [];
    
    try {
      // Get all team files
      const filesQuery = query(
        collection(db, 'sharedFiles'),
        where('teamId', '==', teamId)
      );
      
      const filesSnapshot = await getDocs(filesQuery);
      
      // Get all team folders
      const foldersQuery = query(
        collection(db, 'sharedFolders'),
        where('teamId', '==', teamId)
      );
      
      const foldersSnapshot = await getDocs(foldersQuery);
      
      // Use batch operations
      const batch = writeBatch(db);
      let batchCount = 0;
      const maxBatchSize = 500;
      
      // Process files
      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data();
        const fileId = fileDoc.id;
        
        try {
          const currentPermissions = fileData.permissions || { view: [], edit: [], admin: [] };
          const updatedPermissions = this.removeMemberFromFilePermissions(
            currentPermissions, 
            memberId
          );
          
          if (this.permissionsChanged(currentPermissions, updatedPermissions)) {
            batch.update(doc(db, 'sharedFiles', fileId), {
              permissions: updatedPermissions,
              lastModified: new Date(),
              lastModifiedBy: 'system'
            });
            
            batchCount++;
            
            updates.push({
              fileId,
              fileName: fileData.fileName || 'Unknown File',
              type: 'file',
              updated: true
            });
          }
          
          if (batchCount >= maxBatchSize) {
            await batch.commit();
            batchCount = 0;
          }
          
        } catch (error) {
          console.error(`Error updating file ${fileId}:`, error);
          updates.push({
            fileId,
            fileName: fileData.fileName || 'Unknown File',
            type: 'file',
            updated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Process folders
      for (const folderDoc of foldersSnapshot.docs) {
        const folderData = folderDoc.data();
        const folderId = folderDoc.id;
        
        try {
          const currentPermissions = folderData.permissions || { view: [], edit: [], admin: [] };
          const updatedPermissions = this.removeMemberFromFilePermissions(
            currentPermissions, 
            memberId
          );
          
          if (this.permissionsChanged(currentPermissions, updatedPermissions)) {
            batch.update(doc(db, 'sharedFolders', folderId), {
              permissions: updatedPermissions,
              lastModified: new Date(),
              lastModifiedBy: 'system'
            });
            
            batchCount++;
            
            updates.push({
              fileId: folderId,
              fileName: folderData.folderName || 'Unknown Folder',
              type: 'folder',
              updated: true
            });
          }
          
          if (batchCount >= maxBatchSize) {
            await batch.commit();
            batchCount = 0;
          }
          
        } catch (error) {
          console.error(`Error updating folder ${folderId}:`, error);
        }
      }
      
      // Execute remaining batch operations
      if (batchCount > 0) {
        await batch.commit();
      }
      
      const updatedCount = updates.filter(u => u.updated).length;
      console.log(`✅ Successfully revoked permissions for ${updatedCount} files/folders`);
      
      return updates;
      
    } catch (error) {
      console.error('Error revoking team file access:', error);
      throw error;
    }
  }
  
  // Add member to file permissions based on their role
  private addMemberToFilePermissions(
    currentPermissions: any, 
    memberId: string, 
    memberRole: string
  ) {
    const permissions = {
      view: [...(currentPermissions.view || [])],
      edit: [...(currentPermissions.edit || [])],
      admin: [...(currentPermissions.admin || [])]
    };
    
    // Remove member from all permission levels first (in case they're already there)
    permissions.view = permissions.view.filter(id => id !== memberId);
    permissions.edit = permissions.edit.filter(id => id !== memberId);
    permissions.admin = permissions.admin.filter(id => id !== memberId);
    
    // Add member to appropriate permission level based on role
    switch (memberRole) {
      case 'owner':
      case 'admin':
        permissions.admin.push(memberId);
        break;
      case 'member':
        permissions.edit.push(memberId);
        break;
      case 'viewer':
        permissions.view.push(memberId);
        break;
      default:
        permissions.view.push(memberId);
    }
    
    return permissions;
  }
  
  // Remove member from all file permissions
  private removeMemberFromFilePermissions(currentPermissions: any, memberId: string) {
    return {
      view: (currentPermissions.view || []).filter((id: string) => id !== memberId),
      edit: (currentPermissions.edit || []).filter((id: string) => id !== memberId),
      admin: (currentPermissions.admin || []).filter((id: string) => id !== memberId)
    };
  }
  
  // Check if permissions actually changed
  private permissionsChanged(oldPermissions: any, newPermissions: any): boolean {
    const oldView = (oldPermissions.view || []).sort();
    const oldEdit = (oldPermissions.edit || []).sort();
    const oldAdmin = (oldPermissions.admin || []).sort();
    
    const newView = (newPermissions.view || []).sort();
    const newEdit = (newPermissions.edit || []).sort();
    const newAdmin = (newPermissions.admin || []).sort();
    
    return (
      JSON.stringify(oldView) !== JSON.stringify(newView) ||
      JSON.stringify(oldEdit) !== JSON.stringify(newEdit) ||
      JSON.stringify(oldAdmin) !== JSON.stringify(newAdmin)
    );
  }
  
  // Sync all team file permissions (useful for fixing inconsistencies)
  async syncAllTeamFilePermissions(teamId: string): Promise<FilePermissionUpdate[]> {
    console.log(`🔄 Syncing all file permissions for team: ${teamId}`);
    
    try {
      // Get team members
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data();
      const members = teamData.members || {};
      
      const updates: FilePermissionUpdate[] = [];
      
      // Get all team files and folders
      const [filesSnapshot, foldersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'sharedFiles'), where('teamId', '==', teamId))),
        getDocs(query(collection(db, 'sharedFolders'), where('teamId', '==', teamId)))
      ]);
      
      const batch = writeBatch(db);
      let batchCount = 0;
      
      // Process files
      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data();
        const correctPermissions = this.calculateCorrectPermissions(members);
        
        if (this.permissionsChanged(fileData.permissions, correctPermissions)) {
          batch.update(doc(db, 'sharedFiles', fileDoc.id), {
            permissions: correctPermissions,
            lastModified: new Date(),
            lastModifiedBy: 'system'
          });
          
          batchCount++;
          updates.push({
            fileId: fileDoc.id,
            fileName: fileData.fileName || 'Unknown File',
            type: 'file',
            updated: true
          });
        }
        
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // Process folders
      for (const folderDoc of foldersSnapshot.docs) {
        const folderData = folderDoc.data();
        const correctPermissions = this.calculateCorrectPermissions(members);
        
        if (this.permissionsChanged(folderData.permissions, correctPermissions)) {
          batch.update(doc(db, 'sharedFolders', folderDoc.id), {
            permissions: correctPermissions,
            lastModified: new Date(),
            lastModifiedBy: 'system'
          });
          
          batchCount++;
          updates.push({
            fileId: folderDoc.id,
            fileName: folderData.folderName || 'Unknown Folder',
            type: 'folder',
            updated: true
          });
        }
        
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`✅ Synced permissions for ${updates.filter(u => u.updated).length} items`);
      return updates;
      
    } catch (error) {
      console.error('Error syncing team file permissions:', error);
      throw error;
    }
  }
  
  // Calculate correct permissions based on current team members
  private calculateCorrectPermissions(members: Record<string, any>) {
    const permissions = {
      view: [] as string[],
      edit: [] as string[],
      admin: [] as string[]
    };
    
    Object.entries(members).forEach(([memberId, member]) => {
      const role = member.role || 'member';
      
      switch (role) {
        case 'owner':
        case 'admin':
          permissions.admin.push(memberId);
          break;
        case 'member':
          permissions.edit.push(memberId);
          break;
        case 'viewer':
          permissions.view.push(memberId);
          break;
        default:
          permissions.view.push(memberId);
      }
    });
    
    return permissions;
  }
}

export const teamFilePermissionService = new TeamFilePermissionService();
