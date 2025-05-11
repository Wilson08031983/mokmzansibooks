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
import { toast } from '@/components/ui/use-toast';

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

  // Check for persisted mock user in localStorage
  const checkPersistedMockUser = () => {
    try {
      const mockUserJson = localStorage.getItem('mock_auth_user');
      if (mockUserJson) {
        const mockUser = JSON.parse(mockUserJson);
        setCurrentUser(mockUser as unknown as User);
        setUsingMockAuth(true);
        return true;
      }
    } catch (e) {
      console.error('Error checking persisted mock user:', e);
    }
    return false;
  };

  useEffect(() => {
    // First check if we have a persisted mock user
    const hasMockUser = checkPersistedMockUser();
    
    // If no mock user, try regular Firebase auth
    if (!hasMockUser && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsLoading(false);
        
        // Clear any mock user if we have a real Firebase user
        if (user) {
          localStorage.removeItem('mock_auth_user');
          setUsingMockAuth(false);
        }
      });
      return unsubscribe;
    } else {
      // Just update loading state if we're using mock auth
      setIsLoading(false);
    }
    
    // No cleanup needed for mock auth
    return () => {};
  }, []);

  // Track if we're using mock authentication due to Firebase configuration issues
  const [usingMockAuth, setUsingMockAuth] = useState(false);
  
  // Mock data for development/testing when Firebase is unavailable
  const MOCK_USERS = [
    { email: 'admin@example.com', password: 'password123', displayName: 'Admin User' },
    { email: 'user@example.com', password: 'password123', displayName: 'Test User' },
  ];
  
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // First try regular Firebase authentication
      if (auth && !usingMockAuth) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          return; // Success, exit early
        } catch (error: any) {
          // Check for API key errors specifically
          if (error?.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
            console.warn('Firebase API key invalid, falling back to mock authentication');
            setUsingMockAuth(true);
            toast({
              title: 'Authentication Notice',
              description: 'Using development authentication mode. Some features may be limited.',
              variant: 'default',
            });
            // Continue to mock auth below
          } else {
            // For other Firebase errors, throw normally
            console.error('Error signing in:', error);
            toast({
              title: 'Authentication Failed',
              description: error?.message || 'Invalid email or password',
              variant: 'destructive',
            });
            throw error;
          }
        }
      }
      
      // Fallback to mock authentication when Firebase is unavailable
      if (usingMockAuth || !auth) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check against mock users
        const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (mockUser) {
          // Create a mock user object similar to Firebase User
          const user = {
            uid: btoa(email), // Simple mock uid from email
            email,
            displayName: mockUser.displayName,
            emailVerified: true,
            // Add other properties needed to simulate a Firebase User
          };
          
          // Set as current user
          setCurrentUser(user as unknown as User);
          
          toast({
            title: 'Signed in (Development Mode)',
            description: `Welcome, ${mockUser.displayName}`,
          });
          
          return;
        } else {
          // Mock authentication failed
          toast({
            title: 'Authentication Failed',
            description: 'Invalid email or password',
            variant: 'destructive',
          });
          
          throw new Error('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      // Try real Firebase auth if available
      if (auth && !usingMockAuth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
          }
          return; // Success, exit early
        } catch (error: any) {
          // Check for API key errors specifically
          if (error?.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
            console.warn('Firebase API key invalid, falling back to mock authentication');
            setUsingMockAuth(true);
            // Continue to mock auth below
          } else {
            // For other Firebase errors, throw normally
            console.error('Error signing up:', error);
            toast({
              title: 'Sign Up Failed',
              description: error?.message || 'Unable to create account',
              variant: 'destructive',
            });
            throw error;
          }
        }
      }
      
      // Mock sign up when Firebase is unavailable
      if (usingMockAuth || !auth) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if email already exists
        if (MOCK_USERS.some(u => u.email === email)) {
          const error = new Error('Email already in use');
          toast({
            title: 'Sign Up Failed',
            description: 'Email already in use',
            variant: 'destructive',
          });
          throw error;
        }
        
        // Create a new mock user
        const newUser = { email, password, displayName };
        MOCK_USERS.push(newUser);
        
        // Create a mock user object similar to Firebase User
        const user = {
          uid: btoa(email),
          email,
          displayName,
          emailVerified: false,
        };
        
        // Set as current user
        setCurrentUser(user as unknown as User);
        
        // Persist mock user to localStorage
        localStorage.setItem('mock_auth_user', JSON.stringify(user));
        
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully',
        });
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
      
      if (usingMockAuth || !auth) {
        // Handle mock auth logout
        setCurrentUser(null);
        localStorage.removeItem('mock_auth_user'); // Clear persisted mock user
      } else {
        // Real Firebase logout
        await firebaseSignOut(auth);
      }
      
      // Navigate to sign in page
      navigate('/signin');
      
      // After signing out, reinitialize app to ensure data is still available
      const { reinitializeAfterLogout } = await import('@/utils/initApp');
      reinitializeAfterLogout();
      
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully',
      });
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
