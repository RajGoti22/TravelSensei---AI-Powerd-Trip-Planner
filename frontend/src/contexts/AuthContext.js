import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';
import firebaseAuthService from '../services/firebaseAuthService';
import { auth } from '../firebase';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER: 'LOAD_USER',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
    case AuthActionTypes.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload.error,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AuthActionTypes.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        loading: false,
        error: null,
      };

    case AuthActionTypes.UPDATE_USER:
      // Create a new user object to ensure React detects the change
      const updatedUser = action.payload.user 
        ? { ...state.user, ...action.payload.user }
        : state.user;
      return {
        ...state,
        user: updatedUser,
        loading: false,
        error: null,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start (fetch from backend)
  useEffect(() => {
    const loadUser = async () => {
      // Try to get fresh token from Firebase Auth first
      let token = null;
      let user = null;
      
      try {
        // Wait for Firebase Auth to be ready before checking currentUser
        await auth.authStateReady();
        
        if (auth.currentUser) {
          // Get fresh token from Firebase
          token = await auth.currentUser.getIdToken(true);
          localStorage.setItem('authToken', token);
          
          // Get user from localStorage - don't call backend API on startup
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              user = JSON.parse(storedUser);
            } catch (e) {
              user = null;
            }
          }
        } else {
            // No Firebase user detected; drop any stale local session to avoid flashing logged-in UI
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            user = null;
            token = null;
        }
      } catch (e) {
        console.error('Error loading user:', e);
          // On error, clear everything to avoid invalid states
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          token = null;
          user = null;
      }
      
      dispatch({
        type: AuthActionTypes.LOAD_USER,
        payload: { user, token },
      });
    };
    loadUser();
  }, []);


  // Login function (Firebase only)
  const login = async (email, password) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const result = await firebaseAuthService.login(email, password);
      if (result.success) {
        // Store token first
        localStorage.setItem('authToken', result.token);

        // Merge backend profile data (avatar, preferences, etc.) after login
        let userData = result.user;
        try {
          const profileRes = await apiService.getProfile();
          if (profileRes && profileRes.user) {
            userData = { ...userData, ...profileRes.user };
          }
        } catch (e) {
          console.log('Backend profile fetch on login:', e.message);
        }

        // Store merged user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: userData, token: result.token },
        });
        return { success: true, data: { user: userData, token: result.token } };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Register function (Firebase only)
  const register = async (name, email, password) => {
    dispatch({ type: AuthActionTypes.REGISTER_START });
    try {
      const result = await firebaseAuthService.register(name, email, password);
      if (result.success) {
        // Store token first
        localStorage.setItem('authToken', result.token);
        
        // Try to sync with backend to create user in MongoDB
        let userData = result.user;
        try {
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for clock sync
          const res = await apiService.getProfile();
          if (res && res.user) {
            // Merge backend data with registration data
            userData = { ...userData, ...res.user };
          }
        } catch (e) {
          // If backend fails, use Firebase data only
          console.log('Backend sync after registration:', e.message);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        dispatch({
          type: AuthActionTypes.REGISTER_SUCCESS,
          payload: { user: userData, token: result.token },
        });
        return { success: true, data: { user: userData, token: result.token } };
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Register with Google
  const registerWithGoogle = async (user, idToken) => {
    dispatch({ type: AuthActionTypes.REGISTER_START });
    try {
      // Store token first
      localStorage.setItem('authToken', idToken);
      
      // Try to fetch user profile from backend to get stored data
      let userData = {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        avatar: user.photoURL || ''
      };
      
      // Attempt to get user data from backend (with retry for clock skew)
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for clock sync
        const res = await apiService.getProfile();
        if (res && res.user) {
          // Merge backend data with Firebase data
          userData = { ...userData, ...res.user };
        }
      } catch (e) {
        // If backend fails, use Firebase data only
        console.log('Using Firebase data only:', e.message);
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: AuthActionTypes.REGISTER_SUCCESS,
        payload: { user: userData, token: idToken },
      });
      
      return { success: true, data: { user: userData, token: idToken } };
    } catch (error) {
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Login with Google
  const loginWithGoogle = async (user, idToken) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      // Store token first
      localStorage.setItem('authToken', idToken);
      
      // Try to fetch user profile from backend to get stored data
      let userData = {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        avatar: user.photoURL || ''
      };
      
      // Attempt to get user data from backend (with retry for clock skew)
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for clock sync
        const res = await apiService.getProfile();
        if (res && res.user) {
          // Merge backend data with Firebase data
          userData = { ...userData, ...res.user };
        }
      } catch (e) {
        // If backend fails, use Firebase data only
        console.log('Using Firebase data only:', e.message);
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user: userData, token: idToken },
      });
      
      return { success: true, data: { user: userData, token: idToken } };
    } catch (error) {
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Offline / demo login fallback
  const demoLogin = async () => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const user = {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@travelsensei.local'
      };
      const token = 'demo-token';
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, token }
      });
      return { success: true, data: { user, token, demo: true } };
    } catch (e) {
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: 'Demo login failed' }
      });
      return { success: false, error: 'Demo login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    await apiService.logout();
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    try {
      // Ensure user is authenticated and has a valid token
      if (!auth.currentUser) {
        throw new Error('User is not authenticated. Please log in again.');
      }
      
      // Get a fresh token before making the request
      const freshToken = await auth.currentUser.getIdToken(true);
      localStorage.setItem('authToken', freshToken);
      console.log('[AuthContext] Fresh token obtained for profile update, user:', auth.currentUser.uid);
      
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        // Use the updated user data returned from the backend, or fetch it if not provided
        let updatedUser;
        if (response.user) {
          // Backend returned updated user data
          updatedUser = response.user;
        } else {
          // Fallback: fetch latest profile from backend
          const profileRes = await apiService.getProfile();
          updatedUser = profileRes && profileRes.success && profileRes.user 
            ? profileRes.user 
            : { ...state.user, ...profileData };
        }
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update context state
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { user: updatedUser },
        });
        
        return { success: true, data: response, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_LOADING,
        payload: false,
      });
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Check authentication status
  const checkAuth = () => {
    return apiService.isAuthenticated();
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    updateProfile,
    clearError,
    checkAuth,
    demoLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protected components
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>; // Replace with your loading component
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>; // Replace with redirect to login
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;