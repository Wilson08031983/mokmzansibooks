
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClientDataBackup } from '@/utils/clientDataPersistence';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export interface AuthContextProps {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
}

const SupabaseAuthContext = createContext<AuthContextProps | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Setup auth state listener
  useEffect(() => {
    setIsLoading(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setCurrentUser(session?.user ?? null);
        setIsLoading(false);
      }
    );
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Error signing in:', error.message);
        toast({
          title: 'Error signing in',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        console.error('Error signing up:', error.message);
        toast({
          title: 'Error signing up',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      });
      
      // In development, we might want to automatically sign in
      if (process.env.NODE_ENV === 'development') {
        navigate('/dashboard');
      } else {
        navigate('/signin');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      // Before signing out, ensure client data is backed up
      if (typeof createClientDataBackup === 'function') {
        createClientDataBackup();
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error.message);
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  const updateUserPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Error updating password:', error.message);
        toast({
          title: 'Error updating password',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };
  
  const value: AuthContextProps = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUserPassword,
  };
  
  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = (): AuthContextProps => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export default SupabaseAuthContext;
