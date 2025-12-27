import { getAuth } from 'firebase/auth';
import { auth } from '../firebase';

// API Service for TravelSensei Frontend
// Default to port 5000 (Flask backend) unless overridden by env
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Helper method to get a fresh Firebase ID token
  async getFreshAuthHeaders() {
    try {
      // Use the exported auth instance from firebase.js
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('[API] Getting fresh token from Firebase Auth user:', currentUser.uid);
        const token = await currentUser.getIdToken(true); // force refresh
        console.log('[API] Token retrieved, length:', token.length);
        // Update localStorage with fresh token
        localStorage.setItem('authToken', token);
        return { 'Authorization': `Bearer ${token}` };
      } else {
        console.warn('[API] No current user in Firebase Auth');
      }
    } catch (e) {
      console.error('[API] Error getting fresh auth token:', e);
    }
    // Fallback to stored token if Firebase Auth fails
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      console.log('[API] Using stored token from localStorage, length:', storedToken.length);
      return { 'Authorization': `Bearer ${storedToken}` };
    }
    console.warn('[API] No token available');
    return {};
  }

  // Helper method for making requests with retry logic
  async makeRequest(url, options = {}, retryCount = 0) {
    const maxRetries = 3;
    // Don't set Content-Type if body is FormData - let browser set multipart/form-data
    const isFormData = options.body instanceof FormData;
    let headers = isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers };
    // Always try to get a fresh Firebase token if user is logged in
    const freshHeaders = await this.getFreshAuthHeaders();
    headers = { ...headers, ...freshHeaders };
    
    // Debug logging
    if (url.includes('/auth/')) {
      console.log('[API] Making request to:', url);
      console.log('[API] Has Authorization header:', !!headers['Authorization']);
      if (headers['Authorization']) {
        const token = headers['Authorization'].replace('Bearer ', '');
        console.log('[API] Token preview:', token.substring(0, 20) + '...');
      }
    }
    
    const config = { ...options, headers };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));

        // Helper to extract best error message from various backend shapes
        const pickMessage = () => {
          if (!errorData || typeof errorData !== 'object') return null;
          // Common keys the backend (or other services) might use
            return (
              // Explicit validation array (Node style)
              (Array.isArray(errorData.errors) && errorData.errors.map(e => e.msg || e.message || e.error).join(', ')) ||
              errorData.error ||
              errorData.message ||
              errorData.detail ||
              null
            );
        };

        // Validation errors (Flask may return {'error': '...'} not errors array)
        if (response.status === 400) {
          const msg = pickMessage() || `Bad Request (400)`;
          throw new Error(msg);
        }
        // Auth / unauthorized clarity
        if (response.status === 401) {
          throw new Error(pickMessage() || 'Invalid credentials');
        }
        if (response.status === 404) {
          throw new Error('Endpoint not found');
        }
        if (response.status === 429) {
          throw new Error(pickMessage() || 'Too many requests – please slow down');
        }
        throw new Error(pickMessage() || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Exponential backoff retry for transient failures
      if (retryCount < maxRetries && (error instanceof TypeError || error.message?.includes('fetch failed'))) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s
        console.log(`⏱️ Retrying request (${retryCount + 1}/${maxRetries}) after ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return this.makeRequest(url, options, retryCount + 1);
      }
      
      // One retry with 127.0.0.1 if localhost fails (dev env convenience)
      if (error instanceof TypeError && this.baseURL.includes('localhost') && retryCount === 0) {
        try {
          const fallback = this.baseURL.replace('localhost', '127.0.0.1');
          const response = await fetch(`${fallback}${url}`, config);
          if (!response.ok) {
            const errData = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(errData.message || `HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (e2) {
          console.error('API Retry Error:', e2);
          throw e2;
        }
      }
      if (error instanceof TypeError) {
        // Network/connection error
        throw new Error('Backend not reachable at ' + this.baseURL + '. Make sure the Flask server is running.');
      }
      throw error; // rethrow others
    }
  }

  // Authentication Methods

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  async getProfile() {
      // Don't make request if there's no auth user or token
      if (!auth.currentUser && !localStorage.getItem('authToken')) {
        throw new Error('Not authenticated');
      }
    return this.makeRequest('/auth/me');
  }

  async updateProfile(profileData) {
    return this.makeRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // AI Methods
  async generateItinerary(preferences) {
    return this.makeRequest('/ai/generate-itinerary', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async chatWithAI(message, conversationId = null) {
    return this.makeRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getRecommendations(preferences) {
    return this.makeRequest('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // Itinerary Methods
  async getItineraries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/itineraries?${queryString}` : '/itineraries';
    return this.makeRequest(url);
  }

  async getItinerary(id) {
    return this.makeRequest(`/itineraries/${id}`);
  }

  async createItinerary(itineraryData) {
    return this.makeRequest('/itineraries', {
      method: 'POST',
      body: JSON.stringify(itineraryData),
    });
  }

  async updateItinerary(id, itineraryData) {
    return this.makeRequest(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itineraryData),
    });
  }

  async deleteItinerary(id) {
    return this.makeRequest(`/itineraries/${id}`, {
      method: 'DELETE',
    });
  }

  async likeItinerary(id, liked) {
    return this.makeRequest(`/itineraries/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ liked }),
    });
  }

  async saveItinerary(id, saved) {
    return this.makeRequest(`/itineraries/${id}/save`, {
      method: 'POST',
      body: JSON.stringify({ saved }),
    });
  }

  async getMyItineraries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/itineraries/my/all?${queryString}` : '/itineraries/my/all';
    return this.makeRequest(url);
  }

  // Booking Methods
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/bookings?${queryString}` : '/bookings';
    return this.makeRequest(url);
  }

  async getBooking(id) {
    return this.makeRequest(`/bookings/${id}`);
  }

  async createBooking(bookingData) {
    return this.makeRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id, bookingData) {
    return this.makeRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(id, reason) {
    return this.makeRequest(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getBookingStats() {
    return this.makeRequest('/bookings/stats');
  }

  // Review Methods
  async getItineraryReviews(itineraryId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/reviews/itinerary/${itineraryId}?${queryString}` : `/reviews/itinerary/${itineraryId}`;
    return this.makeRequest(url);
  }

  async getReview(id) {
    return this.makeRequest(`/reviews/${id}`);
  }

  async createReview(reviewData) {
    return this.makeRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id, reviewData) {
    return this.makeRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id) {
    return this.makeRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  async markReviewHelpful(id, helpful) {
    return this.makeRequest(`/reviews/${id}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }

  async reportReview(id, reason, description) {
    return this.makeRequest(`/reviews/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  }

  async getMyReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/reviews/my/all?${queryString}` : '/reviews/my/all';
    return this.makeRequest(url);
  }

  async getMyReviewStats() {
    return this.makeRequest('/reviews/my/stats');
  }

  // User Methods
  async getUserStats() {
    return this.makeRequest('/users/stats');
  }

  // Upload Methods
  async uploadSingleImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return this.makeRequest('/upload/single', {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        ...this.getAuthHeaders(),
      },
      body: formData,
    });
  }

  async uploadMultipleImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.makeRequest('/upload/multiple', {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        ...this.getAuthHeaders(),
      },
      body: formData,
    });
  }

  // Utility Methods
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for easier imports
export const {
  logout,
  getProfile,
  updateProfile,
  generateItinerary,
  chatWithAI,
  getRecommendations,
  getItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  likeItinerary,
  saveItinerary,
  getMyItineraries,
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingStats,
  getItineraryReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  getMyReviews,
  getMyReviewStats,
  getUserStats,
  uploadSingleImage,
  uploadMultipleImages,
  isAuthenticated,
  getCurrentUser,
  healthCheck,
} = apiService;