/**
 * AI Service for generating travel itineraries with intelligent routing
 * This service provides AI-powered itinerary generation with special focus on Indian destinations
 * Features: Smart routing, location optimization, cultural experiences, and local insights
 */

import axios from 'axios';

// Enhanced destination database with detailed routing information
const destinationDatabase = {
  'Kerala, India': {
    regions: {
      north: ['Wayanad', 'Kannur', 'Kasaragod'],
      central: ['Kochi', 'Thrissur', 'Palakkad', 'Munnar'],
      south: ['Thiruvananthapuram', 'Kovalam', 'Kollam', 'Alleppey', 'Kumarakom', 'Periyar']
    },
    mustVisit: [
      {
        name: 'Munnar',
        type: 'hill_station',
        duration: 2,
        description: 'Tea plantations and cool climate',
        coordinates: { lat: 10.0889, lng: 77.0595 },
        bestFor: ['nature', 'photography', 'wellness'],
        activities: ['Tea plantation tours', 'Eravikulam National Park', 'Echo Point', 'Top Station']
      },
      {
        name: 'Alleppey (Alappuzha)',
        type: 'backwaters',
        duration: 1,
        description: 'Venice of the East with backwaters',
        coordinates: { lat: 9.4981, lng: 76.3388 },
        bestFor: ['relaxation', 'cultural', 'romantic'],
        activities: ['Houseboat cruise', 'Backwater villages', 'Coir making', 'Toddy tapping']
      },
      {
        name: 'Kochi (Cochin)',
        type: 'port_city',
        duration: 2,
        description: 'Historic port city with colonial charm',
        coordinates: { lat: 9.9312, lng: 76.2673 },
        bestFor: ['history', 'culture', 'art'],
        activities: ['Fort Kochi', 'Chinese Fishing Nets', 'Mattancherry Palace', 'Jewish Synagogue', 'Spice markets']
      },
      {
        name: 'Thekkady (Periyar)',
        type: 'wildlife',
        duration: 2,
        description: 'Wildlife sanctuary and spice gardens',
        coordinates: { lat: 9.5992, lng: 77.1603 },
        bestFor: ['adventure', 'nature', 'wildlife'],
        activities: ['Periyar Wildlife Sanctuary', 'Boat safari', 'Spice plantation tour', 'Bamboo rafting']
      },
      {
        name: 'Kumarakom',
        type: 'backwaters',
        duration: 1,
        description: 'Bird sanctuary and backwater paradise',
        coordinates: { lat: 9.6178, lng: 76.4297 },
        bestFor: ['nature', 'relaxation', 'photography'],
        activities: ['Bird watching', 'Backwater cruise', 'Village walks', 'Ayurvedic treatments']
      },
      {
        name: 'Kovalam',
        type: 'beach',
        duration: 2,
        description: 'Famous beach destination',
        coordinates: { lat: 8.4004, lng: 76.9784 },
        bestFor: ['relaxation', 'beach', 'wellness'],
        activities: ['Beach activities', 'Lighthouse', 'Ayurvedic treatments', 'Sunset viewing']
      },
      {
        name: 'Wayanad',
        type: 'hill_station',
        duration: 2,
        description: 'Western Ghats biodiversity hotspot',
        coordinates: { lat: 11.6854, lng: 76.1320 },
        bestFor: ['adventure', 'nature', 'trekking'],
        activities: ['Chembra Peak trek', 'Soochipara Falls', 'Edakkal Caves', 'Wildlife safari']
      }
    ],
    optimalRoutes: {
      7: [ // 7-day optimal route
        {
          sequence: ['Kochi', 'Munnar', 'Thekkady', 'Alleppey', 'Kumarakom', 'Kovalam'],
          reasoning: 'Minimizes travel time while covering major highlights'
        }
      ],
      10: [ // 10-day optimal route
        {
          sequence: ['Kochi', 'Munnar', 'Thekkady', 'Alleppey', 'Kumarakom', 'Kovalam', 'Wayanad'],
          reasoning: 'Comprehensive coverage with comfortable pace'
        }
      ],
      14: [ // 14-day comprehensive route
        {
          sequence: ['Kochi', 'Munnar', 'Thekkady', 'Alleppey', 'Kumarakom', 'Kovalam', 'Wayanad', 'Kannur'],
          reasoning: 'Complete Kerala experience including north Kerala'
        }
      ]
    },
    transportation: {
      distances: {
        'Kochi-Munnar': { km: 130, time: '3.5 hours', mode: 'car' },
        'Munnar-Thekkady': { km: 90, time: '3 hours', mode: 'car' },
        'Thekkady-Alleppey': { km: 140, time: '4 hours', mode: 'car' },
        'Alleppey-Kumarakom': { km: 32, time: '1 hour', mode: 'car' },
        'Kumarakom-Kovalam': { km: 160, time: '4 hours', mode: 'car' },
        'Kovalam-Wayanad': { km: 290, time: '6 hours', mode: 'car' }
      }
    },
    specialExperiences: [
      'Kerala backwater houseboat stay',
      'Kathakali dance performance',
      'Ayurvedic massage and treatments',
      'Tea plantation walking tour',
      'Traditional Kerala cooking class',
      'Theyyam ritual performance (seasonal)',
      'Spice plantation guided tour'
    ]
  }
};

/**
 * @typedef {Object} ItineraryRequest
 * @property {string} destination - Primary destination
 * @property {number} duration - Trip duration in days
 * @property {number} budget - Budget in USD
 * @property {string[]} interests - User interests and preferences
 * @property {string} travelStyle - Travel style (adventure, luxury, budget, etc.)
 * @property {string} groupSize - Group size (solo, couple, family, group)
 * @property {Object} dates - Travel dates
 * @property {string} dates.startDate - Start date in ISO format
 * @property {string} dates.endDate - End date in ISO format
 */

/**
 * @typedef {Object} Activity
 * @property {string} id - Unique activity ID
 * @property {string} name - Activity name
 * @property {string} description - Activity description
 * @property {string} category - Activity category
 * @property {number} duration - Duration in hours
 * @property {number} cost - Estimated cost
 * @property {Object} location - Location details
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.address - Full address
 * @property {number} rating - Rating (1-5)
 * @property {string[]} images - Array of image URLs
 * @property {string[]} tags - Activity tags
 */

/**
 * @typedef {Object} DayItinerary
 * @property {number} day - Day number
 * @property {string} date - Date in ISO format
 * @property {string} theme - Day theme
 * @property {Activity[]} activities - Activities for the day
 * @property {Object} transportation - Transportation details
 * @property {number} estimatedCost - Estimated cost for the day
 */

/**
 * Intelligent AI-powered itinerary generator
 * @param {ItineraryRequest} request - Itinerary generation request
 * @returns {Promise<GeneratedItinerary>} Generated itinerary with optimal routing
 */
const generateItinerary = async (request) => {
  try {
    console.log('🤖 AI Itinerary Generator - Processing request:', request);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { destination, duration, budget, interests, travelStyle, groupSize } = request;
    
    // Check if we have enhanced data for this destination
    const destinationData = destinationDatabase[destination];
    
    if (destinationData) {
      return this.generateIntelligentItinerary(request, destinationData);
    } else {
      return this.generateGenericItinerary(request);
    }
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
};

/**
 * Generate intelligent itinerary with optimal routing for known destinations
 */
const generateIntelligentItinerary = (request, destinationData) => {
  const { destination, duration, budget, interests, travelStyle, groupSize } = request;
  
  // Select optimal route based on duration
  let selectedRoute;
  if (duration <= 7) {
    selectedRoute = destinationData.optimalRoutes[7][0];
  } else if (duration <= 10) {
    selectedRoute = destinationData.optimalRoutes[10][0];
  } else {
    selectedRoute = destinationData.optimalRoutes[14][0];
  }
  
  // Generate day-by-day itinerary based on optimal route
  const days = [];
  let currentDay = 1;
  let budgetPerDay = budget / duration;
  
  selectedRoute.sequence.forEach((locationName, index) => {
    const location = destinationData.mustVisit.find(place => place.name.includes(locationName));
    if (!location) return;
    
    const daysAtLocation = Math.min(location.duration, duration - currentDay + 1);
    
    for (let i = 0; i < daysAtLocation && currentDay <= duration; i++) {
      const dayActivities = generateActivitiesForLocation(location, interests, travelStyle, i + 1, budgetPerDay);
      
      days.push({
        day: currentDay,
        date: new Date(Date.now() + (currentDay - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: location.name,
        theme: getThemeForDay(location, i + 1),
        activities: dayActivities,
        transportation: index === 0 ? null : getTransportationInfo(
          selectedRoute.sequence[index - 1], 
          locationName, 
          destinationData.transportation.distances
        ),
        estimatedCost: calculateDayCost(dayActivities, travelStyle),
        highlights: location.activities.slice(0, 3),
        tips: getLocalTips(location, travelStyle)
      });
      
      currentDay++;
    }
  });
  
  // Fill remaining days if any
  while (currentDay <= duration) {
    const lastLocation = days[days.length - 1]?.location || selectedRoute.sequence[0];
    const location = destinationData.mustVisit.find(place => place.name.includes(lastLocation));
    
    if (location) {
      const dayActivities = generateActivitiesForLocation(location, interests, travelStyle, 99, budgetPerDay);
      days.push({
        day: currentDay,
        date: new Date(Date.now() + (currentDay - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: location.name,
        theme: `Extended exploration of ${location.name}`,
        activities: dayActivities,
        transportation: null,
        estimatedCost: calculateDayCost(dayActivities, travelStyle),
        highlights: ['Free day for personal exploration'],
        tips: ['Take time to relax and explore at your own pace']
      });
    }
    currentDay++;
  }
  
  return {
    id: `itinerary_${Date.now()}`,
    destination,
    duration,
    budget,
    title: `${duration}-Day Intelligent Kerala Journey`,
    description: `Expertly crafted ${duration}-day itinerary for ${destination} with optimal routing and local experiences. ${selectedRoute.reasoning}`,
    days,
    totalCost: days.reduce((sum, day) => sum + day.estimatedCost, 0),
    highlights: destinationData.specialExperiences.slice(0, 5),
    tips: [
      'Book accommodations in advance, especially during peak season (October-March)',
      'Try local cuisine at traditional restaurants for authentic experiences',
      'Carry light cotton clothes and rain gear',
      'Respect local customs and traditions',
      'Stay hydrated and use sunscreen'
    ],
    bestTimeToVisit: 'October to March (post-monsoon to pre-summer)',
    weatherInfo: 'Tropical climate with monsoons from June to September',
    culturalInfo: 'Rich cultural heritage with classical arts, spices, and backwaters',
    routingStrategy: selectedRoute.reasoning,
    createdAt: new Date().toISOString()
  };
};

/**
 * Generate activities for a specific location based on user preferences
 */
const generateActivitiesForLocation = (location, interests, travelStyle, dayNumber, budget) => {
  const baseActivities = {
    'Munnar': [
      {
        id: 'munnar_tea_1',
        name: 'Tea Museum and Plantation Tour',
        description: 'Explore the tea-making process and walk through lush plantations',
        category: 'cultural',
        duration: 3,
        cost: 15,
        rating: 4.5,
        timeSlot: 'morning',
        location: { lat: 10.0889, lng: 77.0595, address: 'Tea Museum, Munnar' }
      },
      {
        id: 'munnar_echo_2',
        name: 'Echo Point Visit',
        description: 'Natural echo phenomenon with beautiful valley views',
        category: 'nature',
        duration: 2,
        cost: 5,
        rating: 4.2,
        timeSlot: 'afternoon',
        location: { lat: 10.1102, lng: 77.0624, address: 'Echo Point, Munnar' }
      },
      {
        id: 'munnar_top_3',
        name: 'Top Station Sunset',
        description: 'Highest point in Munnar with spectacular sunset views',
        category: 'nature',
        duration: 2,
        cost: 10,
        rating: 4.7,
        timeSlot: 'evening',
        location: { lat: 10.1458, lng: 77.0461, address: 'Top Station, Munnar' }
      }
    ],
    'Alleppey': [
      {
        id: 'alleppey_house_1',
        name: 'Backwater Houseboat Cruise',
        description: 'Traditional houseboat journey through scenic backwaters',
        category: 'relaxation',
        duration: 6,
        cost: 80,
        rating: 4.8,
        timeSlot: 'full_day',
        location: { lat: 9.4981, lng: 76.3388, address: 'Vembanad Lake, Alleppey' }
      },
      {
        id: 'alleppey_village_2',
        name: 'Village Cycling Tour',
        description: 'Cycle through traditional villages and paddy fields',
        category: 'cultural',
        duration: 3,
        cost: 20,
        rating: 4.4,
        timeSlot: 'morning',
        location: { lat: 9.5015, lng: 76.3300, address: 'Kumrakom Village, Alleppey' }
      }
    ],
    'Kochi': [
      {
        id: 'kochi_fort_1',
        name: 'Fort Kochi Heritage Walk',
        description: 'Walking tour through historical Fort Kochi area',
        category: 'history',
        duration: 3,
        cost: 12,
        rating: 4.6,
        timeSlot: 'morning',
        location: { lat: 9.9648, lng: 76.2424, address: 'Fort Kochi, Kochi' }
      },
      {
        id: 'kochi_nets_2',
        name: 'Chinese Fishing Nets Experience',
        description: 'Watch traditional Chinese fishing nets in operation',
        category: 'cultural',
        duration: 1,
        cost: 5,
        rating: 4.3,
        timeSlot: 'evening',
        location: { lat: 9.9648, lng: 76.2424, address: 'Fort Kochi Beach, Kochi' }
      },
      {
        id: 'kochi_dance_3',
        name: 'Kathakali Performance',
        description: 'Traditional Kerala classical dance performance',
        category: 'cultural',
        duration: 2,
        cost: 25,
        rating: 4.7,
        timeSlot: 'evening',
        location: { lat: 9.9312, lng: 76.2673, address: 'Kerala Kathakali Centre, Kochi' }
      }
    ],
    'Thekkady': [
      {
        id: 'thekkady_safari_1',
        name: 'Periyar Wildlife Safari',
        description: 'Boat safari in Periyar National Park to spot wildlife',
        category: 'adventure',
        duration: 3,
        cost: 30,
        rating: 4.5,
        timeSlot: 'morning',
        location: { lat: 9.5992, lng: 77.1603, address: 'Periyar National Park, Thekkady' }
      },
      {
        id: 'thekkady_spice_2',
        name: 'Spice Plantation Tour',
        description: 'Guided tour through aromatic spice gardens',
        category: 'cultural',
        duration: 2,
        cost: 15,
        rating: 4.4,
        timeSlot: 'afternoon',
        location: { lat: 9.6024, lng: 77.1567, address: 'Spice Gardens, Thekkady' }
      }
    ]
  };
  
  // Get activities for the location
  const locationKey = Object.keys(baseActivities).find(key => location.name.includes(key));
  const availableActivities = baseActivities[locationKey] || [];
  
  // Filter and select activities based on interests and day number
  let selectedActivities = availableActivities.filter(activity => {
    if (interests.length === 0) return true;
    return interests.some(interest => 
      activity.category.includes(interest.toLowerCase()) ||
      activity.description.toLowerCase().includes(interest.toLowerCase())
    );
  });
  
  // If no matching activities, use all available
  if (selectedActivities.length === 0) {
    selectedActivities = availableActivities;
  }
  
  // Select activities for the day (usually 2-3 activities per day)
  const activitiesPerDay = dayNumber === 1 ? 2 : 3; // Lighter first day
  return selectedActivities.slice(0, activitiesPerDay);
};

/**
 * Get theme for a specific day at a location
 */
const getThemeForDay = (location, dayNumber) => {
  const themes = {
    'Munnar': ['Tea Heritage & Nature', 'Wildlife & Adventure', 'Scenic Exploration'],
    'Alleppey': ['Backwater Bliss', 'Village Life Experience'],
    'Kochi': ['Colonial Heritage', 'Cultural Immersion'],
    'Thekkady': ['Wildlife Adventure', 'Spice Trail Experience'],
    'Kumarakom': ['Bird Watching Paradise'],
    'Kovalam': ['Beach Relaxation', 'Wellness & Ayurveda'],
    'Wayanad': ['Mountain Adventure', 'Ancient Caves & Falls']
  };
  
  const locationKey = Object.keys(themes).find(key => location.name.includes(key));
  const locationThemes = themes[locationKey] || ['Exploration Day'];
  
  return locationThemes[Math.min(dayNumber - 1, locationThemes.length - 1)] || 'Free Exploration';
};

/**
 * Get transportation information between locations
 */
const getTransportationInfo = (fromLocation, toLocation, distances) => {
  const routeKey = `${fromLocation}-${toLocation}`;
  const distance = distances[routeKey];
  
  if (distance) {
    return {
      from: fromLocation,
      to: toLocation,
      distance: distance.km,
      duration: distance.time,
      mode: distance.mode,
      cost: calculateTransportCost(distance.km, distance.mode),
      tips: [`Depart early morning to avoid traffic`, `Scenic route with photo opportunities`]
    };
  }
  
  return {
    from: fromLocation,
    to: toLocation,
    distance: 100,
    duration: '3 hours',
    mode: 'car',
    cost: 50,
    tips: ['Book transportation in advance']
  };
};

/**
 * Calculate transportation cost
 */
const calculateTransportCost = (distance, mode) => {
  const rates = {
    car: 0.5, // per km
    bus: 0.1,
    train: 0.15,
    flight: 2.0
  };
  return Math.round(distance * (rates[mode] || rates.car));
};

/**
 * Calculate estimated cost for a day's activities
 */
const calculateDayCost = (activities, travelStyle) => {
  const activityCost = activities.reduce((sum, activity) => sum + activity.cost, 0);
  
  // Add accommodation and meal costs based on travel style
  const dailyRates = {
    luxury: { accommodation: 150, meals: 60 },
    'mid-range': { accommodation: 70, meals: 35 },
    budget: { accommodation: 25, meals: 15 }
  };
  
  const rates = dailyRates[travelStyle] || dailyRates['mid-range'];
  return activityCost + rates.accommodation + rates.meals;
};

/**
 * Get local tips for a location
 */
const getLocalTips = (location, travelStyle) => {
  const generalTips = {
    'Munnar': [
      'Best visited during October to March for pleasant weather',
      'Carry warm clothes as temperatures can drop in evenings',
      'Book tea factory tours in advance'
    ],
    'Alleppey': [
      'Houseboat rates vary by season - book early for better deals',
      'Try traditional Kerala meals served on banana leaves',
      'Respect local fishing communities and their lifestyle'
    ],
    'Kochi': [
      'Fort Kochi is best explored on foot',
      'Evening is perfect for Chinese fishing nets photography',
      'Try local seafood at Jew Town area'
    ],
    'Thekkady': [
      'Early morning safaris have better wildlife spotting chances',
      'Wear earth-colored clothes for wildlife activities',
      'Purchase spices directly from plantations for authenticity'
    ]
  };
  
  const locationKey = Object.keys(generalTips).find(key => location.name.includes(key));
  return generalTips[locationKey] || ['Explore at your own pace and enjoy local interactions'];
};

/**
 * @property {string} id - Itinerary ID
 * @property {string} title - Itinerary title
 * @property {string} description - Itinerary description
 * @property {string} destination - Primary destination
 * @property {number} duration - Duration in days
 * @property {number} totalBudget - Total estimated budget
 * @property {DayItinerary[]} days - Daily itineraries
 * @property {Object} metadata - Additional metadata
 * @property {string} createdAt - Creation timestamp
 */

// Mock data for destinations and activities
const MOCK_DESTINATIONS = {
  'tokyo': {
    activities: [
      {
        id: 'tokyo-1',
        name: 'Visit Senso-ji Temple',
        description: 'Explore Tokyo\'s oldest temple in historic Asakusa district',
        category: 'Cultural',
        duration: 2,
        cost: 0,
        location: { lat: 35.7148, lng: 139.7967, address: '2-3-1 Asakusa, Taito City, Tokyo' },
        rating: 4.6,
        images: ['/images/sensoji.jpg'],
        tags: ['temple', 'historical', 'free']
      },
      {
        id: 'tokyo-2',
        name: 'Tsukiji Outer Market Food Tour',
        description: 'Experience the world\'s largest fish market and sample fresh sushi',
        category: 'Food',
        duration: 3,
        cost: 45,
        location: { lat: 35.6654, lng: 139.7707, address: 'Tsukiji, Chuo City, Tokyo' },
        rating: 4.8,
        images: ['/images/tsukiji.jpg'],
        tags: ['food', 'market', 'sushi']
      },
      {
        id: 'tokyo-3',
        name: 'Shibuya Crossing & Hachiko Statue',
        description: 'Experience the world\'s busiest pedestrian crossing',
        category: 'Sightseeing',
        duration: 1,
        cost: 0,
        location: { lat: 35.6598, lng: 139.7006, address: 'Shibuya City, Tokyo' },
        rating: 4.4,
        images: ['/images/shibuya.jpg'],
        tags: ['iconic', 'urban', 'free']
      },
      {
        id: 'tokyo-4',
        name: 'TeamLab Borderless',
        description: 'Immersive digital art experience',
        category: 'Art & Culture',
        duration: 4,
        cost: 32,
        location: { lat: 35.6249, lng: 139.7798, address: 'Odaiba, Tokyo' },
        rating: 4.7,
        images: ['/images/teamlab.jpg'],
        tags: ['art', 'digital', 'unique']
      },
      {
        id: 'tokyo-5',
        name: 'Mount Fuji Day Trip',
        description: 'Full-day excursion to Japan\'s iconic mountain',
        category: 'Nature',
        duration: 10,
        cost: 120,
        location: { lat: 35.3606, lng: 138.7274, address: 'Mount Fuji, Japan' },
        rating: 4.9,
        images: ['/images/fuji.jpg'],
        tags: ['mountain', 'nature', 'day-trip']
      }
    ]
  },
  'paris': {
    activities: [
      {
        id: 'paris-1',
        name: 'Eiffel Tower Visit',
        description: 'Iconic iron tower and symbol of Paris',
        category: 'Sightseeing',
        duration: 3,
        cost: 29,
        location: { lat: 48.8584, lng: 2.2945, address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris' },
        rating: 4.5,
        images: ['/images/eiffel.jpg'],
        tags: ['iconic', 'tower', 'views']
      },
      {
        id: 'paris-2',
        name: 'Louvre Museum',
        description: 'World\'s largest art museum and historic monument',
        category: 'Art & Culture',
        duration: 4,
        cost: 22,
        location: { lat: 48.8606, lng: 2.3376, address: 'Rue de Rivoli, 75001 Paris' },
        rating: 4.6,
        images: ['/images/louvre.jpg'],
        tags: ['museum', 'art', 'mona-lisa']
      },
      {
        id: 'paris-3',
        name: 'Seine River Cruise',
        description: 'Romantic cruise along the Seine with city views',
        category: 'Sightseeing',
        duration: 2,
        cost: 35,
        location: { lat: 48.8566, lng: 2.3522, address: 'Port de la Bourdonnais, Paris' },
        rating: 4.3,
        images: ['/images/seine.jpg'],
        tags: ['river', 'romantic', 'cruise']
      }
    ]
  },
  'bali': {
    activities: [
      {
        id: 'bali-1',
        name: 'Uluwatu Temple Sunset',
        description: 'Clifftop temple with spectacular sunset views',
        category: 'Cultural',
        duration: 3,
        cost: 5,
        location: { lat: -8.8297, lng: 115.0845, address: 'Pecatu, South Kuta, Badung Regency, Bali' },
        rating: 4.7,
        images: ['/images/uluwatu.jpg'],
        tags: ['temple', 'sunset', 'cliff']
      },
      {
        id: 'bali-2',
        name: 'Rice Terrace Trek',
        description: 'Guided trek through UNESCO World Heritage rice terraces',
        category: 'Nature',
        duration: 4,
        cost: 40,
        location: { lat: -8.3675, lng: 115.2189, address: 'Tegallalang, Gianyar Regency, Bali' },
        rating: 4.8,
        images: ['/images/rice-terrace.jpg'],
        tags: ['nature', 'trek', 'unesco']
      }
    ]
  }
};

class AIService {
  constructor() {
    // In a real implementation, this would contain API keys and configuration
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || 'mock-key';
    this.baseURL = process.env.REACT_APP_AI_SERVICE_URL || 'mock-service';
  }

  /**
   * Generate a travel itinerary based on user preferences with intelligent routing
   * @param {ItineraryRequest} request - User preferences and requirements
   * @returns {Promise<GeneratedItinerary>} Generated itinerary
   */
  async generateItinerary(request) {
    try {
      console.log('🤖 AI Itinerary Generator - Processing request:', request);
      
      // Simulate AI processing time
      await this.delay(2000);
      
      const { destination, duration, budget, interests, travelStyle, groupSize } = request;
      
      // Check if we have enhanced data for this destination
      const destinationData = destinationDatabase[destination];
      
      if (destinationData) {
        return this.generateIntelligentItinerary(request, destinationData);
      } else {
        return this.generateMockItinerary(request);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw new Error('Failed to generate itinerary. Please try again.');
    }
  }

  /**
   * Generate intelligent itinerary with optimal routing for known destinations
   */
  generateIntelligentItinerary(request, destinationData) {
    const { destination, duration, budget, interests, travelStyle, groupSize } = request;
    
    // Select optimal route based on duration
    let selectedRoute;
    if (duration <= 7) {
      selectedRoute = destinationData.optimalRoutes[7][0];
    } else if (duration <= 10) {
      selectedRoute = destinationData.optimalRoutes[10][0];
    } else {
      selectedRoute = destinationData.optimalRoutes[14][0];
    }
    
    // Generate day-by-day itinerary based on optimal route
    const days = [];
    let currentDay = 1;
    let budgetPerDay = budget / duration;
    
    selectedRoute.sequence.forEach((locationName, index) => {
      const location = destinationData.mustVisit.find(place => place.name.includes(locationName));
      if (!location) return;
      
      const daysAtLocation = Math.min(location.duration, duration - currentDay + 1);
      
      for (let i = 0; i < daysAtLocation && currentDay <= duration; i++) {
        const dayActivities = this.generateActivitiesForLocation(location, interests, travelStyle, i + 1, budgetPerDay);
        
        days.push({
          day: currentDay,
          date: new Date(Date.now() + (currentDay - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: location.name,
          theme: this.getThemeForDay(location, i + 1),
          activities: dayActivities,
          transportation: index === 0 ? null : this.getTransportationInfo(
            selectedRoute.sequence[index - 1], 
            locationName, 
            destinationData.transportation.distances
          ),
          estimatedCost: this.calculateDayCost(dayActivities, travelStyle),
          highlights: location.activities.slice(0, 3),
          tips: this.getLocalTips(location, travelStyle)
        });
        
        currentDay++;
      }
    });
    
    // Fill remaining days if any
    while (currentDay <= duration) {
      const lastLocation = days[days.length - 1]?.location || selectedRoute.sequence[0];
      const location = destinationData.mustVisit.find(place => place.name.includes(lastLocation));
      
      if (location) {
        const dayActivities = this.generateActivitiesForLocation(location, interests, travelStyle, 99, budgetPerDay);
        days.push({
          day: currentDay,
          date: new Date(Date.now() + (currentDay - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: location.name,
          theme: `Extended exploration of ${location.name}`,
          activities: dayActivities,
          transportation: null,
          estimatedCost: this.calculateDayCost(dayActivities, travelStyle),
          highlights: ['Free day for personal exploration'],
          tips: ['Take time to relax and explore at your own pace']
        });
      }
      currentDay++;
    }
    
    return {
      id: `itinerary_${Date.now()}`,
      destination,
      duration,
      budget,
      title: `${duration}-Day Intelligent ${destination} Journey`,
      description: `Expertly crafted ${duration}-day itinerary for ${destination} with optimal routing and local experiences. ${selectedRoute.reasoning}`,
      days,
      totalCost: days.reduce((sum, day) => sum + day.estimatedCost, 0),
      highlights: destinationData.specialExperiences.slice(0, 5),
      tips: [
        'Book accommodations in advance, especially during peak season (October-March)',
        'Try local cuisine at traditional restaurants for authentic experiences',
        'Carry light cotton clothes and rain gear',
        'Respect local customs and traditions',
        'Stay hydrated and use sunscreen'
      ],
      bestTimeToVisit: 'October to March (post-monsoon to pre-summer)',
      weatherInfo: 'Tropical climate with monsoons from June to September',
      culturalInfo: 'Rich cultural heritage with classical arts, spices, and backwaters',
      routingStrategy: selectedRoute.reasoning,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate activities for a specific location based on user preferences
   */
  generateActivitiesForLocation(location, interests, travelStyle, dayNumber, budget) {
    const baseActivities = {
      'Munnar': [
        {
          id: 'munnar_tea_1',
          name: 'Tea Museum and Plantation Tour',
          description: 'Explore the tea-making process and walk through lush plantations',
          category: 'cultural',
          duration: 3,
          cost: 15,
          rating: 4.5,
          timeSlot: 'morning',
          location: { lat: 10.0889, lng: 77.0595, address: 'Tea Museum, Munnar' }
        },
        {
          id: 'munnar_echo_2',
          name: 'Echo Point Visit',
          description: 'Natural echo phenomenon with beautiful valley views',
          category: 'nature',
          duration: 2,
          cost: 5,
          rating: 4.2,
          timeSlot: 'afternoon',
          location: { lat: 10.1102, lng: 77.0624, address: 'Echo Point, Munnar' }
        },
        {
          id: 'munnar_top_3',
          name: 'Top Station Sunset',
          description: 'Highest point in Munnar with spectacular sunset views',
          category: 'nature',
          duration: 2,
          cost: 10,
          rating: 4.7,
          timeSlot: 'evening',
          location: { lat: 10.1458, lng: 77.0461, address: 'Top Station, Munnar' }
        }
      ],
      'Alleppey': [
        {
          id: 'alleppey_house_1',
          name: 'Backwater Houseboat Cruise',
          description: 'Traditional houseboat journey through scenic backwaters',
          category: 'relaxation',
          duration: 6,
          cost: 80,
          rating: 4.8,
          timeSlot: 'full_day',
          location: { lat: 9.4981, lng: 76.3388, address: 'Vembanad Lake, Alleppey' }
        },
        {
          id: 'alleppey_village_2',
          name: 'Village Cycling Tour',
          description: 'Cycle through traditional villages and paddy fields',
          category: 'cultural',
          duration: 3,
          cost: 20,
          rating: 4.4,
          timeSlot: 'morning',
          location: { lat: 9.5015, lng: 76.3300, address: 'Kumrakom Village, Alleppey' }
        }
      ],
      'Kochi': [
        {
          id: 'kochi_fort_1',
          name: 'Fort Kochi Heritage Walk',
          description: 'Walking tour through historical Fort Kochi area',
          category: 'history',
          duration: 3,
          cost: 12,
          rating: 4.6,
          timeSlot: 'morning',
          location: { lat: 9.9648, lng: 76.2424, address: 'Fort Kochi, Kochi' }
        },
        {
          id: 'kochi_nets_2',
          name: 'Chinese Fishing Nets Experience',
          description: 'Watch traditional Chinese fishing nets in operation',
          category: 'cultural',
          duration: 1,
          cost: 5,
          rating: 4.3,
          timeSlot: 'evening',
          location: { lat: 9.9648, lng: 76.2424, address: 'Fort Kochi Beach, Kochi' }
        },
        {
          id: 'kochi_dance_3',
          name: 'Kathakali Performance',
          description: 'Traditional Kerala classical dance performance',
          category: 'cultural',
          duration: 2,
          cost: 25,
          rating: 4.7,
          timeSlot: 'evening',
          location: { lat: 9.9312, lng: 76.2673, address: 'Kerala Kathakali Centre, Kochi' }
        }
      ],
      'Thekkady': [
        {
          id: 'thekkady_safari_1',
          name: 'Periyar Wildlife Safari',
          description: 'Boat safari in Periyar National Park to spot wildlife',
          category: 'adventure',
          duration: 3,
          cost: 30,
          rating: 4.5,
          timeSlot: 'morning',
          location: { lat: 9.5992, lng: 77.1603, address: 'Periyar National Park, Thekkady' }
        },
        {
          id: 'thekkady_spice_2',
          name: 'Spice Plantation Tour',
          description: 'Guided tour through aromatic spice gardens',
          category: 'cultural',
          duration: 2,
          cost: 15,
          rating: 4.4,
          timeSlot: 'afternoon',
          location: { lat: 9.6024, lng: 77.1567, address: 'Spice Gardens, Thekkady' }
        }
      ]
    };
    
    // Get activities for the location
    const locationKey = Object.keys(baseActivities).find(key => location.name.includes(key));
    const availableActivities = baseActivities[locationKey] || [];
    
    // Filter and select activities based on interests and day number
    let selectedActivities = availableActivities.filter(activity => {
      if (interests.length === 0) return true;
      return interests.some(interest => 
        activity.category.includes(interest.toLowerCase()) ||
        activity.description.toLowerCase().includes(interest.toLowerCase())
      );
    });
    
    // If no matching activities, use all available
    if (selectedActivities.length === 0) {
      selectedActivities = availableActivities;
    }
    
    // Select activities for the day (usually 2-3 activities per day)
    const activitiesPerDay = dayNumber === 1 ? 2 : 3; // Lighter first day
    return selectedActivities.slice(0, activitiesPerDay);
  }

  /**
   * Get theme for a specific day at a location
   */
  getThemeForDay(location, dayNumber) {
    const themes = {
      'Munnar': ['Tea Heritage & Nature', 'Wildlife & Adventure', 'Scenic Exploration'],
      'Alleppey': ['Backwater Bliss', 'Village Life Experience'],
      'Kochi': ['Colonial Heritage', 'Cultural Immersion'],
      'Thekkady': ['Wildlife Adventure', 'Spice Trail Experience'],
      'Kumarakom': ['Bird Watching Paradise'],
      'Kovalam': ['Beach Relaxation', 'Wellness & Ayurveda'],
      'Wayanad': ['Mountain Adventure', 'Ancient Caves & Falls']
    };
    
    const locationKey = Object.keys(themes).find(key => location.name.includes(key));
    const locationThemes = themes[locationKey] || ['Exploration Day'];
    
    return locationThemes[Math.min(dayNumber - 1, locationThemes.length - 1)] || 'Free Exploration';
  }

  /**
   * Get transportation information between locations
   */
  getTransportationInfo(fromLocation, toLocation, distances) {
    const routeKey = `${fromLocation}-${toLocation}`;
    const distance = distances[routeKey];
    
    if (distance) {
      return {
        from: fromLocation,
        to: toLocation,
        distance: distance.km,
        duration: distance.time,
        mode: distance.mode,
        cost: this.calculateTransportCost(distance.km, distance.mode),
        tips: [`Depart early morning to avoid traffic`, `Scenic route with photo opportunities`]
      };
    }
    
    return {
      from: fromLocation,
      to: toLocation,
      distance: 100,
      duration: '3 hours',
      mode: 'car',
      cost: 50,
      tips: ['Book transportation in advance']
    };
  }

  /**
   * Calculate transportation cost
   */
  calculateTransportCost(distance, mode) {
    const rates = {
      car: 0.5, // per km
      bus: 0.1,
      train: 0.15,
      flight: 2.0
    };
    return Math.round(distance * (rates[mode] || rates.car));
  }

  /**
   * Calculate estimated cost for a day's activities
   */
  calculateDayCost(activities, travelStyle) {
    const activityCost = activities.reduce((sum, activity) => sum + activity.cost, 0);
    
    // Add accommodation and meal costs based on travel style
    const dailyRates = {
      luxury: { accommodation: 150, meals: 60 },
      'mid-range': { accommodation: 70, meals: 35 },
      budget: { accommodation: 25, meals: 15 }
    };
    
    const rates = dailyRates[travelStyle] || dailyRates['mid-range'];
    return activityCost + rates.accommodation + rates.meals;
  }

  /**
   * Get local tips for a location
   */
  getLocalTips(location, travelStyle) {
    const generalTips = {
      'Munnar': [
        'Best visited during October to March for pleasant weather',
        'Carry warm clothes as temperatures can drop in evenings',
        'Book tea factory tours in advance'
      ],
      'Alleppey': [
        'Houseboat rates vary by season - book early for better deals',
        'Try traditional Kerala meals served on banana leaves',
        'Respect local fishing communities and their lifestyle'
      ],
      'Kochi': [
        'Fort Kochi is best explored on foot',
        'Evening is perfect for Chinese fishing nets photography',
        'Try local seafood at Jew Town area'
      ],
      'Thekkady': [
        'Early morning safaris have better wildlife spotting chances',
        'Wear earth-colored clothes for wildlife activities',
        'Purchase spices directly from plantations for authenticity'
      ]
    };
    
    const locationKey = Object.keys(generalTips).find(key => location.name.includes(key));
    return generalTips[locationKey] || ['Explore at your own pace and enjoy local interactions'];
  }

  /**
   * Generate a mock itinerary for demonstration
   * @param {ItineraryRequest} request 
   * @returns {GeneratedItinerary}
   */
  generateMockItinerary(request) {
    const { destination, duration, budget, interests, travelStyle } = request;
    const destinationKey = destination.toLowerCase().replace(/[^a-z]/g, '');
    const destinationData = MOCK_DESTINATIONS[destinationKey] || MOCK_DESTINATIONS.tokyo;

    // Create daily itineraries
    const days = [];
    let totalCost = 0;

    for (let day = 1; day <= duration; day++) {
      const dayActivities = this.selectActivitiesForDay(
        destinationData.activities,
        interests,
        travelStyle,
        budget / duration,
        day
      );

      const dayItinerary = {
        day,
        date: this.getDateForDay(request.dates?.startDate, day - 1),
        theme: this.getDayTheme(day, travelStyle),
        activities: dayActivities,
        transportation: {
          type: day === 1 ? 'Airport Transfer' : 'Local Transport',
          cost: day === 1 ? 50 : 15
        },
        estimatedCost: dayActivities.reduce((sum, activity) => sum + activity.cost, 0) + (day === 1 ? 50 : 15)
      };

      totalCost += dayItinerary.estimatedCost;
      days.push(dayItinerary);
    }

    return {
      id: `itinerary-${Date.now()}`,
      title: `${duration}-Day ${this.capitalize(destination)} Adventure`,
      description: `A carefully crafted ${duration}-day itinerary for ${destination} featuring ${travelStyle} experiences tailored to your interests.`,
      destination: this.capitalize(destination),
      duration,
      totalBudget: Math.round(totalCost),
      days,
      metadata: {
        generatedBy: 'TravelSensei AI',
        travelStyle,
        interests,
        confidence: 0.92
      },
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Select activities for a specific day based on preferences
   * @param {Activity[]} allActivities 
   * @param {string[]} interests 
   * @param {string} travelStyle 
   * @param {number} dailyBudget 
   * @param {number} dayNumber 
   * @returns {Activity[]}
   */
  selectActivitiesForDay(allActivities, interests, travelStyle, dailyBudget, dayNumber) {
    // Simple algorithm to select 2-3 activities per day
    const shuffled = [...allActivities].sort(() => 0.5 - Math.random());
    const selected = [];
    let currentBudget = 0;
    let currentTime = 0;

    for (const activity of shuffled) {
      if (selected.length >= 3) break;
      if (currentBudget + activity.cost > dailyBudget * 1.2) continue;
      if (currentTime + activity.duration > 10) continue;

      // Prefer activities that match user interests
      const matchesInterests = interests.some(interest => 
        activity.tags.includes(interest.toLowerCase()) ||
        activity.category.toLowerCase().includes(interest.toLowerCase())
      );

      if (matchesInterests || selected.length < 2) {
        selected.push(activity);
        currentBudget += activity.cost;
        currentTime += activity.duration;
      }
    }

    return selected.length > 0 ? selected : shuffled.slice(0, 2);
  }

  /**
   * Generate a theme for each day
   * @param {number} dayNumber 
   * @param {string} travelStyle 
   * @returns {string}
   */
  getDayTheme(dayNumber, travelStyle) {
    const themes = {
      adventure: ['Arrival & Orientation', 'Cultural Immersion', 'Nature Exploration', 'Local Experiences', 'Farewell Adventure'],
      cultural: ['Historical Discovery', 'Art & Museums', 'Local Traditions', 'Cultural Exchange', 'Heritage Sites'],
      relaxation: ['Gentle Arrival', 'Spa & Wellness', 'Scenic Views', 'Peaceful Exploration', 'Tranquil Departure'],
      luxury: ['VIP Arrival', 'Exclusive Experiences', 'Fine Dining', 'Premium Activities', 'Luxury Farewell'],
      budget: ['Efficient Arrival', 'Free Attractions', 'Local Markets', 'Budget Adventures', 'Smart Departure']
    };

    const styleThemes = themes[travelStyle] || themes.cultural;
    return styleThemes[Math.min(dayNumber - 1, styleThemes.length - 1)] || `Day ${dayNumber} Exploration`;
  }

  /**
   * Get date for a specific day of the trip
   * @param {string} startDate 
   * @param {number} dayOffset 
   * @returns {string}
   */
  getDateForDay(startDate, dayOffset) {
    if (!startDate) {
      const today = new Date();
      today.setDate(today.getDate() + dayOffset);
      return today.toISOString().split('T')[0];
    }

    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str 
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
   * Get travel suggestions based on user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object[]>} Array of destination suggestions
   */
  async getDestinationSuggestions(preferences) {
    await this.delay(1000);

    const suggestions = [
      {
        destination: 'Tokyo, Japan',
        match: 95,
        reasons: ['Cultural experiences', 'Food adventures', 'Technology'],
        imageUrl: '/images/tokyo.jpg',
        estimatedCost: '$2500-3500',
        bestTime: 'March-May, September-November'
      },
      {
        destination: 'Paris, France',
        match: 88,
        reasons: ['Art & Culture', 'Romance', 'Architecture'],
        imageUrl: '/images/paris.jpg',
        estimatedCost: '$3000-4000',
        bestTime: 'April-June, September-October'
      },
      {
        destination: 'Bali, Indonesia',
        match: 82,
        reasons: ['Relaxation', 'Nature', 'Wellness'],
        imageUrl: '/images/bali.jpg',
        estimatedCost: '$1500-2500',
        bestTime: 'April-October'
      }
    ];

    return suggestions;
  }

  /**
   * Refine an existing itinerary based on user feedback
   * @param {string} itineraryId 
   * @param {Object} feedback 
   * @returns {Promise<GeneratedItinerary>}
   */
  async refineItinerary(itineraryId, feedback) {
    await this.delay(1500);
    
    // In a real implementation, this would use AI to refine the itinerary
    // For now, return a mock refined version
    throw new Error('Itinerary refinement not implemented in demo version');
  }

  /**
   * Generate a generic itinerary for destinations not in our specialized database
   */
  generateGenericItinerary(request) {
    const { destination, duration, budget, interests, travelStyle, groupSize } = request;
    
    // Generate basic itinerary structure
    const days = [];
    const budgetPerDay = budget / duration;
    
    for (let day = 1; day <= duration; day++) {
      const activities = this.generateGenericActivities(destination, interests, day, budgetPerDay);
      
      days.push({
        day,
        date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: destination,
        theme: `Day ${day} - ${destination} Exploration`,
        activities,
        transportation: day === 1 ? null : { from: destination, to: destination, mode: 'walking', duration: '30 min', cost: 0 },
        estimatedCost: budgetPerDay,
        highlights: activities.slice(0, 2).map(a => a.name),
        tips: ['Explore at your own pace', 'Try local cuisine', 'Interact with locals']
      });
    }
    
    return {
      id: `itinerary_${Date.now()}`,
      destination,
      duration,
      budget,
      title: `${duration}-Day ${destination} Adventure`,
      description: `Discover the best of ${destination} with this ${duration}-day itinerary tailored to your interests.`,
      days,
      totalCost: budget,
      highlights: [
        `Explore ${destination}'s top attractions`,
        'Experience local culture and cuisine',
        'Discover hidden gems',
        'Create lasting memories'
      ],
      tips: [
        'Book accommodations in advance',
        'Learn basic local phrases',
        'Respect local customs',
        'Stay hydrated and safe',
        'Keep important documents secure'
      ],
      bestTimeToVisit: 'Research the best season for your destination',
      weatherInfo: 'Check current weather conditions before traveling',
      culturalInfo: 'Learn about local customs and traditions',
      routingStrategy: 'Generic exploration itinerary',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate generic activities for any destination
   */
  generateGenericActivities(destination, interests, dayNumber, budget) {
    const genericActivities = [
      {
        id: `activity_${dayNumber}_1`,
        name: 'City Walking Tour',
        description: `Explore ${destination} on foot and discover its landmarks`,
        category: 'cultural',
        duration: 3,
        cost: Math.min(budget * 0.2, 30),
        rating: 4.3,
        timeSlot: 'morning',
        location: { lat: 0, lng: 0, address: `${destination} City Center` }
      },
      {
        id: `activity_${dayNumber}_2`,
        name: 'Local Market Visit',
        description: `Experience the vibrant local markets of ${destination}`,
        category: 'cultural',
        duration: 2,
        cost: Math.min(budget * 0.15, 20),
        rating: 4.1,
        timeSlot: 'afternoon',
        location: { lat: 0, lng: 0, address: `${destination} Market District` }
      },
      {
        id: `activity_${dayNumber}_3`,
        name: 'Cultural Experience',
        description: `Immerse yourself in ${destination}'s culture and traditions`,
        category: 'cultural',
        duration: 2,
        cost: Math.min(budget * 0.25, 40),
        rating: 4.5,
        timeSlot: 'evening',
        location: { lat: 0, lng: 0, address: `${destination} Cultural Center` }
      }
    ];

    // Filter activities based on interests if provided
    if (interests && interests.length > 0) {
      return genericActivities.filter(activity => 
        interests.some(interest => 
          activity.category.includes(interest.toLowerCase()) ||
          activity.description.toLowerCase().includes(interest.toLowerCase())
        )
      ).slice(0, 2);
    }

    return genericActivities.slice(0, 2);
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;