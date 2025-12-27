"""
Enhanced ML-Powered Itinerary Routes
Integrates the new ML AI service with existing API endpoints
"""
from flask import Blueprint, request, jsonify
from firebase_config import firebase_auth_required
import traceback
from datetime import datetime

# Import both services
from services.itinerary_ai_service import itinerary_ai_service
from services.ml_itinerary_ai_service import ml_itinerary_ai
from services.hotel_integration_service import hotel_integration_service
from services.itinerary_storage_service import itinerary_storage_service

ml_itineraries_bp = Blueprint('ml_itineraries', __name__)

@ml_itineraries_bp.route('/generate-ml', methods=['POST'])
@firebase_auth_required
def generate_ml_itinerary():
    """
    Generate ML-powered itinerary using pandas, scikit-learn, and transformers
    
    Enhanced with:
    - Pandas for data analysis
    - Scikit-learn for clustering and recommendations  
    - Hugging Face Transformers for NLP preference analysis
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        print(f"🤖 ML Itinerary generation request from user {user_id}")
        print(f"📊 Request data: {data}")
        
        # Validate required fields
        required_fields = ['destination', 'duration_days']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        destination = data['destination'].lower()
        duration_days = int(data['duration_days'])
        
        print(f"🔍 Received duration_days: {duration_days} for destination: {destination}")
        
        # Validate supported destinations
        supported_destinations = ['kerala', 'rajasthan', 'goa']
        if destination not in supported_destinations:
            return jsonify({
                'success': False,
                'error': f'ML service currently supports: {", ".join(supported_destinations)}',
                'supported_destinations': supported_destinations
            }), 400
        
        # Enhanced user input for ML processing
        ml_user_input = {
            'destination': destination,
            'duration_days': duration_days,
            'start_date': data.get('start_date', datetime.now().strftime('%Y-%m-%d')),
            'interests': data.get('preferences', {}).get('interests', []),
            'theme': data.get('preferences', {}).get('theme', 'leisure'),
            'budget': data.get('budget', 25000),
            'trip_type': data.get('trip_type', 'leisure'),
            'user_id': user_id
        }
        
        print(f"🧠 Processing with ML AI service...")
        
        # Generate ML-powered itinerary
        ml_itinerary = ml_itinerary_ai.generate_ml_itinerary(
            destination=destination,
            duration_days=duration_days,
            user_input=ml_user_input
        )
        
        print(f"✅ ML itinerary generated successfully!")
        
        # Get hotel recommendations
        print("🏨 Getting hotel recommendations...")
        hotel_recommendations = hotel_integration_service.recommend_hotels_for_trip(
            destination=destination,
            duration_days=duration_days,
            budget_total=ml_user_input['budget'],
            trip_type=ml_user_input['trip_type']
        )
        
        # Enhanced response with ML insights
        response_data = {
            'success': True,
            'itinerary': ml_itinerary,
            'hotel_recommendations': hotel_recommendations,
            'ml_features': {
                'ml_powered': True,
                'libraries_used': [
                    'pandas: Data analysis and manipulation',
                    'scikit-learn: Clustering and similarity recommendations',
                    'huggingface_transformers: NLP preference analysis',
                    'numpy: Numerical computations'
                ],
                'ml_techniques': [
                    'K-means clustering for attraction grouping',
                    'Cosine similarity for recommendation scoring',
                    'TF-IDF vectorization for text analysis',
                    'Zero-shot classification for interest analysis',
                    'Sentiment analysis for preference understanding'
                ],
                'personalization_level': ml_itinerary.get('personalization_score', 0.9),
                'recommendation_confidence': ml_itinerary.get('recommendation_confidence', 0.85)
            },
            'generation_metadata': {
                'service': 'ML-Powered AI',
                'generated_at': datetime.now().isoformat(),
                'processing_method': 'Machine Learning + NLP',
                'model_versions': {
                    'clustering': 'K-means (scikit-learn)',
                    'nlp': 'Transformers (Hugging Face)',
                    'similarity': 'Cosine Similarity (scikit-learn)',
                    'data_processing': 'Pandas + NumPy'
                }
            }
        }
        
        # Ensure the itinerary has exactly the requested duration
        if 'itinerary' in response_data and 'day_plans' in response_data['itinerary']:
            day_plans = response_data['itinerary']['day_plans']
            if len(day_plans) != duration_days:
                print(f"⚠️ ML Route: Adjusting day_plans from {len(day_plans)} to {duration_days}")
                response_data['itinerary']['day_plans'] = day_plans[:duration_days]
            response_data['itinerary']['duration_days'] = duration_days
        
        print(f"🎉 ML-powered itinerary response ready!")
        return jsonify(response_data), 200
        
    except ValueError as e:
        print(f"❌ Validation error: {e}")
        return jsonify({
            'success': False,
            'error': f'Invalid data: {str(e)}'
        }), 400
        
    except Exception as e:
        print(f"❌ ML Itinerary generation error: {e}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate ML-powered itinerary',
            'details': str(e)
        }), 500

@ml_itineraries_bp.route('/ml-recommendations', methods=['POST'])
@firebase_auth_required
def get_ml_recommendations():
    """
    Get ML-powered attraction recommendations
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        destination = data.get('destination', '').lower()
        interests = data.get('interests', [])
        budget = data.get('budget', 25000)
        
        print(f"🎯 Getting ML recommendations for {destination}")
        
        # Analyze user preferences with NLP
        user_input = {
            'interests': interests,
            'budget': budget,
            'theme': data.get('theme', 'leisure')
        }
        
        user_prefs = ml_itinerary_ai.analyze_user_preferences(user_input)
        recommendations = ml_itinerary_ai.get_ml_recommendations(
            destination=destination,
            user_prefs=user_prefs,
            num_recommendations=8
        )
        
        # Format recommendations for frontend
        formatted_recommendations = []
        for rec in recommendations:
            formatted_recommendations.append({
                'name': rec.location.name,
                'description': rec.location.description,
                'rating': rec.location.rating,
                'category': rec.location.category,
                'duration_hours': rec.location.duration_hours,
                'best_time': rec.location.best_time,
                'confidence_score': rec.confidence_score,
                'similarity_score': rec.similarity_score,
                'cluster_id': rec.cluster_id,
                'reasons': rec.reasons,
                'coordinates': rec.location.coordinates
            })
        
        return jsonify({
            'success': True,
            'recommendations': formatted_recommendations,
            'user_preferences': {
                'enhanced_interests': user_prefs.interests,
                'travel_style': user_prefs.travel_style,
                'budget_level': user_prefs.budget_level
            },
            'ml_analysis': {
                'nlp_enhanced': True,
                'clustering_applied': True,
                'similarity_computed': True
            }
        }), 200
        
    except Exception as e:
        print(f"❌ ML recommendations error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get ML recommendations',
            'details': str(e)
        }), 500

@ml_itineraries_bp.route('/ml-insights', methods=['GET'])
@firebase_auth_required
def get_ml_insights():
    """
    Get insights about the ML capabilities
    """
    try:
        insights = {
            'ml_capabilities': {
                'data_analysis': 'Pandas for processing attraction and user data',
                'machine_learning': 'Scikit-learn for clustering and similarity analysis',
                'nlp_processing': 'Hugging Face Transformers for preference understanding',
                'numerical_computation': 'NumPy for vector operations and similarity calculations'
            },
            'algorithms_used': {
                'clustering': {
                    'algorithm': 'K-Means Clustering',
                    'purpose': 'Group similar attractions for better day planning',
                    'clusters': 8,
                    'features': ['rating', 'duration', 'popularity', 'category_scores']
                },
                'similarity': {
                    'algorithm': 'Cosine Similarity',
                    'purpose': 'Match user preferences with attractions',
                    'features': 'User preference vector vs attraction feature vector'
                },
                'nlp': {
                    'sentiment_analysis': 'Analyze user preference sentiment',
                    'zero_shot_classification': 'Classify interests into categories',
                    'text_embedding': 'Create semantic representations'
                }
            },
            'data_processing': {
                'attractions_analyzed': len(ml_itinerary_ai.attractions_df),
                'feature_dimensions': len(ml_itinerary_ai.attraction_features.columns),
                'clusters_created': len(set(ml_itinerary_ai.attraction_clusters)),
                'supported_destinations': ['kerala', 'rajasthan', 'goa']
            },
            'personalization_features': {
                'interest_enhancement': 'NLP-powered interest analysis',
                'preference_vectorization': 'Mathematical preference representation',
                'similarity_matching': 'ML-based attraction matching',
                'cluster_optimization': 'Smart grouping for day planning'
            }
        }
        
        return jsonify({
            'success': True,
            'ml_insights': insights,
            'service_status': 'ML AI Service Active'
        }), 200
        
    except Exception as e:
        print(f"❌ ML insights error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get ML insights'
        }), 500

@ml_itineraries_bp.route('/compare-services', methods=['POST'])
@firebase_auth_required
def compare_ai_services():
    """
    Compare rule-based AI vs ML-powered AI results
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        destination = data.get('destination', 'kerala').lower()
        duration_days = int(data.get('duration_days', 7))
        
        print(f"⚖️ Comparing AI services for {destination}")
        
        # Generate with both services
        print("🤖 Generating with ML AI...")
        ml_result = ml_itinerary_ai.generate_ml_itinerary(
            destination=destination,
            duration_days=duration_days,
            user_input=data
        )
        
        print("🏛️ Generating with Rule-based AI...")
        rule_based_result = itinerary_ai_service.generate_itinerary(
            destination=destination,
            duration_days=duration_days,
            start_date=data.get('start_date', '2024-12-15'),
            preferences=data.get('preferences', {}),
            budget=data.get('budget', 25000),
            trip_type=data.get('trip_type', 'leisure')
        )
        
        comparison = {
            'ml_powered': {
                'service': 'ML-Powered AI',
                'itinerary': ml_result,
                'features': [
                    'Pandas data analysis',
                    'Scikit-learn clustering',
                    'Hugging Face NLP',
                    'Cosine similarity matching',
                    'K-means attraction grouping'
                ],
                'personalization_score': ml_result.get('personalization_score', 0.9)
            },
            'rule_based': {
                'service': 'Rule-Based AI',
                'itinerary': rule_based_result,
                'features': [
                    'Pre-defined rules',
                    'Static destination data',
                    'Basic preference matching',
                    'Manual categorization'
                ],
                'personalization_score': 0.6
            },
            'comparison_summary': {
                'ml_advantages': [
                    'Dynamic clustering of attractions',
                    'NLP-enhanced preference analysis', 
                    'Mathematical similarity scoring',
                    'Data-driven recommendations'
                ],
                'rule_based_advantages': [
                    'Faster execution',
                    'Predictable results',
                    'Simpler implementation'
                ]
            }
        }
        
        return jsonify({
            'success': True,
            'comparison': comparison
        }), 200
        
    except Exception as e:
        print(f"❌ Comparison error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to compare services'
        }), 500