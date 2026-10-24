import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User;
  users: User[];
  role: UserRole;
  isAuthenticated: boolean;
  refreshUsers: () => Promise<User[]>;
  switchRole: (role: UserRole) => void;
  loginAs: (userId: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (userData: { name: string; email: string; password: string; role: UserRole; company?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateCurrentUser: (data: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'techrescue_auth_user';
const STORAGE_KEY_TOKEN = 'techrescue_auth_token';
const STORAGE_KEY_AUTH = 'techrescue_is_authenticated';

const GUEST_USER: User = {
  id: 'usr-guest',
  name: 'Guest User',
  email: 'guest@techrescue.io',
  role: 'CLIENT',
  company: 'Unauthenticated Session',
  rating: 5.0,
  reviewsCount: 0,
  hourlyRate: 0,
  experienceYears: 0,
  verified: false,
  isAvailable: false,
  completedJobsCount: 0,
  totalEarnings: 0
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Real users fetched from database
  const [users, setUsers] = useState<User[]>([]);

  // Track explicit authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });

  const [activeUser, setActiveUser] = useState<User | null>(() => {
    const isAuth = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    if (!isAuth) return null;
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const currentUser: User = activeUser || GUEST_USER;
  const role: UserRole = currentUser.role;

  // Real-time user fetcher from PostgreSQL
  const refreshUsers = async (): Promise<User[]> => {
    try {
      const res = await api.get('/auth/users');
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to fetch live database users:', err);
    }
    return users;
  };

  // Fetch all registered users from PostgreSQL database on mount and when authentication changes
  useEffect(() => {
    refreshUsers();
  }, [isAuthenticated]);

  // Sync session with backend API /auth/me on mount if token is present
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const isAuth = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    if (token && isAuth) {
      api.get('/auth/me').then(res => {
        if (res.success && res.data?.user) {
          setActiveUser(res.data.user);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.data.user));
        }
      }).catch(() => {
        // Keep cached session
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      // Real Backend API Authentication against PostgreSQL database
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });

      if (res.success && res.data) {
        const token = res.data.token;
        const user = res.data.user;

        if (token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, token);
        }
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
        setActiveUser(user);
        setIsAuthenticated(true);

        // Fetch latest users
        refreshUsers();

        return { success: true, user };
      }

      return {
        success: false,
        error: res.error || 'Invalid credentials. Please verify your email and password.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Cannot connect to Backend API: ${err.message}`,
      };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: UserRole; company?: string }) => {
    try {
      // Real Backend API Registration into PostgreSQL database
      const res = await api.post('/auth/register', userData);
      if (res.success && res.data) {
        const token = res.data.token;
        const user = res.data.user;
        if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
        setActiveUser(user);
        setIsAuthenticated(true);

        // Append and refresh live users
        await refreshUsers();

        return { success: true, user };
      }
      return {
        success: false,
        error: res.error || 'Failed to create user account in database.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Registration error: ${err.message}`,
      };
    }
  };

  const loginAs = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(found));
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      setActiveUser(found);
      setIsAuthenticated(true);
    }
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = users.find(u => u.role === newRole);
    if (targetUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(targetUser));
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      setActiveUser(targetUser);
      setIsAuthenticated(true);
    }
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (!activeUser) return;
    const updated = { ...activeUser, ...data };
    setActiveUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    setUsers(prev => prev.map(u => u.id === activeUser.id ? updated : u));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setActiveUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        role,
        isAuthenticated,
        refreshUsers,
        switchRole,
        loginAs,
        login,
        register,
        updateCurrentUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
