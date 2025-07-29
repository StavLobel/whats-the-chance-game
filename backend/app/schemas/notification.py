"""
Notification Schemas
Pydantic models for notification-related API requests and responses

This module defines the data models for:
- Push notification requests and responses
- Notification preferences and settings
- API request/response validation
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator


class NotificationBase(BaseModel):
    """Base notification model with common fields."""

    title: str = Field(
        ..., min_length=1, max_length=100, description="Notification title"
    )
    body: str = Field(
        ..., min_length=1, max_length=500, description="Notification body"
    )
    data: Optional[Dict[str, str]] = Field(
        None, description="Additional notification data"
    )


class NotificationSend(NotificationBase):
    """Schema for sending a notification."""

    user_id: str = Field(..., description="Target user ID")
    notification_type: str = Field(..., description="Type of notification")

    @validator("notification_type")
    def validate_notification_type(cls, v):
        """Validate notification type."""
        valid_types = [
            "challenge_created",
            "challenge_accepted",
            "challenge_rejected",
            "challenge_completed",
            "match_result",
            "general",
        ]
        if v not in valid_types:
            raise ValueError(
                f"Invalid notification type. Must be one of: {valid_types}"
            )
        return v


class NotificationSendToTopic(NotificationBase):
    """Schema for sending a notification to a topic."""

    topic: str = Field(..., description="FCM topic name")
    notification_type: str = Field(..., description="Type of notification")

    @validator("notification_type")
    def validate_notification_type(cls, v):
        """Validate notification type."""
        valid_types = [
            "challenge_created",
            "challenge_accepted",
            "challenge_rejected",
            "challenge_completed",
            "match_result",
            "general",
        ]
        if v not in valid_types:
            raise ValueError(
                f"Invalid notification type. Must be one of: {valid_types}"
            )
        return v


class NotificationSendBatch(BaseModel):
    """Schema for sending notifications to multiple users."""

    notifications: List[NotificationSend] = Field(
        ..., description="List of notifications to send"
    )

    @validator("notifications")
    def validate_notifications(cls, v):
        """Validate that at least one notification is provided."""
        if not v:
            raise ValueError("At least one notification must be provided")
        return v


class NotificationTemplate(BaseModel):
    """Schema for notification templates."""

    template_id: str = Field(..., description="Template identifier")
    title_template: str = Field(..., description="Title template with placeholders")
    body_template: str = Field(..., description="Body template with placeholders")
    notification_type: str = Field(..., description="Type of notification")

    @validator("template_id")
    def validate_template_id(cls, v):
        """Validate template ID format."""
        if not v or not v.strip():
            raise ValueError("Template ID cannot be empty")
        return v.strip()


class NotificationPreferences(BaseModel):
    """Schema for user notification preferences."""

    user_id: str = Field(..., description="User ID")
    challenge_notifications: bool = Field(
        default=True, description="Enable challenge notifications"
    )
    match_notifications: bool = Field(
        default=True, description="Enable match result notifications"
    )
    general_notifications: bool = Field(
        default=True, description="Enable general notifications"
    )
    push_enabled: bool = Field(default=True, description="Enable push notifications")
    email_enabled: bool = Field(default=False, description="Enable email notifications")
    quiet_hours_start: Optional[str] = Field(
        None,
        pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        description="Quiet hours start time (HH:MM)",
    )
    quiet_hours_end: Optional[str] = Field(
        None,
        pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        description="Quiet hours end time (HH:MM)",
    )

    @validator("quiet_hours_end")
    def validate_quiet_hours(cls, v, values):
        """Validate quiet hours if both start and end are provided."""
        if "quiet_hours_start" in values and values["quiet_hours_start"] and v:
            # Simple validation - could be enhanced with time comparison
            if values["quiet_hours_start"] == v:
                raise ValueError("Quiet hours start and end times cannot be the same")
        return v


class NotificationHistory(BaseModel):
    """Schema for notification history."""

    id: str = Field(..., description="Notification ID")
    user_id: str = Field(..., description="Target user ID")
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body")
    notification_type: str = Field(..., description="Type of notification")
    data: Optional[Dict[str, str]] = Field(
        None, description="Additional notification data"
    )
    sent_at: datetime = Field(..., description="Notification sent timestamp")
    delivered: bool = Field(
        default=False, description="Whether notification was delivered"
    )
    read: bool = Field(default=False, description="Whether notification was read")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class NotificationHistoryList(BaseModel):
    """Schema for list of notification history."""

    notifications: List[NotificationHistory] = Field(
        ..., description="List of notifications"
    )
    total: int = Field(..., description="Total number of notifications")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of notifications per page")


class NotificationStats(BaseModel):
    """Schema for notification statistics."""

    total_sent: int = Field(..., description="Total notifications sent")
    total_delivered: int = Field(..., description="Total notifications delivered")
    total_read: int = Field(..., description="Total notifications read")
    delivery_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Delivery rate percentage"
    )
    read_rate: float = Field(..., ge=0.0, le=1.0, description="Read rate percentage")
    by_type: Dict[str, int] = Field(..., description="Notifications sent by type")


class FCMToken(BaseModel):
    """Schema for FCM device token."""

    user_id: str = Field(..., description="User ID")
    token: str = Field(..., description="FCM device token")
    device_type: str = Field(..., description="Device type (ios, android, web)")
    created_at: datetime = Field(..., description="Token creation timestamp")
    last_used: Optional[datetime] = Field(None, description="Last time token was used")

    @validator("device_type")
    def validate_device_type(cls, v):
        """Validate device type."""
        valid_types = ["ios", "android", "web"]
        if v not in valid_types:
            raise ValueError(f"Invalid device type. Must be one of: {valid_types}")
        return v

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class TopicSubscription(BaseModel):
    """Schema for topic subscription."""

    user_id: str = Field(..., description="User ID")
    topic: str = Field(..., description="Topic name")
    subscribed_at: datetime = Field(..., description="Subscription timestamp")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
