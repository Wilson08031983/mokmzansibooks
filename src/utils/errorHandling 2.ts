/**
 * Error handling utilities for MokMzansi Books
 */

/**
 * Safely parse JSON with error handling
 * @param jsonString The JSON string to parse
 * @param fallback Default value to return if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Safely stringify an object to JSON with error handling
 * @param value The value to stringify
 * @returns JSON string or empty string if stringification fails
 */
export function safeJsonStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return '';
  }
}

/**
 * Type guard to check if a value is not null or undefined
 * @param value The value to check
 * @returns Boolean indicating if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safely access nested properties without causing errors
 * @param obj The object to access
 * @param path The path to the property (e.g., 'user.address.city')
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return (current === undefined || current === null) ? defaultValue : current as T;
  } catch (error) {
    console.error(`Error accessing path ${path}:`, error);
    return defaultValue;
  }
}

/**
 * Wrap an async function with error handling
 * @param fn The async function to wrap
 * @param errorHandler Function to handle errors
 * @returns A wrapped function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler: (error: any) => void
): (...args: T) => Promise<R | undefined> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler(error);
      return undefined;
    }
  };
}
