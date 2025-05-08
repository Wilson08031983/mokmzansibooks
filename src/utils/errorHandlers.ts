/**
 * Global error handlers and utilities for the MokMzansi Books application
 */

import { toast } from '@/hooks/use-toast';

/**
 * Sets up global error handlers for unhandled exceptions and promise rejections
 * This helps with debugging and error reporting in production
 */
export const setupGlobalErrorHandlers = () => {
  // Previous error handler if one exists
  const previousOnError = window.onerror;
  
  // Global error handler for uncaught exceptions
  window.onerror = (message, source, lineno, colno, error) => {
    // Log to console in a structured way
    console.error('[GLOBAL ERROR]', {
      message,
      source,
      lineno,
      colno,
      error: error?.stack || error?.toString() || 'Unknown error'
    });
    
    // You could send this to a monitoring service like Sentry in production
    
    // Call previous handler if it exists
    if (previousOnError) {
      return previousOnError(message, source, lineno, colno, error);
    }
    
    // Return false to allow the default browser error handling
    return false;
  };
  
  // Previous unhandled rejection handler if one exists
  const previousOnUnhandledRejection = window.onunhandledrejection;
  
  // Global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    // Log to console in a structured way
    console.error('[UNHANDLED PROMISE REJECTION]', {
      reason: event.reason?.stack || event.reason?.toString() || 'Unknown reason',
      promise: event.promise
    });
    
    // You could send this to a monitoring service like Sentry in production
    
    // Call previous handler if it exists
    if (previousOnUnhandledRejection) {
      previousOnUnhandledRejection(event);
    }
  });
};

/**
 * Safely executes a function, catching and logging any errors
 * @param fn Function to execute
 * @param fallback Optional fallback value to return if an error occurs
 * @returns The result of the function or the fallback value
 */
export function trySafe<T>(fn: () => T, fallback?: T): T {
  try {
    return fn();
  } catch (error) {
    console.error('[ERROR IN trySafe]', error);
    return fallback as T;
  }
}

/**
 * Wraps React component rendering in a try-catch to prevent rendering errors from crashing the app
 * @param renderFn The render function to safely execute
 * @param fallbackUI Optional fallback UI to render if the main render fails
 * @returns JSX content (either the successfully rendered content or fallback)
 */
export const safeRender = (renderFn: () => React.ReactNode, fallbackUI?: React.ReactNode): React.ReactNode => {
  try {
    return renderFn();
  } catch (error) {
    console.error('[RENDER ERROR]', error);
    // Return fallback UI as string since we can't use JSX in a .ts file
    return fallbackUI || "Error rendering component";
  }
};

/**
 * Function to safely parse JSON without throwing exceptions
 * @param jsonString The JSON string to parse
 * @param fallback Optional fallback value to return if parsing fails
 * @returns The parsed object or the fallback value
 */
export function safeJsonParse<T>(jsonString: string, fallback?: T): T | undefined {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('[JSON PARSE ERROR]', error);
    return fallback;
  }
}

export default {
  setupGlobalErrorHandlers,
  trySafe,
  safeRender,
  safeJsonParse
};
