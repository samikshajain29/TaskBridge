import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import Input from './Input';
import Button from './Button';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
  '#0f172a', // Dark
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'high', label: 'High', color: 'bg-rose-50 text-rose-700 border-rose-100' },
];

const CreateProjectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8b5cf6',
    dueDate: '',
    priority: 'medium',
    teamSize: '',
  });

  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const e = {};
    if (!formData.name.trim()) {
      e.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      e.name = 'Project name must be at least 3 characters';
    }
    if (!formData.description.trim()) {
      e.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      e.description = 'Description must be at least 10 characters';
    }
    if (!formData.color) {
      e.color = 'Please select a project color';
    }
    if (!formData.dueDate) {
      e.dueDate = 'Due date is required';
    } else {
      const selected = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        e.dueDate = 'Due date must be in the future';
      }
    }
    if (!formData.priority) {
      e.priority = 'Please select a priority level';
    }
    return e;
  }, [formData]);

  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#8b5cf6', dueDate: '', priority: 'medium', teamSize: '' });
    setTouched({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true, color: true, dueDate: true, priority: true });
    if (!isFormValid) return;
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
    };
    onSubmit(payload);
    resetForm();
  };

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-[2.5rem] border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">New Project</h2>
              <p className="text-sm text-zinc-500 mt-1">Start a fresh initiative for your team.</p>
            </div>
            <button onClick={handleClose} className="p-2 text-zinc-400 rounded-xl hover:bg-zinc-50 hover:text-zinc-600 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input
                label="Project Name"
                id="project-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g., Q3 Product Launch"
                error={touched.name ? errors.name : null}
              />

              <div>
                <label htmlFor="project-description" className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="project-description"
                  className={`w-full px-4 py-3 text-zinc-700 bg-white border rounded-2xl outline-none transition-all duration-300 resize-none text-sm ${
                    touched.description && errors.description
                      ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500'
                      : 'border-zinc-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-zinc-300'
                  }`}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  placeholder="Tell us what this project is about..."
                />
                {touched.description && errors.description && (
                  <span className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-1">{errors.description}</span>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">
                  Brand Color <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2.5 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { handleChange('color', c); handleBlur('color'); }}
                      className={`w-8 h-8 rounded-full transition-all duration-300 border-2 hover:scale-110 ${
                        formData.color === c
                          ? 'border-white ring-4 ring-primary-500/30 scale-110'
                          : 'border-transparent hover:border-zinc-200 shadow-sm'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="project-dueDate" className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">
                    Target Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="project-dueDate"
                    value={formData.dueDate}
                    min={getTomorrowStr()}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    onBlur={() => handleBlur('dueDate')}
                    className={`w-full h-11 px-4 text-zinc-700 bg-white border rounded-xl font-bold text-sm outline-none transition-all ${
                      touched.dueDate && errors.dueDate
                        ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500'
                        : 'border-zinc-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-zinc-300'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="project-teamSize" className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">
                    Team Size <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="project-teamSize"
                    value={formData.teamSize}
                    min="1"
                    onChange={(e) => handleChange('teamSize', e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full h-11 px-4 text-zinc-700 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-zinc-300"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-700 ml-1">Priority</label>
                <div className="flex gap-3">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => { handleChange('priority', p.value); handleBlur('priority'); }}
                      className={`flex-1 py-3 px-3 text-xs font-bold rounded-xl border transition-all duration-300 uppercase tracking-wider ${
                        formData.priority === p.value
                          ? `${p.color} border-current shadow-sm scale-[1.02]`
                          : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                isLoading={loading}
                disabled={!isFormValid}
                className="w-full sm:w-auto shadow-primary-200"
              >
                Launch Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
