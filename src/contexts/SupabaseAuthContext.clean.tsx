import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  // Initialize auth state
  useEffect(() => {
    // First check if we're using mock auth
    const hasMockUser = checkPersistedMockUser();
    
    // If not using mock auth, set up real auth
    if (!hasMockUser) {
      // Initialize user from session
      const initUser = async () => {
        try {
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(mapSupabaseUser(user));
          }
        } catch (error) {
          // Silently handle AuthSessionMissingError - the user is probably not logged in
          if (error.name !== 'AuthSessionMissingError') {
            console.error('Error initializing auth:', error);
          }
        } finally {
          // Always set loading to false
          setIsLoading(false);
        }
      };
      
      // Set up auth state change listener
      const setupAuthListener = async () => {
        try {
          const { data } = onAuthStateChange((event, session) => {
            console.log(`Auth event: ${event}`);
            
            if (session?.user) {
              setCurrentUser(mapSupabaseUser(session.user));
            } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              setCurrentUser(null);
            }
          });
          
          return data.subscription;
        } catch (error) {
          console.error('Error setting up auth listener:', error);
          return { unsubscribe: () => {} };
        }
      };
      
      // Initialize auth
      initUser();
      
      // Set up listener
      let subscription: { unsubscribe: () => void } | null = null;
      setupAuthListener().then(sub => {
        subscription = sub;
      });
      
      // Clean up on unmount
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, []);
  
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
