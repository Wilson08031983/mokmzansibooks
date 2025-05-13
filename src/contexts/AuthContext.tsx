
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClientDataBackup } from '@/utils/clientDataPersistence';

// Define the auth context types
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

// User object structure
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  company?: string;
  createdAt?: string;
}

// Registration data
interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

// Create auth context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load auth state from localStorage on component mount
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const authData = localStorage.getItem('authData');
        
        if (authData) {
          const parsedData = JSON.parse(authData);
          
          if (parsedData.user && parsedData.isAuthenticated) {
            setUser(parsedData.user);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthState();
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        const authData = {
          isAuthenticated,
          user
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
      } catch (err) {
        console.error('Error saving auth state:', err);
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Mock login function (replace with actual API call later)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo login (replace with actual API integration)
      if (email && password) {
        const mockUser: User = {
          id: '1',
          email,
          firstName: 'Demo',
          lastName: 'User',
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Invalid email or password');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock logout function
  const logout = useCallback(() => {
    try {
      // Backup client data before logout
      createClientDataBackup();
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Extra - remove sensitive data
      localStorage.removeItem('authToken');
      
      // Note: We don't remove authData here since it's handled by the effect
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  // Mock register function (replace with actual API call later)
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (userData.email && userData.password) {
        const mockUser: User = {
          id: '1',
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          company: userData.company,
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Missing required fields');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock forgotPassword function
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (email) {
        // In a real app, this would send a reset email
        return true;
      } else {
        setError('Email is required');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset request failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock resetPassword function
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (token && newPassword) {
        // In a real app, this would verify token and update password
        return true;
      } else {
        setError('Invalid reset token or password');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock updateUser function
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (user && userData) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        return true;
      } else {
        setError('User not found');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update user failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateUser,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
