import { configureStore } from '@reduxjs/toolkit';
import itineraryReducer from './itinerarySlice';

export const store = configureStore({
  reducer: {
    itinerary: itineraryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for date objects
        ignoredActions: ['itinerary/updateFormData', 'itinerary/setDates'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.startDate', 'payload.endDate'],
        // Ignore these paths in the state
        ignoredPaths: ['itinerary.startDate', 'itinerary.endDate'],
      },
    }),
});

export default store;
