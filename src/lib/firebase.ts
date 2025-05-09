
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Replace these with your actual Firebase config or move to environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBJvRb-OLcwRKuDnDwjW3jSrVbDYLUfuBA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mokapp-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mokapp-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mokapp-dev.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "821529231198",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:821529231198:web:3a5b81c082c5a1d69bba8f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
