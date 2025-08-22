import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Share2, Lock, Unlock, Eye, Edit3, Save, 
  Link, Check, Copy, UserPlus, Settings, Globe,
  MessageSquare, Hash, Bold, Italic, List, 
  Type, Code, Quote, Image as ImageIcon
} from 'lucide-react';
import { db } from '../../config/firebase';
import { 
  doc, onSnapshot, updateDoc, setDoc, getDoc, 
  collection, query, where, orderBy, serverTimestamp,
  Timestamp, deleteField
} from 'firebase/firestore';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { x: number; y: number; line: number; column: number };
  selection?: { start: number; end: number };
  lastSeen: Timestamp;
  isOnline: boolean;
  permission: 'view' | 'edit' | 'admin';
}

interface Document {
  id: string;
  title: string;
  content: string;
  owner: string;
  collaborators: { [key: string]: Collaborator };
  permissions: {
    public: 'none' | 'view' | 'edit';
    linkSharing: boolean;
    requireAuth: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

interface ShareLink {
  url: string;
  permission: 'view' | 'edit';
  expiresAt?: Date;
}

const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8B739'
];

export const CollaborativeEditor: React.FC = () => {
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [permission, setPermission] = useState<'view' | 'edit'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorPositions = useRef<Map<string, HTMLDivElement>>(new Map());
  const saveTimeout = useRef<NodeJS.Timeout>();
  const documentId = useRef<string>('');

  // Initialize or load document
  useEffect(() => {
    initializeDocument();
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      cleanupPresence();
    };
  }, []);

  const initializeDocument = async () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    // Check for document ID in URL or create new
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('doc') || generateDocumentId();
    documentId.current = docId;

    try {
      const docRef = doc(db, 'documents', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Load existing document
        setupDocumentListeners(docId);
      } else {
        // Create new document
        const newDoc: Document = {
          id: docId,
          title: 'Untitled Document',
          content: '',
          owner: user.id,
          collaborators: {
            [user.id]: {
              id: user.id,
              name: user.name || 'Anonymous',
              email: user.email || '',
              color: CURSOR_COLORS[0],
              lastSeen: serverTimestamp() as Timestamp,
              isOnline: true,
              permission: 'admin'
            }
          },
          permissions: {
            public: 'none',
            linkSharing: false,
            requireAuth: true
          },
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          version: 1
        };

        await setDoc(docRef, newDoc);
        setupDocumentListeners(docId);
      }
    } catch (error) {
      console.error('Error initializing document:', error);
    }
  };

  const setupDocumentListeners = (docId: string) => {
    const docRef = doc(db, 'documents', docId);
    
    // Listen to document changes
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Document;
        setDocument(data);
        setContent(data.content);
        setTitle(data.title);
        
        // Update collaborators
        const collabArray = Object.values(data.collaborators || {});
        setCollaborators(collabArray.filter(c => c.isOnline));
        
        // Check user permission
        const user = realTimeAuth.getCurrentUser();
        if (user && data.collaborators[user.id]) {
          setPermission(data.collaborators[user.id].permission as 'view' | 'edit');
        }
      }
    });

    // Update presence
    updatePresence();
    const presenceInterval = setInterval(updatePresence, 30000); // Every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(presenceInterval);
    };
  };

  const updatePresence = async () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !documentId.current) return;

    try {
      const docRef = doc(db, 'documents', documentId.current);
      await updateDoc(docRef, {
        [`collaborators.${user.id}.lastSeen`]: serverTimestamp(),
        [`collaborators.${user.id}.isOnline`]: true
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const cleanupPresence = async () => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !documentId.current) return;

    try {
      const docRef = doc(db, 'documents', documentId.current);
      await updateDoc(docRef, {
        [`collaborators.${user.id}.isOnline`]: false
      });
    } catch (error) {
      console.error('Error cleaning up presence:', error);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (permission !== 'edit') return;
    
    setContent(newContent);
    setIsSaving(true);

    // Debounce save
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveDocument(newContent);
    }, 1000);
  };

  const saveDocument = async (newContent: string) => {
    if (!documentId.current) return;

    try {
      const docRef = doc(db, 'documents', documentId.current);
      await updateDoc(docRef, {
        content: newContent,
        updatedAt: serverTimestamp(),
        version: (document?.version || 0) + 1
      });
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving document:', error);
      setIsSaving(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (permission !== 'edit' || !documentId.current) return;
    
    setTitle(newTitle);
    
    try {
      const docRef = doc(db, 'documents', documentId.current);
      await updateDoc(docRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const generateShareLink = (linkPermission: 'view' | 'edit') => {
    const baseUrl = window.location.origin;
    const token = btoa(`${documentId.current}:${linkPermission}:${Date.now()}`);
    const url = `${baseUrl}/collaborate?token=${token}&doc=${documentId.current}`;
    
    setShareLink({
      url,
      permission: linkPermission,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink.url);
      // Show success toast
    }
  };

  const updateCursorPosition = (e: React.MouseEvent) => {
    const user = realTimeAuth.getCurrentUser();
    if (!user || !documentId.current || permission !== 'edit') return;

    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor position in Firebase
    const docRef = doc(db, 'documents', documentId.current);
    updateDoc(docRef, {
      [`collaborators.${user.id}.cursor`]: { x, y, line: 0, column: 0 }
    });
  };

  const generateDocumentId = () => {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatText = (command: string) => {
    if (permission !== 'edit') return;
    document.execCommand(command, false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none dark:text-white"
            placeholder="Untitled Document"
            disabled={permission !== 'edit'}
          />
          {isSaving && (
            <span className="text-sm text-gray-500 animate-pulse">Saving...</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Formatting Tools */}
          {permission === 'edit' && (
            <div className="flex items-center space-x-1 mr-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('insertUnorderedList')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('formatBlock')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Collaborators */}
          <div className="flex -space-x-2">
            {collaborators.slice(0, 3).map((collab) => (
              <div
                key={collab.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: collab.color }}
                title={collab.name}
              >
                {collab.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                +{collaborators.length - 3}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCollaborators(!showCollaborators)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 relative">
          <div
            ref={editorRef}
            contentEditable={permission === 'edit'}
            className="h-full p-8 outline-none dark:text-white overflow-auto"
            onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
            onMouseMove={updateCursorPosition}
            suppressContentEditableWarning={true}
          >
            {content || 'Start typing...'}
          </div>

          {/* Live Cursors */}
          {collaborators.map((collab) => {
            if (!collab.cursor || collab.id === realTimeAuth.getCurrentUser()?.id) return null;
            
            return (
              <div
                key={collab.id}
                className="absolute pointer-events-none transition-all duration-100"
                style={{
                  left: `${collab.cursor.x}px`,
                  top: `${collab.cursor.y}px`,
                }}
              >
                <div
                  className="w-0.5 h-5"
                  style={{ backgroundColor: collab.color }}
                />
                <div
                  className="px-2 py-1 text-xs text-white rounded mt-1"
                  style={{ backgroundColor: collab.color }}
                >
                  {collab.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collaborators Panel */}
        {showCollaborators && (
          <div className="w-64 border-l dark:border-gray-700 p-4">
            <h3 className="font-semibold mb-4 dark:text-white">Collaborators</h3>
            <div className="space-y-3">
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium dark:text-white">{collab.name}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      {collab.permission === 'admin' && <Lock className="w-3 h-3" />}
                      {collab.permission === 'edit' && <Edit3 className="w-3 h-3" />}
                      {collab.permission === 'view' && <Eye className="w-3 h-3" />}
                      <span>{collab.permission}</span>
                    </div>
                  </div>
                  {collab.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>

            <button className="w-full mt-4 p-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Share Document</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Permission Level
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => generateShareLink('view')}
                    className="flex-1 p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-sm">View Only</span>
                  </button>
                  <button
                    onClick={() => generateShareLink('edit')}
                    className="flex-1 p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Edit3 className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-sm">Can Edit</span>
                  </button>
                </div>
              </div>

              {shareLink && (
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Share Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareLink.url}
                      readOnly
                      className="flex-1 p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    />
                    <button
                      onClick={copyShareLink}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm dark:text-gray-300">Public Access</span>
                </div>
                <select className="text-sm border dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800">
                  <option>Restricted</option>
                  <option>Anyone with link can view</option>
                  <option>Anyone with link can edit</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
