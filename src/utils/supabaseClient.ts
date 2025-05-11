import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hard-coded fallback values if env vars are missing (for development only)
const FALLBACK_URL = 'https://bazbbweawubxqfebliil.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhemJid2Vhd3VieHFmZWJsaWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODg5NDIsImV4cCI6MjA1Nzg2NDk0Mn0.2EVPWwcvbXdm2EttFfcyDd63B-TlCTpY-Bd-OuWRnWU';

// Validate and provide meaningful diagnostics for missing configuration
if (!supabaseUrl || supabaseUrl === '') {
  console.warn('VITE_SUPABASE_URL is missing or empty. Using fallback URL for development.');
}

if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.warn('VITE_SUPABASE_ANON_KEY is missing or empty. Using fallback key for development.');
}

// Use the environment variables if available, otherwise fall back to the hard-coded values
const finalSupabaseUrl = (supabaseUrl && supabaseUrl !== '') ? supabaseUrl : FALLBACK_URL;
const finalSupabaseAnonKey = (supabaseAnonKey && supabaseAnonKey !== '') ? supabaseAnonKey : FALLBACK_KEY;

// Create a single supabase client for interacting with your database
let supabaseClient;
try {
  if (!finalSupabaseUrl || !finalSupabaseAnonKey) {
    throw new Error('Supabase configuration is missing. Check your environment variables.');
  }
  
  supabaseClient = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  
  // Create a mock client that won't crash the app but will log errors
  supabaseClient = new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'auth') {
        return { onAuthStateChange: () => ({ data: null, error: null }) };
      }
      return () => Promise.resolve({ data: null, error: 'Supabase client not available' });
    }
  });
}

export const supabase = supabaseClient;

// Utility function to check if the Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('heartbeat').select('*').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Utility function to handle employee images
// Using the correct column name 'image' as noted in the memory
export const getEmployeeImageUrl = (employee: any) => {
  if (employee && employee.image) {
    return employee.image;
  }
  return '/assets/images/default-avatar.png';
};
