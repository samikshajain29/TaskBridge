import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const { user: storedUser, accessToken: storedToken } = JSON.parse(storedAuth);
        setUserState(storedUser);
        setAccessToken(storedToken);
      } catch (err) {
        console.error('Failed to parse auth from local storage', err);
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  const setUser = (userData, token) => {
    setUserState(userData);
    setAccessToken(token);
    localStorage.setItem('auth', JSON.stringify({ user: userData, accessToken: token }));
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken: token } = response.data;
    setUser(userData, token);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUserState(null);
      setAccessToken(null);
      localStorage.removeItem('auth');
    }
  };

  const value = {
    user,
    accessToken,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (loading) {
    return <div>Loading...</div>; // Or a nice Loader component
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
