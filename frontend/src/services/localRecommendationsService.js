/**
 * Local Recommendations Service
 * Handles discovery of local experiences, events, restaurants, and activities
 */

import axios from 'axios';

/**
 * @typedef {Object} LocalRecommendation
 * @property {string} id - Unique recommendation ID
 * @property {string} name - Recommendation name
 * @property {string} description - Description
 * @property {string} category - Category (restaurant, activity, event, attraction)
 * @property {string} subcategory - Subcategory for filtering
 * @property {Object} location - Location details
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.address - Full address
 * @property {string} location.neighborhood - Neighborhood name
 * @property {number} rating - Rating (1-5)
 * @property {number} reviewCount - Number of reviews
 * @property {string} priceRange - Price range ($, $$, $$$, $$$$)
 * @property {number} estimatedCost - Estimated cost in USD
 * @property {string[]} images - Array of image URLs
 * @property {string[]} tags - Recommendation tags
 * @property {Object} contact - Contact information
 * @property {string} contact.phone - Phone number
 * @property {string} contact.website - Website URL
 * @property {Object} hours - Operating hours
 * @property {boolean} isOpen - Currently open status
 * @property {number} distance - Distance from user location (km)
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} LocalEvent
 * @property {string} id - Event ID
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {string} category - Event category
 * @property {Object} location - Event location
 * @property {Object} dateTime - Event date and time
 * @property {string} dateTime.start - Start date/time
 * @property {string} dateTime.end - End date/time
 * @property {number} price - Ticket price
 * @property {string} ticketUrl - Ticket purchase URL
 * @property {string[]} images - Event images
 * @property {Object} organizer - Event organizer info
 */

// Mock data for different cities
const MOCK_RECOMMENDATIONS = {
  'tokyo': {
    restaurants: [
      {
        id: 'tokyo-rest-1',
        name: 'Sukiyabashi Jiro',
        description: 'World-renowned sushi restaurant with exceptional omakase experience',
        category: 'restaurant',
        subcategory: 'sushi',
        location: {
          lat: 35.6712,
          lng: 139.7640,
          address: 'Tsukamoto Sogyo Building B1F, 4-2-15 Ginza, Chuo City, Tokyo',
          neighborhood: 'Ginza'
        },
        rating: 4.9,
        reviewCount: 2847,
        priceRange: '$$$$',
        estimatedCost: 300,
        images: ['/images/jiro-sushi.jpg'],
        tags: ['michelin-star', 'omakase', 'traditional', 'reservations-required'],
        contact: {
          phone: '+81-3-3535-3600',
          website: 'https://sukiyabashijiro.co.jp'
        },
        hours: { open: '11:30', close: '14:00' },
        isOpen: true,
        distance: 0,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-rest-2',
        name: 'Ramen Yashichi',
        description: 'Authentic tonkotsu ramen in a cozy neighborhood setting',
        category: 'restaurant',
        subcategory: 'ramen',
        location: {
          lat: 35.7096,
          lng: 139.8107,
          address: '2-14-1 Nippori, Arakawa City, Tokyo',
          neighborhood: 'Nippori'
        },
        rating: 4.6,
        reviewCount: 892,
        priceRange: '$',
        estimatedCost: 12,
        images: ['/images/ramen-yashichi.jpg'],
        tags: ['local-favorite', 'casual', 'late-night'],
        contact: {
          phone: '+81-3-3891-2345',
          website: null
        },
        hours: { open: '18:00', close: '02:00' },
        isOpen: true,
        distance: 2.3,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-rest-3',
        name: 'Tempura Kondo',
        description: 'Michelin-starred tempura restaurant with seasonal vegetables',
        category: 'restaurant',
        subcategory: 'tempura',
        location: {
          lat: 35.6698,
          lng: 139.7628,
          address: '9F Sakaguchi Building, 5-5-13 Ginza, Chuo City, Tokyo',
          neighborhood: 'Ginza'
        },
        rating: 4.8,
        reviewCount: 1543,
        priceRange: '$$$$',
        estimatedCost: 280,
        images: ['/images/tempura-kondo.jpg'],
        tags: ['michelin-star', 'tempura', 'traditional', 'fine-dining'],
        contact: {
          phone: '+81-3-5568-0923',
          website: 'https://tempura-kondo.com'
        },
        hours: { open: '12:00', close: '21:00' },
        isOpen: true,
        distance: 0.5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-rest-4',
        name: 'Tsukiji Outer Market',
        description: 'Fresh seafood and street food in historic fish market area',
        category: 'restaurant',
        subcategory: 'street-food',
        location: {
          lat: 35.6654,
          lng: 139.7707,
          address: '4 Chome Tsukiji, Chuo City, Tokyo',
          neighborhood: 'Tsukiji'
        },
        rating: 4.5,
        reviewCount: 8234,
        priceRange: '$$',
        estimatedCost: 25,
        images: ['/images/tsukiji-market.jpg'],
        tags: ['seafood', 'market', 'breakfast', 'authentic'],
        contact: {
          phone: '+81-3-3541-9444',
          website: 'https://www.tsukiji.or.jp'
        },
        hours: { open: '05:00', close: '14:00' },
        isOpen: true,
        distance: 1.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-rest-5',
        name: 'Nakiryu',
        description: 'Michelin-starred ramen shop famous for tantanmen',
        category: 'restaurant',
        subcategory: 'ramen',
        location: {
          lat: 35.7321,
          lng: 139.7153,
          address: '2-34-4 Minamiotsuka, Toshima City, Tokyo',
          neighborhood: 'Otsuka'
        },
        rating: 4.7,
        reviewCount: 2456,
        priceRange: '$',
        estimatedCost: 11,
        images: ['/images/nakiryu.jpg'],
        tags: ['michelin-star', 'ramen', 'spicy', 'budget-friendly'],
        contact: {
          phone: '+81-3-3981-0973',
          website: null
        },
        hours: { open: '11:00', close: '21:00' },
        isOpen: true,
        distance: 5.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-rest-6',
        name: 'Yakitori Torishiki',
        description: 'Intimate yakitori restaurant with exceptional grilled chicken',
        category: 'restaurant',
        subcategory: 'yakitori',
        location: {
          lat: 35.6470,
          lng: 139.6982,
          address: '1-14-1 Tomigaya, Shibuya City, Tokyo',
          neighborhood: 'Tomigaya'
        },
        rating: 4.9,
        reviewCount: 967,
        priceRange: '$$$',
        estimatedCost: 150,
        images: ['/images/torishiki.jpg'],
        tags: ['yakitori', 'intimate', 'omakase', 'reservations-required'],
        contact: {
          phone: '+81-3-3466-2140',
          website: null
        },
        hours: { open: '18:00', close: '23:00' },
        isOpen: true,
        distance: 3.5,
        lastUpdated: new Date().toISOString()
      }
    ],
    activities: [
      {
        id: 'tokyo-act-1',
        name: 'TeamLab Borderless',
        description: 'Immersive digital art museum with interactive installations',
        category: 'activity',
        subcategory: 'museum',
        location: {
          lat: 35.6249,
          lng: 139.7798,
          address: '1-3-8 Ariake, Koto City, Tokyo',
          neighborhood: 'Odaiba'
        },
        rating: 4.7,
        reviewCount: 15420,
        priceRange: '$$',
        estimatedCost: 32,
        images: ['/images/teamlab.jpg'],
        tags: ['art', 'digital', 'unique', 'instagram-worthy'],
        contact: {
          phone: '+81-3-6368-4292',
          website: 'https://borderless.teamlab.art'
        },
        hours: { open: '10:00', close: '19:00' },
        isOpen: true,
        distance: 3.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-2',
        name: 'Senso-ji Temple',
        description: 'Tokyo\'s oldest temple with iconic Thunder Gate and shopping street',
        category: 'activity',
        subcategory: 'temple',
        location: {
          lat: 35.7148,
          lng: 139.7967,
          address: '2-3-1 Asakusa, Taito City, Tokyo',
          neighborhood: 'Asakusa'
        },
        rating: 4.6,
        reviewCount: 32456,
        priceRange: 'Free',
        estimatedCost: 0,
        images: ['/images/sensoji.jpg'],
        tags: ['temple', 'historic', 'cultural', 'free'],
        contact: {
          phone: '+81-3-3842-0181',
          website: 'https://www.senso-ji.jp/english'
        },
        hours: { open: '06:00', close: '17:00' },
        isOpen: true,
        distance: 4.1,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-3',
        name: 'Shibuya Crossing Experience',
        description: 'World\'s busiest pedestrian crossing with rooftop viewing spots',
        category: 'activity',
        subcategory: 'landmark',
        location: {
          lat: 35.6595,
          lng: 139.7004,
          address: '2-2-1 Dogenzaka, Shibuya City, Tokyo',
          neighborhood: 'Shibuya'
        },
        rating: 4.4,
        reviewCount: 18765,
        priceRange: 'Free',
        estimatedCost: 0,
        images: ['/images/shibuya-crossing.jpg'],
        tags: ['landmark', 'photography', 'free', 'urban'],
        contact: {
          phone: null,
          website: null
        },
        hours: { open: '00:00', close: '23:59' },
        isOpen: true,
        distance: 2.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-4',
        name: 'Meiji Shrine Forest Walk',
        description: 'Peaceful forest shrine dedicated to Emperor Meiji',
        category: 'activity',
        subcategory: 'shrine',
        location: {
          lat: 35.6764,
          lng: 139.6993,
          address: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo',
          neighborhood: 'Harajuku'
        },
        rating: 4.7,
        reviewCount: 28934,
        priceRange: 'Free',
        estimatedCost: 0,
        images: ['/images/meiji-shrine.jpg'],
        tags: ['shrine', 'nature', 'peaceful', 'cultural', 'free'],
        contact: {
          phone: '+81-3-3379-5511',
          website: 'https://www.meijijingu.or.jp/english'
        },
        hours: { open: '06:00', close: '18:00' },
        isOpen: true,
        distance: 3.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-5',
        name: 'Tokyo Skytree Observation Deck',
        description: 'Japan\'s tallest structure with panoramic city views',
        category: 'activity',
        subcategory: 'observation-deck',
        location: {
          lat: 35.7101,
          lng: 139.8107,
          address: '1-1-2 Oshiage, Sumida City, Tokyo',
          neighborhood: 'Oshiage'
        },
        rating: 4.5,
        reviewCount: 24567,
        priceRange: '$$',
        estimatedCost: 28,
        images: ['/images/skytree.jpg'],
        tags: ['views', 'landmark', 'photography', 'family-friendly'],
        contact: {
          phone: '+81-570-55-0634',
          website: 'https://www.tokyo-skytree.jp/en'
        },
        hours: { open: '08:00', close: '22:00' },
        isOpen: true,
        distance: 6.3,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-6',
        name: 'Tsukiji Fish Market Tour',
        description: 'Guided tour of the world\'s largest wholesale fish market',
        category: 'activity',
        subcategory: 'tour',
        location: {
          lat: 35.6412,
          lng: 139.7700,
          address: '5-2-1 Toyosu, Koto City, Tokyo',
          neighborhood: 'Toyosu'
        },
        rating: 4.6,
        reviewCount: 5432,
        priceRange: '$$',
        estimatedCost: 45,
        images: ['/images/toyosu-tour.jpg'],
        tags: ['tour', 'food', 'cultural', 'morning'],
        contact: {
          phone: '+81-3-3520-8205',
          website: 'https://www.toyosu-market.or.jp'
        },
        hours: { open: '05:00', close: '15:00' },
        isOpen: true,
        distance: 4.7,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-7',
        name: 'Akihabara Gaming & Anime District',
        description: 'Explore electric town with anime shops, gaming arcades, and maid cafes',
        category: 'activity',
        subcategory: 'district',
        location: {
          lat: 35.6982,
          lng: 139.7731,
          address: 'Akihabara, Chiyoda City, Tokyo',
          neighborhood: 'Akihabara'
        },
        rating: 4.3,
        reviewCount: 15678,
        priceRange: '$',
        estimatedCost: 20,
        images: ['/images/akihabara.jpg'],
        tags: ['anime', 'gaming', 'shopping', 'entertainment'],
        contact: {
          phone: null,
          website: null
        },
        hours: { open: '10:00', close: '20:00' },
        isOpen: true,
        distance: 3.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-act-8',
        name: 'Imperial Palace East Gardens',
        description: 'Beautiful public gardens on the site of the former Edo Castle',
        category: 'activity',
        subcategory: 'garden',
        location: {
          lat: 35.6852,
          lng: 139.7528,
          address: '1-1 Chiyoda, Chiyoda City, Tokyo',
          neighborhood: 'Chiyoda'
        },
        rating: 4.5,
        reviewCount: 12345,
        priceRange: 'Free',
        estimatedCost: 0,
        images: ['/images/imperial-gardens.jpg'],
        tags: ['garden', 'historic', 'peaceful', 'free', 'nature'],
        contact: {
          phone: '+81-3-3213-1111',
          website: 'https://www.kunaicho.go.jp/e-event/higashigyoen.html'
        },
        hours: { open: '09:00', close: '17:00' },
        isOpen: true,
        distance: 2.1,
        lastUpdated: new Date().toISOString()
      }
    ],
    events: [
      {
        id: 'tokyo-event-1',
        title: 'Cherry Blossom Festival',
        description: 'Annual hanami celebration in Ueno Park with food stalls and performances',
        category: 'festival',
        location: {
          lat: 35.7145,
          lng: 139.7737,
          address: 'Ueno Park, Taito City, Tokyo',
          neighborhood: 'Ueno'
        },
        dateTime: {
          start: '2025-04-01T10:00:00Z',
          end: '2025-04-10T20:00:00Z'
        },
        price: 0,
        ticketUrl: null,
        images: ['/images/hanami.jpg'],
        organizer: {
          name: 'Tokyo Parks Association',
          contact: 'info@tokyoparks.jp'
        }
      },
      {
        id: 'tokyo-event-2',
        title: 'Sumida River Fireworks Festival',
        description: 'Japan\'s oldest fireworks festival with over 20,000 fireworks',
        category: 'festival',
        location: {
          lat: 35.7102,
          lng: 139.8051,
          address: 'Sumida River, Asakusa, Tokyo',
          neighborhood: 'Asakusa'
        },
        dateTime: {
          start: '2025-07-26T19:00:00Z',
          end: '2025-07-26T21:30:00Z'
        },
        price: 0,
        ticketUrl: null,
        images: ['/images/sumida-fireworks.jpg'],
        organizer: {
          name: 'Sumida River Fireworks Executive Committee',
          contact: 'info@sumidagawa-hanabi.com'
        }
      },
      {
        id: 'tokyo-event-3',
        title: 'Tokyo Game Show',
        description: 'One of the world\'s largest gaming conventions',
        category: 'conference',
        location: {
          lat: 35.6470,
          lng: 140.0345,
          address: 'Makuhari Messe, Chiba',
          neighborhood: 'Makuhari'
        },
        dateTime: {
          start: '2025-09-18T10:00:00Z',
          end: '2025-09-21T17:00:00Z'
        },
        price: 15,
        ticketUrl: 'https://www.tgs.cesa.or.jp',
        images: ['/images/tokyo-game-show.jpg'],
        organizer: {
          name: 'Computer Entertainment Supplier\'s Association',
          contact: 'info@tgs.cesa.or.jp'
        }
      }
    ],
    shopping: [
      {
        id: 'tokyo-shop-1',
        name: 'Don Quijote Shibuya',
        description: '24-hour mega discount store with everything from snacks to electronics',
        category: 'shopping',
        subcategory: 'department-store',
        location: {
          lat: 35.6617,
          lng: 139.6980,
          address: '28-6 Udagawacho, Shibuya City, Tokyo',
          neighborhood: 'Shibuya'
        },
        rating: 4.2,
        reviewCount: 9876,
        priceRange: '$',
        estimatedCost: 30,
        images: ['/images/donki.jpg'],
        tags: ['shopping', 'souvenirs', '24-hours', 'variety'],
        contact: {
          phone: '+81-3-5428-4086',
          website: 'https://www.donki.com'
        },
        hours: { open: '00:00', close: '23:59' },
        isOpen: true,
        distance: 2.5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-shop-2',
        name: 'Ginza Six',
        description: 'Luxury shopping complex with high-end fashion and art installations',
        category: 'shopping',
        subcategory: 'mall',
        location: {
          lat: 35.6707,
          lng: 139.7629,
          address: '6-10-1 Ginza, Chuo City, Tokyo',
          neighborhood: 'Ginza'
        },
        rating: 4.6,
        reviewCount: 5432,
        priceRange: '$$$$',
        estimatedCost: 200,
        images: ['/images/ginza-six.jpg'],
        tags: ['luxury', 'fashion', 'art', 'high-end'],
        contact: {
          phone: '+81-3-6891-3390',
          website: 'https://ginza6.tokyo'
        },
        hours: { open: '10:00', close: '20:30' },
        isOpen: true,
        distance: 0.4,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'tokyo-shop-3',
        name: 'Takeshita Street',
        description: 'Trendy pedestrian street famous for youth fashion and crepes',
        category: 'shopping',
        subcategory: 'street',
        location: {
          lat: 35.6703,
          lng: 139.7038,
          address: 'Jingumae, Shibuya City, Tokyo',
          neighborhood: 'Harajuku'
        },
        rating: 4.3,
        reviewCount: 12345,
        priceRange: '$$',
        estimatedCost: 40,
        images: ['/images/takeshita-street.jpg'],
        tags: ['fashion', 'youth-culture', 'trendy', 'street-food'],
        contact: {
          phone: null,
          website: null
        },
        hours: { open: '10:00', close: '20:00' },
        isOpen: true,
        distance: 3.1,
        lastUpdated: new Date().toISOString()
      }
    ]
  },
  'paris': {
    restaurants: [
      {
        id: 'paris-rest-1',
        name: 'L\'Ami Jean',
        description: 'Beloved bistro serving modern French cuisine with Basque influences',
        category: 'restaurant',
        subcategory: 'french',
        location: {
          lat: 48.8584,
          lng: 2.3053,
          address: '27 Rue Malar, 75007 Paris, France',
          neighborhood: '7th Arrondissement'
        },
        rating: 4.5,
        reviewCount: 3456,
        priceRange: '$$$',
        estimatedCost: 85,
        images: ['/images/lamijean.jpg'],
        tags: ['bistro', 'traditional', 'wine-pairing', 'reservations-recommended'],
        contact: {
          phone: '+33-1-47-05-86-89',
          website: 'https://lamijean.fr'
        },
        hours: { open: '19:00', close: '23:30' },
        isOpen: false,
        distance: 0.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-rest-2',
        name: 'Breizh Café',
        description: 'Authentic Breton crêperie using organic ingredients',
        category: 'restaurant',
        subcategory: 'creperie',
        location: {
          lat: 48.8621,
          lng: 2.3621,
          address: '109 Rue Vieille du Temple, 75003 Paris, France',
          neighborhood: 'Marais'
        },
        rating: 4.6,
        reviewCount: 4567,
        priceRange: '$$',
        estimatedCost: 25,
        images: ['/images/breizh-cafe.jpg'],
        tags: ['crêpes', 'organic', 'casual', 'brunch'],
        contact: {
          phone: '+33-1-42-72-13-77',
          website: 'https://breizhcafe.com'
        },
        hours: { open: '11:30', close: '23:00' },
        isOpen: true,
        distance: 1.5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-rest-3',
        name: 'Le Comptoir du Relais',
        description: 'Legendary bistro by Yves Camdeborde, father of bistronomy',
        category: 'restaurant',
        subcategory: 'bistro',
        location: {
          lat: 48.8518,
          lng: 2.3386,
          address: '9 Carrefour de l\'Odéon, 75006 Paris, France',
          neighborhood: 'Saint-Germain-des-Prés'
        },
        rating: 4.4,
        reviewCount: 5678,
        priceRange: '$$$',
        estimatedCost: 75,
        images: ['/images/comptoir-relais.jpg'],
        tags: ['bistronomy', 'french', 'traditional', 'popular'],
        contact: {
          phone: '+33-1-44-27-07-97',
          website: null
        },
        hours: { open: '12:00', close: '23:00' },
        isOpen: true,
        distance: 0.5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-rest-4',
        name: 'L\'As du Fallafel',
        description: 'Famous falafel shop in the Jewish Quarter of Le Marais',
        category: 'restaurant',
        subcategory: 'street-food',
        location: {
          lat: 48.8573,
          lng: 2.3595,
          address: '34 Rue des Rosiers, 75004 Paris, France',
          neighborhood: 'Marais'
        },
        rating: 4.5,
        reviewCount: 8765,
        priceRange: '$',
        estimatedCost: 12,
        images: ['/images/as-du-fallafel.jpg'],
        tags: ['falafel', 'street-food', 'budget-friendly', 'casual'],
        contact: {
          phone: '+33-1-48-87-63-60',
          website: null
        },
        hours: { open: '11:00', close: '23:00' },
        isOpen: true,
        distance: 1.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-rest-5',
        name: 'Septime',
        description: 'Michelin-starred neo-bistro with innovative seasonal menu',
        category: 'restaurant',
        subcategory: 'fine-dining',
        location: {
          lat: 48.8526,
          lng: 2.3799,
          address: '80 Rue de Charonne, 75011 Paris, France',
          neighborhood: '11th Arrondissement'
        },
        rating: 4.7,
        reviewCount: 2345,
        priceRange: '$$$$',
        estimatedCost: 120,
        images: ['/images/septime.jpg'],
        tags: ['michelin-star', 'innovative', 'seasonal', 'reservations-required'],
        contact: {
          phone: '+33-1-43-67-38-29',
          website: 'https://www.septime-charonne.fr'
        },
        hours: { open: '19:30', close: '22:00' },
        isOpen: false,
        distance: 2.3,
        lastUpdated: new Date().toISOString()
      }
    ],
    activities: [
      {
        id: 'paris-act-1',
        name: 'Louvre Private Tour',
        description: 'Skip-the-line private guided tour of the world\'s largest art museum',
        category: 'activity',
        subcategory: 'museum',
        location: {
          lat: 48.8606,
          lng: 2.3376,
          address: 'Rue de Rivoli, 75001 Paris, France',
          neighborhood: '1st Arrondissement'
        },
        rating: 4.8,
        reviewCount: 8923,
        priceRange: '$$$',
        estimatedCost: 120,
        images: ['/images/louvre-tour.jpg'],
        tags: ['art', 'history', 'guided-tour', 'skip-the-line'],
        contact: {
          phone: '+33-1-40-20-53-17',
          website: 'https://www.louvre.fr'
        },
        hours: { open: '09:00', close: '18:00' },
        isOpen: true,
        distance: 1.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-act-2',
        name: 'Eiffel Tower Summit Access',
        description: 'Skip-the-line tickets to the summit of Paris\'s iconic landmark',
        category: 'activity',
        subcategory: 'landmark',
        location: {
          lat: 48.8584,
          lng: 2.2945,
          address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
          neighborhood: '7th Arrondissement'
        },
        rating: 4.7,
        reviewCount: 45678,
        priceRange: '$$',
        estimatedCost: 35,
        images: ['/images/eiffel-tower.jpg'],
        tags: ['landmark', 'views', 'iconic', 'skip-the-line'],
        contact: {
          phone: '+33-892-70-12-39',
          website: 'https://www.toureiffel.paris/en'
        },
        hours: { open: '09:00', close: '23:45' },
        isOpen: true,
        distance: 0.3,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-act-3',
        name: 'Seine River Dinner Cruise',
        description: 'Evening cruise with gourmet dinner and live music',
        category: 'activity',
        subcategory: 'cruise',
        location: {
          lat: 48.8631,
          lng: 2.3364,
          address: 'Port de la Conférence, 75008 Paris, France',
          neighborhood: 'Champs-Élysées'
        },
        rating: 4.5,
        reviewCount: 6789,
        priceRange: '$$$',
        estimatedCost: 95,
        images: ['/images/seine-cruise.jpg'],
        tags: ['romantic', 'dinner', 'cruise', 'evening'],
        contact: {
          phone: '+33-1-76-64-14-45',
          website: 'https://www.bateauxparisiens.com'
        },
        hours: { open: '20:30', close: '23:00' },
        isOpen: false,
        distance: 1.1,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-act-4',
        name: 'Versailles Palace Day Trip',
        description: 'Full-day guided tour of the Palace of Versailles and gardens',
        category: 'activity',
        subcategory: 'tour',
        location: {
          lat: 48.8049,
          lng: 2.1204,
          address: 'Place d\'Armes, 78000 Versailles, France',
          neighborhood: 'Versailles'
        },
        rating: 4.8,
        reviewCount: 12345,
        priceRange: '$$$',
        estimatedCost: 145,
        images: ['/images/versailles.jpg'],
        tags: ['palace', 'history', 'day-trip', 'guided-tour'],
        contact: {
          phone: '+33-1-30-83-78-00',
          website: 'https://www.chateauversailles.fr'
        },
        hours: { open: '09:00', close: '18:30' },
        isOpen: true,
        distance: 20.5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-act-5',
        name: 'Montmartre Walking Tour',
        description: 'Guided walking tour of the artistic hilltop neighborhood',
        category: 'activity',
        subcategory: 'tour',
        location: {
          lat: 48.8867,
          lng: 2.3431,
          address: 'Place du Tertre, 75018 Paris, France',
          neighborhood: 'Montmartre'
        },
        rating: 4.6,
        reviewCount: 7890,
        priceRange: '$$',
        estimatedCost: 35,
        images: ['/images/montmartre-tour.jpg'],
        tags: ['walking-tour', 'art', 'historic', 'neighborhood'],
        contact: {
          phone: '+33-1-42-62-21-21',
          website: null
        },
        hours: { open: '10:00', close: '13:00' },
        isOpen: true,
        distance: 4.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-act-6',
        name: 'Musée d\'Orsay Visit',
        description: 'World-renowned museum of Impressionist and Post-Impressionist art',
        category: 'activity',
        subcategory: 'museum',
        location: {
          lat: 48.8600,
          lng: 2.3266,
          address: '1 Rue de la Légion d\'Honneur, 75007 Paris, France',
          neighborhood: '7th Arrondissement'
        },
        rating: 4.7,
        reviewCount: 23456,
        priceRange: '$$',
        estimatedCost: 16,
        images: ['/images/musee-orsay.jpg'],
        tags: ['art', 'impressionism', 'museum', 'culture'],
        contact: {
          phone: '+33-1-40-49-48-14',
          website: 'https://www.musee-orsay.fr'
        },
        hours: { open: '09:30', close: '18:00' },
        isOpen: true,
        distance: 0.6,
        lastUpdated: new Date().toISOString()
      }
    ],
    events: [
      {
        id: 'paris-event-1',
        title: 'Bastille Day Fireworks',
        description: 'Grand fireworks display at the Eiffel Tower for France\'s National Day',
        category: 'festival',
        location: {
          lat: 48.8584,
          lng: 2.2945,
          address: 'Champ de Mars, 75007 Paris, France',
          neighborhood: '7th Arrondissement'
        },
        dateTime: {
          start: '2025-07-14T21:00:00Z',
          end: '2025-07-14T23:30:00Z'
        },
        price: 0,
        ticketUrl: null,
        images: ['/images/bastille-day.jpg'],
        organizer: {
          name: 'City of Paris',
          contact: 'info@paris.fr'
        }
      },
      {
        id: 'paris-event-2',
        title: 'Paris Fashion Week',
        description: 'Bi-annual fashion week showcasing haute couture collections',
        category: 'fashion',
        location: {
          lat: 48.8566,
          lng: 2.3522,
          address: 'Various venues across Paris',
          neighborhood: 'Multiple'
        },
        dateTime: {
          start: '2025-09-23T10:00:00Z',
          end: '2025-10-01T22:00:00Z'
        },
        price: 500,
        ticketUrl: 'https://www.fhcm.paris',
        images: ['/images/paris-fashion-week.jpg'],
        organizer: {
          name: 'Fédération de la Haute Couture et de la Mode',
          contact: 'info@fhcm.paris'
        }
      }
    ],
    shopping: [
      {
        id: 'paris-shop-1',
        name: 'Galeries Lafayette',
        description: 'Historic department store with stunning Art Nouveau dome',
        category: 'shopping',
        subcategory: 'department-store',
        location: {
          lat: 48.8738,
          lng: 2.3322,
          address: '40 Boulevard Haussmann, 75009 Paris, France',
          neighborhood: '9th Arrondissement'
        },
        rating: 4.5,
        reviewCount: 15678,
        priceRange: '$$$',
        estimatedCost: 150,
        images: ['/images/galeries-lafayette.jpg'],
        tags: ['shopping', 'fashion', 'luxury', 'historic'],
        contact: {
          phone: '+33-1-42-82-34-56',
          website: 'https://www.galerieslafayette.com'
        },
        hours: { open: '10:00', close: '20:00' },
        isOpen: true,
        distance: 2.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'paris-shop-2',
        name: 'Marché aux Puces de Saint-Ouen',
        description: 'World\'s largest antiques market with over 2,000 dealers',
        category: 'shopping',
        subcategory: 'market',
        location: {
          lat: 48.9019,
          lng: 2.3445,
          address: 'Rue des Rosiers, 93400 Saint-Ouen, France',
          neighborhood: 'Saint-Ouen'
        },
        rating: 4.3,
        reviewCount: 8765,
        priceRange: '$$',
        estimatedCost: 50,
        images: ['/images/puces-saint-ouen.jpg'],
        tags: ['antiques', 'vintage', 'market', 'unique'],
        contact: {
          phone: '+33-1-40-11-77-36',
          website: 'https://www.marcheauxpuces-saintouen.com'
        },
        hours: { open: '10:00', close: '18:00' },
        isOpen: true,
        distance: 5.3,
        lastUpdated: new Date().toISOString()
      }
    ]
  },
  'bali': {
    restaurants: [
      {
        id: 'bali-rest-1',
        name: 'Locavore',
        description: 'Award-winning restaurant focusing on local Indonesian ingredients',
        category: 'restaurant',
        subcategory: 'fine-dining',
        location: {
          lat: -8.5139,
          lng: 115.2608,
          address: 'Jl. Dewisita No.10, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.7,
        reviewCount: 2156,
        priceRange: '$$$',
        estimatedCost: 95,
        images: ['/images/locavore.jpg'],
        tags: ['fine-dining', 'local-ingredients', 'tasting-menu', 'sustainable'],
        contact: {
          phone: '+62-361-977733',
          website: 'https://www.locavore.co.id'
        },
        hours: { open: '18:00', close: '23:00' },
        isOpen: true,
        distance: 0,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-rest-2',
        name: 'Warung Biah Biah',
        description: 'Authentic Balinese home cooking in traditional family warung',
        category: 'restaurant',
        subcategory: 'indonesian',
        location: {
          lat: -8.6539,
          lng: 115.1378,
          address: 'Jl. Raya Canggu No.88, Canggu, Badung Regency, Bali',
          neighborhood: 'Canggu'
        },
        rating: 4.6,
        reviewCount: 3456,
        priceRange: '$',
        estimatedCost: 8,
        images: ['/images/warung-biah-biah.jpg'],
        tags: ['authentic', 'local', 'budget-friendly', 'traditional'],
        contact: {
          phone: '+62-878-6234-5678',
          website: null
        },
        hours: { open: '08:00', close: '22:00' },
        isOpen: true,
        distance: 15.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-rest-3',
        name: 'Mozaic Restaurant',
        description: 'Fine dining with French-Indonesian fusion in garden setting',
        category: 'restaurant',
        subcategory: 'fine-dining',
        location: {
          lat: -8.5089,
          lng: 115.2632,
          address: 'Jl. Raya Sanggingan, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.8,
        reviewCount: 1987,
        priceRange: '$$$$',
        estimatedCost: 125,
        images: ['/images/mozaic.jpg'],
        tags: ['fine-dining', 'fusion', 'romantic', 'tasting-menu'],
        contact: {
          phone: '+62-361-975768',
          website: 'https://www.mozaic-bali.com'
        },
        hours: { open: '18:00', close: '22:30' },
        isOpen: true,
        distance: 0.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-rest-4',
        name: 'La Brisa',
        description: 'Beachfront restaurant with seafood and cocktails',
        category: 'restaurant',
        subcategory: 'seafood',
        location: {
          lat: -8.7012,
          lng: 115.1679,
          address: 'Jl. Pantai Batu Mejan, Canggu, Badung Regency, Bali',
          neighborhood: 'Echo Beach'
        },
        rating: 4.5,
        reviewCount: 7890,
        priceRange: '$$',
        estimatedCost: 35,
        images: ['/images/la-brisa.jpg'],
        tags: ['seafood', 'beach', 'sunset', 'cocktails'],
        contact: {
          phone: '+62-361-844-6784',
          website: 'https://www.labrisabali.com'
        },
        hours: { open: '11:00', close: '23:00' },
        isOpen: true,
        distance: 16.5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-rest-5',
        name: 'Bebek Bengil (Dirty Duck Diner)',
        description: 'Famous for crispy fried duck served with Balinese rice',
        category: 'restaurant',
        subcategory: 'indonesian',
        location: {
          lat: -8.5139,
          lng: 115.2598,
          address: 'Jl. Hanoman No.44, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.4,
        reviewCount: 5678,
        priceRange: '$$',
        estimatedCost: 25,
        images: ['/images/bebek-bengil.jpg'],
        tags: ['duck', 'traditional', 'popular', 'indonesian'],
        contact: {
          phone: '+62-361-975489',
          website: 'https://www.bebekbengil.co.id'
        },
        hours: { open: '10:00', close: '22:00' },
        isOpen: true,
        distance: 0.2,
        lastUpdated: new Date().toISOString()
      }
    ],
    activities: [
      {
        id: 'bali-act-1',
        name: 'Rice Terrace Sunrise Trek',
        description: 'Early morning guided trek through UNESCO World Heritage rice terraces',
        category: 'activity',
        subcategory: 'outdoor',
        location: {
          lat: -8.3675,
          lng: 115.2189,
          address: 'Tegallalang Rice Terrace, Gianyar Regency, Bali',
          neighborhood: 'Tegallalang'
        },
        rating: 4.9,
        reviewCount: 4567,
        priceRange: '$$',
        estimatedCost: 45,
        images: ['/images/rice-terrace-trek.jpg'],
        tags: ['nature', 'sunrise', 'unesco', 'photography'],
        contact: {
          phone: '+62-812-3456-7890',
          website: 'https://balitrekking.com'
        },
        hours: { open: '05:00', close: '09:00' },
        isOpen: false,
        distance: 15.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-act-2',
        name: 'Tanah Lot Temple Sunset',
        description: 'Visit the iconic sea temple at sunset with traditional dance performance',
        category: 'activity',
        subcategory: 'temple',
        location: {
          lat: -8.6211,
          lng: 115.0868,
          address: 'Beraban, Kediri, Tabanan Regency, Bali',
          neighborhood: 'Tanah Lot'
        },
        rating: 4.6,
        reviewCount: 12345,
        priceRange: '$',
        estimatedCost: 10,
        images: ['/images/tanah-lot.jpg'],
        tags: ['temple', 'sunset', 'cultural', 'photography'],
        contact: {
          phone: '+62-361-880361',
          website: 'https://www.tanahlot.net'
        },
        hours: { open: '07:00', close: '19:00' },
        isOpen: true,
        distance: 28.3,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-act-3',
        name: 'Mount Batur Sunrise Hiking',
        description: 'Trek to the summit of active volcano for spectacular sunrise views',
        category: 'activity',
        subcategory: 'hiking',
        location: {
          lat: -8.2425,
          lng: 115.3751,
          address: 'Kintamani, Bangli Regency, Bali',
          neighborhood: 'Kintamani'
        },
        rating: 4.8,
        reviewCount: 8901,
        priceRange: '$$',
        estimatedCost: 55,
        images: ['/images/mount-batur.jpg'],
        tags: ['hiking', 'sunrise', 'adventure', 'volcano'],
        contact: {
          phone: '+62-878-6123-4567',
          website: 'https://www.mountbaturtrekking.com'
        },
        hours: { open: '03:00', close: '09:00' },
        isOpen: false,
        distance: 35.6,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-act-4',
        name: 'Tirta Empul Holy Water Temple',
        description: 'Ancient water purification temple with natural spring pools',
        category: 'activity',
        subcategory: 'temple',
        location: {
          lat: -8.4153,
          lng: 115.3150,
          address: 'Manukaya, Tampaksiring, Gianyar Regency, Bali',
          neighborhood: 'Tampaksiring'
        },
        rating: 4.5,
        reviewCount: 6789,
        priceRange: '$',
        estimatedCost: 5,
        images: ['/images/tirta-empul.jpg'],
        tags: ['temple', 'spiritual', 'cultural', 'water'],
        contact: {
          phone: '+62-361-996251',
          website: null
        },
        hours: { open: '09:00', close: '17:00' },
        isOpen: true,
        distance: 18.7,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-act-5',
        name: 'Ubud Monkey Forest',
        description: 'Sacred forest sanctuary home to over 700 Balinese long-tailed monkeys',
        category: 'activity',
        subcategory: 'nature',
        location: {
          lat: -8.5188,
          lng: 115.2585,
          address: 'Jl. Monkey Forest, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.3,
        reviewCount: 15678,
        priceRange: '$',
        estimatedCost: 7,
        images: ['/images/monkey-forest.jpg'],
        tags: ['wildlife', 'nature', 'family-friendly', 'temple'],
        contact: {
          phone: '+62-361-971304',
          website: 'https://www.monkeyforestubud.com'
        },
        hours: { open: '08:30', close: '17:30' },
        isOpen: true,
        distance: 0.6,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-act-6',
        name: 'Waterbom Bali',
        description: 'Award-winning waterpark with thrilling slides and tropical gardens',
        category: 'activity',
        subcategory: 'waterpark',
        location: {
          lat: -8.7183,
          lng: 115.1719,
          address: 'Jl. Kartika Plaza, Kuta, Badung Regency, Bali',
          neighborhood: 'Kuta'
        },
        rating: 4.7,
        reviewCount: 9876,
        priceRange: '$$',
        estimatedCost: 38,
        images: ['/images/waterbom.jpg'],
        tags: ['waterpark', 'family-friendly', 'adventure', 'fun'],
        contact: {
          phone: '+62-361-755676',
          website: 'https://www.waterbom-bali.com'
        },
        hours: { open: '09:00', close: '18:00' },
        isOpen: true,
        distance: 25.4,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-act-7',
        name: 'Balinese Cooking Class',
        description: 'Learn to cook traditional Balinese dishes with market tour',
        category: 'activity',
        subcategory: 'cooking-class',
        location: {
          lat: -8.5095,
          lng: 115.2625,
          address: 'Jl. Hanoman, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.9,
        reviewCount: 3456,
        priceRange: '$$',
        estimatedCost: 42,
        images: ['/images/cooking-class.jpg'],
        tags: ['cooking', 'cultural', 'food', 'hands-on'],
        contact: {
          phone: '+62-361-978555',
          website: 'https://www.balicookingclass.com'
        },
        hours: { open: '08:00', close: '14:00' },
        isOpen: true,
        distance: 0.4,
        lastUpdated: new Date().toISOString()
      }
    ],
    events: [
      {
        id: 'bali-event-1',
        title: 'Bali Arts Festival',
        description: 'Month-long celebration of Balinese culture, art, music, and dance',
        category: 'festival',
        location: {
          lat: -8.6705,
          lng: 115.2126,
          address: 'Taman Budaya Art Centre, Denpasar, Bali',
          neighborhood: 'Denpasar'
        },
        dateTime: {
          start: '2025-06-14T09:00:00Z',
          end: '2025-07-12T21:00:00Z'
        },
        price: 5,
        ticketUrl: 'https://www.baliartsfestival.com',
        images: ['/images/bali-arts-festival.jpg'],
        organizer: {
          name: 'Bali Provincial Government',
          contact: 'info@baliartsfestival.com'
        }
      },
      {
        id: 'bali-event-2',
        title: 'Nyepi (Day of Silence)',
        description: 'Balinese New Year with complete silence and darkness across the island',
        category: 'cultural',
        location: {
          lat: -8.4095,
          lng: 115.1889,
          address: 'Island-wide, Bali',
          neighborhood: 'All'
        },
        dateTime: {
          start: '2025-03-29T06:00:00Z',
          end: '2025-03-30T06:00:00Z'
        },
        price: 0,
        ticketUrl: null,
        images: ['/images/nyepi.jpg'],
        organizer: {
          name: 'Parisada Hindu Dharma Indonesia',
          contact: null
        }
      }
    ],
    shopping: [
      {
        id: 'bali-shop-1',
        name: 'Ubud Art Market',
        description: 'Traditional market selling handcrafted souvenirs, textiles, and art',
        category: 'shopping',
        subcategory: 'market',
        location: {
          lat: -8.5069,
          lng: 115.2585,
          address: 'Jl. Raya Ubud, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.2,
        reviewCount: 7890,
        priceRange: '$',
        estimatedCost: 20,
        images: ['/images/ubud-market.jpg'],
        tags: ['market', 'handicrafts', 'souvenirs', 'art'],
        contact: {
          phone: null,
          website: null
        },
        hours: { open: '08:00', close: '18:00' },
        isOpen: true,
        distance: 0.3,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-shop-2',
        name: 'Seminyak Village',
        description: 'Upscale shopping complex with international and local boutiques',
        category: 'shopping',
        subcategory: 'mall',
        location: {
          lat: -8.6862,
          lng: 115.1632,
          address: 'Jl. Kayu Jati No.8, Seminyak, Badung Regency, Bali',
          neighborhood: 'Seminyak'
        },
        rating: 4.4,
        reviewCount: 3456,
        priceRange: '$$$',
        estimatedCost: 100,
        images: ['/images/seminyak-village.jpg'],
        tags: ['shopping', 'fashion', 'boutiques', 'upscale'],
        contact: {
          phone: '+62-361-738409',
          website: 'https://www.seminyakvillage.com'
        },
        hours: { open: '10:00', close: '22:00' },
        isOpen: true,
        distance: 20.1,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bali-shop-3',
        name: 'Threads of Life Textile Gallery',
        description: 'Fair-trade gallery showcasing traditional Indonesian textiles',
        category: 'shopping',
        subcategory: 'gallery',
        location: {
          lat: -8.5076,
          lng: 115.2622,
          address: 'Jl. Kajeng No.24, Ubud, Gianyar Regency, Bali',
          neighborhood: 'Ubud'
        },
        rating: 4.8,
        reviewCount: 1234,
        priceRange: '$$',
        estimatedCost: 75,
        images: ['/images/threads-of-life.jpg'],
        tags: ['textiles', 'art', 'fair-trade', 'cultural'],
        contact: {
          phone: '+62-361-972187',
          website: 'https://www.threadsoflife.com'
        },
        hours: { open: '10:00', close: '19:00' },
        isOpen: true,
        distance: 0.5,
        lastUpdated: new Date().toISOString()
      }
    ]
  }
};

class LocalRecommendationsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_LOCAL_API_KEY || 'mock-key';
    this.baseURL = process.env.REACT_APP_LOCAL_API_URL || 'mock-service';
  }

  /**
   * Get local recommendations for a destination
   * @param {string} destination - Destination city
   * @param {Object} filters - Filter options
   * @param {string[]} filters.categories - Categories to include
   * @param {number} filters.maxDistance - Maximum distance in km
   * @param {string} filters.priceRange - Price range filter
   * @param {number} filters.minRating - Minimum rating
   * @param {boolean} filters.openNow - Only show currently open places
   * @returns {Promise<LocalRecommendation[]>}
   */
  async getRecommendations(destination, filters = {}) {
    try {
      await this.delay(800);
      
      const destinationKey = destination.toLowerCase().split(',')[0].replace(/[^a-z]/g, '');
      const cityData = MOCK_RECOMMENDATIONS[destinationKey] || MOCK_RECOMMENDATIONS.tokyo;
      
      let recommendations = [];
      
      // Combine all recommendation types
      if (cityData.restaurants) recommendations.push(...cityData.restaurants);
      if (cityData.activities) recommendations.push(...cityData.activities);
      if (cityData.attractions) recommendations.push(...cityData.attractions);
      
      // Apply filters
      recommendations = this.applyFilters(recommendations, filters);
      
      // Sort by rating and distance
      recommendations.sort((a, b) => {
        const ratingDiff = b.rating - a.rating;
        return ratingDiff !== 0 ? ratingDiff : a.distance - b.distance;
      });
      
      return recommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch local recommendations');
    }
  }

  /**
   * Get local events for a destination
   * @param {string} destination - Destination city
   * @param {Object} dateRange - Date range for events
   * @param {string} dateRange.start - Start date
   * @param {string} dateRange.end - End date
   * @returns {Promise<LocalEvent[]>}
   */
  async getEvents(destination, dateRange = {}) {
    try {
      await this.delay(600);
      
      const destinationKey = destination.toLowerCase().split(',')[0].replace(/[^a-z]/g, '');
      const cityData = MOCK_RECOMMENDATIONS[destinationKey] || MOCK_RECOMMENDATIONS.tokyo;
      
      let events = cityData.events || [];
      
      // Filter by date range if provided
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        events = events.filter(event => {
          const eventStart = new Date(event.dateTime.start);
          const eventEnd = new Date(event.dateTime.end);
          
          return (eventStart >= startDate && eventStart <= endDate) ||
                 (eventEnd >= startDate && eventEnd <= endDate) ||
                 (eventStart <= startDate && eventEnd >= endDate);
        });
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch local events');
    }
  }

  /**
   * Get recommendations by specific category
   * @param {string} destination - Destination city
   * @param {string} category - Category (restaurant, activity, attraction)
   * @param {Object} filters - Additional filters
   * @returns {Promise<LocalRecommendation[]>}
   */
  async getByCategory(destination, category, filters = {}) {
    const allRecommendations = await this.getRecommendations(destination, {
      ...filters,
      categories: [category]
    });
    
    return allRecommendations.filter(rec => rec.category === category);
  }

  /**
   * Search recommendations by query
   * @param {string} destination - Destination city
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<LocalRecommendation[]>}
   */
  async searchRecommendations(destination, query, filters = {}) {
    const allRecommendations = await this.getRecommendations(destination, filters);
    
    const searchTerm = query.toLowerCase();
    
    return allRecommendations.filter(rec => 
      rec.name.toLowerCase().includes(searchTerm) ||
      rec.description.toLowerCase().includes(searchTerm) ||
      rec.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      rec.subcategory.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get trending recommendations
   * @param {string} destination - Destination city
   * @param {number} limit - Number of recommendations to return
   * @returns {Promise<LocalRecommendation[]>}
   */
  async getTrending(destination, limit = 10) {
    try {
      const recommendations = await this.getRecommendations(destination);
      
      // Sort by a combination of rating and review count to determine "trending"
      const trending = recommendations
        .sort((a, b) => {
          const scoreA = a.rating * Math.log(a.reviewCount + 1);
          const scoreB = b.rating * Math.log(b.reviewCount + 1);
          return scoreB - scoreA;
        })
        .slice(0, limit);
      
      return trending;
    } catch (error) {
      console.error('Error fetching trending recommendations:', error);
      throw error;
    }
  }

  /**
   * Get recommendations near a specific location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in km
   * @returns {Promise<LocalRecommendation[]>}
   */
  async getNearby(lat, lng, radius = 5) {
    try {
      await this.delay(500);
      
      // For demo purposes, return mock nearby recommendations
      // In a real app, this would use geolocation APIs
      const mockNearby = [
        {
          id: 'nearby-1',
          name: 'Local Coffee Shop',
          description: 'Cozy neighborhood coffee shop with artisanal brews',
          category: 'restaurant',
          subcategory: 'cafe',
          location: { lat, lng, address: 'Near your location', neighborhood: 'Local' },
          rating: 4.3,
          reviewCount: 156,
          priceRange: '$',
          estimatedCost: 8,
          images: ['/images/local-cafe.jpg'],
          tags: ['coffee', 'local', 'wifi'],
          contact: { phone: null, website: null },
          hours: { open: '07:00', close: '19:00' },
          isOpen: true,
          distance: 0.3,
          lastUpdated: new Date().toISOString()
        }
      ];
      
      return mockNearby;
    } catch (error) {
      console.error('Error fetching nearby recommendations:', error);
      throw error;
    }
  }

  /**
   * Apply filters to recommendations
   * @param {LocalRecommendation[]} recommendations 
   * @param {Object} filters 
   * @returns {LocalRecommendation[]}
   */
  applyFilters(recommendations, filters) {
    let filtered = [...recommendations];
    
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(rec => filters.categories.includes(rec.category));
    }
    
    if (filters.maxDistance) {
      filtered = filtered.filter(rec => rec.distance <= filters.maxDistance);
    }
    
    if (filters.priceRange) {
      filtered = filtered.filter(rec => rec.priceRange === filters.priceRange);
    }
    
    if (filters.minRating) {
      filtered = filtered.filter(rec => rec.rating >= filters.minRating);
    }
    
    if (filters.openNow) {
      filtered = filtered.filter(rec => rec.isOpen);
    }
    
    if (filters.subcategory) {
      filtered = filtered.filter(rec => rec.subcategory === filters.subcategory);
    }
    
    return filtered;
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
   * Get available categories for a destination
   * @param {string} destination - Destination city
   * @returns {Promise<string[]>}
   */
  async getCategories(destination) {
    try {
      const recommendations = await this.getRecommendations(destination);
      const categories = [...new Set(recommendations.map(rec => rec.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['restaurant', 'activity', 'attraction'];
    }
  }

  /**
   * Get subcategories for a specific category
   * @param {string} destination - Destination city
   * @param {string} category - Main category
   * @returns {Promise<string[]>}
   */
  async getSubcategories(destination, category) {
    try {
      const recommendations = await this.getByCategory(destination, category);
      const subcategories = [...new Set(recommendations.map(rec => rec.subcategory))];
      return subcategories.sort();
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }
}

// Export singleton instance
export const localRecommendationsService = new LocalRecommendationsService();
export default localRecommendationsService;