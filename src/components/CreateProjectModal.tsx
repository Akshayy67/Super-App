import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Folder,
  Plus,
  Minus
} from 'lucide-react';
import { TeamProject, projectService } from '../utils/projectService';
import { realTimeAuth } from '../utils/realTimeAuth';
import { TeamMember } from '../utils/teamManagement';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamMembers: TeamMember[];
  onProjectCreated: (project: TeamProject) => void;
  editProject?: TeamProject | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamMembers,
  onProjectCreated,
  editProject
}) => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    status: 'planning' as TeamProject['status'],
    priority: 'medium' as TeamProject['priority'],
    startDate: '',
    dueDate: '',
    assignedMembers: [] as string[],
    tags: [] as string[],
    settings: {
      allowTaskCreation: true,
      requireApproval: false,
      isPublic: true
    }
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (editProject) {
      setProjectData({
        name: editProject.name,
        description: editProject.description,
        status: editProject.status,
        priority: editProject.priority,
        startDate: editProject.startDate.toISOString().split('T')[0],
        dueDate: editProject.dueDate ? editProject.dueDate.toISOString().split('T')[0] : '',
        assignedMembers: editProject.assignedMembers,
        tags: editProject.tags,
        settings: editProject.settings
      });
    } else {
      resetForm();
    }
  }, [editProject, isOpen]);

  const resetForm = () => {
    setProjectData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      assignedMembers: user ? [user.id] : [],
      tags: [],
      settings: {
        allowTaskCreation: true,
        requireApproval: false,
        isPublic: true
      }
    });
    setNewTag('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!projectData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!projectData.startDate) {
      setError('Start date is required');
      return;
    }

    if (projectData.assignedMembers.length === 0) {
      setError('At least one team member must be assigned');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const projectPayload = {
        teamId,
        name: projectData.name.trim(),
        description: projectData.description.trim(),
        status: projectData.status,
        priority: projectData.priority,
        progress: 0,
        startDate: new Date(projectData.startDate),
        dueDate: projectData.dueDate ? new Date(projectData.dueDate) : undefined,
        createdBy: user.id,
        assignedMembers: projectData.assignedMembers,
        tags: projectData.tags,
        milestones: [],
        settings: projectData.settings
      };

      let result: TeamProject;
      
      if (editProject) {
        await projectService.updateProject(editProject.id, user.id, projectPayload);
        result = { ...editProject, ...projectPayload };
        setSuccess('Project updated successfully!');
      } else {
        result = await projectService.createProject(teamId, user.id, projectPayload);
        setSuccess('Project created successfully!');
      }

      onProjectCreated(result);

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Error saving project:', error);
      setError(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !projectData.tags.includes(newTag.trim())) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleMember = (memberId: string) => {
    setProjectData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(memberId)
        ? prev.assignedMembers.filter(id => id !== memberId)
        : [...prev.assignedMembers, memberId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {editProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <p className="text-sm text-gray-500">
                  {editProject ? 'Update project details' : 'Set up a new team project'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the project goals and objectives"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={projectData.status}
                  onChange={(e) => setProjectData(prev => ({ ...prev, status: e.target.value as TeamProject['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={projectData.priority}
                  onChange={(e) => setProjectData(prev => ({ ...prev, priority: e.target.value as TeamProject['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={projectData.startDate}
                  onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={projectData.dueDate}
                  onChange={(e) => setProjectData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={projectData.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigned Members *
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={projectData.assignedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {projectData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Project Settings</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={projectData.settings.allowTaskCreation}
                  onChange={(e) => setProjectData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowTaskCreation: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow task creation</span>
                  <p className="text-xs text-gray-500">Team members can create tasks in this project</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={projectData.settings.requireApproval}
                  onChange={(e) => setProjectData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, requireApproval: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Require approval</span>
                  <p className="text-xs text-gray-500">New tasks need approval before being added</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={projectData.settings.isPublic}
                  onChange={(e) => setProjectData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, isPublic: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Public project</span>
                  <p className="text-xs text-gray-500">All team members can view this project</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  {editProject ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Folder className="w-4 h-4" />
                  {editProject ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
