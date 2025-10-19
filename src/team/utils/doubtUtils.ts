import { Doubt, DoubtDiscussion, Reaction, DoubtStats } from '../types/doubtTypes';

export class DoubtUtils {
  // Format time ago
  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  }

  // Get priority color
  static getPriorityColor(priority: Doubt['priority']): string {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // Get status color
  static getStatusColor(status: Doubt['status']): string {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // Get priority icon
  static getPriorityIcon(priority: Doubt['priority']): string {
    switch (priority) {
      case 'urgent': return '🔥';
      case 'high': return '⚠️';
      case 'medium': return '📌';
      case 'low': return '📝';
      default: return '📄';
    }
  }

  // Get status icon
  static getStatusIcon(status: Doubt['status']): string {
    switch (status) {
      case 'open': return '🔓';
      case 'resolved': return '✅';
      case 'closed': return '🔒';
      default: return '❓';
    }
  }

  // Calculate discussion engagement score
  static calculateEngagementScore(discussions: DoubtDiscussion[]): number {
    if (discussions.length === 0) return 0;
    
    const totalUpvotes = discussions.reduce((sum, d) => sum + d.upvotes, 0);
    const totalDownvotes = discussions.reduce((sum, d) => sum + d.downvotes, 0);
    const totalReactions = discussions.reduce((sum, d) => sum + d.reactions.length, 0);
    
    return totalUpvotes - totalDownvotes + totalReactions;
  }

  // Get file type icon
  static getFileTypeIcon(fileType: string): string {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('text') || type.includes('txt')) return '📝';
    if (type.includes('word') || type.includes('doc')) return '📄';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('code') || type.includes('script')) return '💻';
    
    return '📎';
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate doubt summary
  static generateDoubtSummary(doubt: Doubt): string {
    const maxLength = 150;
    if (doubt.description.length <= maxLength) return doubt.description;
    
    return doubt.description.substring(0, maxLength) + '...';
  }

  // Check if user can edit doubt
  static canEditDoubt(doubt: Doubt, userId: string, userRole: string): boolean {
    return doubt.authorId === userId || userRole === 'admin' || userRole === 'moderator';
  }

  // Check if user can resolve doubt
  static canResolveDoubt(doubt: Doubt, userId: string, userRole: string): boolean {
    return doubt.authorId === userId || userRole === 'admin' || userRole === 'moderator';
  }

  // Get resolution time
  static getResolutionTime(doubt: Doubt): string | null {
    if (!doubt.resolvedAt) return null;
    
    const resolutionTime = doubt.resolvedAt.getTime() - doubt.createdAt.getTime();
    const hours = Math.floor(resolutionTime / (1000 * 60 * 60));
    const minutes = Math.floor((resolutionTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Sort doubts by various criteria
  static sortDoubts(doubts: Doubt[], sortBy: 'newest' | 'oldest' | 'priority' | 'status' | 'engagement'): Doubt[] {
    const sorted = [...doubts];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'status':
        const statusOrder = { open: 3, resolved: 2, closed: 1 };
        return sorted.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
      case 'engagement':
        return sorted.sort((a, b) => {
          const aEngagement = this.calculateEngagementScore(a.discussions);
          const bEngagement = this.calculateEngagementScore(b.discussions);
          return bEngagement - aEngagement;
        });
      default:
        return sorted;
    }
  }

  // Filter doubts by search query
  static filterDoubts(doubts: Doubt[], query: string): Doubt[] {
    if (!query.trim()) return doubts;
    
    const searchTerm = query.toLowerCase();
    return doubts.filter(doubt => 
      doubt.title.toLowerCase().includes(searchTerm) ||
      doubt.description.toLowerCase().includes(searchTerm) ||
      doubt.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      doubt.authorName.toLowerCase().includes(searchTerm)
    );
  }

  // Get doubt activity summary
  static getActivitySummary(doubt: Doubt): string {
    const discussionCount = doubt.discussions.length;
    const attachmentCount = doubt.attachments.length;
    const materialCount = doubt.relatedMaterials.length;
    
    const parts = [];
    if (discussionCount > 0) parts.push(`${discussionCount} discussion${discussionCount !== 1 ? 's' : ''}`);
    if (attachmentCount > 0) parts.push(`${attachmentCount} attachment${attachmentCount !== 1 ? 's' : ''}`);
    if (materialCount > 0) parts.push(`${materialCount} material${materialCount !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : 'No activity';
  }

  // Validate doubt data
  static validateDoubtData(data: Partial<Doubt>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (data.description && data.description.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }
    
    if (data.tags && data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate doubt analytics
  static generateAnalytics(stats: DoubtStats): {
    resolutionRate: number;
    avgResolutionTime: string;
    mostActiveAuthor: string;
    priorityDistribution: Record<string, number>;
  } {
    const resolutionRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;
    const avgResolutionTime = stats.avgResolutionTime > 0 
      ? `${Math.round(stats.avgResolutionTime)}h` 
      : 'N/A';
    
    const mostActiveAuthor = Object.keys(stats.byAuthor).reduce((a, b) => 
      stats.byAuthor[a] > stats.byAuthor[b] ? a : b, 'Unknown'
    );
    
    const priorityDistribution = {
      urgent: stats.byPriority.urgent,
      high: stats.byPriority.high,
      medium: stats.byPriority.medium,
      low: stats.byPriority.low,
    };
    
    return {
      resolutionRate: Math.round(resolutionRate),
      avgResolutionTime,
      mostActiveAuthor,
      priorityDistribution,
    };
  }
}
