/**
 * AI Service for Intelligent Travel Itinerary Generation
 * 
 * This service connects to the integrated Python Flask backend that includes:
 * - AI-powered itinerary generation with destination-specific knowledge
 * - Hotel integration and recommendations
 * - Cost estimation and travel planning
 * - Day-by-day scheduling and routing
 * - Travel tips and best route suggestions
 * 
 * The integrated backend provides intelligent, personalized travel itineraries
 * with comprehensive planning and hotel recommendations.
 */

import axios from 'axios';

class AIService {
  constructor() {
    // Use the main backend URL that now includes AI services
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Configure axios for API calls
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds for AI processing
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add auth token interceptor
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Check if AI itinerary service is available
   */
  async checkAIServiceHealth() {
    try {
      const response = await this.apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw new Error('Backend service is not available. Please ensure the server is running.');
    }
  }

  /**
   * Get available destinations (now from integrated backend)
   */
  async getAvailableDestinations() {
    try {
      // Return predefined destinations that our AI supports
      const destinations = [
        { value: 'kerala', label: 'Kerala, God\'s Own Country', country: 'India' },
        { value: 'rajasthan', label: 'Rajasthan, Land of Kings', country: 'India' },
        { value: 'goa', label: 'Goa, Pearl of the Orient', country: 'India' },
        { value: 'himachal pradesh', label: 'Himachal Pradesh', country: 'India' },
        { value: 'karnataka', label: 'Karnataka', country: 'India' },
        { value: 'tamil nadu', label: 'Tamil Nadu', country: 'India' },
        { value: 'maharashtra', label: 'Maharashtra', country: 'India' },
        { value: 'uttarakhand', label: 'Uttarakhand', country: 'India' }
      ];
      return { success: true, destinations };
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw new Error('Failed to fetch available destinations');
    }
  }

  /**
   * Generate intelligent itinerary using integrated AI backend
   */
  async generateItinerary(request) {
    console.log('Generating AI-powered itinerary with request:', request);
    
    try {
      // Prepare request for our integrated AI API
      const aiRequest = {
        destination: this._extractDestinationName(request.destination),
        duration_days: parseInt(request.duration),
        start_date: request.dates?.startDate || new Date().toISOString().split('T')[0],
        preferences: {
          theme: this._normalizeTravelStyle(request.travelStyle),
          budget: request.budget || 25000,
          interests: request.interests || []
        },
        budget: request.budget || 25000,
        trip_type: this._mapTripType(request.travelStyle)
      };

      console.log('Sending request to integrated AI service:', aiRequest);

      // Try ML-powered generation first
      try {
        console.log('🤖 Attempting ML-powered generation...');
        const mlResponse = await this.apiClient.post('/api/ml-itineraries/generate-ml', aiRequest);
        
        if (mlResponse.data.success) {
          console.log('✅ ML-powered generation successful!');
          const aiItinerary = mlResponse.data.itinerary;
          const hotelRecommendations = mlResponse.data.hotel_recommendations;
          
          // Add ML features info to the response
          const transformedItinerary = this._transformIntegratedAIItinerary(aiItinerary, hotelRecommendations, request);
          
          // Add ML metadata
          transformedItinerary.mlPowered = true;
          transformedItinerary.mlFeatures = mlResponse.data.ml_features;
          transformedItinerary.generationMetadata = mlResponse.data.generation_metadata;
          
          // Verify duration matches request
          if (transformedItinerary.duration !== request.duration) {
            console.warn(`⚠️ Duration mismatch: requested ${request.duration} days, got ${transformedItinerary.duration} days`);
            transformedItinerary.duration = request.duration;
            if (transformedItinerary.dayPlans && transformedItinerary.dayPlans.length > request.duration) {
              transformedItinerary.dayPlans = transformedItinerary.dayPlans.slice(0, request.duration);
            }
          }
          
          console.log('🎉 ML-powered itinerary generated successfully!');
          return transformedItinerary;
        }
      } catch (mlError) {
        console.warn('⚠️ ML generation failed, falling back to rule-based AI:', mlError.message);
      }

      // Fallback to rule-based AI
      console.log('🏛️ Using rule-based AI generation...');
      const response = await this.apiClient.post('/api/itineraries/generate', aiRequest);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'AI service returned unsuccessful response');
      }

      const aiItinerary = response.data.itinerary;
      const hotelRecommendations = response.data.hotel_recommendations;
      
      console.log('Received AI-generated itinerary:', aiItinerary);

      // Transform response to match frontend expectations
      const transformedItinerary = this._transformIntegratedAIItinerary(aiItinerary, hotelRecommendations, request);
      
      // Add rule-based metadata
      transformedItinerary.mlPowered = false;
      transformedItinerary.generationType = 'rule-based';
      
      // Verify duration matches request
      if (transformedItinerary.duration !== request.duration) {
        console.warn(`⚠️ Duration mismatch: requested ${request.duration} days, got ${transformedItinerary.duration} days`);
        transformedItinerary.duration = request.duration;
        if (transformedItinerary.dayPlans && transformedItinerary.dayPlans.length > request.duration) {
          transformedItinerary.dayPlans = transformedItinerary.dayPlans.slice(0, request.duration);
        }
      }
      
      console.log('Successfully generated rule-based AI itinerary');
      
      return transformedItinerary;

    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      
      // Fallback to basic itinerary if AI service fails
      if (error.message.includes('service is not available') || error.response?.status >= 500) {
        console.warn('AI service issues, falling back to basic itinerary generation');
        return this._generateFallbackItinerary(request);
      }
      
      throw new Error(`Failed to generate itinerary: ${error.message}`);
    }
  }

  /**
   * Get ML-powered recommendations
   */
  async getMLRecommendations(destination, interests, budget, theme) {
    try {
      const response = await this.apiClient.post('/api/ml-itineraries/ml-recommendations', {
        destination: this._extractDestinationName(destination),
        interests: interests || [],
        budget: budget || 25000,
        theme: theme || 'leisure'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting ML recommendations:', error);
      throw new Error(`Failed to get ML recommendations: ${error.message}`);
    }
  }

  /**
   * Get ML service insights and capabilities
   */
  async getMLInsights() {
    try {
      const response = await this.apiClient.get('/api/ml-itineraries/ml-insights');
      return response.data;
    } catch (error) {
      console.error('Error getting ML insights:', error);
      throw new Error(`Failed to get ML insights: ${error.message}`);
    }
  }

  /**
   * Compare ML vs Rule-based AI services
   */
  async compareAIServices(destination, duration, preferences) {
    try {
      const response = await this.apiClient.post('/api/ml-itineraries/compare-services', {
        destination: this._extractDestinationName(destination),
        duration_days: parseInt(duration),
        interests: preferences.interests || [],
        budget: preferences.budget || 25000,
        theme: preferences.theme || 'leisure'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error comparing AI services:', error);
      throw new Error(`Failed to compare AI services: ${error.message}`);
    }
  }

  /**
   * Save generated itinerary to user dashboard
   */
  async saveGeneratedItinerary(itinerary, hotelRecommendations) {
    try {
      const response = await this.apiClient.post('/api/itineraries/save-generated', {
        itinerary: itinerary,
        hotel_recommendations: hotelRecommendations
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      throw new Error(`Failed to save itinerary: ${error.message}`);
    }
  }

  /**
   * Get hotel recommendations for destination
   */
  async getHotelRecommendations(destination, duration, budget, tripType) {
    try {
      const response = await this.apiClient.post('/api/itineraries/hotels/recommendations', {
        destination: this._extractDestinationName(destination),
        duration_days: parseInt(duration),
        budget_total: budget,
        trip_type: tripType || 'leisure'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting hotel recommendations:', error);
      throw new Error(`Failed to get hotel recommendations: ${error.message}`);
    }
  }

  /**
   * Preview itinerary without saving
   */
  async previewItinerary(destination, duration, startDate) {
    try {
      const response = await this.apiClient.post('/api/itineraries/preview', {
        destination: this._extractDestinationName(destination),
        duration_days: parseInt(duration),
        start_date: startDate
      });
      
      return response.data;
    } catch (error) {
      console.error('Error previewing itinerary:', error);
      throw new Error(`Failed to preview itinerary: ${error.message}`);
    }
  }

  /**
   * Extract destination name from full string
   */
  _extractDestinationName(destination) {
    if (!destination) return '';
    
    // Extract the main destination name (e.g., "Kerala" from "Kerala, India")
    const parts = destination.split(',');
    return parts[0].trim().toLowerCase();
  }

  /**
   * Map frontend trip type to backend trip type
   */
  _mapTripType(travelStyle) {
    const mapping = {
      'luxury': 'luxury',
      'budget': 'budget', 
      'mid-range': 'leisure',
      'cultural': 'leisure',
      'adventure': 'adventure',
      'relaxation': 'leisure',
      'romantic': 'luxury',
      'family': 'leisure',
      'business': 'business'
    };
    
    return mapping[travelStyle] || 'leisure';
  }

  /**
   * Normalize travel style for backend API
   */
  _normalizeTravelStyle(travelStyle) {
    const styleMap = {
      'cultural': 'culture',
      'adventure': 'adventure', 
      'relaxation': 'nature',
      'luxury': 'luxury',
      'budget': 'budget',
      'mid-range': 'leisure',
      'business': 'business',
      'romantic': 'luxury',
      'family': 'leisure'
    };
    
    return styleMap[travelStyle] || 'leisure';
  }

  /**
   * Transform integrated AI itinerary response for frontend
   */
  _transformIntegratedAIItinerary(aiItinerary, hotelRecommendations, originalRequest) {
    console.log('Transforming AI itinerary:', aiItinerary);
    if (!aiItinerary || typeof aiItinerary !== 'object') {
      return {
        id: `ai-${Date.now()}`,
        title: 'No Itinerary Data',
        note: 'No itinerary data was returned from backend.',
        generatedBy: 'ai',
        generatedAt: new Date().toISOString(),
      };
    }
    try {
      return {
        id: `ai-${Date.now()}`,
        title: `${aiItinerary.destination} - ${aiItinerary.duration_days} Days`,
        destination: aiItinerary.destination,
        startDate: aiItinerary.start_date,
        endDate: aiItinerary.end_date,
        duration: aiItinerary.duration_days,
        theme: aiItinerary.theme,
        totalCost: aiItinerary.total_cost,
        currency: 'INR',
        dayPlans: aiItinerary.day_plans?.map(dayPlan => ({
          day: dayPlan.day,
          date: dayPlan.date,
          title: dayPlan.theme || `Day ${dayPlan.day} in ${dayPlan.location}`,
          location: dayPlan.location,
          description: dayPlan.description,
          locations: dayPlan.activities ? dayPlan.activities.map(activity => ({
            name: activity.activity || activity.name,
            type: activity.type || 'attraction',
            description: activity.description || '',
            duration: activity.duration ? parseFloat(activity.duration.replace(' hours', '')) : 2,
            rating: 4.5,
            coordinates: null,
            bestTime: activity.time,
            category: activity.type || 'activity',
            estimatedCost: activity.cost || Math.round(dayPlan.estimated_cost / (dayPlan.activities?.length || 1))
          })) : (dayPlan.locations?.map(location => ({
            name: location.name,
            type: location.type,
            description: location.description,
            duration: location.duration_hours,
            rating: location.rating,
            coordinates: location.coordinates,
            bestTime: location.best_time,
            category: location.category,
            estimatedCost: Math.round(aiItinerary.total_cost / aiItinerary.duration_days / dayPlan.locations.length)
          })) || []),
          travelTime: dayPlan.travel_time || dayPlan.travel_time_total,
          notes: dayPlan.notes,
          estimatedCost: dayPlan.estimated_cost || Math.round(aiItinerary.total_cost / aiItinerary.duration_days),
          highlights: dayPlan.highlights || [],
          accommodation: dayPlan.accommodation,
          mealsIncluded: dayPlan.meals_included || [],
          weatherInfo: dayPlan.weather_info
        })) || [],
        hotels: (aiItinerary.hotels || hotelRecommendations?.recommended_hotels)?.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          location: hotel.location || `${hotel.city || ''}, ${hotel.state || ''}`.trim(),
          rating: hotel.rating,
          pricePerNight: hotel.price_per_night || hotel.pricePerNight,
          totalCost: hotel.total_cost_with_tax || hotel.totalCost,
          amenities: hotel.amenities || [],
          image: hotel.image || hotel.image_url || '',
          description: hotel.description || '',
          recommendedFor: hotel.recommended_for || hotel.recommendedFor,
          reviewCount: hotel.review_count || hotel.reviewCount || 0,
          distanceToCenter: hotel.distance_to_center || hotel.distanceToCenter
        })) || [],
        travelTips: aiItinerary.travel_tips || [],
        bestRoutes: aiItinerary.best_routes,
        destinationsCovered: aiItinerary.destinations_covered || [],
        bestTimeToVisit: aiItinerary.best_time_to_visit,
        costBreakdown: {
          accommodation: Math.round((aiItinerary.total_cost || aiItinerary.total_estimated_cost || 0) * 0.4),
          food: Math.round((aiItinerary.total_cost || aiItinerary.total_estimated_cost || 0) * 0.25),
          activities: Math.round((aiItinerary.total_cost || aiItinerary.total_estimated_cost || 0) * 0.20),
          transportation: Math.round((aiItinerary.total_cost || aiItinerary.total_estimated_cost || 0) * 0.15)
        },
        generatedBy: 'ai',
        generatedAt: new Date().toISOString(),
        personalizationScore: 0.85,
        confidence: 0.9
      };
    } catch (err) {
      console.error('Error in _transformIntegratedAIItinerary:', err);
      return {
        id: `ai-${Date.now()}`,
        title: 'Error transforming itinerary',
        note: 'There was an error transforming the itinerary data.',
        generatedBy: 'ai',
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate fallback itinerary when AI service is unavailable
   */
  _generateFallbackItinerary(request) {
    const destination = this._extractDestinationName(request.destination);
    const duration = parseInt(request.duration) || 7;
    const startDate = request.dates?.startDate || new Date().toISOString().split('T')[0];
    
    // Calculate end date
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + duration - 1);
    const endDate = endDateObj.toISOString().split('T')[0];

    return {
      id: `fallback-${Date.now()}`,
      title: `${destination} - ${duration} Days (Basic Plan)`,
      destination: destination,
      startDate: startDate,
      endDate: endDate,
      duration: duration,
      theme: 'Basic Exploration',
      totalCost: duration * 5000, // Rough estimate
      currency: 'INR',
      
      dayPlans: Array.from({ length: duration }, (_, index) => ({
        day: index + 1,
        date: new Date(new Date(startDate).getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: `Day ${index + 1} - Explore ${destination}`,
        locations: [
          {
            name: `${destination} City Tour`,
            type: 'attraction',
            description: `Explore the main attractions and landmarks of ${destination}`,
            duration: 4,
            rating: 4.0,
            coordinates: [0, 0],
            bestTime: 'morning',
            category: 'culture',
            estimatedCost: 1500
          },
          {
            name: `Local Markets & Shopping`,
            type: 'shopping',
            description: `Visit local markets and shopping areas in ${destination}`,
            duration: 3,
            rating: 4.0,
            coordinates: [0, 0],
            bestTime: 'afternoon',
            category: 'culture',
            estimatedCost: 1000
          }
        ],
        travelTime: 1,
        notes: `Basic exploration day in ${destination}. Consider local transportation and weather.`,
        estimatedCost: 5000
      })),
      
      hotels: [],
      travelTips: [
        `Research local customs and traditions in ${destination}`,
        'Try local cuisine and specialties',
        'Carry necessary documents and emergency contacts',
        'Book accommodations in advance'
      ],
      bestRoutes: [`Explore ${destination} city center and surrounding areas`],
      costBreakdown: {
        accommodation: duration * 2000,
        food: duration * 1200,
        activities: duration * 1000,
        transportation: duration * 800
      },
      generatedBy: 'fallback',
      generatedAt: new Date().toISOString(),
      personalizationScore: 0.3,
      confidence: 0.5
    };
  }

  /**
   * Legacy method for backward compatibility
   * Routes to the new AI-powered generation
   */
  async generateAIItinerary(preferences) {
    return this.generateItinerary(preferences);
  }
}

// Create and export a singleton instance
const aiService = new AIService();
export { aiService };
export default aiService;