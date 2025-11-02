import React, { useState, useEffect } from "react";
import { X, FileText, Tag, Save, Copy, Check, Folder } from "lucide-react";
import { ShortNote, NoteFolder } from "../types";
import { storageUtils } from "../../utils/storage";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface GlobalNoteCreatorProps {
  isVisible: boolean;
  onClose: () => void;
  copiedText: string;
  sourceContext?: string;
}

export const GlobalNoteCreator: React.FC<GlobalNoteCreatorProps> = ({
  isVisible,
  onClose,
  copiedText,
  sourceContext = "Copied Text",
}) => {
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: "",
    folderId: "",
  });
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCopiedIndicator, setShowCopiedIndicator] = useState(false);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      const userFolders = storageUtils.getNoteFolders(user.id);
      setFolders(userFolders);
    }
  }, [user]);

  useEffect(() => {
    if (isVisible && copiedText) {
      // Auto-populate the content with the copied text
      setNoteForm({
        title: `${sourceContext} - ${new Date().toLocaleDateString()}`,
        content: copiedText,
        tags: "",
        folderId: "",
      });
      setSaveSuccess(false);
    }
  }, [isVisible, copiedText, sourceContext]);

  const handleSaveNote = async () => {
    if (!user || !noteForm.title.trim()) {
      alert("Please enter a title for your note.");
      return;
    }

    setIsSaving(true);
    try {
      const tags = noteForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

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

      // Store to localStorage
      storageUtils.storeShortNote(newNote);

      // Also try to store to Google Drive
      try {
        await storageUtils.storeShortNoteToDrive(newNote);
      } catch (error) {
        console.log(
          "Google Drive storage failed, but note saved locally:",
          error
        );
      }
      setSaveSuccess(true);

      // Show success state briefly before closing
      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copiedText);
      setShowCopiedIndicator(true);
      setTimeout(() => setShowCopiedIndicator(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setNoteForm({ title: "", content: "", tags: "", folderId: "" });
      setSaveSuccess(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create Note from Copied Text
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Source Context */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Source: {sourceContext}
              </span>
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showCopiedIndicator ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Again</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={noteForm.title}
              onChange={(e) =>
                setNoteForm({ ...noteForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter note title..."
            />
          </div>

          {/* Folder Selection */}
          {folders.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder
              </label>
              <select
                value={noteForm.folderId}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, folderId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Uncategorized</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note Content
            </label>
            <textarea
              value={noteForm.content}
              onChange={(e) =>
                setNoteForm({ ...noteForm, content: e.target.value })
              }
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Note content..."
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={noteForm.tags}
              onChange={(e) =>
                setNoteForm({ ...noteForm, tags: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="e.g., study, important, reference"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveNote}
            disabled={isSaving || !noteForm.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
