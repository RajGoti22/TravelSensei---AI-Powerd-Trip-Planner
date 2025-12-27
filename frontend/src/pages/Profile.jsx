import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  IconButton,
  Alert,
  Snackbar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Divider,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera,
  Email,
  Phone,
  LocationOn,
  Person,
  Save,
  Cancel,
  Lock,
  Visibility,
  VisibilityOff,
  Check,
  Close,
  FlightTakeoff,
  Hotel,
  StarRate,
  Favorite,
  Explore,
  BeachAccess,
  Hiking,
  Restaurant,
  Camera,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [editMode, setEditMode] = useState(false);
  const [editPreferences, setEditPreferences] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    preferences: {
      favoriteDestination: '',
      travelStyle: '',
      interests: '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      // Name and email come from Firebase Auth (via user object)
      // Other fields come from MongoDB
      setFormData({
        name: user.name || '',  // From Firebase Auth
        email: user.email || '',  // From Firebase Auth
        phone: user.phone || '',  // From MongoDB
        location: user.location || '',  // From MongoDB
        bio: user.bio || '',  // From MongoDB
        preferences: {
          favoriteDestination: user.preferences?.favoriteDestination || '',  // From MongoDB
          travelStyle: user.preferences?.travelStyle || '',  // From MongoDB
          interests: user.preferences?.interests || '',  // From MongoDB
        },
      });
      // Restore avatar from user context
      if (user.avatar && !avatarPreview) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user, avatarPreview]);

  // Refresh formData when exiting edit mode to ensure latest data is displayed
  useEffect(() => {
    if (!editMode && user) {
      // Name and email come from Firebase Auth
      // Other fields come from MongoDB
      setFormData({
        name: user.name || '',  // From Firebase Auth
        email: user.email || '',  // From Firebase Auth
        phone: user.phone || '',  // From MongoDB
        location: user.location || '',  // From MongoDB
        bio: user.bio || '',  // From MongoDB
        preferences: {
          favoriteDestination: user.preferences?.favoriteDestination || '',  // From MongoDB
          travelStyle: user.preferences?.travelStyle || '',  // From MongoDB
          interests: user.preferences?.interests || '',  // From MongoDB
        },
      });
    }
  }, [editMode, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // If the field is a preference, update nested object
    if (["favoriteDestination", "travelStyle", "interests"].includes(name)) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Image size should be less than 5MB', severity: 'error' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Automatically save avatar
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file) => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', file);
      
      const res = await import('../services/api');
      const api = res.default;
      const result = await api.makeRequest('/auth/profile/avatar', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (result.success && result.user) {
        setSnackbar({ open: true, message: 'Avatar uploaded successfully!', severity: 'success' });
        setAvatarFile(null);
        
        // Update user context with the new avatar
        const updatedUser = { ...user, avatar: result.user.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Don't call updateProfile - keep avatarPreview displayed
      } else {
        throw new Error(result.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to upload avatar', severity: 'error' });
      setAvatarFile(null);
      // Keep avatarPreview visible even if upload fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Only send profile fields (phone, location, bio, preferences)
      // Name and email are NOT sent - they come from Firebase Auth
      const payload = {
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        preferences: formData.preferences,
      };
      const result = await updateProfile(payload);
      if (result.success) {
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        setEditMode(false);
        // The useEffect will automatically update formData when user changes
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const payload = {
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        preferences: formData.preferences,
      };
      const result = await updateProfile(payload);
      if (result.success) {
        setSnackbar({ open: true, message: 'Travel preferences updated successfully!', severity: 'success' });
        setEditPreferences(false);
      } else {
        throw new Error(result.error || 'Failed to update preferences');
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to update preferences', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    setLoading(true);
    try {
      const payload = {
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        preferences: formData.preferences,
      };
      const result = await updateProfile(payload);
      if (result.success) {
        setSnackbar({ open: true, message: 'About me updated successfully!', severity: 'success' });
        setEditBio(false);
      } else {
        throw new Error(result.error || 'Failed to update bio');
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to update bio', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await import('../services/api');
      const api = res.default;
      const result = await api.makeRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (result.success) {
        setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
        setChangePasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(result.error || 'Failed to change password');
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to change password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data from user object (name/email from Firebase, rest from MongoDB)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      preferences: {
        favoriteDestination: user.preferences?.favoriteDestination || '',
        travelStyle: user.preferences?.travelStyle || '',
        interests: user.preferences?.interests || '',
      },
    });
    setEditMode(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth={false} sx={{ width: '100%', maxWidth: 1100, px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#000',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 1
            }}
          >
            <Person sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }} />
            My Profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' } }}>
            Manage your account and travel preferences
          </Typography>
        </Box>
          {/* Left Column - Profile Info */}
        {/* Profile Card */}
        <Paper
          elevation={1}
          sx={{
            width: '100%',
            maxWidth: 1100,
            mx: 'auto',
            p: { xs: 2, sm: 2.5 },
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
          }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                <Box sx={{ position: 'relative'}}>
                  <Avatar
                    src={avatarPreview || user.avatar}
                    sx={{
                      width: { xs: 70, sm: 80, md: 85 },
                      height: { xs: 70, sm: 80, md: 85 },
                      bgcolor: '#000',
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                      fontWeight: 700,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <input
                    accept="image/*"
                    type="file"
                    id="avatar-upload"
                    hidden
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'white',
                        boxShadow: 2,
                        border: '1px solid #e0e0e0',
                        width: { xs: 28, sm: 30 },
                        height: { xs: 28, sm: 30 },
                        '&:hover': {
                          bgcolor: '#000',
                          '& .MuiSvgIcon-root': { color: 'white' },
                        },
                      }}
                      size="small"
                    >
                      <PhotoCamera sx={{ fontSize: { xs: 14, sm: 16 }}} />
                    </IconButton>
                  </label>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }, mb: 0.25 }}>
                    {user.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' } }}>
                    {user.email}
                  </Typography>
                </Box>
                {!editMode && (
                  <Button
                    startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setEditMode(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#000',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      display: { xs: 'none', sm: 'flex' },
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Stack>

              {!editMode && (
                <Button
                  fullWidth
                  startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                  onClick={() => setEditMode(true)}
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#e0e0e0',
                    color: '#000',
                    fontSize: '0.8rem',
                    display: { xs: 'flex', sm: 'none' },
                    mb: 2,
                    py: 1,
                    '&:hover': {
                      borderColor: '#000',
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  Edit Profile
                </Button>
              )}

              <Divider sx={{ my: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Full Name
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      name="name"
                      value={formData.name}
                      disabled
                      helperText="Name cannot be changed (from login/register)"
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: '#f5f5f5'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.name || 'Not set'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Email
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      helperText="Email cannot be changed (from login/register)"
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: '#f5f5f5'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.email || 'Not set'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Phone
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(+91) 9876543211"
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: 'white'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.phone || 'Not set'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Location
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="California"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ fontSize: 18, color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: 'white'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.location || 'Not set'}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {editMode && (
                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      borderColor: '#e0e0e0',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#000',
                        bgcolor: '#f5f5f5',
                        color: '#000',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      bgcolor: '#000',
                      '&:hover': {
                        bgcolor: '#212121',
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Paper>

            {/* Unified Profile Information Card */}
            <Paper
              elevation={1}
              sx={{
                width: '100%',
                maxWidth: 1100,
                mx: 'auto',
                borderRadius: 2,
                p: { xs: 2, sm: 2.5 },
                mb: { xs: 2, sm: 3 },
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                overflow: 'hidden'
              }}
            >
              {/* Travel Preferences Section */}
              <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.125rem' } }}>
                    Travel Preferences
                  </Typography>
                  {!editPreferences && (
                    <IconButton
                      onClick={() => setEditPreferences(true)}
                      size="small"
                      sx={{
                        color: '#000',
                        bgcolor: '#f5f5f5',
                        '&:hover': {
                          bgcolor: '#e0e0e0',
                        }
                      }}
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>

              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Favorite Destination
                  </Typography>
                  {editPreferences ? (
                    <TextField
                      fullWidth
                      size="small"
                      name="favoriteDestination"
                      value={formData.preferences.favoriteDestination}
                      onChange={handleInputChange}
                      placeholder="e.g., Kerala, Bali"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BeachAccess sx={{ fontSize: 18, color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: 'white'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.preferences?.favoriteDestination || 'Not set'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Travel Style
                  </Typography>
                  {editPreferences ? (
                    <TextField
                      fullWidth
                      size="small"
                      name="travelStyle"
                      value={formData.preferences.travelStyle}
                      onChange={handleInputChange}
                      placeholder="e.g., Adventure, Luxury"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Hiking sx={{ fontSize: 18, color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: 'white'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.preferences?.travelStyle || 'Not set'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Interests
                  </Typography>
                  {editPreferences ? (
                    <TextField
                      fullWidth
                      size="small"
                      name="interests"
                      value={formData.preferences.interests}
                      onChange={handleInputChange}
                      placeholder="e.g., Photography, Food, Culture"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Camera sx={{ fontSize: 18, color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          backgroundColor: 'white',
                          paddingX: 0.5
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          bgcolor: 'white'
                        },
                        '& .MuiInputBase-input': {
                          py: '10px'
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {user.preferences?.interests || 'Not set'}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {editPreferences && (
                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditPreferences(false);
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          favoriteDestination: user.preferences?.favoriteDestination || '',
                          travelStyle: user.preferences?.travelStyle || '',
                          interests: user.preferences?.interests || '',
                        },
                      }));
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      borderColor: '#e0e0e0',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#000',
                        bgcolor: '#f5f5f5',
                        color: '#000',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSavePreferences}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      bgcolor: '#000',
                      '&:hover': {
                        bgcolor: '#212121',
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
              </Box>

              <Divider />

              {/* About Me Section */}
              <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    About Me
                  </Typography>
                  {!editBio && (
                    <IconButton
                      onClick={() => setEditBio(true)}
                      size="small"
                      sx={{
                        color: '#000',
                        bgcolor: '#f5f5f5',
                        '&:hover': {
                          bgcolor: '#e0e0e0',
                        }
                      }}
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>

              {editBio ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Share your travel stories..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      borderRadius: 2,
                    },
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                  {user.bio || 'No bio added yet. Share your travel journey!'}
                </Typography>
              )}

              {editBio && (
                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditBio(false);
                      setFormData(prev => ({
                        ...prev,
                        bio: user.bio || '',
                      }));
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      borderColor: '#e0e0e0',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#000',
                        bgcolor: '#f5f5f5',
                        color: '#000',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveBio}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      bgcolor: '#000',
                      '&:hover': {
                        bgcolor: '#212121',
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
              </Box>

              <Divider />

              {/* Security Section */}
              <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Security
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Keep your account secure
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Lock sx={{ fontSize: 18 }} />}
                    onClick={() => setChangePasswordDialog(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 0.75,
                      px: 2,
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      borderColor: '#e0e0e0',
                      color: '#000',
                      '&:hover': {
                        borderColor: '#000',
                        bgcolor: '#f5f5f5',
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </Box>

              <Divider />

              {/* Member Since Section */}
              <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 45,
                      height: 45,
                      borderRadius: '50%',
                      bgcolor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp sx={{ color: '#000', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      Member Since
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                      {user.createdAt ? (() => {
                        const d = new Date(user.createdAt);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}-${month}-${year}`;
                      })() : 'Recently joined'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>

            {/* Travel Stats - Commented out */}
            {/* <Paper
              elevation={1}
              sx={{
                width: '100%',
                maxWidth: 1100,
                height: 180,
                mx: 'auto',
                p: { xs: 2, sm: 2.5 },
                mb: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
              }}
            > */}
              {/* <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Travel Stats
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: '#f8f9fa', borderRadius: 2 , height: '100px', width: '100px' }}>
                    <FlightTakeoff sx={{ color: '#000', fontSize: 22, mb: 0.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#000', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {user.tripsPlanned || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Trips Planned
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: '#f8f9fa', borderRadius: 2, height: '100px', width: '100px' }}>
                    <Explore sx={{ color: '#4caf50', fontSize: 22, mb: 0.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#4caf50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {user.placesVisited || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Places Visited
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: '#f8f9fa', borderRadius: 2 , height: '100px', width: '100px'}}>
                    <StarRate sx={{ color: '#FFA500', fontSize: 22, mb: 0.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFA500', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {user.reviewsWritten || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Reviews
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: '#f8f9fa', borderRadius: 2 , height: '100px', width: '100px'}}>
                    <Favorite sx={{ color: '#e91e63', fontSize: 22, mb: 0.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#e91e63', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {user.savedDestinations || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Saved
                    </Typography>
                  </Box>
                </Grid>
              </Grid> */}
            {/* </Paper> */}
        </Container>

        {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type={showPassword.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setChangePasswordDialog(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordUpdate}
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
