"""
Users Routes - maintains Node.js API compatibility
"""
from flask import Blueprint, request, jsonify
from mongodb_config import firebase_auth_required, MongoDBHelper

users_bp = Blueprint('users', __name__)

# MongoDB helper
mongo_helper = MongoDBHelper()

@users_bp.route('/', methods=['GET'])
@firebase_auth_required
def get_users():
    """Get all users (admin only in production)"""
    try:
        # In production, add admin role check
        users_list = mongo_helper.find_documents('users', {}, sort=[('created_at', -1)])
        # Return only safe fields
        safe_users = [
            {
                'id': user.get('uid', user.get('id')),
                'name': user.get('name', ''),
                'email': user.get('email', ''),
                'created_at': user.get('created_at', '')
            }
            for user in users_list
        ]
        
        return jsonify({
            'success': True,
            'users': safe_users
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['GET'])
@firebase_auth_required
def get_user(user_id):
    """Get user by ID"""
    try:
        # Find user by uid or id
        user = mongo_helper.find_one_document('users', {'uid': user_id})
        if not user:
            user = mongo_helper.get_document('users', user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.get('uid', user.get('id')),
                'name': user.get('name', ''),
                'email': user.get('email', ''),
                'created_at': user.get('created_at', '')
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['PUT'])
@firebase_auth_required
def update_user(user_id):
    """Update user"""
    try:
        current_user_id = request.user_id
        data = request.get_json()
        
        # Find user by uid or id
        user = mongo_helper.find_one_document('users', {'uid': user_id})
        if not user:
            user = mongo_helper.get_document('users', user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if current user can update this user
        if user.get('uid') != current_user_id and user.get('id') != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update allowed fields
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'preferences' in data:
            update_data['preferences'] = data['preferences']
        
        if update_data:
            mongo_helper.update_document('users', user['id'], update_data)
            user.update(update_data)
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': {
                'id': user.get('uid', user.get('id')),
                'name': user.get('name', ''),
                'email': user.get('email', '')
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['DELETE'])
@firebase_auth_required
def delete_user(user_id):
    """Delete user"""
    try:
        current_user_id = request.user_id
        
        # Find user by uid or id
        user = mongo_helper.find_one_document('users', {'uid': user_id})
        if not user:
            user = mongo_helper.get_document('users', user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if current user can delete this user
        if user.get('uid') != current_user_id and user.get('id') != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete user
        mongo_helper.delete_document('users', user['id'])
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500