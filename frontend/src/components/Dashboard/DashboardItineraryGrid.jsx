import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Stack, Chip, Button } from '@mui/material';
import { MoreVert, CalendarToday, CurrencyRupee, Edit, Visibility } from '@mui/icons-material';

const DashboardItineraryGrid = ({ itineraries, navigate, handleMenuOpen, getStatusColor }) => (
  <Box component="section" aria-label="Your itineraries" sx={{ mb: 3, px: { xs: 0.6, sm: 1.5, md: 0 } }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(3, 1fr)', 
          md: 'repeat(4, 1fr)' 
        },
        gap: { xs: 1, sm: 1.5, md: 2 },
        maxWidth: '100%',
        mx: 'auto',
      }}
    >
      {itineraries.map((itinerary, index) => (
        <Card
          key={itinerary.id}
          sx={{
            width: { xs: '170px', sm: '200px', md: '260px' },
            minHeight: { xs: '180px', sm: '220px', md: '320px' },
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: { xs: '8px', sm: '10px', md: '12px' },
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              borderColor: '#000',
              zIndex: 1,
            },
          }}
        >
            {/* Card Header with Gradient */}
            <Box
              sx={{
                height: { xs: 65, sm: 90, md: 150 },
                background: index % 3 === 0 
                  ? 'linear-gradient(to right bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1648467885244-3ea49df7208b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8RXVyb3BlYW4lMjBBZHZlbnR1cmV8ZW58MHx8MHx8fDA%3D")'
                  : index % 3 === 1
                  ? 'linear-gradient(to right bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                  : 'linear-gradient(to right bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://plus.unsplash.com/premium_photo-1692449337629-00383e181c90?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'screen',
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 0.7, sm: 1, md: 2.5 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '0.68rem', sm: '0.75rem', md: '1rem' },
                  textTransform: 'none',
                  textShadow: '0 3px 8px rgba(0,0,0,0.5)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  pr: 0.3,
                }}
              >
                {itinerary.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, itinerary)}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.18)',
                  p: { xs: 0.3, sm: 0.5, md: 1 },
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.28)',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                  },
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>
            {/* Card Content */}
            <CardContent sx={{ 
              p: { xs: 0.6, sm: 0.9, md: 2 }, 
              display: 'flex', 
              flexDirection: 'column',
              flex: { xs: 1, md: 'initial' },
              justifyContent: { xs: 'space-between', md: 'flex-start' },
              '&:last-child': { pb: { xs: 0.6, sm: 0.9, md: 2 } }
            }}>
              <Box sx={{ display: { xs: 'block', md: 'contents' } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: { xs: 0.5, sm: 0.6, md: 1.2 },
                    lineHeight: { xs: 1.3, md: 1.4 },
                    fontSize: { xs: '0.58rem', sm: '0.65rem', md: '0.85rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {itinerary.description || 'An amazing travel adventure awaits you with carefully planned destinations and activities.'}
                </Typography>

                <Stack direction="row" spacing={{ xs: 0.3, md: 0.7 }} sx={{ mb: { xs: 0.5, sm: 0.6, md: 1.2 }, flexWrap: 'wrap', gap: { xs: 0.3, sm: 0.35, md: 0.7 }, rowGap: { xs: 0.3, sm: 0.35 } }}>
                  <Chip
                    icon={<CalendarToday sx={{ fontSize: { xs: '0.53rem', sm: '0.6rem', md: '0.9rem' } }} />}
                    label={`${itinerary.duration || '7'} ${window.innerWidth < 600 ? 'd' : 'days'}`}
                    size="small"
                    sx={{
                      bgcolor: '#f5f5f5',
                      color: '#000',
                      border: '1px solid #e0e0e0',
                      height: { xs: '16px', sm: '18px', md: '22px' },
                      fontSize: { xs: '0.56rem', sm: '0.6rem', md: '0.72rem' },
                      '& .MuiChip-label': {
                        px: { xs: 0.35, sm: 0.5, md: 0.9 },
                      },
                      '& .MuiChip-icon': {
                        color: '#000',
                        marginLeft: { xs: '2px', sm: '3px', md: '4px' },
                        marginRight: { xs: '-3px', sm: '-2px', md: '0px' },
                        fontSize: { xs: '0.53rem', sm: '0.6rem', md: '0.8rem' },
                      },
                    }}
                  />
                  <Chip
                    icon={<CurrencyRupee sx={{ fontSize: { xs: '0.53rem', sm: '0.6rem', md: '0.9rem' } }} />}
                    label={(itinerary.totalBudget || 0).toLocaleString('en-IN')}
                    size="small"
                    sx={{
                      bgcolor: '#f5f5f5',
                      color: '#000',
                      border: '1px solid #e0e0e0',
                      height: { xs: '16px', sm: '18px', md: '22px' },
                      fontSize: { xs: '0.56rem', sm: '0.6rem', md: '0.72rem' },
                      '& .MuiChip-label': {
                        px: { xs: 0.35, sm: 0.5, md: 0.9 },
                      },
                      '& .MuiChip-icon': {
                        color: '#000',
                        marginLeft: { xs: '2px', sm: '3px', md: '4px' },
                        marginRight: { xs: '-3px', sm: '-2px', md: '0px' },
                        fontSize: { xs: '0.53rem', sm: '0.6rem', md: '0.8rem' },
                      },
                    }}
                  />
                  <Chip
                    label={itinerary.status || 'draft'}
                    size="small"
                    color={getStatusColor(itinerary.status)}
                    sx={{ 
                      textTransform: 'capitalize', 
                      height: { xs: '16px', sm: '18px', md: '22px' }, 
                      fontSize: { xs: '0.56rem', sm: '0.6rem', md: '0.72rem' },
                      '& .MuiChip-label': {
                        px: { xs: 0.4, sm: 0.6, md: 1 },
                      },
                    }}
                  />
                </Stack>
              </Box>
              
              <Box sx={{ display: { xs: 'block', md: 'contents' } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: { xs: 0.5, sm: 0.6, md: 1.2 },
                    mt: { xs: 0, md: 'auto' },
                    fontSize: { xs: '0.54rem', sm: '0.58rem', md: '0.7rem' },
                  }}
                >
                  Created: {(() => {
                    const d = new Date(itinerary.createdAt || Date.now());
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()}
                </Typography>
                {/* Action Buttons */}
                <Stack direction="row" spacing={{ xs: 0.35, sm: 0.4, md: 0.8 }} sx={{ mt: { md: 0.4 } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility sx={{ fontSize: { xs: '0.63rem', sm: '0.68rem', md: '0.95rem' } }} />}
                  onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                  fullWidth
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    borderRadius: '18px',
                    py: { xs: 0.22, sm: 0.28, md: 0.5 },
                    px: { xs: 0.28, sm: 0.45, md: 1.3 },
                    fontSize: { xs: '0.56rem', sm: '0.6rem', md: '0.75rem' },
                    minWidth: 'auto',
                    transition: 'all 0.2s ease',
                    '& .MuiButton-startIcon': {
                      marginRight: { xs: '2px', sm: '3px', md: '8px' },
                      marginLeft: { xs: '-3px', sm: '-2px', md: '0px' },
                    },
                    '&:hover': {
                      bgcolor: '#000',
                      color: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Edit sx={{ fontSize: { xs: '0.63rem', sm: '0.68rem', md: '0.95rem' } }} />}
                  onClick={() => navigate('/itinerary/create', { state: { editingItinerary: itinerary } })}
                  fullWidth
                  sx={{
                    bgcolor: '#000',
                    color: 'white',
                    borderRadius: '18px',
                    py: { xs: 0.22, sm: 0.28, md: 0.5 },
                    px: { xs: 0.28, sm: 0.45, md: 1.3 },
                    fontSize: { xs: '0.56rem', sm: '0.6rem', md: '0.75rem' },
                    minWidth: 'auto',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '& .MuiButton-startIcon': {
                      marginRight: { xs: '2px', sm: '3px', md: '8px' },
                      marginLeft: { xs: '-3px', sm: '-2px', md: '0px' },
                    },
                    '&:hover': {
                      bgcolor: '#212121',
                      color: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 3px 10px rgba(10,58,100,0.3)',
                    },
                  }}
                >
                  Edit
                </Button>
              </Stack>
              </Box>
            </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

export default DashboardItineraryGrid;
