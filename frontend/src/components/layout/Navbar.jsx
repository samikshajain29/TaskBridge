import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';
import ProjectSwitcher from './ProjectSwitcher';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const showProjectSwitcher = location.pathname === '/dashboard';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-zinc-200/50 h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-zinc-500 rounded-xl lg:hidden hover:bg-zinc-100 transition-all active:scale-90"
        >
          <Menu className="w-5 h-5" />
        </button>
        {showProjectSwitcher && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <ProjectSwitcher />
          </div>
        )}
      </div>

      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="group flex items-center gap-3 p-1.5 pr-3 focus:outline-none rounded-2xl hover:bg-zinc-100/80 transition-all duration-300 active:scale-95"
        >
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-xl border-2 border-white shadow-sm object-cover" />
            ) : (
              <div className="flex items-center justify-center w-9 h-9 bg-primary-100 rounded-xl border-2 border-white shadow-sm">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-zinc-800 leading-none">{user?.name}</p>
            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Online</p>
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 py-2 origin-top-right bg-white rounded-2xl shadow-2xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="px-4 py-3 border-b border-zinc-50 md:hidden">
              <p className="text-sm font-bold text-zinc-900 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="px-2 py-1">
              <button
                className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-zinc-600 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button
                onClick={logout}
                className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
