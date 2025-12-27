"""
ai_prompt_builder.py
Builds structured prompt text for Gemini itinerary generation.
"""

def build_itinerary_prompt(user_data):
    destination = user_data.get("destination", "India")
    duration = user_data.get("duration_days", 3)
    start_date = user_data.get("start_date", "")
    interests = ", ".join(user_data.get("interests", [])) if isinstance(user_data.get("interests", []), list) else str(user_data.get("interests", "sightseeing, local culture"))
    if not interests:
        interests = "sightseeing, local culture"

    budget = user_data.get("budget", 3000)
    group_size = user_data.get("group_size", 2)
    total_budget = budget * group_size

    return f"""
    You are TravelSensei, an expert AI travel planner.
    Create a detailed, engaging {duration}-day travel itinerary for {destination}.

    🧭 Traveler details:
    - Destination: {destination}
    - Duration: {duration} days
    - Start Date: {start_date if start_date else "Not specified"}
    - Group size: {group_size} people
    - Budget per person: ₹{budget}
    - Total Budget: ₹{total_budget}
    - Interests: {interests}

    ✨ Requirements:
    1. Make the itinerary realistic, time-balanced, and activity-rich.
    2. Each day should include title, summary, and activities (Morning, Afternoon, Evening).
    3. Avoid repeated places or illogical travel.
    4. Keep tone friendly and informative.
    5. After the day-by-day plan, ALWAYS include a JSON array called "hotels" (or "recommended_hotels") with 3-5 hotel or villa recommendations (matching the user's accommodation type if possible). Each hotel should have: name, type, location, rating, price_per_night, and a short description. These should be suitable for the group size and budget.
    6. Also provide a travel_tips array with 3-5 useful tips for this destination.

    🎯 Output ONLY valid JSON in the following format:

    {{
      "destination": "{destination}",
      "duration_days": {duration},
      "summary": "Short overview of the trip",
      "days": [
        {{
          "day": 1,
          "title": "Day title",
          "description": "Day summary",
          "activities": [
            {{"time": "Morning", "place": "Place name", "details": "What to do here"}}
          ]
        }}
      ],
      "hotels": [
        {{
          "name": "Hotel or Villa Name",
          "type": "hotel/villa/resort/etc.",
          "location": "Area or address",
          "rating": 4.5,
          "description": "Short description of the property"
        }}
      ],
      "travel_tips": [
        "Tip 1 for this destination",
        "Tip 2 for this destination"
      ]
    }}
    """
