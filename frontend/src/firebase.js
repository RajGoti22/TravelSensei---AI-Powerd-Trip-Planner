// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import diagnostics utility
import { runFirebaseDiagnostics } from './utils/firebaseDiagnostics';
import { testFirebaseAPIKey, testFirebaseServices } from './utils/testFirebaseConnection';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration (from env)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services for authentication
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn('Analytics initialization failed:', analyticsError);
      // Analytics is optional, so we continue without it
    }
  }
  
  console.log('✅ Firebase initialized successfully');
  console.log('📋 Project ID:', firebaseConfig.projectId);
  console.log('🔐 Auth Domain:', firebaseConfig.authDomain);

  // Basic validation for required keys
  const missing = Object.entries(firebaseConfig)
    .filter(([k, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.warn('⚠️ Missing Firebase env vars:', missing.join(', '));
    console.warn('   Ensure VITE_FIREBASE_* variables are set in .env.local');
  }
  
  // Check if auth is properly configured
  if (auth) {
    console.log('✅ Firebase Auth is ready');
  }
  
  // Make diagnostics available globally in development (only expose, don't run)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.runFirebaseDiagnostics = runFirebaseDiagnostics;
    window.testFirebaseAPIKey = testFirebaseAPIKey;
    window.testFirebaseServices = testFirebaseServices;
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('💡 Please check:');
  console.error('   1. Firebase project exists and env vars are set');
  console.error('   2. API key is correct and not overly restricted');
  console.error('   3. Email/Password auth is enabled in Firebase Console');
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { auth, db, storage, analytics };
export default app;
