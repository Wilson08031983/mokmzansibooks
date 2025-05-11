import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Fallback configuration for development if env vars are missing
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyBF-Vbm--Z8yxfmQBIppEW9rAx_jYw0QfI",
  authDomain: "mokapp-dev.firebaseapp.com",
  projectId: "mokapp-dev",
  storageBucket: "mokapp-dev.appspot.com",
  messagingSenderId: "821529231198",
  appId: "1:821529231198:web:3a5b81c082c5a1d69bba8f"
};

// Get configuration from environment variables with fallbacks
const getFirebaseConfig = () => {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  // Verify required fields are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !envConfig[field]);
  
  if (missingFields.length > 0) {
    console.warn(`Missing Firebase configuration: ${missingFields.join(', ')}. Using fallback configuration for development.`);
    return FALLBACK_CONFIG;
  }
  
  return envConfig;
};

// Initialize Firebase with error handling
let app;
let auth;
let isUsingMockAuth = false;

try {
  // Get configuration with fallbacks
  const firebaseConfig = getFirebaseConfig();
  
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Use auth emulator in development if configured
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Using Firebase Auth Emulator');
  }
  
  console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  
  // Create a mock Firebase app and auth for development
  // This allows the app to still function without Firebase
  isUsingMockAuth = true;
  
  // Mock app
  app = {
    name: 'mock-firebase-app',
    options: FALLBACK_CONFIG,
    automaticDataCollectionEnabled: false
  };
  
  // Mock auth with basic functionality
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      // Return an unsubscribe function
      return () => {};
    },
    signInWithEmailAndPassword: async (email, password) => {
      console.warn('Using mock Firebase auth - signInWithEmailAndPassword');
      return {
        user: {
          uid: 'mock-user-id',
          email,
          emailVerified: true,
          displayName: 'Mock User',
          metadata: { creationTime: new Date().toISOString() }
        }
      };
    },
    createUserWithEmailAndPassword: async (email, password) => {
      console.warn('Using mock Firebase auth - createUserWithEmailAndPassword');
      return {
        user: {
          uid: 'mock-user-id',
          email,
          emailVerified: false,
          displayName: null,
          metadata: { creationTime: new Date().toISOString() }
        }
      };
    },
    signOut: async () => {
      console.warn('Using mock Firebase auth - signOut');
      return Promise.resolve();
    }
  };
  
  console.warn('Using mock Firebase implementation due to initialization error');
}

// Helper function to check if we're using mock auth
export const isMockFirebaseAuth = () => isUsingMockAuth;

// Export the Firebase instances
export { app, auth };
