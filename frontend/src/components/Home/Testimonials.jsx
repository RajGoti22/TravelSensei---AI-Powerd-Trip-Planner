import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card,
  CardContent,
  Avatar,
  Rating
} from '@mui/material';
import apiService from '../../services/api';

const Testimonials = () => {
  // Fallback static testimonials to ensure UI renders even if API fails
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Traveler',
      location: '—',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      comment: 'Discover unforgettable journeys with TravelSensei — personalized plans, local insights, and seamless experiences.'
    },
    {
      id: 2,
      name: 'Traveler',
      location: '—',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      comment: 'Smart recommendations tailored to your budget and interests. Highly recommended!'
    },
    {
      id: 3,
      name: 'Traveler',
      location: '—',
      avatar: '/api/placeholder/50/50',
      rating: 4,
      comment: 'Safe, authentic, and reliable travel planning that makes trips unforgettable.'
    }
  ]);

  // Load latest reviews from backend and map to testimonial format
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiService.makeRequest('/reviews');
        const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

        if (reviews.length > 0) {
          const mapped = reviews
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
            .map((r, idx) => ({
              id: r.id ?? idx,
              name: (r.user?.name) || r.user_name || r.userName || 'Traveler',
              location:
                r.location ||
                (r.city && r.country ? `${r.city}, ${r.country}` : r.city || r.country || '—'),
              avatar: (r.user?.avatar) || '/api/placeholder/50/50',
              rating: r.rating ?? 5,
              comment: r.comment || r.content || r.text || r.description || '',
            }));
          if (mapped.length > 0) setTestimonials(mapped);
        }
      } catch (e) {
        // Keep fallback testimonials on error
      }
    };
    fetchReviews();
  }, []);

  return (
    <Box sx={{ py: { xs: 3, sm: 4, md: 5 }, bgcolor: '#fafafa' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3, md: 3.5 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#000',
            }}
          >
            What Our Travelers Say
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
            justifyContent: 'center',
            alignItems: 'stretch',
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              sx={{
                width: '100%',
                minWidth: 0,
                borderRadius: 2,
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  borderColor: '#000',
                },
                // Ensure all cards stretch to same height within the grid
                height: '100%',
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'stretch',
              }}
            >
              {/* Quote Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: 16,
                  width: { xs: 28, sm: 32, md: 36 },
                  height: { xs: 28, sm: 32, md: 36 },
                  borderRadius: '50%',
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' }, color: '#000', fontWeight: 'bold' }}>
                  "
                </Typography>
              </Box>
              <CardContent 
                sx={{ 
                  p: { xs: 2, sm: 2, md: 2.5 }, 
                  pt: { xs: 2.5, sm: 2.5, md: 3 },
                  // Make content fill card height for consistent spacing
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                {/* Testimonial Text */}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.78rem', sm: '0.82rem', md: '0.85rem' },
                    lineHeight: 1.5,
                    color: '#424242',
                    fontStyle: 'italic',
                    mb: 1.5,
                    textAlign: 'left',
                    // Reserve consistent space for comment across cards
                    minHeight: { xs: 110, sm: 120, md: 130 },
                    // Allow the text block to occupy remaining space
                    flexGrow: 1,
                  }}
                >
                  "{testimonial.comment}"
                </Typography>

                {/* User Info Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      sx={{
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        mr: 1.2,
                        bgcolor: '#000',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        fontWeight: 700,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '0.85rem', sm: '0.88rem' },
                          fontWeight: 700,
                          color: '#212121',
                          lineHeight: 1.2,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.72rem' },
                          color: '#757575',
                        }}
                      >
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Rating */}
                  <Box sx={{ textAlign: 'right', mt: { xs: 1, sm: 0 } }}>
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      size="small"
                      sx={{
                        fontSize: '1rem',
                        '& .MuiRating-iconFilled': {
                          color: '#FFC107',
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                        fontSize: { xs: '0.68rem', sm: '0.72rem' },
                      }}
                    >
                      {testimonial.rating}/5
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;