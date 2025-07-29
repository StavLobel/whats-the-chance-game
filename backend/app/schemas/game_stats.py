"""
Game Statistics Schemas
Pydantic models for game statistics and analytics

This module defines the data models for:
- Challenge results and outcomes
- Number selection statistics
- User performance analytics
- Game analytics and insights
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator


class NumberSelection(BaseModel):
    """Schema for individual number selections in challenges."""

    user_id: str = Field(..., description="User ID who selected the number")
    number: int = Field(..., ge=1, le=100, description="Selected number")
    selected_at: datetime = Field(..., description="When the number was selected")
    challenge_id: str = Field(..., description="Challenge ID this selection belongs to")


class ChallengeResult(BaseModel):
    """Schema for complete challenge results with statistics."""

    challenge_id: str = Field(..., description="Challenge ID")
    from_user: str = Field(..., description="Challenge creator user ID")
    to_user: str = Field(..., description="Challenge recipient user ID")
    description: str = Field(..., description="Challenge description")

    # Number range
    range_min: int = Field(..., ge=1, le=100, description="Minimum number in range")
    range_max: int = Field(..., ge=1, le=100, description="Maximum number in range")

    # Number selections
    from_user_number: int = Field(
        ..., ge=1, le=100, description="Number selected by creator"
    )
    to_user_number: int = Field(
        ..., ge=1, le=100, description="Number selected by recipient"
    )

    # Results
    result: str = Field(..., regex="^(match|no_match)$", description="Challenge result")
    winner: Optional[str] = Field(None, description="User ID of winner (if match)")

    # Timestamps
    created_at: datetime = Field(..., description="Challenge creation timestamp")
    completed_at: datetime = Field(..., description="Challenge completion timestamp")

    # Statistics
    response_time_from_user: Optional[float] = Field(
        None, description="Response time in seconds for creator"
    )
    response_time_to_user: Optional[float] = Field(
        None, description="Response time in seconds for recipient"
    )


class NumberStats(BaseModel):
    """Schema for number usage statistics."""

    number: int = Field(..., ge=1, le=100, description="The number")
    times_selected: int = Field(
        ..., ge=0, description="How many times this number was selected"
    )
    success_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Success rate when this number is selected"
    )
    last_selected: Optional[datetime] = Field(
        None, description="Last time this number was selected"
    )


class RangeStats(BaseModel):
    """Schema for number range usage statistics."""

    range_min: int = Field(..., ge=1, le=100, description="Range minimum")
    range_max: int = Field(..., ge=1, le=100, description="Range maximum")
    times_used: int = Field(..., ge=0, description="How many times this range was used")
    success_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Success rate with this range"
    )
    average_numbers_in_range: float = Field(
        ..., ge=0.0, description="Average numbers selected within this range"
    )


class UserGameStats(BaseModel):
    """Schema for individual user game statistics."""

    user_id: str = Field(..., description="User ID")

    # Challenge statistics
    total_challenges: int = Field(
        ..., ge=0, description="Total challenges participated in"
    )
    challenges_created: int = Field(..., ge=0, description="Challenges created by user")
    challenges_received: int = Field(
        ..., ge=0, description="Challenges received by user"
    )

    # Results
    matches_won: int = Field(..., ge=0, description="Number of matches won")
    matches_lost: int = Field(..., ge=0, description="Number of matches lost")
    win_rate: float = Field(..., ge=0.0, le=1.0, description="Win rate percentage")

    # Performance
    average_response_time: Optional[float] = Field(
        None, description="Average response time in seconds"
    )
    fastest_response_time: Optional[float] = Field(
        None, description="Fastest response time in seconds"
    )

    # Number preferences
    favorite_number: Optional[int] = Field(
        None, ge=1, le=100, description="Most frequently selected number"
    )
    favorite_range_min: Optional[int] = Field(
        None, ge=1, le=100, description="Most used range minimum"
    )
    favorite_range_max: Optional[int] = Field(
        None, ge=1, le=100, description="Most used range maximum"
    )

    # Timestamps
    last_active: datetime = Field(..., description="Last activity timestamp")
    created_at: datetime = Field(..., description="Stats creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class GlobalGameStats(BaseModel):
    """Schema for global game statistics and analytics."""

    # Overall statistics
    total_challenges: int = Field(
        ..., ge=0, description="Total challenges ever created"
    )
    total_matches: int = Field(..., ge=0, description="Total successful matches")
    total_participants: int = Field(..., ge=0, description="Total unique participants")

    # Most popular numbers
    most_used_numbers: List[NumberStats] = Field(
        ..., description="Top 10 most used numbers"
    )
    least_used_numbers: List[NumberStats] = Field(
        ..., description="Top 10 least used numbers"
    )

    # Most popular ranges
    most_used_ranges: List[RangeStats] = Field(
        ..., description="Top 10 most used ranges"
    )

    # Success rates
    overall_success_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Overall match success rate"
    )
    average_response_time: float = Field(
        ..., ge=0.0, description="Average response time across all users"
    )

    # Time-based statistics
    challenges_today: int = Field(..., ge=0, description="Challenges created today")
    challenges_this_week: int = Field(
        ..., ge=0, description="Challenges created this week"
    )
    challenges_this_month: int = Field(
        ..., ge=0, description="Challenges created this month"
    )

    # Timestamps
    last_updated: datetime = Field(..., description="Last statistics update timestamp")


class GameStatsCreate(BaseModel):
    """Schema for creating new game statistics."""

    challenge_result: ChallengeResult = Field(
        ..., description="Challenge result to add to statistics"
    )
    update_user_stats: bool = Field(
        True, description="Whether to update user statistics"
    )
    update_global_stats: bool = Field(
        True, description="Whether to update global statistics"
    )


class GameStatsUpdate(BaseModel):
    """Schema for updating game statistics."""

    user_id: Optional[str] = Field(None, description="User ID to update stats for")
    stats_type: str = Field(
        ..., regex="^(user|global|number|range)$", description="Type of stats to update"
    )
    data: Dict[str, Any] = Field(..., description="Statistics data to update")


class GameStatsQuery(BaseModel):
    """Schema for querying game statistics."""

    user_id: Optional[str] = Field(None, description="User ID to get stats for")
    stats_type: str = Field(
        ...,
        regex="^(user|global|number|range|challenge)$",
        description="Type of stats to query",
    )
    time_range: Optional[str] = Field(
        None,
        regex="^(today|week|month|year|all)$",
        description="Time range for statistics",
    )
    limit: Optional[int] = Field(
        10, ge=1, le=100, description="Number of results to return"
    )


class GameStatsResponse(BaseModel):
    """Schema for game statistics API response."""

    success: bool = Field(..., description="Whether the operation was successful")
    data: Optional[Dict[str, Any]] = Field(None, description="Statistics data")
    message: Optional[str] = Field(None, description="Response message")
    timestamp: datetime = Field(..., description="Response timestamp")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
