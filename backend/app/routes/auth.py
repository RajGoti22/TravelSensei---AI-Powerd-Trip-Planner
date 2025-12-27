from flask import Blueprint, jsonify
from ..security.firebase_auth import require_firebase_auth

auth_bp = Blueprint("auth", __name__)


@auth_bp.get("/auth/me")
@require_firebase_auth
def me(user_claims):
	from ..db import get_mongo_db
	
	uid = user_claims.get("uid") or user_claims.get("sub")
	email = user_claims.get("email")
	name = user_claims.get("name") or user_claims.get("display_name") or email.split('@')[0] if email else "User"
	
	# Try to get or create user in MongoDB
	try:
		db = get_mongo_db()
		users_collection = db['users']
		
		# Check if user exists
		user = users_collection.find_one({"firebase_uid": uid})
		
		if not user:
			# Create new user in database
			user_doc = {
				"firebase_uid": uid,
				"email": email,
				"name": name,
				"created_at": None,
				"preferences": {},
				"avatar": user_claims.get("picture", "")
			}
			users_collection.insert_one(user_doc)
			user = user_doc
		
		# Convert MongoDB _id to string if present
		if user and '_id' in user:
			user['id'] = str(user['_id'])
			del user['_id']
		
		return jsonify({"success": True, "user": user}), 200
	except Exception as e:
		print(f"Error in /auth/me: {str(e)}")
		# Fallback to basic user info
		return jsonify({"success": True, "user": {"id": uid, "email": email, "name": name}}), 200


