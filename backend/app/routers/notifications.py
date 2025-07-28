"""
Notifications Router
API endpoints for notification management

This module provides RESTful API endpoints for:
- Push notification sending
- Notification preferences management
- Notification history and statistics
"""

import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError

from app.core.auth import CurrentUser, UserUID
from app.schemas.notification import (
    FCMToken,
    NotificationHistory,
    NotificationHistoryList,
    NotificationPreferences,
    NotificationSend,
    NotificationSendBatch,
    NotificationSendToTopic,
    NotificationStats,
    TopicSubscription,
)
from app.services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/send", response_model=dict)
async def send_notification(
    notification_data: NotificationSend,
    current_user: dict = CurrentUser,
):
    """
    Send a push notification to a specific user.
    
    Args:
        notification_data: Notification data
        current_user: Current authenticated user
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If notification sending fails
    """
    try:
        # Get user's FCM tokens
        tokens = await firebase_service.query_documents(
            "fcm_tokens", "user_id", "==", notification_data.user_id
        )
        
        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No FCM tokens found for user",
            )
        
        # Check notification preferences
        preferences = await firebase_service.get_document(
            "notification_preferences", notification_data.user_id
        )
        
        if preferences and not preferences.get("push_enabled", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Push notifications are disabled for this user",
            )
        
        # Send notification to all user tokens
        success_count = 0
        for token_doc in tokens:
            success = await firebase_service.send_notification(
                token=token_doc["token"],
                title=notification_data.title,
                body=notification_data.body,
                data=notification_data.data,
            )
            if success:
                success_count += 1
        
        # Store notification history
        history_doc = {
            "user_id": notification_data.user_id,
            "title": notification_data.title,
            "body": notification_data.body,
            "notification_type": notification_data.notification_type,
            "data": notification_data.data,
            "sent_at": datetime.utcnow(),
            "delivered": success_count > 0,
            "read": False,
        }
        
        await firebase_service.create_document("notification_history", history_doc)
        
        return {
            "success": True,
            "message": f"Notification sent to {success_count}/{len(tokens)} devices",
            "tokens_processed": len(tokens),
            "successful_deliveries": success_count,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification",
        )


@router.post("/send/batch", response_model=dict)
async def send_notification_batch(
    batch_data: NotificationSendBatch,
    current_user: dict = CurrentUser,
):
    """
    Send notifications to multiple users in batch.
    
    Args:
        batch_data: Batch notification data
        current_user: Current authenticated user
        
    Returns:
        Batch processing results
        
    Raises:
        HTTPException: If batch sending fails
    """
    try:
        results = []
        total_sent = 0
        total_failed = 0
        
        for notification in batch_data.notifications:
            try:
                # Get user's FCM tokens
                tokens = await firebase_service.query_documents(
                    "fcm_tokens", "user_id", "==", notification.user_id
                )
                
                if not tokens:
                    results.append({
                        "user_id": notification.user_id,
                        "success": False,
                        "error": "No FCM tokens found",
                    })
                    total_failed += 1
                    continue
                
                # Check notification preferences
                preferences = await firebase_service.get_document(
                    "notification_preferences", notification.user_id
                )
                
                if preferences and not preferences.get("push_enabled", True):
                    results.append({
                        "user_id": notification.user_id,
                        "success": False,
                        "error": "Push notifications disabled",
                    })
                    total_failed += 1
                    continue
                
                # Send notification to all user tokens
                success_count = 0
                for token_doc in tokens:
                    success = await firebase_service.send_notification(
                        token=token_doc["token"],
                        title=notification.title,
                        body=notification.body,
                        data=notification.data,
                    )
                    if success:
                        success_count += 1
                
                # Store notification history
                history_doc = {
                    "user_id": notification.user_id,
                    "title": notification.title,
                    "body": notification.body,
                    "notification_type": notification.notification_type,
                    "data": notification.data,
                    "sent_at": datetime.utcnow(),
                    "delivered": success_count > 0,
                    "read": False,
                }
                
                await firebase_service.create_document("notification_history", history_doc)
                
                results.append({
                    "user_id": notification.user_id,
                    "success": True,
                    "tokens_processed": len(tokens),
                    "successful_deliveries": success_count,
                })
                total_sent += 1
                
            except Exception as e:
                logger.error(f"Error sending notification to user {notification.user_id}: {e}")
                results.append({
                    "user_id": notification.user_id,
                    "success": False,
                    "error": str(e),
                })
                total_failed += 1
        
        return {
            "success": True,
            "total_notifications": len(batch_data.notifications),
            "successful_sends": total_sent,
            "failed_sends": total_failed,
            "results": results,
        }
        
    except Exception as e:
        logger.error(f"Error sending notification batch: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification batch",
        )


@router.post("/send/topic", response_model=dict)
async def send_notification_to_topic(
    notification_data: NotificationSendToTopic,
    current_user: dict = CurrentUser,
):
    """
    Send a push notification to a topic.
    
    Args:
        notification_data: Topic notification data
        current_user: Current authenticated user
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If notification sending fails
    """
    try:
        # Send notification to topic
        success = await firebase_service.send_notification_to_topic(
            topic=notification_data.topic,
            title=notification_data.title,
            body=notification_data.body,
            data=notification_data.data,
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send notification to topic",
            )
        
        return {
            "success": True,
            "message": f"Notification sent to topic: {notification_data.topic}",
            "topic": notification_data.topic,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending notification to topic: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification to topic",
        )


@router.post("/tokens", response_model=dict)
async def register_fcm_token(
    token_data: FCMToken,
    current_user: dict = CurrentUser,
):
    """
    Register a new FCM token for a user.
    
    Args:
        token_data: FCM token data
        current_user: Current authenticated user
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If token registration fails
    """
    try:
        # Validate that user is registering their own token
        if token_data.user_id != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only register tokens for yourself",
            )
        
        # Check if token already exists
        existing_tokens = await firebase_service.query_documents(
            "fcm_tokens", "token", "==", token_data.token
        )
        
        if existing_tokens:
            # Update existing token
            token_doc = existing_tokens[0]
            await firebase_service.update_document(
                "fcm_tokens",
                token_doc["id"],
                {
                    "last_used": datetime.utcnow(),
                }
            )
        else:
            # Create new token
            token_doc = {
                "user_id": token_data.user_id,
                "token": token_data.token,
                "device_type": token_data.device_type,
                "created_at": datetime.utcnow(),
                "last_used": datetime.utcnow(),
            }
            
            await firebase_service.create_document("fcm_tokens", token_doc)
        
        return {
            "success": True,
            "message": "FCM token registered successfully",
            "token": token_data.token,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering FCM token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register FCM token",
        )


@router.delete("/tokens/{token}")
async def unregister_fcm_token(
    token: str,
    current_user: dict = CurrentUser,
):
    """
    Unregister an FCM token.
    
    Args:
        token: FCM token to unregister
        current_user: Current authenticated user
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If token unregistration fails
    """
    try:
        # Find token document
        tokens = await firebase_service.query_documents(
            "fcm_tokens", "token", "==", token
        )
        
        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="FCM token not found",
            )
        
        token_doc = tokens[0]
        
        # Validate that user owns this token
        if token_doc["user_id"] != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only unregister your own tokens",
            )
        
        # Delete token
        success = await firebase_service.delete_document("fcm_tokens", token_doc["id"])
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to unregister FCM token",
            )
        
        return {
            "success": True,
            "message": "FCM token unregistered successfully",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unregistering FCM token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unregister FCM token",
        )


@router.post("/topics/{topic}/subscribe", response_model=dict)
async def subscribe_to_topic(
    topic: str,
    current_user: dict = CurrentUser,
):
    """
    Subscribe user to a notification topic.
    
    Args:
        topic: Topic name to subscribe to
        current_user: Current authenticated user
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If subscription fails
    """
    try:
        # Get user's FCM tokens
        tokens = await firebase_service.query_documents(
            "fcm_tokens", "user_id", "==", current_user["uid"]
        )
        
        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No FCM tokens found for user",
            )
        
        # Extract token strings
        token_strings = [token_doc["token"] for token_doc in tokens]
        
        # Subscribe to topic
        success = await firebase_service.subscribe_to_topic(token_strings, topic)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to subscribe to topic",
            )
        
        # Store subscription record
        subscription_doc = {
            "user_id": current_user["uid"],
            "topic": topic,
            "subscribed_at": datetime.utcnow(),
        }
        
        await firebase_service.create_document("topic_subscriptions", subscription_doc)
        
        return {
            "success": True,
            "message": f"Subscribed to topic: {topic}",
            "topic": topic,
            "tokens_subscribed": len(token_strings),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error subscribing to topic: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to topic",
        )


@router.post("/topics/{topic}/unsubscribe", response_model=dict)
async def unsubscribe_from_topic(
    topic: str,
    current_user: dict = CurrentUser,
):
    """
    Unsubscribe user from a notification topic.
    
    Args:
        topic: Topic name to unsubscribe from
        current_user: Current authenticated user
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If unsubscription fails
    """
    try:
        # Get user's FCM tokens
        tokens = await firebase_service.query_documents(
            "fcm_tokens", "user_id", "==", current_user["uid"]
        )
        
        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No FCM tokens found for user",
            )
        
        # Extract token strings
        token_strings = [token_doc["token"] for token_doc in tokens]
        
        # Unsubscribe from topic
        success = await firebase_service.unsubscribe_from_topic(token_strings, topic)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to unsubscribe from topic",
            )
        
        # Remove subscription record
        subscriptions = await firebase_service.query_documents_multiple(
            "topic_subscriptions",
            [
                {"field": "user_id", "operator": "==", "value": current_user["uid"]},
                {"field": "topic", "operator": "==", "value": topic},
            ]
        )
        
        for subscription in subscriptions:
            await firebase_service.delete_document("topic_subscriptions", subscription["id"])
        
        return {
            "success": True,
            "message": f"Unsubscribed from topic: {topic}",
            "topic": topic,
            "tokens_unsubscribed": len(token_strings),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unsubscribing from topic: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unsubscribe from topic",
        )


@router.get("/history/{user_id}", response_model=NotificationHistoryList)
async def get_notification_history(
    user_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = CurrentUser,
):
    """
    Get notification history for a user.
    
    Args:
        user_id: User ID to get history for
        page: Page number for pagination
        per_page: Number of items per page
        current_user: Current authenticated user
        
    Returns:
        List of notification history
        
    Raises:
        HTTPException: If access denied or retrieval fails
    """
    try:
        # Check if user is requesting their own history or has permission
        if user_id != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to other users' notification history",
            )
        
        # Get notification history from Firestore
        notifications = await firebase_service.query_documents(
            "notification_history", "user_id", "==", user_id
        )
        
        # Sort by sent_at descending (most recent first)
        notifications.sort(key=lambda x: x["sent_at"], reverse=True)
        
        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_notifications = notifications[start_idx:end_idx]
        
        # Convert to NotificationHistory schemas
        history_list = []
        for notification in paginated_notifications:
            history_list.append(
                NotificationHistory(
                    id=notification["id"],
                    user_id=notification["user_id"],
                    title=notification["title"],
                    body=notification["body"],
                    notification_type=notification["notification_type"],
                    data=notification.get("data"),
                    sent_at=notification["sent_at"],
                    delivered=notification.get("delivered", False),
                    read=notification.get("read", False),
                )
            )
        
        return NotificationHistoryList(
            notifications=history_list,
            total=len(notifications),
            page=page,
            per_page=per_page,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notification history for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification history",
        )


@router.get("/stats/{user_id}", response_model=NotificationStats)
async def get_notification_stats(
    user_id: str,
    current_user: dict = CurrentUser,
):
    """
    Get notification statistics for a user.
    
    Args:
        user_id: User ID to get stats for
        current_user: Current authenticated user
        
    Returns:
        Notification statistics
        
    Raises:
        HTTPException: If access denied or retrieval fails
    """
    try:
        # Check if user is requesting their own stats or has permission
        if user_id != current_user["uid"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to other users' notification statistics",
            )
        
        # Get all notifications for the user
        notifications = await firebase_service.query_documents(
            "notification_history", "user_id", "==", user_id
        )
        
        # Calculate statistics
        total_sent = len(notifications)
        total_delivered = len([n for n in notifications if n.get("delivered", False)])
        total_read = len([n for n in notifications if n.get("read", False)])
        
        delivery_rate = total_delivered / total_sent if total_sent > 0 else 0.0
        read_rate = total_read / total_sent if total_sent > 0 else 0.0
        
        # Calculate by type
        by_type = {}
        for notification in notifications:
            notification_type = notification.get("notification_type", "unknown")
            by_type[notification_type] = by_type.get(notification_type, 0) + 1
        
        return NotificationStats(
            total_sent=total_sent,
            total_delivered=total_delivered,
            total_read=total_read,
            delivery_rate=delivery_rate,
            read_rate=read_rate,
            by_type=by_type,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notification stats for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification statistics",
        ) 