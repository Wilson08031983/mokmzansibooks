/**
 * MokMzansi Books Data Persistence Test Script
 * This script tests whether data is properly saved and can be retrieved across browser sessions
 */

// Test data
const TEST_COMPANY = {
  name: "Test Company Name " + new Date().toISOString(),
  contactEmail: "test@example.com",
  contactPhone: "123-456-7890",
  address: "123 Test Street",
  city: "Test City",
  province: "Test Province",
  postalCode: "12345"
};

const TEST_CLIENT = {
  id: "test-client-" + Date.now(),
  name: "Test Client " + new Date().toISOString(),
  email: "client@example.com",
  phone: "987-654-3210",
  address: "456 Client Avenue",
  type: "company"
};

// Storage keys
const STORAGE_KEYS = {
  COMPANY: ['companyDetails', 'companyDetails_backup', 'COMPANY_DATA', 'MOK_COMPANY_INFO', 'COMPANY_BACKUP'],
  CLIENTS: ['clients', 'CLIENTS', 'PERSISTENT_CLIENTS', 'ALTERNATE_1', 'ALTERNATE_2', 'MOK_CLIENTS_BACKUP']
};

// Test results container
const testResults = {
  companyData: { saved: false, retrieved: false, verified: false },
  clientData: { saved: false, retrieved: false, verified: false },
  indexedDB: { supported: false, opened: false, stored: false, retrieved: false }
};

// Helper functions
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Error saving to ${key}:`, e);
    return false;
  }
}

function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error retrieving from ${key}:`, e);
    return null;
  }
}

// Test 1: Save and retrieve company data
function testCompanyPersistence() {
  console.log("🏢 Testing company data persistence...");
  
  // Save to all company storage keys
  let saveSuccess = false;
  for (const key of STORAGE_KEYS.COMPANY) {
    if (saveToLocalStorage(key, TEST_COMPANY)) {
      saveSuccess = true;
    }
  }
  testResults.companyData.saved = saveSuccess;
  
  // Try to retrieve from any company storage key
  let retrieveSuccess = false;
  let retrievedData = null;
  
  for (const key of STORAGE_KEYS.COMPANY) {
    const data = getFromLocalStorage(key);
    if (data && data.name) {
      retrieveSuccess = true;
      retrievedData = data;
      break;
    }
  }
  testResults.companyData.retrieved = retrieveSuccess;
  
  // Verify data matches
  if (retrievedData) {
    testResults.companyData.verified = retrievedData.name === TEST_COMPANY.name;
  }
  
  console.log("✅ Company data test results:", testResults.companyData);
}

// Test 2: Save and retrieve client data
function testClientPersistence() {
  console.log("👥 Testing client data persistence...");
  
  // First get any existing clients
  let existingClients = [];
  for (const key of STORAGE_KEYS.CLIENTS) {
    const data = getFromLocalStorage(key);
    if (data && Array.isArray(data) && data.length > 0) {
      existingClients = data;
      break;
    }
  }
  
  // Add our test client
  existingClients.push(TEST_CLIENT);
  
  // Save to all client storage keys
  let saveSuccess = false;
  for (const key of STORAGE_KEYS.CLIENTS) {
    if (saveToLocalStorage(key, existingClients)) {
      saveSuccess = true;
    }
  }
  testResults.clientData.saved = saveSuccess;
  
  // Try to retrieve from any client storage key
  let retrieveSuccess = false;
  let retrievedData = null;
  
  for (const key of STORAGE_KEYS.CLIENTS) {
    const data = getFromLocalStorage(key);
    if (data && Array.isArray(data) && data.length > 0) {
      retrieveSuccess = true;
      retrievedData = data;
      break;
    }
  }
  testResults.clientData.retrieved = retrieveSuccess;
  
  // Verify our test client is in the retrieved data
  if (retrievedData) {
    testResults.clientData.verified = retrievedData.some(client => client.id === TEST_CLIENT.id);
  }
  
  console.log("✅ Client data test results:", testResults.clientData);
}

// Test 3: Test IndexedDB
function testIndexedDB() {
  console.log("💾 Testing IndexedDB persistence...");
  
  // Check if IndexedDB is supported
  testResults.indexedDB.supported = !!window.indexedDB;
  
  if (!testResults.indexedDB.supported) {
    console.warn("⚠️ IndexedDB is not supported in this browser");
    return;
  }
  
  // Try to open a test database
  const dbName = "MokMzansiTestDB";
  const request = indexedDB.open(dbName, 1);
  
  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("testStore")) {
      db.createObjectStore("testStore", { keyPath: "id" });
    }
  };
  
  request.onsuccess = function(event) {
    testResults.indexedDB.opened = true;
    const db = event.target.result;
    
    // Try to store data
    const transaction = db.transaction(["testStore"], "readwrite");
    const store = transaction.objectStore("testStore");
    
    const testData = { id: "test-" + Date.now(), value: "Test value " + new Date().toISOString() };
    const storeRequest = store.add(testData);
    
    storeRequest.onsuccess = function() {
      testResults.indexedDB.stored = true;
      console.log("✅ Successfully stored data in IndexedDB");
      
      // Try to retrieve data
      const getRequest = store.get(testData.id);
      
      getRequest.onsuccess = function() {
        if (getRequest.result && getRequest.result.id === testData.id) {
          testResults.indexedDB.retrieved = true;
          console.log("✅ Successfully retrieved data from IndexedDB");
        } else {
          console.warn("⚠️ Failed to retrieve expected data from IndexedDB");
        }
        
        // Close the database
        db.close();
        
        // Print final results
        logFinalResults();
      };
      
      getRequest.onerror = function() {
        console.error("❌ Error retrieving data from IndexedDB:", getRequest.error);
        db.close();
        logFinalResults();
      };
    };
    
    storeRequest.onerror = function() {
      console.error("❌ Error storing data in IndexedDB:", storeRequest.error);
      db.close();
      logFinalResults();
    };
  };
  
  request.onerror = function() {
    console.error("❌ Error opening IndexedDB:", request.error);
    testResults.indexedDB.opened = false;
    logFinalResults();
  };
}

// Log the final test results
function logFinalResults() {
  console.log("\n📋 DATA PERSISTENCE TEST RESULTS");
  console.log("==============================");
  
  console.log("\n🏢 Company Data:");
  console.log(`  Saved: ${testResults.companyData.saved ? '✅' : '❌'}`);
  console.log(`  Retrieved: ${testResults.companyData.retrieved ? '✅' : '❌'}`);
  console.log(`  Verified: ${testResults.companyData.verified ? '✅' : '❌'}`);
  
  console.log("\n👥 Client Data:");
  console.log(`  Saved: ${testResults.clientData.saved ? '✅' : '❌'}`);
  console.log(`  Retrieved: ${testResults.clientData.retrieved ? '✅' : '❌'}`);
  console.log(`  Verified: ${testResults.clientData.verified ? '✅' : '❌'}`);
  
  console.log("\n💾 IndexedDB:");
  console.log(`  Supported: ${testResults.indexedDB.supported ? '✅' : '❌'}`);
  console.log(`  Database Opened: ${testResults.indexedDB.opened ? '✅' : '❌'}`);
  console.log(`  Data Stored: ${testResults.indexedDB.stored ? '✅' : '❌'}`);
  console.log(`  Data Retrieved: ${testResults.indexedDB.retrieved ? '✅' : '❌'}`);
  
  // Overall assessment
  const allTests = [
    testResults.companyData.saved,
    testResults.companyData.retrieved,
    testResults.companyData.verified,
    testResults.clientData.saved,
    testResults.clientData.retrieved,
    testResults.clientData.verified,
    testResults.indexedDB.supported,
    testResults.indexedDB.opened,
    testResults.indexedDB.stored,
    testResults.indexedDB.retrieved
  ];
  
  const passedTests = allTests.filter(result => result).length;
  const totalTests = allTests.length;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  console.log("\n📊 OVERALL RESULT:");
  console.log(`  Tests Passed: ${passedTests}/${totalTests} (${passRate}%)`);
  
  if (passRate >= 90) {
    console.log("🎉 EXCELLENT: Data persistence is working very well!");
  } else if (passRate >= 70) {
    console.log("✅ GOOD: Data persistence is mostly working, with some issues.");
  } else if (passRate >= 50) {
    console.log("⚠️ FAIR: Data persistence is partially working, but needs improvement.");
  } else {
    console.log("❌ POOR: Data persistence is not working reliably.");
  }
  
  // Provide detailed assessment for any failing tests
  const failingTests = [];
  
  if (!testResults.companyData.saved) failingTests.push("Saving company data");
  if (!testResults.companyData.retrieved) failingTests.push("Retrieving company data");
  if (!testResults.companyData.verified) failingTests.push("Verifying company data integrity");
  if (!testResults.clientData.saved) failingTests.push("Saving client data");
  if (!testResults.clientData.retrieved) failingTests.push("Retrieving client data");
  if (!testResults.clientData.verified) failingTests.push("Verifying client data integrity");
  if (!testResults.indexedDB.supported) failingTests.push("IndexedDB support");
  if (!testResults.indexedDB.opened) failingTests.push("Opening IndexedDB database");
  if (!testResults.indexedDB.stored) failingTests.push("Storing data in IndexedDB");
  if (!testResults.indexedDB.retrieved) failingTests.push("Retrieving data from IndexedDB");
  
  if (failingTests.length > 0) {
    console.log("\n⚠️ AREAS NEEDING ATTENTION:");
    failingTests.forEach(test => console.log(`  - ${test}`));
  }
  
  console.log("\nTest completed at:", new Date().toLocaleString());
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting MokMzansi Books data persistence tests...");
  
  // Run tests sequentially
  testCompanyPersistence();
  testClientPersistence();
  testIndexedDB();
  
  // Log final results (this will be called after IndexedDB test completes)
  // If IndexedDB test doesn't run, log results after a timeout
  setTimeout(() => {
    if (!testResults.indexedDB.supported) {
      logFinalResults();
    }
  }, 1000);
}

// Run tests when the page loads
window.addEventListener('DOMContentLoaded', runAllTests);

// Make the test function available globally
window.runDataPersistenceTests = runAllTests;
