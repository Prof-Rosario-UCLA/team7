// components/RequireAuth.tsx
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

const RequireAuth = ({ children }: { children: React.JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login and preserve the original destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
