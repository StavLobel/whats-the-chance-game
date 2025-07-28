"""
Challenge Schemas
Pydantic models for challenge-related API requests and responses

This module defines the data models for:
- Challenge creation and updates
- Challenge responses and game state
- API request/response validation
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator


class ChallengeBase(BaseModel):
    """Base challenge model with common fields."""
    
    description: str = Field(..., min_length=1, max_length=500, description="Challenge description")
    from_user: str = Field(..., description="User ID of the challenge creator")
    to_user: str = Field(..., description="User ID of the challenge recipient")


class ChallengeCreate(ChallengeBase):
    """Schema for creating a new challenge."""
    
    @validator('from_user', 'to_user')
    def validate_user_ids(cls, v):
        """Validate that user IDs are not empty."""
        if not v or not v.strip():
            raise ValueError("User ID cannot be empty")
        return v.strip()
    
    @validator('to_user')
    def validate_different_users(cls, v, values):
        """Validate that from_user and to_user are different."""
        if 'from_user' in values and v == values['from_user']:
            raise ValueError("Cannot create challenge for yourself")
        return v


class ChallengeRange(BaseModel):
    """Schema for challenge number range."""
    
    min: int = Field(..., ge=1, le=100, description="Minimum number in range")
    max: int = Field(..., ge=1, le=100, description="Maximum number in range")
    
    @validator('max')
    def validate_max_greater_than_min(cls, v, values):
        """Validate that max is greater than min."""
        if 'min' in values and v <= values['min']:
            raise ValueError("Maximum number must be greater than minimum number")
        return v


class ChallengeNumbers(BaseModel):
    """Schema for challenge number submissions."""
    
    from_user: int = Field(..., ge=1, description="Number chosen by challenge creator")
    to_user: int = Field(..., ge=1, description="Number chosen by challenge recipient")


class ChallengeResponse(BaseModel):
    """Schema for responding to a challenge."""
    
    range: ChallengeRange = Field(..., description="Number range for the challenge")
    accepted: bool = Field(..., description="Whether the challenge is accepted")


class ChallengeUpdate(BaseModel):
    """Schema for updating challenge status."""
    
    status: str = Field(..., regex="^(pending|accepted|rejected|active|completed)$")
    range: Optional[ChallengeRange] = Field(None, description="Number range (if accepted)")
    numbers: Optional[ChallengeNumbers] = Field(None, description="Submitted numbers")
    result: Optional[str] = Field(None, regex="^(match|no_match)$", description="Challenge result")


class Challenge(BaseModel):
    """Complete challenge model for API responses."""
    
    id: str = Field(..., description="Challenge ID")
    description: str = Field(..., description="Challenge description")
    from_user: str = Field(..., description="User ID of the challenge creator")
    to_user: str = Field(..., description="User ID of the challenge recipient")
    status: str = Field(..., description="Challenge status")
    range: Optional[ChallengeRange] = Field(None, description="Number range")
    numbers: Optional[ChallengeNumbers] = Field(None, description="Submitted numbers")
    result: Optional[str] = Field(None, description="Challenge result")
    created_at: datetime = Field(..., description="Challenge creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ChallengeList(BaseModel):
    """Schema for list of challenges."""
    
    challenges: List[Challenge] = Field(..., description="List of challenges")
    total: int = Field(..., description="Total number of challenges")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of challenges per page")


class ChallengeStats(BaseModel):
    """Schema for challenge statistics."""
    
    total_challenges: int = Field(..., description="Total number of challenges")
    pending_challenges: int = Field(..., description="Number of pending challenges")
    active_challenges: int = Field(..., description="Number of active challenges")
    completed_challenges: int = Field(..., description="Number of completed challenges")
    matches_won: int = Field(..., description="Number of matches won")
    matches_lost: int = Field(..., description="Number of matches lost")


class ChallengeResolveRequest(BaseModel):
    """Schema for resolving a challenge (backend processing)."""
    
    challenge_id: str = Field(..., description="Challenge ID to resolve")
    numbers: Dict[str, int] = Field(..., description="Numbers submitted by each user")
    
    @validator('numbers')
    def validate_numbers(cls, v):
        """Validate that numbers are provided for both users."""
        if len(v) != 2:
            raise ValueError("Numbers must be provided for exactly 2 users")
        for user_id, number in v.items():
            if not user_id or not isinstance(number, int) or number < 1:
                raise ValueError("Invalid user ID or number")
        return v


class ChallengeResolveResponse(BaseModel):
    """Schema for challenge resolution response."""
    
    challenge_id: str = Field(..., description="Challenge ID")
    result: str = Field(..., description="Challenge result (match/no_match)")
    numbers: Dict[str, int] = Field(..., description="Numbers submitted by each user")
    resolved_at: datetime = Field(..., description="Resolution timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 