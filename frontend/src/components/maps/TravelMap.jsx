import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  MyLocation,
  Refresh,
  Fullscreen,
  Close,
} from '@mui/icons-material';
import { googleMapsService } from '../../services/googleMapsService';

const MapComponent = ({
  center,
  zoom = 12,
  height = '400px',
  locations = [],
  showDirections = false,
  enableUserLocation = true,
  onLocationClick,
  className,
  style,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      try {
        const newMap = googleMapsService.initializeMap(
          mapRef.current,
          center || { lat: 35.6762, lng: 139.6503 },
          zoom
        );
        
        setMap(newMap);
        setIsLoading(false);

        // Add locations as markers
        if (locations && locations.length > 0) {
          googleMapsService.addMarkers(locations);
        }
      } catch (err) {
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (map && locations && locations.length > 0) {
      googleMapsService.clearMarkers();
      googleMapsService.addMarkers(locations);
    }
  }, [locations, map]);

  const handleCenterOnUser = () => {
    if (map) {
      googleMapsService.centerOnUserLocation();
    }
  };

  const handleRefresh = () => {
    if (map && locations) {
      googleMapsService.clearMarkers();
      googleMapsService.addMarkers(locations);
    }
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ height, display: 'flex', alignItems: 'center' }}
      >
        {error}
        <Button onClick={() => setError(null)} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box 
      className={className}
      style={style}
      sx={{ 
        position: 'relative', 
        height,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Map Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {enableUserLocation && (
          <IconButton
            onClick={handleCenterOnUser}
            sx={{
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' },
            }}
            size="small"
          >
            <MyLocation fontSize="small" />
          </IconButton>
        )}
        <IconButton
          onClick={handleRefresh}
          sx={{
            bgcolor: 'white',
            boxShadow: 1,
            '&:hover': { bgcolor: 'grey.100' },
          }}
          size="small"
        >
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

const GoogleMapsWrapper = (props) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
  
  const render = (status) => {
    switch (status) {
      case 'LOADING':
        return (
          <Box
            sx={{
              height: props.height || '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Google Maps...</Typography>
          </Box>
        );
      case 'FAILURE':
        return (
          <Alert 
            severity="error"
            sx={{ height: props.height || '400px', display: 'flex', alignItems: 'center' }}
          >
            Failed to load Google Maps. Please check your API key and internet connection.
          </Alert>
        );
      case 'SUCCESS':
        return <MapComponent {...props} />;
      default:
        return null;
    }
  };

  return (
    <Wrapper
      apiKey={apiKey}
      render={render}
      libraries={['places', 'geometry']}
    />
  );
};

// Enhanced Map Component with additional features
const TravelMap = ({
  destination = 'Tokyo',
  recommendations = [],
  itinerary = null,
  showItineraryRoute = false,
  height = '500px',
  onLocationSelect,
  ...otherProps
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLocations, setMapLocations] = useState([]);

  useEffect(() => {
    // Convert recommendations to map locations format
    const locations = recommendations.map((rec, index) => ({
      id: rec.id || index,
      lat: rec.coordinates?.lat || generateRandomCoordinates(destination).lat,
      lng: rec.coordinates?.lng || generateRandomCoordinates(destination).lng,
      name: rec.name,
      type: rec.category || 'attraction',
      description: rec.description,
      rating: rec.rating,
      reviews: rec.reviews,
      priceRange: rec.priceRange,
      image: rec.image,
      address: rec.location,
    }));

    setMapLocations(locations);
  }, [recommendations, destination]);

  // Generate random coordinates around destination center (for demo purposes)
  const generateRandomCoordinates = (dest) => {
    const center = googleMapsService.getDestinationCoordinates(dest);
    const radius = 0.05; // ~5km radius
    
    return {
      lat: center.lat + (Math.random() - 0.5) * radius,
      lng: center.lng + (Math.random() - 0.5) * radius,
    };
  };

  const destinationCenter = googleMapsService.getDestinationCoordinates(destination);

  return (
    <Box>
      <GoogleMapsWrapper
        center={destinationCenter}
        locations={mapLocations}
        height={height}
        onLocationClick={setSelectedLocation}
        {...otherProps}
      />

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" component="div">
                  {selectedLocation.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedLocation.description}
                </Typography>
                {selectedLocation.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">
                      ★ {selectedLocation.rating}
                    </Typography>
                    {selectedLocation.reviews && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({selectedLocation.reviews} reviews)
                      </Typography>
                    )}
                  </Box>
                )}
                {selectedLocation.priceRange && (
                  <Typography variant="body2" color="primary">
                    {selectedLocation.priceRange}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={() => setSelectedLocation(null)}>
                <Close />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TravelMap;
export { GoogleMapsWrapper, MapComponent };