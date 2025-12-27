// Selectors for accessing itinerary state
export const selectFormData = (state) => state.itinerary;
export const selectDestination = (state) => state.itinerary.destination;
export const selectDates = (state) => ({
  startDate: state.itinerary.startDate,
  endDate: state.itinerary.endDate,
});
export const selectGroupSize = (state) => state.itinerary.groupSize;
export const selectBudget = (state) => state.itinerary.budgetAmount;
export const selectTravelStyle = (state) => state.itinerary.travelStyle;
export const selectAccommodation = (state) => state.itinerary.accommodation;
export const selectGeneratedItinerary = (state) => state.itinerary.generatedItinerary;
export const selectIsGenerating = (state) => state.itinerary.isGenerating;
export const selectIsSaving = (state) => state.itinerary.isSaving;
export const selectError = (state) => state.itinerary.error;
