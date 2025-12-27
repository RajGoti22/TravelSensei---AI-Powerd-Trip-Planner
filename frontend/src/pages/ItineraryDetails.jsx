import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Chip, Button, CircularProgress, Stack } from '@mui/material';
import LocationOn from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import { useAuth } from '../contexts/AuthContext';
import { itineraryService } from '../services/itineraryService';

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get budget and duration from Redux (consistent values)
  const reduxBudget = useSelector((state) => state.itinerary.budgetAmount);
  const reduxStartDate = useSelector((state) => state.itinerary.startDate);
  const reduxEndDate = useSelector((state) => state.itinerary.endDate);
  const formData = useSelector((state) => state.itinerary);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const it = await itineraryService.getItinerary(String(id), user?.id);
        if (!it) {
          setError('Itinerary not found');
        } else {
          setItinerary(it);
        }
      } catch (e) {
        setError(e.message || 'Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Typography color="error">{error}</Typography></Box>;
  if (!itinerary) return null;

  const dayPlans = itinerary.dayPlans || itinerary.day_plans || [];
  const hotels = itinerary.hotels || itinerary.recommended_hotels || [];
  const tips = itinerary.travelTips || itinerary.travel_tips || [];
  
  // Use backend totalBudget (or total_budget/totalCost) if available, otherwise fallback
  const displayBudget =
    itinerary.totalBudget ||
    itinerary.total_budget ||
    itinerary.totalCost ||
    reduxBudget ||
    '-';
  const displayGroupSize = itinerary.groupSize || itinerary.group_size || '-';
  const displayBudgetPerPerson = itinerary.budget || itinerary.budget_per_person || reduxBudget || '-';
  const displayDuration = itinerary.duration || dayPlans.length || '-';

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: { xs: 1, sm: 1.5, md: 2 }, px: { xs: 1, sm: 1.5 } }}>
      <Paper sx={{ p: { xs: 1, sm: 1.2, md: 1.5 }, mb: 1, borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={1} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={9}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' } }}>{itinerary.title || itinerary.destination || 'Itinerary'}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: { xs: '0.75rem', md: '0.8rem' } }}>{itinerary.description || `A ${displayDuration} day trip to ${itinerary.destination || ''}`}</Typography>
            <Box sx={{ mt: 0.7, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip label={`${displayDuration} Days`} size="small" sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: 22, fontSize: '0.7rem' }} />
              <Chip label={`${displayGroupSize} Travelers`} size="small" sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: 22, fontSize: '0.7rem' }} />
              <Chip label={`₹${typeof displayBudget === 'number' ? displayBudget.toLocaleString('en-IN') : displayBudget} Total Budget`} size="small" sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: 22, fontSize: '0.7rem' }} />
              <Chip label={`${typeof displayBudgetPerPerson === 'number' ? displayBudgetPerPerson.toLocaleString('en-IN') : displayBudgetPerPerson} Per Person`} size="small" sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: 22, fontSize: '0.7rem' }} />
              {itinerary.theme && <Chip label={itinerary.theme} size="small" sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: 22, fontSize: '0.7rem' }} />}
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto" sx={{ textAlign: { xs: 'left', sm: 'right' }, ml: 'auto' }}>
            <Button variant="outlined" size="small" onClick={() => navigate('/dashboard')} sx={{ borderColor: '#000', color: '#000', minWidth: 0, px: 1.4, py: 0.6, fontSize: '0.78rem', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.04)' } }}>Back</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Day plans */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.95rem', md: '1rem' } }}>
          📅 Day-by-Day Plan
        </Typography>
        {dayPlans.length === 0 ? (
          <Paper sx={{ p: 1, border: '1px solid #e0e0e0' }}><Typography color="text.secondary">No day plans available.</Typography></Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
            {dayPlans.map((day, idx) => (
              <Paper key={idx} sx={{ borderRadius: 1, border: '1px solid #e0e0e0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <Box sx={{ p: { xs: 1, sm: 1.2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ 
                      bgcolor: '#000', 
                      width: { xs: 28, sm: 32 }, 
                      height: { xs: 28, sm: 32 }, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    }}>
                      {day.day || idx + 1}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold" fontSize={{ xs: '0.85rem', sm: '0.95rem' }}>
                        Day {day.day || idx + 1} - {day.theme || day.title || day.location || 'Exploration'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize={{ xs: '0.65rem', sm: '0.7rem' }}>
                        {day.date ? (() => {
                          try {
                            const dateObj = new Date(day.date);
                            if (!isNaN(dateObj.getTime())) {
                              const day_num = String(dateObj.getDate()).padStart(2, '0');
                              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                              const year = dateObj.getFullYear();
                              return `${day_num}-${month}-${year}`;
                            }
                            return day.date;
                          } catch {
                            return day.date;
                          }
                        })() : 'Date not available'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', my: 0.7 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {Array.isArray(day.locations) && day.locations.length > 0 ? (
                      day.locations.map((location, locIndex) => (
                        <Stack key={locIndex} direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                          <Box sx={{ 
                            bgcolor: '#f5f5f5', 
                            color: '#000',
                            width: { xs: 24, sm: 28 }, 
                            height: { xs: 24, sm: 28 }, 
                            borderRadius: '50%',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            flexShrink: 0
                          }}>
                            {location.type === 'attraction' ? '🏛️' : 
                              location.type === 'restaurant' ? '🍽️' : 
                              location.type === 'hotel' ? '🏨' : '📍'}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight="600" fontSize={{ xs: '0.75rem', sm: '0.8rem' }}>
                              {location.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block" fontSize={{ xs: '0.68rem', sm: '0.75rem' }}>
                              {location.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                              {(location.approx_time_mins || location.duration_hours || location.duration) && (
                                <Chip 
                                  size="small" 
                                  label={`⏱️ ${location.approx_time_mins ? Math.round(location.approx_time_mins / 60) || 1 : location.duration_hours || location.duration || 2} hrs`} 
                                  variant="outlined" 
                                  sx={{ height: 18, fontSize: '0.62rem', borderColor: '#e0e0e0', bgcolor: '#fafafa' }} 
                                />
                              )}
                              {location.estimated_cost > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`₹${location.estimated_cost.toLocaleString('en-IN')}`} 
                                  variant="outlined" 
                                  sx={{ height: 18, fontSize: '0.62rem', borderColor: '#4caf50', bgcolor: '#f1f8f4', color: '#2e7d32' }} 
                                />
                              )}
                              <Chip size="small" label={`⭐ ${location.rating || '4.5'}/5`} variant="outlined" sx={{ height: 18, fontSize: '0.62rem', borderColor: '#e0e0e0', bgcolor: '#fafafa' }} />
                              <Chip size="small" label={location.best_time || location.bestTime || 'Anytime'} variant="outlined" sx={{ height: 18, fontSize: '0.62rem', borderColor: '#e0e0e0', bgcolor: '#fafafa' }} />
                            </Box>
                          </Box>
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<MapIcon sx={{ fontSize: '1rem' }} />}
                              href={(() => {
                                if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
                                  // Use lat,lng if available
                                  return `https://www.google.com/maps/search/?api=1&query=${location.coordinates[0]},${location.coordinates[1]}`;
                                } else if (location.address) {
                                  // Use address if available
                                  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
                                } else {
                                  // Fallback to name + destination
                                  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + (itinerary.destination || ''))}`;
                                }
                              })()}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                height: 30,
                                fontSize: '0.72rem',
                                textTransform: 'none',
                                px: 1.1,
                                whiteSpace: 'nowrap',
                                minWidth: 70,
                                boxShadow: 1,
                                borderRadius: 1.5,
                                flexShrink: 0,
                                zIndex: 2,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  bgcolor: 'primary.dark',
                                }
                              }}
                            >
                              Map
                            </Button>
                          </Box>
                        </Stack>
                      ))
                    ) : Array.isArray(day.activities) && day.activities.length > 0 ? (
                      day.activities.map((activity, actIdx) => (
                        <Stack key={actIdx} direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                          <Box sx={{ 
                            bgcolor: '#f5f5f5', 
                            color: '#000',
                            width: { xs: 24, sm: 28 }, 
                            height: { xs: 24, sm: 28 }, 
                            borderRadius: '50%',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            flexShrink: 0
                          }}>
                            {activity.type === 'attraction' ? '🏛️' : 
                              activity.type === 'restaurant' ? '🍽️' : 
                              activity.type === 'hotel' ? '🏨' : '📍'}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight="600" fontSize={{ xs: '0.75rem', sm: '0.8rem' }}>
                              {activity.name || activity.place}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block" fontSize={{ xs: '0.68rem', sm: '0.75rem' }}>
                              {activity.description || activity.details}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, mt: 0.5 }}>
                              {(activity.approx_time_mins || activity.time) && (
                                <Chip 
                                  size="small" 
                                  label={`⏱️ ${activity.approx_time_mins ? Math.round(activity.approx_time_mins / 60) || 1 : 2} hrs`} 
                                  variant="outlined" 
                                  sx={{ height: 18, fontSize: '0.62rem', borderColor: '#e0e0e0', bgcolor: '#fafafa' }} 
                                />
                              )}
                              {activity.estimated_cost > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`₹${activity.estimated_cost.toLocaleString('en-IN')}`} 
                                  variant="outlined" 
                                  sx={{ height: 18, fontSize: '0.62rem', borderColor: '#4caf50', bgcolor: '#f1f8f4', color: '#2e7d32' }} 
                                />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<MapIcon sx={{ fontSize: '1rem' }} />}
                              href={(() => {
                                if (activity.coordinates && Array.isArray(activity.coordinates) && activity.coordinates.length === 2) {
                                  return `https://www.google.com/maps/search/?api=1&query=${activity.coordinates[0]},${activity.coordinates[1]}`;
                                } else if (activity.address) {
                                  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}`;
                                } else {
                                  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activity.name || activity.place) + ' ' + (itinerary.destination || ''))}`;
                                }
                              })()}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                height: 30,
                                fontSize: '0.72rem',
                                textTransform: 'none',
                                px: 1.1,
                                whiteSpace: 'nowrap',
                                minWidth: 70,
                                boxShadow: 1,
                                borderRadius: 1.5,
                                flexShrink: 0,
                                zIndex: 2,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  bgcolor: 'primary.dark',
                                }
                              }}
                            >
                              Map
                            </Button>
                          </Box>
                        </Stack>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                        No activities or locations for this day.
                      </Typography>
                    )}
                  </Box>
                  {(day.notes || day.description) && (
                    <>
                      <Box sx={{ borderTop: 1, borderColor: 'divider', my: 0.5 }} />
                      <Box sx={{ 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 0.7, 
                        p: { xs: 0.7, sm: 0.9 },
                        border: '1px solid #e0e0e0'
                      }}>
                        <Typography variant="caption" fontSize={{ xs: '0.68rem', sm: '0.75rem' }}>{day.notes || day.description}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {/* Hotels */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.95rem', md: '1rem' } }}>Hotel Recommendations</Typography>
        {hotels.length === 0 ? (
          <Paper sx={{ p: { xs: 1, sm: 1.2 }, border: '1px solid #e0e0e0', borderRadius: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Typography color="text.secondary" fontSize={{ xs: '0.75rem', sm: '0.8rem' }}>No hotels available.</Typography>
          </Paper>
        ) : (
          hotels.map((h, idx) => (
            <Paper key={idx} sx={{ p: { xs: 0.7, sm: 1 }, mb: 0.7, border: '1px solid #e0e0e0', borderRadius: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{h.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>{h.location}</Typography>
              {h.description && <Typography sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>{h.description}</Typography>}
            </Paper>
          ))
        )}
      </Box>

      {/* Travel tips */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.95rem', md: '1rem' } }}>Travel Tips</Typography>
        {tips.length === 0 ? (
          <Paper sx={{ p: { xs: 1, sm: 1.2 }, border: '1px solid #e0e0e0', borderRadius: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Typography color="text.secondary" fontSize={{ xs: '0.75rem', sm: '0.8rem' }}>No tips available.</Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: { xs: 0.7, sm: 1.2 }, border: '1px solid #e0e0e0', borderRadius: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <ul style={{ paddingLeft: '16px', margin: 0 }}>
              {tips.map((t, i) => (<li key={i} style={{ marginBottom: '5px' }}><Typography variant="body2" fontSize={{ xs: '0.7rem', sm: '0.8rem' }}>{t}</Typography></li>))}
            </ul>
          </Paper>
        )}
      </Box>

      {/* Estimated Total Cost Summary */}
      {itinerary.estimated_total_cost && (
        <Box sx={{ mt: 2 }}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              border: '2px solid #4caf50', 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
              background: 'linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  bgcolor: '#4caf50', 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' }
                }}>
                  💰
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block' }}>
                    Estimated Total Cost
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#2e7d32', fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                    ₹{itinerary.estimated_total_cost.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.68rem', sm: '0.72rem' }, color: 'text.secondary', display: 'block' }}>
                  Per Person: ₹{Math.round(itinerary.estimated_total_cost / (displayGroupSize || 1)).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary', fontStyle: 'italic' }}>
                  *Estimated costs may vary
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ItineraryDetails;
