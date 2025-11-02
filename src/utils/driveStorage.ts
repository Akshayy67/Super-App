import { FileItem, Task, ShortNote, AIAnalysis, NoteFolder } from "../types";
import { googleDriveService, DriveFile } from "./googleDriveService";
import { realTimeAuth } from "./realTimeAuth";

// Keys for localStorage fallback and caching
const FILES_KEY = "super_study_files";
const TASKS_KEY = "super_study_tasks";
const NOTES_KEY = "super_study_notes";
const AI_ANALYSIS_KEY = "super_study_ai_analysis";
const NOTE_FOLDERS_KEY = "super_study_note_folders";
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
    const fileItem: FileItem = {
      id: driveFile.id,
      name: driveFile.name,
      type:
        driveFile.mimeType === "application/vnd.google-apps.folder"
          ? ("folder" as const)
          : ("file" as const),
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

  // Flashcards management methods
  async saveFlashcardsToDrive(flashcards: any[], userId: string): Promise<boolean> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        console.log("📱 No Google Drive access, saving to localStorage only");
        // Save to localStorage as fallback
        localStorage.setItem("super_study_flashcards", JSON.stringify(flashcards));
        return false;
      }

      console.log("☁️ Saving flashcards to Google Drive...");
      const result = await googleDriveService.uploadFlashcards(flashcards);
      
      if (result.success) {
        console.log("✅ Flashcards saved to Google Drive successfully");
        // Also save to localStorage as backup
        localStorage.setItem("super_study_flashcards", JSON.stringify(flashcards));
        return true;
      } else {
        console.error("❌ Failed to save flashcards to Drive:", result.error);
        // Fallback to localStorage
        localStorage.setItem("super_study_flashcards", JSON.stringify(flashcards));
        return false;
      }
    } catch (error) {
      console.error("Error saving flashcards to Drive:", error);
      // Fallback to localStorage
      localStorage.setItem("super_study_flashcards", JSON.stringify(flashcards));
      return false;
    }
  },

  async loadFlashcardsFromDrive(userId: string): Promise<any[]> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        console.log("📱 No Google Drive access, loading from localStorage");
        const stored = localStorage.getItem("super_study_flashcards");
        return stored ? JSON.parse(stored) : [];
      }

      console.log("☁️ Loading flashcards from Google Drive...");
      const result = await googleDriveService.downloadFlashcards();
      
      if (result.success && result.data) {
        console.log("✅ Flashcards loaded from Google Drive successfully");
        // Update localStorage with Drive data
        localStorage.setItem("super_study_flashcards", JSON.stringify(result.data));
        return result.data;
      } else {
        console.log("📱 Falling back to localStorage for flashcards");
        const stored = localStorage.getItem("super_study_flashcards");
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error("Error loading flashcards from Drive:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("super_study_flashcards");
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Short notes management methods
  async saveShortNotesToDrive(shortNotes: any[], userId: string): Promise<boolean> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        console.log("📱 No Google Drive access, saving to localStorage only");
        // Save to localStorage as fallback
        localStorage.setItem("super_study_shortnotes", JSON.stringify(shortNotes));
        return false;
      }

      console.log("☁️ Saving short notes to Google Drive...");
      const result = await googleDriveService.uploadShortNotes(shortNotes);
      
      if (result.success) {
        console.log("✅ Short notes saved to Google Drive successfully");
        // Also save to localStorage as backup
        localStorage.setItem("super_study_shortnotes", JSON.stringify(shortNotes));
        return true;
      } else {
        console.error("❌ Failed to save short notes to Drive:", result.error);
        // Fallback to localStorage
        localStorage.setItem("super_study_shortnotes", JSON.stringify(shortNotes));
        return false;
      }
    } catch (error) {
      console.error("Error saving short notes to Drive:", error);
      // Fallback to localStorage
      localStorage.setItem("super_study_shortnotes", JSON.stringify(shortNotes));
      return false;
    }
  },

  async loadShortNotesFromDrive(userId: string): Promise<any[]> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        console.log("📱 No Google Drive access, loading from localStorage");
        const stored = localStorage.getItem("super_study_shortnotes");
        return stored ? JSON.parse(stored) : [];
      }

      console.log("☁️ Loading short notes from Google Drive...");
      const result = await googleDriveService.downloadShortNotes();
      
      if (result.success && result.data) {
        console.log("✅ Short notes loaded from Google Drive successfully");
        // Update localStorage with Drive data
        localStorage.setItem("super_study_shortnotes", JSON.stringify(result.data));
        return result.data;
      } else {
        console.log("📱 Falling back to localStorage for short notes");
        const stored = localStorage.getItem("super_study_shortnotes");
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error("Error loading short notes from Drive:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("super_study_shortnotes");
      return stored ? JSON.parse(stored) : [];
    }
  },

  // File Management with Google Drive
  async getFiles(userId: string): Promise<FileItem[]> {
    console.log("🔍 Getting files for user:", userId);

    try {
      // Check if user should have Google Drive access but needs re-authentication
      if (realTimeAuth.needsGoogleDriveReauth()) {
        console.log("🔄 User needs Google Drive re-authentication");
        throw new Error(
          "Google Drive access expired. Please sign out and sign in again to refresh your access."
        );
      }

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
      // If Google Drive fails, propagate the error for better error handling
      if (result.error && result.error.includes("expired")) {
        throw new Error(result.error);
      }
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
    console.log("🔄 driveStorage.uploadFile called:", {
      fileName: file.name,
      userId,
      parentFolderId,
      hasGoogleDriveAccess: realTimeAuth.hasGoogleDriveAccess(),
    });

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
      console.log(
        "☁️ Uploading to Google Drive with parentFolderId:",
        parentFolderId
      );
      const result = await googleDriveService.uploadFile(file, parentFolderId);
      console.log("📁 Google Drive upload result:", result);

      if (result.success && result.data) {
        // Clear cache since we added a new file
        console.log("🗑️ Clearing cache after upload");
        this.clearCache();
        const fileItem = this.driveFileToFileItem(result.data, userId);
        console.log("✅ Created FileItem:", fileItem);
        return fileItem;
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

  // Short Notes Management (keeping localStorage for now)
  getShortNotes(userId: string): ShortNote[] {
    const notes = localStorage.getItem(NOTES_KEY);
    const allNotes: ShortNote[] = notes ? JSON.parse(notes) : [];
    return allNotes.filter((note) => note.userId === userId);
  },

  storeShortNote(note: ShortNote): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    notes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },

  updateShortNote(noteId: string, updates: Partial<ShortNote>): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const index = notes.findIndex((n: ShortNote) => n.id === noteId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates };
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  },

  deleteShortNote(noteId: string): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const filteredNotes = notes.filter((n: ShortNote) => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
  },

  // Note Folders Management (keeping localStorage for now)
  getNoteFolders(userId: string): NoteFolder[] {
    const folders = localStorage.getItem(NOTE_FOLDERS_KEY);
    const allFolders: NoteFolder[] = folders ? JSON.parse(folders) : [];
    return allFolders.filter((folder) => folder.userId === userId);
  },

  storeNoteFolder(folder: NoteFolder): void {
    const folders = JSON.parse(localStorage.getItem(NOTE_FOLDERS_KEY) || "[]");
    folders.push(folder);
    localStorage.setItem(NOTE_FOLDERS_KEY, JSON.stringify(folders));
  },

  updateNoteFolder(folderId: string, updates: Partial<NoteFolder>): void {
    const folders = JSON.parse(localStorage.getItem(NOTE_FOLDERS_KEY) || "[]");
    const index = folders.findIndex((f: NoteFolder) => f.id === folderId);
    if (index !== -1) {
      folders[index] = {
        ...folders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(NOTE_FOLDERS_KEY, JSON.stringify(folders));
    }
  },

  deleteNoteFolder(folderId: string): void {
    const folders = JSON.parse(localStorage.getItem(NOTE_FOLDERS_KEY) || "[]");
    const filtered = folders.filter((f: NoteFolder) => f.id !== folderId);
    localStorage.setItem(NOTE_FOLDERS_KEY, JSON.stringify(filtered));
    
    // Move all notes in this folder to uncategorized (remove folderId)
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const updatedNotes = notes.map((note: ShortNote) =>
      note.folderId === folderId ? { ...note, folderId: undefined } : note
    );
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  },

  // Move notes between folders
  moveNotesToFolder(noteIds: string[], folderId: string | undefined): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const updatedNotes = notes.map((note: ShortNote) =>
      noteIds.includes(note.id)
        ? { ...note, folderId, updatedAt: new Date().toISOString() }
        : note
    );
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  },

  // Delete multiple notes at once
  deleteMultipleNotes(noteIds: string[]): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const filtered = notes.filter((note: ShortNote) => !noteIds.includes(note.id));
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
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
    needsReauth?: boolean;
  } {
    const hasAccess = realTimeAuth.hasGoogleDriveAccess();
    const needsReauth = realTimeAuth.needsGoogleDriveReauth();

    const status = {
      type: hasAccess ? ("googleDrive" as const) : ("localStorage" as const),
      hasAccess,
      needsReauth,
    };
    console.log("📊 Storage status:", {
      ...status,
      shouldHaveAccess: realTimeAuth.shouldHaveGoogleDriveAccess(),
    });
    return status;
  },

  // Download file content from Google Drive
  async downloadFileContent(fileId: string): Promise<string | null> {
    if (!realTimeAuth.hasGoogleDriveAccess()) {
      console.log("❌ No Google Drive access available");
      return null;
    }

    try {
      console.log("🔽 Downloading content for file ID:", fileId);
      const result = await googleDriveService.downloadFile(fileId);

      if (result.success && result.data) {
        // Convert blob to text or data URL depending on type
        const blob = result.data as Blob;

        if (
          blob.type.startsWith("text/") ||
          blob.type.includes("json") ||
          blob.type.includes("csv")
        ) {
          // For text files, return as text
          const text = await blob.text();
          console.log("✅ Downloaded text content, length:", text.length);
          return text;
        } else if (blob.type.startsWith("image/")) {
          // For images, convert to data URL
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              console.log("✅ Downloaded image content as data URL");
              resolve(result);
            };
            reader.onerror = () => {
              console.error("❌ Error converting image to data URL");
              resolve(null);
            };
            reader.readAsDataURL(blob);
          });
        } else if (
          blob.type === "application/pdf" ||
          blob.type === "application/x-pdf"
        ) {
          // For PDFs, convert to data URL for inline preview
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              console.log("✅ Downloaded PDF content as data URL");
              resolve(result);
            };
            reader.onerror = () => {
              console.error("❌ Error converting PDF to data URL");
              resolve(null);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          // For other file types, we can't preview the content
          console.log("ℹ️ File type not suitable for preview:", blob.type);
          return null;
        }
      } else {
        console.error("❌ Failed to download file:", result.error);
        return null;
      }
    } catch (error) {
      console.error("❌ Error downloading file content:", error);
      return null;
    }
  },
};
