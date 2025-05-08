import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to handle employee images
// Using the correct column name 'image' as noted in the memory
export const getEmployeeImageUrl = (employee: any) => {
  if (employee && employee.image) {
    return employee.image;
  }
  return '/assets/images/default-avatar.png';
};
