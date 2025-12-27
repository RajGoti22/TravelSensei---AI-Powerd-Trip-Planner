# 📚 API Documentation - TravelSensei

This document provides comprehensive information about the TravelSensei Backend API endpoints.

## 🔗 Base URL
- **Development**: `http://localhost:5001`
- **Production**: `https://your-backend-domain.com`

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📋 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 🔒 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### Get User Profile
**GET** `/api/auth/profile`

Get current user's profile information.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "preferences": { ... },
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Update User Profile
**PUT** `/api/auth/profile`

Update user profile information.

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "preferences": {
    "currency": "USD",
    "language": "en"
  }
}
```

## 🤖 AI Endpoints

### Generate Itinerary
**POST** `/api/ai/generate-itinerary`

Generate AI-powered travel itinerary.

```http
POST /api/ai/generate-itinerary
Authorization: Bearer <token>
Content-Type: application/json

{
  "destination": "Paris, France",
  "duration": 5,
  "budget": "medium",
  "interests": ["culture", "food", "museums"],
  "travelStyle": "leisure"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itinerary": {
      "destination": "Paris, France",
      "duration": 5,
      "days": [
        {
          "day": 1,
          "title": "Arrival and City Center",
          "activities": [ ... ]
        }
      ]
    }
  }
}
```

### AI Chat Assistant
**POST** `/api/ai/chat`

Chat with AI travel assistant.

```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What are the best restaurants in Tokyo?",
  "context": "planning trip to Japan"
}
```

### Get Travel Recommendations
**POST** `/api/ai/recommend`

Get personalized travel recommendations.

```http
POST /api/ai/recommend
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": ["beach", "adventure", "wildlife"],
  "budget": "high",
  "season": "summer"
}
```

## 🗺️ Itinerary Endpoints

### Get All Itineraries
**GET** `/api/itineraries`

Retrieve itineraries with optional filtering.

```http
GET /api/itineraries?destination=paris&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `destination` (optional): Filter by destination
- `minDuration` (optional): Minimum duration in days
- `maxDuration` (optional): Maximum duration in days
- `budget` (optional): Budget level (low, medium, high)

### Get Single Itinerary
**GET** `/api/itineraries/:id`

Get detailed itinerary information.

```http
GET /api/itineraries/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

### Create Itinerary
**POST** `/api/itineraries`

Create a new itinerary.

```http
POST /api/itineraries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Amazing Paris Adventure",
  "destination": "Paris, France",
  "duration": 5,
  "budget": "medium",
  "description": "A wonderful trip to the City of Light",
  "days": [ ... ]
}
```

### Update Itinerary
**PUT** `/api/itineraries/:id`

Update existing itinerary.

```http
PUT /api/itineraries/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Paris Adventure",
  "description": "Updated description"
}
```

### Delete Itinerary
**DELETE** `/api/itineraries/:id`

Delete an itinerary.

```http
DELETE /api/itineraries/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

### Like/Unlike Itinerary
**POST** `/api/itineraries/:id/like`

Toggle like status for an itinerary.

```http
POST /api/itineraries/60f7b3b3b3b3b3b3b3b3b3b3/like
Authorization: Bearer <token>
```

### Save/Unsave Itinerary
**POST** `/api/itineraries/:id/save`

Toggle save status for an itinerary.

```http
POST /api/itineraries/60f7b3b3b3b3b3b3b3b3b3b3/save
Authorization: Bearer <token>
```

## 📅 Booking Endpoints

### Get User Bookings
**GET** `/api/bookings`

Get all bookings for the authenticated user.

```http
GET /api/bookings?status=active&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, cancelled)
- `type` (optional): Filter by type (flight, hotel, activity)
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Booking
**POST** `/api/bookings`

Create a new booking.

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "hotel",
  "details": {
    "name": "Hotel Example",
    "checkIn": "2023-07-01",
    "checkOut": "2023-07-05",
    "guests": 2
  },
  "totalAmount": 500,
  "currency": "USD"
}
```

### Update Booking
**PUT** `/api/bookings/:id`

Update booking details.

```http
PUT /api/bookings/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
Content-Type: application/json

{
  "details": {
    "guests": 3
  }
}
```

### Cancel Booking
**POST** `/api/bookings/:id/cancel`

Cancel a booking.

```http
POST /api/bookings/60f7b3b3b3b3b3b3b3b3b3b3/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

## ⭐ Review Endpoints

### Get Reviews for Itinerary
**GET** `/api/reviews/itinerary/:id`

Get all reviews for a specific itinerary.

```http
GET /api/reviews/itinerary/60f7b3b3b3b3b3b3b3b3b3b3?page=1&limit=10
```

### Create Review
**POST** `/api/reviews`

Create a new review.

```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "itinerary": "60f7b3b3b3b3b3b3b3b3b3b3",
  "rating": 5,
  "comment": "Amazing itinerary! Highly recommended.",
  "aspects": {
    "accuracy": 5,
    "value": 4,
    "experience": 5
  }
}
```

### Update Review
**PUT** `/api/reviews/:id`

Update an existing review.

```http
PUT /api/reviews/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

### Delete Review
**DELETE** `/api/reviews/:id`

Delete a review.

```http
DELETE /api/reviews/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

## 👥 User Management Endpoints

### Get All Users (Admin)
**GET** `/api/users`

Get all users (admin only).

```http
GET /api/users?page=1&limit=10&role=user
Authorization: Bearer <admin-token>
```

### Get User by ID
**GET** `/api/users/:id`

Get specific user information.

```http
GET /api/users/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

### Update User
**PUT** `/api/users/:id`

Update user information (admin or own profile).

```http
PUT /api/users/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "premium",
  "isActive": true
}
```

### Delete User
**DELETE** `/api/users/:id`

Delete user account (admin only).

```http
DELETE /api/users/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <admin-token>
```

## 📁 File Upload Endpoints

### Upload Single Image
**POST** `/api/upload/single`

Upload a single image file.

```http
POST /api/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:5001/uploads/filename.jpg",
    "filename": "filename.jpg",
    "size": 1234567
  }
}
```

### Upload Multiple Images
**POST** `/api/upload/multiple`

Upload multiple image files.

```http
POST /api/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "images": [<file1>, <file2>, <file3>]
}
```

## 🔧 System Endpoints

### Health Check
**GET** `/health`

Check API health status.

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-07-01T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "database": "connected"
}
```

### API Information
**GET** `/api`

Get API information and available endpoints.

```http
GET /api
```

## 📝 Status Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## 🚨 Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

### Authentication Errors
```json
{
  "success": false,
  "error": "Authentication failed",
  "details": {
    "message": "Invalid token"
  }
}
```

### Rate Limiting
```json
{
  "success": false,
  "error": "Too many requests",
  "details": {
    "message": "Rate limit exceeded. Try again in 15 minutes.",
    "retryAfter": 900
  }
}
```

## 🔧 Testing with cURL

### Example: Register and Login
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use token for protected endpoints
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Additional Resources

- [Postman Collection](link-to-postman-collection)
- [OpenAPI/Swagger Documentation](link-to-swagger-docs)
- [Rate Limiting Guide](link-to-rate-limiting-docs)
- [Authentication Best Practices](link-to-auth-docs)

---

**For support or questions about the API, please contact: api-support@travelsensei.com**

*Happy Coding! 🚀*