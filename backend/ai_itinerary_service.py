"""
Intelligent AI Itinerary Generation Service
==========================================

This service uses machine learning and NLP to generate personalized travel itineraries.
It analyzes user preferences, travel patterns, and destination data to create optimal
routing and activity recommendations.

Technologies used:
- pandas & numpy: Data analysis and manipulation
- scikit-learn: User preference clustering and recommendation algorithms
- Hugging Face transformers: NLP for preference analysis and content generation
- sentence-transformers: Semantic similarity for activity matching
- networkx: Graph algorithms for optimal routing
- geopy: Geographic calculations and distance optimization
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from transformers import pipeline, AutoTokenizer, AutoModel
from sentence_transformers import SentenceTransformer
import networkx as nx
from geopy.distance import geodesic
import json
import datetime
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TravelStyle(Enum):
    LUXURY = "luxury"
    MID_RANGE = "mid-range"
    BUDGET = "budget"
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    RELAXATION = "relaxation"

@dataclass
class UserPreferences:
    """User travel preferences structure"""
    destination: str
    duration: int
    budget: float
    interests: List[str]
    travel_style: TravelStyle
    group_size: int
    start_date: str
    accommodation_preference: str = "mid-range"
    transportation_preference: str = "mixed"

@dataclass
class Location:
    """Travel location data structure"""
    name: str
    latitude: float
    longitude: float
    category: str
    activities: List[str]
    average_cost: float
    recommended_duration: int
    season_preference: str
    description: str
    tags: List[str]

@dataclass
class Activity:
    """Activity data structure"""
    name: str
    description: str
    category: str
    duration: float
    cost: float
    location: str
    rating: float
    tags: List[str]
    time_slot: str  # morning, afternoon, evening, full_day

class IntelligentItineraryAI:
    """
    Advanced AI service for generating intelligent, personalized travel itineraries
    using machine learning and natural language processing.
    """
    
    def __init__(self):
        """Initialize the AI service with ML models and data"""
        logger.info("Initializing Intelligent Itinerary AI Service...")
        
        # Initialize ML models
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.nlp_pipeline = pipeline("text-classification", 
                                   model="cardiffnlp/twitter-roberta-base-emotion")
        
        # Initialize data structures
        self.destinations_df = None
        self.activities_df = None
        self.user_preferences_df = None
        self.route_graph = None
        
        # Load destination and activity data
        self._load_kerala_data()
        self._build_route_graph()
        
        logger.info("AI Service initialized successfully!")
    
    def _load_kerala_data(self):
        """Load and structure Kerala travel data using pandas"""
        logger.info("Loading Kerala destination and activity data...")
        
        # Kerala destinations with comprehensive data
        kerala_destinations = [
            {
                "name": "Munnar",
                "latitude": 10.0889,
                "longitude": 77.0595,
                "category": "hill_station",
                "activities": ["tea_plantation", "trekking", "wildlife", "photography"],
                "average_cost": 80.0,
                "recommended_duration": 3,
                "season_preference": "winter",
                "description": "Picturesque hill station known for tea gardens and cool climate",
                "tags": ["nature", "mountains", "tea", "peaceful", "scenic"]
            },
            {
                "name": "Alleppey",
                "latitude": 9.4981,
                "longitude": 76.3388,
                "category": "backwaters",
                "activities": ["houseboat", "backwater_cruise", "village_tour", "fishing"],
                "average_cost": 120.0,
                "recommended_duration": 2,
                "season_preference": "winter",
                "description": "Venice of the East famous for backwaters and houseboats",
                "tags": ["backwaters", "houseboat", "relaxation", "unique", "water"]
            },
            {
                "name": "Kochi",
                "latitude": 9.9312,
                "longitude": 76.2673,
                "category": "city",
                "activities": ["heritage_walk", "spice_market", "kathakali", "chinese_nets"],
                "average_cost": 60.0,
                "recommended_duration": 2,
                "season_preference": "all_season",
                "description": "Historic port city with colonial architecture and cultural heritage",
                "tags": ["history", "culture", "heritage", "port", "colonial"]
            },
            {
                "name": "Thekkady",
                "latitude": 9.5992,
                "longitude": 77.1603,
                "category": "wildlife",
                "activities": ["wildlife_safari", "spice_plantation", "boating", "trekking"],
                "average_cost": 70.0,
                "recommended_duration": 2,
                "season_preference": "winter",
                "description": "Wildlife sanctuary famous for elephants and spice plantations",
                "tags": ["wildlife", "nature", "safari", "spices", "adventure"]
            },
            {
                "name": "Kumarakom",
                "latitude": 9.6178,
                "longitude": 76.4284,
                "category": "backwaters",
                "activities": ["bird_watching", "backwater_cruise", "ayurveda", "fishing"],
                "average_cost": 90.0,
                "recommended_duration": 2,
                "season_preference": "winter",
                "description": "Serene backwater destination known for bird sanctuary",
                "tags": ["birds", "backwaters", "peaceful", "nature", "ayurveda"]
            },
            {
                "name": "Kovalam",
                "latitude": 8.4004,
                "longitude": 76.9784,
                "category": "beach",
                "activities": ["beach_activities", "lighthouse", "ayurveda", "surfing"],
                "average_cost": 75.0,
                "recommended_duration": 2,
                "season_preference": "winter",
                "description": "Popular beach destination with lighthouse and ayurvedic treatments",
                "tags": ["beach", "lighthouse", "ayurveda", "relaxation", "surfing"]
            },
            {
                "name": "Wayanad",
                "latitude": 11.6054,
                "longitude": 76.0860,
                "category": "hill_station",
                "activities": ["wildlife", "caves", "waterfalls", "tribal_culture"],
                "average_cost": 65.0,
                "recommended_duration": 3,
                "season_preference": "winter",
                "description": "Green paradise with wildlife, waterfalls and tribal heritage",
                "tags": ["wildlife", "waterfalls", "tribal", "nature", "caves"]
            }
        ]
        
        # Create destinations DataFrame
        self.destinations_df = pd.DataFrame(kerala_destinations)
        
        # Detailed activities for each destination
        activities_data = [
            # Munnar Activities
            {"name": "Tea Museum Visit", "description": "Learn about tea processing and history", 
             "category": "cultural", "duration": 2.5, "cost": 15.0, "location": "Munnar",
             "rating": 4.5, "tags": ["educational", "tea", "history"], "time_slot": "morning"},
            {"name": "Top Station Sunset", "description": "Panoramic views and sunset photography",
             "category": "nature", "duration": 2.0, "cost": 10.0, "location": "Munnar",
             "rating": 4.7, "tags": ["sunset", "photography", "scenic"], "time_slot": "evening"},
            {"name": "Eravikulam National Park", "description": "Wildlife sanctuary with Nilgiri Tahr",
             "category": "wildlife", "duration": 4.0, "cost": 25.0, "location": "Munnar",
             "rating": 4.6, "tags": ["wildlife", "conservation", "trekking"], "time_slot": "full_day"},
            
            # Alleppey Activities
            {"name": "Houseboat Cruise", "description": "Traditional houseboat journey through backwaters",
             "category": "relaxation", "duration": 8.0, "cost": 150.0, "location": "Alleppey",
             "rating": 4.8, "tags": ["houseboat", "backwaters", "unique"], "time_slot": "full_day"},
            {"name": "Village Cycling Tour", "description": "Explore rural villages and paddy fields",
             "category": "cultural", "duration": 3.0, "cost": 20.0, "location": "Alleppey",
             "rating": 4.4, "tags": ["cycling", "village", "authentic"], "time_slot": "morning"},
            
            # Kochi Activities
            {"name": "Fort Kochi Heritage Walk", "description": "Colonial architecture and history tour",
             "category": "history", "duration": 3.0, "cost": 12.0, "location": "Kochi",
             "rating": 4.6, "tags": ["heritage", "colonial", "walking"], "time_slot": "morning"},
            {"name": "Kathakali Performance", "description": "Traditional Kerala classical dance",
             "category": "cultural", "duration": 2.0, "cost": 25.0, "location": "Kochi",
             "rating": 4.7, "tags": ["dance", "traditional", "performance"], "time_slot": "evening"},
            {"name": "Spice Market Exploration", "description": "Aromatic journey through spice markets",
             "category": "cultural", "duration": 2.0, "cost": 8.0, "location": "Kochi",
             "rating": 4.3, "tags": ["spices", "market", "shopping"], "time_slot": "afternoon"},
            
            # Thekkady Activities
            {"name": "Periyar Wildlife Safari", "description": "Boat safari to spot elephants and tigers",
             "category": "adventure", "duration": 3.5, "cost": 35.0, "location": "Thekkady",
             "rating": 4.5, "tags": ["wildlife", "safari", "elephants"], "time_slot": "morning"},
            {"name": "Spice Plantation Tour", "description": "Guided tour through aromatic plantations",
             "category": "cultural", "duration": 2.5, "cost": 18.0, "location": "Thekkady",
             "rating": 4.4, "tags": ["spices", "plantation", "guided"], "time_slot": "afternoon"},
            
            # Kumarakom Activities
            {"name": "Bird Sanctuary Visit", "description": "Spot migratory birds and local species",
             "category": "nature", "duration": 3.0, "cost": 15.0, "location": "Kumarakom",
             "rating": 4.5, "tags": ["birds", "nature", "photography"], "time_slot": "morning"},
            {"name": "Ayurvedic Treatment", "description": "Traditional Kerala wellness therapy",
             "category": "wellness", "duration": 2.0, "cost": 60.0, "location": "Kumarakom",
             "rating": 4.6, "tags": ["ayurveda", "wellness", "relaxation"], "time_slot": "afternoon"},
            
            # Kovalam Activities
            {"name": "Lighthouse Beach", "description": "Iconic lighthouse and beach activities",
             "category": "beach", "duration": 4.0, "cost": 5.0, "location": "Kovalam",
             "rating": 4.4, "tags": ["beach", "lighthouse", "swimming"], "time_slot": "full_day"},
            {"name": "Ayurvedic Spa Treatment", "description": "Beachside wellness and rejuvenation",
             "category": "wellness", "duration": 3.0, "cost": 80.0, "location": "Kovalam",
             "rating": 4.7, "tags": ["spa", "ayurveda", "beachside"], "time_slot": "afternoon"},
            
            # Wayanad Activities
            {"name": "Edakkal Caves", "description": "Ancient caves with prehistoric rock art",
             "category": "history", "duration": 3.0, "cost": 12.0, "location": "Wayanad",
             "rating": 4.5, "tags": ["caves", "history", "ancient"], "time_slot": "morning"},
            {"name": "Soochipara Falls", "description": "Three-tier waterfall and trekking",
             "category": "adventure", "duration": 4.0, "cost": 8.0, "location": "Wayanad",
             "rating": 4.6, "tags": ["waterfalls", "trekking", "nature"], "time_slot": "full_day"}
        ]
        
        # Create activities DataFrame
        self.activities_df = pd.DataFrame(activities_data)
        
        logger.info(f"Loaded {len(self.destinations_df)} destinations and {len(self.activities_df)} activities")
    
    def _build_route_graph(self):
        """Build a graph network for optimal routing using NetworkX"""
        logger.info("Building route optimization graph...")
        
        self.route_graph = nx.Graph()
        
        # Add destinations as nodes
        for _, destination in self.destinations_df.iterrows():
            self.route_graph.add_node(
                destination['name'],
                pos=(destination['latitude'], destination['longitude']),
                category=destination['category'],
                avg_cost=destination['average_cost'],
                duration=destination['recommended_duration']
            )
        
        # Add edges with distances and travel times
        destinations = self.destinations_df.to_dict('records')
        for i, dest1 in enumerate(destinations):
            for j, dest2 in enumerate(destinations[i+1:], i+1):
                # Calculate geodesic distance
                coord1 = (dest1['latitude'], dest1['longitude'])
                coord2 = (dest2['latitude'], dest2['longitude'])
                distance = geodesic(coord1, coord2).kilometers
                
                # Estimate travel time (assuming average speed of 40 km/h on Kerala roads)
                travel_time = distance / 40.0
                
                self.route_graph.add_edge(
                    dest1['name'], 
                    dest2['name'],
                    distance=distance,
                    travel_time=travel_time,
                    cost=distance * 0.5  # Estimated cost per km
                )
        
        logger.info(f"Built route graph with {self.route_graph.number_of_nodes()} nodes and {self.route_graph.number_of_edges()} edges")
    
    def analyze_user_preferences(self, preferences: UserPreferences) -> Dict:
        """
        Use NLP to analyze user preferences and generate preference profile
        """
        logger.info("Analyzing user preferences with NLP...")
        
        # Combine user interests and travel style into text
        preference_text = f"{' '.join(preferences.interests)} {preferences.travel_style.value}"
        
        # Generate embeddings for user preferences
        preference_embedding = self.sentence_model.encode([preference_text])
        
        # Analyze sentiment/emotion in preferences
        emotion_analysis = self.nlp_pipeline(preference_text)
        
        # Create activity embeddings
        activity_descriptions = self.activities_df['description'].tolist()
        activity_embeddings = self.sentence_model.encode(activity_descriptions)
        
        # Calculate similarity between user preferences and activities
        similarities = cosine_similarity(preference_embedding, activity_embeddings)[0]
        
        # Add similarity scores to activities DataFrame
        activities_with_scores = self.activities_df.copy()
        activities_with_scores['preference_score'] = similarities
        
        return {
            'preference_embedding': preference_embedding,
            'emotion_analysis': emotion_analysis,
            'matched_activities': activities_with_scores.sort_values('preference_score', ascending=False),
            'preference_categories': self._extract_preference_categories(preferences)
        }
    
    def _extract_preference_categories(self, preferences: UserPreferences) -> Dict:
        """Extract and categorize user preferences"""
        categories = {
            'nature_lover': any(interest in ['nature', 'wildlife', 'trekking', 'mountains'] 
                              for interest in preferences.interests),
            'culture_enthusiast': any(interest in ['culture', 'history', 'heritage', 'art'] 
                                    for interest in preferences.interests),
            'adventure_seeker': any(interest in ['adventure', 'sports', 'trekking', 'safari'] 
                                  for interest in preferences.interests),
            'relaxation_focused': any(interest in ['relaxation', 'wellness', 'spa', 'peaceful'] 
                                    for interest in preferences.interests),
            'budget_conscious': preferences.travel_style in [TravelStyle.BUDGET],
            'luxury_traveler': preferences.travel_style in [TravelStyle.LUXURY],
            'group_traveler': preferences.group_size > 2
        }
        return categories
    
    def generate_optimal_route(self, preferences: UserPreferences, selected_destinations: List[str]) -> List[str]:
        """
        Generate optimal route using graph algorithms and user preferences
        """
        logger.info("Generating optimal route using graph algorithms...")
        
        if len(selected_destinations) <= 2:
            return selected_destinations
        
        # Create subgraph with selected destinations
        subgraph = self.route_graph.subgraph(selected_destinations)
        
        # Find optimal route using different strategies based on preferences
        if preferences.travel_style == TravelStyle.BUDGET:
            # Minimize cost - use shortest path by cost
            route = self._find_minimum_cost_route(subgraph, selected_destinations)
        elif preferences.duration <= 5:
            # Short trip - minimize travel time
            route = self._find_minimum_time_route(subgraph, selected_destinations)
        else:
            # Balanced approach - consider both distance and destination appeal
            route = self._find_balanced_route(subgraph, selected_destinations, preferences)
        
        return route
    
    def _find_minimum_cost_route(self, graph: nx.Graph, destinations: List[str]) -> List[str]:
        """Find route that minimizes travel costs"""
        # Use nearest neighbor heuristic with cost as weight
        route = []
        remaining = set(destinations)
        current = destinations[0]  # Start from first destination
        route.append(current)
        remaining.remove(current)
        
        while remaining:
            next_dest = min(remaining, 
                          key=lambda dest: graph[current][dest]['cost'] if graph.has_edge(current, dest) else float('inf'))
            route.append(next_dest)
            remaining.remove(next_dest)
            current = next_dest
        
        return route
    
    def _find_minimum_time_route(self, graph: nx.Graph, destinations: List[str]) -> List[str]:
        """Find route that minimizes travel time"""
        # Use nearest neighbor heuristic with travel time as weight
        route = []
        remaining = set(destinations)
        current = destinations[0]
        route.append(current)
        remaining.remove(current)
        
        while remaining:
            next_dest = min(remaining,
                          key=lambda dest: graph[current][dest]['travel_time'] if graph.has_edge(current, dest) else float('inf'))
            route.append(next_dest)
            remaining.remove(next_dest)
            current = next_dest
        
        return route
    
    def _find_balanced_route(self, graph: nx.Graph, destinations: List[str], preferences: UserPreferences) -> List[str]:
        """Find balanced route considering multiple factors"""
        # Score each destination based on user preferences
        dest_scores = {}
        for dest in destinations:
            dest_info = self.destinations_df[self.destinations_df['name'] == dest].iloc[0]
            score = self._calculate_destination_score(dest_info, preferences)
            dest_scores[dest] = score
        
        # Use modified nearest neighbor considering both distance and destination appeal
        route = []
        remaining = set(destinations)
        
        # Start with highest-scored destination
        current = max(destinations, key=lambda d: dest_scores[d])
        route.append(current)
        remaining.remove(current)
        
        while remaining:
            # Consider both travel cost and destination appeal
            def combined_score(dest):
                if not graph.has_edge(current, dest):
                    return float('-inf')
                travel_cost = graph[current][dest]['cost']
                dest_appeal = dest_scores[dest] * 10  # Scale destination appeal
                return dest_appeal - travel_cost  # Higher appeal, lower cost = better score
            
            next_dest = max(remaining, key=combined_score)
            route.append(next_dest)
            remaining.remove(next_dest)
            current = next_dest
        
        return route
    
    def _calculate_destination_score(self, destination: pd.Series, preferences: UserPreferences) -> float:
        """Calculate destination appeal score based on user preferences"""
        score = 0.0
        
        # Category preferences
        category_weights = {
            'nature_lover': {'hill_station': 0.8, 'wildlife': 0.9, 'backwaters': 0.6},
            'culture_enthusiast': {'city': 0.9, 'heritage': 0.8, 'cultural': 0.7},
            'adventure_seeker': {'wildlife': 0.8, 'hill_station': 0.7, 'adventure': 0.9},
            'relaxation_focused': {'backwaters': 0.9, 'beach': 0.8, 'wellness': 0.9}
        }
        
        preference_categories = self._extract_preference_categories(preferences)
        
        for category, weight in preference_categories.items():
            if weight and category in category_weights:
                if destination['category'] in category_weights[category]:
                    score += category_weights[category][destination['category']]
        
        # Budget considerations
        if preferences.travel_style == TravelStyle.BUDGET:
            score += (100 - destination['average_cost']) / 100  # Lower cost = higher score
        elif preferences.travel_style == TravelStyle.LUXURY:
            score += destination['average_cost'] / 100  # Higher cost = higher score
        
        return score
    
    def select_activities_for_destination(self, destination: str, preferences: UserPreferences, 
                                        day_number: int, analysis_results: Dict) -> List[Dict]:
        """
        Select optimal activities for a destination using ML recommendations
        """
        # Get activities for this destination
        dest_activities = analysis_results['matched_activities'][
            analysis_results['matched_activities']['location'] == destination
        ].copy()
        
        if dest_activities.empty:
            return []
        
        # Consider time of day and activity flow
        activities_per_day = 2 if day_number == 1 else 3  # Lighter first day
        
        # Balance activity types within a day
        selected_activities = []
        used_time_slots = set()
        
        # Sort by preference score
        dest_activities_sorted = dest_activities.sort_values('preference_score', ascending=False)
        
        for _, activity in dest_activities_sorted.iterrows():
            if len(selected_activities) >= activities_per_day:
                break
            
            # Avoid time slot conflicts
            if activity['time_slot'] not in used_time_slots or activity['time_slot'] == 'full_day':
                selected_activities.append({
                    'id': f"{destination.lower()}_{activity['name'].lower().replace(' ', '_')}_{day_number}",
                    'name': activity['name'],
                    'description': activity['description'],
                    'category': activity['category'],
                    'duration': activity['duration'],
                    'cost': activity['cost'],
                    'rating': activity['rating'],
                    'time_slot': activity['time_slot'],
                    'preference_score': activity['preference_score'],
                    'location': {
                        'name': destination,
                        'coordinates': self._get_destination_coordinates(destination)
                    }
                })
                
                if activity['time_slot'] != 'full_day':
                    used_time_slots.add(activity['time_slot'])
        
        return selected_activities
    
    def _get_destination_coordinates(self, destination: str) -> Dict:
        """Get coordinates for a destination"""
        dest_info = self.destinations_df[self.destinations_df['name'] == destination]
        if not dest_info.empty:
            row = dest_info.iloc[0]
            return {'lat': row['latitude'], 'lng': row['longitude']}
        return {'lat': 0, 'lng': 0}
    
    def calculate_costs_and_logistics(self, route: List[str], activities: Dict, 
                                    preferences: UserPreferences) -> Dict:
        """Calculate comprehensive costs and logistics"""
        total_cost = 0.0
        daily_costs = []
        transportation_plan = []
        
        # Base daily costs by travel style
        daily_base_costs = {
            TravelStyle.LUXURY: {'accommodation': 200, 'meals': 80},
            TravelStyle.MID_RANGE: {'accommodation': 80, 'meals': 35},
            TravelStyle.BUDGET: {'accommodation': 25, 'meals': 15}
        }
        
        base_costs = daily_base_costs.get(preferences.travel_style, daily_base_costs[TravelStyle.MID_RANGE])
        
        for i, destination in enumerate(route):
            # Daily accommodation and meals
            daily_cost = base_costs['accommodation'] + base_costs['meals']
            
            # Add activity costs
            if destination in activities:
                activity_cost = sum(activity['cost'] for activity in activities[destination])
                daily_cost += activity_cost
            
            # Add transportation cost (except for first destination)
            if i > 0:
                prev_dest = route[i-1]
                if self.route_graph.has_edge(prev_dest, destination):
                    transport_cost = self.route_graph[prev_dest][destination]['cost']
                    transport_info = {
                        'from': prev_dest,
                        'to': destination,
                        'distance': self.route_graph[prev_dest][destination]['distance'],
                        'time': self.route_graph[prev_dest][destination]['travel_time'],
                        'cost': transport_cost
                    }
                    transportation_plan.append(transport_info)
                    daily_cost += transport_cost
            
            daily_costs.append(daily_cost)
            total_cost += daily_cost
        
        return {
            'total_cost': total_cost,
            'daily_costs': daily_costs,
            'transportation_plan': transportation_plan,
            'cost_breakdown': {
                'accommodation': len(route) * base_costs['accommodation'],
                'meals': len(route) * base_costs['meals'],
                'activities': sum(sum(activity['cost'] for activity in activities.get(dest, [])) for dest in route),
                'transportation': sum(plan['cost'] for plan in transportation_plan)
            }
        }
    
    def generate_intelligent_itinerary(self, preferences: UserPreferences) -> Dict:
        """
        Main method to generate intelligent, personalized itinerary using ML and AI
        """
        logger.info(f"Generating intelligent itinerary for {preferences.destination}")
        
        try:
            # Step 1: Analyze user preferences using NLP
            analysis_results = self.analyze_user_preferences(preferences)
            
            # Step 2: Select destinations based on preferences and duration
            selected_destinations = self._select_destinations_for_trip(preferences, analysis_results)
            
            # Step 3: Generate optimal route using graph algorithms
            optimal_route = self.generate_optimal_route(preferences, selected_destinations)
            
            # Step 4: Generate day-by-day itinerary
            days = []
            activities_by_destination = {}
            current_date = datetime.datetime.strptime(preferences.start_date, "%Y-%m-%d")
            
            # Distribute days across destinations
            days_per_destination = self._distribute_days(optimal_route, preferences.duration)
            
            day_counter = 1
            for dest_index, destination in enumerate(optimal_route):
                days_at_dest = days_per_destination[dest_index]
                
                for day_at_dest in range(days_at_dest):
                    # Select activities using ML recommendations
                    day_activities = self.select_activities_for_destination(
                        destination, preferences, day_at_dest + 1, analysis_results
                    )
                    
                    if destination not in activities_by_destination:
                        activities_by_destination[destination] = []
                    activities_by_destination[destination].extend(day_activities)
                    
                    # Build day information
                    day_info = {
                        'day': day_counter,
                        'date': current_date.strftime("%Y-%m-%d"),
                        'location': destination,
                        'theme': self._generate_day_theme(destination, day_at_dest + 1, preferences),
                        'activities': day_activities,
                        'transportation': self._get_transportation_info(optimal_route, dest_index) if dest_index > 0 and day_at_dest == 0 else None,
                        'estimated_cost': sum(activity['cost'] for activity in day_activities) + 
                                        (200 if preferences.travel_style == TravelStyle.LUXURY else 
                                         80 if preferences.travel_style == TravelStyle.MID_RANGE else 25),
                        'highlights': [activity['name'] for activity in day_activities[:2]],
                        'tips': self._generate_local_tips(destination, preferences),
                        'weather_info': self._get_weather_guidance(destination, current_date),
                        'local_insights': self._generate_ai_insights(destination, preferences)
                    }
                    
                    days.append(day_info)
                    day_counter += 1
                    current_date += datetime.timedelta(days=1)
                    
                    if day_counter > preferences.duration:
                        break
                
                if day_counter > preferences.duration:
                    break
            
            # Step 5: Calculate comprehensive costs and logistics
            cost_logistics = self.calculate_costs_and_logistics(optimal_route, activities_by_destination, preferences)
            
            # Step 6: Generate AI-powered insights and recommendations
            ai_insights = self._generate_comprehensive_insights(preferences, optimal_route, analysis_results)
            
            # Build final itinerary
            itinerary = {
                'id': f"ai_itinerary_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'destination': preferences.destination,
                'duration': preferences.duration,
                'budget': preferences.budget,
                'title': f"AI-Curated {preferences.duration}-Day {preferences.destination} Journey",
                'description': f"Intelligently crafted {preferences.duration}-day personalized itinerary for {preferences.destination} "
                             f"optimized for {preferences.travel_style.value} travel style with {', '.join(preferences.interests)} interests.",
                'days': days,
                'total_cost': cost_logistics['total_cost'],
                'cost_breakdown': cost_logistics['cost_breakdown'],
                'transportation_plan': cost_logistics['transportation_plan'],
                'route_optimization': {
                    'strategy': 'AI-optimized routing using graph algorithms and preference analysis',
                    'optimal_sequence': optimal_route,
                    'reasoning': ai_insights['route_reasoning']
                },
                'ai_insights': ai_insights,
                'personalization_score': analysis_results['matched_activities']['preference_score'].mean(),
                'sustainability_tips': self._generate_sustainability_tips(),
                'local_culture_guide': self._generate_culture_guide(optimal_route),
                'emergency_info': self._generate_emergency_info(),
                'created_at': datetime.datetime.now().isoformat(),
                'generated_by': 'Intelligent AI Itinerary System v1.0',
                'ml_models_used': ['sentence-transformers', 'scikit-learn', 'networkx', 'huggingface-transformers']
            }
            
            logger.info(f"Successfully generated AI itinerary with {len(days)} days and personalization score: {itinerary['personalization_score']:.3f}")
            return itinerary
            
        except Exception as e:
            logger.error(f"Error generating intelligent itinerary: {str(e)}")
            raise Exception(f"Failed to generate AI itinerary: {str(e)}")
    
    def _select_destinations_for_trip(self, preferences: UserPreferences, analysis_results: Dict) -> List[str]:
        """Select optimal destinations based on duration and preferences"""
        # Destinations based on trip duration
        if preferences.duration <= 3:
            return ['Kochi', 'Munnar']
        elif preferences.duration <= 5:
            return ['Kochi', 'Munnar', 'Thekkady']
        elif preferences.duration <= 7:
            return ['Kochi', 'Munnar', 'Thekkady', 'Alleppey']
        elif preferences.duration <= 10:
            return ['Kochi', 'Munnar', 'Thekkady', 'Alleppey', 'Kumarakom']
        else:
            return ['Kochi', 'Munnar', 'Thekkady', 'Alleppey', 'Kumarakom', 'Kovalam', 'Wayanad']
    
    def _distribute_days(self, destinations: List[str], total_days: int) -> List[int]:
        """Distribute days across destinations optimally"""
        base_days = total_days // len(destinations)
        extra_days = total_days % len(destinations)
        
        days_distribution = [base_days] * len(destinations)
        
        # Add extra days to destinations with higher recommended duration
        for i in range(extra_days):
            dest_name = destinations[i % len(destinations)]
            dest_info = self.destinations_df[self.destinations_df['name'] == dest_name]
            if not dest_info.empty and dest_info.iloc[0]['recommended_duration'] > base_days:
                days_distribution[i % len(destinations)] += 1
        
        # Ensure minimum 1 day per destination
        return [max(1, days) for days in days_distribution]
    
    def _generate_day_theme(self, destination: str, day_number: int, preferences: UserPreferences) -> str:
        """Generate AI-powered day theme"""
        themes = {
            'Munnar': ['Tea Heritage Discovery', 'Mountain Adventure', 'Wildlife Exploration'],
            'Alleppey': ['Backwater Serenity', 'Village Cultural Immersion'],
            'Kochi': ['Colonial Heritage Journey', 'Cultural Arts Experience'],
            'Thekkady': ['Wildlife Safari Adventure', 'Spice Trail Discovery'],
            'Kumarakom': ['Bird Watching Paradise', 'Ayurvedic Wellness'],
            'Kovalam': ['Beach Bliss', 'Wellness Retreat'],
            'Wayanad': ['Ancient Caves Exploration', 'Waterfall Adventure']
        }
        
        dest_themes = themes.get(destination, ['Exploration Day'])
        theme_index = min(day_number - 1, len(dest_themes) - 1)
        return dest_themes[theme_index]
    
    def _get_transportation_info(self, route: List[str], current_index: int) -> Dict:
        """Get transportation information between destinations"""
        if current_index == 0:
            return None
        
        from_dest = route[current_index - 1]
        to_dest = route[current_index]
        
        if self.route_graph.has_edge(from_dest, to_dest):
            edge_data = self.route_graph[from_dest][to_dest]
            return {
                'from': from_dest,
                'to': to_dest,
                'distance': round(edge_data['distance'], 1),
                'duration': f"{edge_data['travel_time']:.1f} hours",
                'mode': 'Car/Taxi',
                'cost': round(edge_data['cost'], 2),
                'tips': ['Depart early morning to avoid traffic', 'Scenic route with photo opportunities']
            }
        
        return {
            'from': from_dest,
            'to': to_dest,
            'distance': 100,
            'duration': '3 hours',
            'mode': 'Car/Taxi',
            'cost': 50,
            'tips': ['Book transportation in advance']
        }
    
    def _generate_local_tips(self, destination: str, preferences: UserPreferences) -> List[str]:
        """Generate personalized local tips using AI"""
        tips_database = {
            'Munnar': [
                'Best visited October-March for pleasant weather',
                'Carry warm clothes for cool evenings',
                'Book tea factory tours in advance'
            ],
            'Alleppey': [
                'Houseboat rates vary by season - book early',
                'Try traditional Kerala meals on banana leaves',
                'Respect local fishing communities'
            ],
            'Kochi': [
                'Fort Kochi is perfect for walking exploration',
                'Evening light ideal for Chinese fishing nets photography',
                'Try fresh seafood at local markets'
            ]
        }
        
        return tips_database.get(destination, ['Explore at your own pace'])
    
    def _get_weather_guidance(self, destination: str, date: datetime.datetime) -> str:
        """Provide weather-based guidance"""
        month = date.month
        if month in [12, 1, 2]:
            return "Cool and pleasant weather, perfect for sightseeing"
        elif month in [3, 4, 5]:
            return "Warm weather, carry light cotton clothes and sunscreen"
        elif month in [6, 7, 8, 9]:
            return "Monsoon season, carry rain gear and waterproof clothing"
        else:
            return "Post-monsoon, fresh and green landscapes"
    
    def _generate_ai_insights(self, destination: str, preferences: UserPreferences) -> List[str]:
        """Generate AI-powered local insights"""
        insights = [
            f"Based on your {preferences.travel_style.value} preference, {destination} offers excellent value",
            f"Your interest in {', '.join(preferences.interests[:2])} aligns perfectly with {destination}'s offerings",
            f"Optimal visit duration for {destination} is 2-3 days based on available activities"
        ]
        return insights
    
    def _generate_comprehensive_insights(self, preferences: UserPreferences, route: List[str], analysis: Dict) -> Dict:
        """Generate comprehensive AI insights for the entire trip"""
        return {
            'route_reasoning': f"Route optimized for {preferences.travel_style.value} style prioritizing {', '.join(preferences.interests[:3])}",
            'best_time_to_visit': 'October to March for optimal weather conditions',
            'cultural_highlights': 'Experience authentic Kerala culture through classical dance, spice markets, and traditional houseboats',
            'sustainability_focus': 'Support local communities by choosing local guides and eco-friendly accommodations',
            'personalization_notes': f"Itinerary customized based on your preference score of {analysis['matched_activities']['preference_score'].mean():.2f}/1.0"
        }
    
    def _generate_sustainability_tips(self) -> List[str]:
        """Generate sustainability and responsible travel tips"""
        return [
            'Choose local guides and tour operators to support the community',
            'Use refillable water bottles to reduce plastic waste',
            'Respect wildlife and maintain safe distances during safaris',
            'Support local artisans by purchasing authentic handicrafts',
            'Follow Leave No Trace principles in natural areas'
        ]
    
    def _generate_culture_guide(self, destinations: List[str]) -> Dict:
        """Generate cultural guidance for destinations"""
        return {
            'language_tips': 'Malayalam is local language, English widely understood',
            'cultural_etiquette': 'Remove shoes before entering homes and temples',
            'local_customs': 'Kerala is known for its hospitality and traditional Ayurvedic practices',
            'dress_code': 'Dress modestly, especially when visiting religious sites',
            'tipping_guide': 'Tipping is appreciated but not mandatory, 10% in restaurants'
        }
    
    def _generate_emergency_info(self) -> Dict:
        """Generate emergency information and contacts"""
        return {
            'emergency_numbers': {
                'police': '100',
                'medical': '108',
                'tourist_helpline': '1363'
            },
            'important_tips': [
                'Keep copies of important documents',
                'Share itinerary with family/friends',
                'Keep emergency contacts handy',
                'Know location of nearest hospital'
            ]
        }

# Initialize the AI service
ai_itinerary_service = IntelligentItineraryAI()