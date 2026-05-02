import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, setSelectedProjectId } from '../../features/projects/projectSlice';
import { ChevronDown, FolderKanban, Check } from 'lucide-react';

const ProjectSwitcher = () => {
  const dispatch = useDispatch();
  const { projects, selectedProjectId, loading } = useSelector((state) => state.projects);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch projects on mount if not already loaded
  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const handleSelect = (projectId) => {
    dispatch(setSelectedProjectId(projectId));
    setIsOpen(false);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 animate-pulse">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 rounded-lg border border-dashed border-gray-200">
        <FolderKanban className="w-4 h-4" />
        <span>No projects available</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 min-w-0 max-w-[220px]"
        id="project-switcher-btn"
      >
        {selectedProject?.color && (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: selectedProject.color }}
          />
        )}
        <span className="truncate">{selectedProject?.name || 'Select Project'}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 w-64 mt-2 origin-top-left bg-white rounded-xl shadow-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Switch Project</p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
            {projects.map((project) => {
              const isSelected = project._id === selectedProjectId;
              return (
                <button
                  key={project._id}
                  onClick={() => handleSelect(project._id)}
                  className={`flex items-center w-full gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  />
                  <span className="flex-1 text-left truncate">{project.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSwitcher;
