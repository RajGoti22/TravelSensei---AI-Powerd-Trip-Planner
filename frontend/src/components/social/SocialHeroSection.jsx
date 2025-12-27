import React from 'react';
import { Box, Typography } from '@mui/material';

const SocialHeroSection = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: { xs: 'auto', sm: 180, md: 200 },
        background: `linear-gradient(120deg, rgba(31,41,55,0.85) 0%, rgba(0,0,0,0.7) 100%), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        py: { xs: 3, sm: 4, md: 5 },
        mb: { xs: 2, sm: 2.5 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: 'white',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
          mb: { xs: 0.8, sm: 1.2 },
          textAlign: 'center',
        }}
      >
        Social Feed
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          opacity: 0.95,
          fontWeight: 400,
          fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem' },
          textAlign: 'center',
          maxWidth: { xs: '90%', sm: 550 },
          mx: 'auto',
          textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          lineHeight: 1.4,
        }}
      >
        Discover and share travel moments with the community. Post updates, tips, and inspiration from your journeys!
      </Typography>
    </Box>
  );
};

export default SocialHeroSection;
