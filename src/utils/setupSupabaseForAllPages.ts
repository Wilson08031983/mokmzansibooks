
/**
 * Initializes Supabase for all pages in the application
 */

import { supabase } from "@/lib/supabase";

export const initializeSupabaseForAllPages = async () => {
  try {
    console.log('Setting up Supabase for all pages...');
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client is not available');
      return false;
    }
    
    // Verify connection to Supabase
    const { data, error } = await supabase.from('app_data').select('count').limit(1);
    
    if (error) {
      console.warn('Failed to connect to Supabase', error);
      return false;
    }
    
    console.log('Supabase setup successful');
    return true;
  } catch (error) {
    console.error('Error setting up Supabase:', error);
    return false;
  }
};
