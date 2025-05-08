import { lazy } from 'react';

/**
 * Enhanced version of React.lazy that handles module loading errors gracefully
 * 
 * This handles two common scenarios:
 * 1. Network issues while loading a module (will retry)
 * 2. Module loading failures (will show fallback)
 * 
 * @param factory Function that imports the component
 * @param retries Number of retries before failing
 * @returns Lazily loaded component with error handling
 */
export function lazyWithRetry(factory: () => Promise<any>, retries = 3) {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    // Try multiple times to load the module
    for (let i = 0; i < retries; i++) {
      try {
        return await factory();
      } catch (err) {
        lastError = err as Error;
        
        // Only retry on network errors, not syntax or other errors
        if (
          err instanceof TypeError && 
          err.message && 
          (
            err.message.includes('Failed to fetch') || 
            err.message.includes('dynamically imported module') ||
            err.message.includes('network')
          )
        ) {
          console.warn(`Module loading failed (attempt ${i + 1} of ${retries}):`, err);
          // Wait a bit before retrying (increasing delay for each retry)
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
          continue;
        }
        
        // For other errors, don't retry
        break;
      }
    }
    
    // If we got here, all retries failed - log and provide fallback
    console.error('Module loading failed after all retries:', lastError);
    
    // Return a simple fallback component
    return {
      default: (props: any) => {
        return (
          <div className="p-4 m-4 border border-red-300 rounded bg-red-50">
            <h3 className="text-lg font-semibold text-red-600">Failed to load module</h3>
            <p className="text-red-500 mb-2">
              The requested page couldn't be loaded. Please try refreshing the page.
            </p>
            <p className="text-sm text-gray-600">
              Error: {lastError?.message || 'Unknown loading error'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        );
      }
    };
  });
}

export default lazyWithRetry;
