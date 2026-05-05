import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User } from 'lucide-react';

const priorityColors = {
  high: 'bg-rose-50 text-rose-700 border-rose-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100'
};

const TaskCard = ({ task, currentUser, onStatusChange, onTaskClick }) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = (e) => {
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
      className={`group relative p-4 mb-4 bg-white border rounded-2xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary-200 ${isDragging ? 'ring-2 ring-primary-500 shadow-2xl z-50' : 'border-zinc-200'}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[15px] font-bold text-zinc-800 leading-snug group-hover:text-primary-700 transition-colors">{task.title}</h4>
          <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-lg uppercase tracking-wider shrink-0 ${priorityColors[task.priority] || priorityColors.low}`}>
            {task.priority || 'low'}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-50">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}</span>
          </div>
          
          <div className="flex items-center -space-x-1">
             {task.assignedTo ? (
               <div className="relative group/avatar">
                  {task.assignedTo.avatar ? (
                    <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-6 h-6 rounded-lg border-2 border-white ring-1 ring-zinc-100 object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-6 h-6 bg-primary-100 rounded-lg border-2 border-white ring-1 ring-zinc-100 text-[10px] font-bold text-primary-600">
                      {task.assignedTo.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded-md opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {task.assignedTo.name}
                  </div>
               </div>
             ) : (
               <div className="flex items-center justify-center w-6 h-6 bg-zinc-100 rounded-lg border-2 border-white ring-1 ring-zinc-50">
                 <User className="w-3 h-3 text-zinc-400" />
               </div>
             )}
          </div>
        </div>

        {isAuthorized && (
          <div className="mt-1">
             <select 
              className="w-full text-[11px] font-bold py-1.5 px-2 bg-zinc-50 border-none rounded-lg text-zinc-600 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer hover:bg-zinc-100"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
