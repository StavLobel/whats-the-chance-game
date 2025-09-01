"""
Friends Schemas
Pydantic models for friends-related API requests and responses

This module defines the data models for:
- Friend requests (send, accept, reject)
- Friendships management
- Friend activity and suggestions
- Privacy and blocking features
"""

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator


class FriendRequestBase(BaseModel):
    """Base friend request model."""
    
    from_user_id: str = Field(..., description="User ID sending the request")
    to_user_id: str = Field(..., description="User ID receiving the request")
    message: Optional[str] = Field(None, max_length=500, description="Optional message with request")


class FriendRequestCreate(BaseModel):
    """Schema for creating a friend request."""
    
    to_user_id: str = Field(..., description="User ID to send request to")
    message: Optional[str] = Field(None, max_length=500, description="Optional message with request")
    
    @field_validator("message")
    @classmethod
    def validate_message(cls, v):
        """Validate message if provided."""
        if v is not None and not v.strip():
            raise ValueError("Message cannot be empty if provided")
        return v.strip() if v else None


class FriendRequestUpdate(BaseModel):
    """Schema for updating friend request status."""
    
    status: Literal["accepted", "rejected"] = Field(..., description="New status for the request")


class FriendRequest(FriendRequestBase):
    """Complete friend request model for API responses."""
    
    id: str = Field(..., description="Friend request ID")
    status: Literal["pending", "accepted", "rejected", "cancelled"] = Field(
        ..., description="Current status of the request"
    )
    created_at: datetime = Field(..., description="Request creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class FriendRequestWithUsers(FriendRequest):
    """Friend request with user details."""
    
    from_user: dict = Field(..., description="User sending the request")
    to_user: dict = Field(..., description="User receiving the request")


class FriendshipBase(BaseModel):
    """Base friendship model."""
    
    user1_id: str = Field(..., description="First user ID in friendship")
    user2_id: str = Field(..., description="Second user ID in friendship")
    category: Optional[str] = Field(
        None, 
        max_length=50, 
        description="Friend category (close, family, work, etc.)"
    )


class FriendshipCreate(BaseModel):
    """Schema for creating a friendship (internal use)."""
    
    user1_id: str = Field(..., description="First user ID")
    user2_id: str = Field(..., description="Second user ID")
    category: Optional[str] = Field(None, max_length=50, description="Friend category")
    from_request_id: Optional[str] = Field(None, description="Friend request ID that created this friendship")


class FriendshipUpdate(BaseModel):
    """Schema for updating friendship."""
    
    category: Optional[str] = Field(None, max_length=50, description="Friend category")


class Friendship(FriendshipBase):
    """Complete friendship model for API responses."""
    
    id: str = Field(..., description="Friendship ID")
    created_at: datetime = Field(..., description="Friendship creation timestamp")
    is_active: bool = Field(default=True, description="Whether friendship is active")
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class FriendshipWithUser(Friendship):
    """Friendship with friend user details."""
    
    friend: dict = Field(..., description="Friend user details")
    online_status: bool = Field(default=False, description="Friend's online status")
    last_active: Optional[datetime] = Field(None, description="Friend's last activity time")


class FriendSearch(BaseModel):
    """Schema for friend search parameters."""
    
    query: str = Field(..., min_length=1, description="Search query for username, name, or email")
    online_only: bool = Field(default=False, description="Filter by online users only")
    mutual_friends_only: bool = Field(default=False, description="Filter by mutual friends only")
    limit: int = Field(default=20, ge=1, le=100, description="Maximum number of results")
    offset: int = Field(default=0, ge=0, description="Number of results to skip")


class FriendSuggestion(BaseModel):
    """Schema for friend suggestions."""
    
    user_id: str = Field(..., description="Suggested user ID")
    user: dict = Field(..., description="User details")
    mutual_friends_count: int = Field(default=0, description="Number of mutual friends")
    suggestion_reason: str = Field(..., description="Reason for suggestion")
    score: float = Field(..., ge=0.0, le=1.0, description="Suggestion relevance score")


class FriendActivity(BaseModel):
    """Schema for friend activity."""
    
    friend_id: str = Field(..., description="Friend's user ID")
    friend: dict = Field(..., description="Friend details")
    activity_type: str = Field(..., description="Type of activity")
    activity_description: str = Field(..., description="Activity description")
    activity_data: Optional[dict] = Field(None, description="Additional activity data")
    timestamp: datetime = Field(..., description="Activity timestamp")
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class BlockedUser(BaseModel):
    """Schema for blocked user."""
    
    id: str = Field(..., description="Block record ID")
    blocker_id: str = Field(..., description="User who blocked")
    blocked_id: str = Field(..., description="User who was blocked")
    reason: Optional[str] = Field(None, max_length=500, description="Block reason")
    created_at: datetime = Field(..., description="Block timestamp")
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class BlockUserRequest(BaseModel):
    """Schema for blocking a user."""
    
    user_id: str = Field(..., description="User ID to block")
    reason: Optional[str] = Field(None, max_length=500, description="Optional block reason")


class FriendPrivacySettings(BaseModel):
    """Schema for friend privacy settings."""
    
    is_public: bool = Field(default=True, description="Whether profile is public")
    allow_friend_requests: bool = Field(default=True, description="Allow friend requests")
    show_online_status: bool = Field(default=True, description="Show online status to friends")
    show_activity: bool = Field(default=True, description="Show activity to friends")
    friend_list_visibility: Literal["public", "friends", "private"] = Field(
        default="friends", description="Who can see friend list"
    )


class FriendRequestList(BaseModel):
    """Schema for list of friend requests."""
    
    requests: List[FriendRequestWithUsers] = Field(..., description="List of friend requests")
    total: int = Field(..., description="Total number of requests")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of requests per page")


class FriendList(BaseModel):
    """Schema for list of friends."""
    
    friends: List[FriendshipWithUser] = Field(..., description="List of friendships")
    total: int = Field(..., description="Total number of friends")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of friends per page")
    online_count: int = Field(default=0, description="Number of online friends")


class FriendSuggestionList(BaseModel):
    """Schema for list of friend suggestions."""
    
    suggestions: List[FriendSuggestion] = Field(..., description="List of friend suggestions")
    total: int = Field(..., description="Total number of suggestions")


class FriendActivityList(BaseModel):
    """Schema for list of friend activities."""
    
    activities: List[FriendActivity] = Field(..., description="List of friend activities")
    total: int = Field(..., description="Total number of activities")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of activities per page")
