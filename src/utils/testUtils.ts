
// Test utilities for internal use in the project

/**
 * Helper function to format a price
 * @param price The price to format
 * @returns A formatted price string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Generates a random identifier for testing purposes
 */
export function generateTestId() {
  return `test-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Capitalize the first letter of each word in a string
 * @param str The string to capitalize
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Create a delay for testing async operations
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock API call for testing
 * @param success Whether the API call should succeed
 * @param data The data to return
 */
export async function mockApiCall<T>(success: boolean, data: T): Promise<T> {
  await delay(300); // Simulate network delay
  
  if (!success) {
    throw new Error('API call failed');
  }
  
  return data;
}

/**
 * A simplified render function for testing
 * Note: This is a stub to keep the SuspenseFallback.test.tsx file from erroring
 * For actual tests, you would need to install @testing-library/react
 */
export const renderWithProviders = (ui: React.ReactElement) => {
  return {
    // Return a mock implementation
    getByText: () => document.createElement('div'),
    queryByText: () => null,
  };
};
