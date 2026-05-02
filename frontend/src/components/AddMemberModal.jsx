import React, { useState, useEffect } from 'react';
import { X, Search, Plus, UserPlus } from 'lucide-react';
import api from '../api/axiosConfig';

const AddMemberModal = ({ isOpen, onClose, projectId, currentMembers = [], onMemberAdded }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setUsers([]);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/users/search?query=${query}&projectId=${projectId}`);
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounce);
  }, [query, currentMembers]);

  if (!isOpen) return null;

  const handleAddMember = async (email) => {
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/projects/${projectId}/members`, { email });
      if (onMemberAdded) onMemberAdded(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Add Member
          </h2>
          <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length > 0 ? (
            <ul className="space-y-2">
              {users.map(user => (
                <li key={user._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full shrink-0 object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-semibold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.email)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-500">
              No users found matching "{query}"
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-gray-500">
              Start typing to search for users...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
