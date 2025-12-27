"""
FastAPI Endpoint for AI-Powered Itinerary Generation
===================================================

This FastAPI service provides intelligent itinerary generation using machine learning
and natural language processing. It serves the AI itinerary service created with
pandas, scikit-learn, transformers, and other ML libraries.

Endpoints:
- POST /api/ai/generate-itinerary: Generate intelligent itinerary
- GET /api/ai/destinations: Get available destinations
- GET /api/ai/health: Health check
- POST /api/ai/analyze-preferences: Analyze user travel preferences
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import logging
import json
from datetime import datetime
import uvicorn

# Import our AI itinerary service
from ai_itinerary_service import (
    IntelligentItineraryAI, 
    UserPreferences, 
    TravelStyle,
    ai_itinerary_service
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Intelligent Travel Itinerary AI API",
    description="Advanced AI-powered travel itinerary generation using ML and NLP",
    version="1.0.0",
    docs_url="/api/ai/docs",
    redoc_url="/api/ai/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ItineraryRequest(BaseModel):
    """Request model for itinerary generation"""
    destination: str = Field(..., description="Destination name (e.g., 'Kerala')")
    duration: int = Field(..., ge=1, le=30, description="Trip duration in days")
    budget: float = Field(..., ge=100, le=50000, description="Total budget in USD")
    interests: List[str] = Field(default=[], description="User interests and preferences")
    travel_style: str = Field(..., description="Travel style: luxury, mid-range, budget, adventure, cultural, relaxation")
    group_size: int = Field(..., ge=1, le=20, description="Number of travelers")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    accommodation_preference: Optional[str] = Field(default="mid-range", description="Accommodation preference")
    transportation_preference: Optional[str] = Field(default="mixed", description="Transportation preference")

class ItineraryResponse(BaseModel):
    """Response model for generated itinerary"""
    success: bool
    message: str
    itinerary: Optional[Dict[str, Any]] = None
    personalization_score: Optional[float] = None
    generation_time: Optional[float] = None

class PreferenceAnalysisRequest(BaseModel):
    """Request model for preference analysis"""
    interests: List[str]
    travel_style: str
    budget: float
    duration: int

class PreferenceAnalysisResponse(BaseModel):
    """Response model for preference analysis"""
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None

class DestinationInfo(BaseModel):
    """Destination information model"""
    name: str
    category: str
    description: str
    average_cost: float
    recommended_duration: int
    activities: List[str]
    tags: List[str]

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    ai_models_loaded: bool
    timestamp: str

# Global variables for tracking
request_count = 0
generation_times = []

@app.on_event("startup")
async def startup_event():
    """Initialize AI service on startup"""
    logger.info("Starting AI Itinerary Service...")
    try:
        # The AI service is already initialized globally
        logger.info("AI Itinerary Service started successfully!")
        logger.info(f"Loaded {len(ai_itinerary_service.destinations_df)} destinations")
        logger.info(f"Loaded {len(ai_itinerary_service.activities_df)} activities")
    except Exception as e:
        logger.error(f"Failed to start AI service: {str(e)}")
        raise

@app.get("/api/ai/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check if AI models are loaded
        models_loaded = (
            ai_itinerary_service.sentence_model is not None and
            ai_itinerary_service.nlp_pipeline is not None and
            ai_itinerary_service.destinations_df is not None
        )
        
        return HealthResponse(
            status="healthy",
            service="AI Itinerary Generation Service",
            version="1.0.0",
            ai_models_loaded=models_loaded,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Service unhealthy: {str(e)}")

@app.get("/api/ai/destinations")
async def get_destinations():
    """Get available destinations with details"""
    try:
        destinations = []
        for _, dest in ai_itinerary_service.destinations_df.iterrows():
            destinations.append(DestinationInfo(
                name=dest['name'],
                category=dest['category'],
                description=dest['description'],
                average_cost=dest['average_cost'],
                recommended_duration=dest['recommended_duration'],
                activities=dest['activities'],
                tags=dest['tags']
            ))
        
        return {
            "success": True,
            "destinations": destinations,
            "total_count": len(destinations)
        }
    except Exception as e:
        logger.error(f"Error getting destinations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get destinations: {str(e)}")

@app.post("/api/ai/analyze-preferences", response_model=PreferenceAnalysisResponse)
async def analyze_preferences(request: PreferenceAnalysisRequest):
    """Analyze user travel preferences using NLP"""
    try:
        # Convert request to UserPreferences object
        preferences = UserPreferences(
            destination="Kerala",  # Default for analysis
            duration=request.duration,
            budget=request.budget,
            interests=request.interests,
            travel_style=TravelStyle(request.travel_style),
            group_size=1,  # Default for analysis
            start_date=datetime.now().strftime("%Y-%m-%d")
        )
        
        # Analyze preferences
        analysis_result = ai_itinerary_service.analyze_user_preferences(preferences)
        
        # Generate recommendations based on analysis
        top_activities = analysis_result['matched_activities'].head(5)
        recommendations = [
            f"Based on your interests, consider {activity['name']} - {activity['description']}"
            for _, activity in top_activities.iterrows()
        ]
        
        return PreferenceAnalysisResponse(
            success=True,
            analysis={
                "preference_categories": analysis_result['preference_categories'],
                "emotion_analysis": analysis_result['emotion_analysis'],
                "top_matching_activities": top_activities[['name', 'description', 'preference_score']].to_dict('records')
            },
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error analyzing preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze preferences: {str(e)}")

@app.post("/api/ai/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest, background_tasks: BackgroundTasks):
    """Generate intelligent itinerary using AI/ML"""
    global request_count, generation_times
    start_time = datetime.now()
    request_count += 1
    
    logger.info(f"Generating itinerary request #{request_count} for {request.destination}")
    
    try:
        # Validate travel style
        try:
            travel_style = TravelStyle(request.travel_style.lower().replace('-', '_'))
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid travel style. Must be one of: {[style.value for style in TravelStyle]}"
            )
        
        # Create UserPreferences object
        preferences = UserPreferences(
            destination=request.destination,
            duration=request.duration,
            budget=request.budget,
            interests=request.interests,
            travel_style=travel_style,
            group_size=request.group_size,
            start_date=request.start_date,
            accommodation_preference=request.accommodation_preference,
            transportation_preference=request.transportation_preference
        )
        
        # Generate itinerary using AI service
        logger.info("Calling AI service to generate itinerary...")
        itinerary = ai_itinerary_service.generate_intelligent_itinerary(preferences)
        
        # Calculate generation time
        end_time = datetime.now()
        generation_time = (end_time - start_time).total_seconds()
        generation_times.append(generation_time)
        
        logger.info(f"Successfully generated itinerary in {generation_time:.2f} seconds")
        logger.info(f"Personalization score: {itinerary.get('personalization_score', 0):.3f}")
        
        # Add generation metadata
        itinerary['generation_metadata'] = {
            'generation_time_seconds': generation_time,
            'request_number': request_count,
            'api_version': '1.0.0',
            'ml_models_used': itinerary.get('ml_models_used', [])
        }
        
        return ItineraryResponse(
            success=True,
            message="Itinerary generated successfully using AI",
            itinerary=itinerary,
            personalization_score=itinerary.get('personalization_score'),
            generation_time=generation_time
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")

@app.get("/api/ai/stats")
async def get_service_stats():
    """Get AI service statistics"""
    try:
        avg_generation_time = sum(generation_times) / len(generation_times) if generation_times else 0
        
        return {
            "total_requests": request_count,
            "average_generation_time": round(avg_generation_time, 2),
            "destinations_available": len(ai_itinerary_service.destinations_df),
            "activities_available": len(ai_itinerary_service.activities_df),
            "ml_models_loaded": {
                "sentence_transformer": ai_itinerary_service.sentence_model is not None,
                "nlp_pipeline": ai_itinerary_service.nlp_pipeline is not None,
                "route_graph": ai_itinerary_service.route_graph is not None
            }
        }
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc) if app.debug else "An error occurred processing your request"
    }

if __name__ == "__main__":
    # Run the server
    logger.info("Starting AI Itinerary API Server...")
    uvicorn.run(
        "ai_api_server:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        log_level="info"
    )