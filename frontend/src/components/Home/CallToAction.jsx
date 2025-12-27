import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CallToAction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartPlanning = () => {
    if (user) {
      // For authenticated users, navigate to create new itinerary
      navigate('/itinerary/create');
    } else {
      // For non-authenticated users, navigate to sign up
      navigate('/register');
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        py: { xs: 4, md: 6 },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        {/* <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.2rem' },
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1rem',
            mb: 2,
            textShadow: '0 0 10px rgba(0,0,0,0.4)',
          }}
        >
          Start your journey today
        </Typography>
        <Typography
          variant="h5"
          sx={{ 
            mb: 3, 
            fontWeight: 300,
            fontSize: { xs: '1rem', md: '1.1rem' },
            opacity: 0.9,
            textShadow: '0 0 10px rgba(0,0,0,0.4)',
          }}
        >
          Join thousands of travelers who trust TravelSensei for their perfect trips.
        </Typography> */}
        <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', mb: 2.5, textShadow: '0 0 10px rgba(0,0,0,0.4)' }}>
          Start your journey today
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 400, fontSize: '1rem', opacity: 0.9, textShadow: '0 0 10px rgba(0,0,0,0.35)' }}>
          Join thousands of travelers who trust TravelSensei for their perfect trips.
        </Typography>
        <Button
          variant="outlined"
          size="medium"
          onClick={handleStartPlanning}
          sx={{
            borderColor: 'white',
            color: 'white',
            px: 4,
            py: 1.2,
            borderRadius: '50px',
            fontSize: { xs: '0.9rem', md: '1rem' },
            textTransform: 'uppercase',
            letterSpacing: '0.08rem',
            fontWeight: 600,
            borderWidth: '2px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
              borderColor: 'rgba(255,255,255,0.9)',
            },
          }}
        >
           {user ? 'Create New Itinerary' : 'Discover Your Adventure'} 
        </Button>
      </Container>
    </Box>
  );
};

export default CallToAction;