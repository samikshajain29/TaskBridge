import { useState, useRef, useEffect } from 'react';
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
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-100 animate-pulse">
        <div className="w-3 h-3 bg-zinc-200 rounded-full" />
        <div className="w-24 h-4 bg-zinc-200 rounded-md" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-zinc-400 rounded-2xl border border-dashed border-zinc-200 uppercase tracking-widest">
        <FolderKanban className="w-4 h-4" />
        <span>No Projects</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 rounded-2xl hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 min-w-0 w-full group"
        id="project-switcher-btn"
      >
        <div 
          className="w-3 h-3 rounded-full shrink-0 shadow-sm border border-white"
          style={{ backgroundColor: selectedProject?.color || '#8b5cf6' }}
        />
        <span className="truncate flex-1 text-left">{selectedProject?.name || 'Select Project'}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-500 group-hover:text-primary-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 w-72 mt-3 origin-top-left bg-white rounded-[2rem] shadow-2xl border border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-500 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-50 bg-zinc-50/50">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Switch Workspace</p>
          </div>
          <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
            {projects.map((project) => {
              const isSelected = project._id === selectedProjectId;
              return (
                <button
                  key={project._id}
                  onClick={() => handleSelect(project._id)}
                  className={`flex items-center w-full gap-4 px-5 py-4 text-sm transition-all relative group/item ${
                    isSelected
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-primary-600'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform duration-300 group-hover/item:scale-125 ${isSelected ? 'ring-2 ring-primary-500/30' : ''}`}
                    style={{ backgroundColor: project.color || '#8b5cf6' }}
                  />
                  <span className="flex-1 text-left truncate">{project.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
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
