import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  section: 'engineering' | 'medical';
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  phone?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from backend if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/signup`, userData);
      // Auto-login after signup
      return await login(userData.email, userData.password);
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const res = await axios.put(`${API_URL}/users/me`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      return true;
    } catch (err) {
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // You can implement this endpoint in the backend and call it here
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
