"""
Firebase Configuration and Initialization
"""
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from functools import wraps
from flask import request, jsonify

# Initialize Firebase Admin
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            # Get project ID from environment or use default
            project_id = os.environ.get('FIREBASE_PROJECT_ID', 'travelsensei-6ef12')
            
            # Use service account key file if available
            cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
            
            # Try to find service account key in common locations
            if not cred_path:
                # Check if serviceAccountKey.json exists in backend directory
                backend_dir = os.path.dirname(os.path.abspath(__file__))
                default_key_path = os.path.join(backend_dir, 'serviceAccountKey.json')
                if os.path.exists(default_key_path):
                    cred_path = default_key_path
            
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"projectId": project_id})
                print(f"✅ Firebase initialized with service account: {cred_path}")
            else:
                # Use default credentials (for development)
                firebase_admin.initialize_app(options={"projectId": project_id})
                print(f"⚠️ Firebase initialized with default credentials (service account key not found)")
                print(f"   Looking for: {cred_path or 'serviceAccountKey.json'}")
            
        return True
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        return False

# Get Firestore client
def get_firestore_client():
    """Get Firestore database client"""
    try:
        if not firebase_admin._apps:
            initialize_firebase()
        return firestore.client()
    except Exception as e:
        print(f"Error getting Firestore client: {e}")
        return None

# Firebase Auth decorator
def firebase_auth_required(f):
    """Decorator to verify Firebase ID token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
        token = auth_header.split(' ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function

# Helper functions for Firestore operations
class FirestoreHelper:
    """Helper class for common Firestore operations"""
    
    def __init__(self):
        self.db = get_firestore_client()
    
    def create_document(self, collection, doc_id, data):
        """Create a document in Firestore"""
        try:
            doc_ref = self.db.collection(collection).document(doc_id)
            doc_ref.set(data)
            return True, doc_id
        except Exception as e:
            return False, str(e)
    
    def get_document(self, collection, doc_id):
        """Get a document from Firestore"""
        try:
            doc_ref = self.db.collection(collection).document(doc_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting document: {e}")
            return None
    
    def update_document(self, collection, doc_id, data):
        """Update a document in Firestore"""
        try:
            doc_ref = self.db.collection(collection).document(doc_id)
            doc_ref.update(data)
            return True
        except Exception as e:
            print(f"Error updating document: {e}")
            return False
    
    def delete_document(self, collection, doc_id):
        """Delete a document from Firestore"""
        try:
            self.db.collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False
    
    def query_collection(self, collection, filters=None, order_by=None, limit=None):
        """Query a collection with filters"""
        try:
            query = self.db.collection(collection)
            
            # Apply filters
            if filters:
                for field, operator, value in filters:
                    query = query.where(field, operator, value)
            
            # Apply ordering
            if order_by:
                query = query.order_by(order_by)
            
            # Apply limit
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            return [{'id': doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error querying collection: {e}")
            return []
    
    def get_all_documents(self, collection):
        """Get all documents from a collection"""
        try:
            docs = self.db.collection(collection).stream()
            return [{'id': doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting all documents: {e}")
            return []
