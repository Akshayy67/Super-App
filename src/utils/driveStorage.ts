import { FileItem, Task, Note, AIAnalysis } from "../types";
import { googleDriveService, DriveFile } from "./googleDriveService";
import { realTimeAuth } from "./realTimeAuth";

// Keys for localStorage fallback and caching
const FILES_KEY = "super_study_files";
const TASKS_KEY = "super_study_tasks";
const NOTES_KEY = "super_study_notes";
const AI_ANALYSIS_KEY = "super_study_ai_analysis";
const DRIVE_CACHE_KEY = "super_study_drive_cache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: FileItem[];
  timestamp: number;
  userId: string;
}

export const driveStorageUtils = {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },

  // Cache management
  getCachedFiles(userId: string): FileItem[] | null {
    try {
      const cached = localStorage.getItem(DRIVE_CACHE_KEY);
      if (!cached) return null;

      const cacheEntry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is valid and for the right user
      if (
        cacheEntry.userId === userId &&
        now - cacheEntry.timestamp < CACHE_EXPIRY_MS
      ) {
        return cacheEntry.data;
      }

      // Cache expired or wrong user, remove it
      localStorage.removeItem(DRIVE_CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  },

  setCachedFiles(userId: string, files: FileItem[]): void {
    try {
      const cacheEntry: CacheEntry = {
        data: files,
        timestamp: Date.now(),
        userId: userId,
      };
      localStorage.setItem(DRIVE_CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  },

  clearCache(): void {
    localStorage.removeItem(DRIVE_CACHE_KEY);
  },

  // Convert DriveFile to FileItem
  driveFileToFileItem(driveFile: DriveFile, userId: string): FileItem {
    const fileItem = {
      id: driveFile.id,
      name: driveFile.name,
      type:
        driveFile.mimeType === "application/vnd.google-apps.folder"
          ? "folder"
          : "file",
      mimeType: driveFile.mimeType,
      size: driveFile.size,
      parentId: driveFile.parents?.[0],
      uploadedAt: driveFile.createdTime,
      userId: userId,
      driveFileId: driveFile.id,
      webViewLink: driveFile.webViewLink,
      webContentLink: driveFile.webContentLink,
    };

    console.log("🔄 Converting DriveFile to FileItem:", {
      name: driveFile.name,
      parentId: driveFile.parents?.[0],
      parents: driveFile.parents,
    });

    return fileItem;
  },

  // File Management with Google Drive
  async getFiles(userId: string): Promise<FileItem[]> {
    console.log("🔍 Getting files for user:", userId);

    try {
      // Check if user has Google Drive access
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        console.log("📱 No Google Drive access, using localStorage");
        // Fallback to localStorage for users without Drive access
        const files = localStorage.getItem(FILES_KEY);
        const allFiles: FileItem[] = files ? JSON.parse(files) : [];
        return allFiles.filter((file) => file.userId === userId);
      }

      console.log("☁️ User has Google Drive access");

      // Try to get from cache first
      const cachedFiles = this.getCachedFiles(userId);
      if (cachedFiles) {
        console.log("💾 Returning cached files:", cachedFiles.length);
        return cachedFiles;
      }

      // Get files from Google Drive
      console.log("🌐 Fetching files from Google Drive...");
      const result = await googleDriveService.listFiles();
      console.log("📁 Google Drive result:", result);

      if (result.success && result.data) {
        const files = result.data.map((driveFile: DriveFile) =>
          this.driveFileToFileItem(driveFile, userId)
        );

        console.log("✅ Successfully got files from Drive:", files.length);
        // Cache the results
        this.setCachedFiles(userId, files);
        return files;
      }

      console.log("❌ No files returned from Google Drive");
      return [];
    } catch (error) {
      console.error("Error getting files:", error);
      // Fallback to localStorage on error
      const files = localStorage.getItem(FILES_KEY);
      const allFiles: FileItem[] = files ? JSON.parse(files) : [];
      return allFiles.filter((file) => file.userId === userId);
    }
  },

  async uploadFile(
    file: File,
    userId: string,
    parentFolderId?: string
  ): Promise<FileItem | null> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        // Fallback to localStorage with base64 encoding
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const fileItem: FileItem = {
              id: this.generateId(),
              name: file.name,
              type: "file",
              mimeType: file.type,
              size: file.size,
              parentId: parentFolderId,
              content: e.target?.result as string,
              uploadedAt: new Date().toISOString(),
              userId: userId,
            };

            // Store in localStorage
            const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
            files.push(fileItem);
            localStorage.setItem(FILES_KEY, JSON.stringify(files));

            resolve(fileItem);
          };
          reader.readAsDataURL(file);
        });
      }

      // Upload to Google Drive
      const result = await googleDriveService.uploadFile(file, parentFolderId);
      if (result.success && result.data) {
        // Clear cache since we added a new file
        this.clearCache();
        return this.driveFileToFileItem(result.data, userId);
      }

      return null;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  },

  async createFolder(
    name: string,
    userId: string,
    parentFolderId?: string
  ): Promise<FileItem | null> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        // Fallback to localStorage
        const folderItem: FileItem = {
          id: this.generateId(),
          name: name,
          type: "folder",
          parentId: parentFolderId,
          uploadedAt: new Date().toISOString(),
          userId: userId,
        };

        const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
        files.push(folderItem);
        localStorage.setItem(FILES_KEY, JSON.stringify(files));

        return folderItem;
      }

      // Create folder in Google Drive
      const result = await googleDriveService.createFolder(
        name,
        parentFolderId
      );
      if (result.success && result.data) {
        // Clear cache since we added a new folder
        this.clearCache();
        return this.driveFileToFileItem(result.data, userId);
      }

      return null;
    } catch (error) {
      console.error("Error creating folder:", error);
      return null;
    }
  },

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        // Fallback to localStorage
        const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
        const filteredFiles = files.filter((f: FileItem) => f.id !== fileId);
        localStorage.setItem(FILES_KEY, JSON.stringify(filteredFiles));
        return true;
      }

      // Delete from Google Drive
      const result = await googleDriveService.deleteFile(fileId);
      if (result.success) {
        // Clear cache since we deleted a file
        this.clearCache();
      }
      return result.success;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  },

  async downloadFile(fileId: string): Promise<Blob | string | null> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        // Fallback to localStorage
        const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
        const file = files.find((f: FileItem) => f.id === fileId);
        return file?.content || null;
      }

      // Download from Google Drive
      const result = await googleDriveService.downloadFile(fileId);
      if (result.success && result.data) {
        return result.data as Blob;
      }

      return null;
    } catch (error) {
      console.error("Error downloading file:", error);
      return null;
    }
  },

  // Task Management (keeping localStorage for now)
  getTasks(userId: string): Task[] {
    const tasks = localStorage.getItem(TASKS_KEY);
    const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
    return allTasks.filter((task) => task.userId === userId);
  },

  storeTask(task: Task): void {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    tasks.push(task);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  updateTask(taskId: string, updates: Partial<Task>): void {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    const index = tasks.findIndex((t: Task) => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  },

  deleteTask(taskId: string): void {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    const filteredTasks = tasks.filter((t: Task) => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
  },

  // Notes Management (keeping localStorage for now)
  getNotes(userId: string): Note[] {
    const notes = localStorage.getItem(NOTES_KEY);
    const allNotes: Note[] = notes ? JSON.parse(notes) : [];
    return allNotes.filter((note) => note.userId === userId);
  },

  storeNote(note: Note): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    notes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },

  updateNote(noteId: string, updates: Partial<Note>): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const index = notes.findIndex((n: Note) => n.id === noteId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates };
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  },

  deleteNote(noteId: string): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const filteredNotes = notes.filter((n: Note) => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
  },

  // AI Analysis Management (keeping localStorage for now)
  getAIAnalysis(userId: string): AIAnalysis[] {
    const analyses = localStorage.getItem(AI_ANALYSIS_KEY);
    const allAnalyses: AIAnalysis[] = analyses ? JSON.parse(analyses) : [];
    return allAnalyses.filter((analysis) => analysis.userId === userId);
  },

  storeAIAnalysis(analysis: AIAnalysis): void {
    const analyses = JSON.parse(localStorage.getItem(AI_ANALYSIS_KEY) || "[]");
    analyses.push(analysis);
    localStorage.setItem(AI_ANALYSIS_KEY, JSON.stringify(analyses));
  },

  // Utility method to check if using Google Drive
  isUsingGoogleDrive(): boolean {
    return realTimeAuth.hasGoogleDriveAccess();
  },

  // Get storage status
  getStorageStatus(): {
    type: "localStorage" | "googleDrive";
    hasAccess: boolean;
  } {
    const hasAccess = realTimeAuth.hasGoogleDriveAccess();
    return {
      type: hasAccess ? "googleDrive" : "localStorage",
      hasAccess,
    };
  },
};
