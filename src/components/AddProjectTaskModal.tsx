import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  User
} from 'lucide-react';
import { Task } from '../types';
import { TeamProject, ProjectTask, projectService } from '../utils/projectService';
import { realTimeAuth } from '../utils/realTimeAuth';
import { TeamMember } from '../utils/teamManagement';

interface AddProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TeamProject;
  teamMembers: TeamMember[];
  onTaskAdded: (task: ProjectTask) => void;
}

export const AddProjectTaskModal: React.FC<AddProjectTaskModalProps> = ({
  isOpen,
  onClose,
  project,
  teamMembers,
  onTaskAdded
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
    status: 'pending' as Task['status']
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = realTimeAuth.getCurrentUser();

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      subject: project.name,
      dueDate: '',
      priority: 'medium',
      status: 'pending'
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!taskData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!taskData.dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskPayload: Omit<Task, 'id' | 'userId' | 'createdAt'> = {
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        subject: taskData.subject || project.name,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status
      };

      const projectTask = await projectService.addTaskToProject(
        project.id,
        user.id,
        taskPayload
      );

      setSuccess('Task added to project successfully!');
      onTaskAdded(projectTask);

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Error adding task to project:', error);
      setError(error instanceof Error ? error.message : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Add Task to Project</h3>
                <p className="text-sm text-gray-500">{project.name}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the task details"
            />
          </div>

          {/* Subject/Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject/Category
            </label>
            <input
              type="text"
              value={taskData.subject}
              onChange={(e) => setTaskData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task category or subject"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date *
            </label>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              max={project.dueDate ? project.dueDate.toISOString().split('T')[0] : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {project.dueDate && (
              <p className="text-xs text-gray-500 mt-1">
                Project due date: {project.dueDate.toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setTaskData(prev => ({ ...prev, priority }))}
                  className={`p-2 rounded-lg border transition-colors capitalize ${
                    taskData.priority === priority
                      ? `${getPriorityColor(priority)} border-current`
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Status
            </label>
            <select
              value={taskData.status}
              onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Project Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Project Assignment</span>
            </div>
            <p className="text-sm text-blue-800">
              This task will be added to "{project.name}" and synced with your personal todo list.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-blue-700">Assigned members:</span>
              <div className="flex -space-x-1">
                {project.assignedMembers.slice(0, 3).map((memberId) => {
                  const member = teamMembers.find(m => m.id === memberId);
                  return member ? (
                    <div
                      key={member.id}
                      className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800 border border-white"
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ) : null;
                })}
                {project.assignedMembers.length > 3 && (
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800 border border-white">
                    +{project.assignedMembers.length - 3}
                  </div>
                )}
              </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
