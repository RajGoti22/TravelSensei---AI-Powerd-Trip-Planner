import React from 'react';
import {
  Box,
  Container,
  Button,
  Typography,
} from '@mui/material';
import {
  Add,
} from '@mui/icons-material';
import ReviewStats from './ReviewStats';

const HeroSection = ({ stats, onWriteReview }) => {
  return (
    <Box
      sx={{
        minHeight: { xs: 180, sm: 210, md: 230 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          linear-gradient(rgba(10, 58, 100, 0.88), rgba(0, 0, 0, 0.78)),
          url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        <Box sx={{ textAlign: 'center', color: 'white', width: '100%' }}>
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '0.3px',
              mb: 0.5,
              fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.7rem' },
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            Community Reviews
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 1,
              fontWeight: 400,
              opacity: 0.95,
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.25,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)',
              fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem' },
            }}
          >
            Discover authentic travel experiences through our global community
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={onWriteReview}
              sx={{
                py: 0.5,
                px: 1.7,
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 1.5,
                background: '#fff',
                color: '#000',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  background: '#fff',
                },
              }}
            >
              Write Review
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
