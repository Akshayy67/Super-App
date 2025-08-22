import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Edit3,
  Users,
  Share2,
  Lock,
  Unlock,
  MessageSquare,
  Circle,
  AlertCircle,
  Check,
  Globe
} from 'lucide-react';
import { realTimeAuth } from '../utils/realTimeAuth';
import { collaborationService, UserPresence, CollaborativeEdit } from '../services/collaborationService';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

interface CollaborativeNote {
  id: string;
  title: string;
  content: string;
  owner: string;
  collaborators: string[];
  isPublic: boolean;
  lastEdited: Date;
  lastEditedBy: string;
  version: number;
  tags?: string[];
  locked?: boolean;
  lockedBy?: string;
}

interface Comment {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  position?: { line: number; column: number };
  resolved: boolean;
}

export const CollaborativeNotes: React.FC = () => {
  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<CollaborativeNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasLock, setHasLock] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const user = realTimeAuth.getCurrentUser();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
    
    return () => {
      if (selectedNote) {
        collaborationService.updatePresence('offline');
        if (hasLock) {
          collaborationService.releaseLock(selectedNote.id);
        }
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedNote) {
      loadNoteDetails(selectedNote.id);
      subscribeToNoteUpdates(selectedNote.id);
      subscribeToPresence(selectedNote.id);
      subscribeToComments(selectedNote.id);
      
      // Update presence
      collaborationService.updatePresence('online', selectedNote.id);
    }
  }, [selectedNote]);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      const notesRef = collection(db, 'collaborativeNotes');
      const unsubscribe = onSnapshot(notesRef, (snapshot) => {
        const loadedNotes: CollaborativeNote[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.owner === user.id || data.collaborators?.includes(user.id) || data.isPublic) {
            loadedNotes.push({
              id: doc.id,
              ...data,
              lastEdited: data.lastEdited?.toDate()
            } as CollaborativeNote);
          }
        });
        setNotes(loadedNotes);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadNoteDetails = async (noteId: string) => {
    try {
      const noteDoc = await getDoc(doc(db, 'collaborativeNotes', noteId));
      if (noteDoc.exists()) {
        const data = noteDoc.data();
        setNoteTitle(data.title);
        setNoteContent(data.content);
        setLastSaved(data.lastEdited?.toDate());
      }
    } catch (error) {
      console.error('Error loading note details:', error);
    }
  };

  const subscribeToNoteUpdates = (noteId: string) => {
    const noteRef = doc(db, 'collaborativeNotes', noteId);
    
    const unsubscribe = onSnapshot(noteRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const updatedNote = {
          id: doc.id,
          ...data,
          lastEdited: data.lastEdited?.toDate()
        } as CollaborativeNote;
        
        // Update local state if not currently editing
        if (!isEditing && data.lastEditedBy !== user?.id) {
          setNoteContent(data.content);
          setNoteTitle(data.title);
          setLastSaved(data.lastEdited?.toDate());
        }
        
        setSelectedNote(updatedNote);
      }
    });
    
    return unsubscribe;
  };

  const subscribeToPresence = (noteId: string) => {
    return collaborationService.subscribeToPresence(noteId, (users) => {
      setActiveUsers(users.filter(u => u.userId !== user?.id));
    });
  };

  const subscribeToComments = (noteId: string) => {
    return collaborationService.subscribeToComments(noteId, (loadedComments) => {
      setComments(loadedComments as Comment[]);
    });
  };

  const subscribeToEdits = (noteId: string) => {
    return collaborationService.subscribeToEdits(noteId, (edit: CollaborativeEdit) => {
      // Apply collaborative edits
      if (!isEditing && contentRef.current) {
        const currentContent = contentRef.current.value;
        let newContent = currentContent;
        
        switch (edit.operation) {
          case 'insert':
            newContent = 
              currentContent.slice(0, edit.position) + 
              edit.content + 
              currentContent.slice(edit.position);
            break;
          case 'delete':
            newContent = 
              currentContent.slice(0, edit.position) + 
              currentContent.slice(edit.position + (edit.length || 0));
            break;
          case 'replace':
            newContent = 
              currentContent.slice(0, edit.position) + 
              edit.content + 
              currentContent.slice(edit.position + (edit.length || 0));
            break;
        }
        
        setNoteContent(newContent);
      }
    });
  };

  const createNote = async () => {
    if (!user) return;
    
    const newNote: CollaborativeNote = {
      id: Date.now().toString(),
      title: 'New Collaborative Note',
      content: '',
      owner: user.id,
      collaborators: [],
      isPublic: false,
      lastEdited: new Date(),
      lastEditedBy: user.id,
      version: 1
    };
    
    try {
      await setDoc(doc(db, 'collaborativeNotes', newNote.id), {
        ...newNote,
        lastEdited: serverTimestamp()
      });
      
      setSelectedNote(newNote);
      setNoteTitle(newNote.title);
      setNoteContent(newNote.content);
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const saveNote = async () => {
    if (!selectedNote || !user) return;
    
    setIsSaving(true);
    
    try {
      await updateDoc(doc(db, 'collaborativeNotes', selectedNote.id), {
        title: noteTitle,
        content: noteContent,
        lastEdited: serverTimestamp(),
        lastEditedBy: user.id,
        version: (selectedNote.version || 0) + 1
      });
      
      setLastSaved(new Date());
      
      // Log activity
      await collaborationService.logActivity(
        selectedNote.id,
        'edited note',
        { title: noteTitle }
      );
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (isEditing && selectedNote) {
        saveNote();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [isEditing, selectedNote, noteTitle, noteContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const position = e.target.selectionStart;
    
    // Send collaborative edit
    if (selectedNote && user) {
      const operation = newContent.length > noteContent.length ? 'insert' : 'delete';
      const content = operation === 'insert' 
        ? newContent.slice(position - 1, position)
        : undefined;
      const length = operation === 'delete'
        ? noteContent.length - newContent.length
        : undefined;
      
      collaborationService.sendEdit(
        selectedNote.id,
        operation,
        position,
        content,
        length
      );
    }
    
    setNoteContent(newContent);
    autoSave();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(e.target.value);
    autoSave();
  };

  const startEditing = async () => {
    if (!selectedNote || !user) return;
    
    // Try to acquire lock
    const lockAcquired = await collaborationService.acquireLock(selectedNote.id);
    
    if (lockAcquired) {
      setIsEditing(true);
      setHasLock(true);
    } else {
      alert('This note is currently being edited by another user. You can view but not edit.');
    }
  };

  const stopEditing = async () => {
    if (selectedNote && hasLock) {
      await saveNote();
      await collaborationService.releaseLock(selectedNote.id);
      setHasLock(false);
    }
    setIsEditing(false);
  };

  const shareNote = async () => {
    if (!selectedNote || !user || !shareEmail) return;
    
    try {
      // In a real app, you'd look up the user by email
      // For now, we'll just add the email to collaborators
      await updateDoc(doc(db, 'collaborativeNotes', selectedNote.id), {
        collaborators: [...(selectedNote.collaborators || []), shareEmail]
      });
      
      await collaborationService.logActivity(
        selectedNote.id,
        `shared note with ${shareEmail}`
      );
      
      setShareEmail('');
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  };

  const togglePublic = async () => {
    if (!selectedNote || !user) return;
    
    try {
      await updateDoc(doc(db, 'collaborativeNotes', selectedNote.id), {
        isPublic: !selectedNote.isPublic
      });
      
      await collaborationService.logActivity(
        selectedNote.id,
        selectedNote.isPublic ? 'made note private' : 'made note public'
      );
    } catch (error) {
      console.error('Error toggling public status:', error);
    }
  };

  const addComment = async (content: string) => {
    if (!selectedNote || !user) return;
    
    await collaborationService.addComment(selectedNote.id, content);
  };

  return (
    <div className="h-full flex">
      {/* Notes List */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNote}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            New Note
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedNote?.id === note.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {note.lastEdited?.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {note.isPublic && <Globe className="w-3 h-3 text-green-600" />}
                  {note.locked && <Lock className="w-3 h-3 text-red-600" />}
                  {note.collaborators?.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                      {note.collaborators.length}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      {selectedNote ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={noteTitle}
                onChange={handleTitleChange}
                disabled={!isEditing}
                className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none flex-1"
                placeholder="Note Title"
              />
              <div className="flex items-center gap-2">
                {/* Active Users */}
                {activeUsers.length > 0 && (
                  <div className="flex items-center gap-1">
                    {activeUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: user.color }}
                        title={user.userName}
                      >
                        {user.userName[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopEditing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Circle className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Done
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                <button
                  onClick={togglePublic}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={selectedNote.isPublic ? 'Make Private' : 'Make Public'}
                >
                  {selectedNote.isPublic ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <MessageSquare className="w-5 h-5" />
                  {comments.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {comments.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Version {selectedNote.version || 1}</span>
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
              {selectedNote.locked && selectedNote.lockedBy !== user?.id && (
                <span className="text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Locked by another user
                </span>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            <div className="flex-1 p-4">
              <textarea
                ref={contentRef}
                value={noteContent}
                onChange={handleContentChange}
                disabled={!isEditing}
                className="w-full h-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start typing your note..."
              />
            </div>

            {/* Comments Panel */}
            {showComments && (
              <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>
                
                <div className="space-y-3 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {comment.timestamp?.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.comment as HTMLInputElement;
                    if (input.value) {
                      addComment(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Note Selected</h2>
            <p className="text-gray-600 mb-4">Create or select a note to start collaborating</p>
            <button
              onClick={createNote}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Edit3 className="w-5 h-5" />
              Create New Note
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Share Note</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                shareNote();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {selectedNote?.collaborators && selectedNote.collaborators.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Collaborators:</p>
                  <div className="space-y-1">
                    {selectedNote.collaborators.map((email) => (
                      <div key={email} className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
