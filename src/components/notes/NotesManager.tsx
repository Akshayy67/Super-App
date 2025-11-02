import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  FileText,
  Clock,
  Cloud,
  Download,
  Folder,
  FolderPlus,
  Check,
  X,
  Move,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ShortNote, NoteFolder } from "../types";
import { storageUtils } from "../../utils/storage";
import { driveStorageUtils } from "../../utils/driveStorage";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { format } from "date-fns";
import { GeneralLayout } from "../layout/PageLayout";

export const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<ShortNote[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<ShortNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: "",
    folderId: "",
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Try to load from Google Drive first
      const driveNotes = await driveStorageUtils.loadShortNotesFromDrive(
        user.id
      );
      if (driveNotes.length > 0) {
        console.log("📱 Loaded notes from Google Drive:", driveNotes.length);
        setNotes(
          driveNotes.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        );
      }
    } catch (error) {
      console.log("📱 Falling back to localStorage for notes");
    }

    // Fallback to localStorage
    const userNotes = storageUtils.getShortNotes(user.id);
    setNotes(
      userNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );

    // Load folders
    const userFolders = storageUtils.getNoteFolders(user.id);
    setFolders(userFolders);
  };

  const syncNotesToDrive = async () => {
    if (!user) return;

    try {
      const success = await driveStorageUtils.saveShortNotesToDrive(
        notes,
        user.id
      );
      if (success) {
        console.log("✅ Notes synced to Google Drive successfully");
      } else {
        console.log("📱 Notes saved to localStorage only");
      }
    } catch (error) {
      console.error("Error syncing notes to Drive:", error);
    }
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    // Filter by folder
    if (selectedFolderId !== null) {
      if (selectedFolderId === "") {
        // Show only uncategorized notes (no folder)
        filtered = filtered.filter((note) => !note.folderId);
      } else {
        // Show notes in specific folder
        filtered = filtered.filter((note) => note.folderId === selectedFolderId);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const resetForm = () => {
    setNoteForm({
      title: "",
      content: "",
      tags: "",
      folderId: "",
    });
  };

  const handleSaveNote = async () => {
    console.log("handleSaveNote called", { user, noteForm });

    if (!user) {
      console.error("No user found");
      alert("Please sign in to save notes.");
      return;
    }

    if (!noteForm.title.trim()) {
      console.error("No title provided");
      alert("Please enter a title for your note.");
      return;
    }

    const tags = noteForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      if (editingNote) {
        console.log("Updating existing note:", editingNote.id);
        const updates = {
          title: noteForm.title.trim(),
          content: noteForm.content.trim(),
          tags,
          folderId: noteForm.folderId || undefined,
        };
        storageUtils.updateShortNote(editingNote.id, updates);

        // Update the notes state
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === editingNote.id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          )
        );
      } else {
        console.log("Creating new note");
        const newNote: ShortNote = {
          id: storageUtils.generateId(),
          title: noteForm.title.trim(),
          content: noteForm.content.trim(),
          tags,
          userId: user.id,
          folderId: noteForm.folderId || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storageUtils.storeShortNote(newNote);

        // Add to notes state
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }

      // Sync to Google Drive
      await syncNotesToDrive();

      resetForm();
      setShowEditor(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  const startEditing = (note: ShortNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
      folderId: note.folderId || "",
    });
    setShowEditor(true);
  };

  const deleteShortNote = async (noteId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to delete this note?")) {
      storageUtils.deleteShortNote(noteId);

      // Remove from notes state
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

      // Sync to Google Drive
      await syncNotesToDrive();
    }
  };

  const handleCreateFolder = () => {
    if (!user || !newFolderName.trim()) return;

    const newFolder: NoteFolder = {
      id: storageUtils.generateId(),
      name: newFolderName.trim(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageUtils.storeNoteFolder(newFolder);
    setFolders((prevFolders) => [...prevFolders, newFolder]);
    setNewFolderName("");
    setShowFolderModal(false);
    setExpandedFolders(new Set([...expandedFolders, newFolder.id]));
  };

  const handleEditFolder = () => {
    if (!user || !editingFolder || !newFolderName.trim()) return;

    storageUtils.updateNoteFolder(editingFolder.id, { name: newFolderName.trim() });
    setFolders((prevFolders) =>
      prevFolders.map((f) =>
        f.id === editingFolder.id
          ? { ...f, name: newFolderName.trim(), updatedAt: new Date().toISOString() }
          : f
      )
    );
    setEditingFolder(null);
    setNewFolderName("");
    setShowFolderModal(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? All notes will be moved to uncategorized.")) {
      return;
    }

    storageUtils.deleteNoteFolder(folderId);
    setFolders((prevFolders) => prevFolders.filter((f) => f.id !== folderId));
    loadData(); // Reload notes to update folderId
  };

  const handleRenameFolder = (folder: NoteFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setShowFolderModal(true);
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const getNotesInFolder = (folderId: string) => {
    return notes.filter((note) => note.folderId === folderId);
  };

  const getUncategorizedNotes = () => {
    return notes.filter((note) => !note.folderId);
  };

  const handleBulkToggle = (noteId: string) => {
    setSelectedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filteredNotes = getFilteredNotes();
    if (selectedNotes.size === filteredNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(filteredNotes.map((n) => n.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedNotes.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedNotes.size} note(s)?`)) {
      return;
    }

    storageUtils.deleteMultipleNotes(Array.from(selectedNotes));
    setNotes((prevNotes) => prevNotes.filter((note) => !selectedNotes.has(note.id)));
    setSelectedNotes(new Set());
    setBulkMode(false);
    await syncNotesToDrive();
  };

  const handleBulkMove = (targetFolderId: string | undefined) => {
    if (!user || selectedNotes.size === 0) return;

    storageUtils.moveNotesToFolder(Array.from(selectedNotes), targetFolderId);
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        selectedNotes.has(note.id)
          ? { ...note, folderId: targetFolderId, updatedAt: new Date().toISOString() }
          : note
      )
    );
    setSelectedNotes(new Set());
    setBulkMode(false);
    setShowMoveModal(false);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const folderNotesCount = notes.filter((note) => note.folderId).length;
  const uncategorizedCount = notes.length - folderNotesCount;

  return (
    <GeneralLayout>
      <div
        className="min-h-screen flex flex-col scroll-area transition-colors duration-300"
        data-component="notes"
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 p-responsive">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
                Short Notes
              </h2>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
              {bulkMode && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="btn-touch flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setShowMoveModal(true)}
                    disabled={selectedNotes.size === 0}
                    className="btn-touch flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm touch-manipulation disabled:opacity-50"
                  >
                    <Move className="w-4 h-4 mr-1" />
                    Move
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedNotes.size === 0}
                    className="btn-touch flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm touch-manipulation disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete ({selectedNotes.size})
                  </button>
                  <button
                    onClick={() => {
                      setBulkMode(false);
                      setSelectedNotes(new Set());
                    }}
                    className="btn-touch flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!bulkMode && (
                <>
                  <button
                    onClick={() => setBulkMode(true)}
                    className="btn-touch flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm touch-manipulation"
                    title="Bulk operations"
                  >
                    <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Bulk</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingFolder(null);
                      setNewFolderName("");
                      setShowFolderModal(true);
                    }}
                    className="btn-touch flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm touch-manipulation"
                    title="Create folder"
                  >
                    <FolderPlus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Folder</span>
                  </button>
                  <button
                    onClick={syncNotesToDrive}
                    className="btn-touch flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm touch-manipulation"
                    title="Sync notes to Google Drive"
                  >
                    <Cloud className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Sync</span>
                  </button>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="btn-touch flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">New Note</span>
                    <span className="xs:hidden">New</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search notes by title, content, tags, or folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Folder Navigation */}
          {!searchQuery && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  selectedFolderId === null
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="font-medium">All Notes</span>
                  <span className="ml-2 text-sm opacity-70">({notes.length})</span>
                </div>
              </button>

              {getUncategorizedNotes().length > 0 && (
                <button
                  onClick={() => setSelectedFolderId("")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedFolderId === ""
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    <span className="font-medium">Uncategorized</span>
                    <span className="ml-2 text-sm opacity-70">({uncategorizedCount})</span>
                  </div>
                </button>
              )}

              {folders.map((folder) => {
                const notesInFolder = getNotesInFolder(folder.id);
                const isExpanded = expandedFolders.has(folder.id);
                return (
                  <div key={folder.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <button
                      onClick={() => toggleFolderExpansion(folder.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 mr-2" />
                        ) : (
                          <ChevronRight className="w-5 h-5 mr-2" />
                        )}
                        <Folder className="w-5 h-5 mr-2" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {folder.name}
                        </span>
                        <span className="ml-2 text-sm opacity-70">({notesInFolder.length})</span>
                      </div>
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        {!bulkMode && (
                          <>
                            <button
                              onClick={() => handleRenameFolder(folder)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Rename folder"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(folder.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete folder"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`w-full flex items-center p-3 pl-12 rounded-lg transition-colors ${
                          selectedFolderId === folder.id
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        View notes in this folder
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Short Notes Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredNotes().map((note) => {
              const isSelected = selectedNotes.has(note.id);
              const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;

              return (
                <div
                  key={note.id}
                  className={`border rounded-lg p-4 transition-all group bg-white dark:bg-slate-800 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-700 hover:shadow-md"
                  }`}
                >
                  {bulkMode && (
                    <div className="mb-3">
                      <button
                        onClick={() => handleBulkToggle(note.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
                        {note.title}
                      </h3>
                      {folder && (
                        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Folder className="w-3 h-3 mr-1" />
                          {folder.name}
                        </div>
                      )}
                    </div>
                    {!bulkMode && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteShortNote(note.id)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {truncateContent(note.content)}
                    </p>
                  </div>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(note.updatedAt), "MMM dd, yyyy")}
                    </div>
                    {!bulkMode && (
                      <button
                        onClick={() => startEditing(note)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Read more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {getFilteredNotes().length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first short note to organize your study thoughts and insights"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowEditor(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Short Note
                </button>
              )}
            </div>
          )}
        </div>

        {/* Note Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {editingNote ? "Edit Short Note" : "Create New Short Note"}
                </h3>
              </div>

              <div className="flex-1 p-6 space-y-4 overflow-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter short note title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Folder
                  </label>
                  <select
                    value={noteForm.folderId}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, folderId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Uncategorized</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={noteForm.tags}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, tags: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter tags separated by commas (e.g., math, calculus, derivatives)"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, content: e.target.value })
                    }
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Write your short note content here..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingNote(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!noteForm.title.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNote ? "Update" : "Save"} Short Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Folder Modal */}
        {showFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {editingFolder ? "Rename Folder" : "Create New Folder"}
                </h3>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter folder name"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      if (editingFolder) {
                        handleEditFolder();
                      } else {
                        handleCreateFolder();
                      }
                    }
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowFolderModal(false);
                    setEditingFolder(null);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFolder ? handleEditFolder : handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingFolder ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Notes Modal */}
        {showMoveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Move Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Move {selectedNotes.size} note(s) to:
                </p>
              </div>

              <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
                <button
                  onClick={() => handleBulkMove(undefined)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    <span className="font-medium">Uncategorized</span>
                  </div>
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleBulkMove(folder.id)}
                    className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <Folder className="w-5 h-5 mr-2" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GeneralLayout>
  );
};
