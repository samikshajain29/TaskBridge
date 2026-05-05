import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../Input';
import Button from '../Button';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-[2.5rem] border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Edit Task</h2>
              <p className="text-sm text-zinc-500 mt-1">Update task details and assignments.</p>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 rounded-xl hover:bg-zinc-50 hover:text-zinc-600 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input
                label="Task Title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl outline-none transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-zinc-300 resize-none text-sm text-zinc-700"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">Priority</label>
                  <div className="relative group">
                    <select
                      className="w-full h-11 pl-4 pr-10 appearance-none bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer group-hover:border-zinc-300"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400 group-hover:text-primary-500 transition-colors">
                       <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all hover:border-zinc-300"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">Assign To</label>
                <div className="relative group">
                  <select
                    className="w-full h-11 pl-4 pr-10 appearance-none bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer group-hover:border-zinc-300"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="" disabled>Choose a team member</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400 group-hover:text-primary-500 transition-colors">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">Current Status</label>
                <div className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-500 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {task.status === 'todo' && '📋 To Do'}
                    {task.status === 'inprogress' && '🔄 In Progress'}
                    {task.status === 'done' && '✅ Done'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">Locked for Admins</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                className="w-full sm:w-auto shadow-primary-200"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
