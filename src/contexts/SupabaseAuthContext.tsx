import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { usePersistence } from './PersistenceContext';
import { 
  signInWithEmail, 
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  resetPassword,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  mapSupabaseUser,
  SupabaseUser
} from '@/services/supabaseAuthService';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const persistence = usePersistence();
  
  // Mock auth for development mode
  const usingMockAuth = process.env.NODE_ENV === 'development' && 
                       import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  
  // Check for persisted mock user
  const checkPersistedMockUser = () => {
    if (usingMockAuth) {
      const mockUserJson = localStorage.getItem('mock_auth_user');
      if (mockUserJson) {
        try {
          const mockUser = JSON.parse(mockUserJson);
          setCurrentUser(mockUser as SupabaseUser);
          setIsLoading(false);
          return true;
        } catch (e) {
          console.error('Failed to parse mock user:', e);
          localStorage.removeItem('mock_auth_user');
        }
      }
    }
    return false;
  };

  // Initialize auth state from multiple sources with persistence fallbacks
  useEffect(() => {
    // Try to get persisted user first for instant loading
    if (usingMockAuth && checkPersistedMockUser()) {
      return;
    }

    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // First try to get user from our robust persistence system
        if (persistence.isReady) {
          const persistedUser = await persistence.getItem('currentAuthUser', null);
          const persistedSession = await persistence.getItem('currentAuthSession', null);
          
          if (persistedUser) {
            setCurrentUser(persistedUser as SupabaseUser);
            if (persistedSession) setSession(persistedSession as Session);
            console.log('Auth state restored from persistence layer');
          }
        }
        
        // Then get the current authenticated user from Supabase
        const user = await getCurrentUser();
        const mappedUser = mapSupabaseUser(user);
        setCurrentUser(mappedUser);
        
        // Store in our persistence layer for future app starts
        if (persistence.isReady && mappedUser) {
          await persistence.saveItem('currentAuthUser', mappedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error as AuthError);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up enhanced auth state listener with improved error recovery
    const { data: authListener } = onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession ? 'Session exists' : 'No session');
      
      setSession(currentSession);
      const user = currentSession?.user || null;
      const mappedUser = mapSupabaseUser(user);
      setCurrentUser(mappedUser);
      setIsLoading(false);
      
      // Update our persistence layer
      if (persistence.isReady) {
        if (mappedUser) {
          await persistence.saveItem('currentAuthUser', mappedUser);
          await persistence.saveItem('currentAuthSession', currentSession);
        } else if (event === 'SIGNED_OUT') {
          // Clear auth-related persisted data
          await persistence.removeItem('currentAuthUser');
          await persistence.removeItem('currentAuthSession');
          console.log('User signed out, clearing auth data');
        }
      }
    });

    return () => {
      // Clean up subscription
      authListener.subscription.unsubscribe();
    };
  }, [usingMockAuth, persistence]);
  
  // Sign in handler
  const handleSignIn = async (email: string, password: string) => {
    try {
      // For mock auth
      if (usingMockAuth) {
        const MOCK_USERS = [
          { email: 'admin@example.com', password: 'password123', displayName: 'Admin User' },
          { email: 'user@example.com', password: 'password123', displayName: 'Test User' }
        ];
        
        const mockUser = MOCK_USERS.find(u => 
          u.email === email && u.password === password
        );
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (mockUser) {
          const user = {
            id: btoa(email),
            email,
            user_metadata: {
              display_name: mockUser.displayName
            },
            app_metadata: {},
            aud: 'mock',
            created_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            displayName: mockUser.displayName,
            emailVerified: true,
            uid: btoa(email)
          };
          
          setCurrentUser(user as unknown as SupabaseUser);
          localStorage.setItem('mock_auth_user', JSON.stringify(user));
          
          toast({
            title: 'Signed in (Development Mode)',
            description: `Welcome, ${mockUser.displayName}!`,
          });
          
          navigate('/dashboard');
          return;
        } else {
          toast({
            title: 'Sign In Failed (Development Mode)',
            description: 'Invalid email or password',
            variant: 'destructive',
          });
          throw new Error('Invalid credentials');
        }
      }
      
      // Real auth with Supabase
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;
      
      if (data.user) {
        setCurrentUser(mapSupabaseUser(data.user));
        
        toast({
          title: 'Signed In',
          description: 'Welcome back!',
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign In Failed',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Sign up handler
  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      // For mock auth
      if (usingMockAuth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = {
          id: btoa(email),
          email,
          user_metadata: {
            display_name: displayName
          },
          app_metadata: {},
          aud: 'mock',
          created_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          displayName,
          emailVerified: true,
          uid: btoa(email)
        };
        
        setCurrentUser(user as unknown as SupabaseUser);
        localStorage.setItem('mock_auth_user', JSON.stringify(user));
        
        toast({
          title: 'Account Created (Development Mode)',
          description: `Welcome, ${displayName}!`,
        });
        
        navigate('/onboarding');
        return;
      }
      
      // Real auth with Supabase
      const { data, error } = await signUpWithEmail(email, password, {
        display_name: displayName
      });
      
      if (error) throw error;
      
      if (data.user) {
        setCurrentUser(mapSupabaseUser(data.user));
        
        toast({
          title: 'Account Created',
          description: 'Welcome to MokMzansi Books!',
        });
        
        navigate('/onboarding');
      } else {
        toast({
          title: 'Verification Required',
          description: 'Please check your email to verify your account',
        });
        navigate('/signin');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: 'Sign Up Failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Sign out handler
  const handleSignOut = async () => {
    try {
      // For mock auth
      if (usingMockAuth) {
        localStorage.removeItem('mock_auth_user');
        setCurrentUser(null);
        
        toast({
          title: 'Signed Out (Development Mode)',
          description: 'You have been signed out',
        });
        
        navigate('/signin');
        return;
      }
      
      // Real auth with Supabase
      const { error } = await signOut();
      
      if (error) throw error;
      
      // Auth listener will handle setting user to null
      
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully',
      });
      
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign Out Failed',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };
  
  // Reset password handler
  const handleResetPassword = async (email: string) => {
    try {
      // For mock auth
      if (usingMockAuth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast({
          title: 'Password Reset Email Sent (Development Mode)',
          description: 'Check your email for the reset link',
        });
        return;
      }
      
      // Real auth with Supabase
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for the reset link',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error instanceof Error ? error.message : 'Failed to send reset email',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Update profile handler
  const handleUpdateUserProfile = async (displayName: string) => {
    try {
      // For mock auth
      if (usingMockAuth && currentUser) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedUser = {
          ...currentUser,
          user_metadata: {
            ...currentUser.user_metadata,
            display_name: displayName
          },
          displayName
        };
        
        setCurrentUser(updatedUser as SupabaseUser);
        localStorage.setItem('mock_auth_user', JSON.stringify(updatedUser));
        
        toast({
          title: 'Profile Updated (Development Mode)',
          description: 'Your profile has been updated successfully',
        });
        return;
      }
      
      // Real auth with Supabase
      const { error } = await updateUserProfile({
        display_name: displayName
      });
      
      if (error) throw error;
      
      // Update current user in state
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          user_metadata: {
            ...currentUser.user_metadata,
            display_name: displayName
          },
          displayName
        };
        
        setCurrentUser(updatedUser as SupabaseUser);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Profile Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Update email handler
  const handleUpdateUserEmail = async (email: string) => {
    try {
      // For mock auth
      if (usingMockAuth && currentUser) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedUser = {
          ...currentUser,
          email
        };
        
        setCurrentUser(updatedUser as SupabaseUser);
        localStorage.setItem('mock_auth_user', JSON.stringify(updatedUser));
        
        toast({
          title: 'Email Updated (Development Mode)',
          description: 'Your email has been updated successfully',
        });
        return;
      }
      
      // Real auth with Supabase
      const { error } = await updateUserEmail(email);
      
      if (error) throw error;
      
      toast({
        title: 'Email Update Initiated',
        description: 'Check your new email for a confirmation link',
      });
    } catch (error) {
      console.error('Email update error:', error);
      toast({
        title: 'Email Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update email',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Update password handler
  const handleUpdateUserPassword = async (password: string) => {
    try {
      // For mock auth
      if (usingMockAuth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast({
          title: 'Password Updated (Development Mode)',
          description: 'Your password has been updated successfully',
        });
        return;
      }
      
      // Real auth with Supabase
      const { error } = await updateUserPassword(password);
      
      if (error) throw error;
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully',
      });
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: 'Password Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update password',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Google sign-in handler
  const handleSignInWithGoogle = async () => {
    try {
      // For mock auth
      if (usingMockAuth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockEmail = 'google-user@example.com';
        const user = {
          id: btoa(mockEmail),
          email: mockEmail,
          user_metadata: {
            display_name: 'Google User',
            avatar_url: 'https://lh3.googleusercontent.com/a/default-user'
          },
          app_metadata: {
            provider: 'google'
          },
          aud: 'mock',
          created_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          // From the mapper
          displayName: 'Google User',
          emailVerified: true,
          uid: btoa(mockEmail)
        };
        
        setCurrentUser(user as unknown as SupabaseUser);
        localStorage.setItem('mock_auth_user', JSON.stringify(user));
        
        toast({
          title: 'Signed in with Google (Development Mode)',
          description: 'Welcome, Google User!',
        });
        
        navigate('/dashboard');
        return;
      }
      
      // Real auth with Supabase
      const { error } = await signInWithGoogle();
      
      if (error) throw error;
      
      toast({
        title: 'Redirecting to Google',
        description: 'Please complete authentication with Google',
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: 'Google Sign In Failed',
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Provide the context value
  const contextValue = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updateUserProfile: handleUpdateUserProfile,
    updateUserEmail: handleUpdateUserEmail,
    updateUserPassword: handleUpdateUserPassword,
  };
  
  return (
    <SupabaseAuthContext.Provider value={contextValue}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Hook to use auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
