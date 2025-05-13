
// Ensure that imports from supabase are correctly importing from your client file
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a type-safe client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test the connection to Supabase
 * @returns True if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase credentials not found in environment variables');
      return false;
    }

    // Test database connection with a simple health check
    const { data, error } = await supabase.from('instruments').select('count').single();

    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return false;
    }

    console.log('Supabase connection successful!', data);
    return true;
  } catch (error) {
    console.error('Failed to test Supabase connection:', error);
    return false;
  }
}

/**
 * Check for required tables in the database
 * @returns A list of missing tables, or an empty array if all required tables exist
 */
export async function checkForRequiredTables(): Promise<string[]> {
  try {
    const requiredTables = ['app_data', 'company_data'];
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      try {
        // Try to query each table with a count to see if it exists
        const { error } = await supabase.rpc('check_table_exists', { table_name: table });
        
        if (error) {
          console.error(`Error checking table ${table}:`, error.message);
          missingTables.push(table);
        }
      } catch (error) {
        console.error(`Error checking table ${table}:`, error);
        missingTables.push(table);
      }
    }

    return missingTables;
  } catch (error) {
    console.error('Error checking for required tables:', error);
    return ['Failed to check tables'];
  }
}
