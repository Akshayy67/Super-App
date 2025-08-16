import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { Task } from "../types";
import { firestoreTasks } from "../utils/firestoreTasks";
import { authUtils } from "../utils/auth";
import { format, isAfter, isBefore, startOfDay } from "date-fns";

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const user = authUtils.getCurrentUser();

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = () => {
    const userId = user ? user.id : "guest";
    firestoreTasks.getTasks(userId).then((userTasks) => {
      setTasks(
        userTasks.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
      );
    });
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      priority: "medium",
    });
  };

  const handleAddTask = () => {
    console.log("handleAddTask called", { user, taskForm });
    if (!taskForm.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!taskForm.dueDate) {
      alert("Due Date is required.");
      return;
    }

    const userId = user ? user.id : "guest";
    const newTask: Omit<Task, "id"> = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      subject: taskForm.subject.trim(),
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: "pending",
      userId,
      createdAt: new Date().toISOString(),
    };

    firestoreTasks
      .addTask(newTask)
      .then(() => {
        resetForm();
        setShowAddTask(false);
        loadTasks();
      })
      .catch((err) => {
        console.error("Error storing task:", err);
        alert("Failed to add task. See console for details.");
      });
  };

  const handleEditTask = () => {
    if (!editingTask) return;

    const updates = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      subject: taskForm.subject.trim(),
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
    };

    if (!editingTask) return;
    firestoreTasks.updateTask(editingTask.id, updates).then(() => {
      setEditingTask(null);
      resetForm();
      loadTasks();
    });
  };

  const toggleTaskStatus = (task: Task) => {
    firestoreTasks
      .updateTask(task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      })
      .then(() => loadTasks());
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      firestoreTasks.deleteTask(taskId).then(() => loadTasks());
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      subject: task.subject,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  const isOverdue = (task: Task) => {
    if (task.status === "completed") return false;
    return isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)));
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case "pending":
        return tasks.filter((task) => task.status === "pending");
      case "completed":
        return tasks.filter((task) => task.status === "completed");
      case "overdue":
        return tasks.filter((task) => isOverdue(task));
      default:
        return tasks;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">To-Do List</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "all", label: "All", count: counts.all },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "completed", label: "Completed", count: counts.completed },
            { key: "overdue", label: "Overdue", count: counts.overdue },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  tab.key === "overdue" && tab.count > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {getFilteredTasks().map((task) => (
            <div
              key={task.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                task.status === "completed"
                  ? "bg-gray-50 border-gray-200"
                  : isOverdue(task)
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="mt-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          task.status === "completed"
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                        {isOverdue(task) && (
                          <AlertTriangle className="inline w-4 h-4 text-red-500 ml-2" />
                        )}
                      </h3>
                      {task.description && (
                        <p
                          className={`text-sm mt-1 ${
                            task.status === "completed"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEditing(task)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3">
                    {task.subject && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {task.subject}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority} priority
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredTasks().length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "Create your first task to get started with organized studying"
                : `You don't have any ${filter} tasks at the moment`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowAddTask(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {(showAddTask || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingTask ? "Edit Task" : "Add New Task"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={taskForm.subject}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (editingTask) {
                    setEditingTask(null);
                  } else {
                    setShowAddTask(false);
                  }
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleEditTask : handleAddTask}
                disabled={!taskForm.title.trim() || !taskForm.dueDate}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTask ? "Update" : "Add"} Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
