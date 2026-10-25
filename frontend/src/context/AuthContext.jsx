import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agritrace_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agritrace_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('agritrace_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('agritrace_token', res.token);
      localStorage.setItem('agritrace_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('agritrace_token', res.token);
      localStorage.setItem('agritrace_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('agritrace_token');
    localStorage.removeItem('agritrace_user');
  };

  const isAdmin = user?.role === 'admin';
  const isFarmer = user?.role === 'farmer';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isFarmer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
