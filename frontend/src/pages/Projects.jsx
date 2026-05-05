import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProjectThunk } from '../features/projects/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import Button from '../components/Button';
import { Plus, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading } = useSelector((state) => state.projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async (formData) => {
    setCreateLoading(true);
    try {
      const resultAction = await dispatch(createProjectThunk(formData));
      if (createProjectThunk.fulfilled.match(resultAction)) {
        setIsModalOpen(false);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-6 lg:p-10 bg-zinc-50 min-h-screen">
        <div className="h-10 w-48 bg-zinc-200 animate-pulse rounded-2xl mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-zinc-200 animate-pulse rounded-[2.5rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-zinc-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
             <div className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-md uppercase tracking-wider">Workspace</div>
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{projects.length} Projects</div>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-display">Projects</h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-xl leading-relaxed">Centralized hub for all your team's initiatives and task boards.</p>
        </div>
        
        <Button
          onClick={() => setIsModalOpen(true)}
          className="animate-in fade-in slide-in-from-right-4 duration-700 gap-2 shadow-primary-200"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center glass rounded-[3rem] border-white/40 shadow-2xl shadow-zinc-200/50 mt-10">
          <div className="flex items-center justify-center w-24 h-24 mb-6 bg-primary-50 text-primary-600 rounded-[2rem] shadow-inner">
            <Folder className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">No projects yet</h3>
          <p className="mt-3 text-zinc-500 max-w-sm text-sm leading-relaxed">Your creative journey begins here. Create your first project to start organizing tasks and shipping faster.</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="secondary"
            className="mt-10 px-10"
          >
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div 
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="group relative p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-primary-100/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-50 transition-colors duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: project.color || '#8b5cf6' }}
                  >
                    <Folder className="w-7 h-7" />
                  </div>
                </div>
                
                <h3 className="text-xl font-extrabold text-zinc-900 group-hover:text-primary-600 transition-colors duration-300 font-display">{project.name}</h3>
                <p className="mt-3 text-sm text-zinc-500 line-clamp-2 min-h-[40px] leading-relaxed">
                  {project.description || 'No description provided for this project.'}
                </p>
                
                <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Last Activity</span>
                    <span className="text-xs font-bold text-zinc-600 mt-0.5">{new Date(project.updatedAt || project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                    Open Board
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={createLoading}
      />
    </div>
  );
};

export default Projects;
