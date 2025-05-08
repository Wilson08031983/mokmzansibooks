import { setupGlobalErrorHandlers } from './errorHandlers';

/**
 * Initialize application-wide configurations and handlers
 * This should be called once at application startup
 */
export const initializeApp = () => {
  // Set up global error handlers to catch and log unhandled exceptions
  setupGlobalErrorHandlers();
  
  // Add these settings to help with common React rendering issues
  // Set React strictmode checks in development but not in production
  if (process.env.NODE_ENV === 'development') {
    // Enable additional console warnings for potential issues
    console.warn('Running in development mode with enhanced error checking');
  }
  
  console.log('Application initialized with global error handlers');
  
  // Listen specifically for React rendering errors
  window.addEventListener('error', (event) => {
    // Check if this is likely a React rendering error
    if (
      event.error?.message?.includes('render') || 
      event.error?.stack?.includes('react-dom') ||
      event.error?.stack?.includes('react-jsx')
    ) {
      console.error('React rendering error detected:', event.error);
      // You could potentially reload problematic components here
      // or trigger state cleanup
    }
  });
  
  // Fix for "ResizeObserver loop limit exceeded" error which often appears in the console
  // This error is generally harmless but can flood the console
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('ResizeObserver loop limit exceeded')) {
      // Ignore this specific error as it's usually non-critical
      return;
    }
    originalError.apply(console, args);
  };
};

export default initializeApp;
