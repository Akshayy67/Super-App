import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Search,
  Filter,
  File,
  Link as LinkIcon,
  Paperclip,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Tag,
  X,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { Doubt, DoubtDiscussion as DoubtDiscussionType, RelatedMaterial } from '../types/doubtTypes';
import { doubtService } from '../utils/doubtService';

interface DoubtDiscussionProps {
  teamId: string;
  userId: string;
  userName: string;
  userRole: string;
  className?: string;
}

type ViewMode = 'list' | 'detail';
type FilterStatus = 'all' | 'open' | 'resolved' | 'closed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';

export const DoubtDiscussionComponent: React.FC<DoubtDiscussionProps> = ({
  teamId,
  userId,
  userName,
  userRole,
  className = '',
}) => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [discussions, setDiscussions] = useState<DoubtDiscussionType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Form states
  const [doubtForm, setDoubtForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    tags: '',
  });
  const [replyContent, setReplyContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [relatedLink, setRelatedLink] = useState({ title: '', url: '' });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [teamFiles, setTeamFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Load doubts on mount
  useEffect(() => {
    loadDoubts();
    loadTeamFiles();
  }, [teamId, filterStatus, filterPriority]);

  const loadTeamFiles = async () => {
    try {
      const files = await doubtService.getTeamFiles(teamId);
      setTeamFiles(files);
    } catch (err) {
      console.error('Failed to load team files:', err);
    }
  };

  // Load discussions when doubt is selected
  useEffect(() => {
    if (selectedDoubt) {
      loadDiscussions(selectedDoubt.id);
    }
  }, [selectedDoubt]);

  const loadDoubts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filter = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
      };

      let loadedDoubts = await doubtService.getDoubtsByTeam(teamId, filter);

      // Apply search filter
      if (searchQuery.trim()) {
        loadedDoubts = await doubtService.searchDoubts(teamId, searchQuery);
      }

      setDoubts(loadedDoubts);
    } catch (err) {
      setError('Failed to load doubts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscussions = async (doubtId: string) => {
    try {
      const loadedDiscussions = await doubtService.getDiscussions(doubtId);
      setDiscussions(loadedDiscussions);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    }
  };

  const handleCreateDoubt = async () => {
    if (!doubtForm.title.trim() || !doubtForm.description.trim()) {
      setError('Please provide title and description');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Upload attachments
      const uploadedAttachments = await Promise.all(
        attachments.map(file => doubtService.uploadAttachment(file, teamId, userId))
      );

      // Create related materials from selected files
      const relatedMaterials: Omit<RelatedMaterial, 'id' | 'addedAt'>[] = selectedFiles.map(fileId => {
        const file = teamFiles.find(f => f.id === fileId);
        return {
          title: file?.name || 'File',
          type: 'file' as const,
          fileId,
          url: file?.url || '',
          addedBy: userId,
        };
      });

      const newDoubt = await doubtService.createDoubt({
        title: doubtForm.title,
        description: doubtForm.description,
        authorId: userId,
        authorName: userName,
        teamId,
        status: 'open',
        priority: doubtForm.priority,
        tags: doubtForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        attachments: uploadedAttachments,
        relatedMaterials: [],
        discussions: [],
      });

      // Add related materials after creation
      for (const material of relatedMaterials) {
        await doubtService.addRelatedMaterial(newDoubt.id, material);
      }

      setDoubts([newDoubt, ...doubts]);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to create doubt');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!selectedDoubt || !replyContent.trim()) return;

    try {
      setIsLoading(true);

      // Upload attachments for reply
      const uploadedAttachments = await Promise.all(
        attachments.map(file => doubtService.uploadAttachment(file, teamId, userId))
      );

      const newDiscussion = await doubtService.addDiscussion({
        doubtId: selectedDoubt.id,
        authorId: userId,
        authorName: userName,
        content: replyContent,
        isSolution: false,
        attachments: uploadedAttachments,
        upvotes: 0,
        downvotes: 0,
        reactions: [],
      });

      setDiscussions([...discussions, newDiscussion]);
      setReplyContent('');
      setAttachments([]);
    } catch (err) {
      setError('Failed to add reply');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRelatedLink = async () => {
    if (!selectedDoubt || !relatedLink.url.trim()) return;

    try {
      await doubtService.addRelatedMaterial(selectedDoubt.id, {
        title: relatedLink.title || relatedLink.url,
        type: 'link',
        url: relatedLink.url,
        addedBy: userId,
      });

      // Reload doubt to get updated materials
      const updatedDoubt = await doubtService.getDoubt(selectedDoubt.id);
      if (updatedDoubt) {
        setSelectedDoubt(updatedDoubt);
        setDoubts(doubts.map(d => d.id === updatedDoubt.id ? updatedDoubt : d));
      }

      setRelatedLink({ title: '', url: '' });
      setShowLinkInput(false);
    } catch (err) {
      setError('Failed to add related link');
      console.error(err);
    }
  };

  const handleResolveDoubt = async (doubtId: string) => {
    try {
      await doubtService.resolveDoubt(doubtId, userId);
      await loadDoubts();
      if (selectedDoubt?.id === doubtId) {
        const updatedDoubt = await doubtService.getDoubt(doubtId);
        if (updatedDoubt) setSelectedDoubt(updatedDoubt);
      }
    } catch (err) {
      setError('Failed to resolve doubt');
      console.error(err);
    }
  };

  const handleReopenDoubt = async (doubtId: string) => {
    try {
      await doubtService.reopenDoubt(doubtId);
      await loadDoubts();
      if (selectedDoubt?.id === doubtId) {
        const updatedDoubt = await doubtService.getDoubt(doubtId);
        if (updatedDoubt) setSelectedDoubt(updatedDoubt);
      }
    } catch (err) {
      setError('Failed to reopen doubt');
      console.error(err);
    }
  };

  const handleDeleteDoubt = async (doubtId: string) => {
    if (!confirm('Are you sure you want to delete this doubt?')) return;

    try {
      await doubtService.deleteDoubt(doubtId);
      setDoubts(doubts.filter(d => d.id !== doubtId));
      if (selectedDoubt?.id === doubtId) {
        setSelectedDoubt(null);
        setViewMode('list');
      }
    } catch (err) {
      setError('Failed to delete doubt');
      console.error(err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const resetForm = () => {
    setDoubtForm({
      title: '',
      description: '',
      priority: 'medium',
      tags: '',
    });
    setAttachments([]);
    setRelatedLink({ title: '', url: '' });
    setSelectedFiles([]);
    setShowFilePicker(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'closed': return <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex h-full bg-gray-50 dark:bg-slate-900 ${className}`}>
      {/* Sidebar - Doubt List */}
      <div className={`${viewMode === 'detail' ? 'hidden md:block md:w-1/3' : 'w-full'} border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Doubt Discussion
              </h2>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Create New Doubt"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDoubts()}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFilters && (
            <div className="mt-2 space-y-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Doubts List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && doubts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : doubts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Brain className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-center">No doubts yet</p>
              <p className="text-sm text-center mt-2">Create your first doubt to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {doubts.map((doubt) => (
                <div
                  key={doubt.id}
                  onClick={() => {
                    setSelectedDoubt(doubt);
                    setViewMode('detail');
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                    selectedDoubt?.id === doubt.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(doubt.status)}
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {doubt.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {doubt.description}
                      </p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(doubt.priority)}`}>
                      {doubt.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{doubt.authorName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{doubt.discussions.length}</span>
                      </span>
                      {doubt.relatedMaterials.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <File className="w-3 h-3" />
                          <span>{doubt.relatedMaterials.length}</span>
                        </span>
                      )}
                    </div>
                    <span>{formatDate(doubt.createdAt)}</span>
                  </div>

                  {doubt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doubt.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Doubt Detail */}
      {viewMode === 'detail' && selectedDoubt ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
          {/* Detail Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(selectedDoubt.status)}
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedDoubt.title}
                  </h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedDoubt.priority)}`}>
                    {selectedDoubt.priority}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{selectedDoubt.authorName}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedDoubt.createdAt)}</span>
                  </span>
                </div>

                {selectedDoubt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDoubt.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {selectedDoubt.status === 'open' ? (
                  <button
                    onClick={() => handleResolveDoubt(selectedDoubt.id)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReopenDoubt(selectedDoubt.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reopen
                  </button>
                )}

                {(selectedDoubt.authorId === userId || userRole === 'admin') && (
                  <button
                    onClick={() => handleDeleteDoubt(selectedDoubt.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {selectedDoubt.description}
            </p>

            {/* Attachments */}
            {selectedDoubt.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Attachments
                </h4>
                <div className="space-y-2">
                  {selectedDoubt.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>{attachment.fileName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Materials */}
            {selectedDoubt.relatedMaterials.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-2">
                  <File className="w-4 h-4" />
                  <span>Linked Files & Resources ({selectedDoubt.relatedMaterials.length})</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedDoubt.relatedMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <a
                        href={material.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-sm flex-1 group"
                      >
                        <div className={`p-2 rounded ${material.type === 'link' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                          {material.type === 'link' ? (
                            <LinkIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                            {material.title}
                          </div>
                          {material.type === 'link' && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {material.url}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Related Link */}
            <div className="mt-4">
              {!showLinkInput ? (
                <button
                  onClick={() => setShowLinkInput(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Add related link or file</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    value={relatedLink.title}
                    onChange={(e) => setRelatedLink({ ...relatedLink, title: e.target.value })}
                    className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={relatedLink.url}
                    onChange={(e) => setRelatedLink({ ...relatedLink, url: e.target.value })}
                    className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddRelatedLink}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowLinkInput(false);
                        setRelatedLink({ title: '', url: '' });
                      }}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Discussions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Discussion ({discussions.length})
            </h3>

            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                className={`p-3 rounded-lg ${
                  discussion.isSolution
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {discussion.authorName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(discussion.createdAt)}
                    </span>
                    {discussion.isSolution && (
                      <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                        Solution
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {discussion.content}
                </p>

                {discussion.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {discussion.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{attachment.fileName}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{file.name}</span>
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-red-600 dark:text-red-400 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Paperclip className="w-4 h-4" />
                  <span>Attach files</span>
                </label>

                <button
                  onClick={handleAddReply}
                  disabled={!replyContent.trim() || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'list' ? null : (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Select a doubt to view discussion</p>
          </div>
        </div>
      )}

      {/* Create Doubt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Create New Doubt
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={doubtForm.title}
                    onChange={(e) => setDoubtForm({ ...doubtForm, title: e.target.value })}
                    placeholder="Brief title for your doubt"
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={doubtForm.description}
                    onChange={(e) => setDoubtForm({ ...doubtForm, description: e.target.value })}
                    placeholder="Describe your doubt in detail..."
                    rows={5}
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={doubtForm.priority}
                    onChange={(e) => setDoubtForm({ ...doubtForm, priority: e.target.value as any })}
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={doubtForm.tags}
                    onChange={(e) => setDoubtForm({ ...doubtForm, tags: e.target.value })}
                    placeholder="e.g., javascript, react, hooks"
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Link Team Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Team Files
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFilePicker(!showFilePicker)}
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <File className="w-4 h-4" />
                      <span>
                        {selectedFiles.length > 0
                          ? `${selectedFiles.length} file(s) selected`
                          : 'Select files to link'}
                      </span>
                    </div>
                    {showFilePicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showFilePicker && (
                    <div className="mt-2 p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 max-h-48 overflow-y-auto">
                      {teamFiles.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No team files available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {teamFiles.map((file) => (
                            <label
                              key={file.id}
                              className="flex items-center space-x-3 p-2 hover:bg-white dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFiles.includes(file.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFiles([...selectedFiles, file.id]);
                                  } else {
                                    setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <File className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                                {file.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFiles.map((fileId) => {
                        const file = teamFiles.find(f => f.id === fileId);
                        return (
                          <span
                            key={fileId}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs"
                          >
                            <File className="w-3 h-3" />
                            <span className="max-w-[100px] truncate">{file?.name}</span>
                            <button
                              onClick={() => setSelectedFiles(selectedFiles.filter(id => id !== fileId))}
                              className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Attachments
                  </label>
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Upload className="w-5 h-5" />
                      <span>Click to upload files</span>
                    </div>
                  </label>

                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <button
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            className="text-red-600 dark:text-red-400 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleCreateDoubt}
                    disabled={!doubtForm.title.trim() || !doubtForm.description.trim() || isLoading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? 'Creating...' : 'Create Doubt'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
