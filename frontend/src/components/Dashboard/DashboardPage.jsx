import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import DashboardHero from './DashboardHero';
import DashboardStats from './DashboardStats';
import DashboardEmptyState from './DashboardEmptyState';
import DashboardItineraryGrid from './DashboardItineraryGrid';
import DashboardMenuDialog from './DashboardMenuDialog';
import DashboardFab from './DashboardFab';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookings, setBookings] = useState([]);

  // Fetch user bookings
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const result = await bookingService.getUserBookings();
        if (result.success) setBookings(result.data);
      } catch (e) { /* ignore */ }
    };
    if (user) loadBookings();
  }, [user]);

  useEffect(() => {
    const loadItineraries = async () => {
      if (!user) return;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data for demonstration
        const mockItineraries = [
          {
            id: 1,
            title: 'European Adventure',
            description: 'A magnificent journey through the most beautiful cities of Europe, including Paris, Rome, Barcelona, and Amsterdam.',
            duration: 14,
            totalBudget: 3500,
            status: 'active',
            createdAt: new Date('2024-01-15'),
          },
          {
            id: 2,
            title: 'Asian Discovery',
            description: 'Explore the cultural wonders and natural beauty of Asia, from Tokyo to Bangkok.',
            duration: 21,
            totalBudget: 4200,
            status: 'draft',
            createdAt: new Date('2024-01-20'),
          },
          {
            id: 3,
            title: 'American Road Trip',
            description: 'The ultimate American road trip adventure across multiple states and national parks.',
            duration: 10,
            totalBudget: 2800,
            status: 'completed',
            createdAt: new Date('2024-01-10'),
          },
        ];
        setItineraries(mockItineraries);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: 'grey.100' }}>
      <DashboardHero user={user} navigate={navigate} />
      <Box maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, mt: { xs: -4, md: -8 }, mx: 'auto' }}>
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
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>My Hotel Bookings</Typography>
        {(Array.isArray(bookings) && bookings.filter) ? (
          bookings.length === 0 ? (
            <Typography color="text.secondary">No hotel bookings found.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {bookings.filter(b => b.type === 'hotel').map(booking => (
                <Card key={booking._id} sx={{ minWidth: 260 }}>
                  <CardContent>
                    <Typography variant="h6">{booking.hotel?.name || 'Hotel'}</Typography>
                    <Typography variant="body2" color="text.secondary">{booking.hotel?.address}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
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
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <b>Status:</b> <Chip label={booking.status} size="small" color={booking.status === 'confirmed' ? 'success' : 'default'} />
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <b>Total:</b> {booking.pricing?.total ? `$${booking.pricing.total}` : '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Booking ID: {booking.bookingId}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )
        ) : (
          <Typography color="text.secondary">No hotel bookings found.</Typography>
        )}
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
      <DashboardFab navigate={navigate} />
    </Box>
  );
};

export default Dashboard;
