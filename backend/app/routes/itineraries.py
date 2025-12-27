from flask import Blueprint, jsonify, request
from ..services.nlp import generate_itinerary

itineraries_bp = Blueprint("itineraries", __name__)


@itineraries_bp.post("/itineraries/generate")
def create_itinerary():
	data = request.get_json(force=True, silent=True) or {}
	destination = data.get("destination", "Tokyo")
	days = int(data.get("days", 3))
	preferences = data.get("preferences", [])
	itinerary = generate_itinerary(destination=destination, days=days, preferences=preferences)
	return jsonify({"itinerary": itinerary}), 200


