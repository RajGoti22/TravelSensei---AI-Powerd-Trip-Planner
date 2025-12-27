from flask import Blueprint, request, jsonify
from mongodb_config import firebase_auth_required, MongoDBHelper
from datetime import datetime

posts_bp = Blueprint('posts', __name__)

# MongoDB helper
mongo_helper = MongoDBHelper()

@posts_bp.route('/posts', methods=['GET'])
@firebase_auth_required
def get_posts():
    # Return ALL posts from ALL users (like reviews - everyone can see all posts)
    all_posts = mongo_helper.find_documents('posts', {}, sort=[('created_at', -1)])
    
    # Enrich posts with user information (avatar) and per-user like state
    current_uid = getattr(request, 'user_id', None)
    for post in all_posts:
        user_doc = mongo_helper.find_one_document('users', {'uid': post.get('user_id')})
        if user_doc:
            post['avatar'] = user_doc.get('avatar', '')
            if not post.get('author'):
                post['author'] = user_doc.get('name', 'Anonymous')
        liked_by = post.get('liked_by', []) or []
        post['isLiked'] = current_uid in liked_by if current_uid else False
    
    print(f"[POSTS] Fetching ALL posts from ALL users - Found {len(all_posts)} total posts")
    return jsonify({'success': True, 'data': all_posts}), 200

@posts_bp.route('/posts', methods=['POST'])
@firebase_auth_required
def create_post():
    user_id = request.user_id
    user_email = request.user_email
    data = request.get_json()
    
    # Ensure user document exists and get user info
    user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
    if not user_doc:
        user_doc = {
            'uid': user_id,
            'created_at': datetime.utcnow()
        }
        mongo_helper.create_document('users', user_doc)
        user_doc = mongo_helper.find_one_document('users', {'uid': user_id})
    
    post = {
        'user_id': user_id,
        'user_email': user_email,
        'author': user_doc.get('name', data.get('author', 'Anonymous')),
        'avatar': user_doc.get('avatar', data.get('avatar', '')),
        'content': data.get('content', ''),
        'location': data.get('location', ''),
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'photos': data.get('photos', []),
        'likes': 0,
        'comments': 0,
        'shares': 0,
        'isLiked': False,
        'liked_by': [],
        'tags': data.get('tags', []),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    success, post_id = mongo_helper.create_document('posts', post)
    if success:
        post['id'] = post_id
        post['_id'] = post_id
        # Convert datetime objects to ISO format strings for JSON serialization
        post['timestamp'] = post['timestamp']
        post['created_at'] = post['created_at'].isoformat() + 'Z'
        post['updated_at'] = post['updated_at'].isoformat() + 'Z'
        return jsonify({'success': True, 'data': post}), 201
    else:
        return jsonify({'success': False, 'error': 'Failed to create post'}), 500

@posts_bp.route('/posts/<post_id>/like', methods=['POST'])
@firebase_auth_required
def like_post(post_id):
    """Like or unlike a post"""
    user_id = request.user_id
    data = request.get_json()
    liked = data.get('liked', True)
    
    print(f"[LIKE] Post ID: {post_id}, Liked: {liked}, User: {user_id}")
    
    try:
        from bson import ObjectId
        # Convert post_id to ObjectId if valid
        if ObjectId.is_valid(post_id):
            post_id_obj = ObjectId(post_id)
        else:
            post_id_obj = post_id
        
        post = mongo_helper.db['posts'].find_one({'_id': post_id_obj})
        if not post:
            print(f"[LIKE] Post not found with _id: {post_id_obj}")
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        print(f"[LIKE] Found post, current likes: {post.get('likes')}")
        liked_by = post.get('liked_by', []) or []
        
        # Update likes count with per-user tracking
        if liked:
            if user_id not in liked_by:
                mongo_helper.db['posts'].update_one(
                    {'_id': post_id_obj},
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
                mongo_helper.db['posts'].update_one(
                    {'_id': post_id_obj},
                    {
                        '$inc': {'likes': -1},
                        '$pull': {'liked_by': user_id},
                        '$set': {'updated_at': datetime.utcnow()}
                    }
                )
                print(f"[LIKE] Decremented likes and removed user from liked_by")
            else:
                print(f"[LIKE] User had not liked; no change")
        
        # Fetch updated post using mongo_helper to properly serialize ObjectId
        updated_post = mongo_helper.get_document('posts', str(post_id_obj))
        if updated_post:
            print(f"[LIKE] New like count: {updated_post.get('likes')}")
            return jsonify({'success': True, 'data': updated_post}), 200
        else:
            return jsonify({'success': False, 'error': 'Failed to update post'}), 500
    except Exception as e:
        print(f"[LIKE] Error liking post: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

