'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  login: (accessToken: string, refreshToken: string, username: string) => void;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('fortify_access');
    const storedRefreshToken = localStorage.getItem('fortify_refresh');
    const storedUsername = localStorage.getItem('fortify_username');

    if (storedAccessToken && storedRefreshToken && storedUsername) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, username: string) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUsername(username);
    setIsAuthenticated(true);
    localStorage.setItem('fortify_access', accessToken);
    localStorage.setItem('fortify_refresh', refreshToken);
    localStorage.setItem('fortify_username', username);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUsername(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fortify_access');
    localStorage.removeItem('fortify_refresh');
    localStorage.removeItem('fortify_username');
    router.push('/login');
  };

  const refreshTokens = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}api/accounts/token/refresh-both/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        localStorage.setItem('fortify_access', data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
          localStorage.setItem('fortify_refresh', data.refresh_token);
        }
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      refreshToken, 
      username, 
      login, 
      logout, 
      refreshTokens, 
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

