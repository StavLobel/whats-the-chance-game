"""
Friends Router
API endpoints for friend-related operations including search,
friend requests, and friend list management.

This module provides endpoints for:
- User search functionality
- Friend request management (send, accept, reject)
- Friend list operations
- Friend suggestions
- Privacy and blocking features
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.auth import get_current_user
from app.services.friends_service import FriendService
from app.services.unique_id_service import UniqueIDService
from app.schemas.friends import (
    FriendRequest,
    FriendRequestCreate,
    FriendRequestUpdate,
    FriendRequestList,
    FriendshipWithUser,
    FriendList,
    FriendSearch,
    FriendSuggestion,
    FriendSuggestionList,
    FriendActivity,
    FriendActivityList,
    BlockedUser,
    BlockUserRequest,
    FriendPrivacySettings,
)
from app.schemas.user import UserSearchResult, User

router = APIRouter(
    prefix="/api/friends",
    tags=["friends"],
    responses={404: {"description": "Not found"}},
)

friends_service = FriendService()
unique_id_service = UniqueIDService()


@router.post("/search", response_model=UserSearchResult)
async def search_users(
    search_params: FriendSearch,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Search for users by username, display name, or email.
    
    - **query**: Search query string
    - **online_only**: Filter to show only online users
    - **mutual_friends_only**: Filter to show only users with mutual friends
    - **limit**: Maximum number of results to return
    - **offset**: Number of results to skip for pagination
    """
    try:
        results = await friends_service.search_users(
            current_user["uid"], 
            search_params
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/request", response_model=FriendRequest)
async def send_friend_request(
    request: FriendRequestCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Send a friend request to another user.
    
    - **to_user_id**: ID of the user to send request to
    - **message**: Optional message to include with the request
    """
    try:
        return await friends_service.send_friend_request(
            current_user["uid"], 
            request
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/requests/received", response_model=FriendRequestList)
async def get_received_friend_requests(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get received friend requests for the current user."""
    try:
        result = await friends_service.get_friend_requests(
            current_user["uid"],
            request_type="received",
            page=page,
            per_page=per_page
        )
        return FriendRequestList(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/requests/sent", response_model=FriendRequestList)
async def get_sent_friend_requests(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get sent friend requests by the current user."""
    try:
        result = await friends_service.get_friend_requests(
            current_user["uid"],
            request_type="sent",
            page=page,
            per_page=per_page
        )
        return FriendRequestList(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/request/{request_id}", response_model=FriendRequest)
async def update_friend_request(
    request_id: str,
    update: FriendRequestUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Accept or reject a friend request.
    
    - **request_id**: ID of the friend request
    - **status**: New status ('accepted' or 'rejected')
    """
    try:
        return await friends_service.update_friend_request(
            request_id,
            current_user["uid"],
            update
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=FriendList)
async def get_friends_list(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    online_only: bool = Query(False),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get the current user's friends list.
    
    - **page**: Page number for pagination
    - **per_page**: Number of results per page
    - **online_only**: Filter to show only online friends
    """
    try:
        friends = await friends_service.get_friends(
            current_user["uid"],
            page=page,
            per_page=per_page,
            online_only=online_only
        )
        
        # Count online friends
        all_friends = await friends_service.get_friends(
            current_user["uid"],
            page=1,
            per_page=1000,
            online_only=False
        )
        online_count = sum(1 for f in all_friends if f.online_status)
        
        return FriendList(
            friends=friends,
            total=len(all_friends),
            page=page,
            per_page=per_page,
            online_count=online_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{friend_id}")
async def remove_friend(
    friend_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Remove a friend from the user's friend list."""
    try:
        await friends_service.remove_friend(current_user["uid"], friend_id)
        return {"message": "Friend removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions", response_model=FriendSuggestionList)
async def get_friend_suggestions(
    limit: int = Query(10, ge=1, le=50),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get friend suggestions based on mutual friends.
    
    - **limit**: Maximum number of suggestions to return
    """
    try:
        suggestions = await friends_service.get_friend_suggestions(
            current_user["uid"],
            limit=limit
        )
        return FriendSuggestionList(
            suggestions=suggestions,
            total=len(suggestions)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/block", response_model=BlockedUser)
async def block_user(
    block_request: BlockUserRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Block a user.
    
    - **user_id**: ID of the user to block
    - **reason**: Optional reason for blocking
    """
    try:
        return await friends_service.block_user(
            current_user["uid"],
            block_request
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/block/{blocked_id}")
async def unblock_user(
    blocked_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Unblock a previously blocked user."""
    try:
        await friends_service.unblock_user(current_user["uid"], blocked_id)
        return {"message": "User unblocked successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/privacy", response_model=FriendPrivacySettings)
async def update_privacy_settings(
    settings: FriendPrivacySettings,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Update friend-related privacy settings.
    
    - **is_public**: Whether profile is public
    - **allow_friend_requests**: Allow receiving friend requests
    - **show_online_status**: Show online status to friends
    - **show_activity**: Show activity to friends
    - **friend_list_visibility**: Who can see friend list
    """
    try:
        return await friends_service.update_privacy_settings(
            current_user["uid"],
            settings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Unique ID Endpoints

@router.get("/unique-id/validate/{unique_id}")
async def validate_unique_id(
    unique_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Validate if a unique ID has the correct format and exists.
    
    - **unique_id**: The 16-digit unique ID to validate
    """
    try:
        # Validate format
        is_valid_format = await unique_id_service.validate_unique_id_format(unique_id)
        if not is_valid_format:
            return {
                "valid": False,
                "exists": False,
                "error": "Invalid unique ID format. Must be exactly 16 digits."
            }
        
        # Check if ID exists
        user_data = await unique_id_service.find_user_by_unique_id(unique_id)
        exists = user_data is not None
        
        return {
            "valid": True,
            "exists": exists,
            "error": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unique-id/lookup/{unique_id}", response_model=User)
async def lookup_user_by_unique_id(
    unique_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Look up a user by their unique ID.
    
    - **unique_id**: The 16-digit unique ID to look up
    """
    try:
        # Validate format
        is_valid_format = await unique_id_service.validate_unique_id_format(unique_id)
        if not is_valid_format:
            raise HTTPException(
                status_code=400, 
                detail="Invalid unique ID format. Must be exactly 16 digits."
            )
        
        # Find user
        user_data = await unique_id_service.find_user_by_unique_id(unique_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return User(**user_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unique-id/generate")
async def generate_unique_id_for_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generate a new unique ID for the current user.
    This will overwrite any existing unique ID.
    """
    try:
        unique_id = await unique_id_service.assign_unique_id_to_user(current_user["uid"])
        return {
            "unique_id": unique_id,
            "message": "Unique ID generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unique-id/my")
async def get_my_unique_id(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get the current user's unique ID.
    If the user doesn't have one, it will be generated automatically.
    """
    try:
        print(f"Getting unique ID for user: {current_user['uid']}")
        
        # Check if user already has a unique ID
        users_ref = unique_id_service.db.collection('users').document(current_user["uid"])
        user_doc = users_ref.get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            existing_unique_id = user_data.get('unique_id')
            print(f"User document exists, unique_id: {existing_unique_id}")
            
            if existing_unique_id:
                result = {
                    "unique_id": existing_unique_id,
                    "message": "Existing unique ID retrieved"
                }
                print(f"Returning existing unique ID: {result}")
                return result
        else:
            print(f"User document does not exist for UID: {current_user['uid']}")
        
        # Generate new unique ID if none exists
        print("Generating new unique ID...")
        unique_id = await unique_id_service.assign_unique_id_to_user(current_user["uid"])
        result = {
            "unique_id": unique_id,
            "message": "New unique ID generated"
        }
        print(f"Generated new unique ID: {result}")
        return result
    except Exception as e:
        print(f"Error in get_my_unique_id: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
