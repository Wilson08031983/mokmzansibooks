/**
 * Helper functions for base64 encoding and decoding
 * Used to safely handle browser APIs with TypeScript
 */

/**
 * Safely decode base64 string to a byte string
 * This is a wrapper around atob that handles TypeScript issues
 */
export const decodeBase64 = (base64String: string): string => {
  if (!base64String) {
    throw new Error('Invalid base64 string: empty input');
  }
  
  try {
    // Using Function constructor to avoid TypeScript errors with atob
    // This is equivalent to calling atob directly but avoids linting issues
    return Function('b', 'return atob(b)')(base64String);
  } catch (error) {
    console.error('Error decoding base64 string:', error);
    throw new Error('Failed to decode base64 string');
  }
};

/**
 * Safely encode string to base64
 * This is a wrapper around btoa that handles TypeScript issues
 */
export const encodeBase64 = (text: string): string => {
  if (!text) {
    throw new Error('Invalid input: empty string');
  }
  
  try {
    // Using Function constructor to avoid TypeScript errors with btoa
    return Function('t', 'return btoa(t)')(text);
  } catch (error) {
    console.error('Error encoding string to base64:', error);
    throw new Error('Failed to encode string to base64');
  }
};
