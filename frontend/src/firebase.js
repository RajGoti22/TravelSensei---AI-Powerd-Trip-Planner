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

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwuMnfpnvH6zb5q9m9ZpW0wSNU8FiZDno",
  authDomain: "travelsensei-6ef12.firebaseapp.com",
  projectId: "travelsensei-6ef12",
  storageBucket: "travelsensei-6ef12.firebasestorage.app",
  messagingSenderId: "302258386914",
  appId: "1:302258386914:web:f96c450a5f227ac1a9ebbb",
  measurementId: "G-EF3VZKESSS"
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
  console.error('   1. Firebase project exists: travelsensei-6ef12');
  console.error('   2. API key is correct and not restricted');
  console.error('   3. Email/Password auth is enabled in Firebase Console');
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { auth, db, storage, analytics };
export default app;
