import { FileItem, Task, Note, AIAnalysis } from '../types';

const FILES_KEY = 'super_study_files';
const TASKS_KEY = 'super_study_tasks';
const NOTES_KEY = 'super_study_notes';
const AI_ANALYSIS_KEY = 'super_study_ai_analysis';

export const storageUtils = {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // File Management
  getFiles(userId: string): FileItem[] {
    const files = localStorage.getItem(FILES_KEY);
    const allFiles: FileItem[] = files ? JSON.parse(files) : [];
    return allFiles.filter(file => file.userId === userId);
  },

  storeFile(file: FileItem): void {
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    files.push(file);
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  },

  updateFile(fileId: string, updates: Partial<FileItem>): void {
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    const index = files.findIndex((f: FileItem) => f.id === fileId);
    if (index !== -1) {
      files[index] = { ...files[index], ...updates };
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  },

  deleteFile(fileId: string): void {
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    const filtered = files.filter((f: FileItem) => f.id !== fileId);
    localStorage.setItem(FILES_KEY, JSON.stringify(filtered));
  },

  // Task Management
  getTasks(userId: string): Task[] {
    const tasks = localStorage.getItem(TASKS_KEY);
    const allTasks: Task[] = tasks ? JSON.parse(tasks) : [];
    return allTasks.filter(task => task.userId === userId);
  },

  storeTask(task: Task): void {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    tasks.push(task);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  updateTask(taskId: string, updates: Partial<Task>): void {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    const index = tasks.findIndex((t: Task) => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  },

  deleteTask(taskId: string): void {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    const filtered = tasks.filter((t: Task) => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  },

  // Notes Management
  getNotes(userId: string): Note[] {
    const notes = localStorage.getItem(NOTES_KEY);
    const allNotes: Note[] = notes ? JSON.parse(notes) : [];
    return allNotes.filter(note => note.userId === userId);
  },

  storeNote(note: Note): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    notes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },

  updateNote(noteId: string, updates: Partial<Note>): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    const index = notes.findIndex((n: Note) => n.id === noteId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  },

  deleteNote(noteId: string): void {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    const filtered = notes.filter((n: Note) => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  },

  // AI Analysis
  getAIAnalysis(userId: string): AIAnalysis[] {
    const analysis = localStorage.getItem(AI_ANALYSIS_KEY);
    const allAnalysis: AIAnalysis[] = analysis ? JSON.parse(analysis) : [];
    return allAnalysis.filter(item => item.userId === userId);
  },

  storeAIAnalysis(analysis: AIAnalysis): void {
    const analyses = JSON.parse(localStorage.getItem(AI_ANALYSIS_KEY) || '[]');
    analyses.push(analysis);
    localStorage.setItem(AI_ANALYSIS_KEY, JSON.stringify(analyses));
  }
};