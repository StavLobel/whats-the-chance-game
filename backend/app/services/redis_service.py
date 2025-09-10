"""
Redis Service Module
Handles Redis connections, caching, and session management
"""

import logging
from typing import Any, Optional, Union
import asyncio
import json

import redis.asyncio as redis
from redis.exceptions import ConnectionError, RedisError

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class RedisService:
    """Redis service for caching and session management."""
    
    def __init__(self):
        self._redis: Optional[redis.Redis] = None
        self._connection_pool: Optional[redis.ConnectionPool] = None
        self._is_available = False
    
    async def initialize(self) -> None:
        """Initialize Redis connection with error handling."""
        try:
            # Create connection pool
            self._connection_pool = redis.ConnectionPool.from_url(
                settings.redis_url,
                db=settings.redis_db,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Create Redis client
            self._redis = redis.Redis(connection_pool=self._connection_pool)
            
            # Test connection
            await self._redis.ping()
            self._is_available = True
            logger.info("✅ Redis connection established successfully")
            
        except ConnectionError as e:
            logger.warning(f"❌ Redis connection failed: {e}")
            logger.info("🔄 Application will continue without Redis caching")
            self._is_available = False
        except Exception as e:
            logger.error(f"❌ Unexpected error initializing Redis: {e}")
            self._is_available = False
    
    async def close(self) -> None:
        """Close Redis connection."""
        if self._redis:
            await self._redis.aclose()
            self._redis = None
        if self._connection_pool:
            await self._connection_pool.aclose()
            self._connection_pool = None
        self._is_available = False
        logger.info("🔌 Redis connection closed")
    
    @property
    def is_available(self) -> bool:
        """Check if Redis is available."""
        return self._is_available
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis cache."""
        if not self._is_available or not self._redis:
            logger.debug(f"Redis not available, skipping GET for key: {key}")
            return None
        
        try:
            return await self._redis.get(key)
        except RedisError as e:
            logger.warning(f"Redis GET error for key {key}: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Union[str, dict, list], 
        expire: Optional[int] = None
    ) -> bool:
        """Set value in Redis cache."""
        if not self._is_available or not self._redis:
            logger.debug(f"Redis not available, skipping SET for key: {key}")
            return False
        
        try:
            # Convert dict/list to JSON string
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            result = await self._redis.set(key, value, ex=expire)
            return bool(result)
        except RedisError as e:
            logger.warning(f"Redis SET error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from Redis cache."""
        if not self._is_available or not self._redis:
            logger.debug(f"Redis not available, skipping DELETE for key: {key}")
            return False
        
        try:
            result = await self._redis.delete(key)
            return bool(result)
        except RedisError as e:
            logger.warning(f"Redis DELETE error for key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        if not self._is_available or not self._redis:
            return False
        
        try:
            result = await self._redis.exists(key)
            return bool(result)
        except RedisError as e:
            logger.warning(f"Redis EXISTS error for key {key}: {e}")
            return False
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for a key."""
        if not self._is_available or not self._redis:
            return False
        
        try:
            result = await self._redis.expire(key, seconds)
            return bool(result)
        except RedisError as e:
            logger.warning(f"Redis EXPIRE error for key {key}: {e}")
            return False
    
    async def get_json(self, key: str) -> Optional[Union[dict, list]]:
        """Get JSON value from Redis cache."""
        value = await self.get(key)
        if value is None:
            return None
        
        try:
            return json.loads(value)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON decode error for key {key}: {e}")
            return None
    
    async def set_json(
        self, 
        key: str, 
        value: Union[dict, list], 
        expire: Optional[int] = None
    ) -> bool:
        """Set JSON value in Redis cache."""
        try:
            json_value = json.dumps(value)
            return await self.set(key, json_value, expire)
        except (TypeError, ValueError) as e:
            logger.warning(f"JSON encode error for key {key}: {e}")
            return False
    
    async def health_check(self) -> dict:
        """Perform Redis health check."""
        if not self._is_available or not self._redis:
            return {
                "redis": {
                    "status": "unavailable",
                    "message": "Redis not initialized or connection failed"
                }
            }
        
        try:
            # Test basic operations
            test_key = "health_check_test"
            await self._redis.set(test_key, "test_value", ex=10)
            value = await self._redis.get(test_key)
            await self._redis.delete(test_key)
            
            if value == "test_value":
                return {
                    "redis": {
                        "status": "healthy",
                        "message": "Redis is operational"
                    }
                }
            else:
                return {
                    "redis": {
                        "status": "unhealthy",
                        "message": "Redis test operation failed"
                    }
                }
                
        except RedisError as e:
            return {
                "redis": {
                    "status": "unhealthy",
                    "message": f"Redis health check failed: {e}"
                }
            }


# Global Redis service instance
redis_service = RedisService()


async def get_redis_service() -> RedisService:
    """Get Redis service instance."""
    return redis_service


# Convenience functions for common operations
async def cache_get(key: str) -> Optional[str]:
    """Get value from cache."""
    return await redis_service.get(key)


async def cache_set(
    key: str, 
    value: Union[str, dict, list], 
    expire: Optional[int] = None
) -> bool:
    """Set value in cache."""
    return await redis_service.set(key, value, expire)


async def cache_delete(key: str) -> bool:
    """Delete key from cache."""
    return await redis_service.delete(key)


async def cache_get_json(key: str) -> Optional[Union[dict, list]]:
    """Get JSON value from cache."""
    return await redis_service.get_json(key)


async def cache_set_json(
    key: str, 
    value: Union[dict, list], 
    expire: Optional[int] = None
) -> bool:
    """Set JSON value in cache."""
    return await redis_service.set_json(key, value, expire)
