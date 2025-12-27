"""
Enhanced Itinerary Storage and Management System - MongoDB
Handles saving, retrieving, and managing AI-generated itineraries in the dashboard
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid
from mongodb_config import MongoDBHelper

class ItineraryStorageService:
    """Service for managing itinerary storage and retrieval using MongoDB"""
    
    def __init__(self):
        """Initialize the storage service"""
        self.mongo_helper = MongoDBHelper()
        self.collection_name = 'itineraries'
        
    def save_ai_generated_itinerary(self, itinerary_data: Dict, user_id: str) -> Dict:
        """
        Save an AI-generated itinerary to Firestore
        
        Args:
            itinerary_data: Complete itinerary data from AI service
            user_id: User's Firebase UID
            
        Returns:
            Dictionary with save status and itinerary ID
        """
        try:
            itinerary_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()
            
            # Create itinerary document
            itinerary_doc = {
                'id': itinerary_id,
                'user_id': user_id,
                'title': itinerary_data.get('title', f"Trip to {itinerary_data.get('destination')}") ,
                'destination': itinerary_data.get('destination'),
                'start_date': itinerary_data.get('start_date'),
                'end_date': itinerary_data.get('end_date'),
                'duration_days': itinerary_data.get('duration_days'),
                'theme': itinerary_data.get('theme'),
                'ai_generated': True,
                'generation_timestamp': timestamp,
                'day_plans': itinerary_data.get('day_plans', []),
                'hotels': itinerary_data.get('hotels', []),
                'total_estimated_cost': itinerary_data.get('total_estimated_cost', 0.0),
                'travel_tips': itinerary_data.get('travel_tips', []),
                'best_routes': itinerary_data.get('best_routes', []),
                'cost_breakdown': self._generate_cost_breakdown(itinerary_data),
                'user_notes': '',
                'is_favorite': False,
                'sharing_enabled': False,
                'created_at': timestamp,
                'updated_at': timestamp,
                'last_accessed': timestamp,
                'access_count': 0,
                'status': 'planned'
            }
            # Remove activities and flights if present
            if 'activities' in itinerary_doc:
                del itinerary_doc['activities']
            if 'flights' in itinerary_doc:
                del itinerary_doc['flights']
            
            # Save to MongoDB
            itinerary_doc.pop('id', None)  # Remove id, MongoDB will generate _id
            success, saved_id = self.mongo_helper.create_document(self.collection_name, itinerary_doc, itinerary_id)
            
            if success:
                # Update user's tripsPlanned count
                user_doc = self.mongo_helper.find_one_document('users', {'uid': user_id})
                if user_doc:
                    trips_planned = user_doc.get('tripsPlanned', 0) + 1
                    self.mongo_helper.update_document('users', user_doc['id'], {'tripsPlanned': trips_planned})
                
                return {
                    'success': True,
                    'message': 'AI-generated itinerary saved successfully',
                    'itinerary_id': saved_id,
                    'destination': itinerary_data.get('destination'),
                    'created_at': timestamp
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to save itinerary'
                }
                
        except Exception as e:
            print(f"Error saving itinerary: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_user_itineraries(self, user_id: str, limit: int = 50, 
                            status: Optional[str] = None) -> List[Dict]:
        """
        Retrieve itineraries for a specific user
        
        Args:
            user_id: User's Firebase UID
            limit: Maximum number of itineraries to return
            status: Filter by status (optional)
            
        Returns:
            List of itinerary summaries
        """
        try:
            query = {'user_id': user_id}
            if status:
                query['status'] = status
            
            itineraries = self.mongo_helper.find_documents(
                self.collection_name, 
                query, 
                sort=[('created_at', -1)], 
                limit=limit
            )
            
            return [self._convert_to_summary(it) for it in itineraries]
                
        except Exception as e:
            print(f"Error retrieving itineraries: {e}")
            return []
    
    def get_itinerary_by_id(self, itinerary_id: str, user_id: Optional[str] = None) -> Optional[Dict]:
        """
        Retrieve a specific itinerary by ID
        
        Args:
            itinerary_id: Itinerary ID
            user_id: Optional user ID for authorization
            
        Returns:
            Complete itinerary data or None
        """
        try:
            data = self.mongo_helper.get_document(self.collection_name, itinerary_id)
            
            if not data:
                return None
            
            # Check authorization if user_id provided
            if user_id and data.get('user_id') != user_id:
                return None
            
            # Update access count and timestamp
            self.mongo_helper.update_document(self.collection_name, itinerary_id, {
                'access_count': data.get('access_count', 0) + 1,
                'last_accessed': datetime.utcnow()
            })
            
            return data
                
        except Exception as e:
            print(f"Error retrieving itinerary: {e}")
            return None
    
    def update_itinerary(self, itinerary_id: str, updates: Dict, user_id: str) -> bool:
        """
        Update an existing itinerary
        
        Args:
            itinerary_id: Itinerary ID
            updates: Dictionary of fields to update
            user_id: User's Firebase UID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            data = self.mongo_helper.get_document(self.collection_name, itinerary_id)
            
            if not data:
                return False
            
            # Check authorization
            if data.get('user_id') != user_id:
                return False
            
            # Add update timestamp
            updates['updated_at'] = datetime.utcnow()
            
            # Update document
            return self.mongo_helper.update_document(self.collection_name, itinerary_id, updates)
                
        except Exception as e:
            print(f"Error updating itinerary: {e}")
            return False
    
    def delete_itinerary(self, itinerary_id: str, user_id: str) -> bool:
        """
        Delete an itinerary
        
        Args:
            itinerary_id: Itinerary ID
            user_id: User's Firebase UID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            data = self.mongo_helper.get_document(self.collection_name, itinerary_id)
            
            if not data:
                return False
            
            # Check authorization
            if data.get('user_id') != user_id:
                return False
            
            # Delete document
            return self.mongo_helper.delete_document(self.collection_name, itinerary_id)
                
        except Exception as e:
            print(f"Error deleting itinerary: {e}")
            return False
    
    def search_itineraries(self, user_id: str, destination: Optional[str] = None,
                          theme: Optional[str] = None, start_date: Optional[str] = None) -> List[Dict]:
        """
        Search itineraries with filters
        
        Args:
            user_id: User's Firebase UID
            destination: Filter by destination
            theme: Filter by theme
            start_date: Filter by start date
            
        Returns:
            List of matching itineraries
        """
        try:
            query = {'user_id': user_id}
            
            if destination:
                query['destination'] = destination
            
            if theme:
                query['theme'] = theme
            
            if start_date:
                query['start_date'] = start_date
            
            results = self.mongo_helper.find_documents(self.collection_name, query)
            return [self._convert_to_summary(it) for it in results]
                
        except Exception as e:
            print(f"Error searching itineraries: {e}")
            return []
    
    def _generate_cost_breakdown(self, itinerary_data: Dict) -> Dict:
        """Generate cost breakdown from itinerary data"""
        total_cost = itinerary_data.get('total_estimated_cost', 0.0)
        
        return {
            'accommodation': total_cost * 0.35,
            'food': total_cost * 0.25,
            'activities': total_cost * 0.20,
            'transportation': total_cost * 0.15,
            'miscellaneous': total_cost * 0.05
        }
    
    def _convert_to_summary(self, itinerary: Dict) -> Dict:
        """Convert full itinerary to summary format"""
        return {
            'id': itinerary.get('id'),
            'title': itinerary.get('title'),
            'destination': itinerary.get('destination'),
            'start_date': itinerary.get('start_date'),
            'end_date': itinerary.get('end_date'),
            'duration_days': itinerary.get('duration_days'),
            'theme': itinerary.get('theme'),
            'ai_generated': itinerary.get('ai_generated', False),
            'total_estimated_cost': itinerary.get('total_estimated_cost', 0.0),
            'status': itinerary.get('status', 'draft'),
            'is_favorite': itinerary.get('is_favorite', False),
            'created_at': itinerary.get('created_at'),
            'updated_at': itinerary.get('updated_at')
        }

# Create global instance
itinerary_service = ItineraryStorageService()
