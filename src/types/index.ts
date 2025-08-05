export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  parentId?: string;
  content?: string; // Base64 for files
  uploadedAt: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  userId: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  documentId?: string;
  pageNumber?: number;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id: string;
  documentId: string;
  extractedText: string;
  embeddings?: number[];
  concepts: string[];
  summary: string;
  userId: string;
  createdAt: string;
}