import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditTaskModal = ({ isOpen, onClose, onSubmit, task, users = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    assignedTo: '',
    dueDate: '',
  });

  // Pre-fill form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Admin edits: send everything EXCEPT status
    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate || null,
    };
    onSubmit(task._id, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-5 mx-4 bg-white shadow-lg rounded-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-700">Edit Task</h2>
          <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1 text-sm text-gray-500">Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-sm text-gray-500">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none resize-none"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block mb-1 text-sm text-gray-500">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-white"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block mb-1 text-sm text-gray-500">Due Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-white"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block mb-1 text-sm text-gray-500">Assign To</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-white"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              <option value="" disabled>Select a member</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Status shown as read-only badge */}
          <div>
            <label className="block mb-1 text-sm text-gray-500">Status</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {task.status === 'todo' && '📋 To Do'}
              {task.status === 'inprogress' && '🔄 In Progress'}
              {task.status === 'done' && '✅ Done'}
              <span className="text-xs text-gray-400 ml-2">(Admins cannot change status)</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
