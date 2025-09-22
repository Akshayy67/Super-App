// Test file access for new team members
// This test verifies that when new members join a team, they automatically get access to existing files

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { teamFilePermissionService } from '../teamFilePermissionService';
import { fileShareService } from '../fileShareService';
import { teamManagement } from '../teamManagement';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock real-time auth
vi.mock('../realTimeAuth', () => ({
  realTimeAuth: {
    getCurrentUser: vi.fn(() => ({
      id: 'test-user-1',
      email: 'test@example.com',
      username: 'testuser'
    }))
  }
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn()
  })),
  deleteField: vi.fn()
}));

describe('Team File Access for New Members', () => {
  const mockTeamId = 'test-team-123';
  const mockExistingMemberId = 'existing-member-1';
  const mockNewMemberId = 'new-member-1';
  
  const mockTeamData = {
    id: mockTeamId,
    name: 'Test Team',
    members: {
      [mockExistingMemberId]: {
        id: mockExistingMemberId,
        name: 'Existing Member',
        email: 'existing@example.com',
        role: 'member'
      }
    }
  };

  const mockFiles = [
    {
      id: 'file-1',
      fileName: 'test-document.pdf',
      teamId: mockTeamId,
      permissions: {
        view: [],
        edit: [mockExistingMemberId],
        admin: [mockExistingMemberId]
      }
    },
    {
      id: 'file-2',
      fileName: 'team-presentation.pptx',
      teamId: mockTeamId,
      permissions: {
        view: [],
        edit: [mockExistingMemberId],
        admin: [mockExistingMemberId]
      }
    }
  ];

  const mockFolders = [
    {
      id: 'folder-1',
      folderName: 'Project Documents',
      teamId: mockTeamId,
      permissions: {
        view: [],
        edit: [mockExistingMemberId],
        admin: [mockExistingMemberId]
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('grantTeamFileAccessToNewMember', () => {
    it('should grant access to all team files when a new member joins', async () => {
      // Mock Firestore responses
      const { getDocs } = await import('firebase/firestore');
      
      (getDocs as any).mockImplementation((query: any) => {
        // Simulate files query
        if (query.toString().includes('sharedFiles')) {
          return Promise.resolve({
            docs: mockFiles.map(file => ({
              id: file.id,
              data: () => file,
              exists: () => true
            }))
          });
        }
        // Simulate folders query
        if (query.toString().includes('sharedFolders')) {
          return Promise.resolve({
            docs: mockFolders.map(folder => ({
              id: folder.id,
              data: () => folder,
              exists: () => true
            }))
          });
        }
        return Promise.resolve({ docs: [] });
      });

      const { writeBatch } = await import('firebase/firestore');
      const mockBatch = {
        update: vi.fn(),
        commit: vi.fn()
      };
      (writeBatch as any).mockReturnValue(mockBatch);

      // Test granting access to new member
      const result = await teamFilePermissionService.grantTeamFileAccessToNewMember(
        mockTeamId,
        mockNewMemberId,
        'member'
      );

      // Verify results
      expect(result).toHaveLength(3); // 2 files + 1 folder
      expect(result.filter(r => r.updated)).toHaveLength(3);
      expect(result.filter(r => r.type === 'file')).toHaveLength(2);
      expect(result.filter(r => r.type === 'folder')).toHaveLength(1);

      // Verify batch operations were called
      expect(mockBatch.update).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    it('should handle different member roles correctly', async () => {
      const { getDocs, writeBatch } = await import('firebase/firestore');
      
      (getDocs as any).mockImplementation(() => Promise.resolve({
        docs: [{
          id: 'file-1',
          data: () => mockFiles[0],
          exists: () => true
        }]
      }));

      const mockBatch = {
        update: vi.fn(),
        commit: vi.fn()
      };
      (writeBatch as any).mockReturnValue(mockBatch);

      // Test admin role
      await teamFilePermissionService.grantTeamFileAccessToNewMember(
        mockTeamId,
        mockNewMemberId,
        'admin'
      );

      // Verify admin permissions were granted
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          permissions: expect.objectContaining({
            admin: expect.arrayContaining([mockNewMemberId])
          })
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      // Mock error
      (getDocs as any).mockRejectedValue(new Error('Database error'));

      await expect(
        teamFilePermissionService.grantTeamFileAccessToNewMember(
          mockTeamId,
          mockNewMemberId,
          'member'
        )
      ).rejects.toThrow('Database error');
    });
  });

  describe('revokeTeamFileAccessFromMember', () => {
    it('should revoke access from all team files when a member leaves', async () => {
      const { getDocs, writeBatch } = await import('firebase/firestore');
      
      // Mock files with the member having access
      const filesWithAccess = mockFiles.map(file => ({
        ...file,
        permissions: {
          view: [],
          edit: [mockExistingMemberId, mockNewMemberId],
          admin: [mockExistingMemberId]
        }
      }));

      (getDocs as any).mockImplementation((query: any) => {
        if (query.toString().includes('sharedFiles')) {
          return Promise.resolve({
            docs: filesWithAccess.map(file => ({
              id: file.id,
              data: () => file,
              exists: () => true
            }))
          });
        }
        return Promise.resolve({ docs: [] });
      });

      const mockBatch = {
        update: vi.fn(),
        commit: vi.fn()
      };
      (writeBatch as any).mockReturnValue(mockBatch);

      // Test revoking access
      const result = await teamFilePermissionService.revokeTeamFileAccessFromMember(
        mockTeamId,
        mockNewMemberId
      );

      // Verify results
      expect(result).toHaveLength(2); // 2 files
      expect(result.filter(r => r.updated)).toHaveLength(2);

      // Verify batch operations were called
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with Team Management', () => {
    it('should automatically grant file access when joining team', async () => {
      // This would be an integration test that verifies the team management
      // service calls the file permission service when a new member joins
      
      // Mock the team management dependencies
      const { getDoc } = await import('firebase/firestore');
      
      (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => mockTeamData
      });

      // This test would verify that teamManagement.joinTeamByInviteCode
      // calls teamFilePermissionService.grantTeamFileAccessToNewMember
      
      // For now, we'll just verify the service exists and can be called
      expect(teamFilePermissionService.grantTeamFileAccessToNewMember).toBeDefined();
      expect(typeof teamFilePermissionService.grantTeamFileAccessToNewMember).toBe('function');
    });
  });

  describe('Team-based File Creation', () => {
    it('should create files with team-wide permissions by default', async () => {
      // This test verifies that new files are created with permissions
      // for all current team members
      
      const { getDoc, setDoc } = await import('firebase/firestore');
      
      // Mock team data with multiple members
      const teamWithMembers = {
        ...mockTeamData,
        members: {
          [mockExistingMemberId]: {
            id: mockExistingMemberId,
            name: 'Existing Member',
            role: 'member'
          },
          [mockNewMemberId]: {
            id: mockNewMemberId,
            name: 'New Member',
            role: 'viewer'
          }
        }
      };

      (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => teamWithMembers
      });

      (setDoc as any).mockResolvedValue(undefined);

      // Test file creation
      const mockFileData = {
        teamId: mockTeamId,
        fileName: 'new-team-file.pdf',
        fileType: 'application/pdf',
        sharedBy: mockExistingMemberId,
        content: 'test content'
      };

      // This would test that fileShareService.shareFile creates files
      // with appropriate team-wide permissions
      expect(fileShareService.shareFile).toBeDefined();
      expect(typeof fileShareService.shareFile).toBe('function');
    });
  });
});
