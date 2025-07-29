"""
Game Statistics Router
FastAPI router for game statistics and analytics endpoints

This module provides API endpoints for:
- Retrieving user and global game statistics
- Querying number and range statistics
- Getting challenge history and analytics
- Updating statistics data
"""

import logging
from datetime import datetime
from typing import List
# TODO: Add Optional when optional parameters are implemented

from fastapi import APIRouter, Depends, HTTPException, Query
# TODO: Add JSONResponse when custom response formatting is needed

from app.core.auth import get_current_user
from app.schemas.game_stats import (
    ChallengeResult,
    # TODO: Add when CRUD operations are implemented
    # GameStatsCreate,
    # GameStatsQuery,
    GameStatsResponse,
    # GameStatsUpdate,
    GlobalGameStats,
    NumberStats,
    PlayerInteraction,
    PlayerPair,
    RangeStats,
    UserGameStats,
)
from app.services.firebase_service import FirebaseService
from app.services.game_stats_service import GameStatsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/game-stats", tags=["Game Statistics"])


def get_game_stats_service() -> GameStatsService:
    """Dependency to get game statistics service."""
    firebase_service = FirebaseService()
    return GameStatsService(firebase_service)


@router.get("/user/{user_id}", response_model=UserGameStats)
async def get_user_game_stats(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get game statistics for a specific user.

    Args:
        user_id: User ID to get statistics for
        current_user: Currently authenticated user
        game_stats_service: Game statistics service

    Returns:
        UserGameStats: User's game statistics

    Raises:
        HTTPException: If user not found or unauthorized
    """
    try:
        # Check if user is requesting their own stats or has permission
        if current_user["uid"] != user_id:
            # TODO: Add admin permission check here
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view other user's stats",
            )

        stats = await game_stats_service.get_user_stats(user_id)
        if not stats:
            raise HTTPException(
                status_code=404, detail="User statistics not found"
            )

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user stats for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/global", response_model=GlobalGameStats)
async def get_global_game_stats(
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get global game statistics.

    Args:
        game_stats_service: Game statistics service

    Returns:
        GlobalGameStats: Global game statistics

    Raises:
        HTTPException: If statistics not found or error occurs
    """
    try:
        stats = await game_stats_service.get_global_stats()
        if not stats:
            raise HTTPException(
                status_code=404, detail="Global statistics not found"
            )

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get global stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/numbers/{number}", response_model=NumberStats)
async def get_number_stats(
    number: int,
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get statistics for a specific number.

    Args:
        number: Number to get statistics for (1-100)
        game_stats_service: Game statistics service

    Returns:
        NumberStats: Number statistics

    Raises:
        HTTPException: If number invalid or statistics not found
    """
    try:
        if not 1 <= number <= 100:
            raise HTTPException(
                status_code=400, detail="Number must be between 1 and 100"
            )

        stats = await game_stats_service.get_number_stats(number)
        if not stats:
            raise HTTPException(
                status_code=404, detail="Number statistics not found"
            )

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get number stats for {number}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/ranges/{range_min}/{range_max}", response_model=RangeStats)
async def get_range_stats(
    range_min: int,
    range_max: int,
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get statistics for a specific number range.

    Args:
        range_min: Range minimum (1-100)
        range_max: Range maximum (1-100)
        game_stats_service: Game statistics service

    Returns:
        RangeStats: Range statistics

    Raises:
        HTTPException: If range invalid or statistics not found
    """
    try:
        if not (1 <= range_min <= 100 and 1 <= range_max <= 100):
            raise HTTPException(
                status_code=400, detail="Range must be between 1 and 100"
            )

        if range_min >= range_max:
            raise HTTPException(
                status_code=400,
                detail="Range minimum must be less than maximum",
            )

        stats = await game_stats_service.get_range_stats(range_min, range_max)
        if not stats:
            raise HTTPException(
                status_code=404, detail="Range statistics not found"
            )

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to get range stats for {range_min}-{range_max}: {e}"
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/numbers/top", response_model=List[NumberStats])
async def get_top_numbers(
    limit: int = Query(
        10, ge=1, le=100, description="Number of results to return"
    ),
    by_usage: bool = Query(
        True, description="Sort by usage (True) or success rate (False)"
    ),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get top numbers by usage or success rate.

    Args:
        limit: Number of results to return (1-100)
        by_usage: Sort by usage (True) or success rate (False)
        game_stats_service: Game statistics service

    Returns:
        List[NumberStats]: Top numbers statistics

    Raises:
        HTTPException: If error occurs
    """
    try:
        numbers = await game_stats_service.get_top_numbers(limit, by_usage)
        return numbers

    except Exception as e:
        logger.error(f"Failed to get top numbers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/ranges/top", response_model=List[RangeStats])
async def get_top_ranges(
    limit: int = Query(
        10, ge=1, le=100, description="Number of results to return"
    ),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get top ranges by usage.

    Args:
        limit: Number of results to return (1-100)
        game_stats_service: Game statistics service

    Returns:
        List[RangeStats]: Top ranges statistics

    Raises:
        HTTPException: If error occurs
    """
    try:
        ranges = await game_stats_service.get_top_ranges(limit)
        return ranges

    except Exception as e:
        logger.error(f"Failed to get top ranges: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/user/{user_id}/history", response_model=List[ChallengeResult])
async def get_user_challenge_history(
    user_id: str,
    limit: int = Query(
        50, ge=1, le=200, description="Number of results to return"
    ),
    current_user: dict = Depends(get_current_user),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get challenge history for a specific user.

    Args:
        user_id: User ID to get history for
        limit: Number of results to return (1-200)
        current_user: Currently authenticated user
        game_stats_service: Game statistics service

    Returns:
        List[ChallengeResult]: User's challenge history

    Raises:
        HTTPException: If user not found or unauthorized
    """
    try:
        # Check if user is requesting their own history or has permission
        if current_user["uid"] != user_id:
            # TODO: Add admin permission check here
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view other user's history",
            )

        history = await game_stats_service.get_challenge_history(
            user_id, limit
        )
        return history

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get challenge history for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/challenge-result", response_model=GameStatsResponse)
async def create_challenge_result(
    challenge_result: ChallengeResult,
    current_user: dict = Depends(get_current_user),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Create a new challenge result and update statistics.

    Args:
        challenge_result: Challenge result data
        current_user: Currently authenticated user
        game_stats_service: Game statistics service

    Returns:
        GameStatsResponse: Response indicating success/failure

    Raises:
        HTTPException: If unauthorized or error occurs
    """
    try:
        # Check if user is involved in the challenge
        if current_user["uid"] not in [
            challenge_result.from_user,
            challenge_result.to_user,
        ]:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to create this challenge result",
            )

        success = await game_stats_service.create_challenge_result(
            challenge_result
        )

        if success:
            return GameStatsResponse(
                success=True,
                message="Challenge result created successfully",
                timestamp=challenge_result.completed_at,
            )
        else:
            raise HTTPException(
                status_code=500, detail="Failed to create challenge result"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create challenge result: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/analytics/summary")
async def get_analytics_summary(
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get a summary of key analytics data.

    Args:
        game_stats_service: Game statistics service

    Returns:
        dict: Summary of key analytics

    Raises:
        HTTPException: If error occurs
    """
    try:
        # Get global stats
        global_stats = await game_stats_service.get_global_stats()

        # Get top numbers and ranges
        top_numbers = await game_stats_service.get_top_numbers(
            5, by_usage=True
        )
        top_ranges = await game_stats_service.get_top_ranges(5)

        # Get social statistics
        most_challenged_players = (
            await game_stats_service.get_most_challenged_players(5)
        )
        most_active_pairs = (
            await game_stats_service.get_most_active_player_pairs(5)
        )

        summary = {
            "global_stats": global_stats.dict() if global_stats else None,
            "top_numbers": [num.dict() for num in top_numbers],
            "top_ranges": [range_data.dict() for range_data in top_ranges],
            "social_stats": {
                "most_challenged_players": [
                    player.dict() for player in most_challenged_players
                ],
                "most_active_pairs": [
                    pair.dict() for pair in most_active_pairs
                ],
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        return summary

    except Exception as e:
        logger.error(f"Failed to get analytics summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/social/most-challenged", response_model=List[PlayerInteraction])
async def get_most_challenged_players(
    limit: int = Query(
        10, ge=1, le=100, description="Number of results to return"
    ),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get most challenged players (most interactions).

    Args:
        limit: Number of results to return (1-100)
        game_stats_service: Game statistics service

    Returns:
        List[PlayerInteraction]: Most challenged players

    Raises:
        HTTPException: If error occurs
    """
    try:
        players = await game_stats_service.get_most_challenged_players(limit)
        return players

    except Exception as e:
        logger.error(f"Failed to get most challenged players: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/social/most-active-pairs", response_model=List[PlayerPair])
async def get_most_active_player_pairs(
    limit: int = Query(
        10, ge=1, le=100, description="Number of results to return"
    ),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get most active player pairs (users who challenge each other most).

    Args:
        limit: Number of results to return (1-100)
        game_stats_service: Game statistics service

    Returns:
        List[PlayerPair]: Most active player pairs

    Raises:
        HTTPException: If error occurs
    """
    try:
        pairs = await game_stats_service.get_most_active_player_pairs(limit)
        return pairs

    except Exception as e:
        logger.error(f"Failed to get most active player pairs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/social/user/{user_id}/friends-activity", response_model=List[PlayerPair]
)
async def get_user_friends_activity(
    user_id: str,
    limit: int = Query(
        10, ge=1, le=100, description="Number of results to return"
    ),
    current_user: dict = Depends(get_current_user),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get activity between a user and their friends.

    Args:
        user_id: User ID to get friends activity for
        limit: Number of results to return (1-100)
        current_user: Currently authenticated user
        game_stats_service: Game statistics service

    Returns:
        List[PlayerPair]: User's friends activity

    Raises:
        HTTPException: If unauthorized or error occurs
    """
    try:
        # Check if user is requesting their own data or has permission
        if current_user["uid"] != user_id:
            # TODO: Add admin permission check here
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view other user's friends activity",
            )

        pairs = await game_stats_service.get_user_friends_activity(
            user_id, limit
        )
        return pairs

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user friends activity for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/social/user/{user_id}/challenge-recipients",
    response_model=List[PlayerInteraction],
)
async def get_user_challenge_recipients(
    user_id: str,
    limit: int = Query(
        10, ge=1, le=100, description="Number of results to return"
    ),
    current_user: dict = Depends(get_current_user),
    game_stats_service: GameStatsService = Depends(get_game_stats_service),
):
    """
    Get users that a specific user challenges most often.

    Args:
        user_id: User ID to get challenge recipients for
        limit: Number of results to return (1-100)
        current_user: Currently authenticated user
        game_stats_service: Game statistics service

    Returns:
        List[PlayerInteraction]: Users challenged most often

    Raises:
        HTTPException: If unauthorized or error occurs
    """
    try:
        # Check if user is requesting their own data or has permission
        if current_user["uid"] != user_id:
            # TODO: Add admin permission check here
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view other user's challenge recipients",
            )

        recipients = await game_stats_service.get_user_challenge_recipients(
            user_id, limit
        )
        return recipients

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to get user challenge recipients for {user_id}: {e}"
        )
        raise HTTPException(status_code=500, detail="Internal server error")
