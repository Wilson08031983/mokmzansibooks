/**
 * Supabase Authentication Service
 * 
 * Provides authentication methods using Supabase Auth
 */

import { supabase } from '@/lib/supabase';
import { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard'
    }
  });
};

/**
 * Create a new user with email, password and optional metadata
 */
export const signUpWithEmail = async (
  email: string, 
  password: string,
  metadata?: { [key: string]: any }
): Promise<AuthResponse> => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  return await supabase.auth.signOut();
};

/**
 * Get the current session
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return data.session;
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First try to get the session which should be more reliable
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If we have a valid session, use it to get the user
    if (sessionData?.session) {
      return sessionData.session.user;
    }
    
    // Fallback to getUser if no session is available
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // Don't log AuthSessionMissingError as it's expected when not logged in
      if (error.name !== 'AuthSessionMissingError') {
        console.error('Error fetching user:', error);
      }
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
};

/**
 * Set up authentication state change listener with improved error handling
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  try {
    // First check current session to initialize state correctly
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        // Call callback with initial session
        callback('INITIAL_SESSION', data.session);
      }
    }).catch(err => {
      console.error('Error getting initial session:', err);
    });
    
    // Set up listener for auth state changes
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`);
      callback(event, session);
    });
  } catch (error) {
    console.error('Error setting up auth state change listener:', error);
    // Return a dummy unsubscribe function to prevent errors
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  updates: { display_name?: string; [key: string]: any }
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    data: updates
  });
  return { error };
};

/**
 * Update user email
 */
export const updateUserEmail = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    email
  });
  return { error };
};

/**
 * Update user password
 */
export const updateUserPassword = async (password: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    password
  });
  return { error };
};

/**
 * Check if a user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

/**
 * Get the user access token
 */
export const getUserAccessToken = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  return session?.access_token || null;
};

/**
 * Define a simple class for mapping Supabase user to Firebase-like user
 * to maintain compatibility with existing code
 */
export class SupabaseUser implements User {
  id: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    display_name?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
  confirmed_at?: string;
  email?: string;
  phone?: string;
  role?: string;
  updated_at?: string;
  
  // Firebase-like compatibility properties
  displayName: string | null;
  emailVerified: boolean;
  uid: string;
  name: string | null; // Added for compatibility
  trialEndsAt?: string; // Added for compatibility
  subscriptionStatus?: string; // Added for compatibility
  
  constructor(user: User) {
    // Copy Supabase properties
    this.id = user.id;
    this.app_metadata = user.app_metadata || {};
    this.user_metadata = user.user_metadata || {};
    this.aud = user.aud;
    this.created_at = user.created_at;
    this.confirmed_at = user.confirmed_at;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.updated_at = user.updated_at;
    
    // Set Firebase-like properties
    this.displayName = this.user_metadata.display_name || null;
    this.name = this.displayName; // Map to the name property
    this.emailVerified = !!this.confirmed_at;
    this.uid = this.id;
    
    // Additional compatibility properties
    this.trialEndsAt = this.user_metadata.trial_ends_at || undefined;
    this.subscriptionStatus = this.user_metadata.subscription_status || undefined;
  }
}

/**
 * Convert a Supabase User to a Firebase-compatible User
 */
export const mapSupabaseUser = (user: User | null): SupabaseUser | null => {
  if (!user) return null;
  return new SupabaseUser(user);
};
