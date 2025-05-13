
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClientDataBackup } from '@/utils/clientDataPersistence';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextProps {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: object) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: object) => Promise<boolean>;
}

// Create context
const SupabaseAuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Simulated auth state check
    setAuthState(prevState => ({
      ...prevState,
      isLoading: false
    }));

    // Create backup on mount
    createClientDataBackup();
  }, []);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null
      }));

      // Mock auth logic
      console.log(`Sign in attempt with ${email}`);
      
      // Update state after "authentication"
      setAuthState({
        user: { id: 'mock-user-id', email },
        session: { access_token: 'mock-token' },
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Authentication failed'
      }));
    }
  };

  const signUp = async (email: string, password: string, options?: object) => {
    try {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null
      }));

      // Mock signup logic
      console.log(`Sign up attempt with ${email}`, options);
      
      // Usually new users don't get logged in automatically
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false
      }));
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Registration failed'
      }));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null
      }));
      
      // Backup data before logout
      await createClientDataBackup();

      // Mock signout
      console.log('Signing out');
      
      // Clear auth state
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Error signing out'
      }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log(`Password reset requested for ${email}`);
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        error: 'Error resetting password'
      }));
    }
  };

  const updateUserProfile = async (data: object): Promise<boolean> => {
    try {
      console.log('Updating user profile', data);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const value = {
    authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export default SupabaseAuthContext;
