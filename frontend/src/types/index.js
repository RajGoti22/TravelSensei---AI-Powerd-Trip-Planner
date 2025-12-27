// Type definitions using JSDoc comments for better IDE support

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} [avatar]
 * @property {UserPreferences} preferences
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string[]} destinations
 * @property {'budget'|'mid-range'|'luxury'} travelStyle
 * @property {string[]} activityTypes
 * @property {'hotel'|'hostel'|'apartment'|'resort'} accommodationPreference
 * @property {string[]} dietaryRestrictions
 * @property {'short'|'medium'|'long'} travelDuration
 * @property {'solo'|'couple'|'family'|'group'} groupSize
 */

/**
 * @typedef {Object} Itinerary
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} destination
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {ItineraryDay[]} days
 * @property {number} budget
 * @property {string} currency
 * @property {string} createdBy
 * @property {Date} createdAt
 * @property {number} likes
 * @property {Review[]} reviews
 */

/**
 * @typedef {Object} ItineraryDay
 * @property {number} day
 * @property {Date} date
 * @property {Activity[]} activities
 * @property {Accommodation} [accommodation]
 * @property {Transportation[]} [transportation]
 * @property {Meal[]} meals
 * @property {string} [notes]
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Location} location
 * @property {number} duration - in minutes
 * @property {number} cost
 * @property {string} currency
 * @property {'attraction'|'experience'|'tour'|'event'} category
 * @property {number} rating
 * @property {string[]} images
 * @property {string} [bookingUrl]
 * @property {Object} timeSlot
 * @property {Date} timeSlot.start
 * @property {Date} timeSlot.end
 */

/**
 * @typedef {Object} Location
 * @property {string} name
 * @property {string} address
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} city
 * @property {string} country
 */

/**
 * @typedef {Object} Accommodation
 * @property {string} id
 * @property {string} name
 * @property {'hotel'|'hostel'|'apartment'|'resort'|'guesthouse'} type
 * @property {Location} location
 * @property {number} pricePerNight
 * @property {string} currency
 * @property {number} rating
 * @property {string[]} amenities
 * @property {string[]} images
 * @property {string} [bookingUrl]
 * @property {Date} checkIn
 * @property {Date} checkOut
 */

/**
 * @typedef {Object} Transportation
 * @property {'flight'|'train'|'bus'|'car'|'taxi'|'metro'} type
 * @property {Location} from
 * @property {Location} to
 * @property {Date} departureTime
 * @property {Date} arrivalTime
 * @property {number} cost
 * @property {string} currency
 * @property {string} [bookingUrl]
 * @property {string} [details]
 */

/**
 * @typedef {Object} Meal
 * @property {'breakfast'|'lunch'|'dinner'|'snack'} type
 * @property {Object} [restaurant]
 * @property {string} restaurant.name
 * @property {Location} restaurant.location
 * @property {string} restaurant.cuisine
 * @property {'$'|'$$'|'$$$'|'$$$$'} restaurant.priceRange
 * @property {number} restaurant.rating
 * @property {number} [cost]
 * @property {string} [currency]
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {number} rating
 * @property {string} comment
 * @property {Date} createdAt
 * @property {number} helpful
 */

/**
 * @typedef {Object} BookingRequest
 * @property {'accommodation'|'activity'|'transportation'} type
 * @property {string} itemId
 * @property {string} userId
 * @property {Object} dates
 * @property {Date} dates.start
 * @property {Date} dates.end
 * @property {number} guests
 * @property {string} [specialRequests]
 */

/**
 * @typedef {Object} SearchFilters
 * @property {string} [destination]
 * @property {Object} [dateRange]
 * @property {Date} dateRange.start
 * @property {Date} dateRange.end
 * @property {Object} [budget]
 * @property {number} budget.min
 * @property {number} budget.max
 * @property {'budget'|'mid-range'|'luxury'} [travelStyle]
 * @property {number} [duration]
 * @property {string[]} [activities]
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} APIResponse
 * @template T
 * @property {boolean} success
 * @property {T} data
 * @property {string} [message]
 * @property {string} [error]
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email
 * @property {string} password
 * @property {string} name
 */

/**
 * @typedef {Object} LoginResponse
 * @property {User} user
 * @property {string} token
 */

export default {};