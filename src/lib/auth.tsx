'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for authentication on mount
    const token = Cookies.get('auth_token') || localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      // If no token is found, redirect to login
      router.push('/login');
    }
  }, [router]);

  const login = (token: string, userData: any) => {
    // Store authentication data
    Cookies.set('auth_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsAuthenticated(true);
    setUser(userData);
    
    // Redirect to dashboard after login
    router.push('/dashboard');
  };

  const logout = () => {
    // Clear authentication data
    Cookies.remove('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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