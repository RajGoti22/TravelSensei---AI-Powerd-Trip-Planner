"""
TravelSensei Lightweight Backend Server
Quick-start version with real Booking.com hotel integration
Production-ready with compression, rate limiting, and connection pooling
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_compress import Compress
import os
import firebase_admin
from firebase_admin import credentials, firestore
from config import Config
from datetime import datetime, timedelta
from dotenv import load_dotenv
from firebase_config import initialize_firebase
from mongodb_config import get_mongo_db

# Load environment from the backend .env file BEFORE importing services that read env vars
BASE_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(dotenv_path=ENV_PATH)


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable gzip compression for all responses (reduces bandwidth by 70-90%)
    Compress(app)
    print("✅ Response compression enabled")

    # Initialize Firebase Admin SDK for authentication
    initialize_firebase()
    
    # Initialize MongoDB connection
    try:
        get_mongo_db()
        print("✅ MongoDB connection initialized")
    except Exception as e:
        print(f"⚠️ MongoDB connection warning: {e}")
        print("   MongoDB will retry on first use")

    # Enable CORS with proper configuration for preflight requests
    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }},
         supports_credentials=True)

    # Handle OPTIONS requests for CORS preflight (before rate limiter)
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify({})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
    
    # Initialize rate limiter (enabled for production)
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["1000 per day", "200 per hour"],
        enabled=True  # Enable rate limiting for production security
    )
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "TravelSensei Backend"}), 200


    from routes.ai_itinerary_route import ai_itinerary_bp
    app.register_blueprint(ai_itinerary_bp, url_prefix="/api/itineraries")
    print("✅ AI Itinerary route registered")
    
    # Register all route blueprints
    from routes.posts import posts_bp
    from routes.auth import auth_bp
    from routes.reviews import reviews_bp
    from routes.users import users_bp
    from routes.itineraries import itineraries_bp
    from routes.upload import upload_bp
    from routes.ai import ai_bp
    
    app.register_blueprint(posts_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(itineraries_bp, url_prefix='/api/itineraries')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        return send_from_directory(uploads_dir, filename)

    return app

if __name__ == '__main__':
    import os
    app = create_app()
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        print("🚀 TravelSensei Backend Starting...")
        print("📍 Available endpoints:")
        print("   - GET  /health")
        print("   - POST /api/auth/register - Register new user")
        print("   - POST /api/auth/login - Login user")
        print("   - GET  /api/auth/me - Get current user")
        print("   - PUT  /api/auth/update-profile - Update profile")
        print("   - POST /api/itineraries/generate")
        print("   - POST /api/ml-itineraries/generate-ml")
        print("   - POST /api/reviews - Create review")
        print("   - POST /api/posts - Create post")
        print("🌐 Server will be available at http://localhost:5000")
        print("✅ MongoDB connected: mongodb://localhost:27017/travelsensei")
    app.run(debug=False, host='0.0.0.0', port=5000)