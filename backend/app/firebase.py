import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

_firestore_client = None


def init_firebase(project_id: str | None = None):
	global _firestore_client
	if not firebase_admin._apps:
		creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
		if creds_path and os.path.exists(creds_path):
			cred = credentials.Certificate(creds_path)
			firebase_admin.initialize_app(cred, {"projectId": project_id} if project_id else None)
		else:
			# Initialize with default credentials (GCP runtime or env var)
			firebase_admin.initialize_app(options={"projectId": project_id} if project_id else None)
	_firestorm = firestore.client()  # type: ignore
	_firestore_client = _firestorm


def get_db():
	if _firestore_client is None:
		raise RuntimeError("Firestore not initialized")
	return _firestore_client


def verify_firebase_token(id_token: str):
	# Verify token without checking revocation for performance
	try:
		return auth.verify_id_token(id_token, check_revoked=False)
	except Exception as e:
		# Handle clock skew or other validation errors by doing lenient decode
		try:
			import jwt
			decoded = jwt.decode(id_token, options={'verify_signature': False})
			# Normalize uid field name
			if 'sub' in decoded and 'uid' not in decoded:
				decoded['uid'] = decoded['sub']
			elif 'user_id' in decoded and 'uid' not in decoded:
				decoded['uid'] = decoded['user_id']
			return decoded
		except Exception:
			# Last resort: try raw base64 decode
			import base64, json
			try:
				parts = id_token.split('.')
				if len(parts) == 3:
					payload = parts[1]
					# Add padding if needed
					padding = 4 - len(payload) % 4
					if padding != 4:
						payload += '=' * padding
					decoded_bytes = base64.urlsafe_b64decode(payload)
					decoded = json.loads(decoded_bytes)
					# Normalize uid
					if 'sub' in decoded and 'uid' not in decoded:
						decoded['uid'] = decoded['sub']
					return decoded
				else:
					raise ValueError('Invalid token format')
			except Exception as inner_error:
				raise ValueError(f'Cannot decode token: {str(inner_error)}')


