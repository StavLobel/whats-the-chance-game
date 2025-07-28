"""
Challenges Router
API endpoints for challenge management

This module provides RESTful API endpoints for:
- Challenge creation and management
- Challenge resolution and number matching
- Challenge statistics and history
"""

import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError

from app.core.auth import CurrentUser, UserUID
from app.schemas.challenge import (
    Challenge,
    ChallengeCreate,
    ChallengeList,
    ChallengeResolveRequest,
    ChallengeResolveResponse,
    ChallengeResponse,
    ChallengeStats,
    ChallengeUpdate,
)
from app.services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=Challenge, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    challenge_data: ChallengeCreate,
    current_user: dict = CurrentUser,
):
    """
    Create a new challenge.
    
    Args:
        challenge_data: Challenge creation data
        current_user: Current authenticated user
        
    Returns:
        Created challenge information
        
    Raises:
        HTTPException: If challenge creation fails
    """
    try:
        # Validate that the current user is the challenge creator
        if challenge_data.from_user != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create challenges for yourself",
            )
        
        # Prepare challenge data for Firestore
        challenge_doc = {
            "description": challenge_data.description,
            "from_user": challenge_data.from_user,
            "to_user": challenge_data.to_user,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Create challenge in Firestore
        challenge_id = await firebase_service.create_document(
            "challenges", challenge_doc
        )
        
        # Get the created challenge
        challenge = await firebase_service.get_document("challenges", challenge_id)
        
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created challenge",
            )
        
        # Convert Firestore document to Challenge schema
        return Challenge(
            id=challenge["id"],
            description=challenge["description"],
            from_user=challenge["from_user"],
            to_user=challenge["to_user"],
            status=challenge["status"],
            created_at=challenge["created_at"],
            updated_at=challenge["updated_at"],
        )
        
    except ValidationError as e:
        logger.error(f"Validation error creating challenge: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid challenge data: {e}",
        )
    except Exception as e:
        logger.error(f"Error creating challenge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create challenge",
        )


@router.get("/{challenge_id}", response_model=Challenge)
async def get_challenge(
    challenge_id: str,
    current_user: dict = CurrentUser,
):
    """
    Get a specific challenge by ID.
    
    Args:
        challenge_id: Challenge ID
        current_user: Current authenticated user
        
    Returns:
        Challenge information
        
    Raises:
        HTTPException: If challenge not found or access denied
    """
    try:
        # Get challenge from Firestore
        challenge = await firebase_service.get_document("challenges", challenge_id)
        
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found",
            )
        
        # Check if user has access to this challenge
        if (
            challenge["from_user"] != current_user["uid"]
            and challenge["to_user"] != current_user["uid"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this challenge",
            )
        
        # Convert Firestore document to Challenge schema
        return Challenge(
            id=challenge["id"],
            description=challenge["description"],
            from_user=challenge["from_user"],
            to_user=challenge["to_user"],
            status=challenge["status"],
            range=challenge.get("range"),
            numbers=challenge.get("numbers"),
            result=challenge.get("result"),
            created_at=challenge["created_at"],
            updated_at=challenge["updated_at"],
            completed_at=challenge.get("completed_at"),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting challenge {challenge_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve challenge",
        )


@router.post("/{challenge_id}/respond", response_model=Challenge)
async def respond_to_challenge(
    challenge_id: str,
    response_data: ChallengeResponse,
    current_user: dict = CurrentUser,
):
    """
    Respond to a challenge (accept/reject).
    
    Args:
        challenge_id: Challenge ID
        response_data: Challenge response data
        current_user: Current authenticated user
        
    Returns:
        Updated challenge information
        
    Raises:
        HTTPException: If response fails or access denied
    """
    try:
        # Get challenge from Firestore
        challenge = await firebase_service.get_document("challenges", challenge_id)
        
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found",
            )
        
        # Check if user is the challenge recipient
        if challenge["to_user"] != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the challenge recipient can respond",
            )
        
        # Check if challenge is still pending
        if challenge["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge is no longer pending",
            )
        
        # Prepare update data
        update_data = {
            "status": "accepted" if response_data.accepted else "rejected",
            "updated_at": datetime.utcnow(),
        }
        
        if response_data.accepted:
            update_data["range"] = {
                "min": response_data.range.min,
                "max": response_data.range.max,
            }
        
        # Update challenge in Firestore
        success = await firebase_service.update_document(
            "challenges", challenge_id, update_data
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update challenge",
            )
        
        # Get updated challenge
        updated_challenge = await firebase_service.get_document("challenges", challenge_id)
        
        # Convert Firestore document to Challenge schema
        return Challenge(
            id=updated_challenge["id"],
            description=updated_challenge["description"],
            from_user=updated_challenge["from_user"],
            to_user=updated_challenge["to_user"],
            status=updated_challenge["status"],
            range=updated_challenge.get("range"),
            numbers=updated_challenge.get("numbers"),
            result=updated_challenge.get("result"),
            created_at=updated_challenge["created_at"],
            updated_at=updated_challenge["updated_at"],
            completed_at=updated_challenge.get("completed_at"),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error responding to challenge {challenge_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to respond to challenge",
        )


@router.post("/resolve", response_model=ChallengeResolveResponse)
async def resolve_challenge(
    resolve_data: ChallengeResolveRequest,
    current_user: dict = CurrentUser,
):
    """
    Resolve a challenge by processing number matching.
    
    Args:
        resolve_data: Challenge resolution data
        current_user: Current authenticated user
        
    Returns:
        Challenge resolution result
        
    Raises:
        HTTPException: If resolution fails
    """
    try:
        # Get challenge from Firestore
        challenge = await firebase_service.get_document("challenges", resolve_data.challenge_id)
        
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found",
            )
        
        # Check if user is involved in the challenge
        if (
            challenge["from_user"] != current_user["uid"]
            and challenge["to_user"] != current_user["uid"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this challenge",
            )
        
        # Validate that both users have submitted numbers
        if len(resolve_data.numbers) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Numbers must be provided for both users",
            )
        
        # Check if both users are in the challenge
        challenge_users = {challenge["from_user"], challenge["to_user"]}
        if set(resolve_data.numbers.keys()) != challenge_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Numbers must be provided for both challenge participants",
            )
        
        # Determine if numbers match
        numbers_list = list(resolve_data.numbers.values())
        is_match = numbers_list[0] == numbers_list[1]
        
        # Prepare update data
        update_data = {
            "status": "completed",
            "numbers": resolve_data.numbers,
            "result": "match" if is_match else "no_match",
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Update challenge in Firestore
        success = await firebase_service.update_document(
            "challenges", resolve_data.challenge_id, update_data
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to resolve challenge",
            )
        
        # Return resolution result
        return ChallengeResolveResponse(
            challenge_id=resolve_data.challenge_id,
            result="match" if is_match else "no_match",
            numbers=resolve_data.numbers,
            resolved_at=datetime.utcnow(),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving challenge {resolve_data.challenge_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resolve challenge",
        )


@router.get("/user/{user_id}", response_model=ChallengeList)
async def get_user_challenges(
    user_id: str,
    status_filter: Optional[str] = Query(None, description="Filter by challenge status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = CurrentUser,
):
    """
    Get challenges for a specific user.
    
    Args:
        user_id: User ID to get challenges for
        status_filter: Optional status filter
        page: Page number for pagination
        per_page: Number of items per page
        current_user: Current authenticated user
        
    Returns:
        List of challenges for the user
        
    Raises:
        HTTPException: If access denied or retrieval fails
    """
    try:
        # Check if user is requesting their own challenges or has permission
        if user_id != current_user["uid"]:
            # In a real app, you might want to check if the user has permission
            # to view other users' challenges (e.g., admin role)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to other users' challenges",
            )
        
        # Build query filters
        filters = [
            {"field": "from_user", "operator": "==", "value": user_id},
        ]
        
        # Add status filter if provided
        if status_filter:
            filters.append({"field": "status", "operator": "==", "value": status_filter})
        
        # Query challenges from Firestore
        challenges = await firebase_service.query_documents_multiple("challenges", filters)
        
        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_challenges = challenges[start_idx:end_idx]
        
        # Convert Firestore documents to Challenge schemas
        challenge_list = []
        for challenge in paginated_challenges:
            challenge_list.append(
                Challenge(
                    id=challenge["id"],
                    description=challenge["description"],
                    from_user=challenge["from_user"],
                    to_user=challenge["to_user"],
                    status=challenge["status"],
                    range=challenge.get("range"),
                    numbers=challenge.get("numbers"),
                    result=challenge.get("result"),
                    created_at=challenge["created_at"],
                    updated_at=challenge["updated_at"],
                    completed_at=challenge.get("completed_at"),
                )
            )
        
        return ChallengeList(
            challenges=challenge_list,
            total=len(challenges),
            page=page,
            per_page=per_page,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting challenges for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user challenges",
        )


@router.get("/stats/{user_id}", response_model=ChallengeStats)
async def get_user_challenge_stats(
    user_id: str,
    current_user: dict = CurrentUser,
):
    """
    Get challenge statistics for a specific user.
    
    Args:
        user_id: User ID to get stats for
        current_user: Current authenticated user
        
    Returns:
        Challenge statistics for the user
        
    Raises:
        HTTPException: If access denied or retrieval fails
    """
    try:
        # Check if user is requesting their own stats or has permission
        if user_id != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to other users' statistics",
            )
        
        # Get all challenges for the user
        challenges = await firebase_service.query_documents("challenges", "from_user", "==", user_id)
        
        # Calculate statistics
        total_challenges = len(challenges)
        pending_challenges = len([c for c in challenges if c["status"] == "pending"])
        active_challenges = len([c for c in challenges if c["status"] == "active"])
        completed_challenges = len([c for c in challenges if c["status"] == "completed"])
        matches_won = len([c for c in challenges if c.get("result") == "match"])
        matches_lost = len([c for c in challenges if c.get("result") == "no_match"])
        
        return ChallengeStats(
            total_challenges=total_challenges,
            pending_challenges=pending_challenges,
            active_challenges=active_challenges,
            completed_challenges=completed_challenges,
            matches_won=matches_won,
            matches_lost=matches_lost,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting challenge stats for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve challenge statistics",
        ) 