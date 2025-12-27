"""
Input validation schemas using Marshmallow
Prevents invalid data from entering the system
"""
from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime
import re


def validate_password_strength(password):
    """
    Validate password strength requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit (0-9)
    - At least one special character
    """
    if len(password) < 8:
        raise ValidationError('Password must be at least 8 characters long')
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter')
    
    if not re.search(r'[a-z]', password):
        raise ValidationError('Password must contain at least one lowercase letter')
    
    if not re.search(r'\d', password):
        raise ValidationError('Password must contain at least one digit (0-9)')
    
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
        raise ValidationError('Password must contain at least one special character (!@#$%^&*...)')


class ItineraryRequestSchema(Schema):
    """Validation schema for itinerary generation requests"""
    destination = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    duration_days = fields.Int(required=True, validate=validate.Range(min=1, max=30))
    start_date = fields.Date(required=False)
    budget = fields.Int(required=False, validate=validate.Range(min=100, max=10000000))
    preferences = fields.Dict(required=False)
    trip_type = fields.Str(required=False, validate=validate.OneOf([
        'leisure', 'adventure', 'business', 'family', 'romantic', 'solo'
    ]))
    
    @validates('start_date')
    def validate_start_date(self, value):
        if value and value < datetime.now().date():
            raise ValidationError('Start date cannot be in the past')


class UserProfileSchema(Schema):
    """Validation schema for user profile updates"""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    phone = fields.Str(validate=validate.Length(max=20))
    location = fields.Str(validate=validate.Length(max=200))
    bio = fields.Str(validate=validate.Length(max=500))
    preferences = fields.Dict()


class PostCreateSchema(Schema):
    """Validation schema for social post creation"""
    content = fields.Str(required=True, validate=validate.Length(min=1, max=2000))
    imageUrl = fields.Str(validate=validate.Length(max=500))
    location = fields.Str(validate=validate.Length(max=200))


class ReviewCreateSchema(Schema):
    """Validation schema for review creation"""
    hotel_id = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    hotel_name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(required=True, validate=validate.Length(min=10, max=1000))
    photos = fields.List(fields.Str())


class PasswordChangeSchema(Schema):
    """Validation schema for password changes"""
    currentPassword = fields.Str(required=True, validate=validate.Length(min=6))
    newPassword = fields.Str(required=True, validate=validate.Length(min=6, max=100))
    
    @validates('newPassword')
    def validate_new_password(self, value):
        if not any(char.isdigit() for char in value):
            raise ValidationError('Password must contain at least one number')
        if not any(char.isalpha() for char in value):
            raise ValidationError('Password must contain at least one letter')


def validate_request(schema_class):
    """
    Decorator to validate request data using Marshmallow schema
    Usage:
        @validate_request(ItineraryRequestSchema)
        def create_itinerary():
            data = request.validated_data
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            from flask import request, jsonify
            
            schema = schema_class()
            try:
                # Validate request JSON
                validated_data = schema.load(request.get_json() or {})
                # Attach validated data to request for use in route
                request.validated_data = validated_data
                return func(*args, **kwargs)
            except ValidationError as err:
                return jsonify({
                    'success': False,
                    'error': 'Validation failed',
                    'details': err.messages
                }), 400
        
        wrapper.__name__ = func.__name__
        return wrapper
    return decorator
