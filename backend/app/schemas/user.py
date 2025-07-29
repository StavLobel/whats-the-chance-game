"""
User Schemas
Pydantic models for user-related API requests and responses

This module defines the data models for:
- User authentication and profile data
- User statistics and game history
- API request/response validation
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """Base user model with common fields."""

    email: EmailStr = Field(..., description="User email address")
    display_name: Optional[str] = Field(
        None, max_length=100, description="User display name"
    )
    first_name: Optional[str] = Field(
        None, max_length=50, description="User first name"
    )
    last_name: Optional[str] = Field(
        None, max_length=50, description="User last name"
    )
    username: Optional[str] = Field(
        None, max_length=30, description="Unique username"
    )
    photo_url: Optional[str] = Field(
        None, description="User profile photo URL"
    )


class UserCreate(UserBase):
    """Schema for creating a new user."""

    uid: str = Field(..., description="Firebase user UID")

    @validator("display_name")
    def validate_display_name(cls, v):
        """Validate display name if provided."""
        if v is not None and not v.strip():
            raise ValueError("Display name cannot be empty if provided")
        return v.strip() if v else None

    @validator("first_name")
    def validate_first_name(cls, v):
        """Validate first name if provided."""
        if v is not None and not v.strip():
            raise ValueError("First name cannot be empty if provided")
        return v.strip() if v else None

    @validator("last_name")
    def validate_last_name(cls, v):
        """Validate last name if provided."""
        if v is not None and not v.strip():
            raise ValueError("Last name cannot be empty if provided")
        return v.strip() if v else None

    @validator("username")
    def validate_username(cls, v):
        """Validate username if provided."""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Username cannot be empty if provided")
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters long")
            if not v.replace("_", "").replace("-", "").isalnum():
                raise ValueError(
                    "Username can only contain letters, numbers, underscores, and hyphens"
                )
        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    display_name: Optional[str] = Field(
        None, max_length=100, description="User display name"
    )
    first_name: Optional[str] = Field(
        None, max_length=50, description="User first name"
    )
    last_name: Optional[str] = Field(
        None, max_length=50, description="User last name"
    )
    username: Optional[str] = Field(
        None, max_length=30, description="Unique username"
    )
    photo_url: Optional[str] = Field(
        None, description="User profile photo URL"
    )

    @validator("display_name")
    def validate_display_name(cls, v):
        """Validate display name if provided."""
        if v is not None and not v.strip():
            raise ValueError("Display name cannot be empty if provided")
        return v.strip() if v else None

    @validator("first_name")
    def validate_first_name(cls, v):
        """Validate first name if provided."""
        if v is not None and not v.strip():
            raise ValueError("First name cannot be empty if provided")
        return v.strip() if v else None

    @validator("last_name")
    def validate_last_name(cls, v):
        """Validate last name if provided."""
        if v is not None and not v.strip():
            raise ValueError("Last name cannot be empty if provided")
        return v.strip() if v else None

    @validator("username")
    def validate_username(cls, v):
        """Validate username if provided."""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Username cannot be empty if provided")
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters long")
            if not v.replace("_", "").replace("-", "").isalnum():
                raise ValueError(
                    "Username can only contain letters, numbers, underscores, and hyphens"
                )
        return v


class User(UserBase):
    """Complete user model for API responses."""

    uid: str = Field(..., description="Firebase user UID")
    email_verified: bool = Field(..., description="Whether email is verified")
    disabled: bool = Field(..., description="Whether user account is disabled")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserProfile(User):
    """Extended user model with game statistics."""

    total_challenges: int = Field(
        default=0, description="Total challenges created"
    )
    challenges_won: int = Field(default=0, description="Challenges won")
    challenges_lost: int = Field(default=0, description="Challenges lost")
    win_rate: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Win rate percentage"
    )
    last_active: Optional[datetime] = Field(
        None, description="Last activity timestamp"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserStats(BaseModel):
    """Schema for user game statistics."""

    uid: str = Field(..., description="User UID")
    total_challenges: int = Field(..., description="Total challenges created")
    challenges_won: int = Field(..., description="Challenges won")
    challenges_lost: int = Field(..., description="Challenges lost")
    win_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Win rate percentage"
    )
    total_matches: int = Field(..., description="Total matches played")
    matches_won: int = Field(..., description="Matches won")
    matches_lost: int = Field(..., description="Matches lost")
    average_response_time: Optional[float] = Field(
        None, description="Average response time in seconds"
    )
    last_active: Optional[datetime] = Field(
        None, description="Last activity timestamp"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserList(BaseModel):
    """Schema for list of users."""

    users: List[User] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of users per page")


class UserSearch(BaseModel):
    """Schema for user search parameters."""

    query: Optional[str] = Field(
        None,
        description="Search query for display name, username, first name, last name, or email",
    )
    limit: int = Field(
        default=10, ge=1, le=100, description="Maximum number of results"
    )
    offset: int = Field(
        default=0, ge=0, description="Number of results to skip"
    )


class UserSearchResult(BaseModel):
    """Schema for user search results."""

    users: List[User] = Field(..., description="List of matching users")
    total: int = Field(..., description="Total number of matching users")
    query: str = Field(..., description="Search query used")


class UserActivity(BaseModel):
    """Schema for user activity tracking."""

    uid: str = Field(..., description="User UID")
    activity_type: str = Field(..., description="Type of activity")
    timestamp: datetime = Field(..., description="Activity timestamp")
    metadata: Optional[dict] = Field(
        None, description="Additional activity metadata"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserActivityList(BaseModel):
    """Schema for list of user activities."""

    activities: List[UserActivity] = Field(
        ..., description="List of user activities"
    )
    total: int = Field(..., description="Total number of activities")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of activities per page")
