import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Client, Collector } from '../types';
import mockData from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isClient: boolean;
  isCollector: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would be an API call to authenticate the user
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Find user in mock data
        const client = mockData.clients.find(c => c.email === email);
        if (client) {
          setCurrentUser(client);
          resolve(client);
          return;
        }

        const collector = mockData.collectors.find(c => c.email === email);
        if (collector) {
          setCurrentUser(collector);
          resolve(collector);
          return;
        }

        reject(new Error('Invalid email or password'));
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAuthenticated = currentUser !== null;
  const isClient = isAuthenticated && currentUser?.type === 'client';
  const isCollector = isAuthenticated && currentUser?.type === 'collector';

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    isClient,
    isCollector
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};