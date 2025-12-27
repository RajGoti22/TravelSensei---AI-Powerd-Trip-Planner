from functools import wraps
from flask import request, jsonify
from ..firebase import verify_firebase_token


def require_firebase_auth(fn):
	@wraps(fn)
	def wrapper(*args, **kwargs):
		auth_header = request.headers.get("Authorization", "")
		if not auth_header.startswith("Bearer "):
			return jsonify({"error": "Unauthorized"}), 401
		id_token = auth_header.split(" ", 1)[1]
		try:
			claims = verify_firebase_token(id_token)
		except Exception:
			return jsonify({"error": "Invalid token"}), 401
		return fn(*args, user_claims=claims, **kwargs)
	return wrapper


