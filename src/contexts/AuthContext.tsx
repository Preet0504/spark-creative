import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { sampleUsers } from '@/data/sampleData';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string, role: UserRole): boolean => {
    // Demo login - in production, this would validate against backend
    const demoUser: User = {
      id: role === 'student' ? '1' : role === 'teacher' ? '2' : '3',
      username,
      email: `${username}@university.edu`,
      firstName: role === 'student' ? 'John' : role === 'teacher' ? 'Prof. Jane' : 'Admin',
      lastName: role === 'student' ? 'Doe' : role === 'teacher' ? 'Smith' : 'User',
      role
    };
    setUser(demoUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
