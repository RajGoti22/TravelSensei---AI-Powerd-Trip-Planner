"""
Authentication Routes - Firebase Authentication with MongoDB
Compatible with existing Node.js API endpoints
"""
from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import auth
from mongodb_config import get_mongo_db, firebase_auth_required, MongoDBHelper
from datetime import datetime
import re
from utils.validators import validate_password_strength

auth_bp = Blueprint('auth', __name__)

# Get MongoDB database
db = get_mongo_db()
mongo_helper = MongoDBHelper()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None



@auth_bp.route('/me', methods=['GET'])
@firebase_auth_required
def get_current_user():
    """Get current user information"""
    try:
        uid = request.user_id
        print(f"[DEBUG] Fetching profile for UID: {uid}")
        # Get user from Firebase Auth
        user = auth.get_user(uid)
        
        # Get additional data from MongoDB
        user_data = mongo_helper.find_one_document('users', {'uid': uid})
        
        # If user doesn't exist in MongoDB, create a basic record
        if not user_data:
            print(f"[DEBUG] User document not found in MongoDB, creating new document for UID: {uid}")
            user_data = {
                'uid': uid,
                'email': user.email,
                'name': user.display_name or '',
                'phone': '',
                'location': '',
                'bio': '',
                'preferences': {},
                'bookings': [],
                'tripsPlanned': 0,
                'placesVisited': 0,
                'reviewsWritten': 0,
                'savedDestinations': 0,
                'created_at': datetime.utcnow()
            }
            create_success, create_result = mongo_helper.create_document('users', user_data)
            if not create_success:
                print(f"[ERROR] Failed to create user document in /me: {create_result}")
                # Continue anyway, but log the error
            else:
                print(f"[DEBUG] User document created successfully in /me with ID: {create_result}")
                # Fetch the newly created document
                user_data = mongo_helper.find_one_document('users', {'uid': uid})
                if not user_data:
                    print(f"[WARNING] User document was created but could not be retrieved")
        
        print(f"[DEBUG] MongoDB user_data: {user_data}")
        # Name and email ALWAYS come from Firebase Auth (not MongoDB)
        # Other profile data comes from MongoDB
        return jsonify({
            'success': True,
            'user': {
                'id': user.uid,
                'name': user.display_name or '',  # Always from Firebase Auth
                'email': user.email,  # Always from Firebase Auth
                'phone': user_data.get('phone', '') if user_data else '',
                'location': user_data.get('location', '') if user_data else '',
                'bio': user_data.get('bio', '') if user_data else '',
                'avatar': user_data.get('avatar', '') if user_data else '',
                'preferences': user_data.get('preferences', {}) if user_data else {},
                'bookings': user_data.get('bookings', []) if user_data else [],
                'createdAt': user_data.get('created_at', '') if user_data else '',
                'tripsPlanned': user_data.get('tripsPlanned', 0) if user_data else 0,
                'placesVisited': user_data.get('placesVisited', 0) if user_data else 0,
                'reviewsWritten': user_data.get('reviewsWritten', 0) if user_data else 0,
                'savedDestinations': user_data.get('savedDestinations', 0) if user_data else 0,
            }
        }), 200
        
    except Exception as e:
        print(f"[ERROR] /me: {e}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/test-auth', methods=['GET'])
def test_auth():
    """Test endpoint to verify Firebase Admin SDK is working"""
    try:
        # Try to list users (this requires Admin SDK)
        from firebase_admin import auth
        print(f"[TEST] Firebase Admin SDK initialized: {firebase_admin._apps}")
        print(f"[TEST] Project ID: {auth._get_project_id() if hasattr(auth, '_get_project_id') else 'Unknown'}")
        return jsonify({
            'success': True,
            'message': 'Firebase Admin SDK is initialized',
            'apps': len(firebase_admin._apps) if firebase_admin._apps else 0
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Firebase Admin SDK initialization issue'
        }), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@firebase_auth_required
def update_profile():
    """Update user profile"""
    try:
        uid = request.user_id
        data = request.get_json()
        print(f"[DEBUG] Update profile for UID: {uid} with data: {data}")
        
        # Name and email are NOT updatable via this endpoint - they come from Firebase Auth
        # Only profile fields (phone, location, bio, preferences) can be updated
        
        # Update MongoDB data - only allow specific profile fields
        allowed_fields = ['phone', 'location', 'bio', 'preferences']
        mongo_data = {}
        for field in allowed_fields:
            if field in data:
                mongo_data[field] = data[field]
        
        print(f"[DEBUG] Allowed fields from request: {mongo_data}")
        
        # Ensure preferences is a dict if provided
        if 'preferences' in mongo_data and not isinstance(mongo_data['preferences'], dict):
            mongo_data['preferences'] = {}
        
        # Get Firebase user for reference
        user = auth.get_user(uid)
        
        # Find user by uid
        user_doc = mongo_helper.find_one_document('users', {'uid': uid})
        print(f"[DEBUG] User document found: {user_doc is not None}")
        
        if user_doc:
            # Update existing user
            if mongo_data:  # Only update if there's data to update
                print(f"[DEBUG] User document: {user_doc}")
                print(f"[DEBUG] MongoDB update data: {mongo_data}")
                
                # Get the document ID - find_one_document returns 'id' as string
                doc_id = user_doc.get('id')
                if not doc_id:
                    # Fallback: try to get _id if id doesn't exist
                    doc_id = str(user_doc.get('_id')) if user_doc.get('_id') else None
                
                if not doc_id:
                    raise Exception("Cannot find document ID for update")
                
                print(f"[DEBUG] Updating document with ID: {doc_id} (type: {type(doc_id).__name__})")
                update_success = mongo_helper.update_document('users', doc_id, mongo_data)
                
                if not update_success:
                    print(f"[ERROR] Update operation returned False")
                    raise Exception("Failed to update user document in MongoDB")
                else:
                    print(f"[DEBUG] User document updated successfully")
            else:
                print(f"[WARNING] No fields to update in MongoDB - mongo_data is empty")
        else:
            # Create new user record if doesn't exist
            print(f"[DEBUG] User document not found, creating new document for UID: {uid}")
            # Ensure all required fields are present
            mongo_data['uid'] = uid
            mongo_data['email'] = user.email
            mongo_data['name'] = user.display_name or data.get('name', '')
            if 'phone' not in mongo_data:
                mongo_data['phone'] = ''
            if 'location' not in mongo_data:
                mongo_data['location'] = ''
            if 'bio' not in mongo_data:
                mongo_data['bio'] = ''
            if 'preferences' not in mongo_data:
                mongo_data['preferences'] = {}
            if 'bookings' not in mongo_data:
                mongo_data['bookings'] = []
            if 'tripsPlanned' not in mongo_data:
                mongo_data['tripsPlanned'] = 0
            if 'placesVisited' not in mongo_data:
                mongo_data['placesVisited'] = 0
            if 'reviewsWritten' not in mongo_data:
                mongo_data['reviewsWritten'] = 0
            if 'savedDestinations' not in mongo_data:
                mongo_data['savedDestinations'] = 0
            
            print(f"[DEBUG] Creating new user document with data: {mongo_data}")
            create_success, create_result = mongo_helper.create_document('users', mongo_data)
            if not create_success:
                print(f"[ERROR] Failed to create user document: {create_result}")
                raise Exception(f"Failed to create user document in MongoDB: {create_result}")
            print(f"[DEBUG] User document created successfully with ID: {create_result}")
        
        # Fetch updated user data from MongoDB to return to frontend
        updated_user_doc = mongo_helper.find_one_document('users', {'uid': uid})
        
        if not updated_user_doc:
            print(f"[ERROR] Could not retrieve updated user document from MongoDB")
            raise Exception("Failed to retrieve updated user data from MongoDB")
        
        # Build response with updated user data
        # Name and email ALWAYS come from Firebase Auth
        user_response = {
            'id': user.uid,
            'name': user.display_name or '',  # Always from Firebase Auth
            'email': user.email,  # Always from Firebase Auth
            'phone': updated_user_doc.get('phone', '') if updated_user_doc else '',
            'location': updated_user_doc.get('location', '') if updated_user_doc else '',
            'bio': updated_user_doc.get('bio', '') if updated_user_doc else '',
            'preferences': updated_user_doc.get('preferences', {}) if updated_user_doc else {},
            'bookings': updated_user_doc.get('bookings', []) if updated_user_doc else [],
            'createdAt': updated_user_doc.get('created_at', '') if updated_user_doc else '',
            'tripsPlanned': updated_user_doc.get('tripsPlanned', 0) if updated_user_doc else 0,
            'placesVisited': updated_user_doc.get('placesVisited', 0) if updated_user_doc else 0,
            'reviewsWritten': updated_user_doc.get('reviewsWritten', 0) if updated_user_doc else 0,
            'savedDestinations': updated_user_doc.get('savedDestinations', 0) if updated_user_doc else 0,
        }
        
        print(f"[DEBUG] Profile update complete for UID: {uid}")
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user_response
        }), 200
        
    except Exception as e:
        print(f"[ERROR] /update-profile: {e}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/avatar', methods=['POST'])
@firebase_auth_required
def upload_avatar():
    """Upload user avatar"""
    try:
        uid = request.user_id
        
        # Check if file is in request
        if 'avatar' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
        
        # Convert image to base64 for storage
        import base64
        image_data = file.read()
        if len(image_data) > 5 * 1024 * 1024:  # 5MB limit
            return jsonify({'error': 'File size exceeds 5MB limit'}), 400
        
        base64_image = base64.b64encode(image_data).decode('utf-8')
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        avatar_data_uri = f"data:image/{file_ext};base64,{base64_image}"
        
        # Update user document with avatar
        user_doc = mongo_helper.find_one_document('users', {'uid': uid})
        if user_doc:
            mongo_helper.update_document('users', user_doc['id'], {'avatar': avatar_data_uri})
            print(f"[DEBUG] Avatar updated for user: {uid}")
        
        # Get updated user data
        user = auth.get_user(uid)
        user_data = mongo_helper.find_one_document('users', {'uid': uid})
        
        user_response = {
            'id': user.uid,
            'name': user.display_name or '',
            'email': user.email,
            'phone': user_data.get('phone', '') if user_data else '',
            'location': user_data.get('location', '') if user_data else '',
            'bio': user_data.get('bio', '') if user_data else '',
            'avatar': user_data.get('avatar', '') if user_data else '',
            'preferences': user_data.get('preferences', {}) if user_data else {},
            'bookings': user_data.get('bookings', []) if user_data else [],
            'createdAt': user_data.get('created_at', '') if user_data else '',
            'tripsPlanned': user_data.get('tripsPlanned', 0) if user_data else 0,
            'placesVisited': user_data.get('placesVisited', 0) if user_data else 0,
            'reviewsWritten': user_data.get('reviewsWritten', 0) if user_data else 0,
            'savedDestinations': user_data.get('savedDestinations', 0) if user_data else 0,
        }
        
        return jsonify({
            'success': True,
            'message': 'Avatar uploaded successfully',
            'user': user_response
        }), 200
        
    except Exception as e:
        print(f"[ERROR] /profile/avatar: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/delete-account', methods=['DELETE'])
@firebase_auth_required
def delete_account():
    """Delete user account"""
    try:
        uid = request.user_id
        
        # Delete from MongoDB
        user_doc = mongo_helper.find_one_document('users', {'uid': uid})
        if user_doc:
            mongo_helper.delete_document('users', user_doc['id'])
            # Also delete user's itineraries, reviews, and posts
            mongo_helper.find_documents('itineraries', {'user_id': uid})
            for itinerary in mongo_helper.find_documents('itineraries', {'user_id': uid}):
                mongo_helper.delete_document('itineraries', itinerary['id'])
            for review in mongo_helper.find_documents('reviews', {'user_id': uid}):
                mongo_helper.delete_document('reviews', review['id'])
            for post in mongo_helper.find_documents('posts', {'user_id': uid}):
                mongo_helper.delete_document('posts', post['id'])
        
        # Delete from Firebase Auth
        auth.delete_user(uid)
        
        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """Register new user via backend (bypasses client-side restrictions)"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type, Authorization")
        response.headers.add('Access-Control-Allow-Methods', "POST, OPTIONS")
        return response
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        try:
            validate_password_strength(password)
        except Exception as e:
            return jsonify({'error': str(e)}), 400
        
        # Create user in Firebase Auth using Admin SDK
        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=name,
                email_verified=False
            )
            
            # Create user document in MongoDB
            user_data = {
                'uid': user_record.uid,
                'email': user_record.email,
                'name': name or user_record.display_name or '',
                'phone': '',
                'location': '',
                'bio': '',
                'preferences': {},
                'bookings': [],
                'tripsPlanned': 0,
                'placesVisited': 0,
                'reviewsWritten': 0,
                'savedDestinations': 0,
                'created_at': datetime.utcnow()
            }
            mongo_helper.create_document('users', user_data)
            
            # Generate custom token for client-side authentication
            custom_token = auth.create_custom_token(user_record.uid)
            
            response = jsonify({
                'success': True,
                'message': 'User registered successfully',
                'user': {
                    'id': user_record.uid,
                    'email': user_record.email,
                    'name': name or user_record.display_name or ''
                },
                'customToken': custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 201
            
        except Exception as e:
            error_msg = str(e)
            response = None
            status_code = 500
            if 'email-already-exists' in error_msg.lower():
                response = jsonify({'error': 'Email already registered'})
                status_code = 400
            elif 'invalid-email' in error_msg.lower():
                response = jsonify({'error': 'Invalid email address'})
                status_code = 400
            else:
                print(f"[ERROR] Registration error: {e}")
                response = jsonify({'error': f'Registration failed: {error_msg}'})
                status_code = 500
            
            if response:
                response.headers.add("Access-Control-Allow-Origin", "*")
                return response, status_code
            return jsonify({'error': 'Unknown error'}), 500
        
    except Exception as e:
        print(f"[ERROR] /register: {e}")
        response = jsonify({'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """Login user - Check if user exists and provide guidance"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type, Authorization")
        response.headers.add('Access-Control-Allow-Methods', "POST, OPTIONS")
        return response
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Note: Firebase Admin SDK cannot verify passwords directly
        # We can only check if user exists and provide a custom token
        # The actual password verification must happen client-side
        try:
            # Get user by email to check if they exist
            user_record = auth.get_user_by_email(email)
            
            # Generate custom token (user will still need to verify password client-side)
            # This is a workaround - we generate token but client must still authenticate
            custom_token = auth.create_custom_token(user_record.uid)
            
            # Get user data from MongoDB
            user_data = mongo_helper.find_one_document('users', {'uid': user_record.uid})
            
            response = jsonify({
                'success': True,
                'message': 'User found - please use client-side authentication',
                'user': {
                    'id': user_record.uid,
                    'email': user_record.email,
                    'name': user_record.display_name or (user_data.get('name') if user_data else '')
                },
                'customToken': custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token,
                'note': 'Password verification must be done client-side. Use custom token to sign in.'
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 200
            
        except Exception as e:
            error_msg = str(e)
            response = None
            status_code = 500
            if 'user-not-found' in error_msg.lower():
                response = jsonify({'error': 'Invalid email or password'})
                status_code = 401
            else:
                print(f"[ERROR] Login error: {e}")
                response = jsonify({'error': f'Login failed: {error_msg}'})
                status_code = 500
            
            if response:
                response.headers.add("Access-Control-Allow-Origin", "*")
                return response, status_code
            return jsonify({'error': 'Unknown error'}), 500
        
    except Exception as e:
        print(f"[ERROR] /login: {e}")
        response = jsonify({'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify Firebase ID token"""
    try:
        data = request.get_json()
        id_token = data.get('idToken')
        
        if not id_token:
            return jsonify({'error': 'Token is required'}), 400
        
        # Verify the token
        decoded_token = auth.verify_id_token(id_token)
        
        return jsonify({
            'success': True,
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email')
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Token verification failed: {str(e)}'}), 401

@auth_bp.route('/logout', methods=['POST'])
@firebase_auth_required
def logout():
    """Logout user"""
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@auth_bp.route('/change-password', methods=['POST', 'OPTIONS'])
@firebase_auth_required
def change_password():
    """Change user password"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        uid = request.user_id
        data = request.get_json()
        
        new_password = data.get('newPassword', '')
        
        if not new_password:
            return jsonify({'error': 'Missing new password'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Update password in Firebase Auth
        auth.update_user(uid, password=new_password)
        
        print(f"[DEBUG] Password changed for user: {uid}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        print(f"[ERROR] /change-password: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
