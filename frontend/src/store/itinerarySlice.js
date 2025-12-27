import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Form data from Step 1 & 2
  destination: '',
  startDate: null,
  endDate: null,
  groupSize: 1,
  budgetAmount: 5000,
  travelStyle: [],
  accommodation: [],
  pace: 'moderate',
  includeHiddenGems: true,
  includePopular: true,
  
  // Generated itinerary data
  generatedItinerary: null,
  
  // UI state
  isGenerating: false,
  isSaving: false,
  error: null,
};

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    // Update form data
    updateFormData: (state, action) => {
      return { ...state, ...action.payload };
    },
    
    // Set specific fields
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    
    setDates: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    
    setGroupSize: (state, action) => {
      state.groupSize = action.payload;
    },
    
    setBudget: (state, action) => {
      state.budgetAmount = action.payload;
    },
    
    setTravelStyle: (state, action) => {
      state.travelStyle = action.payload;
    },
    
    setAccommodation: (state, action) => {
      state.accommodation = action.payload;
    },
    
    setPace: (state, action) => {
      state.pace = action.payload;
    },
    
    setPreferences: (state, action) => {
      state.includeHiddenGems = action.payload.includeHiddenGems;
      state.includePopular = action.payload.includePopular;
    },
    
    // Set generated itinerary
    setGeneratedItinerary: (state, action) => {
      state.generatedItinerary = action.payload;
      state.isGenerating = false;
      state.error = null;
    },
    
    // Set loading states
    setIsGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    
    setIsSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isGenerating = false;
      state.isSaving = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset to initial state
    resetItinerary: () => initialState,
    
    // Clear generated itinerary only (keep form data)
    clearGeneratedItinerary: (state) => {
      state.generatedItinerary = null;
      state.isGenerating = false;
      state.error = null;
    },
  },
});

export const {
  updateFormData,
  setDestination,
  setDates,
  setGroupSize,
  setBudget,
  setTravelStyle,
  setAccommodation,
  setPace,
  setPreferences,
  setGeneratedItinerary,
  setIsGenerating,
  setIsSaving,
  setError,
  clearError,
  resetItinerary,
  clearGeneratedItinerary,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
