"""
Game Statistics Service
Service for managing game statistics and analytics

This module provides services for:
- Storing challenge results and number selections
- Calculating user and global statistics
- Generating analytics and insights
- Managing statistics collections in Firestore
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.game_stats import (
    ChallengeResult,
    GameStatsCreate,
    GameStatsQuery,
    GameStatsUpdate,
    GlobalGameStats,
    NumberStats,
    RangeStats,
    UserGameStats,
)
from app.services.firebase_service import FirebaseService

logger = logging.getLogger(__name__)


class GameStatsService:
    """Service for managing game statistics and analytics."""

    def __init__(self, firebase_service: FirebaseService):
        """Initialize the game statistics service."""
        self.firebase = firebase_service
        self.db = firebase_service.db

    async def create_challenge_result(self, challenge_result: ChallengeResult) -> bool:
        """
        Store a new challenge result in the database.

        Args:
            challenge_result: Complete challenge result data

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Store challenge result
            result_data = challenge_result.dict()
            await self.firebase.create_document(
                "challenge_results", result_data, challenge_result.challenge_id
            )

            # Store number selections
            await self._store_number_selections(challenge_result)

            # Update statistics
            await self._update_user_stats(challenge_result)
            await self._update_global_stats(challenge_result)

            logger.info(
                f"Challenge result stored successfully: {challenge_result.challenge_id}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to store challenge result: {e}")
            return False

    async def _store_number_selections(self, challenge_result: ChallengeResult) -> None:
        """Store individual number selections for analytics."""
        try:
            # Store from_user number selection
            from_user_selection = {
                "user_id": challenge_result.from_user,
                "number": challenge_result.from_user_number,
                "selected_at": challenge_result.completed_at,
                "challenge_id": challenge_result.challenge_id,
                "range_min": challenge_result.range_min,
                "range_max": challenge_result.range_max,
            }

            # Store to_user number selection
            to_user_selection = {
                "user_id": challenge_result.to_user,
                "number": challenge_result.to_user_number,
                "selected_at": challenge_result.completed_at,
                "challenge_id": challenge_result.challenge_id,
                "range_min": challenge_result.range_min,
                "range_max": challenge_result.range_max,
            }

            # Create unique IDs for selections
            from_selection_id = f"{challenge_result.challenge_id}_from"
            to_selection_id = f"{challenge_result.challenge_id}_to"

            await self.firebase.create_document(
                "number_selections", from_user_selection, from_selection_id
            )
            await self.firebase.create_document(
                "number_selections", to_user_selection, to_selection_id
            )

        except Exception as e:
            logger.error(f"Failed to store number selections: {e}")

    async def _update_user_stats(self, challenge_result: ChallengeResult) -> None:
        """Update statistics for both users involved in the challenge."""
        try:
            # Update from_user stats
            await self._update_single_user_stats(
                challenge_result.from_user, challenge_result, is_creator=True
            )

            # Update to_user stats
            await self._update_single_user_stats(
                challenge_result.to_user, challenge_result, is_creator=False
            )

        except Exception as e:
            logger.error(f"Failed to update user stats: {e}")

    async def _update_single_user_stats(
        self, user_id: str, challenge_result: ChallengeResult, is_creator: bool
    ) -> None:
        """Update statistics for a single user."""
        try:
            # Get existing user stats or create new ones
            user_stats_doc = await self.firebase.get_document(
                "user_game_stats", user_id
            )

            if user_stats_doc:
                stats = user_stats_doc
            else:
                # Create new user stats
                stats = {
                    "user_id": user_id,
                    "total_challenges": 0,
                    "challenges_created": 0,
                    "challenges_received": 0,
                    "matches_won": 0,
                    "matches_lost": 0,
                    "win_rate": 0.0,
                    "average_response_time": None,
                    "fastest_response_time": None,
                    "favorite_number": None,
                    "favorite_range_min": None,
                    "favorite_range_max": None,
                    "last_active": datetime.utcnow(),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }

            # Update basic stats
            stats["total_challenges"] += 1
            if is_creator:
                stats["challenges_created"] += 1
            else:
                stats["challenges_received"] += 1

            # Update match results
            if challenge_result.result == "match":
                if challenge_result.winner == user_id:
                    stats["matches_won"] += 1
                else:
                    stats["matches_lost"] += 1

            # Calculate win rate
            total_matches = stats["matches_won"] + stats["matches_lost"]
            if total_matches > 0:
                stats["win_rate"] = stats["matches_won"] / total_matches

            # Update response times
            response_time = None
            if is_creator and challenge_result.response_time_from_user:
                response_time = challenge_result.response_time_from_user
            elif not is_creator and challenge_result.response_time_to_user:
                response_time = challenge_result.response_time_to_user

            if response_time:
                if stats["average_response_time"] is None:
                    stats["average_response_time"] = response_time
                else:
                    # Update running average
                    total_challenges = stats["total_challenges"]
                    current_avg = stats["average_response_time"]
                    stats["average_response_time"] = (
                        (current_avg * (total_challenges - 1)) + response_time
                    ) / total_challenges

                # Update fastest response time
                if (
                    stats["fastest_response_time"] is None
                    or response_time < stats["fastest_response_time"]
                ):
                    stats["fastest_response_time"] = response_time

            # Update last active
            stats["last_active"] = datetime.utcnow()
            stats["updated_at"] = datetime.utcnow()

            # Save updated stats
            await self.firebase.update_document("user_game_stats", user_id, stats)

        except Exception as e:
            logger.error(f"Failed to update stats for user {user_id}: {e}")

    async def _update_global_stats(self, challenge_result: ChallengeResult) -> None:
        """Update global game statistics."""
        try:
            # Get existing global stats or create new ones
            global_stats_doc = await self.firebase.get_document(
                "global_game_stats", "main"
            )

            if global_stats_doc:
                stats = global_stats_doc
            else:
                # Create new global stats
                stats = {
                    "total_challenges": 0,
                    "total_matches": 0,
                    "total_participants": 0,
                    "most_used_numbers": [],
                    "least_used_numbers": [],
                    "most_used_ranges": [],
                    "overall_success_rate": 0.0,
                    "average_response_time": 0.0,
                    "challenges_today": 0,
                    "challenges_this_week": 0,
                    "challenges_this_month": 0,
                    "last_updated": datetime.utcnow(),
                }

            # Update basic stats
            stats["total_challenges"] += 1
            if challenge_result.result == "match":
                stats["total_matches"] += 1

            # Calculate success rate
            if stats["total_challenges"] > 0:
                stats["overall_success_rate"] = (
                    stats["total_matches"] / stats["total_challenges"]
                )

            # Update time-based stats
            now = datetime.utcnow()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = today_start - timedelta(days=today_start.weekday())
            month_start = today_start.replace(day=1)

            if challenge_result.created_at >= today_start:
                stats["challenges_today"] += 1
            if challenge_result.created_at >= week_start:
                stats["challenges_this_week"] += 1
            if challenge_result.created_at >= month_start:
                stats["challenges_this_month"] += 1

            # Update last updated timestamp
            stats["last_updated"] = now

            # Save updated stats
            await self.firebase.update_document("global_game_stats", "main", stats)

            # Update number and range statistics (this would be done in a separate process)
            await self._update_number_stats(challenge_result)
            await self._update_range_stats(challenge_result)

        except Exception as e:
            logger.error(f"Failed to update global stats: {e}")

    async def _update_number_stats(self, challenge_result: ChallengeResult) -> None:
        """Update statistics for individual numbers."""
        try:
            numbers_to_update = [
                challenge_result.from_user_number,
                challenge_result.to_user_number,
            ]

            for number in numbers_to_update:
                # Get existing number stats or create new ones
                number_stats_doc = await self.firebase.get_document(
                    "number_stats", str(number)
                )

                if number_stats_doc:
                    stats = number_stats_doc
                else:
                    stats = {
                        "number": number,
                        "times_selected": 0,
                        "success_rate": 0.0,
                        "last_selected": None,
                    }

                # Update stats
                stats["times_selected"] += 1
                stats["last_selected"] = challenge_result.completed_at

                # Calculate success rate (this would need to query all challenges with this number)
                # For now, we'll update this in a separate aggregation process

                # Save updated stats
                await self.firebase.update_document("number_stats", str(number), stats)

        except Exception as e:
            logger.error(f"Failed to update number stats: {e}")

    async def _update_range_stats(self, challenge_result: ChallengeResult) -> None:
        """Update statistics for number ranges."""
        try:
            range_key = f"{challenge_result.range_min}_{challenge_result.range_max}"

            # Get existing range stats or create new ones
            range_stats_doc = await self.firebase.get_document("range_stats", range_key)

            if range_stats_doc:
                stats = range_stats_doc
            else:
                stats = {
                    "range_min": challenge_result.range_min,
                    "range_max": challenge_result.range_max,
                    "times_used": 0,
                    "success_rate": 0.0,
                    "average_numbers_in_range": 0.0,
                }

            # Update stats
            stats["times_used"] += 1

            # Calculate average numbers in range
            numbers_in_range = [
                challenge_result.from_user_number,
                challenge_result.to_user_number,
            ]
            range_size = challenge_result.range_max - challenge_result.range_min + 1
            avg_numbers = len(
                [
                    n
                    for n in numbers_in_range
                    if challenge_result.range_min <= n <= challenge_result.range_max
                ]
            ) / len(numbers_in_range)

            if stats["times_used"] == 1:
                stats["average_numbers_in_range"] = avg_numbers
            else:
                # Update running average
                current_avg = stats["average_numbers_in_range"]
                stats["average_numbers_in_range"] = (
                    (current_avg * (stats["times_used"] - 1)) + avg_numbers
                ) / stats["times_used"]

            # Save updated stats
            await self.firebase.update_document("range_stats", range_key, stats)

        except Exception as e:
            logger.error(f"Failed to update range stats: {e}")

    async def get_user_stats(self, user_id: str) -> Optional[UserGameStats]:
        """Get game statistics for a specific user."""
        try:
            stats_doc = await self.firebase.get_document("user_game_stats", user_id)
            if stats_doc:
                return UserGameStats(**stats_doc)
            return None
        except Exception as e:
            logger.error(f"Failed to get user stats for {user_id}: {e}")
            return None

    async def get_global_stats(self) -> Optional[GlobalGameStats]:
        """Get global game statistics."""
        try:
            stats_doc = await self.firebase.get_document("global_game_stats", "main")
            if stats_doc:
                return GlobalGameStats(**stats_doc)
            return None
        except Exception as e:
            logger.error(f"Failed to get global stats: {e}")
            return None

    async def get_number_stats(self, number: int) -> Optional[NumberStats]:
        """Get statistics for a specific number."""
        try:
            stats_doc = await self.firebase.get_document("number_stats", str(number))
            if stats_doc:
                return NumberStats(**stats_doc)
            return None
        except Exception as e:
            logger.error(f"Failed to get number stats for {number}: {e}")
            return None

    async def get_range_stats(
        self, range_min: int, range_max: int
    ) -> Optional[RangeStats]:
        """Get statistics for a specific number range."""
        try:
            range_key = f"{range_min}_{range_max}"
            stats_doc = await self.firebase.get_document("range_stats", range_key)
            if stats_doc:
                return RangeStats(**stats_doc)
            return None
        except Exception as e:
            logger.error(f"Failed to get range stats for {range_min}-{range_max}: {e}")
            return None

    async def get_top_numbers(
        self, limit: int = 10, by_usage: bool = True
    ) -> List[NumberStats]:
        """Get top numbers by usage or success rate."""
        try:
            # Query number_stats collection
            numbers = await self.firebase.query_documents(
                "number_stats", "times_selected", ">", 0
            )

            if not numbers:
                return []

            # Sort by usage or success rate
            if by_usage:
                numbers.sort(key=lambda x: x.get("times_selected", 0), reverse=True)
            else:
                numbers.sort(key=lambda x: x.get("success_rate", 0.0), reverse=True)

            # Return top N results
            return [NumberStats(**num) for num in numbers[:limit]]

        except Exception as e:
            logger.error(f"Failed to get top numbers: {e}")
            return []

    async def get_top_ranges(self, limit: int = 10) -> List[RangeStats]:
        """Get top ranges by usage."""
        try:
            # Query range_stats collection
            ranges = await self.firebase.query_documents(
                "range_stats", "times_used", ">", 0
            )

            if not ranges:
                return []

            # Sort by usage
            ranges.sort(key=lambda x: x.get("times_used", 0), reverse=True)

            # Return top N results
            return [RangeStats(**range_data) for range_data in ranges[:limit]]

        except Exception as e:
            logger.error(f"Failed to get top ranges: {e}")
            return []

    async def get_challenge_history(
        self, user_id: str, limit: int = 50
    ) -> List[ChallengeResult]:
        """Get challenge history for a user."""
        try:
            # Query challenges where user was involved
            challenges = await self.firebase.query_documents_multiple(
                "challenge_results",
                [
                    {"field": "from_user", "operator": "==", "value": user_id},
                    {"field": "to_user", "operator": "==", "value": user_id},
                ],
            )

            if not challenges:
                return []

            # Sort by completion time (newest first)
            challenges.sort(key=lambda x: x.get("completed_at"), reverse=True)

            # Return limited results
            return [ChallengeResult(**challenge) for challenge in challenges[:limit]]

        except Exception as e:
            logger.error(f"Failed to get challenge history for {user_id}: {e}")
            return []
