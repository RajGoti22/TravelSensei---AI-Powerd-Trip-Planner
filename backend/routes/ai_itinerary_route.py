# """
# ai_itinerary_route.py
# Flask route for AI-based itinerary generation.
# """

# from flask import Blueprint, request, jsonify
# from services.ai_itinerary_service import generate_ai_itinerary

# ai_itinerary_bp = Blueprint("ai_itinerary", __name__)

# @ai_itinerary_bp.route("/generate-ai", methods=["POST", "OPTIONS"])
# def generate_itinerary():
#     if request.method == "OPTIONS":
#         # CORS preflight request
#         return '', 200
#     try:
#         user_data = request.get_json()
#         if not user_data:
#             return jsonify({"error": "Missing user data"}), 400

#         itinerary = generate_ai_itinerary(user_data)
#         return jsonify(itinerary), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500





"""
routes/ai_itinerary_route.py
Blueprint to expose AI itinerary generation endpoint.
Mount under /api/itineraries in app creation.
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from services.ai_itinerary_service import generate_ai_itinerary
import logging

logger = logging.getLogger(__name__)
ai_itinerary_bp = Blueprint("ai_itinerary", __name__)


@ai_itinerary_bp.route("/generate-ai", methods=["POST", "OPTIONS"])
def generate_ai():
    """
    POST /api/itineraries/generate-ai
    Body example:
    {
      "destination": "Goa, India",
      "start_date": "2025-12-01",
      "duration_days": 4,
      "budget": {"min": 1000, "max": 5000} or 5000,
      "group_size": 2,
      "interests": ["beach", "food"],
      "accommodation": "Resort"
    }
    """
    try:
        data = request.get_json() or {}
        logger.info("AI Itinerary request received: %s", data)

        # basic validation & defaults
        destination = data.get("destination", "Kerala, India")
        duration = int(data.get("duration_days", data.get("duration", 3)))
        start_date = data.get("start_date", datetime.now().strftime("%Y-%m-%d"))
        # Ensure valid date format
        try:
            # Accept ISO datetime with T as well
            if "T" in start_date:
                start_date = start_date.split("T")[0]
            datetime.strptime(start_date, "%Y-%m-%d")
        except Exception:
            start_date = datetime.now().strftime("%Y-%m-%d")

        # Prepare payload for service
        payload = {
            "destination": destination,
            "start_date": start_date,
            "duration_days": duration,
            "budget": data.get("budget", data.get("budget_per_person", 1000)),
            "group_size": data.get("group_size", 2),
            "travel_style": data.get("travel_style", ""),
            "accommodation": data.get("accommodation", ""),
            "interests": data.get("interests", [])
        }

        # Generate itinerary via AI service
        itinerary = generate_ai_itinerary(payload)

        # Always attach hotel recommendations if missing from AI response
        hotels = itinerary.get('hotels') or itinerary.get('recommended_hotels')
        if not hotels:
            from services.itinerary_ai_enhanced import EnhancedItineraryAI
            ai = EnhancedItineraryAI()
            hotels = ai._get_smart_hotel_recommendations({'full_name': destination}, duration, payload.get('budget', 1000), 'hotel')
            itinerary['recommended_hotels'] = hotels

        response_payload = {
            "success": True,
            "ai_generated": True,
            "generated_at": datetime.now().isoformat(),
            "itinerary": itinerary
        }
        return jsonify(response_payload), 200

    except ValueError as e:
        logger.exception("ValueError generating itinerary: %s", e)
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        logger.exception("Error generating AI itinerary: %s", e)
        return jsonify({"success": False, "error": "Internal Server Error"}), 500
