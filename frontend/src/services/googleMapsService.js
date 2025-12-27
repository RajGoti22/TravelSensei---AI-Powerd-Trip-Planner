// Google Maps service for handling map interactions and API calls
class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
    this.map = null;
    this.markers = [];
  }

  // Initialize map with given center and zoom
  initializeMap(mapElement, center = { lat: 35.6762, lng: 139.6503 }, zoom = 12) {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return null;
    }

    this.map = new window.google.maps.Map(mapElement, {
      center,
      zoom,
      styles: this.getMapStyles(),
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    return this.map;
  }

  // Add a marker to the map
  addMarker(position, options = {}) {
    if (!this.map) return null;

    const marker = new window.google.maps.Marker({
      position,
      map: this.map,
      title: options.title || '',
      icon: options.icon || this.getMarkerIcon(options.type || 'default'),
      animation: options.animation || null,
    });

    // Add info window if content is provided
    if (options.infoContent) {
      const infoWindow = new window.google.maps.InfoWindow({
        content: options.infoContent,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        this.closeAllInfoWindows();
        infoWindow.open(this.map, marker);
      });

      marker.infoWindow = infoWindow;
    }

    this.markers.push(marker);
    return marker;
  }

  // Add multiple markers from an array of locations
  addMarkers(locations) {
    const bounds = new window.google.maps.LatLngBounds();
    
    locations.forEach(location => {
      const marker = this.addMarker(
        { lat: location.lat, lng: location.lng },
        {
          title: location.name,
          type: location.type,
          infoContent: this.createInfoWindowContent(location),
        }
      );

      if (marker) {
        bounds.extend(marker.getPosition());
      }
    });

    // Fit map to show all markers
    if (locations.length > 1) {
      this.map.fitBounds(bounds);
    }
  }

  // Clear all markers
  clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  // Close all info windows
  closeAllInfoWindows() {
    this.markers.forEach(marker => {
      if (marker.infoWindow) {
        marker.infoWindow.close();
      }
    });
  }

  // Get custom marker icons based on type
  getMarkerIcon(type) {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    const icons = {
      restaurant: `${baseUrl}restaurant.png`,
      hotel: `${baseUrl}lodging.png`,
      attraction: `${baseUrl}blue-dot.png`,
      activity: `${baseUrl}green-dot.png`,
      shopping: `${baseUrl}shopping.png`,
      transport: `${baseUrl}bus.png`,
      default: `${baseUrl}red-dot.png`,
    };

    return icons[type] || icons.default;
  }

  // Create content for info windows
  createInfoWindowContent(location) {
    return `
      <div style="max-width: 250px; padding: 10px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1976d2;">
          ${location.name}
        </h3>
        ${location.image ? `
          <img src="${location.image}" alt="${location.name}" 
               style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
        ` : ''}
        <p style="margin: 4px 0; font-size: 14px; color: #666;">
          ${location.description || ''}
        </p>
        ${location.rating ? `
          <div style="margin: 4px 0;">
            <span style="color: #ff9800;">★</span>
            <span style="font-weight: bold; margin-left: 2px;">${location.rating}</span>
            ${location.reviews ? `<span style="color: #666; margin-left: 4px;">(${location.reviews} reviews)</span>` : ''}
          </div>
        ` : ''}
        ${location.priceRange ? `
          <div style="margin: 4px 0; color: #4caf50; font-weight: bold;">
            ${location.priceRange}
          </div>
        ` : ''}
        ${location.address ? `
          <p style="margin: 4px 0; font-size: 12px; color: #888;">
            📍 ${location.address}
          </p>
        ` : ''}
      </div>
    `;
  }

  // Custom map styles for a modern look
  getMapStyles() {
    return [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ffffff' }, { lightness: 17 }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }, { lightness: 18 }],
      },
      {
        featureType: 'road.local',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }, { lightness: 16 }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#dedede' }, { lightness: 21 }],
      },
    ];
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Get directions between two points
  async getDirections(origin, destination, travelMode = 'DRIVING') {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode[travelMode],
        },
        (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  // Display directions on the map
  displayDirections(directionsResult) {
    if (!this.map) return;

    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: this.map,
      panel: null,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#1976d2',
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    directionsRenderer.setDirections(directionsResult);
    return directionsRenderer;
  }

  // Get nearby places using Places API
  async getNearbyPlaces(location, radius = 1000, type = 'tourist_attraction') {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps.places) {
        reject(new Error('Google Maps Places API not loaded'));
        return;
      }

      const service = new window.google.maps.places.PlacesService(this.map);
      
      service.nearbySearch(
        {
          location,
          radius,
          type,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        }
      );
    });
  }

  // Center map on user's location
  centerOnUserLocation() {
    if (!this.map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.map.setCenter(userLocation);
          this.map.setZoom(15);

          // Add marker for user's location
          this.addMarker(userLocation, {
            title: 'Your Location',
            type: 'user',
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }

  // Mock destinations data for different cities
  getDestinationCoordinates(destination) {
    const destinations = {
      'tokyo': { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
      'paris': { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
      'bali': { lat: -8.3405, lng: 115.0920, name: 'Bali, Indonesia' },
      'new york': { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
      'london': { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
      'rome': { lat: 41.9028, lng: 12.4964, name: 'Rome, Italy' },
      'sydney': { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia' },
      'bangkok': { lat: 13.7563, lng: 100.5018, name: 'Bangkok, Thailand' },
      'dubai': { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE' },
      'barcelona': { lat: 41.3851, lng: 2.1734, name: 'Barcelona, Spain' },
    };

    const key = destination.toLowerCase();
    return destinations[key] || destinations['tokyo'];
  }
}

export const googleMapsService = new GoogleMapsService();
export default googleMapsService;