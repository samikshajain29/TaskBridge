import { useState, useEffect } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-[2.5rem] border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                Invite Team
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Add collaborators to your workspace.</p>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 rounded-xl hover:bg-zinc-50 hover:text-zinc-600 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 mb-6 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="relative mb-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 h-14 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none transition-all duration-300 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-sm text-zinc-700 font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="min-h-[200px] max-h-[350px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Searching database...</p>
              </div>
            ) : users.length > 0 ? (
              <ul className="space-y-3">
                {users.map(user => (
                  <li key={user._id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-[1.5rem] hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all group/user">
                    <div className="flex items-center gap-4 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl shrink-0 object-cover border-2 border-zinc-50 shadow-sm" />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-600 rounded-xl font-bold shrink-0 text-sm shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-sm font-bold text-zinc-800 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-wider">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.email)}
                      disabled={actionLoading}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.trim() ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-8 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                  No users found matching<br/>
                  <span className="text-zinc-600">"{query}"</span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center p-8 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                <div className="p-3 bg-white rounded-xl shadow-sm mb-3">
                   <UserPlus className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                  Enter a name or email to<br/>begin searching
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-end">
             <button
                onClick={onClose}
                className="px-6 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-800 transition-colors uppercase tracking-widest"
              >
                Done
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
