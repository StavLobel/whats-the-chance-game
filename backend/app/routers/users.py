"""
User management routes for user lookup and profile information.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.services.firebase_service import firebase_service

router = APIRouter(prefix="/api/users", tags=["users"])


class UserLookupRequest(BaseModel):
    """Request model for looking up multiple users."""
    user_ids: List[str]


class UserDisplayInfo(BaseModel):
    """User display information for UI components."""
    uid: str
    displayName: str
    username: Optional[str] = None
    email: Optional[str] = None
    photoURL: Optional[str] = None


class UserLookupResponse(BaseModel):
    """Response model for user lookup requests."""
    users: List[UserDisplayInfo]
    errors: List[str] = []


@router.post("/lookup", response_model=UserLookupResponse)
async def lookup_users(
    request: UserLookupRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Lookup multiple users by their IDs for display purposes.
    
    This endpoint is optimized for UI components that need to display
    user information (like usernames) for multiple users at once.
    """
    users = []
    errors = []
    
    for uid in request.user_ids:
        try:
            user_data = await firebase_service.get_user_by_uid(uid)
            if user_data:
        # Determine the best display name using priority order
        # Check multiple field variations for maximum compatibility
        display_name = (
            user_data.get("username") or
            user_data.get("displayName") or
            user_data.get("display_name") or
            user_data.get("first_name") or
            user_data.get("firstName") or
            (user_data.get("email", "").split("@")[0] if user_data.get("email") else None) or
            f"User {uid[:8]}..."
        )
                
                users.append(UserDisplayInfo(
                    uid=uid,
                    displayName=display_name,
                    username=user_data.get("username"),
                    email=user_data.get("email"),
                    photoURL=user_data.get("photoURL")
                ))
            else:
                errors.append(f"User {uid} not found")
                # Still provide a fallback entry
                users.append(UserDisplayInfo(
                    uid=uid,
                    displayName=f"User {uid[:8]}..."
                ))
        except Exception as e:
            errors.append(f"Failed to lookup user {uid}: {str(e)}")
            # Provide fallback entry
            users.append(UserDisplayInfo(
                uid=uid,
                displayName=f"User {uid[:8]}..."
            ))
    
    return UserLookupResponse(users=users, errors=errors)


@router.get("/{user_id}", response_model=UserDisplayInfo)
async def get_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get a single user's display information.
    
    This endpoint returns user information suitable for display in UI components.
    """
    try:
        user_data = await firebase_service.get_user_by_uid(user_id)
        if not user_data:
            # Instead of 404, return a fallback user for better UX
            return UserDisplayInfo(
                uid=user_id,
                displayName=f"User {user_id[:8]}..."
            )
        
        # Determine the best display name using priority order
        # Check multiple field variations for maximum compatibility
        display_name = (
            user_data.get("username") or
            user_data.get("displayName") or
            user_data.get("display_name") or
            user_data.get("first_name") or
            user_data.get("firstName") or
            (user_data.get("email", "").split("@")[0] if user_data.get("email") else None) or
            f"User {user_id[:8]}..."
        )
        
        return UserDisplayInfo(
            uid=user_id,
            displayName=display_name,
            username=user_data.get("username"),
            email=user_data.get("email"),
            photoURL=user_data.get("photoURL")
        )
    except Exception as e:
        # Return fallback instead of error for better UX
        return UserDisplayInfo(
            uid=user_id,
            displayName=f"User {user_id[:8]}..."
        )
