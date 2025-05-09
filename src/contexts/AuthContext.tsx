import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Before signing out, ensure client data is backed up
      const { createClientDataBackup } = await import('@/utils/clientDataPersistence');
      createClientDataBackup();
      
      await firebaseSignOut(auth);
      navigate('/signin');
      
      // After signing out, reinitialize app to ensure data is still available
      const { reinitializeAfterLogout } = await import('@/utils/initApp');
      reinitializeAfterLogout();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string): Promise<void> => {
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateUserEmail = async (email: string): Promise<void> => {
    try {
      if (currentUser) {
        await updateEmail(currentUser, email);
      }
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  };

  const updateUserPassword = async (password: string): Promise<void> => {
    try {
      if (currentUser) {
        await updatePassword(currentUser, password);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
