import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { Add, Explore as ExploreIcon } from '@mui/icons-material';

const DashboardEmptyState = ({ navigate }) => (
  <Paper
    sx={{
      p: { xs: 3, md: 5 },
      textAlign: 'center',
      borderRadius: '16px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
      border: '1px solid rgba(14,30,37,0.04)',
      boxShadow: '0 12px 30px rgba(14,30,37,0.06)',
      mb: 4,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <ExploreIcon sx={{ fontSize: 56, color: '#000000', opacity: 0.95 }} />
    </Box>
    <Typography
      variant="h5"
      sx={{
        mb: 1,
        fontWeight: 700,
        color: 'text.primary',
      }}
    >
      Start Your Journey
    </Typography>
    <Typography
      variant="body2"
      sx={{
        mb: 3,
        color: 'text.secondary',
        fontSize: '1rem',
        lineHeight: 1.6,
        maxWidth: '640px',
        mx: 'auto',
      }}
    >
      No itineraries yet. Create your first travel adventure and start planning your dream destination!
    </Typography>
    <Button
      variant="contained"
      size="medium"
      startIcon={<Add />}
      onClick={() => navigate('/itinerary/create')}
      sx={{
        borderRadius: '12px',
        px: 3,
        py: 1.25,
        fontSize: '1rem',
        fontWeight: 700,
        textTransform: 'none',
        background: '#000000',
        color: 'white',
        width: { xs: '100%', sm: 'auto' },
        display: { xs: 'block', sm: 'inline-flex' },
        '&:hover': {
          background: '#212121',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        },
        transition: 'all 0.2s ease',
      }}
    >
      Create Your First Adventure
    </Button>
  </Paper>
);

export default DashboardEmptyState;
