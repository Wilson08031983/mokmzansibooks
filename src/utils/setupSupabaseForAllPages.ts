
import { supabase } from "@/integrations/supabase/client";

/**
 * Setup Supabase for all pages by initializing any needed configuration
 * This ensures consistent Supabase behavior across the application
 */
export async function initializeSupabaseForAllPages(): Promise<boolean> {
  try {
    // Check if Supabase is accessible
    const { error } = await supabase.from('company_data').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found" which is fine
      console.error('Supabase initialization failed:', error);
      return false;
    }
    
    // Setup auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      // Handle auth state changes globally
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error during Supabase setup:', error);
    return false;
  }
}

// Make sure to export the function as default as well
export default initializeSupabaseForAllPages;
