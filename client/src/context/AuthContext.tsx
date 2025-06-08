import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  userId: string;
  email: string;
  name?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    fetch('/api/auth/me', { 
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${user?.token || ''}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(userData => {
        const updatedUser = { ...userData, token: user?.token };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      })
      .catch(() => {
        if (navigator.onLine) {
          setUser(null);
          localStorage.removeItem('user');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // Recheck auth when we come back online
      fetch('/api/auth/me', { credentials: 'include' })
        .then(res => res.json())
        .then(userData => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('user');
        });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Call your backend logout endpoint here
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${user?.token || ''}`
      }
    }).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
