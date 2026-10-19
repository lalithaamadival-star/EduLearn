import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Guard routes based on authentication and user role.
 * - If not logged in -> redirect to /signin with return location.
 * - If logged in as STUDENT trying to access TEACHER route -> redirect to /student.
 * - If logged in as TEACHER trying to access STUDENT route -> redirect to /teacher.
 */
export function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Verifying access credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const role = user.role?.toUpperCase();

  if (allowedRole && role !== allowedRole.toUpperCase()) {
    if (role === 'STUDENT') {
      return <Navigate to="/student" replace />;
    }
    if (role === 'TEACHER') {
      return <Navigate to="/teacher" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Route wrapper for public auth pages (like /signin, /get-started).
 * If a user is ALREADY authenticated:
 * - Redirects Student to /student
 * - Redirects Teacher to /teacher
 * If logged out, renders children (login/signup form).
 */
export function PublicAuthRoute({ children }) {
  const { user, isAuthenticated, isTeacher, isStudent } = useAuth();

  if (isAuthenticated && user) {
    if (isTeacher) {
      return <Navigate to="/teacher" replace />;
    }
    if (isStudent) {
      return <Navigate to="/student" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
