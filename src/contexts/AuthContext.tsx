import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers, User } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'securebank_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const { userId, expiry } = JSON.parse(storedAuth);
          
          // Check if session is expired
          if (new Date().getTime() > expiry) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
          } else {
            // Find user in mock data
            const foundUser = mockUsers.find(u => u.id === userId);
            if (foundUser) {
              setUser(foundUser);
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      // Store session with 24-hour expiry
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: foundUser.id, expiry }));
      setUser(foundUser);
      return { success: true, message: 'Login successful!' };
    }

    return { success: false, message: 'Invalid email or password. Try demo@securebank.com / demo123' };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // In a real app, this would sync with the backend
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
