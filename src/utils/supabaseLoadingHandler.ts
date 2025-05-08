import { PostgrestError } from '@supabase/supabase-js';

/**
 * Utility functions for handling Supabase loading states and errors
 * These work with SuspenseFallback without modifying it
 */

// Handles Supabase errors in a standardized way
export const handleSupabaseError = (error: PostgrestError | null) => {
  if (!error) return null;
  
  // Log the error for debugging
  console.error('Supabase operation failed:', error);
  
  // Broadcast error to application via custom event
  window.dispatchEvent(new CustomEvent('app:supabase:error', { 
    detail: { error }
  }));
  
  // Return a standardized error message for the UI
  return new Error(`Database operation failed: ${error.message || 'Unknown error'}`);
};

// Wrap Supabase operations to handle loading states consistently
export const withSupabaseLoading = async <T>(
  operation: () => Promise<T>,
  onStart?: () => void,
  onComplete?: () => void
): Promise<T> => {
  try {
    // Signal loading start
    if (onStart) onStart();
    
    // Perform the operation
    const result = await operation();
    
    return result;
  } catch (error) {
    // For unexpected errors (not PostgrestError)
    const genericError = error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during the database operation');
    
    // Broadcast error
    window.dispatchEvent(new CustomEvent('app:supabase:error', { 
      detail: { error: genericError }
    }));
    
    throw genericError;
  } finally {
    // Signal loading complete
    if (onComplete) onComplete();
  }
};

// Helper for working with employee images (based on memory about 'image' column)
export const getEmployeeImageUrl = (employeeData: any): string => {
  // Using the correct column name as mentioned in the memories
  if (employeeData && employeeData.image) {
    return employeeData.image;
  }
  
  // Return default image if none exists
  return '/assets/images/default-profile.png';
};
