import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email, password) {
    // Use mock login for demo purposes
    return this.mockLogin(email, password);
  },

  async register(userData) {
    // Use mock register for demo purposes
    return this.mockRegister(userData);
  },

  async verifyToken(token) {
    try {
      // In a real app, this would verify the token with the backend
      if (token.startsWith('mock-jwt-token-')) {
        const mockUser = {
          id: '1',
          email: 'demo@travelsensei.com',
          name: 'Demo User',
          avatar: 'https://i.pravatar.cc/150?img=1',
          preferences: {
            destinations: ['Japan', 'Italy', 'Thailand'],
            travelStyle: 'mid-range',
            activityTypes: ['culture', 'food', 'nature'],
            accommodationPreference: 'hotel',
            dietaryRestrictions: [],
            travelDuration: 'medium',
            groupSize: 'couple',
          },
          createdAt: new Date(),
        };
        return mockUser;
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      throw new Error('Token verification failed');
    }
  },

  async updateProfile(userData) {
    try {
      // Mock update - in real app this would call the API
      const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },

  async socialLogin(provider) {
    // Mock social login
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: `user@${provider}.com`,
          name: `${provider} User`,
          avatar: `https://i.pravatar.cc/150?img=${provider === 'google' ? '4' : '5'}`,
          preferences: {
            destinations: [],
            travelStyle: 'mid-range',
            activityTypes: [],
            accommodationPreference: 'hotel',
            dietaryRestrictions: [],
            travelDuration: 'medium',
            groupSize: 'solo',
          },
          createdAt: new Date(),
        };
        resolve({
          user: mockUser,
          token: 'mock-jwt-token-' + Date.now(),
        });
      }, 1500);
    });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('mockUser');
  },

  // Mock data for development
  async mockLogin(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@travelsensei.com' && password === 'demo123') {
          const mockUser = {
            id: '1',
            email: 'demo@travelsensei.com',
            name: 'Demo User',
            avatar: 'https://i.pravatar.cc/150?img=1',
            preferences: {
              destinations: ['Japan', 'Italy', 'Thailand'],
              travelStyle: 'mid-range',
              activityTypes: ['culture', 'food', 'nature'],
              accommodationPreference: 'hotel',
              dietaryRestrictions: [],
              travelDuration: 'medium',
              groupSize: 'couple',
            },
            createdAt: new Date(),
          };
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          resolve({
            user: mockUser,
            token: 'mock-jwt-token-' + Date.now(),
          });
        } else {
          reject(new Error('Invalid credentials. Try demo@travelsensei.com / demo123'));
        }
      }, 1000);
    });
  },

  async mockRegister(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email,
          name: userData.name,
          preferences: {
            destinations: [],
            travelStyle: 'mid-range',
            activityTypes: [],
            accommodationPreference: 'hotel',
            dietaryRestrictions: [],
            travelDuration: 'medium',
            groupSize: 'solo',
          },
          createdAt: new Date(),
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        resolve({
          user: mockUser,
          token: 'mock-jwt-token-' + Date.now(),
        });
      }, 1000);
    });
  },
};