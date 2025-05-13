
/**
 * Safely stringifies an object, handling circular references
 * @param obj - The object to stringify
 * @returns A JSON string representation of the object
 */
export function safeJsonStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    console.error("Failed to stringify object:", error);
    return '{"error": "Failed to stringify object"}';
  }
}

/**
 * Higher-order function that wraps a function with error handling
 * @param fn - The function to wrap
 * @param errorHandler - Optional custom error handler
 * @returns A wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error, ...args: Parameters<T>) => ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(`Error in function ${fn.name || 'anonymous'}:`, error);
      
      if (errorHandler) {
        return errorHandler(error as Error, ...args);
      }
      
      // Default error handling behavior
      throw error;
    }
  };
}

/**
 * Logs errors to the console and optionally to a service
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 */
export function logError(error: Error, context?: string): void {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // Here you could add code to log to an external service
  // Example: sendToErrorLoggingService(error, context);
}
