/**
 * Itinerary Service for managing travel itineraries
 * Handles CRUD operations for user itineraries
 */

import axios from 'axios';

/**
 * @typedef {Object} SavedItinerary
 * @property {string} id - Itinerary ID
 * @property {string} userId - User ID who owns the itinerary
 * @property {string} title - Itinerary title
 * @property {string} description - Itinerary description
 * @property {string} destination - Primary destination
 * @property {number} duration - Duration in days
 * @property {number} totalBudget - Total estimated budget
 * @property {Object[]} days - Daily itineraries
 * @property {string} status - Status (draft, published, completed)
 * @property {boolean} isPublic - Whether itinerary is publicly visible
 * @property {Object} metadata - Additional metadata
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

class ItineraryService {
  /**
   * Generate an itinerary using Gemini AI backend
   * @param {Object} userData - User trip data (destination, duration_days, budget, group_size, interests)
   * @returns {Promise<Object>} AI-generated itinerary JSON
   */
  async generateAIItinerary(userData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/itineraries/generate-ai`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to generate AI itinerary'
      );
    }
  }
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.storageKey = 'travelsensei_itineraries';
  }

  /**
   * Save a new itinerary
   * @param {Object} itinerary - Itinerary to save
   * @param {string} userId - User ID
   * @returns {Promise<SavedItinerary>}
   */
  async saveItinerary(itinerary, userId) {
    try {
      // Prepare itinerary object for local storage
      // Build itinerary object for backend and local storage
      const savedItinerary = {
        ...itinerary,
        id: itinerary.id || `it_${Date.now()}`,
        title: itinerary.title || itinerary.destination || `Itinerary ${new Date().toLocaleString()}`,
        description: itinerary.description || '',
        duration: itinerary.duration || itinerary.duration_days || itinerary.dayPlans?.length || 7,
        totalBudget: itinerary.totalBudget || itinerary.totalCost || 0,
        userId,
        status: itinerary.status || 'planned',
        isPublic: itinerary.isPublic || false,
        createdAt: itinerary.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        end_date: itinerary.endDate || itinerary.end_date || null,
        notes: itinerary.travelTips || itinerary.travel_tips || itinerary.notes || '',
        ai_generated: true
      };
      // Force remove activities and flights fields
      if ('activities' in savedItinerary) delete savedItinerary.activities;
      if ('flights' in savedItinerary) delete savedItinerary.flights;

      // Prepare object for backend: remove activities/flights, set ai_generated true
      const backendItinerary = { ...savedItinerary };
      if ('activities' in backendItinerary) delete backendItinerary.activities;
      if ('flights' in backendItinerary) delete backendItinerary.flights;
      backendItinerary.ai_generated = true;
      // Save to backend database via API
      try {
        const api = (await import('./api')).default;
        await api.createItinerary(backendItinerary);
      } catch (apiError) {
        // Log but do not block local save
        console.error('API save error (dashboard):', apiError);
      }

      // Always read, append, and write the full array locally
      let existingItineraries = this.getLocalItineraries();
      if (!Array.isArray(existingItineraries)) {
        existingItineraries = [];
      }
      // Prevent duplicate IDs
      existingItineraries = existingItineraries.filter(it => it.id !== savedItinerary.id);
      existingItineraries.push(savedItinerary);

      localStorage.setItem(this.storageKey, JSON.stringify(existingItineraries));
      return savedItinerary;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      throw new Error('Failed to save itinerary');
    }
  }

  /**
   * Get all itineraries for a user
   * @param {string} userId - User ID
   * @returns {Promise<SavedItinerary[]>}
   */
  async getUserItineraries(userId) {
    try {
      // Simulate API delay
      await this.delay(500);
      
      const allItineraries = this.getLocalItineraries();
      return allItineraries.filter(itinerary => itinerary.userId === userId);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      throw new Error('Failed to fetch itineraries');
    }
  }

  /**
   * Get a specific itinerary by ID
   * @param {string} itineraryId - Itinerary ID
   * @param {string} userId - User ID (for permission check)
   * @returns {Promise<SavedItinerary|null>}
   */
  async getItinerary(itineraryId, userId) {
    try {
      await this.delay(300);
      
      const allItineraries = this.getLocalItineraries();
      const itinerary = allItineraries.find(it => it.id === itineraryId);
      
      if (!itinerary) return null;
      
      // Check permissions - user can access their own itineraries or public ones
      if (itinerary.userId === userId || itinerary.isPublic) {
        return itinerary;
      }
      
      throw new Error('Access denied');
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      throw error;
    }
  }

  /**
   * Update an existing itinerary
   * @param {string} itineraryId - Itinerary ID
   * @param {Object} updates - Updates to apply
   * @param {string} userId - User ID
   * @returns {Promise<SavedItinerary>}
   */
  async updateItinerary(itineraryId, updates, userId) {
    try {
      await this.delay(400);
      
      const allItineraries = this.getLocalItineraries();
      const index = allItineraries.findIndex(it => it.id === itineraryId && it.userId === userId);
      
      if (index === -1) {
        throw new Error('Itinerary not found or access denied');
      }
      
      allItineraries[index] = {
        ...allItineraries[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(allItineraries));
      
      return allItineraries[index];
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  }

  /**
   * Delete an itinerary
   * @param {string} itineraryId - Itinerary ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async deleteItinerary(itineraryId, userId) {
    try {
      await this.delay(300);
      
      const allItineraries = this.getLocalItineraries();
      const filteredItineraries = allItineraries.filter(
        it => !(it.id === itineraryId && it.userId === userId)
      );
      
      if (filteredItineraries.length === allItineraries.length) {
        throw new Error('Itinerary not found or access denied');
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredItineraries));
      
      return true;
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  }

  /**
   * Share an itinerary (make it public)
   * @param {string} itineraryId - Itinerary ID
   * @param {string} userId - User ID
   * @returns {Promise<string>} Share URL
   */
  async shareItinerary(itineraryId, userId) {
    try {
      await this.updateItinerary(itineraryId, { isPublic: true }, userId);
      return `${window.location.origin}/itinerary/shared/${itineraryId}`;
    } catch (error) {
      console.error('Error sharing itinerary:', error);
      throw error;
    }
  }

  /**
   * Get popular public itineraries
   * @param {number} limit - Number of itineraries to return
   * @returns {Promise<SavedItinerary[]>}
   */
  async getPopularItineraries(limit = 10) {
    try {
      await this.delay(600);
      
      // In a real app, this would fetch from API with popularity metrics
      const mockPopularItineraries = [
        {
          id: 'popular-1',
          userId: 'user-demo',
          title: '7-Day Tokyo Cultural Journey',
          description: 'Experience the best of traditional and modern Tokyo',
          destination: 'Tokyo, Japan',
          duration: 7,
          totalBudget: 2800,
          status: 'published',
          isPublic: true,
          metadata: {
            views: 1250,
            likes: 89,
            saves: 34
          },
          createdAt: '2025-01-15T10:00:00.000Z',
          updatedAt: '2025-01-15T10:00:00.000Z'
        },
        {
          id: 'popular-2',
          userId: 'user-demo',
          title: '5-Day Paris Romance',
          description: 'A romantic getaway through the City of Love',
          destination: 'Paris, France',
          duration: 5,
          totalBudget: 3200,
          status: 'published',
          isPublic: true,
          metadata: {
            views: 980,
            likes: 67,
            saves: 28
          },
          createdAt: '2025-01-10T14:30:00.000Z',
          updatedAt: '2025-01-10T14:30:00.000Z'
        }
      ];
      
      return mockPopularItineraries.slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular itineraries:', error);
      throw error;
    }
  }

  /**
   * Get itineraries from localStorage
   * @returns {SavedItinerary[]}
   */
  getLocalItineraries() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing stored itineraries:', error);
      return [];
    }
  }

  /**
   * Export itinerary to different formats
   * @param {string} itineraryId - Itinerary ID
   * @param {string} format - Export format (pdf, ics, json)
   * @param {string} userId - User ID
   * @returns {Promise<Blob>}
   */
  async exportItinerary(itineraryId, format = 'json', userId) {
    try {
      const itinerary = await this.getItinerary(itineraryId, userId);
      
      if (!itinerary) {
        throw new Error('Itinerary not found');
      }
      
      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(itinerary, null, 2)], {
            type: 'application/json'
          });
        
        case 'ics':
          // Generate ICS calendar format
          const icsContent = this.generateICS(itinerary);
          return new Blob([icsContent], { type: 'text/calendar' });
        
        case 'pdf':
          // In a real app, this would generate a PDF
          throw new Error('PDF export not implemented in demo');
        
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting itinerary:', error);
      throw error;
    }
  }

  /**
   * Generate ICS calendar format for itinerary
   * @param {SavedItinerary} itinerary 
   * @returns {string}
   */
  generateICS(itinerary) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TravelSensei//TravelSensei//EN',
      'CALSCALE:GREGORIAN'
    ];

    itinerary.days.forEach(day => {
      day.activities.forEach(activity => {
        const startDateTime = new Date(`${day.date}T09:00:00`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDateTime = new Date(`${day.date}T${9 + activity.duration}:00:00`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        lines.push(
          'BEGIN:VEVENT',
          `UID:${activity.id}@travelsensei.com`,
          `DTSTART:${startDateTime}`,
          `DTEND:${endDateTime}`,
          `SUMMARY:${activity.name}`,
          `DESCRIPTION:${activity.description}`,
          `LOCATION:${activity.location.address}`,
          'END:VEVENT'
        );
      });
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Simulate async delay
   * @param {number} ms 
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clone an existing itinerary
   * @param {string} itineraryId - Original itinerary ID
   * @param {string} userId - User ID
   * @returns {Promise<SavedItinerary>}
   */
  async cloneItinerary(itineraryId, userId) {
    try {
      const originalItinerary = await this.getItinerary(itineraryId, userId);
      
      if (!originalItinerary) {
        throw new Error('Itinerary not found');
      }

      const clonedItinerary = {
        ...originalItinerary,
        id: `itinerary-${Date.now()}`,
        title: `Copy of ${originalItinerary.title}`,
        userId,
        status: 'draft',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await this.saveItinerary(clonedItinerary, userId);
    } catch (error) {
      console.error('Error cloning itinerary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const itineraryService = new ItineraryService();
export default itineraryService;