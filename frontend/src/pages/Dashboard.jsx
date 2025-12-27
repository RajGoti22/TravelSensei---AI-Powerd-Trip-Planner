
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
// import { bookingService } from '../services/bookingService';
import { itineraryService } from '../services/itineraryService';
import { useAuth } from '../contexts/AuthContext';
import DashboardHero from '../components/Dashboard/DashboardHero';
import DashboardStats from '../components/Dashboard/DashboardStats';
import DashboardEmptyState from '../components/Dashboard/DashboardEmptyState';
import DashboardItineraryGrid from '../components/Dashboard/DashboardItineraryGrid';
import DashboardMenuDialog from '../components/Dashboard/DashboardMenuDialog';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // const [bookings, setBookings] = useState([]);

  // Fetch user bookings
  // useEffect(() => {
  //   const loadBookings = async () => {
  //     try {
  //       const result = await bookingService.getUserBookings();
  //       if (result.success) setBookings(result.data);
  //     } catch (e) { /* ignore */ }
  //   };
  //   if (user) loadBookings();
  // }, [user]);

  useEffect(() => {
    const loadItineraries = async () => {
      if (!user) return;
      try {
        // Load saved itineraries from local storage via service
        const saved = await import('../services/itineraryService').then(m => m.itineraryService.getUserItineraries(user.id));
        setItineraries(saved || []);
      } catch (error) {
        console.error('Error loading itineraries:', error);
      } finally {
        setLoading(false);
      }
    };
    loadItineraries();
  }, [user]);

  const handleMenuOpen = (event, itinerary) => {
    setAnchorEl(event.currentTarget);
    setSelectedItinerary(itinerary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItinerary(null);
  };

  const handleDeleteItinerary = async () => {
    if (!selectedItinerary) return;
    
    try {
      // Call service to permanently delete the itinerary (localStorage or API)
      await itineraryService.deleteItinerary(selectedItinerary.id, user.id);
      // Remove from local state
      setItineraries(prev => prev.filter(item => item.id !== selectedItinerary.id));
      setDeleteDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  const handleShareItinerary = async () => {
    if (!selectedItinerary) return;
    
    try {
      await navigator.share({
        title: selectedItinerary.title,
        text: selectedItinerary.description,
        url: window.location.origin + `/itinerary/${selectedItinerary.id}`,
      });
    } catch (error) {
      console.log('Web Share API not supported');
    }
    handleMenuClose();
  };

  const handleExportItinerary = (format) => {
    if (!selectedItinerary) return;
    
    console.log(`Exporting ${selectedItinerary.title} as ${format}`);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa'}}>
      <DashboardHero user={user} navigate={navigate} />
      <Box maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, mt: { xs: -2.5, md: -4 }, mx: 'auto', px: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <DashboardStats itineraries={itineraries} />
          {itineraries.length === 0 ? (
            <DashboardEmptyState navigate={navigate} />
          ) : (
            <DashboardItineraryGrid
              itineraries={itineraries}
              navigate={navigate}
              handleMenuOpen={handleMenuOpen}
              getStatusColor={getStatusColor}
            />
          )}
        </Box>

        {/* User Hotel Bookings Section */}
        {/* <Divider sx={{ my: 2.5 }} />
        <Typography variant="h5" sx={{ mb: 1.8, fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.3rem' }, letterSpacing: '0.3px' }}>My Hotel Bookings</Typography>
        {(Array.isArray(bookings) && bookings.filter) ? (
          bookings.length === 0 ? (
            <Typography color="text.secondary">No hotel bookings found.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 1.5, md: 2 } }}>
              {bookings.filter(b => b.type === 'hotel').map(booking => (
                <Card 
                  key={booking._id} 
                  sx={{ 
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      borderColor: '#000',
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, md: 1.8 } }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', md: '1rem' }, mb: 0.5, fontWeight: 700 }}>{booking.hotel?.name || 'Hotel'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.78rem', md: '0.8rem' }, mb: 0.8, lineHeight: 1.3 }}>{booking.hotel?.address}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.8, fontSize: { xs: '0.8rem', md: '0.82rem' }, lineHeight: 1.6 }}>
                      <b>Check-in:</b> {booking.hotel?.checkIn ? (() => {
                        const d = new Date(booking.hotel.checkIn);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}-${month}-${year}`;
                      })() : '-'}<br />
                      <b>Check-out:</b> {booking.hotel?.checkOut ? (() => {
                        const d = new Date(booking.hotel.checkOut);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}-${month}-${year}`;
                      })() : '-'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.8, fontSize: { xs: '0.8rem', md: '0.82rem' }, display: 'flex', alignItems: 'center' }}>
                      <b>Status:</b> <Chip label={booking.status} size="small" color={booking.status === 'confirmed' ? 'success' : 'default'} sx={{ ml: 0.6, height: '20px', fontSize: '0.7rem' }} />
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.8, fontSize: { xs: '0.8rem', md: '0.82rem' } }}>
                      <b>Total:</b> {booking.pricing?.total ? `$${booking.pricing.total}` : '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, fontSize: { xs: '0.68rem', md: '0.7rem' } }}>Booking ID: {booking.bookingId}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )
        ) : (
          <Typography color="text.secondary">No hotel bookings found.</Typography>
        )} */}
      </Box>
      <DashboardMenuDialog
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        handleMenuClose={handleMenuClose}
        selectedItinerary={selectedItinerary}
        navigate={navigate}
        handleShareItinerary={handleShareItinerary}
        handleExportItinerary={handleExportItinerary}
        setDeleteDialogOpen={setDeleteDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        handleDeleteItinerary={handleDeleteItinerary}
      />
    </Box>
  );
};

export default Dashboard;
