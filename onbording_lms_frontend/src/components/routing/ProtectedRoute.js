import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

// PUBLIC_INTERFACE
export default function ProtectedRoute({ children }) {
  /** Route guard that redirects unauthenticated users to /login */
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
