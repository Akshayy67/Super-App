import { 
  Doubt, 
  DoubtAttachment, 
  RelatedMaterial, 
  DoubtDiscussion, 
  Reaction, 
  DoubtFilter, 
  DoubtStats 
} from '../types/doubtTypes';

class DoubtManagementService {
  private doubts: Map<string, Doubt> = new Map();
  private discussions: Map<string, DoubtDiscussion[]> = new Map();
  private reactions: Map<string, Reaction[]> = new Map();

  // Doubt CRUD operations
  async createDoubt(doubt: Omit<Doubt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doubt> {
    const newDoubt: Doubt = {
      ...doubt,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.doubts.set(newDoubt.id, newDoubt);
    this.discussions.set(newDoubt.id, []);
    this.reactions.set(newDoubt.id, []);

    // Simulate API call
    await this.simulateDelay();
    return newDoubt;
  }

  async getDoubt(doubtId: string): Promise<Doubt | null> {
    await this.simulateDelay();
    return this.doubts.get(doubtId) || null;
  }

  async getDoubtsByTeam(teamId: string, filter?: DoubtFilter): Promise<Doubt[]> {
    await this.simulateDelay();
    
    let teamDoubts = Array.from(this.doubts.values())
      .filter(doubt => doubt.teamId === teamId);

    if (filter) {
      teamDoubts = this.applyFilters(teamDoubts, filter);
    }

    return teamDoubts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateDoubt(doubtId: string, updates: Partial<Doubt>): Promise<Doubt | null> {
    const doubt = this.doubts.get(doubtId);
    if (!doubt) return null;

    const updatedDoubt: Doubt = {
      ...doubt,
      ...updates,
      updatedAt: new Date(),
    };

    this.doubts.set(doubtId, updatedDoubt);
    await this.simulateDelay();
    return updatedDoubt;
  }

  async deleteDoubt(doubtId: string): Promise<boolean> {
    const exists = this.doubts.has(doubtId);
    if (exists) {
      this.doubts.delete(doubtId);
      this.discussions.delete(doubtId);
      this.reactions.delete(doubtId);
    }
    await this.simulateDelay();
    return exists;
  }

  // Discussion operations
  async addDiscussion(discussion: Omit<DoubtDiscussion, 'id' | 'createdAt' | 'updatedAt'>): Promise<DoubtDiscussion> {
    const newDiscussion: DoubtDiscussion = {
      ...discussion,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const discussions = this.discussions.get(discussion.doubtId) || [];
    discussions.push(newDiscussion);
    this.discussions.set(discussion.doubtId, discussions);

    await this.simulateDelay();
    return newDiscussion;
  }

  async getDiscussions(doubtId: string): Promise<DoubtDiscussion[]> {
    await this.simulateDelay();
    return this.discussions.get(doubtId) || [];
  }

  async updateDiscussion(discussionId: string, updates: Partial<DoubtDiscussion>): Promise<DoubtDiscussion | null> {
    for (const [doubtId, discussions] of this.discussions.entries()) {
      const discussionIndex = discussions.findIndex(d => d.id === discussionId);
      if (discussionIndex !== -1) {
        discussions[discussionIndex] = {
          ...discussions[discussionIndex],
          ...updates,
          updatedAt: new Date(),
        };
        await this.simulateDelay();
        return discussions[discussionIndex];
      }
    }
    return null;
  }

  // Reaction operations
  async addReaction(doubtId: string, reaction: Omit<Reaction, 'id' | 'createdAt'>): Promise<Reaction> {
    const newReaction: Reaction = {
      ...reaction,
      id: this.generateId(),
      createdAt: new Date(),
    };

    const reactions = this.reactions.get(doubtId) || [];
    reactions.push(newReaction);
    this.reactions.set(doubtId, reactions);

    await this.simulateDelay();
    return newReaction;
  }

  async getReactions(doubtId: string): Promise<Reaction[]> {
    await this.simulateDelay();
    return this.reactions.get(doubtId) || [];
  }

  async removeReaction(doubtId: string, reactionId: string): Promise<boolean> {
    const reactions = this.reactions.get(doubtId) || [];
    const index = reactions.findIndex(r => r.id === reactionId);
    if (index !== -1) {
      reactions.splice(index, 1);
      this.reactions.set(doubtId, reactions);
      await this.simulateDelay();
      return true;
    }
    return false;
  }

  // Attachment operations
  async addAttachment(doubtId: string, attachment: Omit<DoubtAttachment, 'id' | 'uploadedAt'>): Promise<DoubtAttachment> {
    const newAttachment: DoubtAttachment = {
      ...attachment,
      id: this.generateId(),
      uploadedAt: new Date(),
    };

    const doubt = this.doubts.get(doubtId);
    if (doubt) {
      doubt.attachments.push(newAttachment);
      doubt.updatedAt = new Date();
      this.doubts.set(doubtId, doubt);
    }

    await this.simulateDelay();
    return newAttachment;
  }

  async removeAttachment(doubtId: string, attachmentId: string): Promise<boolean> {
    const doubt = this.doubts.get(doubtId);
    if (doubt) {
      const index = doubt.attachments.findIndex(a => a.id === attachmentId);
      if (index !== -1) {
        doubt.attachments.splice(index, 1);
        doubt.updatedAt = new Date();
        this.doubts.set(doubtId, doubt);
        await this.simulateDelay();
        return true;
      }
    }
    return false;
  }

  // Related materials operations
  async addRelatedMaterial(doubtId: string, material: Omit<RelatedMaterial, 'id' | 'addedAt'>): Promise<RelatedMaterial> {
    const newMaterial: RelatedMaterial = {
      ...material,
      id: this.generateId(),
      addedAt: new Date(),
    };

    const doubt = this.doubts.get(doubtId);
    if (doubt) {
      doubt.relatedMaterials.push(newMaterial);
      doubt.updatedAt = new Date();
      this.doubts.set(doubtId, doubt);
    }

    await this.simulateDelay();
    return newMaterial;
  }

  async removeRelatedMaterial(doubtId: string, materialId: string): Promise<boolean> {
    const doubt = this.doubts.get(doubtId);
    if (doubt) {
      const index = doubt.relatedMaterials.findIndex(m => m.id === materialId);
      if (index !== -1) {
        doubt.relatedMaterials.splice(index, 1);
        doubt.updatedAt = new Date();
        this.doubts.set(doubtId, doubt);
        await this.simulateDelay();
        return true;
      }
    }
    return false;
  }

  // Statistics
  async getDoubtStats(teamId: string): Promise<DoubtStats> {
    await this.simulateDelay();
    
    const teamDoubts = Array.from(this.doubts.values())
      .filter(doubt => doubt.teamId === teamId);

    const stats: DoubtStats = {
      total: teamDoubts.length,
      open: teamDoubts.filter(d => d.status === 'open').length,
      resolved: teamDoubts.filter(d => d.status === 'resolved').length,
      closed: teamDoubts.filter(d => d.status === 'closed').length,
      byPriority: {
        low: teamDoubts.filter(d => d.priority === 'low').length,
        medium: teamDoubts.filter(d => d.priority === 'medium').length,
        high: teamDoubts.filter(d => d.priority === 'high').length,
        urgent: teamDoubts.filter(d => d.priority === 'urgent').length,
      },
      byAuthor: {},
      avgResolutionTime: 0,
    };

    // Calculate author stats
    teamDoubts.forEach(doubt => {
      stats.byAuthor[doubt.authorId] = (stats.byAuthor[doubt.authorId] || 0) + 1;
    });

    // Calculate average resolution time
    const resolvedDoubts = teamDoubts.filter(d => d.resolvedAt);
    if (resolvedDoubts.length > 0) {
      const totalResolutionTime = resolvedDoubts.reduce((sum, doubt) => {
        const resolutionTime = doubt.resolvedAt!.getTime() - doubt.createdAt.getTime();
        return sum + resolutionTime;
      }, 0);
      stats.avgResolutionTime = totalResolutionTime / resolvedDoubts.length / (1000 * 60 * 60); // Convert to hours
    }

    return stats;
  }

  // Resolution operations
  async resolveDoubt(doubtId: string, resolvedBy: string, resolution?: string): Promise<Doubt | null> {
    const doubt = this.doubts.get(doubtId);
    if (!doubt) return null;

    const updatedDoubt: Doubt = {
      ...doubt,
      status: 'resolved',
      resolvedBy,
      resolvedAt: new Date(),
      resolution,
      updatedAt: new Date(),
    };

    this.doubts.set(doubtId, updatedDoubt);
    await this.simulateDelay();
    return updatedDoubt;
  }

  async reopenDoubt(doubtId: string): Promise<Doubt | null> {
    const doubt = this.doubts.get(doubtId);
    if (!doubt) return null;

    const updatedDoubt: Doubt = {
      ...doubt,
      status: 'open',
      resolvedBy: undefined,
      resolvedAt: undefined,
      resolution: undefined,
      updatedAt: new Date(),
    };

    this.doubts.set(doubtId, updatedDoubt);
    await this.simulateDelay();
    return updatedDoubt;
  }

  // Search functionality
  async searchDoubts(teamId: string, query: string): Promise<Doubt[]> {
    await this.simulateDelay();
    
    const teamDoubts = Array.from(this.doubts.values())
      .filter(doubt => doubt.teamId === teamId);

    const searchTerm = query.toLowerCase();
    return teamDoubts.filter(doubt => 
      doubt.title.toLowerCase().includes(searchTerm) ||
      doubt.description.toLowerCase().includes(searchTerm) ||
      doubt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Private helper methods
  private applyFilters(doubts: Doubt[], filter: DoubtFilter): Doubt[] {
    return doubts.filter(doubt => {
      if (filter.status && doubt.status !== filter.status) return false;
      if (filter.priority && doubt.priority !== filter.priority) return false;
      if (filter.authorId && doubt.authorId !== filter.authorId) return false;
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => doubt.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      if (filter.dateRange) {
        const doubtDate = doubt.createdAt;
        if (doubtDate < filter.dateRange.start || doubtDate > filter.dateRange.end) return false;
      }
      return true;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const doubtManagementService = new DoubtManagementService();
