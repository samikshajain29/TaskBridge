import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User } from 'lucide-react';

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const TaskCard = ({ task, isAdmin, currentUser, onStatusChange, onTaskClick }) => {
  const isAssignedToMe = task.assignedTo?._id === currentUser?._id;
  const isAuthorized = isAssignedToMe;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task
    },
    disabled: !isAuthorized
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleCardClick = (e) => {
    // Don't open modal when interacting with status dropdown
    if (e.target.closest('select')) return;
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`p-3 mb-3 bg-white border rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${isDragging ? 'ring-2 ring-indigo-500' : 'border-gray-200'}`}
    >
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-800 break-words">{task.title}</h4>
          <span className={`px-2 py-1 text-xs font-medium border rounded-full shrink-0 ${priorityColors[task.priority] || priorityColors.low}`}>
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Low'}
          </span>
        </div>
        {isAuthorized ? (
          <select 
            className="text-xs border-gray-200 rounded text-gray-600 focus:ring-indigo-500 focus:border-indigo-500 w-full p-1"
            value={task.status}
            onChange={(e) => {
              if (onStatusChange) {
                onStatusChange(task._id, e.target.value);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : null}
      </div>
      
      {task.description && (
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
        </div>
        <div className="flex items-center gap-1">
          {task.assignedTo?.avatar ? (
            <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full" title={task.assignedTo?.name || 'Unassigned'}>
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
