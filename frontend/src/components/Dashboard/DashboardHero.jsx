import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const DashboardHero = ({ user, navigate }) => (
  <Box
    sx={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1418846531910-2b7bb1043512?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      py: { xs: 3, md: 3.5 },
      mb: 3,
      color: 'white',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      minHeight: { xs: '200px', sm: '230px', md: '260px' },
      clipPath: { xs: 'none', md: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' },
      overflow: 'hidden',
    }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: { xs: '0.08rem', md: '0.1rem' },
          mb: 1,
          textShadow: '0 0.2rem 0.6rem rgba(0,0,0,0.7)',
        }}
      >
        Your Adventures
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
          fontWeight: 300,
          mb: 2,
          maxWidth: '600px',
          lineHeight: 1.5,
          textShadow: '0 0.2rem 0.6rem rgba(0,0,0,0.5)',
        }}
      >
        Welcome back, {user?.name || 'Explorer'}! Manage your travel itineraries and continue planning your next amazing journey.
      </Typography>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Add />}
        onClick={() => navigate('/itinerary/create')}
        sx={{
          borderColor: 'rgba(255,255,255,0.9)',
          color: 'white',
          borderRadius: '20px',
          borderWidth: '2px',
          textShadow: '0 0.15rem 0.3rem rgba(0,0,0,0.3)',
          px: { xs: 2, md: 2.5 },
          py: { xs: 0.7, md: 0.8 },
          fontSize: { xs: '0.8rem', md: '0.85rem' },
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.02rem',
          background: 'transparent',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.15)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            borderColor: 'rgba(255,255,255,1)',
          }
        }}
      >
        Create New Adventure
      </Button>
    </Container>
  </Box>
);

export default DashboardHero;
