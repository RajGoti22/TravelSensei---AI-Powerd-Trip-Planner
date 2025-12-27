import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Fade,
  Slide,
  Alert,
  Snackbar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Group,
  AttachMoney,
  AutoAwesome,
  NavigateNext,
  NavigateBefore,
  Save,
  Refresh,
  CheckCircle,
  TravelExplore,
  Hotel,
  Restaurant,
  LocalActivity,
  AccessTime,
  Star,
  Map,
  Event,
  Psychology,
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import { itineraryService } from '../services/itineraryService';
import {
  updateFormData,
  setGeneratedItinerary,
  setIsGenerating,
  setIsSaving,
  setError,
  clearError,
  clearGeneratedItinerary,
  resetItinerary,
} from '../store/itinerarySlice';

const steps = ['Destination & Dates', 'Preferences & Details', 'AI Generation'];

// Travel preferences options
const travelStyles = [
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'relaxation', label: 'Relaxation', icon: '🏖️' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'foodie', label: 'Foodie', icon: '🍜' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'spiritual', label: 'Spiritual', icon: '🕉️' },
];

const budgetRanges = [
  { value: 'budget', label: 'Budget-Friendly', range: '< ₹10,000', icon: '💰' },
  { value: 'moderate', label: 'Moderate', range: '₹10,000 - ₹30,000', icon: '💵' },
  { value: 'luxury', label: 'Luxury', range: '₹30,000 - ₹75,000', icon: '💎' },
  { value: 'premium', label: 'Premium', range: '> ₹75,000', icon: '👑' },
];

const accommodationTypes = [
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'resort', label: 'Resort', icon: '🏝️' },
  { value: 'homestay', label: 'Homestay', icon: '🏡' },
  { value: 'hostel', label: 'Hostel', icon: '🛏️' },
  { value: 'villa', label: 'Villa', icon: '🏰' },
];

const ItineraryCreatorNew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();

  // Get data from Redux store
  const formData = useSelector((state) => state.itinerary);
  const isGenerating = useSelector((state) => state.itinerary.isGenerating);
  const isSaving = useSelector((state) => state.itinerary.isSaving);
  const generatedItinerary = useSelector((state) => state.itinerary.generatedItinerary);

  // Local state for UI only
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingItineraryId, setEditingItineraryId] = useState(null);

  // Reset form when entering without edit data, or prefill when editing
  useEffect(() => {
    const editingItinerary = location.state?.editingItinerary;
    
    if (!editingItinerary) {
      // No edit data - reset form to initial state
      dispatch(resetItinerary());
      setEditingItineraryId(null);
      setActiveStep(0);
      return;
    }

    // Prefill form when arriving from an edit action
    const dayPlans = editingItinerary.dayPlans || editingItinerary.day_plans || editingItinerary.days || [];

    dispatch(updateFormData({
      destination: editingItinerary.destination || formData.destination || '',
      startDate: editingItinerary.startDate
        ? dayjs(editingItinerary.startDate)
        : editingItinerary.start_date
        ? dayjs(editingItinerary.start_date)
        : formData.startDate,
      endDate: editingItinerary.endDate
        ? dayjs(editingItinerary.endDate)
        : editingItinerary.end_date
        ? dayjs(editingItinerary.end_date)
        : formData.endDate,
      groupSize: editingItinerary.groupSize || editingItinerary.group_size || formData.groupSize || 1,
      budgetAmount: editingItinerary.budgetPerPerson || editingItinerary.budgetAmount || editingItinerary.budget || formData.budgetAmount,
      travelStyle: editingItinerary.travelStyle || editingItinerary.interests || formData.travelStyle || [],
      accommodation: editingItinerary.accommodation || formData.accommodation || [],
      pace: editingItinerary.pace || formData.pace,
      includeHiddenGems: editingItinerary.includeHiddenGems ?? formData.includeHiddenGems,
      includePopular: editingItinerary.includePopular ?? formData.includePopular,
    }));

    dispatch(setGeneratedItinerary({
      ...editingItinerary,
      dayPlans,
      day_plans: dayPlans,
      days: dayPlans,
    }));

    setEditingItineraryId(editingItinerary.id);
    setActiveStep(0);
  }, [location.state, dispatch]);

  // Handle form field changes
  const handleChange = (field, value) => {
    dispatch(updateFormData({ [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Toggle travel style selection
  const toggleTravelStyle = (style) => {
    const newTravelStyle = formData.travelStyle.includes(style)
      ? formData.travelStyle.filter(s => s !== style)
      : [...formData.travelStyle, style];
    dispatch(updateFormData({ travelStyle: newTravelStyle }));
  };

  const toggleAccommodation = (type) => {
    const newAccommodation = formData.accommodation.includes(type)
      ? formData.accommodation.filter(t => t !== type)
      : [...formData.accommodation, type];
    dispatch(updateFormData({ accommodation: newAccommodation }));
  };

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.destination.trim()) {
      newErrors.destination = 'Please enter a destination';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Please select start date';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Please select end date';
    }
    if (formData.startDate && formData.endDate) {
      if (dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (dayjs(formData.startDate).isBefore(dayjs().subtract(1, 'day'))) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const newErrors = {};
    if (formData.travelStyle.length === 0) {
      newErrors.travelStyle = 'Please select at least one travel style';
    }
    if (formData.groupSize < 1) {
      newErrors.groupSize = 'Group size must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Next button
  const handleNext = () => {
    let isValid = true;
    if (activeStep === 0) {
      isValid = validateStep1();
    } else if (activeStep === 1) {
      isValid = validateStep2();
    }

    if (isValid) {
      if (activeStep === 1) {
        // Last step before generation - generate itinerary
        generateItinerary();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  // Handle Back button
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Calculate duration in days
  const getDurationDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = dayjs(formData.startDate);
      const end = dayjs(formData.endDate);
      const diff = end.diff(start, 'day') + 1;
      console.log(`📅 Date calculation: start=${formData.startDate}, end=${formData.endDate}, diff=${end.diff(start, 'day')}, duration=${diff}`);
      return diff;
    }
    return 0;
  };

  // Generate itinerary using Gemini AI backend
  const generateItinerary = async () => {
    dispatch(clearGeneratedItinerary());
    dispatch(setIsGenerating(true));
    setActiveStep(2);
    try {
      const durationDays = getDurationDays();
      if (durationDays < 1 || durationDays > 30) {
        throw new Error('Invalid trip duration. Please select valid dates.');
      }
      // Prepare request for Gemini AI backend
      // Format start_date as YYYY-MM-DD (required by backend)
      const startDate = formData.startDate
        ? dayjs(formData.startDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'); // Fallback to today if not set

      const requestData = {
        destination: formData.destination,
        duration_days: durationDays,
        start_date: startDate, // Required by backend
        budget: formData.budgetAmount,
        group_size: formData.groupSize,
        interests: formData.travelStyle,
      };
      console.log('Gemini AI Request Data:', requestData);
      const response = await itineraryService.generateAIItinerary(requestData);
      // If backend returns {{ success, message, itinerary }}, use response.itinerary
      const newItinerary = response.itinerary || response;
      
      // Preserve editingItineraryId when regenerating during edit
      if (editingItineraryId) {
        newItinerary.id = editingItineraryId;
      }
      
      dispatch(setGeneratedItinerary(newItinerary));
      setSnackbar({
        open: true,
        message: 'Itinerary generated successfully! 🎉',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      dispatch(setError(error.message || 'Failed to generate itinerary'));
      setSnackbar({
        open: true,
        message: error.message || 'Failed to generate itinerary. Please try again.',
        severity: 'error'
      });
      setActiveStep(1);
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  // Save itinerary to dashboard
  const handleSaveItinerary = async () => {
    if (!generatedItinerary) return;

    dispatch(setIsSaving(true));
    try {
      const userId = user?.id || (window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')).id : undefined);
      const dayByDay = generatedItinerary.dayPlans || generatedItinerary.day_plans || generatedItinerary.days || [];
      const itineraryToSave = {
        ...generatedItinerary,
        id: editingItineraryId || generatedItinerary.id,
        dayPlans: dayByDay,
        day_plans: dayByDay,
        destination: formData.destination,
        startDate: dayjs(formData.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(formData.endDate).format('YYYY-MM-DD'),
        groupSize: formData.groupSize,
        totalBudget: formData.budgetAmount * formData.groupSize,
        budgetPerPerson: formData.budgetAmount,
        budgetRange: formData.budget,
        travelStyle: formData.travelStyle,
        accommodation: formData.accommodation,
        pace: formData.pace,
        includeHiddenGems: formData.includeHiddenGems,
        includePopular: formData.includePopular,
        duration: getDurationDays(),
      };
      const { itineraryService } = await import('../services/itineraryService');

      if (editingItineraryId) {
        await itineraryService.updateItinerary(editingItineraryId, itineraryToSave, userId);
      } else {
        await itineraryService.saveItinerary(itineraryToSave, userId);
      }

      setSnackbar({
        open: true,
        message: editingItineraryId ? 'Itinerary updated! ✅' : 'Itinerary saved to dashboard! ✅',
        severity: 'success'
      });

      // Reset form state before navigating
      dispatch(resetItinerary());
      setEditingItineraryId(null);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      dispatch(setError(error.message || 'Failed to save itinerary'));
      setSnackbar({
        open: true,
        message: 'Failed to save itinerary. Please try again.',
        severity: 'error'
      });
    } finally {
      dispatch(setIsSaving(false));
    }
  };

  // Regenerate itinerary
  const handleRegenerate = () => {
    generateItinerary();
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Render Step 1: Destination & Dates
  const renderStep1 = () => (
    <Fade in timeout={600}>
      <Box>
        <Box textAlign="center" mb={3}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#f5f5f5', color: '#000', mx: 'auto', mb: 1.5 }}>
            <TravelExplore sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            Where would you like to go?
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
            Tell us your dream destination and travel dates
          </Typography>
        </Box>

        <Stack spacing={3} sx={{ maxWidth: '700px', mx: 'auto' }}>
          {/* Destination Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="inherit" fontSize="small" /> Enter Your Destination
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Kerala, Mumbai, Goa..."
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              error={!!errors.destination}
              helperText={errors.destination || 'Enter the name of your dream destination'}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                }
              }}
            />
          </Box>

          {/* Date Pickers Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={0.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="inherit" fontSize="small" /> Choose Your Travel Dates
            </Typography>
            <Grid container spacing={2} >
              <Grid item xs={12} sm={6} sx={{mt:1}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    format="DD-MM-YYYY"
                    value={formData.startDate}
                    onChange={(newValue) => handleChange('startDate', newValue)}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!errors.startDate,
                        helperText: errors.startDate || 'When does your trip begin?',
                        sx: {
                          width: '100%',
                          minWidth: '200px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                           
                            padding: '10px 12px',
                            width: '100%',
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '12px 4px',
                            fontSize: '1rem',
                           
                            width: '100%',
                          },
                          '& .MuiOutlinedInput-input::placeholder': {
                            opacity: 1,
                      
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} sx={{mt:1}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    format="DD-MM-YYYY"
                    value={formData.endDate}
                    onChange={(newValue) => handleChange('endDate', newValue)}
                    minDate={formData.startDate || dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!errors.endDate,
                        helperText: errors.endDate || 'When does your trip end?',
                        sx: {
                          width: '100%',
                          minWidth: '200px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            padding: '10px 12px',
                            width: '100%',
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '12px 4px',
                            marginTop:0.5,
                            fontSize: '1rem',
                            width: '100%',
                          },
                          '& .MuiOutlinedInput-input::placeholder': {
                            opacity: 1,
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>

          {/* Duration Display */}
          {formData.startDate && formData.endDate && getDurationDays() > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: 'grey.50', display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
              <AccessTime sx={{ color: '#000', fontSize: '1.2rem' }} />
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {getDurationDays()} {getDurationDays() === 1 ? 'Day' : 'Days'} Trip
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  {dayjs(formData.startDate).format('DD-MM-YYYY')} - {dayjs(formData.endDate).format('DD-MM-YYYY')}
                </Typography>
              </Box>
            </Paper>
          )}
        </Stack>

        {/* Buttons inside widget */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<NavigateBefore />}
            size="medium"
            sx={{
              borderColor: '#000',
              color: '#000',
              '&:hover': {
                borderColor: '#000',
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<NavigateNext />}
            size="medium"
            sx={{
              bgcolor: '#000',
              color: 'white',
              '&:hover': {
                bgcolor: '#212121'
              }
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  // Render Step 2: Preferences & Details
  const renderStep2 = () => (
    <Fade in timeout={600}>
      <Box>
        <Box textAlign="center" mb={{ xs: 2, sm: 3 }}>
          <Avatar sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 }, bgcolor: '#f5f5f5', color: '#000', mx: 'auto', mb: 1.5 }}>
            <Psychology sx={{ fontSize: { xs: 28, sm: 32 } }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" fontSize={{ xs: '1.25rem', sm: '1.5rem' }}>
            Personalize Your Journey
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
            Help us create the perfect itinerary for you
          </Typography>
        </Box>

        <Stack spacing={{ xs: 3, sm: 3.5 }} sx={{ maxWidth: '900px', mx: 'auto', px: { xs: 0, sm: 1 } }}>
          {/* Travel Style */}
          <Box sx={{ px: 0.5, py: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
              <Star color="inherit" fontSize="small" /> What's your travel style?
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', px: 0.5 }}>
              {travelStyles.map((style) => (
                <Box
                  key={style.value}
                  onClick={() => toggleTravelStyle(style.value)}
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: formData.travelStyle.includes(style.value) ? '#000' : 'divider',
                    bgcolor: formData.travelStyle.includes(style.value) ? '#000' : 'background.paper',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: formData.travelStyle.includes(style.value) ? '#000' : 'grey.50',
                      borderColor: '#000',
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    borderRadius: 2,
                    height: { xs: 85, sm: 88 },
                    width: { xs: 85, sm: 88 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 0.75, sm: 1 },
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography
                    variant="h6"
                    mb={{ xs: 0.25, sm: 0.3 }}
                    fontSize={{ xs: '1.3rem', sm: '1.4rem' }}
                    sx={{
                      lineHeight: 1,
                      filter: formData.travelStyle.includes(style.value) ? 'brightness(1.2)' : 'none'
                    }}
                  >
                    {style.icon}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight="600"
                    fontSize={{ xs: '0.68rem', sm: '0.72rem' }}
                    textAlign="center"
                    sx={{
                      lineHeight: 1.2,
                      color: formData.travelStyle.includes(style.value) ? 'white' : 'text.primary'
                    }}
                  >
                    {style.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            {errors.travelStyle && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {errors.travelStyle}
              </Typography>
            )}
          </Box>

          {/* Group Size and Budget */}
          <Box>
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {/* Group Size */}
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Group color="inherit" fontSize="small" /> Group Size
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      bgcolor: 'background.paper',
                      px: 2,
                      py: 1.25,
                      minWidth: 130,
                      gap: 1,
                    }}
                  >
                    <TextField
                      type="number"
                      value={formData.groupSize}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === '0') {
                          handleChange('groupSize', '');
                        } else {
                          handleChange('groupSize', parseInt(value) || 1);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || parseInt(e.target.value) < 1) {
                          handleChange('groupSize', 1);
                        }
                      }}
                      error={!!errors.groupSize}
                      inputProps={{ min: 1, max: 20 }}
                      variant="standard"
                      sx={{
                        width: 60,
                        '& .MuiInput-root': {
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          '&:before, &:after': {
                            borderBottom: 'none',
                          },
                        },
                        '& input': {
                          textAlign: 'center',
                          padding: 0,
                        }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      {formData.groupSize === 1 ? 'traveler' : 'travelers'}
                    </Typography>
                  </Box>
                  {errors.groupSize && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.groupSize}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Budget */}
              <Grid item xs={12} md={8}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AttachMoney color="inherit" fontSize="small" /> Budget (per person)
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={formData.budgetAmount}
                      onChange={(e) => handleChange('budgetAmount', parseInt(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        inputProps: { min: 0, step: 500 },
                      }}
                      label="Budget per person"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, rowGap: 1, maxWidth: '100%', px: 1, py: 0.5 }}>
                      {budgetRanges.map((range) => {
                        const selected = formData.budget === range.value;
                        return (
                          <Chip
                            key={range.value}
                            label={`${range.icon} ${range.label}`}
                            onClick={() => {
                              handleChange('budget', range.value);
                              const amounts = { budget: 7500, moderate: 25000, luxury: 50000, premium: 100000 };
                              handleChange('budgetAmount', amounts[range.value]);
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleChange('budget', range.value);
                                const amounts = { budget: 7500, moderate: 25000, luxury: 50000, premium: 100000 };
                                handleChange('budgetAmount', amounts[range.value]);
                              }
                            }}
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 30, sm: 34 },
                              borderRadius: 999,
                              position: 'relative',
                              background: selected
                                ? 'linear-gradient(135deg,#000 0%,#222 100%)'
                                : 'linear-gradient(135deg,#f7f7f7 0%,#ededed 100%)',
                              border: selected ? '2px solid #000' : '1px solid #d5d5d5',
                              boxShadow: selected
                                ? '0 3px 6px -1px rgba(0,0,0,0.40), 0 0 0 1px rgba(0,0,0,0.60)'
                                : '0 2px 4px -1px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
                              color: selected ? '#fff' : '#222',
                              fontWeight: selected ? 600 : 500,
                              px: { xs: 1.2, sm: 1.6 },
                              transition: 'background .3s ease, box-shadow .25s ease, transform .18s ease, color .25s',
                              display: 'flex',
                              alignItems: 'center',
                              '& .MuiChip-label': {
                                px: 0,
                                color: selected ? '#fff' : '#222',
                                fontWeight: selected ? 700 : 500,
                              },
                              '&:hover': {
                                background: selected
                                  ? 'linear-gradient(135deg,#111 0%,#000 100%)'
                                  : 'linear-gradient(135deg,#f2f2f2 0%,#e4e4e4 100%)',
                                boxShadow: selected
                                  ? '0 6px 12px -2px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.65)'
                                  : '0 4px 8px -2px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.12)',
                              },
                              '&:active': {
                                transform: 'translateY(1px)',
                                boxShadow: selected
                                  ? '0 2px 4px -1px rgba(0,0,0,0.40), 0 0 0 1px rgba(0,0,0,0.55)'
                                  : '0 1px 2px -1px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.10)'
                              },
                              '&:focus-visible': {
                                outline: '2px solid #000',
                                outlineOffset: '2px'
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Accommodation Type */}
          <Box sx={{ px: 0.5, py: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
              <Hotel color="inherit" fontSize="small" /> Accommodation (Select one or more)
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', px: 0.5 }}>
              {accommodationTypes.map((type) => (
                <Box
                  key={type.value}
                  onClick={() => toggleAccommodation(type.value)}
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: formData.accommodation.includes(type.value) ? '#000' : 'divider',
                    bgcolor: formData.accommodation.includes(type.value) ? '#000' : 'background.paper',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#000',
                      bgcolor: formData.accommodation.includes(type.value) ? '#000' : 'grey.50',
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    borderRadius: 2,
                    height: 88,
                    width: 88,
                    textAlign: 'center',
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography
                    variant="h6"
                    mb={0.3}
                    fontSize="1.4rem"
                    sx={{
                      lineHeight: 1,
                      filter: formData.accommodation.includes(type.value) ? 'brightness(1.2)' : 'none'
                    }}
                  >
                    {type.icon}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight="600"
                    fontSize="0.72rem"
                    sx={{
                      lineHeight: 1.2,
                      color: formData.accommodation.includes(type.value) ? 'white' : 'text.primary'
                    }}
                  >
                    {type.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Special Preferences */}
          <Box sx={{ px: 1.5, py: 0.5, overflow: 'visible' }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <AutoAwesome color="inherit" fontSize="small" /> Special Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, maxWidth: 700 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                <Box
                  onClick={() => handleChange('includePopular', !formData.includePopular)}
                  sx={{
                    cursor: 'pointer',
                    background: formData.includePopular
                      ? 'linear-gradient(135deg, #000 0%, #222 100%)'
                      : 'linear-gradient(135deg, #f7f7f7 0%, #ededed 100%)',
                    border: formData.includePopular ? '2px solid #000' : '1px solid #ddd',
                    boxShadow: formData.includePopular
                      ? '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)'
                      : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                    '&:hover': {
                      background: formData.includePopular
                        ? 'linear-gradient(135deg, #111 0%, #2a2a2a 100%)'
                        : 'linear-gradient(135deg, #f2f2f2 0%, #e8e8e8 100%)',
                      boxShadow: formData.includePopular
                        ? '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.10)'
                        : '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                      boxShadow: formData.includePopular
                        ? '0 1px 4px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)'
                        : '0 1px 2px rgba(0,0,0,0.04)',
                    },
                    borderRadius: 3,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.2,
                    pl: 2,
                    pr: 1.2,
                    py: 1.5,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontSize="1.5rem"
                    sx={{
                      flexShrink: 0,
                      filter: formData.includePopular ? 'brightness(1.2)' : 'none'
                    }}
                  >
                    🌟
                  </Typography>
                  <Box flex={1}>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      fontSize="0.85rem"
                      sx={{
                        mb: 0.3,
                        color: formData.includePopular ? 'white' : 'text.primary'
                      }}
                    >
                      Popular Attractions
                    </Typography>
                    <Typography
                      variant="caption"
                      fontSize="0.72rem"
                      sx={{
                        color: formData.includePopular ? 'rgba(255,255,255,0.85)' : 'text.secondary'
                      }}
                    >
                      Must-see famous spots
                    </Typography>
                  </Box>
                  <Box sx={{ width: '1.5rem', flexShrink: 0 }} />
                </Box>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                <Box
                  onClick={() => handleChange('includeHiddenGems', !formData.includeHiddenGems)}
                  sx={{
                    cursor: 'pointer',
                    background: formData.includeHiddenGems
                      ? 'linear-gradient(135deg, #000 0%, #222 100%)'
                      : 'linear-gradient(135deg, #f7f7f7 0%, #ededed 100%)',
                    border: formData.includeHiddenGems ? '2px solid #000' : '1px solid #ddd',
                    boxShadow: formData.includeHiddenGems
                      ? '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)'
                      : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: formData.includeHiddenGems
                        ? 'linear-gradient(135deg, #111 0%, #2a2a2a 100%)'
                        : 'linear-gradient(135deg, #f2f2f2 0%, #e8e8e8 100%)',
                      boxShadow: formData.includeHiddenGems
                        ? '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.10)'
                        : '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                      boxShadow: formData.includeHiddenGems
                        ? '0 1px 4px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)'
                        : '0 1px 2px rgba(0,0,0,0.04)',
                    },
                    borderRadius: 3,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.2,
                    pl: 2,
                    pr: 1.2,
                    py: 1.5,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontSize="1.5rem"
                    sx={{
                      flexShrink: 0,
                      filter: formData.includeHiddenGems ? 'brightness(1.2)' : 'none'
                    }}
                  >
                    💎
                  </Typography>
                  <Box flex={1}>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      fontSize="0.85rem"
                      sx={{
                        mb: 0.3,
                        color: formData.includeHiddenGems ? 'white' : 'text.primary'
                      }}
                    >
                      Hidden Gems
                    </Typography>
                    <Typography
                      variant="caption"
                      fontSize="0.72rem"
                      sx={{
                        color: formData.includeHiddenGems ? 'rgba(255,255,255,0.85)' : 'text.secondary'
                      }}
                    >
                      Off-the-beaten-path
                    </Typography>
                  </Box>
                  <Box sx={{ width: '2rem', flexShrink: 0 }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Buttons inside widget */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<NavigateBefore />}
              size="medium"
              sx={{
                borderColor: '#000',
                color: '#000',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<AutoAwesome />}
              size="medium"
              sx={{
                bgcolor: '#000',
                color: 'white',
                '&:hover': {
                  bgcolor: '#212121'
                }
              }}
            >
              Generate Itinerary
            </Button>
          </Box>
        </Stack>
      </Box>
    </Fade>
  );

  // Render Step 3: AI Generation & Results
  const renderStep3 = () => (
    <Fade in timeout={600}>
      <Box>
        {isGenerating ? (
          // Loading State
          <Box textAlign="center" py={5}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: '#000' }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Creating Your Perfect Itinerary...
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3} fontSize="0.9rem">
              Our AI is analyzing {formData.destination} to create the best experience for you
            </Typography>
            <Stack spacing={1.5} alignItems="center">
              {[
                '🗺️ Mapping out the best routes...',
                '🏨 Finding perfect accommodations...',
                '🌟 Including must-see attractions...',
                '💎 Discovering hidden gems...',
                '🍜 Adding local food experiences...',
              ].map((text, index) => (
                <Slide key={index} direction="left" in timeout={500 + index * 200}>
                  <Chip
                    label={text}
                    size="small"
                    sx={{
                      py: 1.5,
                      px: 1.5,
                      fontSize: '0.85rem',
                      bgcolor: '#f5f5f5',
                    }}
                  />
                </Slide>
              ))}
            </Stack>
          </Box>
        ) : generatedItinerary ? (
          // Results Display
          <Box>
            <Box textAlign="center" mb={3}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'success.main', mx: 'auto', mb: 1.5 }}>
                <CheckCircle sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Your Itinerary is Ready! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                {getDurationDays()} days of amazing experiences in {formData.destination}
              </Typography>
            </Box>

            {/* Itinerary Overview */}
            <Paper variant="outlined" sx={{ mb: 2.5, p: 2, borderRadius: 1.5, borderColor: '#e0e0e0' }}>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Event sx={{ fontSize: 32, mb: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      {getDurationDays()} Days
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      {dayjs(formData.startDate).format('DD-MM-YYYY')} - {dayjs(formData.endDate).format('DD-MM-YYYY')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Group sx={{ fontSize: 32, mb: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      {formData.groupSize || 1} {formData.groupSize === 1 ? 'Traveler' : 'Travelers'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      Group Size
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <AttachMoney sx={{ fontSize: 32, mb: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      ₹{((formData.budgetAmount || 0) * (formData.groupSize || 1)).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      Total Budget
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Group sx={{ fontSize: 32, mb: 0.5 }} />
                    <Typography variant="body1" fontWeight="bold">
                      {formData.groupSize || 1} {formData.groupSize === 1 ? 'Traveler' : 'Travelers'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      Person
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Day by Day Itinerary - moved above Travel Tips */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📅 Day-by-Day Plan
            </Typography>
            <Stack spacing={2}>
              {/* Fix: define dayByDay outside and map directly for proper scope */}
              {/* Fix: move dayByDay and map outside the IIFE for proper scope */}
              {(() => {
                const dayByDay = generatedItinerary?.dayPlans || generatedItinerary?.day_plans || generatedItinerary?.days || [];
                if (!isGenerating && generatedItinerary && Array.isArray(dayByDay) && dayByDay.length === 0) {
                  return (
                    <Alert severity="info" sx={{ borderRadius: 2, fontSize: '1rem', my: 2 }}>
                      No day-by-day plan could be generated for this itinerary. Please try regenerating or adjust your preferences.
                    </Alert>
                  );
                }
                if (!isGenerating && generatedItinerary && Array.isArray(dayByDay) && dayByDay.length > 0) {
                  return (
                    <>
                      {dayByDay.map((day, index) => (
                        <Card key={index} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                              <Avatar sx={{ bgcolor: '#000', width: 42, height: 42, fontWeight: 'bold', fontSize: '1rem' }}>
                                {day.day}
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="body1" fontWeight="bold">
                                  Day {day.day} - {day.theme || day.title || 'Exploration'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                  {day.date}
                                </Typography>
                              </Box>
                            </Stack>
                            <Divider sx={{ my: 1.5 }} />
                            {/* Activities */}
                            {/* Render locations if present, else render activities as locations, else show message */}
                            {Array.isArray(day.locations) && day.locations.length > 0 ? (
                              <Stack spacing={1.5}>
                                {day.locations.map((location, locIndex) => (
                                  <Box key={locIndex} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                    <Avatar sx={{ bgcolor: 'grey.900', color: 'grey.100', width: 36, height: 36, fontSize: '1.2rem' }}>
                                      {location.type === 'attraction' ? '🏛️' :
                                        location.type === 'restaurant' ? '🍽️' :
                                          location.type === 'hotel' ? '🏨' : '📍'}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="body2" fontWeight="600">
                                        {location.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" mb={0.5} display="block" fontSize="0.8rem">
                                        {location.description}
                                      </Typography>
                                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {(location.approx_time_mins || location.duration_hours || location.duration) && (
                                          <Chip
                                            size="small"
                                            icon={<AccessTime sx={{ fontSize: '0.9rem' }} />}
                                            label={`${location.approx_time_mins ? Math.round(location.approx_time_mins / 60) || 1 : location.duration_hours || location.duration || 2} hrs`}
                                            variant="outlined"
                                            sx={{ height: 24, fontSize: '0.7rem', borderColor: '#e0e0e0', color: '#000' }}
                                          />
                                        )}
                                        {location.estimated_cost > 0 && (
                                          <Chip
                                            size="small"
                                            label={`₹${location.estimated_cost.toLocaleString('en-IN')}`}
                                            variant="outlined"
                                            sx={{ height: 24, fontSize: '0.7rem', borderColor: '#4caf50', bgcolor: '#f1f8f4', color: '#2e7d32', fontWeight: 600 }}
                                          />
                                        )}
                                        <Chip
                                          size="small"
                                          icon={<Star sx={{ fontSize: '0.9rem' }} />}
                                          label={`${location.rating || '4.5'}/5`}
                                          variant="outlined"
                                          sx={{ height: 24, fontSize: '0.7rem', borderColor: '#e0e0e0', color: '#000' }}
                                        />
                                        <Chip
                                          size="small"
                                          label={location.best_time || location.bestTime || 'Anytime'}
                                          variant="outlined"
                                          sx={{ height: 24, fontSize: '0.7rem', borderColor: '#e0e0e0', color: '#000' }}
                                        />
                                      </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<LocationOn sx={{ fontSize: '0.9rem' }} />}
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + formData.destination)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          height: 32,
                                          fontSize: '0.7rem',
                                          textTransform: 'none',
                                          px: 1,
                                          whiteSpace: 'nowrap',
                                          borderColor: '#000',
                                          color: '#000',
                                          '&:hover': {
                                            borderColor: '#000',
                                            bgcolor: 'rgba(0,0,0,0.04)'
                                          }
                                        }}
                                      >
                                        Map
                                      </Button>
                                    </Stack>
                                  </Box>
                                ))}
                              </Stack>
                            ) : (Array.isArray(day.activities) && day.activities.length > 0 ? (
                              <Stack spacing={1.5}>
                                {day.activities.map((activity, actIndex) => (
                                  <Box key={actIndex} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                    <Avatar sx={{ bgcolor: 'grey.900', color: 'grey.100', width: 36, height: 36, fontSize: '1.2rem' }}>
                                      {activity.type === 'attraction' ? '🏛️' :
                                        activity.type === 'restaurant' ? '🍽️' :
                                          activity.type === 'hotel' ? '🏨' : '📍'}
                                    </Avatar>
                                    <Box flex={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight="600">
                                          {activity.name || activity.place}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block" fontSize="0.8rem">
                                          {activity.description || activity.details}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                          {(activity.approx_time_mins || activity.time) && (
                                            <Chip
                                              size="small"
                                              icon={<AccessTime sx={{ fontSize: '0.9rem' }} />}
                                              label={`${activity.approx_time_mins ? Math.round(activity.approx_time_mins / 60) || 1 : 2} hrs`}
                                              variant="outlined"
                                              sx={{ height: 24, fontSize: '0.7rem', borderColor: '#e0e0e0', color: '#000' }}
                                            />
                                          )}
                                          {activity.estimated_cost > 0 && (
                                            <Chip
                                              size="small"
                                              label={`₹${activity.estimated_cost.toLocaleString('en-IN')}`}
                                              variant="outlined"
                                              sx={{ height: 24, fontSize: '0.7rem', borderColor: '#4caf50', bgcolor: '#f1f8f4', color: '#2e7d32', fontWeight: 600 }}
                                            />
                                          )}
                                        </Stack>
                                      </Box>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<Map />}
                                        href={(() => {
                                          if (activity.coordinates && Array.isArray(activity.coordinates) && activity.coordinates.length === 2) {
                                            return `https://www.google.com/maps/search/?api=1&query=${activity.coordinates[0]},${activity.coordinates[1]}`;
                                          } else if (activity.address) {
                                            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}`;
                                          } else {
                                            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activity.name || activity.place) + ' ' + (generatedItinerary.destination || ''))}`;
                                          }
                                        })()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          height: 32,
                                          fontSize: '0.8rem',
                                          textTransform: 'none',
                                          px: 1.2,
                                          whiteSpace: 'nowrap',
                                          minWidth: 70,
                                          boxShadow: 1,
                                          borderRadius: 2,
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
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Alert severity="info" sx={{ borderRadius: 1, py: 0.5, bgcolor: '#f0f0f0', color: '#000', '& .MuiAlert-icon': { color: '#000' }, my: 1 }}>
                                <Typography variant="caption" fontSize="0.8rem">No activities or locations were generated for this day.</Typography>
                              </Alert>
                            ))}
                            {(day.notes || day.description) && (
                              <>
                                <Divider sx={{ my: 1 }} />
                                <Alert severity="success" sx={{ borderRadius: 1, py: 0.5, bgcolor: '#f0f0f0', color: '#000', '& .MuiAlert-icon': { color: '#000' } }}>
                                  <Typography variant="caption" fontSize="0.8rem">{day.notes || day.description}</Typography>
                                </Alert>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  );
                }
                return null;
              })()}

            </Stack>

            {/* Hotel Recommendations */}
            {(generatedItinerary.recommended_hotels || generatedItinerary.hotels)?.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  🏨 Recommended Hotels
                </Typography>
                <Grid container spacing={2}>
                  {(generatedItinerary.recommended_hotels || generatedItinerary.hotels)?.slice(0, 3).map((hotel, index) => {
                    // Use Gemini's price and rating if available
                    const price = hotel.price_per_night || hotel.price || hotel.priceNight || hotel.priceNightly || '3,500';
                    const rating = hotel.rating || hotel.stars || 4;
                    return (
                      <Grid item xs={12} sm={4} key={index}>
                        <Card sx={{ height: '100%', borderRadius: 2, '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }, border: '1px solid #e0e0e0' }}>
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              {hotel.name}
                            </Typography>
                            <Stack direction="row" spacing={0.5} mb={1} alignItems="center">
                              {[...Array(Math.floor(rating))].map((_, i) => (
                                <Star key={i} sx={{ color: 'gold', fontSize: 16 }} />
                              ))}
                              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                ({rating}/5)
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" mb={1} display="block" fontSize="0.8rem">
                              {hotel.description || hotel.location}
                            </Typography>
                            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                              <Chip label={hotel.type || formData.accommodation} size="small" sx={{ borderColor: '#e0e0e0', color: '#000' }} />
                              <Chip label={`₹${price}/night`} size="small" color="inherit" sx={{ borderColor: '#e0e0e0', color: '#000' }} />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )}

            {/* Travel Tips */}
            {(generatedItinerary.travel_tips || generatedItinerary.travelTips)?.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  💡 Travel Tips
                </Typography>
                <Grid container spacing={1.5}>
                  {(generatedItinerary.travel_tips || generatedItinerary.travelTips).map((tip, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card sx={{ borderRadius: 1.5, bgcolor: '#f8f8f8', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: '0.85rem', color: '#000' }}>
                            <CheckCircle sx={{ fontSize: '1rem', mt: 0.2, flexShrink: 0, color: '#000' }} /> {tip}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Estimated Total Cost Summary */}
            {generatedItinerary.estimated_total_cost && (
              <Paper 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  mt: 3,
                  border: '2px solid #4caf50', 
                  borderRadius: 2.5, 
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                  background: 'linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      bgcolor: '#4caf50', 
                      width: { xs: 48, sm: 56 }, 
                      height: { xs: 48, sm: 56 }, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: { xs: '1.5rem', sm: '1.8rem' },
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}>
                      💰
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, display: 'block', fontWeight: 500 }}>
                        Estimated Total Trip Cost
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32', fontSize: { xs: '1.5rem', sm: '1.8rem' } }}>
                        ₹{generatedItinerary.estimated_total_cost.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, color: '#2e7d32', fontWeight: 600, display: 'block' }}>
                      Per Person: ₹{Math.round(generatedItinerary.estimated_total_cost / (formData.groupSize || 1)).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, color: 'text.secondary', fontStyle: 'italic' }}>
                      *Estimated costs may vary based on season and availability
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<Refresh />}
                onClick={handleRegenerate}
                disabled={isGenerating}
                sx={{
                  borderColor: '#000',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#000',
                    bgcolor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Regenerate
              </Button>
              <Button
                variant="contained"
                size="medium"
                startIcon={<Save />}
                onClick={handleSaveItinerary}
                disabled={isSaving}
                sx={{
                  bgcolor: '#000',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#212121'
                  }
                }}
              >
                {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save to Dashboard'}
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 1.5, sm: 2 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box textAlign="center" mb={{ xs: 1.5, sm: 2 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            Create Your Dream Itinerary
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize={{ xs: '0.75rem', sm: '0.875rem' }}>
            Powered by AI • Personalized just for you
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper elevation={1} sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 2, overflow: 'visible', border: '1px solid #e0e0e0' }}>
          <Stepper
            activeStep={activeStep}
            sx={{
              p: { xs: 1.5, sm: 2 },
              '& .MuiStepIcon-root': {
                color: '#e0e0e0',
                '&.Mui-active': {
                  color: '#000',
                },
                '&.Mui-completed': {
                  color: '#000',
                }
              },
              '& .MuiStepConnector-root': {
                '& .MuiStepConnector-line': {
                  borderColor: '#e0e0e0',
                },
                '&.Mui-active .MuiStepConnector-line': {
                  borderColor: '#000',
                },
                '&.Mui-completed .MuiStepConnector-line': {
                  borderColor: '#000',
                }
              },
              '& .MuiStepLabel-label': {
                color: 'text.secondary',
                '&.Mui-active': {
                  color: '#000',
                  fontWeight: 600,
                },
                '&.Mui-completed': {
                  color: '#000',
                }
              },
              // Override any default blue colors
              '& .MuiStepIcon-text': {
                fill: 'white',
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, minHeight: { xs: '400px', sm: '450px' }, border: '1px solid #e0e0e0' }}>
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </Paper>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%', 
              borderRadius: 2,
              minWidth: '300px',
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
                fontWeight: 500
              }
            }}
          >
            {snackbar.message || 'Processing...'}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ItineraryCreatorNew;



