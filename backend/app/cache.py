"""
Cache module with Redis primary and in-memory fallback
Thread-safe for production concurrent users
"""
import redis
from datetime import datetime, timedelta
from threading import Lock
from typing import Any, Optional
import json

_redis_client = None
_memory_cache = {}
_cache_lock = Lock()


class InMemoryCache:
    """Thread-safe in-memory cache fallback when Redis unavailable"""
    
    @staticmethod
    def get(key: str) -> Optional[str]:
        with _cache_lock:
            if key not in _memory_cache:
                return None
            entry = _memory_cache[key]
            if datetime.now() > entry['expires_at']:
                del _memory_cache[key]
                return None
            return entry['value']
    
    @staticmethod
    def set(key: str, value: str, ttl: int = 3600):
        with _cache_lock:
            _memory_cache[key] = {
                'value': value,
                'expires_at': datetime.now() + timedelta(seconds=ttl)
            }
    
    @staticmethod
    def delete(key: str):
        with _cache_lock:
            if key in _memory_cache:
                del _memory_cache[key]


def init_redis(redis_url: str):
	global _redis_client
	try:
		_redis_client = redis.from_url(redis_url, decode_responses=True)
		_redis_client.ping()  # Test connection
		print("✅ Redis cache connected")
	except Exception as e:
		print(f"⚠️ Redis unavailable, using in-memory cache: {e}")
		_redis_client = None


def get_redis():
	"""Get Redis client or None if unavailable"""
	return _redis_client


def cache_get(key: str) -> Optional[str]:
	"""Get from cache (Redis or in-memory fallback)"""
	try:
		if _redis_client:
			return _redis_client.get(key)
	except:
		pass
	return InMemoryCache.get(key)


def cache_set(key: str, value: str, ttl: int = 3600):
	"""Set in cache (Redis or in-memory fallback)"""
	try:
		if _redis_client:
			_redis_client.setex(key, ttl, value)
		else:
			InMemoryCache.set(key, value, ttl)
	except:
		InMemoryCache.set(key, value, ttl)


def cache_delete(key: str):
	"""Delete from cache"""
	try:
		if _redis_client:
			_redis_client.delete(key)
	except:
		pass
	InMemoryCache.delete(key)


