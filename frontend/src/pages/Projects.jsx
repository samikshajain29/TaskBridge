import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProjectThunk } from '../features/projects/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
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
      <div className="p-6 lg:p-8 bg-gray-50 h-full">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your workspaces</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-indigo-50 text-indigo-500 rounded-full">
            <Folder className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No projects yet</h3>
          <p className="mt-2 text-gray-500 max-w-sm">Get started by creating a new project to organize your tasks and collaborate.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-6 py-2.5 font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                >
                  <Folder className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                {project.description || 'No description provided.'}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Board &rarr;
                </span>
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
