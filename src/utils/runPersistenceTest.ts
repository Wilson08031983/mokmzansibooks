
/**
 * Run persistence tests to ensure data storage mechanisms are working
 */
import { testPersistence } from './testPersistence';

// Run the persistence tests
const results = testPersistence();

// Report results to console
console.log('Persistence test results:', results);

// Set a flag on the window object to indicate test completion
if (typeof window !== 'undefined') {
  (window as any).__PERSISTENCE_TESTS_COMPLETE = true;
  (window as any).__PERSISTENCE_TESTS_RESULTS = results;
}

// Export nothing - this file is for its side effects only
export {};
