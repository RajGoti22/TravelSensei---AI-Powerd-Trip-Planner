# """
# ai_itinerary_service.py
# Handles Gemini Pro API integration for AI itinerary generation.
# """

# import os
# import json
# import google.generativeai as genai
# from dotenv import load_dotenv
# from services.ai_prompt_builder import build_itinerary_prompt

# load_dotenv()

# # Configure Gemini API
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# def generate_ai_itinerary(user_data):
#     """
#     Generate a travel itinerary using Gemini 1.5 Pro.
#     user_data = {
#       "destination": "Paris",
#       "duration_days": 5,
#       "budget": 5000,
#       "group_size": 2,
#       "interests": ["art", "food", "culture"]
#     }
#     """

#     prompt = build_itinerary_prompt(user_data)
#     print("[Gemini] Prompt:", prompt)
#     try:
#         model = genai.GenerativeModel("models/gemini-2.5-flash")
#         response = model.generate_content(prompt)
#         print("[Gemini] Raw response:", response.text)
#         import re
#         content = response.text or ""
#         # Remove code block formatting if present
#         content = re.sub(r"^```json\\s*|```$", "", content.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
#         content = re.sub(r"^```|```$", "", content.strip(), flags=re.MULTILINE).strip()
#         # Try to parse the JSON safely
#         try:
#             data = json.loads(content)
#             # Map 'days' to 'dayPlans' and 'day_plans' for frontend compatibility
#             if isinstance(data, dict) and "days" in data:
#                 data["dayPlans"] = data["days"]
#                 data["day_plans"] = data["days"]
#                 # For each day, map 'activities' to 'locations' for frontend compatibility
#                 for day in data["days"]:
#                     if "activities" in day:
#                         day["locations"] = [
#                             {
#                                 "name": act.get("place", ""),
#                                 "description": act.get("details", ""),
#                                 "type": "attraction",  # Default type
#                                 "time": act.get("time", "")
#                             }
#                             for act in day["activities"]
#                         ]
#             # If only dayPlans or day_plans exist, ensure both are present
#             if "dayPlans" in data and "day_plans" not in data:
#                 data["day_plans"] = data["dayPlans"]
#             if "day_plans" in data and "dayPlans" not in data:
#                 data["dayPlans"] = data["day_plans"]
#             return data
#         except json.JSONDecodeError:
#             start, end = content.find("{"), content.rfind("}") + 1
#             if start != -1 and end > start:
#                 cleaned = content[start:end]
#                 try:
#                     data = json.loads(cleaned)
#                     if isinstance(data, dict) and "days" in data:
#                         data["dayPlans"] = data["days"]
#                         data["day_plans"] = data["days"]
#                         for day in data["days"]:
#                             if "activities" in day:
#                                 day["locations"] = [
#                                     {
#                                         "name": act.get("place", ""),
#                                         "description": act.get("details", ""),
#                                         "type": "attraction",
#                                         "time": act.get("time", "")
#                                     }
#                                     for act in day["activities"]
#                                 ]
#                     # If only dayPlans or day_plans exist, ensure both are present
#                     if "dayPlans" in data and "day_plans" not in data:
#                         data["day_plans"] = data["dayPlans"]
#                     if "day_plans" in data and "dayPlans" not in data:
#                         data["dayPlans"] = data["day_plans"]
#                     return data
#                 except json.JSONDecodeError:
#                     pass
#             return {
#                 "error": "Invalid JSON response from Gemini",
#                 "raw_text": content
#             }
#     except Exception as e:
#         print("[Gemini] API error:", e)
#         return {
#             "error": f"Gemini API error: {str(e)}"
#         }



"""
services/ai_itinerary_service.py
Handles prompt building and AI calls (OpenAI GPT by default, optional Gemini).
Returns a Python dict formatted for your frontend.
"""

import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "openai").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # optional

# Try imports lazily (so project won't fail if gemini client not installed)
_openai_client = None
_genai = None
if MODEL_PROVIDER == "openai":
    try:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        logger.warning("OpenAI client init failed: %s", e)
        _openai_client = None
elif MODEL_PROVIDER == "gemini":
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _genai = genai
    except Exception as e:
        logger.warning("Gemini client init failed: %s", e)
        _genai = None


def build_itinerary_prompt(payload: dict) -> str:
    """
    Build a detailed, structured prompt for the AI model.
    payload is expected to contain keys like:
      - destination, duration, budget, group_size, travel_style, accommodation, interests, start_date
    """
    destination = payload.get("destination", "India")
    duration = int(payload.get("duration_days", payload.get("duration", 3)))
    budget = payload.get("budget", {})
    if isinstance(budget, dict):
        budget_display = budget.get("max", budget.get("min", 1000))
    elif isinstance(budget, int):
        budget_display = budget
    else:
        budget_display = 1000
    group_size = payload.get("group_size", 2)
    travel_style = payload.get("travel_style", "Balanced (sightseeing + leisure)")
    accommodation = payload.get("accommodation", "Hotel")
    interests = payload.get("interests", [])
    interests_str = ", ".join(interests) if isinstance(interests, (list, tuple)) else str(interests)
    start_date = payload.get("start_date", datetime.now().strftime("%Y-%m-%d"))

    prompt = f"""
You are TravelSensei — an expert travel planner. Create a realistic, local-aware, day-by-day itinerary in JSON format.

User trip details:
- Destination: {destination}
- Start Date: {start_date}
- Duration (days): {duration}
- Group Size: {group_size}
- Budget (per person, INR approx): ₹{budget_display}
- Travel Style: {travel_style}
- Accommodation Type: {accommodation}
- Interests: {interests_str}

Requirements & formatting rules:
1. Output MUST be valid JSON only (no explanation before/after).
2. Top-level keys: destination, duration_days, group_size, budget, summary, days, travel_tips, estimated_total_cost.
3. "days" is a list of objects with: day (int), date (YYYY-MM-DD), title, description, activities (list).
   - Each activity object must have: time (Morning/Afternoon/Evening), place, details, approx_time_mins (int), estimated_cost (INR)
4. Provide 3-5 activities per day (unless travel/arrival day).
5. Add local food suggestions per day where relevant.
6. Stay within the given budget level; avoid luxury-only suggestions if budget is low.
7. Provide "travel_tips" as an array of short strings.
8. Provide "estimated_total_cost" as an integer in INR.

Example output schema (strict JSON):
{{
  "destination": "{destination}",
  "start_date": "{start_date}",
  "duration_days": {duration},
  "group_size": {group_size},
  "budget": "₹{budget_display}",
  "summary": "Two-line summary of the trip.",
  "days": [
    {{
      "day": 1,
      "date": "2025-12-01",
      "title": "Arrival & Local Walk",
      "description": "Short day summary",
      "activities": [
        {{
          "time": "Morning",
          "place": "Example Place",
          "details": "What to do",
          "approx_time_mins": 120,
          "estimated_cost": 200
        }}
      ],
      "food_suggestion": "Try the local breakfast"
    }}
  ],
  "travel_tips": ["Tip 1", "Tip 2"],
  "estimated_total_cost": 12000
}}
"""

    return prompt.strip()


def _parse_json_from_text(text: str) -> dict:
    """Try to extract and parse JSON from arbitrary model text."""
    text = text.strip()
    # Quick try: direct load
    try:
        return json.loads(text)
    except Exception:
        pass

    # Attempt to locate first { ... } block
        start = text.find("{")
        end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end+1]
        try:
            return json.loads(candidate)
        except Exception:
            # try to fix common trailing commas
            candidate_fixed = candidate.replace(",}", "}").replace(",]", "]")
            try:
                return json.loads(candidate_fixed)
            except Exception:
                logger.exception("Failed to parse JSON from candidate")
    raise ValueError("Could not parse JSON from model output")


def generate_ai_itinerary(payload: dict, model: str = None, temperature: float = 0.75) -> dict:
    """
    Generate itinerary using configured model provider.
    Returns a Python dict matching the schema described in the prompt.
    """
    prompt = build_itinerary_prompt(payload)
    # Use a valid default for Gemini, fallback to OpenAI model for OpenAI
    if MODEL_PROVIDER == "gemini":
        model_to_use = model or os.getenv("AI_MODEL", "gemini-2.5-flash")
    else:
        model_to_use = model or os.getenv("AI_MODEL", "gpt-4o-mini")

    logger.info("Generating AI itinerary for %s (%s days) using provider=%s model=%s",
                payload.get("destination"), payload.get("duration_days"), MODEL_PROVIDER, model_to_use)

    # Use OpenAI if selected
    if MODEL_PROVIDER == "openai" and _openai_client is not None:
        try:
            resp = _openai_client.chat.completions.create(
                model=model_to_use,
                messages=[
                    {"role": "system", "content": "You are TravelSensei, an expert travel planner."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=1400
            )
            content = resp.choices[0].message.content
            parsed = _parse_json_from_text(content)
            return parsed
        except Exception as e:
            logger.exception("OpenAI call failed: %s", e)
            raise

    # Use Gemini if selected
    if MODEL_PROVIDER == "gemini" and _genai is not None:
        try:
            model = _genai.GenerativeModel(model_to_use)
            gen_response = model.generate_content(prompt)
            # Log the raw Gemini response for debugging
            logger.info("[Gemini] Raw response object: %r", gen_response)
            content = gen_response.text if hasattr(gen_response, "text") else str(gen_response)
            logger.info("[Gemini] Raw response text: %s", content)
            parsed = _parse_json_from_text(content)
            logger.info("[Gemini] Parsed response: %r", parsed)
            # Attach hotel recommendations if missing
            if 'hotels' not in parsed and 'recommended_hotels' not in parsed:
                from services.itinerary_ai_enhanced import EnhancedItineraryAI
                ai = EnhancedItineraryAI()
                dest = payload.get('destination')
                duration = int(payload.get('duration_days', 3))
                budget = int(payload.get('budget', 1000))
                hotels = ai._get_smart_hotel_recommendations({'full_name': dest}, duration, budget, 'hotel')
                parsed['recommended_hotels'] = hotels
            return parsed
        except Exception as e:
            logger.exception("Gemini call failed: %s", e)
            raise

    # Fallback: simple rule-based generator if no AI configured
    logger.warning("No AI client available, using lightweight fallback generator.")
    return _fallback_itinerary(payload)


def _fallback_itinerary(payload: dict) -> dict:
    """Simple rule-based itinerary generator (fallback)."""
    destination = payload.get("destination", "Unknown Destination")
    duration = int(payload.get("duration_days", payload.get("duration", 3)))
    start_date = payload.get("start_date", datetime.now().strftime("%Y-%m-%d"))
    days = []
    for i in range(duration):
        date_obj = datetime.strptime(start_date, "%Y-%m-%d") + (i * datetime.timedelta(days=1) if False else datetime.timedelta(days=i))
        date_str = date_obj.strftime("%Y-%m-%d")
        days.append({
            "day": i + 1,
            "date": date_str,
            "title": f"Day {i+1} - Explore {destination}",
            "description": f"A simple plan for day {i+1}",
            "activities": [
                {"time": "Morning", "place": "Local Sightseeing", "details": "Visit main attractions", "approx_time_mins": 180, "estimated_cost": 300},
                {"time": "Afternoon", "place": "Local Market", "details": "Try street food & shopping", "approx_time_mins": 120, "estimated_cost": 200},
                {"time": "Evening", "place": "Sunset Spot", "details": "Relax and photograph", "approx_time_mins": 90, "estimated_cost": 0},
            ],
            "food_suggestion": "Try local speciality"
        })
    return {
        "destination": destination,
        "start_date": start_date,
        "duration_days": duration,
        "group_size": payload.get("group_size", 2),
        "budget": f"₹{payload.get('budget', 1000)}",
        "summary": f"{duration}-day trip to {destination}",
        "days": days,
        "travel_tips": ["Carry ID", "Keep cash for local markets"],
        "estimated_total_cost": int(duration * 2000)
    }
