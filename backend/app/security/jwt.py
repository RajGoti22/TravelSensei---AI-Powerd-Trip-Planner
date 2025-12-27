import os
import datetime as dt
from functools import wraps
import jwt
from flask import request, jsonify


def _secret():
	return os.getenv("JWT_SECRET", "dev_jwt")


def create_jwt(claims: dict, expires_minutes: int = 60) -> str:
	payload = {
		**claims,
		"exp": dt.datetime.utcnow() + dt.timedelta(minutes=expires_minutes),
		"iat": dt.datetime.utcnow(),
	}
	return jwt.encode(payload, _secret(), algorithm="HS256")


def verify_jwt(token: str):
	return jwt.decode(token, _secret(), algorithms=["HS256"])


def require_auth(fn):
	@wraps(fn)
	def wrapper(*args, **kwargs):
		auth_header = request.headers.get("Authorization", "")
		if not auth_header.startswith("Bearer "):
			return jsonify({"error": "Unauthorized"}), 401
		token = auth_header.split(" ", 1)[1]
		try:
			claims = verify_jwt(token)
		except Exception:
			return jsonify({"error": "Invalid token"}), 401
		return fn(*args, user_claims=claims, **kwargs)

	return wrapper


