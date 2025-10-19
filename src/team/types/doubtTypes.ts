export interface Doubt {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'open' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attachments: DoubtAttachment[];
  relatedMaterials: RelatedMaterial[];
  discussions: DoubtDiscussion[];
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export interface DoubtAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface RelatedMaterial {
  id: string;
  title: string;
  type: 'file' | 'link' | 'study_material';
  url?: string;
  fileId?: string;
  description?: string;
  addedAt: Date;
  addedBy: string;
}

export interface DoubtDiscussion {
  id: string;
  doubtId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isSolution: boolean;
  attachments: DoubtAttachment[];
  upvotes: number;
  downvotes: number;
  reactions: Reaction[];
}

export interface Reaction {
  id: string;
  userId: string;
  userName: string;
  type: 'upvote' | 'downvote' | 'helpful' | 'confused' | 'thanks';
  createdAt: Date;
}

export interface DoubtFilter {
  status?: 'open' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  authorId?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DoubtStats {
  total: number;
  open: number;
  resolved: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byAuthor: Record<string, number>;
  avgResolutionTime: number; // in hours
}
