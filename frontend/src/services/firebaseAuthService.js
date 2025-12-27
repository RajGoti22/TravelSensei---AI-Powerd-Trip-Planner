// Firebase Authentication Service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { auth } from '../firebase';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Set up auth state listener
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of auth state change
  notifyListeners(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Register new user - Try Firebase Auth first, fallback to backend if restricted
  async register(name, email, password) {
    try {
      // Log registration attempt for debugging
      console.log('🔐 Attempting to register user:', { email, name });
      console.log('🔑 Firebase Auth instance:', auth);
      console.log('🌐 Current origin:', window.location.origin);
      
      try {
        // Try Firebase Auth first (preferred method)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, {
          displayName: name
        });

        // Get ID token for backend communication
        const idToken = await user.getIdToken();

        // Skip immediate backend /auth/me call on registration to avoid 401 spam
        // Backend sync will happen via authenticated actions later

        // Fallback: return basic user data
        return {
          success: true,
          user: {
            id: user.uid,
            name: name,
            email: user.email,
            phone: '',
            location: '',
            bio: '',
            preferences: {}
          },
          token: idToken
        };
      } catch (firebaseError) {
        // If Firebase Auth is restricted, try backend registration
        if (firebaseError.code === 'auth/admin-restricted-operation' || 
            firebaseError.code === 'auth/operation-not-allowed') {
          console.warn('⚠️ Firebase Auth restricted, trying backend registration...');
          return await this.registerViaBackend(name, email, password);
        }
        throw firebaseError;
      }
    } catch (error) {
      console.error('❌ Registration error details:');
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Full error object:', error);
      
      // Additional debugging for admin-restricted-operation
      if (error.code === 'auth/admin-restricted-operation') {
        console.error('🔍 Troubleshooting auth/admin-restricted-operation:');
        console.error('   1. Check API key restrictions in Google Cloud Console');
        console.error('   2. Ensure Identity Toolkit API is enabled');
        console.error('   3. Verify localhost is in authorized domains');
        console.error('   4. Check if API key includes Identity Toolkit API in restrictions');
        console.error('   5. Trying backend registration as fallback...');
      }
      
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Register via backend (fallback method when Firebase Auth is restricted)
  async registerViaBackend(name, email, password) {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log('🔄 Attempting backend registration...');
      
      // Call backend registration endpoint
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      if (data.success && data.customToken) {
        // Sign in with custom token
        const { signInWithCustomToken } = await import('firebase/auth');
        const userCredential = await signInWithCustomToken(auth, data.customToken);
        const user = userCredential.user;
        
        // Get ID token
        const idToken = await user.getIdToken();
        
        return {
          success: true,
          user: {
            id: user.uid,
            name: data.user.name,
            email: user.email
          },
          token: idToken
        };
      }
      
      throw new Error('Backend registration failed');
    } catch (error) {
      console.error('Backend registration error:', error);
      throw error;
    }
  }

  // Login user - Try Firebase Auth first, fallback to backend if restricted
  async login(email, password) {
    try {
      // Log login attempt for debugging
      console.log('🔐 Attempting to login user:', { email });
      console.log('🔑 Firebase Auth instance:', auth);
      
      try {
        // Try Firebase Auth first (preferred method)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get ID token for backend communication
        const idToken = await user.getIdToken();

        // Skip immediate backend /auth/me call on login to avoid 401 spam
        // Backend sync will happen via authenticated actions later

        // Fallback: return basic user data from Firebase Auth
        return {
          success: true,
          user: {
            id: user.uid,
            name: user.displayName || '',
            email: user.email,
            phone: '',
            location: '',
            bio: '',
            preferences: {}
          },
          token: idToken
        };
      } catch (firebaseError) {
        // If Firebase Auth is restricted, try backend login
        if (firebaseError.code === 'auth/admin-restricted-operation' || 
            firebaseError.code === 'auth/operation-not-allowed') {
          console.warn('⚠️ Firebase Auth restricted, trying backend login...');
          return await this.loginViaBackend(email, password);
        }
        throw firebaseError;
      }
    } catch (error) {
      console.error('❌ Login error details:');
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Full error object:', error);
      
      // Additional debugging for admin-restricted-operation
      if (error.code === 'auth/admin-restricted-operation') {
        console.error('🔍 Troubleshooting auth/admin-restricted-operation:');
        console.error('   1. Check API key restrictions in Google Cloud Console');
        console.error('   2. Ensure Identity Toolkit API is enabled');
        console.error('   3. Verify localhost is in authorized domains');
        console.error('   4. Trying backend login as fallback...');
      }
      
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Login via backend (fallback method when Firebase Auth is restricted)
  async loginViaBackend(email, password) {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log('🔄 Attempting backend login...');
      
      // Call backend login endpoint
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      if (data.success && data.customToken) {
        // Sign in with custom token
        const { signInWithCustomToken } = await import('firebase/auth');
        const userCredential = await signInWithCustomToken(auth, data.customToken);
        const user = userCredential.user;
        
        // Get ID token
        const idToken = await user.getIdToken();
        
        return {
          success: true,
          user: {
            id: user.uid,
            name: data.user.name,
            email: user.email
          },
          token: idToken
        };
      }
      
      throw new Error('Backend login failed');
    } catch (error) {
      console.error('Backend login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Get user ID token
  async getIdToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Get user data from MongoDB via backend
  async getUserData() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      // Update Firebase Auth profile if name is provided
      if (updates.name) {
        await updateProfile(user, {
          displayName: updates.name
        });
      }

      // Update MongoDB via backend API
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Delete user account
  async deleteAccount() {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      // Delete user via backend API (which handles MongoDB and Firebase Auth)
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Sign out locally
      await signOut(auth);

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      throw new Error('Failed to delete account');
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Helper function to get user-friendly error messages
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email already in use. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      case 'auth/admin-restricted-operation':
        return 'Authentication is restricted. Please enable Email/Password authentication in Firebase Console, or check API key restrictions.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-disabled':
        return 'User account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Invalid email or password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Only one popup request is allowed at a time.';
      default:
        // Log the full error for debugging
        console.error('Firebase Auth Error:', error.code, error.message);
        return error.message || 'An authentication error occurred. Please try again.';
    }
  }
}

// Export singleton instance
export default new FirebaseAuthService();
