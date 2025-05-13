
/**
 * Error handling utilities for the application
 */

/**
 * Safely parse JSON with a fallback value
 * @param json The JSON string to parse
 * @param fallback A fallback value if parsing fails
 * @returns The parsed JSON object or the fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Wrap a function with error handling
 * @param fn The function to wrap
 * @param errorHandler Optional custom error handler
 * @returns The wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error, ...args: Parameters<T>) => ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      console.error('Error in function:', error);
      
      if (errorHandler) {
        return errorHandler(error instanceof Error ? error : new Error(String(error)), ...args);
      }
      
      // Default error handling if no custom handler provided
      throw error;
    }
  };
}

/**
 * Try to execute an asynchronous function and handle errors
 * @param fn The async function to execute
 * @param fallback Optional fallback value if the function fails
 * @returns The result of the function or the fallback value
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Error in async function:', error);
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw error;
  }
}

/**
 * Validate an email address
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate a phone number
 * @param phone The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, and parentheses
  const re = /^[\d\s\-()]+$/;
  return re.test(phone) && phone.length >= 10;
}
