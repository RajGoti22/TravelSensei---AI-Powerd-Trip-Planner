import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button 
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const featureList = [
  {
    icon: '🤖',
    title: 'AI-Powered Planning',
    desc: 'Get personalized travel recommendations based on your preferences and budget.'
  },
  {
    icon: '🗺️',
    title: 'Discover Hidden Gems',
    desc: 'Find unique destinations and experiences that match your travel style.'
  },
  {
    icon: '👥',
    title: 'Community Insights',
    desc: 'Learn from fellow travelers and share your own experiences.'
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ pt: { xs: 3, sm: 4, md: 5 }, pb: { xs: 3, sm: 4, md: 5 }, bgcolor: '#fafafa' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3, md: 3.5 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: '#000',
              mb: 0.8,
              textTransform: 'uppercase',
            }}
          >
            Why Choose TravelSensei
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ 
              color: '#616161', 
              fontWeight: 400, 
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Smart planning, unique experiences, and a community that helps you travel better.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: 'repeat(3, 1fr)'
            },
            gap: { xs: 2, sm: 2, md: 2.5 },
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {featureList.map((f, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: { xs: 2, sm: 2.5 },
                py: { xs: 2.5, sm: 3 },
                minHeight: { xs: 110, sm: 120, md: 130 },
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)',
                  borderColor: '#000',
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 44, sm: 48, md: 52 },
                  height: { xs: 44, sm: 48, md: 52 },
                  borderRadius: '50%',
                  bgcolor: '#f5f5f5',
                  border: '2px solid #e0e0e0',
                  fontSize: { xs: 20, sm: 22, md: 24 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.2,
                  transition: 'all 0.2s ease',
                  '.MuiBox-root:hover &': {
                    bgcolor: '#ffffffff',
                    borderColor: '#000',
                  }
                }}
              >
                {f.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }, color: '#212121' }}>
                {f.title}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }, color: '#616161', lineHeight: 1.5 }}>
                {f.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Features;