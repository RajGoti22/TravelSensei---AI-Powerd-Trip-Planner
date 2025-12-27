"""
TravelSensei Flask Backend Configuration
"""
import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'travelsensei-secret-key-change-in-production'
    
    
    # Firebase Configuration
    FIREBASE_SERVICE_ACCOUNT_KEY = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
    FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID') or 'travelsensei-6ef12'
    
    # External API Keys
    RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')
    
    # CORS Configuration
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5000'
    ]
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = 'memory://'
    RATELIMIT_DEFAULT = "100 per hour"
    
    # File Upload
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
    UPLOAD_FOLDER = 'uploads'
    
    # Mock Data (when APIs not available)
    USE_MOCK_HOTELS = os.environ.get('USE_MOCK_HOTELS', 'false').lower() == 'true'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}