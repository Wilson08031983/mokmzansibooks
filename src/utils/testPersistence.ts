
/**
 * Utility to test persistence mechanisms in the application
 */

/**
 * Basic test of localStorage persistence
 * @returns Boolean indicating if the test passed
 */
export const testLocalStoragePersistence = (): boolean => {
  try {
    const testValue = `test-${Date.now()}`;
    localStorage.setItem('persistence-test', testValue);
    const retrieved = localStorage.getItem('persistence-test');
    localStorage.removeItem('persistence-test');
    
    return testValue === retrieved;
  } catch (error) {
    console.error('LocalStorage persistence test failed:', error);
    return false;
  }
};

/**
 * Basic test of sessionStorage persistence
 * @returns Boolean indicating if the test passed
 */
export const testSessionStoragePersistence = (): boolean => {
  try {
    const testValue = `test-${Date.now()}`;
    sessionStorage.setItem('persistence-test', testValue);
    const retrieved = sessionStorage.getItem('persistence-test');
    sessionStorage.removeItem('persistence-test');
    
    return testValue === retrieved;
  } catch (error) {
    console.error('SessionStorage persistence test failed:', error);
    return false;
  }
};

/**
 * Test persistence mechanisms
 * @returns Object indicating which persistence mechanisms passed their tests
 */
export const testPersistence = () => {
  const results = {
    localStorage: testLocalStoragePersistence(),
    sessionStorage: testSessionStoragePersistence(),
  };
  
  console.log('Persistence test results:', results);
  return results;
};

export default {
  testLocalStoragePersistence,
  testSessionStoragePersistence,
  testPersistence
};
