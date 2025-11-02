import { FileItem, Task, ShortNote, AIAnalysis, NoteFolder } from "../types";
import { googleDriveService, DriveFile } from "./googleDriveService";
import { realTimeAuth } from "./realTimeAuth";

const FILES_KEY = "super_study_files";
const TASKS_KEY = "super_study_tasks";
const NOTES_KEY = "super_study_notes";
const AI_ANALYSIS_KEY = "super_study_ai_analysis";
const NOTE_FOLDERS_KEY = "super_study_note_folders";

export const storageUtils = {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // File Management
  getFiles(userId: string): FileItem[] {
    const files = localStorage.getItem(FILES_KEY);
    const allFiles: FileItem[] = files ? JSON.parse(files) : [];
    return allFiles.filter((file) => file.userId === userId);
  },

  storeFile(file: FileItem): void {
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
    files.push(file);
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  },

  updateFile(fileId: string, updates: Partial<FileItem>): void {
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
    const index = files.findIndex((f: FileItem) => f.id === fileId);
    if (index !== -1) {
      files[index] = { ...files[index], ...updates };
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  },

  deleteFile(fileId: string): void {
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
    const filtered = files.filter((f: FileItem) => f.id !== fileId);
    localStorage.setItem(FILES_KEY, JSON.stringify(filtered));
  },

  // Task Management
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
    const filtered = tasks.filter((t: Task) => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  },

  // Short Notes Management
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
      notes[index] = {
        ...notes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  },

  deleteShortNote(noteId: string): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    const filtered = notes.filter((n: ShortNote) => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  },

  // Note Folders Management
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

  // Google Drive Integration for Short Notes
  async storeShortNoteToDrive(note: ShortNote): Promise<boolean> {
    try {
      if (!realTimeAuth.hasGoogleDriveAccess()) {
        console.log("📱 No Google Drive access, saving to localStorage only");
        return false;
      }

      // Create or get the ShortNotes folder
      const shortNotesFolderId = await this.getOrCreateShortNotesFolder();
      if (!shortNotesFolderId) {
        console.error("❌ Could not create or access ShortNotes folder");
        return false;
      }

      // Create Google Doc from short note
      const success = await this.createGoogleDocFromShortNote(note, shortNotesFolderId);
      return success;
    } catch (error) {
      console.error("❌ Error storing short note to Google Drive:", error);
      return false;
    }
  },

  async getOrCreateShortNotesFolder(): Promise<string | null> {
    try {
      // First try to get the SuperApp folder
      const superAppFolderId = await googleDriveService.getAppFolder();
      if (!superAppFolderId) {
        console.error("❌ Could not access SuperApp folder");
        return null;
      }

      // Search for existing ShortNotes folder
      const accessToken = realTimeAuth.getGoogleAccessToken();
      if (!accessToken) return null;

      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='ShortNotes' and mimeType='application/vnd.google-apps.folder' and '${superAppFolderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
      }

      // Create new ShortNotes folder
      const folderMetadata = {
        name: "ShortNotes",
        mimeType: "application/vnd.google-apps.folder",
        parents: [superAppFolderId],
        description: "Short notes created from copied text across the SuperApp",
      };

      const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderMetadata),
      });

      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`);
      }

      const folder = await createResponse.json();
      return folder.id;
    } catch (error) {
      console.error("❌ Error creating ShortNotes folder:", error);
      return null;
    }
  },

  async createGoogleDocFromShortNote(note: ShortNote, folderId: string): Promise<boolean> {
    try {
      const accessToken = realTimeAuth.getGoogleAccessToken();
      if (!accessToken) return false;

      // Create Google Doc metadata
      const docMetadata = {
        name: note.title || "Untitled Short Note",
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId],
        description: `Short note created on ${new Date(note.createdAt).toLocaleString()}`,
      };

      // Create the document
      const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(docMetadata),
      });

      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`);
      }

      const doc = await createResponse.json();
      const docId = doc.id;

      // Add content to the document
      const content = `
Title: ${note.title || "Untitled Short Note"}

Content:
${note.content}

Tags: ${note.tags.join(", ")}

Created: ${new Date(note.createdAt).toLocaleString()}
Updated: ${new Date(note.updatedAt).toLocaleString()}

Source: ${note.documentId ? `Document ID: ${note.documentId}` : "Copied from website"}
      `.trim();

      // Update document content
      const updateResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${docId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "text/plain",
          },
          body: content,
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }

      console.log("✅ Short note successfully stored to Google Drive:", docId);
      return true;
    } catch (error) {
      console.error("❌ Error creating Google Doc from short note:", error);
      return false;
    }
  },

  // AI Analysis
  getAIAnalysis(userId: string): AIAnalysis[] {
    const analysis = localStorage.getItem(AI_ANALYSIS_KEY);
    const allAnalysis: AIAnalysis[] = analysis ? JSON.parse(analysis) : [];
    return allAnalysis.filter((item) => item.userId === userId);
  },

  storeAIAnalysis(analysis: AIAnalysis): void {
    const analyses = JSON.parse(localStorage.getItem(AI_ANALYSIS_KEY) || "[]");
    analyses.push(analysis);
    localStorage.setItem(AI_ANALYSIS_KEY, JSON.stringify(analyses));
  },
};
