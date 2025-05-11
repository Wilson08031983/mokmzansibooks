import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Import our Database types - use relative path to avoid path mapping issues
import { Database } from '../types/supabase';

/**
 * Enhanced Supabase Client Configuration
 * This provides improved error handling, fallbacks, and connection management.
 */

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bazbbweawubxqfebliil.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhemJid2Vhd3VieHFmZWJsaWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODg5NDIsImV4cCI6MjA1Nzg2NDk0Mn0.2EVPWwcvbXdm2EttFfcyDd63B-TlCTpY-Bd-OuWRnWU';

// Validate configuration
if (!supabaseUrl || supabaseUrl === '') {
  console.error('CRITICAL ERROR: Missing Supabase URL');
}

if (!supabaseKey || supabaseKey === '') {
  console.error('CRITICAL ERROR: Missing Supabase Anon Key');
}

// Create Supabase client with additional options
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'mok_mzansi_auth_token',
    flowType: 'pkce', // Use PKCE flow for more secure authentication
  },
  global: {
    fetch: fetch
  },
  realtime: {
    timeout: 30000, // longer timeout for realtime connections
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
  // Debug mode is no longer directly supported in this way
});

/**
 * Helper function to check Supabase connection status
 * @returns Promise with connection status
 */
export const checkSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Simple health check query
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error.message);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
    
    console.log('Supabase connection successful');
    return { success: true, message: 'Connection successful' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Supabase connection exception:', errorMessage);
    return { success: false, message: `Connection exception: ${errorMessage}` };
  }
};

// Expose connection status globally for debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).checkSupabaseConnection = checkSupabaseConnection;
}
