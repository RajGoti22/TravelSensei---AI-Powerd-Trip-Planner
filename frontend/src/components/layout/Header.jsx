import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Home,
  Dashboard as DashboardIcon,
  Explore,
  BookOnline,
  Reviews,
  Settings,
  Logout,
  TravelExplore,
  Group,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Create Itinerary', path: '/itinerary/create', icon: <TravelExplore /> },
    // { label: 'Explore', path: '/explore', icon: <Explore /> },
    // { label: 'Booking Hub', path: '/booking', icon: <BookOnline /> },
    { label: 'Reviews', path: '/community/reviews', icon: <Reviews /> },
    { label: 'Social Feed', path: '/community/social', icon: <Group /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          TravelSensei
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              cursor: 'pointer',
              backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'white',
        backgroundColor: '#fff !important',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        backdropFilter: 'none !important',
        backgroundImage: 'none !important',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Toolbar 
        sx={{ 
          borderRadius: 0,
          minHeight: { xs: '56px', sm: '60px', md: '64px' },
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 0.5, sm: 0.75, md: 1 },
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: { xs: 1, sm: 1.5 }, 
              ml: { xs: 0.5, sm: 0 },
              p: { xs: 0.75, sm: 1 },
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
          </IconButton>
        )}

        <TravelExplore sx={{ 
          mr: { xs: 0.75, sm: 1 },
          fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' },
          color: '#000',
        }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            fontWeight: 600,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
          onClick={() => navigate('/')}
        >
          TravelSensei
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { sm: 1, md: 1.5 } }}>
            {navigationItems.map((item) => (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  textTransform: 'none',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontSize: { sm: '0.85rem', md: '0.9rem' },
                  px: { sm: 1, md: 1.5 },
                  py: { sm: 0.5, md: 0.75 },
                  color: location.pathname === item.path ? '#000' : '#424242',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                  userSelect: 'none',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: location.pathname === item.path ? '100%' : '0%',
                    height: '2px',
                    bgcolor: '#000',
                    transition: 'width 0.3s ease',
                  },
                  '&:hover': {
                    color: '#000',
                    '&::after': {
                      width: '100%',
                    },
                  },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>
        )}

        {/* Avoid showing avatar while auth state is still resolving to prevent flash of logged-in UI */}
        {isAuthenticated && user && !loading ? (
          <>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{
                ml: { xs: 0.5, sm: 1, md: 1.5 },
                p: { xs: 0.5, sm: 0.75 },
              }}
            >
              {user?.avatar ? (
                <Avatar src={user.avatar} sx={{ width: { xs: 28, sm: 30, md: 32 }, height: { xs: 28, sm: 30, md: 32 } }} />
              ) : (
                <AccountCircle sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }} />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              {/* <MenuItem onClick={() => { navigate('/booking/manage'); handleMenuClose(); }}>
                <ListItemIcon>
                  <BookOnline fontSize="small" />
                </ListItemIcon>
                My Bookings
              </MenuItem> */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, ml: { xs: 0.5, sm: 1 } }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                px: { xs: 1.25, sm: 1.5, md: 2 },
                py: { xs: 0.5, sm: 0.6 },
                fontWeight: 500,
                color: '#424242',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)',
                  color: '#000',
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                px: { xs: 1.25, sm: 1.5, md: 2 },
                py: { xs: 0.5, sm: 0.6 },
                fontWeight: 500,
                bgcolor: '#000',
                color: '#fff',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#212121',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
