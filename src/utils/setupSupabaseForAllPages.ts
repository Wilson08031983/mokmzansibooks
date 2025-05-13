
/**
 * Utility to initialize Supabase for all pages
 */

import { supabase } from '@/integrations/supabase/client';

export const initializeSupabaseForAllPages = async (): Promise<boolean> => {
  try {
    // Initialize any required session handling or global Supabase setup
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error initializing Supabase session:', error);
      return false;
    }
    
    // Set up authentication listeners or other global Supabase configs
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      // Handle authentication state changes
    });
    
    // Successful initialization
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase for all pages:', error);
    return false;
  }
};

export default initializeSupabaseForAllPages;
