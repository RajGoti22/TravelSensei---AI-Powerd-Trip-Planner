"""
Enhanced AI Itinerary Service with Smart Location-based Planning
Uses comprehensive destination database to create personalized itineraries
"""
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random

# Add data directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data'))

try:
    from destinations import get_destination_data, get_all_destinations
except ImportError:
    # Fallback if destinations module not found
    def get_destination_data(destination):
        return None
    def get_all_destinations():
        return []

class EnhancedItineraryAI:
    """Enhanced AI service for intelligent itinerary generation"""
    
    def __init__(self):
        """Initialize the enhanced AI service"""
        self.destinations_cache = {}
    
    def generate_smart_itinerary(
        self,
        destination: str,
        duration_days: int,
        start_date: str,
        preferences: Dict = None,
        budget: int = 25000,
        group_size: int = 2
    ) -> Dict:
        """
        Generate an intelligent, personalized itinerary
        
        Args:
            destination: Target destination
            duration_days: Number of days
            start_date: Start date (YYYY-MM-DD)
            preferences: User preferences dict
            budget: Total budget per person
            group_size: Number of travelers
        
        Returns:
            Dict: Complete itinerary with day plans, hotels, tips
        """
        import time
        start_time = time.time()
        print(f"🤖 Enhanced AI - Generating itinerary for {destination} ({duration_days} days)...")
        # Get destination data
        dest_data = get_destination_data(destination)
        
        if not dest_data:
            return self._generate_generic_itinerary(
                destination, duration_days, start_date, budget
            )
        
        # Parse preferences
        travel_style = preferences.get('travel_style', []) if preferences else []
        pace = preferences.get('pace', 'moderate') if preferences else 'moderate'
        include_hidden = preferences.get('include_hidden_gems', True) if preferences else True
        include_popular = preferences.get('include_popular', True) if preferences else True
        accommodation_type = preferences.get('accommodation_type', 'hotel') if preferences else 'hotel'
        
        # Generate day-by-day plans
        day_plans = self._create_day_plans(
            dest_data,
            duration_days,
            start_date,
            travel_style,
            pace,
            include_hidden,
            include_popular
        )
        
        print(f"✅ Enhanced AI - Generated {len(day_plans)} day plans for {duration_days} days")
        elapsed = time.time() - start_time
        print(f"⏱️ Itinerary generation took {elapsed:.2f} seconds.")
        
        # Ensure day_plans length matches duration_days
        if len(day_plans) != duration_days:
            print(f"⚠️ Day plans length ({len(day_plans)}) doesn't match duration_days ({duration_days}), adjusting...")
            if len(day_plans) > duration_days:
                day_plans = day_plans[:duration_days]
        
        # Calculate total cost
        hotels = self._get_smart_hotel_recommendations(
            dest_data,
            duration_days,
            budget,
            accommodation_type
        )
        
        # Calculate total cost
        total_cost = self._calculate_trip_cost(
            day_plans,
            hotels,
            duration_days,
            budget,
            dest_data
        )
        
        # Prepare response
        end_date = (datetime.strptime(start_date, "%Y-%m-%d") + 
                   timedelta(days=duration_days - 1)).strftime("%Y-%m-%d")
        
        return {
            'destination': dest_data['full_name'],
            'duration_days': duration_days,
            'start_date': start_date,
            'end_date': end_date,
            'theme': self._determine_theme(travel_style, dest_data),
            'day_plans': day_plans,
            'recommended_hotels': hotels,
            'total_estimated_cost': total_cost,
            'travel_tips': dest_data.get('travel_tips', []),
            'best_routes': dest_data.get('suggested_routes', []),
            'best_season': dest_data.get('best_season', 'Year-round'),
            'group_size': group_size,
            'budget_per_person': budget
        }
    
    def _create_day_plans(
        self,
        dest_data: Dict,
        duration_days: int,
        start_date: str,
        travel_style: List[str],
        pace: str,
        include_hidden: bool,
        include_popular: bool
    ) -> List[Dict]:
        """Create detailed day-by-day itinerary"""
        day_plans = []
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        
        # Collect attractions based on preferences
        all_attractions = []
        
        if include_popular:
            all_attractions.extend(dest_data.get('popular_attractions', []))
        
        if include_hidden:
            all_attractions.extend(dest_data.get('hidden_gems', []))
        
        # Filter by travel style if specified
        if travel_style:
            filtered = []
            for attr in all_attractions:
                if any(style in attr.get('category', '').lower() or 
                      style in attr.get('name', '').lower() or
                      style in attr.get('description', '').lower()
                      for style in travel_style):
                    filtered.append(attr)
            if filtered:
                all_attractions = filtered
        
        # Determine activities per day based on pace
        activities_per_day = {
            'relaxed': 2,
            'moderate': 3,
            'fast': 4
        }.get(pace, 3)
        
        # Shuffle for variety
        random.shuffle(all_attractions)
        
        # Create day plans
        attr_index = 0
        for day_num in range(1, duration_days + 1):
            day_date = (start_dt + timedelta(days=day_num - 1)).strftime("%Y-%m-%d")
            day_name = (start_dt + timedelta(days=day_num - 1)).strftime("%A")
            
            # Select attractions for this day
            day_attractions = []
            daily_count = min(activities_per_day, len(all_attractions) - attr_index)
            
            for _ in range(daily_count):
                if attr_index < len(all_attractions):
                    day_attractions.append(all_attractions[attr_index])
                    attr_index += 1
            
            # Add restaurant if available
            restaurants = dest_data.get('restaurants', [])
            if restaurants and day_num <= len(restaurants):
                day_attractions.append(restaurants[day_num - 1])
            
            # Calculate travel time
            travel_time = self._estimate_travel_time(day_attractions)
            
            # Create theme for the day
            if day_attractions:
                categories = [a.get('category', 'exploration') for a in day_attractions]
                theme = self._get_day_theme(categories, day_num)
            else:
                theme = "Exploration Day"
            
            # Generate notes
            notes = self._generate_day_notes(day_attractions, day_num, duration_days)
            
            day_plan = {
                'day': day_num,
                'date': f"{day_name}, {day_date}",
                'theme': theme,
                'locations': day_attractions,
                'travel_time_total': travel_time,
                'notes': notes
            }
            
            day_plans.append(day_plan)
        
        return day_plans
    
    def _get_day_theme(self, categories: List[str], day_num: int) -> str:
        """Generate a theme for the day based on activities"""
        theme_map = {
            'nature': ['Nature Exploration', 'Scenic Beauty', 'Natural Wonders'],
            'culture': ['Cultural Immersion', 'Heritage Walk', 'Historical Journey'],
            'adventure': ['Adventure Day', 'Thrills & Excitement', 'Adrenaline Rush'],
            'food': ['Culinary Delight', 'Food Trail', 'Gastronomic Experience'],
            'relaxation': ['Relaxation Day', 'Leisure Time', 'Unwind & Rejuvenate']
        }
        
        # Find dominant category
        if categories:
            dominant = max(set(categories), key=categories.count)
            themes = theme_map.get(dominant, ['Exploration Day'])
            return random.choice(themes)
        
        return f"Day {day_num} Adventure"
    
    def _estimate_travel_time(self, attractions: List[Dict]) -> float:
        """Estimate total travel time between locations"""
        if len(attractions) <= 1:
            return 0.5
        
        # Simple estimation: 30 min to 1 hour between locations
        return (len(attractions) - 1) * 0.75
    
    def _generate_day_notes(
        self,
        attractions: List[Dict],
        day_num: int,
        total_days: int
    ) -> str:
        """Generate helpful notes for the day"""
        notes = []
        
        if day_num == 1:
            notes.append("Start your journey with excitement!")
        elif day_num == total_days:
            notes.append("Make the most of your last day!")
        
        # Add time-specific tips
        morning_activities = [a for a in attractions if a.get('best_time') == 'morning']
        evening_activities = [a for a in attractions if a.get('best_time') == 'evening']
        
        if morning_activities:
            notes.append("Start early to make the most of morning activities.")
        if evening_activities:
            notes.append("Evening activities planned for beautiful sunset views.")
        
        # Check for entry fees
        paid_attractions = [a for a in attractions if a.get('entry_fee', 0) > 0]
        if paid_attractions:
            total_fee = sum(a.get('entry_fee', 0) for a in paid_attractions)
            notes.append(f"Total entry fees for today: ₹{total_fee} per person.")
        
        return " ".join(notes) if notes else "Enjoy your day of exploration!"
    
    def _get_smart_hotel_recommendations(
        self,
        dest_data: Dict,
        duration_days: int,
        budget: int,
        accommodation_type: str
    ) -> List[Dict]:
        """Get smart hotel recommendations based on budget and preferences"""
        hotels = dest_data.get('hotels', [])
        
        if not hotels:
            # Generate default hotels
            return self._generate_default_hotels(dest_data, budget, accommodation_type)
        
        # Filter by budget
        daily_budget = budget / duration_days
        hotel_budget = daily_budget * 0.4  # 40% of daily budget for accommodation
        
        suitable_hotels = []
        for hotel in hotels:
            if hotel.get('price_per_night', 10000) <= hotel_budget * 1.2:
                suitable_hotels.append(hotel)
        
        # If no suitable hotels, return all
        if not suitable_hotels:
            suitable_hotels = hotels
        
        # Sort by rating
        suitable_hotels.sort(key=lambda x: x.get('rating', 4.0), reverse=True)
        
        return suitable_hotels[:3]
    
    def _generate_default_hotels(
        self,
        dest_data: Dict,
        budget: int,
        accommodation_type: str
    ) -> List[Dict]:
        """Generate default hotel recommendations"""
        destination_name = dest_data.get('full_name', 'Destination')
        
        # Determine price range
        # Always generate 3 hotels regardless of budget/destination
        try:
            daily_budget = max(budget / 7, 1000)
            hotel_budget = max(daily_budget * 0.4, 800)
        except Exception:
            daily_budget = 2000
            hotel_budget = 800

        if hotel_budget < 2000:
            range_name = "Budget"
            prices = [800, 1200, 1500]
        elif hotel_budget < 5000:
            range_name = "Moderate"
            prices = [2500, 3500, 4500]
        else:
            range_name = "Luxury"
            prices = [6000, 8500, 12000]

        hotels = []
        hotel_types = {
            'hotel': ['Hotel', 'Inn', 'Lodge'],
            'resort': ['Resort', 'Retreat', 'Paradise'],
            'homestay': ['Homestay', 'Guesthouse', 'B&B'],
            'hostel': ['Hostel', 'Backpackers', 'Dorm'],
            'villa': ['Villa', 'Estate', 'Manor']
        }

        type_names = hotel_types.get(accommodation_type, ['Hotel'])
        location_name = destination_name.split(',')[0] if destination_name else 'Destination'

        for i, price in enumerate(prices):
            hotel = {
                'name': f"{random.choice(type_names)} {location_name} {i+1}",
                'type': accommodation_type,
                'rating': round(4.0 + (i * 0.2), 1),
                'price_range': range_name.lower(),
                'price_per_night': price,
                'location': location_name,
                'description': f"Comfortable {accommodation_type} with modern amenities"
            }
            hotels.append(hotel)

        # Always return at least 3 hotels
        while len(hotels) < 3:
            hotels.append({
                'name': f"{random.choice(type_names)} {location_name} Extra",
                'type': accommodation_type,
                'rating': 4.0,
                'price_range': range_name.lower(),
                'price_per_night': prices[0] if prices else 1000,
                'location': location_name,
                'description': f"Comfortable {accommodation_type} with modern amenities"
            })

        return hotels[:3]
    
    def _calculate_trip_cost(
        self,
        day_plans: List[Dict],
        hotels: List[Dict],
        duration_days: int,
        budget: int,
        dest_data: Dict
    ) -> int:
        """Calculate estimated trip cost"""
        # Accommodation cost
        avg_hotel_price = sum(h.get('price_per_night', 3000) for h in hotels) / len(hotels) if hotels else 3000
        accommodation_cost = avg_hotel_price * duration_days
        
        # Activity costs (entry fees)
        activity_cost = 0
        for day in day_plans:
            for location in day.get('locations', []):
                activity_cost += location.get('entry_fee', 0)
        
        # Food cost (based on destination)
        avg_daily_food = dest_data.get('avg_daily_budget', {}).get('moderate', 1500)
        food_cost = avg_daily_food * duration_days * 0.3  # 30% for food
        
        # Transport cost (estimate)
        transport_cost = duration_days * 1000
        
        # Total
        total = accommodation_cost + activity_cost + food_cost + transport_cost
        
        # Adjust to fit within budget if too high
        if total > budget * 1.2:
            total = int(budget * 1.1)
        
        return int(total)
    
    def _determine_theme(self, travel_style: List[str], dest_data: Dict) -> str:
        """Determine overall trip theme"""
        if not travel_style:
            return f"Discover {dest_data.get('full_name', 'Amazing Places')}"
        
        style_themes = {
            'adventure': 'Adventure & Exploration',
            'cultural': 'Cultural Immersion',
            'nature': 'Nature & Serenity',
            'foodie': 'Culinary Journey',
            'relaxation': 'Relaxation Retreat',
            'photography': 'Photography Expedition',
            'spiritual': 'Spiritual Journey'
        }
        
        primary_style = travel_style[0] if travel_style else 'adventure'
        return style_themes.get(primary_style, 'Memorable Journey')
    
    def _generate_generic_itinerary(
        self,
        destination: str,
        duration_days: int,
        start_date: str,
        budget: int
    ) -> Dict:
        """Generate a generic itinerary for unknown destinations"""
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = start_dt + timedelta(days=duration_days - 1)
        
        day_plans = []
        for day in range(1, duration_days + 1):
            day_date = (start_dt + timedelta(days=day - 1)).strftime("%Y-%m-%d")
            day_plans.append({
                'day': day,
                'date': day_date,
                'theme': f'Explore {destination}',
                'locations': [
                    {
                        'name': f'{destination} Exploration',
                        'type': 'attraction',
                        'description': f'Discover the beauty and culture of {destination}',
                        'duration_hours': 6.0,
                        'rating': 4.5,
                        'coordinates': [0, 0],
                        'best_time': 'morning',
                        'category': 'exploration'
                    }
                ],
                'travel_time_total': 1.0,
                'notes': 'Explore local attractions and immerse yourself in the culture.'
            })
        
        return {
            'destination': destination,
            'duration_days': duration_days,
            'start_date': start_date,
            'end_date': end_dt.strftime("%Y-%m-%d"),
            'theme': f'Discover {destination}',
            'day_plans': day_plans,
            'recommended_hotels': self._generate_default_hotels(
                {'full_name': destination}, budget, 'hotel'
            ),
            'total_estimated_cost': int(budget * 0.9),
            'travel_tips': [
                'Research local customs and traditions',
                'Try local cuisine',
                'Carry necessary travel documents',
                'Book accommodations in advance'
            ],
            'best_routes': [],
            'best_season': 'Check local weather patterns'
        }
