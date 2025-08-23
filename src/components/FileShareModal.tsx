import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music,
  X, 
  Users, 
  Eye, 
  Edit3, 
  Shield,
  CheckCircle,
  XCircle,
  Tag
} from 'lucide-react';

interface FileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamMembers: Array<{ id: string; name: string; email: string }>;
  onFileShared: (file: any) => void;
}

interface FilePermissions {
  view: string[];
  edit: string[];
  admin: string[];
}

export const FileShareModal: React.FC<FileShareModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamMembers,
  onFileShared
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [permissions, setPermissions] = useState<FilePermissions>({
    view: [],
    edit: [],
    admin: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareType, setShareType] = useState<'upload' | 'url'>('upload');
  const [fileUrl, setFileUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleMemberPermission = (memberId: string, permission: keyof FilePermissions) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      
      // Remove from all permission levels first
      Object.keys(newPermissions).forEach(key => {
        newPermissions[key as keyof FilePermissions] = newPermissions[key as keyof FilePermissions]
          .filter(id => id !== memberId);
      });
      
      // Add to selected permission level
      if (!newPermissions[permission].includes(memberId)) {
        newPermissions[permission].push(memberId);
      }
      
      return newPermissions;
    });
  };

  const getMemberPermission = (memberId: string): keyof FilePermissions | null => {
    if (permissions.admin.includes(memberId)) return 'admin';
    if (permissions.edit.includes(memberId)) return 'edit';
    if (permissions.view.includes(memberId)) return 'view';
    return null;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8 text-green-500" />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText className="w-8 h-8 text-orange-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const handleShare = async () => {
    if (shareType === 'upload' && !selectedFile) {
      setError('Please select a file to share');
      return;
    }
    
    if (shareType === 'url' && !fileUrl.trim()) {
      setError('Please enter a file URL');
      return;
    }

    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fileContent = '';
      let fileSize = 0;
      let fileType = '';

      if (shareType === 'upload' && selectedFile) {
        fileSize = selectedFile.size;
        fileType = selectedFile.type;

        // Convert file to base64 for storage
        if (selectedFile.size < 5 * 1024 * 1024) { // 5MB limit
          const reader = new FileReader();
          fileContent = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        }
      } else if (shareType === 'url') {
        fileType = 'url';
        fileContent = fileUrl;
      }

      const fileData = {
        teamId,
        fileName: fileName.trim(),
        fileType,
        fileSize,
        content: fileContent,
        url: shareType === 'url' ? fileUrl : undefined,
        sharedBy: 'current-user-id', // This should come from auth context
        permissions,
        tags,
        description: description.trim()
      };

      // Call API to share file
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData)
      });

      if (!response.ok) {
        throw new Error('Failed to share file');
      }

      const result = await response.json();
      
      setSuccess('File shared successfully!');
      onFileShared(result.file);

      // Reset form
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error sharing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to share file');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setPermissions({ view: [], edit: [], admin: [] });
    setSuccess(null);
    setError(null);
    setFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Share File with Team
            </h2>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Share Type Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShareType('upload')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  shareType === 'upload'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setShareType('url')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  shareType === 'url'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Share URL
              </button>
            </div>
          </div>

          {/* File Selection */}
          {shareType === 'upload' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    {getFileIcon(selectedFile.type)}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to select a file</p>
                    <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File URL
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/file.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* File Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the file..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              File Permissions
            </label>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleMemberPermission(member.id, 'view')}
                      className={`p-2 rounded-lg transition-colors ${
                        getMemberPermission(member.id) === 'view'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleMemberPermission(member.id, 'edit')}
                      className={`p-2 rounded-lg transition-colors ${
                        getMemberPermission(member.id) === 'edit'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleMemberPermission(member.id, 'admin')}
                      className={`p-2 rounded-lg transition-colors ${
                        getMemberPermission(member.id) === 'admin'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Admin"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>View only</span>
                </div>
                <div className="flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  <span>Can edit</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Full access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={loading || (shareType === 'upload' && !selectedFile) || (shareType === 'url' && !fileUrl.trim()) || !fileName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Share File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};