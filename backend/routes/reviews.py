"""
Reviews Routes - maintains Node.js API compatibility
"""
from flask import Blueprint, request, jsonify
from mongodb_config import firebase_auth_required, MongoDBHelper
from datetime import datetime
import uuid

def format_review_for_frontend(review, user_doc=None):
    """Format review data for frontend display"""
    print(f"[DEBUG] Formatting review: {review.get('id')} - has comment: {'comment' in review}, has content: {'content' in review}")
    
    # Map 'comment' to 'content' for frontend
    if 'comment' in review and 'content' not in review:
        review['content'] = review['comment']
        print(f"[DEBUG] Mapped comment to content: {review['content'][:50] if review['content'] else 'empty'}")
    
    # Add user information with proper fallbacks
    user_name = ''
    
    # Try to get name from user_doc first
    if user_doc:
        user_name = user_doc.get('name', '').strip()
        review['userAvatar'] = user_doc.get('avatar', '')
    
    # If no name found, use email username as fallback
    if not user_name:
        # Check review's user_email field (this is where the email is stored)
        email = review.get('user_email', '')
        if not email and user_doc:
            # Fallback to user_doc email if it exists
            email = user_doc.get('email', '')
        
        if email:
            user_name = email.split('@')[0]
        else:
            user_name = 'Anonymous'
    
    review['userName'] = user_name
    if 'userAvatar' not in review:
        review['userAvatar'] = ''
    
    print(f"[DEBUG] Set userName to: {user_name}")
    
    # Format created_at to ISO string if it's a datetime object
    if 'created_at' in review and hasattr(review['created_at'], 'isoformat'):
        review['created_at'] = review['created_at'].isoformat()
    
    # Set date field for display (ISO format that JavaScript can parse)
    review['date'] = review.get('created_at', '')
    
    # Add default values for frontend fields if missing
    if not review.get('location'):
        review['location'] = 'Not specified'
    if not review.get('visitDate'):
        review['visitDate'] = 'N/A'
    if 'userLiked' not in review:
        review['userLiked'] = False
    if 'likes' not in review:
        review['likes'] = 0
    if 'helpful' not in review:
        review['helpful'] = 0
    if not review.get('title'):
        review['title'] = ''
    if not review.get('tags'):
        review['tags'] = []
    if not review.get('type'):
        review['type'] = 'hotel'
    
    print(f"[DEBUG] Final review content: {review.get('content', 'MISSING')[:50] if review.get('content') else 'EMPTY'}")
    return review

reviews_bp = Blueprint('reviews', __name__)

# MongoDB helper
mongo_helper = MongoDBHelper()

@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    """Get all reviews or filter by hotel/service"""
    try:
        hotel_id = request.args.get('hotel_id')
        service_type = request.args.get('service_type')
        
        # Build query
        query = {}
        if hotel_id:
            query['hotel_id'] = hotel_id
        if service_type:
            query['service_type'] = service_type
        
        reviews_list = mongo_helper.find_documents('reviews', query, sort=[('created_at', -1)])
        
        # Get current user ID for like state (from auth if available)
        current_uid = getattr(request, 'user_id', None)
        
        # Enrich reviews with user information and per-user like state
        for review in reviews_list:
            # Get user info
            user_doc = mongo_helper.find_one_document('users', {'uid': review.get('user_id')})
            format_review_for_frontend(review, user_doc)
            # Derive isLiked from liked_by list
            liked_by = review.get('liked_by', []) or []
            review['isLiked'] = current_uid in liked_by if current_uid else False
        
        return jsonify({
            'success': True,
            'reviews': reviews_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/', methods=['POST'])
@firebase_auth_required
def create_review():
    """Create new review"""
    try:
        print("[DEBUG] Entered create_review endpoint")
        user_id = request.user_id
        user_email = request.user_email
        data = request.get_json()
        print(f"[DEBUG] user_id: {user_id}, user_email: {user_email}")
        print(f"[DEBUG] Incoming data: {data}")
        
        # Validation
        required_fields = ['rating', 'comment']
        for field in required_fields:
            if not data.get(field):
                print(f"[ERROR] Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 400
        
        rating = data.get('rating')
        if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            print(f"[ERROR] Invalid rating: {rating}")
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        review = {
            'user_id': user_id,
            'user_email': user_email,
            'hotel_id': data.get('hotel_id'),
            'rating': rating,
            'comment': data.get('comment'),
            'title': data.get('title', ''),
            'location': data.get('location', ''),
            'visitDate': data.get('visitDate', ''),
            'tags': data.get('tags', []),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        print(f"[DEBUG] Review to insert: {review}")
        # Ensure user document exists
        user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
        if not user_doc:
            user_doc = {
                'uid': user_id,
                'created_at': datetime.utcnow()
            }
            mongo_helper.create_document('users', user_doc)
            user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
        print(f"[DEBUG] User doc for review: {user_doc}")
        success, review_id = mongo_helper.create_document('reviews', review)
        print(f"[DEBUG] Review insert success: {success}, review_id: {review_id}")
        if success:
            # Fetch the created review to get properly serialized data
            created_review = mongo_helper.get_document('reviews', review_id)
            if created_review:
                # Format for frontend
                format_review_for_frontend(created_review, user_doc)
            
            # Update user's review count
            if user_doc:
                reviews_written = user_doc.get('reviewsWritten', 0) + 1
                mongo_helper.update_document('users', user_doc['id'], {'reviewsWritten': reviews_written})
            print("[DEBUG] Review created and user updated.")
            return jsonify({
                'success': True,
                'message': 'Review created successfully',
                'review': created_review

            }), 201
        else:
            print(f"[ERROR] Failed to create review: {review_id}")
            return jsonify({'error': 'Failed to create review'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<review_id>', methods=['GET'])
def get_review(review_id):
    """Get review by ID"""
    try:
        review = mongo_helper.get_document('reviews', review_id)
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        # Enrich with user information
        user_doc = mongo_helper.find_one_document('users', {'uid': review.get('user_id')})
        format_review_for_frontend(review, user_doc)
        
        return jsonify({
            'success': True,
            'review': review
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<review_id>', methods=['PUT'])
@firebase_auth_required
def update_review(review_id):
    """Update review"""
    try:
        user_id = request.user_id
        data = request.get_json()
        
        review = mongo_helper.get_document('reviews', review_id)
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        # Check if user owns this review
        if review.get('user_id') != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Validate rating if provided
        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Update fields
        update_data = {}
        for key in ['rating', 'comment', 'title']:
            if key in data:
                update_data[key] = data[key]
        
        if update_data:
            mongo_helper.update_document('reviews', review_id, update_data)
            review.update(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Review updated successfully',
            'review': review
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<review_id>', methods=['DELETE'])
@firebase_auth_required
def delete_review(review_id):
    """Delete review"""
    try:
        user_id = request.user_id
        
        review = mongo_helper.get_document('reviews', review_id)
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        # Check if user owns this review
        if review.get('user_id') != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        mongo_helper.delete_document('reviews', review_id)
        
        # Update user's review count
        user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
        if user_doc:
            reviews_written = max(0, user_doc.get('reviewsWritten', 0) - 1)
            mongo_helper.update_document('users', user_doc['id'], {'reviewsWritten': reviews_written})
        
        return jsonify({
            'success': True,
            'message': 'Review deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/stats', methods=['GET'])
def get_review_stats():
    """Get review statistics - demonstrates data analysis with pandas"""
    try:
        import pandas as pd
        
        reviews_list = mongo_helper.find_documents('reviews', {})
        
        if not reviews_list:
            return jsonify({
                'success': True,
                'stats': {
                    'total_reviews': 0,
                    'average_rating': 0,
                    'rating_distribution': {}
                }
            }), 200
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(reviews_list)
        
        stats = {
            'total_reviews': len(df),
            'average_rating': float(df['rating'].mean()) if len(df) > 0 else 0,
            'rating_distribution': df['rating'].value_counts().to_dict(),
            'reviews_by_service': df['service_type'].value_counts().to_dict() if 'service_type' in df.columns else {},
        }
        
        # Handle date grouping
        if 'created_at' in df.columns and len(df) > 0:
            df['created_at'] = pd.to_datetime(df['created_at'])
            df['date'] = df['created_at'].dt.date.astype(str)
            stats['reviews_over_time'] = df.groupby('date').size().to_dict()
        else:
            stats['reviews_over_time'] = {}
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<review_id>/like', methods=['POST'])
@firebase_auth_required
def like_review(review_id):
    """Like or unlike a review"""
    user_id = request.user_id
    data = request.get_json()
    liked = data.get('liked', True)
    
    print(f"[LIKE] Review ID: {review_id}, Liked: {liked}, User: {user_id}")
    
    try:
        from bson import ObjectId
        # Convert review_id to ObjectId if valid
        if ObjectId.is_valid(review_id):
            review_id_obj = ObjectId(review_id)
        else:
            review_id_obj = review_id
        
        review = mongo_helper.db['reviews'].find_one({'_id': review_id_obj})
        if not review:
            print(f"[LIKE] Review not found with _id: {review_id_obj}")
            return jsonify({'success': False, 'error': 'Review not found'}), 404
        
        print(f"[LIKE] Found review, current likes: {review.get('likes')}")
        liked_by = review.get('liked_by', []) or []
        
        # Update likes count with per-user tracking
        if liked:
            if user_id not in liked_by:
                mongo_helper.db['reviews'].update_one(
                    {'_id': review_id_obj},
                    {
                        '$inc': {'likes': 1},
                        '$addToSet': {'liked_by': user_id},
                        '$set': {'updated_at': datetime.utcnow()}
                    }
                )
                print(f"[LIKE] Incremented likes and added user to liked_by")
            else:
                print(f"[LIKE] User already liked; no change")
        else:
            if user_id in liked_by:
                mongo_helper.db['reviews'].update_one(
                    {'_id': review_id_obj},
                    {
                        '$inc': {'likes': -1},
                        '$pull': {'liked_by': user_id},
                        '$set': {'updated_at': datetime.utcnow()}
                    }
                )
                print(f"[LIKE] Decremented likes and removed user from liked_by")
            else:
                print(f"[LIKE] User had not liked; no change")
        
        # Fetch updated review
        updated_review = mongo_helper.get_document('reviews', str(review_id_obj))
        if updated_review:
            print(f"[LIKE] New like count: {updated_review.get('likes')}")
            return jsonify({'success': True, 'data': updated_review}), 200
        else:
            return jsonify({'success': False, 'error': 'Failed to update review'}), 500
    except Exception as e:
        print(f"[LIKE] Error liking review: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
