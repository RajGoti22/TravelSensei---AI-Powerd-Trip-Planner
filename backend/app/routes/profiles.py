from flask import Blueprint, jsonify, request
from ..security.firebase_auth import require_firebase_auth
from ...mongodb_config import MongoDBHelper


profiles_bp = Blueprint("profiles", __name__)
mongo_helper = MongoDBHelper()


@profiles_bp.get("/profile")
@require_firebase_auth
def get_profile(user_claims):
	uid = user_claims.get("uid") or user_claims.get("sub")
	user_doc = mongo_helper.find_one_document('users', {'uid': uid})
	if not user_doc:
		# Create a minimal default profile
		default_profile = {"uid": uid, "createdAt": None, "preferences": {}}
		mongo_helper.create_document('users', default_profile)
		return jsonify({"profile": default_profile}), 200
	return jsonify({"profile": user_doc}), 200


@profiles_bp.put("/profile")
@require_firebase_auth
def update_profile(user_claims):
	uid = user_claims.get("uid") or user_claims.get("sub")
	payload = request.get_json(force=True, silent=True) or {}
	allowed_fields = {"name", "preferences", "homeBase", "bio", "avatarUrl"}
	updates = {k: v for k, v in payload.items() if k in allowed_fields}
	if not updates:
		return jsonify({"error": "No valid fields to update"}), 400
	user_doc = mongo_helper.find_one_document('users', {'uid': uid})
	if user_doc:
		mongo_helper.update_document('users', user_doc['id'], updates)
	else:
		# Create new user doc if not exists
		new_doc = {"uid": uid, **updates}
		mongo_helper.create_document('users', new_doc)
	user_doc = mongo_helper.find_one_document('users', {'uid': uid})
	return jsonify({"profile": user_doc}), 200


