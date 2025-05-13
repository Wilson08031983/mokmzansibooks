
/**
 * Error handling utilities
 */

/**
 * Safely parse JSON strings
 * @param jsonString - The JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 * @returns The parsed object or the fallback value
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    if (!jsonString) return fallback;
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON string:', error);
    return fallback;
  }
}

/**
 * Safely stringify an object to JSON
 * @param value - The value to stringify
 * @param fallback - Optional fallback string if stringification fails
 * @returns The JSON string or the fallback value
 */
export function safeJsonStringify<T>(value: T, fallback = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Failed to stringify object:', error);
    return fallback;
  }
}

/**
 * Wrap a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Optional error message
 * @returns A new promise that rejects if the original promise doesn't resolve within the timeout
 */
export function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Wrap a function call in a try-catch block and return a result object
 * @param fn - The function to call
 * @param args - Arguments to pass to the function
 * @returns An object with success flag and either data or error
 */
export async function tryCatch<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T> | T,
  ...args: Args
): Promise<{ success: boolean; data?: T; error?: Error }> {
  try {
    const data = await fn(...args);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Retry a function multiple times before giving up
 * @param fn - The function to retry
 * @param retries - Number of retries
 * @param delay - Delay between retries in milliseconds
 * @param args - Arguments to pass to the function
 * @returns The function result or throws after all retries fail
 */
export async function retry<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  retries = 3,
  delay = 300,
  ...args: Args
): Promise<T> {
  try {
    return await fn(...args);
  } catch (error) {
    if (retries <= 1) throw error;
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with one less retry and increased delay
    return retry(fn, retries - 1, delay * 1.5, ...args);
  }
}

/**
 * Global error handler for unexpected errors
 * @param error - The error to handle
 * @param context - Optional context information
 */
export function handleGlobalError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Unknown error';
    
  console.error(`Global error${context ? ` in ${context}` : ''}:`, error);
  
  // In a real app, this could send errors to a monitoring service
  // or display a user-friendly error message
}
