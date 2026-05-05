import { X, Calendar, Flag, User, FolderKanban } from 'lucide-react';
import Button from '../Button';

const priorityConfig = {
  high: { label: 'High Priority', classes: 'bg-rose-50 text-rose-700 border-rose-100' },
  medium: { label: 'Medium Priority', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
  low: { label: 'Low Priority', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
};

const statusConfig = {
  todo: { label: 'To Do', classes: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  inprogress: { label: 'In Progress', classes: 'bg-primary-50 text-primary-700 border-primary-100' },
  done: { label: 'Done', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
};

const TaskDetailModal = ({ isOpen, onClose, task, projectName, isAdmin, onEdit, onStatusChange }) => {
  if (!isOpen || !task) return null;

  const priority = priorityConfig[task.priority] || priorityConfig.low;
  const status = statusConfig[task.status] || statusConfig.todo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-[2rem] border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Banner Accent */}
        <div className={`h-2 w-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${priority.classes}`}>
                    <Flag className="w-3 h-3" />
                    {priority.label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.classes}`}>
                    {status.label}
                  </span>
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">{task.title}</h2>
              {projectName && (
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>{projectName}</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2.5 text-zinc-400 rounded-2xl hover:bg-zinc-50 hover:text-zinc-600 transition-all active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-8">
            {/* Description */}
            <div className="bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100/50">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Task Description</h3>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                {task.description || 'No description provided for this task.'}
              </p>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100/50">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-100 text-zinc-400">
                    <Calendar className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Due Date</p>
                    <p className="text-sm font-bold text-zinc-800">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible schedule'}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100/50">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-100">
                    {task.assignedTo?.avatar ? (
                      <img src={task.assignedTo.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-zinc-400" />
                    )}
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assigned To</p>
                    <p className="text-sm font-bold text-zinc-800">{task.assignedTo?.name || 'Unassigned'}</p>
                 </div>
              </div>
            </div>

            {/* Status Selector for Members */}
            {!isAdmin && onStatusChange && (
              <div className="pt-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Progress Update</h3>
                <div className="relative group">
                  <select
                    className="w-full h-12 pl-4 pr-10 appearance-none bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all cursor-pointer group-hover:border-zinc-300"
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
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400 group-hover:text-primary-500 transition-colors">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-12 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Dismiss
            </button>
            {isAdmin && onEdit && (
              <Button
                onClick={() => { onClose(); onEdit(task); }}
                className="w-full sm:w-auto"
              >
                Modify Task
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
