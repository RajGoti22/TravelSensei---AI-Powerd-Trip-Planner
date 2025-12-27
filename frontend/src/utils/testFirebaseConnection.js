/**
 * Test Firebase API Key and Connection
 * This will help diagnose if the API key is working correctly
 */

export const testFirebaseAPIKey = async () => {
  const apiKey = "AIzaSyDwuMnfpnvH6zb5q9m9ZpW0wSNU8FiZDno";
  const projectId = "travelsensei-6ef12";
  
  console.log('🧪 Testing Firebase API Key...');
  console.log('API Key:', apiKey);
  console.log('Project ID:', projectId);
  console.log('⚠️  NOTE: CORS errors are expected here - Firebase APIs block direct fetch() calls.');
  console.log('⚠️  The Firebase SDK handles CORS automatically. This test is for diagnostics only.\n');
  
  try {
    // Test 1: Check if Identity Toolkit API is accessible
    const testUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:signUp?key=${apiKey}`;
    
    console.log('📡 Testing Identity Toolkit API connection...');
    console.log('URL:', testUrl.replace(apiKey, 'API_KEY_HIDDEN'));
    console.log('⚠️  If you see CORS error, this is NORMAL - check API key HTTP referrer restrictions instead.\n');
    
    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        returnSecureToken: true
      })
    });
    
    const testData = await testResponse.json();
    
    console.log('Response Status:', testResponse.status);
    console.log('Response Data:', testData);
    
    if (testResponse.status === 400) {
      if (testData.error) {
        console.error('❌ Error:', testData.error.message);
        console.error('Error Code:', testData.error.code);
        
        if (testData.error.message.includes('API key not valid') || testData.error.message.includes('API_KEY_INVALID')) {
          console.error('🔴 ISSUE: API key is invalid or restricted');
          console.error('💡 Solution: Check API key restrictions in Google Cloud Console');
        } else if (testData.error.message.includes('PROJECT_NOT_FOUND')) {
          console.error('🔴 ISSUE: Project not found');
          console.error('💡 Solution: Verify project ID is correct');
        } else if (testData.error.message.includes('API not enabled')) {
          console.error('🔴 ISSUE: Identity Toolkit API not enabled');
          console.error('💡 Solution: Enable Identity Toolkit API in Google Cloud Console');
        }
      }
    } else if (testResponse.status === 403) {
      console.error('❌ 403 Forbidden - API key restrictions are blocking the request');
      console.error('💡 Solution: Remove API key restrictions or add Identity Toolkit API to allowed APIs');
    } else if (testResponse.status === 200) {
      console.log('✅ API key is working! The issue might be elsewhere.');
    }
    
    return {
      status: testResponse.status,
      data: testData,
      apiKeyValid: testResponse.status !== 400 || !testData.error?.message?.includes('API key')
    };
    
  } catch (error) {
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      console.error('\n⚠️  CORS Error Detected (This is EXPECTED for direct fetch() calls)');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('💡 IMPORTANT: The CORS error is NORMAL - Firebase APIs block direct fetch() calls.');
      console.error('💡 The Firebase SDK handles CORS automatically using different methods.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.error('🔧 To fix auth/admin-restricted-operation error, check these:\n');
      console.error('1️⃣  API Key HTTP Referrer Restrictions (MOST IMPORTANT):');
      console.error('   → Go to: https://console.cloud.google.com/apis/credentials?project=travelsensei-6ef12');
      console.error('   → Find API key: AIzaSyDwuMnfpnvH6zb5q9m9ZpW0wSNU8FiZDno');
      console.error('   → Under "Application restrictions": Select "None"');
      console.error('   → Under "API restrictions": Select "Don\'t restrict key"');
      console.error('   → Click Save and wait 5-10 minutes\n');
      console.error('2️⃣  Authorized Domains:');
      console.error('   → Go to: https://console.firebase.google.com/project/travelsensei-6ef12/authentication/settings');
      console.error('   → Ensure "localhost" is in authorized domains\n');
      console.error('3️⃣  Test Using Actual Form:');
      console.error('   → Use the registration form at http://localhost:3000/register');
      console.error('   → Don\'t rely on this test function (it will always show CORS errors)\n');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Test failed:', error);
    }
    
    return {
      error: error.message,
      apiKeyValid: false,
      corsError: error.message.includes('CORS') || error.message.includes('Failed to fetch')
    };
  }
};

// Test if the API key can access Firebase services
export const testFirebaseServices = async () => {
  const apiKey = "AIzaSyDwuMnfpnvH6zb5q9m9ZpW0wSNU8FiZDno";
  
  console.log('\n🔍 Testing Firebase Services Access...');
  
  const services = [
    {
      name: 'Identity Toolkit API',
      url: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`
    },
    {
      name: 'Firebase Installations API',
      url: `https://firebaseinstallations.googleapis.com/v1/projects/travelsensei-6ef12/installations?key=${apiKey}`
    }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      console.log(`${service.name}: ${response.status} ${response.statusText}`);
      
      if (response.status === 403) {
        console.error(`   ❌ Access denied - API key restrictions or API not enabled`);
      } else if (response.status === 400) {
        console.log(`   ⚠️  API accessible but request invalid (this is expected for empty body)`);
      }
    } catch (error) {
      console.error(`${service.name}: Error - ${error.message}`);
    }
  }
};

// Make functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.testFirebaseAPIKey = testFirebaseAPIKey;
  window.testFirebaseServices = testFirebaseServices;
}

