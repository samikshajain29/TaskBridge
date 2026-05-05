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
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-zinc-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-8 border-b border-zinc-100">
            <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => { if(window.innerWidth < 1024) onClose(); }}>
              <div className="flex items-center justify-center w-9 h-9 text-white transition-all duration-300 bg-primary-600 rounded-xl group-hover:rotate-6 shadow-lg shadow-primary-200">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 font-display">TaskBridge</span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            <div className="px-4 mb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Main Menu</div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'text-primary-700 bg-primary-50 border border-primary-100/50 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                  {link.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
               <p className="text-xs font-bold text-zinc-800 mb-1">Need help?</p>
               <p className="text-[11px] text-zinc-500 mb-3">Check our documentation for quick start guides.</p>
               <button className="w-full py-2 text-[11px] font-bold text-primary-600 bg-white border border-primary-100 rounded-xl hover:bg-primary-50 transition-colors">
                  View Docs
               </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
