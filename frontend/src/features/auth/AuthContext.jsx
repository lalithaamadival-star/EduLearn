import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('accessed_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('accessed_auth_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('accessed_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('accessed_auth_user');
    }
    if (token) {
      localStorage.setItem('accessed_auth_token', token);
    } else {
      localStorage.removeItem('accessed_auth_token');
    }
  }, [user, token]);

  const login = async (email, password, roleHint = 'STUDENT') => {
    setLoading(true);
    try {
      const res = await api.login({ email, password, role_hint: roleHint });
      setUser(res.user);
      setToken(res.access_token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, full_name, role = 'STUDENT', organization = '', teacher_id = null }) => {
    setLoading(true);
    try {
      const res = await api.signup({ email, password, full_name, role, organization, teacher_id });
      setUser(res.user);
      setToken(res.access_token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const setSelectedTeacher = (teacherId) => {
    if (user) {
      const updated = { ...user, selected_teacher_id: teacherId };
      setUser(updated);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessed_auth_user');
    localStorage.removeItem('accessed_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isTeacher: !!user && user?.role?.toUpperCase() === 'TEACHER',
        isStudent: !!user && user?.role?.toUpperCase() === 'STUDENT',
        login,
        signup,
        logout,
        setSelectedTeacher
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
