import React, { useState, useRef, useEffect } from 'react';
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
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        {showProjectSwitcher && <ProjectSwitcher />}
      </div>

      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1 focus:outline-none rounded-full hover:bg-gray-50 transition-colors"
        >
          <span className="hidden text-sm font-medium text-gray-700 md:block ml-2">{user?.name}</span>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full border border-indigo-200">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-xl shadow-lg border border-gray-100 top-full animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-gray-100 md:hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
