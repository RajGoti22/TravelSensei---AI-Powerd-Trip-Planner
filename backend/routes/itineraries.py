"""
Enhanced Itineraries Routes - AI-powered itinerary generation and management
Maintains Node.js API compatibility while adding advanced AI features
"""
from flask import Blueprint, request, jsonify
from mongodb_config import firebase_auth_required, MongoDBHelper
from datetime import datetime
import uuid
import sys
import os
import time
import threading
import traceback
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))

# Import services with safe guards (development friendly)
try:
    from itinerary_ai_service import ItineraryAIService
except Exception as e:
    logger.warning(f"Could not import ItineraryAIService: {e}")
    ItineraryAIService = None

try:
    from itinerary_ai_enhanced import EnhancedItineraryAI
except Exception as e:
    logger.warning(f"Could not import EnhancedItineraryAI: {e}")
    EnhancedItineraryAI = None

try:
    from itinerary_storage_service import ItineraryStorageService
except Exception as e:
    logger.warning(f"Could not import ItineraryStorageService: {e}")
    ItineraryStorageService = None

# Optional hotel integration service
try:
    from hotel_integration_service import hotel_integration_service as hotel_service
except Exception:
    hotel_service = None
    logger.info("hotel_integration_service not available; hotel recommendations disabled.")

itineraries_bp = Blueprint('itineraries', __name__)

# Initialize services (if available)
ai_service = ItineraryAIService() if ItineraryAIService else None
enhanced_ai_service = EnhancedItineraryAI() if EnhancedItineraryAI else None
storage_service = ItineraryStorageService() if ItineraryStorageService else None
mongo_helper = MongoDBHelper()

@itineraries_bp.route('/generate', methods=['POST'])
@itineraries_bp.route('/generate-ai', methods=['POST', 'OPTIONS'])
# @firebase_auth_required
def generate_ai_itinerary():
    """Generate AI-powered itinerary based on destination and preferences"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type, Authorization")
        response.headers.add('Access-Control-Allow-Methods', "POST, OPTIONS")
        return response

    try:
        logger.info("Entered /generate route handler")
        try:
            data = request.get_json()
            logger.debug(f"Parsed JSON data: {data}")
        except Exception as e:
            logger.exception("Error parsing JSON")
            return jsonify({'error': 'Invalid JSON data'}), 400

        if not isinstance(data, dict):
            logger.warning("Request data is not a JSON object")
            return jsonify({'error': 'Request data must be a JSON object'}), 400

        # Required fields
        destination = data.get('destination')
        duration_days = data.get('duration_days')
        start_date = data.get('start_date')

        missing_fields = []
        if not destination:
            missing_fields.append('destination')
        if not duration_days:
            missing_fields.append('duration_days')
        if not start_date:
            missing_fields.append('start_date')

        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}',
                'received_data': {
                    'destination': destination,
                    'duration_days': duration_days,
                    'start_date': start_date
                }
            }), 400

        # Optional preferences and normalization
        preferences = data.get('preferences', {})
        budget = data.get('budget')
        trip_type = data.get('trip_type', 'leisure')
        group_size = data.get('group_size', 2)
        interests = data.get('interests', [])
        if not isinstance(interests, list):
            interests = [interests] if interests else []

        # Prepare user_data for Gemini (validate numeric conversions)
        try:
            user_data = {
                "destination": destination,
                "duration_days": int(duration_days),
                "start_date": start_date,
                "budget": budget if budget else 25000,
                "group_size": int(group_size),
                "interests": interests
            }
        except Exception as e:
            logger.exception("Invalid numeric fields in request")
            return jsonify({'error': f'Invalid numeric fields: {str(e)}'}), 400

        logger.info(f"Launching Gemini AI for {destination} with user_data: {user_data}")

        gemini_result['dayPlans'] = formatted_day_plans
        gemini_result['day_plans'] = formatted_day_plans
        # Synchronous Gemini call (no threading)
        try:
            from services.ai_itinerary_service import generate_ai_itinerary as generate_gemini_itinerary
        except Exception as e:
            logger.warning(f"generate_gemini_itinerary not available: {e}")
            generate_gemini_itinerary = None

        gemini_result = None
        gemini_ok = False
        if generate_gemini_itinerary:
            try:
                result = generate_gemini_itinerary(user_data)
                if not isinstance(result, dict):
                    logger.warning("Gemini returned non-dict result")
                    gemini_result = {'error': 'Gemini returned non-dict result'}
                else:
                    gemini_result = result
                    gemini_ok = True
            except Exception as e:
                logger.exception("Exception while calling Gemini")
                gemini_result = {'error': str(e)}
        else:
            gemini_result = {'error': 'Gemini service unavailable'}

        # If Gemini failed/timed out, call enhanced fallback
        if not gemini_ok:
            if not enhanced_ai_service:
                logger.error("EnhancedItineraryAI service is not available.")
                return jsonify({'success': False, 'error': 'No available AI generation service.'}), 500
            try:
                logger.info("Calling EnhancedItineraryAI fallback...")
                if hasattr(enhanced_ai_service, 'generate_smart_itinerary'):
                    itinerary_obj = enhanced_ai_service.generate_smart_itinerary(
                        destination=destination,
                        duration_days=int(duration_days),
                        start_date=start_date,
                        preferences=preferences,
                        budget=budget if budget else 25000,
                        group_size=int(group_size)
                    )
                else:
                    logger.error("EnhancedItineraryAI object does not have 'generate_smart_itinerary' method.")
                    return jsonify({'success': False, 'error': 'AI fallback method not available.'}), 500
                # Normalize dataclass or dict to dict
                if hasattr(itinerary_obj, '__dict__'):
                    itinerary_data = itinerary_obj.__dict__
                else:
                    itinerary_data = itinerary_obj if isinstance(itinerary_obj, dict) else dict(itinerary_obj)

                # Ensure day_plans present
                if 'day_plans' not in itinerary_data and 'dayPlans' in itinerary_data:
                    itinerary_data['day_plans'] = itinerary_data['dayPlans']
                if 'dayPlans' not in itinerary_data and 'day_plans' in itinerary_data:
                    itinerary_data['dayPlans'] = itinerary_data['day_plans']
                if not itinerary_data.get('day_plans'):
                    itinerary_data['day_plans'] = [{
                        'day': 1,
                        'title': 'No Plan',
                        'description': 'No day-by-day plan could be generated.',
                        'locations': [],
                        'activities': []
                    }]
                    itinerary_data['dayPlans'] = itinerary_data['day_plans']

                response_itinerary = {
                    'destination': itinerary_data.get('destination', destination),
                    'duration_days': itinerary_data.get('duration_days', int(duration_days)),
                    'day_plans': itinerary_data.get('day_plans'),
                    'dayPlans': itinerary_data.get('day_plans'),
                    'total_estimated_cost': itinerary_data.get('total_estimated_cost', budget if budget else 25000),
                    'travel_tips': itinerary_data.get('travel_tips', itinerary_data.get('travelTips', [])),
                    'travelTips': itinerary_data.get('travel_tips', itinerary_data.get('travelTips', [])),
                    'summary': itinerary_data.get('summary', ''),
                    'hotels': itinerary_data.get('hotels', [])
                }

                return jsonify({
                    'success': True,
                    'message': 'AI itinerary generated successfully (fallback)',
                    'itinerary': response_itinerary
                }), 200
            except Exception as e:
                logger.exception("Enhanced AI fallback failed")
                return jsonify({'success': False, 'error': f'All AI services failed: {str(e)}'}), 500

        # Gemini succeeded — normalize result
        logger.info("Gemini AI finished within time and returned a result")


        # Always map 'days' to 'day_plans' and 'dayPlans' for frontend compatibility

        # Always use Gemini's 'days' as the source of truth for day-by-day plan
        day_plans_raw = gemini_result.get('days', [])
        formatted_day_plans = []
        for idx, day in enumerate(day_plans_raw):
            if not isinstance(day, dict):
                continue
            activities = day.get('activities', [])
            locations = [
                {
                    **activity,
                    'name': activity.get('place', ''),
                    'description': activity.get('details', '')
                }
                for activity in activities
            ]
            if (not locations or len(locations) == 0) and (not activities or len(activities) == 0):
                locations = [{
                    'name': 'No activities planned',
                    'description': 'No activities or locations were generated for this day.'
                }]
            formatted_day = {
                'day': day.get('day', idx + 1),
                'title': day.get('title', f"Day {day.get('day', idx + 1)}"),
                'description': day.get('description', ''),
                'locations': locations,
                'activities': activities
            }
            formatted_day_plans.append(formatted_day)

        # Always set both 'dayPlans' and 'day_plans' in the response for frontend compatibility
        gemini_result['dayPlans'] = formatted_day_plans
        gemini_result['day_plans'] = formatted_day_plans

        # Always set both 'dayPlans' and 'day_plans' in the response for frontend compatibility
        # gemini_result['dayPlans'] = formatted_day_plans
        # gemini_result['day_plans'] = formatted_day_plans

        if not formatted_day_plans:
            formatted_day_plans = [{
                'day': 1,
                'title': 'No Plan',
                'description': 'No day-by-day plan could be generated.',
                'locations': [],
                'activities': []
            }]

        formatted_itinerary = {
            'destination': gemini_result.get('destination', destination),
            'duration_days': gemini_result.get('duration_days', int(duration_days)),
            'day_plans': formatted_day_plans,
            'dayPlans': formatted_day_plans,
            'total_estimated_cost': gemini_result.get('total_estimated_cost', gemini_result.get('estimated_total_cost', budget if budget else 25000)),
            'travel_tips': gemini_result.get('travel_tips', gemini_result.get('travelTips', [])),
            'travelTips': gemini_result.get('travel_tips', gemini_result.get('travelTips', [])),
            'summary': gemini_result.get('summary', ''),
            'hotels': gemini_result.get('hotels', [])
        }

        logger.info(f"FINAL itinerary sent to frontend: {formatted_itinerary}")

        logger.info(f"Returning Gemini itinerary to frontend: {formatted_itinerary}")
        return jsonify({
            'success': True,
            'message': f'{destination} itinerary generated successfully using Gemini AI',
            'itinerary': formatted_itinerary
        }), 200

    except Exception as e:
        logger.exception("Failed to generate itinerary")
        return jsonify({'error': f'Failed to generate itinerary: {str(e)}'}), 500


@itineraries_bp.route('/save-generated', methods=['POST'])
@firebase_auth_required
def save_generated_itinerary():
    """Save an AI-generated itinerary to user's dashboard"""
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('itinerary'):
            return jsonify({'error': 'Itinerary data is required'}), 400

        itinerary_data = data['itinerary']

        # Add hotel recommendations if provided
        if data.get('hotel_recommendations'):
            itinerary_data['hotels'] = data['hotel_recommendations'].get('recommended_hotels', [])

        if not storage_service:
            logger.error("Storage service not available to save itinerary")
            return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500

        save_result = storage_service.save_ai_generated_itinerary(itinerary_data, user_id)
        return jsonify(save_result), 201 if save_result.get('success') else 400

    except Exception as e:
        logger.exception("Failed to save generated itinerary")
        return jsonify({'error': f'Failed to save itinerary: {str(e)}'}), 500


@itineraries_bp.route('/dashboard-summary', methods=['GET'])
@firebase_auth_required
def get_dashboard_summary():
    """Get dashboard summary with itinerary statistics"""
    try:
        user_id = request.user_id

        if not storage_service:
            logger.error("Storage service not available to fetch itineraries")
            return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500

        itineraries = storage_service.get_user_itineraries(user_id) or []

        summary = {
            'total_itineraries': len(itineraries),
            'ai_generated': sum(1 for it in itineraries if it.get('ai_generated', False)),
            'planned': sum(1 for it in itineraries if it.get('status') == 'planned'),
            'completed': sum(1 for it in itineraries if it.get('status') == 'completed'),
            'favorites': sum(1 for it in itineraries if it.get('is_favorite', False))
        }

        return jsonify({'success': True, 'summary': summary}), 200

    except Exception as e:
        logger.exception("Failed to get dashboard summary")
        return jsonify({'error': f'Failed to get dashboard summary: {str(e)}'}), 500


@itineraries_bp.route('/', methods=['GET'])
@firebase_auth_required
def get_user_itineraries():
    """Get user itineraries (both manual and AI-generated)"""
    try:
        user_id = request.user_id

        if not storage_service:
            logger.error("Storage service not available to fetch itineraries")
            return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500

        all_itineraries = storage_service.get_user_itineraries(user_id) or []

        return jsonify({
            'success': True,
            'itineraries': all_itineraries,
            'total_count': len(all_itineraries),
            'ai_generated_count': sum(1 for itin in all_itineraries if itin.get('ai_generated', False))
        }), 200

    except Exception as e:
        logger.exception("Failed to get user itineraries")
        return jsonify({'error': str(e)}), 500


@itineraries_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_itinerary():
    """Create new itinerary (manual or save AI-generated)"""
    try:
        user_id = request.user_id
        data = request.get_json() or {}

        # If AI-generated and from_generation, use storage service
        if data.get('ai_generated') and data.get('from_generation'):
            if not storage_service:
                return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500
            save_result = storage_service.save_ai_generated_itinerary(data, user_id)
            return jsonify(save_result), 201 if save_result.get('success') else 400

        # Manual itinerary creation - validate basic fields
        itinerary = {
            'user_id': user_id,
            'title': data.get('title', 'My Trip'),
            'destination': data.get('destination', ''),
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'duration_days': data.get('duration_days'),
            'hotels': data.get('hotels', []),
            'notes': data.get('notes', ''),
            'ai_generated': True,
            'status': 'planned',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        # Remove activities and flights if present
        if 'activities' in itinerary:
            del itinerary['activities']
        if 'flights' in itinerary:
            del itinerary['flights']

        # Final clean-up before saving
        itinerary['ai_generated'] = True
        if 'activities' in itinerary:
            del itinerary['activities']
        if 'flights' in itinerary:
            del itinerary['flights']
        success, itinerary_id = mongo_helper.create_document('itineraries', itinerary)
        if success:
            itinerary['id'] = itinerary_id
            if '_id' in itinerary:
                del itinerary['_id']
            # Ensure user document exists
            user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
            if not user_doc:
                # Create minimal user document
                user_doc = {
                    'uid': user_id,
                    'created_at': datetime.utcnow()
                }
                mongo_helper.create_document('users', user_doc)
                user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
            # Update user's tripsPlanned count
            if user_doc:
                trips_planned = user_doc.get('tripsPlanned', 0) + 1
                mongo_helper.update_document('users', user_doc['id'], {'tripsPlanned': trips_planned})

            return jsonify({'success': True, 'message': 'Itinerary created successfully', 'itinerary': itinerary}), 201
        else:
            return jsonify({'error': 'Failed to create itinerary'}), 500

    except Exception as e:
        logger.exception("Failed to create itinerary")
        return jsonify({'error': str(e)}), 500


@itineraries_bp.route('/<itinerary_id>', methods=['GET'])
@firebase_auth_required
def get_itinerary(itinerary_id):
    """Get itinerary by ID"""
    try:
        user_id = request.user_id
        if not storage_service:
            return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500

        stored_itinerary = storage_service.get_itinerary_by_id(itinerary_id, user_id)
        if stored_itinerary:
            return jsonify({'success': True, 'itinerary': stored_itinerary}), 200

        return jsonify({'error': 'Itinerary not found'}), 404

    except Exception as e:
        logger.exception("Failed to get itinerary")
        return jsonify({'error': str(e)}), 500


@itineraries_bp.route('/<itinerary_id>', methods=['PUT'])
@firebase_auth_required
def update_itinerary(itinerary_id):
    """Update itinerary"""
    try:
        user_id = request.user_id
        data = request.get_json() or {}

        if not storage_service:
            return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500

        success = storage_service.update_itinerary(itinerary_id, data, user_id)
        if success:
            updated_itinerary = storage_service.get_itinerary_by_id(itinerary_id, user_id)
            return jsonify({'success': True, 'message': 'Itinerary updated successfully', 'itinerary': updated_itinerary}), 200
        else:
            return jsonify({'error': 'Itinerary not found or unauthorized'}), 404

    except Exception as e:
        logger.exception("Failed to update itinerary")
        return jsonify({'error': str(e)}), 500


@itineraries_bp.route('/<itinerary_id>', methods=['DELETE'])
@firebase_auth_required
def delete_itinerary(itinerary_id):
    """Delete itinerary"""
    try:
        user_id = request.user_id

        if not storage_service:
            return jsonify({'success': False, 'error': 'Storage service unavailable'}), 500

        success = storage_service.delete_itinerary(itinerary_id, user_id)
        if success:
            return jsonify({'success': True, 'message': 'Itinerary deleted successfully'}), 200
        else:
            return jsonify({'error': 'Itinerary not found or unauthorized'}), 404

    except Exception as e:
        logger.exception("Failed to delete itinerary")
        return jsonify({'error': str(e)}), 500


@itineraries_bp.route('/hotels/recommendations', methods=['POST'])
@firebase_auth_required
def get_hotel_recommendations():
    """Get hotel recommendations for a destination"""
    try:
        data = request.get_json() or {}

        destination = data.get('destination')
        duration_days = data.get('duration_days', 1)
        budget_total = data.get('budget_total')
        check_in_date = data.get('check_in_date')
        trip_type = data.get('trip_type', 'leisure')

        if not destination:
            return jsonify({'error': 'Destination is required'}), 400

        if not hotel_service:
            logger.warning("Hotel service not available when requested")
            return jsonify({'success': False, 'error': 'Hotel service unavailable'}), 500

        recommendations = hotel_service.recommend_hotels_for_trip(
            destination=destination,
            duration_days=int(duration_days),
            budget_total=budget_total,
            trip_type=trip_type
        )

        return jsonify({'success': True, 'recommendations': recommendations}), 200

    except Exception as e:
        logger.exception("Failed to get hotel recommendations")
        return jsonify({'error': f'Failed to get hotel recommendations: {str(e)}'}), 500


@itineraries_bp.route('/preview', methods=['POST'])
@firebase_auth_required
def preview_itinerary():
    """Preview itinerary generation without saving"""
    try:
        data = request.get_json() or {}

        destination = data.get('destination')
        duration_days = data.get('duration_days')
        start_date = data.get('start_date')

        if not destination or not duration_days:
            return jsonify({'error': 'destination and duration_days are required'}), 400

        if not ai_service:
            logger.error("AI service not available to generate preview")
            return jsonify({'success': False, 'error': 'AI service unavailable'}), 500

        itinerary = ai_service.generate_itinerary(
            destination=destination,
            duration_days=int(duration_days),
            start_date=start_date or datetime.utcnow().strftime("%Y-%m-%d"),
            preferences=data.get('preferences', {})
        )

        # Format for preview (safe attribute access)
        highlights = []
        try:
            for day_plan in getattr(itinerary, 'day_plans', [])[:]:
                for loc in getattr(day_plan, 'locations', [])[:2]:
                    highlights.append(getattr(loc, 'name', None))
            highlights = [h for h in highlights if h][:6]
        except Exception:
            logger.exception("Error while building highlights for preview")

        preview_data = {
            'destination': getattr(itinerary, 'destination', None),
            'duration_days': getattr(itinerary, 'duration_days', None),
            'theme': getattr(itinerary, 'theme', None),
            'estimated_cost': getattr(itinerary, 'total_estimated_cost', None),
            'highlights': highlights,
            'travel_tips': getattr(itinerary, 'travel_tips', [])[:3],
            'best_routes': getattr(itinerary, 'best_routes', [])[:2]
        }

        return jsonify({'success': True, 'preview': preview_data}), 200

    except Exception as e:
        logger.exception("Failed to generate preview")
        return jsonify({'error': f'Failed to generate preview: {str(e)}'}), 500
