"""
AI Routes - Hugging Face transformers and OpenAI integration
Demonstrates ML/AI capabilities with Python Flask backend
"""
from flask import Blueprint, request, jsonify, current_app
from openai import OpenAI
from datetime import datetime
# Import transformers when available
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

ai_bp = Blueprint('ai', __name__)

# Initialize sentiment analysis pipeline (if transformers available)
sentiment_analyzer = None
if TRANSFORMERS_AVAILABLE:
    try:
        sentiment_analyzer = pipeline("sentiment-analysis")
    except Exception as e:
        print(f"Could not load sentiment analysis model: {e}")

@ai_bp.route('/chat', methods=['POST'])
def ai_chat():
    """AI chat endpoint using OpenAI"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Use OpenAI if API key available
        if current_app.config.get('OPENAI_API_KEY'):
            try:
                client = OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are a helpful travel assistant for TravelSensei. Help users plan their trips, find hotels, and provide travel recommendations."
                        },
                        {"role": "user", "content": message}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                
                ai_response = response.choices[0].message.content
                
                return jsonify({
                    'success': True,
                    'response': ai_response,
                    'model': 'gpt-3.5-turbo',
                    'timestamp': datetime.utcnow().isoformat()
                }), 200
                
            except Exception as e:
                print(f"OpenAI API error: {e}")
                # Fallback to rule-based response
                pass
        
        # Fallback rule-based responses
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['hotel', 'stay', 'accommodation']):
            response = "I can help you find great hotels! What destination are you interested in?"
        elif any(word in message_lower for word in ['flight', 'fly', 'airline']):
            response = "I can assist with flight bookings. Where would you like to travel to and from?"
        elif any(word in message_lower for word in ['activity', 'tour', 'things to do']):
            response = "There are many exciting activities to explore! What type of experiences interest you?"
        elif any(word in message_lower for word in ['price', 'cost', 'budget']):
            response = "I can help you find options within your budget. What's your preferred price range?"
        else:
            response = "I'm here to help with your travel planning! Ask me about hotels, flights, activities, or destinations."
        
        return jsonify({
            'success': True,
            'response': response,
            'model': 'rule-based',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment using Hugging Face transformers"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if not TRANSFORMERS_AVAILABLE or not sentiment_analyzer:
            return jsonify({
                'error': 'Sentiment analysis not available. Install transformers library.'
            }), 503
        
        # Analyze sentiment
        result = sentiment_analyzer(text)
        
        return jsonify({
            'success': True,
            'sentiment': result[0]['label'].lower(),
            'confidence': result[0]['score'],
            'text': text,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get travel recommendations using simple ML-like logic"""
    try:
        data = request.get_json()
        preferences = data.get('preferences', {})
        
        # Simple recommendation logic based on preferences
        budget = preferences.get('budget', 'medium')
        interests = preferences.get('interests', [])
        
        recommendations = []
        
        # Budget-based recommendations
        if budget == 'luxury':
            recommendations.extend([
                "The Taj Mahal Palace, Mumbai - Iconic luxury with sea views",
                "Rambagh Palace, Jaipur - Royal Maharaja experience",
                "The Oberoi Amarvilas, Agra - Taj Mahal views from every room"
            ])
        elif budget == 'budget':
            recommendations.extend([
                "Boutique hotels in Goa - Beach vibes at great prices",
                "Heritage guesthouses in Rajasthan - Authentic local experience",
                "Backpacker hostels in Himachal Pradesh - Mountain adventures"
            ])
        else:  # medium
            recommendations.extend([
                "The Leela Palace, New Delhi - Modern luxury",
                "Heritage hotels in Kerala - Backwater experiences",
                "Hill station resorts in Uttarakhand - Mountain retreats"
            ])
        
        # Interest-based recommendations
        if 'adventure' in interests:
            recommendations.append("Ladakh adventure tours - Trekking and high-altitude lakes")
        if 'culture' in interests:
            recommendations.append("Golden Triangle tour - Delhi, Agra, Jaipur cultural immersion")
        if 'beach' in interests:
            recommendations.append("Goa beach resorts - Sun, sand, and seafood")
        if 'nature' in interests:
            recommendations.append("Kerala backwaters - Houseboat experiences")
        
        return jsonify({
            'success': True,
            'recommendations': recommendations[:5],  # Limit to top 5
            'based_on': preferences,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/price-prediction', methods=['POST'])
def predict_price():
    """Predict hotel prices using simple algorithm (placeholder for ML model)"""
    try:
        data = request.get_json()
        
        # Extract features
        location = data.get('location', '')
        checkin = data.get('checkin')
        checkout = data.get('checkout')
        rating = data.get('rating', 4.0)
        amenities_count = len(data.get('amenities', []))
        
        # Simple price prediction algorithm
        base_price = 100  # Base price in USD
        
        # Location multiplier
        location_multipliers = {
            'mumbai': 2.5,
            'delhi': 2.2,
            'bangalore': 1.8,
            'goa': 1.5,
            'jaipur': 1.7,
            'agra': 1.6
        }
        
        location_multiplier = location_multipliers.get(location.lower(), 1.5)
        
        # Rating multiplier
        rating_multiplier = rating / 2.0
        
        # Amenities multiplier
        amenities_multiplier = 1 + (amenities_count * 0.1)
        
        # Calculate predicted price
        predicted_price = base_price * location_multiplier * rating_multiplier * amenities_multiplier
        
        # Add some randomness for realism
        import random
        predicted_price *= random.uniform(0.9, 1.1)
        
        return jsonify({
            'success': True,
            'predicted_price': round(predicted_price, 2),
            'currency': 'USD',
            'factors': {
                'base_price': base_price,
                'location_multiplier': location_multiplier,
                'rating_multiplier': rating_multiplier,
                'amenities_multiplier': amenities_multiplier
            },
            'confidence': random.uniform(0.75, 0.95),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500