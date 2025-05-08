
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SuspenseFallbackProps {
  message?: string;
  error?: Error | null;
}

// Define a type for the saved state
interface SavedLoadingState {
  timestamp: number;
  path: string;
  message: string;
  attempts: number;
}

/**
 * A fallback component to display during lazy loading or when errors occur
 * Enhanced with state persistence and improved error handling
 */
const SuspenseFallback: React.FC<SuspenseFallbackProps> = ({ 
  message = 'Loading content...',
  error = null
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingState, setLoadingState] = useState<SavedLoadingState | null>(null);
  const [errorRetries, setErrorRetries] = useState(0);
  
  // Save loading state to sessionStorage for persistence across renders
  useEffect(() => {
    try {
      // Retrieve any existing loading state
      const savedState = sessionStorage.getItem('suspense_loading_state');
      const parsedState = savedState ? JSON.parse(savedState) as SavedLoadingState : null;
      
      if (parsedState && parsedState.path === location.pathname) {
        setLoadingState(parsedState);
      } else {
        // Create new state if path changed or no previous state
        const newState: SavedLoadingState = {
          timestamp: Date.now(),
          path: location.pathname,
          message,
          attempts: 1
        };
        setLoadingState(newState);
        sessionStorage.setItem('suspense_loading_state', JSON.stringify(newState));
      }
    } catch (e) {
      // Silent fail if sessionStorage is unavailable
      console.warn('Unable to save loading state:', e);
    }
    
    // Cleanup function to handle unmounting
    return () => {
      try {
        if (!error) {
          // Clear state when component loads successfully
          sessionStorage.removeItem('suspense_loading_state');
        }
      } catch (e) {
        console.warn('Error clearing loading state:', e);
      }
    };
  }, [location.pathname, message, error]);
  
  // Handle timeouts for loading
  useEffect(() => {
    if (!error && loadingState) {
      const timeoutId = setTimeout(() => {
        if (loadingState.attempts > 3) {
          console.warn('Loading timeout after multiple attempts');
          // Broadcast loading issue to application
          window.dispatchEvent(new CustomEvent('app:loading:timeout', { 
            detail: { path: location.pathname, attempts: loadingState.attempts }
          }));
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loadingState, error, location.pathname]);
  
  // Handle reload with error state preservation
  const handleReload = () => {
    try {
      if (loadingState) {
        // Update attempt count
        const updatedState = {
          ...loadingState,
          attempts: loadingState.attempts + 1,
          timestamp: Date.now()
        };
        sessionStorage.setItem('suspense_loading_state', JSON.stringify(updatedState));
      }
      
      setErrorRetries(prev => prev + 1);
      
      if (errorRetries >= 2) {
        // After multiple retries, navigate to a safe route
        navigate('/dashboard', { replace: true });
        return;
      }
      
      window.location.reload();
    } catch (e) {
      // Fallback if the above fails
      window.location.reload();
    }
  };
  
  if (error) {
    // Enhanced error state with retry count and more helpful messaging
    return (
      <div className="min-h-[200px] p-4 m-4 border border-red-300 rounded bg-red-50 flex flex-col items-center justify-center" 
           role="alert" aria-live="assertive">
        <h3 className="text-lg font-semibold text-red-600">Error Loading Content</h3>
        <p className="text-red-500 mb-2 text-center">
          {error.message || 'Failed to load this page component.'}
        </p>
        {loadingState && loadingState.attempts > 1 && (
          <p className="text-sm text-gray-600 mb-2">
            Loading attempts: {loadingState.attempts}
          </p>
        )}
        <div className="flex space-x-2">
          <button 
            onClick={handleReload}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
          {errorRetries >= 1 && (
            <button 
              onClick={() => navigate('/dashboard', { replace: true })}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Enhanced loading state with additional information for longer loads
  return (
    <div className="min-h-[200px] p-4 m-4 border border-gray-200 rounded bg-gray-50 flex flex-col items-center justify-center" 
         role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">{message}</p>
      {loadingState && loadingState.attempts > 1 && (
        <p className="text-xs text-gray-400 mt-2">
          Still loading... ({loadingState.attempts > 1 ? `Attempt ${loadingState.attempts}` : ''})
        </p>
      )}
    </div>
  );
};

export default SuspenseFallback;
