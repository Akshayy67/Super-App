import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  FileText,
  Clock,
} from "lucide-react";
import { Note } from "../types";
import { storageUtils } from "../utils/storage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { format } from "date-fns";

export const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
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

  const loadNotes = () => {
    if (!user) return;
    const userNotes = storageUtils.getNotes(user.id);
    setNotes(
      userNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
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

  const handleSaveNote = () => {
    console.log("handleSaveNote called", { user, noteForm });

    if (!user) {
      console.error("No user found");
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
        storageUtils.updateNote(editingNote.id, updates);
      } else {
        console.log("Creating new note");
        const newNote: Note = {
          id: storageUtils.generateId(),
          title: noteForm.title.trim(),
          content: noteForm.content.trim(),
          tags,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log("New note object:", newNote);
        storageUtils.storeNote(newNote);
        console.log("Note stored successfully");
      }

      resetForm();
      setShowEditor(false);
      setEditingNote(null);
      loadNotes();
      console.log("Note save completed");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    setShowEditor(true);
  };

  const deleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      storageUtils.deleteNote(noteId);
      loadNotes();
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredNotes().map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex-1 pr-2 line-clamp-2">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(note)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 leading-relaxed">
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
                    <span className="text-xs text-gray-500">
                      +{note.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
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
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first note to organize your study thoughts and insights"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowEditor(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Note
              </button>
            )}
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingNote ? "Edit Note" : "Create New Note"}
              </h3>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={noteForm.tags}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, tags: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas (e.g., math, calculus, derivatives)"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your note content here..."
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteForm.title.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingNote ? "Update" : "Save"} Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
