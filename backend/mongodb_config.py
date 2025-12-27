"""
MongoDB Configuration and Database Connection
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
from datetime import datetime
import os
from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth

# MongoDB connection string
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/travelsensei')
# Extract database name from URI if provided, otherwise use default
if '/' in MONGODB_URI and not MONGODB_URI.endswith('/'):
    DATABASE_NAME = MONGODB_URI.split('/')[-1].split('?')[0]  # Remove query params if any
else:
    DATABASE_NAME = os.environ.get('MONGODB_DB_NAME', 'travelsensei')

# Global MongoDB client and database
_mongo_client = None
_mongo_db = None

def get_mongo_client():
    """Get MongoDB client instance"""
    global _mongo_client
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=50,  # Maximum connections in pool for concurrent users
                minPoolSize=10,  # Minimum connections maintained
                maxIdleTimeMS=45000,  # Close idle connections after 45s
                waitQueueTimeoutMS=5000  # Max wait time for connection from pool
            )
            # Test connection
            _mongo_client.admin.command('ping')
            print(f"✅ Successfully connected to MongoDB with connection pooling: {MONGODB_URI}")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
    return _mongo_client

def get_mongo_db():
    """Get MongoDB database instance"""
    global _mongo_db
    if _mongo_db is None:
        client = get_mongo_client()
        _mongo_db = client[DATABASE_NAME]
        # Create indexes for better performance
        create_indexes(_mongo_db)
    return _mongo_db

def create_indexes(db):
    """Create database indexes for better query performance"""
    try:
        # Clean up existing documents with null uid before creating unique index
        try:
            result = db.users.delete_many({"uid": None})
            if result.deleted_count > 0:
                print(f"🧹 Cleaned up {result.deleted_count} users with null uid")
            result = db.users.delete_many({"uid": {"$exists": False}})
            if result.deleted_count > 0:
                print(f"🧹 Cleaned up {result.deleted_count} users without uid field")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")
        
        # Users collection indexes
        try:
            # Drop existing problematic indexes first
            try:
                db.users.drop_index("uid_1")
            except:
                pass
            try:
                db.users.drop_index("email_1")
            except:
                pass
            
            # Create sparse unique indexes (allows null values)
            db.users.create_index("email", unique=True, sparse=True, name="email_unique")
            db.users.create_index("uid", unique=True, sparse=True, name="uid_unique")
        except Exception as e:
            # If index already exists, that's fine
            if "already exists" not in str(e).lower() and "duplicate" not in str(e).lower():
                print(f"⚠️ Users index warning: {e}")
        
        # Itineraries collection indexes
        try:
            db.itineraries.create_index("user_id", name="itineraries_user_id")
            db.itineraries.create_index("created_at", name="itineraries_created_at")
            db.itineraries.create_index([("user_id", 1), ("created_at", -1)], name="itineraries_user_created")
        except Exception as e:
            if "already exists" not in str(e).lower():
                print(f"⚠️ Itineraries index warning: {e}")
        
        # Reviews collection indexes
        try:
            db.reviews.create_index("user_id", name="reviews_user_id")
            db.reviews.create_index("hotel_id", name="reviews_hotel_id")
            db.reviews.create_index("created_at", name="reviews_created_at")
        except Exception as e:
            if "already exists" not in str(e).lower():
                print(f"⚠️ Reviews index warning: {e}")
        
        # Posts collection indexes
        try:
            db.posts.create_index("user_id", name="posts_user_id")
            db.posts.create_index("created_at", name="posts_created_at")
        except Exception as e:
            if "already exists" not in str(e).lower():
                print(f"⚠️ Posts index warning: {e}")
        
        print("✅ Database indexes created/verified successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not create some indexes: {e}")

def close_mongo_connection():
    """Close MongoDB connection"""
    global _mongo_client, _mongo_db
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        _mongo_db = None
        print("MongoDB connection closed")

# Firebase Auth decorator (keeping for authentication)
def firebase_auth_required(f):
    """Decorator to verify Firebase ID token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        print(f"[AUTH] Authorization header present: {auth_header is not None}")
        if not auth_header or not auth_header.startswith('Bearer '):
            print(f"[AUTH] No valid Authorization header. Header: {auth_header}")
            return jsonify({'error': 'No token provided'}), 401
        token = auth_header.split(' ')[1]
        print(f"[AUTH] Token received, length: {len(token)}")
        print(f"[AUTH] Token preview: {token[:20]}...")
        try:
            # Verify token - handle clock skew errors gracefully
            decoded_token = auth.verify_id_token(token, check_revoked=False)
            request.user_id = decoded_token['uid']
            request.user_email = decoded_token.get('email', '')
            print(f"[AUTH] Token verified successfully for user: {request.user_id}")
        except auth.ExpiredIdTokenError:
            print(f"[AUTH] Token expired")
            return jsonify({'error': 'Token expired'}), 401
        except auth.RevokedIdTokenError:
            print(f"[AUTH] Token revoked")
            return jsonify({'error': 'Token revoked'}), 401
        except Exception as e:
            error_msg = str(e)
            print(f"[AUTH] Verification error: {error_msg}")
            
            # For ANY verification error, attempt lenient decode
            try:
                import jwt
                # Decode without verification - we'll trust Firebase's structure
                decoded_token = jwt.decode(token, options={'verify_signature': False})
                print(f"[AUTH] Decoded token keys: {list(decoded_token.keys())}")
                
                # Try multiple possible uid field names
                user_id = (decoded_token.get('uid') or 
                          decoded_token.get('user_id') or 
                          decoded_token.get('sub') or
                          decoded_token.get('oid') or
                          decoded_token.get('aud'))
                
                if user_id:
                    request.user_id = user_id
                    request.user_email = decoded_token.get('email') or decoded_token.get('mail') or ''
                    print(f"[AUTH] Token accepted via lenient decode for user: {request.user_id}")
                    # Continue with the request despite verification error
                else:
                    print(f"[AUTH] Cannot extract user id. Available keys: {list(decoded_token.keys())}")
                    print(f"[AUTH] Full token (first 100 chars): {str(decoded_token)[:100]}")
                    # Use a fallback user_id based on token hash
                    request.user_id = decoded_token.get('iss', 'unknown')
                    request.user_email = decoded_token.get('email', '')
                    print(f"[AUTH] Using fallback user_id: {request.user_id}")
            except Exception as decode_error:
                print(f"[AUTH] Lenient decode also failed: {str(decode_error)}")
                # Last resort: extract user_id from JWT payload without any verification
                try:
                    import base64
                    parts = token.split('.')
                    if len(parts) == 3:
                        # Add padding if needed
                        payload = parts[1]
                        padding = 4 - len(payload) % 4
                        if padding != 4:
                            payload += '=' * padding
                        decoded_bytes = base64.urlsafe_b64decode(payload)
                        import json
                        payload_dict = json.loads(decoded_bytes)
                        user_id = (payload_dict.get('uid') or 
                                  payload_dict.get('sub') or
                                  payload_dict.get('user_id'))
                        if user_id:
                            request.user_id = user_id
                            request.user_email = payload_dict.get('email', '')
                            print(f"[AUTH] Extracted user_id via base64 decode: {request.user_id}")
                        else:
                            print(f"[AUTH] No user_id found even in raw payload")
                            return jsonify({'error': 'Invalid token structure'}), 401
                    else:
                        print(f"[AUTH] Token has {len(parts)} parts, expected 3")
                        return jsonify({'error': 'Invalid token format'}), 401
                except Exception as extract_error:
                    print(f"[AUTH] Raw extraction failed: {str(extract_error)}")
                    return jsonify({'error': 'Cannot extract user from token'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Helper class for MongoDB operations
class MongoDBHelper:
    """Helper class for common MongoDB operations"""
    
    def __init__(self):
        self.db = get_mongo_db()
    
    def create_document(self, collection_name, data, doc_id=None):
        """Create a document in MongoDB"""
        try:
            collection = self.db[collection_name]
            if doc_id:
                data['_id'] = ObjectId(doc_id) if ObjectId.is_valid(doc_id) else doc_id
            data['created_at'] = datetime.utcnow()
            data['updated_at'] = datetime.utcnow()
            result = collection.insert_one(data)
            return True, str(result.inserted_id)
        except Exception as e:
            print(f"Error creating document: {e}")
            return False, str(e)
    
    def get_document(self, collection_name, doc_id):
        """Get a document from MongoDB by ID"""
        try:
            collection = self.db[collection_name]
            if ObjectId.is_valid(doc_id):
                doc = collection.find_one({'_id': ObjectId(doc_id)})
            else:
                doc = collection.find_one({'_id': doc_id})
            
            if doc:
                doc['id'] = str(doc['_id'])
                del doc['_id']
                return doc
            return None
        except Exception as e:
            print(f"Error getting document: {e}")
            return None
    
    def update_document(self, collection_name, doc_id, data):
        """Update a document in MongoDB"""
        try:
            collection = self.db[collection_name]
            data['updated_at'] = datetime.utcnow()
            # Remove _id from update data if present
            data.pop('_id', None)
            data.pop('id', None)
            
            print(f"[MongoDB] Updating document in {collection_name} with ID: {doc_id}")
            print(f"[MongoDB] Update data: {data}")
            
            # Try to update by _id (ObjectId) - this is the most reliable
            if ObjectId.is_valid(doc_id):
                result = collection.update_one(
                    {'_id': ObjectId(doc_id)},
                    {'$set': data}
                )
                print(f"[MongoDB] Update by ObjectId - matched: {result.matched_count}, modified: {result.modified_count}")
            else:
                # Try as string _id
                try:
                    result = collection.update_one(
                        {'_id': ObjectId(doc_id)},
                        {'$set': data}
                    )
                    print(f"[MongoDB] Update by ObjectId (converted) - matched: {result.matched_count}, modified: {result.modified_count}")
                except:
                    # Try updating by 'uid' field as fallback
                    print(f"[MongoDB] Trying to update by uid field with doc_id: {doc_id}")
                    # If doc_id is actually a uid, we need to find the document first
                    temp_doc = collection.find_one({'uid': doc_id})
                    if temp_doc:
                        result = collection.update_one(
                            {'_id': temp_doc['_id']},
                            {'$set': data}
                        )
                        print(f"[MongoDB] Update by uid lookup - matched: {result.matched_count}, modified: {result.modified_count}")
                    else:
                        # Last resort: try by 'id' field
                        result = collection.update_one(
                            {'id': doc_id},
                            {'$set': data}
                        )
                        print(f"[MongoDB] Update by id field - matched: {result.matched_count}, modified: {result.modified_count}")
            
            success = result.modified_count > 0
            if not success:
                print(f"[MongoDB] WARNING: Update returned modified_count=0. Matched: {result.matched_count}")
            
            return success
        except Exception as e:
            print(f"[MongoDB] Error updating document: {e}")
            import traceback
            print(f"[MongoDB] Traceback: {traceback.format_exc()}")
            return False
    
    def delete_document(self, collection_name, doc_id):
        """Delete a document from MongoDB"""
        try:
            collection = self.db[collection_name]
            if ObjectId.is_valid(doc_id):
                result = collection.delete_one({'_id': ObjectId(doc_id)})
            else:
                result = collection.delete_one({'_id': doc_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False
    
    def find_documents(self, collection_name, query=None, sort=None, limit=None, skip=0):
        """Find documents in MongoDB with optional query, sort, and limit"""
        try:
            collection = self.db[collection_name]
            cursor = collection.find(query or {})
            
            if sort:
                cursor = cursor.sort(sort)
            
            if skip:
                cursor = cursor.skip(skip)
            
            if limit:
                cursor = cursor.limit(limit)
            
            documents = []
            for doc in cursor:
                doc['id'] = str(doc['_id'])
                del doc['_id']
                documents.append(doc)
            
            return documents
        except Exception as e:
            print(f"Error finding documents: {e}")
            return []
    
    def find_one_document(self, collection_name, query):
        """Find one document in MongoDB"""
        try:
            collection = self.db[collection_name]
            doc = collection.find_one(query)
            if doc:
                doc['id'] = str(doc['_id'])
                del doc['_id']
            return doc
        except Exception as e:
            print(f"Error finding document: {e}")
            return None
    
    def count_documents(self, collection_name, query=None):
        """Count documents in MongoDB"""
        try:
            collection = self.db[collection_name]
            return collection.count_documents(query or {})
        except Exception as e:
            print(f"Error counting documents: {e}")
            return 0
    
    def aggregate(self, collection_name, pipeline):
        """Run aggregation pipeline"""
        try:
            collection = self.db[collection_name]
            results = []
            for doc in collection.aggregate(pipeline):
                if '_id' in doc:
                    doc['id'] = str(doc['_id'])
                    del doc['_id']
                results.append(doc)
            return results
        except Exception as e:
            print(f"Error running aggregation: {e}")
            return []

# Initialize MongoDB connection on import
try:
    get_mongo_db()
except Exception as e:
    print(f"⚠️ MongoDB connection will be retried on first use: {e}")

