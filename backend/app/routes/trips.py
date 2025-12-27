from flask import Blueprint, jsonify, request
from ..firebase import get_db
from ..security.firebase_auth import require_firebase_auth
from typing import Any, Dict

trips_bp = Blueprint("trips", __name__)


def _trip_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
	allowed = {"title", "destination", "startDate", "endDate", "itinerary", "notes"}
	return {k: payload[k] for k in allowed if k in payload}


@trips_bp.get("/trips")
@require_firebase_auth
def list_trips(user_claims):
	db = get_db()
	uid = user_claims.get("uid") or user_claims.get("sub")
	docs = db.collection("trips").where("ownerId", "==", uid).order_by("startDate").stream()
	items = [{"id": d.id, **d.to_dict()} for d in docs]
	return jsonify({"trips": items}), 200


@trips_bp.post("/trips")
@require_firebase_auth
def create_trip(user_claims):
	db = get_db()
	uid = user_claims.get("uid") or user_claims.get("sub")
	payload = request.get_json(force=True, silent=True) or {}
	data = _trip_payload(payload)
	if "destination" not in data:
		return jsonify({"error": "destination is required"}), 400
	data["ownerId"] = uid
	ref = db.collection("trips").document()
	ref.set(data)
	doc = ref.get()
	return jsonify({"trip": {"id": doc.id, **doc.to_dict()}}), 201


@trips_bp.get("/trips/<trip_id>")
@require_firebase_auth
def get_trip(user_claims, trip_id: str):
	db = get_db()
	uid = user_claims.get("uid") or user_claims.get("sub")
	doc = db.collection("trips").document(trip_id).get()
	if not doc.exists:
		return jsonify({"error": "Not found"}), 404
	data = doc.to_dict()
	if data.get("ownerId") != uid:
		return jsonify({"error": "Forbidden"}), 403
	return jsonify({"trip": {"id": doc.id, **data}}), 200


@trips_bp.put("/trips/<trip_id>")
@require_firebase_auth
def update_trip(user_claims, trip_id: str):
	db = get_db()
	uid = user_claims.get("uid") or user_claims.get("sub")
	doc_ref = db.collection("trips").document(trip_id)
	doc = doc_ref.get()
	if not doc.exists:
		return jsonify({"error": "Not found"}), 404
	if doc.to_dict().get("ownerId") != uid:
		return jsonify({"error": "Forbidden"}), 403
	payload = request.get_json(force=True, silent=True) or {}
	data = _trip_payload(payload)
	if not data:
		return jsonify({"error": "No valid fields to update"}), 400
	doc_ref.set(data, merge=True)
	return jsonify({"trip": {"id": trip_id, **doc_ref.get().to_dict()}}), 200


@trips_bp.delete("/trips/<trip_id>")
@require_firebase_auth
def delete_trip(user_claims, trip_id: str):
	db = get_db()
	uid = user_claims.get("uid") or user_claims.get("sub")
	doc_ref = db.collection("trips").document(trip_id)
	doc = doc_ref.get()
	if not doc.exists:
		return jsonify({"error": "Not found"}), 404
	if doc.to_dict().get("ownerId") != uid:
		return jsonify({"error": "Forbidden"}), 403
	doc_ref.delete()
	return jsonify({"ok": True}), 200


