import React, { useState, useMemo } from 'react';
import { X, Calendar, Palette } from 'lucide-react';
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
  { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
];

const CreateProjectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '',
    dueDate: '',
    priority: '',
    teamSize: '',
  });

  const [touched, setTouched] = useState({});

  // --- Validation Logic ---
  const errors = useMemo(() => {
    const e = {};

    // Project Name: required, min 3 chars
    if (!formData.name.trim()) {
      e.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      e.name = 'Project name must be at least 3 characters';
    }

    // Description: required, min 10 chars
    if (!formData.description.trim()) {
      e.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      e.description = 'Description must be at least 10 characters';
    }

    // Color: required
    if (!formData.color) {
      e.color = 'Please select a project color';
    }

    // Due Date: required, must be future
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

    // Priority: required
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
    setFormData({ name: '', description: '', color: '', dueDate: '', priority: '', teamSize: '' });
    setTouched({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all required fields as touched to show errors
    setTouched({ name: true, description: true, color: true, dueDate: true, priority: true });

    if (!isFormValid) return;

    // Only send fields the backend supports (name, description, color)
    // Extra fields are frontend-only for now
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
    };

    onSubmit(payload);
    resetForm();
  };

  // Get today's date string for the min attribute on the date input
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 mx-4 bg-white shadow-xl rounded-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create New Project</h2>
          <button onClick={handleClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <Input
            label="Project Name"
            id="project-name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="e.g., Marketing Campaign"
            error={touched.name ? errors.name : null}
          />

          {/* Description */}
          <div className="flex flex-col">
            <label htmlFor="project-description" className="mb-1.5 text-sm font-medium text-gray-700">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="project-description"
              className={`w-full px-4 py-2.5 text-gray-800 bg-white border rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${
                touched.description && errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-400'
              }`}
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="What is this project about? (min 10 characters)"
            />
            {touched.description && errors.description && (
              <span className="mt-1.5 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.description}</span>
            )}
          </div>

          {/* Project Color */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-gray-400" />
              Project Color <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { handleChange('color', c); handleBlur('color'); }}
                  className={`w-8 h-8 rounded-full transition-all duration-200 focus:outline-none border-2 hover:scale-110 ${
                    formData.color === c
                      ? 'border-gray-800 ring-2 ring-offset-2 ring-indigo-400 scale-110'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            {formData.color && (
              <div className="mt-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                <span className="text-xs text-gray-500">Selected: {formData.color}</span>
              </div>
            )}
            {touched.color && errors.color && (
              <span className="mt-1.5 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.color}</span>
            )}
          </div>

          {/* Due Date & Priority — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="flex flex-col">
              <label htmlFor="project-dueDate" className="mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="project-dueDate"
                value={formData.dueDate}
                min={getTomorrowStr()}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                onBlur={() => handleBlur('dueDate')}
                className={`w-full px-4 py-2.5 text-gray-800 bg-white border rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 ${
                  touched.dueDate && errors.dueDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-400'
                }`}
              />
              {touched.dueDate && errors.dueDate && (
                <span className="mt-1.5 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.dueDate}</span>
              )}
            </div>

            {/* Team Size (optional) */}
            <div className="flex flex-col">
              <label htmlFor="project-teamSize" className="mb-1.5 text-sm font-medium text-gray-700">
                Team Size <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <input
                type="number"
                id="project-teamSize"
                value={formData.teamSize}
                min="1"
                max="100"
                onChange={(e) => handleChange('teamSize', e.target.value)}
                placeholder="e.g., 5"
                className="w-full px-4 py-2.5 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <label className="mb-1.5 text-sm font-medium text-gray-700">
              Priority <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { handleChange('priority', p.value); handleBlur('priority'); }}
                  className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    formData.priority === p.value
                      ? `${p.color} border-current ring-2 ring-offset-1 ring-current/20 scale-[1.02]`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {touched.priority && errors.priority && (
              <span className="mt-1.5 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.priority}</span>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="mr-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={!isFormValid}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
