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
} from "lucide-react";
import { ShortNote } from "../types";
import { storageUtils } from "../../utils/storage";
import { driveStorageUtils } from "../../utils/driveStorage";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { format } from "date-fns";
import { GeneralLayout } from "../layout/PageLayout";

export const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<ShortNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<ShortNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
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
        return;
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
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  };

  const resetForm = () => {
    setNoteForm({
      title: "",
      content: "",
      tags: "",
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

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
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search short notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Short Notes Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredNotes().map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow group bg-white dark:bg-slate-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1 pr-2 line-clamp-2">
                    {note.title}
                  </h3>
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
                  <button
                    onClick={() => startEditing(note)}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Read more
                  </button>
                </div>
              </div>
            ))}
          </div>

          {getFilteredNotes().length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? "No short notes found" : "No short notes yet"}
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
      </div>
    </GeneralLayout>
  );
};
