"""
Unique ID Service
Service for generating and managing 16-digit unique user IDs

This service provides:
- Generation of cryptographically secure 16-digit unique IDs
- Validation of unique ID uniqueness across all users
- ID collision detection and retry logic
"""

import secrets
import asyncio
from typing import Optional, Set
from google.cloud import firestore

from app.services.firebase_service import FirebaseService


class UniqueIDService:
    """Service for managing unique user IDs."""

    def __init__(self):
        self.firebase_service = FirebaseService()
        self.db = self.firebase_service.db
        # Cache for recently generated IDs to avoid immediate collisions
        self._recent_ids: Set[str] = set()

    def generate_unique_id(self) -> str:
        """
        Generate a cryptographically secure 16-digit unique ID.
        
        Returns:
            str: A 16-digit numeric string
        """
        # Generate a random 16-digit number using secrets for cryptographic security
        # Range: 1000000000000000 to 9999999999999999 (16 digits)
        min_val = 10**15  # 1000000000000000
        max_val = 10**16 - 1  # 9999999999999999
        
        unique_id = str(secrets.randbelow(max_val - min_val + 1) + min_val)
        return unique_id

    async def generate_unique_user_id(self, max_retries: int = 10) -> str:
        """
        Generate a unique ID that doesn't exist in the database.
        
        Args:
            max_retries: Maximum number of retry attempts if collision occurs
            
        Returns:
            str: A unique 16-digit ID
            
        Raises:
            RuntimeError: If unable to generate unique ID after max_retries
        """
        for attempt in range(max_retries):
            unique_id = self.generate_unique_id()
            
            # Check if ID is in recent cache
            if unique_id in self._recent_ids:
                continue
                
            # Check if ID exists in database
            if not await self.is_unique_id_taken(unique_id):
                # Add to recent cache to avoid immediate reuse
                self._recent_ids.add(unique_id)
                
                # Keep cache size reasonable (last 1000 IDs)
                if len(self._recent_ids) > 1000:
                    # Remove oldest entries (approximate)
                    self._recent_ids = set(list(self._recent_ids)[-500:])
                
                return unique_id
            
            # Small delay to avoid rapid-fire database queries
            if attempt < max_retries - 1:
                await asyncio.sleep(0.01)
        
        raise RuntimeError(f"Unable to generate unique ID after {max_retries} attempts")

    async def is_unique_id_taken(self, unique_id: str) -> bool:
        """
        Check if a unique ID is already taken by another user.
        
        Args:
            unique_id: The ID to check
            
        Returns:
            bool: True if ID is taken, False if available
        """
        try:
            users_ref = self.db.collection('users')
            query = users_ref.where('unique_id', '==', unique_id).limit(1)
            results = query.get()
            
            return len(results) > 0
        except Exception as e:
            print(f"Error checking unique ID: {e}")
            # On error, assume ID is taken to be safe
            return True

    async def validate_unique_id_format(self, unique_id: str) -> bool:
        """
        Validate that a unique ID has the correct format.
        
        Args:
            unique_id: The ID to validate
            
        Returns:
            bool: True if format is valid, False otherwise
        """
        if not unique_id:
            return False
        
        # Must be exactly 16 characters
        if len(unique_id) != 16:
            return False
        
        # Must contain only digits
        if not unique_id.isdigit():
            return False
        
        # Must not start with 0 (to ensure it's a valid 16-digit number)
        if unique_id.startswith('0'):
            return False
        
        return True

    async def find_user_by_unique_id(self, unique_id: str) -> Optional[dict]:
        """
        Find a user by their unique ID.
        
        Args:
            unique_id: The unique ID to search for
            
        Returns:
            dict or None: User document data if found, None otherwise
        """
        try:
            if not await self.validate_unique_id_format(unique_id):
                return None
            
            users_ref = self.db.collection('users')
            query = users_ref.where('unique_id', '==', unique_id).limit(1)
            results = query.get()
            
            if results:
                user_doc = results[0]
                user_data = user_doc.to_dict()
                user_data['uid'] = user_doc.id
                return user_data
            
            return None
        except Exception as e:
            print(f"Error finding user by unique ID: {e}")
            return None

    async def assign_unique_id_to_user(self, user_uid: str) -> str:
        """
        Generate and assign a unique ID to a user.
        
        Args:
            user_uid: Firebase UID of the user
            
        Returns:
            str: The generated unique ID
            
        Raises:
            RuntimeError: If unable to generate or assign unique ID
        """
        try:
            # Generate unique ID
            unique_id = await self.generate_unique_user_id()
            
            # Update user document with unique ID
            user_ref = self.db.collection('users').document(user_uid)
            user_ref.update({
                'unique_id': unique_id,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            return unique_id
        except Exception as e:
            raise RuntimeError(f"Failed to assign unique ID to user {user_uid}: {e}")

    async def regenerate_user_unique_id(self, user_uid: str) -> str:
        """
        Regenerate a new unique ID for a user (in case of conflicts or user request).
        
        Args:
            user_uid: Firebase UID of the user
            
        Returns:
            str: The new generated unique ID
            
        Raises:
            RuntimeError: If unable to regenerate unique ID
        """
        # Remove old ID from cache if it exists
        try:
            user_ref = self.db.collection('users').document(user_uid)
            user_doc = user_ref.get()
            if user_doc.exists:
                old_unique_id = user_doc.to_dict().get('unique_id')
                if old_unique_id and old_unique_id in self._recent_ids:
                    self._recent_ids.discard(old_unique_id)
        except Exception:
            pass  # Ignore errors when cleaning up cache
        
        # Generate and assign new unique ID
        return await self.assign_unique_id_to_user(user_uid)
