import React from 'react';
import { X, Calendar, Flag, User, FolderKanban } from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', classes: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const statusConfig = {
  todo: { label: 'To Do', classes: 'bg-slate-100 text-slate-700' },
  inprogress: { label: 'In Progress', classes: 'bg-indigo-100 text-indigo-700' },
  done: { label: 'Done', classes: 'bg-emerald-100 text-emerald-700' },
};

const TaskDetailModal = ({ isOpen, onClose, task, projectName, isAdmin, onEdit, onStatusChange }) => {
  if (!isOpen || !task) return null;

  const priority = priorityConfig[task.priority] || priorityConfig.low;
  const status = statusConfig[task.status] || statusConfig.todo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-5 mx-4 bg-white shadow-lg rounded-xl animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-semibold text-gray-700 break-words">{task.title}</h2>
            {projectName && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>{projectName}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${priority.classes}`}>
            <Flag className="w-3 h-3" />
            {priority.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${status.classes}`}>
            {status.label}
          </span>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Description</h3>
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
          {/* Due Date */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Due Date</h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date set'}
            </div>
          </div>

          {/* Assigned User */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned To</h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              {task.assignedTo?.avatar ? (
                <img src={task.assignedTo.avatar} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
              {task.assignedTo?.name || 'Unassigned'}
            </div>
          </div>
        </div>

        {/* Member: Status Update */}
        {!isAdmin && onStatusChange && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Update Status</h3>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none bg-white text-sm"
              value={task.status}
              onChange={(e) => {
                onStatusChange(task._id, e.target.value);
                onClose();
              }}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
          {isAdmin && onEdit && (
            <button
              onClick={() => { onClose(); onEdit(task); }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Edit Task
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
