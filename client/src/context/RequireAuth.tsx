// components/RequireAuth.tsx
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const RequireAuth = ({ children }: { children: React.JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If we're offline, check localStorage before redirecting
  if (!user && isOffline) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return children;
    }
  }

  if (!user) {
    // Redirect to login and preserve the original destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
