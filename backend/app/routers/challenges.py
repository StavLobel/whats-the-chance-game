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

from fastapi import APIRouter, HTTPException, Query, status

# TODO: Add Depends when authentication endpoints are implemented
from pydantic import ValidationError

from app.core.auth import CurrentUser

# TODO: Add UserUID when user-specific endpoints are implemented
from app.schemas.challenge import (  # TODO: Add ChallengeUpdate when update endpoints are implemented
    Challenge,
    ChallengeCreate,
    ChallengeList,
    ChallengeResolveRequest,
    ChallengeResolveResponse,
    ChallengeResponse,
    ChallengeStats,
)
from app.services.firebase_service import firebase_service

# Import WebSocket manager for real-time updates
from app.routers.websocket import manager as ws_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/fast-test")
async def fast_test_challenges():
    """
    Fast test endpoint that returns challenges without user lookups.
    """
    import time

    start_time = time.time()

    try:
        logger.info("fast_test_challenges called")
        logger.info(f"fast_test_challenges - starting at {start_time}")

        challenges = await firebase_service.get_collection("challenges")
        logger.info(
            f"fast_test_challenges - got challenges from firebase at {time.time() - start_time:.2f}s"
        )

        result = []
        for i, challenge in enumerate(challenges):
            try:
                logger.info(
                    f"fast_test_challenges - processing challenge {i+1}/{len(challenges)} at {time.time() - start_time:.2f}s"
                )

                # Use shortened UIDs directly without user lookups
                from_user_display = challenge["from_user"][:8] + "..."
                to_user_display = challenge["to_user"][:8] + "..."

                result.append(
                    {
                        "id": challenge["id"],
                        "description": challenge["description"],
                        "from_user": from_user_display,
                        "to_user": to_user_display,
                        "status": challenge["status"],
                        "created_at": challenge["created_at"],
                        "updated_at": challenge["updated_at"],
                        "result": challenge.get("result"),
                        "resolved_at": challenge.get("resolved_at"),
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to parse challenge {challenge.get('id')}: {e}")
                continue

        logger.info(
            f"fast_test_challenges - finished processing at {time.time() - start_time:.2f}s"
        )
        logger.info(f"fast_test_challenges returning {len(result)} challenges")
        return result

    except Exception as e:
        logger.error(f"Error getting fast test challenges: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve fast test challenges",
        )


@router.get("/simple-test")
async def simple_test():
    """
    Ultra simple test endpoint without Firebase to verify routing.
    """
    logger.info("🎯 Backend: simple_test endpoint called!")
    return {"message": "Backend is working!", "timestamp": "2025-01-29"}


@router.get("/test", response_model=List[Challenge])
async def test_challenges(
    user_id: Optional[str] = Query(None, description="Filter by user ID")
):
    """
    Test endpoint to get all challenges with optimized user lookups.
    """
    import asyncio
    import time

    start_time = time.time()

    try:
        logger.info(f"🔥 Backend: test_challenges called with user_id: {user_id}")
        logger.info(f"🔥 Backend: starting Firebase request at {start_time}")

        challenges = await firebase_service.get_collection("challenges")
        logger.info(
            f"✅ Backend: got {len(challenges)} challenges from firebase at {time.time() - start_time:.2f}s"
        )

        if challenges:
            logger.info(f"🔍 Backend: first challenge from Firebase: {challenges[0]}")

        # Get unique user IDs to minimize lookups
        unique_users = set()
        for challenge in challenges:
            unique_users.add(challenge["from_user"])
            unique_users.add(challenge["to_user"])

        logger.info(
            f"👥 Backend: found {len(unique_users)} unique users, limiting to 10 lookups for performance"
        )

        # Limit to first 10 users to prevent timeout
        limited_users = list(unique_users)[:10]
        user_cache = {}

        # Batch user lookups with timeout
        for uid in limited_users:
            try:
                user_info = await asyncio.wait_for(
                    firebase_service.get_user_by_uid(uid),
                    timeout=1.0,  # 1 second per user
                )
                if user_info:
                    if user_info.get("username"):
                        user_cache[uid] = user_info.get("username")
                    elif user_info.get("display_name"):
                        user_cache[uid] = user_info.get("display_name")
                    elif user_info.get("email"):
                        user_cache[uid] = user_info.get("email", "").split("@")[0]
                    else:
                        user_cache[uid] = uid[:8] + "..."
                else:
                    user_cache[uid] = uid[:8] + "..."
            except Exception as e:
                logger.warning(f"Failed to get user info for {uid}: {e}")
                user_cache[uid] = uid[:8] + "..."

        logger.info(f"👤 Backend: cached {len(user_cache)} user display names")

        result = []
        for i, challenge in enumerate(challenges):
            try:
                logger.info(
                    f"🔄 Backend: processing challenge {i+1}/{len(challenges)} at {time.time() - start_time:.2f}s"
                )

                # Use cached user info or fallback to shortened UID
                from_user_display = user_cache.get(
                    challenge["from_user"], challenge["from_user"][:8] + "..."
                )
                to_user_display = user_cache.get(
                    challenge["to_user"], challenge["to_user"][:8] + "..."
                )

                result.append(
                    Challenge(
                        id=challenge["id"],
                        description=challenge["description"],
                        from_user=from_user_display,
                        to_user=to_user_display,
                        status=challenge["status"],
                        created_at=challenge["created_at"],
                        updated_at=challenge["updated_at"],
                        result=challenge.get("result"),
                        resolved_at=challenge.get("resolved_at"),
                    )
                )
            except Exception as e:
                logger.warning(f"Failed to parse challenge {challenge.get('id')}: {e}")
                continue

        logger.info(
            f"✅ Backend: finished processing at {time.time() - start_time:.2f}s"
        )
        logger.info(f"📊 Backend: returning {len(result)} challenges")
        if result:
            logger.info(f"📦 Backend: first challenge being returned: {result[0]}")
        return result

    except Exception as e:
        logger.error(f"Error getting test challenges: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve test challenges",
        )


@router.get("/", response_model=List[Challenge])
async def get_challenges(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    type: Optional[str] = Query(
        None, description="Filter by type (incoming/outgoing/all)"
    ),
    status_filter: Optional[str] = Query(
        None, description="Filter by challenge status"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = CurrentUser,
):
    """
    Get challenges with optional filtering.

    Args:
        user_id: Optional user ID to filter challenges
        type: Type of challenges to return (incoming/outgoing/all)
        status_filter: Optional status filter
        page: Page number for pagination
        per_page: Items per page
        current_user: Current authenticated user

    Returns:
        List of challenges matching the criteria
    """
    try:
        # If user_id is provided, use the existing user-specific endpoint logic
        if user_id:
            return await get_user_challenges(
                user_id=user_id,
                status_filter=status_filter,
                page=page,
                per_page=per_page,
                current_user=current_user,
            )

        # Otherwise, get all challenges (for admin or general listing)
        # This is a simplified version - in production you might want more restrictions
        challenges = await firebase_service.get_collection("challenges")

        # Apply basic filtering
        if status_filter:
            challenges = [c for c in challenges if c.get("status") == status_filter]

        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        challenges = challenges[start_idx:end_idx]

        # Convert to Challenge schema
        result = []
        for challenge in challenges:
            try:
                result.append(
                    Challenge(
                        id=challenge["id"],
                        description=challenge["description"],
                        from_user=challenge["from_user"],
                        to_user=challenge["to_user"],
                        status=challenge["status"],
                        created_at=challenge["created_at"],
                        updated_at=challenge["updated_at"],
                        result=challenge.get("result"),
                        resolved_at=challenge.get("resolved_at"),
                    )
                )
            except Exception as e:
                logger.warning(f"Failed to parse challenge {challenge.get('id')}: {e}")
                continue

        return result

    except Exception as e:
        logger.error(f"Error getting challenges: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve challenges",
        )


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
        created_challenge = Challenge(
            id=challenge["id"],
            description=challenge["description"],
            from_user=challenge["from_user"],
            to_user=challenge["to_user"],
            status=challenge["status"],
            created_at=challenge["created_at"],
            updated_at=challenge["updated_at"],
        )
        
        # Broadcast to WebSocket connections
        await ws_manager.broadcast_to_users(
            [challenge_data.from_user, challenge_data.to_user],
            {
                "type": "challenge_created",
                "data": created_challenge.dict()
            }
        )
        
        return created_challenge

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
        updated_challenge = await firebase_service.get_document(
            "challenges", challenge_id
        )

        # Convert Firestore document to Challenge schema
        updated_challenge_model = Challenge(
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
        
        # Broadcast to WebSocket connections
        await ws_manager.broadcast_to_users(
            [updated_challenge["from_user"], updated_challenge["to_user"]],
            {
                "type": "challenge_updated",
                "data": updated_challenge_model.dict()
            }
        )
        
        return updated_challenge_model

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
        challenge = await firebase_service.get_document(
            "challenges", resolve_data.challenge_id
        )

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

        # Get the updated challenge for WebSocket broadcast
        updated_challenge = await firebase_service.get_document(
            "challenges", resolve_data.challenge_id
        )
        
        # Broadcast challenge completion to WebSocket connections
        await ws_manager.broadcast_to_users(
            [challenge["from_user"], challenge["to_user"]],
            {
                "type": "challenge_completed",
                "data": {
                    "challengeId": resolve_data.challenge_id,
                    "result": "match" if is_match else "no_match"
                }
            }
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
    status_filter: Optional[str] = Query(
        None, description="Filter by challenge status"
    ),
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

        # Get all challenges and filter in Python (simpler approach)
        all_challenges = await firebase_service.get_collection("challenges")

        # Filter challenges for this user (both as from_user and to_user)
        challenges = []
        for challenge in all_challenges:
            if (
                challenge.get("from_user") == user_id
                or challenge.get("to_user") == user_id
            ):
                if not status_filter or challenge.get("status") == status_filter:
                    challenges.append(challenge)

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
        challenges = await firebase_service.query_documents(
            "challenges", "from_user", "==", user_id
        )

        # Calculate statistics
        total_challenges = len(challenges)
        pending_challenges = len([c for c in challenges if c["status"] == "pending"])
        active_challenges = len([c for c in challenges if c["status"] == "active"])
        completed_challenges = len(
            [c for c in challenges if c["status"] == "completed"]
        )
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
