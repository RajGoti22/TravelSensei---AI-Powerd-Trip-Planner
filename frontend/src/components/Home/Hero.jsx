import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Test backend connection
  // const testBackendConnection = async () => {
  //   try {
  //     const isHealthy = await apiService.healthCheck();
  //     console.log('Backend health check:', isHealthy ? 'Connected ✅' : 'Failed ❌');
  //     alert(isHealthy ? 'Backend Connected ✅' : 'Backend Connection Failed ❌');
  //   } catch (error) {
  //     console.error('Backend connection error:', error);
  //     alert('Backend Connection Failed ❌');
  //   }
  // };

  const handleStartPlanning = () => {
    if (user) {
      navigate('/itinerary/create');
    } else {
      navigate('/register');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '400px', sm: '450px', md: '500px' },
        minHeight: '400px',
        maxHeight: { xs: '400px', sm: '450px', md: '500px' },
        background: 'linear-gradient(to right bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Container maxWidth="lg" sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            animation: 'moveInBottom 0.8s ease-out 0.3s both',
            '@keyframes moveInBottom': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {/* <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 300,
              letterSpacing: { xs: '0.3rem', md: '0.5rem' },
              textTransform: 'uppercase',
              mb: 1.5,
              textShadow: '0 0.3rem 0.8rem rgba(0,0,0,0.5)',
              animation: 'moveInLeft 0.8s ease-out',
              '@keyframes moveInLeft': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(-30px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0)',
                },
              },
            }}
          >
            TravelSensei
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
              fontWeight: 400,
              letterSpacing: { xs: '0.15rem', md: '0.25rem' },
              mb: 3,
              textShadow: '0 0.3rem 0.8rem rgba(0,0,0,0.4)',
              animation: 'moveInRight 0.8s ease-out 0.2s both',
              '@keyframes moveInRight': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(30px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0)',
                },
              },
            }}
          >
            Your AI Travel Companion
          </Typography> */}
            <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.2rem', md: '3rem' },
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              mb: 1,
              textShadow: '0 6px 18px rgba(0,0,0,0.5)',
            }}
          >
            TravelSensei
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 500,
              letterSpacing: '.2em',
              mb: 3,
              textShadow: '0 6px 16px rgba(0,0,0,0.35)',
            }}
          >
            Your AI Travel Companion
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
            <Button
              variant="outlined"
              size="medium"
              onClick={handleStartPlanning}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: { xs: 2.5, sm: 2.5, md: 3 },
                py: { xs: 0.8, sm: 1, md: 1.2 },
                borderRadius: '50px',
                fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' },
                textTransform: 'uppercase',
                textShadow: '0 0.2rem 0.5rem rgba(0,0,0,0.4)',
                letterSpacing: { xs: '0.04rem', md: '0.08rem' },
                fontWeight: 600,
                borderWidth: '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                maxWidth: { xs: '200px', sm: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  borderColor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Start Your Journey
            </Button>
            {/* <Button
              variant="outlined"
              size="large"
              onClick={testBackendConnection}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: '50px',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1rem',
                fontWeight: 600,
                borderWidth: '2px',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 1rem 2rem rgba(0,0,0,0.2)',
                },
              }}
            >
              Test Connection
            </Button> */}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;