import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Layout, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center gap-2 group" onClick={() => { if(window.innerWidth < 1024) onClose(); }}>
              <div className="flex items-center justify-center w-8 h-8 text-white transition-transform bg-indigo-600 rounded-lg group-hover:scale-105 shadow-sm">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">TaskBridge</span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Strict matching for /projects to not stay active on /projects/:id if needed,
              // but usually startsWith is fine. Let's use exact for root-level paths if preferred.
              const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'text-indigo-700 bg-indigo-50 shadow-sm border border-indigo-100/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
