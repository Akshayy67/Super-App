import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { 
  Doubt, 
  DoubtAttachment, 
  RelatedMaterial, 
  DoubtDiscussion, 
  Reaction, 
  DoubtFilter, 
  DoubtStats 
} from '../types/doubtTypes';

class DoubtService {
  private doubtsCollection = 'teamDoubts';
  private discussionsCollection = 'doubtDiscussions';
  private reactionsCollection = 'doubtReactions';

  // Create a new doubt
  async createDoubt(doubt: Omit<Doubt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doubt> {
    try {
      const doubtData = {
        ...doubt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        discussions: [],
      };

      const docRef = await addDoc(collection(db, this.doubtsCollection), doubtData);
      
      return {
        ...doubt,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating doubt:', error);
      throw new Error('Failed to create doubt');
    }
  }

  // Get a single doubt
  async getDoubt(doubtId: string): Promise<Doubt | null> {
    try {
      const docRef = doc(db, this.doubtsCollection, doubtId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        resolvedAt: data.resolvedAt?.toDate(),
      } as Doubt;
    } catch (error) {
      console.error('Error getting doubt:', error);
      throw new Error('Failed to fetch doubt');
    }
  }

  // Get all doubts for a team
  async getDoubtsByTeam(teamId: string, filter?: DoubtFilter): Promise<Doubt[]> {
    try {
      let q = query(
        collection(db, this.doubtsCollection),
        where('teamId', '==', teamId),
        orderBy('createdAt', 'desc')
      );

      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter?.priority) {
        q = query(q, where('priority', '==', filter.priority));
      }
      if (filter?.authorId) {
        q = query(q, where('authorId', '==', filter.authorId));
      }

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate(),
        } as Doubt;
      });
    } catch (error) {
      console.error('Error getting team doubts:', error);
      throw new Error('Failed to fetch doubts');
    }
  }

  // Update doubt
  async updateDoubt(doubtId: string, updates: Partial<Doubt>): Promise<void> {
    try {
      const docRef = doc(db, this.doubtsCollection, doubtId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating doubt:', error);
      throw new Error('Failed to update doubt');
    }
  }

  // Delete doubt
  async deleteDoubt(doubtId: string): Promise<void> {
    try {
      const docRef = doc(db, this.doubtsCollection, doubtId);
      await deleteDoc(docRef);
      
      // Also delete associated discussions
      const discussionsQuery = query(
        collection(db, this.discussionsCollection),
        where('doubtId', '==', doubtId)
      );
      const discussionsSnapshot = await getDocs(discussionsQuery);
      
      const deletePromises = discussionsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting doubt:', error);
      throw new Error('Failed to delete doubt');
    }
  }

  // Add discussion/reply to doubt
  async addDiscussion(discussion: Omit<DoubtDiscussion, 'id' | 'createdAt' | 'updatedAt'>): Promise<DoubtDiscussion> {
    try {
      const discussionData = {
        ...discussion,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.discussionsCollection), discussionData);
      
      return {
        ...discussion,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error adding discussion:', error);
      throw new Error('Failed to add discussion');
    }
  }

  // Get discussions for a doubt
  async getDiscussions(doubtId: string): Promise<DoubtDiscussion[]> {
    try {
      const q = query(
        collection(db, this.discussionsCollection),
        where('doubtId', '==', doubtId),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as DoubtDiscussion;
      });
    } catch (error) {
      console.error('Error getting discussions:', error);
      throw new Error('Failed to fetch discussions');
    }
  }

  // Upload attachment
  async uploadAttachment(
    file: File,
    teamId: string,
    userId: string
  ): Promise<DoubtAttachment> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `team-doubts/${teamId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      return {
        id: fileName,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        uploadedAt: new Date(),
        uploadedBy: userId,
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  // Delete attachment
  async deleteAttachment(teamId: string, fileName: string): Promise<void> {
    try {
      const storageRef = ref(storage, `team-doubts/${teamId}/${fileName}`);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw new Error('Failed to delete attachment');
    }
  }

  // Add related material
  async addRelatedMaterial(
    doubtId: string,
    material: Omit<RelatedMaterial, 'id' | 'addedAt'>
  ): Promise<void> {
    try {
      const doubt = await this.getDoubt(doubtId);
      if (!doubt) throw new Error('Doubt not found');

      const newMaterial: RelatedMaterial = {
        ...material,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date(),
      };

      const updatedMaterials = [...(doubt.relatedMaterials || []), newMaterial];
      
      await this.updateDoubt(doubtId, {
        relatedMaterials: updatedMaterials,
      });
    } catch (error) {
      console.error('Error adding related material:', error);
      throw new Error('Failed to add related material');
    }
  }

  // Remove related material
  async removeRelatedMaterial(doubtId: string, materialId: string): Promise<void> {
    try {
      const doubt = await this.getDoubt(doubtId);
      if (!doubt) throw new Error('Doubt not found');

      const updatedMaterials = (doubt.relatedMaterials || []).filter(
        m => m.id !== materialId
      );
      
      await this.updateDoubt(doubtId, {
        relatedMaterials: updatedMaterials,
      });
    } catch (error) {
      console.error('Error removing related material:', error);
      throw new Error('Failed to remove related material');
    }
  }

  // Resolve doubt
  async resolveDoubt(
    doubtId: string,
    resolvedBy: string,
    resolution?: string
  ): Promise<void> {
    try {
      await this.updateDoubt(doubtId, {
        status: 'resolved',
        resolvedBy,
        resolvedAt: new Date(),
        resolution,
      });
    } catch (error) {
      console.error('Error resolving doubt:', error);
      throw new Error('Failed to resolve doubt');
    }
  }

  // Reopen doubt
  async reopenDoubt(doubtId: string): Promise<void> {
    try {
      await this.updateDoubt(doubtId, {
        status: 'open',
        resolvedBy: undefined,
        resolvedAt: undefined,
        resolution: undefined,
      });
    } catch (error) {
      console.error('Error reopening doubt:', error);
      throw new Error('Failed to reopen doubt');
    }
  }

  // Search doubts
  async searchDoubts(teamId: string, searchQuery: string): Promise<Doubt[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation - consider using Algolia or similar for production
      const allDoubts = await this.getDoubtsByTeam(teamId);
      
      const searchTerm = searchQuery.toLowerCase();
      return allDoubts.filter(doubt => 
        doubt.title.toLowerCase().includes(searchTerm) ||
        doubt.description.toLowerCase().includes(searchTerm) ||
        doubt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching doubts:', error);
      throw new Error('Failed to search doubts');
    }
  }

  // Get doubt statistics
  async getDoubtStats(teamId: string): Promise<DoubtStats> {
    try {
      const doubts = await this.getDoubtsByTeam(teamId);

      const stats: DoubtStats = {
        total: doubts.length,
        open: doubts.filter(d => d.status === 'open').length,
        resolved: doubts.filter(d => d.status === 'resolved').length,
        closed: doubts.filter(d => d.status === 'closed').length,
        byPriority: {
          low: doubts.filter(d => d.priority === 'low').length,
          medium: doubts.filter(d => d.priority === 'medium').length,
          high: doubts.filter(d => d.priority === 'high').length,
          urgent: doubts.filter(d => d.priority === 'urgent').length,
        },
        byAuthor: {},
        avgResolutionTime: 0,
      };

      // Calculate author stats
      doubts.forEach(doubt => {
        stats.byAuthor[doubt.authorId] = (stats.byAuthor[doubt.authorId] || 0) + 1;
      });

      // Calculate average resolution time
      const resolvedDoubts = doubts.filter(d => d.resolvedAt && d.createdAt);
      if (resolvedDoubts.length > 0) {
        const totalResolutionTime = resolvedDoubts.reduce((sum, doubt) => {
          const resolutionTime = doubt.resolvedAt!.getTime() - doubt.createdAt.getTime();
          return sum + resolutionTime;
        }, 0);
        stats.avgResolutionTime = totalResolutionTime / resolvedDoubts.length / (1000 * 60 * 60); // Convert to hours
      }

      return stats;
    } catch (error) {
      console.error('Error getting doubt stats:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  // Get team shared files for linking
  async getTeamFiles(teamId: string): Promise<any[]> {
    try {
      const filesQuery = query(
        collection(db, 'teamFiles'),
        where('teamId', '==', teamId),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(filesQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting team files:', error);
      return [];
    }
  }

  // Link file to doubt as related material
  async linkFileToDoubt(
    doubtId: string,
    fileId: string,
    fileName: string,
    fileUrl: string,
    userId: string
  ): Promise<void> {
    try {
      const material: Omit<RelatedMaterial, 'id' | 'addedAt'> = {
        title: fileName,
        type: 'file',
        fileId,
        url: fileUrl,
        addedBy: userId,
      };

      await this.addRelatedMaterial(doubtId, material);
    } catch (error) {
      console.error('Error linking file to doubt:', error);
      throw new Error('Failed to link file');
    }
  }

  // Get doubts related to a specific file
  async getDoubtsForFile(teamId: string, fileId: string): Promise<Doubt[]> {
    try {
      const allDoubts = await this.getDoubtsByTeam(teamId);
      
      return allDoubts.filter(doubt => 
        doubt.relatedMaterials.some(material => material.fileId === fileId)
      );
    } catch (error) {
      console.error('Error getting doubts for file:', error);
      throw new Error('Failed to fetch doubts');
    }
  }
}

export const doubtService = new DoubtService();
