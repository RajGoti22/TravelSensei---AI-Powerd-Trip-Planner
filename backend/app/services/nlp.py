import os
from typing import List, Dict, Any
from transformers import pipeline

_generator = None


def _get_generator():
	global _generator
	if _generator is None:
		model_id = os.getenv("HUGGINGFACE_MODEL", "sshleifer/tiny-distilroberta-base")
		# Use text-generation or fill-mask where available; for tiny model, simulate
		try:
			_generator = pipeline("text-generation", model="distilgpt2")
		except Exception:
			_generator = None
	return _generator


def generate_itinerary(destination: str, days: int, preferences: List[str]) -> List[Dict[str, Any]]:
	gen = _get_generator()
	base = f"Itinerary for {destination} for {days} days focusing on {', '.join(preferences) or 'highlights'}."
	if gen:
		try:
			_ = gen(base, max_length=50, num_return_sequences=1)
		except Exception:
			pass
	# Simple deterministic stub to avoid heavyweight downloads
	return [
		{"day": i + 1, "plan": f"{destination} - Explore {preferences[i % max(1, len(preferences))] if preferences else 'local highlights'}"}
		for i in range(days)
	]


