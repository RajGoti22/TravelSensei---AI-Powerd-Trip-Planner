import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './utils/theme-enhanced';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './pages/Profile';
// import PreferencesSetup from './components/itinerary/PreferencesSetup';
// import ItineraryCreator from './pages/ItineraryCreator';
import ItineraryCreatorNew from './pages/ItineraryCreatorNew';
import ItineraryDetails from './pages/ItineraryDetails';
import Dashboard from './pages/Dashboard';
// import Explore from './pages/Explore';
// import HotelBooking from './components/booking/HotelBooking';
// import FlightBooking from './components/booking/FlightBooking';
// import ActivityBooking from './components/booking/ActivityBooking';
// import BookingHub from './pages/BookingHub';
// import BookingManagement from './components/booking/BookingManagement';
import CommunityReviews from './pages/CommunityReviews';
import SocialFeed from './pages/SocialFeed';

/**
 * Scroll to top component - scrolls to top on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);
  
  return null;
}

/**
 * Main App component with routing and theme setup
 * @returns {React.ReactElement}
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            {/* <Route path="/explore" element={<Layout><Explore /></Layout>} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile/preferences" 
              element={
                <ProtectedRoute>
                  {/* <PreferencesSetup /> */}
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Booking routes */}
            {/* <Route 
              path="/booking" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <BookingHub />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/booking/hotels" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <HotelBooking />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/booking/flights" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <FlightBooking />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/booking/activities" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ActivityBooking />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/booking/manage" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <BookingManagement />
                  </Layout>
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Community routes */}
            <Route 
              path="/community/reviews" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CommunityReviews />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/community/social" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <SocialFeed />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy reviews route */}
            <Route 
              path="/reviews" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CommunityReviews />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* New Smart Itinerary Creator */}
            <Route 
              path="/itinerary/create" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ItineraryCreatorNew />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Old Itinerary Creator (backup) */}
            <Route 
              path="/itinerary/create-old" 
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* <ItineraryCreator /> */}
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/itinerary/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ItineraryDetails />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Itinerary main route */}
            <Route 
              path="/itinerary" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ItineraryCreatorNew />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;