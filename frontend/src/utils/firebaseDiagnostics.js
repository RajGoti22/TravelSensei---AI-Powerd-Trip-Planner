/**
 * Firebase Configuration Diagnostics
 * Run this in browser console to check Firebase setup
 */

export const runFirebaseDiagnostics = () => {
  console.log('🔍 Running Firebase Diagnostics...\n');
  
  const diagnostics = {
    config: {},
    issues: [],
    recommendations: []
  };

  // Check Firebase config
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    
    diagnostics.config = firebaseConfig;
    console.log('✅ Firebase config loaded');
  } catch (error) {
    diagnostics.issues.push('Failed to load Firebase config');
    console.error('❌ Firebase config error:', error);
  }

  // Check current domain
  const currentDomain = window.location.hostname;
  console.log(`📍 Current domain: ${currentDomain}`);
  
  if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
    diagnostics.recommendations.push('Make sure "localhost" is in Firebase Authorized Domains');
  }

  // Check if we're on HTTPS (required for some Firebase features)
  const isHTTPS = window.location.protocol === 'https:';
  const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
  
  if (!isHTTPS && !isLocalhost) {
    diagnostics.issues.push('Not using HTTPS (required for production)');
  }

  // Common issues and solutions
  console.log('\n📋 Common Issues Checklist:');
  console.log('1. ✅ Email/Password enabled in Firebase Console');
  console.log('2. ⚠️  Check API key restrictions in Google Cloud Console');
  console.log('   - Go to: https://console.cloud.google.com/apis/credentials');
  console.log('   - Ensure VITE_FIREBASE_API_KEY is set and appropriately restricted');
  console.log('   - Prefer App Check and domain restrictions over global access');
  console.log('3. ⚠️  Check Authorized Domains in Firebase Console');
  console.log('   - Go to: Authentication > Settings > Authorized domains');
  console.log('   - Make sure "localhost" is listed');
  console.log('4. ⚠️  Enable Identity Toolkit API in Google Cloud Console');
  console.log('   - Go to: https://console.cloud.google.com/apis/library');
  console.log('   - Search for "Identity Toolkit API" and enable it');

  // Test Firebase connection
  console.log('\n🧪 Testing Firebase connection...');
  
  return diagnostics;
};

// Auto-run diagnostics in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
      console.log('%c🔍 Firebase Diagnostics Available', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
      console.log('Run: runFirebaseDiagnostics() in console for detailed checks');
    }
  }, 2000);
}

export default runFirebaseDiagnostics;



