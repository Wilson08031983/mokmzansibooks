
/**
 * This utility initializes Supabase for use across all pages in the application.
 * It handles authentication state, session persistence, and other global Supabase settings.
 */

import { supabase } from '@/integrations/supabase/client';

export async function initializeSupabaseForAllPages(): Promise<boolean> {
  try {
    // 1. Check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    // 2. Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Update auth state throughout the application
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
        // Any global handling for sign in
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Any global cleanup for sign out
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
        // Handle token refresh
      }
    });
    
    // 3. Set up additional configuration if needed
    // Example: Configure storage policies, etc.
    
    console.log('Supabase initialized for all pages');
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase for all pages:', error);
    return false;
  }
}

export default { initializeSupabaseForAllPages };
