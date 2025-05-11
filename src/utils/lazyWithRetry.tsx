import { lazy } from 'react';

/**
 * Enhanced version of React.lazy that handles module loading errors gracefully
 * 
 * This handles several common scenarios:
 * 1. Network issues while loading a module (will retry)
 * 2. Supabase connection errors (will retry)
 * 3. Module loading failures (will show fallback with error details)
 * 4. Module parsing errors (will show fallback with error details)
 * 
 * @param factory Function that imports the component
 * @param retries Number of retries before failing
 * @returns Lazily loaded component with error handling
 */
export function lazyWithRetry(factory: () => Promise<any>, retries = 5) {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    // Try multiple times to load the module
    for (let i = 0; i < retries; i++) {
      try {
        // Add a small delay between retries to avoid overwhelming the system
        if (i > 0) {
          // Exponential backoff: wait longer for each subsequent retry
          await new Promise(resolve => setTimeout(resolve, 250 * Math.pow(2, i)));
        }
        
        return await factory();
      } catch (err) {
        lastError = err as Error;
        console.warn(`Module loading failed (attempt ${i + 1} of ${retries}):`, err);
        
        // Determine if the error is retryable
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isNetworkError = (
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network Error') || 
          errorMessage.includes('network') ||
          errorMessage.includes('connection')
        );
        
        const isSupabaseError = (
          errorMessage.includes('supabaseUrl') ||
          errorMessage.includes('Supabase') ||
          errorMessage.includes('anon key')
        );
        
        const isChunkLoadError = (
          errorMessage.includes('Loading chunk') ||
          errorMessage.includes('dynamically imported module') ||
          errorMessage.includes('chunk')
        );
        
        // Retry on network errors, supabase connection issues, or chunk loading errors
        if (isNetworkError || isSupabaseError || isChunkLoadError) {
          continue;
        }
        
        // For other errors (syntax errors, etc.), don't retry
        break;
      }
    }
    
    // If we got here, all retries failed - log and provide fallback
    console.error('Module loading failed after all retries:', lastError);
    
    // Return an enhanced fallback component with better diagnostics
    return {
      default: (props: any) => {
        // Get more information about the error to help troubleshoot
        const errorMessage = lastError?.message || 'Unknown loading error';
        const errorStack = lastError?.stack || '';
        
        // Check for specific known issues based on the error message
        const isSupabaseError = errorMessage.includes('supabase') || errorMessage.includes('anon key');
        const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection');
        const isChunkError = errorMessage.includes('chunk') || errorMessage.includes('import');
        
        // Create a custom help message based on the error type
        let helpMessage = 'Try refreshing the page to resolve this issue.';
        
        if (isSupabaseError) {
          helpMessage = 'There seems to be an issue connecting to the database. Please ensure your Supabase connection is configured correctly.';
        } else if (isNetworkError) {
          helpMessage = 'A network error occurred. Please check your internet connection and try again.';
        } else if (isChunkError) {
          helpMessage = 'A module failed to load correctly. This might be fixed by clearing your browser cache and refreshing.';
        }
        
        return (
          <div className="p-6 m-4 border border-red-300 rounded-lg bg-red-50 shadow-md max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-700">Component Loading Error</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-red-600 font-medium mb-2">
                MokMzansi Books couldn't load this component.
              </p>
              <p className="text-gray-700 mb-2">{helpMessage}</p>
            </div>
            
            <div className="mb-4 p-3 bg-white rounded border border-red-200 text-sm font-mono overflow-auto max-h-32">
              <p className="text-red-500">{errorMessage}</p>
              {errorStack && (
                <details className="mt-2">
                  <summary className="text-gray-600 cursor-pointer">View error details</summary>
                  <p className="text-gray-500 whitespace-pre-wrap mt-2">{errorStack.split('\n').slice(1).join('\n')}</p>
                </details>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 justify-start">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('companyDetails');
                  localStorage.removeItem('publicCompanyDetails');
                  window.location.reload();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cache & Refresh
              </button>
              
              {isSupabaseError && (
                <button 
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                  </svg>
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        );
      }
    };
  });
}

export default lazyWithRetry;
